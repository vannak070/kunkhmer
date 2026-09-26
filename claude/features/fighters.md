# Feature: Fighters

| | |
|---|---|
| **Status** | Done |
| **Jira** | n/a |
| **Figma** | n/a |

## Goal
Register Kun Khmer and foreign fighters, verify them, and show profiles and
records publicly.

## API (`backend/src/modules/fighters/routes.ts`)
| Method | Path | Who | Notes |
|---|---|---|---|
| GET | `/fighters` | public | `?status=`, `?clubId=`; newest first; excludes soft-deleted |
| GET | `/fighters/:key` | public | key = UUID, exact name, slug (`sok-chan`) or Khmer name |
| POST | `/fighters` | any logged-in user | requires name, nameKhmer, dateOfBirth, currentWeight, height; 201 |
| PUT | `/fighters/:id` | any logged-in user | Club/Gym only for own club's fighters (403 otherwise) |
| POST | `/fighters/:id/verify` | STAFF | status → Active, sets verifiedBy/verifiedDate; empty body OK |
| DELETE | `/fighters/:id` | STAFF | soft delete (`deleted_at`) |

Shape (camelCase): `id, name, nameKhmer, alias, dateOfBirth, nationality,
province, gender, currentWeight, height, clubId, clubName, style, grade, image,
record, status, professionalStatus, verifiedBy, verifiedDate, createdAt, updatedAt`.
Nested inside other responses as snake_case `fighterArray()`.

## Business rules
- Only STAFF can set `status` (Draft → Active is verification). Others always create Draft.
- Club/Gym users: new fighters go to their own club; they can't move a fighter to another club.
- `record` ("W-L-D") is recalculated automatically when a match result is recorded.
- Grades A–D; `professionalStatus` default "Professional".
- Soft-deleted fighters disappear everywhere, including nested in matches/titles/videos.

## Frontend
- Admin: `Fighters.tsx` (`/home/fighters`, `/kunkhmer`, `/foreigner`),
  `AddFighter.tsx` (new/edit), `FighterDetail.tsx`.
- Public: `/fighters/:id` → `SuperAppFighterDetail.tsx` (uses slugs/names).

## Tests
`api-tests/tests/fighters.test.ts`

## Open questions / gaps
- Should fighter create/edit be limited to STAFF + Club/Gym? (Currently any role.)
- Medical status / suspension columns exist but have no API yet.
