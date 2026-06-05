# KUN KHMER Event Status System - Complete Guide

## 📊 Overview: 11 Comprehensive Event Statuses

The KUN KHMER Digital Platform uses an 11-status system to track the complete event lifecycle from creation to completion.

---

## 🎯 Status List with Full Details

### 1. 🟡 Draft

**Description**: Event is created but not yet submitted

**Icon**: 🟡  
**Color**: Yellow (bg-yellow-50, text-yellow-700, border-yellow-300)  
**Can Edit**: ✅ Yes  
**Can Create Matches**: ❌ No  

**Conditions**:
- Event is created
- Basic information added
- Not yet submitted to KKF

**Organizer Can**:
- ✅ Edit event details
- ✅ Add sponsors
- ✅ Add TV station/broadcaster
- ✅ Submit to KKF when ready

**Example**:
```json
{
  "id": "e1",
  "name": "Khmer Warriors Championship 2026",
  "status": "Draft",
  "location": "Olympic Stadium, Phnom Penh",
  "date": "2026-06-15",
  "sponsors": ["Carabao"],
  "station": "Town Full HDTV",
  "submittedDate": null,
  "kkfStatus": null
}
```

**Scenario**: "Organizer just created the event. Adding sponsors and finalizing details before submission."

---

### 2. 🔵 Submitted

**Description**: Event is submitted to Kun Khmer Federation (KKF) - Waiting for review

**Icon**: 🔵  
**Color**: Blue (bg-blue-50, text-blue-700, border-blue-300)  
**Can Edit**: ❌ Locked  
**Can Create Matches**: ❌ No  

**Conditions**:
- Event submitted to KKF
- Has at least 1 sponsor
- Has TV station/broadcaster
- Locked for major edits

**Organizer Can**:
- ⏳ Wait for KKF review
- 👀 Monitor status

**KKF Can**:
- 🔍 Begin review process
- ➡️ Move to "Under Review"

**Example**:
```json
{
  "id": "e2",
  "name": "Battambang Fight Night Vol. 8",
  "status": "Submitted",
  "location": "Battambang Arena",
  "date": "2026-05-20",
  "sponsors": ["Smart Axiata", "Ganzberg", "Wing Bank"],
  "station": "Bayon TV",
  "submittedDate": "2026-03-20",
  "kkfStatus": "pending"
}
```

**Scenario**: "Event submitted yesterday. Has 3 sponsors confirmed. Waiting for KKF to start review."

---

### 3. 🟣 Under Review

**Description**: KKF is actively reviewing the event (Optional but recommended for better tracking)

**Icon**: 🟣  
**Color**: Purple (bg-purple-50, text-purple-700, border-purple-300)  
**Can Edit**: ❌ Locked  
**Can Create Matches**: ❌ No  

**Conditions**:
- KKF officer is reviewing
- Event details being verified
- Sponsors being checked
- Compliance review in progress

**Organizer Can**:
- ⏳ Wait for review completion
- 📧 Respond to KKF queries if needed

**KKF Can**:
- 🔍 Review event details
- ✅ Verify sponsors
- 📋 Check compliance
- ✅ Approve or ❌ Reject

**Example**:
```json
{
  "id": "e3",
  "name": "Siem Reap Warriors vs The World",
  "status": "Under Review",
  "location": "Angkor Complex Arena",
  "date": "2026-06-01",
  "submittedDate": "2026-03-18",
  "kkfStatus": "under_review",
  "kkfReviewedBy": "u2",
  "kkfComments": "Reviewing international fighter documentation"
}
```

**Scenario**: "KKF Officer is actively reviewing event details, verifying international fighter compliance and sponsor legitimacy."

---

### 4. 🟢 Approved ✅

**Description**: Event is officially approved by KKF - **This is the trigger point for matchmaking**

**Icon**: 🟢  
**Color**: Green (bg-green-50, text-green-700, border-green-300)  
**Can Edit**: ❌ Locked  
**Can Create Matches**: ✅ **YES - GATE UNLOCKED!**  

**Conditions**:
- KKF approved the event
- Event sanctioned
- **Gate unlocked for match creation**

**Organizer Can**:
- ✅ **Create match proposals**
- ✅ **Assign fighters**
- ✅ **Build fight card**
- ✅ **Start matchmaking**

**KKF Can**:
- 👀 Monitor match creation
- 🔍 Oversee fight card building

**Example**:
```json
{
  "id": "e4",
  "name": "Golden Fist Tournament 2026",
  "status": "Approved",
  "location": "Koh Pich Convention Center",
  "date": "2026-07-10",
  "submittedDate": "2026-03-05",
  "kkfStatus": "approved",
  "kkfReviewedBy": "u2",
  "kkfReviewedDate": "2026-03-10",
  "kkfComments": "Event approved. Ensure all safety protocols are in place."
}
```

**Scenario**: "✅ KKF approved! Organizer can now create match proposals and build the fight card. Gate unlocked for matchmaking."

---

### 5. 🔴 Rejected ❌

**Description**: Event is not approved - KKF provides comments

**Icon**: 🔴  
**Color**: Red (bg-red-50, text-red-700, border-red-300)  
**Can Edit**: ✅ Yes (to fix issues)  
**Can Create Matches**: ❌ No  

**Conditions**:
- KKF rejected the event
- Issues with sponsors, venue, or compliance
- Comments provided by KKF

**Organizer Must**:
- 📖 Review KKF comments
- ✏️ Edit event details
- 🔧 Fix issues
- 📤 Resubmit to KKF

**KKF Can**:
- 💬 Provide rejection reasons
- 📋 Guide organizer on fixes needed

**Example**:
```json
{
  "id": "e5",
  "name": "Kampot Coastal Combat",
  "status": "Rejected",
  "location": "Kampot Beach Arena",
  "date": "2026-05-05",
  "submittedDate": "2026-03-12",
  "kkfStatus": "rejected",
  "kkfReviewedBy": "u2",
  "kkfReviewedDate": "2026-03-14",
  "kkfComments": "Main sponsor verification failed. Please update sponsor documentation and resubmit."
}
```

**Scenario**: "❌ KKF rejected because main sponsor is not verified. Organizer needs to update sponsor info and resubmit."

---

### 6. 🟠 Match Preparation

**Description**: Matches are being created and confirmed - Helps separate approved event from event with ready fight card (Optional but Recommended)

**Icon**: 🟠  
**Color**: Orange (bg-orange-50, text-orange-700, border-orange-300)  
**Can Edit**: ❌ Locked  
**Can Create Matches**: ✅ Yes  

**Conditions**:
- Event is approved
- At least 1 match created
- Matches being confirmed by clubs
- Fight card in progress

**Organizer Can**:
- ✅ Continue creating matches
- ⏳ Wait for club confirmations
- 📋 Assign confirmed matches to event
- ✅ Finalize fight card

**KKF Can**:
- 👀 Monitor match creation
- 🔍 Review fight card

**Example**:
```json
{
  "id": "e6",
  "name": "Night of Champions: May Edition",
  "status": "Match Preparation",
  "location": "CTN Studio Arena",
  "date": "2026-05-25",
  "kkfStatus": "approved",
  "matchesCount": 8,
  "confirmedMatches": 5,
  "pendingMatches": 3
}
```

**Scenario**: "Event approved. Organizer has created 8 match proposals. 5 matches already club-confirmed. Building complete fight card."

---

### 7. 🟤 Weigh-In Completed

**Description**: Fighters have completed weigh-in - Matches are finalized - Event ready to go live

**Icon**: 🟤  
**Color**: Amber/Brown (bg-amber-50, text-amber-800, border-amber-400)  
**Can Edit**: ❌ Locked  
**Can Create Matches**: ❌ No  

**Conditions**:
- All fighters weighed in
- Weights verified
- Matches finalized
- Event ready to start

**Organizer Can**:
- 🎯 Prepare for event
- ✅ Final checks
- ▶️ Start event when ready

**KKF Can**:
- ✅ Verify weigh-in results
- 👨‍⚖️ Assign officials
- 📋 Final compliance check

**Example**:
```json
{
  "id": "e7",
  "name": "Thunder in Phnom Penh Vol. 12",
  "status": "Weigh-In Completed",
  "location": "Phnom Penh Olympic Stadium",
  "date": "2026-04-05",
  "weighInDate": "2026-04-04",
  "weighInOfficer": "u2",
  "matchesCount": 10,
  "allWeighInsComplete": true
}
```

**Scenario**: "Official weigh-in completed this morning. All 10 matches verified. Fighters ready. Event starts tomorrow night."

---

### 8. 🔥 Live / Ongoing

**Description**: Event is currently happening - Matches in progress

**Icon**: 🔥  
**Color**: Red/Fire (bg-red-100, text-red-600, border-red-400)  
**Can Edit**: ❌ Locked  
**Can Create Matches**: ❌ No  

**Conditions**:
- Event has started
- Matches in progress
- Live broadcast ongoing
- Officials present

**Organizer Can**:
- 👀 Monitor event progress
- 📺 Coordinate with broadcast
- 🎪 Manage event logistics

**KKF Can**:
- ▶️ Start matches
- 📝 Record results
- 👨‍⚖️ Manage officials
- ✅ Ensure compliance

**Example**:
```json
{
  "id": "e8",
  "name": "Khmer New Year Mega Fight 2026",
  "status": "Live",
  "location": "National Olympic Stadium",
  "date": "2026-04-14",
  "eventStartTime": "2026-04-14T19:00:00Z",
  "currentMatch": 6,
  "totalMatches": 12,
  "liveStreamUrl": "https://bayontv.com/live"
}
```

**Scenario**: "🔥 EVENT IS LIVE! Currently on Match 6 of 12. Broadcast ongoing on Bayon TV. Crowd of 15,000+. Exciting main event coming up!"

---

### 9. 🟦 Results Pending

**Description**: Matches completed - Waiting for KKF officer to finalize results

**Icon**: 🟦  
**Color**: Cyan (bg-cyan-50, text-cyan-700, border-cyan-300)  
**Can Edit**: ❌ Locked  
**Can Create Matches**: ❌ No  

**Conditions**:
- All matches finished
- Results recorded
- Waiting for KKF verification
- Final results pending

**Organizer Can**:
- ⏳ Wait for result verification
- 📊 Prepare final report

**KKF Can**:
- ✅ Verify match results
- ✅ Complete matches
- 📋 Finalize official records
- 🔒 Close event

**Example**:
```json
{
  "id": "e9",
  "name": "Provincial Champions League Round 3",
  "status": "Results Pending",
  "location": "Kandal Sports Complex",
  "date": "2026-03-28",
  "eventEndTime": "2026-03-28T23:30:00Z",
  "matchesCount": 8,
  "matchesCompleted": 8,
  "resultsVerified": 6,
  "resultsPending": 2
}
```

**Scenario**: "Event finished last night. All 8 matches completed. KKF officer reviewing and finalizing official results before closure."

---

### 10. ⚫ Completed

**Description**: Results confirmed - Event officially closed

**Icon**: ⚫  
**Color**: Gray (bg-gray-50, text-gray-700, border-gray-300)  
**Can Edit**: ❌ Locked (Archived)  
**Can Create Matches**: ❌ No  

**Conditions**:
- All results finalized
- Event officially closed
- Records archived
- Historical data

**Organizer Can**:
- 📊 View results
- 📁 Access archives
- 📄 Generate reports

**KKF Can**:
- 📊 View archived data
- 📈 Generate statistics

**Example**:
```json
{
  "id": "e10",
  "name": "Victory Grand Prix 2026 - Q1",
  "status": "Completed",
  "location": "Koh Pich Hall",
  "date": "2026-03-15",
  "closedDate": "2026-03-16",
  "closedBy": "u2",
  "matchesCount": 12,
  "totalAttendance": 8500,
  "broadcastReach": 125000
}
```

**Scenario**: "✅ Event successfully completed 5 days ago. 12 matches, all results verified and archived. Available for historical viewing."

---

### 11. ⚪ Cancelled

**Description**: Event cancelled (by organizer or KKF)

**Icon**: ⚪  
**Color**: Gray (bg-gray-100, text-gray-500, border-gray-400)  
**Can Edit**: ❌ Locked  
**Can Create Matches**: ❌ No  

**Conditions**:
- Event cancelled
- No longer happening
- Archived as cancelled

**Organizer Can**:
- 📖 View cancellation reason

**KKF Can**:
- 📖 View cancellation details

**Example**:
```json
{
  "id": "e11",
  "name": "Coastal Showdown 2026",
  "status": "Cancelled",
  "location": "Sihanoukville Arena",
  "date": "2026-05-30",
  "cancelledDate": "2026-03-22",
  "cancelledBy": "u3",
  "cancellationReason": "Venue unavailable due to renovation. Unable to secure alternative venue."
}
```

**Scenario**: "⚪ Event cancelled by organizer due to venue unavailability. Fighters notified. Refunds processed. Archived as cancelled."

---

## 🔄 Status Transition Flow

```
Draft
  ↓ (Submit to KKF)
Submitted
  ↓ (KKF starts review)
Under Review
  ↓ (KKF decision)
  ├─(Approve)→ Approved ✅ ← CRITICAL GATE
  │              ↓ (Create matches)
  │         Match Preparation
  │              ↓ (Weigh-in done)
  │         Weigh-In Completed
  │              ↓ (Start event)
  │         Live 🔥
  │              ↓ (Matches done)
  │         Results Pending
  │              ↓ (Results verified)
  │         Completed ⚫
  │
  └─(Reject)→ Rejected ❌
       ↓ (Fix and resubmit)
    Draft → Submitted...

[Any status] → Cancelled ⚪
```

---

## 📊 Status Transition Rules

| From Status | To Status | Triggered By | Requirements |
|-------------|-----------|--------------|--------------|
| Draft | Submitted | Organizer | At least 1 sponsor, TV station |
| Submitted | Under Review | KKF | KKF officer starts review |
| Under Review | Approved | KKF | All checks passed |
| Under Review | Rejected | KKF | Issues found |
| Approved | Match Preparation | Auto | First match created |
| Match Preparation | Weigh-In Completed | KKF | All fighters weighed in |
| Weigh-In Completed | Live | Organizer | Event starts |
| Live | Results Pending | Auto | All matches finished |
| Results Pending | Completed | KKF | All results verified |
| Rejected | Draft | Organizer | Organizer edits event |
| Any | Cancelled | Organizer/KKF | Valid reason provided |

---

## 🎨 UI Color Reference

```css
/* 1. Draft */
.status-draft {
  background-color: rgb(254 252 232); /* bg-yellow-50 */
  color: rgb(161 98 7); /* text-yellow-700 */
  border-color: rgb(253 224 71); /* border-yellow-300 */
}

/* 2. Submitted */
.status-submitted {
  background-color: rgb(239 246 255); /* bg-blue-50 */
  color: rgb(29 78 216); /* text-blue-700 */
  border-color: rgb(147 197 253); /* border-blue-300 */
}

/* 3. Under Review */
.status-under-review {
  background-color: rgb(250 245 255); /* bg-purple-50 */
  color: rgb(126 34 206); /* text-purple-700 */
  border-color: rgb(216 180 254); /* border-purple-300 */
}

/* 4. Approved */
.status-approved {
  background-color: rgb(240 253 244); /* bg-green-50 */
  color: rgb(21 128 61); /* text-green-700 */
  border-color: rgb(134 239 172); /* border-green-300 */
}

/* 5. Rejected */
.status-rejected {
  background-color: rgb(254 242 242); /* bg-red-50 */
  color: rgb(185 28 28); /* text-red-700 */
  border-color: rgb(252 165 165); /* border-red-300 */
}

/* 6. Match Preparation */
.status-match-preparation {
  background-color: rgb(255 247 237); /* bg-orange-50 */
  color: rgb(194 65 12); /* text-orange-700 */
  border-color: rgb(253 186 116); /* border-orange-300 */
}

/* 7. Weigh-In Completed */
.status-weighin-completed {
  background-color: rgb(255 251 235); /* bg-amber-50 */
  color: rgb(146 64 14); /* text-amber-800 */
  border-color: rgb(251 191 36); /* border-amber-400 */
}

/* 8. Live */
.status-live {
  background-color: rgb(254 226 226); /* bg-red-100 */
  color: rgb(220 38 38); /* text-red-600 */
  border-color: rgb(248 113 113); /* border-red-400 */
}

/* 9. Results Pending */
.status-results-pending {
  background-color: rgb(236 254 255); /* bg-cyan-50 */
  color: rgb(14 116 144); /* text-cyan-700 */
  border-color: rgb(103 232 249); /* border-cyan-300 */
}

/* 10. Completed */
.status-completed {
  background-color: rgb(249 250 251); /* bg-gray-50 */
  color: rgb(55 65 81); /* text-gray-700 */
  border-color: rgb(209 213 219); /* border-gray-300 */
}

/* 11. Cancelled */
.status-cancelled {
  background-color: rgb(243 244 246); /* bg-gray-100 */
  color: rgb(107 114 128); /* text-gray-500 */
  border-color: rgb(156 163 175); /* border-gray-400 */
}
```

---

## 💡 Best Practices

### When to Use Each Status

**Draft**: Initial creation, gathering information  
**Submitted**: Ready for KKF review, complete information  
**Under Review**: KKF is actively working on it (optional but recommended)  
**Approved**: Ready to build fight card ⭐ CRITICAL GATE  
**Rejected**: Needs fixes before resubmission  
**Match Preparation**: Fight card being built (optional but recommended)  
**Weigh-In Completed**: Ready to go live  
**Live**: Event happening now 🔥  
**Results Pending**: Waiting for verification  
**Completed**: Archived and final  
**Cancelled**: Won't happen  

### Status Transition Timing

- **Draft → Submitted**: When all basic info and sponsors added
- **Submitted → Under Review**: Immediately when KKF starts
- **Under Review → Approved/Rejected**: Within 2-5 business days
- **Approved → Match Preparation**: Auto when first match created
- **Match Preparation → Weigh-In Completed**: 1-2 days before event
- **Weigh-In Completed → Live**: Event day
- **Live → Results Pending**: After last match
- **Results Pending → Completed**: Within 24 hours

---

## 📁 Files Reference

**Core Configuration**:
- `/src/app/data/eventStatuses.ts` - Status definitions and functions
- `/src/app/data/eventStatusExamples.ts` - Example events for all statuses

**Validation**:
- `/src/app/utils/improvedWorkflowValidation.ts` - Workflow logic

**Documentation**:
- `/EVENT_STATUS_GUIDE.md` - This comprehensive guide

---

**Version**: 2.2.0  
**Last Updated**: March 20, 2026  
**Status**: ✅ Complete and Ready
