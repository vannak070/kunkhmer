# KUN KHMER Awards System - Quick Reference

## 🎯 One-Line Summary

**Awards = Medals + Belts + Titles + Event Prizes + Recognition**

---

## 📋 5 Award Categories

| Icon | Category | Award Types | Example |
|------|----------|-------------|---------|
| 🌍 | **International** | World medals, World belts | IKKF World Championship Gold |
| 🥇 | **Regional** | SEA Games, Asian Championships | SEA Games 2023 Gold Medal |
| 🇰🇭 | **National (KKF)** | National belt, Special cups | Tea Banh Cup |
| 🥊 | **Professional** | Event belts, Prize money | Main Event $5,000 Prize |
| ⭐ | **Recognition** | Fighter of Year, Rising Star | Fighter of the Year 2025 |

---

## 🏅 15+ Award Types

### International (2 types)
- `world_championship_medal` - 🏅 World Championship Medal (Gold/Silver/Bronze)
- `world_champion_belt` - 🏆 World Champion Belt (IKKF, ISKA, WBC)

### Regional (2 types)
- `sea_games_medal` - 🥇 SEA Games Medal (Gold/Silver/Bronze)
- `asian_championship_medal` - 🥈 Asian Championship Medal

### National (3 types)
- `national_champion_belt` - 👑 National Champion Belt
- `kkf_championship_title` - 🏆 KKF Championship Title
- `special_cup` - 🏆 Special Cup (Tea Banh, Samdech)

### Professional (3 types)
- `event_champion_belt` - 🥊 Event Champion Belt
- `prize_money` - 💰 Prize Money
- `tournament_winner` - 🏅 Tournament Winner

### Recognition (5 types)
- `fighter_of_year` - ⭐ Fighter of the Year
- `knockout_of_year` - 💥 Knockout of the Year
- `rising_star` - 🌟 Rising Star
- `most_popular_fighter` - ❤️ Most Popular Fighter
- `hall_of_fame` - 🎖️ Hall of Fame

---

## 🎖️ 5 Medal Levels

| Level | Icon | Use |
|-------|------|-----|
| `gold` | 🥇 | First place |
| `silver` | 🥈 | Second place |
| `bronze` | 🥉 | Third place |
| `champion` | 👑 | Championship belts |
| `special` | ⭐ | Special recognition |

---

## 🏛️ 6 Organizations

| Code | Name | Awards |
|------|------|--------|
| `IKKF` | International Kun Khmer Federation | World medals/belts |
| `ISKA` | International Sport Karate | World belts |
| `WBC` | World Boxing Council | World belts |
| `SEA_GAMES` | Southeast Asian Games | Regional medals |
| `KKF` | Kun Khmer Federation | National awards |
| `EVENT` | Event-Specific | Professional prizes |

---

## 💻 Quick Code Examples

### 1. Get Fighter Awards
```typescript
import { getFighterAwards } from "../data/awards";

const awards = getFighterAwards("f1");
// Returns all awards for fighter
```

### 2. Get Fighter Summary
```typescript
import { getFighterAwardSummary } from "../data/awards";

const summary = getFighterAwardSummary("f1");
// {
//   totalAwards: 5,
//   goldMedals: 3,
//   totalPrizeMoney: 8000,
//   highestAchievement: {...}
// }
```

### 3. Display Award Card
```tsx
import { AwardCard } from "../components/AwardCard";

<AwardCard award={award} />
```

### 4. Display Fighter Summary
```tsx
import { FighterAwardSummaryWidget } from "../components/AwardCard";

<FighterAwardSummaryWidget 
  fighterId="f1"
  summary={summary}
/>
```

### 5. Create New Award
```typescript
const award = {
  category: 'national',
  type: 'national_champion_belt',
  level: 'champion',
  title: 'KKF National Champion Belt',
  organization: 'KKF',
  winnerId: 'f1',
  winnerName: 'Sorn Seavmey',
  year: 2026,
  status: 'awarded'
};
```

---

## 📊 Fighter Award Summary Structure

```typescript
{
  totalAwards: 5,           // Total count
  international: 2,         // International awards
  regional: 1,              // Regional awards
  national: 1,              // National awards
  professional: 1,          // Professional awards
  recognition: 0,           // Recognition awards
  goldMedals: 3,           // Gold medals
  silverMedals: 0,         // Silver medals
  bronzeMedals: 1,         // Bronze medals
  championBelts: 2,        // Championship belts
  totalPrizeMoney: 8000,   // Total $ earned
  highestAchievement: {...} // Top award
}
```

---

## 🎨 UI Components

### AwardCard
```tsx
<AwardCard 
  award={award}
  compact={false}      // true = inline badge
  showWinner={true}    // false = hide winner
/>
```

### FighterAwardSummaryWidget
```tsx
<FighterAwardSummaryWidget 
  fighterId="f1"
  summary={summary}
/>
```

### AwardsByCategory
```tsx
<AwardsByCategory awards={allAwards} />
```

### AwardBadge
```tsx
<AwardBadge award={award} />
```

---

## 🔧 Helper Functions

| Function | Purpose | Returns |
|----------|---------|---------|
| `getFighterAwards(id)` | Get all fighter awards | Award[] |
| `getFighterAwardSummary(id)` | Get statistics | Summary object |
| `getFighterHighestAchievement(id)` | Get top award | Award \| null |
| `getFighterTotalPrizeMoney(id)` | Get total earnings | number |
| `getAwardsByCategory(cat)` | Filter by category | Award[] |
| `getAwardsByYear(year)` | Filter by year | Award[] |
| `getAwardsByOrganization(org)` | Filter by org | Award[] |
| `getEventAwards(eventId)` | Get event awards | Award[] |

---

## 📍 Integration Points

### Fighter Profile
```tsx
// Show awards on fighter detail page
const summary = getFighterAwardSummary(fighterId);
const awards = getFighterAwards(fighterId);

<FighterAwardSummaryWidget summary={summary} />
<AwardsByCategory awards={awards} />
```

### Event Detail
```tsx
// Show event prizes
const eventAwards = getEventAwards(eventId);

{eventAwards.map(award => (
  <AwardCard award={award} showWinner={false} />
))}
```

### Club Dashboard
```tsx
// Show club awards count
const clubFighters = getClubFighters(clubId);
const clubAwards = clubFighters.flatMap(f => 
  getFighterAwards(f.id)
);

<div>Total Club Awards: {clubAwards.length}</div>
```

---

## 🎯 Award Priority (Highest to Lowest)

1. 🌍 **International** (World Championship)
2. 🥇 **Regional** (SEA Games)
3. 🇰🇭 **National** (KKF Champion)
4. 🥊 **Professional** (Event Champion)
5. ⭐ **Recognition** (Fighter of Year)

Within same category:
- 🥇 Gold > 🥈 Silver > 🥉 Bronze

---

## 📁 File Structure

```
/src/app/
├── data/
│   └── awards.ts              (650+ lines)
├── components/
│   └── AwardCard.tsx          (350+ lines)
└── pages/
    └── AwardsSetup.tsx        (400+ lines)
```

---

## ✅ Quick Setup Checklist

- [x] Import award system
- [x] Use award components
- [x] Display fighter awards
- [ ] Integrate into fighter profile
- [ ] Integrate into event pages
- [ ] Add award images
- [ ] Create award ceremony workflow

---

## 🌟 Example Awards

**Sorn Seavmey's Career**:
1. 2023: 🥇 SEA Games Gold Medal
2. 2024: 🏆 IKKF World Champion Belt
3. 2025: ⭐ Fighter of the Year
4. 2025: 🏆 Tea Banh Cup
5. 2026: 💰 $5,000 Main Event Prize

**Summary**: 5 awards, 1 gold medal, 2 belts, $5,000 earned

---

## 🎨 Color Codes

```typescript
// By Category
international: purple
regional:      orange
national:      blue
professional:  red
recognition:   yellow

// By Level
gold:     yellow
silver:   gray
bronze:   orange
champion: purple
special:  blue
```

---

**Version**: 1.0.0  
**Quick Reference for**: Developers & Organizers  
**Full Guide**: `/AWARDS_SYSTEM_COMPLETE_GUIDE.md`
