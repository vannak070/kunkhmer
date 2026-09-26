# API contract tests

Black-box HTTP tests for the Kun Khmer API. They only talk to the API over
HTTP, so the same suite runs against the Laravel backend today and the
Node.js backend after the migration.

## Running

```bash
# 1. Start the test API (own database `kunkhmer_test`, reset on every start)
docker compose --profile test up -d backend-test

# 2. Run the tests
cd api-tests && npm install && npm test
```

Restart the test API to reset its database:
`docker compose --profile test restart backend-test`.

| Env var | Default | Purpose |
|---|---|---|
| `API_URL` | `http://localhost:3002/api` | Backend under test |
| `API_ADMIN_USERNAME` / `API_ADMIN_PASSWORD` | `admin` / `admin123` | Seeded Super Admin |
| `API_BACKEND` | `laravel` | `laravel` skips tests for known Laravel bugs |

## How responses are checked

Each test file creates its own users (one per role) and data through the API,
so tests don't depend on seed data beyond the admin account.

Response formats are pinned with **shape snapshots** in `tests/__snapshots__/`:
every key, its JSON type, and for strings the format (`uuid`, `date`,
`datetime(.000000Z)`, `datetime(+00:00)`, `datetime(sql)`). Values are not
pinned. The snapshots were recorded from the Laravel backend and are the
contract the Node.js backend must reproduce so the frontends keep working.

When checking a new backend, run with `CI=true` so a mismatch fails instead of
writing a new snapshot. Only run `npm run test:update` when a format change is
intentional.

## Known Laravel bugs (skipped when `API_BACKEND=laravel`)

- Re-submitting a title match result logs a second defense and double counts.
- A video's fighter/club/match can't be cleared by sending an empty value.
- A fighter's `professionalStatus` is never saved (the column isn't fillable).
