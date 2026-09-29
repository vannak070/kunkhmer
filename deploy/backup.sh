#!/bin/sh
# Runs in the "backup" service: once at start, then every 24 h. Keeps KEEP_DAYS days of backups in
# deploy/backups/ (copy that folder off the server regularly — a backup on the same disk is not enough).
set -u
while true; do
  stamp=$(date +%Y-%m-%d_%H%M)
  if pg_dump -h postgres -U kunkhmer -d kunkhmer_db -Fc -f "/backups/db_$stamp.dump"; then
    echo "$(date) database backup db_$stamp.dump"
  else
    echo "$(date) DATABASE BACKUP FAILED" >&2
  fi
  tar -czf "/backups/uploads_$stamp.tar.gz" -C /uploads . && echo "$(date) pictures backup uploads_$stamp.tar.gz"
  find /backups -type f \( -name 'db_*.dump' -o -name 'uploads_*.tar.gz' \) -mtime +"${KEEP_DAYS:-14}" -delete
  sleep 86400
done
