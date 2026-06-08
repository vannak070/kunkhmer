import { useParams, Link } from "react-router";
import { ArrowLeft, MapPin, Dumbbell, Star, Phone, Mail, Trophy, Users, ShieldAlert, Weight, Activity, Clock, Calendar, TrendingUp, Shield, ChevronDown } from "lucide-react";
import { MOCK_FIGHTERS, MOCK_MATCHES, MOCK_CLUBS } from "../data/mock";
import { FighterApprovalBadge } from "../components/FighterApprovalBadge";
import type { FighterApprovalStatus } from "../data/fighterApproval";
import unknownFighterImg from "figma:asset/b9f2c3f9c8bd58ed74f9c92de40fb83809a138b3.png";
import { useState } from "react";

// Helper function to derive advanced fighter status based on matches and mock rules
const getFighterStatus = (fighter: any) => {
  if (fighter.status === 'Injured') return { label: 'Not Eligible', style: 'badge-red', dot: 'bg-red-500', upcoming: null };
  
  // Find matches for this fighter
  const fighterMatches = MOCK_MATCHES.filter(m => m && m.fighterA && m.fighterB && (m.fighterA.id === fighter.id || m.fighterB.id === fighter.id));
  
  // Check for upcoming scheduled fights
  const upcomingFight = fighterMatches.find(m => m.status === 'Scheduled');
  if (upcomingFight) {
    const opponent = upcomingFight.fighterA.id === fighter.id ? upcomingFight.fighterB : upcomingFight.fighterA;
    return { 
      label: 'Scheduled', 
      style: 'badge-blue',
      dot: 'bg-blue-500',
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
      return { label: 'Resting', style: 'badge-amber', dot: 'bg-amber-500', upcoming: null, daysLeft: 10 - daysSince };
    }
  }

  return { label: 'Available', style: 'badge-emerald', dot: 'bg-emerald-500', upcoming: null };
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
  
  // Find in detailed mock data first
  let club = id ? MOCK_CLUBS_DATA[id] : null;
  
  // If not found in detailed records, check the main MOCK_CLUBS array (for newly added clubs)
  if (!club && id) {
    const mainClub = MOCK_CLUBS.find(c => c.id === id);
    if (mainClub) {
      club = {
        ...mainClub,
        description: mainClub.description || "No description provided for this new club.",
        phone: mainClub.phone || "No phone number",
        email: mainClub.email || "No email address",
        established: mainClub.established || "2026",
        champions: mainClub.champions || 0
      };
    }
  }
  
  const [activeTab, setActiveTab] = useState<TabType>('overview');

  const handleTabChange = (tab: TabType) => {
    setActiveTab(tab);
    if (tab === 'overview') {
      const mainEl = document.querySelector('main');
      if (mainEl) {
        mainEl.scrollTo({ top: 0, behavior: 'smooth' });
      }
    }
  };

  // Filter fighters by club ID
  const clubFighters = MOCK_FIGHTERS.filter(fighter => fighter.clubId === id);

  // Filter matches involving fighters from this club
  const clubFighterIds = clubFighters.map(f => f.id);
  const clubMatches = MOCK_MATCHES.filter(match => 
    match && match.fighterA && match.fighterB && (
      clubFighterIds.includes(match.fighterA.id) || clubFighterIds.includes(match.fighterB.id)
    )
  ).sort((a, b) => {
    if (!a.date || !b.date) return 0;
    return new Date(b.date).getTime() - new Date(a.date).getTime();
  });

  // Mock champions from this club
  const clubChampions = clubFighters.filter(f => ['f1', 'f2'].includes(f.id)).map(fighter => ({
    ...fighter,
    beltTitle: fighter.id === 'f1' ? 'Middleweight Champion' : 'Welterweight Champion',
    defenses: fighter.id === 'f1' ? 3 : 1,
    wonDate: fighter.id === 'f1' ? '2025-11-15' : '2026-01-20'
  }));

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
        <button className="btn-outline py-2.5 px-5 shadow-sm">
          Edit Profile
        </button>
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
              <div className="text-sm font-semibold text-white truncate">{club.headCoach}</div>
            </div>
            <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-3 text-center shadow-sm">
              <div className="text-[10px] font-bold text-white/70 uppercase tracking-wider mb-0.5">Active Fighters</div>
              <div className="flex items-center justify-center gap-1">
                <Dumbbell className="w-3.5 h-3.5 text-amber-300" />
                <div className="text-sm font-semibold text-white">{club.activeFighters}</div>
              </div>
            </div>
            <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-3 text-center shadow-sm">
              <div className="text-[10px] font-bold text-white/70 uppercase tracking-wider mb-0.5">Established Since</div>
              <div className="text-sm font-semibold text-white">{club.established}</div>
            </div>
            <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-3 text-center shadow-sm">
              <div className="text-[10px] font-bold text-white/70 uppercase tracking-wider mb-0.5">Champions</div>
              <div className="flex items-center justify-center gap-1">
                <Trophy className="w-3.5 h-3.5 text-amber-300" />
                <div className="text-sm font-semibold text-white">{club.champions}</div>
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
                    <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground mb-4 flex items-center gap-2">
                      <Users className="w-4 h-4 text-primary shrink-0" />
                      <span>About the Club</span>
                    </h3>
                    <p className="text-slate-700 leading-relaxed font-medium text-sm">
                      {club.description}
                    </p>
                  </div>
                </div>
              </div>

              {/* Contact information details */}
              <div>
                <div className="card-premium bg-slate-900 border-slate-800 text-white shadow-md flex flex-col justify-between">
                  <div>
                    <h3 className="text-sm font-bold uppercase tracking-wider text-slate-300 mb-4">Contact Info</h3>
                    <div className="space-y-4">
                      <div className="flex items-start gap-3">
                        <div className="p-2 bg-white/10 backdrop-blur-sm rounded-lg shrink-0 mt-0.5">
                          <Phone className="w-4 h-4 text-amber-300" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <span className="block text-[10px] font-bold text-white/50 uppercase tracking-wider mb-0.5">Phone</span>
                          <a href={`tel:${club.phone}`} className="text-sm font-semibold hover:text-[#F2C94C] transition-colors break-all block">{club.phone}</a>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <div className="p-2 bg-white/10 backdrop-blur-sm rounded-lg shrink-0 mt-0.5">
                          <Mail className="w-4 h-4 text-amber-300" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <span className="block text-[10px] font-bold text-white/50 uppercase tracking-wider mb-0.5">Email</span>
                          <a href={`mailto:${club.email}`} className="text-sm font-semibold hover:text-[#F2C94C] transition-colors break-all block">{club.email}</a>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <div className="p-2 bg-white/10 backdrop-blur-sm rounded-lg shrink-0 mt-0.5">
                          <MapPin className="w-4 h-4 text-amber-300" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <span className="block text-[10px] font-bold text-white/50 uppercase tracking-wider mb-0.5">Location</span>
                          <span className="text-sm font-semibold text-slate-200 block truncate">{club.location}</span>
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
                <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Total Fighters</div>
              </div>
              <div className="card-premium text-center hover:bg-muted/15 hover:border-slate-300 transition-all flex flex-col justify-center py-5">
                <div className="text-3xl font-black text-amber-600 mb-1">{clubChampions.length}</div>
                <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Champions</div>
              </div>
              <div className="card-premium text-center hover:bg-muted/15 hover:border-slate-300 transition-all flex flex-col justify-center py-5">
                <div className="text-3xl font-black text-secondary mb-1">{clubMatches.length}</div>
                <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Total Matches</div>
              </div>
              <div className="card-premium text-center hover:bg-muted/15 hover:border-slate-300 transition-all flex flex-col justify-center py-5">
                <div className="text-3xl font-black text-emerald-600 mb-1">
                  {clubFighters.filter(f => getFighterStatus(f).label === 'Available').length}
                </div>
                <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Available Now</div>
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