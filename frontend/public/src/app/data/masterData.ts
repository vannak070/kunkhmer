// Master Data for Broadcast Stations and Sponsors

export interface BroadcastStation {
  id: string;
  name: string;
  logo: string;
  image?: string; // Added image for broadcast station visuals
  type: 'National TV' | 'Cable TV' | 'Digital Platform' | 'Radio';
  reach: string;
  contactPerson?: string;
  contactEmail?: string;
  active: boolean;
}

export interface Sponsor {
  id: string;
  name: string;
  logo: string;
  image?: string; // Added image for sponsor visuals
  industry: string;
  tier: 'Platinum' | 'Gold' | 'Silver' | 'Bronze';
  contactPerson?: string;
  contactEmail?: string;
  active: boolean;
}

export interface GloveSize {
  id: string;
  size: string;
  weightRange: string;
  description: string;
}

export interface GloveType {
  id: string;
  brand: string;
  model: string;
  approved: boolean;
}

// Glove Sizes Master List
export const GLOVE_SIZES: GloveSize[] = [
  {
    id: 'glove-6oz',
    size: '6oz',
    weightRange: 'Up to 54kg',
    description: 'Lightweight gloves for smaller fighters',
  },
  {
    id: 'glove-8oz',
    size: '8oz',
    weightRange: '54kg - 67kg',
    description: 'Standard gloves for most weight classes',
  },
  {
    id: 'glove-10oz',
    size: '10oz',
    weightRange: '67kg and above',
    description: 'Heavier gloves for larger fighters',
  },
];

// Approved Glove Brands/Types Master List
export const GLOVE_TYPES: GloveType[] = [
  { id: 'gt1', brand: 'Twins Special', model: 'BGVL-3', approved: true },
  { id: 'gt2', brand: 'Fairtex', model: 'BGV1', approved: true },
  { id: 'gt3', brand: 'Top King', model: 'Super Air', approved: true },
  { id: 'gt4', brand: 'Boon', model: 'Retro', approved: true },
  { id: 'gt5', brand: 'Yokkao', model: 'Matrix', approved: true },
  { id: 'gt6', brand: 'Raja Boxing', model: 'RBG-1', approved: true },
  { id: 'gt7', brand: 'Windy', model: 'BGVH', approved: true },
  { id: 'gt8', brand: 'Venum', model: 'Elite', approved: true },
];

// Broadcast Stations Master List
export const BROADCAST_STATIONS: BroadcastStation[] = [
  {
    id: 'bs1',
    name: 'Town Full HDTV',
    logo: 'https://images.unsplash.com/photo-1593784991095-a205069470b6?w=400&h=400&fit=crop',
    image: 'https://images.unsplash.com/photo-1768222935380-0a3a76fbb42e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080',
    type: 'Cable TV',
    reach: 'National',
    contactPerson: 'Mr. Srey Vicheka',
    contactEmail: 'contact@townfull.tv',
    active: true,
  },
  {
    id: 'bs2',
    name: 'Bayon TV',
    logo: 'https://images.unsplash.com/photo-1478737270239-2f02b77fc618?w=400&h=400&fit=crop',
    image: 'https://images.unsplash.com/photo-1650984661525-7e6b1b874e47?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080',
    type: 'National TV',
    reach: 'National',
    contactPerson: 'Ms. Sok Pisey',
    contactEmail: 'info@bayontv.com',
    active: true,
  },
  {
    id: 'bs3',
    name: 'PNN TV',
    logo: 'https://images.unsplash.com/photo-1522152302542-71a8e5172aa1?w=400&h=400&fit=crop',
    image: 'https://images.unsplash.com/photo-1693993367105-d2c37d9b60ce?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080',
    type: 'Cable TV',
    reach: 'National',
    contactPerson: 'Mr. Chea Dara',
    contactEmail: 'contact@pnn.com.kh',
    active: true,
  },
  {
    id: 'bs4',
    name: 'CNC',
    logo: 'https://images.unsplash.com/photo-1560169897-fc0cdbdfa4d5?w=400&h=400&fit=crop',
    image: 'https://images.unsplash.com/photo-1762884062124-7afb1d38413d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080',
    type: 'Cable TV',
    reach: 'National',
    contactPerson: 'Mr. Heng Sokheng',
    contactEmail: 'info@cnc.com.kh',
    active: true,
  },
  {
    id: 'bs5',
    name: 'TVK',
    logo: 'https://images.unsplash.com/photo-1522869635100-9f4c5e86aa37?w=400&h=400&fit=crop',
    image: 'https://images.unsplash.com/photo-1768222935380-0a3a76fbb42e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080',
    type: 'National TV',
    reach: 'National',
    contactPerson: 'Ms. Mey Samnang',
    contactEmail: 'contact@tvk.gov.kh',
    active: true,
  },
  {
    id: 'bs6',
    name: 'TV3',
    logo: 'https://images.unsplash.com/photo-1611162616305-c69b3fa7fbe0?w=400&h=400&fit=crop&sig=2',
    type: 'Cable TV',
    reach: 'Urban Areas',
    contactPerson: 'Mr. Lim Sokha',
    contactEmail: 'info@tv3.com.kh',
    active: true,
  },
  {
    id: 'bs7',
    name: 'MyTV',
    logo: 'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=400&h=400&fit=crop',
    type: 'Digital Platform',
    reach: 'Online/Mobile',
    contactPerson: 'Ms. Chann Rachana',
    contactEmail: 'support@mytv.com.kh',
    active: true,
  },
  {
    id: 'bs8',
    name: 'CTN',
    logo: 'https://images.unsplash.com/photo-1574375927938-d5a98e8ffe85?w=400&h=400&fit=crop',
    type: 'Cable TV',
    reach: 'National',
    contactPerson: 'Mr. Sok Vannak',
    contactEmail: 'contact@ctn.com.kh',
    active: true,
  },
  {
    id: 'bs9',
    name: 'Hang Meas HDTV',
    logo: 'https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?w=400&h=400&fit=crop',
    type: 'Cable TV',
    reach: 'National',
    contactPerson: 'Ms. Pich Sophia',
    contactEmail: 'info@hangmeashdtv.com',
    active: true,
  },
  {
    id: 'bs10',
    name: 'Apsara TV',
    logo: 'https://images.unsplash.com/photo-1505330622279-bf7d7fc918f4?w=400&h=400&fit=crop',
    type: 'Cable TV',
    reach: 'National',
    contactPerson: 'Mr. Thong Rithy',
    contactEmail: 'contact@apsaratv.com',
    active: true,
  },
];

// Sponsors Master List
export const SPONSORS: Sponsor[] = [
  {
    id: 'sp1',
    name: 'Carabao',
    logo: 'https://images.unsplash.com/photo-1622543925917-763c34f1f161?w=400&h=400&fit=crop',
    image: 'https://images.unsplash.com/photo-1771764678001-aa0f28e90f7f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080',
    industry: 'Energy Drinks',
    tier: 'Platinum',
    contactPerson: 'Mr. Phanna Sok',
    contactEmail: 'marketing@carabao.kh',
    active: true,
  },
  {
    id: 'sp2',
    name: 'Smart Axiata',
    logo: 'https://images.unsplash.com/photo-1611162616305-c69b3fa7fbe0?w=400&h=400&fit=crop',
    image: 'https://images.unsplash.com/photo-1738676455521-df2dfc8a719c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080',
    industry: 'Telecommunications',
    tier: 'Platinum',
    contactPerson: 'Ms. Rathana Chea',
    contactEmail: 'corporate@smart.com.kh',
    active: true,
  },
  {
    id: 'sp3',
    name: 'Ganzberg',
    logo: 'https://images.unsplash.com/photo-1593375547549-29fe3bf5c94f?w=400&h=400&fit=crop',
    image: 'https://images.unsplash.com/photo-1770646743342-bcfcacd50f42?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080',
    industry: 'Beverages',
    tier: 'Gold',
    contactPerson: 'Mr. Kimsan Lim',
    contactEmail: 'marketing@ganzberg.com.kh',
    active: true,
  },
  {
    id: 'sp4',
    name: 'Wing Bank',
    logo: 'https://images.unsplash.com/photo-1601597111158-2fceff292cdc?w=400&h=400&fit=crop',
    image: 'https://images.unsplash.com/photo-1770359718280-817b01057e02?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080',
    industry: 'Financial Services',
    tier: 'Gold',
    contactPerson: 'Ms. Vanna Chan',
    contactEmail: 'corporate@wing.com.kh',
    active: true,
  },
  {
    id: 'sp5',
    name: 'Krud',
    logo: 'https://images.unsplash.com/photo-1580859297753-0b52fa0fc46e?w=400&h=400&fit=crop',
    image: 'https://images.unsplash.com/photo-1771764678001-aa0f28e90f7f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080',
    industry: 'Energy Drinks',
    tier: 'Gold',
    contactPerson: 'Mr. Sokha Prak',
    contactEmail: 'marketing@krud.com.kh',
    active: true,
  },
  {
    id: 'sp6',
    name: 'Cellcard',
    logo: 'https://images.unsplash.com/photo-1616348436168-de43ad0db179?w=400&h=400&fit=crop',
    image: 'https://images.unsplash.com/photo-1738676455521-df2dfc8a719c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080',
    industry: 'Telecommunications',
    tier: 'Gold',
    contactPerson: 'Ms. Serey Kong',
    contactEmail: 'corporate@cellcard.com.kh',
    active: true,
  },
  {
    id: 'sp7',
    name: 'ABA Bank',
    logo: 'https://images.unsplash.com/photo-1698606137773-366628d2e61c?w=400&h=400&fit=crop',
    image: 'https://images.unsplash.com/photo-1770359718280-817b01057e02?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080',
    industry: 'Financial Services',
    tier: 'Silver',
    contactPerson: 'Mr. Virak Tep',
    contactEmail: 'marketing@ababank.com',
    active: true,
  },
  {
    id: 'sp8',
    name: 'Coca-Cola Cambodia',
    logo: 'https://images.unsplash.com/photo-1554866585-cd94860890b7?w=400&h=400&fit=crop',
    image: 'https://images.unsplash.com/photo-1677948156386-3446fed7aa40?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080',
    industry: 'Beverages',
    tier: 'Platinum',
    contactPerson: 'Ms. Sopheak Mao',
    contactEmail: 'marketing@coca-cola.kh',
    active: true,
  },
  {
    id: 'sp9',
    name: 'Cambodia Beer',
    logo: 'https://images.unsplash.com/photo-1761926184403-72c14dc44409?w=400&h=400&fit=crop',
    image: 'https://images.unsplash.com/photo-1770646743342-bcfcacd50f42?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080',
    industry: 'Beverages',
    tier: 'Gold',
    contactPerson: 'Mr. Rattanak Yin',
    contactEmail: 'info@cambodiabeer.com',
    active: true,
  },
  {
    id: 'sp10',
    name: 'Angkor Beer',
    logo: 'https://images.unsplash.com/photo-1535958636474-b021ee887b13?w=400&h=400&fit=crop',
    image: 'https://images.unsplash.com/photo-1770646743342-bcfcacd50f42?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080',
    industry: 'Beverages',
    tier: 'Gold',
    contactPerson: 'Ms. Chanthy Lim',
    contactEmail: 'marketing@angkorbeer.com',
    active: true,
  },
  {
    id: 'sp11',
    name: 'Toyota Cambodia',
    logo: 'https://images.unsplash.com/photo-1629897048514-3dd7414fe72a?w=400&h=400&fit=crop',
    image: 'https://images.unsplash.com/photo-1760976396211-5546ce83a400?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080',
    industry: 'Automotive',
    tier: 'Silver',
    contactPerson: 'Mr. Borey Sok',
    contactEmail: 'corporate@toyota.kh',
    active: true,
  },
  {
    id: 'sp12',
    name: 'Huawei Cambodia',
    logo: 'https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=400&h=400&fit=crop',
    image: 'https://images.unsplash.com/photo-1767978139637-fe09cbcd13fc?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080',
    industry: 'Technology',
    tier: 'Silver',
    contactPerson: 'Ms. Nita Pov',
    contactEmail: 'marketing@huawei.kh',
    active: true,
  },
  {
    id: 'sp13',
    name: 'Chip Mong Group',
    logo: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=400&h=400&fit=crop',
    image: 'https://images.unsplash.com/photo-1696383145128-975125223548?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080',
    industry: 'Conglomerate',
    tier: 'Platinum',
    contactPerson: 'Mr. Rithy Mong',
    contactEmail: 'corporate@chipmong.com',
    active: true,
  },
  {
    id: 'sp14',
    name: 'ACLEDA Bank',
    logo: 'https://images.unsplash.com/photo-1541354329998-f4d9a9f9297f?w=400&h=400&fit=crop',
    image: 'https://images.unsplash.com/photo-1770359718280-817b01057e02?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080',
    industry: 'Financial Services',
    tier: 'Gold',
    contactPerson: 'Ms. Sreymom Khun',
    contactEmail: 'marketing@acledabank.com.kh',
    active: true,
  },
  {
    id: 'sp15',
    name: 'Metfone',
    logo: 'https://images.unsplash.com/photo-1621768216002-5ac171876625?w=400&h=400&fit=crop',
    image: 'https://images.unsplash.com/photo-1738676455521-df2dfc8a719c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080',
    industry: 'Telecommunications',
    tier: 'Silver',
    contactPerson: 'Mr. Darith Suon',
    contactEmail: 'corporate@metfone.com.kh',
    active: true,
  },
  {
    id: 'sp16',
    name: 'Bakong Beer',
    logo: 'https://images.unsplash.com/photo-1644085159285-5fd924740cb3?w=400&h=400&fit=crop',
    image: 'https://images.unsplash.com/photo-1770646743342-bcfcacd50f42?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080',
    industry: 'Beverages',
    tier: 'Silver',
    contactPerson: 'Mr. Sarath Khiev',
    contactEmail: 'info@bakongbeer.com',
    active: true,
  },
  {
    id: 'sp17',
    name: 'Prince Bank',
    logo: 'https://images.unsplash.com/photo-1567427017947-545c5f8d16ad?w=400&h=400&fit=crop',
    image: 'https://images.unsplash.com/photo-1770359718280-817b01057e02?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080',
    industry: 'Financial Services',
    tier: 'Bronze',
    contactPerson: 'Ms. Bopha Im',
    contactEmail: 'marketing@princebank.com.kh',
    active: true,
  },
  {
    id: 'sp18',
    name: 'Red Bull Cambodia',
    logo: 'https://images.unsplash.com/photo-1622543925917-763c34f1f161?w=400&h=400&fit=crop&sig=2',
    image: 'https://images.unsplash.com/photo-1771764678001-aa0f28e90f7f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080',
    industry: 'Energy Drinks',
    tier: 'Silver',
    contactPerson: 'Mr. Kiri Heng',
    contactEmail: 'info@redbull.kh',
    active: true,
  },
  {
    id: 'sp19',
    name: 'Number One',
    logo: 'https://images.unsplash.com/photo-1622543925917-763c34f1f161?w=400&h=400&fit=crop&sig=3',
    image: 'https://images.unsplash.com/photo-1771764678001-aa0f28e90f7f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080',
    industry: 'Energy Drinks',
    tier: 'Bronze',
    contactPerson: 'Ms. Dara Chhun',
    contactEmail: 'marketing@numberone.kh',
    active: true,
  },
  {
    id: 'sp20',
    name: 'Sting Energy',
    logo: 'https://images.unsplash.com/photo-1593642532973-d31b6557fa68?w=400&h=400&fit=crop&sig=2',
    image: 'https://images.unsplash.com/photo-1771764678001-aa0f28e90f7f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080',
    industry: 'Energy Drinks',
    tier: 'Bronze',
    contactPerson: 'Mr. Vichet Tan',
    contactEmail: 'info@sting.kh',
    active: true,
  },
  {
    id: 'sp21',
    name: 'Dragon Beer',
    logo: 'https://images.unsplash.com/photo-1585620384249-5cf9442c87f3?w=400&h=400&fit=crop',
    image: 'https://images.unsplash.com/photo-1770646743342-bcfcacd50f42?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080',
    industry: 'Beverages',
    tier: 'Silver',
    contactPerson: 'Ms. Chanthou Lim',
    contactEmail: 'marketing@dragonbeer.com.kh',
    active: true,
  },
];

// Helper functions
export function getBroadcastStationById(id: string): BroadcastStation | undefined {
  return BROADCAST_STATIONS.find(bs => bs.id === id);
}

export function getSponsorById(id: string): Sponsor | undefined {
  return SPONSORS.find(s => s.id === id);
}

export function getActiveBroadcastStations(): BroadcastStation[] {
  return BROADCAST_STATIONS.filter(bs => bs.active);
}

export function getActiveSponsors(): Sponsor[] {
  return SPONSORS.filter(s => s.active);
}

export function getSponsorsByTier(tier: Sponsor['tier']): Sponsor[] {
  return SPONSORS.filter(s => s.tier === tier && s.active);
}

export function getGloveTypeById(id: string): GloveType | undefined {
  return GLOVE_TYPES.find(gt => gt.id === id);
}

export function getApprovedGloveTypes(): GloveType[] {
  return GLOVE_TYPES.filter(gt => gt.approved);
}

export function getGloveSizeById(id: string): GloveSize | undefined {
  return GLOVE_SIZES.find(gs => gs.id === id);
}

// Dynamic Weight Ranges Configuration
export const WEIGHT_RANGES: string[] = [
  "Under 45 kg",
  "45 kg - 47 kg",
  "48 kg - 49 kg",
  "50 kg - 52 kg",
  "53 kg - 55 kg",
  "56 kg - 58 kg",
  "59 kg - 61 kg",
  "62 kg - 64 kg",
  "65 kg - 67 kg",
  "68 kg - 70 kg",
  "71 kg - 73 kg",
  "74 kg - 76 kg",
  "77 kg - 80 kg",
  "Over 80 kg"
];

// Helper to determine weight range category dynamically
export function getWeightRangeCategory(weight: number): string {
  for (const range of WEIGHT_RANGES) {
    const underMatch = range.match(/under\s*(\d+)/i);
    if (underMatch) {
      const maxVal = parseFloat(underMatch[1]);
      if (weight <= maxVal) return range;
    }

    const overMatch = range.match(/over\s*(\d+)/i);
    if (overMatch) {
      const minVal = parseFloat(overMatch[1]);
      if (weight >= minVal) return range;
    }

    const rangeMatch = range.match(/(\d+(?:\.\d+)?)\s*(?:kg)?\s*-\s*(\d+(?:\.\d+)?)/i);
    if (rangeMatch) {
      const minVal = parseFloat(rangeMatch[1]);
      const maxVal = parseFloat(rangeMatch[2]);
      if (weight >= minVal && weight <= maxVal) return range;
    }
  }

  // Fallback defaults
  if (weight <= 45) return "Under 45 kg";
  if (weight <= 47) return "45 kg - 47 kg";
  if (weight <= 49) return "48 kg - 49 kg";
  if (weight <= 52) return "50 kg - 52 kg";
  if (weight <= 55) return "53 kg - 55 kg";
  if (weight <= 58) return "56 kg - 58 kg";
  if (weight <= 61) return "59 kg - 61 kg";
  if (weight <= 64) return "62 kg - 64 kg";
  if (weight <= 67) return "65 kg - 67 kg";
  if (weight <= 70) return "68 kg - 70 kg";
  if (weight <= 73) return "71 kg - 73 kg";
  if (weight <= 76) return "74 kg - 76 kg";
  if (weight <= 80) return "77 kg - 80 kg";
  return "Over 80 kg";
}

export function getFighterSlug(fighter: { id: string; name?: string }): string {
  if (!fighter.name) return fighter.id;
  const slug = fighter.name
    .toLowerCase()
    .trim()
    .replace(/[\s_-]+/g, '-');
  return encodeURIComponent(slug) || fighter.id;
}