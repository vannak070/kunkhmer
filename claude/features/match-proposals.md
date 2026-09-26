# Feature: Match proposals (club confirmation) — admin Phase 3b

| | |
|---|---|
| **Status** | Done — 2026-09-26 |
| **Jira** | n/a |
| **Figma** | n/a |
| **Owner** | vannak070 |

## Goal
When a bout is put on a fight card, both fighters' clubs are asked to accept
it. Clubs accept or decline (with a reason) from a real Match Proposals page;
organizers and KKF see which bouts are confirmed and fix the declined ones.

## Users and roles
- **Organizer / STAFF**: create bouts (existing "Create match" on a fight
  card). A new bout goes out to both clubs. See responses, swap a fighter
  after a decline (the bout is sent again), or delete it.
- **Club/Gym**: see bouts that involve their fighters; Accept or Decline
  with a reason. Nothing else on a match (today they can edit any field —
  this closes that).
- **KKF Officer / Super Admin**: can answer for a club (e.g. after a phone
  call); who answered is recorded.
- **Public**: sees a bout only once both clubs accepted it (or it has a result).

## Behavior before this feature
- `matches.proposal_status` (default `draft`) and `club_a_response` /
  `club_b_response` (default `pending`) exist; demo data uses `accepted`.
  No endpoint drives them; the admin `CreateMatchFromBatch` sends the defaults.
- `PUT /matches/:id` lets a Club/Gym change **any** field of a match that has
  one of its fighters (fighters, status, winner, …).
- `MatchProposals.tsx` (`/home/match-proposals`) runs on `MOCK_MATCHES` and is
  hidden from the menu (`matches.view_proposals` granted to no role).
- Fans following a fighter get "bout scheduled" as soon as the bout is created.

## API
| Method | Path | Who | Notes |
|---|---|---|---|
| POST | `/matches` | STAFF, Organizer | unchanged input; new bouts start `pending` for each side with a club (a side without a club starts `accepted`); proposal fields in the body are ignored |
| POST | `/matches/:id/respond` | Club/Gym (own side), STAFF | `{response: "accepted" \| "declined", note?, side?: "a" \| "b"}`; note required when declining; no `side` = every side the caller may answer (staff: both) |
| PUT | `/matches/:id` | STAFF, Organizer | Club/Gym removed (403); proposal fields ignored. Changing a fighter (must be verified) resets that side's answer |
| GET | `/matches/proposals` | Club/Gym, STAFF, Organizer | a club gets bouts with its fighters, others all; `?state=pending\|accepted\|declined`; each row is the match shape plus `event_name`, `event_status` |
| GET | `/matches[/:id]` | public | without a staff token: only bouts both clubs accepted, or that have a result (`PUBLIC_BOUT` in `matches/proposals.ts`; the AI tools use it too) |

Match responses gain `club_a/b_note`, `club_a/b_responded_at` (micro),
`club_a/b_responded_by` and flat `club_a/b_responder_name` / `_role`.

`proposal_status` is derived after every response: both `accepted` →
`accepted`; either `declined` → `declined`; else `pending`.

## Data
Migration adding nullable columns per side: `club_a_note` / `club_b_note`
(decline reason), `club_a_responded_at` / `club_b_responded_at`,
`club_a_responded_by` / `club_b_responded_by` (user id). Bouts created before
this feature (`proposal_status = 'draft'`) are marked `accepted` so they stay
public. Match responses gain the six fields (additions only → snapshots
updated deliberately).

## Frontend (admin)
- `pages/MatchProposals.tsx` (`/home/match-proposals?tab=pending|declined|accepted`):
  one card per bout (date, event, fight card, both corners with club and
  answer, rules). Club: Accept / Decline (reason dialog) for its sides, or
  "Change your answer". Staff: Accept / Decline per side on the club's behalf.
  Organizer + staff: "Change fighter" on a declined side (verified fighters
  sorted by closeness to the agreed weight).
- `components/BoutAnswer.tsx`: `proposalOf`, `ProposalBadge`, `BoutAnswerActions`.
- `matches.view_proposals` granted to Super Admin, KKF Officer, Organizer and
  Club/Gym (menu item "Match Proposals").
- Fight card page (`BatchDetail`) and event page: per-bout badge until a result.
- Event "Next steps": the Bouts step counts bouts waiting / declined and links
  here; the Approve & publish step notes how many won't show to fans.
- Dashboard to-dos: club "Bouts to answer"; organizer (own events) and staff
  "Bouts declined by a club" and "Bouts waiting for clubs" (fight night within
  14 days).

## Business rules
- A club answers only for its own side; if both fighters are from the same
  club, one answer covers both sides.
- A side whose fighter has no club is auto-`accepted`.
- A response can be changed until a result is recorded; after that 422.
- Recording a result does not require acceptance (existing results keep working).

## Acceptance criteria
- [x] Contract tests: respond (own side, other club 403, reason required,
      same-club case, no-club auto-accept), club PUT now 403, fighter swap
      resets response, proposals list per role; full suite passes with `CI=true`.
- [x] Admin: club accepts/declines from Match Proposals; organizer sees the
      decline reason on the fight card and swaps a fighter; build passes;
      browser check desktop + phone.

## Tests
`api-tests/tests/matches.test.ts` ("match proposals (club confirmation)") and
`fans.test.ts` (bout announced only once the club accepts).

## Decisions (2026-09-26)
1. No separate KKF approval per bout — the event approval (Phase 3a) is enough.
2. KKF staff may accept/decline on a club's behalf; who answered is recorded.
3. Public site and AI show a bout only when both clubs accepted it (or it has a
   result); fans get "bout scheduled" when it becomes accepted.
4. An event can be published with bouts still waiting/declined; the event
   checklist warns with the count.
- `status` (Draft / Ready to Fight / Completed …) is left as it is; the
  proposal fields carry the club answers.

## Log

### 2026-09-26
- Migration `20260927000004_match_proposals`: six per-side columns + FKs to
  `users`; existing `draft` bouts set to `accepted`. Demo data: the four
  `draft` bouts are now `pending`.
- Backend: `matches/proposals.ts` (rules, `PUBLIC_BOUT`), `POST /matches/:id/respond`,
  `GET /matches/proposals`, create/update rules, public filtering in
  `/matches` and the AI tools, `bout_scheduled` sent on acceptance.
- Tests: 7 new cases in matches, 1 in fans; the old "club edits a match" test
  now expects 403; the matches `newMatch` helper accepts via KKF by default.
  Snapshots: additions only (+ one renamed key). `CI=true` 176/176; typecheck clean.
- Admin: Match Proposals on the API, BoutAnswer component, badges on fight card
  and event pages, checklist notes, dashboard to-dos, permission grants; the
  create-match toast says the bout went to both clubs. Build passes.
- Browser check (temporary club account, deleted after): club dashboard "Bouts
  to answer" → decline needs a reason → declined with reason → admin dashboard
  "Bouts declined" → Change fighter → back to Waiting → KKF accepts for the
  other club (recorded "for the club") → badges on fight card and event
  checklist → club accepts (API) → bout public (404 → 200) and on the fan
  event page. Phone width checked; no console errors.
- Follow-up: organizers can still edit any bout, not only bouts in their own
  events (unchanged) — a candidate for Phase 4 roles.
