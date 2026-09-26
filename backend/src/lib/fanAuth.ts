/**
 * Authentication for public-site fan accounts.
 *
 * Fans use their own tokens ("kkf_" + 32 random bytes, base64url) stored as a
 * SHA-256 hash in fan_sessions. They are unrelated to staff tokens: resolveUser
 * ignores them, so a fan can never reach a staff-only route.
 */
import { createHash, randomBytes, randomUUID } from "node:crypto";
import type { FastifyReply, FastifyRequest } from "fastify";
import { config } from "../config.ts";
import { prisma } from "../db.ts";
import type { Fan } from "../generated/prisma/client.ts";
import { now } from "./dates.ts";
import { HttpError } from "./http.ts";

export const FAN_TOKEN_PREFIX = "kkf_";
const SESSION_DAYS = 90;

const sha256 = (s: string) => createHash("sha256").update(s).digest("hex");

declare module "fastify" {
  interface FastifyRequest {
    fan: Fan | null;
    fanSessionId: string | null;
  }
}

export async function issueFanToken(fanId: string): Promise<string> {
  const token = FAN_TOKEN_PREFIX + randomBytes(32).toString("base64url");
  const at = now();
  await prisma.fanSession.create({
    data: {
      id: randomUUID(),
      fan_id: fanId,
      token_hash: sha256(token),
      created_at: at,
      last_used_at: at,
      expires_at: new Date(at.getTime() + SESSION_DAYS * 86_400_000),
    },
  });
  return token;
}

/** Resolve a fan bearer token (if any) into request.fan. Never rejects. */
export async function resolveFan(request: FastifyRequest) {
  request.fan = null;
  request.fanSessionId = null;
  const header = request.headers.authorization;
  if (!header?.startsWith(`Bearer ${FAN_TOKEN_PREFIX}`)) return;

  const session = await prisma.fanSession.findUnique({
    where: { token_hash: sha256(header.slice(7).trim()) },
    include: { fan: true },
  });
  if (!session || session.expires_at < new Date()) return;

  request.fan = session.fan;
  request.fanSessionId = session.id;
  // Touch at most once an hour to avoid a write on every request.
  if (!session.last_used_at || Date.now() - session.last_used_at.getTime() > 3_600_000) {
    await prisma.fanSession.update({ where: { id: session.id }, data: { last_used_at: now() } });
  }
}

/** preHandler for fan-only routes. */
export async function requireFan(request: FastifyRequest, reply: FastifyReply) {
  if (!request.fan) return reply.code(401).send({ success: false, error: "Please sign in" });
}

export function currentFan(request: FastifyRequest): Fan {
  if (!request.fan) throw new Error("currentFan() used on a route without requireFan");
  return request.fan;
}

export const revokeFanSession = (id: string) => prisma.fanSession.deleteMany({ where: { id } });

// ─── Brute-force protection ─────────────────────────────────────────────────
// In-memory, per process: enough for a single API instance. Use a shared store
// (Redis) if the API is ever scaled horizontally.

const WINDOW_MS = 15 * 60_000;
const attempts = new Map<string, { count: number; resetAt: number }>();

/** Throws 429 after too many attempts for this key within the window. */
export function checkRateLimit(key: string) {
  const t = Date.now();
  const entry = attempts.get(key);
  if (!entry || entry.resetAt < t) {
    attempts.set(key, { count: 1, resetAt: t + WINDOW_MS });
    if (attempts.size > 10_000) {
      for (const [k, v] of attempts) if (v.resetAt < t) attempts.delete(k);
    }
    return;
  }
  entry.count++;
  if (entry.count > config.fanRateLimit) {
    throw new HttpError(429, "Too many attempts. Please wait a few minutes and try again.");
  }
}

export const clearRateLimit = (key: string) => attempts.delete(key);
