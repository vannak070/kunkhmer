/**
 * Public home page: a light hero (welcome + next fight night, official partners strip), then
 * light sections — news, fight nights and results, fighters, videos, a "become a partner"
 * call to action and a newcomer guide (social links live in the footer). Only real data is shown; a section without data is hidden.
 */
import { Link } from "react-router";
import { ArrowRight, Calendar, ChevronRight, Clock, Handshake, MapPin, Music, Play, Swords, Timer, Tv } from "lucide-react";
import { useI18n } from "../../i18n/LanguageContext";
import { getFighterSlug } from "../../data/masterData";
import { fightHistory, latestResults, useFanData, type Broadcaster } from "../../data/fanData";
import { CountdownChip, DemoBanner, FormGuide, ResultRow } from "../fan/FanWidgets";
import { CONTACT_EMAIL } from "../layout/SiteFooter";
import { textLang } from "../../utils/publicDisplay";
import kkfLogo from "../../../assets/kkf-logo-192.png";

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

interface HomePageProps {
  articles: HomeArticle[];
  upcomingEvents: HomeEvent[];
  pastEvents: HomeEvent[];
  fighters: HomeFighter[];
  videos: HomeVideo[];
  /** Raw rows from /settings/sponsors. */
  sponsors: any[];
  onOpenEvent: (id: string) => void;
  onPlayVideo: (id: string) => void;
  onNavigate: (section: "matches" | "fighters" | "news-events" | "strategic-partners") => void;
}

interface Partner {
  id: string;
  name: string;
  logo: string | null;
  url: string | null;
  broadcaster?: boolean;
}

const TIER_ORDER = ["platinum", "gold", "silver", "bronze"];

/** SuperAppHome fills missing images with stock photos; the home page shows only real ones. */
const isRealImage = (url?: string | null): url is string => Boolean(url) && !url!.includes("images.unsplash.com");

/** A real image, or a plain brand block when there is none. */
function Picture({ src, className = "" }: { src?: string | null; className?: string }) {
  return isRealImage(src) ? (
    <img src={src} alt="" className={className} />
  ) : (
    <span aria-hidden className={`${className} flex items-center justify-center bg-[var(--kk-navy)] text-white/30 kk-display text-2xl`}>KKF</span>
  );
}

function toPartners(sponsors: any[], broadcasters: Broadcaster[]): Partner[] {
  const bySponsorTier = sponsors
    .filter((s) => s.active !== false && s.name)
    .sort((a, b) => {
      const rank = (x: any) => {
        const i = TIER_ORDER.indexOf(String(x.tier || "").toLowerCase());
        return i < 0 ? TIER_ORDER.length : i;
      };
      return rank(a) - rank(b);
    })
    .map((s) => ({ id: s.id, name: s.name, logo: s.logo_url || s.logoUrl || null, url: s.website_url || s.websiteUrl || null }));
  const tv = broadcasters.map((b) => ({ id: b.id, name: b.name, logo: b.logo ?? null, url: b.websiteUrl ?? null, broadcaster: true }));
  return [...bySponsorTier, ...tv];
}

// ─── Layout helpers ─────────────────────────────────────────────────────────

function Section({ children, tone = "white", label, className = "" }: { children: React.ReactNode; tone?: "white" | "gray" | "tint"; label?: string; className?: string }) {
  const bg = tone === "gray" ? "bg-gray-50" : tone === "tint" ? "bg-[#eef3fb]" : "bg-white";
  return (
    <section aria-label={label} className={`${bg} ${className}`}>
      <div className="max-w-7xl mx-auto px-4 md:px-6 py-12 md:py-16">{children}</div>
    </section>
  );
}

function SectionHead({ title, kicker, action }: { title: string; kicker?: string; action?: { label: string; onClick: () => void } }) {
  return (
    <div className="flex items-end justify-between gap-4 mb-6 md:mb-8">
      <div>
        {kicker && <p className="kk-label text-[var(--kk-red)] mb-1">{kicker}</p>}
        <h2 className="kk-heading text-3xl md:text-4xl text-gray-900">{title}</h2>
      </div>
      {action && (
        <button
          type="button"
          onClick={action.onClick}
          className="kk-focus shrink-0 inline-flex items-center gap-1 text-sm font-semibold text-[var(--kk-blue)] hover:underline underline-offset-4"
        >
          {action.label}
          <ChevronRight className="w-4 h-4" aria-hidden />
        </button>
      )}
    </div>
  );
}

function PartnerLogo({ p, size = "md" }: { p: Partner; size?: "sm" | "md" }) {
  const box = size === "sm" ? "h-8 w-8" : "h-10 w-10 md:h-12 md:w-12";
  return p.logo ? (
    <img src={p.logo} alt="" className={`${box} rounded-lg object-contain bg-white shrink-0`} />
  ) : (
    <span aria-hidden className={`${box} rounded-lg bg-gray-100 text-gray-500 kk-heading inline-flex items-center justify-center shrink-0`}>
      {p.name.slice(0, 1).toUpperCase()}
    </span>
  );
}

// ─── 1. Hero ────────────────────────────────────────────────────────────────

function HeroEventCard({ event, poster, sponsor, onOpen }: { event: HomeEvent; poster: string | null; sponsor: Partner | null; onOpen: () => void }) {
  const { t, formatDate } = useI18n();
  return (
    <div className="rounded-3xl bg-white text-gray-900 border border-gray-100 shadow-[0_24px_60px_-24px_rgba(36,51,111,0.35)] overflow-hidden">
      {poster && (
        <button type="button" onClick={onOpen} className="kk-focus block w-full bg-[var(--kk-navy)]">
          <img src={poster} alt={event.name} className="w-full max-h-[300px] object-contain mx-auto" />
        </button>
      )}
      <div className="p-5 md:p-6">
        <div className="flex flex-wrap items-center gap-2 mb-2">
          <span className="kk-label text-[var(--kk-red)]">{t("home.nextFightNight")}</span>
          <CountdownChip date={event.date} />
        </div>
        <h2 lang={textLang(event.name)} className="kk-heading text-3xl md:text-4xl break-words">{event.name}</h2>
        <ul className="mt-3 space-y-1.5 text-sm text-gray-600">
          <li className="flex items-center gap-2"><Calendar className="w-4 h-4 text-[var(--kk-blue)] shrink-0" aria-hidden />{formatDate(event.date, "long")}</li>
          <li className="flex items-center gap-2"><MapPin className="w-4 h-4 text-[var(--kk-blue)] shrink-0" aria-hidden /><span lang={textLang(event.venue)}>{event.venue}</span></li>
          {event.station && <li className="flex items-center gap-2"><Tv className="w-4 h-4 text-[var(--kk-blue)] shrink-0" aria-hidden />{t("home.broadcastOn", { name: event.station })}</li>}
        </ul>
        <div className="mt-5 flex flex-wrap items-center justify-between gap-4">
          <button
            type="button"
            onClick={onOpen}
            className="kk-focus inline-flex items-center gap-2 min-h-11 px-5 rounded-xl bg-[var(--kk-red)] hover:bg-[#9e1a2c] text-white font-semibold transition-colors"
          >
            {t("home.viewFightCard")}
            <ArrowRight className="w-4 h-4" aria-hidden />
          </button>
          {sponsor && <PresentedBy sponsor={sponsor} />}
        </div>
      </div>
    </div>
  );
}

export function PresentedBy({ sponsor, tone = "light" }: { sponsor: Partner; tone?: "light" | "dark" }) {
  const { t } = useI18n();
  const body = (
    <>
      <span className={`kk-label ${tone === "dark" ? "text-[var(--kk-night-muted)]" : "text-gray-500"}`}>{t("event.presentedBy")}</span>
      <PartnerLogo p={sponsor} size="sm" />
      <span lang={textLang(sponsor.name)} className={`text-sm font-semibold ${tone === "dark" ? "text-white" : "text-gray-900"}`}>{sponsor.name}</span>
    </>
  );
  return sponsor.url ? (
    <a href={sponsor.url} target="_blank" rel="noopener noreferrer" className="kk-focus inline-flex items-center gap-2 hover:underline underline-offset-4">{body}</a>
  ) : (
    <span className="inline-flex items-center gap-2">{body}</span>
  );
}

function HeroStoryCard({ a }: { a: HomeArticle }) {
  const { t, formatDate } = useI18n();
  return (
    <Link to={`/article/${a.id}`} className="kk-focus group block rounded-3xl bg-white text-gray-900 border border-gray-100 shadow-[0_24px_60px_-24px_rgba(36,51,111,0.35)] overflow-hidden">
      <div className="aspect-[2/1] overflow-hidden bg-gray-200">
        <Picture src={a.image} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105 kk-motion" />
      </div>
      <div className="p-5 md:p-6">
        <p className="kk-label text-[var(--kk-red)] mb-2">{[t("home.latestStory"), formatDate(a.date)].filter(Boolean).join(" · ")}</p>
        <h2 lang={textLang(a.title)} className="kk-heading text-2xl md:text-3xl line-clamp-3 group-hover:text-[var(--kk-blue)]">{a.title}</h2>
        {a.excerpt && <p lang={textLang(a.excerpt)} className="mt-2 text-gray-600 line-clamp-2">{a.excerpt}</p>}
      </div>
    </Link>
  );
}

function Hero({ feature, partners, onNavigate }: { feature: React.ReactNode; partners: Partner[]; onNavigate: HomePageProps["onNavigate"] }) {
  const { t } = useI18n();
  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-[#eef3fb] to-white">
      {/* Soft brand-colour glows; decoration only. */}
      <div aria-hidden className="pointer-events-none absolute -top-32 -right-24 w-[520px] h-[520px] rounded-full bg-[var(--kk-blue)] opacity-[0.08] blur-3xl" />
      <div aria-hidden className="pointer-events-none absolute top-40 -left-32 w-[420px] h-[420px] rounded-full bg-[var(--kk-red)] opacity-[0.06] blur-3xl" />

      <div className="relative max-w-7xl mx-auto px-4 md:px-6 pt-10 md:pt-16 pb-10 md:pb-14">
        <div className={`grid grid-cols-1 gap-10 lg:gap-16 items-center ${feature ? "lg:grid-cols-[minmax(0,6fr)_minmax(0,5fr)]" : ""}`}>
          <div>
            <p className="inline-flex items-center gap-2 rounded-full bg-white border border-[#d5e0f3] shadow-sm pl-1 pr-4 py-1 mb-6">
              <img src={kkfLogo} alt="" className="w-7 h-7 rounded-full" />
              <span className="text-xs sm:text-sm font-semibold text-[var(--kk-blue)]">{t("home.heroKicker")}</span>
            </p>
            <h1 className="kk-display text-5xl sm:text-6xl md:text-7xl text-[var(--kk-navy)]">{t("home.heroTitle")}</h1>
            <p className="mt-5 text-lg text-gray-600 max-w-xl leading-relaxed">{t("home.tagline")}</p>
            <div className="mt-8 flex flex-wrap gap-3">
              <button
                type="button"
                onClick={() => onNavigate("matches")}
                className="kk-focus inline-flex items-center gap-2 min-h-12 px-6 rounded-xl bg-[var(--kk-red)] hover:bg-[#9e1a2c] text-white font-semibold shadow-md shadow-[var(--kk-red)]/20 transition-colors"
              >
                {t("home.ctaEvents")}
                <ArrowRight className="w-4 h-4" aria-hidden />
              </button>
              <button
                type="button"
                onClick={() => onNavigate("fighters")}
                className="kk-focus inline-flex items-center min-h-12 px-6 rounded-xl bg-white border border-gray-300 hover:border-[var(--kk-blue)] text-[var(--kk-navy)] font-semibold transition-colors"
              >
                {t("home.ctaFighters")}
              </button>
            </div>
            <Link to="/about" className="kk-focus mt-6 inline-flex items-center gap-2 text-sm font-semibold text-[var(--kk-blue)] hover:underline underline-offset-4">
              {t("home.newToKunKhmer")} {t("home.aboutCta")}
              <ArrowRight className="w-4 h-4" aria-hidden />
            </Link>
          </div>
          {feature}
        </div>

        {partners.length > 0 && <PartnerStrip partners={partners} />}
      </div>
    </section>
  );
}

// ─── 2. Official partners strip (inside the hero) ───────────────────────────

function PartnerStrip({ partners }: { partners: Partner[] }) {
  const { t } = useI18n();
  return (
    <div role="region" aria-label={t("home.officialPartners")} className="mt-10 md:mt-14 rounded-2xl bg-white border border-gray-200 shadow-sm px-5 py-4 md:px-6 flex flex-col md:flex-row md:items-center gap-3 md:gap-8">
      <p className="kk-label text-gray-500 shrink-0">{t("home.officialPartners")}</p>
      <ul className="grid grid-cols-2 sm:flex sm:flex-wrap items-center gap-x-2 gap-y-1 md:divide-x md:divide-gray-200">
        {partners.map((p) => {
          const body = (
            <>
              <PartnerLogo p={p} />
              <span className="min-w-0 text-left">
                <span lang={textLang(p.name)} className="block font-semibold text-gray-900 leading-tight line-clamp-2 break-words">{p.name}</span>
                {p.broadcaster && <span className="block text-xs text-gray-500 truncate">{t("home.officialBroadcaster")}</span>}
              </span>
            </>
          );
          const cls = "flex items-center gap-2.5 md:gap-3 px-1.5 md:px-5 py-2 rounded-xl min-w-0";
          return (
            <li key={p.id} className="min-w-0 md:first:pl-0">
              {p.url ? (
                <a href={p.url} target="_blank" rel="noopener noreferrer" className={`kk-focus ${cls} hover:bg-gray-50 transition-colors`}>{body}</a>
              ) : (
                <div className={cls}>{body}</div>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}

// ─── 3. News ────────────────────────────────────────────────────────────────

function NewsCard({ a }: { a: HomeArticle }) {
  const { formatDate } = useI18n();
  return (
    <Link to={`/article/${a.id}`} className="kk-focus group flex flex-col bg-white rounded-2xl border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow">
      <div className="aspect-[16/9] overflow-hidden bg-gray-200">
        <Picture src={a.image} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105 kk-motion" />
      </div>
      <div className="p-5">
        <p className="kk-label text-gray-500 mb-2">{[a.category, formatDate(a.date)].filter(Boolean).join(" · ")}</p>
        <h3 lang={textLang(a.title)} className="kk-heading text-xl md:text-2xl text-gray-900 line-clamp-3 group-hover:text-[var(--kk-blue)]">{a.title}</h3>
      </div>
    </Link>
  );
}

function NewsGrid({ articles }: { articles: HomeArticle[] }) {
  const { formatDate } = useI18n();
  // Too few stories for a lead + list: show equal cards so nothing is stretched.
  if (articles.length < 3) {
    return (
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        {articles.map((a) => <NewsCard key={a.id} a={a} />)}
      </div>
    );
  }
  const [lead, ...rest] = articles;
  return (
    <div className="grid grid-cols-1 gap-4">
      <Link to={`/article/${lead.id}`} className="kk-focus group block bg-white rounded-2xl border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow">
        <div className="aspect-[16/9] overflow-hidden bg-gray-200">
          <Picture src={lead.image} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105 kk-motion" />
        </div>
        <div className="p-5 md:p-6">
          <p className="kk-label text-gray-500 mb-2">{[lead.category, formatDate(lead.date)].filter(Boolean).join(" · ")}</p>
          <h3 lang={textLang(lead.title)} className="kk-heading text-2xl md:text-3xl text-gray-900 group-hover:text-[var(--kk-blue)]">{lead.title}</h3>
          {lead.excerpt && <p lang={textLang(lead.excerpt)} className="mt-2 text-gray-600 line-clamp-2">{lead.excerpt}</p>}
        </div>
      </Link>
      {rest.length > 0 && (
        <ul className="grid grid-cols-1 gap-4 content-start">
          {rest.map((a) => (
            <li key={a.id}>
              <Link to={`/article/${a.id}`} className="kk-focus group flex gap-4 items-center bg-white rounded-2xl border border-gray-200 p-3 hover:shadow-md transition-shadow">
                <Picture src={a.image} className="w-28 h-20 md:w-32 md:h-24 rounded-xl object-cover bg-gray-200 shrink-0" />
                <div className="min-w-0">
                  <p className="kk-label text-gray-500">{[a.category, formatDate(a.date)].filter(Boolean).join(" · ")}</p>
                  <h3 lang={textLang(a.title)} className="font-semibold text-gray-900 line-clamp-2 group-hover:text-[var(--kk-blue)]">{a.title}</h3>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

// ─── 4. Fight nights ────────────────────────────────────────────────────────

function EventRow({ event, upcoming, onOpen }: { event: HomeEvent; upcoming: boolean; onOpen: () => void }) {
  const { t, formatDate, lang } = useI18n();
  // Date block: "Jul / 10" in English, "កក្កដា / ១០" in Khmer (short format is "Jul 10, 2026" / "១០ កក្កដា ២០២៦").
  const parts = formatDate(event.date, "short").split(/[\s,]+/);
  const valid = parts.length >= 2 && !isNaN(new Date(event.date).getTime());
  const month = lang === "km" ? parts[1] : parts[0];
  const day = lang === "km" ? parts[0] : parts[1];
  return (
    <li>
      <button type="button" onClick={onOpen} className="kk-focus group w-full flex items-center gap-4 text-left bg-white rounded-2xl border border-gray-200 p-4 hover:border-[var(--kk-blue)] hover:shadow-md transition-all">
        {valid && (
          <span className="w-16 shrink-0 rounded-xl bg-[#eef3fb] text-center py-2">
            <span className="block kk-label text-[var(--kk-blue)] truncate px-1">{month}</span>
            <span className="block kk-stat text-3xl text-gray-900 leading-none">{day}</span>
          </span>
        )}
        <span className="min-w-0 flex-1">
          <span lang={textLang(event.name)} className="block kk-heading text-xl text-gray-900 group-hover:text-[var(--kk-blue)] truncate">{event.name}</span>
          <span className="block text-sm text-gray-600 truncate">{[formatDate(event.date, "long"), event.venue].filter(Boolean).join(" · ")}</span>
          {upcoming && <CountdownChip date={event.date} className="mt-2" />}
        </span>
        <span className="hidden sm:inline-flex items-center gap-1 text-sm font-semibold text-[var(--kk-blue)] shrink-0">
          {t(upcoming ? "home.viewFightCard" : "home.viewEvent")}
          <ChevronRight className="w-4 h-4" aria-hidden />
        </span>
      </button>
    </li>
  );
}

// ─── 5. Fighters ────────────────────────────────────────────────────────────

function FighterCard({ f, form }: { f: HomeFighter; form: ReturnType<typeof fightHistory> }) {
  const { t, localName, formatWeight } = useI18n();
  return (
    <Link to={`/fighters/${getFighterSlug(f)}`} className="kk-focus group flex flex-col bg-white rounded-2xl border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow">
      <div className="aspect-[4/5] overflow-hidden bg-gray-100">
        <Picture src={f.image} className="w-full h-full object-cover object-top transition-transform duration-500 group-hover:scale-105 kk-motion" />
      </div>
      <div className="p-4 md:p-5 flex-1 flex flex-col">
        <h3 className="kk-heading text-2xl text-gray-900 group-hover:text-[var(--kk-blue)]">{localName(f.name, f.nameKhmer)}</h3>
        <p className="text-sm text-gray-500 truncate">{[f.gym, formatWeight(f.weight)].filter(Boolean).join(" · ")}</p>
        <div className="mt-auto pt-4 flex items-end justify-between gap-3">
          <p className="kk-stat text-2xl text-gray-900">
            {f.wins}-{f.losses}-{f.draws}
            <span className="kk-label ml-2 text-gray-400 align-middle">{t("common.wld")}</span>
          </p>
          {form.length > 0 && <FormGuide form={form.slice(0, 5).map((h) => h.outcome)} label={false} />}
        </div>
      </div>
    </Link>
  );
}

// ─── 6. Videos ──────────────────────────────────────────────────────────────

function VideoCard({ v, onPlay }: { v: HomeVideo; onPlay: () => void }) {
  const { t, formatDate } = useI18n();
  return (
    <button type="button" onClick={onPlay} aria-label={`${t("home.playVideo")}: ${v.title}`} className="kk-focus group text-left">
      <div className="relative aspect-video rounded-2xl overflow-hidden bg-gray-200">
        <Picture src={v.thumbnail} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105 kk-motion" />
        <div className="absolute inset-0 bg-black/20 group-hover:bg-black/5 transition-colors" />
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
      <h3 lang={textLang(v.title)} className="mt-3 font-semibold text-gray-900 line-clamp-2 group-hover:text-[var(--kk-blue)]">{v.title}</h3>
      {v.date && <p className="text-sm text-gray-500">{formatDate(v.date)}</p>}
    </button>
  );
}

// ─── 7. Become a partner ────────────────────────────────────────────────────

function BecomePartner({ partners, stats, onViewPartners }: { partners: Partner[]; stats: { label: string; value: number }[]; onViewPartners: () => void }) {
  const { t } = useI18n();
  const mailto = `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(t("home.partnerEmailSubject"))}`;
  const aside = partners.length > 0 || stats.length > 0;
  return (
    <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#eef3fb] via-white to-[#fdf1f3] border border-[#d5e0f3] p-6 sm:p-8 md:p-12">
      <div aria-hidden className="pointer-events-none absolute -top-24 -right-24 w-80 h-80 rounded-full bg-[var(--kk-blue)] opacity-[0.07] blur-3xl" />
      <div className={`relative grid grid-cols-1 gap-10 lg:gap-14 items-center ${aside ? "lg:grid-cols-[minmax(0,6fr)_minmax(0,5fr)]" : ""}`}>
        <div>
          <p className="inline-flex items-center gap-2 rounded-full bg-white border border-[#d5e0f3] px-3 py-1 text-xs font-semibold text-[var(--kk-red)] mb-5">
            <Handshake className="w-4 h-4" aria-hidden />
            {t("home.partnerKicker")}
          </p>
          <h2 className="kk-display text-4xl md:text-6xl text-[var(--kk-navy)]">{t("home.partnerTitle")}</h2>
          <p className="mt-4 text-lg text-gray-600 leading-relaxed max-w-xl">{t("home.partnerText")}</p>
          <div className="mt-8 flex flex-wrap gap-3">
            <a href={mailto} className="kk-focus inline-flex items-center gap-2 min-h-12 px-6 rounded-xl bg-[var(--kk-red)] hover:bg-[#9e1a2c] text-white font-semibold shadow-md shadow-[var(--kk-red)]/20 transition-colors">
              {t("home.partnerCta")}
              <ArrowRight className="w-4 h-4" aria-hidden />
            </a>
            <button type="button" onClick={onViewPartners} className="kk-focus inline-flex items-center min-h-12 px-6 rounded-xl bg-white border border-gray-300 hover:border-[var(--kk-blue)] text-[var(--kk-navy)] font-semibold transition-colors">
              {t("home.viewPartners")}
            </button>
          </div>
        </div>

        {aside && (
          <div className="rounded-2xl bg-white border border-gray-200 shadow-[0_20px_50px_-24px_rgba(36,51,111,0.35)] p-5 md:p-6">
            {partners.length > 0 && (
              <>
                <p className="kk-label text-gray-500 mb-4">{t("home.joinPartners")}</p>
                <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {partners.map((p) => (
                    <li key={p.id} className="flex items-center gap-3 rounded-xl bg-gray-50 border border-gray-100 p-3 min-w-0">
                      <PartnerLogo p={p} />
                      <span className="min-w-0">
                        <span lang={textLang(p.name)} className="block font-semibold text-gray-900 leading-tight line-clamp-2 break-words">{p.name}</span>
                        {p.broadcaster && <span className="block text-xs text-gray-500">{t("home.officialBroadcaster")}</span>}
                      </span>
                    </li>
                  ))}
                </ul>
              </>
            )}
            {stats.length > 0 && (
              <dl className={`grid gap-3 ${partners.length ? "mt-5 pt-5 border-t border-gray-100" : ""} ${stats.length === 3 ? "grid-cols-3" : stats.length === 2 ? "grid-cols-2" : "grid-cols-1"}`}>
                {stats.map((s) => (
                  <div key={s.label} className="text-center">
                    <dd className="kk-stat text-3xl md:text-4xl text-[var(--kk-blue)]">{s.value}</dd>
                    <dt className="mt-1 text-xs font-semibold text-gray-600">{s.label}</dt>
                  </div>
                ))}
              </dl>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── 8. What is Kun Khmer ───────────────────────────────────────────────────

function AboutKunKhmer() {
  const { t } = useI18n();
  const facts = [
    { icon: Timer, title: t("about.quick1Title"), text: t("about.quick1Text") },
    { icon: Swords, title: t("about.quick2Title"), text: t("about.quick2Text") },
    { icon: Music, title: t("about.quick3Title"), text: t("about.quick3Text") },
  ];
  return (
    <div className="grid grid-cols-1 gap-10 lg:gap-16 items-center lg:grid-cols-[minmax(0,6fr)_minmax(0,5fr)]">
      <div>
        <p className="kk-label text-[var(--kk-red)] mb-3">{t("home.aboutTitle")}</p>
        <h2 className="kk-display text-4xl md:text-6xl text-[var(--kk-navy)]">{t("home.manifestoTitle")}</h2>
        <p className="mt-5 text-lg leading-relaxed text-gray-600">{t("home.manifestoBody")}</p>
        <Link to="/about" className="kk-focus mt-8 inline-flex items-center gap-2 min-h-12 px-6 rounded-xl bg-white border border-gray-300 hover:border-[var(--kk-blue)] text-[var(--kk-navy)] font-semibold transition-colors">
          {t("home.aboutCta")}
          <ArrowRight className="w-4 h-4" aria-hidden />
        </Link>
      </div>
      <ul className="grid grid-cols-1 gap-4">
        {facts.map(({ icon: Icon, title, text }) => (
          <li key={title} className="flex items-start gap-4 rounded-2xl bg-white border border-gray-200 p-5 hover:shadow-md transition-shadow">
            <span className="w-12 h-12 rounded-xl bg-[#eef3fb] text-[var(--kk-blue)] flex items-center justify-center shrink-0">
              <Icon className="w-6 h-6" aria-hidden />
            </span>
            <span>
              <span className="block kk-heading text-2xl text-[var(--kk-navy)]">{title}</span>
              <span className="block mt-1 text-sm text-gray-600 leading-relaxed">{text}</span>
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

// ─── Page ───────────────────────────────────────────────────────────────────

export default function HomePage(props: HomePageProps) {
  const { articles, upcomingEvents, pastEvents, fighters, videos, sponsors, onOpenEvent, onPlayVideo, onNavigate } = props;
  const { t } = useI18n();
  const fan = useFanData();

  const partners = toPartners(sponsors, fan?.broadcasters ?? []);
  const rawEvent = (id?: string) => (id ? fan?.events.find((e: any) => e.id === id) : undefined);

  // Hero: the next fight night, otherwise the latest story (which then leaves the news grid).
  const next = upcomingEvents[0];
  const nextRaw = rawEvent(next?.id);
  const mainSponsorId = nextRaw?.main_sponsor_id;
  const nextSponsor = next && nextRaw?.main_sponsor_name
    ? partners.find((p) => p.id === mainSponsorId) ?? { id: mainSponsorId || "main", name: nextRaw.main_sponsor_name, logo: nextRaw.main_sponsor_logo_url || null, url: null }
    : null;
  const heroStory = !next ? articles[0] : undefined;
  const feature = next ? (
    <HeroEventCard event={next} poster={nextRaw?.image || null} sponsor={nextSponsor} onOpen={() => onOpenEvent(next.id)} />
  ) : heroStory ? (
    <HeroStoryCard a={heroStory} />
  ) : null;

  const news = articles.slice(heroStory ? 1 : 0, (heroStory ? 1 : 0) + 3);
  const eventList = upcomingEvents.length > 0 ? upcomingEvents.slice(0, 3) : pastEvents.slice(0, 1);
  const results = fan ? latestResults(fan, 4) : [];
  // Fighters with a real photo first, then the most experienced; records, not popularity.
  const featured = [...fighters]
    .sort((a, b) => Number(isRealImage(b.image)) - Number(isRealImage(a.image)) || (b.wins + b.losses + b.draws) - (a.wins + a.losses + a.draws))
    .slice(0, 4);
  const stats = [
    { label: t("home.statFighters"), value: fighters.length },
    { label: t("home.statEvents"), value: upcomingEvents.length + pastEvents.length },
    { label: t("home.statPartners"), value: partners.length },
  ].filter((s) => s.value >= 10); // small counts undersell the pitch; they appear as the federation grows

  return (
    <div>
      <Hero feature={feature} partners={partners} onNavigate={onNavigate} />

      {(news.length > 0 || eventList.length > 0 || results.length > 0) && (
        <Section tone="gray" label={t("home.resultsAndNews")}>
          <div className={`grid grid-cols-1 gap-10 ${news.length && (eventList.length || results.length) ? "lg:grid-cols-[minmax(0,7fr)_minmax(0,5fr)]" : ""}`}>
            {news.length > 0 && (
              <div className="min-w-0">
                <SectionHead title={t("home.newsTitle")} action={{ label: t("home.viewAllNews"), onClick: () => onNavigate("news-events") }} />
                <NewsGrid articles={news} />
              </div>
            )}
            {(eventList.length > 0 || results.length > 0) && (
              <div className="min-w-0 space-y-10">
                {eventList.length > 0 && (
                  <div>
                    <SectionHead
                      title={t("home.fightNights")}
                      kicker={t(upcomingEvents.length ? "home.nextFightNight" : "home.lastFightNight")}
                      action={{ label: t("home.allEvents"), onClick: () => onNavigate("matches") }}
                    />
                    <ul className="space-y-3">
                      {eventList.map((e) => <EventRow key={e.id} event={e} upcoming={upcomingEvents.length > 0} onOpen={() => onOpenEvent(e.id)} />)}
                    </ul>
                  </div>
                )}
                {results.length > 0 && (
                  <div>
                    <SectionHead title={t("results.latest")} action={{ label: t("results.viewAll"), onClick: () => onNavigate("matches") }} />
                    <DemoBanner show={Boolean(fan?.demo)} />
                    <div className="bg-white rounded-2xl border border-gray-200 px-4 md:px-5 divide-y divide-gray-100">
                      {results.map((b) => <ResultRow key={b.id} bout={b} />)}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </Section>
      )}

      {featured.length > 0 && (
        <Section label={t("home.featuredTitle")}>
          <SectionHead title={t("home.featuredTitle")} action={{ label: t("common.viewAll"), onClick: () => onNavigate("fighters") }} />
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-5">
            {featured.map((f) => <FighterCard key={f.id} f={f} form={fan ? fightHistory(fan, f.id) : []} />)}
          </div>
        </Section>
      )}

      {videos.length > 0 && (
        <Section tone="gray" label={t("home.videosTitle")}>
          <SectionHead title={t("home.videosTitle")} action={{ label: t("home.viewAllVideos"), onClick: () => onNavigate("news-events") }} />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {videos.slice(0, 3).map((v) => <VideoCard key={v.id} v={v} onPlay={() => onPlayVideo(v.id)} />)}
          </div>
        </Section>
      )}

      <Section label={t("home.aboutTitle")}>
        <AboutKunKhmer />
      </Section>

      <Section tone="gray" label={t("home.partnerKicker")}>
        <BecomePartner partners={partners} stats={stats} onViewPartners={() => onNavigate("strategic-partners")} />
      </Section>
    </div>
  );
}
