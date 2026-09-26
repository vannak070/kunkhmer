# Update: Admin Phase 2 — one path per job

| | |
|---|---|
| **Status** | Done (not committed) |
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
- [x] No removed page is linked from anywhere; old URLs redirect.
- [x] Event page shows the checklist with working buttons.
- [x] One add-bout path; one result path.
- [x] UI says "Fight card", not "Batch".
- [x] Admin `vite build` passes; browser check desktop + phone.

## Log

### 2026-09-26
- Removed pages (owner approved Shop + KKF Workflow too): Matches (old),
  MatchDetailView, AssignFightersToEvent, SubEventDetail, AddMatchToEvent,
  KKFWorkflow, KKFWorkflowDetail, WorkflowDemo, StoreManagement,
  CategoriesSetting, StoreSettings — plus 16 files only they used
  (KKFEnhancedDetailModal, ShareableMatchCard, WorkflowHistory,
  WorkflowProgressTracker, data/workflow, utils/workflowValidation, an image, 9
  `components/ui/*`). Reachability rescan: 0 unused files.
- `routes.tsx`: old URLs redirect — sub-event pages → that fight card
  (`/home/matches/:id`), event add-match / assign-fighters → the event,
  `match/:id/update-result` → `match/:id`, matches-old / assign-officials →
  Program Matches tab, workflow / store pages → dashboard. All 10 checked.
- New `components/EventNextSteps.tsx` on the event page: Event details →
  Publish (one-click, `PUT /events/:id {status: Published}`) → Fight card → Bouts
  → Weigh-in → Results, progress bar, "Next" highlight, one button each.
- One add-bout path: the event page's "Add match to this fight card" and its
  checklist now open `CreateMatchFromBatch` (the pop-up is no longer opened).
- "Batch" → "Fight card" in visible text across admin (headings, buttons,
  messages, Process Flow). Kept: code names, URLs (`/home/batches/…` still work),
  stored codes (`BATCH-123456`). The Matches tab's duplicate create button removed.
- Verified: admin `vite build` passes (only older glove-size type errors remain);
  browser 1440×900 + 375×812: checklist shows 5/6 with Results next, add-bout
  opens the shared page, all redirects land, Matches tab has one create button,
  no horizontal scroll. Mistakes caught and fixed during the rename: 4 route paths
  and 3 import paths had been renamed, and new card codes would have been saved as
  "FIGHT CARD-…" — all restored before build/test.

