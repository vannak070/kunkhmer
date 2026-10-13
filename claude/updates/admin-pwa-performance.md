# Update: Admin as an installable app, loading speed, self-hosted fonts

| | |
|---|---|
| **Status** | Done in the working tree (2026-10-13), not committed, not deployed |
| **Jira** | n/a |
| **Feature** | claude/features/admin-pwa.md |
| **Requested by** | vannak070 (2026-10-13: "go ahead with your recommendation but optimize for best performance loading") |

## Current behavior (measured before, `vite build` of the admin)
- `favicon.png` 2,795 KB; all 40 pages in one `index.js` of 1,576 KB (399 KB gzip); logo PNG 989 KB; map PNG 620 KB;
  fonts from Google (extra connection + render-blocking CSS, Inter + Outfit + Moul + Kantumruy, many subsets).
- Not installable, no offline notice, phone bottom bar showed the first 4 menu items at 10 px.

## Change
**Speed**
- Every page loads on demand (`routes.tsx` `page()` helper, 38 pages); the shell, login, not-found and tiny redirects
  stay in the first file; `PageSpinner` while the first screen loads; React + router in their own long-lived chunk.
  Poster (`html2canvas`, 266 KB) and club map (`leaflet`, 172 KB) load only on their pages.
- Pictures: favicon 2,795 KB → 8 KB; logo 989 KB → 13 KB (menu / login) and 54 KB (poster); map 620 KB → 62 KB
  (webp). New icons `public/icons/*` (quantised PNG, 12–72 KB).
- Fonts self-hosted in `src/assets/fonts` with `unicode-range`: Outfit Latin 32 KB, Kantumruy Pro Khmer 57 KB
  (one variable file = every weight), Moul 25 KB (poster only, fetched only when used). Inter dropped (it was only a
  fallback). Stack: Outfit → Kantumruy Pro → Noto Sans Khmer → system. `font-display: swap`. The build preloads
  Outfit; a browser set to Khmer preloads the Khmer font from an inline script (`__KHMER_FONT__` filled at build).
- Build plugin `kkfPwa` (`vite.config.ts`): service worker with the file list + version, font preload, and a Brotli
  copy of text files. Caddy serves `.br` (`file_server { precompressed br }`, admin block only), `sw.js` and pages
  stay `no-cache`, manifest type `application/manifest+json`.
- Result: first English screen ≈ 74 KB page code + 66 KB React + 18 KB styles (Brotli) + 31 KB fonts ≈ 190 KB
  (was > 4 MB incl. favicon and logo). Main script Brotli 76 KB vs gzip 97 KB on the real Caddy.

**App (PWA step 1)**
- `public/manifest.webmanifest` ("KKF Admin", standalone, start `home`, theme #0A3D91, icons, 3 shortcuts), iOS tags,
  `viewport-fit=cover`, new `index.html` with a small boot spinner.
- `pwa/sw.template.js` → `dist/sw.js`: keeps the app (all built files, ~100) on the device; **never** touches
  `/api/` or non-GET or other sites (no data stored offline); screens open from the device (works offline);
  a new version waits until "Update now"; a new version copies unchanged hashed files from the old one.
  Registered after the page has loaded and the phone is idle, not on data-saver / 2G.
- `src/app/pwa/pwa.ts` (state), `components/pwa/PwaBar.tsx` (no-internet notice + Update bar, top of every screen),
  `components/pwa/InstallCard.tsx` on the dashboard (Android / Chrome: "Install app"; iPhone / iPad: 3 steps with the
  Share button; hidden once installed or for 30 days after "Not now"). Texts EN + KM (`pwa.*` in `i18n/program.ts`;
  Khmer wording for KKF to review).

**Phone shell (PWA step 2, part)**
- Bottom bar: Dashboard · Fight nights · Fighters · Clubs · Menu (referees / judges: My bouts · Help · Menu), 12 px
  labels, 24 px icons, active mark, clear of the iPhone home bar (`env(safe-area-inset-bottom)`), page height `h-dvh`.
- Already done earlier by other sessions: Khmer side menu, expired session → login page.

## Not done (decisions / later)
- One account signed in on phone + computer at once: needs a **backend security change** (login revokes earlier
  tokens, see `claude/config.md` Security) — not changed; owner to confirm.
- Offline saving on fight night (needs conflict rules) — not built, by default.
- The 16 old-style pages (step 3) and the fan site's fonts / PWA (still Google fonts) — later.
- Khmer text file stays in the main file (118 KB source): most officers use Khmer, so splitting it would only add a
  delay for them.

## Acceptance criteria
- [x] Admin `tsc` 0 errors; `vite build` passes; no backend change.
- [x] Service worker logic tested in a simulated worker (8 checks: install, failed install, reuse of unchanged
      files, cleanup of old versions, waits for "Update now", API / POST / other sites never intercepted, screens
      open from the device offline, built files cached once).
- [x] Real Caddy (local rehearsal): `sw.js` / pages `no-cache`, assets + fonts `immutable`, Brotli served, gzip
      fallback, manifest type, fan site unchanged.
- [x] Browser (production build, desktop + phone width): bottom bar, install card (iPhone steps), offline notice,
      install button flow (simulated events).
- [ ] Real Android phone + real iPhone: install, offline, update bar (the browser pane can't register service
      workers, so this is the one check still to do on devices).

## Log
### 2026-10-13
- Built and checked as above. Temporary pieces (prod web container + `deploy/.env`, preview server, bridge) removed;
  two build folders remain in the dev container's `/tmp` (a delete was blocked by a safety check; harmless).
- Deploy needs the web image rebuilt (`docker compose -f docker-compose.prod.yml up -d --build`, one image at a
  time), after a backup and the owner's go-ahead; the admin Caddy block changed, so Caddy restarts with the new web image.
