# Update: Match day mode (one bout at a time, big buttons)

| | |
|---|---|
| **Status** | Done 2026-10-13 (committed and pushed (dev 11253144), not live) |
| **Jira** | n/a |
| **Feature** | program-workflow.md, claude/updates/program-officer-friendly.md (weigh-in, results) |
| **Requested by** | Owner ("go ahead with match-day mode", item 19 of the Matches proposal list) |

## Current behavior
On the day, an officer jumps between two list screens — Weigh-in (every bout, small fields) and Results (every bout, small buttons) — and between fight cards. Fine at a desk, slow on a phone at the ring.

## Requested change
A focused screen, **Match day** (`/home/events/:id/match-day`, KKF staff): the whole match, one bout at a time.
- Top: back to the match, "Bout 3 of 8", a progress bar, and a strip of numbered bout buttons (colour = not started / weighed in / over weight / result recorded) to jump anywhere.
- The current bout in two big steps: **1 Weigh-in** (both fighters, large kg field, Pass / Over shown live, "Save weigh-in") and **2 Result** (big buttons: who won / draw / no contest, how it ended, which round, "Save result"). Saving the weigh-in moves to the result; saving the result moves to the next bout that has none; a finished match says so.
- A saved result shows read-only with "Change"; changing a title fight's winner asks first (the belt moves), same rule as the Results page.
- Over-weight fighters: shown red with "Check with KKF before the bout" (withdrawal / replacement is phase 6, not built).
- Entry: a banner on the match page ("It's match day" / "Results are still to record") and a button on the "Your next job" card on those days; always available from the match page's More menu.
- English + Khmer, 48–64 px touch targets, works at 375 px.

## Scope
In scope: `pages/MatchDay.tsx`, `components/program/resultForm.ts` (shared result form logic, also used by the Match page), banner + links, routes, texts (`md.*`).
Out of scope: offline saving (PWA step 4), withdrawal / replacement (phase 6), changing the Weigh-in and Results list pages (they stay).

## Impact
No API change, no migration. Uses `POST /matches/:id/weigh-in` and `POST /matches/:id/result`.

## Acceptance criteria
- [x] Weigh both fighters → result → next bout, on the test API, in English and Khmer at 375 px.
- [x] Over-weight warning (browser-checked); title-fight winner change asks first (same shared rule as the Match page, `resultForm.ts`); other roles see "Only KKF staff run match day" and the route needs `events.edit`.
- [x] Typecheck clean (only the old errors in data/, usePermissions, ShareFightCard remain).

## Log
- 2026-10-13: built. New `pages/MatchDay.tsx`, `components/program/MatchDayBanner.tsx` (match page + "Your next job" card, shown on match day or while results are open; "Open match day" always in the More menu), `components/program/resultForm.ts` (the Match page now uses it too), route `events/:id/match-day` (guard `events.edit`), `md.*` texts (EN + KM). Browser-checked on the test API at 375 px: weigh-in → result → auto-advance to the next bout, progress bar and bout strip colours, over-weight warning, Khmer. The Weigh-in and Results list pages are unchanged (they still have their own copy of the result logic).
