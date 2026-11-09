# Update: Program sheet like KKF's paper + print the whole week

| | |
|---|---|
| **Status** | Done 2026-11-09 (uncommitted, not live) |
| **Jira** | n/a |
| **Feature** | claude/features/weekly-program.md (step 3 sheet, step 2 Week board) |
| **Requested by** | Owner, from the 25 sheets of 6–11 Nov 2026 (`កម្មវិធីប្រកួត (4).pdf`): "start 1 and 2", "use your recommendations" |

## Current behavior
`/events/:id/sheet` prints one show: letterhead, logos, title, Gregorian date, time, venue, bouts (rounds, women tag,
club + association), signature/stamp space. Six bout labels; rule sets Kun Khmer and fingerless gloves (`mas_fight`,
printed in the weight column). Draws print the list of their fighters. No week print.

## Requested change
1. **Sheet like the paper**
   - Lunar-date line under the title, worked out from the match date: `ថ្ងៃសៅរ៍ ១២រោច ខែអស្សុជ ឆ្នាំមមី អដ្ឋស័ក` (no Buddhist year — owner, 2026-11-09)
     (automatic, no manual override — owner took the recommendation).
   - Signing-date line above the stamp (lunar + Gregorian, Phnom Penh), today by default, changeable before printing.
   - New bout labels: `title_fight` គូដណ្តើមខ្សែក្រវាត់, `title_defense` ការពារខ្សែក្រវាត់ (picked automatically when the
     bout is linked to a title: holder fighting → defence, vacant → fight for the belt), `points_belt`
     គូខ្សែក្រវាត់សន្សំពិន្ទុ, `cash_prize` គូដណ្តើមប្រាក់លាន, `candidate` បេក្ខភាពដណ្តើមពាន, `other` + free text.
   - Draw name ("ដណ្តើមពាន និងប្រាក់លាន BOOSTRONG"): printed as `បេក្ខភាពគូម៉ារ៉ាតុង{name} ក្នុងប្រភេទទម្ងន់ … KG`.
   - Rule set `kick_boxing`: weight cell prints `KICK BOXING 63,5 KG` in red.
   - Rule set `fingerless` (Kun Khmer with fingerless gloves): `ហ្គង់ចេញម្រាម` printed under the bout type, as on the
     paper. (`mas_fight` stays its own rule set — it is not the fingerless-glove bouts.)
2. **Print the week**: "Print the week" on the Week board → one page with every published show's sheet, one A4 page
   each; date range chosen (defaults to the board's week); untick shows; order **by TV station** (as KKF's PDF), then
   date and time, shows without a station last; drafts left out; document title = PDF file name
   `កម្មវិធីប្រកួត ០៦–១១ វិច្ឆិកា ២០២៦`.

## Scope
Out of scope: Telegram sharing, importing the PDF, draws without pairings (next steps).

## Impact
- API: additive — new allowed values for `boutLabel` / `ruleSet`, new `boutLabelText` and draw `name`. Snapshots only
  gain fields.
- Migration `20261109090000_bout_label_text_draw_name`: `matches.bout_label_text`, `matches.draw_name` (both nullable).
- Admin: Add bout, Quick bouts, Draw dialog, ProgramSheet, Week board, new week-sheet page; i18n EN + KM.

## Acceptance criteria
- [x] Lunar line correct for every sheet date in the 6–11 Nov PDF and for known holidays 2023–2026.
- [x] New labels / kick boxing / fingerless / draw name saved, refused when invalid, printed like the paper.
- [x] Week print: one document with all published shows of the range, one per page, in station order.

## Log
- 2026-11-09: built.
  - `frontend/admin/src/app/utils/khmerLunar.ts` (chhankitek rules, counted from KKF's printed 10 Nov 2026 = ១កើត ខែកត្តិក).
    Checked: all dates of the 6–11 Nov 2026 PDF, Water Festival 2023–2026, Pchum Ben 2023–2025, Visak 2023–2026
    (2026: 1 May). The Buddhist year is not printed (owner: not important). Animal year / era change on 14 April (the
    real change is at the New Year hour; dates 13–16 April may be a day off).
  - Backend: `BOUT_LABELS` +6, `RULE_SETS` + `kick_boxing`, `fingerless`; `boutLabelText` (needed for "other",
    ≤ 120); draw `name` → `draw_name` on every bout of the draw. Serializer adds `bout_label_text`, `draw_name`
    (11 snapshots gained these two fields only). Tests `api-tests/tests/sheet-labels.test.ts`. Suite 406/406.
  - Admin: `ProgramSheet.tsx` now exports `SheetArticle`, `SheetToolbar`, `SHEET_CSS`; title bouts print
    ការពារខ្សែក្រវាត់ when the title's holder fights, otherwise គូដណ្តើមខ្សែក្រវាត់; "ក្លឹប" is added to club names
    that don't start with it. New `pages/WeekSheet.tsx` (route `/events/week-sheet`), "Print the week" on the Week
    board, "Other" text box in Add bout / Quick bouts, tournament name in the Draw dialog. Build OK.
  - Browser check on the test API: single sheet (draw line with name, qualifiers, final "winner of bout N",
    other + fingerless, cash prize, lunar + signing lines) and the week print (6 sheets, station order, draft left
    out, title "កម្មវិធីប្រកួត ១៦–២២ វិច្ឆិកា ២០២៦").
