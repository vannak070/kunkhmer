/**
 * Withdrawals, replacements, postponement and cancellation (claude/updates/withdrawals-postponement.md): the dialogs
 * and panels used by the bout page, Match day and the match page. A withdrawn fighter's bout stays as
 * "Replacement needed" until KKF (or the Organizer before match day) records a replacement — who must pass the same
 * KKF rules as a new bout, checked live — or cancels the bout. Reasons come from a short list plus a note.
 */
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { AlertTriangle, ChevronDown, ShieldAlert } from "lucide-react";
import { api } from "../../utils/api";
import { type TextKey, formatDay, useT } from "../../i18n/program";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "../ui/dialog";
import { fieldCls } from "./FightNightFields";
import { type RuleHit, ruleSentence } from "./ruleSentence";
import { FighterPicker } from "../../pages/AddBout";

export const WITHDRAW_REASONS = ["injured", "overweight", "not_cleared", "personal", "no_show", "other"] as const;
export const MATCH_REASONS = ["weather", "venue", "broadcaster", "safety", "other"] as const;

/** Whether this account may change the match now: KKF staff always; an Organizer only before match day. */
export function canChangeMatch(eventDate: string | null | undefined) {
  const me = api.auth.getCurrentUser();
  if (me?.role === "Super Admin" || me?.role === "KKF Officer") return true;
  if (me?.role !== "Organizer" || !eventDate) return false;
  return new Date(String(eventDate).slice(0, 10)).getTime() > new Date(new Date().toISOString().slice(0, 10)).getTime();
}

const btn = "h-11 px-5 rounded-xl text-sm font-semibold disabled:opacity-60";
const cancelBtn = `${btn} border border-slate-300 text-slate-700 hover:bg-slate-50 font-medium`;

function Reasons({ list, prefix, value, onChange }: { list: readonly string[]; prefix: "ch.reason" | "ch.mreason"; value: string; onChange: (v: string) => void }) {
  const { t } = useT();
  return (
    <fieldset>
      <legend className="text-sm font-semibold text-slate-800">{t("ch.why")}</legend>
      <div className="mt-2 flex flex-wrap gap-2">
        {list.map((k) => (
          <button key={k} type="button" aria-pressed={value === k} onClick={() => onChange(k)} className={`h-11 px-4 rounded-xl border-2 text-sm font-semibold ${value === k ? "border-primary bg-[#eef3fb] text-primary" : "border-slate-200 bg-white text-slate-700 hover:border-slate-300"}`}>
            {t(`${prefix}.${k}` as TextKey)}
          </button>
        ))}
      </div>
    </fieldset>
  );
}

const nameOf = (lang: string, f: { name?: string; nameKhmer?: string | null; name_khmer?: string | null }) => (lang === "km" && (f.nameKhmer || f.name_khmer) ? (f.nameKhmer || f.name_khmer)! : f.name ?? "");

/** Pick who withdraws and why. */
export function WithdrawDialog({ match, onClose, onDone }: { match: any; onClose: () => void; onDone: (updated: any, side: "a" | "b") => void }) {
  const { t } = useT();
  const [side, setSide] = useState<"a" | "b" | null>(null);
  const [reason, setReason] = useState("");
  const [note, setNote] = useState("");
  const [mark, setMark] = useState(false);
  const [busy, setBusy] = useState(false);
  const medical = reason === "injured" || reason === "not_cleared";
  const who = side ? match[`fighter_${side}_name`] : "";
  const save = async () => {
    if (!side || !reason) return;
    setBusy(true);
    try {
      const updated = await api.matches.withdraw(match.id, { side, reason, note: note.trim() || null, markFighter: mark && medical });
      toast.success(t("ch.withdrawn", { name: who }));
      onDone(updated, side);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : t("common.error"));
      setBusy(false);
    }
  };
  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="sm:max-w-md rounded-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{t("ch.withdrawTitle")}</DialogTitle>
          <DialogDescription>{t("ch.withdrawLead")}</DialogDescription>
        </DialogHeader>
        <fieldset>
          <legend className="text-sm font-semibold text-slate-800">{t("ch.which")}</legend>
          <div className="mt-2 grid gap-2">
            {(["a", "b"] as const).map((s) => (
              <button key={s} type="button" aria-pressed={side === s} onClick={() => setSide(s)} className={`min-h-12 px-4 rounded-xl border-2 text-left text-sm font-semibold ${side === s ? (s === "a" ? "border-red-500 bg-red-50 text-red-800" : "border-blue-500 bg-blue-50 text-blue-800") : "border-slate-200 bg-white text-slate-800"}`}>
                {t(s === "a" ? "common.red" : "common.blue")}: {match[`fighter_${s}_name`]}
              </button>
            ))}
          </div>
        </fieldset>
        <Reasons list={WITHDRAW_REASONS} prefix="ch.reason" value={reason} onChange={setReason} />
        {medical && side && (
          <label className="flex items-start gap-3 rounded-xl bg-slate-50 border border-slate-200 p-3 cursor-pointer">
            <input type="checkbox" className="mt-0.5 w-5 h-5 accent-[var(--color-primary,#0A3D91)]" checked={mark} onChange={(e) => setMark(e.target.checked)} />
            <span className="text-sm text-slate-800">{t(reason === "injured" ? "ch.mark.injured" : "ch.mark.not_cleared", { name: who })}</span>
          </label>
        )}
        <label className="block">
          <span className="text-sm font-semibold text-slate-800">{t("ch.note")}</span>
          <textarea rows={2} value={note} onChange={(e) => setNote(e.target.value)} className={`${fieldCls} mt-1`} />
        </label>
        <DialogFooter className="gap-2 sm:gap-2">
          <button type="button" onClick={onClose} className={cancelBtn}>{t("common.cancel")}</button>
          <button type="button" disabled={busy || !side || !reason} onClick={save} className={`${btn} bg-red-600 hover:bg-red-700 text-white`}>{busy ? t("common.saving") : t("ch.withdrawBtn")}</button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

/** Reason (+ note) then call `run`; used for cancelling a bout and a match. */
function ReasonDialog({ title, text, list, prefix, confirm, danger = true, children, run, onClose }: {
  title: string; text: string; list: readonly string[]; prefix: "ch.reason" | "ch.mreason"; confirm: string; danger?: boolean; children?: (reason: string) => React.ReactNode;
  run: (reason: string, note: string | null, extra?: unknown) => Promise<void>; onClose: () => void;
}) {
  const { t } = useT();
  const [reason, setReason] = useState("");
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState(false);
  const go = async () => {
    setBusy(true);
    try {
      await run(reason, note.trim() || null);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : t("common.error"));
      setBusy(false);
    }
  };
  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="sm:max-w-md rounded-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{text}</DialogDescription>
        </DialogHeader>
        {children?.(reason)}
        <Reasons list={list} prefix={prefix} value={reason} onChange={setReason} />
        <label className="block">
          <span className="text-sm font-semibold text-slate-800">{t("ch.note")}</span>
          <textarea rows={2} value={note} onChange={(e) => setNote(e.target.value)} className={`${fieldCls} mt-1`} />
        </label>
        <DialogFooter className="gap-2 sm:gap-2">
          <button type="button" onClick={onClose} className={cancelBtn}>{t("common.cancel")}</button>
          <button type="button" disabled={busy || !reason} onClick={go} className={`${btn} ${danger ? "bg-red-600 hover:bg-red-700" : "bg-primary hover:opacity-90"} text-white`}>{busy ? t("common.saving") : confirm}</button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export function CancelBoutDialog({ match, onClose, onDone }: { match: any; onClose: () => void; onDone: (updated: any) => void }) {
  const { t } = useT();
  return (
    <ReasonDialog
      title={t("ch.cancelBoutTitle")} text={t("ch.cancelBoutText")} list={WITHDRAW_REASONS} prefix="ch.reason" confirm={t("ch.cancelBoutBtn")} onClose={onClose}
      run={async (reason, note) => { const updated = await api.matches.cancelBout(match.id, { reason, note }); toast.success(t("ch.boutCancelled")); onDone(updated); }}
    />
  );
}

export function CancelMatchDialog({ event, onClose, onDone }: { event: any; onClose: () => void; onDone: () => void }) {
  const { t } = useT();
  return (
    <ReasonDialog
      title={t("ch.cancelMatchTitle")} text={t("ch.cancelMatchText")} list={MATCH_REASONS} prefix="ch.mreason" confirm={t("ch.cancelMatchBtn")} onClose={onClose}
      run={async (reason, note) => { await api.events.cancel(event.id, { reason, note }); toast.success(t("night.cancelled")); onDone(); }}
    />
  );
}

export function PostponeDialog({ event, onClose, onDone }: { event: any; onClose: () => void; onDone: () => void }) {
  const { t, lang } = useT();
  const [date, setDate] = useState("");
  const [error, setError] = useState<string | null>(null);
  return (
    <ReasonDialog
      title={t("ch.postponeTitle")} text={t("ch.postponeLead")} list={MATCH_REASONS} prefix="ch.mreason" confirm={t("ch.postponeBtn")} danger={false} onClose={onClose}
      run={async (reason, note) => {
        if (!date) { setError(t("ff.required")); throw new Error(t("ff.required")); }
        try {
          await api.events.postpone(event.id, { date, reason, note });
        } catch (e) {
          // The server names the bouts and rules that refuse the new date (English).
          setError(e instanceof Error ? e.message : t("common.error"));
          throw e;
        }
        toast.success(t("ch.postponed", { date: formatDay(date, lang, false) }));
        onDone();
      }}
    >
      {() => (
        <div className="space-y-2">
          <label className="block">
            <span className="text-sm font-semibold text-slate-800">{t("ch.newDate")}</span>
            <input type="date" value={date} min={new Date().toISOString().slice(0, 10)} onChange={(e) => { setDate(e.target.value); setError(null); }} className={`${fieldCls} mt-1`} />
          </label>
          {error && <p role="alert" className="flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-800"><ShieldAlert className="w-5 h-5 shrink-0" aria-hidden /> {error}</p>}
        </div>
      )}
    </ReasonDialog>
  );
}

/** "Replacement needed" with a fighter picker and the live KKF rule check; used on the bout page and in Match day. */
export function ReplacementPanel({ match, onDone, onCancelBout, side: sideProp, numbers }: {
  match: any; onDone: (updated: any) => void; onCancelBout?: () => void;
  /** An empty corner to fill ("to be announced", claude/updates/empty-corners-draws.md) instead of a withdrawn fighter's. */
  side?: "a" | "b"; numbers?: Map<string, number>;
}) {
  const { t, lang } = useT();
  const side = (sideProp ?? match.replacement_side) as "a" | "b";
  const filling = !match[`fighter_${side}_id`];
  const from = match[`slot_${side}_from`];
  const fromNo = from ? numbers?.get(from) : undefined;
  const other = side === "a" ? "b" : "a";
  const [fighters, setFighters] = useState<any[]>([]);
  const [pick, setPick] = useState<any | null>(null);
  const [check, setCheck] = useState<{ allowed: boolean; blocked: RuleHit[]; warnings: RuleHit[] } | null | undefined>(undefined);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    api.fighters.list().then((f: any[]) => setFighters((f || []).filter((x) => x.status === "Active" && x.id !== match[`fighter_${other}_id`] && x.id !== match[`fighter_${side}_id`]))).catch(() => {});
  }, [match.id]);

  useEffect(() => {
    setCheck(undefined);
    if (!pick) return;
    let live = true;
    const timer = setTimeout(() => {
      api.matches
        .check({ subEventId: match.sub_event_id, fighterAId: side === "a" ? pick.id : match.fighter_a_id, fighterBId: side === "b" ? pick.id : match.fighter_b_id, agreedWeight: match.agreed_weight, matchId: match.id })
        .then((r) => live && setCheck(r))
        .catch(() => live && setCheck(null));
    }, 300);
    return () => { live = false; clearTimeout(timer); };
  }, [pick?.id, match.id]);

  const sentence = (h: RuleHit) => ruleSentence(t, lang, h, (id, fb) => (id === pick?.id ? nameOf(lang, pick) : fb));
  const blocked = check?.blocked ?? [];
  const save = async () => {
    if (!pick) return;
    setBusy(true);
    try {
      const updated = await api.matches.replace(match.id, { side, fighterId: pick.id });
      toast.success(t(filling ? "corner.filled" : "ch.replaced", { name: nameOf(lang, pick) }));
      onDone(updated);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : t("common.error"));
      setBusy(false);
    }
  };

  return (
    <section className={`rounded-2xl border-2 p-5 space-y-4 ${filling ? "border-slate-200 bg-slate-50" : "border-red-200 bg-red-50/60"}`}>
      {filling ? (
        <div>
          <h2 className="text-lg font-bold text-slate-900">{t("corner.fillTitle")}</h2>
          <p className="text-sm text-slate-700 mt-1">{fromNo ? t("corner.fillWinner", { n: fromNo }) : t("corner.fillText", { corner: t(side === "a" ? "common.red" : "common.blue") })}</p>
        </div>
      ) : (
        <div>
          <h2 className="text-lg font-bold text-red-900 flex items-center gap-2"><AlertTriangle className="w-5 h-5" aria-hidden /> {t("ch.needTitle")}</h2>
          <p className="text-sm text-red-900 mt-1">{t("ch.needText", { name: match[`fighter_${side}_name`], corner: t(side === "a" ? "common.red" : "common.blue") })}</p>
        </div>
      )}
      <FighterPicker corner={side === "a" ? "red" : "blue"} label={t(side === "a" ? "common.red" : "common.blue")} fighters={fighters} value={pick} other={null} onChange={setPick} lang={lang} />
      {pick && check === undefined && <p role="status" className="text-sm text-slate-600">{t("ch.checking")}</p>}
      {blocked.length > 0 && (
        <ul role="alert" className="rounded-xl border border-red-300 bg-white p-3 space-y-1 text-sm text-red-900">
          {blocked.map((h, i) => <li key={`${h.key}-${i}`} className="flex items-start gap-2"><ShieldAlert className="w-4 h-4 mt-0.5 shrink-0" aria-hidden /> {sentence(h)}</li>)}
        </ul>
      )}
      {(check?.warnings ?? []).length > 0 && (
        <ul role="status" className="rounded-xl border border-amber-200 bg-amber-50 p-3 space-y-1 text-sm text-amber-900">
          {check!.warnings.map((h, i) => <li key={`${h.key}-${i}`} className="flex items-start gap-2"><AlertTriangle className="w-4 h-4 mt-0.5 shrink-0" aria-hidden /> {sentence(h)}</li>)}
        </ul>
      )}
      <div className="flex flex-wrap gap-2">
        <button type="button" disabled={!pick || busy || blocked.length > 0 || check === undefined} onClick={save} className={`${btn} bg-primary text-white hover:opacity-90 h-12`}>{busy ? t("common.saving") : t(filling ? "corner.fillBtn" : "ch.recordBtn")}</button>
        {onCancelBout && !filling && <button type="button" onClick={onCancelBout} className={`${btn} h-12 border border-red-300 bg-white text-red-800 hover:bg-red-50`}>{t("ch.cancelInstead")}</button>}
      </div>
    </section>
  );
}

/** The match's history of withdrawals, replacements, postponements and cancellations. */
export function ChangesHistory({ eventId, refreshKey }: { eventId: string; refreshKey?: unknown }) {
  const { t, lang } = useT();
  const [rows, setRows] = useState<any[]>([]);
  const [show, setShow] = useState(false);
  useEffect(() => { api.events.changes(eventId).then(setRows).catch(() => setRows([])); }, [eventId, refreshKey]);
  if (rows.length === 0) return null;
  const day = (d: string | null) => (d ? formatDay(d, lang, false) : "");
  const why = (r: any) => (r.reason ? t(`${r.kind === "postpone" || r.kind === "cancel_event" ? "ch.mreason" : "ch.reason"}.${r.reason}` as TextKey) : "");
  const line = (r: any) =>
    r.kind === "withdraw" ? t("ch.h.withdraw", { name: r.fighter_name ?? "", reason: why(r) })
    : r.kind === "replace" ? t("ch.h.replace", { name: r.fighter_name ?? "", other: r.other_name ?? "" })
    : r.kind === "fill" ? t("ch.h.fill", { name: r.fighter_name ?? "" })
    : r.kind === "cancel_bout" ? t("ch.h.cancelBout", { pair: r.fighter_name ?? "", reason: why(r) })
    : r.kind === "postpone" ? t("ch.h.postpone", { from: day(r.from_date), to: day(r.to_date), reason: why(r) })
    : r.kind === "sign_off" ? t("ch.h.signOff")
    : r.kind === "reopen" ? t("ch.h.reopen", { note: r.note ?? "" })
    : r.kind === "correct_result" ? t("ch.h.correctResult", { note: r.note ?? "" })
    : r.kind === "correct_weigh_in" ? t("ch.h.correctWeighIn", { note: r.note ?? "" })
    : t("ch.h.cancelEvent", { reason: why(r) });
  return (
    <div>
      <button type="button" onClick={() => setShow((s) => !s)} aria-expanded={show} className="inline-flex items-center gap-1.5 text-sm font-semibold text-slate-700 hover:text-primary">
        <ChevronDown className={`w-4 h-4 transition-transform ${show ? "rotate-180" : ""}`} aria-hidden /> {t("ch.history", { n: rows.length })}
      </button>
      {show && (
        <ol className="mt-3 space-y-2 border-l-2 border-slate-100 pl-4">
          {rows.map((r) => (
            <li key={r.id} className="text-sm text-slate-600">
              <span className="font-semibold text-slate-800">{line(r)}</span>
              {" · "}{t("ch.h.by", { who: r.by_name ?? "—", date: day(String(r.created_at).slice(0, 10)) })}
              {r.marked_fighter && <span className="block text-slate-500">{t("ch.h.marked")}</span>}
              {r.note && !["reopen", "correct_result", "correct_weigh_in"].includes(r.kind) && <span className="block text-slate-500">“{r.note}”</span>}
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}
