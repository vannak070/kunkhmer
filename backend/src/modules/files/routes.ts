/**
 * Stored pictures  →  /api/files/:name   (public)
 *
 * Names are content hashes (see lib/files.ts), so a file never changes and can be cached forever.
 */
import { createReadStream } from "node:fs";
import { stat } from "node:fs/promises";
import { join } from "node:path";
import type { FastifyInstance } from "fastify";
import { config } from "../../config.ts";
import { CONTENT_TYPES, FILE_NAME } from "../../lib/files.ts";
import { notFound } from "../../lib/http.ts";

export default async function fileRoutes(app: FastifyInstance) {
  app.get("/files/:name", async (request, reply) => {
    const { name } = request.params as { name: string };
    if (!FILE_NAME.test(name)) throw notFound("File");
    const path = join(config.uploadDir, name);
    const info = await stat(path).catch(() => null);
    if (!info?.isFile()) throw notFound("File");
    const ext = name.split(".").pop()!;
    reply
      .header("Content-Type", CONTENT_TYPES[ext])
      .header("Content-Length", info.size)
      .header("Cache-Control", "public, max-age=31536000, immutable")
      .header("X-Content-Type-Options", "nosniff");
    // SVG can carry scripts: never let it run anything when opened directly.
    if (ext === "svg") reply.header("Content-Security-Policy", "default-src 'none'; style-src 'unsafe-inline'; sandbox");
    return reply.send(createReadStream(path));
  });
}
