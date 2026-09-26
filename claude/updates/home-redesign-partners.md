# Update: Home page redesign — friendlier, more professional, partner promotion

| | |
|---|---|
| **Status** | Done |
| **Jira** | n/a |
| **Feature** | claude/features/public-site.md |
| **Requested by** | vannak070 |

## Current behavior
`frontend/public/src/app/components/home/FightNightHome.tsx` (brand step 1,
commit b344ced4). Bands: Top stories (night) → Last/next fight night (day) →
Featured fighters (night) → Results + news (day, often empty) → Videos (night)
→ Partners (day, old `SponsorsSection.tsx`) → Manifesto + social (night).

Review (2026-09-26, 1280×800):
- 4 of 6 visible bands are dark; the page reads heavy rather than welcoming.
- No introduction or call to action for newcomers above the fold.
- Partners are near the bottom, in an off-brand component (purple tier chips,
  tier legend); one sponsor featured at a time; broadcaster not promoted.
- Results + news band disappears when every story is already in the top band.
- A past event with no results still offers a "Results" button.

## Requested change
Redesign the whole home page to feel friendly and professional, and promote
the official partners prominently and attractively.

## Why
The user doesn't like the current home page; partners need visible value
(sponsor retention and sales).

## Scope
In scope: home page layout and sections, a new partner showcase replacing
`SponsorsSection.tsx` on the home page, i18n strings, feature doc.
Out of scope: backend / API changes, the Partners section page, header menu
consolidation (step 3), shop.

## Impact
- API response shape changes? No — uses `/settings/sponsors` (tier, logo,
  industry, website) and `/settings/broadcast-stations`.
- Database migration needed? No.
- Frontend pages affected: home (`FightNightHome.tsx`, `SuperAppHome.tsx` props).

## Decisions (2026-09-26)
1. **Look**: light page with one dark Fight Night hero (footer stays dark).
2. **Partners**: "Official partners" logo bar right under the hero (sponsors by
   tier + official broadcaster); "Presented by <main sponsor>" on the fight-night
   card (home hero and event page header); a "Become a partner" call to action
   (mailto the footer's `info@kunkhmer.com`). No tiered showcase section; the
   old `SponsorsSection` band is removed from the home page.
3. **Hero**: welcome line + buttons, next to the upcoming fight night (poster,
   countdown, presented by). No upcoming event → the latest news story instead.
4. Real data only: sponsor logos / event posters without a real image are
   hidden, not replaced with stock photos.

## Acceptance criteria
- [x] Mostly light page with at most one or two dark bands; clear intro + call to action above the fold.
- [x] Partners visible above the fold (logo bar ordered by tier, linking to partner sites), "Presented by" on the fight-night card, a Become a partner call to action.
- [x] Only real data; sections without data are hidden; no empty bands.
- [x] All strings in English and Khmer; checked at 1280×800 and 375×812.
- [x] `vite build` passes in `kunkhmer_frontend_public`.

## Log

### 2026-09-26
- New `frontend/public/src/app/components/home/HomePage.tsx` replaces
  `FightNightHome.tsx` (deleted). `SuperAppHome.tsx` passes raw
  `sponsorsList` so missing logos aren't swapped for stock photos.
  `SiteFooter.tsx` exports `CONTACT_EMAIL`.
- Sections: dark hero → official partners bar → news + fight nights + latest
  results (one section, two columns) → featured fighters (4, real photos
  first) → videos → Become a partner (tinted) → newcomer guide + social.
- `PresentedBy` (exported from HomePage) also added to the event page header.
- 18 new `home.*` strings in English and Khmer (Khmer needs federation review).
- Partner stats hide below 10 so tiny numbers don't undersell the pitch
  (local data: 4 fighters, 1 event, 3 partners → hidden).
- Verified: `vite build` passes; `tsc` (run in the container) shows no errors
  in changed files (older errors remain in `SuperAppHome.tsx` ~l.832–845 and
  `data/*.ts` mocks). Browser at 1280×800 and 375×812, English and Khmer:
  partner bar visible above the fold on desktop, no horizontal scroll on phones
  (fixed a 525px overflow from auto-sized grids), Presented by on event header.
- Not verified: the hero's upcoming-event card (countdown, poster,
  Presented by), because there is no upcoming event in local data.

### 2026-09-26 — hero follow-up
- User disliked the dark hero and the three-line ring-rope divider under it.
  Hero is now light (blue-to-white gradient, soft brand glows, KKF-logo pill,
  navy headline, white secondary button); the ring ropes are gone from the
  home page; the partner bar became a white strip inside the hero (logos with
  dividers instead of boxed tiles; names wrap on phones). The page no longer
  has any dark band except the footer.
- Verified at 1440×900 and 375×812 (Khmer): no horizontal scroll, `vite build` passes.

### 2026-09-26 — footer follow-up
- User found the dark footer unprofessional. `SiteFooter.tsx` is now light
  (brand tint `#eef3fb`): logo + intro + "Follow us" buttons, Explore links,
  contact, a "Partner with Kun Khmer" card, copyright + back to top.
- Removed the newsletter form (it told visitors they had subscribed but saved
  nothing) and the "Official Shop — coming soon" link, at the user's request.
- Removed the duplicate "Stay connected" card from the home page (the footer
  carries the social links on every page). Strings: dropped 8 newsletter/shop
  footer keys and 3 `home.*` social keys; added `footer.followUs`,
  `footer.partnerText`, `footer.backToTop` (EN + KM).
- Verified: `vite build` passes; footer checked on home and rankings at
  1440×900 and in Khmer at 375×812 (no horizontal scroll).

### 2026-09-26 — partner + about follow-up
- Both sections had all content in the left half. "What is Kun Khmer" now
  sits beside three fact cards (reusing `about.quick1–3`, already translated);
  "Become a partner" is a rounded gradient card with the pitch beside a
  "Join our official partners" panel listing current partners (+ stats ≥ 10).
  Order swapped: About comes before the partner card, which is the last
  section before the footer. New string `home.joinPartners` (EN + KM).
- Briefly hid the footer's partner card on the home page; reverted at the
  user's request — the footer is the same on every page.
- Verified: `vite build`; 1440×900 and Khmer at 375×812, no horizontal scroll.
