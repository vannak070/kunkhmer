# Update: KUNKHMER HUB Phase C — hardening (logging, feedback, spend cap, streaming)

| | |
|---|---|
| **Status** | Done — committed with Phase A (2026-09-28) |
| **Jira** | n/a |
| **Feature** | claude/features/ai-assistant.md |
| **Requested by** | vannak070 |

## Current behavior
- `POST /api/ai/chat` answers and forgets: no record of questions, answers, tools used,
  tokens or cost; no way for fans to say an answer was wrong; no spending limit.
- Rate limit is an in-memory counter (resets on restart, not shared between instances).
- The answer appears only when it is complete (6–20 s of waiting).

## Requested change (owner decisions 2026-09-28)
1. **Anonymous log** (`hub_logs`): question, answer, language, tools used, model, tokens
   (input / output / cache read / cache write), cost in USD, duration, outcome
   (answered / refused / too long / error), optional random conversation id from the
   browser tab. **No IP address, no fan account, no personal data.**
2. **Feedback**: 👍 / 👎 under each answer → `POST /api/ai/feedback {logId, rating}`.
3. **Monthly spend cap** `AI_MONTHLY_CAP_USD` (default **50**): once this month's logged
   cost reaches it, the Hub answers with a friendly "resting until next month" message
   (HTTP 503) and staff see it on the review page.
4. **Rate limit in Postgres** (`hub_rate_limits`: SHA-256 hash of the IP + 10-minute
   window, purged as windows expire) so it survives restarts. The hash is used only for
   limiting and never joins the log.
5. **Streaming**: `POST /api/ai/chat/stream` (Server-Sent Events: `delta`, `done`, `error`);
   the Hub page shows the answer as it's written. `POST /api/ai/chat` stays for compatibility.
6. **Admin "Hub answers" page** (KKF staff): this month's spend vs cap, questions answered,
   👍/👎 counts, and the list of questions and answers (filters: 👎 only, outcome), with
   tools used and cost per answer. APIs `GET /api/ai/logs`, `GET /api/ai/usage` (STAFF).
7. **Eval set**: ~50 EN/KM test questions + a runner script (`backend/src/scripts/hub-eval.ts`).
   Running it calls the paid API, so it runs only when the owner approves a run.

## Cost calculation
Per answer, summing every model call in the tool loop: input × rate + output × rate +
cache reads × 0.1 × input rate + cache writes × 1.25 × input rate. Rates per million tokens
from Anthropic's price list (claude-opus-5: $5 in / $25 out); unknown models use the
Opus 5 rates. It's an estimate for the cap — the Anthropic console bill is the source of truth.

## Impact
- API: new endpoints only; `POST /api/ai/chat` response gains `logId` (shape snapshot for
  the enabled path isn't pinned — the test API runs with AI off).
- Database: migration adds `hub_logs`, `hub_rate_limits`.
- Public site: Hub page streams and shows 👍/👎. Admin: new "Hub answers" page.

## Acceptance criteria
- [x] Every answer (and refusal / error) is logged without personal data, with cost.
- [x] 👍/👎 saved; staff see them on the review page.
- [x] Cap reached → friendly message, no model call.
- [x] Rate limit survives a backend restart.
- [x] Hub answers stream in (English checked live; Khmer streaming checked via the API).
- [x] Admin "Hub answers" page at phone width (375 px, no sideways scroll) — checked 2026-09-28.
- [ ] Phone-width layout of the public 👍/👎 row — not checked visually yet (needs a live answer).
- [x] Contract tests for new endpoints; full suite `CI=true`; typecheck; both builds.

## Log

### 2026-09-28
- Migration `20260928000002_hub_logs` (renamed from a `…000000` name so it sorts after
  `…000001_settings_lists`; dev DB record updated): `hub_logs`, `hub_rate_limits`.
- Backend: `modules/ai/usage.ts` (cost, log, monthly cap, Postgres rate limit with an HMAC'd
  IP key — `AI_RATE_SALT` optional, otherwise derived from the database URL);
  `routes.ts` refactored: `prepare()` (validation → rate limit → cap), shared tool loop with
  optional streaming (`reset` when a round turns into a tool call), `/ai/chat` now returns
  `logId`, new `/ai/chat/stream`, `/ai/feedback`, staff `/ai/usage`, `/ai/logs`. Prompt rule
  added: don't narrate lookups. Config `AI_MONTHLY_CAP_USD` (default 50).
- Public: `api.ai.chatStream` (SSE reader), `api.ai.feedback`; `useHubChat` streams into a
  growing answer, per-tab conversation id, `rate()`; Hub page shows a typing cursor while
  writing and "Was this helpful?" 👍/👎 (EN + KM strings `hub.helpful*`, `hub.thanks`).
- Admin: `pages/HubAnswers.tsx` (`/home/hub-answers`, menu under Content & partners,
  permission `hub.review` for Super Admin + KKF Officer).
- Eval: `src/scripts/hub-eval/questions.json` (50 cases, 12 on the Khmer site) + `run.ts`;
  **not run** (paid) — awaiting owner approval. Output file git-ignored.
- Verified (live key, ~$0.07 total): JSON answer logged with tools/tokens/cost ($0.019);
  stream = 51 `delta` + `done`; feedback 200 / bad rating 422; usage + logs 200 for staff,
  401 without login; cap (side instance, `AI_MONTHLY_CAP_USD=0.01`) → friendly 503 with no
  model call; rate limit (`AI_RATE_LIMIT=2`) → 429 on the 3rd question and **still 429 after
  a clean restart**; test rows removed afterwards. Hub page: "Looking it up…" until first
  words (~6 s), answer grew in 56 steps, 👍 saved. Admin page lists the 5 real answers with
  spend $0.07 / $50. Contract tests 210/210 (`CI=true`), typecheck, both builds pass.
- Not verified visually (browser pane hidden): layouts at phone width; checked page text only.

