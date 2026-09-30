# Update: KUNKHMER HUB Phase D — Hub everywhere

| | |
|---|---|
| **Status** | D1 done — committed 7691de40; D2 done — committed f4b4010f; D3 built 2026-09-29, not committed (`hub-phase-d3-personal-answers.md`) |
| **Jira** | n/a |
| **Feature** | claude/features/ai-assistant.md |
| **Requested by** | vannak070 (2026-09-28: "Start Hub Phase D") |

## Current behavior
The Hub only lives at `/hub` (plus the home hero box `HubAskBox.tsx`, which opens `/hub?q=`).
Fighter, event, compare and article pages have no way to ask about what the visitor is looking
at. The admin has no assistant: staff answer "which events still need results?" by clicking
through lists. Signed-in fans get the same answers as anonymous visitors.

## Requested change (proposal — parts can ship one at a time)
- **D1. "Ask about this" buttons (public site)**: on the fighter profile, event page, compare
  page and news article, an "Ask KUNKHMER HUB" button with 2–3 ready-made questions for that
  page (e.g. "How has Sok Chan done in her last fights?", "Who is favoured in the main event?"
  → the Hub never predicts, so questions stay factual). Clicking opens `/hub?q=<question>`
  (existing flow, no backend change). EN + KM strings.
- **D2. Staff assistant (admin)**: a read-only chat in the admin for staff, same model loop,
  plus staff-only tools: pending approvals (fighters to verify, clubs, events, match
  proposals), data-quality checks (past fight nights without results, fighters missing photo /
  weight / date of birth, likely duplicate fighters), draft events / news. It never writes;
  answers link to the admin page where staff act. Logged in `hub_logs` marked as staff.
- **D3. Personalised answers for signed-in fans**: the Hub can use the fan's followed fighters
  ("when do my fighters fight next?"). Only fighter ids from `fan_follows` go to the model —
  no name, email or account id; the log stays anonymous.

## Owner decisions (2026-09-28)
- This round: **D1 only**. Buttons open **`/hub?q=`** (no inline panel on the page).
- For later: D2 staff assistant is for **KKF staff only** (Super Admin + KKF Officer); staff and
  personalised fan questions share the **same $50/month cap** (admin shows public vs staff spend).
- D3 (sending followed fighters' ids to the model) not decided yet.

## Why
Phase D of the agreed C → A → B → D Hub plan (`features/ai-assistant.md`).

## Scope
In scope: see the parts the owner picks below.
Out of scope: the Hub writing or changing any data; leaderboards (owner decision); live web search.

## Impact
- API: D1 none. D2 new staff endpoint(s) under `/api/ai/staff/...` (contract tests + snapshots).
  D3 the chat endpoints accept an optional fan token.
- Database: D2 maybe a `source` column on `hub_logs` (public / staff) — migration.
- Frontend: public fighter / event / compare / article pages (D1, D3); new admin page (D2).

## Acceptance criteria
D1:
- [x] Fighter profile (below the hero / next fight): recent fights, next fight, and club-mates
  (only when the fighter has a club — not the "Independent" fallback).
- [x] Event page (below the card / results / watch tab): with results → results + main event
  ending (when the main event is decided); upcoming → who is fighting (when bouts exist) + when /
  where / how to watch; past without results → "Tell me about {event}".
- [x] Compare (below the matchup, both fighters picked): head-to-head + records compared.
- [x] News article (below the article): summarise it + latest news.
- [x] Names in the page language (`localName`); every string EN + KM; hidden when the Hub is off
  (same rule as the home box, `useHubVisible`); each question is a real link (`/hub?q=`).
- [x] No prediction questions ("who will win") — the Hub declines those.

## Open questions
- D3 decided 2026-09-29: yes, public fighter facts only via a tool — see `hub-phase-d3-personal-answers.md`.

## Log
2026-09-28 — D1 built:
- New `frontend/public/src/app/components/hub/HubAskAbout.tsx` (light card, KUNKHMER HUB badge,
  "Ask about this", question chips linking to `/hub?q=`).
- Used in `pages/SuperAppFighterDetail.tsx`, `pages/EventDetail.tsx`, `pages/Compare.tsx`,
  `pages/ArticleDetail.tsx`; strings `hub.aboutTitle`, `hub.ask*` in EN + KM (`i18n/messages.ts`,
  Khmer is a first draft for federation review).
- No backend, API or database change; no paid calls made while testing (chips checked by link).
- Checks: `vite build` passes (no `tsc` installed in the frontend, so no separate type check).
  Browser on dev data: fighter, past event without results, compare and article show the right
  questions; fighter page checked at phone width in Khmer. The event "with results" and
  "upcoming" question sets were not seen in the browser (dev has no such event).
