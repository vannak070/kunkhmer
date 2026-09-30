/**
 * The fight night's step-by-step checklist for KKF officers (approvals off): details → fight card → bouts →
 * officials → publish → weigh-in → results. One highlighted "Next" step with one button to the screen for it.
 * Computed from the real fight cards and bouts. See claude/updates/program-officer-friendly.md.
 */
import { useState } from "react";
import { useNavigate } from "react-router";
import { toast } from "sonner";
import { CheckCircle2, ChevronRight, Circle, ListChecks, MinusCircle } from "lucide-react";
import { api } from "../../utils/api";
import { useT } from "../../i18n/program";
import { dayOf, hasResult, officialsComplete, todayUtc, weighState } from "./shared";

interface Step {
  key: string;
  title: string;
  detail: string;
  done: boolean;
  /** Not relevant yet (e.g. results before fight night). */
  later?: boolean;
  /** Can't be done any more: the fight night is over (officials, weigh-in). Not the next step. */
  skipped?: boolean;
  action?: { label: string; run: () => void };
}

export function FightNightSteps({ event, cards, bouts, canEdit, isStaff, onEditDetails, onAddFightCard, onChanged }: {
  event: any;
  cards: any[];
  bouts: any[];
  canEdit: boolean;
  isStaff: boolean;
  onEditDetails: () => void;
  onAddFightCard: () => void;
  onChanged: () => void;
}) {
  const { t } = useT();
  const navigate = useNavigate();
  const [busy, setBusy] = useState(false);
  if (event.status === "Cancelled") return null;

  const publish = async () => {
    setBusy(true);
    try {
      await api.events.update(event.id, { status: "Published" });
      toast.success(t("steps.published"));
      onChanged();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : t("common.error"));
    } finally {
      setBusy(false);
    }
  };

  const open = bouts.filter((b) => !hasResult(b));
  const cardOf = (b: any) => cards.find((c) => c.id === b.sub_event_id);
  const fewestBouts = [...cards].sort((a, b) => bouts.filter((x) => x.sub_event_id === a.id).length - bouts.filter((x) => x.sub_event_id === b.id).length)[0];
  const noOfficials = open.filter((b) => !officialsComplete(b));
  const notWeighed = open.filter((b) => weighState(b) === "none" || weighState(b) === "half");
  const withResult = bouts.filter(hasResult);
  const nightPassed = dayOf(event.date) <= todayUtc();
  const published = ["Published", "Completed"].includes(event.status);

  const steps: Step[] = [
    {
      key: "details",
      title: t("steps.details"),
      detail: event.name && event.date && event.location ? t("steps.detailsDone") : t("steps.detailsTodo"),
      done: Boolean(event.name && event.date && event.location),
      action: canEdit ? { label: t("night.editDetails"), run: onEditDetails } : undefined,
    },
    {
      key: "card",
      title: t("steps.card"),
      detail: cards.length ? t("steps.cardDone", { n: cards.length }) : t("steps.cardTodo"),
      done: cards.length > 0,
      action: canEdit ? { label: t("steps.addCard"), run: onAddFightCard } : undefined,
    },
    {
      key: "bouts",
      title: t("steps.bouts"),
      detail: bouts.length ? t("steps.boutsDone", { n: bouts.length }) : t("steps.boutsTodo"),
      done: bouts.length > 0,
      later: !cards.length,
      action: canEdit && fewestBouts ? { label: t("steps.addBouts"), run: () => navigate(`/home/matches/${fewestBouts.id}/create-match`) } : undefined,
    },
    {
      key: "officials",
      title: t("steps.officials"),
      detail: !bouts.length ? t("steps.after") : noOfficials.length ? t("steps.officialsTodo", { done: open.length - noOfficials.length, total: open.length }) : t("steps.officialsDone"),
      done: bouts.length > 0 && noOfficials.length === 0,
      later: !bouts.length,
      skipped: nightPassed && bouts.length > 0 && noOfficials.length > 0,
      action: isStaff && noOfficials[0] ? { label: t("card.officials"), run: () => navigate(`/home/matches/${cardOf(noOfficials[0])?.id}/assign-officials`) } : undefined,
    },
    {
      key: "publish",
      title: t("steps.publish"),
      detail: published ? t("steps.publishDone") : t("steps.publishTodo"),
      done: published,
      action: canEdit ? { label: t("steps.publishAction"), run: publish } : undefined,
    },
    {
      key: "weighin",
      title: t("steps.weighin"),
      detail: !bouts.length ? t("steps.after") : notWeighed.length ? t("steps.weighinTodo", { done: open.length - notWeighed.length, total: open.length }) : t("steps.weighinDone"),
      done: bouts.length > 0 && notWeighed.length === 0,
      later: !bouts.length,
      skipped: nightPassed && bouts.length > 0 && notWeighed.length > 0,
      action: isStaff && notWeighed[0] ? { label: t("card.weighin"), run: () => navigate(`/home/fight-cards/${cardOf(notWeighed[0])?.id}/weigh-in`) } : undefined,
    },
    {
      key: "results",
      title: t("steps.results"),
      detail: !bouts.length
        ? t("steps.after")
        : !nightPassed
          ? t("steps.resultsLater", { n: bouts.length })
          : withResult.length === bouts.length
            ? t("steps.resultsDone")
            : t("steps.resultsTodo", { done: withResult.length, total: bouts.length }),
      done: bouts.length > 0 && withResult.length === bouts.length,
      later: !bouts.length || !nightPassed,
      action: isStaff && open[0] ? { label: t("card.results"), run: () => navigate(`/home/fight-cards/${cardOf(open[0])?.id}/results`) } : undefined,
    },
  ];

  const doneCount = steps.filter((s) => s.done || s.skipped).length;
  const next = steps.find((s) => !s.done && !s.later && !s.skipped);

  return (
    <section aria-labelledby="next-steps-title" className="rounded-2xl border border-slate-200 bg-white p-5 md:p-6">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <h2 id="next-steps-title" className="text-lg font-bold text-slate-900 flex items-center gap-2">
          <ListChecks className="w-5 h-5 text-primary" aria-hidden /> {t("steps.title")}
        </h2>
        <span className="text-sm font-medium text-slate-500">{t("steps.done", { done: doneCount, total: steps.length })}</span>
      </div>
      <div className="h-2 rounded-full bg-slate-100 overflow-hidden mb-5">
        <div className="h-full bg-emerald-500 transition-all" style={{ width: `${(doneCount / steps.length) * 100}%` }} />
      </div>
      <ol className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {steps.map((s, i) => {
          const isNext = next?.key === s.key;
          return (
            <li key={s.key} className={`rounded-xl border p-4 flex flex-col gap-2 ${isNext ? "border-primary bg-[#f5f8fd] ring-2 ring-primary/10" : s.done ? "border-emerald-200 bg-emerald-50/40" : "border-slate-200"}`}>
              <div className="flex items-center gap-2">
                {s.done ? <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" aria-hidden /> : s.skipped ? <MinusCircle className="w-5 h-5 text-slate-300 shrink-0" aria-hidden /> : <Circle className={`w-5 h-5 shrink-0 ${isNext ? "text-primary" : "text-slate-300"}`} aria-hidden />}
                <span className="text-xs font-semibold text-slate-400">{i + 1}</span>
                <span className="font-semibold text-slate-900">{s.title}</span>
                {isNext && <span className="ml-auto text-[11px] font-bold uppercase tracking-wide text-primary">{t("steps.next")}</span>}
              </div>
              <p className={`text-sm ${s.later || s.skipped ? "text-slate-400" : "text-slate-600"}`}>{s.skipped ? t("steps.skipped") : s.detail}</p>
              {!s.done && !s.later && !s.skipped && s.action && (
                <button
                  type="button"
                  disabled={busy}
                  onClick={s.action.run}
                  className={`mt-auto self-start inline-flex items-center gap-1 h-10 px-3.5 rounded-lg text-sm font-semibold disabled:opacity-60 ${isNext ? "bg-primary hover:opacity-90 text-white" : "border border-slate-200 text-slate-700 hover:border-primary hover:text-primary"}`}
                >
                  {s.action.label} <ChevronRight className="w-4 h-4" aria-hidden />
                </button>
              )}
            </li>
          );
        })}
      </ol>
    </section>
  );
}
