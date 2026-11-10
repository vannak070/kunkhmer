/**
 * Matches (/home/matches) — the one place to run matches: a slim "Your next job" strip, then Week (opens first) / Upcoming /
 * Past / Needs attention (claude/updates/match-page-simpler.md, H). Upcoming and Past show the same broadcaster × day grid
 * as Week, one grid per week (owner, 2026-11-09).
 * A match = one day of fights (date, venue, TV); one fight inside it is a bout. Rows show the date, venue, bouts, status
 * and the next step; Needs attention groups every open job by match. English + Khmer.
 * Replaces the Program page (Overview / Fight nights / Champions tabs): see claude/updates/matches-menu.md.
 */
import { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router";
import { CalendarDays, Plus, Search } from "lucide-react";
import { api, recentFrom } from "../utils/api";
import { usePermissions } from "../hooks/usePermissions";
import { useAdminOverview } from "../hooks/useAdminOverview";
import { formatDay, khmerDigits, useT } from "../i18n/program";
import { LangSwitch, dayOf, todayUtc } from "../components/program/shared";
import { NONE, StatusKey, WeekBoard, WeekGrid, weekStartOf } from "../components/program/WeekBoard";
import { ShowPanel } from "../components/program/ShowPanel";
import { NextMatchCard } from "../components/program/NextMatchCard";
import { NeedsAttention, PROGRAM_TODOS } from "../components/program/NeedsAttention";

type Tab = "upcoming" | "week" | "past" | "attention";
const TABS: Tab[] = ["week", "upcoming", "past", "attention"];

export function Matches() {
  const { t, lang } = useT();
  const permissions = usePermissions();
  const [params, setParams] = useSearchParams();
  const asked = params.get("tab") as Tab | null;
  const tab: Tab = asked && TABS.includes(asked) ? asked : "week";
  const [events, setEvents] = useState<any[] | null>(null);
  const [failed, setFailed] = useState(false);
  const [cards, setCards] = useState<any[]>([]);
  const [bouts, setBouts] = useState<any[]>([]);
  const [query, setQuery] = useState("");
  // Upcoming / Past get the same toolbar as Week: search + broadcaster filter, then a summary line.
  const [station, setStation] = useState("all");
  const [stations, setStations] = useState<any[]>([]);
  const [sponsors, setSponsors] = useState<any[]>([]);
  // The match open in the side panel (same panel as the Week board).
  const [openShow, setOpenShow] = useState<string | null>(null);
  useEffect(() => {
    api.settings.listBroadcastStations().then((r: any[]) => setStations(r || [])).catch(() => {});
    api.settings.listSponsors().then((r: any[]) => setSponsors(r || [])).catch(() => {});
  }, []);
  const { data: overview, refresh } = useAdminOverview();

  // A failed load says so (with Try again) instead of an empty list that looks like lost data.
  // Only the last six months onward by default; "Show older matches" (Past tab) loads the rest (claude/updates/admin-performance.md).
  const [older, setOlder] = useState(false);
  const load = () => {
    setFailed(false);
    const window = older ? undefined : { from: recentFrom() };
    Promise.all([api.events.list(window), api.batches.list(undefined, window), api.matches.list(undefined, window)])
      .then(([e, c, m]) => { setEvents(e); setCards(c); setBouts(m); })
      .catch(() => setFailed(true));
  };
  useEffect(load, [older]);

  const todos = overview?.todos ?? [];
  const attentionCount = useMemo(() => {
    const nights = new Set(todos.filter((x) => PROGRAM_TODOS.includes(x.kind) && x.kind !== "vacantTitle" && x.eventId).map((x) => x.eventId));
    return nights.size + (todos.some((x) => x.kind === "vacantTitle") ? 1 : 0);
  }, [todos]);

  const inTab = useMemo(() => {
    if (!events) return [];
    const today = todayUtc();
    return events.filter((e) => (tab === "upcoming" ? dayOf(e.date) >= today : dayOf(e.date) < today));
  }, [events, tab]);
  const rows = useMemo(() => {
    const q = query.trim().toLowerCase();
    return inTab
      .filter((e) => station === "all" || (e.broadcast_station_id ?? "none") === station)
      .filter((e) => !q || `${e.name} ${e.location ?? ""}`.toLowerCase().includes(q))
      .sort((a, b) => dayOf(a.date) - dayOf(b.date) || String(a.start_time ?? "99:99").localeCompare(String(b.start_time ?? "99:99")) || a.name.localeCompare(b.name));
  }, [inTab, query, station]);
  // One Week-style grid per week (Monday–Sunday): Upcoming from this week on, Past with the latest week first.
  const weeks = useMemo(() => {
    const map = new Map<number, any[]>();
    for (const e of rows) { const w = weekStartOf(dayOf(e.date)); map.set(w, [...(map.get(w) ?? []), e]); }
    return [...map.entries()].sort((a, b) => (tab === "past" ? b[0] - a[0] : a[0] - b[0]));
  }, [rows, tab]);
  const ordered = useMemo(() => weeks.flatMap(([, list]) => list), [weeks]);
  const boutsOf = useMemo(() => {
    const map = new Map<string, any[]>();
    for (const b of bouts) map.set(b.event_id, [...(map.get(b.event_id) ?? []), b]);
    return map;
  }, [bouts]);
  const stationName = (id: string | null) => (!id || id === NONE ? t("wk.noBroadcaster") : stations.find((s) => s.id === id)?.name ?? "—");
  const sponsorName = (id: string | null) => (id ? sponsors.find((s) => s.id === id)?.name ?? "" : "");
  const rangeOf = (w: number) => `${formatDay(new Date(w).toISOString().slice(0, 10), lang, false)} – ${formatDay(new Date(w + 6 * 86_400_000).toISOString().slice(0, 10), lang, false)}`;
  const openIndex = openShow ? ordered.findIndex((e) => e.id === openShow) : -1;
  const opened = openIndex >= 0 ? ordered[openIndex] : null;
  const stationOptions = useMemo(() => {
    const ids = [...new Set(inTab.map((e) => e.broadcast_station_id ?? "none"))];
    return ids.sort((a, b) => (a === "none" ? 1 : b === "none" ? -1 : stationName(a).localeCompare(stationName(b))));
  }, [inTab, stations]);
  const num = (n: number) => (lang === "km" ? khmerDigits(n) : n);
  const rowBouts = rows.reduce((n, e) => n + (boutsOf.get(e.id)?.length ?? 0), 0);
  const rowStations = new Set(rows.map((e) => e.broadcast_station_id ?? "none")).size;

  const chip = (key: Tab, label: string, count?: number) => (
    <button key={key} type="button" aria-pressed={tab === key} onClick={() => setParams(key === "week" ? {} : { tab: key }, { replace: true })} className={`h-10 px-4 rounded-xl text-sm font-semibold border inline-flex items-center gap-2 ${tab === key ? "bg-primary text-white border-primary" : "bg-white text-slate-700 border-slate-200 hover:border-slate-300"}`}>
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
          <NextMatchCard slim events={events} cards={cards} bouts={bouts} onChanged={() => { load(); refresh(); }} />

          <div className="flex flex-wrap gap-2">{[chip("week", t("wk.tab")), chip("upcoming", t("list.upcoming")), chip("past", t("list.past")), chip("attention", t("mt.attention"), attentionCount)]}</div>

          {/* Same toolbar place as the Week board: search + broadcaster on one row, the summary under it. */}
          {(tab === "upcoming" || tab === "past") && (
            <div className="space-y-4">
              <div className="flex flex-wrap items-center gap-3">
                <div className="relative flex-1 min-w-[14rem] max-w-md">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" aria-hidden />
                  <label htmlFor="match-search" className="sr-only">{t("list.search")}</label>
                  <input id="match-search" value={query} onChange={(e) => setQuery(e.target.value)} placeholder={t("list.search")} className="w-full h-10 rounded-xl border border-slate-200 bg-white pl-9 pr-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary" />
                </div>
                <label className="ml-auto flex items-center gap-2 text-sm text-slate-600">
                  <span className="sr-only">{t("wk.broadcaster")}</span>
                  <select value={station} onChange={(e) => setStation(e.target.value)} className="h-10 rounded-xl border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-800">
                    <option value="all">{t("wk.all")}</option>
                    {stationOptions.map((id) => <option key={id} value={id}>{stationName(id)}</option>)}
                  </select>
                </label>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-slate-600">{t("wk.summary", { shows: num(rows.length), bouts: num(rowBouts), stations: num(rowStations) })}</p>
                <StatusKey />
              </div>
            </div>
          )}

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
            <div className="space-y-6">
              {weeks.map(([w, list]) => (
                <section key={w} aria-label={rangeOf(w)} className="space-y-2">
                  <h2 className="font-bold text-slate-900">{rangeOf(w)}</h2>
                  <WeekGrid start={w} shows={list} boutsOf={boutsOf} stationName={stationName} sponsorName={sponsorName} onOpen={setOpenShow} />
                </section>
              ))}
            </div>
          )}
          {opened && (
            <ShowPanel show={opened} bouts={boutsOf.get(opened.id) ?? []} stationName={stationName(opened.broadcast_station_id ?? null)} sponsorName={sponsorName(opened.main_sponsor_id)}
              prev={openIndex > 0 ? ordered[openIndex - 1] : null} next={openIndex < ordered.length - 1 ? ordered[openIndex + 1] : null}
              onOpen={setOpenShow} onClose={() => setOpenShow(null)} />
          )}
          {tab === "past" && !older && (
            <button type="button" onClick={() => setOlder(true)} className="h-11 px-5 rounded-xl border border-slate-300 bg-white text-sm font-semibold text-slate-700 hover:border-primary hover:text-primary">{t("mt.older")}</button>
          )}
        </>
      )}
    </div>
  );
}
