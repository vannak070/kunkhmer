/**
 * Shell for the fan site's main sections at "/" and "/:section": Home, Matches & Events, News &
 * Media, Fighters and Partners, plus the shared video player. Each section is its own component;
 * this file only loads the lists they share and switches between them. Unknown sections show
 * "Page not found". (The old shop, cart, match-detail and partner-detail views were removed in
 * step 1 — see claude/updates/public-step1-links-honesty-cleanup.md.)
 */
import { Suspense, lazy, useEffect, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router";
import { Calendar, X } from "lucide-react";
import type { NewsItem, VideoItem } from "./NewsAndMedia";
import { Loading } from "../components/LoadError";
import { FightersDirectory } from "./FightersDirectory";
import { NotFoundContent } from "./NotFound";
import HomePage, { type HomeEvent, type HomeFighter } from "../components/home/HomePage";
import { SiteHeader } from "../components/layout/SiteHeader";
import { SiteFooter } from "../components/layout/SiteFooter";
import { api } from "../utils/api";
import { usePageMeta } from "../hooks/usePageTitle";
import { useI18n } from "../i18n/LanguageContext";
import { partnerPath } from "../data/partners";
import { articleTextFrom, articleVersion } from "../data/news";
import { formatVideoDuration, formatViews } from "../utils/publicDisplay";
import { eventPathById } from "../data/links";

// Sections other than Home and Fighters (the home page reuses the fighter card) load on demand.
const MatchesAndEvents = lazy(() => import("./MatchesAndEvents").then((m) => ({ default: m.MatchesAndEvents })));
const NewsAndMedia = lazy(() => import("./NewsAndMedia").then((m) => ({ default: m.NewsAndMedia })));
const Partners = lazy(() => import("./Partners").then((m) => ({ default: m.Partners })));

const SECTIONS = ["home", "news-events", "fighters", "matches", "strategic-partners"] as const;
type Section = (typeof SECTIONS)[number];

/** YouTube id from a watch / share / embed link; empty when it can't be read (the player then says so). */
function youtubeIdOf(url?: string | null): string {
  const match = url?.match(/^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/);
  return match && match[2].length === 11 ? match[2] : "";
}

const byDateDesc = (a: { date?: string }, b: { date?: string }) => new Date(b.date || 0).getTime() - new Date(a.date || 0).getTime();

export function SuperAppHome() {
  const { t, lang, formatDate } = useI18n();
  const params = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const section = (params.section ?? "home") as Section;
  const known = (SECTIONS as readonly string[]).includes(section);

  // ─── Shared lists ──────────────────────────────────────────────────────────
  const [fighters, setFighters] = useState<any[]>([]);
  const [events, setEvents] = useState<any[]>([]);
  const [news, setNews] = useState<NewsItem[]>([]);
  const [videos, setVideos] = useState<VideoItem[]>([]);
  const [loadingNews, setLoadingNews] = useState(true);
  const [clubs, setClubs] = useState<any[]>([]);
  const [broadcasters, setBroadcasters] = useState<any[]>([]);
  const [sponsors, setSponsors] = useState<any[]>([]);
  const [organizations, setOrganizations] = useState<any[]>([]);
  const [loadingPartners, setLoadingPartners] = useState(true);
  const [selectedVideo, setSelectedVideo] = useState<VideoItem | null>(null);

  useEffect(() => {
    const warn = (what: string) => (err: unknown) => console.error(`Failed to load ${what}:`, err);
    api.fighters.list().then((d: any[]) => setFighters(d || [])).catch(warn("fighters"));
    api.events.list().then((d: any[]) => setEvents((d || []).filter((e) => e.status !== "Draft"))).catch(warn("events"));

    Promise.all([
      api.news.list().then((d: any[]) =>
        setNews(
          (d || [])
            .map((a) => ({
              id: a.id,
              title: a.title,
              excerpt: a.subtitle || "",
              image: a.featured_image || a.featuredImage || null,
              category: a.category || "General",
              date: a.publish_date || a.publishDate || "",
              featured: Boolean(a.featured),
              content: a.content || "",
              ...articleTextFrom(a),
            }))
            .sort(byDateDesc),
        ),
      ),
      api.videos.list().then((d: any[]) =>
        setVideos(
          (d || [])
            .map((v) => ({
              id: v.id,
              title: v.title,
              thumbnail: v.thumbnail || null,
              duration: formatVideoDuration(v.duration),
              views: formatViews(v.views),
              date: v.created_at || "",
              youtubeId: youtubeIdOf(v.youtube_url || v.youtubeUrl),
              category: v.category || "Highlights",
              fighterId: v.fighter_id || v.fighterId || "",
            }))
            .sort(byDateDesc),
        ),
      ),
    ])
      .catch(warn("news and videos"))
      .finally(() => setLoadingNews(false));

    Promise.all([
      api.clubs.list().then((d: any[]) => setClubs(d || [])),
      api.settings.listBroadcastStations().then((d: any[]) => setBroadcasters(d || [])),
      api.settings.listSponsors().then((d: any[]) => setSponsors(d || [])),
    ])
      .catch(warn("partners"))
      .finally(() => setLoadingPartners(false));
    // International partners load on their own so an error there never hides the other partners.
    api.settings.listPartnerOrganizations().then((d: any[]) => setOrganizations(d || [])).catch(warn("international partners"));
  }, []);

  // Old links: /matches?event=<id> → the event page.
  useEffect(() => {
    if (section !== "matches") return;
    const q = new URLSearchParams(location.search);
    const eventId = q.get("event") || q.get("eventId");
    if (eventId) navigate(`/events/${eventId}`, { replace: true });
  }, [section, location.search]);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [section]);

  // Title + description per section, for search results and shared links.
  const META: Partial<Record<Section, { title: string; description: string }>> = {
    matches: { title: t("nav.matches"), description: t("meta.matches") },
    "news-events": { title: t("nav.news"), description: t("meta.news") },
    fighters: { title: t("nav.fighters"), description: t("meta.fighters") },
    "strategic-partners": { title: t("nav.partners"), description: t("meta.partners") },
  };
  const meta = known ? META[section] : { title: t("notFound.title"), description: t("notFound.text") };
  usePageMeta({ title: meta?.title ?? null, description: meta?.description ?? null });

  const go = (s: string) => navigate(s === "home" ? "/" : `/${s}`);

  // ─── Home page data ───────────────────────────────────────────────────────
  const today = new Date().setHours(0, 0, 0, 0);
  const homeEvents: HomeEvent[] = events.map((e) => ({
    id: e.id,
    name: e.name,
    date: e.date,
    venue: e.location || "",
    image: e.image || "",
    station: e.broadcast_station_name || "",
    description: e.description || "",
  }));
  const upcomingEvents = homeEvents.filter((e) => !e.date || new Date(e.date).getTime() >= today).sort((a, b) => +new Date(a.date) - +new Date(b.date));
  const pastEvents = homeEvents.filter((e) => e.date && new Date(e.date).getTime() < today).sort((a, b) => +new Date(b.date) - +new Date(a.date));
  const homeFighters: HomeFighter[] = fighters.map((f) => {
    const [w, l, d] = String(f.record || "0-0-0").split("-").map((n) => parseInt(n) || 0);
    return { id: f.id, name: f.name, nameKhmer: f.nameKhmer || f.name_khmer || "", image: f.image || "", wins: w || 0, losses: l || 0, draws: d || 0 };
  });

  const byId = (rows: any[], id: string) => rows.find((r) => r.id === id) ?? { id };
  // English site: the English version of an article when there is one.
  const localNews: NewsItem[] = news.map((a) => {
    const v = articleVersion(a as any, lang);
    return { ...a, title: v.title, excerpt: v.excerpt, content: v.content };
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <SiteHeader activeSection={known ? section : null} onSectionChange={(s) => go(s)} />

      {section === "home" && (
        <HomePage
          articles={localNews.map((a) => ({ ...a, image: a.image || "" }))}
          upcomingEvents={upcomingEvents}
          pastEvents={pastEvents}
          fighters={homeFighters}
          videos={videos.map((v) => ({ ...v, thumbnail: v.thumbnail || "" }))}
          sponsors={sponsors}
          organizations={organizations}
          onOpenEvent={(id) => navigate(eventPathById(events, id))}
          onPlayVideo={(id) => setSelectedVideo(videos.find((v) => v.id === id) ?? null)}
          onNavigate={(s) => go(s)}
        />
      )}

      {section !== "home" && (
        <main className="max-w-7xl mx-auto px-4 md:px-6 py-8 md:py-12">
          <Suspense fallback={<Loading />}>
          {section === "news-events" && <NewsAndMedia articles={localNews} videos={videos} fighters={fighters} loading={loadingNews} />}
          {section === "fighters" && <FightersDirectory />}
          {section === "matches" && <MatchesAndEvents />}
          {section === "strategic-partners" && (
            <Partners
              clubs={clubs}
              broadcasters={broadcasters}
              sponsors={sponsors}
              organizations={organizations}
              events={events}
              loading={loadingPartners}
              onOpenClub={(id) => navigate(partnerPath("club", byId(clubs, id)))}
              onOpenBroadcaster={(id) => navigate(partnerPath("broadcaster", byId(broadcasters, id)))}
              onOpenSponsor={(id) => navigate(partnerPath("sponsor", byId(sponsors, id)))}
            />
          )}
          {!known && <NotFoundContent />}
          </Suspense>
        </main>
      )}

      <SiteFooter flush={section === "home"} onSectionChange={(s) => go(s)} />

      {selectedVideo && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={selectedVideo.title}
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-sm p-4"
          onClick={() => setSelectedVideo(null)}
        >
          <div className="relative w-full max-w-5xl bg-gray-900 rounded-2xl overflow-hidden shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <button
              type="button"
              onClick={() => setSelectedVideo(null)}
              aria-label={t("partners.close")}
              className="kk-focus absolute top-4 right-4 z-10 w-10 h-10 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center border border-white/20"
            >
              <X className="w-5 h-5 text-white" aria-hidden />
            </button>
            <div className="bg-gradient-to-r from-gray-900 to-gray-800 px-6 py-4 border-b border-white/10">
              <h3 className="text-xl font-black text-white pr-12">{selectedVideo.title}</h3>
              {selectedVideo.date && (
                <p className="flex items-center gap-2 mt-2 text-sm text-gray-400">
                  <Calendar className="w-4 h-4" aria-hidden />
                  <span className="font-semibold">{formatDate(selectedVideo.date)}</span>
                </p>
              )}
            </div>
            <div className="relative aspect-video bg-black">
              {selectedVideo.youtubeId ? (
                <iframe
                  src={`https://www.youtube.com/embed/${selectedVideo.youtubeId}?autoplay=1`}
                  title={selectedVideo.title}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  className="absolute inset-0 w-full h-full"
                />
              ) : (
                <p className="absolute inset-0 flex items-center justify-center text-white/80 text-sm px-6 text-center">{t("news.videoUnavailable")}</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
