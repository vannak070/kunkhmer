# Update: Correcting a title fight result moves the title

| | |
|---|---|
| **Status** | Done (not committed) |
| **Jira** | n/a |
| **Feature** | claude/features/matches-results.md, claude/features/champions.md |
| **Requested by** | vannak070 (2026-09-29, pre-launch fix) |

## Current behavior
`matches/results.ts` applied the title logic on the **first** result only. Correcting a title fight to a
different winner updated the bout and records but left the belt (and its history) with the first winner.

## Requested change (owner decisions 2026-09-29)
- A corrected result moves the title. **Later title fights for the same belt are replayed** in order with
  their saved results (not blocked).
- The wrong history entries are **replaced**, not kept as "Corrected".
- The admin **asks to confirm** before changing the winner of a completed title fight.
- Accepted with the example: a title fight where the current champion isn't one of the two fighters no
  longer changes the belt (before, its winner was crowned).

## Scope
In scope: result logic, new table, contract tests, confirmation on the admin match page.
Out of scope: manual belt edits in Champions (unchanged); the inline result table on the fight card page
still locks saved results (corrections happen on `/home/match/:id`, "Update Result").

## Impact
- API shapes: unchanged (no snapshot updates).
- Migration `20260929000001_championship_changes`: `championship_changes` (champion_id, match_id unique,
  `before` JSON of the belt's holder fields, `seq` order, applied_at). Cascades with the belt and the match.
- Frontend: admin `MatchDetail.tsx` (confirmation dialog).

## Acceptance criteria
- [x] Vacant belt: corrected winner holds it; one "Crowned New Champion" entry with the corrected method/round.
- [x] Champion's loss corrected to a win: title back, defense counted, history "Won".
- [x] Loss corrected to a draw: champion keeps the title, no history entry.
- [x] Owner's example: fight 1 corrected → later fight replayed (no change, champion not in it); corrected
      back → "Lost" + "Won" again, records right.
- [x] Re-saving the same result doesn't double count (existing test).
- [x] Admin: "Change the winner of a title fight?" dialog with the belt's name; Change winner saves.

## Log
### 2026-09-29
- `results.ts`: `applyTitleResult` stores the belt's holder fields before applying; re-saving a result that
  was applied restores them, deletes the history + change rows of this and later fights for that belt and
  re-applies them in `seq` order. Title results saved before this change (history but no change row) are
  left alone. A deleted fight that once won the belt is cleared from `winning_match_id` on restore.
- Tests: 4 new in `matches.test.ts` ("correcting a title fight result"); full suite 246/246 with `CI=true`;
  backend typecheck clean (in the container); admin `tsc` clean.
- Browser: temporary admin on the test API — title fight Sok (champion) vs Dara, Dara won by KO; corrected
  to Sok by Decision → dialog shown, belt back to Sok with 1 defense, history "Won Decision". Temporary
  admin + bridge stopped. Dev database: only the new empty table was added.
- Noticed, not changed: the match page badge says "Ranking Fight" for title fights (it reads
  `is_championship_bout`, the API sends `isTitleMatch`).
