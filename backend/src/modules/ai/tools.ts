/**
 * Read-only tools KUNKHMER HUB uses to answer from federation records.
 * Only public data: no deleted or unverified fighters, no Draft events / news / videos, no
 * personal contact details or internal workflow fields (a club's public phone and email are
 * shown, as on the club page). Every result carries a site URL so answers can link to the real page.
 */
import type Anthropic from "@anthropic-ai/sdk";
import { prisma } from "../../db.ts";
import type { Prisma } from "../../generated/prisma/client.ts";
import { NOT_DELETED, PUBLIC_FIGHTER, UNVERIFIED } from "../fighters/routes.ts";
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

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

type Resolved = { id: string } | { candidates: ReturnType<typeof fighterSummary>[] } | null;

/**
 * Finds one visible fighter by id, exact name / Khmer name / alias, or part of a name. When a
 * name fits several fighters it returns them as candidates instead of guessing.
 */
async function resolveFighter(key: string): Promise<Resolved> {
  if (!key) return null;
  if (UUID_RE.test(key)) {
    const byId = await prisma.fighter.findFirst({ where: { id: key, ...VISIBLE_FIGHTER }, select: { id: true } });
    if (byId) return byId;
  }
  const exact = await prisma.fighter.findMany({
    where: {
      ...VISIBLE_FIGHTER,
      OR: [
        { name: { equals: key, mode: "insensitive" } },
        { name_khmer: { equals: key } },
        { alias: { equals: key, mode: "insensitive" } },
      ],
    },
    select: fighterSelect,
    take: 6,
  });
  if (exact.length === 1) return { id: exact[0].id };
  if (exact.length > 1) return { candidates: exact.map(fighterSummary) };
  const partial = await prisma.fighter.findMany({
    where: {
      ...VISIBLE_FIGHTER,
      OR: [
        { name: { contains: key, mode: "insensitive" } },
        { name_khmer: { contains: key } },
        { alias: { contains: key, mode: "insensitive" } },
      ],
    },
    select: fighterSelect,
    orderBy: { name: "asc" },
    take: 6,
  });
  if (partial.length === 1) return { id: partial[0].id };
  if (partial.length > 1) return { candidates: partial.map(fighterSummary) };
  return null;
}

const NO_FIGHTER = { error: "No registered fighter matches that name." };
const ambiguous = (key: string, candidates: unknown[]) => ({
  ambiguous: true,
  note: `Several fighters match "${key}". Ask the user which one they mean (or use the exact name).`,
  candidates,
});

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
  {
    name: "fighter_stats",
    description: "Statistics for ONE named fighter: their official profile record (W-L-D) plus figures from bouts recorded on this site — wins/losses/draws, win and loss methods, finishing rate, average finishing round, current streak, title bouts and recent form. Not for comparing or ranking many fighters.",
    input_schema: {
      type: "object",
      properties: { fighter: { type: "string", description: "Fighter name (English or Khmer) or id" } },
      required: ["fighter"],
    },
  },
  {
    name: "head_to_head",
    description: "Every recorded and scheduled bout between two fighters, with who won each and the overall tally.",
    input_schema: {
      type: "object",
      properties: {
        fighter_a: { type: "string", description: "First fighter's name or id" },
        fighter_b: { type: "string", description: "Second fighter's name or id" },
      },
      required: ["fighter_a", "fighter_b"],
    },
  },
  {
    name: "search_clubs",
    description: "Find registered clubs/gyms by name (English or Khmer) or location. Leave the query empty to list all clubs. Returns location and number of registered fighters.",
    input_schema: {
      type: "object",
      properties: { query: { type: "string", description: "Part of a club name, Khmer name or location (optional)" } },
    },
  },
  {
    name: "get_club",
    description: "One club's public profile: location, head coach, year established, description, public contact phone and email, and its registered fighters.",
    input_schema: {
      type: "object",
      properties: { club: { type: "string", description: "Club name (English or Khmer) or id" } },
      required: ["club"],
    },
  },
  {
    name: "list_news",
    description: "The federation's published news articles, newest first, optionally filtered by words in the title or text.",
    input_schema: {
      type: "object",
      properties: {
        query: { type: "string", description: "Words to look for (optional)" },
        limit: { type: "integer", minimum: 1, maximum: 10 },
      },
    },
  },
  {
    name: "get_news",
    description: "The full text of one published news article.",
    input_schema: {
      type: "object",
      properties: { article: { type: "string", description: "Article title (or part of it) or id" } },
      required: ["article"],
    },
  },
  {
    name: "list_videos",
    description: "Published videos (highlights, interviews, full fights), newest first, optionally filtered by words or by fighter.",
    input_schema: {
      type: "object",
      properties: {
        query: { type: "string", description: "Words in the title, description or category (optional)" },
        fighter: { type: "string", description: "Only videos about this fighter (optional)" },
        limit: { type: "integer", minimum: 1, maximum: 10 },
      },
    },
  },
  {
    name: "federation_settings",
    description: "The federation's official lists: weight classes (kg ranges), bout rule presets (rounds, minutes per round, knockdown limit, glove size), approved glove brands and venues.",
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
  const key = String(fighter ?? "").trim();
  const found = await resolveFighter(key);
  if (!found) return NO_FIGHTER;
  if ("candidates" in found) return ambiguous(key, found.candidates);
  const id = found.id;
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

// ─── Statistics (per fighter only — no leaderboards, owner decision 2026-09-28) ───

type Outcome = "W" | "L" | "D" | "NC";

function outcomeFor(m: BoutRow, id: string): Outcome | null {
  const r = m.result;
  if (!r) return null;
  if (r.winner_id === id) return "W";
  if (r.winner_id) return "L";
  return /no ?contest/i.test(r.method) ? "NC" : "D";
}

const isFinish = (method: string) => !/decision|draw|no ?contest|points/i.test(method);

async function recordedBouts(id: string) {
  return prisma.match.findMany({
    where: { OR: [{ fighter_a_id: id }, { fighter_b_id: id }], result: { isNot: null }, event: PUBLIC_EVENT },
    include: boutInclude,
    orderBy: { subEvent: { date: "asc" } },
  });
}

async function fighterStats({ fighter }: ToolInput) {
  const key = String(fighter ?? "").trim();
  const found = await resolveFighter(key);
  if (!found) return NO_FIGHTER;
  if ("candidates" in found) return ambiguous(key, found.candidates);
  const f = await prisma.fighter.findFirst({ where: { id: found.id, ...VISIBLE_FIGHTER }, select: fighterSelect });
  if (!f) return NO_FIGHTER;

  const bouts = await recordedBouts(f.id);
  const tally = { W: 0, L: 0, D: 0, NC: 0 };
  const winMethods: Record<string, number> = {};
  const lossMethods: Record<string, number> = {};
  const finishRounds: number[] = [];
  let titleBouts = 0;
  let titleWins = 0;
  const outcomes: Outcome[] = [];
  for (const b of bouts) {
    const o = outcomeFor(b, f.id)!;
    outcomes.push(o);
    tally[o]++;
    const method = b.result!.method || "Unknown";
    if (o === "W") {
      winMethods[method] = (winMethods[method] ?? 0) + 1;
      if (isFinish(method) && b.result!.round) finishRounds.push(b.result!.round);
    }
    if (o === "L") lossMethods[method] = (lossMethods[method] ?? 0) + 1;
    if (b.is_title_match) {
      titleBouts++;
      if (o === "W") titleWins++;
    }
  }
  let streak: { type: string; count: number } | null = null;
  const last = outcomes[outcomes.length - 1];
  if (last === "W" || last === "L") {
    let count = 0;
    for (let i = outcomes.length - 1; i >= 0 && outcomes[i] === last; i--) count++;
    streak = { type: last === "W" ? "wins" : "losses", count };
  }
  const finishes = finishRounds.length;
  return {
    fighter: fighterSummary(f),
    official_record_w_l_d: f.record,
    note: "official_record_w_l_d is the fighter's official record. Everything under recorded_on_site counts only bouts recorded on this website, which may be fewer.",
    recorded_on_site: {
      bouts: bouts.length,
      wins: tally.W,
      losses: tally.L,
      draws: tally.D,
      no_contests: tally.NC,
      win_methods: winMethods,
      loss_methods: lossMethods,
      finishing_rate: tally.W ? `${Math.round((finishes / tally.W) * 100)}%` : null,
      average_finishing_round: finishes ? Math.round((finishRounds.reduce((a, b) => a + b, 0) / finishes) * 10) / 10 : null,
      current_streak: streak,
      title_bouts: titleBouts,
      title_bout_wins: titleWins,
      first_recorded_bout: day(bouts[0]?.subEvent.date),
      recent_form_newest_first: outcomes.slice(-5).reverse(),
    },
  };
}

async function headToHead({ fighter_a, fighter_b }: ToolInput) {
  const keys = [String(fighter_a ?? "").trim(), String(fighter_b ?? "").trim()];
  const ids: string[] = [];
  for (const key of keys) {
    const found = await resolveFighter(key);
    if (!found) return { error: `No registered fighter matches "${key}".` };
    if ("candidates" in found) return ambiguous(key, found.candidates);
    ids.push(found.id);
  }
  const [a, b] = ids;
  if (a === b) return { error: "Those are the same fighter." };
  const people = await prisma.fighter.findMany({ where: { id: { in: ids } }, select: fighterSelect });
  const pa = people.find((p) => p.id === a)!;
  const pb = people.find((p) => p.id === b)!;
  const bouts = await prisma.match.findMany({
    where: {
      AND: [
        { OR: [{ fighter_a_id: a, fighter_b_id: b }, { fighter_a_id: b, fighter_b_id: a }] },
        PUBLIC_BOUT,
      ],
      event: PUBLIC_EVENT,
    },
    include: boutInclude,
    orderBy: { subEvent: { date: "asc" } },
  });
  const recorded = bouts.filter((m) => m.result);
  const winsA = recorded.filter((m) => m.result!.winner_id === a).length;
  const winsB = recorded.filter((m) => m.result!.winner_id === b).length;
  const today = todayUtc();
  return {
    fighter_a: fighterSummary(pa),
    fighter_b: fighterSummary(pb),
    recorded_bouts: recorded.length,
    wins_fighter_a: winsA,
    wins_fighter_b: winsB,
    draws_or_no_contests: recorded.length - winsA - winsB,
    bouts: recorded.map(bout),
    scheduled: bouts.filter((m) => !m.result && m.subEvent.date >= today).map(bout),
    note: "Counts only bouts recorded on this website.",
  };
}

// ─── Clubs, news, videos, settings ──────────────────────────────────────────

const CLUBS_URL = "/strategic-partners";
const MEDIA_URL = "/news-events?tab=media";
const clip = (text: string | null | undefined, max: number) => {
  if (!text) return null;
  const plain = text.replace(/<[^>]+>/g, " ").replace(/&nbsp;/g, " ").replace(/\s+/g, " ").trim();
  return plain.length > max ? `${plain.slice(0, max)}…` : plain;
};
const visibleFighterCount = { _count: { select: { fighters: { where: VISIBLE_FIGHTER } } } } satisfies Prisma.ClubInclude;

async function searchClubs({ query }: ToolInput) {
  const q = String(query ?? "").trim();
  const rows = await prisma.club.findMany({
    where: q
      ? {
          OR: [
            { name: { contains: q, mode: "insensitive" } },
            { name_khmer: { contains: q } },
            { location: { contains: q, mode: "insensitive" } },
          ],
        }
      : {},
    include: visibleFighterCount,
    orderBy: { name: "asc" },
    take: 20,
  });
  return {
    count: rows.length,
    clubs: rows.map((c) => ({ name: c.name, name_khmer: c.name_khmer, location: c.location, fighters: c._count.fighters })),
    url: CLUBS_URL,
  };
}

async function getClub({ club }: ToolInput) {
  const key = String(club ?? "").trim();
  if (!key) return { error: "club is required" };
  const where: Prisma.ClubWhereInput = UUID_RE.test(key)
    ? { id: key }
    : { OR: [{ name: { contains: key, mode: "insensitive" } }, { name_khmer: { contains: key } }] };
  const rows = await prisma.club.findMany({ where, orderBy: { name: "asc" }, take: 6 });
  const exact = rows.filter((c) => c.name.toLowerCase() === key.toLowerCase() || c.name_khmer === key);
  const picked = exact.length === 1 ? exact : rows;
  if (picked.length === 0) return { error: "No registered club matches that name." };
  if (picked.length > 1) {
    return ambiguous(key, picked.map((c) => ({ name: c.name, name_khmer: c.name_khmer, location: c.location })));
  }
  const c = picked[0];
  const fighters = await prisma.fighter.findMany({ where: { club_id: c.id, ...VISIBLE_FIGHTER }, select: fighterSelect, orderBy: { name: "asc" }, take: 40 });
  return {
    name: c.name,
    name_khmer: c.name_khmer,
    location: c.location,
    head_coach: c.head_coach,
    established: c.established,
    description: clip(c.description, 800),
    phone: c.phone,
    email: c.email,
    fighters: fighters.map(fighterSummary),
    url: CLUBS_URL,
  };
}

const PUBLISHED_NEWS = { status: "Published" } satisfies Prisma.NewsArticleWhereInput;

async function listNews({ query, limit }: ToolInput) {
  const q = String(query ?? "").trim();
  const rows = await prisma.newsArticle.findMany({
    where: {
      ...PUBLISHED_NEWS,
      ...(q
        ? { OR: [{ title: { contains: q, mode: "insensitive" } }, { subtitle: { contains: q, mode: "insensitive" } }, { content: { contains: q, mode: "insensitive" } }] }
        : {}),
    },
    orderBy: [{ publish_date: { sort: "desc", nulls: "last" } }, { created_at: { sort: "desc", nulls: "last" } }],
    take: Math.min(Math.max(Number(limit) || 5, 1), 10),
  });
  return {
    articles: rows.map((a) => ({
      title: a.title,
      subtitle: a.subtitle,
      category: a.category,
      date: day(a.publish_date),
      summary: clip(a.content, 240),
      url: `/article/${a.id}`,
    })),
  };
}

async function getNews({ article }: ToolInput) {
  const key = String(article ?? "").trim();
  if (!key) return { error: "article is required" };
  const a = await prisma.newsArticle.findFirst({
    where: { ...PUBLISHED_NEWS, ...(UUID_RE.test(key) ? { id: key } : { title: { contains: key, mode: "insensitive" } }) },
    orderBy: { publish_date: { sort: "desc", nulls: "last" } },
  });
  if (!a) return { error: "No published article matches that." };
  return {
    title: a.title,
    subtitle: a.subtitle,
    category: a.category,
    date: day(a.publish_date),
    text: clip(a.content, 4000),
    url: `/article/${a.id}`,
  };
}

async function listVideos({ query, fighter, limit }: ToolInput) {
  const q = String(query ?? "").trim();
  const where: Prisma.VideoWhereInput = { status: "Published", deleted_at: null };
  const who = String(fighter ?? "").trim();
  if (who) {
    const found = await resolveFighter(who);
    if (!found) return NO_FIGHTER;
    if ("candidates" in found) return ambiguous(who, found.candidates);
    where.fighter_id = found.id;
  }
  if (q) {
    where.OR = [
      { title: { contains: q, mode: "insensitive" } },
      { description: { contains: q, mode: "insensitive" } },
      { category: { contains: q, mode: "insensitive" } },
    ];
  }
  const rows = await prisma.video.findMany({
    where,
    include: { fighter: { select: { ...fighterSelect, deleted_at: true, status: true } } },
    orderBy: { created_at: { sort: "desc", nulls: "last" } },
    take: Math.min(Math.max(Number(limit) || 5, 1), 10),
  });
  return {
    videos: rows.map((v) => {
      const f = v.fighter && !v.fighter.deleted_at && !UNVERIFIED.includes(v.fighter.status) ? v.fighter : null;
      return {
        title: v.title,
        category: v.category,
        duration: v.duration,
        youtube: v.youtube_url,
        fighter: f ? { name: f.name, url: `/fighters/${fighterSlug(f)}` } : null,
        date: day(v.created_at),
      };
    }),
    url: MEDIA_URL,
  };
}

async function federationSettings() {
  const [weights, rules, gloves, venues] = await Promise.all([
    prisma.weightClass.findMany({ where: { active: true }, orderBy: [{ sort_order: "asc" }, { min_kg: "asc" }] }),
    prisma.boutRule.findMany({ where: { active: true }, orderBy: { sort_order: "asc" } }),
    prisma.gloveBrand.findMany({ where: { active: true }, orderBy: { sort_order: "asc" } }),
    prisma.venue.findMany({ where: { active: true }, orderBy: { sort_order: "asc" } }),
  ]);
  return {
    weight_classes: weights.map((w) => ({ name: w.name, name_khmer: w.name_khmer, min_kg: num(w.min_kg), max_kg: num(w.max_kg) })),
    bout_rules: rules.map((r) => ({
      name: r.name,
      name_khmer: r.name_khmer,
      rounds: r.rounds,
      minutes_per_round: r.round_time,
      knockdown_limit: r.knockdown_limit,
      glove_size_oz: r.glove_size,
    })),
    approved_glove_brands: gloves.map((g) => [g.brand, g.model].filter(Boolean).join(" ")),
    venues: venues.map((v) => ({ name: v.name, region: v.region })),
  };
}

const HANDLERS: Record<string, (input: ToolInput) => Promise<unknown>> = {
  search_fighters: searchFighters,
  get_fighter: getFighter,
  list_events: listEvents,
  get_event: getEvent,
  latest_results: latestResults,
  list_champions: listChampions,
  fighter_stats: fighterStats,
  head_to_head: headToHead,
  search_clubs: searchClubs,
  get_club: getClub,
  list_news: listNews,
  get_news: getNews,
  list_videos: listVideos,
  federation_settings: federationSettings,
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
