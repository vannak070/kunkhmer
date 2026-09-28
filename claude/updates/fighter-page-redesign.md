# Update: Fighter page redesign (detail-pages plan step 3)

| | |
|---|---|
| **Status** | Done (not committed) — waiting for owner review |
| **Jira** | n/a |
| **Feature** | claude/features/public-site.md |
| **Requested by** | vannak070 (2026-09-28, "go ahead with step 3"; light style as recommended in the plan) |

## Current behavior
`/fighters/:slug` (`pages/SuperAppFighterDetail.tsx`): dark header band; record shown twice with
"Wins out of 254 recorded bouts" (those are profile numbers, not bouts on the site); "—" for missing
stance / style; weight cut off; "Kun Khmer division" label; a "Certified Champion" badge driven by the
verified flag (not by titles); English-only "Close Player"; extra fighters-list request for teammates.
(The club page was already rebuilt in `updates/partner-pages-2.md`.)

## Change
- Light header like the other detail pages: photo (initials if none or if the link breaks), weight class ·
  Professional/Amateur eyebrow, name EN/KM, nickname, club (links to `/clubs/:slug`), weight, age,
  nationality, **titles held** chips + "Champion" badge only from real championship data, Follow / Compare /
  Share; official record card (W-L-D, win ratio, bouts on the official record, recent form).
- **Next fight** spotlight (shared `Spotlight` / face-off: date, countdown, venue, broadcaster, Preview matchup,
  View fight card).
- **On this website** numbers (bouts recorded, wins, wins by finish, title bouts — only when there are
  recorded bouts) with a note that the official record is the full record.
- Fight history restyled light (`components/fan/FighterHistory.tsx`; opponent initials instead of broken
  images; old `NextFightCard` removed).
- Videos grid (only when the fighter has linked videos), Profile sidebar (club, weight class, weight, height,
  age, province, nationality, style, stance — each only when entered), Hub questions, teammates with the
  `/fighters` card + Club page link. Load error → Try again; unknown fighter → not-found page.
- Shared building blocks moved to `components/detail/DetailParts.tsx` (used by fighter and partner pages).

## Acceptance criteria
- [x] Light style, no dark band; real data only; no "—" placeholders; EN + KM.
- [x] Titles, next fight, on-site numbers, history, videos, profile, teammates — each hidden when empty.
- [x] Desktop + 375 px, EN + KM; public build.
- [ ] Owner review.

## Log
### 2026-09-28
- Checked on dev data (Pich Sambath / Pich Singhak: photo, club link, record card, profile sidebar,
  teammates; no recorded bouts → empty history note; no console errors; `/fighters/nobody` → not found) and on
  the disposable test API through a temporary site copy (title holder with a recorded KO win: champion badge,
  title chip, form, on-site numbers, history row; a fighter with a bout in 10 days: Next fight spotlight;
  broken photo link → initials). Phone width in Khmer: no sideways scroll; photo made smaller on phones.
- Data note: Pich Sambath's video is titled with his name but not linked to him in the admin (Videos →
  fighter), so it doesn't show on his page.
