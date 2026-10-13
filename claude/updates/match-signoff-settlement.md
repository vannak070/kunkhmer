# Update: Program workflow phase 7 — after-match sign-off, disputes and settlement

| | |
|---|---|
| **Status** | Done 2026-10-13 (uncommitted, not live) |
| **Jira** | n/a |
| **Feature** | program-workflow.md (phase 7) |
| **Requested by** | Owner ("go ahead with phase 7") |

## Decisions (owner, 2026-10-13 — all the recommended options)
1. **Sign-off locks the results.** After sign-off, results and weigh-ins can't be edited by normal staff; a correction needs a **Super Admin and a written reason** and is logged. Fan site shows the results as "Official".
2. **Who:** any KKF staff (Super Admin or KKF Officer) may sign off. (Reopening a signed-off match is a Super Admin action, with a reason.)
3. **Disputes:** a dispute is recorded on a bout (who raised it, what), later resolved as **Upheld / Dismissed / Result corrected** with a note. **Open disputes block sign-off.**
4. **Settlement:** a simple checklist — **Broadcaster settled, each Sponsor settled**, with date, who confirmed and a note. No amounts.

## Rules
- Sign-off needs: the match day has come, the match isn't cancelled, every live bout (not cancelled, not waiting for a replacement) has a result, no open dispute, not already signed off. It sets `signed_off_at/by` and the match status to Completed.
- After sign-off: result, weigh-in, new bouts, withdraw / replace / cancel bout and postpone / cancel match are refused for everyone except the Super Admin's logged **result / weigh-in correction** (reason required).
- Settlement can be ticked once the match day has come (any KKF staff); the parties are the broadcaster and the sponsors of the match at that time.
- Everything is added to the match history (`match_changes`: sign_off, reopen, correct_result, correct_weigh_in).

## Build plan
- Migration `20261013160000_match_signoff`: `events.signed_off_at/by`; tables `bout_disputes` and `event_settlements`.
- API (`modules/events/signoff.ts`): `POST /events/:id/sign-off`, `POST /events/:id/reopen` (Super Admin + reason), `GET /events/:id/disputes`, `GET /matches/disputes?status=open` (staff, for the to-do list), `POST /matches/:id/disputes`, `PUT /disputes/:id/resolve`, `GET /events/:id/settlement`, `PUT /events/:id/settlement`; result / weigh-in accept `correctionReason`; `signed_off_at` is an additive event field (public too), nothing else is public.
- Admin: match page "After the match" group (Disputes · Sign-off · Settlement) in the guided flow; disputes panel with Resolve; settlement checklist; sign-off confirmation; "Correct result" (Super Admin + reason) on the bout page; locked messages on Match day; Needs attention lines "Open disputes" and "Ready to sign off"; Matches list "Signed off"; EN + KM.
- Fan site: an "Official results" chip once signed off.
- Tests: contract tests for every rule and role; browser checks.

## Impact
API additive + new endpoints; one migration; admin match / bout pages, flow, to-dos; fan-site chip.

## Log
- 2026-10-13: questions answered (above).
- 2026-10-13: **built.** Migration `20261013160000_match_signoff` (`events.signed_off_at/by`, tables `bout_disputes`, `event_settlements`); `modules/events/signoff.ts` (sign-off, reopen, disputes, resolve, settlement; `signedOffLock` / `assertNotSignedOff` guards on result, weigh-in, add / change / delete bout, withdraw / replace / cancel, postpone / cancel, and the event's status / date); additive event field `signed_off_at` (public too — nothing else about disputes or settlement is public). Contract tests `signoff.test.ts` (6) + 10 existing snapshots gained only `signed_off_at`; suite **334/334**. Admin: "After the match" group in the guided flow (Disputes · Sign-off · Settlement), `components/program/AfterMatch.tsx` (disputes list + Resolve, settlement checklist, sign-off / reopen dialogs, Super Admin correction prompt), bout page (Record a dispute, locked note, Super Admin "Change" asks for a reason first and sends `correctionReason`), Match day shows the lock, match history lines, Needs attention "Open disputes" / "Ready to sign off" + dashboard to-dos, Matches list "Signed off", fan site "Official results" chip. EN + KM (`so.*`). Browser-checked on the test API: record dispute → sign-off locked → resolve → sign off (banner, who/when) → bout page lock and correction prompt; Khmer settlement panel at 375 px. Not browser-checked: the Super Admin correction save and settlement ticking through the UI (API-tested), Results / Weigh-in list pages after sign-off (they show the server's message).
- Dev note: another migration; the dev backend was restarted on the owner's dev stack to apply it.
