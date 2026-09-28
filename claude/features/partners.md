# Feature: Strategic partners — sponsors, broadcast stations, international partners

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
| … | `/settings/partner-organizations[/:id]` | same rules | international partners (K-1, WKN, Kombat …) — see `features/international-partners.md` |

`active`: `false`, `0`, `"0"`, `""` and null are false; anything else is true.

## Frontend
- Admin: `StrategicPartners.tsx` (`/home/strategic-partners/:partnerType`), `PartnerOrganizations.tsx`
  (`/home/strategic-partners/organizations`), `SystemSettings.tsx`.
- Public: `pages/Partners.tsx` (`/strategic-partners`, tabs Official Sponsors · International Partners ·
  Broadcast Partners · Clubs & Gyms; sponsor / broadcaster / partner cards use the club-card layout:
  banner picture, logo on it, details), `SponsorDetailPage.tsx`, `BroadcastDetailPage.tsx`.

## Tests
`api-tests/tests/settings.test.ts`
