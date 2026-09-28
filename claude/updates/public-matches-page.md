# Update: Matches & Events page for global fans

| | |
|---|---|
| **Status** | Done (not committed) — waiting for owner review in the browser |
| **Jira** | n/a |
| **Feature** | claude/features/public-site.md |
| **Requested by** | vannak070 (2026-09-28: "improve this page for more user friendly and professional for global fan") |

## Current behavior
`/matches` (`renderMatches` in `pages/SuperAppHome.tsx`): three tabs Matches / Results / Upcoming
Events; fight cards with a dark navy header band and a lone "BOUT 1" tile — fighters only after
opening "View details"; hidden filters; any card not marked Completed counted as upcoming, so a past
card (e.g. Jul 10) showed as upcoming with "Weigh-in"; the events tab had a dark header band and
said "No upcoming events" above the past list.

## Change
New `pages/MatchesAndEvents.tsx`, used only for the `/matches` section (home, event pages and the
old `MatchBatchCard` are untouched; the old `renderMatches` code was removed):
- Light header (brand gradient like the home hero), short lead, stat chips (fight nights coming up,
  bouts scheduled, official results — each only when > 0; compact 3-column row on phones).
- Tabs as real URLs: Upcoming (default) · Results `?tab=results` · All fight nights `?tab=events`,
  with counts; old `?tab=matches|previous|events` links still work.
- Always-visible search (fighter, club, card, event) + weight-class filter (official classes in use),
  clear button.
- Upcoming: "Next fight night" spotlight (date block, countdown, venue, broadcaster, bout count,
  View fight card, Add to calendar, main-event face-off red vs blue), then each upcoming card with
  its bouts shown (the event page's `BoutRow`: photos/initials, club, record, weight, rounds,
  title badge, Preview matchup).
- "Upcoming" means the card's date is today or later; past cards without results move to Results
  under "Results to be announced" (links to the event page).
- Results: recorded results grouped by card, newest first (W/L badges, method, round, time).
- All fight nights: event cards (poster or date block, countdown, venue, broadcaster, bout count),
  "Coming up" then "Past events", searchable.
- Friendly empty states with "See results" and "Ask KUNKHMER HUB".
- 31 new `fights.*` strings (EN + KM); `KM_MONTHS` exported from `i18n/LanguageContext.tsx` for the
  date badges.

## Acceptance criteria
- [x] Light, no dark bands or ring ropes; brand tokens; red corner left.
- [x] Real data only (no stock photos; initials when no photo).
- [x] Desktop and phone (375 px, no sideways scroll), English and Khmer.
- [x] `vite build` passes.
- [ ] Owner review.

## Log
### 2026-09-28
- Built as above. Checked on the real dev data (no upcoming card → friendly empty state; Jul 10
  card under "Results to be announced"; past event card with poster) and, for the full layout, on a
  temporary copy of the site pointed at the disposable test API (10 upcoming nights, 20 bouts,
  10 results from the contract tests) at desktop and 375 px in Khmer. Temporary copy stopped
  afterwards.
