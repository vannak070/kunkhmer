# KUN KHMER - Complete Roles & Permissions Guide

## 📋 Overview: 6-Role System

The KUN KHMER Digital Platform uses a **6-role system** that separates governance from execution, ensuring clear separation of duties and compliance.

---

## 🎭 The 6 Roles

```
👑 KKF Super Admin       → Full system control
🔍 KKF Auditor           → Governance (Approve/Reject)
⚙️ KKF Officer           → Execution (Assign/Manage/Results)
🎯 Organizer/Promoter    → Event/Match Creator
🏢 Club/Gym              → Fighter Management
🧑‍⚖️ Referee/Judge        → Official Match Roles
```

---

## 👑 1. KKF Super Admin

### Purpose
**Full system control under Kun Khmer Federation**

### Key Capabilities
- ✅ **Override everything** - Can override approvals, results, decisions
- ✅ **Manage users** - Create, edit, delete users and assign roles
- ✅ **Configure system** - Set eligibility rules, workflows, system settings
- ✅ **Full access** - All modules, all permissions

### Detailed Permissions

**Users & Roles**:
- Create/edit/delete users
- Manage roles and permissions
- Access user activity logs

**Events**:
- Create, edit, delete events
- Submit, approve, reject events
- Override event approvals
- Start and close events

**Fighters**:
- Create, edit, delete fighters
- Verify KYC, medical, eligibility
- Override fighter status

**Matches**:
- Create, edit, delete matches
- Approve, reject matches
- Override match approvals
- Assign to events

**Federation Operations**:
- All approval powers
- Assign all officials
- Conduct weigh-ins
- Enter and override results
- Complete matches

**System**:
- Configure eligibility rules
- Access audit logs
- Generate all reports
- Manage system settings

### Restrictions
❌ **None** - Has full system access

### Example Users
- System Administrator
- KKF Chairman
- Technical Director

---

## 🔍 2. KKF Auditor (Governance Role)

### Purpose
**Ensure compliance and approve requests - Governance oversight**

### Key Capabilities
- ✅ **Approve/Reject Events** - Review and approve/reject event submissions
- ✅ **Approve/Reject Matches** - Validate match cards
- ✅ **Approve/Reject Clubs** - Verify club legitimacy
- ✅ **Validate Fighters** - Check KYC, medical, eligibility
- ✅ **Add Comments** - Provide feedback and request revisions

### Detailed Permissions

**Approval Powers**:
- Approve/reject events (with comments)
- Approve/reject match cards
- Approve/reject club registrations
- Request revisions with detailed comments

**Validation**:
- Verify fighter KYC documentation
- Validate medical certificates
- Check eligibility rules compliance
- Add validation comments

**Monitoring**:
- View all events, matches, fighters, clubs
- Access audit logs
- Generate compliance reports

### Restrictions
❌ **Cannot Execute Operations**:
- ❌ Cannot assign judges/referees
- ❌ Cannot enter results
- ❌ Cannot conduct weigh-ins
- ❌ Cannot start/manage events

**Why This Separation?**
- Ensures checks and balances
- Prevents conflict of interest
- One person approves, another executes

### Example Users
- KKF Compliance Officer
- Governance Auditor
- Event Review Committee Member

---

## ⚙️ 3. KKF Officer (Execution Role)

### Purpose
**Handle operations AFTER approval - Execute approved plans**

### Key Capabilities
- ✅ **Assign Officials** - Assign judges and referees
- ✅ **Manage Weigh-Ins** - Conduct official weigh-in ceremonies
- ✅ **Monitor Matches** - Oversee match execution
- ✅ **Enter Results** - Record winners, methods, scores
- ✅ **Complete Matches** - Finalize and lock match results

### Detailed Permissions

**Official Assignments**:
- Assign judges to matches
- Assign referees to matches
- Manage official schedules

**Weigh-In Management**:
- Conduct weigh-in ceremonies
- Verify weights
- Confirm fighter readiness
- Mark matches as "Ready to Fight"

**Match Operations**:
- Start matches
- Monitor match progress
- Manage match schedule

**Results Management**:
- Enter match results
- Record winner, method, round, time
- Upload result attachments
- Update scorecards
- Declare official winner
- Complete and lock matches

**Event Operations**:
- Start events
- Monitor event progress

### Restrictions
❌ **Cannot Approve/Reject**:
- ❌ Cannot approve/reject events
- ❌ Cannot approve/reject matches
- ❌ Cannot approve/reject clubs
- ❌ Cannot override approvals

**Why This Separation?**
- Officers execute what Auditors approve
- Clear separation of governance and operations
- Prevents unilateral decision-making

### Example Users
- KKF Results Officer
- Weigh-In Coordinator
- Match Operations Manager

---

## 🎯 4. Organizer / Promoter

### Purpose
**Event and match creator - Build fight cards**

### Key Capabilities
- ✅ **Create Events** - Draft events and submit for approval
- ✅ **Build Fight Cards** - Create match proposals
- ✅ **Select Sponsors** - Add and manage sponsors
- ✅ **Manage Broadcasts** - Assign TV stations/streaming
- ✅ **Assign Fighters** - Propose fighters for matches

### Detailed Permissions

**Event Management**:
- Create events (Draft status)
- Edit own events (before approval)
- Delete own events (if Draft)
- Submit events to KKF for approval
- Start events (after approval)
- Close events (after completion)

**Match Management**:
- Create match proposals
- Edit own matches (before club confirmation)
- Delete own matches (if not confirmed)
- Propose matches to clubs
- Assign fighters to matches
- Assign matches to events

**Sponsors & Broadcast**:
- Create and edit sponsors
- Assign sponsors to events
- Create and edit broadcast details
- Assign TV stations/streaming

### Restrictions
❌ **Cannot Approve Anything**:
- ❌ Cannot approve events
- ❌ Cannot approve matches
- ❌ Cannot approve clubs
- ❌ Cannot enter results
- ❌ Cannot assign officials

**Workflow**:
1. Create event (Draft)
2. Submit to KKF
3. Wait for Auditor approval
4. Create matches (after approval)
5. Wait for club confirmations

### Example Users
- Event Promoters
- TV Stations (Bayon TV, Town Full HDTV)
- Fight Organizers

---

## 🏢 5. Club / Gym

### Purpose
**Manage fighters and confirm participation**

### Key Capabilities
- ✅ **Register Fighters** - Register both KKF and foreign fighters
- ✅ **Update Profiles** - Manage fighter information
- ✅ **Confirm Matches** - Accept or reject match proposals
- ✅ **Upload Documents** - Fighter KYC, medical certificates

### Detailed Permissions

**Fighter Management**:
- Create fighters (KKF fighters)
- Create foreign fighters
- Edit own fighters' profiles
- Update fighter information
- Upload fighter documents
- Manage fighter photos

**Match Participation**:
- View match proposals
- Confirm fighter participation
- Reject fighter participation
- Respond to organizer proposals

**Club Management**:
- View club information
- Edit own club details

### Restrictions
❌ **Cannot Create Events**:
- ❌ Cannot create events
- ❌ Cannot approve matches
- ❌ Cannot edit other clubs' fighters
- ❌ Cannot manage other clubs

**Workflow**:
1. Receive match proposal from organizer
2. Review fighter details
3. Confirm or reject participation
4. Prepare fighter for weigh-in

### Example Users
- Gym Managers
- Club Owners
- Fighter Coaches

---

## 🧑‍⚖️ 6. Referee / Judge (NEW Role)

### Purpose
**Official match roles - View assignments and submit scoring**

### Key Capabilities
- ✅ **View Assigned Matches** - See matches they're assigned to
- ✅ **View Event Schedule** - Check event timeline
- ✅ **Submit Scoring** - Enter round-by-round scores (if digital scoring enabled)
- ✅ **View Fighter Details** - Check fighter information

### Detailed Permissions

**View Access**:
- View assigned matches only
- View event schedule
- View fighter information
- View match details

**Optional: Digital Scoring**:
- Submit round scores
- View scorecard
- Update scoring in real-time

### Restrictions
❌ **Very Limited Access**:
- ❌ Cannot create matches
- ❌ Cannot approve anything
- ❌ Cannot enter final results (only scoring)
- ❌ Cannot view unassigned matches
- ❌ View-only for most content

**Why Needed?**
- Already assigned to matches in system
- Should be able to view their assignments
- Digital scoring capability (future feature)
- Better coordination and communication

### Example Users
- Certified Referees
- Certified Judges
- Ring Officials

---

## 🔄 Role Comparison Matrix

| Permission | Super Admin | Auditor | Officer | Organizer | Club | Ref/Judge |
|------------|-------------|---------|---------|-----------|------|-----------|
| **Create Events** | ✅ | ❌ | ❌ | ✅ | ❌ | ❌ |
| **Approve Events** | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |
| **Create Matches** | ✅ | ❌ | ❌ | ✅ | ❌ | ❌ |
| **Approve Matches** | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |
| **Assign Officials** | ✅ | ❌ | ✅ | ❌ | ❌ | ❌ |
| **Conduct Weigh-In** | ✅ | ❌ | ✅ | ❌ | ❌ | ❌ |
| **Enter Results** | ✅ | ❌ | ✅ | ❌ | ❌ | ❌ |
| **Register Fighters** | ✅ | ❌ | ❌ | ❌ | ✅ | ❌ |
| **Confirm Matches** | ✅ | ❌ | ❌ | ❌ | ✅ | ❌ |
| **Submit Scoring** | ✅ | ❌ | ❌ | ❌ | ❌ | ✅ |
| **Override Decisions** | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| **Access Audit Logs** | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |

---

## 🎯 Separation of Duties

### Why Split Auditor & Officer?

**Before (Old System)**:
```
KKF Officer → Approves events ✅
           → Assigns officials ✅
           → Enters results ✅
Problem: Too much power, potential conflict of interest
```

**After (New System)**:
```
KKF Auditor → Approves events ✅
              ❌ Cannot assign officials
              ❌ Cannot enter results

KKF Officer → ❌ Cannot approve events
            → Assigns officials ✅
            → Enters results ✅
```

**Benefits**:
- ✅ Checks and balances
- ✅ Prevents conflicts of interest
- ✅ Better compliance
- ✅ Clear responsibilities
- ✅ Audit trail integrity

---

## 📊 Complete Workflow with Roles

### Event Lifecycle

```
1. ORGANIZER creates event (Draft)
   ↓
2. ORGANIZER submits to KKF
   ↓
3. AUDITOR reviews event
   ↓
4. AUDITOR approves event ✅
   ↓
5. ORGANIZER creates matches
   ↓
6. CLUBS confirm fighters
   ↓
7. AUDITOR approves match card (optional)
   ↓
8. OFFICER assigns judges/referees
   ↓
9. OFFICER conducts weigh-in
   ↓
10. ORGANIZER starts event
    ↓
11. OFFICER starts matches
    ↓
12. REFEREE/JUDGE officiates
    ↓
13. OFFICER enters results
    ↓
14. OFFICER completes matches
    ↓
15. ORGANIZER closes event
```

### Key Decision Points

**Who Approves?**
- Events: **AUDITOR** (or SUPER ADMIN)
- Matches: **AUDITOR** (or SUPER ADMIN)
- Clubs: **AUDITOR** (or SUPER ADMIN)

**Who Executes?**
- Assign Officials: **OFFICER** (or SUPER ADMIN)
- Weigh-Ins: **OFFICER** (or SUPER ADMIN)
- Results: **OFFICER** (or SUPER ADMIN)

**Who Creates?**
- Events: **ORGANIZER** (or SUPER ADMIN)
- Matches: **ORGANIZER** (or SUPER ADMIN)
- Fighters: **CLUB** (or SUPER ADMIN)

---

## 🔐 Permission Groups

### Governance Permissions (Approve/Reject)
```typescript
'federation.approve_event'
'federation.reject_event'
'federation.approve_match'
'federation.reject_match'
'federation.approve_club'
'federation.reject_club'
'fighters.verify_kyc'
'fighters.verify_medical'
'fighters.check_eligibility'
```
**Who has?** Super Admin, Auditor

### Execution Permissions (Operations)
```typescript
'federation.assign_officials'
'federation.assign_judges'
'federation.assign_referees'
'federation.conduct_weighin'
'federation.start_match'
'federation.enter_results'
'federation.complete_match'
```
**Who has?** Super Admin, Officer

### Creation Permissions (Build)
```typescript
'events.create'
'matches.create'
'fighters.create'
'sponsors.create'
'broadcast.create'
```
**Who has?** Super Admin, Organizer, Club (fighters only)

### View-Only Permissions
```typescript
'matches.view_assigned'
'events.view_schedule'
'scoring.submit_round_score'
```
**Who has?** Referee/Judge

---

## 🎨 UI Role Badges

### Badge Colors

**👑 KKF Super Admin**  
Color: Purple (`bg-purple-100 text-purple-700 border-purple-300`)

**🔍 KKF Auditor**  
Color: Indigo (`bg-indigo-100 text-indigo-700 border-indigo-300`)

**⚙️ KKF Officer**  
Color: Red (`bg-red-100 text-[#C8102E] border-red-300`)

**🎯 Organizer**  
Color: Blue (`bg-blue-100 text-[#0A3D91] border-blue-300`)

**🏢 Club/Gym**  
Color: Amber (`bg-amber-100 text-amber-700 border-amber-300`)

**🧑‍⚖️ Referee/Judge**  
Color: Green (`bg-green-100 text-green-700 border-green-300`)

---

## 💻 Code Examples

### Check Permission

```tsx
import { hasPermission } from "../data/users";

// Check if user can approve events
if (hasPermission('federation.approve_event')) {
  // Show "Approve Event" button
}

// Check if user can enter results
if (hasPermission('federation.enter_results')) {
  // Show "Enter Results" form
}
```

### Get Role Capabilities

```tsx
import { getRoleCapabilities } from "../data/users";

const capabilities = getRoleCapabilities(user.role);

if (capabilities.canApprove) {
  // Show approval actions
}

if (capabilities.canExecute) {
  // Show execution actions
}
```

### Display Role Badge

```tsx
import { ROLE_LABELS } from "../data/users";

const roleInfo = ROLE_LABELS[user.role];

<div className={`px-3 py-1 rounded-lg ${roleInfo.color}`}>
  {roleInfo.label}
</div>
```

---

## 📋 Migration Notes

### From Old to New Roles

**Old `kkf_officer`** → Split into:
- `kkf_auditor` (if does approvals)
- `kkf_officer` (if does operations)

**Old `super_admin`** → Now `kkf_super_admin`

**New Role Added**:
- `referee_judge` (completely new)

### Update Existing Users

```typescript
// If user does approvals → Make them Auditor
if (user.permissions.includes('federation.approve_event')) {
  user.role = 'kkf_auditor';
}

// If user does operations → Make them Officer  
if (user.permissions.includes('federation.conduct_weighin')) {
  user.role = 'kkf_officer';
}
```

---

## ✅ Summary

### 6 Roles, Clear Responsibilities

1. **👑 Super Admin** - Full control, can override everything
2. **🔍 Auditor** - Approve/reject, ensure compliance
3. **⚙️ Officer** - Execute operations, manage matches
4. **🎯 Organizer** - Create events and matches
5. **🏢 Club** - Manage fighters
6. **🧑‍⚖️ Referee/Judge** - View assignments, submit scoring

### Key Principle

**Separation of Duties**:
- One role approves
- Another role executes
- Prevents conflicts of interest
- Ensures compliance

---

**Version**: 3.0.0  
**Last Updated**: March 20, 2026  
**Status**: ✅ Complete and Ready
