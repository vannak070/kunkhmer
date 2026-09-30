# Update: KUNKHMER HUB answers from the About the Federation page

| | |
|---|---|
| **Status** | Done — committed 57c49d39 (2026-09-30, pushed); live model answer not tested yet (optional, paid) |
| **Jira** | n/a |
| **Feature** | claude/features/ai-assistant.md, claude/features/about-federation.md |
| **Requested by** | vannak070 (2026-09-30: "let Hub answer from the federation page") |

## Current behavior
The Hub knows the sport (knowledge base) and the records (fighters, events, clubs …), but not the
federation itself: who leads KKF, how to contact the office, how to register, where the rule book is.
The `/federation` page (built 2026-09-30) has that content, but the Hub can't read it.

## Requested change
New read-only tool `about_federation` returning the **published** federation page: mission, history,
founding year, leaders (names and roles, no photos), office address / hours / phone / email / map,
how to register, documents (title + PDF link), and the page link `/federation`. When nothing is
published it says so, and the Hub tells the visitor the federation hasn't published it yet —
never guessing names, phone numbers or addresses. English and Khmer fields both included; the Hub
answers in the visitor's language as before.

## Scope
In scope: the tool (public Hub + staff assistant, which gets public tools with site links removed),
prompt rule, admin "Hub answers" tool label, eval cases.
Out of scope: drafts (the Hub only sees what a Super Admin published); fan-site changes.

## Impact
- API response shape changes? No (tool results aren't API responses).
- Database migration needed? No.
- Cost: one more tool definition in the cached prompt (~150 tokens, cached); the tool result is
  only fetched for federation questions.

## Acceptance criteria
- [x] Tool returns published content (no photos, with links) and a clear "not published" result otherwise (checked directly, no model call).
- [x] Prompt rule: federation questions → `about_federation`; never invent contacts or leaders.
- [x] Typecheck + full contract suite pass; admin build (tool label).
- [ ] Live Hub answer (optional, paid ~$0.05 for 2 questions — owner decides).

## Log
### 2026-09-30
- `modules/ai/tools.ts`: tool `about_federation` (after `federation_settings`, before the fan tool, so the
  cached prefix order stays stable) → `publishedFederation()`; leaders without photos; documents as PDF links.
  Staff assistant gets it too (public links stripped as for every public tool).
- `modules/ai/routes.ts`: intro mentions the federation; rule "federation questions → about_federation,
  official source, link /federation or the PDF, 'not published yet' otherwise, never guess contacts/leaders".
- Admin `HubAnswers.tsx`: tool label "Federation page". Eval: check `federationPage` (link to /federation or a
  PDF, or "not published yet") + 4 cases `fed-*` (3 EN, 1 KM) — not run (paid).
- Checked without the model: tool run directly in the dev container (nothing published → `published: false`
  + note) and the test container (published sample → content, no photo URLs, PDF link); staff copy has no
  site URLs. Backend typecheck; `CI=true npm run test:api` 258/258; admin `vite build`.
