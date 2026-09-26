/**
 * Everything the dashboard and the header bell need, computed from real API data:
 * the "Needs your attention" to-do list, headline numbers, upcoming events and recent results.
 * Loaded once and shared; call refresh() after an action (e.g. approving a fighter).
 */
import { useCallback, useEffect, useState } from "react";
import { api } from "../utils/api";

export type TodoKind = "fighter" | "result" | "draftEvent" | "emptyEvent" | "unconfirmed" | "vacantTitle";

export interface TodoItem {
  kind: TodoKind;
  id: string;
  title: string;
  detail: string;
  href: string;
  /** Sort key: most urgent first (lower = sooner). */
  rank: number;
  fighterId?: string;
}

export interface Overview {
  todos: TodoItem[];
  counts: Record<TodoKind, number>;
  stats: { activeFighters: number; clubs: number; upcomingEvents: number; recordedResults: number };
  upcoming: { id: string; name: string; date: string; location: string; bouts: number; status: string }[];
  recent: { id: string; red: string; blue: string; winner: string | null; method: string | null; round: number | null; date: string | null; event: string | null }[];
  loadedAt: number;
}

const DAY = 86_400_000;
const todayUtc = () => new Date(new Date().toISOString().slice(0, 10)).getTime();
const time = (d?: string | null) => (d ? new Date(d).getTime() : NaN);
const fmtDate = (d?: string | null) =>
  d ? new Date(d).toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" }) : "no date";

const AWAITING = new Set(["Draft", "Pending KKF Verification", "Pending"]);
const CLOSED_EVENT = new Set(["Cancelled", "Completed"]);

async function build(): Promise<Overview> {
  const [fighters, events, matches, champions, clubs] = await Promise.all([
    api.fighters.list().catch(() => []),
    api.events.list().catch(() => []),
    api.matches.list().catch(() => []),
    api.champions.list().catch(() => []),
    api.clubs.list().catch(() => []),
  ]);
  const today = todayUtc();
  const todos: TodoItem[] = [];

  for (const f of fighters as any[]) {
    if (!AWAITING.has(f.status)) continue;
    todos.push({
      kind: "fighter",
      id: `f-${f.id}`,
      fighterId: f.id,
      title: f.name,
      detail: [f.clubName, f.status === "Draft" ? "registered, not yet verified" : "waiting for KKF verification"].filter(Boolean).join(" · "),
      href: `/home/fighters/${f.id}`,
      rank: 2,
    });
  }

  const eventById = new Map((events as any[]).map((e) => [e.id, e]));
  const boutsByEvent = new Map<string, number>();
  for (const m of matches as any[]) boutsByEvent.set(m.event_id, (boutsByEvent.get(m.event_id) ?? 0) + 1);

  for (const m of matches as any[]) {
    const ev = eventById.get(m.event_id);
    if (!ev || ev.status === "Cancelled" || m.status === "Cancelled") continue;
    const hasResult = Boolean(m.winner_id || m.winner_method || m.result);
    const d = time(m.date);
    const vs = `${m.fighter_a_name ?? "TBD"} vs ${m.fighter_b_name ?? "TBD"}`;
    if (!hasResult && d < today) {
      todos.push({ kind: "result", id: `r-${m.id}`, title: vs, detail: `${ev.name} · ${fmtDate(m.date)} · no result recorded`, href: `/home/match/${m.id}`, rank: 1 });
    } else if (!hasResult && d >= today && d - today <= 14 * DAY && !(m.fighter_a_confirmed && m.fighter_b_confirmed)) {
      const missing = [!m.fighter_a_confirmed && m.fighter_a_name, !m.fighter_b_confirmed && m.fighter_b_name].filter(Boolean).join(" and ");
      todos.push({ kind: "unconfirmed", id: `u-${m.id}`, title: vs, detail: `${ev.name} · ${fmtDate(m.date)} · ${missing || "fighters"} not confirmed`, href: `/home/matches/${m.sub_event_id}`, rank: 3 });
    }
  }

  for (const e of events as any[]) {
    const d = time(e.date);
    if (e.status === "Draft") {
      todos.push({ kind: "draftEvent", id: `d-${e.id}`, title: e.name, detail: `${fmtDate(e.date)} · still a draft, not visible to fans`, href: `/home/events/${e.id}`, rank: d >= today ? 2 : 5 });
    } else if (!CLOSED_EVENT.has(e.status) && d >= today && !boutsByEvent.get(e.id)) {
      todos.push({ kind: "emptyEvent", id: `e-${e.id}`, title: e.name, detail: `${fmtDate(e.date)} · no fight card yet`, href: `/home/events/${e.id}`, rank: 3 });
    }
  }

  for (const c of (champions as any[]).filter((c) => (c.approval_status ?? "approved") === "approved")) {
    if (c.status === "Vacant" || !c.current_holder_id) {
      todos.push({ kind: "vacantTitle", id: `t-${c.id}`, title: c.title_name, detail: "title is vacant · schedule a title bout", href: `/home/champion/${c.id}/schedule-defense`, rank: 4 });
    }
  }

  todos.sort((a, b) => a.rank - b.rank || a.title.localeCompare(b.title));
  const counts = { fighter: 0, result: 0, draftEvent: 0, emptyEvent: 0, unconfirmed: 0, vacantTitle: 0 } as Record<TodoKind, number>;
  for (const t of todos) counts[t.kind]++;

  const upcoming = (events as any[])
    .filter((e) => time(e.date) >= today && e.status !== "Cancelled")
    .sort((a, b) => time(a.date) - time(b.date))
    .slice(0, 4)
    .map((e) => ({ id: e.id, name: e.name, date: e.date, location: e.location, bouts: boutsByEvent.get(e.id) ?? 0, status: e.status }));

  const recent = (matches as any[])
    .filter((m) => m.winner_id || m.winner_method)
    .sort((a, b) => time(b.date) - time(a.date))
    .slice(0, 5)
    .map((m) => ({
      id: m.id,
      red: m.fighter_a_name ?? "TBD",
      blue: m.fighter_b_name ?? "TBD",
      winner: m.winner_id === m.fighter_a_id ? m.fighter_a_name : m.winner_id === m.fighter_b_id ? m.fighter_b_name : null,
      method: m.winner_method ?? null,
      round: m.winner_round ?? null,
      date: m.date ?? null,
      event: eventById.get(m.event_id)?.name ?? null,
    }));

  return {
    todos,
    counts,
    stats: {
      activeFighters: (fighters as any[]).filter((f) => f.status === "Active").length,
      clubs: (clubs as any[]).length,
      upcomingEvents: (events as any[]).filter((e) => time(e.date) >= today && !CLOSED_EVENT.has(e.status) && e.status !== "Draft").length,
      recordedResults: (matches as any[]).filter((m) => m.winner_id || m.winner_method).length,
    },
    upcoming,
    recent,
    loadedAt: Date.now(),
  };
}

// One shared copy for the dashboard and the bell.
let cached: Overview | null = null;
let inflight: Promise<Overview> | null = null;
const listeners = new Set<(o: Overview) => void>();

function load(force = false): Promise<Overview> {
  if (!force && cached && Date.now() - cached.loadedAt < 60_000) return Promise.resolve(cached);
  if (!inflight) {
    inflight = build()
      .then((o) => {
        cached = o;
        listeners.forEach((l) => l(o));
        return o;
      })
      .finally(() => {
        inflight = null;
      });
  }
  return inflight;
}

export function useAdminOverview() {
  const [data, setData] = useState<Overview | null>(cached);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    listeners.add(setData);
    load().then(setData).catch((e) => setError(e instanceof Error ? e.message : "Could not load the overview."));
    return () => {
      listeners.delete(setData);
    };
  }, []);

  const refresh = useCallback(() => load(true).then(setData), []);
  return { data, error, refresh };
}
