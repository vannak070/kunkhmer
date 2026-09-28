/**
 * News articles can have an optional English version (title_en / subtitle_en / content_en) next to
 * the main text, which is often Khmer. The English site shows the English version when there is one;
 * the Khmer site shows the main text. See claude/updates/event-compare-articles.md.
 */
import { textLang } from "../utils/publicDisplay";

export interface ArticleText {
  title: string;
  excerpt?: string;
  content?: string;
  titleEn?: string | null;
  excerptEn?: string | null;
  contentEn?: string | null;
}

export const hasEnglish = (a: ArticleText) => Boolean(a.titleEn || a.contentEn);

/** The version to show: English on the English site when available (unless the reader asked for the original). */
export function articleVersion<T extends ArticleText>(a: T, lang: "en" | "km", original = false) {
  const english = lang === "en" && hasEnglish(a) && !original;
  const title = english ? a.titleEn || a.title : a.title;
  return {
    title,
    excerpt: english ? a.excerptEn || "" : a.excerpt || "",
    content: english ? a.contentEn || a.content || "" : a.content || "",
    english,
    /** Language of the text shown, for the lang attribute and the "Article in Khmer" label. */
    textLang: english ? ("en" as const) : textLang(`${a.title} ${a.content ?? ""}`),
  };
}

/** Raw API row → the fields above. */
export const articleTextFrom = (row: any): Pick<ArticleText, "titleEn" | "excerptEn" | "contentEn"> => ({
  titleEn: row.title_en || null,
  excerptEn: row.subtitle_en || null,
  contentEn: row.content_en || null,
});
