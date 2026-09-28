/**
 * Clubs, sponsors and broadcasters for their public pages (/clubs/:slug, /partners/sponsors/:slug,
 * /partners/broadcasters/:slug). A page URL uses the name as a slug (like fighters); the id works too.
 */
import { api } from "../utils/api";

export type PartnerKind = "club" | "sponsor" | "broadcaster";

/** Same rule as getFighterSlug, so every shared link is readable: "Cambodia Beer" → "cambodia-beer". */
export function partnerSlug(p: { id: string; name?: string | null }): string {
  if (!p.name) return p.id;
  const slug = p.name.toLowerCase().trim().replace(/[\s_-]+/g, "-");
  return encodeURIComponent(slug) || p.id;
}

export function partnerPath(kind: PartnerKind, p: { id: string; name?: string | null }): string {
  const base = kind === "club" ? "/clubs" : kind === "sponsor" ? "/partners/sponsors" : "/partners/broadcasters";
  return `${base}/${partnerSlug(p)}`;
}

const loaders: Record<PartnerKind, () => Promise<any[]>> = {
  club: () => api.clubs.list(),
  sponsor: () => api.settings.listSponsors(),
  broadcaster: () => api.settings.listBroadcastStations(),
};

const cache: Partial<Record<PartnerKind, Promise<any[]>>> = {};

export function loadPartners(kind: PartnerKind, fresh = false): Promise<any[]> {
  if (fresh || !cache[kind]) {
    cache[kind] = loaders[kind]().then((rows) => rows || []).catch((err) => {
      delete cache[kind];
      throw err;
    });
  }
  return cache[kind]!;
}

/** Find a partner by the slug in the URL (or its id). */
export function findPartner(rows: any[], key: string | undefined): any | null {
  if (!key) return null;
  const wanted = decodeURIComponent(key).toLowerCase();
  return rows.find((r) => r.id === key || decodeURIComponent(partnerSlug(r)).toLowerCase() === wanted) ?? null;
}

/** Only real pictures: stock photos used as placeholders elsewhere never stand in for a partner. */
export const isRealImage = (url?: string | null): url is string => Boolean(url) && !url!.includes("images.unsplash.com");

/** A partner is shown only when active (a missing flag counts as active). */
export const isActivePartner = (r: any) => r && r.active !== false && r.active !== "false" && r.status !== "inactive";
