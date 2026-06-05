import { useState } from "react";
import { useNavigate, Link } from "react-router";
import { 
  Eye, Plus, Search, ChevronDown, ChevronUp, Edit3,
  CheckCircle, Clock, FileText, Calendar, MapPin, Users,
  Send, AlertCircle, Edit2, Box, ListPlus, TrendingUp,
  Shield, Trophy, Radio, Award, Building2, X, Copy,
  MoreVertical, Filter, Trash2, CheckSquare, Square,
  LayoutGrid, CalendarDays, Columns3, Download, Share2,
  PlayCircle, PauseCircle
} from "lucide-react";
import { 
  MOCK_BATCHES, 
  BATCH_STATUS_CONFIG, 
  formatDisplayDate
} from "../data/batches";
import type { BatchStatus, MatchBatch } from "../data/batches";
import type { MatchStatus } from "../data/event-types";
import { usePermissions } from "../hooks/usePermissions";
import { toast } from "sonner";
import { clsx } from "clsx";

export function Matches() {
  const permissions = usePermissions();
  const navigate = useNavigate();
  const [batches, setBatches] = useState<MatchBatch[]>(MOCK_BATCHES);
  const [expandedBatchId, setExpandedBatchId] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterLocation, setFilterLocation] = useState("all");
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [filterEvent, setFilterEvent] = useState("all");
  const [filterClub, setFilterClub] = useState("all");
  const [filterFighter, setFilterFighter] = useState("");
  const [filterDateFrom, setFilterDateFrom] = useState("");
  const [filterDateTo, setFilterDateTo] = useState("");
  
  // New state for enhanced features
  const [viewMode, setViewMode] = useState<'list' | 'calendar' | 'kanban'>('list');
  const [selectedBatches, setSelectedBatches] = useState<Set<string>>(new Set());
  const [activeFilters, setActiveFilters] = useState<string[]>([]);
  const [showBulkActions, setShowBulkActions] = useState(false);

  // Helper functions
  const handlePublish = (batchId: string) => {
    setBatches(prev => prev.map(b => {
      if (b.id === batchId) {
        toast.success(`✅ Batch ${b.batchNumber} published!`);
        return {
          ...b,
          status: "Published" as BatchStatus,
          updatedAt: new Date().toISOString(),
        };
      }
      return b;
    }));
  };

  const handleSubmitToKKF = (batchId: string) => {
    // Navigate to assign officials page before submitting
    navigate(`/matches/${batchId}/assign-officials`);
  };
  
  // Filter batches
  let filteredBatches = batches;

  if (filterStatus !== "all") {
    filteredBatches = filteredBatches.filter(b => b.status === filterStatus);
  }

  if (filterLocation !== "all") {
    filteredBatches = filteredBatches.filter(b => 
      b.location.toLowerCase().includes(filterLocation.toLowerCase())
    );
  }

  if (filterEvent !== "all") {
    filteredBatches = filteredBatches.filter(b => b.eventName === filterEvent);
  }

  if (filterClub !== "all") {
    filteredBatches = filteredBatches.filter(b => 
      b.organizerClub === filterClub || b.createdBy === filterClub ||
      b.matches.some(m => m.fighterA.clubName === filterClub || m.fighterB.clubName === filterClub)
    );
  }

  if (filterFighter) {
    filteredBatches = filteredBatches.filter(b =>
      b.matches.some(m => 
        m.fighterA.name.toLowerCase().includes(filterFighter.toLowerCase()) ||
        m.fighterB.name.toLowerCase().includes(filterFighter.toLowerCase())
      )
    );
  }

  if (filterDateFrom) {
    filteredBatches = filteredBatches.filter(b => new Date(b.date) >= new Date(filterDateFrom));
  }

  if (filterDateTo) {
    filteredBatches = filteredBatches.filter(b => new Date(b.date) <= new Date(filterDateTo));
  }

  if (search) {
    filteredBatches = filteredBatches.filter(b =>
      b.batchNumber.toLowerCase().includes(search.toLowerCase()) ||
      b.eventName.toLowerCase().includes(search.toLowerCase()) ||
      b.location.toLowerCase().includes(search.toLowerCase()) ||
      b.matches.some(m => 
        m.fighterA.name.toLowerCase().includes(search.toLowerCase()) ||
        m.fighterB.name.toLowerCase().includes(search.toLowerCase())
      )
    );
  }

  const toggleBatch = (batchId: string) => {
    setExpandedBatchId(prev => prev === batchId ? null : batchId);
  };

  const handleCreateBatch = () => {
    navigate('/home/matches/new');
  };

  const handleViewDetails = (batchId: string) => {
    navigate(`/home/batches/${batchId}`);
  };

  // Calculate summary stats
  const stats = {
    total: batches.length,
    draft: batches.filter(b => b.status === "Draft").length,
    weightIn: batches.filter(b => b.status === "Weight-In").length,
    ready: batches.filter(b => b.status === "Ready").length,
    live: batches.filter(b => b.status === "Live").length,
    complete: batches.filter(b => b.status === "Complete").length,
  };

  // Get unique locations for filter
  const locations = Array.from(new Set(batches.map(b => b.location)));

  // Get unique events for filter
  const events = Array.from(new Set(batches.map(b => b.eventName)));

  // Get unique clubs for filter
  const clubsSet = new Set<string>();
  batches.forEach(b => {
    if (b.organizerClub) clubsSet.add(b.organizerClub);
    if (b.createdBy) clubsSet.add(b.createdBy);
    b.matches.forEach(m => {
      clubsSet.add(m.fighterA.clubName);
      clubsSet.add(m.fighterB.clubName);
    });
  });
  const clubs = Array.from(clubsSet).sort();

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F4F5F8] via-white to-[#F9FAFB]">
      <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-6">
        {/* Enhanced Header */}
        <header className="bg-white rounded-2xl shadow-lg border-2 border-[#E0E0E0] p-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex items-start gap-4">
              <div className="w-14 h-14 bg-gradient-to-br from-[#C8102E] to-[#A00D24] rounded-2xl flex items-center justify-center shadow-lg flex-shrink-0">
                <Box className="w-7 h-7 text-white" />
              </div>
              <div>
                <h1 className="text-3xl md:text-4xl font-black text-[#1A1A24] uppercase tracking-tight mb-2">
                  Match Management
                </h1>
                <p className="text-sm text-[#707070] font-bold">Organize batches and matches for events</p>
              </div>
            </div>

            {permissions.hasPermission('matches.create') && (
              <button
                onClick={handleCreateBatch}
                className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl font-black uppercase tracking-wide transition-all bg-gradient-to-r from-[#C8102E] to-[#A00D24] text-white hover:shadow-xl hover:scale-105 shadow-md"
              >
                <Plus className="w-5 h-5" />
                New Batch
              </button>
            )}
          </div>
        </header>

        {/* Enhanced Status Legend & Stats */}
        <div className="bg-white rounded-2xl shadow-lg border-2 border-[#E0E0E0] overflow-hidden">
          {/* Status Legend */}
          <div className="border-b border-[#E0E0E0] px-6 py-5">
            <h3 className="text-base font-black text-[#1A1A24] mb-4 uppercase tracking-wide">Status Legend</h3>
            <div className="flex flex-wrap items-center gap-6">
              <div className="flex items-center gap-2">
                <span className="text-xl">✏️</span>
                <span className="text-sm font-bold text-[#707070]">Draft</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xl">⚖️</span>
                <span className="text-sm font-bold text-orange-600">Weight-In</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xl">💪</span>
                <span className="text-sm font-bold text-blue-600">Ready</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xl">📡</span>
                <span className="text-sm font-bold text-purple-600">Live</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xl">🏆</span>
                <span className="text-sm font-bold text-[#1A1A24]">Complete</span>
              </div>
            </div>
          </div>

          {/* Stats Row */}
          <div className="grid grid-cols-2 md:grid-cols-5 divide-x divide-[#E0E0E0]">
            <div className="px-6 py-5 text-center">
              <div className="text-3xl font-black text-[#0A3D91] mb-1">{stats.total}</div>
              <div className="text-sm font-bold text-[#707070]">Total Batches</div>
            </div>
            <div className="px-6 py-5 text-center">
              <div className="text-3xl font-black text-gray-600 mb-1">{stats.draft}</div>
              <div className="text-sm font-bold text-[#707070]">Draft</div>
            </div>
            <div className="px-6 py-5 text-center">
              <div className="text-3xl font-black text-orange-600 mb-1">{stats.weightIn}</div>
              <div className="text-sm font-bold text-[#707070]">Weight-In</div>
            </div>
            <div className="px-6 py-5 text-center">
              <div className="text-3xl font-black text-purple-600 mb-1">{stats.live}</div>
              <div className="text-sm font-bold text-[#707070]">Live</div>
            </div>
            <div className="px-6 py-5 text-center">
              <div className="text-3xl font-black text-[#1A1A24] mb-1">{stats.complete}</div>
              <div className="text-sm font-bold text-[#707070]">Complete</div>
            </div>
          </div>
        </div>

        {/* Enhanced Search & Filters */}
        <div className="bg-white rounded-2xl p-6 shadow-lg border-2 border-[#E0E0E0]">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Search */}
            <div className="relative md:col-span-2 group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#707070] group-focus-within:text-[#0A3D91] transition-colors" />
              <input
                type="text"
                placeholder="Search batches, events, fighters..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-[#F4F5F8] border-2 border-[#E0E0E0] rounded-xl pl-12 pr-4 py-3.5 text-sm text-[#1A1A24] font-bold focus:outline-none focus:border-[#0A3D91] focus:ring-2 focus:ring-[#0A3D91]/20 transition-all"
              />
            </div>

            {/* Status Filter */}
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full bg-[#F4F5F8] border-2 border-[#E0E0E0] rounded-xl px-4 py-3.5 text-sm text-[#1A1A24] font-black focus:outline-none focus:border-[#0A3D91] focus:ring-2 focus:ring-[#0A3D91]/20 transition-all hover:border-[#0A3D91]/50 cursor-pointer"
            >
              <option value="all">All Status</option>
              <option value="Draft">✏️ Draft</option>
              <option value="Weight-In">⚖️ Weight-In</option>
              <option value="Ready">💪 Ready</option>
              <option value="Live">📡 Live</option>
              <option value="Complete">🏆 Complete</option>
            </select>
          </div>

          {/* Advanced Filters Toggle */}
          <button
            onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
            className="text-sm font-black text-[#0A3D91] hover:text-[#082F6E] flex items-center gap-2 mt-4 transition-colors"
          >
            <Filter className="w-4 h-4" />
            {showAdvancedFilters ? 'Hide' : 'Show'} Advanced Filters
            {showAdvancedFilters ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>

          {showAdvancedFilters && (
            <div className="mt-5 pt-5 border-t-2 border-[#E0E0E0] grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Event Filter */}
              <select
                value={filterEvent}
                onChange={(e) => setFilterEvent(e.target.value)}
                className="w-full bg-[#F4F5F8] border-2 border-[#E0E0E0] rounded-xl px-4 py-3 text-sm text-[#1A1A24] font-black focus:outline-none focus:border-[#0A3D91] focus:ring-2 focus:ring-[#0A3D91]/20 transition-all hover:border-[#0A3D91]/50 cursor-pointer"
              >
                <option value="all">All Events</option>
                {events.map(event => (
                  <option key={event} value={event}>{event}</option>
                ))}
              </select>

              {/* Location Filter */}
              <select
                value={filterLocation}
                onChange={(e) => setFilterLocation(e.target.value)}
                className="w-full bg-[#F4F5F8] border-2 border-[#E0E0E0] rounded-xl px-4 py-3 text-sm text-[#1A1A24] font-black focus:outline-none focus:border-[#0A3D91] focus:ring-2 focus:ring-[#0A3D91]/20 transition-all hover:border-[#0A3D91]/50 cursor-pointer"
              >
                <option value="all">All Locations</option>
                {locations.map(loc => (
                  <option key={loc} value={loc}>{loc}</option>
                ))}
              </select>

              {/* Club Filter */}
              <select
                value={filterClub}
                onChange={(e) => setFilterClub(e.target.value)}
                className="w-full bg-[#F4F5F8] border-2 border-[#E0E0E0] rounded-xl px-4 py-3 text-sm text-[#1A1A24] font-black focus:outline-none focus:border-[#0A3D91] focus:ring-2 focus:ring-[#0A3D91]/20 transition-all hover:border-[#0A3D91]/50 cursor-pointer"
              >
                <option value="all">All Clubs</option>
                {clubs.map(club => (
                  <option key={club} value={club}>{club}</option>
                ))}
              </select>
            </div>
          )}
        </div>

        {/* Batches List */}
        <div className="space-y-5">
          {filteredBatches.length === 0 ? (
            <div className="bg-white rounded-2xl p-16 text-center shadow-lg border-2 border-[#E0E0E0]">
              <div className="w-20 h-20 bg-gradient-to-br from-[#0A3D91]/10 to-[#0A3D91]/5 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Box className="w-10 h-10 text-[#0A3D91]/40" />
              </div>
              <h3 className="text-2xl font-black text-[#1A1A24] mb-3">No Batches Found</h3>
              <p className="text-[#707070] font-bold text-base mb-6">
                {search || filterStatus !== "all"
                  ? "Try adjusting your search or filter criteria"
                  : "Create your first batch to get started with match management"}
              </p>
              {permissions.hasPermission('matches.create') && !search && filterStatus === "all" && (
                <button
                  onClick={handleCreateBatch}
                  className="inline-flex items-center gap-2 bg-gradient-to-r from-[#C8102E] to-[#A00D24] text-white px-6 py-3 rounded-xl font-black hover:shadow-lg transition-all"
                >
                  <Plus className="w-5 h-5" />
                  Create First Batch
                </button>
              )}
            </div>
          ) : (
            filteredBatches.map((batch) => {
              const isExpanded = expandedBatchId === batch.id;
              const statusConfig = BATCH_STATUS_CONFIG[batch.status] || BATCH_STATUS_CONFIG["Draft"];
              const hasChampionship = batch.matches.some(m => m.isChampionshipBout);

              return (
                <div
                  key={batch.id}
                  className="bg-white rounded-2xl border-2 border-[#E0E0E0] overflow-hidden transition-all hover:border-[#0A3D91] hover:shadow-xl group"
                >
                  {/* Batch Header - Enhanced */}
                  <div className="p-6 bg-gradient-to-r from-white to-[#F9FAFB]">
                    <div className="flex items-start justify-between gap-4 mb-4">
                      <div className="flex-1 min-w-0">
                        {/* Batch Number & Status Row */}
                        <div className="flex items-center gap-3 mb-3">
                          <h3 className="text-2xl font-black text-[#0A3D91] uppercase tracking-tight group-hover:text-[#082F6E] transition-colors">
                            {batch.batchNumber}
                          </h3>
                          <span
                            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-black uppercase ${statusConfig.bgColor} ${statusConfig.color} border-2 ${statusConfig.color.replace('text-', 'border-')} shadow-sm`}
                          >
                            <span className="text-base">{statusConfig.icon}</span>
                            {statusConfig.label}
                          </span>
                          {hasChampionship && (
                            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-yellow-100 to-amber-100 rounded-xl text-xs font-black text-yellow-800 uppercase border-2 border-yellow-200 shadow-sm">
                              <Trophy className="w-3.5 h-3.5" />
                              Title
                            </span>
                          )}
                        </div>
                        
                        {/* Event Name */}
                        <h4 className="text-xl font-black text-[#1A1A24] mb-4">
                          {batch.eventName}
                        </h4>

                        {/* Enhanced Metadata Grid */}
                        <div className="space-y-3">
                          {/* Row 1: Date, Location, Matches */}
                          <div className="flex items-center gap-6 flex-wrap text-sm">
                            <div className="inline-flex items-center gap-2 bg-blue-50 px-3 py-1.5 rounded-lg border border-blue-100">
                              <Calendar className="w-4 h-4 text-[#0A3D91]" />
                              <span className="font-black text-[#1A1A24]">{formatDisplayDate(batch.date)}</span>
                            </div>

                            <div className="flex items-center gap-2 text-[#707070]">
                              <MapPin className="w-4 h-4 text-[#C8102E]" />
                              <span className="font-bold">{batch.location}</span>
                            </div>

                            <div className="inline-flex items-center gap-2 bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-200">
                              <Users className="w-4 h-4 text-[#707070]" />
                              <span className="font-black text-[#1A1A24]">{batch.totalMatches} {batch.totalMatches === 1 ? 'Match' : 'Matches'}</span>
                            </div>
                          </div>

                          {/* Row 2: Club, Broadcast (if available) */}
                          {(batch.organizerClub || batch.broadcastStation) && (
                            <div className="flex items-center gap-4 flex-wrap text-sm">
                              {batch.organizerClub && (
                                <div className="flex items-center gap-2 text-[#707070]">
                                  <Building2 className="w-4 h-4 text-[#0A3D91]" />
                                  <span className="font-bold">{batch.organizerClub}</span>
                                </div>
                              )}

                              {batch.broadcastStation && (
                                <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-purple-50 rounded-lg border-2 border-purple-200">
                                  <Radio className="w-4 h-4 text-purple-600" />
                                  <span className="font-black text-purple-700 text-xs uppercase">{batch.broadcastStation}</span>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Action Buttons - Right Side */}
                      <div className="flex items-center gap-2">
                        {batch.status === "Draft" && permissions.hasPermission('matches.create') && (
                          <button
                            onClick={() => handlePublish(batch.id)}
                            className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-bold transition-all text-sm shadow-sm"
                          >
                            <Send className="w-4 h-4" />
                            Publish
                          </button>
                        )}

                        <button
                          onClick={() => handleViewDetails(batch.id)}
                          className="inline-flex items-center gap-2 px-4 py-2 bg-[#0A3D91] hover:bg-[#082F6E] text-white rounded-lg font-bold transition-all text-sm shadow-sm"
                        >
                          <Eye className="w-4 h-4" />
                          View
                        </button>

                        <button
                          onClick={() => toggleBatch(batch.id)}
                          className="p-2 hover:bg-[#F4F5F8] rounded-lg transition-colors"
                          title={isExpanded ? "Hide matches" : "Show matches"}
                        >
                          {isExpanded ? (
                            <ChevronUp className="w-5 h-5 text-[#707070]" />
                          ) : (
                            <ChevronDown className="w-5 h-5 text-[#707070]" />
                          )}
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Expanded Content - Match List */}
                  {isExpanded && (
                    <div className="border-t-2 border-[#E0E0E0] bg-[#F9FAFB] p-6">
                      <div className="flex items-center justify-between mb-4">
                        <h5 className="text-sm font-black text-[#1A1A24] uppercase tracking-wide">
                          Matches in this Batch
                        </h5>
                      </div>
                      
                      <div className="space-y-3">
                        {batch.matches.map((match, idx) => (
                          <Link
                            key={match.id}
                            to={`/match/${match.id}`}
                            className="bg-white border-2 border-[#E0E0E0] rounded-lg p-4 hover:border-[#0A3D91] hover:shadow-md transition-all block group"
                          >
                            <div className="flex items-center gap-4">
                              {/* Match Number */}
                              <div className="w-10 h-10 bg-gradient-to-br from-[#0A3D91] to-[#082F6E] group-hover:from-[#C8102E] group-hover:to-[#A00D24] rounded-lg flex items-center justify-center flex-shrink-0 transition-all shadow-sm">
                                <span className="text-base font-black text-white">{idx + 1}</span>
                              </div>

                              {/* Fighters */}
                              <div className="flex-1 flex items-center gap-4">
                                <div className="flex-1 text-right">
                                  <div className="font-bold text-base text-[#1A1A24] mb-1">{match.fighterA.name}</div>
                                  <div className="text-xs text-[#707070] font-semibold">{match.fighterA.clubName} • {match.fighterA.weight}kg</div>
                                </div>
                                 
                                <div className="px-4 py-1.5 bg-gradient-to-r from-[#0A3D91] to-[#C8102E] rounded-lg flex-shrink-0 shadow-sm">
                                  <span className="text-white font-black text-sm">VS</span>
                                </div>
                                
                                <div className="flex-1">
                                  <div className="font-bold text-base text-[#1A1A24] mb-1">{match.fighterB.name}</div>
                                  <div className="text-xs text-[#707070] font-semibold">{match.fighterB.clubName} • {match.fighterB.weight}kg</div>
                                </div>
                              </div>

                              {/* Match Details */}
                              <div className="flex items-center gap-3 flex-shrink-0">
                                <div className="text-center px-3 py-2 bg-gray-50 rounded-lg border border-gray-200">
                                  <div className="text-sm font-black text-[#1A1A24]">{match.weightClass}</div>
                                  <div className="text-xs text-[#707070] font-medium">{match.rounds}R</div>
                                </div>

                                {match.isChampionshipBout && (
                                  <div className="px-3 py-2 bg-gradient-to-r from-yellow-100 to-amber-100 rounded-lg border border-yellow-300 shadow-sm">
                                    <Trophy className="w-5 h-5 text-yellow-700" />
                                  </div>
                                )}

                                <div className="text-[#0A3D91] group-hover:text-[#C8102E] transition-colors">
                                  <Eye className="w-5 h-5" />
                                </div>
                              </div>
                            </div>
                          </Link>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}