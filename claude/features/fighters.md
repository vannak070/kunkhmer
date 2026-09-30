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
| GET | `/fighters/:key` | public | key = UUID, exact name, slug (`sok-chan`) or Khmer name; unverified → 404 without a staff token |
| POST | `/fighters` | STAFF, Club/Gym (own club) | Organizer/Referee/Judge → 403; requires name, nameKhmer, dateOfBirth, currentWeight, height; 201 |
| PUT | `/fighters/:id` | STAFF; Club/Gym own club only | others 403; a club editing a `Rejected` fighter re-submits it (status → Draft) |
| POST | `/fighters/:id/verify` | STAFF | status → Active, sets verifiedBy/verifiedDate, clears `reviewNote`; empty body OK |
| POST | `/fighters/:id/reject` | STAFF | `{reason}` required → status Rejected, `reviewNote` = reason |
| DELETE | `/fighters/:id` | STAFF | soft delete (`deleted_at`) |

Shape (camelCase): `id, name, nameKhmer, alias, dateOfBirth, nationality,
province, gender, currentWeight, height, clubId, clubName, clubLogo (club logo, `features/club-logos.md`), style, grade, image,
record, status, professionalStatus, verifiedBy, verifiedDate, createdAt, updatedAt`.
Nested inside other responses as snake_case `fighterArray()`.

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
