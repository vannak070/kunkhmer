// KKF Champion System - Enhanced with Event/Match Linking and Defense History
// Based on official KKF Champion Concept

import { ChampionStatus } from "./event-types";

export type ChampionType =
  | "National"
  | "International"
  | "Event"
  | "Interim"
  | "Defending";

export type WeightClass =
  | "Mini Flyweight (48kg)"
  | "Light Flyweight (51kg)"
  | "Flyweight (54kg)"
  | "Bantamweight (57kg)"
  | "Super Bantamweight (60kg)"
  | "Featherweight (63.5kg)"
  | "Super Featherweight (66kg)"
  | "Lightweight (70kg)"
  | "Super Lightweight (73kg)"
  | "Welterweight (77kg)"
  | "Super Welterweight (81kg)"
  | "Middleweight (85kg)"
  | "Super Middleweight (90kg)";

export interface TitleDefense {
  defenseNumber: number;
  eventId: string;
  eventName: string;
  matchId: string;
  matchNumber: string;
  date: string;
  opponentId: string;
  opponentName: string;
  opponentRecord: string;
  result: "Won" | "Lost" | "Draw";
  method: "KO" | "TKO" | "Decision" | "Submission";
  round?: number;
  notes?: string;
}

export interface Champion {
  id: string;
  
  // Title Information
  title: string;                    // e.g., "National Lightweight Champion"
  weightClass: WeightClass;
  championType: ChampionType;
  
  // Champion Link to Event & Match
  wonEventId: string;               // Event where title was won
  wonEventName: string;
  wonMatchId: string;               // Specific championship match
  wonMatchNumber: string;
  wonDate: string;
  
  // Fighter Information
  fighterId: string;
  fighterName: string;
  fighterImage: string;
  fighterGrade: string;
  fighterRecord: string;
  fighterWeight: number;
  
  // Club Affiliation
  clubId: string;
  clubName: string;
  
  // Championship Details
  status: ChampionStatus;           // Active, Defending, Vacated, Retired
  defensesMandatory: number;        // Required defenses per year
  defensesCompleted: number;        // Successful defenses
  nextDefenseDate?: string;         // Next scheduled defense
  nextDefenseEventId?: string;
  
  // Defense History
  defenseHistory: TitleDefense[];
  
  // Reign Information
  reignStartDate: string;
  reignEndDate?: string;
  reignDays?: number;
  
  // Additional Info
  previousChampion?: string;
  defeatedOpponent: string;         // Fighter defeated to win title
  defeatedOpponentRecord: string;
  winMethod: "KO" | "TKO" | "Decision" | "Submission";
  winRound?: number;
  
  // Status & Metadata
  lastUpdated: string;
  notes?: string;
}

// Champion Type Configuration
export const CHAMPION_TYPE_CONFIG: Record<ChampionType, {
  label: string;
  icon: string;
  color: string;
  bgColor: string;
  minDefenses: number;
  description: string;
}> = {
  "National": {
    label: "National Champion",
    icon: "🇰🇭",
    color: "text-red-700",
    bgColor: "bg-red-100",
    minDefenses: 2,
    description: "National KKF Champion - Must defend twice per year"
  },
  "International": {
    label: "International Champion",
    icon: "🌏",
    color: "text-blue-700",
    bgColor: "bg-blue-100",
    minDefenses: 1,
    description: "International KKF Champion - Must defend once per year"
  },
  "Event": {
    label: "Event Champion",
    icon: "🏆",
    color: "text-amber-700",
    bgColor: "bg-amber-100",
    minDefenses: 0,
    description: "Event-specific champion - No mandatory defenses"
  },
  "Interim": {
    label: "Interim Champion",
    icon: "⚡",
    color: "text-purple-700",
    bgColor: "bg-purple-100",
    minDefenses: 1,
    description: "Interim champion - Must unify with main champion"
  },
  "Defending": {
    label: "Defending Champion",
    icon: "🛡️",
    color: "text-green-700",
    bgColor: "bg-green-100",
    minDefenses: 2,
    description: "Currently defending champion - Active title defense"
  }
};

// Mock Champions Data
export const MOCK_CHAMPIONS: Champion[] = [
  {
    id: "champ-001",
    title: "National Lightweight Champion",
    weightClass: "Lightweight (70kg)",
    championType: "National",
    
    // Won Championship
    wonEventId: "evt-001",
    wonEventName: "KUN KHMER Championship 2025",
    wonMatchId: "match-ch-001",
    wonMatchNumber: "M-CH-001",
    wonDate: "2025-12-15",
    
    // Fighter
    fighterId: "f1",
    fighterName: "Sok Thy",
    fighterImage: "https://images.unsplash.com/photo-1549719386-74dfcbf7dbed?w=400",
    fighterGrade: "A",
    fighterRecord: "12-2-0",
    fighterWeight: 70,
    
    // Club
    clubId: "club-001",
    clubName: "Olympic Club",
    
    // Championship Status
    status: "Active",
    defensesMandatory: 2,
    defensesCompleted: 1,
    nextDefenseDate: "2026-06-15",
    nextDefenseEventId: "evt-future-001",
    
    // Defense History
    defenseHistory: [
      {
        defenseNumber: 1,
        eventId: "evt-002",
        eventName: "Fight Night March 30",
        matchId: "match-def-001",
        matchNumber: "M-DEF-001",
        date: "2026-03-30",
        opponentId: "f11",
        opponentName: "Ponleak Sor",
        opponentRecord: "5-1-0",
        result: "Won",
        method: "TKO",
        round: 4,
        notes: "First successful title defense"
      }
    ],
    
    // Reign
    reignStartDate: "2025-12-15",
    reignDays: 100,
    
    // Win Details
    defeatedOpponent: "Virak Nhem",
    defeatedOpponentRecord: "10-2-0",
    winMethod: "Decision",
    
    lastUpdated: "2026-03-24T10:00:00Z",
    notes: "Active champion with strong defensive record"
  },
  {
    id: "champ-002",
    title: "National Welterweight Champion",
    weightClass: "Welterweight (77kg)",
    championType: "National",
    
    wonEventId: "evt-003",
    wonEventName: "National Title Bouts 2025",
    wonMatchId: "match-ch-002",
    wonMatchNumber: "M-CH-002",
    wonDate: "2025-11-20",
    
    fighterId: "f5",
    fighterName: "Sopheak Meas",
    fighterImage: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400",
    fighterGrade: "A",
    fighterRecord: "6-3-0",
    fighterWeight: 75,
    
    clubId: "club-001",
    clubName: "Olympic Club",
    
    status: "Defending",
    defensesMandatory: 2,
    defensesCompleted: 0,
    nextDefenseDate: "2026-04-20",
    nextDefenseEventId: "evt-003",
    
    defenseHistory: [],
    
    reignStartDate: "2025-11-20",
    reignDays: 125,
    
    defeatedOpponent: "Dara Kong",
    defeatedOpponentRecord: "8-2-0",
    winMethod: "KO",
    winRound: 3,
    
    lastUpdated: "2026-03-24T10:00:00Z",
    notes: "First defense scheduled for April 2026"
  },
  {
    id: "champ-003",
    title: "International Featherweight Champion",
    weightClass: "Featherweight (63.5kg)",
    championType: "International",
    
    wonEventId: "evt-int-001",
    wonEventName: "ASEAN Kun Khmer Championship 2025",
    wonMatchId: "match-ch-003",
    wonMatchNumber: "M-CH-INT-001",
    wonDate: "2025-10-10",
    
    fighterId: "f9",
    fighterName: "Vanneth Ouk",
    fighterImage: "https://images.unsplash.com/photo-1519345182560-3f2917c472ef?w=400",
    fighterGrade: "A",
    fighterRecord: "9-2-0",
    fighterWeight: 65,
    
    clubId: "club-001",
    clubName: "Olympic Club",
    
    status: "Active",
    defensesMandatory: 1,
    defensesCompleted: 1,
    
    defenseHistory: [
      {
        defenseNumber: 1,
        eventId: "evt-int-002",
        eventName: "Thailand-Cambodia Fight Series",
        matchId: "match-def-int-001",
        matchNumber: "M-DEF-INT-001",
        date: "2026-02-14",
        opponentId: "f-thai-001",
        opponentName: "Somchai Pramuk (Thailand)",
        opponentRecord: "15-3-0",
        result: "Won",
        method: "Decision",
        notes: "Unanimous decision victory"
      }
    ],
    
    reignStartDate: "2025-10-10",
    reignDays: 166,
    
    defeatedOpponent: "Piseth Sam (Thailand)",
    defeatedOpponentRecord: "12-1-0",
    winMethod: "TKO",
    winRound: 5,
    
    lastUpdated: "2026-03-24T10:00:00Z"
  },
  {
    id: "champ-004",
    title: "Women's Flyweight Champion",
    weightClass: "Flyweight (54kg)",
    championType: "National",
    
    wonEventId: "evt-women-001",
    wonEventName: "Women's Championship 2025",
    wonMatchId: "match-ch-004",
    wonMatchNumber: "M-CH-W-001",
    wonDate: "2025-09-05",
    
    fighterId: "f7",
    fighterName: "Bopha Lim",
    fighterImage: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400",
    fighterGrade: "B",
    fighterRecord: "4-0-0",
    fighterWeight: 54,
    
    clubId: "club-001",
    clubName: "Olympic Club",
    
    status: "Active",
    defensesMandatory: 2,
    defensesCompleted: 2,
    
    defenseHistory: [
      {
        defenseNumber: 1,
        eventId: "evt-women-002",
        eventName: "Fight Night December",
        matchId: "match-def-w-001",
        matchNumber: "M-DEF-W-001",
        date: "2025-12-20",
        opponentId: "f8",
        opponentName: "Sreymom Chan",
        opponentRecord: "3-1-0",
        result: "Won",
        method: "Decision",
        notes: "First defense - Unanimous decision"
      },
      {
        defenseNumber: 2,
        eventId: "evt-women-003",
        eventName: "Women's Showcase March",
        matchId: "match-def-w-002",
        matchNumber: "M-DEF-W-002",
        date: "2026-03-08",
        opponentId: "f-new-001",
        opponentName: "Thyda Keo",
        opponentRecord: "3-0-0",
        result: "Won",
        method: "TKO",
        round: 2,
        notes: "International Women's Day special"
      }
    ],
    
    reignStartDate: "2025-09-05",
    reignDays: 201,
    
    defeatedOpponent: "Chanthy Prak",
    defeatedOpponentRecord: "5-0-0",
    winMethod: "Submission",
    winRound: 3,
    
    lastUpdated: "2026-03-24T10:00:00Z",
    notes: "Undefeated champion with 2 successful defenses"
  },
  {
    id: "champ-005",
    title: "Interim Middleweight Champion",
    weightClass: "Middleweight (85kg)",
    championType: "Interim",
    
    wonEventId: "evt-004",
    wonEventName: "Interim Title Fight",
    wonMatchId: "match-ch-005",
    wonMatchNumber: "M-CH-INT-002",
    wonDate: "2026-01-15",
    
    fighterId: "f17",
    fighterName: "Serey Rith",
    fighterImage: "https://images.unsplash.com/photo-1519345182560-3f2917c472ef?w=400",
    fighterGrade: "A",
    fighterRecord: "10-1-0",
    fighterWeight: 85,
    
    clubId: "club-003",
    clubName: "Victory Gym",
    
    status: "Active",
    defensesMandatory: 1,
    defensesCompleted: 0,
    nextDefenseDate: "2026-04-20",
    nextDefenseEventId: "evt-003",
    
    defenseHistory: [],
    
    reignStartDate: "2026-01-15",
    reignDays: 69,
    
    defeatedOpponent: "Kosal Leng",
    defeatedOpponentRecord: "9-2-0",
    winMethod: "Decision",
    
    lastUpdated: "2026-03-24T10:00:00Z",
    notes: "Interim title - Unification bout scheduled for April 20"
  }
];

// Helper Functions
export function getChampionById(id: string): Champion | undefined {
  return MOCK_CHAMPIONS.find(c => c.id === id);
}

export function getChampionsByType(type: ChampionType): Champion[] {
  return MOCK_CHAMPIONS.filter(c => c.championType === type);
}

export function getChampionsByWeightClass(weightClass: WeightClass): Champion[] {
  return MOCK_CHAMPIONS.filter(c => c.weightClass === weightClass);
}

export function getChampionsByStatus(status: ChampionStatus): Champion[] {
  return MOCK_CHAMPIONS.filter(c => c.status === status);
}

export function getActiveChampions(): Champion[] {
  return MOCK_CHAMPIONS.filter(c => c.status === "Active" || c.status === "Defending");
}

export function getFighterChampionships(fighterId: string): Champion[] {
  return MOCK_CHAMPIONS.filter(c => c.fighterId === fighterId);
}

export function getChampionDefenseHistory(championId: string): TitleDefense[] {
  const champion = getChampionById(championId);
  return champion ? champion.defenseHistory : [];
}

export function calculateReignDays(startDate: string, endDate?: string): number {
  const start = new Date(startDate);
  const end = endDate ? new Date(endDate) : new Date();
  const diffTime = Math.abs(end.getTime() - start.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
}

export function getUpcomingDefenses(): Champion[] {
  return MOCK_CHAMPIONS.filter(c => 
    c.nextDefenseDate && 
    new Date(c.nextDefenseDate) > new Date()
  );
}

export function getOverdueDefenses(): Champion[] {
  return MOCK_CHAMPIONS.filter(c => {
    if (!c.nextDefenseDate) return false;
    return new Date(c.nextDefenseDate) < new Date();
  });
}
