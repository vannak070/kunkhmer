/**
 * Weekly checks panel on Matches › Week (claude/updates/weekly-checks.md): what to fix and what to look at before the
 * week's program sheets are printed and signed. Sentences are written here in English / Khmer from the API's params.
 */
import { useState } from "react";
import { Link } from "react-router";
import { AlertTriangle, CheckCircle2, ChevronDown, OctagonAlert } from "lucide-react";
import { type TextKey, formatDay, khmerDigits, useT } from "../../i18n/program";

export interface WeekCheck {
  kind: string;
  level: "problem" | "warning";
  event_id: string | null;
  match_id: string | null;
  fighter_id: string | null;
  params: Record<string, any>;
}

export interface WeekCheckResult {
  problems: number;
  warnings: number;
  checks: WeekCheck[];
}

export function WeekChecks({ data, failed }: { data: WeekCheckResult | null; failed: boolean }) {
  const { t, lang } = useT();
  const [open, setOpen] = useState(true);
  const n = (v: number | string) => (lang === "km" ? khmerDigits(v) : String(v));
  const day = (d: string | null) => (d ? formatDay(d, lang, false) : "");

  if (failed) return <p className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">{t("wc.failed")}</p>;
  if (!data) return null;
  if (data.checks.length === 0)
    return (
      <p className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm font-semibold text-emerald-800 flex items-center gap-2">
        <CheckCircle2 className="w-5 h-5 shrink-0" aria-hidden /> {t("wc.clear")}
      </p>
    );

  const sentence = (c: WeekCheck) => {
    const p = c.params;
    switch (c.kind) {
      case "double_booked":
        return t("wc.double_booked", { name: p.name, n: n(p.events.length), events: p.events.map((e: string, i: number) => `${e} (${day(p.dates[i])})`).join(", ") });
      case "broadcaster_clash":
      case "venue_clash":
        return t(`wc.${c.kind}` as TextKey, { broadcaster: p.broadcaster ?? "", venue: p.venue ?? "", a: p.events[0], b: p.events[1], ta: n(p.times[0]), tb: n(p.times[1]), date: day(p.date) });
      case "over_weight":
        return t("wc.over_weight", { name: p.name, kg: n(p.kg), agreed: n(p.agreed), event: p.event });
      case "weight_gap":
        return t("wc.weight_gap", { name: p.name, kg: n(p.kg), gap: n(p.gap), agreed: n(p.agreed), event: p.event });
      case "empty_corner":
        return t("wc.empty_corner", { bout: p.bout, event: p.event });
      case "no_officials":
        return t("wc.no_officials", { event: p.event, n: n(p.bouts) });
      default:
        return t(`wc.${c.kind}` as TextKey, { event: p.event });
    }
  };
  const link = (c: WeekCheck) => (c.match_id ? `/home/match/${c.match_id}` : c.kind === "double_booked" && c.fighter_id ? `/home/fighters/${c.fighter_id}` : c.event_id ? `/home/events/${c.event_id}` : null);

  // Problems one per line; a match's warnings on one line ("Show X: no start time · still a draft · 2 without officials").
  const GROUPED = ["no_time", "not_published", "no_bouts", "no_officials", "empty_corner", "weight_gap"];
  const problems = data.checks.filter((c) => c.level === "problem" || !GROUPED.includes(c.kind));
  const byMatch = new Map<string, WeekCheck[]>();
  for (const c of data.checks) if (c.level === "warning" && GROUPED.includes(c.kind) && c.event_id) byMatch.set(c.event_id, [...(byMatch.get(c.event_id) ?? []), c]);
  const short = (list: WeekCheck[]) =>
    GROUPED.flatMap((kind) => {
      const of = list.filter((c) => c.kind === kind);
      if (!of.length) return [];
      const count = kind === "no_officials" ? of[0].params.bouts : of.length;
      return [t(`wc.s.${kind}` as TextKey, { n: n(count) })];
    }).join(" · ");

  return (
    <section aria-label={t("wc.title")} className={`rounded-2xl border p-4 space-y-3 ${data.problems ? "border-red-200 bg-red-50/40" : "border-amber-200 bg-amber-50/40"}`}>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="font-bold text-slate-900 flex items-center gap-2">
          {data.problems ? <OctagonAlert className="w-5 h-5 text-red-600" aria-hidden /> : <AlertTriangle className="w-5 h-5 text-amber-600" aria-hidden />}
          {t("wc.title")}: {t("wc.summary", { p: n(data.problems), w: n(data.warnings) })}
        </p>
        <button type="button" onClick={() => setOpen((o) => !o)} aria-expanded={open} className="inline-flex items-center gap-1 text-sm font-semibold text-primary">
          {open ? t("wc.hide") : t("wc.show")} <ChevronDown className={`w-4 h-4 transition ${open ? "rotate-180" : ""}`} aria-hidden />
        </button>
      </div>
      {open && (
        <ul className="space-y-1.5">
          {problems.map((c, i) => {
            const to = link(c);
            const text = sentence(c);
            return (
              <li key={`${c.kind}-${i}`} className="flex items-start gap-2 text-sm">
                <span className={`mt-0.5 shrink-0 rounded-full px-2 py-0.5 text-xs font-bold ${c.level === "problem" ? "bg-red-100 text-red-800" : "bg-amber-100 text-amber-900"}`}>{t(c.level === "problem" ? "wc.problem" : "wc.warning")}</span>
                {to ? <Link to={to} className="text-slate-800 hover:text-primary hover:underline">{text}</Link> : <span className="text-slate-800">{text}</span>}
              </li>
            );
          })}
          {[...byMatch.entries()].map(([eventId, list]) => (
            <li key={`w-${eventId}`} className="flex items-start gap-2 text-sm">
              <span className="mt-0.5 shrink-0 rounded-full px-2 py-0.5 text-xs font-bold bg-amber-100 text-amber-900">{t("wc.warning")}</span>
              <Link to={`/home/events/${eventId}`} className="text-slate-800 hover:text-primary hover:underline"><strong className="font-semibold">{list[0].params.event}</strong>: {short(list)}</Link>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

/** The worst level of the checks that concern one match (for the dot on its card). */
export function levelFor(checks: WeekCheck[] | undefined, eventId: string): "problem" | "warning" | null {
  const mine = (checks ?? []).filter((c) => c.event_id === eventId || (Array.isArray(c.params.event_ids) && c.params.event_ids.includes(eventId)));
  return mine.some((c) => c.level === "problem") ? "problem" : mine.length ? "warning" : null;
}
