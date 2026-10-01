# Update: Add / Edit club map picker

| | |
|---|---|
| **Status** | Done (2026-10-01, uncommitted); owner said "go ahead as your plan" (defaults: save the pin, map on the public club page, remove the quick hubs) |
| **Feature** | claude/features/clubs.md |
| **Requested by** | vannak070 ("review on map when add new club, it is not working properly, plan to improve") |

## Review findings (`pages/AddClub.tsx`, checked in the browser on the test API)
1. **Editing a club overwrites its saved location.** On load the map reverse-geocodes its default pin (Independence Monument, Phnom Penh) and writes that address into the Location field — also in Edit mode, after the club's own location was loaded. Saving then moves the club to Phnom Penh. Reproduced: club saved as "Kampot Town, Cambodia" opened with "Independence Monument Roundabout, Khan Boeng Keng Kang, Cambodia".
2. **New clubs start with a fake location** (the same Independence Monument address) the user never chose.
3. **The pin is never saved.** The API/DB store only the Location text (no latitude/longitude), so a club's real position is lost; Edit can't show the saved place on the map.
4. **Search bug:** a successful search sets `coords` with key `lon` instead of `lng`, so the coordinates panel shows "NaN"/wrong.
5. **Reverse geocoding is fragile:** one request per drag/click straight to the public Nominatim server (limit about 1 request per second, no identification); responses can arrive out of order and overwrite a newer pick; no error message when it fails.
6. **Hard-coded "Quick select hubs"** are demo clubs with made-up coach names; picking one also fills the Head Coach field. This breaks the "real data only" rule.
7. **Outside dependencies:** Leaflet, the red marker image and its shadow are loaded from unpkg, raw.githubusercontent and an old cdnjs copy at run time. If one is blocked the map or marker silently breaks (the fallback is an unused bundled PNG with fake hubs).
8. Dead code: `pin` state, the fallback image map, `lon`.

## Plan
1. **Stop the overwrite (small, do first):** don't reverse-geocode on load; in Edit start at the saved place; in New start at an empty Location with the map centred on Phnom Penh and no marker until the user picks a place.
2. **Save the position:** nullable `latitude` / `longitude` on `clubs` (migration, both-or-neither like venues), returned in the club API (additive snapshot change), set by the pin; Edit centres on it.
3. **Make the picking reliable:** search with a result list (up to 5, Khmer and English), debounce and ignore stale answers, clear error and "try again", pin by click / drag, a "use my location" button, the address field stays editable by hand and is never overwritten after the user types in it.
4. **Remove the fake quick hubs** (and the demo PNG fallback); if the map can't load, show a plain message and keep the typed address field working.
5. **Bundle Leaflet** with the admin (npm package, local marker icons) instead of loading it from the internet.
6. **Show it:** club detail in the admin and the public club page get a small map + "Open in Google Maps" link when coordinates exist (hidden when empty).
7. Tests: API contract tests for the new fields (save, clear, both-or-neither); browser check New / Edit / search / phone width in English + Khmer.

## Open questions
- Save the pin position in the database (step 2)? Default: yes.
- Show a map on the public club page (step 6)? Default: yes, small, only for clubs with a pin.
- Remove the Quick select hubs? Default: yes.

## Built (2026-10-01)
- DB: `clubs.latitude` / `clubs.longitude` DECIMAL(9,6) NULL, migration `20261001000003_club_coordinates`. API: `POST/PUT /clubs` accept both (numbers, ranges −90..90 / −180..180, both or neither, `null` / `""` clears, a PUT with one value keeps the other); club rows return them as numbers or null.
- Admin: new `components/clubs/ClubMapPicker.tsx` (Leaflet from npm, `leaflet@1.9.4` added to `frontend/admin/package.json`; no CDN). Edit starts on the saved pin and keeps the saved Location; New starts empty with no pin. Search list (5 places, Khmer + English), click / drag, "Use my location", "Remove pin", tile-failure note, one reverse lookup at a time (stale answers dropped); the address fills Location only while it is empty, otherwise "Use as the location" button. The card is not a `<form>` (it sits in the club form; Enter searches instead of saving). The fake "Quick select hubs", the CDN loaders and the demo-PNG fallback are gone from AddClub.
- Admin club detail: "Open map" link (uses the pin when there is one). Public club page: "Open map" uses the pin, and a small OpenStreetMap embed shows in the Details card for clubs with a pin (EN + KM title).
- Tests: clubs contract tests for the pin (save, partial update, invalid values, both-or-neither, clear); suite 280/280 (CI mode; snapshots only gained the `latitude` / `longitude` lines); backend typecheck clean; both frontends build.
- Checked on a temporary admin on the test API: New (empty Location, no pin, click → pin + address), Edit (saved Location kept, pin on the saved place), search + choose (pin moves, typed Location kept, "Use as the location" offered). Not browser-checked: the public club page embed, Khmer / phone layout of the picker.
- Live pilot: needs migrations 20261001000001 / 2 / 3 on deploy, and an admin image rebuild (new npm dependency). Existing clubs have no pin until edited.
