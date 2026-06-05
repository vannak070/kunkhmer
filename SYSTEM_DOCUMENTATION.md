# KUN KHMER Digital Platform - Complete System Documentation

**Version:** 2.4.0  
**Last Updated:** March 24, 2026

---

## Table of Contents

1. [System Overview](#system-overview)
2. [Architecture](#architecture)
3. [User Roles & Permissions](#user-roles--permissions)
4. [Event Workflow](#event-workflow)
5. [Match Creation & Approval](#match-creation--approval)
6. [Fighter Management](#fighter-management)
7. [Club/Gym Role](#clubgym-role)
8. [Awards System](#awards-system)
9. [Navigation & Routes](#navigation--routes)
10. [Data Structure](#data-structure)

---

## System Overview

### Purpose
KUN KHMER Digital Platform is a comprehensive event management system for Kun Khmer (Cambodian boxing) that handles:
- Fighter registration and tracking
- Event planning and KKF approval
- Match creation and club approval
- Live scoring and results
- Championship awards and rankings
- Broadcast and sponsorship management

### Key Features
- ✅ Role-based access control (5 roles)
- ✅ 11-status event workflow with KKF approval
- ✅ 7-status fighter lifecycle tracking
- ✅ Glove agreement system (safety compliance)
- ✅ Multi-step match proposal workflow
- ✅ Shareable fight cards (bilingual Khmer/English)
- ✅ Championship awards and belt tracking
- ✅ No weight classes (actual weight + agreements)

---

## Architecture

### Technology Stack
- **Frontend:** React 18 + TypeScript
- **Routing:** React Router v7 (Data Mode)
- **Styling:** Tailwind CSS v4
- **State:** React hooks + Context
- **UI Components:** Custom + shadcn/ui
- **Icons:** Lucide React

### Project Structure
```
/src
  /app
    /components     # Reusable UI components
    /pages         # Route pages
    /data          # Mock data & master data
    /hooks         # Custom hooks (permissions, etc.)
    /utils         # Validation & helper functions
  /styles          # Global CSS & theme
```

---

## User Roles & Permissions

### 1. **Super Admin**
**Full System Control**

Permissions: ALL (120+ permissions)
- Complete system administration
- User and role management
- Override any workflow action
- System configuration

### 2. **KKF Officer** (Federation)
**Regulatory & Approval Authority**

Key Permissions:
- `events.approve` - Approve/reject events
- `fighters.verify` - Verify fighter registration
- `matches.finalize` - Final match approval
- `awards.manage` - Manage championships
- `rules.manage` - Update federation rules

### 3. **Organizer**
**Event Management**

Key Permissions:
- `events.create`, `events.edit`
- `matches.create`, `matches.propose`
- `broadcast.manage`
- `sponsors.manage`
- Cannot approve own events (requires KKF)

### 4. **Club/Gym**
**Fighter & Match Management**

40+ Permissions Including:
- `fighters.create`, `fighters.edit` (own fighters only)
- `matches.approve_club` (for own fighters)
- `matches.view_proposals`
- `events.view`
- Cannot create events or approve matches

### 5. **Viewer/Fan**
**Read-Only Access**

Permissions:
- `events.view`
- `matches.view`
- `fighters.view`
- `broadcast.view`
- No create, edit, or approval permissions

---

## Event Workflow

### 11-Status Event Lifecycle

```
1. Draft
   ↓ [Organizer completes event details]
   
2. Pending KKF Approval
   ↓ [KKF Officer reviews]
   
3. KKF Approved ✓
   ↓ [Can now create matches]
   
4. Building Fight Card
   ↓ [Matches added to sub-events]
   
5. Pending Publication
   ↓ [Organizer reviews final card]
   
6. Published
   ↓ [Public announcement]
   
7. Pre-Event Checks
   ↓ [Weigh-ins, medical clearance]
   
8. In Progress
   ↓ [Live event execution]
   
9. Scoring Complete
   ↓ [All matches scored]
   
10. Under Review
   ↓ [KKF final verification]
   
11. Closed ✓
   ↓ [Event complete]
```

### Event Status Colors

| Status | Color | Hex |
|--------|-------|-----|
| Draft | Gray | `#9CA3AF` |
| Pending KKF Approval | Amber | `#F59E0B` |
| KKF Approved | Green | `#10B981` |
| Building Fight Card | Blue | `#3B82F6` |
| Pending Publication | Indigo | `#6366F1` |
| Published | Emerald | `#10B981` |
| Pre-Event Checks | Orange | `#F97316` |
| In Progress | Purple | `#8B5CF6` |
| Scoring Complete | Teal | `#14B8A6` |
| Under Review | Yellow | `#EAB308` |
| Closed | Gray-Dark | `#4B5563` |

### Validation Rules

**Before KKF Approval:**
- ✅ Event name, date, location specified
- ✅ Broadcast station selected
- ✅ At least 1 sponsor

**Before Publication:**
- ✅ Event approved by KKF
- ✅ At least 1 match confirmed
- ✅ All match glove agreements complete

**Before Closing:**
- ✅ All matches have results
- ✅ No pending appeals
- ✅ KKF officer approval

---

## Match Creation & Approval

### Match Status Workflow

```
1. Draft
   ↓ [Organizer saves match]
   
2. Proposed
   ↓ [Sent to both clubs]
   
3. Pending Club Confirmation
   ↓ [One club accepted]
   
4. Club Confirmed
   ↓ [Both clubs accepted]
   
5. Ready to Fight
   ↓ [Pre-fight checks complete]
   
6. In Progress
   ↓ [Live match]
   
7. Completed
```

### Glove Agreement System

**Purpose:** Prevent disputes by documenting equipment agreement before match

**Required Fields:**
- Glove Size: 6oz / 8oz / 10oz
- Glove Brand: KKF-approved brands only
- Fighter A Confirmation: ☑️
- Fighter B Confirmation: ☑️

**Approved Glove Brands:**
1. Twins Special BGVL-3
2. Fairtex BGV1
3. Top King Super Air
4. Boon Retro
5. Yokkao Matrix
6. Raja Boxing RBG-1
7. Windy BGVH
8. Venum Elite

**Workflow:**
1. Organizer selects glove size and brand
2. Fighter A must confirm (checkbox)
3. Fighter B must confirm (checkbox)
4. Only after both confirm can match be proposed to clubs
5. Referee verifies gloves pre-fight
6. Photo documentation required

### Match Creation Flow

```
Dashboard → CREATE MATCH
   ↓
Events & Matches
   ↓
Select Event
   ↓
Select Sub-Event
   ↓
Create Match Form
   ↓
   ├─ Fighter Selection
   ├─ Match Rules (rounds, time, knockdown limit)
   ├─ Agreed Weight (kg)
   └─ Glove Agreement ⭐
   ↓
Save Draft OR Propose to Clubs
```

### Club Approval Process

**When match is proposed:**

1. Club A receives notification
2. Club B receives notification
3. Each club can:
   - ✅ Accept
   - ❌ Reject (with reason)

**Status Transitions:**

| Club A | Club B | Result |
|--------|--------|--------|
| Pending | Pending | Proposed |
| Accepted | Pending | Pending Club Confirmation |
| Pending | Accepted | Pending Club Confirmation |
| Accepted | Accepted | **Club Confirmed** ✓ |
| Rejected | Any | **Rejected** → Draft |
| Any | Rejected | **Rejected** → Draft |

---

## Fighter Management

### 7-Status Fighter Lifecycle

```
1. Draft
   ↓ [Club creates fighter profile]
   
2. Pending KKF Verification
   ↓ [Submitted to federation]
   
3. Active ✓
   ↓ [Verified, can compete]
   
4. Suspended
   ↓ [Medical or disciplinary hold]
   
5. Inactive
   ↓ [Not competing currently]
   
6. Retired
   ↓ [Career ended]
   
7. Banned
   ↓ [Disqualified from competition]
```

### Fighter Data Structure

**Required Fields:**
- Full Name (English)
- Full Name (Khmer)
- Date of Birth
- Nationality
- Gender
- Current Weight (kg)
- Height (cm)
- Gym/Club Affiliation

**Optional Fields:**
- Alias/Ring Name
- Fighting Style
- Record (Wins-Losses-Draws)
- Grade (A, B, C, D)
- Amateur/Professional Status
- Province of Origin

**Grade System (Color-Coded):**
- **Grade A:** Royal Blue (`#0A3D91`) - Elite fighters
- **Grade B:** Gold (`#F2C94C`) - Experienced fighters
- **Grade C:** Crimson Red (`#C8102E`) - Developing fighters
- **Grade D:** Gray (`#B0B0B0`) - Novice fighters

### Fighting Styles
1. Kun Khmer Traditional
2. Elbow Specialist
3. Clinch Specialist
4. Kicking Specialist
5. Technical Fighter
6. Aggressive Fighter
7. Counter Fighter

---

## Club/Gym Role

### 40+ Expanded Permissions

**Fighter Management:**
- Create and edit own fighters
- Submit fighters for KKF verification
- Update fighter records
- Manage fighter availability

**Match Management:**
- Accept/reject match proposals (own fighters)
- View all match proposals
- Communicate with organizers
- Track fighter match history

**Event Management:**
- View all events
- View fight cards
- Track fighter assignments
- Access event schedules

**Reporting:**
- View fighter statistics
- Generate performance reports
- Track gym rankings

### Club Workflow Example

```
1. Club receives match proposal notification
   ↓
2. Reviews match details:
   - Opponent information
   - Date and location
   - Weight agreement
   - Glove specifications
   - Rounds and rules
   ↓
3. Consults with fighter
   ↓
4. Makes decision:
   - Accept → Match proceeds
   - Reject → Match returns to draft
   ↓
5. If accepted, prepares fighter for event
```

---

## Awards System

### Championship Types

1. **Individual Championships**
   - Kun Khmer National Champion
   - Provincial Champions
   - Regional Champions

2. **Team Championships**
   - Top Gym/Club
   - Most Wins
   - Best Record

3. **Special Awards**
   - Fighter of the Year
   - Knockout of the Year
   - Fight of the Year

### Award Tracking

**Award Object:**
```typescript
{
  id: string
  title: string
  description: string
  category: "Individual" | "Team" | "Special"
  status: "Active" | "Retired" | "Upcoming"
  currentHolder: Fighter | Club | null
  dateAwarded: string
  event: Event
  eligibilityCriteria: string
  
  // History
  previousHolders: Array<{
    holder: Fighter | Club
    startDate: string
    endDate: string
    defendedTimes: number
  }>
}
```

### Belt Management

- Belts are tracked separately from matches
- Awards can be won/defended at specific events
- Automatic tracking of title defense history
- Integration with fighter profiles

---

## Navigation & Routes

### Route Structure

```
/ (Home)
│
├─ /fighters
│  ├─ /fighters/kunkhmer
│  ├─ /fighters/foreigner
│  ├─ /fighters/kunkhmer/new
│  ├─ /fighters/foreigner/new
│  ├─ /fighters/:id
│  └─ /fighters/:id/edit
│
├─ /events-and-matches
│  ├─ /events/new
│  ├─ /events/:id
│  ├─ /events/:eventId/sub-events/:subEventId
│  └─ /events/:eventId/sub-events/:subEventId/add-match
│
├─ /matches
│  └─ /matches/:id
│
├─ /clubs
│  └─ /clubs/:id
│
├─ /awards-setup
│  └─ /awards/new
│
├─ /users
│  ├─ /users/new
│  ├─ /users/:id
│  └─ /users/:id/edit
│
├─ /federation
├─ /kkf-workflow
├─ /match-proposals
├─ /broadcast
├─ /sponsors
├─ /roles
├─ /rules
├─ /profile
└─ /workflow-demo (dev only)
```

### Navigation Hierarchy

**Event Navigation:**
```
Home
  → Events & Matches (listing)
    → Event Detail
      → Sub-Event Detail (Weekly Fight Card)
        → Match Detail
```

**Fighter Navigation:**
```
Home
  → Fighters (listing)
    → Fighter Detail
      → Edit Fighter
```

**User Navigation:**
```
Home
  → Users (listing)
    → User Detail
      → Edit User
```

---

## Data Structure

### Core Entities

#### Event
```typescript
{
  id: string
  name: string
  date: string
  location: string
  status: EventStatus (11 statuses)
  
  // Organizer
  organizerId: string
  organizerName: string
  
  // Broadcasting
  broadcastStationId: string
  
  // Sponsorship
  sponsorIds: string[]
  
  // Sub-events (Weekly Fight Cards)
  subEvents: SubEvent[]
  
  // Workflow
  workflowHistory: WorkflowEntry[]
  kkfApprovalDate: string | null
  kkfApprovedBy: string | null
  
  // Awards
  championshipIds: string[]
}
```

#### Sub-Event
```typescript
{
  id: string
  eventId: string
  name: string
  weekNumber: number
  date: string
  location: string
  phase: "Qualifier" | "Semi-Final" | "Final"
  status: "Scheduled" | "In Progress" | "Completed"
  matches: Match[]
}
```

#### Match
```typescript
{
  id: string
  eventId: string
  subEventId: string
  
  // Fighters
  fighterA: Fighter
  fighterB: Fighter
  
  // Configuration
  rounds: 3 | 5
  roundTime: 2 | 3 | 5
  knockdownLimit: 2 | 3 | 4 | 999
  agreedWeight: number
  
  // Glove Agreement
  gloveAgreement: {
    gloveSize: "6oz" | "8oz" | "10oz"
    gloveType: string
    fighterAConfirmed: boolean
    fighterBConfirmed: boolean
    refereeConfirmed: boolean
    confirmedDate: string | null
  }
  
  // Status
  status: MatchStatus
  proposalStatus: "draft" | "pending" | "accepted" | "rejected"
  clubAResponse: "pending" | "accepted" | "rejected"
  clubBResponse: "pending" | "accepted" | "rejected"
  
  // Results
  result: {
    winner: string
    method: "KO" | "TKO" | "Decision" | "Submission"
    round: number
    time: string
  } | null
}
```

#### Fighter
```typescript
{
  id: string
  name: string
  nameKhmer: string
  alias: string
  
  // Demographics
  dateOfBirth: string
  nationality: string
  province: string
  gender: "Male" | "Female"
  
  // Physical
  currentWeight: number
  height: number
  
  // Career
  gym: string
  style: FightingStyle
  record: string (e.g., "12-3-1")
  grade: "A" | "B" | "C" | "D"
  status: FighterStatus
  professionalStatus: "Amateur" | "Professional"
  
  // Verification
  verificationStatus: "Draft" | "Pending" | "Active" | etc.
  verifiedBy: string | null
  verifiedDate: string | null
}
```

#### User
```typescript
{
  id: string
  username: string
  fullName: string
  email: string
  role: "Super Admin" | "KKF Officer" | "Organizer" | "Club/Gym" | "Viewer/Fan"
  
  // Organization
  organization: string | null
  clubId: string | null
  
  // Status
  status: "Active" | "Inactive"
  lastLogin: string | null
}
```

---

## Quick Reference

### Important Workflows

**Create Event:**
```
Login → Dashboard → CREATE MATCH → Events & Matches → + Create Event → Fill Form → Save Draft → Submit to KKF → KKF Approves → Event Active
```

**Create Match:**
```
Events & Matches → Event → Sub-Event → Create Match → Select Fighters → Configure Rules → Glove Agreement → Propose to Clubs → Both Accept → Match Confirmed
```

**Register Fighter:**
```
Fighters → Add New Fighter → Fill Profile → Save → Submit to KKF → KKF Verifies → Fighter Active
```

### Status Quick Reference

**Event:** Draft → Pending KKF Approval → KKF Approved → Published → In Progress → Closed

**Match:** Draft → Proposed → Pending Club Confirmation → Club Confirmed → Ready to Fight → In Progress → Completed

**Fighter:** Draft → Pending KKF Verification → Active → (Suspended/Inactive/Retired/Banned)

---

## Brand Colors

**Primary Palette:**
- **Royal Blue:** `#0A3D91` - Primary brand color
- **Crimson Red:** `#C8102E` - Action/danger color
- **Gold/Yellow:** `#F2C94C` - Highlight/success
- **White:** `#FFFFFF` - Background
- **Gray:** `#B0B0B0` - Secondary text

**Status Colors:**
- **Success:** Emerald `#10B981`
- **Warning:** Amber `#F59E0B`
- **Error:** Red `#EF4444`
- **Info:** Blue `#3B82F6`

---

## System Limits

- **Max Fighters per Event:** 100
- **Max Matches per Sub-Event:** 20
- **Max Sub-Events per Event:** 12
- **Max Sponsors per Event:** 10
- **Glove Size Range:** 6oz - 10oz only
- **Weight Agreement Tolerance:** ±2kg

---

## Future Enhancements

1. Real-time live scoring integration
2. Mobile app for fighters and clubs
3. Automated weight cut monitoring
4. Video replay integration
5. AI-powered matchmaking suggestions
6. Fan voting and engagement features
7. Merchandise integration
8. Multi-language support (Khmer, English, Thai)

---

**End of Documentation**

For specific implementation details, refer to:
- `/MATCH_WORKFLOW.md` - Complete match creation workflow
- Source code in `/src/app/`
- Component documentation in code comments
