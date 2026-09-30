# Update: Officials page in Khmer

| | |
|---|---|
| **Status** | Done (2026-09-30, committed 4f9a2665); KKF to review the Khmer wording |
| **Jira** | n/a |
| **Feature** | claude/features/officials.md, claude/updates/admin-menu-khmer.md |
| **Requested by** | vannak070 (2026-09-30: "translate the Officials page to Khmer") |

## Current behavior
The Officials page (`pages/Officials.tsx`, `/home/officials`) is English only, although the side menu around
it switches to Khmer.

## Requested change
With Khmer chosen (language button in the side menu) the page shows Khmer: heading and intro, role tabs,
search, "Show deactivated", the official cards (role, grade, years, upcoming bouts, Edit / Deactivate /
Activate), the Add / Edit dialog with its checks, and the confirmation messages.
- Names, usernames and emails stay as staff typed them.
- Grades are still stored as "International A / National A / National B"; only the label is translated.

## Scope
Out of scope: English wording and layout (unchanged); "Assign officials" and "My bouts" screens; error
messages written by the API (still English).

## Impact
API / database: none. Frontend: `pages/Officials.tsx`, `i18n/program.ts` (`off.*`).

## Acceptance criteria
- [x] Page and dialog fully Khmer after switching, unchanged in English.
- [x] Desktop and phone width; admin build passes.

## Log
### 2026-09-30
- `i18n/program.ts`: 48 new strings EN + KM (`off.*`); the heading reuses `menu.officials`, Edit / Cancel /
  Save / Not set reuse `common.*`.
- `pages/Officials.tsx`: every text through `useT()`; the grade + years line is written on the page per
  language (the shared `officialSummary` in `hooks/useOfficials.ts` is left for the English-only screens);
  counts and years in Khmer digits.
- Checked on a temporary admin on the test API with four sample officials (two referees, two judges, one
  deactivated, one without grade): English identical to before; Khmer complete at 1280 px and 375 px (list,
  edit dialog, deactivate message), no sideways scroll. Admin `vite build` passes; changed files add no
  TypeScript errors.
