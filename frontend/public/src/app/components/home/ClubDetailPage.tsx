import { useState } from "react";
import { 
  ArrowLeft, MapPin, Star, Users, Check, User, Weight, 
  Phone, Mail, Trophy, ShieldAlert, Activity, Calendar, 
  TrendingUp, Shield, Video, Zap, Building2, ChevronRight 
} from "lucide-react";
import { getWeightRangeCategory } from "../../data/masterData";

interface Club {
  id: string;
  name: string;
  location: string;
  image: string;
  headCoach: string;
  activeFighters: number;
  rating: number;
  status: string;
  description?: string;
  phone?: string;
  email?: string;
  established?: string;
}

interface Fighter {
  id: string;
  name: string;
  image: string;
  age: number;
  weight: string;
  wins: number;
  losses: number;
  draws: number;
  verified: boolean;
  style?: string;
  record?: string;
  grade?: string;
  followers?: number;
  championships?: number;
  clubId?: string;
}

interface Match {
  id: string;
  eventName: string;
  fighterA: {
    id: string;
    name: string;
    image: string;
    record: string;
    weight: number;
    club: string;
    clubId?: string;
  };
  fighterB: {
    id: string;
    name: string;
    image: string;
    record: string;
    weight: number;
    club: string;
    clubId?: string;
  };
  date: string;
  time: string;
  venue: string;
  rounds: number;
  agreedWeight: number;
  status: string;
  result?: {
    winner: string;
    method: string;
    round: number;
    time?: string;
  };
}

interface ClubDetailPageProps {
  club: Club;
  fighters: Fighter[];
  matches: Match[];
  onBack: () => void;
  onFighterClick: (fighterId: string) => void;
}

type TabType = 'overview' | 'fighters' | 'champions' | 'matches';

export default function ClubDetailPage({ club, fighters, matches, onBack, onFighterClick }: ClubDetailPageProps) {
  const [activeTab, setActiveTab] = useState<TabType>('overview');

  // Availability status check for fighters
  const getFighterStatus = (fighter: Fighter) => {
    const upcomingFight = matches.find(m => 
      m.status === 'Scheduled' && (m.fighterA.id === fighter.id || m.fighterB.id === fighter.id)
    );
    if (upcomingFight) {
      const opponentName = upcomingFight.fighterA.id === fighter.id ? upcomingFight.fighterB.name : upcomingFight.fighterA.name;
      return { 
        label: 'Scheduled', 
        style: 'bg-blue-50 text-blue-700 border-blue-200',
        dot: 'bg-blue-500',
        upcoming: { date: upcomingFight.date, opponent: opponentName } 
      };
    }

    const completedFights = matches
      .filter(m => m.status === 'Completed' && (m.fighterA.id === fighter.id || m.fighterB.id === fighter.id))
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      
    if (completedFights.length > 0) {
      const lastFightDate = new Date(completedFights[0].date);
      const today = new Date();
      const daysSince = Math.floor((today.getTime() - lastFightDate.getTime()) / (1000 * 60 * 60 * 24));
      
      if (daysSince < 10 && daysSince >= 0) {
        return { label: 'Resting', style: 'bg-amber-50 text-amber-700 border-amber-200', dot: 'bg-amber-500', upcoming: null, daysLeft: 10 - daysSince };
      }
    }

    return { label: 'Available', style: 'bg-emerald-50 text-emerald-700 border-emerald-200', dot: 'bg-emerald-500', upcoming: null };
  };

  // Filter champions from this camp
  const clubChampions = fighters.filter(f => f.grade === 'A' || (f.championships && f.championships > 0));
  const clubFighterIds = fighters.map(f => f.id);

  return (
    <div className="bg-white rounded-3xl border border-gray-200 shadow-xl overflow-hidden">
      {/* Hero Cover Image Section - Full bleed banner */}
      <div className="relative h-[480px] md:h-[580px] w-full overflow-hidden">
        <img src={club.image} alt={club.name} className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-900/50 to-transparent" />
        
        {/* Floating Back Button */}
        <div className="absolute top-6 left-6 z-20">
          <button 
            onClick={onBack}
            className="p-2.5 bg-black/25 hover:bg-black/35 backdrop-blur-md text-white rounded-xl transition-all active:scale-95 border border-white/20 shadow-lg flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4 text-white" />
            <span className="text-xs font-black uppercase tracking-wider">Back</span>
          </button>
        </div>

        {/* Content overlaid at bottom of full hero image */}
        <div className="absolute bottom-6 left-6 right-6 z-10 flex flex-col justify-end">
          <div className="flex items-center gap-2 mb-2">
            <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase border shadow-md flex items-center gap-1.5 ${
              club.status === 'active' 
                ? 'bg-emerald-500/90 text-white border-white/20' 
                : 'bg-red-500/90 text-white border-white/20'
            }`}>
              <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
              {club.status}
            </span>
            <div className="flex items-center gap-1 bg-[#FFFDF5] border border-amber-200 text-amber-700 px-2.5 py-1 rounded-full text-[10px] font-black shadow-md">
              <Star className="w-3 h-3 text-amber-500 fill-amber-500" />
              <span>{club.rating}</span>
            </div>
          </div>
          
          <h1 className="text-3xl md:text-4xl font-black text-white tracking-tight drop-shadow-md mb-1 leading-tight">
            {club.name}
          </h1>
          <p className="text-xs text-white/90 font-bold flex items-center gap-1 mb-4 drop-shadow-sm">
            <MapPin className="w-3.5 h-3.5 text-[#C8102E] shrink-0" />
            <span>{club.location}</span>
          </p>
          
          {/* Cover Stats Subgrid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 max-w-3xl">
            <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-2.5 text-center shadow-sm">
              <div className="text-[9px] font-black text-white/70 uppercase tracking-wider mb-0.5">Head Coach</div>
              <div className="text-xs font-bold text-white truncate">{club.headCoach || "Chan Reach"}</div>
            </div>
            <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-2.5 text-center shadow-sm">
              <div className="text-[9px] font-black text-white/70 uppercase tracking-wider mb-0.5">Active Fighters</div>
              <div className="text-xs font-bold text-white">{fighters.length}</div>
            </div>
            <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-2.5 text-center shadow-sm">
              <div className="text-[9px] font-black text-white/70 uppercase tracking-wider mb-0.5">Established</div>
              <div className="text-xs font-bold text-white">{club.established || "2015"}</div>
            </div>
            <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-2.5 text-center shadow-sm">
              <div className="text-[9px] font-black text-white/70 uppercase tracking-wider mb-0.5">Champions</div>
              <div className="text-xs font-bold text-white">{clubChampions.length}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-gray-200 bg-gray-50/50 px-6 py-4 flex gap-1 overflow-x-auto no-scrollbar">
        <button
          onClick={() => setActiveTab('overview')}
          className={`flex-1 min-w-[100px] flex items-center justify-center gap-2 py-3 text-xs font-black uppercase tracking-wider transition-all rounded-xl ${
            activeTab === 'overview'
              ? 'text-[#0A3D91] bg-white font-black shadow-sm border border-gray-200/50'
              : 'text-gray-500 hover:text-gray-900 hover:bg-gray-100/50'
          }`}
        >
          <Users className="w-3.5 h-3.5 shrink-0" />
          <span>Overview</span>
        </button>

        <button
          onClick={() => setActiveTab('fighters')}
          className={`flex-1 min-w-[100px] flex items-center justify-center gap-2 py-3 text-xs font-black uppercase tracking-wider transition-all rounded-xl ${
            activeTab === 'fighters'
              ? 'text-[#0A3D91] bg-white font-black shadow-sm border border-gray-200/50'
              : 'text-gray-500 hover:text-gray-900 hover:bg-gray-100/50'
          }`}
        >
          <Activity className="w-3.5 h-3.5 shrink-0" />
          <span>Fighters</span>
          <span className="px-2 py-0.5 ml-1 bg-[#0A3D91]/10 text-[#0A3D91] text-[9px] font-black rounded-full">
            {fighters.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('champions')}
          className={`flex-1 min-w-[100px] flex items-center justify-center gap-2 py-3 text-xs font-black uppercase tracking-wider transition-all rounded-xl ${
            activeTab === 'champions'
              ? 'text-[#0A3D91] bg-white font-black shadow-sm border border-gray-200/50'
              : 'text-gray-500 hover:text-gray-900 hover:bg-gray-100/50'
          }`}
        >
          <Trophy className="w-3.5 h-3.5 shrink-0" />
          <span>Champions</span>
          <span className="px-2 py-0.5 ml-1 bg-amber-500/10 text-amber-700 text-[9px] font-black rounded-full">
            {clubChampions.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('matches')}
          className={`flex-1 min-w-[100px] flex items-center justify-center gap-2 py-3 text-xs font-black uppercase tracking-wider transition-all rounded-xl ${
            activeTab === 'matches'
              ? 'text-[#0A3D91] bg-white font-black shadow-sm border border-gray-200/50'
              : 'text-gray-500 hover:text-gray-900 hover:bg-gray-100/50'
          }`}
        >
          <TrendingUp className="w-3.5 h-3.5 shrink-0" />
          <span>Matches</span>
          <span className="px-2 py-0.5 ml-1 bg-red-500/10 text-red-700 text-[9px] font-black rounded-full">
            {matches.length}
          </span>
        </button>
      </div>

      {/* Tab Contents */}
      <div className="w-full p-6 md:p-8">
        {/* Overview Tab Content */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* About descriptions */}
              <div className="md:col-span-2">
                <div className="bg-white rounded-2xl p-6 border-2 border-gray-200 shadow-sm h-full flex flex-col justify-between">
                  <div>
                    <h3 className="text-xs font-black uppercase tracking-wider text-gray-500 mb-4 flex items-center gap-2">
                      <Users className="w-4 h-4 text-[#0A3D91]" />
                      <span>About the Camp</span>
                    </h3>
                    <p className="text-gray-800 leading-relaxed font-semibold text-sm">
                      {club.description}
                    </p>
                  </div>
                </div>
              </div>

              {/* Contact Information */}
              <div>
                <div className="bg-white rounded-2xl p-6 border-2 border-gray-200 shadow-sm h-full flex flex-col justify-between">
                  <div>
                    <h3 className="text-xs font-black uppercase tracking-wider text-gray-500 mb-4 flex items-center gap-2">
                      <Phone className="w-4 h-4 text-[#0A3D91]" />
                      <span>Contact Info</span>
                    </h3>
                    <div className="space-y-4">
                      <div className="flex items-start gap-3">
                        <div className="p-2 bg-blue-50 border border-blue-100 rounded-lg shrink-0 mt-0.5">
                          <Phone className="w-4 h-4 text-[#0A3D91]" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <span className="block text-[9px] font-black text-gray-400 uppercase tracking-wider mb-0.5">Phone</span>
                          <a href={`tel:${club.phone}`} className="text-xs font-bold text-gray-800 hover:text-[#0A3D91] transition-colors break-all block">{club.phone}</a>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <div className="p-2 bg-blue-50 border border-blue-100 rounded-lg shrink-0 mt-0.5">
                          <Mail className="w-4 h-4 text-[#0A3D91]" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <span className="block text-[9px] font-black text-gray-400 uppercase tracking-wider mb-0.5">Email</span>
                          <a href={`mailto:${club.email}`} className="text-xs font-bold text-gray-800 hover:text-[#0A3D91] transition-colors break-all block">{club.email}</a>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <div className="p-2 bg-blue-50 border border-blue-100 rounded-lg shrink-0 mt-0.5">
                          <MapPin className="w-4 h-4 text-[#0A3D91]" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <span className="block text-[9px] font-black text-gray-400 uppercase tracking-wider mb-0.5">Location</span>
                          <span className="text-xs font-bold text-gray-800 block truncate">{club.location}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Stats Summary Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-white rounded-2xl p-5 border-2 border-gray-200 text-center hover:bg-gray-50/50 hover:border-gray-300 transition-all flex flex-col justify-center shadow-sm">
                <div className="text-3xl font-black text-[#0A3D91] mb-1">{fighters.length}</div>
                <div className="text-[9px] font-black text-gray-400 uppercase tracking-wider">Total Fighters</div>
              </div>
              <div className="bg-white rounded-2xl p-5 border-2 border-gray-200 text-center hover:bg-gray-50/50 hover:border-gray-300 transition-all flex flex-col justify-center shadow-sm">
                <div className="text-3xl font-black text-amber-600 mb-1">{clubChampions.length}</div>
                <div className="text-[9px] font-black text-gray-400 uppercase tracking-wider">Champions</div>
              </div>
              <div className="bg-white rounded-2xl p-5 border-2 border-gray-200 text-center hover:bg-gray-50/50 hover:border-gray-300 transition-all flex flex-col justify-center shadow-sm">
                <div className="text-3xl font-black text-red-600 mb-1">{matches.length}</div>
                <div className="text-[9px] font-black text-gray-400 uppercase tracking-wider">Total Matches</div>
              </div>
              <div className="bg-white rounded-2xl p-5 border-2 border-gray-200 text-center hover:bg-gray-50/50 hover:border-gray-300 transition-all flex flex-col justify-center shadow-sm">
                <div className="text-3xl font-black text-emerald-600 mb-1">
                  {fighters.filter(f => getFighterStatus(f).label === 'Available').length}
                </div>
                <div className="text-[9px] font-black text-gray-400 uppercase tracking-wider">Available Now</div>
              </div>
            </div>
          </div>
        )}

        {/* Fighters Tab Content */}
        {activeTab === 'fighters' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {fighters.map((fighter) => {
              const availability = getFighterStatus(fighter);
              const weightClass = getWeightRangeCategory(parseFloat(fighter.weight || "0"));
              return (
                <div
                  key={fighter.id}
                  onClick={() => onFighterClick(fighter.id)}
                  className="group relative bg-white rounded-2xl overflow-hidden hover:shadow-xl transition-all duration-300 border-2 border-gray-200 hover:border-[#0A3D91]/50 cursor-pointer"
                >
                  <div className="flex h-full min-h-[220px]">
                    {/* Fighter Image - Left Side (45%) */}
                    <div className="relative w-[45%] flex-shrink-0 bg-gradient-to-br from-gray-100 to-gray-200 overflow-hidden">
                      <img
                        src={fighter.image}
                        alt={fighter.name}
                        className="w-full h-full object-cover object-top group-hover:scale-110 transition-transform duration-700"
                      />
                      <div className="absolute inset-0 bg-gradient-to-r from-black/5 via-transparent to-white/10" />

                      {/* Badges Overlay */}
                      <div className="absolute top-3 left-3 right-3 flex flex-col gap-2 z-10">
                        {/* Availability status */}
                        <div className={`px-2.5 py-1.5 rounded-lg text-[9px] font-black border uppercase w-fit shadow-md flex items-center gap-1.5 ${availability.style}`}>
                          <span className={`w-1.5 h-1.5 rounded-full inline-block ${availability.dot}`} />
                          {availability.label}
                        </div>

                        {fighter.verified && (
                          <div className="flex items-center gap-1.5 px-2.5 py-1.5 bg-gradient-to-r from-[#0A3D91] to-blue-700 rounded-lg shadow-lg w-fit">
                            <Zap className="w-3.5 h-3.5 text-white fill-white" />
                            <span className="text-xs font-black text-white uppercase">Verified</span>
                          </div>
                        )}
                        {fighter.championships && fighter.championships > 0 && (
                          <div className="flex items-center gap-1.5 px-2.5 py-1.5 bg-gradient-to-r from-[#F2C94C] to-yellow-500 rounded-lg shadow-lg w-fit">
                            <Trophy className="w-3.5 h-3.5 text-gray-900" />
                            <span className="text-xs font-black text-gray-900">{fighter.championships}x Champion</span>
                          </div>
                        )}
                      </div>

                      {/* Weight Badge - Bottom */}
                      <div className="absolute bottom-3 left-3 right-3 z-10">
                        <div className="flex items-center gap-2 px-3 py-2 bg-white/95 backdrop-blur-sm rounded-lg shadow-lg">
                          <Weight className="w-4 h-4 text-[#0A3D91]" />
                          <span className="text-sm font-black text-gray-900">{weightClass} ({fighter.weight} kg)</span>
                        </div>
                      </div>
                    </div>

                    {/* Fighter Info - Right Side (55%) */}
                    <div className="relative w-[55%] p-6 flex flex-col justify-between">
                      <div>
                        {/* Fighter Name */}
                        <h3 className="text-2xl font-black text-gray-900 mb-2 leading-tight group-hover:text-[#0A3D91] transition-colors font-sans">
                          {fighter.name}
                        </h3>

                        {/* Details */}
                        <div className="flex flex-col gap-1.5 mb-4">
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <Building2 className="w-4 h-4 text-gray-400" />
                            <span className="font-semibold truncate">{club.name}</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <User className="w-4 h-4 text-gray-400" />
                            <span className="font-semibold">{fighter.age} years old</span>
                          </div>
                        </div>

                        {/* Stats Grid - Horizontal */}
                        <div className="flex items-center gap-3 mb-5">
                          <div className="flex-1 bg-gradient-to-br from-green-50 to-green-100/50 rounded-xl p-3 border border-green-200/50 text-center">
                            <p className="text-2xl font-black text-green-600 mb-0.5">{fighter.wins}</p>
                            <p className="text-[10px] text-gray-600 font-bold uppercase tracking-wide">Wins</p>
                          </div>
                          <div className="flex-1 bg-gradient-to-br from-red-50 to-red-100/50 rounded-xl p-3 border border-red-200/50 text-center">
                            <p className="text-2xl font-black text-red-600 mb-0.5">{fighter.losses}</p>
                            <p className="text-[10px] text-gray-600 font-bold uppercase tracking-wide">Losses</p>
                          </div>
                          <div className="flex-1 bg-gradient-to-br from-yellow-50 to-yellow-100/50 rounded-xl p-3 border border-yellow-200/50 text-center">
                            <p className="text-2xl font-black text-yellow-600 mb-0.5">{fighter.draws}</p>
                            <p className="text-[10px] text-gray-600 font-bold uppercase tracking-wide">Draws</p>
                          </div>
                        </div>
                      </div>

                      {/* View Profile Button */}
                      <div className="space-y-3">
                        <button className="w-full px-5 py-3 bg-gradient-to-r from-[#0A3D91] to-blue-700 hover:from-blue-800 hover:to-blue-900 text-white rounded-xl font-bold text-sm transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2 group/btn">
                          <span>View Profile</span>
                          <ChevronRight className="w-4 h-4 group-hover/btn:translate-x-0.5 transition-transform" />
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Hover Accent */}
                  <div className="absolute inset-x-0 bottom-0 h-1 bg-gradient-to-r from-[#0A3D91] via-[#C8102E] to-[#F2C94C] opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </div>
              );
            })}
            {fighters.length === 0 && (
              <div className="col-span-full text-center py-16 bg-white border-2 border-gray-200 rounded-2xl">
                <Users className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500 font-semibold">No active fighters registered</p>
              </div>
            )}
          </div>
        )}

        {/* Champions Tab Content */}
        {activeTab === 'champions' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {clubChampions.map((champion) => (
              <div
                key={champion.id}
                onClick={() => onFighterClick(champion.id)}
                className="group bg-white rounded-2xl border-2 border-amber-300 hover:border-amber-500 overflow-hidden shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col cursor-pointer"
              >
                {/* Photo area with belt gradient overlay */}
                <div className="h-56 relative overflow-hidden bg-gradient-to-br from-amber-400 to-[#C8102E] shrink-0">
                  <img
                    src={champion.image}
                    alt={champion.name}
                    className="w-full h-full object-cover object-center opacity-90 group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent" />
                  
                  {/* Gold Trophy Tag */}
                  <div className="absolute top-4 left-4 bg-amber-400 border border-white/20 text-[#1A1A24] px-3 py-1 rounded-full flex items-center gap-1.5 shadow-md">
                    <Trophy className="w-3.5 h-3.5 text-[#1A1A24] fill-[#1A1A24]" />
                    <span className="text-[9px] font-black uppercase tracking-wider">Champion</span>
                  </div>
                </div>

                {/* Details */}
                <div className="p-5 flex-1 flex flex-col justify-between">
                  <div>
                    <h3 className="text-lg font-black text-gray-900 group-hover:text-[#0A3D91] transition-colors leading-tight mb-3">
                      {champion.name}
                    </h3>
                    
                    {/* Champion stats box */}
                    <div className="bg-amber-50/50 border border-amber-200/60 p-3.5 rounded-xl mb-4 flex flex-col justify-between">
                      <p className="text-sm font-black text-[#0A3D91] leading-snug">Kun Khmer Weight Class Title Holder</p>
                      <div className="flex items-center gap-3 text-xs font-semibold text-gray-500 mt-2">
                        <span className="flex items-center gap-1">
                          <Shield className="w-3.5 h-3.5 text-emerald-600" />
                          Title Defender
                        </span>
                        <span className="w-1 h-1 bg-gray-300 rounded-full" />
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5 text-red-500" />
                          Active Belt
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-2.5">
                    <div className="bg-gray-50 p-2 rounded-lg border border-gray-100 text-center">
                      <p className="text-[9px] font-bold text-gray-400 uppercase tracking-wider mb-0.5">Weight</p>
                      <p className="text-xs font-bold text-gray-800">{champion.weight} kg</p>
                    </div>
                    <div className="bg-gray-50 p-2 rounded-lg border border-gray-100 text-center">
                      <p className="text-[9px] font-bold text-gray-400 uppercase tracking-wider mb-0.5">Record</p>
                      <p className="text-xs font-bold text-gray-800">{champion.wins}-{champion.losses}-{champion.draws}</p>
                    </div>
                    <div className="bg-gray-50 p-2 rounded-lg border border-gray-100 text-center">
                      <p className="text-[9px] font-bold text-gray-400 uppercase tracking-wider mb-0.5">Class</p>
                      <p className="text-xs font-bold text-amber-600">Grade {champion.grade || "A"}</p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
            {clubChampions.length === 0 && (
              <div className="col-span-full text-center py-16 bg-amber-50/10 border-2 border-amber-200/40 rounded-2xl">
                <Trophy className="w-12 h-12 text-amber-400/40 mx-auto mb-3" />
                <h3 className="text-base font-bold text-gray-800 mb-1">No Title Belts</h3>
                <p className="text-xs text-gray-500 max-w-xs mx-auto">This camp does not currently hold any championships.</p>
              </div>
            )}
          </div>
        )}

        {/* Matches Tab Content */}
        {activeTab === 'matches' && (
          <div className="space-y-4">
            {matches.map((match) => {
              const isFighterA = clubFighterIds.includes(match.fighterA.id);
              const isFighterB = clubFighterIds.includes(match.fighterB.id);
              
              return (
                <div
                  key={match.id}
                  className="bg-white rounded-2xl border-2 border-gray-200 overflow-hidden shadow-sm p-5 flex flex-col gap-4"
                >
                  {/* Top info row */}
                  <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-gray-400" />
                      <span className="text-xs font-bold text-gray-600">
                        {new Date(match.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </span>
                      {match.venue && (
                        <>
                          <span className="text-gray-300">•</span>
                          <span className="text-xs font-semibold text-gray-400 truncate max-w-[150px]">{match.venue}</span>
                        </>
                      )}
                    </div>
                    <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-black border uppercase ${
                      match.status === 'Completed'
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                        : 'bg-blue-50 text-blue-700 border-blue-200'
                    }`}>
                      {match.status}
                    </span>
                  </div>

                  {/* Matchup row */}
                  <div className="grid grid-cols-[1fr_auto_1fr] gap-4 items-center">
                    {/* Fighter A */}
                    <div className={`p-3.5 rounded-xl border flex flex-col ${
                      isFighterA 
                        ? 'bg-[#0A3D91]/5 border-[#0A3D91]/25 text-left' 
                        : 'border-transparent text-left'
                    }`}>
                      <div className="flex items-center gap-1.5 mb-1.5">
                        <span className="text-sm font-black text-gray-900 truncate">{match.fighterA.name}</span>
                        {isFighterA && (
                          <span className="px-1.5 py-0.5 bg-[#0A3D91] text-white text-[8px] font-black rounded uppercase">
                            Camp
                          </span>
                        )}
                      </div>
                      <p className="text-[10px] text-gray-400 font-bold truncate">{match.fighterA.club}</p>
                    </div>

                    {/* VS Chip */}
                    <span className="text-[10px] font-black text-red-600 bg-red-50 border border-red-200/50 px-2.5 py-1 rounded-lg">VS</span>

                    {/* Fighter B */}
                    <div className={`p-3.5 rounded-xl border flex flex-col ${
                      isFighterB 
                        ? 'bg-[#0A3D91]/5 border-[#0A3D91]/25 text-right' 
                        : 'border-transparent text-right'
                    }`}>
                      <div className="flex items-center justify-end gap-1.5 mb-1.5">
                        {isFighterB && (
                          <span className="px-1.5 py-0.5 bg-[#0A3D91] text-white text-[8px] font-black rounded uppercase">
                            Camp
                          </span>
                        )}
                        <span className="text-sm font-black text-gray-900 truncate">{match.fighterB.name}</span>
                      </div>
                      <p className="text-[10px] text-gray-400 font-bold text-right truncate">{match.fighterB.club}</p>
                    </div>
                  </div>

                  {/* Winner display */}
                  {match.result && (
                    <div className="mt-2 pt-3 border-t border-gray-100 flex justify-center">
                      <div className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-50 rounded-xl border border-emerald-200 text-xs font-bold text-emerald-700 shadow-sm">
                        <Trophy className="w-3.5 h-3.5 text-emerald-600 fill-emerald-100" />
                        <span>
                          Winner: {match.result.winner === 'A' ? match.fighterA.name : match.fighterB.name}
                        </span>
                        <span className="text-[10px] text-emerald-500 font-semibold">({match.result.method})</span>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
            {matches.length === 0 && (
              <div className="text-center py-16 bg-white border-2 border-gray-200 rounded-2xl">
                <Video className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500 font-semibold">No matching history found</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
