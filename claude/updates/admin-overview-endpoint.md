# Update: one server call for the dashboard and bell

| | |
|---|---|
| **Status** | Done locally (2026-10-14); not deployed |
| **Jira** | n/a |
| **Feature** | admin dashboard + header bell (`hooks/useAdminOverview.ts`); follows `updates/admin-performance.md` |
| **Requested by** | Owner ("go ahead with the server-side overview call") |

## Current behavior
Every admin page (the Layout, for the bell count) and the dashboard load the overview with **7 API calls** (fighters, events, matches,
champions, clubs, agreements waiting, open disputes) — about 0.9 MB of JSON — then work out the to-do list, counts and headline numbers
in the browser.

## Requested change
`GET /api/overview` (signed in, not for Referee / Judge) returns only what the overview needs, in one response, worked out on the server
from one set of queries:
- `activeFighters` and `clubs` as numbers (not every fighter / club row);
- only the fighters that can be a to-do (staff: Draft / Pending; a club: its own Rejected ones);
- events and bouts from `?from=` (the admin sends the six-month window) with only the fields the overview reads;
- only the vacant, approved titles; the waiting agreements and open disputes (staff only, same rows as their own endpoints).
The to-do rules, ranks, wording and Khmer text stay in the admin (`useAdminOverview.ts`): unchanged behavior, one request.

## Why
7 requests → 1, ~0.9 MB → a few tens of KB; the bell no longer pulls the whole fighter / club / champion lists on every page.

## Scope
In scope: `GET /overview`, `api.overview.get`, `useAdminOverview.ts` using it, contract tests (own actors, role checks, shape snapshot).
Out of scope: moving the to-do rules to the server; the other pages' own lists; deploying.

## Impact
- API: **new** endpoint (additive). Existing endpoints unchanged (the agreement and dispute handlers' queries moved into functions
  both routes share).
- No migration.
- Admin: dashboard and header bell only.

## Acceptance criteria
- [x] Dashboard and bell show the same to-dos / numbers as before for Super Admin, KKF Officer, Organizer, Club/Gym.
- [x] One `/overview` request instead of seven; contract suite and typecheck pass.

## Log

- 2026-10-14: new `backend/src/modules/overview/routes.ts` (`GET /overview?from=`, Super Admin / KKF Officer / Organizer / Club only; Referee / Judge 403;
  lean Prisma `select`s; registered in `app.ts`). The waiting-agreements and open-disputes queries moved into `waitingAgreements()`
  (`events/agreements.ts`) and `disputeRows()` (`events/signoff.ts`), shared with their own endpoints (responses unchanged).
  Admin: `api.overview.get`, `useAdminOverview.ts` builds the same to-dos from the one response (rules and Khmer text untouched).
- Test API, same data: dashboard **7 calls / 962 KB → 1 call / 142 KB** (≈250 ms). The bell on every other page now costs the same one call.
- Tests: `api-tests/tests/overview.test.ts` (401 / 403, parity with the list endpoints for staff, club sees only its own sent-back
  fighters and no staff lists, Organizer scope, window, shape snapshot). Suite 364/364. Backend and admin typecheck clean (admin: only the old errors).
- Not done: the to-do rules still run in the browser (server-side to-dos would need the Khmer `info` notes moved too); `HeaderSearch`
  still loads fighters / clubs / events on first focus.
