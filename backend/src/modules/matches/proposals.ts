/**
 * Match proposals: both fighters' clubs accept or decline a bout (admin Phase 3b).
 *
 * Each side ("a" / "b") has a response — pending, accepted or declined — plus
 * the decline reason and who answered when. `proposal_status` is derived:
 * both accepted → accepted; either declined → declined; otherwise pending.
 * A side whose fighter has no club is accepted automatically. The public only
 * sees accepted bouts (or bouts that already have a result).
 * With approvals switched off (config.approvals, the default) there is no club step: the KKF staff member
 * who creates a bout, or swaps a fighter, confirms that side at once (claude/updates/officer-run-program.md).
 */
import type { Fighter, Match, Prisma, User } from "../../generated/prisma/client.ts";
import { Role, STAFF, hasRole } from "../../lib/auth.ts";
import { config } from "../../config.ts";
import { HttpError } from "../../lib/http.ts";

export type Side = "a" | "b";
export const SIDES: Side[] = ["a", "b"];
export const RESPONSES = ["accepted", "declined"] as const;

/** Bouts the public may see: accepted by both clubs, or already decided. */
export const PUBLIC_BOUT = {
  OR: [{ proposal_status: "accepted" }, { result: { isNot: null } }],
} satisfies Prisma.MatchWhereInput;

export function proposalStatus(a: string, b: string) {
  if (a === "declined" || b === "declined") return "declined";
  if (a === "accepted" && b === "accepted") return "accepted";
  return "pending";
}

/**
 * Fresh answer for a side: a fighter without a club needs no confirmation. With approvals off the
 * side is confirmed at once by `by` (the user creating or changing the bout).
 */
export function openSide(side: Side, fighter: Pick<Fighter, "club_id">, by: { userId: string; at: Date }) {
  if (!config.approvals) {
    return {
      [`club_${side}_response`]: "accepted",
      [`club_${side}_note`]: null,
      [`club_${side}_responded_at`]: by.at,
      [`club_${side}_responded_by`]: by.userId,
    } as Prisma.MatchUncheckedUpdateInput;
  }
  return {
    [`club_${side}_response`]: fighter.club_id ? "pending" : "accepted",
    [`club_${side}_note`]: null,
    [`club_${side}_responded_at`]: null,
    [`club_${side}_responded_by`]: null,
  } as Prisma.MatchUncheckedUpdateInput;
}

type MatchWithFighters = Match & { fighterA: Fighter; fighterB: Fighter };

/**
 * The sides this user answers for. Staff may answer either side (both when no
 * side is given); a club answers the sides whose fighter is from its club, so a
 * same-club bout is covered by one answer.
 */
export function sidesFor(user: User, match: MatchWithFighters, requested: string | null): Side[] {
  if (requested !== null && requested !== "a" && requested !== "b") {
    throw new HttpError(422, 'The side must be "a" or "b"');
  }
  const clubOf = { a: match.fighterA.club_id, b: match.fighterB.club_id };
  const staff = hasRole(user, STAFF);
  const own = SIDES.filter((s) => user.role === Role.Club && !!user.club_id && clubOf[s] === user.club_id);
  if (!staff && own.length === 0) {
    throw new HttpError(403, "Forbidden: You do not represent either club in this match");
  }
  if (requested === null) return staff ? SIDES : own;
  if (!staff && !own.includes(requested)) {
    throw new HttpError(403, "Forbidden: You do not represent that side of the match");
  }
  return staff ? [requested] : own;
}
