/**
 * Championship titles  →  /api/champions/*
 *
 *   GET    /champions        public, with the current holder
 *   GET    /champions/:id    public, with the current holder and title history
 *   POST   /champions        Super Admin, KKF Officer
 *   PUT    /champions/:id    Super Admin, KKF Officer
 *   DELETE /champions/:id    Super Admin
 *
 * Title changes from match results happen in ../matches/results.ts.
 */
import { randomUUID } from "node:crypto";
import type { FastifyInstance } from "fastify";
import { prisma } from "../../db.ts";
import type { Champion, ChampionDefense, Fighter } from "../../generated/prisma/client.ts";
import { Role, STAFF, requireAuth, requireRole } from "../../lib/auth.ts";
import { micro, now, toDate } from "../../lib/dates.ts";
import { deleted, idParam, notFound, ok } from "../../lib/http.ts";
import { inputOf } from "../../lib/input.ts";
import { fighterArray, visibleFighter } from "../fighters/routes.ts";

export function championArray(c: Champion) {
  return {
    id: c.id,
    title_name: c.title_name,
    champion_type: c.champion_type,
    weight_class: Number(c.weight_class),
    organization: c.organization,
    batch_id: c.batch_id,
    event_name: c.event_name,
    current_holder_id: c.current_holder_id,
    current_holder_name: c.current_holder_name,
    nationality: c.nationality,
    date_created: micro(c.date_created),
    date_awarded: micro(c.date_awarded),
    winning_match_id: c.winning_match_id,
    status: c.status,
    defense_count: c.defense_count,
    last_defense_date: micro(c.last_defense_date),
    next_defense_deadline: micro(c.next_defense_deadline),
    belt_image_url: c.belt_image_url,
    trophy_image_url: c.trophy_image_url,
    certificate_url: c.certificate_url,
    notes: c.notes,
    approval_status: c.approval_status,
    created_at: micro(c.created_at),
    updated_at: micro(c.updated_at),
  };
}

export function defenseArray(d: ChampionDefense) {
  return {
    id: d.id,
    champion_id: d.champion_id,
    event_id: d.event_id,
    event_name: d.event_name,
    match_id: d.match_id,
    date: micro(d.date),
    opponent: d.opponent,
    opponent_id: d.opponent_id,
    result: d.result,
    method: d.method,
    round: d.round,
  };
}

/** Title with its holder (and the *_db convenience fields the frontends read). */
function formatChampion(c: Champion & { currentHolder: Fighter | null }) {
  const holder = visibleFighter(c.currentHolder);
  return {
    ...championArray(c),
    current_holder: holder ? fighterArray(holder) : null,
    current_holder_name_db: holder?.name ?? null,
    current_holder_photo_db: holder?.image ?? null,
    current_holder_nationality_db: holder?.nationality ?? null,
  };
}

async function loadChampion(id: string) {
  const champion = await prisma.champion.findUnique({
    where: { id },
    include: { currentHolder: true, defenses: { orderBy: { date: "asc" } } },
  });
  if (!champion) throw notFound("Champion");
  return { ...formatChampion(champion), defenses: champion.defenses.map(defenseArray) };
}

const FIELDS = {
  titleName: "title_name",
  championType: "champion_type",
  weightClass: "weight_class",
  organization: "organization",
  batchId: "batch_id",
  eventName: "event_name",
  currentHolderId: "current_holder_id",
  currentHolderName: "current_holder_name",
  nationality: "nationality",
  status: "status",
  beltImageUrl: "belt_image_url",
  trophyImageUrl: "trophy_image_url",
  certificateUrl: "certificate_url",
  notes: "notes",
  approvalStatus: "approval_status",
};

export default async function championRoutes(app: FastifyInstance) {
  app.get("/champions", async (_request, reply) => {
    const champions = await prisma.champion.findMany({
      include: { currentHolder: true },
      orderBy: { created_at: { sort: "desc", nulls: "last" } },
    });
    return ok(reply, champions.map(formatChampion));
  });

  app.get("/champions/:id", async (request, reply) => ok(reply, await loadChampion(idParam(request.params, "Champion"))));

  app.register(async (protectedRoutes) => {
    protectedRoutes.addHook("preHandler", requireAuth);

    protectedRoutes.post("/champions", async (request, reply) => {
      requireRole(request, STAFF);
      const input = inputOf(request.body);
      const at = now();
      const champion = await prisma.champion.create({
        data: {
          id: randomUUID(),
          title_name: input.required("titleName"),
          champion_type: input.required("championType"),
          weight_class: input.required("weightClass"),
          organization: input.get("organization", "KKF"),
          batch_id: input.get("batchId"),
          event_name: input.get("eventName"),
          current_holder_id: input.get("currentHolderId"),
          current_holder_name: input.get("currentHolderName"),
          nationality: input.get("nationality"),
          status: input.get("status", "Vacant"),
          defense_count: Number(input.get("defenseCount", 0)),
          last_defense_date: toDate(input.get("lastDefenseDate")),
          next_defense_deadline: toDate(input.get("nextDefenseDeadline")),
          belt_image_url: input.get("beltImageUrl"),
          trophy_image_url: input.get("trophyImageUrl"),
          certificate_url: input.get("certificateUrl"),
          notes: input.get("notes"),
          approval_status: input.get("approvalStatus", "approved"),
          created_at: at,
          updated_at: at,
        },
      });
      return ok(reply, await loadChampion(champion.id));
    });

    protectedRoutes.put("/champions/:id", async (request, reply) => {
      requireRole(request, STAFF);
      const id = idParam(request.params, "Champion");
      if (!(await prisma.champion.findUnique({ where: { id } }))) throw notFound("Champion");

      const input = inputOf(request.body);
      const data: Record<string, unknown> = input.pick(FIELDS);
      if (input.has("defenseCount")) data.defense_count = Number(input.get("defenseCount"));
      if (input.has("lastDefenseDate")) data.last_defense_date = toDate(input.get("lastDefenseDate"));
      if (input.has("nextDefenseDeadline")) data.next_defense_deadline = toDate(input.get("nextDefenseDeadline"));
      if (Object.keys(data).length > 0) data.updated_at = now();

      await prisma.champion.update({ where: { id }, data });
      return ok(reply, await loadChampion(id));
    });

    protectedRoutes.delete("/champions/:id", async (request, reply) => {
      requireRole(request, [Role.SuperAdmin]);
      const id = idParam(request.params, "Champion");
      const champion = await prisma.champion.findUnique({ where: { id } });
      if (!champion) throw notFound("Champion");
      await prisma.champion.delete({ where: { id } });
      return deleted(reply, "Champion deleted successfully", championArray(champion));
    });
  });
}
