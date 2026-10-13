/**
 * What was agreed offline with the broadcaster, and KKF's confirmation (Program workflow phase 4,
 * claude/updates/offline-agreements-log.md; titles: claude/updates/fight-night-titles.md). The guided fight night
 * (NightFlow.tsx, claude/updates/program-guided-fight-night.md) shows each item as a step; this file holds the
 * data types, the actions (one hook) and their dialogs, and the history.
 * KKF staff confirm in one click (record + confirm); an Organizer sends the item to KKF with an optional note.
 * The licence is no longer asked for (2026-10-13); its API stays dormant.
 */
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { ChevronDown } from "lucide-react";
import { api } from "../../utils/api";
import { formatDay, useT } from "../../i18n/program";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "../ui/dialog";
import { fieldCls } from "./FightNightFields";

export type AgreementItem = "details" | "sponsors" | "titles";
export type AgreementState = "none" | "waiting" | "returned" | "confirmed" | "changed";

export interface Agreement {
  id: string;
  item: AgreementItem;
  status: "waiting" | "confirmed" | "returned";
  note: string | null;
  matches_current: boolean | null;
  recorded_by_name: string | null;
  recorded_at: string;
  confirmed_by_name: string | null;
  confirmed_at: string | null;
  kkf_comment: string | null;
}

export interface NightTitle { id: string; title_name: string; weight_class: number; status: string; current_holder_name: string | null }

export interface Agreements {
  licence: { number: string | null; date: string | null; hasDocument: boolean };
  /** Belts on the line at this fight night. */
  titles: NightTitle[];
  items: Record<AgreementItem, { state: AgreementState; agreement: Agreement | null }>;
  log: Agreement[];
}

/** Ready to publish as far as agreements go: details confirmed, and titles confirmed when there are any. */
export const agreementsReady = (a: Agreements) =>
  a.items.details.state === "confirmed" && (a.titles.length === 0 || a.items.titles.state === "confirmed");

/** Statuses after which only KKF changes a fight night (the API says the same). */
export const LOCKED_FOR_ORGANIZER = ["Published", "Completed", "Cancelled"];

/** The actions on the agreements, with their dialogs (render `dialogs` once on the page). */
export function useAgreementActions({ event, data, isStaff, onChanged }: { event: any; data: Agreements; isStaff: boolean; onChanged: () => void }) {
  const { t } = useT();
  const [busy, setBusy] = useState(false);
  const [recording, setRecording] = useState<AgreementItem | null>(null);
  const [returning, setReturning] = useState<Agreement | null>(null);
  const [choosingTitles, setChoosingTitles] = useState(false);

  const run = async (call: () => Promise<unknown>, done: string) => {
    setBusy(true);
    try {
      await call();
      toast.success(done);
      onChanged();
      return true;
    } catch (e) {
      toast.error(e instanceof Error ? e.message : t("common.error"));
      return false;
    } finally {
      setBusy(false);
    }
  };

  const dialogs = (
    <>
      {recording && (
        <RecordDialog
          item={recording}
          busy={busy}
          onClose={() => setRecording(null)}
          onSave={async (note) => {
            if (await run(() => api.events.recordAgreement(event.id, recording, note), t("flow.sent"))) setRecording(null);
          }}
        />
      )}
      {returning && (
        <ReturnDialog
          busy={busy}
          onClose={() => setReturning(null)}
          onSave={async (comment) => {
            if (await run(() => api.events.returnAgreement(event.id, returning.id, comment), t("agr.sentBack"))) setReturning(null);
          }}
        />
      )}
      {choosingTitles && (
        <TitlesDialog
          selected={data.titles.map((x) => x.id)}
          busy={busy}
          onClose={() => setChoosingTitles(false)}
          onSave={async (ids) => {
            if (await run(() => api.events.setTitles(event.id, ids), t("agr.titlesSaved"))) setChoosingTitles(false);
          }}
        />
      )}
    </>
  );

  return {
    busy,
    dialogs,
    /** KKF: record and confirm at once. Organizer: ask for an optional note, then send to KKF. */
    send: (item: AgreementItem) => (isStaff ? run(() => api.events.recordAgreement(event.id, item, null), t("agr.confirmed")) : setRecording(item)),
    /** KKF: confirm what the organizer sent. */
    confirm: (a: Agreement) => run(() => api.events.confirmAgreement(event.id, a.id), t("agr.confirmed")),
    sendBack: (a: Agreement) => setReturning(a),
    chooseTitles: () => setChoosingTitles(true),
  };
}

/** The history of recorded / confirmed / sent-back items. */
export function AgreementLog({ log }: { log: Agreement[] }) {
  const { t, lang } = useT();
  const [show, setShow] = useState(false);
  const day = (d: string | null) => (d ? formatDay(d, lang, false) : "");
  if (log.length === 0) return null;
  return (
    <div>
      <button type="button" onClick={() => setShow((s) => !s)} aria-expanded={show} className="inline-flex items-center gap-1.5 text-sm font-semibold text-slate-700 hover:text-primary">
        <ChevronDown className={`w-4 h-4 transition-transform ${show ? "rotate-180" : ""}`} aria-hidden /> {t("agr.history", { n: log.length })}
      </button>
      {show && (
        <ol className="mt-3 space-y-2 border-l-2 border-slate-100 pl-4">
          {log.map((a) => (
            <li key={a.id} className="text-sm text-slate-600">
              <span className="font-semibold text-slate-800">{t(a.item === "details" ? "agr.details" : a.item === "titles" ? "agr.titles" : "agr.sponsors")}</span>
              {" · "}{t("agr.recordedBy", { name: a.recorded_by_name ?? "—", date: day(a.recorded_at) })}
              {" · "}
              {a.status === "confirmed"
                ? t("agr.confirmedBy", { name: a.confirmed_by_name ?? "—", date: day(a.confirmed_at) })
                : a.status === "returned"
                  ? t("agr.kkfSaid", { comment: a.kkf_comment ?? "" })
                  : t("agr.state.waiting")}
              {a.note && <span className="block text-slate-500">“{a.note}”</span>}
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}

/** The Organizer sends an item to KKF, with an optional note. */
function RecordDialog({ item, busy, onClose, onSave }: { item: AgreementItem; busy: boolean; onClose: () => void; onSave: (note: string | null) => void }) {
  const { t } = useT();
  const [note, setNote] = useState("");
  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="sm:max-w-md rounded-2xl">
        <DialogHeader>
          <DialogTitle>{t(item === "details" ? "agr.recordDetailsTitle" : item === "titles" ? "agr.recordTitlesTitle" : "agr.recordSponsorsTitle")}</DialogTitle>
          <DialogDescription>{t("agr.recordHint")}</DialogDescription>
        </DialogHeader>
        <label className="block">
          <span className="text-sm font-medium text-slate-700">{t("agr.note")}</span>
          <textarea rows={3} value={note} onChange={(e) => setNote(e.target.value)} placeholder={t("agr.notePlaceholder")} className={`${fieldCls} mt-1`} />
        </label>
        <DialogFooter className="gap-2 sm:gap-2">
          <button type="button" onClick={onClose} className="h-11 px-5 rounded-xl border border-slate-300 text-sm font-medium text-slate-700 hover:bg-slate-50">{t("common.cancel")}</button>
          <button type="button" disabled={busy} onClick={() => onSave(note.trim() || null)} className="h-11 px-5 rounded-xl bg-primary text-white text-sm font-semibold hover:opacity-90 disabled:opacity-60">{t("flow.b.sendKkf")}</button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function ReturnDialog({ busy, onClose, onSave }: { busy: boolean; onClose: () => void; onSave: (comment: string) => void }) {
  const { t } = useT();
  const [comment, setComment] = useState("");
  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="sm:max-w-md rounded-2xl">
        <DialogHeader>
          <DialogTitle>{t("agr.sendBackTitle")}</DialogTitle>
          <DialogDescription>{t("agr.sendBackHint")}</DialogDescription>
        </DialogHeader>
        <label className="block">
          <span className="text-sm font-medium text-slate-700">{t("agr.reason")}</span>
          <textarea rows={3} value={comment} onChange={(e) => setComment(e.target.value)} className={`${fieldCls} mt-1`} />
        </label>
        <DialogFooter className="gap-2 sm:gap-2">
          <button type="button" onClick={onClose} className="h-11 px-5 rounded-xl border border-slate-300 text-sm font-medium text-slate-700 hover:bg-slate-50">{t("common.cancel")}</button>
          <button type="button" disabled={busy || !comment.trim()} onClick={() => onSave(comment.trim())} className="h-11 px-5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-sm font-semibold disabled:opacity-60">{t("agr.sendBack")}</button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

/** Pick the belts on the line: KKF's titles, closest weight first. */
function TitlesDialog({ selected, busy, onClose, onSave }: { selected: string[]; busy: boolean; onClose: () => void; onSave: (ids: string[]) => void }) {
  const { t } = useT();
  const [titles, setTitles] = useState<any[] | null>(null);
  const [ids, setIds] = useState<string[]>(selected);
  useEffect(() => {
    api.champions.list()
      .then((all: any[]) => setTitles((all || []).filter((c) => (c.approval_status ?? "approved") === "approved").sort((a, b) => Number(a.weight_class) - Number(b.weight_class))))
      .catch(() => setTitles([]));
  }, []);
  const toggle = (id: string) => setIds((now) => (now.includes(id) ? now.filter((x) => x !== id) : [...now, id]));
  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="sm:max-w-md rounded-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{t("agr.chooseTitles")}</DialogTitle>
          <DialogDescription>{t("agr.chooseTitlesHint")}</DialogDescription>
        </DialogHeader>
        {titles === null ? (
          <div className="py-6 flex justify-center"><div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" aria-label={t("common.loading")} /></div>
        ) : titles.length === 0 ? (
          <p className="text-sm text-slate-600">{t("bout.noTitles")}</p>
        ) : (
          <ul className="space-y-2">
            {titles.map((c) => {
              const on = ids.includes(c.id);
              return (
                <li key={c.id}>
                  <label className={`flex items-center gap-3 rounded-xl border p-3 cursor-pointer ${on ? "border-primary bg-primary/5" : "border-slate-200 hover:border-primary"}`}>
                    <input type="checkbox" className="w-5 h-5 accent-[var(--color-primary,#0A3D91)]" checked={on} onChange={() => toggle(c.id)} />
                    <span className="min-w-0">
                      <span className="block text-sm font-semibold text-slate-900">{c.title_name}</span>
                      <span className="block text-xs text-slate-500">{t("common.kg", { n: Number(c.weight_class) })} · {c.current_holder_name_db ?? c.current_holder_name ?? t("bout.vacant")}</span>
                    </span>
                  </label>
                </li>
              );
            })}
          </ul>
        )}
        <DialogFooter className="gap-2 sm:gap-2">
          <button type="button" onClick={onClose} className="h-11 px-5 rounded-xl border border-slate-300 text-sm font-medium text-slate-700 hover:bg-slate-50">{t("common.cancel")}</button>
          <button type="button" disabled={busy || titles === null} onClick={() => onSave(ids)} className="h-11 px-5 rounded-xl bg-primary text-white text-sm font-semibold hover:opacity-90 disabled:opacity-60">{busy ? t("common.saving") : t("common.save")}</button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
