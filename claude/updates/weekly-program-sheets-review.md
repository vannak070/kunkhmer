# Review: weekly program sheets by broadcaster (owner's PDF, 2026-10-13)

| | |
|---|---|
| **Status** | Review + proposals (nothing built); waiting on the owner's choices |
| **Source** | `កម្មវិធីប្រកួត.pdf` — 19 official program sheets (KKF letterhead + stamp), 1–5 Oct 2026 |
| **Requested by** | vannak070 ("review the matches weekly by broadcaster, 15–20 shows per week, give improvement feedback") |

## What the sheets contain (one sheet = one show)
- Letterhead (Kingdom of Cambodia, KKF), the broadcaster or sponsor logo, the **show name** (almost always a sponsor brand: Xtreme Cambodia, AIRA, Kubota, Boostrong ×5, Ganzberg ×2, Wurkz, MAS Fight, DAZZ, Krud, Champion, Cambodia ×4…), the **nature** (friendly, international), the **station / studio or province venue**, Khmer + Gregorian date and the **start time**.
- Table: bout number + rounds ("៣ទឹក" 3 rounds, 5, even 1 round), a **bout label** (friendly · international in red · youth "ថ្នាល" · tournament qualifier · final · prize), red corner (name, club, association), rule + weight ("KUN KHMER 63,5 KG", "MAS FIGHT 60 KG", "(នារី)" for women), blue corner (Cambodian: name, club, association; foreign: Latin name + country, sometimes a gym).
- Tournament shows add a **draw list** ("សមាសភាពចាប់ឆ្នោត": 4 fighters) and a final whose corners are blank until the semi-finals are fought.
- About 110 bouts and about 45 foreign fighters over the 19 sheets; weights run 28–77 kg including 63.5 and the youth classes 28–45 kg.

## Fit with the system today
| Sheet needs | System today |
|---|---|
| Show = event, one broadcaster, sponsors, venue | yes (Match in the admin, Organizer = broadcaster) |
| Association under each club | yes (club association, Settings list) |
| Start time per show | **no** — events store a date only |
| Blank / "to be announced" fighter, "winner of bout 1" in a final | **no** — a bout needs two fighters |
| Bout label (friendly / international / youth / qualifier / final / prize) | **no** (only title fight yes/no) |
| Rule per bout (Kun Khmer, MAS Fight, women) | partly (rules presets; no "MAS Fight", gender only as a matching rule) |
| Foreign fighter with only name + country (+ gym) | **heavy** — fighter form wants Khmer name, date of birth, ID + emergency contact |
| Youth bouts 28–45 kg | **blocked** by the `min_age` 16 rule; youth weight classes start at "Under 45" |
| Weekly view by broadcaster / day, conflicts | **no** — list per match only |
| The official program sheet (letterhead, logo, stamp, serial) | **no** — "Share poster" is an image, not the KKF sheet |
| Many shows each week from the same series | **no** — each show is typed from scratch |

## Improvements (proposed order)
1. **Start time** on every match + weekly board (rows = broadcaster, columns = day, cards = show with time, venue, sponsor, bout count, status/problems).
2. **Official program sheet (PDF)** from the data, in the KKF letterhead (logos, Khmer + English date, bout table, serial number, stamp + signature place); versions when a change is recorded (Phase 6 changes already exist).
3. **"To be announced" corners and tournament draws:** a bout slot may be empty or "winner of bout N"; a draw list builds the semi-finals and fills the final automatically.
4. **Bout label + rule per bout** (friendly / international / youth / qualifier / final / prize; Kun Khmer, MAS Fight, women) with the rounds and round time.
5. **Foreign and guest fighters:** quick add (name, country, optional gym, weight), no KKF ID/KYC; clear "foreign" badge; reuse across weeks.
6. **Youth category:** age limit per bout label (youth allowed below 16 with guardian + youth weight classes 28–45 kg), instead of blocking.
7. **Series (templates):** a show brand (Boostrong, Ganzberg, Cambodia…) with default broadcaster, sponsor, venue/studio, time, rounds, rule; "create this week's show" in one click and "copy last week".
8. **Weekly checks:** double-booked fighter (same week / rest days), same studio or same broadcaster overlapping times, weekday that doesn't match the date, weight gap beyond the agreed weight, missing weigh-in; shown as a checklist before the week's sheets are signed.
9. **Bulk entry:** Excel/CSV template for 100+ bouts per week (fighter picked by Khmer name + club, with duplicates flagged).
10. **Weekly reports:** shows and bouts per broadcaster and per sponsor, fighters per club / association, foreign fighters by country.
11. **Nice to have:** Khmer calendar line on sheets (weekday + lunar day + Buddhist year), standard weight notation (63.5, no "KUKHMER" typos), consistent association / club names via the Settings lists.

## Questions for the owner
1. Is the sheet the **source of truth** (the system must print it) or only a copy? Who signs and stamps it, and is there a serial number?
2. Does each show have its own approved version after changes (replacement bout, postponed)?
3. Are youth (28–45 kg) fighters under 16 and how are they matched (age, weight, guardian)?
4. Which time zone / how to treat late shows (after midnight)?
5. Which comes first: the weekly board, the PDF sheet, or the foreign-fighter quick add?
