# Feature: Media — news articles and videos

| | |
|---|---|
| **Status** | Done |
| **Jira** | n/a |
| **Figma** | n/a |

## Goal
KKF staff publish news and video highlights shown on the public site.

## API
News (`backend/src/modules/news/routes.ts`):
| Method | Path | Who | Notes |
|---|---|---|---|
| GET | `/news`, `/news/:id` | public | newest `publish_date` first |
| POST | `/news` | STAFF | requires title; author defaults to the user's name, publish date to today; **200** |
| PUT | `/news/:id` | STAFF | |
| DELETE | `/news/:id` | STAFF | hard delete |

Videos (`backend/src/modules/videos/routes.ts`):
| Method | Path | Who | Notes |
|---|---|---|---|
| GET | `/videos`, `/videos/:id` | public | nested `fighter`, `club`, `match`; excludes soft-deleted |
| POST | `/videos` | STAFF | requires title; **200** |
| PUT | `/videos/:id` | STAFF | sending `fighterId`/`clubId`/`matchId` as `""` or null clears the link |
| DELETE | `/videos/:id` | STAFF | soft delete |

## Business rules
- `tags` accept an array or a comma-separated string.
- `featured` accepts booleans or "true"/"1"/"yes"/"on".
- Status values in use: Draft, Published, Archived (not enforced).

## Frontend
- Admin: `News.tsx` (`/home/media/news`), `Video.tsx` (`/home/media/video`).
- Public: `SuperAppHome.tsx` sections, `ArticleDetail.tsx` (`/article/:id`),
  `components/layout/GlobalSearch.tsx`.

## Tests
`api-tests/tests/content.test.ts`

## Open questions / gaps
- `views` is never incremented; public site shows all statuses unless it filters.
