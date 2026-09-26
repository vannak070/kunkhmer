/**
 * Match officials (referees and judges)  →  /api/officials/*
 *
 *   GET  /officials            KKF staff, Organizer; ?role=Referee|Judge, ?date=YYYY-MM-DD
 *   POST /officials            KKF staff: create a Referee or Judge account
 *   PUT  /officials/:id        KKF staff: name, email, role, grade, year started, status, password
 *   GET  /officials/me/bouts   Referee, Judge: the bouts they are assigned to
 *
 * Officials are user accounts with role Referee or Judge. Only KKF staff assign
 * them to bouts (assertOfficials, used by the matches module). "Busy" is not
 * stored: the list counts each official's bouts on a fight night (?date=).
 */
import { randomUUID } from "node:crypto";
import type { FastifyInstance } from "fastify";
import { prisma } from "../../db.ts";
import type { User } from "../../generated/prisma/client.ts";
import { OFFICIALS, Role, STAFF, requireAuth, requireRole, revokeAllTokens } from "../../lib/auth.ts";
import { now, toDate } from "../../lib/dates.ts";
import { HttpError, idParam, isUuid, notFound, ok } from "../../lib/http.ts";
import { type Input, inputOf } from "../../lib/input.ts";
import { MIN_PASSWORD, hashPassword } from "../auth/routes.ts";
import { formatMatch, matchRelations } from "../matches/format.ts";

export const GRADES = ["International A", "National A", "National B"];
const STATUSES = ["Active", "Inactive"];
const MAX_JUDGES = 5;

const isOfficialRole = (role: unknown) => (OFFICIALS as readonly unknown[]).includes(role);
const todayUtc = () => new Date(`${new Date().toISOString().slice(0, 10)}T00:00:00Z`);

/** A bout's referee and judges (judge_ids is a JSON list of user ids). */
export function officialsOf(m: { referee_id: string | null; judge_ids: unknown }) {
  const judges = Array.isArray(m.judge_ids) ? m.judge_ids.filter((j): j is string => typeof j === "string") : [];
  return { referee: m.referee_id, judges };
}

/**
 * Checks a bout's officials: an active Referee account as referee, active Judge
 * accounts as judges, nobody twice, at most five judges. 422 otherwise.
 */
export async function assertOfficials(refereeId: string | null, judgeIds: string[]) {
  if (judgeIds.length > MAX_JUDGES) throw new HttpError(422, `A bout has at most ${MAX_JUDGES} judges`);
  if (new Set(judgeIds).size !== judgeIds.length) throw new HttpError(422, "A judge is listed twice");
  if (refereeId && judgeIds.includes(refereeId)) throw new HttpError(422, "The referee can't also be a judge");
  const ids = [refereeId, ...judgeIds].filter((id): id is string => !!id);
  const users = await prisma.user.findMany({ where: { id: { in: ids.filter(isUuid) } }, select: { id: true, role: true, status: true } });
  const ok = (id: string, role: string) => users.some((u) => u.id === id && u.role === role && u.status === "Active");
  if (refereeId && !ok(refereeId, Role.Referee)) throw new HttpError(422, "The referee must be an active KKF referee");
  if (judgeIds.some((id) => !ok(id, Role.Judge))) throw new HttpError(422, "Every judge must be an active KKF judge");
}

/** Per official: upcoming bouts (no result yet) and, with a date, bouts on that fight night. */
async function assignmentCounts(date: Date | null) {
  const today = todayUtc();
  const from = date && date < today ? date : today;
  const bouts = await prisma.match.findMany({
    where: { subEvent: { date: { gte: from } } },
    select: { referee_id: true, judge_ids: true, result: { select: { match_id: true } }, subEvent: { select: { date: true } } },
  });
  const upcoming = new Map<string, number>();
  const onDate = new Map<string, number>();
  const bump = (map: Map<string, number>, id: string) => map.set(id, (map.get(id) ?? 0) + 1);
  for (const b of bouts) {
    const { referee, judges } = officialsOf(b);
    const day = b.subEvent.date.getTime();
    for (const id of new Set([referee, ...judges].filter((x): x is string => !!x))) {
      if (day >= today.getTime() && !b.result) bump(upcoming, id);
      if (date && day === date.getTime()) bump(onDate, id);
    }
  }
  return (id: string) => ({ upcoming: upcoming.get(id) ?? 0, onDate: date ? (onDate.get(id) ?? 0) : null });
}

export function formatOfficial(u: User, counts: { upcoming: number; onDate: number | null }) {
  return {
    id: u.id,
    username: u.username,
    fullName: u.full_name,
    email: u.email,
    role: u.role,
    status: u.status,
    grade: u.official_grade,
    since: u.official_since,
    yearsExperience: u.official_since ? Math.max(0, new Date().getUTCFullYear() - u.official_since) : null,
    upcomingBouts: counts.upcoming,
    /** Bouts already assigned on the ?date= fight night ("busy"); null without a date. */
    boutsOnDate: counts.onDate,
  };
}

/** Official-specific fields shared by create and update. */
function officialFields(input: Input) {
  const data: Record<string, unknown> = {};
  if (input.has("fullName")) data.full_name = input.get("fullName");
  if (input.has("email")) data.email = input.get("email");
  if (input.has("role")) {
    if (!isOfficialRole(input.get("role"))) throw new HttpError(422, 'The role must be "Referee" or "Judge"');
    data.role = input.get("role");
  }
  if (input.has("status")) {
    if (!STATUSES.includes(input.get<string>("status")!)) throw new HttpError(422, 'The status must be "Active" or "Inactive"');
    data.status = input.get("status");
  }
  if (input.present("grade")) {
    const grade = input.get<string>("grade");
    if (grade !== null && !GRADES.includes(grade)) throw new HttpError(422, `The grade must be one of: ${GRADES.join(", ")}`);
    data.official_grade = grade;
  }
  if (input.present("since")) {
    const since = input.get("since");
    const year = new Date().getUTCFullYear();
    if (since !== null && (!Number.isInteger(Number(since)) || Number(since) < 1950 || Number(since) > year)) {
      throw new HttpError(422, `The year started must be between 1950 and ${year}`);
    }
    data.official_since = since === null ? null : Number(since);
  }
  return data;
}

function checkPassword(password: unknown) {
  if (String(password).length < MIN_PASSWORD) throw new HttpError(422, `The password must be at least ${MIN_PASSWORD} characters`);
  return hashPassword(String(password));
}

async function findOfficial(id: string) {
  const user = await prisma.user.findUnique({ where: { id } });
  if (!user || !isOfficialRole(user.role)) throw notFound("Official");
  return user;
}

export default async function officialRoutes(app: FastifyInstance) {
  app.register(async (protectedRoutes) => {
    protectedRoutes.addHook("preHandler", requireAuth);

    protectedRoutes.get("/officials", async (request, reply) => {
      requireRole(request, [...STAFF, Role.Organizer]);
      const { role, date } = request.query as { role?: string; date?: string };
      const officials = await prisma.user.findMany({
        where: { role: isOfficialRole(role) ? (role as string) : { in: [...OFFICIALS] } },
        orderBy: [{ role: "desc" }, { full_name: "asc" }],
      });
      const counts = await assignmentCounts(date ? toDate(date) : null);
      return ok(reply, officials.map((u) => formatOfficial(u, counts(u.id))));
    });

    protectedRoutes.get("/officials/me/bouts", async (request, reply) => {
      const me = requireRole(request, OFFICIALS);
      const all = await prisma.match.findMany({ select: { id: true, referee_id: true, judge_ids: true } });
      const mine = new Map<string, string>();
      for (const m of all) {
        const { referee, judges } = officialsOf(m);
        if (referee === me.id) mine.set(m.id, Role.Referee);
        else if (judges.includes(me.id)) mine.set(m.id, Role.Judge);
      }
      const bouts = await prisma.match.findMany({
        where: { id: { in: [...mine.keys()] } },
        include: { ...matchRelations, event: { select: { name: true, location: true, status: true } } },
        orderBy: [{ subEvent: { date: "asc" } }, { sort_order: "asc" }],
      });
      return ok(
        reply,
        bouts.map((b) => ({
          ...formatMatch(b),
          event_name: b.event.name,
          event_location: b.event.location,
          event_status: b.event.status,
          my_role: mine.get(b.id),
        })),
      );
    });

    protectedRoutes.post("/officials", async (request, reply) => {
      requireRole(request, STAFF);
      const input = inputOf(request.body);
      if (!isOfficialRole(input.required("role"))) throw new HttpError(422, 'The role must be "Referee" or "Judge"');
      const data = officialFields(input);
      const at = now();
      const user = await prisma.user.create({
        data: {
          id: randomUUID(),
          username: input.required("username"),
          full_name: input.required("fullName"),
          email: input.required("email"),
          password_hash: await checkPassword(input.required("password")),
          role: input.required("role"),
          status: "Active",
          official_grade: (data.official_grade as string | undefined) ?? null,
          official_since: (data.official_since as number | undefined) ?? null,
          created_at: at,
          updated_at: at,
        },
      });
      return ok(reply, formatOfficial(user, { upcoming: 0, onDate: null }), 201);
    });

    protectedRoutes.put("/officials/:id", async (request, reply) => {
      requireRole(request, STAFF);
      const id = idParam(request.params, "Official");
      const existing = await findOfficial(id);
      const input = inputOf(request.body);
      const data = officialFields(input);
      if (input.has("password")) data.password_hash = await checkPassword(input.get("password"));
      if (Object.keys(data).length > 0) data.updated_at = now();

      const user = await prisma.user.update({ where: { id }, data });
      if ((data.status !== undefined && data.status !== existing.status) || input.has("password")) await revokeAllTokens(id);
      return ok(reply, formatOfficial(user, (await assignmentCounts(null))(id)));
    });
  });
}
