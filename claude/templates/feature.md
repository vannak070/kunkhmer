# Feature: <name>

<!-- Copy to claude/features/<name>.md (kebab-case). Fill what you know and
     leave "TBD" for the rest; the AI asks about TBDs before building. -->

| | |
|---|---|
| **Status** | Draft / Ready / In progress / Done |
| **Jira** | <ticket link or TBD> |
| **Figma** | <frame link or TBD> |
| **Owner** | <name> |

## Goal
What the user can do when this is finished, in one or two sentences.

## Users and roles
Who uses it and what each role may do (Super Admin, KKF Officer, Organizer,
Club/Gym, Referee, Judge, public visitor).

## API
New or changed endpoints: method, path, who may call it, request body,
response shape (`{ success, data }`), error cases.

## Data
Tables/columns added or changed (Prisma schema + migration).

## Frontend
Admin and/or public pages and routes, with the Figma frame for each.

## Base code
Existing files to build on or copy patterns from.

## Business rules
Validation, permissions, edge cases.

## Acceptance criteria
- [ ] ...

## Tests
Contract tests to add in `api-tests/`, and a `claude/tests/test-<name>.md` for UI flows.

## Open questions
- ...
