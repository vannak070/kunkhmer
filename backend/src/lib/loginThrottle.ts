/**
 * Brute-force protection for staff logins: only *failed* attempts count, per IP + username and per IP.
 * In memory, per process (enough for one API instance; use a shared store if it's ever scaled out).
 * See claude/updates/step5a-seo-speed-login.md.
 */
import { config } from "../config.ts";
import { HttpError } from "./http.ts";

const WINDOW_MS = 15 * 60_000;
const failures = new Map<string, { count: number; resetAt: number }>();

const keys = (ip: string, username: string) => [`ip:${ip}`, `user:${ip}:${username.toLowerCase()}`] as const;
const limitFor = (key: string) => (key.startsWith("ip:") ? config.loginIpRateLimit : config.loginRateLimit);

/** Throws 429 (with the seconds to wait) when this IP or IP + username has failed too often. */
export function assertLoginAllowed(ip: string, username: string) {
  const t = Date.now();
  for (const key of keys(ip, username)) {
    const entry = failures.get(key);
    if (entry && entry.resetAt > t && entry.count >= limitFor(key)) {
      const err = new HttpError(429, "Too many attempts. Please wait a few minutes and try again.");
      (err as HttpError & { retryAfter?: number }).retryAfter = Math.ceil((entry.resetAt - t) / 1000);
      throw err;
    }
  }
}

export function recordLoginFailure(ip: string, username: string) {
  const t = Date.now();
  for (const key of keys(ip, username)) {
    const entry = failures.get(key);
    if (!entry || entry.resetAt < t) failures.set(key, { count: 1, resetAt: t + WINDOW_MS });
    else entry.count++;
  }
  if (failures.size > 10_000) {
    for (const [k, v] of failures) if (v.resetAt < t) failures.delete(k);
  }
}

/** A correct password clears that username's counter (the IP counter keeps running). */
export const clearLoginFailures = (ip: string, username: string) => failures.delete(keys(ip, username)[1]);
