/**
 * Week board (Matches › Week): one week, rows = broadcaster, columns = day, a card per match (start time, name, place,
 * sponsor, bouts, status). Built for 15–20 shows a week. Phone: the same week as a list grouped by day.
 * claude/features/weekly-program.md (step 2)
 */
import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router";
import { ChevronLeft, ChevronRight, Copy, MapPin } from "lucide-react";
import { toast } from "sonner";
import { api } from "../../utils/api";
import { formatDay, formatTime, khmerDigits, useT } from "../../i18n/program";
import { usePlaceName } from "../../hooks/useSettingsLists";
import { StatusChip, dayOf, displayStatus, todayUtc } from "./shared";
import { type WeekCheckResult, WeekChecks, levelFor } from "./WeekChecks";

const DAY = 86_400_000;
const NONE = "none";

/** Monday (UTC midnight) of the week holding this day. */
const mondayOf = (day: number) => {
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
  const [start, setStart] = useState(() => mondayOf(todayUtc()));
  const [station, setStation] = useState("all");
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

  const Card = ({ e }: { e: any }) => {
    const level = levelFor(checks?.checks, e.id);
    const n = boutsOf.get(e.id)?.length ?? 0;
    const sponsor = sponsorName(e.main_sponsor_id);
    return (
      <Link to={`/home/events/${e.id}`} className="block rounded-xl border border-slate-200 bg-white p-2.5 hover:border-primary hover:shadow-sm transition space-y-1">
        <p className="flex flex-wrap items-center justify-between gap-x-2 gap-y-1">
          <span className="text-sm font-bold text-slate-900 inline-flex items-center gap-1.5">
            {level && <span className={`w-2.5 h-2.5 rounded-full ${level === "problem" ? "bg-red-500" : "bg-amber-400"}`} aria-label={t(level === "problem" ? "wc.problem" : "wc.warning")} />}
            {e.start_time ? formatTime(e.start_time, lang) : t("wk.noTime")}
          </span>
          <StatusChip status={displayStatus(e, boutsOf.get(e.id) ?? [])} />
        </p>
        <p className="text-sm font-semibold text-slate-900 break-words leading-snug">{e.name}</p>
        {e.location && <p className="text-xs text-slate-600 flex items-start gap-1"><MapPin className="w-3 h-3 mt-0.5 text-slate-400 shrink-0" aria-hidden />{placeName(e.location)}</p>}
        <p className="text-xs text-slate-500">{[sponsor, n === 0 ? t("list.noBouts") : n === 1 ? t("list.bout") : t("list.bouts", { n })].filter(Boolean).join(" · ")}</p>
      </Link>
    );
  };

  return (
    <section aria-label={t("wk.title")} className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-1">
          <button type="button" onClick={() => setStart(start - 7 * DAY)} aria-label={t("wk.prev")} className="w-10 h-10 rounded-xl border border-slate-200 bg-white flex items-center justify-center hover:border-primary"><ChevronLeft className="w-4 h-4" aria-hidden /></button>
          <button type="button" onClick={() => setStart(mondayOf(todayUtc()))} className="h-10 px-4 rounded-xl border border-slate-200 bg-white text-sm font-semibold text-slate-700 hover:border-primary">{t("wk.thisWeek")}</button>
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
        <p className="text-sm text-slate-600">{t("wk.summary", { shows: count(week.length), bouts: count(boutTotal), stations: count(rows.length) })}</p>
        {canCopy && (
          <button type="button" disabled={copying} onClick={copyLastWeek} className="inline-flex items-center gap-2 h-10 px-4 rounded-xl border border-slate-200 bg-white text-sm font-semibold text-slate-700 hover:border-primary hover:text-primary disabled:opacity-50">
            <Copy className="w-4 h-4" aria-hidden /> {t("copy.week")}
          </button>
        )}
      </div>

      <WeekChecks data={checks} failed={checksFailed} />

      {week.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center text-slate-600">{t("wk.empty")}</div>
      ) : (
        <>
          {/* Desktop: broadcaster × day */}
          <div className="hidden lg:block overflow-x-auto rounded-2xl border border-slate-200 bg-white">
            <div className="grid min-w-[1180px]" style={{ gridTemplateColumns: "8rem repeat(7, minmax(0, 1fr))" }}>
              <div className="bg-slate-50 border-b border-slate-200 p-3 text-xs font-bold uppercase tracking-wide text-slate-500">{t("wk.broadcaster")}</div>
              {days.map((d) => (
                <div key={d} className={`border-b border-l border-slate-200 p-3 text-center ${d === today ? "bg-primary/10" : "bg-slate-50"}`}>
                  <p className="text-xs font-bold uppercase text-slate-500">{weekday(d)}</p>
                  <p className="text-lg font-bold text-slate-900 leading-tight">{dayNumber(d)}</p>
                </div>
              ))}
              {rows.map((id) => (
                <div key={id} className="contents">
                  <div className="p-3 border-b border-slate-200 text-sm font-bold text-slate-900 break-words">{stationName(id === NONE ? null : id)}</div>
                  {days.map((d) => (
                    <div key={d} className={`border-b border-l border-slate-200 p-2 space-y-2 min-h-[4rem] ${d === today ? "bg-primary/5" : ""}`}>
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
                    <div key={e.id} className="space-y-1">
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
    </section>
  );
}
