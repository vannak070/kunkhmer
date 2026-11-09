/**
 * "Your next job" on the Matches page: the match that needs work — the last one whose results are still open, else
 * the nearest one coming up — with its progress and the one next step (NightNextCard). Built from the lists the page
 * already loaded. See claude/updates/matches-menu.md (was the Program overview's focus card). `slim`: one strip above the
 * Matches tabs — the match, "4 of 8 done · Next: …" and its button (claude/updates/match-page-simpler.md, H).
 */
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router";
import { CalendarDays, ChevronRight, MapPin } from "lucide-react";
import { api } from "../../utils/api";
import { usePermissions } from "../../hooks/usePermissions";
import { formatDay, formatTime, useT } from "../../i18n/program";
import { usePlaceName } from "../../hooks/useSettingsLists";
import { type Agreements, LOCKED_FOR_ORGANIZER } from "./AgreementsPanel";
import { NightNextCard, NightNextInline } from "./NightFlow";
import { MatchDayBanner } from "./MatchDayBanner";
import { StatusChip, dayOf, displayStatus, hasResult, todayUtc } from "./shared";

/** Results still owed come first (the job after a match); otherwise the nearest match coming up. */
export function pickFocus(events: any[], bouts: any[]) {
  const today = todayUtc();
  const live = events.filter((e) => e.status !== "Cancelled");
  const openPast = live
    .filter((e) => dayOf(e.date) < today && bouts.some((b) => b.event_id === e.id && !hasResult(b)))
    .sort((a, b) => dayOf(b.date) - dayOf(a.date))[0];
  const upcoming = live.filter((e) => dayOf(e.date) >= today).sort((a, b) => dayOf(a.date) - dayOf(b.date))[0];
  return { focus: openPast ?? upcoming ?? null, results: Boolean(openPast) };
}

export function NextMatchCard({ events, cards, bouts, onChanged, slim = false }: { events: any[]; cards: any[]; bouts: any[]; onChanged: () => void; slim?: boolean }) {
  const { t, lang } = useT();
  const placeName = usePlaceName();
  const navigate = useNavigate();
  const permissions = usePermissions();
  const me = api.auth.getCurrentUser();
  const isStaff = me?.role === "Super Admin" || me?.role === "KKF Officer";
  const isOrganizer = me?.role === "Organizer";
  const canEdit = permissions.hasPermission("events.edit");
  const { focus, results } = pickFocus(events, bouts);

  // Agreements of this match (KKF and its Organizer): the next step depends on what is confirmed.
  const [agreements, setAgreements] = useState<{ id: string; data: Agreements | null } | null>(null);
  const focusId = focus?.id as string | undefined;
  const loadAgreements = () => {
    if (!focusId || !(isStaff || isOrganizer)) return;
    api.events.agreements(focusId)
      .then((a: Agreements) => setAgreements({ id: focusId, data: a }))
      .catch(() => setAgreements({ id: focusId, data: null }));
  };
  useEffect(loadAgreements, [focusId, isStaff, isOrganizer]);

  if (!focus || !(isStaff || isOrganizer) || agreements?.id !== focus.id) return null;
  const mine = bouts.filter((b) => b.event_id === focus.id);
  const open = () => navigate(`/home/events/${focus.id}`);
  const flow = {
    event: focus,
    cards: cards.filter((c) => c.event_id === focus.id),
    bouts: mine,
    agreements: agreements?.data ?? null,
    mode: (isStaff ? "staff" : "organizer") as "staff" | "organizer",
    canEdit,
    canEditDetails: canEdit || (permissions.hasPermission("events.record") && !LOCKED_FOR_ORGANIZER.includes(focus.status)),
    onEditDetails: open,
    onChanged: () => { onChanged(); loadAgreements(); },
  };

  if (slim) {
    return (
      <section aria-labelledby="focus-match" className="rounded-2xl border border-slate-200 bg-white p-4 flex flex-col xl:flex-row xl:items-center gap-3 shadow-sm">
        <div className="min-w-0 xl:w-72 xl:shrink-0">
          <p className={`text-xs font-bold uppercase tracking-wide ${results ? "text-amber-700" : "text-primary"}`}>{results ? t("ov.focusResults") : t("ov.focusNext")}</p>
          <Link id="focus-match" to={`/home/events/${focus.id}`} className="block font-bold text-slate-900 break-words hover:text-primary">{focus.name}</Link>
          <p className="text-sm text-slate-600">{formatDay(focus.date, lang)}{focus.start_time ? ` · ${formatTime(focus.start_time, lang)}` : ""}</p>
        </div>
        <NightNextInline {...flow} />
        <Link to={`/home/events/${focus.id}`} className="self-start xl:self-auto shrink-0 inline-flex items-center justify-center gap-1 h-10 px-4 rounded-xl border border-slate-300 bg-white text-sm font-semibold text-slate-800 hover:border-primary hover:text-primary">
          {t("ov.open")} <ChevronRight className="w-4 h-4" aria-hidden />
        </Link>
      </section>
    );
  }

  return (
    <section aria-labelledby="focus-match" className="rounded-2xl border border-slate-200 bg-white p-5 md:p-6 space-y-5 shadow-sm">
      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
        <div className="min-w-0 space-y-1.5">
          <p className={`text-sm font-semibold ${results ? "text-amber-700" : "text-primary"}`}>{results ? t("ov.focusResults") : t("ov.focusNext")}</p>
          <h2 id="focus-match" className="text-2xl font-bold text-slate-900 break-words">{focus.name}</h2>
          <p className="flex flex-wrap items-center gap-x-4 gap-y-1 text-base text-slate-600">
            <span className="inline-flex items-center gap-1.5"><CalendarDays className="w-4 h-4" aria-hidden /> {formatDay(focus.date, lang)}{focus.start_time ? ` · ${formatTime(focus.start_time, lang)}` : ""}</span>
            {focus.location && <span className="inline-flex items-center gap-1.5"><MapPin className="w-4 h-4" aria-hidden /> {placeName(focus.location)}</span>}
            <StatusChip status={displayStatus(focus, mine)} />
          </p>
        </div>
        <Link to={`/home/events/${focus.id}`} className="shrink-0 inline-flex items-center justify-center gap-2 h-11 px-5 rounded-xl border border-slate-300 bg-white text-sm font-semibold text-slate-800 hover:border-primary hover:text-primary">
          {t("ov.open")} <ChevronRight className="w-4 h-4" aria-hidden />
        </Link>
      </div>
      {isStaff && <MatchDayBanner event={focus} bouts={mine} />}
      <NightNextCard {...flow} />
    </section>
  );
}
