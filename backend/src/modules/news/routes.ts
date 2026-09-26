/**
 * News articles  →  /api/news/*
 *
 *   GET    /news, /news/:id   public; newest publish date first
 *   POST   /news              Super Admin, KKF Officer
 *   PUT    /news/:id          Super Admin, KKF Officer
 *   DELETE /news/:id          Super Admin, KKF Officer
 */
import { randomUUID } from "node:crypto";
import type { FastifyInstance } from "fastify";
import { prisma } from "../../db.ts";
import type { NewsArticle, Prisma } from "../../generated/prisma/client.ts";
import { STAFF, requireAuth, requireRole } from "../../lib/auth.ts";
import { dateOnly, micro, now, toDate } from "../../lib/dates.ts";
import { deleted, idParam, notFound, ok } from "../../lib/http.ts";
import { inputOf, parseTags, parseBool } from "../../lib/input.ts";

export function newsArray(a: NewsArticle) {
  return {
    id: a.id,
    title: a.title,
    subtitle: a.subtitle,
    content: a.content,
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

export default async function newsRoutes(app: FastifyInstance) {
  app.get("/news", async (_request, reply) => {
    const articles = await prisma.newsArticle.findMany({
      orderBy: [{ publish_date: { sort: "desc", nulls: "last" } }, { created_at: { sort: "desc", nulls: "last" } }],
    });
    return ok(reply, articles.map(newsArray));
  });

  app.get("/news/:id", async (request, reply) => ok(reply, newsArray(await findArticle(idParam(request.params, "Article")))));

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
