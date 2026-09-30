/**
 * Dashboard: the one next job first, then the rest of the to-do list, real numbers, upcoming fight
 * nights and recent results. Every figure comes from the API; nothing is estimated. English / Khmer
 * (language button in the side menu).
 * claude/updates/dashboard-next-job.md, claude/updates/dashboard-khmer.md
 */
import { useState } from "react";
import { Link } from "react-router";
import {
  CalendarCheck, CalendarDays, CalendarPlus, Clock, Megaphone, MessageSquareWarning, ChevronRight, ClipboardList, FilePenLine, Gavel, Layers, Newspaper,
  PartyPopper, RefreshCw, ShieldCheck, Swords, Trophy, UserCheck, UserPlus, Users,
} from "lucide-react";
import { api } from "../utils/api";
import { usePermissions } from "../hooks/usePermissions";
import { type TodoItem, type TodoKind, useAdminOverview } from "../hooks/useAdminOverview";
import { FighterReviewActions } from "../components/FighterReview";
import { todoDetail, todoTitle } from "../components/program/todoText";
import { APPROVALS_ENABLED } from "../config/features";
import { formatDay, khmerDigits, useT, type Lang, type TextKey } from "../i18n/program";

type T = (key: TextKey, vars?: Record<string, string | number>) => string;

interface Group {
  kind: TodoKind;
  title: string;
  hint: string;
  icon: typeof Gavel;
  tone: string;
  action: string;
  /** English / Khmer text; groups without it only exist with approvals on and stay English. */
  text?: { title: TextKey; hint: TextKey; action: TextKey };
}

const GROUPS: Group[] = [
  { kind: "eventApproval", title: "Events to approve", hint: "Organizers submitted these events. Approve them, or send them back with a comment.", icon: CalendarCheck, tone: "text-violet-700 bg-violet-50", action: "Review" },
  { kind: "eventSentBack", title: "Events sent back", hint: "KKF asked for changes. Fix them and submit again.", icon: MessageSquareWarning, tone: "text-amber-700 bg-amber-50", action: "Open event" },
  { kind: "readyToPublish", title: "Ready to publish", hint: "Approved by KKF but not visible to fans yet.", icon: Megaphone, tone: "text-emerald-700 bg-emerald-50", action: "Publish" },
  { kind: "boutToAnswer", title: "Bouts to answer", hint: "Bouts proposed for your fighters. Accept them, or decline with a reason.", icon: Swords, tone: "text-sky-700 bg-sky-50", action: "Answer" },
  { kind: "boutDeclined", title: "Bouts declined by a club", hint: "A club said no. Change the fighter, or remove the bout.", icon: MessageSquareWarning, tone: "text-red-700 bg-red-50", action: "Fix bout" },
  { kind: "fighterSentBack", title: "Fighters sent back", hint: "KKF asked for changes to these profiles. Edit and save to send them again.", icon: MessageSquareWarning, tone: "text-red-700 bg-red-50", action: "Fix profile" },
  { kind: "result", title: "Results to record", hint: "Bouts that already happened but have no result. Fans and fighter records wait for these.", icon: Gavel, tone: "text-red-600 bg-red-50", action: "Record result", text: { title: "todo.result.title", hint: "todo.result.hint", action: "todo.result.action" } },
  { kind: "noOfficials", title: "Bouts without officials", hint: "Fight night is within 14 days. Assign a referee and three judges.", icon: ShieldCheck, tone: "text-sky-700 bg-sky-50", action: "Assign officials", text: { title: "todo.noOfficials.title", hint: "todo.noOfficials.hint", action: "card.officials" } },
  APPROVALS_ENABLED
    ? { kind: "fighter", title: "Fighters to verify", hint: "Registered fighters waiting for KKF approval before they can be matched.", icon: UserCheck, tone: "text-amber-700 bg-amber-50", action: "Review" }
    : { kind: "fighter", title: "Draft fighters", hint: "Not visible to fans and can't be matched yet. Activate them when the profile is complete.", icon: UserCheck, tone: "text-amber-700 bg-amber-50", action: "Open", text: { title: "todo.fighter.title", hint: "todo.fighter.hint", action: "common.open" } },
  { kind: "draftEvent", title: "Draft events", hint: "Events fans can't see yet. Finish the details and publish them.", icon: FilePenLine, tone: "text-violet-700 bg-violet-50", action: "Open event", text: { title: "todo.draftEvent.title", hint: "todo.draftEvent.hint", action: "todo.openEvent" } },
  { kind: "emptyEvent", title: "Events without a fight card", hint: "Upcoming events with no bouts scheduled.", icon: Layers, tone: "text-blue-700 bg-blue-50", action: "Add fight card", text: { title: "todo.emptyEvent.title", hint: "todo.emptyEvent.hint", action: "night.addCard" } },
  { kind: "boutWaiting", title: "Bouts waiting for clubs", hint: "Fight night is within 14 days and a club hasn't answered. Fans can't see these bouts yet.", icon: Clock, tone: "text-amber-700 bg-amber-50", action: "Open" },
  { kind: "unconfirmed", title: "Weigh-ins to do", hint: "Bouts in the next 14 days where a fighter hasn't been weighed in yet.", icon: ClipboardList, tone: "text-sky-700 bg-sky-50", action: "Open fight card", text: { title: "todo.unconfirmed.title", hint: "todo.unconfirmed.hint", action: "todo.unconfirmed.action" } },
  { kind: "vacantTitle", title: "Vacant titles", hint: "Championship titles with no holder.", icon: Trophy, tone: "text-amber-700 bg-amber-50", action: "Schedule title bout", text: { title: "todo.vacantTitle.title", hint: "todo.vacantTitle.hint", action: "todo.vacantTitle.action" } },
];

const groupOf = (kind: TodoKind) => GROUPS.find((g) => g.kind === kind)!;
/** A group's title, hint and button in the chosen language. */
const wording = (g: Group, t: T) => (g.text ? { title: t(g.text.title), hint: t(g.text.hint), action: t(g.text.action) } : { title: g.title, hint: g.hint, action: g.action });

const DAY = 86_400_000;
const daysUntil = (d: string) => Math.round((new Date(d).getTime() - new Date(new Date().toISOString().slice(0, 10)).getTime()) / DAY);
const countdown = (d: string, t: T) => {
  const n = daysUntil(d);
  return n <= 0 ? t("dash.today") : n === 1 ? t("dash.tomorrow") : t("dash.inDays", { n });
};
/** Numbers in Khmer digits on the Khmer dashboard. */
const num = (n: number, lang: Lang) => (lang === "km" ? khmerDigits(n) : String(n));
const METHODS = ["KO", "TKO", "Decision", "Disqualification"];
const MORE_SHOWN = 6;

function NextJob({ item, more, canApprove, onDone }: { item: TodoItem; more: number; canApprove: boolean; onDone: () => void }) {
  const { t, lang } = useT();
  const group = groupOf(item.kind);
  const w = wording(group, t);
  const Icon = group.icon;
  return (
    <section aria-label={t("dash.nextJob")} className="rounded-3xl border border-slate-200 bg-white p-6 md:p-8">
      <p className="text-sm font-semibold text-primary">{t("dash.nextJob")}</p>
      <div className="mt-4 flex flex-col md:flex-row md:items-center gap-5">
        <span className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 ${group.tone}`}><Icon className="w-7 h-7" aria-hidden /></span>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-slate-500">{w.title}</p>
          <h2 className="text-xl md:text-2xl font-bold text-slate-900 break-words">{todoTitle(item, t)}</h2>
          <p className="text-slate-600 break-words">{todoDetail(item, t, lang)}</p>
        </div>
        <div className="flex flex-wrap items-center gap-2 shrink-0">
          {item.kind === "fighter" && canApprove && item.fighterId && (
            <FighterReviewActions compact fighter={{ id: item.fighterId, name: item.title }} onDone={onDone} />
          )}
          <Link to={item.href} className="inline-flex items-center justify-center gap-1.5 h-12 px-6 rounded-xl bg-primary text-white font-semibold hover:opacity-90">
            {w.action} <ChevronRight className="w-5 h-5" aria-hidden />
          </Link>
        </div>
      </div>
      <p className="mt-4 text-sm text-slate-500">{w.hint}{more > 0 ? ` · ${more === 1 ? t("dash.moreOne") : t("dash.moreMany", { n: more })}` : ""}</p>
    </section>
  );
}

function MoreJobs({ items, canApprove, onDone }: { items: TodoItem[]; canApprove: boolean; onDone: () => void }) {
  const { t, lang } = useT();
  const [expanded, setExpanded] = useState(false);
  const shown = expanded ? items : items.slice(0, MORE_SHOWN);
  return (
    <section aria-labelledby="more-title" className="rounded-2xl border border-slate-200 bg-white">
      <header className="px-5 py-4 border-b border-slate-100">
        <h2 id="more-title" className="font-bold text-slate-900">{t("dash.alsoWaiting")} <span className="ml-1 text-sm font-semibold text-slate-400">{num(items.length, lang)}</span></h2>
      </header>
      <ul className="divide-y divide-slate-100">
        {shown.map((item) => {
          const g = groupOf(item.kind);
          const w = wording(g, t);
          const Icon = g.icon;
          return (
            <li key={item.id} className="flex items-center gap-3 px-5 py-3">
              <span className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${g.tone}`}><Icon className="w-5 h-5" aria-hidden /></span>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-slate-900 truncate">{todoTitle(item, t)}</p>
                <p className="text-xs text-slate-500 truncate">{w.title} · {todoDetail(item, t, lang)}</p>
              </div>
              {item.kind === "fighter" && canApprove && item.fighterId && (
                <FighterReviewActions compact fighter={{ id: item.fighterId, name: item.title }} onDone={onDone} />
              )}
              <Link to={item.href} className="inline-flex items-center gap-1 h-9 px-3 rounded-lg border border-slate-200 hover:border-primary text-sm font-medium text-slate-700 hover:text-primary shrink-0">
                {w.action} <ChevronRight className="w-4 h-4" aria-hidden />
              </Link>
            </li>
          );
        })}
      </ul>
      {items.length > MORE_SHOWN && (
        <button type="button" onClick={() => setExpanded((e) => !e)} className="w-full px-5 py-2.5 text-sm font-medium text-primary hover:bg-slate-50 border-t border-slate-100">
          {expanded ? t("dash.showLess") : t("dash.showAll", { n: items.length })}
        </button>
      )}
    </section>
  );
}

export function Home() {
  const { t, lang } = useT();
  const permissions = usePermissions();
  const { data, error, refresh } = useAdminOverview();
  const [refreshing, setRefreshing] = useState(false);
  const me = api.auth.getCurrentUser();
  const canApprove = me?.role === "Super Admin" || me?.role === "KKF Officer";
  const isClub = me?.role === "Club/Gym";

  const quick = [
    { label: isClub ? t("dash.q.registerFighter") : t("dash.q.addFighter"), href: "/home/fighters/kunkhmer/new", icon: UserPlus, show: permissions.hasPermission("fighters.create") },
    { label: t("dash.q.event"), href: "/home/events/new", icon: CalendarPlus, show: permissions.hasPermission("events.create") },
    { label: t("dash.q.card"), href: "/home/matches/new", icon: Layers, show: permissions.hasPermission("events.create") },
    { label: t("dash.q.news"), href: "/home/media/news", icon: Newspaper, show: canApprove },
    { label: t("dash.q.staff"), href: "/home/user-management", icon: Users, show: permissions.hasPermission("users.view") },
  ].filter((q) => q.show);

  const doRefresh = async () => {
    setRefreshing(true);
    await refresh().catch(() => {});
    setRefreshing(false);
  };

  const todos = data?.todos ?? [];
  const next = data?.upcoming[0];
  const hour = new Date().getHours();
  const greeting = hour < 12 ? t("dash.morning") : hour < 18 ? t("dash.afternoon") : t("dash.evening");
  // Today in the viewer's own time zone; Khmer is written out by hand (many browsers lack Khmer dates).
  const now = new Date();
  const today =
    lang === "km"
      ? formatDay(`${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`, "km")
      : now.toLocaleDateString(undefined, { weekday: "long", day: "numeric", month: "long", year: "numeric" });
  const shortDay = (d: string | null) =>
    !d ? "" : lang === "km" ? formatDay(d, "km", false) : new Date(d).toLocaleDateString(undefined, { weekday: "short", day: "numeric", month: "short", timeZone: "UTC" });
  const monthOf = (d: string) =>
    lang === "km" ? formatDay(d, "km", false).split(" ")[1] ?? "" : new Date(d).toLocaleDateString(undefined, { month: "short", timeZone: "UTC" });

  return (
    <div className="max-w-6xl mx-auto space-y-6" lang={lang}>
      <header className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <p className="text-sm text-slate-500">{today}</p>
          <h1 className="text-2xl md:text-3xl font-bold text-slate-900">{greeting}, {permissions.currentUser?.fullName?.split(" ")[0] ?? t("dash.there")}</h1>
        </div>
        <button type="button" onClick={doRefresh} disabled={refreshing} className="inline-flex items-center gap-2 h-10 px-4 rounded-xl border border-slate-200 bg-white text-sm font-medium text-slate-700 hover:border-slate-300 self-start sm:self-auto">
          <RefreshCw className={`w-4 h-4 ${refreshing ? "animate-spin" : ""}`} aria-hidden /> {t("dash.refresh")}
        </button>
      </header>

      {error ? (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-5 text-sm text-red-700">{error}</div>
      ) : !data ? (
        <div className="rounded-3xl border border-slate-200 bg-white p-12 flex justify-center"><div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" /></div>
      ) : todos.length === 0 ? (
        <section className="rounded-3xl border border-emerald-200 bg-emerald-50 p-8 md:p-10 text-center">
          <PartyPopper className="w-10 h-10 text-emerald-600 mx-auto" aria-hidden />
          <p className="mt-3 text-xl font-bold text-emerald-900">{t("dash.caughtUp")}</p>
          <p className="text-emerald-800">{t("dash.caughtUpText")}</p>
        </section>
      ) : (
        <NextJob item={todos[0]} more={todos.length - 1} canApprove={canApprove} onDone={doRefresh} />
      )}

      {quick.length > 0 && (
        <nav aria-label={t("dash.quick")} className="flex flex-wrap gap-2">
          {quick.map((q) => (
            <Link key={q.href} to={q.href} className="inline-flex items-center gap-2 h-11 px-4 rounded-xl border border-slate-200 bg-white text-sm font-semibold text-slate-800 hover:border-primary hover:text-primary transition">
              <q.icon className="w-4 h-4 text-primary" aria-hidden /> {q.label}
            </Link>
          ))}
        </nav>
      )}

      {data && (
        <>
          <section aria-label={t("dash.numbers")} className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            <Link to={next ? `/home/events/${next.id}` : "/home/program?tab=events"} className="col-span-2 lg:col-span-1 rounded-2xl border border-slate-200 bg-white p-5 hover:border-primary transition">
              <CalendarDays className="w-5 h-5 text-primary" aria-hidden />
              <p className="mt-3 text-3xl font-bold text-slate-900">{next ? countdown(next.date, t) : t("dash.noneYet")}</p>
              <p className="text-sm text-slate-600 truncate">{next ? t("dash.nextNight", { name: next.name }) : t("dash.noNight")}</p>
            </Link>
            <div className="col-span-2 lg:contents grid grid-cols-3 gap-3">
            {[
              { label: t("dash.activeFighters"), value: data.stats.activeFighters, href: "/home/fighters", icon: ShieldCheck },
              { label: t("dash.clubs"), value: data.stats.clubs, href: "/home/clubs", icon: Users },
              { label: t("dash.results"), value: data.stats.recordedResults, href: "/home/program?tab=events", icon: Gavel },
            ].map((s) => (
              <Link key={s.href + s.label} to={s.href} className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-5 hover:border-primary transition">
                <s.icon className="w-5 h-5 text-primary" aria-hidden />
                <p className="mt-3 text-2xl sm:text-3xl font-bold text-slate-900 tabular-nums">{num(s.value, lang)}</p>
                <p className="text-sm text-slate-600">{s.label}</p>
              </Link>
            ))}
            </div>
          </section>

          {todos.length > 1 && <MoreJobs items={todos.slice(1)} canApprove={canApprove} onDone={doRefresh} />}

          <div className="grid lg:grid-cols-2 gap-4 items-start">
            {/* Upcoming */}
            <section className="min-w-0 rounded-2xl border border-slate-200 bg-white">
              <header className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1 px-5 py-4 border-b border-slate-100">
                <h2 className="font-bold text-slate-900">{t("dash.upcoming")}</h2>
                <Link to="/home/program?tab=events" className="text-sm font-medium text-primary hover:underline">{t("dash.allEvents")}</Link>
              </header>
              {data.upcoming.length === 0 ? (
                <div className="p-6 text-center text-sm text-slate-600">
                  {t("dash.noUpcoming")}{" "}
                  {permissions.hasPermission("events.create") && <Link to="/home/events/new" className="font-medium text-primary hover:underline">{t("dash.createOne")}</Link>}
                </div>
              ) : (
                <ul className="divide-y divide-slate-100">
                  {data.upcoming.map((e) => (
                    <li key={e.id}>
                      <Link to={`/home/events/${e.id}`} className="flex items-center gap-3 px-5 py-3 hover:bg-slate-50">
                        <span className="w-12 text-center shrink-0">
                          <span className="block text-xs font-semibold uppercase text-primary">{monthOf(e.date)}</span>
                          <span className="block text-xl font-bold text-slate-900 leading-none">{num(new Date(e.date).getUTCDate(), lang)}</span>
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="block text-sm font-semibold text-slate-900 truncate">{e.name}</span>
                          <span className="block text-xs text-slate-500 truncate">
                            {e.location} · {e.bouts === 1 ? t("list.bout") : t("list.bouts", { n: e.bouts })}
                            {e.status === "Draft" ? ` · ${t("dash.draftTag")}` : ""}
                          </span>
                        </span>
                        <ChevronRight className="w-4 h-4 text-slate-400" aria-hidden />
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </section>

            {/* Recent results */}
            <section className="min-w-0 rounded-2xl border border-slate-200 bg-white">
              <header className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1 px-5 py-4 border-b border-slate-100">
                <h2 className="font-bold text-slate-900">{t("dash.recent")}</h2>
                <Link to="/home/program?tab=events" className="text-sm font-medium text-primary hover:underline">{t("dash.allNights")}</Link>
              </header>
              {data.recent.length === 0 ? (
                <p className="p-6 text-center text-sm text-slate-600">{t("dash.noResults")}</p>
              ) : (
                <ul className="divide-y divide-slate-100">
                  {data.recent.map((r) => (
                    <li key={r.id}>
                      <Link to={`/home/match/${r.id}`} className="block px-5 py-3 hover:bg-slate-50">
                        <p className="text-sm text-slate-900 truncate">
                          <span className={r.winner === r.red ? "font-bold" : ""}>{r.red}</span>
                          <span className="text-slate-400"> {t("common.vs")} </span>
                          <span className={r.winner === r.blue ? "font-bold" : ""}>{r.blue}</span>
                        </p>
                        <p className="text-xs text-slate-500 truncate">
                          {[
                            r.winner ? t("card.won", { name: r.winner }) : t("dash.drawNc"),
                            // In English the method stays as recorded ("KO"); in Khmer it is spelled out.
                            r.method && lang === "km" && METHODS.includes(r.method) ? t(`res.method.${r.method}` as TextKey) : r.method,
                            r.round ? t("dash.roundShort", { n: r.round }) : null,
                            shortDay(r.date),
                            r.event,
                          ].filter(Boolean).join(" · ")}
                        </p>
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </section>
          </div>
        </>
      )}
    </div>
  );
}
