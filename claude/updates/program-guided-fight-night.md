# Update: guided fight night (one flow, four groups, simple Organizer view)

| | |
|---|---|
| **Status** | Step 1 done 2026-10-13 (uncommitted); plain rule messages, overview grouping, day-of mode, phases 6–7 next |
| **Jira** | n/a |
| **Feature** | program-workflow.md, events.md, admin-pwa.md |
| **Requested by** | Owner ("user friendly for Program function … as per my feedback flow"; "go ahead with your recommendation but exclude licence") |

## Current behavior (walked through on the test API, desktop + phone)
- Two checklists on the fight night page: a 7-step "Next steps" grid and, far below, "Agreements with the broadcaster" (licence, details, sponsors, titles). The agreed flow puts those agreements *before* the bouts and they gate publishing, but the stepper doesn't know them.
- "Fight night", "Fight card(s)" and "Program" are three names for one thing; "Add / Delete fight card" show although most nights have one card.
- Insider wording ("Agreements with the broadcaster", "Record and confirm", "Not recorded"); the Organizer sees the same dense page as KKF.
- The licence number + date were required before the details could be recorded (hard publish gate).

## Requested change (owner decisions 2026-10-13)
1. **One guided flow** following the final flow, four groups: **Agree** (details → sponsors → titles) · **Build the card** (bouts → officials) · **Go public** (publish → weigh-in) · **Fight night** (results). Each step shows its status (Done / To do / Waiting for the organizer / Waiting for KKF / Locked with the reason / Later) and one main button; done and later steps are one-line rows; a sticky "Next: …" bar on phones.
2. **Licence removed** from the flow and the UI ("not important"). Backend: confirming the details no longer needs a licence, publish message says "details" only. The licence columns and `/events/:id/licence` endpoints stay dormant (no data loss, no migration).
3. **Fight card level hidden**: the first "Add bout" creates a "Main card" itself; with one card the page just says "Bouts" (no card name, no Delete); a second card is added from the More menu. With several cards the card headers show as before.
4. **KKF confirm in one click** ("Confirm"); the Organizer "Send to KKF" with an optional note. Same agreements log and roles underneath.
5. **Organizer sees a simple page** (same URL, simpler layout): "Your part" (details, sponsors, titles: status + action) and "KKF's part" (read-only status), then the bouts read-only. Clubs / officials see only the bouts.

## Scope
In scope: fight night page, steps, agreements UI, EN + KM texts, the licence requirement in `modules/events/agreements.ts` + its tests.
Out of scope (next, each its own step): ~~plain-language rule messages~~ (done: `updates/rule-messages.md`), Program overview "Needs attention" grouped by fight night, fight-night-day mode, phases 6–7.

## Impact
- API response shapes: none (agreements still return `licence`; the admin ignores it). Error text change: publish blocker now "KKF must confirm the fight night details before publishing"; `POST /events/:id/agreements` `details` no longer 422s without a licence.
- Database: none.
- Frontend: `pages/FightNight.tsx`, `components/program/NightFlow.tsx` (new), `AgreementsPanel.tsx` (becomes actions + dialogs), `FightNightSteps.tsx` (replaced; `EventNextSteps` stays for the legacy approvals switch).

## Acceptance criteria
- [x] Suite passes (agreements test updated for the optional licence; 319/319, one snapshot key renamed, no shape change).
- [x] KKF: details/sponsors confirm in one click; titles optional; publish locked with a clear reason until details (and titles, if any) are confirmed.
- [x] Organizer: sees "Your part" / "KKF's part", can send details, sponsors and titles to KKF, cannot publish.
- [x] A new fight night with no card: "Add bouts" creates "Main card" and opens Add bout.
- [x] English + Khmer, desktop + 375 px (browser-checked on the test API as Super Admin and as an Organizer).

## Log
- 2026-10-13: backend: `POST /events/:id/agreements` no longer needs a licence; publish blocker text without "licence"; `agreements.test.ts` updated (+ snapshot key rename). Admin: new `components/program/NightFlow.tsx` (`useNightFlow`, `NightFlow`, `NightNextCard`), `AgreementsPanel.tsx` reduced to types + `useAgreementActions` + dialogs + `AgreementLog`, `FightNightSteps.tsx` deleted, `FightNight.tsx` uses the flow (card level hidden with one card, "Add a second fight card" in More, Delete card only with several cards, clubs/officials no longer see the checklist), `ProgramOverview.tsx` shows the compact next-step card for the focus night (staff + Organizer). After fight night the "next" step is Results. Texts: `flow.*`, `night.boutsTitle/addSecondCard/noBoutsYet`; 86 unused `agr.*` / `steps.*` keys (licence, old stepper) removed; send dialogs reworded ("Send … to KKF"). Browser-checked: KKF confirms details + sponsors in one click, "Add bouts" creates "Main card" and opens Add bout, phone sticky "Next" bar above the bottom bar, Khmer, Organizer "Your part / KKF's part" + "Send to KKF" → "Waiting for KKF", KKF then sees Confirm / Send back.
- Observed for the next step: a rule block reads "This bout breaks KKF matching rules: … another bout on 2026-12-12, less than 21 days apart" — technical wording; plain messages with a fix button are the next item.
