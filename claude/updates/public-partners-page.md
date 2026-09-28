# Update: Partners page in the Matches & Events style

| | |
|---|---|
| **Status** | Done — committed f4b4010f; follow-up (club-style cards, International Partners tab) committed b8a1a204 (2026-09-28) |
| **Jira** | n/a |
| **Feature** | claude/features/public-site.md |
| **Requested by** | vannak070 (2026-09-28: "http://localhost:5176/strategic-partners improve as well", after the News & Media redesign "follow match and event page") |

## Current behavior
`/strategic-partners` (`renderStrategicPartners` in `pages/SuperAppHome.tsx`): icon header, grey
segmented tabs (Clubs & Gyms · Broadcast Partners · Official Sponsors) not kept in the URL, cards
with the club's internal status ("ACTIVE"), the automatic club rating as stars (defaults to 4.0 on
create), a fake pulsing "LIVE" badge on every broadcaster, Unsplash stock photos / logos when
none is uploaded, English-only labels ("Fighters", "Events Broadcast", "Platinum Sponsors"…), purple
and yellow accents off-brand, and no way to become a partner. Unused `renderClubs`,
`renderBroadcasts` (with made-up "2.4M views" highlight cards) and `renderSponsors` remained.

## Change
New `pages/Partners.tsx`, same style as `/matches` and `/news-events`:
- Light header (eyebrow, title, subtitle) with stat chips: official sponsors, broadcast partners,
  clubs (only when > 0).
- Same tab control as `/matches`, as real URLs: Official Sponsors (default) · Broadcast Partners
  `?tab=broadcasters` · Clubs & Gyms `?tab=clubs`, with counts (old `?tab=broadcasts` works).
  Sponsors first: owner decision 2026-09-28 ("put sponsors first").
- Search per tab (clubs: name, Khmer name, place, coach; broadcasters: name, type, reach;
  sponsors: name, industry) + clear button.
- Clubs: photo (or light brand block), name in the site language, place, head coach, fighter count.
  No status badge, no rating. Only **active** clubs are listed (owner decision 2026-09-28, "hide
  inactive clubs"; status is the admin's Active / Inactive setting, missing = active).
- Broadcast partners: large logo (or initial), "Official broadcaster", type · reach, fight nights
  broadcast (when > 0), website link. No "LIVE" badge.
- Sponsors: grouped by tier (Platinum → Bronze, then untiered) with a small coloured dot heading;
  logo, name, industry, fight nights sponsored (when > 0), website link. Inactive sponsors /
  broadcasters hidden (same rule as the home page).
- "Put your brand in the ring" / "Become a partner" band (mailto, same text as the home page).
- Detail pages (`/club-detail`, `/sponsor-detail`, `/broadcast-detail`) unchanged; their Back
  button now returns to the right tab via the URL.
- 24 new `partners.*` strings (EN + KM).

## Scope
Out of scope: the three detail pages, the home page partner section. (An inactive club's detail
page and its fighters' profiles are unchanged.)

## Impact
API / database: none. Frontend: `pages/Partners.tsx` (new), `pages/SuperAppHome.tsx` (old renders
and the tab state removed), `i18n/messages.ts`.

## Acceptance criteria
- [x] Looks and behaves like `/matches` (header, tabs, search, empty states); light only.
- [x] Tabs are real URLs; detail Back returns to the tab.
- [x] Real data only — no stock images, internal statuses, automatic ratings or fake badges.
- [x] Desktop + 375 px, English + Khmer; `vite build` passes.
- [ ] Owner review.

## Log
### 2026-09-28
- Built as above. Checked on dev data (2 clubs, 1 broadcaster, 2 Platinum sponsors): each tab and its
  URL, sponsor card → `/sponsor-detail` → Back → `?tab=sponsors`; clubs tab at 375 px in Khmer, no
  sideways scroll.
- Owner follow-up: Official Sponsors is now the first and default tab (Clubs moved to `?tab=clubs`,
  club detail Back returns there) and inactive clubs are hidden from the list and the club count.
### 2026-09-28 — follow-up (owner: "improve display of Official Sponsors and Broadcast Partner … like Clubs & Gyms")
- Sponsor and broadcaster cards now use the club-card layout: 16:9 banner (the partner's `image`) with
  the logo on it — or, without a banner, the logo large on the light brand background — then badge,
  name, industry or type · reach, fight nights, website link / "View details".
- New International Partners tab (second) — see `features/international-partners.md`.
- Tabs and search now sit on one row only from `xl` (four tabs no longer squeeze and scroll at 1024 px).
- Checked on dev data (2 sponsors, 1 broadcaster with banners) and on a temporary copy on the test
  API (24 active international partners): tabs, cards, `&org=` dialog (Esc closes), home strip order,
  Khmer labels.
