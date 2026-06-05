# Club / Gym Role – Complete Guide (v3.1)

## 🎯 Core Purpose

**The Club / Gym is the source of fighters** and responsible for:
- ✅ Fighter registration
- ✅ Fighter readiness validation
- ✅ Match confirmation/rejection
- ✅ Fighter ownership management

---

## 🥊 1. Club Main Responsibilities

### A. Fighter Management (Primary Role)

**Register Fighters**:
- **KKF Fighters** (local) → Requires approval from KKF Auditor
- **Foreign Fighters** → Requires passport validation + temporary KKF approval

**Maintain Fighter Profiles**:
- **KYC** (ID, nationality, date of birth)
- **Medical Records** (certificate, expiry date, fitness reports)
- **Fight History** (automatically tracked by system)

**👉 Important**:
- ✅ Club is the **owner** of fighter data
- ✅ **No fighter can exist without a club**
- ✅ Each fighter belongs to **1 club only**

---

### B. Fighter Validation (Before Any Match)

Before accepting a match, the club **MUST** ensure:

1. ✅ **Fighter is available** (not scheduled for another match)
2. ✅ **Fighter is fit** (medical certificate valid)
3. ✅ **Fighter agrees to fight** (consent obtained)
4. ✅ **No rest period** (30-day rest after last fight completed)
5. ✅ **No injuries** (cleared by medical team)

**👉 This aligns with real competition governance** where federations ensure safety and compliance.

---

### C. Match Confirmation (VERY IMPORTANT)

**When organizer creates a match**:

Club receives notification:
```
"Your fighter [Name] has been selected for a match"
- Event: [Event Name]
- Opponent: [Fighter Name] from [Club Name]
- Date: [Match Date]
- Weight Agreement: [Agreed Weight] kg
```

**Club MUST respond**:
- ✅ **Accept Match** → Fighter confirmed, match valid
- ❌ **Reject Match** → Fighter unavailable, match cancelled

**👉 Without club confirmation**: Match = **NOT VALID**

---

### D. Fighter Participation Control

**Track Fighter Status**:
- 🟢 **Available** - Ready to fight
- 🔵 **Scheduled** - Has upcoming match
- 🟡 **Resting** - In mandatory 30-day rest period
- 🟠 **Injured** - Recovering from injury
- 🔴 **Suspended** - Temporarily banned by KKF
- ⚫ **Not Eligible** - Medical expired or incomplete KYC
- ⚪ **Retired** - No longer active

**Monitor**:
- Upcoming fights calendar
- Rest period countdown
- Injury status updates
- Suspension history

---

## 🔐 2. Club Permissions (System-Level)

### ✅ Allowed Actions

**Fighter Management** (40+ permissions):
```typescript
// Basic CRUD
'fighters.view'
'fighters.create'
'fighters.edit_own'
'fighters.delete_own'
'fighters.register_kkf'
'fighters.register_foreign'
'fighters.update_profile'
'fighters.upload_documents'
'fighters.manage_kyc'
'fighters.manage_medical'
'fighters.view_fight_history'

// Validation (Before Match)
'fighters.check_availability'
'fighters.verify_fitness'
'fighters.confirm_agreement'
'fighters.validate_medical'
'fighters.check_rest_period'
'fighters.view_schedule'

// Participation Control
'fighters.approve_participation'
'fighters.reject_participation'
'fighters.track_upcoming_fights'
'fighters.track_rest_period'
'fighters.track_injuries'
'fighters.mark_unavailable'
'fighters.set_status'

// Ownership
'fighters.claim_ownership'
'fighters.verify_ownership'
```

**Match Participation**:
```typescript
'matches.view_proposals'
'matches.confirm_fighter'
'matches.reject_fighter'
'matches.respond_to_proposal'
'matches.accept_match'
'matches.reject_match'
'matches.view_fighter_schedule'
```

**View Access**:
```typescript
'events.view'
'matches.view'
'clubs.view'
'clubs.edit_own'
```

**Notifications**:
```typescript
'notifications.receive_match_proposal'
'notifications.receive_fighter_selected'
'notifications.receive_event_approved'
```

---

### ❌ Restrictions

**Cannot**:
- ❌ Create events
- ❌ Approve events or matches
- ❌ Assign judges/referees
- ❌ Update match results
- ❌ Edit other clubs' fighters
- ❌ Override KKF decisions

---

## 🔄 3. Club Workflow in System

### Complete Fighter-to-Match Flow

```
1. Club registers fighter
   ↓
2. KKF Auditor approves fighter (validates KYC + medical)
   ↓
3. Fighter status = "Available" 🟢
   ↓
4. Organizer creates event (gets KKF approval)
   ↓
5. Organizer selects fighter for match
   ↓
6. Club receives notification
   ↓
7. Club reviews match proposal:
   - Check opponent
   - Check date
   - Check weight agreement
   - Validate fighter eligibility
   ↓
8. Club decision:
   ✅ Accept → Fighter status = "Scheduled" 🔵
   ❌ Reject → Match cancelled, fighter remains "Available" 🟢
   ↓
9. Match confirmed in event
   ↓
10. Fighter prepares for weigh-in
```

---

## 🚨 4. Auto Block Rules (System-Level)

The system **automatically prevents** club from confirming match if:

### 🔥 A. Medical Expired
```
Error: "Medical certificate has expired"
Required Action: Upload new medical certificate
Can Override: ❌ NO
```

### 🔥 B. Fighter in Rest Period
```
Error: "Fighter is in mandatory rest period (15 days remaining)"
Required Action: Wait until [Date]
Can Override: ❌ NO
```

### 🔥 C. Fighter Already Scheduled
```
Error: "Fighter already has 1 scheduled match"
Required Action: Complete or cancel existing match first
Can Override: ❌ NO
```

### 🔥 D. Fighter Status Not "Available"
```
Error: "Fighter status is Injured"
Required Action: Update fighter status to Available
Can Override: ❌ NO
```

**👉 These rules ensure fighter safety and compliance**

---

## 🔥 5. Fighter Ownership Rule

### One Fighter = One Club

**Rule**: Each fighter must belong to **1 club only**

**System Validation**:
```typescript
// When club tries to register fighter
if (fighterExistsInAnotherClub) {
  return Error: "Fighter already belongs to [Club Name]. Transfer required."
}
```

**Fighter Transfer Process** (if needed):
1. Current club releases fighter
2. KKF approves transfer
3. New club claims ownership
4. Fighter records updated

**Prevent Duplicate Fighters**:
- ✅ Verify by passport/ID number
- ✅ Check national fighter registry
- ✅ Cross-reference with KKF database

---

## 🔥 6. Foreign Fighter Flow

### Special Requirements for Foreign Fighters

**Additional Validation**:
- ✅ Passport validation (number, expiry, country)
- ✅ Visa status (if applicable)
- ✅ Temporary KKF approval
- ✅ International federation clearance (if available)

**Registration Process**:
```
1. Club uploads passport + medical
   ↓
2. KKF Auditor validates documents
   ↓
3. KKF issues temporary approval (valid for event duration)
   ↓
4. Foreign fighter can compete
```

**Restrictions**:
- ❌ Cannot fight in national championships
- ✅ Can fight in international events
- ✅ Must have valid passport + medical

---

## 📱 7. Club Dashboard (UX Recommendations)

### 🔹 A. Dashboard Widgets

**Fighter Overview**:
```
┌─────────────────────────────────────┐
│ FIGHTERS OVERVIEW                   │
├─────────────────────────────────────┤
│ Total Fighters:        15           │
│ 🟢 Available:           8 (53%)     │
│ 🔵 Scheduled:           3 (20%)     │
│ 🟡 Resting:             2 (13%)     │
│ ⚫ Not Eligible:        2 (13%)     │
└─────────────────────────────────────┘
```

**Pending Actions**:
```
┌─────────────────────────────────────┐
│ PENDING MATCH PROPOSALS             │
├─────────────────────────────────────┤
│ 🔔 3 matches awaiting confirmation  │
│                                     │
│ [View All Proposals →]              │
└─────────────────────────────────────┘
```

**Upcoming Matches**:
```
┌─────────────────────────────────────┐
│ UPCOMING MATCHES                    │
├─────────────────────────────────────┤
│ Mar 25 - Pich Sophea vs Dara Vong  │
│ Mar 30 - Kimsan Heng vs Thai Pro   │
│                                     │
│ [View Schedule →]                   │
└─────────────────────────────────────┘
```

---

### 🔹 B. Match Confirmation Screen

**When club receives match proposal**:

```
┌──────────────────────────────────────────┐
│ 🔔 MATCH PROPOSAL RECEIVED               │
├──────────────────────────────────────────┤
│ Event: KUN KHMER Grand Championship      │
│ Date: March 25, 2026                     │
│ Venue: Olympic Stadium, Phnom Penh       │
│                                          │
│ YOUR FIGHTER:                            │
│ 👤 Pich Sophea                           │
│ 📊 Record: 15-3-0                        │
│ ⚖️ Weight: 67.5 kg                       │
│ 🟢 Status: Available                     │
│                                          │
│ OPPONENT:                                │
│ 👤 Dara Vong                             │
│ 🏢 Club: CAT Khmer Gym                   │
│ 📊 Record: 12-5-1                        │
│ ⚖️ Weight: 68.0 kg                       │
│                                          │
│ MATCH DETAILS:                           │
│ ⚖️ Agreed Weight: 68.0 kg max           │
│ ⏱️ Rounds: 5 rounds x 3 minutes         │
│                                          │
│ ELIGIBILITY CHECK:                       │
│ ✅ Fighter is available                  │
│ ✅ Medical valid until Apr 15, 2026      │
│ ✅ No rest period required               │
│ ✅ No scheduled matches                  │
│                                          │
│ [✅ ACCEPT MATCH]  [❌ REJECT MATCH]      │
└──────────────────────────────────────────┘
```

---

### 🔹 C. Fighter Status Management

**Fighter Profile Page**:

```
┌──────────────────────────────────────────┐
│ FIGHTER: Pich Sophea                     │
├──────────────────────────────────────────┤
│ Status: 🟢 Available                     │
│                                          │
│ Change Status:                           │
│ [ ] 🟢 Available                         │
│ [ ] 🟡 Resting (until [Date])            │
│ [ ] 🟠 Injured (add notes)               │
│ [ ] ⚫ Not Eligible (add reason)         │
│                                          │
│ [Update Status]                          │
└──────────────────────────────────────────┘
```

---

### 🔹 D. Notifications (Critical)

**Club receives real-time notifications for**:

1. **Fighter Selected for Match**
   ```
   🔔 Your fighter Pich Sophea has been selected 
      for a match at KUN KHMER Grand Championship
   
   [View Proposal →]
   ```

2. **Match Awaiting Confirmation**
   ```
   ⏰ Match proposal expires in 24 hours
      Fighter: Pich Sophea
      
   [Accept Now →]
   ```

3. **Event Approved by KKF**
   ```
   ✅ Event "KUN KHMER Grand Championship" approved
      Your fighters can now be selected
      
   [View Event →]
   ```

4. **Medical Certificate Expiring**
   ```
   ⚠️ Medical certificate for Kimsan Heng expires 
      in 15 days (Apr 15, 2026)
      
   [Upload New Certificate →]
   ```

5. **Rest Period Ending**
   ```
   ✅ Rest period for Dara Pov ending in 3 days
      Fighter will be available on Mar 23
      
   [View Fighter →]
   ```

---

## 💻 8. Code Implementation Examples

### Check Fighter Eligibility

```tsx
import { checkFighterEligibility, canAcceptMatch } from "../data/fighterStatuses";

const fighter = {
  status: 'available',
  medicalExpiryDate: '2026-04-15',
  lastFightDate: '2026-02-20',
  scheduledMatches: 0
};

// Get all blocks
const blocks = checkFighterEligibility(fighter);

// Check if can accept
const canFight = canAcceptMatch(fighter);

if (!canFight) {
  console.log("Cannot accept match:");
  blocks.forEach(block => {
    console.log(`- ${block.reason}`);
    console.log(`  Action: ${block.requiredAction}`);
  });
}
```

### Display Fighter Status Badge

```tsx
import { FighterStatusBadge } from "../components/FighterStatusBadge";

<FighterStatusBadge 
  status="available" 
  showIcon={true}
  size="md"
/>
```

### Show Eligibility Checker

```tsx
import { FighterEligibilityChecker } from "../components/FighterStatusBadge";

<FighterEligibilityChecker fighter={fighter} />
```

### Dashboard Summary

```tsx
import { 
  getFighterAvailabilityPercentage,
  FighterAvailabilitySummary 
} from "../data/fighterStatuses";

const fighters = getAllClubFighters();
const stats = getFighterAvailabilityPercentage(fighters);

<FighterAvailabilitySummary stats={stats} />
```

---

## 📊 9. Permission Examples

### Check if Club Can Perform Action

```tsx
import { hasPermission } from "../data/users";

// Can register fighter?
if (hasPermission('fighters.create')) {
  // Show "Register Fighter" button
}

// Can accept match?
if (hasPermission('matches.accept_match')) {
  // Show "Accept Match" button
}

// Can update fighter status?
if (hasPermission('fighters.set_status')) {
  // Show status dropdown
}
```

---

## 🎯 10. Complete Club User Story

### Example: Club Accepts Match

```
1. User: Club Manager (Pradal Khmer Gym)
   ↓
2. Login to system
   ↓
3. Dashboard shows: "🔔 1 new match proposal"
   ↓
4. Click notification → View match details:
   - Event: KUN KHMER Grand Championship
   - Fighter: Pich Sophea
   - Opponent: Dara Vong (CAT Khmer Gym)
   - Date: March 25, 2026
   - Weight: 68.0 kg
   ↓
5. System auto-checks eligibility:
   ✅ Fighter available
   ✅ Medical valid
   ✅ No rest period
   ✅ No conflicts
   ↓
6. Club reviews opponent stats
   ↓
7. Club clicks "✅ ACCEPT MATCH"
   ↓
8. System confirms:
   - Fighter status → "Scheduled" 🔵
   - Match status → "Confirmed"
   - Organizer notified
   ↓
9. Fighter appears in "Upcoming Matches"
   ↓
10. Club prepares fighter for weigh-in
```

---

## ✅ Summary: Club Capabilities

### What Clubs CAN Do (40+ permissions)

1. ✅ Register fighters (KKF + Foreign)
2. ✅ Manage fighter profiles
3. ✅ Upload KYC and medical documents
4. ✅ Set fighter status (Available, Resting, Injured, etc.)
5. ✅ Accept or reject match proposals
6. ✅ Track fighter schedules
7. ✅ Monitor rest periods
8. ✅ Validate fighter eligibility
9. ✅ Claim fighter ownership
10. ✅ Receive notifications

### What Clubs CANNOT Do

1. ❌ Create events
2. ❌ Approve events or matches
3. ❌ Edit other clubs' fighters
4. ❌ Assign judges/referees
5. ❌ Update match results
6. ❌ Override KKF decisions

---

## 📁 Files Reference

**Core Logic**:
- `/src/app/data/users.ts` - Club permissions (40+ permissions)
- `/src/app/data/fighterStatuses.ts` - Fighter status system + auto block rules

**UI Components**:
- `/src/app/components/FighterStatusBadge.tsx` - Status badges, eligibility checker

**Documentation**:
- `/CLUB_ROLE_COMPLETE_GUIDE.md` - This file (complete guide)
- `/ROLES_AND_PERMISSIONS_GUIDE.md` - All 6 roles overview

---

**Version**: 3.1.0  
**Last Updated**: March 20, 2026  
**Status**: ✅ Production Ready with Enhanced Club Capabilities
