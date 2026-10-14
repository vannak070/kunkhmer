# Update: every fighter picker asks the server (Add bout, Quick bouts, Draw, Video, Create title)

| | |
|---|---|
| **Status** | Done 2026-10-14 (committed and pushed, dev b4c74a37; not live) |
| **Jira** | n/a |
| **Feature** | claude/features/matches-results.md; follows `updates/similar-weight-picker.md` and `updates/admin-fighters-paging.md` |
| **Requested by** | Owner ("go ahead with the Add bout picker", then "go ahead with Quick bouts", then "go ahead with the Draw dialog", then "go ahead with the Video and Create title pickers") |

## Current behavior
Add bout loaded **every** fighter (`api.fighters.list()`) and filtered / sorted them in the browser for the red and blue lists
(±2 kg of the agreed weight, closest first, search). The replacement / fill-an-empty-corner panel (`MatchChanges.tsx`) and **Add several bouts** (`pages/QuickBouts.tsx`, one search box per corner per row) did the same.

## Change
- `FighterPicker` (`pages/AddBout.tsx`, also used by the replacement panel) asks `GET /fighters/page` for just the rows it shows:
  Active fighters only, the other corner and the bout's own fighters left out (`excludeIds`), within ±2 kg of the agreed weight
  (`minKg` / `maxKg`) and closest first (`nearKg`), or a search by name (closest first, 8 rows) / "Show all weights" (30 rows); no filter
  choices (`facets=0`). Typing waits 250 ms; stale answers are ignored.
- `/fighters/page` gained `minKg`, `maxKg`, `nearKg`, `excludeIds`, `facets=0` (additive). `nearKg` orders by distance in the API (ids + weights
  of the matches sorted, then the page's rows loaded).
- **Quick bouts**: each row's small `Picker` asks the same call when its box is opened with a search or an agreed weight (nothing is asked for an empty box with no weight): empty search = Active fighters within ±2 kg of the row's weight (15), a search = 8 matches closest first; the fighters already used on the card or in other rows go in `excludeIds`. Rule messages take fighter names from the rows' picks (the page no longer holds the list).
- **Draw dialog** (`components/program/DrawDialog.tsx`): the list of fighters to pick for the draw asks the same call (Active only, the ones already in the draw left out, search after a 250 ms pause, 8 rows, A–Z).
- **Video** (`pages/Video.tsx`) and **Create / edit title** (`pages/CreateChampion.tsx`): the "fighter" and "champion" drop-downs of every fighter became a search box
  (`components/fighters/FighterSearchSelect.tsx`): the chosen fighter shows with a button to clear it; otherwise the box asks `/fighters/page` (8 rows, 250 ms pause).
  A title's champion is found among Active fighters (`activeOnly`; an existing holder shows even if no longer active, loaded by id); a video's fighter can be any fighter
  (a retired fighter's interview). The Video page names fighters from what it already loads (the videos' own fighter link and the matches' fighter names), so it no longer
  loads the fighter list either.
- Add bout, Quick bouts, Draw, Video, Create title and the replacement panel no longer download the fighter list. The look, the "Fighters within 2 kg of …" line and the switch are unchanged.
  The KKF weight-gap rule is unchanged.

## Impact
API additive (new optional query parameters); no migration. Admin: Add bout, Quick bouts, Draw, Video, Create title, replacement panel. After this no admin screen downloads the whole fighter list (only `GET /fighters` callers left: the club page's own list, the public site).

## Acceptance criteria
- [x] Same fighters offered as before for the weight window, search and "all weights"; no full fighter list is downloaded.
- [x] Contract suite (378/378) and typecheck pass (only the old `AddBout.tsx` `number | null` errors remain); checked in the browser on the test API.

## Log
- 2026-10-14: test API with 10 fighters at 54–70 kg: opening Add bout makes one `/fighters/page?...limit=8` call per list (≈ 1–2 KB) instead of the whole list;
  red picked at 60 kg → blue list "Fighters within 2 kg of 60 kg": 58–62 kg only, closest first, red left out; search "Picker Fighter 60" lists the
  match first. Test added to `fighters-page.test.ts` (closest first, range, excluded ids, offset, no choices).
- Not browser-checked: the replacement panel in `MatchChanges.tsx` (same component; builds and typechecks), Khmer + phone width (strings unchanged).
- 2026-10-14 (Quick bouts): test API: opening Quick bouts makes **no** fighter request; focusing a box with no weight asks nothing; search "Picker Fighter 6" → one
  `/fighters/page?...q=…&limit=8` call; with red picked at 60 kg the blue box asks `nearKg=60&minKg=58&maxKg=62&excludeIds=<red>&limit=15` and lists 60 kg fighters first,
  red left out. Typecheck: only the old `number | null` errors on the kg lines remain (`QuickBouts.tsx`). No backend change since the Add bout step (suite 378/378).
  Not browser-checked: saving a whole card of bouts, Khmer, phone width.
- 2026-10-14 (Draw): test API: opening the match page makes no fighter request; opening the Draw dialog makes one `/fighters/page?status=Active&facets=0&limit=8` call; a search
  ("Picker Fighter 6") re-asks and lists the matches; picking one puts it in slot 1 and the next call carries `excludeIds=<that fighter>` so it is not offered again. Typecheck: only the old
  `number | null` kg errors remain (`DrawDialog.tsx`). No backend change. Not browser-checked: creating the draw (save), 8-fighter draws, Khmer, phone width.
- 2026-10-14 (Video + Create title): test API: the Create title page makes no fighter request on load; the champion box searches (`Picker Fighter 6…`), picking one and saving stores the
  holder (name, id, nationality, status Active); the edit page loads only that one fighter by id and shows it. The Video page makes `/videos`, `/clubs`, `/matches` and no fighter call,
  shows the linked fighter on the card and in the edit form, and searching + picking another fighter and saving updated the video's fighter. Typecheck: no new errors.
  Not browser-checked: choosing a match on the Video form (it still copies the red fighter into the field), Khmer, phone width.
