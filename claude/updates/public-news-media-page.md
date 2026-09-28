# Update: News & Media page in the Matches & Events style

| | |
|---|---|
| **Status** | Done (not committed) — waiting for owner review in the browser |
| **Jira** | n/a |
| **Feature** | claude/features/public-site.md |
| **Requested by** | vannak070 (2026-09-28: "http://localhost:5176/news-events => please improve this page also. especially about tab" → "follow match and event page") |

## Current behavior
`/news-events` (`renderNewsEvents` in `pages/SuperAppHome.tsx`): small icon header, a grey
segmented tab control (Latest News / Media Hub) whose state is not in the URL after clicking
(only `?tab=media` on arrival), a white box per tab with English-only filter labels and
placeholders ("Category:", "Search latest stories…", "Previous / Next", "Featured"), hard-coded
category lists (not the ones in use), fighter names in English only, numbered pagination,
Unsplash stock photos when an article or video has no image, and the video player not
shareable.

## Requested change
Follow `/matches` (`pages/MatchesAndEvents.tsx`, `updates/public-matches-page.md`):
- New `pages/NewsAndMedia.tsx`; light gradient header with eyebrow, lead and stat chips
  (stories, videos — only when > 0).
- Same tab control as `/matches`, as real URLs: News (default) · Videos `?tab=media`, with counts.
- Always-visible search + category filter (only categories in use, translated when known) +
  fighter filter on Videos (only fighters that have videos), clear button.
- News: featured story spotlight (the article marked featured, else the newest) when not
  filtering, then a card grid; "Show more" instead of numbered pages.
- Videos: card grid; clicking opens the player at `?tab=media&video=<id>` (shareable, Back closes).
- No stock photos (brand block / YouTube thumbnail instead); empty states like `/matches` with
  "Ask KUNKHMER HUB". Every string EN + KM.

## Scope
In scope: the `/news-events` section only. Out of scope: home page, article page, header/footer,
the shared video modal used by the home page.

## Impact
- API / database: none.
- Frontend: `pages/SuperAppHome.tsx` (old render + its state removed), new `pages/NewsAndMedia.tsx`,
  `i18n/messages.ts`.

## Acceptance criteria
- [x] Looks and behaves like `/matches` (header, tabs, filters, empty states); light only.
- [x] Tabs and the open video are real URLs; Back works.
- [x] Real data only; desktop + 375 px, English + Khmer; `vite build` passes.
- [ ] Owner review.

## Log
### 2026-09-28
- Built as above: `pages/NewsAndMedia.tsx`; `SuperAppHome.tsx` passes the loaded articles, videos
  and fighters and lost `renderNewsEvents` plus its tab / filter / page state and the `?tab=` effect.
  Strings: `news.tabNews` / `news.tabMedia` now "News" / "Videos"; `news.subtitle`, `news.noArticles`,
  `news.noVideos` replaced by `news.eyebrow`, `news.lead`, `news.stat*`, `news.search*`,
  `news.cat.*` (13 known categories) and friends, EN + KM.
- Videos with a real thumbnail use it, else the YouTube thumbnail, else a light brand block.
- Owner asked to fix the home player too: the shared loader in `SuperAppHome` used to fall back to
  a fixed, unrelated YouTube id when a link couldn't be read; it now leaves `youtubeId` empty, and
  both the home page player and this page's player show "This video can't be played here right
  now" instead. Real videos still embed (checked: `embed/B6iVQqkbNdU` on home and here). Same fix, on the owner's
  request, in the fighter profile's own video loader and player (`SuperAppFighterDetail.tsx`).
- Checked on dev data (2 stories, 1 video): header + stats, featured spotlight, card grid, tab →
  `?tab=media`, play → `&video=<id>`, Back closes the player; 375 px in Khmer with no sideways
  scroll. The YouTube frame stayed black inside the app's preview browser (embed not loading
  there), so playback itself wasn't confirmed.
