// KKF Event Types and Configuration
// Based on official KKF Event Concept

export type EventType = 
  | "Championship"
  | "Friendly Match"
  | "Exhibition"
  | "Ranking Fight"
  | "International"
  | "Regional"
  | "Club Tournament";

export type EventStatus =
  | "Draft"           // Organizer creating event
  | "Submitted"       // Submitted to KKF for review
  | "Approved"        // KKF approved
  | "Completed"       // Event finished
  | "Cancelled";      // Event cancelled

export type MatchType =
  | "Championship Bout"
  | "Title Defense"
  | "Ranking Fight"
  | "Exhibition"
  | "Friendly Match"
  | "Tournament Final"
  | "Semi Final"
  | "Quarter Final";

export type MatchStatus =
  | "Proposed"              // Organizer proposed
  | "Waiting Club Approval" // Waiting for club confirmation
  | "Pending KKF Approval"  // Awaiting KKF review
  | "Approved"              // KKF approved
  | "Ready"                 // Batch approved, ready for pre-fight events
  | "Show Face Completed"   // Show face/press conference done
  | "Weigh-In Completed"    // Official weigh-in done
  | "Ready to Fight"        // All pre-fight requirements completed
  | "Scheduled"             // Scheduled for event
  | "In Progress"           // Currently fighting
  | "Completed"             // Fight finished
  | "Result Updated"        // Result recorded
  | "Cancelled";            // Match cancelled

export type ChampionStatus =
  | "Active"         // Currently holds title
  | "Defending"      // Scheduled title defense
  | "Vacated"        // Title vacated
  | "Retired";       // Champion retired

// Event Type Configuration
export const EVENT_TYPE_CONFIG: Record<EventType, {
  label: string;
  icon: string;
  description: string;
  requiresChampionship: boolean;
}> = {
  "Championship": {
    label: "Championship",
    icon: "🏆",
    description: "Official KKF Championship event with title bouts",
    requiresChampionship: true
  },
  "Friendly Match": {
    label: "Friendly Match",
    icon: "🤝",
    description: "Non-ranking friendly exhibition matches",
    requiresChampionship: false
  },
  "Exhibition": {
    label: "Exhibition",
    icon: "🎭",
    description: "Demonstration and promotional fights",
    requiresChampionship: false
  },
  "Ranking Fight": {
    label: "Ranking Fight",
    icon: "📊",
    description: "Fights that affect fighter rankings",
    requiresChampionship: false
  },
  "International": {
    label: "International",
    icon: "🌏",
    description: "International Kun Khmer events",
    requiresChampionship: false
  },
  "Regional": {
    label: "Regional",
    icon: "🗺️",
    description: "Regional championship or tournament",
    requiresChampionship: false
  },
  "Club Tournament": {
    label: "Club Tournament",
    icon: "🏟️",
    description: "Inter-club or intra-club tournament",
    requiresChampionship: false
  }
};

// Match Type Configuration
export const MATCH_TYPE_CONFIG: Record<MatchType, {
  label: string;
  icon: string;
  affectsRanking: boolean;
  requiresReferee: boolean;
  minRounds: number;
  maxRounds: number;
}> = {
  "Championship Bout": {
    label: "Championship Bout",
    icon: "👑",
    affectsRanking: true,
    requiresReferee: true,
    minRounds: 5,
    maxRounds: 7
  },
  "Title Defense": {
    label: "Title Defense",
    icon: "🛡️",
    affectsRanking: true,
    requiresReferee: true,
    minRounds: 5,
    maxRounds: 7
  },
  "Ranking Fight": {
    label: "Ranking Fight",
    icon: "📈",
    affectsRanking: true,
    requiresReferee: true,
    minRounds: 3,
    maxRounds: 5
  },
  "Exhibition": {
    label: "Exhibition",
    icon: "🎪",
    affectsRanking: false,
    requiresReferee: true,
    minRounds: 3,
    maxRounds: 3
  },
  "Friendly Match": {
    label: "Friendly Match",
    icon: "🤝",
    affectsRanking: false,
    requiresReferee: true,
    minRounds: 3,
    maxRounds: 3
  },
  "Tournament Final": {
    label: "Tournament Final",
    icon: "🥇",
    affectsRanking: true,
    requiresReferee: true,
    minRounds: 5,
    maxRounds: 5
  },
  "Semi Final": {
    label: "Semi Final",
    icon: "🥈",
    affectsRanking: true,
    requiresReferee: true,
    minRounds: 3,
    maxRounds: 5
  },
  "Quarter Final": {
    label: "Quarter Final",
    icon: "🥉",
    affectsRanking: true,
    requiresReferee: true,
    minRounds: 3,
    maxRounds: 5
  }
};

// Broadcast Stations (KKF-Approved)
export interface BroadcastStation {
  id: string;
  name: string;
  logo: string;
  type: "National TV" | "Cable TV" | "Streaming" | "Radio";
  approved: boolean;
  contact: string;
}

export const KKF_APPROVED_BROADCAST_STATIONS: BroadcastStation[] = [
  {
    id: "tvk",
    name: "TVK (National Television of Kampuchea)",
    logo: "📺",
    type: "National TV",
    approved: true,
    contact: "+855 23 982 375"
  },
  {
    id: "ctv",
    name: "CTV (Cambodian Television Network)",
    logo: "📺",
    type: "Cable TV",
    approved: true,
    contact: "+855 23 982 111"
  },
  {
    id: "bayon",
    name: "Bayon TV",
    logo: "📺",
    type: "National TV",
    approved: true,
    contact: "+855 23 982 222"
  },
  {
    id: "pnn",
    name: "PNN (Phnom Penh News Network)",
    logo: "📺",
    type: "Cable TV",
    approved: true,
    contact: "+855 23 982 333"
  },
  {
    id: "kkf-stream",
    name: "KKF Official Streaming",
    logo: "🎥",
    type: "Streaming",
    approved: true,
    contact: "stream@kkf.org.kh"
  },
  {
    id: "sport-radio",
    name: "Cambodia Sport Radio FM 95.5",
    logo: "📻",
    type: "Radio",
    approved: true,
    contact: "+855 23 982 444"
  }
];

// Sponsors (KKF-Approved)
export interface Sponsor {
  id: string;
  name: string;
  logo: string;
  tier: "Platinum" | "Gold" | "Silver" | "Bronze";
  approved: boolean;
  contact: string;
}

export const KKF_APPROVED_SPONSORS: Sponsor[] = [
  {
    id: "acleda-bank",
    name: "ACLEDA Bank",
    logo: "🏦",
    tier: "Platinum",
    approved: true,
    contact: "marketing@acledabank.com.kh"
  },
  {
    id: "angkor-beer",
    name: "Angkor Beer",
    logo: "🍺",
    tier: "Platinum",
    approved: true,
    contact: "sponsor@angkorbeer.com"
  },
  {
    id: "smart-axiata",
    name: "Smart Axiata",
    logo: "📱",
    tier: "Gold",
    approved: true,
    contact: "partnerships@smart.com.kh"
  },
  {
    id: "metfone",
    name: "Metfone",
    logo: "📱",
    tier: "Gold",
    approved: true,
    contact: "business@metfone.com.kh"
  },
  {
    id: "naga-world",
    name: "NagaWorld",
    logo: "🎰",
    tier: "Platinum",
    approved: true,
    contact: "events@nagaworld.com"
  },
  {
    id: "toyota-cambodia",
    name: "Toyota Cambodia",
    logo: "🚗",
    tier: "Gold",
    approved: true,
    contact: "marketing@toyota.com.kh"
  },
  {
    id: "coca-cola",
    name: "Coca-Cola Cambodia",
    logo: "🥤",
    tier: "Silver",
    approved: true,
    contact: "sponsorship@coca-cola.com.kh"
  },
  {
    id: "aba-bank",
    name: "ABA Bank",
    logo: "🏦",
    tier: "Gold",
    approved: true,
    contact: "corporate@ababank.com"
  }
];

// Referees (KKF-Certified)
export interface Referee {
  id: string;
  name: string;
  photo: string;
  level: "International" | "National" | "Regional";
  certified: boolean;
  experience: number; // years
  contact: string;
}

export const KKF_CERTIFIED_REFEREES: Referee[] = [
  {
    id: "ref-001",
    name: "Sopheak Chan",
    photo: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400",
    level: "International",
    certified: true,
    experience: 15,
    contact: "+855 12 345 678"
  },
  {
    id: "ref-002",
    name: "Dara Meas",
    photo: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400",
    level: "International",
    certified: true,
    experience: 12,
    contact: "+855 12 345 679"
  },
  {
    id: "ref-003",
    name: "Virak Seng",
    photo: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400",
    level: "National",
    certified: true,
    experience: 8,
    contact: "+855 12 345 680"
  },
  {
    id: "ref-004",
    name: "Kimsan Ouk",
    photo: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400",
    level: "National",
    certified: true,
    experience: 10,
    contact: "+855 12 345 681"
  },
  {
    id: "ref-005",
    name: "Ratanak Kong",
    photo: "https://images.unsplash.com/photo-1519345182560-3f2917c472ef?w=400",
    level: "Regional",
    certified: true,
    experience: 5,
    contact: "+855 12 345 682"
  }
];

// Judges (KKF-Certified)
export interface Judge {
  id: string;
  name: string;
  photo: string;
  level: "International" | "National" | "Regional";
  certified: boolean;
  experience: number;
  contact: string;
}

export const KKF_CERTIFIED_JUDGES: Judge[] = [
  {
    id: "judge-001",
    name: "Bopha Lim",
    photo: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400",
    level: "International",
    certified: true,
    experience: 18,
    contact: "+855 12 345 690"
  },
  {
    id: "judge-002",
    name: "Sreymom Sor",
    photo: "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=400",
    level: "International",
    certified: true,
    experience: 14,
    contact: "+855 12 345 691"
  },
  {
    id: "judge-003",
    name: "Vanneth Prak",
    photo: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=400",
    level: "National",
    certified: true,
    experience: 9,
    contact: "+855 12 345 692"
  },
  {
    id: "judge-004",
    name: "Piseth Nhem",
    photo: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400",
    level: "National",
    certified: true,
    experience: 11,
    contact: "+855 12 345 693"
  },
  {
    id: "judge-005",
    name: "Chanthy Heng",
    photo: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400",
    level: "National",
    certified: true,
    experience: 7,
    contact: "+855 12 345 694"
  }
];

// Venues
export interface Venue {
  id: string;
  name: string;
  location: string;
  capacity: number;
  rings: number;
  approved: boolean;
  facilities: string[];
}

export const KKF_APPROVED_VENUES: Venue[] = [
  {
    id: "olympic-stadium",
    name: "National Olympic Stadium",
    location: "Phnom Penh",
    capacity: 50000,
    rings: 2,
    approved: true,
    facilities: ["VIP Lounge", "Media Center", "Medical Room", "Changing Rooms"]
  },
  {
    id: "koh-pich",
    name: "Koh Pich Convention Center",
    location: "Phnom Penh",
    capacity: 10000,
    rings: 2,
    approved: true,
    facilities: ["VIP Lounge", "Media Center", "Medical Room", "Parking"]
  },
  {
    id: "calmette-arena",
    name: "Calmette Arena",
    location: "Phnom Penh",
    capacity: 5000,
    rings: 1,
    approved: true,
    facilities: ["Medical Room", "Changing Rooms", "Parking"]
  },
  {
    id: "siem-reap-arena",
    name: "Angkor Arena",
    location: "Siem Reap",
    capacity: 8000,
    rings: 2,
    approved: true,
    facilities: ["VIP Lounge", "Media Center", "Medical Room", "Restaurant"]
  },
  {
    id: "battambang-stadium",
    name: "Battambang Provincial Stadium",
    location: "Battambang",
    capacity: 3000,
    rings: 1,
    approved: true,
    facilities: ["Medical Room", "Changing Rooms"]
  }
];

// Helper Functions
export function getBroadcastStationById(id: string): BroadcastStation | undefined {
  return KKF_APPROVED_BROADCAST_STATIONS.find(s => s.id === id);
}

export function getSponsorById(id: string): Sponsor | undefined {
  return KKF_APPROVED_SPONSORS.find(s => s.id === id);
}

export function getRefereeById(id: string): Referee | undefined {
  return KKF_CERTIFIED_REFEREES.find(r => r.id === id);
}

export function getJudgeById(id: string): Judge | undefined {
  return KKF_CERTIFIED_JUDGES.find(j => j.id === id);
}

export function getVenueById(id: string): Venue | undefined {
  return KKF_APPROVED_VENUES.find(v => v.id === id);
}

export function getApprovedBroadcastStations(): BroadcastStation[] {
  return KKF_APPROVED_BROADCAST_STATIONS.filter(s => s.approved);
}

export function getApprovedSponsors(): Sponsor[] {
  return KKF_APPROVED_SPONSORS.filter(s => s.approved);
}

export function getCertifiedReferees(level?: "International" | "National" | "Regional"): Referee[] {
  let refs = KKF_CERTIFIED_REFEREES.filter(r => r.certified);
  if (level) {
    refs = refs.filter(r => r.level === level);
  }
  return refs;
}

export function getCertifiedJudges(level?: "International" | "National" | "Regional"): Judge[] {
  let judges = KKF_CERTIFIED_JUDGES.filter(j => j.certified);
  if (level) {
    judges = judges.filter(j => j.level === level);
  }
  return judges;
}

export function getApprovedVenues(): Venue[] {
  return KKF_APPROVED_VENUES.filter(v => v.approved);
}