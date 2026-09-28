# Feature: Public fan website

| | |
|---|---|
| **Status** | In progress — phases 1–4 done; step 2 (event page, `d4fe0ab2`) and the light home with partner promotion (`23d6a1ce`) committed; KUNKHMER HUB (`/hub`, the site's main function) committed `476c64de` 2026-09-28; queued: statistics page (`statistics.md`), then step 3 (menu consolidation) |
| **Jira** | TBD |
| **Figma** | TBD — brand guideline: design system artifact "Kun Khmer Brand" (https://claude.ai/artifact/5dHcDztT7toqRYCFrcKFLT, owner-private) |

## Goal
A bilingual (English / Khmer) public site where fans and first-time visitors
follow Kun Khmer: fighters, fight cards, results, standings, news and videos,
styled as "fight night" and trustworthy because every number comes from the
federation's records.

## Users and roles
- **Public visitor**: everything below, no account needed.
- **Fan** (signed in): follow fighters, notifications — see `features/fan-accounts.md`.

## Rules the site follows (keep them)
1. **Real data only.** Never estimate or invent: no ages from ids, no KO counts,
   no fake contacts/venues, no stock photos of other people as a fighter. Hide a
   field when the data is missing. Standings and the KK Rating say how they are
   calculated and are labelled unofficial.
2. **No internal wording.** Never show `Draft`, `Published`, workflow states or
   system accounts ("System Administrator", "Admin"). Use the helpers in
   `utils/publicDisplay.ts`: `publicName()`, `publicStatus()` →
   `PublicStatusBadge` (Draft → "To be confirmed", Weight-In → "Weigh-in"; Published shows nothing).
3. **Everything bilingual.** No hard-coded UI strings: add keys to
   `i18n/messages.ts` (English first; TypeScript forces the Khmer entry) and use
   `useI18n()` → `t`, `tn` (plurals), `formatDate`, `formatWeight`, `localName`.
   Mark database text with `lang={textLang(text)}` (it can be Khmer on the English
   site and vice versa); fonts and line height follow it.
4. **Real URLs** for everything shareable: `/fighters/:slug`, `/article/:id`,
   `/events/:id?view=card|results|watch` (old `/matches?tab=events&event=<id>` links redirect), `/compare?red=<slug>&blue=<slug>`,
   `/matches` (`?tab=results|events`), `/clubs/:slug`, `/partners/sponsors/:slug`, `/partners/broadcasters/:slug`, `/about`, `/hub` (`?q=` asks a question), `/account` (`/rankings` was removed and redirects to `/fighters`). Back/Forward must work.
5. **Brand**: tokens in `src/styles/brand.css` mirror the brand guideline
   (colours measured from the KKF emblem). Red corner left, blue right, always.

## Frontend (`frontend/public/src/app/`)
| Area | Files | Notes |
|---|---|---|
| Layout | `components/layout/SiteHeader.tsx`, `SiteFooter.tsx`, `GlobalSearch.tsx`, `HeaderAccount.tsx` | Shared by every page. Menu: Home · Matches & Events · News & Media · Fighters · Partners · About Kun Khmer ▾ (About, KUNKHMER HUB) — `NAV_ITEMS` items with `parent` go in that dropdown. Search indexes fighters, events and news on first focus. Footer is light (brand tint): logo + intro + social buttons, site links, contact, a "Partner with Kun Khmer" card (mailto), copyright + back to top. Social links live only in the footer. |
| Home | `components/home/HomePage.tsx` | Light hero, kept simple (soft blue gradient, KKF-logo pill, navy headline, tagline, KUNKHMER HUB ask box — no extra buttons, the menu covers them; see `updates/home-hero-simplify.md`); next to the upcoming fight night with poster, countdown and "Presented by" main sponsor; no upcoming event → no side card and the hero is centred; news stays in the news section) with the official partners inside it (one row that slides with ‹ › buttons when they don't all fit — `updates/home-partner-slider.md`; one white card per partner — large logo, name, "Official broadcaster" for TV; no heading; sponsors by tier + broadcaster, linked; no ring-rope divider), then light sections: news (translated category, date, reading time, summary — as on `/news-events`) with fight nights and latest results → featured fighters (real photos first, the `/fighters` card; see `updates/home-consistency-pass.md`) → videos → What is Kun Khmer (text + the three About quick facts) → Become a partner card (pitch + mailto `CONTACT_EMAIL`, beside a "Join our official partners" logo wall grouped by role with a "Your brand here" tile; reach stats only from 10 up). Missing images show a brand block (`isRealImage`); no stock photos. |
| Event | `pages/EventDetail.tsx`, `components/event/EventParts.tsx` | Light header: poster in a white frame (or the main-event face-off), status / countdown / results chips, date, venue + Open map, broadcaster link, key numbers, Presented by, calendar, share. Tabs Fight card · Results · Where to watch (hidden when empty; past events open on Results). Past night without results: note + "Result to be announced" per bout. See `updates/event-compare-articles.md`. |
| Matches & Events | `pages/MatchesAndEvents.tsx` | `/matches`: light header + stats, tabs Upcoming · Results (`?tab=results`) · All fight nights (`?tab=events`), search + weight filter, "Next fight night" spotlight, cards with bouts (`BoutRow`), past cards without results under "Results to be announced"; nothing scheduled → "Latest fight night" spotlight; tab icons; KUNKHMER HUB questions under each fight night; past nights by month with a year filter. See `updates/public-matches-page.md` and `public-matches-page-2.md`. |
| News & Media | `pages/NewsAndMedia.tsx` | `/news-events`: same style as Matches & Events — light header + stats, tabs News · Videos (`?tab=media`), search + category (+ fighter on Videos) filters, featured story spotlight, card grids with "Show more", player at `&video=<id>`. See `updates/public-news-media-page.md`. |
| Partners | `pages/Partners.tsx` | `/strategic-partners`: same style as Matches & Events — light header + stats, tabs Official Sponsors (default, grouped by tier) · International Partners (`?tab=international`, `&org=<id>` detail dialog; `features/international-partners.md`) · Broadcast Partners (`?tab=broadcasters`) · Clubs & Gyms (`?tab=clubs`, active clubs only), all cards in the club layout (banner, logo, details), search, website links, "Become a partner" band; no status badges, ratings or stock images. International partners also appear in the home partner strip. Cards open the partner pages below. See `updates/public-partners-page.md`. |
| Fighters | `pages/FightersDirectory.tsx` | `/fighters`: same style as Matches & Events — light header + stats (fighters, clubs, current champions), tabs All · Men · Women (`?gender=`, only when both exist), search + official weight class + club filters, portrait cards (real photo or initials, Champion badge for current title holders, club, class + age, official W-L-D, next fight), A–Z, "Show more". See `updates/public-fighters-page.md`. |
| Sections | `pages/SuperAppHome.tsx` | Small shell (~230 lines) for Home, Matches, News & Media, Fighters, Partners + the video dialog; loads the lists they share. Section from `/:section`; unknown sections → Page not found; `?event=` redirects to `/events/:id`. Shop / cart / match-detail were removed in step 1 (`updates/public-step1-links-honesty-cleanup.md`). |
| Club / sponsor / broadcaster | `pages/PartnerPages.tsx`, `data/partners.ts` | `/clubs/:slug`, `/partners/sponsors/:slug`, `/partners/broadcasters/:slug` (slug = name, id also works; old `/club-detail` etc. redirect). Banner header + logo card, key numbers (only > 0), next fight / fight night spotlight with face-off, club champions + `/fighters` cards (first 9, "Show all") + details sidebar (map link), sponsor / broadcaster fight nights + details. Only entered or counted facts, no private contact people. See `updates/partner-pages-2.md`. |
| Not found / load errors | `pages/NotFound.tsx`, `components/LoadError.tsx` | `*` and unknown sections → "Page not found". Fan data has `failed` + `retryFanData()`; pages show "Try again". |
| Fighter | `pages/SuperAppFighterDetail.tsx`, `components/fan/FighterHistory.tsx`, `FollowButton.tsx`, `components/detail/DetailParts.tsx` | Light header (photo or initials, club link, titles held, official record card + form), next fight spotlight, "on this website" numbers, fight history, videos, profile sidebar, teammates. See `updates/fighter-page-redesign.md`. |
| Article | `pages/ArticleDetail.tsx`, `data/news.ts`, `components/ShareButtons.tsx` | English site shows the optional English version (`title_en` …, admin "English version") with a "Read the original (Khmer)" switch; Khmer-only articles are labelled "Article in Khmer". Share: Facebook, X, Telegram, copy link. |
| ~~Rankings~~ | removed 2026-09-28 | Division standings page deleted (KKF has no way to manage official rankings yet, and the unofficial standings could confuse fans); `/rankings` redirects to `/fighters`. |
| Compare | `pages/Compare.tsx`, `components/fan/Matchup.tsx`, `data/matchup.ts` | Light header + "not a prediction" note, type-to-search pickers, light face-off, tale of the tape, overlaid radar, KK Rating (hidden below 3 shared metrics), head-to-head. |
| About | `pages/AboutKunKhmer.tsx` | Newcomer guide in the light style: header with "On this page" chips, quick facts, history, how a fight works (+ red/blue corners), how to watch, glossary (no ranking terms), "Still curious?" KUNKHMER HUB questions (hidden when the Hub is off), light "follow the action" card. See `updates/public-about-page.md`. |
| KUNKHMER HUB | `pages/KunKhmerHub.tsx`, `components/hub/*` | The site's main function: AI "ask anything about Kun Khmer" page at `/hub`, in the menu inside the "About Kun Khmer" dropdown (`NavDropdown`; indented under About in the phone menu, after About in the footer), with an ask box in the home hero (`HubAskBox`) and an "Ask about this" card (`HubAskAbout`, questions open `/hub?q=`) on fighter, event, compare and article pages. See `features/ai-assistant.md`. |
| Account | `pages/Account.tsx` | See fan-accounts. |
| Data | `data/fanData.ts` (`useFanData()`) | One cached load of fighters, matches, events, broadcasters, champions; derives history, next bout, standings, latest results. Retries after a failed request. |
| i18n | `i18n/LanguageContext.tsx`, `i18n/messages.ts` | Khmer dates formatted by hand (many browsers lack Khmer locale data); event dates rendered in UTC so the calendar day never shifts. |
| Head / SEO | `index.html`, `hooks/usePageTitle.ts` (`usePageMeta`) | OG image `public/og-image.png`; `SITE_URL` env at build (see `vite.config.ts`). |

**Demo mode** (development builds only): `?demo=1` fills empty results and
champions with sample data (three sample results go on the latest event so its
Results tab can be reviewed) and shows a purple banner; `?demo=0` turns it off.
Production builds never enable it.

## Base code / patterns
- API field quirks the site depends on: match `fighter_a_record`/`fighter_b_record`,
  `winner_duration` (admin saves `"0:00"` when unknown — treat as empty),
  event `organizer_name`, `broadcast_station_id`.
- Brand CSS utilities: `.kk-display`, `.kk-heading`, `.kk-stat`, `.kk-label`,
  `.kk-night` (Fight Night band), `.kk-ropes` (the ring-rope divider, once per screen), `.kk-focus`.

## Tests
No frontend tests. Verify in the browser at 1280×800 and 375×812, in English
and Khmer (`claude/tests/test-admin-ui.md` pattern), and run `vite build` in the
`kunkhmer_frontend_public` container.

## Open questions / next steps
- **Next**: public statistics (`features/statistics.md`) and the KUNKHMER HUB
  plan (knowledge base etc., `features/ai-assistant.md`) — both wait on open questions.
- **Step 3**: dark header for Fight Night pages, menu consolidation
  (Events · Fighters · News · About), then tickets per event (step 4).
- Event countdown is in days because events store a date only; switch to
  hh:mm:ss once events get a start time. Where to watch shows for upcoming
  events with a broadcast station only (one station per event).
- The federation should review all Khmer copy (`messages.ts`, About page) and
  approve the proposed fonts, Fight Night theme and ring-rope ornament.
- Needed from the federation: YouTube / Instagram / TikTok URLs
  (`SOCIAL_LINKS` in `SiteFooter.tsx`), high-resolution posters and fighter
  portraits, a ticket link per event, event start times (only dates are stored).
- Newsletter signup was removed from the footer (it only showed a thank-you); add it back with a real subscriber API. The Shop "Notify me" form still only shows a thank-you.
- Shop / payments not started (payment provider TBD, e.g. ABA PayWay).
- Link previews per page need server-side meta tags (chat apps don't run JS).
- Before launch: remove `noindex` from `index.html`, set `SITE_URL`.
- Fighter "Verified" badge currently means status Active, not federation-verified.
