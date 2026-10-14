/**
 * Optional date window for list endpoints (claude/updates/admin-performance.md): `?from=YYYY-MM-DD&to=YYYY-MM-DD` on
 * the match date, so a page asks for the weeks it shows instead of the whole history. Either end can be left out.
 */
import { toDate } from "./dates.ts";

export function dateWindow(query: unknown): { gte?: Date; lte?: Date } | undefined {
  const { from, to } = (query ?? {}) as { from?: string; to?: string };
  const gte = from ? toDate(from) : null;
  const lte = to ? toDate(to) : null;
  if (!gte && !lte) return undefined;
  return { ...(gte ? { gte } : {}), ...(lte ? { lte } : {}) };
}
