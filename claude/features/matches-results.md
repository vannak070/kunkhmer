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
| GET | `/matches/batches[/:id]` | public | with `event`, creator (`created_by` = user object!), `event_name`, `creator_name` |
| POST | `/matches/batches` | STAFF, Organizer | requires eventId, name, weekNumber, date, location; batch number auto `BATCH-<ms>` |
| PUT | `/matches/batches/:id` | STAFF, Organizer | |
| DELETE | `/matches/batches/:id` | Super Admin | cascades to matches |
| GET | `/matches[/:id]` | public | `?subEventId=`; ordered by `sort_order` |
| POST | `/matches` | STAFF, Organizer | requires subEventId, fighterAId, fighterBId, rounds, roundTime, knockdownLimit, agreedWeight, gloveSize, gloveBrand; event derived from batch; 200 |
| PUT | `/matches/:id` | STAFF, Organizer, Club/Gym | Club/Gym only if one fighter is from their club; accepts `sortOrder` or `sort_order` |
| DELETE | `/matches/:id` | Super Admin | |
| POST | `/matches/:id/result` | STAFF | `{winnerId ("" = draw), method, round, duration}` |

Match response: snake_case row + nested `sub_event`, `fighter_a`/`fighter_b`
(with `club`), `referee`, `result`, `championship` + flat display fields
(`fighter_a_name/_image/_record/_grade`, `club_a_name`, `referee_name`,
`winner_id/_method/_round/_duration` **from the result**, `date`,
`isTitleMatch`, `championshipId`, `championshipTitleName`, `sortOrder`).

## Business rules (results — `results.ts`, one transaction)
1. Upsert the bout result, set match `Completed` + `winner_id`.
2. Title match (`is_title_match` + `championship_id`), **first result only**:
   vacant title → winner crowned ("Crowned New Champion"); holder wins →
   `defense_count + 1` ("Won"); holder loses → "Lost" logged, winner crowned,
   count reset. A draw changes nothing.
3. Recalculate both fighters' `record` from all their completed matches.
- Re-submitting a result updates the bout and records but never re-applies the title logic.

## Frontend
- Admin: `CreateBatch.tsx`, `BatchDetail.tsx`, `CreateMatchFromBatch.tsx`,
  `AddMatchToEvent.tsx`, `AssignOfficials.tsx`, `MatchDetail.tsx`,
  `MatchDetailView.tsx` (`/home/match/:id/update-result`), `ShareFightCard.tsx`
  (poster export), `MatchesEnhanced.tsx`.
- `MatchProposals.tsx`, `Matches.tsx` (`matches-old`), `SubEventDetail.tsx` use mock data.

## Tests
`api-tests/tests/matches.test.ts`

## Open questions / gaps
- Correcting a title result to a different winner doesn't reverse the title
  (needs an explicit "correct title result" flow).
- Proposal flow (`proposal_status`, `club_a/b_response`) has fields but no dedicated endpoints.
