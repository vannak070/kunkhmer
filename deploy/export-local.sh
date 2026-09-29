#!/bin/sh
# One-time copy of the data on this computer (the dev stack from the root docker-compose.yml) for the
# server. Run from the repo root on your computer, with the dev stack running:
#   sh deploy/export-local.sh
# Writes deploy/transfer/db_<date>.dump (database) and uploads_<date>.tar.gz (pictures).
# Left out on purpose (the tables stay, empty): login sessions of staff and fans, and the KUNKHMER HUB
# test logs + rate counters (they would count towards the server's monthly AI budget).
# Then follow "Moving your data to the server" in deploy/README.md.
set -eu
cd "$(dirname "$0")/.."
mkdir -p deploy/transfer
stamp=$(date +%Y-%m-%d_%H%M)

docker exec kunkhmer_postgres pg_dump -U kunkhmer -d kunkhmer_db -Fc \
  --exclude-table-data=personal_access_tokens --exclude-table-data=fan_sessions \
  --exclude-table-data=hub_logs --exclude-table-data=hub_rate_limits \
  > "deploy/transfer/db_$stamp.dump"
COPYFILE_DISABLE=1 tar -czf "deploy/transfer/uploads_$stamp.tar.gz" -C backend/storage/uploads .

echo "Ready to copy to the server:"
ls -lh "deploy/transfer/db_$stamp.dump" "deploy/transfer/uploads_$stamp.tar.gz"
