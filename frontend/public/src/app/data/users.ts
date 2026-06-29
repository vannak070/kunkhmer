// User Management Data Structure - Updated with 5-Role System

export type UserRole = 'kkf_super_admin' | 'kkf_officer' | 'organizer' | 'club' | 'referee_judge';

export interface User {
  id: string;
  username: string;
  email: string;
  password: string; // In production, this would be hashed
  fullName: string;
  role: UserRole;
  avatar?: string;
  phone?: string;
  organization?: string; // Broadcast station, KKF chapter, Gym/Club name, etc.
  status: 'active' | 'inactive' | 'suspended';
  createdAt: string;
  lastLogin?: string;
  permissions: string[];
}

export const ROLE_PERMISSIONS: Record<UserRole, string[]> = {
  // 👑 1. KKF Super Admin - Full system control
  kkf_super_admin: [
    // Users
    'users.view',
    'users.create',
    'users.edit',
    'users.delete',
    'users.manage_roles',
    
    // Events
    'events.view',
    'events.create',
    'events.edit',
    'events.delete',
    'events.submit',
    'events.approve',
    'events.reject',
    'events.override_approval',
    'events.start',
    'events.close',
    
    // Fighters
    'fighters.view',
    'fighters.create',
    'fighters.edit',
    'fighters.delete',
    'fighters.verify_kyc',
    'fighters.verify_medical',
    'fighters.check_eligibility',
    
    // Matches
    'matches.view',
    'matches.create',
    'matches.edit',
    'matches.delete',
    'matches.approve',
    'matches.reject',
    'matches.override_approval',
    'matches.assign_to_event',
    
    // Federation Operations
    'federation.view',
    'federation.approve',  // Generic approval permission
    'federation.approve_event',
    'federation.reject_event',
    'federation.approve_match',
    'federation.reject_match',
    'federation.approve_club',
    'federation.reject_club',
    'federation.assign_officials',
    'federation.assign_judges',
    'federation.assign_referees',
    'federation.conduct_weighin',
    'federation.start_match',
    'federation.enter_results',
    'federation.complete_match',
    'federation.override_results',
    
    // Sponsors & Broadcast
    'sponsors.view',
    'sponsors.create',
    'sponsors.edit',
    'sponsors.delete',
    'broadcast.view',
    'broadcast.create',
    'broadcast.edit',
    'broadcast.delete',
    
    // Clubs
    'clubs.view',
    'clubs.create',
    'clubs.edit',
    'clubs.delete',
    'clubs.approve',
    'clubs.reject',
    
    // System
    'system.configure_rules',
    'system.access_audit_logs',
    'system.generate_reports',
    'system.manage_settings',
    'system.full_access',
  ],

  // ⚙️ 2. KKF Officer - Execution Role (Operations after approval)
  kkf_officer: [
    // View Access
    'events.view',
    'fighters.view',
    'matches.view',
    'clubs.view',
    'sponsors.view',
    'broadcast.view',
    'federation.view',
    
    // Assign Officials
    'federation.assign_officials',
    'federation.assign_judges',
    'federation.assign_referees',
    
    // Weigh-In Management
    'federation.conduct_weighin',
    'matches.verify_weight',
    'matches.confirm_readiness',
    
    // Match Operations
    'federation.start_match',
    'matches.monitor',
    'matches.manage_schedule',
    
    // Results Management
    'federation.enter_results',
    'federation.complete_match',
    'matches.upload_attachments',
    'matches.update_score',
    'matches.declare_winner',
    
    // Event Operations
    'events.start',
    'events.monitor',
    
    // RESTRICTIONS: Cannot approve/reject
    // ❌ Cannot approve/reject events
    // ❌ Cannot approve/reject matches
    // ❌ Cannot approve/reject clubs
  ],

  // 🎯 3. Organizer / Promoter - Event and match creator
  organizer: [
    // View Access
    'events.view',
    'fighters.view',
    'matches.view',
    'clubs.view',
    'sponsors.view',
    'broadcast.view',
    
    // Event Management
    'events.create',
    'events.edit_own',
    'events.delete_own',
    'events.submit',
    'events.close',
    'events.start',
    
    // Match Management
    'matches.create',
    'matches.edit_own',
    'matches.delete_own',
    'matches.propose_to_club',
    'matches.assign_to_event',
    'matches.assign_fighters',
    
    // Federation Submission
    'federation.submit', // Submit batches to KKF for approval
    
    // Sponsors
    'sponsors.view',
    'sponsors.create',
    'sponsors.edit',
    'sponsors.assign',
    
    // Broadcast
    'broadcast.view',
    'broadcast.create',
    'broadcast.edit',
    'broadcast.assign',
    
    // RESTRICTIONS: Cannot approve anything
    // ❌ Cannot approve events
    // ❌ Cannot approve matches
    // ❌ Cannot approve clubs
    // ❌ Cannot enter results
  ],

  // 🏢 4. Club / Gym - Manage fighters
  club: [
    // View Access
    'events.view',
    'matches.view',
    'clubs.view_own', // Changed: Can only view own club profile
    'clubs.edit_own',
    
    // Fighter Management (Primary Role)
    'fighters.view',
    'fighters.create', // Creates fighter with "pending" approval status
    'fighters.edit_own',
    'fighters.delete_own',
    'fighters.register_kkf', // Requires KKF approval
    'fighters.register_foreign', // Requires KKF approval
    'fighters.update_profile',
    'fighters.upload_documents',
    'fighters.manage_kyc',
    'fighters.manage_medical',
    'fighters.view_fight_history',
    'fighters.update_status', // NEW: Can update fighter status
    'fighters.view_approval_status', // NEW: View approval status
    
    // Fighter Validation (Before Match)
    'fighters.check_availability',
    'fighters.verify_fitness',
    'fighters.confirm_agreement',
    'fighters.validate_medical',
    'fighters.check_rest_period',
    'fighters.view_schedule',
    
    // Fighter Participation Control
    'fighters.approve_participation',
    'fighters.reject_participation',
    'fighters.track_upcoming_fights',
    'fighters.track_rest_period',
    'fighters.track_injuries',
    'fighters.mark_unavailable',
    'fighters.set_status', // Can change fighter status (available, resting, injured, etc.)
    
    // Match Participation (VERY IMPORTANT)
    'matches.view_proposals',
    'matches.confirm_fighter',
    'matches.reject_fighter',
    'matches.respond_to_proposal',
    'matches.accept_match',
    'matches.reject_match',
    'matches.view_fighter_schedule',
    
    // Fighter Ownership
    'fighters.claim_ownership',
    'fighters.verify_ownership',
    
    // Championships & Prizes
    'championships.view', // NEW: View championships/belts/trophies
    'championships.view_event_prizes', // NEW: See what prizes are available
    
    // Notifications
    'notifications.receive_match_proposal',
    'notifications.receive_fighter_selected',
    'notifications.receive_event_approved',
    'notifications.receive_approval_update', // NEW: Get notified about approval status
    
    // RESTRICTIONS
    // ❌ Cannot create events
    // ❌ Cannot approve matches
    // ❌ Cannot edit other clubs' fighters
    // ❌ Cannot assign judges/referees
    // ❌ Cannot update match results
    // ❌ Cannot create new clubs (only view own club)
    // ❌ Cannot approve fighters (only KKF can approve)
  ],

  // 🧑‍⚖️ 5. Referee / Judge - Official match roles
  referee_judge: [
    // View Access
    'matches.view',
    'matches.view_assigned',
    'events.view',
    'events.view_schedule',
    'fighters.view',
    
    // Match Operations (Limited)
    'matches.view_details',
    'matches.submit_scoring',
    'matches.view_assignments',
    
    // Optional: Digital Scoring
    'scoring.submit_round_score',
    'scoring.view_scorecard',
    
    // RESTRICTIONS
    // ❌ Cannot create matches
    // ❌ Cannot approve anything
    // ❌ Cannot enter final results (only scoring if enabled)
    // ❌ Very limited access - view only + scoring
  ],
};

export const ROLE_LABELS: Record<UserRole, { label: string; color: string; description: string }> = {
  kkf_super_admin: {
    label: 'KKF Super Admin',
    color: 'bg-purple-100 text-purple-700 border-purple-300',
    description: '👑 Full system control under Kun Khmer Federation - Can override approvals, manage users, configure rules',
  },
  kkf_officer: {
    label: 'KKF Officer (Execution)',
    color: 'bg-red-100 text-[#C8102E] border-red-300',
    description: '⚙️ Assign judges/referees, manage weigh-ins, enter results - Cannot approve/reject events or matches',
  },
  organizer: {
    label: 'Organizer / Promoter',
    color: 'bg-blue-100 text-[#0A3D91] border-blue-300',
    description: '🎯 Create events, build fight cards, manage broadcasts and sponsors - Cannot approve anything',
  },
  club: {
    label: 'Club / Gym',
    color: 'bg-amber-100 text-amber-700 border-amber-300',
    description: '🏢 Register fighters (KKF & Foreign), confirm match participation - Cannot create events',
  },
  referee_judge: {
    label: 'Referee / Judge',
    color: 'bg-green-100 text-green-700 border-green-300',
    description: '🧑‍⚖️ View assigned matches, submit scoring (if enabled), view event schedule - Limited access',
  },
};

// Mock Users Database - Updated with new roles
export const MOCK_USERS: User[] = [
  // KKF Super Admin
  {
    id: 'u1',
    username: 'superadmin',
    email: 'superadmin@kkf.gov.kh',
    password: 'admin123',
    fullName: 'System Administrator',
    role: 'kkf_super_admin',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=150',
    phone: '+855 12 345 678',
    organization: 'Kun Khmer Federation HQ',
    status: 'active',
    createdAt: '2024-01-01',
    lastLogin: '2026-03-20T09:30:00',
    permissions: ROLE_PERMISSIONS.kkf_super_admin,
  },
  
  // KKF Officer (Execution)
  {
    id: 'u3',
    username: 'officer1',
    email: 'officer@kkf.gov.kh',
    password: 'officer123',
    fullName: 'Sreymom Keo',
    role: 'kkf_officer',
    avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&q=80&w=150',
    phone: '+855 16 789 123',
    organization: 'KKF Operations Division',
    status: 'active',
    createdAt: '2024-02-28',
    lastLogin: '2026-03-19T17:00:00',
    permissions: ROLE_PERMISSIONS.kkf_officer,
  },
  
  // Organizer / Promoter
  {
    id: 'u4',
    username: 'organizer1',
    email: 'organizer@kunkhmer.com',
    password: 'organizer123',
    fullName: 'Dara Pov',
    role: 'organizer',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=150',
    phone: '+855 89 123 456',
    organization: 'Kun Khmer Events Co.',
    status: 'active',
    createdAt: '2024-03-10',
    lastLogin: '2026-03-19T16:45:00',
    permissions: ROLE_PERMISSIONS.organizer,
  },

  {
    id: 'u5',
    username: 'organizer2',
    email: 'promoter@bayon.tv',
    password: 'bayon123',
    fullName: 'Sophea Meas',
    role: 'organizer',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=150',
    phone: '+855 70 234 567',
    organization: 'Bayon TV',
    status: 'active',
    createdAt: '2024-04-05',
    lastLogin: '2026-03-18T11:30:00',
    permissions: ROLE_PERMISSIONS.organizer,
  },
  
  // Club / Gym
  {
    id: 'u6',
    username: 'club1',
    email: 'pradal@pradalkhmergym.com',
    password: 'club123',
    fullName: 'Sokhom Rin',
    role: 'club',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=150',
    phone: '+855 23 456 789',
    organization: 'Pradal Khmer Gym',
    status: 'active',
    createdAt: '2024-02-15',
    lastLogin: '2026-03-19T14:20:00',
    permissions: ROLE_PERMISSIONS.club,
  },

  {
    id: 'u7',
    username: 'club2',
    email: 'info@catkhmergym.com',
    password: 'club123',
    fullName: 'Kimsan Heng',
    role: 'club',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=150',
    phone: '+855 92 555 888',
    organization: 'CAT Khmer Gym',
    status: 'active',
    createdAt: '2024-05-12',
    lastLogin: '2026-03-19T10:00:00',
    permissions: ROLE_PERMISSIONS.club,
  },

  // Referee / Judge
  {
    id: 'u8',
    username: 'referee1',
    email: 'referee@kkf.gov.kh',
    password: 'referee123',
    fullName: 'Bunthoeun Sok',
    role: 'referee_judge',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=150',
    phone: '+855 78 456 123',
    organization: 'KKF Certified Referee',
    status: 'active',
    createdAt: '2024-06-01',
    lastLogin: '2026-03-19T18:00:00',
    permissions: ROLE_PERMISSIONS.referee_judge,
  },

  {
    id: 'u9',
    username: 'judge1',
    email: 'judge@kkf.gov.kh',
    password: 'judge123',
    fullName: 'Chanthy Prak',
    role: 'referee_judge',
    avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&q=80&w=150',
    phone: '+855 97 321 654',
    organization: 'KKF Certified Judge',
    status: 'active',
    createdAt: '2024-06-15',
    lastLogin: '2026-03-20T07:30:00',
    permissions: ROLE_PERMISSIONS.referee_judge,
  },
];

// Current logged-in user (mock authentication)
export let CURRENT_USER: User | null = MOCK_USERS[0]; // Default: superadmin

export const loginUser = (username: string, password: string): User | null => {
  const user = MOCK_USERS.find(u => u.username === username && u.password === password && u.status === 'active');
  if (user) {
    CURRENT_USER = user;
    user.lastLogin = new Date().toISOString();
    return user;
  }
  return null;
};

export const logoutUser = () => {
  CURRENT_USER = null;
};

export const getCurrentUser = (): User | null => {
  return CURRENT_USER;
};

export const hasPermission = (permission: string): boolean => {
  if (!CURRENT_USER) return false;
  return CURRENT_USER.permissions.includes(permission);
};

export const canAccessRoute = (route: string): boolean => {
  if (!CURRENT_USER) return false;
  
  const routePermissionMap: Record<string, string> = {
    '/fighters': 'fighters.view',
    '/fighters/kunkhmer/new': 'fighters.create',
    '/fighters/foreigner/new': 'fighters.create',
    '/events': 'events.view',
    '/events/new': 'events.create',
    '/matches': 'matches.view',
    '/matches/new': 'matches.create',
    '/federation': 'federation.view',
    '/users': 'users.view',
    '/sponsors': 'sponsors.view',
    '/broadcast': 'broadcast.view',
    '/clubs': 'clubs.view',
  };
  
  const requiredPermission = routePermissionMap[route];
  if (!requiredPermission) return true; // Public route
  
  return hasPermission(requiredPermission);
};

// Helper: Get role capabilities summary
export function getRoleCapabilities(role: UserRole): {
  canApprove: boolean;
  canExecute: boolean;
  canCreate: boolean;
  canManageFighters: boolean;
  canViewOnly: boolean;
} {
  return {
    canApprove: ['kkf_super_admin'].includes(role),
    canExecute: ['kkf_super_admin', 'kkf_officer'].includes(role),
    canCreate: ['kkf_super_admin', 'organizer', 'club'].includes(role),
    canManageFighters: ['kkf_super_admin', 'club'].includes(role),
    canViewOnly: role === 'referee_judge',
  };
}