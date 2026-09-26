/**
 * Request body handling that mirrors Laravel's defaults, so controllers
 * ported from PHP behave the same:
 *  - strings are trimmed (except password fields) and "" becomes null
 *    (Laravel's TrimStrings + ConvertEmptyStringsToNull middleware)
 *  - `has(key)` is PHP's isset(): present and not null
 *  - `get(key, fallback)` is PHP's `??`: fallback when missing or null
 */

import { HttpError } from "./http.ts";

const UNTRIMMED = new Set(["password", "current_password", "password_confirmation"]);

export function normalizeBody(value: unknown, key?: string): unknown {
  if (typeof value === "string") {
    const s = key && UNTRIMMED.has(key) ? value : value.trim();
    return s === "" ? null : s;
  }
  if (Array.isArray(value)) return value.map((v) => normalizeBody(v));
  if (value && typeof value === "object") {
    return Object.fromEntries(Object.entries(value).map(([k, v]) => [k, normalizeBody(v, k)]));
  }
  return value;
}

export type Body = Record<string, any>;

export class Input {
  constructor(readonly body: Body) {}

  /** PHP isset(): the key exists and is not null. */
  has(key: string): boolean {
    return this.body[key] !== undefined && this.body[key] !== null;
  }

  /** PHP `$input[key] ?? fallback`. */
  get<T = any>(key: string): T | null;
  get<T = any>(key: string, fallback: T): T;
  get<T = any>(key: string, fallback: T | null = null): T | null {
    return this.has(key) ? this.body[key] : fallback;
  }

  /** A value that must be present; 422 with Laravel's wording otherwise. */
  required<T = any>(key: string): T {
    if (!this.has(key) || this.body[key] === false) throw new HttpError(422, `The ${key} field is required`);
    return this.body[key];
  }

  /** PHP `$request->has(key)`: the key is present, even if null. */
  present(key: string): boolean {
    return key in this.body;
  }

  /** Maps every present (isset) camelCase input key to its column name. */
  pick(mapping: Record<string, string>): Record<string, any> {
    const out: Record<string, any> = {};
    for (const [inputKey, column] of Object.entries(mapping)) {
      if (this.has(inputKey)) out[column] = this.body[inputKey];
    }
    return out;
  }
}

export const inputOf = (body: unknown) => new Input((body && typeof body === "object" ? body : {}) as Body);

/** PHP filter_var($v, FILTER_VALIDATE_BOOLEAN): "1", "true", "on", "yes" are true. */
export function phpBool(value: unknown): boolean {
  if (typeof value === "boolean") return value;
  if (typeof value === "number") return value === 1;
  if (typeof value === "string") return ["1", "true", "on", "yes"].includes(value.toLowerCase());
  return false;
}

/** Tags given as an array or a comma-separated string. */
export function parseTags(value: unknown): string[] {
  if (Array.isArray(value)) return value;
  if (!value) return [];
  return String(value)
    .split(",")
    .map((t) => t.trim());
}
