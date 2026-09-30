# Update: Role names in Khmer (side menu, Users, Profile)

| | |
|---|---|
| **Status** | Done (2026-09-30, committed 6c28ffa1); KKF to review the Khmer wording |
| **Jira** | n/a |
| **Feature** | claude/updates/admin-menu-khmer.md, claude/updates/users-khmer.md, claude/updates/profile-khmer.md |
| **Requested by** | vannak070 (2026-09-30: "show the role name in the side menu in Khmer"; chose "All roles in Khmer") |

## Current behavior
- The side menu shows the signed-in role under the name as the API names it ("Super Admin"), in both languages.
- Users and Profile show Organizer, Club/Gym, Referee and Judge in Khmer but keep "Super Admin" and
  "KKF Officer" in Latin letters (a choice made during the admin-in-Khmer work, never confirmed).

## Requested change
In Khmer, every role name is Khmer, the same in every place:

| Role (API value) | Khmer |
|---|---|
| Super Admin | អ្នកគ្រប់គ្រងកំពូល |
| KKF Officer | មន្ត្រី KKF |
| Organizer | អ្នករៀបចំ (unchanged) |
| Club/Gym | ក្លឹប (unchanged) |
| Referee | អាជ្ញាកណ្តាល (unchanged) |
| Judge | ចៅក្រម (unchanged) |

Places: the side menu under the name, the "not available for your role" notice, the Users page (filter,
picker, badges, role guide) and Profile. English is unchanged everywhere.

## Scope
Out of scope: the stored role values (API, database, permissions) — translated on screen only; English wording;
role names inside API error messages.

## Impact
API / database: none. Frontend: `i18n/program.ts` (two new keys and one shared role-name lookup),
`components/Layout.tsx`, `pages/UserManagement.tsx`, `pages/Profile.tsx`.

## Acceptance criteria
- [x] Khmer: side menu, Users and Profile show all six roles in Khmer; English unchanged.
- [x] Admin build passes; no TypeScript errors in the changed files.

## Log
### 2026-09-30
- `i18n/program.ts`: new keys `users.role.Super Admin` (អ្នកគ្រប់គ្រងកំពូល) and `users.role.KKF Officer`
  (មន្ត្រី KKF), EN + KM, and a shared lookup `roleNameKey(role)` (API role value → dictionary key; Referee and
  Judge reuse `off.role.*`). Eight Khmer sentences that named "Super Admin" in Latin letters now say
  អ្នកគ្រប់គ្រងកំពូល: `frame.blockedText`, `users.showing`, `prof.askAdmin`, `set.readOnly`, `fed.introOfficer`,
  `kb.locked` (twice), `kb.draftNote`, `kb.introOfficer`. English strings unchanged.
- `components/Layout.tsx`: the role line under the name in the side menu and the "not available for your role"
  notice use `roleNameKey`; an unknown role still shows as the API sends it.
- `pages/Profile.tsx`: the page's own role map removed; the badge uses `roleNameKey`.
- `pages/UserManagement.tsx`: Super Admin and KKF Officer get labels like the other four roles (filter, picker,
  badges, role guide).
- Checked on a throw-away admin (:5188) on the test API: in Khmer the side menu, Users (filter, badge, footer)
  and Profile show អ្នកគ្រប់គ្រងកំពូល; in English all three still say "Super Admin". Admin `vite build` passes;
  the changed files have no TypeScript errors.
