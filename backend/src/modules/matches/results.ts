/**
 * Recording a match result: saves the bout result, marks the match completed,
 * updates the championship registry for title matches and recalculates both
 * fighters' W-L-D records (career before this system + results recorded here) — all in one transaction.
 *
 * Title fights: applying a result to a belt stores the belt's holder fields as
 * they were just before (`championship_changes`). Re-saving the result of a
 * fight that was already applied puts the belt back to that state, removes the
 * history written by this fight and every later title fight for the belt, and
 * applies them again in their original order with their saved results — so a
 * corrected winner moves the title, and re-saving the same result changes
 * nothing. Manual edits to the holder made in between are replaced.
 */
import { randomUUID } from "node:crypto";
import { prisma } from "../../db.ts";
import type { Champion, ChampionshipChange, Match, Prisma } from "../../generated/prisma/client.ts";
import { now } from "../../lib/dates.ts";
import { notFound } from "../../lib/http.ts";
import { ZERO, addRecords, formatRecord, parseRecord, recordedResults } from "../../lib/record.ts";
import { NOT_DELETED } from "../fighters/routes.ts";

type Tx = Prisma.TransactionClient;

export interface ResultInput {
  winnerId: string | null;
  method: string;
  round: number;
  duration: string | null;
}

export async function recordMatchResult(matchId: string, result: ResultInput) {
  await prisma.$transaction(async (tx) => {
    const match = await tx.match.findUnique({ where: { id: matchId } });
    if (!match) throw notFound("Match");
    const at = now();

    const bout = { winner_id: result.winnerId, method: result.method, round: result.round, duration: result.duration, recorded_at: at };
    await tx.boutResult.upsert({ where: { match_id: matchId }, create: { match_id: matchId, ...bout }, update: bout });
    await tx.match.update({ where: { id: matchId }, data: { status: "Completed", winner_id: result.winnerId, updated_at: at } });

    await updateTitles(tx, matchId);

    await recalculateRecord(tx, match.fighter_a_id);
    await recalculateRecord(tx, match.fighter_b_id);
  });
}

type TitleFight = Match & { result: { winner_id: string | null; method: string; round: number } | null };

const isTitleFight = (m: TitleFight | null): m is TitleFight =>
  Boolean(m && m.is_title_match && m.championship_id && m.status === "Completed" && m.result);

async function updateTitles(tx: Tx, matchId: string) {
  const applied = await tx.championshipChange.findUnique({ where: { match_id: matchId } });
  if (applied) await replayFrom(tx, applied);

  // Not applied yet (first result, or the fight now counts for another belt). Title results saved
  // before championship_changes existed already wrote history; those are left as they are.
  const match = await tx.match.findUnique({ where: { id: matchId }, include: { result: true } });
  if (!isTitleFight(match)) return;
  if (await tx.championshipChange.findUnique({ where: { match_id: matchId } })) return;
  if (!applied && (await tx.championDefense.count({ where: { match_id: matchId } }))) return;
  await applyTitleResult(tx, match);
}

/** Undo `from` and every later title fight for the same belt, then apply them again in order. */
async function replayFrom(tx: Tx, from: ChampionshipChange) {
  const changes = await tx.championshipChange.findMany({
    where: { champion_id: from.champion_id, seq: { gte: from.seq } },
    orderBy: { seq: "asc" },
  });
  const matchIds = changes.map((c) => c.match_id);

  await tx.champion.update({ where: { id: from.champion_id }, data: { ...(await restoreHolder(tx, from.before)), updated_at: now() } });
  await tx.championDefense.deleteMany({ where: { champion_id: from.champion_id, match_id: { in: matchIds } } });
  await tx.championshipChange.deleteMany({ where: { id: { in: changes.map((c) => c.id) } } });

  for (const id of matchIds) {
    const match = await tx.match.findUnique({ where: { id }, include: { result: true } });
    if (isTitleFight(match) && match.championship_id === from.champion_id) await applyTitleResult(tx, match);
  }
}

// The belt fields a title result changes — saved before and restored on a correction.
const HOLDER_FIELDS = [
  "current_holder_id",
  "current_holder_name",
  "nationality",
  "date_awarded",
  "winning_match_id",
  "status",
  "defense_count",
  "last_defense_date",
] as const;
const DATE_FIELDS = new Set(["date_awarded", "last_defense_date"]);

function snapshotHolder(c: Champion): Prisma.InputJsonObject {
  return Object.fromEntries(HOLDER_FIELDS.map((k) => [k, c[k] instanceof Date ? (c[k] as Date).toISOString() : (c[k] as string | number | null)]));
}

async function restoreHolder(tx: Tx, before: Prisma.JsonValue) {
  const saved = (before ?? {}) as Record<string, any>;
  const data: Record<string, any> = {};
  for (const k of HOLDER_FIELDS) data[k] = DATE_FIELDS.has(k) && saved[k] ? new Date(saved[k]) : (saved[k] ?? null);
  data.status ??= "Vacant";
  data.defense_count ??= 0;
  // The fight that won the belt back then may have been deleted since.
  if (data.winning_match_id && !(await tx.match.findUnique({ where: { id: data.winning_match_id }, select: { id: true } }))) {
    data.winning_match_id = null;
  }
  return data as Prisma.ChampionUncheckedUpdateInput;
}

async function applyTitleResult(tx: Tx, match: TitleFight) {
  const champion = await tx.champion.findUnique({ where: { id: match.championship_id! } });
  if (!champion) return;
  const result = match.result!;
  const at = now();

  await tx.championshipChange.create({
    data: { id: randomUUID(), champion_id: champion.id, match_id: match.id, before: snapshotHolder(champion), applied_at: at },
  });

  const context = await tx.match.findUniqueOrThrow({ where: { id: match.id }, include: { subEvent: true, event: true } });
  const matchDate = context.subEvent.date;
  const eventName = context.event.name;

  const winner = result.winner_id ? await tx.fighter.findFirst({ where: { id: result.winner_id, ...NOT_DELETED } }) : null;
  const opponentId = result.winner_id === match.fighter_a_id ? match.fighter_b_id : match.fighter_a_id;
  const opponent = await tx.fighter.findFirst({ where: { id: opponentId, ...NOT_DELETED } });

  const logDefense = (fields: { opponent: string; opponent_id: string | null; result: string }) =>
    tx.championDefense.create({
      data: {
        id: randomUUID(),
        champion_id: champion.id,
        event_id: match.event_id,
        event_name: eventName,
        match_id: match.id,
        date: matchDate,
        method: result.method,
        round: result.round,
        ...fields,
      },
    });

  const crown = () =>
    tx.champion.update({
      where: { id: champion.id },
      data: {
        current_holder_id: winner!.id,
        current_holder_name: winner!.name,
        nationality: winner!.nationality,
        date_awarded: matchDate,
        winning_match_id: match.id,
        status: "Active",
        defense_count: 0,
        last_defense_date: null,
        updated_at: at,
      },
    });

  const holderId = champion.current_holder_id;

  if (!holderId) {
    // Vacant title: the winner is crowned. A draw leaves it vacant.
    if (!winner) return;
    await crown();
    await logDefense({ opponent: opponent?.name ?? "Unknown Opponent", opponent_id: opponentId, result: "Crowned New Champion" });
  } else if (holderId !== match.fighter_a_id && holderId !== match.fighter_b_id) {
    // The champion isn't in this fight (e.g. after a correction moved the belt): nothing changes.
    return;
  } else if (result.winner_id === holderId) {
    // Successful defense.
    await tx.champion.update({
      where: { id: champion.id },
      data: { defense_count: { increment: 1 }, last_defense_date: matchDate, winning_match_id: match.id, updated_at: at },
    });
    await logDefense({ opponent: opponent?.name ?? "Unknown Opponent", opponent_id: opponentId, result: "Won" });
  } else if (winner) {
    // The champion lost: log it, then crown the winner.
    await logDefense({ opponent: winner.name, opponent_id: winner.id, result: "Lost" });
    await crown();
  }
}

/** A fighter's record = career before this system + results recorded here. */
async function recalculateRecord(tx: Tx, fighterId: string) {
  const fighter = await tx.fighter.findUnique({ where: { id: fighterId }, select: { career_record: true } });
  if (!fighter) return;
  const total = addRecords(parseRecord(fighter.career_record) ?? ZERO, await recordedResults(tx, fighterId));
  await tx.fighter.updateMany({
    where: { id: fighterId, ...NOT_DELETED },
    data: { record: formatRecord(total), updated_at: now() },
  });
}
