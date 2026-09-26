/**
 * "Schedule a title bout": a title fight is a bout on a fight card, so pick the upcoming fight
 * card and continue to the add-bout form with the title preselected.
 * Routes: /home/match/new?championId=… and /home/champion/:id/schedule-defense.
 */
import { useEffect, useMemo, useState } from "react";
import { Link, useParams, useSearchParams } from "react-router";
import { ArrowLeft, CalendarDays, ChevronRight, MapPin, Plus, Trophy } from "lucide-react";
import { api } from "../utils/api";

export function ScheduleTitleBout() {
  const { id } = useParams();
  const [params] = useSearchParams();
  const championId = id ?? params.get("championId") ?? "";
  const [batches, setBatches] = useState<any[] | null>(null);
  const [title, setTitle] = useState<any | null>(null);

  useEffect(() => {
    api.batches.list().then((b: any[]) => setBatches(b || [])).catch(() => setBatches([]));
    if (championId) api.champions.get(championId).then(setTitle).catch(() => setTitle(null));
  }, [championId]);

  const upcoming = useMemo(() => {
    const today = new Date(new Date().toISOString().slice(0, 10)).getTime();
    return (batches ?? [])
      .filter((b) => new Date(b.date).getTime() >= today && !["Complete", "Completed", "Cancelled"].includes(b.status))
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }, [batches]);

  const addBoutUrl = (batchId: string) => `/home/matches/${batchId}/create-match${championId ? `?championId=${championId}` : ""}`;
  const fmt = (d: string) => new Date(d).toLocaleDateString(undefined, { weekday: "short", day: "numeric", month: "short", year: "numeric", timeZone: "UTC" });

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <Link to={championId ? `/home/champion/${championId}` : "/home/program?tab=champions"} className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-slate-900">
        <ArrowLeft className="w-4 h-4" aria-hidden /> Back
      </Link>

      <header>
        <h1 className="text-2xl md:text-3xl font-bold text-slate-900 flex items-center gap-2">
          <Trophy className="w-7 h-7 text-amber-500" aria-hidden /> Schedule a title bout
        </h1>
        <p className="text-slate-600 mt-1">A title fight is a bout on a fight card. Pick the fight card it belongs to, then choose the two fighters.</p>
      </header>

      {title && (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 px-5 py-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-amber-700">Title</p>
          <p className="font-bold text-slate-900">{title.title_name ?? title.titleName}</p>
          <p className="text-sm text-slate-600">
            {title.status === "Vacant" || !title.current_holder_name ? "Vacant — this bout decides the new champion." : `Current champion: ${title.current_holder_name}`}
          </p>
        </div>
      )}

      <section className="space-y-3">
        <h2 className="text-lg font-bold text-slate-900">Upcoming fight cards</h2>
        {!batches ? (
          <div className="rounded-2xl border border-slate-200 bg-white p-8 flex justify-center"><div className="w-7 h-7 border-2 border-primary border-t-transparent rounded-full animate-spin" /></div>
        ) : upcoming.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center space-y-3">
            <p className="font-medium text-slate-800">There are no upcoming fight cards yet.</p>
            <p className="text-sm text-slate-600">Create the fight card first (it belongs to an event), then come back to add the title bout.</p>
            <Link to="/home/matches/new" className="inline-flex items-center gap-2 h-11 px-5 rounded-xl bg-primary hover:bg-[#083073] text-white font-semibold">
              <Plus className="w-4 h-4" aria-hidden /> Create a fight card
            </Link>
          </div>
        ) : (
          <ul className="space-y-3">
            {upcoming.map((b) => (
              <li key={b.id}>
                <Link to={addBoutUrl(b.id)} className="group flex items-center gap-4 rounded-2xl border border-slate-200 bg-white p-4 hover:border-primary hover:shadow-md transition">
                  <span className="w-11 h-11 rounded-xl bg-[#eef3fb] text-primary flex items-center justify-center shrink-0"><CalendarDays className="w-5 h-5" aria-hidden /></span>
                  <span className="min-w-0 flex-1">
                    <span className="block font-semibold text-slate-900 truncate">{b.name}</span>
                    <span className="block text-sm text-slate-600 truncate">{b.event_name} · {fmt(b.date)}</span>
                    {b.location && <span className="flex items-center gap-1 text-xs text-slate-500 truncate"><MapPin className="w-3 h-3" aria-hidden />{b.location}</span>}
                  </span>
                  <span className="hidden sm:inline-flex items-center gap-1 text-sm font-semibold text-primary">Add title bout <ChevronRight className="w-4 h-4" aria-hidden /></span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
