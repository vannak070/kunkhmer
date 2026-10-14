/**
 * Fields only KKF staff may see. Anyone else (the public site, fans, Organizer and Club/Gym accounts) gets the same
 * response without them: a fighter's medical status and suspension date are health / disciplinary data
 * (claude/updates/hide-fighter-medical-from-public.md). Applied to every API response in app.ts.
 */
const STAFF_ONLY_KEYS = new Set(["medical_status", "suspension_end_date"]);

/** A copy of `value` without the staff-only keys (the original is never changed). */
export function withoutStaffOnlyFields<T>(value: T): T {
  if (Array.isArray(value)) return value.map(withoutStaffOnlyFields) as T;
  if (value && typeof value === "object" && Object.getPrototypeOf(value) === Object.prototype) {
    const out: Record<string, unknown> = {};
    for (const [key, inner] of Object.entries(value)) if (!STAFF_ONLY_KEYS.has(key)) out[key] = withoutStaffOnlyFields(inner);
    return out as T;
  }
  return value;
}
