/**
 * After the match (claude/updates/match-signoff-settlement.md): the disputes list with "Resolve", the settlement
 * checklist (broadcaster and sponsors, no amounts), and the dialogs for sign-off, reopening and the Super Admin's
 * result correction. Used on the match page and the bout page.
 */
import { useState } from "react";
import { toast } from "sonner";
import { CheckCircle2, Gavel, Handshake } from "lucide-react";
import { api } from "../../utils/api";
import { type TextKey, formatDay, useT } from "../../i18n/program";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "../ui/dialog";
import { ConfirmDialog } from "./shared";
import { fieldCls } from "./FightNightFields";

const btn = "h-11 px-5 rounded-xl text-sm font-semibold disabled:opacity-60";
const cancelBtn = `${btn} border border-slate-300 text-slate-700 hover:bg-slate-50 font-medium`;
const OUTCOMES = ["upheld", "dismissed", "corrected"] as const;

export function SignOffDialog({ event, onClose, onDone }: { event: any; onClose: () => void; onDone: () => void }) {
  const { t } = useT();
  const [busy, setBusy] = useState(false);
  return (
    <ConfirmDialog
      open
      title={t("so.signoffTitle")}
      text={t("so.signoffText")}
      confirmLabel={t("so.signoffBtn")}
      busy={busy}
      onClose={onClose}
      onConfirm={async () => {
        setBusy(true);
        try {
          await api.events.signOff(event.id);
          toast.success(t("so.signedOff"));
          onDone();
        } catch (e) {
          toast.error(e instanceof Error ? e.message : t("common.error"));
          setBusy(false);
        }
      }}
    />
  );
}

/** A reason (≥ 3 letters) then `run`: reopening a signed-off match, or the first step of a result correction. */
export function ReasonPrompt({ title, text, confirm, label, onClose, run }: { title: string; text: string; confirm: string; label: string; onClose: () => void; run: (reason: string) => Promise<void> | void }) {
  const { t } = useT();
  const [reason, setReason] = useState("");
  const [busy, setBusy] = useState(false);
  const go = async () => {
    setBusy(true);
    try {
      await run(reason.trim());
    } catch (e) {
      toast.error(e instanceof Error ? e.message : t("common.error"));
      setBusy(false);
    }
  };
  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="sm:max-w-md rounded-2xl">
        <DialogHeader><DialogTitle>{title}</DialogTitle><DialogDescription>{text}</DialogDescription></DialogHeader>
        <label className="block"><span className="text-sm font-semibold text-slate-800">{label}</span><textarea rows={3} value={reason} onChange={(e) => setReason(e.target.value)} className={`${fieldCls} mt-1`} /></label>
        <DialogFooter className="gap-2 sm:gap-2">
          <button type="button" onClick={onClose} className={cancelBtn}>{t("common.cancel")}</button>
          <button type="button" disabled={busy || reason.trim().length < 3} onClick={go} className={`${btn} bg-primary text-white hover:opacity-90`}>{busy ? t("common.saving") : confirm}</button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export function ReopenDialog({ event, onClose, onDone }: { event: any; onClose: () => void; onDone: () => void }) {
  const { t } = useT();
  return <ReasonPrompt title={t("so.reopenTitle")} text={t("so.reopenText")} confirm={t("so.reopenBtn")} label={t("so.reason")} onClose={onClose} run={async (reason) => { await api.events.reopen(event.id, reason); toast.success(t("so.reopened")); onDone(); }} />;
}

/** Record a dispute on a bout (the bout is chosen when opened from the match page). */
export function DisputeDialog({ bouts, matchId, onClose, onDone }: { bouts: any[]; matchId?: string; onClose: () => void; onDone: () => void }) {
  const { t } = useT();
  const [bout, setBout] = useState(matchId ?? bouts[0]?.id ?? "");
  const [who, setWho] = useState("");
  const [what, setWhat] = useState("");
  const [busy, setBusy] = useState(false);
  const save = async () => {
    setBusy(true);
    try {
      await api.matches.raiseDispute(bout, { raisedBy: who.trim(), reason: what.trim() });
      toast.success(t("so.disputeSaved"));
      onDone();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : t("common.error"));
      setBusy(false);
    }
  };
  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="sm:max-w-md rounded-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader><DialogTitle>{t("so.disputeTitle")}</DialogTitle></DialogHeader>
        {!matchId && (
          <label className="block"><span className="text-sm font-semibold text-slate-800">{t("so.disputeBout")}</span>
            <select value={bout} onChange={(e) => setBout(e.target.value)} className={`${fieldCls} mt-1`}>{bouts.map((b) => <option key={b.id} value={b.id}>{b.fighter_a_name} {t("common.vs")} {b.fighter_b_name}</option>)}</select>
          </label>
        )}
        <label className="block"><span className="text-sm font-semibold text-slate-800">{t("so.raisedBy")}</span><input value={who} onChange={(e) => setWho(e.target.value)} placeholder={t("so.raisedByHint")} className={`${fieldCls} mt-1`} /></label>
        <label className="block"><span className="text-sm font-semibold text-slate-800">{t("so.what")}</span><textarea rows={3} value={what} onChange={(e) => setWhat(e.target.value)} className={`${fieldCls} mt-1`} /></label>
        <DialogFooter className="gap-2 sm:gap-2">
          <button type="button" onClick={onClose} className={cancelBtn}>{t("common.cancel")}</button>
          <button type="button" disabled={busy || !bout || !who.trim() || !what.trim()} onClick={save} className={`${btn} bg-primary text-white hover:opacity-90`}>{busy ? t("common.saving") : t("common.save")}</button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function ResolveDialog({ dispute, onClose, onDone }: { dispute: any; onClose: () => void; onDone: () => void }) {
  const { t } = useT();
  const [outcome, setOutcome] = useState("");
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState(false);
  const save = async () => {
    setBusy(true);
    try {
      await api.matches.resolveDispute(dispute.id, { outcome, note: note.trim() || null });
      toast.success(t("so.resolved"));
      onDone();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : t("common.error"));
      setBusy(false);
    }
  };
  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="sm:max-w-md rounded-2xl">
        <DialogHeader><DialogTitle>{t("so.resolveTitle")}</DialogTitle><DialogDescription>{dispute.bout} — {dispute.reason}</DialogDescription></DialogHeader>
        <fieldset>
          <legend className="text-sm font-semibold text-slate-800">{t("so.outcome")}</legend>
          <div className="mt-2 grid gap-2">
            {OUTCOMES.map((o) => (
              <button key={o} type="button" aria-pressed={outcome === o} onClick={() => setOutcome(o)} className={`min-h-12 px-4 rounded-xl border-2 text-left text-sm font-semibold ${outcome === o ? "border-primary bg-[#eef3fb] text-primary" : "border-slate-200 bg-white text-slate-800"}`}>{t(`so.status.${o}` as TextKey)}</button>
            ))}
          </div>
        </fieldset>
        <label className="block"><span className="text-sm font-semibold text-slate-800">{t("so.resolveNote")}</span><textarea rows={2} value={note} onChange={(e) => setNote(e.target.value)} className={`${fieldCls} mt-1`} /></label>
        <DialogFooter className="gap-2 sm:gap-2">
          <button type="button" onClick={onClose} className={cancelBtn}>{t("common.cancel")}</button>
          <button type="button" disabled={busy || !outcome} onClick={save} className={`${btn} bg-primary text-white hover:opacity-90`}>{busy ? t("common.saving") : t("so.b.resolve")}</button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

/** The match's disputes: open ones first with "Resolve", resolved ones with their outcome. */
export function DisputesPanel({ disputes, onRecord, onChanged }: { disputes: any[]; onRecord: () => void; onChanged: () => void }) {
  const { t, lang } = useT();
  const [resolving, setResolving] = useState<any | null>(null);
  const sorted = [...disputes].sort((a, b) => Number(b.status === "open") - Number(a.status === "open"));
  return (
    <section id="disputes" aria-labelledby="disputes-title" className="rounded-2xl border border-slate-200 bg-white p-5 md:p-6 space-y-4 scroll-mt-24">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 id="disputes-title" className="text-lg font-bold text-slate-900 flex items-center gap-2"><Gavel className="w-5 h-5 text-primary" aria-hidden /> {t("so.disputes")} <span className="text-slate-400 font-semibold">{disputes.length}</span></h2>
        <button type="button" onClick={onRecord} className={`${btn} border border-slate-300 bg-white text-slate-800 hover:border-primary hover:text-primary`}>{t("so.b.record")}</button>
      </div>
      {disputes.length === 0 ? (
        <p className="text-sm text-slate-600">{t("so.noDisputes")}</p>
      ) : (
        <ul className="divide-y divide-slate-100">
          {sorted.map((d) => (
            <li key={d.id} className="py-3 flex flex-col sm:flex-row sm:items-start justify-between gap-3">
              <div className="min-w-0 space-y-0.5">
                <p className="font-semibold text-slate-900 break-words">{d.bout}</p>
                <p className="text-sm text-slate-700 break-words">{d.reason}</p>
                <p className="text-xs text-slate-500">{t("so.by", { who: d.raised_by })} · {formatDay(String(d.created_at).slice(0, 10), lang, false)}</p>
                {d.resolution_note && <p className="text-sm text-slate-600">“{d.resolution_note}”</p>}
              </div>
              {d.status === "open" ? (
                <button type="button" onClick={() => setResolving(d)} className={`${btn} shrink-0 bg-primary text-white hover:opacity-90`}>{t("so.b.resolve")}</button>
              ) : (
                <span className="shrink-0 inline-flex items-center gap-1 rounded-full bg-emerald-50 text-emerald-700 px-3 py-1 text-sm font-semibold"><CheckCircle2 className="w-4 h-4" aria-hidden /> {t(`so.status.${d.status}` as TextKey)}</span>
              )}
            </li>
          ))}
        </ul>
      )}
      {resolving && <ResolveDialog dispute={resolving} onClose={() => setResolving(null)} onDone={() => { setResolving(null); onChanged(); }} />}
    </section>
  );
}

/** The settlement checklist: the broadcaster and each sponsor, ticked once settled offline. */
export function SettlementPanel({ eventId, parties, enabled, onChanged }: { eventId: string; parties: any[]; enabled: boolean; onChanged: () => void }) {
  const { t, lang } = useT();
  const [asking, setAsking] = useState<any | null>(null);
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState(false);
  const set = async (p: any, settled: boolean, noteText: string | null) => {
    setBusy(true);
    try {
      await api.events.settle(eventId, { kind: p.kind, partyId: p.party_id, settled, note: noteText });
      toast.success(t("so.settleSaved"));
      setAsking(null);
      setNote("");
      onChanged();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : t("common.error"));
    } finally {
      setBusy(false);
    }
  };
  return (
    <section id="settlement" aria-labelledby="settlement-title" className="rounded-2xl border border-slate-200 bg-white p-5 md:p-6 space-y-4 scroll-mt-24">
      <div>
        <h2 id="settlement-title" className="text-lg font-bold text-slate-900 flex items-center gap-2"><Handshake className="w-5 h-5 text-primary" aria-hidden /> {t("so.settlement")}</h2>
        <p className="text-sm text-slate-600 mt-1">{t("so.settlementHint")}</p>
      </div>
      {parties.length === 0 ? (
        <p className="text-sm text-slate-600">{t("so.noParties")}</p>
      ) : (
        <ul className="divide-y divide-slate-100">
          {parties.map((p) => (
            <li key={`${p.kind}-${p.party_id}`} className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="min-w-0">
                <p className="text-xs font-semibold text-slate-500">{t(p.kind === "broadcaster" ? "so.broadcaster" : "so.sponsor")}</p>
                <p className="font-semibold text-slate-900 break-words">{p.name}</p>
                {p.settled && <p className="text-sm text-emerald-700">{t("so.settledBy", { who: p.settled_by_name ?? "—", date: formatDay(String(p.settled_at).slice(0, 10), lang, false) })}{p.note ? ` · “${p.note}”` : ""}</p>}
              </div>
              {enabled && (p.settled
                ? <button type="button" disabled={busy} onClick={() => set(p, false, null)} className={`${btn} shrink-0 border border-slate-300 bg-white text-slate-700 hover:border-red-300 hover:text-red-700`}>{t("so.undo")}</button>
                : <button type="button" disabled={busy} onClick={() => setAsking(p)} className={`${btn} shrink-0 bg-primary text-white hover:opacity-90`}>{t("so.settle")}</button>)}
            </li>
          ))}
        </ul>
      )}
      {asking && (
        <Dialog open onOpenChange={(o) => !o && setAsking(null)}>
          <DialogContent className="sm:max-w-md rounded-2xl">
            <DialogHeader><DialogTitle>{t("so.settleTitle", { name: asking.name })}</DialogTitle></DialogHeader>
            <label className="block"><span className="text-sm font-semibold text-slate-800">{t("so.resolveNote")}</span><textarea rows={2} value={note} onChange={(e) => setNote(e.target.value)} className={`${fieldCls} mt-1`} /></label>
            <DialogFooter className="gap-2 sm:gap-2">
              <button type="button" onClick={() => setAsking(null)} className={cancelBtn}>{t("common.cancel")}</button>
              <button type="button" disabled={busy} onClick={() => set(asking, true, note.trim() || null)} className={`${btn} bg-primary text-white hover:opacity-90`}>{t("so.settle")}</button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </section>
  );
}
