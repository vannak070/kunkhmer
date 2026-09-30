# Update: Khmer in the admin side menu

| | |
|---|---|
| **Status** | Done (2026-09-30, uncommitted) — waiting for owner review; KKF to review the Khmer wording |
| **Jira** | n/a |
| **Feature** | claude/updates/program-officer-friendly.md (English / Khmer switch) |
| **Requested by** | vannak070 (2026-09-30: "add Khmer to the admin side menu") |

## Current behavior
The Program, Fighters and Clubs screens switch between English and Khmer (`i18n/program.ts`, language
button on each of those pages), but the side menu (`components/Layout.tsx`) and the header around it are
English only — an officer reading Khmer still sees an English menu, and there is no language button on
pages without their own (Dashboard, Media, Help …).

## Requested change
- Side menu in Khmer when Khmer is chosen: every item, sub-item and group title, the phone bottom bar and the
  "Menu" button.
- The frame around it too: "Management system", profile menu (My profile / Help / Settings / Sign out), the
  to-do bell tooltip, the "Not available for your role" message.
- A language button in the side menu (bottom, above the account row), so the choice can be made on any page.
  Same stored choice as the page buttons (`kkf_admin_lang`).

## Scope
Out of scope: translating the pages that are still English (Dashboard, Media, Partners, Hub answers,
Knowledge base, Users, Officials, Settings); the language buttons already on Program / Fighters / Clubs pages
stay where they are. Role names (Super Admin, KKF Officer …) stay as the API names them. KKF reviews the Khmer.

## Impact
API / database: none. Frontend: `components/Layout.tsx`, `i18n/program.ts` (`menu.*`, `frame.*` strings).

## Acceptance criteria
- [x] Menu, groups, sub-items, bottom bar and profile menu in Khmer after switching; back to English the same way.
- [x] Language button works from a page without its own (e.g. Dashboard) at desktop and phone width.
- [x] Menu still opens the right group for the current page; permissions unchanged; admin build passes.

## Log
### 2026-09-30
- `i18n/program.ts`: 38 new strings in English + Khmer (`menu.*` for items, sub-items and group titles;
  `frame.*` for "Management system", profile menu, bell tooltip, blocked-page message, phone "Menu").
  Program's own entries reuse `program.title` / `program.tab.*`.
- `components/Layout.tsx`: `MENU_TEXT` maps each English label (still the item's id, so opening the right
  group and permissions are unchanged) to its text key; `<LangSwitch />` at the bottom of the side menu.
- Checked on a temporary admin on the test API (not the dev session): Dashboard in English → button → whole
  menu, group titles and the button itself switch (choice stored in `kkf_admin_lang`); Fighters page opens
  its group with "គុនខ្មែរ / បរទេស"; phone width bottom bar in Khmer, no sideways scroll, no clipped labels.
  Admin `vite build` passes; the two changed files add no TypeScript errors.
- Left as is: pages that are still English (Dashboard, Media, Partners, Hub answers, Knowledge base, Users,
  Officials, Settings), and the language buttons already on Program / Fighters / Clubs pages (so those pages
  now show two — one in the menu, one on the page).
