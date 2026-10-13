/**
 * The guided fight night (claude/updates/program-guided-fight-night.md): one flow in four groups following KKF's
 * process — Agree (details, sponsors, titles) → Build the card (bouts, officials) → Go public (publish, weigh-in) →
 * Fight night (results). Each step shows a status, one short sentence and its buttons; done and later steps are
 * one-line rows; the next step is highlighted and, on a phone, repeated in a sticky bar.
 * KKF staff see everything and can act; an Organizer sees "Your part" (the three agreements, which it sends to KKF)
 * and "KKF's part" (read-only progress). The fight card level is hidden: the first "Add bout" creates the "Main card".
 */
import { useState } from "react";
import { useNavigate } from "react-router";
import { toast } from "sonner";
import { CheckCircle2, ChevronRight, Circle, Clock, ListChecks, Lock, MinusCircle } from "lucide-react";
import { api } from "../../utils/api";
import { type TextKey, formatDay, useT } from "../../i18n/program";
import { type AgreementItem, type Agreements, LOCKED_FOR_ORGANIZER, useAgreementActions } from "./AgreementsPanel";
import { dayOf, hasResult, officialsComplete, todayUtc, weighState } from "./shared";

type Status = "done" | "todo" | "waitOrg" | "waitKkf" | "locked" | "later" | "over";
interface Action { label: string; run: () => void; primary?: boolean }
interface Step { key: string; group: 1 | 2 | 3 | 4 | 5; title: string; status: Status; detail: string; actions: Action[] }

const NO_DATA: Agreements = { licence: { number: null, date: null, hasDocument: false }, titles: [], items: { details: { state: "none", agreement: null }, sponsors: { state: "none", agreement: null }, titles: { state: "none", agreement: null } }, log: [] };
const NONE_STAFF: Record<AgreementItem, TextKey> = { details: "flow.d.nsDetails", sponsors: "flow.d.nsSponsors", titles: "flow.d.nsTitles" };
const NONE_ORG: Record<AgreementItem, TextKey> = { details: "flow.d.noDetails", sponsors: "flow.d.noSponsors", titles: "flow.d.noTitles" };
const TITLE_KEY: Record<AgreementItem, TextKey> = { details: "agr.details", sponsors: "agr.sponsors", titles: "agr.titles" };

/** No buttons on steps that can't be done now. */
const HIDE_ACTIONS: Status[] = ["later", "locked", "over"];

const CHIP: Record<Status, { tone: string; text: TextKey }> = {
  done: { tone: "bg-emerald-50 text-emerald-700", text: "flow.s.done" },
  todo: { tone: "bg-[#eef3fb] text-primary", text: "flow.s.todo" },
  waitOrg: { tone: "bg-amber-50 text-amber-800", text: "flow.s.waitOrg" },
  waitKkf: { tone: "bg-amber-50 text-amber-800", text: "flow.s.waitKkf" },
  locked: { tone: "bg-slate-100 text-slate-600", text: "flow.s.locked" },
  later: { tone: "bg-slate-100 text-slate-500", text: "flow.s.later" },
  over: { tone: "bg-slate-100 text-slate-500", text: "flow.s.over" },
};

/** What "After the match" needs (staff only; claude/updates/match-signoff-settlement.md). */
export interface AfterProps {
  disputes: any[];
  parties: any[];
  signedOffAt: string | null;
  signedOffBy: string | null;
  isSuper: boolean;
  onSignOff: () => void;
  onRecordDispute: () => void;
  onReopen: () => void;
}

export interface FlowProps {
  event: any;
  cards: any[];
  bouts: any[];
  /** null = could not be loaded. */
  agreements: Agreements | null;
  mode: "staff" | "organizer";
  canEdit: boolean;
  canEditDetails: boolean;
  onEditDetails: () => void;
  onChanged: () => void;
  /** KKF staff only: disputes, sign-off and settlement as the last group. */
  after?: AfterProps;
}

/** The steps of one fight night for one viewer, with their actions (the full page and the overview share this). */
export function useNightFlow({ event, cards, bouts, agreements, mode, canEdit, canEditDetails, onEditDetails, onChanged, after }: FlowProps) {
  const { t, lang } = useT();
  const navigate = useNavigate();
  const isStaff = mode === "staff";
  const [busy, setBusy] = useState(false);
  const act = useAgreementActions({ event, data: agreements ?? NO_DATA, isStaff, onChanged });

  const day = (d: string | null) => (d ? formatDay(d, lang, false) : "");
  const published = ["Published", "Completed"].includes(event.status);
  const canChange = isStaff || !LOCKED_FOR_ORGANIZER.includes(event.status);

  const go = async (call: () => Promise<unknown>, message?: string) => {
    setBusy(true);
    try {
      await call();
      if (message) toast.success(message);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : t("common.error"));
    } finally {
      setBusy(false);
    }
  };
  const publish = () => go(async () => { await api.events.update(event.id, { status: "Published" }); onChanged(); }, t("steps.published"));

  const open = bouts.filter((b) => !hasResult(b));
  const needRep = bouts.filter((b) => b.replacement_side);
  const cardOf = (b: any) => cards.find((c) => c.id === b.sub_event_id);
  const fewest = [...cards].sort((a, b) => bouts.filter((x) => x.sub_event_id === a.id).length - bouts.filter((x) => x.sub_event_id === b.id).length)[0];
  const noOfficials = open.filter((b) => !officialsComplete(b));
  const notWeighed = open.filter((b) => weighState(b) === "none" || weighState(b) === "half");
  const withResult = bouts.filter(hasResult);
  const nightPassed = dayOf(event.date) <= todayUtc();

  // The first "Add bouts" creates the "Main card": officers never have to think about fight cards.
  const addBouts = () => go(async () => {
    let id = fewest?.id as string | undefined;
    if (!id) {
      const created = await api.batches.create({ eventId: event.id, name: "Main card", weekNumber: 1, date: String(event.date ?? "").slice(0, 10), location: event.location || "—" });
      id = created?.id;
    }
    if (id) navigate(`/home/matches/${id}/create-match`);
  });

  const editDetails: Action[] = canEditDetails ? [{ label: t("night.editDetails"), run: onEditDetails }] : [];

  const agreementStep = (item: AgreementItem): Step => {
    const base = { key: item, group: 1 as const, title: t(TITLE_KEY[item]) };
    if (!agreements) return { ...base, status: "later", detail: t("flow.d.noData"), actions: [] };
    const { state, agreement: a } = agreements.items[item];
    const outdated = state === "waiting" && a?.matches_current === false;
    const side: Action[] = item === "details" ? editDetails : item === "titles" && canChange ? [{ label: t("agr.chooseTitles"), run: act.chooseTitles }] : [];
    const names = item === "titles" && agreements.titles.length ? agreements.titles.map((x) => x.title_name).join(", ") : "";
    const withNames = (text: string) => (names ? `${names} · ${text}` : text);

    if (item === "titles" && agreements.titles.length === 0) {
      return { ...base, status: "done", detail: t("flow.d.titlesNone"), actions: canChange ? [{ label: t("flow.b.addTitle"), run: act.chooseTitles }] : [] };
    }
    if (state === "confirmed") {
      return { ...base, status: "done", detail: withNames(a?.confirmed_by_name ? t("flow.d.confirmedBy", { name: a.confirmed_by_name, date: day(a.confirmed_at) }) : t("flow.d.confirmed")), actions: side };
    }
    if (state === "waiting" && !outdated && a) {
      return isStaff
        ? { ...base, status: "todo", detail: withNames(t("flow.d.waitStaff", { name: a.recorded_by_name ?? "—" })), actions: [{ label: t("flow.b.confirm"), run: () => act.confirm(a), primary: true }, { label: t("agr.sendBack"), run: () => act.sendBack(a) }, ...side] }
        : { ...base, status: "waitKkf", detail: withNames(t("flow.d.waitOrg")), actions: side };
    }
    const returned = state === "returned" && a?.kkf_comment;
    const detail = returned ? t("agr.kkfSaid", { comment: a!.kkf_comment! }) : state === "changed" || outdated ? t(isStaff ? "flow.d.changedStaff" : "flow.d.changedOrg") : t((isStaff ? NONE_STAFF : NONE_ORG)[item]);
    if (!canChange) return { ...base, status: "waitKkf", detail: t("flow.d.kkfOnly"), actions: [] };
    // KKF handles an item the organizer must fix itself (waiting for the organizer), but can still confirm it directly.
    const send: Action = { label: isStaff ? t("flow.b.confirm") : t(returned ? "flow.b.sendAgain" : "flow.b.sendKkf"), run: () => act.send(item), primary: !(isStaff && returned) };
    return { ...base, status: isStaff && returned ? "waitOrg" : "todo", detail: withNames(detail), actions: [send, ...side] };
  };

  // Disputes → sign-off → settlement (claude/updates/match-signoff-settlement.md).
  const afterSteps = (a: AfterProps): Step[] => {
    const openDisputes = a.disputes.filter((d) => d.status === "open").length;
    const settled = a.parties.filter((p) => p.settled).length;
    const goto = (id: string) => () => document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
    const live = bouts.filter((b) => b.status !== "Cancelled");
    const missing = live.filter((b) => !hasResult(b)).length;
    const lock = !live.length ? t("so.lock.noBouts") : needRep.length ? t("so.lock.replacement") : missing ? t("so.lock.results", { n: missing }) : openDisputes ? t("so.lock.disputes") : null;
    const later = (key: string, title: string): Step => ({ key, group: 5, title, status: "later", detail: t("so.d.laterDay"), actions: [] });
    return [
      !nightPassed ? later("disputes", t("so.s.disputes")) : {
        key: "disputes", group: 5, title: t("so.s.disputes"),
        status: openDisputes ? "todo" : "done",
        detail: openDisputes ? t("so.d.openDisputes", { n: openDisputes }) : a.disputes.length ? t("so.d.resolvedDisputes", { n: a.disputes.length }) : t("so.d.noDisputes"),
        actions: openDisputes ? [{ label: t("so.b.resolve"), run: goto("disputes"), primary: true }] : [{ label: t("so.b.record"), run: a.onRecordDispute }],
      },
      a.signedOffAt ? {
        key: "signoff", group: 5, title: t("so.s.signoff"), status: "done",
        detail: t("so.d.signedOff", { name: a.signedOffBy ?? "—", date: day(a.signedOffAt.slice(0, 10)) }),
        actions: a.isSuper ? [{ label: t("so.b.reopen"), run: a.onReopen }] : [],
      } : !nightPassed ? later("signoff", t("so.s.signoff")) : {
        key: "signoff", group: 5, title: t("so.s.signoff"), status: lock ? "locked" : "todo",
        detail: lock ?? t("so.d.signoffReady"),
        actions: lock ? [] : [{ label: t("so.b.signoff"), run: a.onSignOff, primary: true }],
      },
      !nightPassed ? later("settlement", t("so.s.settlement")) : {
        key: "settlement", group: 5, title: t("so.s.settlement"),
        status: !a.parties.length || settled === a.parties.length ? "done" : "todo",
        detail: !a.parties.length ? t("so.d.settlementNone") : t("so.d.settlementCount", { done: settled, total: a.parties.length }),
        actions: a.parties.length ? [{ label: t("so.b.settlement"), run: goto("settlement"), primary: settled < a.parties.length }] : [],
      },
    ];
  };

  const kkfOnly = (s: Omit<Step, "actions">, actions: Action[], waiting = true): Step =>
    isStaff ? { ...s, actions } : { ...s, status: s.status === "todo" && waiting ? "waitKkf" : s.status, actions: [] };

  const detailsOk = !agreements || (agreements.items.details.state === "confirmed" && (agreements.titles.length === 0 || agreements.items.titles.state === "confirmed"));
  const publishStatus: Status = published ? "done" : !bouts.length ? "later" : !detailsOk ? "locked" : "todo";

  const steps: Step[] = [
    agreementStep("details"),
    agreementStep("sponsors"),
    agreementStep("titles"),
    // A withdrawn fighter's bout stays on the card until a replacement is recorded (claude/updates/withdrawals-postponement.md).
    needRep.length
      ? { key: "bouts", group: 2, title: t("steps.bouts"), status: "todo", detail: t("ch.needsReplacements", { n: needRep.length }), actions: [{ label: t("ch.choose"), run: () => navigate(`/home/match/${needRep[0].id}`), primary: true }] }
      : kkfOnly(
          { key: "bouts", group: 2, title: t("steps.bouts"), status: bouts.length ? "done" : "todo", detail: bouts.length ? t("steps.boutsDone", { n: bouts.length }) : t("steps.boutsTodo") },
          canEdit ? [{ label: t("steps.addBouts"), run: addBouts, primary: true }] : [],
        ),
    kkfOnly(
      {
        key: "officials", group: 2, title: t("steps.officials"),
        status: !bouts.length ? "later" : noOfficials.length === 0 ? "done" : nightPassed ? "over" : "todo",
        detail: !bouts.length ? t("steps.after") : noOfficials.length === 0 ? t("steps.officialsDone") : nightPassed ? t("steps.skipped") : t("steps.officialsTodo", { done: open.length - noOfficials.length, total: open.length }),
      },
      noOfficials[0] ? [{ label: t("card.officials"), run: () => navigate(`/home/matches/${cardOf(noOfficials[0])?.id}/assign-officials`), primary: true }] : [],
    ),
    kkfOnly(
      {
        key: "publish", group: 3, title: t("steps.publish"), status: publishStatus,
        detail: published ? t("steps.publishDone") : !bouts.length ? t("steps.publishNeedsBout") : !detailsOk ? t("flow.d.lockedStaff") : t("steps.publishTodo"),
      },
      canEdit && publishStatus === "todo" ? [{ label: t("steps.publishAction"), run: publish, primary: true }] : [],
    ),
    kkfOnly(
      {
        key: "weighin", group: 3, title: t("steps.weighin"),
        status: !bouts.length ? "later" : notWeighed.length === 0 ? "done" : nightPassed ? "over" : "todo",
        detail: !bouts.length ? t("steps.after") : notWeighed.length === 0 ? t("steps.weighinDone") : nightPassed ? t("steps.skipped") : t("steps.weighinTodo", { done: open.length - notWeighed.length, total: open.length }),
      },
      notWeighed[0] ? [{ label: t("card.weighin"), run: () => navigate(`/home/fight-cards/${cardOf(notWeighed[0])?.id}/weigh-in`) }] : [],
    ),
    kkfOnly(
      {
        key: "results", group: 4, title: t("steps.results"),
        status: !bouts.length || !nightPassed ? "later" : withResult.length === bouts.length ? "done" : "todo",
        detail: !bouts.length ? t("steps.after") : !nightPassed ? t("steps.resultsLater", { n: bouts.length }) : withResult.length === bouts.length ? t("steps.resultsDone") : t("steps.resultsTodo", { done: withResult.length, total: bouts.length }),
      },
      open[0] ? [{ label: t("card.results"), run: () => navigate(`/home/fight-cards/${cardOf(open[0])?.id}/results`), primary: true }] : [],
    ),
    ...(after && isStaff ? afterSteps(after) : []),
  ];
  // Organizer: publishing waits for KKF, say so plainly.
  if (!isStaff) {
    const p = steps.find((s) => s.key === "publish")!;
    if (!published && p.status !== "later") p.detail = t(p.status === "locked" ? "flow.d.lockedOrg" : "flow.d.kkfPublishes");
  }

  const countable = steps.filter((s) => s.status !== "over");
  const doneCount = countable.filter((s) => s.status === "done").length;
  // After fight night the job is the results, whatever else is still open.
  const actionable = steps.filter((s) => s.status === "todo" && s.actions.length > 0 && (isStaff || s.group === 1));
  const next = (nightPassed && actionable.find((s) => s.key === "results")) || actionable[0];

  return { steps, next, countable, doneCount, isStaff, act, busy, t };
}

export function NightFlow(props: FlowProps) {
  const { steps, next, countable, doneCount, isStaff, act, busy, t } = useNightFlow(props);
  if (props.event.status === "Cancelled") return null;
  const row = (s: Step) => {
    const isNext = next?.key === s.key;
    const compact = s.status === "done" || s.status === "later" || s.status === "over" || s.status === "locked";
    const chip = s.status === "todo" && !isStaff ? { tone: CHIP.todo.tone, text: "flow.s.yourTurn" as TextKey } : CHIP[s.status];
    const icon = s.status === "done" ? <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" aria-hidden />
      : s.status === "over" ? <MinusCircle className="w-5 h-5 text-slate-300 shrink-0" aria-hidden />
      : s.status === "locked" ? <Lock className="w-5 h-5 text-slate-400 shrink-0" aria-hidden />
      : s.status === "waitKkf" || s.status === "waitOrg" ? <Clock className="w-5 h-5 text-amber-600 shrink-0" aria-hidden />
      : <Circle className={`w-5 h-5 shrink-0 ${isNext ? "text-primary" : "text-slate-300"}`} aria-hidden />;
    return (
      <li key={s.key} className={`rounded-xl border ${compact ? "px-4 py-3" : "p-4"} ${isNext ? "border-primary bg-[#f5f8fd] ring-2 ring-primary/10" : s.status === "done" ? "border-emerald-200 bg-emerald-50/40" : "border-slate-200 bg-white"}`}>
        <div className="flex flex-col sm:flex-row sm:items-center gap-3">
          <div className="flex items-start gap-3 min-w-0 flex-1">
            <span className="mt-0.5">{icon}</span>
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <span className={`font-semibold ${s.status === "later" || s.status === "over" ? "text-slate-500" : "text-slate-900"}`}>{s.title}</span>
                <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${chip.tone}`}>{t(chip.text)}</span>
                {isNext && <span className="text-[11px] font-bold uppercase tracking-wide text-primary">{t("steps.next")}</span>}
              </div>
              <p className={`text-sm mt-0.5 break-words ${compact ? "text-slate-500" : "text-slate-700"}`}>{s.detail}</p>
            </div>
          </div>
          {s.actions.length > 0 && !HIDE_ACTIONS.includes(s.status) && (
            <div className="flex flex-wrap gap-2 sm:justify-end">
              {s.actions.map((a) => (
                <button
                  key={a.label}
                  type="button"
                  disabled={busy || act.busy}
                  onClick={a.run}
                  className={`inline-flex items-center gap-1 h-11 px-4 rounded-xl text-sm font-semibold disabled:opacity-60 ${a.primary ? "bg-primary text-white hover:opacity-90" : "border border-slate-300 bg-white text-slate-700 hover:border-primary hover:text-primary"}`}
                >
                  {a.label} {a.primary && <ChevronRight className="w-4 h-4" aria-hidden />}
                </button>
              ))}
            </div>
          )}
        </div>
      </li>
    );
  };

  const group = (g: 1 | 2 | 3 | 4 | 5, title: string, hint?: string) => {
    const list = steps.filter((s) => s.group === g);
    if (!list.length) return null;
    return (
      <div key={g} className="space-y-2">
        <h3 className="text-sm font-bold text-slate-700 flex items-center gap-2">
          <span className="w-6 h-6 rounded-full bg-slate-100 text-slate-600 text-xs font-bold inline-flex items-center justify-center" aria-hidden>{g}</span> {title}
        </h3>
        {hint && <p className="text-sm text-slate-500 -mt-1">{hint}</p>}
        <ol className="space-y-2">{list.map(row)}</ol>
      </div>
    );
  };

  return (
    <>
      <section aria-labelledby="flow-title" className="rounded-2xl border border-slate-200 bg-white p-5 md:p-6 space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 id="flow-title" className="text-lg font-bold text-slate-900 flex items-center gap-2"><ListChecks className="w-5 h-5 text-primary" aria-hidden /> {t("steps.title")}</h2>
          <span className="text-sm font-medium text-slate-500">{t("steps.done", { done: doneCount, total: countable.length })}</span>
        </div>
        <div className="h-2 rounded-full bg-slate-100 overflow-hidden"><div className="h-full bg-emerald-500 transition-all" style={{ width: `${(doneCount / countable.length) * 100}%` }} /></div>
        {isStaff ? (
          <>
            {group(1, t("flow.g1"))}
            {group(2, t("flow.g2"))}
            {group(3, t("flow.g3"))}
            {group(4, t("flow.g4"))}
            {group(5, t("so.group"))}
          </>
        ) : (
          <>
            {group(1, t("flow.yours"), t("flow.yoursHint"))}
            <div className="space-y-2">
              <h3 className="text-sm font-bold text-slate-700">{t("flow.kkf")}</h3>
              <p className="text-sm text-slate-500 -mt-1">{t("flow.kkfHint")}</p>
              <ol className="space-y-2">{steps.filter((s) => s.group > 1).map(row)}</ol>
            </div>
          </>
        )}
        {act.dialogs}
      </section>
      {next && (
        <div className="md:hidden sticky bottom-[-1.75rem] z-10 -mx-1 rounded-2xl border border-primary/30 bg-white shadow-lg p-3 flex items-center gap-3">
          <p className="min-w-0 flex-1 text-sm font-semibold text-slate-900 break-words">{t("flow.nextBar", { title: next.title })}</p>
          <button type="button" disabled={busy || act.busy} onClick={next.actions[0].run} className="shrink-0 h-11 px-4 rounded-xl bg-primary text-white text-sm font-semibold disabled:opacity-60">{next.actions[0].label}</button>
        </div>
      )}
    </>
  );
}

/** The overview's version: progress and the one next step with its button, no list. */
export function NightNextCard(props: FlowProps) {
  const { next, countable, doneCount, act, busy, t } = useNightFlow(props);
  if (props.event.status === "Cancelled") return null;
  const done = doneCount === countable.length;
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h3 className="text-base font-bold text-slate-900 flex items-center gap-2"><ListChecks className="w-5 h-5 text-primary" aria-hidden /> {t("steps.title")}</h3>
        <span className="text-sm font-medium text-slate-500">{t("steps.done", { done: doneCount, total: countable.length })}</span>
      </div>
      <div className="h-2 rounded-full bg-slate-100 overflow-hidden"><div className="h-full bg-emerald-500 transition-all" style={{ width: `${(doneCount / countable.length) * 100}%` }} /></div>
      {next ? (
        <div className="rounded-xl border border-primary bg-[#f5f8fd] ring-2 ring-primary/10 p-4 flex flex-col sm:flex-row sm:items-center gap-3">
          <div className="min-w-0 flex-1">
            <p className="text-[11px] font-bold uppercase tracking-wide text-primary">{t("steps.next")}</p>
            <p className="font-semibold text-slate-900">{next.title}</p>
            <p className="text-sm text-slate-700 break-words">{next.detail}</p>
          </div>
          <div className="flex flex-wrap gap-2">
            {next.actions.map((a) => (
              <button key={a.label} type="button" disabled={busy || act.busy} onClick={a.run} className={`inline-flex items-center gap-1 h-11 px-4 rounded-xl text-sm font-semibold disabled:opacity-60 ${a.primary ? "bg-primary text-white hover:opacity-90" : "border border-slate-300 bg-white text-slate-700 hover:border-primary hover:text-primary"}`}>
                {a.label} {a.primary && <ChevronRight className="w-4 h-4" aria-hidden />}
              </button>
            ))}
          </div>
        </div>
      ) : (
        <p className="rounded-xl bg-slate-50 border border-slate-200 p-4 text-sm text-slate-700">{done ? t("flow.allDone") : t("flow.nothingNow")}</p>
      )}
      {act.dialogs}
    </div>
  );
}
