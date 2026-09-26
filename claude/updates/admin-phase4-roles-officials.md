# Update: Phase 4 — roles and officials

| | |
|---|---|
| **Status** | Done — 2026-09-26 (committed e1860eb8) |
| **Jira** | n/a |
| **Feature** | officials.md (new), auth-users.md, matches-results.md, fighters.md |
| **Requested by** | vannak070 |

## Current behavior
Roles (`data/users.ts`, `components/Layout.tsx`)
- The admin maps API roles to UI roles; **Referee and Judge fall through to
  `club`**, so they get the club menu and club permissions in the UI.
- Menu items without a permission are shown to every role: Media, Strategic
  Partners, System Settings, Process Flow. Clubs (and officials) see them,
  although only KKF staff can write there (API is STAFF-only).
- Pages are reachable by URL whatever the role; only the menu hides them.

Organizers
- Any Organizer can edit **any** fight card (`PUT /matches/batches/:id`) and
  bout (`PUT /matches/:id`), not only those of their own events (events
  themselves are already own-only since Phase 3a).
- `POST /fighters` accepts any signed-in role (Organizer, Referee, Judge too).

Officials (referees and judges)
- Real officials exist as **user accounts** with role `Referee` / `Judge`
  (demo data has 6 + 7); `matches.referee_id` is a FK to users, `judge_ids` a
  JSON list of user ids.
- The admin doesn't read them: `utils/officialsStore.ts` keeps a copy of
  `data/officials.ts` (names, grade, experience, Available/Busy) in
  **localStorage**, used by AssignOfficials, BatchDetail, MatchDetail,
  MatchesEnhanced, SystemSettings and the "KKF Officers" page (which is really
  a referee/judge register; hidden from the menu). Officials added there exist
  only in one browser, and assigning them saves ids that aren't users.
- Nobody but the Super Admin can list users (`GET /users`), so organizers and
  officers have no API to pick officials from.
- Referee/Judge accounts can sign in but have nothing of their own to do.

## Requested change
Roles
- Referee and Judge get their own UI role (no club permissions).
- Menu by role: Media, Partners and System Settings only for roles that can use
  them; route guard so a hidden page shows "not available for your role".

Organizers (decision 4)
- Fight cards: create only in their own events; edit/delete only their own
  events' cards. Bouts: create/edit only in their own events. 403 otherwise.
- `POST /fighters`: STAFF and Club/Gym only (Organizer, Referee, Judge → 403).

Officials
- New `GET /officials` (STAFF, Organizer): Referee/Judge accounts with the
  details below; admin reads officials only from it (localStorage store and
  mock data removed).
- "KKF Officers" page becomes **Officials** on real data (list, add, edit,
  deactivate) for KKF staff; the duplicate list in System Settings goes.
- Assigning a referee/judge checks the id is an active official (422 otherwise).
- Only KKF staff set `refereeId` / `judgeIds` (on create or update); an
  Organizer sending them gets 403. Organizers see who is assigned.
- Officials keep `official_grade` (International A / National A / National B)
  and `official_since` (year started). "Busy" is computed: bouts already
  assigned to them on that fight night (shown, not blocking — a referee often
  works several bouts a night).
- Referee/Judge sign-in: "My bouts" (`GET /officials/me/bouts`), read-only;
  nothing else in the menu.

## Impact
- API: new `/officials` endpoints (own shape; `/users` shapes unchanged);
  stricter permissions on batch/match/fighter writes (403 for roles that could
  write before); officials assigned to bouts must be real active officials (422).
- Database: `users.official_grade`, `users.official_since` (one migration).
- Admin: Layout/menu, users.ts roles, Officials page, AssignOfficials,
  BatchDetail, MatchDetail, MatchesEnhanced, SystemSettings.

## Decisions (2026-09-26)
1. KKF staff (Super Admin, KKF Officer) assign referees and judges; organizers
   only see the assignment.
2. Grade + year started on each official; busy = already assigned that fight
   night, computed.
3. Referees/judges see a read-only "My bouts" list and nothing else.
4. Organizers: only their own events' fight cards and bouts; no fighter
   registration (clubs and KKF staff register fighters).

## Acceptance criteria
- [x] Contract tests for the new endpoints and every tightened permission;
      full suite passes with `CI=true`.
- [x] Each role sees only menu items it can use; hidden pages are guarded.
- [x] Officials come from the API everywhere; no localStorage officials.
- [x] Admin build passes; browser check per role, desktop + phone.

## Log

### 2026-09-26
- Migration `20260927000005_official_details`: `users.official_grade`,
  `users.official_since`. Demo data: the 13 demo referees/judges get the grade
  and experience the admin's old mock list showed.
- Backend: `modules/officials/routes.ts` (list with busy counts, create, edit,
  my bouts, `assertOfficials`); `Role.Referee/Judge`, `OFFICIALS` in
  `lib/auth.ts`; matches: organizer own-event checks on cards and bouts,
  STAFF-only official changes + validation; fighters: create for STAFF + Club.
- Tests: new `officials.test.ts` (9 cases); matches: organizer ownership (2) and
  officials (2), the match tests' event now belongs to the test organizer and
  uses real judges; fighters: organizer/referee can't register (2), the
  status test registers as a club. Snapshots: additions + `judge_ids` item
  shape string → uuid. `CI=true` 191/191; typecheck clean.
- Admin: roles `official` / `none` (Referee/Judge no longer act as club);
  permissions for dashboard, officials, content, partners, settings, process
  flow, clubs; KKF Officer loses `users.view` (Users is Super Admin only).
  Layout: menu by permission, page guard + "Not available for your role",
  signed-out → `/login`, no search/bell/dashboard data for officials, phone
  nav from allowed items. New Officials and My bouts pages; `useOfficials`
  replaces `utils/officialsStore.ts` + `data/officials.ts` (deleted) and the old
  KKFOfficers page (deleted); System Settings loses its referee/judge lists.
  Fight card + event page: organizers get edit controls only on their own
  events; only staff see Assign officials / Record result; Add/Edit club only
  for staff.
- Browser check with temporary accounts (deleted after; the bout's officials
  restored): admin Officials page + add judge dialog + real officials in the
  fight-card picker with "1 bout that night"; referee → My bouts only, other
  pages guarded, phone width; organizer menu, no edit controls on another
  organizer's event/fight card, Media guarded; club menu, no Add Club.
- Note: the dev database had no Referee/Judge accounts; add them on Officials
  (demo data has 13).
