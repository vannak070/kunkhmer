# Update: Default fighter avatar

| | |
|---|---|
| **Status** | Done (2026-10-02, committed f21fac21; not on the live pilot yet) |
| **Jira** | n/a |
| **Feature** | claude/features/fighters.md, claude/features/public-site.md |
| **Requested by** | vannak070 (2026-10-02: "use it as the default fighter avatar") |

## Current behavior
A fighter without a real photo shows their initials (e.g. "PD") on a coloured circle or block, in the admin and
on the fan site. Stock photos (Unsplash) count as "no photo".

## Requested change
Show the KKF default fighter avatar instead of the initials: the kneeling fighter cut from the KKF emblem
(navy figure on the light brand background `#EEF3FB`), made 2026-10-02 from the owner's logo file
(`~/Documents/KunKhmer-Assets/kkf-fighter-avatar-1024.png`).

- It is shown at render time only. Nothing is saved to the database: a fighter's `image` stays empty, so a
  real photo uploaded later replaces the default everywhere at once.
- An empty corner (fighter not chosen yet, "TBA") keeps the "?" placeholder — the avatar stands for a fighter
  with no photo, not for a missing fighter.
- Clubs, officials, staff accounts and federation leaders keep their initials (not fighters).

## Why
Owner decision: a consistent KKF look instead of letters. It is a federation emblem, not a photo of a person,
so it doesn't break the public-site rule "no fake photos" (`features/public-site.md`).

## Scope
In scope — every place that shows a fighter picture:
- Admin: `components/program/shared.tsx` `FighterAvatar` (fighters list, fight night, results, weigh-in,
  Add bout), `pages/FighterDetail.tsx` header.
- Fan site: `components/event/EventParts.tsx` `FighterAvatar` (bout rows, face-off, compare, fighter history,
  champion holder on partner pages), `pages/FightersDirectory.tsx` `FighterCard` (fighters page, home
  "featured"), `pages/SuperAppFighterDetail.tsx` profile portrait, `pages/Champions.tsx` holder photo,
  `components/layout/GlobalSearch.tsx` fighter results.

Out of scope: the Add / Edit fighter form's upload box (still an "add photo" slot); share-preview images
(`og:image`) — a fighter without a photo still has none; home "featured fighters" still lists fighters with real
photos first.

## Impact
- API / database: none.
- Frontend: the files above; new image `src/assets/fighter-default-avatar.webp` in both frontends (512 px, 19 KB).

## Acceptance criteria
- [x] Every fighter without a real photo shows the avatar in the admin and on the fan site (desktop and
      phone; checked in English — the picture has no text, so Khmer is the same); fighters with a photo unchanged; empty corners still "?".
- [x] Both frontend builds pass.

## Log
### 2026-10-02
- New image `src/assets/fighter-default-avatar.webp` in both frontends (512 px, 19 KB, from the owner's KKF
  emblem); fan site exports it from `data/fighterAvatar.ts`, admin from `components/program/shared.tsx`
  (`DEFAULT_FIGHTER_AVATAR`).
- Admin: `FighterAvatar` shows a real photo, else the avatar (corner tone becomes a red / blue ring), else "?"
  for an empty corner; Unsplash stock links count as no photo. `FighterDetail` header uses the avatar.
- Fan site: `EventParts.FighterAvatar`, `FightersDirectory.FighterCard`, the profile portrait
  (`SuperAppFighterDetail` `NoPhoto`, also when a photo link fails to load), `Champions` holder photo and
  the search results use the avatar; cards and the portrait show it whole (`object-contain` on `#eef3fb`).
- Checked on temporary copies of both sites on the test API (two fighters without a photo, one with): fan
  site fighters page (desktop + phone), profile, next-fight face-off, fight card row, search; admin fighters
  list, fighter page. Fighters with a photo unchanged. Both `vite build`s pass; changed files add no TypeScript
  errors. Live pilot not changed yet (needs commit + deploy).

