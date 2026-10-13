# Update: KKF matching rules (Program workflow, phase 1)

| | |
|---|---|
| **Status** | Done (2026-10-13) — rule values are **placeholders** until KKF confirms them (editable in Settings) |
| **Jira** | n/a |
| **Feature** | claude/features/program-workflow.md (phase 1), claude/features/matches-results.md |
| **Requested by** | vannak070 ("a bout that doesn't meet KKF's matching logic cannot be created"; "go ahead" on the placeholder table) |

## Current behavior (before)
A bout only needed two different, verified fighters. Nothing checked gender, age, weight, grade, record, rest
days, double-booking or club.

## Requested change
- New table `matching_rules` (fixed keys; migration `20261013044936_matching_rules` seeds the 10 rules). Each
  rule has `enabled`, `action` (`block` / `warn`) and a `value` (limit) with a unit.
- `POST /matches` and a fighter swap in `PUT /matches/:id` run the enabled rules. A broken **block** rule → 422
  naming every broken rule; broken **warn** rules let the bout through and add `warnings: [{key,label,action,message}]`
  to the response (only when there are warnings, so existing shapes are unchanged).
- `GET /matches/rules` (KKF staff + Organizer), `PUT /matches/rules/:key` (KKF staff), `POST /matches/check`
  (dry run: `{allowed, blocked[], warnings[]}`, saves nothing).
- Admin: System Settings › **Matching rules** tab (on/off, Block or Warn, limit; KKF staff edit, others read);
  Add bout shows the warnings after a bout is created. EN + KM (Khmer for KKF review).

## Rules and starting values (placeholders)
| Key | Starting value | On | Action |
|---|---|---|---|
| medical | status Cleared | **off** | block |
| suspension | not suspended on the fight date | **off** | block |
| same_gender | — | on | block |
| min_age | 16 years | on | block |
| weight_gap | ±2 kg of the agreed weight | on | warn |
| grade_gap | 1 step (A–D) | on | warn |
| record_gap | 10 wins apart | on | warn |
| rest_days | 21 days | on | block |
| same_club | — | on | warn |
| already_booked | same fight card or same day | on | block |

Medical and suspension started **off** because nothing set those fields yet; phase 2 (`updates/fighter-medical-suspension.md`) added the screen and switched them on.
Not in this phase: title-bout class check (row 13) and the officials check (still at publish).

## Impact
API: new endpoints and an optional `warnings` field; new 422 cases. Database: one table + seed. Existing
snapshots unchanged. One existing test changed: the "replays later title fights" test now puts its second title
fight 28 days after the first (it was 7 days, which the 21-day rest rule rightly blocks).

## Acceptance criteria
- [x] A bout breaking an enabled block rule returns 422 naming the rule; warn rules don't block and come back as warnings.
- [x] Turning a rule off or changing its limit applies at once; only KKF staff can change; Organizer reads; Club/Gym cannot.
- [x] Dry-run check saves nothing.
- [x] Typecheck clean; contract suite 292/292 (`CI=true`); admin build passes; Settings tab checked in the browser (English desktop, Khmer phone width, edit + save).
- [ ] KKF confirms or corrects the values (open).

## Log
### 2026-10-13
- `backend/src/modules/matches/rules.ts` (rules engine + routes), `routes.ts` (create + swap), `app.ts`; admin
  `components/settings/MatchingRulesPanel.tsx`, `SystemSettings.tsx`, `AddBout.tsx`, `utils/api.ts`, `i18n/program.ts`.
- Found while testing: "same fight night" was too coarse (a multi-week event's cards are on different dates), so
  `already_booked` means the same fight card or the same day; rest-days covers the rest.
- Not browser-checked: the Add bout warning toast (covered by the API test).
