# Update: simpler match page for KKF staff

| | |
|---|---|
| **Status** | All of A–J done 2026-11-09 (committed 6c577d7c; not live). The later Week / Upcoming / Past layout alignment (last three Log entries) is uncommitted |
| **Jira** | n/a |
| **Feature** | claude/features/weekly-program.md, claude/updates/program-guided-fight-night.md, claude/updates/offline-agreements-log.md |
| **Requested by** | Owner ("match/program admin is not user convenient" → approved A+B+C+D+E+J first, then F+H+I, G last) |

## Current behavior
- The match page (`pages/FightNight.tsx`) opens with an 11-step "Next steps" list (Agree → Build → Go public → Fight night →
  After the match) above the bouts; the three after-match steps show greyed out from day one.
- With approvals off, KKF staff still had to click **Confirm** on details / sponsors / titles before publishing.
- A bout can't be edited from the match page (weight, rounds, gloves, type, rules), only opened; it can't be moved up / down
  (program order) or have its corners swapped; only a Super Admin could delete it.
- The login page says "one device at a time" although multi-device sign-in is done (`updates/multi-device-sign-in.md`).

## Requested change
- **A** Bouts first: "Next steps" folds into one slim bar for KKF staff — "4 of 8 done · Next: …" with the next step's button and
  **All steps** to open the full list (**Fold** closes it). The after-match steps only appear once match day has come.
  Organizers keep the full list.
- **B** What KKF staff enter is confirmed by itself while approvals are off: creating / editing a match, copying a match or a week,
  and choosing titles record a confirmed agreement row ("Entered by KKF staff"); publishing confirms first. No-op with approvals on
  or for other roles (`confirmAsStaff` in `backend/src/modules/events/agreements.ts`).
- **C** Each bout row has a ⋯ menu (KKF staff, until the match is signed off or cancelled): **Edit bout** (agreed weight, rounds,
  minutes per round, glove brand / size, bout type incl. "Other" text, rule set — existing `PUT /matches/:id`); **Delete bout**:
  Super Admin always, KKF Officer only while the match isn't published and the bout has no result (otherwise cancel the bout,
  which keeps the record). Before, only a Super Admin could delete a bout.
- **D** **Move up / Move down**: `PUT /matches/batches/:id/order { matchIds }` — every bout of the card once, in the new order →
  sort order 1…n (the program sheet prints this order).
- **E** **Swap red and blue**: `POST /matches/:id/swap-corners` — fighters, "winner of bout N" sources, weigh-ins, club answers,
  replacement side change sides; refused after a result.
- **J** Login text: "You can stay signed in on up to 5 devices…" (EN + KM).

## Why
Officers asked for fewer clicks and the bouts in view; the Confirm step was an extra click with nobody else to confirm.

## Scope
In scope: A–E and J above, then F, H, I (below), contract tests, EN + KM strings.
Out of scope: nothing left from the owner's list.

### G bout side panel (approved last, built 2026-11-09)
- Tapping a bout on the match page opens a **side panel** instead of leaving the page (right side on a computer, full screen on a
  phone): bout number, type and rule set; red and blue with club, weigh-in kg and "x kg over"; agreed weight, rounds × minutes and
  gloves; title; officials ("Referee … · n of 3 judges"); weigh-in state; result. Buttons: Edit bout, Assign officials, Weigh-in,
  Results — the bout's next job (officials → weigh-in → result) is the blue one — and **Open the full bout page** (changes, history,
  withdraw / replace). **Previous / Next bout** go through the card without closing. The open bout is in the address
  (`?bout=<id>`): a refresh or a shared link keeps it open; Esc / × closes it. Others (Organizer) see the facts and the bout-page button.

### F, H, I (second batch, approved 2026-11-09)
- **F** One **Add bouts ▾** button on the match page's bout list instead of three: Add bout / Add several bouts / Tournament draw,
  each with one line saying when to use it. The empty-card hint says "Add bouts".
- **H** **Matches opens on the Week tab** (`/home/matches`; Upcoming is now `?tab=upcoming`), and a slim **"Your next job"** strip
  sits above the tabs on every tab: the match, "5 of 6 done · Next: Results", that step's button and Open match (`NextMatchCard slim`,
  `NightNextInline`). The big card is no longer shown on the list.
- **I** After **Create match**, KKF staff land on **Add several bouts** for the new match's "Main card" (made there); an Organizer, or
  a failure creating the card, opens the match page as before.

## Impact
- API: two **new** routes (swap, order); `DELETE /matches/:id` now also lets a KKF Officer delete, with the officer rule (was Super Admin only);
  staff-made matches get confirmed agreement rows (agreements responses unchanged in shape). No migration.
- Admin: `pages/FightNight.tsx`, `components/program/NightFlow.tsx`, new `components/program/BoutActions.tsx`, `utils/api.ts`,
  `i18n/program.ts`, `pages/Login.tsx` (text only); F/H/I: `components/program/NextMatchCard.tsx`, `pages/Matches.tsx`, `pages/NewFightNight.tsx`; G: new `components/program/BoutPanel.tsx`.
- Known limit: changing the agreed weight in Edit bout does not re-run the KKF matching rules (only a fighter change does); the
  dialog says so — the weigh-in shows over-weight.

## Acceptance criteria
- [x] Staff create → add a bout → publish works without Confirm clicks; Organizer flow unchanged.
- [x] Officer delete rules, swap, order and role checks covered by contract tests; full suite and typechecks pass.
- [x] Match page checked in the browser (EN / KM, desktop and phone): slim bar, All steps / Fold, bouts first, ⋯ menu actions.

## Log

- 2026-11-09: backend B (`confirmAsStaff`, `events/agreements.ts`, called from `events/routes.ts` create / update / publish / copy /
  copy-week and `PUT /events/:id/titles`), C/D/E (`matches/routes.ts`: officer delete rule, `POST /matches/:id/swap-corners`,
  `PUT /matches/batches/:id/order`). Admin: `NightFlow.tsx` slim bar (staff) + after-match steps only from match day,
  `FightNight.tsx` bouts right under the bar (disputes, settlement, agreement log, history after them), new
  `components/program/BoutActions.tsx` (⋯ menu + Edit bout dialog), `utils/api.ts` (`swapCorners`, `reorder`), 26 EN + KM strings,
  `login.oneDevice` text (J). The four-column bout row now starts at the `xl` width (at `lg` the bout column was squeezed and
  names overlapped the officials pill).
- Tests: new `api-tests/tests/match-page-simpler.test.ts` (auto-confirm and publish without Confirm, re-confirm after a staff edit,
  titles; edit fields; officer delete allowed / refused for published or with result, Super Admin always, others 403; swap incl.
  weigh-ins, refused after a result / for clubs / unknown bout; order saved and validated). Updated to the new rules:
  `agreements.test.ts` (Organizer-made night for the confirm flow; staff publishing confirms; an Organizer's change waits again;
  titles chosen by the Organizer), `matches.test.ts` (officer delete → 422 on a published bout; snapshot key renamed, shape unchanged).
  Full suite **422 / 422**, backend typecheck clean, admin typecheck clean for the changed files.
- Browser (test API, Super Admin): slim bar "4 of 8 done · Next: Officials" with Assign officials + All steps / Fold; no after-match
  steps before match day; Move down, Swap red and blue, Edit bout (60 → 63.5 kg, 5 → 3 rounds) and Delete bout all worked;
  Khmer at phone width readable, no sideways scroll. Not checked in the browser: a KKF Officer's menu (delete hidden once published —
  covered by the API tests), the Organizer's view (unchanged full list).
- 2026-11-09 (F, H, I): `FightNight.tsx` Add bouts ▾ menu (closes on an outside click) + `card.addMenu` / `card.add*Hint` and a new
  `card.noBouts` text (EN + KM); `Matches.tsx` default tab Week, chips Week · Upcoming · Past · Needs attention, `NextMatchCard slim`
  on every tab; `NightFlow.tsx` `NightNextInline`; `NewFightNight.tsx` creates the Main card and opens `/home/matches/:card/quick-bouts`
  for staff with `events.edit`. Browser (test API, Super Admin): Create match → landed on "Add several bouts"; the match page shows one
  Add bouts button with the three choices; Matches opened on Week with the strip ("Results still to record · Event … · 5 of 6 done ·
  Next: Results · Results · Open match"); Khmer at phone width fine, no sideways scroll. The strip squeezed its text at a 1024 px window
  — it now wraps (row layout only from `xl`).
- Found while testing: `sessions.test.ts` (multi-device sign-in, same uncommitted batch) failed about 1 run in 3 — six sign-ins in the
  same second tie on "unused the longest", so a random session was dropped. Fixed in `backend/src/lib/auth.ts`: on a tie the newer
  session (higher id) counts as more recent (`byRecent`, also used for the device list). 5/5 runs pass. Full suite **422 / 422**.
- 2026-11-09 (G): new `components/program/BoutPanel.tsx` (Radix dialog as a right-side panel), `EditBoutDialog` exported from
  `BoutActions.tsx`, bout rows on `FightNight.tsx` are buttons that open it (`?bout=<id>` via `useSearchParams`), 15 `bp.*` strings EN + KM.
  Browser (test API, Super Admin): bout 2 with an over-weight blue corner showed 60.4 / 62.1 kg and "1.1 kg over", "No referee yet ·
  0 of 3 judges", the blue button on Assign officials; Next → Bout 3 (Next disabled at the end), Previous → Bout 2; reload with
  `?bout=` kept it open; Esc closed it and cleared the address; Edit bout from the panel saved 60 → 57 kg and the panel updated;
  Khmer at phone width full screen, readable, no sideways scroll. No backend change (suite 422 / 422 from the step before stands).
- 2026-11-09 (owner: "not consistent layout when I click Week, Upcoming and Past"): the tabs now sit alone on their
  row on every tab; Upcoming / Past got the Week board's toolbar in the same place — search (left) + broadcaster
  filter (right), then the summary line "N matches · N bouts · N broadcasters". `pages/Matches.tsx` only. Build OK,
  checked on the test API at desktop width.
- 2026-11-09 (owner, screenshots of the three tabs): the page still moved sideways between tabs — a short list (1 match)
  has no scrollbar, a long one does, so the centred page shifted. `components/Layout.tsx` `<main>` now keeps the
  scrollbar space always (`scrollbar-gutter: stable`), for every admin page. Measured on the test API: same left edge
  and width with and without a scrollbar.
- 2026-11-09 (owner: "make the same display UI as Week", picked "Week boards stacked"): Upcoming and Past now show
  the Week board's broadcaster × day grid and compact cards, one grid per week with the week's dates above it
  (Upcoming from this week on, Past latest week first), the same status key, and the same side panel on click
  (Previous / Next run through every match in the list). Phone: the same list by day as the Week board. The weekly
  checks edges stay on Week only (they are worked out per week). `WeekBoard.tsx` now exports `WeekGrid` and
  `StatusKey`, shared by both. Build OK; checked on the test API at desktop and phone width.
