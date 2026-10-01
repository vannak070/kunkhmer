#!/bin/sh
# Clean copy of this computer's data for the pilot server (owner decisions 2026-10-01,
# claude/updates/pilot-clean-data-move.md). Like export-local.sh, but first removes the demo and test records
# listed in deploy/pilot-cleanup.sql. Your dev database is NOT changed: the clean-up runs on a temporary copy
# (database kunkhmer_pilot_tmp in the same Postgres container), which is dropped at the end.
# Run from the repo root with the dev stack running:
#   sh deploy/export-clean.sh
# Writes deploy/transfer/db_clean_<date>.dump and uploads_clean_<date>.tar.gz (only the pictures and PDFs the
# clean data still uses). Then follow "Moving your data to the server" in deploy/README.md.
set -eu
cd "$(dirname "$0")/.."
mkdir -p deploy/transfer
stamp=$(date +%Y-%m-%d_%H%M)
tmp=kunkhmer_pilot_tmp
pg="docker exec -i kunkhmer_postgres"

cleanup() { $pg dropdb -U kunkhmer --if-exists "$tmp" >/dev/null 2>&1 || true; }
trap cleanup EXIT

# 1. Copy the dev database into a temporary one.
cleanup
$pg createdb -U kunkhmer "$tmp"
docker exec kunkhmer_postgres sh -c "pg_dump -U kunkhmer -d kunkhmer_db -Fc | pg_restore -U kunkhmer -d $tmp --no-owner"

# 2. Remove the demo and test records (stops if any count is not what was agreed).
$pg psql -U kunkhmer -d "$tmp" -q < deploy/pilot-cleanup.sql

# 3. Dump the clean copy, without login sessions and Hub test logs (same as export-local.sh).
$pg pg_dump -U kunkhmer -d "$tmp" -Fc \
  --exclude-table-data=personal_access_tokens --exclude-table-data=fan_sessions \
  --exclude-table-data=hub_logs --exclude-table-data=hub_rate_limits \
  > "deploy/transfer/db_clean_$stamp.dump"

# 4. Only the uploaded files the clean data still links to (/api/files/<name>).
list="deploy/transfer/files_clean_$stamp.txt"
$pg pg_dump -U kunkhmer -d "$tmp" --data-only \
  --exclude-table-data=hub_logs --exclude-table-data=personal_access_tokens --exclude-table-data=fan_sessions 2>/dev/null \
  | grep -oE '/api/files/[A-Za-z0-9._-]+(/[A-Za-z0-9._-]+)?' | sed 's#^/api/files/##' | sort -u > "$list.all"
: > "$list"
while read -r f; do
  if [ -f "backend/storage/uploads/$f" ]; then echo "$f" >> "$list"; else echo "note: linked file not found, skipped: $f"; fi
done < "$list.all"
rm -f "$list.all"
COPYFILE_DISABLE=1 tar -czf "deploy/transfer/uploads_clean_$stamp.tar.gz" -C backend/storage/uploads -T "$list"

echo "Clean copy ready ($(wc -l < "$list" | tr -d ' ') files):"
ls -lh "deploy/transfer/db_clean_$stamp.dump" "deploy/transfer/uploads_clean_$stamp.tar.gz"
rm -f "$list"
