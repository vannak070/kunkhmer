# Kun Khmer API

Fastify + Prisma + TypeScript. It replaced the original Laravel backend
(still in git history) and returns the same responses, which `../api-tests`
verifies, so the frontends didn't need changes.

## Running

With Docker (from the repo root):

```bash
docker compose up -d backend           # http://localhost:3001/api
```

Without Docker:

```bash
cp .env.example .env      # point DATABASE_URL at your database
npm install
npm run db:prepare        # migrations (+ baseline for a Laravel database) and seed
npm run dev               # http://localhost:3001 (PORT in .env)
```

## Database and migrations

Prisma owns the schema: `prisma/schema.prisma` plus `prisma/migrations/`.
Every start runs `src/scripts/prepare-db.ts`, which:

1. waits for PostgreSQL and creates the database if it doesn't exist
2. on a database created by the Laravel backend, marks `0_init` as applied
   (its schema is already there), so existing data is kept as is
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

## Layout

```
src/
  app.ts            Fastify setup, error handling, route registration
  server.ts         entry point
  config.ts, db.ts  environment and Prisma client
  lib/
    auth.ts         Sanctum-compatible bearer tokens, roles
    input.ts        Laravel-style input handling (trim, "" → null, isset)
    dates.ts        the date formats the Laravel API returned
    http.ts         response helpers and HttpError
  modules/<name>/routes.ts
  scripts/          prepare-db (migrations, baseline, seed), seed, seed-demo
prisma/
  schema.prisma     introspected from the Laravel database, then tidied
  migrations/       0_init = the schema as Laravel left it
  seed/             demo-data.json (the former Laravel TestSeeder data)
```

## Compatibility notes

- **Tokens** use Sanctum's format and table, so users logged in through
  Laravel stay logged in after the switch.
- **Passwords** are bcrypt; Laravel's `$2y$` hashes verify unchanged.
- **Input** is trimmed and empty strings become `null`, as Laravel did.
- **Match results** are saved in one transaction. A title match updates the
  championship only the first time its result is recorded; correcting a title
  result to a different winner does not reverse the title change.
- **Response formats** (snake_case vs camelCase, three date styles) copy
  Laravel exactly for now so the frontends keep working unchanged.

## Migration from Laravel

All modules were ported and verified against the `api-tests` contract suite,
which was recorded from the Laravel API. Bugs fixed along the way:

- re-submitting a title match result logged a second defense and double counted
- a video's fighter, club or match link couldn't be cleared
- a fighter's `professionalStatus` was never saved
- recording a result could leave a match half updated (now one transaction)
- missing fields, bad dates and unknown references returned 500 (now 422)
