# Update: Remove unused files and dead imports

| | |
|---|---|
| **Status** | In progress |
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
- [ ] Re-running the reachability scan finds no unused files.
- [ ] `vite build` passes for both apps; admin and public load in the browser.

## Log
