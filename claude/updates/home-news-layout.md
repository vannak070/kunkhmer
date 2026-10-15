# Update: Home news layout when there are no fight nights / results beside it

| | |
|---|---|
| **Status** | Done 2026-10-15 (uncommitted, not live) |
| **Jira** | n/a |
| **Feature** | claude/features/public-site.md (Home) |
| **Requested by** | Owner: "The News feature is very bad display under home page" (production) |

## Current behavior
`NewsGrid` in `frontend/public/src/app/components/home/HomePage.tsx` was designed for a 7/5 column beside fight
nights and latest results. The live pilot has news but no fight nights or results yet, so news took the whole width
(1230 px on a 1440 screen): the lead photo was 1230×692 px (taller than the screen) and the other two stories were
wide strips with 128 px thumbnails and empty space. The section was 1271 px tall.

## Requested change
When news is alone in the row (`wide`), on large screens (`lg`): lead story on the left (7/12), the other two stories
on the right as picture cards (picture on top, 5:2), and the lead's picture stretches so both columns end level.
With fewer than 3 stories alone: up to 3 equal cards in a row. Tablet and phone layouts unchanged (list rows with a
slightly wider thumbnail; titles up to 3 lines).

## Scope
In scope: the home news block only. Out of scope: `/news-events`, article page, the 7/5 layout beside fight nights.

## Impact
- No API change, no migration. Frontend: `HomePage.tsx` (`NewsGrid` gets `wide`).

## Acceptance criteria
- [x] 1440 px, live data: section 1271 → 879 px, lead + two cards side by side, columns level.
- [x] 1024 px in Khmer, 375 px phone: no overflow, titles clamp.

## Log
- 2026-10-15: owner (phone screenshot): "footer => remove this section in phone" → the footer's brand block (logo, intro,
  Follow us / Facebook) is hidden below `md` (`SiteFooter.tsx`); phones start at Explore. Note: social links live only
  there, so phones have no Facebook link now.
- 2026-10-15: owner (phone screenshot): hero partner slider "in mobile view, don't need to display name" → below `sm` the
  cards show the logo only (82×82 px instead of 160 px wide tall cards); name stays for screen readers + `title` tooltip;
  tablet / desktop unchanged (`PartnerStrip` in `HomePage.tsx`).
- 2026-10-15: built and checked with the local code against the live pilot's public API (read-only GETs) at 1440 /
  1024 (Khmer) / 375 px. Public site typecheck + build OK. Live server unchanged.
