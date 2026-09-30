# Update: Ended sign-in → "please sign in again" (not "not found")

| | |
|---|---|
| **Status** | Done (not committed) — waiting for owner review |
| **Jira** | n/a |
| **Feature** | claude/features/auth-users.md |
| **Requested by** | vannak070 (2026-09-30: "fix the session expiry" — open item from `program-simple-forms.md`) |

## Current behavior
Staff tokens have no time limit, but a session ends when the same account signs in elsewhere
(single-session policy), the password changes, or the user signs out. The browser keeps sending the
old token. Protected routes answer 401 and the admin goes to the login page — but many admin screens
read **public** routes (`GET /events/:id`, `/matches`, `/fighters` …) where a dead token just counts
as "anonymous": a draft fight night comes back **404 "not found"**, draft fighters / bouts disappear
from lists, and the officer isn't told the session ended.

## Change
- **API** (`lib/auth.ts` + `app.ts`): when a request carries a staff bearer token that is not valid
  any more (unknown, revoked, expired, user deleted), the answer gets the header
  **`X-Session-Expired: 1`** — on every route, public ones included. The body and status are unchanged
  (the public site ignores the header). Fan `kkf_` tokens are never flagged.
- **Admin** (`utils/api.ts`): any answer with that header (or a 401 while a token was stored) clears the
  stored sign-in and goes to `/login?expired=1`; the login page explains, in English and Khmer:
  "Your session has ended — maybe you signed in on another device. Please sign in again."

## Impact
API: one new response header, no body/shape change. Database: none. Frontend: admin only.

## Acceptance criteria
- [x] Dead staff token on a public route → 200/404 as before plus `X-Session-Expired: 1`; valid / no /
  fan token → no header. Contract test.
- [x] Admin with a dead token → login page with the message instead of "not found".
- [x] Typecheck, full suite, admin build.
- [ ] Owner review.

## Log
### 2026-09-30
- Backend: `lib/auth.ts` `resolveUser` sets `request.staleToken` when a staff bearer token doesn't lead to a
  user (unknown / revoked / expired / user gone); `app.ts` `onSend` hook adds `X-Session-Expired: 1`. Fan
  `kkf_` tokens are skipped. New test in `auth.test.ts` (own actors; second login revokes the first token):
  valid → no header; revoked → 200 on `/events` + header, 401 on `/users/me` + header; junk token → header;
  no token / fan token → none. Suite **268/268** (CI mode), typecheck clean, no snapshot changed.
- Admin: `utils/api.ts` `sessionEnded()` (header, or 401 while a token was stored) clears the sign-in and goes to
  `/login?expired=1` — used by `request()` and the staff-assistant stream; `Login.tsx` shows an amber notice,
  string `login.expired` (EN + KM, follows the officer's saved language). Changed files type-check; admin builds.
- Browser (temporary admin on the test API): signed in, created a draft fight night, signed in again elsewhere →
  the old token got **404 + X-Session-Expired** on the draft; opening the fight night page then landed on
  `/login?expired=1` with the message (EN and KM) and no "not found".
