# KUN KHMER Workflow - Quick Start Guide

## 🎯 The 11 Steps (Corrected Order)

```
1. Event Creation               (Organizer)
2. Submit to KKF                (Organizer)
3. KKF Review & Approval ✅     (KKF Officer) ⭐ CRITICAL GATE
4. Match Creation               (Organizer)
5. Club Confirmation            (Club Managers)
6. Assign Matches to Event      (Organizer)
7. Weigh-In & Final Confirmation (KKF Officer)
8. Match Execution              (Officials)
9. Result Update                (KKF Officer)
10. Match Completion            (KKF Officer)
11. Event Closure               (Organizer/KKF)
```

---

## ⚡ What You Need to Know

### Critical Change: Step 3 Must Come First!

**Step 3: KKF Review & Approval ✅**
- KKF approves the **EVENT** (not individual matches)
- **Must happen BEFORE matches can be created**
- Acts as a **gate** - Step 4 cannot proceed until Step 3 is complete

### Why This Matters

```
OLD (Wrong):
Submit → Create Matches → ... → KKF Approve Matches
         ❌ Too early!

NEW (Correct):
Submit → KKF Approve Event ✅ → Create Matches → ...
                 (Gate)            Now allowed!
```

---

## 🚦 Workflow Gate

```
┌─────────────────────────────────────────┐
│         STEP 3: CRITICAL GATE           │
├─────────────────────────────────────────┤
│                                         │
│  🔒 BEFORE Step 3:                      │
│     - Cannot create matches             │
│     - Cannot build fight card           │
│     - Event management limited          │
│                                         │
│  ✅ AFTER Step 3:                       │
│     - Can create match proposals        │
│     - Can build complete fight card     │
│     - Full event management unlocked    │
│                                         │
└─────────────────────────────────────────┘
```

---

## 📋 Step-by-Step Process

### Step 1-2: Event Setup (Organizer)
```
1. Create event (Draft)
2. Add required info:
   - Name, location, date
   - Sponsors (at least 1)
   - TV station/broadcaster
3. Click "Submit to KKF"
   → Status: Pending KKF Approval
```

### Step 3: KKF Approval (KKF Officer) ⭐
```
1. KKF officer reviews event
2. Checks sponsors, venue, date
3. Approves or rejects
   → If approved: Status = KKF Approved
   → If rejected: Organizer can edit and resubmit
```

### Step 4: Match Building (Organizer)
```
✅ Requires: Event kkfStatus === "approved"

1. Click "Create Match Proposal"
2. Select Fighter A, Fighter B
3. Set agreed weight, rounds
4. Submit proposal
   → Match Status: Proposed
```

### Step 5: Club Confirmation (Clubs)
```
1. Club A receives proposal
2. Club A confirms/rejects
3. Club B receives proposal
4. Club B confirms/rejects
   → If both confirm: Status = Club Confirmed
```

### Step 6: Assign to Fight Card (Organizer)
```
1. View confirmed matches
2. Click "Assign to Event"
3. Match added to fight card
   → Match Status: Assigned to Event
```

### Step 7: Weigh-In (KKF Officer)
```
1. Conduct official weigh-in
2. Enter actual weights
3. Verify within tolerance
   → Match Status: Ready to Fight
```

### Step 8-10: Fight Night (KKF Officer)
```
8. Start match → In Progress
9. Record results → Results Recorded
10. Complete match → Completed
```

### Step 11: Event Closure (Organizer)
```
✅ Requires: All matches completed

1. Verify all matches done
2. Click "Close Event"
   → Event Status: Closed
```

---

## 🔍 Validation Rules

### Can I Create a Match?

```typescript
✅ YES if:
- event.status !== "Draft"
- event.status !== "Pending KKF Approval"
- event.kkfStatus === "approved" ⭐ CRITICAL
- event.status !== "Closed"

❌ NO if:
- Event is Draft
- Event is Pending KKF Approval
- Event is Rejected
- Event is Closed
```

### Can I Close the Event?

```typescript
✅ YES if:
- event.status === "In Progress" OR "KKF Approved"
- All matches have status === "Completed"

❌ NO if:
- Any match is incomplete
- No matches exist
- Event already closed
```

---

## 🎨 Status Colors

### Event Statuses
```
🔵 Draft                    - Initial creation
🟡 Pending KKF Approval     - Waiting for Step 3
🟢 KKF Approved             - Gate unlocked!
🔴 In Progress              - Event running
⚫ Closed                   - Archived
❌ Rejected                 - Needs revision
```

### Match Statuses
```
🟣 Proposed                 - Step 4
🟡 Pending Club Confirmation - Step 5
🟢 Club Confirmed           - Step 5 complete
🔵 Assigned to Event        - Step 6
🟢 Weigh-In Complete        - Step 7
🟡 Ready to Fight           - Step 7
🔴 In Progress              - Step 8
🟣 Results Recorded         - Step 9
⚫ Completed                - Step 10
```

---

## 🛠️ Where to Find It

### UI Locations

**EventDetail Page** (`/events/{id}`):
- Workflow log (visible)
- "Submit to KKF" button (Step 2)
- "Create Match Proposal" button (Step 4)
- "Close Event" button (Step 11)

**KKFWorkflow Page** (`/kkf-workflow`):
- Pending events list
- Approve/Reject buttons (Step 3)

**MatchDetail Page** (`/matches/{id}`):
- Workflow log (visible)
- Match-specific actions

### Code Files

**Validation**: `/src/app/utils/improvedWorkflowValidation.ts`
- All 11 validation functions
- Status checks
- Gate logic

**Components**: 
- `/src/app/components/WorkflowHistory.tsx` (visible)
- `/src/app/components/WorkflowProgressTracker.tsx` (hidden)

---

## 🧪 Quick Test

### Test the Gate (Step 3 → Step 4)

```bash
1. Create event (Draft)
2. Try to create match
   ❌ Should block: "Event must be submitted to KKF"

3. Submit to KKF (Pending)
4. Try to create match
   ❌ Should block: "Event must be KKF approved"

5. [As KKF] Approve event (KKF Approved)
6. Try to create match
   ✅ Should work! Gate unlocked!
```

---

## 📖 Full Documentation

For detailed information, see:

1. **Quick Start**: `/WORKFLOW_QUICK_START.md` (this file)
2. **Detailed Guide**: `/CORRECTED_WORKFLOW_ORDER.md`
3. **Visual Diagrams**: `/WORKFLOW_CORRECTED_VISUAL.md`
4. **Implementation**: `/FINAL_WORKFLOW_SUMMARY.md`

---

## 💡 Key Takeaways

1. **Step 3 is the gate** - Nothing proceeds without KKF event approval
2. **One approval point** - KKF approves event, not individual matches
3. **Sequential flow** - Each step validates previous steps
4. **Complete audit** - All changes logged in workflow history
5. **Status-based UI** - Only valid actions shown

---

## 🎯 Remember

```
ALWAYS ensure Step 3 (KKF Approve Event) 
is complete before proceeding to Step 4 (Match Creation)

This is the CRITICAL GATE of the entire workflow!
```

---

**Version**: 2.1.0  
**Status**: ✅ Ready  
**Last Updated**: March 20, 2026
