import { useState } from "react";
import { Link, useNavigate } from "react-router";
import {
  Trophy, Plus, Award, Crown, Star, Shield,
  Search, Filter, Calendar, MapPin, TrendingUp, Swords,
  CheckCircle, Clock, User, Weight, X, Eye, History,
  CalendarClock, Target, Flame, XCircle, Zap, AlertCircle
} from "lucide-react";
import {
  MOCK_CHAMPIONS,
  CHAMPION_TYPE_CONFIG,
  CHAMPION_STATUS_CONFIG,
  WEIGHT_CLASSES,
  getChampionsByType,
  getActiveChampions,
  type ChampionType,
  type ChampionStatus
} from "../data/champion";
import { usePermissions } from "../hooks/usePermissions";

export function Champion() {
  const navigate = useNavigate();
  const permissions = usePermissions();
  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState<string>("all");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [filterWeight, setFilterWeight] = useState<string>("all");
  const [filterOrganization, setFilterOrganization] = useState<string>("all");
  const [sortBy, setSortBy] = useState<"recent" | "defenses" | "weight" | "reign">("recent");
  const [viewMode, setViewMode] = useState<"grid" | "compact">("grid");

  // Filter champions
  let filteredChampions = MOCK_CHAMPIONS;

  if (filterType !== "all") {
    filteredChampions = filteredChampions.filter(c => c.championType === filterType);
  }

  if (filterStatus !== "all") {
    filteredChampions = filteredChampions.filter(c => c.status === filterStatus);
  }

  if (filterWeight !== "all") {
    filteredChampions = filteredChampions.filter(c => c.weightClass === parseFloat(filterWeight));
  }

  if (filterOrganization !== "all") {
    filteredChampions = filteredChampions.filter(c => c.organization === filterOrganization);
  }

  if (search) {
    filteredChampions = filteredChampions.filter(c =>
      (c.currentHolderName?.toLowerCase().includes(search.toLowerCase()) || false) ||
      c.titleName.toLowerCase().includes(search.toLowerCase()) ||
      c.eventName.toLowerCase().includes(search.toLowerCase())
    );
  }

  // Sort champions
  const sortedChampions = [...filteredChampions].sort((a, b) => {
    if (sortBy === "recent") {
      return new Date(b.dateAwarded || b.dateCreated).getTime() - new Date(a.dateAwarded || a.dateCreated).getTime();
    } else if (sortBy === "defenses") {
      return b.defenseCount - a.defenseCount;
    } else if (sortBy === "reign") {
      // Calculate days as champion
      const daysA = a.dateAwarded ? Math.floor((new Date().getTime() - new Date(a.dateAwarded).getTime()) / (1000 * 60 * 60 * 24)) : 0;
      const daysB = b.dateAwarded ? Math.floor((new Date().getTime() - new Date(b.dateAwarded).getTime()) / (1000 * 60 * 60 * 24)) : 0;
      return daysB - daysA;
    } else {
      return a.weightClass - b.weightClass;
    }
  });

  // Calculate days as champion helper
  const getDaysAsChampion = (dateAwarded?: string): number => {
    if (!dateAwarded) return 0;
    return Math.floor((new Date().getTime() - new Date(dateAwarded).getTime()) / (1000 * 60 * 60 * 24));
  };

  // Get insights
  const vacantTitles = MOCK_CHAMPIONS.filter(c => c.status === "Vacant");
  const scheduledDefenses = MOCK_CHAMPIONS.filter(c => c.status === "Title Defense Scheduled");
  const topChampions = [...MOCK_CHAMPIONS]
    .filter(c => c.status === "Active")
    .sort((a, b) => b.defenseCount - a.defenseCount)
    .slice(0, 3);
  
  const longestReign = [...MOCK_CHAMPIONS]
    .filter(c => c.currentHolderName && c.dateAwarded)
    .sort((a, b) => getDaysAsChampion(b.dateAwarded) - getDaysAsChampion(a.dateAwarded))[0];

  const activeFiltersCount = [filterType, filterStatus, filterWeight, filterOrganization].filter(f => f !== "all").length;

  const clearFilters = () => {
    setFilterType("all");
    setFilterStatus("all");
    setFilterWeight("all");
    setFilterOrganization("all");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F4F5F8] via-white to-[#F9FAFB]">
      <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-3 mb-3">
              <div className="w-16 h-16 bg-gradient-to-br from-[#F2C94C] to-[#E6B800] rounded-2xl flex items-center justify-center shadow-xl">
                <Trophy className="w-9 h-9 text-[#1A1A24]" />
              </div>
              <div>
                <h1 className="text-5xl md:text-6xl font-black tracking-tighter text-[#1A1A24] uppercase leading-none">
                  CHAMPIONS
                </h1>
                <p className="text-[#707070] font-medium text-lg mt-1">
                  KKF Title Holders & Award Winners
                </p>
              </div>
            </div>
            <div className="flex items-center gap-4 text-sm font-bold">
              <div className="flex items-center gap-2 text-[#0A3D91]">
                <Trophy className="w-4 h-4" />
                <span>{sortedChampions.length} Total</span>
              </div>
              <div className="flex items-center gap-2 text-green-600">
                <CheckCircle className="w-4 h-4" />
                <span>{getActiveChampions().length} Active</span>
              </div>
              <div className="flex items-center gap-2 text-red-600">
                <XCircle className="w-4 h-4" />
                <span>{vacantTitles.length} Vacant</span>
              </div>
            </div>
          </div>

          {permissions.hasPermission('events.create') && (
            <Link
              to="/home/champion/new"
              className="inline-flex items-center justify-center gap-2 bg-gradient-to-r from-[#F2C94C] to-[#E6B800] hover:from-[#E6B800] hover:to-[#D4A000] text-[#1A1A24] px-8 py-4 rounded-2xl font-black uppercase tracking-wider transition-all shadow-xl hover:shadow-2xl hover:scale-[1.02]"
            >
              <Crown className="w-5 h-5" />
              Create Championship
            </Link>
          )}
        </header>

        {/* Top Champions Highlight */}
        {topChampions.length > 0 && (
          <div className="bg-gradient-to-r from-[#F2C94C] via-[#FFB81C] to-[#F2C94C] rounded-3xl p-6 shadow-xl">
            <div className="flex items-center gap-2 mb-4">
              <Star className="w-5 h-5 text-[#1A1A24]" />
              <h2 className="text-xl font-black text-[#1A1A24] uppercase">Top Champions</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {topChampions.map((champ, index) => (
                <Link
                  key={champ.id}
                  to={`/home/champion/${champ.id}`}
                  className="bg-white/90 backdrop-blur-sm rounded-2xl p-4 hover:bg-white transition-all group"
                >
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      {champ.currentHolderPhoto ? (
                        <img
                          src={champ.currentHolderPhoto}
                          alt={champ.currentHolderName || ""}
                          className="w-14 h-14 rounded-xl object-cover"
                        />
                      ) : (
                        <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-[#0A3D91] to-[#051C42] flex items-center justify-center">
                          <Trophy className="w-7 h-7 text-white" />
                        </div>
                      )}
                      <div className="absolute -top-2 -right-2 w-6 h-6 bg-[#1A1A24] text-white rounded-full flex items-center justify-center text-xs font-black">
                        {index + 1}
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-black text-[#1A1A24] truncate">
                        {champ.currentHolderName || "Vacant"}
                      </div>
                      <div className="text-xs font-bold text-[#707070] truncate">
                        {champ.weightClass}kg {champ.championType}
                      </div>
                      <div className="flex items-center gap-1 text-xs font-black text-green-600 mt-1">
                        <CheckCircle className="w-3 h-3" />
                        {champ.defenseCount} Defenses
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Vacant Titles Alert */}
        {vacantTitles.length > 0 && (
          <div className="bg-gradient-to-r from-red-50 to-white border-2 border-red-200 rounded-2xl p-4">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 bg-red-500 rounded-xl flex items-center justify-center flex-shrink-0">
                <Trophy className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-black text-[#1A1A24] mb-1">
                  {vacantTitles.length} Vacant Title{vacantTitles.length > 1 ? 's' : ''} Available
                </h3>
                <p className="text-sm font-bold text-[#707070] mb-3">
                  These championships are up for grabs. Schedule title fights to crown new champions!
                </p>
                <div className="flex flex-wrap gap-2">
                  {vacantTitles.slice(0, 5).map(title => (
                    <span key={title.id} className="px-3 py-1.5 bg-white rounded-lg text-xs font-black text-red-600 border border-red-200">
                      {title.weightClass}kg {title.championType}
                    </span>
                  ))}
                  {vacantTitles.length > 5 && (
                    <span className="px-3 py-1.5 bg-white rounded-lg text-xs font-black text-[#707070] border border-gray-200">
                      +{vacantTitles.length - 5} more
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Scheduled Defenses Alert */}
        {scheduledDefenses.length > 0 && (
          <div className="bg-gradient-to-r from-yellow-50 to-white border-2 border-yellow-200 rounded-2xl p-4">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 bg-yellow-500 rounded-xl flex items-center justify-center flex-shrink-0">
                <CalendarClock className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-black text-[#1A1A24] mb-1">
                  {scheduledDefenses.length} Title Defense{scheduledDefenses.length > 1 ? 's' : ''} Scheduled
                </h3>
                <p className="text-sm font-bold text-[#707070] mb-3">
                  These championships have upcoming title defenses. Ensure the events are planned and executed.
                </p>
                <div className="flex flex-wrap gap-2">
                  {scheduledDefenses.slice(0, 5).map(title => (
                    <span key={title.id} className="px-3 py-1.5 bg-white rounded-lg text-xs font-black text-yellow-600 border border-yellow-200">
                      {title.weightClass}kg {title.championType}
                    </span>
                  ))}
                  {scheduledDefenses.length > 5 && (
                    <span className="px-3 py-1.5 bg-white rounded-lg text-xs font-black text-[#707070] border border-gray-200">
                      +{scheduledDefenses.length - 5} more
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Longest Reign Alert */}
        {longestReign && (
          <div className="bg-gradient-to-r from-blue-50 to-white border-2 border-blue-200 rounded-2xl p-4">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 bg-blue-500 rounded-xl flex items-center justify-center flex-shrink-0">
                <Trophy className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-black text-[#1A1A24] mb-1">
                  Longest Reign: {longestReign.currentHolderName}
                </h3>
                <p className="text-sm font-bold text-[#707070] mb-3">
                  {longestReign.currentHolderName} has held the {longestReign.weightClass}kg {longestReign.championType} title for {getDaysAsChampion(longestReign.dateAwarded)} days.
                </p>
                <div className="flex flex-wrap gap-2">
                  <span className="px-3 py-1.5 bg-white rounded-lg text-xs font-black text-blue-600 border border-blue-200">
                    {longestReign.weightClass}kg {longestReign.championType}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Search & Filters */}
        <div className="bg-white rounded-3xl p-6 shadow-[0_8px_30px_rgba(0,0,0,0.08)] border border-[#E0E0E0]/50">
          {/* Search Bar */}
          <div className="relative mb-4">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#707070]" />
            <input
              type="text"
              placeholder="Search by champion name, title, event..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-[#F4F5F8] border-2 border-[#E0E0E0] rounded-xl pl-12 pr-4 py-3.5 text-[#1A1A24] font-semibold focus:ring-2 focus:ring-[#0A3D91] focus:border-[#0A3D91] transition-all placeholder:text-[#B0B0B0]"
            />
          </div>

          {/* Filter Chips */}
          <div className="flex flex-wrap gap-2 mb-4">
            <button
              onClick={() => setFilterType("all")}
              className={`px-4 py-2 rounded-lg text-xs font-black uppercase tracking-wider transition-all ${
                filterType === "all"
                  ? "bg-[#0A3D91] text-white"
                  : "bg-[#F4F5F8] text-[#707070] hover:bg-[#E0E0E0]"
              }`}
            >
              All Types
            </button>
            {Object.entries(CHAMPION_TYPE_CONFIG).slice(0, 6).map(([key, config]) => (
              <button
                key={key}
                onClick={() => setFilterType(key)}
                className={`px-4 py-2 rounded-lg text-xs font-black uppercase tracking-wider transition-all ${
                  filterType === key
                    ? `${config.bgColor} ${config.color} border-2 border-current`
                    : "bg-[#F4F5F8] text-[#707070] hover:bg-[#E0E0E0]"
                }`}
              >
                {config.icon} {config.label.replace(" Champion", "").replace(" Belt", "")}
              </button>
            ))}
          </div>

          {/* Advanced Filters Row */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="bg-[#F4F5F8] border-2 border-[#E0E0E0] rounded-xl px-4 py-3 text-sm text-[#1A1A24] font-bold focus:ring-2 focus:ring-[#0A3D91] focus:border-[#0A3D91] transition-all"
            >
              <option value="all">All Statuses</option>
              {Object.entries(CHAMPION_STATUS_CONFIG).map(([key, config]) => (
                <option key={key} value={key}>
                  {config.label}
                </option>
              ))}
            </select>

            <select
              value={filterWeight}
              onChange={(e) => setFilterWeight(e.target.value)}
              className="bg-[#F4F5F8] border-2 border-[#E0E0E0] rounded-xl px-4 py-3 text-sm text-[#1A1A24] font-bold focus:ring-2 focus:ring-[#0A3D91] focus:border-[#0A3D91] transition-all"
            >
              <option value="all">All Weights</option>
              {WEIGHT_CLASSES.map(weight => (
                <option key={weight} value={weight}>
                  {weight}kg
                </option>
              ))}
            </select>

            <select
              value={filterOrganization}
              onChange={(e) => setFilterOrganization(e.target.value)}
              className="bg-[#F4F5F8] border-2 border-[#E0E0E0] rounded-xl px-4 py-3 text-sm text-[#1A1A24] font-bold focus:ring-2 focus:ring-[#0A3D91] focus:border-[#0A3D91] transition-all"
            >
              <option value="all">All Organizations</option>
              {Array.from(new Set(MOCK_CHAMPIONS.map(c => c.organization))).map(org => (
                <option key={org} value={org}>
                  {org}
                </option>
              ))}
            </select>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="bg-[#F4F5F8] border-2 border-[#E0E0E0] rounded-xl px-4 py-3 text-sm text-[#1A1A24] font-bold focus:ring-2 focus:ring-[#0A3D91] focus:border-[#0A3D91] transition-all"
            >
              <option value="recent">Sort: Most Recent</option>
              <option value="defenses">Sort: Most Defenses</option>
              <option value="weight">Sort: Weight Class</option>
              <option value="reign">Sort: Longest Reign</option>
            </select>

            {activeFiltersCount > 0 && (
              <button
                onClick={clearFilters}
                className="inline-flex items-center justify-center gap-2 bg-red-500 hover:bg-red-600 text-white px-4 py-3 rounded-xl text-sm font-bold transition-all"
              >
                <X className="w-4 h-4" />
                Clear Filters ({activeFiltersCount})
              </button>
            )}
          </div>
        </div>

        {/* Champions List */}
        {sortedChampions.length === 0 ? (
          <div className="bg-white rounded-3xl p-16 text-center shadow-[0_8px_30px_rgba(0,0,0,0.08)] border border-[#E0E0E0]/50">
            <Trophy className="w-20 h-20 text-[#E0E0E0] mx-auto mb-6" />
            <h3 className="text-2xl font-black text-[#1A1A24] mb-3">No Champions Found</h3>
            <p className="text-[#707070] font-medium text-lg mb-8">
              No champions match your current filters. Try adjusting your search.
            </p>
            {activeFiltersCount > 0 && (
              <button
                onClick={clearFilters}
                className="inline-flex items-center gap-2 bg-[#0A3D91] text-white px-6 py-3 rounded-xl font-bold hover:bg-[#082F6E] transition-all"
              >
                <X className="w-5 h-5" />
                Clear All Filters
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            {sortedChampions.map((champion) => {
              const typeConfig = CHAMPION_TYPE_CONFIG[champion.championType];
              const statusConfig = CHAMPION_STATUS_CONFIG[champion.status];

              return (
                <Link
                  key={champion.id}
                  to={`/home/champion/${champion.id}`}
                  className="block bg-white rounded-2xl overflow-hidden shadow-[0_4px_20px_rgba(0,0,0,0.06)] border border-[#E0E0E0]/50 hover:shadow-[0_12px_40px_rgba(0,0,0,0.12)] transition-all group hover:scale-[1.01]"
                >
                  <div className="p-5">
                    {/* Header Row */}
                    <div className="flex items-start gap-4 mb-4">
                      {/* Champion Photo */}
                      <div className="relative flex-shrink-0">
                        {champion.currentHolderPhoto ? (
                          <img
                            src={champion.currentHolderPhoto}
                            alt={champion.currentHolderName || "Vacant"}
                            className="w-20 h-20 rounded-xl object-cover border-2 border-[#E0E0E0]"
                          />
                        ) : (
                          <div className="w-20 h-20 rounded-xl bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center border-2 border-[#E0E0E0]">
                            <Trophy className="w-10 h-10 text-gray-400" />
                          </div>
                        )}
                        {champion.status === "Active" && champion.currentHolderName && (
                          <div className="absolute -bottom-1 -right-1 w-7 h-7 bg-gradient-to-br from-[#F2C94C] to-[#E6B800] rounded-full flex items-center justify-center border-2 border-white">
                            <Crown className="w-4 h-4 text-[#1A1A24]" />
                          </div>
                        )}
                      </div>

                      {/* Champion Info */}
                      <div className="flex-1 min-w-0">
                        {/* Name */}
                        <h2 className="text-2xl font-black text-[#1A1A24] mb-1 leading-tight group-hover:text-[#0A3D91] transition-colors truncate">
                          {champion.currentHolderName || "VACANT"}
                        </h2>
                        
                        {/* Title - Rewritten Format */}
                        <div className="text-sm font-black text-[#707070] mb-2 leading-tight">
                          {champion.weightClass}kg {champion.championType}
                        </div>

                        {/* Status & Type Badges */}
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider ${statusConfig.bgColor} ${statusConfig.color}`}>
                            {statusConfig.label}
                          </span>
                          <span className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider ${typeConfig.bgColor} ${typeConfig.color}`}>
                            {typeConfig.icon} {typeConfig.label.split(" ")[0]}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Key Info Row - Weight, Organization, Won Date */}
                    <div className="grid grid-cols-3 gap-2 mb-4">
                      <div className="bg-gradient-to-r from-blue-50 to-white rounded-lg p-2.5 border border-blue-100">
                        <div className="flex items-center gap-1.5">
                          <Weight className="w-3.5 h-3.5 text-[#0A3D91] flex-shrink-0" />
                          <div className="min-w-0">
                            <div className="text-[9px] font-black text-[#B0B0B0] uppercase tracking-wider">Weight</div>
                            <div className="text-xs font-black text-[#1A1A24]">{champion.weightClass}kg</div>
                          </div>
                        </div>
                      </div>

                      <div className="bg-gradient-to-r from-red-50 to-white rounded-lg p-2.5 border border-red-100">
                        <div className="flex items-center gap-1.5">
                          <Shield className="w-3.5 h-3.5 text-[#C8102E] flex-shrink-0" />
                          <div className="min-w-0">
                            <div className="text-[9px] font-black text-[#B0B0B0] uppercase tracking-wider">Org</div>
                            <div className="text-xs font-black text-[#1A1A24] truncate">{champion.organization}</div>
                          </div>
                        </div>
                      </div>

                      <div className="bg-gradient-to-r from-amber-50 to-white rounded-lg p-2.5 border border-amber-100">
                        <div className="flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5 text-[#F2C94C] flex-shrink-0" />
                          <div className="min-w-0">
                            <div className="text-[9px] font-black text-[#B0B0B0] uppercase tracking-wider">Won</div>
                            <div className="text-xs font-black text-[#1A1A24]">
                              {champion.dateAwarded ? new Date(champion.dateAwarded).toLocaleDateString('en-US', { month: 'short', year: '2-digit' }) : 'N/A'}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Title Won At Section */}
                    <div className="bg-gradient-to-r from-[#F4F5F8] to-white rounded-xl p-3 mb-4 border border-[#E0E0E0]">
                      <div className="text-[10px] font-black text-[#B0B0B0] uppercase tracking-wider mb-1.5">
                        🏆 Title Won At
                      </div>
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <MapPin className="w-3.5 h-3.5 text-[#0A3D91] flex-shrink-0" />
                          <span className="text-sm font-black text-[#1A1A24] truncate">
                            {champion.eventName}
                          </span>
                        </div>
                        {champion.nationality && (
                          <div className="flex items-center gap-2">
                            <User className="w-3.5 h-3.5 text-[#707070] flex-shrink-0" />
                            <span className="text-xs font-bold text-[#707070]">
                              {champion.nationality}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Stats Row */}
                    <div className="grid grid-cols-3 gap-3 mb-4 pb-4 border-b-2 border-[#E0E0E0]">
                      <div className="text-center">
                        <div className="flex items-center justify-center gap-1 mb-1">
                          <CheckCircle className="w-3.5 h-3.5 text-green-600" />
                          <span className="text-lg font-black text-[#1A1A24]">{champion.defenseCount}</span>
                        </div>
                        <div className="text-[9px] font-black text-[#B0B0B0] uppercase tracking-wider">Defenses</div>
                      </div>

                      <div className="text-center">
                        <div className="flex items-center justify-center gap-1 mb-1">
                          <Flame className="w-3.5 h-3.5 text-orange-500" />
                          <span className="text-lg font-black text-[#1A1A24]">
                            {champion.defenseCount > 0 ? champion.defenseCount : '-'}
                          </span>
                        </div>
                        <div className="text-[9px] font-black text-[#B0B0B0] uppercase tracking-wider">Win Streak</div>
                      </div>

                      <div className="text-center">
                        <div className="flex items-center justify-center gap-1 mb-1">
                          <Star className="w-3.5 h-3.5 text-amber-500" />
                          <span className="text-lg font-black text-[#1A1A24]">
                            {champion.specialTitles?.length || 0}
                          </span>
                        </div>
                        <div className="text-[9px] font-black text-[#B0B0B0] uppercase tracking-wider">Awards</div>
                      </div>
                    </div>

                    {/* Quick Actions */}
                    <div className="grid grid-cols-3 gap-2">
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          navigate(`/home/champion/${champion.id}`);
                        }}
                        className="flex items-center justify-center gap-1.5 bg-[#F4F5F8] hover:bg-[#0A3D91] text-[#707070] hover:text-white px-3 py-2 rounded-lg text-xs font-bold transition-all group/btn"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span className="hidden sm:inline">Profile</span>
                      </button>
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          navigate(`/home/champion/${champion.id}/history`);
                        }}
                        className="flex items-center justify-center gap-1.5 bg-[#F4F5F8] hover:bg-[#0A3D91] text-[#707070] hover:text-white px-3 py-2 rounded-lg text-xs font-bold transition-all group/btn"
                      >
                        <History className="w-3.5 h-3.5" />
                        <span className="hidden sm:inline">History</span>
                      </button>
                      {champion.status === "Active" && permissions.hasPermission('events.create') && (
                        <button
                          onClick={(e) => {
                            e.preventDefault();
                            navigate(`/home/champion/${champion.id}/schedule-defense`);
                          }}
                          className="flex items-center justify-center gap-1.5 bg-gradient-to-r from-[#F2C94C] to-[#E6B800] hover:from-[#E6B800] hover:to-[#D4A000] text-[#1A1A24] px-3 py-2 rounded-lg text-xs font-bold transition-all"
                        >
                          <CalendarClock className="w-3.5 h-3.5" />
                          <span className="hidden sm:inline">Defense</span>
                        </button>
                      )}
                      {champion.status === "Vacant" && permissions.hasPermission('events.create') && (
                        <button
                          onClick={(e) => {
                            e.preventDefault();
                            navigate(`/home/match/new?championId=${champion.id}`);
                          }}
                          className="flex items-center justify-center gap-1.5 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white px-3 py-2 rounded-lg text-xs font-bold transition-all"
                        >
                          <Target className="w-3.5 h-3.5" />
                          <span className="hidden sm:inline">Title Fight</span>
                        </button>
                      )}
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}