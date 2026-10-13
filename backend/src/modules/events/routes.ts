/**
 * Events  →  /api/events/*
 *
 *   GET    /events, /events/:id   public; newest date first
 *   POST   /events                Super Admin, KKF Officer, Organizer (becomes organizer; Organizer events start as Draft)
 *   PUT    /events/:id            Super Admin, KKF Officer; Organizer only events it can see (its broadcaster's
 *                                 or its own), only before publishing, and status only → Published (once
 *                                 Approved) or Cancelled.
 *                                 Nobody can switch an event to Published while it has no bouts
 *                                 (claude/updates/publish-guard.md) or before KKF confirmed its details
 *                                 (claude/updates/offline-agreements-log.md, agreements.ts).
 *   POST   /events/:id/submit     Organizer (own) or STAFF: Draft → Pending KKF Approval
 *   POST   /events/:id/approve    STAFF: Pending KKF Approval → Approved (records who/when)
 *   POST   /events/:id/reject     STAFF: Pending KKF Approval → Draft with a comment
 *   DELETE /events/:id            Super Admin
 *
 * Public reads (no staff token) never show events that aren't published yet (UNAPPROVED).
 *
 * Responses carry both the snake_case row (with organizer, broadcast
 * station, main sponsor and sponsors nested) and the camelCase extras the
 * frontends read (eventType, sponsorIds, organizer_name, ...).
 */
import { randomUUID } from "node:crypto";
import type { FastifyInstance } from "fastify";
import { prisma } from "../../db.ts";
import type { Prisma, User } from "../../generated/prisma/client.ts";
import { Role, STAFF, hasRole, requireAuth, requireRole } from "../../lib/auth.ts";
import { micro, now, toDate } from "../../lib/dates.ts";
import { HttpError, deleted, forbidden, idParam, notFound, ok } from "../../lib/http.ts";
import { type Input, inputOf, parseBool } from "../../lib/input.ts";
import { userArray } from "../auth/routes.ts";
import { sponsorArray, stationArray } from "../settings/routes.ts";
import { LOCKED_FOR_ORGANIZER, publishBlocker } from "./agreements.ts";

const EDITORS = [...STAFF, Role.Organizer];

/** Event statuses the public never sees (not yet published). */
export const UNAPPROVED = ["Draft", "Pending KKF Approval", "Approved"];
export const PUBLIC_EVENT = { status: { notIn: UNAPPROVED } } satisfies Prisma.EventWhereInput;

/**
 * Events a signed-in user may see (claude/updates/broadcaster-organizer-accounts.md): an Organizer sees only its
 * broadcaster's events plus the events it organizes; everyone else signed in sees all; the public sees published ones.
 */
export function eventScope(user: User | null): Prisma.EventWhereInput {
  if (!user) return PUBLIC_EVENT;
  if (user.role !== Role.Organizer) return {};
  return { OR: [{ organizer_id: user.id }, ...(user.broadcast_station_id ? [{ broadcast_station_id: user.broadcast_station_id }] : [])] };
}

/** Whether the user may see this event at all (an Organizer of another broadcaster may not). */
export const canSeeEvent = (user: User | null, e: { status: string; organizer_id: string; broadcast_station_id: string | null }) =>
  !user
    ? !UNAPPROVED.includes(e.status)
    : user.role !== Role.Organizer || e.organizer_id === user.id || (Boolean(user.broadcast_station_id) && e.broadcast_station_id === user.broadcast_station_id);

/**
 * An event's organizer and broadcaster always agree: an Organizer may organize only events of its own broadcaster.
 * Returns the organizer id to save (`fallback` when the current one no longer fits after a broadcaster change).
 */
async function agreeingOrganizer(organizerId: string, stationId: string | null, explicit: boolean, fallback: string) {
  const organizer = await prisma.user.findUnique({ where: { id: organizerId }, select: { role: true, broadcast_station_id: true } });
  if (!organizer) throw new HttpError(422, "The selected organizer does not exist");
  if (organizer.role !== Role.Organizer || organizer.broadcast_station_id === stationId) return organizerId;
  if (explicit) throw new HttpError(422, "This organizer works for another broadcaster");
  return fallback;
}
const PENDING = "Pending KKF Approval";

export const eventRelations = {
  organizer: true,
  broadcastStation: true,
  mainSponsor: true,
  sponsorLinks: { include: { sponsor: true } },
} as const satisfies Prisma.EventInclude;

type EventRow = Prisma.EventGetPayload<object>;
type EventWithRelations = Prisma.EventGetPayload<{ include: typeof eventRelations }>;

/** Event columns as a snake_case row. */
export function eventArray(e: EventRow) {
  return {
    id: e.id,
    name: e.name,
    date: micro(e.date),
    end_date: micro(e.end_date),
    // The date it had before it was postponed (null = never postponed): fans see "Postponed to {date}".
    // KKF signed the match off: the results are official and locked (claude/updates/match-signoff-settlement.md).
    signed_off_at: micro(e.signed_off_at),
    postponed_from: e.original_date && e.original_date.getTime() !== e.date.getTime() ? micro(e.original_date) : null,
    location: e.location,
    status: e.status,
    organizer_id: e.organizer_id,
    broadcast_station_id: e.broadcast_station_id,
    main_sponsor_id: e.main_sponsor_id,
    description: e.description,
    image: e.image,
    kkf_approval_date: micro(e.kkf_approval_date),
    kkf_approved_by: e.kkf_approved_by,
    kkf_comment: e.kkf_comment,
    created_at: micro(e.created_at),
    updated_at: micro(e.updated_at),
    event_type: e.event_type,
    is_tournament: e.is_tournament,
    tournament_format: e.tournament_format,
    tournament_weight_class: e.tournament_weight_class,
    expected_participants: e.expected_participants,
  };
}

/** Full event response: row, nested relations and the camelCase extras. */
function formatEvent(e: EventWithRelations) {
  const sponsors = e.sponsorLinks.map((link) => ({
    ...sponsorArray(link.sponsor),
    pivot: { event_id: link.event_id, sponsor_id: link.sponsor_id },
  }));
  return {
    ...eventArray(e),
    organizer: e.organizer ? userArray(e.organizer) : null,
    broadcast_station: e.broadcastStation ? stationArray(e.broadcastStation) : null,
    main_sponsor: e.mainSponsor ? sponsorArray(e.mainSponsor) : null,
    sponsors,
    organizer_name: e.organizer?.full_name ?? null,
    broadcast_station_name: e.broadcastStation?.name ?? null,
    broadcast_station_logo_url: e.broadcastStation?.logo_url ?? null,
    main_sponsor_name: e.mainSponsor?.name ?? null,
    main_sponsor_logo_url: e.mainSponsor?.logo_url ?? null,
    sponsorIds: sponsors.map((s) => s.id),
    eventType: e.event_type,
    isTournament: e.is_tournament,
    tournamentFormat: e.tournament_format,
    tournamentWeightClass: e.tournament_weight_class,
    expectedParticipants: e.expected_participants,
  };
}

/**
 * The create response leaves out the KKF approval fields (they are never
 * set on create); the frontends rely on this shape.
 */
function formatCreatedEvent(e: EventWithRelations) {
  const { kkf_approval_date: _date, kkf_approved_by: _by, kkf_comment: _comment, ...rest } = formatEvent(e);
  return rest;
}

/** Replace the event's sponsor list. */
function syncSponsors(eventId: string, sponsorIds: unknown): Prisma.PrismaPromise<unknown>[] {
  const ids = [...new Set(Array.isArray(sponsorIds) ? sponsorIds.map(String) : [])];
  return [
    prisma.eventSponsor.deleteMany({ where: { event_id: eventId } }),
    prisma.eventSponsor.createMany({ data: ids.map((sponsor_id) => ({ event_id: eventId, sponsor_id })) }),
  ];
}

const bool = (input: Input, key: string) => parseBool(input.get(key));

async function loadEvent(id: string) {
  const event = await prisma.event.findUnique({ where: { id }, include: eventRelations });
  if (!event) throw notFound("Event");
  return event;
}

export default async function eventRoutes(app: FastifyInstance) {
  app.get("/events", async (request, reply) => {
    const events = await prisma.event.findMany({
      where: eventScope(request.user),
      include: eventRelations,
      orderBy: [{ date: "desc" }, { created_at: { sort: "desc", nulls: "last" } }],
    });
    return ok(reply, events.map(formatEvent));
  });

  app.get("/events/:id", async (request, reply) => {
    const event = await loadEvent(idParam(request.params, "Event"));
    if (!canSeeEvent(request.user, event)) throw notFound("Event");
    return ok(reply, formatEvent(event));
  });

  app.register(async (protectedRoutes) => {
    protectedRoutes.addHook("preHandler", requireAuth);

    protectedRoutes.post("/events", async (request, reply) => {
      const user = requireRole(request, EDITORS);
      const input = inputOf(request.body);
      const id = randomUUID();
      const at = now();

      await prisma.$transaction([
        prisma.event.create({
          data: {
            id,
            name: input.required("name"),
            date: toDate(input.required("date"))!,
            end_date: toDate(input.get("endDate")),
            location: input.required("location"),
            // Organizers' events wait for KKF approval; staff may set any status.
            status: hasRole(user, STAFF) ? input.get("status", "Draft") : "Draft",
            organizer_id: user.id,
            // An Organizer's event always belongs to its own broadcaster.
            broadcast_station_id: user.role === Role.Organizer ? user.broadcast_station_id : input.get("broadcastStationId"),
            description: input.get("description"),
            image: input.get("image"),
            main_sponsor_id: input.get("mainSponsorId"),
            event_type: input.get("eventType", "single-day"),
            is_tournament: input.has("isTournament") ? bool(input, "isTournament") : false,
            tournament_format: input.get("tournamentFormat"),
            tournament_weight_class: input.get("tournamentWeightClass"),
            expected_participants: Number(input.get("expectedParticipants", 8)),
            created_at: at,
            updated_at: at,
          },
        }),
        ...(input.present("sponsorIds") ? syncSponsors(id, input.get("sponsorIds")) : []),
      ]);

      return ok(reply, formatCreatedEvent(await loadEvent(id)), 201);
    });

    protectedRoutes.put("/events/:id", async (request, reply) => {
      const user = requireRole(request, EDITORS);
      const id = idParam(request.params, "Event");
      const existing = await loadEvent(id);
      const staff = hasRole(user, STAFF);
      if (!staff && !canSeeEvent(user, existing)) throw forbidden();

      const input = inputOf(request.body);
      // A signed-off match keeps its date and status (Super Admin can reopen it first).
      if (existing.signed_off_at && (input.has("status") || input.has("date"))) throw new HttpError(422, "This match is signed off — only a Super Admin can reopen it");
      if (!staff) {
        // After publishing only KKF changes a fight night (the Organizer may still cancel / publish in approvals mode).
        const changesMore = Object.keys((request.body ?? {}) as object).some((k) => k !== "status");
        if (changesMore && LOCKED_FOR_ORGANIZER.includes(existing.status)) {
          throw new HttpError(422, "This fight night is published — ask KKF to change it");
        }
        const status = input.get<string>("status");
        if (status && status !== existing.status) {
          if (status === "Published" && existing.status !== "Approved") {
            throw new HttpError(422, "This event needs KKF approval before it can be published");
          }
          if (status !== "Published" && status !== "Cancelled") {
            throw new HttpError(422, "Submit the event for KKF approval instead of changing its status");
          }
        }
        if (input.has("organizerId")) throw forbidden();
        if (input.present("broadcastStationId") && input.get("broadcastStationId") !== existing.broadcast_station_id) throw forbidden();
      }
      // Publish guard: fans must never get an empty fight night.
      if (input.get<string>("status") === "Published" && existing.status !== "Published") {
        const bouts = await prisma.match.count({ where: { event_id: id } });
        if (bouts === 0) throw new HttpError(422, "Add at least one bout before publishing this fight night");
        // Offline agreements log: KKF confirms the details (licence included), and the titles if any, first.
        const blocker = await publishBlocker(id);
        if (blocker) throw new HttpError(422, blocker);
      }
      const data: Prisma.EventUncheckedUpdateInput = input.pick({
        name: "name",
        location: "location",
        status: "status",
        organizerId: "organizer_id",
        broadcastStationId: "broadcast_station_id",
        description: "description",
        image: "image",
        mainSponsorId: "main_sponsor_id",
        eventType: "event_type",
        tournamentFormat: "tournament_format",
        tournamentWeightClass: "tournament_weight_class",
      });
      if (input.has("date")) data.date = toDate(input.get("date"))!;
      if (input.has("endDate")) data.end_date = toDate(input.get("endDate"));
      if (input.has("isTournament")) data.is_tournament = bool(input, "isTournament");
      if (input.has("expectedParticipants")) data.expected_participants = Number(input.get("expectedParticipants"));
      // Broadcaster is optional: "" / null removes it (pick() skips empty values). The organizer must then still agree.
      if (staff && (input.present("broadcastStationId") || input.has("organizerId"))) {
        const station = input.present("broadcastStationId") ? (input.get<string>("broadcastStationId") ?? null) : existing.broadcast_station_id;
        const organizerId = input.has("organizerId") ? String(input.get("organizerId")) : existing.organizer_id;
        data.broadcast_station_id = station;
        data.organizer_id = await agreeingOrganizer(organizerId, station, input.has("organizerId"), user.id);
      }
      if (Object.keys(data).length > 0) data.updated_at = now();

      await prisma.$transaction([
        prisma.event.update({ where: { id }, data }),
        ...(input.has("sponsorIds") ? syncSponsors(id, input.get("sponsorIds")) : []),
      ]);

      return ok(reply, formatEvent(await loadEvent(id)));
    });

    protectedRoutes.post("/events/:id/submit", async (request, reply) => {
      const user = requireRole(request, EDITORS);
      const id = idParam(request.params, "Event");
      const event = await loadEvent(id);
      if (!hasRole(user, STAFF) && event.organizer_id !== user.id) throw forbidden();
      if (event.status !== "Draft") throw new HttpError(422, "Only a Draft event can be submitted for approval");
      await prisma.event.update({ where: { id }, data: { status: PENDING, kkf_comment: null, updated_at: now() } });
      return ok(reply, formatEvent(await loadEvent(id)));
    });

    protectedRoutes.post("/events/:id/approve", async (request, reply) => {
      const user = requireRole(request, STAFF);
      const id = idParam(request.params, "Event");
      const event = await loadEvent(id);
      if (event.status !== PENDING) throw new HttpError(422, "Only an event waiting for approval can be approved");
      const at = now();
      await prisma.event.update({
        where: { id },
        data: { status: "Approved", kkf_approval_date: at, kkf_approved_by: user.id, kkf_comment: null, updated_at: at },
      });
      return ok(reply, formatEvent(await loadEvent(id)));
    });

    protectedRoutes.post("/events/:id/reject", async (request, reply) => {
      requireRole(request, STAFF);
      const id = idParam(request.params, "Event");
      const event = await loadEvent(id);
      if (event.status !== PENDING) throw new HttpError(422, "Only an event waiting for approval can be sent back");
      const comment = String(inputOf(request.body).required("comment"));
      await prisma.event.update({ where: { id }, data: { status: "Draft", kkf_comment: comment, updated_at: now() } });
      return ok(reply, formatEvent(await loadEvent(id)));
    });

    protectedRoutes.delete("/events/:id", async (request, reply) => {
      requireRole(request, [Role.SuperAdmin]);
      const id = idParam(request.params, "Event");
      const event = await prisma.event.findUnique({ where: { id } });
      if (!event) throw notFound("Event");
      await prisma.event.delete({ where: { id } });
      return deleted(reply, "Event deleted successfully", eventArray(event));
    });
  });
}
