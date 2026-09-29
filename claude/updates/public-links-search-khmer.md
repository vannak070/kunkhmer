# Update: Readable news / event links, wider search, Khmer fighter labels

| | |
|---|---|
| **Status** | Done (not committed) |
| **Jira** | n/a |
| **Feature** | claude/features/public-site.md |
| **Requested by** | vannak070 (2026-09-29, website review plan step 1) |

## Current behavior
- News pages were `/article/<uuid>` and event pages `/events/<uuid>`.
- Header search covered fighters, events and news only.
- Khmer site showed nationality ("Cambodian") and fighting style ("aggressive, boxing") in English.
- Admin match page badge said "Ranking Fight" for every fight (read `is_championship_bout`, not sent by the API).

## Change
- `frontend/public/src/app/data/links.ts`: `eventPath`, `articlePath`, `eventPathById`, `findByLink`.
  Link = title/name words (news: English title first) or the date for Khmer-only names, plus the first
  8 characters of the id: `/news/kombat-x-kun-khmer-b21c3120`, `/news/2026-06-16-bb786c51`,
  `/events/cambodia-world-kun-khmer-b9404f10`. The code keeps a link working after a rename. Full-id
  links and `/article/:id` still open and switch (replace) to the readable link, keeping `?view=`.
  Every event/news link on the site uses it (home, matches, news, partner/club/fighter pages, search,
  notifications, calendar file).
- Backend `lib/links.ts` (same rules): sitemap and KUNKHMER HUB tool URLs; Hub eval expects `/news/`.
- Search: clubs (name, Khmer name, location, coach) and partners (sponsors, broadcasters, international
  partners → their pages / `?tab=international&org=`), filters Clubs and Partners, 3 per group in "All".
- `data/fighterLabels.ts` + `nationality.*` / `style.*` messages (EN + KM) on the fighter page and Compare.
  Khmer wording to be checked by KKF: ខ្មែរ, ថៃ …; វាយលុក (aggressive), ក្ដាប់ (clinch), វាយបក (counter),
  តុល្យភាព (balanced), ទាត់ (kicking), ដាល់ (boxing).
- Admin `MatchDetail.tsx`: "Title Fight · <title>" / "Standard Fight".

## Impact
- API shapes unchanged; sitemap URLs changed (tests updated). No migration.

## Acceptance criteria
- [x] Old `/article/<id>` and `/events/<id>?view=card` open and end on the readable link; unknown code → not found.
- [x] All event/news links on the checked pages use the readable form; sitemap lists them.
- [x] Search "pich" finds fighters + the club; "beer" finds both sponsors; choosing a result opens its page.
- [x] Khmer fighter page: សញ្ជាតិ ខ្មែរ, រចនាប័ទ្ម វាយលុក, ដាល់.

## Log
### 2026-09-29
- Backend typecheck clean; contract suite 248/248 (`seo-login.test.ts`: readable news links, English title /
  date fallback, event links). Fan site and admin `tsc` clean. Browser checks as above on the dev site.
