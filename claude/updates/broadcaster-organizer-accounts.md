# Update: Broadcaster = Organizer accounts (Program workflow phase 3)

| | |
|---|---|
| **Status** | Done (2026-10-13; committed 399e58f8, not on the live pilot yet) |
| **Jira** | n/a |
| **Feature** | claude/features/program-workflow.md (phase 3), claude/features/auth-users.md, claude/features/partners.md |
| **Requested by** | vannak070 (2026-10-13: "go ahead with phase 3") |

## Current behavior
An Organizer is a user with no link to a broadcaster. Any signed-in user, Organizers included, gets every event,
fight card and bout from the API, drafts too. An event has a separate `organizer_id` (a user) and
`broadcast_station_id`, which nothing keeps in step. In the admin, Organizers are read-only (approvals off).

## Requested change
Decision 4 of the Program workflow: the broadcast station *is* the broadcaster; KKF enables Organizer accounts
under it. Owner choices (2026-10-13):
1. **Several Organizer accounts per broadcaster** (one login per person of the broadcaster).
2. **See only, for now**: an Organizer sees its broadcaster's fight nights, cards and bouts, read-only in the admin.
   Recording and confirming by role comes in phase 4 (offline-agreements log).
3. **A broadcaster stays optional on a fight night**; an event has at most one.

What changes:
- `users.broadcast_station_id` (nullable, FK to `broadcast_stations`, cleared if the station is deleted).
- Users API: `broadcastStationId` on `POST /users` / `PUT /users/:id` (only kept for role Organizer; `""` clears;
  an unknown station → 422) and in the user response (`formatUser`, additive). The admin requires it for a new
  Organizer; the API keeps it optional so an Organizer without a broadcaster still works (sees only events it
  organizes).
- **What an Organizer sees** (`GET /events`, `/events/:id`, `/matches/batches[/:id]`, `/matches[/:id]`): only events of
  its broadcaster plus events it organizes. Another broadcaster's event is "not found". Staff and other roles
  unchanged; fans/public unchanged.
- **Organizer and broadcaster agree**: an event's organizer may be an Organizer only of the event's broadcaster
  (422 otherwise). When staff move an event to another broadcaster (or remove it), an Organizer of the old one is
  replaced by the staff member making the change. An Organizer creating an event (approvals mode) gets its own
  broadcaster and cannot move it to another.
- Admin: Users page — role Organizer asks for the **Broadcaster** (required), the list shows it under the role;
  Broadcasters page — each broadcaster shows its Organizer accounts and an **Add organizer account** button
  (Super Admin) that opens Users with the role and broadcaster filled in.

## Scope
Out of scope: Organizer write rights in the admin (phase 4); belts (phase 5); the public site; existing API write
rules for Organizers in approvals mode (unchanged: own events only).

## Impact
- Database: migration `users.broadcast_station_id`.
- API: additive `broadcastStationId` on users; Organizer read scoping; organizer/broadcaster agreement rule.
  Snapshots: users shapes gain `broadcastStationId` (deliberate).
- Frontend (admin): `pages/UserManagement.tsx`, `pages/StrategicPartners.tsx`, `i18n/program.ts`.

## Acceptance criteria
- [x] Super Admin creates an Organizer for a broadcaster; several per broadcaster work; changing the role away
      from Organizer drops the link.
- [x] An Organizer sees only its broadcaster's (and its own) events, cards and bouts; others are not found.
- [x] Organizer/broadcaster agreement enforced (422 on mismatch; replaced on broadcaster change).
- [x] Contract tests for all of the above; full suite, backend typecheck, admin build pass; admin checked in the
      browser (EN + KM).

## Log
### 2026-10-13
- Migration `20261013120000_user_broadcast_station`: `users.broadcast_station_id` (FK, `ON DELETE SET NULL`,
  indexed); `BroadcastStation.organizers` relation.
- `auth/routes.ts`: `broadcasterFor()` keeps the link only for Organizers (unknown/invalid id → 422, `""` clears,
  role change away from Organizer drops it); `formatUser` returns `broadcastStationId`.
- `events/routes.ts`: `eventScope()` / `canSeeEvent()` (Organizer = own broadcaster's events + events it
  organizes); `POST /events` by an Organizer uses its own broadcaster; a non-staff PUT can't change the
  broadcaster (403); staff PUT runs `agreeingOrganizer()` — an explicit Organizer of another broadcaster → 422,
  an old one is replaced by the staff member when the broadcaster changes or is removed. Side fix: staff can now
  remove an event's broadcaster (`broadcastStationId: ""`), which `pick()` skipped before.
- `matches/routes.ts`: `/matches/batches[/:id]` and `/matches[/:id]` use the same scope for Organizers
  (other broadcasters' cards/bouts → 404).
- Admin: Users dialog asks for the Broadcaster (required for Organizer), list shows it under the role,
  `?role=&station=` prefill; Broadcasters cards (Super Admin) list Organizer accounts + "Add organizer account";
  `users.station*`, `users.noStation`, `par.organizers`, `par.noOrganizers`, `par.addOrganizer` (EN + KM),
  Organizer role description updated.
- Tests: new `api-tests/tests/broadcaster-organizers.test.ts` (12 tests); `events.test.ts` links the test
  Organizer to its station (its events now take its own broadcaster); users snapshots gain
  `broadcastStationId: null` (deliberate, `auth.test.ts.snap` +4 lines). Full suite `CI=true`: 19 files,
  306 tests pass. Backend typecheck clean; admin `vite build` passes, changed pages add no TypeScript errors.
- Browser check on the test API (temporary admin on :5190): Users list + dialog (prefilled from the
  Broadcasters card, required-field error) in EN and KM, phone width KM; Broadcasters cards in EN and KM; an
  account created from the card is saved with its broadcaster; TV5's Organizer sees only TV5's fight night in
  Program.
- Live pilot: needs the migration on deploy (applied automatically on start).
