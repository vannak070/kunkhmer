/**
 * Merge two fighter records that are the same person (claude/updates/fighter-id-merge.md)  →  KKF staff
 *
 *   GET  /fighters/:id/merge-preview?intoId=   what would move from :id (the duplicate) to intoId (the record kept)
 *   POST /fighters/:id/merge { intoId }         move everything, recalculate the record, remove :id (soft delete), log it
 *
 * Moves: bouts (both corners), winners and results, title holder, title-defence opponents, match history, videos,
 * fan follows (no doubles) and fan notifications, and the private details when the kept fighter has none. The kept
 * fighter keeps its own profile; its career record (before this system) is taken from the duplicate only when empty.
 * Refused when the two fought each other (they can't be the same person) or either is deleted.
 */
import { randomUUID } from "node:crypto";
import type { FastifyInstance } from "fastify";
import { prisma } from "../../db.ts";
import { STAFF, requireAuth, requireRole } from "../../lib/auth.ts";
import { now } from "../../lib/dates.ts";
import { HttpError, idParam, isUuid, notFound, ok } from "../../lib/http.ts";
import { inputOf } from "../../lib/input.ts";
import { recalculateRecord } from "../matches/results.ts";

async function pair(id: string, intoId: unknown) {
  if (typeof intoId !== "string" || !isUuid(intoId)) throw new HttpError(422, "Choose the fighter to keep");
  if (intoId === id) throw new HttpError(422, "Choose a different fighter to keep");
  const [from, into] = await Promise.all([
    prisma.fighter.findFirst({ where: { id, deleted_at: null }, include: { private: true } }),
    prisma.fighter.findFirst({ where: { id: intoId, deleted_at: null }, include: { private: true } }),
  ]);
  if (!from) throw notFound("Fighter");
  if (!into) throw new HttpError(422, "The fighter to keep does not exist");
  return { from, into };
}

async function counts(fromId: string, intoId: string) {
  const [bouts, facedEachOther, results, titles, defences, videos, follows] = await Promise.all([
    prisma.match.count({ where: { OR: [{ fighter_a_id: fromId }, { fighter_b_id: fromId }] } }),
    prisma.match.count({ where: { OR: [{ fighter_a_id: fromId, fighter_b_id: intoId }, { fighter_a_id: intoId, fighter_b_id: fromId }] } }),
    prisma.boutResult.count({ where: { winner_id: fromId } }),
    prisma.champion.count({ where: { current_holder_id: fromId } }),
    prisma.championDefense.count({ where: { opponent_id: fromId } }),
    prisma.video.count({ where: { fighter_id: fromId } }),
    prisma.fanFollow.count({ where: { fighter_id: fromId } }),
  ]);
  return { bouts, results, titles, defences, videos, follows, facedEachOther };
}

export default async function fighterMergeRoutes(app: FastifyInstance) {
  app.register(async (routes) => {
    routes.addHook("preHandler", requireAuth);

    routes.get("/fighters/:id/merge-preview", async (request, reply) => {
      requireRole(request, STAFF);
      const id = idParam(request.params, "Fighter");
      const { from, into } = await pair(id, (request.query as { intoId?: string }).intoId);
      const c = await counts(from.id, into.id);
      return ok(reply, {
        remove: { id: from.id, name: from.name, nameKhmer: from.name_khmer, record: from.record },
        keep: { id: into.id, name: into.name, nameKhmer: into.name_khmer, record: into.record },
        moves: { bouts: c.bouts, results: c.results, titles: c.titles, defences: c.defences, videos: c.videos, follows: c.follows, privateDetails: Boolean(from.private && !into.private) },
        blocked: c.facedEachOther > 0 ? "fought_each_other" : null,
      });
    });

    routes.post("/fighters/:id/merge", async (request, reply) => {
      const user = requireRole(request, STAFF);
      const id = idParam(request.params, "Fighter");
      const { from, into } = await pair(id, inputOf(request.body).get("intoId"));
      const c = await counts(from.id, into.id);
      if (c.facedEachOther) throw new HttpError(422, "These two fighters fought each other, so they can't be the same person");
      const at = now();
      const moves = { bouts: c.bouts, results: c.results, titles: c.titles, defences: c.defences, videos: c.videos, follows: c.follows, privateDetails: Boolean(from.private && !into.private) };

      await prisma.$transaction(async (tx) => {
        const [f, t] = [from.id, into.id];
        await tx.match.updateMany({ where: { fighter_a_id: f }, data: { fighter_a_id: t } });
        await tx.match.updateMany({ where: { fighter_b_id: f }, data: { fighter_b_id: t } });
        await tx.match.updateMany({ where: { winner_id: f }, data: { winner_id: t } });
        await tx.boutResult.updateMany({ where: { winner_id: f }, data: { winner_id: t } });
        await tx.champion.updateMany({ where: { current_holder_id: f }, data: { current_holder_id: t, current_holder_name: into.name } });
        await tx.championDefense.updateMany({ where: { opponent_id: f }, data: { opponent_id: t } });
        await tx.matchChange.updateMany({ where: { fighter_id: f }, data: { fighter_id: t } });
        await tx.video.updateMany({ where: { fighter_id: f }, data: { fighter_id: t } });
        // A title's saved "before" state may name the duplicate as holder.
        await tx.$executeRaw`UPDATE championship_changes SET before = replace(before::text, ${f}, ${t})::json WHERE before::text LIKE ${"%" + f + "%"}`;
        // Fans following both keep one follow; notifications that would double up are dropped.
        await tx.$executeRaw`DELETE FROM fan_follows WHERE fighter_id = ${f}::uuid AND fan_id IN (SELECT fan_id FROM fan_follows WHERE fighter_id = ${t}::uuid)`;
        await tx.fanFollow.updateMany({ where: { fighter_id: f }, data: { fighter_id: t } });
        await tx.$executeRaw`DELETE FROM fan_notifications n WHERE n.fighter_id = ${f}::uuid AND EXISTS (SELECT 1 FROM fan_notifications m WHERE m.fighter_id = ${t}::uuid AND m.fan_id = n.fan_id AND m.type = n.type AND m.match_id IS NOT DISTINCT FROM n.match_id)`;
        await tx.fanNotification.updateMany({ where: { fighter_id: f }, data: { fighter_id: t } });
        if (from.private && !into.private) await tx.fighterPrivate.update({ where: { fighter_id: f }, data: { fighter_id: t } });
        if (!into.career_record && from.career_record) await tx.fighter.update({ where: { id: t }, data: { career_record: from.career_record } });
        await tx.fighter.update({ where: { id: f }, data: { deleted_at: at, updated_at: at } });
        await recalculateRecord(tx, t);
        await tx.fighterMerge.create({ data: { id: randomUUID(), kept_id: t, removed_id: f, removed_name: from.name, merged_by: user.id, merged_at: at, summary: moves } });
      });
      const kept = await prisma.fighter.findUniqueOrThrow({ where: { id: into.id } });
      return ok(reply, { kept: { id: kept.id, name: kept.name, record: kept.record }, removed: { id: from.id, name: from.name }, moves });
    });
  });
}
