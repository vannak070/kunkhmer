# Update: Show templates and "copy last week"

| | |
|---|---|
| **Status** | Done (2026-10-14, live since 2026-10-14, 936db4ea) |
| **Feature** | claude/features/weekly-program.md (step 5), claude/features/settings.md, claude/features/events.md |
| **Requested by** | vannak070 ("start step 5 templates and copy last week") |

## Before
Each of the 15–20 weekly shows was typed in from scratch every week.

## Change
- **Shows list** (System Settings › **Shows**, Super Admin edits like the other lists): table `show_templates` (migration `20261014120000_show_templates`): name, broadcaster, main sponsor, usual day (0 = Sunday … 6), start time "HH:MM", venue, notes, order, active. API `/settings/shows` (same rules as the other lists; broadcaster / sponsor must exist, time and day validated; starts empty).
- **New match › "Start from a show"**: picking a show fills the name, the next date on its usual day, start time, venue, broadcaster (not for an Organizer, who keeps its own), main sponsor and notes; everything stays editable. Organizers only see shows of their broadcaster (or with none).
- **Copy a match** (`POST /events/:id/copy { date }`, KKF staff any match, Organizer its own): a new Draft with the same name, broadcaster, organizer, main sponsor + sponsors, venue, start time, description and type — no bouts, no poster. Match page › More › "Copy to another date" (date preset to a week later), then opens the copy.
- **Copy last week** (`POST /events/copy-week { from }`): every non-cancelled match in the 7 days from `from` is copied 7 days later as a Draft; a match already there (same name + broadcaster + date) is skipped, so a second press does nothing. An Organizer copies only its own. Matches › Week › "Copy last week here" (copies the week before the one shown) with a message "N copied · M already there".
- EN + KM strings (`set.*shows`, `day.0–6`, `copy.*`).

## Log
### 2026-10-14
- Contract tests: shows list in `settings-lists.test.ts` (shape, roles, broadcaster/sponsor/time/day validation, clearing the sponsor), copy + copy-week in `events.test.ts` (fields and sponsors copied, Draft, no poster, cancelled left out, duplicates skipped, roles). Full suite 350/350 in CI mode; backend typecheck clean; admin builds.
- Checked on a temporary admin on the test API: Shows tab list + Add show dialog (broadcaster, sponsor, day, time fields), New match filled from a show (next Sunday 15:00, venue), Week › Copy last week here copied two shows into this week as drafts. Not clicked: "Copy to another date" on the match page; Khmer screens.
