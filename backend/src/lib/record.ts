/**
 * Fighter W-L-D records (claude/updates/program-officer-friendly.md): the record shown everywhere is the
 * career before this system (`fighters.career_record`) plus the results recorded here.
 */
import type { Prisma } from "../generated/prisma/client.ts";
import { prisma } from "../db.ts";
import { HttpError } from "./http.ts";

export interface Wld {
  w: number;
  l: number;
  d: number;
}

export const ZERO: Wld = { w: 0, l: 0, d: 0 };
const PATTERN = /^\s*(\d{1,4})\s*-\s*(\d{1,4})\s*-\s*(\d{1,4})\s*$/;

/** "10-2-1" → {w,l,d}; null for empty or unreadable text. */
export function parseRecord(value: string | null | undefined): Wld | null {
  const m = value?.match(PATTERN);
  return m ? { w: Number(m[1]), l: Number(m[2]), d: Number(m[3]) } : null;
}

/** Like parseRecord, but a non-empty value that isn't W-L-D is a 422. */
export function requireRecord(value: string | null | undefined): Wld | null {
  if (value === null || value === undefined || value.trim() === "") return null;
  const r = parseRecord(value);
  if (!r) throw new HttpError(422, "The record must look like 10-2-1 (wins-losses-draws)");
  return r;
}

export const formatRecord = (r: Wld) => `${r.w}-${r.l}-${r.d}`;
export const addRecords = (a: Wld, b: Wld): Wld => ({ w: a.w + b.w, l: a.l + b.l, d: a.d + b.d });

/** W-L-D from the results recorded in this system (a draw = result without a winner; a no contest doesn't count). */
export async function recordedResults(tx: Prisma.TransactionClient | typeof prisma, fighterId: string): Promise<Wld> {
  const matches = await tx.match.findMany({
    where: { status: "Completed", OR: [{ fighter_a_id: fighterId }, { fighter_b_id: fighterId }] },
    include: { result: true },
  });
  const r = { ...ZERO };
  for (const m of matches) {
    if (!m.result || /^no contest$/i.test(m.result.method ?? "")) continue;
    if (m.result.winner_id === fighterId) r.w++;
    else if (m.result.winner_id === null) r.d++;
    else r.l++;
  }
  return r;
}
