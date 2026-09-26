# Update: Replace the Laravel backend with Node.js

| | |
|---|---|
| **Status** | Done (2026-09-26) |
| **Jira** | n/a |
| **Feature** | all backend features |
| **Requested by** | project owner |

## Current behavior (before)
PHP/Laravel 13 API in `backend/` with plain-text passwords, missing role checks
and several bugs.

## Requested change
Rewrite the API in Node.js without changing what the frontends see.

## Scope
In scope: all 9 modules, database schema ownership, Docker, demo data.
Out of scope: frontend changes, response format cleanup.

## Impact
- API responses: unchanged (verified by 135 contract tests recorded from Laravel).
- Database: same PostgreSQL data; Prisma baseline `0_init` + migration dropping
  Laravel-only tables. Existing logins and password hashes keep working.

## Log
- `1522320b` Laravel security fixes first (hashed passwords, role checks).
- `a9946259` `api-tests/` contract suite recorded from Laravel.
- `3bba3e86` … `ee54ef2a` modules ported: Auth, Clubs, Fighters, Settings,
  Events, Matches, Champions, News, Videos.
- `da040103` Prisma migrations + Docker services.
- `d2dd1eaf` switchover: Node is `backend/`, Laravel removed (still in history).
- Bugs fixed on the way: title results double counted on re-submit; video
  links couldn't be cleared; `professionalStatus` never saved; results could
  half-save (now a transaction); bad input gave 500 (now 422).
