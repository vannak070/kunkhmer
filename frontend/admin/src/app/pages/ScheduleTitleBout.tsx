/**
 * "Schedule a title bout" (/home/champion/:id/schedule-defense, /home/match/new): a title fight is a bout on a fight
 * card, so pick the upcoming fight card it belongs to and continue to "Add bout" with the title already chosen.
 * No upcoming fight night yet → a button to create one. English + Khmer.
 * See claude/updates/admin-step3-simple-pages.md.
 */
import { useEffect, useMemo, useState } from "react";
import { Link, useParams, useSearchParams } from "react-router";
import { ArrowLeft, CalendarDays, ChevronRight, MapPin, Plus, Trophy } from "lucide-react";
import { api } from "../utils/api";
import { formatDay, useT } from "../i18n/program";
import { LangSwitch } from "../components/program/shared";
import { holderName, titleHeld } from "../components/titles/titleUtils";

export function ScheduleTitleBout() {
  const { id } = useParams();
  const [params] = useSearchParams();
  const { t, lang } = useT();
  const championId = id ?? params.get("championId") ?? "";
  const [cards, setCards] = useState<any[] | null>(null);
  const [failed, setFailed] = useState(false);
  const [title, setTitle] = useState<any | null>(null);

  const load = () => {
    setFailed(false);
    api.batches.list().then((b: any[]) => setCards(b || [])).catch(() => setFailed(true));
    if (championId) api.champions.get(championId).then(setTitle).catch(() => setTitle(null));
  };
  useEffect(load, [championId]);

  const upcoming = useMemo(() => {
    const today = new Date(new Date().toISOString().slice(0, 10)).getTime();
    return (cards ?? [])
      .filter((b) => new Date(String(b.date).slice(0, 10)).getTime() >= today && !["Complete", "Completed", "Cancelled"].includes(b.status))
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }, [cards]);

  const addBoutUrl = (cardId: string) => `/home/matches/${cardId}/create-match${championId ? `?championId=${championId}` : ""}`;
  const back = championId ? `/home/champion/${championId}` : "/home/titles";

  return (
    <div className="max-w-3xl mx-auto p-4 md:p-8 space-y-6">
      <div className="flex items-center justify-between gap-3">
        <Link to={back} className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-primary">
          <ArrowLeft className="w-4 h-4" aria-hidden /> {t("common.back")}
        </Link>
        <LangSwitch />
      </div>

      <header className="flex items-start gap-3">
        <span className="w-12 h-12 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center shrink-0" aria-hidden><Trophy className="w-6 h-6" /></span>
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-slate-900">{t("td.schedule")}</h1>
          <p className="text-base text-slate-600 mt-1">{t("sb.lead")}</p>
        </div>
      </header>

      {title && (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 px-5 py-4">
          <p className="text-sm font-semibold text-amber-800">{t("sb.title")}</p>
          <p className="text-lg font-bold text-slate-900 break-words">{title.title_name}</p>
          <p className="text-sm text-slate-700">{titleHeld(title) ? t("sb.champion", { name: holderName(title) }) : t("sb.vacant")}</p>
        </div>
      )}

      <section className="space-y-3">
        <h2 className="text-lg font-bold text-slate-900">{t("sb.upcoming")}</h2>
        {failed ? (
          <div role="alert" className="rounded-2xl border border-amber-200 bg-amber-50 p-6 text-center space-y-3">
            <p className="text-amber-900">{t("list.loadFailed")}</p>
            <button type="button" onClick={load} className="h-11 px-5 rounded-xl bg-primary text-white text-sm font-semibold hover:opacity-90">{t("common.tryAgain")}</button>
          </div>
        ) : !cards ? (
          <div className="rounded-2xl border border-slate-200 bg-white p-8 flex justify-center"><div className="w-7 h-7 border-2 border-primary border-t-transparent rounded-full animate-spin" aria-label={t("common.loading")} /></div>
        ) : upcoming.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center space-y-3">
            <p className="text-base font-medium text-slate-800">{t("sb.none")}</p>
            <p className="text-sm text-slate-600">{t("sb.noneHint")}</p>
            <Link to="/home/events/new" className="inline-flex items-center gap-2 h-11 px-5 rounded-xl bg-primary text-white text-sm font-semibold hover:opacity-90">
              <Plus className="w-4 h-4" aria-hidden /> {t("list.new")}
            </Link>
          </div>
        ) : (
          <ul className="space-y-3">
            {upcoming.map((b) => (
              <li key={b.id}>
                <Link to={addBoutUrl(b.id)} className="group flex items-center gap-4 rounded-2xl border border-slate-200 bg-white p-4 hover:border-primary hover:shadow-sm">
                  <span className="w-12 h-12 rounded-xl bg-[#eef3fb] text-primary flex items-center justify-center shrink-0" aria-hidden><CalendarDays className="w-5 h-5" /></span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-base font-semibold text-slate-900 break-words">{b.event_name || b.name}</span>
                    <span className="block text-sm text-slate-600">{b.name} · {formatDay(b.date, lang)}</span>
                    {b.location && <span className="flex items-center gap-1 text-sm text-slate-500"><MapPin className="w-3.5 h-3.5 shrink-0" aria-hidden /><span className="break-words">{b.location}</span></span>}
                  </span>
                  <span className="hidden sm:inline-flex items-center gap-1 text-sm font-semibold text-primary">{t("sb.add")} <ChevronRight className="w-4 h-4" aria-hidden /></span>
                  <ChevronRight className="sm:hidden w-5 h-5 text-slate-400" aria-hidden />
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
