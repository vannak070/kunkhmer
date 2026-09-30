# Update: KUNKHMER HUB Phase D3 — personal answers for signed-in fans

| | |
|---|---|
| **Status** | Done (not committed) — waiting for owner review; no live model test (owner skipped it) |
| **Jira** | n/a |
| **Feature** | claude/features/ai-assistant.md, claude/features/fan-accounts.md |
| **Requested by** | vannak070 (2026-09-29: "start Hub Phase D3") |

## Current behavior
`POST /api/ai/chat` and `/chat/stream` are anonymous. A fan who follows fighters and asks "when do my
fighters fight next?" gets a generic answer — the Hub doesn't know who they follow. Fan accounts
(`features/fan-accounts.md`) already store follows (`fan_follows`) and send notifications.

## Proposal
- The chat endpoints accept an **optional fan token** (`Authorization: Bearer kkf_…`, same as the fan
  routes; staff tokens are ignored there). No token or an invalid one → today's anonymous behaviour.
- For a signed-in fan the model gets **one extra read-only tool, `my_followed_fighters`**: the fan's
  followed fighters with public facts only (id, names, club, official record, next scheduled bout,
  last result, profile link). The model calls it only when the question is about "my fighters".
  **Nothing about the fan** (name, email, account id, language setting) goes to the model.
- Prompt rule: questions about "my fighters" from a visitor who isn't signed in (or follows nobody) →
  explain how to sign in and follow fighters, with the link.
- Logs stay **anonymous** (no fan id in `hub_logs`).
- Fan site: Hub page shows "Ask about your fighters" questions when signed in and following someone;
  the Account page's followed-fighters list gets an "Ask KUNKHMER HUB about my fighters" link.
- Same monthly cap and rate limit as other public questions.

## Owner decisions (2026-09-29)
- **Yes**: send the followed fighters' **public facts only**, through a tool the model calls when asked.
- Logging: **anonymous + a "signed-in" yes/no flag** (`hub_logs.signed_in`), never which fan.
- Offered on the **Hub page and the Account page**.
- **Same per-IP rate limit** as all public questions; same $50 monthly cap.

## Change (as built)
- Backend (`modules/ai/tools.ts`, `routes.ts`, `usage.ts`):
  - `FAN_TOOL` `my_followed_fighters` — public Hub only (not in the staff tool list), last in the tool
    list so the cached prefix is the same for every visitor. It returns the fan's followed, visible
    fighters (max 20): name, Khmer name, alias, club, weight, official W-L-D, grade, link, latest
    recorded bout, next scheduled bout. Not signed in → `{ signed_in: false, note }` (how to sign in /
    follow); follows nobody → a note to follow fighters.
  - `prepare()` calls `resolveFan` on the public routes; the fan id stays in memory (`ctx`) for the tool
    and is never logged or sent to the model. Staff tokens and bad `kkf_` tokens → anonymous.
  - Prompt rule: "my fighters" questions → call the tool; never ask for or mention the visitor's
    name / email / account.
  - `hub_logs.signed_in` (migration `20260929000003_hub_logs_signed_in`); `/ai/logs` items `signedIn`,
    `/ai/usage` `signedInQuestions`.
- Fan site: `utils/api.ts` sends the fan token (`getFanToken`) with `/ai/chat` and `/ai/chat/stream`
  (a caller's Authorization now wins over a stored staff token); `/hub` shows a "Your fighters" card
  ("When do my fighters fight next?", "How did my fighters do in their last fights?") for signed-in fans
  who follow someone; `/account` shows the same two questions under the followed fighters
  (`HubAskAbout`, hidden when the Hub is off). Strings `hub.topicMine`, `hub.qMyNext`, `hub.qMyRecent` (EN + KM).
- Admin "Hub answers": "Signed-in fan" badge on those answers; "N from signed-in fans" in the spend line.

## Acceptance criteria
- [x] Only public fighter facts reach the model; no fan identity in prompts, tool output or logs.
- [x] Anonymous visitors unchanged; "my fighters" questions explain how to sign in.
- [x] Contract suite passes; typecheck; both frontends build.
- [ ] Live answer checked with the real model (owner skipped the paid test — try on /hub).
- [ ] Owner review.

## Log
### 2026-09-29
- Built as above. Typecheck; contract suite 252/252 in CI mode (new D3 block: fan / fake / staff tokens
  get the same 503 contract on both chat routes; `signedInQuestions` in usage — its snapshot gained only
  that field).
- Free tool check on the test database: a fan following 2 fighters got both with club, record, latest
  result (KO, round 3) and next bout; anonymous got the sign-in note; the output contained no fan name,
  email or id.
- Not checked in the browser: the "Your fighters" card and the Account questions need a signed-in fan
  with follows (dev has none; creating one was not approved with the live test).
