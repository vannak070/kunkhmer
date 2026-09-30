# Update: Weigh-ins are not public

| | |
|---|---|
| **Status** | Done (not committed) |
| **Jira** | n/a |
| **Feature** | matches-results.md, program-officer-friendly.md |
| **Requested by** | vannak070 (2026-09-30, "go ahead" — found in the officer walk-through) |

## Current behavior
`GET /matches`, `GET /matches/:id` and a video's nested `match` returned `weigh_in_a_kg`, `weigh_in_b_kg`,
`weigh_in_at`, `weigh_in_by` to everyone, although weigh-ins are for the admin only (the fan site never shows them).

## Change
- `matches/format.ts` `withoutWeighIn(match, staff)`: removes the four fields unless the request is from a signed-in
  admin user. Used by `GET /matches` and `GET /matches/:id`; a video's nested `match` never includes them.
- Admin screens (signed in) are unchanged. Fan site unchanged (doesn't read them). KUNKHMER HUB doesn't read them.

## Impact
- Public response shape: the four fields are gone for visitors → `matches.test.ts` "shows a match" snapshot
  updated deliberately (only those four lines removed); "lists matches…" compares with the staff shape minus them.

## Acceptance criteria
- [x] Visitor `GET /matches/:id` and `GET /matches?eventId=` have no weigh-in fields; staff still get the weights
      (new test in `records-weighin.test.ts`).
- [x] Backend typecheck clean; contract suite 265/265.

## Log
### 2026-09-30
- Built and tested as above.
