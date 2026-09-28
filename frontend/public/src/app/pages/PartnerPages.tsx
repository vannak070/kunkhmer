/**
 * Public pages for a club (/clubs/:slug), a sponsor (/partners/sponsors/:slug) and a broadcaster
 * (/partners/broadcasters/:slug). Banner header, key numbers, the next fight (night), and details —
 * all from the federation's records: no ratings, badges, tiers or reach unless entered, no private
 * contact people, numbers shown only when there is something to count. See
 * claude/updates/public-step1-links-honesty-cleanup.md and claude/updates/partner-pages-2.md.
 */
import { useEffect, useMemo, useState, type ReactNode } from "react";
import { Link, useParams } from "react-router";
import {
  ArrowLeft, ArrowRight, Building2, CalendarDays, Crown, ExternalLink, Globe, Mail, MapPin, Phone, PlayCircle, Radio,
  Swords, Trophy, Tv, UserRound, Users,
} from "lucide-react";
import { SiteHeader } from "../components/layout/SiteHeader";
import { SiteFooter } from "../components/layout/SiteFooter";
import { ShareButtons } from "../components/ShareButtons";
import { HubAskAbout } from "../components/hub/HubAskAbout";
import { BoutRow, FighterAvatar } from "../components/event/EventParts";
import { CountdownChip, daysUntil } from "../components/fan/FanWidgets";
import { LoadError, Loading } from "../components/LoadError";
import { NotFoundContent } from "./NotFound";
import { ActionLink, DateBadge, DetailRow, Section, SideCard, Spotlight, Stats, iconCls, isUpcoming, time } from "../components/detail/DetailParts";
import { FighterCard, currentTitles } from "./FightersDirectory";
import { broadcasterForEvent, mainEventBout, retryFanData, useFanData, type Bout, type FanData, type FighterRef } from "../data/fanData";
import { findPartner, isRealImage, loadPartners, type PartnerKind } from "../data/partners";
import { getFighterSlug } from "../data/masterData";
import { weightClassFor } from "../data/weightClasses";
import { usePageMeta } from "../hooks/usePageTitle";
import { textLang } from "../utils/publicDisplay";
import { KM_MONTHS, useI18n } from "../i18n/LanguageContext";

// ─── Loading one partner ─────────────────────────────────────────────────────

type State = { status: "loading" } | { status: "error" } | { status: "ready"; row: any | null };

function usePartner(kind: PartnerKind): [State, () => void] {
  const { slug } = useParams();
  const [state, setState] = useState<State>({ status: "loading" });
  const [attempt, setAttempt] = useState(0);
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [slug]);
  useEffect(() => {
    let alive = true;
    setState({ status: "loading" });
    loadPartners(kind, attempt > 0)
      .then((rows) => alive && setState({ status: "ready", row: findPartner(rows, slug) }))
      .catch(() => alive && setState({ status: "error" }));
    return () => {
      alive = false;
    };
  }, [kind, slug, attempt]);
  return [state, () => setAttempt((n) => n + 1)];
}

function PartnerFrame({ kind, render }: { kind: PartnerKind; render: (row: any) => ReactNode }) {
  const [state, retry] = usePartner(kind);
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <SiteHeader activeSection="strategic-partners" />
      <main className="flex-1">
        {state.status === "loading" && <Loading />}
        {state.status === "error" && <div className="max-w-3xl mx-auto px-4 py-16"><LoadError onRetry={retry} /></div>}
        {state.status === "ready" && (state.row ? render(state.row) : <NotFoundContent />)}
      </main>
      <SiteFooter />
    </div>
  );
}

// ─── Header ──────────────────────────────────────────────────────────────────

/** Banner picture (or a brand gradient), then a white card with logo, name, facts and actions. */
function BannerHeader({ back, eyebrow, banner, logo, name, nameKm, facts, actions, shareTitle }: {
  back: { to: string; label: string };
  eyebrow: string;
  banner?: string | null;
  logo?: string | null;
  name: string;
  nameKm?: string | null;
  facts: { icon: ReactNode; text: ReactNode }[];
  actions?: ReactNode;
  shareTitle: string;
}) {
  const initials = name.split(/\s+/).filter(Boolean).slice(0, 2).map((w) => w[0]).join("").toUpperCase();
  const hasBanner = isRealImage(banner);
  return (
    <section className="bg-gradient-to-b from-[#eef3fb] to-gray-50">
      <div className="max-w-6xl mx-auto px-4 md:px-6 pt-6">
        <Link to={back.to} className="kk-focus inline-flex items-center gap-2 text-sm font-semibold text-gray-600 hover:text-gray-900 mb-4">
          <ArrowLeft className="w-4 h-4" aria-hidden /> {back.label}
        </Link>
        <div className={`relative rounded-3xl overflow-hidden border border-[#d5e0f3] ${hasBanner ? "aspect-[16/9] sm:aspect-[21/8]" : "h-36 sm:h-44"} bg-gradient-to-br from-[#dfe8f7] via-[#eef3fb] to-[#fdf1f3]`}>
          {hasBanner ? (
            <img src={banner} alt="" className="absolute inset-0 w-full h-full object-cover" />
          ) : (
            <span aria-hidden className="absolute inset-0 flex items-center justify-center kk-display text-6xl sm:text-8xl text-[var(--kk-navy)]/10">{initials}</span>
          )}
        </div>
        <div className="relative -mt-12 sm:-mt-16 mx-2 sm:mx-6 rounded-3xl bg-white border border-[#d5e0f3] shadow-[0_10px_40px_rgba(26,71,151,0.08)] p-5 sm:p-7 flex flex-col sm:flex-row gap-5">
          <div className="shrink-0 -mt-14 sm:-mt-16 w-24 h-24 sm:w-28 sm:h-28 rounded-2xl bg-white border border-[#d5e0f3] shadow-sm flex items-center justify-center overflow-hidden">
            {isRealImage(logo) ? (
              <img src={logo} alt="" className="w-full h-full object-contain p-2.5" />
            ) : (
              <span className="kk-heading text-3xl text-[var(--kk-blue)]" aria-hidden>{initials}</span>
            )}
          </div>
          <div className="min-w-0 flex-1">
            <p className="kk-label text-[var(--kk-red)]">{eyebrow}</p>
            <h1 lang={textLang(name)} className="kk-heading text-3xl md:text-4xl text-[var(--kk-navy)] mt-1 break-words">{name}</h1>
            {nameKm && nameKm !== name && <p lang="km" className="text-lg text-gray-600">{nameKm}</p>}
            {facts.length > 0 && (
              <ul className="mt-3 flex flex-wrap gap-x-5 gap-y-2 text-sm text-gray-700">
                {facts.map((f, i) => <li key={i} className="inline-flex items-center gap-2">{f.icon}{f.text}</li>)}
              </ul>
            )}
            <div className="mt-4 flex flex-wrap items-center gap-2">
              {actions}
              <ShareButtons title={shareTitle} variant="compact" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/** Fight nights (upcoming first, then past) as compact linked rows. */
function EventRows({ events, data, skip }: { events: any[]; data: FanData | null; skip?: string }) {
  const { t, tn, formatDate } = useI18n();
  const list = events.filter((e) => e.id !== skip);
  const upcoming = list.filter((e) => isUpcoming(e.end_date || e.date)).sort((a, b) => time(a.date) - time(b.date));
  const past = list.filter((e) => !isUpcoming(e.end_date || e.date)).sort((a, b) => time(b.date) - time(a.date));
  const row = (e: any) => {
    const bouts = data?.bouts.filter((b) => b.eventId === e.id).length ?? 0;
    return (
      <li key={e.id}>
        <Link to={`/events/${e.id}`} className="kk-focus group flex items-center gap-4 rounded-2xl border border-gray-200 bg-white p-4 hover:border-[var(--kk-blue)]/40 hover:shadow-sm transition">
          <DateBadge date={e.date} />
          <div className="min-w-0 flex-1">
            <p className="text-xs font-semibold text-gray-500 flex flex-wrap items-center gap-2">{formatDate(e.date, "weekday")}<CountdownChip date={e.date} /></p>
            <p lang={textLang(e.name)} className="font-bold text-gray-900 group-hover:text-[var(--kk-blue)] break-words">{e.name}</p>
            <p className="text-sm text-gray-600 truncate">{[e.location, bouts > 0 ? tn("common.bouts", bouts) : null].filter(Boolean).join(" · ")}</p>
          </div>
          <ArrowRight className="w-4 h-4 text-gray-400 shrink-0" aria-hidden />
        </Link>
      </li>
    );
  };
  if (upcoming.length + past.length === 0) return null;
  return (
    <div className="space-y-6">
      {upcoming.length > 0 && (
        <div className="space-y-2">
          <p className="kk-label text-gray-500">{t("fights.upcomingNights")}</p>
          <ul className="space-y-2">{upcoming.map(row)}</ul>
        </div>
      )}
      {past.length > 0 && (
        <div className="space-y-2">
          <p className="kk-label text-gray-500">{t("matches.pastEvents")}</p>
          <ul className="space-y-2">{past.slice(0, 12).map(row)}</ul>
        </div>
      )}
    </div>
  );
}

function Empty({ text }: { text: string }) {
  return <p className="rounded-2xl border border-dashed border-gray-300 bg-white p-5 text-sm text-gray-600">{text}</p>;
}

const mapsUrl = (place: string) => `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(place)}`;

/** Month + year of the earliest event, e.g. "Jul 2026" (derived from the records, never entered). */
function useSince() {
  const { lang } = useI18n();
  return (events: any[]) => {
    const first = events.filter((e) => !isUpcoming(e.end_date || e.date)).sort((a, b) => time(a.date) - time(b.date))[0];
    const d = first ? new Date(first.date) : null;
    if (!d || isNaN(d.getTime())) return null;
    return lang === "km" ? `${KM_MONTHS[d.getUTCMonth()]} ${d.getUTCFullYear()}` : d.toLocaleDateString("en", { month: "long", year: "numeric", timeZone: "UTC" });
  };
}

// ─── Club ────────────────────────────────────────────────────────────────────

/** Fighters shown before "Show all". */
const ROSTER = 9;

export function ClubPage() {
  return <PartnerFrame kind="club" render={(club) => <ClubView club={club} />} />;
}

function ClubView({ club }: { club: any }) {
  const { t, tn, localName, formatWeight } = useI18n();
  const data = useFanData();
  const [showAll, setShowAll] = useState(false);
  const name = localName(club.name, club.name_khmer);
  usePageMeta({
    title: name,
    description: [club.name, club.location, club.description].filter(Boolean).join(" — "),
    image: isRealImage(club.image) ? club.image : null,
  });

  const fighters = useMemo(
    () => (data?.fighters ?? []).filter((f: any) => (f.clubId || f.club_id) === club.id).sort((a: any, b: any) => a.name.localeCompare(b.name)),
    [data, club.id],
  );
  const ids = new Set(fighters.map((f: any) => f.id));
  const titles = currentTitles(data);
  const involves = (b: Bout) => ids.has(b.fighterA.id) || ids.has(b.fighterB.id);
  const clubBouts = (data?.bouts ?? []).filter(involves);
  const upcoming = clubBouts.filter((b) => !b.completed && isUpcoming(b.date)).sort((a, b) => time(a.date) - time(b.date) || a.sortOrder - b.sortOrder);
  const results = clubBouts.filter((b) => b.completed).sort((a, b) => time(b.date) - time(a.date));
  const wins = results.filter((b) => b.winnerId && ids.has(b.winnerId)).length;
  const nights = new Set(clubBouts.map((b) => b.eventId).filter(Boolean)).size;
  const champions = (data?.champions ?? [])
    .filter((c: any) => c.current_holder_id && ids.has(c.current_holder_id) && String(c.status || "").toLowerCase() !== "vacant")
    .sort((a: any, b: any) => Number(a.weight_class) - Number(b.weight_class));
  const classes = new Set(fighters.map((f: any) => (data ? weightClassFor(f.currentWeight ?? f.current_weight, data.weightClasses)?.id : null)).filter(Boolean)).size;
  const next = upcoming[0] ?? null;
  const nextEvent = next?.eventId ? data?.events.find((e: any) => e.id === next.eventId) : null;
  const clubSide = (b: Bout) => (ids.has(b.fighterA.id) ? b.fighterA : b.fighterB);

  const facts = [
    club.location && { icon: <MapPin className={`${iconCls} text-[var(--kk-red)]`} aria-hidden />, text: <span lang={textLang(club.location)}>{club.location}</span> },
    club.head_coach && { icon: <UserRound className={`${iconCls} text-[var(--kk-blue)]`} aria-hidden />, text: <span lang={textLang(club.head_coach)}>{t("club.headCoach", { name: club.head_coach })}</span> },
    club.established && { icon: <CalendarDays className={`${iconCls} text-[var(--kk-blue)]`} aria-hidden />, text: t("club.established", { year: club.established }) },
  ].filter(Boolean) as { icon: ReactNode; text: ReactNode }[];

  return (
    <>
      <BannerHeader
        back={{ to: "/strategic-partners?tab=clubs", label: t("club.back") }}
        eyebrow={t("club.eyebrow")}
        banner={club.image}
        logo={null}
        name={name}
        nameKm={club.name_khmer && club.name_khmer !== name ? club.name_khmer : null}
        facts={facts}
        shareTitle={name}
        actions={
          <>
            {club.phone && <ActionLink href={`tel:${String(club.phone).replace(/\s+/g, "")}`} icon={<Phone className={iconCls} aria-hidden />} primary>{t("club.call")}</ActionLink>}
            {club.email && <ActionLink href={`mailto:${club.email}`} icon={<Mail className={iconCls} aria-hidden />}>{t("club.email")}</ActionLink>}
          </>
        }
      />

      <div className="max-w-6xl mx-auto px-4 md:px-6 py-10 space-y-10">
        {data?.failed && <LoadError onRetry={retryFanData} />}
        {data && (
          <Stats
            items={[
              { icon: <Users className="w-5 h-5" />, value: fighters.length, label: tn("club.statFighters", fighters.length) },
              { icon: <Crown className="w-5 h-5" />, value: champions.length, label: tn("club.statTitles", champions.length) },
              { icon: <CalendarDays className="w-5 h-5" />, value: nights, label: tn("club.statNights", nights) },
              { icon: <Trophy className="w-5 h-5" />, value: wins, label: tn("club.statWins", wins) },
            ]}
          />
        )}

        <div className="grid lg:grid-cols-[minmax(0,1fr)_320px] gap-10 items-start">
          <div className="space-y-12 min-w-0">
            {next && (
              <Spotlight
                label={t("club.nextFight")}
                date={next.date}
                title={nextEvent?.name || next.eventName || next.cardName || t("event.fightNight")}
                eventId={next.eventId}
                bout={next}
                subtitle={
                  <>
                    {nextEvent?.location && <p className="flex items-start gap-2"><MapPin className={`${iconCls} mt-0.5 text-[var(--kk-red)]`} aria-hidden /><span lang={textLang(nextEvent.location)}>{nextEvent.location}</span></p>}
                    {nextEvent && broadcasterForEvent(data!, nextEvent) && <p className="flex items-center gap-2"><Tv className={`${iconCls} text-[var(--kk-blue)]`} aria-hidden />{t("fights.liveOn", { station: broadcasterForEvent(data!, nextEvent)!.name })}</p>}
                    <p className="flex items-center gap-2"><Swords className={`${iconCls} text-[var(--kk-blue)]`} aria-hidden /><span>{t("club.representing", { name: localName(clubSide(next).name, clubSide(next).nameKhmer) })}</span></p>
                  </>
                }
              />
            )}

            {champions.length > 0 && (
              <Section title={t("club.champions")} icon={<Crown className="w-5 h-5 text-[#7A5B00]" aria-hidden />}>
                <ul className="grid sm:grid-cols-2 gap-3">
                  {champions.map((c: any) => {
                    const holder = fighters.find((f: any) => f.id === c.current_holder_id);
                    return (
                      <li key={c.id}>
                        <Link to={holder ? `/fighters/${getFighterSlug(holder)}` : "/fighters"} className="kk-focus group flex items-center gap-3 rounded-2xl border border-[#f2c94c]/60 bg-gradient-to-br from-[#fffaf0] to-white p-4 hover:shadow-sm transition">
                          {holder && <FighterAvatar f={{ id: holder.id, name: holder.name, image: isRealImage(holder.image) ? holder.image : undefined }} corner="blue" size="md" />}
                          <div className="min-w-0">
                            <p lang={textLang(c.title_name)} className="font-bold text-gray-900 group-hover:text-[var(--kk-blue)] break-words">{c.title_name}</p>
                            {holder && <p lang={textLang(localName(holder.name, holder.nameKhmer))} className="text-sm text-gray-700">{localName(holder.name, holder.nameKhmer)}</p>}
                            <p className="text-xs text-gray-500">
                              {[c.weight_class ? formatWeight(c.weight_class) : null, Number(c.defense_count) > 0 ? tn("club.defenses", Number(c.defense_count)) : null].filter(Boolean).join(" · ")}
                            </p>
                          </div>
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </Section>
            )}

            <Section title={t("club.fighters")} icon={<Users className="w-5 h-5 text-[var(--kk-blue)]" aria-hidden />}>
              {!data ? <Loading className="py-10" /> : fighters.length === 0 ? <Empty text={t("club.noFighters")} /> : (
                <>
                  <ul className="grid sm:grid-cols-2 xl:grid-cols-3 gap-4">
                    {(showAll ? fighters : fighters.slice(0, ROSTER)).map((f: any) => <li key={f.id}><FighterCard f={f} data={data} titles={titles.get(f.id) ?? []} /></li>)}
                  </ul>
                  {!showAll && fighters.length > ROSTER && (
                    <button type="button" onClick={() => setShowAll(true)} className="kk-focus w-full h-12 rounded-2xl border border-gray-200 bg-white text-sm font-semibold text-[var(--kk-blue)] hover:border-[var(--kk-blue)]/40">
                      {t("club.showAll", { n: fighters.length })}
                    </button>
                  )}
                </>
              )}
            </Section>

            {upcoming.length > 1 && (
              <Section title={t("club.upcoming")}>
                <ol className="space-y-3">{upcoming.slice(1).map((b, i) => <BoutRow key={b.id} bout={b} number={i + 1} />)}</ol>
              </Section>
            )}
            {results.length > 0 && (
              <Section title={t("club.results")}>
                <ol className="space-y-3">{results.slice(0, 6).map((b, i) => <BoutRow key={b.id} bout={b} number={i + 1} result />)}</ol>
              </Section>
            )}
          </div>

          <aside className="space-y-4 lg:sticky lg:top-24">
            {club.description && (
              <SideCard title={t("club.about")}>
                <p lang={textLang(club.description)} className="text-sm text-gray-700 leading-relaxed whitespace-pre-line">{club.description}</p>
              </SideCard>
            )}
            <SideCard title={t("club.details")}>
              {club.head_coach && <DetailRow icon={<UserRound className={iconCls} />} label={t("partners.headCoach")}><span lang={textLang(club.head_coach)}>{club.head_coach}</span></DetailRow>}
              {club.established && <DetailRow icon={<CalendarDays className={iconCls} />} label={t("club.foundedLabel")}>{club.established}</DetailRow>}
              {classes > 0 && <DetailRow icon={<Trophy className={iconCls} />} label={t("club.weightClasses")}>{tn("club.classesCount", classes)}</DetailRow>}
              {club.location && (
                <DetailRow icon={<MapPin className={iconCls} />} label={t("club.location")}>
                  <span lang={textLang(club.location)}>{club.location}</span>{" "}
                  <a href={mapsUrl(club.location)} target="_blank" rel="noopener noreferrer" className="kk-focus text-[var(--kk-blue)] font-semibold hover:underline underline-offset-4 whitespace-nowrap">{t("club.map")}</a>
                </DetailRow>
              )}
              {club.phone && <DetailRow icon={<Phone className={iconCls} />} label={t("club.phone")}><a href={`tel:${String(club.phone).replace(/\s+/g, "")}`} className="kk-focus hover:underline">{club.phone}</a></DetailRow>}
              {club.email && <DetailRow icon={<Mail className={iconCls} />} label={t("club.email")}><a href={`mailto:${club.email}`} className="kk-focus hover:underline break-all">{club.email}</a></DetailRow>}
            </SideCard>
            <HubAskAbout questions={[t("hub.askFighterClub", { club: club.name }), t("hub.askClubContact", { club: club.name })]} />
          </aside>
        </div>
      </div>
    </>
  );
}

// ─── Sponsor ─────────────────────────────────────────────────────────────────

const TIER_KEY = { platinum: "partnerPage.tierPlatinum", gold: "partnerPage.tierGold", silver: "partnerPage.tierSilver", bronze: "partnerPage.tierBronze" } as const;

export function SponsorPage() {
  return <PartnerFrame kind="sponsor" render={(s) => <SponsorView sponsor={s} />} />;
}

function SponsorView({ sponsor }: { sponsor: any }) {
  const { t, tn } = useI18n();
  const data = useFanData();
  const since = useSince();
  usePageMeta({ title: sponsor.name, description: t("partnerPage.sponsorMeta", { name: sponsor.name }), image: isRealImage(sponsor.image) ? sponsor.image : isRealImage(sponsor.logo_url) ? sponsor.logo_url : null });
  const tierKey = TIER_KEY[String(sponsor.tier || "").toLowerCase() as keyof typeof TIER_KEY];
  const events = (data?.events ?? []).filter((e: any) => e.main_sponsor_id === sponsor.id || (e.sponsorIds ?? []).includes(sponsor.id));
  const mainCount = events.filter((e: any) => e.main_sponsor_id === sponsor.id).length;
  const bouts = (data?.bouts ?? []).filter((b) => events.some((e: any) => e.id === b.eventId)).length;
  const next = events.filter((e: any) => isUpcoming(e.end_date || e.date)).sort((a: any, b: any) => time(a.date) - time(b.date))[0] ?? null;
  const sinceText = since(events);
  const facts = [
    sponsor.industry && { icon: <Building2 className={`${iconCls} text-[var(--kk-blue)]`} aria-hidden />, text: <span lang={textLang(sponsor.industry)}>{sponsor.industry}</span> },
    sinceText && { icon: <CalendarDays className={`${iconCls} text-[var(--kk-blue)]`} aria-hidden />, text: t("partnerPage.since", { date: sinceText }) },
  ].filter(Boolean) as { icon: ReactNode; text: ReactNode }[];
  return (
    <>
      <BannerHeader
        back={{ to: "/strategic-partners?tab=sponsors", label: t("partnerPage.backPartners") }}
        eyebrow={tierKey ? t(tierKey) : t("partnerPage.officialSponsor")}
        banner={sponsor.image !== sponsor.logo_url ? sponsor.image : null}
        logo={sponsor.logo_url}
        name={sponsor.name}
        facts={facts}
        shareTitle={sponsor.name}
        actions={sponsor.website_url && <ActionLink href={sponsor.website_url} icon={<Globe className={iconCls} aria-hidden />} primary>{t("partnerPage.website")}</ActionLink>}
      />
      <div className="max-w-6xl mx-auto px-4 md:px-6 py-10 space-y-10">
        {data?.failed && <LoadError onRetry={retryFanData} />}
        {data && (
          <Stats
            items={[
              { icon: <CalendarDays className="w-5 h-5" />, value: events.length, label: tn("partnerPage.statPresented", events.length) },
              { icon: <Crown className="w-5 h-5" />, value: mainCount, label: tn("partnerPage.statMain", mainCount) },
              { icon: <Swords className="w-5 h-5" />, value: bouts, label: tn("partnerPage.statBouts", bouts) },
            ]}
          />
        )}
        <div className="grid lg:grid-cols-[minmax(0,1fr)_320px] gap-10 items-start">
          <div className="space-y-12 min-w-0">
            {next && data && <NightSpotlight label={t("partnerPage.nextPresented")} event={next} data={data} />}
            {(!data || events.length === 0 || events.some((e: any) => e.id !== next?.id)) && (
              <Section title={next ? t("partnerPage.morePresented") : t("partnerPage.presents")}>
                {!data ? <Loading className="py-10" /> : events.length === 0 ? <Empty text={t("partnerPage.noSponsoredNights")} /> : <EventRows events={events} data={data} skip={next?.id} />}
              </Section>
            )}
          </div>
          <aside className="space-y-4 lg:sticky lg:top-24">
            <SideCard title={t("partnerPage.aboutSponsor")}>
              {tierKey && <DetailRow icon={<Crown className={iconCls} />} label={t("partnerPage.level")}>{t(tierKey)}</DetailRow>}
              {sponsor.industry && <DetailRow icon={<Building2 className={iconCls} />} label={t("partnerPage.industry")}><span lang={textLang(sponsor.industry)}>{sponsor.industry}</span></DetailRow>}
              {sinceText && <DetailRow icon={<CalendarDays className={iconCls} />} label={t("partnerPage.firstNight")}>{sinceText}</DetailRow>}
              {sponsor.website_url && <DetailRow icon={<Globe className={iconCls} />} label={t("partnerPage.website")}><a href={sponsor.website_url} target="_blank" rel="noopener noreferrer" className="kk-focus text-[var(--kk-blue)] hover:underline break-all">{sponsor.website_url.replace(/^https?:\/\/(www\.)?/, "").replace(/\/$/, "")}</a></DetailRow>}
            </SideCard>
            <SideCard title={t("partnerPage.becomeTitle")}>
              <p className="text-sm text-gray-700">{t("partnerPage.becomeText")}</p>
              <Link to="/strategic-partners" className="kk-focus inline-flex items-center gap-2 text-sm font-semibold text-[var(--kk-blue)] hover:underline underline-offset-4">
                {t("partnerPage.allPartners")} <ArrowRight className="w-4 h-4" aria-hidden />
              </Link>
            </SideCard>
          </aside>
        </div>
      </div>
    </>
  );
}

/** Next fight night for a sponsor / broadcaster, with the main event. */
function NightSpotlight({ label, event, data }: { label: string; event: any; data: FanData }) {
  const { t, tn } = useI18n();
  const bouts = data.bouts.filter((b) => b.eventId === event.id).sort((a, b) => time(a.date) - time(b.date) || a.sortOrder - b.sortOrder);
  const station = broadcasterForEvent(data, event);
  return (
    <Spotlight
      label={label}
      date={event.date}
      title={event.name}
      eventId={event.id}
      bout={mainEventBout(bouts)}
      subtitle={
        <>
          {event.location && <p className="flex items-start gap-2"><MapPin className={`${iconCls} mt-0.5 text-[var(--kk-red)]`} aria-hidden /><span lang={textLang(event.location)}>{event.location}</span></p>}
          {station && <p className="flex items-center gap-2"><Tv className={`${iconCls} text-[var(--kk-blue)]`} aria-hidden />{t("fights.liveOn", { station: station.name })}</p>}
          {bouts.length > 0 && <p className="flex items-center gap-2"><Trophy className={`${iconCls} text-[var(--kk-gold)]`} aria-hidden />{tn("common.bouts", bouts.length)}</p>}
        </>
      }
    />
  );
}

// ─── Broadcaster ─────────────────────────────────────────────────────────────

export function BroadcasterPage() {
  return <PartnerFrame kind="broadcaster" render={(b) => <BroadcasterView station={b} />} />;
}

function BroadcasterView({ station }: { station: any }) {
  const { t, tn } = useI18n();
  const data = useFanData();
  const since = useSince();
  usePageMeta({ title: station.name, description: t("partnerPage.broadcasterMeta", { name: station.name }), image: isRealImage(station.image) ? station.image : isRealImage(station.logo_url) ? station.logo_url : null });
  const events = (data?.events ?? []).filter((e: any) => e.broadcast_station_id === station.id);
  const upcomingCount = events.filter((e: any) => isUpcoming(e.end_date || e.date)).length;
  const bouts = (data?.bouts ?? []).filter((b) => events.some((e: any) => e.id === b.eventId)).length;
  const next = events.filter((e: any) => isUpcoming(e.end_date || e.date)).sort((a: any, b: any) => time(a.date) - time(b.date))[0] ?? null;
  const sinceText = since(events);
  const facts = [
    station.type && { icon: <Tv className={`${iconCls} text-[var(--kk-blue)]`} aria-hidden />, text: <span lang={textLang(station.type)}>{station.type}</span> },
    station.reach && { icon: <Radio className={`${iconCls} text-[var(--kk-blue)]`} aria-hidden />, text: t("partnerPage.reach", { reach: station.reach }) },
  ].filter(Boolean) as { icon: ReactNode; text: ReactNode }[];
  return (
    <>
      <BannerHeader
        back={{ to: "/strategic-partners?tab=broadcasters", label: t("partnerPage.backPartners") }}
        eyebrow={t("partnerPage.broadcaster")}
        banner={station.image !== station.logo_url ? station.image : null}
        logo={station.logo_url}
        name={station.name}
        facts={facts}
        shareTitle={station.name}
        actions={
          <>
            {station.stream_url && <ActionLink href={station.stream_url} icon={<PlayCircle className={iconCls} aria-hidden />} primary>{t("partnerPage.watchLive")}</ActionLink>}
            {station.website_url && <ActionLink href={station.website_url} icon={<Globe className={iconCls} aria-hidden />} primary={!station.stream_url}>{t("partnerPage.website")}</ActionLink>}
          </>
        }
      />
      <div className="max-w-6xl mx-auto px-4 md:px-6 py-10 space-y-10">
        {data?.failed && <LoadError onRetry={retryFanData} />}
        {data && (
          <Stats
            items={[
              { icon: <Tv className="w-5 h-5" />, value: events.length, label: tn("partnerPage.statAired", events.length) },
              { icon: <CalendarDays className="w-5 h-5" />, value: upcomingCount, label: tn("partnerPage.statComing", upcomingCount) },
              { icon: <Swords className="w-5 h-5" />, value: bouts, label: tn("partnerPage.statBoutsAired", bouts) },
            ]}
          />
        )}
        <div className="grid lg:grid-cols-[minmax(0,1fr)_320px] gap-10 items-start">
          <div className="space-y-12 min-w-0">
            {next && data && (
              <NightSpotlight label={t("partnerPage.nextOnAir")} event={next} data={data} />
            )}
            {(!data || events.length === 0 || events.some((e: any) => e.id !== next?.id)) && (
              <Section title={next ? t("partnerPage.moreAired") : t("partnerPage.airs")}>
                {!data ? <Loading className="py-10" /> : events.length === 0 ? <Empty text={t("partnerPage.noBroadcastNights")} /> : <EventRows events={events} data={data} skip={next?.id} />}
              </Section>
            )}
          </div>
          <aside className="space-y-4 lg:sticky lg:top-24">
            <SideCard title={t("partnerPage.howToWatch")}>
              {station.type && <DetailRow icon={<Tv className={iconCls} />} label={t("partnerPage.channelType")}><span lang={textLang(station.type)}>{station.type}</span></DetailRow>}
              {station.reach && <DetailRow icon={<Radio className={iconCls} />} label={t("partnerPage.coverage")}><span lang={textLang(station.reach)}>{station.reach}</span></DetailRow>}
              {station.stream_url && <DetailRow icon={<PlayCircle className={iconCls} />} label={t("partnerPage.online")}><a href={station.stream_url} target="_blank" rel="noopener noreferrer" className="kk-focus text-[var(--kk-blue)] font-semibold hover:underline">{t("partnerPage.watchLive")}</a></DetailRow>}
              {sinceText && <DetailRow icon={<CalendarDays className={iconCls} />} label={t("partnerPage.firstNight")}>{sinceText}</DetailRow>}
              {station.website_url && <DetailRow icon={<Globe className={iconCls} />} label={t("partnerPage.website")}><a href={station.website_url} target="_blank" rel="noopener noreferrer" className="kk-focus text-[var(--kk-blue)] hover:underline break-all">{station.website_url.replace(/^https?:\/\/(www\.)?/, "").replace(/\/$/, "")}</a></DetailRow>}
              <p className="text-xs text-gray-500">{t("partnerPage.scheduleNote")}</p>
            </SideCard>
          </aside>
        </div>
      </div>
    </>
  );
}
