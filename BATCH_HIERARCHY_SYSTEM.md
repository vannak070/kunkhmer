# Match Batch Hierarchy System - Complete Implementation
**Date:** March 24, 2026  
**System Version:** 2.8.0  
**Status:** ✅ Production Ready

---

## 🎯 Overview

The Match system has been completely restructured with a hierarchical approach where **Event → Batch → Matches**. All matches must belong to a batch, and all batches are linked to events. The UI now uses gloves (Box icon) throughout.

---

## 📊 System Hierarchy

###

 **Complete Structure**

```
EVENT
  ├─ BATCH 1
  │   ├─ Match 1
  │   ├─ Match 2
  │   ├─ Match 3
  │   └─ Match N
  │
  ├─ BATCH 2
  │   ├─ Match 1
  │   ├─ Match 2
  │   └─ Match N
  │
  └─ BATCH N
      └─ Matches...
```

**Rules:**
```
✅ All matches MUST belong to a batch
✅ All batches MUST be linked to an event
✅ One batch can have multiple matches
✅ One event can have multiple batches
❌ Matches cannot exist without a batch
❌ Batches cannot exist without an event
```

---

## 🔄 Data Model

### **MatchBatch Interface**

```typescript
interface MatchBatch {
  id: string;
  batchNumber: string;        // "BATCH-001"
  
  // Event Link (REQUIRED)
  eventId: string;
  eventName: string;
  eventDate: string;
  subEventId?: string;
  subEventName?: string;
  
  // Batch Info
  status: BatchStatus;        // Draft, Pending KKF, Approved, etc.
  totalMatches: number;
  
  // Matches (Array)
  matches: Match[];
  
  // KKF Approval
  submittedDate?: string;
  submittedBy?: string;
  reviewedDate?: string;
  reviewedBy?: string;
  rejectionReason?: string;
  approvalNotes?: string;
  
  // Metadata
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}
```

---

### **Match Interface**

```typescript
interface Match {
  id: string;
  batchId: string;            // REQUIRED - belongs to batch
  
  // Fighters
  fighterA: {
    id: string;
    name: string;
    image: string;
    weight: number;
    record: string;
  };
  fighterB: {
    id: string;
    name: string;
    image: string;
    weight: number;
    record: string;
  };
  
  // Match Details
  weightClass: string;
  rounds: number;
  matchOrder: number;         // Position in batch (1, 2, 3...)
  notes?: string;
  
  // Result (if completed)
  status: "Scheduled" | "Completed" | "Cancelled";
  winner?: string;
  method?: string;
  round?: number;
  date?: string;
}
```

---

### **Batch Status**

```typescript
type BatchStatus = 
  | "Draft"           // Being created, not submitted
  | "Pending KKF"     // Submitted, awaiting review
  | "Approved"        // KKF approved
  | "Rejected"        // KKF rejected
  | "Scheduled";      // Matches added to event
```

**Status Configuration:**

| Status | Icon | Color | Meaning |
|--------|------|-------|---------|
| **Draft** | ✏️ | Gray | Being created |
| **Pending KKF** | ⏳ | Amber | Awaiting KKF review |
| **Approved** | ✅ | Green | KKF approved |
| **Rejected** | ❌ | Red | KKF rejected |
| **Scheduled** | 📅 | Blue | Added to event schedule |

---

## 🎨 UI Design

### **Main Page Layout**

```
┌─────────────────────────────────────────────────┐
│  🥊 MATCH BATCHES                               │
│  Organize matches by batches • 3 batches        │
│                                                 │
│  [Create Batch]                                 │
├─────────────────────────────────────────────────┤
│                                                 │
│  FILTERS:                                       │
│  [Search___________] [All Status ▼]           │
│                                                 │
│  ┌────────────────────────────────────────┐    │
│  │  BATCH-001                        [▼]  │    │
│  │  ✅ Approved • 5 matches                │    │
│  │                                         │    │
│  │  Event: KUN KHMER Championship         │    │
│  │  Date: 2026-04-15                      │    │
│  │  Created By: Olympic Club              │    │
│  └────────────────────────────────────────┘    │
│                                                 │
│  ┌────────────────────────────────────────┐    │
│  │  BATCH-002                        [▼]  │    │
│  │  ⏳ Pending KKF • 3 matches             │    │
│  │  ...                                    │    │
│  └────────────────────────────────────────┘    │
└─────────────────────────────────────────────────┘
```

---

### **Batch Card - Collapsed**

```
┌─────────────────────────────────────────────────┐
│  🥊  BATCH-001                            [▼]   │
│      ✅ Approved • 5 matches                     │
│                                                 │
│  ┌──────────────┬──────────────┬──────────────┐│
│  │ 📍 Event     │ 📅 Date      │ 👥 Created   ││
│  │ KUN KHMER    │ 2026-04-15  │ Olympic Club ││
│  │ Championship │             │              ││
│  └──────────────┴──────────────┴──────────────┘│
└─────────────────────────────────────────────────┘
```

---

### **Batch Card - Expanded**

```
┌─────────────────────────────────────────────────┐
│  🥊  BATCH-001                            [▲]   │
│      ✅ Approved • 5 matches                     │
│                                                 │
│  ┌──────────────┬──────────────┬──────────────┐│
│  │ 📍 Event     │ 📅 Date      │ 👥 Created   ││
│  │ KUN KHMER    │ 2026-04-15  │ Olympic Club ││
│  └──────────────┴──────────────┴──────────────┘│
├─────────────────────────────────────────────────┤
│  MATCHES IN THIS BATCH (5)                      │
│                                                 │
│  ┌────────────────────────────────────────┐    │
│  │  MATCH 1               [Main Event]    │    │
│  │                                         │    │
│  │  [Photo]        VS        [Photo]      │    │
│  │  Sok Thy                  Chantha      │    │
│  │  Red Corner               Blue Corner  │    │
│  │  12-2-0                   10-3-1       │    │
│  │                                         │    │
│  │  70kg • 5 Rounds                       │    │
│  └────────────────────────────────────────┘    │
│                                                 │
│  ┌────────────────────────────────────────┐    │
│  │  MATCH 2               [Co-Main]       │    │
│  │  ...                                    │    │
│  └────────────────────────────────────────┘    │
│                                                 │
│  ✅ KKF APPROVAL NOTES:                         │
│  "All matches approved. Excellent matchmaking." │
│  Reviewed by KKF Admin on 2026-03-05           │
└─────────────────────────────────────────────────┘
```

---

## 🔧 Key Features

### **1. Icon Changes**

**Before:**
```
❌ Swords icon (Matches)
❌ Mixed icons throughout
```

**After:**
```
✅ Box icon (🥊 Gloves) everywhere
✅ Navigation menu icon: Box
✅ Page header icon: Box  
✅ Batch cards icon: Box
✅ Consistent visual identity
```

**Navigation Update:**
```typescript
Program > Matches
Icon: Box (Gloves)
Path: /matches
```

---

### **2. Batch-First Approach**

**List View:**
```
✅ Shows batches as primary items
✅ Matches are nested inside batches
✅ Click to expand/collapse batch
✅ See all batch info at a glance
```

**No Standalone Matches:**
```
❌ Matches don't appear individually
✅ All matches belong to a batch
✅ Batch provides context (event, date, status)
✅ Better organization and tracking
```

---

### **3. Expandable Batches**

**Collapsed State:**
```
Shows:
├─ Batch number & status
├─ Number of matches
├─ Event name
├─ Event date
└─ Created by
```

**Expanded State:**
```
Shows everything above PLUS:
├─ All matches in batch
├─ Fighter details per match
├─ Match order & notes
├─ KKF approval notes (if approved)
├─ Rejection reason (if rejected)
└─ Batch actions (submit, share)
```

---

### **4. Event Linking**

**Mandatory Event:**
```
✅ Must select event when creating batch
✅ Event dropdown shows only active/upcoming
✅ All matches inherit event from batch
✅ Event info displayed prominently
```

**Event Selection:**
```
[Choose an event... ▼]
  ├─ KUN KHMER Championship 2026 - 2026-04-15
  ├─ Fight Night March 30 - 2026-03-30
  ├─ National Title Bouts - 2026-04-20
  └─ MAS Fight Season 2 - 2026-05-01

Filters out:
❌ Completed events
❌ Cancelled events
```

---

### **5. Create Batch Workflow**

```
┌─────────────────────────────────────┐
│  STEP 1: Click "Create Batch"       │
└─────────────────────────────────────┘
              ↓
┌─────────────────────────────────────┐
│  STEP 2: Select Event               │
│  [KUN KHMER Championship 2026 ▼]    │
└─────────────────────────────────────┘
              ↓
┌─────────────────────────────────────┐
│  STEP 3: Add Matches                │
│  • Select Red Corner fighter        │
│  • Select Blue Corner fighter       │
│  • Choose rounds (3/5/7)            │
│  • Add notes (optional)             │
│  • Click "Add Another Match"        │
└─────────────────────────────────────┘
              ↓
┌─────────────────────────────────────┐
│  STEP 4: Review & Create            │
│  • Check all fields                 │
│  • Click "Create Batch"             │
└─────────────────────────────────────┘
              ↓
┌─────────────────────────────────────┐
│  RESULT: Draft Batch Created        │
│  • Status: Draft                    │
│  • Can submit to KKF                │
│  • Can share with stakeholders      │
└─────────────────────────────────────┘
```

---

### **6. Batch Actions**

**Draft Status:**
```
Actions Available:
├─ Submit to KKF (approval workflow)
├─ Share (generate shareable link)
├─ Edit matches
└─ Delete batch
```

**Pending KKF:**
```
Actions Available:
├─ View only
└─ Wait for KKF review
```

**Approved:**
```
Shows:
├─ Approval notes
├─ Reviewed by & date
Actions:
└─ Add to event schedule
```

**Rejected:**
```
Shows:
├─ Rejection reason
├─ Reviewed by & date
Actions:
├─ Edit matches
└─ Resubmit for approval
```

---

## 📊 Sample Data

### **Batch 1 - Approved**

```
ID: batch-001
Number: BATCH-001
Event: KUN KHMER Championship 2026
Date: 2026-04-15
Status: ✅ Approved
Matches: 5

Match 1: Sok Thy vs Chantha Pov (70kg, 5 rounds)
  Notes: "Main Event - Championship Bout"
  
Match 2: Kimsan Vorn vs Ratanak Seng (60kg, 3 rounds)
  Notes: "Co-Main Event"
  
Match 3: Sopheak Meas vs Dara Kong (75kg, 3 rounds)
  
Match 4: Bopha Lim vs Sreymom Chan (54kg, 3 rounds)
  Notes: "Women's Division"
  
Match 5: Vanneth Ouk vs Piseth Sam (65kg, 5 rounds)
  Notes: "Title Eliminator"

Approval Notes: "All matches approved. Excellent matchmaking."
Reviewed By: KKF Admin
Reviewed Date: 2026-03-05
```

---

### **Batch 2 - Pending KKF**

```
ID: batch-002
Number: BATCH-002
Event: Fight Night March 30
Date: 2026-03-30
Status: ⏳ Pending KKF
Matches: 3

Match 1: Ponleak Sor vs Virak Nhem (67kg, 3 rounds)
Match 2: Chakrya Heng vs Makara Pich (80kg, 3 rounds)
Match 3: Thyda Keo vs Leap Sok (57kg, 3 rounds)

Submitted By: Victory Gym
Submitted Date: 2026-03-20
Status: Awaiting KKF review
```

---

### **Batch 3 - Draft**

```
ID: batch-003
Number: BATCH-003
Event: National Title Bouts
Date: 2026-04-20
Status: ✏️ Draft
Matches: 2

Match 1: Serey Rith vs Kosal Leng (85kg, 5 rounds)
  Notes: "National Title Fight"
  
Match 2: Chanthy Prak vs Socheat Morn (51kg, 3 rounds)
  Notes: "Women's Flyweight"

Created By: KKF Admin
Created Date: 2026-03-22
Status: Not yet submitted
```

---

## 🎯 Benefits

### **Organization**

**Before:**
```
❌ Individual matches scattered
❌ Hard to track event connection
❌ No grouping mechanism
❌ Difficult to manage in bulk
```

**After:**
```
✅ Matches organized by batch
✅ Clear event association
✅ Easy to see relationships
✅ Batch-level operations
```

---

### **Workflow**

**Before:**
```
❌ Create matches one by one
❌ Link each match to event separately
❌ Submit each for approval
❌ Track status individually
```

**After:**
```
✅ Create multiple matches in one batch
✅ Single event link for all matches
✅ Submit entire batch for approval
✅ Track batch status centrally
```

---

### **Visibility**

**Before:**
```
❌ Event context not obvious
❌ Hard to see which matches go together
❌ Approval status unclear
❌ KKF feedback scattered
```

**After:**
```
✅ Event always visible
✅ Related matches grouped
✅ Status clearly shown
✅ KKF feedback on batch
```

---

## 📱 Responsive Design

### **Desktop**
```
┌─────────────────────────────────────┐
│  Full batch cards                   │
│  3-column event info                │
│  Expanded matches side by side      │
│  All actions visible                │
└─────────────────────────────────────┘
```

### **Mobile**
```
┌──────────────┐
│  Stacked     │
│  Single col  │
│  Tap expand  │
│  Touch       │
│  friendly    │
└──────────────┘
```

---

## 🔐 Permissions

### **View Batches**
- Permission: `matches.view`
- All authenticated users

### **Create Batch**
- Permission: `matches.create`
- Club Manager, Event Organizer, KKF Admin

### **Submit to KKF**
- Permission: `matches.submit_for_approval`
- Club Manager, Event Organizer

### **Approve/Reject**
- Permission: `matches.approve`
- KKF Admin, KKF Reviewer

---

## 📈 Statistics

### **Current System**

```
Total Batches: 3
Total Matches: 10
Approved Batches: 1 (5 matches)
Pending Batches: 1 (3 matches)
Draft Batches: 1 (2 matches)

Events Covered: 3
Average Matches per Batch: 3.3
Approval Rate: 100% (1/1 submitted)
```

---

## ✅ Summary

### **Major Changes**

**Hierarchy:**
```
Before: Individual Matches
After:  Event → Batch → Matches
```

**Icons:**
```
Before: Swords (⚔️)
After:  Gloves (🥊 Box icon)
```

**Organization:**
```
Before: Flat list of matches
After:  Nested batch structure
```

**Event Linking:**
```
Before: Optional per match
After:  Required at batch level
```

**UI:**
```
Before: Individual match cards
After:  Expandable batch cards with nested matches
```

---

### **Files Created/Modified**

**New Files:**
```
✅ /src/app/data/batches.ts
   - MatchBatch interface
   - Match interface
   - BatchStatus types
   - Helper functions
   - Mock data (3 batches, 10 matches)
```

**Modified Files:**
```
✅ /src/app/components/Layout.tsx
   - Changed Matches icon to Box (gloves)
   - Updated navigation

✅ /src/app/pages/Matches.tsx
   - Complete rewrite
   - Batch-first approach
   - Expandable batch cards
   - Nested match display
   - Event linking
   - Create batch flow
```

---

### **Key Features**

```
✅ Hierarchical structure (Event → Batch → Matches)
✅ Gloves icon throughout
✅ Batch-first listing
✅ Expandable batch cards
✅ Nested match display
✅ Event linking required
✅ Create batch workflow
✅ KKF approval at batch level
✅ Status tracking
✅ Approval/rejection notes
✅ Share batch functionality
✅ Responsive design
```

---

**Implementation Completed:** March 24, 2026  
**System Version:** 2.8.0  
**Status:** ✅ **Production Ready**

The Match system now uses a clean hierarchical structure with Event → Batch → Matches, all with gloves iconography! 🥊📦✅

