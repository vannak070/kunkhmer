# Feature: Clubs (gyms)

| | |
|---|---|
| **Status** | Done |
| **Jira** | n/a |
| **Figma** | n/a |

## Goal
Keep the registry of Kun Khmer clubs/gyms and their fighters.

## API (`backend/src/modules/clubs/routes.ts`)
| Method | Path | Who | Notes |
|---|---|---|---|
| GET | `/clubs`, `/clubs/:id` | public | include `fighters_count` (non-deleted fighters) |
| POST | `/clubs` | STAFF | requires name; defaults status `active`, rating 4.0; 201 |
| PUT | `/clubs/:id` | STAFF | only given fields |
| DELETE | `/clubs/:id` | STAFF | fighters/users/videos keep existing with `club_id` set to null |

Shape: snake_case row (`name_khmer`, `head_coach`, `rating` number, `logo_url`, …). Club logos: `features/club-logos.md` (`logoUrl` input, `""` clears).

## Frontend
- Admin: `Clubs.tsx`, `AddClub.tsx` (new/edit, has a location map picker), `ClubDetail.tsx`.
- Public: `components/home/ClubDetailPage.tsx`.

## Tests
`api-tests/tests/clubs.test.ts`

## Open questions / gaps
- Admin permissions list has `clubs.approve` but there is no club approval flow in the API.
