# Feature: Statistics (public site)

| | |
|---|---|
| **Status** | Draft — comes before the AI assistant (see `features/ai-assistant.md`) |
| **Jira** | TBD |
| **Figma** | TBD |
| **Owner** | vannak070 |

## Goal
A public statistics page (and small stat blocks elsewhere) that shows Kun Khmer
in numbers, built only from the federation's real records, in English and Khmer.
It also becomes the trusted data layer the AI assistant will later read from.

## Users and roles
- **Public visitor**: reads everything, no account.
- **Staff**: no new admin screen planned; numbers come from existing records.

## Proposed content (to confirm)
Only what the data supports today (see Data):
- **Overview**: registered fighters, clubs, events held, bouts recorded, title
  fights, active champions.
- **How fights end**: share of wins by method (KO, TKO, decision, referee stop,
  draw, no contest) from recorded results; average finishing round.
- **Leaders**: most wins, best win % (minimum bouts), most title fights,
  longest current win streak — from recorded bouts, labelled unofficial like
  the rankings.
- **Divisions**: fighters per weight division, champion per division.
- **Clubs / provinces**: fighters per club and per province (if province is filled).
- **Trends**: events and bouts per month/year.

## API
TBD — either computed in the browser from `useFanData()` (no backend change,
fine while data is small) or a new `GET /api/stats` endpoint that aggregates in
Postgres (better at scale, needs contract tests + snapshot).

## Data
Existing only: `fighters` (record, current_weight, club_id, province, status),
`matches` (winner_id, winner_method, winner_round, is_title_match, date),
`events`, `sub_events`, `champions`, `clubs`. No migration planned.
Known data gaps: few recorded results locally; fighter `record` strings are
entered by hand and may not match recorded bouts.

## Frontend
New page `frontend/public/src/app/pages/Statistics.tsx` at `/stats` (TBD),
linked from the header/footer and a teaser block on the home page (TBD).
Charts follow the brand tokens; light style (see memory/visual taste).

## Base code
`data/fanData.ts` (`useFanData`, `divisions()`, `latestResults()`),
`pages/Rankings.tsx` (unofficial-label pattern), `i18n/messages.ts`.

## Business rules
- Real data only; hide a block when there isn't enough data (e.g. < 10 results).
- Say how each number is calculated; leaders/streaks are "unofficial".
- Never show internal statuses or system accounts.
- Bilingual; Khmer digits via `formatDate`/number helpers.

## Acceptance criteria
- [ ] TBD after open questions.

## Tests
If a `/api/stats` endpoint is added: contract tests + shape snapshot in
`api-tests/tests/`. UI: desktop + phone, English + Khmer.

## Open questions
- Which blocks matter most to the federation (overview, methods, leaders,
  divisions, clubs/provinces, trends)?
- Should fighter records come from the hand-entered `record` field or be
  recalculated from recorded bouts (they can disagree)?
- Own page (`/stats`), a section on Rankings, or both? Home page teaser?
- Compute in the browser now, or build `GET /api/stats` straight away?
- Any official federation numbers (history totals before the platform) to include?
