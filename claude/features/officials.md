# Feature: Officials (referees and judges)

| | |
|---|---|
| **Status** | Done — admin Phase 4, 2026-09-26 (see `updates/admin-phase4-roles-officials.md`) |
| **Jira** | n/a |
| **Figma** | n/a |
| **Owner** | vannak070 |

## Goal
KKF keeps a register of its referees and judges, assigns them to bouts, and
each official can sign in to see the bouts they're assigned to.

## Users and roles
- **KKF staff** (Super Admin, KKF Officer): add, edit, deactivate officials;
  assign referee and judges to bouts.
- **Organizer**: sees officials and who is assigned; can't change assignments.
- **Referee / Judge**: signs in to "My bouts" only (read-only).

## Data
Officials are `users` with role `Referee` or `Judge`, plus
`official_grade` ("International A" | "National A" | "National B") and
`official_since` (year started). Bouts: `matches.referee_id` (FK to users) and
`judge_ids` (JSON list of user ids). "Busy" is not stored.

## API (`backend/src/modules/officials/routes.ts`)
| Method | Path | Who | Notes |
|---|---|---|---|
| GET | `/officials` | STAFF, Organizer | `?role=Referee\|Judge`; `?date=YYYY-MM-DD` fills `boutsOnDate` (bouts already that fight night) |
| POST | `/officials` | STAFF | username, fullName, email, password (≥ 8), role Referee/Judge, grade?, since?; 201 |
| PUT | `/officials/:id` | STAFF | fullName, email, role (Referee/Judge only), grade, since, status Active/Inactive, password; non-official id → 404; status or password change signs them out |
| GET | `/officials/me/bouts` | Referee, Judge | their bouts (match shape + `event_name`, `event_location`, `event_status`, `my_role`), date order |

Shape (camelCase): `id, username, fullName, email, role, status, grade, since,
yearsExperience, upcomingBouts, boutsOnDate`.

## Business rules
- Only KKF staff set `refereeId` / `judgeIds` on `POST`/`PUT /matches`; an
  Organizer sending a *change* gets 403 (sending the unchanged values is fine).
- Referee must be an active Referee account; judges active Judge accounts, no
  one twice, referee not also a judge, at most 5 judges → 422 otherwise.
- Busy is informational: a referee often works several bouts a night.

## Frontend (admin)
- `pages/Officials.tsx` (`/home/officials`, menu "Officials", `officials.manage`;
  `/home/kkf-officers` redirects): cards by role, search, show deactivated,
  add/edit dialog (sign-in account + grade + year started), activate/deactivate.
- `hooks/useOfficials.ts`: list, `officialOption` (name · grade · "N bouts that
  night"), `nameOf`. Used by AssignOfficials, BatchDetail, MatchDetail,
  MatchesEnhanced. Assign controls need `officials.assign` (staff).
- `pages/MyBouts.tsx` (`/home/my-bouts`): Referee/Judge home — coming up and
  earlier bouts with their role, fighters, clubs, venue, rules and result.

## Tests
`api-tests/tests/officials.test.ts`; assignment rules in `matches.test.ts`
("referees and judges").

## Open questions / gaps
- Changing an official's role (Referee ↔ Judge) doesn't touch bouts they are
  already assigned to.
- Judges can't enter scorecards yet.
