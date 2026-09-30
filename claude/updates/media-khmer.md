# Update: Media pages (News, Video) in Khmer

| | |
|---|---|
| **Status** | Done (2026-09-30, uncommitted) — waiting for owner review; KKF to review the Khmer wording |
| **Jira** | n/a |
| **Feature** | claude/features/media.md, claude/updates/admin-menu-khmer.md |
| **Requested by** | vannak070 (2026-09-30: "translate the Media pages to Khmer") |

## Current behavior
News (`pages/News.tsx`, `/home/media/news`) and Video (`pages/Video.tsx`, `/home/media/video`) are English
only: the list, the filters and the create / edit form.

## Requested change
With Khmer chosen both pages show Khmer: heading and intro, search and filters, the cards (category, status,
labels, "Read Article" / "Watch Video"), the empty state, the whole create / edit form (section titles, field
labels, examples, hints, editor tabs and toolbar tips, Save / Cancel) and the confirm / error messages.
- Article and video titles, descriptions, author, fighter and club names stay as typed.
- Category and status names are translated only on screen; the stored values stay the English ones
  ("Highlights", "Draft" …), so the fan site and the API are unchanged.

## Scope
Out of scope: English wording and layout (unchanged); dates on the cards (shown as stored, 2026-09-30); error
text written by the API; redesigning these older pages.

## Impact
API / database: none. Frontend: `pages/News.tsx`, `pages/Video.tsx`, `i18n/program.ts` (`news.*`, `vid.*`,
`media.*`), `styles/theme.css` (`.km-text`).

## Acceptance criteria
- [x] Both pages fully Khmer after switching (list and form), unchanged in English.
- [x] Desktop and phone width; admin build passes.

## Log
### 2026-09-30
- `i18n/program.ts`: 129 new strings EN + KM (`media.*` shared, `news.*`, `vid.*`); Cancel reuses
  `common.cancel`.
- `pages/News.tsx`, `pages/Video.tsx`: every text through `useT()`; `categoryLabel` / `statusLabel` translate
  the stored English values for display; view counts in Khmer digits.
- `styles/theme.css`: new `.km-text` helper. These older pages use 9–10 px capital-letter labels with letter
  spacing, unreadable in Khmer; each page adds `km-text` to its root only when Khmer is chosen (no letter
  spacing or capitals, tiny labels at 12 px, headings with more line height). English is untouched.
- Checked on a temporary admin on the test API with two sample articles and two sample videos: English lists
  identical to before (compared line by line); Khmer complete at 1280 px and 375 px (both lists, both forms),
  no sideways scroll. Admin `vite build` passes; the two pages have no TypeScript errors.
