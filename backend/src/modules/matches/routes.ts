/**
 * Batches (sub-events) and matches  →  /api/matches/*
 *
 *   GET    /matches/batches[/:id]   public
 *   POST   /matches/batches         Super Admin, KKF Officer, Organizer
 *   PUT    /matches/batches/:id     Super Admin, KKF Officer, Organizer
 *   DELETE /matches/batches/:id     Super Admin
 *
 *   GET    /matches[/:id]           public; ?subEventId= filter, in sort order
 *   POST   /matches                 Super Admin, KKF Officer, Organizer
 *   PUT    /matches/:id             same, plus Club/Gym for matches involving their club
 *   DELETE /matches/:id             Super Admin
 *   POST   /matches/:id/result      Super Admin, KKF Officer
 */
import { randomUUID } from "node:crypto";
import type { FastifyInstance } from "fastify";
import { prisma } from "../../db.ts";
import type { Prisma } from "../../generated/prisma/client.ts";
import { Role, STAFF, requireAuth, requireRole } from "../../lib/auth.ts";
import { now, toDate } from "../../lib/dates.ts";
import { HttpError, deleted, idParam, isUuid, notFound, ok } from "../../lib/http.ts";
import { type Input, inputOf, parseBool } from "../../lib/input.ts";
import { visibleFighter } from "../fighters/routes.ts";
import { formatMatch, formatSubEvent, matchArray, matchRelations, subEventArray, subEventRelations } from "./format.ts";
import { recordMatchResult } from "./results.ts";
import { notifyFollowers } from "../fans/notify.ts";

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
    proposalStatus: "proposal_status",
    clubAResponse: "club_a_response",
    clubBResponse: "club_b_response",
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

export default async function matchRoutes(app: FastifyInstance) {
  // ─── Batches ─────────────────────────────────────────────
  app.get("/matches/batches", async (_request, reply) => {
    const subEvents = await prisma.subEvent.findMany({
      include: subEventRelations,
      orderBy: [{ date: "desc" }, { created_at: { sort: "desc", nulls: "last" } }],
    });
    return ok(reply, subEvents.map(formatSubEvent));
  });

  app.get("/matches/batches/:id", async (request, reply) => ok(reply, await loadSubEvent(idParam(request.params, "Sub-event (batch)"))));

  // ─── Matches ─────────────────────────────────────────────
  app.get("/matches", async (request, reply) => {
    const { subEventId } = request.query as { subEventId?: string };
    if (subEventId && !isUuid(subEventId)) return ok(reply, []);
    const matches = await prisma.match.findMany({
      where: subEventId ? { sub_event_id: subEventId } : {},
      include: matchRelations,
      orderBy: [{ sort_order: "asc" }, { created_at: { sort: "asc", nulls: "first" } }],
    });
    return ok(reply, matches.map(formatMatch));
  });

  app.get("/matches/:id", async (request, reply) => ok(reply, await loadMatch(idParam(request.params, "Match"))));

  app.register(async (protectedRoutes) => {
    protectedRoutes.addHook("preHandler", requireAuth);

    protectedRoutes.post("/matches/batches", async (request, reply) => {
      const user = requireRole(request, ORGANIZERS);
      const input = inputOf(request.body);
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
      requireRole(request, ORGANIZERS);
      const id = idParam(request.params, "Sub-event (batch)");
      await loadSubEvent(id);

      const input = inputOf(request.body);
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
      requireRole(request, ORGANIZERS);
      const input = inputOf(request.body);

      // Derive the event from the batch when it isn't given.
      const subEventId = input.required<string>("subEventId");
      let eventId = input.get<string>("eventId");
      if (!eventId && isUuid(subEventId)) {
        eventId = (await prisma.subEvent.findUnique({ where: { id: subEventId } }))?.event_id ?? null;
      }
      if (!eventId) throw new HttpError(422, "The eventId field is required");

      const at = now();
      const match = await prisma.match.create({
        data: {
          id: randomUUID(),
          event_id: eventId,
          sub_event_id: subEventId,
          fighter_a_id: input.required("fighterAId"),
          fighter_b_id: input.required("fighterBId"),
          rounds: int(input.required("rounds"))!,
          round_time: int(input.required("roundTime"))!,
          knockdown_limit: int(input.required("knockdownLimit"))!,
          agreed_weight: input.required("agreedWeight"),
          glove_size: input.required("gloveSize"),
          glove_brand: input.required("gloveBrand"),
          status: input.get("status", "Draft"),
          proposal_status: input.get("proposalStatus", "draft"),
          club_a_response: input.get("clubAResponse", "pending"),
          club_b_response: input.get("clubBResponse", "pending"),
          referee_id: input.get("refereeId"),
          judge_ids: input.get("judgeIds", []),
          is_title_match: input.has("isTitleMatch") ? parseBool(input.get("isTitleMatch")) : false,
          championship_id: input.get("championshipId"),
          sort_order: int(input.get("sortOrder", 0))!,
          created_at: at,
          updated_at: at,
        },
      });
      await notifyFollowers(match.id, "bout_scheduled", request.log);
      return ok(reply, await loadMatch(match.id));
    });

    protectedRoutes.put("/matches/:id", async (request, reply) => {
      const user = requireRole(request, [...ORGANIZERS, Role.Club]);
      const id = idParam(request.params, "Match");
      const match = await prisma.match.findUnique({ where: { id }, include: { fighterA: true, fighterB: true } });
      if (!match) throw notFound("Match");

      if (user.role === Role.Club) {
        const represents = [visibleFighter(match.fighterA), visibleFighter(match.fighterB)].some(
          (f) => f && f.club_id === user.club_id,
        );
        if (!represents) throw new HttpError(403, "Forbidden: You do not represent either club in this match");
      }

      const data = matchUpdate(inputOf(request.body));
      if (Object.keys(data).length > 0) data.updated_at = now();
      await prisma.match.update({ where: { id }, data });
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
  });
}
