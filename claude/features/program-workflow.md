# Feature: Program workflow (offline agreements recorded in the system)

| | |
|---|---|
| **Status** | Draft — flow agreed with the owner 2026-10-13; matching rules and record/approve split still TBD. Nothing built |
| **Jira** | TBD |
| **Figma** | TBD |
| **Owner** | vannak070 |

## Goal
The system mirrors how KKF really works: every approval is agreed **offline** (a discussion) first; the system
only **records the result** afterwards, and blocks what KKF's rules forbid.

## Principle
Offline = people talk first, the system records later. No in-system negotiation, no consent from fighters or clubs.

## Parties
- **KKF** (Super Admin, KKF Officer): approves, enforces the matching rules, runs fight night.
- **Organizer = Broadcaster.** KKF creates the broadcaster and enables an Organizer account for it, which manages
  the program. One event has **one** broadcaster (two broadcasters can't share an event).
- **Sponsors**: one sponsor can be on events of several broadcasters.
- **Clubs / fighters**: discuss with the organizer / KKF offline; the system records the agreed bout. No consent step.

## Flow
1. KKF and the Organizer agree the program/event offline → recorded in the system (event, date, venue).
2. The broadcaster agrees sponsors offline → sponsors attached to the event (event is activated).
3. Event confirmed → the Organizer may propose a **title belt / champion** → KKF reviews offline → approval recorded.
4. All confirmed → matchmaking starts.
5. Each bout: agreed offline with the clubs, then recorded. **KKF matching rules are checked; a bout that breaks
   them cannot be created.**
6. Officials assigned (referee + 3 judges) → publish → weigh-in / medical → fight night results → title changes.
7. Missing steps proposed for the owner to confirm: licence/permit for the event, fighter eligibility
   (verified, medical, not suspended), withdrawals and replacements, postponement/cancellation, after-event
   sign-off (results, records, disputes), settlement with broadcaster and sponsors.

## Today vs this plan
- Today approvals are switched off and KKF staff do everything (`updates/officer-run-program.md`); Organizer is
  read-only. This plan gives the Organizer the right to **record** its event, sponsors and title proposal, and
  KKF the right to **confirm** them.
- `events` has `organizer_id` and a separate `broadcast_station_id`; they should become one party.
- Only checks on a bout today: two different fighters, both verified (`updates/program-validation.md`).

## Business rules
- One broadcaster per event; many sponsors per event; a sponsor may be on many broadcasters' events.
- Matching rules block bout creation (rules TBD below).
- Recording an offline agreement stores who recorded it, who confirmed it and when (audit).

## Open questions (TBD — ask before building)
1. Does KKF confirm each recorded item (event, sponsors, title, bout) in the system, or is a record by KKF staff
   enough? Who records a bout: the Organizer or KKF?
2. **KKF matching rules**: which of weight gap, grade/record gap, age, gender, rest days since last fight,
   suspension, medical clearance apply? The limits for each, and which block versus only warn?
3. Is the title belt tied to a weight class and created by KKF, with the Organizer only proposing a defence/fight?
4. Is the broadcaster a new record linked to the Organizer account, replacing broadcast stations on events?
5. Which of the missing steps in "Flow 7" are wanted?

## Acceptance criteria
- [ ] TBD after the open questions.
