/**
 * Private fighter details (ID / KYC, emergency contact, medical)  →  /api/fighters/*  — KKF staff only
 *
 *   GET /fighters/private-summary                      fighters with missing / expired details
 *   GET /fighters/:id/private                          the details (documents as yes/no)
 *   PUT /fighters/:id/private                          create or update; send only what changes
 *   GET /fighters/:id/private/documents/:kind          the stored scan, kind = id | medical
 *
 * Nothing here is ever part of a public response, the fan site, search or the Hub. Scans are stored in a
 * private folder (lib/files.ts `storePrivateDocument`), not under the public /api/files. The global
 * "pictures become files" hook skips these routes (app.ts) so scans never turn into public links.
 * claude/features/fighter-personal-records.md
 */
import { createReadStream } from "node:fs";
import { stat } from "node:fs/promises";
import { join } from "node:path";
import type { FastifyInstance } from "fastify";
import { prisma } from "../../db.ts";
import type { FighterPrivate } from "../../generated/prisma/client.ts";
import { STAFF, requireAuth, requireRole } from "../../lib/auth.ts";
import { dateOnly, iso, now, toDate } from "../../lib/dates.ts";
import { CONTENT_TYPES, FILE_NAME, isPrivateDataUri, privateDir, storePrivateDocument } from "../../lib/files.ts";
import { HttpError, idParam, notFound, ok } from "../../lib/http.ts";
import { inputOf } from "../../lib/input.ts";
import { NOT_DELETED } from "./routes.ts";

const BLOOD_TYPES = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];

/** Text fields: input key → column and the longest value allowed. */
const TEXT: Record<string, [column: string, max: number]> = {
  idType: ["id_type", 50],
  idNumber: ["id_number", 100],
  phone: ["phone", 50],
  email: ["email", 255],
  address: ["address", 500],
  emergencyName: ["emergency_name", 255],
  emergencyRelation: ["emergency_relation", 100],
  emergencyPhone: ["emergency_phone", 50],
  guardianName: ["guardian_name", 255],
  guardianPhone: ["guardian_phone", 50],
  bloodType: ["blood_type", 5],
  medicalNotes: ["medical_notes", 2000],
};
const DATES: Record<string, string> = { idExpiry: "id_expiry", lastMedicalCheck: "last_medical_check", medicalExpiry: "medical_expiry" };
const DOCUMENTS: Record<string, string> = { idDocument: "id_document", medicalDocument: "medical_document" };

const today = () => new Date(new Date().toISOString().slice(0, 10));
const ageOn = (dob: Date, on: Date) => on.getUTCFullYear() - dob.getUTCFullYear() - (on < new Date(Date.UTC(on.getUTCFullYear(), dob.getUTCMonth(), dob.getUTCDate())) ? 1 : 0);

/**
 * What is missing or out of date (warnings only, nothing blocks a bout).
 * missing: id (no ID number), emergency (no contact name + phone), medical (no medical check date).
 */
export function gaps(row: FighterPrivate | null, dob: Date) {
  const t = today();
  const missing: string[] = [];
  if (!row?.id_number) missing.push("id");
  if (!row?.emergency_name || !row?.emergency_phone) missing.push("emergency");
  if (!row?.last_medical_check) missing.push("medical");
  return {
    missing,
    idExpired: Boolean(row?.id_expiry && row.id_expiry < t),
    medicalExpired: Boolean(row?.medical_expiry && row.medical_expiry < t),
    needsGuardian: ageOn(dob, t) < 18 && !(row?.guardian_name && row?.guardian_phone),
  };
}

const hasGap = (g: ReturnType<typeof gaps>) => g.missing.length > 0 || g.idExpired || g.medicalExpired || g.needsGuardian;

function shape(fighterId: string, row: FighterPrivate | null, dob: Date) {
  return {
    fighterId,
    idType: row?.id_type ?? null,
    idNumber: row?.id_number ?? null,
    idExpiry: dateOnly(row?.id_expiry),
    hasIdDocument: Boolean(row?.id_document),
    phone: row?.phone ?? null,
    email: row?.email ?? null,
    address: row?.address ?? null,
    emergencyName: row?.emergency_name ?? null,
    emergencyRelation: row?.emergency_relation ?? null,
    emergencyPhone: row?.emergency_phone ?? null,
    guardianName: row?.guardian_name ?? null,
    guardianPhone: row?.guardian_phone ?? null,
    bloodType: row?.blood_type ?? null,
    lastMedicalCheck: dateOnly(row?.last_medical_check),
    medicalExpiry: dateOnly(row?.medical_expiry),
    medicalNotes: row?.medical_notes ?? null,
    hasMedicalDocument: Boolean(row?.medical_document),
    consentGiven: Boolean(row?.consent_at),
    consentAt: iso(row?.consent_at),
    updatedAt: iso(row?.updated_at),
    ...gaps(row, dob),
  };
}

async function visibleFighter(id: string) {
  const fighter = await prisma.fighter.findFirst({ where: { id, ...NOT_DELETED }, select: { id: true, date_of_birth: true } });
  if (!fighter) throw notFound("Fighter");
  return fighter;
}

export default async function fighterPrivateRoutes(app: FastifyInstance) {
  app.register(async (staffRoutes) => {
    staffRoutes.addHook("preHandler", requireAuth);

    staffRoutes.get("/fighters/private-summary", async (request, reply) => {
      requireRole(request, STAFF);
      const fighters = await prisma.fighter.findMany({ where: NOT_DELETED, select: { id: true, date_of_birth: true, private: true } });
      const items = fighters
        .map((f) => ({ fighterId: f.id, ...gaps(f.private, f.date_of_birth) }))
        .filter(hasGap);
      return ok(reply, items);
    });

    staffRoutes.get("/fighters/:id/private", async (request, reply) => {
      requireRole(request, STAFF);
      const fighter = await visibleFighter(idParam(request.params, "Fighter"));
      const row = await prisma.fighterPrivate.findUnique({ where: { fighter_id: fighter.id } });
      return ok(reply, shape(fighter.id, row, fighter.date_of_birth));
    });

    staffRoutes.put("/fighters/:id/private", async (request, reply) => {
      requireRole(request, STAFF);
      const fighter = await visibleFighter(idParam(request.params, "Fighter"));
      const input = inputOf(request.body);
      const data: Record<string, unknown> = {};

      // "" arrives as null (normalizeBody), so a key sent as null clears that field.
      for (const [key, [column, max]] of Object.entries(TEXT)) {
        if (!input.present(key)) continue;
        const value = input.get<string>(key);
        if (value != null && String(value).length > max) throw new HttpError(422, `The ${key} field is too long`);
        data[column] = value == null ? null : String(value);
      }
      if (data.blood_type && !BLOOD_TYPES.includes(String(data.blood_type))) throw new HttpError(422, "The bloodType field must be A+, A-, B+, B-, AB+, AB-, O+ or O-");
      if (data.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(data.email))) throw new HttpError(422, "The email field must be a valid email address");
      for (const [key, column] of Object.entries(DATES)) {
        if (input.present(key)) data[column] = input.has(key) ? toDate(input.get(key)) : null;
      }
      for (const [key, column] of Object.entries(DOCUMENTS)) {
        if (!input.present(key)) continue;
        const value = input.get<unknown>(key);
        if (value == null) data[column] = null;
        else if (isPrivateDataUri(value)) data[column] = await storePrivateDocument(value);
        else throw new HttpError(422, `The ${key} field must be a PDF or a picture`);
      }
      if (input.present("consentGiven")) {
        const existing = await prisma.fighterPrivate.findUnique({ where: { fighter_id: fighter.id }, select: { consent_at: true } });
        data.consent_at = input.get("consentGiven") === true || input.get("consentGiven") === "true" ? (existing?.consent_at ?? now()) : null;
      }

      const at = now();
      const row = await prisma.fighterPrivate.upsert({
        where: { fighter_id: fighter.id },
        create: { fighter_id: fighter.id, ...data, created_at: at, updated_at: at },
        update: { ...data, updated_at: at },
      });
      return ok(reply, shape(fighter.id, row, fighter.date_of_birth));
    });

    staffRoutes.get("/fighters/:id/private/documents/:kind", async (request, reply) => {
      requireRole(request, STAFF);
      const { kind } = request.params as { kind: string };
      const fighter = await visibleFighter(idParam(request.params, "Fighter"));
      const column = kind === "id" ? "id_document" : kind === "medical" ? "medical_document" : null;
      if (!column) throw notFound("Document");
      const row = await prisma.fighterPrivate.findUnique({ where: { fighter_id: fighter.id } });
      const name = row?.[column];
      if (!name || !FILE_NAME.test(name)) throw notFound("Document");
      const path = join(privateDir(), name);
      const info = await stat(path).catch(() => null);
      if (!info?.isFile()) throw notFound("Document");
      return reply
        .header("Content-Type", CONTENT_TYPES[name.split(".").pop()!])
        .header("Content-Length", info.size)
        .header("Cache-Control", "private, no-store")
        .header("Content-Disposition", "inline")
        .header("X-Content-Type-Options", "nosniff")
        .send(createReadStream(path));
    });
  });
}
