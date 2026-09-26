# Kun Khmer API (Node.js)

Fastify + Prisma + TypeScript rewrite of the Laravel API in `../backend`.
It uses the same PostgreSQL database and must return the same responses, which
`../api-tests` verifies.

## Setup

```bash
cp .env.example .env      # point DATABASE_URL at your database
npm install
npm run db:generate       # generate the Prisma client
npm run dev               # http://localhost:3003 (PORT in .env)
```

## Checking against the contract tests

```bash
docker compose --profile test up -d backend-test   # resets kunkhmer_test
npm run dev                                         # .env points at kunkhmer_test
npm run test:api                                    # in another terminal
```

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
prisma/schema.prisma  introspected from the existing database
```

## Compatibility notes

- **Tokens** use Sanctum's format and table, so users logged in through
  Laravel stay logged in after the switch.
- **Passwords** are bcrypt; Laravel's `$2y$` hashes verify unchanged.
- **Input** is trimmed and empty strings become `null`, as Laravel did.
- **Response formats** (snake_case vs camelCase, three date styles) copy
  Laravel exactly for now so the frontends keep working unchanged.

## Migration status

| Module | Status |
|---|---|
| Auth / Users | ported |
| Clubs | ported |
| Fighters | ported (also fixes `professionalStatus` never being saved) |
| Events, Matches, Champions, News, Videos, Settings | to do |
