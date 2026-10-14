/**
 * Duplicate fighters list (claude/features/duplicate-fighters-list.md)  →  KKF staff only
 *
 *   GET  /fighters/duplicates?show=open|dismissed   pairs of fighters who may be the same person, strongest first
 *   POST /fighters/duplicates/dismiss { fighterAId, fighterBId }   "not the same person" (remembered)
 *   POST /fighters/duplicates/restore { fighterAId, fighterBId }   bring a dismissed pair back
 *
 * A pair is flagged when the two share an ID number, a Khmer name, an English name (case, spaces and accents ignored), or have
 * similar names and the same date of birth. Tier "very_likely": same ID number, or the same name together with the same
 * date of birth; everything else is "possible". Fighters who fought each other are never listed (they can't be one person,
 * and the merge refuses them). Merging is done with POST /fighters/:id/merge (fighters/merge.ts).
 */
import type { FastifyInstance } from "fastify";
import { prisma } from "../../db.ts";
import { STAFF, currentUser, requireAuth, requireRole } from "../../lib/auth.ts";
import { dateOnly, now } from "../../lib/dates.ts";
import { HttpError, isUuid, ok } from "../../lib/http.ts";
import { inputOf } from "../../lib/input.ts";
import { editDistance, khmer, latin } from "../../lib/names.ts";
import { NOT_DELETED } from "./routes.ts";
import { idKey } from "./private.ts";

type Reason = "id_number" | "same_name" | "same_khmer_name" | "similar_name" | "similar_khmer_name" | "same_birth";
/** Name groups bigger than this are skipped (an empty or generic name would otherwise match everybody). */
const MAX_GROUP = 40;

const order = (a: string, b: string): [string, string] => (a < b ? [a, b] : [b, a]);
const pairKey = (a: string, b: string) => order(a, b).join("|");

function pairIds(body: unknown): [string, string] {
  const input = inputOf(body);
  const a = input.get<string>("fighterAId");
  const b = input.get<string>("fighterBId");
  if (!isUuid(a) || !isUuid(b) || a === b) throw new HttpError(422, "Choose two different fighters");
  return order(a, b);
}

export default async function duplicateRoutes(app: FastifyInstance) {
  app.register(async (protectedRoutes) => {
    protectedRoutes.addHook("preHandler", requireAuth);

    protectedRoutes.get("/fighters/duplicates", async (request, reply) => {
      requireRole(request, STAFF);
      const show = (request.query as { show?: string }).show === "dismissed" ? "dismissed" : "open";

      const rows = await prisma.fighter.findMany({
        where: NOT_DELETED,
        include: { club: { select: { name: true } }, private: { select: { id_number: true } } },
      });
      const found = new Map<string, { a: (typeof rows)[number]; b: (typeof rows)[number]; reasons: Set<Reason> }>();
      const link = (a: (typeof rows)[number], b: (typeof rows)[number], why: Reason) => {
        const key = pairKey(a.id, b.id);
        const hit = found.get(key) ?? { a, b, reasons: new Set<Reason>() };
        hit.reasons.add(why);
        found.set(key, hit);
      };
      const group = (key: (f: (typeof rows)[number]) => string, why: Reason, minLength: number) => {
        const groups = new Map<string, typeof rows>();
        for (const f of rows) {
          const k = key(f);
          if (k.length >= minLength) groups.set(k, [...(groups.get(k) ?? []), f]);
        }
        for (const g of groups.values()) {
          if (g.length < 2 || g.length > MAX_GROUP) continue;
          for (let i = 0; i < g.length; i++) for (let j = i + 1; j < g.length; j++) link(g[i], g[j], why);
        }
      };
      group((f) => idKey(f.private?.id_number), "id_number", 3);
      group((f) => latin(f.name), "same_name", 3);
      group((f) => khmer(f.name_khmer), "same_khmer_name", 2);
      // Similar names count only together with the same date of birth.
      const byBirth = new Map<string, typeof rows>();
      for (const f of rows) {
        const day = dateOnly(f.date_of_birth);
        if (day) byBirth.set(day, [...(byBirth.get(day) ?? []), f]);
      }
      for (const g of byBirth.values()) {
        if (g.length < 2 || g.length > MAX_GROUP) continue;
        for (let i = 0; i < g.length; i++) {
          for (let j = i + 1; j < g.length; j++) {
            const [la, lb] = [latin(g[i].name), latin(g[j].name)];
            if (la !== lb && Math.min(la.length, lb.length) >= 4 && editDistance(la, lb) <= 2) link(g[i], g[j], "similar_name");
            const [ka, kb] = [khmer(g[i].name_khmer), khmer(g[j].name_khmer)];
            if (ka !== kb && Math.min(ka.length, kb.length) >= 4 && editDistance(ka, kb) <= 1) link(g[i], g[j], "similar_khmer_name");
          }
        }
      }

      // Fighters who fought each other can't be one person.
      const ids = [...new Set([...found.values()].flatMap((p) => [p.a.id, p.b.id]))];
      const fought = new Set(
        (await prisma.match.findMany({ where: { fighter_a_id: { in: ids }, fighter_b_id: { in: ids } }, select: { fighter_a_id: true, fighter_b_id: true } }))
          .map((m) => pairKey(m.fighter_a_id as string, m.fighter_b_id as string)),
      );
      const dismissed = new Map(
        (await prisma.fighterDuplicateDismissal.findMany()).map((d) => [pairKey(d.fighter_a_id, d.fighter_b_id), d.dismissed_at]),
      );

      const bouts = new Map<string, number>();
      for (const side of ["fighter_a_id", "fighter_b_id"] as const) {
        for (const g of await prisma.match.groupBy({ by: [side], where: { [side]: { in: ids } }, _count: { _all: true } })) {
          const id = g[side] as string;
          bouts.set(id, (bouts.get(id) ?? 0) + g._count._all);
        }
      }
      const card = (f: (typeof rows)[number]) => ({
        id: f.id,
        kkfId: f.kkf_id,
        name: f.name,
        nameKhmer: f.name_khmer,
        dateOfBirth: dateOnly(f.date_of_birth),
        nationality: f.nationality,
        clubName: f.club?.name ?? null,
        currentWeight: Number(f.current_weight),
        record: f.record,
        image: f.image,
        status: f.status,
        bouts: bouts.get(f.id) ?? 0,
        hasIdNumber: Boolean(idKey(f.private?.id_number)),
        registered: dateOnly(f.created_at),
      });

      const all = [...found.entries()]
        .filter(([key]) => !fought.has(key))
        .map(([key, p]) => {
          const sameBirth = Boolean(p.a.date_of_birth && p.b.date_of_birth && dateOnly(p.a.date_of_birth) === dateOnly(p.b.date_of_birth));
          const reasons = [...p.reasons];
          if (sameBirth) reasons.push("same_birth");
          const veryLikely = p.reasons.has("id_number") || (sameBirth && (p.reasons.has("same_name") || p.reasons.has("same_khmer_name")));
          // The record registered first is listed first (the usual one to keep).
          const [first, second] = (p.a.created_at?.getTime() ?? 0) <= (p.b.created_at?.getTime() ?? 0) ? [p.a, p.b] : [p.b, p.a];
          return { key, tier: veryLikely ? "very_likely" : "possible", reasons, dismissedAt: dismissed.get(key) ?? null, first, second };
        });
      const open = all.filter((p) => !p.dismissedAt);
      const items = (show === "open" ? open : all.filter((p) => p.dismissedAt))
        .sort((x, y) => Number(y.tier === "very_likely") - Number(x.tier === "very_likely") || y.reasons.length - x.reasons.length || x.first.name.localeCompare(y.first.name))
        .map((p) => ({
          key: p.key,
          tier: p.tier,
          reasons: p.reasons,
          dismissed: Boolean(p.dismissedAt),
          fighters: [card(p.first), card(p.second)],
        }));
      return ok(reply, {
        items,
        counts: {
          open: open.length,
          veryLikely: open.filter((p) => p.tier === "very_likely").length,
          possible: open.filter((p) => p.tier === "possible").length,
          dismissed: all.length - open.length,
        },
      });
    });

    protectedRoutes.post("/fighters/duplicates/dismiss", async (request, reply) => {
      requireRole(request, STAFF);
      const [a, b] = pairIds(request.body);
      if ((await prisma.fighter.count({ where: { id: { in: [a, b] }, ...NOT_DELETED } })) !== 2) throw new HttpError(422, "Both fighters must exist");
      const data = { fighter_a_id: a, fighter_b_id: b, dismissed_by: currentUser(request).id, dismissed_at: now() };
      await prisma.fighterDuplicateDismissal.upsert({ where: { fighter_a_id_fighter_b_id: { fighter_a_id: a, fighter_b_id: b } }, create: data, update: data });
      return ok(reply, { key: `${a}|${b}`, dismissed: true });
    });

    protectedRoutes.post("/fighters/duplicates/restore", async (request, reply) => {
      requireRole(request, STAFF);
      const [a, b] = pairIds(request.body);
      await prisma.fighterDuplicateDismissal.deleteMany({ where: { fighter_a_id: a, fighter_b_id: b } });
      return ok(reply, { key: `${a}|${b}`, dismissed: false });
    });
  });
}
