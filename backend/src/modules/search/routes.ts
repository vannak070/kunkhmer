/**
 * Search  →  /api/search
 *
 *   GET /search?q=   signed in: up to 8 fighters, 8 clubs and 8 events matching `q` (any case), for the admin header search
 *                    (claude/updates/admin-header-search.md).
 *
 * Fighters: name, Khmer name, alias or club name. Clubs: name, Khmer name or place. Events: name or place (an Organizer only
 * sees its own broadcaster's events, as in the events list). Soft-deleted fighters are left out.
 */
import type { FastifyInstance } from "fastify";
import { prisma } from "../../db.ts";
import { micro } from "../../lib/dates.ts";
import { requireAuth } from "../../lib/auth.ts";
import { ok } from "../../lib/http.ts";
import { eventScope } from "../events/routes.ts";
import { NOT_DELETED } from "../fighters/routes.ts";

const LIMIT = 8;

export default async function searchRoutes(app: FastifyInstance) {
  app.register(async (routes) => {
    routes.addHook("preHandler", requireAuth);

    routes.get("/search", async (request, reply) => {
      const q = String((request.query as { q?: string }).q ?? "").trim().slice(0, 100);
      if (!q) return ok(reply, { fighters: [], clubs: [], events: [] });
      const like = { contains: q, mode: "insensitive" as const };

      const [fighters, clubs, events] = await Promise.all([
        prisma.fighter.findMany({
          where: { ...NOT_DELETED, OR: [{ name: like }, { name_khmer: like }, { alias: like }, { kkf_id: like }, { club: { name: like } }] },
          select: { id: true, kkf_id: true, name: true, name_khmer: true, status: true, club: { select: { name: true } } },
          orderBy: [{ name: "asc" }, { id: "asc" }],
          take: LIMIT,
        }),
        prisma.club.findMany({
          where: { OR: [{ name: like }, { name_khmer: like }, { location: like }] },
          select: { id: true, name: true, name_khmer: true, location: true },
          orderBy: [{ name: "asc" }, { id: "asc" }],
          take: LIMIT,
        }),
        prisma.event.findMany({
          where: { AND: [eventScope(request.user), { OR: [{ name: like }, { location: like }] }] },
          select: { id: true, name: true, date: true, location: true, status: true },
          orderBy: [{ date: "desc" }, { id: "asc" }],
          take: LIMIT,
        }),
      ]);

      return ok(reply, {
        fighters: fighters.map((f) => ({ id: f.id, kkfId: f.kkf_id, name: f.name, nameKhmer: f.name_khmer, clubName: f.club?.name ?? null, status: f.status })),
        clubs: clubs.map((c) => ({ id: c.id, name: c.name, name_khmer: c.name_khmer, location: c.location })),
        events: events.map((e) => ({ id: e.id, name: e.name, date: micro(e.date), location: e.location, status: e.status })),
      });
    });
  });
}
