# Update: Titles on a fight night (Program workflow phase 5, belts)

| | |
|---|---|
| **Status** | Done (2026-10-13; committed 399e58f8, not on the live pilot yet) |
| **Jira** | n/a |
| **Feature** | claude/features/program-workflow.md (phase 5), claude/features/champions.md, claude/updates/offline-agreements-log.md |
| **Requested by** | vannak070 (2026-10-13: "go ahead with phase 5") |

## Current behavior
KKF staff create title belts (`champions`). Any bout can be marked as a title bout for any belt
(`matches.championship_id`); nothing says which belts a fight night puts on the line, and nobody agrees it.

## Requested change
Decision 3 of the Program workflow: KKF creates the belt; the Organizer selects which titles are contested at its
fight night; KKF confirms (agreed offline first). Owner choices (2026-10-13):
1. **Several titles** per fight night.
2. **Title bouts only warn**: a bout for a title that is not on the fight night's confirmed title list is still
   created, with a warning (not blocked).
3. **Publishing waits** for KKF to confirm the title list when the fight night has any titles; a fight night
   without titles is not affected.
4. **Fan site: not now** (title bouts already show their belt there).

What changes:
- New table `event_titles` (fight night ↔ belt). `PUT /events/:id/titles { titleIds }` — KKF staff, or the
  Organizer before publishing (same rules as the licence). Only existing, approved belts. The list is not part of
  event responses; it comes with `GET /events/:id/agreements` (`titles: [...]`).
- Agreements log: a third item **titles** (snapshot = the selected belt ids). Recorded by the Organizer, confirmed /
  sent back by KKF, or recorded and confirmed by KKF in one step — exactly like details and sponsors. Recording an
  empty title list is refused (nothing to agree).
- Publish gate: details confirmed (phase 4) **and**, when titles are selected, titles confirmed
  ("KKF must confirm the titles on this fight night before publishing").
- Title bouts: `POST /matches`, `PUT /matches/:id` (title changed) and `POST /matches/check` (new optional
  `championshipId`) add a warning `title_list` when the belt is not on the fight night's list, or the list is not
  confirmed yet. Warnings come back in `warnings` as for the matching rules.
- Admin: Agreements panel row "Titles on the line" (selected belts with holder, "Choose titles" dialog); publish
  step waits for it; Add bout shows the warning; dashboard to-do names the titles item. English + Khmer.

## Scope
Out of scope: Organizers proposing new belts (KKF creates belts), the fan site, changing how results move titles.

## Impact
- Database: migration — table `event_titles`.
- API: new `PUT /events/:id/titles`; `GET /events/:id/agreements` gains `titles` and `items.titles`
  (snapshot of the new endpoint updated); `/matches/check` accepts `championshipId`; title bouts may carry a
  `title_list` warning. Event and match shapes unchanged.
- Admin: `AgreementsPanel.tsx`, `FightNight.tsx`, `FightNightSteps.tsx`, `ProgramOverview.tsx`, `AddBout.tsx`,
  `useAdminOverview.ts`, `utils/api.ts`, `i18n/program.ts`.

## Acceptance criteria
- [x] Organizer selects several titles before publishing; KKF can too; unknown belts → 422; another broadcaster →
      404.
- [x] Titles are recorded / confirmed / sent back like the other items; changes after confirmation show "changed".
- [x] Publishing with selected but unconfirmed titles → 422; without titles → unaffected.
- [x] A title bout for a belt off the confirmed list is created with a `title_list` warning; on the list → no
      warning; the check endpoint shows the same.
- [x] Contract tests; full suite, backend typecheck, admin build; browser check (Organizer + KKF, EN + KM).

## Log
### 2026-10-13
- Migration `20261013140000_event_titles` (table `event_titles`, PK event + belt, cascade on both). Applied on the dev
  DB, no drift.
- Backend `modules/events/agreements.ts`: item `titles` (snapshot `champion_ids`), `PUT /events/:id/titles`
  (approved belts only, duplicates ignored, Organizer locked after publishing), `titles` in the agreements response,
  `publishBlocker()` (details, then titles when any) replaces `detailsConfirmed()`, `titleListWarning()` used by
  `POST /matches`, `PUT /matches/:id` (title changed) and `POST /matches/check` (`championshipId`). Recording an
  empty title list → 422.
- Admin: Agreements panel row "Titles on the line" (chips with holder, "Choose titles" dialog, "No titles" when
  empty), `agreementsReady()` drives the Publish step on the fight-night page and Program › Overview; Add bout lists
  the fight night's titles first (★) and warns when the belt is off the list / not confirmed; dashboard to-do names
  titles; `agr.titles*`, `agr.chooseTitles*`, `agr.state.noTitles`, `bout.warnTitle*`, `todo.note.agreementTitles`
  (EN + KM), publish hint mentions titles.
- Tests: 3 new tests in `agreements.test.ts` (choose / confirm / changed, publish gate, title-bout warnings incl.
  swap and check endpoint); agreements snapshot gains `titles` + `items.titles`. Full suite `CI=true`: 20 files,
  318 tests pass. Backend typecheck clean; admin build passes, changed files add no TypeScript errors.
- Browser check on the test API (:5190): Organizer chooses 2 of 3 belts and records them; KKF sees Publish waiting,
  Add bout warning for the 70 kg belt (off the list), confirms the titles and publishes; Khmer desktop + phone.
