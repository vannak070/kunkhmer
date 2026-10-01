# Update: Club association field

| | |
|---|---|
| **Status** | Done (2026-10-01, uncommitted); revised same day: now a Settings list + dropdown |
| **Feature** | claude/features/clubs.md |
| **Requested by** | vannak070 (clubs register under an association, e.g. សមាគមកីឡាកងយោធពលខេមរភូមិន្ទ) |

## Decision
No associations table (owner: "don't need to enable table"). One optional free-text field `association` on the club, entered when adding or editing a club. Owner answers: optional, one field only.

## Change
- DB: `clubs.association` VARCHAR(255) NULL, migration `20261001000001_club_association` (additive).
- API: `POST/PUT /clubs` accept `association` (`""` clears it on PUT); club rows return `association` (so every snapshot that embeds a club gained that one line; no other shape change).
- Admin: Add/Edit club "Association (optional)" with suggestions from the other clubs' values (same spelling every time); Clubs list shows it under the location and the search includes it; Club detail shows "Association: …" (EN + KM).
- Public: club page shows it in the key facts and the Details card (hidden when empty; EN + KM).
- Not done: association pages / filter, an Association login role.

## Log
2026-10-01: typecheck clean; contract suite 276/276 (CI mode, 15 snapshots updated, diff = only `association` lines); checked the form and the club detail on a temporary admin on the test API.
Live pilot: needs the migration (applies on deploy) and the association typed for each club in the admin.

## Revision (2026-10-01, owner: "when add new club I need dropdown to select, set up association under settings by enabling a new tab")
- New **System Settings list "Associations"** (new tab, Super Admin edits, staff read, like venues): table `associations` (name, sort_order, active, timestamps), migration `20261001000002_associations_list`, API `/settings/associations` (same rules as the other lists; the list starts empty, no seed). Code: `settings/lists.ts`, `SystemSettings.tsx`, `useSettingsLists.ts`, `set.*` keys EN + KM.
- **Add/Edit club**: the Association field is now a dropdown of the active associations ("— No association —" first). A club saved with a name that is no longer in the list keeps it as an extra option. Empty list → hint with a link to System Settings (Super Admin) or "ask the Super Admin".
- Clubs still store the **name as text** (`clubs.association`, no foreign key), like venues on events: renaming or deleting a list entry never changes saved clubs, and the club API shape is unchanged from the first step. The API does not reject a name that is not in the list.
- Only the Super Admin can add an association; a KKF Officer adding a club picks from the list.
- Tests: settings-lists contract tests cover the new list (shape snapshot, roles, name required); suite 279/279 in CI mode.
