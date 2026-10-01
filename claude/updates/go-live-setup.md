# Update: Go-live setup — production bundle for one server

| | |
|---|---|
| **Status** | Done — committed b6270c3d / b6dd0f91 / ecd694e1 (2026-09-29, pushed); re-tested locally with b56e744d on 2026-09-30; hosting (VPS + domain) not chosen yet |
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
- `export-local.sh` (on the owner's computer): dev database without login sessions (staff + fans) and
  Hub logs / rate counters, plus the pictures → `deploy/transfer/` (git-ignored, not in the image).
- `restore.sh` (on the server): asks for `yes`, stops backend + web, `pg_restore --clean --single-transaction`,
  adds pictures to the volume (app user), always starts the site again. Used for backups and the data copy.
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
- [x] One-time copy of the local data (`export-local.sh` → `restore.sh`) tested into a fresh production stack.
- [ ] Real deployment on the owner's server (needs a VPS + domain).

## Log
### 2026-09-29
- Local production test as above; found and fixed: first backup ran before the app created its tables
  (empty dump) → 10-minute first delay + `backup.sh now`; knowledge seed command for the production image
  (`node dist/scripts/seed-knowledge.js`); picture restore made one command. Test stack, volumes and images
  removed afterwards; dev environment untouched.
- Data copy: exported the dev data (154 KB database, 4.5 MB / 21 pictures) and restored it into a fresh test
  production stack: all rows present (1 user, 2 clubs, 5 fighters with 4 visible, 1 event, 67 articles, 3
  international partners, 14 migrations), sessions and Hub logs empty, pictures served with the right owner,
  admin login works; "no" cancels without stopping anything. Test stack, files and images removed.
### 2026-09-30 — re-test with the latest code (b56e744d)
- Same local production test after club logos, Hub D3 and the About the Federation page (ports 8480/8943,
  because 8080/8443 were taken on the owner's Mac; set `HTTP_PORT`/`HTTPS_PORT` in `.env` the same way on a
  server that already uses 80/443). Fresh database: all 18 migrations applied; `/`, `/federation`, `/hub`,
  `/about`, deep links and the admin (`/home/federation`) load through Caddy; robots still "Disallow" (pre-launch).
- Federation page in production: admin login, draft with a leader photo + PDF, publish → PDF served as
  `application/pdf` with year-long caching, photo as `image/png`, both on the uploads volume (app user);
  `/federation` added to the sitemap.
- Data copy with today's dev data (`export-local.sh` 159 KB + 4.5 MB pictures → `restore.sh`): 18 migrations,
  5 fighters, 2 clubs, 67 published articles, the (empty) federation row; sessions and Hub logs empty; a dev
  picture served through Caddy. Stack, volumes, images, `.env` and transfer files removed afterwards.
- Still open: the owner's VPS + domain (see `deploy/README.md`).
### 2026-10-01 — pilot release 1 prepared (`deploy/PILOT-RELEASE.md`)
- Backend type check clean; contract suite 275/275.
- Dress rehearsal with the production bundle on the owner's Mac (ports 8480/8943): fresh start applied all 21
  migrations; the clean pilot copy (`export-clean.sh`, `updates/pilot-clean-data-move.md`) restored with
  `restore.sh`; fan site, `/federation`, admin + deep links through HTTPS; 27 fighters, 5 clubs, 1 event,
  2 news, 3 videos, 2 sponsors, 3 international partners from the API; picture served; admin login; robots
  still "Disallow"; manual backup 168 KB + 6 MB. Stack, volumes, images, `.env` and backups removed.
- Release tag proposed: `v1.0.0-pilot.1` on `main` (fast-forward from `dev`); the owner commits, merges and tags.
- Owner decisions the same day: the pilot server starts **empty** (no dev data) and is reached by its IP until a
  domain is chosen; access method (free sslip.io name with real HTTPS suggested) decided once the IP is known.
- Empty-start rehearsal (production bundle, ports 8480/8943): 21 migrations, admin from SEED_ADMIN_PASSWORD
  (admin123 refused), all content 0, settings lists 14/7/2/8, fan site + admin pages 200 over HTTPS, robots
  Disallow. Torn down afterwards.
### 2026-10-01 — pilot server live
- Server: DigitalOcean droplet "KUNKHMER-Digital" (SGP1, 1 GB RAM + existing 2 GB swap, 25 GB disk), IP
  104.248.149.103, Ubuntu 24.04, Docker 29. It ran the owner's LiveStock Fattening ERP: backed up first
  (database dump restore-tested, full project, nginx/certificates/site files; on the owner's Mac in
  `~/Backups/LiveStock-server-2026-10-01/`, also `/root/server-backup-2026-10-01` on the server), then pm2,
  nginx and the server's own PostgreSQL 16 stopped and disabled — files and database kept on disk.
- Addresses (owner choice, no domain yet): `https://104-248-149-103.sslip.io` (fan site) and
  `https://admin.104-248-149-103.sslip.io` (admin); Let's Encrypt certificates issued on first start.
- Code: `/root/kunkhmer` cloned at `c53c43d3` (`main` / tag `v1.0.0-pilot.1` not pushed yet). `deploy/.env`
  written on the server (fresh secrets, `SITE_INDEXING=false`, `ANTHROPIC_API_KEY` empty, chmod 600); the first
  admin password is on the owner's Mac only. First image build failed on an npm network reset; rebuilt one image
  at a time.
- Empty start (owner decision): 21 migrations, admin seeded from `SEED_ADMIN_PASSWORD`, settings lists 14/7/2/8,
  everything else empty. Checked from outside: fan site, `/fighters`, `/federation`, admin (login page, deep
  link), API, valid certificates, HTTP → HTTPS, HSTS, robots "Disallow". First backup by hand (76 KB) copied to
  the owner's Mac (`~/Backups/kunkhmer-pilot-server/`). Memory: stack ≈ 230 MB, 370 MB available.
- Known: the bare IP `http://104.248.149.103` now redirects to `https://104.248.149.103`, which has no
  certificate — testers must use the sslip.io addresses.


## 2026-10-01 — temporary domain
Owner pointed `kkf.yarvorax.com` and `admin.kkf.yarvorax.com` (A records) at 104.248.149.103. On the server `deploy/.env` now has `SITE_DOMAIN=kkf.yarvorax.com`, `ADMIN_DOMAIN=admin.kkf.yarvorax.com` (old file kept as `.env.bak-sslip`, chmod 600); `docker compose -f docker-compose.prod.yml up -d` recreated backend + web; Caddy got new Let's Encrypt certificates. The sslip.io names were dropped on purpose. No data moved.
