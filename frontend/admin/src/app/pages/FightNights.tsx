/**
 * Fight nights list (Program → Fight nights): one row per fight night with its date, venue, bouts, status and
 * the next thing to do. Upcoming / Past / All, search, "New fight night". English / Khmer.
 * See claude/updates/program-officer-friendly.md.
 */
import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router";
import { ChevronRight, MapPin, Plus, Search } from "lucide-react";
import { api } from "../utils/api";
import { usePermissions } from "../hooks/usePermissions";
import { formatDay, khmerDigits, useT } from "../i18n/program";
import { usePlaceName } from "../hooks/useSettingsLists";
import { StatusChip, dayOf, displayStatus, nextStepText, todayUtc } from "../components/program/shared";

type Filter = "upcoming" | "past" | "all";

export function FightNights() {
  const { t, lang } = useT();
  const placeName = usePlaceName();
  const permissions = usePermissions();
  const [events, setEvents] = useState<any[] | null>(null);
  const [failed, setFailed] = useState(false);
  const [cards, setCards] = useState<any[]>([]);
  const [bouts, setBouts] = useState<any[]>([]);
  const [filter, setFilter] = useState<Filter>("upcoming");
  const [query, setQuery] = useState("");

  // A failed load says so (with Try again) instead of an empty list that looks like lost data.
  const load = () => {
    setFailed(false);
    Promise.all([api.events.list(), api.batches.list(), api.matches.list()])
      .then(([e, c, m]) => {
        setEvents(e);
        setCards(c);
        setBouts(m);
      })
      .catch(() => setFailed(true));
  };
  useEffect(load, []);

  const rows = useMemo(() => {
    if (!events) return [];
    const today = todayUtc();
    const q = query.trim().toLowerCase();
    return events
      .filter((e) => (filter === "all" ? true : filter === "upcoming" ? dayOf(e.date) >= today : dayOf(e.date) < today))
      .filter((e) => !q || `${e.name} ${e.location ?? ""}`.toLowerCase().includes(q))
      .sort((a, b) => (filter === "past" ? dayOf(b.date) - dayOf(a.date) : dayOf(a.date) - dayOf(b.date)));
  }, [events, filter, query]);


  const tab = (key: Filter, label: string) => (
    <button key={key} type="button" aria-pressed={filter === key} onClick={() => setFilter(key)} className={`h-10 px-4 rounded-xl text-sm font-semibold border ${filter === key ? "bg-primary text-white border-primary" : "bg-white text-slate-700 border-slate-200 hover:border-slate-300"}`}>
      {label}
    </button>
  );

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex gap-2">{[tab("upcoming", t("list.upcoming")), tab("past", t("list.past")), tab("all", t("list.all"))]}</div>
        <div className="relative flex-1 min-w-[14rem]">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" aria-hidden />
          <label htmlFor="fight-night-search" className="sr-only">{t("list.search")}</label>
          <input id="fight-night-search" value={query} onChange={(e) => setQuery(e.target.value)} placeholder={t("list.search")} className="w-full h-10 rounded-xl border border-slate-200 bg-white pl-9 pr-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary" />
        </div>
        {permissions.hasPermission("events.create") && (
          <Link to="/home/events/new" className="inline-flex items-center gap-2 h-10 px-4 rounded-xl bg-primary text-white text-sm font-semibold hover:opacity-90">
            <Plus className="w-4 h-4" aria-hidden /> {t("list.new")}
          </Link>
        )}
      </div>

      {failed ? (
        <div role="alert" className="rounded-2xl border border-amber-200 bg-amber-50 p-8 text-center space-y-4">
          <p className="text-amber-900">{t("list.loadFailed")}</p>
          <button type="button" onClick={load} className="h-11 px-5 rounded-xl bg-primary text-white text-sm font-semibold hover:opacity-90">{t("common.tryAgain")}</button>
        </div>
      ) : !events ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-10 flex justify-center"><div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" aria-label={t("common.loading")} /></div>
      ) : rows.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center">
          <p className="font-semibold text-slate-800">{t("list.empty")}</p>
          <p className="text-sm text-slate-500 mt-1">{t("list.emptyHint")}</p>
        </div>
      ) : (
        <ul className="space-y-3">
          {rows.map((e) => {
            const evCards = cards.filter((c) => c.event_id === e.id);
            const evBouts = bouts.filter((b) => b.event_id === e.id);
            const next = nextStepText(t, e, evCards, evBouts);
            const d = new Date(`${String(e.date).slice(0, 10)}T00:00:00Z`);
            return (
              <li key={e.id}>
                <Link to={`/home/events/${e.id}`} className="flex items-center gap-4 rounded-2xl border border-slate-200 bg-white p-4 md:p-5 hover:border-primary hover:shadow-sm transition">
                  <div className="w-16 shrink-0 rounded-xl bg-[#eef3fb] text-center py-2">
                    <p className="text-2xl font-bold text-primary leading-none">{lang === "km" ? khmerDigits(d.getUTCDate()) : d.getUTCDate()}</p>
                    <p className="text-xs font-semibold text-slate-600 mt-1">{formatDay(e.date, lang, false).split(" ").slice(1).join(" ")}</p>
                  </div>
                  <div className="flex-1 min-w-0 space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-bold text-slate-900 truncate">{e.name}</p>
                      <StatusChip status={displayStatus(e, evBouts)} />
                    </div>
                    <p className="text-sm text-slate-600 flex flex-wrap items-center gap-x-3">
                      <span className="inline-flex items-center gap-1"><MapPin className="w-3.5 h-3.5 text-slate-400" aria-hidden />{e.location ? placeName(e.location) : t("common.notSet")}</span>
                      <span>{evBouts.length === 0 ? t("list.noBouts") : evBouts.length === 1 ? t("list.bout") : t("list.bouts", { n: evBouts.length })}</span>
                    </p>
                    <p className={`text-sm font-semibold ${next ? "text-primary" : "text-emerald-700"}`}>{next ? t("list.next", { step: next }) : e.status === "Cancelled" ? "" : t("list.done")}</p>
                  </div>
                  <ChevronRight className="w-5 h-5 text-slate-400 shrink-0" aria-hidden />
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
