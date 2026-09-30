/**
 * About the Federation page  →  /api/federation/*
 *
 *   GET  /federation            public — the published content, or null
 *   GET  /federation/draft      Super Admin, KKF Officer
 *   PUT  /federation/draft      Super Admin, KKF Officer — replaces the whole draft
 *   POST /federation/publish    Super Admin — published = draft
 *   POST /federation/discard    Super Admin, KKF Officer — draft = published
 *
 * One row (key "main"). Leader photos arrive as images through the global file hook; documents are
 * PDFs, stored here only. See claude/features/about-federation.md.
 */
import type { FastifyInstance } from "fastify";
import { prisma } from "../../db.ts";
import type { FederationPage, Prisma } from "../../generated/prisma/client.ts";
import { Role, STAFF, requireAuth, requireRole } from "../../lib/auth.ts";
import { iso, now } from "../../lib/dates.ts";
import { FILES_PATH, FILE_NAME, isPdfDataUri, storePdfDataUri } from "../../lib/files.ts";
import { HttpError, ok } from "../../lib/http.ts";

const KEY = "main";
const MAX_ITEMS = 30;
const TEXT = 300;

type Leader = { nameEn: string; nameKm: string | null; roleEn: string; roleKm: string | null; photoUrl: string | null };
type Document = { titleEn: string; titleKm: string | null; fileUrl: string };
export type FederationContent = {
  missionEn: string | null;
  missionKm: string | null;
  historyEn: string | null;
  historyKm: string | null;
  foundedYear: number | null;
  leaders: Leader[];
  addressEn: string | null;
  addressKm: string | null;
  phone: string | null;
  email: string | null;
  officeHoursEn: string | null;
  officeHoursKm: string | null;
  mapUrl: string | null;
  registerEn: string | null;
  registerKm: string | null;
  documents: Document[];
};

/** Longest allowed text per field (characters). */
const LIMITS: Partial<Record<keyof FederationContent, number>> = {
  missionEn: 600,
  missionKm: 600,
  historyEn: 8000,
  historyKm: 8000,
  registerEn: 4000,
  registerKm: 4000,
};
const TEXT_FIELDS = [
  "missionEn", "missionKm", "historyEn", "historyKm", "addressEn", "addressKm", "phone", "email",
  "officeHoursEn", "officeHoursKm", "mapUrl", "registerEn", "registerKm",
] as const;

const EMPTY: FederationContent = {
  missionEn: null, missionKm: null, historyEn: null, historyKm: null, foundedYear: null, leaders: [],
  addressEn: null, addressKm: null, phone: null, email: null, officeHoursEn: null, officeHoursKm: null,
  mapUrl: null, registerEn: null, registerKm: null, documents: [],
};

// ─── Validation ─────────────────────────────────────────────────────────────

/** Trimmed text or null ("" → null); 422 when it isn't text or is too long. */
function text(value: unknown, label: string, max = TEXT): string | null {
  if (value === undefined || value === null) return null;
  if (typeof value !== "string") throw new HttpError(422, `The ${label} must be text`);
  const v = value.trim();
  if (!v) return null;
  if (v.length > max) throw new HttpError(422, `The ${label} must be at most ${max} characters`);
  return v;
}

function requiredText(value: unknown, label: string): string {
  const v = text(value, label);
  if (!v) throw new HttpError(422, `The ${label} is required`);
  return v;
}

function list(value: unknown, label: string): Record<string, unknown>[] {
  if (value === undefined || value === null) return [];
  if (!Array.isArray(value)) throw new HttpError(422, `The ${label} must be a list`);
  if (value.length > MAX_ITEMS) throw new HttpError(422, `At most ${MAX_ITEMS} ${label}`);
  return value.map((item) => {
    if (!item || typeof item !== "object" || Array.isArray(item)) throw new HttpError(422, `Each of the ${label} must be an object`);
    return item as Record<string, unknown>;
  });
}

const isStoredFile = (url: string, ext?: string) =>
  url.startsWith(FILES_PATH) && FILE_NAME.test(url.slice(FILES_PATH.length)) && (!ext || url.endsWith(`.${ext}`));
const isHttps = (url: string) => /^https:\/\/[^\s]+$/i.test(url);

async function parseContent(body: unknown): Promise<FederationContent> {
  if (!body || typeof body !== "object" || Array.isArray(body)) throw new HttpError(422, "Send the page content as an object");
  const b = body as Record<string, unknown>;
  const content: FederationContent = { ...EMPTY };
  for (const field of TEXT_FIELDS) content[field] = text(b[field], field, LIMITS[field] ?? TEXT);

  if (b.foundedYear !== undefined && b.foundedYear !== null && b.foundedYear !== "") {
    const year = Number(b.foundedYear);
    if (!Number.isInteger(year) || year < 1900 || year > new Date().getUTCFullYear()) {
      throw new HttpError(422, "The foundedYear must be a year between 1900 and this year");
    }
    content.foundedYear = year;
  }
  if (content.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(content.email)) throw new HttpError(422, "The email must be a valid email address");
  if (content.mapUrl && !isHttps(content.mapUrl)) throw new HttpError(422, "The mapUrl must start with https://");

  content.leaders = list(b.leaders, "leaders").map((l) => {
    const photoUrl = text(l.photoUrl, "leader photo", 500);
    if (photoUrl && !isStoredFile(photoUrl) && !isHttps(photoUrl)) throw new HttpError(422, "A leader photo must be an uploaded picture");
    return {
      nameEn: requiredText(l.nameEn, "leader name (English)"),
      nameKm: text(l.nameKm, "leader name (Khmer)"),
      roleEn: requiredText(l.roleEn, "leader role (English)"),
      roleKm: text(l.roleKm, "leader role (Khmer)"),
      photoUrl,
    };
  });

  content.documents = [];
  for (const d of list(b.documents, "documents")) {
    const titleEn = requiredText(d.titleEn, "document title (English)");
    const titleKm = text(d.titleKm, "document title (Khmer)");
    // A new PDF arrives as a data URI; a kept one as its stored link.
    const raw = d.fileUrl;
    let fileUrl: string;
    if (isPdfDataUri(raw)) fileUrl = await storePdfDataUri(raw);
    else if (typeof raw === "string" && isStoredFile(raw.trim(), "pdf")) fileUrl = raw.trim();
    else throw new HttpError(422, "Each document needs a PDF file");
    content.documents.push({ titleEn, titleKm, fileUrl });
  }
  return content;
}

// ─── Storage and output ─────────────────────────────────────────────────────

/** Stored JSON back to content (older rows may miss newer fields). */
const contentOf = (value: Prisma.JsonValue | null | undefined): FederationContent => ({
  ...EMPTY,
  ...((value && typeof value === "object" && !Array.isArray(value) ? value : {}) as Partial<FederationContent>),
});

const isEmpty = (c: FederationContent) =>
  c.leaders.length === 0 && c.documents.length === 0 && c.foundedYear === null && TEXT_FIELDS.every((f) => !c[f]);

async function loadPage(): Promise<FederationPage> {
  const page = await prisma.federationPage.findUnique({ where: { key: KEY } });
  if (page) return page;
  const at = now();
  return prisma.federationPage.upsert({
    where: { key: KEY },
    create: { key: KEY, draft: EMPTY as Prisma.InputJsonValue, created_at: at, updated_at: at },
    update: {},
  });
}

function staffView(page: FederationPage) {
  const draft = contentOf(page.draft);
  const published = page.published === null ? null : contentOf(page.published);
  return {
    draft,
    published,
    // Unpublished changes: the draft differs from what fans see.
    changed: JSON.stringify(draft) !== JSON.stringify(published ?? EMPTY),
    draftUpdatedAt: iso(page.draft_updated_at),
    draftUpdatedBy: page.draft_updated_by,
    publishedAt: iso(page.published_at),
    publishedBy: page.published_by,
  };
}

/** Published content for the fan site, or null when there's nothing to show. */
export async function publishedFederation(): Promise<(FederationContent & { publishedAt: string | null }) | null> {
  const page = await prisma.federationPage.findUnique({ where: { key: KEY } });
  if (!page || page.published === null) return null;
  const content = contentOf(page.published);
  return isEmpty(content) ? null : { ...content, publishedAt: iso(page.published_at) };
}

export default async function federationRoutes(app: FastifyInstance) {
  app.get("/federation", async (_request, reply) => ok(reply, await publishedFederation()));

  app.register(async (protectedRoutes) => {
    protectedRoutes.addHook("preHandler", requireAuth);

    protectedRoutes.get("/federation/draft", async (request, reply) => {
      requireRole(request, STAFF);
      return ok(reply, staffView(await loadPage()));
    });

    protectedRoutes.put("/federation/draft", async (request, reply) => {
      const user = requireRole(request, STAFF);
      const content = await parseContent(request.body);
      await loadPage();
      const at = now();
      const page = await prisma.federationPage.update({
        where: { key: KEY },
        data: { draft: content as Prisma.InputJsonValue, draft_updated_at: at, draft_updated_by: user.full_name, updated_at: at },
      });
      return ok(reply, staffView(page));
    });

    protectedRoutes.post("/federation/publish", async (request, reply) => {
      const user = requireRole(request, [Role.SuperAdmin]);
      const current = await loadPage();
      const at = now();
      const page = await prisma.federationPage.update({
        where: { key: KEY },
        data: { published: contentOf(current.draft) as Prisma.InputJsonValue, published_at: at, published_by: user.full_name, updated_at: at },
      });
      return ok(reply, staffView(page));
    });

    protectedRoutes.post("/federation/discard", async (request, reply) => {
      const user = requireRole(request, STAFF);
      const current = await loadPage();
      const at = now();
      const page = await prisma.federationPage.update({
        where: { key: KEY },
        data: {
          draft: (current.published === null ? EMPTY : contentOf(current.published)) as Prisma.InputJsonValue,
          draft_updated_at: at,
          draft_updated_by: user.full_name,
          updated_at: at,
        },
      });
      return ok(reply, staffView(page));
    });
  });
}
