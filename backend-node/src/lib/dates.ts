/**
 * Date formatting matching what the Laravel API returned. Several formats are
 * in use and the frontends depend on them, so each serializer picks the one
 * Laravel produced for that field:
 *
 *   micro    2026-09-26T04:59:43.000000Z   model timestamps and datetime/date casts
 *   iso      2026-09-26T04:59:43+00:00     Carbon::toIso8601String()
 *   sql      2026-09-26 04:59:43           timestamp column without a cast
 *   dateOnly 2026-09-26                    date column without a cast
 */

const pad = (n: number, width = 2) => String(n).padStart(width, "0");

function parts(d: Date) {
  return {
    date: `${d.getUTCFullYear()}-${pad(d.getUTCMonth() + 1)}-${pad(d.getUTCDate())}`,
    time: `${pad(d.getUTCHours())}:${pad(d.getUTCMinutes())}:${pad(d.getUTCSeconds())}`,
  };
}

type D = Date | null | undefined;

export const micro = (d: D) => (d ? `${parts(d).date}T${parts(d).time}.000000Z` : null);
export const iso = (d: D) => (d ? `${parts(d).date}T${parts(d).time}+00:00` : null);
export const sql = (d: D) => (d ? `${parts(d).date} ${parts(d).time}` : null);
export const dateOnly = (d: D) => (d ? parts(d).date : null);

/** Current time truncated to whole seconds, as Laravel stores it. */
export const now = () => new Date(Math.floor(Date.now() / 1000) * 1000);

/** Parse a date or datetime string from input the way the DB column would store it. */
export function toDate(value: unknown): Date | null {
  if (value === null || value === undefined || value === "") return null;
  if (value instanceof Date) return value;
  const s = String(value);
  // Plain dates and "Y-m-d H:i:s" strings are UTC wall-clock times.
  const normalized = /^\d{4}-\d{2}-\d{2}$/.test(s)
    ? `${s}T00:00:00Z`
    : /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}(:\d{2})?$/.test(s)
      ? `${s.replace(" ", "T")}Z`
      : s;
  const d = new Date(normalized);
  if (Number.isNaN(d.getTime())) throw new BadInput(`Invalid date: ${s}`);
  return d;
}

export class BadInput extends Error {}
