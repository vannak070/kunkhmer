#!/bin/sh
# Load a database dump (and optionally a pictures archive) into the production stack, REPLACING its data.
# Use it for a backup (deploy/backups/) or the one-time copy from your computer (deploy/transfer/).
# Run on the server from the deploy/ folder:
#   sh restore.sh backups/db_2026-10-01_0200.dump backups/uploads_2026-10-01_0200.tar.gz
# The site is offline for the minute this takes. Make a backup first (see deploy/README.md).
set -eu
cd "$(dirname "$0")"
db=${1:?"usage: sh restore.sh <db_….dump> [uploads_….tar.gz]"}
pics=${2:-}
[ -f "$db" ] || { echo "No such file: $db" >&2; exit 1; }
[ -z "$pics" ] || [ -f "$pics" ] || { echo "No such file: $pics" >&2; exit 1; }

printf 'This replaces ALL data on this server with %s. Type yes to continue: ' "$db"
read -r answer
[ "$answer" = "yes" ] || { echo "Cancelled."; exit 1; }

compose="docker compose -f docker-compose.prod.yml"
$compose stop backend web
# Always bring the site back, also when a step fails.
trap '$compose start backend web' EXIT

# One transaction: on any error nothing changes.
$compose exec -T postgres pg_restore -U kunkhmer -d kunkhmer_db --clean --if-exists --no-owner \
  --single-transaction < "$db"
echo "Database restored."

if [ -n "$pics" ]; then
  # Files are named by their content, so adding them never overwrites a different picture.
  docker run --rm -v kunkhmer-prod_uploads:/uploads -v "$(cd "$(dirname "$pics")" && pwd):/in:ro" \
    postgres:15-alpine sh -c "tar -xzf '/in/$(basename "$pics")' -C /uploads && chown -R 1000:1000 /uploads"
  echo "Pictures restored."
fi
