/**
 * Print the week (claude/updates/sheet-like-paper-week-print.md): every published show between two dates, each on its
 * own A4 page as the program sheet (SheetArticle), in one document → Print → Save as PDF gives one file like KKF's
 * weekly PDF. Order: by TV station (as KKF's PDF), then date and time; shows without a station last. Drafts and
 * cancelled shows are left out. Shows can be unticked before printing. /events/week-sheet?from=YYYY-MM-DD&to=YYYY-MM-DD
 */
import { useEffect, useMemo, useState } from "react";
import { Link, Navigate, useSearchParams } from "react-router";
import { api } from "../utils/api";
import { khmerDigits } from "../i18n/program";
import { SHEET_CSS, SheetArticle, SheetToolbar, todayIso } from "./ProgramSheet";

const KM_MONTHS = ["មករា", "កុម្ភៈ", "មីនា", "មេសា", "ឧសភា", "មិថុនា", "កក្កដា", "សីហា", "កញ្ញា", "តុលា", "វិច្ឆិកា", "ធ្នូ"];
const day = (iso: string) => String(iso).slice(0, 10);
const addDays = (iso: string, n: number) => new Date(Date.parse(`${iso}T00:00:00Z`) + n * 86_400_000).toISOString().slice(0, 10);

/** "កម្មវិធីប្រកួត ០៦–១១ វិច្ឆិកា ២០២៦" (the PDF's file name when saved from the browser). */
function fileTitle(from: string, to: string) {
  const a = new Date(`${from}T00:00:00Z`);
  const b = new Date(`${to}T00:00:00Z`);
  const dd = (d: Date) => khmerDigits(String(d.getUTCDate()).padStart(2, "0"));
  const sameMonth = a.getUTCMonth() === b.getUTCMonth() && a.getUTCFullYear() === b.getUTCFullYear();
  return sameMonth
    ? `កម្មវិធីប្រកួត ${dd(a)}–${dd(b)} ${KM_MONTHS[b.getUTCMonth()]} ${khmerDigits(b.getUTCFullYear())}`
    : `កម្មវិធីប្រកួត ${dd(a)} ${KM_MONTHS[a.getUTCMonth()]} – ${dd(b)} ${KM_MONTHS[b.getUTCMonth()]} ${khmerDigits(b.getUTCFullYear())}`;
}

export function WeekSheet() {
  const [params, setParams] = useSearchParams();
  const from = params.get("from") || todayIso();
  const to = params.get("to") || addDays(from, 6);
  const [events, setEvents] = useState<any[] | null>(null);
  const [bouts, setBouts] = useState<any[]>([]);
  const [changes, setChanges] = useState<Record<string, any[]>>({});
  const [left, setLeft] = useState<Set<string>>(new Set());
  const [failed, setFailed] = useState(false);
  const [signDate, setSignDate] = useState(todayIso);
  const signedIn = Boolean(localStorage.getItem("token"));

  useEffect(() => {
    if (!signedIn) return;
    setEvents(null);
    setFailed(false);
    const window = { from, to };
    Promise.all([api.events.list(window), api.matches.list(undefined, window)])
      .then(async ([evs, bs]) => {
        const shown = (evs as any[]).filter((e) => (e.status === "Published" || e.status === "Completed") && day(e.date) >= from && day(e.date) <= to);
        const lists = await Promise.all(shown.map((e) => api.events.changes(e.id).catch(() => [])));
        setChanges(Object.fromEntries(shown.map((e, i) => [e.id, lists[i]])));
        setBouts(bs as any[]);
        setEvents(shown);
      })
      .catch(() => setFailed(true));
  }, [from, to, signedIn]);

  // By TV station (in the order of the stations' names as KKF lists them: first appearance by date), then date and time.
  const ordered = useMemo(() => {
    if (!events) return [];
    const when = (e: any) => `${day(e.date)} ${e.start_time ?? "99:99"}`;
    const byTime = [...events].sort((a, b) => when(a).localeCompare(when(b)));
    const rank = new Map<string, number>();
    for (const e of byTime) { const s = e.broadcast_station?.id; if (s && !rank.has(s)) rank.set(s, rank.size); }
    return byTime.sort((a, b) => {
      const ra = a.broadcast_station?.id ? rank.get(a.broadcast_station.id)! : 1e6;
      const rb = b.broadcast_station?.id ? rank.get(b.broadcast_station.id)! : 1e6;
      return ra - rb || when(a).localeCompare(when(b));
    });
  }, [events]);

  useEffect(() => { document.title = fileTitle(from, to); return () => { document.title = "KKF Admin — Kun Khmer Federation"; }; }, [from, to]);

  if (!signedIn) return <Navigate to="/login" replace />;
  if (failed) return <p className="p-8 text-center text-slate-700">The week couldn't be loaded. <Link className="underline" to="/home/matches">Back to matches</Link></p>;

  const printed = ordered.filter((e) => !left.has(e.id));
  const boutsOf = (id: string) => bouts.filter((b) => b.event_id === id);
  const toggle = (id: string) => setLeft((s) => { const n = new Set(s); n.has(id) ? n.delete(id) : n.add(id); return n; });
  const setRange = (patch: { from?: string; to?: string }) => setParams({ from: patch.from ?? from, to: patch.to ?? to });

  return (
    <div className="sheet-root bg-slate-100 min-h-screen py-6 print:bg-white print:py-0">
      <style>{SHEET_CSS}</style>
      <SheetToolbar back="/home/matches?tab=week" signDate={signDate} onSignDate={setSignDate}>
        <label className="inline-flex items-center gap-2 text-sm text-slate-700">From
          <input type="date" value={from} onChange={(e) => e.target.value && setRange({ from: e.target.value })} className="h-10 px-3 rounded-xl border border-slate-300 bg-white" />
        </label>
        <label className="inline-flex items-center gap-2 text-sm text-slate-700">To
          <input type="date" value={to} min={from} onChange={(e) => e.target.value && setRange({ to: e.target.value })} className="h-10 px-3 rounded-xl border border-slate-300 bg-white" />
        </label>
      </SheetToolbar>

      <div className="no-print max-w-[210mm] mx-auto mb-4 px-3">
        {events === null ? (
          <div className="p-6 flex justify-center"><div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" aria-label="Loading" /></div>
        ) : ordered.length === 0 ? (
          <p className="rounded-xl border border-slate-200 bg-white p-4 text-sm text-slate-700">No published matches between these dates. Drafts are not printed — publish a match to include it.</p>
        ) : (
          <div className="rounded-xl border border-slate-200 bg-white p-4">
            <p className="text-sm font-semibold text-slate-900">{printed.length} of {ordered.length} sheets will print (one A4 page each) · file name “{fileTitle(from, to)}”</p>
            <ul className="mt-2 grid sm:grid-cols-2 gap-x-6 gap-y-1">
              {ordered.map((e) => (
                <li key={e.id}>
                  <label className="flex items-start gap-2 text-sm text-slate-800 cursor-pointer">
                    <input type="checkbox" className="mt-1 w-4 h-4" checked={!left.has(e.id)} onChange={() => toggle(e.id)} />
                    <span><strong className="font-semibold">{e.name}</strong> · {day(e.date)} {e.start_time ?? ""}{e.broadcast_station?.name ? ` · ${e.broadcast_station.name}` : ""} · {boutsOf(e.id).filter((b) => b.status !== "Cancelled").length} bouts</span>
                  </label>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {printed.map((e) => <SheetArticle key={e.id} event={e} bouts={boutsOf(e.id)} changes={changes[e.id] ?? []} signDate={signDate} />)}
    </div>
  );
}
