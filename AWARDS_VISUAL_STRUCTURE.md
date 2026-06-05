# KUN KHMER Awards System - Visual Structure

## 🎯 System Formula

```
┌─────────────────────────────────────────────────────────────────┐
│                                                                 │
│    Awards = Medals + Belts + Titles + Prizes + Recognition     │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🏆 Award Category Hierarchy

```
KUN KHMER AWARDS
│
├── 🌍 INTERNATIONAL
│   ├── World Championship Medals
│   │   ├── 🥇 Gold Medal
│   │   ├── 🥈 Silver Medal
│   │   └── 🥉 Bronze Medal
│   │
│   └── World Champion Belts
│       ├── IKKF World Champion Belt
│       ├── ISKA World Champion Belt
│       └── WBC Muay Thai World Belt
│
├── 🥇 REGIONAL
│   ├── SEA Games Medals
│   │   ├── 🥇 Gold Medal
│   │   ├── 🥈 Silver Medal
│   │   └── 🥉 Bronze Medal
│   │
│   └── Asian Championship Medals
│       ├── 🥇 Gold Medal
│       ├── 🥈 Silver Medal
│       └── 🥉 Bronze Medal
│
├── 🇰🇭 NATIONAL (KKF)
│   ├── National Champion Belt
│   ├── KKF Championship Titles
│   └── Special Cups
│       ├── Tea Banh Cup
│       ├── Samdech Titles
│       └── KKF Annual Awards
│
├── 🥊 PROFESSIONAL EVENT
│   ├── Event Champion Belt
│   ├── Prize Money
│   └── Tournament Winner Titles
│
└── ⭐ FIGHTER RECOGNITION
    ├── Fighter of the Year
    ├── Knockout of the Year
    ├── Rising Star
    ├── Most Popular Fighter
    └── Hall of Fame
```

---

## 📊 Award Flow Diagram

```
┌─────────────────┐
│ Fighter Competes│
└────────┬────────┘
         │
         ↓
┌─────────────────────────────────┐
│ What type of competition?       │
└────────┬────────────────────────┘
         │
    ┌────┴────┬────────┬─────────┬─────────┐
    │         │        │         │         │
    ↓         ↓        ↓         ↓         ↓
┌────────┐ ┌──────┐ ┌──────┐ ┌───────┐ ┌──────┐
│World   │ │SEA   │ │KKF   │ │Event  │ │Annual│
│Champ   │ │Games │ │National│ │Fight │ │Awards│
└────┬───┘ └───┬──┘ └───┬──┘ └───┬───┘ └───┬──┘
     │         │        │        │         │
     ↓         ↓        ↓        ↓         ↓
┌─────────────────────────────────────────────┐
│ Fighter wins and receives award            │
└─────────────────────────────────────────────┘
     │
     ↓
┌─────────────────────────────────────────────┐
│ Award Added to Fighter Profile             │
│ • Award Record Created                     │
│ • Fighter Statistics Updated               │
│ • Club Statistics Updated                  │
│ • Historical Record Saved                  │
└─────────────────────────────────────────────┘
```

---

## 🎖️ Fighter Award Journey Example

**Sorn Seavmey's Career Timeline**:

```
2023
│
├── 🥇 SEA Games 2023 - Gold Medal
│   └─ Category: Regional
│      Organization: SEA_GAMES
│      Location: Phnom Penh, Cambodia
│
2024
│
├── 🏆 IKKF World Champion Belt
│   └─ Category: International
│      Organization: IKKF
│      Location: Bangkok, Thailand
│
2025
│
├── ⭐ Fighter of the Year 2025
│   └─ Category: Recognition
│      Organization: KKF
│
├── 🏆 Tea Banh Cup
│   └─ Category: National
│      Organization: KKF
│      Special Recognition
│
2026
│
└── 💰 Main Event Winner - $5,000
    └─ Category: Professional
       Organization: EVENT
       Event: KUN KHMER Grand Championship

═══════════════════════════════════════
CAREER SUMMARY
═══════════════════════════════════════
Total Awards:        5
Gold Medals:         1
Championship Belts:  2
Total Prize Money:   $5,000
Highest Achievement: IKKF World Champion Belt
```

---

## 📋 Award Card Visual Structure

```
┌─────────────────────────────────────────────────────────────┐
│ ┌───────────────────────────────────────────────────────┐   │
│ │  [ICON]  🌍 INTERNATIONAL AWARDS           [STATUS]   │   │
│ │          └─ Award Category Badge          └─ Awarded  │   │
│ │                                                        │   │
│ │  🥇 GOLD MEDAL ← Medal Level                          │   │
│ │                                                        │   │
│ │  IKKF World Championship - Gold Medal                 │   │
│ │  └─ Award Title                                       │   │
│ │                                                        │   │
│ │  Lightweight Division World Champion                  │   │
│ │  └─ Description                                       │   │
│ │                                                        │   │
│ │  👑 IKKF   🏆 IKKF World Championship 2025           │   │
│ │  📍 Bangkok, Thailand   📅 November 15, 2025         │   │
│ │  ⚖️  61-65 kg                                        │   │
│ └───────────────────────────────────────────────────────┘   │
│                                                             │
│ ┌─────────────────────────────────────────────────────┐     │
│ │ 🏆 WINNER                                           │     │
│ │ Sorn Seavmey                                        │     │
│ │ Pradal Khmer Gym                                    │     │
│ └─────────────────────────────────────────────────────┘     │
└─────────────────────────────────────────────────────────────┘
```

---

## 📊 Fighter Award Summary Widget

```
┌───────────────────────────────────────────────────────────┐
│  🏆 FIGHTER AWARDS                                       │
│  ╔═══════════════════════════════════════════════════╗   │
│  ║                                                   ║   │
│  ║  🏆  5                                            ║   │
│  ║      TOTAL AWARDS                                ║   │
│  ║                                                   ║   │
│  ╚═══════════════════════════════════════════════════╝   │
│                                                          │
│  ┌──────────┬──────────┬──────────┐                     │
│  │ 🥇       │ 🥈       │ 🥉       │                     │
│  │ 3        │ 0        │ 1        │                     │
│  │ Gold     │ Silver   │ Bronze   │                     │
│  └──────────┴──────────┴──────────┘                     │
│                                                          │
│  ┌──────────┬──────────┬──────────┐                     │
│  │ 🌍       │ 🇰🇭       │ 💰       │                     │
│  │ 2        │ 1        │ $5,000   │                     │
│  │ Intl     │ National │ Prize $  │                     │
│  └──────────┴──────────┴──────────┘                     │
│                                                          │
│  ┌─────────────────────────────────────────────────┐    │
│  │ 👑 HIGHEST ACHIEVEMENT                          │    │
│  │ IKKF World Champion Belt                        │    │
│  │ 2024                                            │    │
│  └─────────────────────────────────────────────────┘    │
└───────────────────────────────────────────────────────────┘
```

---

## 🎨 Color Coding System

```
┌──────────────┬───────────┬──────────┬──────────────┐
│ Category     │ Color     │ Icon     │ Border       │
├──────────────┼───────────┼──────────┼──────────────┤
│ International│ Purple    │ 🌍       │ purple-300   │
│ Regional     │ Orange    │ 🥇       │ orange-300   │
│ National     │ Blue      │ 🇰🇭       │ blue-300     │
│ Professional │ Red       │ 🥊       │ red-300      │
│ Recognition  │ Yellow    │ ⭐       │ yellow-300   │
└──────────────┴───────────┴──────────┴──────────────┘

┌──────────────┬───────────┬──────────┬──────────────┐
│ Level        │ Color     │ Icon     │ Border       │
├──────────────┼───────────┼──────────┼──────────────┤
│ Gold         │ Yellow    │ 🥇       │ yellow-400   │
│ Silver       │ Gray      │ 🥈       │ gray-400     │
│ Bronze       │ Orange    │ 🥉       │ orange-400   │
│ Champion     │ Purple    │ 👑       │ purple-400   │
│ Special      │ Blue      │ ⭐       │ blue-400     │
└──────────────┴───────────┴──────────┴──────────────┘
```

---

## 📱 Awards Setup Page Layout

```
┌─────────────────────────────────────────────────────────────┐
│ 🏆 KUN KHMER AWARDS                    [+ Setup New Award]  │
│ Medals + Belts + Titles + Prizes + Recognition              │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│ STATISTICS                                                   │
│ ┌────────┬────────┬────────┬────────┬────────┬────────┐    │
│ │ 🏆     │ 🌍     │ 🥇     │ 🇰🇭     │ 🥊     │ ⭐     │    │
│ │ Total  │ Intl   │ Region │ Nation │ Event  │ Recog  │    │
│ │ 11     │ 2      │ 2      │ 2      │ 2      │ 3      │    │
│ └────────┴────────┴────────┴────────┴────────┴────────┘    │
│                                                              │
│ ┌──────────────────────────────────────────────────────┐    │
│ │ 🔍 SEARCH & FILTERS                                  │    │
│ │                                                      │    │
│ │ [Search awards...]                                   │    │
│ │                                                      │    │
│ │ [Category ▼]  [Year ▼]                              │    │
│ └──────────────────────────────────────────────────────┘    │
│                                                              │
│ AWARDS LIST                                                  │
│                                                              │
│ 🌍 INTERNATIONAL AWARDS (2)                                 │
│ ┌─────────────────────┐ ┌─────────────────────┐            │
│ │ IKKF World Champ    │ │ WBC Muay Thai Belt  │            │
│ │ Gold Medal          │ │ World Champion      │            │
│ │ Sorn Seavmey        │ │ Prak Sophea         │            │
│ └─────────────────────┘ └─────────────────────┘            │
│                                                              │
│ 🥇 REGIONAL AWARDS (2)                                      │
│ ┌─────────────────────┐ ┌─────────────────────┐            │
│ │ SEA Games 2023      │ │ SEA Games 2023      │            │
│ │ Gold Medal          │ │ Bronze Medal        │            │
│ └─────────────────────┘ └─────────────────────┘            │
│                                                              │
│ ... more categories ...                                     │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

---

## 🔄 Award Creation Workflow

```
┌─────────────────────────────────────────────────────────────┐
│ STEP 1: Select Award Category                               │
└─────────────────────────────────────────────────────────────┘
         │
         ↓
    [  International  ]  [ Regional ]  [ National ]
    [ Professional ]  [ Recognition ]
         │
         ↓
┌─────────────────────────────────────────────────────────────┐
│ STEP 2: Select Award Type                                   │
└─────────────────────────────────────────────────────────────┘
         │
         ↓
    (Based on selected category)
    [ World Championship Medal ]
    [ World Champion Belt ]
         │
         ↓
┌─────────────────────────────────────────────────────────────┐
│ STEP 3: Set Medal Level (if applicable)                     │
└─────────────────────────────────────────────────────────────┘
         │
         ↓
    [ 🥇 Gold ]  [ 🥈 Silver ]  [ 🥉 Bronze ]
         │
         ↓
┌─────────────────────────────────────────────────────────────┐
│ STEP 4: Enter Award Details                                 │
│ • Title: "IKKF World Championship - Gold Medal"            │
│ • Description: "Lightweight Division World Champion"        │
│ • Organization: IKKF                                        │
│ • Event Name: "IKKF World Championship 2025"               │
│ • Location: "Bangkok, Thailand"                             │
│ • Weight Class: "61-65 kg"                                  │
│ • Year: 2025                                                │
└─────────────────────────────────────────────────────────────┘
         │
         ↓
┌─────────────────────────────────────────────────────────────┐
│ STEP 5: Set Winner (Optional)                               │
│ • Fighter: Sorn Seavmey                                     │
│ • Club: Pradal Khmer Gym                                    │
│ • Awarded Date: November 15, 2025                           │
│ • Status: Awarded                                           │
└─────────────────────────────────────────────────────────────┘
         │
         ↓
┌─────────────────────────────────────────────────────────────┐
│ ✅ Award Created Successfully!                              │
│ • Added to fighter profile                                  │
│ • Added to club statistics                                  │
│ • Added to historical records                               │
└─────────────────────────────────────────────────────────────┘
```

---

## 📊 Data Relationships

```
┌─────────────┐         ┌─────────────┐         ┌─────────────┐
│   FIGHTER   │◄───────►│    AWARD    │◄───────►│    EVENT    │
└─────────────┘         └─────────────┘         └─────────────┘
      │                        │                        │
      │                        │                        │
      ↓                        ↓                        ↓
┌─────────────┐         ┌─────────────┐         ┌─────────────┐
│    CLUB     │         │ORGANIZATION │         │   PRIZES    │
└─────────────┘         └─────────────┘         └─────────────┘

Relationships:
• Fighter ─ has many ─► Awards
• Award ─ belongs to ─► Fighter
• Award ─ belongs to ─► Event (optional)
• Award ─ belongs to ─► Organization
• Club ─ has many ─► Fighters ─ has many ─► Awards
```

---

## 🎯 Award Priority Matrix

```
┌────────────────────────────────────────────────────────┐
│ ACHIEVEMENT PRIORITY (Highest to Lowest)              │
├────────────────────────────────────────────────────────┤
│                                                        │
│ RANK 1: 🌍 International Gold Medal                   │
│         └─ World Championship Winner                 │
│                                                        │
│ RANK 2: 🌍 International Champion Belt                │
│         └─ World Champion Title                       │
│                                                        │
│ RANK 3: 🥇 Regional Gold Medal                        │
│         └─ SEA Games / Asian Championship Gold        │
│                                                        │
│ RANK 4: 🇰🇭 National Champion Belt                    │
│         └─ KKF National Champion                      │
│                                                        │
│ RANK 5: 🇰🇭 Special Cups                              │
│         └─ Tea Banh Cup, Samdech Titles              │
│                                                        │
│ RANK 6: 🥊 Professional Event Champion                │
│         └─ Event Champion Belts                       │
│                                                        │
│ RANK 7: ⭐ Fighter Recognition                        │
│         └─ Fighter of Year, Rising Star              │
│                                                        │
└────────────────────────────────────────────────────────┘

Within same rank:
🥇 Gold > 🥈 Silver > 🥉 Bronze
```

---

## 💻 Code Structure Diagram

```
/src/app/
│
├── data/
│   └── awards.ts (650 lines)
│       ├── Type Definitions
│       │   ├── AwardCategory (5 types)
│       │   ├── AwardType (15+ types)
│       │   ├── AwardLevel (5 levels)
│       │   ├── AwardOrganization (6 orgs)
│       │   └── Award Interface
│       │
│       ├── Configuration Objects
│       │   ├── AWARD_CATEGORY_CONFIG
│       │   ├── AWARD_TYPE_CONFIG
│       │   └── AWARD_LEVEL_CONFIG
│       │
│       ├── Mock Data
│       │   └── MOCK_AWARDS (11 awards)
│       │
│       └── Helper Functions (10+)
│           ├── getFighterAwards()
│           ├── getFighterAwardSummary()
│           ├── getFighterHighestAchievement()
│           ├── getFighterTotalPrizeMoney()
│           ├── getAwardsByCategory()
│           ├── getAwardsByYear()
│           └── ... more
│
├── components/
│   └── AwardCard.tsx (350 lines)
│       ├── AwardCard (Full display)
│       ├── AwardBadge (Inline indicator)
│       ├── FighterAwardSummaryWidget (Stats)
│       └── AwardsByCategory (Grouped display)
│
└── pages/
    └── AwardsSetup.tsx (400 lines)
        ├── Statistics Dashboard
        ├── Award Creation Form
        ├── Filter & Search
        └── Awards Display
```

---

**Version**: 1.0.0  
**Created**: March 20, 2026  
**Type**: Visual Structure Documentation  
**Purpose**: Easy-to-understand diagrams and layouts
