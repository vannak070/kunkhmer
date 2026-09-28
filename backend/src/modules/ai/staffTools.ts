/**
 * Read-only tools for the admin staff assistant (KUNKHMER HUB Phase D2, KKF staff only).
 * They may see records the public can't (unverified fighters, draft events and news) but only
 * names and sport facts — never phone, email, address, date of birth, medical or disciplinary
 * data (owner decision 2026-09-28). Every item carries an `admin_url` to the page where staff act.
 * The public tools are available too; their fan-site `url` fields are removed so answers only
 * link inside the admin. See claude/updates/hub-phase-d2-staff-assistant.md.
 */
import type Anthropic from "@anthropic-ai/sdk";
import { prisma } from "../../db.ts";
import type { Prisma } from "../../generated/prisma/client.ts";
import { NOT_DELETED } from "../fighters/routes.ts";
import { UNAPPROVED } from "../events/routes.ts";
import { runTool, TOOLS } from "./tools.ts";

type ToolInput = Record<string, unknown>;

const day = (d: Date | null | undefined) => (d ? d.toISOString().slice(0, 10) : null);
const num = (d: Prisma.Decimal | number | null | undefined) => (d == null ? null : Number(d));
const todayUtc = () => new Date(new Date().toISOString().slice(0, 10));
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const LIST = 25;

/** Fighter statuses that wait for KKF verification ("Rejected" = sent back to the club). */
const TO_VERIFY = ["Draft", "Pending KKF Verification", "Pending"];
const PENDING_EVENT = "Pending KKF Approval";

const admin = {
  fighter: (id: string) => `/home/fighters/${id}`,
  event: (id: string) => `/home/events/${id}`,
  club: (id: string) => `/home/clubs/${id}`,
  card: (id: string) => `/home/batches/${id}`,
  bout: (id: string) => `/home/match/${id}`,
  result: (id: string) => `/home/match/${id}/update-result`,
  proposals: "/home/match-proposals",
  news: "/home/media/news",
  videos: "/home/media/video",
  knowledge: "/home/knowledge",
};

const staffFighterSelect = {
  id: true, name: true, name_khmer: true, alias: true, status: true, record: true, grade: true,
  current_weight: true, gender: true, review_note: true, created_at: true, updated_at: true,
  club: { select: { name: true } },
} satisfies Prisma.FighterSelect;

type StaffFighter = Prisma.FighterGetPayload<{ select: typeof staffFighterSelect }>;

const fighterItem = (f: StaffFighter) => ({
  name: f.name,
  name_khmer: f.name_khmer || null,
  alias: f.alias,
  club: f.club?.name ?? null,
  status: f.status,
  record_w_l_d: f.record,
  weight_kg: num(f.current_weight),
  grade: f.grade,
  gender: f.gender,
  admin_url: admin.fighter(f.id),
});

// ─── Tool definitions ───────────────────────────────────────────────────────

export const STAFF_TOOLS: Anthropic.Beta.BetaTool[] = [
  {
    name: "pending_approvals",
    description:
      "Work waiting for KKF staff: fighters waiting for verification, fighters sent back to their club, events waiting for KKF approval, and match proposals still waiting for a club's answer or declined.",
    input_schema: { type: "object", properties: {} },
  },
  {
    name: "data_quality",
    description:
      "Data problems to fix. check = 'missing_results' (past fight cards with bouts that have no result), 'fighter_gaps' (fighters without photo, club, record, a valid weight or height, or with an unlikely date of birth), 'duplicates' (likely duplicate fighters: same name, same Khmer name, or very similar name with the same date of birth), 'officials' (upcoming bouts without a referee), or 'all' for a summary of every check.",
    input_schema: {
      type: "object",
      properties: { check: { type: "string", enum: ["all", "missing_results", "fighter_gaps", "duplicates", "officials"] } },
      required: ["check"],
    },
  },
  {
    name: "drafts",
    description:
      "Unpublished work: draft events and approved events not yet published, draft news articles, draft videos, and knowledge base drafts (plus published articles whose Khmer still needs review).",
    input_schema: { type: "object", properties: {} },
  },
  {
    name: "find_records",
    description:
      "Find fighters (any status, including unverified), clubs and events (including drafts) by name, with their status and admin page link. Use it to link a record the user names.",
    input_schema: {
      type: "object",
      properties: {
        query: { type: "string", description: "Part of a name (English or Khmer) or an id" },
        type: { type: "string", enum: ["all", "fighter", "club", "event"] },
      },
      required: ["query"],
    },
  },
];

// ─── Implementations ────────────────────────────────────────────────────────

async function pendingApprovals() {
  const [toVerify, toVerifyCount, sentBack, events, proposals, proposalCount] = await Promise.all([
    prisma.fighter.findMany({ where: { ...NOT_DELETED, status: { in: TO_VERIFY } }, select: staffFighterSelect, orderBy: { created_at: "asc" }, take: LIST }),
    prisma.fighter.count({ where: { ...NOT_DELETED, status: { in: TO_VERIFY } } }),
    prisma.fighter.findMany({ where: { ...NOT_DELETED, status: "Rejected" }, select: staffFighterSelect, orderBy: { updated_at: "desc" }, take: LIST }),
    prisma.event.findMany({
      where: { status: PENDING_EVENT },
      select: { id: true, name: true, date: true, location: true, updated_at: true, organizer: { select: { full_name: true } } },
      orderBy: { date: "asc" },
      take: LIST,
    }),
    prisma.match.findMany({
      where: { proposal_status: { in: ["pending", "declined"] }, result: null },
      select: {
        id: true, proposal_status: true, club_a_response: true, club_b_response: true, club_a_note: true, club_b_note: true,
        fighterA: { select: { name: true, club: { select: { name: true } } } },
        fighterB: { select: { name: true, club: { select: { name: true } } } },
        event: { select: { name: true } },
        subEvent: { select: { name: true, date: true } },
      },
      orderBy: { subEvent: { date: "asc" } },
      take: LIST,
    }),
    prisma.match.count({ where: { proposal_status: { in: ["pending", "declined"] }, result: null } }),
  ]);
  const waitingOn = (m: (typeof proposals)[number]) =>
    [
      m.club_a_response === "pending" ? m.fighterA.club?.name : null,
      m.club_b_response === "pending" ? m.fighterB.club?.name : null,
    ].filter(Boolean);
  return {
    fighters_to_verify: {
      count: toVerifyCount,
      oldest_first: toVerify.map((f) => ({ ...fighterItem(f), registered: day(f.created_at) })),
    },
    fighters_sent_back_to_club: sentBack.map((f) => ({ ...fighterItem(f), reason: f.review_note })),
    events_waiting_for_approval: events.map((e) => ({
      name: e.name,
      date: day(e.date),
      venue: e.location,
      organizer: e.organizer.full_name,
      submitted: day(e.updated_at),
      admin_url: admin.event(e.id),
    })),
    match_proposals: {
      count: proposalCount,
      admin_url: admin.proposals,
      items: proposals.map((m) => ({
        bout: `${m.fighterA.name} vs ${m.fighterB.name}`,
        event: m.event.name,
        card: m.subEvent.name,
        date: day(m.subEvent.date),
        status: m.proposal_status,
        waiting_for: m.proposal_status === "pending" ? waitingOn(m) : [],
        decline_reason: m.proposal_status === "declined" ? m.club_a_note || m.club_b_note || null : null,
        admin_url: admin.bout(m.id),
      })),
    },
  };
}

async function missingResults() {
  const bouts = await prisma.match.findMany({
    where: {
      result: null,
      proposal_status: { not: "declined" },
      subEvent: { date: { lt: todayUtc() } },
      event: { status: { not: "Cancelled" } },
    },
    select: {
      id: true,
      fighterA: { select: { name: true } },
      fighterB: { select: { name: true } },
      event: { select: { name: true } },
      subEvent: { select: { id: true, name: true, date: true } },
    },
    orderBy: [{ subEvent: { date: "desc" } }, { sort_order: "asc" }],
  });
  const cards = new Map<string, { card: string; event: string; date: string | null; admin_url: string; bouts: unknown[] }>();
  for (const b of bouts) {
    const c = cards.get(b.subEvent.id) ?? {
      card: b.subEvent.name,
      event: b.event.name,
      date: day(b.subEvent.date),
      admin_url: admin.card(b.subEvent.id),
      bouts: [],
    };
    c.bouts.push({ bout: `${b.fighterA.name} vs ${b.fighterB.name}`, record_result_url: admin.result(b.id) });
    cards.set(b.subEvent.id, c);
  }
  return {
    bouts_without_result: bouts.length,
    fight_cards: [...cards.values()].slice(0, LIST).map((c) => ({ ...c, bouts_without_result: c.bouts.length, bouts: c.bouts.slice(0, 12) })),
  };
}

async function fighterGaps() {
  const today = todayUtc();
  const years = (n: number) => new Date(Date.UTC(today.getUTCFullYear() - n, today.getUTCMonth(), today.getUTCDate()));
  const checks: [string, Prisma.FighterWhereInput][] = [
    ["no_photo", { OR: [{ image: null }, { image: "" }] }],
    ["no_club", { club_id: null }],
    ["no_record", { OR: [{ record: null }, { record: "" }] }],
    ["no_valid_weight", { current_weight: { lte: 0 } }],
    ["no_valid_height", { height: { lte: 0 } }],
    // The date itself is never sent to the model; only that it looks wrong (under 10 or over 70).
    ["unlikely_date_of_birth", { OR: [{ date_of_birth: { gt: years(10) } }, { date_of_birth: { lt: years(70) } }] }],
  ];
  const out: Record<string, unknown> = {};
  for (const [key, where] of checks) {
    const full = { ...NOT_DELETED, ...where };
    const [count, rows] = await Promise.all([
      prisma.fighter.count({ where: full }),
      prisma.fighter.findMany({ where: full, select: staffFighterSelect, orderBy: { name: "asc" }, take: LIST }),
    ]);
    out[key] = { count, fighters: rows.map(fighterItem) };
  }
  return out;
}

const latin = (s: string) => s.toLowerCase().normalize("NFKD").replace(/[^a-z0-9]/g, "");
const khmer = (s: string | null) => (s ?? "").replace(/[\s​‌‍]/g, "");

function editDistance(a: string, b: string): number {
  if (Math.abs(a.length - b.length) > 2) return 3;
  const row = Array.from({ length: b.length + 1 }, (_, i) => i);
  for (let i = 1; i <= a.length; i++) {
    let prev = row[0];
    row[0] = i;
    for (let j = 1; j <= b.length; j++) {
      const tmp = row[j];
      row[j] = Math.min(row[j] + 1, row[j - 1] + 1, prev + (a[i - 1] === b[j - 1] ? 0 : 1));
      prev = tmp;
    }
  }
  return row[b.length];
}

async function duplicates() {
  const rows = await prisma.fighter.findMany({
    where: NOT_DELETED,
    select: { ...staffFighterSelect, date_of_birth: true },
  });
  // Union-find over pairs that look like the same person.
  const parent = rows.map((_, i) => i);
  const find = (i: number): number => (parent[i] === i ? i : (parent[i] = find(parent[i])));
  const reasons = new Map<number, Set<string>>();
  const link = (i: number, j: number, why: string) => {
    const [a, b] = [find(i), find(j)];
    if (a !== b) parent[b] = a;
    for (const k of [i, j]) reasons.set(k, (reasons.get(k) ?? new Set()).add(why));
  };
  const byKey = (key: (i: number) => string, why: string) => {
    const seen = new Map<string, number>();
    rows.forEach((_, i) => {
      const k = key(i);
      if (!k) return;
      const first = seen.get(k);
      if (first === undefined) seen.set(k, i);
      else link(first, i, why);
    });
  };
  byKey((i) => latin(rows[i].name), "same name");
  byKey((i) => khmer(rows[i].name_khmer), "same Khmer name");
  const byBirth = new Map<string, number[]>();
  rows.forEach((f, i) => {
    const k = day(f.date_of_birth)!;
    byBirth.set(k, [...(byBirth.get(k) ?? []), i]);
  });
  for (const group of byBirth.values()) {
    for (let x = 0; x < group.length; x++) {
      for (let y = x + 1; y < group.length; y++) {
        const [a, b] = [latin(rows[group[x]].name), latin(rows[group[y]].name)];
        if (a !== b && Math.min(a.length, b.length) >= 4 && editDistance(a, b) <= 2) {
          link(group[x], group[y], "similar name, same date of birth");
        }
      }
    }
  }
  const groups = new Map<number, number[]>();
  for (const i of reasons.keys()) groups.set(find(i), [...(groups.get(find(i)) ?? []), i]);
  const list = [...groups.values()].filter((g) => g.length > 1);
  return {
    likely_duplicate_groups: list.length,
    note: "Possible duplicates only — staff should compare the profiles before merging or deleting anything.",
    groups: list.slice(0, LIST).map((g) => ({
      why: [...new Set(g.flatMap((i) => [...(reasons.get(i) ?? [])]))],
      fighters: g.map((i) => ({ ...fighterItem(rows[i]), registered: day(rows[i].created_at) })),
    })),
  };
}

async function missingOfficials() {
  const bouts = await prisma.match.findMany({
    where: {
      referee_id: null,
      result: null,
      proposal_status: { not: "declined" },
      subEvent: { date: { gte: todayUtc() } },
      event: { status: { not: "Cancelled" } },
    },
    select: {
      id: true,
      fighterA: { select: { name: true } },
      fighterB: { select: { name: true } },
      event: { select: { name: true } },
      subEvent: { select: { id: true, name: true, date: true } },
    },
    orderBy: [{ subEvent: { date: "asc" } }, { sort_order: "asc" }],
    take: 60,
  });
  return {
    upcoming_bouts_without_referee: bouts.length,
    bouts: bouts.map((b) => ({
      bout: `${b.fighterA.name} vs ${b.fighterB.name}`,
      event: b.event.name,
      card: b.subEvent.name,
      date: day(b.subEvent.date),
      assign_officials_url: `/home/matches/${b.subEvent.id}/assign-officials`,
    })),
  };
}

async function dataQuality({ check }: ToolInput) {
  switch (check) {
    case "missing_results":
      return missingResults();
    case "fighter_gaps":
      return fighterGaps();
    case "duplicates":
      return duplicates();
    case "officials":
      return missingOfficials();
    default: {
      const [results, gaps, dupes, officials] = await Promise.all([missingResults(), fighterGaps(), duplicates(), missingOfficials()]);
      const counts = Object.fromEntries(Object.entries(gaps).map(([k, v]) => [k, (v as { count: number }).count]));
      return {
        note: "Summary only; call data_quality again with one check for the full list.",
        bouts_without_result: results.bouts_without_result,
        fight_cards_without_results: results.fight_cards.slice(0, 5).map(({ bouts: _b, ...c }) => c),
        fighter_gaps: counts,
        likely_duplicate_groups: dupes.likely_duplicate_groups,
        upcoming_bouts_without_referee: officials.upcoming_bouts_without_referee,
      };
    }
  }
}

async function drafts() {
  const [events, news, videos, knowledge, kmReview] = await Promise.all([
    prisma.event.findMany({
      where: { status: { in: UNAPPROVED } },
      select: { id: true, name: true, date: true, status: true, kkf_comment: true },
      orderBy: { date: "asc" },
      take: LIST,
    }),
    prisma.newsArticle.findMany({
      where: { status: "Draft" },
      select: { title: true, category: true, updated_at: true },
      orderBy: { updated_at: { sort: "desc", nulls: "last" } },
      take: LIST,
    }),
    prisma.video.findMany({
      where: { status: "Draft", deleted_at: null },
      select: { title: true, category: true, updated_at: true },
      orderBy: { updated_at: { sort: "desc", nulls: "last" } },
      take: LIST,
    }),
    prisma.knowledgeArticle.findMany({
      where: { status: "Draft" },
      select: { title_en: true, category: true, updated_at: true },
      orderBy: { updated_at: "desc" },
      take: LIST,
    }),
    prisma.knowledgeArticle.count({ where: { status: "Published", body_km: { not: null }, km_reviewed: false } }),
  ]);
  return {
    events: events.map((e) => ({
      name: e.name,
      date: day(e.date),
      status: e.status,
      kkf_comment: e.kkf_comment,
      admin_url: admin.event(e.id),
    })),
    news_drafts: { admin_url: admin.news, items: news.map((n) => ({ title: n.title, category: n.category, last_edited: day(n.updated_at) })) },
    video_drafts: { admin_url: admin.videos, items: videos.map((v) => ({ title: v.title, category: v.category, last_edited: day(v.updated_at) })) },
    knowledge_drafts: {
      admin_url: admin.knowledge,
      note: "Only a Super Admin can publish knowledge articles.",
      items: knowledge.map((k) => ({ title: k.title_en, category: k.category, last_edited: day(k.updated_at) })),
      published_with_khmer_not_reviewed: kmReview,
    },
  };
}

async function findRecords({ query, type }: ToolInput) {
  const q = String(query ?? "").trim();
  if (!q) return { error: "query is required" };
  const want = (t: string) => !type || type === "all" || type === t;
  const byId = UUID_RE.test(q);
  const [fighters, clubs, events] = await Promise.all([
    want("fighter")
      ? prisma.fighter.findMany({
          where: {
            ...NOT_DELETED,
            ...(byId
              ? { id: q }
              : { OR: [{ name: { contains: q, mode: "insensitive" } }, { name_khmer: { contains: q } }, { alias: { contains: q, mode: "insensitive" } }] }),
          },
          select: staffFighterSelect,
          orderBy: { name: "asc" },
          take: 10,
        })
      : [],
    want("club")
      ? prisma.club.findMany({
          where: byId ? { id: q } : { OR: [{ name: { contains: q, mode: "insensitive" } }, { name_khmer: { contains: q } }] },
          select: { id: true, name: true, name_khmer: true, location: true, status: true, _count: { select: { fighters: { where: NOT_DELETED } } } },
          orderBy: { name: "asc" },
          take: 10,
        })
      : [],
    want("event")
      ? prisma.event.findMany({
          where: byId ? { id: q } : { name: { contains: q, mode: "insensitive" } },
          select: { id: true, name: true, date: true, location: true, status: true },
          orderBy: { date: "desc" },
          take: 10,
        })
      : [],
  ]);
  return {
    fighters: fighters.map(fighterItem),
    clubs: clubs.map((c) => ({ name: c.name, name_khmer: c.name_khmer, location: c.location, status: c.status, fighters: c._count.fighters, admin_url: admin.club(c.id) })),
    events: events.map((e) => ({ name: e.name, date: day(e.date), venue: e.location, status: e.status, admin_url: admin.event(e.id) })),
  };
}

const HANDLERS: Record<string, (input: ToolInput) => Promise<unknown>> = {
  pending_approvals: pendingApprovals,
  data_quality: dataQuality,
  drafts,
  find_records: findRecords,
};

/** Staff tools first, then the public ones (stable order: part of the cached prompt prefix). */
export const ALL_STAFF_TOOLS: Anthropic.Beta.BetaTool[] = [...STAFF_TOOLS, ...TOOLS];

/** Drops the fan-site links from a public tool's result so answers only link inside the admin. */
function withoutPublicLinks(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(withoutPublicLinks);
  if (value && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value).filter(([k]) => k !== "url" && k !== "event_url").map(([k, v]) => [k, withoutPublicLinks(v)]),
    );
  }
  return value;
}

export async function runStaffTool(name: string, input: unknown): Promise<{ content: string; isError: boolean }> {
  const handler = HANDLERS[name];
  if (!handler) {
    const r = await runTool(name, input);
    if (r.isError) return r;
    return { content: JSON.stringify(withoutPublicLinks(JSON.parse(r.content))), isError: false };
  }
  try {
    return { content: JSON.stringify(await handler((input ?? {}) as ToolInput)), isError: false };
  } catch {
    return { content: JSON.stringify({ error: "The records could not be read right now." }), isError: true };
  }
}
