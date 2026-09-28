# Update: KUNKHMER HUB Phase D2 — staff assistant in the admin

| | |
|---|---|
| **Status** | Done — committed f4b4010f (2026-09-28) |
| **Jira** | n/a |
| **Feature** | claude/features/ai-assistant.md |
| **Requested by** | vannak070 (2026-09-28: "Start Hub Phase D2") |

## Current behavior
The Hub only answers fans on the public site (`POST /api/ai/chat[/stream]`, public data only).
Staff find work by clicking through lists: the dashboard to-do (`admin-phase0-1.md`) counts
results to record, fighters to verify and draft events, but nothing answers "which clubs are
still waiting?", "which fighters have no date of birth?" or "are there duplicate fighters?".

## Requested change (proposal)
- **Admin page "Staff assistant"** (KKF staff only: Super Admin + KKF Officer) — a chat like
  `/hub`, streaming, EN/KM, with sample questions. Read-only: answers link to the admin page
  where staff act (`/home/fighters/:id`, `/home/events/:id`, `/home/clubs/:id`, …).
- **API** `POST /api/ai/staff/chat/stream` (STAFF token), same input and SSE events as the
  public stream. Same model loop, a staff system prompt, and the public tools **plus** staff tools:
  - `pending_approvals` — fighters waiting for verification, club registrations, events waiting
    for KKF approval, match proposals waiting on someone.
  - `data_quality` — past fight nights without results, fighters missing photo / weight /
    date of birth / club, likely duplicate fighters (same or very similar name + date of birth).
  - `drafts` — draft events, news, videos and knowledge articles.
  - Staff tools may see non-public records (drafts, unverified fighters) but not personal
    contact details, medical data or passwords (see open questions).
- **Log & cap**: `hub_logs.source` column (`public` | `staff`, migration). Staff answers count
  toward the **same $50/month cap** (owner decision). "Hub answers" shows public vs staff spend
  and a source filter.

## Why
Phase D2 of the agreed Hub plan (`updates/hub-phase-d-everywhere.md`); saves staff clicking
through lists to find work.

## Scope
In scope: the staff endpoint, staff tools, admin page, log source + spend split, contract tests.
Out of scope: the assistant writing or changing data (never); Organizers / Clubs / officials
using it; D3 (personalised fan answers).

## Impact
- API: new `POST /api/ai/staff/chat/stream` (+ non-stream `POST /api/ai/staff/chat` for tests);
  `GET /api/ai/usage` gains `staffSpendUsd` / `publicSpendUsd`; `GET /api/ai/logs` items gain
  `source` and accept `?source=`. Snapshots updated deliberately.
- Database: `hub_logs.source VARCHAR(10) DEFAULT 'public'` — migration.
- Frontend: new admin page + menu item; `HubAnswers.tsx` spend split and filter. Public site unchanged.

## Acceptance criteria
- [x] Only Super Admin + KKF Officer can use it (401 without token, 403 for other roles).
- [x] Never writes; every staff tool is a read-only query.
- [x] Answers link to the matching admin page.
- [x] Logged with `source = staff`; counts toward the shared monthly cap; Hub answers shows the split.
- [x] Off when the Hub is off (`AI_ENABLED=false` / no key): page says so, API 503.
- [x] Contract tests: auth/role checks, 503 when off, usage/logs shape.

## Owner decisions (2026-09-28)
1. **Own admin page** ("Staff assistant"), not a panel on every page.
2. **Names + sport facts only** go to the model: name, club, status, record, weight, which fields
   are missing. No phone, email, national ID, address or medical data.
3. The staff log **records which staff member asked** (`hub_logs.user_id`); public answers stay anonymous.
4. **30 questions per staff member per 10 minutes**, plus the shared monthly cap.

## Log
2026-09-28 — built:
- Migration `20260928000004_hub_logs_staff`: `hub_logs.source` (`public` | `staff`, default public) and
  `hub_logs.user_id` (FK users, ON DELETE SET NULL; only set for staff answers).
- `backend/src/modules/ai/staffTools.ts`: `pending_approvals`, `data_quality` (`missing_results`,
  `fighter_gaps`, `duplicates`, `officials`, `all`), `drafts`, `find_records`; every item has an
  `admin_url`. Public tools stay available; their fan-site `url` fields are stripped. No contact, date
  of birth (only an "unlikely date of birth" flag), medical or disciplinary data.
- `routes.ts`: model loop takes a profile (public / staff); `POST /api/ai/staff/chat` and
  `/ai/staff/chat/stream` (STAFF); staff rate limit 30 per account per 10 min (`usage.ts`
  `rateLimit(key, limit)`); `GET /ai/usage` adds `publicSpendUsd` / `staffSpendUsd`; `GET /ai/logs`
  items add `source` + `askedBy {id, name}` and accept `?source=`.
- Admin: `pages/StaffAssistant.tsx` at `/home/assistant` (menu "Staff assistant" under Dashboard,
  permission `hub.assistant` for Super Admin + KKF Officer), `components/AssistantMarkdown.tsx`
  (only `/home/...` links become links), `api.ai.status / staffChatStream / feedback`. `HubAnswers.tsx`:
  fans vs staff spend, "Asked by" filter, "Staff · <name>" badge, staff tool labels.
- Checks: backend `typecheck` passes; contract suite 217/217 with `CI=true` (usage snapshot updated
  deliberately for the two new spend fields; 3 new staff tests). Staff tools run directly on dev data
  (free). One live question in the browser ("Which past fight cards still need results?") → correct
  answer with working card / record-result links, logged as staff with the account, **$0.03**
  (Opus 5). Hub answers split and filter checked; page checked at 375 px. Admin `vite build` and `tsc`
  pass for the changed files. Fixed a duplicate React key in the answer renderer (bold + link).

