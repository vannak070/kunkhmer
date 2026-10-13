# Update: No stock photo for clubs without a banner

| | |
|---|---|
| **Status** | Done (2026-10-13, committed f21fac21; not on the live pilot yet) |
| **Jira** | n/a |
| **Feature** | claude/features/clubs.md, claude/features/public-site.md |
| **Requested by** | vannak070 (2026-10-13: "fix the AddClub stock photo bug") |

## Current behavior
Add / Edit Club (`frontend/admin/src/app/pages/AddClub.tsx`) saved
`image: formData.image || "https://images.unsplash.com/photo-1540206351-…"`: a club saved without a banner
photo got an unrelated Unsplash stock photo (a woman swimming) as its picture — on create, and again on every
edit after the banner was removed. Found 2026-10-02 while making the staff guide. On the API, an empty `image`
on `PUT /clubs/:id` was ignored (`pick()` skips empty values), so a banner could not be removed at all.

## Requested change
- A club without a banner saves no picture (`image` empty → null). Lists and pages already fall back to the
  club's logo or initials; the fan site already hides stock photos.
- Removing the banner on Edit Club really removes it: `PUT /clubs/:id` with `image: ""` clears it (same rule as
  `logoUrl` and `association`).
- Fighter pictures on two older admin pages that still fell back to stock photos of people now use the KKF
  default fighter avatar (`updates/fighter-default-avatar.md`): Match page (`MatchDetail.tsx`) and Champion
  history (`ChampionHistory.tsx`).

## Scope
Out of scope: the admin News list's render-time stock picture for articles without a picture (`News.tsx`; not
saved, admin only); existing database rows — the live pilot has no club with a stock photo (checked 2026-10-13).

## Impact
- API: `PUT /clubs/:id` accepts `image: ""` to clear the picture (response shape unchanged).
- Database: none (no migration).
- Frontend: `AddClub.tsx`, `MatchDetail.tsx`, `ChampionHistory.tsx`.

## Acceptance criteria
- [x] New club without a banner → `image` null; Clubs list shows initials / logo, no stock photo.
- [x] Edit a club, remove its banner, save → banner gone.
- [x] Contract test for clearing the image; full suite passes; backend typecheck clean; admin build passes.

## Log
### 2026-10-13
- `AddClub.tsx`: saves `image: formData.image` (empty when no banner) instead of the Unsplash default.
- `backend/src/modules/clubs/routes.ts`: `PUT /clubs/:id` with `image: ""` clears the banner (`present()`,
  like `logoUrl`); before, `pick()` dropped the empty value so a banner could never be removed.
- `MatchDetail.tsx`, `ChampionHistory.tsx`: fighter pictures fall back to the KKF default avatar (real photo
  first; Unsplash links count as no photo) instead of stock photos of people.
- New contract test in `api-tests/tests/clubs.test.ts` (no banner → `image` null; a banner stays on unrelated
  edits; `image: ""` removes it). Backend typecheck clean; full suite **282/282**; admin `vite build` passes;
  changed admin pages add no TypeScript errors.
- Browser check on a temporary admin on the test API: a new club saved without a banner has `image` null and the
  Clubs list shows its initials; removing a banner on Edit Club and saving leaves `image` null.
- Data: the dev DB and the live pilot (9 clubs, checked 2026-10-13) have no club with the stock photo.

