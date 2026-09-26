/**
 * Matchup metrics for the fight preview ("tale of the tape").
 *
 * Every score is derived from official records so fans can trust it — no hand-typed
 * "power" or "speed" numbers. A metric is null when there isn't enough data to judge it,
 * and the UI leaves it out rather than showing a guess.
 */
import { fightHistory, type FanData } from "./fanData";
import type { MessageKey } from "../i18n/messages";

export type MetricId = "experience" | "winRate" | "form" | "finishing" | "activity" | "durability";

export interface MetricDef {
  id: MetricId;
  label: MessageKey;
  hint: MessageKey;
}

export const METRICS: MetricDef[] = [
  { id: "experience", label: "matchup.metric.experience", hint: "matchup.hint.experience" },
  { id: "winRate", label: "matchup.metric.winRate", hint: "matchup.hint.winRate" },
  { id: "form", label: "matchup.metric.form", hint: "matchup.hint.form" },
  { id: "finishing", label: "matchup.metric.finishing", hint: "matchup.hint.finishing" },
  { id: "activity", label: "matchup.metric.activity", hint: "matchup.hint.activity" },
  { id: "durability", label: "matchup.metric.durability", hint: "matchup.hint.durability" },
];

/** Minimum number of metrics needed before an overall rating or radar chart is shown. */
export const MIN_METRICS_FOR_RATING = 3;

/** A lead smaller than this (on the 0–100 scale) is shown as even. */
export const EDGE_THRESHOLD = 3;

const STOPPAGE = /\b(ko|tko|referee|stop|knock)/i;
const FIGHTS_PER_YEAR_FOR_FULL_ACTIVITY = 6;

export interface FighterProfile {
  id: string;
  name: string;
  nameKhmer?: string;
  image?: string;
  club?: string;
  nationality?: string;
  record: { wins: number; losses: number; draws: number; total: number };
  age: number | null;
  heightCm: number | null;
  weightKg: number | null;
  metrics: Record<MetricId, number | null>;
  /** 0–100 average of the metrics that could be calculated, or null. */
  rating: number | null;
}

function parseRecord(record?: string) {
  const [wins, losses, draws] = (record || "0-0-0").split("-").map((n) => parseInt(n) || 0);
  return { wins, losses, draws, total: wins + losses + draws };
}

function ageFrom(dob?: string | null): number | null {
  if (!dob) return null;
  const d = new Date(dob);
  if (isNaN(d.getTime())) return null;
  const now = new Date();
  return now.getFullYear() - d.getFullYear() - (now < new Date(now.getFullYear(), d.getMonth(), d.getDate()) ? 1 : 0);
}

const clamp = (n: number) => Math.max(0, Math.min(100, Math.round(n)));

export function buildProfile(data: FanData, fighter: any): FighterProfile {
  const record = parseRecord(fighter.record);
  const history = fightHistory(data, fighter.id);
  // Experience is relative to the most experienced fighter on the roster.
  const rosterMax = Math.max(1, ...data.fighters.map((f) => parseRecord(f.record).total));

  const recent = history.slice(0, 5);
  const recordedWins = history.filter((h) => h.outcome === "win");
  const recordedLosses = history.filter((h) => h.outcome === "loss");
  const yearAgo = Date.now() - 365 * 86_400_000;
  const lastYear = history.filter((h) => new Date(h.bout.date || 0).getTime() >= yearAgo);

  const metrics: Record<MetricId, number | null> = {
    experience: record.total ? clamp((Math.log(record.total + 1) / Math.log(rosterMax + 1)) * 100) : null,
    winRate: record.total ? clamp((record.wins / record.total) * 100) : null,
    form: recent.length
      ? clamp((recent.reduce((s, h) => s + (h.outcome === "win" ? 1 : h.outcome === "draw" ? 0.5 : 0), 0) / recent.length) * 100)
      : null,
    finishing: recordedWins.length
      ? clamp((recordedWins.filter((h) => STOPPAGE.test(h.bout.method || "")).length / recordedWins.length) * 100)
      : null,
    activity: history.length ? clamp((lastYear.length / FIGHTS_PER_YEAR_FOR_FULL_ACTIVITY) * 100) : null,
    durability: history.length
      ? clamp(100 - (recordedLosses.filter((h) => STOPPAGE.test(h.bout.method || "")).length / history.length) * 100)
      : null,
  };

  const known = Object.values(metrics).filter((v): v is number => v != null);

  return {
    id: fighter.id,
    name: fighter.name,
    nameKhmer: fighter.nameKhmer || undefined,
    image: fighter.image || undefined,
    club: fighter.clubName || undefined,
    nationality: fighter.nationality && fighter.nationality !== "Other" ? fighter.nationality : undefined,
    record,
    age: ageFrom(fighter.dateOfBirth || fighter.date_of_birth),
    heightCm: parseFloat(fighter.height) || null,
    weightKg: parseFloat(fighter.currentWeight || fighter.current_weight) || null,
    metrics,
    rating: known.length >= MIN_METRICS_FOR_RATING ? clamp(known.reduce((a, b) => a + b, 0) / known.length) : null,
  };
}

/** Which corner leads on a number, or null when level / not comparable. */
export function edge(red: number | null, blue: number | null, threshold = 0, higherIsBetter = true): "red" | "blue" | null {
  if (red == null || blue == null) return null;
  const diff = higherIsBetter ? red - blue : blue - red;
  if (Math.abs(diff) <= threshold) return null;
  return diff > 0 ? "red" : "blue";
}

/** Metrics both fighters have values for — only these are charted. */
export function sharedMetrics(a: FighterProfile, b: FighterProfile): MetricDef[] {
  return METRICS.filter((m) => a.metrics[m.id] != null && b.metrics[m.id] != null);
}

/** Overall 0–100 rating over a given set of metrics, so both corners are scored on the same basis. */
export function ratingOn(profile: FighterProfile, metrics: MetricDef[]): number | null {
  const vals = metrics.map((m) => profile.metrics[m.id]).filter((v): v is number => v != null);
  // With fewer than three metrics the "overall" number would just echo win rate — don't show one.
  return vals.length >= MIN_METRICS_FOR_RATING ? clamp(vals.reduce((a, b) => a + b, 0) / vals.length) : null;
}
