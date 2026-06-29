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

  // KKF Status badge styles
  const getKKFStatusBadge = (kkfStatus: string | null, status: string) => {
    if (status === "Draft") {
      return { bg: "bg-gray-100 text-gray-700 border-gray-200", label: "Draft" };
    }
    
    switch (kkfStatus) {
      case "Approved":
        return { bg: "bg-emerald-100 text-emerald-700 border-emerald-200", label: "KKF Approved" };
      case "Rejected":
        return { bg: "bg-red-100 text-red-700 border-red-200", label: "Rejected" };
      case "Pending":
        return { bg: "bg-amber-100 text-amber-700 border-amber-200", label: "Pending KKF" };
      default:
        return { bg: "bg-blue-100 text-blue-700 border-blue-200", label: status };
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
                <option value="Pending KKF Approval">Pending KKF Approval</option>
                <option value="KKF Approved">KKF Approved</option>
                <option value="Rejected">Rejected</option>
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
            const statusBadge = getKKFStatusBadge(event.kkfStatus, event.status);
            
            return (
              <Link
                key={event.id}
                to={`/home/events/${event.id}`}
                className="block bg-white rounded-3xl overflow-hidden shadow-[0_8px_30px_rgba(0,0,0,0.08)] border border-[#E0E0E0]/50 hover:shadow-[0_16px_50px_rgba(0,0,0,0.15)] transition-all group hover:scale-[1.02]"
              >
                {/* Event Header with gradient */}
                <div className="relative h-40 bg-gradient-to-br from-[#1A1A24] via-[#0A3D91] to-[#051C42] overflow-hidden">
                  {event.image && (
                    <>
                      <img 
                        src={event.image} 
                        alt={event.name}
                        className="absolute inset-0 w-full h-full object-cover opacity-30 group-hover:opacity-40 transition-opacity"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
                    </>
                  )}
                  
                  <div className="absolute inset-0 p-5 flex flex-col justify-between">
                    {/* Status Badges */}
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={`px-3 py-1.5 rounded-lg text-xs font-black uppercase tracking-wider border-2 backdrop-blur-xl ${statusBadge.bg}`}>
                        {statusBadge.label}
                      </span>
                      {event.hasSubEvents && (
                        <span className="px-3 py-1.5 rounded-lg text-xs font-black uppercase tracking-wider bg-purple-100 text-purple-700 border-2 border-purple-200 backdrop-blur-xl">
                          Multi-Week
                        </span>
                      )}
                    </div>

                    {/* Event Title */}
                    <div>
                      <h2 className="text-2xl font-black text-white mb-1.5 leading-tight group-hover:text-[#F2C94C] transition-colors line-clamp-2">
                        {event.name}
                      </h2>
                      <div className="flex items-center gap-2 text-white/90 font-bold text-sm">
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
                <div className="p-5">
                  {/* Location & Broadcasting - Compact Grid */}
                  <div className="grid grid-cols-2 gap-3 mb-4">
                    {/* Location */}
                    <div className="flex items-center gap-2 p-3 bg-gradient-to-r from-blue-50 to-white rounded-xl border border-blue-100">
                      <div className="w-9 h-9 bg-gradient-to-br from-[#0A3D91] to-[#051C42] rounded-lg flex items-center justify-center flex-shrink-0">
                        <MapPin className="w-5 h-5 text-white" />
                      </div>
                      <div className="min-w-0">
                        <div className="text-[10px] font-black text-[#B0B0B0] uppercase tracking-wider mb-0.5">Venue</div>
                        <div className="text-sm font-black text-[#1A1A24] truncate">{event.location}</div>
                      </div>
                    </div>

                    {/* Broadcast Station */}
                    <div className="flex items-center gap-2 p-3 bg-gradient-to-r from-purple-50 to-white rounded-xl border border-purple-100">
                      <div className="w-9 h-9 bg-gradient-to-br from-purple-600 to-purple-700 rounded-lg flex items-center justify-center flex-shrink-0">
                        <Tv className="w-5 h-5 text-white" />
                      </div>
                      <div className="min-w-0">
                        <div className="text-[10px] font-black text-[#B0B0B0] uppercase tracking-wider mb-0.5">Broadcast</div>
                        <div className="text-sm font-black text-[#1A1A24] truncate">{event.broadcastStation}</div>
                      </div>
                    </div>
                  </div>

                  {/* Main Sponsor */}
                  <div className="flex items-center gap-3 mb-4 p-3 bg-gradient-to-r from-amber-50 to-white rounded-xl border border-amber-100">
                    <div className="w-9 h-9 bg-gradient-to-br from-[#F2C94C] to-[#E6B800] rounded-lg flex items-center justify-center flex-shrink-0">
                      <DollarSign className="w-5 h-5 text-[#1A1A24]" />
                    </div>
                    <div className="min-w-0">
                      <div className="text-[10px] font-black text-[#B0B0B0] uppercase tracking-wider mb-0.5">Main Sponsor</div>
                      <div className="text-sm font-black text-[#1A1A24] truncate">{event.mainSponsor}</div>
                    </div>
                  </div>

                  {/* Event Stats - Compact 3-Column */}
                  <div className="grid grid-cols-3 gap-3 pt-4 border-t-2 border-[#E0E0E0]">
                    {/* Sub-Events/Weeks Count */}
                    <div className="text-center">
                      <div className="w-10 h-10 bg-gradient-to-br from-[#0A3D91] to-[#051C42] rounded-xl flex items-center justify-center mx-auto mb-1.5">
                        <ListChecks className="w-5 h-5 text-white" />
                      </div>
                      <div className="text-xl font-black text-[#1A1A24]">
                        {event.hasSubEvents ? event.subEventsCount : '1'}
                      </div>
                      <div className="text-[10px] font-black text-[#B0B0B0] uppercase tracking-wider">
                        {event.hasSubEvents ? 'Weeks' : 'Event'}
                      </div>
                    </div>

                    {/* Total Matches Count */}
                    <div className="text-center">
                      <div className="w-10 h-10 bg-gradient-to-br from-[#C8102E] to-[#A00D24] rounded-xl flex items-center justify-center mx-auto mb-1.5">
                        <Trophy className="w-5 h-5 text-white" />
                      </div>
                      <div className="text-xl font-black text-[#1A1A24]">
                        {event.totalMatches || 0}
                      </div>
                      <div className="text-[10px] font-black text-[#B0B0B0] uppercase tracking-wider">Matches</div>
                    </div>

                    {/* Awards Count */}
                    <div className="text-center">
                      <div className="w-10 h-10 bg-gradient-to-br from-[#F2C94C] to-[#E6B800] rounded-xl flex items-center justify-center mx-auto mb-1.5">
                        <Crown className="w-5 h-5 text-[#1A1A24]" />
                      </div>
                      <div className="text-xl font-black text-[#1A1A24]">
                        {event.linkedAwardIds?.length || 0}
                      </div>
                      <div className="text-[10px] font-black text-[#B0B0B0] uppercase tracking-wider">Champion</div>
                    </div>
                  </div>

                  {/* Description & CTA */}
                  <div className="mt-4 pt-4 border-t-2 border-[#E0E0E0]">
                    {event.description && (
                      <p className="text-xs text-[#707070] font-medium line-clamp-2 mb-3">
                        {event.description}
                      </p>
                    )}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-[#0A3D91]">
                        <Clock className="w-4 h-4" />
                        <span className="text-xs font-bold">
                          {event.status === "Completed" ? "Event Completed" : 
                           event.status === "In Progress" ? "Currently Live" :
                           event.status === "Published" ? "Upcoming Event" :
                           event.status}
                        </span>
                      </div>
                      <div className="inline-flex items-center gap-2 text-[#0A3D91] font-black text-sm group-hover:gap-3 transition-all">
                        <span>View Details</span>
                        <TrendingUp className="w-4 h-4" />
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}