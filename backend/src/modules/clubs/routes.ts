/**
 * Clubs  →  /api/clubs/*
 *
 *   GET    /clubs, /clubs/:id   public (with fighters_count)
 *   POST   /clubs               Super Admin, KKF Officer
 *   PUT    /clubs/:id           Super Admin, KKF Officer
 *   DELETE /clubs/:id           Super Admin, KKF Officer
 *
 * `latitude` / `longitude`: the map pin (both or neither, null clears; claude/updates/club-map-picker.md).
 * `association` (text, optional): the association the club is registered under (claude/updates/club-association.md).
 * `logoUrl` (club logo, claude/features/club-logos.md): a data URI is stored as a file by the
 * upload hook; "" removes the logo.
 */
import { randomUUID } from "node:crypto";
import type { FastifyInstance } from "fastify";
import { prisma } from "../../db.ts";
import type { Club } from "../../generated/prisma/client.ts";
import { STAFF, requireAuth, requireRole } from "../../lib/auth.ts";
import { micro, now } from "../../lib/dates.ts";
import { HttpError, deleted, idParam, notFound, ok } from "../../lib/http.ts";
import { type Input, inputOf } from "../../lib/input.ts";
import { NOT_DELETED } from "../fighters/routes.ts";

/** Club as a snake_case row, rating as a number. */
export function clubArray(club: Club) {
  return {
    id: club.id,
    name: club.name,
    name_khmer: club.name_khmer,
    location: club.location,
    head_coach: club.head_coach,
    association: club.association,
    latitude: club.latitude === null ? null : Number(club.latitude),
    longitude: club.longitude === null ? null : Number(club.longitude),
    status: club.status,
    rating: Number(club.rating),
    image: club.image,
    logo_url: club.logo_url,
    phone: club.phone,
    email: club.email,
    established: club.established,
    description: club.description,
    created_at: micro(club.created_at),
    updated_at: micro(club.updated_at),
  };
}

// Soft-deleted fighters don't count.
const withFighterCount = { _count: { select: { fighters: { where: NOT_DELETED } } } } as const;
const withCount = (club: Club & { _count: { fighters: number } }) => ({
  ...clubArray(club),
  fighters_count: club._count.fighters,
});

const FIELDS = {
  name: "name",
  nameKhmer: "name_khmer",
  location: "location",
  headCoach: "head_coach",
  association: "association",
  status: "status",
  rating: "rating",
  image: "image",
  logoUrl: "logo_url",
  phone: "phone",
  email: "email",
  established: "established",
  description: "description",
};

/** Map pin: both or neither, within the valid ranges; "" / null clears it. */
function coordinates(input: Input, existing?: { latitude: unknown; longitude: unknown }) {
  if (!input.present("latitude") && !input.present("longitude")) return {};
  const read = (key: string, min: number, max: number, current: unknown) => {
    if (!input.present(key)) return current === null || current === undefined ? null : Number(current);
    const raw = input.get(key);
    if (raw === null) return null;
    const n = Number(raw);
    if (!Number.isFinite(n) || n < min || n > max) throw new HttpError(422, `The ${key} must be a number between ${min} and ${max}`);
    return Math.round(n * 1e6) / 1e6;
  };
  const latitude = read("latitude", -90, 90, existing?.latitude);
  const longitude = read("longitude", -180, 180, existing?.longitude);
  if ((latitude === null) !== (longitude === null)) throw new HttpError(422, "Give both latitude and longitude, or neither");
  return { latitude, longitude };
}

async function findClub(id: string) {
  const club = await prisma.club.findUnique({ where: { id } });
  if (!club) throw notFound("Club");
  return club;
}

export default async function clubRoutes(app: FastifyInstance) {
  app.get("/clubs", async (_request, reply) => {
    const clubs = await prisma.club.findMany({
      include: withFighterCount,
      orderBy: { created_at: { sort: "desc", nulls: "last" } },
    });
    return ok(reply, clubs.map(withCount));
  });

  app.get("/clubs/:id", async (request, reply) => {
    const id = idParam(request.params, "Club");
    const club = await prisma.club.findUnique({ where: { id }, include: withFighterCount });
    if (!club) throw notFound("Club");
    return ok(reply, withCount(club));
  });

  app.register(async (protectedRoutes) => {
    protectedRoutes.addHook("preHandler", requireAuth);

    protectedRoutes.post("/clubs", async (request, reply) => {
      requireRole(request, STAFF);
      const input = inputOf(request.body);
      const at = now();
      const club = await prisma.club.create({
        data: {
          id: randomUUID(),
          name: input.required("name"),
          name_khmer: input.get("nameKhmer"),
          location: input.get("location"),
          head_coach: input.get("headCoach"),
          association: input.get("association"),
          ...coordinates(input),
          status: input.get("status", "active"),
          rating: input.get("rating", 4.0),
          image: input.get("image"),
          logo_url: input.get("logoUrl"),
          phone: input.get("phone"),
          email: input.get("email"),
          established: input.get("established"),
          description: input.get("description"),
          created_at: at,
          updated_at: at,
        },
      });
      return ok(reply, clubArray(club), 201);
    });

    protectedRoutes.put("/clubs/:id", async (request, reply) => {
      requireRole(request, STAFF);
      const id = idParam(request.params, "Club");
      const existing = await findClub(id);
      const input = inputOf(request.body);
      const data: Record<string, unknown> = input.pick(FIELDS);
      Object.assign(data, coordinates(input, existing));
      // An empty logo removes it (pick() skips empty values).
      if (input.present("logoUrl")) data.logo_url = input.get("logoUrl");
      // Same for the association: "" clears it.
      if (input.present("association")) data.association = input.get("association");
      if (Object.keys(data).length > 0) data.updated_at = now();
      return ok(reply, clubArray(await prisma.club.update({ where: { id }, data })));
    });

    protectedRoutes.delete("/clubs/:id", async (request, reply) => {
      requireRole(request, STAFF);
      const id = idParam(request.params, "Club");
      const club = await findClub(id);
      await prisma.club.delete({ where: { id } });
      return deleted(reply, "Club deleted successfully", clubArray(club));
    });
  });
}
