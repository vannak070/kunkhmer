# Feature: Championship titles

| | |
|---|---|
| **Status** | Done |
| **Jira** | n/a |
| **Figma** | n/a |

## Goal
Track KKF title belts per weight class, the current holder and the full title
history (crownings, defenses, losses).

## API (`backend/src/modules/champions/routes.ts`)
| Method | Path | Who | Notes |
|---|---|---|---|
| GET | `/champions` | public | with `current_holder` + `current_holder_name_db/_photo_db/_nationality_db` |
| GET | `/champions/:id` | public | same + `defenses[]` (title history, oldest first) |
| POST | `/champions` | STAFF | requires titleName, championType, weightClass; default status Vacant; 200 |
| PUT | `/champions/:id` | STAFF | |
| DELETE | `/champions/:id` | Super Admin | deletes its history too |

Shape: snake_case row (`weight_class` number, `defense_count`,
`last_defense_date`, `next_defense_deadline`, image/certificate URLs,
`approval_status`).

## Business rules
- Titles change automatically through title match results; a corrected result moves the title and
  replays later title fights — see `claude/features/matches-results.md`.
- `current_holder_name` is stored; the `*_db` fields come from the live fighter record.

## Frontend
- Admin: list at `/home/program?tab=champions` (`Champion.tsx` embedded in
  `ProgramDashboard.tsx`), `CreateChampion.tsx`,
  `ChampionDetail.tsx` (`/home/champion/:id`), `ChampionHistory.tsx`.
- Public: `/champions` and `/champions/<title>-<code>` (`pages/Champions.tsx`, `features/public-champions.md`);
  Champion badges on fighter, club and Fighters pages.

## Tests
`api-tests/tests/champions.test.ts` (+ title logic in `matches.test.ts`)

## Open questions / gaps
- Awards (`AwardsSetup.tsx`, `CreateAward.tsx`) are mock-only; no API.
