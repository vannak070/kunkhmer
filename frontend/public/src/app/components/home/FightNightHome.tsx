/**
 * Home page in the Kun Khmer brand's "Fight Night" style: full-width bands that alternate
 * Fight Night (dark) and Daylight, one job per band. See the brand guideline for the rules.
 */
import { Link } from "react-router";
import { ArrowRight, Calendar, ChevronRight, Clock, MapPin, Play, Swords, Tv } from "lucide-react";
import { useI18n } from "../../i18n/LanguageContext";
import { getFighterSlug } from "../../data/masterData";
import { latestResults, mainEventBout, useFanData, type Bout } from "../../data/fanData";
import { CountdownChip, DemoBanner, FormGuide, ResultRow } from "../fan/FanWidgets";
import { fightHistory } from "../../data/fanData";
import SponsorsSection from "./SponsorsSection";
import { SOCIAL_LINKS } from "../layout/SiteFooter";
import { textLang } from "../../utils/publicDisplay";

export interface HomeArticle {
  id: string;
  title: string;
  excerpt?: string;
  image: string;
  category?: string;
  date?: string;
}

export interface HomeEvent {
  id: string;
  name: string;
  date: string;
  venue: string;
  image: string;
  station?: string;
  description?: string;
}

export interface HomeFighter {
  id: string;
  name: string;
  nameKhmer?: string;
  image: string;
  gym?: string;
  weight?: string;
  wins: number;
  losses: number;
  draws: number;
}

export interface HomeVideo {
  id: string;
  title: string;
  thumbnail: string;
  date?: string;
  duration?: string | null;
}

interface FightNightHomeProps {
  articles: HomeArticle[];
  upcomingEvents: HomeEvent[];
  pastEvents: HomeEvent[];
  fighters: HomeFighter[];
  videos: HomeVideo[];
  sponsors: any[];
  onOpenEvent: (id: string) => void;
  onPlayVideo: (id: string) => void;
  onNavigate: (section: "matches" | "fighters" | "news-events" | "strategic-partners") => void;
}

/** Container used inside every band. */
function Band({ tone, children, className = "", label }: { tone: "night" | "day"; children: React.ReactNode; className?: string; label?: string }) {
  return (
    <section aria-label={label} className={`${tone === "night" ? "kk-night" : "bg-gray-50 text-gray-900"} ${className}`}>
      <div className="max-w-7xl mx-auto px-4 md:px-6 py-12 md:py-16">{children}</div>
    </section>
  );
}

function SectionHead({ title, action, tone }: { title: string; action?: { label: string; onClick: () => void }; tone: "night" | "day" }) {
  return (
    <div className="flex items-end justify-between gap-4 mb-6 md:mb-8">
      <h2 className="kk-heading text-3xl md:text-5xl">{title}</h2>
      {action && (
        <button
          type="button"
          onClick={action.onClick}
          className={`kk-focus shrink-0 inline-flex items-center gap-1 text-sm font-semibold hover:underline underline-offset-4 ${
            tone === "night" ? "text-[var(--kk-night-accent)]" : "text-[var(--kk-blue)]"
          }`}
        >
          {action.label}
          <ChevronRight className="w-4 h-4" aria-hidden />
        </button>
      )}
    </div>
  );
}

// ─── 1. Top stories ─────────────────────────────────────────────────────────

function StoryCard({ a, big }: { a: HomeArticle; big?: boolean }) {
  const { formatDate } = useI18n();
  return (
    <Link
      to={`/article/${a.id}`}
      className="kk-focus group relative block overflow-hidden rounded-2xl bg-[var(--kk-night-raised)] h-full min-h-[220px]"
    >
      <img src={a.image} alt="" className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105 kk-motion" />
      <div className="absolute inset-0 bg-gradient-to-t from-[var(--kk-night)] via-[var(--kk-night)]/60 to-transparent" />
      <div className={`relative h-full flex flex-col justify-end ${big ? "p-6 md:p-8" : "p-5"}`}>
        {(a.category || a.date) && (
          <p className="kk-label text-[var(--kk-gold)] mb-2">
            {[a.category, formatDate(a.date)].filter(Boolean).join(" · ")}
          </p>
        )}
        <h3 lang={textLang(a.title)} className={`kk-heading text-white ${big ? "text-3xl md:text-5xl" : "text-xl md:text-2xl"} line-clamp-3`}>{a.title}</h3>
        {big && a.excerpt && <p lang={textLang(a.excerpt)} className="mt-3 text-[var(--kk-night-muted)] line-clamp-2 max-w-2xl">{a.excerpt}</p>}
      </div>
    </Link>
  );
}

function TopStories({ articles }: { articles: HomeArticle[] }) {
  const { t } = useI18n();
  const [lead, ...rest] = articles;
  const side = rest.slice(0, 2);
  return (
    <section aria-label={t("home.topStories")} className="kk-night">
      <div className="max-w-7xl mx-auto px-4 md:px-6 pt-8 md:pt-10 pb-10 md:pb-12">
        <div className={`grid gap-4 ${side.length ? "lg:grid-cols-3" : ""}`}>
          <div className={`${side.length ? "lg:col-span-2" : ""} min-h-[320px] md:min-h-[440px]`}>
            <StoryCard a={lead} big />
          </div>
          {side.length > 0 && (
            <div className={`grid gap-4 ${side.length === 2 ? "grid-rows-2" : ""}`}>
              {side.map((a) => <StoryCard key={a.id} a={a} />)}
            </div>
          )}
        </div>
      </div>
      <div className="kk-ropes" aria-hidden><span /><span /><span /></div>
    </section>
  );
}

// ─── 2. Next fight night ────────────────────────────────────────────────────

function NextFightNight({ event, upcoming, bouts, onOpenEvent, onAllEvents }: {
  event: HomeEvent | undefined;
  upcoming: boolean;
  bouts: Bout[];
  onOpenEvent: (id: string) => void;
  onAllEvents: () => void;
}) {
  const { t, formatDate, localName } = useI18n();
  if (!event) {
    return (
      <Band tone="day" label={t("home.nextFightNight")}>
        <p className="kk-label text-[var(--kk-red)] mb-2">{t("home.nextFightNight")}</p>
        <p className="text-lg text-gray-600">{t("home.noEventYet")}</p>
      </Band>
    );
  }
  const main = mainEventBout(bouts.filter((b) => b.eventId === event.id).sort((a, b) => a.sortOrder - b.sortOrder));
  return (
    <Band tone="day" label={t(upcoming ? "home.nextFightNight" : "home.lastFightNight")}>
      <div className="grid md:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] gap-8 md:gap-12 items-center">
        <button type="button" onClick={() => onOpenEvent(event.id)} className="kk-focus block rounded-2xl overflow-hidden bg-[var(--kk-navy)] shadow-xl">
          <img src={event.image} alt={event.name} className="w-full h-auto max-h-[560px] object-contain mx-auto" />
        </button>
        <div>
          <p className="kk-label text-[var(--kk-red)] mb-3">{t(upcoming ? "home.nextFightNight" : "home.lastFightNight")}</p>
          <h2 lang={textLang(event.name)} className="kk-display text-5xl md:text-7xl text-gray-900 mb-5 break-words">{event.name}</h2>
          <ul className="space-y-2 text-gray-700 mb-6">
            <li className="flex items-center gap-2"><Calendar className="w-4 h-4 text-[var(--kk-blue)]" aria-hidden />{formatDate(event.date, "long")}</li>
            <li className="flex items-center gap-2"><MapPin className="w-4 h-4 text-[var(--kk-blue)]" aria-hidden />{event.venue}</li>
            {event.station && <li className="flex items-center gap-2"><Tv className="w-4 h-4 text-[var(--kk-blue)]" aria-hidden />{t("home.broadcastOn", { name: event.station })}</li>}
          </ul>
          {upcoming && <CountdownChip date={event.date} className="mb-6" />}

          {main && (
            <Link
              to={`/compare?red=${getFighterSlug(main.fighterA)}&blue=${getFighterSlug(main.fighterB)}`}
              className="kk-focus group flex items-center gap-4 p-4 mb-6 rounded-2xl bg-white border border-gray-200 hover:border-[var(--kk-blue)] transition-colors"
            >
              <img src={main.fighterA.image} alt="" className="w-12 h-12 rounded-full object-cover border-2 border-[var(--kk-red)]" />
              <div className="min-w-0 flex-1">
                <p className="kk-label text-gray-500">{t("matches.mainEvent")}</p>
                <p className="font-bold text-gray-900 truncate">
                  {t("home.mainEventVs", { red: localName(main.fighterA.name, main.fighterA.nameKhmer), blue: localName(main.fighterB.name, main.fighterB.nameKhmer) })}
                </p>
              </div>
              <img src={main.fighterB.image} alt="" className="w-12 h-12 rounded-full object-cover border-2 border-[var(--kk-blue)]" />
              <Swords className="w-5 h-5 text-[var(--kk-blue)] shrink-0 hidden sm:block" aria-label={t("matchup.preview")} />
            </Link>
          )}

          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={() => onOpenEvent(event.id)}
              className="kk-focus inline-flex items-center gap-2 min-h-11 px-6 rounded-xl bg-[var(--kk-red)] hover:bg-[#9e1a2c] text-white font-semibold transition-colors"
            >
              {t(upcoming ? "home.viewFightCard" : "matches.tabResults")}
              <ArrowRight className="w-4 h-4" aria-hidden />
            </button>
            <button
              type="button"
              onClick={onAllEvents}
              className="kk-focus inline-flex items-center min-h-11 px-6 rounded-xl border border-[#7c85a3] text-gray-900 font-semibold hover:border-[var(--kk-blue)] transition-colors"
            >
              {t("home.allEvents")}
            </button>
          </div>
        </div>
      </div>
    </Band>
  );
}

// ─── 3. Featured fighters (Fight Night) ─────────────────────────────────────

function FighterCard({ f, form }: { f: HomeFighter; form: ReturnType<typeof fightHistory> }) {
  const { t, localName, formatWeight } = useI18n();
  const total = f.wins + f.losses + f.draws;
  return (
    <Link
      to={`/fighters/${getFighterSlug(f)}`}
      className="kk-focus group flex flex-col rounded-2xl overflow-hidden bg-[var(--kk-night-raised)] border border-[var(--kk-night-border)] hover:border-[var(--kk-night-accent)] transition-colors"
    >
      <div className="relative aspect-[4/5] overflow-hidden bg-[var(--kk-night-sunken)]">
        <img src={f.image} alt="" className="w-full h-full object-cover object-top transition-transform duration-500 group-hover:scale-105 kk-motion" />
        <div className="absolute inset-0 bg-gradient-to-t from-[var(--kk-night-raised)] via-transparent to-transparent" />
      </div>
      <div className="p-5 -mt-12 relative">
        <h3 className="kk-heading text-2xl md:text-3xl text-white">{localName(f.name, f.nameKhmer)}</h3>
        <p className="text-sm text-[var(--kk-night-muted)] truncate">{[f.gym, formatWeight(f.weight)].filter(Boolean).join(" · ")}</p>
        <div className="mt-4 flex items-end justify-between gap-3">
          <p className="kk-stat text-3xl text-white">
            {f.wins}-{f.losses}-{f.draws}
            <span className="kk-label ml-2 text-[var(--kk-night-muted)] align-middle">{t("common.wld")}</span>
          </p>
          {total > 0 && <span className="text-sm font-semibold text-[var(--kk-night-muted)]">{Math.round((f.wins / total) * 100)}%</span>}
        </div>
        {form.length > 0 && <div className="mt-3"><FormGuide form={form.slice(0, 5).map((h) => h.outcome)} /></div>}
      </div>
    </Link>
  );
}

// ─── 5. Videos (Fight Night) ────────────────────────────────────────────────

function VideoCard({ v, onPlay }: { v: HomeVideo; onPlay: () => void }) {
  const { t, formatDate } = useI18n();
  return (
    <button type="button" onClick={onPlay} aria-label={`${t("home.playVideo")}: ${v.title}`} className="kk-focus group text-left">
      <div className="relative aspect-video rounded-2xl overflow-hidden bg-[var(--kk-night-raised)]">
        <img src={v.thumbnail} alt="" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105 kk-motion" />
        <div className="absolute inset-0 bg-black/25 group-hover:bg-black/10 transition-colors" />
        <span className="absolute inset-0 flex items-center justify-center">
          <span className="w-14 h-14 rounded-full bg-[var(--kk-red)] flex items-center justify-center shadow-lg">
            <Play className="w-6 h-6 text-white fill-white ml-0.5" aria-hidden />
          </span>
        </span>
        {v.duration && (
          <span className="absolute bottom-3 right-3 inline-flex items-center gap-1 px-2 py-1 rounded-md bg-black/70 text-white text-xs font-semibold">
            <Clock className="w-3 h-3" aria-hidden />{v.duration}
          </span>
        )}
      </div>
      <h3 lang={textLang(v.title)} className="mt-3 font-semibold text-white line-clamp-2 group-hover:underline underline-offset-4">{v.title}</h3>
      {v.date && <p className="text-sm text-[var(--kk-night-muted)]">{formatDate(v.date)}</p>}
    </button>
  );
}

// ─── Page ───────────────────────────────────────────────────────────────────

export default function FightNightHome(props: FightNightHomeProps) {
  const { articles, upcomingEvents, pastEvents, fighters, videos, sponsors, onOpenEvent, onPlayVideo, onNavigate } = props;
  const { t, formatDate } = useI18n();
  const fan = useFanData();

  const nextEvent = upcomingEvents[0] ?? pastEvents[0];
  const isUpcoming = Boolean(upcomingEvents[0]);
  const results = fan ? latestResults(fan, 4) : [];
  // Most experienced fighters first; the brand shows records, not popularity.
  const featured = [...fighters].sort((a, b) => (b.wins + b.losses + b.draws) - (a.wins + a.losses + a.draws)).slice(0, 3);
  // Only stories not already shown at the top; never repeat an article on the page.
  const moreNews = articles.slice(3, 7);
  const socials = SOCIAL_LINKS.filter((s) => s.url);

  return (
    <div>
      {articles.length > 0 ? (
        <TopStories articles={articles.slice(0, 3)} />
      ) : (
        <section className="kk-night">
          <div className="max-w-7xl mx-auto px-4 md:px-6 py-16 md:py-24">
            <h1 className="kk-display text-6xl md:text-8xl text-white">Kun Khmer</h1>
            <p className="mt-4 text-lg text-[var(--kk-night-muted)] max-w-xl">{t("home.tagline")}</p>
          </div>
          <div className="kk-ropes" aria-hidden><span /><span /><span /></div>
        </section>
      )}

      <NextFightNight
        event={nextEvent}
        upcoming={isUpcoming}
        bouts={fan?.bouts ?? []}
        onOpenEvent={onOpenEvent}
        onAllEvents={() => onNavigate("matches")}
      />

      {featured.length > 0 && (
        <Band tone="night" label={t("home.featuredTitle")}>
          <SectionHead title={t("home.featuredTitle")} tone="night" action={{ label: t("common.viewAll"), onClick: () => onNavigate("fighters") }} />
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {featured.map((f) => <FighterCard key={f.id} f={f} form={fan ? fightHistory(fan, f.id) : []} />)}
          </div>
        </Band>
      )}

      {(results.length > 0 || moreNews.length > 0) && (
      <Band tone="day" label={t("home.resultsAndNews")}>
        <div className={`grid gap-10 ${results.length ? "lg:grid-cols-2" : ""}`}>
          {results.length > 0 && (
            <div>
              <SectionHead title={t("results.latest")} tone="day" action={{ label: t("results.viewAll"), onClick: () => onNavigate("matches") }} />
              <DemoBanner show={Boolean(fan?.demo)} />
              <div className="bg-white rounded-2xl border border-gray-200 px-4 md:px-6 divide-y divide-gray-100">
                {results.map((b) => <ResultRow key={b.id} bout={b} />)}
              </div>
            </div>
          )}
          {moreNews.length > 0 && (
            <div>
              <SectionHead title={t("home.newsTitle")} tone="day" action={{ label: t("common.viewAll"), onClick: () => onNavigate("news-events") }} />
              <ul className={`grid gap-4 ${results.length ? "" : "sm:grid-cols-2 lg:grid-cols-4"}`}>
                {moreNews.map((a) => (
                  <li key={a.id}>
                    <Link to={`/article/${a.id}`} className={`kk-focus group flex gap-4 ${results.length ? "items-center" : "flex-col"}`}>
                      <img src={a.image} alt="" className={`rounded-xl object-cover bg-gray-200 ${results.length ? "w-28 h-20 shrink-0" : "w-full aspect-[16/10]"}`} />
                      <div className="min-w-0">
                        <p className="kk-label text-gray-500">{[a.category, formatDate(a.date)].filter(Boolean).join(" · ")}</p>
                        <h3 lang={textLang(a.title)} className="font-semibold text-gray-900 line-clamp-2 group-hover:text-[var(--kk-blue)]">{a.title}</h3>
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </Band>
      )}

      {videos.length > 0 && (
        <Band tone="night" label={t("home.videosTitle")}>
          <SectionHead title={t("home.videosTitle")} tone="night" action={{ label: t("home.viewAllVideos"), onClick: () => onNavigate("news-events") }} />
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {videos.slice(0, 3).map((v) => <VideoCard key={v.id} v={v} onPlay={() => onPlayVideo(v.id)} />)}
          </div>
        </Band>
      )}

      {sponsors.length > 0 && (
        <Band tone="day" label={t("home.partnersTitle")}>
          <SponsorsSection sponsors={sponsors} onViewAllClick={() => onNavigate("strategic-partners")} />
        </Band>
      )}

      <Band tone="night" label={t("home.aboutTitle")}>
        <div className="grid lg:grid-cols-[minmax(0,7fr)_minmax(0,5fr)] gap-10 lg:gap-16 items-start">
          <div>
            <p className="kk-label text-[var(--kk-gold)] mb-4">{t("home.aboutTitle")}</p>
            <h2 className="kk-display text-5xl md:text-7xl text-white">{t("home.manifestoTitle")}</h2>
            <p className="mt-6 text-lg leading-relaxed text-[var(--kk-night-muted)] max-w-2xl">{t("home.manifestoBody")}</p>
            <Link to="/about" className="kk-focus mt-6 inline-flex items-center gap-2 font-semibold text-[var(--kk-night-accent)] hover:underline underline-offset-4">
              {t("home.aboutCta")}
              <ArrowRight className="w-4 h-4" aria-hidden />
            </Link>
          </div>
          {socials.length > 0 && (
            <div className="rounded-2xl bg-[var(--kk-night-raised)] border border-[var(--kk-night-border)] p-6 md:p-8">
              <h2 className="kk-heading text-3xl text-white">{t("home.stayConnected")}</h2>
              <p className="mt-2 text-[var(--kk-night-muted)]">{t("home.stayConnectedText")}</p>
              <ul className="mt-6 space-y-3">
                {socials.map((s) => (
                  <li key={s.label}>
                    <a
                      href={s.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="kk-focus flex items-center gap-3 p-3 rounded-xl bg-[var(--kk-night-sunken)] hover:bg-[var(--kk-night)] border border-[var(--kk-night-border)] transition-colors"
                    >
                      <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24" aria-hidden><path d={s.path} /></svg>
                      <span className="font-semibold text-white">{t("home.followOn", { network: s.label })}</span>
                      <ArrowRight className="w-4 h-4 ml-auto text-[var(--kk-night-muted)]" aria-hidden />
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </Band>
    </div>
  );
}
