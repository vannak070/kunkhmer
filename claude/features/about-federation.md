# Feature: About the Federation page (website-review step 3)

| | |
|---|---|
| **Status** | Built 2026-09-30, not committed — waiting for owner review; content to come from KKF |
| **Jira** | n/a |
| **Figma** | n/a — light site style (`public-site.md`) |
| **Owner** | vannak070 |

## Goal
Fans and newcomers can read who the Kun Khmer Federation is, who leads it, how to contact it,
how to join, and download its rules and forms, at `/federation`. KKF staff keep the content up
to date themselves in the admin, so no developer is needed when KKF sends or changes content.

## Decisions (owner, 2026-09-30)
- Staff edit the content in the admin (English + Khmer); the page shows only filled-in sections.
- Own page `/federation`, linked from `/about` and the footer (links hidden until something is
  published). `/about` stays the beginner's guide to the sport.
- Sections: mission & history, leadership, contact & how to register, rules & documents (PDF).
- KKF Officers edit the draft; only a Super Admin publishes it (same idea as the knowledge base).

## Users and roles
| Role | May |
|---|---|
| Public visitor | Read the published page (`GET /api/federation`) |
| KKF Officer | Read and edit the draft, discard draft changes |
| Super Admin | Everything an Officer can, plus **publish** the draft |
| Others | Nothing (403) |

## API (`backend/src/modules/federation/routes.ts`, camelCase)
| Method | Path | Who | Notes |
|---|---|---|---|
| GET | `/api/federation` | public | Published content, or `data: null` when nothing is published (or everything is empty) |
| GET | `/api/federation/draft` | STAFF | `{ draft, published, changed, draftUpdatedAt, draftUpdatedBy, publishedAt, publishedBy }` |
| PUT | `/api/federation/draft` | STAFF | Replaces the whole draft; 422 on invalid fields; returns the same shape as GET draft |
| POST | `/api/federation/publish` | Super Admin | Published = draft; returns the GET draft shape |
| POST | `/api/federation/discard` | STAFF | Draft = published (or empty); returns the GET draft shape |

Content (every text optional, `""` → null):
`{ missionEn, missionKm, historyEn, historyKm, foundedYear, leaders: [{ nameEn, nameKm, roleEn,
roleKm, photoUrl }], addressEn, addressKm, phone, email, officeHoursEn, officeHoursKm, mapUrl,
registerEn, registerKm, documents: [{ titleEn, titleKm, fileUrl }] }`.
Public GET adds `publishedAt` (ISO). Dates ISO.

## Data
Table `federation_page` (one row, key `main`): `draft` JSON, `published` JSON (null until first
publish), `draft_updated_at/by`, `published_at/by`, `created_at`, `updated_at`.

## Files
- Leader photos: base64 images like everywhere else (global hook → `/api/files/<hash>.<ext>`).
- Documents: PDF only, up to 10 MB each, sent as `data:application/pdf;base64,…` in
  `documents[].fileUrl` and stored by this route only (the global hook stays images-only, so no
  other endpoint accepts PDFs). Served from `/api/files/<hash>.pdf` as `application/pdf`.

## Frontend
- Admin `pages/FederationPage.tsx` at `/home/federation`, menu "About the Federation" under
  Content & partners (permission `federation.manage`: Super Admin + KKF Officer). One form with an
  English / Khmer switch; leaders and documents as lists (add, remove, move up/down); Save draft,
  Discard changes, Publish (Super Admin), status line (published date, unpublished changes).
- Fan site `pages/Federation.tsx` at `/federation`: light header (title, mission, founded year),
  "On this page" chips, History, Leadership cards (photo or initials), How to register, Rules &
  documents (PDF links), Contact (address, phone, email, office hours, map link). Khmer text when
  the site is in Khmer and it exists, else English (marked with `lang`). Nothing published → short
  "coming soon" note with links to the guide and the Hub.
- Links: "About the Federation" card on `/about`, footer site links; both only when published.
  Sitemap lists `/federation` when published.

## Business rules
- Required inside a list item: leader `nameEn` + `roleEn`; document `titleEn` + `fileUrl`.
- Limits: mission 600 chars, history 8 000, register 4 000, other text 300; at most 30 leaders and 30
  documents; `foundedYear` 1900–this year; `email` must look like an email; `mapUrl` must be
  `https://`; `photoUrl` a stored file link or `https://`; `fileUrl` a stored `.pdf` link.
- Publishing copies the draft exactly; a later draft edit doesn't change the public page until the
  next publish.

## Acceptance criteria
- [x] Officer edits and saves the draft; can't publish (403); Super Admin publishes; public GET shows it.
- [x] Validation 422s; non-staff 401/403; PDFs only through this route; contract snapshots.
- [x] Admin page works (save, publish) at desktop width — checked on the test API; the browser file picker itself not clicked (PDF/photo storage covered by contract tests + API).
- [x] Fan page at 1280 and 375 px, English and Khmer; empty sections hidden; links hidden when unpublished.
- [x] Typecheck, full contract suite, both `vite build`s.

## Tests
`api-tests/tests/federation.test.ts` (roles, validation, publish flow, PDF storage, shapes).

## Log
### 2026-09-30
- Backend: `modules/federation/routes.ts`, migration `20260930000001_federation_page`, `lib/files.ts`
  `storePdfDataUri` (checks the `%PDF-` signature; the global hook stays images-only), sitemap entry.
- Admin: `pages/FederationPage.tsx`, menu + route, permission `federation.manage` (Super Admin + KKF Officer), `api.federation`.
- Fan site: `pages/Federation.tsx`, `data/federation.ts` (one shared request), route `/federation`, card on
  `/about` and footer link (both only when published), 22 `federation.*` strings EN + KM.
- Checked: dev site `/federation` shows "Coming soon" and no links while nothing is published (dev DB has only
  the empty table). On the test API with sample content (clearly marked SAMPLE, test DB only): 1280 px English
  and 375 px Khmer (English fallback per field, no sideways scroll), About card + footer link, admin edit →
  Save draft (public unchanged) → Publish (public updated). Contract suite `CI=true` 258/258; backend
  typecheck; admin + fan `vite build`.

## Open questions
- ~~Should KUNKHMER HUB answer from this page?~~ Yes (owner, 2026-09-30): tool `about_federation`,
  published content only — `updates/hub-federation-page.md`.
- KKF to supply the actual content (leadership, mission/history, contacts, how to register, rule PDFs).
