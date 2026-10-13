/**
 * Shared helpers for the title (championship belt) screens: the list under Program › Champions, a title's page,
 * the add / edit form and "schedule a title bout". See claude/updates/admin-step3-simple-pages.md.
 */

/** Types an officer can choose (same values the fan site groups by). */
export const TITLE_TYPES = [
  "KKF National", "ISKA Cambodia", "IPCC International", "International Belt", "Interim Belt", "Super Fight Belt",
  "Sponsor Belt", "Trophy", "Tournament Winner", "Honorary Award",
] as const;

export const ORGANIZATIONS = ["KKF", "WBC", "WBA", "WMC", "Other"] as const;

/** A title has a champion when a holder is set and the title isn't marked vacant. */
export const titleHeld = (c: any) => Boolean(c?.current_holder_id) && String(c?.status ?? "").toLowerCase() !== "vacant";

export const holderName = (c: any): string => c?.current_holder_name_db || c?.current_holder_name || "";

/** The type in the chosen language ("KKF National" → "ជើងឯកជាតិ KKF"); a type that isn't in the list shows as stored. */
export const typeLabel = (t: (k: any, v?: any) => string, type: string | null | undefined): string => {
  if (!type) return "";
  if (!(TITLE_TYPES as readonly string[]).includes(type)) return type;
  return t(`tt.${type}`);
};
