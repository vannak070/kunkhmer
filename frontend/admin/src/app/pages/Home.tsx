/**
 * Dashboard: the one next job first, then the rest of the to-do list, real numbers, upcoming fight
 * nights and recent results. Every figure comes from the API; nothing is estimated.
 * claude/updates/dashboard-next-job.md
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
import { APPROVALS_ENABLED } from "../config/features";

const GROUPS: { kind: TodoKind; title: string; hint: string; icon: typeof Gavel; tone: string; action: string }[] = [
  { kind: "eventApproval", title: "Events to approve", hint: "Organizers submitted these events. Approve them, or send them back with a comment.", icon: CalendarCheck, tone: "text-violet-700 bg-violet-50", action: "Review" },
  { kind: "eventSentBack", title: "Events sent back", hint: "KKF asked for changes. Fix them and submit again.", icon: MessageSquareWarning, tone: "text-amber-700 bg-amber-50", action: "Open event" },
  { kind: "readyToPublish", title: "Ready to publish", hint: "Approved by KKF but not visible to fans yet.", icon: Megaphone, tone: "text-emerald-700 bg-emerald-50", action: "Publish" },
  { kind: "boutToAnswer", title: "Bouts to answer", hint: "Bouts proposed for your fighters. Accept them, or decline with a reason.", icon: Swords, tone: "text-sky-700 bg-sky-50", action: "Answer" },
  { kind: "boutDeclined", title: "Bouts declined by a club", hint: "A club said no. Change the fighter, or remove the bout.", icon: MessageSquareWarning, tone: "text-red-700 bg-red-50", action: "Fix bout" },
  { kind: "fighterSentBack", title: "Fighters sent back", hint: "KKF asked for changes to these profiles. Edit and save to send them again.", icon: MessageSquareWarning, tone: "text-red-700 bg-red-50", action: "Fix profile" },
  { kind: "result", title: "Results to record", hint: "Bouts that already happened but have no result. Fans and fighter records wait for these.", icon: Gavel, tone: "text-red-600 bg-red-50", action: "Record result" },
  { kind: "noOfficials", title: "Bouts without officials", hint: "Fight night is within 14 days. Assign a referee and three judges.", icon: ShieldCheck, tone: "text-sky-700 bg-sky-50", action: "Assign officials" },
  APPROVALS_ENABLED
    ? { kind: "fighter", title: "Fighters to verify", hint: "Registered fighters waiting for KKF approval before they can be matched.", icon: UserCheck, tone: "text-amber-700 bg-amber-50", action: "Review" }
    : { kind: "fighter", title: "Draft fighters", hint: "Not visible to fans and can't be matched yet. Activate them when the profile is complete.", icon: UserCheck, tone: "text-amber-700 bg-amber-50", action: "Open" },
  { kind: "draftEvent", title: "Draft events", hint: "Events fans can't see yet. Finish the details and publish them.", icon: FilePenLine, tone: "text-violet-700 bg-violet-50", action: "Open event" },
  { kind: "emptyEvent", title: "Events without a fight card", hint: "Upcoming events with no bouts scheduled.", icon: Layers, tone: "text-blue-700 bg-blue-50", action: "Add fight card" },
  { kind: "boutWaiting", title: "Bouts waiting for clubs", hint: "Fight night is within 14 days and a club hasn't answered. Fans can't see these bouts yet.", icon: Clock, tone: "text-amber-700 bg-amber-50", action: "Open" },
  { kind: "unconfirmed", title: "Weigh-ins to do", hint: "Bouts in the next 14 days where a fighter hasn't been weighed in yet.", icon: ClipboardList, tone: "text-sky-700 bg-sky-50", action: "Open fight card" },
  { kind: "vacantTitle", title: "Vacant titles", hint: "Championship titles with no holder.", icon: Trophy, tone: "text-amber-700 bg-amber-50", action: "Schedule title bout" },
];

const greeting = () => {
  const h = new Date().getHours();
  return h < 12 ? "Good morning" : h < 18 ? "Good afternoon" : "Good evening";
};
const fmt = (d: string | null) => (d ? new Date(d).toLocaleDateString(undefined, { weekday: "short", day: "numeric", month: "short", timeZone: "UTC" }) : "");
const DAY = 86_400_000;
const daysUntil = (d: string) => Math.round((new Date(d).getTime() - new Date(new Date().toISOString().slice(0, 10)).getTime()) / DAY);
const countdown = (d: string) => {
  const n = daysUntil(d);
  return n <= 0 ? "Today" : n === 1 ? "Tomorrow" : `In ${n} days`;
};
const groupOf = (kind: TodoKind) => GROUPS.find((g) => g.kind === kind)!;
const MORE_SHOWN = 6;

function NextJob({ item, more, canApprove, onDone }: { item: TodoItem; more: number; canApprove: boolean; onDone: () => void }) {
  const group = groupOf(item.kind);
  const Icon = group.icon;
  return (
    <section aria-label="Your next job" className="rounded-3xl border border-slate-200 bg-white p-6 md:p-8">
      <p className="text-sm font-semibold text-primary">Your next job</p>
      <div className="mt-4 flex flex-col md:flex-row md:items-center gap-5">
        <span className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 ${group.tone}`}><Icon className="w-7 h-7" aria-hidden /></span>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-slate-500">{group.title}</p>
          <h2 className="text-xl md:text-2xl font-bold text-slate-900 break-words">{item.title}</h2>
          <p className="text-slate-600 break-words">{item.detail}</p>
        </div>
        <div className="flex flex-wrap items-center gap-2 shrink-0">
          {item.kind === "fighter" && canApprove && item.fighterId && (
            <FighterReviewActions compact fighter={{ id: item.fighterId, name: item.title }} onDone={onDone} />
          )}
          <Link to={item.href} className="inline-flex items-center justify-center gap-1.5 h-12 px-6 rounded-xl bg-primary text-white font-semibold hover:opacity-90">
            {group.action} <ChevronRight className="w-5 h-5" aria-hidden />
          </Link>
        </div>
      </div>
      <p className="mt-4 text-sm text-slate-500">{group.hint}{more > 0 ? ` · ${more} more ${more === 1 ? "job" : "jobs"} after this one` : ""}</p>
    </section>
  );
}

function MoreJobs({ items, canApprove, onDone }: { items: TodoItem[]; canApprove: boolean; onDone: () => void }) {
  const [expanded, setExpanded] = useState(false);
  const shown = expanded ? items : items.slice(0, MORE_SHOWN);
  return (
    <section aria-labelledby="more-title" className="rounded-2xl border border-slate-200 bg-white">
      <header className="px-5 py-4 border-b border-slate-100">
        <h2 id="more-title" className="font-bold text-slate-900">Also waiting <span className="ml-1 text-sm font-semibold text-slate-400">{items.length}</span></h2>
      </header>
      <ul className="divide-y divide-slate-100">
        {shown.map((t) => {
          const g = groupOf(t.kind);
          const Icon = g.icon;
          return (
            <li key={t.id} className="flex items-center gap-3 px-5 py-3">
              <span className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${g.tone}`}><Icon className="w-5 h-5" aria-hidden /></span>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-slate-900 truncate">{t.title}</p>
                <p className="text-xs text-slate-500 truncate">{g.title} · {t.detail}</p>
              </div>
              {t.kind === "fighter" && canApprove && t.fighterId && (
                <FighterReviewActions compact fighter={{ id: t.fighterId, name: t.title }} onDone={onDone} />
              )}
              <Link to={t.href} className="inline-flex items-center gap-1 h-9 px-3 rounded-lg border border-slate-200 hover:border-primary text-sm font-medium text-slate-700 hover:text-primary shrink-0">
                {g.action} <ChevronRight className="w-4 h-4" aria-hidden />
              </Link>
            </li>
          );
        })}
      </ul>
      {items.length > MORE_SHOWN && (
        <button type="button" onClick={() => setExpanded((e) => !e)} className="w-full px-5 py-2.5 text-sm font-medium text-primary hover:bg-slate-50 border-t border-slate-100">
          {expanded ? "Show less" : `Show all ${items.length}`}
        </button>
      )}
    </section>
  );
}

export function Home() {
  const permissions = usePermissions();
  const { data, error, refresh } = useAdminOverview();
  const [refreshing, setRefreshing] = useState(false);
  const me = api.auth.getCurrentUser();
  const canApprove = me?.role === "Super Admin" || me?.role === "KKF Officer";
  const isClub = me?.role === "Club/Gym";

  const quick = [
    { label: isClub ? "Register a fighter" : "Add a fighter", href: "/home/fighters/kunkhmer/new", icon: UserPlus, show: permissions.hasPermission("fighters.create") },
    { label: "Create an event", href: "/home/events/new", icon: CalendarPlus, show: permissions.hasPermission("events.create") },
    { label: "Create a fight card", href: "/home/matches/new", icon: Layers, show: permissions.hasPermission("events.create") },
    { label: "Write news", href: "/home/media/news", icon: Newspaper, show: canApprove },
    { label: "Manage staff", href: "/home/user-management", icon: Users, show: permissions.hasPermission("users.view") },
  ].filter((q) => q.show);

  const doRefresh = async () => {
    setRefreshing(true);
    await refresh().catch(() => {});
    setRefreshing(false);
  };

  const todos = data?.todos ?? [];
  const next = data?.upcoming[0];

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <header className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <p className="text-sm text-slate-500">{new Date().toLocaleDateString(undefined, { weekday: "long", day: "numeric", month: "long", year: "numeric" })}</p>
          <h1 className="text-2xl md:text-3xl font-bold text-slate-900">{greeting()}, {permissions.currentUser?.fullName?.split(" ")[0] ?? "there"}</h1>
        </div>
        <button type="button" onClick={doRefresh} disabled={refreshing} className="inline-flex items-center gap-2 h-10 px-4 rounded-xl border border-slate-200 bg-white text-sm font-medium text-slate-700 hover:border-slate-300 self-start sm:self-auto">
          <RefreshCw className={`w-4 h-4 ${refreshing ? "animate-spin" : ""}`} aria-hidden /> Refresh
        </button>
      </header>

      {error ? (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-5 text-sm text-red-700">{error}</div>
      ) : !data ? (
        <div className="rounded-3xl border border-slate-200 bg-white p-12 flex justify-center"><div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" /></div>
      ) : todos.length === 0 ? (
        <section className="rounded-3xl border border-emerald-200 bg-emerald-50 p-8 md:p-10 text-center">
          <PartyPopper className="w-10 h-10 text-emerald-600 mx-auto" aria-hidden />
          <p className="mt-3 text-xl font-bold text-emerald-900">All caught up</p>
          <p className="text-emerald-800">No results to record, fighters to activate or drafts to finish.</p>
        </section>
      ) : (
        <NextJob item={todos[0]} more={todos.length - 1} canApprove={canApprove} onDone={doRefresh} />
      )}

      {quick.length > 0 && (
        <nav aria-label="Quick actions" className="flex flex-wrap gap-2">
          {quick.map((q) => (
            <Link key={q.href} to={q.href} className="inline-flex items-center gap-2 h-11 px-4 rounded-xl border border-slate-200 bg-white text-sm font-semibold text-slate-800 hover:border-primary hover:text-primary transition">
              <q.icon className="w-4 h-4 text-primary" aria-hidden /> {q.label}
            </Link>
          ))}
        </nav>
      )}

      {data && (
        <>
          <section aria-label="Key numbers" className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            <Link to={next ? `/home/events/${next.id}` : "/home/program?tab=events"} className="col-span-2 lg:col-span-1 rounded-2xl border border-slate-200 bg-white p-5 hover:border-primary transition">
              <CalendarDays className="w-5 h-5 text-primary" aria-hidden />
              <p className="mt-3 text-3xl font-bold text-slate-900">{next ? countdown(next.date) : "None yet"}</p>
              <p className="text-sm text-slate-600 truncate">{next ? `Next fight night · ${next.name}` : "No fight night coming up"}</p>
            </Link>
            <div className="col-span-2 lg:contents grid grid-cols-3 gap-3">
            {[
              { label: "Active fighters", value: data.stats.activeFighters, href: "/home/fighters", icon: ShieldCheck },
              { label: "Clubs", value: data.stats.clubs, href: "/home/clubs", icon: Users },
              { label: "Results recorded", value: data.stats.recordedResults, href: "/home/program?tab=events", icon: Gavel },
            ].map((s) => (
              <Link key={s.label} to={s.href} className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-5 hover:border-primary transition">
                <s.icon className="w-5 h-5 text-primary" aria-hidden />
                <p className="mt-3 text-2xl sm:text-3xl font-bold text-slate-900 tabular-nums">{s.value}</p>
                <p className="text-sm text-slate-600">{s.label}</p>
              </Link>
            ))}
            </div>
          </section>

          {todos.length > 1 && <MoreJobs items={todos.slice(1)} canApprove={canApprove} onDone={doRefresh} />}

          <div className="grid lg:grid-cols-2 gap-4 items-start">
            {/* Upcoming */}
            <section className="rounded-2xl border border-slate-200 bg-white">
              <header className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
                <h2 className="font-bold text-slate-900">Upcoming fight nights</h2>
                <Link to="/home/program?tab=events" className="text-sm font-medium text-primary hover:underline">All events</Link>
              </header>
              {data.upcoming.length === 0 ? (
                <div className="p-6 text-center text-sm text-slate-600">
                  No upcoming events.{" "}
                  {permissions.hasPermission("events.create") && <Link to="/home/events/new" className="font-medium text-primary hover:underline">Create one</Link>}
                </div>
              ) : (
                <ul className="divide-y divide-slate-100">
                  {data.upcoming.map((e) => (
                    <li key={e.id}>
                      <Link to={`/home/events/${e.id}`} className="flex items-center gap-3 px-5 py-3 hover:bg-slate-50">
                        <span className="w-12 text-center shrink-0">
                          <span className="block text-xs font-semibold uppercase text-primary">{new Date(e.date).toLocaleDateString(undefined, { month: "short", timeZone: "UTC" })}</span>
                          <span className="block text-xl font-bold text-slate-900 leading-none">{new Date(e.date).getUTCDate()}</span>
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="block text-sm font-semibold text-slate-900 truncate">{e.name}</span>
                          <span className="block text-xs text-slate-500 truncate">{e.location} · {e.bouts} {e.bouts === 1 ? "bout" : "bouts"}{e.status === "Draft" ? " · Draft" : ""}</span>
                        </span>
                        <ChevronRight className="w-4 h-4 text-slate-400" aria-hidden />
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </section>

            {/* Recent results */}
            <section className="rounded-2xl border border-slate-200 bg-white">
              <header className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
                <h2 className="font-bold text-slate-900">Recent results</h2>
                <Link to="/home/program?tab=events" className="text-sm font-medium text-primary hover:underline">All fight nights</Link>
              </header>
              {data.recent.length === 0 ? (
                <p className="p-6 text-center text-sm text-slate-600">No results recorded yet.</p>
              ) : (
                <ul className="divide-y divide-slate-100">
                  {data.recent.map((r) => (
                    <li key={r.id}>
                      <Link to={`/home/match/${r.id}`} className="block px-5 py-3 hover:bg-slate-50">
                        <p className="text-sm text-slate-900 truncate">
                          <span className={r.winner === r.red ? "font-bold" : ""}>{r.red}</span>
                          <span className="text-slate-400"> vs </span>
                          <span className={r.winner === r.blue ? "font-bold" : ""}>{r.blue}</span>
                        </p>
                        <p className="text-xs text-slate-500 truncate">
                          {[r.winner ? `${r.winner} won` : "Draw / no contest", r.method, r.round ? `R${r.round}` : null, fmt(r.date), r.event].filter(Boolean).join(" · ")}
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
