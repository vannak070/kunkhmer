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
| POST | `/events` | STAFF, Organizer | requires name, date, location; creator becomes organizer; Organizer events always start Draft; 201 |
| PUT | `/events/:id` | STAFF; Organizer own events only | `sponsorIds` replaces the sponsor list; Organizer may set status only to Published (once Approved) or Cancelled (422 otherwise) |
| POST | `/events/:id/submit` | Organizer (own), STAFF | Draft → Pending KKF Approval; clears `kkf_comment` |
| POST | `/events/:id/approve` | STAFF | Pending → Approved; sets `kkf_approval_date` / `kkf_approved_by` |
| POST | `/events/:id/reject` | STAFF | `{comment}` required; Pending → Draft with `kkf_comment` |
| DELETE | `/events/:id` | Super Admin | cascades to batches and matches |

Response: snake_case event row + nested `organizer`, `broadcast_station`,
`main_sponsor`, `sponsors[]` (with `pivot`) + flat extras `organizer_name`,
`broadcast_station_name/_logo_url`, `main_sponsor_name/_logo_url`,
`sponsorIds`, `eventType`, `isTournament`, `tournamentFormat`,
`tournamentWeightClass`, `expectedParticipants`. Create omits `kkf_*` fields
(the frontends rely on this; pinned by snapshots).

## Data
`events` (`event_type` single-day/multi-week, tournament fields,
`kkf_approval_date`/`kkf_approved_by`), `event_sponsors`.
Event + sponsor list are saved in one transaction.

## Frontend
- Admin: `CreateEvent.tsx`, `EventDetailNewSimple.tsx` (`/home/events/:id`),
  `ProgramDashboard.tsx` (`/home/program?tab=events`), `EventsAndMatches.tsx`.
- Public: event listings on `SuperAppHome.tsx`; event page `pages/EventDetail.tsx` at `/events/<name>-<code>` (see `features/public-site.md`).

## Tests
`api-tests/tests/events.test.ts`

## Officer flow (current, 2026-09-30)
KKF staff create the event (Draft, hidden) → fight card → bouts → officials → **Publish** → weigh-in → results.
The admin shows an event as Completed once fight night has passed and every bout has a result (derived, not
stored); the Edit Event status list is Draft / Published / Cancelled. Organizer accounts are read-only in the
admin. Submit / approve / send-back endpoints still exist but the admin doesn't use them.

## Approval flow (Phase 3a, 2026-09-26)
**Switched off since 2026-09-30** (`updates/officer-run-program.md`): KKF staff run the whole Program flow; the rules below apply only with `APPROVALS_ENABLED=true` (backend) + `APPROVALS_ENABLED = true` (`frontend/admin/src/app/config/features.ts`).
Draft → (submit) Pending KKF Approval → (approve) Approved → (publish) Published; KKF can send a
pending event back to Draft with a comment. KKF staff may publish directly. Without a staff
token, `GET /events`, `/events/:id`, fight cards and bouts hide Draft / Pending / Approved
events. Admin: the event page "Next steps" step "Approve & publish" shows Submit / Approve /
Send back / Publish by role, plus the KKF comment banner; dashboard lists events to approve,
sent back, and ready to publish.

## Open questions / gaps
- Approval history keeps only the latest approval and the latest send-back
  comment (no full audit trail).
