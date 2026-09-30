# Update: Assign officials page in Khmer

| | |
|---|---|
| **Status** | Done (2026-09-30, committed 4f9a2665); KKF to review the Khmer wording |
| **Jira** | n/a |
| **Feature** | claude/features/officials.md, claude/updates/officials-khmer.md |
| **Requested by** | vannak070 (2026-09-30: "translate the Assign officials page to Khmer") |

## Current behavior
"Assign officials" (`pages/AssignOfficials.tsx`, `/home/matches/:batchId/assign-officials`) is English only.
Officers reach it from the fight-night checklist, which is already in Khmer.

## Requested change
With Khmer chosen the page shows Khmer: heading and intro, event line, each bout row (vs, weight, title-fight
badge), the referee / judge pickers with grade and "bouts that night" hint, the copy-to-all button, Assign /
Cancel, the "not found" and empty states, and every message.
- Fighter, official, event and place names stay as typed.

## Scope
Out of scope: English wording and look (unchanged, including "match" wording and the older styling of this
page); error text written by the API; "My bouts".

## Impact
API / database: none. Frontend: `pages/AssignOfficials.tsx`, `i18n/program.ts` (`assign.*`).

## Acceptance criteria
- [x] Page fully Khmer after switching, unchanged in English.
- [x] Copy to all and Assign work and answer in the chosen language.
- [x] Desktop and phone width; admin build passes.

## Log
### 2026-09-30
- `i18n/program.ts`: 24 new strings EN + KM (`assign.*`); grade labels reuse `off.grade.*`, plus `common.vs`,
  `common.kg`, `common.cancel`.
- `pages/AssignOfficials.tsx`: every text through `useT()`; the picker label is written on the page per
  language (`officialOption` in `hooks/useOfficials.ts` is no longer used by any page).
- Khmer only: the page's 9–10 px capital-letter labels were unreadable in Khmer script and the heading ran into
  the intro line, so in Khmer the field labels, chips and copy button use 12 px without letter spacing and the
  heading gets more line height. English classes are untouched.
- Checked on a temporary admin on the test API (six sample officials, one card, two bouts, one already
  assigned): English identical to before; Khmer complete at 1280 px and 375 px, no sideways scroll; "copy to
  all" and "Assign" succeed with Khmer messages and return to the fight night. Admin `vite build` passes;
  changed files add no TypeScript errors.
