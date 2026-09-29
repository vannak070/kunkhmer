/**
 * News & Media (/news-events): the federation's stories and videos, in the same light style as
 * Matches & Events. Tabs and the open video are real URLs: ?tab=news (default) | media, and
 * &video=<id> opens the player. See claude/updates/public-news-media-page.md.
 */
import { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router";
import { ArrowRight, BookOpen, Clock, ExternalLink, Newspaper, Play, Search, Sparkles, Star, Video, X } from "lucide-react";
import { readTimeMinutes, textLang } from "../utils/publicDisplay";
import { useI18n } from "../i18n/LanguageContext";
import type { MessageKey } from "../i18n/messages";
import { articlePath } from "../data/links";

type Tab = "news" | "media";

export interface NewsItem {
  id: string;
  title: string;
  excerpt?: string;
  image?: string | null;
  category?: string;
  author?: string | null;
  date?: string;
  featured?: boolean;
  content?: string;
}

export interface VideoItem {
  id: string;
  title: string;
  thumbnail?: string | null;
  duration?: string | null;
  date?: string;
  youtubeId?: string;
  category?: string;
  fighterId?: string;
}

interface FighterOption {
  id: string;
  name: string;
  nameKhmer?: string | null;
}

/** Stock photos used as placeholders elsewhere never stand in for a real picture. */
const isRealImage = (url?: string | null): url is string => Boolean(url) && !url!.includes("images.unsplash.com");
/** The loader leaves youtubeId empty when a video's YouTube link can't be read. */
const playable = (v: VideoItem) => Boolean(v.youtubeId);
const thumbnailFor = (v: VideoItem) => (isRealImage(v.thumbnail) ? v.thumbnail : playable(v) ? `https://i.ytimg.com/vi/${v.youtubeId}/hqdefault.jpg` : null);

/** Category names the admin offers, shown in the site language; anything else is shown as typed. */
export const CATEGORY_KEYS: Record<string, MessageKey> = {
  News: "news.cat.news",
  Events: "news.cat.events",
  Training: "news.cat.training",
  "Fighter Spotlight": "news.cat.spotlight",
  "Official Announcement": "news.cat.announcement",
  Community: "news.cat.community",
  General: "news.cat.general",
  Highlights: "news.cat.highlights",
  "Full Fights": "news.cat.fullFights",
  Interviews: "news.cat.interviews",
  "Behind the Scenes": "news.cat.behindScenes",
  "Training & Workouts": "news.cat.workouts",
  Documentary: "news.cat.documentary",
};

const PAGE = 9;
const time = (d?: string) => new Date(d || 0).getTime();

export function NewsAndMedia({
  articles,
  videos,
  fighters,
  loading,
}: {
  articles: NewsItem[];
  videos: VideoItem[];
  fighters: FighterOption[];
  loading: boolean;
}) {
  const { t, tn, localName } = useI18n();
  const [params, setParams] = useSearchParams();
  const tab: Tab = params.get("tab") === "media" ? "media" : "news";
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("all");
  const [fighter, setFighter] = useState("all");
  const [shown, setShown] = useState(PAGE);

  const catLabel = (c?: string) => (c && CATEGORY_KEYS[c] ? t(CATEGORY_KEYS[c]) : c ?? "");

  const clearFilters = () => {
    setQuery("");
    setCategory("all");
    setFighter("all");
    setShown(PAGE);
  };

  const setTab = (next: Tab) => {
    const p = new URLSearchParams(params);
    if (next === "news") p.delete("tab");
    else p.set("tab", next);
    p.delete("video");
    setParams(p, { replace: true });
    clearFilters();
  };

  const openVideo = (id: string) => {
    const p = new URLSearchParams(params);
    p.set("tab", "media");
    p.set("video", id);
    setParams(p);
  };
  const closeVideo = () => {
    const p = new URLSearchParams(params);
    p.delete("video");
    setParams(p, { replace: true });
  };

  const sortedNews = useMemo(() => [...articles].sort((a, b) => time(b.date) - time(a.date)), [articles]);
  const sortedVideos = useMemo(() => [...videos].sort((a, b) => time(b.date) - time(a.date)), [videos]);
  const list = tab === "news" ? sortedNews : sortedVideos;

  const categories = useMemo(
    () => [...new Set(list.map((x) => x.category).filter((c): c is string => Boolean(c)))].sort(),
    [list],
  );
  const videoFighters = useMemo(() => {
    const ids = new Set(videos.map((v) => v.fighterId).filter(Boolean));
    return fighters.filter((f) => ids.has(f.id)).sort((a, b) => a.name.localeCompare(b.name));
  }, [videos, fighters]);

  const q = query.trim().toLowerCase();
  const filtering = q !== "" || category !== "all" || fighter !== "all";
  const matchesText = (...parts: (string | undefined | null)[]) => !q || parts.some((s) => s?.toLowerCase().includes(q));

  const newsShown = sortedNews.filter((a) => (category === "all" || a.category === category) && matchesText(a.title, a.excerpt));
  const spotlight = !filtering ? sortedNews.find((a) => a.featured) ?? sortedNews[0] : undefined;
  const newsGrid = spotlight ? newsShown.filter((a) => a.id !== spotlight.id) : newsShown;

  const videosShown = sortedVideos.filter((v) => {
    if (category !== "all" && v.category !== category) return false;
    if (fighter !== "all" && v.fighterId !== fighter) return false;
    const f = v.fighterId ? fighters.find((x) => x.id === v.fighterId) : undefined;
    return matchesText(v.title, f?.name, f?.nameKhmer);
  });

  const openId = params.get("video");
  const openVideoItem = openId ? videos.find((v) => v.id === openId) : undefined;

  const tabs: { id: Tab; label: string; count: number; icon: React.ReactNode }[] = [
    { id: "news", label: t("news.tabNews"), count: articles.length, icon: <Newspaper className="w-4 h-4" aria-hidden /> },
    { id: "media", label: t("news.tabMedia"), count: videos.length, icon: <Video className="w-4 h-4" aria-hidden /> },
  ];

  if (loading && articles.length === 0 && videos.length === 0) {
    return (
      <div className="space-y-6" aria-busy="true">
        <div className="h-40 rounded-3xl bg-gradient-to-b from-[#eef3fb] to-white animate-pulse" />
        <div className="h-64 rounded-3xl bg-gray-50 animate-pulse" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#eef3fb] via-white to-[#fdf1f3] border border-[#d5e0f3] px-6 py-8 md:px-10 md:py-10">
        <p className="kk-label text-[var(--kk-red)]">{t("news.eyebrow")}</p>
        <h1 className="kk-heading text-3xl md:text-5xl text-[var(--kk-navy)] mt-1">{t("news.title")}</h1>
        <p className="mt-2 text-base md:text-lg text-gray-600 max-w-2xl">{t("news.lead")}</p>
        {(articles.length > 0 || videos.length > 0) && (
          <div className="mt-6 grid grid-cols-2 gap-2 sm:flex sm:flex-wrap sm:gap-3">
            {articles.length > 0 && <Stat icon={<Newspaper className="w-4 h-4" />} value={articles.length} label={tn("news.statStories", articles.length)} />}
            {videos.length > 0 && <Stat icon={<Video className="w-4 h-4" />} value={videos.length} label={tn("news.statVideos", videos.length)} />}
          </div>
        )}
      </section>

      {/* Tabs + filters */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div role="tablist" aria-label={t("news.title")} className="inline-flex w-full sm:w-auto p-1 rounded-2xl bg-gray-100 overflow-x-auto">
          {tabs.map((x) => (
            <button
              key={x.id}
              type="button"
              role="tab"
              aria-selected={tab === x.id}
              onClick={() => setTab(x.id)}
              className={`kk-focus flex-1 sm:flex-none inline-flex items-center justify-center gap-2 whitespace-nowrap px-4 md:px-5 h-11 rounded-xl text-sm font-semibold transition ${
                tab === x.id ? "bg-white text-[var(--kk-navy)] shadow-sm" : "text-gray-600 hover:text-gray-900"
              }`}
            >
              <span className={tab === x.id ? "text-[var(--kk-blue)]" : "text-gray-400"}>{x.icon}</span>
              {x.label}
              {x.count > 0 && <span className={`text-xs ${tab === x.id ? "text-[var(--kk-blue)]" : "text-gray-400"}`}>{x.count}</span>}
            </button>
          ))}
        </div>
        <div className="flex flex-col sm:flex-row gap-2 w-full lg:w-auto">
          <label className="relative flex-1 lg:w-72">
            <span className="sr-only">{tab === "news" ? t("news.searchNews") : t("news.searchVideos")}</span>
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" aria-hidden />
            <input
              type="search"
              value={query}
              onChange={(e) => { setQuery(e.target.value); setShown(PAGE); }}
              placeholder={tab === "news" ? t("news.searchNews") : t("news.searchVideos")}
              className="kk-focus w-full h-11 pl-9 pr-3 rounded-xl border border-gray-200 bg-white text-sm"
            />
          </label>
          {categories.length > 1 && (
            <label>
              <span className="sr-only">{t("news.category")}</span>
              <select value={category} onChange={(e) => { setCategory(e.target.value); setShown(PAGE); }} className="kk-focus w-full sm:w-auto h-11 px-3 rounded-xl border border-gray-200 bg-white text-sm">
                <option value="all">{t("news.allCategories")}</option>
                {categories.map((c) => <option key={c} value={c}>{catLabel(c)}</option>)}
              </select>
            </label>
          )}
          {tab === "media" && videoFighters.length > 0 && (
            <label>
              <span className="sr-only">{t("news.fighter")}</span>
              <select value={fighter} onChange={(e) => { setFighter(e.target.value); setShown(PAGE); }} className="kk-focus w-full sm:w-auto h-11 px-3 rounded-xl border border-gray-200 bg-white text-sm">
                <option value="all">{t("news.allFighters")}</option>
                {videoFighters.map((f) => <option key={f.id} value={f.id}>{localName(f.name, f.nameKhmer)}</option>)}
              </select>
            </label>
          )}
          {filtering && (
            <button type="button" onClick={clearFilters} className="kk-focus h-11 px-3 rounded-xl text-sm font-semibold text-gray-600 hover:bg-gray-100 inline-flex items-center justify-center gap-1">
              <X className="w-4 h-4" aria-hidden /> {t("common.clearFilters")}
            </button>
          )}
        </div>
      </div>

      {/* News */}
      {tab === "news" && (
        articles.length === 0 ? (
          <Empty icon={<BookOpen className="w-7 h-7" aria-hidden />} title={t("news.noNewsTitle")} text={t("news.noNewsText")} />
        ) : newsShown.length === 0 ? (
          <NoMatch />
        ) : (
          <div className="space-y-8">
            {spotlight && <Spotlight a={spotlight} catLabel={catLabel} />}
            {newsGrid.length > 0 && (
              <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {newsGrid.slice(0, shown).map((a) => <li key={a.id}><NewsCard a={a} catLabel={catLabel} /></li>)}
              </ul>
            )}
            {newsGrid.length > shown && <ShowMore onClick={() => setShown((n) => n + PAGE)} />}
          </div>
        )
      )}

      {/* Videos */}
      {tab === "media" && (
        videos.length === 0 ? (
          <Empty icon={<Video className="w-7 h-7" aria-hidden />} title={t("news.noVideosTitle")} text={t("news.noVideosText")} />
        ) : videosShown.length === 0 ? (
          <NoMatch />
        ) : (
          <div className="space-y-8">
            <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {videosShown.slice(0, shown).map((v) => (
                <li key={v.id}>
                  <VideoCard v={v} catLabel={catLabel} fighter={fighters.find((f) => f.id === v.fighterId)} onPlay={() => openVideo(v.id)} />
                </li>
              ))}
            </ul>
            {videosShown.length > shown && <ShowMore onClick={() => setShown((n) => n + PAGE)} />}
          </div>
        )
      )}

      {openVideoItem && <Player v={openVideoItem} onClose={closeVideo} />}
    </div>
  );
}

// ─── Pieces ──────────────────────────────────────────────────────────────────

function Stat({ icon, value, label }: { icon: React.ReactNode; value: number; label: string }) {
  const { formatNumber } = useI18n();
  return (
    <div className="flex flex-col sm:flex-row sm:items-center gap-0.5 sm:gap-2.5 rounded-2xl bg-white/80 border border-[#d5e0f3] px-3 py-2.5 sm:px-4 min-w-0">
      <span className="hidden sm:flex w-8 h-8 rounded-lg bg-[#eef3fb] text-[var(--kk-blue)] items-center justify-center" aria-hidden>{icon}</span>
      <span className="kk-stat text-xl text-[var(--kk-navy)]">{formatNumber(value)}</span>
      <span className="text-xs sm:text-sm text-gray-600 leading-snug">{label}</span>
    </div>
  );
}

/** A real image, or a light brand block when there is none. */
function Picture({ src, className = "" }: { src?: string | null; className?: string }) {
  return isRealImage(src) ? (
    <img src={src} alt="" loading="lazy" className={className} />
  ) : (
    <span aria-hidden className={`${className} flex items-center justify-center bg-gradient-to-br from-[#eef3fb] to-[#fdf1f3] text-[var(--kk-navy)]/25 kk-display text-3xl`}>KKF</span>
  );
}

function Meta({ a, catLabel }: { a: NewsItem; catLabel: (c?: string) => string }) {
  const { t, formatDate } = useI18n();
  return (
    <p className="text-xs font-semibold text-gray-500 flex flex-wrap items-center gap-x-2 gap-y-1">
      {a.category && <span className="kk-label text-[var(--kk-red)]">{catLabel(a.category)}</span>}
      {a.date && <span>{formatDate(a.date)}</span>}
      {a.content && <span className="inline-flex items-center gap-1"><Clock className="w-3.5 h-3.5" aria-hidden />{t("common.minRead", { n: readTimeMinutes(a.content) })}</span>}
    </p>
  );
}

function Spotlight({ a, catLabel }: { a: NewsItem; catLabel: (c?: string) => string }) {
  const { t } = useI18n();
  return (
    <Link
      to={articlePath(a)}
      className="kk-focus group grid md:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)] rounded-3xl border border-[#d5e0f3] bg-white overflow-hidden shadow-[0_10px_40px_rgba(26,71,151,0.06)] hover:shadow-[0_14px_44px_rgba(26,71,151,0.12)] transition-shadow"
    >
      <div className="aspect-[16/9] md:aspect-auto md:min-h-72 overflow-hidden bg-gray-100">
        <Picture src={a.image} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.03] kk-motion" />
      </div>
      <div className="p-6 md:p-8 flex flex-col gap-3">
        <span className="inline-flex w-fit items-center gap-1.5 rounded-full bg-[#fdf1f3] text-[var(--kk-red)] px-2.5 py-1 text-xs font-bold">
          <Star className="w-3.5 h-3.5 fill-current" aria-hidden />
          {a.featured ? t("news.featured") : t("news.latest")}
        </span>
        <h2 lang={textLang(a.title)} className="kk-heading text-2xl md:text-4xl text-gray-900 leading-tight group-hover:text-[var(--kk-blue)] break-words">{a.title}</h2>
        {a.excerpt && <p lang={textLang(a.excerpt)} className="text-gray-600 line-clamp-3">{a.excerpt}</p>}
        <Meta a={a} catLabel={catLabel} />
        <span className="mt-auto pt-2 inline-flex items-center gap-2 text-sm font-semibold text-[var(--kk-blue)]">
          {t("common.readArticle")} <ArrowRight className="w-4 h-4 transition group-hover:translate-x-0.5" aria-hidden />
        </span>
      </div>
    </Link>
  );
}

function NewsCard({ a, catLabel }: { a: NewsItem; catLabel: (c?: string) => string }) {
  return (
    <Link to={articlePath(a)} className="kk-focus group flex flex-col h-full rounded-2xl border border-gray-200 bg-white overflow-hidden hover:border-[var(--kk-blue)]/40 hover:shadow-md transition">
      <div className="aspect-[16/9] overflow-hidden bg-gray-100">
        <Picture src={a.image} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105 kk-motion" />
      </div>
      <div className="p-4 flex flex-col gap-2 flex-1">
        <Meta a={a} catLabel={catLabel} />
        <h3 lang={textLang(a.title)} className="font-bold text-lg text-gray-900 leading-snug line-clamp-3 group-hover:text-[var(--kk-blue)] break-words">{a.title}</h3>
        {a.excerpt && <p lang={textLang(a.excerpt)} className="text-sm text-gray-600 line-clamp-2">{a.excerpt}</p>}
        <ArrowRight className="mt-auto ml-auto w-4 h-4 text-[var(--kk-blue)] transition group-hover:translate-x-0.5" aria-hidden />
      </div>
    </Link>
  );
}

function VideoCard({ v, fighter, catLabel, onPlay }: { v: VideoItem; fighter?: FighterOption; catLabel: (c?: string) => string; onPlay: () => void }) {
  const { t, formatDate, localName } = useI18n();
  return (
    <button type="button" onClick={onPlay} aria-label={`${t("home.playVideo")}: ${v.title}`} className="kk-focus group w-full h-full text-left flex flex-col rounded-2xl border border-gray-200 bg-white overflow-hidden hover:border-[var(--kk-blue)]/40 hover:shadow-md transition">
      <div className="relative aspect-video overflow-hidden bg-gray-100">
        <Picture src={thumbnailFor(v)} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105 kk-motion" />
        <span className="absolute inset-0 bg-black/10 group-hover:bg-black/0 transition-colors" />
        <span className="absolute inset-0 flex items-center justify-center">
          <span className="w-14 h-14 rounded-full bg-[var(--kk-red)] flex items-center justify-center shadow-lg transition-transform group-hover:scale-110">
            <Play className="w-6 h-6 text-white fill-white ml-0.5" aria-hidden />
          </span>
        </span>
        {v.duration && (
          <span className="absolute bottom-3 right-3 inline-flex items-center gap-1 px-2 py-1 rounded-md bg-black/70 text-white text-xs font-semibold">
            <Clock className="w-3 h-3" aria-hidden />{v.duration}
          </span>
        )}
      </div>
      <div className="p-4 flex flex-col gap-1.5 flex-1">
        <p className="text-xs font-semibold text-gray-500 flex flex-wrap items-center gap-x-2">
          {v.category && <span className="kk-label text-[var(--kk-red)]">{catLabel(v.category)}</span>}
          {v.date && <span>{formatDate(v.date)}</span>}
        </p>
        <h3 lang={textLang(v.title)} className="font-bold text-gray-900 leading-snug line-clamp-2 group-hover:text-[var(--kk-blue)] break-words">{v.title}</h3>
        {fighter && <p className="text-sm text-gray-600">{localName(fighter.name, fighter.nameKhmer)}</p>}
      </div>
    </button>
  );
}

/** The player: opened by ?video=<id>, so the link can be shared and Back closes it. */
function Player({ v, onClose }: { v: VideoItem; onClose: () => void }) {
  const { t, formatDate } = useI18n();
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = overflow;
    };
  }, [onClose]);

  return (
    <div role="dialog" aria-modal="true" aria-label={v.title} className="fixed inset-0 z-[100] flex items-center justify-center bg-[var(--kk-navy)]/70 backdrop-blur-sm p-4" onClick={onClose}>
      <div className="relative w-full max-w-4xl rounded-3xl bg-white overflow-hidden shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-start justify-between gap-4 px-5 py-4 md:px-6">
          <div className="min-w-0">
            <h2 lang={textLang(v.title)} className="kk-heading text-xl md:text-2xl text-gray-900 break-words">{v.title}</h2>
            {v.date && <p className="text-sm text-gray-500 mt-0.5">{formatDate(v.date, "long")}</p>}
          </div>
          <button type="button" onClick={onClose} aria-label={t("news.closeVideo")} className="kk-focus shrink-0 w-10 h-10 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-700 flex items-center justify-center">
            <X className="w-5 h-5" aria-hidden />
          </button>
        </div>
        <div className="relative aspect-video bg-black">
          {playable(v) ? (
            <iframe
              src={`https://www.youtube.com/embed/${v.youtubeId}?autoplay=1`}
              title={v.title}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="absolute inset-0 w-full h-full"
            />
          ) : (
            <p className="absolute inset-0 flex items-center justify-center text-white/80 text-sm px-6 text-center">{t("news.videoUnavailable")}</p>
          )}
        </div>
        {playable(v) && (
          <div className="px-5 py-3 md:px-6 flex justify-end">
            <a href={`https://www.youtube.com/watch?v=${v.youtubeId}`} target="_blank" rel="noopener noreferrer" className="kk-focus inline-flex items-center gap-1.5 text-sm font-semibold text-[var(--kk-blue)] hover:underline underline-offset-4">
              {t("news.watchOnYoutube")} <ExternalLink className="w-4 h-4" aria-hidden />
            </a>
          </div>
        )}
      </div>
    </div>
  );
}

function ShowMore({ onClick }: { onClick: () => void }) {
  const { t } = useI18n();
  return (
    <div className="flex justify-center">
      <button type="button" onClick={onClick} className="kk-focus h-11 px-6 rounded-xl border border-gray-200 bg-white text-sm font-semibold text-gray-700 hover:border-gray-300">
        {t("news.showMore")}
      </button>
    </div>
  );
}

function Empty({ icon, title, text }: { icon: React.ReactNode; title: string; text: string }) {
  const { t } = useI18n();
  return (
    <div className="rounded-3xl border border-dashed border-gray-300 bg-white px-6 py-12 text-center">
      <div className="w-14 h-14 mx-auto rounded-2xl bg-[#eef3fb] text-[var(--kk-blue)] flex items-center justify-center mb-4">{icon}</div>
      <h2 className="kk-heading text-xl text-gray-900">{title}</h2>
      <p className="text-gray-600 mt-1 max-w-md mx-auto">{text}</p>
      <div className="mt-6 flex justify-center">
        <Link to="/hub" className="kk-focus inline-flex items-center gap-2 h-11 px-5 rounded-xl border border-gray-200 bg-white text-sm font-semibold text-gray-700 hover:border-gray-300">
          <Sparkles className="w-4 h-4 text-[var(--kk-blue)]" aria-hidden /> {t("fights.askHub")}
        </Link>
      </div>
    </div>
  );
}

function NoMatch() {
  const { t } = useI18n();
  return (
    <div className="rounded-3xl border border-dashed border-gray-300 bg-white px-6 py-10 text-center">
      <h2 className="kk-heading text-lg text-gray-900">{t("fights.noMatch")}</h2>
      <p className="text-gray-600 mt-1">{t("fights.noMatchText")}</p>
    </div>
  );
}
