import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router";
import { Search, Plus, MapPin, Calendar, Users, Weight, Activity, Clock, ChevronDown, Edit2, Trash2, Star } from "lucide-react";
import { MOCK_FIGHTERS, MOCK_MATCHES } from "../data/mock";
import { usePermissions } from "../hooks/usePermissions";
import { FighterStatusBadge } from "../components/FighterStatusBadge";
import type { FighterStatus } from "../data/fighterStatuses";
import unknownFighterImg from "figma:asset/b9f2c3f9c8bd58ed74f9c92de40fb83809a138b3.png";

// Helper function to derive advanced fighter status based on matches and mock rules
const getFighterStatus = (fighter: any) => {
  if (fighter.status === 'Injured') return { label: 'Not Eligible', style: 'bg-red-100 text-[#C8102E] border-red-200', upcoming: null };
  
  // Find matches for this fighter
  const fighterMatches = MOCK_MATCHES.filter(m => m.fighterA.id === fighter.id || m.fighterB.id === fighter.id);
  
  // Check for upcoming scheduled fights
  const upcomingFight = fighterMatches.find(m => m.status === 'Scheduled');
  if (upcomingFight) {
    const opponent = upcomingFight.fighterA.id === fighter.id ? upcomingFight.fighterB : upcomingFight.fighterA;
    return { 
      label: 'Scheduled', 
      style: 'bg-blue-100 text-[#0A3D91] border-blue-200',
      upcoming: { date: upcomingFight.date, opponent: opponent.name, eventId: upcomingFight.eventId } 
    };
  }

  // Check resting period (10 days from last completed fight)
  const completedFights = fighterMatches.filter(m => m.status === 'Completed').sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  if (completedFights.length > 0) {
    const lastFightDate = new Date(completedFights[0].date);
    const today = new Date("2026-03-19"); // System date
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
  const [search, setSearch] = useState("");
  const permissions = usePermissions();
  
  // Determine fighter type from URL
  const isKunKhmer = location.pathname.includes('/kunkhmer');
  const isForeigner = location.pathname.includes('/foreigner');
  
  // Dropdown Filter States
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterAvailability, setFilterAvailability] = useState<string>('all');

  // Filter fighters based on nationality
  let fighters = MOCK_FIGHTERS;
  if (isKunKhmer) {
    fighters = fighters.filter(f => f.origin === 'Local');
  } else if (isForeigner) {
    fighters = fighters.filter(f => f.origin === 'Foreigner');
  }

  const filteredFighters = fighters.filter((f) => {
    const matchesSearch = f.name.toLowerCase().includes(search.toLowerCase()) ||
                          f.alias.toLowerCase().includes(search.toLowerCase()) ||
                          f.gym.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = filterStatus === 'all' || f.status === filterStatus;

    // Availability filter
    let matchesAvailability = true;
    if (filterAvailability !== 'all') {
      const status = getFighterStatus(f);
      matchesAvailability = status.label === filterAvailability;
    }

    return matchesSearch && matchesStatus && matchesAvailability;
  });
  
  // Determine the correct "Register Fighter" route
  const getAddFighterRoute = () => {
    // Club users can only register Kun Khmer fighters
    if (permissions.isClub()) {
      return '/home/fighters/kunkhmer/new';
    }
    
    if (isKunKhmer) return '/home/fighters/kunkhmer/new';
    if (isForeigner) return '/home/fighters/foreigner/new';
    return '/home/fighters/kunkhmer/new'; // Default to Kun Khmer
  };

  // Active filter count
  const activeFilterCount = [filterStatus, filterAvailability].filter(f => f !== 'all').length;

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
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                <option value="Active">Active</option>
                <option value="Injured">Injured</option>
                <option value="Suspended">Suspended</option>
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
              }}
              className="ml-auto text-xs font-bold text-secondary hover:underline"
            >
              Clear All Filters
            </button>
          </div>
        )}
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
        {filteredFighters.length === 0 && (
          <div className="col-span-full py-16 text-center bg-white rounded-2xl border border-border/60 border-dashed">
            <p className="text-muted-foreground text-sm font-medium">No fighters match your current filters.</p>
            <button
              onClick={() => {
                setFilterStatus('all');
                setFilterAvailability('all');
              }}
              className="mt-3 text-sm text-primary font-bold hover:underline"
            >
              Clear Filters
            </button>
          </div>
        )}
        
        {filteredFighters.map((fighter) => {
          const availability = getFighterStatus(fighter);

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
                <div className="absolute bottom-4 left-4 right-4 flex justify-end items-end">
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
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/home/fighters/${fighter.id}/edit`);
                      }}
                      className="p-2 bg-white/95 hover:bg-white text-primary border border-border/40 rounded-xl shadow-md backdrop-blur-md transition-all duration-150 hover:scale-105 active:scale-95"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    {permissions.canDelete('fighters') && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          if (confirm(`Are you sure you want to delete ${fighter.name}?`)) {
                            alert(`${fighter.name} has been deleted.`);
                          }
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
                    <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-wider">Weight</span>
                    <span className="text-sm font-bold text-slate-800">{fighter.weight} <span className="text-[10px] font-semibold text-muted-foreground">kg</span></span>
                  </div>
                  <div className="bg-muted/20 rounded-xl p-2.5 border border-border/40 flex flex-col gap-0.5">
                    <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-wider">Record</span>
                    <span className="text-sm font-bold text-primary">{fighter.record || '0-0-0'}</span>
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
    </div>
  );
}