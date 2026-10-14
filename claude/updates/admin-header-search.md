# Update: header search asks the server

| | |
|---|---|
| **Status** | Done 2026-10-14 (live since 2026-10-14, 936db4ea) |
| **Jira** | n/a |
| **Feature** | admin header quick-find (`components/HeaderSearch.tsx`); follows `updates/admin-performance.md` |
| **Requested by** | Owner ("go ahead with the header search") |

## Current behavior
The first click in the search box loads **every** fighter, club and event (≈ 400 KB and growing, three calls) and filters them in the browser by name,
Khmer name, alias, club or place.

## Requested change
`GET /search?q=` (signed in) returns up to 8 fighters, 8 clubs and 8 events that match, found by the database. The box asks (after a short pause in
typing) instead of preloading; the results list, keyboard use (↑ ↓ Enter Esc) and wording stay as they are.

## Why
Nothing is downloaded until someone searches; what is downloaded is a few rows, however many fighters, clubs and events exist.

## Scope
In scope: `GET /search`, `api.search.get`, `HeaderSearch.tsx`, tests.
Out of scope: the pickers on Add bout / Quick bouts / Draw / Match changes / Video / Create title (still load the fighter list).

## Impact
- API: **new** endpoint; no existing endpoint or shape changes. No migration. Admin: header search only.
- Matching: same fields as before (fighter: name, Khmer name, alias, club name; club: name, Khmer name, place; event: name, place; any case).
  An Organizer still sees only its own broadcaster's events. Fighters sort A–Z, clubs A–Z, events newest first; up to 8 of each (the box shows the first 8, fighters first).

## Acceptance criteria
- [x] Typing finds the same people / clubs / events as before; nothing loads on focus.
- [x] Contract suite and typecheck pass; checked in the browser (EN/KM).

## Log

- 2026-10-14: `GET /search?q=` in new `backend/src/modules/search/routes.ts` (signed in, any role; `contains` + case-insensitive; 8 of each; Organizer event scope;
  soft-deleted fighters left out), registered in `app.ts`. Admin: `api.search.get`; `HeaderSearch.tsx` no longer preloads on focus — asks 250 ms after typing
  stops, ignores stale answers, shows "Searching…", and a short message if the call fails. Results, keyboard use and look unchanged.
- Test API: focusing the box makes no request; typing "sok" = one `/search` call of 197 bytes (before: three list calls, ≈ 400 KB on first focus). Enter opens the first result.
- Tests: `api-tests/tests/search.test.ts` (401, any case, alias / club / Khmer / place matches, limits + empty term, deleted fighter + Organizer scope, shape snapshot).
  Suite 377/377; admin typecheck clean for the changed files; backend typecheck clean.
- Not checked: Khmer UI and phone width for the search box (strings unchanged apart from the new English-only failure message, which matches the box's existing English-only texts).
