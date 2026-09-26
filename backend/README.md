# Kun Khmer API

Fastify + Prisma + TypeScript on PostgreSQL. `../api-tests` verifies every
endpoint's behaviour and response format.

## Running

With Docker (from the repo root):

```bash
docker compose up -d backend           # http://localhost:3001/api
```

Without Docker:

```bash
cp .env.example .env      # point DATABASE_URL at your database
npm install
npm run db:prepare        # migrations and seed
npm run dev               # http://localhost:3001 (PORT in .env)
```

## Database and migrations

Prisma owns the schema: `prisma/schema.prisma` plus `prisma/migrations/`.
Every start runs `src/scripts/prepare-db.ts`, which:

1. waits for PostgreSQL and creates the database if it doesn't exist
2. on a database that already has the tables but no migration history,
   marks `0_init` as applied (the schema is already there), keeping the data
3. applies pending migrations (`prisma migrate deploy`)
4. creates the default Super Admin `admin` if there are no users
   (password `admin123`, or `SEED_ADMIN_PASSWORD`)

Demo data (clubs, fighters, users for every role, events, matches, titles):

```bash
npm run db:seed:demo -- --reset   # wipes ALL data, then loads prisma/seed/demo-data.json
```

Demo logins: `admin/admin123`, `officer/officer123`, `organizer/org123`,
`manager/manager123`, `club/club123`, referees `ref123`, judges `judge123`.

To change the schema: edit `schema.prisma`, then `npm run db:migrate` to
create a migration, and commit it.

## Contract tests

```bash
docker compose --profile test up -d backend-test   # http://localhost:3002
npm run test:api
```

The test service rebuilds its database from the Prisma migrations on every
start, so a passing run also proves the migrations create a correct schema.
Restart it to reset: `docker compose --profile test restart backend-test`.

## Production image

`docker build .` builds a production image (compiled JavaScript, non-root
user). It needs `DATABASE_URL`, listens on `PORT` (default 3001) and prepares
the database on start.

## Fan accounts (public site)

`/api/fans/*` serves public-site accounts: sign-up/in, profile, followed
fighters and in-app notifications (see the route list at the top of
`src/modules/fans/routes.ts`). Fans are stored in their own tables
(`fans`, `fan_sessions`, `fan_follows`, `fan_notifications`) and use their own
`kkf_…` bearer tokens, which the staff auth ignores — a fan can never reach an
admin route, and staff tokens don't work on fan routes.

Followers are notified when a bout with their fighter is created and when its
result is recorded (`src/modules/fans/notify.ts`). Notifications store facts;
the site renders the text in the fan's language. Email delivery isn't wired up
yet — `notify_email` records the preference for when it is.

Sign-in and sign-up are rate-limited per IP (`FAN_RATE_LIMIT` attempts per 15
minutes, default 10; the test service raises it). The limiter is in memory, so
it needs a shared store if the API runs as several instances.

## Layout

```
src/
  app.ts            Fastify setup, error handling, route registration
  server.ts         entry point
  config.ts, db.ts  environment and Prisma client
  lib/
    auth.ts         staff bearer tokens, roles
    input.ts        request input handling (trim, "" → null, has/get/required)
    dates.ts        the date formats used in responses
    http.ts         response helpers and HttpError
  modules/<name>/routes.ts
  scripts/          prepare-db (migrations, baseline, seed), seed, seed-demo
prisma/
  schema.prisma     database schema
  migrations/       0_init = the base schema, then incremental migrations
  seed/             demo-data.json
```

## Behaviour notes

- **Input**: strings are trimmed and empty strings become `null` before
  routes see them; `has(key)` means present and not null.
- **Tokens**: staff tokens are `"<id>|<secret>"`, stored as a SHA-256 hash in
  `personal_access_tokens`; fan tokens are separate (`kkf_…`, `fan_sessions`).
- **Passwords**: bcrypt.
- **Match results** are saved in one transaction. A title match updates the
  championship only the first time its result is recorded; correcting a title
  result to a different winner does not reverse the title change.
- **Response formats**: some modules return snake_case rows with nested
  relations, others camelCase, with three date styles (see `src/lib/dates.ts`).
  The frontends depend on these exact shapes, pinned by `../api-tests`.
