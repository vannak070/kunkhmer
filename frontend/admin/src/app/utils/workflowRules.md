# KUN KHMER Workflow Validation Rules

This document outlines all validation rules implemented in the workflow system.

## Event Validation Rules

### 1. Submit Event to KKF (Step 2)
**Function:** `canSubmitEventToKKF(event)`

**Requirements:**
- Event status must be "Draft"
- Event must have at least one sponsor
- Event must have name, location, and date

**Status Transition:** Draft → Pending KKF Approval

---

### 2. Create Match for Event (Step 3)
**Function:** `canCreateMatchForEvent(event)`

**Requirements:**
- Event must NOT be in "Draft" status (must be submitted to KKF)
- Event must NOT be "Closed"

**Note:** Matches can only be created AFTER event is submitted to KKF

---

### 3. Assign Match to Event (Step 5)
**Function:** `canAssignMatchToEvent(match)`

**Requirements:**
- Both clubs must have confirmed the match (clubAResponse = "confirmed" AND clubBResponse = "confirmed")
- Match status must be "Club Confirmed" or "Pending Club Confirmation"

**Status Transition:** Club Confirmed → Assigned to Event

---

### 4. Start Event
**Function:** `canStartEvent(event, matches)`

**Requirements:**
- Event must be KKF approved (kkfStatus = "approved" AND status = "KKF Approved")
- Event must have at least one assigned match

**Status Transition:** KKF Approved → In Progress

---

### 5. Close Event (Step 11)
**Function:** `canCloseEvent(event, matches)`

**Requirements:**
- Event status must be "In Progress" OR "KKF Approved"
- Event must have at least one match
- ALL event matches must have status = "Completed"

**Status Transition:** In Progress → Closed

---

## Match Validation Rules

### 6. Conduct Weigh-In (Step 7)
**Function:** `canConductWeighIn(match)`

**Requirements:**
- Match must be "Assigned to Event" or "Club Confirmed"
- Both clubs must have confirmed fighters (clubAResponse = "confirmed" AND clubBResponse = "confirmed")

**Status Transition:** Assigned to Event → Weigh-In Complete

---

### 7. Record Results (Step 9)
**Function:** `canRecordResults(match)`

**Requirements:**
- Match status must be "In Progress" or "Ready to Fight"
- Weigh-in must be completed (weighInDate, weighInWeightA, weighInWeightB all populated)

**Status Transition:** In Progress → Results Recorded

---

### 8. Complete Match (Step 10)
**Function:** `canCompleteMatch(match)`

**Requirements:**
- Results must be recorded (result object exists)
- Match status must be "Results Recorded"

**Status Transition:** Results Recorded → Completed

---

## Helper Functions

### Get Available Event Actions
**Function:** `getAvailableEventActions(event, matches, userRole, permissions)`

**Returns:** Array of available actions with:
- action: Action identifier
- label: Display label
- icon: Lucide icon name
- color: Button color theme
- validation: ValidationResult object

**Example:**
```typescript
const actions = getAvailableEventActions(event, matches, "organizer", permissions);
// Returns: [
//   {
//     action: "submit_to_kkf",
//     label: "Submit to KKF",
//     icon: "Send",
//     color: "blue",
//     validation: { isValid: true }
//   }
// ]
```

---

### Get Available Match Actions
**Function:** `getAvailableMatchActions(match, permissions)`

**Returns:** Array of available actions for the match

---

### Create Workflow Entry
**Function:** `createWorkflowEntry(status, userId, userName, action, comments?)`

**Returns:** WorkflowHistoryEntry object

**Example:**
```typescript
const entry = createWorkflowEntry(
  "KKF Approved",
  "u2",
  "KKF Officer",
  "Event approved by KKF",
  "All requirements met"
);
```

---

## Usage Examples

### Example 1: Validate Before Submitting Event
```typescript
import { canSubmitEventToKKF } from '../utils/workflowValidation';

const validation = canSubmitEventToKKF(event);
if (validation.isValid) {
  // Submit event
  event.status = "Pending KKF Approval";
  toast.success("Event submitted successfully");
} else {
  toast.error(validation.message);
}
```

### Example 2: Show Available Actions on Page
```typescript
import { getAvailableEventActions } from '../utils/workflowValidation';

const availableActions = getAvailableEventActions(event, matches, userRole, permissions);

return (
  <div>
    {availableActions.map(actionItem => (
      <button
        key={actionItem.action}
        disabled={!actionItem.validation.isValid}
        onClick={() => handleAction(actionItem.action)}
        title={actionItem.validation.message}
      >
        {actionItem.label}
      </button>
    ))}
  </div>
);
```

### Example 3: Validate Match Actions
```typescript
import { canConductWeighIn, canRecordResults } from '../utils/workflowValidation';

// Check if weigh-in can be conducted
const weighInValidation = canConductWeighIn(match);
if (weighInValidation.isValid) {
  // Show weigh-in form
}

// Check if results can be recorded
const resultsValidation = canRecordResults(match);
if (!resultsValidation.isValid) {
  alert(resultsValidation.message);
}
```

---

## Status Flow Reference

### Event Status Flow
```
Draft
  ↓ (Submit to KKF)
Pending KKF Approval
  ↓ (KKF Approves)
KKF Approved
  ↓ (Start Event)
In Progress
  ↓ (Close Event)
Closed
```

### Match Status Flow
```
Proposed
  ↓ (Clubs notified)
Pending Club Confirmation
  ↓ (Both clubs confirm)
Club Confirmed
  ↓ (Organizer assigns)
Assigned to Event
  ↓ (KKF conducts weigh-in)
Weigh-In Complete
  ↓ (Final checks pass)
Ready to Fight
  ↓ (Match begins)
In Progress
  ↓ (KKF records results)
Results Recorded
  ↓ (KKF completes)
Completed
```

---

## Role-Based Permissions

### Organizer
- Create events
- Submit to KKF
- Create matches
- Assign matches to event
- Close event

### KKF Officer
- Approve/reject events
- Conduct weigh-ins
- Record results
- Complete matches

### Club Manager
- Confirm/reject match proposals

---

## Integration with UI Components

### WorkflowHistory Component
Displays audit log of all status transitions:
```typescript
<WorkflowHistory 
  history={event.workflowHistory} 
  defaultExpanded={true}
/>
```

### WorkflowProgressTracker Component
Shows visual progress through workflow:
```typescript
<WorkflowProgressTracker 
  steps={workflowSteps} 
  variant="horizontal"
  title="Event Workflow Progress"
/>
```

### ValidationSummary Component
Shows validation status for multiple requirements:
```typescript
<ValidationSummary 
  validations={[
    { label: "Has Sponsors", validation: canSubmitEventToKKF(event) },
    { label: "Has Matches", validation: { isValid: matches.length > 0 } }
  ]}
  title="Event Requirements"
/>
```

---

## Best Practices

1. **Always validate before state changes**
   - Check validation.isValid before updating status
   - Display validation.message to user if invalid

2. **Use workflow history**
   - Record all status transitions
   - Include userId, userName, and timestamp
   - Add comments for important decisions

3. **Show clear feedback**
   - Use toast notifications for success/error
   - Disable buttons when actions not available
   - Show tooltips explaining why actions are disabled

4. **Enforce role-based access**
   - Check permissions before showing actions
   - Validate permissions on backend
   - Use hasPermission() helper

5. **Keep UI in sync**
   - Refresh data after status changes
   - Update workflow history
   - Recalculate available actions
