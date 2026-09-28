/**
 * KUNKHMER HUB (formerly "Ask Kun Khmer") — public AI chat that answers from federation records through read-only tools.
 * Stateless: the browser sends the recent conversation (text only) with every request.
 * See claude/features/ai-assistant.md.
 */
import Anthropic from "@anthropic-ai/sdk";
import type { FastifyInstance } from "fastify";
import { config } from "../../config.ts";
import { HttpError, ok } from "../../lib/http.ts";
import { runTool, TOOLS } from "./tools.ts";

const MAX_MESSAGES = 12;
const MAX_CHARS = 1500;
const MAX_TOOL_ROUNDS = 6;

const SYSTEM = `You are KUNKHMER HUB, the assistant on the official website of the Kun Khmer Federation (KKF), Cambodia.
You help fans and newcomers from around the world with Kun Khmer: fighters, fight nights, fight cards, results, champions and the basics of the sport.

Rules:
- Facts about fighters, events, results and champions must come from your tools, which read the federation's official records. Never guess or invent names, records, dates, results or statistics. If the tools return nothing, say the records don't show it.
- Link to the real page when you mention a fighter or event, using the "url" field as a relative Markdown link with a readable label, e.g. [Pich Sambath](/fighters/pich-sambath). Never show a bare path as the link text.
- Reply only in Khmer (ខ្មែរ) or English: Khmer when the user's latest message is in Khmer, otherwise English (also when they write in another language). If a message has no clear language, follow the site language hint. Use the fighter's Khmer name when replying in Khmer if it's available.
- Keep answers short and friendly: a few sentences or a short list. Red corner is listed first, blue corner second.
- Never mention internal statuses (Draft, Published, workflow states) or system accounts.
- Don't give betting tips or predictions presented as fact; you may compare records and say it's not a prediction.
- For topics unrelated to Kun Khmer, politely say you can only help with Kun Khmer.

Background on the sport (general knowledge from the site's beginner guide, not federation records):
- Kun Khmer is Cambodia's traditional combat sport, a stand-up striking art using punches, kicks, elbows and knees, plus the clinch. It was long known as Pradal Serey.
- Professional bouts are usually five rounds of three minutes. "Eight weapons": two fists, two elbows, two knees and two legs.
- A traditional ensemble plays live music throughout every fight. Before the bout fighters perform the Kun Kru, a ritual dance honouring their teachers.
- Fights end by knockout, referee stoppage or the judges' decision (effective strikes, control and aggression).
- A fighter's record is written W-L-D (wins, losses, draws). The site has a [beginner's guide](/about) and a list of [fight nights](/matches?tab=events).`;

const REFUSED = {
  en: "Sorry, I can't help with that. Ask me about Kun Khmer fighters, fight nights, results or the rules.",
  km: "សូមអភ័យទោស ខ្ញុំមិនអាចជួយរឿងនេះបានទេ។ សូមសួរខ្ញុំអំពីកីឡាករ រាត្រីប្រកួត លទ្ធផល ឬច្បាប់គុនខ្មែរ។",
};
const TOO_LONG = {
  en: "That took too many steps. Please ask a shorter, more specific question.",
  km: "សំណួរនេះត្រូវការជំហានច្រើនពេក។ សូមសួរសំណួរខ្លី និងច្បាស់ជាងនេះ។",
};

// ─── Per-IP rate limit (in memory, single API instance) ─────────────────────

const WINDOW_MS = 10 * 60_000;
const hits = new Map<string, { count: number; resetAt: number }>();

function rateLimit(ip: string) {
  const t = Date.now();
  const entry = hits.get(ip);
  if (!entry || entry.resetAt < t) {
    hits.set(ip, { count: 1, resetAt: t + WINDOW_MS });
    if (hits.size > 10_000) for (const [k, v] of hits) if (v.resetAt < t) hits.delete(k);
    return;
  }
  if (++entry.count > config.ai.rateLimit) {
    throw new HttpError(429, "Too many questions. Please wait a few minutes and try again.");
  }
}

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

async function answer(history: Anthropic.Beta.BetaMessageParam[], lang: "en" | "km"): Promise<string> {
  const messages = [...history];
  const system: Anthropic.Beta.BetaTextBlockParam[] = [
    // Stable prefix (tools + this block) is cached; the date and language hint come after it.
    { type: "text", text: SYSTEM, cache_control: { type: "ephemeral" } },
    { type: "text", text: `Today's date: ${new Date().toISOString().slice(0, 10)}. Site language: ${lang === "km" ? "Khmer" : "English"}.` },
  ];

  for (let round = 0; round < MAX_TOOL_ROUNDS; round++) {
    const response = await anthropic().beta.messages.create({
      model: config.ai.model,
      max_tokens: 8000,
      system,
      tools: TOOLS,
      messages,
      output_config: { effort: "low" },
      betas: ["server-side-fallback-2026-07-01"],
      fallbacks: "default",
    });

    if (response.stop_reason === "refusal") return REFUSED[lang];
    if (response.stop_reason === "pause_turn") {
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
      return text || REFUSED[lang];
    }

    messages.push({ role: "assistant", content: response.content });
    const results = await Promise.all(
      toolUses.map(async (t): Promise<Anthropic.Beta.BetaToolResultBlockParam> => {
        const r = await runTool(t.name, t.input);
        return { type: "tool_result", tool_use_id: t.id, content: r.content, is_error: r.isError };
      }),
    );
    messages.push({ role: "user", content: results });
  }
  return TOO_LONG[lang];
}

export default async function aiRoutes(app: FastifyInstance) {
  app.get("/ai/status", async (_request, reply) => ok(reply, { enabled: config.ai.enabled }));

  app.post("/ai/chat", async (request, reply) => {
    if (!config.ai.enabled) throw new HttpError(503, "The AI assistant is not configured.");
    const history = parseHistory(request.body);
    const lang = (request.body as any)?.lang === "km" ? "km" : "en";
    rateLimit(request.ip);
    try {
      return ok(reply, { reply: await answer(history, lang) });
    } catch (error) {
      if (error instanceof Anthropic.RateLimitError) {
        throw new HttpError(429, "The assistant is busy. Please try again in a minute.");
      }
      if (error instanceof Anthropic.APIError) {
        request.log.error({ status: error.status, type: error.name }, "AI request failed");
        throw new HttpError(502, "The assistant is unavailable right now. Please try again later.");
      }
      throw error;
    }
  });
}
