// Fighter Registration Approval System
// When club registers fighter, it goes to pending approval by KKF

export type FighterApprovalStatus = 
  | 'pending'      // ⏳ Waiting for KKF approval
  | 'approved'     // ✅ Approved by KKF, can fight
  | 'rejected'     // ❌ Rejected, needs revision
  | 'revision'     // 🔄 Needs updates from club
  | 'suspended';   // 🚫 Temporarily suspended by KKF

export interface FighterApprovalRecord {
  id: string;
  fighterId: string;
  fighterName: string;
  clubId: string;
  clubName: string;
  status: FighterApprovalStatus;
  submittedDate: string;
  reviewedDate?: string;
  reviewedBy?: string; // KKF Auditor ID
  comments?: string;
  rejectionReason?: string;
  revisionRequired?: string[];
  history: ApprovalHistoryEntry[];
}

export interface ApprovalHistoryEntry {
  date: string;
  status: FighterApprovalStatus;
  actor: string; // User who made the change
  actorRole: string;
  comments?: string;
}

export const APPROVAL_STATUS_CONFIG: Record<FighterApprovalStatus, {
  label: string;
  icon: string;
  color: string;
  bgColor: string;
  borderColor: string;
  description: string;
  canFight: boolean;
}> = {
  pending: {
    label: 'Pending Approval',
    icon: '⏳',
    color: 'text-amber-700',
    bgColor: 'bg-amber-100',
    borderColor: 'border-amber-300',
    description: 'Fighter registration submitted, waiting for KKF review',
    canFight: false,
  },
  approved: {
    label: 'Approved',
    icon: '✅',
    color: 'text-green-700',
    bgColor: 'bg-green-100',
    borderColor: 'border-green-300',
    description: 'Fighter approved by KKF and can compete',
    canFight: true,
  },
  rejected: {
    label: 'Rejected',
    icon: '❌',
    color: 'text-red-700',
    bgColor: 'bg-red-100',
    borderColor: 'border-red-300',
    description: 'Fighter registration rejected, needs revision',
    canFight: false,
  },
  revision: {
    label: 'Revision Required',
    icon: '🔄',
    color: 'text-blue-700',
    bgColor: 'bg-blue-100',
    borderColor: 'border-blue-300',
    description: 'Club needs to update fighter information',
    canFight: false,
  },
  suspended: {
    label: 'Suspended',
    icon: '🚫',
    color: 'text-gray-700',
    bgColor: 'bg-gray-100',
    borderColor: 'border-gray-300',
    description: 'Fighter temporarily suspended by KKF',
    canFight: false,
  },
};

// Fighter registration workflow
export const FIGHTER_REGISTRATION_WORKFLOW = {
  clubSubmits: {
    step: 1,
    actor: 'Club',
    action: 'Register fighter',
    nextStatus: 'pending',
    description: 'Club submits fighter registration with KYC and medical documents',
  },
  kkfReviews: {
    step: 2,
    actor: 'KKF Auditor',
    action: 'Review registration',
    possibleOutcomes: ['approved', 'rejected', 'revision'],
    description: 'KKF Auditor validates KYC, medical, and eligibility',
  },
  clubRevises: {
    step: 3,
    actor: 'Club',
    action: 'Update fighter information',
    nextStatus: 'pending',
    description: 'If rejected/revision needed, club updates and resubmits',
  },
  fighterActive: {
    step: 4,
    actor: 'System',
    action: 'Fighter can compete',
    status: 'approved',
    description: 'Fighter is eligible to be selected for matches',
  },
};

// Mock approval records
export const MOCK_APPROVAL_RECORDS: FighterApprovalRecord[] = [
  {
    id: 'apr1',
    fighterId: 'f1',
    fighterName: 'Sorn Seavmey',
    clubId: 'c1',
    clubName: 'Pradal Khmer Gym',
    status: 'approved',
    submittedDate: '2024-01-15',
    reviewedDate: '2024-01-16',
    reviewedBy: 'u2', // KKF Auditor
    comments: 'All documents verified. Fighter approved.',
    history: [
      {
        date: '2024-01-15',
        status: 'pending',
        actor: 'Sokhom Rin',
        actorRole: 'Club Manager',
        comments: 'Submitted fighter registration',
      },
      {
        date: '2024-01-16',
        status: 'approved',
        actor: 'Vibol Chan',
        actorRole: 'KKF Auditor',
        comments: 'All documents verified. Fighter approved.',
      },
    ],
  },
  {
    id: 'apr2',
    fighterId: 'f10',
    fighterName: 'New Fighter Pending',
    clubId: 'c1',
    clubName: 'Pradal Khmer Gym',
    status: 'pending',
    submittedDate: '2026-03-19',
    history: [
      {
        date: '2026-03-19',
        status: 'pending',
        actor: 'Sokhom Rin',
        actorRole: 'Club Manager',
        comments: 'Submitted new fighter registration',
      },
    ],
  },
  {
    id: 'apr3',
    fighterId: 'f11',
    fighterName: 'Rejected Fighter',
    clubId: 'c2',
    clubName: 'CAT Khmer Gym',
    status: 'rejected',
    submittedDate: '2026-03-18',
    reviewedDate: '2026-03-19',
    reviewedBy: 'u2',
    rejectionReason: 'Medical certificate expired',
    revisionRequired: ['Upload valid medical certificate (not expired)', 'Verify date of birth'],
    history: [
      {
        date: '2026-03-18',
        status: 'pending',
        actor: 'Kimsan Heng',
        actorRole: 'Club Manager',
        comments: 'Submitted fighter registration',
      },
      {
        date: '2026-03-19',
        status: 'rejected',
        actor: 'Vibol Chan',
        actorRole: 'KKF Auditor',
        comments: 'Medical certificate expired. Please upload a valid certificate.',
      },
    ],
  },
];

// Get pending approvals (for KKF Auditor)
export function getPendingApprovals(): FighterApprovalRecord[] {
  return MOCK_APPROVAL_RECORDS.filter(a => a.status === 'pending');
}

// Get approvals by club (for Club users)
export function getApprovalsByClub(clubId: string): FighterApprovalRecord[] {
  return MOCK_APPROVAL_RECORDS.filter(a => a.clubId === clubId);
}

// Get approval by fighter ID
export function getApprovalByFighter(fighterId: string): FighterApprovalRecord | undefined {
  return MOCK_APPROVAL_RECORDS.find(a => a.fighterId === fighterId);
}

// Check if fighter is approved
export function isFighterApproved(fighterId: string): boolean {
  const approval = getApprovalByFighter(fighterId);
  return approval?.status === 'approved';
}

// Add approval history entry
export function addApprovalHistory(
  approvalId: string,
  entry: ApprovalHistoryEntry
): void {
  const approval = MOCK_APPROVAL_RECORDS.find(a => a.id === approvalId);
  if (approval) {
    approval.history.push(entry);
  }
}
