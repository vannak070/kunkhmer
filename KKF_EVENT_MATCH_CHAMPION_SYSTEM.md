# KKF Event, Match, and Champion System - Complete Implementation
**Date:** March 24, 2026  
**System Version:** 2.9.0  
**Status:** ✅ Production Ready

---

## 🎯 Overview

Comprehensive implementation of the official KKF Event, Match Request, and Champion concepts with complete workflow integration, official assignments, and defense tracking.

---

## 📋 Table of Contents

1. [KKF Event Concept](#kk-event-concept)
2. [Match Request Concept](#match-request-concept)
3. [Champion Concept](#champion-concept)
4. [Event Organizer Request Flow](#event-organizer-request-flow)
5. [Master Data](#master-data)
6. [Eligibility System](#eligibility-system)
7. [Workflows](#workflows)

---

## 🏆 KKF Event Concept

### **Definition**

A KKF Event is an official Kun Khmer tournament or fight event approved and managed under KKF regulations.

### **Event Types**

```typescript
type EventType = 
  | "Championship"      // 🏆 Official championship with title bouts
  | "Friendly Match"    // 🤝 Non-ranking friendly exhibition
  | "Exhibition"        // 🎭 Demonstration and promotional
  | "Ranking Fight"     // 📊 Affects fighter rankings
  | "International"     // 🌏 International events
  | "Regional"          // 🗺️ Regional championship
  | "Club Tournament";  // 🏟️ Inter-club or intra-club
```

**Event Type Configuration:**

| Type | Icon | Requires Championship | Description |
|------|------|----------------------|-------------|
| **Championship** | 🏆 | Yes | Official KKF Championship with title bouts |
| **Friendly Match** | 🤝 | No | Non-ranking friendly exhibition matches |
| **Exhibition** | 🎭 | No | Demonstration and promotional fights |
| **Ranking Fight** | 📊 | No | Fights that affect fighter rankings |
| **International** | 🌏 | No | International Kun Khmer events |
| **Regional** | 🗺️ | No | Regional championship or tournament |
| **Club Tournament** | 🏟️ | No | Inter-club or intra-club tournament |

---

### **Event Status Flow**

```
Draft → Submitted → Approved → Completed → Cancelled
```

**Status Details:**

| Status | Description | Actions Available |
|--------|-------------|-------------------|
| **Draft** | Organizer creating event | Edit, Submit |
| **Submitted** | Submitted to KKF for review | View only |
| **Approved** | KKF approved | Add matches, Manage |
| **Completed** | Event finished | View results, Update records |
| **Cancelled** | Event cancelled | View only |

---

### **Event Components**

**Basic Information:**
```typescript
{
  name: string;              // Event title
  description: string;       // Event description
  eventType: EventType;      // Championship, Friendly, etc.
  
  // Organizer
  organizerId: string;
  organizerName: string;     // Club or promoter
  organizerType: "Club" | "Promoter" | "KKF";
  
  // Date & Location
  date: string;
  endDate?: string;          // For multi-day events
  venueId: string;
  venueName: string;
  location: string;
  
  // Broadcast & Sponsor (KKF-Approved)
  broadcastStationId?: string;
  broadcastStationName?: string;
  sponsorIds: string[];
  sponsorNames: string[];
  
  // Logistics
  rings: number;             // Number of rings
  capacity: number;          // Venue capacity
  
  // Status
  status: EventStatus;
  kkfApprovalDate?: string;
  kkfReviewedBy?: string;
}
```

---

### **Broadcast Stations (KKF-Approved)**

```typescript
interface BroadcastStation {
  id: string;
  name: string;
  logo: string;
  type: "National TV" | "Cable TV" | "Streaming" | "Radio";
  approved: boolean;
  contact: string;
}
```

**Available Stations:**

| ID | Name | Type | Contact |
|----|------|------|---------|
| `tvk` | TVK (National Television of Kampuchea) | National TV | +855 23 982 375 |
| `ctv` | CTV (Cambodian Television Network) | Cable TV | +855 23 982 111 |
| `bayon` | Bayon TV | National TV | +855 23 982 222 |
| `pnn` | PNN (Phnom Penh News Network) | Cable TV | +855 23 982 333 |
| `kkf-stream` | KKF Official Streaming | Streaming | stream@kkf.org.kh |
| `sport-radio` | Cambodia Sport Radio FM 95.5 | Radio | +855 23 982 444 |

---

### **Sponsors (KKF-Approved)**

```typescript
interface Sponsor {
  id: string;
  name: string;
  logo: string;
  tier: "Platinum" | "Gold" | "Silver" | "Bronze";
  approved: boolean;
  contact: string;
}
```

**Available Sponsors:**

| Sponsor | Tier | Industry |
|---------|------|----------|
| ACLEDA Bank | Platinum | Banking |
| Angkor Beer | Platinum | Beverage |
| NagaWorld | Platinum | Entertainment |
| Smart Axiata | Gold | Telecommunications |
| Metfone | Gold | Telecommunications |
| Toyota Cambodia | Gold | Automotive |
| ABA Bank | Gold | Banking |
| Coca-Cola Cambodia | Silver | Beverage |

---

### **Venues (KKF-Approved)**

```typescript
interface Venue {
  id: string;
  name: string;
  location: string;
  capacity: number;
  rings: number;
  approved: boolean;
  facilities: string[];
}
```

**Available Venues:**

| Venue | Location | Capacity | Rings | Facilities |
|-------|----------|----------|-------|------------|
| National Olympic Stadium | Phnom Penh | 50,000 | 2 | VIP, Media, Medical, Changing |
| Koh Pich Convention Center | Phnom Penh | 10,000 | 2 | VIP, Media, Medical, Parking |
| Calmette Arena | Phnom Penh | 5,000 | 1 | Medical, Changing, Parking |
| Angkor Arena | Siem Reap | 8,000 | 2 | VIP, Media, Medical, Restaurant |
| Battambang Provincial Stadium | Battambang | 3,000 | 1 | Medical, Changing |

---

## 🥊 Match Request Concept

### **Definition**

A match request is the organizer's proposal for individual fights during an event.

### **Match Types**

```typescript
type MatchType =
  | "Championship Bout"      // 👑 Title fight
  | "Title Defense"          // 🛡️ Champion defending
  | "Ranking Fight"          // 📈 Affects rankings
  | "Exhibition"             // 🎪 Non-ranking exhibition
  | "Friendly Match"         // 🤝 Friendly bout
  | "Tournament Final"       // 🥇 Final round
  | "Semi Final"             // 🥈 Semi-final
  | "Quarter Final";         // 🥉 Quarter-final
```

**Match Type Configuration:**

| Type | Icon | Affects Ranking | Requires Referee | Min Rounds | Max Rounds |
|------|------|-----------------|------------------|------------|------------|
| **Championship Bout** | 👑 | Yes | Yes | 5 | 7 |
| **Title Defense** | 🛡️ | Yes | Yes | 5 | 7 |
| **Ranking Fight** | 📈 | Yes | Yes | 3 | 5 |
| **Exhibition** | 🎪 | No | Yes | 3 | 3 |
| **Friendly Match** | 🤝 | No | Yes | 3 | 3 |
| **Tournament Final** | 🥇 | Yes | Yes | 5 | 5 |
| **Semi Final** | 🥈 | Yes | Yes | 3 | 5 |
| **Quarter Final** | 🥉 | Yes | Yes | 3 | 5 |

---

### **Match Status Flow**

```
Proposed → Pending KKF Approval → Approved → Scheduled → 
In Progress → Completed → Result Updated
```

**Status Details:**

| Status | Description | Actions |
|--------|-------------|---------|
| **Proposed** | Organizer proposed | Edit, Delete, Submit |
| **Pending KKF Approval** | Awaiting KKF review | View only |
| **Approved** | KKF approved | Schedule, Assign officials |
| **Scheduled** | Scheduled for event | View, Edit date/time |
| **In Progress** | Currently fighting | Live scoring |
| **Completed** | Fight finished | Enter result |
| **Result Updated** | Result recorded | View only |
| **Cancelled** | Match cancelled | View only |

---

### **Match Structure**

```typescript
interface Match {
  id: string;
  matchNumber: string;        // Unique ID (e.g., "M-001")
  batchId: string;            // Belongs to batch
  
  // Fighters
  fighterA: {
    id: string;
    name: string;
    image: string;
    weight: number;
    record: string;
    grade: string;
    clubId: string;
    clubName: string;
  };
  fighterB: { /* same structure */ };
  
  // Match Details
  matchType: MatchType;
  weightClass: string;
  agreedWeight?: number;      // Catch weight agreement
  rounds: number;
  matchOrder: number;         // Position in batch
  notes?: string;
  
  // Officials Assignment
  refereeId?: string;
  refereeName?: string;
  judgeIds?: string[];        // 3 judges
  judgeNames?: string[];
  
  // Gloves & Gear Agreement
  gloveAgreement?: {
    size: string;
    brand: string;
    fighterAConfirmed: boolean;
    fighterBConfirmed: boolean;
  };
  
  // Eligibility Checks (KKF)
  eligibilityChecks?: {
    fighterAEligible: boolean;
    fighterBEligible: boolean;
    weightCheckPassed: boolean;
    medicalClearance: boolean;
    restingPeriodOk: boolean;
    gradeCompatible: boolean;
  };
  
  // Result
  status: MatchStatus;
  winner?: string;
  winnerMethod?: "KO" | "TKO" | "Decision" | "Submission" | "Disqualification";
  winnerRound?: number;
  
  // Championship Info
  isChampionship?: boolean;
  championshipTitle?: string;
  affectsRanking?: boolean;
}
```

---

### **Officials Assignment**

**Referees (KKF-Certified):**

```typescript
interface Referee {
  id: string;
  name: string;
  photo: string;
  level: "International" | "National" | "Regional";
  certified: boolean;
  experience: number;  // years
  contact: string;
}
```

**Available Referees:**

| Name | Level | Experience | Contact |
|------|-------|------------|---------|
| Sopheak Chan | International | 15 years | +855 12 345 678 |
| Dara Meas | International | 12 years | +855 12 345 679 |
| Virak Seng | National | 8 years | +855 12 345 680 |
| Kimsan Ouk | National | 10 years | +855 12 345 681 |
| Ratanak Kong | Regional | 5 years | +855 12 345 682 |

---

**Judges (KKF-Certified):**

```typescript
interface Judge {
  id: string;
  name: string;
  photo: string;
  level: "International" | "National" | "Regional";
  certified: boolean;
  experience: number;
  contact: string;
}
```

**Available Judges:**

| Name | Level | Experience | Contact |
|------|-------|------------|---------|
| Bopha Lim | International | 18 years | +855 12 345 690 |
| Sreymom Sor | International | 14 years | +855 12 345 691 |
| Vanneth Prak | National | 9 years | +855 12 345 692 |
| Piseth Nhem | National | 11 years | +855 12 345 693 |
| Chanthy Heng | National | 7 years | +855 12 345 694 |

---

## 👑 Champion Concept

### **Definition**

A KKF Champion is a fighter who wins a title in a sanctioned championship match under KKF rules.

### **Champion Types**

```typescript
type ChampionType =
  | "National"          // 🇰🇭 National champion
  | "International"     // 🌏 International champion
  | "Event"             // 🏆 Event-specific champion
  | "Interim"           // ⚡ Interim title holder
  | "Defending";        // 🛡️ Currently defending
```

**Champion Type Configuration:**

| Type | Icon | Min Defenses/Year | Description |
|------|------|-------------------|-------------|
| **National** | 🇰🇭 | 2 | National KKF Champion - Must defend twice per year |
| **International** | 🌏 | 1 | International KKF Champion - Must defend once per year |
| **Event** | 🏆 | 0 | Event-specific champion - No mandatory defenses |
| **Interim** | ⚡ | 1 | Interim champion - Must unify with main champion |
| **Defending** | 🛡️ | 2 | Currently defending champion - Active title defense |

---

### **Champion Status**

```typescript
type ChampionStatus =
  | "Active"         // Currently holds title
  | "Defending"      // Scheduled title defense
  | "Vacated"        // Title vacated
  | "Retired";       // Champion retired
```

---

### **Champion Structure**

```typescript
interface Champion {
  id: string;
  
  // Title Information
  title: string;                    // "National Lightweight Champion"
  weightClass: WeightClass;
  championType: ChampionType;
  
  // Champion Link to Event & Match (REQUIRED)
  wonEventId: string;               // Event where title was won
  wonEventName: string;
  wonMatchId: string;               // Specific championship match
  wonMatchNumber: string;
  wonDate: string;
  
  // Fighter Information
  fighterId: string;
  fighterName: string;
  fighterImage: string;
  fighterGrade: string;
  fighterRecord: string;
  fighterWeight: number;
  
  // Club Affiliation
  clubId: string;
  clubName: string;
  
  // Championship Details
  status: ChampionStatus;
  defensesMandatory: number;        // Required defenses per year
  defensesCompleted: number;        // Successful defenses
  nextDefenseDate?: string;
  nextDefenseEventId?: string;
  
  // Defense History (COMPLETE TRACKING)
  defenseHistory: TitleDefense[];
  
  // Reign Information
  reignStartDate: string;
  reignEndDate?: string;
  reignDays?: number;
  
  // Win Details
  defeatedOpponent: string;
  defeatedOpponentRecord: string;
  winMethod: "KO" | "TKO" | "Decision" | "Submission";
  winRound?: number;
}
```

---

### **Title Defense Tracking**

```typescript
interface TitleDefense {
  defenseNumber: number;           // 1, 2, 3...
  
  // Event & Match Link (REQUIRED)
  eventId: string;
  eventName: string;
  matchId: string;
  matchNumber: string;
  date: string;
  
  // Opponent Details
  opponentId: string;
  opponentName: string;
  opponentRecord: string;
  
  // Result
  result: "Won" | "Lost" | "Draw";
  method: "KO" | "TKO" | "Decision" | "Submission";
  round?: number;
  notes?: string;
}
```

**Example Defense History:**

```
Champion: Sok Thy - National Lightweight Champion

Defense #1:
  Event: Fight Night March 30
  Match: M-DEF-001
  Date: 2026-03-30
  Opponent: Ponleak Sor (5-1-0)
  Result: Won by TKO in Round 4
  Notes: "First successful title defense"

Defense #2:
  Event: (Scheduled) KUN KHMER Championship 2026
  Match: M-DEF-002
  Date: 2026-06-15
  Opponent: Chantha Pov (10-3-1)
  Status: Upcoming
```

---

### **Weight Classes**

```typescript
type WeightClass =
  | "Mini Flyweight (48kg)"
  | "Light Flyweight (51kg)"
  | "Flyweight (54kg)"
  | "Bantamweight (57kg)"
  | "Super Bantamweight (60kg)"
  | "Featherweight (63.5kg)"
  | "Super Featherweight (66kg)"
  | "Lightweight (70kg)"
  | "Super Lightweight (73kg)"
  | "Welterweight (77kg)"
  | "Super Welterweight (81kg)"
  | "Middleweight (85kg)"
  | "Super Middleweight (90kg)";
```

---

## 🔄 Event Organizer Request Flow

### **Complete Workflow**

```
STEP 1: Event Submission
  ├─ Fill in event details
  ├─ Select event type
  ├─ Choose venue
  ├─ Select broadcast station (KKF-approved)
  ├─ Select sponsors (KKF-approved)
  └─ Submit for KKF approval
        ↓
STEP 2: KKF Event Review
  ├─ Verify event details
  ├─ Check venue availability
  ├─ Validate broadcast/sponsor selections
  ├─ Review organizer credentials
  └─ Approve or Reject
        ↓ (If Approved)
STEP 3: Match Batch Creation
  ├─ Create match batch linked to event
  ├─ Select fighters for each match
  ├─ Confirm weight class & catch weight
  ├─ Choose match type
  ├─ Assign gloves & gear
  ├─ Add match notes
  └─ Submit batch for KKF approval
        ↓
STEP 4: KKF Match Review
  ├─ Check fighter eligibility
  │   ├─ Weight compliance
  │   ├─ Medical clearance
  │   ├─ Resting period (min 30 days)
  │   ├─ Grade compatibility
  │   └─ Club verification
  ├─ Assign referee (KKF-certified)
  ├─ Assign 3 judges (KKF-certified)
  ├─ Verify glove agreements
  └─ Approve or Reject batch
        ↓ (If Approved)
STEP 5: Event Execution
  ├─ Conduct weigh-in
  ├─ Final medical check
  ├─ Fighter preparation
  ├─ Execute matches
  └─ Record results
        ↓
STEP 6: Post-Event Updates
  ├─ Update match results
  ├─ Update fighter records
  ├─ Update rankings
  ├─ Update champion status (if title fight)
  ├─ Record defense history (if defense)
  └─ Close event
```

---

### **Detailed Steps**

#### **Step 1: Event Submission**

**Form Fields:**

```
Event Name: ___________________
Event Type: [Championship ▼]
Date: [2026-04-15]
Venue: [National Olympic Stadium ▼]
Broadcast: [TVK ▼]
Sponsors: [☑ ACLEDA Bank] [☑ Angkor Beer]
Description: ___________________
```

**Validation:**
```
✅ Event name required
✅ Event type required
✅ Date in future
✅ Venue from approved list
✅ Broadcast from approved list (optional)
✅ Sponsors from approved list (optional)
```

---

#### **Step 2: KKF Event Review**

**Review Checklist:**

```
□ Event details complete
□ Organizer verified
□ Venue available on selected date
□ Broadcast station confirmed (if selected)
□ Sponsors confirmed (if selected)
□ Event type appropriate
□ No conflicts with other events
□ Logistics feasible (rings, capacity)
```

**Approval Statuses:**
- ✅ Approved → Proceed to match creation
- ❌ Rejected → Return with feedback
- ⏸️ Pending → Additional info required

---

#### **Step 3: Match Batch Creation**

**Batch Form:**

```
Event: KUN KHMER Championship 2026 (auto-linked)

Match 1:
  Match Type: [Championship Bout ▼]
  Red Corner: [Sok Thy (70kg, Grade A) ▼]
  Blue Corner: [Chantha Pov (70kg, Grade A) ▼]
  Agreed Weight: [70kg]
  Rounds: [5 ▼]
  Glove Size: [10oz ▼]
  Glove Brand: [Twins Special ▼]
  Notes: [Main Event - Championship Bout]
  
  [+ Add Another Match]
```

---

#### **Step 4: KKF Match Review**

**Eligibility Checks:**

```
Fighter A: Sok Thy
  ✅ Active fighter status
  ✅ Current weight: 70kg (matches agreed weight)
  ✅ Medical clearance valid (expires 2026-12-31)
  ✅ Last fight: 2026-02-15 (44 days ago - OK)
  ✅ Grade A (compatible with opponent Grade A)
  ✅ Club verified: Olympic Club

Fighter B: Chantha Pov
  ✅ Active fighter status
  ✅ Current weight: 70kg (matches agreed weight)
  ✅ Medical clearance valid (expires 2026-11-30)
  ✅ Last fight: 2026-01-20 (85 days ago - OK)
  ✅ Grade A (compatible with opponent Grade A)
  ✅ Club verified: Olympic Club

Match Compatibility:
  ✅ Weight difference: 0kg (within 2kg limit)
  ✅ Grade compatibility: Both Grade A
  ✅ No recent matchup (never fought before)
  ✅ Both fighters available on event date

Official Assignment:
  Referee: [Sopheak Chan (International) ▼]
  Judge 1: [Bopha Lim (International) ▼]
  Judge 2: [Sreymom Sor (International) ▼]
  Judge 3: [Vanneth Prak (National) ▼]
```

---

#### **Step 5: Event Execution**

**Day of Event:**

```
08:00 - Venue setup
10:00 - Weigh-in opens
12:00 - Final medical checks
14:00 - Fighter briefing
15:00 - Doors open
16:00 - Opening ceremony
16:30 - Match 1 begins
17:00 - Match 2
17:30 - Match 3
...
20:00 - Main Event (Championship)
21:00 - Awards ceremony
22:00 - Event closes
```

---

#### **Step 6: Post-Event Updates**

**Result Entry:**

```
Match: M-001 (Main Event)
Fighter A: Sok Thy
Fighter B: Chantha Pov
Winner: Sok Thy
Method: [TKO ▼]
Round: [4]
Time: [2:15]
Judge Scores:
  Judge 1: 40-36
  Judge 2: 39-37
  Judge 3: 40-36

Championship Update:
  ☑ Title Fight
  New Champion: Sok Thy
  Title: National Lightweight Champion
  Defense Number: 1 (first defense)
```

**Automatic Updates:**
```
✅ Sok Thy record: 12-2-0 → 13-2-0
✅ Chantha Pov record: 10-3-1 → 10-4-1
✅ Sok Thy ranking: #2 → #1
✅ Champion defense history updated
✅ Next mandatory defense calculated: 2026-10-15
```

---

## 🔍 Eligibility System

### **Fighter Eligibility Checks**

**Automated Checks:**

```typescript
interface EligibilityCheck {
  fighterAEligible: boolean;
  fighterBEligible: boolean;
  weightCheckPassed: boolean;
  medicalClearance: boolean;
  restingPeriodOk: boolean;
  gradeCompatible: boolean;
}
```

### **Check Details**

#### **1. Active Status**
```
✅ Fighter status must be "Active"
❌ Cannot be "Suspended", "Retired", "Inactive"
```

#### **2. Weight Compliance**
```
✅ Current weight within 2kg of agreed weight
❌ Weight difference > 2kg requires special approval
```

#### **3. Medical Clearance**
```
✅ Valid medical certificate
✅ Not expired
✅ Cleared for competition
❌ Expired or suspended medical clearance
```

#### **4. Resting Period**
```
✅ Minimum 30 days since last fight
⚠️ 14-29 days requires KKF approval
❌ < 14 days not allowed
```

#### **5. Grade Compatibility**
```
Grade Matching Rules:
├─ A can fight: A, B
├─ B can fight: A, B, C
├─ C can fight: B, C, D
└─ D can fight: C, D

Examples:
✅ Grade A vs Grade A (Perfect match)
✅ Grade A vs Grade B (Allowed)
✅ Grade B vs Grade C (Allowed)
❌ Grade A vs Grade D (Too wide)
❌ Grade B vs Grade D (Not compatible)
```

#### **6. Club Verification**
```
✅ Fighter belongs to registered club
✅ Club in good standing
✅ Club membership active
❌ Club suspended or unregistered
```

---

## 📊 Summary

### **Key Improvements**

**Event System:**
```
✅ 7 event types with specific rules
✅ Event status workflow (Draft → Completed)
✅ KKF-approved broadcast stations (6)
✅ KKF-approved sponsors (8)
✅ KKF-approved venues (5)
✅ Complete event lifecycle management
```

**Match System:**
```
✅ 8 match types with configurations
✅ Match status workflow (8 stages)
✅ Match number assignment (M-001, M-002, etc.)
✅ KKF-certified referees (5)
✅ KKF-certified judges (5)
✅ Glove & gear agreements
✅ Automated eligibility checking
✅ Official assignment system
```

**Champion System:**
```
✅ 5 champion types
✅ Event & match linking (REQUIRED)
✅ Defense history tracking
✅ Defense calendar management
✅ Reign tracking (start, end, days)
✅ 13 weight classes
✅ Mandatory defense requirements
✅ Champion status management
```

---

### **Data Files Created**

```
✅ /src/app/data/event-types.ts
   - Event types & configuration
   - Match types & configuration
   - Broadcast stations (6)
   - Sponsors (8)
   - Referees (5)
   - Judges (5)
   - Venues (5)
   - Helper functions

✅ /src/app/data/batches.ts (Enhanced)
   - Match interface with new fields
   - Match number
   - Match type
   - Officials assignment
   - Glove agreement
   - Eligibility checks
   - Championship info

✅ /src/app/data/champions-enhanced.ts
   - Champion structure
   - Defense history interface
   - 5 champion types
   - 13 weight classes
   - 5 sample champions
   - Helper functions
```

---

### **Features Summary**

**Master Data:**
```
✅ 7 Event Types
✅ 8 Match Types
✅ 6 Broadcast Stations
✅ 8 Sponsors
✅ 5 Venues
✅ 5 Referees
✅ 5 Judges
✅ 13 Weight Classes
✅ 5 Champion Types
```

**Workflows:**
```
✅ Event submission → KKF approval
✅ Match proposal → Eligibility check → Approval
✅ Official assignment
✅ Result recording
✅ Champion updates
✅ Defense tracking
```

**Integrations:**
```
✅ Event ↔ Batch ↔ Matches
✅ Match → Champion (title fights)
✅ Champion → Defense History
✅ Officials → Match Assignment
✅ Broadcast/Sponsor → Event
```

---

**Implementation Completed:** March 24, 2026  
**System Version:** 2.9.0  
**Status:** ✅ **Production Ready**

The KKF Event, Match, and Champion system is now fully integrated with master data, workflows, and complete tracking! 🏆🥊✅

