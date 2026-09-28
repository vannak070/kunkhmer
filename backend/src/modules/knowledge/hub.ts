/**
 * The published knowledge articles as KUNKHMER HUB sees them. Only Published rows are used,
 * and Khmer text only once it's reviewed.
 *
 * - Small knowledge base: every article goes into the cached system prompt ("inline").
 * - Large knowledge base: the prompt gets only a short index of titles, and the Hub reads the
 *   2–3 articles it needs through the `search_knowledge` tool, so each question stays cheap.
 *
 * Built once and reused until an article changes, so the prompt cache stays warm.
 */
import { prisma } from "../../db.ts";

export const CATEGORIES = ["history", "organisations", "people", "rules", "techniques", "culture", "glossary", "regulations", "faq"] as const;
export type Category = (typeof CATEGORIES)[number];

const CATEGORY_TITLE: Record<Category, string> = {
  history: "History",
  organisations: "Organisations and events",
  people: "Legends and famous fighters",
  rules: "Rules and scoring",
  techniques: "Techniques",
  culture: "Culture, Kun Kru and music",
  glossary: "Glossary",
  regulations: "Federation regulations",
  faq: "Frequently asked questions",
};

/** Up to this size (≈ tokens) all articles go into the prompt; above it, index + search tool. */
const INLINE_MAX_TOKENS = 12_000;
const approxTokens = (text: string) => Math.round(text.length / 3);

interface Article {
  slug: string;
  category: string;
  title: string;
  titleKm: string | null;
  text: string;
  textKm: string | null;
  /** Lower-cased title + all text (incl. unreviewed Khmer) — used only for matching, never shown. */
  haystack: { title: string; body: string };
}

export interface Knowledge {
  mode: "none" | "inline" | "index";
  /** Prompt text: every article (inline) or the list of titles (index). */
  prompt: string;
  articles: Article[];
}

let cached: Promise<Knowledge> | null = null;

/** Call after any publish, unpublish, edit or delete of a published article. */
export function invalidateKnowledge() {
  cached = null;
}

const categoryRank = (c: string) => {
  const i = CATEGORIES.indexOf(c as Category);
  return i === -1 ? CATEGORIES.length : i;
};

function articleText(a: Article) {
  const parts = [`### ${a.title} (${CATEGORY_TITLE[a.category as Category] ?? a.category})`, a.text];
  if (a.textKm) parts.push(`Approved Khmer wording — ${a.titleKm ?? a.title}:`, a.textKm);
  return parts.join("\n");
}

async function build(): Promise<Knowledge> {
  const rows = await prisma.knowledgeArticle.findMany({
    where: { status: "Published" },
    orderBy: [{ sort_order: "asc" }, { title_en: "asc" }],
  });
  const articles: Article[] = rows
    .sort((a, b) => categoryRank(a.category) - categoryRank(b.category))
    .map((r) => ({
      slug: r.slug,
      category: r.category,
      title: r.title_en,
      titleKm: r.title_km,
      text: r.body_en.trim(),
      textKm: r.km_reviewed && r.body_km?.trim() ? r.body_km.trim() : null,
      haystack: {
        title: `${r.title_en} ${r.title_km ?? ""} ${r.slug.replace(/-/g, " ")}`.toLowerCase(),
        body: `${r.body_en} ${r.body_km ?? ""}`.toLowerCase(),
      },
    }));
  if (articles.length === 0) return { mode: "none", prompt: "", articles };

  const full = articles.map(articleText).join("\n\n");
  if (approxTokens(full) <= INLINE_MAX_TOKENS) return { mode: "inline", prompt: full, articles };

  const groups = new Map<string, Article[]>();
  for (const a of articles) groups.set(a.category, [...(groups.get(a.category) ?? []), a]);
  const index = [...groups.entries()]
    .map(([cat, list]) => `${CATEGORY_TITLE[cat as Category] ?? cat}:\n${list.map((a) => `- ${a.slug}: ${a.title}${a.titleKm ? ` / ${a.titleKm}` : ""}`).join("\n")}`)
    .join("\n\n");
  return { mode: "index", prompt: index, articles };
}

/** The published knowledge (mode "none" when nothing is published). */
export function knowledge(): Promise<Knowledge> {
  cached ??= build().catch((err) => {
    cached = null;
    throw err;
  });
  return cached;
}

// ─── Search (used by the search_knowledge tool) ─────────────────────────────

const STOP = new Set(
  "a an and are as at be by can do does for from how i in is it kun khmer me of on or the to was what when where which who why with you your about tell".split(" "),
);

/** Latin words (≥ 3 letters, not stop words) and Khmer runs, lower-cased. */
function terms(query: string): string[] {
  const q = query.toLowerCase();
  const latin = (q.match(/[a-z0-9]+/g) ?? []).filter((w) => w.length >= 3 && !STOP.has(w));
  // Khmer has no spaces between words: use each run, plus overlapping 3-letter pieces of long runs.
  const khmer: string[] = [];
  for (const run of q.match(/[ក-៿]+/g) ?? []) {
    if (run.length <= 4) khmer.push(run);
    else for (let i = 0; i + 3 <= run.length; i += 2) khmer.push(run.slice(i, i + 3));
  }
  return [...new Set([...latin, ...khmer])];
}

const count = (hay: string, needle: string) => {
  let n = 0;
  for (let i = hay.indexOf(needle); i !== -1; i = hay.indexOf(needle, i + needle.length)) n++;
  return n;
};

export async function searchKnowledge(query: string, opts: { slug?: string; category?: string; limit?: number } = {}) {
  const kb = await knowledge();
  if (kb.articles.length === 0) return { articles: [], note: "The federation hasn't published knowledge articles yet." };
  const pick = (a: Article) => ({ slug: a.slug, category: a.category, title: a.title, text: a.text, approved_khmer: a.textKm });

  if (opts.slug) {
    const a = kb.articles.find((x) => x.slug === opts.slug);
    return a ? { articles: [pick(a)] } : { articles: [], note: `No published article with slug "${opts.slug}".` };
  }
  const words = terms(query);
  const pool = opts.category ? kb.articles.filter((a) => a.category === opts.category) : kb.articles;
  // Rare words matter more than words found in almost every article (like "fight").
  const n = kb.articles.length;
  const weight = new Map(
    words.map((w) => {
      const df = kb.articles.filter((a) => a.haystack.title.includes(w) || a.haystack.body.includes(w)).length;
      // Words in more than half of the articles say nothing about which one is meant.
      return [w, df > n / 2 ? 0 : Math.log(1 + n / (1 + df))];
    }),
  );
  const scored = pool
    .map((a) => {
      const score = words.reduce(
        (s, w) => s + weight.get(w)! * (count(a.haystack.title, w) * 4 + Math.min(count(a.haystack.body, w), 4)),
        0,
      );
      return { a, score };
    })
    .filter((x) => x.score > 0)
    .sort((x, y) => y.score - x.score)
    .slice(0, Math.min(Math.max(opts.limit ?? 3, 1), 5));
  if (scored.length === 0) return { articles: [], note: "No published article matches; answer briefly from general background and say the federation hasn't published details." };
  return { articles: scored.map((x) => pick(x.a)) };
}
