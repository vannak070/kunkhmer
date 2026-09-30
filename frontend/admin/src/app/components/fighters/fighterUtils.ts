/**
 * Shared helpers for the fighter screens (Fighters list, club page, fighter page, register / edit form).
 * Real data only: a fighter's own bouts decide "next bout" and results; weight classes come from
 * Settings › Weight classes. See claude/updates/admin-fighters-clubs.md.
 */
import { APPROVALS_ENABLED } from "../../config/features";

export const weightOf = (f: any): number | null => Number(f?.currentWeight ?? f?.current_weight) || null;

export interface WeightClass { id: string; name: string; name_khmer?: string | null; min_kg: number | null; max_kg: number | null }

/** The official weight class a weight falls in (first match in Settings order). */
export function classFor(kg: number | null, classes: WeightClass[]): WeightClass | null {
  if (kg == null) return null;
  return classes.find((c) => (c.min_kg == null || kg >= Number(c.min_kg)) && (c.max_kg == null || kg <= Number(c.max_kg))) ?? null;
}

export const className = (c: WeightClass | null, lang: string) => (c ? (lang === "km" && c.name_khmer ? c.name_khmer : c.name) : "");

export const isForeign = (f: any) => Boolean(f?.nationality) && f.nationality !== "Cambodian";

export function ageOf(dob?: string | null): number | null {
  if (!dob) return null;
  const b = new Date(`${String(dob).slice(0, 10)}T00:00:00Z`);
  if (Number.isNaN(b.getTime())) return null;
  const n = new Date();
  let age = n.getUTCFullYear() - b.getUTCFullYear();
  if (n.getUTCMonth() < b.getUTCMonth() || (n.getUTCMonth() === b.getUTCMonth() && n.getUTCDate() < b.getUTCDate())) age--;
  return age >= 0 && age < 100 ? age : null;
}

/** "150-25-79" → [150, 25, 79]; null when there is no record. */
export function recordParts(record?: string | null): [number, number, number] | null {
  const m = String(record ?? "").match(/^(\d+)-(\d+)-(\d+)$/);
  return m ? [Number(m[1]), Number(m[2]), Number(m[3])] : null;
}

const today = () => new Date(new Date().toISOString().slice(0, 10)).getTime();
const dayOf = (v?: string | null) => (v ? new Date(String(v).slice(0, 10) + "T00:00:00Z").getTime() : NaN);
export const hasResult = (m: any) => Boolean(m.winner_id || m.winner_method || m.result);

/** A fighter's bouts, newest first. */
export const boutsOf = (fighterId: string, bouts: any[]) =>
  bouts.filter((b) => b.fighter_a_id === fighterId || b.fighter_b_id === fighterId).sort((a, b) => dayOf(b.date) - dayOf(a.date));

/** The fighter's next bout: no result yet, today or later, earliest first. */
export function nextBout(fighterId: string, bouts: any[]): any | null {
  const t = today();
  return boutsOf(fighterId, bouts).filter((b) => !hasResult(b) && dayOf(b.date) >= t).sort((a, b) => dayOf(a.date) - dayOf(b.date))[0] ?? null;
}

export type Outcome = "win" | "loss" | "draw" | "nc";

/** The result of a bout for one fighter; null when there is no result yet. */
export function outcomeFor(b: any, fighterId: string): Outcome | null {
  if (!hasResult(b)) return null;
  const method = String(b.winner_method ?? "").toLowerCase();
  if (method === "no contest") return "nc";
  if (!b.winner_id) return "draw";
  return b.winner_id === fighterId ? "win" : "loss";
}

/** The opponent's name in a bout. */
export const opponentOf = (b: any, fighterId: string) => (b.fighter_a_id === fighterId ? b.fighter_b_name : b.fighter_a_name) || "";

/** Statuses an officer can set. Draft only exists while KKF approvals are switched on. */
export const FIGHTER_STATUSES = APPROVALS_ENABLED ? ["Draft", "Active", "Injured", "Suspended", "Retired"] : ["Active", "Injured", "Suspended", "Retired"];

export const STATUS_TONE: Record<string, string> = {
  Active: "bg-emerald-50 text-emerald-700",
  Injured: "bg-amber-50 text-amber-800",
  Suspended: "bg-red-50 text-red-700",
  Retired: "bg-slate-100 text-slate-600",
  Inactive: "bg-slate-100 text-slate-600",
};

/** Draft / Pending / Rejected all mean "not public yet". */
export const isUnverified = (status?: string | null) => ["Draft", "Pending KKF Verification", "Pending", "Rejected"].includes(String(status ?? ""));

export const FIGHTING_STYLES = ["aggressive", "clinch", "counter", "balanced", "kicking", "boxing"] as const;

export const NATIONALITIES = [
  "Cambodian", "Thai", "Vietnamese", "Lao", "Myanmar", "Indonesian", "Malaysian", "Filipino", "Japanese", "Korean", "Chinese",
  "Indian", "Australian", "American", "British", "French", "German", "Russian", "Brazilian", "Other",
];

export const isRealPhoto = (url?: string | null) => Boolean(url) && !String(url).includes("unsplash.com");

/** Bouts only carry their event id: add the fight night's name for display. */
export function withEventNames(bouts: any[], events: any[]): any[] {
  const names = new Map(events.map((e) => [e.id, e.name]));
  return bouts.map((b) => ({ ...b, event_name: b.event_name ?? names.get(b.event_id) ?? null }));
}

/** Khmer names for the nationality values (same words as the fan site's nationality labels). */
const NATIONALITY_KM: Record<string, string> = {
  Cambodian: "ខ្មែរ", Thai: "ថៃ", Vietnamese: "វៀតណាម", Lao: "ឡាវ", Myanmar: "មីយ៉ាន់ម៉ា", Indonesian: "ឥណ្ឌូណេស៊ី", Malaysian: "ម៉ាឡេស៊ី",
  Filipino: "ហ្វីលីពីន", Japanese: "ជប៉ុន", Korean: "កូរ៉េ", Chinese: "ចិន", Indian: "ឥណ្ឌា", Australian: "អូស្ត្រាលី", American: "អាមេរិក",
  British: "អង់គ្លេស", French: "បារាំង", German: "អាល្លឺម៉ង់", Russian: "រុស្ស៊ី", Brazilian: "ប្រេស៊ីល", Other: "ផ្សេងៗ",
};
export const nationalityLabel = (value: string | null | undefined, lang: string) => (value ? (lang === "km" && NATIONALITY_KM[value]) || value : "");

