# Update: Hub answers page in Khmer

| | |
|---|---|
| **Status** | Done (2026-09-30, committed 4f9a2665); KKF to review the Khmer wording |
| **Jira** | n/a |
| **Feature** | claude/features/ai-assistant.md, claude/updates/admin-menu-khmer.md |
| **Requested by** | vannak070 (2026-09-30: "translate the Hub answers page to Khmer") |

## Current behavior
Hub answers (`pages/HubAnswers.tsx`, `/home/hub-answers`) is English only.

## Requested change
With Khmer chosen the page's own texts are Khmer: heading and intro, the monthly spend box and its notes, the
question and feedback tiles, the "asked by" filter and the four tabs, each answer row (date, language,
signed-in / staff badges, outcome, feedback, seconds), the opened answer (label, which records the Hub looked
up, model line, "Save as FAQ"), the empty state and the page buttons.
- Questions and answers stay exactly as asked and answered (in the fan's language).
- Money stays in US dollars with Latin digits ($0.02 of $50.00); counts and dates use Khmer digits.
- Outcome and lookup names are translated on screen only; stored values (`answered`, `list_champions` …) are
  unchanged.

## Scope
Out of scope: English wording and layout (unchanged); the month shown as stored (2026-09); the model name; error
text written by the API; the Staff assistant page.

## Impact
API / database: none. Frontend: `pages/HubAnswers.tsx`, `i18n/program.ts` (`hub.*`).

## Acceptance criteria
- [x] Page fully Khmer after switching, unchanged in English.
- [x] Desktop and phone width; admin build passes.

## Log
### 2026-09-30
- `i18n/program.ts`: 62 new strings EN + KM (`hub.*`: outcomes, the 20 lookup names, page texts); the heading
  reuses `menu.hubAnswers`.
- `pages/HubAnswers.tsx`: every text through `useT()`; the outcome and lookup tables hold dictionary keys; the
  small "Answer" label drops capitals and letter spacing in Khmer.
- Checked on a temporary admin on the test API with three sample log rows put straight into the test database
  (no paid AI call): English identical to before (compared line by line); Khmer complete at 1280 px and
  375 px, no sideways scroll. Admin `vite build` passes; the page has no TypeScript errors.
