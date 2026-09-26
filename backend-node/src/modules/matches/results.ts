/**
 * Recording a match result: saves the bout result, marks the match completed,
 * updates the championship registry for title matches and recalculates both
 * fighters' W-L-D records — all in one transaction.
 *
 * The championship is only updated the first time a result is recorded for a
 * match. Laravel re-ran it on every submission, so re-saving a title result
 * logged a second defense and counted it twice. Correcting a title result to
 * a different winner does not reverse the title change; that needs an admin
 * correction.
 */
import { randomUUID } from "node:crypto";
import { prisma } from "../../db.ts";
import type { Match, Prisma } from "../../generated/prisma/client.ts";
import { now } from "../../lib/dates.ts";
import { notFound } from "../../lib/http.ts";
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
    const match = await tx.match.findUnique({ where: { id: matchId }, include: { result: true } });
    if (!match) throw notFound("Match");
    const firstResult = match.result === null;
    const at = now();

    const bout = { winner_id: result.winnerId, method: result.method, round: result.round, duration: result.duration, recorded_at: at };
    await tx.boutResult.upsert({ where: { match_id: matchId }, create: { match_id: matchId, ...bout }, update: bout });
    await tx.match.update({ where: { id: matchId }, data: { status: "Completed", winner_id: result.winnerId, updated_at: at } });

    if (firstResult && match.is_title_match && match.championship_id) {
      await updateChampionship(tx, match, result);
    }

    await recalculateRecord(tx, match.fighter_a_id);
    await recalculateRecord(tx, match.fighter_b_id);
  });
}

async function updateChampionship(tx: Tx, match: Match, result: ResultInput) {
  const champion = await tx.champion.findUnique({ where: { id: match.championship_id! } });
  if (!champion) return;

  const context = await tx.match.findUniqueOrThrow({ where: { id: match.id }, include: { subEvent: true, event: true } });
  const matchDate = context.subEvent.date;
  const eventName = context.event.name;
  const at = now();

  const winner = result.winnerId ? await tx.fighter.findFirst({ where: { id: result.winnerId, ...NOT_DELETED } }) : null;
  const opponentId = result.winnerId === match.fighter_a_id ? match.fighter_b_id : match.fighter_a_id;
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
  } else if (result.winnerId === holderId) {
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

/** Rebuild a fighter's "W-L-D" record from their completed matches. */
async function recalculateRecord(tx: Tx, fighterId: string) {
  const matches = await tx.match.findMany({
    where: { status: "Completed", OR: [{ fighter_a_id: fighterId }, { fighter_b_id: fighterId }] },
    include: { result: true },
  });

  let wins = 0;
  let losses = 0;
  let draws = 0;
  for (const m of matches) {
    if (!m.result) continue;
    if (m.result.winner_id === fighterId) wins++;
    else if (m.result.winner_id === null) draws++;
    else losses++;
  }

  await tx.fighter.updateMany({
    where: { id: fighterId, ...NOT_DELETED },
    data: { record: `${wins}-${losses}-${draws}`, updated_at: now() },
  });
}
