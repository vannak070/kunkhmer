// Event Status Configuration for KUN KHMER Platform
// 11-step comprehensive event lifecycle tracking

export type EventStatus = 
  | "Draft"
  | "Submitted"
  | "Under Review"
  | "Approved"
  | "Rejected"
  | "Match Preparation"
  | "Weigh-In Completed"
  | "Live"
  | "Results Pending"
  | "Completed"
  | "Cancelled";

export interface EventStatusConfig {
  value: EventStatus;
  label: string;
  icon: string;
  color: string;
  bgColor: string;
  borderColor: string;
  description: string;
  organizerCanEdit: boolean;
  canCreateMatches: boolean;
  conditions: string[];
  organizerActions: string[];
  kkfActions: string[];
}

export const EVENT_STATUS_CONFIG: Record<EventStatus, EventStatusConfig> = {
  "Draft": {
    value: "Draft",
    label: "Draft",
    icon: "🟡",
    color: "text-yellow-700",
    bgColor: "bg-yellow-50",
    borderColor: "border-yellow-300",
    description: "Event is created but not yet submitted",
    organizerCanEdit: true,
    canCreateMatches: false,
    conditions: [
      "Event is created",
      "Basic information added",
      "Not yet submitted to KKF"
    ],
    organizerActions: [
      "Edit event details",
      "Add sponsors",
      "Add TV station",
      "Submit to KKF when ready"
    ],
    kkfActions: []
  },
  
  "Submitted": {
    value: "Submitted",
    label: "Submitted",
    icon: "🔵",
    color: "text-blue-700",
    bgColor: "bg-blue-50",
    borderColor: "border-blue-300",
    description: "Event is submitted to Kun Khmer Federation (KKF) - Waiting for review",
    organizerCanEdit: false,
    canCreateMatches: false,
    conditions: [
      "Event submitted to KKF",
      "Has at least 1 sponsor",
      "Has TV station/broadcaster",
      "Locked for major edits"
    ],
    organizerActions: [
      "Wait for KKF review",
      "Monitor status"
    ],
    kkfActions: [
      "Begin review process",
      "Move to 'Under Review'"
    ]
  },

  "Under Review": {
    value: "Under Review",
    label: "Under Review",
    icon: "🟣",
    color: "text-purple-700",
    bgColor: "bg-purple-50",
    borderColor: "border-purple-300",
    description: "KKF is actively reviewing the event",
    organizerCanEdit: false,
    canCreateMatches: false,
    conditions: [
      "KKF officer is reviewing",
      "Event details being verified",
      "Sponsors being checked",
      "Compliance review in progress"
    ],
    organizerActions: [
      "Wait for review completion",
      "Respond to KKF queries if needed"
    ],
    kkfActions: [
      "Review event details",
      "Verify sponsors",
      "Check compliance",
      "Approve or Reject"
    ]
  },

  "Approved": {
    value: "Approved",
    label: "Approved ✅",
    icon: "🟢",
    color: "text-green-700",
    bgColor: "bg-green-50",
    borderColor: "border-green-300",
    description: "Event is officially approved by KKF - Trigger point for matchmaking",
    organizerCanEdit: false,
    canCreateMatches: true,
    conditions: [
      "KKF approved the event",
      "Event sanctioned",
      "Gate unlocked for match creation"
    ],
    organizerActions: [
      "✅ Create match proposals",
      "✅ Assign fighters",
      "✅ Build fight card",
      "✅ Start matchmaking"
    ],
    kkfActions: [
      "Monitor match creation",
      "Oversee fight card building"
    ]
  },

  "Rejected": {
    value: "Rejected",
    label: "Rejected ❌",
    icon: "🔴",
    color: "text-red-700",
    bgColor: "bg-red-50",
    borderColor: "border-red-300",
    description: "Event is not approved - KKF provides comments",
    organizerCanEdit: true,
    canCreateMatches: false,
    conditions: [
      "KKF rejected the event",
      "Issues with sponsors, venue, or compliance",
      "Comments provided by KKF"
    ],
    organizerActions: [
      "Review KKF comments",
      "Edit event details",
      "Fix issues",
      "Resubmit to KKF"
    ],
    kkfActions: [
      "Provide rejection reasons",
      "Guide organizer on fixes needed"
    ]
  },

  "Match Preparation": {
    value: "Match Preparation",
    label: "Match Preparation",
    icon: "🟠",
    color: "text-orange-700",
    bgColor: "bg-orange-50",
    borderColor: "border-orange-300",
    description: "Matches are being created and confirmed - Fight card being built",
    organizerCanEdit: false,
    canCreateMatches: true,
    conditions: [
      "Event is approved",
      "At least 1 match created",
      "Matches being confirmed by clubs",
      "Fight card in progress"
    ],
    organizerActions: [
      "Continue creating matches",
      "Wait for club confirmations",
      "Assign confirmed matches to event",
      "Finalize fight card"
    ],
    kkfActions: [
      "Monitor match creation",
      "Review fight card"
    ]
  },

  "Weigh-In Completed": {
    value: "Weigh-In Completed",
    label: "Weigh-In Completed",
    icon: "🟤",
    color: "text-amber-800",
    bgColor: "bg-amber-50",
    borderColor: "border-amber-400",
    description: "Fighters have completed weigh-in - Matches are finalized - Event ready to go live",
    organizerCanEdit: false,
    canCreateMatches: false,
    conditions: [
      "All fighters weighed in",
      "Weights verified",
      "Matches finalized",
      "Event ready to start"
    ],
    organizerActions: [
      "Prepare for event",
      "Final checks",
      "Start event when ready"
    ],
    kkfActions: [
      "Verify weigh-in results",
      "Assign officials",
      "Final compliance check"
    ]
  },

  "Live": {
    value: "Live",
    label: "Live / Ongoing 🔥",
    icon: "🔥",
    color: "text-red-600",
    bgColor: "bg-red-100",
    borderColor: "border-red-400",
    description: "Event is currently happening - Matches in progress",
    organizerCanEdit: false,
    canCreateMatches: false,
    conditions: [
      "Event has started",
      "Matches in progress",
      "Live broadcast ongoing",
      "Officials present"
    ],
    organizerActions: [
      "Monitor event progress",
      "Coordinate with broadcast",
      "Manage event logistics"
    ],
    kkfActions: [
      "Start matches",
      "Record results",
      "Manage officials",
      "Ensure compliance"
    ]
  },

  "Results Pending": {
    value: "Results Pending",
    label: "Results Pending",
    icon: "🟦",
    color: "text-cyan-700",
    bgColor: "bg-cyan-50",
    borderColor: "border-cyan-300",
    description: "Matches completed - Waiting for KKF officer to finalize results",
    organizerCanEdit: false,
    canCreateMatches: false,
    conditions: [
      "All matches finished",
      "Results recorded",
      "Waiting for KKF verification",
      "Final results pending"
    ],
    organizerActions: [
      "Wait for result verification",
      "Prepare final report"
    ],
    kkfActions: [
      "Verify match results",
      "Complete matches",
      "Finalize official records",
      "Close event"
    ]
  },

  "Completed": {
    value: "Completed",
    label: "Completed",
    icon: "⚫",
    color: "text-gray-700",
    bgColor: "bg-gray-50",
    borderColor: "border-gray-300",
    description: "Results confirmed - Event officially closed",
    organizerCanEdit: false,
    canCreateMatches: false,
    conditions: [
      "All results finalized",
      "Event officially closed",
      "Records archived",
      "Historical data"
    ],
    organizerActions: [
      "View results",
      "Access archives",
      "Generate reports"
    ],
    kkfActions: [
      "View archived data",
      "Generate statistics"
    ]
  },

  "Cancelled": {
    value: "Cancelled",
    label: "Cancelled",
    icon: "⚪",
    color: "text-gray-500",
    bgColor: "bg-gray-100",
    borderColor: "border-gray-400",
    description: "Event cancelled (by organizer or KKF)",
    organizerCanEdit: false,
    canCreateMatches: false,
    conditions: [
      "Event cancelled",
      "No longer happening",
      "Archived as cancelled"
    ],
    organizerActions: [
      "View cancellation reason"
    ],
    kkfActions: [
      "View cancellation details"
    ]
  }
};

// Status transition rules
export const STATUS_TRANSITIONS: Record<EventStatus, EventStatus[]> = {
  "Draft": ["Submitted", "Cancelled"],
  "Submitted": ["Under Review", "Cancelled"],
  "Under Review": ["Approved", "Rejected", "Cancelled"],
  "Approved": ["Match Preparation", "Cancelled"],
  "Rejected": ["Draft", "Submitted", "Cancelled"], // Can fix and resubmit
  "Match Preparation": ["Weigh-In Completed", "Approved", "Cancelled"], // Can go back to Approved if matches removed
  "Weigh-In Completed": ["Live", "Cancelled"],
  "Live": ["Results Pending"],
  "Results Pending": ["Completed"],
  "Completed": [], // Terminal state
  "Cancelled": [] // Terminal state
};

// Check if status transition is valid
export function canTransitionTo(currentStatus: EventStatus, newStatus: EventStatus): boolean {
  const allowedTransitions = STATUS_TRANSITIONS[currentStatus];
  return allowedTransitions.includes(newStatus);
}

// Get status badge classes
export function getStatusBadgeClasses(status: EventStatus): string {
  const config = EVENT_STATUS_CONFIG[status];
  return `${config.bgColor} ${config.color} ${config.borderColor}`;
}

// Get status information
export function getStatusInfo(status: EventStatus): EventStatusConfig {
  return EVENT_STATUS_CONFIG[status];
}

// Status progression order (for timeline/progress tracking)
export const STATUS_ORDER: EventStatus[] = [
  "Draft",
  "Submitted",
  "Under Review",
  "Approved",
  "Match Preparation",
  "Weigh-In Completed",
  "Live",
  "Results Pending",
  "Completed"
];

// Get status progression percentage
export function getStatusProgress(status: EventStatus): number {
  if (status === "Rejected" || status === "Cancelled") return 0;
  const index = STATUS_ORDER.indexOf(status);
  if (index === -1) return 0;
  return ((index + 1) / STATUS_ORDER.length) * 100;
}
