# Update: Knowledge base expansion, knowledge search and FAQ

| | |
|---|---|
| **Status** | In progress |
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
- [ ] Research drafts loaded as Drafts with sources; none published.
- [ ] Search returns relevant articles in English and Khmer; index mode kicks in when large.
- [ ] Save as FAQ opens a prefilled FAQ draft.
- [ ] Typecheck, contract suite, admin build; model sample under $0.50.

## Log
