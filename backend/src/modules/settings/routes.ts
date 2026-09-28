/**
 * Settings: sponsors and broadcast stations  →  /api/settings/*
 *
 *   GET    /settings/sponsors                public
 *   POST   /settings/sponsors                Super Admin, KKF Officer
 *   PUT    /settings/sponsors/:id            Super Admin, KKF Officer
 *   DELETE /settings/sponsors/:id            Super Admin
 *   (same for /settings/broadcast-stations and /settings/partner-organizations)
 *
 * Partner organisations = international partners (K-1, WKN, Kombat …), listed by sort order then
 * name; see claude/features/international-partners.md.
 */
import { randomUUID } from "node:crypto";
import type { FastifyInstance } from "fastify";
import { prisma } from "../../db.ts";
import type { BroadcastStation, PartnerOrganization, Sponsor } from "../../generated/prisma/client.ts";
import { Role, STAFF, requireAuth, requireRole } from "../../lib/auth.ts";
import { micro, now } from "../../lib/dates.ts";
import { HttpError, deleted, idParam, notFound, ok } from "../../lib/http.ts";
import { type Input, inputOf, isTruthy } from "../../lib/input.ts";

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

export function organizationArray(o: PartnerOrganization) {
  return {
    id: o.id,
    name: o.name,
    short_name: o.short_name,
    org_type: o.org_type,
    country: o.country,
    logo_url: o.logo_url,
    image: o.image,
    description: o.description,
    description_km: o.description_km,
    partner_since: o.partner_since,
    website_url: o.website_url,
    active: o.active,
    sort_order: o.sort_order,
    created_at: micro(o.created_at),
    updated_at: micro(o.updated_at),
  };
}

const ORGANIZATION_FIELDS = {
  name: "name",
  shortName: "short_name",
  orgType: "org_type",
  country: "country",
  logoUrl: "logo_url",
  image: "image",
  description: "description",
  descriptionKm: "description_km",
  websiteUrl: "website_url",
};

/** partnerSince: a year (1900–2100) or empty; sortOrder: a whole number. */
function organizationNumbers(input: Input, data: Record<string, unknown>) {
  if (input.present("partnerSince")) {
    const raw = input.get("partnerSince");
    const year = raw == null ? null : Number(raw);
    if (year != null && (!Number.isInteger(year) || year < 1900 || year > 2100)) {
      throw new HttpError(422, "The partner since field must be a year between 1900 and 2100.");
    }
    data.partner_since = year;
  }
  if (input.has("sortOrder")) {
    const order = Number(input.get("sortOrder"));
    if (!Number.isInteger(order)) throw new HttpError(422, "The sort order field must be a whole number.");
    data.sort_order = order;
  }
}

const CONTACT_FIELDS = {
  contactPerson: "contact_person",
  contactEmail: "contact_email",
  contactPhone: "contact_phone",
  websiteUrl: "website_url",
};

/** `active` is optional; any truthy value except "0" counts as true. */
function activeFlag(input: Input, data: Record<string, unknown>, fallback?: boolean) {
  if (input.has("active")) data.active = isTruthy(input.get("active"));
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

  app.get("/settings/partner-organizations", async (_request, reply) =>
    ok(reply, (await prisma.partnerOrganization.findMany({ orderBy: [{ sort_order: "asc" }, { name: "asc" }] })).map(organizationArray)),
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

    // ─── Partner organisations (international partners) ─────
    protectedRoutes.post("/settings/partner-organizations", async (request, reply) => {
      requireRole(request, STAFF);
      const input = inputOf(request.body);
      const data: Record<string, unknown> = {
        ...Object.fromEntries(Object.entries(ORGANIZATION_FIELDS).map(([k, col]) => [col, input.get(k)])),
        name: input.required("name"),
        org_type: input.get("orgType", "Promotion"),
      };
      organizationNumbers(input, data);
      activeFlag(input, data, true);
      const at = now();
      const organization = await prisma.partnerOrganization.create({
        data: { id: randomUUID(), ...(data as { name: string }), created_at: at, updated_at: at },
      });
      return ok(reply, organizationArray(organization), 201);
    });

    protectedRoutes.put("/settings/partner-organizations/:id", async (request, reply) => {
      requireRole(request, STAFF);
      const id = idParam(request.params, "Partner organization");
      if (!(await prisma.partnerOrganization.findUnique({ where: { id } }))) throw notFound("Partner organization");

      const input = inputOf(request.body);
      const data = input.pick(ORGANIZATION_FIELDS);
      organizationNumbers(input, data);
      activeFlag(input, data);
      if (Object.keys(data).length > 0) data.updated_at = now();
      return ok(reply, organizationArray(await prisma.partnerOrganization.update({ where: { id }, data })));
    });

    protectedRoutes.delete("/settings/partner-organizations/:id", async (request, reply) => {
      requireRole(request, [Role.SuperAdmin]);
      const id = idParam(request.params, "Partner organization");
      const organization = await prisma.partnerOrganization.findUnique({ where: { id } });
      if (!organization) throw notFound("Partner organization");
      await prisma.partnerOrganization.delete({ where: { id } });
      return deleted(reply, "Partner organization deleted successfully", organizationArray(organization));
    });
  });
}
