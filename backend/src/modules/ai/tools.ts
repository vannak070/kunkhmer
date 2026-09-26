/**
 * Read-only tools the "Ask Kun Khmer" assistant uses to answer from federation records.
 * Only public data: no deleted fighters, no Draft events, no contact details or internal
 * workflow fields. Every result carries a site URL so answers can link to the real page.
 */
import type Anthropic from "@anthropic-ai/sdk";
import { prisma } from "../../db.ts";
import type { Prisma } from "../../generated/prisma/client.ts";
import { NOT_DELETED, PUBLIC_FIGHTER } from "../fighters/routes.ts";
import { PUBLIC_EVENT as PUBLISHED_EVENT } from "../events/routes.ts";
import { PUBLIC_BOUT } from "../matches/proposals.ts";

type ToolInput = Record<string, unknown>;

/** Same slug as the public site's getFighterSlug(), so links resolve. */
export function fighterSlug(f: { id: string; name?: string | null }): string {
  if (!f.name) return f.id;
  const slug = f.name.toLowerCase().trim().replace(/[\s_-]+/g, "-");
  return encodeURIComponent(slug) || f.id;
}

const day = (d: Date | null | undefined) => (d ? d.toISOString().slice(0, 10) : null);
const num = (d: Prisma.Decimal | number | null | undefined) => (d == null ? null : Number(d));
const todayUtc = () => new Date(new Date().toISOString().slice(0, 10));
const PUBLIC_EVENT = PUBLISHED_EVENT;
const VISIBLE_FIGHTER = { ...NOT_DELETED, ...PUBLIC_FIGHTER } satisfies Prisma.FighterWhereInput;

const fighterSelect = {
  id: true, name: true, name_khmer: true, alias: true, record: true, grade: true,
  current_weight: true, club: { select: { name: true } },
} satisfies Prisma.FighterSelect;

type FighterRow = Prisma.FighterGetPayload<{ select: typeof fighterSelect }>;

const fighterSummary = (f: FighterRow | null) =>
  f && {
    name: f.name,
    name_khmer: f.name_khmer || null,
    alias: f.alias,
    club: f.club?.name ?? null,
    weight_kg: num(f.current_weight),
    record_w_l_d: f.record,
    grade: f.grade,
    url: `/fighters/${fighterSlug(f)}`,
  };

const boutInclude = {
  fighterA: { select: fighterSelect },
  fighterB: { select: fighterSelect },
  result: { include: { winner: { select: { name: true } } } },
  event: { select: { id: true, name: true, status: true } },
  subEvent: { select: { name: true, date: true } },
} satisfies Prisma.MatchInclude;

type BoutRow = Prisma.MatchGetPayload<{ include: typeof boutInclude }>;

function bout(m: BoutRow) {
  const r = m.result;
  return {
    event: m.event.name,
    event_url: `/events/${m.event.id}`,
    card: m.subEvent.name,
    date: day(m.subEvent.date),
    red_corner: fighterSummary(m.fighterA),
    blue_corner: fighterSummary(m.fighterB),
    agreed_weight_kg: num(m.agreed_weight),
    rounds: m.rounds,
    title_bout: m.is_title_match,
    result: r
      ? { winner: r.winner?.name ?? null, method: r.method, round: r.round, time: r.duration && r.duration !== "0:00" ? r.duration : null }
      : null,
  };
}

async function findFighter(key: string) {
  const byId = /^[0-9a-f-]{36}$/i.test(key)
    ? await prisma.fighter.findFirst({ where: { id: key, ...VISIBLE_FIGHTER }, select: { id: true } })
    : null;
  if (byId) return byId.id;
  const match = await prisma.fighter.findFirst({
    where: {
      ...VISIBLE_FIGHTER,
      OR: [
        { name: { contains: key, mode: "insensitive" } },
        { name_khmer: { contains: key } },
        { alias: { contains: key, mode: "insensitive" } },
      ],
    },
    select: { id: true },
    orderBy: { name: "asc" },
  });
  return match?.id ?? null;
}

// ─── Tool definitions (stable order: part of the cached prompt prefix) ──────

export const TOOLS: Anthropic.Beta.BetaTool[] = [
  {
    name: "search_fighters",
    description: "Find registered fighters by name (English or Khmer), alias or club. Returns up to 10 matches with club, weight, record and profile URL.",
    input_schema: {
      type: "object",
      properties: { query: { type: "string", description: "Part of a fighter's name, Khmer name, alias or club name" } },
      required: ["query"],
    },
  },
  {
    name: "get_fighter",
    description: "Full public profile of one fighter: club, weight, height, style, record, grade, recent recorded bouts with results, and their next scheduled bout.",
    input_schema: {
      type: "object",
      properties: { fighter: { type: "string", description: "Fighter name (English or Khmer) or id" } },
      required: ["fighter"],
    },
  },
  {
    name: "list_events",
    description: "Fight nights on the public calendar. 'upcoming' = today or later (soonest first); 'past' = before today (most recent first).",
    input_schema: {
      type: "object",
      properties: {
        when: { type: "string", enum: ["upcoming", "past"] },
        limit: { type: "integer", minimum: 1, maximum: 10 },
      },
      required: ["when"],
    },
  },
  {
    name: "get_event",
    description: "One event with venue, date, broadcaster, sponsor and its full fight card (every bout in running order, with results when recorded).",
    input_schema: {
      type: "object",
      properties: { event: { type: "string", description: "Event name or id" } },
      required: ["event"],
    },
  },
  {
    name: "latest_results",
    description: "The most recently recorded bout results across all events.",
    input_schema: {
      type: "object",
      properties: { limit: { type: "integer", minimum: 1, maximum: 10 } },
    },
  },
  {
    name: "list_champions",
    description: "Current federation championship titles: title name, weight class, holder, status and number of defenses.",
    input_schema: { type: "object", properties: {} },
  },
];

// ─── Tool implementations ───────────────────────────────────────────────────

async function searchFighters({ query }: ToolInput) {
  const q = String(query ?? "").trim();
  if (!q) return { error: "query is required" };
  const rows = await prisma.fighter.findMany({
    where: {
      ...VISIBLE_FIGHTER,
      OR: [
        { name: { contains: q, mode: "insensitive" } },
        { name_khmer: { contains: q } },
        { alias: { contains: q, mode: "insensitive" } },
        { club: { name: { contains: q, mode: "insensitive" } } },
      ],
    },
    select: fighterSelect,
    orderBy: { name: "asc" },
    take: 10,
  });
  return { count: rows.length, fighters: rows.map(fighterSummary) };
}

async function getFighter({ fighter }: ToolInput) {
  const id = await findFighter(String(fighter ?? "").trim());
  if (!id) return { error: "No registered fighter matches that name." };
  const f = await prisma.fighter.findFirst({
    where: { id, ...VISIBLE_FIGHTER },
    select: { ...fighterSelect, province: true, nationality: true, height: true, style: true, professional_status: true },
  });
  if (!f) return { error: "No registered fighter matches that name." };
  const bouts = await prisma.match.findMany({
    where: { AND: [{ OR: [{ fighter_a_id: id }, { fighter_b_id: id }] }, PUBLIC_BOUT], event: PUBLIC_EVENT },
    include: boutInclude,
    orderBy: { subEvent: { date: "desc" } },
    take: 30,
  });
  const today = todayUtc();
  const recorded = bouts.filter((b) => b.result).slice(0, 5);
  const next = bouts
    .filter((b) => !b.result && b.subEvent.date >= today)
    .sort((a, b) => a.subEvent.date.getTime() - b.subEvent.date.getTime())[0];
  return {
    ...fighterSummary(f),
    province: f.province,
    nationality: f.nationality,
    height_cm: num(f.height),
    style: f.style,
    professional_status: f.professional_status,
    recent_recorded_bouts: recorded.map(bout),
    next_bout: next ? bout(next) : null,
  };
}

async function listEvents({ when, limit }: ToolInput) {
  const upcoming = when !== "past";
  const today = todayUtc();
  const rows = await prisma.event.findMany({
    where: { ...PUBLIC_EVENT, date: upcoming ? { gte: today } : { lt: today } },
    orderBy: { date: upcoming ? "asc" : "desc" },
    take: Math.min(Math.max(Number(limit) || 5, 1), 10),
    select: {
      id: true, name: true, date: true, end_date: true, location: true,
      broadcastStation: { select: { name: true } }, mainSponsor: { select: { name: true } },
      _count: { select: { matches: { where: PUBLIC_BOUT } } },
    },
  });
  return {
    events: rows.map((e) => ({
      name: e.name,
      date: day(e.date),
      end_date: day(e.end_date),
      venue: e.location,
      broadcaster: e.broadcastStation?.name ?? null,
      presented_by: e.mainSponsor?.name ?? null,
      bouts: e._count.matches,
      url: `/events/${e.id}`,
    })),
  };
}

async function getEvent({ event }: ToolInput) {
  const key = String(event ?? "").trim();
  if (!key) return { error: "event is required" };
  const e = await prisma.event.findFirst({
    where: {
      ...PUBLIC_EVENT,
      ...(/^[0-9a-f-]{36}$/i.test(key) ? { id: key } : { name: { contains: key, mode: "insensitive" } }),
    },
    orderBy: { date: "desc" },
    include: {
      broadcastStation: { select: { name: true, website_url: true, stream_url: true } },
      mainSponsor: { select: { name: true } },
      matches: { where: PUBLIC_BOUT, include: boutInclude, orderBy: [{ subEvent: { date: "asc" } }, { sort_order: "asc" }] },
    },
  });
  if (!e) return { error: "No public event matches that name." };
  return {
    name: e.name,
    date: day(e.date),
    end_date: day(e.end_date),
    venue: e.location,
    description: e.description,
    broadcaster: e.broadcastStation
      ? { name: e.broadcastStation.name, website: e.broadcastStation.website_url, stream: e.broadcastStation.stream_url }
      : null,
    presented_by: e.mainSponsor?.name ?? null,
    url: `/events/${e.id}`,
    fight_card: e.matches.map(bout),
  };
}

async function latestResults({ limit }: ToolInput) {
  const rows = await prisma.match.findMany({
    where: { result: { isNot: null }, event: PUBLIC_EVENT },
    include: boutInclude,
    orderBy: { subEvent: { date: "desc" } },
    take: Math.min(Math.max(Number(limit) || 5, 1), 10),
  });
  return { results: rows.map(bout) };
}

async function listChampions() {
  const rows = await prisma.champion.findMany({
    where: { approval_status: "approved" },
    include: { currentHolder: { select: fighterSelect } },
    orderBy: { weight_class: "asc" },
  });
  return {
    titles: rows.map((c) => ({
      title: c.title_name,
      weight_class_kg: num(c.weight_class),
      status: c.status,
      holder: c.status === "Vacant" ? null : fighterSummary(c.currentHolder) ?? c.current_holder_name,
      defenses: c.defense_count,
      last_defense: day(c.last_defense_date),
    })),
  };
}

const HANDLERS: Record<string, (input: ToolInput) => Promise<unknown>> = {
  search_fighters: searchFighters,
  get_fighter: getFighter,
  list_events: listEvents,
  get_event: getEvent,
  latest_results: latestResults,
  list_champions: listChampions,
};

/** Runs a tool and returns its JSON result; failures come back as { error } for the model. */
export async function runTool(name: string, input: unknown): Promise<{ content: string; isError: boolean }> {
  const handler = HANDLERS[name];
  if (!handler) return { content: JSON.stringify({ error: `Unknown tool ${name}` }), isError: true };
  try {
    const result = await handler((input ?? {}) as ToolInput);
    return { content: JSON.stringify(result), isError: false };
  } catch {
    return { content: JSON.stringify({ error: "The records could not be read right now." }), isError: true };
  }
}
