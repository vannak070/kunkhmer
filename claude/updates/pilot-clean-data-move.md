# Update: Clean data copy for the pilot

| | |
|---|---|
| **Status** | Built 2026-10-01 (committed c53c43d3) — **not used for pilot 1**: the owner decided the pilot server starts empty, with no dev data. Kept for a later move; the generated copy files were deleted |
| **Jira** | n/a |
| **Feature** | claude/updates/go-live-setup.md, claude/updates/pilot-admin-password-and-router.md |
| **Requested by** | vannak070 (2026-10-01: "go ahead with the clean data move") |

## Current behavior
`deploy/export-local.sh` copies the whole dev database and every uploaded file to the server. The dev database
holds demo and test records that must not reach the pilot (pilot-readiness review, 2026-09-30).

## Requested change
A clean copy for the pilot, leaving the dev database untouched.

Owner decisions (2026-10-01):
- Leave out both demo fight nights (Sat 3 Oct 2026, Published, 6 bouts; Sat 10 Oct 2026, Draft, 2 bouts) and
  the 9 demo officials (`demo.referee1–3`, `demo.judge1–6`).
- Keep all 27 active fighters and all 5 clubs.
- Leave out the test fan account and Bun Sothea's half-filled private record (ID type only, no scans, no
  consent).
- The 8 deleted QA/demo fighters are left out as well (no one links to them).

## Scope
In scope: `deploy/pilot-cleanup.sql`, `deploy/export-clean.sh`, README section "Clean copy for the pilot".
Out of scope: changing the dev database; the server itself (no VPS yet); the admin password (changed by the
owner on the server right after the restore — the script cannot know the new one).

## Impact
API / database: none (no schema change; the clean-up only deletes rows in a temporary copy).
Frontend: none.

## Acceptance criteria
- [x] Dev database unchanged after the export (35 fighters incl. deleted, 10 users, 3 events before and after).
- [x] Clean dump restores with `restore.sh`'s own command (`pg_restore --clean --if-exists --no-owner
      --single-transaction`) into an empty database.
- [x] Only the agreed records are gone; the clean-up stops and exports nothing if any count differs.

## Log
### 2026-10-01
- `deploy/pilot-cleanup.sql`: one transaction; deletes the 2 demo events (cards, bouts and event sponsors
  cascade), the 9 demo officials, the 8 deleted fighters, all fans (1) and all private records (1); after
  each step it checks the exact number of rows and at the end checks what must remain (27 fighters, 5 clubs,
  1 event, only the admin account).
- `deploy/export-clean.sh`: copies `kunkhmer_db` into a temporary `kunkhmer_pilot_tmp` in the same Postgres
  container, runs the clean-up there, dumps it with the same exclusions as `export-local.sh` (login sessions,
  Hub logs and rate counters), packs only the uploaded files the clean data still links to (`/api/files/…`),
  and drops the temporary database (also on failure).
- First run: `db_clean_2026-10-01_1001.dump` (165 KB) and `uploads_clean_2026-10-01_1001.tar.gz` (6.0 MB,
  28 of the 32 uploaded files; the 4 left out belonged only to the demo fight nights, e.g. their posters).
  Both are in `deploy/transfer/` (git-ignored).
- Test restore into an empty check database: fighters 27, clubs 5, events 1 (Cambodia World Kun Khmer,
  10 Jul 2026, 1 bout), users 1 (admin), fans 0, private records 0, news 2, videos 3, sponsors 2,
  broadcasters 1, international partners 3, knowledge articles 67, federation page draft 1, settings lists
  14 / 7 / 2 / 8, Hub logs 0, login tokens 0, migrations 21 (same as dev). Check database dropped afterwards.
- Run the export again just before moving, so the copy includes whatever staff enter until then.
- Same day, owner: "I don't want any data from dev to my pilot testing server." The pilot starts empty
  (`deploy/PILOT-RELEASE.md`); the two generated files in `deploy/transfer/` were deleted so they can't be
  copied by mistake. Script and SQL stay for a possible later move (their expected counts would need updating).
