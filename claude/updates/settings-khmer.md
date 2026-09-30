# Update: System Settings page in Khmer

| | |
|---|---|
| **Status** | Done (2026-09-30, committed 4f9a2665); KKF to review the Khmer wording |
| **Jira** | n/a |
| **Feature** | claude/features/settings.md, claude/updates/admin-menu-khmer.md |
| **Requested by** | vannak070 (2026-09-30: "translate the Settings page to Khmer") |

## Current behavior
System Settings (`pages/SystemSettings.tsx`, `/home/settings`) is English only.

## Requested change
With Khmer chosen the page shows Khmer: heading and intro, the four tabs (weight classes, venues, bout rules,
glove brands) with their explanation, the "in use / deactivated" count, each row's detail line (weight range,
rounds × minutes, knockdowns), Deactivate / Activate, the Add / Edit dialog (field labels, examples, the
"enter the …" check), the delete confirmation, "Managed on other pages" and every message.
- Entry names stay as typed (each list already has its own Khmer-name field, shown in the detail line).

## Scope
Out of scope: English wording and layout (unchanged); the fixed glove-size labels from `data/masterData.ts`
("8oz — 54kg - 67kg"); error text written by the API.

## Impact
API / database: none. Frontend: `pages/SystemSettings.tsx`, `i18n/program.ts` (`set.*`).

## Acceptance criteria
- [x] Page, dialogs and messages fully Khmer after switching, unchanged in English.
- [x] Desktop and phone width; admin build passes.

## Log
### 2026-09-30
- `i18n/program.ts`: 75 new strings EN + KM (`set.*`); heading and the Officials / Users links reuse
  `menu.*`, plus `common.loading`, `common.cancel`, `common.save`.
- `pages/SystemSettings.tsx`: the tab definitions now hold dictionary keys (tab name, "Add …", "… added",
  explanation, field labels and examples) instead of English text; detail lines are written per language with
  Khmer digits; row numbers in Khmer digits; the small count line drops capitals and letter spacing in Khmer.
- Checked on a temporary admin on the test API with the seeded lists: English identical to before (weight
  classes and bout rules compared line by line); Khmer complete at 1280 px and 375 px (list, add dialog with
  its required-field message, deactivate message and count), no sideways scroll. Admin `vite build` passes;
  changed files add no TypeScript errors.
- Noticed, not changed (both languages, older layout): at phone width a row's five action buttons squeeze the
  entry name down to one or two letters.
