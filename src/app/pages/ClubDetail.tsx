import { useParams, Link } from "react-router";
import { ArrowLeft, MapPin, Dumbbell, Star, Phone, Mail, Trophy, Users, ShieldAlert, Weight, Activity, Clock, Calendar, TrendingUp, Shield } from "lucide-react";
import { MOCK_FIGHTERS, MOCK_MATCHES } from "../data/mock";
import { FighterApprovalBadge } from "../components/FighterApprovalBadge";
import type { FighterApprovalStatus } from "../data/fighterApproval";
import unknownFighterImg from "figma:asset/b9f2c3f9c8bd58ed74f9c92de40fb83809a138b3.png";
import { useState } from "react";

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

// Mock Data for Club Details
const MOCK_CLUBS_DATA: Record<string, any> = {
  c1: {
    id: "c1",
    name: "Phnom Penh Top Team",
    location: "Phnom Penh, Cambodia",
    headCoach: "Chan Reach",
    activeFighters: 24,
    rating: 4.8,
    status: "active",
    image: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=2940&auto=format&fit=crop",
    description: "One of the premier Kun Khmer training facilities in the capital city, known for producing top-tier champions and providing elite training for both local and international fighters.",
    phone: "+855 12 345 678",
    email: "contact@pptt-kunkhmer.com",
    established: "2010",
    champions: 5
  },
  c2: {
    id: "c2",
    name: "Siem Reap Warriors",
    location: "Siem Reap, Cambodia",
    headCoach: "Sok Rith",
    activeFighters: 15,
    rating: 4.5,
    status: "active",
    image: "https://images.unsplash.com/photo-1555597673-b21d5c935865?q=80&w=2940&auto=format&fit=crop",
    description: "A traditional Kun Khmer camp located near the historic temples of Angkor, blending ancient techniques with modern combat sports training methodologies.",
    phone: "+855 63 987 654",
    email: "info@srwarriors.com",
    established: "2015",
    champions: 2
  },
  c3: {
    id: "c3",
    name: "Battambang Strikers",
    location: "Battambang, Cambodia",
    headCoach: "Meas Chanta",
    activeFighters: 18,
    rating: 4.2,
    status: "inactive",
    image: "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?q=80&w=2940&auto=format&fit=crop",
    description: "Known for their aggressive striking style, this camp has a long history of producing fighters with devastating elbow and knee strikes.",
    phone: "+855 53 111 222",
    email: "striker@battambang-kk.com",
    established: "2008",
    champions: 8
  },
  c4: {
    id: "c4",
    name: "Kampot Fight Club",
    location: "Kampot, Cambodia",
    headCoach: "Heng Virak",
    activeFighters: 12,
    rating: 4.3,
    status: "active",
    image: "https://images.unsplash.com/photo-1549719386-74dfcbf7dbed?q=80&w=2940&auto=format&fit=crop",
    description: "Specialized in technical striking and counter-fighting techniques, this coastal gym is renowned for developing smart, tactical fighters.",
    phone: "+855 33 123 456",
    email: "info@kampotfc.com",
    established: "2017",
    champions: 1
  },
  c5: {
    id: "c5",
    name: "Angkor Elite Academy",
    location: "Siem Reap, Cambodia",
    headCoach: "Vann Dara",
    activeFighters: 28,
    rating: 4.9,
    status: "active",
    image: "https://images.unsplash.com/photo-1552196563-55cd4e45efb3?q=80&w=2940&auto=format&fit=crop",
    description: "The highest-rated facility in Cambodia, combining ancient Kun Khmer wisdom with cutting-edge sports science and conditioning programs.",
    phone: "+855 63 555 777",
    email: "academy@angkorelite.com",
    established: "2012",
    champions: 7
  },
  c6: {
    id: "c6",
    name: "Mekong Combat Sports",
    location: "Phnom Penh, Cambodia",
    headCoach: "Sarath Kim",
    activeFighters: 20,
    rating: 4.6,
    status: "active",
    image: "https://images.unsplash.com/photo-1574680096145-d05b474e2155?q=80&w=2940&auto=format&fit=crop",
    description: "Modern training facility focusing on cross-training multiple martial arts disciplines while maintaining authentic Kun Khmer principles.",
    phone: "+855 12 888 999",
    email: "contact@mekongcombat.com",
    established: "2014",
    champions: 3
  },
  c7: {
    id: "c7",
    name: "Koh Kong Warriors",
    location: "Koh Kong, Cambodia",
    headCoach: "Pich Samnang",
    activeFighters: 10,
    rating: 4.0,
    status: "active",
    image: "https://images.unsplash.com/photo-1571902943202-507ec2618e8f?q=80&w=2940&auto=format&fit=crop",
    description: "A grassroots gym in the coastal province, dedicated to training young fighters from rural communities with traditional methods.",
    phone: "+855 35 222 333",
    email: "warriors@kohkong.com",
    established: "2018",
    champions: 0
  },
  c8: {
    id: "c8",
    name: "Royal Khmer Gym",
    location: "Phnom Penh, Cambodia",
    headCoach: "Sok Piseth",
    activeFighters: 32,
    rating: 4.7,
    status: "active",
    image: "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?q=80&w=2940&auto=format&fit=crop",
    description: "Elite training center with royal patronage, offering world-class facilities and coaching to develop national champions.",
    phone: "+855 12 777 888",
    email: "info@royalkhmer.com",
    established: "2009",
    champions: 6
  },
  c9: {
    id: "c9",
    name: "Preah Vihear Legends",
    location: "Preah Vihear, Cambodia",
    headCoach: "Tep Bunthoeun",
    activeFighters: 8,
    rating: 3.8,
    status: "active",
    image: "https://images.unsplash.com/photo-1549476464-37392f717541?q=80&w=2940&auto=format&fit=crop",
    description: "Small but passionate training camp in the northern province, preserving ancient Khmer martial arts traditions.",
    phone: "+855 64 111 222",
    email: "legends@pv.com",
    established: "2019",
    champions: 0
  },
  c10: {
    id: "c10",
    name: "Tonle Sap Tigers",
    location: "Siem Reap, Cambodia",
    headCoach: "Lim Sokha",
    activeFighters: 16,
    rating: 4.4,
    status: "active",
    image: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=2940&auto=format&fit=crop",
    description: "Lakeside training facility known for intensive conditioning programs and producing fighters with exceptional endurance.",
    phone: "+855 63 444 555",
    email: "tigers@tonlesap.com",
    established: "2016",
    champions: 2
  },
  c11: {
    id: "c11",
    name: "Bayon Fight Academy",
    location: "Phnom Penh, Cambodia",
    headCoach: "Chea Sovann",
    activeFighters: 22,
    rating: 4.5,
    status: "active",
    image: "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?q=80&w=2940&auto=format&fit=crop",
    description: "Well-established academy focusing on technical excellence and tactical fight strategies for competitive fighters.",
    phone: "+855 12 333 444",
    email: "academy@bayon.com",
    established: "2013",
    champions: 4
  },
  c12: {
    id: "c12",
    name: "Kratie Combat Club",
    location: "Kratie, Cambodia",
    headCoach: "Yim Chanra",
    activeFighters: 14,
    rating: 4.1,
    status: "active",
    image: "https://images.unsplash.com/photo-1549719386-74dfcbf7dbed?q=80&w=2940&auto=format&fit=crop",
    description: "Community-focused gym providing affordable training to local youth, emphasizing discipline and traditional values.",
    phone: "+855 72 555 666",
    email: "combat@kratie.com",
    established: "2017",
    champions: 1
  },
  c13: {
    id: "c13",
    name: "Cardamom Mountain Fighters",
    location: "Pursat, Cambodia",
    headCoach: "Khem Sopheak",
    activeFighters: 11,
    rating: 3.9,
    status: "active",
    image: "https://images.unsplash.com/photo-1552196563-55cd4e45efb3?q=80&w=2940&auto=format&fit=crop",
    description: "Unique mountain training camp utilizing natural terrain for strength and conditioning workouts.",
    phone: "+855 52 777 888",
    email: "fighters@cardamom.com",
    established: "2018",
    champions: 0
  },
  c14: {
    id: "c14",
    name: "Takeo Thunder",
    location: "Takeo, Cambodia",
    headCoach: "Mao Reaksmey",
    activeFighters: 13,
    rating: 4.2,
    status: "active",
    image: "https://images.unsplash.com/photo-1574680096145-d05b474e2155?q=80&w=2940&auto=format&fit=crop",
    description: "High-energy gym specializing in explosive striking techniques and powerful knockout training.",
    phone: "+855 32 999 000",
    email: "thunder@takeo.com",
    established: "2016",
    champions: 2
  },
  c15: {
    id: "c15",
    name: "Prey Veng Champions",
    location: "Prey Veng, Cambodia",
    headCoach: "Suon Borey",
    activeFighters: 9,
    rating: 3.7,
    status: "active",
    image: "https://images.unsplash.com/photo-1571902943202-507ec2618e8f?q=80&w=2940&auto=format&fit=crop",
    description: "Emerging training center developing the next generation of fighters from the eastern provinces.",
    phone: "+855 43 111 333",
    email: "champions@preyveng.com",
    established: "2020",
    champions: 0
  },
  c16: {
    id: "c16",
    name: "Stung Treng Warriors",
    location: "Stung Treng, Cambodia",
    headCoach: "Horn Vibol",
    activeFighters: 7,
    rating: 3.6,
    status: "inactive",
    image: "https://images.unsplash.com/photo-1549476464-37392f717541?q=80&w=2940&auto=format&fit=crop",
    description: "Currently undergoing renovation and restructuring to return with improved facilities and training programs.",
    phone: "+855 74 222 444",
    email: "warriors@stungtreng.com",
    established: "2015",
    champions: 1
  },
  c17: {
    id: "c17",
    name: "Banteay Meanchey Elite",
    location: "Banteay Meanchey, Cambodia",
    headCoach: "Nget Sambath",
    activeFighters: 19,
    rating: 4.4,
    status: "active",
    image: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=2940&auto=format&fit=crop",
    description: "Border region powerhouse known for producing tough, resilient fighters with exceptional fighting spirit.",
    phone: "+855 54 666 777",
    email: "elite@banteaymeanchey.com",
    established: "2014",
    champions: 3
  },
  c18: {
    id: "c18",
    name: "Kampong Cham Dragons",
    location: "Kampong Cham, Cambodia",
    headCoach: "Try Darith",
    activeFighters: 21,
    rating: 4.6,
    status: "active",
    image: "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?q=80&w=2940&auto=format&fit=crop",
    description: "Provincial powerhouse combining traditional Khmer techniques with modern training methodologies.",
    phone: "+855 42 888 999",
    email: "dragons@kampongcham.com",
    established: "2011",
    champions: 4
  },
  c19: {
    id: "c19",
    name: "Svay Rieng Gladiators",
    location: "Svay Rieng, Cambodia",
    headCoach: "Oeun Sopheap",
    activeFighters: 10,
    rating: 4.0,
    status: "active",
    image: "https://images.unsplash.com/photo-1549719386-74dfcbf7dbed?q=80&w=2940&auto=format&fit=crop",
    description: "Compact gym focusing on quality over quantity, providing personalized attention to each fighter.",
    phone: "+855 44 555 666",
    email: "gladiators@svayrieng.com",
    established: "2017",
    champions: 1
  },
  c20: {
    id: "c20",
    name: "Mondulkiri Mountain Lions",
    location: "Mondulkiri, Cambodia",
    headCoach: "Thol Sophoan",
    activeFighters: 6,
    rating: 3.5,
    status: "active",
    image: "https://images.unsplash.com/photo-1552196563-55cd4e45efb3?q=80&w=2940&auto=format&fit=crop",
    description: "Remote highland training camp offering unique altitude training advantages for conditioning.",
    phone: "+855 73 333 555",
    email: "lions@mondulkiri.com",
    established: "2019",
    champions: 0
  }
};

type TabType = 'overview' | 'fighters' | 'champions' | 'matches';

export function ClubDetail() {
  const { id } = useParams();
  const club = id ? MOCK_CLUBS_DATA[id] : null;
  const [activeTab, setActiveTab] = useState<TabType>('overview');

  // Filter fighters by club ID
  const clubFighters = MOCK_FIGHTERS.filter(fighter => fighter.clubId === id);

  // Filter matches involving fighters from this club
  const clubFighterIds = clubFighters.map(f => f.id);
  const clubMatches = MOCK_MATCHES.filter(match => 
    clubFighterIds.includes(match.fighterA.id) || clubFighterIds.includes(match.fighterB.id)
  ).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  // Mock champions from this club
  const clubChampions = clubFighters.filter(f => ['f1', 'f2'].includes(f.id)).map(fighter => ({
    ...fighter,
    beltTitle: fighter.id === 'f1' ? 'Middleweight Champion' : 'Welterweight Champion',
    defenses: fighter.id === 'f1' ? 3 : 1,
    wonDate: fighter.id === 'f1' ? '2025-11-15' : '2026-01-20'
  }));

  if (!club) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8 bg-[#F5F5F7] h-full">
        <ShieldAlert className="w-16 h-16 text-[#C8102E] mb-4" />
        <h2 className="text-2xl font-black text-[#0A3D91] uppercase">Club Not Found</h2>
        <p className="text-[#707070] mt-2 mb-6">The club you are looking for does not exist or has been removed.</p>
        <Link to="/home/clubs" className="flex items-center gap-2 bg-[#0A3D91] text-[#FFFFFF] px-6 py-3 rounded-xl font-bold hover:bg-[#0A3D91]/90 transition-colors shadow-md">
          <ArrowLeft className="w-5 h-5" /> Back to Clubs
        </Link>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col bg-[#F5F5F7] min-h-full">
      {/* Header */}
      <header className="bg-[#FFFFFF] border-b border-[#B0B0B0]/20 px-4 md:px-6 py-4 sticky top-0 z-20 shadow-sm">
        <div className="flex items-center gap-4">
          <Link to="/home/clubs" className="p-2 bg-[#F5F5F7] hover:bg-[#E8E8ED] text-[#0A3D91] rounded-lg transition-colors border border-[#B0B0B0]/20">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div className="flex-1 min-w-0">
            <h1 className="text-lg md:text-2xl font-black text-[#0A3D91] tracking-tight uppercase truncate">{club.name}</h1>
            <p className="text-xs md:text-sm font-medium text-[#707070] flex items-center gap-1.5">
              <MapPin className="w-3 md:w-3.5 h-3 md:h-3.5 text-[#C8102E]" /> {club.location}
            </p>
          </div>
          <button className="hidden md:flex items-center gap-2 bg-[#C8102E] hover:bg-[#A00D24] text-[#FFFFFF] px-4 py-2.5 rounded-xl font-bold transition-all shadow-md">
            Edit Profile
          </button>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto">
        {/* Hero Section */}
        <div className="relative h-64 md:h-80 overflow-hidden">
          <img src={club.image} alt={club.name} className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0A3D91]/95 via-[#0A3D91]/60 to-transparent" />
          <div className="absolute inset-0 flex flex-col justify-end p-6 md:p-8">
            <div className="flex items-center gap-2 mb-3">
              <div className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider backdrop-blur-xl shadow-lg border-2 ${
                club.status === 'active' 
                  ? 'bg-emerald-500/90 text-white border-white/30' 
                  : 'bg-[#C8102E]/90 text-white border-white/30'
              }`}>
                {club.status}
              </div>
              <div className="flex items-center gap-1.5 bg-white/20 backdrop-blur-xl px-3 py-1.5 rounded-lg border-2 border-white/30 shadow-lg">
                <Star className="w-4 h-4 text-[#F2C94C] fill-[#F2C94C]" />
                <span className="font-black text-white">{club.rating}</span>
              </div>
            </div>
            <h2 className="text-3xl md:text-5xl font-black text-white uppercase tracking-tight drop-shadow-2xl mb-4">
              {club.name}
            </h2>
            
            {/* Stats Grid */}
            <div className="grid grid-cols-4 gap-3 md:gap-4 max-w-3xl">
              <div className="bg-white/10 backdrop-blur-xl border-2 border-white/20 rounded-xl p-3 text-center">
                <div className="text-xs font-bold text-white/70 uppercase tracking-wider mb-1">Coach</div>
                <div className="text-sm md:text-base font-black text-white truncate">{club.headCoach}</div>
              </div>
              <div className="bg-white/10 backdrop-blur-xl border-2 border-white/20 rounded-xl p-3 text-center">
                <div className="text-xs font-bold text-white/70 uppercase tracking-wider mb-1">Fighters</div>
                <div className="flex items-center justify-center gap-1">
                  <Dumbbell className="w-4 h-4 text-[#F2C94C]" />
                  <div className="text-sm md:text-base font-black text-white">{club.activeFighters}</div>
                </div>
              </div>
              <div className="bg-white/10 backdrop-blur-xl border-2 border-white/20 rounded-xl p-3 text-center">
                <div className="text-xs font-bold text-white/70 uppercase tracking-wider mb-1">Since</div>
                <div className="text-sm md:text-base font-black text-white">{club.established}</div>
              </div>
              <div className="bg-white/10 backdrop-blur-xl border-2 border-white/20 rounded-xl p-3 text-center">
                <div className="text-xs font-bold text-white/70 uppercase tracking-wider mb-1">Titles</div>
                <div className="flex items-center justify-center gap-1">
                  <Trophy className="w-4 h-4 text-[#F2C94C]" />
                  <div className="text-sm md:text-base font-black text-white">{club.champions}</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="sticky top-[73px] md:top-[89px] z-10 bg-white border-b-2 border-[#E0E0E0] shadow-md">
          <div className="flex overflow-x-auto no-scrollbar">
            <button
              onClick={() => setActiveTab('overview')}
              className={`flex-1 min-w-[100px] flex items-center justify-center gap-2 px-4 md:px-6 py-4 font-black text-sm md:text-base uppercase tracking-tight transition-all relative ${
                activeTab === 'overview'
                  ? 'text-[#0A3D91] bg-[#0A3D91]/5'
                  : 'text-[#707070] hover:text-[#0A3D91] hover:bg-[#F5F5F7]'
              }`}
            >
              <Users className="w-5 h-5" />
              <span className="hidden sm:inline">Overview</span>
              {activeTab === 'overview' && (
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-[#0A3D91] via-[#C8102E] to-[#F2C94C]" />
              )}
            </button>

            <button
              onClick={() => setActiveTab('fighters')}
              className={`flex-1 min-w-[100px] flex items-center justify-center gap-2 px-4 md:px-6 py-4 font-black text-sm md:text-base uppercase tracking-tight transition-all relative ${
                activeTab === 'fighters'
                  ? 'text-[#0A3D91] bg-[#0A3D91]/5'
                  : 'text-[#707070] hover:text-[#0A3D91] hover:bg-[#F5F5F7]'
              }`}
            >
              <Dumbbell className="w-5 h-5" />
              <span className="hidden sm:inline">Fighters</span>
              <span className="px-2 py-0.5 bg-[#0A3D91] text-white text-xs rounded-full font-black">
                {clubFighters.length}
              </span>
              {activeTab === 'fighters' && (
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-[#0A3D91] via-[#C8102E] to-[#F2C94C]" />
              )}
            </button>

            <button
              onClick={() => setActiveTab('champions')}
              className={`flex-1 min-w-[100px] flex items-center justify-center gap-2 px-4 md:px-6 py-4 font-black text-sm md:text-base uppercase tracking-tight transition-all relative ${
                activeTab === 'champions'
                  ? 'text-[#0A3D91] bg-[#0A3D91]/5'
                  : 'text-[#707070] hover:text-[#0A3D91] hover:bg-[#F5F5F7]'
              }`}
            >
              <Trophy className="w-5 h-5" />
              <span className="hidden sm:inline">Champions</span>
              <span className="px-2 py-0.5 bg-[#F2C94C] text-[#1A1A24] text-xs rounded-full font-black">
                {clubChampions.length}
              </span>
              {activeTab === 'champions' && (
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-[#F2C94C] via-[#C8102E] to-[#0A3D91]" />
              )}
            </button>

            <button
              onClick={() => setActiveTab('matches')}
              className={`flex-1 min-w-[100px] flex items-center justify-center gap-2 px-4 md:px-6 py-4 font-black text-sm md:text-base uppercase tracking-tight transition-all relative ${
                activeTab === 'matches'
                  ? 'text-[#0A3D91] bg-[#0A3D91]/5'
                  : 'text-[#707070] hover:text-[#0A3D91] hover:bg-[#F5F5F7]'
              }`}
            >
              <TrendingUp className="w-5 h-5" />
              <span className="hidden sm:inline">Matches</span>
              <span className="px-2 py-0.5 bg-[#C8102E] text-white text-xs rounded-full font-black">
                {clubMatches.length}
              </span>
              {activeTab === 'matches' && (
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-[#C8102E] via-[#0A3D91] to-[#F2C94C]" />
              )}
            </button>
          </div>
        </div>

        {/* Tab Content */}
        <div className="p-4 md:p-8 max-w-7xl mx-auto w-full">
          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div className="space-y-6 animate-fadeIn">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* About */}
                <div className="md:col-span-2">
                  <div className="bg-white rounded-2xl border-2 border-[#E0E0E0] p-6 shadow-lg hover:shadow-xl transition-shadow">
                    <h3 className="text-xl font-black text-[#0A3D91] uppercase tracking-tight mb-4 flex items-center gap-2">
                      <Users className="w-6 h-6 text-[#C8102E]" />
                      About the Club
                    </h3>
                    <p className="text-[#333333] leading-relaxed font-medium text-base">
                      {club.description}
                    </p>
                  </div>
                </div>

                {/* Contact */}
                <div>
                  <div className="bg-gradient-to-br from-[#0A3D91] to-[#051C42] rounded-2xl border-2 border-[#0A3D91] p-6 shadow-lg text-white">
                    <h3 className="text-xl font-black uppercase tracking-tight mb-4">Contact Info</h3>
                    <div className="space-y-4">
                      <div className="flex items-start gap-3">
                        <div className="p-2.5 bg-white/20 backdrop-blur-sm rounded-xl">
                          <Phone className="w-5 h-5" />
                        </div>
                        <div className="flex-1">
                          <span className="block text-xs font-bold text-white/70 uppercase tracking-wider mb-1">Phone</span>
                          <a href={`tel:${club.phone}`} className="text-sm font-bold hover:text-[#F2C94C] transition-colors break-all">{club.phone}</a>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <div className="p-2.5 bg-white/20 backdrop-blur-sm rounded-xl">
                          <Mail className="w-5 h-5" />
                        </div>
                        <div className="flex-1">
                          <span className="block text-xs font-bold text-white/70 uppercase tracking-wider mb-1">Email</span>
                          <a href={`mailto:${club.email}`} className="text-sm font-bold hover:text-[#F2C94C] transition-colors break-all">{club.email}</a>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <div className="p-2.5 bg-white/20 backdrop-blur-sm rounded-xl">
                          <MapPin className="w-5 h-5" />
                        </div>
                        <div className="flex-1">
                          <span className="block text-xs font-bold text-white/70 uppercase tracking-wider mb-1">Location</span>
                          <span className="text-sm font-bold">{club.location}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Quick Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-gradient-to-br from-[#0A3D91] to-[#051C42] rounded-2xl p-6 text-center shadow-lg border-2 border-[#0A3D91]">
                  <div className="text-4xl font-black text-white mb-2">{clubFighters.length}</div>
                  <div className="text-xs font-bold text-white/70 uppercase tracking-wider">Total Fighters</div>
                </div>
                <div className="bg-gradient-to-br from-[#F2C94C] to-[#E0A800] rounded-2xl p-6 text-center shadow-lg border-2 border-[#F2C94C]">
                  <div className="text-4xl font-black text-[#1A1A24] mb-2">{clubChampions.length}</div>
                  <div className="text-xs font-bold text-[#1A1A24]/70 uppercase tracking-wider">Champions</div>
                </div>
                <div className="bg-gradient-to-br from-[#C8102E] to-[#A00D24] rounded-2xl p-6 text-center shadow-lg border-2 border-[#C8102E]">
                  <div className="text-4xl font-black text-white mb-2">{clubMatches.length}</div>
                  <div className="text-xs font-bold text-white/70 uppercase tracking-wider">Total Matches</div>
                </div>
                <div className="bg-gradient-to-br from-emerald-500 to-emerald-700 rounded-2xl p-6 text-center shadow-lg border-2 border-emerald-500">
                  <div className="text-4xl font-black text-white mb-2">{clubFighters.filter(f => getFighterStatus(f).label === 'Available').length}</div>
                  <div className="text-xs font-bold text-white/70 uppercase tracking-wider">Available Now</div>
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
                    const approvalStatus: FighterApprovalStatus = ['f1', 'f2', 'f5'].includes(fighter.id) ? 'approved' : 'pending';
                    const isApproved = approvalStatus === 'approved';
                    
                    return (
                      <div
                        key={fighter.id}
                        onClick={() => window.location.href = `/fighters/${fighter.id}`}
                        className="group cursor-pointer bg-white rounded-2xl overflow-hidden hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 border-2 border-[#E0E0E0] hover:border-[#0A3D91]"
                      >
                        <div className="relative h-64 overflow-hidden bg-gradient-to-br from-[#0A3D91] to-[#051C42]">
                          <img
                            src={unknownFighterImg}
                            alt={fighter.name}
                            className="w-full h-full object-cover object-center group-hover:scale-110 transition-transform duration-700 ease-out"
                          />
                          {!isApproved && (
                            <div className="absolute top-3 right-3">
                              <FighterApprovalBadge status={approvalStatus} size="sm" />
                            </div>
                          )}
                        </div>
                        
                        <div className="p-5 space-y-3">
                          <div>
                            <h3 className="text-lg font-black text-[#1A1A24] leading-tight mb-1 group-hover:text-[#0A3D91] transition-colors">{fighter.name}</h3>
                            <p className="text-sm text-[#707070] font-bold italic">&quot;{fighter.alias}&quot;</p>
                          </div>

                          <div className="space-y-2">
                            <div className="flex items-center gap-2 text-[#707070]">
                              <Weight className="w-4 h-4 shrink-0 text-emerald-600" />
                              <span className="text-xs font-semibold">{fighter.weight} kg</span>
                            </div>
                            <div className="flex items-center gap-2 text-[#707070]">
                              <Activity className="w-4 h-4 shrink-0 text-[#0A3D91]" />
                              <span className="text-xs font-semibold">Record: {fighter.record}</span>
                            </div>
                          </div>

                          <div className="pt-3 border-t-2 border-[#E0E0E0]">
                            {isApproved ? (
                              <div className={`inline-flex items-center gap-2 px-3 py-2 ${availability.style} rounded-lg border-2 text-xs font-bold`}>
                                <Clock className="w-4 h-4" />
                                {availability.label}
                                {availability.daysLeft !== undefined && <span>({availability.daysLeft}d)</span>}
                              </div>
                            ) : (
                              <div className="inline-flex items-center gap-2 px-3 py-2 bg-red-100 text-[#C8102E] border-red-200 rounded-lg border-2 text-xs font-bold">
                                <ShieldAlert className="w-4 h-4" />
                                Cannot Match
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-20 bg-white rounded-2xl border-2 border-[#E0E0E0]">
                  <Dumbbell className="w-20 h-20 text-[#B0B0B0] mx-auto mb-4" />
                  <p className="text-[#707070] font-bold text-lg">No fighters found for this club</p>
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
                    <div
                      key={champion.id}
                      onClick={() => window.location.href = `/fighters/${champion.id}`}
                      className="group cursor-pointer bg-white rounded-2xl border-2 border-[#F2C94C] overflow-hidden hover:shadow-2xl hover:-translate-y-2 transition-all duration-300"
                    >
                      <div className="relative h-56 overflow-hidden bg-gradient-to-br from-[#F2C94C] to-[#C8102E]">
                        <img
                          src={unknownFighterImg}
                          alt={champion.name}
                          className="w-full h-full object-cover object-center opacity-80 group-hover:scale-110 transition-transform duration-700 ease-out"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                        <div className="absolute top-4 left-4 bg-[#F2C94C] px-4 py-2 rounded-xl flex items-center gap-2 shadow-lg border-2 border-white/30">
                          <Trophy className="w-5 h-5 text-[#1A1A24]" />
                          <span className="text-sm font-black text-[#1A1A24] uppercase">Champion</span>
                        </div>
                      </div>
                      
                      <div className="p-6">
                        <h3 className="text-2xl font-black text-[#1A1A24] mb-2 group-hover:text-[#C8102E] transition-colors">{champion.name}</h3>
                        <p className="text-sm text-[#707070] font-bold italic mb-5">&quot;{champion.alias}&quot;</p>
                        
                        <div className="bg-gradient-to-r from-[#F2C94C]/20 to-transparent p-4 rounded-xl mb-5 border-l-4 border-[#F2C94C]">
                          <p className="text-lg font-black text-[#0A3D91] mb-2">{champion.beltTitle}</p>
                          <div className="flex items-center gap-4 text-xs font-bold text-[#707070]">
                            <span className="flex items-center gap-1.5">
                              <Shield className="w-4 h-4 text-emerald-600" />
                              {champion.defenses} Defense{champion.defenses !== 1 ? 's' : ''}
                            </span>
                            <span className="flex items-center gap-1.5">
                              <Calendar className="w-4 h-4 text-[#C8102E]" />
                              Won: {new Date(champion.wonDate).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                            </span>
                          </div>
                        </div>

                        <div className="grid grid-cols-3 gap-3">
                          <div className="bg-[#F5F5F7] p-3 rounded-xl text-center border-2 border-[#E0E0E0]">
                            <p className="text-xs font-bold text-[#B0B0B0] uppercase mb-1">Weight</p>
                            <p className="text-base font-black text-[#333333]">{champion.weight} kg</p>
                          </div>
                          <div className="bg-[#F5F5F7] p-3 rounded-xl text-center border-2 border-[#E0E0E0]">
                            <p className="text-xs font-bold text-[#B0B0B0] uppercase mb-1">Record</p>
                            <p className="text-base font-black text-[#333333]">{champion.record}</p>
                          </div>
                          <div className="bg-[#F5F5F7] p-3 rounded-xl text-center border-2 border-[#E0E0E0]">
                            <p className="text-xs font-bold text-[#B0B0B0] uppercase mb-1">Grade</p>
                            <p className="text-base font-black text-[#C8102E]">{champion.grade}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-20 bg-gradient-to-br from-[#F2C94C]/10 to-white rounded-2xl border-2 border-[#F2C94C]">
                  <Trophy className="w-20 h-20 text-[#F2C94C] mx-auto mb-4" />
                  <p className="text-[#707070] font-bold text-lg">No champions from this club yet</p>
                  <p className="text-sm text-[#B0B0B0] mt-2">Keep training and competing!</p>
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
                        to={`/match/${match.id}`}
                        className="block bg-white rounded-2xl border-2 border-[#E0E0E0] hover:border-[#0A3D91] hover:shadow-xl transition-all duration-300 overflow-hidden"
                      >
                        <div className="p-6">
                          <div className="flex items-center justify-between mb-5">
                            <div className="flex items-center gap-2">
                              <Calendar className="w-5 h-5 text-[#C8102E]" />
                              <span className="font-bold text-[#707070]">
                                {new Date(match.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                              </span>
                            </div>
                            <span className={`px-4 py-2 rounded-lg text-xs font-black uppercase ${
                              match.status === 'Scheduled' ? 'bg-blue-100 text-blue-700 border-2 border-blue-200' :
                              match.status === 'Completed' ? 'bg-emerald-100 text-emerald-700 border-2 border-emerald-200' :
                              'bg-gray-100 text-gray-700 border-2 border-gray-200'
                            }`}>
                              {match.status}
                            </span>
                          </div>

                          <div className="grid grid-cols-[1fr_auto_1fr] gap-4 items-center">
                            {/* Fighter A */}
                            <div className={`text-left ${
                              clubFighterIsA ? 'bg-[#0A3D91]/10 p-4 rounded-xl border-2 border-[#0A3D91]/30' : ''
                            }`}>
                              <div className="flex items-center gap-2 mb-2">
                                <span className="text-lg font-black text-[#1A1A24]">{match.fighterA.name}</span>
                                {clubFighterIsA && (
                                  <span className="px-2 py-1 bg-[#0A3D91] text-white text-[9px] font-black rounded uppercase">
                                    Our Fighter
                                  </span>
                                )}
                              </div>
                              <p className="text-sm text-[#707070] font-semibold">{match.fighterA.weight} kg • {match.fighterA.gym}</p>
                            </div>

                            {/* VS */}
                            <div className="flex flex-col items-center">
                              <span className="font-black text-[#C8102E] px-6 py-3 bg-red-50 rounded-xl border-2 border-[#C8102E]/20">VS</span>
                            </div>

                            {/* Fighter B */}
                            <div className={`text-right ${
                              clubFighterIsB ? 'bg-[#0A3D91]/10 p-4 rounded-xl border-2 border-[#0A3D91]/30' : ''
                            }`}>
                              <div className="flex items-center justify-end gap-2 mb-2">
                                {clubFighterIsB && (
                                  <span className="px-2 py-1 bg-[#0A3D91] text-white text-[9px] font-black rounded uppercase">
                                    Our Fighter
                                  </span>
                                )}
                                <span className="text-lg font-black text-[#1A1A24]">{match.fighterB.name}</span>
                              </div>
                              <p className="text-sm text-[#707070] font-semibold">{match.fighterB.weight} kg • {match.fighterB.gym}</p>
                            </div>
                          </div>

                          {match.result && (
                            <div className="mt-5 pt-5 border-t-2 border-[#E0E0E0] flex items-center justify-center">
                              <div className="flex items-center gap-3 px-5 py-3 bg-emerald-50 rounded-xl border-2 border-emerald-200">
                                <Trophy className="w-5 h-5 text-emerald-600" />
                                <span className="font-black text-emerald-700">
                                  Winner: {match.result.winner === 'A' ? match.fighterA.name : match.fighterB.name}
                                </span>
                                <span className="text-sm font-bold text-emerald-600">({match.result.method})</span>
                              </div>
                            </div>
                          )}

                          {bothFromClub && (
                            <div className="mt-4 text-center">
                              <span className="inline-flex items-center gap-2 px-4 py-2 bg-[#F2C94C]/20 text-[#1A1A24] rounded-xl text-xs font-black border-2 border-[#F2C94C]/50">
                                <Users className="w-4 h-4" />
                                CLUB INTERNAL MATCH
                              </span>
                            </div>
                          )}
                        </div>
                      </Link>
                    );
                  })}
                </>
              ) : (
                <div className="text-center py-20 bg-white rounded-2xl border-2 border-[#E0E0E0]">
                  <TrendingUp className="w-20 h-20 text-[#B0B0B0] mx-auto mb-4" />
                  <p className="text-[#707070] font-bold text-lg">No matches found for this club</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}