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
#   SEED_ADMIN_PASSWORD: the first password of the "admin" account (at least 8 characters)

# Build and start (first build takes a few minutes)
docker compose -f docker-compose.prod.yml up -d --build
docker compose -f docker-compose.prod.yml ps        # all four services should be "Up"
```

Open `https://kunkhmer.com` and `https://admin.kunkhmer.com`. The first visit may take a minute while
the HTTPS certificates are issued.

## 3. Right after the first start

1. **Sign in as `admin`** with the `SEED_ADMIN_PASSWORD` from `.env` (the server never uses `admin123`).
   Change it under *My profile* if others have seen `.env`.
2. Create the real staff accounts (Users) and remove any you don't need.
3. Add your data: either copy everything from your computer in one go (see
   [Moving your data to the server](#moving-your-data-to-the-server)), or type it in the admin.
4. Knowledge base for KUNKHMER HUB: copied with your data. Only when starting empty:
   `docker compose -f docker-compose.prod.yml exec backend node dist/scripts/seed-knowledge.js`
   loads the 67 starter articles as **Drafts**; publish them in the admin after KKF review.
5. When the site is ready to be found by Google: set `SITE_INDEXING=true` in `.env` and rebuild (step 4).

## 4. Updating to a new version

```bash
cd kunkhmer/deploy
sh preflight.sh                  # read-only check: running version, memory, disk, backups, data
sh update.sh <commit>            # backup, fetch that exact version, build backend then web, start, wait for the API
```

The server runs one exact version (a detached checkout), so `git pull` does not work there; `update.sh` does
`git fetch origin dev && git checkout --detach <commit>`. The manual steps are: backup (`exec backup sh /backup.sh now`),
that checkout, `COMPOSE_PARALLEL_LIMIT=1 docker compose -f docker-compose.prod.yml build backend` and `… build web`,
then `up -d`. A release guide (for example `RELEASE-2026-10-14.md`) lists what each version changes.

Database changes (migrations) are applied automatically when the backend starts.

## 5. Backups

- Every day the `backup` service writes `db_<date>.dump` (database) and `uploads_<date>.tar.gz` (pictures)
  to `deploy/backups/` and keeps `BACKUP_KEEP_DAYS` days (default 14). The first one runs 10 minutes after start.
- Make one by hand at any time: `docker compose -f docker-compose.prod.yml exec backup sh /backup.sh now`
- **Off-site copies** (below) send every backup, encrypted, to cloud storage. A backup on the same server is
  lost if the server is.

### Off-site copies (once, about 15 minutes)

The `offsite` service copies each new backup to an S3-compatible bucket (Cloudflare R2 or Backblaze B2 — both
free up to 10 GB), encrypted with a backup password, every 6 hours, and keeps 30 days there
(`OFFSITE_KEEP_DAYS`). Files are named by date; their content can only be read with the password.

1. **Choose a backup password** (long, e.g. four random words) and keep it somewhere safe outside the server
   (a password manager, or on paper in the KKF office). **Without it the off-site copies can't be opened.**
2. **Create the bucket and a key:**
   - *Cloudflare R2:* dashboard › R2 › Create bucket `kkf-backups` › Manage R2 API tokens › Create token with
     "Object Read & Write" for that bucket. Note the Access Key ID, Secret Access Key and the endpoint
     `https://<account-id>.r2.cloudflarestorage.com`.
   - *Backblaze B2:* Buckets › Create a bucket `kkf-backups` (private) › Application Keys › Add a key for that
     bucket. Note the keyID, applicationKey and the bucket's S3 endpoint (e.g. `https://s3.us-west-004.backblazeb2.com`).
3. **On the server**, turn the password into rclone's stored form (it is printed once; nothing is saved):
   ```bash
   docker run --rm rclone/rclone:1.68.2 obscure 'YOUR BACKUP PASSWORD'
   ```
4. **Add to `deploy/.env`** (type the values on the server — never send them by chat or email):
   ```bash
   COMPOSE_PROFILES=offsite
   OFFSITE_PROVIDER=Cloudflare          # Backblaze B2: Other
   OFFSITE_ENDPOINT=https://<account-id>.r2.cloudflarestorage.com
   OFFSITE_REGION=auto                  # Backblaze B2: the region in the endpoint, e.g. us-west-004
   OFFSITE_BUCKET=kkf-backups
   OFFSITE_ACCESS_KEY_ID=...
   OFFSITE_SECRET_ACCESS_KEY=...
   OFFSITE_PASSWORD_OBSCURED=...        # the output of step 3
   ```
5. **Start it and make the first copy:**
   ```bash
   docker compose -f docker-compose.prod.yml up -d offsite
   docker compose -f docker-compose.prod.yml exec offsite sh /offsite.sh now    # → "off-site copy ok"
   docker compose -f docker-compose.prod.yml exec offsite sh /offsite.sh list   # what the bucket holds
   ```
   `sh preflight.sh` shows the last off-site result (`backups/.offsite-status`).

**Restore from an off-site copy** (e.g. on a new server, after setting up `.env` as above):
```bash
docker compose -f docker-compose.prod.yml exec offsite rclone copy vault:db_2026-11-09_0200.dump /backups/
docker compose -f docker-compose.prod.yml exec offsite rclone copy vault:uploads_2026-11-09_0200.tar.gz /backups/
sh restore.sh backups/db_2026-11-09_0200.dump backups/uploads_2026-11-09_0200.tar.gz
```

### Restore

```bash
cd kunkhmer/deploy
sh restore.sh backups/db_2026-10-01_0200.dump backups/uploads_2026-10-01_0200.tar.gz
```

It asks for `yes`, takes the site offline for about a minute, replaces the database in one step (nothing
changes if it fails) and adds the pictures. The pictures file is optional.

### Moving your data to the server

A one-time copy of everything you entered on your computer (clubs, fighters, fight nights, news, partners,
knowledge base, staff accounts and all pictures). Staff and fan login sessions and the KUNKHMER HUB test
logs stay behind. Your staff accounts keep their passwords, so change `admin` / `admin123` right after.

```bash
# On your computer, in the kunkhmer folder, with the local system running (docker compose up -d):
sh deploy/export-local.sh
scp -r deploy/transfer root@SERVER_IP:kunkhmer/deploy/

# On the server, after the first start (step 2):
cd kunkhmer/deploy
sh restore.sh transfer/db_<date>.dump transfer/uploads_<date>.tar.gz
rm -r transfer
```

#### Clean copy for the pilot

For the pilot use `export-clean.sh` instead of `export-local.sh`. It makes the same kind of copy but first
leaves out the demo and test records (the 3 and 10 Oct 2026 demo fight nights with their bouts, the 9 demo
officials, deleted QA/demo fighters, the test fan account and the half-filled private fighter record — see
`pilot-cleanup.sql`), and it packs only the pictures and PDFs the remaining data still uses. Your computer's
database is not changed: the clean-up runs on a temporary copy.

```bash
# On your computer, in the kunkhmer folder, with the local system running:
sh deploy/export-clean.sh
scp -r deploy/transfer root@SERVER_IP:kunkhmer/deploy/

# On the server, after the first start (step 2):
cd kunkhmer/deploy
sh restore.sh transfer/db_clean_<date>.dump transfer/uploads_clean_<date>.tar.gz
rm -r transfer
```

The copy keeps only the `admin` account, with its password from your computer (`admin123`): sign in at once
and change it under My profile. If the script stops with "expected … found …", the data on your computer has
changed since the clean-up was agreed — nothing was exported; update `pilot-cleanup.sql` first.

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
