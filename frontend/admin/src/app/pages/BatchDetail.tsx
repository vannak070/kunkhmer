import { useState, useMemo } from "react";
import { useParams, useNavigate, Link } from "react-router";
import { 
  ArrowLeft, Eye, Plus, Search, ChevronDown, ChevronUp,
  CheckCircle, Clock, Calendar, MapPin, Users, Trophy, Check,
  Send, AlertCircle, Edit2, TrendingUp, Shield, Radio, Award, Building2, X,
  UserCheck, Target, BarChart3, FileText, Trash2, Share2, Download, Scale, Dumbbell, Sparkles
} from "lucide-react";
import { 
  BATCH_STATUS_CONFIG, 
  calculateBatchReadiness,
  getBatchWarnings,
  formatDisplayDate
} from "../data/batches";
import type { BatchStatus } from "../data/batches";
import { api } from "../utils/api";
import { useEffect } from "react";
import { usePermissions } from "../hooks/usePermissions";
import { toast } from "sonner";
import { clsx } from "clsx";
import { getJudges, getReferees } from "../utils/officialsStore";

export function BatchDetail() {
  const { batchId } = useParams();
  const navigate = useNavigate();
  const permissions = usePermissions();

  // === All state declarations at the top ===
  const [batch, setBatch] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  
  const [expandedMatchId, setExpandedMatchId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showOfficialModal, setShowOfficialModal] = useState(false);
  const [selectedMatchForOfficials, setSelectedMatchForOfficials] = useState<string | null>(null);
  const [selectedReferee, setSelectedReferee] = useState<string>("");
  const [selectedJudges, setSelectedJudges] = useState<string[]>([]);

  // Grid-Based Officials Assignment State
  const [matchOfficials, setMatchOfficials] = useState<Record<string, { refereeId: string, judgeIds: string[] }>>({});

  useEffect(() => {
    if (showOfficialModal && batch?.matches) {
      const initial: Record<string, { refereeId: string, judgeIds: string[] }> = {};
      batch.matches.forEach((m: any) => {
        initial[m.id] = {
          refereeId: m.refereeId || "",
          judgeIds: m.judgeIds || []
        };
      });
      setMatchOfficials(initial);
    }
  }, [showOfficialModal, batch]);

  const updateMatchOfficialState = (matchId: string, field: "refereeId" | "judgeIds", value: any) => {
    setMatchOfficials(prev => ({
      ...prev,
      [matchId]: {
        ...prev[matchId],
        [field]: value
      }
    }));
  };

  const getFilteredJudgesForSlot = (matchId: string, slotIndex: number) => {
    const current = matchOfficials[matchId]?.judgeIds || [];
    const selectedOtherSlots = current.filter((_, idx) => idx !== slotIndex);
    return getJudges().filter(j => j.status === "Available" && !selectedOtherSlots.includes(j.id));
  };

  const handleAutoFillOfficials = () => {
    if (!batch?.matches || batch.matches.length === 0) return;
    const firstMatchId = batch.matches[0].id;
    const firstMatchAssignment = matchOfficials[firstMatchId];
    if (!firstMatchAssignment || !firstMatchAssignment.refereeId || firstMatchAssignment.judgeIds.length !== 3) {
      toast.error("❌ Configure officials for the first match first!");
      return;
    }

    const updated = { ...matchOfficials };
    batch.matches.forEach((m: any) => {
      updated[m.id] = {
        refereeId: firstMatchAssignment.refereeId,
        judgeIds: [...firstMatchAssignment.judgeIds]
      };
    });
    setMatchOfficials(updated);
    toast.success("⚡ Officials copied to all matches!");
  };

  // Inline Results Recorder State
  const [inlineResults, setInlineResults] = useState<Record<string, { winnerId: string, method: string, round: string }>>({});
  const [actualWeights, setActualWeights] = useState<Record<string, { weightA: string, weightB: string }>>({});

  useEffect(() => {
    if (batch?.matches) {
      const initialResults: Record<string, { winnerId: string, method: string, round: string }> = {};
      const initialWeights: Record<string, { weightA: string, weightB: string }> = {};
      batch.matches.forEach((m: any) => {
        initialResults[m.id] = {
          winnerId: m.winner_id || "",
          method: m.winner_method || "",
          round: m.winner_round ? String(m.winner_round) : "",
        };
        initialWeights[m.id] = {
          weightA: m.fighterA?.weight ? String(m.fighterA.weight) : "",
          weightB: m.fighterB?.weight ? String(m.fighterB.weight) : "",
        };
      });
      setInlineResults(initialResults);
      setActualWeights(initialWeights);
    }
  }, [batch]);

  const updateInlineResultState = (matchId: string, field: string, value: string) => {
    setInlineResults(prev => {
      const current = prev[matchId] || { winnerId: "", method: "", round: "" };
      const updated = { ...current, [field]: value };
      
      if (field === "winnerId" && (value === "Draw" || value === "No Contest")) {
        updated.method = "";
        updated.round = "";
      }
      if (field === "method" && value === "PTS") {
        updated.round = "";
      }
      return { ...prev, [matchId]: updated };
    });
  };

  const handleSaveInlineResult = async (matchId: string) => {
    const result = inlineResults[matchId];
    if (!result || !result.winnerId) {
      toast.error("❌ Please select a winner!");
      return;
    }

    const m = batch.matches.find((x: any) => x.id === matchId);
    if (!m) return;

    const isDrawOrNC = result.winnerId === "Draw" || result.winnerId === "No Contest";
    if (!isDrawOrNC) {
      if (!result.method) {
        toast.error("❌ Please select victory method!");
        return;
      }
      if (result.method !== "PTS" && !result.round) {
        toast.error("❌ Please select ending round!");
        return;
      }
    }

    try {
      await api.matches.saveResult(matchId, {
        winnerId: isDrawOrNC ? null : result.winnerId,
        winnerMethod: isDrawOrNC ? result.winnerId : result.method,
        winnerRound: isDrawOrNC ? null : (result.method === "PTS" ? m.rounds : parseInt(result.round)),
      });

      const updatedMatches = batch.matches.map((x: any) => {
        if (x.id === matchId) {
          return {
            ...x,
            status: "Complete" as any,
            winner_id: isDrawOrNC ? null : result.winnerId,
            winner_method: isDrawOrNC ? result.winnerId : result.method,
            winner_round: isDrawOrNC ? null : (result.method === "PTS" ? m.rounds : parseInt(result.round)),
          };
        }
        return x;
      });

      setBatch((prev: any) => ({
        ...prev,
        matches: updatedMatches
      }));

      toast.success("✅ Match outcome recorded successfully!");
    } catch (err: any) {
      console.error(err);
      toast.error("Failed to save match result: " + err.message);
    }
  };

  // (State already declared at the top of the component)
  const [matches, setMatches] = useState<any[]>([]);
  
  useEffect(() => {
    if (batchId) {
      loadData();
    }
  }, [batchId]);

  const loadData = async () => {
    setLoading(true);
    try {
      const b = await api.batches.get(batchId!);
      if (b) {
        // Load matches for this sub-event
        const allMatches = await api.matches.list();
        const batchMatches = allMatches.filter((m: any) => m.sub_event_id === b.id).map((m: any) => {
          return {
            id: m.id,
            status: m.status,
            rounds: m.rounds,
            weightClass: m.agreed_weight ? `${m.agreed_weight} kg` : "Catchweight",
            agreedWeight: m.agreed_weight,
            isChampionshipBout: m.is_title_match || m.isTitleMatch || false,
            refereeId: m.referee_id || "",
            judgeIds: Array.isArray(m.judge_ids) ? m.judge_ids : [],
            officials: (m.referee_id || (Array.isArray(m.judge_ids) && m.judge_ids.length > 0)) ? true : false,
            refereeName: m.referee_name,
            fighterAConfirmed: m.fighter_a_confirmed || false,
            fighterBConfirmed: m.fighter_b_confirmed || false,
            winnerId: m.winner_id || null,
            winnerMethod: m.winner_method || null,
            winnerRound: m.winner_round || null,
            gloveSize: m.glove_size || m.gloveSize || "",
            gloveBrand: m.glove_brand || m.gloveBrand || "",
            championshipTitleName: m.championshipTitleName || m.championship_title_name || null,
            fighterA: {
              id: m.fighter_a_id,
              name: m.fighter_a_name || "TBD (Fighter A)",
              image: m.fighter_a_image,
              gym: m.club_a_name || "Independent",
              record: m.fighter_a_record || "0-0-0",
              weight: parseFloat(m.fighterA?.current_weight || m.fighterA?.currentWeight || m.fighter_a?.current_weight || m.fighter_a?.currentWeight || 0)
            },
            fighterB: {
              id: m.fighter_b_id,
              name: m.fighter_b_name || "TBD (Fighter B)",
              image: m.fighter_b_image,
              gym: m.club_b_name || "Independent",
              record: m.fighter_b_record || "0-0-0",
              weight: parseFloat(m.fighterB?.current_weight || m.fighterB?.currentWeight || m.fighter_b?.current_weight || m.fighter_b?.currentWeight || 0)
            }
          };
        });

        const mappedBatch = {
          id: b.id,
          batchNumber: b.batch_number || `BATCH-${b.week_number}`,
          eventName: b.event_name || "Weekly Fight Card",
          location: b.location || "Olympic Stadium Arena",
          date: b.date ? String(b.date).split("T")[0] : "",
          createdDate: b.created_at ? String(b.created_at).split("T")[0] : "",
          status: b.status as BatchStatus,
          totalMatches: batchMatches.length,
          matches: batchMatches,
          organizerClub: b.creator_name,
          createdBy: b.creator_name,
          eventId: b.event_id,
          broadcastStation: b.broadcast_station_name,
          mainSponsor: b.main_sponsor_name
        };

        setBatch(mappedBatch);
        setMatches(batchMatches);
      }
    } catch (err: any) {
      toast.error("Failed to load batch details: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  // Calculate batch statistics
  const batchStats = useMemo(() => {
    if (!batch || !batch.matches) {
      return {
        totalMatches: 0,
        completedMatches: 0,
        pendingMatches: 0,
        championshipMatches: 0,
        regularMatches: 0,
        matchesWithOfficials: 0,
        matchesNeedingOfficials: 0,
      };
    }
    const totalMatches = batch.matches.length;
    const completedMatches = batch.matches.filter((m: any) => m.status === "Completed").length;
    const pendingMatches = batch.matches.filter((m: any) => m.status !== "Completed").length;
    const championshipMatches = batch.matches.filter((m: any) => m.isChampionshipBout).length;
    const regularMatches = totalMatches - championshipMatches;
    const matchesWithOfficials = batch.matches.filter((m: any) => m.officials).length;
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
  }, [batch?.matches]);

  // Filter matches by search
  const filteredMatches = useMemo(() => {
    if (!batch || !batch.matches) return [];
    if (!searchQuery.trim()) return batch.matches;
    
    const query = searchQuery.toLowerCase();
    return batch.matches.filter((match: any) => 
      (match.fighterA?.name || "").toLowerCase().includes(query) ||
      (match.fighterB?.name || "").toLowerCase().includes(query) ||
      (match.weightClass || "").toLowerCase().includes(query)
    );
  }, [batch?.matches, searchQuery]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!batch) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="text-center">
          <h1 className="text-2xl font-extrabold text-slate-900 mb-4 tracking-tight">Batch Not Found</h1>
          <button
            onClick={() => navigate("/home/program?tab=matches")}
            className="btn-primary px-5 py-2.5 font-semibold uppercase tracking-wider text-xs rounded-xl shadow-md"
          >
            Back to Matches
          </button>
        </div>
      </div>
    );
  }

  const handleMoveToWeightIn = async () => {
    if (batch.matches.length === 0) {
      toast.error("❌ Cannot proceed: Batch must have at least one match");
      return;
    }
    try {
      await api.batches.update(batchId!, { status: "Weight-In" });
      toast.success(`✅ Batch ${batch.batchNumber} moved to Weight-In phase!`);
      loadData();
    } catch (err: any) {
      toast.error("Failed to move stage: " + err.message);
    }
  };

  const handleCompleteWeightIn = async () => {
    // Check if all fighters have a weight > 0
    const allWeighed = batch.matches.every((m: any) => m.fighterA?.weight > 0 && m.fighterB?.weight > 0);
    if (!allWeighed) {
      if (!confirm("⚠️ Some fighters have not completed weigh-in confirmation. Do you want to override and proceed?")) {
        return;
      }
    }
    try {
      await api.batches.update(batchId!, { status: "Scheduled" });
      toast.success(`✅ Batch ${batch.batchNumber} has been successfully scheduled!`);
      loadData();
    } catch (err: any) {
      toast.error("Failed to schedule batch: " + err.message);
    }
  };

  const handleGoLive = async () => {
    try {
      await api.batches.update(batchId!, { status: "Live" });
      toast.success(`🔥 Batch ${batch.batchNumber} is now LIVE!`);
      loadData();
    } catch (err: any) {
      toast.error("Failed to start event: " + err.message);
    }
  };

  const handleFinalizeEvent = async () => {
    const allCompleted = batch.matches.every((m: any) => m.status === "Complete" || m.winner_id || m.winner_method);
    if (!allCompleted) {
      toast.error("❌ Cannot finalize: Record outcomes for all matches first!");
      return;
    }
    try {
      await api.batches.update(batchId!, { status: "Complete" });
      toast.success(`🏆 Batch ${batch.batchNumber} event has been finalized and completed!`);
      loadData();
    } catch (err: any) {
      toast.error("Failed to finalize event: " + err.message);
    }
  };

  const handleSaveFighterWeight = async (matchId: string, corner: "A" | "B") => {
    const match = batch.matches.find((m: any) => m.id === matchId);
    if (!match) return;

    const weights = actualWeights[matchId] || { weightA: "", weightB: "" };
    const weightVal = corner === "A" ? weights.weightA : weights.weightB;
    const fighter = corner === "A" ? match.fighterA : match.fighterB;

    if (!weightVal || isNaN(parseFloat(weightVal))) {
      toast.error("❌ Please enter a valid weight!");
      return;
    }

    try {
      // 1. Update fighter's weight in database
      await api.fighters.update(fighter.id, { currentWeight: parseFloat(weightVal) });
      
      // 2. Set fighter weigh-in confirmation on the match
      const updatePayload = corner === "A" 
        ? { fighterAConfirmed: true } 
        : { fighterBConfirmed: true };
      
      await api.matches.update(matchId, updatePayload);

      // 3. Update local state
      const updatedMatches = batch.matches.map((m: any) => {
        if (m.id === matchId) {
          const updatedFighter = { ...fighter, weight: parseFloat(weightVal) };
          return {
            ...m,
            fighterAConfirmed: corner === "A" ? true : m.fighterAConfirmed,
            fighterBConfirmed: corner === "B" ? true : m.fighterBConfirmed,
            fighterA: corner === "A" ? updatedFighter : m.fighterA,
            fighterB: corner === "B" ? updatedFighter : m.fighterB,
          };
        }
        return m;
      });

      setBatch((prev: any) => ({
        ...prev,
        matches: updatedMatches
      }));

      toast.success(`✅ Weight recorded for ${fighter.name}!`);
    } catch (err: any) {
      console.error(err);
      toast.error("Failed to save weight: " + err.message);
    }
  };

  const handleDeleteBatch = async () => {
    try {
      await api.batches.delete(batchId!);
      toast.success(`✅ Batch ${batch.batchNumber} deleted`);
      setTimeout(() => navigate("/home/program?tab=matches"), 1000);
    } catch (err: any) {
      toast.error("Failed to delete batch: " + err.message);
    }
  };

  const handleAddMatch = () => {
    navigate(`/home/matches/${batch.id}/create-match`);
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

  const handleOfficialAssignment = async () => {
    if (selectedMatchForOfficials) {
      if (!selectedReferee) {
        toast.error("❌ Please select a referee");
        return;
      }
      if (selectedJudges.length !== 3) {
        toast.error("❌ Exactly 3 judges are required");
        return;
      }

      try {
        await api.matches.update(selectedMatchForOfficials, {
          refereeId: selectedReferee,
          judgeIds: selectedJudges,
        });

        // Update specific match
        const referee = getReferees().find(r => r.id === selectedReferee);
        const judges = selectedJudges.map(id => getJudges().find(j => j.id === id)?.name || "");
        
        const updatedMatches = batch.matches.map((m: any) => {
          if (m.id === selectedMatchForOfficials) {
            return {
              ...m,
              refereeId: selectedReferee,
              referee_id: selectedReferee,
              refereeName: referee?.name || "Assigned",
              judgeIds: selectedJudges,
              judge_ids: selectedJudges,
              judgeNames: judges,
              officials: true
            };
          }
          return m;
        });

        setBatch((prev: any) => ({
          ...prev,
          matches: updatedMatches
        }));

        toast.success("✅ Officials assigned to match");
      } catch (err: any) {
        console.error(err);
        toast.error("Failed to assign officials: " + err.message);
        return;
      }
    } else {
      // Validate all matches in the card
      let isValid = true;
      batch.matches.forEach((m: any) => {
        const assignment = matchOfficials[m.id];
        if (!assignment || !assignment.refereeId || assignment.judgeIds.length !== 3) {
          isValid = false;
        }
      });

      if (!isValid) {
        toast.error("❌ Each match must have a referee and exactly 3 judges assigned!");
        return;
      }

      try {
        await Promise.all(
          batch.matches.map((m: any) => {
            const assignment = matchOfficials[m.id];
            return api.matches.update(m.id, {
              refereeId: assignment.refereeId,
              judgeIds: assignment.judgeIds,
            });
          })
        );

        // Save assignments for all matches
        const updatedMatches = batch.matches.map((m: any) => {
          const assignment = matchOfficials[m.id];
          const referee = getReferees().find(r => r.id === assignment.refereeId);
          const judges = assignment.judgeIds.map(id => getJudges().find(j => j.id === id)?.name || "");
          return {
            ...m,
            refereeId: assignment.refereeId,
            referee_id: assignment.refereeId,
            refereeName: referee?.name || "Assigned",
            judgeIds: assignment.judgeIds,
            judge_ids: assignment.judgeIds,
            judgeNames: judges,
            officials: true
          };
        });

        setBatch((prev: any) => ({
          ...prev,
          matches: updatedMatches
        }));

        toast.success("✅ Officials assigned successfully to all matches!");
      } catch (err: any) {
        console.error(err);
        toast.error("Failed to assign officials: " + err.message);
        return;
      }
    }

    setShowOfficialModal(false);
    setSelectedMatchForOfficials(null);
    setSelectedReferee("");
    setSelectedJudges([]);
  };

  const handleShare = () => {
    navigate(`/home/batches/${batch.id}/share`);
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
        return "completed";
      case "weight-in":
        if (status === "Weight-In") {
          return "active";
        }
        if (["Draft", "Pending KKF", "Approved", "Rejected"].includes(status)) {
          return "upcoming";
        }
        return "completed";
      case "live":
        if (["Scheduled", "Ready", "Live", "Approved"].includes(status)) {
          return "active";
        }
        return "upcoming";
      case "complete":
        return (status === "Complete" || status === "Completed") ? "active" : "upcoming";
      default:
        return "upcoming";
    }
  };

  try {
    return (
      <div className="min-h-screen bg-background">
        <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-6 animate-fadeIn">
          {/* Back Button */}
          <button
            onClick={() => navigate("/home/program?tab=matches")}
            className="inline-flex items-center gap-2 text-slate-500 hover:text-slate-900 font-semibold uppercase tracking-wider text-xs transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Batches
          </button>

          {/* Live Fight Night Pulsing Banner */}
          {batch.status === "Live" && (
            <div className="bg-red-600 text-white px-6 py-4 rounded-2xl flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 shadow-lg shadow-red-500/10 border border-red-500 animate-fadeIn">
              <div className="flex items-center gap-3">
                <span className="relative flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-white"></span>
                </span>
                <span className="font-extrabold text-sm uppercase tracking-widest leading-none">Fight Night Live</span>
              </div>
              <span className="text-xs font-semibold text-white/95">Broadcasting live from {batch.location} • Record match outcomes in the Results Desk below</span>
            </div>
          )}

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
                        batch.status === "Complete" && "bg-slate-100 text-slate-700 border-slate-200",
                        batch.status === "Scheduled" && "badge-blue bg-blue-50 text-blue-750 border-blue-200/50"
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
                    onClick={() => navigate(`/home/matches/${batch.id}/edit`)}
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

                {/* Complete Weigh-In & Schedule */}
                {batch.status === "Weight-In" && permissions.hasPermission('matches.edit') && (
                  <button
                    onClick={handleCompleteWeightIn}
                    className="inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-semibold uppercase tracking-wider text-xs transition-all shadow hover:-translate-y-[1px] active:scale-[0.98]"
                  >
                    <CheckCircle className="w-4 h-4" />
                    Complete Weigh-In
                  </button>
                )}

                {/* Launch Event (Go Live) */}
                {(batch.status === "Scheduled" || batch.status === "Ready" || batch.status === "Approved") && permissions.hasPermission('matches.edit') && (
                  <button
                    onClick={handleGoLive}
                    className="inline-flex items-center gap-2 px-5 py-2.5 bg-orange-500 hover:bg-orange-600 text-white rounded-xl font-semibold uppercase tracking-wider text-xs transition-all shadow hover:-translate-y-[1px] active:scale-[0.98]"
                  >
                    <Send className="w-4 h-4 text-white" />
                    Launch Event (Go Live)
                  </button>
                )}

                {/* Finalize Event & Complete Batch */}
                {batch.status === "Live" && permissions.hasPermission('matches.edit') && (
                  <button
                    onClick={handleFinalizeEvent}
                    className="inline-flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-semibold uppercase tracking-wider text-xs transition-all shadow hover:-translate-y-[1px] active:scale-[0.98]"
                  >
                    <Trophy className="w-4 h-4" />
                    Finalize Event & Complete
                  </button>
                )}

                {/* Share Fight Card */}
                {(() => {
                  const isDraftReady = batch.status === "Draft" && batch.matches.length > 0;
                  const isActiveStage = ["Weight-In", "Ready", "Live", "Scheduled"].includes(batch.status);
                  const isCompleted = ["Complete", "Completed"].includes(batch.status);
                  const allResultsUpdated = isCompleted && batch.matches.length > 0 && batch.matches.every(m => m.winnerId || m.winner || m.winnerMethod);
                  
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
            {/* Quick Results Recorder Panel */}
            {batch.matches.length > 0 && ["Ready", "Live", "Complete"].includes(batch.status) && (
              <div className="bg-slate-50 rounded-2xl border border-slate-200/80 p-5 mb-8 space-y-4 animate-fadeIn">
                <div className="flex items-center justify-between border-b border-slate-200/50 pb-3">
                  <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-primary" />
                    Quick Results Recorder Desk
                  </h3>
                  <span className="px-2.5 py-0.5 bg-primary/10 text-primary font-bold text-[9px] rounded-full uppercase tracking-wider">
                    Control Center
                  </span>
                </div>

                <div className="overflow-x-auto rounded-xl border border-slate-200/60 bg-white shadow-sm">
                  <table className="w-full text-left text-xs font-semibold text-slate-700 min-w-[650px] table-fixed">
                    <thead>
                      <tr className="bg-slate-50/50 border-b border-slate-200/60 text-slate-450 uppercase text-[9px] tracking-wider">
                        <th className="py-3 px-3 w-[220px]">Match Card</th>
                        <th className="py-3 px-3 w-[180px]">Winner Corner Selection</th>
                        <th className="py-3 px-3 w-[140px]">Victory Method</th>
                        <th className="py-3 px-3 w-[110px]">End Round</th>
                        <th className="py-3 px-3 text-right w-[120px]">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {batch.matches.map((m: any, index: number) => {
                        const isSaved = m.status === "Complete" || m.winner_id || m.winner_method;
                        const matchResult = inlineResults[m.id] || { winnerId: "", method: "", round: "" };
                        
                        return (
                          <tr key={m.id} className="hover:bg-slate-50/40 transition-colors">
                            <td className="py-3.5 px-3">
                              <div className="flex items-center gap-2">
                                <span className="w-5 h-5 rounded-full bg-slate-100 flex items-center justify-center font-bold text-[10px] text-slate-500 shrink-0">
                                  #{index + 1}
                                </span>
                                <div className="min-w-0">
                                  <div className="font-extrabold text-slate-900 truncate">
                                    {m.fighterA.name} <span className="text-slate-400 font-normal">vs</span> {m.fighterB.name}
                                  </div>
                                  <div className="text-[10px] text-slate-405 mt-0.5">
                                    {m.weightClass} • {m.rounds} Rounds
                                    {m.isChampionshipBout && (
                                      <span className="text-amber-600 font-bold ml-1.5">🏆 TITLE</span>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </td>
                            <td className="py-3.5 px-3">
                              <select 
                                disabled={isSaved}
                                value={matchResult.winnerId}
                                onChange={(e) => updateInlineResultState(m.id, "winnerId", e.target.value)}
                                className="px-2 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 w-full focus:border-primary focus:outline-none cursor-pointer disabled:bg-slate-50 disabled:text-slate-450"
                              >
                                <option value="">Select Winner...</option>
                                <option value={m.fighterA.id}>{m.fighterA.name} (Red Corner)</option>
                                <option value={m.fighterB.id}>{m.fighterB.name} (Blue Corner)</option>
                                <option value="Draw">Draw Match</option>
                                <option value="No Contest">No Contest (NC)</option>
                              </select>
                            </td>
                            <td className="py-3.5 px-3">
                              <select 
                                disabled={isSaved || matchResult.winnerId === "Draw" || matchResult.winnerId === "No Contest" || !matchResult.winnerId}
                                value={matchResult.method}
                                onChange={(e) => updateInlineResultState(m.id, "method", e.target.value)}
                                className="px-2 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 w-full focus:border-primary focus:outline-none cursor-pointer disabled:bg-slate-50 disabled:text-slate-450"
                              >
                                <option value="">Victory Method...</option>
                                <option value="KO">Knockout (KO)</option>
                                <option value="TKO">Technical Knockout (TKO)</option>
                                <option value="PTS">Points Decision (PTS)</option>
                                <option value="DQ">Disqualification (DQ)</option>
                              </select>
                            </td>
                            <td className="py-3.5 px-3">
                              <select 
                                disabled={isSaved || matchResult.winnerId === "Draw" || matchResult.winnerId === "No Contest" || matchResult.method === "PTS" || !matchResult.method}
                                value={matchResult.round}
                                onChange={(e) => updateInlineResultState(m.id, "round", e.target.value)}
                                className="px-2 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 w-full focus:border-primary focus:outline-none cursor-pointer disabled:bg-slate-50 disabled:text-slate-450"
                              >
                                <option value="">Round...</option>
                                {[...Array(m.rounds)].map((_, i) => (
                                  <option key={i+1} value={i+1}>Round {i+1}</option>
                                ))}
                              </select>
                            </td>
                            <td className="py-3.5 px-3 text-right">
                              {isSaved ? (
                                <span className="inline-flex items-center gap-1 text-emerald-600 font-extrabold text-[10px] uppercase tracking-wider bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200/50">
                                  <Check className="w-3.5 h-3.5" />
                                  Saved
                                </span>
                              ) : (
                                <button
                                  onClick={() => handleSaveInlineResult(m.id)}
                                  className="px-3.5 py-1.5 bg-primary hover:bg-primary/95 text-white font-extrabold rounded-lg text-[10px] uppercase tracking-wider transition-all shadow-sm shadow-primary/10 active:scale-[0.97]"
                                >
                                  Save Result
                                </button>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

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
                            <div className="flex-1 flex flex-col gap-1">
                              <div className="flex items-center gap-3 md:gap-4">
                                <div className="flex-1 text-right">
                                  <div className={clsx(
                                    "font-extrabold text-sm md:text-base tracking-tight",
                                    match.winnerId === match.fighterA.id ? "text-emerald-600 font-black" : "text-slate-900"
                                  )}>
                                    {match.fighterA.name}
                                    {match.winnerId === match.fighterA.id && " 👑"}
                                  </div>
                                  <div className="text-xs text-slate-500 font-medium uppercase tracking-wider text-[10px]">{match.fighterA.record}</div>
                                </div>
                                
                                <div className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-slate-50 border border-slate-200/80 text-slate-500 font-extrabold text-[9px] tracking-widest flex-shrink-0">
                                  VS
                                </div>
                                
                                <div className="flex-1">
                                  <div className={clsx(
                                    "font-extrabold text-sm md:text-base tracking-tight",
                                    match.winnerId === match.fighterB.id ? "text-emerald-600 font-black" : "text-slate-900"
                                  )}>
                                    {match.winnerId === match.fighterB.id && "👑 "}
                                    {match.fighterB.name}
                                  </div>
                                  <div className="text-xs text-slate-500 font-medium uppercase tracking-wider text-[10px]">{match.fighterB.record}</div>
                                </div>
                              </div>

                              {/* Victory outcome subtext */}
                              {(match.status === "Complete" || match.winnerId || match.winnerMethod) && (
                                <div className="text-center mt-1">
                                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-emerald-50 text-emerald-700 text-[10px] font-extrabold rounded-lg border border-emerald-200/40 uppercase tracking-wider">
                                    {match.winnerMethod === "Draw" ? (
                                      "Match Result: Draw"
                                    ) : match.winnerMethod === "No Contest" ? (
                                      "Match Result: No Contest"
                                    ) : (
                                      <>
                                        Winner: {match.winnerId === match.fighterA.id ? match.fighterA.name : match.fighterB.name} 
                                        ({match.winnerMethod} {match.winnerRound ? `• R${match.winnerRound}` : ""})
                                      </>
                                    )}
                                  </span>
                                </div>
                              )}
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
                                to={`/home/match/${match.id}`}
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
                      </div>

                      {/* Expanded Details */}
                      {isExpanded && (
                        <div className="mt-5 pt-5 border-t border-slate-100 animate-fadeIn">
                          {batch.status === "Weight-In" ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                              {/* Fighter A Weigh-In */}
                              <div className="p-4 bg-slate-50 border border-slate-200/80 rounded-xl space-y-3 shadow-sm">
                                <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                                  Fighter A (Red Corner) Weigh-In
                                </h4>
                                <div className="flex items-center gap-3">
                                  <div className="w-10 h-10 bg-indigo-50 border border-indigo-100 rounded-lg flex items-center justify-center font-bold text-indigo-700 uppercase">
                                    {match.fighterA.name.charAt(0)}
                                  </div>
                                  <div className="min-w-0 flex-1">
                                    <div className="text-xs font-bold text-slate-900 truncate">{match.fighterA.name}</div>
                                    <div className="text-[10px] text-slate-500">Agreed weight: {match.agreedWeight} kg</div>
                                  </div>
                                </div>
                                <div className="space-y-2">
                                  <div className="flex gap-2">
                                    <div className="relative flex-1">
                                      <input
                                        type="number"
                                        step="0.1"
                                        placeholder="Actual Weight"
                                        value={actualWeights[match.id]?.weightA || ""}
                                        onChange={(e) => setActualWeights(prev => ({
                                          ...prev,
                                          [match.id]: {
                                            ...prev[match.id],
                                            weightA: e.target.value
                                          }
                                        }))}
                                        className="w-full text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-lg px-3 py-2 focus:border-primary outline-none"
                                      />
                                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-bold text-slate-400">kg</span>
                                    </div>
                                    <button
                                      onClick={() => handleSaveFighterWeight(match.id, "A")}
                                      className="px-3 py-2 bg-primary hover:bg-primary/95 text-white text-xs font-bold rounded-lg transition-colors"
                                    >
                                      Save
                                    </button>
                                  </div>
                                  {match.fighterA.weight > 0 && (
                                    <div className="flex items-center justify-between mt-1">
                                      <span className="text-[10px] font-bold text-slate-400">Weigh-in status:</span>
                                      {Math.abs(match.fighterA.weight - match.agreedWeight) <= 1.0 ? (
                                        <span className="px-2.5 py-0.5 bg-emerald-50 text-emerald-700 text-[10px] font-extrabold rounded border border-emerald-250/40 uppercase tracking-wider">
                                          PASS ({match.fighterA.weight} kg)
                                        </span>
                                      ) : (
                                        <span className="px-2.5 py-0.5 bg-red-50 text-red-700 text-[10px] font-extrabold rounded border border-red-250/40 uppercase tracking-wider">
                                          FAIL - Overweight ({match.fighterA.weight} kg)
                                        </span>
                                      )}
                                    </div>
                                  )}
                                </div>
                              </div>

                              {/* Fighter B Weigh-In */}
                              <div className="p-4 bg-slate-50 border border-slate-200/80 rounded-xl space-y-3 shadow-sm">
                                <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                                  Fighter B (Blue Corner) Weigh-In
                                </h4>
                                <div className="flex items-center gap-3">
                                  <div className="w-10 h-10 bg-indigo-50 border border-indigo-100 rounded-lg flex items-center justify-center font-bold text-indigo-700 uppercase">
                                    {match.fighterB.name.charAt(0)}
                                  </div>
                                  <div className="min-w-0 flex-1">
                                    <div className="text-xs font-bold text-slate-900 truncate">{match.fighterB.name}</div>
                                    <div className="text-[10px] text-slate-500">Agreed weight: {match.agreedWeight} kg</div>
                                  </div>
                                </div>
                                <div className="space-y-2">
                                  <div className="flex gap-2">
                                    <div className="relative flex-1">
                                      <input
                                        type="number"
                                        step="0.1"
                                        placeholder="Actual Weight"
                                        value={actualWeights[match.id]?.weightB || ""}
                                        onChange={(e) => setActualWeights(prev => ({
                                          ...prev,
                                          [match.id]: {
                                            ...prev[match.id],
                                            weightB: e.target.value
                                          }
                                        }))}
                                        className="w-full text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-lg px-3 py-2 focus:border-primary outline-none"
                                      />
                                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-bold text-slate-400">kg</span>
                                    </div>
                                    <button
                                      onClick={() => handleSaveFighterWeight(match.id, "B")}
                                      className="px-3 py-2 bg-primary hover:bg-primary/95 text-white text-xs font-bold rounded-lg transition-colors"
                                    >
                                      Save
                                    </button>
                                  </div>
                                  {match.fighterB.weight > 0 && (
                                    <div className="flex items-center justify-between mt-1">
                                      <span className="text-[10px] font-bold text-slate-400">Weigh-in status:</span>
                                      {Math.abs(match.fighterB.weight - match.agreedWeight) <= 1.0 ? (
                                        <span className="px-2.5 py-0.5 bg-emerald-50 text-emerald-700 text-[10px] font-extrabold rounded border border-emerald-250/40 uppercase tracking-wider">
                                          PASS ({match.fighterB.weight} kg)
                                        </span>
                                      ) : (
                                        <span className="px-2.5 py-0.5 bg-red-50 text-red-700 text-[10px] font-extrabold rounded border border-red-250/40 uppercase tracking-wider">
                                          FAIL - Overweight ({match.fighterB.weight} kg)
                                        </span>
                                      )}
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                          ) : (
                            <div className="bg-slate-50/50 rounded-xl p-4 border border-slate-200/40 grid grid-cols-1 md:grid-cols-3 gap-6">
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

                              {/* Officials & Gear Details */}
                              <div>
                                <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2.5">Officials & Equipment</h4>
                                <div className="space-y-2 text-xs">
                                  <div className="flex justify-between items-start">
                                    <span className="text-slate-500 font-medium">Referee:</span>
                                    <span className="text-slate-800 font-semibold text-right">
                                      {match.refereeName || (match.refereeId ? getReferees().find((r: any) => r.id === match.refereeId)?.name : "None assigned")}
                                    </span>
                                  </div>
                                  <div className="flex justify-between items-start">
                                    <span className="text-slate-500 font-medium">Judges:</span>
                                    <span className="text-slate-800 font-semibold text-right">
                                      {match.judgeIds && match.judgeIds.length > 0 ? (
                                        <ul className="list-none text-right">
                                          {match.judgeIds.map((jid: string, jIdx: number) => {
                                            const jName = getJudges().find((j: any) => j.id === jid)?.name || "Judge";
                                            return <li key={jid}>{jIdx + 1}. {jName}</li>;
                                          })}
                                        </ul>
                                      ) : (
                                        "None assigned"
                                      )}
                                    </span>
                                  </div>
                                  {match.gloveSize && (
                                    <div className="flex justify-between">
                                      <span className="text-slate-500 font-medium">Gloves:</span>
                                      <span className="text-slate-800 font-semibold">{match.gloveSize} ({match.gloveBrand})</span>
                                    </div>
                                  )}
                                  {match.isChampionshipBout && (
                                    <div className="flex justify-between items-start">
                                      <span className="text-slate-500 font-medium">Championship:</span>
                                      <span className="text-amber-700 font-extrabold text-right max-w-[140px] truncate" title={match.championshipTitleName}>
                                        {match.championshipTitleName || "KKF Title"}
                                      </span>
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                          )}
                          
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
                  );
                })}
              </div>
            )}
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
          <div className={clsx(
            "bg-white rounded-2xl p-6 md:p-8 w-full border border-slate-100 shadow-xl transition-all duration-300",
            selectedMatchForOfficials ? "max-w-md" : "max-w-4xl"
          )}>
            <h3 className="text-lg font-extrabold text-slate-900 mb-4 tracking-tight uppercase">Assign Officials</h3>
            
            {/* Batch Grid Officials Assignment */}
            {!selectedMatchForOfficials ? (
              <div className="space-y-4 mb-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
                  <p className="text-xs font-semibold text-slate-500">
                    Assign a referee and 3 judges for each of the {batch.matches.length} fights.
                  </p>
                  <button 
                    onClick={handleAutoFillOfficials}
                    className="px-3.5 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-700 font-extrabold text-[10px] uppercase tracking-wider rounded-xl border border-amber-200/50 transition-colors shadow-sm self-end sm:self-auto"
                  >
                    ⚡ Copy Match 1 to All
                  </button>
                </div>
                
                <div className="max-h-[380px] overflow-y-auto pr-1 space-y-4">
                  {batch.matches.map((m: any, index: number) => {
                    const refereeId = matchOfficials[m.id]?.refereeId || "";
                    const judgeIds = matchOfficials[m.id]?.judgeIds || [];
                    
                    return (
                      <div key={m.id} className="p-4 bg-slate-50 rounded-xl border border-slate-200/80 space-y-3">
                        <div className="flex items-center justify-between border-b border-slate-200/40 pb-2">
                          <span className="text-[10px] font-extrabold text-[#0A3D91] bg-[#0A3D91]/10 px-2.5 py-0.5 rounded-lg uppercase tracking-wide">
                            Fight #{index + 1}
                          </span>
                          <span className="text-xs font-extrabold text-slate-800">
                            {m.fighterA.name} vs {m.fighterB.name}
                          </span>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                          {/* Referee */}
                          <div>
                            <label className="block text-[9px] font-extrabold text-slate-400 uppercase tracking-wider mb-1">Referee</label>
                            <select
                              value={refereeId}
                              onChange={(e) => updateMatchOfficialState(m.id, "refereeId", e.target.value)}
                              className="w-full text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-lg p-2 focus:border-primary focus:outline-none"
                            >
                              <option value="">Select...</option>
                              {getReferees().filter(r => r.status === "Available").map(referee => (
                                <option key={referee.id} value={referee.id}>
                                  {referee.name} ({referee.grade})
                                </option>
                              ))}
                            </select>
                          </div>

                          {/* Judge 1 */}
                          <div>
                            <label className="block text-[9px] font-extrabold text-slate-400 uppercase tracking-wider mb-1">Judge 1</label>
                            <select
                              value={judgeIds[0] || ""}
                              onChange={(e) => {
                                const copy = [...judgeIds];
                                copy[0] = e.target.value;
                                updateMatchOfficialState(m.id, "judgeIds", copy);
                              }}
                              className="w-full text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-lg p-2 focus:border-primary focus:outline-none"
                            >
                              <option value="">Select...</option>
                              {getFilteredJudgesForSlot(m.id, 0).map(judge => (
                                <option key={judge.id} value={judge.id}>
                                  {judge.name} ({judge.grade})
                                </option>
                              ))}
                            </select>
                          </div>

                          {/* Judge 2 */}
                          <div>
                            <label className="block text-[9px] font-extrabold text-slate-400 uppercase tracking-wider mb-1">Judge 2</label>
                            <select
                              value={judgeIds[1] || ""}
                              onChange={(e) => {
                                const copy = [...judgeIds];
                                copy[1] = e.target.value;
                                updateMatchOfficialState(m.id, "judgeIds", copy);
                              }}
                              className="w-full text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-lg p-2 focus:border-primary focus:outline-none"
                            >
                              <option value="">Select...</option>
                              {getFilteredJudgesForSlot(m.id, 1).map(judge => (
                                <option key={judge.id} value={judge.id}>
                                  {judge.name} ({judge.grade})
                                </option>
                              ))}
                            </select>
                          </div>

                          {/* Judge 3 */}
                          <div>
                            <label className="block text-[9px] font-extrabold text-slate-400 uppercase tracking-wider mb-1">Judge 3</label>
                            <select
                              value={judgeIds[2] || ""}
                              onChange={(e) => {
                                const copy = [...judgeIds];
                                copy[2] = e.target.value;
                                updateMatchOfficialState(m.id, "judgeIds", copy);
                              }}
                              className="w-full text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-lg p-2 focus:border-primary focus:outline-none"
                            >
                              <option value="">Select...</option>
                              {getFilteredJudgesForSlot(m.id, 2).map(judge => (
                                <option key={judge.id} value={judge.id}>
                                  {judge.name} ({judge.grade})
                                </option>
                              ))}
                            </select>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : (
              // Single Match Officials Assignment Form
              <div className="space-y-4 mb-6">
                <div className="p-4 bg-primary/5 border border-primary/10 rounded-xl">
                  <p className="text-xs font-semibold text-primary">
                    Assigning officials to specific match
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
            )}
            
            <div className="flex items-center gap-3 border-t border-slate-100 pt-5">
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


    </div>
  </div>
  );
  } catch (err: any) {
    console.error("Render error in BatchDetail:", err);
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="text-center p-8 bg-white rounded-2xl border border-slate-200/80 shadow-md max-w-md w-full">
          <AlertCircle className="w-12.5 h-12.5 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-extrabold text-slate-900 mb-2 tracking-tight">Something Went Wrong</h1>
          <p className="text-sm text-slate-600 mb-6 font-medium">
            An error occurred while rendering the batch details. This might be due to missing or invalid data format.
          </p>
          <pre className="text-left bg-slate-50 p-4 rounded-xl text-xs text-red-600 overflow-auto max-h-40 mb-6 font-mono border border-slate-200">
            {err.message || String(err)}
          </pre>
          <button
            onClick={() => navigate("/home/program?tab=matches")}
            className="btn-primary w-full py-2.5 font-semibold uppercase tracking-wider text-xs rounded-xl shadow-md"
          >
            Back to Matches
          </button>
        </div>
      </div>
    );
  }
}