import { useState, useMemo } from "react";
import { useParams, useNavigate, Link } from "react-router";
import { 
  ArrowLeft, Eye, Plus, Search, ChevronDown, ChevronUp,
  CheckCircle, Clock, Calendar, MapPin, Users, Trophy, Check,
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
import html2canvas from "html2canvas-pro";
import { ShareFightCard } from "../components/ShareFightCard";
import kkfLogo from "../../assets/modern_logo.png";
import { getJudges, getReferees } from "../utils/officialsStore";

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
  const [selectedReferee, setSelectedReferee] = useState<string>("");
  const [selectedJudges, setSelectedJudges] = useState<string[]>([]);

  // Find the batch - check sessionStorage first for newly created batches
  let batch = MOCK_BATCHES.find(b => b.id === batchId) || MOCK_BATCHES.find(b => b.batchNumber === batchId);
  
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

  // Fallback to MOCK_BATCHES[0] if still not found (e.g. mock route "batch-detail")
  if (!batch && (batchId === "batch-detail" || !batchId)) {
    batch = MOCK_BATCHES[0];
  }

  if (!batch) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="text-center">
          <h1 className="text-2xl font-extrabold text-slate-900 mb-4 tracking-tight">Batch Not Found</h1>
          <button
            onClick={() => navigate("/home/matches")}
            className="btn-primary px-5 py-2.5 font-semibold uppercase tracking-wider text-xs rounded-xl shadow-md"
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

  const handleMoveToWeightIn = () => {
    if (batch.matches.length === 0) {
      toast.error("❌ Cannot proceed: Batch must have at least one match");
      return;
    }
    toast.success(`✅ Batch ${batch.batchNumber} moved to Weight-In phase!`);
    setTimeout(() => navigate("/home/matches"), 1000);
  };

  const handleDeleteBatch = () => {
    toast.success(`✅ Batch ${batch.batchNumber} deleted`);
    setTimeout(() => navigate("/home/matches"), 1000);
  };

  const handleAddMatch = () => {
    navigate(`/matches/${batch.id}/create-match`);
  };

  const handleAssignOfficials = (matchId?: string) => {
    if (matchId) {
      setSelectedMatchForOfficials(matchId);
    }
    setShowOfficialModal(true);
  };

  const handleToggleJudge = (judgeId: string) => {
    if (selectedJudges.includes(judgeId)) {
      setSelectedJudges(selectedJudges.filter(id => id !== judgeId));
    } else {
      if (selectedJudges.length < 3) {
        setSelectedJudges([...selectedJudges, judgeId]);
      } else {
        toast.error("❌ Maximum 3 judges can be assigned");
      }
    }
  };

  const handleOfficialAssignment = () => {
    if (!selectedReferee) {
      toast.error("❌ Please select a referee");
      return;
    }
    if (selectedJudges.length !== 3) {
      toast.error("❌ Exactly 3 judges are required");
      return;
    }

    if (selectedMatchForOfficials) {
      toast.success("✅ Officials assigned to match");
    } else {
      toast.success("✅ Officials assigned to all matches in batch");
    }
    setShowOfficialModal(false);
    setSelectedMatchForOfficials(null);
    setSelectedReferee("");
    setSelectedJudges([]);
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
  const isLocked = ["Completed", "Complete", "Live"].includes(batch.status);

  const steps = [
    { id: "draft", label: "Draft", icon: "✏️", desc: "Batch created" },
    { id: "draft-ready", label: "Draft Ready", icon: "📋", desc: "Matches finalized" },
    { id: "weight-in", label: "Weight-In", icon: "⚖️", desc: "Fighter check" },
    { id: "live", label: "Ready & Live", icon: "🔥", desc: "Fight day" },
    { id: "complete", label: "Completed", icon: "🏆", desc: "Results declared" }
  ];

  const getStepState = (stepId: string) => {
    const status = batch.status;
    const hasMatches = batch.matches.length > 0;

    if (status === "Complete" || status === "Completed") {
      return "completed";
    }

    switch (stepId) {
      case "draft":
        if (status !== "Draft") return "completed";
        return hasMatches ? "completed" : "active";
      case "draft-ready":
        if (status === "Draft") {
          return hasMatches ? "active" : "upcoming";
        }
        if (["Pending KKF", "Approved", "Rejected", "Scheduled"].includes(status)) {
          return "active";
        }
        return "completed";
      case "weight-in":
        if (["Draft", "Pending KKF", "Approved", "Rejected", "Scheduled"].includes(status)) {
          return "upcoming";
        }
        return status === "Weight-In" ? "active" : "completed";
      case "live":
        if (["Draft", "Pending KKF", "Approved", "Rejected", "Scheduled", "Weight-In"].includes(status)) {
          return "upcoming";
        }
        return ["Ready", "Live"].includes(status) ? "active" : "completed";
      case "complete":
        return (status === "Complete" || status === "Completed") ? "active" : "upcoming";
      default:
        return "upcoming";
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-6 animate-fadeIn">
        {/* Back Button */}
        <button
          onClick={() => navigate("/home/matches")}
          className="inline-flex items-center gap-2 text-slate-500 hover:text-slate-900 font-semibold uppercase tracking-wider text-xs transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Batches
        </button>

        {/* Batch Header Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200/80 overflow-hidden">
          <div className="p-6 md:p-8">
            {/* Title Row */}
            <div className="flex items-start justify-between mb-6">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-3 flex-wrap">
                  <h1 className="text-3xl md:text-4xl font-extrabold text-primary uppercase tracking-tighter">
                    {batch.batchNumber}
                  </h1>
                  
                  {/* Status Badge mapping to theme classes */}
                  <span 
                    className={clsx(
                      "badge-premium uppercase tracking-wider text-[10px] font-semibold py-1.5 px-3 shadow-sm",
                      batch.status === "Approved" && "badge-emerald",
                      batch.status === "Pending KKF" && "badge-amber",
                      batch.status === "Rejected" && "badge-red",
                      batch.status === "Draft" && "bg-slate-100 text-slate-700 border-slate-200",
                      batch.status === "Weight-In" && "badge-amber bg-orange-50 text-orange-700 border-orange-200",
                      batch.status === "Ready" && "badge-blue",
                      batch.status === "Live" && "bg-purple-50 text-purple-750 border-purple-200/50",
                      batch.status === "Complete" && "bg-slate-100 text-slate-700 border-slate-200"
                    )}
                    title={`Status: ${statusConfig.label}`}
                  >
                    {statusConfig.icon} {statusConfig.label}
                  </span>
                  
                  {/* Readiness Indicator */}
                  <div className="flex items-center gap-2 px-3 py-1.5 bg-blue-50/50 rounded-xl border border-blue-200/40 shadow-sm">
                    <TrendingUp className="w-3.5 h-3.5 text-primary" />
                    <span className="text-xs font-semibold uppercase tracking-wide text-primary">
                      {readiness}% Ready
                    </span>
                  </div>
                </div>
                
                {/* Event Name */}
                <Link 
                  to={`/home/events/${batch.eventId}`}
                  className="text-lg md:text-xl font-extrabold text-slate-800 hover:text-primary transition-colors inline-block mb-1.5"
                >
                  {batch.eventName}
                </Link>
                
                <p className="text-slate-500 font-normal text-xs md:text-sm">
                  Created {formatDisplayDate(batch.createdDate)} • {batch.createdBy}
                </p>
              </div>
            </div>

            {/* Info Grid - 4 Columns */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-6 pb-6 border-b border-slate-100">
              <div>
                <div className="flex items-center gap-2 text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">
                  <Calendar className="w-3.5 h-3.5 text-slate-400" />
                  Event Date
                </div>
                <div className="font-semibold text-slate-800 text-sm md:text-base">
                  {formatDisplayDate(batch.date)}
                </div>
              </div>
              
              <div>
                <div className="flex items-center gap-2 text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">
                  <MapPin className="w-3.5 h-3.5 text-slate-400" />
                  Location
                </div>
                <div className="font-semibold text-slate-800 text-sm md:text-base">{batch.location}</div>
              </div>
              
              <div>
                <div className="flex items-center gap-2 text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">
                  <Users className="w-3.5 h-3.5 text-slate-400" />
                  Total Matches
                </div>
                <div className="font-semibold text-slate-800 text-sm md:text-base">
                  {batch.totalMatches} {batch.totalMatches === 1 ? 'Match' : 'Matches'}
                </div>
              </div>
              
              <div>
                <div className="flex items-center gap-2 text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">
                  <Building2 className="w-3.5 h-3.5 text-slate-400" />
                  Organizer
                </div>
                <div className="font-semibold text-slate-800 text-sm md:text-base">
                  {batch.organizerClub || batch.createdBy}
                </div>
              </div>
            </div>

            {/* Key Metadata Row */}
            <div className="flex items-center gap-2 flex-wrap mb-6">
              {batch.broadcastStation && (
                <span className="badge-premium bg-purple-50/50 text-purple-700 border-purple-200/40 uppercase tracking-wider text-[9px] font-semibold py-1 px-2.5">
                  <Radio className="w-3.5 h-3.5 text-purple-500" />
                  {batch.broadcastStation}
                </span>
              )}
              
              {batch.mainSponsor && (
                <span className="badge-premium badge-amber uppercase tracking-wider text-[9px] font-semibold py-1 px-2.5">
                  <Award className="w-3.5 h-3.5 text-amber-500" />
                  {batch.mainSponsor}
                </span>
              )}
              
              {hasChampionship && (
                <span className="badge-premium badge-amber bg-yellow-50/50 text-yellow-750 border-yellow-200/40 uppercase tracking-wider text-[9px] font-semibold py-1 px-2.5">
                  <Trophy className="w-3.5 h-3.5 text-yellow-500" />
                  Championship
                </span>
              )}
            </div>

            {/* Warnings */}
            {warnings.length > 0 && (
              <div className="mb-6 p-5 bg-amber-50/50 border border-amber-200/60 rounded-2xl">
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-4 h-4 text-amber-650 flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <h4 className="text-[10px] font-bold uppercase tracking-widest text-amber-800 mb-2">
                      Action Required
                    </h4>
                    <ul className="space-y-1.5">
                      {warnings.map((warning, idx) => (
                        <li key={idx} className="text-xs font-semibold text-amber-750 flex items-start gap-2">
                          <span className="text-amber-550 text-sm leading-none">•</span>
                          <span>{warning}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            )}

            {/* Batch Status Workflow - Styled Stepper */}
            <div className="mb-6 bg-slate-50 border border-slate-200/80 rounded-2xl p-6">
              <h4 className="text-[10px] font-bold text-slate-400 mb-6 uppercase tracking-widest">
                Batch Lifecycle
              </h4>
              <div className="relative">
                {/* Horizontal line for desktop stepper */}
                <div className="absolute top-[20px] left-8 right-8 h-0.5 bg-slate-200 hidden md:block z-0" />
                
                <div className="relative z-10 grid grid-cols-1 md:grid-cols-5 gap-6 md:gap-4">
                  {steps.map((step, idx) => {
                    const state = getStepState(step.id);
                    
                    let nodeStyle = "";
                    let labelStyle = "text-slate-800";
                    let descStyle = "text-slate-400";
                    let iconContent = step.icon;
                    
                    if (state === "completed") {
                      nodeStyle = "bg-emerald-600 border-2 border-emerald-600 text-white shadow-sm shadow-emerald-100";
                      iconContent = "✓";
                      labelStyle = "text-slate-900 font-semibold";
                    } else if (state === "active") {
                      nodeStyle = "bg-primary border-2 border-primary text-white shadow-md shadow-primary/20 ring-4 ring-primary/10";
                      labelStyle = "text-primary font-bold";
                    } else if (state === "active-pending") {
                      nodeStyle = "bg-amber-500 border-2 border-amber-500 text-white shadow-md shadow-amber-500/20 ring-4 ring-amber-500/10 animate-pulse";
                      labelStyle = "text-amber-600 font-bold";
                      descStyle = "text-amber-500 font-medium";
                      iconContent = "⏳";
                    } else if (state === "active-rejected") {
                      nodeStyle = "bg-red-500 border-2 border-red-500 text-white shadow-md shadow-red-500/20 ring-4 ring-red-500/10";
                      labelStyle = "text-red-600 font-bold";
                      descStyle = "text-red-500 font-medium";
                      iconContent = "❌";
                    } else if (state === "upcoming-ready") {
                      nodeStyle = "bg-white border-2 border-primary/45 text-primary shadow-sm";
                      labelStyle = "text-slate-700 font-medium";
                    } else {
                      nodeStyle = "bg-white border-2 border-slate-200 text-slate-400";
                      labelStyle = "text-slate-400 font-medium";
                    }
                    
                    return (
                      <div key={step.id} className="flex flex-row md:flex-col items-center gap-4 md:gap-1 text-left md:text-center">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center text-base transition-all duration-300 z-10 shrink-0 ${nodeStyle}`}>
                          {iconContent}
                        </div>
                        <div className="flex flex-col">
                          <span className={`text-xs uppercase tracking-wider ${labelStyle}`}>{step.label}</span>
                          <span className={`text-[10px] ${descStyle}`}>{step.desc}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Quick Action Buttons */}
            <div className="flex items-center gap-3 flex-wrap">
              {/* Add Match */}
              {batch.status === "Draft" && permissions.hasPermission('matches.create') && (
                <button
                  onClick={handleAddMatch}
                  className="btn-secondary px-5 py-2.5 font-semibold uppercase tracking-wider text-xs rounded-xl shadow-md hover:-translate-y-[1px]"
                >
                  <Plus className="w-4 h-4" />
                  Add Match
                </button>
              )}

              {/* Edit Batch */}
              {batch.status === "Draft" && permissions.hasPermission('matches.edit') && (
                <button
                  onClick={() => navigate(`/matches/${batch.id}/edit`)}
                  className="btn-outline px-5 py-2.5 font-semibold uppercase tracking-wider text-xs rounded-xl shadow-sm hover:-translate-y-[1px]"
                >
                  <Edit2 className="w-4 h-4" />
                  Edit Batch
                </button>
              )}

              {/* Assign Officials to All */}
              {!isLocked && permissions.hasPermission('officials.assign') && (
                <button
                  onClick={() => handleAssignOfficials()}
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-semibold uppercase tracking-wider text-xs transition-all shadow hover:-translate-y-[1px] active:scale-[0.98]"
                >
                  <UserCheck className="w-4 h-4" />
                  Officials to All
                </button>
              )}

              {/* Move to Weight-In */}
              {batch.status === "Draft" && permissions.hasPermission('matches.edit') && (
                <button
                  onClick={handleMoveToWeightIn}
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-semibold uppercase tracking-wider text-xs transition-all shadow hover:-translate-y-[1px] active:scale-[0.98]"
                >
                  <Send className="w-4 h-4" />
                  Move to Weight-In
                </button>
              )}

              {/* Share Fight Card */}
              {(() => {
                const isDraftReady = batch.status === "Draft" && batch.matches.length > 0;
                const isActiveStage = ["Weight-In", "Ready", "Live"].includes(batch.status);
                const isCompleted = ["Complete", "Completed"].includes(batch.status);
                const allResultsUpdated = isCompleted && batch.matches.length > 0 && batch.matches.every(m => m.winner);
                
                // Show share button for Draft Ready, Weight-In, Ready, Live
                if (isDraftReady || isActiveStage) {
                  return (
                    <button
                      onClick={handleShare}
                      className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold uppercase tracking-wider text-xs transition-all shadow hover:-translate-y-[1px] active:scale-[0.98]"
                    >
                      <Share2 className="w-4 h-4" />
                      Share Fight Card
                    </button>
                  );
                }
                
                // For Completed: show share only if results are updated
                if (isCompleted && allResultsUpdated) {
                  return (
                    <button
                      onClick={handleShare}
                      className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold uppercase tracking-wider text-xs transition-all shadow hover:-translate-y-[1px] active:scale-[0.98]"
                    >
                      <Share2 className="w-4 h-4" />
                      Share with Results
                    </button>
                  );
                }
                
                // Completed but no results yet
                if (isCompleted && !allResultsUpdated) {
                  return (
                    <button
                      disabled
                      title="Update match results first to enable sharing"
                      className="inline-flex items-center gap-2 px-5 py-2.5 bg-slate-100 text-slate-400 rounded-xl font-semibold uppercase tracking-wider text-xs cursor-not-allowed border border-slate-200"
                    >
                      <Share2 className="w-4 h-4" />
                      Share (Results Needed)
                    </button>
                  );
                }
                
                return null;
              })()}

              {/* Delete Batch */}
              {batch.status === "Draft" && permissions.hasPermission('matches.delete') && (
                <button
                  onClick={() => setShowDeleteConfirm(true)}
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-red-50 hover:bg-red-100 text-red-700 rounded-xl font-semibold uppercase tracking-wider text-xs transition-all border border-red-200/60 shadow-sm hover:-translate-y-[1px] active:scale-[0.98] ml-auto"
                >
                  <Trash2 className="w-4 h-4" />
                  Delete Batch
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Matches List */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200/80 p-6 md:p-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
            <h2 className="text-lg md:text-xl font-extrabold text-slate-900 tracking-tight uppercase">
              Matches ({filteredMatches.length})
            </h2>
            
            {/* Search */}
            <div className="relative w-full md:w-80 group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-primary transition-colors" />
              <input
                type="text"
                placeholder="Search fighters or weight..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="input-premium rounded-xl !pl-11 !pr-10 py-2.5 text-sm font-medium text-slate-700"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
          
          {filteredMatches.length === 0 ? (
            <div className="text-center py-16 animate-fadeIn">
              <Users className="w-16 h-16 text-slate-300 mx-auto mb-4" />
              <h3 className="text-lg font-bold text-slate-700 mb-2">
                {searchQuery ? "No Matches Found" : "No Matches Yet"}
              </h3>
              <p className="text-slate-400 text-sm mb-6">
                {searchQuery 
                  ? "Try adjusting your search query"
                  : "Add matches to this batch to get started"
                }
              </p>
              {!searchQuery && batch.status === "Draft" && permissions.hasPermission('matches.create') && (
                <button
                  onClick={handleAddMatch}
                  className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-xl font-bold transition-all shadow-md text-sm hover:-translate-y-[1px]"
                >
                  <Plus className="w-5 h-5" />
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
                      "bg-white border rounded-2xl overflow-hidden transition-all duration-200",
                      match.isChampionshipBout 
                        ? "border-amber-300 bg-amber-50/15 hover:shadow-md hover:border-amber-400/80" 
                        : "border-slate-200/85 hover:shadow-md hover:border-slate-300"
                    )}
                  >
                    <div className="p-5">
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        {/* Match Number & Fighters */}
                        <div className="flex-1 flex items-center gap-4">
                          {/* Match Number */}
                          <div className={clsx(
                            "w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 shadow-sm",
                            match.isChampionshipBout ? "bg-amber-500" : "bg-primary"
                          )}>
                            <span className="text-sm font-extrabold text-white tracking-tight">
                              {batch.matches.indexOf(match) + 1}
                            </span>
                          </div>

                          {/* Fighters name text */}
                          <div className="flex-1 flex items-center gap-3 md:gap-4">
                            <div className="flex-1 text-right">
                              <div className="font-extrabold text-slate-900 text-sm md:text-base tracking-tight">{match.fighterA.name}</div>
                              <div className="text-xs text-slate-500 font-medium uppercase tracking-wider text-[10px]">{match.fighterA.record}</div>
                            </div>
                            
                            <div className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-slate-50 border border-slate-200/80 text-slate-500 font-extrabold text-[9px] tracking-widest flex-shrink-0">
                              VS
                            </div>
                            
                            <div className="flex-1">
                              <div className="font-extrabold text-slate-900 text-sm md:text-base tracking-tight">{match.fighterB.name}</div>
                              <div className="text-xs text-slate-500 font-medium uppercase tracking-wider text-[10px]">{match.fighterB.record}</div>
                            </div>
                          </div>
                        </div>

                        {/* Match Info & Statuses */}
                        <div className="flex items-center justify-between md:justify-end gap-6 border-t md:border-t-0 pt-3 md:pt-0 border-slate-100">
                          <div className="flex items-center gap-4">
                            <div className="text-center">
                              <div className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">Weight</div>
                              <div className="font-semibold text-slate-800 text-xs md:text-sm">{match.weightClass}</div>
                            </div>
                            
                            <div className="text-center">
                              <div className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">Rounds</div>
                              <div className="font-semibold text-slate-800 text-xs md:text-sm">{match.rounds}</div>
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            {/* Championship Badge */}
                            {match.isChampionshipBout && (
                              <span className="badge-premium badge-amber text-[9px] uppercase tracking-wider py-1 font-semibold shadow-sm">
                                <Trophy className="w-3.5 h-3.5 text-amber-500" />
                                TITLE
                              </span>
                            )}
                            
                            {/* Officials Status */}
                            {match.officials ? (
                              <span className="badge-premium badge-emerald text-[9px] uppercase tracking-wider py-1 font-semibold shadow-sm">
                                <UserCheck className="w-3.5 h-3.5 text-emerald-600" />
                                ASSIGNED
                              </span>
                            ) : (
                              <button
                                onClick={() => handleAssignOfficials(match.id)}
                                className="badge-premium badge-red hover:bg-red-100/80 text-red-750 text-[9px] uppercase tracking-wider py-1 font-semibold shadow-sm transition-all"
                                disabled={isLocked}
                              >
                                <AlertCircle className="w-3.5 h-3.5 text-red-500" />
                                ASSIGN
                              </button>
                            )}
                          </div>

                          {/* Action icons */}
                          <div className="flex items-center gap-1">
                            <Link
                              to={`/match/${match.id}`}
                              className="p-2 hover:bg-primary/10 rounded-xl transition-colors text-primary"
                              title="View Match Details"
                            >
                              <Eye className="w-4 h-4" />
                            </Link>
                            
                            <button
                              onClick={() => setExpandedMatchId(isExpanded ? null : match.id)}
                              className="p-2 hover:bg-slate-100 rounded-xl transition-colors text-slate-500 hover:text-slate-800"
                              title={isExpanded ? "Collapse" : "Expand"}
                            >
                              {isExpanded ? (
                                <ChevronUp className="w-4 h-4" />
                              ) : (
                                <ChevronDown className="w-4 h-4" />
                              )}
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* Expanded Details */}
                      {isExpanded && (
                        <div className="mt-5 pt-5 border-t border-slate-100 animate-fadeIn">
                          <div className="bg-slate-50/50 rounded-xl p-4 border border-slate-200/40 grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                              <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2.5">Fighter A Details</h4>
                              <div className="space-y-2">
                                <div className="flex justify-between">
                                  <span className="text-xs text-slate-500 font-medium">Club:</span>
                                  <span className="text-xs text-slate-800 font-semibold">{match.fighterA.gym}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-xs text-slate-500 font-medium">Record:</span>
                                  <span className="text-xs text-slate-800 font-semibold">{match.fighterA.record}</span>
                                </div>
                              </div>
                            </div>
                            
                            <div>
                              <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2.5">Fighter B Details</h4>
                              <div className="space-y-2">
                                <div className="flex justify-between">
                                  <span className="text-xs text-slate-500 font-medium">Club:</span>
                                  <span className="text-xs text-slate-800 font-semibold">{match.fighterB.gym}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-xs text-slate-500 font-medium">Record:</span>
                                  <span className="text-xs text-slate-800 font-semibold">{match.fighterB.record}</span>
                                </div>
                              </div>
                            </div>
                          </div>
                          
                          {match.officials && (
                            <div className="mt-4 p-4 bg-emerald-50/40 border border-emerald-200/50 rounded-xl">
                              <h4 className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider mb-2">Officials Assigned</h4>
                              <p className="text-xs text-emerald-600 font-semibold">
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


      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white rounded-2xl p-6 md:p-8 max-w-md w-full border border-slate-100 shadow-xl">
            <h3 className="text-lg font-extrabold text-red-700 mb-4 tracking-tight uppercase">Delete Batch?</h3>
            <p className="text-slate-600 font-normal text-sm mb-6">
              Are you sure you want to delete <strong>{batch.batchNumber}</strong>? This action cannot be undone.
            </p>
            <div className="flex items-center gap-3">
              <button
                onClick={handleDeleteBatch}
                className="flex-1 py-2.5 bg-secondary text-white rounded-xl font-semibold uppercase tracking-wider text-xs transition-all shadow hover:-translate-y-[1px] active:scale-[0.98]"
              >
                Delete
              </button>
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="flex-1 py-2.5 bg-slate-50 hover:bg-slate-100 text-slate-700 rounded-xl font-semibold uppercase tracking-wider text-xs transition-all border border-slate-200 hover:-translate-y-[1px] active:scale-[0.98]"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Assign Officials Modal */}
      {showOfficialModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white rounded-2xl p-6 md:p-8 max-w-2xl w-full border border-slate-100 shadow-xl">
            <h3 className="text-lg font-extrabold text-slate-900 mb-4 tracking-tight uppercase">Assign Officials</h3>
            
            <div className="space-y-4 mb-6">
              <div className="p-4 bg-primary/5 border border-primary/10 rounded-xl">
                <p className="text-xs font-semibold text-primary">
                  {selectedMatchForOfficials 
                    ? `Assigning officials to specific match`
                    : `Assigning officials to all ${batch.matches.length} matches in this batch`
                  }
                </p>
              </div>
              
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Main Referee</label>
                <select 
                  value={selectedReferee}
                  onChange={(e) => setSelectedReferee(e.target.value)}
                  className="input-premium font-medium text-slate-700 rounded-xl px-4 py-2.5"
                >
                  <option value="">Select referee...</option>
                  {getReferees().filter(r => r.status === "Available").map(referee => (
                    <option key={referee.id} value={referee.id}>
                      {referee.name} - {referee.grade} ({referee.experience})
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Judges (3 required)</label>
                <div className="bg-slate-50/50 border border-slate-200/80 rounded-xl p-4 max-h-56 overflow-y-auto space-y-2">
                  {getJudges().filter(j => j.status === "Available").map(judge => {
                    const isSelected = selectedJudges.includes(judge.id);
                    return (
                      <button
                        key={judge.id}
                        type="button"
                        onClick={() => handleToggleJudge(judge.id)}
                        className={`w-full text-left p-2.5 rounded-xl border transition-all duration-200 flex items-center justify-between ${
                          isSelected
                            ? "bg-primary border-primary text-white shadow-sm shadow-primary/20"
                            : "bg-white border-slate-200 hover:border-slate-350 text-slate-800"
                        }`}
                      >
                        <div className="flex-1">
                          <div className="font-semibold text-xs">{judge.name}</div>
                          <div className={`text-[10px] mt-0.5 font-medium ${isSelected ? "text-white/90" : "text-slate-500"}`}>
                            {judge.grade} • {judge.experience}
                          </div>
                        </div>
                        {isSelected && (
                          <Check className="w-4 h-4 flex-shrink-0 ml-2" />
                        )}
                      </button>
                    );
                  })}
                </div>
                
                {/* Selected Count */}
                <div className="mt-2 text-center">
                  <span className={clsx(
                    "text-[10px] uppercase tracking-wider font-bold",
                    selectedJudges.length === 3 ? "text-emerald-600" : "text-slate-500"
                  )}>
                    {selectedJudges.length} / 3 judges selected
                  </span>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <button
                onClick={handleOfficialAssignment}
                className="flex-1 py-2.5 bg-primary hover:bg-primary/95 text-white rounded-xl font-semibold uppercase tracking-wider text-xs transition-all shadow hover:-translate-y-[1px]"
              >
                Assign Officials
              </button>
              <button
                onClick={() => {
                  setShowOfficialModal(false);
                  setSelectedMatchForOfficials(null);
                  setSelectedReferee("");
                  setSelectedJudges([]);
                }}
                className="flex-1 py-2.5 bg-slate-50 hover:bg-slate-100 text-slate-700 rounded-xl font-semibold uppercase tracking-wider text-xs transition-all border border-slate-200 hover:-translate-y-[1px]"
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