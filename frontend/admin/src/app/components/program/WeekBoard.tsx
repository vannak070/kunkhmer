/**
 * Week board (Matches › Week): one week (Monday–Sunday), rows = broadcaster, columns = day, a compact two-line card per
 * match (start time · name, then status and bouts; a red / amber edge when the weekly checks found something). The day
 * headings and the broadcaster column stay in view while scrolling; clicking a card opens the show's bouts in a side
 * panel (ShowPanel). Owner's picks, 2026-11-09. Built for 15–20 shows a week. Phone: the same week as a list grouped by day.
 * claude/features/weekly-program.md (step 2)
 */
import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router";
import { ChevronLeft, ChevronRight, Copy, Printer } from "lucide-react";
import { toast } from "sonner";
import { api } from "../../utils/api";
import { formatDay, formatTime, khmerDigits, useT } from "../../i18n/program";
import { usePlaceName } from "../../hooks/useSettingsLists";
import { dayOf, displayStatus, todayUtc } from "./shared";
import { ShowPanel } from "./ShowPanel";
import { type WeekCheckResult, WeekChecks, levelFor } from "./WeekChecks";

const DAY = 86_400_000;
const NONE = "none";

/** Monday (UTC midnight) of the week holding this day: the board shows Monday–Sunday (owner, 2026-11-09). */
const weekStartOf = (day: number) => {
  const d = new Date(day);
  return day - ((d.getUTCDay() + 6) % 7) * DAY;
};

interface Props {
  events: any[];
  bouts: any[];
  /** May copy last week into the week shown (KKF staff and Organizers). */
  canCopy?: boolean;
  /** Reload the matches after a copy. */
  onChanged?: () => void;
}

export function WeekBoard({ events: parentEvents, bouts: parentBouts, canCopy, onChanged }: Props) {
  const { t, lang } = useT();
  const placeName = usePlaceName();
  const [start, setStart] = useState(() => weekStartOf(todayUtc()));
  const [station, setStation] = useState("all");
  // The show open in the side panel.
  const [openShow, setOpenShow] = useState<string | null>(null);
  // The week shown loads its own matches and bouts (any week, however old), not the whole history
  // (claude/updates/admin-performance.md); the page's lists are the first paint and a reload trigger.
  const [weekData, setWeekData] = useState<{ events: any[]; bouts: any[] } | null>(null);
  useEffect(() => {
    let live = true;
    const from = new Date(start).toISOString().slice(0, 10);
    const to = new Date(start + 6 * DAY).toISOString().slice(0, 10);
    Promise.all([api.events.list({ from, to }), api.matches.list(undefined, { from, to })])
      .then(([e, b]) => live && setWeekData({ events: e, bouts: b }))
      .catch(() => live && setWeekData(null));
    return () => { live = false; };
  }, [start, parentEvents, parentBouts]);
  const events = weekData?.events ?? parentEvents;
  const bouts = weekData?.bouts ?? parentBouts;
  const [stations, setStations] = useState<any[]>([]);
  const [sponsors, setSponsors] = useState<any[]>([]);

  useEffect(() => {
    api.settings.listBroadcastStations().then((r: any[]) => setStations(r || [])).catch(() => {});
    api.settings.listSponsors().then((r: any[]) => setSponsors(r || [])).catch(() => {});
  }, []);

  // Copy last week: every match of the week before the one shown, 7 days later, as drafts (claude/updates/show-templates-copy-week.md).
  const [copying, setCopying] = useState(false);
  // Weekly checks for the week shown (claude/updates/weekly-checks.md); reloaded when the week or the matches change.
  const [checks, setChecks] = useState<WeekCheckResult | null>(null);
  const [checksFailed, setChecksFailed] = useState(false);
  useEffect(() => {
    let live = true;
    setChecks(null);
    setChecksFailed(false);
    api.events.weekChecks(new Date(start).toISOString().slice(0, 10))
      .then((r) => live && setChecks(r))
      .catch(() => live && setChecksFailed(true));
    return () => { live = false; };
  }, [start, events]);
  const copyLastWeek = async () => {
    setCopying(true);
    try {
      const from = new Date(start - 7 * DAY).toISOString().slice(0, 10);
      const res = await api.events.copyWeek(from);
      if (res.created.length === 0 && res.skipped.length === 0) toast.info(t("copy.weekNone"));
      else toast.success([res.created.length ? t("copy.weekDone", { n: count(res.created.length) }) : "", res.skipped.length ? t("copy.weekSkipped", { n: count(res.skipped.length) }) : ""].filter(Boolean).join(" "));
      onChanged?.();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : t("common.error"));
    } finally {
      setCopying(false);
    }
  };

  const days = useMemo(() => Array.from({ length: 7 }, (_, i) => start + i * DAY), [start]);
  const stationName = (id: string | null) => (id ? stations.find((s) => s.id === id)?.name ?? "—" : t("wk.noBroadcaster"));
  const sponsorName = (id: string | null) => (id ? sponsors.find((s) => s.id === id)?.name ?? "" : "");

  const boutsOf = useMemo(() => {
    const map = new Map<string, any[]>();
    for (const b of bouts) map.set(b.event_id, [...(map.get(b.event_id) ?? []), b]);
    return map;
  }, [bouts]);

  const week = useMemo(
    () =>
      events
        .filter((e) => dayOf(e.date) >= start && dayOf(e.date) < start + 7 * DAY)
        .filter((e) => station === "all" || (e.broadcast_station_id ?? NONE) === station)
        .sort((a, b) => dayOf(a.date) - dayOf(b.date) || String(a.start_time ?? "99:99").localeCompare(String(b.start_time ?? "99:99")) || a.name.localeCompare(b.name)),
    [events, start, station],
  );

  // Rows: the broadcasters that have a match this week (named ones first, "no broadcaster" last).
  const rows = useMemo(() => {
    const ids = [...new Set(week.map((e) => e.broadcast_station_id ?? NONE))];
    return ids.sort((a, b) => (a === NONE ? 1 : b === NONE ? -1 : stationName(a).localeCompare(stationName(b))));
  }, [week, stations]);

  const boutTotal = week.reduce((n, e) => n + (boutsOf.get(e.id)?.length ?? 0), 0);
  const filterOptions = useMemo(() => {
    const ids = [...new Set(events.map((e) => e.broadcast_station_id ?? NONE))];
    return ids.sort((a, b) => (a === NONE ? 1 : b === NONE ? -1 : stationName(a).localeCompare(stationName(b))));
  }, [events, stations]);

  const range = `${formatDay(new Date(days[0]).toISOString().slice(0, 10), lang, false)} – ${formatDay(new Date(days[6]).toISOString().slice(0, 10), lang, false)}`;
  const today = todayUtc();
  const weekday = (day: number) => new Date(day).toLocaleDateString(lang === "km" ? "km-KH" : "en-GB", { weekday: "short", timeZone: "UTC" });
  const dayNumber = (day: number) => (lang === "km" ? khmerDigits(new Date(day).getUTCDate()) : new Date(day).getUTCDate());
  const count = (n: number) => (lang === "km" ? khmerDigits(n) : n);

  const DOT: Record<string, string> = { Draft: "bg-slate-400", Published: "bg-emerald-500", Completed: "bg-blue-500", Cancelled: "bg-red-500" };
  const Card = ({ e }: { e: any }) => {
    const level = levelFor(checks?.checks, e.id);
    const n = boutsOf.get(e.id)?.length ?? 0;
    const status = displayStatus(e, boutsOf.get(e.id) ?? []);
    const edge = level === "problem" ? "border-l-4 border-l-red-500" : level === "warning" ? "border-l-4 border-l-amber-400" : "";
    return (
      <button type="button" onClick={() => setOpenShow(e.id)} title={[e.name, t(`status.${status}` as any), e.location ? placeName(e.location) : null, sponsorName(e.main_sponsor_id) || null].filter(Boolean).join(" · ")}
        className={`relative w-full text-left rounded-lg border border-slate-200 bg-white px-2 py-1.5 hover:border-primary hover:shadow-sm transition ${edge}`}>
        <p className="text-[13px] leading-snug line-clamp-2 break-words">
          <span className="font-bold text-slate-900">{e.start_time ? formatTime(e.start_time, lang) : t("wk.noTime")}</span>{" "}
          <span className="font-semibold text-slate-800">{e.name}</span>
        </p>
        <p className="mt-0.5 flex items-center gap-1.5 text-[11px] text-slate-500">
          <span className={`w-2 h-2 rounded-full shrink-0 ${DOT[status]}`} title={t(`status.${status}` as any)} aria-label={t(`status.${status}` as any)} />
          <span className="truncate">{n === 0 ? t("list.noBouts") : n === 1 ? t("list.bout") : t("list.bouts", { n: count(n) })}</span>
          {level && <span className="sr-only">{t(level === "problem" ? "wc.problem" : "wc.warning")}</span>}
        </p>
      </button>
    );
  };
  const openIndex = openShow ? week.findIndex((e) => e.id === openShow) : -1;
  const opened = openIndex >= 0 ? week[openIndex] : null;

  return (
    <section aria-label={t("wk.title")} className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-1">
          <button type="button" onClick={() => setStart(start - 7 * DAY)} aria-label={t("wk.prev")} className="w-10 h-10 rounded-xl border border-slate-200 bg-white flex items-center justify-center hover:border-primary"><ChevronLeft className="w-4 h-4" aria-hidden /></button>
          <button type="button" onClick={() => setStart(weekStartOf(todayUtc()))} className="h-10 px-4 rounded-xl border border-slate-200 bg-white text-sm font-semibold text-slate-700 hover:border-primary">{t("wk.thisWeek")}</button>
          <button type="button" onClick={() => setStart(start + 7 * DAY)} aria-label={t("wk.next")} className="w-10 h-10 rounded-xl border border-slate-200 bg-white flex items-center justify-center hover:border-primary"><ChevronRight className="w-4 h-4" aria-hidden /></button>
        </div>
        <p className="font-bold text-slate-900">{range}</p>
        <label className="ml-auto flex items-center gap-2 text-sm text-slate-600">
          <span className="sr-only">{t("wk.broadcaster")}</span>
          <select value={station} onChange={(e) => setStation(e.target.value)} className="h-10 rounded-xl border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-800">
            <option value="all">{t("wk.all")}</option>
            {filterOptions.map((id) => <option key={id} value={id}>{stationName(id === NONE ? null : id)}</option>)}
          </select>
        </label>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="space-y-1">
          <p className="text-sm text-slate-600">{t("wk.summary", { shows: count(week.length), bouts: count(boutTotal), stations: count(rows.length) })}</p>
          {/* Key for the compact cards: the dot = status, the coloured edge = something the weekly checks found. */}
          <p className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-500">
            {(["Draft", "Published", "Completed", "Cancelled"] as const).map((k) => (
              <span key={k} className="inline-flex items-center gap-1"><span className={`w-2 h-2 rounded-full ${DOT[k]}`} aria-hidden />{t(`status.${k}`)}</span>
            ))}
            <span className="inline-flex items-center gap-1"><span className="w-1 h-3 rounded bg-red-500" aria-hidden /><span className="w-1 h-3 rounded bg-amber-400" aria-hidden />{t("wk.edgeKey")}</span>
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
        {/* Every published show of this week, one sheet per page (claude/updates/sheet-like-paper-week-print.md); dates can be changed there. */}
        {week.length > 0 && (
          <Link to={`/events/week-sheet?from=${new Date(start).toISOString().slice(0, 10)}&to=${new Date(start + 6 * DAY).toISOString().slice(0, 10)}`} className="inline-flex items-center gap-2 h-10 px-4 rounded-xl bg-primary text-white text-sm font-semibold hover:opacity-90">
            <Printer className="w-4 h-4" aria-hidden /> {t("wk.print")}
          </Link>
        )}
        {canCopy && (
          <button type="button" disabled={copying} onClick={copyLastWeek} className="inline-flex items-center gap-2 h-10 px-4 rounded-xl border border-slate-200 bg-white text-sm font-semibold text-slate-700 hover:border-primary hover:text-primary disabled:opacity-50">
            <Copy className="w-4 h-4" aria-hidden /> {t("copy.week")}
          </button>
        )}
        </div>
      </div>

      <WeekChecks data={checks} failed={checksFailed} />

      {week.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center text-slate-600">{t("wk.empty")}</div>
      ) : (
        <>
          {/* Desktop: broadcaster × day */}
          {/* The box scrolls by itself, so the day headings (top) and the broadcasters (left) stay in view. */}
          <div className="hidden lg:block relative overflow-auto max-h-[calc(100dvh-10rem)] rounded-2xl border border-slate-200 bg-white">
            <div className="grid" style={{ gridTemplateColumns: "7.5rem repeat(7, minmax(7.5rem, 1fr))" }}>
              <div className="sticky top-0 left-0 z-20 bg-slate-50 border-b border-r border-slate-200 p-2.5 text-xs font-bold uppercase tracking-wide text-slate-500">{t("wk.broadcaster")}</div>
              {days.map((d) => (
                <div key={d} className={`sticky top-0 z-10 border-b border-l border-slate-200 px-2 py-2 text-center ${d === today ? "bg-[#e3ebf7]" : "bg-slate-50"}`}>
                  <p className="text-[11px] font-bold uppercase text-slate-500">{weekday(d)}</p>
                  <p className="text-base font-bold text-slate-900 leading-tight">{dayNumber(d)}</p>
                </div>
              ))}
              {rows.map((id) => (
                <div key={id} className="contents">
                  <div className="sticky left-0 z-[5] bg-white p-2.5 border-b border-r border-slate-200 text-sm font-bold text-slate-900 break-words">{stationName(id === NONE ? null : id)}</div>
                  {days.map((d) => (
                    <div key={d} className={`border-b border-l border-slate-200 p-1.5 space-y-1.5 min-h-[3rem] ${d === today ? "bg-primary/5" : ""}`}>
                      {week.filter((e) => (e.broadcast_station_id ?? NONE) === id && dayOf(e.date) === d).map((e) => <Card key={e.id} e={e} />)}
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>

          {/* Phone and tablet: the week as a list by day */}
          <div className="lg:hidden space-y-4">
            {days.map((d) => {
              const list = week.filter((e) => dayOf(e.date) === d);
              if (list.length === 0) return null;
              return (
                <section key={d} className="space-y-2">
                  <h3 className={`text-sm font-bold ${d === today ? "text-primary" : "text-slate-700"}`}>{weekday(d)} {dayNumber(d)}</h3>
                  {list.map((e) => (
                    <div key={e.id} className="space-y-0.5">
                      <p className="text-xs font-semibold text-slate-500">{stationName(e.broadcast_station_id ?? null)}</p>
                      <Card e={e} />
                    </div>
                  ))}
                </section>
              );
            })}
          </div>
        </>
      )}
      {opened && (
        <ShowPanel show={opened} bouts={boutsOf.get(opened.id) ?? []} stationName={stationName(opened.broadcast_station_id ?? null)} sponsorName={sponsorName(opened.main_sponsor_id)}
          prev={openIndex > 0 ? week[openIndex - 1] : null} next={openIndex < week.length - 1 ? week[openIndex + 1] : null}
          onOpen={setOpenShow} onClose={() => setOpenShow(null)} />
      )}
    </section>
  );
}
