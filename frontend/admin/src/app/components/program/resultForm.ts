/**
 * The bout result form, shared by the Match page and Match day (claude/updates/match-day-mode.md): who won
 * (Red / Blue / Draw / No contest), how it ended and the round — and the body the server expects.
 */
import type { TextKey } from "../../i18n/program";
import { hasResult } from "./shared";

export const METHODS = ["KO", "TKO", "Decision", "Disqualification"] as const;
export type Winner = "a" | "b" | "draw" | "nc" | "";
export interface ResultDraft { winner: Winner; method: string; round: string }

export const emptyDraft: ResultDraft = { winner: "", method: "", round: "" };

/** The draft that shows what is already saved on the bout (empty when it has no result). */
export const draftOf = (m: any): ResultDraft => {
  if (!hasResult(m)) return { ...emptyDraft };
  const winner: Winner = m.winner_id === m.fighter_a_id ? "a" : m.winner_id === m.fighter_b_id ? "b" : m.winner_method === "No Contest" ? "nc" : "draw";
  return { winner, method: winner === "a" || winner === "b" ? m.winner_method ?? "" : "", round: m.winner_round ? String(m.winner_round) : "" };
};

/** Choosing a corner keeps method and round; Draw / No contest clear them. */
export const withWinner = (d: ResultDraft, winner: Winner): ResultDraft => ({ winner, ...(winner === "a" || winner === "b" ? { method: d.method, round: d.round } : { method: "", round: "" }) });

/** A decision goes the distance, so its round is the last one. */
export const withMethod = (d: ResultDraft, m: any, method: string): ResultDraft => ({ ...d, method, round: method === "Decision" ? String(m.rounds) : d.round });

/** The body for `saveResult`, the winner it implies, or the text key for what is missing. */
export function resultBody(m: any, d: ResultDraft): { body: { winnerId: string; method: string; round: number; duration: null }; winnerId: string | null } | { error: TextKey } {
  if (!d.winner) return { error: "res.pickWinner" };
  const corner = d.winner === "a" || d.winner === "b";
  if (corner && !d.method) return { error: "res.pickMethod" };
  const round = d.round ? Number(d.round) : corner && d.method === "Decision" ? m.rounds : 0;
  if (corner && d.method !== "Decision" && !round) return { error: "res.pickRound" };
  const winnerId = d.winner === "a" ? m.fighter_a_id : d.winner === "b" ? m.fighter_b_id : null;
  return { winnerId, body: { winnerId: winnerId ?? "", method: corner ? d.method : d.winner === "nc" ? "No Contest" : "Draw", round, duration: null } };
}

/** Changing the winner of a title fight that already has a result moves the belt: staff confirm first. */
export const needsTitleConfirm = (m: any, winnerId: string | null) => Boolean((m.is_title_match ?? m.isTitleMatch) && hasResult(m) && (m.winner_id ?? null) !== winnerId);
