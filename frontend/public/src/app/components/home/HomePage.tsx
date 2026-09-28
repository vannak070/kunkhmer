/**
 * Public home page: a light hero (welcome + ask KUNKHMER HUB, the next fight night when there
 * is one — otherwise the hero is centred — and the official partners strip), then
 * light sections — news, fight nights and results, fighters, videos, a "become a partner"
 * call to action and a newcomer guide (social links live in the footer). Only real data is shown; a section without data is hidden.
 */
import { useEffect, useRef, useState } from "react";
import { Link } from "react-router";
import { ArrowRight, Calendar, ChevronLeft, ChevronRight, Clock, Plus, Handshake, MapPin, Music, Play, Swords, Timer, Tv } from "lucide-react";
import { useI18n } from "../../i18n/LanguageContext";
import { latestResults, useFanData, type Broadcaster } from "../../data/fanData";
import { CountdownChip, DemoBanner, ResultRow } from "../fan/FanWidgets";
import { FighterCard, currentTitles } from "../../pages/FightersDirectory";
import { CATEGORY_KEYS } from "../../pages/NewsAndMedia";
import { CONTACT_EMAIL } from "../layout/SiteFooter";
import { readTimeMinutes, textLang } from "../../utils/publicDisplay";
import { HubAskBox } from "../hub/HubAskBox";
import kkfLogo from "../../../assets/kkf-logo-192.png";

export interface HomeArticle {
  id: string;
  title: string;
  excerpt?: string;
  image: string;
  category?: string;
  date?: string;
  /** Article body, for the reading time. */
  content?: string;
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
  /** Raw rows from /settings/partner-organizations (international partners). */
  organizations?: any[];
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
  international?: boolean;
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

/** Sponsors by tier, then international partners (admin order), then the broadcaster(s). */
function toPartners(sponsors: any[], broadcasters: Broadcaster[], organizations: any[] = []): Partner[] {
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
  const orgs = organizations
    .filter((o) => o.active !== false && o.name)
    .map((o) => ({ id: o.id, name: o.short_name || o.name, logo: o.logo_url || null, url: o.website_url || null, international: true }));
  const tv = broadcasters.map((b) => ({ id: b.id, name: b.name, logo: b.logo ?? null, url: b.websiteUrl ?? null, broadcaster: true }));
  return [...bySponsorTier, ...orgs, ...tv];
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

function PartnerLogo({ p, size = "md" }: { p: Partner; size?: "sm" | "md" | "lg" }) {
  const box = size === "sm" ? "h-8 w-8 rounded-lg" : size === "lg" ? "h-14 w-14 md:h-16 md:w-16 rounded-xl ring-1 ring-black/5 shadow-sm" : "h-10 w-10 md:h-12 md:w-12 rounded-lg";
  return p.logo ? (
    <img src={p.logo} alt="" className={`${box} object-contain bg-white shrink-0`} />
  ) : (
    <span aria-hidden className={`${box} bg-gray-100 text-gray-500 kk-heading inline-flex items-center justify-center shrink-0`}>
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

function Hero({ feature, partners }: { feature: React.ReactNode; partners: Partner[] }) {
  const { t } = useI18n();
  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-[#eef3fb] to-white">
      {/* Soft brand-colour glows; decoration only. */}
      <div aria-hidden className="pointer-events-none absolute -top-32 -right-24 w-[520px] h-[520px] rounded-full bg-[var(--kk-blue)] opacity-[0.08] blur-3xl" />
      <div aria-hidden className="pointer-events-none absolute top-40 -left-32 w-[420px] h-[420px] rounded-full bg-[var(--kk-red)] opacity-[0.06] blur-3xl" />

      <div className="relative max-w-7xl mx-auto px-4 md:px-6 pt-10 md:pt-16 pb-10 md:pb-14">
        <div className={`grid grid-cols-1 gap-10 lg:gap-16 items-center ${feature ? "lg:grid-cols-[minmax(0,6fr)_minmax(0,5fr)]" : ""}`}>
          <div className={feature ? "" : "max-w-3xl mx-auto text-center"}>
            <p className="inline-flex items-center gap-2 rounded-full bg-white border border-[#d5e0f3] shadow-sm pl-1 pr-4 py-1 mb-6">
              <img src={kkfLogo} alt="" className="w-7 h-7 rounded-full" />
              <span className="text-xs sm:text-sm font-semibold text-[var(--kk-blue)]">{t("home.heroKicker")}</span>
            </p>
            <h1 className="kk-display text-5xl sm:text-6xl md:text-7xl text-[var(--kk-navy)]">{t("home.heroTitle")}</h1>
            <p className={`mt-5 text-lg text-gray-600 max-w-xl leading-relaxed ${feature ? "" : "mx-auto"}`}>{t("home.tagline")}</p>
            <HubAskBox centered={!feature} />
          </div>
          {feature}
        </div>

        {partners.length > 0 && <PartnerStrip partners={partners} centered={!feature} />}
      </div>
    </section>
  );
}

// ─── 2. Official partners (inside the hero) ─────────────────────────────────

/**
 * One card per partner: large logo, name, and the role for a broadcaster / international partner.
 * No heading — the logos speak for themselves. One row that slides: ‹ › buttons appear only when the
 * partners don't all fit (swipe works too); when they fit, the row is centred (or left-aligned
 * next to the fight-night card).
 */
function PartnerStrip({ partners, centered = false }: { partners: Partner[]; centered?: boolean }) {
  const { t } = useI18n();
  const rowRef = useRef<HTMLUListElement>(null);
  const [edges, setEdges] = useState({ left: false, right: false });

  useEffect(() => {
    const row = rowRef.current;
    if (!row) return;
    const update = () =>
      setEdges({ left: row.scrollLeft > 4, right: row.scrollLeft + row.clientWidth < row.scrollWidth - 4 });
    // Partners arrive in two loads; always start at the first one (browsers keep the old offset).
    row.scrollTo({ left: 0, behavior: "instant" as ScrollBehavior });
    update();
    row.addEventListener("scroll", update, { passive: true });
    const resize = new ResizeObserver(update);
    resize.observe(row);
    return () => {
      row.removeEventListener("scroll", update);
      resize.disconnect();
    };
  }, [partners.length]);

  const slide = (dir: -1 | 1) => {
    const row = rowRef.current;
    if (row) row.scrollBy({ left: dir * Math.max(row.clientWidth * 0.8, 200), behavior: "smooth" });
  };
  const overflow = edges.left || edges.right;
  const arrow = (dir: -1 | 1, enabled: boolean) => (
    <button
      type="button"
      onClick={() => slide(dir)}
      disabled={!enabled}
      aria-label={t(dir < 0 ? "home.partnersPrev" : "home.partnersNext")}
      className="kk-focus shrink-0 w-10 h-10 md:w-11 md:h-11 rounded-full bg-white border border-gray-200 shadow-sm text-[var(--kk-navy)] flex items-center justify-center transition hover:border-[var(--kk-blue)] hover:text-[var(--kk-blue)] disabled:opacity-35 disabled:hover:border-gray-200 disabled:hover:text-[var(--kk-navy)]"
    >
      {dir < 0 ? <ChevronLeft className="w-5 h-5" aria-hidden /> : <ChevronRight className="w-5 h-5" aria-hidden />}
    </button>
  );

  return (
    <div className="mt-10 md:mt-14 flex items-center gap-2 md:gap-3">
      {overflow && arrow(-1, edges.left)}
    <ul
      ref={rowRef}
      aria-label={t("home.officialPartners")}
      className={`min-w-0 flex-1 flex gap-3 sm:gap-4 overflow-x-auto [overflow-anchor:none] snap-x snap-mandatory scroll-smooth py-2 -my-2 px-1 -mx-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden ${
        centered ? "[&>li:first-child]:ms-auto [&>li:last-child]:me-auto" : "[&>li:last-child]:me-auto"
      }`}
    >
      {partners.map((p) => {
        const body = (
          <>
            <PartnerLogo p={p} size="lg" />
            <span className="min-w-0 text-center sm:text-left">
              <span lang={textLang(p.name)} className="block font-semibold text-[var(--kk-navy)] leading-tight line-clamp-2 break-words">{p.name}</span>
              {(p.broadcaster || p.international) && <span className="mt-0.5 block text-xs text-gray-500">{t(p.broadcaster ? "home.officialBroadcaster" : "partners.internationalBadge")}</span>}
            </span>
          </>
        );
        const cls = "h-full flex flex-col sm:flex-row items-center gap-3 sm:gap-4 rounded-2xl bg-white border border-gray-200 shadow-sm px-4 py-4 sm:pr-6 sm:min-w-[220px]";
        return (
          <li key={p.id} className="shrink-0 snap-start w-40 sm:w-auto">
            {p.url ? (
              <a
                href={p.url}
                target="_blank"
                rel="noopener noreferrer"
                className={`kk-focus kk-motion ${cls} transition-all duration-200 hover:-translate-y-0.5 hover:border-[#d5e0f3] hover:shadow-lg hover:shadow-[var(--kk-blue)]/10`}
              >
                {body}
              </a>
            ) : (
              <div className={cls}>{body}</div>
            )}
          </li>
        );
      })}
    </ul>
      {overflow && arrow(1, edges.right)}
    </div>
  );
}

// ─── 3. News ────────────────────────────────────────────────────────────────

/** Category (same labels as /news-events), date and reading time. */
function NewsMeta({ a, className = "" }: { a: HomeArticle; className?: string }) {
  const { t, formatDate } = useI18n();
  const category = a.category ? (CATEGORY_KEYS[a.category] ? t(CATEGORY_KEYS[a.category]) : a.category) : null;
  return (
    <p className={`text-xs font-semibold text-gray-500 flex flex-wrap items-center gap-x-2 gap-y-1 ${className}`}>
      {category && <span className="kk-label text-[var(--kk-red)]">{category}</span>}
      {a.date && <span>{formatDate(a.date)}</span>}
      {a.content && <span className="inline-flex items-center gap-1"><Clock className="w-3.5 h-3.5" aria-hidden />{t("common.minRead", { n: readTimeMinutes(a.content) })}</span>}
    </p>
  );
}

function NewsCard({ a }: { a: HomeArticle }) {
  return (
    <Link to={`/article/${a.id}`} className="kk-focus group flex flex-col bg-white rounded-2xl border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow">
      <div className="aspect-[16/9] overflow-hidden bg-gray-200">
        <Picture src={a.image} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105 kk-motion" />
      </div>
      <div className="p-5">
        <NewsMeta a={a} className="mb-2" />
        <h3 lang={textLang(a.title)} className="kk-heading text-xl md:text-2xl text-gray-900 line-clamp-3 group-hover:text-[var(--kk-blue)]">{a.title}</h3>
        {a.excerpt && <p lang={textLang(a.excerpt)} className="mt-2 text-sm text-gray-600 line-clamp-2">{a.excerpt}</p>}
      </div>
    </Link>
  );
}

function NewsGrid({ articles }: { articles: HomeArticle[] }) {
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
          <NewsMeta a={lead} className="mb-2" />
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
                  <NewsMeta a={a} />
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

/**
 * "Join our official partners": logo tiles grouped by role (sponsors, international partners,
 * broadcaster), each linking to the partner's website, ending with a dashed "Your brand here" tile
 * that opens the partnership email.
 */
function PartnerWall({ partners, mailto }: { partners: Partner[]; mailto: string }) {
  const { t } = useI18n();
  const groups = [
    { key: "sponsors", label: t("partners.sponsors"), list: partners.filter((p) => !p.broadcaster && !p.international) },
    { key: "international", label: t("partners.international"), list: partners.filter((p) => p.international) },
    { key: "broadcast", label: t("partners.broadcasters"), list: partners.filter((p) => p.broadcaster) },
  ].filter((g) => g.list.length > 0);
  // Light card per partner: logo, name underneath; the whole tile links to the partner's website.
  const tile = "group h-full flex flex-col items-center justify-center gap-1.5 rounded-xl border px-2 py-2.5 text-center transition";
  const logo = "h-11 w-11 md:h-12 md:w-12 rounded-lg ring-1 ring-black/5 shadow-sm";
  return (
    <div className="space-y-3">
      <p className="kk-label text-gray-500">{t("home.joinPartners")}</p>
      {groups.map((g, i) => (
        <section key={g.key} aria-label={g.label}>
          <h3 className="text-xs font-semibold text-gray-500 mb-1.5 flex items-center gap-2">
            {g.label}
            <span className="h-px flex-1 bg-gray-200/70" aria-hidden />
          </h3>
          <ul className="grid grid-cols-3 gap-2">
            {g.list.map((p) => {
              const body = (
                <>
                  {p.logo ? (
                    <img src={p.logo} alt="" className={`${logo} object-contain bg-white`} />
                  ) : (
                    <span aria-hidden className={`${logo} bg-gray-100 text-gray-500 kk-heading flex items-center justify-center`}>{p.name.slice(0, 1).toUpperCase()}</span>
                  )}
                  <span lang={textLang(p.name)} className="w-full text-[11px] md:text-xs font-semibold text-[var(--kk-navy)] leading-tight line-clamp-2 break-words group-hover:text-[var(--kk-blue)]">{p.name}</span>
                </>
              );
              return (
                <li key={p.id} className="min-w-0">
                  {p.url ? (
                    <a
                      href={p.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      title={p.name}
                      className={`kk-focus ${tile} bg-white/80 border-gray-100 hover:bg-white hover:border-[#d5e0f3] hover:shadow-md hover:-translate-y-0.5`}
                    >
                      {body}
                    </a>
                  ) : (
                    <div className={`${tile} bg-white/80 border-gray-100`}>{body}</div>
                  )}
                </li>
              );
            })}
            {/* The invitation sits at the end of the first group (sponsors when there are any). */}
            {i === 0 && (
              <li className="min-w-0">
                <a href={mailto} className={`kk-focus ${tile} border-dashed border-[var(--kk-red)]/40 text-[var(--kk-red)] hover:bg-[#fdf1f3] hover:border-[var(--kk-red)]`}>
                  <span className={`${logo.replace(" ring-1 ring-black/5 shadow-sm", "")} border-2 border-dashed border-[var(--kk-red)]/40 flex items-center justify-center`} aria-hidden>
                    <Plus className="w-5 h-5" />
                  </span>
                  <span className="w-full text-[11px] md:text-xs font-semibold leading-tight line-clamp-2">{t("home.yourBrand")}</span>
                </a>
              </li>
            )}
          </ul>
        </section>
      ))}
    </div>
  );
}

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
          <div className="w-full max-w-md lg:justify-self-end rounded-2xl bg-white/60 border border-[#d5e0f3]/70 p-4">
            {partners.length > 0 && <PartnerWall partners={partners} mailto={mailto} />}
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
  const { articles, upcomingEvents, pastEvents, fighters, videos, sponsors, organizations, onOpenEvent, onPlayVideo, onNavigate } = props;
  const { t } = useI18n();
  const fan = useFanData();

  const partners = toPartners(sponsors, fan?.broadcasters ?? [], organizations);
  const rawEvent = (id?: string) => (id ? fan?.events.find((e: any) => e.id === id) : undefined);

  // Hero: the next fight night when there is one; news stays in the news section.
  const next = upcomingEvents[0];
  const nextRaw = rawEvent(next?.id);
  const mainSponsorId = nextRaw?.main_sponsor_id;
  const nextSponsor = next && nextRaw?.main_sponsor_name
    ? partners.find((p) => p.id === mainSponsorId) ?? { id: mainSponsorId || "main", name: nextRaw.main_sponsor_name, logo: nextRaw.main_sponsor_logo_url || null, url: null }
    : null;
  const feature = next ? (
    <HeroEventCard event={next} poster={nextRaw?.image || null} sponsor={nextSponsor} onOpen={() => onOpenEvent(next.id)} />
  ) : null;

  const news = articles.slice(0, 3);
  const eventList = upcomingEvents.length > 0 ? upcomingEvents.slice(0, 3) : pastEvents.slice(0, 1);
  const results = fan ? latestResults(fan, 4) : [];
  // Fighters with a real photo first, then the most experienced; records, not popularity.
  // Shown with the /fighters card, so they need the raw rows from the fan data.
  const featured = [...fighters]
    .sort((a, b) => Number(isRealImage(b.image)) - Number(isRealImage(a.image)) || (b.wins + b.losses + b.draws) - (a.wins + a.losses + a.draws))
    .map((f) => fan?.fighters.find((x: any) => x.id === f.id))
    .filter(Boolean)
    .slice(0, 4);
  const titles = currentTitles(fan);
  const stats = [
    { label: t("home.statFighters"), value: fighters.length },
    { label: t("home.statEvents"), value: upcomingEvents.length + pastEvents.length },
    { label: t("home.statPartners"), value: partners.length },
  ].filter((s) => s.value >= 10); // small counts undersell the pitch; they appear as the federation grows

  return (
    <div>
      <Hero feature={feature} partners={partners} />

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
          <SectionHead title={t("home.featuredTitle")} action={{ label: t("home.allFighters"), onClick: () => onNavigate("fighters") }} />
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-5">
            {fan && featured.map((f: any) => <FighterCard key={f.id} f={f} data={fan} titles={titles.get(f.id) ?? []} />)}
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
