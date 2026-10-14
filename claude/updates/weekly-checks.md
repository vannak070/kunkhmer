# Update: Weekly checks

| | |
|---|---|
| **Status** | Done (2026-10-14, committed and pushed (dev 11253144), not live) |
| **Feature** | claude/features/weekly-program.md (step 6) |
| **Requested by** | vannak070 ("start step 6 weekly checks") |

## Before
Nothing looked across the whole week: a fighter could be on two shows, one broadcaster could have two shows at the same time, and drafts or shows without a time or officials were only noticed one by one.

## Change
- **API** `GET /events/week-checks?from=YYYY-MM-DD` (KKF staff + Organizer; an Organizer only sees its own matches; nothing saved) → `{ from, to, matches, problems, warnings, checks: [{ kind, level, event_id, match_id, fighter_id, params }] }` for the 7 days from `from` (cancelled matches / bouts left out), problems first:
  - **to fix**: `double_booked` (a fighter with two bouts in the week — rounds of one draw on the same card don't count), `broadcaster_clash` (same broadcaster, same day, < 3 h apart), `over_weight` (weigh-in above agreed + 1 kg);
  - **to look at**: `venue_clash` (same venue, same day, < 3 h), `weight_gap` (profile weight further from the agreed weight than the KKF weight-gap limit, before the weigh-in), `empty_corner`, `no_officials` (bouts without a referee + 3 judges), `no_bouts`, `no_time`, `not_published`.
  Code: `backend/src/modules/events/weekChecks.ts`.
- **Admin** Matches › Week: "Weekly checks: N to fix · M to look at" panel (`components/program/WeekChecks.tsx`) — each problem on its own line, a match's warnings on one line ("Show X: no start time · still a draft · 2 without officials"), every line links to the match / bout / fighter; green "All clear" when nothing; a red / amber dot on the match cards concerned. Reloads with the week and after "Copy last week". EN + KM.
- "Weekday doesn't match the date" from the review is not needed: the system shows the weekday from the date itself.

## Log
### 2026-10-14
- Contract tests `api-tests/tests/week-checks.test.ts` (every kind, the draw exception, ordering, validation, roles, Organizer scope; the test only looks at its own matches and venue so repeated runs on the same test database pass). Full suite 352/352 in CI mode; backend typecheck clean; admin builds.
- Checked on a temporary admin on the test API: broadcaster clash shown as "to fix", venue clash and grouped warnings per match, card dots. Not checked: Khmer screen, phone width.
