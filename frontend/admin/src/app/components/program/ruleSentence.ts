/**
 * KKF matching-rule hits in plain English / Khmer (claude/updates/rule-messages.md). The server sends each hit with
 * its fighter and plain values (`params`); the sentence is built here so Khmer officers read Khmer, with the
 * fighter's Khmer name. Unknown rules fall back to the server's English message.
 */
import { type TextKey, formatDay } from "../../i18n/program";

export interface RuleHit {
  key: string;
  label: string;
  action: "block" | "warn";
  message: string;
  fighter_id: string | null;
  params: Record<string, string | number | null>;
}

type T = (key: TextKey, vars?: Record<string, string | number>) => string;

/** Rules about the two fighters together (the fix is to change one of them). */
export const PAIR_RULES = ["same_gender", "grade_gap", "record_gap", "same_club"];
/** Rules the officer fixes on the fighter's own page (medical record, suspension). */
export const FIGHTER_PAGE_RULES = ["medical", "suspension"];

export function ruleSentence(t: T, lang: "en" | "km", hit: RuleHit, nameOf: (id: string | null | undefined, fallback: string) => string): string {
  const p = hit.params ?? {};
  const num = (k: string) => (typeof p[k] === "number" ? (p[k] as number) : Number(p[k] ?? 0));
  const name = nameOf(hit.fighter_id, String(p.name ?? ""));
  const a = nameOf(p.a_id as string, String(p.a_name ?? ""));
  const b = nameOf(p.b_id as string, String(p.b_name ?? ""));
  switch (hit.key) {
    case "medical":
      return p.reason === "injured" ? t("rl.injured", { name }) : t("rl.medical", { name });
    case "suspension":
      return p.reason === "marked" ? t("rl.suspendedMarked", { name }) : t("rl.suspended", { name, date: formatDay(String(p.date ?? ""), lang, false) });
    case "same_gender":
      return t("rl.gender");
    case "min_age":
      return t("rl.age", { name, limit: num("limit") });
    case "weight_gap":
      return t("rl.weight", { name, kg: num("kg"), agreed: num("agreed"), gap: num("gap"), limit: num("limit") });
    case "grade_gap":
      return t("rl.grade", { a: String(p.grade_a ?? ""), b: String(p.grade_b ?? ""), gap: num("gap"), limit: num("limit") });
    case "record_gap":
      return t("rl.record", { a, b, wa: num("wins_a"), wb: num("wins_b"), limit: num("limit") });
    case "rest_days":
      return t("rl.rest", { name, date: formatDay(String(p.date ?? ""), lang, false), limit: num("limit") });
    case "same_club":
      return t("rl.club", { a, b });
    case "already_booked":
      return t("rl.booked", { name });
    case "title_list":
      return p.reason === "not_listed" ? t("bout.warnTitleOff") : t("bout.warnTitleUnconfirmed");
    default:
      return hit.message;
  }
}
