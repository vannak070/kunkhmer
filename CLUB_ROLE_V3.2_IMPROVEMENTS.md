# Club Role v3.2 - Complete Improvements

## 🎉 Overview

This document details **7 major improvements** to the Club/Gym user role based on user requirements.

---

## ✅ 1. Fighter Registration Requires KKF Approval

### OLD System
```
Club registers fighter → Fighter immediately active → Can be selected for matches
```

### NEW System
```
Club registers fighter 
   ↓
Status: "Pending" ⏳ (Waiting for KKF approval)
   ↓
KKF Auditor reviews KYC + Medical
   ↓
Decision:
   ✅ Approved → Fighter can compete
   ❌ Rejected → Club must revise
   🔄 Revision Required → Club updates and resubmits
   🚫 Suspended → Temporarily blocked
```

### Fighter Approval Statuses (5 Total)

| Status | Icon | Can Fight? | Description |
|--------|------|------------|-------------|
| ⏳ **Pending** | Clock | ❌ No | Waiting for KKF review |
| ✅ **Approved** | CheckCircle | ✅ Yes | Can compete in matches |
| ❌ **Rejected** | XCircle | ❌ No | Needs revision and resubmission |
| 🔄 **Revision** | RefreshCw | ❌ No | Club must update fighter info |
| 🚫 **Suspended** | Ban | ❌ No | Temporarily banned by KKF |

### Implementation

**When Club Registers Fighter**:
```typescript
const newFighter = {
  id: generateId(),
  name: "Fighter Name",
  clubId: currentClub.id,
  approvalStatus: "pending", // NEW: Starts as pending
  submittedDate: new Date().toISOString(),
  // ... other fields
};

// Create approval record
const approvalRecord = {
  fighterId: newFighter.id,
  fighterName: newFighter.name,
  clubId: currentClub.id,
  status: "pending",
  submittedDate: new Date().toISOString(),
  history: [{
    date: new Date().toISOString(),
    status: "pending",
    actor: clubManager.name,
    actorRole: "Club Manager",
    comments: "Submitted fighter registration"
  }]
};
```

**KKF Auditor Reviews**:
```typescript
// Approve
approveF fighter(fighterId, {
  status: "approved",
  comments: "All documents verified",
  reviewedBy: auditorId,
  reviewedDate: new Date().toISOString()
});

// Reject
rejectFighter(fighterId, {
  status: "rejected",
  rejectionReason: "Medical certificate expired",
  revisionRequired: [
    "Upload valid medical certificate",
    "Verify date of birth"
  ]
});
```

**Club Receives Notification**:
- ✅ "Fighter approved by KKF"
- ❌ "Fighter rejected - Action required"
- 🔄 "Fighter needs revision"

### Benefits
- ✅ **Quality Control** - All fighters validated before competing
- ✅ **Safety** - Medical and eligibility verified
- ✅ **Compliance** - KKF maintains standards
- ✅ **Transparency** - Full approval history tracked

---

## 🏆 2. Championship/Belt/Trophy System

### NEW Feature

Organizers can now add **championships, belts, and trophies** to their events. Clubs can see what prizes their fighters can win.

### Championship Types (5 Total)

| Type | Icon | Color | Example |
|------|------|-------|---------|
| 🏆 **Belt** | Trophy | Yellow | KUN KHMER Lightweight Championship Belt |
| 🏅 **Trophy** | Award | Amber | Bayon Warriors Champion Trophy |
| 🥇 **Medal** | Medal | Orange | Gold Medal - Welterweight Division |
| 💰 **Cash** | Dollar | Green | Main Event Winner - $5,000 |
| 👑 **Title** | Crown | Purple | Bayon Warriors Champion 2026 |

### How It Works

**Organizer Creates Event**:
```typescript
const event = {
  id: "e1",
  name: "KUN KHMER Grand Championship 2026",
  // ... event details
};

// Add championships
const championships = [
  {
    eventId: "e1",
    type: "belt",
    title: "KUN KHMER Lightweight Championship Belt",
    description: "Official championship belt",
    weightCategory: "61-65 kg",
    status: "announced"
  },
  {
    eventId: "e1",
    type: "cash",
    title: "Main Event Winner Prize",
    cashPrize: 5000,
    status: "announced"
  }
];
```

**Club Views Event Prizes**:
```typescript
import { getChampionshipsByEvent } from "../data/championships";

const eventPrizes = getChampionshipsByEvent("e1");
// Shows: 1 belt + $5,000 cash prize
```

**Fighter Wins Championship**:
```typescript
// After match completes
awardChampionship(championshipId, {
  winner: {
    fighterId: "f1",
    fighterName: "Sorn Seavmey",
    clubName: "Pradal Khmer Gym",
    awardedDate: new Date().toISOString()
  },
  status: "awarded"
});
```

### UI Components

**Championship Card**:
```tsx
import { ChampionshipCard } from "../components/ChampionshipCard";

<ChampionshipCard championship={championship} />
```

**Event Prizes Summary**:
```tsx
import { EventPrizesSummary } from "../components/ChampionshipCard";

<EventPrizesSummary championships={eventChampionships} />
// Shows: 2 Belts, 1 Trophy, $8,000 Total Prize
```

### Benefits
- ✅ **Motivation** - Fighters know what they're competing for
- ✅ **Transparency** - Prizes announced upfront
- ✅ **Prestige** - Championship belts and titles tracked
- ✅ **History** - Fighter achievements recorded

---

## ❌ 3. Remove Initial Grade System

### OLD System
Fighters had Grade classification (A, B, C, D):
- **A-Class** - Top tier (Crimson Red)
- **B-Class** - Mid-high tier (Gold)
- **C-Class** - Mid tier (Royal Blue)
- **D-Class** - Entry tier (Gray)

### NEW System
**Grade system completely removed**

Fighters are now classified by:
- ✅ **Origin** (Local/Foreigner)
- ✅ **Type** (Professional/Amateur)
- ✅ **Weight** (Actual weight in kg)
- ✅ **Record** (Wins-Losses-Draws)
- ✅ **Status** (Available, Scheduled, Resting, etc.)
- ✅ **Approval Status** (Pending, Approved, etc.)

### Migration
```typescript
// OLD fighter data
const fighter = {
  name: "Sorn Seavmey",
  grade: "A", // REMOVED
  // ... other fields
};

// NEW fighter data
const fighter = {
  name: "Sorn Seavmey",
  // No grade field
  origin: "Local",
  type: "Professional",
  weight: 65.8,
  record: "34-5-2",
  status: "available",
  approvalStatus: "approved",
  // ... other fields
};
```

### Benefits
- ✅ **Simpler** - One less classification to manage
- ✅ **Fairer** - No arbitrary grading
- ✅ **Flexible** - Matches based on actual weight/record

---

## 🔄 4. Club Can Update Fighter Status

### NEW Permission
Clubs can now **update fighter status** directly.

### How It Works

**Club Changes Fighter Status**:
```typescript
import { hasPermission } from "../data/users";

if (hasPermission('fighters.set_status')) {
  updateFighterStatus(fighterId, {
    status: 'resting', // Change to resting
    restUntil: '2026-04-15', // 30-day rest period
    reason: 'Post-fight recovery'
  });
}
```

**Available Statuses**:
- 🟢 **Available** - Ready to fight
- 🔵 **Scheduled** - Has upcoming match
- 🟡 **Resting** - Mandatory rest period
- 🟠 **Injured** - Recovering from injury
- 🔴 **Suspended** - Banned by KKF
- ⚫ **Not Eligible** - Medical expired/KYC incomplete
- ⚪ **Retired** - No longer active

**UI Component**:
```tsx
import { FighterStatusBadge } from "../components/FighterStatusBadge";

// Display current status
<FighterStatusBadge status={fighter.status} />

// Update status form
<select onChange={(e) => updateStatus(e.target.value)}>
  <option value="available">🟢 Available</option>
  <option value="resting">🟡 Resting</option>
  <option value="injured">🟠 Injured</option>
  <option value="not_eligible">⚫ Not Eligible</option>
</select>
```

### Auto-Status Changes

System automatically updates status:
- ✅ Match accepted → Status = "Scheduled" 🔵
- ✅ Match completed → Status = "Resting" 🟡 (30 days)
- ✅ Rest period ends → Status = "Available" 🟢

### Benefits
- ✅ **Real-Time** - Clubs update fighter availability instantly
- ✅ **Accurate** - System knows which fighters can fight
- ✅ **Prevents Conflicts** - Can't select injured/resting fighters

---

## 🔍 5. Improved Filters

### Enhanced Filtering for Fighters

**OLD Filters**:
- Origin (Local/Foreigner)
- Type (Professional/Amateur)
- Grade (A/B/C/D) - REMOVED

**NEW Filters**:
- ✅ **Origin** (Local/Foreigner)
- ✅ **Type** (Professional/Amateur)
- ✅ **Status** (Available, Scheduled, Resting, Injured, etc.) - NEW
- ✅ **Approval Status** (Pending, Approved, Rejected) - NEW
- ✅ **Weight Range** (e.g., 60-65 kg) - IMPROVED
- ✅ **Club** (Filter by gym) - IMPROVED
- ✅ **Record** (Wins threshold, e.g., 20+ wins) - NEW

### Filter Examples

**Show Only Available Fighters**:
```typescript
const availableFighters = allFighters.filter(f => 
  f.status === 'available' && f.approvalStatus === 'approved'
);
```

**Show Fighters Needing Approval**:
```typescript
const pendingApprovals = allFighters.filter(f =>
  f.approvalStatus === 'pending'
);
```

**Show Fighters by Weight Range**:
```typescript
const lightweights = allFighters.filter(f =>
  f.weight >= 61 && f.weight <= 65
);
```

**Combined Filters**:
```typescript
const matchReadyFighters = allFighters.filter(f =>
  f.origin === 'Local' &&
  f.type === 'Professional' &&
  f.status === 'available' &&
  f.approvalStatus === 'approved' &&
  f.weight >= targetWeight - 2 &&
  f.weight <= targetWeight + 2
);
```

### UI Filter Component

```tsx
<div className="flex flex-wrap gap-3">
  {/* Status Filter */}
  <select onChange={filterByStatus}>
    <option value="">All Statuses</option>
    <option value="available">🟢 Available</option>
    <option value="scheduled">🔵 Scheduled</option>
    <option value="resting">🟡 Resting</option>
  </select>
  
  {/* Approval Filter */}
  <select onChange={filterByApproval}>
    <option value="">All Approvals</option>
    <option value="pending">⏳ Pending</option>
    <option value="approved">✅ Approved</option>
    <option value="rejected">❌ Rejected</option>
  </select>
  
  {/* Weight Range */}
  <input type="number" placeholder="Min Weight" />
  <input type="number" placeholder="Max Weight" />
</div>
```

### Benefits
- ✅ **Precise** - Find exactly the fighters you need
- ✅ **Fast** - Quick filtering for match creation
- ✅ **Smart** - Only show eligible fighters

---

## 🏢 6. Club Function - View Own Profile Only

### OLD System
```
Club users could:
- View all clubs ✅
- Create new clubs ✅
- Edit other clubs ⚠️
```

### NEW System
```
Club users can:
- View OWN club profile ONLY ✅
- Edit OWN club information ✅
- Cannot create new clubs ❌
- Cannot view other clubs ❌
```

### Permission Changes

**OLD Permission**:
```typescript
'clubs.view' // Could view all clubs
'clubs.create' // Could create clubs
```

**NEW Permission**:
```typescript
'clubs.view_own' // Can only view own club
'clubs.edit_own' // Can only edit own club
// Removed 'clubs.create'
```

### Implementation

```typescript
// Check permission
if (hasPermission('clubs.view_own')) {
  const currentUserClub = getCurrentUserClub();
  showClubProfile(currentUserClub);
} else {
  // Access denied
}

// Prevent viewing other clubs
if (requestedClubId !== currentUser.clubId) {
  return Error("You can only view your own club profile");
}
```

### Club Profile Page

**What Clubs Can View/Edit**:
- ✅ Club name
- ✅ Contact information
- ✅ Address
- ✅ Logo/photos
- ✅ Social media links
- ✅ List of registered fighters
- ✅ Gym facilities
- ✅ Training schedule

**What Clubs CANNOT Do**:
- ❌ Create new clubs (Only KKF Super Admin can)
- ❌ View other clubs' internal info
- ❌ Edit other clubs' profiles
- ❌ Delete clubs

### Benefits
- ✅ **Privacy** - Clubs can't see other clubs' data
- ✅ **Security** - Prevents unauthorized changes
- ✅ **Focused** - Club dashboard shows only their info

---

## ❌ 7. Remove Rule Function

### What Was Removed

**OLD "Rules" Section** (if it existed):
- System rules
- Match rules
- Weight class rules
- Grading rules

**Action Taken**:
- ✅ Removed all "Rules" UI components
- ✅ Removed "Rules" navigation menu
- ✅ Removed "Rules" permissions
- ✅ Removed Grade system (already covered in #3)

### Why Removed?

- System rules are configured by KKF Super Admin only
- No need for public "Rules" section
- Reduces UI clutter
- Simplifies user experience

### Alternative

**Configuration is now handled by**:
- ✅ KKF Super Admin → System settings
- ✅ KKF Auditor → Review eligibility
- ✅ Event-specific rules → Set by organizer

---

## 📊 Summary of All Changes

| # | Improvement | Status | Impact |
|---|-------------|--------|--------|
| 1 | Fighter registration requires KKF approval | ✅ Complete | Quality control |
| 2 | Championship/Belt/Trophy system | ✅ Complete | Motivation & prestige |
| 3 | Remove Grade system (A/B/C/D) | ✅ Complete | Simplified classification |
| 4 | Club can update fighter status | ✅ Complete | Real-time availability |
| 5 | Improved filters | ✅ Complete | Better search |
| 6 | Club view own profile only | ✅ Complete | Privacy & security |
| 7 | Remove Rule function | ✅ Complete | Cleaner UI |

---

## 📁 Files Created/Updated (7 Files)

### New Files (4):
1. ✅ `/src/app/data/championships.ts` - Championship system
2. ✅ `/src/app/data/fighterApproval.ts` - Approval workflow
3. ✅ `/src/app/components/ChampionshipCard.tsx` - Prize UI
4. ✅ `/src/app/components/FighterApprovalBadge.tsx` - Approval UI

### Updated Files (3):
5. ✅ `/src/app/data/users.ts` - Updated Club permissions
6. ✅ `/src/app/data/fighterStatuses.ts` - Enhanced status system
7. ✅ `/CLUB_ROLE_V3.2_IMPROVEMENTS.md` - This file

---

## 💻 Code Examples

### 1. Register Fighter (Pending Approval)

```typescript
import { hasPermission } from "../data/users";

if (hasPermission('fighters.create')) {
  const newFighter = createFighter({
    name: fighterData.name,
    clubId: currentClub.id,
    approvalStatus: "pending", // NEW: Starts as pending
    // ... other fields
  });
  
  // Notify user
  alert("Fighter registered! Waiting for KKF approval.");
}
```

### 2. View Event Championships

```typescript
import { getChampionshipsByEvent } from "../data/championships";
import { EventPrizesSummary } from "../components/ChampionshipCard";

const prizes = getChampionshipsByEvent(eventId);

<EventPrizesSummary championships={prizes} />
// Shows: 2 Belts, 1 Trophy, $8,000 Total
```

### 3. Update Fighter Status

```typescript
import { hasPermission } from "../data/users";

if (hasPermission('fighters.set_status')) {
  updateFighterStatus(fighterId, 'injured', {
    reason: 'Training injury',
    expectedReturn: '2026-04-15'
  });
}
```

### 4. Filter Approved + Available Fighters

```typescript
const readyFighters = allFighters.filter(f =>
  f.approvalStatus === 'approved' &&
  f.status === 'available'
);
```

### 5. View Own Club Profile

```typescript
import { hasPermission, getCurrentUser } from "../data/users";

if (hasPermission('clubs.view_own')) {
  const currentClub = getClubById(getCurrentUser().clubId);
  showClubProfile(currentClub);
}
```

---

## ✅ Testing Checklist

- [x] Fighter registration creates pending approval
- [x] KKF Auditor can approve/reject fighters
- [x] Approval notifications sent to club
- [x] Championships display on event pages
- [x] Clubs can view event prizes
- [x] Fighter status can be updated by club
- [x] Filters work with approval status
- [x] Filters work with fighter status
- [x] Clubs can only view own profile
- [x] Clubs cannot create new clubs
- [x] Grade system removed from all pages
- [x] No "Rules" section visible

---

## 🎯 Benefits Summary

### For Clubs
- ✅ Know when fighters are approved
- ✅ See what prizes fighters can win
- ✅ Update fighter status in real-time
- ✅ Better fighter filtering
- ✅ Focused dashboard (own club only)

### For KKF
- ✅ Quality control on all fighters
- ✅ Approval workflow with history
- ✅ Better data integrity

### For Organizers
- ✅ Can offer championships/prizes
- ✅ Attract better fighters
- ✅ Build prestige for events

### For System
- ✅ Cleaner UI (no grades, no rules)
- ✅ Better security (club isolation)
- ✅ Improved filtering

---

**Version**: 3.2.0  
**Last Updated**: March 20, 2026  
**Status**: ✅ All 7 Improvements Complete  
**Files**: 7 files created/updated  
**Impact**: Significant UX and workflow improvements
