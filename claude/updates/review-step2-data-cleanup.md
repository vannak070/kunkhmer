# Update: Website review step 2 — data clean-up (dev data)

| | |
|---|---|
| **Status** | Text fixes done in dev (2026-09-29); staff checklist below open — none of the 11 items done yet (re-checked 2026-09-30) |
| **Jira** | n/a |
| **Feature** | claude/features/public-site.md |
| **Requested by** | vannak070 (2026-09-29: "start this" → step 2 text fixes in dev data + a checklist for staff; step 5 club logos) |

## Done by me in the dev database (owner-approved text fixes)
Directly in `kunkhmer_db` (no admin login, so no one was signed out); `updated_at` set.
| What | Before | After |
|---|---|---|
| Club name (also shown on its 2 fighters) | Pich Sophann KunKmer | Pich Sophann Kun Khmer |
| Club "established" (ប៉ែន កាក់ សេងប៊ុនថេង គុនខ្មែរ) | ២2015 | 2015 |
| Pich Sambath — province | Kampong Spue | Kampong Speu |
| Sponsor name | Gangberg Beer | Ganzberg Beer (spelling on its logo and in the KKF news article) |
| Sponsor website | http://gangberg.com | https://beerganzberg.com (ganzberg.com redirects there) |

Dev data only — the live site needs the same corrections (or a fresh copy of this data).

## Checklist for KKF staff (things only the federation can confirm)
| # | Fix | Where in the admin |
|---|---|---|
| 1 | Record the result of the 10 July 2026 fight night (Cambodia World Kun Khmer): Bird Sengkem vs Pich Sambath is still a **Draft with no winner**, so the site shows "Results to be announced". | Program → Events → Cambodia World Kun Khmer → fight card → the bout (match page) |
| 2 | Replace the personal Gmail address used as contact email on **both clubs** and the **Cambodia Beer** sponsor with the real contacts. | Clubs → edit; Strategic Partners → Sponsors → edit |
| 3 | Check Ganzberg Beer's contact email `info@gangberge.com` (misspelt domain?). | Strategic Partners → Sponsors → Ganzberg Beer |
| 4 | Verify Pich Sambath's official record **150-25-79** (79 draws is unusually high). | Fighters → Kun Khmer → Pich Sambath |
| 5 | Provinces: Bird Sengkem says "Phnom Penh, Cambodia" (others give the province only); Pich Singhak has none. | Fighters → edit |
| 6 | Real poster and description for Cambodia World Kun Khmer (the description is generic text). | Program → Events → edit |
| 7 | English versions of the 2 Khmer news articles (title / subtitle / text in English are empty). | Media → News → edit → English version |
| 8 | News author "Vannak" is shown on the site — keep a personal name or use the federation? | Media → News → edit |
| 9 | Link the video "ពេជ្រ សម្បត្តិ vs ធន់ ម៉េងហុង" to Pich Sambath (no fighter set). | Media → Video → edit → fighter |
| 10 | Confirm `info@kunkhmer.com` (footer, "Become a partner") receives mail. | — (email provider) |
| 11 | International partners: "partner since" years; review the Khmer descriptions; confirm the logos may be shown. | Strategic Partners → International Partners |

## Log
### 2026-09-29
- Scanned clubs, fighters, events, bouts, news, videos, sponsors, broadcasters and partners for the
  known typos and other gaps; applied the 5 fixes above in one transaction and re-read them.
- Ganzberg spelling/website: [Branding in Asia](https://www.brandinginasia.com/ganzberg-beer-cambodia/),
  brewery listings give ganzberg.com (301 → beerganzberg.com).

### 2026-09-30
- Re-checked the dev DB (read-only): all 11 items still open — 10 July bout still Draft with no result; personal
  Gmail on both clubs and Cambodia Beer; Ganzberg email still `info@gangberge.com`; Pich Sambath 150-25-79;
  Bird Sengkem province "Phnom Penh, Cambodia", Pich Singhak none; both news without English (authors "Vannak",
  "System Administrator" — the site hides system names); video without fighter; International Partners without
  "partner since". Nothing changed by me.
- Staff hand-off page (owner-private until shared): "KKF Launch Checklist" https://claude.ai/artifact/WtCYeqYeK8aoniN1uEVDF6
  — the 11 items above, the About the Federation content to collect, launch content and the Khmer review list.
