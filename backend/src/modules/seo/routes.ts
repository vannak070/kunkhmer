/**
 * Search engines  →  GET /api/sitemap.xml   (public)
 *
 * Every public page of the fan site with an absolute URL (PUBLIC_SITE_URL): main sections, public
 * fighters, fight nights, published articles, active clubs, sponsors and broadcasters, and the
 * federation page once something is published. The fan site
 * serves it at /sitemap.xml. Slugs follow the site's rules (getFighterSlug / partnerSlug).
 * See claude/updates/step5a-seo-speed-login.md.
 */
import type { FastifyInstance } from "fastify";
import { config } from "../../config.ts";
import { prisma } from "../../db.ts";
import { NOT_DELETED, PUBLIC_FIGHTER } from "../fighters/routes.ts";
import { PUBLIC_EVENT } from "../events/routes.ts";
import { publishedFederation } from "../federation/routes.ts";
import { articlePath, championPath, eventPath, nameSlug as slug } from "../../lib/links.ts";

const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
const day = (d?: Date | null) => (d ? d.toISOString().slice(0, 10) : null);

const SECTIONS = ["/", "/matches", "/matches?tab=results", "/matches?tab=events", "/news-events", "/news-events?tab=media", "/fighters", "/champions", "/strategic-partners", "/about", "/hub"];

export default async function seoRoutes(app: FastifyInstance) {
  app.get("/sitemap.xml", async (_request, reply) => {
    const [fighters, events, news, clubs, sponsors, stations, titles, federation] = await Promise.all([
      prisma.fighter.findMany({ where: { ...NOT_DELETED, ...PUBLIC_FIGHTER }, select: { id: true, name: true, updated_at: true } }),
      prisma.event.findMany({ where: PUBLIC_EVENT, select: { id: true, name: true, date: true, updated_at: true } }),
      prisma.newsArticle.findMany({ where: { status: "Published" }, select: { id: true, title: true, title_en: true, publish_date: true, updated_at: true } }),
      prisma.club.findMany({ where: { NOT: { status: "inactive" } }, select: { id: true, name: true, updated_at: true } }),
      prisma.sponsor.findMany({ where: { active: true }, select: { id: true, name: true, updated_at: true } }),
      prisma.broadcastStation.findMany({ where: { active: true }, select: { id: true, name: true, updated_at: true } }),
      prisma.champion.findMany({ where: { approval_status: "approved" }, select: { id: true, title_name: true, updated_at: true } }),
      publishedFederation(),
    ]);

    const urls: { loc: string; lastmod?: string | null }[] = [
      ...SECTIONS.map((p) => ({ loc: p })),
      ...(federation ? [{ loc: "/federation", lastmod: federation.publishedAt?.slice(0, 10) }] : []),
      ...fighters.map((f) => ({ loc: `/fighters/${slug(f)}`, lastmod: day(f.updated_at) })),
      ...events.map((e) => ({ loc: eventPath(e), lastmod: day(e.updated_at) })),
      ...news.map((n) => ({ loc: articlePath(n), lastmod: day(n.updated_at) })),
      ...clubs.map((c) => ({ loc: `/clubs/${slug(c)}`, lastmod: day(c.updated_at) })),
      ...sponsors.map((s) => ({ loc: `/partners/sponsors/${slug(s)}`, lastmod: day(s.updated_at) })),
      ...stations.map((b) => ({ loc: `/partners/broadcasters/${slug(b)}`, lastmod: day(b.updated_at) })),
      ...titles.map((c) => ({ loc: championPath(c), lastmod: day(c.updated_at) })),
    ];

    const body = [
      '<?xml version="1.0" encoding="UTF-8"?>',
      '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
      ...urls.map((u) => `  <url><loc>${esc(config.publicSiteUrl + u.loc)}</loc>${u.lastmod ? `<lastmod>${u.lastmod}</lastmod>` : ""}</url>`),
      "</urlset>",
      "",
    ].join("\n");

    return reply.header("Content-Type", "application/xml; charset=utf-8").header("Cache-Control", "public, max-age=3600").send(body);
  });
}
