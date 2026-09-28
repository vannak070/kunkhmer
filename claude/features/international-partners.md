# Feature: International partners (partner organisations)

| | |
|---|---|
| **Status** | Done — committed b8a1a204 + d7e76c6b (2026-09-28); K-1, WKN, Kombat with logos and banners in dev data only |
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
  owner asked me to add the three in dev (2026-09-28), then their logos and banners ("search from
  internet"). Current dev entries (order 1–3):
  - **K-1** — Promotion, Japan, https://www.k-1.co.jp; runs K-1 World GP, Krush and K-1 Amateur.
    Logo from the site's share image `k-1.co.jp/meta/open_graph.png`.
  - **World Kickboxing Network (WKN)** — Sanctioning body, Hong Kong, https://worldkickboxingnetwork.net;
    founded in Hong Kong in October 1994 (Wikipedia). Logo: the crest on its site
    (`wp-content/uploads/2023/01/GRFFGBFGB.jpg`); banner from its wordmark (`…/2022/12/wkn.png`).
  - **Kombat Global (Kombat)** — Promotion, Singapore, https://www.kombatglobal.com; started in the US
    in 2023 as Kombat Taekwondo, renamed Kombat Global in Dec 2025 (HQ Singapore), runs a Kombat Kun
    Khmer league; partner in the Ganzberg Kombat Grand Prix Kun Khmer & Taekwondo (Phnom Penh,
    27 June 2026 — KKF news article). Logo / banner from `kombatglobal.com/Kombat Logo Square.png`
    and `… Horizontal.png`. (Was entered first as "Kombat Corporation Professional Taekwondo
    Federation", the name in KKF's article.)
  Banners are 1600×900 images made only from each official logo on a dark background (no photos
  copied); stored as data URLs like sponsor uploads. No "partner since" years (not known). Khmer
  descriptions are a first draft for KKF review. Logos are the organisations' trademarks — KKF should
  confirm it may show them (normally part of the partnership).
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
