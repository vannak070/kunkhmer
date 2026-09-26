/**
 * Helpers that turn admin/back-office values into what a public visitor should see.
 * Keep internal workflow wording (Draft, Published, system accounts) out of the public site.
 */

import type { MessageKey } from "../i18n/messages";

const SYSTEM_ACCOUNT_NAMES = new Set([
  "system administrator",
  "administrator",
  "admin",
  "system",
  "superadmin",
  "super admin",
]);

export const FEDERATION_NAME = "Kun Khmer Federation";

export function isSystemAccount(name?: string | null): boolean {
  if (!name) return true;
  return SYSTEM_ACCOUNT_NAMES.has(name.trim().toLowerCase());
}

/** A person/organisation name safe to show publicly, or the fallback when it is a system account. */
export function publicName(name?: string | null, fallback: string | null = FEDERATION_NAME): string | null {
  return isSystemAccount(name) ? fallback : name!.trim();
}

export type PublicStatusTone = "live" | "scheduled" | "pending" | "completed" | "neutral";

export interface PublicStatus {
  label: string;
  /** i18n key for the label (see i18n/messages.ts). */
  labelKey: MessageKey;
  tone: PublicStatusTone;
}

/**
 * Map an admin status (event, fight card or bout) to a visitor-facing label.
 * Returns null for statuses that carry no information for fans (e.g. "Published").
 */
export function publicStatus(status?: string | null): PublicStatus | null {
  const s = (status || "").trim().toLowerCase();
  switch (s) {
    case "live":
    case "ongoing":
    case "in progress":
      return { label: "Live", labelKey: "status.live", tone: "live" };
    case "completed":
    case "finished":
      return { label: "Completed", labelKey: "status.completed", tone: "completed" };
    case "weight-in":
    case "weigh-in":
      return { label: "Weigh-in", labelKey: "status.weighIn", tone: "scheduled" };
    case "ready":
    case "ready to fight":
      return { label: "Confirmed", labelKey: "status.confirmed", tone: "scheduled" };
    case "draft":
    case "pending":
    case "proposed":
    case "proposal":
      return { label: "To be confirmed", labelKey: "status.pending", tone: "pending" };
    case "cancelled":
    case "canceled":
      return { label: "Cancelled", labelKey: "status.cancelled", tone: "neutral" };
    default:
      // "published", "approved", "scheduled", "upcoming" and anything unknown: nothing to show.
      return null;
  }
}

export function isCompletedStatus(status?: string | null): boolean {
  return publicStatus(status)?.tone === "completed";
}

export function pluralize(count: number, singular: string, plural = `${singular}s`): string {
  return `${count} ${count === 1 ? singular : plural}`;
}

/** Estimated reading time. Khmer has no spaces between words, so count its characters separately. */
export function readTimeMinutes(text?: string | null): number {
  if (!text) return 1;
  const khmerChars = (text.match(/[ក-៿]/g) || []).length;
  const latinWords = text.replace(/[ក-៿]/g, " ").split(/\s+/).filter(Boolean).length;
  // ~200 words/min for Latin script, ~5 Khmer characters per word.
  return Math.max(1, Math.round((latinWords + khmerChars / 5) / 200));
}

export function readTimeLabel(text?: string | null): string {
  return `${readTimeMinutes(text)} min read`;
}

/** Only show durations that look like a real clock value (mm:ss or h:mm:ss). */
export function formatVideoDuration(duration?: string | null): string | null {
  if (!duration) return null;
  const d = duration.trim();
  if (!/^\d{1,2}(:\d{2}){1,2}$/.test(d) || /^0{1,2}:00$/.test(d)) return null;
  return d;
}

/** "1.2K views", or null when there are no views yet (don't advertise "0 views"). */
export function formatViews(views?: number | string | null): string | null {
  const n = typeof views === "string" ? parseInt(views, 10) : views ?? 0;
  if (!n || isNaN(n) || n <= 0) return null;
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1).replace(/\.0$/, "")}M views`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1).replace(/\.0$/, "")}K views`;
  return `${n} ${n === 1 ? "view" : "views"}`;
}

export function formatPublicDate(date?: string | null, style: "short" | "long" = "short"): string {
  if (!date) return "";
  const d = new Date(date);
  if (isNaN(d.getTime())) return "";
  return d.toLocaleDateString("en-US",
    style === "long"
      ? { weekday: "long", month: "long", day: "numeric", year: "numeric" }
      : { month: "short", day: "numeric", year: "numeric" });
}

/**
 * The script a piece of content is written in, for its lang attribute. Content from the
 * database can be English or Khmer regardless of the site language, so mark it explicitly:
 * fonts, line height and screen-reader voice all follow it.
 */
export function textLang(text?: string | null): "km" | "en" | undefined {
  if (!text) return undefined;
  const khmer = (text.match(/[\u1780-\u17FF]/g) || []).length;
  const latin = (text.match(/[A-Za-z]/g) || []).length;
  if (!khmer && !latin) return undefined;
  return khmer > latin ? "km" : "en";
}
