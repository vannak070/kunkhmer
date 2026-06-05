KKF Event, Batch & Match – Function List (Final Approval Flow)
1. Event Management Functions
Event Creation & Setup
Create Event (Draft)
Edit Event Details
Delete Event (before submission)
Select Event Type:
One-Time
Weekly
Set Event Information:
Name
Venue
Date / Schedule
Sponsor
Broadcast
Event Approval (KKF)
Submit Event to KKF
Review Event (KKF Admin)
Approve Event
Reject Event (with reason)
Event Status
Draft
Submitted
Under Review
Approved
Active
Completed
Event Rule
❌ Cannot create Batch if Event ≠ Approved
2. Batch Management Functions (Under Event)
Batch Creation
Create Batch (linked to Event)
Assign Batch Type (Main / Prelim / Weekly)
Assign Batch Date / Week
Edit Batch
Delete Batch (before submission)
Save Batch as Draft
Batch Status
Draft
In Progress
Pending Club Approval
Ready for KKF Submission
Pending KKF Approval
Approved
Scheduled
Ongoing
Completed
Batch Rule
Batch must belong to 1 approved Event
3. Match Management Functions (Inside Batch)
Match Creation (Core Flow)
Add Match under Batch
Edit Match
Delete Match
Duplicate Match
Assign Match Order
Match Setup
Select Fighter A
Select Fighter B
Assign Weight Class
Select Match Type:
Normal
Ranking
Championship
Set Rounds & Duration
Set Gloves & Equipment
Toggle Title Fight (Yes/No)
Add Special Rules
Match Status
Draft
Pending Club Approval
Club Approved
Club Rejected
Pending KKF Approval
KKF Approved
Scheduled
Ongoing
Completed
4. Club Approval Functions (First Approval Layer)
Flow

👉 Match created → sent to both clubs → both must approve

Club Actions
View Match Requests
View Fighter Participation
Approve Fighter for Match
Reject Fighter (with reason)
Add Comment (optional)
System Logic
Send Match to:
Fighter A Club
Fighter B Club
Track approval separately:
Fighter A = Approved / Rejected
Fighter B = Approved / Rejected
Validation Rule
✅ Match moves forward ONLY IF:
Fighter A Club = Approved
Fighter B Club = Approved
❌ If any club rejects:
Match Status = Club Rejected
Return to Organizer
5. Submit to KKF Functions (Second Approval Layer)
Trigger Condition
All matches in batch = Club Approved
Functions
Validate Matches Ready for KKF
Submit Matches to KKF
Lock Match Editing
Attach Club Approval Records
Batch Logic
Batch becomes:
Ready for KKF Submission when all matches club approved
6. KKF Approval Functions
View Matches Pending KKF Approval
Review Match Details
View Club Approval Records
Approve Match
Reject Match (with reason)
Bulk Approve Matches
Assign Referees & Judges
KKF Status
Pending KKF Approval
KKF Approved
KKF Rejected
7. Event Execution Functions
Start Event
Start Batch
Start Match
Update Match Result
Complete Match
Complete Batch
Complete Event
8. Batch Organization Functions
Upcoming Batches
View Upcoming Batches
Show:
Event Name
Batch Name
Date
Status
Completed Batches
View Completed Batches
Show:
Results
Winners
Summary
Automation
Auto move:
Upcoming → Completed
9. Validation Functions
Before Club Approval
Validate fighter selection
Validate weight class
Prevent duplicate fighters
Before KKF Submission
Ensure all matches = Club Approved
Ensure all required data completed
Block submission if not valid
10. Notification Functions
To Club
Notify new match request
Notify pending approval
To Organizer
Notify club approval / rejection
Notify ready for KKF submission
To KKF
Notify new submission
11. Audit & Tracking Functions
Store Club Approval (per fighter)
Store KKF Approval
Track rejection reasons
Maintain activity logs
✅ Final End-to-End Flow (Your Exact Logic)
Event Created → KKF Approval

→ Batch Created (under Event)

→ Match Created (inside Batch)

→ Club Approval (Fighter A & B)
   → If Rejected → Back to Organizer
   → If Approved →

→ Submit to KKF

→ KKF Approval

→ Scheduled → Ongoing → Completed
🎯 Key Improvement

This design ensures:

✔ Matches are always created under Batch
✔ Clubs control fighter participation first
✔ KKF only reviews fully validated matches
✔ Clean and scalable workflow