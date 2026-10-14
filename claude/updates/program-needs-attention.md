# Update: Program overview — "Needs attention" grouped by fight night

| | |
|---|---|
| **Status** | Done 2026-10-13 (live since 2026-10-14, 936db4ea) |
| **Jira** | n/a |
| **Feature** | program-workflow.md, claude/updates/program-overview-next-job.md |
| **Requested by** | Owner ("go ahead with Needs attention grouped by fight night") |

## Current behavior
The Program overview listed one row per bout or fight night (up to 5, then "All to-dos"): on busy data 90 near-identical lines such as "Fighter A vs Fighter B — no result recorded".

## Requested change
One card per fight night (name, date, "Open fight night") with a few plain lines and one button each: "Waiting for you to confirm: …" (Review), "Results to record: n" (Record results), "Bouts without a referee or judges: n" (Assign officials), "Bouts not weighed in yet: n" (Weigh-in), "Not published — fans can't see it yet" / "No bouts yet" (Open). Vacant titles are one last line ("Vacant titles: n" → See titles). Most urgent night first, then the soonest date; 4 cards, "Show n more fight nights". English + Khmer.

## Scope
In scope: `components/program/NeedsAttention.tsx` (new), `ProgramOverview.tsx`, `hooks/useAdminOverview.ts` (to-dos carry `eventId` / `eventName` / `eventDate`; additive), `na.*` texts.
Out of scope: the dashboard's own to-do list and the header bell (unchanged, same data); the fight-night rename and menu changes (proposal list, owner to choose).

## Impact
No API change, no migration. Admin Program overview only.

## Acceptance criteria
- [x] Test data with 40 fight nights shows 40 cards of 1–3 lines instead of ~90 rows; counts match the to-dos.
- [x] Browser-checked: desktop English, phone Khmer (375 px), "Show more", vacant titles line.
- [ ] KKF reviews the Khmer (`na.*`).

## Log
- 2026-10-13: built and browser-checked on the test API.
