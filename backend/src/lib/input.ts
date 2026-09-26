/**
 * Request body handling shared by all routes:
 *  - strings are trimmed (except password fields) and "" becomes null
 *  - `has(key)`: the key is present and not null
 *  - `get(key, fallback)`: the value, or the fallback when missing or null
 *  - `present(key)`: the key was sent at all, even as null/"" (to clear a field)
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

  /** The key exists and is not null. */
  has(key: string): boolean {
    return this.body[key] !== undefined && this.body[key] !== null;
  }

  /** The value, or the fallback when the key is missing or null. */
  get<T = any>(key: string): T | null;
  get<T = any>(key: string, fallback: T): T;
  get<T = any>(key: string, fallback: T | null = null): T | null {
    return this.has(key) ? this.body[key] : fallback;
  }

  /** A value that must be present; 422 "The <key> field is required" otherwise. */
  required<T = any>(key: string): T {
    if (!this.has(key) || this.body[key] === false) throw new HttpError(422, `The ${key} field is required`);
    return this.body[key];
  }

  /** The key was sent, even if its value is null. */
  present(key: string): boolean {
    return key in this.body;
  }

  /** Maps every present (non-null) camelCase input key to its column name. */
  pick(mapping: Record<string, string>): Record<string, any> {
    const out: Record<string, any> = {};
    for (const [inputKey, column] of Object.entries(mapping)) {
      if (this.has(inputKey)) out[column] = this.body[inputKey];
    }
    return out;
  }
}

export const inputOf = (body: unknown) => new Input((body && typeof body === "object" ? body : {}) as Body);

/** Lenient boolean: true, 1, and the strings "1", "true", "on", "yes" are true. */
export function parseBool(value: unknown): boolean {
  if (typeof value === "boolean") return value;
  if (typeof value === "number") return value === 1;
  if (typeof value === "string") return ["1", "true", "on", "yes"].includes(value.toLowerCase());
  return false;
}

/** Truthiness: false, 0, "0", "" and null are false; anything else is true. */
export function isTruthy(value: unknown): boolean {
  return !(value === false || value === 0 || value === "0" || value === "" || value === null || value === undefined);
}

/** Tags given as an array or a comma-separated string. */
export function parseTags(value: unknown): string[] {
  if (Array.isArray(value)) return value;
  if (!value) return [];
  return String(value)
    .split(",")
    .map((t) => t.trim());
}
