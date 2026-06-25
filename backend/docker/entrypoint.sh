#!/bin/sh
set -e

echo "Waiting for PostgreSQL..."
until php -r "
  try {
    new PDO(
      'pgsql:host=${DB_HOST};port=${DB_PORT};dbname=${DB_DATABASE}',
      '${DB_USERNAME}',
      '${DB_PASSWORD}'
    );
    exit(0);
  } catch (Exception \$e) {
    exit(1);
  }
"; do
  sleep 2
done
echo "PostgreSQL is ready."

if [ ! -f vendor/autoload.php ]; then
  echo "Installing PHP dependencies..."
  composer install --no-interaction --prefer-dist
fi

if [ ! -f .env ]; then
  echo "Creating .env from .env.example..."
  cp .env.example .env
fi

if ! grep -q '^APP_KEY=base64:' .env 2>/dev/null; then
  echo "Generating application key..."
  php artisan key:generate --force --no-interaction
fi

php artisan migrate --force --no-interaction

USER_COUNT=$(php artisan tinker --execute="echo Illuminate\\Support\\Facades\\DB::table('users')->count();" 2>/dev/null | tail -n 1)
if [ "$USER_COUNT" = "0" ]; then
  echo "Seeding database..."
  php artisan db:seed --force --no-interaction
fi

echo "Starting Laravel on port 3001..."
# Use php -S directly: `artisan serve` does not pass DB_* env vars to the server worker,
# so Docker compose DB settings would be ignored in favor of .env (127.0.0.1).
exec php -S 0.0.0.0:3001 -t public public/index.php
