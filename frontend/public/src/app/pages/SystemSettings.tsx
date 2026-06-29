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

type SettingsTab = "broadcast" | "sponsors" | "rules" | "gloves";

interface BroadcastFormData {
  name: string;
  type: string;
  contactEmail: string;
  contactPhone: string;
  website: string;
  country: string;
  city: string;
  language: string;
  coverage: string;
  frequency: string;
  active: boolean;
}

interface BroadcastStation {
  id: string;
  name: string;
  type?: string;
  contactEmail?: string;
  contactPhone?: string;
  website?: string;
  country?: string;
  city?: string;
  language?: string;
  coverage?: string;
  frequency?: string;
  active: boolean;
  description?: string;
  partneredSince?: string;
}

export function SystemSettings() {
  const [activeTab, setActiveTab] = useState<SettingsTab>("broadcast");
  const permissions = usePermissions();

  // Admin users can manage settings
  const canManage = permissions.currentUser?.role === 'kkf_super_admin' || 
                    permissions.hasPermission('system.manage_settings');

  const settingsTabs = [
    { 
      id: "broadcast" as SettingsTab, 
      label: "Broadcast", 
      icon: Tv,
      description: "TV and streaming partners",
      count: BROADCAST_STATIONS.length
    },
    { 
      id: "sponsors" as SettingsTab, 
      label: "Sponsors", 
      icon: DollarSign,
      description: "Event sponsors and partners",
      count: SPONSORS.length
    },
    { 
      id: "rules" as SettingsTab, 
      label: "Rules", 
      icon: BookOpen,
      description: "Official rules and guidelines",
      count: 12
    },
    { 
      id: "gloves" as SettingsTab, 
      label: "Equipment", 
      icon: Shield,
      description: "Approved safety equipment",
      count: GLOVE_TYPES.length
    }
  ];

  const activeTabConfig = settingsTabs.find(t => t.id === activeTab);

  return (
    <div className="flex min-h-screen bg-[#F4F5F8]">
      {/* Left Sidebar */}
      <div className="w-80 bg-white border-r border-[#E0E0E0] flex flex-col">
        {/* Sidebar Header */}
        <div className="p-8 border-b border-[#E0E0E0]">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 bg-gradient-to-br from-[#0A3D91] to-[#1A1A24] rounded-xl flex items-center justify-center">
              <Settings className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-black text-[#1A1A24]">Settings</h1>
              <p className="text-xs text-[#707070] font-bold">System Configuration</p>
            </div>
          </div>
          
          {!canManage && (
            <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-xl">
              <p className="text-xs text-amber-700 font-bold">🔒 Read-only access</p>
            </div>
          )}
        </div>

        {/* Navigation Menu */}
        <nav className="flex-1 p-4">
          <p className="text-[10px] font-black uppercase tracking-widest text-[#B0B0B0] mb-3 px-3">Menu</p>
          <div className="space-y-1">
            {settingsTabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all group ${
                    isActive
                      ? "bg-[#0A3D91] text-white shadow-lg"
                      : "text-[#707070] hover:bg-[#F4F5F8]"
                  }`}
                >
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center transition-all ${
                    isActive ? "bg-white/20" : "bg-[#F4F5F8] group-hover:bg-white"
                  }`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <div className="flex-1 text-left">
                    <p className={`text-sm font-black ${isActive ? "text-white" : "text-[#1A1A24]"}`}>
                      {tab.label}
                    </p>
                    <p className={`text-xs font-medium ${isActive ? "text-white/70" : "text-[#707070]"}`}>
                      {tab.count} items
                    </p>
                  </div>
                  {isActive && (
                    <div className="w-1.5 h-8 bg-[#F2C94C] rounded-full" />
                  )}
                </button>
              );
            })}
          </div>
        </nav>

        {/* Sidebar Footer */}
        <div className="p-6 border-t border-[#E0E0E0]">
          <div className="p-4 bg-gradient-to-br from-[#F4F5F8] to-white rounded-xl border border-[#E0E0E0]">
            <p className="text-xs font-black text-[#707070] mb-1">Need Help?</p>
            <p className="text-[10px] text-[#B0B0B0] leading-relaxed">Contact system administrator for assistance</p>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col">
        {/* Top Bar */}
        <div className="bg-white border-b border-[#E0E0E0] px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-3xl font-black text-[#1A1A24] mb-1">{activeTabConfig?.label}</h2>
              <p className="text-sm text-[#707070] font-medium">{activeTabConfig?.description}</p>
            </div>
            {canManage && activeTab !== "rules" && (
              <div className="flex items-center gap-3">
                {activeTab === "broadcast" && (
                  <BroadcastAddButton />
                )}
                {activeTab === "sponsors" && (
                  <SponsorAddButton />
                )}
                {activeTab === "gloves" && (
                  <button className="inline-flex items-center gap-2 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white px-5 py-3 rounded-xl font-bold text-sm hover:shadow-lg transition-all">
                    <Plus className="w-4 h-4" />
                    Add Equipment
                  </button>
                )}
              </div>
            )}
            {canManage && activeTab === "rules" && (
              <button className="inline-flex items-center gap-2 bg-gradient-to-r from-[#C8102E] to-[#A00D24] text-white px-5 py-3 rounded-xl font-bold text-sm hover:shadow-lg transition-all">
                <Plus className="w-4 h-4" />
                Add Rule
              </button>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-8">
          {activeTab === "broadcast" && <BroadcastSettings canManage={canManage} />}
          {activeTab === "sponsors" && <SponsorsSettings canManage={canManage} />}
          {activeTab === "rules" && <RulesSettings canManage={canManage} />}
          {activeTab === "gloves" && <GlovesSettings canManage={canManage} />}
        </div>
      </div>
    </div>
  );
}

// Broadcast Add Button Component
function BroadcastAddButton() {
  const [isAddingNew, setIsAddingNew] = useState(false);

  if (!isAddingNew) {
    return (
      <button 
        onClick={() => setIsAddingNew(true)}
        className="inline-flex items-center gap-2 bg-gradient-to-r from-[#0A3D91] to-[#1A1A24] text-white px-5 py-3 rounded-xl font-bold text-sm hover:shadow-lg transition-all"
      >
        <Plus className="w-4 h-4" />
        Add Station
      </button>
    );
  }

  return null;
}

// Sponsor Add Button Component
function SponsorAddButton() {
  const [isAddingNew, setIsAddingNew] = useState(false);

  if (!isAddingNew) {
    return (
      <button 
        onClick={() => setIsAddingNew(true)}
        className="inline-flex items-center gap-2 bg-gradient-to-r from-[#F2C94C] to-[#E09F1F] text-[#1A1A24] px-5 py-3 rounded-xl font-bold text-sm hover:shadow-lg transition-all"
      >
        <Plus className="w-4 h-4" />
        Add Sponsor
      </button>
    );
  }

  return null;
}

// Broadcast Settings Component
function BroadcastSettings({ canManage }: { canManage: boolean }) {
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [selectedStation, setSelectedStation] = useState<any>(null);
  const [editingStation, setEditingStation] = useState<any>(null);
  const [formData, setFormData] = useState<BroadcastFormData>({
    name: "",
    type: "",
    contactEmail: "",
    contactPhone: "",
    website: "",
    country: "",
    city: "",
    language: "",
    coverage: "",
    frequency: "",
    active: false
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleAddBroadcast = () => {
    toast.success("✅ Broadcast station added successfully!");
    setIsAddingNew(false);
    setFormData({
      name: "",
      type: "",
      contactEmail: "",
      contactPhone: "",
      website: "",
      country: "",
      city: "",
      language: "",
      coverage: "",
      frequency: "",
      active: false
    });
    // Add logic to save the new broadcast station to the database
  };

  const handleEditBroadcast = () => {
    toast.success("✅ Broadcast station updated successfully!");
    setEditingStation(null);
    setFormData({
      name: "",
      type: "",
      contactEmail: "",
      contactPhone: "",
      website: "",
      country: "",
      city: "",
      language: "",
      coverage: "",
      frequency: "",
      active: false
    });
    // Add logic to update the broadcast station in the database
  };

  const startEdit = (station: any) => {
    setEditingStation(station);
    setFormData({
      name: station.name || "",
      type: "TV",
      contactEmail: station.contactEmail || "",
      contactPhone: "+855 23 123 456",
      website: `https://www.${station.name.toLowerCase().replace(' ', '')}.com`,
      country: "Cambodia",
      city: "Phnom Penh",
      language: "Khmer, English",
      coverage: "National",
      frequency: "Weekly",
      active: station.active || false
    });
    setSelectedStation(null); // Close detail modal if open
  };

  const cancelEdit = () => {
    setEditingStation(null);
    setIsAddingNew(false);
    setFormData({
      name: "",
      type: "",
      contactEmail: "",
      contactPhone: "",
      website: "",
      country: "",
      city: "",
      language: "",
      coverage: "",
      frequency: "",
      active: false
    });
  };

  return (
    <div className="max-w-5xl">
      {(isAddingNew || editingStation) && canManage && (
        <div className="bg-gradient-to-br from-white to-blue-50 rounded-2xl p-8 border-2 border-[#0A3D91] mb-6 shadow-xl">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-[#0A3D91] to-[#1A1A24] rounded-xl flex items-center justify-center">
                <Tv className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-black text-[#1A1A24]">
                  {editingStation ? "Edit Broadcast Station" : "Add New Broadcast Station"}
                </h3>
                <p className="text-xs text-[#707070] font-medium">
                  {editingStation ? "Update the information below" : "Fill in the details below"}
                </p>
              </div>
            </div>
            <button 
              onClick={cancelEdit}
              className="p-2 hover:bg-white rounded-lg transition-all"
            >
              <X className="w-5 h-5 text-[#707070]" />
            </button>
          </div>

          {/* Station Information Section */}
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-4">
              <Building2 className="w-4 h-4 text-[#0A3D91]" />
              <h4 className="text-sm font-black text-[#0A3D91] uppercase tracking-wider">Station Information</h4>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-[#707070] mb-2 uppercase tracking-wider flex items-center gap-1">
                  <Radio className="w-3 h-3" />
                  Station Name *
                </label>
                <input 
                  type="text" 
                  placeholder="e.g., Bayon TV" 
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border-2 border-[#E0E0E0] rounded-xl font-medium focus:border-[#0A3D91] focus:outline-none transition-all bg-white"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-[#707070] mb-2 uppercase tracking-wider flex items-center gap-1">
                  <Video className="w-3 h-3" />
                  Type *
                </label>
                <select 
                  name="type"
                  value={formData.type}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border-2 border-[#E0E0E0] rounded-xl font-medium focus:border-[#0A3D91] focus:outline-none transition-all bg-white"
                >
                  <option value="">Select Type</option>
                  <option value="TV">📺 TV Broadcast</option>
                  <option value="Streaming">📱 Streaming Platform</option>
                  <option value="Radio">📻 Radio Station</option>
                  <option value="Digital">💻 Digital Media</option>
                </select>
              </div>
            </div>
          </div>

          {/* Contact Information Section */}
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-4">
              <Phone className="w-4 h-4 text-[#0A3D91]" />
              <h4 className="text-sm font-black text-[#0A3D91] uppercase tracking-wider">Contact Information</h4>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-[#707070] mb-2 uppercase tracking-wider flex items-center gap-1">
                  <Mail className="w-3 h-3" />
                  Contact Email *
                </label>
                <input 
                  type="email" 
                  placeholder="contact@station.com" 
                  name="contactEmail"
                  value={formData.contactEmail}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border-2 border-[#E0E0E0] rounded-xl font-medium focus:border-[#0A3D91] focus:outline-none transition-all bg-white"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-[#707070] mb-2 uppercase tracking-wider flex items-center gap-1">
                  <Phone className="w-3 h-3" />
                  Contact Phone *
                </label>
                <input 
                  type="tel" 
                  placeholder="+855 12 345 678" 
                  name="contactPhone"
                  value={formData.contactPhone}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border-2 border-[#E0E0E0] rounded-xl font-medium focus:border-[#0A3D91] focus:outline-none transition-all bg-white"
                />
              </div>
              <div className="col-span-2">
                <label className="block text-xs font-bold text-[#707070] mb-2 uppercase tracking-wider flex items-center gap-1">
                  <Globe className="w-3 h-3" />
                  Website
                </label>
                <input 
                  type="url" 
                  placeholder="https://station.com" 
                  name="website"
                  value={formData.website}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border-2 border-[#E0E0E0] rounded-xl font-medium focus:border-[#0A3D91] focus:outline-none transition-all bg-white"
                />
              </div>
            </div>
          </div>

          {/* Location & Coverage Section */}
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-4">
              <MapPin className="w-4 h-4 text-[#0A3D91]" />
              <h4 className="text-sm font-black text-[#0A3D91] uppercase tracking-wider">Location & Coverage</h4>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-[#707070] mb-2 uppercase tracking-wider">Country</label>
                <input 
                  type="text" 
                  placeholder="Cambodia" 
                  name="country"
                  value={formData.country}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border-2 border-[#E0E0E0] rounded-xl font-medium focus:border-[#0A3D91] focus:outline-none transition-all bg-white"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-[#707070] mb-2 uppercase tracking-wider">City</label>
                <input 
                  type="text" 
                  placeholder="Phnom Penh" 
                  name="city"
                  value={formData.city}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border-2 border-[#E0E0E0] rounded-xl font-medium focus:border-[#0A3D91] focus:outline-none transition-all bg-white"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-[#707070] mb-2 uppercase tracking-wider">Language</label>
                <input 
                  type="text" 
                  placeholder="Khmer, English" 
                  name="language"
                  value={formData.language}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border-2 border-[#E0E0E0] rounded-xl font-medium focus:border-[#0A3D91] focus:outline-none transition-all bg-white"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-[#707070] mb-2 uppercase tracking-wider">Coverage Area</label>
                <select 
                  name="coverage"
                  value={formData.coverage}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border-2 border-[#E0E0E0] rounded-xl font-medium focus:border-[#0A3D91] focus:outline-none transition-all bg-white"
                >
                  <option value="">Select Coverage</option>
                  <option value="International">🌍 International</option>
                  <option value="National">🗺️ National</option>
                  <option value="Regional">📍 Regional</option>
                  <option value="Local">🏘️ Local</option>
                </select>
              </div>
            </div>
          </div>

          {/* Broadcasting Details Section */}
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-4">
              <Wifi className="w-4 h-4 text-[#0A3D91]" />
              <h4 className="text-sm font-black text-[#0A3D91] uppercase tracking-wider">Broadcasting Details</h4>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-[#707070] mb-2 uppercase tracking-wider">Broadcast Frequency</label>
                <select 
                  name="frequency"
                  value={formData.frequency}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border-2 border-[#E0E0E0] rounded-xl font-medium focus:border-[#0A3D91] focus:outline-none transition-all bg-white"
                >
                  <option value="">Select Frequency</option>
                  <option value="Daily">📅 Daily</option>
                  <option value="Weekly">📆 Weekly</option>
                  <option value="Monthly">🗓️ Monthly</option>
                  <option value="Event-based">🎯 Event-based</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-[#707070] mb-2 uppercase tracking-wider">Status</label>
                <select 
                  name="active"
                  value={formData.active ? "true" : "false"}
                  onChange={(e) => setFormData({ ...formData, active: e.target.value === "true" })}
                  className="w-full px-4 py-3 border-2 border-[#E0E0E0] rounded-xl font-medium focus:border-[#0A3D91] focus:outline-none transition-all bg-white"
                >
                  <option value="">Select Status</option>
                  <option value="true">✅ Active</option>
                  <option value="false">⏸️ Inactive</option>
                </select>
              </div>
            </div>
          </div>

          {/* Info Box */}
          <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-xl">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-[#0A3D91] flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-bold text-[#0A3D91] mb-1">Important Information</p>
                <p className="text-xs text-[#707070] leading-relaxed">
                  Fields marked with * are required. Make sure all contact information is accurate for partnership communications.
                </p>
              </div>
            </div>
          </div>

          <div className="flex gap-3">
            <button 
              onClick={editingStation ? handleEditBroadcast : handleAddBroadcast}
              className="flex-1 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white px-6 py-4 rounded-xl font-bold hover:shadow-xl transition-all flex items-center justify-center gap-2 hover:scale-[1.02]"
            >
              <Check className="w-5 h-5" />
              {editingStation ? "Save Changes" : "Save Broadcast Station"}
            </button>
            <button 
              onClick={cancelEdit}
              className="px-8 py-4 border-2 border-[#E0E0E0] rounded-xl font-bold hover:bg-white hover:border-[#707070] transition-all"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {!isAddingNew && canManage && (
        <button 
          onClick={() => setIsAddingNew(true)}
          className="w-full mb-6 p-5 border-2 border-dashed border-[#E0E0E0] rounded-xl hover:border-[#0A3D91] hover:bg-[#F9FAFB] transition-all font-bold text-[#707070] hover:text-[#0A3D91] flex items-center justify-center gap-2"
        >
          <Plus className="w-5 h-5" />
          Add New Broadcast Station
        </button>
      )}

      <div className="grid gap-4">
        {BROADCAST_STATIONS.map((station) => (
          <div key={station.id}>
            <div 
              onClick={() => setSelectedStation(station)}
              className="bg-gradient-to-r from-white to-blue-50 rounded-2xl p-6 border-2 border-[#E0E0E0] hover:border-[#0A3D91] hover:shadow-xl transition-all group cursor-pointer"
            >
              <div className="flex items-start gap-5">
                <div className="w-16 h-16 bg-gradient-to-br from-[#0A3D91] to-[#1A1A24] rounded-2xl flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform shadow-lg">
                  <Tv className="w-8 h-8 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="font-black text-xl text-[#1A1A24] mb-1">{station.name}</h3>
                      <p className="text-xs text-[#707070] font-medium uppercase tracking-wider">📺 TV Broadcast Partner</p>
                    </div>
                    <span className={`px-3 py-1.5 rounded-xl text-xs font-black flex items-center gap-1.5 ${
                      station.active 
                        ? "bg-emerald-500 text-white" 
                        : "bg-gray-300 text-gray-600"
                    }`}>
                      {station.active ? '✓ ACTIVE' : '⏸ INACTIVE'}
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-3 mb-3">
                    <div className="flex items-center gap-2">
                      <Mail className="w-4 h-4 text-[#0A3D91]" />
                      <span className="text-sm text-[#707070] font-medium truncate">{station.contactEmail || 'No email'}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Phone className="w-4 h-4 text-[#0A3D91]" />
                      <span className="text-sm text-[#707070] font-medium">+855 23 123 456</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-[#0A3D91]" />
                      <span className="text-sm text-[#707070] font-medium">Phnom Penh, Cambodia</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Globe className="w-4 h-4 text-[#0A3D91]" />
                      <span className="text-sm text-[#707070] font-medium">www.{station.name.toLowerCase().replace(' ', '')}.com</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-lg text-xs font-black">
                      🗺️ NATIONAL COVERAGE
                    </span>
                    <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-lg text-xs font-black">
                      📅 WEEKLY BROADCASTS
                    </span>
                    <button className="ml-auto text-xs font-black text-[#0A3D91] flex items-center gap-1 group-hover:gap-2 transition-all">
                      VIEW DETAILS <Eye className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                {canManage && (
                  <div className="flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        startEdit(station);
                      }}
                      className="p-2.5 hover:bg-blue-100 rounded-lg transition-all"
                    >
                      <Edit className="w-4 h-4 text-[#0A3D91]" />
                    </button>
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        toast.error("Delete functionality requires confirmation");
                      }}
                      className="p-2.5 hover:bg-red-100 rounded-lg transition-all"
                    >
                      <Trash2 className="w-4 h-4 text-[#C8102E]" />
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Detail Modal */}
      {selectedStation && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50" onClick={() => setSelectedStation(null)}>
          <div className="bg-white rounded-3xl max-w-3xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            {/* Header */}
            <div className="sticky top-0 bg-gradient-to-r from-[#0A3D91] to-[#1A1A24] text-white p-8 rounded-t-3xl">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-4">
                  <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center flex-shrink-0">
                    <Tv className="w-8 h-8 text-white" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-black mb-1">{selectedStation.name}</h2>
                    <p className="text-sm text-white/70 font-medium">Broadcast Partner Details</p>
                  </div>
                </div>
                <button 
                  onClick={() => setSelectedStation(null)}
                  className="p-2 hover:bg-white/20 rounded-lg transition-all"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="p-8 space-y-6">
              {/* Status Banner */}
              <div className={`p-4 rounded-xl ${
                selectedStation.active 
                  ? "bg-emerald-50 border-2 border-emerald-200" 
                  : "bg-gray-100 border-2 border-gray-300"
              }`}>
                <div className="flex items-center gap-3">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                    selectedStation.active ? "bg-emerald-500" : "bg-gray-400"
                  }`}>
                    {selectedStation.active ? <Check className="w-6 h-6 text-white" /> : <AlertCircle className="w-6 h-6 text-white" />}
                  </div>
                  <div>
                    <p className={`text-sm font-black ${
                      selectedStation.active ? "text-emerald-700" : "text-gray-600"
                    }`}>
                      {selectedStation.active ? "ACTIVE PARTNERSHIP" : "INACTIVE PARTNERSHIP"}
                    </p>
                    <p className={`text-xs font-medium ${
                      selectedStation.active ? "text-emerald-600" : "text-gray-500"
                    }`}>
                      {selectedStation.active ? "Currently broadcasting KKF events" : "Partnership temporarily paused"}
                    </p>
                  </div>
                </div>
              </div>

              {/* Station Information */}
              <div>
                <h3 className="text-sm font-black text-[#1A1A24] uppercase tracking-wider mb-4 flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-[#0A3D91]" />
                  Station Information
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gray-50 p-4 rounded-xl">
                    <p className="text-xs font-bold text-[#707070] mb-1 uppercase">Type</p>
                    <p className="text-sm font-black text-[#1A1A24]">📺 TV Broadcast</p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-xl">
                    <p className="text-xs font-bold text-[#707070] mb-1 uppercase">Coverage</p>
                    <p className="text-sm font-black text-[#1A1A24]">🗺️ National</p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-xl">
                    <p className="text-xs font-bold text-[#707070] mb-1 uppercase">Frequency</p>
                    <p className="text-sm font-black text-[#1A1A24]">📆 Weekly</p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-xl">
                    <p className="text-xs font-bold text-[#707070] mb-1 uppercase">Languages</p>
                    <p className="text-sm font-black text-[#1A1A24]">🌐 Khmer, English</p>
                  </div>
                </div>
              </div>

              {/* Contact Information */}
              <div>
                <h3 className="text-sm font-black text-[#1A1A24] uppercase tracking-wider mb-4 flex items-center gap-2">
                  <Phone className="w-4 h-4 text-[#0A3D91]" />
                  Contact Information
                </h3>
                <div className="space-y-3">
                  <div className="flex items-center gap-3 p-4 bg-blue-50 rounded-xl border border-blue-100">
                    <Mail className="w-5 h-5 text-[#0A3D91] flex-shrink-0" />
                    <div>
                      <p className="text-xs font-bold text-[#707070] uppercase">Email</p>
                      <p className="text-sm font-black text-[#1A1A24]">{selectedStation.contactEmail || 'contact@station.com'}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-4 bg-blue-50 rounded-xl border border-blue-100">
                    <Phone className="w-5 h-5 text-[#0A3D91] flex-shrink-0" />
                    <div>
                      <p className="text-xs font-bold text-[#707070] uppercase">Phone</p>
                      <p className="text-sm font-black text-[#1A1A24]">+855 23 123 456</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-4 bg-blue-50 rounded-xl border border-blue-100">
                    <Globe className="w-5 h-5 text-[#0A3D91] flex-shrink-0" />
                    <div>
                      <p className="text-xs font-bold text-[#707070] uppercase">Website</p>
                      <a href={`https://www.${selectedStation.name.toLowerCase().replace(' ', '')}.com`} target="_blank" rel="noopener noreferrer" className="text-sm font-black text-[#0A3D91] hover:underline flex items-center gap-1">
                        www.{selectedStation.name.toLowerCase().replace(' ', '')}.com
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  </div>
                </div>
              </div>

              {/* Location */}
              <div>
                <h3 className="text-sm font-black text-[#1A1A24] uppercase tracking-wider mb-4 flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-[#0A3D91]" />
                  Location
                </h3>
                <div className="p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl border border-blue-100">
                  <p className="text-sm font-black text-[#1A1A24] mb-1">Phnom Penh, Cambodia</p>
                  <p className="text-xs text-[#707070]">Headquarters &middot; Main Broadcasting Center</p>
                </div>
              </div>

              {/* Partnership Details */}
              <div>
                <h3 className="text-sm font-black text-[#1A1A24] uppercase tracking-wider mb-4 flex items-center gap-2">
                  <Info className="w-4 h-4 text-[#0A3D91]" />
                  Partnership Details
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-amber-50 rounded-xl border border-amber-100">
                    <p className="text-xs font-bold text-[#707070] mb-1 uppercase">Partnered Since</p>
                    <p className="text-sm font-black text-[#1A1A24]">January 2024</p>
                  </div>
                  <div className="p-4 bg-purple-50 rounded-xl border border-purple-100">
                    <p className="text-xs font-bold text-[#707070] mb-1 uppercase">Events Broadcast</p>
                    <p className="text-sm font-black text-[#1A1A24]">47 Events</p>
                  </div>
                </div>
              </div>

              {/* Actions */}
              {canManage && (
                <div className="flex gap-3 pt-4 border-t border-[#E0E0E0]">
                  <button 
                    onClick={() => startEdit(selectedStation)}
                    className="flex-1 bg-gradient-to-r from-[#0A3D91] to-[#1A1A24] text-white px-5 py-3 rounded-xl font-bold hover:shadow-lg transition-all flex items-center justify-center gap-2"
                  >
                    <Edit className="w-5 h-5" />
                    Edit Station
                  </button>
                  <button 
                    onClick={() => {
                      setSelectedStation(null);
                      toast.error("Delete functionality requires confirmation");
                    }}
                    className="px-6 py-3 border-2 border-[#C8102E] text-[#C8102E] rounded-xl font-bold hover:bg-red-50 transition-all flex items-center gap-2"
                  >
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

// Sponsors Settings Component
function SponsorsSettings({ canManage }: { canManage: boolean }) {
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [selectedSponsor, setSelectedSponsor] = useState<any>(null);
  const [editingSponsor, setEditingSponsor] = useState<any>(null);
  const [formData, setFormData] = useState({
    name: "",
    tier: "",
    contactEmail: "",
    contactPhone: "",
    website: "",
    industry: "",
    country: "",
    city: "",
    partnershipType: "",
    contractStart: "",
    contractEnd: "",
    active: false
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleAddSponsor = () => {
    toast.success("✅ Sponsor added successfully!");
    setIsAddingNew(false);
    resetForm();
  };

  const handleEditSponsor = () => {
    toast.success("✅ Sponsor updated successfully!");
    setEditingSponsor(null);
    resetForm();
  };

  const startEdit = (sponsor: any) => {
    setEditingSponsor(sponsor);
    setFormData({
      name: sponsor.name || "",
      tier: sponsor.tier || "",
      contactEmail: "contact@sponsor.com",
      contactPhone: "+855 23 456 789",
      website: `https://www.${sponsor.name.toLowerCase().replace(' ', '')}.com`,
      industry: "Financial Services",
      country: "Cambodia",
      city: "Phnom Penh",
      partnershipType: "Title Sponsor",
      contractStart: "2024-01-01",
      contractEnd: "2025-12-31",
      active: sponsor.active || false
    });
    setSelectedSponsor(null);
  };

  const cancelEdit = () => {
    setEditingSponsor(null);
    setIsAddingNew(false);
    resetForm();
  };

  const resetForm = () => {
    setFormData({
      name: "",
      tier: "",
      contactEmail: "",
      contactPhone: "",
      website: "",
      industry: "",
      country: "",
      city: "",
      partnershipType: "",
      contractStart: "",
      contractEnd: "",
      active: false
    });
  };

  return (
    <div className="max-w-5xl">
      {(isAddingNew || editingSponsor) && canManage && (
        <div className="bg-gradient-to-br from-white to-amber-50 rounded-2xl p-8 border-2 border-[#F2C94C] mb-6 shadow-xl">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-[#F2C94C] to-[#E09F1F] rounded-xl flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-black text-[#1A1A24]">
                  {editingSponsor ? "Edit Sponsor" : "Add New Sponsor"}
                </h3>
                <p className="text-xs text-[#707070] font-medium">
                  {editingSponsor ? "Update the information below" : "Fill in the details below"}
                </p>
              </div>
            </div>
            <button onClick={cancelEdit} className="p-2 hover:bg-white rounded-lg transition-all">
              <X className="w-5 h-5 text-[#707070]" />
            </button>
          </div>

          <div className="mb-6">
            <div className="flex items-center gap-2 mb-4">
              <Building2 className="w-4 h-4 text-[#F2C94C]" />
              <h4 className="text-sm font-black text-[#F2C94C] uppercase tracking-wider">Company Information</h4>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-[#707070] mb-2 uppercase tracking-wider">Sponsor Name *</label>
                <input type="text" placeholder="e.g., ABA Bank" name="name" value={formData.name} onChange={handleInputChange} className="w-full px-4 py-3 border-2 border-[#E0E0E0] rounded-xl font-medium focus:border-[#F2C94C] focus:outline-none transition-all bg-white"/>
              </div>
              <div>
                <label className="block text-xs font-bold text-[#707070] mb-2 uppercase tracking-wider">Tier Level *</label>
                <select name="tier" value={formData.tier} onChange={handleInputChange} className="w-full px-4 py-3 border-2 border-[#E0E0E0] rounded-xl font-medium focus:border-[#F2C94C] focus:outline-none transition-all bg-white">
                  <option value="">Select Tier</option>
                  <option value="Platinum">💎 Platinum</option>
                  <option value="Gold">🥇 Gold</option>
                  <option value="Silver">🥈 Silver</option>
                  <option value="Bronze">🥉 Bronze</option>
                </select>
              </div>
            </div>
          </div>

          <div className="mb-6">
            <div className="flex items-center gap-2 mb-4">
              <Phone className="w-4 h-4 text-[#F2C94C]" />
              <h4 className="text-sm font-black text-[#F2C94C] uppercase tracking-wider">Contact Information</h4>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-[#707070] mb-2 uppercase tracking-wider">Contact Email *</label>
                <input type="email" placeholder="contact@sponsor.com" name="contactEmail" value={formData.contactEmail} onChange={handleInputChange} className="w-full px-4 py-3 border-2 border-[#E0E0E0] rounded-xl font-medium focus:border-[#F2C94C] focus:outline-none transition-all bg-white"/>
              </div>
              <div>
                <label className="block text-xs font-bold text-[#707070] mb-2 uppercase tracking-wider">Contact Phone *</label>
                <input type="tel" placeholder="+855 12 345 678" name="contactPhone" value={formData.contactPhone} onChange={handleInputChange} className="w-full px-4 py-3 border-2 border-[#E0E0E0] rounded-xl font-medium focus:border-[#F2C94C] focus:outline-none transition-all bg-white"/>
              </div>
              <div className="col-span-2">
                <label className="block text-xs font-bold text-[#707070] mb-2 uppercase tracking-wider">Website</label>
                <input type="url" placeholder="https://sponsor.com" name="website" value={formData.website} onChange={handleInputChange} className="w-full px-4 py-3 border-2 border-[#E0E0E0] rounded-xl font-medium focus:border-[#F2C94C] focus:outline-none transition-all bg-white"/>
              </div>
            </div>
          </div>

          <div className="flex gap-3">
            <button onClick={editingSponsor ? handleEditSponsor : handleAddSponsor} className="flex-1 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white px-6 py-4 rounded-xl font-bold hover:shadow-xl transition-all flex items-center justify-center gap-2 hover:scale-[1.02]">
              <Check className="w-5 h-5" />
              {editingSponsor ? "Save Changes" : "Save Sponsor"}
            </button>
            <button onClick={cancelEdit} className="px-8 py-4 border-2 border-[#E0E0E0] rounded-xl font-bold hover:bg-white hover:border-[#707070] transition-all">Cancel</button>
          </div>
        </div>
      )}

      {!isAddingNew && !editingSponsor && canManage && (
        <button onClick={() => setIsAddingNew(true)} className="w-full mb-6 p-5 border-2 border-dashed border-[#E0E0E0] rounded-xl hover:border-[#F2C94C] hover:bg-amber-50 transition-all font-bold text-[#707070] hover:text-[#F2C94C] flex items-center justify-center gap-2">
          <Plus className="w-5 h-5" />
          Add New Sponsor
        </button>
      )}

      <div className="grid gap-4">
        {SPONSORS.map((sponsor) => (
          <div key={sponsor.id}>
            <div onClick={() => setSelectedSponsor(sponsor)} className="bg-gradient-to-r from-white to-amber-50 rounded-2xl p-6 border-2 border-[#E0E0E0] hover:border-[#F2C94C] hover:shadow-xl transition-all group cursor-pointer">
              <div className="flex items-start gap-5">
                <div className="w-16 h-16 bg-gradient-to-br from-[#F2C94C] to-[#E09F1F] rounded-2xl flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform shadow-lg">
                  <DollarSign className="w-8 h-8 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="font-black text-xl text-[#1A1A24] mb-1">{sponsor.name}</h3>
                      <p className="text-xs text-[#707070] font-medium uppercase tracking-wider">💼 Official Partner</p>
                    </div>
                    <span className={`px-3 py-1.5 rounded-xl text-xs font-black ${sponsor.tier === "Platinum" ? "bg-gray-300 text-gray-800" : sponsor.tier === "Gold" ? "bg-yellow-400 text-yellow-900" : sponsor.tier === "Silver" ? "bg-gray-200 text-gray-700" : "bg-orange-300 text-orange-900"}`}>
                      {sponsor.tier === "Platinum" ? "💎" : sponsor.tier === "Gold" ? "🥇" : sponsor.tier === "Silver" ? "🥈" : "🥉"} {sponsor.tier.toUpperCase()}
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`px-3 py-1 rounded-lg text-xs font-black ${sponsor.active ? "bg-emerald-500 text-white" : "bg-gray-300 text-gray-600"}`}>
                      {sponsor.active ? '✓ ACTIVE' : '⏸ INACTIVE'}
                    </span>
                    <button className="ml-auto text-xs font-black text-[#F2C94C] flex items-center gap-1 group-hover:gap-2 transition-all">
                      VIEW DETAILS <Eye className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                {canManage && (
                  <div className="flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={(e) => { e.stopPropagation(); startEdit(sponsor); }} className="p-2.5 hover:bg-amber-100 rounded-lg transition-all">
                      <Edit className="w-4 h-4 text-[#F2C94C]" />
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

      {selectedSponsor && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50" onClick={() => setSelectedSponsor(null)}>
          <div className="bg-white rounded-3xl max-w-3xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="sticky top-0 bg-gradient-to-r from-[#F2C94C] to-[#E09F1F] text-white p-8 rounded-t-3xl">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-4">
                  <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center flex-shrink-0">
                    <DollarSign className="w-8 h-8 text-white" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-black mb-1">{selectedSponsor.name}</h2>
                    <p className="text-sm text-white/70 font-medium">Partnership Details</p>
                  </div>
                </div>
                <button onClick={() => setSelectedSponsor(null)} className="p-2 hover:bg-white/20 rounded-lg transition-all">
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>
            <div className="p-8 space-y-6">
              <div className={`p-4 rounded-xl ${selectedSponsor.active ? "bg-emerald-50 border-2 border-emerald-200" : "bg-gray-100 border-2 border-gray-300"}`}>
                <div className="flex items-center gap-3">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${selectedSponsor.active ? "bg-emerald-500" : "bg-gray-400"}`}>
                    {selectedSponsor.active ? <Check className="w-6 h-6 text-white" /> : <AlertCircle className="w-6 h-6 text-white" />}
                  </div>
                  <div>
                    <p className={`text-sm font-black ${selectedSponsor.active ? "text-emerald-700" : "text-gray-600"}`}>
                      {selectedSponsor.active ? "ACTIVE PARTNERSHIP" : "INACTIVE PARTNERSHIP"}
                    </p>
                    <p className={`text-xs font-medium ${selectedSponsor.active ? "text-emerald-600" : "text-gray-500"}`}>
                      {selectedSponsor.active ? "Currently sponsoring KKF events" : "Partnership temporarily paused"}
                    </p>
                  </div>
                </div>
              </div>
              <div>
                <h3 className="text-sm font-black text-[#1A1A24] uppercase tracking-wider mb-4 flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-[#F2C94C]" />
                  Sponsor Information
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gray-50 p-4 rounded-xl">
                    <p className="text-xs font-bold text-[#707070] mb-1 uppercase">Tier Level</p>
                    <p className="text-sm font-black text-[#1A1A24]">{selectedSponsor.tier === "Platinum" ? "💎" : selectedSponsor.tier === "Gold" ? "🥇" : selectedSponsor.tier === "Silver" ? "🥈" : "🥉"} {selectedSponsor.tier}</p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-xl">
                    <p className="text-xs font-bold text-[#707070] mb-1 uppercase">Events Sponsored</p>
                    <p className="text-sm font-black text-[#1A1A24]">32 Events</p>
                  </div>
                </div>
              </div>
              {canManage && (
                <div className="flex gap-3 pt-4 border-t border-[#E0E0E0]">
                  <button onClick={() => startEdit(selectedSponsor)} className="flex-1 bg-gradient-to-r from-[#F2C94C] to-[#E09F1F] text-white px-5 py-3 rounded-xl font-bold hover:shadow-lg transition-all flex items-center justify-center gap-2">
                    <Edit className="w-5 h-5" />
                    Edit Sponsor
                  </button>
                  <button onClick={() => { setSelectedSponsor(null); toast.error("Delete functionality requires confirmation"); }} className="px-6 py-3 border-2 border-[#C8102E] text-[#C8102E] rounded-xl font-bold hover:bg-red-50 transition-all flex items-center gap-2">
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

// Rules Settings Component
function RulesSettings({ canManage }: { canManage: boolean }) {
  const rules = [
    { id: "1", title: "General Competition Rules", category: "Competition", lastUpdated: "2026-01-15", version: "v3.2" },
    { id: "2", title: "Weight Agreement Protocol", category: "Safety", lastUpdated: "2026-02-20", version: "v2.1" },
    { id: "3", title: "Glove Safety Standards", category: "Equipment", lastUpdated: "2026-03-10", version: "v4.0" },
    { id: "4", title: "Referee Guidelines", category: "Officials", lastUpdated: "2026-01-05", version: "v2.8" },
    { id: "5", title: "Judging Criteria", category: "Scoring", lastUpdated: "2026-02-15", version: "v3.1" },
    { id: "6", title: "Medical Requirements", category: "Safety", lastUpdated: "2026-03-01", version: "v1.5" },
    { id: "7", title: "Venue Standards", category: "Infrastructure", lastUpdated: "2026-01-20", version: "v2.0" },
    { id: "8", title: "Fighter Conduct Code", category: "Discipline", lastUpdated: "2026-02-10", version: "v3.0" },
    { id: "9", title: "Anti-Doping Policy", category: "Safety", lastUpdated: "2026-03-15", version: "v5.0" },
    { id: "10", title: "Championship Rules", category: "Competition", lastUpdated: "2026-01-25", version: "v2.5" },
    { id: "11", title: "Event Approval Process", category: "Administration", lastUpdated: "2026-03-20", version: "v1.2" },
    { id: "12", title: "Club Registration Standards", category: "Administration", lastUpdated: "2026-02-05", version: "v1.8" },
  ];

  return (
    <div className="max-w-5xl">
      <div className="grid gap-3">
        {rules.map((rule) => (
          <div key={rule.id} className="bg-white rounded-xl p-5 border border-[#E0E0E0] hover:border-[#C8102E] hover:shadow-md transition-all group">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-gradient-to-br from-[#C8102E] to-[#A00D24] rounded-lg flex items-center justify-center flex-shrink-0">
                <BookOpen className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-black text-base text-[#1A1A24] mb-2">{rule.title}</h3>
                <div className="flex items-center gap-3 flex-wrap">
                  <span className="px-2.5 py-1 bg-red-100 text-red-700 rounded-md text-xs font-black uppercase">
                    {rule.category}
                  </span>
                  <span className="px-2.5 py-1 bg-[#0A3D91] text-white rounded-md text-xs font-black">
                    {rule.version}
                  </span>
                  <span className="text-xs text-[#707070] font-medium">
                    Updated: {rule.lastUpdated}
                  </span>
                </div>
              </div>
              {canManage && (
                <button className="opacity-0 group-hover:opacity-100 transition-opacity p-2.5 hover:bg-red-50 rounded-lg">
                  <Edit className="w-4 h-4 text-[#C8102E]" />
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// Gloves Settings Component
function GlovesSettings({ canManage }: { canManage: boolean }) {
  return (
    <div className="max-w-5xl">
      <div className="grid gap-3">
        {GLOVE_TYPES.map((glove) => (
          <div key={glove.id} className="bg-white rounded-xl p-5 border border-emerald-200 hover:border-emerald-400 hover:shadow-md transition-all group">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl flex items-center justify-center flex-shrink-0">
                <Shield className="w-7 h-7 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-black text-lg text-[#1A1A24] mb-1">
                  {glove.brand} {glove.model}
                </h3>
                <div className="flex items-center gap-3">
                  <span className="text-sm text-[#707070] font-medium">
                    All sizes: 6oz, 8oz, 10oz
                  </span>
                  <span className="text-[#E0E0E0]">•</span>
                  <span className={`px-2.5 py-1 rounded-md text-xs font-black ${
                    glove.approved 
                      ? "bg-emerald-100 text-emerald-700" 
                      : "bg-gray-200 text-gray-600"
                  }`}>
                    {glove.approved ? 'KKF APPROVED' : 'PENDING'}
                  </span>
                </div>
              </div>
              {canManage && (
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button className="p-2.5 hover:bg-emerald-50 rounded-lg transition-all">
                    <Edit className="w-4 h-4 text-emerald-600" />
                  </button>
                  <button className="p-2.5 hover:bg-red-50 rounded-lg transition-all">
                    <Trash2 className="w-4 h-4 text-[#C8102E]" />
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}