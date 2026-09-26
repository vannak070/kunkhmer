# Test: API contract suite

| | |
|---|---|
| **Feature** | all backend features |
| **Type** | API contract |

## Preconditions
- Docker running; `docker compose up -d postgres`.
- Test API: `docker compose --profile test up -d backend-test` (port 3002).
  Its database `kunkhmer_test` is rebuilt from the Prisma migrations on every
  start, so a pass also proves the migrations. To reset:
  `docker compose --profile test restart backend-test`.
- After changing backend code, the test container reloads automatically
  (source is mounted); wait for `curl -sf localhost:3002/up`.

## Steps
1. `cd backend && npm run typecheck`
2. `npm run test:api` (repo root or `backend/`) — runs with `CI=true`.

## Expected results
- Typecheck clean; `Test Files 8 passed`, `Tests 135 passed` (more once you add tests).

## Pass criteria
- Everything green with `CI=true`. A snapshot mismatch means a response shape
  changed: either fix the code, or — only if the change is intended and
  documented in an update — run `npm run test:update` in `api-tests/`, review
  the snapshot diff, and update the frontends that read the field.

## Writing new tests
- One file per domain in `api-tests/tests/`; `setupActors()` gives a fresh
  user per role (+ a club) for each file.
- Pin response shapes with `expect(shapeOf(res)).toMatchSnapshot()`; assert
  values with `toMatchObject`; always test 403 for the roles that must be
  refused and 401 without a token.
- Create data through the API, never rely on seed data beyond `admin`.

## Notes
- Tests share one database and run one file at a time; they create unique
  names (`uniq()`), so re-running without a reset is fine.
