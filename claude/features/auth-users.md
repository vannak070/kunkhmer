# Feature: Auth and user management

| | |
|---|---|
| **Status** | Done (API); admin User Management page still on mock data |
| **Jira** | n/a |
| **Figma** | n/a |

## Goal
Staff sign in to the admin system; Super Admins manage user accounts and roles.

## Users and roles
| Role | Can |
|---|---|
| Super Admin | everything, incl. user management |
| KKF Officer | federation staff: verify fighters, results, titles, content, partners |
| Organizer | create/edit events, batches, matches (becomes the event organizer) |
| Club/Gym | tied to one club (`club_id`): manage own fighters, respond to own matches |
| Referee, Judge | accounts exist for match officials; no write access yet |

## API (`backend/src/modules/auth/routes.ts`)
| Method | Path | Who | Notes |
|---|---|---|---|
| POST | `/users/login` | public | `{username, password}` → `{token, user}`; revokes the user's earlier tokens (single session); only `status: Active` |
| POST | `/users/logout` | auth | revokes current token |
| GET | `/users/me` | auth | current user |
| GET | `/users` | Super Admin | |
| POST | `/users` | Super Admin | requires username, fullName, email, password, role; 201 |
| GET | `/users/:id` | Super Admin or self | |
| PUT | `/users/:id` | Super Admin | password re-hashed if given |
| DELETE | `/users/:id` | Super Admin | not own account (422); revokes tokens |

User shape (camelCase): `id, username, fullName, email, role, clubId, status, lastLogin, createdAt`.

## Data
`users` (bcrypt `password_hash`), `personal_access_tokens` (Sanctum format:
token `"<id>|<secret>"`, stored as sha256 of the secret).

## Frontend
- Admin `pages/Login.tsx` → `api.auth.login`; token + user in `localStorage`;
  a 401 anywhere clears them and redirects to `/login` (`utils/api.ts`).
- Admin maps API roles to UI roles in `data/users.ts#getCurrentUser`
  (`Super Admin` → `kkf_super_admin`, …; unknown roles such as Referee fall
  back to `club`). UI permissions: `ROLE_PERMISSIONS` there, via `hooks/usePermissions.ts`.
- `pages/UserManagement.tsx` and `pages/Profile.tsx` use **mock data**, not the API.

## Business rules
- Login and user writes never return `password_hash`.
- Username and email are unique (422 on duplicates).

## Tests
`api-tests/tests/auth.test.ts`

## Open questions / gaps
- Connect UserManagement and Profile to the API.
- Login rate limiting; password-change-own-account endpoint; Referee/Judge UI roles.
