# KUN KHMER Digital Platform - Workflow Optimization Guide

## Overview

This guide documents the **workflow validation system**, **status-based action visibility**, and **audit log functionality** implemented for the KUN KHMER Digital Platform. These features enforce the 11-step Kun Khmer process flow and ensure data integrity throughout the event lifecycle.

---

## 🎯 Features Implemented

### 1. **Validation Rules System**
Comprehensive validation functions that enforce business logic at every workflow step.

**Location:** `/src/app/utils/workflowValidation.ts`

**Key Functions:**
- `canSubmitEventToKKF(event)` - Validates Step 2
- `canCreateMatchForEvent(event)` - Validates Step 3  
- `canAssignMatchToEvent(match)` - Validates Step 5
- `canStartEvent(event, matches)` - Validates event start
- `canCloseEvent(event, matches)` - Validates Step 11
- `canConductWeighIn(match)` - Validates Step 7
- `canRecordResults(match)` - Validates Step 9
- `canCompleteMatch(match)` - Validates Step 10

**Example Usage:**
```typescript
import { canSubmitEventToKKF } from '@/utils/workflowValidation';

const validation = canSubmitEventToKKF(event);
if (!validation.isValid) {
  toast.error(validation.message);
  return;
}

// Proceed with submission
event.status = "Pending KKF Approval";
```

---

### 2. **Status-Based Action Visibility**
Smart action button rendering based on event/match status and user permissions.

**Key Functions:**
- `getAvailableEventActions(event, matches, userRole, permissions)` - Returns array of valid actions
- `getAvailableMatchActions(match, permissions)` - Returns array of valid match actions

**Features:**
- ✅ Shows only relevant actions for current status
- ✅ Validates actions before display
- ✅ Enforces role-based permissions
- ✅ Provides validation messages for disabled actions

**Example:**
```typescript
import { getAvailableEventActions } from '@/utils/workflowValidation';

const availableActions = getAvailableEventActions(
  event, 
  matches, 
  userRole, 
  permissions
);

// Render action buttons
{availableActions.map(actionItem => (
  <button
    disabled={!actionItem.validation.isValid}
    title={actionItem.validation.message}
    onClick={() => handleAction(actionItem.action)}
  >
    {actionItem.label}
  </button>
))}
```

---

### 3. **Workflow Audit Log**
Complete history tracking for all status transitions with timestamps, users, and comments.

**Data Structure:**
```typescript
interface WorkflowHistoryEntry {
  status: string;
  timestamp: string;      // ISO 8601 format
  userId: string;
  userName: string;
  action: string;         // Human-readable action description
  comments?: string;      // Optional notes/reasons
}
```

**Component:** `WorkflowHistory`

**Location:** `/src/app/components/WorkflowHistory.tsx`

**Usage:**
```typescript
import { WorkflowHistory } from '@/components/WorkflowHistory';

<WorkflowHistory 
  history={event.workflowHistory}
  title="Event Workflow History"
  defaultExpanded={true}
/>
```

**Features:**
- ✅ Collapsible timeline view
- ✅ Color-coded status badges
- ✅ User attribution
- ✅ Timestamp display (ICT timezone)
- ✅ Comments/notes support

---

### 4. **Workflow Progress Tracker**
Visual indicator showing progress through the 11-step workflow.

**Component:** `WorkflowProgressTracker`

**Location:** `/src/app/components/WorkflowProgressTracker.tsx`

**Variants:**
- `horizontal` - Side-by-side step display (default)
- `vertical` - Stacked timeline view

**Usage:**
```typescript
import { WorkflowProgressTracker } from '@/components/WorkflowProgressTracker';

const steps = [
  { 
    id: "create", 
    label: "Event Created", 
    description: "Basic info captured",
    status: "completed" 
  },
  { 
    id: "submit", 
    label: "Submit to KKF", 
    status: "current" 
  },
  { 
    id: "approve", 
    label: "KKF Approval", 
    status: "pending" 
  }
];

<WorkflowProgressTracker 
  steps={steps}
  variant="horizontal"
  title="Event Workflow Progress"
/>
```

**Step Statuses:**
- `completed` - Green checkmark, step finished
- `current` - Blue pulsing, active step
- `pending` - Gray, not yet reached

---

### 5. **Validation Components**

#### ValidationSummary
Shows validation status for multiple requirements.

**Location:** `/src/app/components/ValidationSummary.tsx`

**Usage:**
```typescript
import { ValidationSummary } from '@/components/ValidationSummary';
import { canSubmitEventToKKF, canStartEvent } from '@/utils/workflowValidation';

<ValidationSummary 
  validations={[
    { 
      label: "Event can be submitted", 
      validation: canSubmitEventToKKF(event),
      required: true
    },
    { 
      label: "Has assigned matches", 
      validation: canStartEvent(event, matches),
      required: true
    }
  ]}
  title="Event Requirements"
/>
```

#### ValidationBadge
Inline validation status indicator.

**Location:** `/src/app/components/ValidationBadge.tsx`

**Usage:**
```typescript
import { ValidationBadge } from '@/components/ValidationBadge';

<ValidationBadge 
  validation={canSubmitEventToKKF(event)}
  showMessage={true}
  size="md"
/>
```

---

## 📋 Validation Rules Reference

### Event Validations

| Function | Requirements | Transition |
|----------|-------------|------------|
| `canSubmitEventToKKF` | Status = Draft, Has sponsors, Has basic info | Draft → Pending KKF Approval |
| `canCreateMatchForEvent` | Status ≠ Draft, Status ≠ Closed | - |
| `canStartEvent` | KKF approved, Has assigned matches | KKF Approved → In Progress |
| `canCloseEvent` | Status = In Progress/Approved, All matches complete | In Progress → Closed |

### Match Validations

| Function | Requirements | Transition |
|----------|-------------|------------|
| `canAssignMatchToEvent` | Both clubs confirmed | Club Confirmed → Assigned to Event |
| `canConductWeighIn` | Match assigned, Clubs confirmed | Assigned to Event → Weigh-In Complete |
| `canRecordResults` | Status = In Progress, Weigh-in complete | In Progress → Results Recorded |
| `canCompleteMatch` | Results recorded | Results Recorded → Completed |

---

## 🔄 Complete Workflow Flow

### Event Lifecycle
```
1. Draft (Created)
   ↓ canSubmitEventToKKF()
2. Pending KKF Approval (Submitted)
   ↓ KKF Review
3. KKF Approved (or Rejected)
   ↓ canStartEvent()
4. In Progress (Event running)
   ↓ canCloseEvent()
5. Closed (Archived)
```

### Match Lifecycle
```
1. Proposed (Created by organizer)
   ↓ Clubs notified
2. Pending Club Confirmation
   ↓ Both clubs accept
3. Club Confirmed
   ↓ canAssignMatchToEvent()
4. Assigned to Event
   ↓ canConductWeighIn()
5. Weigh-In Complete
   ↓ Final checks
6. Ready to Fight
   ↓ Match begins
7. In Progress
   ↓ canRecordResults()
8. Results Recorded
   ↓ canCompleteMatch()
9. Completed
```

---

## 🛠️ Implementation Examples

### Example 1: EventDetail Page with Validation

```typescript
import { useParams } from "react-router";
import { getAvailableEventActions, createWorkflowEntry } from '@/utils/workflowValidation';
import { WorkflowHistory } from '@/components/WorkflowHistory';
import { WorkflowProgressTracker } from '@/components/WorkflowProgressTracker';
import { toast } from 'sonner';

export function EventDetail() {
  const { id } = useParams();
  const event = MOCK_EVENTS.find(e => e.id === id);
  const matches = MOCK_MATCHES.filter(m => m.eventId === id);
  const permissions = usePermissions();

  // Get available actions
  const availableActions = getAvailableEventActions(
    event, 
    matches, 
    permissions.currentUser?.role, 
    permissions
  );

  const handleAction = (actionType, validation) => {
    if (!validation.isValid) {
      toast.error(validation.message);
      return;
    }

    switch (actionType) {
      case "submit_to_kkf":
        event.status = "Pending KKF Approval";
        event.kkfStatus = "pending";
        event.submittedDate = new Date().toISOString().split('T')[0];
        
        // Add workflow history
        event.workflowHistory.push(
          createWorkflowEntry(
            "Pending KKF Approval",
            currentUser.id,
            currentUser.fullName,
            "Submitted to KKF for approval"
          )
        );

        toast.success("Event submitted to KKF");
        break;

      case "close_event":
        event.status = "Closed";
        
        event.workflowHistory.push(
          createWorkflowEntry(
            "Closed",
            currentUser.id,
            currentUser.fullName,
            "Event closed - all matches completed"
          )
        );

        toast.success("Event closed successfully");
        break;
    }
  };

  return (
    <div>
      {/* Workflow Progress */}
      <WorkflowProgressTracker steps={getWorkflowSteps(event)} />

      {/* Available Actions */}
      <div>
        {availableActions.map(action => (
          <button
            key={action.action}
            disabled={!action.validation.isValid}
            onClick={() => handleAction(action.action, action.validation)}
          >
            {action.label}
          </button>
        ))}
      </div>

      {/* Workflow History */}
      <WorkflowHistory history={event.workflowHistory} />
    </div>
  );
}
```

### Example 2: Match Weigh-In with Validation

```typescript
import { canConductWeighIn, createWorkflowEntry } from '@/utils/workflowValidation';

function WeighInForm({ match }) {
  const validation = canConductWeighIn(match);

  if (!validation.isValid) {
    return (
      <Alert variant="error">
        {validation.message}
      </Alert>
    );
  }

  const handleSubmitWeighIn = (weighInData) => {
    match.weighInWeightA = weighInData.weightA;
    match.weighInWeightB = weighInData.weightB;
    match.weighInDate = new Date().toISOString().split('T')[0];
    match.weighInOfficer = currentUser.id;
    match.status = "Weigh-In Complete";

    // Add to workflow history
    match.workflowHistory.push(
      createWorkflowEntry(
        "Weigh-In Complete",
        currentUser.id,
        currentUser.fullName,
        "Weigh-in conducted successfully",
        `Fighter A: ${weighInData.weightA}kg, Fighter B: ${weighInData.weightB}kg`
      )
    );

    toast.success("Weigh-in recorded successfully");
  };

  return <WeighInFormFields onSubmit={handleSubmitWeighIn} />;
}
```

---

## 🔐 Role-Based Permissions

### Organizer Permissions
- ✅ Create events
- ✅ Submit to KKF (`events.submit`)
- ✅ Create matches (`matches.create`)
- ✅ Assign matches (`events.assign_matches`)
- ✅ Start event (`events.start`)
- ✅ Close event (`events.close`)

### KKF Officer Permissions
- ✅ Approve/reject events (`federation.approve_event`)
- ✅ Conduct weigh-ins (`federation.conduct_weighin`)
- ✅ Record results (`federation.enter_results`)
- ✅ Complete matches (`federation.complete_match`)

### Club Manager Permissions
- ✅ Confirm/reject match proposals (`club.respond_to_proposals`)

---

## 📊 Mock Data Structure

### Event with Workflow History
```typescript
{
  id: "e1",
  name: "Kun Khmer Championship 2026",
  status: "KKF Approved",
  kkfStatus: "approved",
  sponsors: ["Carabao", "Smart Axiata"],
  // ... other fields
  
  workflowHistory: [
    {
      status: "Draft",
      timestamp: "2026-03-01T10:00:00Z",
      userId: "u3",
      userName: "Organizer One",
      action: "Event created",
      comments: null
    },
    {
      status: "Pending KKF Approval",
      timestamp: "2026-03-08T14:30:00Z",
      userId: "u3",
      userName: "Organizer One",
      action: "Submitted to KKF for approval",
      comments: null
    },
    {
      status: "KKF Approved",
      timestamp: "2026-03-10T09:15:00Z",
      userId: "u2",
      userName: "KKF Officer",
      action: "Event approved by KKF",
      comments: "Event approved. Ensure all safety protocols."
    }
  ]
}
```

---

## 🎨 UI Components Summary

| Component | Purpose | Props |
|-----------|---------|-------|
| `WorkflowHistory` | Display audit timeline | `history`, `title`, `defaultExpanded` |
| `WorkflowProgressTracker` | Show workflow progress | `steps`, `variant`, `title` |
| `ValidationSummary` | Show multiple validation results | `validations`, `title` |
| `ValidationBadge` | Inline validation status | `validation`, `showMessage`, `size` |

---

## ✅ Testing Validation Rules

### Test Submit to KKF
```typescript
describe('canSubmitEventToKKF', () => {
  it('should fail if event is not Draft', () => {
    const event = { status: 'Pending KKF Approval', sponsors: ['A'] };
    const result = canSubmitEventToKKF(event);
    expect(result.isValid).toBe(false);
  });

  it('should fail if no sponsors', () => {
    const event = { status: 'Draft', sponsors: [] };
    const result = canSubmitEventToKKF(event);
    expect(result.isValid).toBe(false);
    expect(result.message).toContain('sponsor');
  });

  it('should pass with valid event', () => {
    const event = { 
      status: 'Draft', 
      sponsors: ['Carabao'],
      name: 'Test Event',
      location: 'Stadium',
      date: '2026-05-01'
    };
    const result = canSubmitEventToKKF(event);
    expect(result.isValid).toBe(true);
  });
});
```

---

## 🚀 Deployment Checklist

Before deploying workflow optimization features:

- [ ] All validation functions tested
- [ ] Workflow history properly initialized in existing data
- [ ] Permissions configured for all roles
- [ ] Toast notifications working
- [ ] Status transitions tested end-to-end
- [ ] Mobile responsiveness verified
- [ ] Accessibility tested (screen readers, keyboard navigation)

---

## 📝 Future Enhancements

1. **Email Notifications**
   - Send email when event submitted to KKF
   - Notify organizer when event approved/rejected
   - Alert clubs when matches proposed

2. **Advanced Analytics**
   - Average time from submission to approval
   - Most common rejection reasons
   - Workflow bottleneck identification

3. **Batch Operations**
   - Bulk approve events
   - Mass assign matches to event
   - Batch weigh-in entry

4. **Export Functionality**
   - Export workflow history as PDF
   - Generate compliance reports
   - Audit log CSV export

---

## 📞 Support

For questions or issues with the workflow system:
- Review validation rules: `/src/app/utils/workflowRules.md`
- Check component docs in respective files
- Test with mock data in `/src/app/data/mock.ts`

---

**Last Updated:** March 20, 2026
**Version:** 1.0.0
**Maintainer:** KUN KHMER Digital Platform Team
