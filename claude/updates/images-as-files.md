# Update: Step 2 — store images as files, not base64 text in the database

| | |
|---|---|
| **Status** | Done — committed b1ebc132 (2026-09-28) |
| **Jira** | n/a |
| **Feature** | claude/features/public-site.md (detail-pages plan step 2); affects every module with pictures |
| **Requested by** | vannak070 (2026-09-28) |

## Current behavior
The admin sends pictures as `data:image/...;base64,...` strings and the API stores them as text in
the row (fighters.image, clubs.image, events.image, news_articles.featured_image, videos.thumbnail,
sponsors.logo_url / image, broadcast_stations.logo_url / image, partner_organizations.logo_url / image —
~7 MB on dev). Every list response carries all of it, repeated in nested rows (events embed their
sponsors / station): /api/settings/sponsors 4.1 MB, /api/events 2.8 MB, /api/matches 1.4 MB; a fan
page downloads ~10 MB of JSON, and pictures can't be cached or used as share images.

## Change
- **Transparent storage**: a request hook (POST/PUT/PATCH) replaces any body value that is exactly a
  base64 image data URI with a stored file and the link `/api/files/<sha256>.<ext>`. The admin keeps
  sending what it sends today — no admin change, no response-shape change (the field is still a string).
  Text that merely contains images (news HTML) is left alone.
- **Files** live in `UPLOAD_DIR` (default `backend/storage/uploads`, git-ignored; the test API uses a
  separate folder). Names are content hashes, so the same picture is stored once and can be cached
  forever. Allowed: png, jpeg, webp, gif, avif, svg (svg served with a locked-down CSP). Max 10 MB each.
- **`GET /api/files/:name`** (public): the picture with `Cache-Control: public, max-age=31536000,
  immutable`, `X-Content-Type-Options: nosniff`; 404 for unknown / malformed names.
- **Existing data**: `src/scripts/images-to-files.ts` converts every text column holding a base64 image;
  runs on every start from `prepare-db.ts` (idempotent — only rows still starting with `data:image/`), so
  the live server converts itself on deploy. Dev DB backed up before the first run.
- Share previews: pictures now have real URLs, so `og:image` can use them (data URIs were ignored).

## Impact
- API: no shape change; image fields hold `/api/files/...` links instead of data URIs. Both frontends
  already proxy `/api`. Hosting: `UPLOAD_DIR` must be a persistent volume (or later object storage).
- Database: no migration (same columns, shorter values).

## Acceptance criteria
- [x] Posting a data-URI image stores a file and returns `/api/files/...`; the file is served with the right
      type and caching; bad names 404 (contract tests); full suite `CI=true`; typecheck.
- [x] Dev DB converted (backup first); list payload sizes drop; pictures still show on the fan site and in the admin.
- [ ] Admin: uploading a new picture through the admin form — same request the contract tests send, but not
      clicked through in the admin (it would change dev data); owner to try once.

## Log
### 2026-09-28
- `lib/files.ts` (store / replace data URIs, types, 10 MB limit), `modules/files/routes.ts`
  (`GET /api/files/:name`, immutable caching, nosniff, locked-down CSP for SVG), hook in `app.ts`
  preHandler (POST/PUT/PATCH), `config.uploadDir` (`UPLOAD_DIR`, default `backend/storage/uploads`,
  `storage/` git-ignored), `scripts/images-to-files.ts` + call from `prepare-db.ts`. Test API:
  `UPLOAD_DIR=/tmp/kunkhmer-test-uploads` in `docker-compose.yml`.
- Contract tests `api-tests/tests/files.test.ts` (5): stored + served bytes/type/caching, same picture →
  same link, GIF, normal links untouched, BMP → 422, sponsor logo via settings, 404 for unknown /
  `..` / malformed names. Suite 237/237 `CI=true`; typecheck clean; tests wrote nothing to the dev folder.
- Dev DB: backup `pg_dump -Fc` (5.4 MB, 28 tables) → `backend/storage/backups/kunkhmer_db_before_images.dump`
  (restore: `pg_restore --clean -d kunkhmer_db`); backend restart converted 22 picture values → 21 files
  (4.6 MB) in `backend/storage/uploads`.
- API sizes before → after: sponsors 4,108,697 → 1,086 B; events 2,761,824 → 3,500; matches 1,428,325 →
  5,373; fighters 617,327 → 3,055; clubs 453,581 → 1,549; news 467,967 → 4,903; broadcasters
  429,769 → 565; partner organisations 195,874 → 3,588; videos 109,316 → 1,148. Fan home page API data
  ≈ 39 KB (was ≈ 10 MB); pictures now load separately and are cached.
- Checked: fan home 22/22 pictures load, fighter page (share image = the fighter photo URL), partners;
  admin fighters 5/5, sponsors 3/3, news 1/1; files reachable through both frontend proxies.
- Follow-ups (not in this step): resize / compress uploads (many are 100–800 KB originals); object
  storage (S3 / R2) instead of a disk folder when the hosting is chosen.
