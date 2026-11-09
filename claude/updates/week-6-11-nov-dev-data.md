# Update: last week's KKF program (6–11 Nov 2026) loaded on dev

| | |
|---|---|
| **Status** | Loaded 2026-11-09 on the **dev database only** (not the live pilot) |
| **Jira** | n/a |
| **Feature** | claude/features/weekly-program.md (data, no code change) |
| **Requested by** | Owner ("prepare the match based on my last week match" → chose: last week itself, with bouts, dev first) |

## What was loaded
From KKF's program PDF `កម្មវិធីប្រកួត (4).pdf` (25 sheets, Fri 6 – Wed 11 Nov 2026) via my Markdown conversion of it:
- **25 shows** (Published, with date, start time, venue, TV station, main sponsor where the show name names one) and **156 bouts**
  (the sheets' 158 lines minus page 8's two "KICK BOXING" slots that have no fighters and no weight).
- **Draws:** 8 finals ("វគ្គផ្តាច់ព្រ័ត្រ") wait for the winners of bouts 1 and 2 of their show (draw name = the sheet's draw heading).
  MAS FIGHT's two qualifiers have no pairings on the sheet (empty corners); page 22 bout 2 has no blue corner.
- **Bout type:** friendly / international / youth (ថ្នាលគុនខ្មែរ) / points belt / title fight / title defence / cash prize / prize / final mapped
  to the standard types; other wordings kept as "Other" with the sheet's own words (e.g. «គូម៉ារ៉ាតុងដណ្តើមពាន វគ្គជម្រុះ»).
  Fingerless gloves (ហ្គង់ចេញម្រាម) and KICK BOXING set the rule set.
- **Rounds:** as printed (៣ទឹក / ៥ទឹក); **93 bouts don't print the rounds → 5 rounds × 3 min** (edit per bout if wrong). Gloves "10oz / —".
- **Fighters:** 263 new (KKF-000235 … KKF-000497; Khmer names as on the sheets, foreign fighters with their country), 28 corners matched
  fighters already on dev by the exact Khmer / Latin name. **43 new clubs** (with their association; RCAF mapped to the existing
  «…ភូមិន្ត» entry), 2 new associations (Kampong Cham, Tbong Khmum).
- KKF staff confirmation recorded for details and sponsors of every show (as if staff entered them).
- Known sheet issues are listed in the conversion's review notes (spellings between draw list and bouts, Afghan fighter with a Cambodian
  club, "ALGERIA" twice…). Names were transcribed from scans: spot-check before anything goes live. Some may duplicate October's demo
  fighters under a slightly different spelling — see Fighters › Duplicates.

## Undo
- Dev backup just before: `~/Backups/kunkhmer-dev-before-week-6-11-nov-2026-11-09.dump` (`pg_restore --clean`).
- Or delete events whose description contains `[KKF-WEEK 2026-11-06 sheets]` (cards and bouts go with them), then fighters and clubs with
  `created_at = 2026-11-09 06:48:31`.
- Parser / loader / data kept in `~/Backups/kunkhmer-week-6-11-nov-{parser,loader,data}-2026-11-09.*` (re-running the loader does nothing while the week exists).

## Log
- 2026-11-09: loaded (25 shows, 156 bouts, 263 new fighters, 43 new clubs); dev API serves 25 published shows; 145 bouts public (the 11 with
  an empty corner are hidden from fans, as designed).
- 2026-11-09 (later, owner: "delete old match, I need only last week match"): on the **dev** database every other match was deleted — 23 matches
  (Jul 10, Oct 3 and Oct 10 test nights with 9 results, the October demo week 15–19 Oct, two empty drafts incl. "KunKhmer All Start III" on 7 Nov),
  114 bouts with their cards, agreements and change history (database cascades). The records of the 216 fighters in those bouts were recalculated
  (no results left; 27 fighters keep their typed career record). Fighters and clubs themselves were kept. Dev now has only last week's 25 shows /
  156 bouts. Backup just before: `~/Backups/kunkhmer-dev-before-delete-old-matches-2026-11-09.dump`. The live site was not touched.
- Same day: the Week board went to Friday–Thursday and, at the owner's request, back to **Monday–Sunday** (so last week's Mon 9 – Wed 11 Nov
  shows appear in the week of 9–15 Nov).
- 2026-11-09 (owner: "delete all upcoming match"): on **dev**, the 5 shows dated today or later were deleted (KRUD KUN KHMER and CAMBODIA
  កម្លាំងកម្ពុជា on Mon 9 Nov, ថ្នាលគុនខ្មែរ WURKZ and CAMBODIA កម្លាំងកម្ពុជា on Tue 10, ថ្នាលគុនខ្មែរ WURKZ on Wed 11 — 35 bouts, no results).
  Dev now: 20 shows / 121 bouts, Fri 6 – Sun 8 Nov; nothing upcoming. Fighters kept. Backup just before:
  `~/Backups/kunkhmer-dev-before-delete-upcoming-2026-11-09.dump`. Live not touched.
