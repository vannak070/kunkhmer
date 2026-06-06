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

  const getBatchBadgeVariant = (status: string) => {
    switch (status) {
      case "Draft": return "badge-outline text-muted-foreground border-border/60 bg-muted/5";
      case "Weight-In": return "badge-amber";
      case "Ready": return "badge-blue";
      case "Live": return "badge-red";
      case "Complete": return "badge-emerald";
      default: return "badge-outline";
    }
  };

  const getBatchDotColor = (status: string) => {
    switch (status) {
      case "Draft": return "bg-slate-400";
      case "Weight-In": return "bg-amber-500";
      case "Ready": return "bg-blue-500";
      case "Live": return "bg-red-500";
      case "Complete": return "bg-emerald-500";
      default: return "bg-slate-400";
    }
  };

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-6 flex flex-col min-h-full animate-fadeIn">
      {/* Enhanced Header */}
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-primary/10 text-primary rounded-xl flex items-center justify-center shrink-0">
            <Box className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-foreground">
              Match Management
            </h1>
            <p className="text-sm text-muted-foreground mt-0.5 font-medium">Organize batches and matches for events</p>
          </div>
        </div>

        {permissions.hasPermission('matches.create') && (
          <button
            onClick={handleCreateBatch}
            className="btn-primary py-2.5 px-5"
          >
            <Plus className="w-4 h-4" />
            New Batch
          </button>
        )}
      </header>

      {/* Enhanced Status Legend & Stats */}
      <div className="bg-white rounded-xl border border-border/75 shadow-sm overflow-hidden flex flex-col">
        {/* Status Legend */}
        <div className="border-b border-border/60 px-5 py-4">
          <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-3">Status Legend</h3>
          <div className="flex flex-wrap items-center gap-4">
            <div className="badge-premium badge-outline text-muted-foreground">
              <span className="badge-dot bg-slate-400" />
              <span>Draft</span>
            </div>
            <div className="badge-premium badge-amber">
              <span className="badge-dot bg-amber-500" />
              <span>Weight-In</span>
            </div>
            <div className="badge-premium badge-blue">
              <span className="badge-dot bg-blue-500" />
              <span>Ready</span>
            </div>
            <div className="badge-premium badge-red">
              <span className="badge-dot bg-red-500" />
              <span>Live</span>
            </div>
            <div className="badge-premium badge-emerald">
              <span className="badge-dot bg-emerald-500" />
              <span>Complete</span>
            </div>
          </div>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-2 md:grid-cols-5 divide-x divide-border/60">
          <div className="px-5 py-4 text-center">
            <div className="text-xl font-bold text-primary mb-0.5">{stats.total}</div>
            <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Total Batches</div>
          </div>
          <div className="px-5 py-4 text-center">
            <div className="text-xl font-bold text-slate-500 mb-0.5">{stats.draft}</div>
            <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Draft</div>
          </div>
          <div className="px-5 py-4 text-center">
            <div className="text-xl font-bold text-amber-600 mb-0.5">{stats.weightIn}</div>
            <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Weight-In</div>
          </div>
          <div className="px-5 py-4 text-center">
            <div className="text-xl font-bold text-red-600 mb-0.5">{stats.live}</div>
            <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Live</div>
          </div>
          <div className="px-5 py-4 text-center">
            <div className="text-xl font-bold text-emerald-600 mb-0.5">{stats.complete}</div>
            <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Complete</div>
          </div>
        </div>
      </div>

      {/* Enhanced Search & Filters */}
      <div className="bg-white rounded-xl p-5 border border-border/75 shadow-sm space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Search */}
          <div className="relative md:col-span-2 group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
            <input
              type="text"
              placeholder="Search batches, events, fighters..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-white border border-border/80 rounded-xl pl-11 pr-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/5 shadow-sm transition-all"
            />
          </div>

          {/* Status Filter */}
          <div className="relative">
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full bg-white border border-border/80 rounded-xl px-4 py-2.5 text-sm text-foreground font-medium appearance-none focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/5 shadow-sm cursor-pointer hover:border-slate-300 transition-all"
            >
              <option value="all">All Status</option>
              <option value="Draft">Draft</option>
              <option value="Weight-In">Weight-In</option>
              <option value="Ready">Ready</option>
              <option value="Live">Live</option>
              <option value="Complete">Complete</option>
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
          </div>
        </div>

        {/* Advanced Filters Toggle */}
        <button
          onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
          className="text-xs font-semibold text-primary hover:underline flex items-center gap-1 transition-colors"
        >
          <Filter className="w-3.5 h-3.5" />
          {showAdvancedFilters ? 'Hide' : 'Show'} Advanced Filters
          {showAdvancedFilters ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
        </button>

        {showAdvancedFilters && (
          <div className="pt-4 border-t border-border/60 grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Event Filter */}
            <div className="relative">
              <select
                value={filterEvent}
                onChange={(e) => setFilterEvent(e.target.value)}
                className="w-full bg-white border border-border/80 rounded-xl px-4 py-2 text-sm text-foreground font-medium appearance-none focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/5 shadow-sm cursor-pointer hover:border-slate-300 transition-all"
              >
                <option value="all">All Events</option>
                {events.map(event => (
                  <option key={event} value={event}>{event}</option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
            </div>

            {/* Location Filter */}
            <div className="relative">
              <select
                value={filterLocation}
                onChange={(e) => setFilterLocation(e.target.value)}
                className="w-full bg-white border border-border/80 rounded-xl px-4 py-2 text-sm text-foreground font-medium appearance-none focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/5 shadow-sm cursor-pointer hover:border-slate-300 transition-all"
              >
                <option value="all">All Locations</option>
                {locations.map(loc => (
                  <option key={loc} value={loc}>{loc}</option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
            </div>

            {/* Club Filter */}
            <div className="relative">
              <select
                value={filterClub}
                onChange={(e) => setFilterClub(e.target.value)}
                className="w-full bg-white border border-border/80 rounded-xl px-4 py-2 text-sm text-foreground font-medium appearance-none focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/5 shadow-sm cursor-pointer hover:border-slate-300 transition-all"
              >
                <option value="all">All Clubs</option>
                {clubs.map(club => (
                  <option key={club} value={club}>{club}</option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
            </div>
          </div>
        )}
      </div>

      {/* Batches List */}
      <div className="space-y-4">
        {filteredBatches.length === 0 ? (
          <div className="bg-white rounded-xl py-16 text-center border border-border/60 shadow-sm">
            <Box className="w-16 h-16 text-muted-foreground/60 mx-auto mb-4" />
            <h3 className="text-lg font-bold text-foreground tracking-tight mb-1">No Batches Found</h3>
            <p className="text-sm text-muted-foreground max-w-sm mx-auto mb-4">
              {search || filterStatus !== "all"
                ? "Try adjusting your search or filter criteria"
                : "Create your first batch to get started with match management"}
            </p>
            {permissions.hasPermission('matches.create') && !search && filterStatus === "all" && (
              <button
                onClick={handleCreateBatch}
                className="btn-outline inline-flex py-2 px-4 text-xs font-semibold"
              >
                <Plus className="w-3.5 h-3.5" />
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
                className="bg-white rounded-2xl border border-border/75 overflow-hidden transition-all hover:border-primary/20 hover:shadow-xl hover:-translate-y-0.5 duration-300 flex flex-col group shadow-sm"
              >
                {/* Batch Header - Enhanced */}
                <div className="p-5 bg-gradient-to-r from-white to-muted/5">
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      {/* Batch Number & Status Row */}
                      <div className="flex flex-wrap items-center gap-2.5 mb-2">
                        <h3 className="text-lg font-bold text-foreground group-hover:text-primary transition-colors tracking-tight">
                          {batch.batchNumber}
                        </h3>
                        <span className={`badge-premium ${getBatchBadgeVariant(batch.status)}`}>
                          <span className={`badge-dot ${getBatchDotColor(batch.status)}`} />
                          <span>{statusConfig.label}</span>
                        </span>
                        {hasChampionship && (
                          <span className="badge-premium bg-[#FFFDF5] border border-amber-200/80 text-amber-700 shadow-sm">
                            <Trophy className="w-3 h-3 text-amber-500 fill-amber-500" />
                            Title Bout
                          </span>
                        )}
                      </div>
                      
                      {/* Event Name */}
                      <h4 className="text-sm font-semibold text-slate-800 mb-3">
                        {batch.eventName}
                      </h4>

                      {/* Enhanced Metadata Grid */}
                      <div className="flex flex-wrap gap-x-4 gap-y-2 text-xs text-muted-foreground">
                        <div className="inline-flex items-center gap-1.5 bg-blue-50/70 border border-blue-100/50 text-[#0A3D91] px-2 py-0.5 rounded-md font-medium">
                          <Calendar className="w-3.5 h-3.5" />
                          <span>{formatDisplayDate(batch.date)}</span>
                        </div>

                        <div className="flex items-center gap-1.5">
                          <MapPin className="w-3.5 h-3.5 text-secondary" />
                          <span className="font-medium">{batch.location}</span>
                        </div>

                        <div className="inline-flex items-center gap-1.5 bg-slate-50 border border-slate-200/60 text-slate-600 px-2 py-0.5 rounded-md font-medium">
                          <Users className="w-3.5 h-3.5" />
                          <span>{batch.totalMatches} {batch.totalMatches === 1 ? 'Match' : 'Matches'}</span>
                        </div>

                        {batch.organizerClub && (
                          <div className="flex items-center gap-1.5">
                            <Building2 className="w-3.5 h-3.5 text-primary" />
                            <span className="font-medium">{batch.organizerClub}</span>
                          </div>
                        )}

                        {batch.broadcastStation && (
                          <div className="inline-flex items-center gap-1 px-2 py-0.5 bg-purple-50 text-purple-700 border border-purple-200/60 rounded-md font-medium uppercase text-[10px] tracking-wide">
                            <Radio className="w-3 h-3" />
                            <span>{batch.broadcastStation}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Action Buttons - Right Side */}
                    <div className="flex items-center gap-2 self-end sm:self-start">
                      {batch.status === "Draft" && permissions.hasPermission('matches.create') && (
                        <button
                          onClick={() => handlePublish(batch.id)}
                          className="btn-primary px-3 py-1.5 text-xs font-semibold"
                        >
                          <Send className="w-3.5 h-3.5" />
                          Publish
                        </button>
                      )}

                      <button
                        onClick={() => handleViewDetails(batch.id)}
                        className="btn-outline px-3 py-1.5 text-xs font-semibold"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        View
                      </button>

                      <button
                        onClick={() => toggleBatch(batch.id)}
                        className="p-1.5 hover:bg-muted/60 rounded-lg transition-colors border border-transparent hover:border-border/60"
                        title={isExpanded ? "Hide matches" : "Show matches"}
                      >
                        {isExpanded ? (
                          <ChevronUp className="w-4 h-4 text-muted-foreground" />
                        ) : (
                          <ChevronDown className="w-4 h-4 text-muted-foreground" />
                        )}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Expanded Content - Match List */}
                {isExpanded && (
                  <div className="border-t border-border/60 bg-muted/5 p-5">
                    <h5 className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-3">
                      Matches in this Batch
                    </h5>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {batch.matches.map((match, idx) => (
                        <Link
                          key={match.id}
                          to={`/match/${match.id}`}
                          className="bg-white border border-border/75 rounded-xl p-4 hover:border-primary/20 hover:shadow-md transition-all block group/match"
                        >
                          <div className="flex items-center justify-between gap-4">
                            {/* Match Number */}
                            <div className="w-8 h-8 bg-muted text-slate-600 group-hover/match:bg-primary group-hover/match:text-white rounded-lg flex items-center justify-center shrink-0 transition-all font-bold text-xs shadow-sm">
                              {idx + 1}
                            </div>

                            {/* Fighters */}
                            <div className="flex-1 flex items-center justify-center gap-2 text-center min-w-0">
                              <div className="flex-1 min-w-0 text-right">
                                <div className="font-bold text-xs text-foreground truncate">{match.fighterA.name}</div>
                                <div className="text-[10px] text-muted-foreground truncate">{match.fighterA.clubName}</div>
                              </div>
                               
                              <div className="px-2 py-0.5 bg-gradient-to-r from-primary/90 to-secondary/90 rounded-md shrink-0 shadow-sm">
                                <span className="text-white font-bold text-[10px]">VS</span>
                              </div>
                              
                              <div className="flex-1 min-w-0 text-left">
                                <div className="font-bold text-xs text-foreground truncate">{match.fighterB.name}</div>
                                <div className="text-[10px] text-muted-foreground truncate">{match.fighterB.clubName}</div>
                              </div>
                            </div>

                            {/* Match Details */}
                            <div className="flex items-center gap-2.5 shrink-0">
                              <div className="text-center px-2 py-1 bg-muted/20 border border-border/40 rounded-lg">
                                <div className="text-[10px] font-bold text-foreground">{match.weightClass}</div>
                                <div className="text-[9px] font-semibold text-muted-foreground">{match.rounds}R</div>
                              </div>

                              {match.isChampionshipBout && (
                                <div className="p-1.5 bg-[#FFFDF5] rounded-lg border border-amber-200 shadow-sm" title="Championship Title Bout">
                                  <Trophy className="w-4 h-4 text-amber-500" />
                                </div>
                              )}
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
  );
}