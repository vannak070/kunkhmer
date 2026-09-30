# Feature: Auth and user management

| | |
|---|---|
| **Status** | Done — API and admin Users + Profile pages on real data (2026-09-26) |
| **Jira** | n/a |
| **Figma** | n/a |

## Goal
Staff sign in to the admin system; Super Admins manage user accounts and roles.

## Users and roles
| Role | Can |
|---|---|
| Super Admin | everything, incl. user management |
| KKF Officer | federation staff: verify fighters, results, titles, content, partners |
| Organizer | create/edit own events and their fight cards and bouts (becomes the event organizer); no fighter registration |
| Club/Gym | tied to one club (`club_id`): manage own fighters, respond to own matches |
| Referee, Judge | match officials (grade, year started); see "My bouts" only — managed by KKF staff on the Officials page (`officials.md`) |

## API (`backend/src/modules/auth/routes.ts`)
| Method | Path | Who | Notes |
|---|---|---|---|
| POST | `/users/login` | public | `{username, password}` → `{token, user}`; revokes the user's earlier tokens (single session); only `status: Active` |
| POST | `/users/logout` | auth | revokes current token |
| GET | `/users/me` | auth | current user |
| PUT | `/users/me` | auth | edit own `fullName`, `email` only (role/status ignored) |
| PUT | `/users/me/password` | auth | `{currentPassword, newPassword}`; 422 wrong current / < 8 chars; keeps this session, revokes the user's other tokens |
| GET | `/users` | Super Admin | |
| POST | `/users` | Super Admin | requires username, fullName, email, password, role; 201 |
| GET | `/users/:id` | Super Admin or self | |
| PUT | `/users/:id` | Super Admin | password re-hashed if given; can't set own status to non-Active or own role away from Super Admin (422); a status change or password reset revokes that user's tokens |
| DELETE | `/users/:id` | Super Admin | not own account (422); revokes tokens |

User shape (camelCase): `id, username, fullName, email, role, clubId, status, lastLogin, createdAt`.

## Data
`users` (bcrypt `password_hash`), `personal_access_tokens` (token
`"<id>|<secret>"`, stored as sha256 of the secret; `tokenable_type` "user").

## Frontend
- Admin `pages/Login.tsx` → `api.auth.login`; token + user in `localStorage`;
  a 401 anywhere clears them and redirects to `/login` (`utils/api.ts`).
- Admin maps API roles to UI roles in `data/users.ts#getCurrentUser`
  (`Super Admin` → `kkf_super_admin`, …, Referee/Judge → `official`; unknown
  roles → `none`, no access). UI permissions: `ROLE_PERMISSIONS` there, via
  `hooks/usePermissions.ts`. Menu items need a permission; `components/Layout.tsx`
  also guards pages by the same permissions (plus `PAGE_GUARDS` for create/edit
  screens) and shows "Not available for your role"; signed-out visitors go to `/login`.
- `pages/UserManagement.tsx` ("Staff accounts", Super Admin): real `/users` list with search,
  role and status filters, a roles guide, add/edit dialog (generated password, club picker
  for Club/Gym, reset password, "Can sign in" toggle), Deactivate / Reactivate, and
  "Delete permanently" (confirm) inside Edit. Old deep links `/user-management/new`,
  `/:id`, `/:id/edit` open the dialog. You can't deactivate, demote or delete yourself.
- `pages/Profile.tsx` ("My profile"): `/users/me`, edit name + email, change password, sign out.
- `components/Layout.tsx`: light sidebar grouped (Competition, Content & partners,
  Administration), user card linking to My profile, phone menu drawer + "Menu" tab.
  Sign out calls `POST /users/logout` (`api.auth.logout`), then clears storage.

## Business rules
- Login and user writes never return `password_hash`.
- Username and email are unique (422 on duplicates).

## Tests
`api-tests/tests/auth.test.ts`

## Open questions / gaps
- Login rate limiting; minimum password length is only
  enforced for own password changes and in the admin UI (the API create/reset don't check it).

Ended sessions: any answer to a request that carried a dead staff token gets the header `X-Session-Expired: 1` (public routes too); the admin then signs out and shows the login page with a notice (`updates/session-expired.md`).
