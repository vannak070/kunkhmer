# Kun Khmer Monorepo

```
kunkhmer/
├── backend/              Laravel API (PostgreSQL via Docker, SQLite for local)
├── frontend/
│   ├── admin/            KKF management system (staff)
│   └── public/           Fan/user website (scaffold)
├── docker-compose.yml
└── package.json          Root scripts
```

## Quick start (Docker)

```bash
docker compose up --build
```

| Service | URL |
|---------|-----|
| Admin frontend | http://localhost:5175 |
| Public frontend | http://localhost:5176 |
| Backend API | http://localhost:3001/api |

**Login (admin):** `admin` / `admin123` (after `DefaultSeeder` runs)

## Local development (without Docker)

**Backend** (requires PHP 8.4+):

```bash
cd backend
composer install
cp .env.example .env   # if needed
php artisan key:generate
php artisan migrate
php artisan db:seed
php -S 0.0.0.0:3001 -t public public/index.php
```

**Admin frontend:**

```bash
cd frontend/admin
npm install
npm run dev
```

**Public frontend:**

```bash
cd frontend/public
npm install
npm run dev
```

Or from repo root:

```bash
npm run dev:admin
npm run dev:public
```

## Seeders

- `DefaultSeeder` — minimal admin user (runs automatically in Docker when DB is empty)
- `TestSeeder` — full demo data: `php artisan db:seed --class=TestSeeder`

## Docker commands

```bash
docker compose up -d          # start in background
docker compose down           # stop
docker compose down -v        # stop + wipe database
docker exec -it kunkhmer_backend sh
```
