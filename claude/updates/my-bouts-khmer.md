# Update: My bouts page in Khmer

| | |
|---|---|
| **Status** | Done (2026-09-30, committed 4f9a2665); KKF to review the Khmer wording |
| **Jira** | n/a |
| **Feature** | claude/features/officials.md, claude/updates/officials-khmer.md |
| **Requested by** | vannak070 (2026-09-30: "translate the My bouts page to Khmer") |

## Current behavior
"My bouts" (`pages/MyBouts.tsx`, `/home/my-bouts`), the one screen a referee or judge sees after signing in,
is English only.

## Requested change
With Khmer chosen the page shows Khmer: heading and intro, "Coming up" / "Earlier", the date, the "You:
Referee / Judge" badge, the bout line (vs, rounds × minutes, weight), the title-bout label and the result
sentence (winner, method, round).
- Fighter, club, event, card, place, glove and title names stay as typed.

## Scope
Out of scope: English wording (unchanged — a draw still reads "Draw by Draw, round N" in English, an older
quirk left for a separate decision); error text written by the API.

## Impact
API / database: none. Frontend: `pages/MyBouts.tsx`, `i18n/program.ts` (`my.*`).

## Acceptance criteria
- [x] Page fully Khmer after switching, unchanged in English.
- [x] Desktop and phone width; admin build passes.

## Log
### 2026-09-30
- `i18n/program.ts`: 17 new strings EN + KM (`my.*`); heading reuses `menu.myBouts`, the role badge
  `off.role.*`, the method `res.method.*`, plus `common.vs`.
- `pages/MyBouts.tsx`: every text through `useT()`; Khmer date from `formatDay`, numbers in Khmer digits;
  in Khmer a draw reads "ស្មើ ទឹកទី N" (no "by Draw") and the two section headings drop capitals and letter
  spacing. English sentences and date format unchanged.
- Checked on a temporary admin on the test API, signed in as a sample referee with one upcoming bout, one TKO
  result and one draw: English identical to before; Khmer complete at 1280 px and 375 px, no sideways scroll.
  Admin `vite build` passes; changed files add no TypeScript errors.
