# Update: Possible same fighter warning

| | |
|---|---|
| **Status** | Done (2026-10-14, live since 936db4ea) |
| **Feature** | claude/features/fighters.md |
| **Requested by** | vannak070 ("start duplicate fighter warning") — ~220 fighter slots a week, many new names typed in Khmer and English |

## Change
- **API** `POST /fighters/similar { name, nameKhmer?, dateOfBirth?, excludeId? }` (KKF staff + clubs; nothing saved) → up to 5 registered (not deleted) fighters that look like the same person, with reasons: `same_name`, `similar_name` (Latin name ≤ 2 letters apart, or the same words in another order), `same_name_khmer`, `similar_name_khmer` (≤ 1 apart), `same_birth` (only together with a name match). Strongest first. Name helpers moved to `backend/src/lib/names.ts` (also used by the Staff assistant's duplicate list).
- **Add / Edit fighter**: while the names and date of birth are typed, an amber box lists "Possible same fighter already registered" (name, Khmer name, club or country, weight, born, reasons; each opens the profile in a new tab). Saving a **new** fighter while the box has names asks "Is this fighter already registered?" → **Don't save** or **It's a different fighter — save**. Editing shows the box (other fighters only) but doesn't ask. EN + KM.

## Log
### 2026-10-14
- Contract tests in `fighters.test.ts` (each reason, word order, date of birth, excludeId, short names, roles). Full suite 354/354 in CI mode (one earlier full run had 3 files fail to start and passed on the re-run and alone — not reproduced). Backend typecheck clean; admin builds.
- Checked on a temporary admin on the test API: typing "Pech Sambath" showed "Pich Sambath · ពេជ្រ សម្បត្តិ · 60.5 kg · born 1995-05-05 (similar name)". The save question was not clicked through in the browser.
