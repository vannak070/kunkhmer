/**
 * Offline agreements log + fight night licence (Program workflow phase 4; the licence is optional and no longer
 * asked for in the admin since 2026-10-13, claude/updates/program-guided-fight-night.md; claude/updates/offline-agreements-log.md)
 *
 *   GET  /events/:id/agreements                       STAFF or an Organizer who can see the event: licence, item states, log
 *   POST /events/:id/agreements                       { item: details|sponsors, note? } — Organizer → waiting, STAFF → confirmed at once
 *   POST /events/:id/agreements/:agreementId/confirm  STAFF: the newest waiting row, while the values still match
 *   POST /events/:id/agreements/:agreementId/return   STAFF: { comment } — sent back to the Organizer
 *   PUT  /events/:id/licence                          { number?, date?, document? } — STAFF or the Organizer before publishing
 *   PUT  /events/:id/titles                           { titleIds } — the belts on the line (phase 5, claude/updates/fight-night-titles.md)
 *   GET  /events/:id/licence/document                 the stored scan (same people)
 *   GET  /agreements/waiting                          STAFF: rows waiting for KKF, all fight nights
 *
 * The licence is private: never part of an event response, the fan site, search or the Hub. Its scan sits in the
 * private upload folder; the global "pictures become files" hook skips /events/:id/licence (app.ts).
 * An item counts as confirmed only while its values still match the snapshot taken when it was recorded, so a
 * change after confirmation needs a new record + confirmation. Publishing needs confirmed details, and confirmed
 * titles when the fight night has any (`publishBlocker`, used by events/routes.ts).
 */
import { createReadStream } from "node:fs";
import { stat } from "node:fs/promises";
import { join } from "node:path";
import { randomUUID } from "node:crypto";
import type { FastifyInstance, FastifyRequest } from "fastify";
import { prisma } from "../../db.ts";
import type { Prisma, User } from "../../generated/prisma/client.ts";
import { Role, STAFF, hasRole, requireAuth, requireRole } from "../../lib/auth.ts";
import { dateOnly, micro, now, toDate } from "../../lib/dates.ts";
import { CONTENT_TYPES, FILE_NAME, isPrivateDataUri, privateDir, storePrivateDocument } from "../../lib/files.ts";
import { HttpError, idParam, isUuid, notFound, ok } from "../../lib/http.ts";
import { inputOf } from "../../lib/input.ts";
import type { RuleHit } from "../matches/rules.ts";
import { canSeeEvent } from "./routes.ts";

export const ITEMS = ["details", "sponsors", "titles"] as const;
export type Item = (typeof ITEMS)[number];

/** Statuses after which an Organizer can no longer change a fight night ("ask KKF"). */
export const LOCKED_FOR_ORGANIZER = ["Published", "Completed", "Cancelled"];

const forSnapshot = { sponsorLinks: true, titleLinks: true } as const satisfies Prisma.EventInclude;
type EventForSnapshot = Prisma.EventGetPayload<{ include: typeof forSnapshot }>;
type AgreementRow = Prisma.EventAgreementGetPayload<{ include: { recorder: true; confirmer: true } }>;

/** The values an agreement on this item covers, as stored in `snapshot`. */
export function snapshotOf(item: Item, e: EventForSnapshot): Record<string, unknown> {
  if (item === "details") {
    return {
      name: e.name,
      date: dateOnly(e.date),
      end_date: dateOnly(e.end_date),
      location: e.location,
      broadcast_station_id: e.broadcast_station_id,
      licence_number: e.licence_number,
      licence_date: dateOnly(e.licence_date),
      licence_document: e.licence_document,
    };
  }
  if (item === "titles") return { champion_ids: e.titleLinks.map((l) => l.champion_id).sort() };
  return { main_sponsor_id: e.main_sponsor_id, sponsor_ids: e.sponsorLinks.map((l) => l.sponsor_id).sort() };
}

/** Key-order independent comparison (jsonb does not keep key order). */
const stable = (v: unknown): string =>
  Array.isArray(v) ? `[${v.map(stable).join(",")}]`
    : v && typeof v === "object" ? `{${Object.keys(v).sort().map((k) => `${JSON.stringify(k)}:${stable((v as Record<string, unknown>)[k])}`).join(",")}}`
    : JSON.stringify(v ?? null);
const sameValues = (a: unknown, b: unknown) => stable(a) === stable(b);

/** The snapshot as shown: the licence scan only as yes/no, never its private file name. */
function shownSnapshot(snapshot: Prisma.JsonValue) {
  if (!snapshot || typeof snapshot !== "object" || Array.isArray(snapshot) || !("licence_document" in snapshot)) return snapshot;
  return { ...snapshot, licence_document: Boolean(snapshot.licence_document) };
}

function agreementArray(a: AgreementRow, current?: Record<string, unknown>) {
  return {
    id: a.id,
    event_id: a.event_id,
    item: a.item,
    status: a.status,
    note: a.note,
    snapshot: shownSnapshot(a.snapshot),
    // Whether the fight night still has the values that were recorded.
    matches_current: current ? sameValues(a.snapshot, current) : null,
    recorded_by: a.recorded_by,
    recorded_by_name: a.recorder?.full_name ?? null,
    recorded_at: micro(a.recorded_at),
    confirmed_by: a.confirmed_by,
    confirmed_by_name: a.confirmer?.full_name ?? null,
    confirmed_at: micro(a.confirmed_at),
    kkf_comment: a.kkf_comment,
  };
}

/** none | waiting | returned | confirmed | changed (confirmed, but the values changed since). */
export function itemState(newest: { status: string; snapshot: unknown } | undefined, current: Record<string, unknown>) {
  if (!newest) return "none";
  if (newest.status !== "confirmed") return newest.status;
  return sameValues(newest.snapshot, current) ? "confirmed" : "changed";
}

const newestFirst = [{ seq: "desc" }] satisfies Prisma.EventAgreementOrderByWithRelationInput[];

async function stateOf(event: EventForSnapshot, item: Item) {
  const newest = await prisma.eventAgreement.findFirst({ where: { event_id: event.id, item }, orderBy: newestFirst });
  return itemState(newest ?? undefined, snapshotOf(item, event));
}

/**
 * The publish gate: why this fight night can't be published yet, or null. Details must be
 * confirmed; titles too when any are selected.
 */
export async function publishBlocker(eventId: string): Promise<string | null> {
  const event = await prisma.event.findUnique({ where: { id: eventId }, include: forSnapshot });
  if (!event) return null;
  if ((await stateOf(event, "details")) !== "confirmed") return "KKF must confirm the fight night details before publishing";
  if (event.titleLinks.length && (await stateOf(event, "titles")) !== "confirmed") return "KKF must confirm the titles on this fight night before publishing";
  return null;
}

/**
 * Title bouts (owner choice: warn, don't block): a warning when the belt isn't on the fight night's title list or
 * the list isn't confirmed yet. Null when fine or not a title bout.
 */
export async function titleListWarning(eventId: string | null | undefined, championshipId: string | null | undefined): Promise<RuleHit | null> {
  if (!eventId || !championshipId) return null;
  const event = await prisma.event.findUnique({ where: { id: eventId }, include: forSnapshot });
  if (!event) return null;
  const label = "Title on the fight night's list";
  if (!event.titleLinks.some((l) => l.champion_id === championshipId)) {
    return { key: "title_list", label, action: "warn", message: "This title is not on the fight night's title list", fighter_id: null, params: { reason: "not_listed" } };
  }
  if ((await stateOf(event, "titles")) !== "confirmed") {
    return { key: "title_list", label, action: "warn", message: "KKF has not confirmed the titles on this fight night yet", fighter_id: null, params: { reason: "unconfirmed" } };
  }
  return null;
}

/** Loads the event for a KKF staff member or an Organizer who can see it; `write` = the Organizer is changing it. */
async function eventFor(request: FastifyRequest, write = false): Promise<{ user: User; event: EventForSnapshot }> {
  const user = requireRole(request, [...STAFF, Role.Organizer]);
  const event = await prisma.event.findUnique({ where: { id: idParam(request.params, "Event") }, include: forSnapshot });
  if (!event || !canSeeEvent(user, event)) throw notFound("Event");
  if (write && !hasRole(user, STAFF) && LOCKED_FOR_ORGANIZER.includes(event.status)) {
    throw new HttpError(422, "This fight night is published — ask KKF to change it");
  }
  return { user, event };
}

const withPeople = { recorder: true, confirmer: true } as const;

/** A belt as listed on a fight night. */
const titleRow = (c: { id: string; title_name: string; weight_class: Prisma.Decimal; status: string; current_holder_name: string | null }) => ({
  id: c.id,
  title_name: c.title_name,
  weight_class: Number(c.weight_class),
  status: c.status,
  current_holder_name: c.current_holder_name,
});

/** Rows waiting for KKF, all fight nights (the staff to-do list and the overview). */
export async function waitingAgreements() {
  const rows = await prisma.eventAgreement.findMany({
    where: { status: "waiting" },
    include: { ...withPeople, event: { include: forSnapshot } },
    orderBy: [{ seq: "asc" }],
  });
  // Only the newest row of each item counts (an older waiting one was replaced by a newer record).
  const newest = await prisma.eventAgreement.groupBy({
    by: ["event_id", "item"],
    where: { event_id: { in: [...new Set(rows.map((r) => r.event_id))] } },
    _max: { seq: true },
  });
  const isNewest = (r: { event_id: string; item: string; seq: number }) =>
    newest.some((n) => n.event_id === r.event_id && n.item === r.item && n._max.seq === r.seq);
  return rows.filter(isNewest).map((r) => ({
    ...agreementArray(r, snapshotOf(r.item as Item, r.event)),
    event_name: r.event.name,
    event_date: micro(r.event.date),
  }));
}

export default async function agreementRoutes(app: FastifyInstance) {
  app.register(async (routes) => {
    routes.addHook("preHandler", requireAuth);

    routes.get("/events/:id/agreements", async (request, reply) => {
      const { event } = await eventFor(request);
      const rows = await prisma.eventAgreement.findMany({ where: { event_id: event.id }, include: withPeople, orderBy: newestFirst });
      const items = Object.fromEntries(
        ITEMS.map((item) => {
          const current = snapshotOf(item, event);
          const newest = rows.find((r) => r.item === item);
          return [item, { state: itemState(newest, current), agreement: newest ? agreementArray(newest, current) : null }];
        }),
      );
      const titles = await prisma.champion.findMany({ where: { id: { in: event.titleLinks.map((l) => l.champion_id) } }, orderBy: { weight_class: "asc" } });
      return ok(reply, {
        licence: { number: event.licence_number, date: dateOnly(event.licence_date), hasDocument: Boolean(event.licence_document) },
        titles: titles.map(titleRow),
        items,
        log: rows.map((r) => agreementArray(r)),
      });
    });

    routes.post("/events/:id/agreements", async (request, reply) => {
      const { user, event } = await eventFor(request, true);
      const input = inputOf(request.body);
      const item = String(input.required("item")) as Item;
      if (!ITEMS.includes(item)) throw new HttpError(422, "The item must be details, sponsors or titles");
      if (item === "titles" && !event.titleLinks.length) throw new HttpError(422, "Choose the titles on this fight night first");
      const staff = hasRole(user, STAFF);
      const at = now();
      const row = await prisma.eventAgreement.create({
        data: {
          id: randomUUID(),
          event_id: event.id,
          item,
          // KKF staff record and confirm in one step.
          status: staff ? "confirmed" : "waiting",
          note: input.get<string>("note"),
          snapshot: snapshotOf(item, event) as Prisma.InputJsonValue,
          recorded_by: user.id,
          recorded_at: at,
          ...(staff ? { confirmed_by: user.id, confirmed_at: at } : {}),
        },
        include: withPeople,
      });
      return ok(reply, agreementArray(row, snapshotOf(item, event)), 201);
    });

    /** The newest row of its item, still waiting — the only one KKF can answer. */
    async function waitingRow(request: FastifyRequest) {
      const user = requireRole(request, STAFF);
      const { event } = await eventFor(request);
      const { agreementId } = request.params as { agreementId: string };
      const row = await prisma.eventAgreement.findFirst({ where: { id: agreementId, event_id: event.id } }).catch(() => null);
      if (!row) throw notFound("Agreement");
      const newest = await prisma.eventAgreement.findFirst({ where: { event_id: event.id, item: row.item }, orderBy: newestFirst });
      if (row.status !== "waiting" || newest?.id !== row.id) throw new HttpError(422, "Only the newest agreement waiting for KKF can be answered");
      return { user, event, row };
    }

    routes.post("/events/:id/agreements/:agreementId/confirm", async (request, reply) => {
      const { user, event, row } = await waitingRow(request);
      const current = snapshotOf(row.item as Item, event);
      if (!sameValues(row.snapshot, current)) {
        throw new HttpError(422, "The fight night changed after this was recorded — it needs to be recorded again");
      }
      const at = now();
      const saved = await prisma.eventAgreement.update({
        where: { id: row.id },
        data: { status: "confirmed", confirmed_by: user.id, confirmed_at: at },
        include: withPeople,
      });
      return ok(reply, agreementArray(saved, current));
    });

    routes.post("/events/:id/agreements/:agreementId/return", async (request, reply) => {
      const { event, row } = await waitingRow(request);
      const comment = String(inputOf(request.body).required("comment"));
      const saved = await prisma.eventAgreement.update({ where: { id: row.id }, data: { status: "returned", kkf_comment: comment }, include: withPeople });
      return ok(reply, agreementArray(saved, snapshotOf(row.item as Item, event)));
    });

    routes.put("/events/:id/licence", async (request, reply) => {
      const { event } = await eventFor(request, true);
      const input = inputOf(request.body);
      const data: Prisma.EventUncheckedUpdateInput = {};
      if (input.present("number")) {
        const number = input.get<string>("number");
        if (number && number.length > 100) throw new HttpError(422, "The licence number may be at most 100 characters");
        data.licence_number = number ?? null;
      }
      if (input.present("date")) data.licence_date = toDate(input.get("date"));
      if (input.present("document")) {
        const document = input.get("document");
        if (!document) data.licence_document = null;
        else if (isPrivateDataUri(document)) data.licence_document = await storePrivateDocument(document);
        else throw new HttpError(422, "The licence scan must be a PDF or a PNG, JPEG or WebP picture");
      }
      if (Object.keys(data).length) {
        data.updated_at = now();
        await prisma.event.update({ where: { id: event.id }, data });
      }
      const saved = await prisma.event.findUniqueOrThrow({ where: { id: event.id } });
      return ok(reply, { number: saved.licence_number, date: dateOnly(saved.licence_date), hasDocument: Boolean(saved.licence_document) });
    });

    routes.put("/events/:id/titles", async (request, reply) => {
      const { event } = await eventFor(request, true);
      const raw = inputOf(request.body).get("titleIds");
      if (!Array.isArray(raw)) throw new HttpError(422, "titleIds must be a list");
      const ids = [...new Set(raw.map(String))];
      const found = await prisma.champion.findMany({ where: { id: { in: ids.filter(isUuid) }, approval_status: "approved" } });
      if (found.length !== ids.length) throw new HttpError(422, "One of the selected titles does not exist");
      await prisma.$transaction([
        prisma.eventTitle.deleteMany({ where: { event_id: event.id } }),
        prisma.eventTitle.createMany({ data: ids.map((champion_id) => ({ event_id: event.id, champion_id })) }),
        prisma.event.update({ where: { id: event.id }, data: { updated_at: now() } }),
      ]);
      return ok(reply, found.sort((a, b) => Number(a.weight_class) - Number(b.weight_class)).map(titleRow));
    });

    routes.get("/events/:id/licence/document", async (request, reply) => {
      const { event } = await eventFor(request);
      const name = event.licence_document;
      if (!name || !FILE_NAME.test(name)) throw notFound("Document");
      const path = join(privateDir(), name);
      const info = await stat(path).catch(() => null);
      if (!info?.isFile()) throw notFound("Document");
      return reply
        .header("Content-Type", CONTENT_TYPES[name.split(".").pop()!])
        .header("Content-Length", info.size)
        .header("Cache-Control", "private, no-store")
        .header("Content-Disposition", "inline")
        .header("X-Content-Type-Options", "nosniff")
        .send(createReadStream(path));
    });

    routes.get("/agreements/waiting", async (request, reply) => {
      requireRole(request, STAFF);
      return ok(reply, await waitingAgreements());
    });
  });
}
