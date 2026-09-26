# Feature: Public fan website

| | |
|---|---|
| **Status** | In progress — phases 1–4 done; Fight Night home (brand step 1) built, not yet committed; event page redesign (step 2) next |
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
   `/matches?tab=events&event=<id>`, `/compare?red=<slug>&blue=<slug>`,
   `/rankings?division=<slug>`, `/about`, `/account`. Back/Forward must work.
5. **Brand**: tokens in `src/styles/brand.css` mirror the brand guideline
   (colours measured from the KKF emblem). Red corner left, blue right, always.

## Frontend (`frontend/public/src/app/`)
| Area | Files | Notes |
|---|---|---|
| Layout | `components/layout/SiteHeader.tsx`, `SiteFooter.tsx`, `GlobalSearch.tsx`, `HeaderAccount.tsx` | Shared by every page. Search indexes fighters, events and news on first focus. |
| Home | `components/home/FightNightHome.tsx` | Full-width bands: top stories (night) → next fight night (day) → featured fighters (night) → results + news (day, only unseen stories) → videos (night) → partners (day) → manifesto + social (night). Old `renderHome` removed. |
| Sections | `pages/SuperAppHome.tsx` | Still one large file for matches, news, fighters, partners, shop. Section comes from `/:section`; event detail from `?event=`. |
| Fighter | `pages/SuperAppFighterDetail.tsx`, `components/fan/FighterHistory.tsx`, `FollowButton.tsx` | Fight history, next fight, teammates from the API. |
| Article | `pages/ArticleDetail.tsx`, `components/ShareButtons.tsx` | Share: Facebook, X, Telegram, copy link (execCommand fallback). |
| Rankings | `pages/Rankings.tsx` | Division standings by record; champion from `/champions`. |
| Compare | `pages/Compare.tsx`, `components/fan/Matchup.tsx`, `data/matchup.ts` | Tale of the tape, overlaid radar, KK Rating (hidden below 3 shared metrics). |
| About | `pages/AboutKunKhmer.tsx` | Newcomer guide: history, rules, glossary. |
| Account | `pages/Account.tsx` | See fan-accounts. |
| Data | `data/fanData.ts` (`useFanData()`) | One cached load of fighters, matches, events, broadcasters, champions; derives history, next bout, standings, latest results. Retries after a failed request. |
| i18n | `i18n/LanguageContext.tsx`, `i18n/messages.ts` | Khmer dates formatted by hand (many browsers lack Khmer locale data); event dates rendered in UTC so the calendar day never shifts. |
| Head / SEO | `index.html`, `hooks/usePageTitle.ts` (`usePageMeta`) | OG image `public/og-image.png`; `SITE_URL` env at build (see `vite.config.ts`). |

**Demo mode** (development builds only): `?demo=1` fills empty results and
champions with sample data and shows a purple banner; `?demo=0` turns it off.
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
- **Step 2**: event page redesign (poster header, live countdown, tabs for fight
  card / results / where to watch), then a dark header for Fight Night pages,
  menu consolidation (Events · Fighters · News · About), tickets per event.
- The federation should review all Khmer copy (`messages.ts`, About page) and
  approve the proposed fonts, Fight Night theme and ring-rope ornament.
- Needed from the federation: YouTube / Instagram / TikTok URLs
  (`SOCIAL_LINKS` in `SiteFooter.tsx`), high-resolution posters and fighter
  portraits, a ticket link per event, event start times (only dates are stored).
- Newsletter signup and the Shop "Notify me" form only show a thank-you; no API yet.
- Shop / payments not started (payment provider TBD, e.g. ABA PayWay).
- Link previews per page need server-side meta tags (chat apps don't run JS).
- Before launch: remove `noindex` from `index.html`, set `SITE_URL`.
- Unused after the home redesign: `components/home/HeroSection.tsx`, `TrendingFightersSection.tsx`.
- Fighter "Verified" badge currently means status Active, not federation-verified.
