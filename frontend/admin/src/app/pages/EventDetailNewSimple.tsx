import { useState, useMemo, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router";
import { 
  ArrowLeft, Edit, MapPin, Calendar, 
  CheckCircle, Shield, Plus, Eye,
  ChevronDown, ChevronUp, Users, 
  AlertCircle, Trash2, Send, Clock,
  Tv, Trophy, XCircle, Download,
  Building2, CalendarDays, Ban, DollarSign, User,
  ArrowUp, ArrowDown, Sparkles
, Save } from "lucide-react";
import { api } from "../utils/api";
import { usePermissions } from "../hooks/usePermissions";
import { EventStatusBadge } from "../components/EventStatusBadge";
import { EventNextSteps } from "../components/EventNextSteps";
import { clsx } from "clsx";
import { toast } from "sonner";
import { GLOVE_SIZES } from "../data/masterData";

export function EventDetailNew() {
  const { id } = useParams();
  const navigate = useNavigate();
  const permissions = usePermissions();
  const [expandedBatches, setExpandedBatches] = useState<Set<string>>(new Set());
  
  const [event, setEvent] = useState<any>(null);
  const [eventBatches, setEventBatches] = useState<any[]>([]);
  const [broadcastStations, setBroadcastStations] = useState<any[]>([]);
  const [sponsors, setSponsors] = useState<any[]>([]);
  const [fighters, setFighters] = useState<any[]>([]);
  const [champions, setChampions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Left-rail week selection
  const [selectedBatchId, setSelectedBatchId] = useState<string | null>(null);

  // In-page batch and match creation states
  const [showAddBatchModal, setShowAddBatchModal] = useState(false);
  const [newBatchName, setNewBatchName] = useState("");
  const [newBatchWeekNumber, setNewBatchWeekNumber] = useState(1);
  const [newBatchDate, setNewBatchDate] = useState("");
  const [newBatchPhase, setNewBatchPhase] = useState("Quarter-Finals");

  const [showAddMatchModal, setShowAddMatchModal] = useState(false);
  const [matchForm, setMatchForm] = useState({
    weightClass: 70,
    rounds: 5,
    roundTime: 3,
    knockdownLimit: 3,
    gloveSize: "8oz",
    gloveBrand: "Twins Special BGVL-3",
    isTitleMatch: false,
    championshipId: "",
    fighterAId: "",
    fighterBId: "",
  });

  // Collapsible inline forms
  const [showEditEvent, setShowEditEvent] = useState(false);
  const [showApprovalModal, setShowApprovalModal] = useState(false);
  const [showRejectionModal, setShowRejectionModal] = useState(false);
  const [showCancelEvent, setShowCancelEvent] = useState(false);
  
  // Form States
  const [editEventName, setEditEventName] = useState("");
  const [editEventDate, setEditEventDate] = useState("");
  const [editEventLocation, setEditEventLocation] = useState("");
  const [editEventOrganizer, setEditEventOrganizer] = useState("");
  const [editBroadcastStationId, setEditBroadcastStationId] = useState("");
  const [editMainSponsorId, setEditMainSponsorId] = useState("");
  const [editEventStatus, setEditEventStatus] = useState("");
  const [editEventImage, setEditEventImage] = useState("");
  
  const [approvalComments, setApprovalComments] = useState("");
  const [rejectionReason, setRejectionReason] = useState("");
  const [cancelReason, setCancelReason] = useState("");

  const { canEditEvent } = permissions;

  const availableFighters = useMemo(() => {
    const selectedWeight = matchForm.weightClass;
    return fighters.filter(f => {
      // Fighters whose weight is within 3kg of match agreed weight
      const diff = Math.abs(f.weight - selectedWeight);
      return diff <= 3;
    });
  }, [fighters, matchForm.weightClass]);

  const availableChampions = useMemo(() => {
    return champions.filter(c => c.weightClass === matchForm.weightClass && c.status === "Active");
  }, [champions, matchForm.weightClass]);

  const handleChampionshipChange = (champId: string) => {
    const champ = champions.find(c => c.id === champId);
    setMatchForm(prev => ({
      ...prev,
      championshipId: champId,
      fighterAId: champ && champ.currentHolderId ? champ.currentHolderId : prev.fighterAId
    }));
  };

  useEffect(() => {
    if (id) {
      loadData();
    }
  }, [id]);

  const loadData = async () => {
    setLoading(true);
    try {
      const e = await api.events.get(id!);
      if (e) {
        // Format DATE fields to YYYY-MM-DD
        const formatDateStr = (d: string) => {
          if (!d) return "";
          return d.split("T")[0];
        };
        
        const mappedEvent = {
          ...e,
          date: formatDateStr(e.date),
          endDate: formatDateStr(e.end_date),
          kkfStatus: e.status, // map status directly to kkfStatus
          organizer: e.organizer_name || "KKF Organizer",
          eventType: e.event_type || "one-off",
        };
        setEvent(mappedEvent);

        const allStations = await api.settings.listBroadcastStations();
        setBroadcastStations(allStations);
        
        const allSponsors = await api.settings.listSponsors();
        setSponsors(allSponsors);

        const fightersData = await api.fighters.list();
        const mappedFighters = (fightersData || []).map((f: any) => ({
          ...f,
          weight: parseFloat(f.currentWeight || f.current_weight) || 0,
          gym: f.clubName || f.club_name || "Independent",
        }));
        setFighters(mappedFighters);

        const championsData = await api.champions.list();
        const mappedChampions = (championsData || []).map((c: any) => ({
          ...c,
          titleName: c.title_name,
          weightClass: parseFloat(c.weight_class) || 0,
          currentHolderName: c.current_holder_name_db || c.current_holder_name || "Vacant",
          status: c.status,
        }));
        setChampions(mappedChampions);

        // Load sub-events (batches)
        const allBatches = await api.batches.list();
        const filteredBatches = allBatches.filter((b: any) => b.event_id === id);

        // Load matches to build nested matches list
        const allMatches = await api.matches.list();

        const mappedBatches = filteredBatches.map((b: any) => {
          const batchMatches = allMatches
            .filter((m: any) => m.sub_event_id === b.id)
            .map((m: any, idx: number) => {
              const isWinnerA = m.winner_id === m.fighter_a_id;
              const isWinnerB = m.winner_id === m.fighter_b_id;
              let winnerValue = "";
              if (m.winner_id) {
                winnerValue = isWinnerA ? "fighterA" : "fighterB";
              }
              return {
                id: m.id,
                matchNumber: `Bout ${idx + 1}`,
                status: m.status,
                rounds: m.rounds,
                agreedWeight: `${m.agreed_weight} kg`,
                winner: winnerValue,
                winnerMethod: m.winner_method,
                isChampionshipBout: !!(m.isTitleMatch || m.is_title_match),
                championshipTitleName: m.championshipTitleName || (m.championship ? m.championship.title_name : null),
                fighterA: {
                  id: m.fighter_a_id,
                  name: m.fighter_a_name,
                  image: m.fighter_a_image,
                  record: m.fighter_a_record,
                  gym: m.club_a_name
                },
                fighterB: {
                  id: m.fighter_b_id,
                  name: m.fighter_b_name,
                  image: m.fighter_b_image,
                  record: m.fighter_b_record,
                  gym: m.club_b_name
                }
              };
            });

          return {
            id: b.id,
            batchNumber: b.batch_number || `BATCH-${b.week_number}`,
            name: b.name,
            date: b.date ? new Date(b.date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "TBD",
            rawDate: b.date ? formatDateStr(b.date) : "",
            weekNumber: b.week_number || 1,
            status: b.status,
            phase: b.phase || "Quarter-Finals",
            matches: batchMatches
          };
        });

        // Sort batches by weekNumber
        mappedBatches.sort((a, b) => a.weekNumber - b.weekNumber);

        setEventBatches(mappedBatches);

        // Pre-select first batch if not already selected
        if (mappedBatches.length > 0) {
          setSelectedBatchId(prev => {
            const exists = mappedBatches.some(x => x.id === prev);
            return exists ? prev : mappedBatches[0].id;
          });
        }
      }
    } catch (err: any) {
      toast.error("Failed to load event details: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSwapOrder = async (batch: any, index: number, direction: "up" | "down") => {
    const targetIdx = direction === "up" ? index - 1 : index + 1;
    if (targetIdx < 0 || targetIdx >= batch.matches.length) return;
    
    const matchA = batch.matches[index];
    const matchB = batch.matches[targetIdx];
    
    try {
      await api.matches.update(matchA.id, { sortOrder: targetIdx + 1 });
      await api.matches.update(matchB.id, { sortOrder: index + 1 });
      toast.success("Bout order updated successfully");
      loadData();
    } catch (err: any) {
      toast.error("Failed to reorder bouts: " + err.message);
    }
  };

  const handleCreateBatch = async () => {
    if (!newBatchName.trim()) {
      toast.error("Please enter a week/phase name");
      return;
    }
    try {
      const payload = {
        eventId: id,
        name: newBatchName,
        weekNumber: newBatchWeekNumber,
        date: newBatchDate || event.date,
        phase: newBatchPhase,
        status: "Draft"
      };
      const res = await api.batches.create(payload);
      toast.success("Week/Phase created successfully!");
      setShowAddBatchModal(false);
      if (res && res.id) {
        setSelectedBatchId(res.id);
      }
      loadData();
    } catch (err: any) {
      toast.error("Failed to create week: " + err.message);
    }
  };

  const handleCreateMatchSubmit = async () => {
    if (!matchForm.fighterAId || !matchForm.fighterBId) {
      toast.error("Please select both fighters");
      return;
    }
    if (matchForm.fighterAId === matchForm.fighterBId) {
      toast.error("Fighter A and Fighter B cannot be the same person");
      return;
    }
    
    const currentBatch = eventBatches.find(b => b.id === selectedBatchId) || eventBatches[0];
    if (!currentBatch) {
      toast.error("Please create a Week/Phase first");
      return;
    }

    try {
      const payload = {
        eventId: id,
        subEventId: currentBatch.id,
        fighterAId: matchForm.fighterAId,
        fighterBId: matchForm.fighterBId,
        rounds: matchForm.rounds,
        roundTime: 3,
        knockdownLimit: 3,
        agreedWeight: matchForm.weightClass,
        gloveSize: matchForm.gloveSize,
        gloveBrand: matchForm.gloveBrand,
        status: "Scheduled",
        isTitleMatch: matchForm.isTitleMatch,
        championshipId: matchForm.isTitleMatch ? matchForm.championshipId : null,
        sortOrder: currentBatch.matches.length + 1
      };
      await api.matches.create(payload);
      toast.success("Match scheduled successfully!");
      setShowAddMatchModal(false);
      setMatchForm({
        weightClass: 70,
        rounds: 5,
        roundTime: 3,
        knockdownLimit: 3,
        gloveSize: "8oz",
        gloveBrand: "Twins Special BGVL-3",
        isTitleMatch: false,
        championshipId: "",
        fighterAId: "",
        fighterBId: "",
      });
      loadData();
    } catch (err: any) {
      toast.error("Failed to schedule match: " + err.message);
    }
  };

  const handleDeleteMatch = async (matchId: string) => {
    if (!window.confirm("Are you sure you want to delete this match?")) return;
    try {
      await api.matches.delete(matchId);
      toast.success("Match deleted successfully");
      loadData();
    } catch (err: any) {
      toast.error("Failed to delete match: " + err.message);
    }
  };

  const getFighterWarning = (fighterId: string): string | null => {
    const f = fighters.find(x => x.id === fighterId);
    if (!f) return null;
    
    if (f.status === "Suspended" || f.medicalSuspensionUntil || f.medical_suspension_until) {
      const dateStr = f.medicalSuspensionUntil || f.medical_suspension_until;
      if (dateStr && new Date(dateStr) > new Date()) {
        return `⚠️ Fighter is medically suspended until ${new Date(dateStr).toLocaleDateString()}`;
      }
      return "⚠️ Fighter has an active suspension status";
    }

    let bookingCount = 0;
    for (const b of eventBatches) {
      for (const m of b.matches) {
        if (m.fighterA?.id === fighterId || m.fighterB?.id === fighterId) {
          bookingCount++;
        }
      }
    }
    if (bookingCount > 0) {
      return `⚠️ Fighter is already scheduled for ${bookingCount} other bout(s) in this event`;
    }

    return null;
  };


  const broadcastStation = useMemo(() => {
    if (!event || !event.broadcast_station_id) return null;
    return broadcastStations.find(bs => bs.id === event.broadcast_station_id);
  }, [event, broadcastStations]);

  const mainSponsor = useMemo(() => {
    if (!event || !event.main_sponsor_id) return null;
    return sponsors.find(s => s.id === event.main_sponsor_id);
  }, [event, sponsors]);

  // Calculate event stats
  const eventStats = useMemo(() => {
    const totalMatches = eventBatches.reduce((sum, b) => sum + b.matches.length, 0);
    const completedMatches = eventBatches.reduce((sum, b) => 
      sum + b.matches.filter(m => m.status === "Completed").length, 0
    );
    const championshipMatches = eventBatches.reduce((sum, b) => 
      sum + b.matches.filter(m => m.isChampionshipBout).length, 0
    );
    
    return {
      totalBatches: eventBatches.length,
      totalMatches,
      completedMatches,
      pendingMatches: totalMatches - completedMatches,
      championshipMatches
    };
  }, [eventBatches]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-primary"></div>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="text-center">
          <h2 className="text-xl font-bold text-foreground">Event Not Found</h2>
          <p className="text-sm text-muted-foreground mt-1">The requested event could not be loaded.</p>
          <Link to="/home/events" className="btn-secondary mt-4 inline-flex items-center gap-1.5 py-2 px-4 text-xs font-semibold uppercase">
            <ArrowLeft className="w-4 h-4" />
            Back to Events
          </Link>
        </div>
      </div>
    );
  }

  // Validation checks
  const validationChecks = [
    { id: 1, label: "Event has a name", passed: !!event.name },
    { id: 2, label: "Event has a date", passed: !!event.date },
    { id: 3, label: "Event has a location", passed: !!event.location },
    { id: 4, label: "Event has at least one fight card", passed: eventBatches.length > 0 },
    { id: 5, label: "All fight cards have at least one match", passed: eventBatches.every(b => b.matches.length > 0) },
    { id: 6, label: "Event has organizer information", passed: !!event.organizer },
    { id: 7, label: "Event has broadcast station", passed: !!event.broadcast_station_id },
    { id: 8, label: "Event has main sponsor", passed: !!event.main_sponsor_id },
  ];

  const allChecksPassed = validationChecks.every(check => check.passed);
  const canSubmitForApproval = event.kkfStatus === "Draft" && allChecksPassed;

  const getBadgeStatus = (status: string) => {
    switch (status) {
      case "Pending KKF Approval": return "Submitted";
      case "Ongoing": return "Live";
      default: return status as any;
    }
  };

  const toggleBatchExpansion = (batchId: string) => {
    const newExpanded = new Set(expandedBatches);
    if (newExpanded.has(batchId)) {
      newExpanded.delete(batchId);
    } else {
      newExpanded.add(batchId);
    }
    setExpandedBatches(newExpanded);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setEditEventImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleEditEvent = () => {
    setEditEventName(event.name);
    setEditEventDate(event.date);
    setEditEventLocation(event.location);
    setEditEventOrganizer(event.organizer || "");
    setEditBroadcastStationId(event.broadcast_station_id || "");
    setEditMainSponsorId(event.main_sponsor_id || "");
    setEditEventStatus(event.kkfStatus || "Draft");
    setEditEventImage(event.image || "");
    
    setShowEditEvent(true);
    setShowApprovalModal(false);
    setShowRejectionModal(false);
    setShowCancelEvent(false);

    setTimeout(() => {
      const el = document.getElementById("edit-event-inline-panel");
      if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 100);
  };

  const handleSaveEdit = async () => {
    try {
      await api.events.update(id!, {
        name: editEventName,
        date: editEventDate,
        location: editEventLocation,
        broadcastStationId: editBroadcastStationId || null,
        mainSponsorId: editMainSponsorId || null,
        status: editEventStatus,
        image: editEventImage || null,
      });
      toast.success("Event updated successfully!");
      setShowEditEvent(false);
      loadData();
    } catch (err: any) {
      toast.error("Failed to update event: " + err.message);
    }
  };

  const handleSubmitForApproval = async () => {
    if (!allChecksPassed) {
      toast.error("Cannot submit - please complete all requirements");
      return;
    }
    try {
      await api.events.update(id!, { status: "Pending KKF Approval" });
      toast.success("Event submitted for KKF approval!");
      loadData();
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const handleConfirmApproval = async () => {
    try {
      await api.events.update(id!, { status: "Approved" });
      toast.success("Event approved successfully!");
      setShowApprovalModal(false);
      loadData();
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const handleConfirmRejection = async () => {
    if (!rejectionReason) return;
    try {
      await api.events.update(id!, { status: "Draft" });
      toast.error("Event proposal rejected.");
      setShowRejectionModal(false);
      loadData();
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const handleConfirmCancel = async () => {
    if (!cancelReason) return;
    try {
      await api.events.update(id!, { status: "Cancelled" });
      toast.error("Event cancelled successfully.");
      setShowCancelEvent(false);
      loadData();
    } catch (err: any) {
      toast.error(err.message);
    }
  };



  const handlePublish = async () => {
    try {
      await api.events.update(id!, { status: "Published" });
      toast.success("Event published — fans can now see it");
      loadData();
    } catch (err: any) {
      toast.error(err?.message || "Could not publish the event.");
    }
  };

  const handleCheckAction = (checkId: number) => {
    if (checkId === 4) {
      setShowAddBatchModal(true);
    } else if (checkId === 5) {
      if (eventBatches.length === 0) {
        setShowAddBatchModal(true);
        toast.info("Create a fight card first before adding matches");
      } else {
        navigate(`/home/matches/${eventBatches[0].id}/create-match`);
      }
    } else {
      handleEditEvent();
      setTimeout(() => {
        let focusId = "";
        if (checkId === 1) focusId = "edit-name-input";
        else if (checkId === 2) focusId = "edit-date-input";
        else if (checkId === 3) focusId = "edit-location-input";
        else if (checkId === 6) focusId = "edit-organizer-input";
        else if (checkId === 7) focusId = "edit-broadcaster-input";
        else if (checkId === 8) focusId = "edit-sponsor-input";
        
        const input = document.getElementById(focusId);
        if (input) input.focus();
      }, 150);
    }
  };

  const isEventApprovedOrOngoing = event.kkfStatus === "Approved" || event.kkfStatus === "Ongoing";

  // Stepper steps configuration
  const timelineSteps = [
    { key: "Draft", label: "Draft", desc: "Setting up event details" },
    { key: "Published", label: "Published", desc: "Sanctioned & Matchmaking" },
    { key: "Ongoing", label: "In Progress", desc: "Live event broadcast" },
    { key: "Completed", label: "Completed", desc: "Results finalized" }
  ];

  const getStepIndex = (status: string) => {
    if (status === "Draft") return 0;
    if (status === "Published" || status === "Approved") return 1;
    if (status === "Ongoing") return 2;
    if (status === "Completed") return 3;
    return 0;
  };

  const currentStepIdx = getStepIndex(event.kkfStatus);

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto flex flex-col min-h-full animate-fadeIn">
      {/* Header */}
      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div className="flex items-center gap-4">
          <Link
            to="/home/events"
            className="p-2.5 bg-white hover:bg-muted text-primary border border-border/80 rounded-xl transition-all active:scale-95 shadow-sm"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground">{event.name}</h1>
            <p className="text-sm text-muted-foreground mt-0.5 font-medium flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-secondary shrink-0" />
              <span>{event.location}</span>
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-2.5">
          {canEditEvent && event.kkfStatus !== "Completed" && event.kkfStatus !== "Cancelled" && (
            <button
              onClick={handleEditEvent}
              className="btn-outline inline-flex items-center gap-1.5 py-2 px-4 shadow-sm"
            >
              <Edit className="w-4 h-4" />
              <span>Edit Event</span>
            </button>
          )}
        </div>
      </header>

      {/* Hero Section */}
      <div className="relative h-64 md:h-80 rounded-2xl overflow-hidden border border-border/60 shadow-sm mb-8 bg-gradient-to-br from-primary via-primary/95 to-[#051C42]">
        {event.image && (
          <>
            <img 
              src={event.image} 
              alt={event.name}
              className="absolute inset-0 w-full h-full object-cover opacity-20"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent" />
          </>
        )}
        
        <div className="absolute inset-0 flex flex-col justify-end p-6 md:p-8 z-10">
          <div className="flex items-center gap-2 mb-3">
            <div className="badge-premium badge-emerald text-white bg-emerald-600/90 border-emerald-500/50 shadow-md">
              <span className="badge-dot bg-white" />
              <span className="capitalize font-bold text-xs">{event.status}</span>
            </div>
            {event.hasSubEvents && (
              <span className="badge-premium badge-amber text-amber-900 bg-amber-400/90 border-amber-300/50 shadow-md">
                <span className="badge-dot bg-amber-900" />
                Multi-Week
              </span>
            )}
          </div>
          <h2 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight drop-shadow-md mb-4 leading-tight">
            {event.name}
          </h2>
          
          {/* Hero Stats Subgrid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 max-w-4xl w-full">
            <div className="bg-white/10 backdrop-blur-md border border-white/10 rounded-xl p-3 text-center shadow-sm">
              <div className="text-[10px] font-bold text-white/70 uppercase tracking-wider mb-0.5">Start Date</div>
              <div className="text-sm font-semibold text-white truncate">{event.date}</div>
            </div>
            <div className="bg-white/10 backdrop-blur-md border border-white/10 rounded-xl p-3 text-center shadow-sm">
              <div className="text-[10px] font-bold text-white/70 uppercase tracking-wider mb-0.5">Venue Location</div>
              <div className="text-sm font-semibold text-white truncate">{event.location}</div>
            </div>
            <div className="bg-white/10 backdrop-blur-md border border-white/10 rounded-xl p-3 text-center shadow-sm">
              <div className="text-[10px] font-bold text-white/70 uppercase tracking-wider mb-0.5">Organizer</div>
              <div className="text-sm font-semibold text-white truncate">{event.organizer || "Kun Khmer Federation"}</div>
            </div>
            <div className="bg-white/10 backdrop-blur-md border border-white/10 rounded-xl p-3 text-center shadow-sm">
              <div className="text-[10px] font-bold text-white/70 uppercase tracking-wider mb-0.5">Broadcast Station</div>
              <div className="text-sm font-semibold text-white truncate">{broadcastStation?.name || "Digital Stream"}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Timeline Stepper */}
      <div className="card-premium p-6 mb-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 md:gap-4 relative">
          {/* Background Connecting Line */}
          <div className="hidden md:block absolute left-8 right-8 top-[18px] h-0.5 bg-muted -z-0">
            <div 
              className="h-full bg-primary transition-all duration-500" 
              style={{ width: `${(currentStepIdx / (timelineSteps.length - 1)) * 100}%` }}
            />
          </div>

          {timelineSteps.map((step, idx) => {
            const isCompleted = idx < currentStepIdx;
            const isActive = idx === currentStepIdx;
            const isUpcoming = idx > currentStepIdx;

            let iconNode;
            if (isCompleted) {
              iconNode = <CheckCircle className="w-5 h-5 text-white" />;
            } else {
              iconNode = <span className="font-bold text-sm">{idx + 1}</span>;
            }

            let circleClass = "";
            if (isCompleted) {
              circleClass = "bg-primary text-white border-2 border-primary shadow-md shadow-primary/10";
            } else if (isActive) {
              circleClass = "bg-white text-primary border-4 border-primary ring-4 ring-primary/10 font-bold animate-pulse shadow-md";
            } else {
              circleClass = "bg-muted text-muted-foreground border-2 border-border/80";
            }

            return (
              <div key={step.key} className="flex flex-row md:flex-col items-center gap-4 md:gap-2 flex-1 z-10 w-full md:w-auto">
                {/* Circle Node */}
                <div className={`w-9 h-9 rounded-full flex items-center justify-center transition-all duration-300 ${circleClass} shrink-0`}>
                  {iconNode}
                </div>

                {/* Label and Description */}
                <div className="text-left md:text-center">
                  <div className={clsx(
                    "text-xs font-bold uppercase tracking-wider",
                    isActive ? "text-primary" : isCompleted ? "text-slate-800" : "text-muted-foreground"
                  )}>
                    {step.label}
                  </div>
                  <div className="text-[11px] text-muted-foreground font-medium hidden sm:block mt-0.5">
                    {step.desc}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {event.kkfStatus === "Cancelled" && (
          <div className="mt-6 p-4 bg-red-50/40 border border-red-100 rounded-xl flex items-center gap-3 text-red-800 text-sm font-semibold">
            <Ban className="w-5 h-5 text-destructive shrink-0" />
            <div>
              <span className="font-bold">This event has been cancelled:</span> {event.kkfComments || "No reason provided."}
            </div>
          </div>
        )}

        {event.kkfStatus === "Draft" && event.kkfComments && (
          <div className="mt-6 p-4 bg-red-50/40 border border-red-100 rounded-xl flex items-center gap-3 text-red-800 text-sm font-semibold">
            <AlertCircle className="w-5 h-5 text-destructive shrink-0" />
            <div>
              <span className="font-bold">KKF Rejection Feedback:</span> {event.kkfComments}
            </div>
          </div>
        )}
      </div>

      <EventNextSteps
        event={event}
        cards={eventBatches}
        canEdit={Boolean(canEditEvent)}
        onEditDetails={handleEditEvent}
        onAddFightCard={() => setShowAddBatchModal(true)}
        onPublish={handlePublish}
      />

      {/* Inline Action Forms */}
      {showEditEvent && (
        <div id="edit-event-inline-panel" className="card-premium p-6 sm:p-8 space-y-6 mb-8 animate-fadeIn">
          <div className="flex items-center gap-3 pb-4 border-b border-border/60">
            <div className="w-10 h-10 bg-primary/10 text-primary rounded-xl flex items-center justify-center">
              <Edit className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-foreground uppercase tracking-tight">Edit Event Information</h3>
              <p className="text-xs text-muted-foreground">Update details, venue, broadcaster, and sponsors</p>
            </div>
          </div>

          {isEventApprovedOrOngoing && (
            <div className="p-4 bg-amber-50 border border-amber-100 text-amber-800 rounded-xl text-xs font-semibold flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-amber-600" />
              <span>Limited editing allowed because the event is already approved or ongoing.</span>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-xs font-semibold text-muted-foreground mb-2 uppercase tracking-wide">Event Name *</label>
              <input
                id="edit-name-input"
                type="text"
                value={editEventName}
                onChange={(e) => setEditEventName(e.target.value)}
                disabled={isEventApprovedOrOngoing}
                className="input-premium py-2.5 disabled:bg-slate-50 disabled:text-muted-foreground"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-muted-foreground mb-2 uppercase tracking-wide">Organizer *</label>
              <input
                id="edit-organizer-input"
                type="text"
                value={editEventOrganizer}
                onChange={(e) => setEditEventOrganizer(e.target.value)}
                disabled={isEventApprovedOrOngoing}
                className="input-premium py-2.5 disabled:bg-slate-50 disabled:text-muted-foreground"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-muted-foreground mb-2 uppercase tracking-wide">Event Date *</label>
              <input
                id="edit-date-input"
                type="date"
                value={editEventDate}
                onChange={(e) => setEditEventDate(e.target.value)}
                className="input-premium py-2.5 cursor-pointer"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-muted-foreground mb-2 uppercase tracking-wide">Venue Location *</label>
              <input
                id="edit-location-input"
                type="text"
                value={editEventLocation}
                onChange={(e) => setEditEventLocation(e.target.value)}
                disabled={isEventApprovedOrOngoing}
                className="input-premium py-2.5 disabled:bg-slate-50 disabled:text-muted-foreground"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-muted-foreground mb-2 uppercase tracking-wide">Broadcast Station</label>
              <select
                id="edit-broadcaster-input"
                value={editBroadcastStationId}
                onChange={(e) => setEditBroadcastStationId(e.target.value)}
                className="input-premium py-2.5 cursor-pointer"
              >
                <option value="">Select Broadcast Station...</option>
                {broadcastStations.map((station) => (
                  <option key={station.id} value={station.id}>
                    {station.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-muted-foreground mb-2 uppercase tracking-wide">Main Sponsor</label>
              <select
                id="edit-sponsor-input"
                value={editMainSponsorId}
                onChange={(e) => setEditMainSponsorId(e.target.value)}
                className="input-premium py-2.5 cursor-pointer"
              >
                <option value="">Select Main Sponsor...</option>
                {sponsors.map((sponsor) => (
                  <option key={sponsor.id} value={sponsor.id}>
                    {sponsor.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-muted-foreground mb-2 uppercase tracking-wide">Event Status *</label>
              <select
                id="edit-status-input"
                value={editEventStatus}
                onChange={(e) => setEditEventStatus(e.target.value)}
                className="input-premium py-2.5 cursor-pointer font-bold text-slate-850"
              >
                <option value="Draft">Draft (Hidden from Public)</option>
                <option value="Published">Published (Active / Matchmaking)</option>
                <option value="Ongoing">Ongoing (Live broadcast in progress)</option>
                <option value="Completed">Completed (Event results finalized)</option>
                <option value="Cancelled">Cancelled</option>
              </select>
            </div>

            <div className="md:col-span-2 border-t border-border/40 pt-4 space-y-4">
              <div>
                <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wide mb-1.5">
                  Event Cover Banner
                </label>
                <p className="text-xs text-muted-foreground mb-3">
                  Upload a custom event poster or banner file (JPEG, PNG, WebP) to display on public listings.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                <div className="md:col-span-2">
                  <label className="block text-[10px] font-bold text-muted-foreground uppercase tracking-wide mb-2">
                    Upload Banner Image File
                  </label>
                  <div className="border-2 border-dashed border-border/80 rounded-2xl p-6 hover:border-primary/50 hover:bg-muted/10 transition-all flex flex-col items-center justify-center text-center relative group cursor-pointer">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileUpload}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                    />
                    <div className="w-12 h-12 bg-primary/5 text-primary rounded-xl flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                      <Save className="w-6 h-6 rotate-180" />
                    </div>
                    <p className="text-xs font-bold text-foreground">Click to upload file</p>
                    <p className="text-[10px] text-muted-foreground mt-1">Supports PNG, JPG, JPEG, or WebP</p>
                  </div>
                </div>

                <div className="md:col-span-1">
                  <label className="block text-[10px] font-bold text-muted-foreground uppercase tracking-wide mb-2 flex justify-between items-center">
                    <span>Cover Banner Preview</span>
                    {editEventImage && (
                      <button
                        type="button"
                        onClick={() => setEditEventImage("")}
                        className="text-[10px] text-red-500 font-bold hover:underline"
                      >
                        Clear
                      </button>
                    )}
                  </label>
                  <div className="aspect-[16/9] w-full bg-slate-900 rounded-xl overflow-hidden border border-border/80 flex items-center justify-center relative group">
                    {editEventImage ? (
                      <>
                        <img
                          src={editEventImage}
                          alt="Banner Preview"
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent pointer-events-none" />
                      </>
                    ) : (
                      <div className="text-center p-3">
                        <span className="text-[10px] font-semibold text-muted-foreground block">No banner uploaded</span>
                        <span className="text-[9px] text-muted-foreground/60 block mt-0.5">Defaults to Standard Arena banner</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-3">
            <button
              onClick={() => setShowEditEvent(false)}
              className="btn-outline px-5 py-2 text-xs uppercase tracking-wider"
            >
              Cancel
            </button>
            <button
              onClick={handleSaveEdit}
              className="btn-primary px-5 py-2 text-xs uppercase tracking-wider"
            >
              Save Changes
            </button>
          </div>
        </div>
      )}

      {/* Main Grid Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Event Details Card */}
        <div className="lg:col-span-2 card-premium p-6 sm:p-8 space-y-6">
          <h2 className="text-lg font-bold text-foreground uppercase tracking-tight mb-4 border-b border-border/60 pb-3">Event Information</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1.5 block">Event Name</label>
              <p className="text-base font-bold text-foreground">{event.name}</p>
            </div>

            <div>
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1.5 block">Status</label>
              <div>
                <EventStatusBadge status={getBadgeStatus(event.kkfStatus)} />
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1.5 block">Date</label>
              <div className="flex items-center gap-2 text-foreground">
                <Calendar className="w-4 h-4 text-primary" />
                <p className="font-semibold text-sm">{event.date}</p>
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1.5 block">Location</label>
              <div className="flex items-center gap-2 text-foreground">
                <MapPin className="w-4 h-4 text-secondary" />
                <p className="font-semibold text-sm">{event.location}</p>
              </div>
            </div>

            {event.organizer && (
              <div>
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1.5 block">Organizer</label>
                <div className="flex items-center gap-2 text-foreground">
                  <Building2 className="w-4 h-4 text-primary" />
                  <p className="font-semibold text-sm">{event.organizer}</p>
                </div>
              </div>
            )}

            {broadcastStation && (
              <div>
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1.5 block">Broadcast Station</label>
                <div className="flex items-center gap-2 text-foreground">
                  <Tv className="w-4 h-4 text-primary" />
                  <p className="font-semibold text-sm">{broadcastStation.logo} {broadcastStation.name}</p>
                </div>
              </div>
            )}

            {mainSponsor && (
              <div>
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1.5 block">Main Sponsor</label>
                <div className="flex items-center gap-2 text-foreground">
                  <DollarSign className="w-4 h-4 text-accent" />
                  <p className="font-semibold text-sm">{mainSponsor.logo} {mainSponsor.name}</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Stats Card */}
        <div className="bg-gradient-to-br from-primary via-primary/95 to-[#051C42] rounded-2xl p-6 sm:p-8 text-white shadow-md space-y-6">
          <h2 className="text-lg font-bold uppercase tracking-tight border-b border-white/10 pb-3">Event Statistics</h2>
          
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3.5 bg-white/10 rounded-xl backdrop-blur-sm border border-white/5 hover:bg-white/15 transition-all">
              <div className="flex items-center gap-3">
                <CalendarDays className="w-5 h-5 text-accent" />
                <span className="font-bold text-sm">Fight cards</span>
              </div>
              <span className="text-xl font-black">{eventStats.totalBatches}</span>
            </div>

            <div className="flex items-center justify-between p-3.5 bg-white/10 rounded-xl backdrop-blur-sm border border-white/5 hover:bg-white/15 transition-all">
              <div className="flex items-center gap-3">
                <Users className="w-5 h-5 text-accent" />
                <span className="font-bold text-sm">Total Matches</span>
              </div>
              <span className="text-xl font-black">{eventStats.totalMatches}</span>
            </div>

            <div className="flex items-center justify-between p-3.5 bg-white/10 rounded-xl backdrop-blur-sm border border-white/5 hover:bg-white/15 transition-all">
              <div className="flex items-center gap-3">
                <CheckCircle className="w-5 h-5 text-green-400" />
                <span className="font-bold text-sm">Completed</span>
              </div>
              <span className="text-xl font-black">{eventStats.completedMatches}</span>
            </div>

            <div className="flex items-center justify-between p-3.5 bg-white/10 rounded-xl backdrop-blur-sm border border-white/5 hover:bg-white/15 transition-all">
              <div className="flex items-center gap-3">
                <Clock className="w-5 h-5 text-orange-400" />
                <span className="font-bold text-sm">Pending</span>
              </div>
              <span className="text-xl font-black">{eventStats.pendingMatches}</span>
            </div>

            <div className="flex items-center justify-between p-3.5 bg-white/10 rounded-xl backdrop-blur-sm border border-white/5 hover:bg-white/15 transition-all">
              <div className="flex items-center gap-3">
                <Trophy className="w-5 h-5 text-accent" />
                <span className="font-bold text-sm">Championships</span>
              </div>
              <span className="text-xl font-black">{eventStats.championshipMatches}</span>
            </div>
          </div>
        </div>
      </div>



      {/* Batches & Matches */}
      <div className="card-premium p-6 sm:p-8 space-y-6">
        <div className="flex items-center justify-between pb-3 border-b border-border/60">
          <h2 className="text-lg font-bold text-foreground uppercase tracking-tight">Fight Cards & Matches</h2>
          
          {canEditEvent && event.kkfStatus !== "Completed" && event.kkfStatus !== "Cancelled" && (
            <button
              onClick={() => {
                setNewBatchDate(event.date || "");
                setShowAddBatchModal(true);
              }}
              className="btn-primary py-1.5 px-3.5 text-xs font-medium uppercase tracking-wider"
            >
              <Plus className="w-4 h-4" />
              Add Fight Card
            </button>
          )}
        </div>

        {eventBatches.length === 0 ? (
          <div className="text-center py-16">
            <CalendarDays className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
            <p className="text-muted-foreground font-semibold text-base mb-1">No fight cards created yet</p>
            <p className="text-muted-foreground/60 text-xs font-medium mb-5">Create your first fight card to start adding matches</p>
            {canEditEvent && event.kkfStatus !== "Completed" && event.kkfStatus !== "Cancelled" && (
              <button
                onClick={() => {
                  setNewBatchDate(event.date || "");
                  setShowAddBatchModal(true);
                }}
                className="btn-primary inline-flex py-2 px-5 text-xs uppercase tracking-wider"
              >
                <Plus className="w-4 h-4" />
                Create First Fight Card
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {eventBatches.map((batch) => {
              const isExpanded = expandedBatches.has(batch.id);
              
              return (
                <div key={batch.id} className="border border-border/60 rounded-xl overflow-hidden">
                  <button
                    onClick={() => toggleBatchExpansion(batch.id)}
                    className="w-full flex items-center justify-between p-4 bg-slate-50 hover:bg-slate-100/80 transition-all text-left"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-primary text-white flex items-center justify-center font-bold text-sm shadow-sm shrink-0">
                        {batch.batchNumber}
                      </div>
                      <div>
                        <h3 className="font-bold text-sm text-foreground uppercase tracking-tight leading-tight">{batch.name}</h3>
                        <div className="flex items-center gap-3 mt-1.5">
                          <span className="text-xs font-medium text-muted-foreground">
                            {batch.matches.length} {batch.matches.length === 1 ? 'match' : 'matches'}
                          </span>
                          <span className="text-xs font-medium text-muted-foreground">•</span>
                          <span className="text-xs font-medium text-muted-foreground">{batch.date}</span>
                        </div>
                      </div>
                    </div>
                    {isExpanded ? (
                      <ChevronUp className="w-5 h-5 text-muted-foreground" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-muted-foreground" />
                    )}
                  </button>

                  {isExpanded && (
                    <div className="p-4 border-t border-border/60 bg-white space-y-4">
                      {batch.matches.length > 0 ? (
                        <div className="space-y-3">
                          {batch.matches.map((match, idx) => {
                            const fAName = match.fighterA?.name || match.fighter1?.name || "Fighter A";
                            const fBName = match.fighterB?.name || match.fighter2?.name || "Fighter B";
                            const fAClub = match.fighterA?.clubName || match.fighterA?.gym || "Independent";
                            const fBClub = match.fighterB?.clubName || match.fighterB?.gym || "Independent";
                            const fARecord = match.fighterA?.record || "0-0-0";
                            const fBRecord = match.fighterB?.record || "0-0-0";
                            const fAGrade = match.fighterA?.grade || "A";
                            const fBGrade = match.fighterB?.grade || "A";

                            // Determine winner name
                            let winnerName = "";
                            if (match.winner) {
                              if (match.winner === 'fighterA') winnerName = fAName;
                              else if (match.winner === 'fighterB') winnerName = fBName;
                              else winnerName = match.winner;
                            }

                            return (
                              <div key={match.id} className="relative group">
                                <Link
                                  to={`/home/match/${match.id}`}
                                  className="block border border-border/60 hover:border-primary/30 rounded-xl p-4 bg-slate-50/40 hover:bg-white transition-all hover:shadow-sm duration-200"
                                >
                                  {/* Card Header Bar */}
                                  <div className="flex items-center justify-between border-b border-border/40 pb-2.5 mb-2.5">
                                    <div className="flex items-center gap-2">
                                      <span className="bg-primary/5 text-primary border border-primary/10 px-2 py-0.5 rounded text-[9px] font-bold font-mono">
                                        Match {idx + 1}
                                      </span>
                                      {match.matchNumber && (
                                        <span className="text-[9px] font-semibold text-muted-foreground font-mono">
                                          {match.matchNumber}
                                        </span>
                                      )}
                                    </div>
                                    
                                    <div className="flex items-center gap-2">
                                      <span className={`badge-premium text-[9px] py-0.5 px-2 ${
                                        match.status === 'Scheduled' || match.status === 'Ready' ? 'badge-blue' :
                                        match.status === 'Completed' ? 'badge-emerald' :
                                        match.status === 'Live' ? 'badge-red animate-pulse' :
                                        'bg-slate-100 text-slate-700 border-slate-200'
                                      }`}>
                                        <span className={`badge-dot ${
                                          match.status === 'Scheduled' || match.status === 'Ready' ? 'bg-blue-500' :
                                          match.status === 'Completed' ? 'bg-emerald-500' :
                                          match.status === 'Live' ? 'bg-red-500' :
                                          'bg-slate-400'
                                        }`} />
                                        {match.status}
                                      </span>
                                      <Eye className="w-3.5 h-3.5 text-muted-foreground group-hover:text-primary transition-colors" />
                                    </div>
                                  </div>

                                  {/* Grid Fight Info */}
                                  <div className="grid grid-cols-[1fr_auto_1fr] gap-4 items-center">
                                    {/* Fighter A */}
                                    <div className="flex items-center gap-2.5 min-w-0">
                                      <img
                                        src={match.fighterA?.image || "https://images.unsplash.com/photo-1549719386-74dfcbf7dbed?w=100"}
                                        alt={fAName}
                                        className="w-10 h-10 rounded-lg object-cover border border-slate-200 shrink-0"
                                      />
                                      <div className="text-left min-w-0">
                                        <div className="flex items-center gap-1.5 mb-1">
                                          <span className="font-bold text-foreground text-xs truncate block">{fAName}</span>
                                          <span className="text-[8px] font-bold px-1.5 py-0.5 bg-slate-100 border border-slate-200 rounded text-muted-foreground uppercase shrink-0">
                                            {fAGrade}
                                          </span>
                                        </div>
                                        <div className="text-[10px] text-muted-foreground font-medium truncate mb-0.5">{fAClub}</div>
                                        <div className="text-[9px] text-muted-foreground/80 font-semibold">{fARecord} record</div>
                                      </div>
                                    </div>

                                    {/* Center Spec Badge */}
                                    <div className="flex flex-col items-center shrink-0">
                                      <span className="text-[9px] font-bold text-secondary px-2 py-0.5 bg-secondary/5 border border-secondary/10 rounded-full font-mono mb-1">
                                        VS
                                      </span>
                                      <div className="text-[9px] text-muted-foreground font-bold text-center leading-normal">
                                        <div>{match.agreedWeight || match.weightClass || "Catchweight"}</div>
                                        <div>{match.rounds}R</div>
                                      </div>
                                    </div>

                                    {/* Fighter B */}
                                    <div className="flex items-center justify-end gap-2.5 min-w-0">
                                      <div className="text-right min-w-0">
                                        <div className="flex items-center justify-end gap-1.5 mb-1">
                                          <span className="text-[8px] font-bold px-1.5 py-0.5 bg-slate-100 border border-slate-200 rounded text-muted-foreground uppercase shrink-0">
                                            {fBGrade}
                                          </span>
                                          <span className="font-bold text-foreground text-xs truncate block">{fBName}</span>
                                        </div>
                                        <div className="text-[10px] text-muted-foreground font-medium truncate mb-0.5">{fBClub}</div>
                                        <div className="text-[9px] text-muted-foreground/80 font-semibold">{fBRecord} record</div>
                                      </div>
                                      <img
                                        src={match.fighterB?.image || "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100"}
                                        alt={fBName}
                                        className="w-10 h-10 rounded-lg object-cover border border-slate-200 shrink-0"
                                      />
                                    </div>
                                  </div>

                                  {/* Championship Bout Gilded Bar */}
                                  {match.isChampionshipBout && (
                                    <div className="mt-3 pt-2 border-t border-dashed border-amber-250 flex items-center justify-center gap-1 text-[10px] font-bold text-amber-700 bg-amber-50/20 rounded-lg py-1 px-2">
                                      <Trophy className="w-3 h-3 text-amber-500 shrink-0" />
                                      <span>CHAMPIONSHIP TITLE BOUT</span>
                                    </div>
                                  )}

                                  {/* Winner Outcome */}
                                  {winnerName && (
                                    <div className="mt-2.5 pt-2.5 border-t border-border/40 flex items-center justify-center">
                                      <div className="flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-[10px] font-semibold text-emerald-700 border border-emerald-250/50 rounded-lg shadow-sm">
                                        <Trophy className="w-3 h-3 text-emerald-600 fill-emerald-100" />
                                        <span>
                                          Winner: {winnerName} ({match.winnerMethod || 'Decision'})
                                        </span>
                                      </div>
                                    </div>
                                  )}
                                </Link>
                                                            {/* Delete match button inside Draft mode */}
                                {canEditEvent && event.kkfStatus !== "Completed" && event.kkfStatus !== "Cancelled" && (
                                  <button
                                    onClick={(e) => {
                                      e.preventDefault();
                                      e.stopPropagation();
                                      handleDeleteMatch(match.id);
                                    }}
                                    className="absolute -top-2 -right-2 p-1.5 bg-red-100 hover:bg-red-200 text-red-600 hover:text-red-700 rounded-full border border-red-200 opacity-0 group-hover:opacity-100 transition-opacity shadow-sm"
                                    title="Delete Match"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      ) : (
                        <div className="text-center py-6 bg-slate-50 rounded-xl border border-dashed border-border/60">
                          <Users className="w-8 h-8 text-muted-foreground/30 mx-auto mb-2" />
                          <p className="text-xs text-muted-foreground font-semibold">No matches added to this fight card yet</p>
                        </div>
                      )}

                      {canEditEvent && event.kkfStatus !== "Completed" && event.kkfStatus !== "Cancelled" && (
                        <div className="mt-4 pt-3 border-t border-border/60 flex justify-between items-center">
                          <button
                            onClick={() => navigate(`/home/matches/${batch.id}/create-match`)}
                            className="btn-primary inline-flex py-1.5 px-3 text-xs font-medium uppercase tracking-wider"
                          >
                            <Plus className="w-3.5 h-3.5" />
                            Add Match to This Fight Card
                          </button>

                          <div className="flex gap-1.5">
                            <button
                              onClick={() => {
                                // Find batch index in eventBatches
                                const idx = eventBatches.findIndex(b => b.id === batch.id);
                                if (idx > 0) {
                                  // swap with previous batch
                                  toast.info("Reordering fight cards...");
                                }
                              }}
                              className="p-1.5 bg-slate-50 hover:bg-slate-100 text-muted-foreground border border-border/60 rounded-lg transition-all"
                              title="Move Fight Card Up"
                            >
                              <ArrowUp className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => {
                                toast.info("Reordering fight cards...");
                              }}
                              className="p-1.5 bg-slate-50 hover:bg-slate-100 text-muted-foreground border border-border/60 rounded-lg transition-all"
                              title="Move Fight Card Down"
                            >
                              <ArrowDown className="w-3.5 h-3.5" />
                            </button>
                          </div>
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

      {/* Create Batch Modal */}
      {showAddBatchModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white rounded-2xl border border-slate-100 shadow-2xl w-full max-w-md overflow-hidden animate-scaleIn">
            <div className="p-6 border-b border-border/60 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                  <CalendarDays className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-foreground uppercase tracking-tight">Create Fight Card</h3>
                  <p className="text-[11px] text-muted-foreground font-medium">Add a new fight card week to this event</p>
                </div>
              </div>
              <button 
                onClick={() => setShowAddBatchModal(false)}
                className="p-1.5 hover:bg-muted text-muted-foreground hover:text-foreground rounded-lg transition-colors"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-foreground mb-1.5 uppercase tracking-wide">Fight Card Name</label>
                <input
                  type="text"
                  value={newBatchName}
                  onChange={(e) => setNewBatchName(e.target.value)}
                  placeholder="e.g. Week 1 - Opening Matches"
                  className="input-premium py-2 bg-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-foreground mb-1.5 uppercase tracking-wide">Week Number</label>
                  <input
                    type="number"
                    value={newBatchWeekNumber}
                    onChange={(e) => setNewBatchWeekNumber(parseInt(e.target.value) || 1)}
                    className="input-premium py-2 bg-white"
                    min="1"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-foreground mb-1.5 uppercase tracking-wide">Phase</label>
                  <select
                    value={newBatchPhase}
                    onChange={(e) => setNewBatchPhase(e.target.value)}
                    className="input-premium py-2 bg-white select-premium"
                  >
                    <option value="Quarter-Finals">Quarter-Finals</option>
                    <option value="Semi-Finals">Semi-Finals</option>
                    <option value="Finals">Finals</option>
                    <option value="Regular Bout">Regular Bout</option>
                    <option value="Special Match">Special Match</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-foreground mb-1.5 uppercase tracking-wide">Fight Card Date</label>
                <input
                  type="date"
                  value={newBatchDate}
                  onChange={(e) => setNewBatchDate(e.target.value)}
                  className="input-premium py-2 bg-white"
                />
              </div>
            </div>

            <div className="p-6 border-t border-border/60 bg-slate-50/50 flex justify-end gap-3">
              <button
                onClick={() => setShowAddBatchModal(false)}
                className="px-4 py-2 rounded-xl border border-border bg-white hover:bg-muted text-foreground text-xs font-semibold uppercase tracking-wider transition-all"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateBatch}
                className="btn-primary py-2 px-5 text-xs font-semibold uppercase tracking-wider"
              >
                Create Fight Card
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Matchmaker / Create Match Modal */}
      {showAddMatchModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto animate-fadeIn">
          <div className="bg-white rounded-2xl border border-slate-100 shadow-2xl w-full max-w-2xl my-8 overflow-hidden animate-scaleIn flex flex-col max-h-[90vh]">
            <div className="p-6 border-b border-border/60 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-lg bg-secondary/10 text-secondary flex items-center justify-center">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-foreground uppercase tracking-tight">Interactive Matchmaker</h3>
                  <p className="text-[11px] text-muted-foreground font-medium">Construct balanced pairings and title fights</p>
                </div>
              </div>
              <button 
                onClick={() => setShowAddMatchModal(false)}
                className="p-1.5 hover:bg-muted text-muted-foreground hover:text-foreground rounded-lg transition-colors"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-6 overflow-y-auto flex-1">
              {/* Weight Class & Title Toggle */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-4 bg-slate-50 rounded-xl border border-slate-100">
                <div>
                  <label className="block text-xs font-bold text-foreground mb-1.5 uppercase tracking-wide">Target Weight Class ({matchForm.weightClass} kg)</label>
                  <div className="flex items-center gap-3">
                    <input
                      type="range"
                      min="45"
                      max="100"
                      step="1"
                      value={matchForm.weightClass}
                      onChange={(e) => {
                        const val = parseInt(e.target.value);
                        setMatchForm(prev => ({
                          ...prev,
                          weightClass: val,
                          fighterAId: "",
                          fighterBId: ""
                        }));
                      }}
                      className="w-full accent-primary h-1.5 bg-slate-200 rounded-lg cursor-pointer"
                    />
                    <span className="text-sm font-extrabold text-primary font-mono shrink-0 w-12 text-right">{matchForm.weightClass} kg</span>
                  </div>
                  <span className="text-[10px] text-muted-foreground font-medium mt-1 block">Fighters matched within ±3kg ({matchForm.weightClass - 3} - {matchForm.weightClass + 3}kg)</span>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-xs font-bold text-foreground uppercase tracking-wide">Championship Title Fight</label>
                    <input
                      type="checkbox"
                      checked={matchForm.isTitleMatch}
                      onChange={(e) => setMatchForm(prev => ({ 
                        ...prev, 
                        isTitleMatch: e.target.checked,
                        championshipId: "",
                        fighterAId: "",
                        fighterBId: ""
                      }))}
                      className="w-4 h-4 rounded text-primary border-border focus:ring-primary/20 accent-primary"
                    />
                  </div>

                  {matchForm.isTitleMatch && (
                    <select
                      value={matchForm.championshipId}
                      onChange={(e) => handleChampionshipChange(e.target.value)}
                      className="input-premium py-2 bg-white select-premium animate-fadeIn"
                    >
                      <option value="">Select Championship Belt...</option>
                      {availableChampions.map(c => (
                        <option key={c.id} value={c.id}>
                          {c.titleName} (Holder: {c.currentHolderName})
                        </option>
                      ))}
                    </select>
                  )}
                </div>
              </div>

              {/* Matchup Selection Cards */}
              <div className="grid grid-cols-1 md:grid-cols-[1fr_auto_1fr] gap-4 items-center">
                {/* Fighter A */}
                <div className="space-y-3">
                  <label className="block text-xs font-bold text-foreground uppercase tracking-wide">Fighter A</label>
                  <select
                    value={matchForm.fighterAId}
                    onChange={(e) => setMatchForm(prev => ({ ...prev, fighterAId: e.target.value }))}
                    className="input-premium py-2 bg-white select-premium"
                  >
                    <option value="">Select Fighter A...</option>
                    {availableFighters.map(f => (
                      <option key={f.id} value={f.id}>
                        {f.name} [Class {f.grade || "C"}] ({f.record || "0-0-0"}) - {f.gym}
                      </option>
                    ))}
                  </select>

                  {/* Fighter A Card Info */}
                  {matchForm.fighterAId && (() => {
                    const f = fighters.find(x => x.id === matchForm.fighterAId);
                    const warning = getFighterWarning(matchForm.fighterAId);
                    if (!f) return null;
                    return (
                      <div className="card-premium p-3 bg-slate-50/50 border border-slate-100 flex gap-3 items-center animate-fadeIn">
                        <img src={f.image || "https://images.unsplash.com/photo-1549719386-74dfcbf7dbed?w=100"} className="w-12 h-12 rounded-lg object-cover border border-slate-200 shrink-0" />
                        <div className="min-w-0 flex-1">
                          <h4 className="font-bold text-xs text-foreground truncate">{f.name}</h4>
                          <p className="text-[10px] text-muted-foreground font-semibold">{f.gym} • {f.record || "0-0-0"}</p>
                          <p className="text-[10px] text-primary font-bold mt-0.5">{f.weight} kg • Grade {f.grade || "A"}</p>
                          {warning && <p className="text-[9px] text-destructive font-bold mt-1">{warning}</p>}
                        </div>
                      </div>
                    );
                  })()}
                </div>

                {/* VS Badge */}
                <div className="flex flex-col items-center justify-center pt-6">
                  <span className="w-8 h-8 rounded-full bg-secondary/15 text-secondary border border-secondary/20 flex items-center justify-center text-xs font-bold font-mono">
                    VS
                  </span>
                </div>

                {/* Fighter B */}
                <div className="space-y-3">
                  <label className="block text-xs font-bold text-foreground uppercase tracking-wide">Fighter B</label>
                  <select
                    value={matchForm.fighterBId}
                    onChange={(e) => setMatchForm(prev => ({ ...prev, fighterBId: e.target.value }))}
                    className="input-premium py-2 bg-white select-premium"
                  >
                    <option value="">Select Fighter B...</option>
                    {availableFighters
                      .filter(f => f.id !== matchForm.fighterAId)
                      .map(f => (
                        <option key={f.id} value={f.id}>
                          {f.name} [Class {f.grade || "C"}] ({f.record || "0-0-0"}) - {f.gym}
                        </option>
                      ))}
                  </select>

                  {/* Fighter B Card Info */}
                  {matchForm.fighterBId && (() => {
                    const f = fighters.find(x => x.id === matchForm.fighterBId);
                    const warning = getFighterWarning(matchForm.fighterBId);
                    if (!f) return null;
                    return (
                      <div className="card-premium p-3 bg-slate-50/50 border border-slate-100 flex gap-3 items-center animate-fadeIn">
                        <img src={f.image || "https://images.unsplash.com/photo-1549719386-74dfcbf7dbed?w=100"} className="w-12 h-12 rounded-lg object-cover border border-slate-200 shrink-0" />
                        <div className="min-w-0 flex-1">
                          <h4 className="font-bold text-xs text-foreground truncate">{f.name}</h4>
                          <p className="text-[10px] text-muted-foreground font-semibold">{f.gym} • {f.record || "0-0-0"}</p>
                          <p className="text-[10px] text-primary font-bold mt-0.5">{f.weight} kg • Grade {f.grade || "A"}</p>
                          {warning && <p className="text-[9px] text-destructive font-bold mt-1">{warning}</p>}
                        </div>
                      </div>
                    );
                  })()}
                </div>
              </div>

              {/* Matchmaker Comparison Panel */}
              {matchForm.fighterAId && matchForm.fighterBId && (() => {
                const fA = fighters.find(x => x.id === matchForm.fighterAId);
                const fB = fighters.find(x => x.id === matchForm.fighterBId);
                if (!fA || !fB) return null;
                
                const weightDiff = Math.abs(fA.weight - fB.weight);
                const isWeightOk = weightDiff <= 3;
                const isGradeOk = fA.grade === fB.grade;
                
                return (
                  <div className="bg-slate-50 rounded-2xl border border-slate-200 p-4 space-y-3 animate-fadeIn">
                    <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                      <Sparkles className="w-4 h-4 text-amber-500" />
                      Fighter Compatibility Assessment
                    </h4>
                    <div className="grid grid-cols-3 gap-2 text-center items-center py-2 bg-white rounded-xl border border-slate-100 p-3 shadow-sm">
                      <div className="space-y-1">
                        <span className="px-2 py-0.5 bg-[#C8102E]/10 text-[#C8102E] font-bold text-[9px] rounded uppercase">RED</span>
                        <div className="text-sm font-bold truncate text-slate-900">{fA.name}</div>
                        <div className="text-xs font-semibold text-slate-500">{fA.record}</div>
                      </div>
                      
                      <div className="flex flex-col items-center">
                        <span className="text-xs font-extrabold text-slate-400 font-mono">VS</span>
                        <div className="h-8 w-px bg-slate-200 my-1" />
                        <span className={clsx(
                          "px-2.5 py-0.5 rounded-full text-[10px] font-bold shadow-sm",
                          isWeightOk && isGradeOk ? "bg-emerald-50 text-emerald-700 border border-emerald-200/50" : "bg-amber-50 text-amber-700 border border-amber-200/50"
                        )}>
                          {isWeightOk && isGradeOk ? "Excellent Match" : "Fair Match"}
                        </span>
                      </div>

                      <div className="space-y-1">
                        <span className="px-2 py-0.5 bg-[#0A3D91]/10 text-[#0A3D91] font-bold text-[9px] rounded uppercase">BLUE</span>
                        <div className="text-sm font-bold truncate text-slate-900">{fB.name}</div>
                        <div className="text-xs font-semibold text-slate-500">{fB.record}</div>
                      </div>
                    </div>

                    <div className="space-y-2 text-xs font-medium pl-1">
                      {/* Weight match check */}
                      <div className="flex items-center gap-2">
                        <span className={clsx(
                          "w-2 h-2 rounded-full",
                          isWeightOk ? "bg-emerald-500" : "bg-red-500"
                        )} />
                        <span className="text-slate-705">
                          Weight Discrepancy: <strong className="font-bold">{weightDiff.toFixed(1)} kg</strong> 
                          {isWeightOk 
                            ? " (Within safe 3kg limit)" 
                            : " (EXCEEDS safe 3kg limit - pairing not recommended!)"
                          }
                        </span>
                      </div>

                      {/* Grade match check */}
                      <div className="flex items-center gap-2">
                        <span className={clsx(
                          "w-2 h-2 rounded-full",
                          isGradeOk ? "bg-emerald-500" : "bg-amber-500"
                        )} />
                        <span className="text-slate-705">
                          Grade Class: {isGradeOk 
                            ? `Both are Class ${fA.grade} fighters`
                            : `Mismatch (Class ${fA.grade} vs Class ${fB.grade})`
                          }
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })()}

              {/* Bout details configuration */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 border border-border/60 rounded-xl">
                <div>
                  <label className="block text-[10px] font-bold text-foreground mb-1 uppercase tracking-wide">Rounds</label>
                  <select
                    value={matchForm.rounds}
                    onChange={(e) => setMatchForm(prev => ({ ...prev, rounds: parseInt(e.target.value) || 5 }))}
                    className="input-premium py-1.5 text-xs bg-white select-premium"
                  >
                    <option value={3}>3 Rounds</option>
                    <option value={5}>5 Rounds</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-foreground mb-1 uppercase tracking-wide">Round Duration</label>
                  <select
                    value={matchForm.roundTime}
                    onChange={(e) => setMatchForm(prev => ({ ...prev, roundTime: parseInt(e.target.value) || 3 }))}
                    className="input-premium py-1.5 text-xs bg-white select-premium"
                  >
                    <option value={3}>3 Minutes</option>
                    <option value={2}>2 Minutes</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-foreground mb-1 uppercase tracking-wide">Knockdown Limit</label>
                  <select
                    value={matchForm.knockdownLimit}
                    onChange={(e) => setMatchForm(prev => ({ ...prev, knockdownLimit: parseInt(e.target.value) || 3 }))}
                    className="input-premium py-1.5 text-xs bg-white select-premium"
                  >
                    <option value={3}>3 KD Limit</option>
                    <option value={4}>4 KD Limit</option>
                    <option value={5}>5 KD Limit</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-foreground mb-1 uppercase tracking-wide">Glove Size</label>
                  <select
                    value={matchForm.gloveSize}
                    onChange={(e) => setMatchForm(prev => ({ ...prev, gloveSize: e.target.value }))}
                    className="input-premium py-1.5 text-xs bg-white select-premium"
                  >
                    {GLOVE_SIZES?.map(size => (
                      <option key={size} value={size}>{size}</option>
                    )) || (
                      <>
                        <option value="8oz">8oz</option>
                        <option value="10oz">10oz</option>
                      </>
                    )}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-foreground mb-1.5 uppercase tracking-wide">Glove Brand</label>
                <input
                  type="text"
                  value={matchForm.gloveBrand}
                  onChange={(e) => setMatchForm(prev => ({ ...prev, gloveBrand: e.target.value }))}
                  placeholder="Twins Special, Fairtex, Venum..."
                  className="input-premium py-2 bg-white"
                />
              </div>
            </div>

            <div className="p-6 border-t border-border/60 bg-slate-50/50 flex justify-end gap-3 shrink-0">
              <button
                onClick={() => setShowAddMatchModal(false)}
                className="px-4 py-2 rounded-xl border border-border bg-white hover:bg-muted text-foreground text-xs font-semibold uppercase tracking-wider transition-all"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateMatchSubmit}
                className="btn-primary py-2 px-5 text-xs font-semibold uppercase tracking-wider"
              >
                Add Match to Card
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}