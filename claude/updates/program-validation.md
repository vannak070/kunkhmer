# Update: Program validation — bouts and results

| | |
|---|---|
| **Status** | Done (2026-10-13) |
| **Jira** | n/a |
| **Feature** | features/matches-results.md |
| **Requested by** | vannak070 (review of the Program function, "go ahead with your recommendation") |

## Current behavior (found by testing the API)
- `POST /matches` accepted the same fighter on both sides.
- `POST /matches/:id/result` accepted a winner who is not in the bout (both real fighters then got a loss),
  any method text ("banana") and any round (99 on a 3-round bout).
- Deleting a bout left its result in the fighters' records until their next result.
- The review's "Publish before any fight card" point was already fixed (`publish-guard.md`).

## Requested change
- Bout needs two different fighters (create, and fighter swap on update) → 422.
- Result: winner must be fighter A or B (or empty = draw / no contest); method one of KO, TKO, Decision,
  Submission, Disqualification, Draw, No Contest; round a whole number 0 … the bout's rounds → 422.
- Deleting a bout recalculates both fighters' records (same transaction).

## Impact
API: new 422 cases; no shape change, no migration, no admin change (the results screen already sends these values).
Not changed: deleting a title fight does not replay the belt history; weigh-in still not tied to results.

## Acceptance criteria
- [x] Contract tests for each rule (`matches.test.ts`, "result and bout validation").
- [x] Backend typecheck clean; full suite 285/285 (`CI=true`).

## Log
### 2026-10-13
- `matches/routes.ts` (different fighters, delete recalculates), `matches/results.ts` (`RESULT_METHODS`,
  winner / method / round checks, `recalculateRecord` exported). Three new tests.
