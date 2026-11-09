# Update: Off-site, encrypted backups

| | |
|---|---|
| **Status** | Done 2026-11-09 in the repo (uncommitted); **not running on the server** until KKF sets it up |
| **Jira** | n/a |
| **Feature** | `deploy/` (README section 5), pilot readiness |
| **Requested by** | Owner ("start 2 and 6", recommendations accepted: Cloudflare R2 / Backblaze B2, own password) |

## Current behavior
`backup` service: daily database dump + pictures archive in `deploy/backups/` on the same server, 14 days. Lost
with the server.

## Requested change
New optional service `offsite` (`rclone/rclone:1.68.2`, compose profile `offsite`, `deploy/offsite.sh`): every 6 h
copies new `db_*.dump` / `uploads_*.tar.gz` (last 72 h) to an S3-compatible bucket through an rclone **crypt**
remote (password from `deploy/.env`, obscured), deletes copies older than `OFFSITE_KEEP_DAYS` (30), writes
`backups/.offsite-status`; `preflight.sh` prints it. `now` / `list` modes. Setup + restore steps in
`deploy/README.md` section 5. File names stay readable (dates only); contents are encrypted.

## Impact
- `deploy/docker-compose.prod.yml` (new service, off unless `COMPOSE_PROFILES=offsite`), `deploy/offsite.sh`,
  `deploy/preflight.sh`, `deploy/README.md`. No app change.
- Server: nothing changes on deploy until `.env` has the bucket settings and `COMPOSE_PROFILES=offsite`.

## Log
- 2026-11-09: built and tested locally with a folder as the bucket: copy + status line, contents unreadable without
  the password, decrypt round-trip, wrong password refused, 30-day clean-up, non-backup files ignored, failure
  writes `FAILED` to the status. Compose: the service appears only with the profile. Not yet tested against a real
  R2/B2 bucket (needs KKF's account) — first run `offsite.sh now` after setup confirms it.
