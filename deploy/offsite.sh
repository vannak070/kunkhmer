#!/bin/sh
# Off-site copies of the daily backups (claude/updates/offsite-backups.md, deploy/README.md section 5).
# Runs in the `offsite` service (rclone image) when COMPOSE_PROFILES=offsite is set in deploy/.env.
#   Service mode (default): every 6 h copies new db_*.dump / uploads_*.tar.gz from deploy/backups/ to the
#   encrypted remote `vault:` (an rclone "crypt" over your storage bucket) and deletes copies older than
#   OFFSITE_KEEP_DAYS (default 30). The result is written to backups/.offsite-status (read by preflight.sh).
#   One-off:  docker compose -f docker-compose.prod.yml exec offsite sh /offsite.sh now
#   List:     docker compose -f docker-compose.prod.yml exec offsite sh /offsite.sh list
set -u
STATUS=/backups/.offsite-status

sync_once() {
  if rclone copy /backups vault: --include 'db_*.dump' --include 'uploads_*.tar.gz' --max-age 72h --no-traverse \
     && rclone delete vault: --min-age "${OFFSITE_KEEP_DAYS:-30}d"; then
    newest=$(rclone lsf vault: --include 'db_*.dump' 2>/dev/null | sort | tail -1)
    echo "ok $(date -u '+%Y-%m-%d %H:%M') UTC newest=${newest:-none}" > "$STATUS"
    echo "$(date) off-site copy ok (newest ${newest:-none})"
  else
    echo "FAILED $(date -u '+%Y-%m-%d %H:%M') UTC" > "$STATUS"
    echo "$(date) OFF-SITE COPY FAILED" >&2
    return 1
  fi
}

case "${1:-}" in
  now) sync_once; exit $? ;;
  list) rclone lsl vault: | sort -k2,3; exit $? ;;
esac

# Start after the first daily backup (backup.sh waits 10 minutes), then every 6 hours (copies are skipped when present).
sleep "${FIRST_DELAY:-1200}"
while true; do
  sync_once
  sleep 21600
done
