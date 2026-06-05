# KUN KHMER Workflow - CORRECTED Visual Guide

## ✅ Corrected 11-Step Process Flow

```
┌─────────────────────────────────────────────────────────────┐
│            KUN KHMER WORKFLOW (CORRECTED ORDER)             │
│                      Version 2.1.0                          │
└─────────────────────────────────────────────────────────────┘

┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
┃ STEP 1: EVENT CREATION                                     ┃
┃ Who: Organizer                                             ┃
┃ Status: Draft                                              ┃
┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛
         │
         │ ✓ Add event details
         │ ✓ Add sponsors (required)
         │ ✓ Add TV station
         ▼
┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
┃ STEP 2: SUBMIT TO KKF                                      ┃
┃ Who: Organizer                                             ┃
┃ Status: Draft → Pending KKF Approval                       ┃
┃ Action: [Submit to KKF] button                             ┃
┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛
         │
         │ Organizer submits for review
         ▼
┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
┃ STEP 3: KKF REVIEW & APPROVAL ✅ (MUST COME FIRST)         ┃
┃ Who: KKF Officer                                           ┃
┃ Status: Pending KKF Approval → KKF Approved                ┃
┃ Action: Approve/Reject Event                               ┃
┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛
         │
         │ KKF reviews and approves EVENT
         ▼
    ┌─────────┐
    │KKF      │
    │Approved?│
    └─────────┘
         │
    Yes  │  No
    ┌────┴────┐
    │         │
    ▼         ▼
  Approve   Reject
    │         │
    │         └──> Event Rejected (organizer can edit and resubmit)
    │
    ▼
┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
┃ ✅ EVENT STATUS: KKF Approved                               ┃
┃ 🔓 GATE UNLOCKED: Now matches can be created!              ┃
┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛
         │
         ▼
┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
┃ STEP 4: MATCH CREATION (PROPOSAL)                          ┃
┃ Who: Organizer                                             ┃
┃ Requirement: Event kkfStatus === "approved" ⭐              ┃
┃ Status: Proposed                                           ┃
┃ Action: [Create Match Proposal] button                     ┃
┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛
         │
         │ Select Fighter A, Fighter B, agreed weight, rounds
         │ (Can create multiple matches)
         ▼
┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
┃ STEP 5: CLUB CONFIRMATION                                  ┃
┃ Who: Club Managers                                         ┃
┃ Status: Proposed → Pending Club Confirmation               ┃
┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛
         │
         │ Club A confirms?
         │ Club B confirms?
         ▼
    Both Confirm?
    ┌─────────┐
    │Yes │ No │
    └─────────┘
      │     │
      │     └──> Match Rejected (organizer can propose new match)
      ▼
┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
┃ MATCH STATUS: Club Confirmed                               ┃
┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛
         │
         ▼
┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
┃ STEP 6: ASSIGN MATCHES TO EVENT                            ┃
┃ Who: Organizer                                             ┃
┃ Status: Club Confirmed → Assigned to Event                 ┃
┃ Action: [Assign to Event] button                           ┃
┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛
         │
         │ Organizer adds match to fight card
         │ (No KKF match approval needed - event already approved)
         ▼
┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
┃ STEP 7: WEIGH-IN & FINAL CONFIRMATION                      ┃
┃ Who: KKF Officer                                           ┃
┃ Status: Assigned to Event → Weigh-In Complete              ┃
┃ Action: [Conduct Weigh-In] button                          ┃
┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛
         │
         │ Enter actual weights
         │ Verify within tolerance
         ▼
┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
┃ MATCH STATUS: Ready to Fight                               ┃
┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛
         │
         ▼
┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
┃ STEP 8: MATCH EXECUTION                                    ┃
┃ Who: Referee/Officials                                     ┃
┃ Status: Ready to Fight → In Progress                       ┃
┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛
         │
         │ Fight happens!
         │ Judges score rounds
         ▼
┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
┃ STEP 9: RESULT UPDATE                                      ┃
┃ Who: KKF Officer                                           ┃
┃ Status: In Progress → Results Recorded                     ┃
┃ Action: [Record Results] button                            ┃
┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛
         │
         │ Enter winner, method, round, time
         ▼
┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
┃ STEP 10: MATCH COMPLETION                                  ┃
┃ Who: KKF Officer                                           ┃
┃ Status: Results Recorded → Completed                       ┃
┃ Action: [Complete Match] button                            ┃
┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛
         │
         │ Match locked, cannot edit
         ▼
┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
┃ MATCH STATUS: Completed                                    ┃
┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛
         │
         │ (Repeat for all matches)
         ▼
    All matches complete?
    ┌─────────┐
    │Yes │ No │
    └─────────┘
      │     │
      │     └──> Wait for remaining matches
      ▼
┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
┃ STEP 11: EVENT CLOSURE                                     ┃
┃ Who: Organizer or KKF Officer                              ┃
┃ Status: In Progress → Closed                               ┃
┃ Action: [Close Event] button                               ┃
┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛
         │
         │ Event archived
         ▼
┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
┃ EVENT STATUS: Closed ✅                                     ┃
┃ Complete!                                                   ┃
┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛
```

---

## 🎯 Critical Gate: Step 3

```
┌──────────────────────────────────────────────────────────┐
│                    CRITICAL GATE                         │
│                                                          │
│  STEP 3: KKF Review & Approval ✅                        │
│                                                          │
│  This step MUST complete before Step 4 (Match Creation) │
│                                                          │
│  ❌ BLOCKS:                                              │
│     - Cannot create matches                              │
│     - Cannot assign matches                              │
│     - Cannot proceed with event                          │
│                                                          │
│  ✅ UNLOCKS:                                             │
│     - Match creation allowed                             │
│     - Full event management                              │
│     - Fight card building                                │
└──────────────────────────────────────────────────────────┘
```

---

## 🔄 Status Transitions (Corrected)

### Event Lifecycle
```
Draft
  ↓ (Step 2: Submit)
Pending KKF Approval
  ↓ (Step 3: KKF Approves) ⭐ CRITICAL GATE
KKF Approved
  ↓ (Matches created, assigned, weighed in)
In Progress (Step 8: Event starts)
  ↓ (All matches completed)
Closed (Step 11)
```

### Match Lifecycle
```
[EVENT MUST BE KKF APPROVED FIRST]
  ↓
Proposed (Step 4)
  ↓
Pending Club Confirmation (Step 5)
  ↓
Club Confirmed (Step 5)
  ↓
Assigned to Event (Step 6)
  ↓
Weigh-In Complete (Step 7)
  ↓
Ready to Fight (Step 7)
  ↓
In Progress (Step 8)
  ↓
Results Recorded (Step 9)
  ↓
Completed (Step 10)
```

---

## ⚡ Key Validation Rules

### Step 3 → Step 4 Gate
```typescript
// In canCreateMatchForEvent():

✓ Check 1: Event not Draft
   if (event.status === "Draft") {
     return "Event must be submitted to KKF (Step 2)"
   }

✓ Check 2: Event not Pending
   if (event.status === "Pending KKF Approval") {
     return "Event must be KKF approved (Step 3)"
   }

✓ Check 3: KKF Status is Approved ⭐ CRITICAL
   if (event.kkfStatus !== "approved") {
     return "Event must be KKF approved before creating matches"
   }
```

---

## 📊 Workflow Progress Tracker

```
Step 1    Step 2    Step 3    Step 4    Step 5    Step 6    ...
Event → Submit → KKF ✅ → Match → Club  → Assign → ...
Create   to KKF   Approve  Create Confirm  Event

  ✅  →   ✅  →   🔵  →   🔒  →   🔒  →   🔒
Done     Done   Current Locked Locked Locked
                        ↑
                  CRITICAL GATE
           Must complete before proceeding
```

---

## 🔐 Role-Based Actions (Corrected)

### Organizer Journey
```
1. Create Event (Draft)
2. Add sponsors, TV station
3. Submit to KKF
   [⏳ Wait for KKF approval]
4. Create match proposals (after approval)
5. Assign confirmed matches
6. Start event
7. Close event
```

### KKF Officer Journey
```
1. Review submitted event
2. Approve/Reject event ⭐ CRITICAL DECISION
   [If approved, organizer can create matches]
3. Conduct weigh-ins
4. Start matches
5. Record results
6. Complete matches
```

### Club Manager Journey
```
1. Receive match proposals (after event KKF approved)
2. Review fighter details
3. Confirm/Reject matches
```

---

## 🆚 Before vs After

### ❌ BEFORE (Incorrect)
```
Step 2: Submit to KKF
Step 3: Match Creation ← WRONG! Too early!
Step 4: Club Confirmation
Step 5: Assign to Event
Step 6: KKF Approve Match ← Unnecessary extra step
Step 7: Weigh-In
```

### ✅ AFTER (Correct)
```
Step 2: Submit to KKF
Step 3: KKF Approve Event ✅ ← Event approval FIRST
Step 4: Match Creation ← Now allowed
Step 5: Club Confirmation
Step 6: Assign to Event
Step 7: Weigh-In ← No separate match approval
```

---

## 📝 Quick Reference

| Step | Who | What | Requires | Output |
|------|-----|------|----------|--------|
| 1 | Organizer | Create event | - | Draft event |
| 2 | Organizer | Submit to KKF | Sponsors + TV | Pending KKF Approval |
| **3** | **KKF** | **Approve event ✅** | **Complete event info** | **KKF Approved** |
| 4 | Organizer | Create matches | **Event KKF approved** ⭐ | Proposed matches |
| 5 | Clubs | Confirm matches | Both clubs agree | Club Confirmed |
| 6 | Organizer | Assign to event | Club confirmed | Assigned to Event |
| 7 | KKF | Conduct weigh-in | Match assigned | Ready to Fight |
| 8 | Officials | Run match | Weigh-in complete | In Progress |
| 9 | KKF | Record results | Match finished | Results Recorded |
| 10 | KKF | Complete match | Results entered | Completed |
| 11 | Organizer/KKF | Close event | All matches done | Closed |

---

## ✅ Validation Checklist

Before creating a match, verify:
- [ ] Event status is NOT "Draft"
- [ ] Event status is NOT "Pending KKF Approval"
- [ ] Event `kkfStatus === "approved"` ⭐ **CRITICAL**
- [ ] Event is NOT "Closed"

If all checks pass → ✅ Match creation allowed  
If any check fails → ❌ Match creation blocked

---

**Status**: ✅ **CORRECTED**  
**Version**: 2.1.0  
**Critical Change**: KKF approves EVENT (Step 3) before matches can be created (Step 4)  
**Last Updated**: March 20, 2026
