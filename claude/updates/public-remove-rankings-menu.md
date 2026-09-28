# Update: Remove Rankings from the fan site

| | |
|---|---|
| **Status** | Done (not committed) — 2026-09-28 |
| **Jira** | n/a |
| **Feature** | public-site.md |
| **Requested by** | vannak070 |

## Current behavior
The fan site header (desktop and phone menu) has a "Rankings" item linking to
`/rankings` (division standings worked out from fight records). The Compare
page highlights "Rankings" as its menu section.

## Requested change
Remove Rankings from the menu: "I don't have any method to manage ranking yet."
Then delete the page too: "Delete it. I don't want make any confusion."

## Scope
In scope: the menu item (`components/layout/SiteHeader.tsx`); Compare now
highlights "Fighters" (it's opened from fight cards and fighter profiles).
Also (second request): delete the Rankings page; `/rankings` redirects to
`/fighters` so old links don't break.

## Impact
- API: none. Database: none. Public site only.

## Acceptance criteria
- [x] No Rankings item in the desktop or phone menu, English and Khmer.
- [x] `/rankings` opens Fighters; no Rankings code or texts left.
- [x] Public build passes.

## Log
### 2026-09-28
- `SiteHeader.tsx`: Rankings entry removed from `NAV_ITEMS` (and the unused icon);
  `Compare.tsx`: active section "fighters".
- Page deleted: `pages/Rankings.tsx`; route `/rankings` → `<Navigate to="/fighters">`;
  `"rankings"` removed from `NavSection`/`STANDALONE`; `divisions()`,
  `Division`, `Standing` removed from `data/fanData.ts`; 15 texts removed in
  each language (`rankings.*`, `nav.rankings`). Checked in the browser:
  `/rankings` lands on Fighters, no console errors.

