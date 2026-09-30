# Feature: Public champions page

| | |
|---|---|
| **Status** | Done — committed 501063af (2026-09-29, pushed) |
| **Jira** | n/a |
| **Figma** | n/a (light site style, `features/public-site.md`) |
| **Owner** | vannak070 |

## Goal
Fans see every official KKF title — who holds it now, since when, how many defenses — and each title's
history (crowned, defended, lost), from the federation's records. Official titles, not a ranking.

## Users and roles
Public visitors (read only). Titles are managed in the admin (Champions, title fight results).

## API
No new endpoints: `GET /champions` (list, via fan data: approved titles only) and `GET /champions/:id`
(`defenses[]` = title history). The winner of each history entry comes from the bout (`match_id`) in the
public bouts list; without it the entry falls back to the stored opponent name.

## Frontend (`frontend/public`)
- `/champions` — `pages/Champions.tsx` `ChampionsPage`: light header + stats (titles, champions, vacant),
  titles grouped by type (KKF titles · International titles · Special belts · Awards · Other), weight
  ascending. Card: title, type, weight, holder photo + name + club, since date, defenses; vacant titles
  marked "Vacant" (awards: "Not awarded yet"). Card opens the title page.
- `/champions/<words>-<code>` (`data/links.ts` `championPath`) — `ChampionPage`: title header (belt picture
  when real), current champion card (link to the fighter, record, since, defenses, last defense) or Vacant,
  title history newest first (date, event link, what happened, method/round), "Ask about this".
- Entry points: Fighters page header link "All titles", the champions stat, the fighter page Champion badge.
- Sitemap lists `/champions` and each title; KUNKHMER HUB `list_champions` links to the title page.

## Business rules (owner decisions 2026-09-29)
- Vacant titles are listed, marked Vacant.
- Each title shows its history.
- Never show internal fields: approval status, notes, "Inactive" / "Title Defense Scheduled" statuses,
  next defense deadline. A holder that isn't public (deleted / unverified) shows the stored name, no link.
- No ranking or ordering by "best": grouped by type, then weight.

## Acceptance criteria
- [x] List shows every approved title incl. vacant ones, in EN and KM, desktop + phone.
- [x] Title page shows holder and history; short/unknown link → readable link / not found.
- [x] Entry points and sitemap; typecheck + contract suite pass.

## Log
### 2026-09-29
- Built `pages/Champions.tsx`, routes, `championPath` (fan site + backend `lib/links.ts`), texts EN + KM
  (Khmer title-type wording for KKF to check), Fighters page "All titles" link, fighter Champion badge →
  title page, sitemap (`/champions` + approved titles), Hub `list_champions` URLs.
- Checked on the test API (16 titles, 2 vacant): list, title page with history "took the title from" →
  "defended", event links, not-found, Champion badge link, phone width (no overflow), Khmer. Dev data has
  no titles yet → "No titles have been announced yet". Contract suite 249/249, typechecks clean.

## Tests
`api-tests/tests/seo-login.test.ts` (sitemap entry). UI checked in the browser with `?demo=1` and the test API.
