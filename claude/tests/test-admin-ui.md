# Test: Admin and public site smoke test (browser)

| | |
|---|---|
| **Feature** | all |
| **Type** | UI (browser) |

## Preconditions
- `docker compose up -d` (backend :3001, admin :5175, public :5176).
- Data to look at: the dev database, or demo data via
  `docker exec kunkhmer_backend npm run db:seed:demo -- --reset`
  (**wipes all data** — ask the user before running it on their dev database).
- Local test login from the seed: `admin` / `admin123` (demo data adds
  `officer/officer123`, `organizer/org123`, `club/club123`, …).

## Steps
1. Open `http://localhost:5175`, log out if signed in, sign in as admin.
2. Visit: Dashboard `/home`, Fighters `/home/fighters`, a fighter
   `/home/fighters/<id>`, Clubs `/home/clubs`, Program/Events
   `/home/program?tab=events`, an event `/home/events/<id>`, Champions
   `/home/program?tab=champions`, a title `/home/champion/<id>`, News `/home/media/news`, Videos `/home/media/video`,
   Partners `/home/strategic-partners`.
3. On each page read the network requests for `/api/` and the console errors.
4. For the changed feature: do the create/edit flow through the UI, then
   reload and confirm the change persisted.
5. Open `http://localhost:5176` (public site): home, a fighter, an article.
6. For role-specific changes, repeat the relevant pages as that role.

## Expected results
- Every `/api/` request returns 2xx (or the expected 4xx for a refused action).
- No console errors; pages show real data (not blank or mock placeholders).

## Pass criteria
All steps done, no failed requests or console errors; report anything that
looked wrong even if it isn't a hard failure.

## Notes
- The network buffer drops old requests; read it right after each page.
- Pages listed as mock-data in `claude/config.md` show fake data by design.
