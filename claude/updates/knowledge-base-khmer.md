# Update: Knowledge base page in Khmer

| | |
|---|---|
| **Status** | Done (2026-09-30, uncommitted) — waiting for owner review; KKF to review the Khmer wording |
| **Jira** | n/a |
| **Feature** | claude/features/knowledge-base.md, claude/updates/admin-menu-khmer.md |
| **Requested by** | vannak070 (2026-09-30: "translate the Knowledge base page to Khmer") |

## Current behavior
Knowledge base (`pages/KnowledgeBase.tsx`, `/home/knowledge`) is English only. Its "English / ខ្មែរ Khmer" tab
chooses which language's article text is being typed, not the language of the screen.

## Requested change
With Khmer chosen the page's own texts are Khmer: heading and intro, the All / Drafts / Published filter with
counts, the article cards (topic, status, Khmer-review chip, "Updated"), the editor (topic list, labels, the
notes for officers, the Khmer-review box, Publish / Unpublish / Delete / Save) and the confirm / result
messages.
- Article titles and texts stay as typed. Topic names are translated on screen only; the stored keys
  (`history`, `rules` …) are unchanged, so the Hub is unaffected.
- The text prefilled in "Source" when an article is started from a Hub question follows the screen language.

## Scope
Out of scope: English wording and layout (unchanged); error text written by the API; the Hub answers page.

## Impact
API / database: none. Frontend: `pages/KnowledgeBase.tsx`, `i18n/program.ts` (`kb.*`).

## Acceptance criteria
- [x] List and editor fully Khmer after switching, unchanged in English; both content tabs work.
- [x] Desktop and phone width; admin build passes.

## Log
### 2026-09-30
- `i18n/program.ts`: 61 new strings EN + KM (`kb.*`); the heading reuses `menu.knowledge`.
- `pages/KnowledgeBase.tsx`: every text through `useT()` (`ui` = screen language, the existing `lang` state
  stays the content tab); dates and counts in Khmer when Khmer is chosen; the topic line drops capitals and
  letter spacing in Khmer.
- Checked on a temporary admin on the test API with one published and one draft article: English list
  identical to before (compared line by line); Khmer complete at 1280 px and 375 px (list, editor, both content
  tabs), no sideways scroll. Admin `vite build` passes; the page has no TypeScript errors.
