# Update: Phase 3a — real approvals (fighters, club self-registration, events)

| | |
|---|---|
| **Status** | In progress |
| **Jira** | n/a |
| **Feature** | fighters.md, events.md, clubs.md, auth-users.md |
| **Requested by** | vannak070 |

## Decisions (2026-09-26)
1. Events: Organizers create a Draft and **submit for approval**; KKF Officer or
   Super Admin **approves** (who + when recorded) or **sends it back** with a
   comment. Organizers can publish only an Approved event; KKF staff can publish
   directly.
2. Fighters: KKF Officers and Super Admin verify, or send back with a reason.
3. Clubs register their own fighters; they wait for KKF verification and can't
   be matched until verified.
Match Proposals with club confirmation is Phase 3b.

## Current behavior
- Fighter verify API exists but no screen uses it; no way to reject; any
  logged-in role can edit any fighter; clubs can't use the Add Fighter screen.
- Events: no approval API; `kkf_approval_date/by` never set; any Organizer can
  edit any event and publish directly.
- Public API lists draft events and unverified fighters (the fan site hides
  Draft events only in the browser; unverified fighters are shown).

## Requested change
Backend
- `fighters.review_note`, `events.kkf_comment` columns (migration).
- `POST /fighters/:id/reject {reason}` (STAFF) → status `Rejected` + note;
  verify clears the note. Club edit of its own Rejected fighter re-submits it
  (status back to `Draft`).
- `PUT /fighters/:id`: STAFF, or Club/Gym for its own club's fighters only.
- `POST /events/:id/submit` (Organizer own / STAFF): Draft → `Pending KKF Approval`.
- `POST /events/:id/approve` (STAFF): Pending → `Approved` + approval date/by.
- `POST /events/:id/reject {comment}` (STAFF): Pending → `Draft` + comment.
- Organizers: create is always Draft; can edit only their own events; can set
  status only to `Published` (from Approved) or `Cancelled`.
- Public reads (no staff token): unverified fighters (`Draft`, `Pending KKF
  Verification`, `Rejected`) and unapproved events (`Draft`, `Pending KKF
  Approval`, `Approved`) are hidden from lists and 404 by id.

Admin
- Fighters: waiting-for-verification filter, Verify / Send back on list, detail
  and dashboard; clubs can add fighters (club locked, status hidden).
- Event page checklist: Submit / Approve / Send back / Publish by role; banner
  with KKF comment. Dashboard to-dos by role.

## Impact
- **API shape change (intentional)**: events gain `kkf_comment`, fighters gain
  `reviewNote` → snapshots updated deliberately; frontends only add reads.
- **Database**: one migration, two nullable columns.
- Public site: fewer records visible (only approved events / verified fighters).

## Acceptance criteria
- [ ] Contract tests for every new endpoint and rule; full suite passes with `CI=true`.
- [ ] Club can add a fighter; it's hidden publicly until KKF verifies it.
- [ ] Organizer submits → staff approves or sends back → organizer publishes.
- [ ] Admin build passes; browser check desktop + phone.

## Log
