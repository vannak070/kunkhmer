# Update: plain-language rule messages with fix buttons (Add bout)

| | |
|---|---|
| **Status** | Done 2026-10-13 (uncommitted, not live) |
| **Jira** | n/a |
| **Feature** | program-workflow.md (matching rules), matches-results.md |
| **Requested by** | Owner ("go ahead with plain rule messages", step 2 of `updates/program-guided-fight-night.md`) |

## Current behavior
Add bout never asked the server about the KKF matching rules. A broken Block rule only showed after pressing "Add bout", as a red toast with the server's English sentence ("This bout breaks KKF matching rules: … less than 21 days apart"); Warn rules came back in a yellow toast, also English. Khmer officers read English, and nothing said how to fix it.

## Requested change
- **API (additive):** every rule hit (`/matches/check` `blocked` / `warnings`, `warnings` on create / swap) also carries `fighter_id` (who it is about, or null for the pairing) and `params` (name, date, kg, limits, grades, wins…). `message` is unchanged (still the 422 text).
- **Admin Add bout:** once both fighters are chosen the pair is checked live (`POST /matches/check`, 300 ms after the last change). Broken Block rules show in a red box, "These two can't fight yet", each as a plain sentence in English or Khmer (the fighter's Khmer name) with a fix: **Choose another fighter** (the one named), **Change the red / blue fighter** (pair rules), **Open their page** (medical, suspension). The two "Add bout" buttons stay disabled until nothing blocks. Warnings: "Please look twice — you can still add the bout". Nothing broken: "Rules checked — this bout is allowed."
- The warnings toast after creating a bout uses the same sentences.
- If the check can't be reached the page says so and the server still checks on save (the old 422 toast).

## Scope
In scope: `modules/matches/rules.ts`, `events/agreements.ts` (title warning params), `AddBout.tsx`, `components/program/ruleSentence.ts`, `rl.*` texts (EN + KM).
Out of scope: Settings › Matching rules page, swapping a fighter on an existing bout (still English), Khmer for the other (non-rule) toasts.

## Impact
- API response shapes: additive `fighter_id` + `params` on rule hits (`api-tests` snapshot for the new contract test only; no existing snapshot changed). No migration.
- Frontend pages affected: Add bout.

## Acceptance criteria
- [x] Contract test: hits carry `fighter_id` and `params` for medical, pair (gender) and weight rules; snapshot of the shape.
- [x] Browser-checked on the test API: different genders (pair fixes), injured fighter (clear, fix buttons, Add disabled), weight gap warning in Khmer with Khmer digits, 375 px.
- [ ] KKF reviews the Khmer sentences (`rl.*`).

## Log
- 2026-10-13: built; suite 319/319 + the new test (320).
