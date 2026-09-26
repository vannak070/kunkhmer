# Update: Remove unused files and dead imports

| | |
|---|---|
| **Status** | Done |
| **Jira** | n/a |
| **Feature** | repo-wide (frontends) |
| **Requested by** | vannak070 |

## Current behavior
Both frontends carry files no entry point reaches (traced from `src/main.tsx`
through every import, including `figma:asset/` and `@/` aliases): unused
shadcn components, unrouted admin pages, old home sections, mock data files,
images, empty CSS, stray favicons, plus imports that are never used.
`backend/` and `api-tests/` have no unused files.

## Requested change
Delete every unused file and dead import; move `frontend/admin/src/app/utils/workflowRules.md`
to `claude/features/kkf-workflow-rules.md`; remove local `.DS_Store` and `dist/`.

## Scope
In scope: `frontend/admin`, `frontend/public`, local untracked junk.
Out of scope: backend, api-tests, migrations, admin pages that are reachable
but still on mock data (known gaps in `claude/config.md`).

## Impact
- API response shape changes? No. Database? No.
- Frontend behavior: none intended — only unreachable code removed.

## Acceptance criteria
- [x] Re-running the reachability scan finds no unused files.
- [x] `vite build` passes for both apps; admin and public load in the browser.

## Log

### 2026-09-26
- Committed by the user in `d4fe0ab2` ("1"), together with the home redesign.
- Deleted 124 tracked files (~18k lines): public — all 48 `components/ui/*`,
  `HeroSection`, `SponsorsSection`, `TrendingFightersSection`, 11 mock `data/*`
  files, `hooks/usePermissions.ts`, 3 images (4.8 MB), empty `globals.css`, root
  `favicon.png`; admin — 37 unused `components/ui/*`, unrouted pages
  `AwardsSetup`, `CreateAward`, `Store`, `SystemSettingsEnhanced`,
  `EventsRedirect`, components `ShareFightCard`, `FightCardPoster`,
  `ChampionshipCard`, `KKFDetailModal`, `figma/ImageWithFallback`, 3 mock data
  files, `improvedWorkflowValidation.ts`, 2 images, empty `globals.css`,
  0-byte `favicon.ico`, `default_shadcn_theme.css`.
- Dead imports removed in 11 files (admin `routes.tsx`, `KKFWorkflow*`,
  `SystemSettings`, `Matches*`, `AddClub`, `BatchDetail`; public `SuperAppHome`).
- `workflowRules.md` → `claude/features/kkf-workflow-rules.md`.
- Local only: `.DS_Store` files and `dist/` folders removed.
- Verified: rescan finds 0 unused files; `vite build` passes for both apps
  (in containers); `tsc` shows no missing-module or missing-name errors caused
  by the removals (123 older admin / 18 older public type errors remain);
  browser: public home, admin dashboard, Program (matches, champions tabs),
  KKF workflow and matches-old load with no console errors.
- `claude/config.md` known gaps and `public-site.md` updated.
