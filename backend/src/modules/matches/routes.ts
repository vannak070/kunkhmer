/**
 * Batches (sub-events) and matches  →  /api/matches/*
 *
 *   GET    /matches/batches[/:id]   public
 *   POST   /matches/batches         Super Admin, KKF Officer, Organizer (own events)
 *   PUT    /matches/batches/:id     Super Admin, KKF Officer, Organizer (own events)
 *   DELETE /matches/batches/:id     Super Admin
 *
 *   GET    /matches[/:id]           public; ?subEventId= or ?eventId= filter, in sort order
 *   GET    /matches/proposals       signed in; a club sees bouts with its fighters; ?state=
 *   POST   /matches                 Super Admin, KKF Officer, Organizer (own events)
 *   PUT    /matches/:id             same (Club/Gym answer through /respond)
 *                                   Only KKF staff set the referee and judges.
 *   POST   /matches/:id/respond     Club/Gym for its own side(s); KKF staff for either club
 *   DELETE /matches/:id             Super Admin
 *   POST   /matches/:id/result      Super Admin, KKF Officer
 *
 * Public reads (no staff token) show only bouts both clubs accepted, or that
 * have a result (see proposals.ts).
 */
import { randomUUID } from "node:crypto";
import type { FastifyInstance } from "fastify";
import { prisma } from "../../db.ts";
import type { Prisma } from "../../generated/prisma/client.ts";
import type { User } from "../../generated/prisma/client.ts";
import { Role, STAFF, hasRole, requireAuth, requireRole } from "../../lib/auth.ts";
import { now, toDate } from "../../lib/dates.ts";
import { HttpError, deleted, idParam, isUuid, notFound, ok } from "../../lib/http.ts";
import { type Input, inputOf, parseBool } from "../../lib/input.ts";
import { UNVERIFIED } from "../fighters/routes.ts";
import { UNAPPROVED } from "../events/routes.ts";
import { formatMatch, formatSubEvent, matchArray, matchRelations, subEventArray, subEventRelations } from "./format.ts";
import { recordMatchResult } from "./results.ts";
import { PUBLIC_BOUT, RESPONSES, openSide, proposalStatus, sidesFor } from "./proposals.ts";
import { notifyFollowers } from "../fans/notify.ts";
import { assertOfficials, officialsOf } from "../officials/routes.ts";

const ORGANIZERS = [...STAFF, Role.Organizer];

async function loadSubEvent(id: string) {
  const subEvent = await prisma.subEvent.findUnique({ where: { id }, include: subEventRelations });
  if (!subEvent) throw notFound("Sub-event (batch)");
  return formatSubEvent(subEvent);
}

async function loadMatch(id: string) {
  const match = await prisma.match.findUnique({ where: { id }, include: matchRelations });
  if (!match) throw notFound("Match");
  return formatMatch(match);
}

const int = (value: unknown) => (value === null ? null : Number(value));

/** Match columns settable on update; booleans and dates are converted. */
function matchUpdate(input: Input): Prisma.MatchUncheckedUpdateInput {
  const data: Prisma.MatchUncheckedUpdateInput = input.pick({
    eventId: "event_id",
    subEventId: "sub_event_id",
    fighterAId: "fighter_a_id",
    fighterBId: "fighter_b_id",
    agreedWeight: "agreed_weight",
    gloveSize: "glove_size",
    gloveBrand: "glove_brand",
    status: "status",
    refereeId: "referee_id",
    judgeIds: "judge_ids",
    winnerId: "winner_id",
    championshipId: "championship_id",
  });
  for (const [key, column] of [["rounds", "rounds"], ["roundTime", "round_time"], ["knockdownLimit", "knockdown_limit"], ["sortOrder", "sort_order"], ["sort_order", "sort_order"]] as const) {
    if (input.has(key)) data[column] = int(input.get(key))!;
  }
  for (const [key, column] of [["fighterAConfirmed", "fighter_a_confirmed"], ["fighterBConfirmed", "fighter_b_confirmed"], ["refereeConfirmed", "referee_confirmed"], ["isTitleMatch", "is_title_match"]] as const) {
    if (input.has(key)) data[column] = parseBool(input.get(key));
  }
  if (input.has("gloveConfirmedDate")) data.glove_confirmed_date = toDate(input.get("gloveConfirmedDate"));
  return data;
}

/** An Organizer may only work on fight cards and bouts of events they organize. */
async function requireOwnEvent(user: User, eventId: string | null | undefined) {
  if (user.role !== Role.Organizer || !eventId || !isUuid(eventId)) return;
  const event = await prisma.event.findUnique({ where: { id: eventId }, select: { organizer_id: true } });
  if (event && event.organizer_id !== user.id) {
    throw new HttpError(403, "Forbidden: This event belongs to another organizer");
  }
}

/** The event a fight card belongs to (null if the card doesn't exist). */
const eventOfBatch = async (subEventId: unknown) =>
  isUuid(subEventId) ? ((await prisma.subEvent.findUnique({ where: { id: subEventId }, select: { event_id: true } }))?.event_id ?? null) : null;

const judgeList = (value: unknown) => (Array.isArray(value) ? value.map(String) : []);

/**
 * Referee and judges: only KKF staff assign them (an Organizer sending a change
 * gets 403), and they must be active officials.
 */
async function checkOfficials(user: User, next: { refereeId: string | null; judgeIds: string[] }, current = { refereeId: null as string | null, judgeIds: [] as string[] }) {
  const changed = next.refereeId !== current.refereeId || JSON.stringify(next.judgeIds) !== JSON.stringify(current.judgeIds);
  if (!changed) return;
  if (!hasRole(user, STAFF)) throw new HttpError(403, "Forbidden: Only KKF assigns referees and judges");
  await assertOfficials(next.refereeId, next.judgeIds);
}

/** Only KKF-verified fighters can be matched. */
async function requireVerified(fighterIds: string[]) {
  const unverified = await prisma.fighter.findMany({
    where: { id: { in: fighterIds.filter(isUuid) }, status: { in: UNVERIFIED } },
    select: { name: true },
  });
  if (unverified.length) {
    throw new HttpError(422, `${unverified.map((f) => f.name).join(" and ")} must be verified by KKF before being matched`);
  }
}

export default async function matchRoutes(app: FastifyInstance) {
  // ─── Batches ─────────────────────────────────────────────
  app.get("/matches/batches", async (request, reply) => {
    // ?eventId= limits the list to one fight night (the admin fight-night page).
    const { eventId } = request.query as { eventId?: string };
    if (eventId && !isUuid(eventId)) return ok(reply, []);
    const subEvents = await prisma.subEvent.findMany({
      where: {
        ...(eventId ? { event_id: eventId } : {}),
        ...(request.user ? {} : { event: { status: { notIn: UNAPPROVED } } }),
      },
      include: subEventRelations,
      orderBy: [{ date: "desc" }, { created_at: { sort: "desc", nulls: "last" } }],
    });
    return ok(reply, subEvents.map(formatSubEvent));
  });

  app.get("/matches/batches/:id", async (request, reply) => {
    const id = idParam(request.params, "Sub-event (batch)");
    if (!request.user && (await prisma.subEvent.count({ where: { id, event: { status: { in: UNAPPROVED } } } }))) {
      throw notFound("Sub-event (batch)");
    }
    return ok(reply, await loadSubEvent(id));
  });

  // ─── Matches ─────────────────────────────────────────────
  app.get("/matches", async (request, reply) => {
    const { subEventId, eventId } = request.query as { subEventId?: string; eventId?: string };
    if ((subEventId && !isUuid(subEventId)) || (eventId && !isUuid(eventId))) return ok(reply, []);
    const matches = await prisma.match.findMany({
      where: {
        ...(subEventId ? { sub_event_id: subEventId } : {}),
        ...(eventId ? { event_id: eventId } : {}),
        ...(request.user ? {} : { event: { status: { notIn: UNAPPROVED } }, ...PUBLIC_BOUT }),
      },
      include: matchRelations,
      orderBy: [{ sort_order: "asc" }, { created_at: { sort: "asc", nulls: "first" } }],
    });
    return ok(reply, matches.map(formatMatch));
  });

  app.get("/matches/:id", async (request, reply) => {
    const id = idParam(request.params, "Match");
    if (!request.user && !(await prisma.match.count({ where: { id, event: { status: { notIn: UNAPPROVED } }, ...PUBLIC_BOUT } }))) {
      throw notFound("Match");
    }
    return ok(reply, await loadMatch(id));
  });

  app.register(async (protectedRoutes) => {
    protectedRoutes.addHook("preHandler", requireAuth);

    protectedRoutes.post("/matches/batches", async (request, reply) => {
      const user = requireRole(request, ORGANIZERS);
      const input = inputOf(request.body);
      await requireOwnEvent(user, input.get("eventId"));
      const at = now();
      const subEvent = await prisma.subEvent.create({
        data: {
          id: randomUUID(),
          event_id: input.required("eventId"),
          name: input.required("name"),
          week_number: Number(input.required("weekNumber")),
          date: toDate(input.required("date"))!,
          location: input.required("location"),
          phase: input.get("phase", "Qualifier"),
          status: input.get("status", "Draft"),
          batch_number: input.get("batchNumber", `BATCH-${Date.now()}`),
          created_by: user.id,
          created_at: at,
          updated_at: at,
        },
      });
      return ok(reply, await loadSubEvent(subEvent.id), 201);
    });

    protectedRoutes.put("/matches/batches/:id", async (request, reply) => {
      const user = requireRole(request, ORGANIZERS);
      const id = idParam(request.params, "Sub-event (batch)");
      const existing = await loadSubEvent(id);

      const input = inputOf(request.body);
      await requireOwnEvent(user, existing.event_id);
      if (input.has("eventId")) await requireOwnEvent(user, input.get("eventId"));
      const data: Prisma.SubEventUncheckedUpdateInput = input.pick({
        eventId: "event_id",
        name: "name",
        location: "location",
        phase: "phase",
        status: "status",
        batchNumber: "batch_number",
      });
      if (input.has("weekNumber")) data.week_number = Number(input.get("weekNumber"));
      if (input.has("date")) data.date = toDate(input.get("date"))!;
      if (Object.keys(data).length > 0) data.updated_at = now();

      await prisma.subEvent.update({ where: { id }, data });
      return ok(reply, await loadSubEvent(id));
    });

    protectedRoutes.delete("/matches/batches/:id", async (request, reply) => {
      requireRole(request, [Role.SuperAdmin]);
      const id = idParam(request.params, "Sub-event (batch)");
      const subEvent = await prisma.subEvent.findUnique({ where: { id } });
      if (!subEvent) throw notFound("Sub-event (batch)");
      await prisma.subEvent.delete({ where: { id } });
      return deleted(reply, "Sub-event deleted successfully", subEventArray(subEvent));
    });

    protectedRoutes.post("/matches", async (request, reply) => {
      const user = requireRole(request, ORGANIZERS);
      const input = inputOf(request.body);

      // Derive the event from the batch when it isn't given.
      const subEventId = input.required<string>("subEventId");
      let eventId = input.get<string>("eventId");
      if (!eventId && isUuid(subEventId)) {
        eventId = (await prisma.subEvent.findUnique({ where: { id: subEventId } }))?.event_id ?? null;
      }
      if (!eventId) throw new HttpError(422, "The eventId field is required");
      await requireOwnEvent(user, eventId);
      await checkOfficials(user, { refereeId: input.get("refereeId"), judgeIds: judgeList(input.get("judgeIds")) });

      const fighterAId = input.required<string>("fighterAId");
      const fighterBId = input.required<string>("fighterBId");
      await requireVerified([fighterAId, fighterBId]);

      // A new bout goes to both clubs; a side without a club is accepted already.
      const clubs = await prisma.fighter.findMany({ where: { id: { in: [fighterAId, fighterBId].filter(isUuid) } }, select: { id: true, club_id: true } });
      const clubOf = (id: string) => ({ club_id: clubs.find((f) => f.id === id)?.club_id ?? null });
      const at = now();
      const by = { userId: user.id, at };
      const sides = { ...openSide("a", clubOf(fighterAId), by), ...openSide("b", clubOf(fighterBId), by) } as Prisma.MatchUncheckedCreateInput;
      const match = await prisma.match.create({
        data: {
          id: randomUUID(),
          event_id: eventId,
          sub_event_id: subEventId,
          fighter_a_id: fighterAId,
          fighter_b_id: fighterBId,
          rounds: int(input.required("rounds"))!,
          round_time: int(input.required("roundTime"))!,
          knockdown_limit: int(input.required("knockdownLimit"))!,
          agreed_weight: input.required("agreedWeight"),
          glove_size: input.required("gloveSize"),
          glove_brand: input.required("gloveBrand"),
          status: input.get("status", "Draft"),
          proposal_status: proposalStatus(sides.club_a_response as string, sides.club_b_response as string),
          club_a_response: sides.club_a_response,
          club_b_response: sides.club_b_response,
          club_a_responded_at: sides.club_a_responded_at,
          club_b_responded_at: sides.club_b_responded_at,
          club_a_responded_by: sides.club_a_responded_by,
          club_b_responded_by: sides.club_b_responded_by,
          referee_id: input.get("refereeId"),
          judge_ids: input.get("judgeIds", []),
          is_title_match: input.has("isTitleMatch") ? parseBool(input.get("isTitleMatch")) : false,
          championship_id: input.get("championshipId"),
          sort_order: int(input.get("sortOrder", 0))!,
          created_at: at,
          updated_at: at,
        },
      });
      if (match.proposal_status === "accepted") await notifyFollowers(match.id, "bout_scheduled", request.log);
      return ok(reply, await loadMatch(match.id));
    });

    protectedRoutes.put("/matches/:id", async (request, reply) => {
      const user = requireRole(request, ORGANIZERS);
      const id = idParam(request.params, "Match");
      const match = await prisma.match.findUnique({ where: { id } });
      if (!match) throw notFound("Match");

      const input = inputOf(request.body);
      await requireOwnEvent(user, match.event_id);
      if (input.has("eventId")) await requireOwnEvent(user, input.get("eventId"));
      if (input.has("subEventId")) await requireOwnEvent(user, await eventOfBatch(input.get("subEventId")));
      if (input.present("refereeId") || input.present("judgeIds")) {
        const current = officialsOf(match);
        await checkOfficials(
          user,
          {
            refereeId: input.present("refereeId") ? input.get("refereeId") : current.referee,
            judgeIds: input.present("judgeIds") ? judgeList(input.get("judgeIds")) : current.judges,
          },
          { refereeId: current.referee, judgeIds: current.judges },
        );
      }

      const data = matchUpdate(input);
      // Swapping a fighter sends that side back to its (new) club.
      const swapped = (["a", "b"] as const).filter((s) => {
        const next = data[`fighter_${s}_id`];
        return typeof next === "string" && next !== match[`fighter_${s}_id`];
      });
      if (swapped.length) {
        await requireVerified(swapped.map((s) => data[`fighter_${s}_id`] as string));
        for (const s of swapped) {
          const fighter = await prisma.fighter.findUnique({ where: { id: data[`fighter_${s}_id`] as string }, select: { club_id: true } });
          if (!fighter) throw new HttpError(422, "The selected fighter does not exist");
          Object.assign(data, openSide(s, fighter, { userId: user.id, at: now() }));
        }
        const a = (data.club_a_response as string | undefined) ?? match.club_a_response;
        const b = (data.club_b_response as string | undefined) ?? match.club_b_response;
        data.proposal_status = proposalStatus(a, b);
      }
      if (Object.keys(data).length > 0) data.updated_at = now();
      await prisma.match.update({ where: { id }, data });
      if (match.proposal_status !== "accepted" && data.proposal_status === "accepted") {
        await notifyFollowers(id, "bout_scheduled", request.log);
      }
      return ok(reply, await loadMatch(id));
    });

    // Bouts waiting for (or answered by) clubs. A club sees only bouts with its
    // fighters; staff and organizers see all. ?state=pending|accepted|declined.
    protectedRoutes.get("/matches/proposals", async (request, reply) => {
      const user = requireRole(request, [...ORGANIZERS, Role.Club]);
      const { state } = request.query as { state?: string };
      const own = user.club_id ?? "00000000-0000-0000-0000-000000000000";
      const matches = await prisma.match.findMany({
        where: {
          ...(state ? { proposal_status: state } : {}),
          ...(user.role === Role.Club ? { OR: [{ fighterA: { club_id: own } }, { fighterB: { club_id: own } }] } : {}),
        },
        include: { ...matchRelations, event: { select: { name: true, status: true } } },
        orderBy: [{ subEvent: { date: "asc" } }, { sort_order: "asc" }],
      });
      return ok(
        reply,
        matches.map((m) => ({ ...formatMatch(m), event_name: m.event.name, event_status: m.event.status })),
      );
    });

    protectedRoutes.post("/matches/:id/respond", async (request, reply) => {
      const user = requireRole(request, [...STAFF, Role.Club]);
      const id = idParam(request.params, "Match");
      const match = await prisma.match.findUnique({ where: { id }, include: { fighterA: true, fighterB: true, result: true } });
      if (!match) throw notFound("Match");

      const input = inputOf(request.body);
      const sides = sidesFor(user, match, input.get<string>("side"));
      const response = input.required<string>("response");
      if (!(RESPONSES as readonly string[]).includes(response)) {
        throw new HttpError(422, 'The response must be "accepted" or "declined"');
      }
      const note = input.get<string>("note");
      if (response === "declined" && !note) throw new HttpError(422, "Give a reason when declining a bout");
      if (match.result) throw new HttpError(422, "This bout already has a result");

      const at = now();
      const data: Prisma.MatchUncheckedUpdateInput = { updated_at: at };
      for (const s of sides) {
        Object.assign(data, {
          [`club_${s}_response`]: response,
          [`club_${s}_note`]: response === "declined" ? note : null,
          [`club_${s}_responded_at`]: at,
          [`club_${s}_responded_by`]: user.id,
        });
      }
      data.proposal_status = proposalStatus(
        (data.club_a_response as string | undefined) ?? match.club_a_response,
        (data.club_b_response as string | undefined) ?? match.club_b_response,
      );
      await prisma.match.update({ where: { id }, data });
      if (match.proposal_status !== "accepted" && data.proposal_status === "accepted") {
        await notifyFollowers(id, "bout_scheduled", request.log);
      }
      return ok(reply, await loadMatch(id));
    });

    protectedRoutes.delete("/matches/:id", async (request, reply) => {
      requireRole(request, [Role.SuperAdmin]);
      const id = idParam(request.params, "Match");
      const match = await prisma.match.findUnique({ where: { id } });
      if (!match) throw notFound("Match");
      await prisma.match.delete({ where: { id } });
      return deleted(reply, "Match deleted successfully", matchArray(match));
    });

    protectedRoutes.post("/matches/:id/result", async (request, reply) => {
      requireRole(request, STAFF);
      const id = idParam(request.params, "Match");
      const input = inputOf(request.body);
      await recordMatchResult(id, {
        winnerId: input.get("winnerId"),
        method: input.required("method"),
        round: int(input.required("round"))!,
        duration: input.get("duration"),
      });
      await notifyFollowers(id, "bout_result", request.log);
      return ok(reply, await loadMatch(id));
    });

    /**
     * Weigh-in (KKF staff): `{ a?, b? }` in kg (20–200) for the red / blue corner; `null` clears a side.
     * Saved on the bout — the fighter's profile weight is not changed. fighter_x_confirmed = weighed in.
     */
    protectedRoutes.post("/matches/:id/weigh-in", async (request, reply) => {
      const user = requireRole(request, STAFF);
      const id = idParam(request.params, "Match");
      const match = await prisma.match.findUnique({ where: { id } });
      if (!match) throw notFound("Match");
      const input = inputOf(request.body);
      if (!input.present("a") && !input.present("b")) throw new HttpError(422, "Send the weight for a (red corner) or b (blue corner)");

      const kg = (side: "a" | "b") => {
        const raw = input.get(side);
        if (raw === null) return null;
        const n = Number(raw);
        if (!Number.isFinite(n) || n < 20 || n > 200) throw new HttpError(422, `The weight for ${side} must be between 20 and 200 kg`);
        return Math.round(n * 100) / 100;
      };
      const at = now();
      const data: Prisma.MatchUncheckedUpdateInput = { weigh_in_at: at, weigh_in_by: user.id, updated_at: at };
      for (const side of ["a", "b"] as const) {
        if (!input.present(side)) continue;
        const w = kg(side);
        data[`weigh_in_${side}_kg`] = w;
        data[`fighter_${side}_confirmed`] = w !== null;
      }
      await prisma.match.update({ where: { id }, data });
      return ok(reply, await loadMatch(id));
    });
  });
}
