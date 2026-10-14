# Update: Hide fighters' medical status and suspension date from non-staff

| | |
|---|---|
| **Status** | Done (2026-10-13) |
| **Jira** | n/a |
| **Feature** | claude/features/fighters.md, claude/updates/fighter-medical-suspension.md |
| **Requested by** | vannak070 (chose option 2: hide both for anyone who is not KKF staff) |

## Current behavior (before)
Every fighter row nested in public responses (`/matches`, `/champions`, `/videos`, `/matches/proposals`, …)
carried `medical_status` and `suspension_end_date`. They were always "Cleared" / null; once staff set real values
(`fighter-medical-suspension.md`) they would have been public.

## Requested change
A `preSerialization` hook in `app.ts` (`lib/staffOnlyFields.ts`) removes the keys `medical_status` and
`suspension_end_date` from **every** API response unless the signed-in user is KKF staff (Super Admin, KKF
Officer). That covers the public site, fans, Organizer and Club/Gym accounts. The staff-only
`/fighters/:id/private` route still returns them (as `medicalStatus` / `suspensionEndDate`).

## Impact
Response shapes: those two keys disappear from fighter rows for non-staff (snapshots updated: 20 lines removed,
nothing else). Staff responses unchanged. The fan site and the admin don't read the keys (checked by search);
the matching rules read the database, not the response. Database: none.

## Acceptance criteria
- [x] Anonymous, Club/Gym and Organizer get no `medical_status` / `suspension_end_date` in bout lists; KKF staff still do.
- [x] Typecheck clean; full suite 295/295 (`CI=true`).
- [ ] Not browser-checked (no UI change).

## Log
### 2026-10-13
- `lib/staffOnlyFields.ts` (pure copy, never mutates the response object), hook in `app.ts`; snapshots
  `champions`, `content`, `matches`, `officials` lose the two keys; new contract test in `fighter-private.test.ts`;
  `matches.test.ts` public-shape comparison drops the two keys.
- Any new route that returns fighter health data must either go through `fighterArray` (covered) or be staff-only.
