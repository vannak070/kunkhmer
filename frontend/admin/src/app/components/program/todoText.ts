/**
 * Writes a dashboard to-do in the chosen language from the facts it carries (names, event, date, what is
 * missing). To-dos without facts (kinds that only exist with approvals on) keep their English text.
 * See claude/updates/dashboard-khmer.md.
 */
import type { TodoItem } from "../../hooks/useAdminOverview";
import { formatDay, type Lang, type TextKey } from "../../i18n/program";

type T = (key: TextKey, vars?: Record<string, string | number>) => string;

/** "A vs B" for a bout, otherwise the name as staff typed it. */
export function todoTitle(item: TodoItem, t: T): string {
  return item.info?.pair ? `${item.info.pair[0]} ${t("common.vs")} ${item.info.pair[1]}` : item.title;
}

export function todoDetail(item: TodoItem, t: T, lang: Lang): string {
  const info = item.info;
  if (!info) return item.detail;
  const who = info.who?.length ? info.who.join(` ${t("common.and")} `) : t("todo.note.fighters");
  // English keeps the browser's own date format, as before; Khmer is written out by hand.
  const day = (d: string) =>
    lang === "km" ? formatDay(d, "km", false) : new Date(d).toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" });
  const date = info.date === undefined ? null : info.date ? day(info.date) : t("todo.noDate");
  return [...(info.lead ?? []), date, t(info.note, { who })].filter(Boolean).join(" · ");
}
