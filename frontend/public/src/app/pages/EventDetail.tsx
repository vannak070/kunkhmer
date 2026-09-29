/**
 * Public event page at /events/<name>-<code> (data/links.ts) in the site's light style: poster (or the main-event face-off),
 * date / venue / broadcaster, countdown, key numbers, then Fight card · Results · Where to watch,
 * each with its own URL (?view=card|results|watch). A tab without data is hidden. A past night
 * without results says so. Events store a calendar day only, so the countdown is in days.
 * See claude/updates/event-compare-articles.md.
 */
import { LoadError } from "../components/LoadError";
import { useEffect, useMemo, useState, type ReactNode } from "react";
import { Link, useLocation, useNavigate, useParams, useSearchParams } from "react-router";
import { eventPath, findByLink } from "../data/links";
import { ArrowLeft, Building2, Calendar, Clock, Crown, MapPin, Swords, Tv } from "lucide-react";
import { SiteHeader } from "../components/layout/SiteHeader";
import { SiteFooter } from "../components/layout/SiteFooter";
import { HubAskAbout } from "../components/hub/HubAskAbout";
import { CountdownChip, DemoBanner, WhereToWatch, daysUntil } from "../components/fan/FanWidgets";
import { BoutRow, SponsorStrip, type EventSponsor } from "../components/event/EventParts";
import { FaceOff } from "../components/detail/DetailParts";
import { PresentedBy } from "../components/home/HomePage";
import { PublicStatusBadge } from "../components/PublicStatusBadge";
import { ShareButtons } from "../components/ShareButtons";
import { broadcasterForEvent, eventBouts, mainEventBout, useFanData, type Bout, retryFanData } from "../data/fanData";
import { downloadCalendarEvent } from "../utils/calendar";
import { partnerSlug } from "../data/partners";
import { publicName, textLang } from "../utils/publicDisplay";
import { usePageMeta } from "../hooks/usePageTitle";
import { useI18n } from "../i18n/LanguageContext";

type View = "card" | "results" | "watch";

interface CardGroup {
  key: string;
  name?: string;
  date?: string;
  bouts: Bout[];
}

function groupByCard(bouts: Bout[]): CardGroup[] {
  const groups: CardGroup[] = [];
  for (const b of bouts) {
    const key = b.cardId || b.cardName || "card";
    let g = groups.find((x) => x.key === key);
    if (!g) groups.push((g = { key, name: b.cardName, date: b.date, bouts: [] }));
    g.bouts.push(b);
  }
  return groups;
}

export function EventDetail() {
  const { id: key } = useParams();
  const { t, tn, formatDate } = useI18n();
  const data = useFanData();
  const [params, setParams] = useSearchParams();
  const [widePoster, setWidePoster] = useState(false);

  // /events/<words>-<code>, or the full id from older links (then switched to the readable link).
  const event = findByLink(data?.events, key);
  const id = event?.id;
  const location = useLocation();
  const navigate = useNavigate();
  useEffect(() => {
    if (event && location.pathname !== eventPath(event)) navigate({ pathname: eventPath(event), search: location.search }, { replace: true });
  }, [event, location.pathname]);
  const bouts = useMemo(() => (data && id ? eventBouts(data, id) : []), [data, id]);
  const completed = bouts.filter((b) => b.completed);
  const main = mainEventBout(bouts);
  const broadcaster = data && event ? broadcasterForEvent(data, event) : null;
  const stationName: string | undefined = broadcaster?.name || event?.broadcast_station_name || undefined;

  const lastDay = event?.end_date || event?.date;
  const upcoming = Boolean(event) && (daysUntil(lastDay) ?? 0) >= 0;
  const cards = groupByCard(bouts);
  // Bout numbers follow the full programme, so results keep the numbers from the fight card.
  const boutNumber = new Map(cards.flatMap((c) => c.bouts.map((b, i) => [b.id, i + 1] as const)));

  const views: View[] = [];
  if (bouts.length > 0 || !completed.length) views.push("card");
  if (completed.length > 0) views.push("results");
  if (upcoming && stationName) views.push("watch");
  const fallback: View = !upcoming && completed.length > 0 ? "results" : views[0];
  const requested = params.get("view") as View | null;
  const view: View = requested && views.includes(requested) ? requested : fallback;

  usePageMeta({
    title: event?.name ?? (data ? t("event.notFound") : null),
    description: event?.description || null,
    image: event?.image || null,
  });

  const sponsors: EventSponsor[] = ((event?.sponsors as any[]) || []).map((s) => ({
    id: s.id,
    name: s.name,
    logo: s.logo_url || s.image || null,
    url: s.website_url || null,
  }));
  if (sponsors.length === 0 && event?.main_sponsor_name) {
    sponsors.push({ id: event.main_sponsor_id || "main", name: event.main_sponsor_name, logo: event.main_sponsor_logo_url || null });
  }
  const organizer = event ? publicName(event.organizer_name, null) : null;
  const mainSponsor = event?.main_sponsor_name
    ? sponsors.find((s) => s.id === event.main_sponsor_id) ?? { id: "main", name: event.main_sponsor_name, logo: event.main_sponsor_logo_url || null, url: null }
    : null;

  const tabLabel: Record<View, string> = {
    card: t("event.tabCard"),
    results: t("matches.tabResults"),
    watch: t("watch.title"),
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <SiteHeader activeSection="matches" />

      <main className="flex-1">
        {!data ? (
          <div className="py-32 flex justify-center">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[var(--kk-blue)]" />
          </div>
        ) : !event && data.failed ? (
          <div className="max-w-3xl mx-auto px-4 py-16"><LoadError onRetry={retryFanData} /></div>
        ) : !event ? (
          <div className="max-w-xl mx-auto px-4 py-24 text-center">
            <h1 className="kk-heading text-4xl text-gray-900 mb-3">{t("event.notFound")}</h1>
            <p className="text-gray-600 mb-8">{t("event.notFoundText")}</p>
            <Link to="/matches?tab=events" className="kk-focus inline-flex items-center gap-2 min-h-11 px-6 rounded-xl bg-[var(--kk-blue)] text-white font-semibold">
              <ArrowLeft className="w-4 h-4" aria-hidden />
              {t("event.allEvents")}
            </Link>
          </div>
        ) : (
          <>
            {/* Header */}
            <section className="bg-gradient-to-b from-[#eef3fb] to-gray-50 border-b border-[#d5e0f3]">
              <div className="max-w-7xl mx-auto px-4 md:px-6 pt-6 pb-10">
                <Link to="/matches?tab=events" className="kk-focus inline-flex items-center gap-2 text-sm font-semibold text-gray-600 hover:text-gray-900 mb-6">
                  <ArrowLeft className="w-4 h-4" aria-hidden />
                  {t("event.allEvents")}
                </Link>

                <div className={`grid gap-8 lg:gap-12 items-start ${(event.image && !widePoster) || (!event.image && main) ? "lg:grid-cols-[minmax(0,6fr)_minmax(0,6fr)]" : ""}`}>
                  {event.image ? (
                    // A wide (banner) poster runs across the top; a tall one sits beside the details.
                    <div className={widePoster ? "" : "lg:sticky lg:top-24"}>
                      <img
                        src={event.image}
                        alt={event.name}
                        onLoad={(e) => setWidePoster(e.currentTarget.naturalWidth > e.currentTarget.naturalHeight * 1.3)}
                        className={`w-full h-auto object-contain rounded-3xl border border-[#d5e0f3] bg-white shadow-[0_10px_40px_rgba(26,71,151,0.12)] ${widePoster ? "max-h-[440px]" : "max-h-[640px]"}`}
                      />
                    </div>
                  ) : main ? (
                    <div className="rounded-3xl border border-[#d5e0f3] bg-gradient-to-br from-white to-[#fdf1f3] p-6 md:p-8 shadow-sm">
                      <p className="kk-label text-center text-[#7A5B00] mb-4 flex items-center justify-center gap-1.5">
                        {main.isTitle && <Crown className="w-4 h-4" aria-hidden />}{t(main.isTitle ? "matches.titleBout" : "matches.mainEvent")}
                      </p>
                      <FaceOff bout={main} />
                    </div>
                  ) : null}

                  <div className={`min-w-0 ${widePoster ? "grid lg:grid-cols-[minmax(0,7fr)_minmax(0,5fr)] gap-x-10 gap-y-5 items-start" : "space-y-5"}`}>
                    <div className={`space-y-5 ${widePoster ? "lg:row-span-2" : ""}`}>
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="kk-label text-[var(--kk-red)] mr-1">{t("event.fightNight")}</span>
                      <PublicStatusBadge status={event.status} />
                      {upcoming && <CountdownChip date={event.date} />}
                      {completed.length > 0 && (
                        <span className="px-3 py-1.5 rounded-lg text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">{t("event.resultsIn")}</span>
                      )}
                      {!upcoming && completed.length === 0 && bouts.length > 0 && (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-white border border-gray-200 text-gray-700"><Clock className="w-3.5 h-3.5" aria-hidden />{t("fights.pendingTitle")}</span>
                      )}
                    </div>

                    <h1 lang={textLang(event.name)} className="kk-heading text-4xl md:text-5xl xl:text-6xl text-[var(--kk-navy)] break-words leading-[1.05]">{event.name}</h1>

                    {/* Key facts */}
                    <dl className="rounded-2xl bg-white border border-[#d5e0f3] divide-y divide-gray-100 shadow-sm">
                      <FactRow icon={<Calendar className="w-4 h-4" />} label={t("matches.date")}>
                        {event.end_date && event.end_date !== event.date
                          ? `${formatDate(event.date, "long")} – ${formatDate(event.end_date, "long")}`
                          : formatDate(event.date, "long")}
                      </FactRow>
                      <FactRow icon={<MapPin className="w-4 h-4" />} label={t("matches.venue")} tone="red">
                        <span lang={textLang(event.location)}>{event.location || t("matches.venueTba")}</span>
                        {event.location && (
                          <a href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(event.location)}`} target="_blank" rel="noopener noreferrer" className="kk-focus ml-2 text-sm font-semibold text-[var(--kk-blue)] hover:underline underline-offset-4 whitespace-nowrap">{t("club.map")}</a>
                        )}
                      </FactRow>
                      {stationName && (
                        <FactRow icon={<Tv className="w-4 h-4" />} label={t("matches.broadcast")}>
                          {broadcaster ? (
                            <Link to={`/partners/broadcasters/${partnerSlug(broadcaster)}`} className="kk-focus hover:underline underline-offset-4">{t("home.broadcastOn", { name: stationName })}</Link>
                          ) : t("home.broadcastOn", { name: stationName })}
                        </FactRow>
                      )}
                      {organizer && (
                        <FactRow icon={<Building2 className="w-4 h-4" />} label={t("matches.organizer")}>
                          <span lang={textLang(organizer)}>{organizer}</span>
                        </FactRow>
                      )}
                      {bouts.length > 0 && (
                        <FactRow icon={<Swords className="w-4 h-4" />} label={t("event.tabCard")}>
                          {[
                            tn("common.bouts", bouts.length),
                            cards.length > 1 ? `${cards.length} ${tn("event.cards", cards.length).toLowerCase()}` : null,
                            bouts.some((b) => b.isTitle) ? `${bouts.filter((b) => b.isTitle).length} ${tn("event.titleBouts", bouts.filter((b) => b.isTitle).length).toLowerCase()}` : null,
                          ].filter(Boolean).join(" · ")}
                        </FactRow>
                      )}
                    </dl>
                    </div>

                    <div className="space-y-5">
                    {/* About this event */}
                    {event.description && <AboutText text={event.description} />}

                    {mainSponsor && (
                      <div className="flex items-center gap-3 rounded-2xl bg-white/70 border border-[#d5e0f3] px-4 py-3">
                        <PresentedBy sponsor={{ ...mainSponsor, logo: mainSponsor.logo ?? null, url: mainSponsor.url ?? null }} />
                      </div>
                    )}

                    <div className="flex flex-wrap items-center gap-2">
                      {upcoming && (
                        <button
                          type="button"
                          onClick={() => downloadCalendarEvent({
                            id: event.id,
                            title: event.name,
                            date: event.date,
                            location: event.location,
                            description: event.description,
                            url: window.location.href,
                          })}
                          className="kk-focus inline-flex items-center gap-2 h-11 px-5 rounded-xl bg-[var(--kk-blue)] hover:bg-[var(--kk-navy)] text-white text-sm font-semibold transition-colors"
                        >
                          <Calendar className="w-4 h-4" aria-hidden />
                          {t("common.addToCalendar")}
                        </button>
                      )}
                      {completed.length > 0 && (
                        <button type="button" onClick={() => setParams({ view: "results" })} className="kk-focus inline-flex items-center gap-2 h-11 px-5 rounded-xl bg-[var(--kk-blue)] hover:bg-[var(--kk-navy)] text-white text-sm font-semibold">
                          <Crown className="w-4 h-4" aria-hidden />{t("fights.seeResults")}
                        </button>
                      )}
                      <ShareButtons
                        variant="compact"
                        title={`${event.name} — Kun Khmer`}
                        label={t("common.shareEvent")}
                        className="kk-focus h-11 px-4 rounded-xl bg-white border border-gray-200 text-sm font-semibold text-gray-800 hover:border-gray-300"
                      />
                    </div>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Tabs */}
            <nav aria-label={t("event.sections")} className="bg-white border-b border-gray-200">
              <div className="max-w-7xl mx-auto px-4 md:px-6 flex gap-1 overflow-x-auto">
                {views.map((v) => (
                  <button
                    key={v}
                    type="button"
                    aria-current={v === view ? "page" : undefined}
                    onClick={() => setParams(v === fallback ? {} : { view: v })}
                    className={`kk-focus shrink-0 min-h-12 px-4 md:px-5 kk-heading text-lg md:text-xl border-b-4 transition-colors ${
                      v === view ? "border-[var(--kk-red)] text-gray-900" : "border-transparent text-gray-500 hover:text-gray-900"
                    }`}
                  >
                    {tabLabel[v]}
                  </button>
                ))}
              </div>
            </nav>

            <div className="max-w-7xl mx-auto px-4 md:px-6 py-8 md:py-12 space-y-10">
              <DemoBanner show={data.demo} />
              {data.failed && <LoadError onRetry={retryFanData} />}

              {view === "card" && (
                bouts.length === 0 ? (
                  <div className="bg-white rounded-2xl border border-gray-200 p-10 text-center">
                    <p className="kk-heading text-2xl text-gray-900">{t("matches.pendingCard")}</p>
                  </div>
                ) : (
                  <>
                    {!upcoming && completed.length === 0 && (
                      <p className="rounded-2xl border border-gray-200 bg-white p-5 text-sm text-gray-700 flex items-start gap-2">
                        <Clock className="w-4 h-4 mt-0.5 text-gray-500 shrink-0" aria-hidden />{t("event.pendingText")}
                      </p>
                    )}
                    {event.image && main && !main.completed && upcoming && (
                      <div className="rounded-3xl border border-[#d5e0f3] bg-gradient-to-br from-white to-[#fdf1f3] p-6 md:p-8">
                        <p className="kk-label text-center text-[#7A5B00] mb-4 flex items-center justify-center gap-1.5">
                          {main.isTitle && <Crown className="w-4 h-4" aria-hidden />}{t(main.isTitle ? "matches.titleBout" : "matches.mainEvent")}
                        </p>
                        <FaceOff bout={main} />
                      </div>
                    )}
                    <CardList cards={cards} numbers={boutNumber} awaiting={!upcoming && completed.length === 0} />
                  </>
                )
              )}

              {view === "results" && <CardList cards={groupByCard(completed)} numbers={boutNumber} result />}

              {view === "watch" && <WhereToWatch broadcaster={broadcaster} stationName={stationName} />}

              <HubAskAbout
                questions={
                  completed.length > 0
                    ? [t("hub.askEventResults", { event: event.name }), ...(main?.completed ? [t("hub.askEventMain", { event: event.name })] : [])]
                    : upcoming
                      ? [...(bouts.length > 0 ? [t("hub.askEventCard", { event: event.name })] : []), t("hub.askEventWatch", { event: event.name })]
                      : [t("hub.askEventAbout", { event: event.name })]
                }
              />

              {/* Other sponsors (the main sponsor and the description are in the header) */}
              {sponsors.length > (mainSponsor ? 1 : 0) && (
                <section className="pt-10 border-t border-gray-200">
                  <SponsorStrip sponsors={sponsors} />
                </section>
              )}
            </div>
          </>
        )}
      </main>

      <SiteFooter />
    </div>
  );
}

function CardList({ cards, numbers, result = false, awaiting = false }: { cards: CardGroup[]; numbers: Map<string, number>; result?: boolean; awaiting?: boolean }) {
  const { tn, formatDate } = useI18n();
  if (cards.length === 0) {
    return <NoResults />;
  }
  return (
    <div className="space-y-10">
      {cards.map((c) => (
        <section key={c.key} aria-label={c.name}>
          {(cards.length > 1 || c.name) && (
            <div className="flex flex-wrap items-end justify-between gap-2 mb-4">
              <h2 lang={textLang(c.name)} className="kk-heading text-2xl md:text-3xl text-gray-900">{c.name}</h2>
              <p className="text-sm font-semibold text-gray-500">
                {[formatDate(c.date, "weekday"), tn("common.bouts", c.bouts.length)].filter(Boolean).join(" · ")}
              </p>
            </div>
          )}
          <ol className="space-y-3">
            {c.bouts.map((b, i) => <BoutRow key={b.id} bout={b} number={numbers.get(b.id) ?? i + 1} result={result} awaiting={awaiting && !b.completed} />)}
          </ol>
        </section>
      ))}
    </div>
  );
}

function NoResults() {
  const { t } = useI18n();
  return <p className="bg-white rounded-2xl border border-gray-200 p-10 text-center text-gray-600">{t("event.noResults")}</p>;
}

/** One line of the header's key facts: icon, small label, value. */
function FactRow({ icon, label, children, tone = "blue" }: { icon: ReactNode; label: string; children: ReactNode; tone?: "blue" | "red" }) {
  return (
    <div className="flex items-start gap-3 px-4 py-3">
      <span className={`mt-0.5 w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${tone === "red" ? "bg-[#fdf1f3] text-[var(--kk-red)]" : "bg-[#eef3fb] text-[var(--kk-blue)]"}`} aria-hidden>{icon}</span>
      <div className="min-w-0">
        <dt className="text-xs font-semibold text-gray-500">{label}</dt>
        <dd className="text-gray-900 font-medium break-words">{children}</dd>
      </div>
    </div>
  );
}

/** "About this event" in the header; long descriptions fold with Read more. */
function AboutText({ text }: { text: string }) {
  const { t } = useI18n();
  const [open, setOpen] = useState(false);
  const long = text.length > 280;
  return (
    <section aria-label={t("event.about")}>
      <h2 className="kk-label text-gray-500 mb-1.5">{t("event.about")}</h2>
      <p lang={textLang(text)} className={`text-gray-700 leading-relaxed whitespace-pre-line ${long && !open ? "line-clamp-4" : ""}`}>{text}</p>
      {long && (
        <button type="button" onClick={() => setOpen((o) => !o)} className="kk-focus mt-1 text-sm font-semibold text-[var(--kk-blue)] hover:underline underline-offset-4">
          {open ? t("event.readLess") : t("event.readMore")}
        </button>
      )}
    </section>
  );
}
