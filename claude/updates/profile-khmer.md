# Update: Profile page in Khmer

| | |
|---|---|
| **Status** | Done (2026-09-30, uncommitted) — waiting for owner review; KKF to review the Khmer wording |
| **Jira** | n/a |
| **Feature** | claude/features/auth-users.md, claude/updates/users-khmer.md |
| **Requested by** | vannak070 (2026-09-30: "translate the Profile page to Khmer") |

## Current behavior
"My profile" (`pages/Profile.tsx`, `/home/profile`, every account) is English only.

## Requested change
With Khmer chosen the page shows Khmer: heading and intro, the summary card (role and what it can do, Sign
out), "Your details" (labels, last sign-in, the "ask a Super Admin" note, Save), "Change password" (labels,
hint, the field checks) and every message.
- Name, username and email stay as typed. Role names follow the Users page ("Super Admin" / "KKF Officer"
  stay in Latin letters; the other four in Khmer).

## Scope
Out of scope: English wording and layout (unchanged); role help that only applies with approvals on (stays
English); error text written by the API; the role under the name in the side menu (still English).

## Impact
API / database: none. Frontend: `pages/Profile.tsx`, `i18n/program.ts` (`prof.*`).

## Acceptance criteria
- [x] Page and messages fully Khmer after switching, unchanged in English.
- [x] Desktop and phone width; admin build passes.

## Log
### 2026-09-30
- `i18n/program.ts`: 24 new strings EN + KM (`prof.*`); heading and Sign out reuse `frame.profile` /
  `frame.signOut`, labels and role names reuse `users.*` / `off.role.*`, plus `common.saving`.
- `pages/Profile.tsx`: every text through `useT()`; last sign-in in Khmer is the Khmer date plus the time in
  Khmer digits (English keeps the browser format).
- Checked on a temporary admin on the test API, signed in as a sample Organizer: English identical to before;
  Khmer complete at 1280 px and 375 px (summary, both forms, password check message), no sideways scroll.
  Admin `vite build` passes; changed files add no TypeScript errors.
