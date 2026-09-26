#!/bin/sh
# Prepares the database (migrations, baseline, seed) and starts the API.
set -e

if [ "$NODE_ENV" = "production" ]; then
  node dist/scripts/prepare-db.js
  exec node dist/server.js
fi

# Development: source is bind-mounted, so regenerate the client and watch.
npx prisma generate
npx tsx src/scripts/prepare-db.ts
exec npx tsx watch src/server.ts
