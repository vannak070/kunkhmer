/**
 * Khmer lunar date (ចន្ទគតិ) for the program sheet (claude/updates/sheet-like-paper-week-print.md):
 * "ថ្ងៃសៅរ៍ ១២រោច ខែអស្សុជ ឆ្នាំមមី អដ្ឋស័ក" (no Buddhist year: the owner left it off, 2026-11-09).
 *
 * Month lengths follow the traditional calendar rules (chhankitek): months alternate 29 / 30 days; a year is normal
 * (354 days), has a leap day (ជេស្ឋ has 30 days, 355) or a leap month (two អាសាឍ months of 30 days, 384). The kind
 * of year comes from the aharkun / bodithey / avoman calculation. Days are counted from a date KKF printed:
 * 10 Nov 2026 = ១កើត ខែកត្តិក. Animal year and era (ស័ក) change at Khmer New Year, taken as 14 April.
 */
const KM_DIGITS = "០១២៣៤៥៦៧៨៩";
const km = (n: number | string) => String(n).replace(/\d/g, (d) => KM_DIGITS[Number(d)]);

const WEEKDAYS = ["អាទិត្យ", "ចន្ទ", "អង្គារ", "ពុធ", "ព្រហស្បតិ៍", "សុក្រ", "សៅរ៍"];
const ANIMALS = ["ជូត", "ឆ្លូវ", "ខាល", "ថោះ", "រោង", "ម្សាញ់", "មមី", "មមែ", "វក", "រកា", "ច", "កុរ"];
const ERAS = ["សំរឹទ្ធិស័ក", "ឯកស័ក", "ទោស័ក", "ត្រីស័ក", "ចត្វាស័ក", "បញ្ចស័ក", "ឆស័ក", "សប្តស័ក", "អដ្ឋស័ក", "នព្វស័ក"];

const DAY = 86_400_000;
const utcDay = (y: number, m: number, d: number) => Math.floor(Date.UTC(y, m, d) / DAY);

// ── Kind of lunar year (by Buddhist year) ──────────────────────────────────────
const aharkun = (be: number) => Math.floor((be * 292207 + 499) / 800) + 4;
const kromthupul = (be: number) => 800 - ((be * 292207 + 499) % 800);
const avoman = (be: number) => (11 * aharkun(be) + 25) % 692;
const bodithey = (be: number) => (aharkun(be) + Math.floor((11 * aharkun(be) + 25) / 692)) % 30;
const solarLeap = (be: number) => kromthupul(be) <= 207;

function boditheyLeap(be: number) {
  const b = bodithey(be);
  let monthLeap = b >= 25 || b <= 5 ? 1 : 0;
  let dayLeap = 0;
  if (solarLeap(be)) {
    if (avoman(be) <= 126) dayLeap = 1;
  } else if (avoman(be) <= 137) {
    dayLeap = avoman(be + 1) === 0 ? 0 : 1;
  }
  if (b === 25 && bodithey(be + 1) === 5) monthLeap = 0;
  if (b === 24 && bodithey(be + 1) === 6) monthLeap = 1;
  return monthLeap && dayLeap ? 3 : monthLeap ? 1 : dayLeap ? 2 : 0;
}

/** 0 normal · 1 leap month · 2 leap day. */
export function yearKind(be: number): 0 | 1 | 2 {
  const b = boditheyLeap(be);
  if (b === 3) return 1;
  if (b === 1 || b === 2) return b;
  return boditheyLeap(be - 1) === 3 ? 2 : 0;
}

// ── Months of one lunar year (មិគសិរ … កត្តិក) ─────────────────────────────────
type Month = { name: string; days: number };
function monthsOf(kind: number): Month[] {
  const m: Month[] = [
    { name: "មិគសិរ", days: 29 }, { name: "បុស្ស", days: 30 }, { name: "មាឃ", days: 29 }, { name: "ផល្គុន", days: 30 },
    { name: "ចេត្រ", days: 29 }, { name: "ពិសាខ", days: 30 }, { name: "ជេស្ឋ", days: kind === 2 ? 30 : 29 },
  ];
  if (kind === 1) m.push({ name: "បឋមាសាឍ", days: 30 }, { name: "ទុតិយាសាឍ", days: 30 });
  else m.push({ name: "អាសាឍ", days: 30 });
  m.push({ name: "ស្រាពណ៍", days: 29 }, { name: "ភទ្របទ", days: 30 }, { name: "អស្សុជ", days: 29 }, { name: "កត្តិក", days: 30 });
  return m;
}

/** The lunar year that ends with កត្តិក of Gregorian year `g` takes its kind from Buddhist year YEAR_OFFSET + g. */
export const YEAR_OFFSET = 544;
const yearLength = (g: number) => monthsOf(yearKind(g + YEAR_OFFSET)).reduce((s, m) => s + m.days, 0);

// Anchor: 10 Nov 2026 = ១កើត ខែកត្តិក (KKF sheet) → the lunar year ending with កត្តិក 2026 started on…
const ANCHOR_G = 2026;
const ANCHOR_YEAR_START = (() => {
  const months = monthsOf(yearKind(ANCHOR_G + YEAR_OFFSET));
  const beforeKadeuk = months.slice(0, -1).reduce((s, m) => s + m.days, 0);
  return utcDay(2026, 10, 10) - beforeKadeuk;
})();

export interface LunarDate {
  day: number; // 1–15
  waxing: boolean; // កើត / រោច
  month: string;
  animal: string;
  era: string;
}

export function lunarDate(date: Date): LunarDate {
  const t = Math.floor(date.getTime() / DAY);
  // Find the lunar year (named by the Gregorian year of its កត្តិក) holding the day.
  let g = ANCHOR_G;
  let start = ANCHOR_YEAR_START;
  while (t < start) { g -= 1; start -= yearLength(g); }
  while (t >= start + yearLength(g)) { start += yearLength(g); g += 1; }
  let offset = t - start;
  const months = monthsOf(yearKind(g + YEAR_OFFSET));
  let mi = 0;
  while (offset >= months[mi].days) { offset -= months[mi].days; mi += 1; }
  const month = months[mi].name;
  const waxing = offset < 15;
  const day = waxing ? offset + 1 : offset - 14;

  const gy = date.getUTCFullYear();
  const afterNewYear = date.getUTCMonth() > 3 || (date.getUTCMonth() === 3 && date.getUTCDate() >= 14);
  const sy = afterNewYear ? gy : gy - 1; // the year counted from Khmer New Year
  const animal = ANIMALS[(((sy - 2020) % 12) + 12) % 12];
  const era = ERAS[(sy - 638) % 10];
  return { day, waxing, month, animal, era };
}

/** "ថ្ងៃសៅរ៍ ១២រោច ខែអស្សុជ ឆ្នាំមមី អដ្ឋស័ក" */
export function lunarLine(date: Date) {
  const l = lunarDate(date);
  return `ថ្ងៃ${WEEKDAYS[date.getUTCDay()]} ${km(l.day)}${l.waxing ? "កើត" : "រោច"} ខែ${l.month} ឆ្នាំ${l.animal} ${l.era}`;
}
