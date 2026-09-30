# Feature: Club logos

| | |
|---|---|
| **Status** | Done (not committed) — waiting for owner review (2026-09-29) |
| **Jira** | n/a |
| **Figma** | n/a |
| **Owner** | vannak070 |

## Goal
Every club can have its own logo, uploaded in the admin and shown wherever the club appears on the
fan site — so fans recognise a gym at a glance, like the partner logos. (Website-review plan step 5.)

## Today
`clubs` has one picture, `image` (the club photo / banner shown on the Clubs & Gyms cards and the club
page `/clubs/<slug>`). No logo. Fighter cards, fighter profiles and search show the club as text only.

## Owner decisions (2026-09-29)
- Only **KKF staff** (Super Admin + KKF Officer) upload or change a logo — same as every club field.
- Shown on: **Clubs & Gyms cards + club page**, **fighter profile + fighter cards** (/fighters and the
  home page's featured fighters), and **search results**.
- No logo yet: **initials** on the club card and club page only; fighter cards / profile / search show
  the usual icon or photo (no empty spot).

## Data (migration `20260929000002_club_logo`)
`clubs.logo_url` (text, nullable). Uploads arrive as data URIs and are stored as files by the upload
hook (`lib/files.ts`) → `/api/files/<sha256>.<ext>`.

## API
- Club rows (`GET /clubs`, `/clubs/:id`, POST / PUT / DELETE responses): new `logo_url`.
- `POST /clubs` / `PUT /clubs/:id` accept `logoUrl`; on PUT `logoUrl: ""` removes it (explicit, because
  `input.pick` skips empty values).
- Fighters (camelCase, `formatFighter`): new `clubLogo` = the club's `logo_url`, so fighter cards need
  no extra request. Additive shape change; snapshots updated deliberately (clubs, content, fighters,
  matches — only the new fields added).

## Frontend
- Admin: `AddClub.tsx` "Club Logo" card (upload, preview, remove; sends `logoUrl`); `Clubs.tsx` shows the
  logo next to the club name.
- Fan site: `pages/Partners.tsx` `ClubCard` (logo or initials on the photo, like partner cards);
  `pages/PartnerPages.tsx` club header (`BannerHeader` logo — initials fallback already there);
  `pages/SuperAppFighterDetail.tsx` club line (logo instead of the building icon);
  `pages/FightersDirectory.tsx` `FighterCard` (small logo before the club name; also home);
  `components/layout/GlobalSearch.tsx` club results (logo shown whole, else the club photo).

## Tests
`api-tests/tests/clubs.test.ts`: `logo_url` on create; new test — a data-URI logo is stored as a file,
appears as `clubLogo` on the club's fighter, and `logoUrl: ""` clears both. Suite 250/250.

## Log
### 2026-09-29
- Built as above; typecheck + contract suite 250/250 (CI mode); both frontends build.
- Checked: dev (no logos yet → initials "PS" / "បក" on the club cards); a temporary copy of the site on
  the disposable test API with a generated logo on one test club: logo on the club card, club page,
  fighter profile, /fighters card and search result. Admin form not opened in the browser (signing in
  would sign the owner out); it builds.
