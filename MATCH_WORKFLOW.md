# Match Creation & Approval Workflow

## Overview
This document outlines the complete workflow for creating matches in the KUN KHMER Digital Platform, including the approval process and status transitions.

---

## Match Creation Entry Points

### 1. **Dashboard → CREATE MATCH Button**
```
Home (Dashboard) 
  → Click "CREATE MATCH" 
  → Redirects to Events & Matches page
  → Select Event 
  → Select Sub-Event 
  → Click "Create Match"
```

### 2. **Direct Navigation**
```
Events & Matches 
  → [Select Event Card] 
  → Event Detail 
  → [Select Sub-Event Card] 
  → Sub-Event Detail 
  → Click "Create Match"
```

---

## Match Creation Workflow

### **Step 1: Event Must Be Approved**

**Requirement:** Main event status must be one of:
- ✅ KKF Approved
- ✅ Published
- ✅ In Progress

**If event is NOT approved:**
- ❌ "Create Match" button is disabled
- ⚠️ Warning message: "Event must be approved to add matches"

**Approval Process:**
1. Organizer creates event (status: "Draft")
2. Organizer submits for approval (status: "Pending KKF Approval")
3. KKF Officer reviews and approves (status: "KKF Approved")
4. Now matches can be created!

---

### **Step 2: Access Match Creation Form**

**URL Pattern:**
```
/events/{eventId}/sub-events/{subEventId}/add-match
```

**Page Sections:**
1. **Fight Card** (Fighter Selection)
2. **Match Rules** (Configuration)
3. **Glove Agreement** (Safety & Compliance)

---

### **Step 3: Fill Out Match Details**

#### **A. Fighter Selection**
- Select **Fighter A** (Red Corner)
- Select **Fighter B** (Blue Corner)
- System displays:
  - Fighter photos
  - Records
  - Current weights
  - Fighting styles
  - Gym/club affiliation
- **Weight difference warning** if > 2kg

#### **B. Match Rules**
- **Rounds:** 3 or 5
- **Round Time:** 2, 3, or 5 minutes
- **Knockdown Limit:** 2, 3, 4, or No Limit
- **Agreed Weight (kg):** Required field (e.g., 66.0)

#### **C. Glove Agreement** ⭐ IMPORTANT
- **Glove Size:** 6oz / 8oz / 10oz
- **Glove Brand:** Select from KKF-approved brands
  - Twins Special BGVL-3
  - Fairtex BGV1
  - Top King Super Air
  - Boon Retro
  - Yokkao Matrix
  - Raja Boxing RBG-1
  - Windy BGVH
  - Venum Elite

**Fighter Confirmations:**
- ☑️ Fighter A must confirm (Red checkbox)
- ☑️ Fighter B must confirm (Blue checkbox)
- 🔒 **Both confirmations required to propose match**

#### **D. Match Notes (Optional)**
- Special conditions
- Requirements
- Additional information

---

### **Step 4: Save or Propose Match**

#### **Option A: Save as Draft** 💾
```
Action: Click "Save Draft"
Requirements:
  - Both fighters selected ✓
  - Agreed weight specified ✓
  - Glove agreement: NOT REQUIRED

Result:
  - Status: "Draft"
  - Proposal Status: "draft"
  - Club Responses: "pending"
  - Can edit later
  - Not sent to clubs
```

#### **Option B: Create Match (Propose)** 📤
```
Action: Click "Create Match"
Requirements:
  - Both fighters selected ✓
  - Agreed weight specified ✓
  - Fighter A confirmed gloves ✓
  - Fighter B confirmed gloves ✓

Result:
  - Status: "Proposed"
  - Proposal Status: "pending"
  - Club A Response: "pending"
  - Club B Response: "pending"
  - Notifications sent to both clubs
```

---

## Match Status Workflow

### **Complete Status Progression**

```
1. Draft
   ↓ (Organizer proposes to clubs)
   
2. Proposed
   ↓ (Waiting for club responses)
   
3. Pending Club Confirmation
   ↓ (One club accepted, waiting for other)
   
4. Club Confirmed
   ↓ (Both clubs accepted)
   
5. Ready to Fight
   ↓ (Pre-fight checks completed)
   
6. In Progress
   ↓ (Match is live)
   
7. Completed
   ↓ (Final status)
```

### **Alternative Paths**

**Rejection:**
```
Proposed → Club Rejected → Back to Draft
(If either club rejects, match goes back to draft)
```

**Cancellation:**
```
Any Status → Cancelled
(Can be cancelled at any time by organizer/KKF)
```

---

## Club Approval Process

### **When Match is Proposed:**

**Club A (Fighter A's Gym):**
1. Receives notification: "New match proposal for [Fighter Name]"
2. Reviews match details:
   - Opponent information
   - Agreed weight
   - Match rules
   - Glove agreement
3. Can **Accept** or **Reject**

**Club B (Fighter B's Gym):**
1. Receives same notification
2. Reviews same details
3. Can **Accept** or **Reject**

### **Status Transitions:**

| Club A Response | Club B Response | Match Status |
|----------------|----------------|--------------|
| Pending | Pending | Proposed |
| Accepted | Pending | Pending Club Confirmation |
| Pending | Accepted | Pending Club Confirmation |
| Accepted | Accepted | **Club Confirmed** ✓ |
| Rejected | Any | **Rejected** (back to Draft) |
| Any | Rejected | **Rejected** (back to Draft) |

---

## Data Structure

### **Match Object (Full Schema)**

```typescript
{
  id: string
  eventId: string
  subEventId: string
  
  // Fighters
  fighterA: Fighter
  fighterB: Fighter
  
  // Match Configuration
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
    checkPhotoUrl: string | null
  }
  
  // Referee Pre-Fight Checklist
  refereeChecklist: {
    weightChecked: boolean
    medicalCleared: boolean
    glovesApproved: boolean
    fightersReady: boolean
    checkedBy: string | null
    checkedDate: string | null
  }
  
  // Status & Workflow
  status: MatchStatus
  proposalStatus: "draft" | "pending" | "accepted" | "rejected"
  clubAResponse: "pending" | "accepted" | "rejected"
  clubBResponse: "pending" | "accepted" | "rejected"
  
  // Metadata
  proposedBy: string
  proposedDate: string
  date: string
  notes: string
  
  // Audit Trail
  workflowHistory: Array<{
    status: string
    timestamp: string
    userId: string
    userName: string
    action: string
    comments: string | null
  }>
}
```

---

## Permission Requirements

### **To Create Matches:**
```typescript
Permission: 'matches.create'

Roles with access:
- Super Admin ✓
- KKF Officer ✓
- Organizer ✓
- Club/Gym ✓
```

### **To Approve/Reject (Clubs):**
```typescript
Permission: 'matches.approve_club'

Roles with access:
- Club/Gym (own fighters only) ✓
```

### **To Finalize Matches:**
```typescript
Permission: 'matches.finalize'

Roles with access:
- Super Admin ✓
- KKF Officer ✓
```

---

## Validation Rules

### **Before Saving as Draft:**
1. ✅ Both fighters must be selected
2. ✅ Fighters cannot be the same person
3. ✅ Agreed weight must be specified
4. ✅ Both fighters must be "Active" status

### **Before Proposing to Clubs:**
1. ✅ All draft requirements
2. ✅ **Fighter A must confirm glove agreement**
3. ✅ **Fighter B must confirm glove agreement**
4. ✅ Glove size must match weight agreement
5. ✅ Glove type must be KKF-approved

### **Before Match Goes Live:**
1. ✅ Both clubs accepted
2. ✅ Referee checklist completed
3. ✅ Official weigh-in passed
4. ✅ Medical clearance verified
5. ✅ Gloves physically checked and approved

---

## Notifications

### **When Match is Proposed:**
```
To: Club A (Fighter A's gym)
Subject: New Match Proposal
Content: 
  - Fighter A vs Fighter B
  - Date, location, event
  - Agreed weight, rounds, rules
  - Glove specifications
  - Accept/Reject buttons
```

```
To: Club B (Fighter B's gym)
Subject: New Match Proposal
Content: (same as above)
```

### **When Club Accepts:**
```
To: Organizer + Other Club
Subject: Match Proposal Accepted
Content:
  - Club [X] accepted match proposal
  - Waiting for other club response (if pending)
  - Match confirmed (if both accepted)
```

### **When Club Rejects:**
```
To: Organizer + Other Club
Subject: Match Proposal Rejected
Content:
  - Club [X] rejected match proposal
  - Reason (if provided)
  - Match status changed to "Rejected"
```

---

## UI Components

### **Match Status Badges**

```typescript
Status Colors:
- Draft: Gray (bg-gray-100, text-gray-700)
- Proposed: Amber (bg-amber-100, text-amber-700)
- Pending Club Confirmation: Orange (bg-orange-100, text-orange-700)
- Club Confirmed: Green (bg-green-100, text-green-700)
- Ready to Fight: Blue (bg-blue-100, text-blue-700)
- In Progress: Purple (bg-purple-100, text-purple-700)
- Completed: Emerald (bg-emerald-100, text-emerald-700)
- Rejected: Red (bg-red-100, text-red-700)
- Cancelled: Gray (bg-gray-200, text-gray-600)
```

### **Button States**

**Save Draft:**
- Always enabled (if fighters selected + weight specified)
- White background, blue border
- No glove agreement required

**Create Match:**
- Enabled: Red gradient, clickable
- Disabled: Gray, cursor-not-allowed
- Requires: Glove agreement complete

---

## Error Messages

| Error | Trigger | Message |
|-------|---------|---------|
| No fighters selected | Click save/propose without fighters | "Please select both fighters" |
| Same fighter selected | Fighter A = Fighter B | "Cannot match a fighter against themselves" |
| No weight specified | Weight field empty | "Please specify agreed weight for the match" |
| Glove agreement incomplete | Propose without confirmations | "Both fighters must confirm glove agreement" |
| Event not approved | Try to add match to draft event | "Event must be approved before adding matches" |

---

## Success Messages

| Action | Message |
|--------|---------|
| Save draft | "✓ Match saved as draft" |
| Propose match | "✓ Match proposed to [Gym A] and [Gym B]" |
| Club accepts | "✓ Your club accepted the match proposal" |
| Both clubs accept | "✓ Match confirmed! Both clubs accepted" |
| Match updated | "✓ Match details updated successfully" |

---

## Best Practices

### **For Organizers:**
1. ✅ Always verify fighter weights before setting agreed weight
2. ✅ Discuss glove preferences with fighters before creating match
3. ✅ Provide clear notes for special conditions
4. ✅ Give clubs at least 48 hours to respond
5. ✅ Only propose matches when event is confirmed

### **For Clubs:**
1. ✅ Review all match details before accepting
2. ✅ Verify fighter is available on match date
3. ✅ Confirm fighter can make the agreed weight
4. ✅ Check glove specifications are acceptable
5. ✅ Respond promptly to proposals

### **For KKF Officers:**
1. ✅ Approve events only when fully vetted
2. ✅ Verify all matches before event publication
3. ✅ Ensure glove agreements are in place
4. ✅ Complete referee checklists before matches go live
5. ✅ Monitor match status progression

---

## Summary

**Match creation follows a structured approval process:**

1. **Event Approval** (KKF) → Required before any matches
2. **Match Creation** (Organizer) → Build fight card
3. **Glove Agreement** (Fighters) → Safety requirement
4. **Club Approval** (Both Gyms) → Mutual consent
5. **Pre-Fight Checks** (Referee/KKF) → Final verification
6. **Match Goes Live** → Event execution

**This ensures:**
- ✅ All parties consent to match conditions
- ✅ Safety requirements are met (gloves, weight, rules)
- ✅ Disputes are prevented through documented agreements
- ✅ Professional standards are maintained
- ✅ Audit trail exists for all decisions

**The workflow is now complete and matches your reference design!** 🥊
