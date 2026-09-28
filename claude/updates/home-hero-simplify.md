# Update: Simpler home hero

| | |
|---|---|
| **Status** | Done |
| **Jira** | n/a |
| **Feature** | claude/features/public-site.md |
| **Requested by** | vannak070 (2026-09-28) |

## Current behavior
The home hero (`components/home/HomePage.tsx` → `Hero`) has about eight things competing
for attention: federation pill, headline, tagline, KUNKHMER HUB ask box with three example
questions, two buttons ("Fight cards & events", "Meet the fighters"), a "New to Kun Khmer?
Learn the basics" link, the feature card (next fight night / latest story) and the partners strip.
On phones the first screen is only the headline and the ask box.

## Requested change
Make the hero less crowded: one main action (ask KUNKHMER HUB), one featured item, partners.

## Why
Too many highlights, so nothing stands out. The two buttons repeat the menu right above them,
and the home page already has a "What is Kun Khmer" section with a link to About.

## Scope
In scope:
- Remove the two hero buttons and the "New to Kun Khmer?" link (and their unused strings).
- Ask box shows two example questions on phones (three from `sm` up).
- No news in the hero: the "latest story" card is removed; it only shows the next fight night.
  With no upcoming event the hero is one centred column (pill, headline, tagline, ask box).
Out of scope: the fight night card itself, the partners strip, the sections below the hero, the colours.

## Impact
- API response shape changes? No.
- Database migration needed? No.
- Frontend pages affected: public home only.

## Acceptance criteria
- [x] Hero shows pill, headline, tagline, ask box, feature card, partners strip — nothing else.
- [x] No unused i18n keys left behind; English and Khmer both render.
- [x] Checked at 1280×800 and 375×812; `vite build` passes.

## Log
- 2026-09-28: removed the hero buttons and About link (`home.ctaEvents`, `home.ctaFighters`,
  `home.newToKunKhmer` deleted from `messages.ts`); `HubAskBox` hides the third example
  question below `sm`. `Hero` no longer takes `onNavigate`.
- 2026-09-28: removed the news card from the hero (`HeroStoryCard`, `home.latestStory`); the
  latest story now stays first in the news grid. Without an upcoming event the hero is centred
  (`HubAskBox centered`). Checked at 1280×800 and 375×812; `vite build` passes.
- 2026-09-28: the partners strip is centred too when the hero is centred (`PartnerStrip centered`).
- 2026-09-28: partners redesigned: the "Official partners" heading is gone (kept only as the
  list's `aria-label`); each partner is its own white card with a larger logo (`PartnerLogo size="lg"`,
  56–64px), name and broadcaster role, lifting on hover. Phones: two per row, an odd last card centred.
