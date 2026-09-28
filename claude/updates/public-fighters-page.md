# Update: Fighters page in the Matches & Events style

| | |
|---|---|
| **Status** | Done — committed f4b4010f (2026-09-28) |
| **Jira** | n/a |
| **Feature** | claude/features/public-site.md |
| **Requested by** | vannak070 (2026-09-28: "http://localhost:5176/fighters improve as well", after the News & Media and Partners redesigns in the `/matches` style) |

## Current behavior
`/fighters` (`renderFighters` in `pages/SuperAppHome.tsx`): icon header, a hidden "Filters" panel
(weight = exact kg match, club, and a "Grade A / B" filter that really means verified or not — the
fighter's real `grade` is ignored), wide two-column cards with a stock Unsplash photo when a fighter
has none, a "VERIFIED" badge on every public fighter (all public fighters are verified), a
"{n}x Champion" badge from a field the API doesn't send, the "Independent" label when there is no
club, and a big "View Profile" button on every card.

## Requested change
New `pages/FightersDirectory.tsx`, following `/matches`:
- Light header (eyebrow, title, lead) with stat chips: fighters, clubs, current champions (> 0 only).
- Tabs All · Men · Women (`?gender=men|women`) — only when both genders are present.
- Always-visible search (English / Khmer name, ring name, club) + official weight class filter (classes
  in use, from System Settings) + club filter, clear button.
- Portrait cards: real photo or initials block; "Champion" badge only for a current title holder
  (approved championship with this fighter as holder, not vacant); name in the site language + other
  script; club; weight class + age; official record W-L-D; next scheduled fight when there is one.
- Sorted A–Z (no ranking — owner decision: no leaderboards). "Show more" after 24.
- Empty states like `/matches`. Every string EN + KM.

## Scope
Out of scope: the fighter profile page, home page fighter cards, the shared `fighters` mapping in
`SuperAppHome` (still used by the home page, club pages and matches).

## Impact
API / database: none. Frontend: new `pages/FightersDirectory.tsx`, `pages/SuperAppHome.tsx` (old
render, its filter state and the unused `FighterFilters` wiring removed), `i18n/messages.ts`.

## Acceptance criteria
- [x] Looks and behaves like `/matches`; light only; real data only.
- [x] Desktop + 375 px, English + Khmer; `vite build` passes.
- [ ] Owner review.

## Log
### 2026-09-28
- Built as above; data from `useFanData()` (fighters, bouts for "next fight", approved champions,
  official weight classes), not the `SuperAppHome` fighter mapping with its stock photos.
  `renderFighters` and its filter state removed; `components/FighterFilters.tsx` is now unused (left in
  place). 15 new `fightersPage.*` strings (EN + KM).
- Checked on dev data (4 fighters, 2 clubs, all men → no gender tabs, no champions → no champion
  chip or badge, no upcoming bouts → no "next fight" line): cards, weight filter (59–61 kg → 2
  fighters + clear button), 375 px in Khmer with no sideways scroll (W-L-D label moved above the
  numbers so it doesn't wrap on phones). Gender tabs, champion badge and next-fight line not seen
  with real data.
