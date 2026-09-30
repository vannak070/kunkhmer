# Update: Staff assistant samples and intro without approvals

| | |
|---|---|
| **Status** | Done (2026-09-30, uncommitted); KKF to review the Khmer wording |
| **Jira** | n/a |
| **Feature** | claude/updates/hub-phase-d2-staff-assistant.md, claude/updates/staff-assistant-khmer.md, claude/updates/officer-run-program.md |
| **Requested by** | vannak070 (2026-09-30: "fix the Staff assistant sample questions about approvals"; then "yes, change the intro too") |

## Current behavior
Two of the seven "Try asking" questions on the Staff assistant (`/home/assistant`) are about approvals, which
are switched off (`officer-run-program.md`), so they always come back empty:
- `sa.s1` "What is waiting for my approval?"
- `sa.s7` (the Khmer example, in both languages) "How many fighters are waiting for verification?"

## Requested change
Replace them with questions the assistant can answer while approvals are off:
- `sa.s1`: "What data problems should I fix first?" / តើមានបញ្ហាទិន្នន័យអ្វីខ្លះ ដែលខ្ញុំគួរកែមុនគេ?
  (answered by the `data_quality` summary check).
- `sa.s7`: តើមានកម្មវិធីប្រកួតអ្វីខ្លះនៅខាងមុខ? ("What fight nights are coming up?"), still the one Khmer example
  in the English list (answered by `list_events`).

Also the intro (`sa.intro`): "Ask about missing results, fighter data, fight nights and drafts." /
សួរអំពីលទ្ធផលដែលនៅខ្វះ ទិន្នន័យកីឡាករ កម្មវិធីប្រកួត និងសេចក្ដីព្រាង។ (rest of the sentence unchanged).

## Scope
Out of scope: the assistant's tools
(`pending_approvals` stays for when approvals return), the other five samples.

## Impact
API / database: none. Frontend: `i18n/program.ts` only (EN + KM `sa.intro`, `sa.s1`, `sa.s7`).

## Acceptance criteria
- [x] No sample question and not the intro mentions approvals or verification, in either language.
- [x] Admin build passes; checked without a paid AI call.

## Log
### 2026-09-30
- `i18n/program.ts`: `sa.s1` EN + KM and `sa.s7` (same Khmer text in both blocks) replaced as above; the
  page code is unchanged (it already renders `SAMPLES` by key).
- Checked on a throw-away admin (:5188) on the test API (AI forced off, no paid call): English and Khmer
  "Try asking" lists show the new questions and none about approvals. Admin `vite build` passes.
- Owner then asked to change the intro too: `sa.intro` EN + KM now name missing results, fighter data,
  fight nights and drafts (approvals removed; fight nights added to match the new sample).
