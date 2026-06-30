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

## Deploy builds (demo vs production)

Frontends support a configurable base path via `VITE_BASE_PATH`. Local dev uses `/` (no env vars needed).

| Environment | Public URL | Admin URL |
|-------------|------------|-----------|
| Local dev | http://localhost:5176/ | http://localhost:5175/ |
| Demo | https://demo.hovasolutions.tech/kunkhmer/ | https://demo.hovasolutions.tech/kunkhmer/admin/ |
| Production | https://yourdomain.com/ | https://admin.yourdomain.com/ (or `/` on its own host) |

### Build commands

From repo root:

```bash
# Demo (subpath under demo.hovasolutions.tech)
npm run build:demo

# Production (app at domain root)
npm run build:prod
```

Or per frontend:

```bash
npm run build:demo --prefix frontend/public   # base: /kunkhmer/
npm run build:demo --prefix frontend/admin     # base: /kunkhmer/admin/
npm run build:prod --prefix frontend/public    # base: /
npm run build:prod --prefix frontend/admin     # base: /
```

Output: `frontend/public/dist/` and `frontend/admin/dist/`.

### Custom base path

```bash
VITE_BASE_PATH=/my-path/ VITE_API_BASE_URL=/my-path/api npm run build --prefix frontend/public
```

### Backend env (demo example)

```env
APP_URL=https://demo.hovasolutions.tech/kunkhmer
FRONTEND_PUBLIC_URL=https://demo.hovasolutions.tech/kunkhmer
FRONTEND_ADMIN_URL=https://demo.hovasolutions.tech/kunkhmer/admin
```

For production, set these to your production domain(s). No frontend code changes needed — rebuild with `build:prod` instead of `build:demo`.
