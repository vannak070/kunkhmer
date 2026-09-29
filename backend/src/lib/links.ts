/**
 * Public page links, the same rules as the fan site (frontend/public: data/masterData.ts
 * getFighterSlug, data/partners.ts partnerSlug, data/links.ts eventPath / articlePath), so the
 * sitemap and KUNKHMER HUB answers link to the pages fans see.
 */

/** Fighters, clubs, sponsors, broadcasters: the name as a slug ("Cambodia Beer" → "cambodia-beer"). */
export function nameSlug(row: { id: string; name?: string | null }): string {
  if (!row.name) return row.id;
  return encodeURIComponent(row.name.toLowerCase().trim().replace(/[\s_-]+/g, "-")) || row.id;
}

/** "KOMBAT X KUN KHMER" → "kombat-x-kun-khmer"; "" when there are no Latin letters or digits. */
export function linkWords(text?: string | null): string {
  return (text ?? "")
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60)
    .replace(/-+$/, "");
}

const day = (d?: Date | string | null) => (d ? (d instanceof Date ? d.toISOString() : String(d)).slice(0, 10) : "");

const linkKey = (id: string, words: string, date?: Date | string | null) => [words || day(date), id.slice(0, 8)].filter(Boolean).join("-");

/** /events/<name words or date>-<first 8 of id> */
export const eventPath = (e: { id: string; name?: string | null; date?: Date | string | null }) =>
  `/events/${linkKey(e.id, linkWords(e.name), e.date)}`;

/** /news/<English or main title words, or the date>-<first 8 of id> */
export const articlePath = (a: { id: string; title?: string | null; title_en?: string | null; publish_date?: Date | string | null }) =>
  `/news/${linkKey(a.id, linkWords(a.title_en) || linkWords(a.title), a.publish_date)}`;

/** /champions/<title words>-<first 8 of id> */
export const championPath = (c: { id: string; title_name?: string | null }) =>
  `/champions/${linkKey(c.id, linkWords(c.title_name), null)}`;
