# API contract tests

Black-box HTTP tests for the Kun Khmer API: behaviour, permissions and
response formats of every endpoint. They were recorded against the original
Laravel backend and used to verify the Node.js rewrite, so they pin exactly
what the frontends rely on.

## Running

```bash
# 1. Start the test API (own database `kunkhmer_test`, rebuilt from the
#    Prisma migrations on every start)
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

## How responses are checked

Each test file creates its own users (one per role) and data through the API,
so tests don't depend on seed data beyond the admin account.

Response formats are pinned with **shape snapshots** in `tests/__snapshots__/`:
every key, its JSON type, and for strings the format (`uuid`, `date`,
`datetime(.000000Z)`, `datetime(+00:00)`, `datetime(sql)`). Values are not
pinned.

Run with `CI=true` (as `npm run test:api` in `backend/` does) so a mismatch
fails instead of writing a new snapshot. Only run `npm run test:update` when a
response format change is intentional, and update the frontends to match.
