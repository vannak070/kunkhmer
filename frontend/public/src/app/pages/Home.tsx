import { ArrowRight, Activity, Users, Calendar, Trophy, Award, Flame, MapPin, PlayCircle, ShieldCheck, Zap, Clock, Crown, Scale, Tv, Dumbbell, Plus, UserPlus, FileText, BarChart3, Settings, CheckCircle, Swords, Building2 } from "lucide-react";
import { Link } from "react-router";
import { MOCK_FIGHTERS, MOCK_MATCHES, MOCK_EVENTS, GRADE_STYLES } from "../data/mock";
import { usePermissions } from "../hooks/usePermissions";
import { ROLE_LABELS } from "../data/users";

export function Home() {
  const permissions = usePermissions();
  const currentUser = permissions.currentUser;
  const roleInfo = currentUser ? ROLE_LABELS[currentUser.role] : null;

  const getRoleIcon = () => {
    if (!currentUser) return ShieldCheck;
    switch (currentUser.role) {
      case 'super_admin': return Crown;
      case 'kkf_officer': return Scale;
      case 'organizer': return Tv;
      case 'club': return Building2;
      default: return ShieldCheck;
    }
  };

  const RoleIcon = getRoleIcon();

  // Calculate actionable insights
  const availableFighters = MOCK_FIGHTERS.filter(f => f.status === 'Active').length;
  const fightersReadyToday = Math.floor(availableFighters * 0.6); // 60% ready
  const upcomingMatches = MOCK_MATCHES.filter(m => m.status === 'Scheduled').length;
  const pendingApprovals = 2; // Mock data

  return (
    <div className="p-4 md:p-8 max-w-[1800px] mx-auto space-y-6">
      {/* User Welcome Banner */}
      {currentUser && roleInfo && (
        <div className="bg-gradient-to-br from-[#0A3D91] via-[#051C42] to-[#0A3D91] rounded-3xl p-6 md:p-8 shadow-2xl relative overflow-hidden border-2 border-white/10">
          {/* Background decorations */}
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10 pointer-events-none" />
          <div className="absolute top-0 right-0 w-64 h-64 bg-[#F2C94C] rounded-full blur-3xl opacity-20" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-[#C8102E] rounded-full blur-3xl opacity-20" />
          
          <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              {currentUser.avatar ? (
                <img 
                  src={currentUser.avatar} 
                  alt={currentUser.fullName}
                  className="w-16 h-16 md:w-20 md:h-20 rounded-2xl border-4 border-white/20 object-cover shadow-xl"
                />
              ) : (
                <div className="w-16 h-16 md:w-20 md:h-20 rounded-2xl bg-gradient-to-br from-[#C8102E] to-[#0A3D91] flex items-center justify-center text-white text-2xl font-black border-4 border-white/20 shadow-xl">
                  {currentUser.fullName.charAt(0)}
                </div>
              )}
              <div>
                <p className="text-white/80 text-xs font-bold uppercase tracking-wider mb-1">Welcome back,</p>
                <h2 className="text-white text-2xl md:text-3xl font-black tracking-tight mb-2">{currentUser.fullName}</h2>
                <div className="flex flex-wrap items-center gap-2">
                  <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold border-2 ${roleInfo.color} bg-white shadow-sm`}>
                    <RoleIcon className="w-3.5 h-3.5" />
                    {roleInfo.label}
                  </span>
                  {currentUser.organization && (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/10 text-white rounded-lg text-xs font-bold border border-white/20 backdrop-blur-sm">
                      {currentUser.organization}
                    </span>
                  )}
                </div>
              </div>
            </div>
            
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/20 shadow-lg">
              <p className="text-white/80 text-xs font-bold uppercase tracking-wider mb-3">Your Access Level</p>
              <div className="grid grid-cols-2 gap-2 text-xs">
                {permissions.hasPermission('events.create') && (
                  <span className="bg-white/20 text-white px-2 py-1 rounded font-bold">Create Events</span>
                )}
                {permissions.hasPermission('fighters.create') && (
                  <span className="bg-white/20 text-white px-2 py-1 rounded font-bold">Register Fighters</span>
                )}
                {permissions.hasPermission('federation.approve') && (
                  <span className="bg-white/20 text-white px-2 py-1 rounded font-bold">Approve Events</span>
                )}
                {permissions.hasPermission('matches.create') && (
                  <span className="bg-white/20 text-white px-2 py-1 rounded font-bold">Build Fight Cards</span>
                )}
                {permissions.hasPermission('federation.enter_results') && (
                  <span className="bg-white/20 text-white px-2 py-1 rounded font-bold">Enter Results</span>
                )}
                {permissions.hasPermission('system.configure_rules') && (
                  <span className="bg-white/20 text-white px-2 py-1 rounded font-bold">System Settings</span>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* System Functions */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-black uppercase tracking-tight text-[#0A3D91]">System Functions</h2>
            <p className="text-[#707070] mt-1 font-medium">Quick access to core platform features</p>
          </div>
          <div className="flex flex-wrap items-center gap-3 text-sm">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-600" />
              <span className="font-bold text-[#1A1A24]">{fightersReadyToday}</span>
              <span className="text-[#707070]">ready</span>
            </div>
            <div className="w-1 h-1 bg-[#E0E0E0] rounded-full" />
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-[#0A3D91]" />
              <span className="font-bold text-[#1A1A24]">{upcomingMatches}</span>
              <span className="text-[#707070]">upcoming</span>
            </div>
            {permissions.hasPermission('federation.approve') && (
              <>
                <div className="w-1 h-1 bg-[#E0E0E0] rounded-full" />
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-[#C8102E]" />
                  <span className="font-bold text-[#1A1A24]">{pendingApprovals}</span>
                  <span className="text-[#707070]">pending</span>
                </div>
              </>
            )}
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {permissions.hasPermission('matches.create') && (
            <Link
              to="/home/matches/new"
              className="flex flex-col items-center justify-center gap-2 bg-gradient-to-br from-[#C8102E] to-[#A00D24] hover:from-[#A00D24] hover:to-[#8A0B20] text-white p-4 rounded-xl font-bold text-center transition-all shadow-md hover:shadow-lg hover:scale-[1.02] group"
            >
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center mb-1 group-hover:scale-110 transition-transform text-3xl">
                🥊
              </div>
              <span className="text-xs uppercase tracking-wider">Create Match</span>
            </Link>
          )}

          {permissions.hasPermission('fighters.create') && (
            <Link
              to="/home/fighters/kunkhmer/new"
              className="flex flex-col items-center justify-center gap-2 bg-gradient-to-br from-[#0A3D91] to-[#082F6E] hover:from-[#082F6E] hover:to-[#051C42] text-white p-4 rounded-xl font-bold text-center transition-all shadow-md hover:shadow-lg hover:scale-[1.02] group"
            >
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center mb-1 group-hover:scale-110 transition-transform text-3xl">
                🧑‍🤝‍🧑
              </div>
              <span className="text-xs uppercase tracking-wider">Add Fighter</span>
            </Link>
          )}

          {permissions.hasPermission('events.create') && (
            <Link
              to="/home/events/new"
              className="flex flex-col items-center justify-center gap-2 bg-gradient-to-br from-[#F2C94C] to-[#E6B800] hover:from-[#E6B800] hover:to-[#D4A000] text-[#1A1A24] p-4 rounded-xl font-bold text-center transition-all shadow-md hover:shadow-lg hover:scale-[1.02] group"
            >
              <div className="w-12 h-12 bg-[#1A1A24]/10 rounded-xl flex items-center justify-center mb-1 group-hover:scale-110 transition-transform text-3xl">
                🎟️
              </div>
              <span className="text-xs uppercase tracking-wider">New Event</span>
            </Link>
          )}

          <Link
            to="/home/fighters"
            className="flex flex-col items-center justify-center gap-2 bg-white hover:bg-[#F4F5F8] text-[#1A1A24] p-4 rounded-xl font-bold text-center transition-all border-2 border-[#E0E0E0] hover:border-[#0A3D91] shadow-sm hover:shadow-md group"
          >
            <div className="w-12 h-12 bg-[#F4F5F8] group-hover:bg-[#0A3D91] rounded-xl flex items-center justify-center mb-1 transition-all group-hover:scale-110 text-3xl">
              🧑‍🤝‍🧑
            </div>
            <span className="text-xs uppercase tracking-wider">View Fighters</span>
          </Link>

          <Link
            to="/champion"
            className="flex flex-col items-center justify-center gap-2 bg-white hover:bg-[#F4F5F8] text-[#1A1A24] p-4 rounded-xl font-bold text-center transition-all border-2 border-[#E0E0E0] hover:border-[#F2C94C] shadow-sm hover:shadow-md group"
          >
            <div className="w-12 h-12 bg-[#F4F5F8] group-hover:bg-[#F2C94C] rounded-xl flex items-center justify-center mb-1 transition-all group-hover:scale-110 text-3xl">
              🏆
            </div>
            <span className="text-xs uppercase tracking-wider">Champions</span>
          </Link>

          {permissions.hasPermission('system.configure_rules') && (
            <Link
              to="/settings"
              className="flex flex-col items-center justify-center gap-2 bg-white hover:bg-[#F4F5F8] text-[#1A1A24] p-4 rounded-xl font-bold text-center transition-all border-2 border-[#E0E0E0] hover:border-[#707070] shadow-sm hover:shadow-md group"
            >
              <div className="w-12 h-12 bg-[#F4F5F8] group-hover:bg-gray-700 rounded-xl flex items-center justify-center mb-1 transition-all group-hover:scale-110">
                <Settings className="w-6 h-6 text-[#707070] group-hover:text-white transition-colors" />
              </div>
              <span className="text-xs uppercase tracking-wider">Settings</span>
            </Link>
          )}
        </div>
      </div>

      {/* Main Layout Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Main Event Preview - Full Width on Desktop */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* Upcoming Event Hero (Dynamic Poster) */}
          <div className="bg-[#1A1A24] rounded-3xl overflow-hidden relative group shadow-2xl min-h-[520px] flex flex-col justify-end border-2 border-white/10">
            {/* Dynamic Poster Background using Fighters */}
            <div className="absolute inset-0 z-0 flex">
              {/* Fighter A Side (Blue) */}
              <div className="w-1/2 h-full relative">
                <div className="absolute inset-0 bg-[#0A3D91] z-0" />
                <img 
                  src={MOCK_FIGHTERS[0].image} 
                  alt=""
                  className="absolute inset-0 w-full h-full object-cover object-top opacity-50 mix-blend-luminosity scale-105 group-hover:scale-110 transition-transform duration-1000 ease-out"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-[#1A1A24]/80 via-transparent to-[#1A1A24] z-10" />
                <div className="absolute inset-0 bg-gradient-to-t from-[#1A1A24] via-transparent to-transparent z-10" />
              </div>
              
              {/* Fighter B Side (Red) */}
              <div className="w-1/2 h-full relative">
                <div className="absolute inset-0 bg-[#C8102E] z-0" />
                <img 
                  src={MOCK_FIGHTERS[1].image} 
                  alt=""
                  className="absolute inset-0 w-full h-full object-cover object-top opacity-50 mix-blend-luminosity scale-105 group-hover:scale-110 transition-transform duration-1000 ease-out"
                />
                <div className="absolute inset-0 bg-gradient-to-l from-[#1A1A24]/80 via-transparent to-[#1A1A24] z-10" />
                <div className="absolute inset-0 bg-gradient-to-t from-[#1A1A24] via-transparent to-transparent z-10" />
              </div>
            </div>

            {/* Poster Overlay Texture & FX */}
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-30 z-10 mix-blend-overlay pointer-events-none" />
            <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-[#1A1A24]/40 via-transparent to-[#1A1A24] z-10 pointer-events-none" />
            
            {/* Center VS Graphic for Poster */}
            <div className="absolute top-[40%] left-1/2 -translate-x-1/2 -translate-y-1/2 z-20 flex flex-col items-center">
              <div className="relative">
                <div className="absolute inset-0 bg-[#F2C94C] blur-[60px] opacity-30 rounded-full" />
                <span className="text-[140px] md:text-[200px] font-black italic text-white/5 leading-none pointer-events-none mix-blend-overlay drop-shadow-2xl">VS</span>
              </div>
            </div>
            
            {/* Poster Content */}
            <div className="relative z-30 p-8 pt-32 w-full">
              <div className="flex flex-col items-center text-center">
                <div className="flex items-center gap-3 mb-4">
                  <span className="bg-gradient-to-r from-[#F2C94C] to-[#D4A017] text-[#1A1A24] text-[10px] font-black px-4 py-1.5 rounded-sm uppercase tracking-[0.2em] shadow-[0_4px_15px_rgba(242,201,76,0.3)] flex items-center gap-1.5">
                    <Flame className="w-3.5 h-3.5" /> Official Event Poster
                  </span>
                  <span className="text-[#F2C94C] bg-black/40 px-3 py-1.5 rounded-sm backdrop-blur-md border border-[#F2C94C]/20 text-xs font-black tracking-[0.2em] uppercase shadow-lg">
                    {MOCK_EVENTS[0].date}
                  </span>
                </div>
                
                <h2 className="text-5xl md:text-7xl lg:text-8xl font-black text-transparent bg-clip-text bg-gradient-to-b from-[#FFFFFF] via-[#F4F5F8] to-[#B0B0B0] drop-shadow-[0_4px_20px_rgba(0,0,0,0.8)] tracking-tighter uppercase leading-[0.85] italic mb-6 scale-y-110">
                  {MOCK_EVENTS[0].name}
                </h2>
                
                <div className="flex flex-wrap justify-center items-center gap-3 md:gap-6 text-[#FFFFFF] text-sm font-bold drop-shadow-md backdrop-blur-md bg-black/50 px-6 py-3.5 rounded-2xl border border-white/10 shadow-[0_8px_30px_rgba(0,0,0,0.5)]">
                  <span className="flex items-center gap-2"><MapPin className="w-4 h-4 text-[#C8102E]" /> {MOCK_EVENTS[0].location}</span>
                  <span className="w-1.5 h-1.5 bg-[#0A3D91] rounded-full hidden sm:block" />
                  <span className="flex items-center gap-2"><Award className="w-4 h-4 text-[#0A3D91]" /> {MOCK_EVENTS[0].matchesCount} Matches</span>
                  <span className="w-1.5 h-1.5 bg-[#C8102E] rounded-full hidden sm:block" />
                  <span className="font-black text-[#F2C94C] uppercase tracking-[0.2em] text-[11px] bg-white/10 px-2 py-1 rounded">Live on {MOCK_EVENTS[0].station}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Main Event Details Card - More Detailed */}
          <div className="bg-[#FFFFFF] border-2 border-[#E0E0E0] rounded-3xl p-8 shadow-[0_8px_30px_rgba(0,0,0,0.06)] relative overflow-hidden group hover:border-[#0A3D91]/30 transition-colors">
            <div className="absolute top-0 left-0 w-1/2 h-1.5 bg-gradient-to-r from-[#C8102E] to-[#A00D24]" />
            <div className="absolute top-0 right-0 w-1/2 h-1.5 bg-gradient-to-l from-[#0A3D91] to-[#051C42]" />
            
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-[#F2C94C]/5 rounded-full blur-3xl opacity-50 group-hover:opacity-100 transition-opacity" />
            
            <div className="flex items-center justify-between mb-8 relative z-10">
              <h3 className="font-black text-2xl uppercase tracking-tighter text-[#1A1A24] flex items-center gap-2">
                <span className="w-2 h-8 bg-[#C8102E] rounded-full inline-block" />
                Main Event Matchup
              </h3>
              <Link to="/home/matches" className="text-xs text-[#0A3D91] hover:text-[#C8102E] font-bold uppercase tracking-widest flex items-center gap-1 transition-colors">
                Full Card <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            <div className="flex flex-col md:flex-row items-center justify-between gap-8 relative z-10">
              {/* Fighter A */}
              <div className="flex-1 text-center group/fighter">
                <div className="relative inline-block mb-4">
                  <div className="absolute inset-0 bg-gradient-to-br from-[#C8102E] to-transparent rounded-full opacity-0 group-hover/fighter:opacity-20 transition-opacity blur-xl" />
                  <img src={MOCK_FIGHTERS[0].image} alt="" className="w-32 h-32 mx-auto rounded-full object-cover border-[4px] border-[#FFFFFF] shadow-xl relative z-10" />
                  <span className="absolute -top-2 -right-2 bg-gradient-to-br from-[#F2C94C] to-[#E2B93C] text-[#333333] p-2 rounded-full shadow-lg z-20 border-2 border-white"><Award className="w-5 h-5" /></span>
                </div>
                <h4 className="font-black text-2xl text-[#1A1A24] tracking-tight mb-2">{MOCK_FIGHTERS[0].name}</h4>
                <p className="text-sm text-[#707070] font-bold mb-3">{MOCK_FIGHTERS[0].gym}</p>
                <div className="flex items-center justify-center gap-2 mb-3">
                  <span className="text-[#707070] text-base font-mono font-bold bg-[#F4F5F8] inline-block px-4 py-2 rounded-xl">{MOCK_FIGHTERS[0].record}</span>
                  <span className="bg-[#C8102E] text-white text-xs font-black uppercase tracking-[0.2em] px-3 py-2 rounded-md shadow-sm border border-[#A00D24]">Grade {MOCK_FIGHTERS[0].grade}</span>
                </div>
                <div className="space-y-2">
                  <span className="inline-block px-4 py-2 bg-red-50 text-[#C8102E] text-xs font-black uppercase tracking-widest rounded-xl border border-red-100 shadow-sm">{MOCK_FIGHTERS[0].style}</span>
                  <div className="text-xs text-[#707070] font-bold">
                    {MOCK_FIGHTERS[0].weight}kg • {MOCK_FIGHTERS[0].type}
                  </div>
                </div>
              </div>
              
              {/* VS Divider */}
              <div className="flex flex-col items-center justify-center shrink-0">
                <div className="relative mb-4">
                  <div className="absolute inset-0 bg-[#F2C94C] blur-lg opacity-40 rounded-full" />
                  <div className="w-20 h-20 bg-gradient-to-br from-[#1A1A24] to-[#0A3D91] rounded-2xl rotate-45 flex items-center justify-center shadow-xl border border-white/10 relative z-10">
                    <span className="font-black italic text-3xl text-[#FFFFFF] -rotate-45 block leading-none pr-1">VS</span>
                  </div>
                </div>
                <span className="text-xs font-black text-[#0A3D91] uppercase tracking-[0.2em] bg-blue-50 px-4 py-2 rounded-xl border border-blue-100 shadow-sm mb-2">
                  {MOCK_MATCHES[0].weightClass}
                </span>
                <span className="text-[10px] font-black text-[#707070] uppercase tracking-[0.2em] mb-2">
                  {MOCK_MATCHES[0].rounds} Rounds
                </span>
                <span className="text-xs font-bold text-white bg-gradient-to-r from-[#C8102E] to-[#0A3D91] px-3 py-1.5 rounded-lg">
                  Main Event
                </span>
              </div>

              {/* Fighter B */}
              <div className="flex-1 text-center group/fighter">
                <div className="relative inline-block mb-4">
                  <div className="absolute inset-0 bg-gradient-to-bl from-[#0A3D91] to-transparent rounded-full opacity-0 group-hover/fighter:opacity-20 transition-opacity blur-xl" />
                  <img src={MOCK_FIGHTERS[1].image} alt="" className="w-32 h-32 mx-auto rounded-full object-cover border-[4px] border-[#FFFFFF] shadow-xl relative z-10" />
                </div>
                <h4 className="font-black text-2xl text-[#1A1A24] tracking-tight mb-2">{MOCK_FIGHTERS[1].name}</h4>
                <p className="text-sm text-[#707070] font-bold mb-3">{MOCK_FIGHTERS[1].gym}</p>
                <div className="flex items-center justify-center gap-2 mb-3">
                  <span className="text-[#707070] text-base font-mono font-bold bg-[#F4F5F8] inline-block px-4 py-2 rounded-xl">{MOCK_FIGHTERS[1].record}</span>
                  <span className="bg-[#F2C94C] text-[#1A1A24] text-xs font-black uppercase tracking-[0.2em] px-3 py-2 rounded-md shadow-sm border border-[#E2B93C]">Grade {MOCK_FIGHTERS[1].grade}</span>
                </div>
                <div className="space-y-2">
                  <span className="inline-block px-4 py-2 bg-blue-50 text-[#0A3D91] text-xs font-black uppercase tracking-widest rounded-xl border border-blue-100 shadow-sm">{MOCK_FIGHTERS[1].style}</span>
                  <div className="text-xs text-[#707070] font-bold">
                    {MOCK_FIGHTERS[1].weight}kg • {MOCK_FIGHTERS[1].type}
                  </div>
                </div>
              </div>
            </div>

            {/* Additional Match Details */}
            <div className="mt-8 pt-6 border-t-2 border-[#E0E0E0] relative z-10">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                <div className="bg-gradient-to-br from-blue-50 to-white p-4 rounded-xl border border-blue-100">
                  <p className="text-2xl font-black text-[#0A3D91] mb-1">5</p>
                  <p className="text-xs font-bold text-[#707070] uppercase tracking-wider">Rounds</p>
                </div>
                <div className="bg-gradient-to-br from-red-50 to-white p-4 rounded-xl border border-red-100">
                  <p className="text-2xl font-black text-[#C8102E] mb-1">3min</p>
                  <p className="text-xs font-bold text-[#707070] uppercase tracking-wider">Per Round</p>
                </div>
                <div className="bg-gradient-to-br from-amber-50 to-white p-4 rounded-xl border border-amber-100">
                  <p className="text-2xl font-black text-[#F2C94C] mb-1">KKF</p>
                  <p className="text-xs font-bold text-[#707070] uppercase tracking-wider">Sanctioned</p>
                </div>
                <div className="bg-gradient-to-br from-green-50 to-white p-4 rounded-xl border border-green-100">
                  <p className="text-2xl font-black text-green-600 mb-1">Title</p>
                  <p className="text-xs font-bold text-[#707070] uppercase tracking-wider">On The Line</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Sidebar */}
        <div className="lg:col-span-4 space-y-6">
          {/* Top Fighters */}
          <div className="bg-[#FFFFFF] border-2 border-[#E0E0E0] rounded-3xl p-6 shadow-[0_8px_30px_rgba(0,0,0,0.06)] relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-[#F2C94C]/10 rounded-full blur-3xl -mr-10 -mt-10" />
            <div className="flex items-center justify-between mb-6 relative z-10">
              <div>
                <h3 className="font-black text-xl uppercase tracking-tighter text-[#1A1A24]">Top Fighters</h3>
                <p className="text-[10px] text-[#707070] font-bold uppercase tracking-[0.15em] mt-0.5">Active Fighters</p>
              </div>
              <Link to="/home/fighters" className="w-10 h-10 bg-[#F4F5F8] rounded-xl flex items-center justify-center text-[#0A3D91] hover:bg-[#0A3D91] hover:text-white transition-colors shadow-sm"><Trophy className="w-5 h-5" /></Link>
            </div>
            
            <div className="space-y-2 relative z-10">
              {MOCK_FIGHTERS.slice(0, 5).map((fighter, i) => {
                const gradeStyle = GRADE_STYLES[fighter.grade || 'D'];
                return (
                <Link key={fighter.id} to={`/home/fighters/${fighter.id}`} className="flex items-center gap-3 group p-2.5 -mx-2.5 rounded-2xl hover:bg-[#F4F5F8] transition-all relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[#0A3D91]/5 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700 ease-in-out" />
                  
                  <div className="relative">
                    <img src={fighter.image} className="w-12 h-12 rounded-full object-cover border-2 border-[#E0E0E0] shadow-sm" alt="" />
                    {fighter.status === 'Active' && <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 border-2 border-white rounded-full"></span>}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-sm text-[#1A1A24] truncate group-hover:text-[#0A3D91] transition-colors flex items-center gap-2">
                      {fighter.name}
                      <span className={`text-[8px] px-1.5 py-0.5 rounded-md font-black uppercase tracking-wider shadow-sm ${gradeStyle.bg} ${gradeStyle.text}`}>{fighter.grade}</span>
                    </p>
                    <p className="text-[10px] text-[#707070] font-bold uppercase tracking-widest truncate">{fighter.type || "Amateur"}</p>
                  </div>
                  
                  <div className="text-right">
                    <p className="text-sm font-mono font-black text-[#1A1A24] bg-white border border-[#E0E0E0] shadow-sm px-2 py-0.5 rounded-lg">{fighter.record}</p>
                    <p className="text-[9px] text-[#C8102E] font-black uppercase tracking-[0.1em] mt-1 flex items-center justify-end gap-0.5">
                      <Flame className="w-3 h-3" /> 3 Win Streak
                    </p>
                  </div>
                </Link>
              )})}
            </div>
            
            <Link 
              to="/home/fighters" 
              className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-xl font-bold transition-all border border-white/20 backdrop-blur-sm"
            >
              View All Fighters <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {/* Live Activity Feed */}
          <div className="bg-[#FFFFFF] border-2 border-[#E0E0E0] rounded-3xl p-6 shadow-[0_8px_30px_rgba(0,0,0,0.06)] relative overflow-hidden">
            <div className="flex items-center gap-2 mb-6">
              <Activity className="w-5 h-5 text-[#C8102E]" />
              <h3 className="font-black text-xl uppercase tracking-tighter text-[#1A1A24]">Live Action</h3>
            </div>
            
            <div className="relative pl-4 border-l-2 border-[#F4F5F8] space-y-6">
              <div className="relative">
                <span className="absolute -left-[21px] top-1 w-2.5 h-2.5 rounded-full bg-[#C8102E] shadow-[0_0_8px_rgba(200,16,46,0.6)]" />
                <p className="text-xs text-[#707070] font-bold uppercase tracking-widest mb-1">2 mins ago</p>
                <p className="text-sm font-bold text-[#1A1A24] leading-tight">Match concluded: <span className="text-[#0A3D91]">Phnom Penh Throwdown</span></p>
                <p className="text-xs text-[#707070] mt-1">Sok vs. Rithy ended in a Round 2 KO.</p>
              </div>
              <div className="relative">
                <span className="absolute -left-[21px] top-1 w-2.5 h-2.5 rounded-full bg-[#0A3D91]" />
                <p className="text-xs text-[#707070] font-bold uppercase tracking-widest mb-1">15 mins ago</p>
                <p className="text-sm font-bold text-[#1A1A24] leading-tight">New fighter registered</p>
                <p className="text-xs text-[#707070] mt-1">Seng Chan joined <strong className="text-[#1A1A24]">Tiger Gym</strong>.</p>
              </div>
              <div className="relative">
                <span className="absolute -left-[21px] top-1 w-2.5 h-2.5 rounded-full bg-[#F2C94C]" />
                <p className="text-xs text-[#707070] font-bold uppercase tracking-widest mb-1">1 hour ago</p>
                <p className="text-sm font-bold text-[#1A1A24] leading-tight">Event approved</p>
                <p className="text-xs text-[#707070] mt-1">KKF approved "Night of Champions"</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Roster Readiness - Full Width Bottom Section */}
      <div className="bg-gradient-to-br from-[#1A1A24] via-[#051C42] to-[#0A3D91] border-2 border-white/10 rounded-3xl p-8 shadow-2xl relative overflow-hidden text-white">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10 pointer-events-none" />
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#F2C94C] rounded-full blur-3xl opacity-10" />
        
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-6 relative z-10">
          <div>
            <h3 className="font-black text-2xl uppercase tracking-tighter flex items-center gap-2 mb-2">
              <Users className="w-6 h-6 text-[#F2C94C]" /> Fighters Readiness
            </h3>
            <p className="text-white/80 text-sm font-medium">Real-time fighter availability and status</p>
          </div>
          <span className="text-xs font-black uppercase tracking-widest bg-white/10 px-4 py-2 rounded-xl border border-white/20 backdrop-blur-sm">Live Data</span>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative z-10">
          <div className="bg-white/5 p-6 rounded-2xl border-2 border-white/10 backdrop-blur-sm hover:bg-white/10 transition-all group">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 rounded-full bg-emerald-500 shadow-[0_0_12px_rgba(16,185,129,0.6)]" />
                <span className="text-sm font-bold">Available to Fight</span>
              </div>
              <CheckCircle className="w-5 h-5 text-emerald-400" />
            </div>
            <p className="text-4xl font-black text-emerald-400 mb-2">{availableFighters}</p>
            <p className="text-xs text-white/70 font-bold">Ready for matchmaking now</p>
          </div>
          
          <div className="bg-white/5 p-6 rounded-2xl border-2 border-white/10 backdrop-blur-sm hover:bg-white/10 transition-all group">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 rounded-full bg-[#0A3D91] shadow-[0_0_12px_rgba(10,61,145,0.6)]" />
                <span className="text-sm font-bold">Currently Scheduled</span>
              </div>
              <Calendar className="w-5 h-5 text-[#89B4F8]" />
            </div>
            <p className="text-4xl font-black text-[#89B4F8] mb-2">32</p>
            <p className="text-xs text-white/70 font-bold">In upcoming events</p>
          </div>
          
          <div className="bg-white/5 p-6 rounded-2xl border-2 border-white/10 backdrop-blur-sm hover:bg-white/10 transition-all group">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 rounded-full bg-amber-500 shadow-[0_0_12px_rgba(245,158,11,0.6)]" />
                <span className="text-sm font-bold">Rest / Medical Hold</span>
              </div>
              <Clock className="w-5 h-5 text-amber-400" />
            </div>
            <p className="text-4xl font-black text-amber-400 mb-2">26</p>
            <p className="text-xs text-white/70 font-bold">Temporary unavailable</p>
          </div>
        </div>

        {/* Additional Insights */}
        <div className="mt-6 pt-6 border-t-2 border-white/10 relative z-10">
          <div className="flex flex-wrap items-center justify-between gap-4 text-sm">
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-[#F2C94C]" />
                <span className="font-bold">Total Fighters:</span>
                <span className="text-white/80">{MOCK_FIGHTERS.length} fighters</span>
              </div>
              <div className="flex items-center gap-2">
                <Trophy className="w-4 h-4 text-[#F2C94C]" />
                <span className="font-bold">Active Champions:</span>
                <span className="text-white/80">7 titles</span>
              </div>
            </div>
            <Link 
              to="/home/fighters" 
              className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-xl font-bold transition-all border border-white/20 backdrop-blur-sm"
            >
              View Full Roster <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}