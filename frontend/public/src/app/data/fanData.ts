/**
 * Fan-facing data derived from the public API: fight history, next fights, division standings,
 * champions and broadcasters. Loaded once per page session and shared between pages.
 *
 * Demo mode (development builds only): open any page with ?demo=1 to fill empty results and
 * champions with sample data so the UI can be reviewed before real results exist. It is marked
 * with a banner and never runs in production builds. ?demo=0 turns it off again.
 */
import { useEffect, useState } from "react";
import { api } from "../utils/api";
import { type WeightClass, loadWeightClasses, weightClassFor } from "./weightClasses";

export type BoutOutcome = "win" | "loss" | "draw" | "nc";

export interface FighterRef {
  id: string;
  name: string;
  nameKhmer?: string;
  image?: string;
  club?: string;
  record?: string;
}

export interface Bout {
  id: string;
  eventId?: string;
  eventName?: string;
  cardId?: string;
  cardName?: string;
  /** Running order on its card (lowest first). */
  sortOrder: number;
  date?: string;
  status?: string;
  weightKg?: number | null;
  rounds?: number | null;
  isTitle: boolean;
  fighterA: FighterRef;
  fighterB: FighterRef;
  winnerId?: string | null;
  method?: string | null;
  round?: number | null;
  /** "m:ss" when recorded; null when unknown. */
  time?: string | null;
  completed: boolean;
}

export interface HistoryEntry {
  bout: Bout;
  outcome: BoutOutcome;
  opponent: FighterRef;
}

export interface Broadcaster {
  id: string;
  name: string;
  logo?: string;
  type?: string;
  reach?: string;
  websiteUrl?: string | null;
  streamUrl?: string | null;
}

export interface FanData {
  fighters: any[];
  bouts: Bout[];
  events: any[];
  broadcasters: Broadcaster[];
  champions: any[];
  /** Official weight classes (System Settings). */
  weightClasses: WeightClass[];
  demo: boolean;
  /** Part of the data couldn't be loaded (API down / network); pages offer "Try again". */
  failed: boolean;
}

// ─── Demo mode ──────────────────────────────────────────────────────────────

const DEMO_KEY = "kk-demo-data";

export function isDemoMode(): boolean {
  if (!import.meta.env.DEV) return false;
  try {
    const param = new URLSearchParams(window.location.search).get("demo");
    if (param === "1") sessionStorage.setItem(DEMO_KEY, "1");
    if (param === "0") sessionStorage.removeItem(DEMO_KEY);
    return sessionStorage.getItem(DEMO_KEY) === "1";
  } catch {
    return false;
  }
}

const DEMO_METHODS = ["KO", "Decision", "TKO", "Decision", "Referee Stop", "Decision", "Draw"];

/** Pair real fighters into past bouts so history, results and standings have something to show. */
function demoBouts(fighters: any[]): Bout[] {
  if (fighters.length < 2) return [];
  const out: Bout[] = [];
  const today = new Date();
  let n = 0;
  for (let i = 0; i < fighters.length; i++) {
    for (let j = i + 1; j < fighters.length; j++) {
      const a = fighters[i];
      const b = fighters[j];
      const method = DEMO_METHODS[n % DEMO_METHODS.length];
      const winner = method === "Draw" ? null : n % 3 === 0 ? b : a;
      const date = new Date(today);
      date.setDate(today.getDate() - 21 * (n + 1));
      out.push({
        id: `demo-${n}`,
        eventName: "Demo Fight Night",
        cardName: `Demo Card ${n + 1}`,
        sortOrder: 0,
        date: date.toISOString().slice(0, 10),
        status: "Completed",
        weightKg: parseFloat(a.currentWeight) || null,
        rounds: 5,
        isTitle: n === 0,
        fighterA: toRef(a),
        fighterB: toRef(b),
        winnerId: winner?.id ?? null,
        method,
        round: method === "Decision" || method === "Draw" ? 5 : (n % 4) + 1,
        time: method === "Decision" || method === "Draw" ? null : `${(n % 3) + 1}:${String((n * 17) % 60).padStart(2, "0")}`,
        completed: true,
      });
      n++;
    }
  }
  // One upcoming bout so "Next fight" and countdowns can be reviewed.
  const soon = new Date(today);
  soon.setDate(today.getDate() + 12);
  out.push({
    id: "demo-next",
    eventName: "Demo Fight Night",
    sortOrder: 0,
    date: soon.toISOString().slice(0, 10),
    status: "Scheduled",
    weightKg: parseFloat(fighters[0].currentWeight) || null,
    rounds: 5,
    isTitle: true,
    fighterA: toRef(fighters[0]),
    fighterB: toRef(fighters[1]),
    completed: false,
  });
  return out;
}

function demoChampions(fighters: any[], classes: WeightClass[]): any[] {
  const f = fighters[0];
  if (!f) return [];
  return [{
    id: "demo-champion",
    title_name: "KKF National Championship",
    weight_class: weightClassFor(f.currentWeight, classes)?.name ?? "",
    current_holder_id: f.id,
    current_holder_name: f.name,
    status: "Active",
    approval_status: "approved",
  }];
}

// ─── Loading & mapping ──────────────────────────────────────────────────────

function toRef(f: any): FighterRef {
  return {
    id: f.id,
    name: f.name,
    nameKhmer: f.nameKhmer || f.name_khmer || undefined,
    image: f.image || undefined,
    club: f.clubName || f.club_name || undefined,
    record: f.record || undefined,
  };
}

function cleanTime(t?: string | null): string | null {
  if (!t) return null;
  return /^0{1,2}:00$/.test(t.trim()) ? null : t.trim();
}

function mapBout(m: any, fightersById: Map<string, any>): Bout {
  const fa = fightersById.get(m.fighter_a_id);
  const fb = fightersById.get(m.fighter_b_id);
  const hasResult = Boolean(m.winner_id || m.winner_method);
  return {
    id: m.id,
    eventId: m.event_id,
    eventName: m.event_name || m.sub_event?.event_name || undefined,
    cardId: m.sub_event_id || m.sub_event?.id || undefined,
    sortOrder: Number(m.sort_order ?? m.sortOrder ?? 0) || 0,
    cardName: m.sub_event_name || m.sub_event?.name || undefined,
    date: m.date || m.sub_event?.date || undefined,
    status: m.status,
    weightKg: m.agreed_weight ? parseFloat(m.agreed_weight) : null,
    rounds: m.rounds ? Number(m.rounds) : null,
    isTitle: Boolean(m.is_title_match || m.isTitleMatch),
    fighterA: fa ? toRef(fa) : { id: m.fighter_a_id, name: m.fighter_a_name || "TBD", image: m.fighter_a_image, club: m.club_a_name, record: m.fighter_a_record },
    fighterB: fb ? toRef(fb) : { id: m.fighter_b_id, name: m.fighter_b_name || "TBD", image: m.fighter_b_image, club: m.club_b_name, record: m.fighter_b_record },
    winnerId: m.winner_id || null,
    method: m.winner_method || null,
    round: m.winner_round ? Number(m.winner_round) : null,
    time: cleanTime(m.winner_duration || m.winner_time),
    completed: hasResult || m.status === "Completed",
  };
}

let cache: Promise<FanData> | null = null;
let cacheDemo: boolean | null = null;

export function loadFanData(): Promise<FanData> {
  const demo = isDemoMode();
  if (!cache || cacheDemo !== demo) {
    cacheDemo = demo;
    cache = Promise.allSettled([
      api.fighters.list(),
      api.matches.list(),
      api.events.list(),
      api.settings.listBroadcastStations(),
      api.champions.list(),
      loadWeightClasses(),
    ]).then(([f, m, e, b, c, w]) => {
      // Don't keep a partial result around: the next page load retries.
      const failed = [f, m, e, b, c].some((r) => r.status === "rejected");
      if (failed) cache = null;
      const val = <T,>(r: PromiseSettledResult<T>, fallback: T) => (r.status === "fulfilled" && r.value ? r.value : fallback);
      const fighters: any[] = val(f, []);
      const fightersById = new Map(fighters.map((x) => [x.id, x]));
      let bouts: Bout[] = val(m, [] as any[]).map((x: any) => mapBout(x, fightersById));
      let champions: any[] = val(c, [] as any[]).filter((x: any) => (x.approval_status ?? "approved") === "approved");
      const events: any[] = val(e, [] as any[]).filter((x: any) => x.status !== "Draft");
      if (demo) {
        if (!bouts.some((x) => x.completed)) {
          const extra = demoBouts(fighters);
          // Put a few sample results on the latest event so its Results tab can be reviewed.
          const ev = events[0];
          if (ev) {
            extra.slice(0, 3).forEach((x, i) => Object.assign(x, {
              eventId: ev.id, eventName: ev.name, cardId: "demo-card", cardName: "Demo Card", date: String(ev.date).slice(0, 10), sortOrder: i + 1,
            }));
          }
          bouts = [...bouts, ...extra];
        }
        if (champions.length === 0) champions = demoChampions(fighters, val(w, [] as WeightClass[]));
      }
      const broadcasters: Broadcaster[] = val(b, [] as any[])
        .filter((s: any) => s.active !== false)
        .map((s: any) => ({
          id: s.id,
          name: s.name,
          logo: s.logo_url || s.logoUrl || undefined,
          type: s.type || undefined,
          reach: s.reach || undefined,
          websiteUrl: s.website_url || s.websiteUrl || null,
          streamUrl: s.stream_url || s.streamUrl || null,
        }));
      return {
        fighters,
        bouts,
        events,
        broadcasters,
        champions,
        weightClasses: val(w, [] as WeightClass[]),
        demo,
        failed,
      };
    }).catch((): FanData => {
      // Never leave pages spinning: an unexpected error becomes an empty, "failed" result.
      cache = null;
      return { fighters: [], bouts: [], events: [], broadcasters: [], champions: [], weightClasses: [], demo, failed: true };
    });
  }
  return cache;
}

const listeners = new Set<(d: FanData) => void>();

/** "Try again" after a failed load: fetch everything again and update every page using the data. */
export function retryFanData() {
  cache = null;
  loadFanData().then((d) => listeners.forEach((fn) => fn(d)));
}

export function useFanData(): FanData | null {
  const [data, setData] = useState<FanData | null>(null);
  useEffect(() => {
    let alive = true;
    const update = (d: FanData) => alive && setData(d);
    listeners.add(update);
    loadFanData().then(update);
    return () => {
      alive = false;
      listeners.delete(update);
    };
  }, []);
  return data;
}

// ─── Derivations ────────────────────────────────────────────────────────────

const byDateDesc = (a: Bout, b: Bout) => new Date(b.date || 0).getTime() - new Date(a.date || 0).getTime();

export function outcomeFor(bout: Bout, fighterId: string): BoutOutcome {
  const m = (bout.method || "").toLowerCase();
  if (m === "no contest") return "nc";
  if (!bout.winnerId) return "draw";
  return bout.winnerId === fighterId ? "win" : "loss";
}

export function fightHistory(data: FanData, fighterId: string): HistoryEntry[] {
  return data.bouts
    .filter((b) => b.completed && (b.fighterA.id === fighterId || b.fighterB.id === fighterId))
    .sort(byDateDesc)
    .map((bout) => ({
      bout,
      outcome: outcomeFor(bout, fighterId),
      opponent: bout.fighterA.id === fighterId ? bout.fighterB : bout.fighterA,
    }));
}

/** The fighter's next scheduled bout (today or later), if any. */
export function nextBout(data: FanData, fighterId: string): { bout: Bout; opponent: FighterRef } | null {
  const today = new Date().setHours(0, 0, 0, 0);
  const upcoming = data.bouts
    .filter((b) => !b.completed && (b.fighterA.id === fighterId || b.fighterB.id === fighterId))
    .filter((b) => !b.date || new Date(b.date).getTime() >= today)
    .sort((a, b) => new Date(a.date || 0).getTime() - new Date(b.date || 0).getTime());
  const bout = upcoming[0];
  if (!bout) return null;
  return { bout, opponent: bout.fighterA.id === fighterId ? bout.fighterB : bout.fighterA };
}

export function latestResults(data: FanData, limit = 6): Bout[] {
  return data.bouts.filter((b) => b.completed).sort(byDateDesc).slice(0, limit);
}

function parseRecord(record?: string) {
  const [w, l, d] = (record || "0-0-0").split("-").map((n) => parseInt(n) || 0);
  return { wins: w || 0, losses: l || 0, draws: d || 0 };
}

export function broadcasterForEvent(data: FanData, event: any): Broadcaster | null {
  const id = event?.broadcast_station_id;
  return (id && data.broadcasters.find((b) => b.id === id)) || null;
}

/** An event's bouts in programme order: cards by date, then running order on each card. */
export function eventBouts(data: FanData, eventId: string): Bout[] {
  const time = (b: Bout) => new Date(b.date || 0).getTime();
  return data.bouts
    .filter((b) => b.eventId === eventId)
    .sort((a, b) => time(a) - time(b) || (a.cardName || "").localeCompare(b.cardName || "") || a.sortOrder - b.sortOrder);
}

/** The bout to headline an event: the first title bout, otherwise the first bout on the card. */
export function mainEventBout(bouts: Bout[]): Bout | null {
  return bouts.find((b) => b.isTitle) || bouts[0] || null;
}
