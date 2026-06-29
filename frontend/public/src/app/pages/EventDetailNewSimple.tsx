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
import { getBroadcastStationById, getSponsorById } from "../data/masterData";
import { usePermissions } from "../hooks/usePermissions";
import { toast } from "sonner";
import { EventStatusBadge } from "../components/EventStatusBadge";

export function EventDetailNew() {
  const { id } = useParams();
  const navigate = useNavigate();
  const permissions = usePermissions();
  const [expandedBatches, setExpandedBatches] = useState<Set<string>>(new Set());
  
  // Modal States
  const [showEditEvent, setShowEditEvent] = useState(false);
  const [showApprovalModal, setShowApprovalModal] = useState(false);
  const [showRejectionModal, setShowRejectionModal] = useState(false);
  const [showCancelEvent, setShowCancelEvent] = useState(false);
  
  // Form States
  const [editEventName, setEditEventName] = useState("");
  const [editEventDate, setEditEventDate] = useState("");
  const [editEventLocation, setEditEventLocation] = useState("");
  const [editEventOrganizer, setEditEventOrganizer] = useState("");
  const [approvalComments, setApprovalComments] = useState("");
  const [rejectionReason, setRejectionReason] = useState("");
  const [cancelReason, setCancelReason] = useState("");
  
  const event = MOCK_EVENTS.find((e) => e.id === id) || MOCK_EVENTS[0];
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
    setShowEditEvent(true);
  };

  const handleSaveEdit = () => {
    toast.success("Event updated successfully!");
    setShowEditEvent(false);
  };

  const handleSubmitForApproval = () => {
    if (!allChecksPassed) {
      toast.error("Cannot submit - please complete all requirements");
      return;
    }
    toast.success("Event submitted for KKF approval!");
  };

  const handleApproveEvent = () => {
    setApprovalComments("");
    setShowApprovalModal(true);
  };

  const handleConfirmApproval = () => {
    toast.success("Event approved successfully!", {
      description: approvalComments || "Organizer has been notified"
    });
    setShowApprovalModal(false);
    setApprovalComments("");
  };

  const handleRejectEvent = () => {
    setRejectionReason("");
    setShowRejectionModal(true);
  };

  const handleConfirmRejection = () => {
    if (!rejectionReason) return;
    toast.error("Event rejected", {
      description: rejectionReason
    });
    setShowRejectionModal(false);
    setRejectionReason("");
  };

  const handleCancelEvent = () => {
    setCancelReason("");
    setShowCancelEvent(true);
  };

  const handleConfirmCancel = () => {
    if (!cancelReason) return;
    toast.error("Event cancelled", {
      description: cancelReason
    });
    setShowCancelEvent(false);
    setCancelReason("");
  };

  const isEventApprovedOrOngoing = event.kkfStatus === "Approved" || event.kkfStatus === "Ongoing";

  return (
    <>
      <div className="min-h-screen bg-[#F4F5F8] pb-8">
        {/* Header */}
        <div className="bg-gradient-to-r from-[#0A3D91] to-[#051C42] px-6 py-8 mb-8">
          <div className="max-w-7xl mx-auto">
            <button
              onClick={() => navigate("/home/events")}
              className="inline-flex items-center gap-2 text-white/80 hover:text-white mb-6 transition-colors font-medium"
            >
              <ArrowLeft className="w-5 h-5" />
              Back to Events
            </button>

            <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
              <div className="flex-1">
                <div className="flex items-start gap-4 mb-4">
                  <h1 className="text-4xl lg:text-5xl font-black text-white uppercase leading-tight">
                    {event.name}
                  </h1>
                  <EventStatusBadge status={event.kkfStatus} />
                </div>
                
                <div className="flex flex-wrap gap-4 text-white/80">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    <span className="font-medium">{event.date}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4" />
                    <span className="font-medium">{event.location}</span>
                  </div>
                  {event.organizer && (
                    <div className="flex items-center gap-2">
                      <Building2 className="w-4 h-4" />
                      <span className="font-medium">{event.organizer}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap gap-3">
                {canEditEvent && event.kkfStatus === "Draft" && (
                  <button
                    onClick={handleEditEvent}
                    className="inline-flex items-center gap-2 px-6 py-3.5 bg-white hover:bg-gray-50 text-[#0A3D91] rounded-2xl font-black uppercase transition-all shadow-lg text-sm"
                  >
                    <Edit className="w-5 h-5" />
                    Edit Event
                  </button>
                )}

                {canSubmitForApproval && (
                  <button
                    onClick={handleSubmitForApproval}
                    className="inline-flex items-center gap-2 px-6 py-3.5 bg-gradient-to-r from-[#F2C94C] to-[#F2994A] hover:opacity-90 text-[#1A1A24] rounded-2xl font-black uppercase transition-all shadow-lg text-sm"
                  >
                    <Send className="w-5 h-5" />
                    Submit for Approval
                  </button>
                )}

                {event.kkfStatus === "Pending KKF Approval" && permissions.role === "kkf-admin" && (
                  <>
                    <button
                      onClick={handleApproveEvent}
                      className="inline-flex items-center gap-2 px-6 py-3.5 bg-gradient-to-r from-green-600 to-emerald-600 hover:opacity-90 text-white rounded-2xl font-black uppercase transition-all shadow-lg text-sm"
                    >
                      <CheckCircle className="w-5 h-5" />
                      Approve Event
                    </button>
                    <button
                      onClick={handleRejectEvent}
                      className="inline-flex items-center gap-2 px-6 py-3.5 bg-gradient-to-r from-red-600 to-rose-600 hover:opacity-90 text-white rounded-2xl font-black uppercase transition-all shadow-lg text-sm"
                    >
                      <XCircle className="w-5 h-5" />
                      Reject Event
                    </button>
                  </>
                )}

                {(event.kkfStatus === "Approved" || event.kkfStatus === "Ongoing") && permissions.role === "kkf-admin" && (
                  <button
                    onClick={handleCancelEvent}
                    className="inline-flex items-center gap-2 px-6 py-3.5 bg-gradient-to-r from-red-600 to-rose-600 hover:opacity-90 text-white rounded-2xl font-black uppercase transition-all shadow-lg text-sm"
                  >
                    <Ban className="w-5 h-5" />
                    Cancel Event
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            {/* Event Details Card */}
            <div className="lg:col-span-2 bg-white rounded-3xl p-8 shadow-sm border-2 border-[#E0E0E0]">
              <h2 className="text-2xl font-black text-[#1A1A24] uppercase mb-6">Event Information</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="text-xs font-black text-[#707070] uppercase tracking-wide mb-2 block">Event Name</label>
                  <p className="text-lg font-bold text-[#1A1A24]">{event.name}</p>
                </div>

                <div>
                  <label className="text-xs font-black text-[#707070] uppercase tracking-wide mb-2 block">Status</label>
                  <EventStatusBadge status={event.kkfStatus} />
                </div>

                <div>
                  <label className="text-xs font-black text-[#707070] uppercase tracking-wide mb-2 block">Date</label>
                  <div className="flex items-center gap-2 text-[#1A1A24]">
                    <Calendar className="w-4 h-4 text-[#0A3D91]" />
                    <p className="font-bold">{event.date}</p>
                  </div>
                </div>

                <div>
                  <label className="text-xs font-black text-[#707070] uppercase tracking-wide mb-2 block">Location</label>
                  <div className="flex items-center gap-2 text-[#1A1A24]">
                    <MapPin className="w-4 h-4 text-[#C8102E]" />
                    <p className="font-bold">{event.location}</p>
                  </div>
                </div>

                {event.organizer && (
                  <div>
                    <label className="text-xs font-black text-[#707070] uppercase tracking-wide mb-2 block">Organizer</label>
                    <div className="flex items-center gap-2 text-[#1A1A24]">
                      <Building2 className="w-4 h-4 text-[#0A3D91]" />
                      <p className="font-bold">{event.organizer}</p>
                    </div>
                  </div>
                )}

                {broadcastStation && (
                  <div>
                    <label className="text-xs font-black text-[#707070] uppercase tracking-wide mb-2 block">Broadcast Station</label>
                    <div className="flex items-center gap-2 text-[#1A1A24]">
                      <Tv className="w-4 h-4 text-[#0A3D91]" />
                      <p className="font-bold">{broadcastStation.logo} {broadcastStation.name}</p>
                    </div>
                  </div>
                )}

                {mainSponsor && (
                  <div>
                    <label className="text-xs font-black text-[#707070] uppercase tracking-wide mb-2 block">Main Sponsor</label>
                    <div className="flex items-center gap-2 text-[#1A1A24]">
                      <DollarSign className="w-4 h-4 text-[#F2C94C]" />
                      <p className="font-bold">{mainSponsor.logo} {mainSponsor.name}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Stats Card */}
            <div className="bg-gradient-to-br from-[#0A3D91] to-[#051C42] rounded-3xl p-8 text-white shadow-lg">
              <h2 className="text-xl font-black uppercase mb-6">Event Statistics</h2>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-white/10 rounded-2xl backdrop-blur-sm">
                  <div className="flex items-center gap-3">
                    <CalendarDays className="w-6 h-6 text-[#F2C94C]" />
                    <span className="font-bold">Batches</span>
                  </div>
                  <span className="text-2xl font-black">{eventStats.totalBatches}</span>
                </div>

                <div className="flex items-center justify-between p-4 bg-white/10 rounded-2xl backdrop-blur-sm">
                  <div className="flex items-center gap-3">
                    <Users className="w-6 h-6 text-[#F2C94C]" />
                    <span className="font-bold">Total Matches</span>
                  </div>
                  <span className="text-2xl font-black">{eventStats.totalMatches}</span>
                </div>

                <div className="flex items-center justify-between p-4 bg-white/10 rounded-2xl backdrop-blur-sm">
                  <div className="flex items-center gap-3">
                    <CheckCircle className="w-6 h-6 text-green-400" />
                    <span className="font-bold">Completed</span>
                  </div>
                  <span className="text-2xl font-black">{eventStats.completedMatches}</span>
                </div>

                <div className="flex items-center justify-between p-4 bg-white/10 rounded-2xl backdrop-blur-sm">
                  <div className="flex items-center gap-3">
                    <Clock className="w-6 h-6 text-orange-400" />
                    <span className="font-bold">Pending</span>
                  </div>
                  <span className="text-2xl font-black">{eventStats.pendingMatches}</span>
                </div>

                <div className="flex items-center justify-between p-4 bg-white/10 rounded-2xl backdrop-blur-sm">
                  <div className="flex items-center gap-3">
                    <Trophy className="w-6 h-6 text-[#F2C94C]" />
                    <span className="font-bold">Championships</span>
                  </div>
                  <span className="text-2xl font-black">{eventStats.championshipMatches}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Validation Checklist */}
          {event.kkfStatus === "Draft" && (
            <div className="bg-white rounded-3xl p-8 shadow-sm border-2 border-[#E0E0E0] mb-8">
              <h2 className="text-2xl font-black text-[#1A1A24] uppercase mb-6">Submission Requirements</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {validationChecks.map((check) => (
                  <div
                    key={check.id}
                    className={`flex items-center gap-3 p-4 rounded-2xl ${
                      check.passed
                        ? "bg-green-50 border-2 border-green-200"
                        : "bg-red-50 border-2 border-red-200"
                    }`}
                  >
                    {check.passed ? (
                      <CheckCircle className="w-5 h-5 text-green-600 shrink-0" />
                    ) : (
                      <AlertCircle className="w-5 h-5 text-red-600 shrink-0" />
                    )}
                    <span className={`font-bold text-sm ${
                      check.passed ? "text-green-900" : "text-red-900"
                    }`}>
                      {check.label}
                    </span>
                  </div>
                ))}
              </div>

              {allChecksPassed && (
                <div className="mt-6 p-6 bg-green-50 border-2 border-green-200 rounded-2xl">
                  <div className="flex items-start gap-4">
                    <CheckCircle className="w-6 h-6 text-green-600 shrink-0 mt-1" />
                    <div>
                      <h3 className="font-black text-green-900 uppercase mb-2">Ready for Submission!</h3>
                      <p className="text-green-800 font-medium">
                        All requirements have been met. You can now submit this event for KKF approval.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Batches & Matches */}
          <div className="bg-white rounded-3xl p-8 shadow-sm border-2 border-[#E0E0E0]">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-black text-[#1A1A24] uppercase">Batches & Matches</h2>
              
              {canEditEvent && event.kkfStatus === "Draft" && (
                <Link
                  to={`/home/events/${event.id}/add-match`}
                  className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#0A3D91] to-[#051C42] hover:opacity-90 text-white rounded-2xl font-black uppercase transition-all shadow-lg text-sm"
                >
                  <Plus className="w-5 h-5" />
                  Add Batch
                </Link>
              )}
            </div>

            {eventBatches.length === 0 ? (
              <div className="text-center py-16">
                <CalendarDays className="w-16 h-16 text-[#E0E0E0] mx-auto mb-4" />
                <p className="text-[#707070] font-bold text-lg mb-2">No batches created yet</p>
                <p className="text-[#B0B0B0] font-medium mb-6">Create your first batch to start adding matches</p>
                {canEditEvent && event.kkfStatus === "Draft" && (
                  <Link
                    to={`/home/events/${event.id}/add-match`}
                    className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#0A3D91] to-[#051C42] hover:opacity-90 text-white rounded-2xl font-black uppercase transition-all shadow-lg text-sm"
                  >
                    <Plus className="w-5 h-5" />
                    Create First Batch
                  </Link>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                {eventBatches.map((batch) => {
                  const isExpanded = expandedBatches.has(batch.id);
                  
                  return (
                    <div key={batch.id} className="border-2 border-[#E0E0E0] rounded-2xl overflow-hidden">
                      <button
                        onClick={() => toggleBatchExpansion(batch.id)}
                        className="w-full flex items-center justify-between p-6 bg-gradient-to-r from-[#F4F5F8] to-white hover:from-[#E0E0E0] hover:to-[#F4F5F8] transition-all"
                      >
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#0A3D91] to-[#051C42] flex items-center justify-center text-white font-black text-lg">
                            {batch.batchNumber}
                          </div>
                          <div className="text-left">
                            <h3 className="font-black text-lg text-[#1A1A24] uppercase">{batch.name}</h3>
                            <div className="flex items-center gap-4 mt-1">
                              <span className="text-sm font-medium text-[#707070]">
                                {batch.matches.length} {batch.matches.length === 1 ? 'match' : 'matches'}
                              </span>
                              <span className="text-sm font-medium text-[#707070]">•</span>
                              <span className="text-sm font-medium text-[#707070]">{batch.date}</span>
                            </div>
                          </div>
                        </div>
                        {isExpanded ? (
                          <ChevronUp className="w-6 h-6 text-[#707070]" />
                        ) : (
                          <ChevronDown className="w-6 h-6 text-[#707070]" />
                        )}
                      </button>

                      {isExpanded && (
                        <div className="p-6 border-t-2 border-[#E0E0E0] bg-white">
                          <div className="space-y-3">
                            {batch.matches.map((match, idx) => (
                              <Link
                                key={match.id}
                                to={`/match/${match.id}`}
                                className="flex items-center justify-between p-5 bg-[#F4F5F8] hover:bg-[#E0E0E0] rounded-2xl transition-all group"
                              >
                                <div className="flex items-center gap-4">
                                  <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center font-black text-[#0A3D91] border-2 border-[#E0E0E0]">
                                    {idx + 1}
                                  </div>
                                  <div>
                                    <div className="flex items-center gap-3 mb-1">
                                      <span className="font-black text-[#1A1A24]">{match.fighterA?.name || match.fighter1?.name}</span>
                                      <span className="text-[#707070] font-bold">VS</span>
                                      <span className="font-black text-[#1A1A24]">{match.fighterB?.name || match.fighter2?.name}</span>
                                    </div>
                                    <div className="flex items-center gap-3 text-xs text-[#707070] font-medium">
                                      <span>{match.agreedWeight}kg</span>
                                      <span>•</span>
                                      <span>{match.rounds} rounds</span>
                                      {match.isChampionshipBout && (
                                        <>
                                          <span>•</span>
                                          <span className="flex items-center gap-1 text-[#F2C94C]">
                                            <Trophy className="w-3 h-3" />
                                            Championship
                                          </span>
                                        </>
                                      )}
                                    </div>
                                  </div>
                                </div>
                                <Eye className="w-5 h-5 text-[#707070] group-hover:text-[#0A3D91] transition-colors" />
                              </Link>
                            ))}
                          </div>

                          {canEditEvent && event.kkfStatus === "Draft" && (
                            <div className="mt-4 pt-4 border-t-2 border-[#E0E0E0]">
                              <Link
                                to={`/matches/${batch.id}/create-match`}
                                className="inline-flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-[#0A3D91] to-[#051C42] hover:opacity-90 text-white rounded-xl font-bold uppercase transition-all text-sm"
                              >
                                <Plus className="w-4 h-4" />
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
      </div>

      {/* Edit Event Modal */}
      {showEditEvent && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-10 max-w-2xl w-full shadow-2xl">
            <div className="flex items-center gap-4 mb-6">
              <div className="p-4 bg-gradient-to-br from-[#0A3D91] to-[#051C42] rounded-2xl shadow-lg">
                <Edit className="w-8 h-8 text-white" />
              </div>
              <div>
                <h3 className="text-3xl font-black text-[#1A1A24] uppercase">Edit Event</h3>
                <p className="text-sm text-[#707070] font-medium mt-1">Update event information</p>
              </div>
            </div>
            
            {isEventApprovedOrOngoing && (
              <div className="mb-6 p-4 bg-orange-50 border-2 border-orange-200 rounded-2xl">
                <p className="text-orange-800 font-bold text-sm flex items-center gap-2">
                  <AlertCircle className="w-4 h-4" />
                  Limited editing - event is approved/ongoing
                </p>
              </div>
            )}
            
            <div className="space-y-6 mb-8">
              <div>
                <label className="block text-sm font-black text-[#707070] mb-3 uppercase tracking-wide">Event Name *</label>
                <input
                  type="text"
                  value={editEventName}
                  onChange={(e) => setEditEventName(e.target.value)}
                  disabled={isEventApprovedOrOngoing}
                  className="w-full px-5 py-4 border-2 border-[#E0E0E0] rounded-2xl focus:border-[#0A3D91] focus:outline-none transition-colors font-medium text-lg disabled:bg-gray-100"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-black text-[#707070] mb-3 uppercase tracking-wide">Date *</label>
                  <input
                    type="date"
                    value={editEventDate}
                    onChange={(e) => setEditEventDate(e.target.value)}
                    className="w-full px-5 py-4 border-2 border-[#E0E0E0] rounded-2xl focus:border-[#0A3D91] focus:outline-none transition-colors font-medium text-lg"
                  />
                </div>

                <div>
                  <label className="block text-sm font-black text-[#707070] mb-3 uppercase tracking-wide">Organizer *</label>
                  <input
                    type="text"
                    value={editEventOrganizer}
                    onChange={(e) => setEditEventOrganizer(e.target.value)}
                    disabled={isEventApprovedOrOngoing}
                    className="w-full px-5 py-4 border-2 border-[#E0E0E0] rounded-2xl focus:border-[#0A3D91] focus:outline-none transition-colors font-medium text-lg disabled:bg-gray-100"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-black text-[#707070] mb-3 uppercase tracking-wide">Location *</label>
                <input
                  type="text"
                  value={editEventLocation}
                  onChange={(e) => setEditEventLocation(e.target.value)}
                  disabled={isEventApprovedOrOngoing}
                  className="w-full px-5 py-4 border-2 border-[#E0E0E0] rounded-2xl focus:border-[#0A3D91] focus:outline-none transition-colors font-medium text-lg disabled:bg-gray-100"
                />
              </div>
            </div>

            <div className="flex items-center gap-4">
              <button
                onClick={handleSaveEdit}
                className="flex-1 py-4 bg-gradient-to-r from-[#0A3D91] to-[#051C42] hover:opacity-90 text-white rounded-2xl font-black uppercase transition-all shadow-lg text-lg"
              >
                Save Changes
              </button>
              <button
                onClick={() => setShowEditEvent(false)}
                className="flex-1 py-4 bg-[#F4F5F8] hover:bg-[#E0E0E0] text-[#1A1A24] rounded-2xl font-black uppercase transition-all text-lg"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Approval Modal */}
      {showApprovalModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-3xl p-10 max-w-2xl w-full shadow-2xl border-2 border-green-300">
            <div className="flex items-center gap-4 mb-6">
              <div className="p-4 bg-gradient-to-br from-green-600 to-emerald-600 rounded-2xl shadow-lg">
                <CheckCircle className="w-8 h-8 text-white" />
              </div>
              <div>
                <h3 className="text-3xl font-black text-green-900 uppercase">Approve Event</h3>
                <p className="text-sm text-green-700 font-medium mt-1">Event: {event.name}</p>
              </div>
            </div>
            
            <div className="mb-6">
              <p className="text-lg text-green-800 font-medium mb-4">
                You are about to approve this event. The organizer will be notified.
              </p>

              <div className="bg-white border-2 border-green-200 rounded-2xl p-6 mb-4">
                <h4 className="text-sm font-black text-green-900 uppercase mb-2">Event Details</h4>
                <div className="space-y-1 text-sm text-green-800">
                  <p><span className="font-bold">Name:</span> {event.name}</p>
                  <p><span className="font-bold">Date:</span> {event.date}</p>
                  <p><span className="font-bold">Location:</span> {event.location}</p>
                  <p><span className="font-bold">Batches:</span> {eventStats.totalBatches}</p>
                  <p><span className="font-bold">Matches:</span> {eventStats.totalMatches}</p>
                </div>
              </div>

              <label className="block text-sm font-black text-green-800 mb-3 uppercase tracking-wide">Approval Comments (Optional)</label>
              <textarea
                value={approvalComments}
                onChange={(e) => setApprovalComments(e.target.value)}
                placeholder="Add any comments or notes for the organizer..."
                rows={4}
                className="w-full px-5 py-4 border-2 border-green-300 rounded-2xl focus:border-green-500 focus:outline-none transition-colors font-medium resize-none bg-white"
              />
            </div>

            <div className="flex items-center gap-4">
              <button
                onClick={handleConfirmApproval}
                className="flex-1 py-4 bg-gradient-to-r from-green-600 to-emerald-600 hover:opacity-90 text-white rounded-2xl font-black uppercase transition-all shadow-lg text-lg"
              >
                Confirm Approval
              </button>
              <button
                onClick={() => {
                  setShowApprovalModal(false);
                  setApprovalComments("");
                }}
                className="flex-1 py-4 bg-white hover:bg-green-100 text-green-900 border-2 border-green-300 rounded-2xl font-black uppercase transition-all text-lg"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Rejection Modal */}
      {showRejectionModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-gradient-to-br from-red-50 to-rose-50 rounded-3xl p-10 max-w-2xl w-full shadow-2xl border-2 border-red-300">
            <div className="flex items-center gap-4 mb-6">
              <div className="p-4 bg-gradient-to-br from-red-600 to-rose-600 rounded-2xl shadow-lg">
                <XCircle className="w-8 h-8 text-white" />
              </div>
              <div>
                <h3 className="text-3xl font-black text-red-900 uppercase">Reject Event</h3>
                <p className="text-sm text-red-700 font-medium mt-1">Event: {event.name}</p>
              </div>
            </div>
            
            <div className="mb-6">
              <p className="text-lg text-red-800 font-medium mb-4">
                You are about to reject this event. Please provide a clear reason.
              </p>

              <label className="block text-sm font-black text-red-800 mb-3 uppercase tracking-wide">
                Rejection Reason <span className="text-red-600">*</span>
              </label>
              <textarea
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="Explain why this event is being rejected..."
                rows={4}
                className="w-full px-5 py-4 border-2 border-red-300 rounded-2xl focus:border-red-500 focus:outline-none transition-colors font-medium resize-none bg-white"
              />
              {!rejectionReason && (
                <p className="text-xs text-red-600 font-bold mt-2">⚠️ Rejection reason is required</p>
              )}
            </div>

            <div className="flex items-center gap-4">
              <button
                onClick={handleConfirmRejection}
                disabled={!rejectionReason}
                className="flex-1 py-4 bg-gradient-to-r from-red-600 to-rose-600 hover:opacity-90 text-white rounded-2xl font-black uppercase transition-all shadow-lg text-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Confirm Rejection
              </button>
              <button
                onClick={() => {
                  setShowRejectionModal(false);
                  setRejectionReason("");
                }}
                className="flex-1 py-4 bg-white hover:bg-red-100 text-red-900 border-2 border-red-300 rounded-2xl font-black uppercase transition-all text-lg"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Cancel Event Modal */}
      {showCancelEvent && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-gradient-to-br from-red-50 to-rose-50 rounded-3xl p-10 max-w-2xl w-full shadow-2xl border-2 border-red-300">
            <div className="flex items-center gap-4 mb-6">
              <div className="p-4 bg-gradient-to-br from-red-600 to-rose-600 rounded-2xl shadow-lg">
                <Ban className="w-8 h-8 text-white" />
              </div>
              <div>
                <h3 className="text-3xl font-black text-red-900 uppercase">Cancel Event</h3>
                <p className="text-sm text-red-700 font-medium mt-1">Event: {event.name}</p>
              </div>
            </div>
            
            <div className="mb-6">
              <p className="text-lg text-red-800 font-medium mb-4">
                You are about to cancel this approved event. Please provide a reason.
              </p>

              <label className="block text-sm font-black text-red-800 mb-3 uppercase tracking-wide">
                Cancellation Reason <span className="text-red-600">*</span>
              </label>
              <textarea
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                placeholder="Explain why this event is being cancelled..."
                rows={4}
                className="w-full px-5 py-4 border-2 border-red-300 rounded-2xl focus:border-red-500 focus:outline-none transition-colors font-medium resize-none bg-white"
              />
            </div>

            <div className="flex items-center gap-4">
              <button
                onClick={handleConfirmCancel}
                disabled={!cancelReason}
                className="flex-1 py-4 bg-gradient-to-r from-red-600 to-rose-600 hover:opacity-90 text-white rounded-2xl font-black uppercase transition-all shadow-lg text-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Confirm Cancellation
              </button>
              <button
                onClick={() => {
                  setShowCancelEvent(false);
                  setCancelReason("");
                }}
                className="flex-1 py-4 bg-white hover:bg-red-100 text-red-900 border-2 border-red-300 rounded-2xl font-black uppercase transition-all text-lg"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}