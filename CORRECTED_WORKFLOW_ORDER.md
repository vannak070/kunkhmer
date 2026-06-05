# KUN KHMER Digital Platform - CORRECTED Workflow Order

## ✅ Corrected 11-Step Workflow

The workflow has been **corrected** to ensure **KKF approves the EVENT first** (Step 3) before any matches can be created (Step 4).

---

## 📋 Complete Workflow (Corrected Order)

### **STEP 1: Event Creation**
**Who**: Organizer  
**Action**: Create event with basic information  
**Status**: `Draft`

---

### **STEP 2: Submit to KKF**
**Who**: Organizer  
**Action**: Submit event to KKF Federation for approval  
**Required**: At least 1 sponsor, complete event info, TV station  
**Status Transition**: `Draft` → `Pending KKF Approval`

**Validation**: `canSubmitEventToKKF(event)`

---

### **STEP 3: KKF Review & Approval ✅ (MUST COME FIRST)**
**Who**: KKF Officer  
**Action**: **KKF reviews and approves the EVENT**  
**Status Transition**: `Pending KKF Approval` → `KKF Approved`

**Validation**: `canKKFApproveEvent(event)`

**IMPORTANT**: This is EVENT approval, NOT match approval. The event must be approved before matches can be created.

**New Validation Rule**:
```typescript
// Step 4 cannot proceed until Step 3 is complete
if (event.kkfStatus !== "approved") {
  return "Event must be KKF approved before creating matches"
}
```

---

### **STEP 4: Match Creation**
**Who**: Organizer  
**Action**: Create match proposals **AFTER EVENT IS KKF APPROVED**  
**Required**: Event must have `kkfStatus === "approved"`  
**Match Status**: `Proposed`

**Validation**: `canCreateMatchForEvent(event)`

**Validation Rules**:
```typescript
✓ Event status must NOT be "Draft"
✓ Event status must NOT be "Pending KKF Approval"
✓ Event kkfStatus must be "approved" ⭐ KEY REQUIREMENT
✓ Event must NOT be "Closed"
```

---

### **STEP 5: Club Confirmation**
**Who**: Club Managers  
**Action**: Both clubs confirm or reject match proposal  
**Status Transition**: `Proposed` → `Pending Club Confirmation` → `Club Confirmed`

**Validation**: `areClubsConfirmed(match)`

---

### **STEP 6: Assign Matches to Event**
**Who**: Organizer  
**Action**: Organizer assigns club-confirmed matches to event fight card  
**Status Transition**: `Club Confirmed` → `Assigned to Event`

**Validation**: `canAssignMatchToEvent(match, event)`

---

### **STEP 7: Weigh-In & Final Confirmation**
**Who**: KKF Officer  
**Action**: Conduct official weigh-in ceremony  
**Status Transition**: `Assigned to Event` → `Weigh-In Complete` → `Ready to Fight`

**Validation**: `canConductWeighIn(match)`

---

### **STEP 8: Match Execution**
**Who**: KKF Officer/Referee  
**Action**: Match begins and is in progress  
**Status Transition**: `Ready to Fight` → `In Progress`

**Validation**: `canStartMatch(match)`

---

### **STEP 9: Result Update**
**Who**: KKF Officer  
**Action**: Record official match results  
**Status Transition**: `In Progress` → `Results Recorded`

**Validation**: `canRecordResults(match)`

---

### **STEP 10: Match Completion**
**Who**: KKF Officer  
**Action**: Finalize and lock match results  
**Status Transition**: `Results Recorded` → `Completed`

**Validation**: `canCompleteMatch(match)`

---

### **STEP 11: Event Closure**
**Who**: Organizer or KKF Officer  
**Action**: Officially close event after all matches completed  
**Status Transition**: `In Progress` → `Closed`

**Validation**: `canCloseEvent(event, matches)`

---

## 🔄 Complete Status Flow

### Event Status Flow
```
Step 1: Draft (Created)
         ↓
Step 2: Pending KKF Approval (Submitted)
         ↓
Step 3: KKF Approved ✅ (Event Approved by KKF)
         ↓
        [Now matches can be created]
         ↓
Step 8: In Progress (Event running)
         ↓
Step 11: Closed (Archived)
```

### Match Status Flow
```
Step 4: Proposed (Created - only after event KKF approved)
         ↓
Step 5: Pending Club Confirmation
         ↓
Step 5: Club Confirmed (Both clubs accepted)
         ↓
Step 6: Assigned to Event
         ↓
Step 7: Weigh-In Complete
         ↓
Step 7: Ready to Fight
         ↓
Step 8: In Progress
         ↓
Step 9: Results Recorded
         ↓
Step 10: Completed
```

---

## 🆚 What Changed?

### ❌ OLD (Incorrect) Order:
```
Step 1: Event Creation
Step 2: Submit to KKF
Step 3: Match Creation ← WRONG! Can't create before KKF approval
Step 4: Club Confirmation
Step 5: Assign Matches to Event
Step 6: KKF Review & Approval on Match ← This was added incorrectly
Step 7: Weigh-In
...
```

### ✅ NEW (Correct) Order:
```
Step 1: Event Creation
Step 2: Submit to KKF
Step 3: KKF Review & Approval ✅ (EVENT APPROVAL)
Step 4: Match Creation ← Now correctly after KKF approval
Step 5: Club Confirmation
Step 6: Assign Matches to Event
Step 7: Weigh-In ← No separate KKF match approval needed
Step 8: Match Execution
Step 9: Result Update
Step 10: Match Completion
Step 11: Event Closure
```

---

## 🎯 Key Points

### 1. **Single KKF Approval Point**
- **KKF approves the EVENT** in Step 3
- **No separate match approval step**
- Once event is approved, organizer can create/manage matches

### 2. **Sequential Flow Enforced**
```
Step 1 → Step 2 → Step 3 ✅ → Step 4
                   (KKF Approval required before matches)
```

### 3. **Validation Logic**
```typescript
// In canCreateMatchForEvent():
if (event.kkfStatus !== "approved") {
  return {
    isValid: false,
    message: "Event must be KKF approved before creating matches"
  };
}
```

---

## 📊 Updated Workflow Steps

### Event Progress (11 Steps)
```
[✅] Step 1: Event Created
[✅] Step 2: Submit to KKF
[🔵] Step 3: KKF Review & Approval ✅ ← CURRENT
[⚪] Step 4: Match Creation
[⚪] Step 5: Club Confirmation
[⚪] Step 6: Assign to Event
[⚪] Step 7: Weigh-In
[⚪] Step 8: Match Execution
[⚪] Step 9: Result Update
[⚪] Step 10: Match Completion
[⚪] Step 11: Event Closure
```

---

## 🔐 Updated Permissions

### Organizer Actions
```
✅ Step 1: Create Event
✅ Step 2: Submit to KKF
   [Wait for KKF approval]
✅ Step 4: Create Match Proposals (after KKF approval)
✅ Step 6: Assign Matches to Event
✅ Step 11: Close Event
```

### KKF Officer Actions
```
✅ Step 3: Approve/Reject Event ⭐ CRITICAL GATE
✅ Step 7: Conduct Weigh-In
✅ Step 8: Start Match
✅ Step 9: Record Results
✅ Step 10: Complete Match
```

### Club Manager Actions
```
✅ Step 5: Confirm/Reject Match Proposals
```

---

## ✅ Implementation Summary

### Files Updated
1. ✅ `/src/app/utils/improvedWorkflowValidation.ts`
   - Added `canKKFApproveEvent()` function
   - Updated `canCreateMatchForEvent()` to check `event.kkfStatus === "approved"`
   - Removed separate match approval step
   - Updated workflow step functions

2. ✅ `/CORRECTED_WORKFLOW_ORDER.md` (this document)

### Next Steps
- Update EventDetail.tsx to reflect corrected flow
- Update KKFWorkflow.tsx to approve events (not individual matches)
- Update mock data to show correct workflow
- Update all documentation

---

## 🧪 Testing the Corrected Flow

### Test Scenario: Complete Event Lifecycle
```
1. Create event (Draft)
2. Add sponsors
3. Submit to KKF → "Pending KKF Approval"
4. [As KKF] Approve event → "KKF Approved" ✅
5. [As Organizer] Create match proposal → "Proposed" ✅ Now allowed!
6. [As Clubs] Both clubs confirm → "Club Confirmed"
7. [As Organizer] Assign to event → "Assigned to Event"
8. [As KKF] Conduct weigh-in → "Weigh-In Complete" → "Ready to Fight"
9. [As Organizer] Start event → "In Progress"
10. [As KKF] Complete match → "Completed"
11. [As Organizer] Close event → "Closed"
```

### Test Validation: Should Block
```
✗ Try creating match before event submission
   → "Event must be submitted to KKF before creating matches"

✗ Try creating match while status = "Pending KKF Approval"
   → "Event must be KKF approved before creating matches"

✗ Try creating match when kkfStatus !== "approved"
   → "Event must be KKF approved before creating matches"
```

---

## 📝 Summary

The workflow has been corrected to ensure:

1. **Step 3: KKF approves the EVENT** before matches can be created
2. **Step 4: Match Creation** requires event to be KKF approved
3. **No separate match approval step** - event approval is sufficient
4. **Clear sequential flow** with proper validation at each step

This aligns with the real-world process where the federation approves the event first, then the organizer manages the fight card.

---

**Status**: ✅ **CORRECTED AND READY**  
**Version**: 2.1.0 (Corrected Order)  
**Last Updated**: March 20, 2026
