import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router";
import { 
  Eye, Plus, Search, ChevronDown, ChevronUp, Edit3,
  CheckCircle, Clock, FileText, Calendar, MapPin, Users,
  Send, Edit2, Box, ListPlus,
  Shield, Trophy, Radio, Award, Building2, X, Copy,
  MoreVertical, Filter, Trash2, CheckSquare, Square,
  LayoutGrid, CalendarDays, Download, Share2,
  PlayCircle, PauseCircle, XCircle
} from "lucide-react";
import { 
  BATCH_STATUS_CONFIG, 
  formatDisplayDate
} from "../data/batches";
import type { BatchStatus, MatchBatch } from "../data/batches";
import type { MatchStatus } from "../data/event-types";
import { usePermissions } from "../hooks/usePermissions";
import { toast } from "sonner";
import { clsx } from "clsx";
import { CalendarView } from "../components/CalendarView";
import { api } from "../utils/api";

// Helper function to get status border color
const getStatusBorderColor = (status: BatchStatus): string => {
  switch (status) {
    case "Weight-In":
      return "border-l-orange-500";
    case "Ready":
      return "border-l-primary";
    case "Live":
      return "border-l-purple-500";
    case "Complete":
      return "border-l-slate-400";
    case "Draft":
    default:
      return "border-l-slate-300";
  }
};

// Helper function to get premium badge colors
const getStatusBadgeClass = (status: BatchStatus): string => {
  switch (status) {
    case "Draft":
    case "Complete":
      return "bg-slate-50 text-slate-600 border-slate-200/60";
    case "Weight-In":
      return "bg-orange-50 text-orange-700 border-orange-200/60";
    case "Ready":
      return "bg-blue-50 text-[#0A3D91] border-blue-200/60";
    case "Live":
      return "bg-purple-50 text-purple-700 border-purple-200/60";
    default:
      return "bg-slate-50 text-slate-600 border-slate-200/60";
  }
};


export function MatchesEnhanced() {
  const permissions = usePermissions();
  const navigate = useNavigate();
  const [batches, setBatches] = useState<MatchBatch[]>([]);
  const [loading, setLoading] = useState(true);
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
  const [viewMode, setViewMode] = useState<'list' | 'calendar'>('list');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const list = await api.batches.list();
      const allMatches = await api.matches.list();
      
      const mappedBatches = list.map((b: any) => {
        const batchMatches = allMatches.filter((m: any) => m.sub_event_id === b.id).map((m: any) => {
          return {
            id: m.id,
            status: m.status,
            rounds: m.rounds,
            weightClass: m.agreed_weight ? `${m.agreed_weight} kg` : "Catchweight",
            agreedWeight: m.agreed_weight,
            matchType: "Ranking Fight",
            winner: m.winner_id,
            fighterA: {
              id: m.fighter_a_id,
              name: m.fighter_a_name,
              image: m.fighter_a_image,
              clubName: m.club_a_name,
              grade: m.fighter_a_grade || "C"
            },
            fighterB: {
              id: m.fighter_b_id,
              name: m.fighter_b_name,
              image: m.fighter_b_image,
              clubName: m.club_b_name,
              grade: m.fighter_b_grade || "C"
            }
          };
        });

        return {
          id: b.id,
          batchNumber: b.batch_number || `BATCH-${b.week_number}`,
          eventName: b.event_name || "Weekly Fight Card",
          location: b.location || "Olympic Stadium Arena",
          date: b.date ? b.date.split("T")[0] : "",
          createdDate: b.created_at ? b.created_at.split("T")[0] : "",
          status: b.status as BatchStatus,
          totalMatches: batchMatches.length,
          matches: batchMatches,
          organizerClub: b.creator_name,
          createdBy: b.creator_name
        };
      });

      setBatches(mappedBatches);
    } catch (err: any) {
      toast.error("Failed to load batches: " + err.message);
    } finally {
      setLoading(false);
    }
  };
  
  // Helper functions
  const handleDuplicateBatch = (batchId: string) => {
    toast.error("Duplication is currently only supported in drafting mode");
  };

  const handleDeleteBatch = async (batchId: string, batchNumber: string) => {
    if (!confirm(`Are you sure you want to delete ${batchNumber}?`)) return;
    try {
      await api.batches.delete(batchId);
      toast.success(`🗑️ ${batchNumber} deleted`);
      loadData();
    } catch (err: any) {
      toast.error("Failed to delete batch: " + err.message);
    }
  };

  const canDelete = (status: BatchStatus): boolean => {
    return status === "Draft";
  };


  // Filter batches and sort by createdDate descending (newest first)
  let filteredBatches = [...batches].sort((a, b) => {
    const dateA = a.createdDate ? new Date(a.createdDate).getTime() : 0;
    const dateB = b.createdDate ? new Date(b.createdDate).getTime() : 0;
    return dateB - dateA;
  });

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
    approved: batches.filter(b => b.status === "Weight-In" || b.status === "Ready").length,
    active: batches.filter(b => b.status === "Live" || b.status === "Complete").length,
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
    <div className="min-h-screen bg-background p-4 md:p-8 animate-fadeIn">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <header className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tighter font-sans">
              Match Batches
            </h1>
            <p className="text-xs md:text-sm text-slate-500 font-normal mt-1">
              Manage fight cards, match details, and scheduling
            </p>
          </div>

          <div className="flex items-center gap-3 mt-1">
            {/* View Mode Toggle */}
            <div className="flex items-center gap-1 bg-white rounded-xl p-1 shadow-sm border border-border">
              <button
                onClick={() => setViewMode('list')}
                className={clsx(
                  "p-2.5 rounded-lg transition-all",
                  viewMode === 'list' ? "bg-primary text-white shadow-md" : "text-muted-foreground hover:bg-muted/60 hover:text-foreground"
                )}
                title="List View"
              >
                <LayoutGrid className="w-5 h-5" />
              </button>
              <button
                onClick={() => setViewMode('calendar')}
                className={clsx(
                  "p-2.5 rounded-lg transition-all",
                  viewMode === 'calendar' ? "bg-primary text-white shadow-md" : "text-muted-foreground hover:bg-muted/60 hover:text-foreground"
                )}
                title="Calendar View"
              >
                <CalendarDays className="w-5 h-5" />
              </button>
            </div>

            {permissions.hasPermission('matches.create') && (
              <button
                onClick={handleCreateBatch}
                className="btn-secondary px-5 py-2.5 font-semibold uppercase tracking-wider text-xs rounded-xl shadow hover:-translate-y-[1px]"
              >
                <ListPlus className="w-5 h-5" />
                Create Batch
              </button>
            )}
          </div>
        </header>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="card-premium border-l-4 border-l-primary hover:border-l-primary p-4 shadow-sm">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1.5">Total Batches</span>
            <span className="text-3xl font-extrabold tracking-tighter text-primary">{stats.total}</span>
          </div>
          <div className="card-premium border-l-4 border-l-slate-400 hover:border-l-slate-400 p-4 shadow-sm">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1.5">Drafts</span>
            <span className="text-3xl font-extrabold tracking-tighter text-slate-600">{stats.draft}</span>
          </div>
          <div className="card-premium border-l-4 border-l-green-500 hover:border-l-green-500 p-4 shadow-sm">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1.5">Scheduled</span>
            <span className="text-3xl font-extrabold tracking-tighter text-emerald-600">{stats.approved}</span>
          </div>
          <div className="card-premium border-l-4 border-l-purple-500 hover:border-l-purple-500 p-4 shadow-sm">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1.5">Live / Complete</span>
            <span className="text-3xl font-extrabold tracking-tighter text-purple-600">{stats.active}</span>
          </div>
        </div>

        {/* Filters */}
        <div className="card-premium bg-white border border-border rounded-xl p-6 shadow-sm">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            {/* Search */}
            <div className="relative md:col-span-2 group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
              <input
                type="text"
                placeholder="Search by batch ID, event, location, or fighter..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="input-premium rounded-xl !pl-11 !pr-10 py-2.5 text-sm font-medium border border-border focus:border-primary text-slate-800"
              />
              {search && (
                <button
                  onClick={() => setSearch("")}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  <XCircle className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Status Filter */}
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="input-premium rounded-xl px-4 py-3 text-sm font-semibold text-slate-700 border border-border focus:border-primary cursor-pointer"
            >
              <option value="all">All Status</option>
              <option value="Draft">Draft</option>
              <option value="Weight-In">Weight-In</option>
              <option value="Ready">Ready</option>
              <option value="Live">Live</option>
              <option value="Complete">Complete</option>
            </select>
          </div>

          {/* Active Filters as Chips */}
          {(filterStatus !== "all" || filterLocation !== "all" || filterEvent !== "all" || filterClub !== "all" || filterFighter || filterDateFrom || filterDateTo) && (
            <div className="flex items-center gap-2 flex-wrap mb-4">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Active Filters:</span>
              
              {filterStatus !== "all" && (
                <button
                  onClick={() => setFilterStatus("all")}
                  className="inline-flex items-center gap-2 px-3 py-1 bg-blue-100 text-blue-700 rounded-lg text-[11px] font-semibold tracking-wide hover:bg-blue-200 transition-colors"
                >
                  Status: {filterStatus}
                  <X className="w-3 h-3" />
                </button>
              )}
              
              {filterLocation !== "all" && (
                <button
                  onClick={() => setFilterLocation("all")}
                  className="inline-flex items-center gap-2 px-3 py-1 bg-purple-100 text-purple-700 rounded-lg text-[11px] font-semibold tracking-wide hover:bg-purple-200 transition-colors"
                >
                  Location: {filterLocation}
                  <X className="w-3 h-3" />
                </button>
              )}
              
              {filterEvent !== "all" && (
                <button
                  onClick={() => setFilterEvent("all")}
                  className="inline-flex items-center gap-2 px-3 py-1 bg-green-100 text-green-700 rounded-lg text-[11px] font-semibold tracking-wide hover:bg-green-200 transition-colors"
                >
                  Event: {filterEvent}
                  <X className="w-3 h-3" />
                </button>
              )}
              
              {filterClub !== "all" && (
                <button
                  onClick={() => setFilterClub("all")}
                  className="inline-flex items-center gap-2 px-3 py-1 bg-amber-100 text-amber-700 rounded-lg text-[11px] font-semibold tracking-wide hover:bg-amber-200 transition-colors"
                >
                  Club: {filterClub}
                  <X className="w-3 h-3" />
                </button>
              )}
              
              {filterFighter && (
                <button
                  onClick={() => setFilterFighter("")}
                  className="inline-flex items-center gap-2 px-3 py-1 bg-red-100 text-red-700 rounded-lg text-[11px] font-semibold tracking-wide hover:bg-red-200 transition-colors"
                >
                  Fighter: {filterFighter}
                  <X className="w-3 h-3" />
                </button>
              )}
              
              {(filterDateFrom || filterDateTo) && (
                <button
                  onClick={() => {
                    setFilterDateFrom("");
                    setFilterDateTo("");
                  }}
                  className="inline-flex items-center gap-2 px-3 py-1 bg-indigo-100 text-indigo-700 rounded-lg text-[11px] font-semibold tracking-wide hover:bg-indigo-200 transition-colors"
                >
                  Date Range
                  <X className="w-3 h-3" />
                </button>
              )}
              
              <button
                onClick={() => {
                  setFilterStatus("all");
                  setFilterLocation("all");
                  setFilterEvent("all");
                  setFilterClub("all");
                  setFilterFighter("");
                  setFilterDateFrom("");
                  setFilterDateTo("");
                }}
                className="text-xs font-semibold text-secondary hover:text-secondary/80 hover:underline ml-1"
              >
                Clear All
              </button>
            </div>
          )}

          {/* Advanced Filters Toggle */}
          <button
            onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
            className="text-sm font-semibold text-primary hover:text-primary/80 flex items-center gap-2"
          >
            {showAdvancedFilters ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            Advanced Filters
          </button>

          {showAdvancedFilters && (
            <div className="mt-4 pt-4 border-t border-border grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Location Filter */}
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Location</label>
                <select
                  value={filterLocation}
                  onChange={(e) => setFilterLocation(e.target.value)}
                  className="input-premium rounded-xl px-4 py-2.5 text-sm font-semibold text-slate-700 border border-border focus:border-primary cursor-pointer"
                >
                  <option value="all">All Locations</option>
                  {locations.map(loc => (
                    <option key={loc} value={loc}>{loc}</option>
                  ))}
                </select>
              </div>

              {/* Event Filter */}
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Event</label>
                <select
                  value={filterEvent}
                  onChange={(e) => setFilterEvent(e.target.value)}
                  className="input-premium rounded-xl px-4 py-2.5 text-sm font-semibold text-slate-700 border border-border focus:border-primary cursor-pointer"
                >
                  <option value="all">All Events</option>
                  {events.map(event => (
                    <option key={event} value={event}>{event}</option>
                  ))}
                </select>
              </div>

              {/* Club Filter */}
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Club</label>
                <select
                  value={filterClub}
                  onChange={(e) => setFilterClub(e.target.value)}
                  className="input-premium rounded-xl px-4 py-2.5 text-sm font-semibold text-slate-700 border border-border focus:border-primary cursor-pointer"
                >
                  <option value="all">All Clubs</option>
                  {clubs.map(club => (
                    <option key={club} value={club}>{club}</option>
                  ))}
                </select>
              </div>

              {/* Fighter Filter */}
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Fighter</label>
                <input
                  type="text"
                  placeholder="Search by fighter name..."
                  value={filterFighter}
                  onChange={(e) => setFilterFighter(e.target.value)}
                  className="input-premium rounded-xl px-4 py-2.5 text-sm font-medium text-slate-700 border border-border focus:border-primary"
                />
              </div>

              {/* Date Range Filter */}
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Date From</label>
                <input
                  type="date"
                  value={filterDateFrom}
                  onChange={(e) => setFilterDateFrom(e.target.value)}
                  className="input-premium rounded-xl px-4 py-2.5 text-sm font-medium text-slate-700 border border-border focus:border-primary"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Date To</label>
                <input
                  type="date"
                  value={filterDateTo}
                  onChange={(e) => setFilterDateTo(e.target.value)}
                  className="input-premium rounded-xl px-4 py-2.5 text-sm font-medium text-slate-700 border border-border focus:border-primary"
                />
              </div>
            </div>
          )}
        </div>



        {/* Batches List */}
        {viewMode === 'list' && (
          <div className="space-y-5">
            {loading ? (
              <div className="card-premium p-12 text-center">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary mx-auto"></div>
                <p className="text-sm text-slate-500 font-semibold mt-4">Loading batches...</p>
              </div>
            ) : filteredBatches.length === 0 ? (
              <div className="card-premium bg-white border border-border rounded-xl p-12 text-center shadow-sm">
                <Box className="w-16 h-16 text-muted-foreground/60 mx-auto mb-4" />
                <h3 className="text-lg font-bold uppercase tracking-wider text-primary mb-2">No Batches Found</h3>
                <p className="text-muted-foreground font-medium">
                  {search || filterStatus !== "all" 
                    ? "Try adjusting your filters" 
                    : "Create your first batch to get started"}
                </p>
              </div>
            ) : (
              filteredBatches.map((batch) => {
                const isExpanded = expandedBatchId === batch.id;
                const statusConfig = BATCH_STATUS_CONFIG[batch.status] || BATCH_STATUS_CONFIG["Draft"];
                const hasChampionship = batch.matches.some(m => m.isChampionshipBout);
                const borderColor = getStatusBorderColor(batch.status);

                return (
                  <div
                    key={batch.id}
                    className={clsx(
                      "bg-white rounded-xl shadow-sm border border-border border-l-4 overflow-hidden transition-all hover:shadow-md hover:border-primary/20",
                      borderColor
                    )}
                  >
                    {/* Batch Header */}
                    <div className="p-6">
                      {/* Title Row */}
                      <div className="flex items-start justify-between gap-4 mb-5">
                        <div className="flex-1 min-w-0">
                          {/* Batch ID + Status + Championship Badge */}
                          <div className="flex items-center gap-2.5 mb-3 flex-wrap">
                            <h2 className="text-lg md:text-xl font-extrabold text-slate-900 tracking-tight uppercase">
                              {batch.batchNumber}
                            </h2>
                            <span
                              className={clsx("badge-premium uppercase tracking-wider text-[9px] font-semibold py-1 px-2.5 shadow-sm", getStatusBadgeClass(batch.status))}
                            >
                              <span className="text-xs">{statusConfig.icon}</span>
                              {statusConfig.label}
                            </span>
                            {hasChampionship && (
                              <span className="badge-premium bg-amber-50 text-amber-700 border-amber-200/50 uppercase tracking-wider text-[9px] font-semibold py-1 px-2.5">
                                <Trophy className="w-3 h-3 text-amber-500" />
                                Championship
                              </span>
                            )}
                          </div>

                          {/* Event Name */}
                          <h3 className="text-sm md:text-base font-bold text-slate-800 mb-3">
                            {batch.eventName}
                          </h3>

                          {/* Metadata Grid - Clean & Minimal */}
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                            <div className="flex items-center gap-2.5 p-3 bg-muted/40 rounded-xl border border-border/40 hover:bg-muted/60 transition-all duration-200">
                              <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                                <Calendar className="w-4 h-4 text-primary" />
                              </div>
                              <div className="min-w-0 flex-1">
                                <div className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">Date</div>
                                <div className="font-semibold text-slate-900 text-sm truncate">{formatDisplayDate(batch.date)}</div>
                              </div>
                            </div>

                            <div className="flex items-center gap-2.5 p-3 bg-muted/40 rounded-xl border border-border/40 hover:bg-muted/60 transition-all duration-200">
                              <div className="w-9 h-9 rounded-lg bg-secondary/10 flex items-center justify-center flex-shrink-0">
                                <MapPin className="w-4 h-4 text-secondary" />
                              </div>
                              <div className="min-w-0 flex-1">
                                <div className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">Venue</div>
                                <div className="font-semibold text-slate-900 text-sm truncate">{batch.location}</div>
                              </div>
                            </div>

                            <div className="flex items-center gap-2.5 p-3 bg-muted/40 rounded-xl border border-border/40 hover:bg-muted/60 transition-all duration-200">
                              <div className="w-9 h-9 rounded-lg bg-emerald-500/10 flex items-center justify-center flex-shrink-0">
                                <Users className="w-4 h-4 text-emerald-600" />
                              </div>
                              <div className="min-w-0 flex-1">
                                <div className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">Matches</div>
                                <div className="font-semibold text-slate-900 text-sm">
                                  {batch.totalMatches} {batch.totalMatches === 1 ? 'Fight' : 'Fights'}
                                </div>
                              </div>
                            </div>

                            <div className="flex items-center gap-2.5 p-3 bg-muted/40 rounded-xl border border-border/40 hover:bg-muted/60 transition-all duration-200">
                              <div className="w-9 h-9 rounded-lg bg-purple-500/10 flex items-center justify-center flex-shrink-0">
                                <Building2 className="w-4 h-4 text-purple-600" />
                              </div>
                              <div className="min-w-0 flex-1">
                                <div className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">Organizer</div>
                                <div className="font-semibold text-slate-900 text-sm truncate">
                                  {batch.organizerClub || batch.createdBy}
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* More Menu */}
                        {(() => {
                          const isDraftReady = batch.status === "Draft" && batch.matches.length > 0;
                          const isActiveStage = ["Weight-In", "Ready", "Live"].includes(batch.status);
                          const isCompleted = ["Complete", "Completed"].includes(batch.status);
                          const allResultsUpdated = isCompleted && batch.matches.length > 0 && batch.matches.every(m => m.winner);
                          const showShare = isDraftReady || isActiveStage || (isCompleted && allResultsUpdated);
                          
                          if (!showShare) return null;
                          
                          return (
                          <div className="relative group">
                            <button className="p-2 hover:bg-muted rounded-lg transition-colors border border-transparent hover:border-border">
                              <MoreVertical className="w-5 h-5 text-muted-foreground" />
                            </button>

                            {/* Dropdown Menu */}
                            <div className="absolute right-0 top-full mt-1 w-48 bg-white rounded-xl shadow-lg border border-border py-1.5 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-10">
                              <button
                                onClick={() => navigate(`/home/batches/${batch.id}/share`)}
                                className="w-full px-4 py-2 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground hover:text-foreground hover:bg-muted/50 flex items-center gap-2 transition-colors"
                              >
                                <Share2 className="w-3.5 h-3.5 text-muted-foreground" />
                                {isCompleted ? "Share with Results" : "Share"}
                              </button>
                            </div>
                          </div>
                          );
                        })()}
                      </div>

                      {/* Special Badges */}
                      {(batch.broadcastStation || batch.mainSponsor) && (
                        <div className="flex items-center gap-2 flex-wrap mt-4 pt-4 border-t border-border/50">
                          {batch.broadcastStation && (
                            <span className="badge-premium bg-purple-50/60 text-purple-700 border-purple-200/50 uppercase tracking-wider text-[9px] font-semibold py-1 px-2.5">
                              <Radio className="w-3.5 h-3.5 text-purple-500" />
                              {batch.broadcastStation}
                            </span>
                          )}

                          {batch.mainSponsor && (
                            <span className="badge-premium bg-amber-50/60 text-amber-700 border-amber-200/50 uppercase tracking-wider text-[9px] font-semibold py-1 px-2.5">
                              <Award className="w-3.5 h-3.5 text-amber-500" />
                              {batch.mainSponsor}
                            </span>
                          )}
                        </div>
                      )}

                      {/* Action Buttons */}
                      <div className="flex items-center gap-2 flex-wrap mt-5">
                        {/* Primary Action */}
                        <button
                          onClick={() => handleViewDetails(batch.id)}
                          className="btn-primary px-4 py-2 font-semibold uppercase tracking-wider text-xs rounded-xl shadow-sm"
                        >
                          <Eye className="w-4 h-4" />
                          {batch.status === "Draft"
                            ? "Add Matches"
                            : "View Details"}
                        </button>

                        {/* Secondary Actions */}
                        {batch.status === "Draft" && permissions.hasPermission('matches.edit') && (
                          <button
                            onClick={() => navigate(`/home/matches/${batch.id}/edit`)}
                            className="btn-outline px-4 py-2 font-semibold uppercase tracking-wider text-xs rounded-xl shadow-sm"
                          >
                            <Edit2 className="w-4 h-4" />
                            Edit
                          </button>
                        )}

                        {/* Assign Officials - Available for all non-Complete batches */}
                        {batch.status !== "Complete" && permissions.hasPermission('officials.assign') && (
                          <button
                            onClick={() => navigate(`/home/matches/${batch.id}/assign-officials`)}
                            className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-semibold uppercase tracking-wider text-xs transition-all shadow hover:shadow-md active:scale-[0.98]"
                          >
                            <Shield className="w-4 h-4" />
                            Officials
                          </button>
                        )}

                        {/* Delete Button */}
                        {permissions.hasPermission('matches.delete') && (
                          <div className="relative group">
                            <button
                              onClick={() => handleDeleteBatch(batch.id, batch.batchNumber)}
                              disabled={!canDelete(batch.status)}
                              className={clsx(
                                "inline-flex items-center gap-2 px-4 py-2 rounded-xl font-semibold uppercase tracking-wider text-xs transition-all shadow-sm",
                                canDelete(batch.status)
                                  ? "bg-gradient-to-br from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white active:scale-[0.98]"
                                  : "bg-slate-100 text-slate-400 border border-slate-200/60 cursor-not-allowed"
                              )}
                            >
                              <Trash2 className="w-4 h-4" />
                              Delete
                            </button>
                            {!canDelete(batch.status) && (
                              <div className="absolute bottom-full left-0 mb-2 w-40 bg-slate-900 text-white text-[10px] font-semibold uppercase tracking-wider rounded-lg px-2.5 py-1.5 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-20 shadow-lg">
                                Cannot delete after submission
                              </div>
                            )}
                          </div>
                        )}

                        {/* Expand Toggle */}
                        <button
                          onClick={() => toggleBatch(batch.id)}
                          className="btn-outline px-4 py-2 font-semibold uppercase tracking-wider text-xs rounded-xl shadow-sm ml-auto"
                        >
                          {isExpanded ? (
                            <>
                              <ChevronUp className="w-4 h-4" />
                              Hide
                            </>
                          ) : (
                            <>
                              <ChevronDown className="w-4 h-4" />
                              {batch.totalMatches} {batch.totalMatches === 1 ? 'Match' : 'Matches'}
                            </>
                          )}
                        </button>
                      </div>
                    </div>

                    {/* Expanded Content - Match List */}
                    {isExpanded && (
                      <div className="border-t border-border bg-muted/20 p-5">
                        <div className="flex items-center justify-between mb-4">
                          <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Match Details</h4>
                          <span className="text-xs font-semibold text-slate-500">
                            Total Weight: {batch.matches.reduce((sum, m) => sum + (m.agreedWeight || m.fighterA.weight || 0), 0)} kg
                          </span>
                        </div>

                        <div className="space-y-3">
                          {batch.matches.map((match, idx) => (
                            <div
                              key={match.id}
                              className="bg-white border border-border rounded-xl p-4 hover:shadow-md hover:border-slate-300 transition-all duration-200"
                            >
                              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                                {/* Match Order Badge */}
                                <div className="flex items-center gap-3">
                                  <div className="w-10 h-10 bg-gradient-to-br from-primary to-primary/80 rounded-xl flex items-center justify-center flex-shrink-0 text-white font-extrabold text-sm tracking-tight shadow-sm">
                                    #{idx + 1}
                                  </div>
                                  <div>
                                    <div className="font-bold text-slate-800 text-[13px] uppercase tracking-wider">{match.matchType}</div>
                                    <div className="text-xs text-slate-500 font-medium">{match.weightClass} • {match.rounds} Rounds</div>
                                  </div>
                                </div>

                                {/* Fighters Comparison Row */}
                                <div className="flex-1 grid grid-cols-1 md:grid-cols-7 items-center gap-4">
                                  {/* Fighter A */}
                                  <div className="md:col-span-3 flex items-center gap-3 bg-secondary/5 p-2.5 rounded-xl border border-secondary/15 hover:bg-secondary/10 transition-colors">
                                    <img
                                      src={match.fighterA.image || "https://images.unsplash.com/photo-1549719386-74dfcbf7dbed?w=100"}
                                      alt={match.fighterA.name}
                                      className="w-10 h-10 rounded-lg object-cover border-2 border-secondary/30 flex-shrink-0"
                                    />
                                    <div className="min-w-0 flex-1">
                                      <div className="font-bold text-slate-900 text-sm truncate flex items-center gap-1.5">
                                        {match.fighterA.name}
                                        <span className="badge-premium bg-secondary/10 text-secondary border-secondary/20 text-[9px] px-1.5 py-0.5 rounded font-semibold uppercase tracking-wider">
                                          {match.fighterA.grade}
                                        </span>
                                      </div>
                                      <div className="text-xs text-slate-500 truncate font-medium">{match.fighterA.clubName}</div>
                                    </div>
                                  </div>

                                  {/* VS Badge */}
                                  <div className="text-center md:col-span-1 flex justify-center">
                                    <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-slate-900 text-white font-extrabold text-[10px] tracking-tight shadow-sm border-2 border-white">
                                      VS
                                    </span>
                                  </div>

                                  {/* Fighter B */}
                                  <div className="md:col-span-3 flex items-center gap-3 bg-primary/5 p-2.5 rounded-xl border border-primary/15 hover:bg-primary/10 transition-colors">
                                    <img
                                      src={match.fighterB.image || "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100"}
                                      alt={match.fighterB.name}
                                      className="w-10 h-10 rounded-lg object-cover border-2 border-primary/30 flex-shrink-0"
                                    />
                                    <div className="min-w-0 flex-1">
                                      <div className="font-bold text-slate-900 text-sm truncate flex items-center gap-1.5">
                                        {match.fighterB.name}
                                        <span className="badge-premium bg-primary/10 text-primary border-primary/20 text-[9px] px-1.5 py-0.5 rounded font-semibold uppercase tracking-wider">
                                          {match.fighterB.grade}
                                        </span>
                                      </div>
                                      <div className="text-xs text-slate-500 truncate font-medium">{match.fighterB.clubName}</div>
                                    </div>
                                  </div>
                                </div>

                                {/* Eligibility Checks */}
                                <div className="flex flex-wrap items-center gap-2">
                                  <div className="badge-premium bg-emerald-50 text-emerald-700 border-emerald-200/50 text-[9px] uppercase tracking-wider py-1 font-semibold shadow-sm" title="Medical Clearance check complete">
                                    <CheckCircle className="w-3.5 h-3.5" />
                                    Medical
                                  </div>
                                  <div className="badge-premium bg-emerald-50 text-emerald-700 border-emerald-200/50 text-[9px] uppercase tracking-wider py-1 font-semibold shadow-sm" title="Resting period validation ok">
                                    <CheckCircle className="w-3.5 h-3.5" />
                                    Rest Period
                                  </div>
                                  <div className="badge-premium bg-emerald-50 text-emerald-700 border-emerald-200/50 text-[9px] uppercase tracking-wider py-1 font-semibold shadow-sm" title="Grades are compatible for matchmaking">
                                    <CheckCircle className="w-3.5 h-3.5" />
                                    Matchup OK
                                  </div>

                                  {match.isChampionshipBout && (
                                    <span className="badge-premium bg-amber-50 text-amber-700 border-amber-200/50 text-[9px] uppercase tracking-wider py-1 font-semibold shadow-sm">
                                      <Trophy className="w-3.5 h-3.5" />
                                      Title
                                    </span>
                                  )}
                                </div>

                                {/* View Detail Action */}
                                <div className="flex items-center justify-end gap-2">
                                  {match.refereeName && (
                                    <span className="hidden lg:inline-flex items-center gap-1.5 text-[9px] bg-slate-100 text-slate-600 border border-slate-200/60 px-2 py-1 rounded-lg font-semibold uppercase tracking-wider">
                                      👤 Ref: {match.refereeName}
                                    </span>
                                  )}
                                  <Link
                                    to={`/home/match/${match.id}`}
                                    className="p-2 bg-muted/45 hover:bg-primary/10 text-muted-foreground hover:text-primary rounded-xl transition-all border border-border shadow-sm"
                                    title="View Detailed Match Page"
                                  >
                                    <Eye className="w-5 h-5" />
                                  </Link>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        )}

        {/* Calendar View Placeholder */}
        {viewMode === 'calendar' && (
          <CalendarView batches={filteredBatches} />
        )}


      </div>
    </div>
  );
}