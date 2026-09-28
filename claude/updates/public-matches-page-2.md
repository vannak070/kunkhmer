# Update: Matches & Events — second pass

| | |
|---|---|
| **Status** | Done — committed 83c53b10 (2026-09-28) |
| **Jira** | n/a |
| **Feature** | claude/features/public-site.md |
| **Requested by** | vannak070 (2026-09-28: "http://localhost:5176/matches improve as well" → picked all four proposals) |

## Current behavior
`pages/MatchesAndEvents.tsx` (first pass: `updates/public-matches-page.md`, 17bfdac5). With no
upcoming card the default Upcoming tab is an empty box; the tab bar has no icons (the other
redesigned pages have them); "All fight nights" lists past events in one long grid; there is no
way to ask KUNKHMER HUB about a fight night from this page.

## Requested change
1. **No empty first screen**: when nothing is scheduled (and no filter is on), Upcoming shows the
   latest fight night as a spotlight — date, venue, broadcaster, bout count, poster or main-event
   face-off, "See results" when it has results, otherwise "Results to be announced" — above a short
   "no upcoming cards yet" note.
2. **Tab icons** like News & Media / Partners / Fighters: Upcoming (clock), Results (trophy), All fight
   nights (calendar).
3. **Past fight nights by month**, with a year filter when they span more than one year.
4. **Ask KUNKHMER HUB** under each fight night's bouts (once per event, not per card) and in the
   spotlight: the event page's questions (`HubAskAbout`, hidden when the Hub is off). Not on the
   "All fight nights" tiles (they are links; the event page has the questions).

## Scope
Out of scope: event page, home page, data.

## Impact
API / database: none. Frontend: `pages/MatchesAndEvents.tsx`, `i18n/messages.ts`.

## Acceptance criteria
- [x] The four changes above; light only; real data only.
- [x] Desktop + 375 px, EN + KM; `vite build` passes.
- [ ] Owner review.

## Log
### 2026-09-28
- `MatchesAndEvents.tsx`: `NextFightNight` got a `past` mode ("Latest fight night", "Results to be
  announced" chip or "See results", no countdown / calendar button); `buildView` adds `latestEvent`;
  `hubQuestions` / `withQuestions` reuse the event page's `hub.askEvent*` strings (first card per
  event only); `EventGrid` split into `EventTile`, new `PastEvents` (month headings, year select when
  more than one year; Khmer month + Khmer digits); `Empty` has a compact size under the spotlight.
  Strings `fights.latestNight`, `fights.year`, `fights.allYears` (EN + KM).
- Checked on dev data (one past fight night, 10 Jul 2026, no results, no upcoming): Upcoming shows
  the spotlight (date, venue, BTV Sport, 1 bout, main-event face-off, "Results to be announced", "View
  fight card") + "Tell me about Cambodia World Kun Khmer." + compact note; tab icons; All fight nights
  under "July 2026" / "ខែកក្កដា ឆ្នាំ២០២៦" at 375 px in Khmer, no sideways scroll.
- Owner asked to check with test data: temporary copy of the site on the test API (20 fight nights,
  60 bouts, 20 results — `ui-review-with-test-data` recipe), stopped afterwards. Found and fixed a bug:
  bouts from the API don't always carry the fight night's name, so no Hub questions appeared;
  `hubQuestions` now falls back to the event's own name. After the fix: Upcoming shows one question
  block per fight night (16 nights → 16 blocks; not repeated on a night's second card), 12 with
  "Who is fighting / When and where…", 4 with "results / main event"; Results tab 4 blocks with the
  results questions. Year select still not seen: every test fight night is dated in the future, so there
  are no past years to choose from.
