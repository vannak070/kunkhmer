# Feature: Program workflow (offline agreements recorded in the system)

| | |
|---|---|
| **Status** | Draft — flow and roles agreed with the owner 2026-10-13; only the matching-rule values are still TBD (placeholder table drafted). Nothing built |
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
- `events` has `organizer_id` and a separate `broadcast_station_id`; decision 4 links them (new `users.broadcast_station_id`, migration).
- Only checks on a bout today: two different fighters, both verified (`updates/program-validation.md`).

## Business rules
- One broadcaster per event; many sponsors per event; a sponsor may be on many broadcasters' events.
- Matching rules block bout creation (rules TBD below).
- Recording an offline agreement stores who recorded it, who confirmed it and when (audit).

## Decisions (owner, 2026-10-13)
1. **Record and confirm follow system role and permission.** No fixed "organizer records, KKF confirms" pair:
   each record type says which roles may record it and which may confirm it (a role may hold both).
2. **Organizer = Broadcaster**, one broadcaster per event.
3. **Title belts**: KKF creates the belt; the Organizer selects which title is contested at its own event
   (KKF approves, offline first).
4. **No new broadcaster record.** The existing broadcast station *is* the broadcaster; KKF enables an
   Organizer account under the broadcaster function (a user linked to a broadcast station). The event's
   `organizer_id` and `broadcast_station_id` then always agree.
5. **Fighter and club consent are not recorded.**
6. **Missing steps A–I** from the review are accepted (see Flow, extended below).

## Flow (final)
1. KKF creates the broadcaster and enables its Organizer account.
2. KKF and the Organizer agree the program/event offline (date, venue, **licence/permit**) → recorded.
3. The broadcaster agrees sponsors offline → attached; the event is activated.
4. KKF creates the title belt; the Organizer selects it for its event → KKF approval recorded.
5. All confirmed → matchmaking starts.
6. Each bout is agreed offline with the clubs → recorded. **Fighter eligibility** (verified, medical, licence valid,
   not suspended) and the **KKF matching rules** are checked; a bout that breaks them cannot be created.
7. Officials assigned (referee + 3 judges) → publish the fight card.
8. Weigh-in and medical check; a fighter over weight or unfit can be withdrawn and a **replacement** is recorded
   (rules re-checked).
9. Fight night: results recorded, title changes applied.
10. After the event: KKF signs off results, records and disputes; settlement with the broadcaster and sponsors.
11. Any time: **postponement / cancellation** recorded with a reason.

## Draft matching rules — PLACEHOLDER values for the owner to correct
**These numbers are my guesses, not KKF rules.** Edit the "Limit" and "Action" columns; "Data" shows what the
system already stores (so what can be checked without new fields). Block = the bout cannot be created; Warn = shown
to the officer, bout can still be created.

| # | Check | Limit (placeholder) | Action | Data in the system |
|---|---|---|---|---|
| 1 | Two different fighters | not the same fighter | Block | done (`program-validation.md`) |
| 2 | Fighter verified (Active) | status Active | Block | done |
| 3 | Medical clearance | `medical_status` = Cleared | Block | field exists, no screen yet |
| 4 | Suspension | no `suspension_end_date` on or after the fight date | Block | field exists, no screen yet |
| 5 | Same gender | both Male or both Female | Block | `gender` |
| 6 | Minimum age | 16 years on the fight date (TBD: 18?) | Block | `date_of_birth` |
| 7 | Weight gap | agreed weight within ±2 kg of each fighter's current weight (TBD) | Warn | `current_weight`, bout `agreed_weight` |
| 8 | Grade gap | grades differ by at most 1 step (A–D) | Warn | `grade` |
| 9 | Record gap | win-rate gap or fight-count gap above a limit (TBD) | Warn | `record` |
| 10 | Rest between fights | at least 21 days since either fighter's last bout (TBD) | Block | derived from past bouts' dates |
| 11 | Same club | two fighters of the same club cannot meet | Warn | `club_id` |
| 12 | Already booked | fighter not in another bout on the same fight night | Block | derived |
| 13 | Title bout | both fighters in the title's weight class; champion is one of them | Block | `championship_id`, holder |
| 14 | Officials | referee + 3 judges before publish (not before creating the bout) | Block at publish | done |

Questions on the table: which rows do you want, which are Block versus Warn, and the numbers in rows 6, 7, 8, 9
and 10. Row 9 may need a clear rule (for example "no more than 10 wins apart"). Rules that need data the system
does not hold yet: rows 3 and 4 need a screen to enter them (`features/fighter-personal-records.md`).

## Still TBD
The matching-rule values above; what the settlement step records; what "licence/permit" records (number, date, file).

## Acceptance criteria
- [ ] TBD after the open questions.
