/**
 * My bouts (Phase 4): what a signed-in referee or judge sees — the bouts KKF assigned them,
 * upcoming first, read-only. Data: `GET /officials/me/bouts`.
 */
import { useEffect, useState } from "react";
import { Calendar, Gavel, Loader2, MapPin, Trophy } from "lucide-react";
import { api } from "../utils/api";

const fmtDate = (d?: string | null) =>
  d ? new Date(`${d.slice(0, 10)}T00:00:00Z`).toLocaleDateString(undefined, { weekday: "long", day: "numeric", month: "long", year: "numeric", timeZone: "UTC" }) : "Date to be confirmed";
const today = () => new Date().toISOString().slice(0, 10);

export function MyBouts() {
  const me = api.auth.getCurrentUser();
  const [bouts, setBouts] = useState<any[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api.officials
      .myBouts()
      .then((rows: any[]) => setBouts(rows.filter((b) => b.event_status !== "Cancelled")))
      .catch((e: unknown) => setError(e instanceof Error ? e.message : "Could not load your bouts."));
  }, []);

  const upcoming = (bouts ?? []).filter((b) => !b.result && String(b.date) >= today());
  const past = (bouts ?? []).filter((b) => !upcoming.includes(b)).reverse();

  return (
    <div className="p-4 md:p-8 max-w-3xl mx-auto space-y-6">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight text-foreground flex items-center gap-2">
          <Gavel className="w-6 h-6 text-primary" aria-hidden /> My bouts
        </h1>
        <p className="text-sm text-muted-foreground mt-1 font-medium">
          The bouts KKF assigned you{me?.fullName ? `, ${me.fullName}` : ""}. Ask KKF if something needs to change.
        </p>
      </header>

      {error && <p className="text-sm text-red-600">{error}</p>}
      {!bouts && !error && <div className="flex items-center gap-2 text-sm text-slate-500"><Loader2 className="w-4 h-4 animate-spin" aria-hidden /> Loading your bouts…</div>}

      {bouts && (
        <>
          <section aria-labelledby="upcoming-title" className="space-y-3">
            <h2 id="upcoming-title" className="text-sm font-semibold uppercase tracking-wider text-slate-500">Coming up ({upcoming.length})</h2>
            {upcoming.length === 0 ? (
              <p className="rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center text-sm text-slate-500">No upcoming bouts assigned to you yet.</p>
            ) : (
              <ul className="space-y-3">{upcoming.map((b) => <BoutRow key={b.id} bout={b} />)}</ul>
            )}
          </section>
          {past.length > 0 && (
            <section aria-labelledby="past-title" className="space-y-3">
              <h2 id="past-title" className="text-sm font-semibold uppercase tracking-wider text-slate-500">Earlier ({past.length})</h2>
              <ul className="space-y-3">{past.map((b) => <BoutRow key={b.id} bout={b} past />)}</ul>
            </section>
          )}
        </>
      )}
    </div>
  );
}

function BoutRow({ bout: b, past = false }: { bout: any; past?: boolean }) {
  const winner = b.winner_id === b.fighter_a_id ? b.fighter_a_name : b.winner_id === b.fighter_b_id ? b.fighter_b_name : null;
  return (
    <li className={`rounded-2xl border border-slate-200 bg-white p-4 md:p-5 ${past ? "opacity-80" : ""}`}>
      <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
        <p className="text-sm font-medium text-slate-600 flex items-center gap-1.5">
          <Calendar className="w-4 h-4" aria-hidden /> {fmtDate(b.date)}
        </p>
        <span className={`rounded-lg border px-2 py-0.5 text-xs font-semibold ${b.my_role === "Referee" ? "border-blue-200 bg-blue-50 text-blue-700" : "border-amber-200 bg-amber-50 text-amber-800"}`}>
          You: {b.my_role}
        </span>
      </div>
      <p className="text-lg font-semibold text-slate-900">
        {b.fighter_a_name ?? "TBD"} <span className="text-slate-400 font-normal">vs</span> {b.fighter_b_name ?? "TBD"}
      </p>
      <p className="text-sm text-slate-600">{[b.club_a_name, b.club_b_name].filter(Boolean).join(" vs ")}</p>
      <p className="mt-2 text-sm text-slate-600 flex items-center gap-1.5">
        <MapPin className="w-4 h-4 shrink-0" aria-hidden /> {b.event_name} · {b.sub_event_name}{b.event_location ? ` · ${b.event_location}` : ""}
      </p>
      <p className="mt-1 text-sm text-slate-600">
        {b.rounds} rounds × {b.round_time} min · {b.agreed_weight} kg · {b.glove_size} {b.glove_brand}
        {b.isTitleMatch && <span className="ml-2 inline-flex items-center gap-1 font-semibold text-amber-700"><Trophy className="w-3.5 h-3.5" aria-hidden /> {b.championshipTitleName ?? "Title bout"}</span>}
      </p>
      {b.result && (
        <p className="mt-2 text-sm font-semibold text-emerald-700">
          Result: {winner ? `${winner} won` : "Draw"}{b.winner_method ? ` by ${b.winner_method}` : ""}{b.winner_round ? `, round ${b.winner_round}` : ""}
        </p>
      )}
    </li>
  );
}
