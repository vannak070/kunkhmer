# Update: Officer-run Program — approvals switched off

| | |
|---|---|
| **Status** | Done — built 2026-09-30 in a separate worktree, copied into the main tree after the owner's demo, committed by the owner in 168843e4 |
| **Jira** | n/a |
| **Feature** | events.md, matches-results.md, match-proposals.md, fighters.md, admin-phase3a-approvals.md |
| **Requested by** | vannak070 (2026-09-30: "Event doesn't need KKF approve. The officer will create event" / "There is not approval process yet … all process flow is managing by officer") |

## Current behavior
- Events: Organizer creates a Draft → submits → KKF approves or sends back → publish (`admin-phase3a-approvals.md`).
- Bouts: both clubs must accept (Match Proposals); fans see a bout only after both accept (`match-proposals.md`).
- Fighters: new fighters start Draft; an officer must "Verify" them (clubs' fighters wait in a queue).
- Program Overview counts statuses that don't exist, shows invented placeholders ("Digital Broadcast",
  "KKF Sponsors", "Kun Khmer Federation") and shows create quick actions to every role.
- Event page stepper (Draft → Published → In Progress → Completed) and the Edit Event status dropdown
  (Ongoing / Completed) don't match the real statuses.

## Decisions (owner, 2026-09-30 — "go ahead with your recommendations")
1. KKF staff (Super Admin, KKF Officer) run the whole Program flow. Organizer and Club/Gym keep read-only
   access in the admin (their create / answer screens are hidden).
2. Content publishing (knowledge base, federation page) keeps its Super Admin publish step — not part of Program.
3. Approvals are **switched off, not deleted**: database columns and endpoints stay; `APPROVALS_ENABLED=true`
   (backend) + `APPROVALS_ENABLED = true` in `frontend/admin/src/app/config/features.ts` bring them back.
4. Built after/around the owner's demo without touching the running dev site (worktree), then copied in.

## Requested change
Officer flow: create event (Draft, hidden) → fight card → bouts (confirmed at once) → officials → **Publish**
(the officer's "ready for fans" switch, not an approval) → weigh-in → results → the admin shows the event
as Completed once every bout has a result (derived, not stored).

Backend (only with approvals off, the default):
- A fighter created by KKF staff is Active immediately, `verified_by` / `verified_date` = that officer / now
  (staff can still send another `status`).
- Every new bout, and a bout whose fighter is swapped, is accepted for both sides at once
  (`club_x_responded_by` = the user who created it, `responded_at` = now); followers get "bout scheduled" at once.
- Event submit / approve / send-back endpoints stay (unused by the admin).

Admin:
- Event "Next steps": Event details → Fight card → Bouts → Officials → Publish → Weigh-in → Results; no
  Submit / Approve / Send back / KKF comment. Stepper Draft → Published → Completed (derived). Edit Event status
  dropdown: Draft, Published, Cancelled.
- Match Proposals menu item and "waiting for clubs" wording hidden; fighter verification queue / Verify / Send
  back hidden; dashboard approval to-dos hidden.
- Organizer and Club/Gym: create / edit / answer permissions removed from the admin menus (read-only).
- Program Overview: real stats, no invented placeholders, quick actions only with the matching permission.

## Scope
Out of scope: weigh-in redesign, one bout creator, fight-night control panel (review phases C–E).

## Impact
- API response shapes: unchanged (same fields; values differ: new bouts `accepted`, staff fighters `Active`).
- Database migration: none. Existing dev data needs no change (its bout is accepted, event Published).
- Contract tests: expectations for new bouts / staff-created fighters updated; approval endpoint tests kept.

## Acceptance criteria
- [x] Officer creates event → card → bouts (public once published, no club step) → officials → publish → result.
- [x] Officer-created fighter is public and matchable without a Verify click.
- [x] Organizer / Club see no create or answer actions in the admin.
- [x] Program Overview shows real numbers and no invented text.
- [x] Typecheck, full contract suite, admin + fan builds; admin screens checked on the test API.

## Log
### 2026-09-30
- Backend: `config.approvals` (`APPROVALS_ENABLED`, default off); `fighters/routes.ts` staff-created fighter →
  Active + `verified_by/date`; `matches/proposals.ts` `openSide(side, fighter, by)` accepts at once when off
  (create and fighter swap). `.env.example` + `deploy/docker-compose.prod.yml` document the switch.
- Admin: `config/features.ts`; `data/users.ts` (Organizer / Club/Gym write permissions and `matches.view_proposals`
  dropped when off); `EventNextSteps` (details → card → bouts → officials → publish → weigh-in → results);
  `EventDetailNewSimple` (stepper Draft → Published → Completed derived, status list, no KKF feedback box, no
  "Kun Khmer Federation" / "Digital Stream" placeholders); `BoutAnswer` badges + buttons off; `FighterReview`
  "Activate" only; `Fighters` / `FighterDetail` draft wording; `useAdminOverview` + `Home` (no approval to-dos;
  new "Bouts without officials"; "Weigh-ins to do" wording); `ProgramDashboard` (real stats, no invented
  placeholders, "Needs attention", quick actions by permission, "Fight cards" tab/menu); Help (officer steps,
  tasks, FAQ in EN + KM — Khmer for KKF review); role descriptions in Users / Profile.
- Found while testing: the Assign officials page requires a referee **and 3 judges** per bout, so the Officials
  step and the to-do use that rule.
- Tests: new bouts / staff fighters now carry who confirmed them (snapshots updated deliberately: those fields
  go from null to filled); proposal tests rewritten to the officer flow; new test "registers a fighter KKF staff
  create as verified at once". `CI=true` full suite **259/259** on a fresh database.
- Checked in the browser on a separate test API (worktree): admin creates → assigns officials (after adding 3
  judges) → Next steps moves to Publish → Publish → event and both bouts public without a login; Program
  Overview real numbers; Organizer sees no create/edit/publish/assign buttons and no Match Proposals.
  Admin `vite build` passes; changed files add no TypeScript errors (16 existing, unchanged).
- Not changed (review phases C–E): weigh-in still overwrites the profile weight; the event page's "Interactive
  Matchmaker" and stock photos; staff assistant's "pending approvals" tool (returns empty lists now).
