# Update: Partner detail pages — banner and more information

| | |
|---|---|
| **Status** | Done — committed b1ebc132 (2026-09-28) |
| **Jira** | n/a |
| **Feature** | claude/features/public-site.md |
| **Requested by** | vannak070 (2026-09-28: "I need banner and more information. Like Club based on champion, next match, etc.") |

## Current behavior
Club / sponsor / broadcaster pages (step 1, `pages/PartnerPages.tsx`) had a small logo tile header,
a fighter list with small avatars, and a plain list of fight nights.

## Change (same real-data rules: only entered or counted facts, numbers only when above zero)
- **Banner header** on all three: the partner's banner picture full width (club photo, sponsor /
  broadcaster banner), or a soft brand gradient with initials; a white card overlaps it with the logo,
  name, key facts and actions (Call / Email, Website, Watch live, Share).
- **Club**: key numbers (registered fighters, titles held, fight nights on record, wins recorded on this
  site); **Next fight** spotlight (date + countdown, fight night, venue, broadcaster, which club fighter,
  red-vs-blue face-off, View fight card); **Champions from this club** (title, holder, weight, defenses);
  fighters with the `/fighters` card (photo, weight class, age, record, form, titles) — first 9, then
  "Show all"; other upcoming bouts; latest results; sidebar with About, Club details (head coach, founded,
  weight classes, location + Open map, phone, email) and Hub questions.
- **Sponsor**: key numbers (fight nights presented, as main sponsor, bouts on those nights); "Presenting
  since" = earliest past fight night (derived, never entered); **Next fight night presented** spotlight with
  the main event; more fight nights; sidebar About the sponsor (level, industry, first fight night, website).
- **Broadcaster**: key numbers (fight nights broadcast, coming up, bouts on air); **Next on air** spotlight;
  more fight nights; sidebar How to watch (channel, coverage, online stream, first fight night, website,
  "times can change" note).
- 43 new EN + KM strings (`club.*`, `partnerPage.*`).

## Acceptance criteria
- [x] Banner + logo card on club, sponsor and broadcaster pages; brand fallback without a banner.
- [x] Club: champions, next fight, key numbers, fighter cards, details; hidden when there's nothing to show.
- [x] Sponsor / broadcaster: next fight night, key numbers, details.
- [x] Desktop + 375 px, EN + KM; public build.
- [ ] Owner review.

## Log
### 2026-09-28
- Rewrote `pages/PartnerPages.tsx` (BannerHeader, Stats, Spotlight + FaceOff, SideCard / DetailRow,
  EventRows, NightSpotlight); roster reuses `FighterCard` / `currentTitles` from `FightersDirectory`.
- Checked on dev data (Pich Sophann club: banner photo, 2 fighters, 1 fight night, details sidebar;
  no champions / upcoming fights, so those sections stay hidden) and on the disposable test API through
  a temporary site copy (club with 40 fighters, 3 titles, next fight in 10 days, "Show all 40 fighters";
  a preview sponsor + broadcaster with an upcoming fight night → spotlights, stats, sidebars). Fixed while
  checking: empty "fight nights" heading when the only night is the spotlight; "since" now uses past
  nights only. Phone width in Khmer: no sideways scroll. Temporary copy stopped.
- Note: a bout only appears in the next-fight face-off once it is public (accepted proposal or result),
  as everywhere on the fan site.
