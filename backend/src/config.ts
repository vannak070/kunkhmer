import type { FastifyServerOptions } from "fastify";
import { trustOwnProxy } from "./lib/clientIp.ts";

try {
  process.loadEnvFile();
} catch {}

function required(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`Missing required environment variable ${name}`);
  return value;
}

export const config = {
  databaseUrl: required("DATABASE_URL"),
  port: Number(process.env.PORT ?? 3001),
  host: process.env.HOST ?? "0.0.0.0",
  logLevel: process.env.LOG_LEVEL ?? "info",
  /** Where uploaded pictures are stored (served at /api/files/:name). Must persist between deploys. */
  uploadDir: process.env.UPLOAD_DIR || new URL("../storage/uploads", import.meta.url).pathname,
  /**
   * TRUST_PROXY: proxies trusted for request.ip (comma-separated addresses/CIDRs or a hop count).
   * Unset = one hop from localhost / a private network (lib/clientIp.ts).
   */
  trustProxy: (/^\d+$/.test(process.env.TRUST_PROXY ?? "")
    ? Number(process.env.TRUST_PROXY)
    : process.env.TRUST_PROXY || trustOwnProxy) as FastifyServerOptions["trustProxy"],
  /** Fan sign-in / sign-up attempts allowed per 15 minutes (per IP, and per IP + email for sign-in). */
  fanRateLimit: Number(process.env.FAN_RATE_LIMIT ?? 10),
  /** Failed staff logins allowed per IP + username per 15 minutes. */
  loginRateLimit: Number(process.env.LOGIN_RATE_LIMIT ?? 10),
  /** Failed staff logins allowed per IP (any username) per 15 minutes. */
  loginIpRateLimit: Number(process.env.LOGIN_IP_RATE_LIMIT ?? 50),
  /** The fan site's public address, for absolute links in sitemap.xml (e.g. https://kunkhmer.com). */
  /**
   * KKF approval steps (event approval, club answers on bouts, fighter verification). Off by default:
   * KKF staff run the whole Program flow (claude/updates/officer-run-program.md). APPROVALS_ENABLED=true brings them back.
   */
  approvals: process.env.APPROVALS_ENABLED === "true",
  publicSiteUrl: (process.env.PUBLIC_SITE_URL || "http://localhost:5176").replace(/\/$/, ""),
  /** "Ask Kun Khmer" AI chat. Off unless a key is set; AI_ENABLED=false forces it off (tests). */
  ai: {
    apiKey: process.env.ANTHROPIC_API_KEY ?? "",
    enabled: process.env.AI_ENABLED !== "false" && Boolean(process.env.ANTHROPIC_API_KEY),
    model: process.env.AI_MODEL ?? "claude-opus-5",
    /** Chat requests allowed per IP per 10 minutes. */
    rateLimit: Number(process.env.AI_RATE_LIMIT ?? 20),
    /** Monthly spending limit in USD (estimated from token usage); the Hub pauses when reached. */
    monthlyCapUsd: Number(process.env.AI_MONTHLY_CAP_USD ?? 50),
  },
};
