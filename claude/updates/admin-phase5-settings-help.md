# Update: Phase 5 — settings and help

| | |
|---|---|
| **Status** | Done (not committed) — 2026-09-28 |
| **Jira** | n/a |
| **Feature** | `features/settings.md` (new); fighters, events, matches, public site |
| **Requested by** | vannak070 |

## Current behavior
System Settings (`pages/SystemSettings.tsx`, lists in `data/masterData.ts`)
- Every list lives in the **browser** (`localStorage`): each staff member sees
  their own copy; the API and the fan site never see changes.
- Fighting Settings: 3 rule names (EN/KM), used nowhere else.
- Event Configurations: 7 organizer *names* (real organizers are user
  accounts; the list isn't shown when creating an event) and 7 venues (name,
  region, map point) used by Create Event / Create Fight Card.
- Match Settings: 14 weight ranges ("Under 45 kg" … "Over 80 kg") and glove
  brands. Weight ranges drive the fighter filters, the "weight class" on a
  fighter, and — through a **copied** list — the fan site's division standings.
  Tournaments use a **different** list of 12 named classes (51 kg Minimumweight
  … 95 kg Cruiserweight, `data/event-types.ts`).
- Champion Settings: sponsors (real, from the API — also on the Partners page)
  and 3 hard-coded "title templates".
- System Settings: 3 made-up entries (language, time zone, "cloud backup")
  that change nothing.
- "Can manage" is always true (`|| true`), so any role that reaches the page
  could edit.

Help (`pages/SystemProcessFlow.tsx`, menu "Process Flow")
- Written before Phases 3–4 and now wrong: says "No approval processes — all
  changes take effect immediately", covers only Super Admin and KKF Officer,
  and mentions rules the system doesn't enforce (medical certificates, rest
  periods). Organizers see it; clubs and officials don't have any help.

## Proposed plan
1. **Real settings in the database** (new migration + `/api/settings/*`):
   - **Weight classes**: name (EN/KM), min–max kg, order, active. One list for
     the whole system: fighter filters and classes, match creation,
     tournaments and the fan site's divisions (the copied lists go).
   - **Venues**: name, region, address/notes, map point, active. Event and
     fight-card forms pick from it (typing a new place stays possible).
   - **Bout rule presets**: name (EN/KM), rounds, round time, knockdown limit,
     glove size. Choosing one on "Create match" fills those fields.
   - **Glove brands**: brand + model, approved. Used by the match form.
   - Public read (the fan site needs weight classes); writes by KKF staff.
2. **System Settings page rebuilt** on those four lists: add, edit, reorder,
   deactivate (not delete when in use). Remove the fake parts: organizer names
   (organizers are accounts — Users page), the three "system configs", title
   templates, and the sponsor copy (Partners page has it).
3. **Help page** replacing Process Flow: "How Kun Khmer works" for the signed-in
   role — the real steps as built in Phases 3–4 (event → KKF approval → fight
   card → bouts → clubs accept → officials → weigh-in → results → fans), what
   each role does, and short answers to common questions. Linked from the menu
   for every role and from the profile menu.
4. Docs, contract tests, browser check per role (desktop + phone).

## Decisions (2026-09-28)
1. Weight classes start from the 14 current ranges ("Under 45 kg" … "Over 80 kg");
   fighter classes and fan-site divisions stay as they are. KKF edits later.
2. Only the **Super Admin** edits settings lists; KKF Officers see them read-only.
3. Help page in English and Khmer (language switch); the user reviews the Khmer.
4. Remove organizer names, "system configs", title templates and the sponsor copy.

## Impact
- API: new settings endpoints; existing responses unchanged.
- Database: new tables (migration); demo data gets the lists.
- Admin: SystemSettings, AddFighter, Fighters, FighterDetail, CreateEvent,
  CreateBatch, CreateMatchFromBatch, EventDetail, Layout menu, new Help page.
- Public site: divisions read the weight classes from the API.

## Acceptance criteria
- [x] Settings changes made by one staff member are seen by everyone and by the fan site.
- [x] No localStorage master data left; System Settings shows only real, working lists.
- [x] Help page is accurate for every role.
- [x] Contract tests + `CI=true` suite pass; admin build; browser check per role.

## Log

### 2026-09-28
- Migration `20260928000001_settings_lists`: `weight_classes`, `venues`,
  `bout_rules`, `glove_brands`, seeded with the lists the admin kept in the
  browser (14 weight ranges, 7 venues, 2 rule presets, 8 glove brands).
- Backend: `modules/settings/lists.ts` — one handler for the four lists (GET
  public/active, `?all=1` for staff; POST/PUT/DELETE Super Admin; field checks).
- Tests: new `settings-lists.test.ts` (16 cases); snapshots added only.
  `CI=true` 207/207; typecheck clean.
- Admin: System Settings rebuilt on the lists (add, edit, reorder, deactivate,
  delete; officers read-only); fake parts removed (organizer names, system
  configs, title templates, sponsor copy); `hooks/useSettingsLists.ts` feeds
  fighter classes/filters, Create Event (venues + tournament weight class),
  Create Fight Card (venues), Create Match (glove brands + new rule preset
  picker); `data/masterData.ts` reduced to glove sizes; Share Fight Card reads
  real sponsors. Help page (EN/ខ្មែរ) replaces Process Flow (deleted);
  `settings.manage` for Super Admin, `process.view` removed; Noto Sans Khmer
  font added.
- Public: `data/weightClasses.ts`; divisions (Rankings), home and club fighter
  cards use the API list; the copied list is gone.
- Browser check (temporary officer + test venue, deleted after): admin adds a
  venue (server check shown in the dialog), reorders it, it appears in Create
  Event; rule preset fills Create Match; Help in English and Khmer; officer
  sees Settings read-only; fan-site Rankings from the API; phone width.
- Create Match / titles use a separate agreed-weight list (51, 54, 57 … kg,
  `data/champion.ts`) — kept separate by the user's decision.
- Fixed: Create Event's map search stored `lon` instead of `lng`, so the
  coordinates after a search were wrong (and the coordinate display could
  crash). Checked: searching "Kampot" shows 10.631475, 104.132637.
- Fixed: the Help menu group gave the sidebar a duplicate React key (console
  warning); untitled groups now get unique keys.

