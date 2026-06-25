// Fighter Status System for Club Management
// Based on KKF Process Flow requirements

export type FighterStatus = 
  | 'available'      // 🟢 Ready to fight
  | 'scheduled'      // 🔵 Has upcoming match
  | 'resting'        // 🟡 In mandatory rest period
  | 'injured'        // 🟠 Recovering from injury
  | 'suspended'      // 🔴 Temporarily banned
  | 'not_eligible'   // ⚫ Cannot fight (medical expired, etc.)
  | 'retired';       // ⚪ No longer active

export interface FighterStatusConfig {
  id: FighterStatus;
  label: string;
  icon: string;
  color: string;
  bgColor: string;
  borderColor: string;
  description: string;
  canAcceptMatch: boolean;
  requiresAction?: string;
}

export const FIGHTER_STATUS_CONFIG: Record<FighterStatus, FighterStatusConfig> = {
  available: {
    id: 'available',
    label: 'Available',
    icon: '🟢',
    color: 'text-green-700',
    bgColor: 'bg-green-100',
    borderColor: 'border-green-300',
    description: 'Fighter is ready and eligible to accept matches',
    canAcceptMatch: true,
  },
  
  scheduled: {
    id: 'scheduled',
    label: 'Scheduled',
    icon: '🔵',
    color: 'text-blue-700',
    bgColor: 'bg-blue-100',
    borderColor: 'border-blue-300',
    description: 'Fighter has an upcoming match confirmed',
    canAcceptMatch: false,
    requiresAction: 'Fighter already scheduled for a match',
  },
  
  resting: {
    id: 'resting',
    label: 'Resting',
    icon: '🟡',
    color: 'text-amber-700',
    bgColor: 'bg-amber-100',
    borderColor: 'border-amber-300',
    description: 'Fighter is in mandatory rest period after last fight',
    canAcceptMatch: false,
    requiresAction: 'Fighter must complete rest period first',
  },
  
  injured: {
    id: 'injured',
    label: 'Injured',
    icon: '🟠',
    color: 'text-orange-700',
    bgColor: 'bg-orange-100',
    borderColor: 'border-orange-300',
    description: 'Fighter is recovering from injury',
    canAcceptMatch: false,
    requiresAction: 'Fighter needs medical clearance',
  },
  
  suspended: {
    id: 'suspended',
    label: 'Suspended',
    icon: '🔴',
    color: 'text-red-700',
    bgColor: 'bg-red-100',
    borderColor: 'border-red-300',
    description: 'Fighter is temporarily banned by KKF',
    canAcceptMatch: false,
    requiresAction: 'Suspension must be lifted by KKF',
  },
  
  not_eligible: {
    id: 'not_eligible',
    label: 'Not Eligible',
    icon: '⚫',
    color: 'text-gray-700',
    bgColor: 'bg-gray-100',
    borderColor: 'border-gray-300',
    description: 'Fighter does not meet eligibility requirements',
    canAcceptMatch: false,
    requiresAction: 'Update medical records or complete KYC',
  },
  
  retired: {
    id: 'retired',
    label: 'Retired',
    icon: '⚪',
    color: 'text-gray-500',
    bgColor: 'bg-gray-50',
    borderColor: 'border-gray-200',
    description: 'Fighter is no longer active in competition',
    canAcceptMatch: false,
    requiresAction: 'Fighter has retired from competition',
  },
};

// Auto Block Rules - System prevents match confirmation if these conditions exist
export interface FighterBlockReason {
  reason: string;
  severity: 'error' | 'warning';
  canOverride: boolean;
  requiredAction: string;
}

export function checkFighterEligibility(fighter: {
  status: FighterStatus;
  medicalExpiryDate?: string;
  lastFightDate?: string;
  scheduledMatches?: number;
}): FighterBlockReason[] {
  const blocks: FighterBlockReason[] = [];
  
  // Check 1: Fighter Status
  const statusConfig = FIGHTER_STATUS_CONFIG[fighter.status];
  if (!statusConfig.canAcceptMatch) {
    blocks.push({
      reason: statusConfig.requiresAction || `Fighter status is ${statusConfig.label}`,
      severity: 'error',
      canOverride: false,
      requiredAction: statusConfig.requiresAction || 'Change fighter status',
    });
  }
  
  // Check 2: Medical Certificate Expired
  if (fighter.medicalExpiryDate) {
    const expiryDate = new Date(fighter.medicalExpiryDate);
    const today = new Date();
    
    if (expiryDate < today) {
      blocks.push({
        reason: 'Medical certificate has expired',
        severity: 'error',
        canOverride: false,
        requiredAction: 'Upload new medical certificate',
      });
    }
    
    // Warning if expiring within 30 days
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
    
    if (expiryDate < thirtyDaysFromNow && expiryDate >= today) {
      blocks.push({
        reason: `Medical certificate expires soon (${expiryDate.toLocaleDateString()})`,
        severity: 'warning',
        canOverride: true,
        requiredAction: 'Consider updating medical certificate',
      });
    }
  }
  
  // Check 3: Rest Period (30 days after last fight)
  if (fighter.lastFightDate) {
    const lastFight = new Date(fighter.lastFightDate);
    const restPeriodEnd = new Date(lastFight);
    restPeriodEnd.setDate(restPeriodEnd.getDate() + 30); // 30-day rest period
    
    const today = new Date();
    
    if (restPeriodEnd > today) {
      const daysRemaining = Math.ceil((restPeriodEnd.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
      blocks.push({
        reason: `Fighter is in mandatory rest period (${daysRemaining} days remaining)`,
        severity: 'error',
        canOverride: false,
        requiredAction: `Wait until ${restPeriodEnd.toLocaleDateString()}`,
      });
    }
  }
  
  // Check 4: Already Scheduled
  if (fighter.scheduledMatches && fighter.scheduledMatches > 0) {
    blocks.push({
      reason: `Fighter already has ${fighter.scheduledMatches} scheduled match(es)`,
      severity: 'error',
      canOverride: false,
      requiredAction: 'Complete or cancel existing matches first',
    });
  }
  
  return blocks;
}

// Helper: Can fighter accept match?
export function canAcceptMatch(fighter: {
  status: FighterStatus;
  medicalExpiryDate?: string;
  lastFightDate?: string;
  scheduledMatches?: number;
}): boolean {
  const blocks = checkFighterEligibility(fighter);
  return blocks.filter(b => b.severity === 'error').length === 0;
}

// Helper: Get fighter availability percentage
export function getFighterAvailabilityPercentage(fighters: Array<{ status: FighterStatus }>): {
  available: number;
  scheduled: number;
  resting: number;
  notEligible: number;
  total: number;
} {
  const total = fighters.length;
  
  if (total === 0) {
    return { available: 0, scheduled: 0, resting: 0, notEligible: 0, total: 0 };
  }
  
  const counts = {
    available: fighters.filter(f => f.status === 'available').length,
    scheduled: fighters.filter(f => f.status === 'scheduled').length,
    resting: fighters.filter(f => f.status === 'resting').length,
    notEligible: fighters.filter(f => ['not_eligible', 'suspended', 'injured', 'retired'].includes(f.status)).length,
  };
  
  return {
    available: Math.round((counts.available / total) * 100),
    scheduled: Math.round((counts.scheduled / total) * 100),
    resting: Math.round((counts.resting / total) * 100),
    notEligible: Math.round((counts.notEligible / total) * 100),
    total,
  };
}

// Fighter Ownership Rules
export interface FighterOwnership {
  fighterId: string;
  clubId: string;
  clubName: string;
  registeredDate: string;
  isPrimary: boolean;
}

// Validate fighter ownership (each fighter belongs to 1 club only)
export function validateFighterOwnership(
  fighterId: string,
  clubId: string,
  existingOwnerships: FighterOwnership[]
): { valid: boolean; error?: string } {
  const existing = existingOwnerships.find(o => o.fighterId === fighterId);
  
  if (!existing) {
    return { valid: true }; // New fighter, can claim ownership
  }
  
  if (existing.clubId === clubId) {
    return { valid: true }; // Same club, already owns
  }
  
  return {
    valid: false,
    error: `Fighter already belongs to ${existing.clubName}. Transfer required.`,
  };
}

// Rest Period Calculation
export function calculateRestPeriodEnd(lastFightDate: string, restDays: number = 30): Date {
  const lastFight = new Date(lastFightDate);
  const restEnd = new Date(lastFight);
  restEnd.setDate(restEnd.getDate() + restDays);
  return restEnd;
}

export function isInRestPeriod(lastFightDate: string, restDays: number = 30): boolean {
  const restEnd = calculateRestPeriodEnd(lastFightDate, restDays);
  return new Date() < restEnd;
}

export function getRemainingRestDays(lastFightDate: string, restDays: number = 30): number {
  if (!isInRestPeriod(lastFightDate, restDays)) return 0;
  
  const restEnd = calculateRestPeriodEnd(lastFightDate, restDays);
  const today = new Date();
  const diffTime = restEnd.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  return diffDays;
}
