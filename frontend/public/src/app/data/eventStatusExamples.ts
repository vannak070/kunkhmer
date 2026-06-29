// Example events showcasing all 11 event statuses
// For demonstration and testing purposes

import type { EventStatus } from "./eventStatuses";

export interface ExampleEvent {
  id: string;
  name: string;
  status: EventStatus;
  location: string;
  date: string;
  description: string;
  scenario: string;
}

export const EVENT_STATUS_EXAMPLES: ExampleEvent[] = [
  // 1. Draft
  {
    id: "ex1",
    name: "Khmer Warriors Championship 2026",
    status: "Draft",
    location: "Olympic Stadium, Phnom Penh",
    date: "2026-06-15",
    description: "Major championship event being planned",
    scenario: "Organizer just created the event. Adding sponsors and details before submission."
  },

  // 2. Submitted
  {
    id: "ex2",
    name: "Battambang Fight Night Vol. 8",
    status: "Submitted",
    location: "Battambang Arena",
    date: "2026-05-20",
    description: "Regional fight night submitted for approval",
    scenario: "Event submitted to KKF yesterday. Waiting for initial review. Has 3 sponsors confirmed."
  },

  // 3. Under Review
  {
    id: "ex3",
    name: "Siem Reap Warriors vs The World",
    status: "Under Review",
    location: "Angkor Complex Arena",
    date: "2026-06-01",
    description: "International matchup event under KKF review",
    scenario: "KKF Officer is actively reviewing event details, verifying international fighter compliance and sponsor legitimacy."
  },

  // 4. Approved
  {
    id: "ex4",
    name: "Golden Fist Tournament 2026",
    status: "Approved",
    location: "Koh Pich Convention Center",
    date: "2026-07-10",
    description: "Premier tournament approved by KKF",
    scenario: "✅ KKF approved! Organizer can now create match proposals and build the fight card. Gate unlocked for matchmaking."
  },

  // 5. Rejected
  {
    id: "ex5",
    name: "Kampot Coastal Combat",
    status: "Rejected",
    location: "Kampot Beach Arena",
    date: "2026-05-05",
    description: "Event rejected due to sponsor issues",
    scenario: "❌ KKF rejected because main sponsor is not verified. Organizer needs to update sponsor info and resubmit."
  },

  // 6. Match Preparation
  {
    id: "ex6",
    name: "Night of Champions: May Edition",
    status: "Match Preparation",
    location: "CTN Studio Arena",
    date: "2026-05-25",
    description: "Building fight card with 8 matches planned",
    scenario: "Event approved. Organizer has created 8 match proposals. 5 matches already club-confirmed. Building complete fight card."
  },

  // 7. Weigh-In Completed
  {
    id: "ex7",
    name: "Thunder in Phnom Penh Vol. 12",
    status: "Weigh-In Completed",
    location: "Phnom Penh Olympic Stadium",
    date: "2026-04-05",
    description: "All fighters weighed in, ready to fight tomorrow",
    scenario: "Official weigh-in completed this morning. All 10 matches verified. Fighters ready. Event starts tomorrow night."
  },

  // 8. Live
  {
    id: "ex8",
    name: "Khmer New Year Mega Fight 2026",
    status: "Live",
    location: "National Olympic Stadium",
    date: "2026-04-14",
    description: "🔥 LIVE NOW - Major New Year celebration event",
    scenario: "🔥 EVENT IS LIVE! Currently on Match 6 of 12. Broadcast ongoing on Bayon TV. Crowd of 15,000+. Exciting main event coming up!"
  },

  // 9. Results Pending
  {
    id: "ex9",
    name: "Provincial Champions League Round 3",
    status: "Results Pending",
    location: "Kandal Sports Complex",
    date: "2026-03-28",
    description: "All matches finished, waiting for official results",
    scenario: "Event finished last night. All 8 matches completed. KKF officer reviewing and finalizing official results before closure."
  },

  // 10. Completed
  {
    id: "ex10",
    name: "Victory Grand Prix 2026 - Q1",
    status: "Completed",
    location: "Koh Pich Hall",
    date: "2026-03-15",
    description: "Successfully completed event with all results archived",
    scenario: "✅ Event successfully completed 5 days ago. 12 matches, all results verified and archived. Available for historical viewing."
  },

  // 11. Cancelled
  {
    id: "ex11",
    name: "Coastal Showdown 2026",
    status: "Cancelled",
    location: "Sihanoukville Arena",
    date: "2026-05-30",
    description: "Event cancelled due to venue issues",
    scenario: "⚪ Event cancelled by organizer due to venue unavailability. Fighters notified. Refunds processed. Archived as cancelled."
  }
];

// Get example by status
export function getExampleByStatus(status: EventStatus): ExampleEvent | undefined {
  return EVENT_STATUS_EXAMPLES.find(e => e.status === status);
}

// Get all examples
export function getAllExamples(): ExampleEvent[] {
  return EVENT_STATUS_EXAMPLES;
}

// Status transition examples
export const STATUS_TRANSITION_EXAMPLES = {
  "Draft → Submitted": {
    description: "Organizer submits event after adding sponsors",
    requirements: ["At least 1 sponsor", "TV station", "Complete event details"],
    action: "Click 'Submit to KKF' button"
  },
  
  "Submitted → Under Review": {
    description: "KKF officer begins active review",
    requirements: ["KKF officer assigned", "Event in queue"],
    action: "KKF clicks 'Start Review'"
  },
  
  "Under Review → Approved": {
    description: "KKF approves event after successful review",
    requirements: ["All compliance checks passed", "Sponsors verified", "No issues found"],
    action: "KKF clicks 'Approve Event' ✅"
  },
  
  "Under Review → Rejected": {
    description: "KKF rejects event with comments",
    requirements: ["Issues identified", "Comments provided"],
    action: "KKF clicks 'Reject Event' with reason"
  },
  
  "Approved → Match Preparation": {
    description: "Organizer creates first match proposal",
    requirements: ["Event approved", "At least 1 match created"],
    action: "Organizer creates match - Auto-transitions"
  },
  
  "Match Preparation → Weigh-In Completed": {
    description: "All fighters complete official weigh-in",
    requirements: ["All matches have fighters", "All fighters weighed in", "Weights verified"],
    action: "KKF completes final weigh-in"
  },
  
  "Weigh-In Completed → Live": {
    description: "Event officially starts",
    requirements: ["Weigh-in done", "Officials assigned", "Ready to start"],
    action: "Organizer clicks 'Start Event' 🔥"
  },
  
  "Live → Results Pending": {
    description: "All matches finished",
    requirements: ["All matches completed", "Results recorded"],
    action: "Last match completed - Auto-transitions"
  },
  
  "Results Pending → Completed": {
    description: "KKF verifies and finalizes all results",
    requirements: ["All results verified", "No disputes", "Official records complete"],
    action: "KKF clicks 'Close Event' ✅"
  },
  
  "Rejected → Draft": {
    description: "Organizer edits rejected event",
    requirements: ["Event rejected", "Issues fixed"],
    action: "Organizer edits event - Auto-transitions to Draft"
  },
  
  "Any → Cancelled": {
    description: "Event cancelled by organizer or KKF",
    requirements: ["Valid cancellation reason"],
    action: "Click 'Cancel Event' with reason"
  }
};
