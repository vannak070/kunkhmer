# Update: Empty corners and tournament draws

| | |
|---|---|
| **Status** | Done (2026-10-14, uncommitted, not live) |
| **Feature** | claude/features/weekly-program.md (step 4 part 2), claude/features/matches-results.md |
| **Requested by** | vannak070 ("start empty corners and tournament draws") — the official program sheets have finals with blank corners, bouts with an opponent to be announced and a draw list ("សមាសភាពចាប់ឆ្នោត") |

## Before
A bout needed two fighters. No way to record "to be announced", "winner of bout N" or a 4-fighter draw.

## Change
- **Data** (migration `20261014090000_empty_corners_draws`): `matches.fighter_a_id` / `fighter_b_id` nullable; `slot_a_from` / `slot_b_from` (the bout whose winner fills the corner); `draw_id` (bouts created by one draw). Returned in every bout row (`slot_a_from`, `slot_b_from`, `draw_id`; snapshots only gained these lines).
- **Create a bout** (`POST /matches`): `fighterAId` / `fighterBId` optional; `slotAFrom` / `slotBFrom` = another bout of the same match, only for an empty corner (422 otherwise; both corners can't wait for the same bout). The KKF rules run for the fighter(s) present; pair rules (gender, grade, record, club) only when both corners are filled.
- **Draw** (`POST /matches/batches/:id/draw`, KKF staff + the match's Organizer): `{ fighterIds: 4 or 8 in draw order, agreedWeight, rounds, roundTime, knockdownLimit, gloveSize, gloveBrand, ruleSet?, finalLabel: "final"|"prize" }` → qualifiers 1v2, 3v4… (label `qualifier`, rules checked like any bout, a Block refuses the whole draw), then next rounds with both corners waiting for the winners, the last bout labelled `final` or `prize`. Response `{ draw_id, bouts, warnings? }` (201).
- **Winners move on**: recording a result fills every corner that waits for that bout (empty, or still holding the previous winner after a corrected result; a draw / no contest empties it again; bouts that already have a result are left alone). No rule check on this automatic move.
- **Filling a corner by hand**: `POST /matches/:id/replace` now also fills an empty corner (history kind `fill`). A fighter coming from the bout the corner waits for skips the schedule rules (already booked / rest days) — the same night is expected in a draw; anyone else is checked normally.
- **Guards**: no result (422 "Both corners need a fighter…"), no weigh-in and no withdrawal on an empty corner; deleting a bout clears the corners that waited for it; fans are not notified and the fan site doesn't show a bout until both corners are filled (`PUBLIC_BOUT`).
- **Admin**: match page shows "To be announced" / "Winner of bout N" (dashed avatar) and a **Tournament draw** button per fight card (`components/program/DrawDialog.tsx`: 4 or 8 fighters in order, Shuffle, weight, rules preset, gloves, Kun Khmer / MAS Fight, last bout Final or Trophy and prize bout); bout page and Match day show a "This corner is still empty" panel to pick the fighter (live rule check) and hide the result until both corners are filled; Results and Weigh-in pages list such bouts as "Waiting for both fighters"; Add bout has "Blue corner: to be announced"; history line "{name} put in an empty corner". The match page bout rows now stack below 1024 px (they overlapped at tablet width). EN + KM.
- **Program sheet**: the draw list row ("សមាសភាពចាប់ឆ្នោត" with the weight and the numbered fighters + clubs) above the draw's first bout; empty corners print blank or "អ្នកឈ្នះគូទី N"; the version counts only program changes (withdraw, replace, fill, cancelled bout, postponement).

## Log
### 2026-10-14
- Contract tests `api-tests/tests/draws.test.ts` (empty corner, slot validation, winner moving on incl. a corrected result, 4- and 8-fighter draws, validation and roles, deleting a qualifier, filling by hand with/without the schedule exemption); full suite 344/344 in CI mode; backend typecheck clean; both frontends build.
- Checked on a temporary admin on the test API: draw of 4 + a bout with blue "to be announced", match page labels at desktop and 820 px, bout page fill panel, Results page waiting row, qualifier result moved the winner into the prize bout, sheet draw list and "អ្នកឈ្នះគូទី ៣", Tournament draw dialog. Not checked: creating a draw through the dialog end to end, Khmer screens, phone width of the dialog.
