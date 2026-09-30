# Update: Khmer font in the admin — Kantumruy Pro

| | |
|---|---|
| **Status** | Done (2026-09-30, committed 4f9a2665) |
| **Jira** | n/a |
| **Feature** | claude/updates/admin-menu-khmer.md |
| **Requested by** | vannak070 (2026-09-30: "change font khmer to Kantumruy Pro for all function") |

## Current behavior
The admin loaded Noto Sans Khmer but only the Help page used it; everywhere else Khmer text fell back to
whatever Khmer font the computer or phone had, so it looked different from device to device.

## Requested change
Khmer text on every admin page uses **Kantumruy Pro**.

## Scope
In scope: the whole admin (`frontend/admin`).
Out of scope: Latin text (still Outfit / Inter); the decorative Moul heading on the share poster; the fan site
(`frontend/public`), whose fonts followed the brand guideline (Barlow, Koulen, Noto Sans Khmer) — not changed
here. The owner switched the fan site to Kantumruy Pro later the same day: `updates/fan-site-khmer-font.md`.

## Impact
API / database: none. Frontend: `frontend/admin/index.html` (Google Fonts link: Kantumruy Pro 400–700 instead
of Noto Sans Khmer), `styles/theme.css` (`--font-sans`, `--font-mono`), `pages/Help.tsx`.

## Acceptance criteria
- [x] Khmer text on admin pages renders in Kantumruy Pro; English text unchanged.
- [x] Admin build passes.

## Log
### 2026-09-30
- `index.html`: loads `Kantumruy Pro` (400, 500, 600, 700) and no longer Noto Sans Khmer.
- `styles/theme.css`: `--font-sans: "Outfit", "Inter", "Kantumruy Pro", sans-serif` — Outfit and Inter have no
  Khmer glyphs, so Khmer falls through to Kantumruy Pro on every page while Latin text keeps its face.
  `--font-mono` lists real monospace faces first and Kantumruy Pro before the generic fallback, so Khmer typed
  in the News / Video editors also uses it.
- `pages/Help.tsx`: its two explicit Noto Sans Khmer classes now name Kantumruy Pro.
- Checked in the browser on the temporary admin: the page reports Kantumruy Pro 400 / 500 / 600 / 700 loaded
  and used for Khmer (Knowledge base, Dashboard, side menu); English pages look the same. Needs an internet
  connection to Google Fonts, like the other admin fonts. Kantumruy Pro has no weight above 700, so the few
  extra-bold headings show at 700 in Khmer.
