/**
 * Videos  →  /api/videos/*
 *
 *   GET    /videos, /videos/:id   public (Published only; KKF staff also see drafts), with related fighter, club and match
 *   POST   /videos                Super Admin, KKF Officer
 *   PUT    /videos/:id            Super Admin, KKF Officer
 *   DELETE /videos/:id            Super Admin, KKF Officer (soft delete)
 *
 * Sending fighterId, clubId or matchId as "" or null removes that link.
 */
import { randomUUID } from "node:crypto";
import type { FastifyInstance, FastifyRequest } from "fastify";
import { prisma } from "../../db.ts";
import type { Prisma, Video } from "../../generated/prisma/client.ts";
import { STAFF, hasRole, requireAuth, requireRole } from "../../lib/auth.ts";
import { micro, now } from "../../lib/dates.ts";
import { deleted, idParam, notFound, ok } from "../../lib/http.ts";
import { inputOf, parseTags } from "../../lib/input.ts";
import { clubArray } from "../clubs/routes.ts";
import { fighterArray, visibleFighter } from "../fighters/routes.ts";
import { matchArray, withoutWeighIn } from "../matches/format.ts";

const NOT_DELETED = { deleted_at: null } satisfies Prisma.VideoWhereInput;
const relations = { fighter: true, club: true, match: true } as const satisfies Prisma.VideoInclude;
type VideoWithRelations = Prisma.VideoGetPayload<{ include: typeof relations }>;

export function videoArray(v: Video) {
  return {
    id: v.id,
    title: v.title,
    description: v.description,
    youtube_url: v.youtube_url,
    duration: v.duration,
    category: v.category,
    status: v.status,
    tags: v.tags,
    fighter_id: v.fighter_id,
    club_id: v.club_id,
    match_id: v.match_id,
    thumbnail: v.thumbnail,
    views: v.views,
    created_at: micro(v.created_at),
    updated_at: micro(v.updated_at),
    deleted_at: micro(v.deleted_at),
  };
}

function formatVideo(v: VideoWithRelations) {
  const fighter = visibleFighter(v.fighter);
  return {
    ...videoArray(v),
    fighter: fighter ? fighterArray(fighter) : null,
    club: v.club ? clubArray(v.club) : null,
    // A video's bout never needs the weigh-in.
    match: v.match ? withoutWeighIn(matchArray(v.match)) : null,
  };
}

/** The create response has no deleted_at (its format predates soft deletes being returned). */
function formatCreatedVideo(v: VideoWithRelations) {
  const { deleted_at: _, ...rest } = formatVideo(v);
  return rest;
}

async function findVideo(id: string) {
  const video = await prisma.video.findFirst({ where: { id, ...NOT_DELETED }, include: relations });
  if (!video) throw notFound("Video");
  return video;
}

/** Visitors see published videos only; staff (who manage videos) see drafts too. */
const visibleTo = (request: FastifyRequest): Prisma.VideoWhereInput =>
  hasRole(request.user, STAFF) ? NOT_DELETED : { ...NOT_DELETED, status: "Published" };

export default async function videoRoutes(app: FastifyInstance) {
  app.get("/videos", async (request, reply) => {
    const videos = await prisma.video.findMany({
      where: visibleTo(request),
      include: relations,
      orderBy: { created_at: { sort: "desc", nulls: "last" } },
    });
    return ok(reply, videos.map(formatVideo));
  });

  app.get("/videos/:id", async (request, reply) => {
    const video = await prisma.video.findFirst({ where: { id: idParam(request.params, "Video"), ...visibleTo(request) }, include: relations });
    if (!video) throw notFound("Video");
    return ok(reply, formatVideo(video));
  });

  app.register(async (protectedRoutes) => {
    protectedRoutes.addHook("preHandler", requireAuth);

    protectedRoutes.post("/videos", async (request, reply) => {
      requireRole(request, STAFF);
      const input = inputOf(request.body);
      const at = now();
      const video = await prisma.video.create({
        data: {
          id: randomUUID(),
          title: input.required("title"),
          description: input.get("description"),
          youtube_url: input.get("youtubeUrl"),
          duration: input.get("duration"),
          category: input.get("category", "General"),
          status: input.get("status", "Draft"),
          tags: parseTags(input.get("tags")),
          fighter_id: input.get("fighterId"),
          club_id: input.get("clubId"),
          match_id: input.get("matchId"),
          thumbnail: input.get("thumbnail"),
          views: 0,
          created_at: at,
          updated_at: at,
        },
        include: relations,
      });
      return ok(reply, formatCreatedVideo(video));
    });

    protectedRoutes.put("/videos/:id", async (request, reply) => {
      requireRole(request, STAFF);
      const id = idParam(request.params, "Video");
      await findVideo(id);

      const input = inputOf(request.body);
      const data: Prisma.VideoUncheckedUpdateInput = input.pick({
        title: "title",
        description: "description",
        youtubeUrl: "youtube_url",
        duration: "duration",
        category: "category",
        status: "status",
        thumbnail: "thumbnail",
      });
      // A present-but-empty link ("" or null) clears it.
      for (const [key, column] of [["fighterId", "fighter_id"], ["clubId", "club_id"], ["matchId", "match_id"]] as const) {
        if (input.present(key)) data[column] = input.get(key);
      }
      if (input.has("tags")) data.tags = parseTags(input.get("tags"));
      if (Object.keys(data).length > 0) data.updated_at = now();

      return ok(reply, formatVideo(await prisma.video.update({ where: { id }, data, include: relations })));
    });

    protectedRoutes.delete("/videos/:id", async (request, reply) => {
      requireRole(request, STAFF);
      const id = idParam(request.params, "Video");
      await findVideo(id);
      const at = now();
      const video = await prisma.video.update({ where: { id }, data: { deleted_at: at, updated_at: at } });
      return deleted(reply, "Video deleted successfully", videoArray(video));
    });
  });
}
