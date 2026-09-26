# Update: Admin Users + Profile on real data, friendlier admin look

| | |
|---|---|
| **Status** | Done |
| **Jira** | n/a |
| **Feature** | claude/features/auth-users.md |
| **Requested by** | vannak070 |

## Current behavior
- `frontend/admin/src/app/pages/UserManagement.tsx` (3,255 lines) shows mock
  users from `data/users.ts`; nothing is saved.
- `pages/Profile.tsx` shows mock details (fake phone) and no password change.
- The API has full Super Admin user CRUD, but no way for a user to edit their
  own name/email or change their own password.
- Admin sidebar (`components/Layout.tsx`) is a heavy dark-blue panel; the
  owner finds the admin hard to manage.

## Requested change
- Users page on the real `/users` API: list, search, filter, add, edit
  (role, club for Club/Gym, status), reset password, **deactivate first**
  (status Inactive, can't sign in) and a separate **delete permanently** with
  confirmation. You can't deactivate or delete yourself.
- Profile page on `/users/me`: edit own name + email, change own password
  (current password required), sign out.
- New endpoints: `PUT /users/me` {fullName, email} and
  `PUT /users/me/password` {currentPassword, newPassword}.
- Light, friendly sidebar menu like the public site (applies to every admin
  page). Dashboard and other pages are restyled later, one step at a time.

## Scope
Out of scope: other admin pages' data/design, KKF Officers, login rate limiting.

## Impact
- API: two new endpoints (contract tests + snapshots); existing shapes unchanged.
- Database: none.
- Frontend: admin UserManagement, Profile, Layout, `utils/api.ts`.

## Acceptance criteria
- [x] Users page lists real accounts; add/edit/deactivate/reactivate/delete work and persist.
- [x] Profile shows the signed-in user; name/email and password changes persist; wrong current password is rejected.
- [x] Light sidebar on every admin page; desktop + phone.
- [x] `npm run typecheck` + full contract suite pass; admin `vite build` passes.

## Log

### 2026-09-26
- Backend `modules/auth/routes.ts`: `PUT /users/me`, `PUT /users/me/password`;
  `PUT /users/:id` blocks self-deactivate / self-demote and revokes the target's
  tokens on a status change or password reset.
- Tests: 8 new cases in `api-tests/tests/auth.test.ts` (+1 snapshot). Full suite
  160/160 with `CI=true`; backend `npm run typecheck` clean.
- Admin: `UserManagement.tsx` rewritten (3,255 → ~570 lines, real data),
  `Profile.tsx` rewritten, `Layout.tsx` light grouped sidebar + phone drawer,
  `utils/api.ts` (`logout` revokes on the server, `me`, `updateMe`, `changePassword`).
- Verified in the browser (1440×900 and 375×812): list shows the real single
  admin account; add (validation incl. Club/Gym club), deactivate, delete
  permanently all persisted (test account removed afterwards); Profile shows
  real details, wrong current password rejected; phone menu works, no
  horizontal scroll. Admin `vite build` + `tsc` clean for changed files.
- Not changed: header search and bell (still placeholders), Dashboard design.

