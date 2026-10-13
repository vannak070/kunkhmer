# Update: Fighter medical status and suspension (Program workflow, phase 2)

| | |
|---|---|
| **Status** | Done (2026-10-13) |
| **Jira** | n/a |
| **Feature** | claude/features/program-workflow.md (phase 2), claude/features/fighter-personal-records.md |
| **Requested by** | vannak070 ("go" on phase 2) |

## Current behavior (before)
`fighters.medical_status` (default "Cleared") and `fighters.suspension_end_date` existed but nothing could set
them, so the two matching rules for them were switched off.

## Requested change
- **API** (staff only): `GET /fighters/:id/private` also returns `medicalStatus` and `suspensionEndDate`;
  `PUT /fighters/:id/private` accepts them (`medicalStatus` ∈ Cleared · Pending · Not Cleared · Injured, `""` is a
  422; `suspensionEndDate` a date, `""` / null clears). They are saved on the fighter row (same transaction as
  the private details). Club/Gym and the public never see or set them through these routes.
- **Rules**: migration `20261013050000_matching_rules_medical_on` switches the **medical** and **suspension**
  matching rules on. A fighter whose own status is Injured / Suspended is also caught by those two rules (the
  admin's Add bout list already offered Active fighters only, the API did not enforce it).
- **Admin**: Add / Edit Fighter, section "Personal & medical details": a visible "Fit to fight" block with
  Medical status and "Suspended until"; the fighter page "Personal details" tab shows both. The "keep off for
  now" note on the Matching rules tab is gone. EN + KM (Khmer for KKF review).

## Impact
API: two additive fields on the staff-only private record (snapshot gains 4 lines, no other shape changes);
new 422 cases on bout creation for injured / suspended / not-cleared fighters. Database: data-only migration.

## Open (owner decision)
- `GET /fighters` and nested fighter rows are **public** and already return `medical_status` and
  `suspension_end_date` (snake_case rows). Now that staff can set them, a fighter's medical status and
  suspension date become visible to anyone. Decide: leave (sports suspensions are often public), hide for
  non-staff, or hide only `medical_status`. Not changed — it alters public response shapes.
- "Retired" fighters are not blocked by the matching rules (only Injured / Suspended are).

## Acceptance criteria
- [x] Staff set and clear both values; invalid status → 422; Club/Gym → 403 (contract tests).
- [x] A not-cleared / injured / suspended fighter cannot be matched; clearing them allows it again.
- [x] Typecheck clean; full suite 294/294 (`CI=true`); admin build passes; edit → save → Personal details tab checked in the browser (desktop, English).
- [ ] Khmer / phone width of the new block not browser-checked.

## Log
### 2026-10-13
- `fighters/private.ts` (shape + PUT), `matches/rules.ts` (status check), migration, admin `PrivateDetails.tsx`,
  `MatchingRulesPanel.tsx`, `i18n/program.ts`; tests in `fighter-private.test.ts` and `matches.test.ts`.
- Found while testing: demo fighters have a height outside the form's 100–250 cm range, so saving an existing demo
  fighter in the admin needs the height corrected first (data issue, not changed).
