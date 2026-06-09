import { useState, useEffect } from "react";
import { Link } from "react-router";
import { Plus, Calendar, MapPin, Tv, DollarSign, Search, Trophy, Clock, CheckCircle, AlertTriangle, TrendingUp, Users, ListChecks, Building2, Crown, ArrowRight } from "lucide-react";
import { api } from "../utils/api";
import { usePermissions } from "../hooks/usePermissions";
import { toast } from "sonner";

export function EventsAndMatches() {
  const permissions = usePermissions();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [events, setEvents] = useState<any[]>([]);
  const [subEvents, setSubEvents] = useState<any[]>([]);
  const [matches, setMatches] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

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
    const matchesSearch = event.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          event.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          event.broadcastStation.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          event.mainSponsor.toLowerCase().includes(searchTerm.toLowerCase());
    
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
        return { 
          bg: "bg-[#0A3D91] text-white border-[#0A3D91]", 
          label: "Published",
          icon: "📢" 
        };
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
      case "Published": return "badge-blue shadow-sm bg-blue-50/95 border-blue-200/50";
      case "In Progress": return "badge-red shadow-sm bg-red-50/95 border-red-200/50";
      case "Completed": return "badge-emerald shadow-sm bg-emerald-50/95 border-emerald-200/50";
      default: return "bg-white/10 text-white border-white/20";
    }
  };

  const getEventDotClass = (status: string) => {
    switch (status) {
      case "Draft": return "bg-slate-400";
      case "Published": return "bg-[#0A3D91]";
      case "In Progress": return "bg-[#C8102E]";
      case "Completed": return "bg-emerald-500";
      default: return "bg-slate-400";
    }
  };

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-6 flex flex-col min-h-full animate-fadeIn">
      {/* Header */}
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
              className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl border border-border/75 hover:border-primary/20 hover:-translate-y-1.5 transition-all duration-300 flex flex-col group"
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

                {/* View Details Button */}
                <Link
                  to={`/home/events/${event.id}`}
                  className="btn-primary w-full py-2 flex items-center justify-center gap-1.5 text-sm font-semibold hover:-translate-y-[1px]"
                >
                  <span>View Full Details</span>
                  <ArrowRight className="w-4 h-4 shrink-0 transition-transform duration-200" />
                </Link>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}