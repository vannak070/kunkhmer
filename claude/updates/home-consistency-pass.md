# Update: Home page consistency pass

| | |
|---|---|
| **Status** | Done (not committed) — waiting for owner review in the browser |
| **Jira** | n/a |
| **Feature** | claude/features/public-site.md |
| **Requested by** | vannak070 (2026-09-28: "how about homepage" → chose "Consistency pass": keep the layout and the approved hero / partner parts, align the sections with the redesigned pages) |

## Current behavior
`components/home/HomePage.tsx` after the Matches, News & Media, Partners, Fighters and About
redesigns: news cards show category (as typed, English only) + date + title; featured fighter
cards show the club and a bare weight ("60.5 kg (133 lb)") on one truncated line, no weight
class, no champion badge; headings and links in Title Case ("Latest News", "View All News",
"Featured Fighters", "View All") while the new pages use sentence case.

## Requested change
- News: category translated (same labels as `/news-events`, red label), date, reading time, and the
  summary on every card.
- Featured fighters: the same card as `/fighters` (`FighterCard` exported from
  `pages/FightersDirectory.tsx`: real photo or initials, Champion badge for current title holders,
  name + other script, club, weight class + age, official W-L-D, next fight), plus the recent-form
  dots the home card had (shown on `/fighters` too when a fighter has recorded bouts).
- Headings / links in sentence case in English (Khmer unchanged).
Unchanged: hero, partner strip, section order, fight nights, results, videos, What is Kun Khmer,
Become a partner.

## Impact
API / database: none. Frontend: `components/home/HomePage.tsx`, `pages/FightersDirectory.tsx`,
`pages/NewsAndMedia.tsx` (exports), `i18n/messages.ts`.

## Acceptance criteria
- [x] Home news / fighter cards match the News & Media and Fighters pages.
- [x] Approved parts unchanged. Desktop + 375 px, EN + KM; `vite build` passes.
- [ ] Owner review.

## Log
### 2026-09-28
- `HomePage.tsx`: `NewsMeta` (translated category via `CATEGORY_KEYS` exported from
  `NewsAndMedia.tsx`, date, reading time from the article body) on the lead, list and equal cards;
  summary added to the equal cards. Featured fighters use `FighterCard` + `currentTitles` exported from
  `FightersDirectory.tsx` (same 4 fighters, same order); the home page's own fighter card was removed.
  The shared card now also shows the recent-form dots (on `/fighters` too, when there are recorded bouts).
- English strings: "Latest news", "All news", "Featured fighters", "Latest videos", "All videos"; new
  `home.allFighters` ("All fighters" / "កីឡាករទាំងអស់") replaces "View All". `common.viewAll` now unused.
  `SuperAppHome` already passed the article body, so no change there.
- Checked on dev data: news cards (red category, date, "1 min read", summary), featured fighters as on
  `/fighters`, 375 px in Khmer with no sideways scroll. Hero, partner strip and the other sections
  unchanged.
