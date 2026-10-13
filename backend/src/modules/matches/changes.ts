/**
 * Withdrawals, replacements, postponement and cancellation (Program workflow phase 6,
 * claude/updates/withdrawals-postponement.md).
 *
 *   POST /matches/:id/withdraw   { side: "a"|"b", reason, note?, markFighter? }  the fighter drops out; the bout stays,
 *                                marked `replacement_side` ("Replacement needed"), without that side's weigh-in
 *   POST /matches/:id/replace    { side, fighterId }  a verified fighter takes the place; the KKF matching rules run
 *                                (Block → 422, Warn → `warnings`); clears `replacement_side`
 *   POST /matches/:id/cancel     { reason, note? }    one bout is cancelled (status "Cancelled"); leaves the public card
 *   POST /events/:id/postpone    { date, reason, note? }  new match date; cards move by the same number of days and every
 *                                bout is re-checked against the rules on its new date (a broken Block rule refuses it)
 *   POST /events/:id/cancel      { reason, note? }    the whole match is cancelled
 *   GET  /events/:id/changes     the history: who, when, why
 *
 * Who: KKF staff always; an Organizer who can see the event, only before match day. A bout with a result can't change.
 * The reason is a short key (WITHDRAW_REASONS for fighters, MATCH_REASONS for a postponement / cancellation) plus a note.
 * The fan site shows only the status ("Postponed to {date}", "Cancelled"), never the reason.
 */
import { randomUUID } from "node:crypto";
import type { FastifyInstance } from "fastify";
import { prisma } from "../../db.ts";
import type { Prisma, User } from "../../generated/prisma/client.ts";
import { Role, STAFF, hasRole, requireAuth, requireRole } from "../../lib/auth.ts";
import { micro, now, toDate } from "../../lib/dates.ts";
import { HttpError, idParam, isUuid, notFound, ok } from "../../lib/http.ts";
import { inputOf } from "../../lib/input.ts";
import { UNVERIFIED } from "../fighters/routes.ts";
import { canSeeEvent, eventArray } from "../events/routes.ts";
import { assertNotSignedOff } from "../events/signoff.ts";
import { formatMatch, matchRelations } from "./format.ts";
import { openSide, proposalStatus } from "./proposals.ts";
import { type RuleHit, checkPairing, enforceRules } from "./rules.ts";

export const WITHDRAW_REASONS = ["injured", "overweight", "not_cleared", "personal", "no_show", "other"] as const;
export const MATCH_REASONS = ["weather", "venue", "broadcaster", "safety", "other"] as const;
const DAY = 86_400_000;
const todayUtc = () => new Date(new Date().toISOString().slice(0, 10));
const day = (d: Date) => d.toISOString().slice(0, 10);

/** KKF staff, or an Organizer who sees the event and acts before match day. */
async function actorFor(request: Parameters<typeof requireRole>[0], eventId: string) {
  const user = requireRole(request, [...STAFF, Role.Organizer]);
  const event = await prisma.event.findUnique({ where: { id: eventId } });
  if (!event || (!hasRole(user, STAFF) && !canSeeEvent(user, event))) throw notFound("Event");
  await assertNotSignedOff(event.id);
  if (!hasRole(user, STAFF) && event.date.getTime() <= todayUtc().getTime()) {
    throw new HttpError(422, "From match day on, only KKF changes a match");
  }
  return { user, event };
}

function reasonOf(value: string | null, list: readonly string[]) {
  if (!value || !list.includes(value)) throw new HttpError(422, `The reason must be one of: ${list.join(", ")}`);
  return value;
}

const sideOf = (value: unknown) => {
  if (value !== "a" && value !== "b") throw new HttpError(422, 'The side must be "a" or "b"');
  return value;
};

async function loadBout(id: string) {
  const match = await prisma.match.findUnique({ where: { id }, include: { fighterA: true, fighterB: true, result: true } });
  if (!match) throw notFound("Match");
  return match;
}

const formatted = async (id: string) => formatMatch(await prisma.match.findUniqueOrThrow({ where: { id }, include: matchRelations }));

function openBout(match: { result: unknown; status: string }) {
  if (match.result || match.status === "Completed") throw new HttpError(422, "This bout already has a result");
  if (match.status === "Cancelled") throw new HttpError(422, "This bout is cancelled");
}

const log = (tx: Prisma.TransactionClient, row: Omit<Prisma.MatchChangeUncheckedCreateInput, "id" | "created_at">, user: User) =>
  tx.matchChange.create({ data: { id: randomUUID(), created_at: now(), created_by: user.id, ...row } });

export default async function matchChangeRoutes(app: FastifyInstance) {
  app.register(async (routes) => {
    routes.addHook("preHandler", requireAuth);

    routes.post("/matches/:id/withdraw", async (request, reply) => {
      const id = idParam(request.params, "Match");
      const match = await loadBout(id);
      const { user } = await actorFor(request, match.event_id);
      openBout(match);
      if (match.replacement_side) throw new HttpError(422, "This bout already needs a replacement — record it first");
      const input = inputOf(request.body);
      const side = sideOf(input.get("side"));
      const reason = reasonOf(input.get<string>("reason"), WITHDRAW_REASONS);
      const fighter = side === "a" ? match.fighterA : match.fighterB;
      // Optional: also mark the fighter so the matching rules stop pairing them (injury / medical reasons only).
      const mark = input.get("markFighter") === true && (reason === "injured" || reason === "not_cleared");
      const at = now();
      await prisma.$transaction(async (tx) => {
        await tx.match.update({
          where: { id },
          data: { replacement_side: side, [`weigh_in_${side}_kg`]: null, [`fighter_${side}_confirmed`]: false, updated_at: at } as Prisma.MatchUncheckedUpdateInput,
        });
        if (mark) await tx.fighter.update({ where: { id: fighter.id }, data: { medical_status: reason === "injured" ? "Injured" : "Not Cleared" } });
        await log(tx, { event_id: match.event_id, match_id: id, kind: "withdraw", side, fighter_id: fighter.id, fighter_name: fighter.name, reason, note: input.get("note"), marked_fighter: mark }, user);
      });
      return ok(reply, await formatted(id));
    });

    routes.post("/matches/:id/replace", async (request, reply) => {
      const id = idParam(request.params, "Match");
      const match = await loadBout(id);
      const { user } = await actorFor(request, match.event_id);
      openBout(match);
      const input = inputOf(request.body);
      const side = sideOf(input.get("side"));
      if (match.replacement_side !== side) throw new HttpError(422, "This corner does not need a replacement");
      const fighterId = input.required<string>("fighterId");
      const other = side === "a" ? match.fighterB : match.fighterA;
      const old = side === "a" ? match.fighterA : match.fighterB;
      if (fighterId === other.id) throw new HttpError(422, "A bout needs two different fighters");
      if (fighterId === old.id) throw new HttpError(422, "That fighter withdrew — choose someone else");
      const fighter = isUuid(fighterId) ? await prisma.fighter.findFirst({ where: { id: fighterId, deleted_at: null } }) : null;
      if (!fighter) throw new HttpError(422, "The selected fighter does not exist");
      if (UNVERIFIED.includes(fighter.status)) throw new HttpError(422, `${fighter.name} must be verified by KKF before being matched`);
      const warnings = await enforceRules({
        subEventId: match.sub_event_id,
        fighterAId: side === "a" ? fighter.id : match.fighter_a_id,
        fighterBId: side === "b" ? fighter.id : match.fighter_b_id,
        agreedWeight: Number(match.agreed_weight),
        matchId: id,
      });
      const at = now();
      const data: Prisma.MatchUncheckedUpdateInput = { [`fighter_${side}_id`]: fighter.id, replacement_side: null, updated_at: at, ...openSide(side, fighter, { userId: user.id, at }) };
      data.proposal_status = proposalStatus(
        (data.club_a_response as string | undefined) ?? match.club_a_response,
        (data.club_b_response as string | undefined) ?? match.club_b_response,
      );
      await prisma.$transaction(async (tx) => {
        await tx.match.update({ where: { id }, data });
        await log(tx, { event_id: match.event_id, match_id: id, kind: "replace", side, fighter_id: fighter.id, fighter_name: fighter.name, other_name: old.name }, user);
      });
      const updated = await formatted(id);
      return ok(reply, warnings.length ? { ...updated, warnings } : updated);
    });

    routes.post("/matches/:id/cancel", async (request, reply) => {
      const id = idParam(request.params, "Match");
      const match = await loadBout(id);
      const { user } = await actorFor(request, match.event_id);
      openBout(match);
      const input = inputOf(request.body);
      const reason = reasonOf(input.get<string>("reason"), WITHDRAW_REASONS);
      await prisma.$transaction(async (tx) => {
        await tx.match.update({ where: { id }, data: { status: "Cancelled", replacement_side: null, updated_at: now() } });
        await log(tx, { event_id: match.event_id, match_id: id, kind: "cancel_bout", reason, note: input.get("note"), fighter_name: `${match.fighterA.name} vs ${match.fighterB.name}` }, user);
      });
      return ok(reply, await formatted(id));
    });

    routes.post("/events/:id/postpone", async (request, reply) => {
      const id = idParam(request.params, "Event");
      const { user, event } = await actorFor(request, id);
      if (event.status === "Cancelled") throw new HttpError(422, "This match is cancelled");
      const input = inputOf(request.body);
      const reason = reasonOf(input.get<string>("reason"), MATCH_REASONS);
      const next = toDate(input.required("date"));
      if (!next) throw new HttpError(422, "The date field is invalid");
      if (next.getTime() === event.date.getTime()) throw new HttpError(422, "Choose a different date");
      if (next.getTime() < todayUtc().getTime()) throw new HttpError(422, "The new date can't be in the past");
      const delta = next.getTime() - event.date.getTime();

      // Every live bout is checked on its fight card's new date; a broken Block rule refuses the whole postponement.
      const [cards, bouts] = await Promise.all([
        prisma.subEvent.findMany({ where: { event_id: id } }),
        prisma.match.findMany({ where: { event_id: id, status: { not: "Cancelled" }, replacement_side: null }, include: { fighterA: true, fighterB: true } }),
      ]);
      const newDate = new Map(cards.map((c) => [c.id, new Date(c.date.getTime() + delta)]));
      const blocked: string[] = [];
      const warnings: (RuleHit & { bout: string })[] = [];
      for (const b of bouts) {
        const hits = await checkPairing({ subEventId: b.sub_event_id, fighterAId: b.fighter_a_id, fighterBId: b.fighter_b_id, agreedWeight: Number(b.agreed_weight), matchId: b.id, fightDate: newDate.get(b.sub_event_id) });
        const label = `${b.fighterA.name} vs ${b.fighterB.name}`;
        for (const h of hits) (h.action === "block" ? blocked.push(`${label}: ${h.message}`) : warnings.push({ ...h, bout: label }));
      }
      if (blocked.length) throw new HttpError(422, `Moving the match to ${day(next)} breaks KKF matching rules — ${blocked.join("; ")}`);

      const at = now();
      await prisma.$transaction(async (tx) => {
        await tx.event.update({
          where: { id },
          data: { date: next, end_date: event.end_date ? new Date(event.end_date.getTime() + delta) : null, original_date: event.original_date ?? event.date, updated_at: at },
        });
        for (const c of cards) await tx.subEvent.update({ where: { id: c.id }, data: { date: newDate.get(c.id)!, updated_at: at } });
        await log(tx, { event_id: id, kind: "postpone", reason, note: input.get("note"), from_date: event.date, to_date: next }, user);
      });
      const updated = eventArray(await prisma.event.findUniqueOrThrow({ where: { id } }));
      return ok(reply, warnings.length ? { ...updated, warnings } : updated);
    });

    routes.post("/events/:id/cancel", async (request, reply) => {
      const id = idParam(request.params, "Event");
      const { user, event } = await actorFor(request, id);
      if (event.status === "Cancelled") throw new HttpError(422, "This match is already cancelled");
      const input = inputOf(request.body);
      const reason = reasonOf(input.get<string>("reason"), MATCH_REASONS);
      await prisma.$transaction(async (tx) => {
        await tx.event.update({ where: { id }, data: { status: "Cancelled", updated_at: now() } });
        await log(tx, { event_id: id, kind: "cancel_event", reason, note: input.get("note") }, user);
      });
      return ok(reply, eventArray(await prisma.event.findUniqueOrThrow({ where: { id } })));
    });

    routes.get("/events/:id/changes", async (request, reply) => {
      const user = requireRole(request, [...STAFF, Role.Organizer]);
      const id = idParam(request.params, "Event");
      const event = await prisma.event.findUnique({ where: { id } });
      if (!event || (!hasRole(user, STAFF) && !canSeeEvent(user, event))) throw notFound("Event");
      const rows = await prisma.matchChange.findMany({ where: { event_id: id }, include: { user: { select: { full_name: true } } }, orderBy: { seq: "desc" } });
      return ok(
        reply,
        rows.map((r) => ({
          id: r.id,
          kind: r.kind,
          match_id: r.match_id,
          side: r.side,
          fighter_id: r.fighter_id,
          fighter_name: r.fighter_name,
          other_name: r.other_name,
          reason: r.reason,
          note: r.note,
          from_date: r.from_date ? day(r.from_date) : null,
          to_date: r.to_date ? day(r.to_date) : null,
          marked_fighter: r.marked_fighter,
          by_name: r.user?.full_name ?? null,
          created_at: micro(r.created_at),
        })),
      );
    });
  });
}
