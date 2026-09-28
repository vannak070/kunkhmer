# Feature: Knowledge base (KUNKHMER HUB Phase A)

| | |
|---|---|
| **Status** | Built and committed 2026-09-28; draft articles await Super Admin review |
| **Jira** | n/a |
| **Figma** | n/a |
| **Owner** | vannak070 |

## Goal
KKF staff keep a small library of approved articles about the sport (history, rules,
techniques, Kun Kru & music, glossary, regulations, FAQ) in English and Khmer.
KUNKHMER HUB answers questions about the sport from the **published** articles only.

## Users and roles (owner decisions 2026-09-28)
| Role | May |
|---|---|
| KKF Officer | Create drafts, edit and delete drafts |
| Super Admin | Everything an Officer can, plus **publish / unpublish**, edit or delete published articles, and mark the Khmer text reviewed |
| Others / public | Nothing (no public API; the Hub reads articles inside the backend) |

Defaults chosen while building (owner may change):
- An Officer can't edit a published article (403); a Super Admin edits it, or unpublishes it
  so an Officer can rework it. This keeps the Hub from answering from unapproved text.
- Changing the Khmer title or body clears "Khmer reviewed" unless a Super Admin sets it again
  in the same save. The Hub uses Khmer text only when it's marked reviewed; otherwise it
  answers in Khmer from the English text.

## API (`backend/src/modules/knowledge/routes.ts`, all STAFF, camelCase)
| Method | Path | Who | Notes |
|---|---|---|---|
| GET | `/api/knowledge?status=&category=` | STAFF | List, ordered by category order, `sortOrder`, title |
| GET | `/api/knowledge/:id` | STAFF | 404 for unknown / non-UUID |
| POST | `/api/knowledge` | STAFF | Always created as `Draft`. Requires `titleEn`, `bodyEn`, valid `category`. 201 |
| PUT | `/api/knowledge/:id` | STAFF (published: Super Admin) | Partial update; `kmReviewed` only by Super Admin (403 otherwise) |
| POST | `/api/knowledge/:id/publish` | Super Admin | Sets `Published`, `publishedAt`, `publishedBy` |
| POST | `/api/knowledge/:id/unpublish` | Super Admin | Back to `Draft` |
| DELETE | `/api/knowledge/:id` | STAFF (published: Super Admin) | Hard delete |

Item: `{ id, slug, category, titleEn, titleKm, bodyEn, bodyKm, kmReviewed, status, source,
sortOrder, createdBy, updatedBy, publishedBy, publishedAt, createdAt, updatedAt }` — dates ISO.
Categories: `history`, `rules`, `techniques`, `culture` (Kun Kru & music), `glossary`,
`regulations`, `faq`. `slug` is unique (made from the English title if not sent); 422 on clash.

## Data
`knowledge_articles` (migration `20260928000003_knowledge_articles`).
Starter drafts: `backend/prisma/seed/knowledge-drafts.json`, loaded with
`npm run db:seed:knowledge` (adds missing slugs only, never overwrites or publishes).
They were written in our own words from the English Wikipedia article "Kun Khmer"
(read 2026-09-28) and are **unofficial until KKF checks them**; each has a `source` note
and the Khmer text needs a native-speaker review.

## Hub integration
`modules/knowledge/hub.ts` builds a "Federation knowledge base" block from published articles
and appends it to the cached system prompt (rebuilt only after a publish / edit / delete, so
the prompt cache stays warm). Prompt rules: answer sport questions from it; if it doesn't
cover something, answer briefly and generally and say the federation hasn't published details;
Kun Khmer vs Muay Thai origins / SEA Games naming only from an article, otherwise a short
neutral answer with a link to the beginner's guide. If the block grows past ~50k tokens,
switch to a `search_knowledge` tool (not needed yet; the size is logged on build).

## Frontend
Admin `pages/KnowledgeBase.tsx` at `/home/knowledge` (menu "Knowledge base" under Content &
partners, permission `knowledge.manage` for Super Admin + KKF Officer): list with status /
Khmer-review chips and filters, editor with English / Khmer tabs, Publish / Unpublish /
"Khmer reviewed" for Super Admins. No public `/learn` pages yet (optional later).

## Acceptance criteria
- [x] Officers create and edit drafts; only Super Admins publish, unpublish, edit published, mark Khmer reviewed (contract tests).
- [x] Hub uses published articles only; unpublished text never reaches the model (checked the built prompt text on the test API: draft left out, Khmer added only after review).
- [x] Starter drafts loaded as Drafts on the dev DB (9); nothing published without the owner.
- [x] Contract tests (roles, validation, shapes) — full suite 214/214 `CI=true`; typecheck; admin build; page checked at desktop and 375 px.
- [ ] A live Hub answer from a published article (needs the owner to publish first; small paid call).

## Tests
`api-tests/tests/knowledge.test.ts`. Eval cases `kb-*` in `backend/src/scripts/hub-eval/questions.json`.

## Open questions
- Is there an official KKF rulebook / history document to replace the Wikipedia-based drafts?
- Public `/learn` pages from the same articles?
