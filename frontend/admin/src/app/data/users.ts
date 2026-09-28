// User Management Data Structure - Updated with 2-Role System

// 'official' = Referee or Judge accounts; 'none' = a role the admin doesn't know (no access).
export type UserRole = 'kkf_super_admin' | 'kkf_officer' | 'organizer' | 'kkf_manager' | 'club' | 'official' | 'none';

export interface User {
  id: string;
  username: string;
  email: string;
  password: string; // In production, this would be hashed
  fullName: string;
  role: UserRole; // Primary role (deprecated, kept for backward compatibility)
  roles: UserRole[]; // Multiple roles per user  avatar?: string;
  phone?: string;
  organization?: string; // Broadcast station, KKF chapter, Gym/Club name, etc.
  status: 'active' | 'inactive' | 'suspended';
  createdAt: string;
  lastLogin?: string;
  permissions: string[];
  clubId?: string;
}

export const ROLE_PERMISSIONS: Record<UserRole, string[]> = {
  // 👑 1. KKF Super Admin - Full system control & approvals
  kkf_super_admin: [
    'hub.review', // KUNKHMER HUB answers, feedback and spend
    'knowledge.manage', // KUNKHMER HUB knowledge base (publishing: Super Admin only)
    // System (e.g. deleting a championship title)
    'system.manage_settings',
    // Phase 4: menu areas by role
    'dashboard.view',
    'officials.manage', // Officials page: add/edit referees and judges
    'officials.assign', // Assign referees and judges to bouts (API: KKF staff only)
    'content.manage', // Media (news, video)
    'partners.manage', // Broadcasters and sponsors
    'clubs.manage', // Add / edit clubs (API: KKF staff only)
    'settings.view', // System Settings
    'settings.manage', // Edit settings lists (API: Super Admin only)
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
    'fighters.approve',
    'fighters.reject',
    'fighters.register_kkf',
    'fighters.register_foreign',
    
    // Matches
    'matches.view',
    'matches.view_proposals', // Match Proposals: answer for clubs, change declined fighters
    'matches.create',
    'matches.edit',
    'matches.delete',
    'matches.approve',
    'matches.reject',
    'matches.override_approval',
    'matches.assign_to_event',
    
    // Federation Operations
    'federation.view',
    'federation.approve',
    'federation.approve_event',
    'federation.reject_event',
    'federation.approve_match',
    'federation.reject_match',
    'federation.approve_club',
    'federation.reject_club',
    'federation.approve_fighter',
    'federation.reject_fighter',
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
    'sponsors.approve',
    'sponsors.reject',
    'broadcast.view',
    'broadcast.create',
    'broadcast.edit',
    'broadcast.delete',
    'broadcast.approve',
    'broadcast.reject',
    
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
    'system.manage_permissions',
    'system.override_all',
  ],

  // ⚙️ 2. KKF Officer - Execution & Operations (All day-to-day tasks)
  kkf_officer: [
    'hub.review', // KUNKHMER HUB answers, feedback and spend
    'knowledge.manage', // KUNKHMER HUB knowledge base (publishing: Super Admin only)
    // Phase 4: menu areas by role
    'dashboard.view',
    'officials.manage', // Officials page: add/edit referees and judges
    'officials.assign', // Assign referees and judges to bouts (API: KKF staff only)
    'content.manage', // Media (news, video)
    'partners.manage', // Broadcasters and sponsors
    'clubs.manage', // Add / edit clubs (API: KKF staff only)
    'settings.view', // System Settings
    // Users (View only)
      
    // Events (Full CRUD, no approval)
    'events.view',
    'events.create',
    'events.edit',
    'events.delete',
    'events.submit', // Submit for Super Admin approval
    'events.start', // Can start approved events
    'events.close', // Can close completed events
    'events.manage_details',
    'events.manage_schedule',
    
    // Fighters (Full CRUD, no approval)
    'fighters.view',
    'fighters.create',
    'fighters.edit',
    'fighters.delete',
    'fighters.register_kkf',
    'fighters.register_foreign',
    'fighters.verify_kyc',
    'fighters.verify_medical',
    'fighters.check_eligibility',
    'fighters.update_profile',
    'fighters.upload_documents',
    'fighters.manage_kyc',
    'fighters.manage_medical',
    'fighters.view_fight_history',
    'fighters.update_status',
    'fighters.check_availability',
    'fighters.verify_fitness',
    'fighters.validate_medical',
    'fighters.check_rest_period',
    'fighters.view_schedule',
    'fighters.track_upcoming_fights',
    'fighters.track_rest_period',
    'fighters.track_injuries',
    'fighters.mark_unavailable',
    'fighters.set_status',
    
    // Matches (Full CRUD, no approval)
    'matches.view',
    'matches.view_proposals', // Match Proposals: answer for clubs, change declined fighters
    'matches.create',
    'matches.edit',
    'matches.delete',
    'matches.submit', // Submit for Super Admin approval
    'matches.assign_to_event',
    'matches.view_details',
    'matches.manage_card',
    'matches.build_fight_card',
    
    // Federation Operations (Full execution)
    'federation.view',
    'federation.assign_officials',
    'federation.assign_judges',
    'federation.assign_referees',
    'federation.conduct_weighin',
    'federation.start_match',
    'federation.enter_results',
    'federation.complete_match',
    'federation.manage_operations',
    
    // Sponsors & Broadcast (Full CRUD, no approval)
    'sponsors.view',
    'sponsors.create',
    'sponsors.edit',
    'sponsors.delete',
    'sponsors.manage',
    'broadcast.view',
    'broadcast.create',
    'broadcast.edit',
    'broadcast.delete',
    'broadcast.manage',
    
    // Clubs (Full CRUD, no approval)
    'clubs.view',
    'clubs.create',
    'clubs.edit',
    'clubs.delete',
    'clubs.manage',
    'clubs.view_fighters',
    'clubs.manage_details',
    
    // Championships
    'championships.view',
    'championships.create',
    'championships.edit',
    'championships.delete',
    'championships.manage',
    'championships.assign_to_event',
    
    // Notifications
    'notifications.view',
    'notifications.manage',
    
    // RESTRICTIONS (What KKF Officer CANNOT do)
    // ❌ Cannot approve/reject events (only Super Admin)
    // ❌ Cannot approve/reject matches (only Super Admin)
    // ❌ Cannot approve/reject clubs (only Super Admin)
    // ❌ Cannot approve/reject fighters (only Super Admin)
    // ❌ Cannot manage users (only Super Admin)
    // ❌ Cannot override approvals (only Super Admin)
    // ❌ Cannot access system configuration (only Super Admin)
    
    // WORKFLOW:
    // 1. KKF Officer creates content (events, fighters, matches, etc.)
    // 2. KKF Officer submits for approval
    // 3. KKF Super Admin approves/rejects
    // 4. KKF Officer executes approved items (assign officials, weigh-ins, results)
  ],

  // 📝 3. Organizer - Creates matches and events, requests approval
  organizer: [
    'dashboard.view',
    'events.view',
    'events.create',
    'events.edit',
    'events.submit',
    'matches.view',
    'matches.view_proposals', // Match Proposals: see club answers, change declined fighters
    'matches.create',
    'matches.edit',
    'matches.submit',
    'fighters.view',
    'sponsors.view',
    'broadcast.view',
    'clubs.view',
  ],

  // 👔 4. KKF Manager - Approves matches and events
  kkf_manager: [
    'dashboard.view',
    'events.view',
    'events.approve',
    'events.reject',
    'matches.view',
    'matches.approve',
    'matches.reject',
    'fighters.view',
    'users.view',
    'federation.view',
    'federation.approve_match',
    'federation.reject_match',
  ],
  
  // 🥊 5. Club - Views and accepts matches
  club: [
    'dashboard.view',
    'events.view',
    'matches.view',
    'matches.view_proposals', // Match Proposals: accept or decline bouts for their fighters
    'matches.accept',
    'matches.reject',
    'fighters.view',
    // Register and edit their own club's fighters (KKF verifies them).
    'fighters.create',
    'fighters.edit',
    'clubs.view',
  ],
  // Referees and judges: only their own assigned bouts ("My bouts").
  official: [
    'bouts.view_own',
  ],
  none: [],
};

export const ROLE_LABELS: Record<UserRole, { label: string; color: string; description: string }> = {
  kkf_super_admin: {
    label: 'KKF Super Admin',
    color: 'bg-purple-100 text-purple-700 border-purple-300',
    description: '👑 Full system control - Approves/rejects all submissions, manages users, overrides decisions, configures system',
  },
  kkf_officer: {
    label: 'KKF Officer',
    color: 'bg-red-100 text-[#C8102E] border-red-300',
    description: '⚙️ Executes all operations - Create/manage events, fighters, matches, clubs, sponsors, broadcasts, assign officials, weigh-ins, enter results',
  },
  organizer: {
    label: 'Event Organizer',
    color: 'bg-blue-100 text-[#0A3D91] border-blue-300',
    description: '📝 Creates events and matches, submits them for KKF Manager approval.',
  },
  kkf_manager: {
    label: 'KKF Manager',
    color: 'bg-amber-100 text-amber-700 border-amber-300',
    description: '👔 Reviews and approves events and matches submitted by Organizers.',
  },
  club: {
    label: 'Club / Gym',
    color: 'bg-emerald-100 text-emerald-700 border-emerald-300',
    description: '🥊 Manages fighters, reviews and accepts/rejects match proposals.',
  },
  official: {
    label: 'Referee / Judge',
    color: 'bg-sky-100 text-sky-700 border-sky-300',
    description: 'Sees the bouts KKF assigned them (My bouts).',
  },
  none: {
    label: 'No access',
    color: 'bg-slate-100 text-slate-600 border-slate-300',
    description: 'A role the management system does not recognise.',
  },
};

// Mock Users Database - Updated with cleaner credentials v3.1
export const MOCK_USERS: User[] = [
  // 👑 KKF Super Admin
  {
    id: 'u1',
    username: 'admin',
    email: 'admin@kkf.gov.kh',
    password: 'admin123',
    fullName: 'System Administrator',
    role: 'kkf_super_admin',
    roles: ['kkf_super_admin'],
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=150',
    phone: '+855 12 345 678',
    organization: 'Kun Khmer Federation HQ',
    status: 'active',
    createdAt: '2024-01-01',
    lastLogin: '2026-03-20T09:30:00',
    permissions: ROLE_PERMISSIONS.kkf_super_admin,
  },

  // ⚙️ KKF Officer
  {
    id: 'u3',
    username: 'officer',
    email: 'officer@kkf.gov.kh',
    password: 'officer123',
    fullName: 'Sreymom Keo',
    role: 'kkf_officer',
    roles: ['kkf_officer'],
    avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&q=80&w=150',
    phone: '+855 16 789 123',
    organization: 'KKF Operations Division',
    status: 'active',
    createdAt: '2024-02-28',
    lastLogin: '2026-03-19T17:00:00',
    permissions: ROLE_PERMISSIONS.kkf_officer,
  },

  // 📋 Event Organizer
  {
    id: 'u4',
    username: 'organizer',
    email: 'events@townfullhdtv.com',
    password: 'org123',
    fullName: 'Town Full HDTV',
    role: 'organizer',
    roles: ['organizer'],
    avatar: 'https://images.unsplash.com/photo-1557804506-669a67965ba0?auto=format&fit=crop&q=80&w=150',
    phone: '+855 12 111 222',
    organization: 'Town Full HDTV',
    status: 'active',
    createdAt: '2024-03-01',
    lastLogin: '2026-03-20T08:00:00',
    permissions: ROLE_PERMISSIONS.organizer,
  },

  // 👔 KKF Manager
  {
    id: 'u5',
    username: 'manager',
    email: 'manager@kkf.gov.kh',
    password: 'manager123',
    fullName: 'Chey Rithy',
    role: 'kkf_manager',
    roles: ['kkf_manager'],
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=150',
    phone: '+855 12 333 444',
    organization: 'KKF Approvals',
    status: 'active',
    createdAt: '2024-01-15',
    lastLogin: '2026-03-20T09:00:00',
    permissions: ROLE_PERMISSIONS.kkf_manager,
  },

  // 🥊 Club / Gym
  {
    id: 'u6',
    username: 'club',
    email: 'club@gym.com',
    password: 'club123',
    fullName: 'Kiry Sak',
    role: 'club',
    roles: ['club'],
    avatar: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&q=80&w=150',
    phone: '+855 12 555 666',
    organization: 'Kiry Sokun Gym',
    status: 'active',
    createdAt: '2024-01-20',
    lastLogin: '2026-03-20T10:00:00',
    permissions: ROLE_PERMISSIONS.club,
  },
];

// Current logged-in user (dynamic from localStorage)
export const getCurrentUser = (): User | null => {
  const userStr = localStorage.getItem("user");
  if (!userStr) return null;
  
  try {
    const dbUser = JSON.parse(userStr);
    
    // Map database role string to frontend UserRole type
    let frontendRole: UserRole = 'none';
    if (dbUser.role === 'Super Admin') {
      frontendRole = 'kkf_super_admin';
    } else if (dbUser.role === 'KKF Officer') {
      frontendRole = 'kkf_officer';
    } else if (dbUser.role === 'Organizer') {
      frontendRole = 'organizer';
    } else if (dbUser.role === 'Club/Gym') {
      frontendRole = 'club';
    } else if (dbUser.role === 'Referee' || dbUser.role === 'Judge') {
      frontendRole = 'official';
    }

    return {
      id: dbUser.id,
      username: dbUser.username,
      email: dbUser.email,
      password: "",
      fullName: dbUser.fullName,
      role: frontendRole,
      roles: [frontendRole],
      phone: dbUser.phone || "",
      organization: dbUser.organization || "",
      status: dbUser.status === 'Active' ? 'active' : 'inactive',
      createdAt: dbUser.createdAt || new Date().toISOString(),
      lastLogin: dbUser.lastLogin,
      permissions: ROLE_PERMISSIONS[frontendRole] || [],
      clubId: dbUser.clubId || dbUser.club_id || ""
    };
  } catch (err) {
    return null;
  }
};

export const logoutUser = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
};

export const hasPermission = (permission: string): boolean => {
  const user = getCurrentUser();
  if (!user) return false;
  return user.permissions.includes(permission);
};

export const canAccessRoute = (route: string): boolean => {
  if (!getCurrentUser()) return false;
  
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
  canManageAll: boolean;
  isOperational: boolean;
} {
  return {
    canApprove: role === 'kkf_super_admin' || role === 'kkf_manager',
    canExecute: role !== 'club', 
    canCreate: role === 'kkf_super_admin' || role === 'kkf_officer' || role === 'organizer',
    canManageAll: role === 'kkf_super_admin',
    isOperational: role === 'kkf_officer' || role === 'organizer',
  };
}