Event Function List (KKF System)
🔹 1. Create Event Function
Create new event with required fields:
Event name
Event type (Single-day / Multi-week)
Start date & end date
Venue / Location
Broadcast station
Main sponsor
Assign organizer / club
Set initial status = Draft
🔹 2. Edit Event Function
Update event information:
Name, date, venue
Broadcast & sponsor
Restrict editing if:
Event already approved or ongoing
🔹 3. Event Status Management Function
Manage event status:
Draft
Pending KKF Approval
Approved
Rejected
Cancelled
Only authorized roles (KKF Admin) can approve/reject
🔹 4. Event Approval Function
Submit event for KKF approval
KKF reviews event details
Approve or reject with comments
Notify organizer after decision
🔹 5. Event–Batch Integration Function
Link event with multiple batches
Allow batch creation only under event
Display all batches under event
Sync batch status with event
🔹 6. Event Summary Function
Display key statistics:
Total batches
Total matches
Total fighters
Completed matches
Show readiness status
🔹 7. Event Schedule Function
Manage event timeline:
Multi-week structure
Match scheduling via batches
Display event calendar view
🔹 8. Event Detail View Function
Show full event information:
Overview
Batches
Matches
Officials
Sponsors
Enable quick actions:
Create batch
Assign officials
Assign champion
🔹 9. Event Validation Function
Validate before approval:
Must have at least 1 batch
Each batch must have matches
Fighters assigned
Officials assigned
Show warnings for missing data
🔹 10. Event Locking Function
Lock event when:
Status = Approved or Ongoing
Prevent:
Deletion
Major edits
Allow limited updates (e.g., schedule or notes)
🔹 11. Event Cancellation Function
Cancel event
Auto-update:
All batches → Cancelled
All matches → Cancelled
Notify related users
🔹 12. Event Search & Filter Function
Search by:
Event name
Venue
Sponsor
Filter by:
Status
Date range
Location
🔹 13. Event Notification Function
Send notifications for:
Event submission
Approval / rejection
Schedule updates
Notify:
Organizer
KKF admin
Related officials
🔹 14. Event Reporting Function
Generate reports:
Match results
Fighter performance
Event summary
Export data (PDF / Excel)
🔹 15. Event Permission Function
Role-based access:
Super Admin → full control
KKF Admin → approve/reject
Organizer → create/edit own events
✅ Core Logic
Event = Parent of all activities
Controls batches, matches, and workflow
Central point for approval and monitoring