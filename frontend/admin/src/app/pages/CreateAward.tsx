import { useState } from "react";
import { useNavigate } from "react-router";
import { Trophy, Save, X, ArrowLeft } from "lucide-react";
import {
  MOCK_AWARDS,
  AWARD_CATEGORY_CONFIG,
  AWARD_TYPE_CONFIG,
  AWARD_LEVEL_CONFIG,
  type Award,
  type AwardCategory,
  type AwardType,
  type AwardLevel,
  type AwardOrganization
} from "../data/awards";

export function CreateAward() {
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState<Partial<Award>>({
    category: 'national',
    type: 'national_champion_belt',
    organization: 'KKF',
    status: 'pending',
    year: new Date().getFullYear(),
  });
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Create new award
    const newAward: Award = {
      id: `aw${MOCK_AWARDS.length + 1}`,
      category: formData.category!,
      type: formData.type!,
      level: formData.level,
      title: formData.title!,
      description: formData.description!,
      organization: formData.organization!,
      awardedDate: formData.awardedDate || new Date().toISOString(),
      year: formData.year!,
      status: formData.status as any,
      ...formData,
    };
    
    MOCK_AWARDS.push(newAward);
    
    alert(`Award "${newAward.title}" created successfully!`);
    navigate('/awards-setup');
  };
  
  return (
    <div className="p-4 md:p-8 max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <header className="flex items-center gap-4">
        <button
          onClick={() => navigate('/awards-setup')}
          className="p-3 hover:bg-[#F4F5F8] rounded-xl transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-[#707070]" />
        </button>
        <div>
          <h1 className="text-4xl font-black tracking-tight uppercase text-[#0A3D91]">
            Setup New Award
          </h1>
          <p className="text-[#707070] mt-2 font-medium">
            Configure award details and winner information
          </p>
        </div>
      </header>

      {/* Form */}
      <div className="p-8 bg-white border-2 border-[#E0E0E0] rounded-2xl shadow-xl">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Award Information Section */}
          <div>
            <h2 className="text-xl font-black text-[#1A1A24] mb-4 uppercase tracking-wide flex items-center gap-2">
              <Trophy className="w-5 h-5 text-[#0A3D91]" />
              Award Information
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Category */}
              <div>
                <label className="block text-sm font-black text-[#1A1A24] mb-2 uppercase tracking-wide">
                  Award Category *
                </label>
                <select
                  required
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value as AwardCategory, type: undefined })}
                  className="w-full px-4 py-3 border-2 border-[#E0E0E0] rounded-xl font-semibold focus:outline-none focus:ring-2 focus:ring-[#0A3D91] focus:border-[#0A3D91]"
                >
                  {Object.entries(AWARD_CATEGORY_CONFIG).map(([key, config]) => (
                    <option key={key} value={key}>
                      {config.icon} {config.label}
                    </option>
                  ))}
                </select>
              </div>
              
              {/* Type */}
              <div>
                <label className="block text-sm font-black text-[#1A1A24] mb-2 uppercase tracking-wide">
                  Award Type *
                </label>
                <select
                  required
                  value={formData.type || ''}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value as AwardType })}
                  className="w-full px-4 py-3 border-2 border-[#E0E0E0] rounded-xl font-semibold focus:outline-none focus:ring-2 focus:ring-[#0A3D91] focus:border-[#0A3D91]"
                >
                  <option value="">Select Award Type</option>
                  {Object.entries(AWARD_TYPE_CONFIG)
                    .filter(([, config]) => config.category === formData.category)
                    .map(([key, config]) => (
                      <option key={key} value={key}>
                        {config.icon} {config.label}
                      </option>
                    ))}
                </select>
              </div>
              
              {/* Level (if applicable) */}
              {formData.type && AWARD_TYPE_CONFIG[formData.type]?.hasLevel && (
                <div>
                  <label className="block text-sm font-black text-[#1A1A24] mb-2 uppercase tracking-wide">
                    Medal Level
                  </label>
                  <select
                    value={formData.level || ''}
                    onChange={(e) => setFormData({ ...formData, level: e.target.value as AwardLevel })}
                    className="w-full px-4 py-3 border-2 border-[#E0E0E0] rounded-xl font-semibold focus:outline-none focus:ring-2 focus:ring-[#0A3D91] focus:border-[#0A3D91]"
                  >
                    <option value="">No Level</option>
                    {Object.entries(AWARD_LEVEL_CONFIG).map(([key, config]) => (
                      <option key={key} value={key}>
                        {config.icon} {config.label}
                      </option>
                    ))}
                  </select>
                </div>
              )}
              
              {/* Organization */}
              <div>
                <label className="block text-sm font-black text-[#1A1A24] mb-2 uppercase tracking-wide">
                  Organization *
                </label>
                <select
                  required
                  value={formData.organization}
                  onChange={(e) => setFormData({ ...formData, organization: e.target.value as AwardOrganization })}
                  className="w-full px-4 py-3 border-2 border-[#E0E0E0] rounded-xl font-semibold focus:outline-none focus:ring-2 focus:ring-[#0A3D91] focus:border-[#0A3D91]"
                >
                  <option value="IKKF">IKKF - International Kun Khmer Federation</option>
                  <option value="ISKA">ISKA - International Sport Karate</option>
                  <option value="SEA_GAMES">SEA Games</option>
                  <option value="KKF">KKF - Kun Khmer Federation</option>
                  <option value="EVENT">Event-Specific</option>
                </select>
              </div>
              
              {/* Title */}
              <div className="md:col-span-2">
                <label className="block text-sm font-black text-[#1A1A24] mb-2 uppercase tracking-wide">
                  Award Title *
                </label>
                <input
                  type="text"
                  required
                  value={formData.title || ''}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g., KKF National Champion Belt 2026"
                  className="w-full px-4 py-3 border-2 border-[#E0E0E0] rounded-xl font-semibold focus:outline-none focus:ring-2 focus:ring-[#0A3D91] focus:border-[#0A3D91]"
                />
              </div>
              
              {/* Description */}
              <div className="md:col-span-2">
                <label className="block text-sm font-black text-[#1A1A24] mb-2 uppercase tracking-wide">
                  Description *
                </label>
                <textarea
                  required
                  value={formData.description || ''}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Award description..."
                  rows={3}
                  className="w-full px-4 py-3 border-2 border-[#E0E0E0] rounded-xl font-semibold focus:outline-none focus:ring-2 focus:ring-[#0A3D91] focus:border-[#0A3D91]"
                />
              </div>
            </div>
          </div>

          {/* Event & Competition Details */}
          <div className="pt-6 border-t-2 border-[#E0E0E0]">
            <h2 className="text-xl font-black text-[#1A1A24] mb-4 uppercase tracking-wide">
              Event & Competition Details
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Event Name */}
              <div>
                <label className="block text-sm font-black text-[#1A1A24] mb-2 uppercase tracking-wide">
                  Event Name
                </label>
                <input
                  type="text"
                  value={formData.eventName || ''}
                  onChange={(e) => setFormData({ ...formData, eventName: e.target.value })}
                  placeholder="Event name (if applicable)"
                  className="w-full px-4 py-3 border-2 border-[#E0E0E0] rounded-xl font-semibold focus:outline-none focus:ring-2 focus:ring-[#0A3D91] focus:border-[#0A3D91]"
                />
              </div>
              
              {/* Location */}
              <div>
                <label className="block text-sm font-black text-[#1A1A24] mb-2 uppercase tracking-wide">
                  Location
                </label>
                <input
                  type="text"
                  value={formData.location || ''}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  placeholder="e.g., Phnom Penh, Cambodia"
                  className="w-full px-4 py-3 border-2 border-[#E0E0E0] rounded-xl font-semibold focus:outline-none focus:ring-2 focus:ring-[#0A3D91] focus:border-[#0A3D91]"
                />
              </div>
              
              {/* Specific Weight */}
              <div>
                <label className="block text-sm font-black text-[#1A1A24] mb-2 uppercase tracking-wide">
                  Specific Weight
                </label>
                <input
                  type="text"
                  value={formData.weightClass || ''}
                  onChange={(e) => setFormData({ ...formData, weightClass: e.target.value })}
                  placeholder="e.g., 60 kg, 67 kg"
                  className="w-full px-4 py-3 border-2 border-[#E0E0E0] rounded-xl font-semibold focus:outline-none focus:ring-2 focus:ring-[#0A3D91] focus:border-[#0A3D91]"
                />
                <p className="text-xs text-[#707070] mt-1">Enter specific weight (not range)</p>
              </div>
              
              {/* Cash Prize */}
              <div>
                <label className="block text-sm font-black text-[#1A1A24] mb-2 uppercase tracking-wide">
                  Cash Prize ($)
                </label>
                <input
                  type="number"
                  value={formData.cashPrize || ''}
                  onChange={(e) => setFormData({ ...formData, cashPrize: parseFloat(e.target.value) })}
                  placeholder="0"
                  min="0"
                  step="100"
                  className="w-full px-4 py-3 border-2 border-[#E0E0E0] rounded-xl font-semibold focus:outline-none focus:ring-2 focus:ring-[#0A3D91] focus:border-[#0A3D91]"
                />
              </div>
              
              {/* Year */}
              <div>
                <label className="block text-sm font-black text-[#1A1A24] mb-2 uppercase tracking-wide">
                  Year *
                </label>
                <input
                  type="number"
                  required
                  value={formData.year || new Date().getFullYear()}
                  onChange={(e) => setFormData({ ...formData, year: parseInt(e.target.value) })}
                  min="2020"
                  max="2030"
                  className="w-full px-4 py-3 border-2 border-[#E0E0E0] rounded-xl font-semibold focus:outline-none focus:ring-2 focus:ring-[#0A3D91] focus:border-[#0A3D91]"
                />
              </div>
              
              {/* Status */}
              <div>
                <label className="block text-sm font-black text-[#1A1A24] mb-2 uppercase tracking-wide">
                  Status *
                </label>
                <select
                  required
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                  className="w-full px-4 py-3 border-2 border-[#E0E0E0] rounded-xl font-semibold focus:outline-none focus:ring-2 focus:ring-[#0A3D91] focus:border-[#0A3D91]"
                >
                  <option value="pending">Pending</option>
                  <option value="nominated">Nominated</option>
                  <option value="awarded">Awarded</option>
                </select>
              </div>
            </div>
          </div>
          
          {/* Action Buttons */}
          <div className="flex items-center gap-4 pt-6 border-t-2 border-[#E0E0E0]">
            <button
              type="submit"
              className="inline-flex items-center gap-2 bg-gradient-to-r from-[#0A3D91] to-[#051C42] hover:from-[#051C42] hover:to-[#0A3D91] text-white px-8 py-3.5 rounded-xl font-bold transition-all shadow-lg hover:shadow-xl"
            >
              <Save className="w-5 h-5" />
              Create Award
            </button>
            <button
              type="button"
              onClick={() => navigate('/awards-setup')}
              className="inline-flex items-center gap-2 bg-[#E0E0E0] hover:bg-[#D0D0D0] text-[#1A1A24] px-8 py-3.5 rounded-xl font-bold transition-all"
            >
              <X className="w-5 h-5" />
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
