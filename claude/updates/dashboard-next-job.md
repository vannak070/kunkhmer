# Update: Dashboard built around the next job

| | |
|---|---|
| **Status** | Done (2026-09-30, committed 1e1bf0d9) |
| **Jira** | n/a |
| **Feature** | admin dashboard (`pages/Home.tsx`) |
| **Requested by** | vannak070 (2026-09-30, "Please improve dashboard"; chose "Simpler, next job first" + "Better numbers and look") |

## Current behavior (before)
Long "Needs your attention" list split into up to 14 groups of cards, four small number tiles, upcoming
fight nights, recent results. English only.

## Change
- **Your next job**: one large card with the most urgent to-do (same ranking as before), its explanation, one
  big action button and "n more jobs after this one". Nothing to do → "All caught up".
- **Quick actions** are one row of buttons under it (was a tile grid).
- **Numbers**: "Next fight night" with a countdown (Today / Tomorrow / In n days, links to the event) plus
  Active fighters, Clubs, Results recorded. "Upcoming events" tile removed (the list below shows them).
  On a phone the three small tiles sit in one row.
- **Also waiting**: the remaining to-dos as one flat list (icon, name, type · detail, action), 6 shown, "Show all n".
  Fighter Activate/Verify buttons still show for staff.
- Upcoming fight nights and Recent results unchanged. No API or data-hook change (`useAdminOverview` untouched).
- Not done (not asked): EN/KM switch on the dashboard.

## Log
### 2026-09-30
- Checked on a temporary admin on the test API (populated by the contract suite): desktop and 375 px, no
  horizontal overflow; `Home.tsx` has no `tsc` errors.
