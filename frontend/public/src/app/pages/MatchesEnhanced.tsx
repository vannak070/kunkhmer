import { useState } from "react";
import { useNavigate, Link } from "react-router";
import { 
  Eye, Plus, Search, ChevronDown, ChevronUp, Edit3,
  CheckCircle, Clock, FileText, Calendar, MapPin, Users,
  Send, AlertCircle, Edit2, Box, ListPlus, TrendingUp,
  Shield, Trophy, Radio, Award, Building2, X, Copy,
  MoreVertical, Filter, Trash2, CheckSquare, Square,
  LayoutGrid, CalendarDays, Download, Share2,
  PlayCircle, PauseCircle, XCircle
} from "lucide-react";
import { 
  MOCK_BATCHES, 
  BATCH_STATUS_CONFIG, 
  calculateBatchReadiness,
  getBatchWarnings,
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
    case "Approved":
    case "Scheduled":
    case "Completed":
      return "border-l-green-500";
    case "Pending KKF":
      return "border-l-amber-500";
    case "Rejected":
      return "border-l-red-500";
    case "Draft":
    default:
      return "border-l-gray-400";
  }
};

// Calculate detailed readiness breakdown
const getReadinessBreakdown = (batch: MatchBatch) => {
  const totalMatches = batch.totalMatches;
  const matchesCompleted = batch.matches.filter(m => 
    m.fighterA && m.fighterB && m.rounds
  ).length;
  
  const fightersAssigned = batch.matches.filter(m => 
    m.fighterA && m.fighterB
  ).length;
  
  const hasApproval = batch.status !== "Draft";
  
  const officialsNeeded = batch.matches.some(m => m.isChampionshipBout);
  const officialsAssigned = batch.matches.every(m => 
    !m.isChampionshipBout || (m.refereeId && m.judgeIds && m.judgeIds.length === 3)
  );
  
  return {
    matchesProgress: (matchesCompleted / totalMatches) * 100,
    fightersProgress: (fightersAssigned / totalMatches) * 100,
    approvalProgress: hasApproval ? 100 : 0,
    officialsProgress: officialsNeeded ? (officialsAssigned ? 100 : 0) : 100,
    breakdown: {
      matches: `${matchesCompleted}/${totalMatches} matches completed`,
      fighters: `${fightersAssigned}/${totalMatches} fighters assigned`,
      approval: hasApproval ? "Approval received" : "Awaiting approval",
      officials: officialsNeeded 
        ? (officialsAssigned ? "Officials assigned" : "Officials needed")
        : "No officials needed"
    }
  };
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
    return status === "Draft" || status === "Rejected";
  };

  const canSubmitToKKF = (batch: MatchBatch): boolean => {
    return (batch.status === "Draft" || batch.status === "Ready") && isReadyForSubmission(batch);
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
    approved: batches.filter(b => b.status === "Approved" || b.status === "Scheduled").length,
    pending: batches.filter(b => b.status === "Pending KKF").length,
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
              {stats.total} total • {stats.approved} approved • {stats.pending} pending • {stats.draft} draft
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
              <option value="Pending KKF">Pending KKF</option>
              <option value="Approved">Approved</option>
              <option value="Rejected">Rejected</option>
              <option value="Scheduled">Scheduled</option>
              <option value="Completed">Completed</option>
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
                const statusConfig = BATCH_STATUS_CONFIG[batch.status];
                const readiness = calculateBatchReadiness(batch);
                const breakdown = getReadinessBreakdown(batch);
                const warnings = getBatchWarnings(batch);
                const hasChampionship = batch.matches.some(m => m.isChampionshipBout);
                const borderColor = getStatusBorderColor(batch.status);

                return (
                  <div
                    key={batch.id}
                    className={clsx(
                      "bg-white rounded-2xl shadow-md border-l-4 overflow-hidden transition-all hover:shadow-lg",
                      borderColor
                    )}
                  >
                    {/* Action Required Alert - Top Priority */}
                    {warnings.length > 0 && (
                      <div className="bg-gradient-to-r from-amber-50 to-orange-50 border-b-2 border-amber-200 px-6 py-3">
                        <div className="flex items-center gap-3">
                          <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0" />
                          <div className="flex-1">
                            <h4 className="text-sm font-black text-amber-900 uppercase inline-block mr-3">
                              🚨 Action Required
                            </h4>
                            <span className="text-xs font-bold text-amber-700">
                              {warnings[0]}
                              {warnings.length > 1 && ` (+${warnings.length - 1} more)`}
                            </span>
                          </div>
                          <button
                            onClick={() => handleViewDetails(batch.id)}
                            className="text-xs font-bold text-amber-700 hover:text-amber-900 underline"
                          >
                            Fix Now →
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Batch Header */}
                    <div className="p-7">
                      {/* Title Row - PROMINENT */}
                      <div className="flex items-start gap-4 mb-6">
                        <div className="flex-1 min-w-0">
                          {/* Batch ID + Event Name - Primary Focus */}
                          <div className="mb-3">
                            <h2 className="text-3xl md:text-4xl font-black text-[#0A3D91] uppercase tracking-tight mb-2">
                              {batch.batchNumber}
                            </h2>
                            <div className="text-xl md:text-2xl font-black text-[#1A1A24]">
                              {batch.eventName}
                            </div>
                          </div>

                          {/* Compact Metadata Row */}
                          <div className="flex items-center gap-6 flex-wrap text-sm">
                            <div className="flex items-center gap-2">
                              <Calendar className="w-4 h-4 text-[#707070]" />
                              <span className="font-bold text-[#1A1A24]">{formatDisplayDate(batch.date)}</span>
                            </div>
                            
                            <div className="flex items-center gap-2">
                              <MapPin className="w-4 h-4 text-[#707070]" />
                              <span className="font-bold text-[#707070]">{batch.location}</span>
                            </div>
                            
                            <div className="flex items-center gap-2">
                              <Users className="w-4 h-4 text-[#707070]" />
                              <span className="font-bold text-[#707070]">
                                {batch.totalMatches} {batch.totalMatches === 1 ? 'Match' : 'Matches'}
                              </span>
                            </div>
                            
                            <div className="flex items-center gap-2">
                              <Building2 className="w-4 h-4 text-[#707070]" />
                              <span className="font-bold text-[#707070]">
                                {batch.organizerClub || batch.createdBy}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Status Badge */}
                        <div className="flex flex-col items-end gap-2">
                          <span 
                            className={`px-4 py-2 rounded-xl text-xs font-black uppercase ${statusConfig.bgColor} ${statusConfig.color} shadow-sm`}
                          >
                            {statusConfig.icon} {statusConfig.label}
                          </span>

                          {/* More Menu */}
                          <div className="relative group">
                            <button className="p-2 hover:bg-[#F9FAFB] rounded-lg transition-colors">
                              <MoreVertical className="w-5 h-5 text-[#707070]" />
                            </button>
                            
                            {/* Dropdown Menu */}
                            <div className="absolute right-0 top-full mt-1 w-48 bg-white rounded-xl shadow-xl border border-[#E0E0E0] py-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-10">
                              <button
                                onClick={() => handleDuplicateBatch(batch.id)}
                                className="w-full px-4 py-2 text-left text-sm font-bold text-[#1A1A24] hover:bg-[#F9FAFB] flex items-center gap-2"
                              >
                                <Copy className="w-4 h-4" />
                                Duplicate Batch
                              </button>
                              <button
                                onClick={() => navigate(`/batches/${batch.id}/share`)}
                                className="w-full px-4 py-2 text-left text-sm font-bold text-[#1A1A24] hover:bg-[#F9FAFB] flex items-center gap-2"
                              >
                                <Share2 className="w-4 h-4" />
                                Share Fight Card
                              </button>
                              <button
                                onClick={() => {/* Export functionality */}}
                                className="w-full px-4 py-2 text-left text-sm font-bold text-[#1A1A24] hover:bg-[#F9FAFB] flex items-center gap-2"
                              >
                                <Download className="w-4 h-4" />
                                Export PDF
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Progress Bar with Breakdown - Redesigned */}
                      <div className="mb-6 bg-white rounded-2xl border-2 border-[#E0E0E0] overflow-hidden">
                        {/* Header Section */}
                        <div className="flex items-center justify-between p-5 border-b-2 border-[#E0E0E0]">
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-12 bg-gradient-to-br from-[#0A3D91] to-[#082F6E] rounded-xl flex items-center justify-center shadow-md">
                              <TrendingUp className="w-6 h-6 text-white" />
                            </div>
                            <div>
                              <h4 className="text-sm font-black text-[#1A1A24] uppercase tracking-wide">Batch Readiness</h4>
                              <p className="text-xs text-[#707070] font-medium">Complete all requirements</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-5xl font-black bg-gradient-to-r from-[#0A3D91] to-[#082F6E] bg-clip-text text-transparent">
                              {readiness}%
                            </div>
                          </div>
                        </div>
                        
                        {/* Main Progress Bar */}
                        <div className="px-5 pt-5 pb-3">
                          <div className="w-full h-3 bg-[#F4F5F8] rounded-full overflow-hidden shadow-inner">
                            <div 
                              className={`h-full transition-all duration-700 rounded-full ${
                                readiness === 100 
                                  ? 'bg-gradient-to-r from-green-500 to-emerald-600' 
                                  : 'bg-gradient-to-r from-[#0A3D91] to-[#082F6E]'
                              }`}
                              style={{ width: `${readiness}%` }}
                            />
                          </div>
                        </div>
                        
                        {/* Status Cards Grid */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-px bg-[#E0E0E0] p-px">
                          {/* Matches */}
                          <div className="p-5 bg-white">
                            <div className="flex items-center gap-2 mb-3">
                              <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                                breakdown.matchesProgress === 100 
                                  ? 'bg-green-100' 
                                  : 'bg-gray-100'
                              }`}>
                                <CheckCircle className={`w-5 h-5 ${
                                  breakdown.matchesProgress === 100 
                                    ? 'text-green-600' 
                                    : 'text-gray-400'
                                }`} />
                              </div>
                              <span className="text-xs font-black text-[#1A1A24] uppercase">Matches</span>
                            </div>
                            <div className="text-3xl font-black text-[#0A3D91] mb-2">
                              {Math.round(breakdown.matchesProgress)}%
                            </div>
                            <div className="text-xs text-[#707070] font-bold leading-tight">
                              {breakdown.breakdown.matches}
                            </div>
                          </div>
                          
                          {/* Fighters */}
                          <div className="p-5 bg-white">
                            <div className="flex items-center gap-2 mb-3">
                              <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                                breakdown.fightersProgress === 100 
                                  ? 'bg-blue-100' 
                                  : 'bg-gray-100'
                              }`}>
                                <Users className={`w-5 h-5 ${
                                  breakdown.fightersProgress === 100 
                                    ? 'text-blue-600' 
                                    : 'text-gray-400'
                                }`} />
                              </div>
                              <span className="text-xs font-black text-[#1A1A24] uppercase">Fighters</span>
                            </div>
                            <div className="text-3xl font-black text-[#0A3D91] mb-2">
                              {Math.round(breakdown.fightersProgress)}%
                            </div>
                            <div className="text-xs text-[#707070] font-bold leading-tight">
                              {breakdown.breakdown.fighters}
                            </div>
                          </div>
                          
                          {/* Approval */}
                          <div className="p-5 bg-white">
                            <div className="flex items-center gap-2 mb-3">
                              <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                                breakdown.approvalProgress === 100 
                                  ? 'bg-amber-100' 
                                  : 'bg-gray-100'
                              }`}>
                                <Shield className={`w-5 h-5 ${
                                  breakdown.approvalProgress === 100 
                                    ? 'text-amber-600' 
                                    : 'text-gray-400'
                                }`} />
                              </div>
                              <span className="text-xs font-black text-[#1A1A24] uppercase">Approval</span>
                            </div>
                            <div className="text-3xl font-black text-[#0A3D91] mb-2">
                              {breakdown.approvalProgress}%
                            </div>
                            <div className="text-xs text-[#707070] font-bold leading-tight">
                              {breakdown.breakdown.approval}
                            </div>
                          </div>
                          
                          {/* Officials */}
                          <div className="p-5 bg-white">
                            <div className="flex items-center gap-2 mb-3">
                              <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                                breakdown.officialsProgress === 100 
                                  ? 'bg-purple-100' 
                                  : 'bg-gray-100'
                              }`}>
                                <Award className={`w-5 h-5 ${
                                  breakdown.officialsProgress === 100 
                                    ? 'text-purple-600' 
                                    : 'text-gray-400'
                                }`} />
                              </div>
                              <span className="text-xs font-black text-[#1A1A24] uppercase">Officials</span>
                            </div>
                            <div className="text-3xl font-black text-[#0A3D91] mb-2">
                              {breakdown.officialsProgress}%
                            </div>
                            <div className="text-xs text-[#707070] font-bold leading-tight">
                              {breakdown.breakdown.officials}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Badges Row */}
                      {(batch.broadcastStation || batch.mainSponsor || hasChampionship) && (
                        <div className="flex items-center gap-3 flex-wrap mb-6">
                          {batch.broadcastStation && (
                            <div className="flex items-center gap-2 px-3 py-2 bg-purple-50 rounded-xl border border-purple-200">
                              <Radio className="w-4 h-4 text-purple-600" />
                              <span className="text-xs font-bold text-purple-700">{batch.broadcastStation}</span>
                            </div>
                          )}
                          
                          {batch.mainSponsor && (
                            <div className="flex items-center gap-2 px-3 py-2 bg-amber-50 rounded-xl border border-amber-200">
                              <Award className="w-4 h-4 text-amber-600" />
                              <span className="text-xs font-bold text-amber-700">{batch.mainSponsor}</span>
                            </div>
                          )}
                          
                          {hasChampionship && (
                            <div className="flex items-center gap-2 px-3 py-2 bg-yellow-50 rounded-xl border border-yellow-300">
                              <Trophy className="w-4 h-4 text-yellow-600" />
                              <span className="text-xs font-black text-yellow-700">CHAMPIONSHIP BOUT</span>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Action Buttons - Improved Hierarchy */}
                      <div className="flex items-center gap-3 flex-wrap">
                        {/* Primary Action */}
                        <button
                          onClick={() => handleViewDetails(batch.id)}
                          className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#0A3D91] to-[#082F6E] hover:from-[#082F6E] hover:to-[#0A3D91] text-white rounded-xl font-bold transition-all shadow-md hover:shadow-lg text-base"
                        >
                          <Eye className="w-5 h-5" />
                          {warnings.length > 0 
                            ? "Continue" 
                            : batch.status === "Draft" 
                              ? "Add Matches" 
                              : "View Details"}
                        </button>

                        {/* Secondary Actions */}
                        {batch.status === "Draft" && permissions.hasPermission('matches.edit') && (
                          <button
                            onClick={() => navigate(`/matches/${batch.id}/edit`)}
                            className="inline-flex items-center gap-2 px-5 py-3 bg-white border-2 border-[#E0E0E0] hover:border-[#0A3D91] hover:bg-[#F9FAFB] text-[#1A1A24] rounded-xl font-bold transition-all text-base"
                          >
                            <Edit2 className="w-5 h-5" />
                            Edit Details
                          </button>
                        )}

                        {hasChampionship && batch.status !== "Completed" && permissions.hasPermission('officials.assign') && (
                          <button
                            onClick={() => navigate(`/batches/${batch.id}/officials`)}
                            className="inline-flex items-center gap-2 px-5 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold transition-all text-base shadow-md"
                          >
                            <Shield className="w-5 h-5" />
                            Assign Officials
                          </button>
                        )}

                        {/* Workflow Actions */}
                        {permissions.hasPermission('federation.submit') && (
                          <div className="relative group">
                            <button
                              onClick={() => handleSubmitToKKF(batch.id)}
                              disabled={!canSubmitToKKF(batch)}
                              className={`inline-flex items-center gap-2 px-5 py-3 rounded-xl font-bold transition-all text-base shadow-md ${
                                canSubmitToKKF(batch)
                                  ? "bg-green-600 hover:bg-green-700 text-white"
                                  : "bg-gray-300 text-gray-500 cursor-not-allowed"
                              }`}
                            >
                              <Send className="w-5 h-5" />
                              Submit to KKF
                            </button>
                            {!canSubmitToKKF(batch) && (
                              <div className="absolute bottom-full left-0 mb-2 w-56 bg-gray-900 text-white text-xs rounded-lg px-3 py-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-20 shadow-xl">
                                {batch.status !== "Draft" && batch.status !== "Ready" 
                                  ? "Already submitted" 
                                  : "Complete all requirements before submitting"}
                              </div>
                            )}
                          </div>
                        )}

                        {batch.status === "Pending KKF" && permissions.hasPermission('federation.approve') && (
                          <>
                            <button
                              onClick={() => handleApprove(batch.id)}
                              className="inline-flex items-center gap-2 px-5 py-3 bg-green-600 hover:bg-green-700 text-white rounded-xl font-bold transition-all text-base shadow-md"
                            >
                              <CheckCircle className="w-5 h-5" />
                              Approve
                            </button>
                            <button
                              onClick={() => handleReject(batch.id)}
                              className="inline-flex items-center gap-2 px-5 py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold transition-all text-base shadow-md"
                            >
                              <X className="w-5 h-5" />
                              Reject
                            </button>
                          </>
                        )}

                        {/* Delete Button - Always visible */}
                        {permissions.hasPermission('matches.delete') && (
                          <div className="relative group">
                            <button
                              onClick={() => handleDeleteBatch(batch.id, batch.batchNumber)}
                              disabled={!canDelete(batch.status)}
                              className={`inline-flex items-center gap-2 px-5 py-3 rounded-xl font-bold transition-all text-base shadow-md ${
                                canDelete(batch.status)
                                  ? "bg-red-600 hover:bg-red-700 text-white"
                                  : "bg-gray-300 text-gray-500 cursor-not-allowed"
                              }`}
                            >
                              <Trash2 className="w-5 h-5" />
                              Delete
                            </button>
                            {!canDelete(batch.status) && (
                              <div className="absolute bottom-full left-0 mb-2 w-56 bg-gray-900 text-white text-xs rounded-lg px-3 py-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-20 shadow-xl">
                                Cannot delete after submission
                              </div>
                            )}
                          </div>
                        )}

                        {/* Expand Toggle */}
                        <button
                          onClick={() => toggleBatch(batch.id)}
                          className="inline-flex items-center gap-2 px-5 py-3 bg-white border-2 border-[#E0E0E0] hover:border-[#707070] text-[#707070] rounded-xl font-bold transition-all text-base ml-auto"
                        >
                          {isExpanded ? (
                            <>
                              <ChevronUp className="w-5 h-5" />
                              Hide Matches
                            </>
                          ) : (
                            <>
                              <ChevronDown className="w-5 h-5" />
                              Show {batch.totalMatches} {batch.totalMatches === 1 ? 'Match' : 'Matches'}
                            </>
                          )}
                        </button>
                      </div>
                    </div>

                    {/* Expanded Content - Enhanced Match List */}
                    {isExpanded && (
                      <div className="border-t-2 border-[#E0E0E0] bg-gradient-to-b from-[#F9FAFB] to-white p-7">
                        <div className="flex items-center justify-between mb-5">
                          <h4 className="text-base font-black text-[#1A1A24] uppercase">Match Details</h4>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-[#707070]">
                              Total Weight: {batch.matches.reduce((sum, m) => sum + (m.agreedWeight || 0), 0)} kg
                            </span>
                          </div>
                        </div>
                        
                        <div className="space-y-4">
                          {batch.matches.map((match, idx) => (
                            <div
                              key={match.id}
                              className="bg-white border-2 border-[#E0E0E0] rounded-2xl p-5 hover:shadow-lg hover:border-[#0A3D91] transition-all"
                            >
                              <div className="flex items-center gap-5">
                                {/* Match Number */}
                                <div className="w-14 h-14 bg-gradient-to-br from-[#0A3D91] to-[#082F6E] rounded-xl flex items-center justify-center flex-shrink-0 shadow-md">
                                  <span className="text-2xl font-black text-white">{idx + 1}</span>
                                </div>

                                {/* Fighters */}
                                <div className="flex-1 flex items-center gap-5">
                                  <div className="flex-1 text-right">
                                    <div className="font-black text-[#1A1A24] text-lg mb-1">{match.fighterA.name}</div>
                                    <div className="flex items-center justify-end gap-2">
                                      <span className="text-xs text-[#707070] font-medium">{match.fighterA.clubName}</span>
                                      <span className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded text-xs font-bold">
                                        {match.fighterA.grade}
                                      </span>
                                    </div>
                                    <div className="text-xs text-[#707070] font-medium mt-1">{match.fighterA.weight} kg • {match.fighterA.record}</div>
                                  </div>
                                  
                                  <div className="px-5 py-3 bg-gradient-to-r from-[#C8102E] to-[#A00D24] rounded-xl shadow-md">
                                    <span className="text-white font-black text-lg">VS</span>
                                  </div>
                                  
                                  <div className="flex-1">
                                    <div className="font-black text-[#1A1A24] text-lg mb-1">{match.fighterB.name}</div>
                                    <div className="flex items-center gap-2">
                                      <span className="px-2 py-0.5 bg-red-100 text-red-700 rounded text-xs font-bold">
                                        {match.fighterB.grade}
                                      </span>
                                      <span className="text-xs text-[#707070] font-medium">{match.fighterB.clubName}</span>
                                    </div>
                                    <div className="text-xs text-[#707070] font-medium mt-1">{match.fighterB.weight} kg • {match.fighterB.record}</div>
                                  </div>
                                </div>

                                {/* Match Metadata */}
                                <div className="flex items-center gap-6">
                                  <div className="text-center px-4 py-2 bg-gradient-to-b from-gray-50 to-gray-100 rounded-xl border border-gray-200">
                                    <div className="text-xs text-[#707070] font-bold uppercase mb-1">Weight</div>
                                    <div className="font-black text-[#1A1A24] text-base">{match.agreedWeight || match.weightClass}</div>
                                  </div>
                                  
                                  <div className="text-center px-4 py-2 bg-gradient-to-b from-gray-50 to-gray-100 rounded-xl border border-gray-200">
                                    <div className="text-xs text-[#707070] font-bold uppercase mb-1">Rounds</div>
                                    <div className="font-black text-[#1A1A24] text-base">{match.rounds}</div>
                                  </div>

                                  {match.isChampionshipBout && (
                                    <div className="px-4 py-2 bg-gradient-to-r from-yellow-100 to-amber-100 rounded-xl border-2 border-yellow-300 shadow-sm">
                                      <div className="flex items-center gap-2">
                                        <Trophy className="w-5 h-5 text-yellow-700" />
                                        <span className="text-sm font-black text-yellow-800 uppercase">Title Fight</span>
                                      </div>
                                    </div>
                                  )}
                                </div>

                                {/* View Match */}
                                <Link
                                  to={`/match/${match.id}`}
                                  className="p-3 hover:bg-[#0A3D91] hover:text-white bg-[#F9FAFB] text-[#0A3D91] rounded-xl transition-all border-2 border-[#E0E0E0] hover:border-[#0A3D91]"
                                  title="View Match Details"
                                >
                                  <Eye className="w-6 h-6" />
                                </Link>
                              </div>

                              {/* Officials Info (if assigned) */}
                              {match.refereeId && (
                                <div className="mt-4 pt-4 border-t border-[#E0E0E0] flex items-center gap-4 text-xs">
                                  <div className="flex items-center gap-2">
                                    <Shield className="w-4 h-4 text-indigo-600" />
                                    <span className="font-bold text-[#707070]">Referee:</span>
                                    <span className="font-black text-[#1A1A24]">{match.refereeName}</span>
                                  </div>
                                  {match.judgeNames && match.judgeNames.length > 0 && (
                                    <div className="flex items-center gap-2">
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