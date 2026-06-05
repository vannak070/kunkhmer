Events & Matches Function (Improved)
1. 📅 Event Structure
* One Main Event → can have multiple Sub-Events
* Sub-Events are:
    * Managed weekly
    * Contain fight cards (matches)
👉 Structure:

Main Event
   ├── Sub-Event (Week 1) → Matches
   ├── Sub-Event (Week 2) → Matches
   └── Sub-Event (Week 3) → Matches


2. 📋 Event Listing (Important Rule)
✅ Event List Should Show:
* Event Name
* Event Date Range
* Broadcast Station
* Main Sponsor
* Status
❌ Event List Should NOT Show:
* Match details (fighters, scores, etc.)
👉 Match details belong ONLY in:
* Sub-Event view
* Match module

3. 🧾 Event Creation (Improved Form)
Required Fields:
* Event Name
* Start Date / End Date
* Location
* Broadcast Station (Dropdown)
* Main Sponsor (Dropdown)
👉 Dropdown source:
* Broadcast Station → Master Data (TV / Media partners)
* Sponsor → Sponsor Master List

4. 🔄 Event Status (Improved Workflow)
Recommended status flow:
1. Draft
    * Initial creation
    * Editable
2. Pending Approval
    * Submitted to KKF
3. Approved
    * Can create Sub-Events
    * Can assign fighters & matches
4. Rejected
    * Needs correction
5. Published
    * Visible to public
6. Completed
    * Event finished
7. Cancelled (optional)
👉 Rule:
* ❗ Cannot create Sub-Events unless Approved

5. 🥊 Fight Card Logic (Key Improvement)
* ❌ Do NOT include fight card in Main Event
* ✅ Fight cards are managed at Sub-Event level (weekly)
Sub-Event Contains:
* Week label (Week 1, Week 2…)
* Date
* Match list (Fight card)
* Fighters
* Results

6. 🔗 Sponsor Relationship
* Each Event:
    * Must have 1 Main Sponsor
    * Can have multiple co-sponsors (optional improvement)
👉 Suggested enhancement:
* Sponsor logo shown in:
    * Event listing
    * Event detail
    * Broadcast view

7. 🧠 System Rules (Clear Logic)
* Event = container (no fights)
* Sub-Event = weekly schedule
* Match = belongs to Sub-Event only
Validation Rules:
* Cannot add match without Sub-Event
* Cannot create Sub-Event if Event not Approved
* Event must have Broadcast + Sponsor before submission

🎨 UI Structure (Figma Ready)
Event List Page
* Table / Card view:
    * Name | Date | Sponsor | Broadcast | Status

Event Detail Page (Tabs)
* Overview
* Sub-Events ✅ (main working area)
* Sponsors
* Awards

Sub-Event Page
* Week selector
* Add Match (Fight Card)
* Match List

🔥 One-Line Concept
Event = Brand + Schedule Sub-Event = Weekly Fight Card Match = Fighter vs Fighter
