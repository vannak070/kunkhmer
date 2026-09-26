# Update: Admin Phase 2 — one path per job

| | |
|---|---|
| **Status** | In progress |
| **Jira** | n/a |
| **Feature** | admin portal |
| **Requested by** | vannak070 |

## Current behavior
- Several pages do the same job: bouts are added from the fight-card page
  (CreateMatchFromBatch), the Events tab (same page), an event-page pop-up and an
  orphan AddMatchToEvent; results on MatchDetail and an orphan MatchDetailView.
- Leftover mock-only pages reachable by URL: Matches (old), WorkflowDemo,
  SubEventDetail, AssignFightersToEvent, KKF Workflow (+ detail), Store
  (products, categories, settings), plus a broken `/home/assign-officials`.
- The event page shows a status timeline but no guidance on what to do next.
- "Batch" is used for what fans and staff call a fight card.

## Requested change
- Remove the leftover/duplicate pages (owner approved removing Shop and KKF
  Workflow pages too); old URLs redirect to the right place.
- Event page gets a "Next steps" checklist: details → published → fight card →
  bouts → weigh-in → results, each with one button to the right screen.
- All "add bout" buttons use the fight-card add-bout page.
- Visible "Batch" wording becomes "Fight card".

## Scope
Out of scope: approvals (Phase 3), officials/roles (Phase 4), settings (Phase 5).

## Impact
- API: none. Frontend: admin only.

## Acceptance criteria
- [ ] No removed page is linked from anywhere; old URLs redirect.
- [ ] Event page shows the checklist with working buttons.
- [ ] One add-bout path; one result path.
- [ ] UI says "Fight card", not "Batch".
- [ ] Admin `vite build` passes; browser check desktop + phone.

## Log
