/**
 * Matches & Events (/matches): the fan's view of fight nights — what's coming up, official
 * results, and every fight night on the calendar. Light style, bouts visible without extra
 * clicks, real data only. Tabs are real URLs: ?tab=upcoming (default) | results | events
 * (old ?tab=matches / previous links still work). See claude/updates/public-matches-page.md and
 * public-matches-page-2.md (latest-night spotlight, tab icons, months + year filter, Hub questions).
 */
import { usePlaceName } from "../data/venues";
import { LoadError } from "../components/LoadError";
import { useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router";
import { ArrowRight, CalendarDays, CalendarPlus, Clock, Crown, MapPin, Search, Sparkles, Trophy, Tv, X } from "lucide-react";
import { BoutRow, FighterAvatar } from "../components/event/EventParts";
import { HubAskAbout } from "../components/hub/HubAskAbout";
import { CountdownChip, DemoBanner, daysUntil } from "../components/fan/FanWidgets";
import { broadcasterForEvent, mainEventBout, useFanData, type Bout, type FanData, retryFanData } from "../data/fanData";
import { weightClassFor } from "../data/weightClasses";
import { downloadCalendarEvent } from "../utils/calendar";
import { textLang } from "../utils/publicDisplay";
import { KM_MONTHS, useI18n } from "../i18n/LanguageContext";
import { eventPath, eventPathById } from "../data/links";

type Tab = "upcoming" | "results" | "events";

function tabFromParam(value: string | null): Tab {
  if (value === "results" || value === "previous") return "results";
  if (value === "events") return "events";
  return "upcoming";
}

/** Stock photos used as placeholders elsewhere never stand in for a real poster. */
const isRealImage = (url?: string | null): url is string => Boolean(url) && !url!.includes("images.unsplash.com");

interface CardGroup {
  key: string;
  eventId?: string;
  eventName?: string;
  /** Link to the event page, added by withQuestions(). */
  eventHref?: string;
  cardName?: string;
  date?: string;
  bouts: Bout[];
}

/** Bouts grouped by fight card, in running order. */
function groupByCard(bouts: Bout[]): CardGroup[] {
  const groups = new Map<string, CardGroup>();
  for (const b of bouts) {
    const key = b.cardId || `${b.eventId}-${b.date}`;
    const g = groups.get(key) ?? { key, eventId: b.eventId, eventName: b.eventName, cardName: b.cardName, date: b.date, bouts: [] };
    g.bouts.push(b);
    groups.set(key, g);
  }
  for (const g of groups.values()) g.bouts.sort((a, b) => a.sortOrder - b.sortOrder);
  return [...groups.values()];
}

const time = (d?: string) => new Date(d || 0).getTime();
const KM_DIGITS = "០១២៣៤៥៦៧៨៩";

type T = ReturnType<typeof useI18n>["t"];

/** The event page's KUNKHMER HUB questions for one fight night (results, what's coming, or about it). */
function hubQuestions(t: T, data: FanData, eventId?: string, name?: string): string[] {
  if (!eventId) return [];
  const bouts = data.bouts.filter((b) => b.eventId === eventId);
  const event = data.events.find((e) => e.id === eventId);
  // Bouts don't always carry the fight night's name; fall back to the event itself.
  const eventName: string | undefined = name || event?.name;
  if (!eventName) return [];
  const upcoming = (daysUntil(event?.end_date || event?.date || bouts[0]?.date) ?? -1) >= 0;
  if (bouts.some((b) => b.completed)) {
    const main = mainEventBout(bouts);
    return [t("hub.askEventResults", { event: eventName }), ...(main?.completed ? [t("hub.askEventMain", { event: eventName })] : [])];
  }
  if (upcoming) return [...(bouts.length ? [t("hub.askEventCard", { event: eventName })] : []), t("hub.askEventWatch", { event: eventName })];
  return [t("hub.askEventAbout", { event: eventName })];
}

/** Hub questions only on the first card of each fight night. */
function withQuestions(groups: CardGroup[], t: T, data: FanData) {
  const seen = new Set<string>();
  return groups.map((g) => {
    const first = Boolean(g.eventId) && !seen.has(g.eventId!);
    if (g.eventId) seen.add(g.eventId);
    return { group: { ...g, eventHref: g.eventId ? eventPathById(data.events, g.eventId) : undefined }, ask: first ? hubQuestions(t, data, g.eventId, g.eventName) : [] };
  });
}

export function MatchesAndEvents() {
  const data = useFanData();
  const { t, tn, formatDate } = useI18n();
  const [params, setParams] = useSearchParams();
  const tab = tabFromParam(params.get("tab"));
  const [query, setQuery] = useState("");
  const [weight, setWeight] = useState("all");
  const [year, setYear] = useState("all");

  const setTab = (next: Tab) => {
    const p = new URLSearchParams(params);
    if (next === "upcoming") p.delete("tab");
    else p.set("tab", next);
    setParams(p, { replace: true });
  };

  const view = useMemo(() => (data ? buildView(data) : null), [data]);

  // Filters (search by fighter, club, card or event; weight class).
  const matches = (b: Bout) => {
    if (weight !== "all") {
      const wc = data ? weightClassFor(b.weightKg, data.weightClasses) : null;
      if ((wc?.id ?? "none") !== weight) return false;
    }
    const q = query.trim().toLowerCase();
    if (!q) return true;
    return [b.fighterA.name, b.fighterA.nameKhmer, b.fighterA.club, b.fighterB.name, b.fighterB.nameKhmer, b.fighterB.club, b.eventName, b.cardName]
      .some((s) => s?.toLowerCase().includes(q));
  };
  const filtering = query.trim() !== "" || weight !== "all";

  const weightOptions = useMemo(() => {
    if (!data) return [];
    const used = new Set(data.bouts.map((b) => weightClassFor(b.weightKg, data.weightClasses)?.id).filter(Boolean));
    return data.weightClasses.filter((w) => used.has(w.id));
  }, [data]);

  if (!data || !view) {
    return (
      <div className="space-y-6" aria-busy="true">
        <div className="h-40 rounded-3xl bg-gradient-to-b from-[#eef3fb] to-white animate-pulse" />
        <div className="h-64 rounded-3xl bg-gray-50 animate-pulse" />
      </div>
    );
  }

  const upcomingGroups = groupByCard(view.upcoming.filter(matches));
  const resultGroups = groupByCard(view.results.filter(matches)).sort((a, b) => time(b.date) - time(a.date));
  const pendingGroups = groupByCard(view.pending.filter(matches)).sort((a, b) => time(b.date) - time(a.date));
  const eventQuery = query.trim().toLowerCase();
  const eventsShown = (list: any[]) => (eventQuery ? list.filter((e) => [e.name, e.location].some((s: string) => s?.toLowerCase().includes(eventQuery))) : list);

  const tabs: { id: Tab; label: string; count: number; icon: React.ReactNode }[] = [
    { id: "upcoming", label: t("fights.tabUpcoming"), count: view.upcoming.length, icon: <Clock className="w-4 h-4" aria-hidden /> },
    { id: "results", label: t("fights.tabResults"), count: view.results.length, icon: <Trophy className="w-4 h-4" aria-hidden /> },
    { id: "events", label: t("fights.tabEvents"), count: view.upcomingEvents.length + view.pastEvents.length, icon: <CalendarDays className="w-4 h-4" aria-hidden /> },
  ];
  const pastYears = [...new Set(view.pastEvents.map((e) => new Date(e.date).getUTCFullYear()).filter((y) => !isNaN(y)))].sort((a, b) => b - a);
  const pastShown = eventsShown(view.pastEvents).filter((e) => year === "all" || String(new Date(e.date).getUTCFullYear()) === year);

  return (
    <div className="space-y-8">
      {/* Header */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#eef3fb] via-white to-[#fdf1f3] border border-[#d5e0f3] px-6 py-8 md:px-10 md:py-10">
        <p className="kk-label text-[var(--kk-red)]">{t("fights.eyebrow")}</p>
        <h1 className="kk-heading text-3xl md:text-5xl text-[var(--kk-navy)] mt-1">{t("matches.title")}</h1>
        <p className="mt-2 text-base md:text-lg text-gray-600 max-w-2xl">{t("fights.lead")}</p>
        <div className="mt-6 grid grid-cols-3 gap-2 sm:flex sm:flex-wrap sm:gap-3">
          {view.upcomingEvents.length > 0 && <Stat icon={<CalendarDays className="w-4 h-4" />} value={view.upcomingEvents.length} label={tn("fights.statNights", view.upcomingEvents.length)} />}
          {view.upcoming.length > 0 && <Stat icon={<Trophy className="w-4 h-4" />} value={view.upcoming.length} label={tn("fights.statBouts", view.upcoming.length)} />}
          {view.results.length > 0 && <Stat icon={<Crown className="w-4 h-4" />} value={view.results.length} label={tn("fights.statResults", view.results.length)} />}
        </div>
      </section>

      <DemoBanner show={data.demo} />
      {data.failed && <LoadError onRetry={retryFanData} />}

      {/* Tabs + filters */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div role="tablist" aria-label={t("matches.title")} className="inline-flex w-full sm:w-auto p-1 rounded-2xl bg-gray-100 overflow-x-auto">
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
        <div className="flex flex-col sm:flex-row gap-2 w-full lg:w-auto">
          <label className="relative flex-1 lg:w-72">
            <span className="sr-only">{t("fights.search")}</span>
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" aria-hidden />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={tab === "events" ? t("fights.searchEvents") : t("fights.search")}
              className="kk-focus w-full h-11 pl-9 pr-3 rounded-xl border border-gray-200 bg-white text-sm"
            />
          </label>
          {tab !== "events" && weightOptions.length > 1 && (
            <label>
              <span className="sr-only">{t("fights.weight")}</span>
              <select value={weight} onChange={(e) => setWeight(e.target.value)} className="kk-focus w-full sm:w-auto h-11 px-3 rounded-xl border border-gray-200 bg-white text-sm">
                <option value="all">{t("fights.allWeights")}</option>
                {weightOptions.map((w) => (
                  <option key={w.id} value={w.id}>{w.name}</option>
                ))}
              </select>
            </label>
          )}
          {filtering && (
            <button type="button" onClick={() => { setQuery(""); setWeight("all"); }} className="kk-focus h-11 px-3 rounded-xl text-sm font-semibold text-gray-600 hover:bg-gray-100 inline-flex items-center justify-center gap-1">
              <X className="w-4 h-4" aria-hidden /> {t("common.clearFilters")}
            </button>
          )}
        </div>
      </div>

      {/* Upcoming */}
      {tab === "upcoming" && (
        <div className="space-y-8">
          {!filtering && view.nextEvent && <NextFightNight data={data} event={view.nextEvent} />}
          {upcomingGroups.length === 0 ? (
            filtering ? <NoMatch /> : !view.nextEvent && (
              <>
                {/* Nothing scheduled: show the latest fight night rather than an empty page. */}
                {view.latestEvent && (
                  <div className="space-y-3">
                    <NextFightNight data={data} event={view.latestEvent} past />
                    <HubAskAbout questions={hubQuestions(t, data, view.latestEvent.id, view.latestEvent.name)} />
                  </div>
                )}
                <Empty
                  compact={Boolean(view.latestEvent)}
                  title={t("matches.noCards")}
                  text={t("matches.noCardsText")}
                  onResults={() => setTab("results")}
                  showResults={!view.latestEvent && (view.results.length > 0 || view.pending.length > 0)}
                />
              </>
            )
          ) : (
            withQuestions(upcomingGroups, t, data).map(({ group, ask }) => <CardSection key={group.key} group={group} ask={ask} />)
          )}
        </div>
      )}

      {/* Results */}
      {tab === "results" && (
        <div className="space-y-8">
          {resultGroups.length === 0 && pendingGroups.length === 0 ? (
            filtering ? <NoMatch /> : <Empty title={t("matches.noResults")} text={t("matches.noResultsText")} />
          ) : (
            <>
              {withQuestions(resultGroups, t, data).map(({ group, ask }) => <CardSection key={group.key} group={group} ask={ask} result />)}
              {pendingGroups.length > 0 && (
                <section aria-labelledby="pending-title" className="space-y-3">
                  <h2 id="pending-title" className="kk-heading text-lg text-gray-900 flex items-center gap-2">
                    <Clock className="w-5 h-5 text-gray-400" aria-hidden /> {t("fights.pendingTitle")}
                  </h2>
                  <p className="text-sm text-gray-600">{t("fights.pendingText")}</p>
                  <ul className="grid sm:grid-cols-2 gap-3">
                    {pendingGroups.map((g) => (
                      <li key={g.key}>
                        <Link to={g.eventId ? eventPathById(data.events, g.eventId) : "/matches?tab=events"} className="kk-focus block rounded-2xl border border-gray-200 bg-white p-4 hover:border-[var(--kk-blue)]/40 hover:shadow-sm transition">
                          <p className="text-xs font-semibold text-gray-500">{formatDate(g.date, "weekday")}</p>
                          <p lang={textLang(g.cardName || g.eventName)} className="font-bold text-gray-900 mt-0.5">{g.cardName || g.eventName}</p>
                          <p className="text-sm text-gray-500 mt-0.5">{tn("common.bouts", g.bouts.length)} · {t("fights.awaiting")}</p>
                        </Link>
                      </li>
                    ))}
                  </ul>
                </section>
              )}
            </>
          )}
        </div>
      )}

      {/* All fight nights */}
      {tab === "events" && (
        <div className="space-y-8">
          {view.upcomingEvents.length + view.pastEvents.length === 0 ? (
            <Empty title={t("matches.noEvents")} text={t("matches.noEventsText")} />
          ) : (
            <>
              <EventGrid title={t("fights.upcomingNights")} events={eventsShown(view.upcomingEvents)} data={data} emptyText={eventQuery ? undefined : t("fights.noUpcomingNights")} />
              <PastEvents events={pastShown} data={data} years={pastYears} year={year} onYear={setYear} />
              {(eventQuery || year !== "all") && eventsShown(view.upcomingEvents).length + pastShown.length === 0 && <NoMatch />}
            </>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Derived view ────────────────────────────────────────────────────────────

function buildView(data: FanData) {
  const isUpcoming = (d?: string) => (daysUntil(d) ?? 0) >= 0;
  const eventDay = (e: any) => e.end_date || e.date;
  const upcoming = data.bouts.filter((b) => !b.completed && isUpcoming(b.date)).sort((a, b) => time(a.date) - time(b.date) || a.sortOrder - b.sortOrder);
  const results = data.bouts.filter((b) => b.completed);
  const pending = data.bouts.filter((b) => !b.completed && !isUpcoming(b.date));
  const upcomingEvents = data.events.filter((e) => isUpcoming(eventDay(e))).sort((a, b) => time(a.date) - time(b.date));
  const pastEvents = data.events.filter((e) => !isUpcoming(eventDay(e))).sort((a, b) => time(b.date) - time(a.date));
  return { upcoming, results, pending, upcomingEvents, pastEvents, nextEvent: upcomingEvents[0] ?? null, latestEvent: pastEvents[0] ?? null };
}

// ─── Pieces ──────────────────────────────────────────────────────────────────

/** Month + day badge, in the site language (Khmer month names by hand; many browsers lack them). */
function DateBlock({ date, size }: { date?: string; size: "sm" | "lg" }) {
  const { lang, formatNumber } = useI18n();
  const d = new Date(date || "");
  if (isNaN(d.getTime())) return null;
  const month = lang === "km" ? KM_MONTHS[d.getUTCMonth()] : d.toLocaleDateString("en", { month: "short", timeZone: "UTC" });
  return (
    <>
      <p lang={lang} className="kk-label text-[var(--kk-red)]">{month}</p>
      <p className={`kk-stat text-[var(--kk-navy)] leading-none ${size === "lg" ? "text-5xl" : "text-3xl"}`}>{formatNumber(d.getUTCDate())}</p>
    </>
  );
}

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

/** The next fight night, or with `past` the latest one (shown when nothing is scheduled). */
function NextFightNight({ data, event, past = false }: { data: FanData; event: any; past?: boolean }) {
  const { t, tn, formatDate } = useI18n();
  const placeName = usePlaceName();
  const bouts = data.bouts.filter((b) => b.eventId === event.id).sort((a, b) => time(a.date) - time(b.date) || a.sortOrder - b.sortOrder);
  const main = mainEventBout(bouts);
  const station = broadcasterForEvent(data, event);
  const hasResults = bouts.some((b) => b.completed);
  return (
    <section aria-labelledby="next-night" className="rounded-3xl border border-[#d5e0f3] bg-white overflow-hidden shadow-[0_10px_40px_rgba(26,71,151,0.06)]">
      <div className="grid md:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)]">
        <div className="p-6 md:p-8 flex flex-col gap-4">
          <div className="flex flex-wrap items-center gap-2">
            <span className="kk-label text-[var(--kk-red)]">{t(past ? "fights.latestNight" : "fights.nextNight")}</span>
            {past ? (
              !hasResults && <span className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-semibold text-gray-600"><Clock className="w-3.5 h-3.5" aria-hidden />{t("fights.pendingTitle")}</span>
            ) : (
              <CountdownChip date={event.date} />
            )}
          </div>
          <div className="flex items-start gap-4">
            <div className="shrink-0 w-16 rounded-2xl border border-[#d5e0f3] bg-[#eef3fb] text-center py-2" aria-hidden>
              <DateBlock date={event.date} size="sm" />
            </div>
            <div className="min-w-0">
              <h2 id="next-night" lang={textLang(event.name)} className="kk-heading text-2xl md:text-3xl text-gray-900 break-words">{event.name}</h2>
              <p className="text-sm text-gray-600 mt-1">{formatDate(event.date, "long")}</p>
            </div>
          </div>
          <ul className="space-y-2 text-sm text-gray-700">
            {event.location && (
              <li className="flex items-start gap-2"><MapPin className="w-4 h-4 mt-0.5 text-[var(--kk-red)] shrink-0" aria-hidden /><span lang={textLang(placeName(event.location))}>{placeName(event.location)}</span></li>
            )}
            {station && (
              <li className="flex items-center gap-2"><Tv className="w-4 h-4 text-[var(--kk-blue)] shrink-0" aria-hidden />{past ? station.name : t("fights.liveOn", { station: station.name })}</li>
            )}
            {bouts.length > 0 && (
              <li className="flex items-center gap-2"><Trophy className="w-4 h-4 text-[var(--kk-gold)] shrink-0" aria-hidden />{tn("common.bouts", bouts.length)}</li>
            )}
          </ul>
          <div className="flex flex-wrap gap-2 mt-auto pt-2">
            <Link to={`${eventPath(event)}${past && hasResults ? "?view=results" : ""}`} className="kk-focus inline-flex items-center gap-2 h-11 px-5 rounded-xl bg-[var(--kk-blue)] text-white text-sm font-semibold hover:bg-[var(--kk-navy)] transition">
              {t(past && hasResults ? "fights.seeResults" : "fights.viewCard")} <ArrowRight className="w-4 h-4" aria-hidden />
            </Link>
            {!past && <button
              type="button"
              onClick={() => downloadCalendarEvent({ id: event.id, title: event.name, date: event.date, location: event.location ?? undefined, url: `${window.location.origin}${eventPath(event)}` })}
              className="kk-focus inline-flex items-center gap-2 h-11 px-4 rounded-xl border border-gray-200 bg-white text-sm font-semibold text-gray-700 hover:border-gray-300"
            >
              <CalendarPlus className="w-4 h-4" aria-hidden /> {t("fights.addToCalendar")}
            </button>}
          </div>
        </div>
        <div className="bg-gradient-to-br from-[#eef3fb] to-[#fdf1f3] p-6 md:p-8 flex items-center justify-center">
          {main ? <FaceOff bout={main} /> : isRealImage(event.image) ? (
            <img src={event.image} alt="" className="w-full max-h-72 object-cover rounded-2xl" />
          ) : (
            <p className="text-sm text-gray-600 text-center">{t("fights.cardSoon")}</p>
          )}
        </div>
      </div>
    </section>
  );
}

function FaceOff({ bout }: { bout: Bout }) {
  const { t, localName, formatWeight, tn } = useI18n();
  const side = (f: Bout["fighterA"], corner: "red" | "blue") => {
    const name = f.name && f.name !== "TBD" ? localName(f.name, f.nameKhmer) : t("event.tba");
    return (
      <div className="flex flex-col items-center text-center gap-2 min-w-0">
        <FighterAvatar f={f} corner={corner} size="lg" className="bg-white" />
        <p className={`kk-label ${corner === "red" ? "text-[var(--kk-red)]" : "text-[var(--kk-blue)]"}`}>{t(corner === "red" ? "matchup.red" : "matchup.blue")}</p>
        <p lang={textLang(name)} className="kk-heading text-lg md:text-xl text-gray-900 break-words leading-tight">{name}</p>
        {f.record && <p className="kk-stat text-sm text-gray-500">{f.record}</p>}
      </div>
    );
  };
  const facts = [bout.weightKg ? formatWeight(bout.weightKg) : null, bout.rounds ? tn("common.rounds", bout.rounds) : null].filter(Boolean);
  return (
    <div className="w-full">
      <p className="kk-label text-center text-[#7A5B00] mb-4 flex items-center justify-center gap-1.5">
        {bout.isTitle && <Crown className="w-4 h-4" aria-hidden />}
        {t(bout.isTitle ? "matches.titleBout" : "matches.mainEvent")}
      </p>
      <div className="grid grid-cols-[1fr_auto_1fr] items-start gap-3">
        {side(bout.fighterA, "red")}
        <span className="kk-display text-3xl md:text-5xl text-gray-300 self-center pb-8" aria-hidden>VS</span>
        {side(bout.fighterB, "blue")}
      </div>
      {facts.length > 0 && <p className="text-center text-sm font-semibold text-gray-600 mt-4">{facts.join(" · ")}</p>}
    </div>
  );
}

function CardSection({ group, result = false, ask = [] }: { group: CardGroup; result?: boolean; ask?: string[] }) {
  const { t, tn, formatDate } = useI18n();
  const title = group.cardName || group.eventName || t("event.fightNight");
  return (
    <section aria-label={title} className="space-y-3">
      <header className="flex flex-wrap items-end justify-between gap-3 border-b border-gray-200 pb-3">
        <div className="min-w-0">
          <p className="text-sm font-semibold text-[var(--kk-red)] flex flex-wrap items-center gap-2">
            <CalendarDays className="w-4 h-4" aria-hidden />
            {formatDate(group.date, "weekday")}
            {!result && <CountdownChip date={group.date} />}
          </p>
          <h2 lang={textLang(title)} className="kk-heading text-xl md:text-2xl text-gray-900 mt-1 break-words">{title}</h2>
          {group.eventName && group.cardName && group.eventName !== group.cardName && (
            <p lang={textLang(group.eventName)} className="text-sm text-gray-600">{group.eventName}</p>
          )}
        </div>
        <div className="flex items-center gap-3">
          <span className="text-sm text-gray-500">{tn("common.bouts", group.bouts.length)}</span>
          {group.eventHref && (
            <Link to={`${group.eventHref}${result ? "?view=results" : ""}`} className="kk-focus inline-flex items-center gap-1.5 text-sm font-semibold text-[var(--kk-blue)] hover:underline underline-offset-4">
              {t("fights.viewEvent")} <ArrowRight className="w-4 h-4" aria-hidden />
            </Link>
          )}
        </div>
      </header>
      <ol className="space-y-3">
        {group.bouts.map((b, i) => (
          <BoutRow key={b.id} bout={b} number={i + 1} result={result} />
        ))}
      </ol>
      {ask.length > 0 && <HubAskAbout questions={ask} />}
    </section>
  );
}

function EventGrid({ title, events, data, emptyText }: { title: string; events: any[]; data: FanData; emptyText?: string }) {
  if (events.length === 0 && !emptyText) return null;
  return (
    <section className="space-y-3">
      <h2 className="kk-heading text-xl text-gray-900">{title}</h2>
      {events.length === 0 ? (
        <p className="text-sm text-gray-600 rounded-2xl border border-dashed border-gray-300 bg-white p-5">{emptyText}</p>
      ) : (
        <ul className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {events.map((e) => <EventTile key={e.id} e={e} data={data} />)}
        </ul>
      )}
    </section>
  );
}

/** Past fight nights, newest first, under month headings; a year filter when they span several years. */
function PastEvents({ events, data, years, year, onYear }: { events: any[]; data: FanData; years: number[]; year: string; onYear: (y: string) => void }) {
  const { t, lang } = useI18n();
  if (events.length === 0 && years.length <= 1) return null;
  const months = new Map<string, any[]>();
  for (const e of events) {
    const d = new Date(e.date);
    const key = isNaN(d.getTime()) ? "?" : `${d.getUTCFullYear()}-${String(d.getUTCMonth()).padStart(2, "0")}`;
    months.set(key, [...(months.get(key) ?? []), e]);
  }
  const monthLabel = (key: string) => {
    if (key === "?") return "";
    const [y, m] = key.split("-").map(Number);
    return lang === "km"
      ? `ខែ${KM_MONTHS[m]} ឆ្នាំ${String(y).replace(/\d/g, (x) => KM_DIGITS[Number(x)])}`
      : new Date(Date.UTC(y, m, 1)).toLocaleDateString("en", { month: "long", year: "numeric", timeZone: "UTC" });
  };
  return (
    <section className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="kk-heading text-xl text-gray-900">{t("matches.pastEvents")}</h2>
        {years.length > 1 && (
          <label>
            <span className="sr-only">{t("fights.year")}</span>
            <select value={year} onChange={(e) => onYear(e.target.value)} className="kk-focus h-11 px-3 rounded-xl border border-gray-200 bg-white text-sm">
              <option value="all">{t("fights.allYears")}</option>
              {years.map((y) => <option key={y} value={String(y)}>{lang === "km" ? String(y).replace(/\d/g, (x) => KM_DIGITS[Number(x)]) : y}</option>)}
            </select>
          </label>
        )}
      </div>
      {[...months.entries()].map(([key, list]) => (
        <div key={key} className="space-y-3">
          {monthLabel(key) && <h3 lang={lang} className="text-sm font-semibold text-gray-500 border-b border-gray-200 pb-2">{monthLabel(key)}</h3>}
          <ul className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {list.map((e) => <EventTile key={e.id} e={e} data={data} />)}
          </ul>
        </div>
      ))}
    </section>
  );
}

function EventTile({ e, data }: { e: any; data: FanData }) {
  const { t, tn, formatDate } = useI18n();
  const placeName = usePlaceName();
  const bouts = data.bouts.filter((b) => b.eventId === e.id).length;
  const station = broadcasterForEvent(data, e);
  return (
    <li>
      <Link to={eventPath(e)} className="kk-focus group flex flex-col h-full rounded-2xl border border-gray-200 bg-white overflow-hidden hover:border-[var(--kk-blue)]/40 hover:shadow-md transition">
        {isRealImage(e.image) ? (
          // The poster shows whole (wide banners stay wide, tall posters are capped), and the countdown sits below it, not over the artwork.
          <img src={e.image} alt="" className="w-full h-auto max-h-64 object-cover object-top bg-[#eef3fb]" />
        ) : (
          <div className="relative h-36 bg-gradient-to-br from-[#eef3fb] to-[#fdf1f3] flex items-center justify-center">
            <div className="text-center" aria-hidden>
              <DateBlock date={e.date} size="lg" />
            </div>
            <span className="absolute top-3 left-3"><CountdownChip date={e.date} /></span>
          </div>
        )}
        <div className="p-4 flex flex-col gap-1.5 flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <p className="text-xs font-semibold text-gray-500">{formatDate(e.date, "weekday")}</p>
            {isRealImage(e.image) && <CountdownChip date={e.date} />}
          </div>
          <p lang={textLang(e.name)} className="font-bold text-gray-900 leading-snug group-hover:text-[var(--kk-blue)] break-words">{e.name}</p>
          {e.location && <p lang={textLang(placeName(e.location))} className="text-sm text-gray-600 flex items-start gap-1.5"><MapPin className="w-3.5 h-3.5 mt-0.5 text-[var(--kk-red)] shrink-0" aria-hidden />{placeName(e.location)}</p>}
          {station && <p className="text-sm text-gray-600 flex items-center gap-1.5"><Tv className="w-3.5 h-3.5 text-[var(--kk-blue)] shrink-0" aria-hidden />{station.name}</p>}
          <p className="mt-auto pt-2 text-sm font-semibold text-[var(--kk-blue)] flex items-center justify-between">
            <span>{bouts > 0 ? tn("common.bouts", bouts) : t("fights.cardSoonShort")}</span>
            <ArrowRight className="w-4 h-4 transition group-hover:translate-x-0.5" aria-hidden />
          </p>
        </div>
      </Link>
    </li>
  );
}

function Empty({ title, text, onResults, showResults, compact = false }: { title: string; text: string; onResults?: () => void; showResults?: boolean; compact?: boolean }) {
  const { t } = useI18n();
  return (
    <div className={`rounded-3xl border border-dashed border-gray-300 bg-white px-6 text-center ${compact ? "py-8" : "py-12"}`}>
      <div className="w-14 h-14 mx-auto rounded-2xl bg-[#eef3fb] text-[var(--kk-blue)] flex items-center justify-center mb-4"><CalendarDays className="w-7 h-7" aria-hidden /></div>
      <h2 className="kk-heading text-xl text-gray-900">{title}</h2>
      <p className="text-gray-600 mt-1 max-w-md mx-auto">{text}</p>
      <div className="mt-6 flex flex-wrap justify-center gap-2">
        {onResults && showResults && (
          <button type="button" onClick={onResults} className="kk-focus h-11 px-5 rounded-xl bg-[var(--kk-blue)] text-white text-sm font-semibold hover:bg-[var(--kk-navy)]">
            {t("fights.seeResults")}
          </button>
        )}
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
