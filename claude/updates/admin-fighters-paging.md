# Update: page the Fighters list

| | |
|---|---|
| **Status** | Done 2026-10-14 (live since 2026-10-14, 936db4ea) |
| **Jira** | n/a |
| **Feature** | claude/features/fighters.md; follows `updates/admin-performance.md` |
| **Requested by** | Owner ("go ahead with paging the Fighters list") |

## Current behavior
`/home/fighters` loads **every** fighter (732 rows ≈ 215 KB, growing) and **every** bout ever (≈ 530 KB) and filters, searches and sorts them
in the browser (`pages/Fighters.tsx`, `components/fighters/FighterTable.tsx`).

## Requested change
- `GET /fighters/page` (signed in): one page of the list with the screen's filters done by the database — `q`, `origin`, `clubId`,
  `status`, `classId`, `sort`, `limit` (30), `offset` — answering `{ items, total, clubs, noClub, statuses }`.
- The Fighters page asks for 30 at a time ("Show more fighters" adds the next 30), searches on the server (waits for a pause in typing),
  shows the real total, and loads only the upcoming bouts (from today) for the "Next bout" column.
- The club page keeps its own small list; `GET /fighters` is unchanged (other pages use it).

## Why
The page's size no longer grows with the number of fighters or bouts; search and filters still cover every fighter.

## Scope
In scope: the endpoint, `api.fighters.page`, a Fighters page directory component (row markup shared with the club page's table), tests.
Out of scope: the other pages that load the whole fighter list (pickers, header search); changing the screen's look or wording.

## Impact
- API: **new** endpoint, existing ones unchanged. No migration. Admin: Fighters page only.
- Behavior: "N fighters" counts all matches of the filters; sort by name uses the database order (can differ slightly from the browser's
  A–Z for unusual letters).

## Acceptance criteria
- [x] Same fighters appear for every filter / search / sort as before; first load is far smaller.
- [x] Contract suite and typecheck pass; page checked in the browser (EN/KM, phone width — done on the test API).

## Log

- 2026-10-14: `GET /fighters/page` in `backend/src/modules/fighters/routes.ts` (static route, wins over `/fighters/:id`; any signed-in role; `facets()` gives the
  club and status choices over all fighters). Weight class = its range minus the earlier active classes, in Settings order (same rule as `classFor`).
  Admin: `api.fighters.page`, new `components/fighters/FighterDirectory.tsx` (30 per page, "Show more fighters ({n} left)", 300 ms search pause,
  stale answers ignored), `FighterRow` extracted from `FighterTable` (the club page still uses the table, unchanged look), `pages/Fighters.tsx`
  loads weight classes + bouts from today only. Wording: "Fighters shown: {n}" → "Fighters found: {n}" (EN + KM; the club page shares it);
  new `f.more` (EN + KM, Khmer needs KKF review later).
- Test API with 82 fighters: first load of the page's own data = one `/fighters/page` call (30 rows, 18 KB) instead of the whole list
  (≈ 215 KB at 732 fighters), plus upcoming bouts only (was every bout). Search, empty result, filter choices, "Show more" (30 → 60), Khmer + phone width checked.
- Tests: `api-tests/tests/fighters-page.test.ts` (8: paging order + total, search, origin / club / status / sort, weight-class parity with the screen's rule,
  facets, invalid ids, deleted fighters, 401). Suite 372/372; backend + admin typecheck clean.
- Not done: other screens that still load the whole fighter list (Add bout, Quick bouts, Draw, Match changes, Video, Create title, header search).
