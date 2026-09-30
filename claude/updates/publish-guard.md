# Update: No publishing an empty fight night (Publish guard)

| | |
|---|---|
| **Status** | Done (not committed) — waiting for owner review |
| **Jira** | n/a |
| **Feature** | claude/features/events.md |
| **Requested by** | vannak070 (2026-09-30: "fix the Publish guard" — open item from `program-simple-forms.md` / `program-officer-friendly.md`) |

## Current behavior
The fight-night checklist (`components/program/FightNightSteps.tsx`) offers "Publish fight night" as
soon as the details exist — before any fight card or bout. `PUT /events/:id { status: "Published" }`
accepts it, so fans can get an empty fight night page ("the fight card will be announced soon").
(The Program Overview's "next job" already asks for bouts before publishing.)

## Requested change
- **API**: changing an event's status **to Published** while it has **no bouts** → 422 "Add at least one
  bout before publishing this fight night". Applies to staff and organizers (both checklists, any
  screen). Unchanged: events that are already Published (editing them), creating an event directly as
  Published (`POST /events`, used by imports and tests), Cancelled.
- **Admin** (`FightNightSteps`): the Publish step waits until there is a bout ("Add a bout first — then
  you can publish"), like the officials / weigh-in steps; no Publish button before that. EN + KM.
  The approvals-on checklist (`EventNextSteps`) gets the same wait.

## Impact
API: new 422 case on `PUT /events/:id`; no shape change. Database: none. Frontend: admin only.

## Acceptance criteria
- [x] PUT to Published with no bouts → 422; with one bout → 200; already-published event edits still work.
- [x] Checklist shows Publish only after the first bout; message in EN + KM.
- [x] Typecheck, full contract suite, admin build.
- [ ] Owner review.

## Log
### 2026-09-30
- `backend/src/modules/events/routes.ts` PUT: when `status` becomes Published and the event has no match
  (`match.count({ event_id })`) → 422. `api-tests/tests/events.test.ts`: the approval test now gets a 422
  before its first bout, then publishes; new "publish guard" test (422 + still hidden → add bout → 200;
  re-sending Published on an already published event is fine). Suite **267/267** (CI mode); no snapshot changed.
- Admin: `FightNightSteps` Publish step is "later" until there's a bout (`steps.publishNeedsBout` EN + KM), no
  button; `EventNextSteps` (approvals on) same wait (English, like the rest of that component). Changed files
  type-check (`tsc` on both files, 0 errors); admin build passes.
- Browser (temporary admin on the test API — no dev sign-out): new fight night + card, no bouts → PUT
  Published 422 "Add at least one bout…"; checklist step 5 greyed "Add a bout first — then you can publish.", no
  button; after one bout → "Publish fight night" button → Published.
