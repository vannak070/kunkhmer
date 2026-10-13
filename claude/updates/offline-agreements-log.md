# Update: Offline agreements log + fight night licence (Program workflow phase 4)

| | |
|---|---|
| **Status** | Done (2026-10-13; not committed, not on the live pilot) |
| **Jira** | n/a |
| **Feature** | claude/features/program-workflow.md (phase 4), claude/features/events.md |
| **Requested by** | vannak070 (2026-10-13: "go ahead with phase 4") |

## Current behavior
KKF staff record everything about a fight night; nothing says who agreed what with the broadcaster, or when.
Organizers are read-only in the admin (phase 3 ties each Organizer to its broadcaster). A fight night can be
published as soon as it has a bout (publish guard). There is no licence / permit on a fight night.

## Requested change
Owner choices (2026-10-13):
1. **Organizer records, KKF confirms.** An Organizer records its broadcaster's fight night details and sponsors;
   KKF staff confirm (or send back with a reason). KKF staff can also record and confirm in one step. Bouts,
   fight cards, officials, weigh-in, results and publishing stay KKF-only.
2. **Licence / permit = number, issue date, scan** (PDF or photo). Private: KKF staff and the event's Organizers
   only; never in event responses, the fan site, search or the Hub.
3. **Publishing is blocked** until KKF has confirmed the fight night details (licence included). Adding bouts
   stays free so staff can prepare early.

### Agreements
Two items per fight night, each recorded as a row in a new log `event_agreements`:
- **Fight night details**: name, date, end date, venue, broadcaster, licence number / date / scan.
- **Sponsors**: main sponsor and the sponsor list.

Each row stores the item, a note (what was agreed offline, e.g. "Met TV5 on 10 Oct"), who recorded it and when,
who confirmed it and when, or KKF's reason for sending it back, and a **snapshot** of the item's values at that
moment. An item's state comes from its newest row:
- `none` — never recorded; `waiting` — recorded by an Organizer, waiting for KKF; `returned` — sent back;
- `confirmed` — confirmed and the values still match the snapshot;
- `changed` — confirmed earlier, but the values changed since (must be recorded and confirmed again).
Nothing is ever edited or deleted in the log (deleted only with its fight night).

Rules:
- Recording **details** needs the licence number and date (the scan is optional — KKF may add it later; a later
  scan upload changes the details, so they then need confirming again).
- KKF confirms only the newest waiting row, and only while the values still match what was recorded.
- An Organizer may record, and edit details / licence / sponsors, only on fight nights it can see (its
  broadcaster's or its own) and only before the fight night is published (Published / Completed / Cancelled →
  "ask KKF"). It cannot change the status (with approvals off), organizer or broadcaster.
- **Publish gate**: switching a fight night to Published (PUT) needs details in state `confirmed`
  ("KKF must confirm the fight night details and licence before publishing"). Like the publish guard, it applies
  to the PUT status change; an already published fight night is not taken offline when its details change.

### API
- `GET /events/:id/agreements` — STAFF or an Organizer who can see the event → `{ licence: { number, date,
  hasDocument }, items: { details: { state, agreement }, sponsors: { state, agreement } }, log: [...] }`.
- `POST /events/:id/agreements` `{ item: details|sponsors, note? }` — Organizer → `waiting`; STAFF → `confirmed`
  at once (recorded and confirmed by the same person).
- `POST /events/:id/agreements/:agreementId/confirm` — STAFF.
- `POST /events/:id/agreements/:agreementId/return` `{ comment }` — STAFF.
- `PUT /events/:id/licence` `{ number?, date?, document? }` — STAFF or the Organizer (before publishing); the scan
  is a base64 PDF/photo stored in the private folder (`storePrivateDocument`); `""` clears. The global
  "pictures become files" hook skips this route.
- `GET /events/:id/licence/document` — streams the scan (same people), `Cache-Control: private, no-store`.
- `GET /agreements/waiting` — STAFF: rows waiting for KKF across fight nights (dashboard to-do).
- `PUT /events/:id` — an Organizer may edit fight nights of its broadcaster too (was: only its own), only before
  publishing; the publish gate above.

### Admin
- Fight-night page: new **Agreements** panel (licence with "Edit licence" + "View scan"; one row per item with
  its state chip, note, who/when; buttons by role: Organizer "Record agreement", KKF "Confirm" / "Send back" or
  "Record and confirm"; history list). Organizers get "Edit details" (details + sponsors) and nothing else.
- Publish step: explains that KKF must confirm the details first; the Publish button appears only when confirmed.
- Edit details: an "Other sponsors" list next to the main sponsor (sponsor list), broadcaster fixed for Organizers.
- New fight night: Organizers can create one (their broadcaster, no fight card).
- Dashboard: KKF staff see "Agreements waiting for KKF" to-dos.
- English + Khmer.

## Scope
Out of scope: title selection (built next as phase 5, `updates/fight-night-titles.md`, a third item `titles`), bouts in the log (already recorded with who created them),
withdrawals / postponement (phase 6), settlement (phase 7), notifications to the Organizer.

## Impact
- Database: migration — `events.licence_number`, `licence_date`, `licence_document`; table `event_agreements`.
- API: new endpoints above; event responses unchanged (licence never in them); Organizer edit scope widened to
  its broadcaster's fight nights; publish needs confirmed details.
- Tests: publish tests now record the details first; new `api-tests/tests/agreements.test.ts`.
- Admin: `pages/FightNight.tsx`, new `components/program/AgreementsPanel.tsx`, `FightNightSteps.tsx`,
  `FightNightFields.tsx`, `NewFightNight.tsx`, `data/users.ts`, dashboard to-do, `i18n/program.ts`.

## Acceptance criteria
- [x] Organizer records details / sponsors (waiting); KKF confirms or sends back with a reason; KKF can record and
      confirm in one step; every step stored with who and when.
- [x] Changing confirmed values shows "changed" and blocks publishing until confirmed again.
- [x] Publishing without confirmed details → 422; with them → allowed.
- [x] Licence scan stored privately, readable only by KKF staff and the event's Organizers; never in event
      responses.
- [x] Organizer cannot edit after publishing, cannot touch another broadcaster's fight night, cannot confirm.
- [x] Contract tests; full suite, backend typecheck, admin build; browser check (Organizer + KKF, EN + KM).

## Log
### 2026-10-13
- Migration `20261013130000_event_agreements`: `events.licence_number / licence_date / licence_document`, table
  `event_agreements` (with a serial `seq` for order — several rows can share a second; FK cascade on the event,
  set-null on users). Applied on the dev DB, no drift.
- Backend: new `modules/events/agreements.ts` (endpoints above; `snapshotOf`, `itemState`, `detailsConfirmed`);
  the snapshot shows the licence scan only as yes/no. `events/routes.ts`: Organizer may PUT events it can see,
  nothing but status after publishing (422), publish gate after the publish guard. `app.ts`: route registered,
  `/events/:id/licence` added to the private-route list (scans never become public files).
- Admin: `components/program/AgreementsPanel.tsx` (licence + scan view, item rows with state chips, Confirm /
  Send back / Record (and confirm), history); `FightNight.tsx` loads agreements (staff + Organizer), Organizer
  "Edit details" until publishing, broadcaster locked; `FightNightSteps` publish step waits for confirmed details
  ("Open agreements"), also on Program › Overview; `FightNightFields` "Other sponsors" (sponsor list = main + others);
  `NewFightNight` for Organizers (own broadcaster, no fight card); permission `events.record` (Organizer, kept with
  approvals off; `/home/events/new` guard accepts `events.create|events.record`); New fight night buttons;
  dashboard / Program to-do "Agreements waiting for KKF"; `agr.*`, `form.otherSponsors`,
  `steps.publishNeedsConfirm`, `todo.agreement.*`, `todo.note.agreement*` (EN + KM).
- Tests: new `api-tests/tests/agreements.test.ts` (9 tests, 2 new snapshots); `events.test.ts` confirms the details
  before publishing. Full suite `CI=true`: 20 files, 315 tests pass. Backend typecheck clean; admin `vite build`
  passes; changed admin files add no TypeScript errors.
- Browser check on the test API (temporary admin on :5190): Organizer adds other sponsor, licence with PDF scan,
  records details + sponsors (waiting); KKF officer sees the dashboard to-do, the Publish step blocked, confirms the
  details, sends sponsors back with a reason, publishes; Organizer then sees confirmed / sent back and no edit
  buttons (KM, desktop + phone); Organizer New fight night (KM) with its broadcaster fixed.
- Known: an older fight night published before this change has no agreements — it stays published; the panel
  shows "Not recorded" until KKF records it. Organizers don't get a to-do when KKF sends something back (they see
  it on the fight night page).
