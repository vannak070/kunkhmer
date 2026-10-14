/**
 * Overview  →  /api/overview
 *
 *   GET /overview?from=YYYY-MM-DD   signed in (not Referee / Judge): what the admin dashboard and the header bell need,
 *                                   in one response instead of seven list calls (claude/updates/admin-overview-endpoint.md).
 *
 * Only the fields the overview reads are sent, under the same names the list endpoints use. The to-do rules stay in the
 * admin (`hooks/useAdminOverview.ts`); this answers with the data behind them, limited to what the user may see:
 *   - fighters: only those that can be a to-do (staff: Draft / Pending; a club: its own Rejected), plus the Active count;
 *   - events / bouts from `from` onward (bouts of an Organizer's own broadcaster's events only);
 *   - vacant titles (staff), waiting agreements and open disputes (staff).
 */
import type { FastifyInstance } from "fastify";
import { prisma } from "../../db.ts";
import { Role, STAFF, hasRole, requireAuth, requireRole } from "../../lib/auth.ts";
import { dateOnly, micro } from "../../lib/dates.ts";
import { ok } from "../../lib/http.ts";
import { dateWindow } from "../../lib/window.ts";
import { eventScope } from "../events/routes.ts";
import { waitingAgreements } from "../events/agreements.ts";
import { disputeRows } from "../events/signoff.ts";
import { NOT_DELETED } from "../fighters/routes.ts";

const AWAITING = ["Draft", "Pending KKF Verification", "Pending"];

export default async function overviewRoutes(app: FastifyInstance) {
  app.register(async (routes) => {
    routes.addHook("preHandler", requireAuth);

    routes.get("/overview", async (request, reply) => {
      const user = requireRole(request, [...STAFF, Role.Organizer, Role.Club]);
      const staff = hasRole(user, STAFF);
      const window = dateWindow(request.query);

      const [activeFighters, clubs, fighters, events, matches, champions, agreements, disputes] = await Promise.all([
        prisma.fighter.count({ where: { ...NOT_DELETED, status: "Active" } }),
        prisma.club.count(),
        prisma.fighter.findMany({
          where: {
            ...NOT_DELETED,
            ...(staff ? { status: { in: AWAITING } } : user.role === Role.Club && user.club_id ? { status: "Rejected", club_id: user.club_id } : { status: { in: [] } }),
          },
          select: { id: true, name: true, status: true, club_id: true, review_note: true, club: { select: { name: true } } },
          orderBy: { created_at: { sort: "desc", nulls: "last" } },
        }),
        prisma.event.findMany({
          where: { ...eventScope(user), ...(window ? { date: window } : {}) },
          select: {
            id: true, name: true, date: true, location: true, status: true, organizer_id: true, kkf_comment: true, signed_off_at: true,
            organizer: { select: { full_name: true } },
          },
          orderBy: [{ date: "desc" }, { created_at: { sort: "desc", nulls: "last" } }],
        }),
        prisma.match.findMany({
          where: {
            ...(window ? { subEvent: { date: window } } : {}),
            ...(user.role === Role.Organizer ? { event: eventScope(user) } : {}),
          },
          select: {
            id: true, event_id: true, sub_event_id: true, status: true, fighter_a_id: true, fighter_b_id: true,
            fighter_a_confirmed: true, fighter_b_confirmed: true, referee_id: true, judge_ids: true, replacement_side: true,
            proposal_status: true, club_a_response: true, club_b_response: true, club_a_note: true, club_b_note: true,
            subEvent: { select: { date: true } },
            result: { select: { winner_id: true, method: true, round: true } },
            fighterA: { select: { name: true, deleted_at: true, club: { select: { id: true, name: true } } } },
            fighterB: { select: { name: true, deleted_at: true, club: { select: { id: true, name: true } } } },
          },
          orderBy: [{ sort_order: "asc" }, { created_at: { sort: "asc", nulls: "first" } }],
        }),
        staff
          ? prisma.champion.findMany({
              where: { approval_status: "approved", OR: [{ status: "Vacant" }, { current_holder_id: null }] },
              select: { id: true, title_name: true, status: true, current_holder_id: true, approval_status: true },
            })
          : [],
        staff ? waitingAgreements() : [],
        staff ? disputeRows("open") : [],
      ]);

      // A soft-deleted fighter shows as "TBD", like everywhere else.
      const side = (f: (typeof matches)[number]["fighterA"]) => (f && !f.deleted_at ? f : null);

      return ok(reply, {
        active_fighters: activeFighters,
        clubs,
        fighters: fighters.map((f) => ({ id: f.id, name: f.name, status: f.status, clubId: f.club_id, clubName: f.club?.name ?? null, reviewNote: f.review_note })),
        events: events.map((e) => ({
          id: e.id, name: e.name, date: micro(e.date), location: e.location, status: e.status, organizer_id: e.organizer_id,
          organizer_name: e.organizer?.full_name ?? null, kkf_comment: e.kkf_comment, signed_off_at: micro(e.signed_off_at),
        })),
        matches: matches.map((m) => {
          const a = side(m.fighterA);
          const b = side(m.fighterB);
          return {
            id: m.id, event_id: m.event_id, sub_event_id: m.sub_event_id, status: m.status,
            fighter_a_id: m.fighter_a_id, fighter_b_id: m.fighter_b_id,
            fighter_a_name: a?.name ?? null, fighter_b_name: b?.name ?? null,
            club_a_name: a?.club?.name ?? null, club_b_name: b?.club?.name ?? null,
            fighter_a: a ? { club: a.club } : null, fighter_b: b ? { club: b.club } : null,
            fighter_a_confirmed: m.fighter_a_confirmed, fighter_b_confirmed: m.fighter_b_confirmed,
            referee_id: m.referee_id, judge_ids: m.judge_ids, replacement_side: m.replacement_side,
            proposal_status: m.proposal_status, club_a_response: m.club_a_response, club_b_response: m.club_b_response,
            club_a_note: m.club_a_note, club_b_note: m.club_b_note,
            date: dateOnly(m.subEvent.date),
            result: m.result ? { winner_id: m.result.winner_id, method: m.result.method, round: m.result.round } : null,
            winner_id: m.result?.winner_id ?? null, winner_method: m.result?.method ?? null, winner_round: m.result?.round ?? null,
          };
        }),
        champions,
        agreements_waiting: agreements,
        open_disputes: disputes,
      });
    });
  });
}
