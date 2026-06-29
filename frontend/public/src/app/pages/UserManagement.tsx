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
  Calendar,
  Clock,
  Eye,
  X,
  Save,
} from "lucide-react";
import { MOCK_USERS, ROLE_LABELS, ROLE_PERMISSIONS, type User, type UserRole } from "../data/users";
import { usePermissions } from "../hooks/usePermissions";
import { toast } from "sonner";

export function UserManagement() {
  const permissions = usePermissions();
  const navigate = useNavigate();
  const [users, setUsers] = useState<User[]>(MOCK_USERS);
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState<UserRole | "all">("all");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "inactive" | "suspended">("all");
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Form state for add/edit
  const [formData, setFormData] = useState<Partial<User>>({
    username: "",
    email: "",
    password: "",
    fullName: "",
    role: "club",
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

  // Filter users
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

  // Get statistics
  const stats = {
    total: users.length,
    active: users.filter((u) => u.status === "active").length,
    inactive: users.filter((u) => u.status === "inactive").length,
    suspended: users.filter((u) => u.status === "suspended").length,
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
      role: "club",
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

  return (
    <div className="min-h-screen bg-[#F8F9FA] py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <Users className="w-10 h-10 text-[#0A3D91]" />
              <div>
                <h1 className="text-4xl font-black text-[#0A3D91]">User Management</h1>
                <p className="text-[#707070] mt-1 font-medium">Manage system users, roles, and permissions</p>
              </div>
            </div>
            {permissions.hasPermission("users.create") && (
              <button
                onClick={() => {
                  resetForm();
                  setShowAddModal(true);
                }}
                className="bg-[#0A3D91] hover:bg-blue-800 text-white px-6 py-3 rounded-xl font-bold transition-all shadow-md hover:shadow-lg flex items-center gap-2"
              >
                <UserPlus className="w-5 h-5" />
                Add User
              </button>
            )}
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-gradient-to-br from-blue-400 to-blue-600 rounded-2xl p-6 shadow-lg border-2 border-blue-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-900 font-bold text-sm uppercase tracking-wide">Total Users</p>
                  <p className="text-4xl font-black text-white mt-2">{stats.total}</p>
                </div>
                <Users className="w-12 h-12 text-blue-900 opacity-50" />
              </div>
            </div>

            <div className="bg-gradient-to-br from-green-400 to-green-600 rounded-2xl p-6 shadow-lg border-2 border-green-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-900 font-bold text-sm uppercase tracking-wide">Active</p>
                  <p className="text-4xl font-black text-white mt-2">{stats.active}</p>
                </div>
                <CheckCircle className="w-12 h-12 text-green-900 opacity-50" />
              </div>
            </div>

            <div className="bg-gradient-to-br from-gray-400 to-gray-600 rounded-2xl p-6 shadow-lg border-2 border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-900 font-bold text-sm uppercase tracking-wide">Inactive</p>
                  <p className="text-4xl font-black text-white mt-2">{stats.inactive}</p>
                </div>
                <XCircle className="w-12 h-12 text-gray-900 opacity-50" />
              </div>
            </div>

            <div className="bg-gradient-to-br from-red-400 to-red-600 rounded-2xl p-6 shadow-lg border-2 border-red-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-red-900 font-bold text-sm uppercase tracking-wide">Suspended</p>
                  <p className="text-4xl font-black text-white mt-2">{stats.suspended}</p>
                </div>
                <AlertCircle className="w-12 h-12 text-red-900 opacity-50" />
              </div>
            </div>
          </div>
        </div>

        {/* Search & Filter */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6 border-2 border-[#E0E0E0]">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-[#707070]" />
              <input
                type="text"
                placeholder="Search users..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-[#F8F9FA] border-2 border-[#E0E0E0] rounded-xl font-medium text-[#1A1A24] placeholder-[#707070] focus:outline-none focus:border-[#0A3D91] focus:ring-2 focus:ring-[#0A3D91] focus:ring-opacity-20"
              />
            </div>

            <div className="relative">
              <Filter className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-[#707070]" />
              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value as UserRole | "all")}
                className="w-full pl-12 pr-4 py-3 bg-[#F8F9FA] border-2 border-[#E0E0E0] rounded-xl font-bold text-[#1A1A24] focus:outline-none focus:border-[#0A3D91] focus:ring-2 focus:ring-[#0A3D91] focus:ring-opacity-20 appearance-none cursor-pointer"
              >
                <option value="all">All Roles</option>
                <option value="kkf_super_admin">Super Admin</option>
                <option value="kkf_officer">KKF Officer</option>
                <option value="organizer">Organizer</option>
                <option value="club">Club</option>
                <option value="referee_judge">Referee/Judge</option>
              </select>
            </div>

            <div className="relative">
              <Filter className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-[#707070]" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as any)}
                className="w-full pl-12 pr-4 py-3 bg-[#F8F9FA] border-2 border-[#E0E0E0] rounded-xl font-bold text-[#1A1A24] focus:outline-none focus:border-[#0A3D91] focus:ring-2 focus:ring-[#0A3D91] focus:ring-opacity-20 appearance-none cursor-pointer"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="suspended">Suspended</option>
              </select>
            </div>
          </div>
        </div>

        {/* Users Table */}
        <div className="bg-white rounded-2xl shadow-lg border-2 border-[#E0E0E0] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gradient-to-r from-[#0A3D91] to-[#0854C2]">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-black text-white uppercase tracking-wide">User</th>
                  <th className="px-6 py-4 text-left text-sm font-black text-white uppercase tracking-wide">Role</th>
                  <th className="px-6 py-4 text-left text-sm font-black text-white uppercase tracking-wide">Organization</th>
                  <th className="px-6 py-4 text-left text-sm font-black text-white uppercase tracking-wide">Status</th>
                  <th className="px-6 py-4 text-left text-sm font-black text-white uppercase tracking-wide">Last Login</th>
                  <th className="px-6 py-4 text-right text-sm font-black text-white uppercase tracking-wide">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y-2 divide-[#E0E0E0]">
                {filteredUsers.length > 0 ? (
                  filteredUsers.map((user) => {
                    const roleInfo = ROLE_LABELS[user.role];
                    return (
                      <tr key={user.id} className="hover:bg-[#F8F9FA] transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <img
                              src={user.avatar || "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=150"}
                              alt={user.fullName}
                              className="w-12 h-12 rounded-full border-2 border-[#E0E0E0] object-cover"
                            />
                            <div>
                              <p className="font-bold text-[#1A1A24]">{user.fullName}</p>
                              <p className="text-sm text-[#707070] font-medium flex items-center gap-1">
                                <Mail className="w-3 h-3" />
                                {user.email}
                              </p>
                              {user.phone && (
                                <p className="text-sm text-[#707070] font-medium flex items-center gap-1">
                                  <Phone className="w-3 h-3" />
                                  {user.phone}
                                </p>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-bold border-2 ${roleInfo.color}`}>
                            <Shield className="w-4 h-4" />
                            {roleInfo.label}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2 text-sm text-[#707070] font-medium">
                            <Building2 className="w-4 h-4" />
                            {user.organization || "N/A"}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          {user.status === "active" ? (
                            <span className="inline-flex items-center gap-1 bg-green-100 text-green-700 border-2 border-green-300 px-3 py-1 rounded-lg text-sm font-bold">
                              <CheckCircle className="w-4 h-4" />
                              Active
                            </span>
                          ) : user.status === "suspended" ? (
                            <span className="inline-flex items-center gap-1 bg-red-100 text-red-700 border-2 border-red-300 px-3 py-1 rounded-lg text-sm font-bold">
                              <AlertCircle className="w-4 h-4" />
                              Suspended
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 bg-gray-100 text-gray-700 border-2 border-gray-300 px-3 py-1 rounded-lg text-sm font-bold">
                              <XCircle className="w-4 h-4" />
                              Inactive
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          {user.lastLogin ? (
                            <div className="flex items-center gap-2 text-sm text-[#707070] font-medium">
                              <Clock className="w-4 h-4" />
                              {new Date(user.lastLogin).toLocaleDateString("en-GB")}
                            </div>
                          ) : (
                            <span className="text-sm text-[#707070]">Never</span>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center justify-end gap-2">
                            {permissions.hasPermission("users.edit") && (
                              <>
                                <button
                                  onClick={() => handleToggleStatus(user)}
                                  className={`p-2 rounded-lg font-bold transition-all ${
                                    user.status === "active"
                                      ? "bg-gray-100 hover:bg-gray-200 text-gray-700"
                                      : "bg-green-100 hover:bg-green-200 text-green-700"
                                  }`}
                                  title={user.status === "active" ? "Deactivate" : "Activate"}
                                >
                                  {user.status === "active" ? <Lock className="w-4 h-4" /> : <Unlock className="w-4 h-4" />}
                                </button>
                                <button
                                  onClick={() => openEditModal(user)}
                                  className="p-2 bg-blue-100 hover:bg-blue-200 text-blue-700 rounded-lg transition-all"
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
                                className="p-2 bg-red-100 hover:bg-red-200 text-red-700 rounded-lg transition-all"
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
                    <td colSpan={6} className="px-6 py-12 text-center">
                      <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                      <p className="text-xl text-[#707070] font-medium">No users found</p>
                      <p className="text-sm text-[#707070] mt-2">Try adjusting your filters</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
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
                    className="w-full px-4 py-3 bg-[#F8F9FA] border-2 border-[#E0E0E0] rounded-xl font-medium text-[#1A1A24] placeholder-[#707070] focus:outline-none focus:border-[#0A3D91] focus:ring-2 focus:ring-[#0A3D91] focus:ring-opacity-20"
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
                    className="w-full px-4 py-3 bg-[#F8F9FA] border-2 border-[#E0E0E0] rounded-xl font-medium text-[#1A1A24] placeholder-[#707070] focus:outline-none focus:border-[#0A3D91] focus:ring-2 focus:ring-[#0A3D91] focus:ring-opacity-20"
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
                    className="w-full px-4 py-3 bg-[#F8F9FA] border-2 border-[#E0E0E0] rounded-xl font-medium text-[#1A1A24] placeholder-[#707070] focus:outline-none focus:border-[#0A3D91] focus:ring-2 focus:ring-[#0A3D91] focus:ring-opacity-20"
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
                    className="w-full px-4 py-3 bg-[#F8F9FA] border-2 border-[#E0E0E0] rounded-xl font-medium text-[#1A1A24] placeholder-[#707070] focus:outline-none focus:border-[#0A3D91] focus:ring-2 focus:ring-[#0A3D91] focus:ring-opacity-20"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-[#1A1A24] mb-2">Phone</label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="Enter phone number"
                    className="w-full px-4 py-3 bg-[#F8F9FA] border-2 border-[#E0E0E0] rounded-xl font-medium text-[#1A1A24] placeholder-[#707070] focus:outline-none focus:border-[#0A3D91] focus:ring-2 focus:ring-[#0A3D91] focus:ring-opacity-20"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-[#1A1A24] mb-2">Organization</label>
                  <input
                    type="text"
                    value={formData.organization}
                    onChange={(e) => setFormData({ ...formData, organization: e.target.value })}
                    placeholder="Enter organization"
                    className="w-full px-4 py-3 bg-[#F8F9FA] border-2 border-[#E0E0E0] rounded-xl font-medium text-[#1A1A24] placeholder-[#707070] focus:outline-none focus:border-[#0A3D91] focus:ring-2 focus:ring-[#0A3D91] focus:ring-opacity-20"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-[#1A1A24] mb-2">
                    Role <span className="text-[#C8102E]">*</span>
                  </label>
                  <select
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value as UserRole })}
                    className="w-full px-4 py-3 bg-[#F8F9FA] border-2 border-[#E0E0E0] rounded-xl font-bold text-[#1A1A24] focus:outline-none focus:border-[#0A3D91] focus:ring-2 focus:ring-[#0A3D91] focus:ring-opacity-20 appearance-none cursor-pointer"
                  >
                    <option value="club">Club / Gym</option>
                    <option value="organizer">Organizer / Promoter</option>
                    <option value="referee_judge">Referee / Judge</option>
                    <option value="kkf_officer">KKF Officer</option>
                    {permissions.isSuperAdmin() && <option value="kkf_super_admin">KKF Super Admin</option>}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-bold text-[#1A1A24] mb-2">Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as "active" | "inactive" | "suspended" })}
                    className="w-full px-4 py-3 bg-[#F8F9FA] border-2 border-[#E0E0E0] rounded-xl font-bold text-[#1A1A24] focus:outline-none focus:border-[#0A3D91] focus:ring-2 focus:ring-[#0A3D91] focus:ring-opacity-20 appearance-none cursor-pointer"
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
                  className="flex-1 bg-[#0A3D91] hover:bg-blue-800 text-white px-6 py-3 rounded-xl font-bold transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2"
                >
                  <Save className="w-5 h-5" />
                  Create User
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit User Modal */}
      {showEditModal && selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-auto">
            <div className="bg-gradient-to-r from-blue-500 to-blue-700 p-6 border-b-2 border-blue-200">
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
                    className="w-full px-4 py-3 bg-[#F8F9FA] border-2 border-[#E0E0E0] rounded-xl font-medium text-[#1A1A24] focus:outline-none focus:border-[#0A3D91] focus:ring-2 focus:ring-[#0A3D91] focus:ring-opacity-20"
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
                    className="w-full px-4 py-3 bg-[#F8F9FA] border-2 border-[#E0E0E0] rounded-xl font-medium text-[#1A1A24] focus:outline-none focus:border-[#0A3D91] focus:ring-2 focus:ring-[#0A3D91] focus:ring-opacity-20"
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
                    className="w-full px-4 py-3 bg-[#F8F9FA] border-2 border-[#E0E0E0] rounded-xl font-medium text-[#1A1A24] focus:outline-none focus:border-[#0A3D91] focus:ring-2 focus:ring-[#0A3D91] focus:ring-opacity-20"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-[#1A1A24] mb-2">Phone</label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-4 py-3 bg-[#F8F9FA] border-2 border-[#E0E0E0] rounded-xl font-medium text-[#1A1A24] focus:outline-none focus:border-[#0A3D91] focus:ring-2 focus:ring-[#0A3D91] focus:ring-opacity-20"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-[#1A1A24] mb-2">Organization</label>
                  <input
                    type="text"
                    value={formData.organization}
                    onChange={(e) => setFormData({ ...formData, organization: e.target.value })}
                    className="w-full px-4 py-3 bg-[#F8F9FA] border-2 border-[#E0E0E0] rounded-xl font-medium text-[#1A1A24] focus:outline-none focus:border-[#0A3D91] focus:ring-2 focus:ring-[#0A3D91] focus:ring-opacity-20"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-[#1A1A24] mb-2">
                    Role <span className="text-[#C8102E]">*</span>
                  </label>
                  <select
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value as UserRole })}
                    disabled={!permissions.hasPermission("users.manage_roles")}
                    className="w-full px-4 py-3 bg-[#F8F9FA] border-2 border-[#E0E0E0] rounded-xl font-bold text-[#1A1A24] focus:outline-none focus:border-[#0A3D91] focus:ring-2 focus:ring-[#0A3D91] focus:ring-opacity-20 appearance-none cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <option value="club">Club / Gym</option>
                    <option value="organizer">Organizer / Promoter</option>
                    <option value="referee_judge">Referee / Judge</option>
                    <option value="kkf_officer">KKF Officer</option>
                    {permissions.isSuperAdmin() && <option value="kkf_super_admin">KKF Super Admin</option>}
                  </select>
                </div>

                <div className="col-span-2">
                  <label className="block text-sm font-bold text-[#1A1A24] mb-2">Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as "active" | "inactive" | "suspended" })}
                    className="w-full px-4 py-3 bg-[#F8F9FA] border-2 border-[#E0E0E0] rounded-xl font-bold text-[#1A1A24] focus:outline-none focus:border-[#0A3D91] focus:ring-2 focus:ring-[#0A3D91] focus:ring-opacity-20 appearance-none cursor-pointer"
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
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-bold transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2"
                >
                  <Save className="w-5 h-5" />
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full">
            <div className="bg-gradient-to-r from-red-500 to-red-700 p-6 border-b-2 border-red-200">
              <div className="flex items-center gap-3">
                <AlertCircle className="w-8 h-8 text-white" />
                <h2 className="text-2xl font-black text-white">Confirm Delete</h2>
              </div>
            </div>

            <div className="p-6">
              <p className="text-[#1A1A24] font-medium mb-6">
                Are you sure you want to delete user <span className="font-black">{selectedUser.fullName}</span>? This action cannot be undone.
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
                  className="flex-1 bg-[#C8102E] hover:bg-red-700 text-white px-6 py-3 rounded-xl font-bold transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2"
                >
                  <Trash2 className="w-5 h-5" />
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