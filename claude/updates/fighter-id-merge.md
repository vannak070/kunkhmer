# Update: Protecting against duplicate fighters — one ID number per fighter, and merging two records

| | |
|---|---|
| **Status** | Done (2026-10-14, committed bb5a146c; live since a1c0fb9b, 2026-10-14) |
| **Jira** | n/a |
| **Feature** | claude/features/fighters.md, claude/features/fighter-personal-records.md |
| **Requested by** | Owner ("How to protect duplicate fighter" → "start 1 and 2") |

## Current behavior
Only a soft warning while registering (`updates/duplicate-fighter-warning.md`: similar names / same birth date).
Two fighters could have the same ID number, and a duplicate already in the data could only be deleted (losing its bouts).

## Requested change
1. **One ID number per fighter.** The server refuses an ID / passport number that another (not deleted) fighter
   already has. Spaces, dashes, dots and upper/lower case don't count (`KH-123 456` = `kh123456`). Numbers shorter than
   3 letters/digits are not checked. Add / Edit Fighter checks while typing, shows "This ID number is already registered
   for X — Open that fighter" under the field and won't save.
2. **Merge two fighters** (KKF staff). Fighter page › "⋯" › "Merge into another fighter": the fighter open now is the
   duplicate; search the record to keep, see what will move, confirm. Everything moves to the kept fighter in one
   transaction and the duplicate is removed (soft delete).

## Scope
In scope — what a merge moves: bouts (red and blue corner), winners and saved results, titles held (holder + name),
title-defence opponents, a title's saved "before" state, match change history, videos, fan follows (a fan following
both keeps one) and fan notifications (doubles dropped), private details when the kept fighter has none. The kept
fighter keeps its own profile; its typed career record is taken from the duplicate only when it has none; its
record is recalculated. Logged in `fighter_merges` (kept, removed, removed name, who, when, counts).

Refused: the same fighter, a deleted / missing fighter, and two fighters who fought each other (can't be one person).

Out of scope: undo (the log keeps the counts, not the moved ids); a duplicates list page; merging private details
field by field (the kept fighter's stay as they are).

## Impact
- API (additive, new routes only): `GET /fighters/private/id-check?number=&excludeId=` → `{ taken, fighter: { id, name, nameKhmer } | null }`;
  `PUT /fighters/:id/private` → 422 "This ID number is already registered for X"; `GET /fighters/:id/merge-preview?intoId=`;
  `POST /fighters/:id/merge { intoId }`. All STAFF (Super Admin, KKF Officer). Code: `backend/src/modules/fighters/private.ts`
  (`idKey`, `idOwner`), `backend/src/modules/fighters/merge.ts`.
- Migration `20261014150000_fighter_merges` (new table only).
- Admin: `AddFighter.tsx` (live check, blocks save), `PrivateDetails.tsx` (`idTaken` message), `FighterDetail.tsx`
  (menu item), new `components/fighters/MergeFighterDialog.tsx`, keys `pv.idTaken*`, `mg.*` (EN + KM).
- Existing data with the same ID twice is not changed; the next save of either record is refused until one is fixed or merged.

## Acceptance criteria
- [x] Duplicate ID refused on save, normalized; own number can be saved again; deleted fighters free their number.
- [x] Merge moves bouts, results, titles, follows, private details; record recalculated; duplicate gone; logged.
- [x] Fighters who fought each other can't be merged; staff only.

## Log
- 2026-10-14: built. Tests `api-tests/tests/fighter-id-merge.test.ts` (4) + `fighter-private.test.ts` now gives each
  fighter its own ID number. Backend typecheck clean; `npm run test:api` 382/382; admin build OK. Browser check on the
  test API: warning under the ID field, Save refused, merge dialog preview → merged → opened the kept fighter.
