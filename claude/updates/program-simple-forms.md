# Update: Simple "New fight night" and "Add bout" forms

| | |
|---|---|
| **Status** | Done — committed 78093294 (2026-09-30, pushed) |
| **Jira** | n/a |
| **Feature** | events.md, matches-results.md, program-officer-friendly.md |
| **Requested by** | vannak070 (2026-09-30, "Go ahead with your plan" — item 1 of the next-improvements list) |

## Current behavior
- `/home/events/new` (`CreateEvent.tsx`, 1,108 lines): "Create New Event", step 1 = 8 event categories incl.
  tournaments, step 2 details; sent a hard-coded organizer id when none was known.
- `/home/matches/:batchId/create-match` (`CreateMatchFromBatch.tsx`, 912 lines): 3-step "Create Match" wizard
  with 13 weight tiles, boxing-style options, glove agreement, English only.

## Change
- `components/program/FightNightFields.tsx`: the fight night's fields (name, date, venue with Settings › Venues
  suggestions, TV station, main sponsor, about text, poster), shared by the new page and the fight-night page's
  "Edit details" dialog. Edit no longer touches the sponsor list (only create sets it to the main sponsor).
- `pages/NewFightNight.tsx` at `/home/events/new`: one form, saved as a Draft (organizer = signed-in user,
  set by the API); "Create the main fight card too" (on by default) → opens the fight night at "Add bouts".
- `pages/AddBout.tsx` at the same `create-match` address (every button and `?championId=` still work): one screen —
  Red / Blue corner fighter search (registered fighters only; weight, club, record shown; one can't be picked
  twice), agreed weight (the agreed-weight list, preset from the red fighter), Rules (Settings › Bout rules;
  Khmer names), Gloves (Settings › Glove brands), Title fight + which title. Warnings (not blocks): fighter already
  on this card, fighter more than 3 kg from the agreed weight. "Add bout" or "Add and add another".
  Round time stays in minutes (as the rule presets and existing data).
- Old `CreateEvent.tsx` and `CreateMatchFromBatch.tsx` removed. All texts EN + KM (`i18n/program.ts`).

## Acceptance criteria
- [x] New fight night with the main card in one step; lands on the fight night with "Add bouts" next.
- [x] Two bouts added (one via "Add and add another", one title fight); saved with the preset rules / gloves / weight,
      order 1 and 2, auto-accepted.
- [x] "Already on this card" warning shown; Khmer at 375 px without overflow; admin `tsc` 0 errors, `vite build` OK.

## Log
### 2026-09-30
- Built and checked on the test API (rebuilt with a small sample) through a temporary admin.
- Not changed: "Publish fight night" is still offered before any bout exists; the admin side menu is English only.
