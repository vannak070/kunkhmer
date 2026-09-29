#!/bin/sh
# Backups for deploy/docker-compose.prod.yml (see deploy/README.md).
#   Service mode (default): waits FIRST_DELAY seconds after start (so the app has created its tables),
#   then backs up every 24 h and keeps KEEP_DAYS days in deploy/backups/.
#   One-off: docker compose -f docker-compose.prod.yml exec backup sh /backup.sh now
# Copy deploy/backups/ off the server regularly — a backup on the same disk is not enough.
set -u

backup_once() {
  stamp=$(date +%Y-%m-%d_%H%M)
  if pg_dump -h postgres -U kunkhmer -d kunkhmer_db -Fc -f "/backups/db_$stamp.dump"; then
    echo "$(date) database backup db_$stamp.dump ($(du -h "/backups/db_$stamp.dump" | cut -f1))"
  else
    echo "$(date) DATABASE BACKUP FAILED" >&2
  fi
  tar -czf "/backups/uploads_$stamp.tar.gz" -C /uploads . && echo "$(date) pictures backup uploads_$stamp.tar.gz"
  find /backups -type f \( -name 'db_*.dump' -o -name 'uploads_*.tar.gz' \) -mtime +"${KEEP_DAYS:-14}" -delete
}

if [ "${1:-}" = "now" ]; then
  backup_once
  exit 0
fi

sleep "${FIRST_DELAY:-600}"
while true; do
  backup_once
  sleep 86400
done
