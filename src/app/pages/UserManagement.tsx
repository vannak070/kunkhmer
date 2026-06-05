import { useState } from "react";
import { useNavigate } from "react-router";
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
} from "lucide-react";
import { MOCK_USERS, ROLE_LABELS, ROLE_PERMISSIONS, type User as UserType, type UserRole } from "../data/users";
import { type Official } from "../data/officials";
import { usePermissions } from "../hooks/usePermissions";
import { toast } from "sonner";
import { clsx } from "clsx";
import { getAllOfficials, addJudge, addReferee } from "../utils/officialsStore";

type TabType = "system" | "officers";
type OfficialRole = "Referee" | "Judge";

export function UserManagement() {
  const permissions = usePermissions();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<TabType>("system");
  const [users, setUsers] = useState<UserType[]>(MOCK_USERS);
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState<UserRole | "all">("all");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "inactive" | "suspended">("all");
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserType | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

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
        <div className="bg-red-50 border-2 border-red-200 rounded-2xl p-8 text-center">
          <AlertCircle className="w-12 h-12 text-[#C8102E] mx-auto mb-4" />
          <h2 className="text-2xl font-black text-[#C8102E] mb-2">Access Denied</h2>
          <p className="text-[#707070] font-medium">You don't have permission to access user management.</p>
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
      permissions: ROLE_PERMISSIONS[formData.role as UserRole],
    };

    setUsers([...users, newUser]);
    toast.success(`User ${newUser.fullName} created successfully`);
    setShowAddModal(false);
    resetForm();
  };

  // Handle edit user
  const handleEditUser = () => {
    if (!permissions.hasPermission("users.edit")) {
      toast.error("You don't have permission to edit users");
      return;
    }

    if (!selectedUser) return;

    const updatedUsers = users.map((u) =>
      u.id === selectedUser.id
        ? {
            ...u,
            ...formData,
            permissions: ROLE_PERMISSIONS[formData.role as UserRole],
          }
        : u
    );

    setUsers(updatedUsers);
    toast.success(`User ${selectedUser.fullName} updated successfully`);
    setShowEditModal(false);
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
    setSelectedUser(null);
  };

  // Handle toggle user status
  const handleToggleStatus = (user: User) => {
    if (!permissions.hasPermission("users.edit")) {
      toast.error("You don't have permission to change user status");
      return;
    }

    const newStatus = user.status === "active" ? "inactive" : "active";
    const updatedUsers = users.map((u) => (u.id === user.id ? { ...u, status: newStatus } : u));

    setUsers(updatedUsers);
    toast.success(`User ${user.fullName} ${newStatus === "active" ? "activated" : "deactivated"}`);
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
    });
  };

  // Open edit modal
  const openEditModal = (user: User) => {
    setSelectedUser(user);
    setFormData({
      username: user.username,
      email: user.email,
      password: user.password,
      fullName: user.fullName,
      role: user.role,
      phone: user.phone,
      organization: user.organization,
      status: user.status,
    });
    setShowEditModal(true);
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
    <div className="min-h-screen bg-gradient-to-br from-[#F4F5F8] via-white to-[#F9FAFB]">
      {/* Enhanced Header with Gradient */}
      <div className="bg-gradient-to-r from-[#0A3D91] via-[#0B4AAF] to-[#0A3D91] shadow-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
            <div>
              <h1 className="text-5xl font-black text-white tracking-tight uppercase flex items-center gap-4">
                <div className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center">
                  <Users className="w-8 h-8 text-white" />
                </div>
                User Management
              </h1>
              <p className="text-white/90 mt-3 font-semibold text-lg">Manage system users and officer assignments</p>
            </div>
            {activeTab === "system" && permissions.hasPermission("users.create") && (
              <button
                onClick={() => {
                  resetForm();
                  setShowAddModal(true);
                }}
                className="inline-flex items-center gap-2 bg-white text-[#0A3D91] hover:bg-white/95 px-6 py-3.5 rounded-xl font-black transition-all shadow-lg hover:shadow-xl hover:scale-105"
              >
                <UserPlus className="w-5 h-5" />
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
                className="inline-flex items-center gap-2 bg-white text-[#C8102E] hover:bg-white/95 px-6 py-3.5 rounded-xl font-black transition-all shadow-lg hover:shadow-xl hover:scale-105"
              >
                <Plus className="w-5 h-5" />
                Add New Officer
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Main Content */}
        <div className="mb-8">

          {/* Enhanced Tabs */}
          <div className="flex gap-3 mb-8 bg-white p-2 rounded-2xl shadow-lg border-2 border-[#E0E0E0]">
            <button
              onClick={() => setActiveTab("system")}
              className={clsx(
                "flex-1 flex items-center justify-center gap-3 px-6 py-4 rounded-xl font-black transition-all duration-200",
                activeTab === "system"
                  ? "bg-gradient-to-r from-[#0A3D91] to-[#082F6E] text-white shadow-lg scale-[1.02]"
                  : "text-[#707070] hover:bg-[#F4F5F8] hover:text-[#0A3D91]"
              )}
            >
              <Users className="w-5 h-5" />
              <div className="flex flex-col items-start">
                <span>System Users</span>
                <span className={clsx("text-xs font-medium", activeTab === "system" ? "text-white/80" : "text-[#B0B0B0]")}>
                  {systemStats.total} users
                </span>
              </div>
            </button>
            <button
              onClick={() => setActiveTab("officers")}
              className={clsx(
                "flex-1 flex items-center justify-center gap-3 px-6 py-4 rounded-xl font-black transition-all duration-200",
                activeTab === "officers"
                  ? "bg-gradient-to-r from-[#0A3D91] to-[#082F6E] text-white shadow-lg scale-[1.02]"
                  : "text-[#707070] hover:bg-[#F4F5F8] hover:text-[#0A3D91]"
              )}
            >
              <Shield className="w-5 h-5" />
              <div className="flex flex-col items-start">
                <span>Officer Users</span>
                <span className={clsx("text-xs font-medium", activeTab === "officers" ? "text-white/80" : "text-[#B0B0B0]")}>
                  {officerStats.total} officers
                </span>
              </div>
            </button>
          </div>

          {/* Enhanced Stats Cards - System Users */}
          {activeTab === "system" && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <div className="group bg-gradient-to-br from-white to-blue-50 rounded-2xl p-6 shadow-lg border-2 border-blue-100 hover:shadow-xl hover:scale-105 transition-all duration-300">
                <div className="flex items-start justify-between mb-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-md">
                    <Users className="w-6 h-6 text-white" />
                  </div>
                  <div className="text-sm font-black text-blue-600 uppercase tracking-wide bg-blue-100 px-3 py-1 rounded-lg">Total</div>
                </div>
                <div className="text-4xl font-black text-[#1A1A24] mb-1">{systemStats.total}</div>
                <div className="text-sm font-bold text-[#707070]">System Users</div>
              </div>

              <div className="group bg-gradient-to-br from-white to-green-50 rounded-2xl p-6 shadow-lg border-2 border-green-100 hover:shadow-xl hover:scale-105 transition-all duration-300">
                <div className="flex items-start justify-between mb-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center shadow-md">
                    <CheckCircle className="w-6 h-6 text-white" />
                  </div>
                  <div className="text-sm font-black text-green-600 uppercase tracking-wide bg-green-100 px-3 py-1 rounded-lg">Active</div>
                </div>
                <div className="text-4xl font-black text-[#1A1A24] mb-1">{systemStats.active}</div>
                <div className="text-sm font-bold text-[#707070]">Online Users</div>
              </div>

              <div className="group bg-gradient-to-br from-white to-gray-50 rounded-2xl p-6 shadow-lg border-2 border-gray-200 hover:shadow-xl hover:scale-105 transition-all duration-300">
                <div className="flex items-start justify-between mb-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-gray-400 to-gray-500 rounded-xl flex items-center justify-center shadow-md">
                    <XCircle className="w-6 h-6 text-white" />
                  </div>
                  <div className="text-sm font-black text-gray-600 uppercase tracking-wide bg-gray-100 px-3 py-1 rounded-lg">Offline</div>
                </div>
                <div className="text-4xl font-black text-[#1A1A24] mb-1">{systemStats.inactive}</div>
                <div className="text-sm font-bold text-[#707070]">Inactive Users</div>
              </div>

              <div className="group bg-gradient-to-br from-white to-red-50 rounded-2xl p-6 shadow-lg border-2 border-red-100 hover:shadow-xl hover:scale-105 transition-all duration-300">
                <div className="flex items-start justify-between mb-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-red-600 rounded-xl flex items-center justify-center shadow-md">
                    <AlertCircle className="w-6 h-6 text-white" />
                  </div>
                  <div className="text-sm font-black text-red-600 uppercase tracking-wide bg-red-100 px-3 py-1 rounded-lg">Blocked</div>
                </div>
                <div className="text-4xl font-black text-[#1A1A24] mb-1">{systemStats.suspended}</div>
                <div className="text-sm font-bold text-[#707070]">Suspended Users</div>
              </div>
            </div>
          )}

          {/* Enhanced Stats Cards - Officers */}
          {activeTab === "officers" && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <div className="group bg-gradient-to-br from-white to-[#0A3D91]/5 rounded-2xl p-6 shadow-lg border-2 border-[#0A3D91]/20 hover:shadow-xl hover:scale-105 transition-all duration-300">
                <div className="flex items-start justify-between mb-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-[#0A3D91] to-[#082F6E] rounded-xl flex items-center justify-center shadow-md">
                    <Shield className="w-6 h-6 text-white" />
                  </div>
                  <div className="text-sm font-black text-[#0A3D91] uppercase tracking-wide bg-[#0A3D91]/10 px-3 py-1 rounded-lg">Total</div>
                </div>
                <div className="text-4xl font-black text-[#1A1A24] mb-1">{officerStats.total}</div>
                <div className="text-sm font-bold text-[#707070]">Total Officers</div>
              </div>

              <div className="group bg-gradient-to-br from-white to-indigo-50 rounded-2xl p-6 shadow-lg border-2 border-indigo-100 hover:shadow-xl hover:scale-105 transition-all duration-300">
                <div className="flex items-start justify-between mb-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-md">
                    <UserCheck className="w-6 h-6 text-white" />
                  </div>
                  <div className="text-sm font-black text-indigo-600 uppercase tracking-wide bg-indigo-100 px-3 py-1 rounded-lg">Refs</div>
                </div>
                <div className="text-4xl font-black text-[#1A1A24] mb-1">{officerStats.referees}</div>
                <div className="text-sm font-bold text-[#707070]">Referees</div>
              </div>

              <div className="group bg-gradient-to-br from-white to-purple-50 rounded-2xl p-6 shadow-lg border-2 border-purple-100 hover:shadow-xl hover:scale-105 transition-all duration-300">
                <div className="flex items-start justify-between mb-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center shadow-md">
                    <Award className="w-6 h-6 text-white" />
                  </div>
                  <div className="text-sm font-black text-purple-600 uppercase tracking-wide bg-purple-100 px-3 py-1 rounded-lg">Judges</div>
                </div>
                <div className="text-4xl font-black text-[#1A1A24] mb-1">{officerStats.judges}</div>
                <div className="text-sm font-bold text-[#707070]">Judges</div>
              </div>

              <div className="group bg-gradient-to-br from-white to-emerald-50 rounded-2xl p-6 shadow-lg border-2 border-emerald-100 hover:shadow-xl hover:scale-105 transition-all duration-300">
                <div className="flex items-start justify-between mb-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl flex items-center justify-center shadow-md">
                    <CheckCircle className="w-6 h-6 text-white" />
                  </div>
                  <div className="text-sm font-black text-emerald-600 uppercase tracking-wide bg-emerald-100 px-3 py-1 rounded-lg">Ready</div>
                </div>
                <div className="text-4xl font-black text-[#1A1A24] mb-1">{officerStats.available}</div>
                <div className="text-sm font-bold text-[#707070]">Available Now</div>
              </div>
            </div>
          )}
        </div>

        {/* Enhanced Search & Filter - System Users */}
        {activeTab === "system" && (
          <div className="bg-white rounded-2xl shadow-lg p-6 mb-6 border-2 border-[#E0E0E0]">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="relative group">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-[#707070] group-focus-within:text-[#0A3D91] transition-colors" />
                <input
                  type="text"
                  placeholder="Search users by name or email..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-12 pr-4 py-3.5 bg-[#F4F5F8] border-2 border-[#E0E0E0] rounded-xl font-semibold text-[#1A1A24] placeholder-[#B0B0B0] focus:outline-none focus:border-[#0A3D91] focus:ring-2 focus:ring-[#0A3D91]/20 transition-all"
                />
              </div>

              <div className="relative">
                <Shield className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-[#707070]" />
                <select
                  value={roleFilter}
                  onChange={(e) => setRoleFilter(e.target.value as UserRole | "all")}
                  className="w-full pl-12 pr-4 py-3.5 bg-[#F4F5F8] border-2 border-[#E0E0E0] rounded-xl font-bold text-[#1A1A24] focus:outline-none focus:border-[#0A3D91] focus:ring-2 focus:ring-[#0A3D91]/20 appearance-none cursor-pointer transition-all hover:border-[#0A3D91]/50"
                >
                  <option value="all">All Roles</option>
                  <option value="kkf_super_admin">Super Admin</option>
                  <option value="kkf_officer">KKF Officer</option>
                </select>
              </div>

              <div className="relative">
                <Filter className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-[#707070]" />
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value as any)}
                  className="w-full pl-12 pr-4 py-3.5 bg-[#F4F5F8] border-2 border-[#E0E0E0] rounded-xl font-bold text-[#1A1A24] focus:outline-none focus:border-[#0A3D91] focus:ring-2 focus:ring-[#0A3D91]/20 appearance-none cursor-pointer transition-all hover:border-[#0A3D91]/50"
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

        {/* Enhanced Search & Filter - Officers */}
        {activeTab === "officers" && (
          <div className="bg-white rounded-2xl shadow-lg p-6 mb-6 border-2 border-[#E0E0E0]">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="relative group">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-[#707070] group-focus-within:text-[#0A3D91] transition-colors" />
                <input
                  type="text"
                  placeholder="Search officers by name or ID..."
                  value={officerSearch}
                  onChange={(e) => setOfficerSearch(e.target.value)}
                  className="w-full pl-12 pr-4 py-3.5 bg-[#F4F5F8] border-2 border-[#E0E0E0] rounded-xl font-semibold text-[#1A1A24] placeholder-[#B0B0B0] focus:outline-none focus:border-[#0A3D91] focus:ring-2 focus:ring-[#0A3D91]/20 transition-all"
                />
              </div>

              <div className="relative">
                <Shield className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-[#707070]" />
                <select
                  value={officerRoleFilter}
                  onChange={(e) => setOfficerRoleFilter(e.target.value as any)}
                  className="w-full pl-12 pr-4 py-3.5 bg-[#F4F5F8] border-2 border-[#E0E0E0] rounded-xl font-bold text-[#1A1A24] focus:outline-none focus:border-[#0A3D91] focus:ring-2 focus:ring-[#0A3D91]/20 appearance-none cursor-pointer transition-all hover:border-[#0A3D91]/50"
                >
                  <option value="all">All Roles</option>
                  <option value="Referee">Referees</option>
                  <option value="Judge">Judges</option>
                </select>
              </div>

              <div className="relative">
                <Filter className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-[#707070]" />
                <select
                  value={officerStatusFilter}
                  onChange={(e) => setOfficerStatusFilter(e.target.value as any)}
                  className="w-full pl-12 pr-4 py-3.5 bg-[#F4F5F8] border-2 border-[#E0E0E0] rounded-xl font-bold text-[#1A1A24] focus:outline-none focus:border-[#0A3D91] focus:ring-2 focus:ring-[#0A3D91]/20 appearance-none cursor-pointer transition-all hover:border-[#0A3D91]/50"
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
        {activeTab === "system" && (
          <div className="bg-white rounded-2xl shadow-lg border-2 border-[#E0E0E0] overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gradient-to-r from-[#0A3D91] via-[#0B4AAF] to-[#0A3D91]">
                  <tr>
                    <th className="px-6 py-5 text-left text-sm font-black text-white uppercase tracking-wider">User Details</th>
                    <th className="px-6 py-5 text-left text-sm font-black text-white uppercase tracking-wider">Role</th>
                    <th className="px-6 py-5 text-left text-sm font-black text-white uppercase tracking-wider">Organization</th>
                    <th className="px-6 py-5 text-left text-sm font-black text-white uppercase tracking-wider">Status</th>
                    <th className="px-6 py-5 text-left text-sm font-black text-white uppercase tracking-wider">Last Login</th>
                    <th className="px-6 py-5 text-right text-sm font-black text-white uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E0E0E0]">
                  {filteredUsers.length > 0 ? (
                    filteredUsers.map((user) => {
                      const roleInfo = ROLE_LABELS[user.role];
                      return (
                        <tr key={user.id} className="hover:bg-gradient-to-r hover:from-[#F9FAFB] hover:to-white transition-all duration-200 group">
                          <td className="px-6 py-5">
                            <div className="flex items-center gap-4">
                              <div className="relative">
                                <img
                                  src={user.avatar || "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=150"}
                                  alt={user.fullName}
                                  className="w-14 h-14 rounded-xl border-2 border-[#E0E0E0] group-hover:border-[#0A3D91] object-cover shadow-sm transition-all"
                                />
                                <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-white rounded-full"></div>
                              </div>
                              <div>
                                <p className="font-black text-[#1A1A24] text-base group-hover:text-[#0A3D91] transition-colors">{user.fullName}</p>
                                <p className="text-sm text-[#707070] font-semibold flex items-center gap-1.5 mt-1">
                                  <Mail className="w-3.5 h-3.5" />
                                  {user.email}
                                </p>
                                {user.phone && (
                                  <p className="text-sm text-[#707070] font-semibold flex items-center gap-1.5 mt-0.5">
                                    <Phone className="w-3.5 h-3.5" />
                                    {user.phone}
                                  </p>
                                )}
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-5">
                            <span className={`inline-flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-black border-2 shadow-sm ${roleInfo.color}`}>
                              <Shield className="w-4 h-4" />
                              {roleInfo.label}
                            </span>
                          </td>
                          <td className="px-6 py-5">
                            <div className="flex items-center gap-2 text-sm text-[#1A1A24] font-bold bg-[#F4F5F8] px-3 py-2 rounded-lg">
                              <Building2 className="w-4 h-4 text-[#0A3D91]" />
                              {user.organization || "N/A"}
                            </div>
                          </td>
                          <td className="px-6 py-5">
                            {user.status === "active" ? (
                              <span className="inline-flex items-center gap-2 bg-gradient-to-r from-green-100 to-emerald-100 text-green-700 border-2 border-green-200 px-3 py-2 rounded-xl text-sm font-black shadow-sm">
                                <CheckCircle className="w-4 h-4" />
                                Active
                              </span>
                            ) : user.status === "suspended" ? (
                              <span className="inline-flex items-center gap-2 bg-gradient-to-r from-red-100 to-rose-100 text-red-700 border-2 border-red-200 px-3 py-2 rounded-xl text-sm font-black shadow-sm">
                                <AlertCircle className="w-4 h-4" />
                                Suspended
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-2 bg-gradient-to-r from-gray-100 to-slate-100 text-gray-700 border-2 border-gray-200 px-3 py-2 rounded-xl text-sm font-black shadow-sm">
                                <XCircle className="w-4 h-4" />
                                Inactive
                              </span>
                            )}
                          </td>
                          <td className="px-6 py-5">
                            {user.lastLogin ? (
                              <div className="flex items-center gap-2 text-sm text-[#707070] font-bold bg-[#F4F5F8] px-3 py-2 rounded-lg">
                                <Clock className="w-4 h-4 text-[#0A3D91]" />
                                {new Date(user.lastLogin).toLocaleDateString("en-GB")}
                              </div>
                            ) : (
                              <span className="text-sm text-[#B0B0B0] font-semibold italic">Never logged in</span>
                            )}
                          </td>
                          <td className="px-6 py-5">
                            <div className="flex items-center justify-end gap-2">
                              {permissions.hasPermission("users.edit") && (
                                <>
                                  <button
                                    onClick={() => handleToggleStatus(user)}
                                    className={`p-2.5 rounded-xl font-bold transition-all shadow-md hover:shadow-lg hover:scale-110 ${
                                      user.status === "active"
                                        ? "bg-gradient-to-br from-gray-400 to-gray-500 hover:from-gray-500 hover:to-gray-600 text-white"
                                        : "bg-gradient-to-br from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white"
                                    }`}
                                    title={user.status === "active" ? "Deactivate" : "Activate"}
                                  >
                                    {user.status === "active" ? <Lock className="w-4 h-4" /> : <Unlock className="w-4 h-4" />}
                                  </button>
                                  <button
                                    onClick={() => openEditModal(user)}
                                    className="p-2.5 bg-gradient-to-br from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-xl transition-all shadow-md hover:shadow-lg hover:scale-110"
                                    title="Edit User"
                                  >
                                    <Edit2 className="w-4 h-4" />
                                  </button>
                                </>
                              )}
                              {permissions.hasPermission("users.delete") && (
                                <button
                                  onClick={() => {
                                    setSelectedUser(user);
                                    setShowDeleteConfirm(true);
                                  }}
                                  className="p-2.5 bg-gradient-to-br from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white rounded-xl transition-all shadow-md hover:shadow-lg hover:scale-110"
                                  title="Delete User"
                                >
                                  <Trash2 className="w-4 h-4" />
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
                          <div className="w-20 h-20 bg-gradient-to-br from-[#0A3D91]/10 to-[#0A3D91]/5 rounded-2xl flex items-center justify-center mb-4">
                            <Users className="w-10 h-10 text-[#0A3D91]/40" />
                          </div>
                          <p className="text-xl text-[#1A1A24] font-black mb-2">No Users Found</p>
                          <p className="text-sm text-[#707070] font-semibold">Try adjusting your search or filter criteria</p>
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
          <div className="bg-white rounded-2xl shadow-lg border-2 border-[#E0E0E0] overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gradient-to-r from-[#0A3D91] via-[#0B4AAF] to-[#0A3D91]">
                  <tr>
                    <th className="px-6 py-5 text-left text-sm font-black text-white uppercase tracking-wider">Officer ID</th>
                    <th className="px-6 py-5 text-left text-sm font-black text-white uppercase tracking-wider">Officer Name</th>
                    <th className="px-6 py-5 text-left text-sm font-black text-white uppercase tracking-wider">Role</th>
                    <th className="px-6 py-5 text-left text-sm font-black text-white uppercase tracking-wider">Grade</th>
                    <th className="px-6 py-5 text-left text-sm font-black text-white uppercase tracking-wider">Experience</th>
                    <th className="px-6 py-5 text-left text-sm font-black text-white uppercase tracking-wider">Status</th>
                    <th className="px-6 py-5 text-center text-sm font-black text-white uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E0E0E0]">
                  {filteredOfficers.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="px-6 py-16 text-center">
                        <div className="flex flex-col items-center">
                          <div className="w-20 h-20 bg-gradient-to-br from-[#0A3D91]/10 to-[#0A3D91]/5 rounded-2xl flex items-center justify-center mb-4">
                            <Shield className="w-10 h-10 text-[#0A3D91]/40" />
                          </div>
                          <h3 className="text-xl font-black text-[#1A1A24] mb-2">No Officers Found</h3>
                          <p className="text-sm text-[#707070] font-semibold">Try adjusting your search or filter criteria</p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    filteredOfficers.map((official) => (
                      <tr
                        key={official.id}
                        className="hover:bg-gradient-to-r hover:from-[#F9FAFB] hover:to-white transition-all duration-200 group"
                      >
                        <td className="px-6 py-5">
                          <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-[#0A3D91]/10 rounded-lg border border-[#0A3D91]/20">
                            <span className="font-black text-[#0A3D91] text-sm">{official.id}</span>
                          </div>
                        </td>
                        <td className="px-6 py-5">
                          <div className="font-black text-[#1A1A24] text-base group-hover:text-[#0A3D91] transition-colors">{official.name}</div>
                        </td>
                        <td className="px-6 py-5">
                          <span
                            className={clsx(
                              "inline-flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-black uppercase border-2 shadow-sm",
                              official.role === "Referee"
                                ? "bg-indigo-100 text-indigo-700 border-indigo-200"
                                : "bg-purple-100 text-purple-700 border-purple-200"
                            )}
                          >
                            {official.role === "Referee" ? <UserCheck className="w-4 h-4" /> : <Award className="w-4 h-4" />}
                            {official.role}
                          </span>
                        </td>
                        <td className="px-6 py-5">
                          <span
                            className={clsx(
                              "inline-flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-black border-2 shadow-sm",
                              official.grade.includes("International")
                                ? "bg-gradient-to-r from-yellow-100 to-amber-100 text-yellow-700 border-yellow-200"
                                : "bg-blue-100 text-blue-700 border-blue-200"
                            )}
                          >
                            <Star className="w-3.5 h-3.5" />
                            {official.grade}
                          </span>
                        </td>
                        <td className="px-6 py-5">
                          <div className="flex items-center gap-2">
                            <Briefcase className="w-4 h-4 text-[#707070]" />
                            <span className="font-black text-[#1A1A24]">{official.experience}</span>
                          </div>
                        </td>
                        <td className="px-6 py-5">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              // Toggle status logic here
                              toast.success(`${official.name} status updated!`);
                            }}
                            className={clsx(
                              "inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black uppercase transition-all hover:shadow-lg border-2 hover:scale-105",
                              official.status === "Available"
                                ? "bg-gradient-to-r from-emerald-100 to-green-100 text-emerald-700 border-emerald-200 hover:from-emerald-200 hover:to-green-200"
                                : "bg-gradient-to-r from-red-100 to-rose-100 text-red-700 border-red-200 hover:from-red-200 hover:to-rose-200"
                            )}
                          >
                            {official.status === "Available" ? <CheckCircle className="w-3.5 h-3.5" /> : <XCircle className="w-3.5 h-3.5" />}
                            {official.status}
                          </button>
                        </td>
                        <td className="px-6 py-5">
                          <div className="flex items-center justify-center gap-2">
                            <button
                              onClick={() => {
                                setSelectedOfficer(official);
                                setShowOfficerDetailModal(true);
                              }}
                              className="p-2.5 bg-gradient-to-br from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-xl transition-all hover:scale-110 shadow-md hover:shadow-lg"
                              title="View Details"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => {
                                toast.info("Edit officer functionality coming soon!");
                              }}
                              className="p-2.5 bg-gradient-to-br from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white rounded-xl transition-all hover:scale-110 shadow-md hover:shadow-lg"
                              title="Edit Officer"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => {
                                if (confirm(`Are you sure you want to remove ${official.name}?`)) {
                                  toast.success(`${official.name} removed successfully!`);
                                }
                              }}
                              className="p-2.5 bg-gradient-to-br from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white rounded-xl transition-all hover:scale-110 shadow-md hover:shadow-lg"
                              title="Remove Officer"
                            >
                              <Trash2 className="w-4 h-4" />
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
      </div>

      {/* Add User Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-auto">
            <div className="bg-gradient-to-r from-[#0A3D91] to-[#0854C2] p-6 border-b-2 border-blue-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <UserPlus className="w-8 h-8 text-white" />
                  <h2 className="text-2xl font-black text-white">Add New User</h2>
                </div>
                <button onClick={() => setShowAddModal(false)} className="text-white hover:bg-white/20 p-2 rounded-lg transition-all">
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-[#1A1A24] mb-2">
                    Full Name <span className="text-[#C8102E]">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.fullName}
                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                    placeholder="Enter full name"
                    className="w-full px-4 py-3 bg-[#F4F5F8] border-2 border-[#E0E0E0] rounded-xl font-medium text-[#1A1A24] placeholder-[#707070] focus:outline-none focus:border-[#0A3D91]"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-[#1A1A24] mb-2">
                    Username <span className="text-[#C8102E]">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.username}
                    onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                    placeholder="Enter username"
                    className="w-full px-4 py-3 bg-[#F4F5F8] border-2 border-[#E0E0E0] rounded-xl font-medium text-[#1A1A24] placeholder-[#707070] focus:outline-none focus:border-[#0A3D91]"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-[#1A1A24] mb-2">
                    Email <span className="text-[#C8102E]">*</span>
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="Enter email"
                    className="w-full px-4 py-3 bg-[#F4F5F8] border-2 border-[#E0E0E0] rounded-xl font-medium text-[#1A1A24] placeholder-[#707070] focus:outline-none focus:border-[#0A3D91]"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-[#1A1A24] mb-2">
                    Password <span className="text-[#C8102E]">*</span>
                  </label>
                  <input
                    type="password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    placeholder="Enter password"
                    className="w-full px-4 py-3 bg-[#F4F5F8] border-2 border-[#E0E0E0] rounded-xl font-medium text-[#1A1A24] placeholder-[#707070] focus:outline-none focus:border-[#0A3D91]"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-[#1A1A24] mb-2">Phone</label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="Enter phone number"
                    className="w-full px-4 py-3 bg-[#F4F5F8] border-2 border-[#E0E0E0] rounded-xl font-medium text-[#1A1A24] placeholder-[#707070] focus:outline-none focus:border-[#0A3D91]"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-[#1A1A24] mb-2">Organization</label>
                  <input
                    type="text"
                    value={formData.organization}
                    onChange={(e) => setFormData({ ...formData, organization: e.target.value })}
                    placeholder="Enter organization"
                    className="w-full px-4 py-3 bg-[#F4F5F8] border-2 border-[#E0E0E0] rounded-xl font-medium text-[#1A1A24] placeholder-[#707070] focus:outline-none focus:border-[#0A3D91]"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-[#1A1A24] mb-2">
                    Role <span className="text-[#C8102E]">*</span>
                  </label>
                  <select
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value as UserRole })}
                    className="w-full px-4 py-3 bg-[#F4F5F8] border-2 border-[#E0E0E0] rounded-xl font-bold text-[#1A1A24] focus:outline-none focus:border-[#0A3D91] appearance-none cursor-pointer"
                  >
                    <option value="kkf_officer">KKF Officer</option>
                    {permissions.isSuperAdmin() && <option value="kkf_super_admin">KKF Super Admin</option>}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-bold text-[#1A1A24] mb-2">Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as "active" | "inactive" | "suspended" })}
                    className="w-full px-4 py-3 bg-[#F4F5F8] border-2 border-[#E0E0E0] rounded-xl font-bold text-[#1A1A24] focus:outline-none focus:border-[#0A3D91] appearance-none cursor-pointer"
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                    <option value="suspended">Suspended</option>
                  </select>
                </div>
              </div>

              {/* Role Info */}
              {formData.role && (
                <div className={`p-4 rounded-xl border-2 ${ROLE_LABELS[formData.role as UserRole].color}`}>
                  <p className="text-sm font-bold mb-1">{ROLE_LABELS[formData.role as UserRole].label}</p>
                  <p className="text-xs">{ROLE_LABELS[formData.role as UserRole].description}</p>
                </div>
              )}

              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 bg-gray-200 hover:bg-gray-300 text-[#1A1A24] px-6 py-3 rounded-xl font-bold transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddUser}
                  className="flex-1 bg-gradient-to-r from-[#0A3D91] to-[#082F6E] hover:from-[#082F6E] hover:to-[#0A3D91] text-white px-6 py-3 rounded-xl font-bold transition-all shadow-md hover:shadow-lg"
                >
                  Add User
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit User Modal - Similar to Add Modal */}
      {showEditModal && selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-auto">
            <div className="bg-gradient-to-r from-[#0A3D91] to-[#0854C2] p-6 border-b-2 border-blue-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Edit2 className="w-8 h-8 text-white" />
                  <h2 className="text-2xl font-black text-white">Edit User</h2>
                </div>
                <button onClick={() => setShowEditModal(false)} className="text-white hover:bg-white/20 p-2 rounded-lg transition-all">
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-[#1A1A24] mb-2">
                    Full Name <span className="text-[#C8102E]">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.fullName}
                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                    placeholder="Enter full name"
                    className="w-full px-4 py-3 bg-[#F4F5F8] border-2 border-[#E0E0E0] rounded-xl font-medium text-[#1A1A24] placeholder-[#707070] focus:outline-none focus:border-[#0A3D91]"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-[#1A1A24] mb-2">
                    Username <span className="text-[#C8102E]">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.username}
                    onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                    placeholder="Enter username"
                    className="w-full px-4 py-3 bg-[#F4F5F8] border-2 border-[#E0E0E0] rounded-xl font-medium text-[#1A1A24] placeholder-[#707070] focus:outline-none focus:border-[#0A3D91]"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-[#1A1A24] mb-2">
                    Email <span className="text-[#C8102E]">*</span>
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="Enter email"
                    className="w-full px-4 py-3 bg-[#F4F5F8] border-2 border-[#E0E0E0] rounded-xl font-medium text-[#1A1A24] placeholder-[#707070] focus:outline-none focus:border-[#0A3D91]"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-[#1A1A24] mb-2">Phone</label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="Enter phone number"
                    className="w-full px-4 py-3 bg-[#F4F5F8] border-2 border-[#E0E0E0] rounded-xl font-medium text-[#1A1A24] placeholder-[#707070] focus:outline-none focus:border-[#0A3D91]"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-[#1A1A24] mb-2">Organization</label>
                  <input
                    type="text"
                    value={formData.organization}
                    onChange={(e) => setFormData({ ...formData, organization: e.target.value })}
                    placeholder="Enter organization"
                    className="w-full px-4 py-3 bg-[#F4F5F8] border-2 border-[#E0E0E0] rounded-xl font-medium text-[#1A1A24] placeholder-[#707070] focus:outline-none focus:border-[#0A3D91]"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-[#1A1A24] mb-2">
                    Role <span className="text-[#C8102E]">*</span>
                  </label>
                  <select
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value as UserRole })}
                    className="w-full px-4 py-3 bg-[#F4F5F8] border-2 border-[#E0E0E0] rounded-xl font-bold text-[#1A1A24] focus:outline-none focus:border-[#0A3D91] appearance-none cursor-pointer"
                  >
                    <option value="kkf_officer">KKF Officer</option>
                    {permissions.isSuperAdmin() && <option value="kkf_super_admin">KKF Super Admin</option>}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-bold text-[#1A1A24] mb-2">Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as "active" | "inactive" | "suspended" })}
                    className="w-full px-4 py-3 bg-[#F4F5F8] border-2 border-[#E0E0E0] rounded-xl font-bold text-[#1A1A24] focus:outline-none focus:border-[#0A3D91] appearance-none cursor-pointer"
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                    <option value="suspended">Suspended</option>
                  </select>
                </div>
              </div>

              {/* Role Info */}
              {formData.role && (
                <div className={`p-4 rounded-xl border-2 ${ROLE_LABELS[formData.role as UserRole].color}`}>
                  <p className="text-sm font-bold mb-1">{ROLE_LABELS[formData.role as UserRole].label}</p>
                  <p className="text-xs">{ROLE_LABELS[formData.role as UserRole].description}</p>
                </div>
              )}

              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => setShowEditModal(false)}
                  className="flex-1 bg-gray-200 hover:bg-gray-300 text-[#1A1A24] px-6 py-3 rounded-xl font-bold transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={handleEditUser}
                  className="flex-1 bg-gradient-to-r from-[#0A3D91] to-[#082F6E] hover:from-[#082F6E] hover:to-[#0A3D91] text-white px-6 py-3 rounded-xl font-bold transition-all shadow-md hover:shadow-lg"
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
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertCircle className="w-8 h-8 text-[#C8102E]" />
              </div>
              <h2 className="text-2xl font-black text-[#1A1A24] mb-2">Delete User?</h2>
              <p className="text-[#707070] font-medium mb-6">
                Are you sure you want to delete <strong>{selectedUser.fullName}</strong>? This action cannot be undone.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setShowDeleteConfirm(false);
                    setSelectedUser(null);
                  }}
                  className="flex-1 bg-gray-200 hover:bg-gray-300 text-[#1A1A24] px-6 py-3 rounded-xl font-bold transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteUser}
                  className="flex-1 bg-[#C8102E] hover:bg-red-700 text-white px-6 py-3 rounded-xl font-bold transition-all"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Officer Modal - Enhanced KYC Form */}
      {showAddOfficerModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl shadow-2xl max-w-5xl w-full max-h-[90vh] overflow-hidden flex flex-col">
            {/* Header */}
            <div className="bg-gradient-to-r from-[#0A3D91] to-[#0854C2] p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                    <UserPlus className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-3xl font-black text-white">Add New Officer</h2>
                    <p className="text-white/80 text-sm font-medium mt-0.5">Complete KYC Registration Form</p>
                  </div>
                </div>
                <button onClick={() => {
                  setShowAddOfficerModal(false);
                  setOfficerFormSection("personal");
                }} className="text-white hover:bg-white/20 p-2 rounded-xl transition-all">
                  <X className="w-6 h-6" />
                </button>
              </div>

              {/* Section Tabs */}
              <div className="flex gap-2 mt-6 overflow-x-auto pb-2">
                {[
                  { id: "personal", label: "Personal Info", icon: User },
                  { id: "contact", label: "Contact", icon: Mail },
                  { id: "identification", label: "ID Documents", icon: CreditCard },
                  { id: "professional", label: "Professional", icon: Briefcase },
                  { id: "emergency", label: "Emergency", icon: Heart },
                ].map((section) => (
                  <button
                    key={section.id}
                    onClick={() => setOfficerFormSection(section.id as any)}
                    className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-sm whitespace-nowrap transition-all ${
                      officerFormSection === section.id
                        ? "bg-white text-[#0A3D91] shadow-lg"
                        : "bg-white/10 text-white/70 hover:bg-white/20 hover:text-white"
                    }`}
                  >
                    <section.icon className="w-4 h-4" />
                    {section.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Form Content */}
            <div className="flex-1 overflow-y-auto p-6">
              {/* Personal Information Section */}
              {officerFormSection === "personal" && (
                <div className="space-y-6">
                  <div className="flex items-center gap-3 pb-4 border-b-2 border-[#E0E0E0]">
                    <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                      <User className="w-5 h-5 text-[#0A3D91]" />
                    </div>
                    <div>
                      <h3 className="text-xl font-black text-[#1A1A24]">Personal Information</h3>
                      <p className="text-sm text-[#707070] font-medium">Basic personal details of the officer</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-black text-[#1A1A24] mb-2 uppercase tracking-wider">
                        First Name <span className="text-[#C8102E]">*</span>
                      </label>
                      <input
                        type="text"
                        value={officerFormData.firstName}
                        onChange={(e) => setOfficerFormData({ ...officerFormData, firstName: e.target.value })}
                        placeholder="Enter first name"
                        className="w-full px-4 py-3 bg-[#F4F5F8] border-2 border-[#E0E0E0] rounded-xl font-semibold text-[#1A1A24] placeholder-[#B0B0B0] focus:outline-none focus:border-[#0A3D91] transition-all"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-black text-[#1A1A24] mb-2 uppercase tracking-wider">
                        Middle Name
                      </label>
                      <input
                        type="text"
                        value={officerFormData.middleName}
                        onChange={(e) => setOfficerFormData({ ...officerFormData, middleName: e.target.value })}
                        placeholder="Enter middle name"
                        className="w-full px-4 py-3 bg-[#F4F5F8] border-2 border-[#E0E0E0] rounded-xl font-semibold text-[#1A1A24] placeholder-[#B0B0B0] focus:outline-none focus:border-[#0A3D91] transition-all"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-black text-[#1A1A24] mb-2 uppercase tracking-wider">
                        Last Name <span className="text-[#C8102E]">*</span>
                      </label>
                      <input
                        type="text"
                        value={officerFormData.lastName}
                        onChange={(e) => setOfficerFormData({ ...officerFormData, lastName: e.target.value })}
                        placeholder="Enter last name"
                        className="w-full px-4 py-3 bg-[#F4F5F8] border-2 border-[#E0E0E0] rounded-xl font-semibold text-[#1A1A24] placeholder-[#B0B0B0] focus:outline-none focus:border-[#0A3D91] transition-all"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-black text-[#1A1A24] mb-2 uppercase tracking-wider">
                        Date of Birth <span className="text-[#C8102E]">*</span>
                      </label>
                      <div className="relative">
                        <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#707070]" />
                        <input
                          type="date"
                          value={officerFormData.dateOfBirth}
                          onChange={(e) => setOfficerFormData({ ...officerFormData, dateOfBirth: e.target.value })}
                          className="w-full pl-11 pr-4 py-3 bg-[#F4F5F8] border-2 border-[#E0E0E0] rounded-xl font-semibold text-[#1A1A24] focus:outline-none focus:border-[#0A3D91] transition-all"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-black text-[#1A1A24] mb-2 uppercase tracking-wider">
                        Gender <span className="text-[#C8102E]">*</span>
                      </label>
                      <select
                        value={officerFormData.gender}
                        onChange={(e) => setOfficerFormData({ ...officerFormData, gender: e.target.value })}
                        className="w-full px-4 py-3 bg-[#F4F5F8] border-2 border-[#E0E0E0] rounded-xl font-black text-[#1A1A24] focus:outline-none focus:border-[#0A3D91] appearance-none cursor-pointer transition-all"
                      >
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-black text-[#1A1A24] mb-2 uppercase tracking-wider">
                        Blood Type
                      </label>
                      <select
                        value={officerFormData.bloodType}
                        onChange={(e) => setOfficerFormData({ ...officerFormData, bloodType: e.target.value })}
                        className="w-full px-4 py-3 bg-[#F4F5F8] border-2 border-[#E0E0E0] rounded-xl font-black text-[#1A1A24] focus:outline-none focus:border-[#0A3D91] appearance-none cursor-pointer transition-all"
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
                      <label className="block text-sm font-black text-[#1A1A24] mb-2 uppercase tracking-wider">
                        Nationality <span className="text-[#C8102E]">*</span>
                      </label>
                      <input
                        type="text"
                        value={officerFormData.nationality}
                        onChange={(e) => setOfficerFormData({ ...officerFormData, nationality: e.target.value })}
                        placeholder="Enter nationality"
                        className="w-full px-4 py-3 bg-[#F4F5F8] border-2 border-[#E0E0E0] rounded-xl font-semibold text-[#1A1A24] placeholder-[#B0B0B0] focus:outline-none focus:border-[#0A3D91] transition-all"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-black text-[#1A1A24] mb-2 uppercase tracking-wider">
                        Place of Birth
                      </label>
                      <input
                        type="text"
                        value={officerFormData.placeOfBirth}
                        onChange={(e) => setOfficerFormData({ ...officerFormData, placeOfBirth: e.target.value })}
                        placeholder="Enter place of birth"
                        className="w-full px-4 py-3 bg-[#F4F5F8] border-2 border-[#E0E0E0] rounded-xl font-semibold text-[#1A1A24] placeholder-[#B0B0B0] focus:outline-none focus:border-[#0A3D91] transition-all"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-black text-[#1A1A24] mb-2 uppercase tracking-wider">
                      Medical Conditions
                    </label>
                    <textarea
                      value={officerFormData.medicalConditions}
                      onChange={(e) => setOfficerFormData({ ...officerFormData, medicalConditions: e.target.value })}
                      placeholder="List any medical conditions, allergies, or health concerns"
                      rows={3}
                      className="w-full px-4 py-3 bg-[#F4F5F8] border-2 border-[#E0E0E0] rounded-xl font-medium text-[#1A1A24] placeholder-[#B0B0B0] focus:outline-none focus:border-[#0A3D91] transition-all resize-none"
                    />
                  </div>
                </div>
              )}

              {/* Contact Information Section */}
              {officerFormSection === "contact" && (
                <div className="space-y-6">
                  <div className="flex items-center gap-3 pb-4 border-b-2 border-[#E0E0E0]">
                    <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
                      <Mail className="w-5 h-5 text-green-600" />
                    </div>
                    <div>
                      <h3 className="text-xl font-black text-[#1A1A24]">Contact Information</h3>
                      <p className="text-sm text-[#707070] font-medium">Email, phone, and address details</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-black text-[#1A1A24] mb-2 uppercase tracking-wider">
                        Email Address <span className="text-[#C8102E]">*</span>
                      </label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#707070]" />
                        <input
                          type="email"
                          value={officerFormData.email}
                          onChange={(e) => setOfficerFormData({ ...officerFormData, email: e.target.value })}
                          placeholder="officer@example.com"
                          className="w-full pl-11 pr-4 py-3 bg-[#F4F5F8] border-2 border-[#E0E0E0] rounded-xl font-semibold text-[#1A1A24] placeholder-[#B0B0B0] focus:outline-none focus:border-[#0A3D91] transition-all"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-black text-[#1A1A24] mb-2 uppercase tracking-wider">
                        Phone Number <span className="text-[#C8102E]">*</span>
                      </label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#707070]" />
                        <input
                          type="tel"
                          value={officerFormData.phone}
                          onChange={(e) => setOfficerFormData({ ...officerFormData, phone: e.target.value })}
                          placeholder="+855 12 345 678"
                          className="w-full pl-11 pr-4 py-3 bg-[#F4F5F8] border-2 border-[#E0E0E0] rounded-xl font-semibold text-[#1A1A24] placeholder-[#B0B0B0] focus:outline-none focus:border-[#0A3D91] transition-all"
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-black text-[#1A1A24] mb-2 uppercase tracking-wider">
                      Alternative Phone
                    </label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#707070]" />
                      <input
                        type="tel"
                        value={officerFormData.alternativePhone}
                        onChange={(e) => setOfficerFormData({ ...officerFormData, alternativePhone: e.target.value })}
                        placeholder="+855 12 345 678"
                        className="w-full pl-11 pr-4 py-3 bg-[#F4F5F8] border-2 border-[#E0E0E0] rounded-xl font-semibold text-[#1A1A24] placeholder-[#B0B0B0] focus:outline-none focus:border-[#0A3D91] transition-all"
                      />
                    </div>
                  </div>

                  <div className="bg-blue-50 border-2 border-blue-200 rounded-2xl p-4">
                    <h4 className="text-sm font-black text-[#0A3D91] mb-3 uppercase tracking-wider">Current Address</h4>
                    <div className="space-y-3">
                      <div>
                        <label className="block text-xs font-bold text-[#707070] mb-1.5 uppercase">
                          Street Address
                        </label>
                        <input
                          type="text"
                          value={officerFormData.currentAddress}
                          onChange={(e) => setOfficerFormData({ ...officerFormData, currentAddress: e.target.value })}
                          placeholder="Street, building, apartment"
                          className="w-full px-4 py-2.5 bg-white border-2 border-blue-100 rounded-xl font-medium text-[#1A1A24] placeholder-[#B0B0B0] focus:outline-none focus:border-[#0A3D91] transition-all"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs font-bold text-[#707070] mb-1.5 uppercase">
                            City/District
                          </label>
                          <input
                            type="text"
                            value={officerFormData.currentCity}
                            onChange={(e) => setOfficerFormData({ ...officerFormData, currentCity: e.target.value })}
                            placeholder="City or district"
                            className="w-full px-4 py-2.5 bg-white border-2 border-blue-100 rounded-xl font-medium text-[#1A1A24] placeholder-[#B0B0B0] focus:outline-none focus:border-[#0A3D91] transition-all"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-[#707070] mb-1.5 uppercase">
                            Province/State
                          </label>
                          <input
                            type="text"
                            value={officerFormData.currentProvince}
                            onChange={(e) => setOfficerFormData({ ...officerFormData, currentProvince: e.target.value })}
                            placeholder="Province or state"
                            className="w-full px-4 py-2.5 bg-white border-2 border-blue-100 rounded-xl font-medium text-[#1A1A24] placeholder-[#B0B0B0] focus:outline-none focus:border-[#0A3D91] transition-all"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gray-50 border-2 border-gray-200 rounded-2xl p-4">
                    <h4 className="text-sm font-black text-[#1A1A24] mb-3 uppercase tracking-wider">Permanent Address</h4>
                    <div className="space-y-3">
                      <div>
                        <label className="block text-xs font-bold text-[#707070] mb-1.5 uppercase">
                          Street Address
                        </label>
                        <input
                          type="text"
                          value={officerFormData.permanentAddress}
                          onChange={(e) => setOfficerFormData({ ...officerFormData, permanentAddress: e.target.value })}
                          placeholder="Street, building, apartment"
                          className="w-full px-4 py-2.5 bg-white border-2 border-gray-100 rounded-xl font-medium text-[#1A1A24] placeholder-[#B0B0B0] focus:outline-none focus:border-[#0A3D91] transition-all"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs font-bold text-[#707070] mb-1.5 uppercase">
                            City/District
                          </label>
                          <input
                            type="text"
                            value={officerFormData.permanentCity}
                            onChange={(e) => setOfficerFormData({ ...officerFormData, permanentCity: e.target.value })}
                            placeholder="City or district"
                            className="w-full px-4 py-2.5 bg-white border-2 border-gray-100 rounded-xl font-medium text-[#1A1A24] placeholder-[#B0B0B0] focus:outline-none focus:border-[#0A3D91] transition-all"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-[#707070] mb-1.5 uppercase">
                            Province/State
                          </label>
                          <input
                            type="text"
                            value={officerFormData.permanentProvince}
                            onChange={(e) => setOfficerFormData({ ...officerFormData, permanentProvince: e.target.value })}
                            placeholder="Province or state"
                            className="w-full px-4 py-2.5 bg-white border-2 border-gray-100 rounded-xl font-medium text-[#1A1A24] placeholder-[#B0B0B0] focus:outline-none focus:border-[#0A3D91] transition-all"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Identification Documents Section */}
              {officerFormSection === "identification" && (
                <div className="space-y-6">
                  <div className="flex items-center gap-3 pb-4 border-b-2 border-[#E0E0E0]">
                    <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center">
                      <CreditCard className="w-5 h-5 text-amber-600" />
                    </div>
                    <div>
                      <h3 className="text-xl font-black text-[#1A1A24]">Identification Documents</h3>
                      <p className="text-sm text-[#707070] font-medium">Government-issued ID and verification</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-black text-[#1A1A24] mb-2 uppercase tracking-wider">
                        ID Type <span className="text-[#C8102E]">*</span>
                      </label>
                      <select
                        value={officerFormData.idType}
                        onChange={(e) => setOfficerFormData({ ...officerFormData, idType: e.target.value })}
                        className="w-full px-4 py-3 bg-[#F4F5F8] border-2 border-[#E0E0E0] rounded-xl font-black text-[#1A1A24] focus:outline-none focus:border-[#0A3D91] appearance-none cursor-pointer transition-all"
                      >
                        <option value="National ID">National ID Card</option>
                        <option value="Passport">Passport</option>
                        <option value="Driver License">Driver's License</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-black text-[#1A1A24] mb-2 uppercase tracking-wider">
                        ID Number <span className="text-[#C8102E]">*</span>
                      </label>
                      <div className="relative">
                        <CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#707070]" />
                        <input
                          type="text"
                          value={officerFormData.idNumber}
                          onChange={(e) => setOfficerFormData({ ...officerFormData, idNumber: e.target.value })}
                          placeholder="Enter ID number"
                          className="w-full pl-11 pr-4 py-3 bg-[#F4F5F8] border-2 border-[#E0E0E0] rounded-xl font-mono font-bold text-[#1A1A24] placeholder-[#B0B0B0] focus:outline-none focus:border-[#0A3D91] transition-all"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-black text-[#1A1A24] mb-2 uppercase tracking-wider">
                        Passport Number
                      </label>
                      <input
                        type="text"
                        value={officerFormData.passportNumber}
                        onChange={(e) => setOfficerFormData({ ...officerFormData, passportNumber: e.target.value })}
                        placeholder="Enter passport number"
                        className="w-full px-4 py-3 bg-[#F4F5F8] border-2 border-[#E0E0E0] rounded-xl font-mono font-bold text-[#1A1A24] placeholder-[#B0B0B0] focus:outline-none focus:border-[#0A3D91] transition-all"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-black text-[#1A1A24] mb-2 uppercase tracking-wider">
                        ID Expiry Date
                      </label>
                      <div className="relative">
                        <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#707070]" />
                        <input
                          type="date"
                          value={officerFormData.idExpiryDate}
                          onChange={(e) => setOfficerFormData({ ...officerFormData, idExpiryDate: e.target.value })}
                          className="w-full pl-11 pr-4 py-3 bg-[#F4F5F8] border-2 border-[#E0E0E0] rounded-xl font-semibold text-[#1A1A24] focus:outline-none focus:border-[#0A3D91] transition-all"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="bg-amber-50 border-2 border-amber-200 rounded-2xl p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <Upload className="w-5 h-5 text-amber-600" />
                      <h4 className="text-sm font-black text-amber-900 uppercase tracking-wider">Document Upload</h4>
                    </div>
                    <p className="text-sm text-[#707070] font-medium mb-4">
                      Upload scanned copies of ID documents for verification
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <button className="flex items-center justify-center gap-2 bg-white hover:bg-amber-50 border-2 border-amber-200 text-[#1A1A24] px-4 py-3 rounded-xl font-bold transition-all">
                        <FileText className="w-5 h-5 text-amber-600" />
                        Upload ID Front
                      </button>
                      <button className="flex items-center justify-center gap-2 bg-white hover:bg-amber-50 border-2 border-amber-200 text-[#1A1A24] px-4 py-3 rounded-xl font-bold transition-all">
                        <FileText className="w-5 h-5 text-amber-600" />
                        Upload ID Back
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Professional Information Section */}
              {officerFormSection === "professional" && (
                <div className="space-y-6">
                  <div className="flex items-center gap-3 pb-4 border-b-2 border-[#E0E0E0]">
                    <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center">
                      <Briefcase className="w-5 h-5 text-purple-600" />
                    </div>
                    <div>
                      <h3 className="text-xl font-black text-[#1A1A24]">Professional Information</h3>
                      <p className="text-sm text-[#707070] font-medium">Role, qualifications, and experience</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-black text-[#1A1A24] mb-2 uppercase tracking-wider">
                        Role <span className="text-[#C8102E]">*</span>
                      </label>
                      <select
                        value={officerFormData.role}
                        onChange={(e) => setOfficerFormData({ ...officerFormData, role: e.target.value as OfficialRole })}
                        className="w-full px-4 py-3 bg-[#F4F5F8] border-2 border-[#E0E0E0] rounded-xl font-black text-[#1A1A24] focus:outline-none focus:border-[#0A3D91] appearance-none cursor-pointer transition-all"
                      >
                        <option value="Referee">Referee</option>
                        <option value="Judge">Judge</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-black text-[#1A1A24] mb-2 uppercase tracking-wider">
                        Grade <span className="text-[#C8102E]">*</span>
                      </label>
                      <select
                        value={officerFormData.grade}
                        onChange={(e) => setOfficerFormData({ ...officerFormData, grade: e.target.value })}
                        className="w-full px-4 py-3 bg-[#F4F5F8] border-2 border-[#E0E0E0] rounded-xl font-black text-[#1A1A24] focus:outline-none focus:border-[#0A3D91] appearance-none cursor-pointer transition-all"
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
                      <label className="block text-sm font-black text-[#1A1A24] mb-2 uppercase tracking-wider">
                        Years of Experience <span className="text-[#C8102E]">*</span>
                      </label>
                      <input
                        type="text"
                        value={officerFormData.experience}
                        onChange={(e) => setOfficerFormData({ ...officerFormData, experience: e.target.value })}
                        placeholder="e.g., 5 years"
                        className="w-full px-4 py-3 bg-[#F4F5F8] border-2 border-[#E0E0E0] rounded-xl font-semibold text-[#1A1A24] placeholder-[#B0B0B0] focus:outline-none focus:border-[#0A3D91] transition-all"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-black text-[#1A1A24] mb-2 uppercase tracking-wider">
                        License Number
                      </label>
                      <input
                        type="text"
                        value={officerFormData.licenseNumber}
                        onChange={(e) => setOfficerFormData({ ...officerFormData, licenseNumber: e.target.value })}
                        placeholder="Enter license number"
                        className="w-full px-4 py-3 bg-[#F4F5F8] border-2 border-[#E0E0E0] rounded-xl font-mono font-bold text-[#1A1A24] placeholder-[#B0B0B0] focus:outline-none focus:border-[#0A3D91] transition-all"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-black text-[#1A1A24] mb-2 uppercase tracking-wider">
                      Specialization
                    </label>
                    <input
                      type="text"
                      value={officerFormData.specialization}
                      onChange={(e) => setOfficerFormData({ ...officerFormData, specialization: e.target.value })}
                      placeholder="e.g., Kun Khmer, Muay Thai, Boxing"
                      className="w-full px-4 py-3 bg-[#F4F5F8] border-2 border-[#E0E0E0] rounded-xl font-semibold text-[#1A1A24] placeholder-[#B0B0B0] focus:outline-none focus:border-[#0A3D91] transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-black text-[#1A1A24] mb-2 uppercase tracking-wider">
                      Certifications & Qualifications
                    </label>
                    <textarea
                      value={officerFormData.certifications}
                      onChange={(e) => setOfficerFormData({ ...officerFormData, certifications: e.target.value })}
                      placeholder="List all relevant certifications, training courses, and qualifications"
                      rows={4}
                      className="w-full px-4 py-3 bg-[#F4F5F8] border-2 border-[#E0E0E0] rounded-xl font-medium text-[#1A1A24] placeholder-[#B0B0B0] focus:outline-none focus:border-[#0A3D91] transition-all resize-none"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-black text-[#1A1A24] mb-2 uppercase tracking-wider">
                      Current Status
                    </label>
                    <select
                      value={officerFormData.status}
                      onChange={(e) => setOfficerFormData({ ...officerFormData, status: e.target.value as "Available" | "Busy" })}
                      className="w-full px-4 py-3 bg-[#F4F5F8] border-2 border-[#E0E0E0] rounded-xl font-black text-[#1A1A24] focus:outline-none focus:border-[#0A3D91] appearance-none cursor-pointer transition-all"
                    >
                      <option value="Available">Available</option>
                      <option value="Busy">Busy</option>
                    </select>
                  </div>
                </div>
              )}

              {/* Emergency Contact Section */}
              {officerFormSection === "emergency" && (
                <div className="space-y-6">
                  <div className="flex items-center gap-3 pb-4 border-b-2 border-[#E0E0E0]">
                    <div className="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center">
                      <Heart className="w-5 h-5 text-red-600" />
                    </div>
                    <div>
                      <h3 className="text-xl font-black text-[#1A1A24]">Emergency Contact</h3>
                      <p className="text-sm text-[#707070] font-medium">Person to contact in case of emergency</p>
                    </div>
                  </div>

                  <div className="bg-red-50 border-2 border-red-200 rounded-2xl p-6 space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-black text-[#1A1A24] mb-2 uppercase tracking-wider">
                          Contact Name
                        </label>
                        <input
                          type="text"
                          value={officerFormData.emergencyContactName}
                          onChange={(e) => setOfficerFormData({ ...officerFormData, emergencyContactName: e.target.value })}
                          placeholder="Full name"
                          className="w-full px-4 py-3 bg-white border-2 border-red-100 rounded-xl font-semibold text-[#1A1A24] placeholder-[#B0B0B0] focus:outline-none focus:border-red-500 transition-all"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-black text-[#1A1A24] mb-2 uppercase tracking-wider">
                          Relationship
                        </label>
                        <select
                          value={officerFormData.emergencyRelationship}
                          onChange={(e) => setOfficerFormData({ ...officerFormData, emergencyRelationship: e.target.value })}
                          className="w-full px-4 py-3 bg-white border-2 border-red-100 rounded-xl font-black text-[#1A1A24] focus:outline-none focus:border-red-500 appearance-none cursor-pointer transition-all"
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
                        <label className="block text-sm font-black text-[#1A1A24] mb-2 uppercase tracking-wider">
                          Emergency Phone
                        </label>
                        <div className="relative">
                          <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-red-600" />
                          <input
                            type="tel"
                            value={officerFormData.emergencyPhone}
                            onChange={(e) => setOfficerFormData({ ...officerFormData, emergencyPhone: e.target.value })}
                            placeholder="+855 12 345 678"
                            className="w-full pl-11 pr-4 py-3 bg-white border-2 border-red-100 rounded-xl font-semibold text-[#1A1A24] placeholder-[#B0B0B0] focus:outline-none focus:border-red-500 transition-all"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-black text-[#1A1A24] mb-2 uppercase tracking-wider">
                          Emergency Email
                        </label>
                        <div className="relative">
                          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-red-600" />
                          <input
                            type="email"
                            value={officerFormData.emergencyEmail}
                            onChange={(e) => setOfficerFormData({ ...officerFormData, emergencyEmail: e.target.value })}
                            placeholder="emergency@example.com"
                            className="w-full pl-11 pr-4 py-3 bg-white border-2 border-red-100 rounded-xl font-semibold text-[#1A1A24] placeholder-[#B0B0B0] focus:outline-none focus:border-red-500 transition-all"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-black text-[#1A1A24] mb-2 uppercase tracking-wider">
                      Additional Notes
                    </label>
                    <textarea
                      value={officerFormData.notes}
                      onChange={(e) => setOfficerFormData({ ...officerFormData, notes: e.target.value })}
                      placeholder="Any additional information, preferences, or special requirements"
                      rows={4}
                      className="w-full px-4 py-3 bg-[#F4F5F8] border-2 border-[#E0E0E0] rounded-xl font-medium text-[#1A1A24] placeholder-[#B0B0B0] focus:outline-none focus:border-[#0A3D91] transition-all resize-none"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Footer Actions */}
            <div className="border-t-2 border-[#E0E0E0] p-6 bg-[#F9FAFB]">
              <div className="flex items-center justify-between gap-4">
                <div className="text-sm text-[#707070] font-medium">
                  <span className="text-[#C8102E] font-black">*</span> Required fields
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={() => {
                      setShowAddOfficerModal(false);
                      setOfficerFormSection("personal");
                    }}
                    className="px-8 py-3.5 bg-gray-200 hover:bg-gray-300 text-[#1A1A24] rounded-xl font-bold transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleAddOfficer}
                    className="px-8 py-3.5 bg-gradient-to-r from-[#0A3D91] to-[#082F6E] hover:from-[#082F6E] hover:to-[#0A3D91] text-white rounded-xl font-bold transition-all shadow-lg hover:shadow-xl"
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
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
            {/* Header */}
            <div className="bg-gradient-to-r from-[#0A3D91] to-[#0854C2] p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm">
                    <Shield className="w-8 h-8 text-white" />
                  </div>
                  <div>
                    <h2 className="text-3xl font-black text-white">{selectedOfficer.name}</h2>
                    <p className="text-white/80 text-sm font-bold mt-1">
                      {selectedOfficer.role} • {selectedOfficer.grade}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setShowOfficerDetailModal(false);
                    setSelectedOfficer(null);
                  }}
                  className="text-white hover:bg-white/20 p-2 rounded-xl transition-all"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {/* Status Banner */}
              <div
                className={`p-4 rounded-2xl border-2 ${
                  selectedOfficer.status === "Available"
                    ? "bg-green-50 border-green-200"
                    : "bg-red-50 border-red-200"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                      selectedOfficer.status === "Available"
                        ? "bg-green-500"
                        : "bg-red-500"
                    }`}
                  >
                    <CheckCircle className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3
                      className={`text-lg font-black ${
                        selectedOfficer.status === "Available"
                          ? "text-green-900"
                          : "text-red-900"
                      }`}
                    >
                      {selectedOfficer.status === "Available"
                        ? "✅ Available for Assignment"
                        : "🚫 Currently Busy"}
                    </h3>
                    <p
                      className={`text-sm font-medium ${
                        selectedOfficer.status === "Available"
                          ? "text-green-700"
                          : "text-red-700"
                      }`}
                    >
                      {selectedOfficer.status === "Available"
                        ? "This officer can be assigned to upcoming events"
                        : "This officer is currently assigned to an event"}
                    </p>
                  </div>
                </div>
              </div>

              {/* Professional Information */}
              <div className="bg-white rounded-2xl border-2 border-[#E0E0E0] overflow-hidden">
                <div className="bg-gradient-to-r from-blue-50 to-white p-4 border-b-2 border-blue-100">
                  <div className="flex items-center gap-3">
                    <Briefcase className="w-5 h-5 text-[#0A3D91]" />
                    <h3 className="text-lg font-black text-[#1A1A24] uppercase">
                      Professional Details
                    </h3>
                  </div>
                </div>
                <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-xs font-black text-[#707070] uppercase tracking-wider mb-1">
                      Officer ID
                    </label>
                    <p className="text-lg font-mono font-bold text-[#0A3D91]">
                      {selectedOfficer.id}
                    </p>
                  </div>

                  <div>
                    <label className="block text-xs font-black text-[#707070] uppercase tracking-wider mb-1">
                      Role
                    </label>
                    <span
                      className={`inline-flex px-3 py-1.5 rounded-lg text-sm font-black uppercase ${
                        selectedOfficer.role === "Referee"
                          ? "bg-indigo-100 text-indigo-700"
                          : "bg-purple-100 text-purple-700"
                      }`}
                    >
                      {selectedOfficer.role}
                    </span>
                  </div>

                  <div>
                    <label className="block text-xs font-black text-[#707070] uppercase tracking-wider mb-1">
                      Grade/Certification
                    </label>
                    <span
                      className={`inline-flex px-3 py-1.5 rounded-lg text-sm font-black ${
                        selectedOfficer.grade.includes("International")
                          ? "bg-yellow-100 text-yellow-700"
                          : "bg-blue-100 text-blue-700"
                      }`}
                    >
                      {selectedOfficer.grade}
                    </span>
                  </div>

                  <div>
                    <label className="block text-xs font-black text-[#707070] uppercase tracking-wider mb-1">
                      Experience
                    </label>
                    <p className="text-lg font-bold text-[#1A1A24]">
                      {selectedOfficer.experience}
                    </p>
                  </div>
                </div>
              </div>

              {/* Performance Rating */}
              <div className="bg-white rounded-2xl border-2 border-[#E0E0E0] overflow-hidden">
                <div className="bg-gradient-to-r from-yellow-50 to-white p-4 border-b-2 border-yellow-100">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Star className="w-5 h-5 text-yellow-600" />
                      <h3 className="text-lg font-black text-[#1A1A24] uppercase">
                        Performance Rating
                      </h3>
                    </div>
                    <div className="flex items-center gap-2">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          className={`w-5 h-5 ${
                            star <= 4
                              ? "fill-yellow-500 text-yellow-500"
                              : "text-gray-300"
                          }`}
                        />
                      ))}
                      <span className="text-lg font-black text-[#1A1A24] ml-2">4.0</span>
                    </div>
                  </div>
                </div>
                <div className="p-6">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center p-3 bg-blue-50 rounded-xl border border-blue-100">
                      <div className="text-2xl font-black text-blue-600 mb-1">9.2</div>
                      <div className="text-[10px] font-black text-[#707070] uppercase">Professionalism</div>
                    </div>
                    <div className="text-center p-3 bg-green-50 rounded-xl border border-green-100">
                      <div className="text-2xl font-black text-green-600 mb-1">9.5</div>
                      <div className="text-[10px] font-black text-[#707070] uppercase">Accuracy</div>
                    </div>
                    <div className="text-center p-3 bg-purple-50 rounded-xl border border-purple-100">
                      <div className="text-2xl font-black text-purple-600 mb-1">8.8</div>
                      <div className="text-[10px] font-black text-[#707070] uppercase">Punctuality</div>
                    </div>
                    <div className="text-center p-3 bg-amber-50 rounded-xl border border-amber-100">
                      <div className="text-2xl font-black text-amber-600 mb-1">9.0</div>
                      <div className="text-[10px] font-black text-[#707070] uppercase">Communication</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Assignment Statistics */}
              <div className="bg-white rounded-2xl border-2 border-[#E0E0E0] overflow-hidden">
                <div className="bg-gradient-to-r from-amber-50 to-white p-4 border-b-2 border-amber-100">
                  <div className="flex items-center gap-3">
                    <Award className="w-5 h-5 text-amber-600" />
                    <h3 className="text-lg font-black text-[#1A1A24] uppercase">
                      Assignment Statistics
                    </h3>
                  </div>
                </div>
                <div className="p-6">
                  <div className="grid grid-cols-3 gap-4 mb-6">
                    <div className="bg-gradient-to-br from-blue-50 to-white p-4 rounded-xl border-2 border-blue-100 text-center">
                      <div className="text-3xl font-black text-[#0A3D91] mb-1">24</div>
                      <div className="text-xs font-black text-[#707070] uppercase tracking-wider">
                        Total Events
                      </div>
                    </div>

                    <div className="bg-gradient-to-br from-green-50 to-white p-4 rounded-xl border-2 border-green-100 text-center">
                      <div className="text-3xl font-black text-green-600 mb-1">22</div>
                      <div className="text-xs font-black text-[#707070] uppercase tracking-wider">
                        Completed
                      </div>
                    </div>

                    <div className="bg-gradient-to-br from-amber-50 to-white p-4 rounded-xl border-2 border-amber-100 text-center">
                      <div className="text-3xl font-black text-amber-600 mb-1">2</div>
                      <div className="text-xs font-black text-[#707070] uppercase tracking-wider">
                        Upcoming
                      </div>
                    </div>
                  </div>

                  {/* Recent Assignments List */}
                  <div className="space-y-3">
                    <h4 className="text-sm font-black text-[#1A1A24] uppercase tracking-wider">Recent Assignments</h4>
                    {[
                      { event: "KKF Championship 2026 - Batch 003", date: "March 15, 2026", status: "Completed" },
                      { event: "Regional Tournament - Batch 002", date: "March 8, 2026", status: "Completed" },
                      { event: "National Finals - Batch 001", date: "March 1, 2026", status: "Completed" },
                    ].map((assignment, idx) => (
                      <div key={idx} className="p-3 bg-[#F9FAFB] rounded-xl border border-[#E0E0E0] hover:border-[#0A3D91] transition-all">
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <p className="text-sm font-bold text-[#1A1A24]">{assignment.event}</p>
                            <p className="text-xs font-medium text-[#707070] mt-0.5">{assignment.date}</p>
                          </div>
                          <span className="px-2 py-1 bg-green-100 text-green-700 text-[10px] font-black uppercase rounded">
                            {assignment.status}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Contact Information Placeholder */}
              <div className="bg-white rounded-2xl border-2 border-[#E0E0E0] overflow-hidden">
                <div className="bg-gradient-to-r from-green-50 to-white p-4 border-b-2 border-green-100">
                  <div className="flex items-center gap-3">
                    <Mail className="w-5 h-5 text-green-600" />
                    <h3 className="text-lg font-black text-[#1A1A24] uppercase">
                      Contact Information
                    </h3>
                  </div>
                </div>
                <div className="p-6 space-y-4">
                  <div className="flex items-start gap-3">
                    <Mail className="w-5 h-5 text-[#0A3D91] mt-1" />
                    <div>
                      <label className="block text-xs font-black text-[#707070] uppercase tracking-wider mb-1">
                        Email
                      </label>
                      <p className="text-base font-semibold text-[#1A1A24]">
                        {selectedOfficer.name.toLowerCase().replace(/\s+/g, ".")}@kkf.org.kh
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <Phone className="w-5 h-5 text-[#0A3D91] mt-1" />
                    <div>
                      <label className="block text-xs font-black text-[#707070] uppercase tracking-wider mb-1">
                        Phone
                      </label>
                      <p className="text-base font-semibold text-[#1A1A24]">
                        +855 12 345 678
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Certifications & Qualifications */}
              <div className="bg-white rounded-2xl border-2 border-[#E0E0E0] overflow-hidden">
                <div className="bg-gradient-to-r from-indigo-50 to-white p-4 border-b-2 border-indigo-100">
                  <div className="flex items-center gap-3">
                    <Award className="w-5 h-5 text-indigo-600" />
                    <h3 className="text-lg font-black text-[#1A1A24] uppercase">
                      Certifications & Qualifications
                    </h3>
                  </div>
                </div>
                <div className="p-6">
                  <div className="flex flex-wrap gap-2">
                    {[
                      { name: `KKF ${selectedOfficer.role} Certification`, level: "Advanced", color: "bg-blue-100 text-blue-700" },
                      { name: "International Sports Official", level: "Level A", color: "bg-purple-100 text-purple-700" },
                      { name: "First Aid & CPR", level: "Certified", color: "bg-red-100 text-red-700" },
                      { name: "Combat Sports Safety", level: "Expert", color: "bg-green-100 text-green-700" },
                      { name: "Anti-Doping Compliance", level: "Certified", color: "bg-amber-100 text-amber-700" },
                    ].map((cert, idx) => (
                      <div
                        key={idx}
                        className={`px-4 py-2.5 rounded-xl border-2 ${cert.color} border-current/20`}
                      >
                        <div className="text-xs font-black uppercase">{cert.name}</div>
                        <div className="text-[10px] font-bold opacity-75 mt-0.5">{cert.level}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Performance Notes */}
              <div className="bg-white rounded-2xl border-2 border-[#E0E0E0] overflow-hidden">
                <div className="bg-gradient-to-r from-purple-50 to-white p-4 border-b-2 border-purple-100">
                  <div className="flex items-center gap-3">
                    <FileText className="w-5 h-5 text-purple-600" />
                    <h3 className="text-lg font-black text-[#1A1A24] uppercase">
                      Performance Notes
                    </h3>
                  </div>
                </div>
                <div className="p-6">
                  <p className="text-sm text-[#707070] font-medium leading-relaxed">
                    Excellent performance record with consistent professionalism. Highly
                    recommended for major championship events. Known for fair judgment and
                    adherence to KKF regulations.
                  </p>
                </div>
              </div>
            </div>

            {/* Footer Actions */}
            <div className="border-t-2 border-[#E0E0E0] p-6 bg-[#F9FAFB]">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <button
                  onClick={() => {
                    toast.success(`${selectedOfficer.name} assigned to event!`);
                  }}
                  className="flex items-center justify-center gap-2 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white px-4 py-3.5 rounded-xl font-bold transition-all shadow-lg hover:shadow-xl"
                >
                  <CalendarClock className="w-5 h-5" />
                  <span className="hidden md:inline">Assign to Event</span>
                  <span className="md:hidden">Assign</span>
                </button>
                <button
                  onClick={() => {
                    toast.info("Edit officer functionality coming soon!");
                  }}
                  className="flex items-center justify-center gap-2 bg-gradient-to-r from-[#0A3D91] to-[#082F6E] hover:from-[#082F6E] hover:to-[#0A3D91] text-white px-4 py-3.5 rounded-xl font-bold transition-all shadow-lg hover:shadow-xl"
                >
                  <Edit2 className="w-5 h-5" />
                  <span className="hidden md:inline">Edit Details</span>
                  <span className="md:hidden">Edit</span>
                </button>
                <button
                  onClick={() => {
                    if (confirm(`Are you sure you want to remove ${selectedOfficer.name}?`)) {
                      toast.success(`${selectedOfficer.name} removed!`);
                      setShowOfficerDetailModal(false);
                      setSelectedOfficer(null);
                    }
                  }}
                  className="flex items-center justify-center gap-2 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white px-4 py-3.5 rounded-xl font-bold transition-all shadow-lg hover:shadow-xl"
                >
                  <Trash2 className="w-5 h-5" />
                  <span className="hidden md:inline">Remove</span>
                  <span className="md:hidden">Delete</span>
                </button>
                <button
                  onClick={() => {
                    setShowOfficerDetailModal(false);
                    setSelectedOfficer(null);
                  }}
                  className="flex items-center justify-center gap-2 bg-gray-200 hover:bg-gray-300 text-[#1A1A24] px-4 py-3.5 rounded-xl font-bold transition-all"
                >
                  <X className="w-5 h-5" />
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}