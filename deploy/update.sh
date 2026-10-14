#!/bin/sh
# Update the server to one exact version, with a backup first (see deploy/README.md section 4 and the release guide).
# Run on the server:   cd kunkhmer/deploy && sh update.sh <commit> [<version running now>]
# (the second value only makes the printed rollback line right when you already checked out <commit> to get this script)
# The images are built one at a time (small servers run out of memory otherwise). If the build stops, the old version
# keeps running; only `up -d` replaces it. Database changes apply automatically when the new backend starts.
set -eu
COMMIT="${1:?usage: sh update.sh <commit>}"
cd "$(dirname "$0")"
[ -f .env ] || { echo "deploy/.env is missing"; exit 1; }
DC="docker compose -f docker-compose.prod.yml"
OLD="${2:-$(git rev-parse --short HEAD)}"
echo "Running before: $OLD   Updating to: $COMMIT"
echo "Rollback later:  git checkout --detach $OLD && COMPOSE_PARALLEL_LIMIT=1 $DC up -d --build   (or restore the backup below)"

echo "== 1/5 Backup"
$DC exec -T backup sh /backup.sh now

echo "== 2/5 Fetch the new version"
git fetch origin dev
git checkout --detach "$COMMIT"
echo "Now at: $(git log -1 --format='%h %s')"

echo "== 3/5 Build (backend, then web)"
export COMPOSE_PARALLEL_LIMIT=1
$DC build backend
$DC build web

echo "== 4/5 Start the new version"
$DC up -d

echo "== 5/5 Wait for the API"
for i in $(seq 1 40); do
  if $DC exec -T backend node -e "fetch('http://localhost:3001/api/events').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))" 2>/dev/null; then
    echo "API is up."
    $DC logs backend 2>&1 | grep -E "Applying migration|migration\(s\) have been applied|No pending" | tail -20
    $DC ps
    echo "Done. Check the site and the admin in a browser."
    exit 0
  fi
  sleep 3
done
echo "The API did not answer in 2 minutes. Look at:  $DC logs backend"
exit 1
