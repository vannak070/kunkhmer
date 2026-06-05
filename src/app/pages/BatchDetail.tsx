import { useState, useMemo } from "react";
import { useParams, useNavigate, Link } from "react-router";
import { 
  ArrowLeft, Eye, Plus, Search, ChevronDown, ChevronUp,
  CheckCircle, Clock, Calendar, MapPin, Users, Trophy,
  Send, AlertCircle, Edit2, TrendingUp, Shield, Radio, Award, Building2, X,
  UserCheck, Target, BarChart3, FileText, Trash2, Share2, Download, Scale, Dumbbell
} from "lucide-react";
import { 
  MOCK_BATCHES, 
  BATCH_STATUS_CONFIG, 
  calculateBatchReadiness,
  getBatchWarnings,
  formatDisplayDate
} from "../data/batches";
import type { BatchStatus } from "../data/batches";
import { usePermissions } from "../hooks/usePermissions";
import { toast } from "sonner";
import { clsx } from "clsx";
import html2canvas from "html2canvas";
import { ShareFightCard } from "../components/ShareFightCard";
import kkfLogo from "figma:asset/a66d0715b1669c88badc1b57f275bd3b2182d59e.png";

export function BatchDetail() {
  const { batchId } = useParams();
  const navigate = useNavigate();
  const permissions = usePermissions();
  
  const [expandedMatchId, setExpandedMatchId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showOfficialModal, setShowOfficialModal] = useState(false);
  const [selectedMatchForOfficials, setSelectedMatchForOfficials] = useState<string | null>(null);
  const [showShareModal, setShowShareModal] = useState(false);

  // Find the batch - check sessionStorage first for newly created batches
  let batch = MOCK_BATCHES.find(b => b.id === batchId);
  
  // If not found in MOCK_BATCHES, check sessionStorage
  if (!batch && batchId) {
    const storageKey = `batch-${batchId}`;
    const storedBatch = sessionStorage.getItem(storageKey);
    console.log("🔍 BatchDetail Debug:");
    console.log("  Batch ID from URL:", batchId);
    console.log("  Looking for storage key:", storageKey);
    console.log("  Found in sessionStorage:", storedBatch ? "YES" : "NO");
    if (storedBatch) {
      console.log("  Stored batch data:", JSON.parse(storedBatch));
      batch = JSON.parse(storedBatch);
    }
  }

  if (!batch) {
    return (
      <div className="min-h-screen bg-[#F4F5F8] flex items-center justify-center p-4">
        <div className="text-center">
          <h1 className="text-3xl font-black text-[#1A1A24] mb-4">Batch Not Found</h1>
          <button
            onClick={() => navigate("/home/matches")}
            className="px-6 py-3 bg-[#0A3D91] text-white rounded-xl font-bold"
          >
            Back to Matches
          </button>
        </div>
      </div>
    );
  }

  // Calculate batch statistics
  const batchStats = useMemo(() => {
    const totalMatches = batch.matches.length;
    const completedMatches = batch.matches.filter(m => m.status === "Completed").length;
    const pendingMatches = batch.matches.filter(m => m.status !== "Completed").length;
    const championshipMatches = batch.matches.filter(m => m.isChampionshipBout).length;
    const regularMatches = totalMatches - championshipMatches;
    const matchesWithOfficials = batch.matches.filter(m => m.officials).length;
    const matchesNeedingOfficials = totalMatches - matchesWithOfficials;

    return {
      totalMatches,
      completedMatches,
      pendingMatches,
      championshipMatches,
      regularMatches,
      matchesWithOfficials,
      matchesNeedingOfficials,
    };
  }, [batch.matches]);

  // Filter matches by search
  const filteredMatches = useMemo(() => {
    if (!searchQuery.trim()) return batch.matches;
    
    const query = searchQuery.toLowerCase();
    return batch.matches.filter(match => 
      match.fighterA.name.toLowerCase().includes(query) ||
      match.fighterB.name.toLowerCase().includes(query) ||
      match.weightClass.toLowerCase().includes(query)
    );
  }, [batch.matches, searchQuery]);

  const allClubsApproved = (): boolean => {
    return !batch.matches.some(match => match.status === "Waiting Club Approval");
  };

  const handleSubmitToKKF = () => {
    if (batch.matches.length === 0) {
      toast.error("❌ Cannot submit: Batch must have at least one match");
      return;
    }
    // Navigate to assign officials page before submitting
    navigate(`/matches/${batch.id}/assign-officials`);
  };

  const handleApprove = () => {
    toast.success(`✅ Batch ${batch.batchNumber} approved!`);
    setTimeout(() => navigate("/home/matches"), 1000);
  };

  const handleReject = () => {
    const reason = prompt("Rejection reason:");
    if (!reason) return;
    toast.error(`❌ Batch ${batch.batchNumber} rejected: ${reason}`);
    setTimeout(() => navigate("/home/matches"), 1000);
  };

  const handleDeleteBatch = () => {
    toast.success(`✅ Batch ${batch.batchNumber} deleted`);
    setTimeout(() => navigate("/home/matches"), 1000);
  };

  const handleAddMatch = () => {
    navigate(`/matches/${batchId}/create-match`);
  };

  const handleAssignOfficials = (matchId?: string) => {
    if (matchId) {
      setSelectedMatchForOfficials(matchId);
    }
    setShowOfficialModal(true);
  };

  const handleOfficialAssignment = () => {
    if (selectedMatchForOfficials) {
      toast.success("✅ Officials assigned to match");
    } else {
      toast.success("✅ Officials assigned to all matches in batch");
    }
    setShowOfficialModal(false);
    setSelectedMatchForOfficials(null);
  };

  const handleShare = () => {
    setShowShareModal(true);
  };

  const handleDownloadReport = () => {
    const element = document.getElementById('batch-report');
    if (element) {
      html2canvas(element).then(canvas => {
        const link = document.createElement('a');
        link.href = canvas.toDataURL('image/png');
        link.download = `Batch_${batch.batchNumber}_Report.png`;
        link.click();
      });
    }
    toast.success("📥 Batch report downloaded!");
  };

  const statusConfig = BATCH_STATUS_CONFIG[batch.status] || BATCH_STATUS_CONFIG["Draft"];
  const readiness = calculateBatchReadiness(batch);
  const warnings = getBatchWarnings(batch);
  const hasChampionship = batch.matches.some(m => m.isChampionshipBout);
  const isLocked = batch.status === "Approved" || batch.status === "Completed";

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F4F5F8] via-white to-[#F9FAFB]">
      <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-6">
        {/* Back Button */}
        <button
          onClick={() => navigate("/home/matches")}
          className="inline-flex items-center gap-2 text-[#707070] hover:text-[#1A1A24] font-bold transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          Back to Batches
        </button>

        {/* Batch Header Card */}
        <div className="bg-white rounded-3xl shadow-lg border border-[#E0E0E0] overflow-hidden">
          <div className="p-8">
            {/* Title Row */}
            <div className="flex items-start justify-between mb-6">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-3 flex-wrap">
                  <h1 className="text-5xl font-black text-[#0A3D91] uppercase tracking-tight">
                    {batch.batchNumber}
                  </h1>
                  <span 
                    className={`px-4 py-2 rounded-xl text-sm font-black uppercase ${statusConfig.bgColor} ${statusConfig.color} shadow-sm`}
                    title={`Status: ${statusConfig.label}`}
                  >
                    {statusConfig.icon} {statusConfig.label}
                  </span>
                  
                  {/* Readiness Indicator */}
                  <div className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border-2 border-blue-200 shadow-sm">
                    <TrendingUp className="w-5 h-5 text-blue-600" />
                    <span className="text-sm font-black text-blue-700">
                      {readiness}% Ready
                    </span>
                  </div>
                </div>
                
                {/* Event Name */}
                <Link 
                  to={`/home/events/${batch.eventId}`}
                  className="text-2xl font-black text-[#1A1A24] hover:text-[#0A3D91] transition-colors inline-block mb-2"
                >
                  {batch.eventName}
                </Link>
                
                <p className="text-[#707070] font-medium">
                  Created {formatDisplayDate(batch.createdDate)} • {batch.createdBy}
                </p>
              </div>

              {/* Top Actions */}
              <div className="flex items-center gap-3">
                {/* Removed Share and Download buttons */}
              </div>
            </div>

            {/* Info Grid - 4 Columns */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-6 pb-6 border-b border-[#E0E0E0]">
              <div>
                <div className="flex items-center gap-2 text-xs text-[#707070] uppercase mb-2 font-black">
                  <Calendar className="w-4 h-4" />
                  Event Date
                </div>
                <div className="font-black text-[#1A1A24] text-lg">
                  {formatDisplayDate(batch.date)}
                </div>
              </div>
              
              <div>
                <div className="flex items-center gap-2 text-xs text-[#707070] uppercase mb-2 font-black">
                  <MapPin className="w-4 h-4" />
                  Location
                </div>
                <div className="font-bold text-[#1A1A24] text-lg">{batch.location}</div>
              </div>
              
              <div>
                <div className="flex items-center gap-2 text-xs text-[#707070] uppercase mb-2 font-black">
                  <Users className="w-4 h-4" />
                  Total Matches
                </div>
                <div className="font-black text-[#1A1A24] text-lg">
                  {batch.totalMatches} {batch.totalMatches === 1 ? 'Match' : 'Matches'}
                </div>
              </div>
              
              <div>
                <div className="flex items-center gap-2 text-xs text-[#707070] uppercase mb-2 font-black">
                  <Building2 className="w-4 h-4" />
                  Organizer
                </div>
                <div className="font-bold text-[#1A1A24] text-lg">
                  {batch.organizerClub || batch.createdBy}
                </div>
              </div>
            </div>

            {/* Key Metadata Row */}
            <div className="flex items-center gap-3 flex-wrap mb-6">
              {batch.broadcastStation && (
                <div className="flex items-center gap-2 px-4 py-2 bg-purple-50 rounded-xl border-2 border-purple-200">
                  <Radio className="w-5 h-5 text-purple-600" />
                  <span className="text-sm font-bold text-purple-700">{batch.broadcastStation}</span>
                </div>
              )}
              
              {batch.mainSponsor && (
                <div className="flex items-center gap-2 px-4 py-2 bg-amber-50 rounded-xl border-2 border-amber-200">
                  <Award className="w-5 h-5 text-amber-600" />
                  <span className="text-sm font-bold text-amber-700">{batch.mainSponsor}</span>
                </div>
              )}
              
              {hasChampionship && (
                <div className="flex items-center gap-2 px-4 py-2 bg-yellow-50 rounded-xl border-2 border-yellow-300">
                  <Trophy className="w-5 h-5 text-yellow-600" />
                  <span className="text-sm font-black text-yellow-700">Championship Bout Included</span>
                </div>
              )}
            </div>

            {/* Warnings */}
            {warnings.length > 0 && (
              <div className="mb-6 p-5 bg-gradient-to-r from-amber-50 to-orange-50 border-2 border-amber-300 rounded-2xl">
                <div className="flex items-start gap-4">
                  <AlertCircle className="w-6 h-6 text-amber-600 flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <h4 className="text-base font-black text-amber-900 mb-3 uppercase">
                      ⚠️ Action Required
                    </h4>
                    <ul className="space-y-2">
                      {warnings.map((warning, idx) => (
                        <li key={idx} className="text-sm font-bold text-amber-800 flex items-start gap-2">
                          <span className="text-amber-500 text-lg">•</span>
                          <span>{warning}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            )}

            {/* Batch Status Workflow */}
            <div className="mb-6 bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-2xl p-6">
              <h4 className="text-sm font-black text-[#0A3D91] mb-4 uppercase tracking-wider">
                📋 Batch Lifecycle
              </h4>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                {/* Draft */}
                <div className={`p-3 rounded-xl border-2 transition-all ${
                  batch.status === "Draft" 
                    ? "bg-gray-200 border-gray-400 shadow-md" 
                    : "bg-white border-gray-200 opacity-50"
                }`}>
                  <div className="text-center">
                    <div className="text-2xl mb-1">✏️</div>
                    <div className="text-xs font-black text-gray-900 uppercase">Draft</div>
                  </div>
                </div>

                {/* Weight-In */}
                <div className={`p-3 rounded-xl border-2 transition-all ${
                  batch.status === "Weight-In" 
                    ? "bg-orange-200 border-orange-400 shadow-md" 
                    : "bg-white border-gray-200 opacity-50"
                }`}>
                  <div className="text-center">
                    <div className="text-2xl mb-1">⚖️</div>
                    <div className="text-xs font-black text-orange-900 uppercase">Weight-In</div>
                  </div>
                </div>

                {/* Ready */}
                <div className={`p-3 rounded-xl border-2 transition-all ${
                  batch.status === "Ready" 
                    ? "bg-blue-200 border-blue-400 shadow-md" 
                    : "bg-white border-gray-200 opacity-50"
                }`}>
                  <div className="text-center">
                    <div className="text-2xl mb-1">💪</div>
                    <div className="text-xs font-black text-blue-900 uppercase">Ready</div>
                  </div>
                </div>

                {/* Live */}
                <div className={`p-3 rounded-xl border-2 transition-all ${
                  batch.status === "Live" 
                    ? "bg-purple-200 border-purple-400 shadow-md" 
                    : "bg-white border-gray-200 opacity-50"
                }`}>
                  <div className="text-center">
                    <div className="text-2xl mb-1">📅</div>
                    <div className="text-xs font-black text-purple-900 uppercase">Live</div>
                  </div>
                </div>

                {/* Complete */}
                <div className={`p-3 rounded-xl border-2 transition-all ${
                  batch.status === "Complete" 
                    ? "bg-gray-200 border-gray-400 shadow-md" 
                    : "bg-white border-gray-200 opacity-50"
                }`}>
                  <div className="text-center">
                    <div className="text-2xl mb-1">🏆</div>
                    <div className="text-xs font-black text-gray-900 uppercase">Complete</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Action Buttons */}
            <div className="flex items-center gap-3 flex-wrap">
              {/* Add Match */}
              {batch.status === "Draft" && permissions.hasPermission('matches.create') && (
                <button
                  onClick={handleAddMatch}
                  className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#C8102E] to-[#A00D24] hover:opacity-90 text-white rounded-xl font-bold transition-all shadow-lg hover:shadow-xl text-sm"
                >
                  <Plus className="w-5 h-5" />
                  Add Match
                </button>
              )}

              {/* Edit Batch */}
              {batch.status === "Draft" && permissions.hasPermission('matches.edit') && (
                <button
                  onClick={() => navigate(`/matches/${batch.id}/edit`)}
                  className="inline-flex items-center gap-2 px-5 py-3 bg-gray-100 hover:bg-gray-200 text-[#1A1A24] rounded-xl font-bold transition-all text-sm"
                >
                  <Edit2 className="w-5 h-5" />
                  Edit Batch
                </button>
              )}

              {/* Assign Officials to All */}
              {!isLocked && permissions.hasPermission('officials.assign') && (
                <button
                  onClick={() => handleAssignOfficials()}
                  className="inline-flex items-center gap-2 px-5 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold transition-all shadow-md hover:shadow-lg text-sm"
                >
                  <UserCheck className="w-5 h-5" />
                  Assign Officials to All
                </button>
              )}

              {/* Submit to KKF */}
              {batch.status === "Draft" && allClubsApproved() && permissions.hasPermission('federation.submit') && (
                <button
                  onClick={handleSubmitToKKF}
                  className="inline-flex items-center gap-2 px-5 py-3 bg-green-600 hover:bg-green-700 text-white rounded-xl font-bold transition-all shadow-md hover:shadow-lg text-sm"
                >
                  <Send className="w-5 h-5" />
                  Submit to KKF
                </button>
              )}

              {/* KKF Actions */}
              {batch.status === "Pending KKF" && permissions.hasPermission('federation.approve') && (
                <>
                  <button
                    onClick={handleApprove}
                    className="inline-flex items-center gap-2 px-5 py-3 bg-green-600 hover:bg-green-700 text-white rounded-xl font-bold transition-all shadow-md hover:shadow-lg text-sm"
                  >
                    <CheckCircle className="w-5 h-5" />
                    Approve Batch
                  </button>
                  <button
                    onClick={handleReject}
                    className="inline-flex items-center gap-2 px-5 py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold transition-all shadow-md hover:shadow-lg text-sm"
                  >
                    <X className="w-5 h-5" />
                    Reject
                  </button>
                </>
              )}

              {/* Delete Batch */}
              {batch.status === "Draft" && permissions.hasPermission('matches.delete') && (
                <button
                  onClick={() => setShowDeleteConfirm(true)}
                  className="inline-flex items-center gap-2 px-5 py-3 bg-red-100 hover:bg-red-200 text-red-700 rounded-xl font-bold transition-all text-sm ml-auto"
                >
                  <Trash2 className="w-5 h-5" />
                  Delete Batch
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Matches List */}
        <div className="bg-white rounded-3xl shadow-lg border border-[#E0E0E0] p-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-3xl font-black text-[#1A1A24] uppercase">
              Matches ({filteredMatches.length})
            </h2>
            
            {/* Search */}
            <div className="relative w-80">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#707070]" />
              <input
                type="text"
                placeholder="Search fighters or weight..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-[#F4F5F8] border-2 border-[#E0E0E0] focus:border-[#0A3D91] rounded-xl text-[#1A1A24] font-bold focus:outline-none"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#707070] hover:text-[#1A1A24]"
                >
                  <X className="w-5 h-5" />
                </button>
              )}
            </div>
          </div>
          
          {filteredMatches.length === 0 ? (
            <div className="text-center py-16">
              <Users className="w-20 h-20 text-[#B0B0B0] mx-auto mb-4" />
              <h3 className="text-2xl font-bold text-[#707070] mb-2">
                {searchQuery ? "No Matches Found" : "No Matches Yet"}
              </h3>
              <p className="text-[#B0B0B0] font-medium mb-8">
                {searchQuery 
                  ? "Try adjusting your search query"
                  : "Add matches to this batch to get started"
                }
              </p>
              {!searchQuery && batch.status === "Draft" && permissions.hasPermission('matches.create') && (
                <button
                  onClick={handleAddMatch}
                  className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-[#C8102E] to-[#A00D24] text-white rounded-xl font-bold transition-all shadow-lg hover:shadow-xl text-base"
                >
                  <Plus className="w-6 h-6" />
                  Add First Match
                </button>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              {filteredMatches.map((match, idx) => {
                const isExpanded = expandedMatchId === match.id;
                
                return (
                  <div
                    key={match.id}
                    className={clsx(
                      "bg-white border-2 rounded-2xl overflow-hidden transition-all",
                      match.isChampionshipBout 
                        ? "border-yellow-300 bg-yellow-50/30 hover:shadow-lg" 
                        : "border-[#E0E0E0] hover:shadow-md"
                    )}
                  >
                    <div className="p-5">
                      <div className="flex items-center justify-between gap-4">
                        {/* Match Number */}
                        <div className={clsx(
                          "w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 shadow-md",
                          match.isChampionshipBout ? "bg-yellow-500" : "bg-[#0A3D91]"
                        )}>
                          <span className="text-xl font-black text-white">{batch.matches.indexOf(match) + 1}</span>
                        </div>

                        {/* Fighters */}
                        <div className="flex-1 flex items-center gap-4">
                          <div className="flex-1 text-right">
                            <div className="font-black text-[#1A1A24] text-lg">{match.fighterA.name}</div>
                            <div className="text-sm text-[#707070] font-medium">{match.fighterA.record}</div>
                          </div>
                          
                          <div className="px-5 py-2.5 bg-[#C8102E] rounded-xl shadow-md">
                            <span className="text-white font-black text-base">VS</span>
                          </div>
                          
                          <div className="flex-1">
                            <div className="font-black text-[#1A1A24] text-lg">{match.fighterB.name}</div>
                            <div className="text-sm text-[#707070] font-medium">{match.fighterB.record}</div>
                          </div>
                        </div>

                        {/* Match Info */}
                        <div className="flex items-center gap-4">
                          <div className="text-center">
                            <div className="text-xs text-[#707070] font-bold uppercase mb-1">Weight</div>
                            <div className="font-black text-[#1A1A24] text-base">{match.weightClass}</div>
                          </div>
                          
                          <div className="text-center">
                            <div className="text-xs text-[#707070] font-bold uppercase mb-1">Rounds</div>
                            <div className="font-black text-[#1A1A24] text-base">{match.rounds}</div>
                          </div>

                          {/* Championship Badge */}
                          {match.isChampionshipBout && (
                            <div className="px-3 py-2 bg-yellow-100 rounded-xl border-2 border-yellow-300 shadow-sm">
                              <Trophy className="w-4 h-4 inline mr-1 text-yellow-700" />
                              <span className="text-xs font-black text-yellow-800">TITLE</span>
                            </div>
                          )}
                          
                          {/* Officials Status */}
                          {match.officials ? (
                            <div className="px-3 py-2 bg-green-100 rounded-xl border-2 border-green-300 shadow-sm">
                              <UserCheck className="w-4 h-4 inline mr-1 text-green-700" />
                              <span className="text-xs font-black text-green-800">ASSIGNED</span>
                            </div>
                          ) : (
                            <button
                              onClick={() => handleAssignOfficials(match.id)}
                              className="px-3 py-2 bg-red-100 hover:bg-red-200 rounded-xl border-2 border-red-300 shadow-sm transition-all"
                              disabled={isLocked}
                            >
                              <AlertCircle className="w-4 h-4 inline mr-1 text-red-700" />
                              <span className="text-xs font-black text-red-800">ASSIGN</span>
                            </button>
                          )}
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-2">
                          <Link
                            to={`/match/${match.id}`}
                            className="p-3 hover:bg-[#0A3D91]/10 rounded-xl transition-colors"
                            title="View Match Details"
                          >
                            <Eye className="w-5 h-5 text-[#0A3D91]" />
                          </Link>
                          
                          <button
                            onClick={() => setExpandedMatchId(isExpanded ? null : match.id)}
                            className="p-3 hover:bg-gray-100 rounded-xl transition-colors"
                            title={isExpanded ? "Collapse" : "Expand"}
                          >
                            {isExpanded ? (
                              <ChevronUp className="w-5 h-5 text-[#707070]" />
                            ) : (
                              <ChevronDown className="w-5 h-5 text-[#707070]" />
                            )}
                          </button>
                        </div>
                      </div>

                      {/* Expanded Details */}
                      {isExpanded && (
                        <div className="mt-5 pt-5 border-t border-[#E0E0E0]">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                              <h4 className="text-sm font-black text-[#707070] uppercase mb-3">Fighter A Details</h4>
                              <div className="space-y-2">
                                <div className="flex justify-between">
                                  <span className="text-sm text-[#707070] font-medium">Club:</span>
                                  <span className="text-sm text-[#1A1A24] font-bold">{match.fighterA.gym}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-sm text-[#707070] font-medium">Record:</span>
                                  <span className="text-sm text-[#1A1A24] font-bold">{match.fighterA.record}</span>
                                </div>
                              </div>
                            </div>
                            
                            <div>
                              <h4 className="text-sm font-black text-[#707070] uppercase mb-3">Fighter B Details</h4>
                              <div className="space-y-2">
                                <div className="flex justify-between">
                                  <span className="text-sm text-[#707070] font-medium">Club:</span>
                                  <span className="text-sm text-[#1A1A24] font-bold">{match.fighterB.gym}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-sm text-[#707070] font-medium">Record:</span>
                                  <span className="text-sm text-[#1A1A24] font-bold">{match.fighterB.record}</span>
                                </div>
                              </div>
                            </div>
                          </div>
                          
                          {match.officials && (
                            <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-xl">
                              <h4 className="text-sm font-black text-green-900 uppercase mb-2">Officials Assigned</h4>
                              <p className="text-sm text-green-700 font-medium">
                                Referee, 3 Judges assigned • View full details in match page
                              </p>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Status Messages */}
        {batch.status === "Approved" && batch.approvalNotes && (
          <div className="bg-white rounded-2xl p-6 shadow-md border-2 border-green-300">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-green-500 rounded-xl flex items-center justify-center flex-shrink-0">
                <CheckCircle className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-black text-green-900 mb-2">✅ KKF Approved</h3>
                <p className="text-sm text-green-700 mb-3 font-medium">{batch.approvalNotes}</p>
                {batch.reviewedBy && batch.reviewedDate && (
                  <p className="text-xs text-green-600 font-bold">
                    Reviewed by {batch.reviewedBy} on {formatDisplayDate(batch.reviewedDate)}
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        {batch.status === "Rejected" && batch.rejectionReason && (
          <div className="bg-white rounded-2xl p-6 shadow-md border-2 border-red-300">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-red-500 rounded-xl flex items-center justify-center flex-shrink-0">
                <AlertCircle className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-black text-red-900 mb-2">❌ Batch Rejected</h3>
                <p className="text-sm text-red-700 mb-3 font-medium">{batch.rejectionReason}</p>
                {batch.reviewedBy && batch.reviewedDate && (
                  <p className="text-xs text-red-600 font-bold">
                    Reviewed by {batch.reviewedBy} on {formatDisplayDate(batch.reviewedDate)}
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        {batch.status === "Pending KKF" && (
          <div className="bg-white rounded-2xl shadow-md border-2 border-[#0A3D91]">
            <div className="p-8">
              <div className="flex items-start justify-between gap-8">
                {/* Left: Batch Information */}
                <div className="flex-1 space-y-4">
                  <div>
                    <span className="text-sm font-bold text-[#707070] uppercase tracking-wider">លេខកូដកម្មវិធី / Batch Number:</span>
                    <div className="mt-1 text-2xl font-black text-[#0A3D91]">{batch.batchNumber}</div>
                  </div>
                  
                  {batch.submittedDate && (
                    <div>
                      <span className="text-sm font-bold text-[#707070] uppercase tracking-wider">កាលបរិច្ឆេទថ្ងៃណាត់ / Submitted:</span>
                      <div className="mt-1 text-lg font-bold text-[#707070]">{formatDisplayDate(batch.submittedDate)}</div>
                    </div>
                  )}
                  
                  {batch.submittedBy && (
                    <div>
                      <span className="text-sm font-bold text-[#707070] uppercase tracking-wider">ដាក់ស្នើដោយ / Submitted By:</span>
                      <div className="mt-1 text-lg font-bold text-[#707070]">{batch.submittedBy}</div>
                    </div>
                  )}
                  
                  <div className="mt-6 p-4 bg-amber-50 border-2 border-amber-300 rounded-xl">
                    <div className="flex items-start gap-3">
                      <Clock className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                      <p className="text-sm text-amber-800 font-bold">
                        This batch has been submitted to KKF and is awaiting approval from the federation.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Right: KKF Approval Stamp */}
                <div className="flex flex-col items-center gap-3">
                  <div className="w-40 h-40 rounded-full border-4 border-[#0A3D91] flex items-center justify-center bg-white shadow-xl p-2">
                    <img 
                      src={kkfLogo} 
                      alt="KUN KHMER FEDERATION" 
                      className="w-full h-full object-contain"
                    />
                  </div>
                  <div className="text-center">
                    <div className="px-4 py-2 bg-amber-100 border-2 border-amber-400 rounded-lg">
                      <span className="text-sm font-black text-amber-800 uppercase">Pending Approval</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl">
            <h3 className="text-2xl font-black text-red-700 mb-4">Delete Batch?</h3>
            <p className="text-[#707070] font-medium mb-6">
              Are you sure you want to delete <strong>{batch.batchNumber}</strong>? This action cannot be undone.
            </p>
            <div className="flex items-center gap-3">
              <button
                onClick={handleDeleteBatch}
                className="flex-1 py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold transition-all"
              >
                Delete
              </button>
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="flex-1 py-3 bg-gray-200 hover:bg-gray-300 text-[#1A1A24] rounded-xl font-bold transition-all"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Assign Officials Modal */}
      {showOfficialModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-8 max-w-2xl w-full shadow-2xl">
            <h3 className="text-3xl font-black text-indigo-700 mb-6 uppercase">Assign Officials</h3>
            
            <div className="space-y-4 mb-6">
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl">
                <p className="text-sm font-bold text-blue-800">
                  {selectedMatchForOfficials 
                    ? `Assigning officials to specific match`
                    : `Assigning officials to all ${batch.matches.length} matches in this batch`
                  }
                </p>
              </div>
              
              <div>
                <label className="block text-sm font-bold text-[#707070] mb-2 uppercase">Main Referee</label>
                <select className="w-full bg-[#F4F5F8] border-2 border-[#E0E0E0] focus:border-[#0A3D91] rounded-xl px-4 py-3 text-[#1A1A24] font-bold focus:outline-none">
                  <option value="">Select referee...</option>
                  <option value="ref1">Sok Piseth</option>
                  <option value="ref2">Chea Vibol</option>
                  <option value="ref3">Mao Dara</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-bold text-[#707070] mb-2 uppercase">Judges (3 required)</label>
                <select multiple className="w-full bg-[#F4F5F8] border-2 border-[#E0E0E0] focus:border-[#0A3D91] rounded-xl px-4 py-3 text-[#1A1A24] font-bold focus:outline-none h-32">
                  <option value="judge1">Mao Sokha</option>
                  <option value="judge2">Lim Dara</option>
                  <option value="judge3">Pov Kosal</option>
                  <option value="judge4">Heng Sreypov</option>
                  <option value="judge5">Chea Makara</option>
                </select>
                <p className="text-xs text-[#707070] mt-2 font-medium">Hold Ctrl/Cmd to select multiple judges</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <button
                onClick={handleOfficialAssignment}
                className="flex-1 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold transition-all shadow-lg"
              >
                Assign Officials
              </button>
              <button
                onClick={() => {
                  setShowOfficialModal(false);
                  setSelectedMatchForOfficials(null);
                }}
                className="flex-1 py-3 bg-gray-200 hover:bg-gray-300 text-[#1A1A24] rounded-xl font-bold transition-all"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Share Modal */}
      {showShareModal && (
        <ShareFightCard 
          batch={batch} 
          onClose={() => setShowShareModal(false)} 
        />
      )}
    </div>
  );
}