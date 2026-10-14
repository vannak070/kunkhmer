# Update: Demo week on the dev database

| | |
|---|---|
| **Status** | Loaded 2026-10-14 on the **dev database only** (not the live pilot); the doc is committed (bb5a146c), the data never goes to the live pilot |
| **Feature** | claude/features/weekly-program.md |
| **Requested by** | vannak070 ("start demo week"; earlier: put the demo shows on dates at the end of this week) |

## What was loaded
- From the owner's PDF of KKF program sheets (1–5 Oct 2026), moved +14 days: **18 shows, 105 bouts** on Thu 15 – Mon 19 Oct 2026 with their start times, broadcaster, main sponsor, venue text, bout type, rounds, rule set (MAS Fight), women's bouts, tournament draws (AIRA, the million-riel prize show, Boostrong Takeo, Boostrong Kampong Speu: qualifiers + final waiting for the winners) and one corner to be announced (Kampong Speu bout 7).
- The **WURKZ** sheet was left out: the owner had already created "WURZ សេនាគុនខ្មែរ" on Sat 17 Oct.
- Created where missing: broadcasters Hang Meas HDTV, Town TV, CTN, TV5 Cambodia, TVK (Bayon = existing "BTV Sport"); sponsors AIRA, Kubota, Boostrong, Champion, MAS Fight, DAZZ, Krud (Cambodia Beer and Ganzberg Beer existed); 12 associations in the Settings list (RCAF uses the owner's existing entry); 62 clubs checked (new ones with their association and the tag `[DEMO-WEEK 2026-10 sheets]` in the description); **199 new fighters** (Khmer name in both name fields, weight = bout weight, no date of birth / height, foreign fighters with country only). Two existing fighters were reused (ធន់ ចាន់តាក់, ធន់ រិទ្ធី).
- Shows are Published with the description "Demo show from KKF's program sheets of 1–5 Oct 2026, moved to this week. [DEMO-WEEK 2026-10 sheets]". Bouts are Draft, accepted, gloves "10oz / —"; rounds not printed on a sheet were set to 3; no officials, weigh-ins or results.
- **Khmer names were typed from the scanned sheets** — a few may be misspelt (e.g. Kampong Speu bout 4 blue corner, Kampong Cham bout 7 red corner); the owner spot-checks.

## Undo
- Backup of the dev database just before loading: `~/Backups/kunkhmer-dev-before-demo-week-2026-10-14.dump` (restore with `pg_restore --clean`).
- Or delete only the demo: events whose description contains `[DEMO-WEEK 2026-10 sheets]` (cards and bouts cascade), then fighters with `created_at = '2026-10-14 06:46:47'` and no other bouts, clubs whose description is the tag, and the new sponsors / broadcasters / associations if unused.
- Loader script kept at `~/Backups/kunkhmer-demo-week-loader-2026-10-14.ts` (re-running does nothing while the demo exists).
