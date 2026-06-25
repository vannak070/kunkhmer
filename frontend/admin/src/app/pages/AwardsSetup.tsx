import { useState } from "react";
import { useNavigate } from "react-router";
import { 
  Trophy, Plus, Award as AwardIcon, Medal, Crown, Star,
  DollarSign, Calendar, MapPin, Users, Save, X, Search,
  Filter, ChevronDown
} from "lucide-react";
import { 
  MOCK_AWARDS, 
  AWARD_CATEGORY_CONFIG,
  AWARD_TYPE_CONFIG,
  AWARD_LEVEL_CONFIG,
  getAwardsByCategory,
  getAwardsByYear,
  type Award,
  type AwardCategory,
  type AwardType,
  type AwardLevel,
  type AwardOrganization
} from "../data/awards";
import { AwardCard, AwardsByCategory } from "../components/AwardCard";
import { usePermissions } from "../hooks/usePermissions";

export function AwardsSetup() {
  const navigate = useNavigate();
  const permissions = usePermissions();
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [filterYear, setFilterYear] = useState<string>('all');
  const [search, setSearch] = useState("");
  
  // Filter awards
  let filteredAwards = MOCK_AWARDS;
  
  if (filterCategory !== 'all') {
    filteredAwards = filteredAwards.filter(a => a.category === filterCategory);
  }
  
  if (filterYear !== 'all') {
    filteredAwards = filteredAwards.filter(a => a.year === parseInt(filterYear));
  }
  
  if (search) {
    filteredAwards = filteredAwards.filter(a =>
      a.title.toLowerCase().includes(search.toLowerCase()) ||
      a.description.toLowerCase().includes(search.toLowerCase()) ||
      a.winnerName?.toLowerCase().includes(search.toLowerCase())
    );
  }
  
  // Available years
  const availableYears = [...new Set(MOCK_AWARDS.map(a => a.year))].sort((a, b) => b - a);
  
  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-4xl font-black tracking-tight uppercase text-[#0A3D91]">
            🏆 KUN KHMER Awards
          </h1>
          <p className="text-[#707070] mt-2 font-medium text-lg">
            Fighter achievements and recognition system
          </p>
        </div>
        {permissions.canCreate('events') && (
          <button
            onClick={() => navigate('/awards/new')}
            className="inline-flex items-center gap-2 bg-gradient-to-r from-[#C8102E] to-[#A00D24] hover:from-[#A00D24] hover:to-[#8A0B20] text-white px-6 py-3.5 rounded-xl font-bold transition-all shadow-lg hover:shadow-xl hover:scale-[1.02]"
          >
            <Plus className="w-5 h-5" />
            Setup New Award
          </button>
        )}
      </header>
      
      {/* Filters & Search */}
      <div className="flex flex-col gap-4">
        <div className="relative flex-1 group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#B0B0B0] group-focus-within:text-[#0A3D91] transition-colors" />
          <input
            type="text"
            placeholder="Search awards by title, description, or winner..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-white border-2 border-[#E0E0E0] rounded-xl pl-12 pr-4 py-4 text-[#1A1A24] font-semibold placeholder:text-[#B0B0B0] focus:outline-none focus:ring-2 focus:ring-[#0A3D91] focus:border-[#0A3D91] shadow-sm transition-all"
          />
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-black text-[#707070] uppercase tracking-wider mb-2">
              Category
            </label>
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="w-full bg-white border-2 border-[#E0E0E0] rounded-xl px-4 py-3 text-[#1A1A24] font-semibold appearance-none focus:outline-none focus:ring-2 focus:ring-[#0A3D91] focus:border-[#0A3D91] shadow-sm transition-all cursor-pointer"
            >
              <option value="all">All Categories</option>
              {Object.entries(AWARD_CATEGORY_CONFIG).map(([key, config]) => (
                <option key={key} value={key}>
                  {config.icon} {config.label}
                </option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-xs font-black text-[#707070] uppercase tracking-wider mb-2">
              Year
            </label>
            <select
              value={filterYear}
              onChange={(e) => setFilterYear(e.target.value)}
              className="w-full bg-white border-2 border-[#E0E0E0] rounded-xl px-4 py-3 text-[#1A1A24] font-semibold appearance-none focus:outline-none focus:ring-2 focus:ring-[#0A3D91] focus:border-[#0A3D91] shadow-sm transition-all cursor-pointer"
            >
              <option value="all">All Years</option>
              {availableYears.map(year => (
                <option key={year} value={year}>{year}</option>
              ))}
            </select>
          </div>
        </div>
      </div>
      
      {/* Awards List */}
      <div>
        <h2 className="text-2xl font-black text-[#1A1A24] mb-4">
          Awards ({filteredAwards.length})
        </h2>
        <AwardsByCategory awards={filteredAwards} />
      </div>
    </div>
  );
}