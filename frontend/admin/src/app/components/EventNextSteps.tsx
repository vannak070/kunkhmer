/**
 * "Next steps" checklist on the event page: the order an event is run in, what's done, and one
 * button to the screen for the next step. Computed from the event's real fight cards and bouts.
 */
import { useState } from "react";
import { useNavigate } from "react-router";
import { toast } from "sonner";
import { CheckCircle2, ChevronRight, Circle, ListChecks, MessageSquareWarning } from "lucide-react";
import { api } from "../utils/api";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "./ui/dialog";

interface Bout { id: string; winner?: string; winnerMethod?: string | null }
interface FightCard { id: string; name: string; status?: string; matches: Bout[] }

const WEIGHED_IN = new Set(["Weight-In", "Weigh-in", "Scheduled", "Ready", "Live", "Complete", "Completed"]);
const PUBLISHED = new Set(["Published", "Ongoing", "In Progress", "Live", "Completed"]);
const PENDING = "Pending KKF Approval";

interface Step {
  key: string;
  title: string;
  detail: string;
  done: boolean;
  /** Not relevant yet (e.g. results before fight night). */
  later?: boolean;
  action?: { label: string; run: () => void };
  secondary?: { label: string; run: () => void };
}

export function EventNextSteps({ event, cards, canEdit, onEditDetails, onAddFightCard, onChanged }: {
  event: { id: string; name?: string; date?: string; location?: string; kkfStatus?: string; kkf_comment?: string | null; organizer_id?: string };
  cards: FightCard[];
  canEdit: boolean;
  onEditDetails: () => void;
  onAddFightCard: () => void;
  /** Reload the event after an approval action. */
  onChanged: () => void;
}) {
  const navigate = useNavigate();
  const me = api.auth.getCurrentUser();
  const isStaff = me?.role === "Super Admin" || me?.role === "KKF Officer";
  const [busy, setBusy] = useState(false);
  const [sendBackOpen, setSendBackOpen] = useState(false);
  const [comment, setComment] = useState("");
  if (event.kkfStatus === "Cancelled") return null;

  const run = (label: string, call: () => Promise<unknown>, done: string) => async () => {
    setBusy(true);
    try {
      await call();
      toast.success(done);
      onChanged();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : `Could not ${label.toLowerCase()}.`);
    } finally {
      setBusy(false);
    }
  };
  const submit = run("Submit", () => api.events.submit(event.id), "Sent to KKF for approval");
  const approve = run("Approve", () => api.events.approve(event.id), "Event approved — it can now be published");
  const publish = run("Publish", () => api.events.update(event.id, { status: "Published" }), "Event published — fans can now see it");
  const sendBack = async () => {
    if (!comment.trim()) return;
    await run("Send back", () => api.events.reject(event.id, comment.trim()), "Sent back to the organizer")();
    setSendBackOpen(false);
    setComment("");
  };

  const status = event.kkfStatus ?? "Draft";
  const approval: Step = (() => {
    if (PUBLISHED.has(status)) return { key: "publish", title: "Approve & publish", detail: "Approved and visible to fans.", done: true };
    if (status === "Approved") {
      return { key: "publish", title: "Approve & publish", detail: "Approved by KKF — publish it when you're ready.", done: false, action: canEdit ? { label: "Publish event", run: publish } : undefined };
    }
    if (status === PENDING) {
      return isStaff
        ? { key: "publish", title: "Approve & publish", detail: "Waiting for your approval.", done: false, action: { label: "Approve", run: approve }, secondary: { label: "Send back", run: () => setSendBackOpen(true) } }
        : { key: "publish", title: "Approve & publish", detail: "Sent to KKF — waiting for approval.", done: false };
    }
    // Draft
    return isStaff
      ? { key: "publish", title: "Approve & publish", detail: "Draft — fans can't see it yet. KKF staff can publish directly.", done: false, action: canEdit ? { label: "Publish event", run: publish } : undefined }
      : { key: "publish", title: "Approve & publish", detail: event.kkf_comment ? "KKF asked for changes (see above), then submit again." : "Draft — submit it to KKF for approval.", done: false, action: canEdit ? { label: "Submit for approval", run: submit } : undefined };
  })();

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
    approval,
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
      {status === "Draft" && event.kkf_comment && (
        <div className="mb-4 flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4">
          <MessageSquareWarning className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" aria-hidden />
          <div>
            <p className="text-sm font-semibold text-amber-900">KKF sent this event back</p>
            <p className="text-sm text-amber-800">{event.kkf_comment}</p>
          </div>
        </div>
      )}
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
              {!s.done && !s.later && (s.action || s.secondary) && (
                <div className="mt-auto flex flex-wrap gap-2">
                  {s.action && (
                    <button type="button" disabled={busy} onClick={s.action.run} className={`inline-flex items-center gap-1 h-9 px-3 rounded-lg text-sm font-semibold disabled:opacity-60 ${isNext ? "bg-primary hover:bg-[#083073] text-white" : "border border-slate-200 text-slate-700 hover:border-primary hover:text-primary"}`}>
                      {s.action.label} <ChevronRight className="w-4 h-4" aria-hidden />
                    </button>
                  )}
                  {s.secondary && (
                    <button type="button" disabled={busy} onClick={s.secondary.run} className="inline-flex items-center h-9 px-3 rounded-lg border border-slate-200 text-sm font-semibold text-slate-700 hover:border-red-300 hover:text-red-700">
                      {s.secondary.label}
                    </button>
                  )}
                </div>
              )}
            </li>
          );
        })}
      </ol>

      <Dialog open={sendBackOpen} onOpenChange={setSendBackOpen}>
        <DialogContent className="sm:max-w-md rounded-2xl">
          <DialogHeader>
            <DialogTitle>Send this event back?</DialogTitle>
            <DialogDescription>The organizer sees your comment on the event page, makes the changes and submits again.</DialogDescription>
          </DialogHeader>
          <label htmlFor="event-sendback" className="block text-sm font-medium text-slate-700">What needs to change?</label>
          <textarea
            id="event-sendback"
            rows={3}
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="e.g. Add the venue address and the broadcaster."
            className="w-full rounded-xl border border-slate-300 focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none p-3 text-sm"
          />
          <DialogFooter className="gap-2 sm:gap-2">
            <button type="button" onClick={() => setSendBackOpen(false)} className="h-11 px-5 rounded-xl border border-slate-300 text-sm font-medium text-slate-700 hover:bg-slate-50">Cancel</button>
            <button type="button" disabled={busy || !comment.trim()} onClick={sendBack} className="h-11 px-5 rounded-xl bg-red-600 hover:bg-red-700 disabled:opacity-60 text-white text-sm font-semibold">Send back</button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </section>
  );
}
