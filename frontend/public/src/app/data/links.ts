/**
 * Readable links for event and news pages: /events/<words>-<code> and /news/<words>-<code>, e.g.
 * /news/kombat-x-kun-khmer-b21c3120. The words come from the name (the English title for news when
 * there is one); a name without Latin letters (Khmer only) uses the date instead. The code is the
 * first 8 characters of the id, so a shared link keeps working after the name is corrected.
 * The full id still works (old links). Same rule as the backend's lib/links.ts (sitemap, Hub links).
 */

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

const day = (d?: string | null) => (d ? String(d).slice(0, 10) : "");

function linkKey(id: string, words: string, date?: string | null): string {
  return [words || day(date), id.slice(0, 8)].filter(Boolean).join("-");
}

type EventLike = { id: string; name?: string | null; date?: string | null };
type ArticleLike = { id: string; title?: string | null; title_en?: string | null; titleEn?: string | null; date?: string | null; publish_date?: string | null };

export function eventPath(e: EventLike): string {
  return `/events/${linkKey(e.id, linkWords(e.name), e.date)}`;
}

export function articlePath(a: ArticleLike): string {
  const words = linkWords(a.title_en || a.titleEn) || linkWords(a.title);
  return `/news/${linkKey(a.id, words, a.publish_date || a.date)}`;
}

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/** The row a link points to: by full id (old links) or by the 8-character code at the end. */
export function findByLink<T extends { id: string }>(rows: T[] | null | undefined, key?: string): T | undefined {
  if (!rows || !key) return undefined;
  if (UUID.test(key)) return rows.find((r) => r.id === key);
  const code = key.match(/(?:^|-)([0-9a-f]{8})$/i)?.[1]?.toLowerCase();
  return code ? rows.find((r) => r.id.toLowerCase().startsWith(code)) : undefined;
}

/** An event's link when only its id is at hand (looked up in the loaded events; the full id works too). */
export function eventPathById(events: EventLike[] | null | undefined, id: string): string {
  const e = events?.find((x) => x.id === id);
  return e ? eventPath(e) : `/events/${id}`;
}

type TitleLike = { id: string; title_name?: string | null };

/** /champions/<title words>-<code>, e.g. /champions/kkf-national-60kg-3c50f26f. */
export function championPath(c: TitleLike): string {
  return `/champions/${linkKey(c.id, linkWords(c.title_name), null)}`;
}
