# Update: KUNKHMER HUB (Ask Kun Khmer as the site's main function)

| | |
|---|---|
| **Status** | Done (2026-09-28) — waiting for owner review in the browser |
| **Jira** | n/a |
| **Feature** | claude/features/ai-assistant.md, claude/features/public-site.md |
| **Requested by** | vannak070 (2026-09-28) |

## Current behavior
"Ask Kun Khmer" is a floating button in the bottom-right corner of every page
(`components/ai/AskKunKhmer.tsx`, rendered by `SiteFooter`) that opens a small chat panel.

## Requested change
Make it the site's main function, branded **KUNKHMER HUB**, for visitors worldwide.
Decisions (owner, 2026-09-28):
- **Placement**: a full page at `/hub`, first and highlighted in the main menu, plus
  an "Ask KUNKHMER HUB" box in the home hero that opens `/hub?q=<question>`.
  The floating corner button is removed.
- **Languages**: answers in English or Khmer only (other languages get English).
- **Name**: "KUNKHMER HUB" in Latin letters on both language versions, with a
  translated subtitle.

## Scope
In scope: `/hub` page, menu item, home hero ask box, removing the floating chat,
system prompt name + language rule.
Out of scope: knowledge base, new tools, streaming, logging (AI plan phases A–C);
the rest of the home page and the footer layout (the footer's site links list
follows the menu, so it gains a Hub link automatically).

## Impact
- API response shape changes? No. Backend: system prompt text only.
- Database migration needed? No.
- Frontend: `pages/KunKhmerHub.tsx` (new), `components/hub/*` (new, replaces
  `components/ai/AskKunKhmer.tsx`), `SiteHeader.tsx` (menu), `SiteFooter.tsx`
  (floating chat removed), `HomePage.tsx` (hero ask box), `routes.tsx`, `i18n/messages.ts`.
- When the AI is off (no API key) in production, the menu item and hero box are
  hidden and `/hub` says the Hub isn't available; development builds show a setup notice.

## Acceptance criteria
- [x] `/hub` works as a full-page chat at desktop (1280) and phone (375) width, EN + KM.
- [x] Home hero box sends the question to `/hub` and it is answered there.
- [x] Conversation survives following a link in an answer and coming back (per tab).
- [x] No floating chat button on any page.
- [x] `vite build` passes; backend typecheck + contract suite pass.

## Log
- New: `pages/KunKhmerHub.tsx`, `components/hub/useHubChat.ts`, `HubMarkdown.tsx`, `HubAskBox.tsx`.
  Removed: `components/ai/AskKunKhmer.tsx` (and its render in `SiteFooter`), unused `ai.open/title/subtitle/close/welcome` strings.
- `SiteHeader.tsx`: `hub` nav item first with a tinted highlight; `useNavItems()` hides it when the AI is off in
  production (footer site links use the same list, so they gain a Hub link).
- `HomePage.tsx`: `<HubAskBox />` between the hero tagline and its buttons; nothing else on the home page changed.
- Backend `modules/ai/routes.ts`: prompt name KUNKHMER HUB, "fans from around the world", reply only in
  Khmer or English (English for other languages), readable link labels instead of bare paths.
- Verified 2026-09-28 in the browser: 1280×800 EN (hero box → `/hub?q=` → answered, `?q` removed from URL);
  375×812 KM (topic chip → Khmer answer with fighter link; link → `/fighters/pich-sambath` → Back keeps both
  messages); phone menu shows the Hub first; hero badge fixed to one line on phones. `vite build` OK; backend
  typecheck clean; `CI=true npm run test:api` 207/207.
