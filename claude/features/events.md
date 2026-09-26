# Feature: Events

| | |
|---|---|
| **Status** | Done |
| **Jira** | n/a |
| **Figma** | n/a |

## Goal
Organizers create fight events (single-day or multi-week tournaments) with a
venue, broadcaster and sponsors; KKF approves them.

## API (`backend/src/modules/events/routes.ts`)
| Method | Path | Who | Notes |
|---|---|---|---|
| GET | `/events`, `/events/:id` | public | newest date first |
| POST | `/events` | STAFF, Organizer | requires name, date, location; creator becomes organizer; 201 |
| PUT | `/events/:id` | STAFF, Organizer | `sponsorIds` replaces the sponsor list |
| DELETE | `/events/:id` | Super Admin | cascades to batches and matches |

Response: snake_case event row + nested `organizer`, `broadcast_station`,
`main_sponsor`, `sponsors[]` (with `pivot`) + flat extras `organizer_name`,
`broadcast_station_name/_logo_url`, `main_sponsor_name/_logo_url`,
`sponsorIds`, `eventType`, `isTournament`, `tournamentFormat`,
`tournamentWeightClass`, `expectedParticipants`. Create omits `kkf_*` fields
(Laravel quirk, pinned by snapshots).

## Data
`events` (`event_type` single-day/multi-week, tournament fields,
`kkf_approval_date`/`kkf_approved_by`), `event_sponsors`.
Event + sponsor list are saved in one transaction.

## Frontend
- Admin: `CreateEvent.tsx`, `EventDetailNewSimple.tsx` (`/home/events/:id`),
  `ProgramDashboard.tsx` (`/home/program?tab=events`), `EventsAndMatches.tsx`.
- Public: event listings on `SuperAppHome.tsx`.

## Tests
`api-tests/tests/events.test.ts`

## Open questions / gaps
- No API for KKF approval (`kkf_approval_date`/`kkf_approved_by`); the admin
  workflow pages (`KKFWorkflow*`) use mock data.
