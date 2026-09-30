/**
 * Fighter profile (/fighters/:slug) in the site's light style: photo and official record up top,
 * titles held, the next fight with a face-off, figures from bouts recorded on this site, fight
 * history, videos, profile details and club teammates. Real data only — fields the federation hasn't
 * entered are left out. See claude/updates/fighter-page-redesign.md.
 */
import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router";
import {
  ArrowLeft, Building2, CalendarDays, Crown, Flag, Flame, MapPin, Play, Ruler, Scale, Shield, Swords, Trophy, Tv, User, Users, X,
} from "lucide-react";
import { SiteHeader } from "../components/layout/SiteHeader";
import { SiteFooter } from "../components/layout/SiteFooter";
import { ShareButtons } from "../components/ShareButtons";
import { FollowButton } from "../components/fan/FollowButton";
import { HubAskAbout } from "../components/hub/HubAskAbout";
import { FightHistory } from "../components/fan/FighterHistory";
import { DemoBanner, FormGuide } from "../components/fan/FanWidgets";
import { LoadError, Loading } from "../components/LoadError";
import { DetailRow, Section, SideCard, Spotlight, Stats, iconCls } from "../components/detail/DetailParts";
import { FighterCard, currentTitles } from "./FightersDirectory";
import { NotFoundContent } from "./NotFound";
import { broadcasterForEvent, fightHistory, nextBout, retryFanData, useFanData } from "../data/fanData";
import { isRealImage, partnerPath } from "../data/partners";
import { getFighterSlug } from "../data/masterData";
import { weightClassFor } from "../data/weightClasses";
import { api } from "../utils/api";
import { usePageMeta } from "../hooks/usePageTitle";
import { formatVideoDuration, textLang } from "../utils/publicDisplay";
import { useI18n } from "../i18n/LanguageContext";
import { championPath, eventPathById } from "../data/links";
import { nationalityLabel, styleLabel } from "../data/fighterLabels";

interface Video {
  id: string;
  title: string;
  thumbnail: string;
  duration: string | null;
  date: string;
  youtubeId: string;
}

function youtubeIdOf(url?: string | null): string {
  const m = url?.match(/^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/);
  return m && m[2].length === 11 ? m[2] : "";
}

function ageFrom(dob?: string | null): number | null {
  if (!dob) return null;
  const d = new Date(dob);
  if (isNaN(d.getTime())) return null;
  const now = new Date();
  return now.getFullYear() - d.getFullYear() - (now < new Date(now.getFullYear(), d.getMonth(), d.getDate()) ? 1 : 0);
}

const isFinish = (method?: string | null) => Boolean(method) && !/decision|draw|no ?contest|points/i.test(method!);

type Load = { status: "loading" } | { status: "error" } | { status: "ready"; fighter: any | null };

export function SuperAppFighterDetail() {
  const { id } = useParams();
  const { t, tn, lang, formatWeight, formatNumber, localName, formatDate } = useI18n();
  const data = useFanData();
  const [load, setLoad] = useState<Load>({ status: "loading" });
  const [attempt, setAttempt] = useState(0);
  const [videos, setVideos] = useState<Video[]>([]);
  const [playing, setPlaying] = useState<Video | null>(null);
  // A photo link that no longer works falls back to the initials.
  const [photoFailed, setPhotoFailed] = useState(false);

  useEffect(() => {
    if (!id) return;
    window.scrollTo(0, 0);
    let alive = true;
    setPhotoFailed(false);
    setLoad({ status: "loading" });
    api.fighters
      .get(id)
      .then((f: any) => {
        if (!alive) return;
        setLoad({ status: "ready", fighter: f || null });
        if (!f) return;
        api.videos
          .list()
          .then((vids: any[]) =>
            alive &&
            setVideos(
              (vids || [])
                .filter((v) => (v.fighter_id || v.fighterId) === f.id)
                .map((v) => {
                  const youtubeId = youtubeIdOf(v.youtube_url || v.youtubeUrl);
                  return {
                    id: v.id,
                    title: v.title,
                    // The video's own YouTube still when no thumbnail was uploaded — never a stock photo.
                    thumbnail: isRealImage(v.thumbnail) ? v.thumbnail : youtubeId ? `https://img.youtube.com/vi/${youtubeId}/hqdefault.jpg` : "",
                    duration: formatVideoDuration(v.duration),
                    date: v.created_at || "",
                    youtubeId,
                  };
                }),
            ),
          )
          .catch(() => alive && setVideos([]));
      })
      .catch((err: unknown) => {
        // A missing fighter is a 404 ("not found"); anything else is a failed load.
        if (!alive) return;
        const msg = err instanceof Error ? err.message : "";
        setLoad(/not found|404/i.test(msg) ? { status: "ready", fighter: null } : { status: "error" });
      });
    return () => {
      alive = false;
    };
  }, [id, attempt]);

  const fighter = load.status === "ready" ? load.fighter : null;
  const name = fighter ? localName(fighter.name, fighter.nameKhmer) : "";

  usePageMeta({
    title: fighter ? name : load.status === "loading" ? t("nav.fighters") : t("fighters.notFound"),
    description: fighter
      ? `${fighter.name}${fighter.nameKhmer ? ` (${fighter.nameKhmer})` : ""} — ${fighter.record || ""} ${t("common.wld")}. ${fighter.clubName || ""}`
      : null,
    image: fighter && isRealImage(fighter.image) ? fighter.image : null,
    type: "profile",
  });

  const view = useMemo(() => {
    if (!fighter) return null;
    const [w, l, d] = String(fighter.record || "").split("-").map((n) => parseInt(n, 10) || 0);
    const wins = w || 0, losses = l || 0, draws = d || 0;
    const total = wins + losses + draws;
    const weightKg = parseFloat(fighter.currentWeight || fighter.current_weight || "0") || null;
    const wc = data && weightKg ? weightClassFor(weightKg, data.weightClasses) : null;
    const history = data ? fightHistory(data, fighter.id) : [];
    const siteWins = history.filter((h) => h.outcome === "win");
    const titles = data ? (data.champions ?? []).filter((c: any) => c.current_holder_id === fighter.id && String(c.status || "").toLowerCase() !== "vacant") : [];
    const next = data ? nextBout(data, fighter.id) : null;
    const nextEvent = next?.bout.eventId ? data?.events.find((e: any) => e.id === next.bout.eventId) : null;
    const clubId = fighter.clubId || fighter.club_id;
    const teammates = (data?.fighters ?? []).filter((o: any) => o.id !== fighter.id && clubId && (o.clubId || o.club_id) === clubId).slice(0, 3);
    return {
      wins, losses, draws, total,
      winRate: total > 0 ? Math.round((wins / total) * 100) : null,
      weightKg, wc,
      age: ageFrom(fighter.dateOfBirth || fighter.date_of_birth),
      height: parseFloat(fighter.height) || null,
      history,
      siteBouts: history.length,
      siteWins: siteWins.length,
      finishes: siteWins.filter((h) => isFinish(h.bout.method)).length,
      titleBouts: history.filter((h) => h.bout.isTitle).length,
      titles, next, nextEvent, clubId, teammates,
      nationality: fighter.nationality && fighter.nationality !== "Other" ? fighter.nationality : null,
      styles: String(fighter.style || "").split(",").map((s: string) => s.trim()).filter(Boolean),
      status: fighter.professionalStatus || fighter.professional_status || null,
    };
  }, [fighter, data]);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <SiteHeader activeSection="fighters" />
      <main className="flex-1">
        {load.status === "loading" && <Loading />}
        {load.status === "error" && <div className="max-w-3xl mx-auto px-4 py-16"><LoadError onRetry={() => setAttempt((n) => n + 1)} /></div>}
        {load.status === "ready" && !fighter && <NotFoundContent />}
        {fighter && view && (
          <>
            {/* ── Header ── */}
            <section className="bg-gradient-to-b from-[#eef3fb] to-gray-50 border-b border-[#d5e0f3]">
              <div className="max-w-6xl mx-auto px-4 md:px-6 pt-6 pb-10">
                <Link to="/fighters" className="kk-focus inline-flex items-center gap-2 text-sm font-semibold text-gray-600 hover:text-gray-900 mb-6">
                  <ArrowLeft className="w-4 h-4" aria-hidden /> {t("fighters.back")}
                </Link>
                <div className="grid md:grid-cols-[260px_minmax(0,1fr)] lg:grid-cols-[300px_minmax(0,1fr)_280px] gap-6 lg:gap-8 items-start">
                  <div className="relative mx-auto w-full max-w-[220px] sm:max-w-[260px] md:max-w-[300px] aspect-[3/4] rounded-3xl overflow-hidden border border-[#d5e0f3] bg-white shadow-[0_10px_40px_rgba(26,71,151,0.1)]">
                    {isRealImage(fighter.image) && !photoFailed ? (
                      <img src={fighter.image} alt={name} onError={() => setPhotoFailed(true)} className="w-full h-full object-cover object-top" />
                    ) : (
                      <NoPhoto name={fighter.name} />
                    )}
                    {view.titles.length > 0 && (
                      <Link
                        to={view.titles.length === 1 ? championPath(view.titles[0]) : "/champions"}
                        title={view.titles.map((c: any) => c.title_name).join(", ")}
                        className="kk-focus absolute top-3 left-3 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#f2c94c] text-[#3d2e00] text-xs font-bold shadow hover:bg-[#f5d56b]"
                      >
                        <Crown className="w-3.5 h-3.5" aria-hidden /> {t("fighterPage.champion")}
                      </Link>
                    )}
                  </div>

                  <div className="min-w-0 text-center md:text-left">
                    <p className="kk-label text-[var(--kk-red)]">
                      {[view.wc ? localName(view.wc.name, view.wc.name_khmer) : null, view.status ? t(view.status === "Amateur" ? "fighterPage.amateur" : "fighterPage.professional") : null].filter(Boolean).join(" · ") || t("fighterPage.eyebrow")}
                    </p>
                    <h1 lang={textLang(name)} className="kk-heading text-4xl md:text-5xl text-[var(--kk-navy)] mt-1 break-words">{name}</h1>
                    {fighter.nameKhmer && fighter.nameKhmer !== fighter.name && (
                      <p lang={lang === "km" ? "en" : "km"} className="text-lg text-gray-600">{lang === "km" ? fighter.name : fighter.nameKhmer}</p>
                    )}
                    {fighter.alias && <p lang={textLang(fighter.alias)} className="text-lg font-semibold text-[var(--kk-red)] italic mt-1">“{fighter.alias}”</p>}

                    <ul className="mt-4 flex flex-wrap justify-center md:justify-start gap-x-5 gap-y-2 text-sm text-gray-700">
                      {(fighter.clubName || fighter.club_name) && view.clubId && (
                        <li className="inline-flex items-center gap-2">
                          {isRealImage(fighter.clubLogo) ? (
                            <img src={fighter.clubLogo} alt="" className="w-6 h-6 rounded-md object-contain bg-white ring-1 ring-black/5" />
                          ) : (
                            <Building2 className={`${iconCls} text-[var(--kk-blue)]`} aria-hidden />
                          )}
                          <Link to={partnerPath("club", { id: view.clubId, name: fighter.clubName || fighter.club_name })} lang={textLang(fighter.clubName)} className="kk-focus font-semibold text-[var(--kk-blue)] hover:underline underline-offset-4">{fighter.clubName || fighter.club_name}</Link>
                        </li>
                      )}
                      {view.weightKg && <li className="inline-flex items-center gap-2"><Scale className={`${iconCls} text-[var(--kk-blue)]`} aria-hidden />{formatWeight(view.weightKg)}</li>}
                      {view.age != null && <li className="inline-flex items-center gap-2"><CalendarDays className={`${iconCls} text-[var(--kk-blue)]`} aria-hidden />{t("fighterPage.age", { n: formatNumber(view.age) })}</li>}
                      {view.nationality && <li className="inline-flex items-center gap-2"><Flag className={`${iconCls} text-[var(--kk-blue)]`} aria-hidden />{view.nationality === "Cambodian" ? "🇰🇭 " : ""}{nationalityLabel(t, view.nationality)}</li>}
                    </ul>

                    {view.titles.length > 0 && (
                      <ul className="mt-4 flex flex-wrap justify-center md:justify-start gap-2">
                        {view.titles.map((c: any) => (
                          <li key={c.id} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#fffaf0] border border-[#f2c94c]/70 text-sm font-semibold text-[#7A5B00]">
                            <Crown className="w-4 h-4" aria-hidden /><span lang={textLang(c.title_name)}>{c.title_name}</span>
                          </li>
                        ))}
                      </ul>
                    )}

                    <div className="mt-5 flex flex-wrap justify-center md:justify-start items-start gap-2">
                      <FollowButton fighterId={fighter.id} fighterName={name} />
                      <Link to={`/compare?red=${getFighterSlug(fighter)}`} className="kk-focus inline-flex items-center gap-2 h-11 px-4 rounded-xl bg-white border border-gray-200 text-sm font-semibold text-gray-800 hover:border-gray-300">
                        <Swords className={iconCls} aria-hidden /> {t("matchup.compare")}
                      </Link>
                      <ShareButtons variant="compact" title={t("fighterPage.shareTitle", { name: fighter.name })} label={t("common.shareProfile")} />
                    </div>
                  </div>

                  {/* Official record */}
                  <div className="md:col-span-2 lg:col-span-1 rounded-3xl bg-white border border-[#d5e0f3] p-5 md:p-6 shadow-sm">
                    <p className="kk-label text-gray-500">{t("fighters.officialRecord")}</p>
                    <div className="mt-3 grid grid-cols-3 text-center divide-x divide-gray-100">
                      {[
                        { v: view.wins, label: t("common.wins"), cls: "text-emerald-600" },
                        { v: view.losses, label: t("common.losses"), cls: "text-rose-600" },
                        { v: view.draws, label: t("common.draws"), cls: "text-amber-600" },
                      ].map((x) => (
                        <div key={x.label}>
                          <p className={`kk-stat text-4xl leading-none ${x.cls}`}>{formatNumber(x.v)}</p>
                          <p className="text-xs font-semibold text-gray-500 mt-1">{x.label}</p>
                        </div>
                      ))}
                    </div>
                    {view.winRate != null && (
                      <div className="mt-5">
                        <div className="flex items-center justify-between text-sm font-semibold text-gray-700 mb-1.5">
                          <span>{t("fighters.winRatio")}</span><span className="text-emerald-700">{view.winRate}%</span>
                        </div>
                        <div className="h-2 bg-gray-100 rounded-full overflow-hidden"><div className="h-full bg-emerald-500 rounded-full" style={{ width: `${view.winRate}%` }} /></div>
                        <p className="text-xs text-gray-500 mt-2">{tn("fighterPage.careerBouts", view.total)}</p>
                      </div>
                    )}
                    {view.history.length > 0 && (
                      <div className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-between gap-2">
                        <span className="kk-label text-gray-500">{t("history.form")}</span>
                        <FormGuide form={view.history.slice(0, 5).map((h) => h.outcome)} label={false} />
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </section>

            <div className="max-w-6xl mx-auto px-4 md:px-6 py-10 space-y-10">
              {data?.failed && <LoadError onRetry={retryFanData} />}
              <DemoBanner show={Boolean(data?.demo)} />

              <div className="grid lg:grid-cols-[minmax(0,1fr)_320px] gap-10 items-start">
                <div className="space-y-12 min-w-0">
                  {view.next && (
                    <Spotlight
                      label={t("next.title")}
                      date={view.next.bout.date}
                      title={view.nextEvent?.name || view.next.bout.eventName || view.next.bout.cardName || t("event.fightNight")}
                      eventHref={view.next.bout.eventId ? eventPathById(data?.events, view.next.bout.eventId) : undefined}
                      bout={view.next.bout}
                      subtitle={
                        <>
                          {view.nextEvent?.location && <p className="flex items-start gap-2"><MapPin className={`${iconCls} mt-0.5 text-[var(--kk-red)]`} aria-hidden /><span lang={textLang(view.nextEvent.location)}>{view.nextEvent.location}</span></p>}
                          {view.nextEvent && data && broadcasterForEvent(data, view.nextEvent) && <p className="flex items-center gap-2"><Tv className={`${iconCls} text-[var(--kk-blue)]`} aria-hidden />{t("fights.liveOn", { station: broadcasterForEvent(data, view.nextEvent)!.name })}</p>}
                          <p className="flex items-center gap-2"><Swords className={`${iconCls} text-[var(--kk-blue)]`} aria-hidden />
                            <Link to={`/compare?red=${getFighterSlug(view.next.bout.fighterA)}&blue=${getFighterSlug(view.next.bout.fighterB)}`} className="kk-focus font-semibold text-[var(--kk-blue)] hover:underline underline-offset-4">{t("matchup.preview")}</Link>
                          </p>
                        </>
                      }
                    />
                  )}

                  {view.siteBouts > 0 && (
                    <Section title={t("fighterPage.onSite")}>
                      <Stats
                        compact
                        items={[
                          { icon: <Swords className="w-5 h-5" />, value: view.siteBouts, label: tn("fighterPage.statBouts", view.siteBouts) },
                          { icon: <Trophy className="w-5 h-5" />, value: view.siteWins, label: tn("fighterPage.statWins", view.siteWins) },
                          { icon: <Flame className="w-5 h-5" />, value: view.finishes, label: tn("fighterPage.statFinishes", view.finishes) },
                          { icon: <Crown className="w-5 h-5" />, value: view.titleBouts, label: tn("fighterPage.statTitleBouts", view.titleBouts) },
                        ]}
                      />
                      <p className="text-xs text-gray-500">{t("fighterPage.onSiteNote")}</p>
                    </Section>
                  )}

                  {data && <FightHistory data={data} fighterId={fighter.id} />}

                  {videos.length > 0 && (
                    <Section
                      title={t("fighters.videos")}
                      icon={<Play className="w-5 h-5 text-[var(--kk-red)]" aria-hidden />}
                      action={<Link to="/news-events?tab=media" className="kk-focus text-sm font-semibold text-[var(--kk-blue)] hover:underline underline-offset-4">{t("fighters.videoLibrary")}</Link>}
                    >
                      <ul className="grid sm:grid-cols-2 gap-4">
                        {videos.map((v) => (
                          <li key={v.id}>
                            <button type="button" onClick={() => setPlaying(v)} className="kk-focus group w-full text-left rounded-2xl border border-gray-200 bg-white overflow-hidden hover:shadow-md transition">
                              <div className="relative aspect-video bg-gray-900">
                                {v.thumbnail && <img src={v.thumbnail} alt="" loading="lazy" className="w-full h-full object-cover" />}
                                <span className="absolute inset-0 flex items-center justify-center">
                                  <span className="w-12 h-12 rounded-full bg-white/95 flex items-center justify-center shadow group-hover:scale-110 transition"><Play className="w-5 h-5 text-gray-900 ml-0.5" fill="currentColor" aria-hidden /></span>
                                </span>
                                {v.duration && <span className="absolute bottom-2 right-2 bg-black/70 text-white text-xs font-semibold px-2 py-0.5 rounded">{v.duration}</span>}
                              </div>
                              <div className="p-4">
                                <p lang={textLang(v.title)} className="font-bold text-gray-900 leading-snug line-clamp-2 group-hover:text-[var(--kk-blue)]">{v.title}</p>
                                {v.date && <p className="text-xs text-gray-500 mt-1">{formatDate(v.date)}</p>}
                              </div>
                            </button>
                          </li>
                        ))}
                      </ul>
                    </Section>
                  )}

                  {view.teammates.length > 0 && data && (
                    <Section
                      title={t("fighters.teammates")}
                      icon={<Users className="w-5 h-5 text-[var(--kk-blue)]" aria-hidden />}
                      action={view.clubId && <Link to={partnerPath("club", { id: view.clubId, name: fighter.clubName || fighter.club_name })} className="kk-focus text-sm font-semibold text-[var(--kk-blue)] hover:underline underline-offset-4">{t("fighterPage.clubPage")}</Link>}
                    >
                      <ul className="grid sm:grid-cols-2 xl:grid-cols-3 gap-4">
                        {view.teammates.map((f: any) => <li key={f.id}><FighterCard f={f} data={data} titles={currentTitles(data).get(f.id) ?? []} /></li>)}
                      </ul>
                    </Section>
                  )}
                </div>

                <aside className="space-y-4 lg:sticky lg:top-24">
                  <SideCard title={t("fighterPage.profile")}>
                    {(fighter.clubName || fighter.club_name) && <DetailRow icon={<Building2 className={iconCls} />} label={t("fighters.club")}><span lang={textLang(fighter.clubName)}>{fighter.clubName || fighter.club_name}</span></DetailRow>}
                    {view.wc && <DetailRow icon={<Shield className={iconCls} />} label={t("fighterPage.weightClass")}>{localName(view.wc.name, view.wc.name_khmer)}</DetailRow>}
                    {view.weightKg && <DetailRow icon={<Scale className={iconCls} />} label={t("fighters.weight")}>{formatWeight(view.weightKg)}</DetailRow>}
                    {view.height && <DetailRow icon={<Ruler className={iconCls} />} label={t("fighters.height")}>{`${formatNumber(view.height)} cm${lang === "en" ? ` (${Math.floor(view.height / 2.54 / 12)}′${Math.round((view.height / 2.54) % 12)}″)` : ""}`}</DetailRow>}
                    {view.age != null && <DetailRow icon={<CalendarDays className={iconCls} />} label={t("fighters.age")}>{t("fighterPage.age", { n: formatNumber(view.age) })}</DetailRow>}
                    {fighter.province && <DetailRow icon={<MapPin className={iconCls} />} label={t("fighterPage.province")}><span lang={textLang(fighter.province)}>{fighter.province}</span></DetailRow>}
                    {view.nationality && <DetailRow icon={<Flag className={iconCls} />} label={t("fighterPage.nationality")}>{nationalityLabel(t, view.nationality)}</DetailRow>}
                    {view.styles.length > 0 && <DetailRow icon={<Flame className={iconCls} />} label={t("fighters.style")}><span>{view.styles.map((s: string) => styleLabel(t, s)).join(", ")}</span></DetailRow>}
                    {fighter.stance && <DetailRow icon={<User className={iconCls} />} label={t("fighters.stance")}>{fighter.stance}</DetailRow>}
                  </SideCard>
                  <HubAskAbout
                    questions={[
                      t("hub.askFighterRecent", { name }),
                      t("hub.askFighterNext", { name }),
                      ...((fighter.clubName || fighter.club_name) ? [t("hub.askFighterClub", { club: fighter.clubName || fighter.club_name })] : []),
                    ]}
                  />
                </aside>
              </div>
            </div>
          </>
        )}
      </main>

      {playing && (
        <div role="dialog" aria-modal="true" aria-label={playing.title} className="fixed inset-0 bg-gray-950/90 z-50 flex items-center justify-center p-4" onClick={() => setPlaying(null)}>
          <div className="relative w-full max-w-5xl" onClick={(e) => e.stopPropagation()}>
            <button type="button" onClick={() => setPlaying(null)} className="kk-focus absolute -top-12 right-0 inline-flex items-center gap-1.5 px-4 h-10 bg-white/10 hover:bg-white/20 text-white text-sm font-semibold rounded-xl">
              {t("partners.close")} <X className="w-4 h-4" aria-hidden />
            </button>
            <div className="aspect-video bg-black rounded-2xl overflow-hidden">
              {playing.youtubeId ? (
                <iframe className="w-full h-full" src={`https://www.youtube.com/embed/${playing.youtubeId}?autoplay=1`} title={playing.title} allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen />
              ) : (
                <p className="w-full h-full flex items-center justify-center text-white/80 text-sm px-6 text-center">{t("news.videoUnavailable")}</p>
              )}
            </div>
            <p lang={textLang(playing.title)} className="mt-4 text-lg font-bold text-white">{playing.title}</p>
          </div>
        </div>
      )}

      <SiteFooter />
    </div>
  );
}

/** No photo from the federation: the fighter's initials on a brand background (never someone else's photo). */
function NoPhoto({ name }: { name?: string }) {
  const initials = (name || "?").split(/\s+/).filter(Boolean).slice(0, 2).map((w) => w[0]).join("").toUpperCase();
  return (
    <div aria-hidden className="w-full h-full flex items-center justify-center bg-gradient-to-br from-[#1a4797] to-[#24336f] text-white/80 font-black text-7xl">
      {initials}
    </div>
  );
}
