/**
 * News articles  →  /api/news/*
 *
 *   GET    /news, /news/:id   public (Published only); KKF staff also see drafts; newest publish date first
 *   POST   /news              Super Admin, KKF Officer
 *   PUT    /news/:id          Super Admin, KKF Officer
 *   DELETE /news/:id          Super Admin, KKF Officer
 */
import { randomUUID } from "node:crypto";
import type { FastifyInstance, FastifyRequest } from "fastify";
import { prisma } from "../../db.ts";
import type { NewsArticle, Prisma } from "../../generated/prisma/client.ts";
import { STAFF, hasRole, requireAuth, requireRole } from "../../lib/auth.ts";
import { dateOnly, micro, now, toDate } from "../../lib/dates.ts";
import { deleted, idParam, notFound, ok } from "../../lib/http.ts";
import { inputOf, parseTags, parseBool } from "../../lib/input.ts";

export function newsArray(a: NewsArticle) {
  return {
    id: a.id,
    title: a.title,
    subtitle: a.subtitle,
    content: a.content,
    title_en: a.title_en,
    subtitle_en: a.subtitle_en,
    content_en: a.content_en,
    author: a.author,
    publish_date: dateOnly(a.publish_date),
    status: a.status,
    category: a.category,
    featured_image: a.featured_image,
    views: a.views,
    tags: a.tags,
    featured: a.featured,
    created_at: micro(a.created_at),
    updated_at: micro(a.updated_at),
  };
}

async function findArticle(id: string) {
  const article = await prisma.newsArticle.findUnique({ where: { id } });
  if (!article) throw notFound("Article");
  return article;
}

/** Visitors see published articles only; staff (who write news) see drafts too. */
const visibleTo = (request: FastifyRequest): Prisma.NewsArticleWhereInput =>
  hasRole(request.user, STAFF) ? {} : { status: "Published" };

export default async function newsRoutes(app: FastifyInstance) {
  app.get("/news", async (request, reply) => {
    const articles = await prisma.newsArticle.findMany({
      where: visibleTo(request),
      orderBy: [{ publish_date: { sort: "desc", nulls: "last" } }, { created_at: { sort: "desc", nulls: "last" } }],
    });
    return ok(reply, articles.map(newsArray));
  });

  app.get("/news/:id", async (request, reply) => {
    const article = await prisma.newsArticle.findFirst({ where: { id: idParam(request.params, "Article"), ...visibleTo(request) } });
    if (!article) throw notFound("Article");
    return ok(reply, newsArray(article));
  });

  app.register(async (protectedRoutes) => {
    protectedRoutes.addHook("preHandler", requireAuth);

    protectedRoutes.post("/news", async (request, reply) => {
      const user = requireRole(request, STAFF);
      const input = inputOf(request.body);
      const at = now();
      const article = await prisma.newsArticle.create({
        data: {
          id: randomUUID(),
          title: input.required("title"),
          subtitle: input.get("subtitle"),
          content: input.get("content"),
          title_en: input.get("titleEn"),
          subtitle_en: input.get("subtitleEn"),
          content_en: input.get("contentEn"),
          author: input.get("author", user.full_name),
          publish_date: toDate(input.get("publishDate", dateOnly(at))),
          status: input.get("status", "Draft"),
          category: input.get("category", "General"),
          featured_image: input.get("featuredImage"),
          tags: parseTags(input.get("tags")),
          featured: parseBool(input.get("featured", false)),
          views: 0,
          created_at: at,
          updated_at: at,
        },
      });
      return ok(reply, newsArray(article));
    });

    protectedRoutes.put("/news/:id", async (request, reply) => {
      requireRole(request, STAFF);
      const id = idParam(request.params, "Article");
      await findArticle(id);

      const input = inputOf(request.body);
      const data: Prisma.NewsArticleUncheckedUpdateInput = input.pick({
        title: "title",
        subtitle: "subtitle",
        content: "content",
        author: "author",
        status: "status",
        category: "category",
        featuredImage: "featured_image",
      });
      // The English version is optional: sending an empty value clears it.
      if (input.present("titleEn")) data.title_en = input.get("titleEn");
      if (input.present("subtitleEn")) data.subtitle_en = input.get("subtitleEn");
      if (input.present("contentEn")) data.content_en = input.get("contentEn");
      if (input.has("publishDate")) data.publish_date = toDate(input.get("publishDate"));
      if (input.has("featured")) data.featured = parseBool(input.get("featured"));
      if (input.has("tags")) data.tags = parseTags(input.get("tags"));
      if (Object.keys(data).length > 0) data.updated_at = now();

      return ok(reply, newsArray(await prisma.newsArticle.update({ where: { id }, data })));
    });

    protectedRoutes.delete("/news/:id", async (request, reply) => {
      requireRole(request, STAFF);
      const id = idParam(request.params, "Article");
      const article = await findArticle(id);
      await prisma.newsArticle.delete({ where: { id } });
      return deleted(reply, "Article deleted successfully", newsArray(article));
    });
  });
}
