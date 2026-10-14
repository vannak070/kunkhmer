# Update: admin performance review and fixes

| | |
|---|---|
| **Status** | Done 2026-10-14 (live since 2026-10-14, 936db4ea) |
| **Jira** | n/a |
| **Feature** | admin-pwa.md, claude/updates/admin-pwa-performance.md (earlier loading work) |
| **Requested by** | Owner ("review the entire system, especially the admin portal — it is very slow") |

## What was measured (2026-10-14)
Setup: production build and dev server of the admin against the test API with 181 matches (events), 253 bouts, 732 fighters
(a realistic few months of data; the owner's dev DB has only 5 matches / 9 bouts / 35 fighters, the live pilot is nearly empty).

1. **Opening one page downloads the whole database several times.** `/home/matches` fired **12 API calls, 3.66 MB of JSON**:
   `/events` twice (360 KB each), `/matches` twice (1 MB each), fighters 430 KB, batches 374 KB, champions, clubs, agreements,
   disputes. Each list call is the *entire* history, sorted and filtered in the browser. It grows with every match (about 4 KB per
   bout, 2 KB per match: a year of 1,000 matches ≈ 20 MB per page open).
2. **The Layout loads the dashboard overview (8 calls) on every page** for the bell count, and the page loads its own lists again,
   so the same endpoint is requested two to three times.
3. **`usePermissions` re-rendered every page 10 times a second**: a 100 ms timer rebuilt the user object (JSON parse of localStorage)
   and set it as new state, so every component that asks about permissions re-rendered forever (≈ 200 localStorage reads per second
   at idle). Harmless on a fast laptop, heavy on a phone.
4. **Database**: no index on `matches.event_id`, `sub_event_id`, `fighter_a_id`, `fighter_b_id`, `sub_events.event_id`, `events.date`,
   `fighters.club_id` — every lookup (and the KKF rules check on every bout) scans the table. Fine at today's size, slow later.
5. **API responses are not compressed** by the backend. The live server's Caddy compresses (verified: `content-encoding: gzip`), the
   dev stack (Vite proxy) does not.
6. **The live admin is still the old build** (server at 03a5f440): 421 KB gzip of JavaScript (1.5 MB raw), a 2.8 MB favicon, a 1 MB logo and
   a 620 KB map PNG, Google Fonts — about 4 MB before the first screen. The fast build (first English screen ≈ 190 KB) exists in dev
   but is **not deployed**. Server responses themselves are quick (100–300 ms).
7. Dev mode (`:5175`, Vite) serves hundreds of unbundled files; the login page alone is 45 requests / 4.6 MB (the 284 KB text dictionary
   is one of them). That is normal for a dev server and not what staff will see.

## Changes (this update)
- **Permissions**: no 100 ms re-render loop; the current user is parsed once per change and cached.
- **Requests**: identical in-flight GETs are shared and list results are kept for a few seconds; any write clears the cache.
- **Windows**: `GET /events`, `/matches`, `/matches/batches` accept optional `from` / `to` (YYYY-MM-DD) on the match date. The dashboard
  overview asks for the last six months onward (`recentFrom()` in `utils/api.ts`, one value so the Matches page shares the same requests); the Matches page
  uses the same window and the Past tab has "Show older matches". The Week board loads only the shown week. Detail pages ask only for their
  fighter / club / title (`?fighterId=`, `?clubId=`, `?championshipId=`).
- **Database**: one migration adds the missing indexes (additive).
- **Not changed here**: the API keeps its shapes; the live server is untouched (deploy only when the owner asks).

## Impact
API additive (new optional query parameters); one additive migration; admin frontend. Dashboard "Results recorded" now counts the
last six months (the label says so, EN + KM). A date that can't be read in `from` / `to` answers 422.

## Acceptance criteria
- [x] Opening `/home/matches` makes far fewer / smaller requests than 12 calls / 3.66 MB on the same data; idle CPU churn gone.
- [x] Contract suite passes; new tests for the filters.
- [x] Typecheck clean; pages checked in the browser.

## Log

- 2026-10-14: `/home/matches` on the test API (same data): 12 calls / 3.66 MB → **10 calls / 1.16 MB** (the test database also holds
  hundreds of far-future test matches that an open-ended "from" window still includes; real data is mostly past, so the saving is larger
  there and grows as history does). API calls 400–500 ms → 150–200 ms (shared requests, fewer rows). Dashboard: 7 calls / 0.96 MB.
  Fighter detail asks `/matches?fighterId=` (0 KB instead of the whole list). Week board asks `?from&to` for its week.
- Contract suite 359/359 (new `list-windows.test.ts`: date windows, fighter / club filters, bad ids, public stays public-only).
  Admin typecheck: only the old `data/users.ts` errors remain. Browser: Matches (Upcoming / Past + "Show older" / Week), dashboard,
  fighter detail load without console errors.
- Migration `20261014130000_perf_indexes` applied on the dev and test databases.
- Follow-up done the same day: one `/overview` call for the dashboard and bell (`updates/admin-overview-endpoint.md`).
- Still open: the live admin is the old ~4 MB build (the fast build is not deployed); paging the Fighters list (732 rows ≈ 215 KB); `/home/fighters` and detail pages still load unwindowed
  event lists; the champion detail page's bouts-of-title filter (`championshipId`) has no dedicated test (checked with unknown ids only).
