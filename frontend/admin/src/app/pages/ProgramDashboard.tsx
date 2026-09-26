import { useState, useEffect } from "react";
import { useSearchParams, useNavigate, Link } from "react-router";
import { 
  Trophy, Calendar, Swords, Crown, Search, Plus, 
  Tv, MapPin, DollarSign, ArrowRight, Activity, 
  Clock, ShieldAlert, Award, Star, ListPlus, Sparkles 
} from "lucide-react";
import { api } from "../utils/api";
import { usePermissions } from "../hooks/usePermissions";
import { EventsAndMatches } from "./EventsAndMatches";
import { MatchesEnhanced } from "./MatchesEnhanced";
import { Champion } from "./Champion";
import { toast } from "sonner";
import { clsx } from "clsx";

export function ProgramDashboard() {
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = searchParams.get("tab") || "overview";
  const navigate = useNavigate();
  const permissions = usePermissions();

  const [stats, setStats] = useState({
    eventsCount: 0,
    activeEvents: 0,
    batchesCount: 0,
    liveBatches: 0,
    championsCount: 0,
    activeChamps: 0,
  });

  const [upcomingEvent, setUpcomingEvent] = useState<any>(null);

  const [upcomingIsPast, setUpcomingIsPast] = useState(false);
  const [topChampions, setTopChampions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      const [eventsList, batchesList, championsList, fightersList] = await Promise.all([
        api.events.list(),
        api.batches.list(),
        api.champions.list(),
        api.fighters.list()
      ]);

      // Calculate statistics
      const activeEvs = eventsList.filter((e: any) => e.status === "In Progress" || e.status === "Published").length;
      const liveBts = batchesList.filter((b: any) => b.status === "Live" || b.status === "Weight-In").length;
      const activeChampsCount = championsList.filter((c: any) => c.status === "Active" || c.status === "Title Defense Scheduled").length;

      setStats({
        eventsCount: eventsList.length,
        activeEvents: activeEvs,
        batchesCount: batchesList.length,
        liveBatches: liveBts,
        championsCount: championsList.length,
        activeChamps: activeChampsCount,
      });

      // Find the next upcoming or in progress event
      const sortedEvents = [...eventsList].sort((a: any, b: any) => {
        const dateA = new Date(a.date).getTime();
        const dateB = new Date(b.date).getTime();
        return dateA - dateB;
      });

      // Next fight night = today or later and not a draft/closed event; otherwise show the latest past one, labelled as such.
      const today = new Date(new Date().toISOString().slice(0, 10)).getTime();
      const open = (e: any) => !["Draft", "Cancelled", "Completed"].includes(e.status);
      const nextEvent = sortedEvents.find((e: any) => new Date(e.date).getTime() >= today && open(e));
      const lastEvent = [...sortedEvents].reverse().find((e: any) => new Date(e.date).getTime() < today && e.status !== "Draft");
      setUpcomingEvent(nextEvent ?? lastEvent ?? null);
      setUpcomingIsPast(!nextEvent && Boolean(lastEvent));

      // Top champions (sorted by defenses descending)
      const sortedChamps = [...championsList]
        .filter((c: any) => c.status === "Active" && c.current_holder_id)
        .sort((a: any, b: any) => (parseInt(b.defense_count) || 0) - (parseInt(a.defense_count) || 0))
        .slice(0, 3)
        .map((champ: any) => {
          const holderFighter = fightersList.find((f: any) => f.id === champ.current_holder_id);
          return {
            ...champ,
            holderName: champ.current_holder_name_db || champ.current_holder_name || "Vacant",
            holderImage: holderFighter?.image || champ.belt_image_url || null,
          };
        });
      setTopChampions(sortedChamps);

    } catch (err: any) {
      console.error(err);
      toast.error("Failed to load dashboard statistics");
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (tabName: string) => {
    setSearchParams({ tab: tabName });
  };

  const getTabClass = (tabName: string) => {
    const isActive = activeTab === tabName;
    return clsx(
      "flex items-center gap-2 px-5 py-3 text-sm font-semibold rounded-xl transition-all duration-200 border cursor-pointer",
      isActive
        ? "bg-primary text-white border-primary shadow-lg shadow-primary/15 scale-[1.02]"
        : "bg-white text-slate-600 border-border hover:bg-slate-50 hover:text-slate-900 hover:border-slate-300"
    );
  };

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-6 min-h-screen bg-[#F8FAFC]">
      
      {/* Header */}
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-200 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 bg-primary/10 text-primary rounded-xl">
              <Calendar className="w-6 h-6" />
            </span>
            <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight">
              Program Workspace
            </h1>
          </div>
          <p className="text-sm text-slate-500 mt-1 font-medium pl-10">
            Consolidated portal to schedule events, coordinate match fight cards, and manage championships.
          </p>
        </div>

        {/* Quick actions depending on active view */}
        <div className="flex items-center gap-3 self-end md:self-auto pl-10 md:pl-0">
          {permissions.hasPermission("events.create") && (
            <>
              {activeTab === "events" && (
                <Link to="/home/events/new" className="btn-primary py-2.5 px-5 flex items-center gap-2 text-xs uppercase tracking-wider font-bold rounded-xl shadow-md shadow-primary/10 hover:-translate-y-0.5 transition-transform duration-200">
                  <Plus className="w-4 h-4" /> Create Event
                </Link>
              )}
              {/* Matches tab: the list below has its own "Create fight card" button. */}
              {activeTab === "champions" && (
                <Link to="/home/champion/new" className="btn-primary py-2.5 px-5 flex items-center gap-2 text-xs uppercase tracking-wider font-bold rounded-xl shadow-md shadow-primary/10 hover:-translate-y-0.5 transition-transform duration-200">
                  <Crown className="w-4 h-4" /> Create Title
                </Link>
              )}
            </>
          )}
        </div>
      </header>

      {/* Tabs list */}
      <div className="flex flex-wrap gap-2.5">
        <button onClick={() => handleTabChange("overview")} className={getTabClass("overview")}>
          <Activity className="w-4 h-4" />
          Workspace Overview
        </button>
        <button onClick={() => handleTabChange("events")} className={getTabClass("events")}>
          <Calendar className="w-4 h-4" />
          Events
          {stats.eventsCount > 0 && (
            <span className={clsx("ml-1.5 px-2 py-0.5 text-[10px] rounded-full font-bold", activeTab === "events" ? "bg-white text-primary" : "bg-slate-100 text-slate-600")}>
              {stats.eventsCount}
            </span>
          )}
        </button>
        <button onClick={() => handleTabChange("matches")} className={getTabClass("matches")}>
          <Swords className="w-4 h-4" />
          Matches
          {stats.batchesCount > 0 && (
            <span className={clsx("ml-1.5 px-2 py-0.5 text-[10px] rounded-full font-bold", activeTab === "matches" ? "bg-white text-primary" : "bg-slate-100 text-slate-600")}>
              {stats.batchesCount}
            </span>
          )}
        </button>
        <button onClick={() => handleTabChange("champions")} className={getTabClass("champions")}>
          <Trophy className="w-4 h-4" />
          Champions
          {stats.championsCount > 0 && (
            <span className={clsx("ml-1.5 px-2 py-0.5 text-[10px] rounded-full font-bold", activeTab === "champions" ? "bg-white text-primary" : "bg-slate-100 text-slate-600")}>
              {stats.championsCount}
            </span>
          )}
        </button>
      </div>

      {/* Main content display */}
      <div className="bg-transparent rounded-2xl">
        {loading ? (
          <div className="py-24 text-center bg-white rounded-2xl border border-slate-100 shadow-sm">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            <p className="text-sm text-slate-500 mt-4 font-semibold">Loading Program workspace data...</p>
          </div>
        ) : (
          <>
            {activeTab === "overview" && (
              <div className="space-y-6 animate-fadeIn">
                
                {/* Stats row */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                  
                  {/* Events Stats */}
                  <div 
                    onClick={() => handleTabChange("events")}
                    className="bg-white p-5 rounded-2xl border border-slate-100 hover:border-primary/20 shadow-sm hover:shadow-md cursor-pointer transition-all duration-300 group flex items-center justify-between"
                  >
                    <div className="space-y-1">
                      <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Events Management</p>
                      <h3 className="text-3xl font-extrabold text-slate-900 group-hover:text-primary transition-colors">{stats.eventsCount}</h3>
                      <p className="text-xs font-semibold text-slate-500">
                        <span className="text-primary font-bold">{stats.activeEvents} active</span> published events
                      </p>
                    </div>
                    <span className="p-3.5 bg-blue-50 text-primary rounded-xl group-hover:bg-primary group-hover:text-white transition-all duration-300">
                      <Calendar className="w-6 h-6" />
                    </span>
                  </div>

                  {/* Matches Stats */}
                  <div 
                    onClick={() => handleTabChange("matches")}
                    className="bg-white p-5 rounded-2xl border border-slate-100 hover:border-primary/20 shadow-sm hover:shadow-md cursor-pointer transition-all duration-300 group flex items-center justify-between"
                  >
                    <div className="space-y-1">
                      <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Fight Cards</p>
                      <h3 className="text-3xl font-extrabold text-slate-900 group-hover:text-primary transition-colors">{stats.batchesCount}</h3>
                      <p className="text-xs font-semibold text-slate-500">
                        <span className="text-orange-500 font-bold">{stats.liveBatches} ready/live</span> fight cards
                      </p>
                    </div>
                    <span className="p-3.5 bg-orange-50 text-orange-500 rounded-xl group-hover:bg-orange-500 group-hover:text-white transition-all duration-300">
                      <Swords className="w-6 h-6" />
                    </span>
                  </div>

                  {/* Champions Stats */}
                  <div 
                    onClick={() => handleTabChange("champions")}
                    className="bg-white p-5 rounded-2xl border border-slate-100 hover:border-primary/20 shadow-sm hover:shadow-md cursor-pointer transition-all duration-300 group flex items-center justify-between"
                  >
                    <div className="space-y-1">
                      <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Championship Belts</p>
                      <h3 className="text-3xl font-extrabold text-slate-900 group-hover:text-primary transition-colors">{stats.championsCount}</h3>
                      <p className="text-xs font-semibold text-slate-500">
                        <span className="text-emerald-600 font-bold">{stats.activeChamps} active</span> title holders
                      </p>
                    </div>
                    <span className="p-3.5 bg-emerald-50 text-emerald-600 rounded-xl group-hover:bg-emerald-600 group-hover:text-white transition-all duration-300">
                      <Trophy className="w-6 h-6" />
                    </span>
                  </div>

                </div>

                {/* Dashboard grid layout */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  
                  {/* Next Featured Event (Left side, takes 2 cols) */}
                  <div className="lg:col-span-2 space-y-4">
                    <div className="flex items-center justify-between">
                      <h2 className="text-base font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
                        <Sparkles className="w-5 h-5 text-amber-500" />
                        {upcomingIsPast ? "Last Fight Night" : "Next Featured Fight Night"}
                      </h2>
                    </div>

                    {upcomingEvent ? (
                      <div className="bg-gradient-to-br from-[#0F2027] via-[#203A43] to-[#2C5364] rounded-2xl overflow-hidden shadow-md text-white flex flex-col justify-between h-[360px] group border border-slate-850 hover:shadow-lg transition-shadow duration-300">
                        <div className="p-6 md:p-8 flex flex-col justify-between flex-1">
                          
                          {/* Banner upper */}
                          <div className="flex items-start justify-between">
                            <span className={`px-3 py-1 border text-white rounded-lg text-xs font-bold uppercase tracking-wider flex items-center gap-1 shadow-sm ${upcomingIsPast ? "bg-slate-600/90 border-slate-500/30" : "bg-red-600/90 border-red-500/30"}`}>
                              <Activity className={upcomingIsPast ? "w-3.5 h-3.5" : "w-3.5 h-3.5 animate-pulse"} />
                              {upcomingIsPast ? "Finished" : "Next Up"}
                            </span>
                            <div className="flex items-center gap-2 text-xs font-bold bg-white/10 backdrop-blur-md px-3 py-1.5 rounded-lg border border-white/10">
                              <Tv className="w-4 h-4 text-amber-400" />
                              <span>{upcomingEvent.broadcast_station_name || "Digital Broadcast"}</span>
                            </div>
                          </div>

                          {/* Event details */}
                          <div className="space-y-3 my-auto">
                            <h3 className="text-2xl md:text-3xl font-extrabold tracking-tight group-hover:text-amber-400 transition-colors drop-shadow">
                              {upcomingEvent.name}
                            </h3>
                            <div className="flex flex-wrap items-center gap-4 text-sm font-semibold text-white/90">
                              <div className="flex items-center gap-1.5">
                                <Calendar className="w-4 h-4 text-amber-400" />
                                <span>{new Date(upcomingEvent.date).toLocaleDateString("en-US", { weekday: 'long', month: 'short', day: 'numeric', year: 'numeric' })}</span>
                              </div>
                              <div className="w-1.5 h-1.5 rounded-full bg-white/20" />
                              <div className="flex items-center gap-1.5">
                                <MapPin className="w-4 h-4 text-amber-400" />
                                <span>{upcomingEvent.location}</span>
                              </div>
                            </div>
                          </div>

                          {/* Banner bottom footer */}
                          <div className="flex items-center justify-between border-t border-white/10 pt-5">
                            <div className="flex items-center gap-2.5">
                              <div className="w-7 h-7 bg-white/10 rounded-lg flex items-center justify-center border border-white/10">
                                <DollarSign className="w-4 h-4 text-amber-400" />
                              </div>
                              <div className="min-w-0">
                                <p className="text-[10px] text-white/60 font-semibold uppercase tracking-wider">Main Sponsor</p>
                                <p className="text-xs font-bold text-white truncate">{upcomingEvent.main_sponsor_name || "KKF Sponsors"}</p>
                              </div>
                            </div>

                            <Link 
                              to={`/home/events/${upcomingEvent.id}`}
                              className="px-4 py-2 bg-white text-slate-900 rounded-xl text-xs font-bold hover:bg-amber-400 hover:text-slate-950 transition-colors flex items-center gap-1.5 shadow"
                            >
                              View Fight Card
                              <ArrowRight className="w-3.5 h-3.5" />
                            </Link>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="bg-white p-8 rounded-2xl border border-slate-100 text-center text-slate-500 shadow-sm flex flex-col justify-center items-center h-[360px]">
                        <Calendar className="w-12 h-12 text-slate-350 mb-3" />
                        <p className="font-semibold text-sm">No upcoming events scheduled</p>
                        <p className="text-xs text-slate-400 mt-1 mb-4">Create your first fight event to coordinate match cards</p>
                        {permissions.hasPermission("events.create") && (
                          <Link to="/home/events/new" className="btn-secondary py-2 px-4 text-xs font-bold">
                            <Plus className="w-3.5 h-3.5" /> Create Event
                          </Link>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Top Active Champions Showcase (Right side, takes 1 col) */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h2 className="text-base font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
                        <Trophy className="w-5 h-5 text-emerald-500" />
                        Active Champions
                      </h2>
                    </div>

                    <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm space-y-4 h-[360px] overflow-y-auto no-scrollbar flex flex-col justify-between">
                      <div className="space-y-3.5 flex-1">
                        {topChampions.length > 0 ? (
                          topChampions.map((champ) => (
                            <Link 
                              key={champ.id}
                              to={`/home/champion/${champ.id}`}
                              className="flex items-center gap-3.5 p-2 rounded-xl hover:bg-slate-50 transition-all border border-transparent hover:border-slate-100 group"
                            >
                              <div className="relative">
                                {champ.holderImage ? (
                                  <img 
                                    src={champ.holderImage} 
                                    alt={champ.holderName} 
                                    className="w-11 h-11 rounded-lg object-cover border border-slate-100"
                                  />
                                ) : (
                                  <div className="w-11 h-11 bg-amber-50 text-amber-600 rounded-lg flex items-center justify-center border border-amber-100">
                                    <Crown className="w-5 h-5" />
                                  </div>
                                )}
                                <span className="absolute -top-1.5 -right-1.5 px-1.5 py-0.5 bg-amber-400 text-slate-900 font-extrabold text-[9px] rounded-full shadow border border-white">
                                  {champ.defense_count || 0}D
                                </span>
                              </div>
                              <div className="min-w-0 flex-1">
                                <h4 className="text-sm font-bold text-slate-900 group-hover:text-primary transition-colors truncate">
                                  {champ.holderName}
                                </h4>
                                <p className="text-xs text-slate-500 font-medium truncate mt-0.5">
                                  {champ.weight_class}kg • {champ.champion_type}
                                </p>
                              </div>
                              <ChevronRightIcon className="w-4 h-4 text-slate-300 group-hover:text-slate-650 transition-colors" />
                            </Link>
                          ))
                        ) : (
                          <div className="py-12 text-center text-slate-400 space-y-2">
                            <Trophy className="w-8 h-8 mx-auto text-slate-300" />
                            <p className="text-xs font-semibold">No active title holders</p>
                          </div>
                        )}
                      </div>

                      <button 
                        onClick={() => handleTabChange("champions")}
                        className="w-full py-2.5 bg-slate-50 hover:bg-slate-100 text-slate-700 font-bold text-xs rounded-xl transition-colors text-center block mt-3"
                      >
                        Browse Championships & belts
                      </button>
                    </div>
                  </div>

                </div>

                {/* Quick actions panel */}
                <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm">
                  <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-4">Program Quick Actions Workspace</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    
                    <Link to="/home/events/new" className="flex items-center gap-4 p-4 bg-[#0A3D91]/5 hover:bg-[#0A3D91]/10 rounded-xl border border-[#0A3D91]/10 transition-colors group">
                      <span className="p-3 bg-[#0A3D91] text-white rounded-xl">
                        <Calendar className="w-5 h-5" />
                      </span>
                      <div>
                        <h4 className="text-sm font-bold text-[#0A3D91]">Create New Event</h4>
                        <p className="text-xs text-slate-500 mt-0.5">Set date, venue, broadcaster & sponsor</p>
                      </div>
                    </Link>

                    <Link to="/home/matches/new" className="flex items-center gap-4 p-4 bg-orange-500/5 hover:bg-orange-500/10 rounded-xl border border-orange-500/10 transition-colors group">
                      <span className="p-3 bg-orange-500 text-white rounded-xl">
                        <Swords className="w-5 h-5" />
                      </span>
                      <div>
                        <h4 className="text-sm font-bold text-orange-650">Create Fight Card</h4>
                        <p className="text-xs text-slate-500 mt-0.5">Add match cards and pair fighters</p>
                      </div>
                    </Link>

                    <Link to="/home/champion/new" className="flex items-center gap-4 p-4 bg-emerald-600/5 hover:bg-emerald-600/10 rounded-xl border border-emerald-600/10 transition-colors group">
                      <span className="p-3 bg-emerald-600 text-white rounded-xl">
                        <Crown className="w-5 h-5" />
                      </span>
                      <div>
                        <h4 className="text-sm font-bold text-emerald-700">Add Title Belt</h4>
                        <p className="text-xs text-slate-500 mt-0.5">Define new weight class & organization</p>
                      </div>
                    </Link>

                  </div>
                </div>

              </div>
            )}

            {activeTab === "events" && <EventsAndMatches embedded={true} />}

            {activeTab === "matches" && <MatchesEnhanced embedded={true} />}

            {activeTab === "champions" && <Champion embedded={true} />}
          </>
        )}
      </div>

    </div>
  );
}

function ChevronRightIcon({ className }: { className?: string }) {
  return (
    <svg 
      xmlns="http://www.w3.org/2050/svg" 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2.5" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      className={className}
    >
      <path d="m9 18 6-6-6-6" />
    </svg>
  );
}
