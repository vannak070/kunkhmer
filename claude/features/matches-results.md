# Feature: Fight cards (batches), matches and results

| | |
|---|---|
| **Status** | Done |
| **Jira** | n/a |
| **Figma** | n/a |

## Goal
Build weekly fight cards ("batches" = `sub_events`) inside an event, pair
fighters into matches with rules and officials, and record results that update
fighter records and championship titles.

## API (`backend/src/modules/matches/`)
| Method | Path | Who | Notes |
|---|---|---|---|
| GET | `/matches/batches[/:id]` | public | `?eventId=` = one fight night's cards; with `event`, creator (`created_by` = user object!), `event_name`, `creator_name` |
| POST | `/matches/batches` | STAFF, Organizer (own events) | requires eventId, name, weekNumber, date, location; batch number auto `BATCH-<ms>` |
| PUT | `/matches/batches/:id` | STAFF, Organizer (own events) | moving a card to another organizer's event → 403 |
| DELETE | `/matches/batches/:id` | Super Admin | cascades to matches |
| GET | `/matches[/:id]` | public | `?subEventId=` or `?eventId=` (one fight night, used by the admin fight-night page; non-UUID → `[]`); weigh-in fields only for signed-in admin users (`updates/weigh-in-not-public.md`); ordered by `sort_order`. Without a staff token only bouts of published events that both clubs accepted (or that have a result) |
| GET | `/matches/proposals` | STAFF, Organizer, Club/Gym | club answers, see `match-proposals.md` |
| POST | `/matches` | STAFF, Organizer (own events) | requires subEventId, fighterAId, fighterBId, rounds, roundTime, knockdownLimit, agreedWeight, gloveSize, gloveBrand; both fighters verified; event derived from batch; sent to both clubs (proposal fields in the body are ignored); 200 |
| PUT | `/matches/:id` | STAFF, Organizer (own events) | only STAFF change `refereeId` / `judgeIds` (active officials, see `officials.md`); accepts `sortOrder` or `sort_order`; proposal fields ignored; swapping a fighter (must be verified) resets that side's club answer |
| POST | `/matches/:id/respond` | Club/Gym own side, STAFF | accept / decline (reason required), see `match-proposals.md` |
| DELETE | `/matches/:id` | Super Admin | |
| POST | `/matches/:id/result` | STAFF | `{winnerId ("" = draw), method, round, duration}`; 422 for a winner outside the bout, unknown method, round > rounds |

Match response: snake_case row + nested `sub_event`, `fighter_a`/`fighter_b`
(with `club`), `referee`, `result`, `championship` + flat display fields
(`fighter_a_name/_image/_record/_grade`, `club_a_name`, `referee_name`,
`winner_id/_method/_round/_duration` **from the result**, `date`,
`isTitleMatch`, `championshipId`, `championshipTitleName`, `sortOrder`).

## Business rules (results — `results.ts`, one transaction)
1. Upsert the bout result, set match `Completed` + `winner_id`.
2. Title match (`is_title_match` + `championship_id`): vacant title → winner crowned ("Crowned New
   Champion"); holder wins → `defense_count + 1` ("Won"); holder loses → "Lost" logged, winner crowned,
   count reset. A draw changes nothing, and so does a fight the current holder isn't in. The belt's holder
   fields from just before are stored in `championship_changes`.
3. Recalculate both fighters' `record` from all their completed matches.
- Re-submitting a title result (a correction) puts the belt back as it was before that fight, removes the
  history of this and every later title fight for the belt and applies them again in order — a changed
  winner moves the title; the same result changes nothing (`updates/title-result-corrections.md`).
  Manual holder edits made in between are replaced. The admin match page asks to confirm a winner change.

## Matching rules (2026-10-13)
`POST /matches` and fighter swaps run the KKF matching rules (`matches/rules.ts`, table `matching_rules`, edited in
System Settings › Matching rules): block rules → 422, warn rules → `warnings` in the response;
`GET /matches/rules`, `PUT /matches/rules/:key`, `POST /matches/check` — `updates/matching-rules.md`.

## Validation (2026-10-13)
A bout needs two different fighters; a result needs a winner from the bout (or empty), a method from KO / TKO /
Decision / Submission / Disqualification / Draw / No Contest and a round 0…rounds; deleting a bout recalculates
both records — `updates/program-validation.md`.

## Officer flow (2026-09-30)
Approvals are off (`updates/officer-run-program.md`): bouts are confirmed when KKF staff create them, the event
"Next steps" includes an Officials step (referee + 3 judges, as the Assign officials page requires), and the
dashboard lists "Bouts without officials" (next 14 days) and "Weigh-ins to do".

## Frontend
- Admin: `AddBout.tsx` (`/home/matches/:batchId/create-match`, `updates/program-simple-forms.md`), `CreateBatch.tsx`,
  `AddMatchToEvent.tsx`, `AssignOfficials.tsx`, `MatchDetail.tsx`,
  `MatchDetailView.tsx` (`/home/match/:id/update-result`), `ShareFightCard.tsx`
  (poster export), `MatchesEnhanced.tsx`.
- `MatchProposals.tsx` (`/home/match-proposals`) — club answers on the API (Phase 3b).
- Fight card and event pages show each bout's club answers (`components/BoutAnswer.tsx`).

## Tests
`api-tests/tests/matches.test.ts`

## Open questions / gaps
- None open.

## Bout label and rule set (2026-10-13, `features/weekly-program.md`)
`matches.bout_label` (friendly · international · youth · qualifier · final · prize, null = not set) and `matches.rule_set`
(kun_khmer default · mas_fight), migration `20261013200000_bout_label_rule_set`; API `boutLabel` ("" clears) and `ruleSet`,
422 for other values; returned as `bout_label` / `rule_set`. Add bout has "Bout type" (set to International automatically
when a foreign fighter is picked) and "Fought under"; the agreed weight is now any number 20–200 kg with the usual weights
(28–77 kg incl. 63.5) suggested. The match page and the program sheet show the label; MAS Fight and women's bouts are
marked on the sheet.

## Empty corners and draws (2026-10-14)
A corner may be empty ("to be announced") or wait for another bout's winner (`slot_a_from` / `slot_b_from`); a draw of 4 or 8
fighters (`POST /matches/batches/:id/draw`) creates the qualifiers and the later rounds. Results need both corners; a result
moves the winner on. Details: `updates/empty-corners-draws.md`.
