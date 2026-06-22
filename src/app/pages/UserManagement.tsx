import { useState, useEffect } from "react";
import { useNavigate, useParams, useLocation } from "react-router";
import {
  Users,
  UserPlus,
  Edit2,
  Trash2,
  Shield,
  Lock,
  Unlock,
  Search,
  Filter,
  CheckCircle,
  XCircle,
  AlertCircle,
  Mail,
  Phone,
  Building2,
  Clock,
  X,
  Award,
  UserCheck,
  Plus,
  User,
  MapPin,
  Calendar,
  CreditCard,
  FileText,
  Heart,
  Upload,
  Image as ImageIcon,
  Briefcase,
  Eye,
  Star,
  CalendarClock,
  ArrowLeft,
  ChevronDown,
} from "lucide-react";
import { MOCK_USERS, ROLE_LABELS, ROLE_PERMISSIONS, type User as UserType, type UserRole } from "../data/users";
import { type Official } from "../data/officials";
import { usePermissions } from "../hooks/usePermissions";
import { toast } from "sonner";
import { clsx } from "clsx";
import { getAllOfficials, addJudge, addReferee } from "../utils/officialsStore";

type TabType = "users" | "roles" | "officers";
type OfficialRole = "Referee" | "Judge";

const PERMISSION_GROUPS = [
  {
    title: "👤 Users Management",
    permissions: [
      { key: "users.view", label: "View Users" },
      { key: "users.create", label: "Create Users" },
      { key: "users.edit", label: "Edit Users" },
      { key: "users.delete", label: "Delete Users" },
      { key: "users.manage_roles", label: "Manage Roles & Permissions" },
    ]
  },
  {
    title: "📅 Events Management",
    permissions: [
      { key: "events.view", label: "View Events" },
      { key: "events.create", label: "Create Events" },
      { key: "events.edit", label: "Edit Events" },
      { key: "events.delete", label: "Delete Events" },
      { key: "events.submit", label: "Submit Events for Approval" },
      { key: "events.approve", label: "Approve Events" },
      { key: "events.reject", label: "Reject Events" },
      { key: "events.start", label: "Start Events" },
      { key: "events.close", label: "Close/Complete Events" },
    ]
  },
  {
    title: "🥊 Fighters Profile",
    permissions: [
      { key: "fighters.view", label: "View Fighters" },
      { key: "fighters.create", label: "Register Fighters" },
      { key: "fighters.edit", label: "Edit Fighter Profile" },
      { key: "fighters.delete", label: "Delete Fighter" },
      { key: "fighters.verify_kyc", label: "Verify Fighter KYC Documents" },
      { key: "fighters.verify_medical", label: "Verify Fighter Medical Clearances" },
      { key: "fighters.approve", label: "Approve Fighter Application" },
      { key: "fighters.reject", label: "Reject Fighter Application" },
    ]
  },
  {
    title: "⚔️ Matchmaking & Fight Cards",
    permissions: [
      { key: "matches.view", label: "View Matches" },
      { key: "matches.create", label: "Create Matches" },
      { key: "matches.edit", label: "Edit Match Details" },
      { key: "matches.delete", label: "Delete Matches" },
      { key: "matches.approve", label: "Approve Match Cards" },
      { key: "matches.reject", label: "Reject Match Cards" },
      { key: "matches.assign_to_event", label: "Assign Matches to Event Card" },
    ]
  },
  {
    title: "🛡️ Federation Operations",
    permissions: [
      { key: "federation.view", label: "Access Federation Dashboard" },
      { key: "federation.assign_officials", label: "Assign Referees & Judges" },
      { key: "federation.conduct_weighin", label: "Conduct Official Weigh-ins" },
      { key: "federation.start_match", label: "Signal Live Match Start" },
      { key: "federation.enter_results", label: "Enter Official Fight Results" },
      { key: "federation.complete_match", label: "Confirm Match Completion" },
    ]
  },
  {
    title: "🏟️ Clubs & Gyms",
    permissions: [
      { key: "clubs.view", label: "View Clubs" },
      { key: "clubs.create", label: "Register New Gym" },
      { key: "clubs.edit", label: "Edit Gym Details" },
      { key: "clubs.delete", label: "Remove Gym" },
      { key: "clubs.approve", label: "Approve Gym Membership" },
      { key: "clubs.reject", label: "Reject Gym Membership" },
    ]
  },
  {
    title: "📢 Sponsors & Broadcasting",
    permissions: [
      { key: "sponsors.view", label: "View Sponsors" },
      { key: "sponsors.create", label: "Create Sponsor Profile" },
      { key: "sponsors.edit", label: "Edit Sponsor Profile" },
      { key: "sponsors.delete", label: "Remove Sponsor" },
      { key: "broadcast.view", label: "View Broadcast Partners" },
      { key: "broadcast.create", label: "Register Broadcast Partner" },
      { key: "broadcast.edit", label: "Edit Broadcast Partner" },
      { key: "broadcast.delete", label: "Remove Broadcast Partner" },
    ]
  },
  {
    title: "⚙️ System Configuration",
    permissions: [
      { key: "system.configure_rules", label: "Configure Federation Rules" },
      { key: "system.access_audit_logs", label: "Access System Audit Logs" },
      { key: "system.manage_permissions", label: "Global Permissions Management" },
      { key: "system.override_all", label: "Super Admin Global Override" },
    ]
  }
];

export function UserManagement() {
  const permissions = usePermissions();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<TabType>("users");
  
  // Users state with localStorage
  const [users, setUsers] = useState<UserType[]>(() => {
    const saved = localStorage.getItem("kkf_users_list");
    return saved ? JSON.parse(saved) : MOCK_USERS;
  });

  // Dynamic Roles configuration
  const [dynamicRoles, setDynamicRoles] = useState<Record<string, { label: string; color: string; description: string }>>(() => {
    const saved = localStorage.getItem("kkf_dynamic_roles");
    return saved ? JSON.parse(saved) : ROLE_LABELS;
  });

  const [rolePermissionsState, setRolePermissionsState] = useState<Record<string, string[]>>(() => {
    const saved = localStorage.getItem("kkf_role_permissions_state");
    return saved ? JSON.parse(saved) : { ...ROLE_PERMISSIONS };
  });

  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState<string | "all">("all");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "inactive" | "suspended">("all");
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserType | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showDetailDrawer, setShowDetailDrawer] = useState(false);
  const [selectedDrawerUser, setSelectedDrawerUser] = useState<UserType | null>(null);
  const [selectedRole, setSelectedRole] = useState<string>("kkf_officer");

  // Routing flags for sub-routes
  const { userId } = useParams();
  const location = useLocation();
  const isCreatePage = location.pathname.endsWith("/user-management/new");
  const isEditPage = !!userId && location.pathname.endsWith("/edit");
  const isDetailPage = !!userId && !isEditPage;

  const [lastPath, setLastPath] = useState("");

  useEffect(() => {
    if (isCreatePage && location.pathname !== lastPath) {
      const defaultRole = roleFilter !== "all" ? roleFilter : "kkf_officer";
      setFormData({
        username: "",
        email: "",
        password: "",
        fullName: "",
        role: defaultRole as any,
        phone: "",
        organization: "",
        status: "active",
        permissions: [...(rolePermissionsState[defaultRole] || [])],
      });
      setLastPath(location.pathname);
    } else if (isEditPage && location.pathname !== lastPath) {
      const foundUser = users.find(u => u.id === userId);
      if (foundUser) {
        setSelectedUser(foundUser);
        setFormData({
          username: foundUser.username,
          email: foundUser.email,
          password: foundUser.password,
          fullName: foundUser.fullName,
          role: foundUser.role,
          phone: foundUser.phone || "",
          organization: foundUser.organization || "",
          status: foundUser.status,
          permissions: foundUser.permissions ? [...foundUser.permissions] : [...(rolePermissionsState[foundUser.role] || [])],
        });
      }
      setLastPath(location.pathname);
    } else if (isDetailPage && location.pathname !== lastPath) {
      const foundUser = users.find(u => u.id === userId);
      if (foundUser) {
        setSelectedDrawerUser(foundUser);
      }
      setLastPath(location.pathname);
    }
  }, [location.pathname, userId, isCreatePage, isEditPage, isDetailPage, users, roleFilter, rolePermissionsState, lastPath]);

  // Custom Role Form state
  const [showAddRoleModal, setShowAddRoleModal] = useState(false);
  const [newRoleData, setNewRoleData] = useState({ key: "", label: "", description: "", copyTemplate: "kkf_officer" });

  // Quick Add User in Roles tab form state
  const [quickAddData, setQuickAddData] = useState({
    fullName: "",
    username: "",
    email: "",
    password: "",
    organization: "",
  });

  // Local storage sync
  useEffect(() => {
    localStorage.setItem("kkf_users_list", JSON.stringify(users));
  }, [users]);

  const saveRoles = (newRoles: typeof dynamicRoles) => {
    setDynamicRoles(newRoles);
    localStorage.setItem("kkf_dynamic_roles", JSON.stringify(newRoles));
  };

  useEffect(() => {
    localStorage.setItem("kkf_role_permissions_state", JSON.stringify(rolePermissionsState));
  }, [rolePermissionsState]);

  // Officer filters
  const [officerSearch, setOfficerSearch] = useState("");
  const [officerRoleFilter, setOfficerRoleFilter] = useState<"all" | "Referee" | "Judge">("all");
  const [officerStatusFilter, setOfficerStatusFilter] = useState<"all" | "Available" | "Busy">("all");

  // Officer detail modal
  const [showOfficerDetailModal, setShowOfficerDetailModal] = useState(false);
  const [selectedOfficer, setSelectedOfficer] = useState<Official | null>(null);

  // Officer form state
  const [showAddOfficerModal, setShowAddOfficerModal] = useState(false);
  const [officerFormSection, setOfficerFormSection] = useState<"personal" | "contact" | "identification" | "professional" | "emergency">("personal");
  const [officerFormData, setOfficerFormData] = useState({
    // Personal Information
    firstName: "",
    middleName: "",
    lastName: "",
    dateOfBirth: "",
    gender: "Male",
    nationality: "Cambodian",
    placeOfBirth: "",
    bloodType: "O+",

    // Contact Information
    email: "",
    phone: "",
    alternativePhone: "",
    currentAddress: "",
    currentCity: "",
    currentProvince: "",
    permanentAddress: "",
    permanentCity: "",
    permanentProvince: "",

    // Identification
    idType: "National ID",
    idNumber: "",
    passportNumber: "",
    idExpiryDate: "",

    // Professional Information
    role: "Referee" as OfficialRole,
    grade: "National B",
    experience: "",
    certifications: "",
    specialization: "",
    licenseNumber: "",

    // Emergency Contact
    emergencyContactName: "",
    emergencyRelationship: "",
    emergencyPhone: "",
    emergencyEmail: "",

    // Additional
    medicalConditions: "",
    notes: "",

    // Status
    status: "Available" as "Available" | "Busy"
  });

  // Form state for add/edit
  const [formData, setFormData] = useState<Partial<UserType>>({
    username: "",
    email: "",
    password: "",
    fullName: "",
    role: "kkf_officer",
    phone: "",
    organization: "",
    status: "active",
  });

  // Check permissions
  if (!permissions.hasPermission("users.view")) {
    return (
      <div className="p-8 max-w-7xl mx-auto">
        <div className="bg-red-50 border border-red-200/60 rounded-xl p-8 text-center">
          <AlertCircle className="w-12 h-12 text-[#C8102E] mx-auto mb-4" />
          <h2 className="text-xl font-bold text-secondary mb-2">Access Denied</h2>
          <p className="text-slate-500 font-medium">You don't have permission to access user management.</p>
        </div>
      </div>
    );
  }

  // Filter system users
  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      !searchQuery ||
      user.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.username.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRole = roleFilter === "all" || user.role === roleFilter;
    const matchesStatus = statusFilter === "all" || user.status === statusFilter;
    return matchesSearch && matchesRole && matchesStatus;
  });

  // Get all officers
  const allOfficials = getAllOfficials();

  // Filter officers
  const filteredOfficers = allOfficials.filter((officer) => {
    const matchesSearch =
      !officerSearch ||
      officer.name.toLowerCase().includes(officerSearch.toLowerCase()) ||
      officer.id.toLowerCase().includes(officerSearch.toLowerCase());
    const matchesRole = officerRoleFilter === "all" || officer.role === officerRoleFilter;
    const matchesStatus = officerStatusFilter === "all" || officer.status === officerStatusFilter;
    return matchesSearch && matchesRole && matchesStatus;
  });

  // Get statistics
  const systemStats = {
    total: users.length,
    active: users.filter((u) => u.status === "active").length,
    inactive: users.filter((u) => u.status === "inactive").length,
    suspended: users.filter((u) => u.status === "suspended").length,
  };

  const officerStats = {
    total: allOfficials.length,
    referees: allOfficials.filter(o => o.role === "Referee").length,
    judges: allOfficials.filter(o => o.role === "Judge").length,
    available: allOfficials.filter(o => o.status === "Available").length,
  };

  // Handle add user
  const handleAddUser = () => {
    if (!permissions.hasPermission("users.create")) {
      toast.error("You don't have permission to create users");
      return;
    }

    if (!formData.username || !formData.email || !formData.password || !formData.fullName || !formData.role) {
      toast.error("Please fill in all required fields");
      return;
    }

    const newUser: User = {
      id: `u${users.length + 1}`,
      username: formData.username!,
      email: formData.email!,
      password: formData.password!,
      fullName: formData.fullName!,
      role: formData.role as UserRole,
      phone: formData.phone,
      organization: formData.organization,
      status: formData.status as "active" | "inactive" | "suspended",
      createdAt: new Date().toISOString(),
      permissions: rolePermissionsState[formData.role] || [],
    };

    setUsers([...users, newUser]);
    toast.success(`User ${newUser.fullName} created successfully`);
    setShowAddModal(false);
    resetForm();
  };

  // Handle quick add user from roles tab
  const handleQuickAddUser = () => {
    if (!permissions.hasPermission("users.create")) {
      toast.error("You don't have permission to create users");
      return;
    }

    if (!quickAddData.fullName || !quickAddData.username || !quickAddData.email || !quickAddData.password) {
      toast.error("Please fill in all required fields (Full Name, Username, Email, Password)");
      return;
    }

    const newUser: UserType = {
      id: `u${users.length + 1}`,
      username: quickAddData.username,
      email: quickAddData.email,
      password: quickAddData.password,
      fullName: quickAddData.fullName,
      role: selectedRole as any,
      organization: dynamicRoles[selectedRole]?.label || "KKF Operations",
      status: "active",
      createdAt: new Date().toISOString(),
      permissions: [...(rolePermissionsState[selectedRole] || [])],
    };

    setUsers([...users, newUser]);
    setQuickAddData({
      fullName: "",
      username: "",
      email: "",
      password: "",
      organization: "",
    });
    toast.success(`✅ User ${newUser.fullName} added successfully as ${dynamicRoles[selectedRole]?.label}!`);
  };

  // Handle custom role creation
  const handleCreateRole = () => {
    if (!newRoleData.key || !newRoleData.label || !newRoleData.description) {
      toast.error("Please fill in all fields for the new role.");
      return;
    }
    if (dynamicRoles[newRoleData.key]) {
      toast.error("A role with this identifier already exists.");
      return;
    }

    const newRoles = {
      ...dynamicRoles,
      [newRoleData.key]: {
        label: newRoleData.label,
        color: "bg-indigo-50 text-indigo-700 border-indigo-200/60", // default nice style for custom roles
        description: newRoleData.description,
      }
    };
    saveRoles(newRoles);

    const basePermissions = newRoleData.copyTemplate === "none" 
      ? [] 
      : [...(rolePermissionsState[newRoleData.copyTemplate] || [])];

    const newPermissionsState = {
      ...rolePermissionsState,
      [newRoleData.key]: basePermissions
    };
    setRolePermissionsState(newPermissionsState);
    localStorage.setItem("kkf_role_permissions_state", JSON.stringify(newPermissionsState));

    setSelectedRole(newRoleData.key);
    setShowAddRoleModal(false);
    setNewRoleData({ key: "", label: "", description: "", copyTemplate: "kkf_officer" });
    toast.success(`✅ Custom role "${newRoleData.label}" created successfully!`);
  };

  // Handle edit user
  const handleEditUser = () => {
    if (!permissions.hasPermission("users.edit")) {
      toast.error("You don't have permission to edit users");
      return;
    }

    if (!selectedUser) return;

    const updatedUser = {
      ...selectedUser,
      ...formData,
      permissions: formData.permissions || rolePermissionsState[formData.role] || [],
    } as UserType;

    const updatedUsers = users.map((u) =>
      u.id === selectedUser.id ? updatedUser : u
    );

    setUsers(updatedUsers);
    toast.success(`User ${selectedUser.fullName} updated successfully`);
    setShowEditModal(false);

    // Also update selectedDrawerUser if it's open
    if (selectedDrawerUser && selectedDrawerUser.id === selectedUser.id) {
      setSelectedDrawerUser(updatedUser);
    }

    setSelectedUser(null);
    resetForm();
  };

  // Handle delete user
  const handleDeleteUser = () => {
    if (!permissions.hasPermission("users.delete")) {
      toast.error("You don't have permission to delete users");
      return;
    }

    if (!selectedUser) return;

    setUsers(users.filter((u) => u.id !== selectedUser.id));
    toast.success(`User ${selectedUser.fullName} deleted successfully`);
    setShowDeleteConfirm(false);

    // Close drawer if it was the deleted user
    if (selectedDrawerUser && selectedDrawerUser.id === selectedUser.id) {
      setShowDetailDrawer(false);
      setSelectedDrawerUser(null);
    }

    setSelectedUser(null);
  };

  // Handle toggle user status
  const handleToggleStatus = (user: UserType) => {
    if (!permissions.hasPermission("users.edit")) {
      toast.error("You don't have permission to change user status");
      return;
    }

    const newStatus = user.status === "active" ? "inactive" : "active";
    const updatedUsers = users.map((u) => (u.id === user.id ? { ...u, status: newStatus } : u));

    setUsers(updatedUsers);
    toast.success(`User ${user.fullName} ${newStatus === "active" ? "activated" : "deactivated"}`);

    // Also update selectedDrawerUser if it's the same user
    if (selectedDrawerUser && selectedDrawerUser.id === user.id) {
      setSelectedDrawerUser({ ...selectedDrawerUser, status: newStatus });
    }
  };

  // Reset form
  const resetForm = () => {
    setFormData({
      username: "",
      email: "",
      password: "",
      fullName: "",
      role: "kkf_officer",
      phone: "",
      organization: "",
      status: "active",
      permissions: [...(ROLE_PERMISSIONS["kkf_officer"] || [])],
    });
  };

  // Open Add User Modal (toggles state)
  const openAddModal = () => {
    setShowAddModal(prev => !prev);
  };

  // Open edit modal (now navigates)
  const openEditModal = (user: UserType) => {
    navigate(`/home/user-management/${user.id}/edit`);
  };

  // Handle toggle custom permissions
  const handleTogglePermission = (permissionKey: string) => {
    const currentPermissions = formData.permissions || [];
    let newPermissions: string[];
    if (currentPermissions.includes(permissionKey)) {
      newPermissions = currentPermissions.filter(p => p !== permissionKey);
    } else {
      newPermissions = [...currentPermissions, permissionKey];
    }
    setFormData(prev => ({
      ...prev,
      permissions: newPermissions
    }));
  };

  // Handle toggle permissions for a role in the matrix tab
  const handleToggleRolePermission = (role: UserRole, permissionKey: string) => {
    setRolePermissionsState(prev => {
      const current = prev[role] || [];
      const updated = current.includes(permissionKey)
        ? current.filter(p => p !== permissionKey)
        : [...current, permissionKey];
      return {
        ...prev,
        [role]: updated
      };
    });
  };

  // Save role-wide permission defaults to global template
  const handleSaveRoleDefaults = (role: UserRole) => {
    if (!permissions.hasPermission("users.manage_roles")) {
      toast.error("You don't have permission to modify roles defaults");
      return;
    }

    localStorage.setItem("kkf_role_permissions_state", JSON.stringify(rolePermissionsState));
    toast.success(`✅ Default permissions for ${dynamicRoles[role]?.label || role} saved!`);
  };

  // Handle add officer
  const handleAddOfficer = () => {
    if (!permissions.hasPermission("officials.assign")) {
      toast.error("You don't have permission to add officers");
      return;
    }

    // Validate required fields
    const requiredFields = [
      { field: officerFormData.firstName, name: "First Name" },
      { field: officerFormData.lastName, name: "Last Name" },
      { field: officerFormData.dateOfBirth, name: "Date of Birth" },
      { field: officerFormData.email, name: "Email" },
      { field: officerFormData.phone, name: "Phone" },
      { field: officerFormData.idNumber, name: "ID Number" },
      { field: officerFormData.experience, name: "Experience" },
    ];

    const missingFields = requiredFields.filter(f => !f.field);
    if (missingFields.length > 0) {
      toast.error(`Please fill in: ${missingFields.map(f => f.name).join(", ")}`);
      return;
    }

    // Generate unique ID
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 1000);
    const newId = `${officerFormData.role.toUpperCase()}-${timestamp}-${random}`;

    const fullName = `${officerFormData.firstName}${officerFormData.middleName ? ' ' + officerFormData.middleName : ''} ${officerFormData.lastName}`;

    const newOfficial: Official = {
      id: newId,
      name: fullName,
      experience: officerFormData.experience,
      grade: officerFormData.grade,
      status: officerFormData.status
    };

    // Add to appropriate store
    if (officerFormData.role === "Referee") {
      addReferee(newOfficial);
    } else {
      addJudge(newOfficial);
    }

    toast.success(`✅ ${fullName} added successfully as ${officerFormData.role}!`);
    setShowAddOfficerModal(false);

    // Reset form
    setOfficerFormSection("personal");

    // Refresh the page to show new officer
    window.location.reload();
  };

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-6 flex flex-col min-h-full animate-fadeIn">
      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">
            User Management
          </h1>
          <p className="text-sm text-muted-foreground mt-1 font-medium">Manage system users, roles, and officer assignments</p>
        </div>
        {activeTab === "users" && permissions.hasPermission("users.create") && (
          <button
            onClick={openAddModal}
            className="btn-primary py-2.5 px-5"
          >
            <UserPlus className="w-4 h-4" />
            Add System User
          </button>
        )}
        {activeTab === "officers" && (
          <button
            onClick={() => {
              setOfficerFormData({
                name: "",
                experience: "",
                grade: "National B",
                role: "Referee",
                status: "Available"
              });
              setShowAddOfficerModal(true);
            }}
            className="btn-primary py-2.5 px-5"
          >
            <Plus className="w-4 h-4" />
            Add New Officer
          </button>
        )}
      </header>

      <div className="flex flex-col lg:flex-row gap-6 items-start w-full">
        {/* Sidebar Tabs */}
        <aside className="w-full lg:w-72 bg-white border border-border rounded-xl flex flex-col shrink-0 shadow-sm p-4 space-y-1.5 self-start">
          <div className="pb-3 border-b border-border/80 mb-2 px-1">
            <span className="text-[10px] text-muted-foreground font-extrabold uppercase tracking-widest select-none">
              Navigation
            </span>
          </div>

          <button
            onClick={() => setActiveTab("users")}
            className={`w-full flex items-center justify-between p-3 py-2 rounded-xl transition-all group border text-left cursor-pointer ${
              activeTab === "users"
                ? "bg-primary/5 border-primary/20 text-primary shadow-xs font-bold"
                : "border-transparent text-slate-500 hover:text-slate-800 hover:bg-slate-50 font-semibold"
            }`}
          >
            <div className="flex items-center gap-3">
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all ${
                activeTab === "users" ? "bg-primary/10 text-primary" : "bg-slate-100 text-slate-500 group-hover:bg-slate-200"
              }`}>
                <Users className="w-4 h-4" />
              </div>
              <div className="flex flex-col leading-tight">
                <span className="text-xs uppercase font-bold tracking-wider">User List</span>
                <span className="text-[10px] text-muted-foreground font-medium mt-0.5">{systemStats.total} users</span>
              </div>
            </div>
          </button>

          <button
            onClick={() => setActiveTab("roles")}
            className={`w-full flex items-center justify-between p-3 py-2 rounded-xl transition-all group border text-left cursor-pointer ${
              activeTab === "roles"
                ? "bg-primary/5 border-primary/20 text-primary shadow-xs font-bold"
                : "border-transparent text-slate-500 hover:text-slate-800 hover:bg-slate-50 font-semibold"
            }`}
          >
            <div className="flex items-center gap-3">
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all ${
                activeTab === "roles" ? "bg-primary/10 text-primary" : "bg-slate-100 text-slate-500 group-hover:bg-slate-200"
              }`}>
                <Shield className="w-4 h-4" />
              </div>
              <div className="flex flex-col leading-tight">
                <span className="text-xs uppercase font-bold tracking-wider">Roles & Permissions</span>
                <span className="text-[10px] text-muted-foreground font-medium mt-0.5">{Object.keys(dynamicRoles).length} Roles</span>
              </div>
            </div>
          </button>

          <button
            onClick={() => setActiveTab("officers")}
            className={`w-full flex items-center justify-between p-3 py-2 rounded-xl transition-all group border text-left cursor-pointer ${
              activeTab === "officers"
                ? "bg-primary/5 border-primary/20 text-primary shadow-xs font-bold"
                : "border-transparent text-slate-500 hover:text-slate-800 hover:bg-slate-50 font-semibold"
            }`}
          >
            <div className="flex items-center gap-3">
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all ${
                activeTab === "officers" ? "bg-primary/10 text-primary" : "bg-slate-100 text-slate-500 group-hover:bg-slate-200"
              }`}>
                <Award className="w-4 h-4" />
              </div>
              <div className="flex flex-col leading-tight">
                <span className="text-xs uppercase font-bold tracking-wider">Official Officers</span>
                <span className="text-[10px] text-muted-foreground font-medium mt-0.5">{officerStats.total} officers</span>
              </div>
            </div>
          </button>
        </aside>

        {/* Content Workspace */}
        <div className="flex-1 min-w-0 w-full space-y-6">

          {/* Enhanced Stats Cards - System Users */}
          {activeTab === "users" && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              <div className="card-premium flex items-center gap-4">
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center text-primary">
                  <Users className="w-6 h-6" />
                </div>
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-0.5">Total Users</span>
                  <span className="text-2xl font-extrabold text-slate-900 leading-none">{systemStats.total}</span>
                </div>
              </div>

              <div className="card-premium flex items-center gap-4">
                <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-lg flex items-center justify-center">
                  <CheckCircle className="w-6 h-6" />
                </div>
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-0.5">Active Users</span>
                  <span className="text-2xl font-extrabold text-emerald-600 leading-none">{systemStats.active}</span>
                </div>
              </div>

              <div className="card-premium flex items-center gap-4">
                <div className="w-12 h-12 bg-slate-100 text-slate-500 rounded-lg flex items-center justify-center">
                  <XCircle className="w-6 h-6" />
                </div>
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-0.5">Inactive Users</span>
                  <span className="text-2xl font-extrabold text-slate-600 leading-none">{systemStats.inactive}</span>
                </div>
              </div>

              <div className="card-premium flex items-center gap-4">
                <div className="w-12 h-12 bg-rose-50 text-rose-600 rounded-lg flex items-center justify-center">
                  <AlertCircle className="w-6 h-6" />
                </div>
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-0.5">Blocked Users</span>
                  <span className="text-2xl font-extrabold text-rose-600 leading-none">{systemStats.suspended}</span>
                </div>
              </div>
            </div>
          )}

          {/* Enhanced Stats Cards - Officers */}
          {activeTab === "officers" && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              <div className="card-premium flex items-center gap-4">
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center text-primary">
                  <Shield className="w-6 h-6" />
                </div>
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-0.5">Total Officers</span>
                  <span className="text-2xl font-extrabold text-slate-900 leading-none">{officerStats.total}</span>
                </div>
              </div>

              <div className="card-premium flex items-center gap-4">
                <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-lg flex items-center justify-center">
                  <UserCheck className="w-6 h-6" />
                </div>
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-0.5">Referees</span>
                  <span className="text-2xl font-extrabold text-indigo-600 leading-none">{officerStats.referees}</span>
                </div>
              </div>

              <div className="card-premium flex items-center gap-4">
                <div className="w-12 h-12 bg-purple-50 text-purple-600 rounded-lg flex items-center justify-center">
                  <Award className="w-6 h-6" />
                </div>
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-0.5">Judges</span>
                  <span className="text-2xl font-extrabold text-purple-600 leading-none">{officerStats.judges}</span>
                </div>
              </div>

              <div className="card-premium flex items-center gap-4">
                <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-lg flex items-center justify-center">
                  <CheckCircle className="w-6 h-6" />
                </div>
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-0.5">Available</span>
                  <span className="text-2xl font-extrabold text-emerald-600 leading-none">{officerStats.available}</span>
                </div>
              </div>
            </div>
          )}

        {/* Enhanced Search & Filter - System Users */}
        {activeTab === "users" && (
          <div className="card-premium p-4 mb-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="relative group">
                <Search className="absolute left-3.5 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-primary transition-colors" />
                <input
                  type="text"
                  placeholder="Search users by name or email..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm transition-all duration-200 outline-none focus:border-primary focus:bg-white focus:ring-4 focus:ring-primary/5 placeholder:text-slate-400"
                />
              </div>

              <div className="relative">
                <Shield className="absolute left-3.5 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                <select
                  value={roleFilter}
                  onChange={(e) => setRoleFilter(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm font-semibold text-slate-700 focus:outline-none focus:border-primary focus:bg-white focus:ring-4 focus:ring-primary/5 appearance-none cursor-pointer transition-all"
                >
                  <option value="all">All Roles</option>
                  {Object.keys(dynamicRoles).map((key) => (
                    <option key={key} value={key}>
                      {dynamicRoles[key].label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="relative">
                <Filter className="absolute left-3.5 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value as any)}
                  className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm font-semibold text-slate-700 focus:outline-none focus:border-primary focus:bg-white focus:ring-4 focus:ring-primary/5 appearance-none cursor-pointer transition-all"
                >
                  <option value="all">All Status</option>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                  <option value="suspended">Suspended</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {/* Inline Add User Form */}
                  {activeTab === "users" && (showAddModal || isCreatePage || isEditPage) && (
            <div className="card-premium p-6 mb-6 shadow-sm border border-slate-200/80 bg-white animate-in slide-in-from-top duration-250">
              {/* Header */}
              <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-100">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 bg-primary/10 rounded-lg flex items-center justify-center">
                    <UserPlus className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h2 className="text-base font-bold text-slate-900">{isEditPage ? "Edit User" : "Add New User"}</h2>
                    <p className="text-xs text-slate-400 mt-0.5">{isEditPage ? "Modify user details." : "Create a new system user profile. The role filter determines default permissions."}</p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    // Close modal or navigate back if on route page
                    if (isCreatePage || isEditPage) {
                      navigate("/home/user-management");
                    } else {
                      setShowAddModal(false);
                    }
                  }}
                  className="text-slate-400 hover:bg-slate-50 hover:text-slate-600 p-1.5 rounded-lg transition-all cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

          


  

            {/* Content */}
            <div className="space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                    Full Name <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.fullName}
                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                    placeholder="Enter full name"
                    className="input-premium"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                    Username <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.username}
                    onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                    placeholder="Enter username"
                    className="input-premium"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                    Email <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="Enter email"
                    className="input-premium"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                    Password <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    placeholder="Enter password"
                    className="input-premium"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5">Phone</label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="Enter phone number"
                    className="input-premium"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5">Organization</label>
                  <input
                    type="text"
                    value={formData.organization}
                    onChange={(e) => setFormData({ ...formData, organization: e.target.value })}
                    placeholder="Enter organization"
                    className="input-premium"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-t border-slate-100 pt-4 mt-2">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                    Role <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={formData.role}
                    onChange={(e) => {
                      const newRole = e.target.value;
                      setFormData({
                        ...formData,
                        role: newRole as any,
                        permissions: [...(rolePermissionsState[newRole] || [])]
                      });
                    }}
                    className="input-premium appearance-none cursor-pointer"
                  >
                    {Object.keys(dynamicRoles).map((key) => (
                      <option key={key} value={key}>
                        {dynamicRoles[key].label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5">Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                    className="input-premium appearance-none cursor-pointer"
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                    <option value="suspended">Suspended</option>
                  </select>
                </div>
              </div>

              {/* Role Info */}
              {formData.role && dynamicRoles[formData.role] && (
                <div className={`p-3.5 rounded-xl border text-xs leading-relaxed ${dynamicRoles[formData.role].color}`}>
                  <p className="font-semibold text-sm mb-1">{dynamicRoles[formData.role].label}</p>
                  <p className="opacity-90">{dynamicRoles[formData.role].description}</p>
                </div>
              )}

              {/* Custom Permissions Panel */}
              <div className="border-t border-slate-100 pt-4">
                <h3 className="text-sm font-semibold text-slate-800 mb-1 flex items-center gap-2">
                  <Shield className="w-4.5 h-4.5 text-primary" />
                  <span>Custom User Functions & Permissions</span>
                </h3>
                <p className="text-xs text-slate-400 mb-3.5">
                  Define exactly what features this user can access. Defaults are set based on the role.
                </p>
                <div className="space-y-4 max-h-[260px] overflow-y-auto pr-1 border border-slate-100 rounded-xl p-3 bg-slate-50/50">
                  {PERMISSION_GROUPS.map((group) => (
                    <div key={group.title} className="space-y-1.5">
                      <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100 pb-1">{group.title}</div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        {group.permissions.map((perm) => {
                          const isChecked = (formData.permissions || []).includes(perm.key);
                          return (
                            <label
                              key={perm.key}
                              className={clsx(
                                "flex items-start gap-2.5 p-2 rounded-lg border text-xs font-semibold cursor-pointer transition-all duration-150",
                                isChecked
                                  ? "bg-primary/5 border-primary/20 text-primary"
                                  : "bg-white border-slate-200/60 hover:border-slate-300 text-slate-500"
                              )}
                            >
                              <input
                                type="checkbox"
                                checked={isChecked}
                                onChange={() => handleTogglePermission(perm.key)}
                                className="mt-0.5 accent-primary cursor-pointer w-3.5 h-3.5"
                              />
                              <div className="leading-tight">
                                <p className="font-semibold text-slate-800">{perm.label}</p>
                                <p className="text-[9px] text-slate-400 font-mono mt-0.5">{perm.key}</p>
                              </div>
                            </label>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 mt-2">
                <button
                  onClick={() => setShowAddModal(false)}
                  className="btn-outline px-5 py-2"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddUser}
                  className="btn-primary px-5 py-2"
                >
                  Add User
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Enhanced Search & Filter - Officers */}
        {activeTab === "officers" && (
          <div className="card-premium p-4 mb-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="relative group">
                <Search className="absolute left-3.5 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-primary transition-colors" />
                <input
                  type="text"
                  placeholder="Search officers by name or ID..."
                  value={officerSearch}
                  onChange={(e) => setOfficerSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm transition-all duration-200 outline-none focus:border-primary focus:bg-white focus:ring-4 focus:ring-primary/5 placeholder:text-slate-400"
                />
              </div>

              <div className="relative">
                <Shield className="absolute left-3.5 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                <select
                  value={officerRoleFilter}
                  onChange={(e) => setOfficerRoleFilter(e.target.value as any)}
                  className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm font-semibold text-slate-700 focus:outline-none focus:border-primary focus:bg-white focus:ring-4 focus:ring-primary/5 appearance-none cursor-pointer transition-all"
                >
                  <option value="all">All Roles</option>
                  <option value="Referee">Referees</option>
                  <option value="Judge">Judges</option>
                </select>
              </div>

              <div className="relative">
                <Filter className="absolute left-3.5 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                <select
                  value={officerStatusFilter}
                  onChange={(e) => setOfficerStatusFilter(e.target.value as any)}
                  className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm font-semibold text-slate-700 focus:outline-none focus:border-primary focus:bg-white focus:ring-4 focus:ring-primary/5 appearance-none cursor-pointer transition-all"
                >
                  <option value="all">All Status</option>
                  <option value="Available">Available</option>
                  <option value="Busy">Busy</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {/* Enhanced System Users Table */}
        {activeTab === "users" && (
          <div className="card-premium p-0 overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="table-premium">
                <thead>
                  <tr>
                    <th>User Details</th>
                    <th>Role</th>
                    <th>Organization</th>
                    <th>Status</th>
                    <th>Last Login</th>
                    <th className="text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredUsers.length > 0 ? (
                    filteredUsers.map((user) => {
                      const roleInfo = dynamicRoles[user.role] || { label: user.role, color: "bg-slate-100 text-slate-700 border-slate-300", description: "" };
                      return (
                        <tr
                          key={user.id}
                          onClick={() => {
                            setSelectedDrawerUser(user);
                            setShowDetailDrawer(true);
                          }}
                          className="cursor-pointer"
                        >
                          <td>
                            <div className="flex items-center gap-3">
                              <img
                                src={user.avatar || "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=150"}
                                alt={user.fullName}
                                className="w-10 h-10 rounded-lg border border-slate-200 object-cover shadow-sm shrink-0"
                              />
                              <div>
                                <p className="font-semibold text-slate-800 text-sm">{user.fullName}</p>
                                <p className="text-xs text-slate-400 font-medium mt-0.5">{user.email}</p>
                              </div>
                            </div>
                          </td>
                          <td>
                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${roleInfo.color}`}>
                              {roleInfo.label}
                            </span>
                          </td>
                          <td>
                            <span className="text-xs font-semibold text-slate-600 bg-slate-50 border border-slate-200/60 px-2.5 py-1 rounded-lg">
                              {user.organization || "N/A"}
                            </span>
                          </td>
                          <td>
                            {user.status === "active" ? (
                              <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-700 border border-emerald-200/50 px-2 py-0.5 rounded-full text-xs font-semibold">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                                Active
                              </span>
                            ) : user.status === "suspended" ? (
                              <span className="inline-flex items-center gap-1 bg-rose-50 text-rose-700 border border-rose-200/50 px-2 py-0.5 rounded-full text-xs font-semibold">
                                <span className="w-1.5 h-1.5 rounded-full bg-rose-500"></span>
                                Suspended
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 bg-slate-50 text-slate-600 border border-slate-200/50 px-2 py-0.5 rounded-full text-xs font-semibold">
                                <span className="w-1.5 h-1.5 rounded-full bg-slate-400"></span>
                                Inactive
                              </span>
                            )}
                          </td>
                          <td>
                            {user.lastLogin ? (
                              <span className="text-xs text-slate-500 font-medium">
                                {new Date(user.lastLogin).toLocaleDateString("en-GB")}
                              </span>
                            ) : (
                              <span className="text-xs text-slate-400 italic">Never logged in</span>
                            )}
                          </td>
                          <td>
                            <div className="flex items-center justify-end gap-1.5">
                              {permissions.hasPermission("users.edit") && (
                                <>
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleToggleStatus(user);
                                    }}
                                    className="p-1.5 bg-slate-50 hover:bg-slate-100 text-slate-600 rounded-lg border border-slate-200 transition-all cursor-pointer"
                                    title={user.status === "active" ? "Deactivate" : "Activate"}
                                  >
                                    {user.status === "active" ? <Lock className="w-3.5 h-3.5" /> : <Unlock className="w-3.5 h-3.5" />}
                                  </button>
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      openEditModal(user);
                                    }}
                                    className="p-1.5 bg-slate-50 hover:bg-slate-100 text-slate-600 rounded-lg border border-slate-200 transition-all cursor-pointer"
                                    title="Edit User"
                                  >
                                    <Edit2 className="w-3.5 h-3.5" />
                                  </button>
                                </>
                              )}
                              {permissions.hasPermission("users.delete") && (
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setSelectedUser(user);
                                    setShowDeleteConfirm(true);
                                  }}
                                  className="p-1.5 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-lg border border-rose-200/60 transition-all cursor-pointer"
                                  title="Delete User"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan={6} className="px-6 py-16 text-center">
                        <div className="flex flex-col items-center">
                          <div className="w-16 h-16 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-center mb-4">
                            <Users className="w-8 h-8 text-slate-400" />
                          </div>
                          <p className="text-base text-slate-900 font-bold mb-1">No Users Found</p>
                          <p className="text-xs text-slate-400">Try adjusting your search or filter criteria</p>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Enhanced Officers Table */}
        {activeTab === "officers" && (
          <div className="card-premium p-0 overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="table-premium">
                <thead>
                  <tr>
                    <th>Officer ID</th>
                    <th>Officer Name</th>
                    <th>Role</th>
                    <th>Grade</th>
                    <th>Experience</th>
                    <th>Status</th>
                    <th className="text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredOfficers.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="px-6 py-16 text-center">
                        <div className="flex flex-col items-center">
                          <div className="w-16 h-16 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-center mb-4">
                            <Shield className="w-8 h-8 text-slate-400" />
                          </div>
                          <p className="text-base text-slate-900 font-bold mb-1">No Officers Found</p>
                          <p className="text-xs text-slate-400">Try adjusting your search or filter criteria</p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    filteredOfficers.map((official) => (
                      <tr
                        key={official.id}
                        onClick={() => {
                          setSelectedOfficer(official);
                          setShowOfficerDetailModal(true);
                        }}
                        className="cursor-pointer"
                      >
                        <td>
                          <span className="text-xs font-semibold text-slate-600 bg-slate-50 border border-slate-200/60 px-2.5 py-1 rounded-lg">
                            {official.id}
                          </span>
                        </td>
                        <td>
                          <div className="font-semibold text-slate-800 text-sm group-hover:text-primary transition-colors">
                            {official.name}
                          </div>
                        </td>
                        <td>
                          <span
                            className={clsx(
                              "badge-premium",
                              official.role === "Referee"
                                ? "bg-indigo-50 text-indigo-700 border-indigo-200/50"
                                : "bg-purple-50 text-purple-700 border-purple-200/50"
                            )}
                          >
                            {official.role === "Referee" ? (
                              <UserCheck className="w-3 h-3" />
                            ) : (
                              <Award className="w-3 h-3" />
                            )}
                            {official.role}
                          </span>
                        </td>
                        <td>
                          <span
                            className={clsx(
                              "badge-premium",
                              official.grade.includes("International")
                                ? "bg-amber-50 text-amber-700 border-amber-200/50"
                                : "bg-blue-50 text-blue-700 border-blue-200/50"
                            )}
                          >
                            <Star className="w-3 h-3" />
                            {official.grade}
                          </span>
                        </td>
                        <td>
                          <div className="flex items-center gap-1.5 text-slate-500">
                            <Briefcase className="w-3.5 h-3.5 text-slate-400" />
                            <span className="font-medium text-slate-700 text-sm">{official.experience}</span>
                          </div>
                        </td>
                        <td>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              toast.success(`${official.name} status updated!`);
                            }}
                            className={clsx(
                              "inline-flex items-center gap-1 bg-slate-50 border border-slate-200/50 px-2 py-0.5 rounded-full text-xs font-semibold hover:bg-slate-100 transition-colors cursor-pointer",
                              official.status === "Available"
                                ? "text-emerald-700 bg-emerald-50 border-emerald-200/50"
                                : "text-rose-700 bg-rose-50 border-rose-200/50"
                            )}
                          >
                            <span
                              className={clsx(
                                "w-1.5 h-1.5 rounded-full",
                                official.status === "Available" ? "bg-emerald-500" : "bg-rose-500"
                              )}
                            ></span>
                            {official.status}
                          </button>
                        </td>
                        <td>
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedOfficer(official);
                                setShowOfficerDetailModal(true);
                              }}
                              className="p-1.5 bg-slate-50 hover:bg-slate-100 text-slate-600 rounded-lg border border-slate-200 transition-all cursor-pointer"
                              title="View Details"
                            >
                              <Eye className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                toast.info("Edit officer functionality coming soon!");
                              }}
                              className="p-1.5 bg-slate-50 hover:bg-slate-100 text-slate-600 rounded-lg border border-slate-200 transition-all cursor-pointer"
                              title="Edit Officer"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                if (confirm(`Are you sure you want to remove ${official.name}?`)) {
                                  toast.success(`${official.name} removed successfully!`);
                                }
                              }}
                              className="p-1.5 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-lg border border-rose-200/60 transition-all cursor-pointer"
                              title="Remove Officer"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Roles & Permissions Matrix Workspace */}
        {activeTab === "roles" && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-8">
            <div className="lg:col-span-4 space-y-4">
              <div className="card-premium p-5 shadow-sm">
                <div className="flex items-center justify-between mb-3 border-b border-slate-100 pb-2.5">
                  <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                    <Shield className="w-5 h-5 text-primary" />
                    <span>System Roles</span>
                  </h3>
                  <button
                    onClick={() => setShowAddRoleModal(!showAddRoleModal)}
                    className="text-xs btn-outline py-1.5 px-2.5 flex items-center gap-1 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Add Role
                  </button>
                </div>

                {showAddRoleModal && (
                  <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 mb-4 space-y-3 animate-in slide-in-from-top duration-200 text-left">
                    <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Create Custom Role</h4>
                    <div>
                      <label className="block text-[10px] font-semibold text-slate-500 mb-1">Role Identifier (lowercase slug)</label>
                      <input
                        type="text"
                        placeholder="e.g. broadcast_partner"
                        value={newRoleData.key}
                        onChange={(e) => setNewRoleData({ ...newRoleData, key: e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, "") })}
                        className="input-premium py-1 px-2.5 text-xs bg-white"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-semibold text-slate-500 mb-1">Role Name</label>
                      <input
                        type="text"
                        placeholder="e.g. Broadcast Partner"
                        value={newRoleData.label}
                        onChange={(e) => setNewRoleData({ ...newRoleData, label: e.target.value })}
                        className="input-premium py-1 px-2.5 text-xs bg-white"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-semibold text-slate-500 mb-1">Description</label>
                      <textarea
                        placeholder="e.g. Manages broadcasting rights and schedules"
                        value={newRoleData.description}
                        onChange={(e) => setNewRoleData({ ...newRoleData, description: e.target.value })}
                        className="input-premium py-1 px-2.5 text-xs h-16 bg-white"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-semibold text-slate-500 mb-1">Copy Permissions From</label>
                      <select
                        value={newRoleData.copyTemplate}
                        onChange={(e) => setNewRoleData({ ...newRoleData, copyTemplate: e.target.value })}
                        className="input-premium py-1 px-2.5 text-xs bg-white appearance-none"
                      >
                        {Object.keys(dynamicRoles).map((k) => (
                          <option key={k} value={k}>{dynamicRoles[k].label}</option>
                        ))}
                        <option value="none">None (Empty permissions)</option>
                      </select>
                    </div>
                    <div className="flex gap-2 justify-end pt-1">
                      <button
                        onClick={() => setShowAddRoleModal(false)}
                        className="text-[10px] btn-outline py-1 px-2.5 cursor-pointer"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleCreateRole}
                        className="text-[10px] btn-primary py-1 px-2.5 cursor-pointer"
                      >
                        Create
                      </button>
                    </div>
                  </div>
                )}

                <p className="text-xs text-slate-500 mb-4 font-medium leading-relaxed">
                  Select a role from the list below to view and modify default authorization profiles.
                </p>

                <div className="space-y-3">
                  {Object.keys(dynamicRoles).map((roleKey) => {
                    const roleLabel = dynamicRoles[roleKey];
                    const userCount = users.filter((u) => u.role === roleKey).length;
                    const isSelected = selectedRole === roleKey;
                    return (
                      <button
                        key={roleKey}
                        onClick={() => setSelectedRole(roleKey)}
                        className={clsx(
                          "w-full text-left p-4 rounded-xl border transition-all duration-200 flex flex-col gap-2 cursor-pointer shadow-sm relative group hover:scale-[1.01]",
                          isSelected
                            ? "bg-gradient-to-br from-blue-50/80 to-indigo-50/50 border-primary ring-2 ring-primary/10"
                            : "bg-white border-border hover:border-slate-300"
                        )}
                      >
                        <div className="flex items-center justify-between">
                          <span className={clsx(
                            "badge-premium px-2.5 py-1 rounded-full text-xs font-semibold border",
                            roleLabel.color
                          )}>
                            <Shield className="w-3.5 h-3.5" />
                            {roleLabel.label}
                          </span>
                          <span className="bg-slate-55 text-slate-500 px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider border border-slate-200">
                            {userCount} {userCount === 1 ? "User" : "Users"}
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 font-medium leading-relaxed mt-1">
                          {roleLabel.description}
                        </p>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Right Pane: Global Permissions Checklist */}
            <div className="lg:col-span-8">
              <div className="card-premium p-6 flex flex-col h-full shadow-sm">
                <div className="border-b border-border pb-4 mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <div>
                    <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                      <span className={clsx("badge-premium text-xs px-3 py-1 rounded-full", dynamicRoles[selectedRole]?.color || "bg-indigo-50 text-indigo-700 border-indigo-200")}>
                        {dynamicRoles[selectedRole]?.label || selectedRole}
                      </span>
                      <span className="text-slate-500 font-medium text-sm">• Default Permissions</span>
                    </h3>
                    <p className="text-xs text-slate-500 font-medium mt-1">
                      Configure default authorizations inherited by all new users assigned to this role.
                    </p>
                  </div>
                  <button
                    onClick={() => handleSaveRoleDefaults(selectedRole)}
                    className="btn-primary"
                  >
                    <CheckCircle className="w-4 h-4" />
                    Save Defaults
                  </button>
                </div>

                <div className="space-y-6 max-h-[60vh] overflow-y-auto pr-2">
                  {PERMISSION_GROUPS.map((group) => {
                    return (
                      <div key={group.title} className="space-y-3">
                        <div className="text-xs font-bold text-slate-800 uppercase tracking-wider border-b border-slate-100 pb-1">
                          {group.title}
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          {group.permissions.map((perm) => {
                            const isChecked = (rolePermissionsState[selectedRole] || []).includes(perm.key);
                            return (
                              <label
                                key={perm.key}
                                className={clsx(
                                  "flex items-start gap-3 p-3 rounded-xl border text-xs font-medium cursor-pointer transition-all duration-150 hover:-translate-y-0.5",
                                  isChecked
                                    ? "bg-blue-50/50 border-primary text-primary shadow-sm"
                                    : "bg-white border-border hover:border-slate-300 text-slate-500"
                                )}
                              >
                                <input
                                  type="checkbox"
                                  checked={isChecked}
                                  onChange={() => handleToggleRolePermission(selectedRole, perm.key)}
                                  className="mt-0.5 accent-primary cursor-pointer w-4 h-4"
                                />
                                <div className="leading-tight">
                                  <p className="font-semibold text-slate-800">{perm.label}</p>
                                  <p className="text-[9px] text-slate-400 font-mono mt-0.5">{perm.key}</p>
                                </div>
                              </label>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Quick Add User to Role Form */}
                <div className="border-t border-border pt-6 mt-6 bg-slate-50/30 -mx-6 -mb-6 p-6">
                  <div className="flex items-center gap-2.5 mb-2">
                    <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
                      <UserPlus className="w-4.5 h-4.5 text-primary" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-slate-900">Quick Add User to this Role</h4>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Instantly register a new user under the <strong>{dynamicRoles[selectedRole]?.label || selectedRole}</strong> role with default permissions.
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 mt-4">
                    <div>
                      <input
                        type="text"
                        placeholder="Full Name *"
                        value={quickAddData.fullName}
                        onChange={(e) => setQuickAddData({ ...quickAddData, fullName: e.target.value })}
                        className="w-full input-premium bg-white py-1.5 px-3 text-xs"
                      />
                    </div>
                    <div>
                      <input
                        type="text"
                        placeholder="Username *"
                        value={quickAddData.username}
                        onChange={(e) => setQuickAddData({ ...quickAddData, username: e.target.value })}
                        className="w-full input-premium bg-white py-1.5 px-3 text-xs"
                      />
                    </div>
                    <div>
                      <input
                        type="email"
                        placeholder="Email Address *"
                        value={quickAddData.email}
                        onChange={(e) => setQuickAddData({ ...quickAddData, email: e.target.value })}
                        className="w-full input-premium bg-white py-1.5 px-3 text-xs"
                      />
                    </div>
                    <div>
                      <input
                        type="password"
                        placeholder="Password *"
                        value={quickAddData.password}
                        onChange={(e) => setQuickAddData({ ...quickAddData, password: e.target.value })}
                        className="w-full input-premium bg-white py-1.5 px-3 text-xs"
                      />
                    </div>
                  </div>

                  <div className="mt-3 flex justify-between items-center">
                    <span className="text-[10px] text-slate-400 italic font-medium">
                      * All fields are required. Users inherit the defaults configured above.
                    </span>
                    <button
                      onClick={handleQuickAddUser}
                      className="btn-primary py-1.5 px-4 text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      Add User to Role
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
      </div>

      {/* Add User Modal has been moved inline above the user table */}

      {/* Edit User Modal - Similar to Add Modal */}
      {showEditModal && selectedUser && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col">
            {/* Header */}
            <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-white">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 bg-primary/10 rounded-lg flex items-center justify-center">
                  <Edit2 className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-slate-900">Edit User</h2>
                  <p className="text-xs text-slate-400 mt-0.5">Modify system user profile settings and permissions.</p>
                </div>
              </div>
              <button
                onClick={() => setShowEditModal(false)}
                className="text-slate-400 hover:bg-slate-50 hover:text-slate-600 p-1.5 rounded-lg transition-all cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content */}
            <div className="p-6 space-y-4 overflow-y-auto flex-1">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                    Full Name <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.fullName}
                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                    placeholder="Enter full name"
                    className="input-premium"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                    Username <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.username}
                    onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                    placeholder="Enter username"
                    className="input-premium"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                    Email <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="Enter email"
                    className="input-premium"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5">Phone</label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="Enter phone number"
                    className="input-premium"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5">Organization</label>
                  <input
                    type="text"
                    value={formData.organization}
                    onChange={(e) => setFormData({ ...formData, organization: e.target.value })}
                    placeholder="Enter organization"
                    className="input-premium"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                    Role <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={formData.role}
                    onChange={(e) => {
                      const newRole = e.target.value;
                      setFormData({
                        ...formData,
                        role: newRole as any,
                        permissions: [...(rolePermissionsState[newRole] || [])]
                      });
                    }}
                    className="input-premium appearance-none cursor-pointer"
                  >
                    {Object.keys(dynamicRoles).map((key) => (
                      <option key={key} value={key}>
                        {dynamicRoles[key].label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5">Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as "active" | "inactive" | "suspended" })}
                    className="input-premium appearance-none cursor-pointer"
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                    <option value="suspended">Suspended</option>
                  </select>
                </div>
              </div>

              {/* Role Info */}
              {formData.role && dynamicRoles[formData.role] && (
                <div className={`p-3.5 rounded-xl border text-xs leading-relaxed ${dynamicRoles[formData.role].color}`}>
                  <p className="font-semibold text-sm mb-1">{dynamicRoles[formData.role].label}</p>
                  <p className="opacity-90">{dynamicRoles[formData.role].description}</p>
                </div>
              )}

              {/* Custom Permissions Panel */}
              <div className="border-t border-slate-100 pt-4">
                <h3 className="text-sm font-bold text-slate-800 mb-1 flex items-center gap-2">
                  <Shield className="w-4.5 h-4.5 text-primary" />
                  <span>Custom User Functions & Permissions</span>
                </h3>
                <p className="text-xs text-slate-400 mb-3.5">
                  Define exactly what features this user can access and configure. Uncheck items to restrict access.
                </p>
                <div className="space-y-4 max-h-[260px] overflow-y-auto pr-1 border border-slate-100 rounded-xl p-3 bg-slate-50/50">
                  {PERMISSION_GROUPS.map((group) => (
                    <div key={group.title} className="space-y-1.5">
                      <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100 pb-1">{group.title}</div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        {group.permissions.map((perm) => {
                          const isChecked = (formData.permissions || []).includes(perm.key);
                          return (
                            <label
                              key={perm.key}
                              className={clsx(
                                "flex items-start gap-2.5 p-2 rounded-lg border text-xs font-semibold cursor-pointer transition-all duration-150",
                                isChecked
                                  ? "bg-primary/5 border-primary/20 text-primary"
                                  : "bg-white border-slate-200/60 hover:border-slate-300 text-slate-500"
                              )}
                            >
                              <input
                                type="checkbox"
                                checked={isChecked}
                                onChange={() => handleTogglePermission(perm.key)}
                                className="mt-0.5 accent-primary cursor-pointer w-3.5 h-3.5"
                              />
                              <div className="leading-tight">
                                <p className="font-semibold text-slate-800">{perm.label}</p>
                                <p className="text-[9px] text-slate-400 font-mono mt-0.5">{perm.key}</p>
                              </div>
                            </label>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 mt-2">
                <button
                  onClick={() => setShowEditModal(false)}
                  className="btn-outline px-5 py-2"
                >
                  Cancel
                </button>
                <button
                  onClick={handleEditUser}
                  className="btn-primary px-5 py-2"
                >
                  Update User
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && selectedUser && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6">
            <div className="text-center">
              <div className="w-12 h-12 bg-rose-50 border border-rose-100 rounded-xl flex items-center justify-center mx-auto mb-3.5">
                <AlertCircle className="w-6 h-6 text-secondary" />
              </div>
              <h2 className="text-lg font-bold text-slate-900 mb-1.5">Delete User Account</h2>
              <p className="text-sm text-slate-500 font-medium mb-5 leading-relaxed">
                Are you sure you want to delete <strong>{selectedUser.fullName}</strong>? This action cannot be undone and will revoke all access.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setShowDeleteConfirm(false);
                    setSelectedUser(null);
                  }}
                  className="btn-outline flex-1 py-2.5 font-semibold"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteUser}
                  className="btn-secondary flex-1 py-2.5 font-semibold"
                >
                  Delete User
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Officer Modal - Enhanced KYC Form */}
      {showAddOfficerModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-5xl w-full max-h-[90vh] overflow-hidden flex flex-col">
            {/* Header */}
            <div className="px-6 py-5 border-b border-slate-100 bg-white">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
                    <UserPlus className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-slate-900">Add New Officer</h2>
                    <p className="text-xs text-slate-400 mt-0.5">Complete KYC registration form to register a new referee or judge.</p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setShowAddOfficerModal(false);
                    setOfficerFormSection("personal");
                  }}
                  className="text-slate-400 hover:bg-slate-50 hover:text-slate-600 p-1.5 rounded-lg transition-all cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Section Tabs */}
              <div className="flex gap-1.5 mt-5 overflow-x-auto pb-1">
                {[
                  { id: "personal", label: "Personal Info", icon: User },
                  { id: "contact", label: "Contact", icon: Mail },
                  { id: "identification", label: "ID Documents", icon: CreditCard },
                  { id: "professional", label: "Professional", icon: Briefcase },
                  { id: "emergency", label: "Emergency", icon: Heart },
                ].map((section) => (
                  <button
                    key={section.id}
                    type="button"
                    onClick={() => setOfficerFormSection(section.id as any)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-semibold text-xs whitespace-nowrap transition-all cursor-pointer ${
                      officerFormSection === section.id
                        ? "bg-primary text-white shadow-xs"
                        : "bg-slate-50 text-slate-600 border border-slate-200/50 hover:bg-slate-100"
                    }`}
                  >
                    <section.icon className="w-3.5 h-3.5" />
                    {section.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Form Content */}
            <div className="flex-1 overflow-y-auto p-6 bg-white">
              {/* Personal Information Section */}
              {officerFormSection === "personal" && (
                <div className="space-y-5">
                  <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100">
                    <div className="w-9 h-9 bg-primary/10 rounded-lg flex items-center justify-center">
                      <User className="w-4.5 h-4.5 text-primary" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-slate-800">Personal Information</h3>
                      <p className="text-xs text-slate-400 mt-0.5">Basic personal details of the officer</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                        First Name <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={officerFormData.firstName}
                        onChange={(e) => setOfficerFormData({ ...officerFormData, firstName: e.target.value })}
                        placeholder="Enter first name"
                        className="input-premium"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                        Middle Name
                      </label>
                      <input
                        type="text"
                        value={officerFormData.middleName}
                        onChange={(e) => setOfficerFormData({ ...officerFormData, middleName: e.target.value })}
                        placeholder="Enter middle name"
                        className="input-premium"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                        Last Name <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={officerFormData.lastName}
                        onChange={(e) => setOfficerFormData({ ...officerFormData, lastName: e.target.value })}
                        placeholder="Enter last name"
                        className="input-premium"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                        Date of Birth <span className="text-rose-500">*</span>
                      </label>
                      <div className="relative">
                        <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input
                          type="date"
                          value={officerFormData.dateOfBirth}
                          onChange={(e) => setOfficerFormData({ ...officerFormData, dateOfBirth: e.target.value })}
                          className="input-premium pl-9"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                        Gender <span className="text-rose-500">*</span>
                      </label>
                      <select
                        value={officerFormData.gender}
                        onChange={(e) => setOfficerFormData({ ...officerFormData, gender: e.target.value })}
                        className="input-premium appearance-none cursor-pointer"
                      >
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                        Blood Type
                      </label>
                      <select
                        value={officerFormData.bloodType}
                        onChange={(e) => setOfficerFormData({ ...officerFormData, bloodType: e.target.value })}
                        className="input-premium appearance-none cursor-pointer"
                      >
                        <option value="A+">A+</option>
                        <option value="A-">A-</option>
                        <option value="B+">B+</option>
                        <option value="B-">B-</option>
                        <option value="AB+">AB+</option>
                        <option value="AB-">AB-</option>
                        <option value="O+">O+</option>
                        <option value="O-">O-</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                        Nationality <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={officerFormData.nationality}
                        onChange={(e) => setOfficerFormData({ ...officerFormData, nationality: e.target.value })}
                        placeholder="Enter nationality"
                        className="input-premium"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                        Place of Birth
                      </label>
                      <input
                        type="text"
                        value={officerFormData.placeOfBirth}
                        onChange={(e) => setOfficerFormData({ ...officerFormData, placeOfBirth: e.target.value })}
                        placeholder="Enter place of birth"
                        className="input-premium"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                      Medical Conditions
                    </label>
                    <textarea
                      value={officerFormData.medicalConditions}
                      onChange={(e) => setOfficerFormData({ ...officerFormData, medicalConditions: e.target.value })}
                      placeholder="List any medical conditions, allergies, or health concerns"
                      rows={3}
                      className="input-premium resize-none"
                    />
                  </div>
                </div>
              )}

              {/* Contact Information Section */}
              {officerFormSection === "contact" && (
                <div className="space-y-5">
                  <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100">
                    <div className="w-9 h-9 bg-emerald-50 rounded-lg flex items-center justify-center">
                      <Mail className="w-4.5 h-4.5 text-emerald-600" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-slate-800">Contact Information</h3>
                      <p className="text-xs text-slate-400 mt-0.5">Email, phone, and address details</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                        Email Address <span className="text-rose-500">*</span>
                      </label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input
                          type="email"
                          value={officerFormData.email}
                          onChange={(e) => setOfficerFormData({ ...officerFormData, email: e.target.value })}
                          placeholder="officer@example.com"
                          className="input-premium pl-9"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                        Phone Number <span className="text-rose-500">*</span>
                      </label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input
                          type="tel"
                          value={officerFormData.phone}
                          onChange={(e) => setOfficerFormData({ ...officerFormData, phone: e.target.value })}
                          placeholder="+855 12 345 678"
                          className="input-premium pl-9"
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                      Alternative Phone
                    </label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input
                        type="tel"
                        value={officerFormData.alternativePhone}
                        onChange={(e) => setOfficerFormData({ ...officerFormData, alternativePhone: e.target.value })}
                        placeholder="+855 12 345 678"
                        className="input-premium pl-9"
                      />
                    </div>
                  </div>

                  <div className="card-premium p-4 bg-slate-50/30 border-slate-100">
                    <h4 className="text-xs font-bold text-primary mb-3 uppercase tracking-wider">Current Address</h4>
                    <div className="space-y-3">
                      <div>
                        <label className="block text-[10px] font-bold text-slate-400 mb-1 uppercase">
                          Street Address
                        </label>
                        <input
                          type="text"
                          value={officerFormData.currentAddress}
                          onChange={(e) => setOfficerFormData({ ...officerFormData, currentAddress: e.target.value })}
                          placeholder="Street, building, apartment"
                          className="input-premium bg-white"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-[10px] font-bold text-slate-400 mb-1 uppercase">
                            City/District
                          </label>
                          <input
                            type="text"
                            value={officerFormData.currentCity}
                            onChange={(e) => setOfficerFormData({ ...officerFormData, currentCity: e.target.value })}
                            placeholder="City or district"
                            className="input-premium bg-white"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold text-slate-400 mb-1 uppercase">
                            Province/State
                          </label>
                          <input
                            type="text"
                            value={officerFormData.currentProvince}
                            onChange={(e) => setOfficerFormData({ ...officerFormData, currentProvince: e.target.value })}
                            placeholder="Province or state"
                            className="input-premium bg-white"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="card-premium p-4 bg-slate-50/30 border-slate-100">
                    <h4 className="text-xs font-bold text-slate-700 mb-3 uppercase tracking-wider">Permanent Address</h4>
                    <div className="space-y-3">
                      <div>
                        <label className="block text-[10px] font-bold text-slate-400 mb-1 uppercase">
                          Street Address
                        </label>
                        <input
                          type="text"
                          value={officerFormData.permanentAddress}
                          onChange={(e) => setOfficerFormData({ ...officerFormData, permanentAddress: e.target.value })}
                          placeholder="Street, building, apartment"
                          className="input-premium bg-white"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-[10px] font-bold text-slate-400 mb-1 uppercase">
                            City/District
                          </label>
                          <input
                            type="text"
                            value={officerFormData.permanentCity}
                            onChange={(e) => setOfficerFormData({ ...officerFormData, permanentCity: e.target.value })}
                            placeholder="City or district"
                            className="input-premium bg-white"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold text-slate-400 mb-1 uppercase">
                            Province/State
                          </label>
                          <input
                            type="text"
                            value={officerFormData.permanentProvince}
                            onChange={(e) => setOfficerFormData({ ...officerFormData, permanentProvince: e.target.value })}
                            placeholder="Province or state"
                            className="input-premium bg-white"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Identification Documents Section */}
              {officerFormSection === "identification" && (
                <div className="space-y-5">
                  <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100">
                    <div className="w-9 h-9 bg-amber-50 rounded-lg flex items-center justify-center">
                      <CreditCard className="w-4 h-4 text-amber-600" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-slate-800">Identification Documents</h3>
                      <p className="text-xs text-slate-400 mt-0.5">Government-issued ID and verification</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                        ID Type <span className="text-rose-500">*</span>
                      </label>
                      <select
                        value={officerFormData.idType}
                        onChange={(e) => setOfficerFormData({ ...officerFormData, idType: e.target.value })}
                        className="input-premium appearance-none cursor-pointer"
                      >
                        <option value="National ID">National ID Card</option>
                        <option value="Passport">Passport</option>
                        <option value="Driver License">Driver's License</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                        ID Number <span className="text-rose-500">*</span>
                      </label>
                      <div className="relative">
                        <CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input
                          type="text"
                          value={officerFormData.idNumber}
                          onChange={(e) => setOfficerFormData({ ...officerFormData, idNumber: e.target.value })}
                          placeholder="Enter ID number"
                          className="input-premium pl-9 font-mono font-semibold"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                        Passport Number
                      </label>
                      <input
                        type="text"
                        value={officerFormData.passportNumber}
                        onChange={(e) => setOfficerFormData({ ...officerFormData, passportNumber: e.target.value })}
                        placeholder="Enter passport number"
                        className="input-premium font-mono font-semibold"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                        ID Expiry Date
                      </label>
                      <div className="relative">
                        <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input
                          type="date"
                          value={officerFormData.idExpiryDate}
                          onChange={(e) => setOfficerFormData({ ...officerFormData, idExpiryDate: e.target.value })}
                          className="input-premium pl-9 text-slate-600"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="card-premium p-5 bg-amber-50/20 border-amber-100">
                    <div className="flex items-center gap-2 mb-2">
                      <Upload className="w-4 h-4 text-amber-600" />
                      <h4 className="text-xs font-bold text-amber-900 uppercase tracking-wider">Document Upload</h4>
                    </div>
                    <p className="text-xs text-slate-500 mb-3.5 leading-relaxed">
                      Upload scanned copies of ID documents for verification
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <button type="button" className="btn-outline bg-white hover:bg-slate-50 py-2.5 font-semibold cursor-pointer">
                        <FileText className="w-4 h-4 text-slate-400" />
                        Upload ID Front
                      </button>
                      <button type="button" className="btn-outline bg-white hover:bg-slate-50 py-2.5 font-semibold cursor-pointer">
                        <FileText className="w-4 h-4 text-slate-400" />
                        Upload ID Back
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Professional Information Section */}
              {officerFormSection === "professional" && (
                <div className="space-y-5">
                  <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100">
                    <div className="w-9 h-9 bg-purple-50 rounded-lg flex items-center justify-center">
                      <Briefcase className="w-4.5 h-4.5 text-purple-600" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-slate-800">Professional Information</h3>
                      <p className="text-xs text-slate-400 mt-0.5">Role, qualifications, and experience</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                        Role <span className="text-rose-500">*</span>
                      </label>
                      <select
                        value={officerFormData.role}
                        onChange={(e) => setOfficerFormData({ ...officerFormData, role: e.target.value as OfficialRole })}
                        className="input-premium appearance-none cursor-pointer"
                      >
                        <option value="Referee">Referee</option>
                        <option value="Judge">Judge</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                        Grade <span className="text-rose-500">*</span>
                      </label>
                      <select
                        value={officerFormData.grade}
                        onChange={(e) => setOfficerFormData({ ...officerFormData, grade: e.target.value })}
                        className="input-premium appearance-none cursor-pointer"
                      >
                        <option value="National B">National B</option>
                        <option value="National A">National A</option>
                        <option value="International B">International B</option>
                        <option value="International A">International A</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                        Years of Experience <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={officerFormData.experience}
                        onChange={(e) => setOfficerFormData({ ...officerFormData, experience: e.target.value })}
                        placeholder="e.g., 5 years"
                        className="input-premium"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                        License Number
                      </label>
                      <input
                        type="text"
                        value={officerFormData.licenseNumber}
                        onChange={(e) => setOfficerFormData({ ...officerFormData, licenseNumber: e.target.value })}
                        placeholder="Enter license number"
                        className="input-premium font-mono font-semibold"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                      Specialization
                    </label>
                    <input
                      type="text"
                      value={officerFormData.specialization}
                      onChange={(e) => setOfficerFormData({ ...officerFormData, specialization: e.target.value })}
                      placeholder="e.g., Kun Khmer, Muay Thai, Boxing"
                      className="input-premium"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                      Certifications & Qualifications
                    </label>
                    <textarea
                      value={officerFormData.certifications}
                      onChange={(e) => setOfficerFormData({ ...officerFormData, certifications: e.target.value })}
                      placeholder="List all relevant certifications, training courses, and qualifications"
                      rows={4}
                      className="input-premium resize-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                      Current Status
                    </label>
                    <select
                      value={officerFormData.status}
                      onChange={(e) => setOfficerFormData({ ...officerFormData, status: e.target.value as "Available" | "Busy" })}
                      className="input-premium appearance-none cursor-pointer"
                    >
                      <option value="Available">Available</option>
                      <option value="Busy">Busy</option>
                    </select>
                  </div>
                </div>
              )}

              {/* Emergency Contact Section */}
              {officerFormSection === "emergency" && (
                <div className="space-y-5">
                  <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100">
                    <div className="w-9 h-9 bg-red-50 rounded-lg flex items-center justify-center">
                      <Heart className="w-4.5 h-4.5 text-red-600" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-slate-800">Emergency Contact</h3>
                      <p className="text-xs text-slate-400 mt-0.5">Person to contact in case of emergency</p>
                    </div>
                  </div>

                  <div className="card-premium p-5 bg-rose-50/10 border-rose-100 space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                          Contact Name
                        </label>
                        <input
                          type="text"
                          value={officerFormData.emergencyContactName}
                          onChange={(e) => setOfficerFormData({ ...officerFormData, emergencyContactName: e.target.value })}
                          placeholder="Full name"
                          className="input-premium bg-white"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                          Relationship
                        </label>
                        <select
                          value={officerFormData.emergencyRelationship}
                          onChange={(e) => setOfficerFormData({ ...officerFormData, emergencyRelationship: e.target.value })}
                          className="input-premium bg-white appearance-none cursor-pointer"
                        >
                          <option value="">Select relationship</option>
                          <option value="Spouse">Spouse</option>
                          <option value="Parent">Parent</option>
                          <option value="Sibling">Sibling</option>
                          <option value="Child">Child</option>
                          <option value="Friend">Friend</option>
                          <option value="Other">Other</option>
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                          Emergency Phone
                        </label>
                        <div className="relative">
                          <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                          <input
                            type="tel"
                            value={officerFormData.emergencyPhone}
                            onChange={(e) => setOfficerFormData({ ...officerFormData, emergencyPhone: e.target.value })}
                            placeholder="+855 12 345 678"
                            className="input-premium pl-9 bg-white"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                          Emergency Email
                        </label>
                        <div className="relative">
                          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                          <input
                            type="email"
                            value={officerFormData.emergencyEmail}
                            onChange={(e) => setOfficerFormData({ ...officerFormData, emergencyEmail: e.target.value })}
                            placeholder="emergency@example.com"
                            className="input-premium pl-9 bg-white"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                      Additional Notes
                    </label>
                    <textarea
                      value={officerFormData.notes}
                      onChange={(e) => setOfficerFormData({ ...officerFormData, notes: e.target.value })}
                      placeholder="Any additional information, preferences, or special requirements"
                      rows={4}
                      className="input-premium resize-none"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Footer Actions */}
            <div className="border-t border-slate-100 p-5 bg-slate-50/30">
              <div className="flex items-center justify-between gap-4">
                <div className="text-xs text-slate-400 font-medium">
                  <span className="text-rose-500 font-bold">*</span> Required fields
                </div>
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setShowAddOfficerModal(false);
                      setOfficerFormSection("personal");
                    }}
                    className="btn-outline px-6 py-2"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleAddOfficer}
                    className="btn-primary px-6 py-2"
                  >
                    Register Officer
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Officer Detail Modal */}
      {showOfficerDetailModal && selectedOfficer && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
            {/* Header */}
            <div className="px-6 py-5 border-b border-slate-100 bg-white">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                    <Shield className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-slate-900">{selectedOfficer.name}</h2>
                    <p className="text-xs text-slate-400 mt-0.5">
                      {selectedOfficer.role} • {selectedOfficer.grade}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setShowOfficerDetailModal(false);
                    setSelectedOfficer(null);
                  }}
                  className="text-slate-400 hover:bg-slate-50 hover:text-slate-600 p-1.5 rounded-lg transition-all cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {/* Status Banner */}
              <div
                className={clsx(
                  "p-4 rounded-xl border flex items-center gap-3",
                  selectedOfficer.status === "Available"
                    ? "bg-emerald-50/50 border-emerald-200/50 text-emerald-800"
                    : "bg-rose-50/50 border-rose-200/50 text-rose-800"
                )}
              >
                <div
                  className={clsx(
                    "w-8 h-8 rounded-lg flex items-center justify-center shrink-0",
                    selectedOfficer.status === "Available" ? "bg-emerald-500" : "bg-rose-500"
                  )}
                >
                  <CheckCircle className="w-4 h-4 text-white" />
                </div>
                <div>
                  <p className="font-bold text-sm">
                    {selectedOfficer.status === "Available" ? "Available for Assignment" : "Currently Busy"}
                  </p>
                  <p className="text-xs opacity-90 mt-0.5">
                    {selectedOfficer.status === "Available"
                      ? "This officer is active and can be assigned to upcoming batches."
                      : "This officer is currently scheduled or busy."}
                  </p>
                </div>
              </div>

              {/* Professional Information */}
              <div className="card-premium p-0 overflow-hidden">
                <div className="bg-slate-50/50 px-5 py-3.5 border-b border-slate-100 flex items-center gap-2">
                  <Briefcase className="w-4 h-4 text-slate-500" />
                  <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Professional Details
                  </h3>
                </div>
                <div className="p-5 grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                      Officer ID
                    </label>
                    <p className="text-sm font-mono font-semibold text-slate-700 bg-slate-50 border border-slate-150 px-2 py-0.5 rounded inline-block">
                      {selectedOfficer.id}
                    </p>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                      Role
                    </label>
                    <span
                      className={clsx(
                        "badge-premium",
                        selectedOfficer.role === "Referee"
                          ? "bg-indigo-50 text-indigo-700 border-indigo-200/50"
                          : "bg-purple-50 text-purple-700 border-purple-200/50"
                      )}
                    >
                      {selectedOfficer.role}
                    </span>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                      Grade/Certification
                    </label>
                    <span
                      className={clsx(
                        "badge-premium",
                        selectedOfficer.grade.includes("International")
                          ? "bg-amber-50 text-amber-700 border-amber-200/50"
                          : "bg-blue-50 text-blue-700 border-blue-200/50"
                      )}
                    >
                      {selectedOfficer.grade}
                    </span>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                      Experience
                    </label>
                    <p className="text-sm font-semibold text-slate-700">
                      {selectedOfficer.experience}
                    </p>
                  </div>
                </div>
              </div>

              {/* Performance Rating */}
              <div className="card-premium p-0 overflow-hidden">
                <div className="bg-slate-50/50 px-5 py-3.5 border-b border-slate-100 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                    <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                      Performance Rating
                    </h3>
                  </div>
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className={clsx(
                          "w-4 h-4",
                          star <= 4 ? "fill-amber-500 text-amber-500" : "text-slate-200"
                        )}
                      />
                    ))}
                    <span className="text-sm font-bold text-slate-700 ml-1.5">4.0</span>
                  </div>
                </div>
                <div className="p-5">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    <div className="text-center p-2.5 bg-blue-50/50 border border-blue-100/50 rounded-xl">
                      <div className="text-lg font-bold text-blue-600 mb-0.5">9.2</div>
                      <div className="text-[9px] font-bold text-slate-500 uppercase tracking-wide">Professionalism</div>
                    </div>
                    <div className="text-center p-2.5 bg-green-50/50 border border-green-100/50 rounded-xl">
                      <div className="text-lg font-bold text-green-600 mb-0.5">9.5</div>
                      <div className="text-[9px] font-bold text-slate-500 uppercase tracking-wide">Accuracy</div>
                    </div>
                    <div className="text-center p-2.5 bg-purple-50/50 border border-purple-100/50 rounded-xl">
                      <div className="text-lg font-bold text-purple-600 mb-0.5">8.8</div>
                      <div className="text-[9px] font-bold text-slate-500 uppercase tracking-wide">Punctuality</div>
                    </div>
                    <div className="text-center p-2.5 bg-amber-50/50 border border-amber-100/50 rounded-xl">
                      <div className="text-lg font-bold text-amber-600 mb-0.5">9.0</div>
                      <div className="text-[9px] font-bold text-slate-500 uppercase tracking-wide">Communication</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Assignment Statistics */}
              <div className="card-premium p-0 overflow-hidden">
                <div className="bg-slate-50/50 px-5 py-3.5 border-b border-slate-100 flex items-center gap-2">
                  <Award className="w-4 h-4 text-slate-500" />
                  <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Assignment Statistics
                  </h3>
                </div>
                <div className="p-5">
                  <div className="grid grid-cols-3 gap-3 mb-5">
                    <div className="bg-slate-50 border border-slate-100 p-3 rounded-xl text-center">
                      <div className="text-2xl font-bold text-primary mb-0.5">24</div>
                      <div className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">
                        Total Events
                      </div>
                    </div>

                    <div className="bg-slate-50 border border-slate-100 p-3 rounded-xl text-center">
                      <div className="text-2xl font-bold text-emerald-600 mb-0.5">22</div>
                      <div className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">
                        Completed
                      </div>
                    </div>

                    <div className="bg-slate-50 border border-slate-100 p-3 rounded-xl text-center">
                      <div className="text-2xl font-bold text-amber-600 mb-0.5">2</div>
                      <div className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">
                        Upcoming
                      </div>
                    </div>
                  </div>

                  {/* Recent Assignments List */}
                  <div className="space-y-2">
                    <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Recent Assignments</h4>
                    {[
                      { event: "KKF Championship 2026 - Batch 003", date: "March 15, 2026", status: "Completed" },
                      { event: "Regional Tournament - Batch 002", date: "March 8, 2026", status: "Completed" },
                      { event: "National Finals - Batch 001", date: "March 1, 2026", status: "Completed" },
                    ].map((assignment, idx) => (
                      <div key={idx} className="p-3 bg-slate-50/50 rounded-xl border border-slate-100 hover:border-primary/30 hover:bg-white transition-all">
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <p className="text-xs font-semibold text-slate-700">{assignment.event}</p>
                            <p className="text-[10px] font-medium text-slate-400 mt-0.5">{assignment.date}</p>
                          </div>
                          <span className="badge-premium badge-emerald text-[9px]">
                            {assignment.status}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Contact Information Placeholder */}
              <div className="card-premium p-0 overflow-hidden">
                <div className="bg-slate-50/50 px-5 py-3.5 border-b border-slate-100 flex items-center gap-2">
                  <Mail className="w-4 h-4 text-slate-500" />
                  <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Contact Information
                  </h3>
                </div>
                <div className="p-5 space-y-3.5">
                  <div className="flex items-start gap-3">
                    <Mail className="w-4 h-4 text-slate-400 mt-0.5" />
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">
                        Email Address
                      </label>
                      <p className="text-sm font-semibold text-slate-700">
                        {selectedOfficer.name.toLowerCase().replace(/\s+/g, ".")}@kkf.org.kh
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <Phone className="w-4 h-4 text-slate-400 mt-0.5" />
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">
                        Phone Number
                      </label>
                      <p className="text-sm font-semibold text-slate-700">
                        +855 12 345 678
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Certifications & Qualifications */}
              <div className="card-premium p-0 overflow-hidden">
                <div className="bg-slate-50/50 px-5 py-3.5 border-b border-slate-100 flex items-center gap-2">
                  <Award className="w-4 h-4 text-slate-500" />
                  <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Certifications & Qualifications
                  </h3>
                </div>
                <div className="p-5">
                  <div className="flex flex-wrap gap-2">
                    {[
                      { name: `KKF ${selectedOfficer.role} Certification`, level: "Advanced", color: "bg-blue-50/80 text-[#0A3D91] border-blue-200/50" },
                      { name: "International Sports Official", level: "Level A", color: "bg-purple-50/80 text-purple-700 border-purple-200/50" },
                      { name: "First Aid & CPR", level: "Certified", color: "bg-red-50/80 text-[#C8102E] border-red-200/50" },
                      { name: "Combat Sports Safety", level: "Expert", color: "bg-emerald-50/80 text-emerald-700 border-emerald-200/50" },
                      { name: "Anti-Doping Compliance", level: "Certified", color: "bg-amber-50/80 text-amber-700 border-amber-200/50" },
                    ].map((cert, idx) => (
                      <div
                        key={idx}
                        className={clsx("badge-premium flex flex-col items-start p-2.5 rounded-lg border", cert.color)}
                      >
                        <span className="text-[10px] font-bold uppercase leading-tight">{cert.name}</span>
                        <span className="text-[9px] opacity-75 mt-0.5">{cert.level}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Performance Notes */}
              <div className="card-premium p-0 overflow-hidden">
                <div className="bg-slate-50/50 px-5 py-3.5 border-b border-slate-100 flex items-center gap-2">
                  <FileText className="w-4 h-4 text-slate-500" />
                  <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Performance Notes
                  </h3>
                </div>
                <div className="p-5">
                  <p className="text-xs text-slate-500 leading-relaxed font-medium">
                    Excellent performance record with consistent professionalism. Highly
                    recommended for major championship events. Known for fair judgment and
                    adherence to KKF regulations.
                  </p>
                </div>
              </div>
            </div>

            {/* Footer Actions */}
            <div className="border-t border-slate-100 p-5 bg-slate-50/30 flex items-center justify-between gap-3">
              <button
                onClick={() => {
                  toast.success(`${selectedOfficer.name} assigned to event!`);
                }}
                className="btn-primary py-2.5 px-5 font-semibold"
              >
                <CalendarClock className="w-4 h-4" />
                Assign to Event
              </button>
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    toast.info("Edit officer functionality coming soon!");
                  }}
                  className="btn-outline py-2.5 px-4 font-semibold"
                >
                  <Edit2 className="w-4 h-4" />
                  Edit
                </button>
                <button
                  onClick={() => {
                    if (confirm(`Are you sure you want to remove ${selectedOfficer.name}?`)) {
                      toast.success(`${selectedOfficer.name} removed!`);
                      setShowOfficerDetailModal(false);
                      setSelectedOfficer(null);
                    }
                  }}
                  className="btn-secondary py-2.5 px-4 font-semibold"
                >
                  <Trash2 className="w-4 h-4" />
                  Remove
                </button>
                <button
                  onClick={() => {
                    setShowOfficerDetailModal(false);
                    setSelectedOfficer(null);
                  }}
                  className="btn-outline py-2.5 px-4 font-semibold"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* User Detail Side-Drawer */}
      {showDetailDrawer && selectedDrawerUser && (
        <div className="fixed inset-0 z-50 overflow-hidden flex justify-end">
          {/* Overlay backdrop */}
          <div
            className="fixed inset-0 bg-black/40 backdrop-blur-xs transition-opacity duration-300 animate-in fade-in duration-200"
            onClick={() => {
              setShowDetailDrawer(false);
              setSelectedDrawerUser(null);
            }}
          />
          {/* Drawer container */}
          <div className="relative max-w-xl w-full bg-white shadow-2xl flex flex-col z-10 border-l border-border h-full animate-in slide-in-from-right duration-250">
            {/* Header */}
            <div className="px-6 py-5 border-b border-border flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <Shield className="w-5 h-5 text-primary" />
                <h2 className="text-lg font-bold text-foreground">User Profile Detail</h2>
              </div>
              <button
                onClick={() => {
                  setShowDetailDrawer(false);
                  setSelectedDrawerUser(null);
                }}
                className="text-muted-foreground hover:bg-muted/80 p-2 rounded-lg transition-all"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {/* Profile Card */}
              <div className="card-premium flex flex-col items-center text-center relative overflow-hidden p-6 shadow-sm">
                <div className="absolute top-4 right-4">
                  {selectedDrawerUser.status === "active" ? (
                    <span className="badge-premium badge-emerald text-xs">
                      <span className="badge-dot bg-emerald-500" />
                      Active
                    </span>
                  ) : selectedDrawerUser.status === "suspended" ? (
                    <span className="badge-premium badge-red text-xs">
                      <span className="badge-dot bg-red-600" />
                      Suspended
                    </span>
                  ) : (
                    <span className="badge-premium bg-slate-50 text-slate-600 border-slate-200 text-xs">
                      <span className="badge-dot bg-slate-400" />
                      Inactive
                    </span>
                  )}
                </div>
                <img
                  src={selectedDrawerUser.avatar || "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=150"}
                  alt={selectedDrawerUser.fullName}
                  className="w-24 h-24 rounded-2xl border-4 border-slate-50 shadow-md object-cover mb-4"
                />
                <h3 className="text-xl font-bold text-foreground">{selectedDrawerUser.fullName}</h3>
                <p className="text-sm text-muted-foreground mt-1">@{selectedDrawerUser.username}</p>
                  <span className={`badge-premium px-3 py-1 rounded-full text-xs font-semibold mt-3.5 ${dynamicRoles[selectedDrawerUser.role]?.color || "bg-indigo-50 text-indigo-700 border-indigo-200"}`}>
                    <Shield className="w-3.5 h-3.5" />
                    {dynamicRoles[selectedDrawerUser.role]?.label || selectedDrawerUser.role}
                  </span>
              </div>

              {/* Contact & Organization Details */}
              <div className="card-premium p-0 overflow-hidden shadow-sm">
                <div className="px-5 py-4 border-b border-border bg-slate-50/50 flex items-center gap-2">
                  <User className="w-4 h-4 text-primary" />
                  <h4 className="font-semibold text-xs text-slate-700 uppercase tracking-wider">Account Details</h4>
                </div>
                <div className="p-5 space-y-4">
                  <div className="flex items-start gap-3">
                    <Mail className="w-4 h-4 text-slate-400 mt-1" />
                    <div>
                      <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Email Address</p>
                      <a href={`mailto:${selectedDrawerUser.email}`} className="text-sm font-medium text-primary hover:underline">
                        {selectedDrawerUser.email}
                      </a>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <Phone className="w-4 h-4 text-slate-400 mt-1" />
                    <div>
                      <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Phone Number</p>
                      {selectedDrawerUser.phone ? (
                        <a href={`tel:${selectedDrawerUser.phone}`} className="text-sm font-medium text-slate-800">
                          {selectedDrawerUser.phone}
                        </a>
                      ) : (
                        <p className="text-sm font-medium text-slate-400 italic">Not Provided</p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <Building2 className="w-4 h-4 text-slate-400 mt-1" />
                    <div>
                      <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Organization / Division</p>
                      <p className="text-sm font-medium text-slate-800">
                        {selectedDrawerUser.organization || "N/A"}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <Calendar className="w-4 h-4 text-slate-400 mt-1" />
                    <div>
                      <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Created At</p>
                      <p className="text-sm font-medium text-slate-800">
                        {selectedDrawerUser.createdAt ? new Date(selectedDrawerUser.createdAt).toLocaleDateString("en-GB") : "N/A"}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Custom / Active Permissions Summary */}
              <div className="card-premium p-0 overflow-hidden shadow-sm">
                <div className="px-5 py-4 border-b border-border bg-slate-50/50 flex items-center gap-2">
                  <Shield className="w-4 h-4 text-primary" />
                  <h4 className="font-semibold text-xs text-slate-700 uppercase tracking-wider">Active Permissions & Features</h4>
                </div>
                <div className="p-5 space-y-4 max-h-[350px] overflow-y-auto">
                  {PERMISSION_GROUPS.map((group) => {
                    const activePermsInGroup = group.permissions.filter(p => (selectedDrawerUser.permissions || []).includes(p.key));
                    if (activePermsInGroup.length === 0) return null;
                    return (
                      <div key={group.title} className="space-y-2">
                        <div className="text-[10px] font-bold text-slate-700 uppercase tracking-wider border-b border-slate-100 pb-1">
                          {group.title}
                        </div>
                        <div className="grid grid-cols-1 gap-1.5">
                          {activePermsInGroup.map((perm) => (
                            <div key={perm.key} className="flex items-center gap-2 bg-slate-50 px-3 py-2 rounded-lg border border-slate-100">
                              <div className="w-1.5 h-1.5 bg-primary rounded-full"></div>
                              <div className="flex-1 flex justify-between items-center">
                                <span className="text-xs font-medium text-slate-700">{perm.label}</span>
                                <span className="text-[9px] font-mono text-slate-400 bg-white px-1.5 py-0.5 rounded border border-slate-200">{perm.key}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                  {(!selectedDrawerUser.permissions || selectedDrawerUser.permissions.length === 0) && (
                    <p className="text-xs text-slate-400 italic text-center py-4">No active permissions assigned to this user account.</p>
                  )}
                </div>
              </div>
            </div>

            {/* Footer Quick Actions */}
            <div className="border-t border-border p-6 bg-slate-50/50 flex flex-col gap-3">
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => handleToggleStatus(selectedDrawerUser)}
                  className={clsx(
                    "w-full btn-outline flex items-center justify-center gap-2 py-3 text-slate-700",
                    selectedDrawerUser.status === "active" ? "hover:bg-amber-50 hover:text-amber-700 hover:border-amber-200" : "hover:bg-emerald-50 hover:text-emerald-700 hover:border-emerald-200"
                  )}
                >
                  {selectedDrawerUser.status === "active" ? (
                    <>
                      <Lock className="w-4 h-4" />
                      Deactivate
                    </>
                  ) : (
                    <>
                      <Unlock className="w-4 h-4" />
                      Activate
                    </>
                  )}
                </button>
                <button
                  onClick={() => {
                    openEditModal(selectedDrawerUser);
                  }}
                  className="w-full btn-primary flex items-center justify-center gap-2 py-3"
                >
                  <Edit2 className="w-4 h-4" />
                  Edit User
                </button>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => {
                    toast.success(`✅ Password reset link generated and sent to ${selectedDrawerUser.email}`);
                  }}
                  className="w-full btn-outline flex items-center justify-center gap-2 py-3"
                >
                  <Unlock className="w-4 h-4 text-slate-400" />
                  Reset Password
                </button>
                <button
                  onClick={() => {
                    setSelectedUser(selectedDrawerUser);
                    setShowDeleteConfirm(true);
                  }}
                  className="w-full btn-secondary flex items-center justify-center gap-2 py-3"
                >
                  <Trash2 className="w-4 h-4" />
                  Delete User
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}