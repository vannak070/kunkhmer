// KKF Champion System
// Complete champion management with types, lifecycle, and weight classes

export type ChampionType = 
  // 🏷 Belt Titles
  | "KKF National"          // KKF National Championship Belt
  | "ISKA Cambodia"         // ISKA Cambodia Championship Belt
  | "IPCC International"    // IPCC International Championship Belt
  | "International Belt"    // General International Championship Belt
  | "Interim Belt"          // Interim Championship Belt (temporary)
  | "Super Fight Belt"      // Special Super Fight Championship Belt
  | "Sponsor Belt"          // Sponsor-backed Championship Belt
  // 🏆 Non-Belt Awards
  | "Trophy"                // Trophy Award
  | "Tournament Winner"     // Tournament Winner Award
  | "Honorary Award";       // Honorary Award/Recognition

export type ChampionStatus =
  | "Active"                    // Currently holding title, in good standing
  | "Title Defense Scheduled"   // Has upcoming scheduled title defense
  | "Inactive"                  // Champion inactive (injury, suspension, etc.)
  | "Vacant";                   // Title available - no current holder

export type SpecialTitle =
  | "Fighter of the Year"
  | "Knockout of the Year"
  | "Rising Star"
  | "Hall of Fame";

export interface Champion {
  id: string;
  
  // Title Info (Core - Champion is a TITLE, not a fighter)
  titleName: string;              // e.g., "KKF National Champion 65kg"
  championType: ChampionType;
  weightClass: number;             // Actual weight in kg (e.g., 60, 65, 70)
  organization: "KKF" | "WBC" | "WBA" | "WMC" | "Other";
  
  // Event/Batch Association
  batchId: string;                // The batch/event this championship belongs to
  eventName: string;              // Display name of the event
  
  // Current Holder (nullable - can be vacant)
  currentHolderId?: string;       // Fighter ID who currently holds this title
  currentHolderName?: string;     // Fighter name (for display)
  currentHolderPhoto?: string;    // Fighter photo
  nationality?: string;           // Current holder's nationality
  
  // Title History
  dateCreated: string;            // When the championship was created
  dateAwarded?: string;           // When it was last awarded to a fighter
  winningMatchId?: string;        // Match that awarded the current title
  
  // Status & Lifecycle
  status: ChampionStatus;
  defenseCount: number;           // Number of successful title defenses by current holder
  lastDefenseDate?: string;       // ISO date of last defense
  nextDefenseDeadline?: string;   // Must defend by this date
  
  // Special Titles (Optional)
  specialTitles?: SpecialTitle[];
  
  // Belt/Trophy Info
  beltImageUrl?: string;
  trophyImageUrl?: string;
  certificateUrl?: string;
  
  // Metadata
  notes?: string;
  createdAt: string;
  updatedAt: string;
  approvalStatus?: "pending" | "approved" | "rejected";
}

export interface ChampionDefense {
  id: string;
  championId: string;
  eventId: string;
  eventName: string;
  matchId: string;
  date: string;
  opponent: string;
  opponentId: string;
  result: "Won" | "Lost" | "Draw";
  method?: string;  // KO, Decision, etc.
  round?: number;
}

// Champion Type Configuration
export const CHAMPION_TYPE_CONFIG: Record<ChampionType, {
  label: string;
  icon: string;
  color: string;
  bgColor: string;
  description: string;
}> = {
  "KKF National": {
    label: "KKF National Champion",
    icon: "🥇",
    color: "text-[#0A3D91]",
    bgColor: "bg-blue-50",
    description: "Top fighter in Cambodia (by weight class) - Managed by KKF"
  },
  "ISKA Cambodia": {
    label: "ISKA Cambodia Champion",
    icon: "🌍",
    color: "text-purple-600",
    bgColor: "bg-purple-50",
    description: "Competing with foreign opponents - World/Regional titles"
  },
  "IPCC International": {
    label: "IPCC International Champion",
    icon: "🌍",
    color: "text-purple-600",
    bgColor: "bg-purple-50",
    description: "Competing with foreign opponents - World/Regional titles"
  },
  "International Belt": {
    label: "International Champion",
    icon: "🌍",
    color: "text-purple-600",
    bgColor: "bg-purple-50",
    description: "Competing with foreign opponents - World/Regional titles"
  },
  "Interim Belt": {
    label: "Interim Champion",
    icon: "⏳",
    color: "text-amber-600",
    bgColor: "bg-amber-50",
    description: "Temporary champion when main champion is inactive"
  },
  "Super Fight Belt": {
    label: "Super Fight Champion",
    icon: "👑",
    color: "text-[#F2C94C]",
    bgColor: "bg-yellow-50",
    description: "Special Super Fight Championship Belt"
  },
  "Sponsor Belt": {
    label: "Sponsor Champion",
    icon: "🏆",
    color: "text-[#C8102E]",
    bgColor: "bg-red-50",
    description: "Sponsor-backed Championship Belt"
  },
  "Trophy": {
    label: "Trophy Award",
    icon: "🏆",
    color: "text-[#C8102E]",
    bgColor: "bg-red-50",
    description: "Trophy Award"
  },
  "Tournament Winner": {
    label: "Tournament Winner",
    icon: "🏆",
    color: "text-[#C8102E]",
    bgColor: "bg-red-50",
    description: "Tournament Winner Award"
  },
  "Honorary Award": {
    label: "Honorary Award",
    icon: "🏆",
    color: "text-[#C8102E]",
    bgColor: "bg-red-50",
    description: "Honorary Award/Recognition"
  }
};

// Champion Status Configuration
export const CHAMPION_STATUS_CONFIG: Record<ChampionStatus, {
  label: string;
  color: string;
  bgColor: string;
}> = {
  "Active": {
    label: "Active",
    color: "text-green-700",
    bgColor: "bg-green-100"
  },
  "Title Defense Scheduled": {
    label: "Title Defense Scheduled",
    color: "text-blue-700",
    bgColor: "bg-blue-100"
  },
  "Inactive": {
    label: "Inactive",
    color: "text-amber-700",
    bgColor: "bg-amber-100"
  },
  "Vacant": {
    label: "Vacant",
    color: "text-gray-700",
    bgColor: "bg-gray-100"
  }
};

// Weight Classes (Common in Kun Khmer)
export const WEIGHT_CLASSES = [
  51, // Flyweight
  54, // Bantamweight
  57, // Featherweight
  60, // Lightweight
  63.5, // Super Lightweight
  67, // Welterweight
  70, // Super Welterweight
  75, // Middleweight
  80, // Super Middleweight
  85, // Light Heavyweight
  90, // Cruiserweight
  95, // Heavyweight
  100, // Super Heavyweight
];

export function getWeightClassName(weight: number): string {
  const classes: Record<number, string> = {
    51: "Flyweight (51kg)",
    54: "Bantamweight (54kg)",
    57: "Featherweight (57kg)",
    60: "Lightweight (60kg)",
    63.5: "Super Lightweight (63.5kg)",
    67: "Welterweight (67kg)",
    70: "Super Welterweight (70kg)",
    75: "Middleweight (75kg)",
    80: "Super Middleweight (80kg)",
    85: "Light Heavyweight (85kg)",
    90: "Cruiserweight (90kg)",
    95: "Heavyweight (95kg)",
    100: "Super Heavyweight (100kg)",
  };
  return classes[weight] || `${weight}kg`;
}

// Mock Champions Data
export const MOCK_CHAMPIONS: Champion[] = [
  {
    id: "champ-001",
    titleName: "KKF National Champion 70kg",
    championType: "KKF National",
    weightClass: 70,
    organization: "KKF",
    batchId: "batch-001",
    eventName: "KUN KHMER Championship 2026",
    currentHolderId: "f1",
    currentHolderName: "Sok Thy",
    currentHolderPhoto: "https://images.unsplash.com/photo-1549719386-74dfcbf7dbed?w=400",
    nationality: "Cambodia",
    dateCreated: "2026-01-01T00:00:00Z",
    dateAwarded: "2026-02-15T18:00:00Z",
    winningMatchId: "match-001",
    status: "Active",
    defenseCount: 3,
    lastDefenseDate: "2026-03-15",
    nextDefenseDeadline: "2026-06-15",
    notes: "Dominant performance in all title defenses",
    createdAt: "2026-02-15T18:00:00Z",
    updatedAt: "2026-03-15T20:30:00Z"
  },
  {
    id: "champ-002",
    titleName: "ISKA Cambodia Champion 60kg",
    championType: "ISKA Cambodia",
    weightClass: 60,
    organization: "KKF",
    batchId: "batch-002",
    eventName: "New Year Fight Night",
    currentHolderId: "f3",
    currentHolderName: "Kimsan Vorn",
    currentHolderPhoto: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400",
    nationality: "Cambodia",
    dateCreated: "2026-01-01T00:00:00Z",
    dateAwarded: "2026-01-20T19:00:00Z",
    winningMatchId: "match-002",
    status: "Title Defense Scheduled",
    defenseCount: 2,
    lastDefenseDate: "2026-02-28",
    nextDefenseDeadline: "2026-05-28",
    specialTitles: ["Fighter of the Year"],
    notes: "Rising star with exceptional technique",
    createdAt: "2026-01-20T19:00:00Z",
    updatedAt: "2026-02-28T21:00:00Z"
  },
  {
    id: "champ-003",
    titleName: "IPCC International Champion 65kg",
    championType: "IPCC International",
    weightClass: 65,
    organization: "WMC",
    batchId: "batch-003",
    eventName: "WMC World Championship 2025",
    currentHolderId: "f5",
    currentHolderName: "Chantha Pov",
    currentHolderPhoto: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400",
    nationality: "Cambodia",
    dateCreated: "2025-10-01T00:00:00Z",
    dateAwarded: "2025-11-10T20:00:00Z",
    status: "Active",
    defenseCount: 1,
    lastDefenseDate: "2026-02-05",
    nextDefenseDeadline: "2026-05-05",
    notes: "First Cambodian IPCC champion in 65kg division",
    createdAt: "2025-11-10T20:00:00Z",
    updatedAt: "2026-02-05T22:00:00Z"
  },
  {
    id: "champ-004",
    titleName: "Super Fight Belt 75kg",
    championType: "Super Fight Belt",
    weightClass: 75,
    organization: "Other",
    batchId: "batch-004",
    eventName: "MAS Fight Season 1 Finale",
    currentHolderId: "f7",
    currentHolderName: "Sopheak Meas",
    nationality: "Cambodia",
    dateCreated: "2026-02-01T00:00:00Z",
    dateAwarded: "2026-03-01T21:00:00Z",
    status: "Active",
    defenseCount: 0,
    notes: "Event tournament champion",
    createdAt: "2026-03-01T21:00:00Z",
    updatedAt: "2026-03-01T21:00:00Z"
  },
  {
    id: "champ-005",
    titleName: "Interim Belt 67kg",
    championType: "Interim Belt",
    weightClass: 67,
    organization: "KKF",
    batchId: "batch-005",
    eventName: "Interim Title Fight Night",
    currentHolderId: "f9",
    currentHolderName: "Ratanak Seng",
    nationality: "Cambodia",
    dateCreated: "2026-01-15T00:00:00Z",
    dateAwarded: "2026-02-20T19:30:00Z",
    status: "Active",
    defenseCount: 0,
    nextDefenseDeadline: "2026-04-20",
    notes: "Interim champion while main champion recovers from injury",
    createdAt: "2026-02-20T19:30:00Z",
    updatedAt: "2026-02-20T19:30:00Z"
  },
  {
    id: "champ-006",
    titleName: "KKF National Champion 85kg",
    championType: "KKF National",
    weightClass: 85,
    organization: "KKF",
    batchId: "batch-006",
    eventName: "Year End Championship",
    currentHolderId: "f11",
    currentHolderName: "Dara Kong",
    nationality: "Cambodia",
    dateCreated: "2025-11-01T00:00:00Z",
    dateAwarded: "2025-12-15T20:00:00Z",
    status: "Inactive",
    defenseCount: 2,
    lastDefenseDate: "2026-01-15",
    notes: "Currently inactive due to training abroad",
    createdAt: "2025-12-15T20:00:00Z",
    updatedAt: "2026-01-15T21:00:00Z"
  },
  {
    id: "champ-007",
    titleName: "KKF National Champion Women's 54kg",
    championType: "KKF National",
    weightClass: 54,
    organization: "KKF",
    batchId: "batch-007",
    eventName: "Women's Fight Night 2026",
    currentHolderId: "f13",
    currentHolderName: "Bopha Lim",
    nationality: "Cambodia",
    dateCreated: "2026-02-15T00:00:00Z",
    dateAwarded: "2026-03-08T19:00:00Z",
    status: "Active",
    defenseCount: 0,
    specialTitles: ["Rising Star"],
    notes: "First women's champion in the new KKF system",
    createdAt: "2026-03-08T19:00:00Z",
    updatedAt: "2026-03-08T19:00:00Z"
  },
  {
    id: "champ-008",
    titleName: "International Belt 70kg - VACANT",
    championType: "International Belt",
    weightClass: 70,
    organization: "KKF",
    batchId: "batch-008",
    eventName: "International Fight Night 2026",
    dateCreated: "2026-03-01T00:00:00Z",
    status: "Vacant",
    defenseCount: 0,
    notes: "Championship available - schedule a title fight to crown the first champion",
    createdAt: "2026-03-01T00:00:00Z",
    updatedAt: "2026-03-01T00:00:00Z"
  },
  {
    id: "champ-009",
    titleName: "Sponsor Belt 63.5kg - VACANT",
    championType: "Sponsor Belt",
    weightClass: 63.5,
    organization: "Other",
    batchId: "batch-009",
    eventName: "Sponsor Championship Event",
    dateCreated: "2026-02-20T00:00:00Z",
    status: "Vacant",
    defenseCount: 0,
    notes: "Sponsor-backed championship belt waiting for challengers",
    createdAt: "2026-02-20T00:00:00Z",
    updatedAt: "2026-02-20T00:00:00Z"
  },
  {
    id: "champ-010",
    titleName: "Tournament Winner Trophy 2026",
    championType: "Tournament Winner",
    weightClass: 67,
    organization: "KKF",
    batchId: "batch-010",
    eventName: "KKF Grand Tournament 2026",
    currentHolderId: "f15",
    currentHolderName: "Veasna Chhay",
    nationality: "Cambodia",
    dateCreated: "2026-01-10T00:00:00Z",
    dateAwarded: "2026-02-25T20:00:00Z",
    status: "Active",
    defenseCount: 0,
    notes: "Tournament winner - non-belt award",
    createdAt: "2026-02-25T20:00:00Z",
    updatedAt: "2026-02-25T20:00:00Z"
  }
];

// Helper functions
export function getChampionsByType(type: ChampionType): Champion[] {
  return MOCK_CHAMPIONS.filter(c => c.championType === type);
}

export function getChampionsByWeightClass(weight: number): Champion[] {
  return MOCK_CHAMPIONS.filter(c => c.weightClass === weight);
}

export function getActiveChampions(): Champion[] {
  return MOCK_CHAMPIONS.filter(c => c.status === "Active" || c.status === "Title Defense Scheduled");
}

export function getChampionsByStatus(status: ChampionStatus): Champion[] {
  return MOCK_CHAMPIONS.filter(c => c.status === status);
}

export function getChampionById(id: string): Champion | undefined {
  return MOCK_CHAMPIONS.find(c => c.id === id);
}

export function hasActiveChampionInWeightClass(type: ChampionType, weight: number): boolean {
  return MOCK_CHAMPIONS.some(
    c => c.championType === type && 
         c.weightClass === weight && 
         (c.status === "Active" || c.status === "Title Defense Scheduled")
  );
}

// Ensure all initial mock champions have an approvalStatus
MOCK_CHAMPIONS.forEach((c: any) => {
  if (!c.hasOwnProperty('approvalStatus')) {
    c.approvalStatus = 'approved';
  }
});