/**
 * Settings: sponsors and broadcast stations  →  /api/settings/*
 *
 *   GET    /settings/sponsors                public
 *   POST   /settings/sponsors                Super Admin, KKF Officer
 *   PUT    /settings/sponsors/:id            Super Admin, KKF Officer
 *   DELETE /settings/sponsors/:id            Super Admin
 *   (same for /settings/broadcast-stations)
 */
import { randomUUID } from "node:crypto";
import type { FastifyInstance } from "fastify";
import { prisma } from "../../db.ts";
import type { BroadcastStation, Sponsor } from "../../generated/prisma/client.ts";
import { Role, STAFF, requireAuth, requireRole } from "../../lib/auth.ts";
import { micro, now } from "../../lib/dates.ts";
import { deleted, idParam, notFound, ok } from "../../lib/http.ts";
import { type Input, inputOf, phpCastBool } from "../../lib/input.ts";

export function sponsorArray(s: Sponsor) {
  return {
    id: s.id,
    name: s.name,
    logo_url: s.logo_url,
    image: s.image,
    industry: s.industry,
    tier: s.tier,
    active: s.active,
    contact_person: s.contact_person,
    contact_email: s.contact_email,
    contact_phone: s.contact_phone,
    website_url: s.website_url,
    created_at: micro(s.created_at),
    updated_at: micro(s.updated_at),
  };
}

export function stationArray(s: BroadcastStation) {
  return {
    id: s.id,
    name: s.name,
    stream_url: s.stream_url,
    type: s.type,
    reach: s.reach,
    active: s.active,
    contact_person: s.contact_person,
    contact_email: s.contact_email,
    contact_phone: s.contact_phone,
    website_url: s.website_url,
    logo_url: s.logo_url,
    image: s.image,
    created_at: micro(s.created_at),
    updated_at: micro(s.updated_at),
  };
}

const CONTACT_FIELDS = {
  contactPerson: "contact_person",
  contactEmail: "contact_email",
  contactPhone: "contact_phone",
  websiteUrl: "website_url",
};

/** `active` is optional and PHP-cast to a boolean. */
function activeFlag(input: Input, data: Record<string, unknown>, fallback?: boolean) {
  if (input.has("active")) data.active = phpCastBool(input.get("active"));
  else if (fallback !== undefined) data.active = fallback;
}

export default async function settingsRoutes(app: FastifyInstance) {
  const newest = { orderBy: { created_at: { sort: "desc", nulls: "last" } } } as const;

  app.get("/settings/sponsors", async (_request, reply) =>
    ok(reply, (await prisma.sponsor.findMany(newest)).map(sponsorArray)),
  );

  app.get("/settings/broadcast-stations", async (_request, reply) =>
    ok(reply, (await prisma.broadcastStation.findMany(newest)).map(stationArray)),
  );

  app.register(async (protectedRoutes) => {
    protectedRoutes.addHook("preHandler", requireAuth);

    // ─── Sponsors ────────────────────────────────────────────
    protectedRoutes.post("/settings/sponsors", async (request, reply) => {
      requireRole(request, STAFF);
      const input = inputOf(request.body);
      const data: Record<string, unknown> = {
        name: input.required("name"),
        logo_url: input.get("logoUrl"),
        image: input.get("image"),
        industry: input.get("industry"),
        tier: input.get("tier", "Gold"),
        ...Object.fromEntries(Object.entries(CONTACT_FIELDS).map(([k, col]) => [col, input.get(k)])),
      };
      activeFlag(input, data, true);
      const at = now();
      const sponsor = await prisma.sponsor.create({
        data: { id: randomUUID(), ...(data as { name: string }), created_at: at, updated_at: at },
      });
      return ok(reply, sponsorArray(sponsor), 201);
    });

    protectedRoutes.put("/settings/sponsors/:id", async (request, reply) => {
      requireRole(request, STAFF);
      const id = idParam(request.params, "Sponsor");
      if (!(await prisma.sponsor.findUnique({ where: { id } }))) throw notFound("Sponsor");

      const input = inputOf(request.body);
      const data = input.pick({ name: "name", logoUrl: "logo_url", image: "image", industry: "industry", tier: "tier", ...CONTACT_FIELDS });
      activeFlag(input, data);
      if (Object.keys(data).length > 0) data.updated_at = now();
      return ok(reply, sponsorArray(await prisma.sponsor.update({ where: { id }, data })));
    });

    protectedRoutes.delete("/settings/sponsors/:id", async (request, reply) => {
      requireRole(request, [Role.SuperAdmin]);
      const id = idParam(request.params, "Sponsor");
      const sponsor = await prisma.sponsor.findUnique({ where: { id } });
      if (!sponsor) throw notFound("Sponsor");
      await prisma.sponsor.delete({ where: { id } });
      return deleted(reply, "Sponsor deleted successfully", sponsorArray(sponsor));
    });

    // ─── Broadcast stations ─────────────────────────────────
    protectedRoutes.post("/settings/broadcast-stations", async (request, reply) => {
      requireRole(request, STAFF);
      const input = inputOf(request.body);
      const data: Record<string, unknown> = {
        name: input.required("name"),
        stream_url: input.get("streamUrl"),
        type: input.get("type", "Cable TV"),
        reach: input.get("reach", "National"),
        logo_url: input.get("logoUrl"),
        image: input.get("image"),
        ...Object.fromEntries(Object.entries(CONTACT_FIELDS).map(([k, col]) => [col, input.get(k)])),
      };
      activeFlag(input, data, true);
      const at = now();
      const station = await prisma.broadcastStation.create({
        data: { id: randomUUID(), ...(data as { name: string }), created_at: at, updated_at: at },
      });
      return ok(reply, stationArray(station), 201);
    });

    protectedRoutes.put("/settings/broadcast-stations/:id", async (request, reply) => {
      requireRole(request, STAFF);
      const id = idParam(request.params, "Broadcast station");
      if (!(await prisma.broadcastStation.findUnique({ where: { id } }))) throw notFound("Broadcast station");

      const input = inputOf(request.body);
      const data = input.pick({ name: "name", streamUrl: "stream_url", type: "type", reach: "reach", logoUrl: "logo_url", image: "image", ...CONTACT_FIELDS });
      activeFlag(input, data);
      if (Object.keys(data).length > 0) data.updated_at = now();
      return ok(reply, stationArray(await prisma.broadcastStation.update({ where: { id }, data })));
    });

    protectedRoutes.delete("/settings/broadcast-stations/:id", async (request, reply) => {
      requireRole(request, [Role.SuperAdmin]);
      const id = idParam(request.params, "Broadcast station");
      const station = await prisma.broadcastStation.findUnique({ where: { id } });
      if (!station) throw notFound("Broadcast station");
      await prisma.broadcastStation.delete({ where: { id } });
      return deleted(reply, "Broadcast station deleted successfully", stationArray(station));
    });
  });
}
