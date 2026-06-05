import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router";
import { Search, Plus, MapPin, Calendar, Users, Weight, Activity, Clock, ChevronDown } from "lucide-react";
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
      return '/fighters/kunkhmer/new';
    }
    
    if (isKunKhmer) return '/fighters/kunkhmer/new';
    if (isForeigner) return '/fighters/foreigner/new';
    return '/fighters/kunkhmer/new'; // Default to Kun Khmer
  };

  // Active filter count
  const activeFilterCount = [filterStatus, filterAvailability].filter(f => f !== 'all').length;

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-6 flex flex-col h-full">
      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-4xl font-black tracking-tight uppercase text-primary">
            {isKunKhmer ? 'Kun Khmer Fighters' : isForeigner ? 'Foreigner Fighters' : 'Fighters List'}
          </h1>
          <p className="text-muted-foreground mt-2 font-medium text-lg">{filteredFighters.length} fighters registered</p>
        </div>
        {permissions.canCreate('fighters') && (
          <Link 
            to={getAddFighterRoute()}
            className="inline-flex items-center gap-2 bg-gradient-to-r from-secondary to-secondary/80 text-secondary-foreground px-6 py-3.5 rounded-xl font-bold transition-all shadow-md hover:shadow-lg hover:scale-[1.02]"
          >
            <Plus className="w-5 h-5" />
            Register Fighter
          </Link>
        )}
      </header>

      {/* Toolbar with Dropdown Filters */}
      <div className="flex flex-col gap-4 relative z-10">
        {/* Search Bar */}
        <div className="relative flex-1 group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
          <input
            type="text"
            placeholder="Search fighters by name, alias, or gym..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-card border border-border rounded-xl pl-12 pr-4 py-4 text-foreground font-semibold placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary shadow-sm transition-all"
          />
        </div>

        {/* Dropdown Filters Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-2 gap-4">
          {/* Fighter Status Filter */}
          <div className="relative">
            <label className="block text-xs font-black text-muted-foreground uppercase tracking-wider mb-2 flex items-center gap-2">
              <Activity className="w-3.5 h-3.5 text-primary" />
              Fighter Status
            </label>
            <div className="relative">
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="w-full bg-card border border-border rounded-xl px-4 py-3 text-foreground font-semibold appearance-none focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary shadow-sm transition-all cursor-pointer hover:border-primary"
              >
                <option value="all">All Status</option>
                <option value="Active">Active</option>
                <option value="Injured">Injured</option>
                <option value="Suspended">Suspended</option>
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground pointer-events-none" />
            </div>
          </div>

          {/* Availability Filter */}
          <div className="relative">
            <label className="block text-xs font-black text-muted-foreground uppercase tracking-wider mb-2 flex items-center gap-2">
              <Clock className="w-3.5 h-3.5 text-accent" />
              Availability
            </label>
            <div className="relative">
              <select
                value={filterAvailability}
                onChange={(e) => setFilterAvailability(e.target.value)}
                className="w-full bg-card border border-border rounded-xl px-4 py-3 text-foreground font-semibold appearance-none focus:outline-none focus:ring-2 focus:ring-accent focus:border-accent shadow-sm transition-all cursor-pointer hover:border-accent"
              >
                <option value="all">All</option>
                <option value="Available">Available</option>
                <option value="Scheduled">Scheduled</option>
                <option value="Resting">Resting</option>
                <option value="Not Eligible">Not Eligible</option>
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground pointer-events-none" />
            </div>
          </div>
        </div>

        {/* Active Filters Indicator */}
        {activeFilterCount > 0 && (
          <div className="flex items-center gap-3 px-4 py-3 bg-primary/5 border border-primary/20 rounded-xl">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center">
                <span className="text-primary-foreground text-xs font-black">{activeFilterCount}</span>
              </div>
              <span className="text-sm font-bold text-primary">Active filters applied</span>
            </div>
            <button
              onClick={() => {
                setFilterStatus('all');
                setFilterAvailability('all');
              }}
              className="ml-auto text-sm font-bold text-secondary hover:underline"
            >
              Clear All Filters
            </button>
          </div>
        )}
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
        {filteredFighters.length === 0 && (
          <div className="col-span-full py-12 text-center bg-card rounded-3xl border border-border border-dashed">
            <p className="text-muted-foreground font-medium">No fighters match your current filters.</p>
            <button
              onClick={() => {
                setFilterStatus('all');
                setFilterAvailability('all');
              }}
              className="mt-4 text-primary font-bold hover:underline"
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
            onClick={() => navigate(`/fighters/${fighter.id}`)}
            className="group cursor-pointer bg-card rounded-2xl overflow-hidden hover:shadow-lg hover:-translate-y-1 transition-all duration-300 flex flex-col relative border border-border"
          >
            <div className="relative h-56 overflow-hidden bg-gradient-to-br from-primary to-primary/80">
              <img
                src={unknownFighterImg}
                alt={fighter.name}
                className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700 ease-out"
              />
            </div>

            <div className="p-5 flex-1 flex flex-col gap-3">
              <div>
                <h3 className="text-lg font-black text-foreground leading-tight mb-1 group-hover:text-primary transition-colors">{fighter.name}</h3>
                <p className="text-sm text-muted-foreground font-bold italic">&quot;{fighter.alias}&quot;</p>
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <MapPin className="w-4 h-4 shrink-0 text-secondary" />
                  <span className="text-xs font-semibold">{fighter.gym}</span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Weight className="w-4 h-4 shrink-0 text-emerald-600" />
                  <span className="text-xs font-semibold">{fighter.weight} kg</span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Activity className="w-4 h-4 shrink-0 text-primary" />
                  <span className="text-xs font-semibold">Record: {fighter.record}</span>
                </div>
              </div>

              <div className="mt-auto pt-3 border-t border-border">
                <div className={`inline-flex items-center gap-2 px-3 py-1.5 ${availability.style} rounded-lg border-2 text-xs font-bold`}>
                  <Clock className="w-3.5 h-3.5" />
                  {availability.label}
                  {availability.daysLeft !== undefined && <span>({availability.daysLeft}d)</span>}
                </div>
              </div>
            </div>
          </div>
          );
        })}
      </div>
    </div>
  );
}