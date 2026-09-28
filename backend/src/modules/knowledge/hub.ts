/**
 * Turns the published knowledge articles into the "Federation knowledge base" part of the
 * KUNKHMER HUB system prompt. Built once and reused until an article changes, so the prompt
 * cache stays warm. Only Published rows are used, and Khmer text only once it's reviewed.
 */
import { prisma } from "../../db.ts";

export const CATEGORIES = ["history", "rules", "techniques", "culture", "glossary", "regulations", "faq"] as const;
export type Category = (typeof CATEGORIES)[number];

const CATEGORY_TITLE: Record<Category, string> = {
  history: "History",
  rules: "Rules and scoring",
  techniques: "Techniques",
  culture: "Kun Kru and music",
  glossary: "Glossary",
  regulations: "Federation regulations",
  faq: "Frequently asked questions",
};

/** Above this the prompt gets expensive; move to a search tool (see features/knowledge-base.md). */
const WARN_TOKENS = 50_000;

let cached: Promise<string> | null = null;

/** Call after any publish, unpublish, edit or delete of a published article. */
export function invalidateKnowledge() {
  cached = null;
}

async function build(): Promise<string> {
  const rows = await prisma.knowledgeArticle.findMany({
    where: { status: "Published" },
    orderBy: [{ sort_order: "asc" }, { title_en: "asc" }],
  });
  if (rows.length === 0) return "";

  const sections = [...rows]
    .sort((a, b) => CATEGORIES.indexOf(a.category as Category) - CATEGORIES.indexOf(b.category as Category))
    .map((r) => {
      const parts = [`### ${r.title_en} (${CATEGORY_TITLE[r.category as Category] ?? r.category})`, r.body_en.trim()];
      if (r.km_reviewed && r.body_km?.trim()) {
        parts.push(`Approved Khmer wording — ${r.title_km ?? r.title_en}:`, r.body_km.trim());
      }
      return parts.join("\n");
    });

  const text = sections.join("\n\n");
  const approxTokens = Math.round(text.length / 3);
  if (approxTokens > WARN_TOKENS) {
    console.warn(`[hub] knowledge base is ~${approxTokens} tokens; consider a search_knowledge tool`);
  }
  return text;
}

/** The published knowledge as prompt text ("" when nothing is published). */
export function knowledgeText(): Promise<string> {
  cached ??= build().catch((err) => {
    cached = null;
    throw err;
  });
  return cached;
}
