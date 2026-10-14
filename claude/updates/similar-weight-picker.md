# Update: Fighter lists show similar weights first (±2 kg)

| | |
|---|---|
| **Status** | Done (2026-10-14, live since 936db4ea) |
| **Feature** | claude/features/matches-results.md |
| **Requested by** | vannak070 (screenshot of Add bout: "when choose bout and weight, the blue corner should display similar weight — less than and more than 2 kg") |

## Change
- **Add bout** (`FighterPicker` in `pages/AddBout.tsx`): once the agreed weight is known (picked by hand, or set from the red fighter), the lists show only fighters within **±2 kg of the agreed weight**, closest first, with the line "Fighters within 2 kg of 63.5 kg" and a **Show all weights** / **Only within 2 kg** switch. Typing a name searches everyone (closest weight first). Red list: after the weight is chosen by hand; blue list: also as soon as red is picked.
- Same list in the **replacement / fill an empty corner** panel (around the bout's agreed weight).
- **Add several bouts**: clicking an empty fighter box lists fighters within ±2 kg of the row's weight; a typed search lists everyone, closest weight first.
- The KKF weight-gap rule is unchanged (it still warns after a pick). EN + KM.

## Log
### 2026-10-14
- Checked on a temporary admin on the test API: red 63.5 kg → blue list "Fighters within 2 kg of 63.5 kg" with only 61.5–65.5 kg fighters. Admin builds; no backend change.
