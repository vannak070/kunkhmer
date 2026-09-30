# Update: About the Federation editor in Khmer

| | |
|---|---|
| **Status** | Done (2026-09-30, committed 4f9a2665); KKF to review the Khmer wording |
| **Jira** | n/a |
| **Feature** | claude/features/about-federation.md, claude/updates/admin-menu-khmer.md |
| **Requested by** | vannak070 (2026-09-30: "translate the About the Federation editor to Khmer") |

## Current behavior
The editor (`pages/FederationPage.tsx`, `/home/federation`) is English only. It already has an "English /
ខ្មែរ Khmer" tab, but that chooses which language's *content* is being typed, not the language of the screen.

## Requested change
With Khmer chosen (language button in the side menu) the editor's own texts are Khmer: heading and intro, the
published / draft status line with its dates, "View on site", the section titles and hints, every field label,
the people and document rows (Add photo, Choose PDF …), the action bar (Discard, Save draft, Publish) and the
confirm / result messages.
- The content tab keeps working as before. In the Khmer screen, fields on the English tab are labelled
  "(អង់គ្លេស)" and on the Khmer tab "(ខ្មែរ)", so staff always see which version they are typing.
- The content itself (mission, names, roles, documents) stays as typed.

## Scope
Out of scope: English wording and layout (unchanged); the English example texts inside English-tab fields
(they are examples of English content); error text written by the API; the fan site's /federation page.

## Impact
API / database: none. Frontend: `pages/FederationPage.tsx`, `i18n/program.ts` (`fed.*`).

## Acceptance criteria
- [x] Editor fully Khmer after switching, unchanged in English; both content tabs labelled clearly.
- [x] Desktop and phone width; admin build passes.

## Log
### 2026-09-30
- `i18n/program.ts`: 80 new strings EN + KM (`fed.*`); the heading reuses `menu.federation`.
- `pages/FederationPage.tsx`: every text through `useT()` (`ui` = screen language, the existing `lang` state
  stays the content tab); save / publish times in Khmer are the Khmer date plus the time in Khmer digits.
- Checked on a temporary admin on the test API with sample content (published once, then a newer draft, one
  leader): English identical to before (compared line by line); Khmer complete at 1280 px and 375 px, both
  content tabs, no sideways scroll. Admin `vite build` passes; the page has no TypeScript errors.
