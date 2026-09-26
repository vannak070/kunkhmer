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
