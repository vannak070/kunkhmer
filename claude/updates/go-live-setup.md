# Update: Go-live setup — production bundle for one server

| | |
|---|---|
| **Status** | Done (not committed) — waiting for owner review; hosting not chosen yet |
| **Jira** | n/a |
| **Feature** | claude/features/public-site.md (go-live checklist) |
| **Requested by** | vannak070 (2026-09-29, "go ahead" with the go-live setup) |

## Current behavior
Only development containers exist (Vite dev servers for both frontends); the backend has a production
image target but nothing runs the built sites, handles HTTPS, routes `/api` / `/sitemap.xml`, or backs up.

## Change (`deploy/`, see `deploy/README.md`)
- `docker-compose.prod.yml` (project `kunkhmer-prod`): `postgres` (volume, not exposed), `backend`
  (production image, `UPLOAD_DIR=/data/uploads` on a volume, `PUBLIC_SITE_URL`), `web` (Caddy: both built
  sites, automatic HTTPS, ports 80/443), `backup` (daily `pg_dump -Fc` + pictures tar, 14 days).
- `web.Dockerfile`: builds the fan site (with `SITE_URL`, `SITE_INDEXING`) and the admin, serves them from Caddy.
- `Caddyfile`: `SITE_DOMAIN` → fan site + `/api` + `/sitemap.xml`; `ADMIN_DOMAIN` → admin + `/api` (noindex
  header); single-page fallback; year-long cache for hashed assets, no-cache for pages; HSTS, nosniff, gzip/zstd.
- `backup.sh`: first backup 10 min after start, then every 24 h; `sh /backup.sh now` for a one-off.
- `.env.example` (all settings explained), `deploy/.gitignore` (`.env`, `backups/`), root `.dockerignore`,
  `backend/.dockerignore` now excludes `storage/` (pictures / DB backups never enter an image).
- `backend/Dockerfile` production stage: `/data/uploads` owned by the app user.
- `deploy/README.md`: server size, DNS, install, first steps (change admin password first), update,
  backup / restore, useful commands.

## Acceptance criteria
- [x] Whole bundle built and started locally with test domains (`localhost`, `admin.localhost`, ports 8080/8443).
- [x] Fan site, deep links, admin, API, robots (pre-launch), sitemap with the site's domain, caching and security
      headers through Caddy.
- [x] Admin login, picture upload stored on the volume (app user), served via the fan site, survives a backend restart;
      backend sees the visitor's IP (not Caddy's).
- [x] Backup + test restore (28 tables; users, clubs, 14 migrations back); pictures archive contains the upload.
- [ ] Real deployment on the owner's server (needs a VPS + domain).

## Log
### 2026-09-29
- Local production test as above; found and fixed: first backup ran before the app created its tables
  (empty dump) → 10-minute first delay + `backup.sh now`; knowledge seed command for the production image
  (`node dist/scripts/seed-knowledge.js`); picture restore made one command. Test stack, volumes and images
  removed afterwards; dev environment untouched.
