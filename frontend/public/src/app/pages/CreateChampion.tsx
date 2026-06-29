import { useState } from "react";
import { useNavigate } from "react-router";
import {
  ArrowLeft, Crown, Trophy, Save, Calendar, MapPin, Shield,
  Weight, Award, Star, AlertCircle, Info
} from "lucide-react";
import { toast } from "sonner";
import {
  CHAMPION_TYPE_CONFIG,
  WEIGHT_CLASSES,
  type ChampionType,
  type ChampionStatus
} from "../data/champion";
import { MOCK_BATCHES } from "../data/batches";

export function CreateChampion() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    titleName: "",
    championType: "KKF National" as ChampionType,
    weightClass: 60,
    organization: "KKF" as "KKF" | "WBC" | "WBA" | "WMC" | "Other",
    batchId: "",
    status: "Vacant" as ChampionStatus,
    notes: ""
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    const newErrors: Record<string, string> = {};
    
    if (!formData.titleName.trim()) {
      newErrors.titleName = "Title name is required";
    }
    
    if (!formData.batchId) {
      newErrors.batchId = "Please select an event/batch";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      toast.error("Please fill in all required fields");
      return;
    }

    // Success - In real app, this would make an API call
    toast.success("Championship title created successfully!");
    navigate("/home/champion");
  };

  const selectedBatch = MOCK_BATCHES.find(b => b.id === formData.batchId);

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F4F5F8] via-white to-[#F9FAFB]">
      <div className="p-4 md:p-8 max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <button
            onClick={() => navigate("/home/champion")}
            className="inline-flex items-center gap-2 text-[#0A3D91] hover:text-[#082F6E] font-bold transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to Champions
          </button>
        </div>

        <div className="bg-gradient-to-r from-[#F2C94C] to-[#E6B800] rounded-3xl p-8 shadow-xl">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-white/20 backdrop-blur-xl rounded-2xl flex items-center justify-center">
              <Crown className="w-9 h-9 text-[#1A1A24]" />
            </div>
            <div>
              <h1 className="text-4xl md:text-5xl font-black text-[#1A1A24] uppercase leading-none">
                Create Championship
              </h1>
              <p className="text-[#1A1A24]/80 font-bold text-lg mt-1">
                Create a new championship title for an event
              </p>
            </div>
          </div>
        </div>

        {/* Info Box */}
        <div className="bg-blue-50 border-2 border-blue-200 rounded-2xl p-6">
          <div className="flex gap-3">
            <Info className="w-6 h-6 text-[#0A3D91] flex-shrink-0 mt-0.5" />
            <div className="space-y-2">
              <h3 className="font-black text-[#0A3D91] text-lg">📋 How Championships Work</h3>
              <ul className="text-sm font-bold text-[#0A3D91] space-y-1.5">
                <li>• <strong>Championship is a TITLE</strong>, not a fighter assignment</li>
                <li>• The title belongs to an <strong>Event/Batch</strong></li>
                <li>• Fighters <strong>compete FOR</strong> the championship in matches</li>
                <li>• Mark matches as <strong>"Title Fight"</strong> to award the championship</li>
                <li>• The match <strong>winner</strong> becomes the champion</li>
              </ul>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Championship Type Selection */}
          <div className="bg-white rounded-3xl p-6 shadow-[0_8px_30px_rgba(0,0,0,0.08)] border border-[#E0E0E0]/50">
            <h2 className="text-xl font-black text-[#1A1A24] uppercase mb-6 flex items-center gap-2">
              <Trophy className="w-5 h-5 text-[#FFB81C]" />
              Championship Type
            </h2>
            
            {/* Belt Titles */}
            <div className="mb-6">
              <div className="flex items-center gap-2 mb-3">
                <div className="text-2xl">🏷</div>
                <h3 className="text-sm font-black text-[#1A1A24] uppercase tracking-wider">Belt Titles</h3>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                {[
                  "KKF National",
                  "ISKA Cambodia",
                  "IPCC International",
                  "International Belt",
                  "Interim Belt",
                  "Super Fight Belt",
                  "Sponsor Belt"
                ].map((type) => {
                  const config = CHAMPION_TYPE_CONFIG[type as ChampionType];
                  return (
                    <button
                      key={type}
                      type="button"
                      onClick={() => setFormData({ ...formData, championType: type as ChampionType })}
                      className={`p-4 rounded-xl border-2 transition-all text-center ${
                        formData.championType === type
                          ? `${config.bgColor} ${config.color} border-current shadow-lg scale-105`
                          : "bg-[#F4F5F8] text-[#707070] border-[#E0E0E0] hover:border-[#0A3D91]"
                      }`}
                    >
                      <div className="text-3xl mb-2">{config.icon}</div>
                      <div className="text-xs font-black uppercase tracking-wider leading-tight">
                        {config.label.replace(" Champion", "")}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Divider */}
            <div className="border-t-2 border-[#E0E0E0] my-6"></div>

            {/* Non-Belt Awards */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <div className="text-2xl">🏆</div>
                <h3 className="text-sm font-black text-[#1A1A24] uppercase tracking-wider">Non-Belt Awards</h3>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {[
                  "Trophy",
                  "Tournament Winner",
                  "Honorary Award"
                ].map((type) => {
                  const config = CHAMPION_TYPE_CONFIG[type as ChampionType];
                  return (
                    <button
                      key={type}
                      type="button"
                      onClick={() => setFormData({ ...formData, championType: type as ChampionType })}
                      className={`p-4 rounded-xl border-2 transition-all text-center ${
                        formData.championType === type
                          ? `${config.bgColor} ${config.color} border-current shadow-lg scale-105`
                          : "bg-[#F4F5F8] text-[#707070] border-[#E0E0E0] hover:border-[#0A3D91]"
                      }`}
                    >
                      <div className="text-3xl mb-2">{config.icon}</div>
                      <div className="text-xs font-black uppercase tracking-wider leading-tight">
                        {config.label}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Title Details */}
          <div className="bg-white rounded-3xl p-6 shadow-[0_8px_30px_rgba(0,0,0,0.08)] border border-[#E0E0E0]/50">
            <h2 className="text-xl font-black text-[#1A1A24] uppercase mb-4 flex items-center gap-2">
              <Award className="w-5 h-5 text-[#FFB81C]" />
              Championship Title Details
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-xs font-black text-[#707070] uppercase tracking-wider mb-2">
                  Championship Title Name *
                </label>
                <input
                  type="text"
                  value={formData.titleName}
                  onChange={(e) => {
                    setFormData({ ...formData, titleName: e.target.value });
                    setErrors({ ...errors, titleName: "" });
                  }}
                  placeholder="e.g., KKF National Championship 65kg, WMC World Title 70kg"
                  className={`w-full bg-[#F4F5F8] border-2 rounded-xl px-4 py-3.5 text-[#1A1A24] font-bold focus:ring-2 focus:ring-[#0A3D91] transition-all ${
                    errors.titleName ? "border-red-500" : "border-[#E0E0E0] focus:border-[#0A3D91]"
                  }`}
                />
                {errors.titleName && (
                  <p className="mt-1 text-xs font-bold text-red-600 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    {errors.titleName}
                  </p>
                )}
                <p className="mt-2 text-xs font-bold text-[#707070]">
                  💡 This is the official name of the championship belt/title
                </p>
              </div>

              <div>
                <label className="block text-xs font-black text-[#707070] uppercase tracking-wider mb-2">
                  Weight Class (kg) *
                </label>
                <select
                  value={formData.weightClass}
                  onChange={(e) => setFormData({ ...formData, weightClass: parseFloat(e.target.value) })}
                  className="w-full bg-[#F4F5F8] border-2 border-[#E0E0E0] rounded-xl px-4 py-3.5 text-[#1A1A24] font-bold focus:ring-2 focus:ring-[#0A3D91] focus:border-[#0A3D91] transition-all"
                >
                  {WEIGHT_CLASSES.map(weight => (
                    <option key={weight} value={weight}>
                      {weight}kg
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-black text-[#707070] uppercase tracking-wider mb-2">
                  Organization *
                </label>
                <select
                  value={formData.organization}
                  onChange={(e) => setFormData({ ...formData, organization: e.target.value as any })}
                  className="w-full bg-[#F4F5F8] border-2 border-[#E0E0E0] rounded-xl px-4 py-3.5 text-[#1A1A24] font-bold focus:ring-2 focus:ring-[#0A3D91] focus:border-[#0A3D91] transition-all"
                >
                  <option value="KKF">KKF</option>
                  <option value="WBC">WBC</option>
                  <option value="WBA">WBA</option>
                  <option value="WMC">WMC</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs font-black text-[#707070] uppercase tracking-wider mb-2">
                  Initial Status *
                </label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value as ChampionStatus })}
                  className="w-full bg-[#F4F5F8] border-2 border-[#E0E0E0] rounded-xl px-4 py-3.5 text-[#1A1A24] font-bold focus:ring-2 focus:ring-[#0A3D91] focus:border-[#0A3D91] transition-all"
                >
                  <option value="Vacant">Vacant - No current holder (up for grabs)</option>
                  <option value="Active">Active - Has current holder</option>
                  <option value="Title Defense Scheduled">Title Defense Scheduled - Upcoming defense</option>
                  <option value="Inactive">Inactive - Holder unavailable</option>
                </select>
                <p className="mt-2 text-xs font-bold text-[#707070]">
                  💡 Most new championships start as "Vacant" until a title fight determines the first champion
                </p>
              </div>
            </div>
          </div>

          {/* Event/Batch Association */}
          <div className="bg-white rounded-3xl p-6 shadow-[0_8px_30px_rgba(0,0,0,0.08)] border border-[#E0E0E0]/50">
            <h2 className="text-xl font-black text-[#1A1A24] uppercase mb-4 flex items-center gap-2">
              <MapPin className="w-5 h-5 text-[#C41E3A]" />
              Event Association
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-black text-[#707070] uppercase tracking-wider mb-2">
                  Select Event/Batch *
                </label>
                <select
                  value={formData.batchId}
                  onChange={(e) => {
                    setFormData({ ...formData, batchId: e.target.value });
                    setErrors({ ...errors, batchId: "" });
                  }}
                  className={`w-full bg-[#F4F5F8] border-2 rounded-xl px-4 py-3.5 text-[#1A1A24] font-bold focus:ring-2 focus:ring-[#0A3D91] transition-all ${
                    errors.batchId ? "border-red-500" : "border-[#E0E0E0] focus:border-[#0A3D91]"
                  }`}
                >
                  <option value="">-- Select Event/Batch --</option>
                  {MOCK_BATCHES.map(batch => (
                    <option key={batch.id} value={batch.id}>
                      {batch.eventName} - {new Date(batch.eventDate).toLocaleDateString()}
                    </option>
                  ))}
                </select>
                {errors.batchId && (
                  <p className="mt-1 text-xs font-bold text-red-600 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    {errors.batchId}
                  </p>
                )}
                <p className="mt-2 text-xs font-bold text-[#707070]">
                  💡 This championship will belong to the selected event
                </p>
              </div>

              {selectedBatch && (
                <div className="p-4 bg-gradient-to-r from-blue-50 to-white rounded-xl border-2 border-blue-100">
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                    <div>
                      <div className="text-xs font-bold text-[#707070] mb-1">Event Name</div>
                      <div className="font-black text-[#1A1A24]">{selectedBatch.eventName}</div>
                    </div>
                    <div>
                      <div className="text-xs font-bold text-[#707070] mb-1">Date</div>
                      <div className="font-black text-[#1A1A24]">
                        {new Date(selectedBatch.eventDate).toLocaleDateString()}
                      </div>
                    </div>
                    <div>
                      <div className="text-xs font-bold text-[#707070] mb-1">Location</div>
                      <div className="font-black text-[#1A1A24]">{selectedBatch.location}</div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Additional Notes */}
          <div className="bg-white rounded-3xl p-6 shadow-[0_8px_30px_rgba(0,0,0,0.08)] border border-[#E0E0E0]/50">
            <h2 className="text-xl font-black text-[#1A1A24] uppercase mb-4 flex items-center gap-2">
              <Star className="w-5 h-5 text-[#707070]" />
              Additional Information
            </h2>

            <div>
              <label className="block text-xs font-black text-[#707070] uppercase tracking-wider mb-2">
                Notes (Optional)
              </label>
              <textarea
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="Add any additional notes about this championship..."
                rows={4}
                className="w-full bg-[#F4F5F8] border-2 border-[#E0E0E0] rounded-xl px-4 py-3.5 text-[#1A1A24] font-bold focus:ring-2 focus:ring-[#0A3D91] focus:border-[#0A3D91] transition-all resize-none"
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4">
            <button
              type="button"
              onClick={() => navigate("/home/champion")}
              className="flex-1 px-8 py-4 bg-white border-2 border-[#E0E0E0] text-[#1A1A24] rounded-2xl font-black uppercase hover:border-[#707070] transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 inline-flex items-center justify-center gap-2 px-8 py-4 bg-gradient-to-r from-[#F2C94C] to-[#E6B800] hover:from-[#E6B800] hover:to-[#D4A000] text-[#1A1A24] rounded-2xl font-black uppercase transition-all shadow-xl hover:shadow-2xl"
            >
              <Save className="w-5 h-5" />
              Create Championship
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}