/**
 * Creates in-app notifications for fans who follow the fighters in a bout.
 *
 * Notifications store facts, not sentences: the public site renders them in the
 * fan's language. Failures are logged and swallowed — a notification problem must
 * never stop a match from being created or a result from being recorded.
 */
import { randomUUID } from "node:crypto";
import type { FastifyBaseLogger } from "fastify";
import { prisma } from "../../db.ts";
import type { Prisma } from "../../generated/prisma/client.ts";
import { dateOnly, now } from "../../lib/dates.ts";

export type NotificationType = "bout_scheduled" | "bout_result";

type Outcome = "win" | "loss" | "draw" | "nc";

function outcomeFor(fighterId: string, winnerId: string | null, method: string | null): Outcome {
  if ((method ?? "").toLowerCase() === "no contest") return "nc";
  if (!winnerId) return "draw";
  return winnerId === fighterId ? "win" : "loss";
}

export async function notifyFollowers(matchId: string, type: NotificationType, log: FastifyBaseLogger) {
  try {
    const match = await prisma.match.findUnique({
      where: { id: matchId },
      include: { fighterA: true, fighterB: true, event: true, subEvent: true, result: true },
    });
    if (!match) return;

    const corners = [
      { fighter: match.fighterA, opponent: match.fighterB },
      { fighter: match.fighterB, opponent: match.fighterA },
    ].filter((c) => !c.fighter.deleted_at);

    const followers = await prisma.fanFollow.findMany({
      where: { fighter_id: { in: corners.map((c) => c.fighter.id) } },
      select: { fan_id: true, fighter_id: true },
    });
    if (followers.length === 0) return;

    const at = now();
    const rows: Prisma.FanNotificationCreateManyInput[] = followers.map((f) => {
      const { fighter, opponent } = corners.find((c) => c.fighter.id === f.fighter_id)!;
      const data: Record<string, unknown> = {
        fighterId: fighter.id,
        fighterName: fighter.name,
        fighterNameKhmer: fighter.name_khmer,
        opponentId: opponent.id,
        opponentName: opponent.name,
        opponentNameKhmer: opponent.name_khmer,
        eventId: match.event_id,
        eventName: match.event?.name ?? null,
        date: dateOnly(match.subEvent?.date ?? match.event?.date ?? null),
        status: match.status,
        isTitleMatch: match.is_title_match,
      };
      if (type === "bout_result") {
        data.outcome = outcomeFor(fighter.id, match.result?.winner_id ?? match.winner_id, match.result?.method ?? null);
        data.method = match.result?.method ?? null;
        data.round = match.result?.round || null;
      }
      return {
        id: randomUUID(),
        fan_id: f.fan_id,
        type,
        fighter_id: fighter.id,
        match_id: match.id,
        data: data as Prisma.InputJsonValue,
        created_at: at,
      };
    });

    // The unique (fan, type, match, fighter) index makes re-saves a no-op.
    const { count } = await prisma.fanNotification.createMany({ data: rows, skipDuplicates: true });
    log.info({ matchId, type, count }, "fan notifications created");
  } catch (err) {
    log.error({ err, matchId, type }, "failed to create fan notifications");
  }
}
