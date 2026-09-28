/**
 * KUNKHMER HUB bookkeeping: cost estimates, the anonymous answer log, the monthly spend cap and
 * the Postgres-backed per-visitor rate limit. See claude/updates/hub-phase-c-hardening.md.
 */
import { createHash, createHmac, randomUUID } from "node:crypto";
import { config } from "../../config.ts";
import { prisma } from "../../db.ts";
import { now } from "../../lib/dates.ts";
import { HttpError } from "../../lib/http.ts";

/** USD per million tokens (Anthropic price list). Unknown models are priced like Opus 5. */
const PRICES: Record<string, { input: number; output: number }> = {
  "claude-opus-5": { input: 5, output: 25 },
  "claude-opus-5-5": { input: 4, output: 20 },
  "claude-opus-4-8": { input: 5, output: 25 },
  "claude-sonnet-5": { input: 2, output: 10 },
  "claude-haiku-4-5": { input: 1, output: 5 },
  "claude-fable-5-1": { input: 10, output: 50 },
};

export interface Tokens {
  input: number;
  output: number;
  cacheRead: number;
  cacheWrite: number;
}

export const noTokens = (): Tokens => ({ input: 0, output: 0, cacheRead: 0, cacheWrite: 0 });

/** Cost of one answer: cache reads at 0.1× and cache writes at 1.25× the input rate. */
export function costUsd(model: string, t: Tokens): number {
  const p = PRICES[model] ?? PRICES["claude-opus-5"];
  const perToken = (usd: number) => usd / 1_000_000;
  return (
    t.input * perToken(p.input) +
    t.output * perToken(p.output) +
    t.cacheRead * perToken(p.input) * 0.1 +
    t.cacheWrite * perToken(p.input) * 1.25
  );
}

// ─── Spend cap ──────────────────────────────────────────────────────────────

const monthStart = () => {
  const d = new Date();
  return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), 1));
};

/** This month's estimated spend; public and staff answers share one cap, `source` narrows it for the admin split. */
export async function monthSpend(source?: "public" | "staff"): Promise<number> {
  const agg = await prisma.hubLog.aggregate({
    _sum: { cost_usd: true },
    where: { created_at: { gte: monthStart() }, ...(source ? { source } : {}) },
  });
  return Number(agg._sum.cost_usd ?? 0);
}

export const capReached = async () => (await monthSpend()) >= config.ai.monthlyCapUsd;

// ─── Answer log (public answers carry no personal data) ─────────────────────

export interface LogEntry {
  conversationId: string | null;
  lang: "en" | "km";
  question: string;
  answer: string;
  outcome: "answered" | "refused" | "too_long" | "error" | "capped";
  tools: string[];
  model: string;
  tokens: Tokens;
  durationMs: number;
  /** Staff assistant answers record who asked; public answers stay anonymous. */
  source?: "public" | "staff";
  userId?: string | null;
}

export async function logAnswer(e: LogEntry): Promise<string> {
  const id = randomUUID();
  await prisma.hubLog.create({
    data: {
      id,
      created_at: now(),
      conversation_id: e.conversationId,
      lang: e.lang,
      question: e.question,
      answer: e.answer,
      outcome: e.outcome,
      tools: e.tools,
      model: e.model,
      input_tokens: e.tokens.input,
      output_tokens: e.tokens.output,
      cache_read_tokens: e.tokens.cacheRead,
      cache_write_tokens: e.tokens.cacheWrite,
      cost_usd: costUsd(e.model, e.tokens).toFixed(6),
      duration_ms: e.durationMs,
      source: e.source ?? "public",
      user_id: e.source === "staff" ? (e.userId ?? null) : null,
    },
  });
  return id;
}

// ─── Rate limit (Postgres) ──────────────────────────────────────────────────

/** Questions per staff member per 10 minutes (owner decision 2026-09-28). */
export const STAFF_RATE_LIMIT = 30;

const WINDOW_MS = 10 * 60_000;
// The IP is keyed with a server-side secret so the stored hash can't be reversed by trying every IPv4 address.
const salt = process.env.AI_RATE_SALT || createHash("sha256").update(`hub:${config.databaseUrl}`).digest("hex");
const hashKey = (key: string) => createHmac("sha256", salt).update(key).digest("hex");

/**
 * Throws 429 once `key` has asked more than `limit` questions in the current 10-minute window.
 * The key is a visitor's IP (limit AI_RATE_LIMIT) or `staff:<user id>` (limit STAFF_RATE_LIMIT).
 */
export async function rateLimit(key: string, limit = config.ai.rateLimit) {
  const windowStart = new Date(Math.floor(Date.now() / WINDOW_MS) * WINDOW_MS);
  const rows = await prisma.$queryRaw<{ count: number }[]>`
    INSERT INTO hub_rate_limits (key, window_start, count) VALUES (${hashKey(key)}, ${windowStart}, 1)
    ON CONFLICT (key, window_start) DO UPDATE SET count = hub_rate_limits.count + 1
    RETURNING count`;
  // Old windows are useless; tidy up now and then.
  if (Math.random() < 0.02) {
    await prisma.hubRateLimit.deleteMany({ where: { window_start: { lt: new Date(Date.now() - 2 * WINDOW_MS) } } });
  }
  if ((rows[0]?.count ?? 0) > limit) {
    throw new HttpError(429, "Too many questions. Please wait a few minutes and try again.");
  }
}
