# Update: Dashboard in Khmer

| | |
|---|---|
| **Status** | Done (2026-09-30, uncommitted) — waiting for owner review; KKF to review the Khmer wording |
| **Jira** | n/a |
| **Feature** | claude/updates/dashboard-next-job.md, claude/updates/admin-menu-khmer.md |
| **Requested by** | vannak070 (2026-09-30: "translate the Dashboard to Khmer") |

## Current behavior
The Dashboard (`pages/Home.tsx`) is English only, although the side menu around it and the Program screens
switch to Khmer. Its to-do details ("no result recorded", "not weighed in yet" …) are built as English
sentences in `hooks/useAdminOverview.ts`.

## Requested change
With Khmer chosen (language button in the side menu) the Dashboard shows Khmer: greeting and date, "Your next
job" card, "Also waiting" list, quick actions, the number tiles and countdown, upcoming fight nights, recent
results, and the "All caught up" message.
- To-dos carry their facts (names, event, date, what is missing) instead of a ready-made English sentence, and
  the page writes the sentence in the chosen language (`components/program/todoText.ts`).
- Fighter, club, event and title names stay as staff typed them.
- The "Activate" button on draft fighters follows the language too.

## Scope
Out of scope: English wording and layout (unchanged); to-do kinds that only exist with approvals switched on
(events to approve, sent back, bouts to answer …) keep their English text; other English-only pages.

## Impact
API / database: none. Frontend: `pages/Home.tsx`, `hooks/useAdminOverview.ts`, `components/program/todoText.ts`
(new), `components/FighterReview.tsx`, `i18n/program.ts` (`dash.*`, `todo.*`).

## Acceptance criteria
- [x] Dashboard fully Khmer after switching, and unchanged in English.
- [x] To-do rows read correctly in both languages (results, officials, weigh-in, draft fighter / event, empty
      event, vacant title).
- [x] Desktop and phone width; admin build passes.

## Log
### 2026-09-30
- `i18n/program.ts`: 76 new strings EN + KM (`dash.*` page texts, `todo.*` group titles / hints / buttons and
  the "what is missing" notes, `common.and`).
- `hooks/useAdminOverview.ts`: each to-do keeps its English `detail` and gains `info` (corner names, event or
  club, date, note key, fighters concerned); `components/program/todoText.ts` writes title and detail in the
  chosen language. Approval-only kinds have no `info` and stay English.
- `pages/Home.tsx`: every text through `useT()`; Khmer date written by `formatDay`, numbers in Khmer digits,
  result method spelled out in Khmer ("KO" stays "KO" in English); English wording and date formats unchanged.
  `components/FighterReview.tsx`: "Activate" follows the language.
- Found at phone width: the "Upcoming fight nights" / "Recent results" boxes could grow wider than the screen
  (grid items without `min-w-0`; the longer Khmer heading triggered it) — both now shrink and their headings wrap.
- Checked on a temporary admin on the test API with sample data (result to record, bout without officials,
  draft fighter, draft event, vacant title, one recorded result): English identical to before; Khmer complete
  at 1280 px and 375 px, no sideways scroll; switching back from the phone menu works. Admin `vite build`
  passes; changed files add no TypeScript errors.
