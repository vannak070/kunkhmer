# Feature: Strategic partners — sponsors and broadcast stations

| | |
|---|---|
| **Status** | Done |
| **Jira** | n/a |
| **Figma** | n/a |

## Goal
Maintain sponsors (tiers) and broadcast stations used on events and shown on
the public site.

## API (`backend/src/modules/settings/routes.ts`)
| Method | Path | Who | Notes |
|---|---|---|---|
| GET | `/settings/sponsors` | public | newest first |
| POST | `/settings/sponsors` | STAFF | requires name; tier default Gold, active true; 201 |
| PUT | `/settings/sponsors/:id` | STAFF | |
| DELETE | `/settings/sponsors/:id` | Super Admin | removed from events' sponsor lists; main sponsor set to null |
| … | `/settings/broadcast-stations[/:id]` | same rules | type default "Cable TV", reach "National" |

`active` uses PHP-style casting: `false`, `0`, `"0"`, `""`, null are false.

## Frontend
- Admin: `StrategicPartners.tsx` (`/home/strategic-partners/:partnerType`), `SystemSettings.tsx`.
- Public: `SponsorsSection.tsx`, `SponsorDetailPage.tsx`, `BroadcastDetailPage.tsx`.

## Tests
`api-tests/tests/settings.test.ts`
