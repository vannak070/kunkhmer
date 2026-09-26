/**
 * Public event page at /events/:id in the Fight Night style: poster header with countdown,
 * then Fight card · Results · Where to watch, each with its own URL (?view=card|results|watch).
 * A tab without data is hidden. Events store a calendar day only, so the countdown is in days.
 */
import { useMemo } from "react";
import { Link, useParams, useSearchParams } from "react-router";
import { ArrowLeft, Calendar, MapPin, Tv } from "lucide-react";
import { SiteHeader } from "../components/layout/SiteHeader";
import { SiteFooter } from "../components/layout/SiteFooter";
import { CountdownChip, DemoBanner, WhereToWatch, daysUntil } from "../components/fan/FanWidgets";
import { BoutRow, MainEventFaceoff, SponsorStrip, type EventSponsor } from "../components/event/EventParts";
import { PresentedBy } from "../components/home/HomePage";
import { PublicStatusBadge } from "../components/PublicStatusBadge";
import { ShareButtons } from "../components/ShareButtons";
import { broadcasterForEvent, eventBouts, mainEventBout, useFanData, type Bout } from "../data/fanData";
import { downloadCalendarEvent } from "../utils/calendar";
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
  const { id } = useParams();
  const { t, tn, formatDate } = useI18n();
  const data = useFanData();
  const [params, setParams] = useSearchParams();

  const event = data?.events.find((e: any) => e.id === id);
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
            {/* Poster header */}
            <section className="kk-night relative overflow-hidden">
              {event.image && (
                <img src={event.image} alt="" aria-hidden className="absolute inset-0 w-full h-full object-cover opacity-15 blur-2xl scale-110" />
              )}
              <div className="relative max-w-7xl mx-auto px-4 md:px-6 pt-6 pb-10 md:pb-14">
                <Link to="/matches?tab=events" className="kk-focus inline-flex items-center gap-2 text-sm font-semibold text-[var(--kk-night-muted)] hover:text-white mb-6 md:mb-8">
                  <ArrowLeft className="w-4 h-4" aria-hidden />
                  {t("event.allEvents")}
                </Link>

                <div className={`grid gap-8 md:gap-12 items-center ${event.image || main ? "lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]" : ""}`}>
                  {event.image ? (
                    <img src={event.image} alt={event.name} className="w-full h-auto max-h-[600px] object-contain rounded-2xl shadow-2xl bg-[var(--kk-night-sunken)]" />
                  ) : main ? (
                    <MainEventFaceoff bout={main} />
                  ) : null}

                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-4">
                      <span className="kk-label text-[var(--kk-gold)] mr-1">{t("event.fightNight")}</span>
                      <PublicStatusBadge status={event.status} surface="dark" />
                      {upcoming && <CountdownChip date={event.date} surface="dark" />}
                      {completed.length > 0 && (
                        <span className="px-3 py-1.5 rounded-lg text-xs font-bold bg-white/10 text-white border border-white/20">{t("event.resultsIn")}</span>
                      )}
                    </div>
                    <h1 lang={textLang(event.name)} className="kk-display text-5xl md:text-7xl text-white mb-6 break-words">{event.name}</h1>
                    <ul className="space-y-2 text-[var(--kk-night-ink)] mb-8">
                      <li className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-[var(--kk-night-accent)] shrink-0" aria-hidden />
                        {event.end_date && event.end_date !== event.date
                          ? `${formatDate(event.date, "long")} – ${formatDate(event.end_date, "long")}`
                          : formatDate(event.date, "long")}
                      </li>
                      <li className="flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-[var(--kk-night-accent)] shrink-0" aria-hidden />
                        <span lang={textLang(event.location)}>{event.location || t("matches.venueTba")}</span>
                      </li>
                      {stationName && (
                        <li className="flex items-center gap-2">
                          <Tv className="w-4 h-4 text-[var(--kk-night-accent)] shrink-0" aria-hidden />
                          {t("home.broadcastOn", { name: stationName })}
                        </li>
                      )}
                    </ul>

                    {bouts.length > 0 && (
                      <dl className="flex flex-wrap gap-x-10 gap-y-4 mb-8">
                        <div>
                          <dt className="kk-label text-[var(--kk-night-muted)]">{tn("common.bout", bouts.length)}</dt>
                          <dd className="kk-stat text-4xl text-white">{bouts.length}</dd>
                        </div>
                        {cards.length > 1 && (
                          <div>
                            <dt className="kk-label text-[var(--kk-night-muted)]">{tn("event.cards", cards.length)}</dt>
                            <dd className="kk-stat text-4xl text-white">{cards.length}</dd>
                          </div>
                        )}
                        {bouts.some((b) => b.isTitle) && (
                          <div>
                            <dt className="kk-label text-[var(--kk-night-muted)]">{tn("event.titleBouts", bouts.filter((b) => b.isTitle).length)}</dt>
                            <dd className="kk-stat text-4xl text-[var(--kk-gold)]">{bouts.filter((b) => b.isTitle).length}</dd>
                          </div>
                        )}
                      </dl>
                    )}

                    {mainSponsor && (
                      <div className="mb-6">
                        <PresentedBy sponsor={{ ...mainSponsor, logo: mainSponsor.logo ?? null, url: mainSponsor.url ?? null }} tone="dark" />
                      </div>
                    )}

                    <div className="flex flex-wrap items-center gap-3">
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
                          className="kk-focus inline-flex items-center gap-2 min-h-11 px-5 rounded-xl bg-[var(--kk-red)] hover:bg-[#9e1a2c] text-white font-semibold transition-colors"
                        >
                          <Calendar className="w-4 h-4" aria-hidden />
                          {t("common.addToCalendar")}
                        </button>
                      )}
                      <ShareButtons
                        variant="compact"
                        title={`${event.name} — Kun Khmer`}
                        label={t("common.shareEvent")}
                        className="kk-focus min-h-11 px-5 bg-white/10 hover:bg-white/15 border border-white/25 text-white font-semibold"
                      />
                    </div>
                  </div>
                </div>
              </div>
              <div className="kk-ropes relative" aria-hidden><span /><span /><span /></div>
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

              {view === "card" && (
                bouts.length === 0 ? (
                  <div className="bg-white rounded-2xl border border-gray-200 p-10 text-center">
                    <p className="kk-heading text-2xl text-gray-900">{t("matches.pendingCard")}</p>
                  </div>
                ) : (
                  <>
                    {event.image && main && !main.completed && (
                      <div className="kk-night rounded-2xl"><MainEventFaceoff bout={main} /></div>
                    )}
                    <CardList cards={cards} numbers={boutNumber} />
                  </>
                )
              )}

              {view === "results" && <CardList cards={groupByCard(completed)} numbers={boutNumber} result />}

              {view === "watch" && <WhereToWatch broadcaster={broadcaster} stationName={stationName} />}

              {/* About */}
              {(event.description || organizer || sponsors.length > 0) && (
                <section className="grid gap-8 lg:grid-cols-[minmax(0,7fr)_minmax(0,5fr)] pt-10 border-t border-gray-200">
                  <div>
                    <h2 className="kk-heading text-3xl text-gray-900 mb-4">{t("event.about")}</h2>
                    {event.description && <p lang={textLang(event.description)} className="text-gray-700 leading-relaxed whitespace-pre-line">{event.description}</p>}
                    {organizer && (
                      <p className="mt-4 text-sm text-gray-600">
                        <span className="kk-label text-gray-500 mr-2">{t("matches.organizer")}</span>
                        {organizer}
                      </p>
                    )}
                  </div>
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

function CardList({ cards, numbers, result = false }: { cards: CardGroup[]; numbers: Map<string, number>; result?: boolean }) {
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
            {c.bouts.map((b, i) => <BoutRow key={b.id} bout={b} number={numbers.get(b.id) ?? i + 1} result={result} />)}
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
