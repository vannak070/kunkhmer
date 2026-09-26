# Kun Khmer Monorepo

```
kunkhmer/
├── backend/              Node.js API (Fastify + Prisma + PostgreSQL)
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

**Login (admin):** `admin` / `admin123` (created on first start when the database is empty — change it)

## Local development (without Docker)

**Backend** (requires Node.js 22+ and PostgreSQL; `docker compose up -d postgres` works):

```bash
cd backend
npm install
cp .env.example .env   # set DATABASE_URL
npm run db:prepare     # migrations + default admin
npm run dev            # http://localhost:3001
```

See [backend/README.md](backend/README.md) for details.

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

- Default admin — created automatically on start when the database has no users
- Demo data (clubs, fighters, users for every role, events, matches, titles):
  `docker exec kunkhmer_backend npm run db:seed:demo -- --reset` (wipes all data first)

## API tests

```bash
docker compose --profile test up -d backend-test
npm run test:api
```

See [api-tests/README.md](api-tests/README.md).

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

### Backend

Build the production image with `docker build ./backend`. It needs
`DATABASE_URL` (and optionally `PORT`, default 3001; `SEED_ADMIN_PASSWORD`
for the first start) and applies database migrations on start. Serve it
behind the same host as the frontends so `/api` (or `/kunkhmer/api` for the
demo build) reaches it.

No frontend code changes are needed between environments — rebuild with
`build:prod` instead of `build:demo`.
