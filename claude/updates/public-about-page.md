# Update: About page in the light site style

| | |
|---|---|
| **Status** | Done — committed f4b4010f (2026-09-28) |
| **Jira** | n/a |
| **Feature** | claude/features/public-site.md |
| **Requested by** | vannak070 (2026-09-28: "http://localhost:5176/about improve as well", after the Matches, News & Media, Partners and Fighters redesigns) |

## Current behavior
`/about` (`pages/AboutKunKhmer.tsx`): a dark blue hero band (the owner asked for no dark bands —
`public-site-visual-taste`), quick-fact cards overlapping it, history, "How a fight works", a
"How to watch" card with an orange icon, a glossary that still explains "Ranking fight" (rankings
were removed from the site on 2026-09-28), and a solid red gradient band at the end. No link to
KUNKHMER HUB, although the Hub answers sport questions from the federation's knowledge base.

## Requested change
Same light style as `/matches`, `/news-events`, `/strategic-partners`, `/fighters`; content kept:
- Light gradient header card (eyebrow, title, lead) instead of the dark band.
- "On this page" chips linking to the sections (History · How a fight works · How to watch ·
  Glossary · Ask KUNKHMER HUB).
- Quick facts, history, fight steps, red/blue corners, how to watch, glossary — restyled with brand
  tokens (no orange); "Ranking fight" removed from the glossary (and its strings).
- New "Still curious?" block: KUNKHMER HUB with three ready-made sport questions (`HubAskAbout`,
  hidden when the Hub is off).
- Closing "Ready to follow the action?" as a light card, not a red band.
- Same text as before otherwise (the home page reuses the quick-fact strings).

## Scope
Out of scope: a public `/learn` knowledge-base section (no public API; open question in
`features/knowledge-base.md`), new history content (needs federation-approved wording).

## Impact
API / database: none. Frontend: `pages/AboutKunKhmer.tsx`, `i18n/messages.ts`.

## Acceptance criteria
- [x] Light only, brand tokens, no ranking wording.
- [x] Desktop + 375 px, English + Khmer; `vite build` passes.
- [ ] Owner review.

## Log
### 2026-09-28
- Built as above in `pages/AboutKunKhmer.tsx`; strings: `about.glossary.ranking*` removed, 6 new
  (`about.contents`, `about.quickFacts`, `about.hubTitle`, `about.hubText`, `about.hubQ2`,
  `about.hubQ3`) in EN + KM. Content otherwise unchanged; quick-fact strings still shared with home.
- Checked: desktop (header + section chips, quick facts, glossary without "Ranking fight", Hub
  questions), 375 px in Khmer with no sideways scroll. Hub questions not clicked (no paid calls).
