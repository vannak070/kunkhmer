# Feature: Admin as an installable app (PWA) for low-tech operators

| | |
|---|---|
| **Status** | Steps 1 + part of 2 built 2026-10-13 (uncommitted, not deployed) — `updates/admin-pwa-performance.md`; real-phone check, login-on-several-devices and steps 3–4 still open |
| **Jira** | n/a |
| **Figma** | n/a |
| **Owner** | vannak070 |

## Goal
KKF officers who are "limited on tech" open the admin from an icon on their phone or computer, like any app:
full screen, big simple screens, English or Khmer, clear messages when the internet drops, no stale versions.
Admin first; the fan site later.

## State on 2026-10-13 (checked)
- Admin has **no** PWA parts: no manifest, no service worker, no PWA plugin, one 16×16-style `favicon.png`.
- Fonts (Inter, Outfit, Moul, Kantumruy Pro) load from Google Fonts → no offline, slow on weak connections.
- 27 of 43 admin pages use the simple EN/KM style (`useT`); 16 old-style pages remain: Champion, ShareFightCard,
  ChampionDetail, MatchDetail, CreateBatch, AddClub, CreateChampion, Help, ChampionHistory, MatchProposals,
  Clubs, MatchCreatedSuccess, ScheduleTitleBout, NotFound (+ 2 redirects).
- Phone layout works (no sideways scroll) and the menu is a drawer, but there is no phone navigation bar.
- Caddy already sends `no-cache` for pages and `immutable` for `/assets/*`, which suits a service worker.
- Logging in revokes earlier tokens: signing in on a phone signs the same account out on the computer.
- Known: a session that expired shows "not found" instead of the login page.

## Plan
1. **Installable app (small).** `manifest.webmanifest` (name "KKF Admin", `start_url` /home, standalone, theme
   #0A3D91, EN/KM), icons 192 / 512 / maskable from the KKF emblem, iOS tags, service worker that caches only the
   app shell (never API data), self-hosted fonts, friendly offline screen ("No internet — nothing was saved"),
   "A new version is ready — Update" bar, and an "Install" help card (Android: button; iPhone: 3 picture steps).
   Tool: `vite-plugin-pwa` (Workbox, update prompt). Caddy: check `sw.js` / manifest headers.
2. **Phone-friendly shell.** Bottom bar on phones (Home · Fight nights · Fighters · Clubs · More), 48 px touch
   targets, Khmer side menu, session-expired → login page with a clear message, language switch kept per device.
3. **Convert the 16 old pages**, most-used first: Clubs + AddClub → Champions (list, create, detail, history,
   schedule) → MatchDetail → Help → ShareFightCard.
4. **Later, only if wanted:** offline weigh-in / results queue for fight night, push notifications, fan-site PWA.

## Rules for the PWA
- Never cache API responses or pictures of private records; offline = read the app shell, saving needs internet.
- Updates must be visible (prompt), never silent stale screens after a deploy.
- Login token stays in the browser; installed iPhone apps have their own storage → sign in once again.
- Test on a real Android phone and a real iPhone, in English and Khmer, before the live deploy.

## Decisions so far (2026-10-13)
- Khmer font: Kantumruy Pro self-hosted (variable, one file for all weights) with Noto Sans Khmer as the fallback.
- Owner said "go ahead with your recommendation": steps 1 + 2 with the defaults below were built, except the
  login-on-several-devices change (backend security rule — needs the owner's explicit OK).

## Open questions (defaults used where the owner said "go ahead")
1. Which phones do the officers use (Android / iPhone / both)? Decides the install help.
2. Should one account stay signed in on phone + computer at the same time? (Today the last sign-in wins.)
3. Do officers need to work **offline on fight night** (weigh-in, results saved later)? Or is "needs internet" fine?
4. App name and icon: "KKF Admin" with the emblem OK?
5. Start with steps 1 + 2 together?

## Acceptance criteria
- [ ] Android Chrome offers Install; iPhone Safari "Add to Home Screen" works with our icon and name.
- [ ] Opens full screen at /home; offline shows the friendly screen; a new deploy shows the Update bar.
- [ ] Bottom navigation and 48 px targets on phones; no page scrolls sideways.
- [ ] Lighthouse PWA checks pass; fonts self-hosted; nothing from the API is cached.

## Tests
Browser checks on the test API (installability, offline, update flow) + real-phone checks; `claude/tests` note.
