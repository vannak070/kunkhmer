/**
 * Partners (/strategic-partners): the federation's sponsors, international partners (K-1, WKN,
 * Kombat …), broadcast partners and clubs, in the same light style as Matches & Events. Tabs are real
 * URLs: ?tab=sponsors (default) | international | broadcasters | clubs; &org=<id> opens an
 * international partner. Real data only — no stock photos, internal statuses or automatic ratings;
 * inactive clubs, sponsors, partners and broadcasters are not listed.
 * See claude/updates/public-partners-page.md and claude/features/international-partners.md.
 */
import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router";
import { ArrowRight, Building2, CalendarDays, ExternalLink, Flag, Globe2, Handshake, MapPin, Search, Tv, Users, X } from "lucide-react";
import { CONTACT_EMAIL } from "../components/layout/SiteFooter";
import { textLang } from "../utils/publicDisplay";
import { useI18n } from "../i18n/LanguageContext";
import type { MessageKey } from "../i18n/messages";

type Tab = "clubs" | "broadcasters" | "sponsors" | "international";

const TIERS = ["platinum", "gold", "silver", "bronze"] as const;
/** International partner types as set in the admin; anything else is shown as typed. */
const ORG_TYPE_KEYS: Record<string, MessageKey> = {
  Promotion: "partners.orgPromotion",
  "Sanctioning body": "partners.orgSanctioning",
  Federation: "partners.orgFederation",
};
const TIER_KEYS: Record<(typeof TIERS)[number], MessageKey> = {
  platinum: "partners.tierPlatinum",
  gold: "partners.tierGold",
  silver: "partners.tierSilver",
  bronze: "partners.tierBronze",
};

function tabFromParam(value: string | null): Tab {
  if (value === "broadcasters" || value === "broadcasts") return "broadcasters";
  if (value === "clubs") return "clubs";
  if (value === "international") return "international";
  return "sponsors";
}

/** Stock photos used as placeholders elsewhere never stand in for a real picture. */
const isRealImage = (url?: string | null): url is string => Boolean(url) && !url!.includes("images.unsplash.com");
const safeUrl = (url?: string | null) => (url && /^https?:\/\//i.test(url) ? url : null);
const hostOf = (url: string) => {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return url;
  }
};

export function Partners({
  clubs,
  broadcasters,
  sponsors,
  organizations = [],
  events,
  loading,
  onOpenClub,
  onOpenBroadcaster,
  onOpenSponsor,
}: {
  clubs: any[];
  broadcasters: any[];
  sponsors: any[];
  organizations?: any[];
  events: any[];
  loading: boolean;
  onOpenClub: (id: string) => void;
  onOpenBroadcaster: (id: string) => void;
  onOpenSponsor: (id: string) => void;
}) {
  const { t, tn, formatNumber, lang } = useI18n();
  const [params, setParams] = useSearchParams();
  const tab = tabFromParam(params.get("tab"));
  const [query, setQuery] = useState("");

  const setTab = (next: Tab) => {
    const p = new URLSearchParams(params);
    if (next === "sponsors") p.delete("tab");
    else p.set("tab", next);
    p.delete("org");
    setParams(p, { replace: true });
    setQuery("");
  };
  const openOrg = (id: string) => {
    const p = new URLSearchParams(params);
    p.set("tab", "international");
    p.set("org", id);
    setParams(p);
  };
  const closeOrg = () => {
    const p = new URLSearchParams(params);
    p.delete("org");
    setParams(p, { replace: true });
  };
  const orgTypeLabel = (type?: string | null) => (type ? (ORG_TYPE_KEYS[type] ? t(ORG_TYPE_KEYS[type]) : type) : "");

  const activeSponsors = useMemo(() => sponsors.filter((s) => s.active !== false && s.name), [sponsors]);
  const activeBroadcasters = useMemo(() => broadcasters.filter((b) => b.active !== false && b.name), [broadcasters]);
  // Already in the admin's order (sort order, then name).
  const activeOrgs = useMemo(() => organizations.filter((o) => o.active !== false && o.name), [organizations]);
  // Clubs are "active" or "inactive" (admin setting); only active ones are public.
  const sortedClubs = useMemo(
    () => clubs.filter((c) => c.name && String(c.status || "active").toLowerCase() === "active").sort((a, b) => a.name.localeCompare(b.name)),
    [clubs],
  );

  const nightsFor = (pred: (e: any) => boolean) => events.filter(pred).length;
  const sponsorNights = (id: string) => nightsFor((e) => e.main_sponsor_id === id || (Array.isArray(e.sponsorIds) && e.sponsorIds.includes(id)));
  const broadcastNights = (id: string) => nightsFor((e) => e.broadcast_station_id === id);

  const q = query.trim().toLowerCase();
  const hit = (...parts: (string | null | undefined)[]) => !q || parts.some((s) => s?.toLowerCase().includes(q));
  const clubsShown = sortedClubs.filter((c) => hit(c.name, c.name_khmer, c.location, c.head_coach || c.headCoach));
  const broadcastersShown = activeBroadcasters.filter((b) => hit(b.name, b.type, b.reach));
  const sponsorsShown = activeSponsors.filter((s) => hit(s.name, s.industry));
  const orgsShown = activeOrgs.filter((o) => hit(o.name, o.short_name, o.country, o.org_type));
  const openOrgItem = params.get("org") ? activeOrgs.find((o) => o.id === params.get("org")) : undefined;
  const tierOf = (s: any) => {
    const tier = String(s.tier || "").toLowerCase();
    return (TIERS as readonly string[]).includes(tier) ? (tier as (typeof TIERS)[number]) : null;
  };

  const tabs: { id: Tab; label: string; count: number; icon: React.ReactNode }[] = [
    { id: "sponsors", label: t("partners.sponsors"), count: activeSponsors.length, icon: <Handshake className="w-4 h-4" aria-hidden /> },
    { id: "international", label: t("partners.international"), count: activeOrgs.length, icon: <Globe2 className="w-4 h-4" aria-hidden /> },
    { id: "broadcasters", label: t("partners.broadcasters"), count: activeBroadcasters.length, icon: <Tv className="w-4 h-4" aria-hidden /> },
    { id: "clubs", label: t("partners.clubs"), count: sortedClubs.length, icon: <Building2 className="w-4 h-4" aria-hidden /> },
  ];

  if (loading && clubs.length + broadcasters.length + sponsors.length === 0) {
    return (
      <div className="space-y-6" aria-busy="true">
        <div className="h-40 rounded-3xl bg-gradient-to-b from-[#eef3fb] to-white animate-pulse" />
        <div className="h-64 rounded-3xl bg-gray-50 animate-pulse" />
      </div>
    );
  }

  const searchLabel =
    tab === "clubs" ? t("partners.searchClubs") : tab === "broadcasters" ? t("partners.searchBroadcasters") : tab === "international" ? t("partners.searchInternational") : t("partners.searchSponsors");
  const stats = [
    { icon: <Handshake className="w-4 h-4" />, value: activeSponsors.length, label: tn("partners.statSponsors", activeSponsors.length) },
    { icon: <Globe2 className="w-4 h-4" />, value: activeOrgs.length, label: tn("partners.statInternational", activeOrgs.length) },
    { icon: <Tv className="w-4 h-4" />, value: activeBroadcasters.length, label: tn("partners.statBroadcasters", activeBroadcasters.length) },
    { icon: <Building2 className="w-4 h-4" />, value: sortedClubs.length, label: tn("partners.statClubs", sortedClubs.length) },
  ].filter((s) => s.value > 0);

  return (
    <div className="space-y-8">
      {/* Header */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#eef3fb] via-white to-[#fdf1f3] border border-[#d5e0f3] px-6 py-8 md:px-10 md:py-10">
        <p className="kk-label text-[var(--kk-red)]">{t("partners.eyebrow")}</p>
        <h1 className="kk-heading text-3xl md:text-5xl text-[var(--kk-navy)] mt-1">{t("partners.title")}</h1>
        <p className="mt-2 text-base md:text-lg text-gray-600 max-w-2xl">{t("partners.subtitle")}</p>
        {stats.length > 0 && (
          <div className="mt-6 grid grid-cols-2 gap-2 sm:flex sm:flex-wrap sm:gap-3">
            {stats.map((s) => (
              <div key={s.label} className="flex flex-col sm:flex-row sm:items-center gap-0.5 sm:gap-2.5 rounded-2xl bg-white/80 border border-[#d5e0f3] px-3 py-2.5 sm:px-4 min-w-0">
                <span className="hidden sm:flex w-8 h-8 rounded-lg bg-[#eef3fb] text-[var(--kk-blue)] items-center justify-center" aria-hidden>{s.icon}</span>
                <span className="kk-stat text-xl text-[var(--kk-navy)]">{formatNumber(s.value)}</span>
                <span className="text-xs sm:text-sm text-gray-600 leading-snug">{s.label}</span>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Tabs + search */}
      <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-4">
        <div role="tablist" aria-label={t("partners.title")} className="inline-flex w-full sm:w-auto p-1 rounded-2xl bg-gray-100 overflow-x-auto">
          {tabs.map((x) => (
            <button
              key={x.id}
              type="button"
              role="tab"
              aria-selected={tab === x.id}
              onClick={() => setTab(x.id)}
              className={`kk-focus flex-1 sm:flex-none inline-flex items-center justify-center gap-2 whitespace-nowrap px-3 sm:px-4 md:px-5 h-11 rounded-xl text-sm font-semibold transition ${
                tab === x.id ? "bg-white text-[var(--kk-navy)] shadow-sm" : "text-gray-600 hover:text-gray-900"
              }`}
            >
              <span className={`hidden sm:inline ${tab === x.id ? "text-[var(--kk-blue)]" : "text-gray-400"}`}>{x.icon}</span>
              {x.label}
              {x.count > 0 && <span className={`text-xs ${tab === x.id ? "text-[var(--kk-blue)]" : "text-gray-400"}`}>{x.count}</span>}
            </button>
          ))}
        </div>
        <div className="flex flex-col sm:flex-row gap-2 w-full xl:w-auto">
          <label className="relative flex-1 xl:w-72">
            <span className="sr-only">{searchLabel}</span>
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" aria-hidden />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={searchLabel}
              className="kk-focus w-full h-11 pl-9 pr-3 rounded-xl border border-gray-200 bg-white text-sm"
            />
          </label>
          {q && (
            <button type="button" onClick={() => setQuery("")} className="kk-focus h-11 px-3 rounded-xl text-sm font-semibold text-gray-600 hover:bg-gray-100 inline-flex items-center justify-center gap-1">
              <X className="w-4 h-4" aria-hidden /> {t("common.clearFilters")}
            </button>
          )}
        </div>
      </div>

      {/* Clubs */}
      {tab === "clubs" && (
        sortedClubs.length === 0 ? <Empty icon={<Building2 className="w-7 h-7" aria-hidden />} title={t("partners.noClubs")} /> :
        clubsShown.length === 0 ? <NoMatch /> : (
          <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {clubsShown.map((c) => <li key={c.id}><ClubCard club={c} onOpen={() => onOpenClub(c.id)} /></li>)}
          </ul>
        )
      )}

      {/* International partners */}
      {tab === "international" && (
        activeOrgs.length === 0 ? <Empty icon={<Globe2 className="w-7 h-7" aria-hidden />} title={t("partners.noInternational")} /> :
        orgsShown.length === 0 ? <NoMatch /> : (
          <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {orgsShown.map((o) => (
              <li key={o.id}>
                <PartnerCard
                  name={o.short_name && o.short_name !== o.name ? `${o.name} (${o.short_name})` : o.name}
                  logo={o.logo_url}
                  image={o.image}
                  icon={<Flag className="w-4 h-4 mt-0.5 text-[var(--kk-red)] shrink-0" aria-hidden />}
                  line={[orgTypeLabel(o.org_type), o.country].filter(Boolean).join(" · ")}
                  badge={t("partners.internationalBadge")}
                  extra={o.partner_since ? t("partners.since", { year: o.partner_since }) : null}
                  nights={0}
                  nightsKey="partners.nightsSponsored"
                  website={safeUrl(o.website_url)}
                  onOpen={() => openOrg(o.id)}
                />
              </li>
            ))}
          </ul>
        )
      )}

      {openOrgItem && <OrgDialog o={openOrgItem} typeLabel={orgTypeLabel(openOrgItem.org_type)} lang={lang} onClose={closeOrg} />}

      {/* Broadcast partners */}
      {tab === "broadcasters" && (
        activeBroadcasters.length === 0 ? <Empty icon={<Tv className="w-7 h-7" aria-hidden />} title={t("partners.noBroadcasters")} /> :
        broadcastersShown.length === 0 ? <NoMatch /> : (
          <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {broadcastersShown.map((b) => (
              <li key={b.id}>
                <PartnerCard
                  name={b.name}
                  logo={b.logo_url || b.logoUrl}
                  image={b.image}
                  icon={<Tv className="w-4 h-4 mt-0.5 text-[var(--kk-blue)] shrink-0" aria-hidden />}
                  line={[b.type, b.reach].filter(Boolean).join(" · ")}
                  badge={t("home.officialBroadcaster")}
                  nights={broadcastNights(b.id)}
                  nightsKey="partners.nightsBroadcast"
                  website={safeUrl(b.website_url || b.websiteUrl)}
                  onOpen={() => onOpenBroadcaster(b.id)}
                />
              </li>
            ))}
          </ul>
        )
      )}

      {/* Sponsors, by tier */}
      {tab === "sponsors" && (
        activeSponsors.length === 0 ? <Empty icon={<Handshake className="w-7 h-7" aria-hidden />} title={t("partners.noSponsors")} /> :
        sponsorsShown.length === 0 ? <NoMatch /> : (
          <div className="space-y-8">
            {[...TIERS, null].map((tier) => {
              const list = sponsorsShown.filter((s) => tierOf(s) === tier);
              if (list.length === 0) return null;
              return (
                <section key={tier ?? "other"} aria-label={tier ? t(TIER_KEYS[tier]) : t("partners.sponsors")} className="space-y-3">
                  {tier && (
                    <h2 className="kk-heading text-xl text-gray-900 flex items-center gap-3">
                      <span className={`w-2.5 h-2.5 rounded-full ${tier === "platinum" ? "bg-[var(--kk-navy)]" : tier === "gold" ? "bg-[var(--kk-gold)]" : tier === "silver" ? "bg-[var(--kk-silver)]" : "bg-[#b07a4a]"}`} aria-hidden />
                      {t(TIER_KEYS[tier])}
                    </h2>
                  )}
                  <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                    {list.map((s) => (
                      <li key={s.id}>
                        <PartnerCard
                          name={s.name}
                          logo={s.logo_url || s.logoUrl}
                          image={s.image}
                          icon={<Building2 className="w-4 h-4 mt-0.5 text-[var(--kk-red)] shrink-0" aria-hidden />}
                          line={s.industry}
                          nights={sponsorNights(s.id)}
                          nightsKey="partners.nightsSponsored"
                          website={safeUrl(s.website_url || s.websiteUrl)}
                          onOpen={() => onOpenSponsor(s.id)}
                        />
                      </li>
                    ))}
                  </ul>
                </section>
              );
            })}
          </div>
        )
      )}

      <BecomePartner />
    </div>
  );
}

// ─── Pieces ──────────────────────────────────────────────────────────────────

function Logo({ src, name, className }: { src?: string | null; name: string; className: string }) {
  return isRealImage(src) ? (
    <img src={src} alt="" className={`${className} object-contain bg-white`} />
  ) : (
    <span aria-hidden className={`${className} bg-[#eef3fb] text-[var(--kk-navy)] kk-heading text-2xl flex items-center justify-center`}>
      {name.slice(0, 1).toUpperCase()}
    </span>
  );
}

function ClubCard({ club, onOpen }: { club: any; onOpen: () => void }) {
  const { t, tn, localName } = useI18n();
  const name = localName(club.name, club.name_khmer);
  const coach = club.head_coach || club.headCoach;
  const fighters = Number(club.fighters_count ?? club.active_fighters ?? 0) || 0;
  return (
    <button type="button" onClick={onOpen} className="kk-focus group w-full h-full text-left flex flex-col rounded-2xl border border-gray-200 bg-white overflow-hidden hover:border-[var(--kk-blue)]/40 hover:shadow-md transition">
      <div className="aspect-[16/9] overflow-hidden bg-gray-100">
        {isRealImage(club.image) ? (
          <img src={club.image} alt="" loading="lazy" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105 kk-motion" />
        ) : (
          <span aria-hidden className="w-full h-full flex items-center justify-center bg-gradient-to-br from-[#eef3fb] to-[#fdf1f3] text-[var(--kk-navy)]/25 kk-display text-3xl">KKF</span>
        )}
      </div>
      <div className="p-4 flex flex-col gap-2 flex-1">
        <h3 lang={textLang(name)} className="font-bold text-lg text-gray-900 leading-snug line-clamp-2 group-hover:text-[var(--kk-blue)] break-words">{name}</h3>
        <ul className="space-y-1.5 text-sm text-gray-600">
          {club.location && (
            <li className="flex items-start gap-2"><MapPin className="w-4 h-4 mt-0.5 text-[var(--kk-red)] shrink-0" aria-hidden /><span lang={textLang(club.location)}>{club.location}</span></li>
          )}
          {coach && (
            <li className="flex items-start gap-2"><Users className="w-4 h-4 mt-0.5 text-[var(--kk-blue)] shrink-0" aria-hidden /><span><span className="text-gray-500">{t("partners.headCoach")}:</span> <span lang={textLang(coach)} className="font-semibold text-gray-800">{coach}</span></span></li>
          )}
        </ul>
        <p className="mt-auto pt-2 text-sm font-semibold text-[var(--kk-blue)] flex items-center justify-between">
          <span>{fighters > 0 ? tn("partners.fighters", fighters) : t("partners.viewClub")}</span>
          <ArrowRight className="w-4 h-4 transition group-hover:translate-x-0.5" aria-hidden />
        </p>
      </div>
    </button>
  );
}

/** Sponsor / broadcaster card, laid out like the club card: banner picture, logo, details, link. */
function PartnerCard({
  name,
  logo,
  image,
  icon,
  line,
  badge,
  extra,
  nights,
  nightsKey,
  website,
  onOpen,
}: {
  name: string;
  logo?: string | null;
  image?: string | null;
  icon: React.ReactNode;
  line?: string | null;
  badge?: string | null;
  extra?: string | null;
  nights: number;
  nightsKey: string;
  website: string | null;
  onOpen: () => void;
}) {
  const { t, tn } = useI18n();
  const banner = isRealImage(image);
  return (
    <div className="group relative h-full flex flex-col rounded-2xl border border-gray-200 bg-white overflow-hidden hover:border-[var(--kk-blue)]/40 hover:shadow-md transition">
      <div className="relative aspect-[16/9] overflow-hidden bg-gradient-to-br from-[#eef3fb] to-[#fdf1f3]">
        {banner ? (
          <img src={image!} alt="" loading="lazy" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105 kk-motion" />
        ) : (
          // No banner: the logo, large, on the light brand background.
          <span className="w-full h-full flex items-center justify-center p-6">
            <Logo src={logo} name={name} className="w-28 h-28 rounded-3xl ring-1 ring-black/5 shadow-sm" />
          </span>
        )}
        {banner && (
          <span className="absolute bottom-3 left-3">
            <Logo src={logo} name={name} className="w-14 h-14 rounded-xl ring-2 ring-white shadow-md" />
          </span>
        )}
      </div>
      <div className="p-4 flex flex-col gap-2 flex-1">
        {badge && <p className="kk-label text-[var(--kk-red)]">{badge}</p>}
        <h3 lang={textLang(name)} className="font-bold text-lg text-gray-900 leading-snug line-clamp-2 break-words group-hover:text-[var(--kk-blue)]">
          {/* The whole card opens the partner; the website link below stays its own target. */}
          <button type="button" onClick={onOpen} className="kk-focus text-left after:absolute after:inset-0 after:rounded-2xl after:content-['']">{name}</button>
        </h3>
        <ul className="space-y-1.5 text-sm text-gray-600">
          {line && <li className="flex items-start gap-2">{icon}<span lang={textLang(line)}>{line}</span></li>}
          {extra && <li className="flex items-start gap-2"><CalendarDays className="w-4 h-4 mt-0.5 text-[var(--kk-blue)] shrink-0" aria-hidden />{extra}</li>}
          {nights > 0 && (
            <li className="flex items-start gap-2"><CalendarDays className="w-4 h-4 mt-0.5 text-[var(--kk-blue)] shrink-0" aria-hidden />{tn(nightsKey as "partners.nightsBroadcast", nights)}</li>
          )}
        </ul>
        <div className="mt-auto pt-2 flex flex-wrap items-center justify-between gap-2 text-sm font-semibold text-[var(--kk-blue)]">
          {website ? (
            <a href={website} target="_blank" rel="noopener noreferrer" className="kk-focus relative z-10 inline-flex items-center gap-1 hover:underline underline-offset-4">
              {hostOf(website)} <ExternalLink className="w-3.5 h-3.5" aria-hidden />
            </a>
          ) : (
            <span>{t("common.viewDetails")}</span>
          )}
          <ArrowRight className="w-4 h-4 transition group-hover:translate-x-0.5" aria-hidden />
        </div>
      </div>
    </div>
  );
}

/** An international partner's details, opened by ?org=<id> (shareable; Back or Esc closes it). */
function OrgDialog({ o, typeLabel, lang, onClose }: { o: any; typeLabel: string; lang: string; onClose: () => void }) {
  const { t } = useI18n();
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
  // Khmer text when the federation has written it, otherwise the English one.
  const description: string | null = (lang === "km" && o.description_km) || o.description || o.description_km || null;
  const website = safeUrl(o.website_url);
  const banner = isRealImage(o.image);
  const facts = [typeLabel, o.country, o.partner_since ? t("partners.since", { year: o.partner_since }) : null].filter(Boolean);
  return (
    <div role="dialog" aria-modal="true" aria-label={o.name} className="fixed inset-0 z-[100] flex items-center justify-center bg-[var(--kk-navy)]/60 backdrop-blur-sm p-4" onClick={onClose}>
      <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl bg-white shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="relative aspect-[16/7] bg-gradient-to-br from-[#eef3fb] to-[#fdf1f3] flex items-center justify-center">
          {banner ? (
            <img src={o.image} alt="" className="absolute inset-0 w-full h-full object-cover" />
          ) : (
            <Logo src={o.logo_url} name={o.name} className="w-28 h-28 rounded-3xl ring-1 ring-black/5 shadow-sm" />
          )}
          {banner && (
            <span className="absolute -bottom-8 left-6">
              <Logo src={o.logo_url} name={o.name} className="w-20 h-20 rounded-2xl ring-4 ring-white shadow-md" />
            </span>
          )}
          <button type="button" onClick={onClose} aria-label={t("partners.close")} className="kk-focus absolute top-3 right-3 w-10 h-10 rounded-full bg-white/90 hover:bg-white text-gray-700 flex items-center justify-center shadow">
            <X className="w-5 h-5" aria-hidden />
          </button>
        </div>
        <div className={`px-6 pb-6 ${banner ? "pt-12" : "pt-5"} space-y-3`}>
          <p className="kk-label text-[var(--kk-red)]">{t("partners.internationalBadge")}</p>
          <h2 lang={textLang(o.name)} className="kk-heading text-2xl md:text-3xl text-[var(--kk-navy)] break-words">
            {o.name}
            {o.short_name && o.short_name !== o.name && <span className="ml-2 text-gray-400">{o.short_name}</span>}
          </h2>
          {facts.length > 0 && <p className="text-sm font-semibold text-gray-600">{facts.join(" · ")}</p>}
          {description && <p lang={textLang(description)} className="text-gray-700 leading-relaxed whitespace-pre-line">{description}</p>}
          {website && (
            <a href={website} target="_blank" rel="noopener noreferrer" className="kk-focus inline-flex items-center gap-1.5 h-11 px-5 rounded-xl bg-[var(--kk-blue)] hover:bg-[var(--kk-navy)] text-white text-sm font-semibold">
              {hostOf(website)} <ExternalLink className="w-4 h-4" aria-hidden />
            </a>
          )}
        </div>
      </div>
    </div>
  );
}

function BecomePartner() {
  const { t } = useI18n();
  const mailto = `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(t("home.partnerEmailSubject"))}`;
  return (
    <section className="rounded-3xl bg-gradient-to-br from-[#eef3fb] via-white to-[#fdf1f3] border border-[#d5e0f3] p-6 md:p-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
      <div className="max-w-2xl">
        <p className="kk-label text-[var(--kk-red)] flex items-center gap-2"><Handshake className="w-4 h-4" aria-hidden />{t("home.partnerKicker")}</p>
        <h2 className="kk-heading text-2xl md:text-4xl text-[var(--kk-navy)] mt-1">{t("home.partnerTitle")}</h2>
        <p className="mt-2 text-gray-600">{t("home.partnerText")}</p>
      </div>
      <a href={mailto} className="kk-focus shrink-0 inline-flex items-center justify-center gap-2 min-h-12 px-6 rounded-xl bg-[var(--kk-red)] hover:bg-[#9e1a2c] text-white font-semibold shadow-md shadow-[var(--kk-red)]/20 transition-colors">
        {t("home.partnerCta")} <ArrowRight className="w-4 h-4" aria-hidden />
      </a>
    </section>
  );
}

function Empty({ icon, title }: { icon: React.ReactNode; title: string }) {
  return (
    <div className="rounded-3xl border border-dashed border-gray-300 bg-white px-6 py-12 text-center">
      <div className="w-14 h-14 mx-auto rounded-2xl bg-[#eef3fb] text-[var(--kk-blue)] flex items-center justify-center mb-4">{icon}</div>
      <h2 className="kk-heading text-xl text-gray-900">{title}</h2>
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
