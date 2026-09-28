# Feature: International partners (partner organisations)

| | |
|---|---|
| **Status** | Built 2026-09-28 (not committed) — waiting for owner review; K-1, WKN, Kombat added to dev data (no logos yet) |
| **Jira** | n/a |
| **Figma** | n/a |
| **Owner** | vannak070 |

## Goal
Show the organisations KKF works with — today K-1, WKN and Kombat — as their own kind of partner:
managed by KKF staff in the admin and shown on the public Partners page, next to sponsors,
broadcast partners and clubs.

## Why a new kind of partner (analysis, 2026-09-28)
- Partners today are **sponsors** (`sponsors`: brands with a tier, linked to events as main / other
  sponsors) and **broadcast stations** (`broadcast_stations`: TV / digital channels linked to events).
  Clubs are a third list on the public page.
- K-1 (Japan), WKN (World Kickboxing Network) and Kombat are not brands paying for exposure nor TV
  channels: they are **promotions / sanctioning bodies** that co-organise fight nights, sanction
  titles and bring international match-ups. Putting them in sponsors would mix them into sponsor
  tiers, the home partner strip and the event "Presented by" sponsor list.
- Titles already have an `organization` column (`champions.organization`, default "KKF") — a free
  text today. Partner organisations could later become the list this field picks from.

## Owner decisions (2026-09-28)
- Name on the site: **International Partners** (tab) / "International partner" (label).
- First version: **directory + admin** only. Linking fight nights and titles comes later.
- Placement: **second tab** on `/strategic-partners` (Official Sponsors · International Partners ·
  Broadcast Partners · Clubs & Gyms) **and the home page partner strip** (after sponsors, before the
  broadcaster).
- Data: **KKF staff add them in the admin** with official logos and text — nothing seeded. Then the
  owner asked me to add the three in dev (2026-09-28), done through the API as `admin`:
  - **K-1** — Promotion, Japan, https://www.k-1.co.jp (checked), order 1; text: runs K-1 World GP,
    Krush and K-1 Amateur (from the official site).
  - **World Kickboxing Network (WKN)** — Sanctioning body, order 2; country and website left empty
    (site could not be opened to confirm).
  - **Kombat Corporation Professional Taekwondo Federation (Kombat)** — Federation, order 3; text from
    the site's own news article (Ganzberg Kombat Grand Prix Kun Khmer & Taekwondo, Phnom Penh,
    27 June 2026); country and website unknown.
  No logos, banners or "partner since" years; Khmer descriptions are a first draft for KKF review.
  Dev data only — production needs the same entries added in its admin.

## Data (migration `20260928000005_partner_organizations`)
`partner_organizations`: id, name, short_name (≤ 50), org_type (default "Promotion"; admin offers
Promotion / Sanctioning body / Federation / Other), country, logo_url, image (banner), description,
description_km, partner_since (year), website_url, active (default true), sort_order (default 0),
created_at, updated_at. No contact fields (the list is public).

## API (`backend/src/modules/settings/routes.ts`, `organizationArray`)
| Method | Path | Who | Notes |
|---|---|---|---|
| GET | `/settings/partner-organizations` | public | all rows, by sort order then name (frontends hide inactive) |
| POST | `/settings/partner-organizations` | STAFF | requires name; camelCase input (`shortName`, `orgType`, `descriptionKm`, `partnerSince`, `websiteUrl`, `logoUrl`, `image`, `active`, `sortOrder`); 201 |
| PUT | `/settings/partner-organizations/:id` | STAFF | only the given fields; `partnerSince: ""` clears it |
| DELETE | `/settings/partner-organizations/:id` | Super Admin | |
`partnerSince` must be a year 1900–2100 and `sortOrder` a whole number, else 422. Snake_case rows
like sponsors.

## Frontend
- Admin: `pages/PartnerOrganizations.tsx` at `/home/strategic-partners/organizations` (list, `/new`,
  `/:orgId/edit`), menu "Strategic Partners → International Partners" (`partners.manage`). Delete
  button only for Super Admin. Upload logo + banner (data URLs, like sponsors).
- Public: `pages/Partners.tsx` tab `?tab=international` — club-style cards (banner or large logo,
  "International partner", type · country, "Partner since", website); `&org=<id>` opens a detail
  dialog (banner, logo, facts, Khmer description when written else English, website). Home strip:
  `toPartners` in `components/home/HomePage.tsx` (short name shown). Strings `partners.international*`,
  `partners.org*`, `partners.since`, `partners.close` (EN + KM).

## Tests
`api-tests/tests/settings.test.ts` — the `partner-organizations` resource runs the shared sponsor /
broadcaster suite (create, defaults, public list, partial update, Super Admin delete, 404, role checks,
auth) + 422 for bad year / sort order; shape snapshots added. Suite 230/230.

## Later (not built)
- Link fight nights they co-promote (event field, event page, partner dialog).
- Pick a title's sanctioning organisation (`champions.organization`, free text "KKF" today) from this list.
- KUNKHMER HUB tool for international partners.
