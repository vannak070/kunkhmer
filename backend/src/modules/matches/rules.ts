/**
 * KKF matching rules (claude/features/program-workflow.md, claude/updates/matching-rules.md).
 *
 *   GET  /matches/rules        KKF staff + Organizer   the rules with their current settings
 *   PUT  /matches/rules/:key   KKF staff               { enabled?, action? ("block"|"warn"), value? }
 *   POST /matches/check        KKF staff + Organizer   { subEventId, fighterAId, fighterBId, agreedWeight?, matchId?, championshipId? }
 *                                                       → { allowed, blocked: [...], warnings: [...] }; saves nothing
 *
 * `checkPairing` is also run when a bout is created or a fighter is swapped: a broken Block rule is a 422
 * naming every broken rule; broken Warn rules let the bout through and come back as `warnings`.
 */
import type { FastifyInstance } from "fastify";
import { prisma } from "../../db.ts";
import { Role, STAFF, requireAuth, requireRole } from "../../lib/auth.ts";
import { now } from "../../lib/dates.ts";
import { HttpError, isUuid, notFound, ok } from "../../lib/http.ts";
import { inputOf, isTruthy } from "../../lib/input.ts";
import { parseRecord } from "../../lib/record.ts";
import { titleListWarning } from "../events/agreements.ts";

const READERS = [...STAFF, Role.Organizer];
const DAY = 86_400_000;

export interface RuleHit {
  key: string;
  label: string;
  action: "block" | "warn";
  /** English sentence (also the 422 text); the admin builds its own English / Khmer sentence from `params`. */
  message: string;
  /** The fighter the problem is about (null when it concerns the pairing or the bout). */
  fighter_id: string | null;
  /** Plain values for the sentence: names, dates, kg, limits (claude/updates/rule-messages.md). */
  params: Record<string, string | number | null>;
}

export interface PairingInput {
  subEventId: string;
  /** An empty corner (null) is "to be announced": only the rules about the fighter(s) present run. */
  fighterAId: string | null;
  fighterBId: string | null;
  /** Fighters exempt from the schedule rules (already booked / rest days): a draw winner moving on to the next round. */
  skipScheduleFor?: string[];
  /** kg; when absent the weight-gap rule is skipped */
  agreedWeight?: number | null;
  /** the bout being changed (ignored by the schedule rules) */
  matchId?: string | null;
  /** Check as if the fight were on this date (a postponement) instead of the fight card's date. */
  fightDate?: Date | null;
}

const ruleRow = (r: { key: string; label: string; description: string | null; enabled: boolean; action: string; value: unknown; unit: string | null; sort_order: number }) => ({
  key: r.key,
  label: r.label,
  description: r.description,
  enabled: r.enabled,
  action: r.action,
  value: r.value === null ? null : Number(r.value),
  unit: r.unit,
  sort_order: r.sort_order,
});

const years = (from: Date, to: Date) => {
  let age = to.getUTCFullYear() - from.getUTCFullYear();
  if (to.getUTCMonth() < from.getUTCMonth() || (to.getUTCMonth() === from.getUTCMonth() && to.getUTCDate() < from.getUTCDate())) age -= 1;
  return age;
};
const day = (d: Date) => d.toISOString().slice(0, 10);
const gradeNo = (g: string) => g.trim().toUpperCase().charCodeAt(0);

/** Runs every enabled rule on a pairing; returns what it breaks (blocks first). */
export async function checkPairing(input: PairingInput): Promise<RuleHit[]> {
  const ids = [input.fighterAId, input.fighterBId].filter((id): id is string => Boolean(id));
  if (!isUuid(input.subEventId) || ids.length === 0 || !ids.every(isUuid)) return [];
  const rules = (await prisma.matchingRule.findMany({ where: { enabled: true }, orderBy: { sort_order: "asc" } })).map(ruleRow);
  if (!rules.length) return [];

  const [subEvent, fighters] = await Promise.all([
    prisma.subEvent.findUnique({ where: { id: input.subEventId } }),
    prisma.fighter.findMany({ where: { id: { in: ids } } }),
  ]);
  const a = input.fighterAId ? fighters.find((f) => f.id === input.fighterAId) : undefined;
  const b = input.fighterBId ? fighters.find((f) => f.id === input.fighterBId) : undefined;
  if (!subEvent || (input.fighterAId && !a) || (input.fighterBId && !b)) return []; // missing records are reported by the caller's own checks
  // The fighters present (one corner may be empty) and whether both corners are filled (pair rules need both).
  const present = [a, b].filter((f): f is NonNullable<typeof a> => Boolean(f));
  const both = a && b ? { a, b } : null;
  const skip = new Set(input.skipScheduleFor ?? []);
  const fightDate = input.fightDate ?? subEvent.date;

  // Other bouts of either fighter (not cancelled events), for the schedule rules.
  const others = await prisma.match.findMany({
    where: {
      id: input.matchId ? { not: input.matchId } : undefined,
      event: { status: { not: "Cancelled" } },
      // A cancelled bout, or one waiting for a replacement (phase 6), doesn't book anybody.
      status: { not: "Cancelled" },
      replacement_side: null,
      OR: [{ fighter_a_id: { in: ids } }, { fighter_b_id: { in: ids } }],
    },
    include: { subEvent: { select: { date: true, id: true } } },
  });
  const bouts = (id: string) => others.filter((m) => m.fighter_a_id === id || m.fighter_b_id === id);

  const hits: RuleHit[] = [];
  for (const r of rules) {
    const hit = (message: string, fighter_id: string | null, params: RuleHit["params"]) =>
      hits.push({ key: r.key, label: r.label, action: r.action === "warn" ? "warn" : "block", message, fighter_id, params });
    const pair: RuleHit["params"] = both ? { a_id: both.a.id, a_name: both.a.name, b_id: both.b.id, b_name: both.b.name } : {};
    const limit = r.value ?? 0;
    switch (r.key) {
      case "medical":
        for (const f of present) {
          if (f.medical_status !== "Cleared") hit(`${f.name} is not medically cleared (${f.medical_status})`, f.id, { name: f.name, reason: "not_cleared", status: f.medical_status });
          else if (f.status === "Injured") hit(`${f.name} is marked Injured`, f.id, { name: f.name, reason: "injured" });
        }
        break;
      case "suspension":
        for (const f of present) {
          if (f.suspension_end_date && f.suspension_end_date >= fightDate) hit(`${f.name} is suspended until ${day(f.suspension_end_date)}`, f.id, { name: f.name, reason: "until", date: day(f.suspension_end_date) });
          else if (f.status === "Suspended") hit(`${f.name} is marked Suspended`, f.id, { name: f.name, reason: "marked" });
        }
        break;
      case "same_gender":
        if (both && both.a.gender !== both.b.gender) hit(`${both.a.name} (${both.a.gender}) and ${both.b.name} (${both.b.gender}) are not the same gender`, null, pair);
        break;
      case "min_age":
        // A guest fighter without a date of birth can't be checked: not blocked.
        for (const f of present) if (f.date_of_birth && years(f.date_of_birth, fightDate) < limit) hit(`${f.name} will be under ${limit} on the fight date`, f.id, { name: f.name, limit });
        break;
      case "weight_gap":
        if (input.agreedWeight != null) {
          for (const f of present) {
            const gap = Math.abs(Number(f.current_weight) - input.agreedWeight);
            if (gap > limit) hit(`${f.name} weighs ${Number(f.current_weight)} kg, ${Math.round(gap * 10) / 10} kg from the agreed ${input.agreedWeight} kg (limit ${limit} kg)`, f.id, { name: f.name, kg: Number(f.current_weight), gap: Math.round(gap * 10) / 10, agreed: input.agreedWeight, limit });
          }
        }
        break;
      case "grade_gap": {
        if (!both) break;
        const gap = Math.abs(gradeNo(both.a.grade) - gradeNo(both.b.grade));
        if (gap > limit) hit(`Grades ${both.a.grade} and ${both.b.grade} are ${gap} steps apart (limit ${limit})`, null, { ...pair, grade_a: both.a.grade, grade_b: both.b.grade, gap, limit });
        break;
      }
      case "record_gap": {
        if (!both) break;
        const wa = parseRecord(both.a.record)?.w;
        const wb = parseRecord(both.b.record)?.w;
        if (wa !== undefined && wb !== undefined && Math.abs(wa - wb) > limit) hit(`${both.a.name} has ${wa} wins and ${both.b.name} has ${wb} (limit ${limit} apart)`, null, { ...pair, wins_a: wa, wins_b: wb, limit });
        break;
      }
      case "rest_days":
        for (const f of present.filter((x) => !skip.has(x.id))) {
          const near = bouts(f.id).find((m) => m.subEvent.id !== input.subEventId && Math.abs(m.subEvent.date.getTime() - fightDate.getTime()) / DAY < limit);
          if (near) hit(`${f.name} has another bout on ${day(near.subEvent.date)}, less than ${limit} days apart`, f.id, { name: f.name, date: day(near.subEvent.date), limit });
        }
        break;
      case "same_club":
        if (both && both.a.club_id && both.a.club_id === both.b.club_id) hit(`${both.a.name} and ${both.b.name} are from the same club`, null, pair);
        break;
      case "already_booked":
        for (const f of present.filter((x) => !skip.has(x.id))) if (bouts(f.id).some((m) => m.sub_event_id === subEvent.id || m.subEvent.date.getTime() === fightDate.getTime())) hit(`${f.name} is already in a bout on this fight card or day`, f.id, { name: f.name });
        break;
    }
  }
  return hits.sort((x, y) => Number(y.action === "block") - Number(x.action === "block"));
}

/**
 * Fighters filling a "winner of bout N" corner who fought in bout N: the same night is expected (a draw), so the
 * schedule rules (already booked / rest days) don't apply to them.
 */
export async function movingOn(match: { slot_a_from: string | null; slot_b_from: string | null; draw_id?: string | null }, fills: { side: "a" | "b"; fighterId: string }[]) {
  const out: string[] = [];
  for (const { side, fighterId } of fills) {
    const from = match[`slot_${side}_from`];
    if (!from) continue;
    const source = await prisma.match.findUnique({ where: { id: from }, select: { fighter_a_id: true, fighter_b_id: true } });
    if (source && (source.fighter_a_id === fighterId || source.fighter_b_id === fighterId)) out.push(fighterId);
  }
  return out;
}

/** Throws a 422 for broken Block rules; returns the Warn hits. */
export async function enforceRules(input: PairingInput): Promise<RuleHit[]> {
  const hits = await checkPairing(input);
  const blocked = hits.filter((h) => h.action === "block");
  if (blocked.length) throw new HttpError(422, `This bout breaks KKF matching rules: ${blocked.map((h) => h.message).join("; ")}`);
  return hits;
}

export default async function matchingRuleRoutes(app: FastifyInstance) {
  app.register(async (protectedRoutes) => {
    protectedRoutes.addHook("preHandler", requireAuth);

    protectedRoutes.get("/matches/rules", async (request, reply) => {
      requireRole(request, READERS);
      const rows = await prisma.matchingRule.findMany({ orderBy: { sort_order: "asc" } });
      return ok(reply, rows.map(ruleRow));
    });

    protectedRoutes.put("/matches/rules/:key", async (request, reply) => {
      const user = requireRole(request, STAFF);
      const { key } = request.params as { key: string };
      const rule = await prisma.matchingRule.findUnique({ where: { key } });
      if (!rule) throw notFound("Matching rule");
      const input = inputOf(request.body);

      const data: Record<string, unknown> = {};
      if (input.has("enabled")) data.enabled = isTruthy(input.get("enabled"));
      if (input.has("action")) {
        const action = input.get<string>("action");
        if (action !== "block" && action !== "warn") throw new HttpError(422, 'The action must be "block" or "warn"');
        data.action = action;
      }
      if (input.present("value")) {
        const raw = input.get("value");
        if (rule.unit === null) throw new HttpError(422, "This rule has no limit to set");
        const value = Number(raw);
        if (raw === null || !Number.isFinite(value) || value < 0 || value > 1000) throw new HttpError(422, "The value must be a number between 0 and 1000");
        data.value = value;
      }
      await prisma.matchingRule.update({ where: { key }, data: { ...data, updated_at: now(), updated_by: user.id } });
      return ok(reply, ruleRow((await prisma.matchingRule.findUniqueOrThrow({ where: { key } }))));
    });

    // Dry run: what would creating this bout break? Saves nothing.
    protectedRoutes.post("/matches/check", async (request, reply) => {
      requireRole(request, READERS);
      const input = inputOf(request.body);
      const weight = input.get("agreedWeight");
      const subEventId = input.required<string>("subEventId");
      const hits = await checkPairing({
        subEventId,
        fighterAId: input.required<string>("fighterAId"),
        fighterBId: input.required<string>("fighterBId"),
        agreedWeight: weight === null || Number.isNaN(Number(weight)) ? null : Number(weight),
        matchId: input.get<string>("matchId"),
      });
      // A title bout: is the belt on the fight night's confirmed title list? (warning only)
      const championshipId = input.get<string>("championshipId");
      if (championshipId && isUuid(subEventId)) {
        const card = await prisma.subEvent.findUnique({ where: { id: subEventId }, select: { event_id: true } });
        const titleHit = await titleListWarning(card?.event_id, championshipId);
        if (titleHit) hits.push(titleHit);
      }
      return ok(reply, {
        allowed: !hits.some((h) => h.action === "block"),
        blocked: hits.filter((h) => h.action === "block"),
        warnings: hits.filter((h) => h.action === "warn"),
      });
    });
  });
}
