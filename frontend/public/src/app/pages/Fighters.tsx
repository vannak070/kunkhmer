import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router";
import { Search, Plus, MapPin, Calendar, Users, Weight, Activity, UserCheck, Clock, ChevronDown, ShieldAlert } from "lucide-react";
import { MOCK_FIGHTERS, MOCK_MATCHES } from "../data/mock";
import { usePermissions } from "../hooks/usePermissions";
import { FighterStatusBadge } from "../components/FighterStatusBadge";
import { FighterApprovalBadge } from "../components/FighterApprovalBadge";
import type { FighterStatus } from "../data/fighterStatuses";
import type { FighterApprovalStatus } from "../data/fighterApproval";
import unknownFighterImg from "figma:asset/b9f2c3f9c8bd58ed74f9c92de40fb83809a138b3.png";
import { api } from "../utils/api";
import { getFighterSlug } from "../data/masterData";

// Helper function to derive advanced fighter status based on matches and mock rules
const getFighterStatus = (fighter: any, matches: any[] = []) => {
  if (fighter.status === 'Injured') return { label: 'Not Eligible', style: 'bg-red-100 text-[#C8102E] border-red-200', upcoming: null };
  
  // Find matches for this fighter
  const fighterMatches = matches.filter(m => 
    (m.fighter_a_id === fighter.id || m.fighter_b_id === fighter.id) ||
    (m.fighterA?.id === fighter.id || m.fighterB?.id === fighter.id)
  );
  
  // Check for upcoming scheduled fights
  const upcomingFight = fighterMatches.find(m => m.status === 'Scheduled');
  if (upcomingFight) {
    const isA = upcomingFight.fighter_a_id === fighter.id || upcomingFight.fighterA?.id === fighter.id;
    const opponent = isA 
      ? (upcomingFight.fighterB || { name: 'Opponent' }) 
      : (upcomingFight.fighterA || { name: 'Opponent' });
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
  const [search, setSearch] = useState("");
  const permissions = usePermissions();
  
  // Determine fighter type from URL
  const isKunKhmer = location.pathname.includes('/kunkhmer');
  const isForeigner = location.pathname.includes('/foreigner');
  
  // Dropdown Filter States
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterApproval, setFilterApproval] = useState<string>('all'); // NEW: Approval filter
  const [filterAvailability, setFilterAvailability] = useState<string>('all');

  const [fightersList, setFightersList] = useState<any[]>([]);
  const [matchesList, setMatchesList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [fightersData, matchesData] = await Promise.all([
          api.fighters.list(),
          api.matches.list()
        ]);
        
        const mappedFighters = fightersData.map((f: any) => ({
          ...f,
          weight: parseFloat(f.currentWeight || f.current_weight || "0"),
          origin: f.nationality === 'Cambodian' ? 'Local' : 'Foreigner',
          gym: f.clubName || f.club_name || "Independent"
        }));

        setFightersList(mappedFighters);
        setMatchesList(matchesData || []);
      } catch (err) {
        console.error("Failed to load data from database:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Filter fighters based on nationality
  let fighters = fightersList;
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
    
    // NEW: Approval filter
    let matchesApproval = true;
    if (filterApproval !== 'all') {
      const approvalStatus = f.status === 'Active' ? 'approved' : 'pending';
      matchesApproval = approvalStatus === filterApproval;
    }
    
    // Availability filter
    let matchesAvailability = true;
    if (filterAvailability !== 'all') {
      const status = getFighterStatus(f, matchesList);
      matchesAvailability = status.label === filterAvailability;
    }
    
    return matchesSearch && matchesStatus && matchesApproval && matchesAvailability;
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

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px] py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#0A3D91]"></div>
      </div>
    );
  }

  const activeFilterCount = [filterStatus, filterApproval, filterAvailability].filter(f => f !== 'all').length;

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-6 flex flex-col h-full">
      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-4xl font-black tracking-tight uppercase text-[#0A3D91]">
            {isKunKhmer ? 'Kun Khmer Fighters' : isForeigner ? 'Foreigner Fighters' : 'Fighters List'}
          </h1>
          <p className="text-[#707070] mt-2 font-medium text-lg">{filteredFighters.length} fighters registered</p>
        </div>
        {permissions.canCreate('fighters') && (
          <Link 
            to={getAddFighterRoute()}
            className="inline-flex items-center gap-2 bg-gradient-to-r from-[#C8102E] to-[#A00D24] hover:from-[#A00D24] hover:to-[#8A0B20] text-white px-6 py-3.5 rounded-xl font-bold transition-all shadow-lg hover:shadow-xl hover:scale-[1.02]"
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
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#B0B0B0] group-focus-within:text-[#0A3D91] transition-colors" />
          <input
            type="text"
            placeholder="Search fighters by name, alias, or gym..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-white border-2 border-[#E0E0E0] rounded-xl pl-12 pr-4 py-4 text-[#1A1A24] font-semibold placeholder:text-[#B0B0B0] focus:outline-none focus:ring-2 focus:ring-[#0A3D91] focus:border-[#0A3D91] shadow-sm transition-all"
          />
        </div>

        {/* Dropdown Filters Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {/* Fighter Status Filter */}
          <div className="relative">
            <label className="block text-xs font-black text-[#707070] uppercase tracking-wider mb-2 flex items-center gap-2">
              <Activity className="w-3.5 h-3.5 text-[#0A3D91]" />
              Fighter Status
            </label>
            <div className="relative">
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="w-full bg-white border-2 border-[#E0E0E0] rounded-xl px-4 py-3 text-[#1A1A24] font-semibold appearance-none focus:outline-none focus:ring-2 focus:ring-[#0A3D91] focus:border-[#0A3D91] shadow-sm transition-all cursor-pointer hover:border-[#0A3D91]"
              >
                <option value="all">All Status</option>
                <option value="Active">Active</option>
                <option value="Injured">Injured</option>
                <option value="Suspended">Suspended</option>
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#707070] pointer-events-none" />
            </div>
          </div>

          {/* Approval Filter */}
          <div className="relative">
            <label className="block text-xs font-black text-[#707070] uppercase tracking-wider mb-2 flex items-center gap-2">
              <UserCheck className="w-3.5 h-3.5 text-[#C8102E]" />
              Approval
            </label>
            <div className="relative">
              <select
                value={filterApproval}
                onChange={(e) => setFilterApproval(e.target.value)}
                className="w-full bg-white border-2 border-[#E0E0E0] rounded-xl px-4 py-3 text-[#1A1A24] font-semibold appearance-none focus:outline-none focus:ring-2 focus:ring-[#C8102E] focus:border-[#C8102E] shadow-sm transition-all cursor-pointer hover:border-[#C8102E]"
              >
                <option value="all">All</option>
                <option value="approved">Approved</option>
                <option value="pending">Pending</option>
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#707070] pointer-events-none" />
            </div>
          </div>

          {/* Availability Filter */}
          <div className="relative">
            <label className="block text-xs font-black text-[#707070] uppercase tracking-wider mb-2 flex items-center gap-2">
              <Clock className="w-3.5 h-3.5 text-[#F2C94C]" />
              Availability
            </label>
            <div className="relative">
              <select
                value={filterAvailability}
                onChange={(e) => setFilterAvailability(e.target.value)}
                className="w-full bg-white border-2 border-[#E0E0E0] rounded-xl px-4 py-3 text-[#1A1A24] font-semibold appearance-none focus:outline-none focus:ring-2 focus:ring-[#F2C94C] focus:border-[#F2C94C] shadow-sm transition-all cursor-pointer hover:border-[#F2C94C]"
              >
                <option value="all">All</option>
                <option value="Available">Available</option>
                <option value="Scheduled">Scheduled</option>
                <option value="Resting">Resting</option>
                <option value="Not Eligible">Not Eligible</option>
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#707070] pointer-events-none" />
            </div>
          </div>
        </div>

        {/* Active Filters Indicator */}
        {activeFilterCount > 0 && (
          <div className="flex items-center gap-3 px-4 py-3 bg-blue-50 border-2 border-blue-200 rounded-xl">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 bg-[#0A3D91] rounded-full flex items-center justify-center">
                <span className="text-white text-xs font-black">{activeFilterCount}</span>
              </div>
              <span className="text-sm font-bold text-[#0A3D91]">Active filters applied</span>
            </div>
            <button 
              onClick={() => {
                setFilterStatus('all');
                setFilterApproval('all');
                setFilterAvailability('all');
              }}
              className="ml-auto text-sm font-bold text-[#C8102E] hover:underline"
            >
              Clear All Filters
            </button>
          </div>
        )}
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
        {filteredFighters.length === 0 && (
          <div className="col-span-full py-12 text-center bg-[#FFFFFF] rounded-3xl border border-[#E0E0E0] border-dashed">
            <p className="text-[#707070] font-medium">No fighters match your current filters.</p>
            <button 
              onClick={() => {
                setFilterStatus('all');
                setFilterApproval('all');
                setFilterAvailability('all');
              }}
              className="mt-4 text-[#0A3D91] font-bold hover:underline"
            >
              Clear Filters
            </button>
          </div>
        )}
        
        {filteredFighters.map((fighter) => {
          const availability = getFighterStatus(fighter, matchesList);
          // Approval status based on status 'Active'
          const approvalStatus: FighterApprovalStatus = fighter.status === 'Active' ? 'approved' : 'pending';
          const isApproved = approvalStatus === 'approved';
          
          return (
          <div
            key={fighter.id}
            onClick={() => navigate(`/fighters/${getFighterSlug(fighter)}`)}
            className="group cursor-pointer bg-[#FFFFFF] rounded-2xl overflow-hidden hover:shadow-[0_12px_30px_rgba(10,61,145,0.1)] hover:-translate-y-1 transition-all duration-300 flex flex-col relative border border-[#E0E0E0]"
          >
            <div className="relative h-56 overflow-hidden bg-gradient-to-br from-[#0A3D91] to-[#051C42]">
              <img
                src={fighter.image || unknownFighterImg}
                alt={fighter.name}
                className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700 ease-out"
              />
              {/* Approval Status Badge - Only show if NOT approved */}
              {!isApproved && (
                <div className="absolute top-3 right-3">
                  <FighterApprovalBadge status={approvalStatus} size="sm" />
                </div>
              )}
            </div>
            
            <div className="p-5 flex-1 flex flex-col gap-3">
              <div>
                <h3 className="text-lg font-black text-[#1A1A24] leading-tight mb-1 group-hover:text-[#0A3D91] transition-colors">{fighter.name}</h3>
                <p className="text-sm text-[#707070] font-bold italic">&quot;{fighter.alias}&quot;</p>
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2 text-[#707070]">
                  <MapPin className="w-4 h-4 shrink-0 text-[#C8102E]" />
                  <span className="text-xs font-semibold">{fighter.gym}</span>
                </div>
                <div className="flex items-center gap-2 text-[#707070]">
                  <Weight className="w-4 h-4 shrink-0 text-emerald-600" />
                  <span className="text-xs font-semibold">{fighter.weight} kg</span>
                </div>
                <div className="flex items-center gap-2 text-[#707070]">
                  <Activity className="w-4 h-4 shrink-0 text-[#0A3D91]" />
                  <span className="text-xs font-semibold">Record: {fighter.record}</span>
                </div>
              </div>

              <div className="mt-auto pt-3 border-t border-[#E0E0E0]">
                {/* Only show availability if fighter is APPROVED */}
                {isApproved ? (
                  <div className={`inline-flex items-center gap-2 px-3 py-1.5 ${availability.style} rounded-lg border-2 text-xs font-bold`}>
                    <Clock className="w-3.5 h-3.5" />
                    {availability.label}
                    {availability.daysLeft !== undefined && <span>({availability.daysLeft}d)</span>}
                  </div>
                ) : (
                  <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-red-100 text-[#C8102E] border-red-200 rounded-lg border-2 text-xs font-bold">
                    <ShieldAlert className="w-3.5 h-3.5" />
                    Cannot Match
                  </div>
                )}
              </div>
            </div>
          </div>
          );
        })}
      </div>
    </div>
  );
}