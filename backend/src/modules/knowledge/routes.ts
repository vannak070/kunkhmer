/**
 * Knowledge base for KUNKHMER HUB  →  /api/knowledge/*   (KKF staff only)
 *
 *   GET    /knowledge?status=&category=   Super Admin, KKF Officer
 *   GET    /knowledge/:id                 Super Admin, KKF Officer
 *   POST   /knowledge                     Super Admin, KKF Officer — always a Draft
 *   PUT    /knowledge/:id                 Super Admin, KKF Officer (published articles: Super Admin)
 *   POST   /knowledge/:id/publish         Super Admin
 *   POST   /knowledge/:id/unpublish       Super Admin
 *   DELETE /knowledge/:id                 Super Admin, KKF Officer (published articles: Super Admin)
 *
 * See claude/features/knowledge-base.md.
 */
import { randomUUID } from "node:crypto";
import type { FastifyInstance } from "fastify";
import { prisma } from "../../db.ts";
import type { KnowledgeArticle, Prisma } from "../../generated/prisma/client.ts";
import { Role, STAFF, requireAuth, requireRole } from "../../lib/auth.ts";
import { iso, now } from "../../lib/dates.ts";
import { HttpError, deleted, forbidden, idParam, notFound, ok } from "../../lib/http.ts";
import { inputOf, parseBool } from "../../lib/input.ts";
import { CATEGORIES, invalidateKnowledge } from "./hub.ts";

const SUPER = [Role.SuperAdmin];
const STATUSES = ["Draft", "Published"];

export function knowledgeArray(a: KnowledgeArticle) {
  return {
    id: a.id,
    slug: a.slug,
    category: a.category,
    titleEn: a.title_en,
    titleKm: a.title_km,
    bodyEn: a.body_en,
    bodyKm: a.body_km,
    kmReviewed: a.km_reviewed,
    status: a.status,
    source: a.source,
    sortOrder: a.sort_order,
    createdBy: a.created_by,
    updatedBy: a.updated_by,
    publishedBy: a.published_by,
    publishedAt: iso(a.published_at),
    createdAt: iso(a.created_at),
    updatedAt: iso(a.updated_at),
  };
}

const slugify = (s: string) =>
  s
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^\w\s-]/g, "")
    .trim()
    .replace(/[\s_-]+/g, "-")
    .slice(0, 100);

function category(value: unknown): string {
  if (typeof value !== "string" || !(CATEGORIES as readonly string[]).includes(value)) {
    throw new HttpError(422, `The category must be one of: ${CATEGORIES.join(", ")}`);
  }
  return value;
}

function slugOf(value: unknown): string {
  const slug = slugify(String(value ?? ""));
  if (!slug) throw new HttpError(422, "The slug must contain letters or numbers");
  return slug;
}

function sortOrder(value: unknown): number {
  const n = Number(value);
  if (!Number.isInteger(n)) throw new HttpError(422, "The sortOrder must be a whole number");
  return n;
}

async function findArticle(id: string) {
  const article = await prisma.knowledgeArticle.findUnique({ where: { id } });
  if (!article) throw notFound("Article");
  return article;
}

export default async function knowledgeRoutes(app: FastifyInstance) {
  app.register(async (protectedRoutes) => {
    protectedRoutes.addHook("preHandler", requireAuth);

    protectedRoutes.get("/knowledge", async (request, reply) => {
      requireRole(request, STAFF);
      const q = request.query as Record<string, string | undefined>;
      const where: Prisma.KnowledgeArticleWhereInput = {};
      if (q.status && STATUSES.includes(q.status)) where.status = q.status;
      if (q.category && (CATEGORIES as readonly string[]).includes(q.category)) where.category = q.category;
      const rows = await prisma.knowledgeArticle.findMany({ where, orderBy: [{ sort_order: "asc" }, { title_en: "asc" }] });
      rows.sort((a, b) => CATEGORIES.indexOf(a.category as never) - CATEGORIES.indexOf(b.category as never));
      return ok(reply, rows.map(knowledgeArray));
    });

    protectedRoutes.get("/knowledge/:id", async (request, reply) => {
      requireRole(request, STAFF);
      return ok(reply, knowledgeArray(await findArticle(idParam(request.params, "Article"))));
    });

    protectedRoutes.post("/knowledge", async (request, reply) => {
      const user = requireRole(request, STAFF);
      const input = inputOf(request.body);
      const titleEn = input.required<string>("titleEn");
      const bodyEn = input.required<string>("bodyEn");
      const at = now();
      const article = await prisma.knowledgeArticle.create({
        data: {
          id: randomUUID(),
          slug: slugOf(input.get("slug", titleEn)),
          category: category(input.required("category")),
          title_en: titleEn,
          title_km: input.get("titleKm"),
          body_en: bodyEn,
          body_km: input.get("bodyKm"),
          km_reviewed: false,
          status: "Draft",
          source: input.get("source"),
          sort_order: input.has("sortOrder") ? sortOrder(input.get("sortOrder")) : 0,
          created_by: user.full_name,
          updated_by: user.full_name,
          created_at: at,
          updated_at: at,
        },
      });
      return ok(reply, knowledgeArray(article), 201);
    });

    protectedRoutes.put("/knowledge/:id", async (request, reply) => {
      const user = requireRole(request, STAFF);
      const isSuper = user.role === Role.SuperAdmin;
      const id = idParam(request.params, "Article");
      const article = await findArticle(id);
      // Published text feeds the Hub, so only the Super Admin (who approves it) may change it.
      if (article.status === "Published" && !isSuper) throw forbidden();

      const input = inputOf(request.body);
      const data: Prisma.KnowledgeArticleUpdateInput = {};
      if (input.has("titleEn")) data.title_en = input.required<string>("titleEn");
      if (input.has("bodyEn")) data.body_en = input.required<string>("bodyEn");
      if (input.present("titleEn") && !input.has("titleEn")) throw new HttpError(422, "The titleEn field is required");
      if (input.present("bodyEn") && !input.has("bodyEn")) throw new HttpError(422, "The bodyEn field is required");
      if (input.has("category")) data.category = category(input.get("category"));
      if (input.has("slug")) data.slug = slugOf(input.get("slug"));
      if (input.present("sortOrder")) data.sort_order = input.has("sortOrder") ? sortOrder(input.get("sortOrder")) : 0;
      if (input.present("source")) data.source = input.get("source");

      const kmChanged =
        (input.present("titleKm") && input.get("titleKm") !== article.title_km) ||
        (input.present("bodyKm") && input.get("bodyKm") !== article.body_km);
      if (input.present("titleKm")) data.title_km = input.get("titleKm");
      if (input.present("bodyKm")) data.body_km = input.get("bodyKm");
      if (input.present("kmReviewed")) {
        if (!isSuper) throw forbidden();
        data.km_reviewed = parseBool(input.get("kmReviewed"));
      } else if (kmChanged) {
        // New Khmer wording needs a fresh review.
        data.km_reviewed = false;
      }

      if (Object.keys(data).length > 0) {
        data.updated_at = now();
        data.updated_by = user.full_name;
      }
      const updated = await prisma.knowledgeArticle.update({ where: { id }, data });
      if (article.status === "Published") invalidateKnowledge();
      return ok(reply, knowledgeArray(updated));
    });

    protectedRoutes.post("/knowledge/:id/publish", async (request, reply) => {
      const user = requireRole(request, SUPER);
      const id = idParam(request.params, "Article");
      await findArticle(id);
      const at = now();
      const updated = await prisma.knowledgeArticle.update({
        where: { id },
        data: { status: "Published", published_at: at, published_by: user.full_name, updated_at: at, updated_by: user.full_name },
      });
      invalidateKnowledge();
      return ok(reply, knowledgeArray(updated));
    });

    protectedRoutes.post("/knowledge/:id/unpublish", async (request, reply) => {
      const user = requireRole(request, SUPER);
      const id = idParam(request.params, "Article");
      await findArticle(id);
      const updated = await prisma.knowledgeArticle.update({
        where: { id },
        data: { status: "Draft", updated_at: now(), updated_by: user.full_name },
      });
      invalidateKnowledge();
      return ok(reply, knowledgeArray(updated));
    });

    protectedRoutes.delete("/knowledge/:id", async (request, reply) => {
      const user = requireRole(request, STAFF);
      const id = idParam(request.params, "Article");
      const article = await findArticle(id);
      if (article.status === "Published" && user.role !== Role.SuperAdmin) throw forbidden();
      await prisma.knowledgeArticle.delete({ where: { id } });
      if (article.status === "Published") invalidateKnowledge();
      return deleted(reply, "Article deleted successfully", knowledgeArray(article));
    });
  });
}
