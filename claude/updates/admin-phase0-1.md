# Update: Admin Phase 0 (fix broken) + Phase 1 (dashboard to-do list)

| | |
|---|---|
| **Status** | Done |
| **Jira** | n/a |
| **Feature** | admin portal (see review in this doc) |
| **Requested by** | vannak070 |

## Current behavior (review 2026-09-26)
- Event page Edit / add fight card / add bout buttons never show: `canEditEvent`
  is read from `usePermissions()` but never defined (EventDetailNewSimple, SubEventDetail).
- BatchDetail saves results with `winnerMethod`/`winnerRound`; the API needs
  `method`/`round`, so it fails (422).
- Permission names no role has: `matches.view_proposals`, `officials.assign`,
  `system.manage_settings` (hide Match Proposals, KKF Officers, Assign Officials,
  Delete Champion even for Super Admin).
- Dead links: `/home/match/new?championId=…`, `/home/champion/:id/schedule-defense`.
- Event page shows "Published" badge and "Unknown Status" field; Program
  overview labels a past event "NEXT UP".
- Dashboard (`pages/Home.tsx`) invents KO rate and fight style from name length,
  counts Draft bouts as upcoming, shows top-win fighters as "champions",
  hard-codes "Morodok Techo Season 2026"; no to-do list.
- Header search and bell do nothing (bell always shows a red dot).

## Requested change
Phase 0: fix the above. Phase 1: dashboard becomes "Needs your attention"
(real to-do items with one-click actions) + real numbers, upcoming events and
recent results; the header bell shows the same to-do count; header search finds
fighters, clubs and events.

## Scope
Out of scope: consolidating duplicate pages (Phase 2), real approvals / Match
Proposals / officials (Phases 3–4), settings (Phase 5).

## Impact
- API: none planned (uses existing endpoints).
- Frontend: admin only.

## Acceptance criteria
- [x] Super Admin sees and can use Edit Event / add fight card / add bout.
- [x] Results save from the fight-card page.
- [x] No menu item or button leads to "page not found".
- [x] Dashboard shows only real data, a to-do list with working actions, and no invented numbers.
- [x] Header search finds fighters/clubs/events; bell count matches the to-do list.
- [x] Admin `vite build` passes; checked in the browser at desktop and phone width.

## Log

### 2026-09-26
**Phase 0 fixes**
- `hooks/usePermissions.ts`: `canEditEvent` = `events.edit` → Edit Event / Add batch / add
  bout visible again (EventDetailNewSimple, SubEventDetail).
- `pages/BatchDetail.tsx`: result payload now `method` + `round` (was rejected);
  imports `html2canvas-pro` (Download report crashed).
- Undefined-name crashes fixed (surfaced once the buttons appeared): `Save` icon in
  EventDetailNewSimple (Edit Event crashed into the error page), `Swords` in
  EventsAndMatches (Events tab drawer), champion types in ChampionDetail,
  `CURRENT_USER` in `data/users.ts`. Admin now has no TS2304/TS2552 errors.
- `data/users.ts`: Super Admin gets `system.manage_settings` (Delete title; API is
  Super Admin only). **Deliberately not granted**: `matches.view_proposals`,
  `officials.assign` — Match Proposals, KKF Officers and Assign Officials run on
  mock data (Assign Officials would save made-up referee ids); they stay hidden
  until Phases 3–4.
- New `pages/ScheduleTitleBout.tsx` at `/home/match/new?championId=` and
  `/home/champion/:id/schedule-defense` (were 404): pick an upcoming fight card →
  `CreateMatchFromBatch` with the title preselected (`?championId=`).
- `components/EventStatusBadge.tsx`: unknown statuses show their name (was
  "Unknown Status" next to "Published"). `ProgramDashboard`: past event shows
  "Last Fight Night / Finished" instead of "Next Up".

**Phase 1**
- `hooks/useAdminOverview.ts`: shared, cached (60 s) overview from the API —
  to-do items (results to record, fighters to verify, draft events, events without
  a fight card, bouts in 14 days with unconfirmed fighters, vacant titles), real
  numbers, upcoming events, recent results.
- `pages/Home.tsx` rewritten: greeting, quick actions (by permission), "Needs your
  attention" groups with actions (staff can **Verify** a fighter in one click via
  `POST /fighters/:id/verify`), real numbers, upcoming fight nights, recent results.
  Removed invented KO rate / fight style, fake champions, hard-coded season.
- Header: `components/HeaderSearch.tsx` (fighters, clubs, events; keyboard
  support); bell links to `/home#todo` and shows the to-do count (no fake dot).

**Verified** (browser, 1440×900 + 375×812): dashboard shows the one real to-do
(10 Jul bout without result) and bell "1"; Record result opens the match page;
search "pich" → Enter opens the fighter; Edit Event opens its panel; Events-tab
drawer opens; title-bout page loads; Program overview says Finished; fight-card
page loads; no horizontal scroll. Admin `vite build` passes; remaining `tsc`
errors are older type mismatches (none undefined names). No data was changed.
Not verified: saving a result from the fight-card page (would write a real result
to the local data); the payload now matches the working match page and the API.

