/**
 * KUNKHMER HUB (formerly "Ask Kun Khmer") — public AI chat that answers from federation records through read-only tools,
 * plus the admin staff assistant (Phase D2, KKF staff only) with extra read-only staff tools.
 * Phase D3: a signed-in fan's token (optional) lets the public Hub answer about the fighters they
 * follow (my_followed_fighters); only a signed-in yes/no flag is logged, never the fan.
 * Stateless: the browser sends the recent conversation (text only) with every request.
 * See claude/features/ai-assistant.md and claude/updates/hub-phase-d2-staff-assistant.md.
 */
import Anthropic from "@anthropic-ai/sdk";
import type { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import { config } from "../../config.ts";
import { prisma } from "../../db.ts";
import { STAFF, requireAuth, requireRole } from "../../lib/auth.ts";
import { iso, now } from "../../lib/dates.ts";
import { HttpError, isUuid, notFound, ok } from "../../lib/http.ts";
import { knowledge } from "../knowledge/hub.ts";
import { ALL_STAFF_TOOLS, runStaffTool } from "./staffTools.ts";
import { FAN_TOOL, myFollowedFighters, runTool, TOOLS } from "./tools.ts";
import { resolveFan } from "../../lib/fanAuth.ts";
import { type Tokens, STAFF_RATE_LIMIT, capReached, logAnswer, monthSpend, noTokens, rateLimit } from "./usage.ts";

const MAX_MESSAGES = 12;
const MAX_CHARS = 1500;
const MAX_TOOL_ROUNDS = 6;

const SYSTEM = `You are KUNKHMER HUB, the assistant on the official website of the Kun Khmer Federation (KKF), Cambodia.
You help fans and newcomers from around the world with Kun Khmer: fighters, fight nights, fight cards, results, champions, clubs, news, videos, the federation's weight classes and bout rules, the federation itself (leadership, contacts, how to register, official documents), and the basics of the sport.

Rules:
- Facts about fighters, events, results and champions must come from your tools, which read the federation's official records. Never guess or invent names, records, dates, results or statistics. If the tools return nothing, say the records don't show it.
- Link to the real page when you mention a fighter or event, using the "url" field as a relative Markdown link with a readable label, e.g. [Pich Sambath](/fighters/pich-sambath). Never show a bare path as the link text.
- Reply only in Khmer (ខ្មែរ) or English: Khmer when the user's latest message is in Khmer, otherwise English (also when they write in another language). If a message has no clear language, follow the site language hint. Use the fighter's Khmer name when replying in Khmer if it's available.
- Keep answers short and friendly: a few sentences or a short list. Red corner is listed first, blue corner second.
- Never mention internal statuses (Draft, Published, workflow states) or system accounts.
- Don't give betting tips or predictions presented as fact; you may compare records and say it's not a prediction.
- A fighter's record is the official profile W-L-D. Figures from fighter_stats and head_to_head count only bouts recorded on this website; say so when you quote them.
- No leaderboards: the federation doesn't publish rankings, so politely decline "who has the most wins / best record / longest streak / is the best" and offer stats for a fighter the user names, or a head-to-head, instead.
- If a tool says several fighters or clubs match, list them briefly and ask which one the user means; never pick one yourself.
- Questions about "my fighters" / "fighters I follow": call my_followed_fighters. Answer only about those fighters and never ask for or mention the visitor's name, email or account. If it says the visitor isn't signed in or follows no one, pass on its note briefly.
- Questions about the Kun Khmer Federation itself (who leads it, its mission and history, when it was founded, contacting the office, how fighters, clubs, referees or judges register, the rule book and forms): call about_federation. It is the official source for these; answer from it and link to [About the Federation](/federation) or to the document's PDF. If it says nothing is published, or doesn't cover the question, say the federation hasn't published that on the website yet. Never guess leaders' names, phone numbers, emails, addresses or fees.
- For topics unrelated to Kun Khmer, politely say you can only help with Kun Khmer.
- Don't narrate your lookups (no "let me check"); write only the answer.
- Questions about the sport itself (history, organisations, famous fighters of the past, rules, techniques, Kun Kru, music, terms, watching and visiting) are answered from the federation knowledge base at the end of these instructions (when only an index of titles is shown there, read the articles you need with search_knowledge first). If it doesn't, give a brief general answer from the background below and say the federation hasn't published more detail on it. Never invent dates, names or numbers.
- The origins of Kun Khmer compared with Muay Thai or other regional styles, and the SEA Games naming question: answer only from a knowledge base article on that topic. Without one, give a short, neutral, respectful answer (Kun Khmer is Cambodia's traditional martial art with roots in the Angkor era) and point to the [beginner's guide](/about); don't take sides or criticise any country.

Background on the sport (general knowledge from the site's beginner guide, not federation records):
- Kun Khmer is Cambodia's traditional combat sport, a stand-up striking art using punches, kicks, elbows and knees, plus the clinch. It was long known as Pradal Serey.
- Professional bouts are usually five rounds of three minutes. "Eight weapons": two fists, two elbows, two knees and two legs.
- A traditional ensemble plays live music throughout every fight. Before the bout fighters perform the Kun Kru, a ritual dance honouring their teachers.
- Fights end by knockout, referee stoppage or the judges' decision (effective strikes, control and aggression).
- A fighter's record is written W-L-D (wins, losses, draws). The site has a [beginner's guide](/about) and a list of [fight nights](/matches?tab=events).`;

const KNOWLEDGE_INTRO = `# Federation knowledge base
Articles approved by the Kun Khmer Federation. Use them for questions about the sport; summarise in your own words and keep answers short. Fighter, event, result and champion facts still come only from your tools.`;

const KNOWLEDGE_INDEX_INTRO = `# Federation knowledge base (index)
Articles approved by the Kun Khmer Federation, listed by slug and title. For a question about the sport, call search_knowledge with the user's topic (or with a slug from this list) and answer from the articles it returns, in your own words. Fighter, event, result and champion facts still come only from your other tools.`;

const STAFF_SYSTEM = `You are the KUNKHMER HUB staff assistant inside the admin system of the Kun Khmer Federation (KKF), Cambodia.
You help KKF staff (Super Admins and KKF Officers) find work and data problems: fighters to verify, events to approve, match proposals, past fight cards without results, missing fighter details, likely duplicate fighters, bouts without officials, drafts, and facts about fighters, events, clubs and results.

Rules:
- You are read-only. You can't verify, approve, edit, publish or delete anything. When something needs doing, say what and link to the admin page where staff do it.
- Every fact must come from your tools. Never guess or invent names, counts, dates or results. If the tools return nothing, say so.
- Link with the "admin_url" (or "record_result_url" / "assign_officials_url") field as a relative Markdown link with a readable label, e.g. [Sok Dara](/home/fighters/…). Never show a bare path as the link text, and never write links to other paths.
- The public tools (search_fighters, get_fighter, fighter_stats, get_event, …) only see verified fighters and published events. For unverified fighters or draft events use find_records, pending_approvals or drafts.
- You don't have fighters' contact details, dates of birth, addresses, medical or disciplinary information. If asked, say staff can see them on the fighter's admin page.
- Likely duplicates are only possibilities: tell staff to compare the profiles before merging or deleting.
- Reply in Khmer (ខ្មែរ) when the user's latest message is in Khmer, otherwise in English.
- Be brief and practical: counts first, then a short list (at most about 10 items; say how many more there are). Don't narrate your lookups.
- For questions unrelated to the federation's work or Kun Khmer, say you can only help with KKF records.`;

const REFUSED = {
  en: "Sorry, I can't help with that. Ask me about Kun Khmer fighters, fight nights, results or the rules.",
  km: "សូមអភ័យទោស ខ្ញុំមិនអាចជួយរឿងនេះបានទេ។ សូមសួរខ្ញុំអំពីកីឡាករ រាត្រីប្រកួត លទ្ធផល ឬច្បាប់គុនខ្មែរ។",
};
const TOO_LONG = {
  en: "That took too many steps. Please ask a shorter, more specific question.",
  km: "សំណួរនេះត្រូវការជំហានច្រើនពេក។ សូមសួរសំណួរខ្លី និងច្បាស់ជាងនេះ។",
};

// ─── Input ──────────────────────────────────────────────────────────────────

function parseHistory(body: any): Anthropic.Beta.BetaMessageParam[] {
  const raw = body?.messages;
  if (!Array.isArray(raw) || raw.length === 0) throw new HttpError(422, "The messages field is required");
  if (raw.length > MAX_MESSAGES) throw new HttpError(422, `Send at most ${MAX_MESSAGES} messages`);
  const messages = raw.map((m: any, i: number) => {
    const role = m?.role;
    const content = typeof m?.content === "string" ? m.content : "";
    if ((role !== "user" && role !== "assistant") || !content) {
      throw new HttpError(422, "Each message needs a role (user or assistant) and text content");
    }
    if (content.length > MAX_CHARS) throw new HttpError(422, `Messages must be at most ${MAX_CHARS} characters`);
    if (role !== (i % 2 === 0 ? "user" : "assistant")) {
      throw new HttpError(422, "Messages must alternate, starting and ending with the user");
    }
    return { role, content } as Anthropic.Beta.BetaMessageParam;
  });
  if (messages[messages.length - 1].role !== "user") {
    throw new HttpError(422, "Messages must alternate, starting and ending with the user");
  }
  return messages;
}

// ─── Chat loop ──────────────────────────────────────────────────────────────

let client: Anthropic | null = null;
const anthropic = () => (client ??= new Anthropic({ apiKey: config.ai.apiKey }));

const CAPPED = {
  en: "KUNKHMER HUB is resting until next month — it has answered all the questions it can this month. Please check the fighter and event pages in the meantime.",
  km: "KUNKHMER HUB កំពុងសម្រាកដល់ខែក្រោយ ព្រោះបានឆ្លើយសំណួរអស់ចំនួនសម្រាប់ខែនេះហើយ។ សូមមើលទំព័រកីឡាករ និងព្រឹត្តិការណ៍ជាបណ្ដោះអាសន្ន។",
};

/** Who the model loop is answering: fans on the public site or KKF staff in the admin. */
/** Per-request facts the tools may use but the model never sees directly. */
interface Context {
  /** Signed-in fan (public Hub only), for my_followed_fighters. */
  fanId: string | null;
}

interface Profile {
  source: "public" | "staff";
  tools: Anthropic.Beta.BetaTool[];
  run: (name: string, input: unknown, ctx: Context) => Promise<{ content: string; isError: boolean }>;
  system: () => Promise<string>;
}

const PUBLIC: Profile = {
  source: "public",
  tools: [...TOOLS, FAN_TOOL],
  run: async (name, input, ctx) => {
    if (name !== FAN_TOOL.name) return runTool(name, input);
    try {
      return { content: JSON.stringify(await myFollowedFighters(ctx.fanId)), isError: false };
    } catch {
      return { content: JSON.stringify({ error: "The records could not be read right now." }), isError: true };
    }
  },
  system: async () => {
    const kb = await knowledge();
    const knowledgeBlock =
      kb.mode === "inline" ? `\n\n${KNOWLEDGE_INTRO}\n\n${kb.prompt}` : kb.mode === "index" ? `\n\n${KNOWLEDGE_INDEX_INTRO}\n\n${kb.prompt}` : "";
    return `${SYSTEM}${knowledgeBlock}`;
  },
};

const STAFF_PROFILE: Profile = {
  source: "staff",
  tools: ALL_STAFF_TOOLS,
  run: (name, input) => runStaffTool(name, input),
  system: async () => STAFF_SYSTEM,
};

const STAFF_CAPPED = {
  en: "KUNKHMER HUB has reached this month's spending cap, so the staff assistant is paused until next month. A Super Admin can raise AI_MONTHLY_CAP_USD.",
  km: "KUNKHMER HUB បានដល់ដែនកំណត់ចំណាយប្រចាំខែហើយ ដូច្នេះជំនួយការបុគ្គលិកត្រូវផ្អាកដល់ខែក្រោយ។ Super Admin អាចបង្កើន AI_MONTHLY_CAP_USD បាន។",
};

interface Answer {
  text: string;
  outcome: "answered" | "refused" | "too_long";
  tools: string[];
  model: string;
  tokens: Tokens;
}

/**
 * Runs the tool loop. With `stream`, text is passed on as it's written; `onReset` fires when a
 * round turns out to be a tool call, so the client drops text that wasn't the final answer.
 */
async function answer(
  profile: Profile,
  history: Anthropic.Beta.BetaMessageParam[],
  lang: "en" | "km",
  ctx: Context,
  stream?: { onDelta: (text: string) => void; onReset: () => void },
): Promise<Answer> {
  const messages = [...history];
  const system: Anthropic.Beta.BetaTextBlockParam[] = [
    // Stable prefix (tools + this block) is cached; the date and language hint come after it.
    // The public knowledge text only changes when a Super Admin publishes or edits an article.
    { type: "text", text: await profile.system(), cache_control: { type: "ephemeral" } },
    { type: "text", text: `Today's date: ${new Date().toISOString().slice(0, 10)}. Site language: ${lang === "km" ? "Khmer" : "English"}.` },
  ];
  const tools: string[] = [];
  const tokens = noTokens();
  let model = config.ai.model;
  const done = (text: string, outcome: Answer["outcome"]): Answer => ({ text, outcome, tools, model, tokens });

  for (let round = 0; round < MAX_TOOL_ROUNDS; round++) {
    const params = {
      model: config.ai.model,
      max_tokens: 8000,
      system,
      tools: profile.tools,
      messages,
      output_config: { effort: "low" as const },
      betas: ["server-side-fallback-2026-07-01"],
      fallbacks: "default" as const,
    };
    let emitted = false;
    let response: Anthropic.Beta.BetaMessage;
    if (stream) {
      const s = anthropic().beta.messages.stream(params);
      s.on("text", (delta) => {
        emitted = true;
        stream.onDelta(delta);
      });
      response = await s.finalMessage();
    } else {
      response = await anthropic().beta.messages.create(params);
    }

    model = response.model || model;
    tokens.input += response.usage.input_tokens ?? 0;
    tokens.output += response.usage.output_tokens ?? 0;
    tokens.cacheRead += response.usage.cache_read_input_tokens ?? 0;
    tokens.cacheWrite += response.usage.cache_creation_input_tokens ?? 0;

    if (response.stop_reason === "refusal") {
      if (emitted) stream?.onReset();
      return done(REFUSED[lang], "refused");
    }
    if (response.stop_reason === "pause_turn") {
      if (emitted) stream?.onReset();
      messages.push({ role: "assistant", content: response.content });
      continue;
    }

    const toolUses = response.content.filter((b): b is Anthropic.Beta.BetaToolUseBlock => b.type === "tool_use");
    if (response.stop_reason !== "tool_use" || toolUses.length === 0) {
      const text = response.content
        .filter((b): b is Anthropic.Beta.BetaTextBlock => b.type === "text")
        .map((b) => b.text)
        .join("")
        .trim();
      return text ? done(text, "answered") : done(REFUSED[lang], "refused");
    }

    if (emitted) stream?.onReset();
    tools.push(...toolUses.map((t) => t.name));
    messages.push({ role: "assistant", content: response.content });
    const results = await Promise.all(
      toolUses.map(async (t): Promise<Anthropic.Beta.BetaToolResultBlockParam> => {
        const r = await profile.run(t.name, t.input, ctx);
        return { type: "tool_result", tool_use_id: t.id, content: r.content, is_error: r.isError };
      }),
    );
    messages.push({ role: "user", content: results });
  }
  return done(TOO_LONG[lang], "too_long");
}

// ─── Request handling ───────────────────────────────────────────────────────

interface Prepared {
  history: Anthropic.Beta.BetaMessageParam[];
  lang: "en" | "km";
  question: string;
  conversationId: string | null;
  source: "public" | "staff";
  userId: string | null;
  /** Public Hub: a signed-in fan asked (logged as a yes/no flag only). */
  signedIn: boolean;
  /** Kept in memory for the tools; never logged. */
  ctx: Context;
}

/**
 * Validation, rate limit and spend cap — everything that happens before a model call.
 * Fans are limited per IP; staff per account (30 / 10 min). Both share the monthly cap.
 */
async function prepare(request: FastifyRequest, profile: Profile): Promise<Prepared> {
  if (!config.ai.enabled) throw new HttpError(503, "The AI assistant is not configured.");
  const body = request.body as any;
  const history = parseHistory(body);
  const lang = body?.lang === "km" ? "km" : "en";
  const rawConversation = typeof body?.conversationId === "string" ? body.conversationId : null;
  const conversationId = rawConversation && /^[A-Za-z0-9-]{8,64}$/.test(rawConversation) ? rawConversation : null;
  const question = String(history[history.length - 1].content);
  const source = profile.source;
  const userId = source === "staff" ? (request.user?.id ?? null) : null;
  // A fan token is optional on the public Hub; staff tokens are ignored by resolveFan.
  if (source === "public") await resolveFan(request);
  const fanId = source === "public" ? (request.fan?.id ?? null) : null;
  const signedIn = Boolean(fanId);
  if (source === "staff") await rateLimit(`staff:${userId}`, STAFF_RATE_LIMIT);
  else await rateLimit(request.ip);
  if (await capReached()) {
    const message = source === "staff" ? STAFF_CAPPED[lang] : CAPPED[lang];
    await logAnswer({ conversationId, lang, question, answer: message, outcome: "capped", tools: [], model: config.ai.model, tokens: noTokens(), durationMs: 0, source, userId, signedIn });
    throw new HttpError(503, message);
  }
  return { history, lang, question, conversationId, source, userId, signedIn, ctx: { fanId } };
}

function apiErrorMessage(error: unknown, request: FastifyRequest): HttpError | null {
  if (error instanceof Anthropic.RateLimitError) return new HttpError(429, "The assistant is busy. Please try again in a minute.");
  if (error instanceof Anthropic.APIError) {
    request.log.error({ status: error.status, type: error.name }, "AI request failed");
    return new HttpError(502, "The assistant is unavailable right now. Please try again later.");
  }
  return null;
}

const LOG_PAGE = 50;

export default async function aiRoutes(app: FastifyInstance) {
  app.get("/ai/status", async (_request, reply) => ok(reply, { enabled: config.ai.enabled }));

  const chat = (profile: Profile) => async (request: FastifyRequest, reply: FastifyReply) => {
    const p = await prepare(request, profile);
    const started = Date.now();
    try {
      const a = await answer(profile, p.history, p.lang, p.ctx);
      const logId = await logAnswer({ ...p, answer: a.text, outcome: a.outcome, tools: a.tools, model: a.model, tokens: a.tokens, durationMs: Date.now() - started });
      return ok(reply, { reply: a.text, logId });
    } catch (error) {
      const http = apiErrorMessage(error, request);
      if (!http) throw error;
      await logAnswer({ ...p, answer: http.message, outcome: "error", tools: [], model: config.ai.model, tokens: noTokens(), durationMs: Date.now() - started });
      throw http;
    }
  };

  /**
   * Same as chat, streamed as Server-Sent Events:
   *   delta {text}  — more of the answer; reset — discard text so far; done {reply, logId}; error {message}.
   * Errors before the first byte (validation, rate limit, cap) are normal JSON errors.
   */
  const chatStream = (profile: Profile) => async (request: FastifyRequest, reply: FastifyReply) => {
    const p = await prepare(request, profile);
    const started = Date.now();
    reply.hijack();
    reply.raw.writeHead(200, {
      "Content-Type": "text/event-stream; charset=utf-8",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
      "X-Accel-Buffering": "no",
    });
    const send = (event: string, data: unknown) => reply.raw.write(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`);
    try {
      const a = await answer(profile, p.history, p.lang, p.ctx, { onDelta: (text) => send("delta", { text }), onReset: () => send("reset", {}) });
      const logId = await logAnswer({ ...p, answer: a.text, outcome: a.outcome, tools: a.tools, model: a.model, tokens: a.tokens, durationMs: Date.now() - started });
      send("done", { reply: a.text, logId });
    } catch (error) {
      const http = apiErrorMessage(error, request) ?? new HttpError(500, "Something went wrong. Please try again.");
      if (!(error instanceof Anthropic.APIError)) request.log.error({ err: error }, "Hub stream failed");
      await logAnswer({ ...p, answer: http.message, outcome: "error", tools: [], model: config.ai.model, tokens: noTokens(), durationMs: Date.now() - started }).catch(() => {});
      send("error", { message: http.message });
    } finally {
      reply.raw.end();
    }
  };

  app.post("/ai/chat", chat(PUBLIC));
  app.post("/ai/chat/stream", chatStream(PUBLIC));

  /** 👍 / 👎 on an answer. Anyone who got the answer's id can rate it; the latest rating wins. */
  app.post("/ai/feedback", async (request, reply) => {
    const body = request.body as any;
    const id = typeof body?.logId === "string" ? body.logId : "";
    const rating = Number(body?.rating);
    if (rating !== 1 && rating !== -1) throw new HttpError(422, "The rating must be 1 or -1");
    if (!isUuid(id)) throw notFound("Answer");
    const updated = await prisma.hubLog.updateMany({ where: { id }, data: { feedback: rating, feedback_at: now() } });
    if (!updated.count) throw notFound("Answer");
    return ok(reply, { logId: id, rating });
  });

  app.register(async (staffRoutes) => {
    staffRoutes.addHook("preHandler", requireAuth);

    /** Staff assistant (Phase D2): KKF staff only, read-only staff tools, logged with who asked. */
    const staffOnly = async (request: FastifyRequest) => {
      requireRole(request, STAFF);
    };
    staffRoutes.post("/ai/staff/chat", { preHandler: staffOnly }, chat(STAFF_PROFILE));
    staffRoutes.post("/ai/staff/chat/stream", { preHandler: staffOnly }, chatStream(STAFF_PROFILE));

    /** This month's usage for the admin review page. */
    staffRoutes.get("/ai/usage", async (request, reply) => {
      requireRole(request, STAFF);
      const d = new Date();
      const since = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), 1));
      const where = { created_at: { gte: since } };
      const [spend, publicSpend, staffSpend, total, byOutcome, helpful, notHelpful, signedIn] = await Promise.all([
        monthSpend(),
        monthSpend("public"),
        monthSpend("staff"),
        prisma.hubLog.count({ where }),
        prisma.hubLog.groupBy({ by: ["outcome"], where, _count: { _all: true } }),
        prisma.hubLog.count({ where: { ...where, feedback: 1 } }),
        prisma.hubLog.count({ where: { ...where, feedback: -1 } }),
        prisma.hubLog.count({ where: { ...where, signed_in: true } }),
      ]);
      return ok(reply, {
        month: since.toISOString().slice(0, 7),
        spendUsd: Number(spend.toFixed(4)),
        publicSpendUsd: Number(publicSpend.toFixed(4)),
        staffSpendUsd: Number(staffSpend.toFixed(4)),
        capUsd: config.ai.monthlyCapUsd,
        capped: spend >= config.ai.monthlyCapUsd,
        questions: total,
        outcomes: Object.fromEntries(byOutcome.map((o) => [o.outcome, o._count._all])),
        helpful,
        notHelpful,
        signedInQuestions: signedIn,
        enabled: config.ai.enabled,
      });
    });

    /** Logged answers, newest first. ?feedback=down|up, ?outcome=answered|refused|too_long|error|capped, ?source=public|staff, ?page=1. */
    staffRoutes.get("/ai/logs", async (request, reply) => {
      requireRole(request, STAFF);
      const q = request.query as { feedback?: string; outcome?: string; source?: string; page?: string };
      const where: Record<string, unknown> = {};
      if (q.feedback === "down") where.feedback = -1;
      if (q.feedback === "up") where.feedback = 1;
      if (q.outcome) where.outcome = q.outcome;
      if (q.source === "public" || q.source === "staff") where.source = q.source;
      const page = Math.max(1, Number(q.page) || 1);
      const [rows, total] = await Promise.all([
        prisma.hubLog.findMany({
          where,
          include: { user: { select: { id: true, full_name: true } } },
          orderBy: { created_at: "desc" },
          skip: (page - 1) * LOG_PAGE,
          take: LOG_PAGE,
        }),
        prisma.hubLog.count({ where }),
      ]);
      return ok(reply, {
        page,
        pageSize: LOG_PAGE,
        total,
        items: rows.map((r) => ({
          id: r.id,
          createdAt: iso(r.created_at),
          conversationId: r.conversation_id,
          lang: r.lang,
          question: r.question,
          answer: r.answer,
          outcome: r.outcome,
          tools: r.tools,
          model: r.model,
          tokens: { input: r.input_tokens, output: r.output_tokens, cacheRead: r.cache_read_tokens, cacheWrite: r.cache_write_tokens },
          costUsd: Number(r.cost_usd),
          durationMs: r.duration_ms,
          feedback: r.feedback,
          source: r.source,
          askedBy: r.user ? { id: r.user.id, name: r.user.full_name } : null,
          signedIn: r.signed_in,
        })),
      });
    });
  });
}
