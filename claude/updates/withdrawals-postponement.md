# Update: Program workflow phase 6 — withdrawal, replacement, postponement, cancellation

| | |
|---|---|
| **Status** | Done 2026-10-13 (committed and pushed (dev 11253144), not live) |
| **Jira** | n/a |
| **Feature** | program-workflow.md (phase 6) |
| **Requested by** | Owner |

## Decisions (owner, 2026-10-13)
1. **Who:** KKF staff may withdraw a fighter and record a replacement at any time; the **Organizer may do it for its own match until match day** (KKF on the day). Clubs do not. (Follows the agreements model: Organizer records before publishing/match day, KKF always can.)
2. **The bout meanwhile:** it **stays in its place, marked "Replacement needed"**. It shows a clear warning, cannot get a weigh-in or a result until KKF records a replacement or cancels the bout, and appears as a dashboard / Matches "Needs attention" line.
3. **Replacement rules:** the replacement **must pass the KKF matching rules, no override** (Block rules refuse, Warn rules warn), exactly like a new bout; the swap runs `enforceRules`.
4. **Postponement:** **change the match date, keep everything** (cards, bouts, officials, agreements) with a reason; the rest-day / age / already-booked rules are re-checked on the new date for every bout (a broken Block rule refuses the new date and names the bouts); the fan site shows the new date.
5. **Reason:** a short list — Injured · Over weight · Not medically cleared · Personal reason · No-show · Other — plus an optional note.
6. **Fan site:** status only — "Postponed to {date}" or "Cancelled", **no reason**; a withdrawn fighter is replaced or the bout leaves the card.
7. **Fighter record:** the withdrawal dialog offers a tick box "Also mark the fighter Injured / not medically cleared" (off by default; nothing changes unless ticked).
8. **Notice:** recorded in the **match history only** (who, when, reason) and in the to-do "Replacement needed"; people are told offline.

## Assumptions to confirm before building
- **Cancelling one bout** = withdrawing with no replacement ("Cancel bout", reason required); the bout is kept in the history but leaves the card and the fan site.
- **Cancelling the whole match** needs a reason (the status Cancelled exists today without one) and is shown to fans as "Cancelled".
- A withdrawn fighter's fight record is not changed (no loss, no draw); a no-show is only a reason.
- The Organizer can postpone / cancel its own match before match day; after that only KKF.

## Build plan (when approved)
- Migration: `match_changes` log (match/event, kind withdraw | replace | cancel_bout | postpone | cancel_event, fighter, reason, note, by, at) + `matches.status` value `Replacement needed` (or a column) + `events.cancel_reason`, `events.original_date`.
- API: `POST /matches/:id/withdraw {side, reason, note, markFighter?}`, `POST /matches/:id/replace {side, fighterId}` (rules enforced), `POST /matches/:id/cancel {reason}`, `POST /events/:id/postpone {date, reason}`, cancel with reason on the event; Organizer scope as in decision 1; contract tests for each, snapshots only for the additive fields.
- Admin: bout page and Match day "Withdraw fighter" → reason → "Replacement needed" card with the same fighter picker + live rule check as Add bout; match page More menu "Postpone" / "Cancel match" with reason; history list on the match page; Needs attention line; EN + KM texts.
- Fan site: "Postponed to …" / "Cancelled" status chips on the match (small, separate step).

## Impact
API additive + new endpoints; one migration; admin match page, bout page, Match day, Matches list; fan site status text.

## Log
- 2026-10-13: questions answered by the owner (above); assumptions went ahead as written.
- 2026-10-13: **built.** Migration `20261013150000_match_changes` (`matches.replacement_side`, `events.original_date`, table `match_changes`); `modules/matches/changes.ts` (withdraw / replace / cancel bout / postpone / cancel match / history; KKF staff, or an Organizer who sees the match and acts before match day); `PUBLIC_BOUT` hides cancelled and replacement-needed bouts; weigh-in and result refuse them; the rules ignore them as bookings and `checkPairing` takes a `fightDate` for the postponement re-check; additive fields `replacement_side` (bouts) and `postponed_from` (events; never the reason). Contract tests `changes.test.ts` (8), 18 existing snapshots gained only those fields; suite **328/328**. Admin: `components/program/MatchChanges.tsx` (withdraw, replacement panel with live rule check, cancel bout / match, postpone, history), bout page, Match day (strip colour + replacement panel + Withdraw button), match page (More menu: Postpone / Cancel with reason, bout chips, postponed banner, history), flow "Replacement needed" step, Needs attention line + dashboard to-do, weigh-in / results lists hide cancelled bouts, Matches list "Postponed" note; fan site: an amber "Postponed — was on {date}" chip on the match page. EN + KM texts (`ch.*`). Browser-checked on the test API: withdraw (injured + mark), replacement with rule check, postpone (re-check, banner, "details changed" re-confirm), history, Match day replacement state in Khmer at 375 px. Not browser-checked: the Organizer's own screens (API-tested only).
- Dev note: this adds a migration; the dev backend must be restarted once (it applies it on start) — done on the owner's dev stack 2026-10-13.
