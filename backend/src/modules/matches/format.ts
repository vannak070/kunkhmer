/** Response shapes for batches (sub-events) and matches, as Laravel serialized them. */
import type { BoutResult, Match, Prisma, SubEvent } from "../../generated/prisma/client.ts";
import { dateOnly, micro } from "../../lib/dates.ts";
import { userArray } from "../auth/routes.ts";
import { championArray } from "../champions/routes.ts";
import { clubArray } from "../clubs/routes.ts";
import { eventArray } from "../events/routes.ts";
import { fighterArray, visibleFighter } from "../fighters/routes.ts";

export function subEventArray(s: SubEvent) {
  return {
    id: s.id,
    event_id: s.event_id,
    name: s.name,
    week_number: s.week_number,
    date: micro(s.date),
    location: s.location,
    phase: s.phase,
    status: s.status,
    batch_number: s.batch_number,
    created_by: s.created_by,
    created_at: micro(s.created_at),
    updated_at: micro(s.updated_at),
  };
}

export const subEventRelations = { event: true, createdBy: true } as const satisfies Prisma.SubEventInclude;
type SubEventWithRelations = Prisma.SubEventGetPayload<{ include: typeof subEventRelations }>;

/**
 * Batch with its event and creator. Laravel serialized the createdBy relation
 * under "created_by", replacing the creator's id with the user object.
 */
export function formatSubEvent(s: SubEventWithRelations) {
  return {
    ...subEventArray(s),
    event: eventArray(s.event),
    created_by: s.createdBy ? userArray(s.createdBy) : null,
    event_name: s.event.name,
    creator_name: s.createdBy?.full_name ?? null,
  };
}

export function matchArray(m: Match) {
  return {
    id: m.id,
    event_id: m.event_id,
    sub_event_id: m.sub_event_id,
    fighter_a_id: m.fighter_a_id,
    fighter_b_id: m.fighter_b_id,
    rounds: m.rounds,
    round_time: m.round_time,
    knockdown_limit: m.knockdown_limit,
    agreed_weight: Number(m.agreed_weight),
    glove_size: m.glove_size,
    glove_brand: m.glove_brand,
    fighter_a_confirmed: m.fighter_a_confirmed,
    fighter_b_confirmed: m.fighter_b_confirmed,
    referee_confirmed: m.referee_confirmed,
    glove_confirmed_date: micro(m.glove_confirmed_date),
    status: m.status,
    proposal_status: m.proposal_status,
    club_a_response: m.club_a_response,
    club_b_response: m.club_b_response,
    referee_id: m.referee_id,
    judge_ids: m.judge_ids,
    winner_id: m.winner_id,
    created_at: micro(m.created_at),
    updated_at: micro(m.updated_at),
    is_title_match: m.is_title_match,
    championship_id: m.championship_id,
    sort_order: m.sort_order,
  };
}

export function boutResultArray(r: BoutResult) {
  return {
    match_id: r.match_id,
    winner_id: r.winner_id,
    method: r.method,
    round: r.round,
    duration: r.duration,
    recorded_at: micro(r.recorded_at),
  };
}

export const matchRelations = {
  subEvent: true,
  fighterA: { include: { club: true } },
  fighterB: { include: { club: true } },
  referee: true,
  result: true,
  championship: true,
} as const satisfies Prisma.MatchInclude;
type MatchWithRelations = Prisma.MatchGetPayload<{ include: typeof matchRelations }>;

/** Match with its batch, fighters (and clubs), referee, result and title, plus flat display fields. */
export function formatMatch(m: MatchWithRelations) {
  const fighterA = visibleFighter(m.fighterA);
  const fighterB = visibleFighter(m.fighterB);
  const withClub = (f: NonNullable<typeof fighterA>) => ({ ...fighterArray(f), club: f.club ? clubArray(f.club) : null });

  return {
    ...matchArray(m),
    sub_event: subEventArray(m.subEvent),
    fighter_a: fighterA ? withClub(fighterA) : null,
    fighter_b: fighterB ? withClub(fighterB) : null,
    referee: m.referee ? userArray(m.referee) : null,
    result: m.result ? boutResultArray(m.result) : null,
    championship: m.championship ? championArray(m.championship) : null,

    date: dateOnly(m.subEvent.date),
    sub_event_name: m.subEvent.name,
    fighter_a_name: fighterA?.name ?? null,
    fighter_a_image: fighterA?.image ?? null,
    fighter_a_record: fighterA?.record ?? null,
    fighter_a_grade: fighterA?.grade ?? null,
    fighter_b_name: fighterB?.name ?? null,
    fighter_b_image: fighterB?.image ?? null,
    fighter_b_record: fighterB?.record ?? null,
    fighter_b_grade: fighterB?.grade ?? null,
    club_a_name: fighterA?.club?.name ?? null,
    club_b_name: fighterB?.club?.name ?? null,
    referee_name: m.referee?.full_name ?? null,
    // The winner shown is always the recorded result's.
    winner_id: m.result?.winner_id ?? null,
    winner_method: m.result?.method ?? null,
    winner_round: m.result?.round ?? null,
    winner_duration: m.result?.duration ?? null,
    isTitleMatch: m.is_title_match,
    championshipId: m.championship_id,
    championshipTitleName: m.championship?.title_name ?? null,
    sortOrder: m.sort_order,
  };
}
