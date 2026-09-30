# Update: Event tiles show the whole poster

| | |
|---|---|
| **Status** | Done (2026-09-30, committed 1e1bf0d9) |
| **Feature** | public-site.md (Matches & Events › All fight nights) |
| **Requested by** | vannak070 ("it is not correct, please improve more") |

## Before
`EventTile` (`pages/MatchesAndEvents.tsx`) put the poster in a fixed 144 px box with `object-cover`, so a wide banner was cropped on both sides, and the countdown chip sat on top of the artwork.

## Change
With a real poster the tile shows the whole image (`h-auto`, capped at `max-h-64`, top-aligned for tall posters). The countdown chip moves into the text area next to the weekday/date. Events without a poster keep the date block with the chip on it.

## Log
2026-09-30: checked on the dev fan site (desktop) with the Oct 3 demo fight night and the July event.
