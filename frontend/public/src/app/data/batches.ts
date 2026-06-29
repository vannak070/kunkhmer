// Match Batch System
// Hierarchy: Event → Batch → Matches

import { MatchStatus, MatchType } from "./event-types";

// Import poster images for batches
import posterImage1 from 'figma:asset/485f7dc6660a4a78fbd9168093303630f0740df2.png';
import posterImage2 from 'figma:asset/76de12a848bf50a1769fa454bf2dab5cb85ea354.png';

export type BatchStatus = 
  | "Draft"           // Being created, not yet submitted
  | "Pending KKF"     // Submitted, awaiting KKF review
  | "Approved"        // KKF approved
  | "Rejected"        // KKF rejected
  | "Scheduled"       // Matches added to event schedule
  | "Completed";      // All matches completed

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
  "Scheduled": {
    label: "Scheduled",
    color: "text-blue-700",
    bgColor: "bg-blue-100",
    icon: "📅"
  },
  "Completed": {
    label: "Completed",
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
    status: "Approved",
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
    status: "Pending KKF",
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
    status: "Approved",
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
  },
  {
    id: "batch-006",
    batchNumber: "BATCH-006",
    eventId: "e6",
    eventName: "Spring Warriors Championship",
    eventDate: "2026-05-10",
    status: "Approved",
    totalMatches: 5,
    date: "2026-05-10",
    location: "Siem Reap, Cambodia",
    posterImage: posterImage2,
    organizerClub: "Angkor Warriors",
    broadcastStation: "CNC TV",
    mainSponsor: "Cambodia Beer",
    matches: [
      {
        id: "match-015",
        matchNumber: "M-015",
        batchId: "batch-006",
        fighterA: {
          id: "f29",
          name: "Prak Sophea",
          image: "https://images.unsplash.com/photo-1601039834001-7d32a613c60d?w=400",
          weight: 57.5,
          record: "42-7-1",
          grade: "A",
          clubId: "club-003",
          clubName: "Angkor Warriors"
        },
        fighterB: {
          id: "f30",
          name: "Vibol Thun",
          image: "https://images.unsplash.com/photo-1568602471122-7832951cc4c5?w=400",
          weight: 57.5,
          record: "38-9-2",
          grade: "A",
          clubId: "club-002",
          clubName: "Victory Gym"
        },
        matchType: "Championship Bout",
        weightClass: "57.5kg",
        rounds: 5,
        matchOrder: 1,
        notes: "Main Event - Featherweight Championship",
        status: "Ready",
        date: "2026-05-10"
      },
      {
        id: "match-016",
        matchNumber: "M-016",
        batchId: "batch-006",
        fighterA: {
          id: "f31",
          name: "Daravuth Heng",
          image: "https://images.unsplash.com/photo-1557862921-37829c790f19?w=400",
          weight: 65,
          record: "28-5-1",
          grade: "A",
          clubId: "club-003",
          clubName: "Angkor Warriors"
        },
        fighterB: {
          id: "f32",
          name: "Seyha Prak",
          image: "https://images.unsplash.com/photo-1566492031773-4f4e44671857?w=400",
          weight: 65,
          record: "25-8-0",
          grade: "A",
          clubId: "club-001",
          clubName: "Olympic Club"
        },
        matchType: "Title Fight",
        weightClass: "65kg",
        rounds: 5,
        matchOrder: 2,
        notes: "Co-Main Event - Welterweight Title",
        status: "Ready",
        date: "2026-05-10"
      },
      {
        id: "match-017",
        matchNumber: "M-017",
        batchId: "batch-006",
        fighterA: {
          id: "f33",
          name: "Sreyleak Nuon",
          image: "https://images.unsplash.com/photo-1531123897727-8f129e1688ce?w=400",
          weight: 52,
          record: "18-3-0",
          grade: "B",
          clubId: "club-003",
          clubName: "Angkor Warriors"
        },
        fighterB: {
          id: "f34",
          name: "Kolap Ny",
          image: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400",
          weight: 52,
          record: "16-4-1",
          grade: "B",
          clubId: "club-002",
          clubName: "Victory Gym"
        },
        matchType: "Ranking Fight",
        weightClass: "52kg",
        rounds: 3,
        matchOrder: 3,
        notes: "Women's Division Featured Bout",
        status: "Ready",
        date: "2026-05-10"
      },
      {
        id: "match-018",
        matchNumber: "M-018",
        batchId: "batch-006",
        fighterA: {
          id: "f35",
          name: "Rithy Sam",
          image: "https://images.unsplash.com/photo-1564564321837-a57b7070ac4f?w=400",
          weight: 70,
          record: "22-6-0",
          grade: "B",
          clubId: "club-003",
          clubName: "Angkor Warriors"
        },
        fighterB: {
          id: "f36",
          name: "Monyrith Chhay",
          image: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=400",
          weight: 70,
          record: "20-7-2",
          grade: "B",
          clubId: "club-001",
          clubName: "Olympic Club"
        },
        matchType: "Ranking Fight",
        weightClass: "70kg",
        rounds: 3,
        matchOrder: 4,
        status: "Ready",
        date: "2026-05-10"
      },
      {
        id: "match-019",
        matchNumber: "M-019",
        batchId: "batch-006",
        fighterA: {
          id: "f37",
          name: "Chandara Mao",
          image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400",
          weight: 60,
          record: "15-4-0",
          grade: "B",
          clubId: "club-003",
          clubName: "Angkor Warriors"
        },
        fighterB: {
          id: "f38",
          name: "Kakada Ly",
          image: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400",
          weight: 60,
          record: "14-5-1",
          grade: "B",
          clubId: "club-002",
          clubName: "Victory Gym"
        },
        matchType: "Exhibition",
        weightClass: "60kg",
        rounds: 3,
        matchOrder: 5,
        notes: "Special Exhibition Match",
        status: "Ready",
        date: "2026-05-10"
      }
    ],
    submittedDate: "2026-04-01",
    submittedBy: "Angkor Warriors",
    reviewedDate: "2026-04-05",
    reviewedBy: "KKF Admin",
    approvalNotes: "All matches approved for May event",
    createdBy: "Angkor Warriors",
    createdAt: "2026-03-20T09:00:00Z",
    updatedAt: "2026-04-05T14:30:00Z"
  },
  {
    id: "batch-007",
    batchNumber: "BATCH-007",
    eventId: "e7",
    eventName: "Summer Showdown 2026",
    eventDate: "2026-06-15",
    status: "Approved",
    totalMatches: 4,
    date: "2026-06-15",
    location: "Battambang, Cambodia",
    organizerClub: "Battambang Warriors",
    broadcastStation: "Bayon TV",
    mainSponsor: "Kingdom Breweries",
    matches: [
      {
        id: "match-020",
        matchNumber: "M-020",
        batchId: "batch-007",
        fighterA: {
          id: "f39",
          name: "Thun Chanthy",
          image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400",
          weight: 63,
          record: "15-0-0",
          grade: "A",
          clubId: "club-004",
          clubName: "Battambang Warriors"
        },
        fighterB: {
          id: "f40",
          name: "Sok Pisey",
          image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400",
          weight: 63,
          record: "32-8-2",
          grade: "A",
          clubId: "club-001",
          clubName: "Olympic Club"
        },
        matchType: "Championship Bout",
        weightClass: "63kg",
        rounds: 5,
        matchOrder: 1,
        notes: "Lightweight Championship - Rising Star vs Veteran",
        status: "Ready",
        date: "2026-06-15"
      },
      {
        id: "match-021",
        matchNumber: "M-021",
        batchId: "batch-007",
        fighterA: {
          id: "f41",
          name: "Nimol Chea",
          image: "https://images.unsplash.com/photo-1463453091185-61582044d556?w=400",
          weight: 75,
          record: "24-10-1",
          grade: "B",
          clubId: "club-004",
          clubName: "Battambang Warriors"
        },
        fighterB: {
          id: "f42",
          name: "Piseth Kong",
          image: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400",
          weight: 75,
          record: "21-12-0",
          grade: "B",
          clubId: "club-003",
          clubName: "Angkor Warriors"
        },
        matchType: "Ranking Fight",
        weightClass: "75kg",
        rounds: 3,
        matchOrder: 2,
        status: "Ready",
        date: "2026-06-15"
      },
      {
        id: "match-022",
        matchNumber: "M-022",
        batchId: "batch-007",
        fighterA: {
          id: "f43",
          name: "Sreypov Heng",
          image: "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=400",
          weight: 54,
          record: "12-2-0",
          grade: "B",
          clubId: "club-004",
          clubName: "Battambang Warriors"
        },
        fighterB: {
          id: "f44",
          name: "Chenda Lim",
          image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400",
          weight: 54,
          record: "11-3-1",
          grade: "B",
          clubId: "club-002",
          clubName: "Victory Gym"
        },
        matchType: "Ranking Fight",
        weightClass: "54kg",
        rounds: 3,
        matchOrder: 3,
        notes: "Women's Division",
        status: "Ready",
        date: "2026-06-15"
      },
      {
        id: "match-023",
        matchNumber: "M-023",
        batchId: "batch-007",
        fighterA: {
          id: "f45",
          name: "Vuthy Ouk",
          image: "https://images.unsplash.com/photo-1552374196-c4e7ffc6e126?w=400",
          weight: 68,
          record: "18-6-1",
          grade: "B",
          clubId: "club-004",
          clubName: "Battambang Warriors"
        },
        fighterB: {
          id: "f46",
          name: "Rotha Chum",
          image: "https://images.unsplash.com/photo-1558203728-00f45181dd84?w=400",
          weight: 68,
          record: "17-7-0",
          grade: "B",
          clubId: "club-001",
          clubName: "Olympic Club"
        },
        matchType: "Ranking Fight",
        weightClass: "68kg",
        rounds: 3,
        matchOrder: 4,
        status: "Ready",
        date: "2026-06-15"
      }
    ],
    submittedDate: "2026-05-01",
    submittedBy: "Battambang Warriors",
    reviewedDate: "2026-05-06",
    reviewedBy: "KKF Admin",
    approvalNotes: "Championship bout approved. Rising star vs veteran matchup approved.",
    createdBy: "Battambang Warriors",
    createdAt: "2026-04-15T10:00:00Z",
    updatedAt: "2026-05-06T16:00:00Z"
  },
  {
    id: "batch-008",
    batchNumber: "BATCH-008",
    eventId: "e8",
    eventName: "Coastal Combat Series",
    eventDate: "2026-07-20",
    status: "Approved",
    totalMatches: 6,
    date: "2026-07-20",
    location: "Sihanoukville, Cambodia",
    posterImage: posterImage1,
    organizerClub: "Coastal Fighters",
    broadcastStation: "TVK Cambodia",
    mainSponsor: "Seaboard Maritime",
    matches: [
      {
        id: "match-024",
        matchNumber: "M-024",
        batchId: "batch-008",
        fighterA: {
          id: "f47",
          name: "Kosal Men",
          image: "https://images.unsplash.com/photo-1566492031773-4f4e44671857?w=400",
          weight: 61,
          record: "35-6-2",
          grade: "A",
          clubId: "club-005",
          clubName: "Coastal Fighters"
        },
        fighterB: {
          id: "f48",
          name: "Buntha Sor",
          image: "https://images.unsplash.com/photo-1564564321837-a57b7070ac4f?w=400",
          weight: 61,
          record: "33-8-1",
          grade: "A",
          clubId: "club-003",
          clubName: "Angkor Warriors"
        },
        matchType: "Title Fight",
        weightClass: "61kg",
        rounds: 5,
        matchOrder: 1,
        notes: "Main Event - Super Featherweight Title",
        status: "Ready",
        date: "2026-07-20"
      },
      {
        id: "match-025",
        matchNumber: "M-025",
        batchId: "batch-008",
        fighterA: {
          id: "f49",
          name: "Sreymom Phan",
          image: "https://images.unsplash.com/photo-1531123897727-8f129e1688ce?w=400",
          weight: 48,
          record: "22-1-0",
          grade: "A",
          clubId: "club-005",
          clubName: "Coastal Fighters"
        },
        fighterB: {
          id: "f50",
          name: "Bopha Chan",
          image: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400",
          weight: 48,
          record: "20-3-1",
          grade: "A",
          clubId: "club-002",
          clubName: "Victory Gym"
        },
        matchType: "Championship Bout",
        weightClass: "48kg",
        rounds: 5,
        matchOrder: 2,
        notes: "Women's Strawweight Championship",
        status: "Ready",
        date: "2026-07-20"
      },
      {
        id: "match-026",
        matchNumber: "M-026",
        batchId: "batch-008",
        fighterA: {
          id: "f51",
          name: "Serey Vann",
          image: "https://images.unsplash.com/photo-1552058544-f2b08422138a?w=400",
          weight: 70,
          record: "26-9-0",
          grade: "B",
          clubId: "club-005",
          clubName: "Coastal Fighters"
        },
        fighterB: {
          id: "f52",
          name: "Kagna Phan",
          image: "https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=400",
          weight: 70,
          record: "24-10-2",
          grade: "B",
          clubId: "club-004",
          clubName: "Battambang Warriors"
        },
        matchType: "Ranking Fight",
        weightClass: "70kg",
        rounds: 3,
        matchOrder: 3,
        status: "Ready",
        date: "2026-07-20"
      },
      {
        id: "match-027",
        matchNumber: "M-027",
        batchId: "batch-008",
        fighterA: {
          id: "f53",
          name: "Pisey Rath",
          image: "https://images.unsplash.com/photo-1507591064344-4c6ce005b128?w=400",
          weight: 65,
          record: "19-7-1",
          grade: "B",
          clubId: "club-005",
          clubName: "Coastal Fighters"
        },
        fighterB: {
          id: "f54",
          name: "Kunthea Sok",
          image: "https://images.unsplash.com/photo-1564564321837-a57b7070ac4f?w=400",
          weight: 65,
          record: "18-8-0",
          grade: "B",
          clubId: "club-001",
          clubName: "Olympic Club"
        },
        matchType: "Ranking Fight",
        weightClass: "65kg",
        rounds: 3,
        matchOrder: 4,
        status: "Ready",
        date: "2026-07-20"
      },
      {
        id: "match-028",
        matchNumber: "M-028",
        batchId: "batch-008",
        fighterA: {
          id: "f55",
          name: "Narith Sou",
          image: "https://images.unsplash.com/photo-1502764613149-7f1d229e2307?w=400",
          weight: 57,
          record: "14-4-1",
          grade: "B",
          clubId: "club-005",
          clubName: "Coastal Fighters"
        },
        fighterB: {
          id: "f56",
          name: "Sovann Meng",
          image: "https://images.unsplash.com/photo-1543132220-3ec99c6094dc?w=400",
          weight: 57,
          record: "13-5-0",
          grade: "B",
          clubId: "club-003",
          clubName: "Angkor Warriors"
        },
        matchType: "Ranking Fight",
        weightClass: "57kg",
        rounds: 3,
        matchOrder: 5,
        status: "Ready",
        date: "2026-07-20"
      },
      {
        id: "match-029",
        matchNumber: "M-029",
        batchId: "batch-008",
        fighterA: {
          id: "f57",
          name: "Makara Kim",
          image: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=400",
          weight: 75,
          record: "10-3-0",
          grade: "C",
          clubId: "club-005",
          clubName: "Coastal Fighters"
        },
        fighterB: {
          id: "f58",
          name: "Vibol Ros",
          image: "https://images.unsplash.com/photo-1544723795-3fb6469f5b39?w=400",
          weight: 75,
          record: "9-4-1",
          grade: "C",
          clubId: "club-002",
          clubName: "Victory Gym"
        },
        matchType: "Exhibition",
        weightClass: "75kg",
        rounds: 3,
        matchOrder: 6,
        notes: "Opening Bout",
        status: "Ready",
        date: "2026-07-20"
      }
    ],
    submittedDate: "2026-06-01",
    submittedBy: "Coastal Fighters",
    reviewedDate: "2026-06-08",
    reviewedBy: "KKF Admin",
    approvalNotes: "Beachside event approved with two championship bouts",
    createdBy: "Coastal Fighters",
    createdAt: "2026-05-15T11:00:00Z",
    updatedAt: "2026-06-08T13:45:00Z"
  },
  {
    id: "batch-009",
    batchNumber: "BATCH-009",
    eventId: "e9",
    eventName: "Night of Champions - August",
    eventDate: "2026-08-25",
    status: "Scheduled",
    totalMatches: 7,
    date: "2026-08-25",
    location: "Phnom Penh, Cambodia",
    posterImage: posterImage2,
    organizerClub: "Olympic Club",
    broadcastStation: "CNC TV",
    mainSponsor: "Angkor Beer",
    matches: [
      {
        id: "match-030",
        matchNumber: "M-030",
        batchId: "batch-009",
        fighterA: {
          id: "f59",
          name: "Sorn Seavmey",
          image: "https://images.unsplash.com/photo-1636581563815-9c40c35abe0b?w=400",
          weight: 65.8,
          record: "34-5-2",
          grade: "A",
          clubId: "club-001",
          clubName: "Olympic Club"
        },
        fighterB: {
          id: "f60",
          name: "Kem Sitha",
          image: "https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=400",
          weight: 65.8,
          record: "31-12-3",
          grade: "A",
          clubId: "club-003",
          clubName: "Angkor Warriors"
        },
        matchType: "Championship Bout",
        weightClass: "65.8kg",
        rounds: 5,
        matchOrder: 1,
        notes: "Main Event - Welterweight Championship Unification",
        status: "Scheduled",
        date: "2026-08-25"
      },
      {
        id: "match-031",
        matchNumber: "M-031",
        batchId: "batch-009",
        fighterA: {
          id: "f61",
          name: "Virak Thun",
          image: "https://images.unsplash.com/photo-1600486913747-55e5470d6f40?w=400",
          weight: 80,
          record: "29-4-1",
          grade: "A",
          clubId: "club-001",
          clubName: "Olympic Club"
        },
        fighterB: {
          id: "f62",
          name: "Rithisak Mam",
          image: "https://images.unsplash.com/photo-1543132220-3ec99c6094dc?w=400",
          weight: 80,
          record: "27-6-0",
          grade: "A",
          clubId: "club-004",
          clubName: "Battambang Warriors"
        },
        matchType: "Title Fight",
        weightClass: "80kg",
        rounds: 5,
        matchOrder: 2,
        notes: "Heavyweight Title Bout",
        status: "Scheduled",
        date: "2026-08-25"
      },
      {
        id: "match-032",
        matchNumber: "M-032",
        batchId: "batch-009",
        fighterA: {
          id: "f63",
          name: "Nou Srey Pov",
          image: "https://images.unsplash.com/photo-1602827115160-a9e732f05533?w=400",
          weight: 52.2,
          record: "19-3-1",
          grade: "A",
          clubId: "club-003",
          clubName: "Angkor Warriors"
        },
        fighterB: {
          id: "f64",
          name: "Sokunthea Yim",
          image: "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=400",
          weight: 52.2,
          record: "17-4-0",
          grade: "A",
          clubId: "club-005",
          clubName: "Coastal Fighters"
        },
        matchType: "Championship Bout",
        weightClass: "52.2kg",
        rounds: 5,
        matchOrder: 3,
        notes: "Women's Flyweight Championship",
        status: "Scheduled",
        date: "2026-08-25"
      },
      {
        id: "match-033",
        matchNumber: "M-033",
        batchId: "batch-009",
        fighterA: {
          id: "f65",
          name: "Ponlok Bun",
          image: "https://images.unsplash.com/photo-1552374196-1ab2a1c593e8?w=400",
          weight: 58,
          record: "23-7-2",
          grade: "B",
          clubId: "club-001",
          clubName: "Olympic Club"
        },
        fighterB: {
          id: "f66",
          name: "Saravuth Nhem",
          image: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=400",
          weight: 58,
          record: "21-9-0",
          grade: "B",
          clubId: "club-002",
          clubName: "Victory Gym"
        },
        matchType: "Ranking Fight",
        weightClass: "58kg",
        rounds: 3,
        matchOrder: 4,
        status: "Scheduled",
        date: "2026-08-25"
      },
      {
        id: "match-034",
        matchNumber: "M-034",
        batchId: "batch-009",
        fighterA: {
          id: "f67",
          name: "Leakhena Ung",
          image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400",
          weight: 56,
          record: "16-5-1",
          grade: "B",
          clubId: "club-001",
          clubName: "Olympic Club"
        },
        fighterB: {
          id: "f68",
          name: "Mealea Preap",
          image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400",
          weight: 56,
          record: "15-6-0",
          grade: "B",
          clubId: "club-003",
          clubName: "Angkor Warriors"
        },
        matchType: "Ranking Fight",
        weightClass: "56kg",
        rounds: 3,
        matchOrder: 5,
        notes: "Women's Division",
        status: "Scheduled",
        date: "2026-08-25"
      },
      {
        id: "match-035",
        matchNumber: "M-035",
        batchId: "batch-009",
        fighterA: {
          id: "f69",
          name: "Sovanna Touch",
          image: "https://images.unsplash.com/photo-1463453091185-61582044d556?w=400",
          weight: 72,
          record: "18-8-1",
          grade: "B",
          clubId: "club-001",
          clubName: "Olympic Club"
        },
        fighterB: {
          id: "f70",
          name: "Chhay Leng",
          image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400",
          weight: 72,
          record: "17-9-0",
          grade: "B",
          clubId: "club-004",
          clubName: "Battambang Warriors"
        },
        matchType: "Ranking Fight",
        weightClass: "72kg",
        rounds: 3,
        matchOrder: 6,
        status: "Scheduled",
        date: "2026-08-25"
      },
      {
        id: "match-036",
        matchNumber: "M-036",
        batchId: "batch-009",
        fighterA: {
          id: "f71",
          name: "Puthea Keo",
          image: "https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=400",
          weight: 62,
          record: "12-4-0",
          grade: "C",
          clubId: "club-001",
          clubName: "Olympic Club"
        },
        fighterB: {
          id: "f72",
          name: "Sambath Ros",
          image: "https://images.unsplash.com/photo-1544723795-3fb6469f5b39?w=400",
          weight: 62,
          record: "11-5-1",
          grade: "C",
          clubId: "club-002",
          clubName: "Victory Gym"
        },
        matchType: "Exhibition",
        weightClass: "62kg",
        rounds: 3,
        matchOrder: 7,
        notes: "Opening Bout",
        status: "Scheduled",
        date: "2026-08-25"
      }
    ],
    submittedDate: "2026-07-01",
    submittedBy: "Olympic Club",
    reviewedDate: "2026-07-10",
    reviewedBy: "KKF Admin",
    approvalNotes: "Major event with three championship bouts approved",
    createdBy: "Olympic Club",
    createdAt: "2026-06-15T09:00:00Z",
    updatedAt: "2026-07-10T15:20:00Z"
  },
  {
    id: "batch-010",
    batchNumber: "BATCH-010",
    eventId: "e10",
    eventName: "International Challenge Series",
    eventDate: "2026-09-30",
    status: "Approved",
    totalMatches: 5,
    date: "2026-09-30",
    location: "Phnom Penh, Cambodia",
    organizerClub: "KKF International",
    broadcastStation: "TVK Cambodia",
    mainSponsor: "ABA Bank",
    matches: [
      {
        id: "match-037",
        matchNumber: "M-037",
        batchId: "batch-010",
        fighterA: {
          id: "f73",
          name: "Prom Samnang",
          image: "https://images.unsplash.com/photo-1564415315949-7a0c4c73aab4?w=400",
          weight: 67,
          record: "45-3-2",
          grade: "A",
          clubId: "club-001",
          clubName: "Olympic Club"
        },
        fighterB: {
          id: "f74",
          name: "Saenchai (Thailand)",
          image: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400",
          weight: 67,
          record: "312-45-5",
          grade: "A",
          clubId: "club-international",
          clubName: "Yokkao Thailand"
        },
        matchType: "Championship Bout",
        weightClass: "67kg",
        rounds: 5,
        matchOrder: 1,
        notes: "International Super Fight - Cambodia vs Thailand",
        status: "Ready",
        date: "2026-09-30"
      },
      {
        id: "match-038",
        matchNumber: "M-038",
        batchId: "batch-010",
        fighterA: {
          id: "f75",
          name: "Chan Rothana",
          image: "https://images.unsplash.com/photo-1549476464-37392f717541?w=400",
          weight: 61.2,
          record: "42-5-1",
          grade: "A",
          clubId: "club-002",
          clubName: "Victory Gym"
        },
        fighterB: {
          id: "f76",
          name: "Superbon (Thailand)",
          image: "https://images.unsplash.com/photo-1606403227590-8ec8b6b6c814?w=400",
          weight: 61.2,
          record: "95-40-0",
          grade: "A",
          clubId: "club-international",
          clubName: "Tiger Muay Thai"
        },
        matchType: "Title Fight",
        weightClass: "61.2kg",
        rounds: 5,
        matchOrder: 2,
        notes: "International Championship Bout",
        status: "Ready",
        date: "2026-09-30"
      },
      {
        id: "match-039",
        matchNumber: "M-039",
        batchId: "batch-010",
        fighterA: {
          id: "f77",
          name: "Dara Sopheak",
          image: "https://images.unsplash.com/photo-1551817958-d9d86fb29431?w=400",
          weight: 70,
          record: "67-8-3",
          grade: "A",
          clubId: "club-001",
          clubName: "Olympic Club"
        },
        fighterB: {
          id: "f78",
          name: "Yodsanklai (Thailand)",
          image: "https://images.unsplash.com/photo-1564564321837-a57b7070ac4f?w=400",
          weight: 70,
          record: "201-67-4",
          grade: "A",
          clubId: "club-international",
          clubName: "Fairtex Thailand"
        },
        matchType: "Exhibition",
        weightClass: "70kg",
        rounds: 5,
        matchOrder: 3,
        notes: "Legend vs Legend - Special Exhibition",
        status: "Ready",
        date: "2026-09-30"
      },
      {
        id: "match-040",
        matchNumber: "M-040",
        batchId: "batch-010",
        fighterA: {
          id: "f79",
          name: "Sreymom Phan",
          image: "https://images.unsplash.com/photo-1531123897727-8f129e1688ce?w=400",
          weight: 48,
          record: "22-1-0",
          grade: "A",
          clubId: "club-005",
          clubName: "Coastal Fighters"
        },
        fighterB: {
          id: "f80",
          name: "Stamp Fairtex (Thailand)",
          image: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400",
          weight: 48,
          record: "45-6-1",
          grade: "A",
          clubId: "club-international",
          clubName: "Fairtex Thailand"
        },
        matchType: "Championship Bout",
        weightClass: "48kg",
        rounds: 5,
        matchOrder: 4,
        notes: "Women's International Championship",
        status: "Ready",
        date: "2026-09-30"
      },
      {
        id: "match-041",
        matchNumber: "M-041",
        batchId: "batch-010",
        fighterA: {
          id: "f81",
          name: "Kolap Ny",
          image: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400",
          weight: 52,
          record: "16-4-1",
          grade: "B",
          clubId: "club-002",
          clubName: "Victory Gym"
        },
        fighterB: {
          id: "f82",
          name: "Antonina Shevchenko",
          image: "https://images.unsplash.com/photo-1502764613149-7f1d229e2307?w=400",
          weight: 52,
          record: "12-4-0",
          grade: "A",
          clubId: "club-international",
          clubName: "Tiger Muay Thai"
        },
        matchType: "Ranking Fight",
        weightClass: "52kg",
        rounds: 3,
        matchOrder: 5,
        notes: "Women's International Featured Bout",
        status: "Ready",
        date: "2026-09-30"
      }
    ],
    submittedDate: "2026-08-01",
    submittedBy: "KKF International",
    reviewedDate: "2026-08-08",
    reviewedBy: "KKF Board",
    approvalNotes: "Special international event approved with legendary matchups",
    createdBy: "KKF International",
    createdAt: "2026-07-10T10:00:00Z",
    updatedAt: "2026-08-08T14:00:00Z"
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