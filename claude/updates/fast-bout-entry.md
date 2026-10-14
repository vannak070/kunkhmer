# Update: Fast bout entry ("Add several bouts")

| | |
|---|---|
| **Status** | Done (2026-10-14, uncommitted, not live) |
| **Feature** | claude/features/weekly-program.md, claude/features/matches-results.md |
| **Requested by** | vannak070 ("start fast bout entry") — staff type 15–20 shows / ~100 bouts a week straight into the system (no Excel import, no offline template) |

## Before
Add bout = one form per bout (pick both fighters, weight, rules, gloves, save, back, repeat).

## Change
- New page **Add several bouts** (`/home/matches/:batchId/quick-bouts`, `pages/QuickBouts.tsx`), opened from a fight card on the match page (button next to "Add bout"). Admin only; no API change (uses `POST /matches` and `POST /matches/check`).
- One row per bout: red and blue fighter search (Khmer or English name, club; Enter takes the first match), or "Blue corner to be announced"; agreed weight (follows the red fighter's weight until typed by hand, usual weights suggested); bout-rule preset; bout type (set to International when a foreign fighter is picked); Kun Khmer / MAS Fight. One glove choice for all rows. Starts with 3 rows; "Add a row" copies the weight, preset and rule set of the row above.
- Each filled row is checked against the KKF matching rules as it is filled (green OK, amber warnings, red blocks); a fighter already on the card or in another row isn't offered.
- **Save N bouts** adds the rows in order after the card's existing bouts. A row that is incomplete or blocked stops the save and is marked; if the server refuses a row the others are still saved and the failed rows stay with the reason; when all are saved the match page opens.
- Layout: corners on one line, the other fields on a second line (side by side on very wide screens); phones stack. EN + KM (`qb.*`).

## Log
### 2026-10-14
- Checked on a temporary admin on the test API: two rows filled by typing names + Enter, International set automatically for a foreign opponent, live rule warnings (weight gap), auto weight 63.5 from the red fighter, "Save 2 bouts" → both added and back on the match page. Admin builds; no backend change (suite unchanged, 352/352).
- Not checked: a blocked row and a server-refused row in the browser, phone width, Khmer screen.
