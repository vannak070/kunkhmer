# Update: Fan website as an installable app (PWA)

| | |
|---|---|
| **Status** | Done 2026-10-15 (uncommitted, not live) |
| **Jira** | n/a |
| **Feature** | claude/features/public-site.md |
| **Requested by** | Owner: "is customer website apply with PWA yet?" → "Go ahead" (points 1 + 2: install + light service worker; no install button) |

## Current behavior
Only the admin was an app (`updates/admin-pwa-performance.md`). The fan site had an iPhone icon only; `/manifest.webmanifest`
and `/sw.js` returned the home page, so Android / Chrome offered no "Install app".

## Requested change
1. **Installable:** `frontend/public/public/manifest.webmanifest` (name "Kun Khmer — Official Platform", short name
   "Kun Khmer", opens full screen, brand blue `#0a3d91`, white background, shortcuts Matches / Fighters / News), icons in
   `public/icons/` (the KKF logo, same files as the admin: 192, 512, maskable 512), manifest link + iPhone app tags in
   `index.html`.
2. **Light service worker:** `frontend/public/pwa/sw.template.js` → `dist/sw.js` (plugin `sitePwa` in `vite.config.ts`).
   - Pages: **network first** (fans get a new deploy at once); the stored page is used only without internet.
   - Install keeps only the page + the files `index.html` loads (8 files) — nothing big on mobile data; other built
     files and icons are kept when first used (hashed names never change).
   - **Never stores data**: everything under `/api/` (results, fighters, news, pictures, fan sign-in) goes to the network.
   - A new version takes over by itself (`skipWaiting`) and deletes the old copy; no "Update" button needed because
     pages are network first.
   - Registered by `src/app/pwa/registerSw.ts` from `main.tsx`: production only, after load when idle, not on data-saver / 2G.
3. Caddy (`deploy/Caddyfile`, fan site block): manifest served as `application/manifest+json`; `sw.js` is already
   `no-cache` (every non-`/assets/` path). The Caddyfile is built into the web image.

## Scope
Out of scope: an "Install app" button / banner, push notifications, offline reading of results or news, Brotli for the fan site.

## Impact
- No API change, no migration. Web image only (fan site + Caddyfile). Admin unchanged.

## Acceptance criteria
- [x] Chrome installability check: no manifest errors, no installability errors.
- [x] Worker active after the first visit; keeps the 8 shell files; `/api/` never cached.
- [x] Offline reload still opens the site (header and menu; screens show their own load errors).
- [x] A new `sw.js` version replaces the old cache.
- [ ] Real phone: Android "Install app" and iPhone Share → Add to Home Screen (after deploy).

## Log
- 2026-10-15: built. Public typecheck + build OK. The desktop app's browser pane won't register service workers on
  localhost (it does on HTTPS — the live admin's worker registers there), so the worker was tested with headless
  Chromium (Playwright from another local project) against the built site: results above. Not deployed.
