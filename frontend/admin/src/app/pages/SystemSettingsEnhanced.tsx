import { useState } from "react";
import { Link } from "react-router";
import { 
  Settings, Tv, DollarSign, BookOpen, Shield,
  ChevronRight, Plus, Edit, Trash2, X, Check, Search,
  Globe, Phone, Mail, Radio, Wifi, Video, MapPin, Building2,
  Calendar, Users, AlertCircle, ExternalLink, Eye, Info
} from "lucide-react";
import { BROADCAST_STATIONS, SPONSORS, GLOVE_TYPES } from "../data/masterData";
import { usePermissions } from "../hooks/usePermissions";
import { toast } from "sonner";

// Enhanced Rules Settings Component
export function RulesSettingsEnhanced({ canManage }: { canManage: boolean }) {
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [selectedRule, setSelectedRule] = useState<any>(null);
  const [editingRule, setEditingRule] = useState<any>(null);
  const [formData, setFormData] = useState({
    title: "",
    category: "",
    version: "",
    description: "",
    effectiveDate: "",
    lastUpdated: "",
    applicability: "",
    status: "active"
  });

  const rules = [
    { id: "1", title: "General Competition Rules", category: "Competition", lastUpdated: "2026-01-15", version: "v3.2", description: "Comprehensive rules governing all KKF competitions and sanctioned events." },
    { id: "2", title: "Weight Agreement Protocol", category: "Safety", lastUpdated: "2026-02-20", version: "v2.1", description: "Guidelines for weight agreements between fighters and match safety protocols." },
    { id: "3", title: "Glove Safety Standards", category: "Equipment", lastUpdated: "2026-03-10", version: "v4.0", description: "Official standards for approved gloves and protective equipment." },
    { id: "4", title: "Referee Guidelines", category: "Officials", lastUpdated: "2026-01-05", version: "v2.8", description: "Comprehensive guidelines for referees officiating KKF matches." },
    { id: "5", title: "Judging Criteria", category: "Scoring", lastUpdated: "2026-02-15", version: "v3.1", description: "Official scoring criteria and judging standards for all matches." },
    { id: "6", title: "Medical Requirements", category: "Safety", lastUpdated: "2026-03-01", version: "v1.5", description: "Medical examination and safety requirements for fighters." },
    { id: "7", title: "Venue Standards", category: "Infrastructure", lastUpdated: "2026-01-20", version: "v2.0", description: "Requirements for venues hosting KKF sanctioned events." },
    { id: "8", title: "Fighter Conduct Code", category: "Discipline", lastUpdated: "2026-02-10", version: "v3.0", description: "Code of conduct for all registered fighters in KKF events." },
  ];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleAddRule = () => {
    toast.success("✅ Rule added successfully!");
    setIsAddingNew(false);
    resetForm();
  };

  const handleEditRule = () => {
    toast.success("✅ Rule updated successfully!");
    setEditingRule(null);
    resetForm();
  };

  const startEdit = (rule: any) => {
    setEditingRule(rule);
    setFormData({
      title: rule.title || "",
      category: rule.category || "",
      version: rule.version || "",
      description: rule.description || "",
      effectiveDate: "2026-01-01",
      lastUpdated: rule.lastUpdated || "",
      applicability: "All KKF Events",
      status: "active"
    });
    setSelectedRule(null);
  };

  const cancelEdit = () => {
    setEditingRule(null);
    setIsAddingNew(false);
    resetForm();
  };

  const resetForm = () => {
    setFormData({
      title: "",
      category: "",
      version: "",
      description: "",
      effectiveDate: "",
      lastUpdated: "",
      applicability: "",
      status: "active"
    });
  };

  return (
    <div className="max-w-5xl">
      {(isAddingNew || editingRule) && canManage && (
        <div className="bg-gradient-to-br from-white to-red-50 rounded-2xl p-8 border-2 border-[#C8102E] mb-6 shadow-xl">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-[#C8102E] to-[#A00D24] rounded-xl flex items-center justify-center">
                <BookOpen className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-black text-[#1A1A24]">
                  {editingRule ? "Edit Rule" : "Add New Rule"}
                </h3>
                <p className="text-xs text-[#707070] font-medium">
                  {editingRule ? "Update the information below" : "Fill in the details below"}
                </p>
              </div>
            </div>
            <button onClick={cancelEdit} className="p-2 hover:bg-white rounded-lg transition-all">
              <X className="w-5 h-5 text-[#707070]" />
            </button>
          </div>

          <div className="mb-6">
            <div className="flex items-center gap-2 mb-4">
              <BookOpen className="w-4 h-4 text-[#C8102E]" />
              <h4 className="text-sm font-black text-[#C8102E] uppercase tracking-wider">Rule Details</h4>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <label className="block text-xs font-bold text-[#707070] mb-2 uppercase tracking-wider">Rule Title *</label>
                <input type="text" placeholder="e.g., General Competition Rules" name="title" value={formData.title} onChange={handleInputChange} className="w-full px-4 py-3 border-2 border-[#E0E0E0] rounded-xl font-medium focus:border-[#C8102E] focus:outline-none transition-all bg-white"/>
              </div>
              <div>
                <label className="block text-xs font-bold text-[#707070] mb-2 uppercase tracking-wider">Category *</label>
                <select name="category" value={formData.category} onChange={handleInputChange} className="w-full px-4 py-3 border-2 border-[#E0E0E0] rounded-xl font-medium focus:border-[#C8102E] focus:outline-none transition-all bg-white">
                  <option value="">Select Category</option>
                  <option value="Competition">🏆 Competition</option>
                  <option value="Safety">🛡️ Safety</option>
                  <option value="Equipment">⚙️ Equipment</option>
                  <option value="Officials">👨‍⚖️ Officials</option>
                  <option value="Scoring">📊 Scoring</option>
                  <option value="Discipline">⚠️ Discipline</option>
                  <option value="Administration">📋 Administration</option>
                  <option value="Infrastructure">🏛️ Infrastructure</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-[#707070] mb-2 uppercase tracking-wider">Version *</label>
                <input type="text" placeholder="e.g., v1.0" name="version" value={formData.version} onChange={handleInputChange} className="w-full px-4 py-3 border-2 border-[#E0E0E0] rounded-xl font-medium focus:border-[#C8102E] focus:outline-none transition-all bg-white"/>
              </div>
              <div className="col-span-2">
                <label className="block text-xs font-bold text-[#707070] mb-2 uppercase tracking-wider">Description</label>
                <textarea placeholder="Brief description of the rule..." name="description" value={formData.description} onChange={handleInputChange} rows={3} className="w-full px-4 py-3 border-2 border-[#E0E0E0] rounded-xl font-medium focus:border-[#C8102E] focus:outline-none transition-all bg-white resize-none"/>
              </div>
            </div>
          </div>

          <div className="mb-6">
            <div className="flex items-center gap-2 mb-4">
              <Calendar className="w-4 h-4 text-[#C8102E]" />
              <h4 className="text-sm font-black text-[#C8102E] uppercase tracking-wider">Version Information</h4>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-[#707070] mb-2 uppercase tracking-wider">Effective Date</label>
                <input type="date" name="effectiveDate" value={formData.effectiveDate} onChange={handleInputChange} className="w-full px-4 py-3 border-2 border-[#E0E0E0] rounded-xl font-medium focus:border-[#C8102E] focus:outline-none transition-all bg-white"/>
              </div>
              <div>
                <label className="block text-xs font-bold text-[#707070] mb-2 uppercase tracking-wider">Last Updated</label>
                <input type="date" name="lastUpdated" value={formData.lastUpdated} onChange={handleInputChange} className="w-full px-4 py-3 border-2 border-[#E0E0E0] rounded-xl font-medium focus:border-[#C8102E] focus:outline-none transition-all bg-white"/>
              </div>
              <div>
                <label className="block text-xs font-bold text-[#707070] mb-2 uppercase tracking-wider">Applicability</label>
                <select name="applicability" value={formData.applicability} onChange={handleInputChange} className="w-full px-4 py-3 border-2 border-[#E0E0E0] rounded-xl font-medium focus:border-[#C8102E] focus:outline-none transition-all bg-white">
                  <option value="">Select Applicability</option>
                  <option value="All KKF Events">🌐 All KKF Events</option>
                  <option value="Championship Only">🏆 Championship Only</option>
                  <option value="Amateur Only">🥋 Amateur Only</option>
                  <option value="Professional Only">⭐ Professional Only</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-[#707070] mb-2 uppercase tracking-wider">Status</label>
                <select name="status" value={formData.status} onChange={handleInputChange} className="w-full px-4 py-3 border-2 border-[#E0E0E0] rounded-xl font-medium focus:border-[#C8102E] focus:outline-none transition-all bg-white">
                  <option value="active">✅ Active</option>
                  <option value="draft">📝 Draft</option>
                  <option value="archived">📦 Archived</option>
                </select>
              </div>
            </div>
          </div>

          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-[#C8102E] flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-bold text-[#C8102E] mb-1">Important Information</p>
                <p className="text-xs text-[#707070] leading-relaxed">
                  Rule changes must be approved by KKF Federation before becoming effective.
                </p>
              </div>
            </div>
          </div>

          <div className="flex gap-3">
            <button onClick={editingRule ? handleEditRule : handleAddRule} className="flex-1 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white px-6 py-4 rounded-xl font-bold hover:shadow-xl transition-all flex items-center justify-center gap-2 hover:scale-[1.02]">
              <Check className="w-5 h-5" />
              {editingRule ? "Save Changes" : "Save Rule"}
            </button>
            <button onClick={cancelEdit} className="px-8 py-4 border-2 border-[#E0E0E0] rounded-xl font-bold hover:bg-white hover:border-[#707070] transition-all">Cancel</button>
          </div>
        </div>
      )}

      {!isAddingNew && !editingRule && canManage && (
        <button onClick={() => setIsAddingNew(true)} className="w-full mb-6 p-5 border-2 border-dashed border-[#E0E0E0] rounded-xl hover:border-[#C8102E] hover:bg-red-50 transition-all font-bold text-[#707070] hover:text-[#C8102E] flex items-center justify-center gap-2">
          <Plus className="w-5 h-5" />
          Add New Rule
        </button>
      )}

      <div className="grid gap-4">
        {rules.map((rule) => (
          <div key={rule.id}>
            <div onClick={() => setSelectedRule(rule)} className="bg-gradient-to-r from-white to-red-50 rounded-2xl p-6 border-2 border-[#E0E0E0] hover:border-[#C8102E] hover:shadow-xl transition-all group cursor-pointer">
              <div className="flex items-start gap-5">
                <div className="w-16 h-16 bg-gradient-to-br from-[#C8102E] to-[#A00D24] rounded-2xl flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform shadow-lg">
                  <BookOpen className="w-8 h-8 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="font-black text-xl text-[#1A1A24] mb-1">{rule.title}</h3>
                      <p className="text-xs text-[#707070] font-medium uppercase tracking-wider">📜 Official KKF Rule</p>
                    </div>
                    <span className="px-3 py-1.5 rounded-xl text-xs font-black bg-[#0A3D91] text-white">
                      {rule.version}
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-3 mb-3">
                    <span className="px-3 py-1 bg-red-100 text-red-700 rounded-lg text-xs font-black uppercase">
                      {rule.category}
                    </span>
                    <span className="text-xs text-[#707070] font-medium">
                      Updated: {rule.lastUpdated}
                    </span>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="px-3 py-1 bg-emerald-100 text-emerald-700 rounded-lg text-xs font-black">
                      ✓ ACTIVE
                    </span>
                    <button className="ml-auto text-xs font-black text-[#C8102E] flex items-center gap-1 group-hover:gap-2 transition-all">
                      VIEW DETAILS <Eye className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                {canManage && (
                  <div className="flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={(e) => { e.stopPropagation(); startEdit(rule); }} className="p-2.5 hover:bg-red-100 rounded-lg transition-all">
                      <Edit className="w-4 h-4 text-[#C8102E]" />
                    </button>
                    <button onClick={(e) => { e.stopPropagation(); toast.error("Delete functionality requires confirmation"); }} className="p-2.5 hover:bg-red-100 rounded-lg transition-all">
                      <Trash2 className="w-4 h-4 text-[#C8102E]" />
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {selectedRule && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50" onClick={() => setSelectedRule(null)}>
          <div className="bg-white rounded-3xl max-w-3xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="sticky top-0 bg-gradient-to-r from-[#C8102E] to-[#A00D24] text-white p-8 rounded-t-3xl">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-4">
                  <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center flex-shrink-0">
                    <BookOpen className="w-8 h-8 text-white" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-black mb-1">{selectedRule.title}</h2>
                    <p className="text-sm text-white/70 font-medium">Official KKF Rule</p>
                  </div>
                </div>
                <button onClick={() => setSelectedRule(null)} className="p-2 hover:bg-white/20 rounded-lg transition-all">
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>
            <div className="p-8 space-y-6">
              <div className="p-4 rounded-xl bg-emerald-50 border-2 border-emerald-200">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-emerald-500">
                    <Check className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <p className="text-sm font-black text-emerald-700">ACTIVE RULE</p>
                    <p className="text-xs font-medium text-emerald-600">Currently in effect for all applicable events</p>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-sm font-black text-[#1A1A24] uppercase tracking-wider mb-4 flex items-center gap-2">
                  <Info className="w-4 h-4 text-[#C8102E]" />
                  Rule Information
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gray-50 p-4 rounded-xl">
                    <p className="text-xs font-bold text-[#707070] mb-1 uppercase">Category</p>
                    <p className="text-sm font-black text-[#1A1A24]">{selectedRule.category}</p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-xl">
                    <p className="text-xs font-bold text-[#707070] mb-1 uppercase">Version</p>
                    <p className="text-sm font-black text-[#1A1A24]">{selectedRule.version}</p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-xl">
                    <p className="text-xs font-bold text-[#707070] mb-1 uppercase">Last Updated</p>
                    <p className="text-sm font-black text-[#1A1A24]">{selectedRule.lastUpdated}</p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-xl">
                    <p className="text-xs font-bold text-[#707070] mb-1 uppercase">Applicability</p>
                    <p className="text-sm font-black text-[#1A1A24]">All KKF Events</p>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-sm font-black text-[#1A1A24] uppercase tracking-wider mb-4 flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-[#C8102E]" />
                  Description
                </h3>
                <div className="p-4 bg-gradient-to-r from-red-50 to-orange-50 rounded-xl border border-red-100">
                  <p className="text-sm text-[#1A1A24] leading-relaxed">{selectedRule.description}</p>
                </div>
              </div>

              {canManage && (
                <div className="flex gap-3 pt-4 border-t border-[#E0E0E0]">
                  <button onClick={() => startEdit(selectedRule)} className="flex-1 bg-gradient-to-r from-[#C8102E] to-[#A00D24] text-white px-5 py-3 rounded-xl font-bold hover:shadow-lg transition-all flex items-center justify-center gap-2">
                    <Edit className="w-5 h-5" />
                    Edit Rule
                  </button>
                  <button onClick={() => { setSelectedRule(null); toast.error("Delete functionality requires confirmation"); }} className="px-6 py-3 border-2 border-[#C8102E] text-[#C8102E] rounded-xl font-bold hover:bg-red-50 transition-all flex items-center gap-2">
                    <Trash2 className="w-5 h-5" />
                    Delete
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
