# Update: Program › Overview built around the next job

| | |
|---|---|
| **Status** | Done — committed 867e04e6 (2026-09-30, pushed) |
| **Jira** | n/a |
| **Feature** | program-officer-friendly.md, events.md |
| **Requested by** | vannak070 (2026-09-30, screenshot: "please improve this page. I don't like it.") |

## Current behavior
Program › Overview (`ProgramDashboard.tsx`): three small number cards ("1 bouts · 0 with a result"), a big
dark "Last fight night" card, an often empty Champions box, Needs attention, Quick actions. Owner disliked the
dark card, that it isn't clear what to do, and the many small numbers.

## Change (owner chose "Next job first")
`components/program/ProgramOverview.tsx`, light style, larger text:
1. **The fight night that needs work** — the last fight night whose results are still open ("Results still to
   record"), otherwise the nearest one coming up (drafts included, "Next fight night"); name, date, venue,
   status, "Open fight night", and the same step checklist as the fight-night page (`FightNightSteps`) with
   one button for the next step. No fight night → "No fight night coming up" + New fight night.
2. **Needs attention (n)** — Program to-dos with an "Open" button each (Khmer: a Khmer line per to-do type).
3. **Coming up** — up to 4 other fight nights with status and "Next: …" (shared `nextStepText`, same wording as
   the Fight nights list) + "All fight nights".
4. **Title belts** in one line ("0 with a champion · 1 vacant") + See titles / Add a title belt.
- Header: "+ New fight night" on the Overview; the Champions tab button says "Add a title belt" (was English
  "Create Title"). The number cards, dark card, Champions box and Quick actions are gone. The Program page only
  loads the tab counts (events + titles).
- **Checklist fix** (fight-night page too): after the fight night, Officials and Weigh-in no longer become the
  "Next" step ("Fight night is over — nothing to do here now", counted as finished); Results is next.

## Acceptance criteria
- [x] Owner's case (past fight night, result missing) shows "Results still to record" with Results as the next step.
- [x] English + Khmer, desktop + 375 px (no overflow); admin `tsc` 0 errors.

## Log
### 2026-09-30
- Built as above; checked on the test API (rebuilt, small sample: past published night with an open result,
  October night with bouts but no officials, November draft without a card, one vacant title). The owner's own
  admin wasn't opened (signing in would sign them out).
