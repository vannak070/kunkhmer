import { useState } from "react";
import { Link } from "react-router";
import { ArrowRight, Calendar, History, Swords, Trophy } from "lucide-react";
import { useI18n } from "../../i18n/LanguageContext";
import { fightHistory, nextBout, type FanData } from "../../data/fanData";
import { getFighterSlug } from "../../data/masterData";
import { CountdownChip, FormGuide, OutcomeBadge, useResultText } from "./FanWidgets";

const PREVIEW_ROWS = 5;

function eventHref(eventId?: string) {
  return eventId ? `/matches?tab=events&event=${eventId}` : "/matches";
}

/** "Next fight" banner for a fighter profile. Renders nothing without a scheduled bout. */
export function NextFightCard({ data, fighterId }: { data: FanData; fighterId: string }) {
  const { t, localName, formatDate } = useI18n();
  const next = nextBout(data, fighterId);
  if (!next) return null;
  const { bout, opponent } = next;
  return (
    <section className="rounded-3xl bg-gradient-to-r from-[#C8102E] to-[#9B0D23] text-white p-6 md:p-8 flex flex-col md:flex-row md:items-center gap-5">
      <div className="flex items-center gap-4 flex-1 min-w-0">
        <Swords className="w-8 h-8 shrink-0 text-white/80" aria-hidden />
        <div className="min-w-0">
          <p className="text-xs font-bold uppercase tracking-wider text-white/70">{t("next.title")}</p>
          <p className="text-xl md:text-2xl font-black truncate">{t("next.vs", { name: localName(opponent.name, opponent.nameKhmer) })}</p>
          <p className="text-sm text-white/80 truncate">
            {[bout.eventName || bout.cardName, formatDate(bout.date, "long")].filter(Boolean).join(" · ")}
          </p>
        </div>
      </div>
      <div className="flex flex-wrap items-center gap-3">
        <CountdownChip date={bout.date} surface="dark" />
        <Link
          to={`/compare?red=${getFighterSlug(bout.fighterA)}&blue=${getFighterSlug(bout.fighterB)}`}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-white/15 border border-white/40 text-white rounded-xl font-bold text-sm hover:bg-white/25 transition-colors"
        >
          <Swords className="w-4 h-4" aria-hidden />
          {t("matchup.preview")}
        </Link>
        <Link
          to={eventHref(bout.eventId)}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-white text-[#C8102E] rounded-xl font-bold text-sm hover:bg-gray-100 transition-colors"
        >
          {t("next.viewEvent")}
          <ArrowRight className="w-4 h-4" aria-hidden />
        </Link>
      </div>
    </section>
  );
}

/** Bout-by-bout history from recorded results. */
export function FightHistory({ data, fighterId }: { data: FanData; fighterId: string }) {
  const { t, localName, formatDate } = useI18n();
  const resultText = useResultText();
  const [expanded, setExpanded] = useState(false);
  const history = fightHistory(data, fighterId);
  const rows = expanded ? history : history.slice(0, PREVIEW_ROWS);

  return (
    <section className="bg-white rounded-[2.5rem] border border-slate-200/80 shadow-xl overflow-hidden p-6 md:p-12 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-1.5 h-8 bg-gradient-to-b from-emerald-500 to-teal-500 rounded-full" />
          <div>
            <h2 className="text-2xl md:text-3xl font-black text-slate-800 tracking-tight uppercase">{t("history.title")}</h2>
            <p className="text-sm text-slate-500 font-medium">{t("history.subtitle")}</p>
          </div>
        </div>
        {history.length > 0 && (
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">{t("history.form")}</span>
            <FormGuide form={history.slice(0, 5).map((h) => h.outcome)} label={false} />
          </div>
        )}
      </div>

      {history.length === 0 ? (
        <div className="text-center py-10 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200">
          <History className="w-10 h-10 text-slate-300 mx-auto mb-2" aria-hidden />
          <p className="text-slate-500 text-sm font-semibold max-w-sm mx-auto">{t("history.empty")}</p>
        </div>
      ) : (
        <>
          <ol className="divide-y divide-slate-100 border border-slate-100 rounded-2xl overflow-hidden">
            {rows.map(({ bout, outcome, opponent }) => (
              <li key={bout.id} className="flex items-center gap-3 md:gap-5 px-4 md:px-6 py-4 bg-white hover:bg-slate-50/70">
                <OutcomeBadge outcome={outcome} />
                <Link to={`/fighters/${getFighterSlug(opponent)}`} className="flex items-center gap-3 min-w-0 flex-1 group">
                  <img src={opponent.image} alt="" className="w-10 h-10 rounded-full object-cover border border-slate-200 shrink-0 hidden sm:block" />
                  <div className="min-w-0">
                    <p className="font-bold text-slate-900 group-hover:text-[#0A3D91] truncate">{localName(opponent.name, opponent.nameKhmer)}</p>
                    <p className="text-xs text-slate-500 truncate">
                      {bout.isTitle && <Trophy className="inline w-3 h-3 mr-1 text-amber-500 -mt-0.5" aria-label={t("matches.titleBout")} />}
                      {bout.eventName || bout.cardName}
                    </p>
                  </div>
                </Link>
                <div className="text-right shrink-0">
                  <p className="text-sm font-black text-slate-800">{resultText(bout)}</p>
                  <p className="text-xs text-slate-400 flex items-center justify-end gap-1">
                    <Calendar className="w-3 h-3" aria-hidden />
                    {formatDate(bout.date)}
                  </p>
                </div>
              </li>
            ))}
          </ol>
          {history.length > PREVIEW_ROWS && (
            <button
              type="button"
              onClick={() => setExpanded((e) => !e)}
              className="w-full py-2.5 text-sm font-bold text-[#0A3D91] hover:bg-blue-50 rounded-xl transition-colors"
            >
              {expanded ? t("history.showLess") : t("history.showAll", { n: history.length })}
            </button>
          )}
        </>
      )}
    </section>
  );
}
