// Championship Management System
export type ChampionshipStatus = "Active" | "Vacant" | "Interim" | "Retired";
export type WeightDivision = 
  | "Flyweight" | "Bantamweight" | "Featherweight" | "Lightweight" 
  | "Welterweight" | "Middleweight" | "Light Heavyweight" | "Heavyweight";

export interface ChampionshipHistory {
  championId: string;
  championName: string;
  wonDate: string;
  lostDate?: string;
  defenses: number;
  method: string; // "TKO", "Decision", "KO", etc.
  matchId: string;
}

export interface Championship {
  id: string;
  title: string; // "KKF National Welterweight Champion"
  division: WeightDivision;
  weightRange: string; // "67-72 kg"
  status: ChampionshipStatus;
  currentChampionId?: string;
  currentChampionName?: string;
  currentChampionPhoto?: string;
  wonDate?: string;
  totalDefenses: number;
  beltImage?: string;
  history: ChampionshipHistory[];
  createdAt: string;
  updatedAt: string;
}

// Mock Championships Data
export const MOCK_CHAMPIONSHIPS: Championship[] = [
  {
    id: "champ-001",
    title: "KKF National Welterweight Champion",
    division: "Welterweight",
    weightRange: "67-72 kg",
    status: "Active",
    currentChampionId: "f23",
    currentChampionName: "Rithea Sok",
    currentChampionPhoto: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400",
    wonDate: "2026-02-20",
    totalDefenses: 0,
    history: [
      {
        championId: "f23",
        championName: "Rithea Sok",
        wonDate: "2026-02-20",
        defenses: 0,
        method: "TKO",
        matchId: "match-012"
      }
    ],
    createdAt: "2024-01-10T10:00:00Z",
    updatedAt: "2026-02-20T20:00:00Z"
  },
  {
    id: "champ-002",
    title: "KKF National Lightweight Champion",
    division: "Lightweight",
    weightRange: "60-67 kg",
    status: "Active",
    currentChampionId: "f1",
    currentChampionName: "Sovannara Kem",
    currentChampionPhoto: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400",
    wonDate: "2025-11-15",
    totalDefenses: 2,
    history: [
      {
        championId: "f1",
        championName: "Sovannara Kem",
        wonDate: "2025-11-15",
        defenses: 2,
        method: "Decision",
        matchId: "match-historical-001"
      }
    ],
    createdAt: "2024-01-10T10:00:00Z",
    updatedAt: "2026-01-20T20:00:00Z"
  },
  {
    id: "champ-003",
    title: "KKF National Featherweight Champion",
    division: "Featherweight",
    weightRange: "54-60 kg",
    status: "Active",
    currentChampionId: "f5",
    currentChampionName: "Piseth Ouk",
    currentChampionPhoto: "https://images.unsplash.com/photo-1519345182560-3f2917c472ef?w=400",
    wonDate: "2025-12-10",
    totalDefenses: 1,
    history: [
      {
        championId: "f5",
        championName: "Piseth Ouk",
        wonDate: "2025-12-10",
        defenses: 1,
        method: "KO",
        matchId: "match-historical-002"
      }
    ],
    createdAt: "2024-01-10T10:00:00Z",
    updatedAt: "2026-02-05T20:00:00Z"
  },
  {
    id: "champ-004",
    title: "KKF National Women's Flyweight Champion",
    division: "Flyweight",
    weightRange: "48-54 kg",
    status: "Active",
    currentChampionId: "f25",
    currentChampionName: "Malika Srey",
    currentChampionPhoto: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400",
    wonDate: "2026-02-20",
    totalDefenses: 0,
    history: [
      {
        championId: "f25",
        championName: "Malika Srey",
        wonDate: "2026-02-20",
        defenses: 0,
        method: "Decision",
        matchId: "match-013"
      }
    ],
    createdAt: "2024-06-15T10:00:00Z",
    updatedAt: "2026-02-20T22:00:00Z"
  },
  {
    id: "champ-005",
    title: "KKF National Middleweight Champion",
    division: "Middleweight",
    weightRange: "72-80 kg",
    status: "Vacant",
    totalDefenses: 0,
    history: [
      {
        championId: "f-former-001",
        championName: "Raksmey Chea",
        wonDate: "2025-08-20",
        lostDate: "2026-01-15",
        defenses: 2,
        method: "Decision",
        matchId: "match-historical-003"
      }
    ],
    createdAt: "2024-01-10T10:00:00Z",
    updatedAt: "2026-01-15T20:00:00Z"
  },
  {
    id: "champ-006",
    title: "KKF National Heavyweight Champion",
    division: "Heavyweight",
    weightRange: "80+ kg",
    status: "Active",
    currentChampionId: "f-champ-001",
    currentChampionName: "Bunthoeun Mao",
    currentChampionPhoto: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400",
    wonDate: "2025-09-30",
    totalDefenses: 3,
    history: [
      {
        championId: "f-champ-001",
        championName: "Bunthoeun Mao",
        wonDate: "2025-09-30",
        defenses: 3,
        method: "TKO",
        matchId: "match-historical-004"
      }
    ],
    createdAt: "2024-01-10T10:00:00Z",
    updatedAt: "2026-03-01T20:00:00Z"
  }
];

// Helper Functions
export function getActiveChampionships(): Championship[] {
  return MOCK_CHAMPIONSHIPS.filter(c => c.status === "Active");
}

export function getVacantChampionships(): Championship[] {
  return MOCK_CHAMPIONSHIPS.filter(c => c.status === "Vacant");
}

export function getChampionshipByDivision(division: WeightDivision): Championship | undefined {
  return MOCK_CHAMPIONSHIPS.find(c => c.division === division);
}

export function getChampionshipById(id: string): Championship | undefined {
  return MOCK_CHAMPIONSHIPS.find(c => c.id === id);
}

// Weight Division Configuration
export const WEIGHT_DIVISION_CONFIG: Record<WeightDivision, {
  range: string;
  color: string;
  bgColor: string;
}> = {
  "Flyweight": {
    range: "48-54 kg",
    color: "text-purple-700",
    bgColor: "bg-purple-100"
  },
  "Bantamweight": {
    range: "54-60 kg",
    color: "text-blue-700",
    bgColor: "bg-blue-100"
  },
  "Featherweight": {
    range: "60-67 kg",
    color: "text-cyan-700",
    bgColor: "bg-cyan-100"
  },
  "Lightweight": {
    range: "67-72 kg",
    color: "text-green-700",
    bgColor: "bg-green-100"
  },
  "Welterweight": {
    range: "72-80 kg",
    color: "text-amber-700",
    bgColor: "bg-amber-100"
  },
  "Middleweight": {
    range: "80-88 kg",
    color: "text-orange-700",
    bgColor: "bg-orange-100"
  },
  "Light Heavyweight": {
    range: "88-95 kg",
    color: "text-red-700",
    bgColor: "bg-red-100"
  },
  "Heavyweight": {
    range: "95+ kg",
    color: "text-gray-700",
    bgColor: "bg-gray-100"
  }
};
