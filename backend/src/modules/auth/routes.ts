/**
 * Auth / user management  →  /api/users/*
 *
 *   POST   /users/login    public   → { token, user }
 *   POST   /users/logout   auth     → revoke the current token
 *   GET    /users/me       auth     → current user
 *   GET    /users          Super Admin
 *   POST   /users          Super Admin
 *   GET    /users/:id      Super Admin, or the user themself
 *   PUT    /users/:id      Super Admin
 *   DELETE /users/:id      Super Admin (not their own account)
 */
import { randomUUID } from "node:crypto";
import bcrypt from "bcryptjs";
import type { FastifyInstance } from "fastify";
import { prisma } from "../../db.ts";
import type { User } from "../../generated/prisma/client.ts";
import {
  Role,
  currentUser,
  issueToken,
  requireAuth,
  requireRole,
  revokeAllTokens,
  revokeToken,
} from "../../lib/auth.ts";
import { iso, micro, now, sql } from "../../lib/dates.ts";
import { HttpError, deleted, idParam, notFound, ok } from "../../lib/http.ts";
import { inputOf } from "../../lib/input.ts";

const BCRYPT_ROUNDS = 12;

/** camelCase user shape sent to the frontends. */
export function formatUser(user: User) {
  return {
    id: user.id,
    username: user.username,
    fullName: user.full_name,
    email: user.email,
    role: user.role,
    clubId: user.club_id,
    status: user.status,
    lastLogin: iso(user.last_login),
    createdAt: iso(user.created_at),
  };
}

/** User as a snake_case row (for nesting), without the password hash. */
export function userArray(user: User) {
  return {
    id: user.id,
    username: user.username,
    full_name: user.full_name,
    email: user.email,
    role: user.role,
    status: user.status,
    club_id: user.club_id,
    last_login: sql(user.last_login),
    created_at: micro(user.created_at),
    updated_at: micro(user.updated_at),
  };
}

const hashPassword = (password: string) => bcrypt.hash(password, BCRYPT_ROUNDS);

async function findUser(id: string) {
  const user = await prisma.user.findUnique({ where: { id } });
  if (!user) throw notFound("User");
  return user;
}

export default async function authRoutes(app: FastifyInstance) {
  app.post("/users/login", async (request, reply) => {
    const input = inputOf(request.body);
    const username = input.get<string>("username");
    const password = input.get<string>("password");
    if (!username || !password) throw new HttpError(422, "Username and password are required");

    const user = await prisma.user.findFirst({ where: { username, status: "Active" } });
    if (!user || !(await bcrypt.compare(String(password), user.password_hash))) {
      throw new HttpError(401, "Invalid username or password");
    }

    const at = now();
    const updated = await prisma.user.update({ where: { id: user.id }, data: { last_login: at, updated_at: at } });

    // Single-session policy: logging in revokes every earlier token.
    await revokeAllTokens(user.id);
    const token = await issueToken(user.id);

    return ok(reply, { token, user: formatUser(updated) });
  });

  app.register(async (protectedRoutes) => {
    protectedRoutes.addHook("preHandler", requireAuth);

    protectedRoutes.post("/users/logout", async (request, reply) => {
      if (request.tokenId !== null) await revokeToken(request.tokenId);
      return reply.send({ success: true, message: "Logged out successfully" });
    });

    protectedRoutes.get("/users/me", async (request, reply) => ok(reply, formatUser(currentUser(request))));

    protectedRoutes.get("/users", async (request, reply) => {
      requireRole(request, [Role.SuperAdmin]);
      const users = await prisma.user.findMany({ orderBy: { created_at: { sort: "desc", nulls: "last" } } });
      return ok(reply, users.map(formatUser));
    });

    protectedRoutes.get("/users/:id", async (request, reply) => {
      const id = idParam(request.params, "User");
      if (currentUser(request).id !== id) requireRole(request, [Role.SuperAdmin]);
      return ok(reply, formatUser(await findUser(id)));
    });

    protectedRoutes.post("/users", async (request, reply) => {
      requireRole(request, [Role.SuperAdmin]);
      const input = inputOf(request.body);
      const at = now();
      const user = await prisma.user.create({
        data: {
          id: randomUUID(),
          username: input.required("username"),
          full_name: input.required("fullName"),
          email: input.required("email"),
          password_hash: await hashPassword(String(input.required("password"))),
          role: input.required("role"),
          club_id: input.get("clubId"),
          status: input.get("status", "Active"),
          created_at: at,
          updated_at: at,
        },
      });
      return ok(reply, formatUser(user), 201);
    });

    protectedRoutes.put("/users/:id", async (request, reply) => {
      requireRole(request, [Role.SuperAdmin]);
      const id = idParam(request.params, "User");
      await findUser(id);

      const input = inputOf(request.body);
      const data: Record<string, unknown> = input.pick({
        username: "username",
        fullName: "full_name",
        email: "email",
        role: "role",
        clubId: "club_id",
        status: "status",
      });
      if (input.has("password")) data.password_hash = await hashPassword(String(input.get("password")));
      if (Object.keys(data).length > 0) data.updated_at = now();

      const user = await prisma.user.update({ where: { id }, data });
      return ok(reply, formatUser(user));
    });

    protectedRoutes.delete("/users/:id", async (request, reply) => {
      const me = requireRole(request, [Role.SuperAdmin]);
      const id = idParam(request.params, "User");
      if (me.id === id) throw new HttpError(422, "You cannot delete your own account");
      await findUser(id);

      await revokeAllTokens(id);
      await prisma.user.delete({ where: { id } });
      return deleted(reply, "User deleted successfully");
    });
  });
}
