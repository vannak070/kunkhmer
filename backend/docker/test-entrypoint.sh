#!/bin/sh
# Starts a throwaway API instance for api-tests/ on a freshly reset database.
set -e

echo "Waiting for PostgreSQL..."
until php -r "
  try {
    \$pdo = new PDO('pgsql:host=${DB_HOST};port=${DB_PORT};dbname=postgres', '${DB_USERNAME}', '${DB_PASSWORD}');
    if (!\$pdo->query(\"SELECT 1 FROM pg_database WHERE datname = '${DB_DATABASE}'\")->fetchColumn()) {
      \$pdo->exec('CREATE DATABASE \"${DB_DATABASE}\"');
    }
    exit(0);
  } catch (Exception \$e) {
    exit(1);
  }
"; do
  sleep 2
done

php artisan migrate:fresh --force --no-interaction
php artisan db:seed --class=DefaultSeeder --force --no-interaction

echo "Starting test API on port 3002..."
exec php -S 0.0.0.0:3002 -t public public/index.php
