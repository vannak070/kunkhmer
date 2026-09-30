import { useState, useEffect } from "react";
import { useParams, Link } from "react-router";
import { api } from "../utils/api";
import { MOCK_VIDEOS } from "../data/mock";
import { MOCK_AWARDS } from "../data/awards";
import { AwardCard } from "../components/AwardCard";
import { ArrowLeft, User, HeartPulse, Activity, History, Edit, MapPin, Zap, CheckCircle, Calendar, Trophy, Users, ArrowRight, TrendingDown, ClipboardList, Dumbbell, Star, Video as VideoIcon, Play, Eye } from "lucide-react";
import { clsx } from "clsx";
import unknownFighterImg from "figma:asset/b9f2c3f9c8bd58ed74f9c92de40fb83809a138b3.png";
import { usePermissions } from "../hooks/usePermissions";
import { useWeightClasses } from "../hooks/useSettingsLists";
import { toast } from "sonner";
import { FighterReviewActions, canReviewFighters, isWaiting } from "../components/FighterReview";
import { APPROVALS_ENABLED } from "../config/features";

const tabs = [
  { id: "overview", label: "Overview", icon: User },
  { id: "matches", label: "Matches", icon: History },
  { id: "videos", label: "Videos", icon: VideoIcon },
  { id: "awards", label: "Awards", icon: Trophy },
  { id: "training", label: "Training", icon: Activity },
  { id: "medical", label: "Medical", icon: HeartPulse },
];

export function FighterDetail() {
  const { id } = useParams();
  const [fighter, setFighter] = useState<any>(null);
  const [club, setClub] = useState<any>(null);
  const [fights, setFights] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");
  const permissions = usePermissions();
  // Weight classes from System Settings (Phase 5).
  const { classFor: getWeightRangeCategory } = useWeightClasses();

  useEffect(() => {
    if (id) {
      loadData();
    }
  }, [id]);

  const loadData = async () => {
    setLoading(true);
    try {
      const f = await api.fighters.get(id!);
      if (f) {
        const mappedFighter = {
          ...f,
          gym: f.clubName || f.club_name || "Independent",
          weight: parseFloat(f.currentWeight || f.current_weight || "0"),
          origin: f.nationality === "Cambodian" ? "Local" : "Foreigner",
          type: "Professional",
          dob: f.dateOfBirth || f.date_of_birth,
          pob: f.province
        };
        setFighter(mappedFighter);

        const clubId = f.clubId || f.club_id;
        if (clubId) {
          try {
            const c = await api.clubs.get(clubId);
            if (c) {
              const mappedClub = {
                ...c,
                headCoach: c.head_coach || c.headCoach,
                activeFighters: c.active_fighters || c.activeFighters || 0
              };
              setClub(mappedClub);
            }
          } catch (cErr) {
            console.error("Failed to load club details:", cErr);
          }
        }
      }

      const allMatches = await api.matches.list();
      const fighterFights = allMatches.filter(
        (m: any) => m.fighter_a_id === id || m.fighter_b_id === id
      );

      const mappedFights = fighterFights.map((m: any) => {
        const dateStr = m.date ? new Date(m.date).toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric"
        }) : "TBD";
        return {
          id: m.id,
          date: dateStr,
          status: m.status,
          winner: m.winner_id,
          weightClass: m.agreed_weight ? `${m.agreed_weight} kg` : "TBD",
          fighterA: {
            id: m.fighter_a_id,
            name: m.fighter_a_name,
            image: m.fighter_a_image,
            record: m.fighter_a_record
          },
          fighterB: {
            id: m.fighter_b_id,
            name: m.fighter_b_name,
            image: m.fighter_b_image,
            record: m.fighter_b_record
          }
        };
      });
      setFights(mappedFights);
    } catch (err: any) {
      toast.error("Failed to load fighter details: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId);
    if (tabId === 'overview') {
      const mainEl = document.querySelector('main');
      if (mainEl) {
        mainEl.scrollTo({ top: 0, behavior: 'smooth' });
      }
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!fighter) {
    return (
      <div className="p-8 text-center">
        <h2 className="text-xl font-bold">Fighter not found</h2>
        <Link to="/home/fighters" className="text-primary hover:underline mt-4 inline-block">Back to Fighters</Link>
      </div>
    );
  }

  // Get fighter's videos & awards using standard filters
  const fighterVideos = MOCK_VIDEOS.filter(video => {
    if (video.fighterId === id) return true;
    return false;
  });

  const completedFights = fights.filter(m => m.status === "Completed").sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  const upcomingFights = fights.filter(m => m.status === "Scheduled").sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  
  const nextFight = upcomingFights[0];
  const lastFight = completedFights[0];

  // Calculate Availability (10 days after last fight)
  let isAvailable = true;
  let daysSinceFight = 999;
  
  if (lastFight) {
    const fightDate = new Date(lastFight.date);
    const today = new Date();
    const diffTime = today.getTime() - fightDate.getTime();
    daysSinceFight = Math.max(0, Math.floor(diffTime / (1000 * 60 * 60 * 24)));
    isAvailable = daysSinceFight >= 10;
  }

  if (fighter.status === "Injured") {
    isAvailable = false;
  }

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto flex flex-col min-h-full animate-fadeIn">
      {/* Header */}
      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
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

      {/* KKF verification */}
      {isWaiting(fighter.status) && (
        <div className="mb-6 rounded-2xl border border-amber-200 bg-amber-50 p-5 flex flex-col md:flex-row md:items-center gap-4">
          <div className="flex-1">
            <p className="font-semibold text-amber-900">{APPROVALS_ENABLED ? "Waiting for KKF verification" : "Draft fighter"}</p>
            <p className="text-sm text-amber-800">
              {APPROVALS_ENABLED
                ? "This fighter can't be matched or shown on the fan website until KKF verifies them."
                : "This fighter can't be matched or shown on the fan website until you activate the profile."}
            </p>
          </div>
          {canReviewFighters() && (
            <FighterReviewActions fighter={fighter} onDone={(u) => setFighter((f: any) => ({ ...f, status: u.status, reviewNote: u.reviewNote, verifiedDate: u.verifiedDate }))} />
          )}
        </div>
      )}
      {fighter.status === "Rejected" && (
        <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 p-5">
          <p className="font-semibold text-red-900">Sent back to the club</p>
          <p className="text-sm text-red-800 mt-1">{fighter.reviewNote || "No reason given."}</p>
          <p className="text-xs text-red-700 mt-2">When the club edits and saves the profile, it comes back to KKF for verification.</p>
        </div>
      )}

      {/* Hero Section */}
      <div className="relative min-h-[300px] md:h-80 rounded-2xl overflow-hidden border border-border/60 shadow-lg bg-gradient-to-br from-[#0A3D91] via-[#0847A8] to-slate-950 flex flex-col justify-end p-6 md:p-8 mb-6">
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
            <h2 className="text-3xl md:text-4xl font-bold text-white tracking-tight drop-shadow-md mb-1 leading-tight">
              {fighter.name}
            </h2>

            {/* Alias */}
            <p className="text-lg md:text-xl font-semibold text-amber-300 italic mb-4">
              &quot;{fighter.alias || 'The Warrior'}&quot;
            </p>

            {/* Stats Subgrid */}
            <div className="flex flex-wrap justify-center md:justify-start items-center gap-3 text-white text-xs md:text-sm">
              <div className="flex items-center gap-1.5 bg-white/10 backdrop-blur-md px-3.5 py-1.5 rounded-xl border border-white/10 font-medium shadow-sm" title={getWeightRangeCategory(fighter.weight)}>
                <span>⚖️</span>
                <span className="font-semibold">{getWeightRangeCategory(fighter.weight)} ({fighter.weight} kg)</span>
              </div>
              <div className="flex items-center gap-1.5 bg-white/10 backdrop-blur-md px-3.5 py-1.5 rounded-xl border border-white/10 font-medium shadow-sm">
                <span>Record:</span>
                <span className="font-semibold text-white">{fighter.record}</span>
              </div>
              <div className="flex items-center gap-1.5 bg-white/10 backdrop-blur-md px-3.5 py-1.5 rounded-xl border border-white/10 font-medium shadow-sm">
                <span>Style:</span>
                <span className="font-semibold text-white">{fighter.style}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Training Camp Card */}
      {club && (
        <div className="card-premium flex flex-col p-0 overflow-hidden mb-6">
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
                  <div className="flex items-center gap-1 bg-amber-500/10 border border-amber-500/20 text-amber-700 px-2.5 py-1 rounded-full text-xs font-semibold shadow-sm">
                    <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                    <span>{club.rating} Rating</span>
                  </div>
                </div>
              </div>

              {/* Info Cards */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-muted/15 p-4 rounded-xl border border-border/40 hover:bg-muted/20 hover:border-border/60 transition-all duration-200 flex flex-col justify-between h-[75px]">
                  <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Head Coach</div>
                  <div className="text-sm font-semibold text-foreground line-clamp-1">{club.headCoach}</div>
                </div>

                <div className="bg-muted/15 p-4 rounded-xl border border-border/40 hover:bg-muted/20 hover:border-border/60 transition-all duration-200 flex flex-col justify-between h-[75px]">
                  <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Active Fighters</div>
                  <div className="flex items-center gap-1 text-primary">
                    <Dumbbell className="w-3.5 h-3.5 shrink-0" />
                    <span className="text-sm font-semibold">{club.activeFighters} Active</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab Navigation - Aligned with ClubDetail */}
      <div className="border-b border-border bg-white rounded-2xl p-1 gap-1 shadow-sm sticky -top-6 md:-top-8 z-20 flex overflow-x-auto no-scrollbar mb-6">
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
          } else if (tab.id === "videos") {
            badgeCount = fighterVideos.length;
            badgeVariant = "badge-blue";
          }

          return (
            <button
              key={tab.id}
              onClick={() => handleTabChange(tab.id)}
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
      <div className="w-full pb-10">
          {activeTab === "overview" && (
            <div className="space-y-6">
              {/* Availability Status */}
              <div className={`p-6 rounded-2xl border flex items-center justify-between shadow-sm ${isAvailable ? 'bg-emerald-50/50 border-emerald-200' : 'bg-amber-50/50 border-amber-200'}`}>
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center ${isAvailable ? 'bg-emerald-500 text-white' : 'bg-amber-500 text-white'} shadow-md`}>
                    <CheckCircle className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className={`text-lg font-bold ${isAvailable ? 'text-emerald-900' : 'text-amber-900'}`}>
                      {isAvailable ? "Available for Matchmaking" : "Currently Unavailable"}
                    </h3>
                    <p className={`text-xs font-medium mt-1 ${isAvailable ? 'text-emerald-700/90' : 'text-amber-700/90'}`}>
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
                <div className="card-premium p-6">
                  <h3 className="text-[10px] font-bold uppercase mb-5 tracking-wider text-muted-foreground flex items-center justify-between">
                    Physical Statistics
                    <span className="badge-premium badge-emerald text-[10px]">KYC VERIFIED</span>
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    {[
                      { l: "Height", v: "172 cm" },
                      { l: "Weight Range", v: getWeightRangeCategory(fighter.weight) },
                      { l: "Weight", v: `${fighter.weight} kg` },
                      { l: "Reach", v: "175 cm" },
                    ].map((stat, i) => (
                      <div key={i} className="p-4 bg-muted/30 rounded-xl border border-border/60">
                        <div className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold mb-1">{stat.l}</div>
                        <div className="text-xl font-bold text-foreground">{stat.v}</div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Strike Distribution */}
                <div className="card-premium p-6">
                  <h3 className="text-[10px] font-bold uppercase mb-5 tracking-wider text-muted-foreground">Strike Distribution</h3>
                  <div className="space-y-4">
                    {[
                      { m: "Elbows", pct: 45, color: "bg-secondary" },
                      { m: "Knees", pct: 30, color: "bg-primary" },
                      { m: "Punches", pct: 15, color: "bg-slate-500" },
                      { m: "Kicks", pct: 10, color: "bg-slate-400" },
                    ].map((m, i) => (
                      <div key={i}>
                        <div className="flex justify-between text-xs font-semibold uppercase tracking-wider mb-2">
                          <span className="text-foreground">{m.m}</span>
                          <span className="text-foreground font-bold">{m.pct}%</span>
                        </div>
                        <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                          <div className={`h-full ${m.color} rounded-full transition-all duration-500`} style={{ width: `${m.pct}%` }} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Biography */}
              <div className="card-premium p-6">
                <h3 className="text-lg font-bold text-foreground mb-4 flex items-center gap-3">
                  <span className="w-1.5 h-6 bg-secondary rounded-full" />
                  Biography & Fighting Style
                </h3>
                <p className="text-muted-foreground leading-relaxed mb-6 text-sm font-medium">
                  {fighter.name} is a renowned Kun Khmer specialist representing <strong className="text-foreground font-semibold">{fighter.gym}</strong>. 
                  Known for devastating techniques and relentless forward pressure, they have established themselves as a premier {fighter.weight}kg contender in the {fighter.type?.toLowerCase()} division.
                </p>
                <div className="flex gap-3">
                  <span className="badge-premium badge-red px-4 py-2 text-xs uppercase tracking-wider flex items-center gap-2">
                    <Zap className="w-4 h-4" /> {fighter.style} Fighter
                  </span>
                  <span className="badge-premium bg-muted/50 border-border px-4 py-2 text-xs uppercase tracking-wider">
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
                <div className="bg-gradient-to-r from-primary to-[#082E6E] rounded-2xl overflow-hidden shadow-lg border border-primary/20">
                  <div className="p-5 border-b border-white/10 bg-white/5">
                    <div className="flex items-center gap-3">
                      <Calendar className="w-5 h-5 text-amber-300" />
                      <h3 className="text-base font-bold text-white">Next Scheduled Bout</h3>
                    </div>
                  </div>
                  <div className="p-6 md:p-8 flex flex-col md:flex-row items-center justify-between gap-6 md:gap-8">
                    <div className="flex-1 text-center md:text-left">
                      <p className="text-xs font-semibold text-amber-300 uppercase tracking-wider mb-2">Scheduled</p>
                      <p className="text-2xl md:text-3xl font-bold text-white mb-1 tracking-tight">{nextFight.date}</p>
                      <p className="text-xs text-white/70 font-medium">Kun Khmer Championship 2026</p>
                    </div>
                    
                    <div className="flex items-center gap-4 sm:gap-6 bg-white/5 backdrop-blur-md px-6 py-4 rounded-2xl border border-white/10 shadow-sm">
                      <div className="text-center min-w-[70px]">
                        <div className="w-14 h-14 rounded-xl overflow-hidden border border-white/20 mb-2 shadow-md mx-auto">
                          <img src={fighter.image || unknownFighterImg} className="w-full h-full object-cover" alt={fighter.name} />
                        </div>
                        <p className="text-xs font-bold text-white truncate max-w-[90px]">{fighter.name}</p>
                        <p className="text-[10px] text-amber-300 font-semibold">{fighter.record}</p>
                      </div>
                      
                      <div className="text-lg font-black text-amber-300 px-2">VS</div>
                      
                      <div className="text-center min-w-[70px]">
                        <div className="w-14 h-14 rounded-xl overflow-hidden border border-white/20 mb-2 shadow-md mx-auto">
                          <img 
                            src={(nextFight.fighterA.id === fighter.id ? nextFight.fighterB.image : nextFight.fighterA.image) || unknownFighterImg} 
                            className="w-full h-full object-cover" 
                            alt="Opponent"
                          />
                        </div>
                        <p className="text-xs font-bold text-white truncate max-w-[90px]">
                          {nextFight.fighterA.id === fighter.id ? nextFight.fighterB.name : nextFight.fighterA.name}
                        </p>
                        <p className="text-[10px] text-amber-300 font-semibold">
                          {nextFight.fighterA.id === fighter.id ? nextFight.fighterB.record : nextFight.fighterA.record}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex-1 text-center md:text-right">
                      <div className="inline-block px-4 py-2.5 bg-white/10 rounded-xl border border-white/25">
                        <p className="text-[10px] font-semibold text-white/70 uppercase tracking-wider mb-1">Agreed Weight</p>
                        <p className="text-base font-bold text-white">{nextFight.weightClass}</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Fight History Table */}
              <div className="card-premium p-0 overflow-hidden">
                <div className="p-5 border-b border-border bg-muted/20">
                  <h3 className="text-base font-bold text-foreground">Complete Fight History</h3>
                </div>
                <div className="overflow-x-auto">
                  <table className="table-premium">
                    <thead>
                      <tr>
                        <th>Date</th>
                        <th>Opponent</th>
                        <th>Result</th>
                        <th>Method</th>
                      </tr>
                    </thead>
                    <tbody>
                      {fights.map((fight) => {
                        const isWinner = fight.winner === fighter.id;
                        const opponent = fight.fighterA.id === fighter.id ? fight.fighterB : fight.fighterA;
                        return (
                          <tr key={fight.id}>
                            <td className="font-semibold">{fight.date}</td>
                            <td>
                              <div className="flex items-center gap-3">
                                <img src={opponent.image || unknownFighterImg} className="w-9 h-9 rounded-lg object-cover border border-border" alt="" />
                                <Link to={`/home/fighters/${opponent.id}`} className="font-semibold text-primary hover:text-secondary hover:underline transition-colors">
                                  {opponent.name}
                                </Link>
                              </div>
                            </td>
                            <td>
                              <span className={`badge-premium px-2.5 py-0.5 text-xs ${
                                fight.status !== "Completed" ? "badge-blue" :
                                isWinner ? "badge-emerald" : "badge-red"
                              }`}>
                                {fight.status !== "Completed" ? "Scheduled" : isWinner ? "Win" : "Loss"}
                              </span>
                            </td>
                            <td className="text-muted-foreground font-medium">
                              {fight.status === "Completed" ? "Decision (Unanimous)" : "—"}
                            </td>
                          </tr>
                        );
                      })}
                      {fights.length === 0 && (
                        <tr>
                          <td colSpan={4} className="text-center py-12 text-muted-foreground font-medium">
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

          {activeTab === "videos" && (
            <div className="space-y-6 animate-fadeIn">
              <div className="card-premium p-6">
                <h3 className="text-base font-bold text-foreground mb-6">Related Videos ({fighterVideos.length})</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {fighterVideos.map((video) => (
                    <a
                      key={video.id}
                      href={video.youtubeUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="bg-white rounded-2xl border border-border/75 overflow-hidden shadow-sm hover:shadow-xl hover:border-primary/20 hover:-translate-y-1.5 transition-all duration-300 group flex flex-col cursor-pointer"
                    >
                      {/* Thumbnail */}
                      <div className="h-40 relative overflow-hidden bg-muted flex-shrink-0">
                        {video.thumbnail ? (
                          <img
                            src={video.thumbnail}
                            alt={video.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                          />
                        ) : (
                          <div className="w-full h-full bg-slate-900 flex items-center justify-center">
                            <VideoIcon className="w-10 h-10 text-slate-700" />
                          </div>
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/85 via-slate-950/20 to-transparent" />
                        
                        {/* Play Button Overlay */}
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="w-10 h-10 bg-white/95 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform shadow-md">
                            <Play className="w-4 h-4 text-primary ml-0.5 fill-current" />
                          </div>
                        </div>

                        {/* Category Badge */}
                        <div className="absolute bottom-3 left-3">
                          <span className="px-2 py-0.5 bg-white/15 border border-white/20 text-white rounded-full text-[9px] font-bold shadow-sm backdrop-blur-md uppercase">
                            {video.category}
                          </span>
                        </div>

                        {/* Duration Badge */}
                        <div className="absolute bottom-3 right-3 px-1.5 py-0.5 bg-black/75 text-white text-[9px] font-bold rounded">
                          {video.duration}
                        </div>
                      </div>

                      {/* Content */}
                      <div className="p-4 flex-1 flex flex-col justify-between">
                        <div>
                          <h4 className="text-sm font-bold text-foreground group-hover:text-primary transition-colors duration-200 line-clamp-2 leading-snug mb-1">
                            {video.title}
                          </h4>
                          <p className="text-xs text-muted-foreground font-medium line-clamp-2 mb-3">
                            {video.description}
                          </p>
                        </div>

                        <div className="flex items-center justify-between text-[11px] text-muted-foreground font-semibold pt-2 border-t border-border/50">
                          <span className="flex items-center gap-1">
                            <Eye className="w-3.5 h-3.5" />
                            {video.views.toLocaleString()}
                          </span>
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3.5 h-3.5" />
                            {video.uploadDate}
                          </span>
                        </div>
                      </div>
                    </a>
                  ))}

                  {fighterVideos.length === 0 && (
                    <div className="col-span-full text-center py-12">
                      <VideoIcon className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
                      <p className="text-muted-foreground font-medium">No videos linked to this fighter yet.</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {activeTab === "awards" && (
            <div className="card-premium p-6">
              <h3 className="text-base font-bold text-foreground mb-6">Awards & Recognition</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {MOCK_AWARDS.filter(award => award.winnerId === fighter.id).map((award, i) => (
                  <AwardCard key={i} award={award} />
                ))}
                {MOCK_AWARDS.filter(award => award.winnerId === fighter.id).length === 0 && (
                  <div className="col-span-2 text-center py-12">
                    <Trophy className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
                    <p className="text-muted-foreground font-medium">No awards yet. Keep fighting!</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === "training" && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Weight Cut */}
              <div className="card-premium p-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 bg-blue-50/80 rounded-xl flex items-center justify-center border border-blue-100">
                    <TrendingDown className="w-5 h-5 text-primary" />
                  </div>
                  <h3 className="text-base font-bold text-foreground">Weight Tracking</h3>
                </div>
                
                <div className="space-y-3">
                  <div className="p-4 bg-muted/30 rounded-xl border border-border flex justify-between items-center">
                    <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Current Weight</span>
                    <span className="font-bold text-lg text-foreground">{(fighter.weight + 2.4).toFixed(1)} kg</span>
                  </div>
                  <div className="p-4 bg-muted/30 rounded-xl border border-border flex justify-between items-center">
                    <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">To Lose</span>
                    <span className="font-bold text-lg text-secondary">2.4 kg</span>
                  </div>
                </div>
              </div>

              {/* Recent Sparring */}
              <div className="card-premium p-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 bg-muted/50 rounded-xl flex items-center justify-center border border-border/60">
                    <ClipboardList className="w-5 h-5 text-foreground/75" />
                  </div>
                  <h3 className="text-base font-bold text-foreground">Recent Sparring</h3>
                </div>
                
                <div className="space-y-3">
                  {[
                    { date: "Yesterday", rounds: 5, partner: "Sok Rithy", notes: "Good clinching" },
                    { date: "3 days ago", rounds: 3, partner: "Chan Vathanaka", notes: "Excellent stamina" },
                  ].map((spar, i) => (
                    <div key={i} className="p-4 border border-border rounded-xl bg-muted/5">
                      <div className="flex justify-between items-start mb-2">
                        <span className="text-xs font-bold uppercase text-primary">{spar.date}</span>
                        <span className="badge-premium bg-muted text-foreground border-border/80 px-2 py-0.5 text-[10px]">{spar.rounds} Rounds</span>
                      </div>
                      <p className="text-sm font-semibold text-foreground mb-1">Partner: {spar.partner}</p>
                      <p className="text-xs text-muted-foreground italic">"{spar.notes}"</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === "medical" && (
            <div className="card-premium p-6">
              <div className="flex items-center justify-between pb-6 border-b border-border/80 mb-6">
                <div className="flex items-center gap-4">
                  <div className={`w-14 h-14 rounded-full flex items-center justify-center ${fighter.status === 'Injured' ? 'bg-amber-100/50' : 'bg-emerald-100/50'}`}>
                    <HeartPulse className={`w-6 h-6 ${fighter.status === 'Injured' ? 'text-amber-600' : 'text-emerald-600'}`} />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-foreground">Medical Clearance</h3>
                    <p className="text-xs text-muted-foreground mt-1">Status managed by Federation Doctors</p>
                  </div>
                </div>
                <span className={`badge-premium px-3.5 py-1.5 text-xs ${
                  fighter.status === 'Injured' ? 'badge-amber' : 'badge-emerald'
                }`}>
                  {fighter.status === 'Injured' ? 'Suspended' : 'Cleared'}
                </span>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                <div>
                  <span className="block text-[10px] text-muted-foreground font-bold uppercase tracking-wider mb-1">Blood Type</span>
                  <span className="text-xl font-bold text-secondary">O+</span>
                </div>
                <div>
                  <span className="block text-[10px] text-muted-foreground font-bold uppercase tracking-wider mb-1">Last Checkup</span>
                  <span className="text-sm font-semibold text-foreground">Jan 12, 2026</span>
                </div>
                <div>
                  <span className="block text-[10px] text-muted-foreground font-bold uppercase tracking-wider mb-1">Clearance Expiry</span>
                  <span className="text-sm font-semibold text-foreground">Dec 31, 2026</span>
                </div>
                <div>
                  <span className="block text-[10px] text-muted-foreground font-bold uppercase tracking-wider mb-1">Insurance</span>
                  <span className="text-sm font-semibold text-foreground">Forte #8819</span>
                </div>
              </div>
            </div>
          )}
      </div>
    </div>
  );
}