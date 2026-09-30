# Update: Staff assistant page in Khmer

| | |
|---|---|
| **Status** | Done (2026-09-30, committed 6c28ffa1); KKF to review the Khmer wording |
| **Jira** | n/a |
| **Feature** | claude/updates/hub-phase-d2-staff-assistant.md, claude/updates/admin-menu-khmer.md |
| **Requested by** | vannak070 (2026-09-30: "translate the Staff assistant page to Khmer") |

## Current behavior
Staff assistant (`pages/StaffAssistant.tsx`, `/home/assistant`) is English only — the last admin page left
after the admin-in-Khmer work. The assistant already answers in the language it is asked in.

## Requested change
With Khmer chosen the page's own texts are Khmer: heading and intro, "New conversation", the "assistant is off"
notice, "Try asking" and the sample questions, "Looking through the records…", the Helpful? buttons, the
question box (label, placeholder), the Ask / Answering… button, the footer note and the fallback error.
- In Khmer the sample questions are Khmer, so a click asks the assistant in Khmer.
- Questions and answers stay exactly as typed and answered.

## Scope
Out of scope: English wording and layout (unchanged — the English sample list keeps its one Khmer example);
error text written by the API; the setting names `ANTHROPIC_API_KEY` / `AI_ENABLED=false` (shown as they are);
the assistant's answers (the AI chooses the language from the question).

## Impact
API / database: none. Frontend: `pages/StaffAssistant.tsx`, `i18n/program.ts` (`sa.*`); the heading reuses
`menu.assistant`.

## Acceptance criteria
- [x] Page fully Khmer after switching, unchanged in English.
- [x] Desktop and phone width; admin build passes; no paid AI call to check it.

## Log
### 2026-09-30
- `i18n/program.ts`: 24 new strings EN + KM (`sa.*`): intro, New conversation, the off notice in three parts
  around the two `<code>` setting names (so Khmer word order works), Try asking, seven sample questions
  (`sa.s1`–`sa.s7`; the English list keeps its one Khmer example as `sa.s7`), Looking through the records…,
  Helpful? / Helpful / Not helpful, the question label and placeholders, Ask / Answering…, the footer and the
  fallback error. Terms match the rest of the admin (កម្មវិធីប្រកួត, អាជ្ញាកណ្ដាល, សេចក្ដីព្រាង,
  ផ្សព្វផ្សាយ, ការអនុម័ត, ចម្លើយរបស់ Hub). The heading reuses `menu.assistant`.
- `pages/StaffAssistant.tsx`: every text through `useT()`; `SAMPLES` holds dictionary keys, so a sample
  clicked in Khmer asks the assistant in Khmer.
- Checked on a throw-away admin (:5188) on the test API, where the AI is forced off, so no paid call: Khmer
  complete at 1280 px and 375 px (off notice, seven Khmer samples, a sample conversation loaded from
  sessionStorage showing the Helpful? row), no sideways scroll; English page text identical to before.
  Admin `vite build` passes; the page and `program.ts` have no TypeScript errors.
