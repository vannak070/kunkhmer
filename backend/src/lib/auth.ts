/**
 * Bearer-token authentication, compatible with Laravel Sanctum's
 * personal_access_tokens table so tokens issued by either backend work:
 *
 *   plain token  = "<row id>|<40 random chars><crc32 of them, 8 hex>"
 *   stored token = sha256(everything after the "|")
 */
import { createHash, randomInt, timingSafeEqual } from "node:crypto";
import { crc32 } from "node:zlib";
import type { FastifyReply, FastifyRequest } from "fastify";
import { prisma } from "../db.ts";
import type { User } from "../generated/prisma/client.ts";
import { now } from "./dates.ts";
import { forbidden } from "./http.ts";

const TOKENABLE_TYPE = "App\\Models\\User";
const ALPHANUMERIC = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

const sha256 = (s: string) => createHash("sha256").update(s).digest("hex");

export const Role = {
  SuperAdmin: "Super Admin",
  KkfOfficer: "KKF Officer",
  Organizer: "Organizer",
  Club: "Club/Gym",
} as const;

/** KKF staff: Super Admin or KKF Officer. */
export const STAFF = [Role.SuperAdmin, Role.KkfOfficer];

declare module "fastify" {
  interface FastifyRequest {
    user: User | null;
    tokenId: bigint | null;
  }
}

export async function issueToken(userId: string): Promise<string> {
  let entropy = "";
  for (let i = 0; i < 40; i++) entropy += ALPHANUMERIC[randomInt(ALPHANUMERIC.length)];
  const secret = entropy + crc32(entropy).toString(16).padStart(8, "0");
  const at = now();
  const row = await prisma.personalAccessToken.create({
    data: {
      tokenable_type: TOKENABLE_TYPE,
      tokenable_id: userId,
      name: "AuthToken",
      token: sha256(secret),
      abilities: '["*"]',
      created_at: at,
      updated_at: at,
    },
  });
  return `${row.id}|${secret}`;
}

export const revokeAllTokens = (userId: string) =>
  prisma.personalAccessToken.deleteMany({ where: { tokenable_type: TOKENABLE_TYPE, tokenable_id: userId } });

export const revokeToken = (id: bigint) => prisma.personalAccessToken.deleteMany({ where: { id } });

async function findToken(bearer: string) {
  const sep = bearer.indexOf("|");
  if (sep === -1) return prisma.personalAccessToken.findUnique({ where: { token: sha256(bearer) } });

  const idPart = bearer.slice(0, sep);
  if (!/^\d+$/.test(idPart)) return null;
  const row = await prisma.personalAccessToken.findUnique({ where: { id: BigInt(idPart) } });
  if (!row) return null;
  const expected = Buffer.from(row.token);
  const actual = Buffer.from(sha256(bearer.slice(sep + 1)));
  return expected.length === actual.length && timingSafeEqual(expected, actual) ? row : null;
}

/** Resolve the bearer token (if any) into request.user. Never rejects. */
export async function resolveUser(request: FastifyRequest) {
  request.user = null;
  request.tokenId = null;
  const header = request.headers.authorization;
  if (!header?.startsWith("Bearer ")) return;

  const token = await findToken(header.slice(7).trim());
  if (!token || token.tokenable_type !== TOKENABLE_TYPE) return;
  if (token.expires_at && token.expires_at < new Date()) return;

  const user = await prisma.user.findUnique({ where: { id: token.tokenable_id } });
  if (!user) return;

  request.user = user;
  request.tokenId = token.id;
  await prisma.personalAccessToken.update({ where: { id: token.id }, data: { last_used_at: now() } });
}

/** preHandler for protected routes: 401 like Laravel's auth:sanctum. */
export async function requireAuth(request: FastifyRequest, reply: FastifyReply) {
  if (!request.user) return reply.code(401).send({ message: "Unauthenticated." });
}

/** The authenticated user; only valid behind requireAuth. */
export function currentUser(request: FastifyRequest): User {
  if (!request.user) throw new Error("currentUser() used on a route without requireAuth");
  return request.user;
}

export const hasRole = (user: User | null, roles: readonly string[]) => !!user && roles.includes(user.role);

/** Throws 403 unless the current user has one of the roles. */
export function requireRole(request: FastifyRequest, roles: readonly string[]): User {
  const user = currentUser(request);
  if (!roles.includes(user.role)) throw forbidden();
  return user;
}
