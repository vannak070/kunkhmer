# Update: Khmer font on the fan site — Kantumruy Pro

| | |
|---|---|
| **Status** | Done (2026-09-30, committed 6c28ffa1) — brand guideline page still to be republished (see Log) |
| **Jira** | n/a |
| **Feature** | claude/features/public-site.md, claude/updates/admin-khmer-font.md |
| **Requested by** | vannak070 (2026-09-30: "switch the fan site Khmer font to Kantumruy Pro") |

## Current behavior
The fan site follows the first brand guideline: Khmer body text in **Noto Sans Khmer**, Khmer headlines
(`.kk-display`, `.kk-heading` marked `lang="km"`, and Khmer glyphs inside Barlow Condensed headings) in
**Koulen**. The admin switched to Kantumruy Pro on 2026-09-30, so the two sites look different in Khmer.

## Requested change
All Khmer text on the fan site — body and headlines — uses **Kantumruy Pro**, the same face as the admin.

## Why
One Khmer typeface across the federation's two sites.

## Scope
In scope: `frontend/public` fonts (Google Fonts link, `styles/fonts.css`, `styles/brand.css`) and the brand
guideline's typography (design system artifact "Kun Khmer Brand").
Out of scope: Latin text (Barlow / Barlow Condensed unchanged); the admin (already Kantumruy Pro); layout,
sizes and line heights except the Khmer headline weight.

## Impact
- API / database: none.
- Frontend: every page's Khmer text; Khmer headlines change from Koulen (a single-weight display face) to
  Kantumruy Pro 700.

## Acceptance criteria
- [x] Khmer body text and Khmer headlines render in Kantumruy Pro on the fan site; English text unchanged.
- [x] Noto Sans Khmer and Koulen are no longer downloaded.
- [x] Fan site build passes; checked at desktop and phone width in Khmer and English.
- [ ] Brand guideline updated to match — edited, but the guideline page could not be published from this session.

## Log
### 2026-09-30
- `frontend/public/index.html`: the Google Fonts link loads `Kantumruy Pro` 400/500/600/700 instead of
  Koulen and Noto Sans Khmer (Barlow and Barlow Condensed unchanged).
- `src/styles/fonts.css`: `--font-sans-stack` is `"Barlow", "Kantumruy Pro", …system fonts…`. Kantumruy Pro
  sits right after Barlow (which has no Khmer glyphs) and before the system fonts, so Khmer never falls
  through to a device font.
- `src/styles/brand.css`: `--kk-font-display` falls back to Kantumruy Pro for Khmer glyphs inside Latin
  headlines; `--kk-font-khmer-display` is Kantumruy Pro; `.kk-display:lang(km)` / `.kk-heading:lang(km)` use
  weight 700 (was 400 for Koulen, a single-weight face), line height 1.35 unchanged.
- Checked in the browser (home and Fighters, 1280×800 and 375×812, `?lang=km` and `?lang=en`): the page
  loads Kantumruy Pro 400–700 and no Noto / Koulen; a Khmer hero headline computes to Kantumruy Pro 700 and
  Khmer text to the Barlow → Kantumruy Pro stack; English looks as before; no sideways scroll on the phone.
  `vite build` in the fan-site container passes. Needs Google Fonts online, like the other fonts.
- Brand guideline (design system artifact "Kun Khmer Brand"): `tokens.json` families and the Khmer styles,
  the Typography section, the three component previews and the MatchupHeader guideline were edited to
  Kantumruy Pro, but this session is not allowed to publish to that page. It still names Koulen and
  Noto Sans Khmer until it is republished from a session that can edit it.
