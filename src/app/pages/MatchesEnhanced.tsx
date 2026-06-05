import { useState } from "react";
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
  MOCK_BATCHES, 
  BATCH_STATUS_CONFIG, 
  formatDisplayDate
} from "../data/batches";
import type { BatchStatus, MatchBatch } from "../data/batches";
import type { MatchStatus } from "../data/event-types";
import { usePermissions } from "../hooks/usePermissions";
import { toast } from "sonner";
import { clsx } from "clsx";
import { CalendarView } from "../components/CalendarView";

// Helper function to get status border color
const getStatusBorderColor = (status: BatchStatus): string => {
  switch (status) {
    case "Weight-In":
      return "border-l-orange-500";
    case "Ready":
      return "border-l-blue-500";
    case "Live":
      return "border-l-purple-500";
    case "Complete":
      return "border-l-gray-500";
    case "Draft":
    default:
      return "border-l-gray-400";
  }
};

export function MatchesEnhanced() {
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
  const [viewMode, setViewMode] = useState<'list' | 'calendar'>('list');

  // Helper functions
  const isReadyForSubmission = (batch: MatchBatch): boolean => {
    // Check if all required data is complete
    const hasMatches = batch.matches.length > 0;
    const allMatchesComplete = batch.matches.every(m => m.fighterA && m.fighterB && m.rounds);
    const hasVenue = !!batch.venue;
    const hasDate = !!batch.date;
    return hasMatches && allMatchesComplete && hasVenue && hasDate;
  };

  const canDelete = (status: BatchStatus): boolean => {
    return status === "Draft";
  };

  const canSubmitToKKF = (batch: MatchBatch): boolean => {
    return batch.status === "Draft" && isReadyForSubmission(batch);
  };

  const handleDuplicateBatch = (batchId: string) => {
    const batch = batches.find(b => b.id === batchId);
    if (!batch) return;

    const newBatch: MatchBatch = {
      ...batch,
      id: `batch-${Date.now()}`,
      batchNumber: `${batch.batchNumber}-COPY`,
      status: "Draft" as BatchStatus,
      createdDate: new Date().toISOString().split('T')[0],
      submittedDate: undefined,
      reviewedDate: undefined,
      matches: batch.matches.map(m => ({
        ...m,
        id: `match-${Date.now()}-${Math.random()}`,
        status: "Draft" as MatchStatus
      }))
    };

    setBatches(prev => [newBatch, ...prev]);
    toast.success(`✅ Batch duplicated as ${newBatch.batchNumber}`);
  };

  const handleDeleteBatch = (batchId: string, batchNumber: string) => {
    if (!confirm(`Are you sure you want to delete ${batchNumber}?`)) return;
    
    setBatches(prev => prev.filter(b => b.id !== batchId));
    toast.success(`🗑️ ${batchNumber} deleted`);
  };

  const handleSubmitToKKF = (batchId: string) => {
    // Navigate to assign officials page before submitting
    navigate(`/matches/${batchId}/assign-officials`);
  };

  const handleApprove = (batchId: string) => {
    setBatches(prev => prev.map(b => {
      if (b.id === batchId) {
        toast.success(`✅ Batch ${b.batchNumber} approved!`);
        return {
          ...b,
          status: "Approved" as BatchStatus,
          reviewedDate: new Date().toISOString().split('T')[0],
          reviewedBy: "KKF Admin",
        };
      }
      return b;
    }));
  };

  const handleReject = (batchId: string) => {
    const reason = prompt("Rejection reason:");
    if (!reason) return;

    setBatches(prev => prev.map(b => {
      if (b.id === batchId) {
        toast.error(`❌ Batch ${b.batchNumber} rejected`);
        return {
          ...b,
          status: "Rejected" as BatchStatus,
          rejectionReason: reason,
          reviewedDate: new Date().toISOString().split('T')[0],
          reviewedBy: "KKF Admin",
        };
      }
      return b;
    }));
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
    published: batches.filter(b => b.status === "Published").length,
    inProgress: batches.filter(b => b.status === "In Progress").length,
    draft: batches.filter(b => b.status === "Draft").length,
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
    <div className="min-h-screen bg-[#F4F5F8] p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <header className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <h1 className="text-4xl md:text-5xl font-black text-[#1A1A24] uppercase tracking-tight">
              Match Batches
            </h1>
            <p className="text-sm text-[#707070] font-medium mt-2">
              {stats.total} total • {stats.published} published • {stats.inProgress} in progress • {stats.draft} draft
            </p>
          </div>

          <div className="flex items-center gap-3">
            {/* View Mode Toggle */}
            <div className="flex items-center gap-1 bg-white rounded-xl p-1 shadow-sm border border-[#E0E0E0]">
              <button
                onClick={() => setViewMode('list')}
                className={clsx(
                  "p-2.5 rounded-lg transition-all",
                  viewMode === 'list' ? "bg-[#0A3D91] text-white shadow-md" : "text-[#707070] hover:bg-gray-100"
                )}
                title="List View"
              >
                <LayoutGrid className="w-5 h-5" />
              </button>
              <button
                onClick={() => setViewMode('calendar')}
                className={clsx(
                  "p-2.5 rounded-lg transition-all",
                  viewMode === 'calendar' ? "bg-[#0A3D91] text-white shadow-md" : "text-[#707070] hover:bg-gray-100"
                )}
                title="Calendar View"
              >
                <CalendarDays className="w-5 h-5" />
              </button>
            </div>

            {permissions.hasPermission('matches.create') && (
              <button
                onClick={handleCreateBatch}
                className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-bold uppercase tracking-wide transition-all shadow-lg hover:shadow-xl bg-gradient-to-r from-[#C8102E] to-[#A00D24] text-white hover:opacity-90"
              >
                <ListPlus className="w-5 h-5" />
                Create Batch
              </button>
            )}
          </div>
        </header>

        {/* Filters */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-[#E0E0E0]">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            {/* Search */}
            <div className="relative md:col-span-2">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#707070]" />
              <input
                type="text"
                placeholder="Search by batch ID, event, location, or fighter..."
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

            {/* Status Filter */}
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full bg-[#F4F5F8] border-2 border-[#E0E0E0] rounded-xl px-4 py-3.5 text-[#1A1A24] font-bold focus:outline-none focus:border-[#0A3D91]"
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
              <span className="text-xs font-bold text-[#707070] uppercase">Active Filters:</span>
              
              {filterStatus !== "all" && (
                <button
                  onClick={() => setFilterStatus("all")}
                  className="inline-flex items-center gap-2 px-3 py-1 bg-blue-100 text-blue-700 rounded-lg text-xs font-bold hover:bg-blue-200 transition-colors"
                >
                  Status: {filterStatus}
                  <X className="w-3 h-3" />
                </button>
              )}
              
              {filterLocation !== "all" && (
                <button
                  onClick={() => setFilterLocation("all")}
                  className="inline-flex items-center gap-2 px-3 py-1 bg-purple-100 text-purple-700 rounded-lg text-xs font-bold hover:bg-purple-200 transition-colors"
                >
                  Location: {filterLocation}
                  <X className="w-3 h-3" />
                </button>
              )}
              
              {filterEvent !== "all" && (
                <button
                  onClick={() => setFilterEvent("all")}
                  className="inline-flex items-center gap-2 px-3 py-1 bg-green-100 text-green-700 rounded-lg text-xs font-bold hover:bg-green-200 transition-colors"
                >
                  Event: {filterEvent}
                  <X className="w-3 h-3" />
                </button>
              )}
              
              {filterClub !== "all" && (
                <button
                  onClick={() => setFilterClub("all")}
                  className="inline-flex items-center gap-2 px-3 py-1 bg-amber-100 text-amber-700 rounded-lg text-xs font-bold hover:bg-amber-200 transition-colors"
                >
                  Club: {filterClub}
                  <X className="w-3 h-3" />
                </button>
              )}
              
              {filterFighter && (
                <button
                  onClick={() => setFilterFighter("")}
                  className="inline-flex items-center gap-2 px-3 py-1 bg-red-100 text-red-700 rounded-lg text-xs font-bold hover:bg-red-200 transition-colors"
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
                  className="inline-flex items-center gap-2 px-3 py-1 bg-indigo-100 text-indigo-700 rounded-lg text-xs font-bold hover:bg-indigo-200 transition-colors"
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
                className="text-xs font-bold text-[#C8102E] hover:text-[#A00D24] underline"
              >
                Clear All
              </button>
            </div>
          )}

          {/* Advanced Filters Toggle */}
          <button
            onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
            className="text-sm font-bold text-[#0A3D91] hover:text-[#082F6E] flex items-center gap-2"
          >
            {showAdvancedFilters ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            Advanced Filters
          </button>

          {showAdvancedFilters && (
            <div className="mt-4 pt-4 border-t border-[#E0E0E0] grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Location Filter */}
              <div>
                <label className="block text-xs font-bold text-[#707070] uppercase mb-2">Location</label>
                <select
                  value={filterLocation}
                  onChange={(e) => setFilterLocation(e.target.value)}
                  className="w-full bg-[#F4F5F8] border-2 border-[#E0E0E0] rounded-xl px-4 py-3 text-[#1A1A24] font-bold focus:outline-none focus:border-[#0A3D91]"
                >
                  <option value="all">All Locations</option>
                  {locations.map(loc => (
                    <option key={loc} value={loc}>{loc}</option>
                  ))}
                </select>
              </div>

              {/* Event Filter */}
              <div>
                <label className="block text-xs font-bold text-[#707070] uppercase mb-2">Event</label>
                <select
                  value={filterEvent}
                  onChange={(e) => setFilterEvent(e.target.value)}
                  className="w-full bg-[#F4F5F8] border-2 border-[#E0E0E0] rounded-xl px-4 py-3 text-[#1A1A24] font-bold focus:outline-none focus:border-[#0A3D91]"
                >
                  <option value="all">All Events</option>
                  {events.map(event => (
                    <option key={event} value={event}>{event}</option>
                  ))}
                </select>
              </div>

              {/* Club Filter */}
              <div>
                <label className="block text-xs font-bold text-[#707070] uppercase mb-2">Club</label>
                <select
                  value={filterClub}
                  onChange={(e) => setFilterClub(e.target.value)}
                  className="w-full bg-[#F4F5F8] border-2 border-[#E0E0E0] rounded-xl px-4 py-3 text-[#1A1A24] font-bold focus:outline-none focus:border-[#0A3D91]"
                >
                  <option value="all">All Clubs</option>
                  {clubs.map(club => (
                    <option key={club} value={club}>{club}</option>
                  ))}
                </select>
              </div>

              {/* Fighter Filter */}
              <div>
                <label className="block text-xs font-bold text-[#707070] uppercase mb-2">Fighter</label>
                <input
                  type="text"
                  placeholder="Search by fighter name..."
                  value={filterFighter}
                  onChange={(e) => setFilterFighter(e.target.value)}
                  className="w-full bg-[#F4F5F8] border-2 border-[#E0E0E0] rounded-xl px-4 py-3 text-[#1A1A24] font-bold focus:outline-none focus:border-[#0A3D91]"
                />
              </div>

              {/* Date Range Filter */}
              <div>
                <label className="block text-xs font-bold text-[#707070] uppercase mb-2">Date From</label>
                <input
                  type="date"
                  value={filterDateFrom}
                  onChange={(e) => setFilterDateFrom(e.target.value)}
                  className="w-full bg-[#F4F5F8] border-2 border-[#E0E0E0] rounded-xl px-4 py-3 text-[#1A1A24] font-bold focus:outline-none focus:border-[#0A3D91]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#707070] uppercase mb-2">Date To</label>
                <input
                  type="date"
                  value={filterDateTo}
                  onChange={(e) => setFilterDateTo(e.target.value)}
                  className="w-full bg-[#F4F5F8] border-2 border-[#E0E0E0] rounded-xl px-4 py-3 text-[#1A1A24] font-bold focus:outline-none focus:border-[#0A3D91]"
                />
              </div>
            </div>
          )}
        </div>



        {/* Batches List */}
        {viewMode === 'list' && (
          <div className="space-y-5">
            {filteredBatches.length === 0 ? (
              <div className="bg-white rounded-2xl p-12 text-center shadow-sm border border-[#E0E0E0]">
                <Box className="w-16 h-16 text-[#B0B0B0] mx-auto mb-4" />
                <h3 className="text-xl font-bold text-[#707070] mb-2">No Batches Found</h3>
                <p className="text-[#B0B0B0] font-medium">
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
                    className="bg-white rounded-2xl shadow-sm border border-[#E5E7EB] overflow-hidden transition-all hover:shadow-md hover:border-[#0A3D91]/20"
                  >
                    {/* Batch Header */}
                    <div className="p-6">
                      {/* Title Row */}
                      <div className="flex items-start justify-between gap-4 mb-5">
                        <div className="flex-1 min-w-0">
                          {/* Batch ID + Status + Championship Badge */}
                          <div className="flex items-center gap-2.5 mb-3 flex-wrap">
                            <h2 className="text-2xl font-bold text-[#111827]">
                              {batch.batchNumber}
                            </h2>
                            <span
                              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold ${statusConfig.bgColor} ${statusConfig.color}`}
                            >
                              <span className="text-sm">{statusConfig.icon}</span>
                              {statusConfig.label}
                            </span>
                            {hasChampionship && (
                              <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-50 text-amber-700 rounded-lg text-xs font-semibold border border-amber-200">
                                <Trophy className="w-3.5 h-3.5" />
                                Championship
                              </span>
                            )}
                          </div>

                          {/* Event Name */}
                          <h3 className="text-lg font-semibold text-[#374151] mb-4">
                            {batch.eventName}
                          </h3>

                          {/* Metadata Grid - Clean & Minimal */}
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                            <div className="flex items-center gap-2.5 p-3 bg-gray-50 rounded-lg">
                              <div className="w-9 h-9 rounded-lg bg-blue-100 flex items-center justify-center flex-shrink-0">
                                <Calendar className="w-4.5 h-4.5 text-blue-600" />
                              </div>
                              <div className="min-w-0 flex-1">
                                <div className="text-[10px] text-gray-500 font-medium uppercase tracking-wide mb-0.5">Date</div>
                                <div className="font-semibold text-gray-900 text-sm truncate">{formatDisplayDate(batch.date)}</div>
                              </div>
                            </div>

                            <div className="flex items-center gap-2.5 p-3 bg-gray-50 rounded-lg">
                              <div className="w-9 h-9 rounded-lg bg-red-100 flex items-center justify-center flex-shrink-0">
                                <MapPin className="w-4.5 h-4.5 text-red-600" />
                              </div>
                              <div className="min-w-0 flex-1">
                                <div className="text-[10px] text-gray-500 font-medium uppercase tracking-wide mb-0.5">Venue</div>
                                <div className="font-semibold text-gray-900 text-sm truncate">{batch.location}</div>
                              </div>
                            </div>

                            <div className="flex items-center gap-2.5 p-3 bg-gray-50 rounded-lg">
                              <div className="w-9 h-9 rounded-lg bg-green-100 flex items-center justify-center flex-shrink-0">
                                <Users className="w-4.5 h-4.5 text-green-600" />
                              </div>
                              <div className="min-w-0 flex-1">
                                <div className="text-[10px] text-gray-500 font-medium uppercase tracking-wide mb-0.5">Matches</div>
                                <div className="font-semibold text-gray-900 text-sm">
                                  {batch.totalMatches} {batch.totalMatches === 1 ? 'Fight' : 'Fights'}
                                </div>
                              </div>
                            </div>

                            <div className="flex items-center gap-2.5 p-3 bg-gray-50 rounded-lg">
                              <div className="w-9 h-9 rounded-lg bg-purple-100 flex items-center justify-center flex-shrink-0">
                                <Building2 className="w-4.5 h-4.5 text-purple-600" />
                              </div>
                              <div className="min-w-0 flex-1">
                                <div className="text-[10px] text-gray-500 font-medium uppercase tracking-wide mb-0.5">Organizer</div>
                                <div className="font-semibold text-gray-900 text-sm truncate">
                                  {batch.organizerClub || batch.createdBy}
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* More Menu */}
                        <div className="relative group">
                          <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                            <MoreVertical className="w-5 h-5 text-gray-400" />
                          </button>

                          {/* Dropdown Menu */}
                          <div className="absolute right-0 top-full mt-1 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-10">
                            <button
                              onClick={() => handleDuplicateBatch(batch.id)}
                              className="w-full px-4 py-2 text-left text-sm font-medium text-gray-700 hover:bg-gray-50 flex items-center gap-2 transition-colors"
                            >
                              <Copy className="w-4 h-4 text-gray-500" />
                              Duplicate
                            </button>
                            <button
                              onClick={() => navigate(`/batches/${batch.id}/share`)}
                              className="w-full px-4 py-2 text-left text-sm font-medium text-gray-700 hover:bg-gray-50 flex items-center gap-2 transition-colors"
                            >
                              <Share2 className="w-4 h-4 text-gray-500" />
                              Share
                            </button>
                            <button
                              onClick={() => {/* Export functionality */}}
                              className="w-full px-4 py-2 text-left text-sm font-medium text-gray-700 hover:bg-gray-50 flex items-center gap-2 transition-colors"
                            >
                              <Download className="w-4 h-4 text-gray-500" />
                              Export PDF
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* Special Badges */}
                      {(batch.broadcastStation || batch.mainSponsor) && (
                        <div className="flex items-center gap-2 flex-wrap mt-4 pt-4 border-t border-gray-100">
                          {batch.broadcastStation && (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-purple-50 text-purple-700 rounded-md text-xs font-medium border border-purple-200">
                              <Radio className="w-3.5 h-3.5" />
                              {batch.broadcastStation}
                            </span>
                          )}

                          {batch.mainSponsor && (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-amber-50 text-amber-700 rounded-md text-xs font-medium border border-amber-200">
                              <Award className="w-3.5 h-3.5" />
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
                          className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#0A3D91] hover:bg-[#082F6E] text-white rounded-lg font-semibold transition-all text-sm"
                        >
                          <Eye className="w-4 h-4" />
                          {batch.status === "Draft"
                            ? "Add Matches"
                            : "View Details"}
                        </button>

                        {/* Secondary Actions */}
                        {batch.status === "Draft" && permissions.hasPermission('matches.edit') && (
                          <button
                            onClick={() => navigate(`/matches/${batch.id}/edit`)}
                            className="inline-flex items-center gap-2 px-5 py-2.5 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 rounded-lg font-semibold transition-all text-sm"
                          >
                            <Edit2 className="w-4 h-4" />
                            Edit
                          </button>
                        )}

                        {/* Assign Officials - Available for all non-Complete batches */}
                        {batch.status !== "Complete" && permissions.hasPermission('officials.assign') && (
                          <button
                            onClick={() => navigate(`/batches/${batch.id}/officials`)}
                            className="inline-flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-semibold transition-all text-sm"
                          >
                            <Shield className="w-4 h-4" />
                            Officials
                          </button>
                        )}

                        {/* Workflow Actions */}
                        {permissions.hasPermission('federation.submit') && (
                          <div className="relative group">
                            <button
                              onClick={() => handleSubmitToKKF(batch.id)}
                              disabled={!canSubmitToKKF(batch)}
                              className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-lg font-semibold transition-all text-sm ${
                                canSubmitToKKF(batch)
                                  ? "bg-green-600 hover:bg-green-700 text-white"
                                  : "bg-gray-200 text-gray-400 cursor-not-allowed"
                              }`}
                            >
                              <Send className="w-4 h-4" />
                              Submit
                            </button>
                            {!canSubmitToKKF(batch) && (
                              <div className="absolute bottom-full left-0 mb-2 w-44 bg-gray-900 text-white text-xs rounded-lg px-2.5 py-1.5 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-20 shadow-lg">
                                {batch.status !== "Draft" && batch.status !== "Ready"
                                  ? "Already submitted"
                                  : "Complete requirements"}
                              </div>
                            )}
                          </div>
                        )}

                        {/* Delete Button */}
                        {permissions.hasPermission('matches.delete') && (
                          <div className="relative group">
                            <button
                              onClick={() => handleDeleteBatch(batch.id, batch.batchNumber)}
                              disabled={!canDelete(batch.status)}
                              className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-lg font-semibold transition-all text-sm ${
                                canDelete(batch.status)
                                  ? "bg-red-600 hover:bg-red-700 text-white"
                                  : "bg-gray-200 text-gray-400 cursor-not-allowed"
                              }`}
                            >
                              <Trash2 className="w-4 h-4" />
                              Delete
                            </button>
                            {!canDelete(batch.status) && (
                              <div className="absolute bottom-full left-0 mb-2 w-40 bg-gray-900 text-white text-xs rounded-lg px-2.5 py-1.5 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-20 shadow-lg">
                                Cannot delete after submission
                              </div>
                            )}
                          </div>
                        )}

                        {/* Expand Toggle */}
                        <button
                          onClick={() => toggleBatch(batch.id)}
                          className="inline-flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 rounded-lg font-semibold transition-all text-sm ml-auto"
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
                      <div className="border-t border-gray-200 bg-gray-50 p-5">
                        <div className="flex items-center justify-between mb-4">
                          <h4 className="text-sm font-semibold text-gray-900">Match Details</h4>
                          <span className="text-xs text-gray-500">
                            Total Weight: {batch.matches.reduce((sum, m) => sum + (m.agreedWeight || 0), 0)} kg
                          </span>
                        </div>

                        <div className="space-y-3">
                          {batch.matches.map((match, idx) => (
                            <div
                              key={match.id}
                              className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-sm hover:border-gray-300 transition-all"
                            >
                              <div className="flex items-center gap-4">
                                {/* Match Number */}
                                <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center flex-shrink-0">
                                  <span className="text-lg font-bold text-white">{idx + 1}</span>
                                </div>

                                {/* Fighters */}
                                <div className="flex-1 flex items-center gap-4">
                                  <div className="flex-1 text-right">
                                    <div className="font-semibold text-gray-900 text-sm mb-1">{match.fighterA.name}</div>
                                    <div className="flex items-center justify-end gap-1.5">
                                      <span className="text-xs text-gray-500">{match.fighterA.clubName}</span>
                                      <span className="px-1.5 py-0.5 bg-blue-100 text-blue-700 rounded text-xs font-medium">
                                        {match.fighterA.grade}
                                      </span>
                                    </div>
                                    <div className="text-xs text-gray-500 mt-0.5">{match.fighterA.weight} kg • {match.fighterA.record}</div>
                                  </div>

                                  <div className="px-3 py-1.5 bg-red-600 rounded-md">
                                    <span className="text-white font-semibold text-sm">VS</span>
                                  </div>

                                  <div className="flex-1">
                                    <div className="font-semibold text-gray-900 text-sm mb-1">{match.fighterB.name}</div>
                                    <div className="flex items-center gap-1.5">
                                      <span className="px-1.5 py-0.5 bg-red-100 text-red-700 rounded text-xs font-medium">
                                        {match.fighterB.grade}
                                      </span>
                                      <span className="text-xs text-gray-500">{match.fighterB.clubName}</span>
                                    </div>
                                    <div className="text-xs text-gray-500 mt-0.5">{match.fighterB.weight} kg • {match.fighterB.record}</div>
                                  </div>
                                </div>

                                {/* Match Metadata */}
                                <div className="flex items-center gap-3">
                                  <div className="text-center px-3 py-1.5 bg-gray-50 rounded-md border border-gray-200">
                                    <div className="text-[10px] text-gray-500 font-medium uppercase mb-0.5">Weight</div>
                                    <div className="font-semibold text-gray-900 text-xs">{match.agreedWeight || match.weightClass}</div>
                                  </div>

                                  <div className="text-center px-3 py-1.5 bg-gray-50 rounded-md border border-gray-200">
                                    <div className="text-[10px] text-gray-500 font-medium uppercase mb-0.5">Rounds</div>
                                    <div className="font-semibold text-gray-900 text-xs">{match.rounds}</div>
                                  </div>

                                  {match.isChampionshipBout && (
                                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-amber-50 text-amber-700 rounded-md text-xs font-medium border border-amber-200">
                                      <Trophy className="w-3.5 h-3.5" />
                                      Title
                                    </span>
                                  )}
                                </div>

                                {/* View Match */}
                                <Link
                                  to={`/match/${match.id}`}
                                  className="p-2 hover:bg-blue-50 text-blue-600 rounded-md transition-all"
                                  title="View Details"
                                >
                                  <Eye className="w-5 h-5" />
                                </Link>
                              </div>

                              {/* Officials Info */}
                              {match.refereeId && (
                                <div className="mt-3 pt-3 border-t border-gray-200 flex items-center gap-4 text-xs">
                                  <div className="flex items-center gap-1.5">
                                    <Shield className="w-3.5 h-3.5 text-indigo-600" />
                                    <span className="text-gray-500">Referee:</span>
                                    <span className="font-medium text-gray-900">{match.refereeName}</span>
                                  </div>
                                  {match.judgeNames && match.judgeNames.length > 0 && (
                                    <div className="flex items-center gap-1.5">
                                      <span className="font-bold text-[#707070]">Judges:</span>
                                      <span className="font-black text-[#1A1A24]">{match.judgeNames.join(", ")}</span>
                                    </div>
                                  )}
                                </div>
                              )}
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