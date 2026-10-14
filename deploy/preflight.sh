#!/bin/sh
# Read-only check of the server before an update (changes nothing). Run on the server:
#   cd kunkhmer/deploy && sh preflight.sh
cd "$(dirname "$0")" || exit 1
DC="docker compose -f docker-compose.prod.yml"
echo "== Checked-out version (the site runs the version that was built last)"
git log -1 --format='%h %ad %s' --date=short 2>/dev/null || echo "not a git checkout"
echo "== Containers"
$DC ps
echo "== Memory (the image builds need about 1.5 GB free incl. swap)"
free -m
echo "== Disk"
df -h / | tail -1
echo "== Settings file"
[ -f .env ] && echo ".env present" || echo "MISSING: deploy/.env"
echo "== Latest backups (also copy them off the server)"
ls -lh backups 2>/dev/null | tail -4
echo "== Data now (what the update must keep)"
$DC exec -T postgres psql -U kunkhmer -d kunkhmer_db -tAc "select 'users '||(select count(*) from users)||', clubs '||(select count(*) from clubs)||', fighters '||(select count(*) from fighters where deleted_at is null)||', events '||(select count(*) from events)||', bouts '||(select count(*) from matches)||', migrations '||(select count(*) from _prisma_migrations where finished_at is not null)"
echo "== API answers"
$DC exec -T backend node -e "fetch('http://localhost:3001/api/events').then(r=>{console.log('API status', r.status);process.exit(r.ok?0:1)}).catch(e=>{console.log('API down', e.message);process.exit(1)})"
