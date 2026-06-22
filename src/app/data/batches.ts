// Match Batch System
// Hierarchy: Event → Batch → Matches

import { MatchStatus, MatchType } from "./event-types";

export type BatchStatus = 
  | "Draft"           // Being created
  | "Pending KKF"     // Submitted to KKF, awaiting review
  | "Approved"        // Sanctioned by KKF
  | "Rejected"        // Rejected by KKF
  | "Weight-In"       // Weight-in ceremony happening
  | "Ready"           // Weight-in complete, ready for matches
  | "Live"            // Event is happening
  | "Complete"        // All matches completed with results
  | "Scheduled";      // Scheduled event batch

export interface Match {
  id: string;
  matchNumber: string;        // Unique match ID (e.g., "M-001")
  batchId: string;
  
  // Fighters
  fighterA: {
    id: string;
    name: string;
    image: string;
    weight: number;
    record: string;
    grade: string;
    clubId: string;
    clubName: string;
  };
  fighterB: {
    id: string;
    name: string;
    image: string;
    weight: number;
    record: string;
    grade: string;
    clubId: string;
    clubName: string;
  };
  
  // Match Details
  matchType: MatchType;            // Championship Bout, Ranking Fight, etc.
  weightClass: string;
  agreedWeight?: number;           // Agreed catch weight
  rounds: number;
  matchOrder: number;              // Order in the batch (1, 2, 3...)
  notes?: string;
  
  // Championship Details
  isChampionshipBout?: boolean;
  championshipId?: string;
  championshipTitle?: string;
  defendingChampion?: 'fighterA' | 'fighterB' | null;
  
  // Officials Assignment
  refereeId?: string;
  refereeName?: string;
  refereePhoto?: string;
  judgeIds?: string[];             // 3 judges
  judgeNames?: string[];
  judgePhotos?: string[];
  officialsAssignedAt?: string;
  officialsAssignedBy?: string;
  
  // Gloves & Gear Agreement
  gloveAgreement?: {
    size: string;
    brand: string;
    fighterAConfirmed: boolean;
    fighterBConfirmed: boolean;
  };
  
  // Eligibility Checks (KKF)
  eligibilityChecks?: {
    fighterAEligible: boolean;
    fighterBEligible: boolean;
    weightCheckPassed: boolean;
    medicalClearance: boolean;
    restingPeriodOk: boolean;
    gradeCompatible: boolean;
  };
  
  // Match Status & Result
  status: MatchStatus;
  winner?: string;
  winnerMethod?: "KO" | "TKO" | "Decision" | "Submission" | "Disqualification";
  winnerRound?: number;
  date?: string;
  highlightVideo?: string;  // YouTube/video URL for match highlights
  affectsRanking?: boolean;
}

export interface MatchBatch {
  id: string;
  batchNumber: string;        // e.g., "BATCH-001"
  
  // Event Link
  eventId: string;
  eventName: string;
  eventDate: string;
  subEventId?: string;
  subEventName?: string;
  
  // Batch Info
  status: BatchStatus;
  totalMatches: number;
  date: string;               // Display date
  location: string;           // Display location
  posterImage?: string;       // Event poster image for Super App display
  
  // Matches in this batch
  matches: Match[];
  
  // KKF Approval
  submittedDate?: string;
  submittedBy?: string;
  reviewedDate?: string;
  reviewedBy?: string;
  rejectionReason?: string;
  approvalNotes?: string;
  
  // Metadata
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  
  // New Fields for Enhanced Display
  organizerClub?: string;
  broadcastStation?: string;
  mainSponsor?: string;
  officialsAssigned?: boolean;
  championshipAssigned?: boolean;
  readinessPercentage?: number;
}

// Batch Status Configuration
export const BATCH_STATUS_CONFIG: Record<BatchStatus, {
  label: string;
  color: string;
  bgColor: string;
  icon: string;
}> = {
  "Draft": {
    label: "Draft",
    color: "text-gray-700",
    bgColor: "bg-gray-100",
    icon: "✏️"
  },
  "Pending KKF": {
    label: "Pending KKF",
    color: "text-amber-700",
    bgColor: "bg-amber-100",
    icon: "⏳"
  },
  "Approved": {
    label: "Approved",
    color: "text-green-700",
    bgColor: "bg-green-100",
    icon: "✅"
  },
  "Rejected": {
    label: "Rejected",
    color: "text-red-700",
    bgColor: "bg-red-100",
    icon: "❌"
  },
  "Weight-In": {
    label: "Weight-In",
    color: "text-orange-700",
    bgColor: "bg-orange-100",
    icon: "⚖️"
  },
  "Ready": {
    label: "Ready",
    color: "text-blue-700",
    bgColor: "bg-blue-100",
    icon: "💪"
  },
  "Live": {
    label: "Live",
    color: "text-purple-700",
    bgColor: "bg-purple-100",
    icon: "📅"
  },
  "Complete": {
    label: "Complete",
    color: "text-gray-700",
    bgColor: "bg-gray-100",
    icon: "🏆"
  },
  "Scheduled": {
    label: "Scheduled",
    color: "text-blue-750",
    bgColor: "bg-blue-50",
    icon: "📅"
  }
};

// Mock Batches Data
export const MOCK_BATCHES: MatchBatch[] = [
  {
    id: "batch-001",
    batchNumber: "BATCH-001",
    eventId: "e1",
    eventName: "Kun Khmer National Championship 2026",
    eventDate: "2026-04-12",
    status: "Draft",
    totalMatches: 0,
    date: "2026-04-12",
    location: "Morodok Techo National Stadium, Phnom Penh",
    organizerClub: "Olympic Club",
    broadcastStation: "Town Full HDTV",
    mainSponsor: "Carabao",
    matches: [],
    createdBy: "Olympic Club",
    createdAt: "2026-03-01T10:00:00Z",
    updatedAt: "2026-03-01T10:00:00Z"
  },
  {
    id: "batch-002",
    batchNumber: "BATCH-002",
    eventId: "e1",
    eventName: "Kun Khmer National Championship 2026",
    eventDate: "2026-04-12",
    status: "Draft",
    totalMatches: 4,
    date: "2026-04-12",
    location: "Morodok Techo National Stadium, Phnom Penh",
    organizerClub: "Olympic Club",
    broadcastStation: "Town Full HDTV",
    mainSponsor: "Carabao",
    matches: [
      {
        id: "m2-1",
        matchNumber: "M-001",
        batchId: "batch-002",
        fighterA: {
          id: "f1",
          name: "Sok Thy",
          image: "https://images.unsplash.com/photo-1549719386-74dfcbf7dbed?w=400",
          weight: 70,
          record: "12-2-0",
          grade: "A",
          clubId: "club-001",
          clubName: "Olympic Club"
        },
        fighterB: {
          id: "f2",
          name: "Chantha Pov",
          image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400",
          weight: 70,
          record: "10-3-1",
          grade: "A",
          clubId: "club-001",
          clubName: "Olympic Club"
        },
        matchType: "Championship Bout",
        weightClass: "70kg",
        agreedWeight: 70,
        rounds: 5,
        matchOrder: 1,
        isChampionshipBout: true,
        championshipTitle: "KKF National Welterweight Champion",
        status: "Draft"
      },
      {
        id: "m2-2",
        matchNumber: "M-002",
        batchId: "batch-002",
        fighterA: {
          id: "f3",
          name: "Kimsan Vorn",
          image: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400",
          weight: 60,
          record: "8-1-0",
          grade: "B",
          clubId: "club-001",
          clubName: "Olympic Club"
        },
        fighterB: {
          id: "f4",
          name: "Ratanak Seng",
          image: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400",
          weight: 60,
          record: "7-2-0",
          grade: "B",
          clubId: "club-001",
          clubName: "Olympic Club"
        },
        matchType: "Ranking Fight",
        weightClass: "60kg",
        agreedWeight: 60,
        rounds: 3,
        matchOrder: 2,
        status: "Draft"
      },
      {
        id: "m2-3",
        matchNumber: "M-003",
        batchId: "batch-002",
        fighterA: {
          id: "f5",
          name: "Sopheak Meas",
          image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400",
          weight: 75,
          record: "6-3-0",
          grade: "A",
          clubId: "club-001",
          clubName: "Olympic Club"
        },
        fighterB: {
          id: "f6",
          name: "Dara Kong",
          image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400",
          weight: 75,
          record: "5-4-0",
          grade: "A",
          clubId: "club-001",
          clubName: "Olympic Club"
        },
        matchType: "Ranking Fight",
        weightClass: "75kg",
        agreedWeight: 75,
        rounds: 3,
        matchOrder: 3,
        status: "Draft"
      },
      {
        id: "m2-4",
        matchNumber: "M-004",
        batchId: "batch-002",
        fighterA: {
          id: "f7",
          name: "Bopha Lim",
          image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400",
          weight: 54,
          record: "4-0-0",
          grade: "B",
          clubId: "club-001",
          clubName: "Olympic Club"
        },
        fighterB: {
          id: "f8",
          name: "Sreymom Chan",
          image: "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=400",
          weight: 54,
          record: "3-1-0",
          grade: "B",
          clubId: "club-001",
          clubName: "Olympic Club"
        },
        matchType: "Ranking Fight",
        weightClass: "54kg",
        agreedWeight: 54,
        rounds: 3,
        matchOrder: 4,
        notes: "Women's Division",
        status: "Draft"
      }
    ],
    createdBy: "Olympic Club",
    createdAt: "2026-03-05T10:00:00Z",
    updatedAt: "2026-03-05T10:00:00Z"
  },
  {
    id: "batch-003",
    batchNumber: "BATCH-003",
    eventId: "e2",
    eventName: "Fight Night March 30",
    eventDate: "2026-03-30",
    status: "Weight-In",
    totalMatches: 4,
    date: "2026-03-30",
    location: "Siem Reap Arena, Siem Reap",
    organizerClub: "Victory Gym",
    broadcastStation: "Bayon TV",
    mainSponsor: "Angkor Beer",
    matches: [
      {
        id: "m3-1",
        matchNumber: "M-005",
        batchId: "batch-003",
        fighterA: {
          id: "f9",
          name: "Ponleak Sor",
          image: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=400",
          weight: 67,
          record: "5-1-0",
          grade: "B",
          clubId: "club-002",
          clubName: "Victory Gym"
        },
        fighterB: {
          id: "f10",
          name: "Virak Nhem",
          image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400",
          weight: 67,
          record: "4-2-0",
          grade: "B",
          clubId: "club-002",
          clubName: "Victory Gym"
        },
        matchType: "Ranking Fight",
        weightClass: "67kg",
        agreedWeight: 67,
        rounds: 3,
        matchOrder: 1,
        status: "Weight-In"
      },
      {
        id: "m3-2",
        matchNumber: "M-006",
        batchId: "batch-003",
        fighterA: {
          id: "f11",
          name: "Vanneth Ouk",
          image: "https://images.unsplash.com/photo-1519345182560-3f2917c472ef?w=400",
          weight: 65,
          record: "5-2-0",
          grade: "B",
          clubId: "club-002",
          clubName: "Victory Gym"
        },
        fighterB: {
          id: "f12",
          name: "Piseth Nhem",
          image: "https://images.unsplash.com/photo-1531891437562-4301cf35b7e4?w=400",
          weight: 65,
          record: "4-3-0",
          grade: "B",
          clubId: "club-002",
          clubName: "Victory Gym"
        },
        matchType: "Ranking Fight",
        weightClass: "65kg",
        agreedWeight: 65,
        rounds: 3,
        matchOrder: 2,
        status: "Weight-In"
      },
      {
        id: "m3-3",
        matchNumber: "M-007",
        batchId: "batch-003",
        fighterA: {
          id: "f13",
          name: "Chakrya Heng",
          image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400",
          weight: 80,
          record: "6-2-0",
          grade: "A",
          clubId: "club-002",
          clubName: "Victory Gym"
        },
        fighterB: {
          id: "f14",
          name: "Makara Pich",
          image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400",
          weight: 80,
          record: "5-3-0",
          grade: "A",
          clubId: "club-002",
          clubName: "Victory Gym"
        },
        matchType: "Ranking Fight",
        weightClass: "80kg",
        agreedWeight: 80,
        rounds: 3,
        matchOrder: 3,
        status: "Weight-In"
      },
      {
        id: "m3-4",
        matchNumber: "M-008",
        batchId: "batch-003",
        fighterA: {
          id: "f15",
          name: "Thyda Keo",
          image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400",
          weight: 57,
          record: "3-0-0",
          grade: "B",
          clubId: "club-002",
          clubName: "Victory Gym"
        },
        fighterB: {
          id: "f16",
          name: "Leap Sok",
          image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400",
          weight: 57,
          record: "2-1-0",
          grade: "B",
          clubId: "club-002",
          clubName: "Victory Gym"
        },
        matchType: "Ranking Fight",
        weightClass: "57kg",
        agreedWeight: 57,
        rounds: 3,
        matchOrder: 4,
        status: "Weight-In"
      }
    ],
    createdBy: "Victory Gym",
    createdAt: "2026-03-10T09:00:00Z",
    updatedAt: "2026-03-10T09:00:00Z"
  },
  {
    id: "batch-004",
    batchNumber: "BATCH-004",
    eventId: "e4",
    eventName: "Youth Championship",
    eventDate: "2026-05-10",
    status: "Live",
    totalMatches: 3,
    date: "2026-05-10",
    location: "Olympic Stadium Indoor Arena, Phnom Penh",
    organizerClub: "Olympic Club",
    broadcastStation: "TVK Cambodia",
    mainSponsor: "Krud Energy",
    matches: [
      {
        id: "m4-1",
        matchNumber: "M-009",
        batchId: "batch-004",
        fighterA: {
          id: "f17",
          name: "Rithea Sok",
          image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400",
          weight: 72,
          record: "15-3-0",
          grade: "A",
          clubId: "club-001",
          clubName: "Olympic Club"
        },
        fighterB: {
          id: "f18",
          name: "Bunthoeun Chea",
          image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400",
          weight: 72,
          record: "14-4-0",
          grade: "A",
          clubId: "club-002",
          clubName: "Victory Gym"
        },
        matchType: "Championship Bout",
        weightClass: "72kg",
        agreedWeight: 72,
        rounds: 5,
        matchOrder: 1,
        isChampionshipBout: true,
        championshipTitle: "KKF National Welterweight Champion",
        refereeName: "Sopheak Chea",
        judgeNames: ["Virak Prum", "Chanthy Sok", "Dara Nhem"],
        status: "Live"
      },
      {
        id: "m4-2",
        matchNumber: "M-010",
        batchId: "batch-004",
        fighterA: {
          id: "f19",
          name: "Chanthy Prak",
          image: "https://images.unsplash.com/photo-1531891437562-4301cf35b7e4?w=400",
          weight: 51,
          record: "5-0-0",
          grade: "B",
          clubId: "club-003",
          clubName: "KKF Admin"
        },
        fighterB: {
          id: "f20",
          name: "Socheat Morn",
          image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400",
          weight: 51,
          record: "4-1-0",
          grade: "B",
          clubId: "club-003",
          clubName: "KKF Admin"
        },
        matchType: "Ranking Fight",
        weightClass: "51kg",
        agreedWeight: 51,
        rounds: 3,
        matchOrder: 2,
        refereeName: "Kimheng Long",
        judgeNames: ["Rithy Ouk", "Sophat Keo", "Chanthoeun Morn"],
        status: "Ready"
      },
      {
        id: "m4-3",
        matchNumber: "M-011",
        batchId: "batch-004",
        fighterA: {
          id: "f21",
          name: "Vuthy Chan",
          image: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=400",
          weight: 63,
          record: "3-0-0",
          grade: "C",
          clubId: "club-001",
          clubName: "Olympic Club"
        },
        fighterB: {
          id: "f22",
          name: "Piseth Lim",
          image: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400",
          weight: 63,
          record: "2-1-0",
          grade: "C",
          clubId: "club-001",
          clubName: "Olympic Club"
        },
        matchType: "Ranking Fight",
        weightClass: "63kg",
        agreedWeight: 63,
        rounds: 3,
        matchOrder: 3,
        refereeName: "Sophorn Ith",
        judgeNames: ["Seyha Prum", "Sarath Nhem", "Dara Keo"],
        status: "Ready"
      }
    ],
    createdBy: "Olympic Club",
    createdAt: "2026-03-12T10:00:00Z",
    updatedAt: "2026-03-12T10:00:00Z"
  },
  {
    id: "batch-005",
    batchNumber: "BATCH-005",
    eventId: "e5",
    eventName: "Fight Night February 2026",
    eventDate: "2026-02-20",
    status: "Complete",
    totalMatches: 3,
    date: "2026-02-20",
    location: "Morodok Techo National Stadium, Phnom Penh",
    organizerClub: "Victory Gym",
    broadcastStation: "Town Full HDTV",
    mainSponsor: "Ganzberg",
    matches: [
      {
        id: "m5-1",
        matchNumber: "M-012",
        batchId: "batch-005",
        fighterA: {
          id: "f23",
          name: "Malika Srey",
          image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400",
          weight: 48,
          record: "8-1-0",
          grade: "B",
          clubId: "club-001",
          clubName: "Olympic Club"
        },
        fighterB: {
          id: "f24",
          name: "Sophea Mao",
          image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400",
          weight: 48,
          record: "7-2-0",
          grade: "B",
          clubId: "club-002",
          clubName: "Victory Gym"
        },
        matchType: "Ranking Fight",
        weightClass: "48kg",
        agreedWeight: 48,
        rounds: 3,
        matchOrder: 1,
        notes: "Women's Division Co-Main Event",
        status: "Completed",
        winner: "Malika Srey",
        winnerMethod: "Decision",
        winnerRound: 3
      },
      {
        id: "m5-2",
        matchNumber: "M-013",
        batchId: "batch-005",
        fighterA: {
          id: "f25",
          name: "Sokha Lim",
          image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400",
          weight: 55,
          record: "6-2-0",
          grade: "B",
          clubId: "club-001",
          clubName: "Olympic Club"
        },
        fighterB: {
          id: "f26",
          name: "Rath Sok",
          image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400",
          weight: 55,
          record: "5-3-0",
          grade: "B",
          clubId: "club-002",
          clubName: "Victory Gym"
        },
        matchType: "Ranking Fight",
        weightClass: "55kg",
        agreedWeight: 55,
        rounds: 3,
        matchOrder: 2,
        status: "Completed",
        winner: "Sokha Lim",
        winnerMethod: "KO",
        winnerRound: 2
      },
      {
        id: "m5-3",
        matchNumber: "M-014",
        batchId: "batch-005",
        fighterA: {
          id: "f27",
          name: "Sovann Huy",
          image: "https://images.unsplash.com/photo-1531891437562-4301cf35b7e4?w=400",
          weight: 62,
          record: "7-1-0",
          grade: "B",
          clubId: "club-002",
          clubName: "Victory Gym"
        },
        fighterB: {
          id: "f28",
          name: "Kosal Ith",
          image: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=400",
          weight: 62,
          record: "6-2-0",
          grade: "B",
          clubId: "club-002",
          clubName: "Victory Gym"
        },
        matchType: "Ranking Fight",
        weightClass: "62kg",
        agreedWeight: 62,
        rounds: 3,
        matchOrder: 3,
        status: "Completed",
        winner: "Sovann Huy",
        winnerMethod: "TKO",
        winnerRound: 3
      }
    ],
    createdBy: "Victory Gym",
    createdAt: "2026-01-25T10:00:00Z",
    updatedAt: "2026-02-21T08:00:00Z"
  }
];

// Import and merge additional batches
import { ADDITIONAL_BATCHES } from "./additional-batches";
MOCK_BATCHES.push(...ADDITIONAL_BATCHES);

// Helper Functions
export function getBatchById(id: string): MatchBatch | undefined {
  return MOCK_BATCHES.find(b => b.id === id);
}

export function getBatchesByEvent(eventId: string): MatchBatch[] {
  return MOCK_BATCHES.filter(b => b.eventId === eventId);
}

export function getBatchesByStatus(status: BatchStatus): MatchBatch[] {
  return MOCK_BATCHES.filter(b => b.status === status);
}

export function getMatchById(matchId: string): Match | undefined {
  for (const batch of MOCK_BATCHES) {
    const match = batch.matches.find(m => m.id === matchId);
    if (match) return match;
  }
  return undefined;
}

export function getMatchesByBatch(batchId: string): Match[] {
  const batch = getBatchById(batchId);
  return batch ? batch.matches : [];
}

export function getTotalMatches(): number {
  return MOCK_BATCHES.reduce((sum, batch) => sum + batch.totalMatches, 0);
}

// Auto-update batch status when all matches are completed
export function updateBatchStatusIfAllMatchesCompleted(batch: MatchBatch): boolean {
  // Only auto-complete if batch is Approved or Scheduled
  if (batch.status !== "Approved" && batch.status !== "Scheduled") {
    return false;
  }
  
  // Check if all matches are completed
  const allMatchesCompleted = batch.matches.length > 0 && 
    batch.matches.every(match => match.status === "Completed");
  
  if (allMatchesCompleted) {
    batch.status = "Complete";
    batch.updatedAt = new Date().toISOString();
    return true; // Returns true if status was updated
  }
  
  return false;
}

// Initialize batches - auto-complete any batches with all completed matches
(function initializeBatches() {
  MOCK_BATCHES.forEach(batch => {
    updateBatchStatusIfAllMatchesCompleted(batch);
  });
})();

// Calculate batch readiness percentage
export function calculateBatchReadiness(batch: MatchBatch): number {
  let score = 0;
  let maxScore = 4;
  
  // 1. Has matches
  if (batch.matches.length > 0) score += 1;
  
  // 2. All matches have fighters assigned
  const allFightersAssigned = batch.matches.every(m => m.fighterA && m.fighterB);
  if (allFightersAssigned) score += 1;
  
  // 3. Officials assigned (if required)
  const hasChampionshipBout = batch.matches.some(m => m.isChampionshipBout);
  if (hasChampionshipBout) {
    maxScore += 1;
    const allOfficialsAssigned = batch.matches.every(m => {
      if (m.isChampionshipBout) {
        return m.refereeId && m.judgeIds && m.judgeIds.length === 3;
      }
      return true;
    });
    if (allOfficialsAssigned) score += 1;
  }
  
  // 4. Approved/Completed status
  if (batch.status === "Approved" || batch.status === "Scheduled" || batch.status === "Complete" || batch.status === "Live" || batch.status === "Weight-In") {
    score += 1;
  }
  
  return Math.round((score / maxScore) * 100);
}

// Get warnings for a batch
export function getBatchWarnings(batch: MatchBatch): string[] {
  const warnings: string[] = [];
  
  // Check if matches exist
  if (batch.matches.length === 0) {
    warnings.push("No matches added to batch");
  }
  
  // Check officials assignment for championship bouts
  const championshipMatches = batch.matches.filter(m => m.isChampionshipBout);
  if (championshipMatches.length > 0) {
    const unassignedOfficials = championshipMatches.filter(m => {
      return !m.refereeId || !m.judgeIds || m.judgeIds.length !== 3;
    });
    if (unassignedOfficials.length > 0) {
      warnings.push(`${unassignedOfficials.length} championship ${unassignedOfficials.length === 1 ? 'match' : 'matches'} missing officials`);
    }
  }
  
  // Check if not approved (for non-draft batches)
  if (batch.status === "Pending KKF") {
    warnings.push("Awaiting KKF approval");
  }
  
  if (batch.status === "Rejected") {
    warnings.push("Batch rejected by KKF");
  }
  
  return warnings;
}

// Format date for display (e.g., "Apr 15, 2026")
export function formatDisplayDate(dateStr: string): string {
  if (!dateStr) return "N/A";
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return "N/A";
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  return `${months[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`;
}