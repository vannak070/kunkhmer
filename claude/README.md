# claude/ — team AI context pack

Context for AI coding agents (and humans) working on this repo. Claude Code
loads `config.md` automatically via the root `CLAUDE.md`.

| Path | What |
|---|---|
| `config.md` | How the agent must work on this repo: stack, commands, conventions, rules, known gaps |
| `features/<name>.md` | One per feature: goal, roles, API, data, pages, rules, tests, gaps (Jira/Figma links for new work) |
| `updates/<name>.md` | Requests to change existing behavior, with a log of what was done |
| `tests/test-<name>.md` | How the AI should test a flow |
| `templates/` | Templates for features, updates and tests |

**Asking for new work:** copy the matching template, fill in what you know
(leave TBD for the rest), and point the agent at the file — e.g. "implement
claude/features/fighter-medical-status.md".

## Feature index

| File | Feature | Status |
|---|---|---|
| `features/about-federation.md` | About the Federation page (website-review step 3) | Done |
| `features/admin-pwa.md` | Admin as an installable app (PWA) for low-tech operators | Partly built (committed, not deployed) |
| `features/ai-assistant.md` | Kun Khmer AI assistant (plan) | Live (needs API key) |
| `features/auth-users.md` | Auth and user management | Done |
| `features/champions.md` | Championship titles | Done |
| `features/club-logos.md` | Club logos | Done |
| `features/clubs.md` | Clubs (gyms) | Done |
| `features/events.md` | Events | Done |
| `features/fan-accounts.md` | Fan accounts | Done |
| `features/fighter-personal-records.md` | Fighter personal records (ID / KYC, emergency contact, medical) | Built 2026-09-30 |
| `features/fighters.md` | Fighters | Done |
| `features/international-partners.md` | International partners (partner organisations) | Done |
| `features/kkf-workflow-rules.md` | KUN KHMER workflow validation rules | Reference |
| `features/knowledge-base.md` | Knowledge base (KUNKHMER HUB Phase A) | Built |
| `features/match-proposals.md` | Match proposals (club confirmation) — admin Phase 3b | Done |
| `features/matches-results.md` | Fight cards (batches), matches and results | Done |
| `features/media.md` | Media — news articles and videos | Done |
| `features/officials.md` | Officials (referees and judges) | Done |
| `features/partners.md` | Strategic partners — sponsors, broadcast stations, international partners | Done |
| `features/public-champions.md` | Public champions page | Done |
| `features/public-site.md` | Public fan website | In progress |
| `features/settings.md` | Settings lists and Help | Done |
| `features/statistics.md` | Statistics (public site) | Draft |

Status is a short summary; the full status line is at the top of each file.
