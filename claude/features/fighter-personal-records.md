# Feature: Fighter personal records (ID / KYC, emergency contact, medical)

| | |
|---|---|
| **Status** | Built 2026-09-30 (committed 1e1bf0d9); staff still to fill in the existing fighters |
| **Jira** | n/a |
| **Figma** | n/a |
| **Owner** | vannak070 |

## Goal
KKF staff can record, for each fighter, the private details the federation needs before a fighter
competes — identity document (KYC), emergency contact and medical clearance — and see who is missing
what. None of it is ever shown on the public site or sent to the AI.

## Why the Add Fighter form doesn't ask for it (findings, 2026-09-30)
- The **old** Add Fighter form (before `8f7ddb54`) showed ID type / number / expiry / document upload, phone,
  email, address, emergency contact, blood type, medical check and consent boxes — but **never saved
  them**: its save payload only sent name, Khmer name, alias, date of birth, nationality, province,
  gender, weight, height, club, style, grade, photo and record. The fields lived only in the page's memory
  (since the first commit, 2026-06-25) and there are no columns for them in `fighters`.
- So the **simplified** form (`8f7ddb54`, another session) dropped them: it now shows exactly what the system
  can store. Nothing that was saved was lost.
- The database has `medical_status` (default "Cleared") and `suspension_end_date`, but no API or screen uses
  them.
- KKF's own Excel registration form (`docs/forms/KKF_Fighter_Registration_Form.xlsx`) still asks for ID,
  phone, emergency contact and medical details and says "the system doesn't store yet (KKF keeps them)".

## Security constraints (why this is not just "add fields")
- These are **personal data** (ID numbers, phone numbers, health). They must never appear in any public
  API (`GET /fighters` is public), in the fan site, the search, the sitemap, or the KUNKHMER HUB tools.
- **Pictures are stored as public files** (`/api/files/<hash>` needs no login, cached "public, immutable").
  An ID scan or medical certificate uploaded that way could be opened by anyone who gets the link, so
  documents need a **separate private storage** with a staff-only download route.
- Access should be limited to KKF staff (Super Admin + KKF Officer) — and every read of the sensitive
  parts logged, if the owner wants an audit trail.
- Minors (fighters under 18) need a guardian's contact/consent.

## Owner decisions (2026-09-30)
- **Yes**, build staff-only private records; never public, never in search / sitemap / Hub.
- **Required when registering a fighter** (Add Fighter form): ID type + ID number and one emergency
  contact (name + phone). Everything else (relationship, phone, email, address, blood type, medical
  check / expiry / notes, guardian, consent, document scans) is optional and can follow.
- **Document scans**: private storage with a staff-only download route — never `/api/files`.
- Missing / expired details **warn only** (fighter page, Fighters list, Add bout) — they never block a bout.
- Defaults I chose for what wasn't asked (say if you want them changed): no read-audit log in the first
  version; a fighter under 18 without a guardian name + phone shows a warning; the 4 existing fighters
  are completed by staff later (they show "missing details" until then).

## Built (2026-09-30)
- **Data**: table `fighter_private` (migration `20260930000004_fighter_private`), one row per fighter, cascade delete.
- **API** (`backend/src/modules/fighters/private.ts`, STAFF only): `GET /fighters/private-summary`, `GET|PUT /fighters/:id/private`, `GET /fighters/:id/private/documents/:kind` (`id` | `medical`). Documents are files in `UPLOAD_DIR/private/` (must persist and be backed up), served with `Cache-Control: private, no-store`; the API only returns `hasIdDocument` / `hasMedicalDocument`, never a link. The base64-to-public-file hook skips these routes (`PRIVATE_ROUTE` in `app.ts`).
- **Warnings** (never block): missing ID / emergency contact / medical check; ID or medical expired; under 18 without guardian name + phone.
- **Admin**: Add Fighter has the required ID + emergency contact block; fighter page has a "Personal details" tab; Fighters list shows a "Missing details" chip; Add bout shows a warning line.
- **Tests**: `api-tests/tests/fighter-private.test.ts` (shapes, validation, roles, no public leak, private scan storage); suite 275/275.
- **Browser-checked** on the test API: add with details + scan, tab, scan download (staff 200, anonymous 401), list chip, Khmer and phone width of the form. Not walked through: Add bout warning, guardian block, edit flow.

## Original proposal
- **Data**: new table `fighter_private` (one row per fighter, cascade delete): ID type, ID number, ID
  expiry, ID document (private file), phone, email, address, emergency contact name / relationship /
  phone, guardian (name, phone) for under-18s, blood type, last medical check, medical clearance expiry,
  medical notes, consent given (date, by). The public `fighters` API and its snapshots stay unchanged.
- **API** (staff only, own routes, e.g. `/fighters/:id/private`): read, update, and download of the private
  document; 404 for others; the public fighter routes never include any of it.
- **Admin**: a "Personal & medical details" section on the fighter page (view / edit), the same fields as
  optional steps at the end of Add Fighter, and a Fighters list filter/badge "Missing ID / emergency
  contact / medical check" (plus "expiring soon").
- **Rules** (owner decides): what blocks a fighter from being matched or weighed in, if anything.

## Users and roles
KKF staff only (Super Admin + KKF Officer). Club/Gym accounts stay read-only (approvals are off).

## Open questions
- Read-audit log ("who viewed this fighter's ID") — not in the first version.
