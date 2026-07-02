import { useParams, Link, useNavigate } from "react-router";
import { ArrowLeft, Calendar, MapPin, Target, Weight, Ruler, Trophy, XCircle, Minus, Flame, TrendingUp, Users, Award, Clock, Heart, Share2, ShoppingBag, Bell, ShoppingCart, User, Home as HomeIcon, BookOpen, Handshake, Building2, Play, X, Zap, ChevronRight, CheckCircle2 } from "lucide-react";
import { MOCK_FIGHTERS, MOCK_MATCHES } from "../data/mock";
import { MEDIA_CONTENT, MediaContent } from "../data/mediaContent";
import { api } from "../utils/api";
import { useState, useEffect } from "react";
import exampleFighterBg from 'figma:asset/fe303cee6544597f8a53fd9b8b29e64c2c9ca382.png';
import kkfLogo from "figma:asset/a66d0715b1669c88badc1b57f275bd3b2182d59e.png";

export function SuperAppFighterDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [selectedVideo, setSelectedVideo] = useState<MediaContent | null>(null);
  const [fighterVideos, setFighterVideos] = useState<any[]>([]);
  const [isFollowed, setIsFollowed] = useState(false);

  // Scroll detection for header
  const [showHeader, setShowHeader] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      setIsScrolled(currentScrollY > 20);
      if (currentScrollY < 10) {
        setShowHeader(true);
      } else if (currentScrollY > lastScrollY && currentScrollY > 100) {
        setShowHeader(false);
      } else if (currentScrollY < lastScrollY) {
        setShowHeader(true);
      }
      setLastScrollY(currentScrollY);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [lastScrollY]);

  const [fighter, setFighter] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFighter = async () => {
      setLoading(true);
      try {
        const f = await api.fighters.get(id!);
        if (f) {
          const mapped = {
            ...f,
            weight: parseFloat(f.currentWeight || f.current_weight || "0").toString(),
            gym: f.clubName || f.club_name || "Independent",
            record: f.record || "0-0-0"
          };
          setFighter(mapped);
        }

        // Fetch and map videos
        const vids = await api.videos.list();
        if (vids && vids.length > 0) {
          const mappedVids = vids.map((vid: any) => {
            let youtubeId = "dQw4w9WgXcQ";
            if (vid.youtube_url || vid.youtubeUrl) {
              const url = vid.youtube_url || vid.youtubeUrl;
              const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
              const match = url.match(regExp);
              if (match && match[2].length === 11) {
                youtubeId = match[2];
              }
            }

            const viewsVal = vid.views || 0;
            let formattedViews = "0";
            if (viewsVal >= 1000000) {
              formattedViews = (viewsVal / 1000000).toFixed(1) + "M";
            } else if (viewsVal >= 1000) {
              formattedViews = (viewsVal / 1000).toFixed(1) + "K";
            } else {
              formattedViews = viewsVal.toString();
            }

            return {
              id: vid.id,
              title: vid.title,
              thumbnail: vid.thumbnail || "https://images.unsplash.com/photo-1504309092620-4d0ec726efa4?w=600",
              duration: vid.duration || "00:00",
              views: formattedViews,
              date: vid.created_at ? new Date(vid.created_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) : "Recently",
              youtubeId,
              category: vid.category || "Highlights",
              fighterId: vid.fighter_id || vid.fighterId || ""
            };
          });

          // Filter videos related to this fighter ONLY
          const related = mappedVids.filter((v: any) => v.fighterId === id);
          setFighterVideos(related);
        } else {
          setFighterVideos([]);
        }
      } catch (err) {
        console.error("Failed to load fighter details/videos:", err);
      } finally {
        setLoading(false);
      }
    };
    if (id) {
      fetchFighter();
      window.scrollTo(0, 0);
    }
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#0A3D91]" />
          <p className="text-[#0A3D91] text-xs font-bold uppercase tracking-widest animate-pulse">Loading Fighter Profile</p>
        </div>
      </div>
    );
  }

  if (!fighter) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center p-8 bg-white rounded-3xl border border-slate-200/80 shadow-xl max-w-md">
          <Trophy className="w-16 h-16 text-slate-300 mx-auto mb-4" />
          <h2 className="text-2xl font-black text-slate-800 mb-2 uppercase tracking-tight">Fighter Not Found</h2>
          <p className="text-slate-500 mb-6 text-sm">The fighter profile you are looking for does not exist or has been removed.</p>
          <Link to="/fighters" className="inline-flex items-center justify-center px-6 py-3 bg-[#0A3D91] text-white font-bold rounded-xl hover:bg-blue-800 transition-colors shadow-md shadow-blue-900/10">
            Back to Fighters List
          </Link>
        </div>
      </div>
    );
  }

  // Parse record (e.g., "80-10-2")
  const recordParts = fighter.record.split('-').map((n: string) => parseInt(n) || 0);
  const wins = recordParts[0] || 0;
  const losses = recordParts[1] || 0;
  const draws = recordParts[2] || 0;
  const totalFights = wins + losses + draws;
  const winRate = totalFights > 0 ? Math.round((wins / totalFights) * 100) : 0;
  const koWins = Math.floor(wins * 0.15);
  const koRate = wins > 0 ? Math.round((koWins / wins) * 100) : 0;

  // Deterministic age calculation based on DOB or character sum
  let detailAge = 22;
  const detailDob = fighter.dateOfBirth || fighter.date_of_birth;
  if (detailDob) {
    const birthYear = new Date(detailDob).getFullYear();
    const currentYear = new Date().getFullYear();
    if (birthYear) detailAge = currentYear - birthYear;
  } else {
    const charSum = (fighter.id || "").split("").reduce((acc: number, char: string) => acc + char.charCodeAt(0), 0);
    detailAge = 20 + (charSum % 15);
  }

  const fighterStats = {
    age: detailAge,
    height: fighter.height || 170,
    weight: fighter.weight,
    reach: fighter.reach || 175,
    stance: fighter.stance || "Orthodox",
    nationality: fighter.nationality || "Cambodian",
    flagEmoji: fighter.nationality !== 'Cambodian' ? "🌐" : "🇰🇭",
  };

  // ── Related fighters: same club OR former opponent with same weight class ──
  const opponentIds = new Set(
    MOCK_MATCHES
      .filter(m => m.fighterA.id === fighter.id || m.fighterB.id === fighter.id)
      .map(m => m.fighterA.id === fighter.id ? m.fighterB.id : m.fighterA.id)
  );

  const relatedFighters = MOCK_FIGHTERS.filter(f => {
    if (f.id === fighter.id) return false;
    const sameClub = f.gym === fighter.gym && fighter.gym && fighter.gym !== "Independent";
    const isFormerOpponentSameWeight =
      opponentIds.has(f.id) &&
      Math.abs(parseInt(f.weight) - parseInt(fighter.weight)) <= 5;
    return sameClub || isFormerOpponentSameWeight;
  }).slice(0, 4);

  // Tag each related fighter with the relation reason
  const taggedRelated = relatedFighters.map(f => ({
    ...f,
    relationTag: f.gym === fighter.gym && fighter.gym && fighter.gym !== "Independent"
      ? "Same Club"
      : "Former Opponent",
  }));

  // Get fighter-related videos from database (state)

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      {/* ── Sticky Header ── */}
      <header className={`sticky top-0 z-50 backdrop-blur-xl border-b shadow-sm transition-all duration-300 ${
        showHeader ? 'translate-y-0' : '-translate-y-full'
      } ${isScrolled ? 'bg-white border-[#E2E8F0]' : 'bg-white/80 border-[#E2E8F0]/50'}`}>
        <div className="max-w-7xl mx-auto px-4 md:px-6">
          <div className="flex items-center justify-between py-4 gap-4">
            <Link to="/" className="group flex items-center gap-3 flex-shrink-0">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-br from-[#0A3D91]/20 to-blue-500/20 rounded-2xl blur-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <img src={kkfLogo} alt="KKF Logo" className="relative w-14 h-14 md:w-16 md:h-16 object-contain group-hover:scale-105 transition-transform duration-300" />
              </div>
              <div className="hidden sm:block">
                <h1 className="text-xl md:text-2xl font-black text-gray-900 leading-tight tracking-tight uppercase">KUNKHMER</h1>
                <p className="text-xs md:text-sm text-gray-500 font-medium leading-tight">Official Platform</p>
              </div>
            </Link>

            <div className="flex items-center gap-1.5 md:gap-2 flex-shrink-0">
              <button className="relative p-2.5 md:p-3 hover:bg-gray-100 rounded-xl transition-all group">
                <Bell className="w-5 h-5 text-gray-600 group-hover:text-[#0A3D91] transition-colors" />
                <span className="absolute top-2 right-2 w-2 h-2 bg-[#C8102E] rounded-full ring-2 ring-white animate-pulse" />
              </button>
              <button className="relative p-2.5 md:p-3 hover:bg-gray-100 rounded-xl transition-all group">
                <ShoppingCart className="w-5 h-5 text-gray-600 group-hover:text-[#0A3D91] transition-colors" />
              </button>
              <button onClick={() => navigate("/profile")} className="p-2.5 md:p-3 hover:bg-gray-100 rounded-xl transition-all group">
                <User className="w-5 h-5 text-gray-600 group-hover:text-[#0A3D91] transition-colors" />
              </button>
            </div>
          </div>

          <nav className="hidden md:flex items-center gap-2 pb-4 border-t border-gray-100/80 pt-4 overflow-x-auto">
            <Link to="/" className="group flex items-center gap-2.5 px-5 py-3 rounded-2xl whitespace-nowrap font-semibold text-sm transition-all duration-300 text-gray-600 hover:bg-gray-100 hover:text-gray-900">
              <div className="flex items-center justify-center w-8 h-8 rounded-xl bg-gray-100 group-hover:bg-gray-200 transition-all">
                <HomeIcon className="w-4 h-4 text-gray-600 group-hover:text-gray-900" />
              </div>
              <span className="text-sm font-bold tracking-wide">Home</span>
            </Link>
            <Link to="/matches" className="group flex items-center gap-2.5 px-5 py-3 rounded-2xl whitespace-nowrap font-semibold text-sm transition-all duration-300 text-gray-600 hover:bg-gray-100 hover:text-gray-900">
              <div className="flex items-center justify-center w-8 h-8 rounded-xl bg-gray-100 group-hover:bg-gray-200 transition-all">
                <Trophy className="w-4 h-4 text-gray-600 group-hover:text-gray-900" />
              </div>
              <span className="text-sm font-bold tracking-wide">Matches &amp; Events</span>
            </Link>
            <Link to="/news-events" className="group flex items-center gap-2.5 px-5 py-3 rounded-2xl whitespace-nowrap font-semibold text-sm transition-all duration-300 text-gray-600 hover:bg-gray-100 hover:text-gray-900">
              <div className="flex items-center justify-center w-8 h-8 rounded-xl bg-gray-100 group-hover:bg-gray-200 transition-all">
                <BookOpen className="w-4 h-4 text-gray-600 group-hover:text-gray-900" />
              </div>
              <span className="text-sm font-bold tracking-wide">News &amp; Media</span>
            </Link>
            <Link to="/fighters" className="group relative flex items-center gap-2.5 px-5 py-3 rounded-2xl whitespace-nowrap font-semibold text-sm transition-all duration-300 bg-gradient-to-r from-[#0A3D91] to-blue-600 text-white shadow-lg scale-105">
              <div className="flex items-center justify-center w-8 h-8 rounded-xl bg-white/20 transition-all">
                <Users className="w-4 h-4 text-white" />
              </div>
              <span className="text-sm font-bold tracking-wide">Fighters</span>
              <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-12 h-1 bg-white/40 rounded-full" />
            </Link>
            <Link to="/strategic-partners" className="group flex items-center gap-2.5 px-5 py-3 rounded-2xl whitespace-nowrap font-semibold text-sm transition-all duration-300 text-gray-600 hover:bg-gray-100 hover:text-gray-900">
              <div className="flex items-center justify-center w-8 h-8 rounded-xl bg-gray-100 group-hover:bg-gray-200 transition-all">
                <Handshake className="w-4 h-4 text-gray-600 group-hover:text-gray-900" />
              </div>
              <span className="text-sm font-bold tracking-wide">Strategic Partners</span>
            </Link>
            <Link to="/shop" className="group flex items-center gap-2.5 px-5 py-3 rounded-2xl whitespace-nowrap font-semibold text-sm transition-all duration-300 text-gray-600 hover:bg-gray-100 hover:text-gray-900">
              <div className="flex items-center justify-center w-8 h-8 rounded-xl bg-gray-100 group-hover:bg-gray-200 transition-all">
                <ShoppingCart className="w-4 h-4 text-gray-600 group-hover:text-gray-900" />
              </div>
              <span className="text-sm font-bold tracking-wide">Shop</span>
            </Link>
          </nav>
        </div>
      </header>

      {/* ── Back Navigation ── */}
      <div className="max-w-7xl mx-auto px-4 md:px-6 py-6">
        <button
          onClick={() => navigate("/fighters")}
          className="flex items-center gap-2 px-5 py-2.5 bg-white hover:bg-slate-50 text-slate-700 font-bold rounded-2xl transition-all border border-slate-200 shadow-sm hover:shadow group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform text-[#0A3D91]" />
          <span className="text-sm font-extrabold text-slate-800">Back to Fighters</span>
        </button>
      </div>

      {/* ── Main Detail Content ── */}
      <main className="max-w-7xl mx-auto px-4 md:px-6 pb-20 space-y-10">

        {/* ════════════════════════════════════════════
            1. HERO SECTION — improved
        ════════════════════════════════════════════ */}
        <section className="relative rounded-[2.5rem] overflow-hidden bg-slate-900 border border-slate-800 shadow-2xl">
          {/* Ambient blurred backdrop of the fighter image */}
          <div className="absolute inset-0 z-0">
            <img
              src={fighter.image || exampleFighterBg}
              alt=""
              className="w-full h-full object-cover object-top opacity-30 scale-110 blur-2xl"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/80 to-slate-900/60" />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent" />
            {/* Outline background brand branding text */}
            <div className="absolute right-0 bottom-0 select-none pointer-events-none overflow-hidden translate-y-12 translate-x-20 opacity-5 hidden lg:block">
              <span className="text-[14rem] font-black text-white tracking-widest leading-none select-none uppercase">KHMER</span>
            </div>
          </div>

          <div className="relative z-10 flex flex-col lg:flex-row items-center lg:items-end justify-between gap-10 px-8 md:px-16 py-12 md:py-20">
            
            {/* Left Frame: Image display & verified badges */}
            <div className="relative flex-shrink-0">
              <div className="absolute -inset-2 bg-gradient-to-tr from-amber-500/40 via-blue-500/20 to-transparent rounded-[2.2rem] blur-2xl opacity-75" />
              <div className="relative w-64 h-80 md:w-72 md:h-96 bg-slate-950 rounded-[2rem] overflow-hidden border-4 border-slate-800/80 shadow-2xl">
                <img
                  src={fighter.image || exampleFighterBg}
                  alt={fighter.name}
                  className="w-full h-full object-cover object-top transform hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/60 via-transparent to-transparent" />
                
                {/* Float tags */}
                <div className="absolute top-4 left-4 flex flex-col gap-1.5">
                  {fighter.verified && (
                    <span className="inline-flex items-center gap-1 px-3 py-1 bg-amber-500 text-slate-950 text-[10px] font-black uppercase tracking-wider rounded-lg shadow-lg">
                      <Trophy className="w-3.5 h-3.5 fill-slate-950" /> Certified Champion
                    </span>
                  )}
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-600/90 backdrop-blur-md text-white text-[10px] font-black uppercase tracking-widest rounded-lg">
                    {fighter.type || "Professional"}
                  </span>
                </div>

                <div className="absolute bottom-4 left-4">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-500/95 text-white text-[10px] font-black uppercase tracking-widest rounded-lg shadow-lg">
                    <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping" />
                    Active Ranker
                  </span>
                </div>
              </div>
            </div>

            {/* Middle info block */}
            <div className="flex-1 text-center lg:text-left space-y-6">
              <div className="space-y-3">
                <div className="flex flex-wrap items-center justify-center lg:justify-start gap-2">
                  <span className="px-3.5 py-1.5 bg-slate-800/80 border border-slate-700/60 text-slate-300 text-xs font-black uppercase tracking-wider rounded-xl">
                    Kun Khmer Division
                  </span>
                  <span className="px-3 py-1 bg-white/10 text-white text-xs font-bold rounded-xl flex items-center gap-1">
                    {fighterStats.flagEmoji} {fighterStats.nationality}
                  </span>
                </div>
                <h1 className="text-4xl md:text-6xl font-black text-white leading-tight tracking-tight uppercase">
                  {fighter.name}
                </h1>
                {fighter.alias && (
                  <p className="text-xl md:text-2xl font-bold text-amber-400 italic">
                    &ldquo;{fighter.alias}&rdquo;
                  </p>
                )}
              </div>

              {/* General details grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-xl mx-auto lg:mx-0">
                <div className="bg-slate-900/90 border border-slate-800 p-3.5 rounded-2xl">
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Gym / Affiliation</p>
                  <p className="text-sm font-black text-white truncate mt-1">{fighter.gym}</p>
                </div>
                <div className="bg-slate-900/90 border border-slate-800 p-3.5 rounded-2xl">
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Current Weight</p>
                  <p className="text-sm font-black text-white mt-1">{fighterStats.weight} KG</p>
                </div>
                <div className="bg-slate-900/90 border border-slate-800 p-3.5 rounded-2xl">
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Age Profile</p>
                  <p className="text-sm font-black text-white mt-1">{fighterStats.age} Yrs</p>
                </div>
                <div className="bg-slate-900/90 border border-slate-800 p-3.5 rounded-2xl">
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Stance Style</p>
                  <p className="text-sm font-black text-white mt-1">{fighterStats.stance}</p>
                </div>
              </div>

              {/* Actions */}
              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-3">
                <button
                  onClick={() => setIsFollowed(!isFollowed)}
                  className={`flex items-center gap-2 px-6 py-3.5 rounded-2xl font-black text-sm uppercase tracking-wider transition-all active:scale-95 ${
                    isFollowed
                      ? "bg-slate-800 text-white border border-slate-700 shadow-inner"
                      : "bg-[#0A3D91] hover:bg-blue-800 text-white shadow-lg shadow-blue-900/20"
                  }`}
                >
                  {isFollowed ? <CheckCircle2 className="w-4.5 h-4.5 text-emerald-400" /> : <Users className="w-4.5 h-4.5" />}
                  <span>{isFollowed ? "Following" : "Follow Fighter"}</span>
                </button>
                <button className="flex items-center gap-2 px-6 py-3.5 bg-white/10 hover:bg-white/15 border border-white/10 text-white rounded-2xl font-black text-sm uppercase tracking-wider transition-all active:scale-95">
                  <ShoppingBag className="w-4.5 h-4.5" />
                  <span>Shop Merchandise</span>
                </button>
                <button className="p-3.5 bg-white/5 hover:bg-white/10 border border-white/5 text-white rounded-2xl transition-all active:scale-95">
                  <Share2 className="w-4.5 h-4.5" />
                </button>
              </div>
            </div>

            {/* Scorecard Widget */}
            <div className="w-full lg:w-auto bg-slate-950/80 backdrop-blur border border-slate-800 rounded-3xl p-6 md:p-8 min-w-[260px] text-center lg:text-left">
              <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-4">Official Record</p>
              <div className="flex items-center justify-center lg:justify-start gap-4">
                <div>
                  <p className="text-4xl font-black text-emerald-400 font-mono leading-none">{wins}</p>
                  <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mt-1">Wins</p>
                </div>
                <div className="h-8 w-px bg-slate-800" />
                <div>
                  <p className="text-4xl font-black text-rose-500 font-mono leading-none">{losses}</p>
                  <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mt-1">Losses</p>
                </div>
                <div className="h-8 w-px bg-slate-800" />
                <div>
                  <p className="text-4xl font-black text-amber-500 font-mono leading-none">{draws}</p>
                  <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mt-1">Draws</p>
                </div>
              </div>
              <div className="mt-5 pt-4 border-t border-slate-800/80">
                <div className="flex items-center justify-between text-xs font-bold text-slate-400 mb-1.5">
                  <span>WIN RATIO</span>
                  <span className="text-emerald-400 font-black">{winRate}%</span>
                </div>
                <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full" style={{ width: `${winRate}%` }} />
                </div>
              </div>
            </div>

          </div>
        </section>

        {/* ════════════════════════════════════════════
            2. FIGHT RECORD & CAREER STATISTICS
        ════════════════════════════════════════════ */}
        <section className="bg-white rounded-[2.5rem] border border-slate-200/80 shadow-xl overflow-hidden p-8 md:p-12 space-y-8">
          <div className="flex items-center gap-3">
            <div className="w-1.5 h-8 bg-gradient-to-b from-[#0A3D91] to-blue-500 rounded-full" />
            <div>
              <h2 className="text-2xl md:text-3xl font-black text-slate-800 tracking-tight uppercase">Fight Record &amp; Career Statistics</h2>
              <p className="text-sm text-slate-500 font-medium">Verified competitive achievements and biological data</p>
            </div>
          </div>

          {/* Unified Score Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Wins Breakdown Card */}
            <div className="relative group overflow-hidden rounded-2xl bg-emerald-50/50 border border-emerald-100 p-6 flex flex-col justify-between">
              <div className="flex items-start justify-between">
                <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center text-emerald-700">
                  <Trophy className="w-5 h-5" />
                </div>
                <span className="text-[10px] font-black text-emerald-700 bg-emerald-100/60 border border-emerald-200 px-3 py-1 rounded-full uppercase tracking-wider">WINS</span>
              </div>
              <div className="mt-6">
                <p className="text-5xl font-black text-slate-800 leading-none">{wins}</p>
                <div className="mt-3 flex items-center gap-2">
                  <div className="h-2 bg-emerald-100 rounded-full flex-1 overflow-hidden">
                    <div className="h-full bg-emerald-500 rounded-full" style={{ width: totalFights > 0 ? `${(wins / totalFights) * 100}%` : "0%" }} />
                  </div>
                  <span className="text-xs font-black text-emerald-700">{totalFights > 0 ? Math.round((wins / totalFights) * 100) : 0}%</span>
                </div>
                <p className="text-xs text-slate-500 mt-2 font-medium">Wins out of {totalFights} professional bouts</p>
              </div>
            </div>

            {/* Losses Breakdown Card */}
            <div className="relative group overflow-hidden rounded-2xl bg-rose-50/50 border border-rose-100 p-6 flex flex-col justify-between">
              <div className="flex items-start justify-between">
                <div className="w-10 h-10 bg-rose-100 rounded-xl flex items-center justify-center text-rose-700">
                  <XCircle className="w-5 h-5" />
                </div>
                <span className="text-[10px] font-black text-rose-700 bg-rose-100/60 border border-rose-200 px-3 py-1 rounded-full uppercase tracking-wider">LOSSES</span>
              </div>
              <div className="mt-6">
                <p className="text-5xl font-black text-slate-800 leading-none">{losses}</p>
                <div className="mt-3 flex items-center gap-2">
                  <div className="h-2 bg-rose-100 rounded-full flex-1 overflow-hidden">
                    <div className="h-full bg-rose-500 rounded-full" style={{ width: totalFights > 0 ? `${(losses / totalFights) * 100}%` : "0%" }} />
                  </div>
                  <span className="text-xs font-black text-rose-700">{totalFights > 0 ? Math.round((losses / totalFights) * 100) : 0}%</span>
                </div>
                <p className="text-xs text-slate-500 mt-2 font-medium">Losses out of {totalFights} professional bouts</p>
              </div>
            </div>

            {/* Draws Breakdown Card */}
            <div className="relative group overflow-hidden rounded-2xl bg-amber-50/50 border border-amber-100 p-6 flex flex-col justify-between">
              <div className="flex items-start justify-between">
                <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center text-amber-700">
                  <Minus className="w-5 h-5" />
                </div>
                <span className="text-[10px] font-black text-amber-700 bg-amber-100/60 border border-amber-200 px-3 py-1 rounded-full uppercase tracking-wider">DRAWS</span>
              </div>
              <div className="mt-6">
                <p className="text-5xl font-black text-slate-800 leading-none">{draws}</p>
                <div className="mt-3 flex items-center gap-2">
                  <div className="h-2 bg-amber-100 rounded-full flex-1 overflow-hidden">
                    <div className="h-full bg-amber-500 rounded-full" style={{ width: totalFights > 0 ? `${(draws / totalFights) * 100}%` : "0%" }} />
                  </div>
                  <span className="text-xs font-black text-amber-700">{totalFights > 0 ? Math.round((draws / totalFights) * 100) : 0}%</span>
                </div>
                <p className="text-xs text-slate-500 mt-2 font-medium">Draws out of {totalFights} professional bouts</p>
              </div>
            </div>

          </div>

          {/* Physical attributes cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: "Physical Age", value: fighterStats.age, unit: "Years Old", icon: Calendar, color: "blue" },
              { label: "Stature Height", value: fighterStats.height, unit: "Centimeters", icon: Ruler, color: "purple" },
              { label: "Arm Reach", value: fighterStats.reach, unit: "Centimeters", icon: Target, color: "orange" },
              { label: "KO Victory Count", value: koWins, unit: "Finishes", icon: Flame, color: "red" },
            ].map(({ label, value, unit, icon: Icon, color }) => (
              <div key={label} className="bg-slate-50 border border-slate-100 rounded-2xl p-5 hover:shadow transition-all">
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center mb-3 ${
                  color === 'blue' ? 'bg-blue-100 text-blue-700' :
                  color === 'purple' ? 'bg-purple-100 text-purple-700' :
                  color === 'orange' ? 'bg-orange-100 text-orange-700' :
                  'bg-red-100 text-red-700'
                }`}>
                  <Icon className="w-5 h-5" />
                </div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider">{label}</p>
                <p className="text-2xl font-black text-slate-800 mt-0.5">{value}</p>
                <p className="text-xs text-slate-500 mt-1 font-semibold">{unit}</p>
              </div>
            ))}
          </div>

          {/* Career statistics table */}
          <div className="bg-slate-50 rounded-3xl border border-slate-200/60 p-6 md:p-8">
            <div className="flex items-center gap-2 mb-6">
              <Award className="w-5 h-5 text-[#0A3D91]" />
              <h3 className="text-base font-black text-slate-800 uppercase tracking-tight">Performance Statistics</h3>
            </div>

            <div className="space-y-6">
              {/* Win Rate */}
              <div>
                <div className="flex justify-between text-xs font-bold text-slate-600 mb-2">
                  <span>Career Win Ratio</span>
                  <span className="font-black text-slate-900">{winRate}%</span>
                </div>
                <div className="h-3 bg-slate-200 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full transition-all duration-700" style={{ width: `${winRate}%` }} />
                </div>
              </div>

              {/* KO Rate */}
              <div>
                <div className="flex justify-between text-xs font-bold text-slate-600 mb-2">
                  <span>Knockout Ratio (per win)</span>
                  <span className="font-black text-slate-900">{koRate}%</span>
                </div>
                <div className="h-3 bg-slate-200 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-orange-500 to-red-500 rounded-full transition-all duration-700" style={{ width: `${koRate}%` }} />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4 border-t border-slate-200/80 mt-6 pt-6 text-center">
              <div>
                <p className="text-xs font-black text-slate-400 uppercase tracking-wider">Career Bouts</p>
                <p className="text-xl font-black text-slate-800 mt-0.5">{totalFights}</p>
              </div>
              <div className="border-x border-slate-200">
                <p className="text-xs font-black text-slate-400 uppercase tracking-wider">Style</p>
                <p className="text-xl font-black text-[#0A3D91] mt-0.5 truncate uppercase">
                  {fighter.style ? fighter.style.split(',')[0].trim() : 'Striker'}
                </p>
              </div>
              <div>
                <p className="text-xs font-black text-slate-400 uppercase tracking-wider">Stance</p>
                <p className="text-xl font-black text-slate-800 mt-0.5">{fighterStats.stance}</p>
              </div>
            </div>
          </div>
        </section>

        {/* ════════════════════════════════════════════
            3. FIGHTER VIDEOS SECTION
        ════════════════════════════════════════════ */}
        <section className="bg-white rounded-[2.5rem] border border-slate-200/80 shadow-xl overflow-hidden p-8 md:p-12 space-y-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-1.5 h-8 bg-gradient-to-b from-red-500 to-rose-500 rounded-full" />
              <div>
                <h2 className="text-2xl md:text-3xl font-black text-slate-800 tracking-tight uppercase">Fighter Videos &amp; Highlights</h2>
                <p className="text-sm text-slate-500 font-medium">Watch exclusive bouts, training camps, and interview clips</p>
              </div>
            </div>
            <Link to="/news-events?tab=media" className="flex items-center gap-1 text-sm font-black text-[#0A3D91] hover:underline">
              <span>View Library</span>
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {fighterVideos.map((video) => (
              <button
                key={video.id}
                onClick={() => setSelectedVideo(video)}
                className="group relative flex flex-col md:flex-row bg-slate-50 hover:bg-slate-100/80 border border-slate-200/60 rounded-2xl overflow-hidden text-left transition-all duration-300 hover:shadow-lg"
              >
                {/* Image panel */}
                <div className="relative w-full md:w-48 h-36 bg-slate-950 flex-shrink-0 overflow-hidden">
                  <img
                    src={video.thumbnail}
                    alt={video.title}
                    className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-slate-950/30 group-hover:bg-slate-950/10 transition-colors" />
                  
                  {/* Play badge overlay */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-10 h-10 rounded-full bg-white/95 border border-white/20 flex items-center justify-center shadow-lg group-hover:scale-110 group-hover:bg-red-500 transition-all duration-200">
                      <Play className="w-4 h-4 text-slate-900 group-hover:text-white ml-0.5" fill="currentColor" />
                    </div>
                  </div>

                  <div className="absolute bottom-2 right-2 bg-slate-950/70 text-white text-[9px] font-black tracking-wider px-2 py-0.5 rounded uppercase">
                    HD Video
                  </div>
                </div>

                {/* Video Info panel */}
                <div className="p-5 flex flex-col justify-between flex-1 min-w-0">
                  <div>
                    <h3 className="text-sm font-extrabold text-slate-800 leading-snug line-clamp-2 group-hover:text-[#0A3D91] transition-colors">
                      {video.title}
                    </h3>
                    <p className="text-xs text-slate-500 font-medium mt-1">Exclusive media coverage</p>
                  </div>
                  <div className="flex items-center gap-1.5 text-[11px] text-slate-400 font-bold mt-4">
                    <Clock className="w-3.5 h-3.5" />
                    <span>Uploaded {video.date}</span>
                  </div>
                </div>
              </button>
            ))}
            {fighterVideos.length === 0 && (
              <div className="col-span-full text-center py-12 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200">
                <Play className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                <p className="text-slate-500 text-sm font-semibold">No video highlights available for this fighter</p>
              </div>
            )}
          </div>
        </section>

        {/* ════════════════════════════════════════════
            4. RELATED FIGHTERS SECTION
        ════════════════════════════════════════════ */}
        {taggedRelated.length > 0 && (
          <section className="bg-white rounded-[2.5rem] border border-slate-200/80 shadow-xl overflow-hidden p-8 md:p-12 space-y-8">
            <div className="flex items-center gap-3">
              <div className="w-1.5 h-8 bg-gradient-to-b from-blue-600 to-indigo-600 rounded-full" />
              <div>
                <h2 className="text-2xl md:text-3xl font-black text-slate-800 tracking-tight uppercase">Related Competitors</h2>
                <p className="text-sm text-slate-500 font-medium">Fighters from the same club or former opponents in the same weight division</p>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {taggedRelated.map((rel) => (
                <Link
                  key={rel.id}
                  to={`/fighters/${rel.id}`}
                  className="group flex flex-col bg-slate-50 hover:bg-white rounded-2xl overflow-hidden border border-slate-200/60 hover:border-[#0A3D91]/30 hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
                >
                  {/* Image Frame */}
                  <div className="relative aspect-[3/4] overflow-hidden bg-slate-900">
                    <img
                      src={rel.image || exampleFighterBg}
                      alt={rel.name}
                      className="w-full h-full object-cover object-top transform group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent" />

                    {/* Relation Badge */}
                    <div className="absolute top-3 left-3">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-1 text-[9px] font-black uppercase tracking-wider rounded-lg shadow-md ${
                        rel.relationTag === "Same Club"
                          ? "bg-[#0A3D91] text-white"
                          : "bg-[#C8102E] text-white"
                      }`}>
                        {rel.relationTag === "Same Club" ? (
                          <Building2 className="w-3 h-3" />
                        ) : (
                          <Zap className="w-3 h-3" />
                        )}
                        {rel.relationTag}
                      </span>
                    </div>

                    {rel.verified && (
                      <div className="absolute top-3 right-3 w-7 h-7 bg-amber-500 rounded-lg flex items-center justify-center shadow-lg">
                        <Trophy className="w-4 h-4 text-slate-950" />
                      </div>
                    )}
                  </div>

                  {/* Info Block */}
                  <div className="p-4 flex-1 flex flex-col justify-between">
                    <div>
                      <h3 className="text-sm font-black text-slate-800 line-clamp-1 group-hover:text-[#0A3D91] transition-colors leading-tight">
                        {rel.name}
                      </h3>
                      <p className="text-xs text-slate-500 font-semibold mt-1 truncate">
                        {rel.gym}
                      </p>
                    </div>

                    <div className="flex items-center gap-2 mt-4 pt-3 border-t border-slate-100">
                      <span className="flex-1 text-center py-1 bg-slate-100 text-slate-700 text-[11px] font-extrabold rounded-md border border-slate-200/50">
                        {rel.record}
                      </span>
                      <span className="px-2.5 py-1 bg-blue-50 text-[#0A3D91] text-[11px] font-extrabold rounded-md border border-blue-100">
                        {rel.weight}kg
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}

      </main>

      {/* ── Video Modal ── */}
      {selectedVideo && (
        <div
          className="fixed inset-0 bg-slate-950/95 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-fadeIn"
          onClick={() => setSelectedVideo(null)}
        >
          <div className="relative w-full max-w-5xl" onClick={e => e.stopPropagation()}>
            <button
              onClick={() => setSelectedVideo(null)}
              className="absolute -top-12 right-0 flex items-center gap-1.5 px-4 py-2 bg-white/10 hover:bg-white/20 text-white text-xs font-black uppercase tracking-wider rounded-xl transition-all group"
            >
              <span>Close Player</span>
              <X className="w-4 h-4 group-hover:rotate-90 transition-transform" />
            </button>
            <div className="aspect-video bg-black rounded-3xl overflow-hidden shadow-2xl ring-1 ring-white/10">
              <iframe
                className="w-full h-full"
                src={`https://www.youtube.com/embed/${selectedVideo.youtubeId}?autoplay=1`}
                title={selectedVideo.title}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
            <div className="mt-4 px-1">
              <h3 className="text-lg font-black text-white">{selectedVideo.title}</h3>
              <p className="text-sm text-slate-400 mt-1">{selectedVideo.date}</p>
            </div>
          </div>
        </div>
      )}

      {/* ── Footer ── */}
      <footer className="relative bg-[#051C42] text-white overflow-hidden">
        {/* Layered Background Glows */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/15 to-transparent" />
          <div className="absolute -top-32 -left-32 w-[500px] h-[500px] rounded-full opacity-[0.12]" style={{ background: 'radial-gradient(circle, #0A3D91 0%, transparent 65%)' }} />
          <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full opacity-[0.08]" style={{ background: 'radial-gradient(circle, #C8102E 0%, transparent 70%)' }} />
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[900px] h-64 opacity-[0.06]" style={{ background: 'radial-gradient(ellipse, #1565C0 0%, transparent 70%)' }} />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-6 md:px-8">

          {/* Top section — Brand + Nav Grid */}
          <div className="pt-16 pb-12 grid grid-cols-1 md:grid-cols-12 gap-10 lg:gap-14">

            {/* Brand Column — spans 4 cols */}
            <div className="md:col-span-4">
              {/* Logo + Name */}
              <div className="flex items-center gap-3 mb-5">
                <div className="flex items-center justify-center w-12 h-12 bg-white rounded-xl shadow-lg shadow-black/40 shrink-0">
                  <img src={kkfLogo} alt="KKF Logo" className="w-9 h-9 object-contain" />
                </div>
                <div>
                  <div className="text-xl font-black tracking-tight leading-none">KUNKHMER</div>
                  <div className="text-[10px] text-[#F2C94C] font-bold tracking-[0.15em] uppercase mt-0.5">Official Digital Platform</div>
                </div>
              </div>

              {/* Tagline */}
              <p className="text-white/50 text-sm leading-relaxed mb-6 max-w-xs">
                The official home of Cambodian martial arts — connecting fighters, fans, and the global Kun Khmer community.
              </p>

              {/* Social Icons */}
              <div className="flex gap-2.5">
                {[
                  { label: 'Facebook', path: 'M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z' },
                  { label: 'Instagram', path: 'M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z' },
                  { label: 'Twitter/X', path: 'M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.74l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z' },
                  { label: 'YouTube', path: 'M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z' },
                ].map((social) => (
                  <a
                    key={social.label}
                    href="#"
                    aria-label={social.label}
                    className="group w-9 h-9 rounded-xl bg-white/5 border border-white/8 hover:bg-[#0A3D91]/60 hover:border-[#0A3D91] flex items-center justify-center transition-all duration-200 hover:scale-110"
                  >
                    <svg className="w-3.5 h-3.5 text-white/50 group-hover:text-white transition-colors" fill="currentColor" viewBox="0 0 24 24">
                      <path d={social.path} />
                    </svg>
                  </a>
                ))}
              </div>
            </div>

            {/* Nav Columns — span 8 cols, split into 4 equal sub-cols */}
            <div className="md:col-span-8 grid grid-cols-2 sm:grid-cols-4 gap-8">

              {/* Platform */}
              <div>
                <h4 className="text-[11px] font-extrabold text-[#F2C94C] tracking-[0.15em] uppercase mb-4">Platform</h4>
                <ul className="space-y-2.5">
                  {[
                    { label: 'Home', to: '/' },
                    { label: 'Matches & Events', to: '/matches' },
                    { label: 'News & Media', to: '/news-events' },
                    { label: 'Fighters', to: '/fighters' },
                    { label: 'Partners', to: '/strategic-partners' },
                  ].map(({ label, to }) => (
                    <li key={label}>
                      <Link to={to} className="text-white/45 hover:text-white text-xs font-medium transition-colors duration-150 leading-snug">
                        {label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Shop */}
              <div>
                <h4 className="text-[11px] font-extrabold text-[#F2C94C] tracking-[0.15em] uppercase mb-4">Shop</h4>
                <ul className="space-y-2.5">
                  {[
                    { label: 'All Products', to: '/shop' },
                    { label: 'My Cart', to: '/cart' },
                    { label: 'My Orders', to: '/orders' },
                  ].map(({ label, to }) => (
                    <li key={label}>
                      <Link to={to} className="text-white/45 hover:text-white text-xs font-medium transition-colors duration-150 leading-snug">
                        {label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Account */}
              <div>
                <h4 className="text-[11px] font-extrabold text-[#F2C94C] tracking-[0.15em] uppercase mb-4">Account</h4>
                <ul className="space-y-2.5">
                  {[
                    { label: 'My Profile', to: '/profile' },
                    { label: 'Subscription', to: '/subscription' },
                    { label: 'Admin Platform', to: '/home' },
                  ].map(({ label, to }) => (
                    <li key={label}>
                      <Link to={to} className="text-white/45 hover:text-white text-xs font-medium transition-colors duration-150 leading-snug">
                        {label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Contact */}
              <div>
                <h4 className="text-[11px] font-extrabold text-[#F2C94C] tracking-[0.15em] uppercase mb-4">Contact</h4>
                <ul className="space-y-2.5">
                  <li className="flex items-start gap-2">
                    <MapPin className="w-3.5 h-3.5 text-white/30 shrink-0 mt-0.5" />
                    <span className="text-white/45 text-xs leading-snug">Phnom Penh, Cambodia</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <svg className="w-3.5 h-3.5 text-white/30 shrink-0 mt-0.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
                    </svg>
                    <span className="text-white/45 text-xs leading-snug">info@kunkhmer.com</span>
                  </li>
                  <li className="mt-3">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-bold">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                      Platform Online
                    </span>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* Newsletter Strip */}
          <div className="py-7 px-8 mb-10 rounded-2xl bg-gradient-to-r from-[#0A3D91]/40 via-[#0B4AAD]/30 to-[#0A3D91]/40 border border-white/[0.07] flex flex-col sm:flex-row items-center justify-between gap-5">
            <div>
              <p className="font-bold text-sm text-white">Stay updated with Kun Khmer</p>
              <p className="text-white/40 text-xs mt-0.5">Get match results, fighter news & event announcements.</p>
            </div>
            <div className="flex gap-2 w-full sm:w-auto">
              <input
                type="email"
                placeholder="Your email address"
                className="flex-1 sm:w-64 px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-sm text-white placeholder:text-white/25 focus:outline-none focus:border-[#0A3D91] transition-colors"
              />
              <button className="px-5 py-2.5 rounded-xl bg-[#0A3D91] hover:bg-blue-700 text-white text-sm font-bold transition-colors whitespace-nowrap">
                Subscribe
              </button>
            </div>
          </div>

          {/* Divider */}
          <div className="h-px bg-gradient-to-r from-transparent via-white/8 to-transparent" />

          {/* Bottom Bar */}
          <div className="py-6 flex flex-col sm:flex-row items-center justify-between gap-4">
            {/* Copyright + Flag */}
            <div className="flex items-center gap-3">
              <span className="text-2xl" role="img" aria-label="Cambodia flag">🇰🇭</span>
              <div>
                <p className="text-white/35 text-xs font-medium">© 2026 KUNKHMER Federation. All rights reserved.</p>
                <p className="text-white/20 text-[10px] mt-0.5">Preserving & promoting Cambodian martial arts heritage.</p>
              </div>
            </div>

            {/* Legal Links */}
            <div className="flex items-center gap-1 flex-wrap justify-center">
              {['Privacy Policy', 'Terms of Service', 'Cookie Policy'].map((item, i, arr) => (
                <span key={item} className="flex items-center gap-1">
                  <button className="text-white/30 hover:text-white/70 text-[11px] font-medium transition-colors px-1">
                    {item}
                  </button>
                  {i < arr.length - 1 && <span className="text-white/15 text-xs">·</span>}
                </span>
              ))}
            </div>
          </div>

        </div>
      </footer>
    </div>
  );
}
