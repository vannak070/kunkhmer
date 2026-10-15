# Update: Home "Join our official partners" shows sponsors only

| | |
|---|---|
| **Status** | Done (2026-10-14, committed bb5a146c; live since a1c0fb9b, 2026-10-14) |
| **Feature** | claude/features/public-site.md (Home › Become a partner) |
| **Requested by** | vannak070 (screenshot of the partner box: "please display sponsor only") |

## Change
- `PartnerWall` in `frontend/public/src/app/components/home/HomePage.tsx`: only the **Official Sponsors** group (broadcasters and international partners are no longer listed here), still ending with the dashed "Your brand here" tile.
- The number under it now counts sponsors: "Official sponsors" / "អ្នកឧបត្ថម្ភផ្លូវការ" (`home.statSponsors`), shown from 10 up as before.
- Unchanged: the hero's partner slider, the Partners page, broadcaster pages.

## Log
### 2026-10-14
- Checked on the dev fan site (desktop): the box lists only the sponsors + "Your brand here". Not checked: phone width, Khmer.
