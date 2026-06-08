import { useState, useMemo } from "react";
import { useParams, Link, useNavigate } from "react-router";
import { 
  ArrowLeft, Edit, MapPin, Calendar, 
  CheckCircle, Shield, Plus, Eye,
  ChevronDown, ChevronUp, Users, 
  AlertCircle, Trash2, Send, Clock,
  Tv, Trophy, XCircle, Download,
  Building2, CalendarDays, Ban, DollarSign, User
} from "lucide-react";
import { MOCK_EVENTS } from "../data/mock";
import { MOCK_BATCHES } from "../data/batches";
import { 
  getBroadcastStationById, 
  getSponsorById,
  BROADCAST_STATIONS,
  SPONSORS
} from "../data/masterData";
import { usePermissions } from "../hooks/usePermissions";
import { EventStatusBadge } from "../components/EventStatusBadge";
import { addWorkflowRequest, MOCK_WORKFLOW_REQUESTS } from "../data/workflow";
import { clsx } from "clsx";

export function EventDetailNew() {
  const { id } = useParams();
  const navigate = useNavigate();
  const permissions = usePermissions();
  const [expandedBatches, setExpandedBatches] = useState<Set<string>>(new Set());
  
  // Keep event selection in state for immediate reactivity
  const foundEvent = useMemo(() => {
    return MOCK_EVENTS.find((e) => e.id === id) || MOCK_EVENTS[0];
  }, [id]);

  const [event, setEvent] = useState(foundEvent);

  // Sync state if routing changes
  useMemo(() => {
    setEvent(foundEvent);
  }, [foundEvent]);

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
  
  const [approvalComments, setApprovalComments] = useState("");
  const [rejectionReason, setRejectionReason] = useState("");
  const [cancelReason, setCancelReason] = useState("");
  
  const eventBatches = MOCK_BATCHES.filter(b => b.eventId === event.id);
  const broadcastStation = event.broadcastStationId ? getBroadcastStationById(event.broadcastStationId) : null;
  const mainSponsor = event.mainSponsorId ? getSponsorById(event.mainSponsorId) : null;

  const { canEditEvent } = permissions;

  // Calculate event stats
  const eventStats = useMemo(() => {
    const totalMatches = eventBatches.reduce((sum, b) => sum + b.matches.length, 0);
    const completedMatches = eventBatches.reduce((sum, b) => 
      sum + b.matches.filter(m => m.result).length, 0
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

  // Validation checks
  const validationChecks = [
    { id: 1, label: "Event has a name", passed: !!event.name },
    { id: 2, label: "Event has a date", passed: !!event.date },
    { id: 3, label: "Event has a location", passed: !!event.location },
    { id: 4, label: "Event has at least one batch", passed: eventBatches.length > 0 },
    { id: 5, label: "All batches have at least one match", passed: eventBatches.every(b => b.matches.length > 0) },
    { id: 6, label: "Event has organizer information", passed: !!event.organizer },
    { id: 7, label: "Event has broadcast station", passed: !!event.broadcastStationId },
    { id: 8, label: "Event has main sponsor", passed: !!event.mainSponsorId },
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

  const handleEditEvent = () => {
    setEditEventName(event.name);
    setEditEventDate(event.date);
    setEditEventLocation(event.location);
    setEditEventOrganizer(event.organizer || "");
    setEditBroadcastStationId(event.broadcastStationId || "");
    setEditMainSponsorId(event.mainSponsorId || "");
    
    setShowEditEvent(true);
    setShowApprovalModal(false);
    setShowRejectionModal(false);
    setShowCancelEvent(false);

    setTimeout(() => {
      const el = document.getElementById("edit-event-inline-panel");
      if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 100);
  };

  const handleSaveEdit = () => {
    const idx = MOCK_EVENTS.findIndex((e) => e.id === event.id);
    if (idx !== -1) {
      MOCK_EVENTS[idx] = {
        ...MOCK_EVENTS[idx],
        name: editEventName,
        date: editEventDate,
        location: editEventLocation,
        organizer: editEventOrganizer,
        broadcastStationId: editBroadcastStationId || undefined,
        mainSponsorId: editMainSponsorId || undefined,
      };
      setEvent(MOCK_EVENTS[idx]);
    }
    toast.success("Event updated successfully!");
    setShowEditEvent(false);
  };

  const handleSubmitForApproval = () => {
    if (!allChecksPassed) {
      toast.error("Cannot submit - please complete all requirements");
      return;
    }
    const idx = MOCK_EVENTS.findIndex((e) => e.id === event.id);
    if (idx !== -1) {
      MOCK_EVENTS[idx] = {
        ...MOCK_EVENTS[idx],
        kkfStatus: "Pending KKF Approval",
        status: "Draft",
      };
      setEvent(MOCK_EVENTS[idx]);
    }

    // Generate workflow request
    addWorkflowRequest({
      type: "event",
      title: `Event Request: ${event.name}`,
      createdBy: permissions.currentUser?.id || "u4",
      data: {
        eventId: event.id,
        eventName: event.name,
        date: event.date,
        location: event.location,
        organizer: event.organizer,
        expectedMatches: event.matchesCount || 0,
        sponsors: event.sponsor ? [event.sponsor] : ["Angkor Beer"]
      }
    });

    toast.success("Event submitted for KKF approval!");
  };

  const handleApproveEvent = () => {
    setApprovalComments("");
    setShowApprovalModal(true);
    setShowEditEvent(false);
    setShowRejectionModal(false);
    setShowCancelEvent(false);

    setTimeout(() => {
      const el = document.getElementById("approve-event-inline-panel");
      if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 100);
  };

  const handleConfirmApproval = () => {
    const idx = MOCK_EVENTS.findIndex((e) => e.id === event.id);
    if (idx !== -1) {
      MOCK_EVENTS[idx] = {
        ...MOCK_EVENTS[idx],
        kkfStatus: "Approved",
        status: "Published",
        kkfComments: approvalComments || undefined,
      };
      setEvent(MOCK_EVENTS[idx]);
    }

    // Update pending workflow request
    const req = MOCK_WORKFLOW_REQUESTS.find(r => r.type === "event" && r.data.eventId === event.id && r.status === "pending");
    if (req) {
      req.status = "approved";
      req.reviewedBy = permissions.currentUser?.id || "u1";
      req.reviewedDate = new Date().toISOString().split('T')[0];
      req.comments = approvalComments;
    }

    toast.success("Event approved successfully!", {
      description: approvalComments || "Organizer has been notified"
    });
    setShowApprovalModal(false);
    setApprovalComments("");
  };

  const handleRejectEvent = () => {
    setRejectionReason("");
    setShowRejectionModal(true);
    setShowEditEvent(false);
    setShowApprovalModal(false);
    setShowCancelEvent(false);

    setTimeout(() => {
      const el = document.getElementById("reject-event-inline-panel");
      if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 100);
  };

  const handleConfirmRejection = () => {
    if (!rejectionReason) return;
    const idx = MOCK_EVENTS.findIndex((e) => e.id === event.id);
    if (idx !== -1) {
      MOCK_EVENTS[idx] = {
        ...MOCK_EVENTS[idx],
        kkfStatus: "Draft",
        status: "Draft",
        kkfComments: rejectionReason,
      };
      setEvent(MOCK_EVENTS[idx]);
    }

    // Update pending workflow request
    const req = MOCK_WORKFLOW_REQUESTS.find(r => r.type === "event" && r.data.eventId === event.id && r.status === "pending");
    if (req) {
      req.status = "rejected";
      req.reviewedBy = permissions.currentUser?.id || "u1";
      req.reviewedDate = new Date().toISOString().split('T')[0];
      req.comments = rejectionReason;
    }

    toast.error("Event rejected", {
      description: rejectionReason
    });
    setShowRejectionModal(false);
    setRejectionReason("");
  };

  const handleCancelEvent = () => {
    setCancelReason("");
    setShowCancelEvent(true);
    setShowEditEvent(false);
    setShowApprovalModal(false);
    setShowRejectionModal(false);

    setTimeout(() => {
      const el = document.getElementById("cancel-event-inline-panel");
      if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 100);
  };

  const handleConfirmCancel = () => {
    if (!cancelReason) return;
    const idx = MOCK_EVENTS.findIndex((e) => e.id === event.id);
    if (idx !== -1) {
      MOCK_EVENTS[idx] = {
        ...MOCK_EVENTS[idx],
        kkfStatus: "Cancelled",
        status: "Cancelled",
        kkfComments: cancelReason,
      };
      setEvent(MOCK_EVENTS[idx]);
    }
    toast.error("Event cancelled", {
      description: cancelReason
    });
    setShowCancelEvent(false);
    setCancelReason("");
  };

  const handleCheckAction = (checkId: number) => {
    if (checkId === 4 || checkId === 5) {
      navigate(`/home/events/${event.id}/add-match`);
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
    { key: "Pending KKF Approval", label: "Pending Approval", desc: "KKF compliance review" },
    { key: "Approved", label: "Approved", desc: "Sanctioned & Matchmaking" },
    { key: "Ongoing", label: "In Progress", desc: "Live event broadcast" },
    { key: "Completed", label: "Completed", desc: "Results finalized" }
  ];

  const getStepIndex = (status: string) => {
    const idx = timelineSteps.findIndex(s => s.key === status);
    if (idx !== -1) return idx;
    if (status === "Cancelled") return -1;
    if (status === "Draft" || status === "Rejected") return 0;
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
          {canEditEvent && event.kkfStatus === "Draft" && (
            <button
              onClick={handleEditEvent}
              className="btn-outline inline-flex items-center gap-1.5 py-2 px-4 shadow-sm"
            >
              <Edit className="w-4 h-4" />
              <span>Edit Event</span>
            </button>
          )}

          {canSubmitForApproval && (
            <button
              onClick={handleSubmitForApproval}
              className="btn-primary py-2 px-4 inline-flex items-center gap-1.5 uppercase text-xs tracking-wider"
            >
              <Send className="w-4 h-4" />
              <span>Submit for Approval</span>
            </button>
          )}

          {event.kkfStatus === "Pending KKF Approval" && permissions.role === "kkf-admin" && (
            <>
              <button
                onClick={handleApproveEvent}
                className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-lg bg-gradient-to-br from-emerald-600 to-emerald-700 text-white hover:from-emerald-700 hover:to-emerald-800 text-xs font-semibold uppercase tracking-wider transition-all shadow-sm hover:shadow active:scale-[0.98]"
              >
                <CheckCircle className="w-4 h-4" />
                <span>Approve Event</span>
              </button>
              <button
                onClick={handleRejectEvent}
                className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-lg bg-gradient-to-br from-red-600 to-rose-600 text-white hover:from-red-700 hover:to-rose-755 text-xs font-semibold uppercase tracking-wider transition-all shadow-sm hover:shadow active:scale-[0.98]"
              >
                <XCircle className="w-4 h-4" />
                <span>Reject Event</span>
              </button>
            </>
          )}

          {(event.kkfStatus === "Approved" || event.kkfStatus === "Ongoing") && permissions.role === "kkf-admin" && (
            <button
              onClick={handleCancelEvent}
              className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-lg bg-gradient-to-br from-red-600 to-rose-600 text-white hover:from-red-700 hover:to-rose-755 text-xs font-semibold uppercase tracking-wider transition-all shadow-sm hover:shadow active:scale-[0.98]"
            >
              <Ban className="w-4 h-4" />
              <span>Cancel Event</span>
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
                {BROADCAST_STATIONS.map((station) => (
                  <option key={station.id} value={station.id}>
                    {station.logo} {station.name}
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
                {SPONSORS.map((sponsor) => (
                  <option key={sponsor.id} value={sponsor.id}>
                    {sponsor.logo} {sponsor.name}
                  </option>
                ))}
              </select>
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

      {showApprovalModal && (
        <div id="approve-event-inline-panel" className="bg-emerald-50/20 border border-emerald-100 rounded-xl p-6 mb-8 animate-fadeIn space-y-4">
          <div className="flex items-center gap-3 pb-3 border-b border-emerald-250/20">
            <div className="w-10 h-10 bg-emerald-100 text-emerald-700 rounded-xl flex items-center justify-center">
              <CheckCircle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-emerald-950 uppercase tracking-tight">Approve Event</h3>
              <p className="text-xs text-emerald-800">Officially sanction this event and release matchmaking</p>
            </div>
          </div>

          <p className="text-sm text-emerald-800/90 font-medium">
            Approving this event will unlock it for match creation, weight checks, and fighter card preparation.
          </p>

          <div>
            <label className="block text-xs font-semibold text-emerald-850 mb-2 uppercase tracking-wide">Approval Comments (Optional)</label>
            <textarea
              value={approvalComments}
              onChange={(e) => setApprovalComments(e.target.value)}
              placeholder="Add feedback or notes for the event organizer..."
              rows={3}
              className="input-premium py-2 bg-white/80 border-emerald-250/60 focus:border-emerald-500 focus:ring-emerald-500/10"
            />
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button
              onClick={() => {
                setShowApprovalModal(false);
                setApprovalComments("");
              }}
              className="px-5 py-2 rounded-lg border border-emerald-200 bg-white hover:bg-emerald-50 text-emerald-950 text-xs font-semibold uppercase tracking-wider transition-all"
            >
              Cancel
            </button>
            <button
              onClick={handleConfirmApproval}
              className="inline-flex items-center justify-center gap-1.5 px-5 py-2 rounded-lg bg-gradient-to-br from-emerald-600 to-emerald-700 text-white hover:from-emerald-700 hover:to-emerald-800 text-xs font-semibold uppercase tracking-wider transition-all shadow-sm"
            >
              Confirm Approval
            </button>
          </div>
        </div>
      )}

      {showRejectionModal && (
        <div id="reject-event-inline-panel" className="bg-red-50/20 border border-red-100 rounded-xl p-6 mb-8 animate-fadeIn space-y-4">
          <div className="flex items-center gap-3 pb-3 border-b border-red-250/20">
            <div className="w-10 h-10 bg-red-100 text-red-700 rounded-xl flex items-center justify-center">
              <XCircle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-red-950 uppercase tracking-tight">Reject Event Proposal</h3>
              <p className="text-xs text-red-800">Send event back to Draft status with change requirements</p>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-red-850 mb-2 uppercase tracking-wide">Rejection Reason *</label>
            <textarea
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              placeholder="Describe what needs to be fixed before this event can be approved..."
              rows={3}
              className="input-premium py-2 bg-white/80 border-red-205 focus:border-red-500 focus:ring-red-500/10"
            />
            {!rejectionReason && (
              <p className="text-[10px] text-destructive font-bold mt-1.5">⚠️ Rejection reason is required</p>
            )}
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button
              onClick={() => {
                setShowRejectionModal(false);
                setRejectionReason("");
              }}
              className="px-5 py-2 rounded-lg border border-red-200 bg-white hover:bg-red-50 text-red-950 text-xs font-semibold uppercase tracking-wider transition-all"
            >
              Cancel
            </button>
            <button
              onClick={handleConfirmRejection}
              disabled={!rejectionReason}
              className="inline-flex items-center justify-center gap-1.5 px-5 py-2 rounded-lg bg-gradient-to-br from-red-600 to-rose-600 text-white hover:from-red-700 hover:to-rose-755 text-xs font-semibold uppercase tracking-wider transition-all shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Confirm Rejection
            </button>
          </div>
        </div>
      )}

      {showCancelEvent && (
        <div id="cancel-event-inline-panel" className="bg-red-50/20 border border-red-100 rounded-xl p-6 mb-8 animate-fadeIn space-y-4">
          <div className="flex items-center gap-3 pb-3 border-b border-red-250/20">
            <div className="w-10 h-10 bg-red-100 text-red-700 rounded-xl flex items-center justify-center">
              <Ban className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-red-955 uppercase tracking-tight">Cancel Sanctioned Event</h3>
              <p className="text-xs text-red-800">Archive this event as Cancelled</p>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-red-850 mb-2 uppercase tracking-wide">Cancellation Reason *</label>
            <textarea
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
              placeholder="Describe the reason for cancelling this sanctioned event..."
              rows={3}
              className="input-premium py-2 bg-white/80 border-red-205 focus:border-red-500 focus:ring-red-500/10"
            />
            {!cancelReason && (
              <p className="text-[10px] text-destructive font-bold mt-1.5">⚠️ Cancellation reason is required</p>
            )}
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button
              onClick={() => {
                setShowCancelEvent(false);
                setCancelReason("");
              }}
              className="px-5 py-2 rounded-lg border border-red-200 bg-white hover:bg-red-50 text-red-955 text-xs font-semibold uppercase tracking-wider transition-all"
            >
              Cancel
            </button>
            <button
              onClick={handleConfirmCancel}
              disabled={!cancelReason}
              className="inline-flex items-center justify-center gap-1.5 px-5 py-2 rounded-lg bg-gradient-to-br from-red-600 to-rose-600 text-white hover:from-red-700 hover:to-rose-755 text-xs font-semibold uppercase tracking-wider transition-all shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Confirm Cancellation
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
                <span className="font-bold text-sm">Batches</span>
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

      {/* Validation Checklist */}
      {event.kkfStatus === "Draft" && (
        <div className="card-premium p-6 sm:p-8 mb-8 space-y-6">
          <h2 className="text-lg font-bold text-foreground uppercase tracking-tight pb-3 border-b border-border/60">Submission Requirements</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            {validationChecks.map((check) => (
              <div
                key={check.id}
                className={clsx(
                  "flex items-center justify-between gap-3 p-3.5 rounded-xl border transition-all",
                  check.passed
                    ? "bg-emerald-50/20 border-emerald-100/50 text-emerald-900"
                    : "bg-red-50/20 border-red-100/50 text-red-900"
                )}
              >
                <div className="flex items-center gap-3 min-w-0">
                  {check.passed ? (
                    <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0" />
                  ) : (
                    <AlertCircle className="w-5 h-5 text-red-500 shrink-0" />
                  )}
                  <span className="font-semibold text-xs truncate">
                    {check.label}
                  </span>
                </div>
                
                {!check.passed && (
                  <button
                    onClick={() => handleCheckAction(check.id)}
                    className="inline-flex items-center gap-1 text-[10px] font-bold px-3 py-1.5 bg-red-100 hover:bg-red-200/80 text-red-700 rounded-lg transition-all shadow-sm active:scale-95 shrink-0"
                  >
                    {check.id === 4 || check.id === 5 ? (
                      <>
                        <Plus className="w-3 h-3" />
                        <span>Create</span>
                      </>
                    ) : (
                      <>
                        <Edit className="w-3 h-3" />
                        <span>Fix</span>
                      </>
                    )}
                  </button>
                )}
              </div>
            ))}
          </div>

          {allChecksPassed && (
            <div className="p-4 bg-emerald-50/30 border border-emerald-150 rounded-xl">
              <div className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-bold text-emerald-950 text-xs uppercase tracking-tight mb-0.5">Ready for Submission!</h3>
                  <p className="text-emerald-800 text-xs font-medium">
                    All compliance requirements have been successfully met. You can now submit this event for KKF official approval.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Batches & Matches */}
      <div className="card-premium p-6 sm:p-8 space-y-6">
        <div className="flex items-center justify-between pb-3 border-b border-border/60">
          <h2 className="text-lg font-bold text-foreground uppercase tracking-tight">Batches & Matches</h2>
          
          {canEditEvent && event.kkfStatus === "Draft" && (
            <Link
              to={`/home/events/${event.id}/add-match`}
              className="btn-primary py-1.5 px-3.5 text-xs font-medium uppercase tracking-wider"
            >
              <Plus className="w-4 h-4" />
              Add Batch
            </Link>
          )}
        </div>

        {eventBatches.length === 0 ? (
          <div className="text-center py-16">
            <CalendarDays className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
            <p className="text-muted-foreground font-semibold text-base mb-1">No batches created yet</p>
            <p className="text-muted-foreground/60 text-xs font-medium mb-5">Create your first batch to start adding matches</p>
            {canEditEvent && event.kkfStatus === "Draft" && (
              <Link
                to={`/home/events/${event.id}/add-match`}
                className="btn-primary inline-flex py-2 px-5 text-xs uppercase tracking-wider"
              >
                <Plus className="w-4 h-4" />
                Create First Batch
              </Link>
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
                            <Link
                              key={match.id}
                              to={`/home/match/${match.id}`}
                              className="block border border-border/60 hover:border-primary/30 rounded-xl p-4 bg-slate-50/40 hover:bg-white transition-all hover:shadow-sm duration-200 group"
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
                          );
                        })}
                      </div>

                      {canEditEvent && event.kkfStatus === "Draft" && (
                        <div className="mt-4 pt-3 border-t border-border/60">
                          <Link
                            key={batch.id}
                            to={`/home/matches/${batch.id}/create-match`}
                            className="btn-primary inline-flex py-1.5 px-3 text-xs font-medium uppercase tracking-wider"
                          >
                            <Plus className="w-3.5 h-3.5" />
                            Add Match to This Batch
                          </Link>
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
    </div>
  );
}