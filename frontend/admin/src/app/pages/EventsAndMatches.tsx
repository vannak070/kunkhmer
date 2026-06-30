import { useState, useEffect } from "react";
import { Link } from "react-router";
import { Plus, Calendar, MapPin, Tv, DollarSign, Search, Trophy, Clock, CheckCircle, AlertTriangle, TrendingUp, Users, ListChecks, Building2, Crown, ArrowRight, Trash2 } from "lucide-react";
import { api } from "../utils/api";
import { usePermissions } from "../hooks/usePermissions";
import { toast } from "sonner";
import { clsx } from "clsx";

export function EventsAndMatches({ embedded = false }: { embedded?: boolean }) {
  const permissions = usePermissions();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [events, setEvents] = useState<any[]>([]);
  const [subEvents, setSubEvents] = useState<any[]>([]);
  const [matches, setMatches] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedEventId, setExpandedEventId] = useState<string | null>(null);

  const toggleEventExpansion = (eventId: string) => {
    setExpandedEventId(prev => prev === eventId ? null : eventId);
  };

  const handleCreateQuickBatch = async (eventId: string, eventDate: string, eventName: string, eventLocation: string) => {
    const formattedDate = eventDate ? new Date(eventDate).toISOString().split("T")[0] : new Date().toISOString().split("T")[0];
    const name = window.prompt("Enter batch name (e.g. Week 1, Fight Night Card):", `Week ${subEvents.filter(s => s.event_id === eventId).length + 1}`);
    if (!name) return;

    const dateStr = window.prompt("Enter date for this fight card batch (YYYY-MM-DD):", formattedDate);
    if (!dateStr) return;

    try {
      const eventBatches = subEvents.filter(s => s.event_id === eventId);
      const weekNumber = eventBatches.length + 1;

      await api.batches.create({
        eventId: eventId,
        name: name,
        weekNumber: weekNumber,
        date: dateStr,
        location: eventLocation || "Olympic Stadium Arena",
        phase: "Qualifier",
        status: "Draft",
        batchNumber: `BATCH-${Date.now().toString().slice(-6)}`,
      });
      toast.success("✅ Fight card batch created successfully!");
      loadData();
    } catch (err: any) {
      toast.error(`Failed to create batch: ${err.message}`);
    }
  };

  const handleDeleteMatch = async (matchId: string) => {
    const confirmed = window.confirm("Are you sure you want to delete this match?");
    if (!confirmed) return;

    try {
      await api.matches.delete(matchId);
      toast.success("🗑️ Match deleted successfully!");
      loadData();
    } catch (err: any) {
      toast.error("Failed to delete match: " + err.message);
    }
  };

  const handleDeleteBatch = async (batchId: string, batchNumber: string) => {
    const confirmed = window.confirm(`Are you sure you want to delete "${batchNumber}"? All matches inside will be unassigned.`);
    if (!confirmed) return;

    try {
      await api.batches.delete(batchId);
      toast.success(`🗑️ Batch "${batchNumber}" deleted successfully!`);
      loadData();
    } catch (err: any) {
      toast.error("Failed to delete batch: " + err.message);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const eventsList = await api.events.list();
      const subEventsList = await api.batches.list();
      const matchesList = await api.matches.list();
      
      setEvents(eventsList);
      setSubEvents(subEventsList);
      setMatches(matchesList);
    } catch (err: any) {
      toast.error("Failed to load events: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteEvent = async (eventId: string, eventName: string) => {
    const confirmed = window.confirm(`Are you sure you want to delete "${eventName}"? This action will permanently remove it and all associated matches.`);
    if (!confirmed) return;

    try {
      await api.events.delete(eventId);
      toast.success(`Event "${eventName}" deleted successfully!`);
      loadData();
    } catch (err: any) {
      toast.error(`Failed to delete event: ${err.message}`);
    }
  };

  // Enhanced events with metadata
  const enhancedEvents = events.map(event => {
    const eventSubEvents = subEvents.filter(se => se.event_id === event.id);
    const subEventIds = eventSubEvents.map(se => se.id);
    const totalMatches = matches.filter((m: any) => subEventIds.includes(m.sub_event_id)).length;
    
    // Format date string from PostgreSQL DATE format (YYYY-MM-DD)
    const formatDate = (dateStr: string) => {
      if (!dateStr) return "TBD";
      return new Date(dateStr).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric"
      });
    };
    
    return {
      ...event,
      date: formatDate(event.date),
      endDate: event.end_date ? formatDate(event.end_date) : null,
      broadcastStation: event.broadcast_station_name || "TBD",
      broadcastLogo: event.broadcast_station_logo_url,
      mainSponsor: event.main_sponsor_name || "TBD",
      sponsorLogo: event.main_sponsor_logo_url,
      subEventsCount: eventSubEvents.length,
      totalMatches,
      hasSubEvents: eventSubEvents.length > 0,
    };
  });

  // Filter events
  const filteredEvents = enhancedEvents.filter(event => {
    // Search filter
    const matchesSearch = (event.name || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
                          (event.location || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
                          (event.broadcastStation || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
                          (event.mainSponsor || "").toLowerCase().includes(searchTerm.toLowerCase());
    
    // Status filter
    const matchesStatus = statusFilter === "all" || event.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  // Status badge styles (simplified - no approval process)
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Draft":
        return { 
          bg: "bg-[#F4F5F8] text-[#707070] border-[#E0E0E0]", 
          label: "Draft",
          icon: "📝" 
        };
      case "Published":
      case "Approved":
        return { 
          bg: "bg-[#0A3D91] text-white border-[#0A3D91]", 
          label: "Published",
          icon: "📢" 
        };
      case "Ongoing":
      case "In Progress":
        return { 
          bg: "bg-[#C8102E] text-white border-[#C8102E]", 
          label: "In Progress",
          icon: "🔴" 
        };
      case "Completed":
        return { 
          bg: "bg-emerald-600 text-white border-emerald-600", 
          label: "Completed",
          icon: "✅" 
        };
      case "Cancelled":
        return {
          bg: "bg-rose-50 text-rose-700 border-rose-200",
          label: "Cancelled",
          icon: "🚫"
        };
      default:
        return { 
          bg: "bg-[#F4F5F8] text-[#707070] border-[#E0E0E0]", 
          label: status,
          icon: "•" 
        };
    }
  };

  const getEventBadgeClass = (status: string) => {
    switch (status) {
      case "Draft": return "bg-white/10 text-white border-white/20";
      case "Published":
      case "Approved": return "badge-blue shadow-sm bg-blue-50/95 border-blue-200/50";
      case "Ongoing":
      case "In Progress": return "badge-red shadow-sm bg-red-50/95 border-red-200/50";
      case "Completed": return "badge-emerald shadow-sm bg-emerald-50/95 border-emerald-200/50";
      case "Cancelled": return "bg-rose-50/95 text-rose-700 border-rose-200/50";
      default: return "bg-white/10 text-white border-white/20";
    }
  };

  const getEventDotClass = (status: string) => {
    switch (status) {
      case "Draft": return "bg-slate-400";
      case "Published":
      case "Approved": return "bg-[#0A3D91]";
      case "Ongoing":
      case "In Progress": return "bg-[#C8102E]";
      case "Completed": return "bg-emerald-500";
      case "Cancelled": return "bg-rose-600";
      default: return "bg-slate-400";
    }
  };

  return (
    <div className={embedded ? "space-y-6 flex flex-col min-h-full" : "p-4 md:p-8 max-w-7xl mx-auto space-y-6 flex flex-col min-h-full animate-fadeIn"}>
      {/* Header */}
      {!embedded && (
        <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-foreground">
              Events & Matches
            </h1>
            <p className="text-sm text-muted-foreground mt-1 font-medium">
              Manage fight nights, broadcasts, and schedules • {filteredEvents.length} {filteredEvents.length === 1 ? 'event' : 'events'} found
            </p>
          </div>
          
          {permissions.hasPermission('events.create') && (
            <Link
              to="/home/events/new"
              className="btn-primary py-2.5 px-5"
            >
              <Plus className="w-4 h-4" />
              Create Event
            </Link>
          )}
        </header>
      )}

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4 relative z-10">
        {/* Search */}
        <div className="relative flex-1 group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
          <input
            type="text"
            placeholder="Search events, venues, broadcasters, sponsors..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-white border border-border/80 rounded-xl pl-11 pr-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/5 shadow-sm transition-all"
          />
        </div>

        {/* Status Filter */}
        <div className="flex gap-3">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2.5 bg-white border border-border/80 rounded-xl text-sm font-medium text-foreground focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/5 shadow-sm hover:border-slate-300 transition-all cursor-pointer min-w-[140px]"
          >
            <option value="all">All Status</option>
            <option value="Draft">Draft</option>
            <option value="Published">Published</option>
            <option value="In Progress">In Progress</option>
            <option value="Completed">Completed</option>
          </select>
        </div>
      </div>

      {/* Events Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {loading ? (
          <div className="col-span-full py-16 text-center">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary mx-auto"></div>
            <p className="text-sm text-muted-foreground mt-4 font-semibold">Loading events...</p>
          </div>
        ) : filteredEvents.length === 0 ? (
          <div className="col-span-full py-16 text-center bg-white rounded-2xl border border-border/60 shadow-sm">
            <Calendar className="w-16 h-16 text-muted-foreground/60 mx-auto mb-4" />
            <h3 className="text-lg font-bold text-foreground tracking-tight mb-1">No Events Found</h3>
            <p className="text-sm text-muted-foreground max-w-sm mx-auto mb-4">
              No events match your current filters. Try adjusting your search term.
            </p>
            {permissions.hasPermission('events.create') && (
              <Link
                to="/home/events/new"
                className="btn-outline inline-flex py-2 px-4 text-xs font-semibold"
              >
                <Plus className="w-3.5 h-3.5" />
                Create First Event
              </Link>
            )}
          </div>
        ) : null}

        {filteredEvents.map((event) => {
          const statusBadge = getStatusBadge(event.status);
          
          return (
            <div
              key={event.id}
              className={clsx(
                "bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl border flex flex-col group transition-all duration-300",
                expandedEventId === event.id
                  ? "border-primary ring-4 ring-primary/5 lg:col-span-2 shadow-lg scale-[1.01]"
                  : "border-border/75 hover:border-primary/20 hover:-translate-y-1"
              )}
            >
              {/* Event Header with background image/gradient */}
              <div className="relative h-44 bg-gradient-to-br from-[#121826] via-[#0A3D91]/95 to-[#051C42] overflow-hidden">
                {event.image && (
                  <>
                    <img 
                      src={event.image} 
                      alt={event.name}
                      className="absolute inset-0 w-full h-full object-cover opacity-25 group-hover:opacity-35 group-hover:scale-105 transition-all duration-700"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent" />
                  </>
                )}
                
                <div className="absolute inset-0 p-5 flex flex-col justify-between">
                  {/* Status Badges */}
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className={`badge-premium ${getEventBadgeClass(event.status)}`}>
                      <span className={`badge-dot ${getEventDotClass(event.status)}`} />
                      {statusBadge.label}
                    </span>
                    {event.hasSubEvents && (
                      <span className="badge-premium bg-amber-50/90 text-amber-700 border-amber-200/50">
                        <span className="badge-dot bg-amber-500" />
                        Multi-Week
                      </span>
                    )}
                  </div>

                  {/* Event Title */}
                  <div>
                    <h2 className="text-xl md:text-2xl font-bold text-white mb-2 leading-tight group-hover:text-accent transition-colors line-clamp-1 drop-shadow-md">
                      {event.name}
                    </h2>
                    <div className="flex items-center gap-2 text-white/90 font-bold text-xs bg-slate-900/40 border border-white/10 px-2.5 py-1 rounded-lg inline-flex w-fit">
                      <Calendar className="w-3.5 h-3.5 text-accent" />
                      <span>{event.date}</span>
                      {event.endDate && event.endDate !== event.date && (
                        <>
                          <span>→</span>
                          <span>{event.endDate}</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Event Details */}
              <div className="p-5 flex-1 flex flex-col justify-between gap-4">
                {/* Location & Broadcasting */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  {/* Location */}
                  <div className="flex items-center gap-2.5 p-2.5 bg-muted/15 rounded-xl border border-border/40 hover:bg-muted/20 hover:border-border/60 transition-all duration-200">
                    <div className="w-8 h-8 bg-muted/50 text-secondary rounded-lg flex items-center justify-center shrink-0 border border-border/10">
                      <MapPin className="w-4 h-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="text-[9px] font-bold text-muted-foreground uppercase tracking-wider">Venue</div>
                      <div className="text-xs font-semibold text-slate-800 truncate">{event.location}</div>
                    </div>
                  </div>

                  {/* Broadcast Station */}
                  <div className="flex items-center gap-2.5 p-2.5 bg-muted/15 rounded-xl border border-border/40 hover:bg-muted/20 hover:border-border/60 transition-all duration-200">
                    <div className="w-8 h-8 bg-muted/50 text-[#0A3D91] rounded-lg flex items-center justify-center shrink-0 border border-border/10">
                      <Tv className="w-4 h-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="text-[9px] font-bold text-muted-foreground uppercase tracking-wider">Broadcast</div>
                      <div className="text-xs font-semibold text-slate-800 truncate">{event.broadcastStation}</div>
                    </div>
                  </div>

                  {/* Main Sponsor */}
                  <div className="flex items-center gap-2.5 p-2.5 bg-muted/15 rounded-xl border border-border/40 hover:bg-muted/20 hover:border-border/60 transition-all duration-200">
                    <div className="w-8 h-8 bg-muted/50 text-amber-600 rounded-lg flex items-center justify-center shrink-0 border border-border/10">
                      <DollarSign className="w-4 h-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="text-[9px] font-bold text-muted-foreground uppercase tracking-wider">Sponsor</div>
                      <div className="text-xs font-semibold text-slate-800 truncate">{event.mainSponsor}</div>
                    </div>
                  </div>
                </div>

                {/* Footer Actions */}
                <div className="flex gap-2.5 w-full mt-auto">
                  <Link
                    to={`/home/events/${event.id}`}
                    className="btn-outline flex-1 py-2 flex items-center justify-center gap-1.5 text-xs font-bold hover:bg-slate-50"
                  >
                    <span>View Details</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                  <button
                    type="button"
                    onClick={() => toggleEventExpansion(event.id)}
                    className={clsx(
                      "flex-1 py-2 flex items-center justify-center gap-1.5 text-xs font-bold rounded-xl transition-all border",
                      expandedEventId === event.id
                        ? "bg-slate-800 text-white border-slate-800"
                        : "bg-[#0A3D91]/5 text-[#0A3D91] border-[#0A3D91]/10 hover:bg-[#0A3D91]/10"
                    )}
                  >
                    <span>{expandedEventId === event.id ? "Hide Fight Card" : "Quick Manage"}</span>
                    <ListChecks className="w-3.5 h-3.5" />
                  </button>
                  {(permissions.hasPermission("events.delete") || permissions.role === "Super Admin") && (
                    <button
                      type="button"
                      onClick={() => handleDeleteEvent(event.id, event.name)}
                      className="p-2 border border-red-200 hover:border-red-500 hover:bg-red-50 text-red-605 rounded-xl transition-all shadow-sm active:scale-95 shrink-0"
                      title="Delete Event"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>

                {/* Collapsible Match Drawer */}
                {expandedEventId === event.id && (
                  <div className="mt-4 pt-4 border-t border-slate-100 bg-slate-50/50 -mx-5 -mb-5 p-5 space-y-4 animate-fadeIn">
                    <div className="flex justify-between items-center">
                      <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                        <Swords className="w-3.5 h-3.5 text-primary" />
                        <span>Fight Card Batches</span>
                      </h4>
                      <button
                        type="button"
                        onClick={() => handleCreateQuickBatch(event.id, event.date, event.name, event.location)}
                        className="text-[10px] text-primary font-bold uppercase tracking-wider flex items-center gap-1 hover:underline"
                      >
                        <Plus className="w-3 h-3" />
                        <span>Add Batch</span>
                      </button>
                    </div>

                    {subEvents.filter(s => s.event_id === event.id).length === 0 ? (
                      <div className="text-center py-6 bg-white rounded-xl border border-dashed border-slate-200">
                        <p className="text-xs text-slate-500 font-semibold mb-2">No batches scheduled yet</p>
                        <button
                          type="button"
                          onClick={() => handleCreateQuickBatch(event.id, event.date, event.name, event.location)}
                          className="btn-primary inline-flex py-1 px-3 text-[10px] uppercase font-bold"
                        >
                          Create First Batch
                        </button>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {subEvents.filter(s => s.event_id === event.id).map((batch) => {
                          const batchMatches = matches.filter(m => m.sub_event_id === batch.id);

                          return (
                            <div key={batch.id} className="bg-white border border-slate-150 rounded-xl p-3.5 shadow-sm space-y-2.5">
                              <div className="flex justify-between items-center pb-2 border-b border-slate-100">
                                <div>
                                  <span className="text-xs font-bold text-slate-900">{batch.name || `Batch #${batch.week_number}`}</span>
                                  <span className="text-[10px] text-slate-500 font-medium ml-2">({batch.date?.split("T")[0]})</span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <Link
                                    to={`/home/matches/${batch.id}/create-match`}
                                    className="text-[10px] text-primary font-bold hover:underline flex items-center gap-0.5"
                                  >
                                    <Plus className="w-2.5 h-2.5" /> Match
                                  </Link>
                                  <span className="text-slate-300">|</span>
                                  <button
                                    type="button"
                                    onClick={() => handleDeleteBatch(batch.id, batch.name || `Batch #${batch.week_number}`)}
                                    className="text-red-500 hover:text-red-755"
                                    title="Delete Batch"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              </div>

                              {batchMatches.length === 0 ? (
                                <p className="text-[10px] text-slate-400 font-medium italic py-1 text-center">No matches added yet</p>
                              ) : (
                                <div className="space-y-1.5">
                                  {batchMatches.map((match) => {
                                    const isChampionship = match.isTitleMatch || match.is_title_match;
                                    return (
                                      <div key={match.id} className="flex justify-between items-center p-2 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors group/match">
                                        <div className="min-w-0 flex-1 flex items-center gap-1.5 text-[11px] font-semibold text-slate-800">
                                          {isChampionship && <Crown className="w-3 h-3 text-amber-500 shrink-0" />}
                                          <span className="truncate">{match.fighter_a_name || "TBD"}</span>
                                          <span className="text-muted-foreground font-normal">vs</span>
                                          <span className="truncate">{match.fighter_b_name || "TBD"}</span>
                                          <span className="text-[9px] text-slate-505 bg-slate-200/50 px-1.5 py-0.5 rounded ml-2 shrink-0">{match.agreed_weight || match.weight_class} kg</span>
                                        </div>
                                        <button
                                          type="button"
                                          onClick={() => handleDeleteMatch(match.id)}
                                          className="opacity-0 group-hover/match:opacity-100 text-red-500 hover:text-red-700 transition-opacity p-0.5"
                                          title="Delete Match"
                                        >
                                          <Trash2 className="w-3 h-3" />
                                        </button>
                                      </div>
                                    );
                                  })}
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}