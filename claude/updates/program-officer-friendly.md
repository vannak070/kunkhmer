# Update: Program made simple for officers (fight-night workspace, results, weigh-in, Khmer)

| | |
|---|---|
| **Status** | Done — built and committed (168843e4, 2026-09-30); walk-through fixes 2026-09-30 not committed yet |
| **Jira** | n/a |
| **Feature** | events.md, matches-results.md, fighters.md, officer-run-program.md |
| **Requested by** | vannak070 (2026-09-30: "improve Program Function for more user friendly and professional. Especially, Officer is limited on tech") |

## Current behavior (review 2026-09-30, walked through as an officer on the test API)
- **Records bug**: recording a result rebuilds the fighter's W-L-D from bouts recorded in this system only, so the
  career record is lost (10-3-1 → 1-0-0; on dev data Pich Sambath 150-25-79 would become 1-0-0).
- Several ways to do one job: fight cards / bouts can be added from the event page, the Events list "Quick
  Manage" panel, the fight card page and the event page "Interactive Matchmaker"; progress shows in three places
  (event stepper, Next steps, the fight card's 5-stage manual lifecycle).
- Technical wording and codes: "BATCH-1790735786120", "Back to batches", "Edit batch", "Match Details", raw IDs,
  "Weight-In", "50% READY", emoji labels; boxing options ("12 Rounds (Championship)").
- Many equal buttons (7 on the fight card), a delete bin on each event card; stock photos of strangers for
  fighters without a photo; "TBD" placeholders; "Multi-Week" badge on single fight nights.
- Fight night is slow: each result needs bout → Update Result → form; weigh-in overwrites the fighter's profile
  weight and never compares with the agreed weight.
- English only.

## Decisions (owner, 2026-09-30)
1. **Records**: career record + new results. The record typed at registration is the career before this
   system; each result recorded here adds a win / loss / draw; correcting a result adjusts it.
2. **Language**: English + Khmer switch on the Program screens (KKF reviews the Khmer).
3. **Build**: one simple fight-night workspace; a fight-night results screen; a real weigh-in screen.
   (Not now: a simpler Add bout wizard.)

## Requested change
Backend
- `fighters.career_record` (migration). `record` (unchanged field) = career + results recorded here.
  Creating with `record` sets the career. Updating `record` sets the total the officer sees: the career part
  becomes total − recorded results (422 if that would be negative), so saving a form unchanged never double counts.
  Existing fighters: career = current record, or 0-0-0 when results were already recorded (those were rebuilt).
  Fighter responses gain `careerRecord` / `career_record`.
- Weigh-in on the bout: `matches.weigh_in_a_kg`, `weigh_in_b_kg`, `weigh_in_at`, `weigh_in_by` (migration);
  `POST /matches/:id/weigh-in {a?, b?}` (STAFF, kg 20–200, `null` clears) sets them and `fighter_x_confirmed`
  (= weighed in). The fighter's profile weight is not changed. Match responses gain the four fields.

Admin
- Program: tabs Overview · Fight nights · Champions (the cross-event "Fight cards" tab and menu item go).
- Fight nights list: one row per fight night (date, venue, bouts, status, "Next: …"), Upcoming / Past / All,
  search, "+ New fight night". No delete on the list.
- Fight-night page (replaces the old event page): header with status and Edit details; the Next steps checklist;
  each fight card with its bouts (officials ✓, weigh-in, result per bout) and four clear actions: Add bout,
  Assign officials, Weigh-in, Results (+ Share poster); "+ Add fight card"; a "More" menu with Cancel fight night
  and (Super Admin) Delete, each confirmed. No Quick Manage, no Interactive Matchmaker, no stock photos.
- Results screen per fight card: every bout on one page — Red / Blue / Draw, method, round — Save per bout; a
  saved result shows read-only with "Change"; changing a title fight's winner asks to confirm (belt moves).
- Weigh-in screen per fight card: type each fighter's weight; Pass (≤ agreed + 1 kg) / Over; saved on the bout.
- Old links (`/home/batches/:id`, `/home/matches/:id`) open the fight night. English + Khmer switch on these screens.

## Scope
Out of scope: Create event form and Add bout wizard redesign; public site (weigh-ins aren't public).

## Impact
- API: additive fields (fighters `careerRecord`/`career_record`, matches weigh-in fields) → snapshots updated
  deliberately; new endpoint with contract tests. Two migrations.
- Frontends: admin only; the fan site keeps reading `record`.

## Acceptance criteria
- [x] Recording / correcting a result adds to / adjusts the career record (contract tests).
- [x] Weigh-in saved on the bout, profile weight untouched, Pass/Over shown (contract tests + browser).
- [x] An officer runs a fight night from the list → page → bouts → officials → publish → weigh-in → results
      without other screens, in English and Khmer.
- [x] Typecheck, full contract suite, admin build; browser check on the test API.

## Log
### 2026-09-30
- Committed by the owner in 168843e4 (with `officer-run-program.md`). Review of the commit against this doc:
  - Backend: `lib/record.ts` + `fighters.career_record` (migration 20260930000002) — results add to the career
    record (`matches/results.ts`); weigh-in fields on the bout (migration 20260930000003) and
    `POST /matches/:id/weigh-in`; new `api-tests/tests/records-weighin.test.ts`.
  - Admin: Program tabs Overview · Fight nights · Champions (no "Fight cards" tab); `FightNights.tsx` (Upcoming /
    Past / All, search, new fight night, no delete); `FightNight.tsx` (Edit details, Next steps
    `components/program/FightNightSteps.tsx`, cards with Add bout / Assign officials / Weigh-in / Results /
    Share poster, "+ Add fight card", More → Cancel / Delete with confirm); `FightCardResults.tsx` (per bout,
    title-winner change confirm); `FightCardWeighIn.tsx` (Pass / Over at agreed + 1 kg); old batch / match
    links → `FightCardRedirect`; EN / KM texts in `i18n/program.ts` (Khmer for KKF review). Old
    `BatchDetail`, `EventDetailNewSimple`, `EventsAndMatches`, `MatchesEnhanced` removed.
  - Checks: backend typecheck clean; admin `tsc` 0 errors (was 16 before); admin `vite build` passes;
    `CI=true` contract suite **263/263**. Dev DB has both migrations; each fighter's career_record = record.
- Still to do: walk the officer flow in the browser on the test API (EN + KM, desktop + phone): create fight
  night → card → bouts → officials → publish → weigh-in (Pass / Over, profile weight unchanged) → results
  (incl. a title fight change) → public pages; then tick the criteria above.
- Browser walk-through (test API, temporary admin on :5198): list → New fight night (created through the API;
  the Create form is out of scope) → Add fight card dialog → bouts (API, auto-accepted with approvals off) →
  Assign officials (referee + 3 judges) → Publish → Weigh-in (60.5 kg Pass, 61.5 kg "Over by 0.5 kg"; saved on the
  bout, profile weight unchanged) → Results (KO round 2: records 10-3-1 → 11-3-1 / 8-2-0 → 8-3-0, belt to the
  winner) → Change winner → title confirm → belt moved, records 10-4-1 / 9-2-0, history replaced → public API
  shows the published fight night and both bouts. All four screens in Khmer at 375 px: no overflow, only data
  names in English.
- Fixed while walking through:
  - The fight-night page loaded **every** bout and fight card in the system to show one fight night (slow as
    history grows; it failed through the slow test bridge). New additive `?eventId=` filter on `GET /matches` and
    `GET /matches/batches` (contract test in `matches.test.ts`); admin `api.batches.list(eventId)` /
    `api.matches.listForEvent(eventId)`.
  - Any load error said "This fight night could not be found." Now only a 404 says that; other failures show
    "We couldn't load this fight night … Try again" (EN + KM), and a failed refresh after an action shows a
    banner with Try again. `utils/api.ts` errors carry `status`.
  - Fight nights list: a failed load showed an empty list (looked like lost data) → message + Try again.
    Results / Weigh-in: error message now has Try again.
  - Add bout wizard (`CreateMatchFromBatch.tsx`): "Back to Batch" → "Back to fight night", "CREATE MATCH" /
    "Create Match" → "Add bout".
  - Checks after the fixes: backend typecheck 0 errors, admin `tsc` 0 errors, contract suite **264/264**.
- Open (not changed): the public match API returns the weigh-in fields (`weigh_in_*`, incl. `weigh_in_by`) to
  everyone although weigh-ins aren't public (the fan site doesn't show them); the Create fight night form still
  says "Create New Event" with event categories; "Publish fight night" is offered before any fight card exists;
  the Fight nights list and Program overview still load all bouts (needed for their counts).
- 2026-09-30 later: Program › Overview rebuilt around the next job and the checklist no longer asks for officials /
  weigh-in after a fight night — `updates/program-overview-next-job.md`.
