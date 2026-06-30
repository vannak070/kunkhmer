import { useParams, Link, useNavigate } from "react-router";
import { ArrowLeft, Calendar, MapPin, Target, Weight, Ruler, Trophy, XCircle, Minus, Flame, TrendingUp, Users, Award, Clock, Heart, Share2, ShoppingBag, Bell, ShoppingCart, User, Menu, Home as HomeIcon, BookOpen, Handshake, Building2, Play, X } from "lucide-react";
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

  // Scroll detection for header
  const [showHeader, setShowHeader] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [isScrolled, setIsScrolled] = useState(false);

  // Scroll detection for header visibility
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;

      // Track if page is scrolled for background change
      setIsScrolled(currentScrollY > 20);

      // Always show header at the top of page
      if (currentScrollY < 10) {
        setShowHeader(true);
      }
      // Hide header when scrolling down
      else if (currentScrollY > lastScrollY && currentScrollY > 100) {
        setShowHeader(false);
      }
      // Show header when scrolling up
      else if (currentScrollY < lastScrollY) {
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
      } catch (err) {
        console.error("Failed to load fighter details:", err);
      } finally {
        setLoading(false);
      }
    };
    if (id) {
      fetchFighter();
    }
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#0A3D91]"></div>
      </div>
    );
  }

  if (!fighter) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h2 className="text-2xl font-black text-gray-900 mb-4">Fighter Not Found</h2>
          <Link to="/fighters" className="text-[#0A3D91] font-bold hover:underline">
            Back to Fighters
          </Link>
        </div>
      </div>
    );
  }

  // Parse record (e.g., "80-10-2")
  const recordParts = fighter.record.split('-').map(n => parseInt(n) || 0);
  const wins = recordParts[0] || 0;
  const losses = recordParts[1] || 0;
  const draws = recordParts[2] || 0;
  
  // Get fighter matches to calculate KOs
  const fighterMatches = MOCK_MATCHES.filter(m => 
    (m.fighterA.id === fighter.id || m.fighterB.id === fighter.id) && 
    m.status === 'Completed'
  );
  const koWins = Math.floor(wins * 0.15); // Mock: 15% of wins are KOs

  // Deterministic age calculation based on DOB or character sum
  let detailAge = 22;
  const detailDob = fighter.dateOfBirth || fighter.date_of_birth;
  if (detailDob) {
    const birthYear = new Date(detailDob).getFullYear();
    const currentYear = new Date().getFullYear();
    if (birthYear) {
      detailAge = currentYear - birthYear;
    }
  } else {
    const charSum = (fighter.id || "").split("").reduce((acc: number, char: string) => acc + char.charCodeAt(0), 0);
    detailAge = 20 + (charSum % 15);
  }

  // Mock data for detailed stats
  const fighterStats = {
    age: detailAge,
    height: fighter.height || 170, // cm
    weight: fighter.weight,
    reach: 175, // cm
    stance: "Orthodox",
    nationality: fighter.nationality || "Cambodian",
    flagEmoji: fighter.nationality !== 'Cambodian' ? "🌐" : "🇰🇭",
  };

  // Get related fighters based on weight class and club
  const relatedFighters = MOCK_FIGHTERS.filter(f => {
    if (f.id === fighter.id) return false;
    // Same weight class (within 5kg range) or same club
    const sameWeightClass = Math.abs(parseInt(f.weight) - parseInt(fighter.weight)) <= 5;
    const sameClub = f.gym === fighter.gym;
    return sameWeightClass || sameClub;
  }).slice(0, 4);

  // Get fighter-related videos (mock: first 4 videos)
  const fighterVideos = MEDIA_CONTENT.slice(0, 4);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-gray-50">
      {/* Modern Header - Sticky */}
      <header className={`sticky top-0 z-50 backdrop-blur-xl border-b shadow-sm transition-all duration-300 ${
        showHeader ? 'translate-y-0' : '-translate-y-full'
      } ${
        isScrolled ? 'bg-white border-gray-200' : 'bg-white/80 border-gray-200/50'
      }`}>
        <div className="max-w-7xl mx-auto px-4 md:px-6">
          {/* Top Bar */}
          <div className="flex items-center justify-between py-4 gap-4">
            {/* Logo */}
            <Link to="/" className="group flex items-center gap-3 flex-shrink-0">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-br from-[#0A3D91]/20 to-blue-500/20 rounded-2xl blur-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <img
                  src={kkfLogo}
                  alt="KKF Logo"
                  className="relative w-14 h-14 md:w-16 md:h-16 object-contain group-hover:scale-105 transition-transform duration-300"
                />
              </div>
              <div className="hidden sm:block">
                <h1 className="text-xl md:text-2xl font-black text-gray-900 leading-tight tracking-tight">KUNKHMER</h1>
                <p className="text-xs md:text-sm text-gray-500 font-medium leading-tight">Official Platform</p>
              </div>
            </Link>

            {/* Right Actions */}
            <div className="flex items-center gap-1.5 md:gap-2 flex-shrink-0">
              <button className="relative p-2.5 md:p-3 hover:bg-gray-100 rounded-xl transition-all group">
                <Bell className="w-5 h-5 text-gray-600 group-hover:text-[#0A3D91] transition-colors" />
                <span className="absolute top-2 right-2 w-2 h-2 bg-[#C8102E] rounded-full ring-2 ring-white animate-pulse" />
              </button>

              <button className="relative p-2.5 md:p-3 hover:bg-gray-100 rounded-xl transition-all group">
                <ShoppingCart className="w-5 h-5 text-gray-600 group-hover:text-[#0A3D91] transition-colors" />
              </button>

              <button
                onClick={() => navigate("/profile")}
                className="p-2.5 md:p-3 hover:bg-gray-100 rounded-xl transition-all group"
              >
                <User className="w-5 h-5 text-gray-600 group-hover:text-[#0A3D91] transition-colors" />
              </button>
            </div>
          </div>

          {/* Bottom Navigation */}
          <nav className="hidden md:flex items-center gap-2 pb-4 border-t border-gray-100/80 pt-4 overflow-x-auto">
            <Link
              to="/"
              className="group flex items-center gap-2.5 px-5 py-3 rounded-2xl whitespace-nowrap font-semibold text-sm transition-all duration-300 text-gray-600 hover:bg-gray-100 hover:text-gray-900"
            >
              <div className="flex items-center justify-center w-8 h-8 rounded-xl bg-gray-100 group-hover:bg-gray-200 transition-all">
                <HomeIcon className="w-4 h-4 text-gray-600 group-hover:text-gray-900" />
              </div>
              <span className="text-sm font-bold tracking-wide">Home</span>
            </Link>
            <Link
              to="/matches"
              className="group flex items-center gap-2.5 px-5 py-3 rounded-2xl whitespace-nowrap font-semibold text-sm transition-all duration-300 text-gray-600 hover:bg-gray-100 hover:text-gray-900"
            >
              <div className="flex items-center justify-center w-8 h-8 rounded-xl bg-gray-100 group-hover:bg-gray-200 transition-all">
                <Trophy className="w-4 h-4 text-gray-600 group-hover:text-gray-900" />
              </div>
              <span className="text-sm font-bold tracking-wide">Matches & Events</span>
            </Link>
            <Link
              to="/news-events"
              className="group flex items-center gap-2.5 px-5 py-3 rounded-2xl whitespace-nowrap font-semibold text-sm transition-all duration-300 text-gray-600 hover:bg-gray-100 hover:text-gray-900"
            >
              <div className="flex items-center justify-center w-8 h-8 rounded-xl bg-gray-100 group-hover:bg-gray-200 transition-all">
                <BookOpen className="w-4 h-4 text-gray-600 group-hover:text-gray-900" />
              </div>
              <span className="text-sm font-bold tracking-wide">News & Media</span>
            </Link>
            <Link
              to="/fighters"
              className="group relative flex items-center gap-2.5 px-5 py-3 rounded-2xl whitespace-nowrap font-semibold text-sm transition-all duration-300 bg-gradient-to-r from-[#0A3D91] to-blue-600 text-white shadow-lg scale-105"
            >
              <div className="flex items-center justify-center w-8 h-8 rounded-xl bg-white/20 transition-all">
                <Users className="w-4 h-4 text-white" />
              </div>
              <span className="text-sm font-bold tracking-wide">Fighters</span>
              <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-12 h-1 bg-white/40 rounded-full"></div>
            </Link>
            <Link
              to="/strategic-partners"
              className="group flex items-center gap-2.5 px-5 py-3 rounded-2xl whitespace-nowrap font-semibold text-sm transition-all duration-300 text-gray-600 hover:bg-gray-100 hover:text-gray-900"
            >
              <div className="flex items-center justify-center w-8 h-8 rounded-xl bg-gray-100 group-hover:bg-gray-200 transition-all">
                <Handshake className="w-4 h-4 text-gray-600 group-hover:text-gray-900" />
              </div>
              <span className="text-sm font-bold tracking-wide">Strategic Partners</span>
            </Link>
            <Link
              to="/shop"
              className="group flex items-center gap-2.5 px-5 py-3 rounded-2xl whitespace-nowrap font-semibold text-sm transition-all duration-300 text-gray-600 hover:bg-gray-100 hover:text-gray-900"
            >
              <div className="flex items-center justify-center w-8 h-8 rounded-xl bg-gray-100 group-hover:bg-gray-200 transition-all">
                <ShoppingCart className="w-4 h-4 text-gray-600 group-hover:text-gray-900" />
              </div>
              <span className="text-sm font-bold tracking-wide">Shop</span>
            </Link>
          </nav>
        </div>
      </header>

      {/* Breadcrumb & Back Button */}
      <div className="max-w-7xl mx-auto px-4 md:px-6 py-6">
        <div className="flex items-center justify-between">
          <button
            onClick={() => navigate("/fighters")}
            className="flex items-center gap-2 px-5 py-2.5 bg-white/80 backdrop-blur-sm hover:bg-white rounded-full text-gray-700 font-semibold transition-all border border-gray-200/50 hover:border-[#0A3D91] group"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            <span className="text-sm">Back to Fighters</span>
          </button>

        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 md:px-6 pb-12">
        <div className="space-y-8">
          {/* Hero Section */}
          <div className="relative bg-white/80 backdrop-blur-sm rounded-3xl overflow-hidden border border-gray-200/50">
            {/* Hero Banner */}
            <div className="relative bg-gradient-to-br from-[#0A3D91] via-blue-600 to-indigo-700 px-6 md:px-12 py-16 md:py-20 overflow-hidden">
              {/* Decorative Elements */}
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-white/10 via-transparent to-transparent"></div>
              <div className="absolute -top-24 -right-24 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl"></div>
              <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-indigo-500/20 rounded-full blur-3xl"></div>

              <div className="relative z-10 flex flex-col md:flex-row items-center md:items-start gap-12">
                {/* Fighter Image */}
                <div className="relative flex-shrink-0 group">
                  <div className="absolute inset-0 bg-gradient-to-br from-yellow-400/30 to-red-500/30 rounded-3xl blur-2xl group-hover:blur-3xl transition-all duration-500"></div>
                  <div className="relative w-56 h-56 md:w-64 md:h-64 rounded-3xl overflow-hidden ring-4 ring-white/20 ring-offset-4 ring-offset-transparent">
                    <img
                      src={fighter.image || exampleFighterBg}
                      alt={fighter.name}
                      className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent"></div>
                  </div>
                  {fighter.verified && (
                    <div className="absolute -bottom-4 -right-4 w-14 h-14 bg-gradient-to-br from-amber-400 via-yellow-500 to-orange-500 rounded-2xl flex items-center justify-center ring-4 ring-white/30 shadow-2xl animate-pulse">
                      <Trophy className="w-7 h-7 text-white drop-shadow-lg" />
                    </div>
                  )}
                </div>

                {/* Fighter Info */}
                <div className="flex-1 text-center md:text-left space-y-6">
                  <div className="space-y-3">
                    <h1 className="text-5xl md:text-6xl lg:text-7xl font-black text-white leading-none tracking-tight drop-shadow-lg">
                      {fighter.name}
                    </h1>
                    {fighter.alias && (
                      <p className="text-2xl md:text-3xl font-bold text-amber-300 italic tracking-wide">
                        "{fighter.alias}"
                      </p>
                    )}
                  </div>

                  <div className="flex flex-wrap items-center justify-center md:justify-start gap-3">
                    <div className="flex items-center gap-2.5 px-5 py-3 bg-white/15 backdrop-blur-md rounded-2xl border border-white/20 hover:bg-white/25 transition-all">
                      <MapPin className="w-5 h-5 text-white/90" />
                      <span className="text-sm font-semibold text-white">{fighter.gym}</span>
                    </div>
                    <div className="flex items-center gap-2.5 px-5 py-3 bg-white/15 backdrop-blur-md rounded-2xl border border-white/20 hover:bg-white/25 transition-all">
                      <span className="text-2xl">{fighterStats.flagEmoji}</span>
                      <span className="text-sm font-semibold text-white">{fighterStats.nationality}</span>
                    </div>
                    <div className="flex items-center gap-2.5 px-5 py-3 bg-white/15 backdrop-blur-md rounded-2xl border border-white/20 hover:bg-white/25 transition-all">
                      <Weight className="w-5 h-5 text-white/90" />
                      <span className="text-sm font-semibold text-white">{fighterStats.weight} KG</span>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-wrap gap-4 justify-center md:justify-start pt-2">
                    <button className="flex items-center gap-2.5 px-8 py-3.5 bg-gradient-to-r from-[#0A3D91] to-blue-700 hover:from-blue-800 hover:to-blue-900 text-white rounded-2xl font-bold transition-all hover:scale-105 shadow-xl hover:shadow-2xl">
                      <ShoppingBag className="w-5 h-5" />
                      <span>Shop Merch</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Stats Section */}
            <div className="p-8 md:p-12 bg-gradient-to-br from-gray-50/50 via-white to-gray-50/50">

              {/* Fighter Record Title */}
              <div className="mb-10">
                <h2 className="text-3xl md:text-4xl font-black text-gray-900 mb-2 tracking-tight">Fight Record</h2>
                <div className="flex items-center gap-2">
                  <div className="w-12 h-1 bg-gradient-to-r from-[#0A3D91] to-blue-400 rounded-full"></div>
                  <p className="text-sm text-gray-500 font-medium">Career statistics and performance</p>
                </div>
              </div>

              {/* Record Stats */}
              <div className="grid grid-cols-3 gap-4 md:gap-6 mb-10">
                {/* Wins */}
                <div className="relative group bg-gradient-to-br from-emerald-500 via-green-500 to-teal-500 rounded-2xl p-6 md:p-8 overflow-hidden hover:scale-105 transition-transform duration-300">
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-white/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  <div className="relative z-10">
                    <div className="flex items-center gap-2 mb-4">
                      <div className="w-11 h-11 bg-white/25 backdrop-blur-sm rounded-xl flex items-center justify-center ring-2 ring-white/40">
                        <Trophy className="w-6 h-6 text-white" />
                      </div>
                      <span className="text-xs font-bold text-white/80 uppercase tracking-widest">Wins</span>
                    </div>
                    <p className="text-6xl md:text-7xl font-black text-white leading-none mb-1">{wins}</p>
                    <div className="w-16 h-1 bg-white/40 rounded-full"></div>
                  </div>
                </div>

                {/* Losses */}
                <div className="relative group bg-gradient-to-br from-rose-500 via-red-500 to-pink-500 rounded-2xl p-6 md:p-8 overflow-hidden hover:scale-105 transition-transform duration-300">
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-white/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  <div className="relative z-10">
                    <div className="flex items-center gap-2 mb-4">
                      <div className="w-11 h-11 bg-white/25 backdrop-blur-sm rounded-xl flex items-center justify-center ring-2 ring-white/40">
                        <XCircle className="w-6 h-6 text-white" />
                      </div>
                      <span className="text-xs font-bold text-white/80 uppercase tracking-widest">Losses</span>
                    </div>
                    <p className="text-6xl md:text-7xl font-black text-white leading-none mb-1">{losses}</p>
                    <div className="w-16 h-1 bg-white/40 rounded-full"></div>
                  </div>
                </div>

                {/* Draws */}
                <div className="relative group bg-gradient-to-br from-amber-500 via-yellow-500 to-orange-500 rounded-2xl p-6 md:p-8 overflow-hidden hover:scale-105 transition-transform duration-300">
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-white/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  <div className="relative z-10">
                    <div className="flex items-center gap-2 mb-4">
                      <div className="w-11 h-11 bg-white/25 backdrop-blur-sm rounded-xl flex items-center justify-center ring-2 ring-white/40">
                        <Minus className="w-6 h-6 text-white" />
                      </div>
                      <span className="text-xs font-bold text-white/80 uppercase tracking-widest">Draws</span>
                    </div>
                    <p className="text-6xl md:text-7xl font-black text-white leading-none mb-1">{draws}</p>
                    <div className="w-16 h-1 bg-white/40 rounded-full"></div>
                  </div>
                </div>
              </div>

              {/* Additional Stats Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-5">
                {/* Age */}
                <div className="group relative bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-gray-200/50 hover:border-blue-300 hover:shadow-lg transition-all duration-300">
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-50/50 to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  <div className="relative">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-blue-200 rounded-xl flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                      <Calendar className="w-5 h-5 text-blue-600" />
                    </div>
                    <span className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-2">Age</span>
                    <p className="text-4xl font-black text-gray-900 leading-none mb-1">{fighterStats.age}</p>
                    <p className="text-xs text-gray-500 font-medium">Years Old</p>
                  </div>
                </div>

                {/* Height */}
                <div className="group relative bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-gray-200/50 hover:border-purple-300 hover:shadow-lg transition-all duration-300">
                  <div className="absolute inset-0 bg-gradient-to-br from-purple-50/50 to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  <div className="relative">
                    <div className="w-12 h-12 bg-gradient-to-br from-purple-100 to-purple-200 rounded-xl flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                      <Ruler className="w-5 h-5 text-purple-600" />
                    </div>
                    <span className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-2">Height</span>
                    <p className="text-4xl font-black text-gray-900 leading-none mb-1">{fighterStats.height}</p>
                    <p className="text-xs text-gray-500 font-medium">Centimeters</p>
                  </div>
                </div>

                {/* Reach */}
                <div className="group relative bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-gray-200/50 hover:border-orange-300 hover:shadow-lg transition-all duration-300">
                  <div className="absolute inset-0 bg-gradient-to-br from-orange-50/50 to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  <div className="relative">
                    <div className="w-12 h-12 bg-gradient-to-br from-orange-100 to-orange-200 rounded-xl flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                      <Target className="w-5 h-5 text-orange-600" />
                    </div>
                    <span className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-2">Reach</span>
                    <p className="text-4xl font-black text-gray-900 leading-none mb-1">{fighterStats.reach}</p>
                    <p className="text-xs text-gray-500 font-medium">Centimeters</p>
                  </div>
                </div>

                {/* KO Wins */}
                <div className="group relative bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-gray-200/50 hover:border-red-300 hover:shadow-lg transition-all duration-300">
                  <div className="absolute inset-0 bg-gradient-to-br from-red-50/50 to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  <div className="relative">
                    <div className="w-12 h-12 bg-gradient-to-br from-red-100 to-red-200 rounded-xl flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                      <Flame className="w-5 h-5 text-red-600" />
                    </div>
                    <span className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-2">KO Wins</span>
                    <p className="text-4xl font-black text-gray-900 leading-none mb-1">{koWins}</p>
                    <p className="text-xs text-gray-500 font-medium">Knockouts</p>
                  </div>
                </div>
              </div>

              {/* Fighter Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mt-8">
                <div className="group relative bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl p-8 overflow-hidden hover:scale-105 transition-transform duration-300">
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,_var(--tw-gradient-stops))] from-white/20 to-transparent"></div>
                  <div className="relative">
                    <div className="flex items-center gap-3 mb-5">
                      <div className="w-14 h-14 bg-white/25 backdrop-blur-sm rounded-xl flex items-center justify-center ring-2 ring-white/40">
                        <TrendingUp className="w-7 h-7 text-white" />
                      </div>
                      <span className="text-xs font-bold text-white/80 uppercase tracking-widest">Complete Record</span>
                    </div>
                    <p className="text-5xl md:text-6xl font-black text-white font-mono mb-3 tracking-tight">{fighter.record}</p>
                    <p className="text-sm text-white/80 font-medium">Wins - Losses - Draws</p>
                  </div>
                </div>

                <div className="group relative bg-gradient-to-br from-red-500 to-rose-600 rounded-2xl p-8 overflow-hidden hover:scale-105 transition-transform duration-300">
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,_var(--tw-gradient-stops))] from-white/20 to-transparent"></div>
                  <div className="relative">
                    <div className="flex items-center gap-3 mb-5">
                      <div className="w-14 h-14 bg-white/25 backdrop-blur-sm rounded-xl flex items-center justify-center ring-2 ring-white/40">
                        <Target className="w-7 h-7 text-white" />
                      </div>
                      <span className="text-xs font-bold text-white/80 uppercase tracking-widest">Fighting Style</span>
                    </div>
                    <p className="text-3xl md:text-4xl font-black text-white mb-3 capitalize">
                      {fighter.style ? fighter.style.split(',').map((s: string) => s.trim()).join(' • ') : 'Balanced'}
                    </p>
                    <p className="text-sm text-white/80 font-medium">{fighterStats.stance} Stance</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Career Stats */}
          <div className="relative bg-white/80 backdrop-blur-sm rounded-3xl p-8 md:p-12 border border-gray-200/50 overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-yellow-200/20 to-transparent rounded-full blur-3xl"></div>

            <div className="relative">
              <div className="flex items-center gap-4 mb-10">
                <div className="w-16 h-16 bg-gradient-to-br from-amber-400 via-yellow-500 to-orange-500 rounded-2xl flex items-center justify-center shadow-lg">
                  <Award className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h2 className="text-3xl md:text-4xl font-black text-gray-900 tracking-tight">Career Statistics</h2>
                  <div className="flex items-center gap-2 mt-1">
                    <div className="w-10 h-1 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-full"></div>
                    <p className="text-sm text-gray-500 font-medium">Professional performance metrics</p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="group relative bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl p-8 overflow-hidden hover:scale-105 transition-transform duration-300">
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-white/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  <div className="relative">
                    <div className="flex items-center gap-3 mb-5">
                      <div className="w-14 h-14 bg-white/25 backdrop-blur-sm rounded-xl flex items-center justify-center ring-2 ring-white/40">
                        <Trophy className="w-7 h-7 text-white" />
                      </div>
                      <span className="text-xs font-bold text-white/80 uppercase tracking-widest">Win Rate</span>
                    </div>
                    <p className="text-6xl md:text-7xl font-black text-white leading-none mb-3">{Math.floor((wins / (wins + losses + draws)) * 100)}%</p>
                    <p className="text-sm text-white/80 font-medium">{wins} victories out of {wins + losses + draws} fights</p>
                  </div>
                </div>

                <div className="group relative bg-gradient-to-br from-orange-500 to-red-600 rounded-2xl p-8 overflow-hidden hover:scale-105 transition-transform duration-300">
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-white/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  <div className="relative">
                    <div className="flex items-center gap-3 mb-5">
                      <div className="w-14 h-14 bg-white/25 backdrop-blur-sm rounded-xl flex items-center justify-center ring-2 ring-white/40">
                        <Flame className="w-7 h-7 text-white" />
                      </div>
                      <span className="text-xs font-bold text-white/80 uppercase tracking-widest">KO Rate</span>
                    </div>
                    <p className="text-6xl md:text-7xl font-black text-white leading-none mb-3">{Math.floor((koWins / wins) * 100)}%</p>
                    <p className="text-sm text-white/80 font-medium">{koWins} knockouts from {wins} wins</p>
                  </div>
                </div>

                <div className="group relative bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl p-8 overflow-hidden hover:scale-105 transition-transform duration-300">
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-white/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  <div className="relative">
                    <div className="flex items-center gap-3 mb-5">
                      <div className="w-14 h-14 bg-white/25 backdrop-blur-sm rounded-xl flex items-center justify-center ring-2 ring-white/40">
                        <Clock className="w-7 h-7 text-white" />
                      </div>
                      <span className="text-xs font-bold text-white/80 uppercase tracking-widest">Total Fights</span>
                    </div>
                    <p className="text-6xl md:text-7xl font-black text-white leading-none mb-3">{fighterMatches.length}</p>
                    <p className="text-sm text-white/80 font-medium">Professional bouts completed</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Fighter Videos */}
          <div className="relative bg-white/80 backdrop-blur-sm rounded-3xl p-8 md:p-12 border border-gray-200/50 overflow-hidden">
            <div className="absolute top-0 left-0 w-64 h-64 bg-gradient-to-br from-red-200/20 to-transparent rounded-full blur-3xl"></div>

            <div className="relative">
              <div className="flex items-center gap-4 mb-10">
                <div className="w-16 h-16 bg-gradient-to-br from-red-500 via-rose-500 to-pink-600 rounded-2xl flex items-center justify-center shadow-lg">
                  <Play className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h2 className="text-3xl md:text-4xl font-black text-gray-900 tracking-tight">Fighter Videos</h2>
                  <div className="flex items-center gap-2 mt-1">
                    <div className="w-10 h-1 bg-gradient-to-r from-red-500 to-pink-500 rounded-full"></div>
                    <p className="text-sm text-gray-500 font-medium">Watch highlights and training footage</p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {fighterVideos.map((video) => (
                  <button
                    key={video.id}
                    onClick={() => setSelectedVideo(video)}
                    className="group relative bg-white rounded-2xl border border-gray-200/50 hover:border-red-400 hover:shadow-xl transition-all duration-300 overflow-hidden text-left hover:scale-[1.02]"
                  >
                    {/* Video Thumbnail */}
                    <div className="relative h-64 bg-gray-900 overflow-hidden">
                      <img
                        src={video.thumbnail}
                        alt={video.title}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-black/20" />

                      {/* Play Button Overlay */}
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="relative">
                          <div className="absolute inset-0 bg-red-500 rounded-full blur-xl opacity-50 group-hover:opacity-75 transition-opacity"></div>
                          <div className="relative w-20 h-20 bg-gradient-to-br from-red-500 to-rose-600 group-hover:from-red-600 group-hover:to-rose-700 rounded-full flex items-center justify-center shadow-2xl transform group-hover:scale-110 transition-all">
                            <Play className="w-9 h-9 text-white ml-1" fill="white" />
                          </div>
                        </div>
                      </div>

                      {/* Video Duration Badge */}
                      <div className="absolute bottom-4 right-4 px-3 py-1.5 bg-black/80 backdrop-blur-sm rounded-lg">
                        <span className="text-xs font-bold text-white">HD</span>
                      </div>
                    </div>

                    {/* Video Info */}
                    <div className="p-6">
                      <h3 className="text-xl font-black text-gray-900 mb-2 line-clamp-2 group-hover:text-red-600 transition-colors leading-tight">
                        {video.title}
                      </h3>
                      <p className="text-sm text-gray-500 font-medium flex items-center gap-2">
                        <Clock className="w-3.5 h-3.5" />
                        {video.date}
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Related Fighters */}
          {relatedFighters.length > 0 && (
            <div className="relative bg-white/80 backdrop-blur-sm rounded-3xl p-8 md:p-12 border border-gray-200/50 overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-blue-200/20 to-transparent rounded-full blur-3xl"></div>

              <div className="relative">
                <div className="flex items-center gap-4 mb-10">
                  <div className="w-16 h-16 bg-gradient-to-br from-[#0A3D91] via-blue-600 to-indigo-700 rounded-2xl flex items-center justify-center shadow-lg">
                    <Users className="w-8 h-8 text-white" />
                  </div>
                  <div>
                    <h2 className="text-3xl md:text-4xl font-black text-gray-900 tracking-tight">Related Fighters</h2>
                    <div className="flex items-center gap-2 mt-1">
                      <div className="w-10 h-1 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full"></div>
                      <p className="text-sm text-gray-500 font-medium">Similar weight class or same club</p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {relatedFighters.map((relatedFighter) => (
                    <Link
                      key={relatedFighter.id}
                      to={`/fighters/${relatedFighter.id}`}
                      className="group relative bg-white rounded-2xl border border-gray-200/50 hover:border-blue-400 hover:shadow-xl transition-all duration-300 overflow-hidden hover:scale-[1.02]"
                    >
                      {/* Fighter Image */}
                      <div className="relative h-64 bg-gray-900 overflow-hidden">
                        <img
                          src={relatedFighter.image || exampleFighterBg}
                          alt={relatedFighter.name}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-black/10" />
                        {relatedFighter.verified && (
                          <div className="absolute top-4 right-4 w-11 h-11 bg-gradient-to-br from-amber-400 via-yellow-500 to-orange-500 rounded-xl flex items-center justify-center ring-2 ring-white/40 shadow-xl">
                            <Trophy className="w-5 h-5 text-white" />
                          </div>
                        )}

                        {/* Hover overlay */}
                        <div className="absolute inset-0 bg-gradient-to-t from-[#0A3D91]/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                      </div>

                      {/* Fighter Info */}
                      <div className="p-6">
                        <h3 className="text-xl font-black text-gray-900 mb-3 line-clamp-1 group-hover:text-[#0A3D91] transition-colors leading-tight">
                          {relatedFighter.name}
                        </h3>
                        <p className="text-sm text-gray-500 mb-4 flex items-center gap-2 font-medium">
                          <Building2 className="w-4 h-4" />
                          {relatedFighter.gym}
                        </p>

                        <div className="flex items-center gap-2">
                          <span className="flex-1 px-3 py-2 bg-gray-50 text-gray-900 text-sm font-bold rounded-xl border border-gray-200 text-center">
                            {relatedFighter.record}
                          </span>
                          <span className="px-4 py-2 bg-blue-50 text-[#0A3D91] text-sm font-bold rounded-xl border border-blue-200">
                            {relatedFighter.weight}kg
                          </span>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Video Modal */}
      {selectedVideo && (
        <div
          className="fixed inset-0 bg-black/95 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-fadeIn"
          onClick={() => setSelectedVideo(null)}
        >
          <div className="relative w-full max-w-6xl" onClick={(e) => e.stopPropagation()}>
            {/* Close Button */}
            <button
              onClick={() => setSelectedVideo(null)}
              className="absolute -top-14 right-0 z-10 flex items-center gap-2 px-5 py-2.5 bg-white/10 hover:bg-white/20 backdrop-blur-sm rounded-full text-white transition-all group"
            >
              <span className="text-sm font-semibold">Close</span>
              <X className="w-5 h-5 group-hover:rotate-90 transition-transform" />
            </button>

            {/* Video Container */}
            <div className="relative aspect-video bg-black rounded-3xl overflow-hidden shadow-2xl ring-1 ring-white/10">
              {/* YouTube iframe */}
              <iframe
                className="w-full h-full"
                src={`https://www.youtube.com/embed/${selectedVideo.youtubeId}?autoplay=1`}
                title={selectedVideo.title}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>

            {/* Video Title */}
            <div className="mt-6 px-4">
              <h3 className="text-2xl font-black text-white mb-2">{selectedVideo.title}</h3>
              <p className="text-sm text-white/60 font-medium">{selectedVideo.date}</p>
            </div>
          </div>
        </div>
      )}

      {/* Modern Compact Footer */}
      <footer className="relative bg-gradient-to-r from-[#0A3D91] via-[#0B4AAD] to-[#0A3D91] text-white py-8 mt-20 overflow-hidden">
        {/* Subtle Background Effect */}
        <div className="absolute inset-0 opacity-30 pointer-events-none" style={{
          backgroundImage: 'radial-gradient(circle at 20% 50%, rgba(200, 16, 46, 0.15) 0%, transparent 50%), radial-gradient(circle at 80% 50%, rgba(242, 201, 76, 0.1) 0%, transparent 50%)'
        }} />

        <div className="relative z-10 max-w-7xl mx-auto px-4 md:px-6">
          {/* Main Content */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-6">
            {/* Brand Column */}
            <div className="md:col-span-1">
              <div className="flex items-center gap-2 mb-3">
                <div className="relative flex items-center justify-center p-1.5 bg-white rounded-lg">
                  <img
                    src={kkfLogo}
                    alt="KKF Logo"
                    className="w-10 h-10 object-contain"
                  />
                </div>
                <div>
                  <h3 className="text-lg font-black tracking-tight leading-tight">KUNKHMER</h3>
                  <p className="text-[9px] text-[#F2C94C] font-bold tracking-[0.1em] uppercase leading-tight">Official Platform</p>
                </div>
              </div>
              <p className="text-white/60 text-xs leading-relaxed mb-4">
                Official digital platform for Cambodian Martial Arts excellence and tradition.
              </p>

              {/* Social Media Icons */}
              <div className="flex gap-2">
                <a href="#" className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-all duration-200">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
                </a>
                <a href="#" className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-all duration-200">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>
                </a>
                <a href="#" className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-all duration-200">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/></svg>
                </a>
                <a href="#" className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-all duration-200">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>
                </a>
              </div>
            </div>

            {/* Platform Column */}
            <div>
              <h4 className="font-bold text-[13px] mb-3 text-[#F2C94C] tracking-wide uppercase">Platform</h4>
              <ul className="space-y-2">
                <li>
                  <Link to="/news-events" className="text-white/60 hover:text-white transition-colors text-xs">
                    News & Events
                  </Link>
                </li>
                <li>
                  <Link to="/fighters" className="text-white/60 hover:text-white transition-colors text-xs">
                    Fighters
                  </Link>
                </li>
              </ul>
            </div>

            {/* Shop Column */}
            <div>
              <h4 className="font-bold text-[13px] mb-3 text-[#F2C94C] tracking-wide uppercase">Shop</h4>
              <ul className="space-y-2">
                <li>
                  <Link to="/shop" className="text-white/60 hover:text-white transition-colors text-xs">
                    All Products
                  </Link>
                </li>
                <li>
                  <Link to="/orders" className="text-white/60 hover:text-white transition-colors text-xs">
                    My Orders
                  </Link>
                </li>
              </ul>
            </div>

            {/* Support Column */}
            <div>
              <h4 className="font-bold text-[13px] mb-3 text-[#F2C94C] tracking-wide uppercase">Support</h4>
              <ul className="space-y-2">
                <li>
                  <Link to="/home" className="text-white/60 hover:text-white transition-colors text-xs">
                    Admin Platform
                  </Link>
                </li>
                <li>
                  <button className="text-white/60 hover:text-white transition-colors text-xs">
                    Help Center
                  </button>
                </li>
                <li>
                  <button className="text-white/60 hover:text-white transition-colors text-xs">
                    Contact Us
                  </button>
                </li>
              </ul>
            </div>
          </div>

          {/* Divider */}
          <div className="border-t border-white/10 my-5" />

          {/* Bottom Section */}
          <div className="flex flex-col md:flex-row justify-between items-center gap-3 text-xs">
            <div className="text-white/40">
              © 2026 KUNKHMER. All rights reserved.
            </div>

            <div className="flex gap-5 text-white/40">
              <button className="hover:text-white transition-colors">Privacy Policy</button>
              <button className="hover:text-white transition-colors">Terms of Service</button>
              <button className="hover:text-white transition-colors">Cookie Policy</button>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
