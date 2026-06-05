🥊 Kun Khmer System – Function-Based Requirements (Figma Ready)
1️⃣ Fighter Function – Add / Manage Fighters
🧾 Personal Identity & KYC (Critical)

Required Fields:

Full Name (Khmer & English, dual-language support)

Date of Birth → auto-calculate age

Place of Birth (Country, Province/City)

Nationality

Gender

Marital Status (Single / Married / Divorced / Widowed)

Government ID / Passport:

ID Type (National ID / Passport)

ID Number (unique validation)

Issue Date / Expiry Date

Issuing Country

Upload Document (Front/Back or Passport Scan)

Address & Residency (Optional but Recommended):

Current Address, City/Province, Country, Postal Code

Residence Type (Permanent / Temporary / Camp-based)

Contact & Emergency (Very Important)

Primary Phone (required), Secondary Phone (optional)

Email Address

Emergency Contact (Name, Relationship, Phone)

Medical & Health Declaration (High Priority)

Blood Type, Known Medical Conditions, Allergies

Current Medications, Last Medical Check Date, Medical Clearance Expiry

Optional: Doctor/Clinic Name, Insurance Provider, Insurance Number

Legal & Compliance

✅ Accept Terms & Conditions

✅ Consent to Compete

✅ Medical Fitness Declaration

Optional: Guardian Info (if underage)

System Status & Verification

KYC Status: Pending / Verified / Rejected

Eligibility Status: Eligible / Suspended / Medical Expired / Rest Period Active

Fighter Background (Optional but High Value)

Years of Experience

Fighting Style (required)

Preferred Weight Class

Reach / Height

Trainer Name

⚙️ Fighter System Logic

Age Validation: Configurable minimum age (e.g., 18)

Rest Period Rule: Block fighter <10 days after last fight

Medical Expiry Rule: Block fighter if medical clearance expired

Duplicate Prevention: Unique by ID number and Name+DOB combo

Fight Availability:

Upcoming Fight → Status Scheduled

<10 days after last fight → Status Resting

No fights → Status Available

Medical expired → Status Not Eligible

📱 UI/UX Recommendations

Fighter Card: Next Fight Date, Event Name, Opponent Name, Status Badge

Fighter Detail Page: Upcoming Fight section, Medical & KYC summary

Dashboard Widget: Fighters available for matchmaking, upcoming fights

Smart Features: Auto suggest opponents, notifications for upcoming fights

Calendar View: Filter by fighter/gym, visualize all scheduled fights

2️⃣ Event Function – Federation Approval Flow
🧭 Event Status Workflow

Draft → Submitted → Under Review → Approved ✅ / Rejected ❌ / Cancelled

🏛️ Federation Role

Federation Admin: Review events, Approve/Reject, Add Comments, Lock approved events

🔄 Event Submission Flow

Promoter creates Draft → Submit to Federation → Status = Submitted

Federation Reviews → Approve / Reject → System updates

⚠️ Validation Before Submission

Fighter KYC verified

Rest period >10 days

Medical valid

Weight Class match

Complete fight card

🔒 Post-Approval Rules

Lock fight card & fighters

Event becomes Official

Results count toward ranking

📱 UI/UX

Event Card with status badges (Pending, Under Review, Approved, Rejected)

Event Detail Page: Federation Status, Reviewed by, Date, Comments

Buttons: “Submit to Federation” (Draft only), “Request Change” (Approved only)

🔔 Notifications

Promoter / Federation updates on approval, rejection, or revision request

3️⃣ Match Function – Post-Approval Matchmaking
⚖️ Fighter Eligibility Rules

KYC Verified

Medical Valid

Rest Period Passed (>10 days)

No Upcoming Fight Conflict

Active Status (not suspended)

🔹 Match Fairness Rules

Weight Class ±1–2 kg tolerance

Fighter Grade ±1 level

Experience Balance (Fight count difference ≤ configurable)

Optional: Ranking alignment

🚫 Prohibited Matches

Same fighter scheduled twice

Fighter in rest period

Large weight mismatch

Invalid medical status

Suspended fighter

🔄 Match Creation Workflow

Event Approved → Organizer adds matches

System validates fighters → Saves Draft

Submit to Federation → Federation Approves → Matches Locked

📱 UI/UX

Match Creation Screen: Fighter vs Fighter comparison (Weight, Record, Grade, Ranking)

Fighter Selection Modal: Filters by Availability, Weight Class, Grade, Gym

Notifications: Fighter, Coach, Federation

🤖 Smart Features

Suggested Matchmaking (Balanced opponent)

Risk Detection (Suspicious fights flagged)

4️⃣ Club Function – Governance & Approval
🧭 Club Lifecycle Status

Draft → Submitted → Under Review → Approved ✅ / Rejected ❌ / Suspended 🚫 / Revoked ❌

🏢 Parent Federation Requirement

Must belong to recognized federation

Mandatory fields: Parent Federation ID, Name, Region/Province

📋 Club Registration Requirements

Name (Khmer & English), Founded Date, Club Type

Address, Province/City, Country

Owner/Manager Name, Contact, Email

Head Coach: Name, Certification, License Number

Documents: Business Registration, Coach Certification, Club Photos

⚖️ Approval Conditions

Valid Federation Link

Complete Info & Verified Documents

Physical Existence

No duplicate club

🔍 KKF Review Screen (UI)

Club details, Federation info, Documents preview, Coach info

Actions: Approve / Reject / Request More Info

🔒 Post-Approval Rules

Club selectable

Can register fighters & join events

Cannot edit critical info without approval

Suspension rules enforced

5️⃣ Rule Function – Core Improvements
A. Event Approval & Enforcement

Validate fighter eligibility, schedule conflicts, venue safety

Auto-block non-compliant match creation

B. Fighter Compliance

Mandatory KYC, marital status, federation grade

Prevent unregistered fighters from events

C. Match & Scoring Rules

Grade-based max rounds, time per round, allowed techniques

Automatic disqualification for rule violations

D. Club & Federation Integration

Clubs must belong to parent federation

Only matches from approved clubs allowed

E. Rule Function Features

Rule Library with version control

Validation Engine

Notifications for violations

Audit Trail

6️⃣ Notification Function – Real-Time Alerts
Triggers

Fighter: Missing KYC, match schedule, cancellation, rule violations

Organizer: Event pending approval, match readiness, club issues

Federation: New events, rule violations, fighter KYC issues, pending results

Channels

In-App Push, Email, SMS/WhatsApp (optional), Dashboard Alerts

Content

Title, Message, Action Button, Timestamp

Workflow

Trigger → Validation → Generate Notification → User Action → Update System

Optional Features

History log, Escalation, Notification preferences

7️⃣ Result Update – Post-Match
Workflow

Event Completion → Status = Pending Results → Notify KKF Officer

Result Entry → Winner/Loser, Score, Rounds, Fouls, Method

Confirmation & Audit → Timestamp, Officer ID, Immutable audit trail

Automatic Updates → Rankings, Event Completed, Notifications

Optional Features

Dispute Handling

Batch Upload (Excel/CSV)

Public Result Portal

UI/UX

Result Dashboard: List matches, validation indicators, confirm button

Highlight missing data

History tab for audit

✅ Summary for Figma AI

Separate functions: Fighter, Event, Match, Club, Rule, Notification, Result

Highlight mandatory vs optional fields

Add system logic / validations as separate layer for AI to propose UI/UX improvements

Include smart features: auto-suggestions, notifications, conflict detection

Use status badges and visual indicators consistently

Add audit trails and approval layers for federation governance