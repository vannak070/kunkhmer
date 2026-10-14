# Feature: Duplicate fighters list (admin)

| | |
|---|---|
| **Status** | Done (2026-10-14, committed bb5a146c; not live) |
| **Jira** | n/a |
| **Figma** | n/a |
| **Owner** | vannak070 |

## Goal
One admin page where KKF staff see fighters who may be the same person, compare the two records side by side, and merge
them (or say they are different people). Before this, duplicates were only caught while registering
(`updates/duplicate-fighter-warning.md`, exact block in `updates/fighter-kkf-id-optional-details.md`) or when the Staff
assistant was asked; nothing listed the ones already in the data.

## Users and roles
KKF staff only (Super Admin, KKF Officer) — the same people who can merge (`updates/fighter-id-merge.md`). Permission
`fighters.duplicates` in the admin; the API checks `STAFF`.

## Decisions (2026-10-14)
1. Its own menu item **Duplicates** under Fighters (`/home/fighters/duplicates`); no dashboard to-do.
2. Two tiers: **Very likely** and **Possible**.
3. "Not the same person" is remembered, with a Dismissed tab and "Bring back".
4. The same ID number counts (as Very likely) even when the names differ.

## API (`backend/src/modules/fighters/duplicates.ts`, STAFF)
| Method | Path | Notes |
|---|---|---|
| GET | `/fighters/duplicates?show=open\|dismissed` | `{ items, counts: { open, veryLikely, possible, dismissed } }`; each item `{ key, tier, reasons, dismissed, fighters: [card, card] }`; the record registered first is listed first (the usual one to keep); card = id, kkfId, name, nameKhmer, dateOfBirth, nationality, clubName, currentWeight, record, image, status, bouts, hasIdNumber (the number itself is not sent), registered |
| POST | `/fighters/duplicates/dismiss` | `{ fighterAId, fighterBId }` → "not the same person" (either order; 422 unless two different existing fighters) |
| POST | `/fighters/duplicates/restore` | same body → back on the open list |
Merging uses the existing `POST /fighters/:id/merge`.

## Rules
A pair is listed when the two share: an ID number (spaces, dashes, case ignored; 3+ characters), an English name or a Khmer
name (case, spaces, accents ignored), or have a similar name (English ≤ 2 letters apart, length ≥ 4; Khmer ≤ 1 apart, length ≥ 4)
**and** the same date of birth. **Very likely** = same ID number, or the same (English or Khmer) name together with the same
date of birth. **Possible** = everything else (same name only, or a similar name with the same birth date). Pairs who fought
each other are never listed (they can't be one person). Name groups bigger than 40 are skipped, and empty names are ignored
(fighters whose English name field holds Khmer script have no English key — their Khmer name is what matches).

## Data
Table `fighter_duplicate_dismissals` (migration `20261014180000_fighter_duplicate_dismissals`): the pair (smaller id first),
who and when. No foreign keys: a deleted or merged fighter just stops matching.

## Frontend (admin)
`pages/Duplicates.tsx`: tabs To check / Not the same person, filter chips All / Very likely / Possible, one card per pair
(tier + reason chips; both records with photo, names, KKF ID, birth date, club or nationality, weight, record, bouts, registered
date, Open profile). Open tab: "Keep this one — merge the other into it" under each record opens the existing
`MergeFighterDialog` with the record to keep chosen (`initialKeep`), "Not the same person" per pair. Dismissed tab: "Bring
back to the list". English + Khmer (`dups.*`, `menu.fighters.duplicates`).

## Tests
`api-tests/tests/duplicates.test.ts` (8): tiers and reasons, namesakes, similar names, fought-each-other exclusion,
dismiss/restore, merge from the list, validation, roles. The same-ID-number rule can't be set up through the API (the
one-ID rule blocks it), so it was checked by hand on the test database: two fighters with `kh-777 888` / `KH777888` and
different names came back as Very likely with reason `id_number`.

## Open questions / gaps
- No dashboard to-do or menu badge with the number of pairs (owner chose a plain menu item).
- The list is computed on every request (fine for a few thousand fighters; cache or index if it gets slow).
- Dev data on 2026-10-14: no pair shares a name or ID number (226 fighters); similar-name pairs were not checked by hand.
