import { useState } from "react";
import { Shield, Plus, Search, Edit2, Trash2, X, UserCheck, Award, XCircle } from "lucide-react";
import { type Official } from "../data/officials";
import { usePermissions } from "../hooks/usePermissions";
import { toast } from "sonner";
import { clsx } from "clsx";
import {
  getJudges,
  getReferees,
  addJudge,
  addReferee,
  updateJudge,
  updateReferee,
  deleteJudge,
  deleteReferee,
} from "../utils/officialsStore";

type OfficialRole = "Referee" | "Judge";

export function KKFOfficers() {
  const permissions = usePermissions();
  const [judges, setJudges] = useState<Official[]>(getJudges());
  const [referees, setReferees] = useState<Official[]>(getReferees());
  const [search, setSearch] = useState("");
  const [filterRole, setFilterRole] = useState<"all" | OfficialRole>("all");
  const [filterStatus, setFilterStatus] = useState<"all" | "Available" | "Busy">("all");
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingOfficial, setEditingOfficial] = useState<Official | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    experience: "",
    grade: "National B",
    role: "Referee" as OfficialRole,
    status: "Available" as "Available" | "Busy"
  });

  // Get all officials
  const allOfficials = [
    ...referees.map(r => ({ ...r, role: "Referee" as OfficialRole })),
    ...judges.map(j => ({ ...j, role: "Judge" as OfficialRole }))
  ];

  // Filter officials
  let filteredOfficials = allOfficials;

  if (search) {
    filteredOfficials = filteredOfficials.filter(o =>
      o.name.toLowerCase().includes(search.toLowerCase()) ||
      o.id.toLowerCase().includes(search.toLowerCase())
    );
  }

  if (filterRole !== "all") {
    filteredOfficials = filteredOfficials.filter(o => o.role === filterRole);
  }

  if (filterStatus !== "all") {
    filteredOfficials = filteredOfficials.filter(o => o.status === filterStatus);
  }

  const handleOpenAddModal = () => {
    setEditingOfficial(null);
    setFormData({
      name: "",
      experience: "",
      grade: "National B",
      role: "Referee",
      status: "Available"
    });
    setShowAddModal(true);
  };

  const handleEditOfficial = (official: Official & { role: OfficialRole }) => {
    setEditingOfficial(official);
    setFormData({
      name: official.name,
      experience: official.experience,
      grade: official.grade,
      role: official.role,
      status: official.status
    });
    setShowAddModal(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name || !formData.experience || !formData.grade) {
      toast.error("❌ Please fill in all required fields");
      return;
    }

    if (editingOfficial) {
      // Update existing official
      const newOfficial: Official = {
        ...editingOfficial,
        name: formData.name,
        experience: formData.experience,
        grade: formData.grade,
        status: formData.status
      };

      if (formData.role === "Referee") {
        updateReferee(editingOfficial.id, newOfficial);
        setReferees(prev => prev.map(r => r.id === editingOfficial.id ? newOfficial : r));
      } else {
        updateJudge(editingOfficial.id, newOfficial);
        setJudges(prev => prev.map(j => j.id === editingOfficial.id ? newOfficial : j));
      }

      toast.success(`✅ ${formData.name} updated successfully!`);
    } else {
      // Add new official
      const newOfficial: Official = {
        id: `${formData.role === "Referee" ? "R" : "J"}${String(Date.now()).slice(-3)}`,
        name: formData.name,
        experience: formData.experience,
        grade: formData.grade,
        status: formData.status
      };

      if (formData.role === "Referee") {
        addReferee(newOfficial);
        setReferees(prev => [newOfficial, ...prev]);
      } else {
        addJudge(newOfficial);
        setJudges(prev => [newOfficial, ...prev]);
      }

      toast.success(`✅ ${formData.name} added as ${formData.role}!`);
    }

    setShowAddModal(false);
    setEditingOfficial(null);
  };

  const handleDeleteOfficial = (official: Official & { role: OfficialRole }) => {
    if (!confirm(`Are you sure you want to delete ${official.name}?`)) return;

    if (official.role === "Referee") {
      deleteReferee(official.id);
      setReferees(prev => prev.filter(r => r.id !== official.id));
    } else {
      deleteJudge(official.id);
      setJudges(prev => prev.filter(j => j.id !== official.id));
    }

    toast.success(`🗑️ ${official.name} removed`);
  };

  const stats = {
    total: allOfficials.length,
    referees: referees.length,
    judges: judges.length,
    available: allOfficials.filter(o => o.status === "Available").length,
  };

  return (
    <div className="min-h-screen bg-[#F4F5F8] p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <header className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <h1 className="text-4xl md:text-5xl font-black text-[#1A1A24] uppercase tracking-tight">
              KKF Officers
            </h1>
            <p className="text-sm text-[#707070] font-medium mt-2">
              {stats.total} total • {stats.referees} referees • {stats.judges} judges • {stats.available} available
            </p>
          </div>

          {permissions.hasPermission('officials.assign') && (
            <button
              onClick={handleOpenAddModal}
              className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-bold uppercase tracking-wide transition-all shadow-lg hover:shadow-xl bg-gradient-to-r from-[#C8102E] to-[#A00D24] text-white hover:opacity-90"
            >
              <Plus className="w-5 h-5" />
              Add Officer
            </button>
          )}
        </header>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-[#E0E0E0]">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-[#0A3D91]/10 rounded-xl flex items-center justify-center">
                <Shield className="w-5 h-5 text-[#0A3D91]" />
              </div>
              <div className="text-sm font-bold text-[#707070] uppercase">Total Officers</div>
            </div>
            <div className="text-3xl font-black text-[#1A1A24]">{stats.total}</div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-sm border border-[#E0E0E0]">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-indigo-100 rounded-xl flex items-center justify-center">
                <UserCheck className="w-5 h-5 text-indigo-700" />
              </div>
              <div className="text-sm font-bold text-[#707070] uppercase">Referees</div>
            </div>
            <div className="text-3xl font-black text-[#1A1A24]">{stats.referees}</div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-sm border border-[#E0E0E0]">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center">
                <Award className="w-5 h-5 text-purple-700" />
              </div>
              <div className="text-sm font-bold text-[#707070] uppercase">Judges</div>
            </div>
            <div className="text-3xl font-black text-[#1A1A24]">{stats.judges}</div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-sm border border-[#E0E0E0]">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
                <Shield className="w-5 h-5 text-green-700" />
              </div>
              <div className="text-sm font-bold text-[#707070] uppercase">Available</div>
            </div>
            <div className="text-3xl font-black text-[#1A1A24]">{stats.available}</div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-[#E0E0E0]">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#707070]" />
              <input
                type="text"
                placeholder="Search by name or ID..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-[#F4F5F8] border-2 border-[#E0E0E0] rounded-xl pl-12 pr-4 py-3.5 text-[#1A1A24] font-semibold focus:outline-none focus:border-[#0A3D91]"
              />
              {search && (
                <button
                  onClick={() => setSearch("")}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-[#707070] hover:text-[#1A1A24]"
                >
                  <XCircle className="w-5 h-5" />
                </button>
              )}
            </div>

            {/* Role Filter */}
            <select
              value={filterRole}
              onChange={(e) => setFilterRole(e.target.value as any)}
              className="w-full bg-[#F4F5F8] border-2 border-[#E0E0E0] rounded-xl px-4 py-3.5 text-[#1A1A24] font-bold focus:outline-none focus:border-[#0A3D91]"
            >
              <option value="all">All Roles</option>
              <option value="Referee">Referees</option>
              <option value="Judge">Judges</option>
            </select>

            {/* Status Filter */}
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as any)}
              className="w-full bg-[#F4F5F8] border-2 border-[#E0E0E0] rounded-xl px-4 py-3.5 text-[#1A1A24] font-bold focus:outline-none focus:border-[#0A3D91]"
            >
              <option value="all">All Status</option>
              <option value="Available">Available</option>
              <option value="Busy">Busy</option>
            </select>
          </div>
        </div>

        {/* Officers List */}
        <div className="bg-white rounded-2xl shadow-sm border border-[#E0E0E0] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gradient-to-r from-[#0A3D91] to-[#082F6E] text-white">
                  <th className="px-6 py-4 text-left text-xs font-black uppercase tracking-wider">ID</th>
                  <th className="px-6 py-4 text-left text-xs font-black uppercase tracking-wider">Name</th>
                  <th className="px-6 py-4 text-left text-xs font-black uppercase tracking-wider">Role</th>
                  <th className="px-6 py-4 text-left text-xs font-black uppercase tracking-wider">Grade</th>
                  <th className="px-6 py-4 text-left text-xs font-black uppercase tracking-wider">Experience</th>
                  <th className="px-6 py-4 text-left text-xs font-black uppercase tracking-wider">Status</th>
                  {permissions.hasPermission('officials.assign') && (
                    <th className="px-6 py-4 text-center text-xs font-black uppercase tracking-wider">Actions</th>
                  )}
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E0E0E0]">
                {filteredOfficials.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center">
                      <Shield className="w-16 h-16 text-[#B0B0B0] mx-auto mb-4" />
                      <h3 className="text-xl font-bold text-[#707070] mb-2">No Officers Found</h3>
                      <p className="text-[#B0B0B0] font-medium">
                        {search || filterRole !== "all" || filterStatus !== "all"
                          ? "Try adjusting your filters"
                          : "Add your first officer to get started"}
                      </p>
                    </td>
                  </tr>
                ) : (
                  filteredOfficials.map((official) => (
                    <tr key={official.id} className="hover:bg-[#F9FAFB] transition-colors">
                      <td className="px-6 py-4">
                        <span className="font-bold text-[#0A3D91]">{official.id}</span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-black text-[#1A1A24]">{official.name}</div>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={clsx(
                            "px-3 py-1 rounded-lg text-xs font-bold uppercase",
                            official.role === "Referee"
                              ? "bg-indigo-100 text-indigo-700"
                              : "bg-purple-100 text-purple-700"
                          )}
                        >
                          {official.role}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={clsx(
                            "px-3 py-1 rounded-lg text-xs font-bold",
                            official.grade.includes("International")
                              ? "bg-yellow-100 text-yellow-700"
                              : "bg-blue-100 text-blue-700"
                          )}
                        >
                          {official.grade}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="font-bold text-[#707070]">{official.experience}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={clsx(
                            "px-3 py-1 rounded-lg text-xs font-bold uppercase",
                            official.status === "Available"
                              ? "bg-green-100 text-green-700"
                              : "bg-red-100 text-red-700"
                          )}
                        >
                          {official.status}
                        </span>
                      </td>
                      {permissions.hasPermission('officials.assign') && (
                        <td className="px-6 py-4">
                          <div className="flex items-center justify-center gap-2">
                            <button
                              onClick={() => handleEditOfficial(official)}
                              className="p-2 hover:bg-[#0A3D91] hover:text-white bg-[#F4F5F8] text-[#0A3D91] rounded-lg transition-all"
                              title="Edit Officer"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteOfficial(official)}
                              className="p-2 hover:bg-red-600 hover:text-white bg-red-100 text-red-600 rounded-lg transition-all"
                              title="Delete Officer"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      )}
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Add/Edit Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-[#E0E0E0] px-8 py-6 flex items-center justify-between">
              <h2 className="text-2xl font-black text-[#1A1A24] uppercase">
                {editingOfficial ? "Edit Officer" : "Add New Officer"}
              </h2>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-2 hover:bg-[#F4F5F8] rounded-lg transition-colors"
              >
                <X className="w-6 h-6 text-[#707070]" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-8 space-y-6">
              {/* Name */}
              <div>
                <label className="block text-sm font-bold text-[#707070] uppercase mb-2">
                  Full Name *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full bg-[#F4F5F8] border-2 border-[#E0E0E0] rounded-xl px-4 py-3 text-[#1A1A24] font-bold focus:outline-none focus:border-[#0A3D91]"
                  placeholder="Enter officer name"
                  required
                />
              </div>

              {/* Role */}
              <div>
                <label className="block text-sm font-bold text-[#707070] uppercase mb-2">
                  Role *
                </label>
                <select
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value as OfficialRole })}
                  className="w-full bg-[#F4F5F8] border-2 border-[#E0E0E0] rounded-xl px-4 py-3 text-[#1A1A24] font-bold focus:outline-none focus:border-[#0A3D91]"
                  disabled={!!editingOfficial}
                >
                  <option value="Referee">Referee</option>
                  <option value="Judge">Judge</option>
                </select>
                {editingOfficial && (
                  <p className="text-xs text-[#707070] mt-1">Role cannot be changed after creation</p>
                )}
              </div>

              {/* Grade */}
              <div>
                <label className="block text-sm font-bold text-[#707070] uppercase mb-2">
                  Grade *
                </label>
                <select
                  value={formData.grade}
                  onChange={(e) => setFormData({ ...formData, grade: e.target.value })}
                  className="w-full bg-[#F4F5F8] border-2 border-[#E0E0E0] rounded-xl px-4 py-3 text-[#1A1A24] font-bold focus:outline-none focus:border-[#0A3D91]"
                >
                  <option value="International A">International A</option>
                  <option value="International B">International B</option>
                  <option value="National A">National A</option>
                  <option value="National B">National B</option>
                  <option value="National C">National C</option>
                </select>
              </div>

              {/* Experience */}
              <div>
                <label className="block text-sm font-bold text-[#707070] uppercase mb-2">
                  Experience *
                </label>
                <input
                  type="text"
                  value={formData.experience}
                  onChange={(e) => setFormData({ ...formData, experience: e.target.value })}
                  className="w-full bg-[#F4F5F8] border-2 border-[#E0E0E0] rounded-xl px-4 py-3 text-[#1A1A24] font-bold focus:outline-none focus:border-[#0A3D91]"
                  placeholder="e.g., 10 years"
                  required
                />
              </div>

              {/* Status */}
              <div>
                <label className="block text-sm font-bold text-[#707070] uppercase mb-2">
                  Status *
                </label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value as "Available" | "Busy" })}
                  className="w-full bg-[#F4F5F8] border-2 border-[#E0E0E0] rounded-xl px-4 py-3 text-[#1A1A24] font-bold focus:outline-none focus:border-[#0A3D91]"
                >
                  <option value="Available">Available</option>
                  <option value="Busy">Busy</option>
                </select>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-3 pt-4">
                <button
                  type="submit"
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-[#0A3D91] to-[#082F6E] hover:from-[#082F6E] hover:to-[#0A3D91] text-white rounded-xl font-bold transition-all shadow-md hover:shadow-lg"
                >
                  {editingOfficial ? "Update Officer" : "Add Officer"}
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-6 py-3 bg-white border-2 border-[#E0E0E0] hover:border-[#707070] text-[#1A1A24] rounded-xl font-bold transition-all"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}