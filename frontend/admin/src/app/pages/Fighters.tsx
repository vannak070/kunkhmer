import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router";
import { Search, Plus, MapPin, Activity, Clock, Weight, ChevronDown, Edit2, Trash2 } from "lucide-react";
import { api } from "../utils/api";
import { usePermissions } from "../hooks/usePermissions";
import { FighterStatusBadge } from "../components/FighterStatusBadge";
import type { FighterStatus } from "../data/fighterStatuses";
import unknownFighterImg from "figma:asset/b9f2c3f9c8bd58ed74f9c92de40fb83809a138b3.png";
import { useWeightClasses } from "../hooks/useSettingsLists";
import { toast } from "sonner";
import { FighterReviewActions, canReviewFighters, isWaiting } from "../components/FighterReview";

// Helper function to derive advanced fighter status based on matches
const getFighterStatus = (fighter: any, matches: any[] = []) => {
  if (fighter.status === 'Injured') return { label: 'Not Eligible', style: 'bg-red-100 text-[#C8102E] border-red-200', upcoming: null };
  if (fighter.status === 'Suspended') return { label: 'Suspended', style: 'bg-red-100 text-[#C8102E] border-red-200', upcoming: null };
  
  // Find matches for this fighter
  const fighterMatches = matches.filter(m => m.fighter_a_id === fighter.id || m.fighter_b_id === fighter.id);
  
  // Check for upcoming scheduled fights
  const upcomingFight = fighterMatches.find(m => m.status === 'Scheduled');
  if (upcomingFight) {
    const opponentName = upcomingFight.fighter_a_id === fighter.id ? upcomingFight.fighter_b_name : upcomingFight.fighter_a_name;
    return { 
      label: 'Scheduled', 
      style: 'bg-blue-100 text-[#0A3D91] border-blue-200',
      upcoming: { date: upcomingFight.date, opponent: opponentName, eventId: upcomingFight.event_id } 
    };
  }

  // Check resting period (10 days from last completed fight)
  const completedFights = fighterMatches.filter(m => m.status === 'Completed').sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  if (completedFights.length > 0) {
    const lastFightDate = new Date(completedFights[0].date);
    const today = new Date();
    const daysSince = Math.floor((today.getTime() - lastFightDate.getTime()) / (1000 * 60 * 60 * 24));
    
    if (daysSince < 10 && daysSince >= 0) {
      return { label: 'Resting', style: 'bg-amber-100 text-amber-700 border-amber-200', upcoming: null, daysLeft: 10 - daysSince };
    }
  }

  return { label: 'Available', style: 'bg-emerald-100 text-emerald-700 border-emerald-200', upcoming: null };
};

export function Fighters() {
  const navigate = useNavigate();
  const location = useLocation();
  const [fighters, setFighters] = useState<any[]>([]);
  const [matches, setMatches] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const permissions = usePermissions();
  // Weight classes from System Settings (Phase 5).
  const { names: WEIGHT_RANGES, classFor: getWeightRangeCategory } = useWeightClasses();
  
  // Determine fighter type from URL
  const isKunKhmer = location.pathname.includes('/kunkhmer');
  const isForeigner = location.pathname.includes('/foreigner');
  
  // Dropdown Filter States
  // ?status=waiting (e.g. from the dashboard) opens the verification queue.
  const [filterStatus, setFilterStatus] = useState<string>(() => (new URLSearchParams(location.search).get('status') === 'waiting' ? 'waiting' : 'all'));
  const reviewer = canReviewFighters();
  const [filterAvailability, setFilterAvailability] = useState<string>('all');
  const [filterWeightRange, setFilterWeightRange] = useState<string>('all');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const fightersList = await api.fighters.list();
      setFighters(fightersList);
      
      const matchesList = await api.matches.list();
      setMatches(matchesList);
    } catch (err: any) {
      toast.error(err.message || "Failed to load fighters data");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteFighter = async (id: string, name: string) => {
    if (!window.confirm(`Are you sure you want to delete fighter ${name}?`)) return;

    try {
      await api.fighters.delete(id);
      toast.success("Fighter deleted successfully");
      setFighters(prev => prev.filter(f => f.id !== id));
    } catch (err: any) {
      toast.error(err.message || "Failed to delete fighter");
    }
  };

  // Filter fighters based on nationality/origin
  let displayedFighters = fighters.map(f => ({
    ...f,
    weight: parseFloat(f.currentWeight || f.current_weight || "0"),
    origin: f.nationality === 'Cambodian' ? 'Local' : 'Foreigner',
    gym: f.clubName || f.club_name || "Independent"
  }));

  if (isKunKhmer) {
    displayedFighters = displayedFighters.filter(f => f.origin === 'Local');
  } else if (isForeigner) {
    displayedFighters = displayedFighters.filter(f => f.origin === 'Foreigner');
  }

  const filteredFighters = displayedFighters.filter((f) => {
    const nameStr = (f.name || "").toLowerCase();
    const aliasStr = (f.alias || "").toLowerCase();
    const gymStr = (f.gym || "").toLowerCase();
    const searchStr = search.toLowerCase();

    const matchesSearch = nameStr.includes(searchStr) ||
                          aliasStr.includes(searchStr) ||
                          gymStr.includes(searchStr);

    const matchesStatus = filterStatus === 'all' || (filterStatus === 'waiting' ? isWaiting(f.status) : f.status === filterStatus);
    const matchesWeightRange = filterWeightRange === 'all' || getWeightRangeCategory(f.weight) === filterWeightRange;

    // Availability filter
    let matchesAvailability = true;
    if (filterAvailability !== 'all') {
      const status = getFighterStatus(f, matches);
      matchesAvailability = status.label === filterAvailability;
    }

    return matchesSearch && matchesStatus && matchesAvailability && matchesWeightRange;
  });
  
  // Determine the correct "Register Fighter" route
  const getAddFighterRoute = () => {
    if (permissions.isClub()) {
      return '/home/fighters/kunkhmer/new';
    }
    if (isKunKhmer) return '/home/fighters/kunkhmer/new';
    if (isForeigner) return '/home/fighters/foreigner/new';
    return '/home/fighters/kunkhmer/new';
  };

  // Active filter count
  const activeFilterCount = [filterStatus, filterAvailability, filterWeightRange].filter(f => f !== 'all').length;

  const getAvailabilityBadgeVariant = (label: string) => {
    switch (label) {
      case 'Available': return 'badge-emerald';
      case 'Scheduled': return 'badge-blue';
      case 'Resting': return 'badge-amber';
      default: return 'badge-red';
    }
  };

  const getAvailabilityDotColor = (label: string) => {
    switch (label) {
      case 'Available': return 'bg-emerald-500';
      case 'Scheduled': return 'bg-blue-500';
      case 'Resting': return 'bg-amber-500';
      default: return 'bg-red-500';
    }
  };

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-6 flex flex-col min-h-full animate-fadeIn">
      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">
            {isKunKhmer ? 'Kun Khmer Fighters' : isForeigner ? 'Foreigner Fighters' : 'Fighters List'}
          </h1>
          <p className="text-sm text-muted-foreground mt-1 font-medium">{filteredFighters.length} fighters registered</p>
        </div>
        {permissions.canCreate('fighters') && (
          <Link 
            to={getAddFighterRoute()}
            className="btn-primary py-2.5 px-5"
          >
            <Plus className="w-4 h-4" />
            Register Fighter
          </Link>
        )}
      </header>

      {/* Verification queue banner */}
      {(() => {
        const waiting = fighters.filter((f) => isWaiting(f.status)).length;
        if (!waiting || filterStatus === 'waiting') return null;
        return (
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-amber-200 bg-amber-50 px-5 py-3">
            <p className="text-sm font-medium text-amber-900">
              {waiting} {waiting === 1 ? "fighter is" : "fighters are"} waiting for KKF verification{reviewer ? "" : " — they can't be matched until KKF verifies them"}.
            </p>
            <button type="button" onClick={() => setFilterStatus('waiting')} className="h-9 px-4 rounded-lg bg-white border border-amber-300 text-sm font-semibold text-amber-900 hover:bg-amber-100">
              Show {waiting === 1 ? "it" : "them"}
            </button>
          </div>
        );
      })()}

      {/* Toolbar with Dropdown Filters */}
      <div className="flex flex-col gap-4 relative z-10">
        {/* Search Bar */}
        <div className="relative flex-1 group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
          <input
            type="text"
            placeholder="Search fighters by name, alias, or gym..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-white border border-border/80 rounded-xl pl-11 pr-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/5 shadow-sm transition-all"
          />
        </div>

        {/* Dropdown Filters Row */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* Fighter Status Filter */}
          <div className="relative">
            <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
              <Activity className="w-3.5 h-3.5 text-primary" />
              Fighter Status
            </label>
            <div className="relative">
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="w-full bg-white border border-border/80 rounded-xl px-4 py-2.5 text-sm text-foreground font-medium appearance-none focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/5 shadow-sm cursor-pointer hover:border-slate-300 transition-all"
              >
                <option value="all">All Status</option>
                <option value="waiting">Waiting for verification</option>
                <option value="Rejected">Sent back to club</option>
                <option value="Active">Active</option>
                <option value="Injured">Injured</option>
                <option value="Suspended">Suspended</option>
                <option value="Inactive">Inactive</option>
                <option value="Retired">Retired</option>
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
            </div>
          </div>

          {/* Availability Filter */}
          <div className="relative">
            <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-accent" />
              Availability
            </label>
            <div className="relative">
              <select
                value={filterAvailability}
                onChange={(e) => setFilterAvailability(e.target.value)}
                className="w-full bg-white border border-border/80 rounded-xl px-4 py-2.5 text-sm text-foreground font-medium appearance-none focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/5 shadow-sm cursor-pointer hover:border-slate-300 transition-all"
              >
                <option value="all">All</option>
                <option value="Available">Available</option>
                <option value="Scheduled">Scheduled</option>
                <option value="Resting">Resting</option>
                <option value="Not Eligible">Not Eligible</option>
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
            </div>
          </div>

          {/* Weight Range Filter */}
          <div className="relative">
            <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
              <Weight className="w-3.5 h-3.5 text-emerald-600" />
              Weight Range
            </label>
            <div className="relative">
              <select
                value={filterWeightRange}
                onChange={(e) => setFilterWeightRange(e.target.value)}
                className="w-full bg-white border border-border/80 rounded-xl px-4 py-2.5 text-sm text-foreground font-medium appearance-none focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/5 shadow-sm cursor-pointer hover:border-slate-300 transition-all"
              >
                <option value="all">All Weight Ranges</option>
                {WEIGHT_RANGES.map(range => (
                  <option key={range} value={range}>{range}</option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
            </div>
          </div>
        </div>

        {/* Active Filters Indicator */}
        {activeFilterCount > 0 && (
          <div className="flex items-center gap-3 px-4 py-2.5 bg-primary/5 border border-primary/20 rounded-xl">
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 bg-primary rounded-full flex items-center justify-center">
                <span className="text-primary-foreground text-[10px] font-bold">{activeFilterCount}</span>
              </div>
              <span className="text-sm font-semibold text-primary">Active filters applied</span>
            </div>
            <button
              onClick={() => {
                setFilterStatus('all');
                setFilterAvailability('all');
                setFilterWeightRange('all');
              }}
              className="ml-auto text-xs font-bold text-secondary hover:underline"
            >
              Clear All Filters
            </button>
          </div>
        )}
      </div>

      {loading ? (
        <div className="text-center py-16">
          <div className="w-10 h-10 border-4 border-primary/30 border-t-primary rounded-full animate-spin mx-auto mb-4" />
          <p className="text-sm text-muted-foreground font-semibold">Loading fighters list from database...</p>
        </div>
      ) : (
        /* Grid */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
          {filteredFighters.length === 0 && (
            <div className="col-span-full py-16 text-center bg-white rounded-2xl border border-border/60 border-dashed">
              <p className="text-muted-foreground text-sm font-medium">No fighters match your current filters.</p>
              <button
                onClick={() => {
                  setFilterStatus('all');
                  setFilterAvailability('all');
                  setFilterWeightRange('all');
                }}
                className="mt-3 text-sm text-primary font-bold hover:underline"
              >
                Clear Filters
              </button>
            </div>
          )}
          
          {filteredFighters.map((fighter) => {
            const availability = getFighterStatus(fighter, matches);

            return (
              <div
                key={fighter.id}
                className="bg-white rounded-2xl border border-border/75 overflow-hidden shadow-sm hover:shadow-xl hover:border-primary/20 hover:-translate-y-1.5 transition-all duration-300 group flex flex-col"
              >
                {/* Image Banner Section */}
                <div className="h-44 relative overflow-hidden bg-muted">
                  <img
                    src={fighter.image || unknownFighterImg}
                    alt={fighter.name}
                    className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700 ease-out"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/20 to-transparent" />

                  {/* Badge Overlays */}
                  <div className="absolute bottom-4 left-4 right-4 flex justify-between items-end">
                    <div className="flex items-center gap-1.5">
                      {fighter.status !== "Active" && (
                        <FighterStatusBadge status={fighter.status as FighterStatus} />
                      )}
                    </div>
                    {/* Availability Badge */}
                    <div className={`badge-premium ${getAvailabilityBadgeVariant(availability.label)} shadow-sm`}>
                      <span className={`badge-dot ${getAvailabilityDotColor(availability.label)}`} />
                      <span>{availability.label}</span>
                      {availability.daysLeft !== undefined && <span>({availability.daysLeft}d)</span>}
                    </div>
                  </div>

                  {/* Action Overlays on Hover */}
                  {permissions.canEdit('fighters') && (
                    <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-all duration-200 flex gap-2 translate-y-[-5px] group-hover:translate-y-0 z-10">
                      <Link
                        to={`/home/fighters/${fighter.id}/edit`}
                        className="p-2 bg-white/95 hover:bg-white text-primary border border-border/40 rounded-xl shadow-md backdrop-blur-md transition-all duration-150 hover:scale-105 active:scale-95"
                      >
                        <Edit2 className="w-4 h-4" />
                      </Link>
                      {permissions.canDelete('fighters') && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteFighter(fighter.id, fighter.name);
                          }}
                          className="p-2 bg-red-50/95 hover:bg-red-500 hover:text-white text-secondary border border-red-100 rounded-xl shadow-md backdrop-blur-md transition-all duration-150 hover:scale-105 active:scale-95"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  )}
                </div>

                {/* Card Content Section */}
                <div className="p-4 flex-1 flex flex-col gap-3">

                  {/* Name + Origin */}
                  <div>
                    <div className="flex items-start justify-between gap-2 mb-0.5">
                      <h3 className="text-base font-bold text-foreground group-hover:text-primary transition-colors duration-200 tracking-tight leading-tight line-clamp-1">
                        {fighter.name}
                      </h3>
                      <span className={`shrink-0 text-[9px] font-bold px-2 py-0.5 rounded-full border ${
                        fighter.origin === 'Foreigner'
                          ? 'bg-blue-50 text-blue-700 border-blue-200'
                          : 'bg-amber-50 text-amber-700 border-amber-200'
                      }`}>
                        {fighter.origin === 'Foreigner' ? '🌍 INT' : '🇰🇭 KHM'}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5 text-muted-foreground">
                      <MapPin className="w-3 h-3 text-secondary shrink-0" />
                      <span className="text-xs font-semibold line-clamp-1">{fighter.gym}</span>
                    </div>
                  </div>

                  {/* KKF verification */}
                  {isWaiting(fighter.status) && (
                    <div className="rounded-xl border border-amber-200 bg-amber-50/60 p-3 space-y-2">
                      <p className="text-xs font-semibold text-amber-900">Waiting for KKF verification</p>
                      {reviewer && (
                        <FighterReviewActions
                          compact
                          fighter={fighter}
                          onDone={(u) => setFighters((list) => list.map((x) => (x.id === fighter.id ? { ...x, status: u.status, reviewNote: u.reviewNote } : x)))}
                        />
                      )}
                    </div>
                  )}
                  {fighter.status === "Rejected" && (
                    <p className="rounded-xl border border-red-200 bg-red-50 p-3 text-xs text-red-800">
                      <strong>Sent back:</strong> {fighter.reviewNote || "no reason given"}
                    </p>
                  )}

                  {/* Style Chip */}
                  {fighter.style && (
                    <div className="flex items-center gap-1.5">
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold text-primary bg-primary/8 border border-primary/20 px-2.5 py-1 rounded-full">
                        <Activity className="w-3 h-3" />
                        {fighter.style} Style
                      </span>
                    </div>
                  )}

                  {/* Stats Grid */}
                  <div className="grid grid-cols-2 gap-2">
                    <div className="bg-muted/20 rounded-xl p-2.5 border border-border/40 flex flex-col gap-0.5">
                      <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-wider">Weight Range</span>
                      <span className="text-xs font-bold text-slate-800 truncate" title={getWeightRangeCategory(fighter.weight)}>
                        {getWeightRangeCategory(fighter.weight)}
                      </span>
                      <span className="text-[10px] font-semibold text-muted-foreground leading-none">{fighter.weight} kg</span>
                    </div>
                    <div className="bg-muted/20 rounded-xl p-2.5 border border-border/40 flex flex-col gap-0.5">
                      <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-wider">Record</span>
                      <span className="text-sm font-bold text-primary leading-tight">{fighter.record || '0-0-0'}</span>
                      <span className="text-[10px] font-semibold text-muted-foreground leading-none">W-L-D</span>
                    </div>
                  </div>

                  {/* CTA */}
                  <Link
                    to={`/home/fighters/${fighter.id}`}
                    className="mt-auto btn-primary w-full py-2 text-center text-sm flex items-center justify-center gap-1.5"
                  >
                    View Profile
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}