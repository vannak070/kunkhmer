# Update: admin step 3 — old pages rebuilt in the simple style

| | |
|---|---|
| **Status** | In progress, pushed (Clubs, Titles, Match page done; Help, ShareFightCard chrome, Not found left) |
| **Jira** | n/a |
| **Feature** | claude/features/admin-pwa.md (step 3), clubs.md, champions.md |
| **Requested by** | Owner ("go ahead with step 3") |

## Current behavior
About a dozen admin pages still used the old dense style, English only, with fields the server ignored.

## Requested change
Rebuild them like the Program pages: short, big touch targets, English + Khmer (`useT()`), real data only, one clear next step.

## Why
Officers are low-experience and mostly Khmer-speaking; the app is becoming a phone-installed PWA.

## Scope
In scope (done):
- **Clubs** list + **Add / edit club** (Khmer name, association, logo/banner, map; delete only with no fighters, with a plain message). Edit/delete permission is `clubs.manage`.
- **Titles**: list (All / Has a champion / Vacant, search), title page (champion, history lines from results, vacate, delete for Super Admin), **add / edit** (`/home/champion/:id/edit`; can set the current champion, so a belt that existed before the system no longer needs a fake title bout), **Schedule a title bout** (pick the fight card, continue to Add bout).
- **Match page** (`/home/match/:id`): corners with photo, club and record, title/rounds/weight, fight night, result (staff record or change it; changing a title winner asks first), referee and judges. Same logic as the Results page.
Out of scope / still to do: Help, ShareFightCard chrome (the poster keeps Moul + html2canvas), Not found, MatchProposals (dormant while approvals are off).

## Impact
- API response shapes: none. Database: none.
- Removed pages: CreateBatch, MatchCreatedSuccess, ChampionHistory. `matches/new`, `matches/created`, `matches/:id/edit` and `champion/:id/history` now redirect (fight nights list / fight card / title page). Home "Create a fight card" opens the fight nights list.
- The Match page's "highlight video" field is gone: the server never stored it (`highlight` does not exist in the backend).
- New texts: `cl.*`, `cf.*`, `ti.*`, `td.*`, `tf.*`, `tt.*`, `sb.*`, `bo.*` in `i18n/program.ts` (EN + KM) — Khmer wording needs the KKF review.

## Acceptance criteria
- [x] Club list, form, delete-with-fighters message; title list/detail/form/schedule; match page — typecheck clean for these files.
- [x] Browser-checked on the test API: titles list + detail + edit (EN), title page + match page (KM, 375 px), result save, changing a title winner (confirm, belt moved, history line correct).
- [ ] Browser check of club delete / title vacate / title delete.
- [ ] Help, ShareFightCard, Not found.

## Log
- 2026-10-13: clubs, titles, redirects, deleted old pages and title texts are in the owner's commit 399e58f8. the Match page, `bo.*` texts and this doc followed in the later pushed commits (dev 11253144). API suite 319/319 (after merging the medical-privacy commit 2ed5b773).
