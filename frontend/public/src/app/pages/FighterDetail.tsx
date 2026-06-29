import { useState } from "react";
import { useParams, Link } from "react-router";
import { MOCK_FIGHTERS, MOCK_MATCHES, MOCK_CLUBS } from "../data/mock";
import { MOCK_AWARDS } from "../data/awards";
import { AwardCard } from "../components/AwardCard";
import { FighterApprovalBadge } from "../components/FighterApprovalBadge";
import { getApprovalByFighter, APPROVAL_STATUS_CONFIG, type FighterApprovalStatus } from "../data/fighterApproval";
import { ArrowLeft, User, HeartPulse, Activity, History, Edit, MapPin, Zap, ShieldAlert, CheckCircle, Calendar, Trophy, Users, ArrowRight, AlertTriangle, TrendingDown, ClipboardList } from "lucide-react";
import { clsx } from "clsx";
import unknownFighterImg from "figma:asset/b9f2c3f9c8bd58ed74f9c92de40fb83809a138b3.png";

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

  // Get approval status
  const approvalRecord = getApprovalByFighter(fighter.id);
  const approvalStatus: FighterApprovalStatus = approvalRecord?.status || 'pending';
  const approvalConfig = APPROVAL_STATUS_CONFIG[approvalStatus];
  
  // Only show availability if fighter is approved
  const canShowAvailability = approvalStatus === 'approved';

  return (
    <div className="flex flex-col min-h-screen bg-[#F4F5F8]">
      {/* Hero Header - New Design */}
      <div className="relative w-full bg-gradient-to-br from-[#0A3D91] via-[#0847A8] to-[#0A3D91]">
        {/* Back and Edit buttons */}
        <div className="absolute top-6 left-6 z-20">
          <Link 
            to="/home/fighters"
            className="w-10 h-10 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center text-white backdrop-blur-xl transition-all border border-white/20 hover:scale-105"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
        </div>
        
        <Link 
          to={`/fighters/${fighter.id}/edit`}
          className="absolute top-6 right-6 z-20 px-6 py-2.5 bg-white/10 hover:bg-white/20 rounded-xl flex items-center gap-2 text-white font-bold backdrop-blur-xl transition-all border border-white/20 hover:scale-105"
        >
          <Edit className="w-4 h-4" />
          Edit
        </Link>

        {/* Fighter Info */}
        <div className="max-w-7xl mx-auto px-8 py-12">
          <div className="flex flex-col md:flex-row gap-8 items-start">
            {/* Fighter Photo */}
            <div className="relative">
              <div className="w-48 h-64 rounded-3xl overflow-hidden border-4 border-white/20 shadow-2xl bg-gradient-to-br from-[#1A1A24] to-[#333333]">
                <img 
                  src={fighter.image || unknownFighterImg} 
                  className="w-full h-full object-cover" 
                  alt={fighter.name} 
                />
              </div>
              {/* Approval Badge on Photo */}
              {!approvalConfig.canFight && (
                <div className="absolute -top-3 -right-3">
                  <FighterApprovalBadge status={approvalStatus} size="lg" />
                </div>
              )}
            </div>

            {/* Fighter Details */}
            <div className="flex-1">
              {/* Status Badges */}
              <div className="flex flex-wrap gap-2 mb-4">
                <span className={`px-3 py-1.5 text-xs font-black uppercase tracking-widest rounded-lg ${
                  fighter.status === 'Active' ? 'bg-emerald-500' : 'bg-amber-500'
                } text-white`}>
                  {fighter.status}
                </span>
                <span className={`px-3 py-1.5 text-xs font-black uppercase tracking-widest rounded-lg ${
                  fighter.origin === 'Local' ? 'bg-white text-[#0A3D91]' : 'bg-white/20 text-white border border-white/40'
                }`}>
                  {fighter.origin || 'Local'}
                </span>
                <span className={`px-3 py-1.5 text-xs font-black uppercase tracking-widest rounded-lg ${
                  fighter.type === 'Professional' ? 'bg-[#C8102E]' : 'bg-gray-700'
                } text-white`}>
                  {fighter.type}
                </span>
              </div>

              {/* Fighter Name */}
              <h1 className="text-6xl font-black text-white mb-3 tracking-tight leading-none">
                {fighter.name}
              </h1>

              {/* Alias */}
              <p className="text-3xl font-black text-[#F2C94C] mb-6 italic">
                "{fighter.alias || 'The Warrior'}"
              </p>

              {/* Stats */}
              <div className="flex flex-wrap items-center gap-6 text-white">
                <div className="flex items-center gap-2">
                  <span className="text-xl">⚖️</span>
                  <span className="text-xl font-bold">{fighter.weight} kg</span>
                </div>
                <span className="w-1 h-1 rounded-full bg-white/50" />
                <div className="font-mono text-2xl font-black">
                  {fighter.record}
                </div>
                <span className="w-1 h-1 rounded-full bg-white/50" />
                <div className="px-4 py-2 bg-white/10 rounded-lg backdrop-blur-sm border border-white/20 font-bold">
                  {fighter.style}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto w-full px-8 py-8">
        
        {/* Training Camp Card */}
        {club && (
          <div className="mb-8 bg-white rounded-3xl shadow-lg border border-[#E0E0E0] overflow-hidden">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-0">
              {/* Gym Photo */}
              <div className="relative h-80 md:h-auto">
                <img 
                  src={club.image} 
                  alt={club.name} 
                  className="w-full h-full object-cover" 
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                <Link 
                  to={`/clubs/${club.id}`}
                  className="absolute bottom-6 left-6 right-6 px-6 py-3 bg-white/10 hover:bg-white/20 backdrop-blur-xl rounded-xl text-white font-bold text-center transition-all border border-white/30 flex items-center justify-center gap-2 group"
                >
                  View Club Profile
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>

              {/* Club Info */}
              <div className="p-8">
                <div className="mb-6">
                  <p className="text-xs font-black text-[#707070] uppercase tracking-[0.15em] mb-2">Training Camp</p>
                  <h2 className="text-3xl font-black text-[#1A1A24] mb-2">{club.name}</h2>
                  <p className="text-[#707070] font-medium flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-[#0A3D91]" />
                    {club.location}
                  </p>
                </div>

                {/* Rating */}
                <div className="flex items-center gap-2 mb-6">
                  <div className="flex items-center gap-1">
                    {[...Array(5)].map((_, i) => (
                      <span 
                        key={i} 
                        className={`text-xl ${i < Math.floor(club.rating) ? 'text-[#F2C94C]' : 'text-gray-300'}`}
                      >
                        ★
                      </span>
                    ))}
                  </div>
                  <span className="text-sm font-bold text-[#707070]">{club.rating} Rating</span>
                </div>

                {/* Info Cards */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-5 bg-[#0A3D91] rounded-2xl">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                        <Users className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-white/70 uppercase tracking-wider">Head Coach</p>
                        <p className="text-lg font-black text-white">{club.headCoach}</p>
                      </div>
                    </div>
                    <p className="text-xs text-white/60">
                      Certified Kun Khmer instructor with 15+ years of experience
                    </p>
                  </div>

                  <div className="p-5 bg-blue-500 rounded-2xl">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                        <Users className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-white/70 uppercase tracking-wider">Active Fighters</p>
                        <p className="text-lg font-black text-white">{club.activeFighters}</p>
                      </div>
                    </div>
                    <p className="text-xs text-white/60">
                      Professional training facility with modern equipment
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab Navigation */}
        <div className="mb-8">
          <div className="flex overflow-x-auto no-scrollbar bg-white rounded-2xl shadow-md border border-[#E0E0E0] p-2 gap-2">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={clsx(
                  "flex items-center gap-2 px-6 py-3 text-sm font-bold uppercase tracking-wider transition-all rounded-xl whitespace-nowrap",
                  activeTab === tab.id
                    ? "bg-[#0A3D91] text-white shadow-md"
                    : "text-[#707070] hover:text-[#1A1A24] hover:bg-[#F4F5F8]"
                )}
              >
                <tab.icon className="w-5 h-5" />
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Tab Content */}
        <div className="pb-10">
          {activeTab === "overview" && (
            <div className="space-y-6">
              {/* Approval Status - Shows when fighter is NOT approved */}
              {!approvalConfig.canFight && (
                <div className={`p-8 rounded-2xl border-2 shadow-lg ${approvalConfig.bgColor} ${approvalConfig.borderColor}`}>
                  <div className="flex items-start gap-6 mb-6">
                    <div className={`w-16 h-16 rounded-2xl flex items-center justify-center bg-white/80 ${approvalConfig.color} shrink-0 shadow-lg`}>
                      <AlertTriangle className="w-8 h-8" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        <h3 className={`text-2xl font-black uppercase tracking-tight ${approvalConfig.color}`}>
                          Fighter Registration Status
                        </h3>
                        <FighterApprovalBadge status={approvalStatus} size="lg" />
                      </div>
                      <p className="text-base font-medium text-[#707070]">
                        {approvalConfig.description}
                      </p>
                    </div>
                  </div>

                  {/* Cannot compete warning */}
                  <div className="p-5 bg-white/60 rounded-xl border-2 border-red-200 mb-6">
                    <div className="flex items-start gap-3">
                      <AlertTriangle className="w-6 h-6 text-red-600 shrink-0 mt-0.5" />
                      <div>
                        <p className="text-base font-black text-red-700 mb-2">⚠️ Cannot Compete</p>
                        <p className="text-sm text-[#707070] leading-relaxed">
                          This fighter is not approved and cannot be selected for matches. Please contact KKF Administration for more details or wait for the approval process to complete.
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Rejection reason */}
                  {approvalRecord?.rejectionReason && (
                    <div className="p-5 bg-red-50 rounded-xl border-2 border-red-200 mb-6">
                      <p className="text-xs font-black text-red-700 mb-2 uppercase tracking-wider">Rejection Reason:</p>
                      <p className="text-sm text-red-600 font-medium">{approvalRecord.rejectionReason}</p>
                    </div>
                  )}

                  {/* Required actions */}
                  {approvalRecord?.revisionRequired && approvalRecord.revisionRequired.length > 0 && (
                    <div className="p-5 bg-blue-50 rounded-xl border-2 border-blue-200">
                      <p className="text-xs font-black text-blue-700 mb-3 uppercase tracking-wider">Required Actions:</p>
                      <ul className="space-y-2">
                        {approvalRecord.revisionRequired.map((item, idx) => (
                          <li key={idx} className="text-sm text-blue-600 font-medium flex items-start gap-2">
                            <span className="text-blue-400 text-lg">•</span>
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}

              {/* Availability Status - Only shown when APPROVED */}
              {canShowAvailability && (
                <div className={`p-6 rounded-2xl border-2 flex items-center justify-between shadow-md ${isAvailable ? 'bg-emerald-50 border-emerald-300' : 'bg-amber-50 border-amber-300'}`}>
                  <div className="flex items-center gap-4">
                    <div className={`w-14 h-14 rounded-full flex items-center justify-center ${isAvailable ? 'bg-emerald-500 text-white' : 'bg-amber-500 text-white'} shadow-lg`}>
                      {isAvailable ? <CheckCircle className="w-7 h-7" /> : <ShieldAlert className="w-7 h-7" />}
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
              )}

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
                                <Link to={`/fighters/${opponent.id}`} className="font-bold text-[#0A3D91] hover:text-[#C8102E] hover:underline">
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