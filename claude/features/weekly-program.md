# Feature: Weekly program by broadcaster (15–20 shows a week)

| | |
|---|---|
| **Status** | In progress — owner answered the review questions on 2026-10-13 and told me to arrange the order |
| **Jira** | n/a |
| **Figma** | n/a |
| **Owner** | vannak070 |
| **Review** | `claude/updates/weekly-program-sheets-review.md` (what the 19 official sheets contain and the gaps) |

## Goal
KKF runs 15–20 shows a week across about nine broadcasters. The system holds the whole week (shows, times, bouts,
fighters, sponsors) and **prints the official program sheet** for each show; KKF signs and stamps the printed paper
by hand.

## Owner decisions (2026-10-13)
1. **The system must print the sheet** (today it can't). Signature and stamp are done by hand after printing: leave
   the space, no digital signature, no serial-number workflow required.
2. A show changed after it is signed gets a **new version** of the sheet (replacement bout, postponement…).
3. **Youth fighters are normal fighters**: allowed to fight; the 16-year minimum age rule must not block them.
4. Late shows: put the demo shows on **dates at the end of this week** (the sheets' own dates are past).
5. Order of work: my choice.

## Order of work (each step finished, tested and documented before the next)
1. **Start time** on every match (event) — shown in the admin, on the fan site and on the sheet.
2. **Weekly board** (admin): rows = broadcaster, columns = day, a card per show (time, name, venue, sponsor, bouts).
3. **Printable program sheet** per show (letterhead, logos, bout table, space for signature + stamp, version).
4. **Bout label + rule per bout**, empty / "winner of bout N" corners, **guest (foreign) fighters**, **youth** allowed.
5. **Series templates** (show brand with defaults) + copy last week.
6. **Weekly checks** (double-booked fighter, same studio / broadcaster overlap, weekday vs date, weight gap).
7. **Excel import** of a week's bouts and **weekly reports**.
Then the demo week (the 19 sheets) is loaded on the dev database at the end of this week for testing.

## Open questions
- Exact sheet wording / layout: to be confirmed against the PDF the owner shared (letterhead, bout labels).
- Youth: any weight / age limits per label? (owner said "normal match" → none for now).

## Log
### 2026-10-13 — steps 1–3
- **Start time**: `events.start_time` "HH:MM" (migration `20261013180000_event_start_time`), API `startTime` (normalised, 422 for a bad value, "" clears; contract test in `events.test.ts`, suite 335/335). Admin: time field in New match / Edit details; shown on Matches rows, the next-match card and the match page. Fan site: home hero, event tiles and cards, event page (`formatTime`, Khmer digits). The two demo Saturday shows on the dev DB got 15:00.
- **Week board**: Matches › **Week** tab (`components/program/WeekBoard.tsx`): ‹ This week ›, broadcaster filter, summary (matches · bouts · broadcasters), desktop grid broadcaster × day with a card per match (time, name, place in the chosen language, main sponsor, bouts, status), phone list by day. EN + KM.
- **Program sheet**: `/events/:id/sheet` (`pages/ProgramSheet.tsx`, outside the admin frame), opened from the match page ("Program sheet"). Khmer layout like the official sheets: Kingdom/Nation-Religion-King heading, KKF logo + name, broadcaster and main-sponsor logos, title with the show name in red, venue · broadcaster, Khmer date + time ("១៥:០០ រសៀល"), table គូទី (number + rounds + label) · បង្គោលក្រហម · ទម្ងន់ · បង្គោលខៀវ (Khmer name, English name, club, association; foreign fighter in capitals + country), room for the date line, signature and stamp, "version N" (= 1 + recorded changes) and the print date. Print / Save as PDF from the browser, A4. Cancelled bouts are left out.
- Checked on a temporary admin on the test API (week board desktop + phone, sheet with a foreign fighter and a club association). Print preview itself not opened in the test browser.

### 2026-10-13 — step 4 (part 1)
- **Youth allowed**: the `min_age` matching rule ships **off** (migration `20261013190000_min_age_off`); KKF can switch it on in Settings › Matching rules. A 13-year-old's youth bout is accepted on the test API.
- **Bout label + rule set**: see `features/matches-results.md`. Add bout pickers, match page chips, sheet labels in Khmer (គូមិត្តភាព, គូអន្តរជាតិ, គូថ្នាលគុនខ្មែរ, គូវគ្គជម្រុះ, វគ្គផ្តាច់ព្រ័ត្រ, គូដណ្តើមពាន និងប្រាក់លាន), "MAS FIGHT" in the weight cell, "(នារី)" for women. Agreed weight is free (20–200 kg) with suggestions.
- **Guest fighters**: see `features/fighters.md` (no date of birth / height / ID needed for a foreign fighter).
- Contract suite 337/337 (new tests: start time, bout label/rule set, guest fighters, youth by default); backend typecheck clean; both frontends build. Checked on a temporary admin on the test API: guest fighter matched, MAS Fight and women's youth bouts, double-booking still blocked, sheet labels.
- Step 4 part 2 (empty corners + tournament draws) done 2026-10-14: `updates/empty-corners-draws.md`.

### 2026-10-14 — step 4 part 2
- Empty corners ("to be announced" / "winner of bout N") and tournament draws of 4 or 8: see `updates/empty-corners-draws.md`. Migration `20261014090000_empty_corners_draws`. Suite 344/344.
- Step 5 done 2026-10-14: `updates/show-templates-copy-week.md`.

### 2026-10-14 — step 5
- Shows list (templates), New match "Start from a show", copy a match to another date, Matches › Week "Copy last week here": `updates/show-templates-copy-week.md`. Migration `20261014120000_show_templates`. Suite 350/350.
- Step 6 done 2026-10-14: `updates/weekly-checks.md`.

### 2026-10-14 — step 6
- Weekly checks (`GET /events/week-checks`, Week board panel + card dots): `updates/weekly-checks.md`. No migration. Suite 352/352.
- Owner (2026-10-14): Excel import not needed (no offline template); priorities are fast entry → duplicate fighter warning → demo week → reports later.

### 2026-10-14 — fast bout entry
- "Add several bouts" page: `updates/fast-bout-entry.md`. No backend change.
- **Next**: duplicate-fighter warning when adding a fighter, then the demo week (19 sheets) on the dev DB; weekly reports later.

### 2026-10-14 — duplicate fighter warning
- `updates/duplicate-fighter-warning.md` (`POST /fighters/similar`, Add / Edit fighter box + save question). Suite 354/354.
- **Next**: the demo week (19 sheets) on the dev DB; weekly reports later.
