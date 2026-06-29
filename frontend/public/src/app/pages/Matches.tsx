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
  calculateBatchReadiness,
  getBatchWarnings,
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
  const allClubsApproved = (batch: MatchBatch): boolean => {
    return !batch.matches.some(match => match.status === "Waiting Club Approval");
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
        </header>

        {/* Filters */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-[#E0E0E0]">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            {/* Search */}
            <div className="relative md:col-span-2">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#707070]" />
              <input
                type="text"
                placeholder="Search by batch, event, location, or fighter..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-[#F4F5F8] border-2 border-[#E0E0E0] rounded-xl pl-12 pr-4 py-3.5 text-[#1A1A24] font-semibold focus:outline-none focus:border-[#0A3D91]"
              />
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
        <div className="space-y-4">
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
              const warnings = getBatchWarnings(batch);
              const hasChampionship = batch.matches.some(m => m.isChampionshipBout);

              return (
                <div
                  key={batch.id}
                  className="bg-white rounded-2xl shadow-sm border border-[#E0E0E0] overflow-hidden transition-all hover:shadow-md"
                >
                  {/* Batch Header */}
                  <div className="p-4 md:p-6">
                    {/* Title Row */}
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="text-2xl md:text-3xl font-black text-[#0A3D91] uppercase tracking-tight">
                            {batch.batchNumber}
                          </h3>
                          <span 
                            className={`px-2 md:px-3 py-1 rounded-lg text-xs font-black uppercase ${statusConfig.bgColor} ${statusConfig.color}`}
                            title={`Status: ${statusConfig.label}`}
                          >
                            {statusConfig.icon} {statusConfig.label}
                          </span>
                        </div>
                        
                        {/* Event Name */}
                        <div className="text-base md:text-xl font-black text-[#1A1A24] mb-3">
                          {batch.eventName}
                        </div>

                        {/* Compact Info Row */}
                        <div className="flex items-center gap-3 md:gap-4 flex-wrap text-sm">
                          <div className="flex items-center gap-1.5 text-[#707070]">
                            <Calendar className="w-4 h-4" />
                            <span className="font-bold text-[#1A1A24]">{formatDisplayDate(batch.date)}</span>
                          </div>
                          
                          <div className="w-1 h-1 bg-[#E0E0E0] rounded-full" />
                          
                          <div className="flex items-center gap-1.5 text-[#707070]">
                            <MapPin className="w-4 h-4" />
                            <span className="font-bold text-[#1A1A24]">{batch.location}</span>
                          </div>
                          
                          <div className="w-1 h-1 bg-[#E0E0E0] rounded-full" />
                          
                          <div className="flex items-center gap-1.5 text-[#707070]">
                            <Users className="w-4 h-4" />
                            <span className="font-bold text-[#1A1A24]">{batch.totalMatches} {batch.totalMatches === 1 ? 'Match' : 'Matches'}</span>
                          </div>

                          {batch.organizerClub && (
                            <>
                              <div className="w-1 h-1 bg-[#E0E0E0] rounded-full" />
                              <div className="flex items-center gap-1.5 text-[#707070]">
                                <Building2 className="w-4 h-4" />
                                <span className="font-bold text-[#1A1A24]">{batch.organizerClub}</span>
                              </div>
                            </>
                          )}
                        </div>
                      </div>

                      <button
                        onClick={() => toggleBatch(batch.id)}
                        className="flex items-center gap-2 px-3 py-2 hover:bg-[#F9FAFB] rounded-lg transition-colors ml-2"
                      >
                        {isExpanded ? (
                          <ChevronUp className="w-5 h-5 text-[#707070]" />
                        ) : (
                          <ChevronDown className="w-5 h-5 text-[#707070]" />
                        )}
                      </button>
                    </div>

                    {/* Key Metadata Row - Compact Badges */}
                    {(batch.broadcastStation || batch.mainSponsor || hasChampionship) && (
                      <div className="flex items-center gap-2 flex-wrap mb-4">
                        {batch.broadcastStation && (
                          <div className="flex items-center gap-1.5 px-2.5 py-1 bg-purple-50 rounded-lg border border-purple-200">
                            <Radio className="w-3.5 h-3.5 text-purple-600" />
                            <span className="text-xs font-bold text-purple-700">{batch.broadcastStation}</span>
                          </div>
                        )}
                        
                        {batch.mainSponsor && (
                          <div className="flex items-center gap-1.5 px-2.5 py-1 bg-amber-50 rounded-lg border border-amber-200">
                            <Award className="w-3.5 h-3.5 text-amber-600" />
                            <span className="text-xs font-bold text-amber-700">{batch.mainSponsor}</span>
                          </div>
                        )}
                        
                        {hasChampionship && (
                          <div className="flex items-center gap-1.5 px-2.5 py-1 bg-yellow-50 rounded-lg border border-yellow-300">
                            <Trophy className="w-3.5 h-3.5 text-yellow-600" />
                            <span className="text-xs font-black text-yellow-700">Title Fight</span>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Warnings - Compact */}
                    {warnings.length > 0 && (
                      <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-xl">
                        <div className="flex items-start gap-2">
                          <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                          <div className="flex-1">
                            <ul className="space-y-1">
                              {warnings.map((warning, idx) => (
                                <li key={idx} className="text-xs font-bold text-amber-700 flex items-start gap-2">
                                  <span className="text-amber-500">•</span>
                                  <span>{warning}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Quick Action Buttons - Compact */}
                    <div className="flex items-center gap-2 flex-wrap">
                      {/* View Details - Primary */}
                      <button
                        onClick={() => handleViewDetails(batch.id)}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-[#0A3D91] hover:bg-[#082F6E] text-white rounded-xl font-bold transition-all shadow-sm hover:shadow-md text-sm"
                      >
                        <Eye className="w-4 h-4" />
                        View Details
                      </button>

                      {/* Show Matches Toggle */}
                      <button
                        onClick={() => toggleBatch(batch.id)}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-white hover:bg-gray-50 text-[#1A1A24] border-2 border-[#E0E0E0] rounded-xl font-bold transition-all text-sm"
                      >
                        {isExpanded ? (
                          <>
                            <ChevronUp className="w-4 h-4" />
                            Hide {batch.totalMatches} {batch.totalMatches === 1 ? 'Match' : 'Matches'}
                          </>
                        ) : (
                          <>
                            <ChevronDown className="w-4 h-4" />
                            Show {batch.totalMatches} {batch.totalMatches === 1 ? 'Match' : 'Matches'}
                          </>
                        )}
                      </button>

                      {/* Conditional Action Buttons - More Compact */}
                      {batch.status === "Draft" && allClubsApproved(batch) && permissions.hasPermission('federation.submit') && (
                        <button
                          onClick={() => handleSubmitToKKF(batch.id)}
                          className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-xl font-bold transition-all text-sm"
                        >
                          <Send className="w-4 h-4" />
                          Submit to KKF
                        </button>
                      )}

                      {/* KKF Actions */}
                      {batch.status === "Pending KKF" && permissions.hasPermission('federation.approve') && (
                        <>
                          <button
                            onClick={() => handleApprove(batch.id)}
                            className="inline-flex items-center gap-1.5 px-3 py-2 bg-green-600 hover:bg-green-700 text-white rounded-xl font-bold transition-all text-sm"
                          >
                            <CheckCircle className="w-4 h-4" />
                            Approve
                          </button>
                          <button
                            onClick={() => handleReject(batch.id)}
                            className="inline-flex items-center gap-1.5 px-3 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold transition-all text-sm"
                          >
                            <X className="w-4 h-4" />
                            Reject
                          </button>
                        </>
                      )}

                      {/* More Options Menu */}
                      <div className="relative ml-auto">
                        <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                          <MoreVertical className="w-5 h-5 text-[#707070]" />
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Expanded Content - Match List */}
                  {isExpanded && (
                    <div className="border-t border-[#E0E0E0] bg-[#F9FAFB] p-6">
                      <h4 className="text-sm font-black text-[#707070] uppercase mb-4">Matches in this Batch</h4>
                      
                      <div className="space-y-3">
                        {batch.matches.map((match, idx) => (
                          <div
                            key={match.id}
                            className="bg-white border border-[#E0E0E0] rounded-xl p-4 hover:shadow-sm transition-shadow"
                          >
                            <div className="flex items-center justify-between gap-4">
                              {/* Match Number */}
                              <div className="w-10 h-10 bg-[#0A3D91] rounded-lg flex items-center justify-center flex-shrink-0">
                                <span className="text-lg font-black text-white">{idx + 1}</span>
                              </div>

                              {/* Fighters */}
                              <div className="flex-1 flex items-center gap-4">
                                <div className="flex-1 text-right">
                                  <div className="font-black text-[#1A1A24]">{match.fighterA.name}</div>
                                  <div className="text-xs text-[#707070] font-medium">{match.fighterA.record}</div>
                                </div>
                                
                                <div className="px-4 py-2 bg-[#C8102E] rounded-lg">
                                  <span className="text-white font-black text-sm">VS</span>
                                </div>
                                
                                <div className="flex-1">
                                  <div className="font-black text-[#1A1A24]">{match.fighterB.name}</div>
                                  <div className="text-xs text-[#707070] font-medium">{match.fighterB.record}</div>
                                </div>
                              </div>

                              {/* Match Info */}
                              <div className="flex items-center gap-4">
                                <div className="text-center">
                                  <div className="text-xs text-[#707070] font-medium">Weight</div>
                                  <div className="font-bold text-[#1A1A24]">{match.weightClass}</div>
                                </div>
                                
                                <div className="text-center">
                                  <div className="text-xs text-[#707070] font-medium">Rounds</div>
                                  <div className="font-bold text-[#1A1A24]">{match.rounds}</div>
                                </div>

                                {match.isChampionshipBout && (
                                  <div className="px-2 py-1 bg-yellow-100 rounded text-xs font-bold text-yellow-800">
                                    <Trophy className="w-3 h-3 inline mr-1" />
                                    Title
                                  </div>
                                )}
                              </div>

                              {/* View Link */}
                              <Link
                                to={`/match/${match.id}`}
                                className="p-2 hover:bg-[#0A3D91]/10 rounded-lg transition-colors"
                              >
                                <Eye className="w-5 h-5 text-[#0A3D91]" />
                              </Link>
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
      </div>
    </div>
  );
}