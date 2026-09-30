/**
 * Program › Overview, built around the officer's next job (owner, 2026-09-30: "next job first"):
 * 1. the fight night that needs work — the nearest one coming up (drafts included), or the last one whose
 *    results are still open — with its step-by-step checklist and one button for the next step;
 * 2. Needs attention (Program to-dos from the dashboard);
 * 3. the other fight nights coming up, each with its next step in plain words;
 * 4. one line about title belts.
 * Light style, readable text, no invented numbers. See claude/updates/program-overview-next-job.md.
 */
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router";
import { AlertCircle, CalendarDays, ChevronRight, Crown, MapPin, Plus } from "lucide-react";
import { api } from "../../utils/api";
import { usePermissions } from "../../hooks/usePermissions";
import { useAdminOverview, type TodoKind } from "../../hooks/useAdminOverview";
import { formatDay, khmerDigits, useT } from "../../i18n/program";
import { FightNightSteps } from "./FightNightSteps";
import { StatusChip, dayOf, displayStatus, hasResult, nextStepText, todayUtc } from "./shared";

const PROGRAM_TODOS: TodoKind[] = ["result", "noOfficials", "draftEvent", "emptyEvent", "unconfirmed", "vacantTitle"];

interface Data {
  events: any[];
  cards: any[];
  bouts: any[];
  titles: any[];
}

export function ProgramOverview() {
  const { t, lang } = useT();
  const navigate = useNavigate();
  const permissions = usePermissions();
  const me = api.auth.getCurrentUser();
  const isStaff = me?.role === "Super Admin" || me?.role === "KKF Officer";
  const canEdit = permissions.hasPermission("events.edit");
  const canCreate = permissions.hasPermission("events.create");
  const { data: overview } = useAdminOverview();

  const [data, setData] = useState<Data | null>(null);
  const [failed, setFailed] = useState(false);

  const load = () => {
    setFailed(false);
    Promise.all([api.events.list(), api.batches.list(), api.matches.list(), api.champions.list()])
      .then(([events, cards, bouts, titles]) => setData({ events, cards, bouts, titles }))
      .catch(() => setFailed(true));
  };
  useEffect(load, []);

  if (failed) {
    return (
      <div role="alert" className="rounded-2xl border border-amber-200 bg-amber-50 p-8 text-center space-y-4">
        <p className="text-amber-900">{t("list.loadFailed")}</p>
        <button type="button" onClick={load} className="h-11 px-5 rounded-xl bg-primary text-white text-sm font-semibold hover:opacity-90">{t("common.tryAgain")}</button>
      </div>
    );
  }
  if (!data) {
    return <div className="rounded-2xl border border-slate-200 bg-white p-10 flex justify-center"><div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" aria-label={t("common.loading")} /></div>;
  }

  const today = todayUtc();
  const cardsOf = (e: any) => data.cards.filter((c) => c.event_id === e.id);
  const boutsOf = (e: any) => data.bouts.filter((b) => b.event_id === e.id);
  const live = data.events.filter((e) => e.status !== "Cancelled");
  const upcoming = live.filter((e) => dayOf(e.date) >= today).sort((a, b) => dayOf(a.date) - dayOf(b.date));
  const openPast = live
    .filter((e) => dayOf(e.date) < today && boutsOf(e).some((b) => !hasResult(b)))
    .sort((a, b) => dayOf(b.date) - dayOf(a.date));
  // Results still owed come first: they're the job after a fight night; otherwise the next one coming up.
  const focus = openPast[0] ?? upcoming[0] ?? null;
  const comingUp = upcoming.filter((e) => e.id !== focus?.id).slice(0, 4);

  const todos = (overview?.todos ?? []).filter((x) => PROGRAM_TODOS.includes(x.kind));
  const held = data.titles.filter((c) => c.current_holder_id).length;
  const openNight = () => focus && navigate(`/home/events/${focus.id}`);

  return (
    <div className="space-y-8">
      {/* 1. The fight night that needs work */}
      {focus ? (
        <section aria-labelledby="focus-night" className="rounded-2xl border border-slate-200 bg-white p-5 md:p-6 space-y-5 shadow-sm">
          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
            <div className="min-w-0 space-y-1.5">
              <p className={`text-sm font-semibold ${focus === openPast[0] ? "text-amber-700" : "text-primary"}`}>
                {focus === openPast[0] ? t("ov.focusResults") : t("ov.focusNext")}
              </p>
              <h2 id="focus-night" className="text-2xl font-bold text-slate-900 break-words">{focus.name}</h2>
              <p className="flex flex-wrap items-center gap-x-4 gap-y-1 text-base text-slate-600">
                <span className="inline-flex items-center gap-1.5"><CalendarDays className="w-4 h-4" aria-hidden /> {formatDay(focus.date, lang)}</span>
                {focus.location && <span className="inline-flex items-center gap-1.5"><MapPin className="w-4 h-4" aria-hidden /> {focus.location}</span>}
                <StatusChip status={displayStatus(focus, boutsOf(focus))} />
              </p>
            </div>
            <Link to={`/home/events/${focus.id}`} className="shrink-0 inline-flex items-center justify-center gap-2 h-11 px-5 rounded-xl border border-slate-300 bg-white text-sm font-semibold text-slate-800 hover:border-primary hover:text-primary">
              {t("ov.open")} <ChevronRight className="w-4 h-4" aria-hidden />
            </Link>
          </div>
          <FightNightSteps
            event={focus}
            cards={cardsOf(focus)}
            bouts={boutsOf(focus)}
            canEdit={canEdit}
            isStaff={isStaff}
            onEditDetails={openNight}
            onAddFightCard={openNight}
            onChanged={load}
          />
        </section>
      ) : (
        <section className="rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center space-y-3">
          <p className="text-xl font-bold text-slate-900">{t("ov.nothingTitle")}</p>
          <p className="text-base text-slate-600">{t("ov.nothingText")}</p>
          {canCreate && (
            <Link to="/home/events/new" className="inline-flex items-center gap-2 h-11 px-5 rounded-xl bg-primary text-white text-sm font-semibold hover:opacity-90">
              <Plus className="w-4 h-4" aria-hidden /> {t("list.new")}
            </Link>
          )}
        </section>
      )}

      {/* 2. Needs attention */}
      {todos.length > 0 && (
        <section aria-labelledby="attention" className="space-y-3">
          <div className="flex items-end justify-between gap-3">
            <div>
              <h2 id="attention" className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-amber-600" aria-hidden /> {t("ov.attention")} <span className="text-slate-500 font-semibold">({todos.length})</span>
              </h2>
              <p className="text-sm text-slate-600">{t("ov.attentionHint")}</p>
            </div>
            {todos.length > 5 && <Link to="/home#todo" className="text-sm font-semibold text-primary hover:underline">{t("ov.allTodos")}</Link>}
          </div>
          <ul className="rounded-2xl border border-slate-200 bg-white divide-y divide-slate-100">
            {todos.slice(0, 5).map((x) => (
              <li key={x.id} className="flex items-center justify-between gap-4 p-4">
                <span className="min-w-0">
                  <span className="block text-base font-semibold text-slate-900 break-words">{x.title}</span>
                  <span className="block text-sm text-slate-600 break-words">{lang === "km" ? t(`todo.${x.kind}` as any) : x.detail}</span>
                </span>
                <Link to={x.href} className="shrink-0 inline-flex items-center gap-1.5 h-10 px-4 rounded-xl bg-primary/10 text-primary text-sm font-semibold hover:bg-primary/15">
                  {t("ov.openTodo")} <ChevronRight className="w-4 h-4" aria-hidden />
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* 3. The other fight nights coming up */}
      {comingUp.length > 0 && (
        <section aria-labelledby="coming-up" className="space-y-3">
          <div className="flex items-end justify-between gap-3">
            <h2 id="coming-up" className="text-lg font-bold text-slate-900">{t("ov.comingUp")}</h2>
            <Link to="/home/program?tab=events" className="text-sm font-semibold text-primary hover:underline">{t("ov.allNights")}</Link>
          </div>
          <ul className="space-y-3">
            {comingUp.map((e) => {
              const next = nextStepText(t, e, cardsOf(e), boutsOf(e));
              const d = new Date(`${String(e.date).slice(0, 10)}T00:00:00Z`);
              return (
                <li key={e.id}>
                  <Link to={`/home/events/${e.id}`} className="flex items-center gap-4 rounded-2xl border border-slate-200 bg-white p-4 hover:border-primary hover:shadow-sm transition">
                    <div className="w-16 shrink-0 rounded-xl bg-[#eef3fb] text-center py-2">
                      <p className="text-2xl font-bold text-primary leading-none">{lang === "km" ? khmerDigits(d.getUTCDate()) : d.getUTCDate()}</p>
                      <p className="text-xs font-semibold text-slate-600 mt-1">{formatDay(e.date, lang, false).split(" ").slice(1).join(" ")}</p>
                    </div>
                    <div className="min-w-0 flex-1 space-y-1">
                      <p className="flex flex-wrap items-center gap-2">
                        <span className="text-base font-bold text-slate-900 break-words">{e.name}</span>
                        <StatusChip status={displayStatus(e, boutsOf(e))} />
                      </p>
                      {next && <p className="text-sm font-semibold text-primary">{t("list.next", { step: next })}</p>}
                    </div>
                    <ChevronRight className="w-5 h-5 text-slate-400 shrink-0" aria-hidden />
                  </Link>
                </li>
              );
            })}
          </ul>
        </section>
      )}

      {/* 4. Title belts, in one line */}
      <section className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white p-4 md:p-5">
        <p className="flex items-center gap-3 text-base text-slate-800">
          <span className="w-10 h-10 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center shrink-0" aria-hidden><Crown className="w-5 h-5" /></span>
          <span>
            <span className="block font-bold">{t("ov.titles")}</span>
            <span className="block text-sm text-slate-600">
              {data.titles.length ? t("ov.titlesLine", { held, vacant: data.titles.length - held }) : t("ov.noTitles")}
            </span>
          </span>
        </p>
        <div className="flex flex-wrap gap-2">
          {data.titles.length > 0 && (
            <Link to="/home/program?tab=champions" className="inline-flex items-center h-10 px-4 rounded-xl border border-slate-300 bg-white text-sm font-semibold text-slate-800 hover:border-primary hover:text-primary">{t("ov.openTitles")}</Link>
          )}
          {canCreate && (
            <Link to="/home/champion/new" className="inline-flex items-center gap-2 h-10 px-4 rounded-xl bg-amber-50 text-amber-800 border border-amber-200 text-sm font-semibold hover:bg-amber-100">
              <Plus className="w-4 h-4" aria-hidden /> {t("ov.newTitle")}
            </Link>
          )}
        </div>
      </section>
    </div>
  );
}
