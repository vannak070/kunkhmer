import Fastify, { type FastifyInstance } from "fastify";
import { config } from "./config.ts";
import { Prisma } from "./generated/prisma/client.ts";
import { resolveUser } from "./lib/auth.ts";
import { BadInput } from "./lib/dates.ts";
import { HttpError } from "./lib/http.ts";
import { normalizeBody } from "./lib/input.ts";
import { replaceInlineImages } from "./lib/files.ts";
import aiRoutes from "./modules/ai/routes.ts";
import authRoutes from "./modules/auth/routes.ts";
import championRoutes from "./modules/champions/routes.ts";
import clubRoutes from "./modules/clubs/routes.ts";
import eventRoutes from "./modules/events/routes.ts";
import fanRoutes from "./modules/fans/routes.ts";
import fighterRoutes from "./modules/fighters/routes.ts";
import fileRoutes from "./modules/files/routes.ts";
import matchRoutes from "./modules/matches/routes.ts";
import newsRoutes from "./modules/news/routes.ts";
import knowledgeRoutes from "./modules/knowledge/routes.ts";
import federationRoutes from "./modules/federation/routes.ts";
import officialRoutes from "./modules/officials/routes.ts";
import settingsRoutes from "./modules/settings/routes.ts";
import seoRoutes from "./modules/seo/routes.ts";
import settingsListRoutes from "./modules/settings/lists.ts";
import videoRoutes from "./modules/videos/routes.ts";

export async function buildApp(opts: { logger?: boolean } = {}): Promise<FastifyInstance> {
  const app = Fastify({
    logger: opts.logger === false ? false : { level: config.logLevel },
    // JSON bodies can be large: the admin UI sends pictures inline as base64 (stored as files, lib/files.ts).
    bodyLimit: 20 * 1024 * 1024,
    // Real client IP behind our own proxies, so per-IP rate limits don't share one bucket.
    trustProxy: config.trustProxy,
  });

  // Accept empty JSON bodies (the admin UI POSTs with no body, e.g. verify).
  app.removeContentTypeParser("application/json");
  app.addContentTypeParser("application/json", { parseAs: "string" }, (_req, body, done) => {
    const text = (body as string).trim();
    if (!text) return done(null, {});
    try {
      done(null, JSON.parse(text));
    } catch {
      done(new HttpError(400, "Invalid JSON body"), undefined);
    }
  });

  app.addHook("onRequest", resolveUser);
  app.addHook("preHandler", async (request) => {
    request.body = normalizeBody(request.body ?? {});
    // Pictures arrive as base64 data URIs; keep them as files, not as text in the database.
    if (request.method === "POST" || request.method === "PUT" || request.method === "PATCH") {
      request.body = await replaceInlineImages(request.body);
    }
  });

  app.setErrorHandler((error: any, request, reply) => {
    if (error instanceof HttpError) {
      return reply.code(error.status).send({ success: false, error: error.message });
    }
    if (error instanceof BadInput) {
      return reply.code(422).send({ success: false, error: error.message });
    }
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === "P2002") {
        const fields = (error.meta?.target as string[] | undefined)?.join(", ") ?? "value";
        return reply.code(422).send({ success: false, error: `The ${fields} has already been taken` });
      }
      if (error.code === "P2003") {
        return reply.code(422).send({ success: false, error: "A referenced record does not exist" });
      }
    }
    if (error instanceof Prisma.PrismaClientValidationError) {
      request.log.warn({ err: error }, "invalid input for database");
      return reply.code(422).send({ success: false, error: "Invalid or missing fields" });
    }
    if (error.statusCode && error.statusCode < 500) {
      return reply.code(error.statusCode).send({ success: false, error: error.message });
    }
    request.log.error({ err: error }, "unhandled error");
    return reply.code(500).send({ message: "Server Error" });
  });

  app.setNotFoundHandler((request, reply) => {
    reply.code(404).send({ message: `The route ${request.url.split("?")[0].replace(/^\//, "")} could not be found.` });
  });

  app.get("/up", async () => ({ status: "up" }));

  await app.register(
    async (api) => {
      await api.register(aiRoutes);
      await api.register(authRoutes);
      await api.register(clubRoutes);
      await api.register(fighterRoutes);
      await api.register(fileRoutes);
      await api.register(seoRoutes);
      await api.register(settingsRoutes);
      await api.register(settingsListRoutes);
      await api.register(eventRoutes);
      await api.register(matchRoutes);
      await api.register(officialRoutes);
      await api.register(championRoutes);
      await api.register(newsRoutes);
      await api.register(knowledgeRoutes);
      await api.register(federationRoutes);
      await api.register(videoRoutes);
      await api.register(fanRoutes);
    },
    { prefix: "/api" },
  );

  return app;
}
