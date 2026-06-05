import { useState } from "react";
import { Link } from "react-router";
import { Plus, Calendar, MapPin, Tv, DollarSign, Search, Trophy, Clock, CheckCircle, AlertTriangle, TrendingUp, Users, ListChecks, Building2, Crown, ArrowRight } from "lucide-react";
import { MOCK_EVENTS, MOCK_SUB_EVENTS } from "../data/mock";
import { getBroadcastStationById, getSponsorById } from "../data/masterData";
import { usePermissions } from "../hooks/usePermissions";

export function EventsAndMatches() {
  const permissions = usePermissions();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  // Enhanced events with metadata
  const enhancedEvents = MOCK_EVENTS.map(event => {
    const broadcastStation = getBroadcastStationById(event.broadcastStationId || "");
    const mainSponsor = getSponsorById(event.mainSponsorId || "");
    const subEvents = MOCK_SUB_EVENTS.filter(se => se.mainEventId === event.id);
    const totalMatches = subEvents.reduce((sum, se) => sum + se.matchesCount, 0);
    
    return {
      ...event,
      broadcastStation: broadcastStation?.name || event.station,
      broadcastLogo: broadcastStation?.logoUrl,
      mainSponsor: mainSponsor?.name || event.sponsor,
      sponsorLogo: mainSponsor?.logoUrl,
      subEventsCount: subEvents.length,
      totalMatches,
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F4F5F8] via-white to-[#F9FAFB]">
      <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h1 className="text-5xl md:text-6xl font-black tracking-tighter text-[#1A1A24] uppercase mb-3 leading-none">
              Events & Matches
            </h1>
            <p className="text-[#707070] font-medium text-lg">
              Manage fight nights, broadcasts, and schedules • {filteredEvents.length} {filteredEvents.length === 1 ? 'event' : 'events'} found
            </p>
          </div>
          
          {permissions.hasPermission('events.create') && (
            <Link
              to="/home/events/new"
              className="inline-flex items-center justify-center gap-2 bg-gradient-to-r from-[#C8102E] to-[#A00D24] hover:from-[#A00D24] hover:to-[#8A0B20] text-white px-8 py-4 rounded-2xl font-black uppercase tracking-wider transition-all shadow-xl hover:shadow-2xl hover:scale-[1.02]"
            >
              <Plus className="w-5 h-5" />
              Create Event
            </Link>
          )}
        </header>

        {/* Filters */}
        <div className="bg-white rounded-3xl p-6 shadow-[0_8px_30px_rgba(0,0,0,0.08)] border border-[#E0E0E0]/50">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#707070]" />
              <input
                type="text"
                placeholder="Search events, venues, broadcasters, sponsors..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-[#F4F5F8] border-2 border-[#E0E0E0] rounded-xl pl-12 pr-4 py-3.5 text-[#1A1A24] font-semibold focus:ring-2 focus:ring-[#0A3D91] focus:border-[#0A3D91] transition-all placeholder:text-[#B0B0B0]"
              />
            </div>

            {/* Status Filter */}
            <div>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full bg-[#F4F5F8] border-2 border-[#E0E0E0] rounded-xl px-4 py-3.5 text-[#1A1A24] font-bold focus:ring-2 focus:ring-[#0A3D91] focus:border-[#0A3D91] transition-all"
              >
                <option value="all">All Status</option>
                <option value="Draft">Draft</option>
                <option value="Published">Published</option>
                <option value="In Progress">In Progress</option>
                <option value="Completed">Completed</option>
              </select>
            </div>
          </div>
        </div>

        {/* Events Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredEvents.length === 0 && (
            <div className="col-span-full bg-white rounded-3xl p-16 text-center shadow-[0_8px_30px_rgba(0,0,0,0.08)] border border-[#E0E0E0]/50">
              <Calendar className="w-20 h-20 text-[#E0E0E0] mx-auto mb-6" />
              <h3 className="text-2xl font-black text-[#1A1A24] mb-3">No Events Found</h3>
              <p className="text-[#707070] font-medium text-lg mb-8">
                No events match your current filters. Try adjusting your search.
              </p>
              {permissions.hasPermission('events.create') && (
                <Link
                  to="/home/events/new"
                  className="inline-flex items-center gap-2 bg-gradient-to-r from-[#0A3D91] to-[#051C42] text-white px-6 py-3 rounded-xl font-bold"
                >
                  <Plus className="w-5 h-5" />
                  Create First Event
                </Link>
              )}
            </div>
          )}

          {filteredEvents.map((event) => {
            const statusBadge = getStatusBadge(event.status);
            
            return (
              <div
                key={event.id}
                className="bg-white rounded-3xl overflow-hidden shadow-[0_4px_20px_rgba(0,0,0,0.08)] border-2 border-[#E0E0E0]/30 hover:shadow-[0_12px_40px_rgba(0,0,0,0.12)] hover:border-[#0A3D91]/20 transition-all group"
              >
                {/* Event Header with gradient */}
                <div className="relative h-48 bg-gradient-to-br from-[#1A1A24] via-[#0A3D91] to-[#051C42] overflow-hidden">
                  {event.image && (
                    <>
                      <img 
                        src={event.image} 
                        alt={event.name}
                        className="absolute inset-0 w-full h-full object-cover opacity-30 group-hover:opacity-40 group-hover:scale-105 transition-all duration-700"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
                    </>
                  )}
                  
                  <div className="absolute inset-0 p-6 flex flex-col justify-between">
                    {/* Status Badges */}
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-black uppercase tracking-wider border-2 backdrop-blur-xl shadow-lg ${statusBadge.bg}`}>
                        <span>{statusBadge.icon}</span>
                        {statusBadge.label}
                      </span>
                      {event.hasSubEvents && (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-black uppercase tracking-wider bg-[#F2C94C] text-[#1A1A24] border-2 border-[#F2C94C] backdrop-blur-xl shadow-lg">
                          <span>🗓️</span>
                          Multi-Week
                        </span>
                      )}
                    </div>

                    {/* Event Title */}
                    <div>
                      <h2 className="text-2xl md:text-3xl font-black text-white mb-2 leading-tight group-hover:text-[#F2C94C] transition-colors line-clamp-2 drop-shadow-lg">
                        {event.name}
                      </h2>
                      <div className="flex items-center gap-2 text-white/90 font-bold text-sm backdrop-blur-sm bg-black/30 px-3 py-1.5 rounded-lg inline-flex w-fit">
                        <Calendar className="w-4 h-4 text-[#F2C94C]" />
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
                <div className="p-6 space-y-4">
                  {/* Location & Broadcasting */}
                  <div className="space-y-2">
                    {/* Location */}
                    <div className="flex items-center gap-3 p-3 bg-gradient-to-r from-blue-50 to-white rounded-xl border border-blue-100 group/item hover:border-[#0A3D91] transition-colors">
                      <div className="w-10 h-10 bg-gradient-to-br from-[#0A3D91] to-[#051C42] rounded-xl flex items-center justify-center flex-shrink-0 shadow-sm">
                        <MapPin className="w-5 h-5 text-white" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="text-[10px] font-black text-[#B0B0B0] uppercase tracking-wider mb-0.5">Venue</div>
                        <div className="text-sm font-black text-[#1A1A24] truncate">{event.location}</div>
                      </div>
                    </div>

                    {/* Broadcast Station */}
                    <div className="flex items-center gap-3 p-3 bg-gradient-to-r from-purple-50 to-white rounded-xl border border-purple-100 group/item hover:border-purple-600 transition-colors">
                      <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-purple-700 rounded-xl flex items-center justify-center flex-shrink-0 shadow-sm">
                        <Tv className="w-5 h-5 text-white" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="text-[10px] font-black text-[#B0B0B0] uppercase tracking-wider mb-0.5">Broadcast</div>
                        <div className="text-sm font-black text-[#1A1A24] truncate">{event.broadcastStation}</div>
                      </div>
                    </div>

                    {/* Main Sponsor */}
                    <div className="flex items-center gap-3 p-3 bg-gradient-to-r from-amber-50 to-white rounded-xl border border-amber-100 group/item hover:border-[#F2C94C] transition-colors">
                      <div className="w-10 h-10 bg-gradient-to-br from-[#F2C94C] to-[#E6B800] rounded-xl flex items-center justify-center flex-shrink-0 shadow-sm">
                        <DollarSign className="w-5 h-5 text-[#1A1A24]" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="text-[10px] font-black text-[#B0B0B0] uppercase tracking-wider mb-0.5">Main Sponsor</div>
                        <div className="text-sm font-black text-[#1A1A24] truncate">{event.mainSponsor}</div>
                      </div>
                    </div>
                  </div>

                  {/* View Details Button */}
                  <Link
                    to={`/home/events/${event.id}`}
                    className="flex items-center justify-center gap-2 w-full bg-gradient-to-r from-[#0A3D91] to-[#051C42] hover:from-[#C8102E] hover:to-[#A00D24] text-white py-3.5 rounded-xl font-black uppercase tracking-wider transition-all shadow-md hover:shadow-xl group/btn"
                  >
                    <span>View Full Details</span>
                    <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}