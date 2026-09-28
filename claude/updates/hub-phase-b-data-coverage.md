# Update: KUNKHMER HUB Phase B — full data coverage

| | |
|---|---|
| **Status** | Done — committed 783d02e8 (2026-09-28) |
| **Jira** | n/a |
| **Feature** | claude/features/ai-assistant.md |
| **Requested by** | vannak070 |

## Current behavior
The Hub's tools (`backend/src/modules/ai/tools.ts`) cover fighters, events, latest results and
champions only. A fighter name that matches several people silently picks the first one
alphabetically (`findFighter`), so the answer can be about the wrong fighter. Questions about
clubs, news, videos, weight classes / bout rules / venues or a fighter's statistics get
"the records don't show it".

## Requested change (owner decisions 2026-09-28)
New read-only tools:
- `search_clubs`, `get_club`: location, head coach, established, description, **phone and
  email** (same as the public club page — owner decision), and the club's registered fighters.
- `list_news`, `get_news`: **Published** articles only, link `/article/:id`.
- `list_videos`: **Published**, not deleted; YouTube link, category, fighter; link to the media tab.
- `federation_settings`: active weight classes, bout rule presets (rounds, round time,
  knockdown limit, glove size) and venues.
- `fighter_stats`: from bouts recorded on the site — bouts, wins / losses / draws / no contests,
  win and loss methods, finishing rate, average finishing round, current streak, title bouts.
  The profile W-L-D stays the fighter's **official record** (owner decision); bout stats are
  described as "bouts recorded on this site".
- `head_to_head`: every recorded and scheduled bout between two fighters.
- Ambiguous names: `get_fighter`, `fighter_stats` and `head_to_head` return a candidate list
  when a name matches several fighters (exact name wins), so the Hub asks which one.

**No leaderboards** (owner decision): the Hub answers stats for named fighters and
head-to-heads only and politely declines "who has the most wins / best record / longest
streak" (the federation doesn't publish rankings), in line with the Rankings removal.

## Scope
In scope: tools + prompt rules, eval cases. Out of scope: public statistics page
(`features/statistics.md`), club deep-link pages (clubs have no own URL yet; answers link to the
clubs section `/strategic-partners`).

## Impact
- No API shape change, no migration, no frontend change. Admin "Hub answers" shows the new
  tool names with readable labels.

## Acceptance criteria
- [x] Each new tool returns only public data (published / visible rows), each item with a site link where one exists.
- [x] Ambiguous fighter names return candidates instead of guessing.
- [x] Leader questions are declined; per-fighter stats answered with the official record first.
- [x] Typecheck, full contract suite, tools exercised directly against the dev DB.

## Log

### 2026-09-28
- `modules/ai/tools.ts`: `resolveFighter()` replaces the first-alphabetical `findFighter` (id →
  exact name / Khmer name / alias → partial; several matches → `{ ambiguous, candidates }`), used
  by `get_fighter`, `fighter_stats`, `head_to_head`, `list_videos`. New tools `fighter_stats`,
  `head_to_head`, `search_clubs`, `get_club`, `list_news`, `get_news`, `list_videos`,
  `federation_settings` (appended after the old ones). News author left out (it's often the
  system account). Clubs link to `/strategic-partners`, videos to `/news-events?tab=media`.
- `routes.ts` prompt: wider scope line; official record vs "bouts recorded on this site";
  no leaderboards; ask when several fighters / clubs match.
- Admin "Hub answers": readable labels for the new tools. Eval: 11 `b-*` cases (71 total, not run).
- Verified: every tool run against the dev DB; stats maths checked on the test DB with a
  4-bout scenario (3-1, 67% finishing rate, avg finishing round 2.5, 3-win streak, title 1/1,
  head-to-head 3-1, partial name → 2 candidates). Live Hub ($0.07 total): "most wins" politely
  declined; "Tell me about Pich" → asks which of two; club contact + weight classes answered
  with links. Typecheck, contract suite 214/214 (`CI=true`), admin build pass.
