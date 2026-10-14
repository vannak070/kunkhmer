# Feature: Fighters

| | |
|---|---|
| **Status** | Done — verification switched off 2026-09-30: a fighter KKF staff create is Active at once (`verifiedBy` = them), Club/Gym accounts are read-only in the admin; a Draft fighter is made active with "Activate" (same `/verify` call). See `updates/officer-run-program.md` |
| **Jira** | n/a |
| **Figma** | n/a |

## Goal
Register Kun Khmer and foreign fighters, verify them, and show profiles and
records publicly.

## API (`backend/src/modules/fighters/routes.ts`)
| Method | Path | Who | Notes |
|---|---|---|---|
| GET | `/fighters` | public | `?status=`, `?clubId=`; newest first; excludes soft-deleted. Without a staff token, unverified fighters (`Draft`, `Pending KKF Verification`, `Rejected`) are left out |
| GET | `/fighters/page` | signed in | Admin list, one page: `?q=&origin=local\|foreign&clubId=(or none)&status=&classId=&sort=name\|weight&limit=30&offset=` → `{ items, total, clubs, noClub, statuses }`; `updates/admin-fighters-paging.md` |
| GET | `/fighters/:key` | public | key = UUID, exact name, slug (`sok-chan`) or Khmer name; unverified → 404 without a staff token |
| POST | `/fighters` | STAFF, Club/Gym (own club) | Organizer/Referee/Judge → 403; requires name, nameKhmer, dateOfBirth, currentWeight, height; 201; **422 if another fighter has the same Khmer name and date of birth** (also on `PUT` when either changes) |
| PUT | `/fighters/:id` | STAFF; Club/Gym own club only | others 403; a club editing a `Rejected` fighter re-submits it (status → Draft) |
| POST | `/fighters/:id/verify` | STAFF | status → Active, sets verifiedBy/verifiedDate, clears `reviewNote`; empty body OK |
| POST | `/fighters/:id/reject` | STAFF | `{reason}` required → status Rejected, `reviewNote` = reason |
| DELETE | `/fighters/:id` | STAFF | soft delete (`deleted_at`) |

Shape (camelCase): `id, name, nameKhmer, alias, dateOfBirth, nationality,
province, gender, currentWeight, height, clubId, clubName, clubLogo (club logo, `features/club-logos.md`), style, grade, image,
record, status, professionalStatus, verifiedBy, verifiedDate, createdAt, updatedAt`.
Nested inside other responses as snake_case `fighterArray()`.

## KKF ID
Every fighter has a `kkfId` ("KKF-000123", unique): one running number (at least 6 digits) given by the database when
the fighter is saved (`kkf_next_id()`, sequence `fighter_kkf_seq`, migrations `20261014160000_fighter_kkf_id` and
`20261014170000_kkf_id_generator_skips_taken`). The Register form shows the next number while registering
(`GET /fighters/next-kkf-id`, staff and clubs — a preview, someone else may take it first). **KKF staff (Super Admin, KKF
Officer) can choose it when registering (`kkfId` on `POST`) and change it later (`PUT`)**: `KKF-` + 4–12 digits, lower case
and spaces tolerated, 422 when another fighter (deleted ones included) already has it; clubs can't set it (ignored). The
counter skips numbers staff took by hand and never hands a number out twice (deleted and merged fighters keep theirs). It is in both fighter
shapes (`kkfId` / `kkf_id`); `GET /fighters/:key`, `/fighters/page?q=` and `/search` find a fighter by it. Admin only:
fighter page, Fighters list, header search, the duplicate boxes — not on the fan site. Existing fighters were numbered
in the order they were registered. With personal details optional, the KKF ID plus the exact-duplicate block (same
Khmer name + birth date, spaces ignored; foreign guests without a Khmer name aren't checked) is the duplicate protection;
similar names stay a warning (`updates/duplicate-fighter-warning.md`) and a typed ID number must be unique
(`updates/fighter-id-merge.md`). Details: `updates/fighter-kkf-id-optional-details.md`.

## Duplicate fighters list
`/home/fighters/duplicates` (menu Fighters › Duplicates, KKF staff): pairs who may be the same person, Very likely / Possible,
merge or "Not the same person" — `features/duplicate-fighters-list.md`.

## Business rules
- Only STAFF can set `status` (Draft → Active is verification). Others always create Draft.
- Unverified fighters can't be matched: `POST /matches` returns 422 naming them.
- Admin: waiting-for-verification queue (Fighters filter `?status=waiting`, banner), Verify /
  Send back on the list, profile and dashboard (`components/FighterReview.tsx`); Club/Gym
  accounts use Add Fighter with their club locked and no status field.
- Club/Gym users: new fighters go to their own club; they can't move a fighter to another club.
- `record` ("W-L-D") is recalculated automatically when a match result is recorded.
- Grades A–D; `professionalStatus` default "Professional".
- Soft-deleted fighters disappear everywhere, including nested in matches/titles/videos.

## Frontend
- Admin: `Fighters.tsx` (`/home/fighters`, `/kunkhmer`, `/foreigner`),
  `AddFighter.tsx` (new/edit), `FighterDetail.tsx`.
- Public: `/fighters/:id` → `SuperAppFighterDetail.tsx` (uses slugs/names).

## Possible same fighter
`POST /fighters/similar` and the amber box / save question on Add / Edit fighter: `updates/duplicate-fighter-warning.md`.
One ID number per fighter (refused on save, checked while typing) and **Merge into another fighter** on the fighter page
(KKF staff; moves bouts, results, titles, follows, then removes the duplicate): `updates/fighter-id-merge.md`.

## Foreign (guest) fighters
Since 2026-10-13 a non-Cambodian fighter needs only a name, nationality, gender and weight: date of birth and height are
optional (columns nullable, migration `20261013210000_guest_fighters`; API returns `dateOfBirth` / `height` null), the
Khmer name stays optional, and Add Fighter does not ask for the ID number / emergency contact. A guest without a date of
birth is never blocked by the minimum-age rule and gets no guardian warning. See `features/weekly-program.md`.

## Private details
ID / KYC, emergency contact and medical records are staff-only and live outside the public API: see `features/fighter-personal-records.md`.

## Club registration form (Excel)
`docs/forms/KKF_Fighter_Registration_Form.xlsx` (rebuild with
`python3 docs/forms/build_fighter_registration_form.py`): clubs fill it in,
KKF staff register the fighters in the admin. English + Khmer; sheets
Instructions, Club, Fighters (50 rows, drop-downs, date/number checks, red
highlight for missing required values), hidden Lists. Columns follow Register
Fighter; age, weight class (the 14 official classes, copied 2026-09-28 — update
the script if System Settings change) and record W-L-D are formulas. It also
asks for ID, phone, emergency contact and medical details, which the system
doesn't store yet (KKF keeps them). No photos. A "Registered in system" column
is for KKF staff.

## Tests
`api-tests/tests/fighters.test.ts`

## Open questions / gaps
- Medical status / suspension columns exist but have no API yet.
