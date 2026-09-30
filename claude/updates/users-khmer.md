# Update: Users page in Khmer

| | |
|---|---|
| **Status** | Done (2026-09-30, uncommitted) — waiting for owner review; KKF to review the Khmer wording |
| **Jira** | n/a |
| **Feature** | claude/features/auth-users.md, claude/updates/admin-menu-khmer.md |
| **Requested by** | vannak070 (2026-09-30: "translate the Users page to Khmer") |

## Current behavior
Users / "Staff accounts" (`pages/UserManagement.tsx`, `/home/user-management`, Super Admin only) is English
only.

## Requested change
With Khmer chosen the page shows Khmer: heading and intro, the "What can each role do?" guide, search and
filters, the table / phone cards (role, status, last sign-in, Edit / Deactivate / Reactivate), the Add / Edit
dialog with its field checks and hints, the three confirmation dialogs and every message.
- Names, usernames and emails stay as typed.
- Role names: "Super Admin" and "KKF Officer" stay in Latin letters (as in the blocked-page message);
  Organizer, Club/Gym, Referee and Judge are shown in Khmer. Stored role values are unchanged.

## Scope
Out of scope: English wording and layout (unchanged); the role descriptions that only apply with approvals
switched on (they stay English, like the approval-only to-dos on the Dashboard); error text written by the
API; the role shown under the user's name in the side menu and on the Profile page.

## Impact
API / database: none. Frontend: `pages/UserManagement.tsx`, `i18n/program.ts` (`users.*`).

## Acceptance criteria
- [x] Page, dialogs and messages fully Khmer after switching, unchanged in English.
- [x] Desktop and phone width; admin build passes.

## Log
### 2026-09-30
- `i18n/program.ts`: 88 new strings EN + KM (`users.*`); Referee / Judge reuse `off.role.*`, plus
  `common.edit`, `common.cancel`, `common.saving`, `common.tryAgain`.
- `pages/UserManagement.tsx`: every text through `useT()`; `roleLabel` / `roleText` give the role name and
  description per language; "last sign-in" ("3 h ago", "Never") written per language with Khmer digits and the
  Khmer date for older sign-ins; table heading drops capitals and letter spacing in Khmer.
- Checked on a temporary admin on the test API with six sample accounts (one per role, one deactivated):
  English identical to before; Khmer complete at 1280 px and 375 px (roles guide, list, add dialog with its
  field checks, deactivate confirmation and message), no sideways scroll. Admin `vite build` passes; changed
  files add no TypeScript errors.
