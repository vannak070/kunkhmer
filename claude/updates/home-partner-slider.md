# Update: Home partner strip as a slider + "Join our official partners" logo wall

| | |
|---|---|
| **Status** | Done — committed f10153f0 (2026-09-28) |
| **Jira** | n/a |
| **Feature** | claude/features/public-site.md |
| **Requested by** | vannak070 (2026-09-28: screenshot of the hero partner cards, "Please make arrow icon for homepage - hero section" → chose "Slider with ‹ › arrows") |

## Current behavior
`PartnerStrip` in `components/home/HomePage.tsx` wrapped the partner cards onto several rows; with
the three international partners added (6 partners) BTV Sport sat alone on a second row.

## Change
- One row that slides horizontally (snap to cards, hidden scrollbar, swipe on phones).
- ‹ › round buttons at both ends, shown only when the partners don't all fit; the button at an end
  is dimmed/disabled. Each click slides ~80 % of the row.
- When everything fits: centred (hero without fight-night card) or left-aligned (next to it).
- Starts at the first partner (the partner list arrives in two loads; the row is reset to the start).
- Strings `home.partnersPrev` / `home.partnersNext` (EN + KM) for the buttons' labels.
Unchanged: the cards themselves, order (sponsors by tier → international partners → broadcaster).

## Acceptance criteria
- [x] One row, arrows only when needed, disabled at the ends.
- [x] Desktop (1024 px: 6 partners overflow → ›, after click ‹) and 375 px in Khmer, no page sideways scroll.
- [x] `vite build` passes.
- [ ] Owner review.

## Log
### 2026-09-28
- Built as above. Found and fixed: the row opened scrolled to the end (browser kept the offset when
  the list grew) → reset to the start + `overflow-anchor: none`.
- Owner follow-up (screenshot of "Put your brand in the ring": "please improve this section on join our
  official partners"): the right-hand panel is now `PartnerWall` — logo tiles grouped under Official
  Sponsors / International Partners / Broadcast Partners (same labels as the Partners page), 3 per
  row, each linking to the partner's website (new tab) with a hover lift; a dashed red "Your brand
  here" tile with + at the end of the first group opens the partnership email (`home.yourBrand`, EN +
  KM). Left side, stats row and buttons unchanged. Checked desktop and 375 px in Khmer; build passes.
- Owner: "the box … is too much offset" (panel 554 px tall beside a 344 px text column). Made compact:
  logo-only tiles (56–64 px, name on hover / `aria-label`) in a wrapping row per group, dashed "+"
  tile the same size, lighter shadow, `p-5`, max width `md`, right-aligned. Panel now 372 px, section
  652 → 470 px at 1024 px width.
- Owner: "add the names back under the logos" — each tile now shows the name underneath (11 px,
  up to 2 lines; the whole tile links to the website), "Your brand here" under the + tile. Panel
  445 px, section 543 px at 1024 px (was 554 / 652 before the compact pass).
- Owner: "please keep this format by reduce box styling only" — back to the logo-only tiles (names on
  hover / for screen readers, names-under-logos removed again); the box itself is lighter: no shadow,
  `bg-white/60`, soft blue border (`#d5e0f3` at 70 %), `p-4`, tighter spacing. Panel 352 px beside the
  344 px text column; section 450 px at 1024 px.
- Owner (screenshot of the first logo-wall version: "please improve this format. I love it"): back to
  the card tiles — 3 per row, light card per partner with the logo and the name underneath, dashed
  "Your brand here" card at the end of the sponsors row, group labels with a thin rule — made tighter
  (logo 44–48 px, card padding 8–10 px, 8 px gaps) and kept the lighter box (no shadow, soft border).
  Panel 427 px (first version 554 px), section 525 px at 1024 px. This is the current format.
