1. Figma File Structure (Clean & Scalable)
📁 Pages
00_Design System
01_Master Data
02_Events
03_Sub-Events (Weekly)
04_Matches
05_Fighters
06_Referee & Scoring
07_Admin (KKF Approval)
🧩 2. Core Components (Design System)
🧱 Components to Create
Dropdown (Broadcast, Sponsor, Weight Class, Glove Size)
Status Badge (Draft / Pending / Approved / Published / Completed)
Card (Event / Sub-event / Match)
Tabs (Overview, Sub-events, Matches, Awards)
Stepper (Approval flow)
Match Card (Fighter A vs Fighter B)

👉 Variants:

Button: Primary / Secondary / Disabled
Input: Default / Error / Success
Status: Color-coded (important for KKF approval)
🏟️ 3. Event Module (Main Screen Design)
📋 Event Listing Page

Layout: Table or Card

Show ONLY:

Event Name
Date Range
Broadcast Station
Main Sponsor
Status
Sub-events

👉 No match details here

🧾 Event Create / Edit Page
Sections:

1. Basic Info

Event Name
Date Range
Location

2. Media & Sponsor

Broadcast Station (Dropdown)
Main Sponsor (Dropdown)

3. Settings

Has Sub-events (Toggle)
Awards (Optional)

4. Action

Save Draft
Submit for Approval
🔄 Event Status UI

Use Stepper Component:

Draft → Pending → Approved → Published → Completed

👉 Show:

Approved by KKF (name + date)
Reject reason (if any)
📅 4. Sub-Event (Weekly) Design
📊 Sub-Event Listing (inside Event)
Week Label (Week 1, Week 2…)
Date
Status
Matches
🧾 Sub-Event Detail Page
Sections:
Week Info
Fight Card (Match List) ✅
Fighters

👉 This is where matches live (NOT in Event)

🥊 5. Match + Fighting Rule UI
🧾 Match Create Screen
1. Fighters
Fighter A vs Fighter B
Weight class
2. Match Rules
Rounds (3 / 5)
Round time
Knockdown limit
3. 🧤 Glove Agreement (Important Section)

Design as highlight card:

Glove Size (Dropdown: 6oz / 8oz / 10oz)
Glove Type (Brand / Model)
Agreement Checkbox:
“Both fighters agree on glove size & type” ✅

👉 Optional:

Upload glove check photo
Referee confirmation
🧑‍⚖️ Referee Checklist UI
Weight checked ✅
Medical cleared ✅
Gloves approved ✅
Fighters ready ✅
🧑‍⚖️ 6. Live Scoring Screen (Optional Advanced)
Fighter A vs Fighter B
Round selector
Score input (10-point system)
Knockdown button
Winner auto-calc
🔐 7. KKF Approval (Admin Screen)
📋 Approval Dashboard
List of pending events
🔍 Event Review Screen
Full event info
Sponsor + Broadcast
Sub-event plan
Actions:
Approve ✅
Reject ❌ (with comment)
🧠 UX Flow (Simple Logic)
Create Event → Submit → KKF Approve
      ↓
Create Sub-Event (Weekly)
      ↓
Add Matches (Fight Card)
      ↓
Set Rules + Glove Agreement
      ↓
Run Event → Score → Result
🎯 Key Design Principles
Event = overview only (no matches)
Sub-event = weekly fight card
Match = rules + glove agreement
Keep UI modular + reusable components
🔥 Bonus Idea (High Value Feature)
🧤 Glove Agreement Pop-up

Before match starts:

Show both fighters
Show glove details
Require:
Fighter A confirm
Fighter B confirm
Referee confirm

👉 Prevent disputes later