# Feature: Kun Khmer AI assistant (plan)

| | |
|---|---|
| **Status** | Demo built (2026-09-26): "Ask Kun Khmer" chat, needs an API key to run. Rest of the plan follows `features/statistics.md` |
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

## Demo: "Ask Kun Khmer" chat (built 2026-09-26, ahead of statistics at the owner's request)

**Turn it on**: put `ANTHROPIC_API_KEY=...` in `backend/.env` (never committed),
then `docker restart kunkhmer_backend`. Without a key `GET /api/ai/status` says
`enabled: false` and `POST /api/ai/chat` returns 503; production builds hide the chat button, development builds show it with a "not set up yet" notice (input disabled).
`AI_ENABLED=false` forces it off (the test API sets this); `AI_MODEL`
(default `claude-opus-5`) and `AI_RATE_LIMIT` (default 20 per IP per 10 min). The IP is the visitor's real one
through our proxy (`lib/clientIp.ts`, `TRUST_PROXY`; see `updates/rate-limit-real-client-ip.md`);
the counter is in memory, so it resets on restart and isn't shared between API instances.

| Part | Where |
|---|---|
| API | `backend/src/modules/ai/routes.ts` — `GET /api/ai/status` → `{ enabled }`; `POST /api/ai/chat` `{ messages: [{role, content}], lang }` → `{ reply }` (public, no auth). Max 12 messages, 1500 chars each, alternating and ending with the user; 422 otherwise. 503 when off, 429 over the rate limit, 502 when the model API fails. |
| Tools | `backend/src/modules/ai/tools.ts` — read-only Prisma queries: `search_fighters`, `get_fighter`, `list_events`, `get_event`, `latest_results`, `list_champions`. Public data only (no deleted fighters, no Draft events, no contact fields); every item has a site `url`. |
| Model call | Anthropic TypeScript SDK (`@anthropic-ai/sdk`), manual tool loop (max 6 rounds), `effort: "low"`, system prompt + tools cached (`cache_control`), date/language hint after the cache breakpoint, `fallbacks: "default"` (beta `server-side-fallback-2026-07-01`) so a safety decline is retried on another model; a final refusal returns a polite fixed message. |
| UI | `frontend/public/src/app/components/ai/AskKunKhmer.tsx` — floating button + chat panel (bottom sheet on phones), suggestion chips, tiny Markdown (links, bold, bullets), "AI-generated" disclaimer; rendered next to `SiteFooter` so it's on every page. Strings `ai.*` in EN + KM. |
| Tests | `api-tests/tests/ai.test.ts` pins status + 503 contract (the test API never calls the model). |

Not yet done for public launch: login rate limiting, a daily spend cap,
monitoring of answers, federation review of Khmer replies.
