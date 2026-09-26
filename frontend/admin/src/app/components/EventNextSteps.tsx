/**
 * "Next steps" checklist on the event page: the order an event is run in, what's done, and one
 * button to the screen for the next step. Computed from the event's real fight cards and bouts.
 */
import { useNavigate } from "react-router";
import { CheckCircle2, ChevronRight, Circle, ListChecks } from "lucide-react";

interface Bout { id: string; winner?: string; winnerMethod?: string | null }
interface FightCard { id: string; name: string; status?: string; matches: Bout[] }

const WEIGHED_IN = new Set(["Weight-In", "Weigh-in", "Scheduled", "Ready", "Live", "Complete", "Completed"]);
const PUBLISHED = new Set(["Published", "Ongoing", "In Progress", "Live", "Completed"]);

interface Step {
  key: string;
  title: string;
  detail: string;
  done: boolean;
  /** Not relevant yet (e.g. results before fight night). */
  later?: boolean;
  action?: { label: string; run: () => void };
}

export function EventNextSteps({ event, cards, canEdit, onEditDetails, onAddFightCard, onPublish }: {
  event: { name?: string; date?: string; location?: string; kkfStatus?: string };
  cards: FightCard[];
  canEdit: boolean;
  onEditDetails: () => void;
  onAddFightCard: () => void;
  onPublish: () => void;
}) {
  const navigate = useNavigate();
  if (event.kkfStatus === "Cancelled") return null;

  const bouts = cards.flatMap((c) => c.matches.map((m) => ({ ...m, cardId: c.id })));
  const withResult = bouts.filter((b) => b.winner || b.winnerMethod);
  const today = new Date(new Date().toISOString().slice(0, 10)).getTime();
  const eventDay = event.date ? new Date(event.date).getTime() : NaN;
  const fightNightPassed = !isNaN(eventDay) && eventDay <= today;
  const cardNeedingBouts = [...cards].sort((a, b) => a.matches.length - b.matches.length)[0];
  const cardNotWeighed = cards.find((c) => c.matches.length > 0 && !WEIGHED_IN.has(c.status ?? ""));
  const missingResult = bouts.find((b) => !(b.winner || b.winnerMethod));

  const steps: Step[] = [
    {
      key: "details",
      title: "Event details",
      detail: event.name && event.date && event.location ? "Name, date and venue are set." : "Add the name, date and venue.",
      done: Boolean(event.name && event.date && event.location),
      action: canEdit ? { label: "Edit details", run: onEditDetails } : undefined,
    },
    {
      key: "publish",
      title: "Publish",
      detail: PUBLISHED.has(event.kkfStatus ?? "") ? "Fans can see this event." : "It's a draft — fans can't see it yet.",
      done: PUBLISHED.has(event.kkfStatus ?? ""),
      action: canEdit ? { label: "Publish event", run: onPublish } : undefined,
    },
    {
      key: "card",
      title: "Fight card",
      detail: cards.length ? `${cards.length} fight card${cards.length === 1 ? "" : "s"}.` : "Create the fight card (one per fight night or week).",
      done: cards.length > 0,
      action: canEdit ? { label: "Add fight card", run: onAddFightCard } : undefined,
    },
    {
      key: "bouts",
      title: "Bouts",
      detail: bouts.length ? `${bouts.length} bout${bouts.length === 1 ? "" : "s"} scheduled.` : "Add the bouts: which fighters meet, weight and rounds.",
      done: bouts.length > 0,
      action: canEdit && cardNeedingBouts ? { label: "Add bouts", run: () => navigate(`/home/matches/${cardNeedingBouts.id}/create-match`) } : undefined,
    },
    {
      key: "weighin",
      title: "Weigh-in",
      detail: !bouts.length ? "After bouts are added." : cardNotWeighed ? `${cardNotWeighed.name}: weigh-in not done yet.` : "Weigh-in done for every fight card.",
      done: bouts.length > 0 && !cardNotWeighed,
      later: !bouts.length,
      action: cardNotWeighed ? { label: "Open fight card", run: () => navigate(`/home/matches/${cardNotWeighed.id}`) } : undefined,
    },
    {
      key: "results",
      title: "Results",
      detail: !bouts.length
        ? "After fight night."
        : !fightNightPassed
          ? `Record results after fight night (${bouts.length} bout${bouts.length === 1 ? "" : "s"}).`
          : `${withResult.length} of ${bouts.length} results recorded.`,
      done: bouts.length > 0 && withResult.length === bouts.length,
      later: !bouts.length || !fightNightPassed,
      action: missingResult && fightNightPassed ? { label: "Record result", run: () => navigate(`/home/match/${missingResult.id}`) } : undefined,
    },
  ];

  const doneCount = steps.filter((s) => s.done).length;
  const next = steps.find((s) => !s.done && !s.later);

  return (
    <section aria-labelledby="next-steps-title" className="rounded-2xl border border-slate-200 bg-white p-5 md:p-6 mb-8">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <h2 id="next-steps-title" className="text-lg font-bold text-slate-900 flex items-center gap-2">
          <ListChecks className="w-5 h-5 text-primary" aria-hidden /> Next steps
        </h2>
        <span className="text-sm font-medium text-slate-500">{doneCount} of {steps.length} done</span>
      </div>
      <div className="h-1.5 rounded-full bg-slate-100 overflow-hidden mb-5">
        <div className="h-full bg-emerald-500 transition-all" style={{ width: `${(doneCount / steps.length) * 100}%` }} />
      </div>
      <ol className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {steps.map((s, i) => {
          const isNext = next?.key === s.key;
          return (
            <li key={s.key} className={`rounded-xl border p-4 flex flex-col gap-2 ${isNext ? "border-primary bg-[#f5f8fd] ring-2 ring-primary/10" : s.done ? "border-emerald-200 bg-emerald-50/40" : "border-slate-200"}`}>
              <div className="flex items-center gap-2">
                {s.done ? <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" aria-hidden /> : <Circle className={`w-5 h-5 shrink-0 ${isNext ? "text-primary" : "text-slate-300"}`} aria-hidden />}
                <span className="text-xs font-semibold text-slate-400">{i + 1}</span>
                <span className="font-semibold text-slate-900">{s.title}</span>
                {isNext && <span className="ml-auto text-[11px] font-bold uppercase tracking-wide text-primary">Next</span>}
              </div>
              <p className={`text-sm ${s.later ? "text-slate-400" : "text-slate-600"}`}>{s.detail}</p>
              {!s.done && !s.later && s.action && (
                <button type="button" onClick={s.action.run} className={`mt-auto self-start inline-flex items-center gap-1 h-9 px-3 rounded-lg text-sm font-semibold ${isNext ? "bg-primary hover:bg-[#083073] text-white" : "border border-slate-200 text-slate-700 hover:border-primary hover:text-primary"}`}>
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
