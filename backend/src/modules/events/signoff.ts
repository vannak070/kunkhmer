/**
 * After the match (Program workflow phase 7, claude/updates/match-signoff-settlement.md): sign-off, disputes, settlement.
 *
 *   POST /events/:id/sign-off          STAFF  every live bout has a result, none waits for a replacement, no open dispute,
 *                                      match day has come → `signed_off_at/by`, status Completed; locks results
 *   POST /events/:id/reopen            Super Admin  { reason }  undoes the sign-off
 *   GET  /events/:id/disputes          STAFF  this match's disputes
 *   GET  /matches/disputes?status=open STAFF  open disputes across matches (to-do lists)
 *   POST /matches/:id/disputes         STAFF  { raisedBy, reason }
 *   PUT  /disputes/:id/resolve         STAFF  { outcome: upheld | dismissed | corrected, note? }
 *   GET  /events/:id/settlement        STAFF  the broadcaster and sponsors with their settled state
 *   PUT  /events/:id/settlement        STAFF  { kind: broadcaster | sponsor, partyId, settled, note? }
 *
 * After sign-off a result or weigh-in changes only for a Super Admin with `correctionReason` (`signedOffLock`);
 * everything else about the match is refused (`assertNotSignedOff`). Every step is added to the match history.
 */
import { randomUUID } from "node:crypto";
import type { FastifyInstance } from "fastify";
import { prisma } from "../../db.ts";
import type { User } from "../../generated/prisma/client.ts";
import { Role, STAFF, requireAuth, requireRole } from "../../lib/auth.ts";
import { micro, now } from "../../lib/dates.ts";
import { HttpError, idParam, isUuid, notFound, ok } from "../../lib/http.ts";
import { inputOf } from "../../lib/input.ts";

export const DISPUTE_OUTCOMES = ["upheld", "dismissed", "corrected"] as const;
const todayUtc = () => new Date(new Date().toISOString().slice(0, 10));

/**
 * Locks a signed-off match: returns null when the match is open; for a signed-off one only a Super Admin passes, with a
 * written reason, which is returned so the caller can log the correction.
 */
export async function signedOffLock(eventId: string, user: User, reason: string | null): Promise<string | null> {
  const event = await prisma.event.findUnique({ where: { id: eventId }, select: { signed_off_at: true } });
  if (!event?.signed_off_at) return null;
  if (user.role !== Role.SuperAdmin) throw new HttpError(422, "This match is signed off — only a Super Admin can correct it, with a reason");
  if (!reason || reason.trim().length < 3) throw new HttpError(422, "Give the reason for the correction (correctionReason)");
  return reason.trim();
}

/** Everything but a logged correction is refused once the match is signed off. */
export async function assertNotSignedOff(eventId: string | null | undefined) {
  if (!eventId || !isUuid(eventId)) return;
  const event = await prisma.event.findUnique({ where: { id: eventId }, select: { signed_off_at: true } });
  if (event?.signed_off_at) throw new HttpError(422, "This match is signed off — only a Super Admin can reopen it");
}

const log = (eventId: string, user: User, kind: string, extra: { match_id?: string; note?: string | null } = {}) =>
  prisma.matchChange.create({ data: { id: randomUUID(), event_id: eventId, kind, created_by: user.id, created_at: now(), ...extra } });

async function loadEvent(id: string) {
  const event = await prisma.event.findUnique({ where: { id }, include: { broadcastStation: true, mainSponsor: true, sponsorLinks: { include: { sponsor: true } } } });
  if (!event) throw notFound("Event");
  return event;
}

const disputeRow = (d: { id: string; match_id: string; event_id: string; raised_by_text: string; reason: string; status: string; resolution_note: string | null; created_at: Date; resolved_at: Date | null; creator?: { full_name: string } | null; resolver?: { full_name: string } | null; match?: { fighterA: { name: string }; fighterB: { name: string } } }) => ({
  id: d.id,
  match_id: d.match_id,
  event_id: d.event_id,
  bout: d.match ? `${d.match.fighterA.name} vs ${d.match.fighterB.name}` : null,
  raised_by: d.raised_by_text,
  reason: d.reason,
  status: d.status,
  resolution_note: d.resolution_note,
  created_by_name: d.creator?.full_name ?? null,
  created_at: micro(d.created_at),
  resolved_by_name: d.resolver?.full_name ?? null,
  resolved_at: micro(d.resolved_at),
});
const disputeInclude = { creator: { select: { full_name: true } }, resolver: { select: { full_name: true } }, match: { select: { fighterA: { select: { name: true } }, fighterB: { select: { name: true } } } } } as const;

export default async function signoffRoutes(app: FastifyInstance) {
  app.register(async (routes) => {
    routes.addHook("preHandler", requireAuth);

    routes.post("/events/:id/sign-off", async (request, reply) => {
      const user = requireRole(request, STAFF);
      const id = idParam(request.params, "Event");
      const event = await loadEvent(id);
      if (event.status === "Cancelled") throw new HttpError(422, "This match is cancelled");
      if (event.signed_off_at) throw new HttpError(422, "This match is already signed off");
      if (event.date.getTime() > todayUtc().getTime()) throw new HttpError(422, "The match day has not come yet");
      const live = (await prisma.match.findMany({ where: { event_id: id, status: { not: "Cancelled" } }, include: { result: true } }));
      if (!live.length) throw new HttpError(422, "There are no bouts to sign off");
      if (live.some((b) => b.replacement_side)) throw new HttpError(422, "A bout still needs a replacement fighter — or cancel it");
      const missing = live.filter((b) => !b.result).length;
      if (missing) throw new HttpError(422, `${missing} bout${missing === 1 ? " has" : "s have"} no result yet`);
      if (await prisma.boutDispute.count({ where: { event_id: id, status: "open" } })) throw new HttpError(422, "Resolve the open disputes first");
      const at = now();
      await prisma.event.update({ where: { id }, data: { signed_off_at: at, signed_off_by: user.id, status: "Completed", updated_at: at } });
      await log(id, user, "sign_off");
      return ok(reply, { signed_off_at: micro(at), signed_off_by_name: user.full_name });
    });

    routes.post("/events/:id/reopen", async (request, reply) => {
      const user = requireRole(request, [Role.SuperAdmin]);
      const id = idParam(request.params, "Event");
      const event = await loadEvent(id);
      if (!event.signed_off_at) throw new HttpError(422, "This match is not signed off");
      const reason = inputOf(request.body).get<string>("reason");
      if (!reason || reason.trim().length < 3) throw new HttpError(422, "Give the reason for reopening the match");
      await prisma.event.update({ where: { id }, data: { signed_off_at: null, signed_off_by: null, status: "Published", updated_at: now() } });
      await log(id, user, "reopen", { note: reason.trim() });
      return ok(reply, { signed_off_at: null });
    });

    routes.get("/events/:id/disputes", async (request, reply) => {
      requireRole(request, STAFF);
      const id = idParam(request.params, "Event");
      await loadEvent(id);
      const rows = await prisma.boutDispute.findMany({ where: { event_id: id }, include: disputeInclude, orderBy: { created_at: "desc" } });
      return ok(reply, rows.map(disputeRow));
    });

    routes.get("/matches/disputes", async (request, reply) => {
      requireRole(request, STAFF);
      const { status } = request.query as { status?: string };
      const rows = await prisma.boutDispute.findMany({ where: status ? { status } : {}, include: disputeInclude, orderBy: { created_at: "desc" } });
      return ok(reply, rows.map(disputeRow));
    });

    routes.post("/matches/:id/disputes", async (request, reply) => {
      const user = requireRole(request, STAFF);
      const id = idParam(request.params, "Match");
      const match = await prisma.match.findUnique({ where: { id } });
      if (!match) throw notFound("Match");
      const input = inputOf(request.body);
      const raisedBy = String(input.required("raisedBy"));
      if (raisedBy.length > 255) throw new HttpError(422, "The raisedBy field may not be greater than 255 characters");
      const reason = String(input.required("reason"));
      const row = await prisma.boutDispute.create({
        data: { id: randomUUID(), match_id: id, event_id: match.event_id, raised_by_text: raisedBy, reason, created_by: user.id, created_at: now() },
        include: disputeInclude,
      });
      return ok(reply, disputeRow(row), 201);
    });

    routes.put("/disputes/:id/resolve", async (request, reply) => {
      const user = requireRole(request, STAFF);
      const id = idParam(request.params, "Dispute");
      const dispute = await prisma.boutDispute.findUnique({ where: { id } });
      if (!dispute) throw notFound("Dispute");
      if (dispute.status !== "open") throw new HttpError(422, "This dispute is already resolved");
      const input = inputOf(request.body);
      const outcome = input.get<string>("outcome");
      if (!outcome || !(DISPUTE_OUTCOMES as readonly string[]).includes(outcome)) throw new HttpError(422, `The outcome must be one of: ${DISPUTE_OUTCOMES.join(", ")}`);
      const row = await prisma.boutDispute.update({ where: { id }, data: { status: outcome, resolution_note: input.get("note"), resolved_by: user.id, resolved_at: now() }, include: disputeInclude });
      return ok(reply, disputeRow(row));
    });

    /** The broadcaster and every sponsor of the match, with whether KKF ticked them as settled. */
    async function settlementOf(id: string) {
      const event = await loadEvent(id);
      const rows = await prisma.eventSettlement.findMany({ where: { event_id: id }, include: { settler: { select: { full_name: true } } } });
      const sponsors = new Map<string, string>();
      if (event.mainSponsor) sponsors.set(event.mainSponsor.id, event.mainSponsor.name);
      for (const l of event.sponsorLinks) sponsors.set(l.sponsor.id, l.sponsor.name);
      const parties = [
        ...(event.broadcastStation ? [{ kind: "broadcaster", id: event.broadcastStation.id, name: event.broadcastStation.name }] : []),
        ...[...sponsors].map(([sid, name]) => ({ kind: "sponsor", id: sid, name })),
      ].map((p) => {
        const row = rows.find((r) => r.party_kind === p.kind && r.party_id === p.id);
        return { kind: p.kind, party_id: p.id, name: p.name, settled: Boolean(row?.settled_at), settled_at: micro(row?.settled_at ?? null), settled_by_name: row?.settler?.full_name ?? null, note: row?.note ?? null };
      });
      return { event, parties };
    }

    routes.get("/events/:id/settlement", async (request, reply) => {
      requireRole(request, STAFF);
      const { parties } = await settlementOf(idParam(request.params, "Event"));
      return ok(reply, { parties });
    });

    routes.put("/events/:id/settlement", async (request, reply) => {
      const user = requireRole(request, STAFF);
      const id = idParam(request.params, "Event");
      const { event, parties } = await settlementOf(id);
      if (event.status === "Cancelled") throw new HttpError(422, "This match is cancelled");
      if (event.date.getTime() > todayUtc().getTime()) throw new HttpError(422, "Settlement starts on match day");
      const input = inputOf(request.body);
      const kind = input.get<string>("kind");
      const partyId = input.get<string>("partyId");
      const party = parties.find((p) => p.kind === kind && p.party_id === partyId);
      if (!party) throw new HttpError(422, "That broadcaster or sponsor is not part of this match");
      const settled = input.get("settled") === true;
      const data = { party_name: party.name, settled_at: settled ? now() : null, settled_by: settled ? user.id : null, note: input.get<string>("note") };
      await prisma.eventSettlement.upsert({
        where: { event_id_party_kind_party_id: { event_id: id, party_kind: party.kind, party_id: party.party_id } },
        create: { event_id: id, party_kind: party.kind, party_id: party.party_id, ...data },
        update: data,
      });
      return ok(reply, { parties: (await settlementOf(id)).parties });
    });
  });
}
