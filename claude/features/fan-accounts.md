# Feature: Fan accounts

| | |
|---|---|
| **Status** | Done — API `0fec0f75`, public-site UI `2643d65f`; email delivery not built |
| **Jira** | TBD |
| **Figma** | TBD |

## Goal
Visitors to the public site can create an account, follow fighters, and get
in-app notifications when a followed fighter's bout is scheduled or decided.

## Users and roles
- **Fan**: public-site account, completely separate from staff `users`.
  A fan token can never reach a staff route, and a staff token never works on
  fan routes (`resolveUser` skips `kkf_` tokens; fan routes only accept them).
- Staff actions (creating a match, recording a result) trigger notifications.

## API (`backend/src/modules/fans/routes.ts`)
| Method | Path | Who | Notes |
|---|---|---|---|
| POST | `/fans/register` | public | `{email, password, displayName, language?, notifyEmail?}` → 201 `{token, fan}` |
| POST | `/fans/login` | public | `{email, password}` → `{token, fan}`; 401 on bad credentials |
| POST | `/fans/logout` | fan | revokes the current session |
| GET | `/fans/me` | fan | |
| PUT | `/fans/me` | fan | `displayName`, `language`, `notifyEmail`, `newPassword` + `currentPassword` |
| DELETE | `/fans/me` | fan | `{password}`; follows, sessions, notifications cascade |
| GET | `/fans/me/follows` | fan | followed fighters (id, names, image, record, clubName, followedAt) |
| PUT | `/fans/me/follows/:fighterId` | fan | follow; idempotent; 404 for unknown/deleted fighter |
| DELETE | `/fans/me/follows/:fighterId` | fan | unfollow; idempotent |
| GET | `/fans/me/notifications` | fan | `?limit=` (default 30, max 100) → `{items, unreadCount}` |
| POST | `/fans/me/notifications/read` | fan | `{ids}` marks those read; no `ids` marks all |
| GET | `/fighters/:id/followers` | public | `{count}` |

Fan shape (camelCase): `id, email, displayName, language, notifyEmail, createdAt`.
401 for fan routes is `{ success: false, error: "Please sign in" }`.
Notification: `{id, type, data, read, createdAt}`.

KUNKHMER HUB (Phase D3): the fan token is also accepted on `POST /ai/chat[/stream]`, so the Hub can
answer about the fan's followed fighters (`updates/hub-phase-d3-personal-answers.md`); nothing about
the fan goes to the model or the log except a signed-in yes/no flag.

## Data (migration `20260927000000_fan_accounts`)
- `fans`: unique lowercase `email`, bcrypt `password_hash`, `language`
  (`en`/`km`), `notify_email`.
- `fan_sessions`: `token_hash` (sha256 of `kkf_` + 32 random bytes), expires after 90 days.
- `fan_follows`: (fan, fighter) primary key.
- `fan_notifications`: `type` `bout_scheduled` | `bout_result`, `data` (JSONB),
  `read_at`; unique (fan, type, match, fighter) so re-saves don't repeat.
  `seq` (migration `20260927000001_fan_notification_order`) records insertion
  order: `created_at` is whole seconds, so lists sort by `created_at, seq`.

## Business rules
- Email is trimmed and lowercased; password ≥ 8 characters; display name 2–50.
- A password change signs out the fan's other sessions.
- Brute-force protection (`lib/fanAuth.ts`): max `FAN_RATE_LIMIT` (default 10)
  attempts per 15 minutes per IP (register) and per IP + email (login) → 429.
  In memory, per process.
- **Notifications** (`modules/fans/notify.ts`), for followers of either fighter:
  - `bout_scheduled` when a bout becomes accepted by both clubs (on create if neither
    fighter has a club, else on `POST /matches/:id/respond` or a fighter swap in
    `PUT /matches/:id`, see `match-proposals.md`); `POST /matches/:id/result` → `bout_result`
    with `outcome` (`win`/`loss`/`draw`, `nc` for method "No Contest"), `method`, `round`.
  - `data` stores facts (both fighters' names in English and Khmer, event,
    date, status, title match), not sentences — the site renders them in the
    fan's language.
  - Failures are logged and never block the match action.

## Frontend (public site, `frontend/public/src/app/`)
- `utils/fanApi.ts`: separate client with its own token (`localStorage`
  `kk-fan-token`). Never use `utils/api.ts` for fans: it sends the staff token
  and redirects to `/login` on 401.
- `contexts/FanContext.tsx` (`useFan()`): session restore, follows (optimistic,
  rolled back on failure), notifications polled every 60 s while the tab is
  visible, any 401 signs out locally. The profile `language` wins on sign-in and
  restore; the header language switch saves back to the profile.
- `components/layout/HeaderAccount.tsx`: "Sign in" link or the fan's initial,
  plus the notification bell. `useNotificationText()` renders `data` in the
  current language and links to the event.
- `components/fan/FollowButton.tsx` on fighter profiles (with follower count);
  signed-out visitors go to `/account?next=<path>` (same-site paths only).
- `pages/Account.tsx` at `/account`: sign in / create account; signed in:
  followed fighters, profile (name, language, email preference), password
  change, account deletion.

## Base code
`lib/fanAuth.ts` (tokens, `requireFan`, rate limit), `modules/fans/routes.ts`,
`modules/fans/notify.ts`, hooks in `modules/matches/routes.ts`.

## Tests
`api-tests/tests/fans.test.ts`: sign-up/in/out, token
separation, profile, follows, notifications. 14/14 pass.

## Open questions / review notes
- `notifyEmail` uses `Boolean(...)`, so the string `"false"` counts as true;
  `parseBool()` from `lib/input.ts` would match the rest of the API.
- `notify_email` is stored but no email is sent yet — only in-app notifications.
- Correcting a result to a different winner doesn't update the earlier
  `bout_result` notification (the unique index skips it).
- Rescheduling or cancelling a match (`PUT /matches/:id`) doesn't notify.
- Expired `fan_sessions` rows are never deleted.
- Rate limiting is per process; it needs a shared store if the API runs as
  more than one instance. Staff login (`/users/login`) has no rate limit —
  `checkRateLimit` could be reused there.
