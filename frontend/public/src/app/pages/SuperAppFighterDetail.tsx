import { useParams, Link, useNavigate } from "react-router";
import { ArrowLeft, Calendar, Target, Ruler, Trophy, XCircle, Minus, Flame, Award, Clock, Building2, Play, X, ChevronRight, Swords } from "lucide-react";
import { MediaContent } from "../data/mediaContent";
import { getFighterSlug } from "../data/masterData";
import { api } from "../utils/api";
import { useState, useEffect } from "react";
import exampleFighterBg from 'figma:asset/fe303cee6544597f8a53fd9b8b29e64c2c9ca382.png';
import { SiteHeader } from "../components/layout/SiteHeader";
import { SiteFooter } from "../components/layout/SiteFooter";
import { ShareButtons } from "../components/ShareButtons";
import { usePageMeta } from "../hooks/usePageTitle";
import { formatVideoDuration } from "../utils/publicDisplay";
import { useI18n } from "../i18n/LanguageContext";
import { useFanData } from "../data/fanData";
import { FightHistory, NextFightCard } from "../components/fan/FighterHistory";
import { DemoBanner } from "../components/fan/FanWidgets";
import { FollowButton } from "../components/fan/FollowButton";

export function SuperAppFighterDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [selectedVideo, setSelectedVideo] = useState<MediaContent | null>(null);
  const [fighterVideos, setFighterVideos] = useState<any[]>([]);

  const [fighter, setFighter] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const { t, lang, formatDate, formatWeight, formatNumber, localName } = useI18n();
  const [clubmates, setClubmates] = useState<any[]>([]);
  const fanData = useFanData();

  usePageMeta({
    title: fighter ? localName(fighter.name, fighter.nameKhmer) : loading ? t("nav.fighters") : t("fighters.notFound"),
    description: fighter
      ? `${fighter.name}${fighter.nameKhmer ? ` (${fighter.nameKhmer})` : ""} — ${fighter.record || ""} ${t("common.wld")}. ${fighter.clubName || ""}`
      : null,
    image: fighter?.image,
    type: "profile",
  });

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

        // Other fighters from the same club (real data, not mock).
        if (f) {
          const clubId = f.clubId || f.club_id;
          api.fighters.list().then((all: any[]) => {
            setClubmates((all || []).filter((o: any) => o.id !== f.id && clubId && (o.clubId || o.club_id) === clubId).slice(0, 4));
          }).catch(() => setClubmates([]));
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

            return {
              id: vid.id,
              title: vid.title,
              thumbnail: vid.thumbnail || "https://images.unsplash.com/photo-1504309092620-4d0ec726efa4?w=600",
              duration: formatVideoDuration(vid.duration),
              date: vid.created_at || "",
              youtubeId,
              category: vid.category || "Highlights",
              fighterId: vid.fighter_id || vid.fighterId || ""
            };
          });

          // Filter videos related to this fighter ONLY
          // Videos are linked by fighter UUID, while the URL holds the fighter slug.
          const related = f ? mappedVids.filter((v: any) => v.fighterId === f.id) : [];
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
      <div className="min-h-screen flex flex-col bg-slate-50">
        <SiteHeader activeSection="fighters" />
        <div className="flex-1 flex flex-col items-center justify-center gap-4 py-24">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#0A3D91]" />
          <p className="text-slate-500 text-sm font-semibold">{t("fighters.loading")}</p>
        </div>
        <SiteFooter />
      </div>
    );
  }

  if (!fighter) {
    return (
      <div className="min-h-screen flex flex-col bg-slate-50">
        <SiteHeader activeSection="fighters" />
        <div className="flex-1 flex items-center justify-center px-4 py-24">
        <div className="text-center p-8 bg-white rounded-3xl border border-slate-200/80 shadow-xl max-w-md">
          <Trophy className="w-16 h-16 text-slate-300 mx-auto mb-4" />
          <h2 className="text-2xl font-black text-slate-800 mb-2 uppercase tracking-tight">{t("fighters.notFound")}</h2>
          <p className="text-slate-500 mb-6 text-sm">{t("fighters.notFoundText")}</p>
          <Link to="/fighters" className="inline-flex items-center justify-center px-6 py-3 bg-[#0A3D91] text-white font-bold rounded-xl hover:bg-blue-800 transition-colors shadow-md shadow-blue-900/10">
            {t("fighters.backToList")}
          </Link>
        </div>
        </div>
        <SiteFooter />
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
  // Only show stats the federation actually records — never estimate them.
  const rawKo = fighter.koWins ?? fighter.ko_wins;
  const koWins: number | null = rawKo != null && rawKo !== "" ? parseInt(rawKo) : null;
  const koRate = koWins != null && wins > 0 ? Math.round((koWins / wins) * 100) : null;

  let detailAge: number | null = null;
  const detailDob = fighter.dateOfBirth || fighter.date_of_birth;
  if (detailDob) {
    const dob = new Date(detailDob);
    if (!isNaN(dob.getTime())) {
      const now = new Date();
      detailAge = now.getFullYear() - dob.getFullYear() -
        (now < new Date(now.getFullYear(), dob.getMonth(), dob.getDate()) ? 1 : 0);
    }
  }

  const knownNationality = fighter.nationality && fighter.nationality !== "Other" ? fighter.nationality : null;
  const fighterStats = {
    age: detailAge,
    height: fighter.height ? parseFloat(fighter.height) : null,
    weight: parseFloat(fighter.weight) > 0 ? fighter.weight : null,
    reach: fighter.reach ? parseFloat(fighter.reach) : null,
    stance: fighter.stance || null,
    nationality: knownNationality,
    flagEmoji: knownNationality === "Cambodian" ? "🇰🇭" : "🌐",
  };
  const primaryStyle = fighter.style ? fighter.style.split(',')[0].trim() : null;

  // Get fighter-related videos from database (state)

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <SiteHeader activeSection="fighters" />

      {/* ── Back Navigation ── */}
      <div className="max-w-7xl mx-auto px-4 md:px-6 py-6">
        <button
          onClick={() => navigate("/fighters")}
          className="flex items-center gap-2 px-5 py-2.5 bg-white hover:bg-slate-50 text-slate-700 font-bold rounded-2xl transition-all border border-slate-200 shadow-sm hover:shadow group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform text-[#0A3D91]" />
          <span className="text-sm font-extrabold text-slate-800">{t("fighters.back")}</span>
        </button>
      </div>

      {/* ── Main Detail Content ── */}
      <main className="max-w-7xl mx-auto px-4 md:px-6 pb-20 space-y-10">
        <DemoBanner show={Boolean(fanData?.demo)} />

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

                {fighter.status === "Active" && (
                  <div className="absolute bottom-4 left-4">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-500/95 text-white text-[10px] font-black uppercase tracking-widest rounded-lg shadow-lg">
                      <span className="w-1.5 h-1.5 rounded-full bg-white" />
                      {t("fighters.active")}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Middle info block */}
            <div className="flex-1 text-center lg:text-left space-y-6">
              <div className="space-y-3">
                <div className="flex flex-wrap items-center justify-center lg:justify-start gap-2">
                  <span className="px-3.5 py-1.5 bg-slate-800/80 border border-slate-700/60 text-slate-300 text-xs font-black uppercase tracking-wider rounded-xl">
                    {t("fighters.division")}
                  </span>
                  {fighterStats.nationality && (
                    <span className="px-3 py-1 bg-white/10 text-white text-xs font-bold rounded-xl flex items-center gap-1">
                      {fighterStats.flagEmoji} {fighterStats.nationality}
                    </span>
                  )}
                </div>
                <h1 className="text-4xl md:text-6xl font-black text-white leading-tight tracking-tight uppercase">
                  {localName(fighter.name, fighter.nameKhmer)}
                </h1>
                {fighter.nameKhmer && fighter.nameKhmer !== fighter.name && (
                  <p lang={lang === "km" ? "en" : "km"} className="text-lg md:text-xl font-semibold text-slate-300">
                    {lang === "km" ? fighter.name : fighter.nameKhmer}
                  </p>
                )}
                {fighter.alias && (
                  <p className="text-xl md:text-2xl font-bold text-amber-400 italic">
                    &ldquo;{fighter.alias}&rdquo;
                  </p>
                )}
              </div>

              {/* General details grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-xl mx-auto lg:mx-0">
                {[
                  { label: t("fighters.club"), value: fighter.gym, title: fighter.gym, wide: true },
                  { label: t("fighters.weight"), value: fighterStats.weight && formatWeight(fighterStats.weight) },
                  { label: t("fighters.age"), value: fighterStats.age != null && formatNumber(fighterStats.age) },
                  { label: t("fighters.stance"), value: fighterStats.stance },
                ].filter((d) => d.value).map((d) => (
                  <div key={d.label} className={`bg-slate-900/90 border border-slate-800 p-3.5 rounded-2xl text-left ${d.wide ? "col-span-2" : ""}`}>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{d.label}</p>
                    <p className="text-sm font-black text-white mt-1 line-clamp-2 break-words" title={d.title}>{d.value}</p>
                  </div>
                ))}
              </div>

              {/* Actions */}
              <div className="flex flex-wrap items-start justify-center lg:justify-start gap-3">
                <FollowButton fighterId={fighter.id} fighterName={localName(fighter.name, fighter.nameKhmer)} />
                <ShareButtons
                  variant="compact"
                  title={`${fighter.name} — Kun Khmer fighter profile`}
                  label={t("common.shareProfile")}
                  className="px-6 py-3.5 bg-white/10 hover:bg-white/15 border border-white/10 text-white font-bold text-sm active:scale-95"
                />
                <Link
                  to={`/compare?red=${getFighterSlug(fighter)}`}
                  className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-white/10 hover:bg-white/15 border border-white/10 text-white font-bold text-sm transition-all"
                >
                  <Swords className="w-4 h-4" aria-hidden />
                  {t("matchup.compare")}
                </Link>
              </div>
            </div>

            {/* Scorecard Widget */}
            <div className="w-full lg:w-auto bg-slate-950/80 backdrop-blur border border-slate-800 rounded-3xl p-6 md:p-8 min-w-[260px] text-center lg:text-left">
              <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-4">{t("fighters.officialRecord")}</p>
              <div className="flex items-center justify-center lg:justify-start gap-4">
                <div>
                  <p className="text-4xl font-black text-emerald-400 font-mono leading-none">{wins}</p>
                  <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mt-1">{t("common.wins")}</p>
                </div>
                <div className="h-8 w-px bg-slate-800" />
                <div>
                  <p className="text-4xl font-black text-rose-500 font-mono leading-none">{losses}</p>
                  <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mt-1">{t("common.losses")}</p>
                </div>
                <div className="h-8 w-px bg-slate-800" />
                <div>
                  <p className="text-4xl font-black text-amber-500 font-mono leading-none">{draws}</p>
                  <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mt-1">{t("common.draws")}</p>
                </div>
              </div>
              <div className="mt-5 pt-4 border-t border-slate-800/80">
                <div className="flex items-center justify-between text-xs font-bold text-slate-400 mb-1.5">
                  <span className="uppercase">{t("fighters.winRatio")}</span>
                  <span className="text-emerald-400 font-black">{winRate}%</span>
                </div>
                <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full" style={{ width: `${winRate}%` }} />
                </div>
              </div>
            </div>

          </div>
        </section>

        {fanData && <NextFightCard data={fanData} fighterId={fighter.id} />}

        {/* ════════════════════════════════════════════
            2. FIGHT RECORD & CAREER STATISTICS
        ════════════════════════════════════════════ */}
        <section className="bg-white rounded-[2.5rem] border border-slate-200/80 shadow-xl overflow-hidden p-8 md:p-12 space-y-8">
          <div className="flex items-center gap-3">
            <div className="w-1.5 h-8 bg-gradient-to-b from-[#0A3D91] to-blue-500 rounded-full" />
            <div>
              <h2 className="text-2xl md:text-3xl font-black text-slate-800 tracking-tight uppercase">{t("fighters.recordTitle")}</h2>
              <p className="text-sm text-slate-500 font-medium">{t("fighters.recordSubtitle")}</p>
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
                <span className="text-[10px] font-black text-emerald-700 bg-emerald-100/60 border border-emerald-200 px-3 py-1 rounded-full uppercase tracking-wider">{t("common.wins")}</span>
              </div>
              <div className="mt-6">
                <p className="text-5xl font-black text-slate-800 leading-none">{wins}</p>
                <div className="mt-3 flex items-center gap-2">
                  <div className="h-2 bg-emerald-100 rounded-full flex-1 overflow-hidden">
                    <div className="h-full bg-emerald-500 rounded-full" style={{ width: totalFights > 0 ? `${(wins / totalFights) * 100}%` : "0%" }} />
                  </div>
                  <span className="text-xs font-black text-emerald-700">{totalFights > 0 ? Math.round((wins / totalFights) * 100) : 0}%</span>
                </div>
                <p className="text-xs text-slate-500 mt-2 font-medium">{t("fighters.outOf", { label: t("common.wins"), n: totalFights })}</p>
              </div>
            </div>

            {/* Losses Breakdown Card */}
            <div className="relative group overflow-hidden rounded-2xl bg-rose-50/50 border border-rose-100 p-6 flex flex-col justify-between">
              <div className="flex items-start justify-between">
                <div className="w-10 h-10 bg-rose-100 rounded-xl flex items-center justify-center text-rose-700">
                  <XCircle className="w-5 h-5" />
                </div>
                <span className="text-[10px] font-black text-rose-700 bg-rose-100/60 border border-rose-200 px-3 py-1 rounded-full uppercase tracking-wider">{t("common.losses")}</span>
              </div>
              <div className="mt-6">
                <p className="text-5xl font-black text-slate-800 leading-none">{losses}</p>
                <div className="mt-3 flex items-center gap-2">
                  <div className="h-2 bg-rose-100 rounded-full flex-1 overflow-hidden">
                    <div className="h-full bg-rose-500 rounded-full" style={{ width: totalFights > 0 ? `${(losses / totalFights) * 100}%` : "0%" }} />
                  </div>
                  <span className="text-xs font-black text-rose-700">{totalFights > 0 ? Math.round((losses / totalFights) * 100) : 0}%</span>
                </div>
                <p className="text-xs text-slate-500 mt-2 font-medium">{t("fighters.outOf", { label: t("common.losses"), n: totalFights })}</p>
              </div>
            </div>

            {/* Draws Breakdown Card */}
            <div className="relative group overflow-hidden rounded-2xl bg-amber-50/50 border border-amber-100 p-6 flex flex-col justify-between">
              <div className="flex items-start justify-between">
                <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center text-amber-700">
                  <Minus className="w-5 h-5" />
                </div>
                <span className="text-[10px] font-black text-amber-700 bg-amber-100/60 border border-amber-200 px-3 py-1 rounded-full uppercase tracking-wider">{t("common.draws")}</span>
              </div>
              <div className="mt-6">
                <p className="text-5xl font-black text-slate-800 leading-none">{draws}</p>
                <div className="mt-3 flex items-center gap-2">
                  <div className="h-2 bg-amber-100 rounded-full flex-1 overflow-hidden">
                    <div className="h-full bg-amber-500 rounded-full" style={{ width: totalFights > 0 ? `${(draws / totalFights) * 100}%` : "0%" }} />
                  </div>
                  <span className="text-xs font-black text-amber-700">{totalFights > 0 ? Math.round((draws / totalFights) * 100) : 0}%</span>
                </div>
                <p className="text-xs text-slate-500 mt-2 font-medium">{t("fighters.outOf", { label: t("common.draws"), n: totalFights })}</p>
              </div>
            </div>

          </div>

          {/* Physical attributes cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: t("fighters.age"), value: fighterStats.age, unit: t("fighters.unitYears"), icon: Calendar, color: "blue" },
              { label: t("fighters.height"), value: fighterStats.height, unit: fighterStats.height ? `cm${lang === "en" ? ` (${Math.floor(fighterStats.height / 2.54 / 12)}′${Math.round(fighterStats.height / 2.54 % 12)}″)` : ""}` : "", icon: Ruler, color: "purple" },
              { label: t("fighters.reach"), value: fighterStats.reach, unit: "cm", icon: Target, color: "orange" },
              { label: t("fighters.koWins"), value: koWins, unit: t("fighters.unitFinishes"), icon: Flame, color: "red" },
            ].filter(({ value }) => value != null).map(({ label, value, unit, icon: Icon, color }) => (
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
              <h3 className="text-base font-black text-slate-800 uppercase tracking-tight">{t("fighters.performance")}</h3>
            </div>

            <div className="space-y-6">
              {/* Win Rate */}
              <div>
                <div className="flex justify-between text-xs font-bold text-slate-600 mb-2">
                  <span>{t("fighters.careerWinRatio")}</span>
                  <span className="font-black text-slate-900">{winRate}%</span>
                </div>
                <div className="h-3 bg-slate-200 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full transition-all duration-700" style={{ width: `${winRate}%` }} />
                </div>
              </div>

              {/* KO Rate */}
              {koRate != null && (
              <div>
                <div className="flex justify-between text-xs font-bold text-slate-600 mb-2">
                  <span>{t("fighters.koRatio")}</span>
                  <span className="font-black text-slate-900">{koRate}%</span>
                </div>
                <div className="h-3 bg-slate-200 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-orange-500 to-red-500 rounded-full transition-all duration-700" style={{ width: `${koRate}%` }} />
                </div>
              </div>
              )}
            </div>

            <div className="grid grid-cols-3 gap-4 border-t border-slate-200/80 mt-6 pt-6 text-center">
              <div>
                <p className="text-xs font-black text-slate-400 uppercase tracking-wider">{t("fighters.careerBouts")}</p>
                <p className="text-xl font-black text-slate-800 mt-0.5">{totalFights}</p>
              </div>
              <div className="border-x border-slate-200">
                <p className="text-xs font-black text-slate-400 uppercase tracking-wider">{t("fighters.style")}</p>
                <p className="text-xl font-black text-[#0A3D91] mt-0.5 truncate capitalize">
                  {primaryStyle || "—"}
                </p>
              </div>
              <div>
                <p className="text-xs font-black text-slate-400 uppercase tracking-wider">{t("fighters.stance")}</p>
                <p className="text-xl font-black text-slate-800 mt-0.5">{fighterStats.stance || "—"}</p>
              </div>
            </div>
          </div>
        </section>

        {fanData && <FightHistory data={fanData} fighterId={fighter.id} />}

        {/* ════════════════════════════════════════════
            3. FIGHTER VIDEOS SECTION
        ════════════════════════════════════════════ */}
        <section className="bg-white rounded-[2.5rem] border border-slate-200/80 shadow-xl overflow-hidden p-8 md:p-12 space-y-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-1.5 h-8 bg-gradient-to-b from-red-500 to-rose-500 rounded-full" />
              <div>
                <h2 className="text-2xl md:text-3xl font-black text-slate-800 tracking-tight uppercase">{t("fighters.videos")}</h2>
                <p className="text-sm text-slate-500 font-medium">{t("fighters.videosText")}</p>
              </div>
            </div>
            <Link to="/news-events?tab=media" className="flex items-center gap-1 text-sm font-black text-[#0A3D91] hover:underline">
              <span>{t("fighters.videoLibrary")}</span>
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

                  {video.duration && (
                    <div className="absolute bottom-2 right-2 bg-slate-950/70 text-white text-[10px] font-bold px-2 py-0.5 rounded">
                      {video.duration}
                    </div>
                  )}
                </div>

                {/* Video Info panel */}
                <div className="p-5 flex flex-col justify-between flex-1 min-w-0">
                  <div>
                    <h3 className="text-sm font-extrabold text-slate-800 leading-snug line-clamp-2 group-hover:text-[#0A3D91] transition-colors">
                      {video.title}
                    </h3>
                  </div>
                  <div className="flex items-center gap-1.5 text-[11px] text-slate-400 font-bold mt-4">
                    <Clock className="w-3.5 h-3.5" />
                    <span>{formatDate(video.date)}</span>
                  </div>
                </div>
              </button>
            ))}
            {fighterVideos.length === 0 && (
              <div className="col-span-full text-center py-12 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200">
                <Play className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                <p className="text-slate-500 text-sm font-semibold">{t("fighters.noVideos")}</p>
              </div>
            )}
          </div>
        </section>

        {/* ════════════════════════════════════════════
            4. RELATED FIGHTERS SECTION
        ════════════════════════════════════════════ */}
        {clubmates.length > 0 && (
          <section className="bg-white rounded-[2.5rem] border border-slate-200/80 shadow-xl overflow-hidden p-8 md:p-12 space-y-8">
            <div className="flex items-center gap-3">
              <div className="w-1.5 h-8 bg-gradient-to-b from-blue-600 to-indigo-600 rounded-full" />
              <div>
                <h2 className="text-2xl md:text-3xl font-black text-slate-800 tracking-tight uppercase">{t("fighters.teammates")}</h2>
                <p className="text-sm text-slate-500 font-medium">{t("fighters.teammatesText", { club: fighter.gym })}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {clubmates.map((rel) => (
                <Link
                  key={rel.id}
                  to={`/fighters/${getFighterSlug(rel)}`}
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

                  </div>

                  {/* Info Block */}
                  <div className="p-4 flex-1 flex flex-col justify-between">
                    <div>
                      <h3 className="text-sm font-black text-slate-800 line-clamp-1 group-hover:text-[#0A3D91] transition-colors leading-tight">
                        {localName(rel.name, rel.nameKhmer)}
                      </h3>
                      {rel.nameKhmer && (
                        <p className="text-xs text-slate-500 font-semibold mt-1 truncate">{lang === "km" ? rel.name : rel.nameKhmer}</p>
                      )}
                    </div>

                    <div className="flex items-center gap-2 mt-4 pt-3 border-t border-slate-100">
                      <span className="flex-1 text-center py-1 bg-slate-100 text-slate-700 text-[11px] font-extrabold rounded-md border border-slate-200/50">
                        {rel.record}
                      </span>
                      <span className="px-2.5 py-1 bg-blue-50 text-[#0A3D91] text-[11px] font-extrabold rounded-md border border-blue-100">
                        {formatWeight(rel.currentWeight || rel.weight) || "—"}
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
              <p className="text-sm text-slate-400 mt-1">{formatDate(selectedVideo.date)}</p>
            </div>
          </div>
        </div>
      )}

      <SiteFooter />
    </div>
  );
}
