# Feature: Settings lists and Help

| | |
|---|---|
| **Status** | Done — admin Phase 5, 2026-09-28 (see `updates/admin-phase5-settings-help.md`) |
| **Jira** | n/a |
| **Figma** | n/a |
| **Owner** | vannak070 |

## Goal
The lists every form uses — weight classes, venues, bout rule presets, glove
brands — are shared by everyone (database, not the browser), edited in one
place by the Super Admin, and read by the fan site. A Help page explains the
system to each role in English and Khmer.

## Users and roles
- **Super Admin**: add, edit, reorder, deactivate, delete entries.
- **KKF Officer**: sees the lists (read-only) on System Settings.
- **Everyone** (incl. the public API): reads active entries.

## Data (migration `20260928000001_settings_lists`)
| Table | Columns |
|---|---|
| `weight_classes` | name, name_khmer, min_kg, max_kg (either may be null for "Under …"/"Over …") |
| `venues` | name, region, description, latitude, longitude (both or neither) |
| `bout_rules` | name, name_khmer, rounds (1–12), round_time (minutes, 1–5), knockdown_limit (0–10), glove_size |
| `glove_brands` | brand, model |
All have `sort_order`, `active`, timestamps. The migration seeds the lists the
admin kept in the browser before (14 weight ranges, 7 venues, 2 presets, 8
gloves). Events and bouts copy the values, so edits never change past records.

## API (`backend/src/modules/settings/lists.ts`)
`/settings/{weight-classes,venues,bout-rules,glove-brands}`:
GET public (active, in order; `?all=1` with a KKF staff token adds inactive),
POST / PUT `/:id` / DELETE `/:id` Super Admin. Snake_case rows with numbers
as numbers; `sortOrder` and `active` on PUT.

## Business rules
- A fighter's class = the class with the lowest `max_kg` ≥ their weight; above
  all → the class with no maximum (`weightClassFor` in both frontends).
- Bout rule presets fill Create Match's rounds, round time, knockdown limit,
  glove size; the fields stay editable.

## Frontend
- Admin `pages/SystemSettings.tsx` (`?tab=`): the four lists; `settings.view`
  (staff) to see, `settings.manage` (Super Admin) to edit.
- Admin `hooks/useSettingsLists.ts`: cached lists, `useWeightClasses`,
  `gloveLabel`, `venuePin`. Used by Fighters, FighterDetail, AddFighter,
  CreateEvent (venues, tournament weight class), CreateBatch (venues),
  CreateMatchFromBatch (glove brands, rule presets). `data/masterData.ts`
  keeps only the fixed glove sizes.
- Public `data/weightClasses.ts`: division standings (Rankings, in the list's
  order, Khmer name when set), fighter cards on home and club pages.
- Admin `pages/Help.tsx` (`/home/help`, menu for every role and in the profile
  menu; `/home/process-flow` redirects): your role's tasks with links, the
  event-to-result steps, fighter verification, common questions; English /
  ខ្មែរ switch remembered per browser. Admin now loads Noto Sans Khmer.

## Tests
`api-tests/tests/settings-lists.test.ts`.

## Open questions / gaps
- By decision (2026-09-28) Create Match and championship titles keep their own
  agreed-weight list (51, 54, 57 … kg in `data/champion.ts`): bouts are made at
  an agreed weight and titles match on it. The official weight classes above
  are for grouping fighters (lists, rankings, tournaments).
- The Khmer wording on Help needs a review by the federation.
