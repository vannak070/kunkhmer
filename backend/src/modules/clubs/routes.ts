/**
 * Clubs  →  /api/clubs/*
 *
 *   GET    /clubs, /clubs/:id   public (with fighters_count)
 *   POST   /clubs               Super Admin, KKF Officer
 *   PUT    /clubs/:id           Super Admin, KKF Officer
 *   DELETE /clubs/:id           Super Admin, KKF Officer
 *
 * `logoUrl` (club logo, claude/features/club-logos.md): a data URI is stored as a file by the
 * upload hook; "" removes the logo.
 */
import { randomUUID } from "node:crypto";
import type { FastifyInstance } from "fastify";
import { prisma } from "../../db.ts";
import type { Club } from "../../generated/prisma/client.ts";
import { STAFF, requireAuth, requireRole } from "../../lib/auth.ts";
import { micro, now } from "../../lib/dates.ts";
import { deleted, idParam, notFound, ok } from "../../lib/http.ts";
import { inputOf } from "../../lib/input.ts";
import { NOT_DELETED } from "../fighters/routes.ts";

/** Club as a snake_case row, rating as a number. */
export function clubArray(club: Club) {
  return {
    id: club.id,
    name: club.name,
    name_khmer: club.name_khmer,
    location: club.location,
    head_coach: club.head_coach,
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
  status: "status",
  rating: "rating",
  image: "image",
  logoUrl: "logo_url",
  phone: "phone",
  email: "email",
  established: "established",
  description: "description",
};

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
      await findClub(id);
      const input = inputOf(request.body);
      const data = input.pick(FIELDS);
      // An empty logo removes it (pick() skips empty values).
      if (input.present("logoUrl")) data.logo_url = input.get("logoUrl");
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
