import { useState } from "react";
import { useParams, Link } from "react-router";
import { MOCK_FIGHTERS, MOCK_MATCHES, MOCK_CLUBS } from "../data/mock";
import { MOCK_AWARDS } from "../data/awards";
import { AwardCard } from "../components/AwardCard";
import { ArrowLeft, User, HeartPulse, Activity, History, Edit, MapPin, Zap, CheckCircle, Calendar, Trophy, Users, ArrowRight, TrendingDown, ClipboardList, Dumbbell, Star } from "lucide-react";
import { clsx } from "clsx";
import unknownFighterImg from "figma:asset/b9f2c3f9c8bd58ed74f9c92de40fb83809a138b3.png";
import { usePermissions } from "../hooks/usePermissions";

const tabs = [
  { id: "overview", label: "Overview", icon: User },
  { id: "matches", label: "Matches", icon: History },
  { id: "awards", label: "Awards", icon: Trophy },
  { id: "training", label: "Training", icon: Activity },
  { id: "medical", label: "Medical", icon: HeartPulse },
];

export function FighterDetail() {
  const { id } = useParams();
  const fighter = MOCK_FIGHTERS.find((f) => f.id === id) || MOCK_FIGHTERS[0];
  const [activeTab, setActiveTab] = useState("overview");
  const permissions = usePermissions();

  // Get club information
  const club = MOCK_CLUBS.find(c => c.id === fighter.clubId);

  // Get fighter's matches
  const fights = MOCK_MATCHES.filter(m => m.fighterA.id === id || m.fighterB.id === id);
  const completedFights = fights.filter(m => m.status === "Completed").sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  const upcomingFights = fights.filter(m => m.status === "Scheduled").sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  
  const nextFight = upcomingFights[0];
  const lastFight = completedFights[0];

  // Calculate Availability (10 days after last fight)
  let isAvailable = true;
  let daysSinceFight = 999;
  
  if (lastFight) {
    const fightDate = new Date(lastFight.date);
    const today = new Date("2026-03-19");
    const diffTime = today.getTime() - fightDate.getTime();
    daysSinceFight = Math.max(0, Math.floor(diffTime / (1000 * 60 * 60 * 24)));
    isAvailable = daysSinceFight >= 10;
  }

  if (fighter.status === "Injured") {
    isAvailable = false;
  }

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-6 flex flex-col min-h-full animate-fadeIn">
      {/* Header */}
      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-4">
          <Link 
            to="/home/fighters" 
            className="p-2.5 bg-white hover:bg-muted text-primary border border-border/80 rounded-xl transition-all active:scale-95 shadow-sm"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-foreground">{fighter.name}</h1>
            <p className="text-sm text-muted-foreground mt-0.5 font-medium flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-secondary shrink-0" />
              <span>{fighter.gym}</span>
            </p>
          </div>
        </div>
        {permissions.canEdit('fighters') && (
          <Link 
            to={`/home/fighters/${fighter.id}/edit`}
            className="btn-outline py-2.5 px-5 shadow-sm"
          >
            Edit Profile
          </Link>
        )}
      </header>

      {/* Hero Section */}
      <div className="relative min-h-[300px] md:h-80 rounded-2xl overflow-hidden border border-border/60 shadow-lg bg-gradient-to-br from-[#0A3D91] via-[#0847A8] to-slate-950 flex flex-col justify-end p-6 md:p-8">
        {/* Background decorative overlay / gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-900/40 to-transparent pointer-events-none" />
        
        {/* Fighter Info Row */}
        <div className="relative z-10 flex flex-col md:flex-row gap-6 md:gap-8 items-center md:items-end h-full">
          {/* Fighter Photo */}
          <div className="relative shrink-0 z-20">
            <div className="w-36 h-48 md:w-44 md:h-56 rounded-2xl overflow-hidden border-4 border-white shadow-xl bg-slate-800">
              <img
                src={fighter.image || unknownFighterImg}
                className="w-full h-full object-cover"
                alt={fighter.name}
              />
            </div>
          </div>

          {/* Fighter Details */}
          <div className="flex-1 text-center md:text-left pb-2">
            {/* Status Badges */}
            <div className="flex flex-wrap justify-center md:justify-start gap-2 mb-3">
              <div className={`badge-premium ${fighter.status === 'Active' ? 'badge-emerald' : 'badge-amber'}`}>
                <span className={`badge-dot ${fighter.status === 'Active' ? 'bg-emerald-500' : 'bg-amber-500'}`} />
                <span className="font-bold text-xs uppercase">{fighter.status}</span>
              </div>
              <div className="badge-premium bg-white/10 text-white border-white/20">
                <span className="font-bold text-xs uppercase">{fighter.origin || 'Local'}</span>
              </div>
              <div className="badge-premium bg-white/10 text-white border-white/20">
                <span className="font-bold text-xs uppercase">{fighter.type}</span>
              </div>
            </div>

            {/* Fighter Name */}
            <h2 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight drop-shadow-md mb-1 leading-tight">
              {fighter.name}
            </h2>

            {/* Alias */}
            <p className="text-lg md:text-xl font-bold text-amber-300 italic mb-4">
              &quot;{fighter.alias || 'The Warrior'}&quot;
            </p>

            {/* Stats Subgrid */}
            <div className="flex flex-wrap justify-center md:justify-start items-center gap-3 text-white text-xs md:text-sm">
              <div className="flex items-center gap-1.5 bg-white/10 backdrop-blur-md px-3 py-1.5 rounded-xl border border-white/10 font-semibold shadow-sm">
                <span>⚖️</span>
                <span className="font-bold">{fighter.weight} kg</span>
              </div>
              <div className="flex items-center gap-1.5 bg-white/10 backdrop-blur-md px-3 py-1.5 rounded-xl border border-white/10 font-semibold shadow-sm font-mono">
                <span>Record:</span>
                <span className="font-extrabold text-[#FFFDF5]">{fighter.record}</span>
              </div>
              <div className="flex items-center gap-1.5 bg-white/10 backdrop-blur-md px-3 py-1.5 rounded-xl border border-white/10 font-semibold shadow-sm">
                <span>Style:</span>
                <span className="font-bold text-[#FFFDF5]">{fighter.style}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="w-full space-y-6">
        
        {/* Training Camp Card */}
        {club && (
          <div className="card-premium flex flex-col p-0 overflow-hidden">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-0">
              {/* Gym Photo */}
              <div className="relative h-64 md:h-auto">
                <img 
                  src={club.image} 
                  alt={club.name} 
                  className="w-full h-full object-cover" 
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/20 to-transparent" />
                <Link 
                  to={`/home/clubs/${club.id}`}
                  className="absolute bottom-6 left-6 right-6 px-6 py-3 bg-white/10 hover:bg-white/20 backdrop-blur-xl rounded-xl text-white font-bold text-center transition-all border border-white/30 flex items-center justify-center gap-2 group"
                >
                  View Club Profile
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>

              {/* Club Info */}
              <div className="p-6 md:p-8 flex flex-col justify-between">
                <div>
                  <div className="mb-4">
                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-1">Training Camp</p>
                    <h2 className="text-2xl font-bold text-foreground mb-1.5">{club.name}</h2>
                    <p className="text-muted-foreground text-sm font-medium flex items-center gap-1.5">
                      <MapPin className="w-4 h-4 text-secondary" />
                      {club.location}
                    </p>
                  </div>

                  {/* Rating */}
                  <div className="flex items-center gap-2 mb-5">
                    <div className="flex items-center gap-1 bg-[#FFFDF5] border border-amber-200/80 text-amber-700 px-2.5 py-1 rounded-full text-xs font-semibold shadow-sm">
                      <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                      <span>{club.rating} Rating</span>
                    </div>
                  </div>
                </div>

                {/* Info Cards */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-muted/15 p-4 rounded-xl border border-border/40 hover:bg-muted/20 hover:border-border/60 transition-all duration-200 flex flex-col justify-between h-[75px]">
                    <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Head Coach</div>
                    <div className="text-sm font-semibold text-slate-800 line-clamp-1">{club.headCoach}</div>
                  </div>

                  <div className="bg-muted/15 p-4 rounded-xl border border-border/40 hover:bg-muted/20 hover:border-border/60 transition-all duration-200 flex flex-col justify-between h-[75px]">
                    <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Active Fighters</div>
                    <div className="flex items-center gap-1 text-primary">
                      <Dumbbell className="w-3.5 h-3.5 shrink-0" />
                      <span className="text-sm font-bold">{club.activeFighters} Active</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab Navigation - Aligned with ClubDetail */}
        <div className="border-b border-border bg-white rounded-2xl p-1 gap-1 shadow-sm sticky top-0 z-20 flex overflow-x-auto no-scrollbar">
          {tabs.map((tab) => {
            // Determine badge count and color variant for each tab if applicable
            let badgeCount = 0;
            let badgeVariant = "badge-blue";
            if (tab.id === "matches") {
              badgeCount = fights.length;
              badgeVariant = "badge-red";
            } else if (tab.id === "awards") {
              badgeCount = MOCK_AWARDS.filter(award => award.winnerId === fighter.id).length;
              badgeVariant = "badge-amber";
            }

            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 min-w-[110px] flex items-center justify-center gap-2 py-3.5 text-sm font-semibold uppercase tracking-wider transition-all rounded-xl relative ${
                  activeTab === tab.id
                    ? 'text-primary bg-primary/5 font-bold'
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted/45'
                }`}
              >
                <tab.icon className="w-4 h-4 shrink-0" />
                <span>{tab.label}</span>
                {badgeCount > 0 && (
                  <span className={`badge-premium ${badgeVariant} px-2 py-0.5 ml-1 text-[10px]`}>
                    {badgeCount}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Tab Content */}
        <div className="pb-10">
          {activeTab === "overview" && (
            <div className="space-y-6">
              {/* Availability Status */}
              <div className={`p-6 rounded-2xl border-2 flex items-center justify-between shadow-md ${isAvailable ? 'bg-emerald-50 border-emerald-300' : 'bg-amber-50 border-amber-300'}`}>
                <div className="flex items-center gap-4">
                  <div className={`w-14 h-14 rounded-full flex items-center justify-center ${isAvailable ? 'bg-emerald-500 text-white' : 'bg-amber-500 text-white'} shadow-lg`}>
                    <CheckCircle className="w-7 h-7" />
                  </div>
                  <div>
                    <h3 className={`text-xl font-black ${isAvailable ? 'text-emerald-800' : 'text-amber-800'}`}>
                      {isAvailable ? "✅ Available for Matchmaking" : "🚫 Currently Unavailable"}
                    </h3>
                    <p className={`text-sm font-medium mt-1 ${isAvailable ? 'text-emerald-700' : 'text-amber-700'}`}>
                      {fighter.status === "Injured"
                        ? "Fighter is currently on medical suspension."
                        : isAvailable
                          ? `Cleared to fight. It has been ${daysSinceFight} days since their last bout.`
                          : `Must rest for ${10 - daysSinceFight} more days (10-day mandatory resting period).`
                      }
                    </p>
                  </div>
                </div>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Physical Stats */}
                <div className="bg-white rounded-2xl p-6 shadow-md border border-[#E0E0E0]">
                  <h3 className="text-sm font-black uppercase mb-5 tracking-wider text-[#B0B0B0] flex items-center justify-between">
                    Physical Statistics
                    <span className="bg-emerald-100 text-emerald-700 text-[9px] px-2 py-1 rounded-md font-black">KYC VERIFIED</span>
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    {[
                      { l: "Height", v: "172 cm" },
                      { l: "Weight", v: `${fighter.weight} kg` },
                      { l: "Reach", v: "175 cm" },
                      { l: "Age", v: "24" },
                    ].map((stat, i) => (
                      <div key={i} className="p-4 bg-[#F4F5F8] rounded-xl border border-[#E0E0E0]">
                        <div className="text-xs text-[#B0B0B0] uppercase tracking-wider font-bold mb-1">{stat.l}</div>
                        <div className="font-mono text-xl font-black text-[#1A1A24]">{stat.v}</div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Strike Distribution */}
                <div className="bg-white rounded-2xl p-6 shadow-md border border-[#E0E0E0]">
                  <h3 className="text-sm font-black uppercase mb-5 tracking-wider text-[#B0B0B0]">Strike Distribution</h3>
                  <div className="space-y-4">
                    {[
                      { m: "Elbows", pct: 45, color: "bg-[#C8102E]" },
                      { m: "Knees", pct: 30, color: "bg-[#0A3D91]" },
                      { m: "Punches", pct: 15, color: "bg-gray-600" },
                      { m: "Kicks", pct: 10, color: "bg-gray-400" },
                    ].map((m, i) => (
                      <div key={i}>
                        <div className="flex justify-between text-xs font-bold uppercase tracking-wider mb-2">
                          <span className="text-[#1A1A24]">{m.m}</span>
                          <span className="text-[#1A1A24] font-black">{m.pct}%</span>
                        </div>
                        <div className="h-2.5 w-full bg-gray-100 rounded-full overflow-hidden">
                          <div className={`h-full ${m.color} rounded-full transition-all duration-500`} style={{ width: `${m.pct}%` }} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Biography */}
              <div className="bg-white rounded-2xl p-6 shadow-md border border-[#E0E0E0]">
                <h3 className="text-xl font-black uppercase mb-4 text-[#1A1A24] flex items-center gap-3">
                  <span className="w-1.5 h-6 bg-[#C8102E] rounded-full" />
                  Biography & Fighting Style
                </h3>
                <p className="text-[#707070] leading-relaxed mb-4 text-base">
                  {fighter.name} is a renowned Kun Khmer specialist representing <strong className="text-[#1A1A24]">{fighter.gym}</strong>. 
                  Known for devastating techniques and relentless forward pressure, they have established themselves as a premier {fighter.weight}kg contender in the {fighter.type?.toLowerCase()} division.
                </p>
                <div className="flex gap-3">
                  <span className="px-4 py-2 bg-red-50 border border-red-200 rounded-lg text-sm font-black text-[#C8102E] uppercase tracking-wider flex items-center gap-2">
                    <Zap className="w-4 h-4" /> {fighter.style} Fighter
                  </span>
                  <span className="px-4 py-2 bg-[#F4F5F8] border border-[#E0E0E0] rounded-lg text-sm font-bold text-[#707070] uppercase tracking-wider">
                    Orthodox Stance
                  </span>
                </div>
              </div>
            </div>
          )}

          {activeTab === "matches" && (
            <div className="space-y-6">
              {/* Next Fight */}
              {nextFight && (
                <div className="bg-gradient-to-r from-[#0A3D91] to-[#0847A8] rounded-2xl overflow-hidden shadow-xl">
                  <div className="p-5 border-b border-white/10">
                    <div className="flex items-center gap-3">
                      <Calendar className="w-6 h-6 text-[#F2C94C]" />
                      <h3 className="text-xl font-black text-white uppercase">Next Fight</h3>
                    </div>
                  </div>
                  <div className="p-8 flex flex-col md:flex-row items-center justify-between gap-8">
                    <div className="flex-1 text-center md:text-left">
                      <p className="text-xs font-black text-[#F2C94C] uppercase mb-2">Scheduled</p>
                      <p className="text-3xl font-black text-white mb-2">{nextFight.date}</p>
                      <p className="text-sm text-white/70">Kun Khmer Championship 2026</p>
                    </div>
                    
                    <div className="flex items-center gap-6">
                      <div className="text-center">
                        <div className="w-20 h-20 rounded-xl overflow-hidden border-4 border-white/20 mb-2 shadow-lg">
                          <img src={fighter.image || unknownFighterImg} className="w-full h-full object-cover" alt={fighter.name} />
                        </div>
                        <p className="text-sm font-black text-white">{fighter.name}</p>
                        <p className="text-xs text-[#F2C94C]">{fighter.record}</p>
                      </div>
                      
                      <div className="text-3xl font-black text-[#F2C94C]">VS</div>
                      
                      <div className="text-center">
                        <div className="w-20 h-20 rounded-xl overflow-hidden border-4 border-white/20 mb-2 shadow-lg">
                          <img 
                            src={(nextFight.fighterA.id === fighter.id ? nextFight.fighterB.image : nextFight.fighterA.image) || unknownFighterImg} 
                            className="w-full h-full object-cover" 
                            alt="Opponent"
                          />
                        </div>
                        <p className="text-sm font-black text-white">
                          {nextFight.fighterA.id === fighter.id ? nextFight.fighterB.name : nextFight.fighterA.name}
                        </p>
                        <p className="text-xs text-[#F2C94C]">
                          {nextFight.fighterA.id === fighter.id ? nextFight.fighterB.record : nextFight.fighterA.record}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex-1 text-center md:text-right space-y-2">
                      <div className="inline-block px-4 py-2 bg-white/10 rounded-lg backdrop-blur-sm border border-white/20">
                        <p className="text-xs font-bold text-white/70 uppercase mb-1">Agreed Weight</p>
                        <p className="text-lg font-black text-white">{nextFight.weightClass}</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Fight History Table */}
              <div className="bg-white rounded-2xl overflow-hidden shadow-md border border-[#E0E0E0]">
                <div className="p-5 bg-[#F4F5F8] border-b border-[#E0E0E0]">
                  <h3 className="text-lg font-black text-[#1A1A24] uppercase">Complete Fight History</h3>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead className="bg-[#F4F5F8] text-xs uppercase tracking-wider font-black text-[#B0B0B0] border-b border-[#E0E0E0]">
                      <tr>
                        <th className="px-6 py-4">Date</th>
                        <th className="px-6 py-4">Opponent</th>
                        <th className="px-6 py-4">Result</th>
                        <th className="px-6 py-4">Method</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#E0E0E0]">
                      {fights.map((fight) => {
                        const isWinner = fight.winner === fighter.id;
                        const opponent = fight.fighterA.id === fighter.id ? fight.fighterB : fight.fighterA;
                        return (
                          <tr key={fight.id} className="hover:bg-[#F9FAFB] transition-colors">
                            <td className="px-6 py-4 font-black text-[#1A1A24]">{fight.date}</td>
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-3">
                                <img src={opponent.image || unknownFighterImg} className="w-10 h-10 rounded-lg object-cover border border-[#E0E0E0]" alt="" />
                                <Link to={`/home/fighters/${opponent.id}`} className="font-bold text-primary hover:text-secondary hover:underline">
                                  {opponent.name}
                                </Link>
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <span className={`px-3 py-1 text-xs font-black rounded-lg uppercase ${
                                fight.status !== "Completed" ? "bg-gray-100 text-gray-600" :
                                isWinner ? "bg-emerald-500 text-white" : "bg-[#C8102E] text-white"
                              }`}>
                                {fight.status !== "Completed" ? "Scheduled" : isWinner ? "Win" : "Loss"}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-[#707070] font-medium">
                              {fight.status === "Completed" ? "Decision (Unanimous)" : "—"}
                            </td>
                          </tr>
                        );
                      })}
                      {fights.length === 0 && (
                        <tr>
                          <td colSpan={4} className="px-6 py-12 text-center text-[#707070]">
                            No fight records found.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {activeTab === "awards" && (
            <div className="bg-white rounded-2xl p-6 shadow-md border border-[#E0E0E0]">
              <h3 className="text-lg font-black uppercase text-[#1A1A24] mb-6">Awards & Recognition</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {MOCK_AWARDS.filter(award => award.winnerId === fighter.id).map((award, i) => (
                  <AwardCard key={i} award={award} />
                ))}
                {MOCK_AWARDS.filter(award => award.winnerId === fighter.id).length === 0 && (
                  <div className="col-span-2 text-center py-12">
                    <Trophy className="w-16 h-16 text-[#E0E0E0] mx-auto mb-4" />
                    <p className="text-[#707070] font-medium">No awards yet. Keep fighting!</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === "training" && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Weight Cut */}
              <div className="bg-white rounded-2xl p-6 shadow-md border border-[#E0E0E0]">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center">
                    <TrendingDown className="w-6 h-6 text-[#0A3D91]" />
                  </div>
                  <h3 className="text-lg font-black uppercase text-[#1A1A24]">Weight Tracking</h3>
                </div>
                
                <div className="space-y-3">
                  <div className="p-4 bg-[#F4F5F8] rounded-xl border border-[#E0E0E0] flex justify-between items-center">
                    <span className="text-xs font-bold text-[#707070] uppercase">Current Weight</span>
                    <span className="font-mono font-black text-lg text-[#1A1A24]">{(fighter.weight + 2.4).toFixed(1)} kg</span>
                  </div>
                  <div className="p-4 bg-[#F4F5F8] rounded-xl border border-[#E0E0E0] flex justify-between items-center">
                    <span className="text-xs font-bold text-[#707070] uppercase">To Lose</span>
                    <span className="font-mono font-black text-lg text-[#C8102E]">2.4 kg</span>
                  </div>
                </div>
              </div>

              {/* Recent Sparring */}
              <div className="bg-white rounded-2xl p-6 shadow-md border border-[#E0E0E0]">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center">
                    <ClipboardList className="w-6 h-6 text-[#333333]" />
                  </div>
                  <h3 className="text-lg font-black uppercase text-[#1A1A24]">Recent Sparring</h3>
                </div>
                
                <div className="space-y-3">
                  {[
                    { date: "Yesterday", rounds: 5, partner: "Sok Rithy", notes: "Good clinching" },
                    { date: "3 days ago", rounds: 3, partner: "Chan Vathanaka", notes: "Excellent stamina" },
                  ].map((spar, i) => (
                    <div key={i} className="p-4 border border-[#E0E0E0] rounded-xl bg-[#F9FAFB]">
                      <div className="flex justify-between items-start mb-2">
                        <span className="text-xs font-bold uppercase text-[#0A3D91]">{spar.date}</span>
                        <span className="text-[10px] font-black uppercase bg-[#E0E0E0] px-2 py-0.5 rounded text-[#333333]">{spar.rounds} Rounds</span>
                      </div>
                      <p className="text-sm font-bold text-[#1A1A24] mb-1">Partner: {spar.partner}</p>
                      <p className="text-xs text-[#707070] italic">"{spar.notes}"</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === "medical" && (
            <div className="bg-white rounded-2xl p-6 shadow-md border border-[#E0E0E0]">
              <div className="flex items-center justify-between pb-6 border-b border-[#E0E0E0] mb-6">
                <div className="flex items-center gap-4">
                  <div className={`w-14 h-14 rounded-full flex items-center justify-center ${fighter.status === 'Injured' ? 'bg-amber-100' : 'bg-emerald-100'}`}>
                    <HeartPulse className={`w-7 h-7 ${fighter.status === 'Injured' ? 'text-amber-600' : 'text-emerald-600'}`} />
                  </div>
                  <div>
                    <h3 className="text-xl font-black uppercase text-[#1A1A24]">Medical Clearance</h3>
                    <p className="text-sm text-[#707070] mt-1">Status managed by Federation Doctors</p>
                  </div>
                </div>
                <span className={`px-4 py-2 rounded-lg font-black uppercase text-sm ${
                  fighter.status === 'Injured' ? 'bg-amber-500 text-white' : 'bg-emerald-500 text-white'
                }`}>
                  {fighter.status === 'Injured' ? 'Suspended' : 'Cleared'}
                </span>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                <div>
                  <span className="block text-xs text-[#B0B0B0] font-bold uppercase mb-1">Blood Type</span>
                  <span className="text-2xl font-black text-[#C8102E]">O+</span>
                </div>
                <div>
                  <span className="block text-xs text-[#B0B0B0] font-bold uppercase mb-1">Last Checkup</span>
                  <span className="text-lg font-black text-[#1A1A24]">Jan 12, 2026</span>
                </div>
                <div>
                  <span className="block text-xs text-[#B0B0B0] font-bold uppercase mb-1">Clearance Expiry</span>
                  <span className="text-lg font-black text-[#1A1A24]">Dec 31, 2026</span>
                </div>
                <div>
                  <span className="block text-xs text-[#B0B0B0] font-bold uppercase mb-1">Insurance</span>
                  <span className="text-lg font-black text-[#1A1A24]">Forte #8819</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}