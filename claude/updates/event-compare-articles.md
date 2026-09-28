# Update: Step 4 — event page and fight preview in the light style, English versions of news articles

| | |
|---|---|
| **Status** | Done (not committed) — waiting for owner review |
| **Jira** | n/a |
| **Feature** | claude/features/public-site.md (detail-pages plan step 4) |
| **Requested by** | vannak070 (2026-09-28, "go ahead with step 4"; light event header as recommended — ask again if the owner wants the dark poster back) |

## Current behavior
- `/events/:id`: dark "Fight Night" poster header with ring-rope divider; a past night without results still
  showed "To be confirmed" on bouts and a Preview matchup link.
- `/compare`: dark red/navy face-off band, gradient icon tile, long dropdowns to pick fighters.
- News articles have one language; Khmer-only articles showed to English visitors with no hint.

## Change
- **Event page** (`pages/EventDetail.tsx`): light header (poster in a white frame, or the main event face-off
  from `components/detail`), status / countdown / "Results in" / "Results to be announced" chips, date, venue
  with Open map, broadcaster (links to its partner page), key numbers (bouts, cards, title bouts), Presented
  by, Add to calendar, Share. Past night without results: note above the card and a "Result to be announced"
  tag on each bout (no Preview matchup). The dark `MainEventFaceoff` was removed from `EventParts`.
- **Fight preview** (`pages/Compare.tsx`, `components/fan/Matchup.tsx`): light header with "a comparison, not
  a prediction" note; type-to-search fighter pickers (datalist — a full name picks the fighter); light face-off
  card, initials when there's no photo. Head-to-head list unchanged.
- **English versions of news**: `news_articles.title_en / subtitle_en / content_en` (migration
  `20260928000004_news_english`); API returns them and accepts `titleEn / subtitleEn / contentEn` (empty clears);
  admin News form "English version (optional)" box; fan site (`data/news.ts`) shows the English version on the
  English site (home + News & Media cards, search, article page) with a "Read the original (Khmer)" switch;
  Khmer-only articles get an "Article in Khmer" label. Hub news tools include the English version.
- New strings EN + KM (`fights.pendingResult`, `matchup.eyebrow / searchFighter / notPrediction`,
  `news.inKhmer / readOriginal / readEnglish`).

## Impact
- API: `news` rows gain three fields (additive; snapshots in `content.test.ts.snap` updated deliberately).
- Database: migration adds three nullable columns.

## Acceptance criteria
- [x] Event and compare pages light, no dark bands / ring ropes; phone width; public build.
- [x] English version saved, returned, cleared (contract test); admin form; fan site shows it / label / switch.
- [x] Typecheck; contract suite 238/238 `CI=true`; admin + public builds.
- [ ] Owner review; staff add English versions to the two current articles.

## Log
### 2026-09-28
- Checked on dev data: event page (poster, "Results to be announced", note + tag on the bout, Open map,
  broadcaster link) and compare (light header, typing "Pich Singhak" switched the red corner and the URL);
  phone width no sideways scroll on event / compare / fighter; fresh tab console clean.
- English version checked on the disposable test API through a temporary site copy (a Khmer article with an
  English version → English title / summary / text + "Read the original (Khmer)" → Khmer + "Article in Khmer" +
  "Read in English"; a Khmer-only article → label; News & Media list shows the English title). Admin form's
  English box viewed (Add Article, cancelled — nothing saved).
