/**
 * Fighters  →  /api/fighters/*
 *
 *   GET    /fighters              public; ?status= and ?clubId= filters
 *   GET    /fighters/:id          public; id, exact name, name slug or Khmer name
 *   POST   /fighters              Super Admin, KKF Officer, Club/Gym (own club, always Draft)
 *   PUT    /fighters/:id          Super Admin, KKF Officer; Club/Gym only their own club's fighters
 *   POST   /fighters/:id/verify   Super Admin, KKF Officer → Active, clears review note
 *   POST   /fighters/:id/reject   Super Admin, KKF Officer → Rejected + reason (review note)
 *   DELETE /fighters/:id          Super Admin, KKF Officer (soft delete)
 *
 * Only KKF staff may set a fighter's status (verification is theirs), and a
 * Club/Gym user's fighters always belong to their own club. When a club edits a
 * fighter KKF sent back, it goes back to Draft (re-submitted for verification).
 *
 * Public reads (no staff token) never show unverified fighters: see UNVERIFIED.
 */
import { randomUUID } from "node:crypto";
import type { FastifyInstance } from "fastify";
import { prisma } from "../../db.ts";
import type { Club, Fighter, Prisma, User } from "../../generated/prisma/client.ts";
import { Role, STAFF, currentUser, hasRole, requireAuth, requireRole } from "../../lib/auth.ts";
import { dateOnly, iso, micro, now, toDate } from "../../lib/dates.ts";
import { HttpError, deleted, idParam, isUuid, notFound, ok } from "../../lib/http.ts";
import { inputOf } from "../../lib/input.ts";
import { config } from "../../config.ts";
import { formatRecord, recordedResults, requireRecord } from "../../lib/record.ts";

/** Soft-deleted fighters are invisible everywhere. */
export const NOT_DELETED = { deleted_at: null } satisfies Prisma.FighterWhereInput;

/** Statuses that mean "not verified by KKF yet" — hidden from the public. */
export const UNVERIFIED = ["Draft", "Pending KKF Verification", "Pending", "Rejected"];
export const PUBLIC_FIGHTER = { status: { notIn: UNVERIFIED } } satisfies Prisma.FighterWhereInput;

/** A related fighter, or null if soft-deleted. */
export const visibleFighter = <F extends Fighter>(f: F | null | undefined): F | null => (f && !f.deleted_at ? f : null);

type FighterWithClub = Fighter & { club: Club | null };

/** camelCase fighter shape sent to the frontends. */
export function formatFighter(f: FighterWithClub) {
  return {
    id: f.id,
    name: f.name,
    nameKhmer: f.name_khmer,
    alias: f.alias,
    dateOfBirth: dateOnly(f.date_of_birth),
    nationality: f.nationality,
    province: f.province,
    gender: f.gender,
    currentWeight: Number(f.current_weight),
    height: Number(f.height),
    clubId: f.club_id,
    clubName: f.club?.name ?? null,
    clubLogo: f.club?.logo_url ?? null,
    style: f.style,
    grade: f.grade,
    image: f.image,
    record: f.record,
    careerRecord: f.career_record,
    status: f.status,
    professionalStatus: f.professional_status,
    verifiedBy: f.verified_by,
    verifiedDate: micro(f.verified_date),
    reviewNote: f.review_note,
    createdAt: iso(f.created_at),
    updatedAt: iso(f.updated_at),
  };
}

/** Fighter as a snake_case row, for nesting in other responses. */
export function fighterArray(f: Fighter) {
  return {
    id: f.id,
    name: f.name,
    name_khmer: f.name_khmer,
    alias: f.alias,
    date_of_birth: dateOnly(f.date_of_birth),
    nationality: f.nationality,
    province: f.province,
    gender: f.gender,
    current_weight: Number(f.current_weight),
    height: Number(f.height),
    club_id: f.club_id,
    image: f.image,
    style: f.style,
    record: f.record,
    career_record: f.career_record,
    grade: f.grade,
    status: f.status,
    professional_status: f.professional_status,
    verified_by: f.verified_by,
    verified_date: micro(f.verified_date),
    created_at: micro(f.created_at),
    updated_at: micro(f.updated_at),
    deleted_at: micro(f.deleted_at),
    medical_status: f.medical_status,
    suspension_end_date: micro(f.suspension_end_date),
  };
}

const withClub = { club: true } as const;

/**
 * The Khmer name is required for Cambodian fighters and optional for foreign fighters (owner, 2026-09-30);
 * the column can't be NULL, so a foreign fighter without one stores "" (sites then show the English name).
 */
function khmerName(nationality: string | null | undefined, nameKhmer: string | null | undefined): string {
  if (nameKhmer) return nameKhmer;
  if (!nationality || nationality === "Cambodian") throw new HttpError(422, "The nameKhmer field is required");
  return "";
}

const isStaff = (user: User | null) => hasRole(user, STAFF);

async function findFighter(id: string) {
  const fighter = await prisma.fighter.findFirst({ where: { id, ...NOT_DELETED } });
  if (!fighter) throw notFound("Fighter");
  return fighter;
}

/** Look a fighter up by UUID, else by exact name, name slug ("sok-chan") or Khmer name. */
async function findByIdOrName(key: string) {
  if (isUuid(key)) {
    const byId = await prisma.fighter.findFirst({ where: { id: key, ...NOT_DELETED }, include: withClub });
    if (byId) return byId;
  }
  const lower = key.toLowerCase();
  const rows = await prisma.$queryRaw<{ id: string }[]>`
    SELECT id FROM fighters
    WHERE deleted_at IS NULL
      AND (LOWER(name) = ${lower} OR LOWER(name) = ${lower.replaceAll("-", " ")} OR name_khmer = ${key})
    LIMIT 1`;
  if (rows.length === 0) return null;
  return prisma.fighter.findUnique({ where: { id: rows[0].id }, include: withClub });
}

const UPDATABLE = {
  name: "name",
  nameKhmer: "name_khmer",
  alias: "alias",
  nationality: "nationality",
  province: "province",
  gender: "gender",
  currentWeight: "current_weight",
  height: "height",
  style: "style",
  grade: "grade",
  image: "image",
  professionalStatus: "professional_status",
};

export default async function fighterRoutes(app: FastifyInstance) {
  app.get("/fighters", async (request, reply) => {
    const query = request.query as { status?: string; clubId?: string };
    const where: Prisma.FighterWhereInput = { ...NOT_DELETED, ...(request.user ? {} : PUBLIC_FIGHTER) };
    if (query.status) where.status = request.user ? query.status : { equals: query.status, notIn: UNVERIFIED };
    if (query.clubId) {
      if (!isUuid(query.clubId)) return ok(reply, []);
      where.club_id = query.clubId;
    }
    const fighters = await prisma.fighter.findMany({
      where,
      include: withClub,
      orderBy: { created_at: { sort: "desc", nulls: "last" } },
    });
    return ok(reply, fighters.map(formatFighter));
  });

  app.get("/fighters/:id", async (request, reply) => {
    const fighter = await findByIdOrName((request.params as { id: string }).id);
    if (!fighter || (!request.user && UNVERIFIED.includes(fighter.status))) throw notFound("Fighter");
    return ok(reply, formatFighter(fighter));
  });

  app.register(async (protectedRoutes) => {
    protectedRoutes.addHook("preHandler", requireAuth);

    protectedRoutes.post("/fighters", async (request, reply) => {
      // Clubs and KKF staff register fighters (not organizers or officials).
      const user = requireRole(request, [...STAFF, Role.Club]);
      const input = inputOf(request.body);

      // Club/Gym users can only register fighters for their own club.
      const clubId = user.role === Role.Club && user.club_id ? user.club_id : input.get<string>("clubId");

      const at = now();
      const fighter = await prisma.fighter.create({
        data: {
          id: randomUUID(),
          name: input.required("name"),
          name_khmer: khmerName(input.get("nationality", "Cambodian"), input.get("nameKhmer")),
          alias: input.get("alias"),
          date_of_birth: toDate(input.required("dateOfBirth"))!,
          nationality: input.get("nationality", "Cambodian"),
          province: input.get("province"),
          gender: input.get("gender", "Male"),
          current_weight: input.required("currentWeight"),
          height: input.required("height"),
          club_id: clubId,
          style: input.get("style"),
          grade: input.get("grade", "D"),
          image: input.get("image"),
          // A new fighter has no results here yet: the record typed in is the career record.
          record: input.get("record"),
          career_record: requireRecord(input.get("record")) ? input.get("record") : null,
          // With approvals off, a fighter KKF staff register is verified by them at once.
          status: isStaff(user) ? input.get("status", config.approvals ? "Draft" : "Active") : "Draft",
          ...(isStaff(user) && !config.approvals && !input.has("status") ? { verified_by: user.id, verified_date: at } : {}),
          professional_status: input.get("professionalStatus", "Professional"),
          created_at: at,
          updated_at: at,
        },
        include: withClub,
      });
      return ok(reply, formatFighter(fighter), 201);
    });

    protectedRoutes.put("/fighters/:id", async (request, reply) => {
      const user = currentUser(request);
      const id = idParam(request.params, "Fighter");
      const fighter = await findFighter(id);

      if (user.role === Role.Club) {
        if (!user.club_id || fighter.club_id !== user.club_id) {
          throw new HttpError(403, "Forbidden: You do not own this fighter profile");
        }
      } else if (!isStaff(user)) {
        throw new HttpError(403, "Forbidden: Insufficient permissions");
      }

      const input = inputOf(request.body);
      const data: Prisma.FighterUncheckedUpdateInput = input.pick(UPDATABLE);
      if (input.has("dateOfBirth")) data.date_of_birth = toDate(input.get("dateOfBirth"))!;
      if (input.present("nameKhmer") && !input.has("nameKhmer")) {
        data.name_khmer = khmerName(input.get("nationality", fighter.nationality), null);
      } else if (input.has("nationality") && input.get("nationality") === "Cambodian" && !input.has("nameKhmer") && !fighter.name_khmer) {
        throw new HttpError(422, "The nameKhmer field is required");
      }
      if (input.present("record")) {
        // The record is the total the officer sees (career + results recorded here); keep the results and
        // store the rest as the career, so saving a form unchanged never counts results twice.
        const typed = requireRecord(input.get("record"));
        const recorded = await recordedResults(prisma, id);
        if (typed) {
          const career = { w: typed.w - recorded.w, l: typed.l - recorded.l, d: typed.d - recorded.d };
          if (career.w < 0 || career.l < 0 || career.d < 0) {
            throw new HttpError(422, `The record can't be lower than the results recorded in this system (${formatRecord(recorded)})`);
          }
          data.career_record = formatRecord(career);
          data.record = formatRecord(typed);
        } else {
          data.career_record = null;
          data.record = recorded.w + recorded.l + recorded.d ? formatRecord(recorded) : null;
        }
      }
      if (input.has("clubId") && user.role !== Role.Club) data.club_id = input.get("clubId");
      if (input.has("status") && isStaff(user)) data.status = input.get<string>("status")!;
      // A club fixing a fighter KKF sent back re-submits it for verification.
      if (user.role === Role.Club && fighter.status === "Rejected" && Object.keys(data).length > 0) data.status = "Draft";
      if (Object.keys(data).length > 0) data.updated_at = now();

      const updated = await prisma.fighter.update({ where: { id }, data, include: withClub });
      return ok(reply, formatFighter(updated));
    });

    protectedRoutes.post("/fighters/:id/verify", async (request, reply) => {
      const user = requireRole(request, STAFF);
      const id = idParam(request.params, "Fighter");
      await findFighter(id);

      const at = now();
      const fighter = await prisma.fighter.update({
        where: { id },
        data: { status: "Active", verified_by: user.id, verified_date: at, review_note: null, updated_at: at },
        include: withClub,
      });
      return ok(reply, formatFighter(fighter));
    });

    protectedRoutes.post("/fighters/:id/reject", async (request, reply) => {
      requireRole(request, STAFF);
      const id = idParam(request.params, "Fighter");
      await findFighter(id);
      const reason = String(inputOf(request.body).required("reason"));
      const fighter = await prisma.fighter.update({
        where: { id },
        data: { status: "Rejected", review_note: reason, updated_at: now() },
        include: withClub,
      });
      return ok(reply, formatFighter(fighter));
    });

    protectedRoutes.delete("/fighters/:id", async (request, reply) => {
      requireRole(request, STAFF);
      const id = idParam(request.params, "Fighter");
      await findFighter(id);

      const at = now();
      await prisma.fighter.update({ where: { id }, data: { deleted_at: at, updated_at: at } });
      return deleted(reply, "Fighter deleted successfully");
    });
  });
}
