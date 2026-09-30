# Update: Partners pages in Khmer

| | |
|---|---|
| **Status** | Done (2026-09-30, uncommitted) — waiting for owner review; KKF to review the Khmer wording |
| **Jira** | n/a |
| **Feature** | claude/features/partners.md, claude/features/international-partners.md, claude/updates/media-khmer.md |
| **Requested by** | vannak070 (2026-09-30: "translate the Partners pages to Khmer") |

## Current behavior
Broadcasters and Sponsors (`pages/StrategicPartners.tsx`, `/home/strategic-partners/broadcasters|sponsors`)
and International Partners (`pages/PartnerOrganizations.tsx`, `/home/strategic-partners/organizations`) are
English only: lists, number tiles and the add / edit forms.

## Requested change
With Khmer chosen all three show Khmer: header and intro, number tiles, cards (type / tier badge, Active /
Inactive, labels, Edit), empty states, the whole add / edit form (sections, labels, examples, upload hints,
live card preview, Save / Cancel) and the confirm / result messages.
- Partner names, contact people, emails, phones, websites, industry and country stay as typed.
- Broadcast type, coverage reach, sponsor tier and organisation type are translated on screen only; the stored
  values stay the English ones, so the fan site and the API are unchanged.

## Scope
Out of scope: English wording and layout (unchanged); the two fixed tiles "105% SLA" / "100% Verified" (not
real numbers — left as they are, see below); error text written by the API.

## Impact
API / database: none. Frontend: `pages/StrategicPartners.tsx`, `pages/PartnerOrganizations.tsx`,
`i18n/program.ts` (`par.*`, `org.*`); both pages use the `.km-text` helper from `styles/theme.css`.

## Acceptance criteria
- [x] The three pages fully Khmer after switching (lists and forms), unchanged in English.
- [x] Desktop and phone width; admin build passes.

## Log
### 2026-09-30
- `i18n/program.ts`: 138 new strings EN + KM (`par.*` broadcasters + sponsors, `org.*` international
  partners); Cancel / Edit / Back reuse `common.*`.
- `pages/StrategicPartners.tsx`: every text through `useT()`; `shown()` translates stored type / reach / tier
  for display; counts in Khmer digits; the composed English texts ("Add Broadcaster", "delete this sponsor?")
  became one string per case. `pages/PartnerOrganizations.tsx`: same; the image inputs get their "Upload …" /
  "Remove …" texts as props instead of lower-casing the label.
- Both pages add `km-text` to their root in Khmer (readable small labels, no capitals or letter spacing).
- Checked on a temporary admin on the test API with two broadcasters, two sponsors and one international
  partner: English lists identical to before (compared line by line); Khmer complete at 1280 px and 375 px
  (three lists, sponsor form, international partner form), no sideways scroll. Admin `vite build` passes; the
  two pages have no TypeScript errors.
- Noticed, not changed: the fourth tile on Broadcasters ("Active Status · 105% SLA") and on Sponsors
  ("Active Deals · 100% Verified") are fixed texts, not computed from data.
