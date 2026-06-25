// KUN KHMER Awards System
// Awards = Medals + Belts + Titles + Event Prizes + Recognition

// Award Categories
export type AwardCategory = 
  | 'international'   // 🌍 World Championship, International Belts
  | 'regional'        // 🥇 SEA Games, Asian Championships
  | 'national'        // 🇰🇭 KKF National Championships
  | 'professional'    // 🥊 Professional Event Awards
  | 'recognition';    // ⭐ Fighter of the Year, Special Recognition

// Award Types
export type AwardType = 
  // International
  | 'world_championship_medal'
  | 'world_champion_belt'
  
  // Regional
  | 'sea_games_medal'
  | 'asian_championship_medal'
  
  // National (KKF)
  | 'national_champion_belt'
  | 'kkf_championship_title'
  | 'special_cup'
  
  // Professional Event
  | 'event_champion_belt'
  | 'prize_money'
  | 'tournament_winner'
  
  // Recognition
  | 'fighter_of_year'
  | 'knockout_of_year'
  | 'rising_star'
  | 'most_popular_fighter'
  | 'hall_of_fame';

// Medal/Belt Levels
export type AwardLevel = 'gold' | 'silver' | 'bronze' | 'champion' | 'special';

// Award Organizations
export type AwardOrganization = 
  | 'IKKF'          // International Kun Khmer Federation
  | 'ISKA'          // International Sport Karate Association
  | 'WBC'           // World Boxing Council (Muay Thai)
  | 'SEA_GAMES'     // Southeast Asian Games
  | 'KKF'           // Kun Khmer Federation
  | 'EVENT';        // Event-specific

export interface Award {
  id: string;
  category: AwardCategory;
  type: AwardType;
  level?: AwardLevel;
  title: string;
  description: string;
  organization: AwardOrganization;
  
  // Winner Information
  winnerId?: string;
  winnerName?: string;
  winnerClub?: string;
  
  // Event Information
  eventId?: string;
  eventName?: string;
  eventDate?: string;
  location?: string;
  
  // Award Details
  weightClass?: string;
  cashPrize?: number;
  trophyDetails?: string;
  imageUrl?: string;
  
  // Metadata
  awardedDate: string;
  year: number;
  status: 'awarded' | 'pending' | 'nominated';
}

// Award Category Configuration
export const AWARD_CATEGORY_CONFIG: Record<AwardCategory, {
  label: string;
  icon: string;
  color: string;
  bgColor: string;
  borderColor: string;
  description: string;
}> = {
  international: {
    label: 'International Awards',
    icon: '🌍',
    color: 'text-purple-700',
    bgColor: 'bg-purple-100',
    borderColor: 'border-purple-300',
    description: 'World Championship medals and international belts',
  },
  regional: {
    label: 'Regional Awards',
    icon: '🥇',
    color: 'text-orange-700',
    bgColor: 'bg-orange-100',
    borderColor: 'border-orange-300',
    description: 'SEA Games and Asian Championship medals',
  },
  national: {
    label: 'National Awards (KKF)',
    icon: '🇰🇭',
    color: 'text-blue-700',
    bgColor: 'bg-blue-100',
    borderColor: 'border-blue-300',
    description: 'KKF National Championships and special cups',
  },
  professional: {
    label: 'Professional Event Awards',
    icon: '🥊',
    color: 'text-red-700',
    bgColor: 'bg-red-100',
    borderColor: 'border-red-300',
    description: 'Event champion belts and tournament prizes',
  },
  recognition: {
    label: 'Fighter Recognition',
    icon: '⭐',
    color: 'text-yellow-700',
    bgColor: 'bg-yellow-100',
    borderColor: 'border-yellow-300',
    description: 'Fighter of the Year and special recognition awards',
  },
};

// Award Type Configuration
export const AWARD_TYPE_CONFIG: Record<AwardType, {
  label: string;
  icon: string;
  category: AwardCategory;
  hasLevel: boolean;
}> = {
  // International
  world_championship_medal: {
    label: 'World Championship Medal',
    icon: '🏅',
    category: 'international',
    hasLevel: true, // Gold, Silver, Bronze
  },
  world_champion_belt: {
    label: 'World Champion Belt',
    icon: '🏆',
    category: 'international',
    hasLevel: false,
  },
  
  // Regional
  sea_games_medal: {
    label: 'SEA Games Medal',
    icon: '🥇',
    category: 'regional',
    hasLevel: true,
  },
  asian_championship_medal: {
    label: 'Asian Championship Medal',
    icon: '🥈',
    category: 'regional',
    hasLevel: true,
  },
  
  // National (KKF)
  national_champion_belt: {
    label: 'National Champion Belt',
    icon: '👑',
    category: 'national',
    hasLevel: false,
  },
  kkf_championship_title: {
    label: 'KKF Championship Title',
    icon: '🏆',
    category: 'national',
    hasLevel: false,
  },
  special_cup: {
    label: 'Special Cup',
    icon: '🏆',
    category: 'national',
    hasLevel: false,
  },
  
  // Professional Event
  event_champion_belt: {
    label: 'Event Champion Belt',
    icon: '🥊',
    category: 'professional',
    hasLevel: false,
  },
  prize_money: {
    label: 'Prize Money',
    icon: '💰',
    category: 'professional',
    hasLevel: false,
  },
  tournament_winner: {
    label: 'Tournament Winner',
    icon: '🏅',
    category: 'professional',
    hasLevel: false,
  },
  
  // Recognition
  fighter_of_year: {
    label: 'Fighter of the Year',
    icon: '⭐',
    category: 'recognition',
    hasLevel: false,
  },
  knockout_of_year: {
    label: 'Knockout of the Year',
    icon: '💥',
    category: 'recognition',
    hasLevel: false,
  },
  rising_star: {
    label: 'Rising Star',
    icon: '🌟',
    category: 'recognition',
    hasLevel: false,
  },
  most_popular_fighter: {
    label: 'Most Popular Fighter',
    icon: '❤️',
    category: 'recognition',
    hasLevel: false,
  },
  hall_of_fame: {
    label: 'Hall of Fame',
    icon: '🎖️',
    category: 'recognition',
    hasLevel: false,
  },
};

// Medal/Belt Level Configuration
export const AWARD_LEVEL_CONFIG: Record<AwardLevel, {
  label: string;
  color: string;
  bgColor: string;
  borderColor: string;
  icon: string;
}> = {
  gold: {
    label: 'Gold',
    color: 'text-yellow-700',
    bgColor: 'bg-yellow-100',
    borderColor: 'border-yellow-400',
    icon: '🥇',
  },
  silver: {
    label: 'Silver',
    color: 'text-gray-700',
    bgColor: 'bg-gray-100',
    borderColor: 'border-gray-400',
    icon: '🥈',
  },
  bronze: {
    label: 'Bronze',
    color: 'text-orange-700',
    bgColor: 'bg-orange-100',
    borderColor: 'border-orange-400',
    icon: '🥉',
  },
  champion: {
    label: 'Champion',
    color: 'text-purple-700',
    bgColor: 'bg-purple-100',
    borderColor: 'border-purple-400',
    icon: '👑',
  },
  special: {
    label: 'Special',
    color: 'text-blue-700',
    bgColor: 'bg-blue-100',
    borderColor: 'border-blue-400',
    icon: '⭐',
  },
};

// Mock Awards Data
export const MOCK_AWARDS: Award[] = [
  // International Awards
  {
    id: 'aw1',
    category: 'international',
    type: 'world_championship_medal',
    level: 'gold',
    title: 'IKKF World Championship - Gold Medal',
    description: 'Lightweight Division World Champion',
    organization: 'IKKF',
    winnerId: 'f1',
    winnerName: 'Sorn Seavmey',
    winnerClub: 'Pradal Khmer Gym',
    eventName: 'IKKF World Championship 2025',
    eventDate: '2025-11-15',
    location: 'Singapore',
    weightClass: '63 kg',
    awardedDate: '2025-11-15',
    year: 2025,
    status: 'awarded',
    imageUrl: 'https://images.unsplash.com/photo-1557683316-973673baf926?auto=format&fit=crop&q=80&w=600',
  },
  {
    id: 'aw2',
    category: 'international',
    type: 'world_champion_belt',
    level: 'champion',
    title: 'IKKF World Champion Belt',
    description: 'IKKF Welterweight World Champion',
    organization: 'IKKF',
    winnerId: 'f5',
    winnerName: 'Prak Sophea',
    winnerClub: 'Phnom Penh Top Team',
    eventName: 'IKKF Championship',
    eventDate: '2024-08-20',
    location: 'Kuala Lumpur, Malaysia',
    weightClass: '67 kg',
    awardedDate: '2024-08-20',
    year: 2024,
    status: 'awarded',
  },
  
  // Regional Awards
  {
    id: 'aw3',
    category: 'regional',
    type: 'sea_games_medal',
    level: 'gold',
    title: 'SEA Games 2023 - Gold Medal',
    description: 'Lightweight Division Champion',
    organization: 'SEA_GAMES',
    winnerId: 'f1',
    winnerName: 'Sorn Seavmey',
    winnerClub: 'Pradal Khmer Gym',
    eventName: '32nd SEA Games',
    eventDate: '2023-05-10',
    location: 'Phnom Penh, Cambodia',
    weightClass: '63 kg',
    awardedDate: '2023-05-10',
    year: 2023,
    status: 'awarded',
  },
  {
    id: 'aw4',
    category: 'regional',
    type: 'sea_games_medal',
    level: 'bronze',
    title: 'SEA Games 2023 - Bronze Medal',
    description: 'Featherweight Division',
    organization: 'SEA_GAMES',
    winnerId: 'f3',
    winnerName: 'Nou Srey Pov',
    winnerClub: 'Battam Gym',
    eventName: '32nd SEA Games',
    eventDate: '2023-05-12',
    location: 'Phnom Penh, Cambodia',
    weightClass: '52 kg',
    awardedDate: '2023-05-12',
    year: 2023,
    status: 'awarded',
  },
  
  // National Awards (KKF)
  {
    id: 'aw5',
    category: 'national',
    type: 'national_champion_belt',
    level: 'champion',
    title: 'KKF National Champion Belt',
    description: 'Welterweight National Champion 2026',
    organization: 'KKF',
    winnerId: 'f5',
    winnerName: 'Prak Sophea',
    winnerClub: 'Phnom Penh Top Team',
    eventName: 'KKF National Championship 2026',
    eventDate: '2026-02-15',
    location: 'Phnom Penh, Cambodia',
    weightClass: '67 kg',
    awardedDate: '2026-02-15',
    year: 2026,
    status: 'awarded',
  },
  {
    id: 'aw6',
    category: 'national',
    type: 'special_cup',
    level: 'special',
    title: 'Tea Banh Cup',
    description: 'Special Recognition Cup',
    organization: 'KKF',
    winnerId: 'f1',
    winnerName: 'Sorn Seavmey',
    winnerClub: 'Pradal Khmer Gym',
    eventName: 'KKF Annual Gala 2025',
    eventDate: '2025-12-20',
    location: 'Phnom Penh, Cambodia',
    awardedDate: '2025-12-20',
    year: 2025,
    status: 'awarded',
  },
  
  // Professional Event Awards
  {
    id: 'aw7',
    category: 'professional',
    type: 'event_champion_belt',
    level: 'champion',
    title: 'Bayon Warriors Champion Belt',
    description: 'Tournament Champion',
    organization: 'EVENT',
    winnerId: 'f2',
    winnerName: 'Chan Rothana',
    winnerClub: 'Selapak Kun Khmer',
    eventId: 'e2',
    eventName: 'Bayon Warriors Night',
    eventDate: '2026-03-15',
    location: 'Siem Reap, Cambodia',
    weightClass: '60 kg',
    awardedDate: '2026-03-15',
    year: 2026,
    status: 'awarded',
  },
  {
    id: 'aw8',
    category: 'professional',
    type: 'prize_money',
    title: 'Main Event Winner Prize',
    description: 'Championship Fight Winner',
    organization: 'EVENT',
    winnerId: 'f1',
    winnerName: 'Sorn Seavmey',
    winnerClub: 'Pradal Khmer Gym',
    eventId: 'e1',
    eventName: 'KUN KHMER Grand Championship 2026',
    eventDate: '2026-03-25',
    location: 'Phnom Penh, Cambodia',
    weightClass: '63 kg',
    cashPrize: 5000,
    awardedDate: '2026-03-25',
    year: 2026,
    status: 'awarded',
  },
  
  // Recognition Awards
  {
    id: 'aw9',
    category: 'recognition',
    type: 'fighter_of_year',
    level: 'special',
    title: 'Fighter of the Year 2025',
    description: 'Best Overall Performance',
    organization: 'KKF',
    winnerId: 'f1',
    winnerName: 'Sorn Seavmey',
    winnerClub: 'Pradal Khmer Gym',
    eventName: 'KKF Annual Awards 2025',
    eventDate: '2025-12-31',
    location: 'Phnom Penh, Cambodia',
    awardedDate: '2025-12-31',
    year: 2025,
    status: 'awarded',
  },
  {
    id: 'aw10',
    category: 'recognition',
    type: 'knockout_of_year',
    level: 'special',
    title: 'Knockout of the Year 2025',
    description: 'Most Spectacular KO',
    organization: 'KKF',
    winnerId: 'f5',
    winnerName: 'Prak Sophea',
    winnerClub: 'Phnom Penh Top Team',
    eventName: 'KKF Annual Awards 2025',
    eventDate: '2025-12-31',
    location: 'Phnom Penh, Cambodia',
    trophyDetails: 'Round 2 flying knee knockout',
    awardedDate: '2025-12-31',
    year: 2025,
    status: 'awarded',
  },
  {
    id: 'aw11',
    category: 'recognition',
    type: 'rising_star',
    level: 'special',
    title: 'Rising Star 2026',
    description: 'Most Promising Young Fighter',
    organization: 'KKF',
    winnerId: 'f3',
    winnerName: 'Nou Srey Pov',
    winnerClub: 'Battam Gym',
    awardedDate: '2026-01-15',
    year: 2026,
    status: 'awarded',
  },
];

// Helper Functions

// Get awards by category
export function getAwardsByCategory(category: AwardCategory): Award[] {
  return MOCK_AWARDS.filter(a => a.category === category);
}

// Get awards by fighter
export function getFighterAwards(fighterId: string): Award[] {
  return MOCK_AWARDS.filter(a => a.winnerId === fighterId);
}

// Get awards by event
export function getEventAwards(eventId: string): Award[] {
  return MOCK_AWARDS.filter(a => a.eventId === eventId);
}

// Get awards by year
export function getAwardsByYear(year: number): Award[] {
  return MOCK_AWARDS.filter(a => a.year === year);
}

// Get awards by organization
export function getAwardsByOrganization(org: AwardOrganization): Award[] {
  return MOCK_AWARDS.filter(a => a.organization === org);
}

// Count awards by type for a fighter
export function countFighterAwardsByType(fighterId: string): Record<AwardType, number> {
  const fighterAwards = getFighterAwards(fighterId);
  const counts: any = {};
  
  Object.keys(AWARD_TYPE_CONFIG).forEach(type => {
    counts[type] = fighterAwards.filter(a => a.type === type).length;
  });
  
  return counts;
}

// Get total prize money for a fighter
export function getFighterTotalPrizeMoney(fighterId: string): number {
  return getFighterAwards(fighterId)
    .filter(a => a.cashPrize)
    .reduce((sum, a) => sum + (a.cashPrize || 0), 0);
}

// Format prize money
export function formatPrizeMoney(amount: number): string {
  return `$${amount.toLocaleString()}`;
}

// Get fighter's highest achievement
export function getFighterHighestAchievement(fighterId: string): Award | null {
  const awards = getFighterAwards(fighterId);
  
  // Priority: International > Regional > National > Professional > Recognition
  const priority: AwardCategory[] = ['international', 'regional', 'national', 'professional', 'recognition'];
  
  for (const category of priority) {
    const categoryAwards = awards.filter(a => a.category === category);
    if (categoryAwards.length > 0) {
      // Within category, prefer gold > silver > bronze
      const gold = categoryAwards.find(a => a.level === 'gold');
      if (gold) return gold;
      
      const silver = categoryAwards.find(a => a.level === 'silver');
      if (silver) return silver;
      
      return categoryAwards[0];
    }
  }
  
  return null;
}

// Award summary for fighter profile
export interface FighterAwardSummary {
  totalAwards: number;
  international: number;
  regional: number;
  national: number;
  professional: number;
  recognition: number;
  goldMedals: number;
  silverMedals: number;
  bronzeMedals: number;
  championBelts: number;
  totalPrizeMoney: number;
  highestAchievement: Award | null;
}

export function getFighterAwardSummary(fighterId: string): FighterAwardSummary {
  const awards = getFighterAwards(fighterId);
  
  return {
    totalAwards: awards.length,
    international: awards.filter(a => a.category === 'international').length,
    regional: awards.filter(a => a.category === 'regional').length,
    national: awards.filter(a => a.category === 'national').length,
    professional: awards.filter(a => a.category === 'professional').length,
    recognition: awards.filter(a => a.category === 'recognition').length,
    goldMedals: awards.filter(a => a.level === 'gold').length,
    silverMedals: awards.filter(a => a.level === 'silver').length,
    bronzeMedals: awards.filter(a => a.level === 'bronze').length,
    championBelts: awards.filter(a => a.type.includes('belt')).length,
    totalPrizeMoney: getFighterTotalPrizeMoney(fighterId),
    highestAchievement: getFighterHighestAchievement(fighterId),
  };
}