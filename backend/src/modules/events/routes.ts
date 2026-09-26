/**
 * Events  →  /api/events/*
 *
 *   GET    /events, /events/:id   public; newest date first
 *   POST   /events                Super Admin, KKF Officer, Organizer (becomes organizer)
 *   PUT    /events/:id            Super Admin, KKF Officer, Organizer
 *   DELETE /events/:id            Super Admin
 *
 * Responses carry both Laravel's snake_case row (with organizer, broadcast
 * station, main sponsor and sponsors nested) and the camelCase extras the
 * frontends read (eventType, sponsorIds, organizer_name, ...).
 */
import { randomUUID } from "node:crypto";
import type { FastifyInstance } from "fastify";
import { prisma } from "../../db.ts";
import type { Prisma } from "../../generated/prisma/client.ts";
import { Role, STAFF, requireAuth, requireRole } from "../../lib/auth.ts";
import { micro, now, toDate } from "../../lib/dates.ts";
import { deleted, idParam, notFound, ok } from "../../lib/http.ts";
import { type Input, inputOf, phpBool } from "../../lib/input.ts";
import { userArray } from "../auth/routes.ts";
import { sponsorArray, stationArray } from "../settings/routes.ts";

const EDITORS = [...STAFF, Role.Organizer];

export const eventRelations = {
  organizer: true,
  broadcastStation: true,
  mainSponsor: true,
  sponsorLinks: { include: { sponsor: true } },
} as const satisfies Prisma.EventInclude;

type EventRow = Prisma.EventGetPayload<object>;
type EventWithRelations = Prisma.EventGetPayload<{ include: typeof eventRelations }>;

/** Event columns as Laravel's toArray() serialized them. */
export function eventArray(e: EventRow) {
  return {
    id: e.id,
    name: e.name,
    date: micro(e.date),
    end_date: micro(e.end_date),
    location: e.location,
    status: e.status,
    organizer_id: e.organizer_id,
    broadcast_station_id: e.broadcast_station_id,
    main_sponsor_id: e.main_sponsor_id,
    description: e.description,
    image: e.image,
    kkf_approval_date: micro(e.kkf_approval_date),
    kkf_approved_by: e.kkf_approved_by,
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
 * Laravel returned only the attributes it had just set on create, so the
 * KKF approval fields (never set on create) were missing from that response.
 */
function formatCreatedEvent(e: EventWithRelations) {
  const { kkf_approval_date: _date, kkf_approved_by: _by, ...rest } = formatEvent(e);
  return rest;
}

/** Replace the event's sponsor list (Laravel's sync()). */
function syncSponsors(eventId: string, sponsorIds: unknown): Prisma.PrismaPromise<unknown>[] {
  const ids = [...new Set(Array.isArray(sponsorIds) ? sponsorIds.map(String) : [])];
  return [
    prisma.eventSponsor.deleteMany({ where: { event_id: eventId } }),
    prisma.eventSponsor.createMany({ data: ids.map((sponsor_id) => ({ event_id: eventId, sponsor_id })) }),
  ];
}

const bool = (input: Input, key: string) => phpBool(input.get(key));

async function loadEvent(id: string) {
  const event = await prisma.event.findUnique({ where: { id }, include: eventRelations });
  if (!event) throw notFound("Event");
  return event;
}

export default async function eventRoutes(app: FastifyInstance) {
  app.get("/events", async (_request, reply) => {
    const events = await prisma.event.findMany({
      include: eventRelations,
      orderBy: [{ date: "desc" }, { created_at: { sort: "desc", nulls: "last" } }],
    });
    return ok(reply, events.map(formatEvent));
  });

  app.get("/events/:id", async (request, reply) => ok(reply, formatEvent(await loadEvent(idParam(request.params, "Event")))));

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
            status: input.get("status", "Draft"),
            organizer_id: user.id,
            broadcast_station_id: input.get("broadcastStationId"),
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
      requireRole(request, EDITORS);
      const id = idParam(request.params, "Event");
      await loadEvent(id);

      const input = inputOf(request.body);
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
      if (Object.keys(data).length > 0) data.updated_at = now();

      await prisma.$transaction([
        prisma.event.update({ where: { id }, data }),
        ...(input.has("sponsorIds") ? syncSponsors(id, input.get("sponsorIds")) : []),
      ]);

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
