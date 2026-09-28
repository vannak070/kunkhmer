/**
 * Loads the starter knowledge-base articles from prisma/seed/knowledge-drafts.json as Drafts.
 * Only adds slugs that don't exist yet: never overwrites an article or publishes anything —
 * a Super Admin reviews and publishes them in the admin ("Knowledge base").
 *
 *   docker exec kunkhmer_backend npm run db:seed:knowledge
 */
import { randomUUID } from "node:crypto";
import { readFileSync } from "node:fs";
import { prisma } from "../db.ts";
import { now } from "../lib/dates.ts";

interface Draft {
  slug: string;
  category: string;
  sortOrder: number;
  titleEn: string;
  titleKm?: string;
  bodyEn: string;
  bodyKm?: string;
  source?: string;
}

const drafts: Draft[] = JSON.parse(readFileSync(new URL("../../prisma/seed/knowledge-drafts.json", import.meta.url), "utf8"));

let added = 0;
for (const d of drafts) {
  const exists = await prisma.knowledgeArticle.findUnique({ where: { slug: d.slug } });
  if (exists) {
    console.log(`= ${d.slug} (already there, left unchanged)`);
    continue;
  }
  const at = now();
  await prisma.knowledgeArticle.create({
    data: {
      id: randomUUID(),
      slug: d.slug,
      category: d.category,
      title_en: d.titleEn,
      title_km: d.titleKm ?? null,
      body_en: d.bodyEn,
      body_km: d.bodyKm ?? null,
      km_reviewed: false,
      status: "Draft",
      source: d.source ?? null,
      sort_order: d.sortOrder,
      created_by: "Starter draft",
      updated_by: "Starter draft",
      created_at: at,
      updated_at: at,
    },
  });
  added++;
  console.log(`+ ${d.slug}`);
}
console.log(`\n${added} draft(s) added, ${drafts.length - added} already present.`);
await prisma.$disconnect();
