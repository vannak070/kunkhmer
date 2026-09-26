/**
 * Public-site fan accounts  →  /api/fans/*
 *
 *   POST   /fans/register                 public   → 201 { token, fan }
 *   POST   /fans/login                    public   → { token, fan }
 *   POST   /fans/logout                   fan      → revoke the current session
 *   GET    /fans/me                       fan      → fan
 *   PUT    /fans/me                       fan      → update name, language, email preference, password
 *   DELETE /fans/me                       fan      → delete the account (password required)
 *
 *   GET    /fans/me/follows               fan      → followed fighters
 *   PUT    /fans/me/follows/:fighterId    fan      → follow (idempotent)
 *   DELETE /fans/me/follows/:fighterId    fan      → unfollow (idempotent)
 *
 *   GET    /fans/me/notifications         fan      → { items, unreadCount }  (?limit=, default 30, max 100)
 *   POST   /fans/me/notifications/read    fan      → mark { ids } read, or all when ids is omitted
 *
 *   GET    /fighters/:id/followers        public   → { count }
 *
 * Fans are separate from staff users (see lib/fanAuth.ts).
 */
import { randomUUID } from "node:crypto";
import bcrypt from "bcryptjs";
import type { FastifyInstance } from "fastify";
import { prisma } from "../../db.ts";
import type { Fan } from "../../generated/prisma/client.ts";
import { iso, now } from "../../lib/dates.ts";
import {
  checkRateLimit, clearRateLimit, currentFan, issueFanToken, requireFan, resolveFan, revokeFanSession,
} from "../../lib/fanAuth.ts";
import { HttpError, idParam, isUuid, notFound, ok } from "../../lib/http.ts";
import { inputOf } from "../../lib/input.ts";
import { NOT_DELETED } from "../fighters/routes.ts";

const BCRYPT_ROUNDS = 12;
const MIN_PASSWORD = 8;
const LANGUAGES = ["en", "km"];
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function formatFan(fan: Fan) {
  return {
    id: fan.id,
    email: fan.email,
    displayName: fan.display_name,
    language: fan.language,
    notifyEmail: fan.notify_email,
    createdAt: iso(fan.created_at),
  };
}

function validEmail(value: unknown): string {
  const email = String(value ?? "").trim().toLowerCase();
  if (!EMAIL.test(email) || email.length > 255) throw new HttpError(422, "Please enter a valid email address");
  return email;
}

function validPassword(value: unknown): string {
  const password = String(value ?? "");
  if (password.length < MIN_PASSWORD) throw new HttpError(422, `Password must be at least ${MIN_PASSWORD} characters`);
  if (password.length > 200) throw new HttpError(422, "Password is too long");
  return password;
}

function validName(value: unknown): string {
  const name = String(value ?? "").trim();
  if (name.length < 2 || name.length > 50) throw new HttpError(422, "Display name must be 2–50 characters");
  return name;
}

function validLanguage(value: unknown): string {
  const lang = String(value ?? "en");
  if (!LANGUAGES.includes(lang)) throw new HttpError(422, "Language must be en or km");
  return lang;
}

function formatNotification(n: { id: string; type: string; data: unknown; read_at: Date | null; created_at: Date }) {
  return { id: n.id, type: n.type, data: n.data, read: n.read_at !== null, createdAt: iso(n.created_at) };
}

export default async function fanRoutes(app: FastifyInstance) {
  app.addHook("onRequest", resolveFan);

  app.post("/fans/register", async (request, reply) => {
    const input = inputOf(request.body);
    const email = validEmail(input.get("email"));
    checkRateLimit(`register:${request.ip}`);
    const password = validPassword(input.get("password"));
    const displayName = validName(input.get("displayName"));
    const language = validLanguage(input.get("language", "en"));

    if (await prisma.fan.findUnique({ where: { email } })) {
      throw new HttpError(422, "An account with this email already exists");
    }

    const at = now();
    const fan = await prisma.fan.create({
      data: {
        id: randomUUID(),
        email,
        display_name: displayName,
        password_hash: await bcrypt.hash(password, BCRYPT_ROUNDS),
        language,
        notify_email: input.has("notifyEmail") ? Boolean(input.get("notifyEmail")) : true,
        last_login: at,
        created_at: at,
        updated_at: at,
      },
    });
    return ok(reply, { token: await issueFanToken(fan.id), fan: formatFan(fan) }, 201);
  });

  app.post("/fans/login", async (request, reply) => {
    const input = inputOf(request.body);
    const email = String(input.get("email") ?? "").trim().toLowerCase();
    const password = String(input.get("password") ?? "");
    if (!email || !password) throw new HttpError(422, "Email and password are required");

    const key = `login:${request.ip}:${email}`;
    checkRateLimit(key);
    const fan = await prisma.fan.findUnique({ where: { email } });
    if (!fan || !(await bcrypt.compare(password, fan.password_hash))) {
      throw new HttpError(401, "Incorrect email or password");
    }
    clearRateLimit(key);
    await prisma.fan.update({ where: { id: fan.id }, data: { last_login: now() } });
    return ok(reply, { token: await issueFanToken(fan.id), fan: formatFan(fan) });
  });

  // Fighter follower counts are public (shown on profiles).
  app.get("/fighters/:id/followers", async (request, reply) => {
    const id = idParam(request.params, "Fighter");
    const count = await prisma.fanFollow.count({ where: { fighter_id: id } });
    return ok(reply, { count });
  });

  await app.register(async (fanOnly) => {
    fanOnly.addHook("preHandler", requireFan);

    fanOnly.post("/fans/logout", async (request, reply) => {
      await revokeFanSession(request.fanSessionId!);
      return reply.send({ success: true, message: "Signed out" });
    });

    fanOnly.get("/fans/me", async (request, reply) => ok(reply, formatFan(currentFan(request))));

    fanOnly.put("/fans/me", async (request, reply) => {
      const fan = currentFan(request);
      const input = inputOf(request.body);
      const data: Record<string, unknown> = {};
      if (input.has("displayName")) data.display_name = validName(input.get("displayName"));
      if (input.has("language")) data.language = validLanguage(input.get("language"));
      if (input.present("notifyEmail")) data.notify_email = Boolean(input.get("notifyEmail"));
      if (input.has("newPassword")) {
        if (!(await bcrypt.compare(String(input.get("currentPassword") ?? ""), fan.password_hash))) {
          throw new HttpError(422, "Current password is incorrect");
        }
        data.password_hash = await bcrypt.hash(validPassword(input.get("newPassword")), BCRYPT_ROUNDS);
      }
      if (Object.keys(data).length === 0) return ok(reply, formatFan(fan));
      data.updated_at = now();
      const updated = await prisma.fan.update({ where: { id: fan.id }, data });
      // A password change signs out every other device.
      if (data.password_hash) {
        await prisma.fanSession.deleteMany({ where: { fan_id: fan.id, id: { not: request.fanSessionId! } } });
      }
      return ok(reply, formatFan(updated));
    });

    fanOnly.delete("/fans/me", async (request, reply) => {
      const fan = currentFan(request);
      const password = String(inputOf(request.body).get("password") ?? "");
      if (!(await bcrypt.compare(password, fan.password_hash))) throw new HttpError(422, "Password is incorrect");
      await prisma.fan.delete({ where: { id: fan.id } }); // sessions, follows and notifications cascade
      return reply.send({ success: true, message: "Account deleted" });
    });

    fanOnly.get("/fans/me/follows", async (request, reply) => {
      const follows = await prisma.fanFollow.findMany({
        where: { fan_id: currentFan(request).id, fighter: NOT_DELETED },
        include: { fighter: { include: { club: true } } },
        orderBy: { created_at: "desc" },
      });
      return ok(reply, follows.map(({ fighter, created_at }) => ({
        fighterId: fighter.id,
        name: fighter.name,
        nameKhmer: fighter.name_khmer,
        image: fighter.image,
        record: fighter.record,
        clubName: fighter.club?.name ?? null,
        followedAt: iso(created_at),
      })));
    });

    fanOnly.put("/fans/me/follows/:fighterId", async (request, reply) => {
      const fighterId = (request.params as { fighterId: string }).fighterId;
      if (!isUuid(fighterId) || !(await prisma.fighter.findFirst({ where: { id: fighterId, ...NOT_DELETED } }))) {
        throw notFound("Fighter");
      }
      const fanId = currentFan(request).id;
      await prisma.fanFollow.upsert({
        where: { fan_id_fighter_id: { fan_id: fanId, fighter_id: fighterId } },
        create: { fan_id: fanId, fighter_id: fighterId, created_at: now() },
        update: {},
      });
      return ok(reply, { fighterId, following: true });
    });

    fanOnly.delete("/fans/me/follows/:fighterId", async (request, reply) => {
      const fighterId = (request.params as { fighterId: string }).fighterId;
      if (isUuid(fighterId)) {
        await prisma.fanFollow.deleteMany({ where: { fan_id: currentFan(request).id, fighter_id: fighterId } });
      }
      return ok(reply, { fighterId, following: false });
    });

    fanOnly.get("/fans/me/notifications", async (request, reply) => {
      const fanId = currentFan(request).id;
      const raw = Number((request.query as { limit?: string }).limit ?? 30);
      const limit = Number.isFinite(raw) ? Math.min(100, Math.max(1, Math.floor(raw))) : 30;
      const [items, unreadCount] = await Promise.all([
        prisma.fanNotification.findMany({
          where: { fan_id: fanId },
          // Timestamps have one-second precision; seq (insertion order) breaks ties.
          // Not id: random UUIDs would give a stable but arbitrary order.
          orderBy: [{ created_at: "desc" }, { seq: "desc" }],
          take: limit,
        }),
        prisma.fanNotification.count({ where: { fan_id: fanId, read_at: null } }),
      ]);
      return ok(reply, { items: items.map(formatNotification), unreadCount });
    });

    fanOnly.post("/fans/me/notifications/read", async (request, reply) => {
      const fanId = currentFan(request).id;
      const ids = inputOf(request.body).get<unknown>("ids");
      if (ids !== null && (!Array.isArray(ids) || !ids.every(isUuid))) {
        throw new HttpError(422, "ids must be a list of notification ids");
      }
      const { count } = await prisma.fanNotification.updateMany({
        where: { fan_id: fanId, read_at: null, ...(ids ? { id: { in: ids as string[] } } : {}) },
        data: { read_at: now() },
      });
      return ok(reply, { marked: count });
    });
  });
}
