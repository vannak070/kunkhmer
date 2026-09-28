# Update: Step 1 — real links for club / sponsor / broadcaster pages, honest content, 404, load errors, cleanup

| | |
|---|---|
| **Status** | Done (not committed) — waiting for owner review |
| **Jira** | n/a |
| **Feature** | claude/features/public-site.md |
| **Requested by** | vannak070 (2026-09-28, detail-pages plan step 1) |

## Current behavior
- `GET /api/videos` returns Draft videos to everyone (same issue step 0 fixed for news).
- Club / sponsor / broadcaster pages live inside `SuperAppHome` at `/club-detail`, `/sponsor-detail`,
  `/broadcast-detail` with the chosen partner only in React state: refresh or a shared link → empty page.
  They show invented or internal data (4.5★ rating, "Verified", "Live & Active", "National" reach
  default, every sponsor "platinum", raw statuses, stock banners/logos/fighter photos) and ~75
  English-only strings.
- Unknown URLs silently redirect to the home page.
- A failed API load looks like "no data" (or spins forever if mapping throws).
- `SuperAppHome.tsx` (1,851 lines) still carries a fake shop / cart / checkout / orders / subscription /
  "John Doe" profile, a dead match-detail view, mock data and unused imports; ~7,400 lines of unused
  files (mock data, old match cards/filters, mock-up screenshots).

## Change
- Videos API: Published only for the public, KKF staff see drafts (like news).
- New pages with real URLs (old `/club-detail` etc. redirect to `/strategic-partners`):
  - `/clubs/:slug` — club header (logo/photo if real, name EN/KM, location, head coach, established),
    tap-to-call / email (public club contacts, as before), about, registered fighters (photo or
    initials, record, weight), club fighters' upcoming bouts and latest results, share, Hub questions.
  - `/partners/sponsors/:slug` — logo, name, tier only when set (translated), industry, website,
    fight nights they present. No contact person / phone / email (private).
  - `/partners/broadcasters/:slug` — logo, name, type, reach only when set, website, "Watch live" when a
    stream link exists, fight nights they air (upcoming / past). No contact person details.
  - All in the light style, EN + KM strings, page titles/descriptions; slug = name like fighters, id also works.
- Real "Page not found" page (`*` and unknown sections), with search tips and links.
- Load errors: fan data remembers a failed load (`failed`) and pages show "Couldn't load — Try again"
  (`components/LoadError.tsx`) instead of empty results or an endless spinner.
- Cleanup: `SuperAppHome` reduced to the section shell (home, news, fighters, matches, partners, video
  player); shop / cart / checkout / orders / subscription / profile / match-detail, Wallet/Order
  contexts, mock data files, old `MatchBatchCard` / `MatchFilters` / `FighterFilters`, the old detail
  components and unused mock-up images removed. Unused npm packages removed where nothing imports them.

## Acceptance criteria
- [x] Draft video hidden from public, visible to staff (contract test); full suite `CI=true`; typecheck.
- [x] Club / sponsor / broadcaster pages open from Partners, survive refresh, share a real URL; old links redirect.
- [x] No invented ratings / tiers / badges / stock images; no internal statuses; EN + KM.
- [x] Unknown URL → Page not found.
- [ ] API down → Try again message — built, not seen live (stopping the local backend was blocked; owner can check by stopping `kunkhmer_backend` and opening /matches or a club page).
- [x] Home, Matches, News, Fighters, Partners still work (desktop + phone, EN + KM); public build passes.

## Log
### 2026-09-28
- Backend: `videos/routes.ts` `visibleTo(request)` like news; contract test in `content.test.ts`.
  Hub `search_clubs` / `get_club` now link `/clubs/<slug>` (same slug rule as the site).
- Public: new `pages/PartnerPages.tsx` (ClubPage, SponsorPage, BroadcasterPage — shared light header,
  logo or initials, facts only when entered, tap-to-call/email for clubs, website / "Watch live",
  fight nights from `sponsorIds` / `main_sponsor_id` / `broadcast_station_id`, club roster + upcoming
  bouts + latest results via `BoutRow`, Hub questions), `data/partners.ts` (slug, cached loaders,
  `findPartner`), `pages/NotFound.tsx`, `components/LoadError.tsx` (LoadError + accessible Loading).
  `fanData.ts`: `failed` flag, `.catch` → empty failed result (no endless spinner), `retryFanData()`
  with listeners; LoadError banner on Matches, Fighters, Event (failed load ≠ "event not found"),
  Compare, Home. Routes: `/clubs/:slug`, `/partners/sponsors/:slug`, `/partners/broadcasters/:slug`,
  `/club-detail` `/sponsor-detail` `/broadcast-detail` → Partners tab, `/match-detail` → /matches,
  `*` → NotFound; unknown `/:section` → NotFound (e.g. `/shop`).
- `SuperAppHome.tsx` 1,851 → ~230 lines (no batches/matches requests any more; news/video mapping without
  stock fallbacks; video dialog labelled). Removed: Wallet/Order contexts, Club/Sponsor/Broadcast detail
  components, MatchBatchCard, MatchFilters, FighterFilters, data/mock, batches, additional-batches,
  event-types, mediaContent, masterData mock lists (only `getFighterSlug` left), 4 mock-up PNGs.
  npm: 52 unused packages uninstalled (200 with dependencies); 6 left (react, react-dom, react-router,
  lucide-react, sonner, tw-animate-css).
- Checked in the browser: Partners → club opens `/clubs/pich-sophann-kunkmer`; sponsor
  `/partners/sponsors/cambodia-beer` ("Platinum sponsor" from the real tier, 1 fight night) and broadcaster
  `/partners/broadcasters/btv-sport` open directly (refresh works); Khmer-named club URL works; KM + 375 px
  no sideways scroll; `/club-detail` → Partners clubs tab; `/shop` and `/some/old/link` → Page not found;
  Home, News (+media tab), Fighters, Matches, Partners load with content, no console errors.
  Build JS 713 → 654 KB, CSS 129 → 96 KB. Contract suite 232/232 (`CI=true`), backend typecheck clean.
- Data notes for staff: club "established" was entered as "២2015" (mixed Khmer/Latin digit).
