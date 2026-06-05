# KUN KHMER Awards System - Complete Guide

## 🏆 Overview

**One-Line Structure**:  
`Awards = Medals + Belts + Titles + Event Prizes + Recognition`

The KUN KHMER Awards System tracks all fighter achievements across 5 major categories with 15+ award types.

---

## 📋 Award Categories (5 Total)

### 1. 🌍 International Awards

**Purpose**: Track world-class achievements and global recognition

**Award Types**:
- **World Championship Medals** (Gold/Silver/Bronze)
  - IKKF World Championship
  - ISKA World Championship
  - Other international tournaments
  
- **World Champion Belts**
  - IKKF World Champion Belt
  - ISKA World Champion Belt
  - WBC Muay Thai World Champion Belt

**Example**:
```typescript
{
  category: 'international',
  type: 'world_championship_medal',
  level: 'gold',
  title: 'IKKF World Championship - Gold Medal',
  organization: 'IKKF',
  weightClass: '61-65 kg',
  location: 'Bangkok, Thailand',
  year: 2025
}
```

---

### 2. 🥇 Regional Awards

**Purpose**: Southeast Asian and regional competitions

**Award Types**:
- **SEA Games Medals** (Gold/Silver/Bronze)
  - Biennial Southeast Asian Games
  - Most prestigious regional competition
  
- **Asian Championship Medals** (Gold/Silver/Bronze)
  - Asian Muay Thai Championships
  - Asian Martial Arts Games

**Example**:
```typescript
{
  category: 'regional',
  type: 'sea_games_medal',
  level: 'gold',
  title: 'SEA Games 2023 - Gold Medal',
  organization: 'SEA_GAMES',
  eventName: '32nd SEA Games',
  location: 'Phnom Penh, Cambodia',
  year: 2023
}
```

---

### 3. 🇰🇭 National Awards (KKF)

**Purpose**: Cambodia's highest national honors

**Award Types**:
- **National Champion Belt**
  - KKF National Championship Belt
  - Top honor for Cambodian fighters
  
- **KKF Championship Titles**
  - Division champion titles
  - Defending champion recognition
  
- **Special Cups**
  - Tea Banh Cup (Prime Minister's Cup)
  - Samdech Titles (Royal recognition)
  - KKF Annual Awards

**Example**:
```typescript
{
  category: 'national',
  type: 'special_cup',
  level: 'special',
  title: 'Tea Banh Cup',
  description: 'Special Recognition Cup',
  organization: 'KKF',
  eventName: 'KKF Annual Gala 2025',
  year: 2025
}
```

---

### 4. 🥊 Professional Event Awards

**Purpose**: Event-specific prizes and tournament winners

**Award Types**:
- **Event Champion Belt**
  - Tournament championship belts
  - Event-specific titles
  
- **Prize Money**
  - Cash prizes for winning fights
  - Main event purses
  
- **Tournament Winner Titles**
  - One-night tournament champion
  - Grand Prix winners

**Example**:
```typescript
{
  category: 'professional',
  type: 'prize_money',
  title: 'Main Event Winner Prize',
  cashPrize: 5000,
  eventName: 'KUN KHMER Grand Championship 2026',
  organization: 'EVENT',
  year: 2026
}
```

---

### 5. ⭐ Fighter Recognition

**Purpose**: Special recognition and annual honors

**Award Types**:
- **Fighter of the Year** - Best overall performance
- **Knockout of the Year** - Most spectacular KO
- **Rising Star** - Most promising young fighter
- **Most Popular Fighter** - Fan favorite award
- **Hall of Fame** - Lifetime achievement

**Example**:
```typescript
{
  category: 'recognition',
  type: 'fighter_of_year',
  level: 'special',
  title: 'Fighter of the Year 2025',
  description: 'Best Overall Performance',
  organization: 'KKF',
  year: 2025
}
```

---

## 🏅 Medal/Belt Levels (5 Total)

| Level | Icon | Color | Use Case |
|-------|------|-------|----------|
| 🥇 **Gold** | Gold | Yellow | First place medals |
| 🥈 **Silver** | Silver | Gray | Second place medals |
| 🥉 **Bronze** | Bronze | Orange | Third place medals |
| 👑 **Champion** | Crown | Purple | Championship belts |
| ⭐ **Special** | Star | Blue | Special recognition awards |

---

## 🏛️ Award Organizations (6 Total)

| Organization | Full Name | Award Types |
|--------------|-----------|-------------|
| **IKKF** | International Kun Khmer Federation | World medals, belts |
| **ISKA** | International Sport Karate Association | World belts |
| **WBC** | World Boxing Council (Muay Thai) | World belts |
| **SEA_GAMES** | Southeast Asian Games | Regional medals |
| **KKF** | Kun Khmer Federation | National awards |
| **EVENT** | Event-Specific | Professional prizes |

---

## 💻 Data Structure

### Award Interface

```typescript
interface Award {
  // Core Information
  id: string;
  category: AwardCategory;      // international | regional | national | professional | recognition
  type: AwardType;               // world_championship_medal | national_champion_belt | etc.
  level?: AwardLevel;            // gold | silver | bronze | champion | special
  title: string;
  description: string;
  organization: AwardOrganization;
  
  // Winner Information
  winnerId?: string;
  winnerName?: string;
  winnerClub?: string;
  
  // Event Information
  eventId?: string;
  eventName?: string;
  eventDate?: string;
  location?: string;
  
  // Award Details
  weightClass?: string;
  cashPrize?: number;
  trophyDetails?: string;
  imageUrl?: string;
  
  // Metadata
  awardedDate: string;
  year: number;
  status: 'awarded' | 'pending' | 'nominated';
}
```

---

## 🎨 UI Components

### 1. AwardCard

Display individual award with full details.

```tsx
import { AwardCard } from "../components/AwardCard";

<AwardCard 
  award={award}
  compact={false}
  showWinner={true}
/>
```

**Variants**:
- `compact={false}` - Full card with all details
- `compact={true}` - Inline badge view
- `showWinner={false}` - Hide winner info (for pending awards)

---

### 2. FighterAwardSummaryWidget

Show fighter's complete award statistics.

```tsx
import { FighterAwardSummaryWidget } from "../components/AwardCard";
import { getFighterAwardSummary } from "../data/awards";

const summary = getFighterAwardSummary(fighterId);

<FighterAwardSummaryWidget 
  fighterId={fighterId}
  summary={summary}
/>
```

**Displays**:
- Total awards count
- Gold/Silver/Bronze medals
- International/National awards
- Total prize money earned
- Highest achievement

---

### 3. AwardsByCategory

Group and display awards by category.

```tsx
import { AwardsByCategory } from "../components/AwardCard";

<AwardsByCategory awards={allAwards} />
```

**Features**:
- Automatically groups by 5 categories
- Shows count per category
- Expandable sections
- Category-specific styling

---

### 4. AwardBadge

Small inline award indicator.

```tsx
import { AwardBadge } from "../components/AwardCard";

<AwardBadge award={award} />
// Shows: 🏅 🥇 World Championship Medal
```

---

## 🛠️ Helper Functions

### Get Fighter Awards

```typescript
import { getFighterAwards } from "../data/awards";

const awards = getFighterAwards("f1");
// Returns all awards for fighter ID "f1"
```

---

### Get Awards by Category

```typescript
import { getAwardsByCategory } from "../data/awards";

const internationalAwards = getAwardsByCategory('international');
// Returns all international awards
```

---

### Get Fighter Award Summary

```typescript
import { getFighterAwardSummary } from "../data/awards";

const summary = getFighterAwardSummary("f1");
// Returns:
// {
//   totalAwards: 5,
//   international: 2,
//   goldMedals: 3,
//   totalPrizeMoney: 8000,
//   highestAchievement: { ... }
// }
```

---

### Get Highest Achievement

```typescript
import { getFighterHighestAchievement } from "../data/awards";

const topAward = getFighterHighestAchievement("f1");
// Returns highest prestige award
// Priority: International > Regional > National > Professional > Recognition
```

---

### Get Total Prize Money

```typescript
import { getFighterTotalPrizeMoney } from "../data/awards";

const total = getFighterTotalPrizeMoney("f1");
// Returns: 8000 (sum of all cash prizes)
```

---

## 📄 Awards Setup Page

Complete admin interface for managing awards at `/awards-setup`.

### Features

1. **Award Statistics Dashboard**
   - Total awards count
   - Breakdown by category (7 stats cards)
   - Awarded vs pending status

2. **Setup New Award Form**
   - Select category and type
   - Set medal level (if applicable)
   - Choose organization
   - Enter event details
   - Set winner information
   - Add cash prize amount
   - Upload award image

3. **Filter & Search**
   - Filter by category
   - Filter by year
   - Search by title/winner/description

4. **Awards Display**
   - Grouped by category
   - Color-coded by type
   - Show winner badges
   - Display full details

### Permissions

**Who Can Access**:
- ✅ KKF Super Admin - Full access
- ✅ KKF Auditor - View only
- ✅ Event Organizer - Can create event awards
- ❌ Club - View fighter awards only

---

## 🎯 Integration Points

### 1. Fighter Profile Page

**Display Fighter Awards**:

```tsx
import { getFighterAwardSummary, getFighterAwards } from "../data/awards";
import { FighterAwardSummaryWidget, AwardsByCategory } from "../components/AwardCard";

const summary = getFighterAwardSummary(fighterId);
const awards = getFighterAwards(fighterId);

<div className="space-y-6">
  {/* Summary Widget */}
  <FighterAwardSummaryWidget 
    fighterId={fighterId}
    summary={summary}
  />
  
  {/* All Awards */}
  <AwardsByCategory awards={awards} />
</div>
```

---

### 2. Event Detail Page

**Show Event Awards**:

```tsx
import { getEventAwards } from "../data/awards";
import { AwardCard } from "../components/AwardCard";

const eventAwards = getEventAwards(eventId);

<div className="space-y-4">
  <h3>🏆 Event Awards</h3>
  {eventAwards.map(award => (
    <AwardCard key={award.id} award={award} showWinner={false} />
  ))}
</div>
```

---

### 3. Club Dashboard

**Show Club's Fighter Awards**:

```tsx
import { getFighterAwards } from "../data/awards";

// Get all fighters from club
const clubFighters = getClubFighters(clubId);

// Get all awards for club fighters
const clubAwards = clubFighters.flatMap(f => 
  getFighterAwards(f.id)
);

// Display count
<div className="p-4 bg-purple-50 rounded-xl">
  <div className="text-3xl font-black text-purple-700">
    {clubAwards.length}
  </div>
  <div className="text-sm font-bold text-purple-600">
    🏆 Total Club Awards
  </div>
</div>
```

---

## 📊 Example: Fighter Award Journey

```typescript
// Fighter: Sorn Seavmey (f1)

const awards = [
  // 2023: Regional Success
  {
    year: 2023,
    category: 'regional',
    type: 'sea_games_medal',
    level: 'gold',
    title: 'SEA Games 2023 - Gold Medal'
  },
  
  // 2024: International Breakthrough
  {
    year: 2024,
    category: 'international',
    type: 'world_champion_belt',
    level: 'champion',
    title: 'IKKF World Champion Belt'
  },
  
  // 2025: Recognition
  {
    year: 2025,
    category: 'recognition',
    type: 'fighter_of_year',
    level: 'special',
    title: 'Fighter of the Year 2025'
  },
  
  // 2025: National Honor
  {
    year: 2025,
    category: 'national',
    type: 'special_cup',
    level: 'special',
    title: 'Tea Banh Cup'
  },
  
  // 2026: Professional Success
  {
    year: 2026,
    category: 'professional',
    type: 'prize_money',
    cashPrize: 5000,
    title: 'Main Event Winner Prize'
  }
];

// Summary
const summary = {
  totalAwards: 5,
  international: 1,
  regional: 1,
  national: 1,
  professional: 1,
  recognition: 1,
  goldMedals: 1,
  championBelts: 1,
  totalPrizeMoney: 5000,
  highestAchievement: awards[1] // World Champion Belt
};
```

---

## 🔗 Linking Awards to Championships

**Awards vs Championships**:

| Feature | Championships (Old) | Awards (New) |
|---------|---------------------|--------------|
| Scope | Event-specific prizes | All fighter achievements |
| Types | 5 types | 15+ types |
| Categories | 1 category | 5 categories |
| Time | Single event | Career-long tracking |
| Purpose | Event motivation | Fighter legacy |

**Integration**:
```typescript
// When event championship is awarded
const championship = {
  eventId: 'e1',
  type: 'belt',
  title: 'KUN KHMER Championship Belt'
};

// Also create an award record
const award = {
  category: 'professional',
  type: 'event_champion_belt',
  eventId: championship.eventId,
  title: championship.title,
  winnerId: fighter.id,
  winnerName: fighter.name,
  year: 2026
};
```

---

## 📈 Statistics & Analytics

### Club Performance

```typescript
// Get all awards for club's fighters
const clubFighterIds = getClubFighters(clubId).map(f => f.id);
const clubAwards = clubFighterIds.flatMap(id => getFighterAwards(id));

const clubStats = {
  totalAwards: clubAwards.length,
  goldMedals: clubAwards.filter(a => a.level === 'gold').length,
  internationalAwards: clubAwards.filter(a => a.category === 'international').length,
  totalPrizeMoney: clubAwards.reduce((sum, a) => sum + (a.cashPrize || 0), 0)
};
```

---

### Annual Summary

```typescript
import { getAwardsByYear } from "../data/awards";

const year2025Awards = getAwardsByYear(2025);

const yearStats = {
  total: year2025Awards.length,
  byCategory: {
    international: year2025Awards.filter(a => a.category === 'international').length,
    regional: year2025Awards.filter(a => a.category === 'regional').length,
    national: year2025Awards.filter(a => a.category === 'national').length,
    professional: year2025Awards.filter(a => a.category === 'professional').length,
    recognition: year2025Awards.filter(a => a.category === 'recognition').length,
  }
};
```

---

## ✅ Quick Start Checklist

- [x] Create award data structure (`/src/app/data/awards.ts`)
- [x] Create UI components (`/src/app/components/AwardCard.tsx`)
- [x] Create awards setup page (`/src/app/pages/AwardsSetup.tsx`)
- [x] Define 5 award categories
- [x] Define 15+ award types
- [x] Define 5 medal levels
- [x] Define 6 organizations
- [x] Create helper functions
- [x] Add mock award data (11 awards)
- [ ] Integrate into fighter profile pages
- [ ] Integrate into event detail pages
- [ ] Integrate into club dashboard
- [ ] Add award images/photos
- [ ] Create award ceremony workflow

---

## 🎨 Design System

### Color Scheme by Category

```css
/* International - Purple */
.international {
  bg: purple-100;
  text: purple-700;
  border: purple-300;
}

/* Regional - Orange */
.regional {
  bg: orange-100;
  text: orange-700;
  border: orange-300;
}

/* National - Blue */
.national {
  bg: blue-100;
  text: blue-700;
  border: blue-300;
}

/* Professional - Red */
.professional {
  bg: red-100;
  text: red-700;
  border: red-300;
}

/* Recognition - Yellow */
.recognition {
  bg: yellow-100;
  text: yellow-700;
  border: yellow-300;
}
```

---

## 📚 Complete File Structure

```
/src/app/
├── data/
│   ├── awards.ts                   ✅ Complete (650+ lines)
│   └── championships.ts            ✅ Existing (event-specific)
├── components/
│   ├── AwardCard.tsx               ✅ Complete (350+ lines)
│   └── ChampionshipCard.tsx        ✅ Existing
└── pages/
    └── AwardsSetup.tsx             ✅ Complete (400+ lines)
```

---

**Version**: 1.0.0  
**Created**: March 20, 2026  
**Status**: ✅ Complete System  
**Categories**: 5  
**Award Types**: 15+  
**Mock Data**: 11 awards  
**Components**: 4 UI components  
**Functions**: 10+ helper functions
