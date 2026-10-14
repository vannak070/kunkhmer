# Update: last two simple pages — share poster and Not found

| | |
|---|---|
| **Status** | Done 2026-10-14 (live since 936db4ea) |
| **Jira** | n/a |
| **Feature** | admin-pwa.md (step 3), admin-step3-simple-pages.md |
| **Requested by** | Owner ("go ahead with the two small pages") |

## Current behavior
- **Share the fight card** (`/home/batches/:id/share`): the poster itself is fine, but everything around it was old style and
  English only ("Export Fight Card", "Sharing Restricted", "Back to Matches" to the list); it refused to share unless the card
  had one of the old card statuses (Draft with bouts / Weigh-In / Ready / Live / Completed with all results), which no longer
  mean anything in the guided flow.
- **Not found**: English only, big gradient "404", a link to a `/federation` page that doesn't exist in the admin.

## Requested change
- Share page chrome in English + Khmer: a back link to the match, a short title and sentence, two big buttons (**Copy as
  picture**, **Print (A4)**), plain loading / not-found / "nothing to share yet" screens. The poster (`#fight-card-document`:
  Moul heading, logos, bout list, html2canvas copy) is unchanged. Sharing is allowed as soon as the card has a bout.
- Not found: light page, English + Khmer, language button, "Go to the Dashboard", "Go back", "Open Help".

## Scope
In scope: `pages/ShareFightCard.tsx` (page chrome and the share gate only), `pages/NotFound.tsx`, `sh.*` / `nf.*` texts.
Out of scope: the poster's own wording (it is a fan-facing document), the Program sheet (`/events/:id/sheet`).

## Impact
No API change. Admin only.

## Acceptance criteria
- [x] Typecheck clean (the three old type errors in the share page are fixed too); browser-checked on the test API: share page with a bout (English desktop, poster unchanged), an empty card ("nothing to share yet"), Not found in Khmer at 375 px. Copy as picture / Print not clicked in the test browser (unchanged code).

## Log
- 2026-10-14: `pages/ShareFightCard.tsx` chrome in English + Khmer with a back link to the match, big Copy / Print buttons, plain loading / not-found / nothing-to-share screens; sharing allowed once the card has a bout that isn't cancelled (the old card-status gate is gone); it now loads only this card's bouts (`api.matches.list(cardId)`) instead of every bout. `pages/NotFound.tsx` light page in English + Khmer with Dashboard / Go back / Open Help. Texts `sh.*`, `nf.*`. The poster itself is untouched. Khmer wording for KKF review later.
