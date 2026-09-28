# Feature: Kun Khmer AI assistant (plan)

| | |
|---|---|
| **Status** | Live on the public site as **KUNKHMER HUB** (`/hub`, 2026-09-28; was the "Ask Kun Khmer" corner chat), needs an API key to run. Rest of the plan follows `features/statistics.md` |
| **Jira** | TBD |
| **Figma** | TBD |
| **Owner** | vannak070 |

## Goal
Use an LLM (Claude, via the official Anthropic SDK) to save federation staff
time and help fans explore Kun Khmer — always answering from the federation's
real records, never from made-up facts.

## Principles (agreed 2026-09-26)
- **Grounded in data**: the model reads through read-only tools that call
  existing backend queries (fighters, events, bouts, results, rankings,
  statistics, About content). No invented records.
- **Server-side only**: new backend module `backend/src/modules/ai/`; the
  Anthropic API key lives in `backend/.env` (never committed, never in the browser).
- **Human in the loop**: the AI drafts or suggests; staff approve anything
  saved or published. AI text on the public site is labelled "AI-generated".
- **Bilingual**: English + Khmer; the federation reviews Khmer output.
- **Privacy**: only public federation data goes to the model — no fan account
  data or personal contact details.
- **Cost & abuse**: prompt caching for system prompt + tool definitions; rate
  limits and a daily spend cap on anything public.

## Phases
1. **Staff tools (low risk)**
   - News writer + translator: draft a fight-night results article (EN + KM)
     from recorded bouts; staff edit and publish.
   - Data-quality report: past events without results, fighters without
     photos, likely duplicates, missing weights (scheduled).
2. **Fan features**
   - "Ask Kun Khmer" chat on the public site (EN/KM), answering only via tools.
   - AI fight previews on event and compare pages (labelled AI).
3. **Later ideas**: result entry from a photographed scoresheet (vision);
   matchmaking suggestions by weight/record/grade (staff decide).

## Model and cost (Anthropic prices, per million tokens, input / output)
- Default: Claude Opus 5 (`claude-opus-5`) — $5 / $25.
- Cheaper options if measured quality holds: Claude Sonnet 5 (`claude-sonnet-5`)
  $2 / $10; Claude Haiku 4.5 (`claude-haiku-4-5`) $1 / $5. Model choice is the
  owner's decision after Phase 1 cost measurements.
- Rough estimate: a few US cents per fan question or article draft on Opus 5;
  measure real usage in Phase 1.

## Prerequisites
- Statistics feature done (clean, trustworthy aggregates for the tools).
- Anthropic API account + key (owner sets up).
- Login rate limiting (currently a known gap in `config.md`) before any public AI endpoint.

## Open questions
- Which Phase 1 tool first (recommended: news writer + translator)?
- Who approves AI drafts (KKF Officer, Super Admin)?
- Monthly budget cap?

## Next plan: KUNKHMER HUB as the core knowledge assistant (proposed 2026-09-28, not started)
Review findings (2026-09-28): tools cover only fighters, events, results and champions; the
sport background is ~6 bullets hard-coded in the prompt; `findFighter` picks the first
alphabetical substring match (ambiguous names / spellings can answer about the wrong
fighter); no streaming; no logging, feedback or spend cap; rate limiter in memory.
The shared-IP rate-limit bug found in the same review is fixed (`updates/rate-limit-real-client-ip.md`).

Proposed order C → A → B → D:
- **A. Knowledge base**: `knowledge_articles` (EN/KM title + body, category: history, rules,
  techniques, Kun Kru & music, glossary, regulations, FAQ; draft/published; source), admin
  editor with approval + Khmer review. While small (< ~50k tokens) put all published
  articles in the cached system prompt; switch to a `search_knowledge` tool when it grows.
  Optionally show them as public `/learn` pages.
- **B. Full data coverage**: tools for clubs, news, videos, weight classes / bout rules,
  statistics (head-to-head, win methods, streaks; share with `statistics.md`), venues;
  return candidates when a fighter name is ambiguous.
- **C. Hardening**: streaming answers; conversation log (question, tools, tokens, cost — no
  fan personal data) + 👍/👎 + admin review page; Postgres-backed rate limit + daily
  spend cap; ~50-question EN/KM eval set run before prompt/model changes.
- **D. Everywhere**: "Ask about this fighter/event" buttons, read-only staff assistant in
  the admin, optional personalised answers for signed-in fans (privacy rules apply).

Decided 2026-09-28: Hub is the site's main function (`/hub` + menu + home box); answers in
English/Khmer only; name "KUNKHMER HUB" in Latin letters in both languages.
Decided 2026-09-28 (owner):
- Knowledge = a **federation knowledge base** only (no live web search).
- Articles: KKF Officers and Super Admins write drafts; **only a Super Admin publishes**.
  EN + KM versions; Khmer marked "needs review" until approved.
- **$50/month spend cap**; questions and answers are **logged anonymously** (no IP, no fan
  account) for staff review and 👍/👎 feedback.
- Kun Khmer vs Muay Thai origins: answer only from an approved KKF article; until one
  exists, a short neutral answer pointing to the About page.
Building in phases, one at a time with owner review: **C** first (see
`updates/hub-phase-c-hardening.md`), then A, B, D.
**Phase B built 2026-09-28** (`updates/hub-phase-b-data-coverage.md`): clubs, news, videos,
weights/rules/venues, per-fighter stats and head-to-head tools; ambiguous names ask back.
**Phase D1 built 2026-09-28** (`updates/hub-phase-d-everywhere.md`): "Ask about this" cards with
ready-made questions on fighter, event, compare and article pages, opening `/hub?q=`. D2 (staff
assistant, KKF staff only, same $50 cap) and D3 (personalised fan answers) not started.
**Phase A built 2026-09-28** — see `features/knowledge-base.md`: `knowledge_articles`, admin
"Knowledge base" page, published articles appended to the cached Hub prompt; 9 starter drafts
(summarised from Wikipedia, unofficial until KKF reviews) wait for Super Admin publishing.

## KUNKHMER HUB chat (built 2026-09-26 as "Ask Kun Khmer"; made the site's main function 2026-09-28, see `updates/kunkhmer-hub.md`)

**Turn it on**: put `ANTHROPIC_API_KEY=...` in `backend/.env` (never committed),
then `docker restart kunkhmer_backend`. Without a key `GET /api/ai/status` says
`enabled: false` and `POST /api/ai/chat` returns 503; production builds hide the Hub menu item and home box and `/hub` says the Hub isn't available; development builds show a "not set up yet" notice (input disabled).
`AI_ENABLED=false` forces it off (the test API sets this); `AI_MODEL`
(default `claude-opus-5`), `AI_RATE_LIMIT` (default 20 per IP per 10 min) and
`AI_MONTHLY_CAP_USD` (default 50; the Hub pauses with a friendly message when this month's
estimated spend reaches it). The IP is the visitor's real one through our proxy
(`lib/clientIp.ts`, `TRUST_PROXY`); since Phase C the counter lives in Postgres
(`hub_rate_limits`, HMAC of the IP) so it survives restarts.

| Part | Where |
|---|---|
| API | `backend/src/modules/ai/routes.ts` — `GET /api/ai/status` → `{ enabled }`; `POST /api/ai/chat` `{ messages: [{role, content}], lang, conversationId? }` → `{ reply, logId }` (public, no auth); `POST /api/ai/chat/stream` same input, Server-Sent Events `delta {text}` / `reset` / `done {reply, logId}` / `error {message}`; `POST /api/ai/feedback {logId, rating: 1\|-1}` (public); `GET /api/ai/usage`, `GET /api/ai/logs?feedback=&outcome=&page=` (STAFF). Max 12 messages, 1500 chars each, alternating and ending with the user; 422 otherwise. 503 when off or when the monthly cap is reached, 429 over the rate limit, 502 when the model API fails. |
| Log & cap | `backend/src/modules/ai/usage.ts` — every answer (and refusal / error / cap) goes to `hub_logs` with question, answer, language, tools used, model, tokens, estimated cost and duration — **no IP, no fan account**; cost uses Anthropic list prices (cache reads 0.1×, writes 1.25× input). Cap = sum of this month's `cost_usd`. |
| Admin | `frontend/admin/src/app/pages/HubAnswers.tsx` at `/home/hub-answers` (menu "Hub answers", permission `hub.review`: KKF staff) — spend vs cap, questions, 👍/👎 counts, filterable list with answer, tools and cost. |
| Eval | `backend/src/scripts/hub-eval/` — 50 EN/KM questions + `run.ts` (rule checks: language, links, declines, no predictions / internal words). Paid: run only with owner approval (~$1–2); output `last-run.json` (git-ignored). |
| Knowledge | `backend/src/modules/knowledge/hub.ts` — published knowledge articles (Khmer wording only when reviewed) appended to the cached system prompt; rebuilt after publish / edit / delete. Prompt rules: sport questions from the knowledge base; origins / SEA Games naming only from an article, else a short neutral answer. See `features/knowledge-base.md`. |
| Tools | `backend/src/modules/ai/tools.ts` — read-only Prisma queries: `search_fighters`, `get_fighter`, `list_events`, `get_event`, `latest_results`, `list_champions`, and since Phase B (`updates/hub-phase-b-data-coverage.md`) `fighter_stats`, `head_to_head`, `search_clubs`, `get_club`, `list_news`, `get_news`, `list_videos`, `federation_settings`. Public data only (no deleted / unverified fighters, no Draft events, news or videos; clubs' public phone/email as on the club page); items carry a site `url`. Ambiguous fighter/club names return candidates. Stats are per fighter only — no leaderboards (owner decision); the profile W-L-D is the official record, bout stats cover bouts recorded on the site. |
| Model call | Anthropic TypeScript SDK (`@anthropic-ai/sdk`), manual tool loop (max 6 rounds), `effort: "low"`, system prompt + tools cached (`cache_control`), date/language hint after the cache breakpoint, `fallbacks: "default"` (beta `server-side-fallback-2026-07-01`) so a safety decline is retried on another model; a final refusal returns a polite fixed message. |
| UI | `pages/KunKhmerHub.tsx` — full page at `/hub` (menu: inside the "About Kun Khmer" dropdown since 2026-09-28): hero, big input, topic cards with sample questions, then the conversation with the input pinned to the bottom; `?q=<question>` is asked once on arrival. `components/hub/HubAskBox.tsx` — "Ask KUNKHMER HUB" box in the home hero, opens `/hub?q=`. `components/hub/HubAskAbout.tsx` — "Ask about this" card with 2–3 page-specific questions (fighter, event, compare, article pages; Phase D1), each a link to `/hub?q=`. `components/hub/useHubChat.ts` — chat state (kept per tab in sessionStorage, so following a link and coming back keeps the conversation), streaming via `api.ai.chatStream`, a random per-tab conversation id, 👍/👎 (`rate`), and the shared status check. Answers show as they're written; "Was this helpful?" under each finished answer. `HubMarkdown.tsx` — tiny Markdown (links, bold, bullets). "AI-generated" disclaimer. Answers in English or Khmer only (owner decision 2026-09-28). Strings `ai.*`, `hub.*`, `nav.hub` in EN + KM; the name "KUNKHMER HUB" stays in Latin letters in both. |
| Tests | `api-tests/tests/ai.test.ts` pins status + 503 contract (also for streaming), feedback validation, and staff-only usage / logs (the test API never calls the model). |

Not yet done for public launch: login rate limiting and federation review of Khmer replies.
(Spend cap, answer log and staff review arrived in Phase C.)
