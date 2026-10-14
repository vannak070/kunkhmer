/**
 * Matches (/home/matches) — the one place to run matches: "Your next job", then Upcoming / Past / Needs attention.
 * A match = one day of fights (date, venue, TV); one fight inside it is a bout. Rows show the date, venue, bouts, status
 * and the next step; Needs attention groups every open job by match. English + Khmer.
 * Replaces the Program page (Overview / Fight nights / Champions tabs): see claude/updates/matches-menu.md.
 */
import { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router";
import { CalendarDays, ChevronRight, MapPin, Plus, Search } from "lucide-react";
import { api } from "../utils/api";
import { usePermissions } from "../hooks/usePermissions";
import { useAdminOverview } from "../hooks/useAdminOverview";
import { formatDay, formatTime, khmerDigits, useT } from "../i18n/program";
import { usePlaceName } from "../hooks/useSettingsLists";
import { LangSwitch, StatusChip, dayOf, displayStatus, nextStepText, todayUtc } from "../components/program/shared";
import { WeekBoard } from "../components/program/WeekBoard";
import { NextMatchCard } from "../components/program/NextMatchCard";
import { NeedsAttention, PROGRAM_TODOS } from "../components/program/NeedsAttention";

type Tab = "upcoming" | "week" | "past" | "attention";
const TABS: Tab[] = ["upcoming", "week", "past", "attention"];

export function Matches() {
  const { t, lang } = useT();
  const placeName = usePlaceName();
  const permissions = usePermissions();
  const [params, setParams] = useSearchParams();
  const asked = params.get("tab") as Tab | null;
  const tab: Tab = asked && TABS.includes(asked) ? asked : "upcoming";
  const [events, setEvents] = useState<any[] | null>(null);
  const [failed, setFailed] = useState(false);
  const [cards, setCards] = useState<any[]>([]);
  const [bouts, setBouts] = useState<any[]>([]);
  const [query, setQuery] = useState("");
  const { data: overview, refresh } = useAdminOverview();

  // A failed load says so (with Try again) instead of an empty list that looks like lost data.
  const load = () => {
    setFailed(false);
    Promise.all([api.events.list(), api.batches.list(), api.matches.list()])
      .then(([e, c, m]) => { setEvents(e); setCards(c); setBouts(m); })
      .catch(() => setFailed(true));
  };
  useEffect(load, []);

  const todos = overview?.todos ?? [];
  const attentionCount = useMemo(() => {
    const nights = new Set(todos.filter((x) => PROGRAM_TODOS.includes(x.kind) && x.kind !== "vacantTitle" && x.eventId).map((x) => x.eventId));
    return nights.size + (todos.some((x) => x.kind === "vacantTitle") ? 1 : 0);
  }, [todos]);

  const rows = useMemo(() => {
    if (!events) return [];
    const today = todayUtc();
    const q = query.trim().toLowerCase();
    return events
      .filter((e) => (tab === "upcoming" ? dayOf(e.date) >= today : dayOf(e.date) < today))
      .filter((e) => !q || `${e.name} ${e.location ?? ""}`.toLowerCase().includes(q))
      .sort((a, b) => (tab === "past" ? dayOf(b.date) - dayOf(a.date) : dayOf(a.date) - dayOf(b.date)));
  }, [events, tab, query]);

  const chip = (key: Tab, label: string, count?: number) => (
    <button key={key} type="button" aria-pressed={tab === key} onClick={() => setParams(key === "upcoming" ? {} : { tab: key }, { replace: true })} className={`h-10 px-4 rounded-xl text-sm font-semibold border inline-flex items-center gap-2 ${tab === key ? "bg-primary text-white border-primary" : "bg-white text-slate-700 border-slate-200 hover:border-slate-300"}`}>
      {label}
      {count ? <span className={`px-2 py-0.5 text-[11px] rounded-full font-bold ${tab === key ? "bg-white text-primary" : "bg-amber-100 text-amber-800"}`}>{count}</span> : null}
    </button>
  );

  return (
    <div className="max-w-6xl mx-auto p-4 md:p-8 space-y-6">
      <header className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
        <div className="flex items-start gap-3">
          <span className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0" aria-hidden><CalendarDays className="w-6 h-6" /></span>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-slate-900">{t("program.title")}</h1>
            <p className="text-base text-slate-600 mt-1">{t("program.subtitle")}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <LangSwitch />
          {permissions.hasAnyPermission(["events.create", "events.record"]) && (
            <Link to="/home/events/new" className="inline-flex items-center gap-2 h-11 px-5 rounded-xl bg-primary text-white text-sm font-semibold hover:opacity-90">
              <Plus className="w-4 h-4" aria-hidden /> {t("list.new")}
            </Link>
          )}
        </div>
      </header>

      {failed ? (
        <div role="alert" className="rounded-2xl border border-amber-200 bg-amber-50 p-8 text-center space-y-4">
          <p className="text-amber-900">{t("list.loadFailed")}</p>
          <button type="button" onClick={load} className="h-11 px-5 rounded-xl bg-primary text-white text-sm font-semibold hover:opacity-90">{t("common.tryAgain")}</button>
        </div>
      ) : !events ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-10 flex justify-center"><div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" aria-label={t("common.loading")} /></div>
      ) : (
        <>
          {tab === "upcoming" && <NextMatchCard events={events} cards={cards} bouts={bouts} onChanged={() => { load(); refresh(); }} />}

          <div className="flex flex-wrap items-center gap-3">
            <div className="flex flex-wrap gap-2">{[chip("upcoming", t("list.upcoming")), chip("week", t("wk.tab")), chip("past", t("list.past")), chip("attention", t("mt.attention"), attentionCount)]}</div>
            {tab !== "attention" && tab !== "week" && (
              <div className="relative flex-1 min-w-[14rem]">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" aria-hidden />
                <label htmlFor="match-search" className="sr-only">{t("list.search")}</label>
                <input id="match-search" value={query} onChange={(e) => setQuery(e.target.value)} placeholder={t("list.search")} className="w-full h-10 rounded-xl border border-slate-200 bg-white pl-9 pr-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary" />
              </div>
            )}
          </div>

          {tab === "week" ? (
            <WeekBoard events={events} bouts={bouts} canCopy={permissions.hasAnyPermission(["events.create", "events.record"])} onChanged={load} />
          ) : tab === "attention" ? (
            attentionCount === 0
              ? <p className="rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center text-slate-600">{t("mt.attentionEmpty")}</p>
              : <NeedsAttention todos={todos} limit={Infinity} bare />
          ) : rows.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center">
              <p className="font-semibold text-slate-800">{t("list.empty")}</p>
              <p className="text-sm text-slate-500 mt-1">{t("list.emptyHint")}</p>
            </div>
          ) : (
            <ul className="space-y-3">
              {rows.map((e) => {
                const evCards = cards.filter((c) => c.event_id === e.id);
                const evBouts = bouts.filter((b) => b.event_id === e.id);
                const next = nextStepText(t, e, evCards, evBouts);
                const d = new Date(`${String(e.date).slice(0, 10)}T00:00:00Z`);
                return (
                  <li key={e.id}>
                    <Link to={`/home/events/${e.id}`} className="flex items-center gap-4 rounded-2xl border border-slate-200 bg-white p-4 md:p-5 hover:border-primary hover:shadow-sm transition">
                      <div className="w-16 shrink-0 rounded-xl bg-[#eef3fb] text-center py-2">
                        <p className="text-2xl font-bold text-primary leading-none">{lang === "km" ? khmerDigits(d.getUTCDate()) : d.getUTCDate()}</p>
                        <p className="text-xs font-semibold text-slate-600 mt-1">{formatDay(e.date, lang, false).split(" ").slice(1).join(" ")}</p>
                        {e.start_time && <p className="text-xs font-bold text-slate-900 mt-0.5">{formatTime(e.start_time, lang)}</p>}
                      </div>
                      <div className="flex-1 min-w-0 space-y-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="font-bold text-slate-900 break-words">{e.name}</p>
                          <StatusChip status={displayStatus(e, evBouts)} />
                        </div>
                        <p className="text-sm text-slate-600 flex flex-wrap items-center gap-x-3">
                          <span className="inline-flex items-center gap-1"><MapPin className="w-3.5 h-3.5 text-slate-400" aria-hidden />{e.location ? placeName(e.location) : t("common.notSet")}</span>
                          <span>{evBouts.length === 0 ? t("list.noBouts") : evBouts.length === 1 ? t("list.bout") : t("list.bouts", { n: evBouts.length })}</span>
                        </p>
                        {e.signed_off_at && <p className="text-sm font-semibold text-emerald-700">{t("so.chip")}</p>}
                        {e.postponed_from && e.status !== "Cancelled" && <p className="text-sm font-semibold text-amber-700">{t("ch.postponedFrom", { date: formatDay(e.postponed_from, lang, false) })}</p>}
                        <p className={`text-sm font-semibold ${next ? "text-primary" : "text-emerald-700"}`}>{next ? t("list.next", { step: next }) : e.status === "Cancelled" ? "" : t("list.done")}</p>
                      </div>
                      <ChevronRight className="w-5 h-5 text-slate-400 shrink-0" aria-hidden />
                    </Link>
                  </li>
                );
              })}
            </ul>
          )}
        </>
      )}
    </div>
  );
}
