import { useParams, Link } from "react-router";
import { ArrowLeft, MapPin, Dumbbell, Star, Phone, Mail, Trophy, Users, ShieldAlert, Weight, Activity, Clock, Calendar, TrendingUp, Shield, ChevronDown } from "lucide-react";
import { FighterApprovalBadge } from "../components/FighterApprovalBadge";
import type { FighterApprovalStatus } from "../data/fighterApproval";
import unknownFighterImg from "figma:asset/b9f2c3f9c8bd58ed74f9c92de40fb83809a138b3.png";
import { useState, useEffect } from "react";
import { api } from "../utils/api";

type TabType = 'overview' | 'fighters' | 'champions' | 'matches';

export function ClubDetail() {
  const { id } = useParams();
  const [club, setClub] = useState<any>(null);
  const [clubFighters, setClubFighters] = useState<any[]>([]);
  const [clubMatches, setClubMatches] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<TabType>('overview');

  useEffect(() => {
    if (id) {
      loadClubData();
    }
  }, [id]);

  const loadClubData = async () => {
    setLoading(true);
    try {
      const clubData = await api.clubs.get(id!);
      setClub(clubData);
      
      const fightersData = await api.fighters.list(undefined, id!);
      setClubFighters(fightersData);

      const allMatches = await api.matches.list();
      const fighterIds = fightersData.map((f: any) => f.id);
      const matchesInvolving = allMatches.filter((m: any) => 
        fighterIds.includes(m.fighter_a_id) || fighterIds.includes(m.fighter_b_id)
      );
      setClubMatches(matchesInvolving);
    } catch (err: any) {
      console.error("Failed to load club details:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (tab: TabType) => {
    setActiveTab(tab);
    if (tab === 'overview') {
      const mainEl = document.querySelector('main');
      if (mainEl) {
        mainEl.scrollTo({ top: 0, behavior: 'smooth' });
      }
    }
  };

  // Helper function to derive advanced fighter status based on matches and rules
  const getFighterStatus = (fighter: any) => {
    if (fighter.status === 'Injured') return { label: 'Not Eligible', style: 'badge-red', dot: 'bg-red-500', upcoming: null };
    
    const upcomingFight = clubMatches.find(m => m.status === 'Scheduled');
    if (upcomingFight) {
      const opponentName = upcomingFight.fighter_a_id === fighter.id ? upcomingFight.fighter_b_name : upcomingFight.fighter_a_name;
      return { 
        label: 'Scheduled', 
        style: 'badge-blue',
        dot: 'bg-blue-500',
        upcoming: { date: upcomingFight.date, opponent: opponentName, eventId: upcomingFight.event_id } 
      };
    }

    const completedFights = clubMatches.filter(m => m.status === 'Completed').sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    if (completedFights.length > 0) {
      const lastFightDate = new Date(completedFights[0].date);
      const today = new Date();
      const daysSince = Math.floor((today.getTime() - lastFightDate.getTime()) / (1000 * 60 * 60 * 24));
      
      if (daysSince < 10 && daysSince >= 0) {
        return { label: 'Resting', style: 'badge-amber', dot: 'bg-amber-500', upcoming: null, daysLeft: 10 - daysSince };
      }
    }

    return { label: 'Available', style: 'badge-emerald', dot: 'bg-emerald-500', upcoming: null };
  };

  // Mock champions from this club based on dynamic grade
  const clubChampions = clubFighters.filter(f => f.grade === 'A').map(fighter => ({
    ...fighter,
    beltTitle: 'Welterweight Champion',
    defenses: 2,
    wonDate: '2026-01-20'
  }));

  const clubFighterIds = clubFighters.map((f: any) => f.id);

  if (loading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8 min-h-full">
        <div className="w-10 h-10 border-4 border-primary/30 border-t-primary rounded-full animate-spin mx-auto mb-4" />
        <p className="text-sm text-muted-foreground font-semibold">Loading club details from database...</p>
      </div>
    );
  }

  if (!club) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8 bg-background min-h-full animate-fadeIn">
        <ShieldAlert className="w-16 h-16 text-secondary mb-4 shrink-0" />
        <h2 className="text-2xl font-semibold text-foreground tracking-tight mb-2">Club Not Found</h2>
        <p className="text-muted-foreground text-sm max-w-xs text-center mb-6">The club you are looking for does not exist or has been removed.</p>
        <Link to="/home/clubs" className="btn-primary py-2.5 px-6">
          <ArrowLeft className="w-4 h-4" /> Back to Clubs
        </Link>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto flex flex-col min-h-full animate-fadeIn">
      {/* Header */}
      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div className="flex items-center gap-4">
          <Link 
            to="/home/clubs" 
            className="p-2.5 bg-white hover:bg-muted text-primary border border-border/80 rounded-xl transition-all active:scale-95 shadow-sm"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-foreground">{club.name}</h1>
            <p className="text-sm text-muted-foreground mt-0.5 font-medium flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-secondary shrink-0" />
              <span>{club.location}</span>
            </p>
          </div>
        </div>
        <Link to={`/home/clubs/${club.id}/edit`} className="btn-outline py-2.5 px-5 shadow-sm">
          Edit Profile
        </Link>
      </header>

      {/* Hero Section */}
      <div className="relative h-64 md:h-80 rounded-2xl overflow-hidden border border-border/60 shadow-md mb-6">
        <img src={club.image} alt={club.name} className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-900/50 to-transparent" />
        
        <div className="absolute inset-0 flex flex-col justify-end p-6 md:p-8">
          <div className="flex items-center gap-2 mb-3">
            <div className={`badge-premium shadow-md border-white/20 ${
              club.status === 'active' 
                ? 'badge-emerald bg-emerald-500/90 text-white' 
                : 'badge-red bg-red-500/90 text-white'
            }`}>
              <span className={`badge-dot ${club.status === 'active' ? 'bg-white' : 'bg-white/70'}`} />
              <span className="capitalize font-bold text-xs">{club.status}</span>
            </div>
            <div className="flex items-center gap-1.5 bg-[#FFFDF5] border border-amber-200/80 text-amber-700 px-3 py-1.5 rounded-full text-xs font-semibold shadow-md">
              <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
              <span>{club.rating}</span>
            </div>
          </div>
          <h2 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight drop-shadow-md mb-4 leading-tight">
            {club.name}
          </h2>
          
          {/* Hero Stats Subgrid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 max-w-3xl">
            <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-3 text-center shadow-sm">
              <div className="text-[10px] font-bold text-white/70 uppercase tracking-wider mb-0.5">Head Coach</div>
              <div className="text-sm font-semibold text-white truncate">{club.head_coach || "N/A"}</div>
            </div>
            <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-3 text-center shadow-sm">
              <div className="text-[10px] font-bold text-white/70 uppercase tracking-wider mb-0.5">Active Fighters</div>
              <div className="flex items-center justify-center gap-1">
                <Dumbbell className="w-3.5 h-3.5 text-amber-300" />
                <div className="text-sm font-semibold text-white">{clubFighters.length}</div>
              </div>
            </div>
            <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-3 text-center shadow-sm">
              <div className="text-[10px] font-bold text-white/70 uppercase tracking-wider mb-0.5">Established Since</div>
              <div className="text-sm font-semibold text-white">{club.established || "2026"}</div>
            </div>
            <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-3 text-center shadow-sm">
              <div className="text-[10px] font-bold text-white/70 uppercase tracking-wider mb-0.5">Champions</div>
              <div className="flex items-center justify-center gap-1">
                <Trophy className="w-3.5 h-3.5 text-amber-300" />
                <div className="text-sm font-semibold text-white">{clubChampions.length}</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-border bg-white rounded-2xl p-1 gap-1 shadow-sm sticky -top-6 md:-top-8 z-20 flex overflow-x-auto no-scrollbar mb-6">
        <button
          onClick={() => handleTabChange('overview')}
          className={`flex-1 min-w-[110px] flex items-center justify-center gap-2 py-3.5 text-sm font-semibold uppercase tracking-wider transition-all rounded-xl relative ${
            activeTab === 'overview'
              ? 'text-primary bg-primary/5 font-bold'
              : 'text-muted-foreground hover:text-foreground hover:bg-muted/45'
          }`}
        >
          <Users className="w-4 h-4 shrink-0" />
          <span>Overview</span>
        </button>

        <button
          onClick={() => handleTabChange('fighters')}
          className={`flex-1 min-w-[110px] flex items-center justify-center gap-2 py-3.5 text-sm font-semibold uppercase tracking-wider transition-all rounded-xl relative ${
            activeTab === 'fighters'
              ? 'text-primary bg-primary/5 font-bold'
              : 'text-muted-foreground hover:text-foreground hover:bg-muted/45'
          }`}
        >
          <Dumbbell className="w-4 h-4 shrink-0" />
          <span>Fighters</span>
          <span className="badge-premium badge-blue px-2 py-0.5 ml-1">
            {clubFighters.length}
          </span>
        </button>

        <button
          onClick={() => handleTabChange('champions')}
          className={`flex-1 min-w-[110px] flex items-center justify-center gap-2 py-3.5 text-sm font-semibold uppercase tracking-wider transition-all rounded-xl relative ${
            activeTab === 'champions'
              ? 'text-primary bg-primary/5 font-bold'
              : 'text-muted-foreground hover:text-foreground hover:bg-muted/45'
          }`}
        >
          <Trophy className="w-4 h-4 shrink-0" />
          <span>Champions</span>
          <span className="badge-premium badge-amber px-2 py-0.5 ml-1">
            {clubChampions.length}
          </span>
        </button>

        <button
          onClick={() => handleTabChange('matches')}
          className={`flex-1 min-w-[110px] flex items-center justify-center gap-2 py-3.5 text-sm font-semibold uppercase tracking-wider transition-all rounded-xl relative ${
            activeTab === 'matches'
              ? 'text-primary bg-primary/5 font-bold'
              : 'text-muted-foreground hover:text-foreground hover:bg-muted/45'
          }`}
        >
          <TrendingUp className="w-4 h-4 shrink-0" />
          <span>Matches</span>
          <span className="badge-premium badge-red px-2 py-0.5 ml-1">
            {clubMatches.length}
          </span>
        </button>
      </div>

      {/* Tab Content Section */}
      <div className="w-full">
        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="space-y-6 animate-fadeIn">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* About description */}
              <div className="md:col-span-2">
                <div className="card-premium h-full flex flex-col justify-between">
                  <div>
                    <h3 className="text-sm font-bold uppercase tracking-wider text-slate-800 mb-4 flex items-center gap-2">
                      <Users className="w-4 h-4 text-primary shrink-0" />
                      <span>About the Club</span>
                    </h3>
                    <p className="text-slate-800 leading-relaxed font-semibold text-sm">
                      {club.description}
                    </p>
                  </div>
                </div>
              </div>

              {/* Contact information details */}
              <div>
                <div className="card-premium h-full flex flex-col justify-between">
                  <div>
                    <h3 className="text-sm font-bold uppercase tracking-wider text-slate-800 mb-4 flex items-center gap-2">
                      <Phone className="w-4 h-4 text-primary shrink-0" />
                      <span>Contact Info</span>
                    </h3>
                    <div className="space-y-4">
                      <div className="flex items-start gap-3">
                        <div className="p-2 bg-amber-50 border border-amber-100 rounded-lg shrink-0 mt-0.5">
                          <Phone className="w-4 h-4 text-primary" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <span className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-0.5">Phone</span>
                          <a href={`tel:${club.phone}`} className="text-sm font-bold text-slate-800 hover:text-primary transition-colors break-all block">{club.phone || "N/A"}</a>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <div className="p-2 bg-amber-50 border border-amber-100 rounded-lg shrink-0 mt-0.5">
                          <Mail className="w-4 h-4 text-primary" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <span className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-0.5">Email</span>
                          <a href={`mailto:${club.email}`} className="text-sm font-bold text-slate-800 hover:text-primary transition-colors break-all block">{club.email || "N/A"}</a>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <div className="p-2 bg-amber-50 border border-amber-100 rounded-lg shrink-0 mt-0.5">
                          <MapPin className="w-4 h-4 text-primary" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <span className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-0.5">Location</span>
                          <span className="text-sm font-bold text-slate-800 block truncate">{club.location || "N/A"}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Stats Summary Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="card-premium text-center hover:bg-muted/15 hover:border-slate-300 transition-all flex flex-col justify-center py-5">
                <div className="text-3xl font-black text-primary mb-1">{clubFighters.length}</div>
                <div className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider">Total Fighters</div>
              </div>
              <div className="card-premium text-center hover:bg-muted/15 hover:border-slate-300 transition-all flex flex-col justify-center py-5">
                <div className="text-3xl font-black text-amber-600 mb-1">{clubChampions.length}</div>
                <div className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider">Champions</div>
              </div>
              <div className="card-premium text-center hover:bg-muted/15 hover:border-slate-300 transition-all flex flex-col justify-center py-5">
                <div className="text-3xl font-black text-secondary mb-1">{clubMatches.length}</div>
                <div className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider">Total Matches</div>
              </div>
              <div className="card-premium text-center hover:bg-muted/15 hover:border-slate-300 transition-all flex flex-col justify-center py-5">
                <div className="text-3xl font-black text-emerald-600 mb-1">
                  {clubFighters.filter(f => getFighterStatus(f).label === 'Available').length}
                </div>
                <div className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider">Available Now</div>
              </div>
            </div>
          </div>
        )}

        {/* Fighters Tab */}
        {activeTab === 'fighters' && (
          <div className="animate-fadeIn">
            {clubFighters.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {clubFighters.map((fighter) => {
                  const availability = getFighterStatus(fighter);
                  const approvalStatus: FighterApprovalStatus = fighter.approvalStatus || 'approved';
                  const isApproved = approvalStatus === 'approved';
                  
                  return (
                    <Link
                      key={fighter.id}
                      to={`/home/fighters/${fighter.id}`}
                      className="group bg-white rounded-2xl border border-border/75 overflow-hidden shadow-sm hover:shadow-xl hover:border-primary/20 hover:-translate-y-1.5 transition-all duration-300 flex flex-col"
                    >
                      {/* Photo Section */}
                      <div className="h-44 relative overflow-hidden bg-muted shrink-0">
                        <img
                          src={fighter.image || unknownFighterImg}
                          alt={fighter.name}
                          className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700 ease-out"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/20 to-transparent" />

                        {/* Approval badge top-right */}
                        {!isApproved && (
                          <div className="absolute top-3 right-3 z-10">
                            <FighterApprovalBadge status={approvalStatus} size="sm" />
                          </div>
                        )}

                        {/* Availability badge bottom-right */}
                        <div className="absolute bottom-3 left-3 right-3 flex justify-end">
                          {isApproved ? (
                            <div className={`badge-premium ${availability.style} shadow-sm`}>
                              <span className={`badge-dot ${availability.dot}`} />
                              <span>{availability.label}</span>
                              {availability.daysLeft !== undefined && <span className="font-mono ml-0.5">({availability.daysLeft}d)</span>}
                            </div>
                          ) : (
                            <div className="badge-premium badge-red shadow-sm">
                              <span className="badge-dot bg-red-500" />
                              <span>Cannot Match</span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Details Section */}
                      <div className="p-4 flex-1 flex flex-col gap-3">

                        {/* Name + Origin */}
                        <div>
                          <div className="flex items-start justify-between gap-2 mb-0.5">
                            <h3 className="text-base font-bold text-foreground leading-tight group-hover:text-primary transition-colors line-clamp-1">
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
                          {fighter.alias && (
                            <p className="text-xs text-muted-foreground font-bold italic truncate">&quot;{fighter.alias}&quot;</p>
                          )}
                        </div>

                        {/* Style Chip */}
                        {fighter.style && (
                          <div>
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
                      </div>
                    </Link>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-20 bg-white rounded-2xl border border-border/60 shadow-sm">
                <Dumbbell className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-bold text-foreground mb-1">No Fighters Registered</h3>
                <p className="text-sm text-muted-foreground max-w-xs mx-auto">There are currently no fighters registered under this camp.</p>
              </div>
            )}
          </div>
        )}

        {/* Champions Tab */}
        {activeTab === 'champions' && (
          <div className="animate-fadeIn">
            {clubChampions.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {clubChampions.map((champion) => (
                  <Link
                    key={champion.id}
                    to={`/home/fighters/${champion.id}`}
                    className="group card-premium overflow-hidden hover:-translate-y-1.5 hover:shadow-xl hover:border-amber-400/80 transition-all duration-300 flex flex-col p-0 border-amber-300"
                  >
                    {/* Champion Photo Section */}
                    <div className="relative h-56 overflow-hidden bg-gradient-to-br from-amber-400 to-[#C8102E] shrink-0">
                      <img
                        src={champion.image || unknownFighterImg}
                        alt={champion.name}
                        className="w-full h-full object-cover object-center opacity-90 group-hover:scale-103 transition-transform duration-500 ease-out"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                      <div className="absolute top-4 left-4 bg-amber-400 border border-white/20 text-[#1A1A24] px-3.5 py-1 rounded-full flex items-center gap-1.5 shadow-md">
                        <Trophy className="w-4 h-4 text-[#1A1A24] fill-[#1A1A24]" />
                        <span className="text-[10px] font-bold uppercase tracking-wider">Champion</span>
                      </div>
                    </div>
                    
                    {/* Detail Section */}
                    <div className="p-6 flex-1 flex flex-col justify-between">
                      <div>
                        <h3 className="text-xl font-extrabold text-foreground group-hover:text-primary transition-colors mb-0.5">{champion.name}</h3>
                        <p className="text-xs text-muted-foreground font-bold italic mb-4">&quot;{champion.alias}&quot;</p>
                        
                        {/* Belt Description */}
                        <div className="bg-amber-50/50 border border-amber-200/60 p-4 rounded-xl mb-4 flex flex-col justify-between">
                          <p className="text-base font-bold text-primary leading-snug">{champion.beltTitle}</p>
                          <div className="flex items-center gap-3 text-xs font-semibold text-muted-foreground mt-2">
                            <span className="flex items-center gap-1">
                              <Shield className="w-3.5 h-3.5 text-emerald-600" />
                              {champion.defenses} Defense{champion.defenses !== 1 ? 's' : ''}
                            </span>
                            <span className="w-1 h-1 bg-slate-300 rounded-full" />
                            <span className="flex items-center gap-1">
                              <Calendar className="w-3.5 h-3.5 text-secondary" />
                              Won {new Date(champion.wonDate).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Stats Subgrid */}
                      <div className="grid grid-cols-3 gap-3">
                        <div className="bg-muted/10 p-2.5 rounded-lg border border-border/60 text-center">
                          <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-wider mb-0.5">Weight</p>
                          <p className="text-sm font-semibold text-slate-800 font-mono">{champion.weight} kg</p>
                        </div>
                        <div className="bg-muted/10 p-2.5 rounded-lg border border-border/60 text-center">
                          <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-wider mb-0.5">Record</p>
                          <p className="text-sm font-semibold text-slate-800 font-mono">{champion.record}</p>
                        </div>
                        <div className="bg-muted/10 p-2.5 rounded-lg border border-border/60 text-center">
                          <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-wider mb-0.5">Grade</p>
                          <p className="text-sm font-semibold text-secondary font-mono">{champion.grade}</p>
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="text-center py-20 bg-amber-50/20 rounded-2xl border border-amber-200/50 shadow-sm flex flex-col justify-center">
                <Trophy className="w-16 h-16 text-amber-400 mx-auto mb-4" />
                <h3 className="text-lg font-bold text-foreground mb-1">No Champions Yet</h3>
                <p className="text-sm text-muted-foreground max-w-xs mx-auto">This training camp does not currently hold any title belts.</p>
              </div>
            )}
          </div>
        )}

        {/* Matches Tab */}
        {activeTab === 'matches' && (
          <div className="space-y-4 animate-fadeIn">
            {clubMatches.length > 0 ? (
              <>
                {clubMatches.map((match) => {
                  const clubFighterIsA = clubFighterIds.includes(match.fighterA.id);
                  const clubFighterIsB = clubFighterIds.includes(match.fighterB.id);
                  const bothFromClub = clubFighterIsA && clubFighterIsB;
                  
                  return (
                    <Link
                      key={match.id}
                      to={`/home/match/${match.id}`}
                      className="block card-premium hover:border-primary/20 hover:-translate-y-0.5 hover:shadow-md transition-all duration-200 overflow-hidden p-6"
                    >
                      <div className="flex items-center justify-between border-b border-border/40 pb-4 mb-4">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-secondary" />
                          <span className="text-sm font-semibold text-muted-foreground">
                            {new Date(match.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                          </span>
                        </div>
                        <span className={`badge-premium ${
                          match.status === 'Scheduled' ? 'badge-blue' :
                          match.status === 'Completed' ? 'badge-emerald' :
                          'bg-slate-100 text-slate-700'
                        }`}>
                          {match.status}
                        </span>
                      </div>

                      <div className="grid grid-cols-[1fr_auto_1fr] gap-4 items-center">
                        {/* Fighter A */}
                        <div className={`p-4 rounded-xl flex flex-col justify-center ${
                          clubFighterIsA 
                            ? 'bg-primary/5 border border-primary/20 text-left' 
                            : 'text-left border border-transparent'
                        }`}>
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-base font-bold text-foreground truncate">{match.fighterA.name}</span>
                            {clubFighterIsA && (
                              <span className="px-2 py-0.5 bg-primary text-white text-[9px] font-bold rounded uppercase">
                                Our Fighter
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground font-semibold">{match.fighterA.weight} kg • {match.fighterA.gym}</p>
                        </div>

                        {/* VS Badging */}
                        <div className="flex flex-col items-center">
                          <span className="text-[10px] font-bold text-secondary px-2.5 py-1 bg-red-50 border border-red-200/50 rounded-lg shadow-sm font-mono">VS</span>
                        </div>

                        {/* Fighter B */}
                        <div className={`p-4 rounded-xl flex flex-col justify-center ${
                          clubFighterIsB 
                            ? 'bg-primary/5 border border-primary/20 text-right' 
                            : 'text-right border border-transparent'
                        }`}>
                          <div className="flex items-center justify-end gap-2 mb-1">
                            {clubFighterIsB && (
                              <span className="px-2 py-0.5 bg-primary text-white text-[9px] font-bold rounded uppercase">
                                Our Fighter
                              </span>
                            )}
                            <span className="text-base font-bold text-foreground truncate">{match.fighterB.name}</span>
                          </div>
                          <p className="text-xs text-muted-foreground font-semibold text-right">{match.fighterB.weight} kg • {match.fighterB.gym}</p>
                        </div>
                      </div>

                      {match.result && (
                        <div className="mt-4 pt-4 border-t border-border/40 flex items-center justify-center">
                          <div className="flex items-center gap-2 px-4 py-2 bg-emerald-50 rounded-xl border border-emerald-200 text-xs font-bold text-emerald-700 shadow-sm animate-fadeIn">
                            <Trophy className="w-4 h-4 text-emerald-600 fill-emerald-100" />
                            <span>
                              Winner: {match.result.winner === 'A' ? match.fighterA.name : match.fighterB.name}
                            </span>
                            <span className="text-[10px] text-emerald-600">({match.result.method})</span>
                          </div>
                        </div>
                      )}

                      {bothFromClub && (
                        <div className="mt-3 text-center">
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-50/50 text-[#1A1A24] rounded-lg text-[10px] font-bold border border-amber-200/50">
                            <Users className="w-3.5 h-3.5 text-amber-500" />
                            CLUB INTERNAL MATCH
                          </span>
                        </div>
                      )}
                    </Link>
                  );
                })}
              </>
            ) : (
              <div className="text-center py-20 bg-white rounded-2xl border border-border/60 shadow-sm">
                <TrendingUp className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-bold text-foreground mb-1">No Matches Found</h3>
                <p className="text-sm text-muted-foreground max-w-xs mx-auto">This club's fighters have not competed in any matches yet.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}