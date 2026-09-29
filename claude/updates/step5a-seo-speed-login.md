# Update: Step 5a — search engines, faster first load, staff login protection, go-live checklist

| | |
|---|---|
| **Status** | Done (not committed) — waiting for owner review |
| **Jira** | n/a |
| **Feature** | claude/features/public-site.md, claude/features/auth-users.md |
| **Requested by** | vannak070 (2026-09-29, "go ahead" with step 5a + login protection) |

## Current behavior
- The fan site ships one ~650 KB JavaScript file with every page in it.
- No `robots.txt` or `sitemap.xml` (both return the web page itself); section pages (Matches, News,
  Fighters, Partners) keep the site-wide description.
- `POST /api/users/login` has no brute-force protection (known gap in `claude/config.md`).
- No written list of what must change before going live.

## Change
- **Code splitting**: every page except the home shell loads on demand (React Router `lazy`), with an
  accessible loading indicator.
- **Sitemap**: `GET /api/sitemap.xml` (public) lists the main sections plus every public fighter, fight night,
  published article, active club, sponsor and broadcaster, with absolute URLs from `PUBLIC_SITE_URL`
  (backend). The fan site serves it at `/sitemap.xml` (dev proxy; hosting must route the same path).
- **robots.txt**: generated from `SITE_URL` at build/dev time; `SITE_INDEXING=true` allows indexing and points to
  the sitemap, otherwise it disallows everything (pre-launch, matching the `noindex` meta, which the same
  switch now controls).
- **Section descriptions**: Matches, News & Media, Fighters and Partners get their own title + description.
- **Staff login protection**: failed logins are counted per IP + username (default 10 per 15 min,
  `LOGIN_RATE_LIMIT`) and per IP (default 50, `LOGIN_IP_RATE_LIMIT`; the test API sets it very high because
  the suite fails logins on purpose); over the limit → 429 "Too many attempts…" with `Retry-After`.
  A successful login clears that username's counter; correct logins never count. In memory (one API instance).
- **Go-live checklist** in `claude/features/public-site.md` (admin password, env vars, persistent uploads,
  indexing switch, routes the host must forward).

## Acceptance criteria
- [x] Contract tests: sitemap is XML with public URLs only (no drafts); login 429 after repeated failures for one
      username while other usernames still work; full suite `CI=true`; typecheck.
- [x] Public build splits into per-page chunks; all pages still load.
- [x] robots.txt reflects the indexing switch.

## Log
### 2026-09-29
- Backend: `lib/loginThrottle.ts` + `/users/login` (429 with `Retry-After`, counter cleared on success);
  `modules/seo/routes.ts` `GET /api/sitemap.xml`; config `LOGIN_RATE_LIMIT`, `LOGIN_IP_RATE_LIMIT`,
  `PUBLIC_SITE_URL`. Contract tests `api-tests/tests/seo-login.test.ts` (4). Suite 242/242 `CI=true`;
  typecheck clean. Dev check: 10× wrong password for a made-up username → 401, 11th → 429 (Retry-After 900);
  admin still signs in. Dev sitemap: 22 URLs (10 sections, 4 fighters, 1 fight night, 2 articles, 2 clubs,
  2 sponsors, 1 broadcaster).
- Fan site: `routes.tsx` pages via React Router `lazy`; `SuperAppHome` loads Matches, News & Media and Partners
  with `React.lazy`; `vite.config.ts` vendor chunks (`react`, `icons`), `robots.txt` plugin, `SITE_INDEXING`
  switch for robots + the `noindex` meta, dev proxy `/sitemap.xml`; section titles + descriptions
  (`meta.*` EN + KM). First load JS 713 KB → 515 KB (190 → ~148 KB gzip), React in its own long-cached file;
  each page 5–22 KB on demand. Browser: home, matches, news, partners, fighter, club, 404 load with the right
  titles; no console errors.
