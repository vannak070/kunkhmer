# Update: Event page redesign (brand step 2)

| | |
|---|---|
| **Status** | Done (not committed) |
| **Jira** | n/a |
| **Feature** | claude/features/public-site.md |
| **Requested by** | vannak070 |

## Current behavior
Public event detail is `renderEventDetail()` in
`frontend/public/src/app/pages/SuperAppHome.tsx` (~line 3046), reached at
`/matches?tab=events&event=<id>`. One long page:
- Blue gradient banner: status badge, `CountdownChip` (date only), a hard-coded
  English "Results Available" chip, name, description, bout count.
- Details grid: date, venue, organizer, broadcast station name; sponsor chips.
- `WhereToWatch` box (upcoming events only) from `broadcasterForEvent()`.
- Fight card: batches → matches; results are shown inline on the same cards.
- Problems: Unsplash stock photo as fighter fallback and hard-coded
  "TBD" / "Independent" / "Results Available" break the real-data and
  bilingual rules; styling predates the brand tokens.

## Requested change
K-1-style fight night event page:
1. **Poster header** (`.kk-night`): event `image` as the poster when present,
   otherwise a typographic poster built from the main event (red corner left,
   blue right, real photos only). Date, venue, status, share / add to calendar.
2. **Live countdown** for upcoming events.
3. **Tabs**: Fight card · Results · Where to watch, each with its own URL.
   Past events open on Results, upcoming on Fight card; a tab with no data is hidden.
4. Sponsors and organizer below the tabs; all strings in `messages.ts`.

## Why
Event pages are what fans share before and after a fight night; the current
page doesn't match the Fight Night home (step 1).

## Scope
In scope: public event detail page, new components under
`components/event/`, i18n keys, feature doc update.
Out of scope: tickets (step 4), menu consolidation (step 3), admin pages,
server-side link previews.

## Impact
- API response shape changes? None.
- Database migration needed? None.
- Frontend pages affected: `SuperAppHome.tsx` (event detail), routes, every link
  to an event (home, search, fighter history).

## Decisions (2026-09-26)
1. **Countdown in days** ("3 days to go" / "Tomorrow" / "Tonight") — no backend
   change; upgrade to hh:mm:ss once events get a start time.
2. **Where to watch** uses the existing single broadcast station; tab hidden
   when the event has none.
3. **URL** `/events/:id` with `?view=card|results|watch`; the old
   `/matches?tab=events&event=<id>` redirects there.

## Acceptance criteria
- [x] Poster header uses the brand tokens; never a stock photo of another person.
- [x] Countdown matches the chosen precision and disappears once the event starts.
- [x] Tabs have real URLs, Back/Forward works, empty tabs hidden.
- [x] No hard-coded strings; English and Khmer checked at 1280×800 and 375×812.
- [x] `vite build` passes in `kunkhmer_frontend_public`.

## Log

### 2026-09-26
- New page `frontend/public/src/app/pages/EventDetail.tsx` at `/events/:id`
  (`?view=card|results|watch`, pushed to history so Back/Forward works);
  parts in `components/event/EventParts.tsx` (`MainEventFaceoff`, `BoutRow`,
  `FighterAvatar` with initials instead of stock photos, `SponsorStrip`).
- `routes.tsx`: `/events/:id`, `/events` → `/matches?tab=events`.
  `SuperAppHome.tsx`: `?event=` redirects; old `renderEventDetail` removed
  (~390 lines, with its unused imports). Links updated in `FighterHistory`,
  `GlobalSearch`, `HeaderAccount`.
- `data/fanData.ts`: `Bout.cardId` / `sortOrder`, `eventBouts()`,
  `mainEventBout()` (home uses it too); demo mode puts 3 sample results on
  the latest event.
- 17 new `event.*` strings in English and Khmer (Khmer needs federation review).
- Verified: `vite build` in `kunkhmer_frontend_public` passes; `tsc` over the
  router's import graph has no errors. In the browser at 1280×800 and 375×812,
  English and Khmer: old URL redirects, poster header, fight card, Results tab
  (demo data) defaults for past events, tab Back/Forward, not-found page,
  home "Results" button opens the new page, no horizontal scroll on phones.
- Not verified: an upcoming event (countdown and Where to watch tab), because
  the only local event is in the past.
