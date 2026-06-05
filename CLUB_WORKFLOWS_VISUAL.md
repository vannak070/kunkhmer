# Club Role - Visual Workflows v3.2

## 🔄 Complete Workflow Diagrams

---

## 1️⃣ Fighter Registration & Approval Workflow

```
┌─────────────────────────────────────────────────────────────────┐
│ CLUB: Register New Fighter                                      │
└─────────────────────────────────────────────────────────────────┘
                          ↓
         Upload: Name, Photo, KYC, Medical Certificate
                          ↓
┌─────────────────────────────────────────────────────────────────┐
│ STATUS: ⏳ Pending Approval                                      │
│ Fighter CANNOT be selected for matches                          │
└─────────────────────────────────────────────────────────────────┘
                          ↓
         🔔 Notification sent to KKF Auditor
                          ↓
┌─────────────────────────────────────────────────────────────────┐
│ KKF AUDITOR: Review Registration                                │
│ • Validate KYC documents                                        │
│ • Check medical certificate (not expired)                       │
│ • Verify eligibility                                            │
└─────────────────────────────────────────────────────────────────┘
                          ↓
         ┌────────────────┴────────────────┐
         │                                  │
         ↓                                  ↓
┌──────────────────┐              ┌──────────────────┐
│ ✅ APPROVE       │              │ ❌ REJECT        │
└──────────────────┘              └──────────────────┘
         │                                  │
         ↓                                  ↓
┌──────────────────┐              ┌──────────────────┐
│ STATUS: Approved │              │ STATUS: Rejected │
│ Can fight! ✅    │              │ Needs revision   │
└──────────────────┘              └──────────────────┘
         │                                  │
         ↓                                  ↓
Fighter available                   Club receives:
for match                          • Rejection reason
selection                          • Required actions
                                           │
                                           ↓
                                   Club updates fighter
                                           │
                                           ↓
                                   Resubmit → Pending
```

---

## 2️⃣ Match Proposal & Confirmation Workflow

```
┌─────────────────────────────────────────────────────────────────┐
│ ORGANIZER: Create Match                                         │
│ • Select Event (must be Approved ✅)                            │
│ • Select Fighter A                                              │
│ • Select Fighter B                                              │
│ • Set weight agreement                                          │
└─────────────────────────────────────────────────────────────────┘
                          ↓
         System checks Fighter eligibility:
         ✅ Approval status = Approved
         ✅ Fighter status = Available
         ✅ Medical valid
         ✅ No rest period
                          ↓
┌─────────────────────────────────────────────────────────────────┐
│ MATCH STATUS: Proposed                                          │
│ Waiting for BOTH clubs to confirm                               │
└─────────────────────────────────────────────────────────────────┘
                          ↓
         🔔 Notifications sent to BOTH clubs
                          ↓
┌─────────────────────────────────────────────────────────────────┐
│ CLUB A: Review Match Proposal                                   │
│ • View opponent details                                         │
│ • Check weight agreement                                        │
│ • Verify fighter availability                                   │
│ Decision: ✅ Accept OR ❌ Reject                                │
└─────────────────────────────────────────────────────────────────┘
         │                                  
         ├─── ✅ ACCEPT ───┐                
         │                 │                
         └─── ❌ REJECT ───┼──→ Match Cancelled
                           │
┌──────────────────────────┘
│ CLUB B: Review Match Proposal
│ Decision: ✅ Accept OR ❌ Reject
└──────────────────────────┐
                           │
         ┌─────────────────┴─────────────────┐
         │                                    │
         ↓                                    ↓
  ✅ BOTH Accept                      ❌ One Rejects
         │                                    │
         ↓                                    ↓
┌──────────────────┐              ┌──────────────────┐
│ MATCH: Confirmed │              │ MATCH: Cancelled │
│ Fighters:        │              │ Back to proposal │
│ • Status → 🔵    │              └──────────────────┘
│   Scheduled      │
└──────────────────┘
         │
         ↓
Match added to event
Fighters prepare for weigh-in
```

---

## 3️⃣ Fighter Status Lifecycle

```
┌─────────────────────────────────────────────────────────────────┐
│ FIGHTER REGISTERED                                               │
│ Initial Status: ⏳ Pending Approval                             │
└─────────────────────────────────────────────────────────────────┘
                          ↓
                  KKF Approves ✅
                          ↓
┌─────────────────────────────────────────────────────────────────┐
│ STATUS: 🟢 AVAILABLE                                            │
│ • Can be selected for matches                                   │
│ • Medical valid                                                 │
│ • No rest period                                                │
│ • Not injured                                                   │
└─────────────────────────────────────────────────────────────────┘
         │
         │ Club accepts match proposal
         ↓
┌─────────────────────────────────────────────────────────────────┐
│ STATUS: 🔵 SCHEDULED                                            │
│ • Has upcoming match confirmed                                  │
│ • Cannot accept new matches                                     │
│ • Preparing for weigh-in                                        │
└─────────────────────────────────────────────────────────────────┘
         │
         │ Match completes
         ↓
┌─────────────────────────────────────────────────────────────────┐
│ STATUS: 🟡 RESTING                                              │
│ • Mandatory 30-day rest period                                  │
│ • Cannot fight until rest ends                                  │
│ • System blocks match proposals                                 │
└─────────────────────────────────────────────────────────────────┘
         │
         │ 30 days pass OR Club marks as recovered
         ↓
┌─────────────────────────────────────────────────────────────────┐
│ STATUS: 🟢 AVAILABLE                                            │
│ • Ready to fight again                                          │
└─────────────────────────────────────────────────────────────────┘

         ┌─────────── Other Status Changes ────────────┐
         │                                              │
         │ Club marks injured                           │
         ↓                                              │
┌──────────────────┐                                    │
│ 🟠 INJURED       │ ← Club updates when fighter        │
│ • Recovering     │   injured in training              │
└──────────────────┘                                    │
         │                                              │
         │ Medical clearance received                   │
         ↓                                              │
    🟢 Available                                        │
                                                        │
         │                                              │
         │ Medical expires                              │
         ↓                                              │
┌──────────────────┐                                    │
│ ⚫ NOT ELIGIBLE  │ ← Auto-set when medical            │
│ • Medical expired│   certificate expires              │
└──────────────────┘                                    │
         │                                              │
         │ Upload new medical                           │
         ↓                                              │
    🟢 Available                                        │
```

---

## 4️⃣ Championship Award Workflow

```
┌─────────────────────────────────────────────────────────────────┐
│ ORGANIZER: Create Event                                         │
└─────────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────────┐
│ ORGANIZER: Add Championships/Prizes                             │
│ • 🏆 Championship Belt                                          │
│ • 💰 Cash Prize: $5,000                                         │
│ • 🏅 Trophy                                                     │
└─────────────────────────────────────────────────────────────────┘
                          ↓
         Championship Status: 📣 Announced
                          ↓
┌─────────────────────────────────────────────────────────────────┐
│ CLUBS: View Event Prizes                                        │
│ • See what fighters can win                                     │
│ • Motivates fighter participation                               │
└─────────────────────────────────────────────────────────────────┘
                          ↓
         Event goes Live 🔥
                          ↓
┌─────────────────────────────────────────────────────────────────┐
│ Championship Status: ⚙️ In Progress                             │
└─────────────────────────────────────────────────────────────────┘
                          ↓
         Match completes
                          ↓
┌─────────────────────────────────────────────────────────────────┐
│ KKF OFFICER: Declare Winner                                     │
│ • Enter match results                                           │
│ • Select championship winner                                    │
└─────────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────────┐
│ Championship Status: 🏆 AWARDED                                 │
│ Winner: Sorn Seavmey (Pradal Khmer Gym)                        │
│ Date: March 25, 2026                                            │
└─────────────────────────────────────────────────────────────────┘
                          ↓
         Championship added to fighter's profile
         Club can display championship in portfolio
```

---

## 5️⃣ Club Dashboard Overview

```
┌─────────────────────────────────────────────────────────────────┐
│ 🏢 PRADAL KHMER GYM - DASHBOARD                                 │
└─────────────────────────────────────────────────────────────────┘

┌───────────────────────────────────────────────────────────────────┐
│ 📊 FIGHTER OVERVIEW                                               │
├───────────────────────────────────────────────────────────────────┤
│ Total Fighters: 15                                                │
│ 🟢 Available:        8 (53%)                                     │
│ 🔵 Scheduled:        3 (20%)                                     │
│ 🟡 Resting:          2 (13%)                                     │
│ ⚫ Not Eligible:     2 (13%)                                     │
└───────────────────────────────────────────────────────────────────┘

┌───────────────────────────────────────────────────────────────────┐
│ ⏳ PENDING KKF APPROVALS                                          │
├───────────────────────────────────────────────────────────────────┤
│ Pending:    2 fighters                                            │
│ Approved:   12 fighters                                           │
│ Rejected:   1 fighter (action required)                           │
│                                                                   │
│ 🔴 Action Required:                                               │
│ • Update medical certificate for "New Fighter"                   │
└───────────────────────────────────────────────────────────────────┘

┌───────────────────────────────────────────────────────────────────┐
│ 🔔 MATCH PROPOSALS                                                │
├───────────────────────────────────────────────────────────────────┤
│ 3 matches awaiting your confirmation                              │
│                                                                   │
│ [1] Pich Sophea vs Dara Vong                                     │
│     Event: KUN KHMER Grand Championship                          │
│     Date: March 25, 2026                                         │
│     Prize: 🏆 Championship Belt + 💰 $5,000                      │
│     [✅ Accept] [❌ Reject]                                       │
│                                                                   │
│ [View All Proposals →]                                            │
└───────────────────────────────────────────────────────────────────┘

┌───────────────────────────────────────────────────────────────────┐
│ 📅 UPCOMING MATCHES                                               │
├───────────────────────────────────────────────────────────────────┤
│ Mar 25 - Pich Sophea vs Dara Vong (Confirmed ✅)                 │
│ Mar 30 - Kimsan Heng vs Thai Fighter (Confirmed ✅)              │
│ Apr 05 - Sorn Seavmey vs Champion (Weigh-in pending)            │
│                                                                   │
│ [View Full Schedule →]                                            │
└───────────────────────────────────────────────────────────────────┘

┌───────────────────────────────────────────────────────────────────┐
│ 🏆 RECENT CHAMPIONSHIPS WON                                       │
├───────────────────────────────────────────────────────────────────┤
│ 🏆 Pich Sophea - Lightweight Belt (Feb 2026)                     │
│ 🏅 Kimsan Heng - Bayon Trophy (Jan 2026)                         │
│                                                                   │
│ [View All Achievements →]                                         │
└───────────────────────────────────────────────────────────────────┘
```

---

## 6️⃣ Filter Usage Example

```
┌─────────────────────────────────────────────────────────────────┐
│ 🔍 FIND FIGHTERS FOR MATCH                                      │
└─────────────────────────────────────────────────────────────────┘

User Need: "Find professional fighters, 61-65 kg, ready to fight"

┌───────────────────────────────────────────────────────────────────┐
│ FILTERS APPLIED:                                                  │
├───────────────────────────────────────────────────────────────────┤
│ ✅ Approval Status: Approved                                      │
│ ✅ Fighter Status:  Available                                     │
│ ✅ Type:           Professional                                   │
│ ✅ Weight Range:   61-65 kg                                       │
│ ✅ Origin:         Local                                          │
└───────────────────────────────────────────────────────────────────┘
                          ↓
┌───────────────────────────────────────────────────────────────────┐
│ RESULTS: 4 fighters found                                         │
├───────────────────────────────────────────────────────────────────┤
│ 1. Pich Sophea   - 62.5 kg - Record: 25-3-1 - 🟢 Available      │
│ 2. Chan Rothana  - 61.2 kg - Record: 28-8-0 - 🟢 Available      │
│ 3. Nou Srey Pov  - 63.8 kg - Record: 19-3-1 - 🟢 Available      │
│ 4. Kem Sitha     - 63.2 kg - Record: 31-12-3 - 🟢 Available     │
└───────────────────────────────────────────────────────────────────┘

Compare with OLD system (no filters):
- Would show ALL 50+ fighters
- Many not approved ⏳
- Many not available 🔵🟡🟠
- Wastes time scrolling
```

---

## 7️⃣ Permission Comparison: Club vs Other Roles

```
┌──────────────────┬──────────┬──────────┬──────────┬──────────┐
│ ACTION           │ Club     │ Organizer│ Auditor  │ Officer  │
├──────────────────┼──────────┼──────────┼──────────┼──────────┤
│ Register Fighter │ ✅       │ ❌       │ ❌       │ ❌       │
│ Update Status    │ ✅       │ ❌       │ ❌       │ ❌       │
│ Approve Fighter  │ ❌       │ ❌       │ ✅       │ ❌       │
│ Accept Match     │ ✅       │ ❌       │ ❌       │ ❌       │
│ Create Event     │ ❌       │ ✅       │ ❌       │ ❌       │
│ Approve Event    │ ❌       │ ❌       │ ✅       │ ❌       │
│ Add Championship │ ❌       │ ✅       │ ❌       │ ❌       │
│ View Prizes      │ ✅       │ ✅       │ ✅       │ ✅       │
│ Enter Results    │ ❌       │ ❌       │ ❌       │ ✅       │
│ Create Club      │ ❌       │ ❌       │ ❌       │ ❌       │
│ View Own Club    │ ✅       │ ❌       │ ❌       │ ❌       │
│ View All Clubs   │ ❌       │ ✅       │ ✅       │ ✅       │
└──────────────────┴──────────┴──────────┴──────────┴──────────┘
```

---

## 📊 Summary: Complete Club Journey

```
DAY 1:
┌────────────────────────────────┐
│ Club registers new fighter     │
│ Status: ⏳ Pending             │
└────────────────────────────────┘

DAY 2:
┌────────────────────────────────┐
│ KKF Auditor approves fighter   │
│ Status: ✅ Approved            │
│ Fighter Status: 🟢 Available   │
└────────────────────────────────┘

DAY 5:
┌────────────────────────────────┐
│ Organizer creates match        │
│ Prize: 🏆 Belt + 💰 $5,000     │
│ Club receives proposal         │
└────────────────────────────────┘

DAY 6:
┌────────────────────────────────┐
│ Club accepts match             │
│ Fighter Status: 🔵 Scheduled   │
└────────────────────────────────┘

DAY 30 (Event Day):
┌────────────────────────────────┐
│ Fighter competes and WINS! 🎉 │
│ Championship: 🏆 Awarded       │
└────────────────────────────────┘

DAY 31:
┌────────────────────────────────┐
│ Fighter Status: 🟡 Resting     │
│ 30-day mandatory rest period   │
└────────────────────────────────┘

DAY 60:
┌────────────────────────────────┐
│ Rest period ends               │
│ Fighter Status: 🟢 Available   │
│ Ready for next match!          │
└────────────────────────────────┘
```

---

**Version**: 3.2.0  
**Last Updated**: March 20, 2026  
**Type**: Visual Workflow Documentation  
**Purpose**: Easy-to-understand diagrams for all club workflows
