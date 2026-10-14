# Update: Matches, Titles and a simpler menu

| | |
|---|---|
| **Status** | Done 2026-10-13 (committed and pushed (dev 11253144), not live) |
| **Jira** | n/a |
| **Feature** | program-workflow.md, admin-pwa.md |
| **Requested by** | Owner ("I want to change fight night as Matches … go ahead with your recommended package") |

## Current behavior
The menu had 14 top-level items; "Program" held three tabs (Overview / Fight nights / Champions); the Overview repeated the dashboard's to-do list; "Match Proposals" showed although approvals are off; the new-fight-night form asked for sponsors, about text, poster and a fight-card checkbox.

## Requested change (package agreed 2026-10-13: items 1–6, 9–11, 13)
1. **Words:** **Match** = one day of fights (date, venue, TV); **Bout** = one fight inside it; **Titles** = belts. All English and Khmer admin texts renamed ("Fight night" → "Match", Khmer "រាត្រីប្រកួត" → "ការប្រកួត", the match-day group "ថ្ងៃប្រកួត"); old texts that used "match" for a bout now say bout (Assign officials, video link, Settings hints).
2. **Matches** (`/home/matches`) replaces Program: "Your next job" card, then chips **Upcoming / Past / Needs attention (n)**, search, "New match". Needs attention = the grouped cards from `updates/program-needs-attention.md`.
3. **Titles** (`/home/titles`) is its own menu item (was the Champions tab). `/home/program` redirects (`?tab=champions` → Titles, else Matches).
4. **Menu:** Competition (Matches, Fighters, Clubs, Titles) · People (Officials, Users) · Content (Media, Hub answers, Knowledge base, About the Federation) · Partners (Strategic Partners) · Settings + Help. "Match Proposals" only shows when approvals are on. Phone bottom bar: Dashboard, Matches, Fighters, Clubs, Menu.
5. **Dashboard:** the match jobs use the same grouped "Needs attention" cards; fighters, events sent back and the rest stay in "Also waiting".
6. **New match form:** name, date, venue and TV; sponsors, about text and poster under "More details (optional)"; no fight-card checkbox (the first "Add bouts" creates the "Main card").

## Scope
In scope: admin only — `pages/Matches.tsx`, `pages/Titles.tsx`, `components/program/NextMatchCard.tsx`, `NeedsAttention.tsx`, `components/Layout.tsx`, `pages/Home.tsx`, `pages/NewFightNight.tsx`, `FightNightFields.tsx` (`short`), `routes.tsx`, texts. Deleted: `ProgramDashboard.tsx`, `FightNights.tsx`, `ProgramOverview.tsx`.
Out of scope: URLs and API names (`/home/events/:id`, `events`, `batches`, `matches`), the fan site, the Help page, items 7, 8, 12, 14–20 of the proposal list.

## Impact
No API change, no migration. Old links (`/home/program?tab=…`) redirect; internal links point to the new addresses.

## Acceptance criteria
- [x] Typecheck clean (the only errors left are the old ones in data/, usePermissions, ShareFightCard).
- [x] Browser-checked on the test API: menu and groups, Matches (Upcoming, Needs attention), Titles, redirect from the old Program address, New match short form → guided flow, dashboard grouping, Khmer, 375 px (bottom bar).
- [ ] KKF confirms the Khmer words (Match "ការប្រកួត", Bout "គូប្រកួត", match day "ថ្ងៃប្រកួត", Titles "ខ្សែក្រវាត់ជើងឯក", group names "កីឡា / បុគ្គលិក / ដៃគូ").
- [ ] Fan site and Help page wording still "fight night" — decide whether to follow.

## Log
- 2026-10-13: built and browser-checked.
