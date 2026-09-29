# Kun Khmer — how the agent must work on this repo

Management platform for the **Kun Khmer Federation (KKF)**, the body governing
Cambodian kickboxing: fighters, clubs, events, weekly fight cards, match
results, championship titles, news and videos.

## Repo map

```
backend/          Node.js API — Fastify 5, Prisma 7, TypeScript, PostgreSQL
frontend/admin/   Staff system (React 18, Vite 6, Tailwind 4, shadcn/Radix + MUI) :5175
frontend/public/  Fan website (same stack) :5176
api-tests/        Black-box HTTP contract tests (Vitest) for the API
claude/           This context pack
docker-compose.yml
```

Both frontends proxy `/api` to the backend (`backend:3001` in Docker), so
they never need the backend's host.

## Commands

```bash
docker compose up -d                                   # postgres, backend :3001, admin :5175, public :5176
docker compose --profile test up -d backend-test       # test API :3002, DB rebuilt on every start
npm run test:api                                       # contract tests against :3002
docker exec kunkhmer_backend npm run db:seed:demo -- --reset   # demo data (WIPES all data)
cd backend && npm run typecheck                        # TypeScript check
cd backend && npm run db:migrate                       # create a migration after editing schema.prisma
cd deploy && docker compose -f docker-compose.prod.yml up -d --build   # production (see deploy/README.md)
```

Postgres is on host port **5436** (5432 is taken by another project), set in
the untracked `docker-compose.override.yml`. Default login: `admin` / `admin123`.

Optional AI chat: `ANTHROPIC_API_KEY` in `backend/.env` turns on KUNKHMER HUB,
the public site's `/hub` page (see `features/ai-assistant.md`); the test API forces `AI_ENABLED=false`.
`AI_MONTHLY_CAP_USD` (default 50) pauses it for the month; answers are logged anonymously
(`hub_logs`) and reviewed in the admin under "Hub answers". KKF staff also get a read-only
"Staff assistant" in the admin (`updates/hub-phase-d2-staff-assistant.md`; staff answers record who asked). Sport knowledge comes from
published articles in the admin "Knowledge base" (`features/knowledge-base.md`; starter drafts:
`docker exec kunkhmer_backend npm run db:seed:knowledge`, adds Drafts only).
Per-IP rate limits use the visitor's real IP from our own proxy (`lib/clientIp.ts`,
optional `TRUST_PROXY`; see `updates/rate-limit-real-client-ip.md`).

## How to work

1. **Read before changing.** Read this file, then the relevant
   `claude/features/*.md` before touching a domain. They describe current
   behavior, rules and known gaps.
2. **New feature** → create `claude/features/<name>.md` from
   `claude/templates/feature.md` first. Ask the user about every TBD / open
   question before building.
3. **Change to existing behavior** → create `claude/updates/<name>.md` from
   `claude/templates/update.md`, then fill in its Log when done.
4. **Keep the pack current.** When behavior changes, update the feature file in
   the same change. Stale docs are worse than none.
5. **Verify, don't assume.** Backend changes: `npm run typecheck` and the full
   contract suite (`npm run test:api`) must pass. UI changes: follow
   `claude/tests/test-admin-ui.md` in the browser. Report failures with output.

## API contract (don't break the frontends)

- Every response is `{ success: true, data }` or `{ success: false, error }`;
  401 is `{ message: "Unauthenticated." }`.
- Response shapes are fixed and the frontends depend on them: some modules
  return snake_case rows with nested relations (events, matches, champions,
  news, videos, settings, clubs), others camelCase (users, fighters), plus
  three date formats. The admin UI depends on these. **Do not "clean up" a
  shape** without an update doc, updated snapshots and updated frontends.
- `api-tests/tests/__snapshots__/` pins every response shape. Run with
  `CI=true` so a mismatch fails. Only `npm run test:update` (in `api-tests/`)
  when a shape change is intentional.
- New endpoint → add contract tests in `api-tests/tests/` (see the existing
  files for the pattern: own actors per file, shape snapshots, role checks).

## Backend conventions (`backend/src/`)

- One module per domain: `modules/<name>/routes.ts` (a Fastify plugin),
  registered in `app.ts` under `/api`. Public routes first; writes inside
  `app.register(... addHook("preHandler", requireAuth))`.
- **Permissions on every write**: `requireRole(request, STAFF)` etc. from
  `lib/auth.ts`. Roles are strings: `Super Admin`, `KKF Officer`,
  `Organizer`, `Club/Gym`, `Referee`, `Judge`. `STAFF` = Super Admin + KKF Officer.
- **Input** (`lib/input.ts`): strings trimmed, `""`
  becomes `null`; `has(k)` = present and not null; `get(k, fallback)`;
  `required(k)` throws 422; `present(k)` = key sent at all (use it when an
  empty value must clear a field).
- **Errors**: throw `HttpError(status, msg)`, `notFound("Thing")`,
  `forbidden()`. Non-UUID ids are 404 via `idParam()`. Prisma unique/foreign
  key errors become 422 automatically.
- **Dates** (`lib/dates.ts`): use `now()` (whole seconds, UTC) and set
  `created_at`/`updated_at` yourself on create/update. Serialize with
  `micro` / `iso` / `sql` / `dateOnly` to match the existing field.
- **Pictures**: the admin sends base64 data URIs; a request hook stores them as files
  (`lib/files.ts`, `UPLOAD_DIR`, default `backend/storage/uploads` — must persist on a server) and saves
  the link `/api/files/<hash>.<ext>` instead. Never store base64 in the database
  (`updates/images-as-files.md`).
- **Soft deletes**: fighters and videos have `deleted_at`. Always filter with
  `NOT_DELETED` and wrap related fighters with `visibleFighter()`.
- **Multi-table writes** go in `prisma.$transaction` (see `matches/results.ts`).
- Serializers per model (`userArray`, `fighterArray`, `eventArray`, ...) are
  exported from their module; reuse them for nested relations.

## Public site conventions (`frontend/public/`)

Read `claude/features/public-site.md` first. In short: show only real data (hide
what's missing), never show internal statuses or system account names, put every
string in `i18n/messages.ts` (English + Khmer), give shareable views a real URL,
and use the brand tokens in `src/styles/brand.css`. Check UI changes at desktop
and phone width in both languages.

## Database

- Prisma owns the schema: `backend/prisma/schema.prisma` + `prisma/migrations/`.
  Edit the schema, run `npm run db:migrate`, commit the migration. Never edit
  an applied migration.
- On every start `src/scripts/prepare-db.ts` creates the DB if missing,
  baselines a database that predates migrations, applies migrations and seeds the admin.
- Demo data lives in `backend/prisma/seed/demo-data.json`.

## Security

- Passwords: bcrypt (`bcryptjs`, 12 rounds). Tokens: `"<id>|<secret>"` bearer
  tokens, hashed in `personal_access_tokens`; logging in revokes earlier tokens.
- Public-site fans are a separate account type with their own `kkf_` tokens
  (`lib/fanAuth.ts`); never mix them with staff auth — see `features/fan-accounts.md`.
- Never commit `.env` files. Never log tokens or password hashes.
- Only use test credentials from the seed data when testing locally.

## Git

- Work on `dev`; `main` is the release branch. Remote: `origin` →
  `github.com/vannak070/kunkhmer` only (no HOVA remotes or hosting).
- Commit only when asked. The user often has their own uncommitted frontend
  work — **stage only files you changed**, never `git add -A` at the root.
- Commit messages: imperative subject, short body, ending with the
  `Co-Authored-By` trailer your session specifies.

## Known gaps and tech debt

- Settings lists (weight classes, venues, bout rules, gloves) are on the API
  since Phase 5 (`features/settings.md`). Create Match / titles keep a
  separate agreed-weight list (51, 54, 57 … kg) by decision. UI says "Fight card"; code/API
  still say batch / sub_event.
- Staff login is rate-limited in memory (`lib/loginThrottle.ts`, failed attempts only; one API instance).
  (Fighter edits are now STAFF + own-club only.)
- Correcting a title match result to a different winner doesn't reverse the
  title change (the championship updates on the first result only).
- `utils/api.ts` and parts of `data/` are duplicated between the two
  frontends; no frontend tests.
- The default admin password `admin123` must be changed on any real server.
- Deployment: README demo URLs still point at the old host; the user will set
  up new hosting — `deploy/README.md` + the go-live checklist in `features/public-site.md`.
