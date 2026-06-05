# KUN KHMER Digital Platform - Improved 11-Step Workflow

## ✨ Overview

The workflow has been completely improved to align with the exact 11-step Kun Khmer process flow, with clear separation between **Event Approval** (Step 2) and **Match Approval** (Step 6).

---

## 📋 Complete 11-Step Workflow

### **STEP 1: Event Creation**
**Who**: Organizer  
**Action**: Create event with basic information  
**Required Data**:
- Event name
- Location
- Date
- TV Station/Broadcaster

**Validation Function**: `canCreateEvent(eventData)`

**Status**: `Draft`

**UI**: Event creation form

---

### **STEP 2: Submit Event to KKF**
**Who**: Organizer  
**Action**: Submit event to KKF Federation for approval  
**Required Data**:
- ✅ At least 1 sponsor
- ✅ Complete event information
- ✅ TV station confirmed

**Validation Function**: `canSubmitEventToKKF(event)`

**Status Transition**: `Draft` → `Pending KKF Approval`

**Validation Rules**:
```typescript
✓ Event status must be "Draft"
✓ Must have at least one sponsor
✓ Must have name, location, date
✓ Must have TV station/broadcaster
```

**UI**: "Submit to KKF" button on EventDetail page

**Workflow History Entry**:
```
"Event submitted to KKF for approval (Step 2)"
"Event submitted with X sponsor(s)"
```

---

### **STEP 3: Match Creation (Proposal)**
**Who**: Organizer  
**Action**: Create match proposals AFTER event submitted to KKF  
**Required Data**:
- Fighter A
- Fighter B
- Agreed weight
- Number of rounds

**Validation Function**: `canCreateMatchForEvent(event)`

**Match Status**: `Proposed`

**Validation Rules**:
```typescript
✓ Event must NOT be in "Draft" status
✓ Event must be submitted to KKF
✓ Event must NOT be "Closed"
```

**Important**: Matches can ONLY be created AFTER event is submitted to KKF (Step 2 complete)

**UI**: "Create Match Proposal" button (only visible after submission)

---

### **STEP 4: Club Confirmation**
**Who**: Club Managers  
**Action**: Both clubs confirm or reject match proposal  
**Required Data**:
- Club A response (confirmed/rejected)
- Club B response (confirmed/rejected)

**Validation Function**: `areClubsConfirmed(match)`

**Status Transition**: `Proposed` → `Pending Club Confirmation` → `Club Confirmed`

**Validation Rules**:
```typescript
✓ clubAResponse must be "confirmed"
✓ clubBResponse must be "confirmed"
```

**UI**: Club confirmation interface on match proposals page

---

### **STEP 5: Assign Matches to Event**
**Who**: Organizer  
**Action**: Organizer assigns club-confirmed matches to event fight card  
**Required Data**:
- Match must be club-confirmed
- Event must be valid

**Validation Function**: `canAssignMatchToEvent(match, event)`

**Status Transition**: `Club Confirmed` → `Assigned to Event`

**Validation Rules**:
```typescript
✓ Both clubs must have confirmed
✓ Match status must be "Club Confirmed"
✓ Event must NOT be "Closed"
✓ Event must NOT be "Draft"
```

**UI**: "Assign to Event" button on EventDetail or Matches page

**Workflow History Entry**:
```
"Assigned to [Event Name] (Step 5)"
```

---

### **STEP 6: KKF Review & Approval on the Match** 🆕
**Who**: KKF Officer  
**Action**: **KKF reviews and approves individual matches**  
**Required Data**:
- Match must be assigned to event
- Both clubs must be confirmed

**Validation Function**: `canKKFApproveMatch(match)`

**Status Transition**: `Assigned to Event` → `KKF Approved`

**Validation Rules**:
```typescript
✓ Match status must be "Assigned to Event"
✓ Match must have eventId
✓ Both clubs must be confirmed
```

**Important**: This is SEPARATE from event approval (Step 2). KKF approves the event in Step 2, then approves each individual match in Step 6.

**UI**: "KKF Approve Match" button on match detail page (KKF officers only)

**Workflow History Entry**:
```
"Match approved by KKF (Step 6)"
"Match reviewed and approved for competition"
```

**New Fields Added**:
```typescript
kkfApprovedDate: string
kkfApprovedBy: string
kkfMatchComments?: string
```

---

### **STEP 7: Weigh-In & Final Confirmation**
**Who**: KKF Officer  
**Action**: Conduct official weigh-in ceremony  
**Required Data**:
- Fighter A actual weight
- Fighter B actual weight

**Validation Function**: `canConductWeighIn(match)`

**Status Transition**: `KKF Approved` → `Weigh-In Complete` → `Ready to Fight`

**Validation Rules**:
```typescript
✓ Match status must be "KKF Approved"
✓ Match must be assigned to an event
✓ Both clubs must be confirmed
```

**UI**: Weigh-in form on match detail page (KKF officers only)

**Workflow History Entries**:
```
"Weigh-in conducted successfully (Step 7)"
"Fighter A: 65.9kg, Fighter B: 65.8kg"
---
"Match cleared for competition (Step 7)"
```

---

### **STEP 8: Match Execution**
**Who**: KKF Officer/Referee  
**Action**: Match begins and is in progress  
**Required Data**:
- Weigh-in must be complete

**Validation Function**: `canStartMatch(match)`

**Status Transition**: `Ready to Fight` → `In Progress`

**Validation Rules**:
```typescript
✓ Match status must be "Ready to Fight"
✓ Weigh-in must be completed (weighInDate, weighInWeightA, weighInWeightB)
```

**UI**: Live scoring interface

**Workflow History Entry**:
```
"Match started (Step 8)"
```

---

### **STEP 9: Result Update**
**Who**: KKF Officer  
**Action**: Record official match results  
**Required Data**:
- Winner
- Winning method (KO, Decision, etc.)
- Round (if applicable)
- Time (if applicable)
- Judges' scores

**Validation Function**: `canRecordResults(match)`

**Status Transition**: `In Progress` → `Results Recorded`

**Validation Rules**:
```typescript
✓ Match status must be "In Progress"
✓ Weigh-in must be completed
```

**UI**: Result entry form on match detail page

**Workflow History Entry**:
```
"Results recorded (Step 9)"
"Winner: [Fighter Name] by [Method]"
```

---

### **STEP 10: Match Completion**
**Who**: KKF Officer  
**Action**: Finalize and lock match results  
**Required Data**:
- Results must be recorded

**Validation Function**: `canCompleteMatch(match)`

**Status Transition**: `Results Recorded` → `Completed`

**Validation Rules**:
```typescript
✓ Match status must be "Results Recorded"
✓ Match must have result object
✓ Result must have winner
✓ Result must have method
```

**UI**: "Complete Match" button on match detail page

**Workflow History Entry**:
```
"Match completed and locked (Step 10)"
```

---

### **STEP 11: Event Closure**
**Who**: Organizer or KKF Officer  
**Action**: Officially close event after all matches completed  
**Required Data**:
- All matches must be completed

**Validation Function**: `canCloseEvent(event, matches)`

**Status Transition**: `In Progress` → `Closed`

**Validation Rules**:
```typescript
✓ Event status must be "In Progress" or "KKF Approved"
✓ Event must have at least one match
✓ ALL matches must have status "Completed"
```

**UI**: "Close Event" button on EventDetail page

**Workflow History Entry**:
```
"Event closed - all matches completed (Step 11)"
"Event successfully concluded with X match(es)"
```

---

## 🔄 Complete Status Flow

### Event Status Flow
```
Step 1: Draft (Created)
         ↓
Step 2: Pending KKF Approval (Submitted)
         ↓
        KKF Approved (or Rejected)
         ↓
Step 8: In Progress (Event running)
         ↓
Step 11: Closed (Archived)
```

### Match Status Flow
```
Step 3: Proposed (Created by organizer)
         ↓
Step 4: Pending Club Confirmation
         ↓
Step 4: Club Confirmed (Both clubs accepted)
         ↓
Step 5: Assigned to Event
         ↓
Step 6: KKF Approved ⭐ NEW STEP
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

## 🎯 Key Improvements

### 1. **Separate Event and Match Approval**
- **Step 2**: KKF approves the EVENT (can it happen?)
- **Step 6**: KKF approves each MATCH (is this specific bout safe and fair?)

### 2. **Enforced Sequential Flow**
- Cannot create matches until event submitted (Step 2 → Step 3)
- Cannot assign until clubs confirm (Step 4 → Step 5)
- Cannot weigh-in until KKF approves match (Step 6 → Step 7)

### 3. **Clear Validation at Each Step**
- Every step has dedicated validation function
- Helpful error messages explain requirements
- UI only shows valid actions

### 4. **Complete Audit Trail**
- Every status change logged
- User attribution (who did it)
- Timestamps (when it happened)
- Comments/notes (why it happened)

### 5. **Visual Progress Tracking**
- 11-step progress tracker on event pages
- Color-coded status indicators
- Current step clearly marked

---

## 📊 Implementation Files

### Core Logic
- `/src/app/utils/improvedWorkflowValidation.ts` - All validation functions
- `/src/app/pages/EventDetail.tsx` - Event workflow UI with Submit/Close buttons
- `/src/app/components/WorkflowProgressTracker.tsx` - Visual progress indicator
- `/src/app/components/WorkflowHistory.tsx` - Audit log display

### Helper Functions
```typescript
// Event Actions
getAvailableEventActions(event, matches, userRole, permissions)
getEventWorkflowSteps(event, matches)
canSubmitEventToKKF(event)
canCreateMatchForEvent(event)
canStartEvent(event, matches)
canCloseEvent(event, matches)

// Match Actions
getAvailableMatchActions(match, permissions)
getMatchWorkflowSteps(match)
canAssignMatchToEvent(match, event)
canKKFApproveMatch(match)  // NEW
canConductWeighIn(match)
canStartMatch(match)
canRecordResults(match)
canCompleteMatch(match)

// Utility
createWorkflowEntry(status, userId, userName, action, comments)
```

---

## 🎨 UI Components

### EventDetail Page
**Displays**:
- 11-step workflow progress tracker
- Available actions based on status
- Fight card with matches
- Workflow history timeline

**Actions Available**:
- **Submit to KKF** (Step 2) - If status = Draft
- **Create Match Proposal** (Step 3) - After submission
- **Start Event** (Step 8) - When KKF approved
- **Close Event** (Step 11) - When all matches complete

### Match Detail Page
**Displays**:
- Match workflow progress (8 steps)
- Match-specific actions
- Workflow history

**Actions Available**:
- **KKF Approve Match** (Step 6) - If assigned to event
- **Conduct Weigh-In** (Step 7) - If KKF approved
- **Start Match** (Step 8) - If ready to fight
- **Record Results** (Step 9) - If in progress
- **Complete Match** (Step 10) - If results recorded

---

## ✅ Testing the Workflow

### Test Scenario 1: Complete Event Lifecycle
```
1. Create event (Draft)
2. Add sponsors
3. Submit to KKF → "Pending KKF Approval"
4. KKF approves event → "KKF Approved"
5. Create match proposal → "Proposed"
6. Both clubs confirm → "Club Confirmed"
7. Assign to event → "Assigned to Event"
8. KKF approves match → "KKF Approved"
9. Conduct weigh-in → "Weigh-In Complete" → "Ready to Fight"
10. Start event → "In Progress"
11. Complete match → "Completed"
12. Close event → "Closed"
```

### Test Scenario 2: Validation Blocks
```
✗ Cannot submit event without sponsors
✗ Cannot create match before event submission
✗ Cannot assign match before club confirmation
✗ Cannot conduct weigh-in before KKF match approval
✗ Cannot close event with incomplete matches
```

---

## 📱 User Experience Flow

### Organizer Workflow
```
1. Create Event → Add Details
2. Click "Submit to KKF" → Wait for approval
3. [Event Approved] → Click "Create Match Proposal"
4. Wait for clubs to confirm
5. Click "Assign to Event" for confirmed matches
6. Wait for KKF to approve matches
7. Click "Start Event" on event day
8. Wait for matches to complete
9. Click "Close Event" when all done
```

### KKF Officer Workflow
```
1. Review submitted events → Approve/Reject
2. Review assigned matches → Approve/Reject (Step 6)
3. Conduct weigh-ins → Enter weights
4. Record match results → Enter winner/method
5. Complete matches → Lock results
```

### Club Manager Workflow
```
1. Receive match proposal notification
2. Review fighter details
3. Confirm or reject match
```

---

## 🚀 Benefits

1. **Data Integrity**: Enforced sequential workflow prevents invalid states
2. **Transparency**: Complete audit trail for compliance
3. **Clarity**: Clear separation of Event vs Match approval
4. **Safety**: KKF reviews each match individually before allowing competition
5. **User Experience**: Only shows available/valid actions at each step

---

## 📝 Next Steps

1. **Email Notifications**: Notify users at each step
2. **Mobile Optimization**: Ensure workflow works on mobile devices
3. **Batch Operations**: Approve multiple matches at once
4. **Analytics**: Track average time per step
5. **Export**: Generate workflow reports

---

**Last Updated**: March 20, 2026  
**Version**: 2.0.0 (Improved 11-Step Flow)  
**Status**: ✅ Implemented and Ready for Testing
