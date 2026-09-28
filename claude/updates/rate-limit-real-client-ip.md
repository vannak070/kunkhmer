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
- Default: trust exactly one proxy hop, and only from localhost or a private
  network (`lib/clientIp.ts`), so `request.ip` is the address our own proxy
  appended and a client's own `X-Forwarded-For` is ignored. Optional env var
  `TRUST_PROXY` overrides it (addresses/CIDRs or a hop count), e.g. `2` behind
  a CDN + nginx. Never `true`: anyone could then fake their IP.
- Production: keep the API port private (only nginx/the proxy reaches it).

## Acceptance criteria
- [x] Requests through the public site proxy are logged with the browser's IP, not the container's.
- [x] A client can't reset its limit by sending its own `X-Forwarded-For` through the proxy.
- [x] Typecheck and full contract suite pass.

## Log
- First try trusted all private addresses (`loopback,uniquelocal`); testing showed a
  visitor on a private network could still fake `X-Forwarded-For`, so switched to one hop.
- `backend/src/lib/clientIp.ts`: `trustOwnProxy` (one hop, localhost / private network).
- `backend/src/config.ts`: `trustProxy` = `TRUST_PROXY` or `trustOwnProxy`.
- `backend/src/app.ts`: `Fastify({ trustProxy })`.
- `frontend/admin/vite.config.ts`, `frontend/public/vite.config.ts`: `/api` proxy `xfwd: true`.
- `backend/.env.example`: documents `TRUST_PROXY`.
- Verified 2026-09-28: before, backend logged `172.29.0.4` (public frontend container)
  for everyone; after, the browser's address through both :5175 and :5176, a fake
  `X-Forwarded-For: 8.8.8.8` is ignored, the 11th fan sign-up attempt with rotating fake
  headers gets 429. Container typecheck clean; `CI=true npm run test:api`: 207/207 pass.
