# Update: Pilot fixes — first admin password and router security update

| | |
|---|---|
| **Status** | Done (2026-09-30, uncommitted) |
| **Jira** | n/a |
| **Feature** | claude/updates/go-live-setup.md, claude/features/public-site.md |
| **Requested by** | vannak070 (2026-09-30: production-readiness review for pilot testing → "do fixes 2 and 5 now") |

## Current behavior
- **First admin password.** On a new, empty database the backend creates `admin` with the password
  `SEED_ADMIN_PASSWORD`, or `admin123` when it isn't set (`backend/src/scripts/seed.ts`). The production setup
  (`deploy/docker-compose.prod.yml`, `deploy/.env.example`) never passes `SEED_ADMIN_PASSWORD`, so a new server
  is on the internet with `admin` / `admin123` until someone signs in and changes it. An empty
  `SEED_ADMIN_PASSWORD=` would even create the admin with an empty password (`??` keeps `""`).
- **Router.** Both frontends pin `react-router` 7.13.0, which `npm audit` reports as high severity
  (turbo-stream deserialization and RSC redirect XSS advisories, fixed by 7.15.0).

## Requested change
1. Production requires `SEED_ADMIN_PASSWORD` in `deploy/.env` (at least 8 characters, same rule as
   password changes) and passes it to the backend, so the first admin never has `admin123`.
   `seed.ts` treats an empty value as unset and refuses a value shorter than 8 characters.
2. `react-router` 7.13.0 → 7.18.4 in `frontend/admin` and `frontend/public` (same major version).

## Why
Pilot with real data: no known-password window on a public server, and no dependency with published
high-severity advisories.

## Scope
In scope: `backend/src/scripts/seed.ts`, `deploy/docker-compose.prod.yml`, `deploy/.env.example`,
`deploy/README.md`; `package.json` + `package-lock.json` of both frontends.
Out of scope: local development (still `admin` / `admin123` when `SEED_ADMIN_PASSWORD` isn't set);
accounts copied from a computer with `export-local.sh` (they keep their passwords — README already says to
change `admin` right after); the backend audit warnings (Prisma CLI's MySQL driver, not used with Postgres).

## Impact
- API response shape changes? No.
- Database migration needed? No.
- Frontend pages affected: none visibly (router library update only).

## Acceptance criteria
- [x] Production compose refuses to start without `SEED_ADMIN_PASSWORD`; the backend gets it.
- [x] Empty value → local default; value under 8 characters → clear error, no admin created.
- [x] Both frontends on react-router 7.18.4; `npm audit --omit=dev` clean for them; builds pass; pages load.
- [x] Backend typecheck and contract suite pass.

## Log
### 2026-09-30
- `backend/src/scripts/seed.ts`: an empty `SEED_ADMIN_PASSWORD` counts as unset (local default `admin123`);
  a value under 8 characters stops the start with "SEED_ADMIN_PASSWORD must be at least 8 characters — the
  Super Admin was not created". The value itself is not trimmed.
- `deploy/docker-compose.prod.yml`: backend gets `SEED_ADMIN_PASSWORD`, required (`:?`), so
  `docker compose up` refuses to start without it. `deploy/.env.example` + `deploy/README.md` (first install
  and "Right after the first start") explain it; README keeps the note to change `admin` after a data move.
- `claude/config.md` (Known gaps) and `features/public-site.md` (go-live checklist) updated.
- `react-router` 7.13.0 → 7.18.4 (exact pin) in `frontend/admin` and `frontend/public`, `package.json` +
  `package-lock.json`, installed in the running containers. Only the version line changes in `package.json`.
- Checks: production compose config fails without the password and passes it through when set; seed on a
  throw-away database `kk_seedcheck` (dropped after): short → error, no admin; empty → `admin123`;
  `longenough1` → that password, not `admin123`. Backend typecheck (in the container) clean; contract suite
  275/275; `npm audit --omit=dev` 0 vulnerabilities in both frontends; both `vite build`s pass; fan site
  fighters list → profile link routes with no console errors; admin (throw-away copy on the test API)
  menu links, Profile and browser Back route correctly.
- Not changed: backend audit warnings (Prisma CLI's bundled `mysql2` / `deepmerge-ts`; the suggested "fix"
  is a downgrade to Prisma 6; not used at run time with Postgres).
