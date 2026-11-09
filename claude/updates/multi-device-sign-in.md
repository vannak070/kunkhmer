# Update: Signed in on several devices

| | |
|---|---|
| **Status** | Done 2026-11-09 (uncommitted, not live) |
| **Jira** | n/a |
| **Feature** | Staff accounts / security (`claude/config.md` Security) |
| **Requested by** | Owner ("start 2 and 6", recommendations accepted) |

## Current behavior
Signing in revoked every earlier token (single session): an officer signing in on the laptop was thrown out on
the phone. Tokens never expired. A deactivated account's token kept working (only officials were signed out).

## Requested change
- Signing in keeps other devices signed in; at most **5 sessions** per staff account (a new one removes the session
  unused the longest).
- A session **unused for 30 days** ends (and is deleted on its next use).
- Each session is named after its device from the User-Agent ("Chrome on Android", "Safari on iPhone").
- Profile › **Signed-in devices**: device, last used, "This device", Sign out (one), Sign out all other devices.
  Only one's own devices (no Super Admin view).
- A **deactivated** account's sessions stop working (the token check now requires status Active). Super Admin
  status/password changes already signed the user out everywhere; changing one's own password keeps this device.

## Impact
- API (additive): `GET /users/me/sessions` → `[{ id, device, lastUsedAt, signedInAt, current }]`,
  `DELETE /users/me/sessions/:id` (own only, else 404), `POST /users/me/sessions/sign-out-others` → `{ signedOut }`.
  Login response unchanged. No migration (`personal_access_tokens.name` / `last_used_at` reused).
- Code: `backend/src/lib/auth.ts` (`MAX_SESSIONS`, `IDLE_DAYS`, `deviceLabel`, `listSessions`, status check),
  `modules/auth/routes.ts`; admin `pages/Profile.tsx` (`Devices`), `utils/api.ts`, i18n `dev.*`, `login.expired`.
- Fan accounts (`kkf_` tokens) unchanged.

## Log
- 2026-11-09: built. Tests `api-tests/tests/sessions.test.ts` (device names, limit 5, sign out one / others, own
  only, deactivated) + `auth.test.ts` updated (two logins both valid; the X-Session-Expired test now ends the
  session with "sign out others"). Idle expiry checked by hand on the test DB (last used 31 days ago → 401, row
  deleted). Browser check on the test API: device list, "This device", sign out others → only this device left.
- 2026-11-09: tie-break fix — sessions with the same whole-second time are ordered by id (newer = more recent), so the 6th sign-in always ends the oldest one; the test was failing about 1 run in 3 (`lib/auth.ts` `byRecent`).
