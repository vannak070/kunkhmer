# Update: Knowledge base expansion, knowledge search and FAQ

| | |
|---|---|
| **Status** | Done — committed 75a56f16, 8aa94773, c04e90e9 (2026-09-28) |
| **Jira** | n/a |
| **Feature** | claude/features/knowledge-base.md, claude/features/ai-assistant.md |
| **Requested by** | vannak070 (2026-09-28: "get all data about Kun Khmer from the internet … to save cost and make the AI smarter") |

## Current behavior
9 starter drafts; all published articles are pasted into every Hub prompt (fine while small,
expensive at 50+ articles). No quick way to turn a fan question into an approved answer.

## Requested change (plan approved 2026-09-28)
1. **Research round**: web research summarised in our own words into ~50 more drafts
   (history timeline, organisations & events, legends / famous fighters, rules & scoring,
   techniques, culture, fan FAQ). No copying (copyright), sources listed per article, Khmer
   marked "needs review", nothing public until a Super Admin publishes. Fighter records and
   personal data are **not** imported into the fighter tables (official data stays KKF's).
2. **Knowledge search**: up to ~12k tokens all published articles stay in the cached prompt;
   above that the prompt carries only an index of titles and the Hub reads the 1–3 articles it
   needs with a new `search_knowledge` tool (keeps each question cheap).
3. **FAQ from real questions**: "Save as FAQ" on the admin "Hub answers" page opens a new FAQ
   draft with the fan's question (and the Hub's answer to correct).
4. **Model comparison**: small sample only (owner: keep testing cost low) — about 10 questions
   on the current model vs Claude Sonnet 5, under $0.50; owner decides.

New categories: `organisations`, `people` (legends).

## Impact
- API: `category` accepts `organisations` and `people`. No shape change, no migration.
- Admin: Knowledge base topic list; Hub answers "Save as FAQ".

## Acceptance criteria
- [x] Research drafts loaded as Drafts with sources; none published.
- [x] Search returns relevant articles in English and Khmer; index mode kicks in when large.
- [x] Save as FAQ opens a prefilled FAQ draft (clicked through in the browser; nothing saved).
- [x] Typecheck, contract suite, admin build; model sample $0.22.

## Log

### 2026-09-28
- Research: 4 parallel research passes → 58 new drafts (history & timeline 8, organisations 6,
  legends 15, rules 6, techniques 4, culture 5, fan FAQ 14), each EN + KM (KM needs review) with
  source URLs and "KKF to check" notes. Merged into `prisma/seed/knowledge-drafts.json` (67 total)
  and loaded on the dev DB as Drafts. No W-L-D numbers in legend profiles (sources disagree), no
  private details, no betting. Many news sites blocked direct reading, so some facts rest on search
  summaries — flagged in each article's source note.
- Search: `knowledge/hub.ts` → `knowledge()` returns `none | inline | index`; inline up to ~12k
  tokens, otherwise a title index (~2.2k tokens for all 67 + test rows) plus the `search_knowledge`
  tool (term matching with rare-word weighting, Khmer 3-letter pieces, unreviewed Khmer used only
  for matching, top 3). Checked 14 EN/KM questions on the test DB with everything published: the
  right article is in the top 3 each time; "pizza recipe" → nothing.
- Categories `organisations`, `people` (backend, admin, contract test).
- Admin: "Save as FAQ" on Hub answers → Knowledge base opens a new FAQ draft with the question and
  the Hub's answer (source note says to check it).
- Model sample (10 questions each, $0.22 total, dev DB with no published articles): both correct on
  leaders decline, ambiguity, fighter, club contact, weights, news, Khmer, off-topic. Opus 5 avg
  $0.0156 / answer, 4–11 s; Sonnet 5 avg $0.0067 (−57%), 2.5–9 s. Sonnet slips: misspelled the KKF
  president's name from a news article ("Khou Chhay") and gave a longer generic foul list; Opus
  more concise. Model unchanged (owner decides via `AI_MODEL`).
- Typecheck, contract suite 214/214 (`CI=true`), admin build pass.
- Owner approved all ("please approve all"): the remaining 63 drafts published through the admin API as
  Super Admin (4 were already published by the owner) → 67 Published, 0 Draft; "Khmer reviewed" left
  off. Live check ($0.07 — the first question after publishing writes the new prompt cache): "Who is
  Eh Phouthong, and what instruments play during a fight?" → `search_knowledge` ×2, answered from
  the Eh Phouthong and music articles.
