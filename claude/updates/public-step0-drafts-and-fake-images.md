# Update: Step 0 — hide draft news from the public, remove fake fallback images

| | |
|---|---|
| **Status** | Done — committed b1ebc132 (2026-09-28) |
| **Jira** | n/a |
| **Feature** | claude/features/public-site.md |
| **Requested by** | vannak070 (2026-09-28, detail-pages plan step 0) |

## Current behavior
- `GET /api/news` and `GET /api/news/:id` return every article, Draft included, to anyone
  (`backend/src/modules/news/routes.ts`); the fan site only hid drafts in the browser, so drafts
  could be read from the API / network tab.
- Fighter page (`pages/SuperAppFighterDetail.tsx`) uses a design mock-up of another, real-looking
  fighter (`src/assets/fe303cee….png`, 835 KB) as backdrop, main photo and teammate photo when a
  fighter has no photo.
- Article page (`pages/ArticleDetail.tsx`) falls back to an Unsplash boxing-gloves photo for the hero
  and the share image.

## Change
- News API: visitors (and non-staff logins) get **Published** articles only; `/news/:id` of a
  non-published article is 404 for them. KKF staff (Super Admin, KKF Officer — the only roles that
  write news) still see everything, so the admin News page is unchanged. No shape change.
- Fighter page: no photo → initials on a brand background (no borrowed photo); the mock-up asset is
  no longer imported.
- Fighter videos without an uploaded thumbnail use that video's own YouTube still (stock photo removed).
- Article page: no image → no hero picture (brand block) and the site's default share image; same for
  "More news" cards.

## Acceptance criteria
- [x] Contract tests: draft hidden from public list and detail, visible to staff; full suite `CI=true`.
- [x] Typecheck; public build; fighter without photo and article without image checked in the browser.

## Log
### 2026-09-28
- `news/routes.ts`: `visibleTo(request)` → `{}` for STAFF, `{ status: "Published" }` otherwise, on
  `GET /news` and `GET /news/:id` (404 for hidden). New contract test in `content.test.ts`
  (visitor / Organizer / Club can't list or open a draft; Officer / Super Admin can; published →
  public). Suite 231/231 `CI=true`; typecheck clean. Dev DB: both articles are Published, so nothing
  visible changes today.
- `SuperAppFighterDetail.tsx`: mock-up import removed; `NoPhoto` initials block for the main photo and
  teammate cards; blurred backdrop only with a real photo; video thumbnails from YouTube. The 835 KB
  mock-up no longer ships in the build.
- `ArticleDetail.tsx`: Unsplash fallback removed (hero + related cards → brand gradient; share image →
  site default).
- Checked on the test API through a temporary site copy: "Sokha Noimage" shows "SN", teammate card
  initials, 0 stock/mock images on the page; "No Image Article" shows the brand block, og:image =
  default. Temporary copy stopped.
- Videos had the same draft issue — fixed in step 1 (`updates/public-step1-links-honesty-cleanup.md`).
