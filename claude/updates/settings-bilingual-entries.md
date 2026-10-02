# Update: Settings lists in Khmer and English (the entries, not just the page)

| | |
|---|---|
| **Status** | Done (2026-10-02, uncommitted); owner chose Khmer names for venues and associations (+ Khmer association on clubs), defaults for the rest |
| **Feature** | claude/features/settings.md, claude/updates/settings-khmer.md |
| **Requested by** | vannak070 ("Setting, I need to have Khmer and English. Please review and provide me plan") |

## Review (2026-10-02)
- The **page itself** is already English + Khmer (`set.*` keys, `settings-khmer.md`, 2026-09-30), including the new Associations tab. The language follows the admin's language button.
- The **entries** are only partly bilingual:
  | List | English name | Khmer name |
  |---|---|---|
  | Weight classes | yes | yes (`name_khmer`) |
  | Bout rules | yes | yes (`name_khmer`) |
  | Venues | yes (+ region, notes) | no |
  | Glove brands | brand + model | no (proper names) |
  | Associations | yes (one field) | no |
- Khmer names that exist are only partly used: the admin shows bout-rule Khmer names (Add bout) and weight-class Khmer names (Fighters, Fighter pages, via `className(cls, lang)`); venues, glove brands and associations have no Khmer anywhere; the fan site uses the weight-class Khmer name only.
- A club stores its association (and an event its venue) as plain text copied at save time, so one language only.

## Plan
1. **Data (additive migration)**: `name_khmer` on `venues` and `associations`; `region_khmer` on venues; `association_khmer` on `clubs` (copied with `association` when a club is saved). Glove brands unchanged (brand names).
2. **API**: the list endpoints and the club endpoints accept and return the new fields (null when empty); snapshots change only by those lines; contract tests.
3. **Settings page**: every list's Add / Edit form shows two clear fields, "Name (English)" and "Name (Khmer)" (required: English or Khmer, at least one); each row shows both; Khmer names set in Khmer labels, English in English.
4. **Use the language everywhere in the admin**: one helper `listName(row, lang)` (Khmer name when the language is Khmer and one exists, otherwise English); apply to weight classes (Fighters, Fighter, Club, Add fighter), venue pickers (event, fight night, fight card), bout rules and associations (club form dropdown, Clubs list, Club detail).
5. **Public site**: club page shows the association in the visitor's language (`association` / `association_khmer`); weight classes already do.
6. **Docs, tests, check** in Khmer + English at desktop and phone width.

## Open questions
1. Which lists need a Khmer name? Default: venues and associations (weight classes and bout rules already have it; glove brands are brand names).
2. **Venue text saved on an event**: events keep one text for the place. Default: save the English name; the public site and admin show the venue's Khmer name in Khmer when it matches a list entry. (Alternative: save both names on the event.)
3. Associations on clubs: default = copy both names onto the club (rename in Settings does not change saved clubs, as today).

## Built (2026-10-02)
- DB (migration `20261002000001_settings_khmer_names`): `venues.name_khmer`, `venues.region_khmer`, `associations.name_khmer`, `clubs.association_khmer`.
- API: `/settings/venues` and `/settings/associations` accept / return `nameKhmer` (+ `regionKhmer` for venues); clubs accept `associationKhmer` and return `association_khmer`. Contract tests (set, clear, club copy); suite 281/281, snapshots only gained the new fields.
- Admin Settings: venues and associations forms have "Name (English)" + "Name (Khmer)" (+ "Region (Khmer)"), rows show the Khmer name in the detail line.
- Admin: helpers `listName`, `venueFor`, `usePlaceName` (`hooks/useSettingsLists.ts`). Venue place shows in Khmer (when it is a listed venue with a Khmer name) on Fight nights, the fight-night page and Program overview; the venue picker offers the Khmer name as the option label; Add / Edit club dropdown shows the Khmer association name in Khmer and saves both names on the club; Clubs list and Club detail show the association in the chosen language (search matches both).
- Public: `data/venues.ts` (`usePlaceName`) shows a venue's Khmer name in Khmer on the home hero card, event tiles and event cards, and the event page; the club page shows `association_khmer` in Khmer.
- Events still save the English venue name as text (decision 2 default); an unlisted or hand-typed place shows as typed.
- Checked on a temporary admin on the test API: Add venue dialog with the Khmer fields, saved a venue with a Khmer name, an event at that venue shows the Khmer name in Khmer on Fight nights, the club dropdown shows the Khmer association name in Khmer. Not browser-checked: the public site pages (built OK), phone width.
- Live pilot: needs migration `20261002000001` and a rebuild; the Super Admin then fills the Khmer names of the venues and associations in System Settings.
