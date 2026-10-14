# Update: Help page rewritten for Matches, match day and the new flow

| | |
|---|---|
| **Status** | Done 2026-10-14 (live since 936db4ea) |
| **Jira** | n/a |
| **Feature** | settings.md (Help), admin-pwa.md (step 3: Help) |
| **Requested by** | Owner ("go ahead with the Help page") |

## Current behavior
Help still described the first Program flow: "fight night", "fight cards", Program and Champions, no match day, no
rule messages, no withdrawal / postponement, no sign-off, no weekly board or program sheet; it kept a second set of
texts for the approvals mode, which is switched off. It had its own language switch separate from the admin's.

## Requested change
- Same page, same two languages, but the words and steps of today: **Match** (a day of fights), **Bout**, **Titles**.
- "Your role" tasks per role updated (KKF staff, Organizer, club, referee / judge) with links to Matches, the Week tab,
  Titles, Fighters, Officials, Settings.
- A short **Words** box (Match, Bout, Fight card, Title, Sign-off).
- **A match from start to finish** in ten steps: create (or start from a show / copy last week) → agree (details, sponsors,
  titles) → add bouts (rules in plain words, near-weight list, several at once, empty corners, guest fighters) → officials
  → publish → match day (weigh-in, results, phone) → if the plan changes (withdraw / replace / postpone / cancel) →
  results → after the match (disputes, sign-off, settlement) → the week and the program sheet.
- Fighters text: registered fighters are active at once; duplicate-name warning; guest fighters.
- FAQ refreshed (why a bout is hidden, a rule blocks a bout, a fighter withdrew, a result is locked, where Program /
  Champions went, a list item is missing, phone install, password).
- The approvals-mode texts are removed (dormant; if approvals are switched back on, this page needs its steps back).
- Uses the admin's language (the shared English / Khmer button), not a separate Help setting.

## Scope
In scope: `pages/Help.tsx` only. Out of scope: new help screens per page, videos, the fan site.

## Impact
No API change. Khmer wording needs the KKF review (later).

## Acceptance criteria
- [x] Typecheck clean; browser-checked on the test API: Super Admin (English desktop, Khmer 375 px) and Organizer (role tasks and the FAQ filtered to what an Organizer can do). Club and referee/judge views use the same code (not opened).
- [x] Links point at the current routes (Matches, Matches › Week `?tab=week`, Titles, Fighters, Officials, Settings, New match, My bouts); Titles is the link for the keep-up-to-date line.

## Log
- 2026-10-14: `pages/Help.tsx` rewritten (English + Khmer, role-aware, glossary, ten steps, refreshed FAQ). The old separate Help language setting is gone: the page follows the admin's language button. Khmer wording needs the KKF review (later).
