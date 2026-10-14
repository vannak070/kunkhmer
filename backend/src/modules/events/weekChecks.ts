/**
 * Weekly checks (claude/updates/weekly-checks.md)  →  GET /api/events/week-checks?from=YYYY-MM-DD   KKF staff + Organizer
 *
 * Looks at every match in the 7 days from `from` (cancelled matches and bouts left out) and lists what needs a look
 * before KKF prints and signs the week's program sheets:
 *
 *   problem   double_booked      a fighter has two bouts in the week (draw rounds on the same card don't count)
 *   problem   broadcaster_clash  one broadcaster has two matches on the same day less than 3 hours apart
 *   problem   over_weight        a weigh-in above the agreed weight + 1 kg
 *   warning   venue_clash        the same venue twice on a day, less than 3 hours apart
 *   warning   weight_gap         a fighter's weight is further from the agreed weight than the KKF weight-gap limit
 *   warning   empty_corner       a bout still has a corner to be announced
 *   warning   no_officials       bouts without a referee and three judges
 *   warning   no_bouts           a match without bouts
 *   warning   no_time            a match without a start time
 *   warning   not_published      a match still in Draft
 *
 * Each item: { kind, level, event_id, match_id, fighter_id, params } — the admin writes the sentence (English / Khmer).
 * An Organizer sees only the matches it can see. Nothing is saved.
 */
import type { FastifyInstance } from "fastify";
import { prisma } from "../../db.ts";
import { Role, STAFF, requireAuth, requireRole } from "../../lib/auth.ts";
import { dateOnly, toDate } from "../../lib/dates.ts";
import { HttpError, ok } from "../../lib/http.ts";
import { officialsOf } from "../officials/routes.ts";
import { canSeeEvent } from "./routes.ts";

const DAY = 86_400_000;
const CLASH_MINUTES = 180;
const WEIGH_TOLERANCE_KG = 1;

type Level = "problem" | "warning";
interface Check {
  kind: string;
  level: Level;
  event_id: string | null;
  match_id: string | null;
  fighter_id: string | null;
  params: Record<string, string | number | null | (string | number | null)[]>;
}

const minutes = (time: string | null) => (time ? Number(time.slice(0, 2)) * 60 + Number(time.slice(3, 5)) : null);
const vs = (m: { fighterA: { name: string } | null; fighterB: { name: string } | null }) => `${m.fighterA?.name ?? "TBA"} vs ${m.fighterB?.name ?? "TBA"}`;

export default async function weekCheckRoutes(app: FastifyInstance) {
  app.register(async (routes) => {
    routes.addHook("preHandler", requireAuth);

    routes.get("/events/week-checks", async (request, reply) => {
      const user = requireRole(request, [...STAFF, Role.Organizer]);
      const from = toDate((request.query as { from?: string }).from ?? null);
      if (!from) throw new HttpError(422, "The from must be a date like 2026-10-12");
      const to = new Date(from.getTime() + 7 * DAY);

      const events = (
        await prisma.event.findMany({
          where: { date: { gte: from, lt: to }, status: { not: "Cancelled" } },
          include: {
            broadcastStation: { select: { name: true } },
            matches: {
              where: { status: { not: "Cancelled" } },
              include: { fighterA: true, fighterB: true, subEvent: { select: { date: true } } },
              orderBy: { sort_order: "asc" },
            },
          },
          orderBy: [{ date: "asc" }, { start_time: "asc" }],
        })
      ).filter((e) => canSeeEvent(user, e));

      const gapRule = await prisma.matchingRule.findUnique({ where: { key: "weight_gap" } });
      const gapLimit = gapRule?.enabled && gapRule.value !== null ? Number(gapRule.value) : null;

      const out: Check[] = [];
      const add = (c: Omit<Check, "match_id" | "fighter_id"> & Partial<Pick<Check, "match_id" | "fighter_id">>) =>
        out.push({ match_id: null, fighter_id: null, ...c });
      const eventRef = (e: (typeof events)[number]) => ({ event: e.name, date: dateOnly(e.date), time: e.start_time });

      // Per match
      for (const e of events) {
        if (!e.start_time) add({ kind: "no_time", level: "warning", event_id: e.id, params: eventRef(e) });
        if (e.status === "Draft") add({ kind: "not_published", level: "warning", event_id: e.id, params: eventRef(e) });
        if (e.matches.length === 0) add({ kind: "no_bouts", level: "warning", event_id: e.id, params: eventRef(e) });
        const noOfficials = e.matches.filter((m) => { const o = officialsOf(m); return !o.referee || o.judges.length < 3; }).length;
        if (noOfficials) add({ kind: "no_officials", level: "warning", event_id: e.id, params: { ...eventRef(e), bouts: noOfficials } });
        for (const m of e.matches) {
          if (!m.fighter_a_id || !m.fighter_b_id) add({ kind: "empty_corner", level: "warning", event_id: e.id, match_id: m.id, params: { ...eventRef(e), bout: vs(m) } });
          const agreed = Number(m.agreed_weight);
          for (const side of ["a", "b"] as const) {
            const f = side === "a" ? m.fighterA : m.fighterB;
            if (!f) continue;
            const weighed = m[`weigh_in_${side}_kg`];
            if (weighed !== null && Number(weighed) > agreed + WEIGH_TOLERANCE_KG) {
              add({ kind: "over_weight", level: "problem", event_id: e.id, match_id: m.id, fighter_id: f.id, params: { ...eventRef(e), name: f.name, kg: Number(weighed), agreed } });
            } else if (weighed === null && gapLimit !== null && f.current_weight !== null) {
              const gap = Math.round(Math.abs(Number(f.current_weight) - agreed) * 10) / 10;
              if (gap > gapLimit) add({ kind: "weight_gap", level: "warning", event_id: e.id, match_id: m.id, fighter_id: f.id, params: { ...eventRef(e), name: f.name, kg: Number(f.current_weight), agreed, gap, limit: gapLimit } });
            }
          }
        }
      }

      // Fighters with more than one bout in the week (rounds of one draw on the same card are expected).
      const byFighter = new Map<string, { name: string; bouts: { event: (typeof events)[number]; match: (typeof events)[number]["matches"][number] }[] }>();
      for (const e of events) {
        for (const m of e.matches) {
          for (const f of [m.fighterA, m.fighterB]) {
            if (!f) continue;
            const entry = byFighter.get(f.id) ?? { name: f.name, bouts: [] };
            entry.bouts.push({ event: e, match: m });
            byFighter.set(f.id, entry);
          }
        }
      }
      for (const [fighterId, { name, bouts }] of byFighter) {
        const drawIds = new Set(bouts.map((b) => b.match.draw_id));
        const oneDraw = drawIds.size === 1 && !drawIds.has(null) && new Set(bouts.map((b) => b.match.sub_event_id)).size === 1;
        if (bouts.length < 2 || oneDraw) continue;
        add({
          kind: "double_booked", level: "problem", event_id: bouts[0].event.id, fighter_id: fighterId,
          params: { name, events: bouts.map((b) => b.event.name), dates: bouts.map((b) => dateOnly(b.event.date)), event_ids: bouts.map((b) => b.event.id) },
        });
      }

      // Two matches on the same day less than 3 hours apart: same broadcaster (problem) or same venue (warning).
      for (let i = 0; i < events.length; i++) {
        for (let j = i + 1; j < events.length; j++) {
          const a = events[i];
          const b = events[j];
          if (a.date.getTime() !== b.date.getTime()) continue;
          const ta = minutes(a.start_time);
          const tb = minutes(b.start_time);
          if (ta === null || tb === null || Math.abs(ta - tb) >= CLASH_MINUTES) continue;
          const pair = { events: [a.name, b.name], times: [a.start_time, b.start_time], date: dateOnly(a.date), event_ids: [a.id, b.id] };
          if (a.broadcast_station_id && a.broadcast_station_id === b.broadcast_station_id) {
            add({ kind: "broadcaster_clash", level: "problem", event_id: b.id, params: { ...pair, broadcaster: a.broadcastStation?.name ?? null } });
          }
          if (a.location.trim().toLowerCase() === b.location.trim().toLowerCase()) {
            add({ kind: "venue_clash", level: "warning", event_id: b.id, params: { ...pair, venue: a.location } });
          }
        }
      }

      out.sort((x, y) => Number(y.level === "problem") - Number(x.level === "problem"));
      return ok(reply, { from: dateOnly(from), to: dateOnly(new Date(to.getTime() - DAY)), matches: events.length, problems: out.filter((c) => c.level === "problem").length, warnings: out.filter((c) => c.level === "warning").length, checks: out });
    });
  });
}
