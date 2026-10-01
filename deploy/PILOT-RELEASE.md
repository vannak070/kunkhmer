# Kun Khmer — Pilot release 1

| | |
|---|---|
| **Release** | `v1.0.0-pilot.1` (pilot with real data, closed group) — **starts empty: no data from the dev computer** (owner decision 2026-10-01) |
| **Prepared** | 2026-10-01, from `dev` at `d926b7e7` plus this guide (see "Git" below) |
| **Server** | **Live since 2026-10-01** on DigitalOcean 104.248.149.103: fan site `https://kkf.yarvorax.com`, admin `https://admin.kkf.yarvorax.com` (moved from the sslip.io names on 2026-10-01; those no longer work) (running commit `c53c43d3`; see `claude/updates/go-live-setup.md`) |

## What is in this release

- **Fan website**: fighters, clubs, fight nights and results, champions, news, videos, partners, About the
  Federation page, fan accounts (follow fighters), English + Khmer (Kantumruy Pro). KUNKHMER HUB is built but
  stays **off** for the pilot.
- **Staff admin**: officer-run Program (fight night → card → bouts → officials → publish → weigh-in →
  results), fighters and clubs, private fighter records, officials, news, videos, partners, knowledge base,
  About the Federation editor, users, settings — every screen in English + Khmer.
- **Server bundle** (`deploy/`): HTTPS (Caddy), fan site + `admin.` site, database, daily backups, restore,
  and the clean data copy for the pilot.

## The package

| Part | Where | Notes |
|---|---|---|
| Code | git tag `v1.0.0-pilot.1` on `main` | The server runs `git clone` + `git checkout v1.0.0-pilot.1` |
| Settings | `deploy/.env` on the server | Copy from `.env.example` and fill in (below). Never commit it |
| Data | none | Nothing is copied from the dev computer. Don't run `export-local.sh` / `export-clean.sh` / `restore.sh` for this pilot |

### What an empty server starts with

- One Super Admin account `admin`, with the password you put in `SEED_ADMIN_PASSWORD` (created on the first
  start only).
- The standard settings lists that come with the software (not dev data): 14 weight classes, 7 venues,
  2 bout-rule presets, 8 glove brands. Edit them in the admin under System Settings.
- Everything else is empty: fighters, clubs, fight nights, officials, news, videos, partners, the About the
  Federation page and the knowledge base. Staff enter the real data through the admin during the pilot.

## Checks done for this release (2026-10-01)

- Backend type check: clean. API contract suite: **275 / 275 passed**.
- Empty-start dress rehearsal on this Mac with the production bundle (ports 8480 / 8943, test names `localhost`
  / `admin.localhost`), built from scratch: all 21 migrations applied; `admin` created from
  `SEED_ADMIN_PASSWORD` (login works, `admin123` refused, 1 account); fighters, clubs, fight nights, news,
  videos and partners all 0; settings lists 14 weight classes / 7 venues / 2 bout rules / 8 gloves; fan site
  (`/`, `/fighters`, `/federation`) and admin (`/`, `/login`, `/home/program`) answer through HTTPS; robots.txt
  blocks search engines. Not seen in a browser (the test certificate isn't trusted locally) — look at the
  empty pages once the server is up. Test stack, volumes, images and settings removed afterwards.

## Pilot settings (`deploy/.env`)

| Setting | Pilot value |
|---|---|
| `SITE_DOMAIN` / `ADMIN_DOMAIN` | the server's addresses — set once the IP is known (see next section) |
| `ACME_EMAIL` | an email you read (certificate notices) |
| `POSTGRES_PASSWORD` | `openssl rand -hex 24` |
| `AI_RATE_SALT` | `openssl rand -hex 32` |
| `SEED_ADMIN_PASSWORD` | a strong password — this becomes the `admin` password on the empty server |
| `SITE_INDEXING` | `false` — not on Google during the pilot |
| `ANTHROPIC_API_KEY` | **empty** — Hub off until KKF has checked the knowledge articles |

## Reaching the server without a domain

Decided once the owner sends the server IP (`203.0.113.5` below stands for it). Options:

| Option | Fan site / admin | Change needed |
|---|---|---|
| Free IP name, real HTTPS (suggested) | `https://203-0-113-5.sslip.io` / `https://admin.203-0-113-5.sslip.io` | `.env` only: `SITE_DOMAIN=203-0-113-5.sslip.io`, `ADMIN_DOMAIN=admin.203-0-113-5.sslip.io` |
| Bare IP with HTTPS | `https://203.0.113.5` / `https://203.0.113.5:8443` | small web-server change; browsers warn "not secure" once per device |
| Bare IP, plain HTTP | `http://203.0.113.5` / `http://203.0.113.5:8080` | small web-server change; passwords and data unencrypted — not advised with real data |

Moving to a real domain later = change `SITE_DOMAIN` / `ADMIN_DOMAIN` in `.env` and restart; no data move.

## Going live — order of steps

1. Rent the VPS, install Docker, open ports 22, 80 and 443 (`deploy/README.md`, sections 1–2). No DNS needed.
2. `git clone https://github.com/vannak070/kunkhmer.git && cd kunkhmer && git checkout v1.0.0-pilot.1`
3. `cd deploy && cp .env.example .env` and fill it in (tables above), then start
   (`docker compose -f docker-compose.prod.yml up -d --build`, README section 2).
4. Open the admin address, sign in as `admin` with your `SEED_ADMIN_PASSWORD`.
5. Create the staff accounts (Users) and officials (Officials) for the pilot; check System Settings lists.
6. Make a first backup by hand and copy it off the server (README section 5).

## Rules for the pilot (until the open items below are done)

- Don't upload ID cards or medical scans in private fighter records (no privacy page or read log yet).
- Copy `deploy/backups/` off the server at least weekly (backups live only on the server).
- Fans can't reset a forgotten password (the system sends no email); staff passwords are reset by a Super Admin.

## Open items (not blocking a closed pilot)

1. Automatic off-site copy of the daily backups.
2. Privacy page on the fan site; decision on a read-audit log for private fighter records.
3. KKF review of the Khmer wording (review page waiting to be shared) and of the knowledge articles before
   turning the Hub on.
4. A free uptime monitor for the two addresses.
5. Later: share previews with photos, then `SITE_INDEXING=true` for the public launch.

## Git (the owner runs these)

The release files were committed and pushed to `dev` in `c53c43d3` (2026-10-01). Still to do — publish
`main` and tag the release:

```bash
git checkout main && git merge --ff-only dev && git push -u origin main
git tag -a v1.0.0-pilot.1 -m "Pilot release 1" && git push origin v1.0.0-pilot.1
git checkout dev
```

`main` has never been pushed; it fast-forwards to `dev` (no merge conflicts).
