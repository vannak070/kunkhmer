# Update: Rate limits use the visitor's real IP

| | |
|---|---|
| **Status** | Done |
| **Jira** | n/a |
| **Feature** | claude/features/ai-assistant.md, claude/features/fan-accounts.md |
| **Requested by** | vannak070 |

## Current behavior
Per-IP rate limits (Ask Kun Khmer chat `backend/src/modules/ai/routes.ts`, fan
sign-up / sign-in `backend/src/modules/fans/routes.ts`) key on `request.ip`.
Fastify had no `trustProxy`, and the Vite `/api` proxies didn't send
`X-Forwarded-For`, so the backend saw the frontend container's address
(e.g. `172.29.0.4`) for every visitor: the whole site shared one bucket of
20 AI questions per 10 minutes and 10 fan sign-ups per 15 minutes.

## Requested change
Rate limits count per real visitor IP.

## Why
One busy visitor (or an attacker) could lock everyone out of the AI chat and fan sign-up.

## Scope
In scope: trust forwarded client IPs from our own proxies only; make the Vite
proxies forward the client IP.
Out of scope: moving the limiter out of memory / a daily AI spend cap
(Phase C of the AI plan), staff login rate limiting.

## Impact
- API response shape changes? No.
- Database migration needed? No.
- Frontend pages affected: none (only `vite.config.ts` proxy options).
- New env var `TRUST_PROXY` (default `loopback,uniquelocal` = localhost and
  private networks such as Docker's). Behind a proxy on a public address
  (e.g. a CDN) set it to that proxy's addresses or hop count. Never set `true`
  if the API port is reachable directly from the internet: anyone could then
  fake their IP with an `X-Forwarded-For` header.

## Acceptance criteria
- [x] Requests through the public site proxy are logged with the browser's IP, not the container's.
- [x] A client can't reset its limit by sending its own `X-Forwarded-For` through the proxy.
- [x] Typecheck and full contract suite pass.

## Log
- `backend/src/config.ts`: `trustProxy` from `TRUST_PROXY` (default `loopback,uniquelocal`).
- `backend/src/app.ts`: `Fastify({ trustProxy })`.
- `frontend/admin/vite.config.ts`, `frontend/public/vite.config.ts`: `/api` proxy `xfwd: true`.
- `backend/.env.example`: documents `TRUST_PROXY`.
