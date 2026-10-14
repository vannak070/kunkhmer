# Update: KKF ID for every fighter, optional personal details, and a hard block on exact duplicates

| | |
|---|---|
| **Status** | Done (2026-10-14, uncommitted) |
| **Jira** | n/a |
| **Feature** | claude/features/fighters.md, claude/features/fighter-personal-records.md |
| **Requested by** | Owner (screenshot of "Personal & medical details": "make them as optional. when add fighter, they will have their own KKF_ID. it is the logic to protect duplicate fighter") |

## Current behavior
- Add Fighter requires ID type, ID / passport number, emergency contact name and phone (admin only; the API never
  required them — `PrivateDetails.tsx` `missingRequired`).
- No fighter number of KKF's own. Duplicate protection: one ID number per fighter (`updates/fighter-id-merge.md`)
  plus a warning for similar names / same birth date that can be overridden (`updates/duplicate-fighter-warning.md`).

## Requested change (decisions 2026-10-14)
1. **Personal details optional.** No field in "Personal & medical details" is required. If an ID number is typed,
   the one-number-per-fighter check still applies. The "no ID number" / "no emergency contact" warnings stay (lists,
   Add bout).
2. **KKF ID** — `KKF-000123`: one running number, at least 6 digits, given by the database when a fighter is saved
   (**changed 2026-10-14, later: KKF staff can change it** — see the Log; deleted and merged fighters keep theirs). Existing fighters are numbered in the order
   they were registered. Shown in the admin only: fighter page, Fighters list, header search; staff can search by it.
3. **Hard block on exact duplicates.** Saving is refused when another (not deleted) fighter has the **same Khmer name
   and the same date of birth** (spaces ignored). Add / Edit Fighter shows the fighter with a link and won't save. Similar
   names stay a warning. Checked on create, and on edit only when the Khmer name or birth date changes (so an existing
   duplicate pair can still be edited — fix one or merge them). Fighters without a Khmer name or birth date (foreign
   guests) aren't checked.

## Impact
- Database: migration — sequence `fighter_kkf_seq`, function `kkf_next_id()`, column `fighters.kkf_id` (unique,
  not null, default `kkf_next_id()`), existing rows backfilled.
- API (additive): `kkfId` in the fighter shape, `kkf_id` in nested fighter rows (snapshot additions); `GET
  /fighters/:key` accepts a KKF ID; `/fighters/page?q=` and `/search` match it; `POST` / `PUT /fighters` → 422 on an
  exact duplicate.
- Admin: PrivateDetails (no required fields), AddFighter (block box), FighterDetail, Fighters list, header search.
- Tests: fighters created in tests get unique Khmer names (many shared "x" + 2000-01-01).

## Acceptance criteria
- [x] A fighter can be registered without ID or emergency contact.
- [x] Every fighter has a KKF ID; new ones count up; numbers aren't reused after delete.
- [x] Same Khmer name + birth date is refused (API + form), other cases allowed.
- [x] Contract suite passes with `CI=true`; typecheck; admin build; browser check.

## Log
- 2026-10-14: migration `20261014160000_fighter_kkf_id` (sequence + `kkf_next_id()` + unique `fighters.kkf_id`,
  existing fighters numbered by registration order; dev DB: 234 fighters → KKF-000001…000234; dev backup before:
  `~/Backups/kunkhmer-dev-before-kkf-id-2026-10-14.dump`). Backend: `kkfId` / `kkf_id` in the fighter shapes and in the
  similar-fighters result, lookup by KKF ID, `/fighters/page?q=` and `/search` match it, `refuseExactDuplicate` on create
  and on edit when the Khmer name / birth date changes; the demo-data loader gives each fighter a KKF ID.
  Admin: no required personal fields (`validatePrivate`), red "already registered" box + blocked save in Add Fighter, KKF
  ID on the fighter page / list rows / header search, list search by KKF ID; `dup.exact*`, `kkf.idHint` (EN + KM).
- Tests: new `fighter-kkf-id.test.ts` (10). About 55 fixtures across 22 test files now use a unique Khmer name
  (many shared "x" or "គុន" with the same birth date, which the new rule refuses); three tests that compared a literal
  Khmer name now use `stringContaining`. Snapshots: additions of `kkf_id` / `kkfId` only (nothing removed).
  `CI=true` 392/392 on a fresh test database; backend typecheck clean; admin build OK.
- Known quirk (not new): the `week-checks` snapshot lists every check found in the 2032 week, including events left by
  earlier suite runs, so it fails after several runs on the same test database — restart `backend-test` (it rebuilds
  its database) and it passes.
- Browser check on the test API (throw-away admin on :5190): same Khmer name + birth date → red box with the KKF ID and
  the save refused; a different birth date → registered with no ID / emergency contact, KKF-000505 on the profile; list
  row shows the number and "Missing details" is kept; list search and header search find a fighter by KKF ID.
- 2026-10-14 (later, owner: "I cannot find Fighter ID here"): Add / Edit Fighter now has a read-only **KKF ID** box at the top
  of the form — "Given when you save" on a new fighter (with a one-line explanation), the real number on Edit — and the
  "registered" message after saving shows it. Keys `kkf.idLabel`, `kkf.idNew`, `kkf.idNote` (EN + KM). Admin build OK;
  checked in the browser on the test API.
- 2026-10-14 (later still, owner: "The ID should display when or auto generate when create Fighter. However, admin or super
  admin can change it"): the Register form shows the **next number while registering** (`GET /fighters/next-kkf-id`, a preview)
  in an editable box for KKF staff (read-only for clubs); Edit Fighter shows the stored number, editable by staff.
  `POST` / `PUT /fighters` accept `kkfId` from Super Admin and KKF Officer (read as "admin or super admin"): `KKF-` + 4–12
  digits, upper-cased, unique across all fighters (422 "The KKF ID KKF-000001 is already used by …"); clubs' `kkfId` is
  ignored. Migration `20261014170000_kkf_id_generator_skips_taken` makes `kkf_next_id()` skip numbers already taken.
  Tests rewritten (13 in `fighter-kkf-id.test.ts`). Checked in the browser on the test API: proposed number shown, custom
  `kkf-050000` saved as KKF-050000 and shown in the message, a taken number refused under the field on Edit.

