// Match Batch System
// Hierarchy: Event → Batch → Matches

import { MatchStatus, MatchType } from "./event-types";

// Import poster images for batches
import posterImage1 from 'figma:asset/485f7dc6660a4a78fbd9168093303630f0740df2.png';
import posterImage2 from 'figma:asset/76de12a848bf50a1769fa454bf2dab5cb85ea354.png';

export type BatchStatus = 
  | "Draft"           // Being created
  | "Pending KKF"     // Submitted to KKF, awaiting review
  | "Approved"        // Sanctioned by KKF
  | "Rejected"        // Rejected by KKF
  | "Weight-In"       // Weight-in ceremony happening
  | "Ready"           // Weight-in complete, ready for matches
  | "Live"            // Event is happening
  | "Complete";       // All matches completed with results

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
  }
};

// Mock Batches Data
export const MOCK_BATCHES: MatchBatch[] = [
  {
    id: "batch-001",
    batchNumber: "BATCH-001",
    eventId: "e1",
    eventName: "KUN KHMER Championship 2026",
    eventDate: "2026-04-15",
    status: "Weight-In",
    totalMatches: 6,
    date: "2026-04-15",
    location: "Phnom Penh, Cambodia",
    posterImage: posterImage1,
    organizerClub: "Olympic Club",
    broadcastStation: "TVK Cambodia",
    mainSponsor: "Angkor Beer",
    matches: [
      {
        id: "match-001",
        matchNumber: "M-001",
        batchId: "batch-001",
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
        rounds: 5,
        matchOrder: 1,
        notes: "Main Event - Championship Bout",
        status: "Ready",
        date: "2026-04-15"
      },
      {
        id: "match-002",
        matchNumber: "M-002",
        batchId: "batch-001",
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
        rounds: 3,
        matchOrder: 2,
        notes: "Co-Main Event",
        status: "Ready",
        date: "2026-04-15"
      },
      {
        id: "match-003",
        matchNumber: "M-003",
        batchId: "batch-001",
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
        rounds: 3,
        matchOrder: 3,
        status: "Ready",
        date: "2026-04-15"
      },
      {
        id: "match-004",
        matchNumber: "M-004",
        batchId: "batch-001",
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
        rounds: 3,
        matchOrder: 4,
        notes: "Women's Division",
        status: "Ready",
        date: "2026-04-15"
      },
      {
        id: "match-005",
        matchNumber: "M-005",
        batchId: "batch-001",
        fighterA: {
          id: "f9",
          name: "Vanneth Ouk",
          image: "https://images.unsplash.com/photo-1519345182560-3f2917c472ef?w=400",
          weight: 65,
          record: "5-2-0",
          grade: "B",
          clubId: "club-001",
          clubName: "Olympic Club"
        },
        fighterB: {
          id: "f10",
          name: "Piseth Nhem",
          image: "https://images.unsplash.com/photo-1531891437562-4301cf35b7e4?w=400",
          weight: 65,
          record: "4-3-0",
          grade: "B",
          clubId: "club-001",
          clubName: "Olympic Club"
        },
        matchType: "Ranking Fight",
        weightClass: "65kg",
        rounds: 3,
        matchOrder: 5,
        status: "Ready",
        date: "2026-04-15"
      },
      {
        id: "match-006",
        matchNumber: "M-006",
        batchId: "batch-001",
        fighterA: {
          id: "f11",
          name: "Ponleak Sor",
          image: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=400",
          weight: 67,
          record: "5-1-0",
          grade: "B",
          clubId: "club-002",
          clubName: "Victory Gym"
        },
        fighterB: {
          id: "f12",
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
        rounds: 3,
        matchOrder: 6,
        status: "Scheduled",
        date: "2026-04-15"
      }
    ],
    submittedDate: "2026-03-01",
    submittedBy: "Olympic Club",
    reviewedDate: "2026-03-05",
    reviewedBy: "KKF Admin",
    approvalNotes: "All matches approved. Excellent matchmaking.",
    createdBy: "Olympic Club",
    createdAt: "2026-02-28T10:00:00Z",
    updatedAt: "2026-03-05T14:30:00Z"
  },
  {
    id: "batch-002",
    batchNumber: "BATCH-002",
    eventId: "e2",
    eventName: "Fight Night March 30",
    eventDate: "2026-03-30",
    status: "Live",
    totalMatches: 6,
    date: "2026-03-30",
    location: "Siem Reap, Cambodia",
    posterImage: posterImage2,
    organizerClub: "Victory Gym",
    broadcastStation: "Bayon TV",
    matches: [
      {
        id: "match-007",
        matchNumber: "M-007",
        batchId: "batch-002",
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
        rounds: 3,
        matchOrder: 1,
        status: "Scheduled",
        date: "2026-03-30"
      },
      {
        id: "match-008",
        matchNumber: "M-008",
        batchId: "batch-002",
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
        rounds: 3,
        matchOrder: 2,
        status: "Scheduled",
        date: "2026-03-30"
      },
      {
        id: "match-009",
        matchNumber: "M-009",
        batchId: "batch-002",
        fighterA: {
          id: "f17",
          name: "Serey Rith",
          image: "https://images.unsplash.com/photo-1519345182560-3f2917c472ef?w=400",
          weight: 85,
          record: "10-1-0",
          grade: "A",
          clubId: "club-003",
          clubName: "KKF Admin"
        },
        fighterB: {
          id: "f18",
          name: "Kosal Leng",
          image: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400",
          weight: 85,
          record: "9-2-0",
          grade: "A",
          clubId: "club-003",
          clubName: "KKF Admin"
        },
        matchType: "National Title Fight",
        weightClass: "85kg",
        rounds: 5,
        matchOrder: 3,
        status: "Waiting Club Approval",
        date: "2026-03-30"
      },
      {
        id: "match-009-1",
        matchNumber: "M-009-1",
        batchId: "batch-002",
        fighterA: {
          id: "f29",
          name: "Sovann Huy",
          image: "https://images.unsplash.com/photo-1531891437562-4301cf35b7e4?w=400",
          weight: 62,
          record: "7-1-0",
          grade: "B",
          clubId: "club-002",
          clubName: "Victory Gym"
        },
        fighterB: {
          id: "f30",
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
        rounds: 3,
        matchOrder: 4,
        status: "Scheduled",
        date: "2026-03-30"
      },
      {
        id: "match-009-2",
        matchNumber: "M-009-2",
        batchId: "batch-002",
        fighterA: {
          id: "f31",
          name: "Narith Pok",
          image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400",
          weight: 76,
          record: "9-3-0",
          grade: "A",
          clubId: "club-003",
          clubName: "KKF Admin"
        },
        fighterB: {
          id: "f32",
          name: "Bunna Ros",
          image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400",
          weight: 76,
          record: "8-4-0",
          grade: "A",
          clubId: "club-003",
          clubName: "KKF Admin"
        },
        matchType: "Ranking Fight",
        weightClass: "76kg",
        rounds: 3,
        matchOrder: 5,
        status: "Scheduled",
        date: "2026-03-30"
      },
      {
        id: "match-009-3",
        matchNumber: "M-009-3",
        batchId: "batch-002",
        fighterA: {
          id: "f33",
          name: "Sokna Penh",
          image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400",
          weight: 52,
          record: "5-0-0",
          grade: "B",
          clubId: "club-002",
          clubName: "Victory Gym"
        },
        fighterB: {
          id: "f34",
          name: "Devi Meng",
          image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400",
          weight: 52,
          record: "4-1-0",
          grade: "B",
          clubId: "club-002",
          clubName: "Victory Gym"
        },
        matchType: "Ranking Fight",
        weightClass: "52kg",
        rounds: 3,
        matchOrder: 6,
        notes: "Women's Division",
        status: "Scheduled",
        date: "2026-03-30"
      }
    ],
    submittedDate: "2026-03-20",
    submittedBy: "Victory Gym",
    createdBy: "Victory Gym",
    createdAt: "2026-03-18T09:00:00Z",
    updatedAt: "2026-03-20T11:00:00Z"
  },
  {
    id: "batch-003",
    batchNumber: "BATCH-003",
    eventId: "e3",
    eventName: "National Title Bouts",
    eventDate: "2026-04-20",
    status: "Draft",
    totalMatches: 2,
    date: "2026-04-20",
    location: "Phnom Penh, Cambodia",
    matches: [
      {
        id: "match-010",
        matchNumber: "M-010",
        batchId: "batch-003",
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
        rounds: 3,
        matchOrder: 1,
        status: "Waiting Club Approval",
        date: "2026-04-20"
      },
      {
        id: "match-011",
        matchNumber: "M-011",
        batchId: "batch-003",
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
        rounds: 3,
        matchOrder: 2,
        status: "Proposed",
        date: "2026-04-20"
      }
    ],
    createdBy: "KKF Admin",
    createdAt: "2026-03-22T15:00:00Z",
    updatedAt: "2026-03-22T15:00:00Z"
  },
  {
    id: "batch-004",
    batchNumber: "BATCH-004",
    eventId: "e4",
    eventName: "Youth Championship",
    eventDate: "2026-05-10",
    status: "Draft",
    totalMatches: 1,
    date: "2026-05-10",
    location: "Siem Reap, Cambodia",
    matches: [
      {
        id: "match-012",
        matchNumber: "M-012",
        batchId: "batch-004",
        fighterA: {
          id: "f23",
          name: "Rithea Sok",
          image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400",
          weight: 72,
          record: "15-3-0",
          grade: "A",
          clubId: "club-001",
          clubName: "Olympic Club"
        },
        fighterB: {
          id: "f24",
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
        rounds: 5,
        matchOrder: 1,
        notes: "KKF National Championship - Main Event",
        isChampionshipBout: true,
        championshipId: "champ-001",
        championshipTitle: "KKF National Welterweight Champion",
        defendingChampion: null,
        refereeId: "ref-001",
        refereeName: "Sopheak Chea",
        judgeIds: ["judge-001", "judge-002", "judge-003"],
        judgeNames: ["Virak Prum", "Chanthy Sok", "Dara Nhem"],
        status: "Completed",
        winner: "Rithea Sok",
        winnerMethod: "TKO",
        winnerRound: 4,
        highlightVideo: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
        date: "2026-02-20"
      }
    ],
    createdBy: "Olympic Club",
    createdAt: "2026-03-24T10:00:00Z",
    updatedAt: "2026-03-24T10:00:00Z"
  },
  {
    id: "batch-005",
    batchNumber: "BATCH-005",
    eventId: "e5",
    eventName: "Fight Night February 2026",
    eventDate: "2026-02-20",
    status: "Complete",
    totalMatches: 2,
    date: "2026-02-20",
    location: "Phnom Penh, Cambodia",
    matches: [
      {
        id: "match-013",
        matchNumber: "M-013",
        batchId: "batch-005",
        fighterA: {
          id: "f25",
          name: "Malika Srey",
          image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400",
          weight: 48,
          record: "8-1-0",
          grade: "B",
          clubId: "club-001",
          clubName: "Olympic Club"
        },
        fighterB: {
          id: "f26",
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
        rounds: 3,
        matchOrder: 1,
        notes: "Women's Division Co-Main Event",
        status: "Completed",
        winner: "Malika Srey",
        winnerMethod: "Decision",
        highlightVideo: "https://www.youtube.com/watch?v=example123",
        date: "2026-02-20"
      },
      {
        id: "match-014",
        matchNumber: "M-014",
        batchId: "batch-005",
        fighterA: {
          id: "f27",
          name: "Sokha Lim",
          image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400",
          weight: 55,
          record: "6-2-0",
          grade: "B",
          clubId: "club-001",
          clubName: "Olympic Club"
        },
        fighterB: {
          id: "f28",
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
        rounds: 3,
        matchOrder: 2,
        status: "Completed",
        winner: "Sokha Lim",
        winnerMethod: "KO",
        winnerRound: 2,
        highlightVideo: "https://www.youtube.com/watch?v=example456",
        date: "2026-02-20"
      }
    ],
    submittedDate: "2026-02-01",
    submittedBy: "Olympic Club",
    reviewedDate: "2026-02-05",
    reviewedBy: "KKF Admin",
    approvalNotes: "Championship bout approved. All requirements met.",
    createdBy: "Olympic Club",
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
    batch.status = "Completed";
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
  
  // 4. KKF approved
  if (batch.status === "Approved" || batch.status === "Scheduled" || batch.status === "Completed") {
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
  
  // Check if not KKF approved (for non-draft batches)
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
  const date = new Date(dateStr);
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  return `${months[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`;
}