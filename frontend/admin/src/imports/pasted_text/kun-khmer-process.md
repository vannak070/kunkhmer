🥊 Kun Khmer System – Updated Process (Figma Flow Aligned)
🔧 Key Update
* ❌ Remove Weight Class from Fighter Profile and Filters
* Replace with:
    * ✅ Weight (actual)
    * ✅ Match Weight Agreement (per fight) 👉 This fits real Kun Khmer practice (flexible matching, not strict classes)

🔄 End-to-End Process (System Flow)
🧭 1. Broadcast Creates Event
Actor: Broadcast / Promoter
Action:
* Create Event (Draft)
Required Fields:
* Event Name
* Date & Time
* Venue
* Broadcast Station (from Settings)
* Event Type
UI (Figma):
* Event Create Form
* Status Badge: 🟡 Draft
* Button: “Next: Add Sponsor”

💰 2. Select Main Sponsor
Actor: Broadcast / Promoter
Action:
* Select sponsor from list (Settings module)
Logic:
* Must select at least 1 main sponsor
* Option to add multiple sponsors
UI:
* Sponsor Selection Modal
* Show:
    * Logo
    * Sponsor Name
    * Status
Button: ➡️ “Next: Select Fighters”

🥊 3. Select Fighters (Match Setup)
Actor: Organizer
Action:
* Select fighters to build fight card
Rules:
* Only show:
    * ✅ Available fighters
    * ❌ Hide:
        * Fighters in rest period
        * Fighters with upcoming fights
        * Fighters with invalid medical
Replace Weight Class with:
* Fighter Weight (display only)
* Match Weight Agreement (input per match)
UI:
🔥 Match Builder Screen
* Fighter A vs Fighter B
* Show:
    * Weight
    * Record
    * Grade
    * Availability
Status Indicator:
* 🟢 Valid
* 🟡 Warning
* 🔴 Block
Button: ➡️ “Submit to KKF”

🏛️ 4. KKF Approval
Actor: Kun Khmer Federation
Workflow:
Draft → Submitted → Under Review → Approved / Rejected
Validation:
* Fighters:
    * KYC Verified
    * Medical Valid
    * Rest Period OK
* No scheduling conflicts
UI:
Federation Review Screen
* Event Info
* Fight Card
* Fighter compliance
Actions:
* ✅ Approve
* ❌ Reject
* 💬 Comment

⚙️ 5. Match Availability Confirmation
(Your “Please match available” step improved)
System Action:
* Auto-check all fighters again before final lock
Output:
* Final Match Card Status:
    * 🟢 Ready
    * 🔴 Needs Fix
UI:
* “Match Validation Summary” screen
* Highlight issues (if any)

👨‍⚖️ 6. KKF Assign Judges & Referees
Actor: Kun Khmer Federation
Action:
* Assign:
    * Referee
    * Judges (multiple)
Fields:
* Name
* Role (Referee / Judge)
* License ID
UI:
* Officials Assignment Panel
* Drag & assign per match

📊 7. KKF Updates Results (With Attachment)
Actor: Kun Khmer Federation Officer
Action:
* Input:
    * Winner / Loser
    * Method (KO / Decision / etc.)
    * Score / Rounds
* Upload:
    * 📎 Official Result Document
    * 📷 Images / Evidence (optional)
System Logic:
* Lock results after confirmation
* Update:
    * Fighter history
    * Rankings
    * Event status = Completed
UI:
* Result Entry Dashboard
* File Upload Section
* “Confirm & Lock” Button
