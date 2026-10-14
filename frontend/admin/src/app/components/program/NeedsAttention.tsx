/**
 * Program › Overview › "Needs attention", grouped by fight night (claude/updates/program-needs-attention.md):
 * one card per fight night with a few plain lines — "Results to record: 5", "Bouts without referee or judges: 2" —
 * each with its one button, instead of one row per bout. Things that belong to no fight night (vacant titles) come last.
 * English + Khmer; the counts come from the same to-dos as the dashboard and the bell.
 */
import { useMemo, useState } from "react";
import { Link } from "react-router";
import { AlertCircle, CalendarDays, ChevronRight, Crown } from "lucide-react";
import type { TextKey } from "../../i18n/program";
import { formatDay, useT } from "../../i18n/program";
import type { TodoItem, TodoKind } from "../../hooks/useAdminOverview";

/** The to-dos the Program shows, in the order a fight night needs them. */
export const PROGRAM_TODOS: TodoKind[] = ["replacement", "dispute", "signoff", "agreementWaiting", "result", "noOfficials", "unconfirmed", "draftEvent", "emptyEvent", "vacantTitle"];

interface Line { key: string; text: string; action: string; href: string }
interface Night { id: string; name: string; date: string | null; rank: number; lines: Line[] }

const SHOW = 4;

export function NeedsAttention({ todos, limit = SHOW, bare = false }: { todos: TodoItem[]; /** Cards shown before "Show more"; Infinity shows all. */ limit?: number; /** No heading (the page already has a tab with that name). */ bare?: boolean }) {
  const { t, lang } = useT();
  const [all, setAll] = useState(false);

  const { nights, vacant } = useMemo(() => {
    const byNight = new Map<string, TodoItem[]>();
    const vacantTitles: TodoItem[] = [];
    for (const x of todos.filter((x) => PROGRAM_TODOS.includes(x.kind))) {
      if (x.kind === "vacantTitle") vacantTitles.push(x);
      else if (x.eventId) byNight.set(x.eventId, [...(byNight.get(x.eventId) ?? []), x]);
    }
    const nights: Night[] = [...byNight.entries()].map(([id, items]) => {
      const of = (k: TodoKind) => items.filter((x) => x.kind === k);
      const lines: Line[] = [];
      const replacements = of("replacement");
      if (replacements.length) lines.push({ key: "replacement", text: t("na.replacement", { n: replacements.length }), action: t("ch.choose"), href: replacements[0].href });
      const disputes = of("dispute");
      if (disputes.length) lines.push({ key: "dispute", text: t("na.disputes", { n: disputes.length }), action: t("na.resolve"), href: disputes[0].href });
      const signoff = of("signoff");
      if (signoff.length) lines.push({ key: "signoff", text: t("na.signoff"), action: t("so.b.signoff"), href: signoff[0].href });
      const agreements = of("agreementWaiting");
      if (agreements.length) {
        const what = agreements.map((x) => t(x.info?.note ?? "todo.note.agreementDetails")).join(", ");
        lines.push({ key: "agreement", text: t("na.agreement", { what }), action: t("na.review"), href: agreements[0].href });
      }
      const results = of("result");
      if (results.length) lines.push({ key: "result", text: t("na.results", { n: results.length }), action: t("na.recordResults"), href: results[0].href });
      const officials = of("noOfficials");
      if (officials.length) lines.push({ key: "officials", text: t("na.officials", { n: officials.length }), action: t("card.officials"), href: officials[0].href });
      const weigh = of("unconfirmed");
      if (weigh.length) lines.push({ key: "weigh", text: t("na.weighin", { n: weigh.length }), action: t("card.weighin"), href: weigh[0].href });
      const draft = of("draftEvent");
      if (draft.length) lines.push({ key: "draft", text: t("na.draft"), action: t("ov.openTodo"), href: draft[0].href });
      const empty = of("emptyEvent");
      if (empty.length) lines.push({ key: "empty", text: t("na.noBouts"), action: t("ov.openTodo"), href: empty[0].href });
      return { id, name: items[0].eventName ?? "", date: items[0].eventDate ?? null, rank: Math.min(...items.map((x) => x.rank)), lines };
    });
    // Most urgent first, then the soonest date.
    nights.sort((a, b) => a.rank - b.rank || String(a.date ?? "").localeCompare(String(b.date ?? "")));
    return { nights, vacant: vacantTitles };
  }, [todos, t]);

  if (nights.length === 0 && vacant.length === 0) return null;
  const shown = all ? nights : nights.slice(0, limit);
  const count = nights.length + (vacant.length ? 1 : 0);

  return (
    <section aria-labelledby="attention" className="space-y-3">
      <div className={bare ? "sr-only" : undefined}>
        <h2 id="attention" className="text-lg font-bold text-slate-900 flex items-center gap-2">
          <AlertCircle className="w-5 h-5 text-amber-600" aria-hidden /> {t("ov.attention")} <span className="text-slate-500 font-semibold">({count})</span>
        </h2>
        <p className="text-sm text-slate-600">{t("na.hint")}</p>
      </div>

      <ul className="space-y-3">
        {shown.map((n) => (
          <li key={n.id} className="rounded-2xl border border-slate-200 bg-white overflow-hidden">
            <div className="flex flex-wrap items-center justify-between gap-2 px-4 py-3 bg-slate-50 border-b border-slate-100">
              <p className="min-w-0">
                <span className="block text-base font-bold text-slate-900 break-words">{n.name}</span>
                {n.date && <span className="inline-flex items-center gap-1.5 text-sm text-slate-600"><CalendarDays className="w-4 h-4" aria-hidden /> {formatDay(n.date, lang)}</span>}
              </p>
              <Link to={`/home/events/${n.id}`} className="inline-flex items-center gap-1 text-sm font-semibold text-primary hover:underline">{t("ov.open")} <ChevronRight className="w-4 h-4" aria-hidden /></Link>
            </div>
            <ul className="divide-y divide-slate-100">
              {n.lines.map((l) => (
                <li key={l.key} className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 px-4 py-3">
                  <span className="text-base text-slate-800 break-words">{l.text}</span>
                  <Link to={l.href} className="shrink-0 inline-flex items-center justify-center gap-1.5 h-10 px-4 rounded-xl bg-primary/10 text-primary text-sm font-semibold hover:bg-primary/15">
                    {l.action} <ChevronRight className="w-4 h-4" aria-hidden />
                  </Link>
                </li>
              ))}
            </ul>
          </li>
        ))}

        {vacant.length > 0 && (
          <li className="rounded-2xl border border-slate-200 bg-white overflow-hidden">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 px-4 py-3">
              <span className="flex items-center gap-2 text-base text-slate-800"><Crown className="w-5 h-5 text-amber-600 shrink-0" aria-hidden /> {t("na.vacant", { n: vacant.length })}</span>
              <Link to="/home/titles" className="shrink-0 inline-flex items-center justify-center gap-1.5 h-10 px-4 rounded-xl bg-primary/10 text-primary text-sm font-semibold hover:bg-primary/15">
                {t("ov.openTitles")} <ChevronRight className="w-4 h-4" aria-hidden />
              </Link>
            </div>
          </li>
        )}
      </ul>

      {nights.length > limit && (
        <button type="button" onClick={() => setAll((a) => !a)} className="h-10 px-4 rounded-xl border border-slate-300 bg-white text-sm font-semibold text-slate-700 hover:border-primary hover:text-primary">
          {all ? t("na.fewer") : t("na.more", { n: nights.length - limit })}
        </button>
      )}
    </section>
  );
}
