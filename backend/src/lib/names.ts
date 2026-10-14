/**
 * Comparing fighter names (duplicate checks): Latin names without case, accents, spaces or punctuation; Khmer names
 * without spaces / zero-width characters; a small edit distance (≤ 2 means "similar"). Used by the Staff assistant's
 * duplicate list and the "possible same fighter" check when adding a fighter (claude/updates/duplicate-fighter-warning.md).
 */
export const latin = (s: string | null | undefined) => (s ?? "").toLowerCase().normalize("NFKD").replace(/[^a-z0-9]/g, "");
export const khmer = (s: string | null | undefined) => (s ?? "").replace(/[\s​‌‍]/g, "");
/** The words of a Latin name in alphabetical order ("Sambath Pich" = "Pich Sambath"). */
export const latinWords = (s: string | null | undefined) =>
  (s ?? "").toLowerCase().normalize("NFKD").replace(/[^a-z0-9\s]/g, " ").split(/\s+/).filter(Boolean).sort().join(" ");

/** Edit distance, capped: anything over 2 apart returns 3. */
export function editDistance(a: string, b: string): number {
  if (Math.abs(a.length - b.length) > 2) return 3;
  const row = Array.from({ length: b.length + 1 }, (_, i) => i);
  for (let i = 1; i <= a.length; i++) {
    let prev = row[0];
    row[0] = i;
    for (let j = 1; j <= b.length; j++) {
      const tmp = row[j];
      row[j] = Math.min(row[j] + 1, row[j - 1] + 1, prev + (a[i - 1] === b[j - 1] ? 0 : 1));
      prev = tmp;
    }
  }
  return row[b.length];
}
