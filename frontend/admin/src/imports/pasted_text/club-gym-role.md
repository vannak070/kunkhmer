Club / Gym Role – KKF Digital Platform (Improved)
🎯 Core Purpose
👉 The Club / Gym is the source of fighters and responsible for:
* Fighter registration
* Fighter readiness
* Match confirmation

✅ 1. Club Main Responsibilities
🥊 A. Fighter Management (Primary Role)
* Register fighters:
    * KKF Fighters (local) => need approval from KKF
    * Foreign Fighters
* Maintain fighter profiles:
    * KYC (ID, nationality, DOB)
    * Medical records
    * Fight history (auto from system)
👉 Important:
* Club is the owner of fighter data
* No fighter can exist without a club

📋 B. Fighter Validation
Before any match, the club must ensure:
* Fighter is available
* Fighter is fit (medical valid)
* Fighter agrees to fight
👉 This aligns with real competition governance where federations ensure safety and compliance

✅ C. Match Confirmation (VERY IMPORTANT)
* When organizer creates match:
    * Club must:
        * ✅ Accept match
        * ❌ Reject match
👉 Without club confirmation:
* Match = NOT VALID

📊 D. Fighter Participation Control
* Approve / reject fighter participation
* Track:
    * Upcoming fights
    * Rest period
    * Injuries
    * Banned

🔐 2. Club Permissions (System-Level)
✅ Allowed Actions:
* Register / edit fighters => review and approval from KKF
* Upload documents (KYC, medical)
* View:
    * Events
    * Matches
* Confirm / reject match participation
* View fighter schedule

❌ Restrictions:
* Cannot:
    * Create events
    * Approve events
    * Assign judges/referees
    * Update match results

🔄 3. Club Workflow in Your System

Register Fighter  
→ Fighter Available  
→ Organizer Select Fighter  
→ Club Review Match  
→ Approve / Reject  
→ Fighter Confirmed in Match


📱 4. Figma UX Recommendations (Very Important)
🔹 A. Club Dashboard
Show:
* Total Fighters
* Available Fighters
* Fighters in Match
* Fighters in Rest

🔹 B. Match Confirmation Screen
When club receives request:
Show:
* Event Name
* Opponent
* Date
* Weight Agreement
Buttons:
* ✅ Accept Match
* ❌ Reject Match

🔹 C. Fighter Status Badge
* 🟢 Available
* 🔵 Scheduled
* 🟡 Resting
* 🔴 Not Eligible

🔹 D. Notifications (Critical)
Club should receive:
* “Fighter selected for match”
* “Match awaiting confirmation”
* “Event approved”

🚨 5. Missing Logic You Should Add
🔥 A. Auto Block Rules
System should prevent club from confirming if:
* Medical expired
* Fighter in rest period
* Fighter already scheduled

🔥 B. Fighter Ownership Rule
* Each fighter:
    * Must belong to 1 club only
* Prevent duplicate fighters across clubs

🔥 C. Foreign Fighter Flow
Add:
* Passport validation
* Temporary approval by KKF
