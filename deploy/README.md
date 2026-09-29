# Deploying Kun Khmer to a server

Everything runs on **one Linux server** (a VPS) with Docker: the fan website, the staff admin, the API,
the database and daily backups. HTTPS certificates are free and automatic.

```
Internet ──► web (Caddy, ports 80/443)
               ├─ kunkhmer.com          → fan website  (+ /api, /sitemap.xml → backend)
               └─ admin.kunkhmer.com    → staff admin  (+ /api → backend)
             backend (API) ──► postgres (database)
             backup (daily database dump + pictures archive → deploy/backups/)
```

## 1. What you need

- A **VPS** with Ubuntu 24.04, at least **2 GB RAM** and 40 GB disk. A Singapore data centre is close to
  Cambodia (e.g. DigitalOcean, Vultr, AWS Lightsail — about US$10–20 a month).
- A **domain name** (e.g. `kunkhmer.com`).
- In the domain's DNS settings, two **A records** pointing at the server's IP address:
  `kunkhmer.com` and `admin.kunkhmer.com` (the names you put in `.env`).

## 2. First install (on the server)

```bash
# Docker
curl -fsSL https://get.docker.com | sh

# The code (github.com/vannak070/kunkhmer)
git clone https://github.com/vannak070/kunkhmer.git
cd kunkhmer/deploy

# Settings: fill in every value (domains, email, passwords — see the comments in the file)
cp .env.example .env
nano .env
#   POSTGRES_PASSWORD and AI_RATE_SALT: generate with   openssl rand -hex 24

# Build and start (first build takes a few minutes)
docker compose -f docker-compose.prod.yml up -d --build
docker compose -f docker-compose.prod.yml ps        # all four services should be "Up"
```

Open `https://kunkhmer.com` and `https://admin.kunkhmer.com`. The first visit may take a minute while
the HTTPS certificates are issued.

## 3. Right after the first start

1. **Change the admin password.** Sign in at the admin with `admin` / `admin123`, then change it under
   *My profile*. Do this before anything else.
2. Create the real staff accounts (Users) and remove any you don't need.
3. Add the data that exists only on your computer today: International Partners (K-1, WKN, Kombat),
   sponsors, broadcasters, clubs, fighters, fight nights, news. (Or move your local database — ask the
   developer for a one-time copy.)
4. Knowledge base for KUNKHMER HUB: `docker compose -f docker-compose.prod.yml exec backend node dist/scripts/seed-knowledge.js`
   loads the 67 starter articles as **Drafts**; publish them in the admin after KKF review.
5. When the site is ready to be found by Google: set `SITE_INDEXING=true` in `.env` and rebuild (step 4).

## 4. Updating to a new version

```bash
cd kunkhmer
git pull
cd deploy
docker compose -f docker-compose.prod.yml exec backup sh /backup.sh now    # backup first
docker compose -f docker-compose.prod.yml up -d --build
```

Database changes (migrations) are applied automatically when the backend starts.

## 5. Backups

- Every day the `backup` service writes `db_<date>.dump` (database) and `uploads_<date>.tar.gz` (pictures)
  to `deploy/backups/` and keeps `BACKUP_KEEP_DAYS` days (default 14). The first one runs 10 minutes after start.
- Make one by hand at any time: `docker compose -f docker-compose.prod.yml exec backup sh /backup.sh now`
- **Copy `deploy/backups/` off the server regularly** (to your computer or cloud storage). A backup on the
  same server is lost if the server is.

### Restore

```bash
cd kunkhmer/deploy
docker compose -f docker-compose.prod.yml stop backend web
# Database (replace the file name):
docker compose -f docker-compose.prod.yml exec -T postgres \
  pg_restore -U kunkhmer -d kunkhmer_db --clean --if-exists < backups/db_2026-10-01_0200.dump
# Pictures (the volume is named kunkhmer-prod_uploads; files belong to the app user, id 1000):
docker run --rm -v kunkhmer-prod_uploads:/uploads -v "$PWD/backups:/backups" alpine \
  sh -c 'tar -xzf /backups/uploads_2026-10-01_0200.tar.gz -C /uploads && chown -R 1000:1000 /uploads'
docker compose -f docker-compose.prod.yml start backend web
```

## 6. Useful commands

```bash
docker compose -f docker-compose.prod.yml logs -f backend    # API log
docker compose -f docker-compose.prod.yml logs -f web        # web server / HTTPS log
docker compose -f docker-compose.prod.yml restart backend
docker compose -f docker-compose.prod.yml down               # stop everything (data is kept)
```

Never run `down -v` on the server — `-v` deletes the database and pictures.

## Notes

- Only ports 80 and 443 are open to the internet; the database and API are reachable only inside Docker.
- `deploy/.env` and `deploy/backups/` are never committed (see `deploy/.gitignore`).
- Share previews with fighter photos / event posters in Facebook and Telegram need one more server-side step
  (planned "step 5b").
