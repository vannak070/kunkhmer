/**
 * "Agreements with the broadcaster" on the fight-night page (Program workflow phase 4,
 * claude/updates/offline-agreements-log.md): the licence / permit, and for the fight night details and the
 * sponsors what was agreed offline — who recorded it, whether KKF confirmed it — plus the history.
 * Organizer: edit the licence and record (before publishing). KKF staff: confirm / send back, or record and confirm
 * in one step. Publishing waits for confirmed details (FightNightSteps).
 * Phase 5 (claude/updates/fight-night-titles.md): "Titles on the line" — the belts this fight night puts on the
 * line, chosen by the Organizer (or KKF) and confirmed like the other items; needed before publishing if any.
 */
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { CheckCircle2, ChevronDown, Clock, FileText, Handshake, RotateCcw, ShieldCheck, Trophy, Upload } from "lucide-react";
import { api } from "../../utils/api";
import { type TextKey, formatDay, useT } from "../../i18n/program";
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

const ITEMS: { item: AgreementItem; title: TextKey; covers: TextKey }[] = [
  { item: "details", title: "agr.details", covers: "agr.detailsCovers" },
  { item: "sponsors", title: "agr.sponsors", covers: "agr.sponsorsCovers" },
  { item: "titles", title: "agr.titles", covers: "agr.titlesCovers" },
];

const CHIP: Record<AgreementState, { tone: string; text: TextKey }> = {
  none: { tone: "bg-slate-100 text-slate-600", text: "agr.state.none" },
  waiting: { tone: "bg-amber-50 text-amber-800", text: "agr.state.waiting" },
  returned: { tone: "bg-red-50 text-red-700", text: "agr.state.returned" },
  confirmed: { tone: "bg-emerald-50 text-emerald-700", text: "agr.state.confirmed" },
  changed: { tone: "bg-amber-50 text-amber-800", text: "agr.state.changed" },
};

export function AgreementsPanel({ event, data, isStaff, onChanged }: {
  event: any;
  data: Agreements;
  isStaff: boolean;
  /** Reload the fight night and its agreements. */
  onChanged: () => void;
}) {
  const { t, lang } = useT();
  const [recording, setRecording] = useState<AgreementItem | null>(null);
  const [returning, setReturning] = useState<Agreement | null>(null);
  const [editingLicence, setEditingLicence] = useState(false);
  const [choosingTitles, setChoosingTitles] = useState(false);
  const [showLog, setShowLog] = useState(false);
  const [busy, setBusy] = useState(false);
  // Organizers change nothing after publishing; KKF always can.
  const canChange = isStaff || !LOCKED_FOR_ORGANIZER.includes(event.status);
  const licenceReady = Boolean(data.licence.number && data.licence.date);
  const day = (d: string | null) => (d ? formatDay(d, lang, false) : "");

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

  const openScan = async () => {
    try {
      const url = URL.createObjectURL(await api.events.licenceDocument(event.id));
      window.open(url, "_blank", "noopener");
      setTimeout(() => URL.revokeObjectURL(url), 60_000);
    } catch {
      toast.error(t("agr.scanError"));
    }
  };

  const btn = "inline-flex items-center gap-1.5 h-10 px-4 rounded-xl text-sm font-semibold disabled:opacity-60";
  const primary = `${btn} bg-primary text-white hover:opacity-90`;
  const outline = `${btn} border border-slate-200 bg-white text-slate-700 hover:border-primary hover:text-primary`;

  return (
    <section id="agreements" aria-labelledby="agreements-title" className="rounded-2xl border border-slate-200 bg-white p-5 md:p-6 space-y-5 scroll-mt-24">
      <div>
        <h2 id="agreements-title" className="text-lg font-bold text-slate-900 flex items-center gap-2">
          <Handshake className="w-5 h-5 text-primary" aria-hidden /> {t("agr.title")}
        </h2>
        <p className="text-sm text-slate-600 mt-1">{t(isStaff ? "agr.introStaff" : "agr.introOrganizer")}</p>
      </div>

      {/* Licence / permit */}
      <div className="rounded-xl border border-slate-200 p-4 flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-sm font-semibold text-slate-900 flex items-center gap-2"><ShieldCheck className="w-4 h-4 text-slate-400" aria-hidden /> {t("agr.licence")}</p>
          {licenceReady ? (
            <p className="mt-1 text-sm text-slate-700">{t("agr.licenceLine", { number: data.licence.number!, date: day(data.licence.date) })}</p>
          ) : (
            <p className="mt-1 text-sm text-amber-800">{t("agr.licenceMissing")}</p>
          )}
          <p className="mt-1 text-xs text-slate-500">{t(data.licence.hasDocument ? "agr.scanYes" : "agr.scanNo")} · {t("agr.private")}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          {data.licence.hasDocument && (
            <button type="button" onClick={openScan} className={outline}><FileText className="w-4 h-4" aria-hidden /> {t("agr.viewScan")}</button>
          )}
          {canChange && (
            <button type="button" onClick={() => setEditingLicence(true)} className={outline}>{t(licenceReady ? "agr.editLicence" : "agr.addLicence")}</button>
          )}
        </div>
      </div>

      {/* One row per agreed item */}
      <ul className="space-y-3">
        {ITEMS.map(({ item, title, covers }) => {
          const { state, agreement: a } = data.items[item];
          const outdated = state === "waiting" && a?.matches_current === false;
          // No titles chosen: nothing to agree (and nothing blocks publishing).
          const noTitles = item === "titles" && data.titles.length === 0;
          const needsRecord = !noTitles && (state === "none" || state === "returned" || state === "changed" || outdated);
          const chip = noTitles && state === "none" ? { tone: "bg-slate-100 text-slate-600", text: "agr.state.noTitles" as TextKey } : CHIP[state];
          return (
            <li key={item} className="rounded-xl border border-slate-200 p-4 space-y-2">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <p className="font-semibold text-slate-900">{t(title)}</p>
                  <p className="text-xs text-slate-500">{t(covers)}</p>
                </div>
                <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ${chip.tone}`}>{t(chip.text)}</span>
              </div>
              {item === "titles" && data.titles.length > 0 && (
                <ul className="flex flex-wrap gap-2">
                  {data.titles.map((ti) => (
                    <li key={ti.id} className="inline-flex items-center gap-1.5 rounded-lg bg-amber-50 border border-amber-200 px-2.5 py-1 text-sm text-amber-900">
                      <Trophy className="w-3.5 h-3.5 text-amber-600" aria-hidden />
                      <span className="font-semibold">{ti.title_name}</span>
                      <span className="text-amber-800">· {ti.current_holder_name ?? t("bout.vacant")}</span>
                    </li>
                  ))}
                </ul>
              )}
              {a && (
                <div className="text-sm text-slate-600 space-y-1">
                  <p>
                    {t("agr.recordedBy", { name: a.recorded_by_name ?? "—", date: day(a.recorded_at) })}
                    {a.status === "confirmed" && a.confirmed_by_name && <> · {t("agr.confirmedBy", { name: a.confirmed_by_name, date: day(a.confirmed_at) })}</>}
                  </p>
                  {a.note && <p className="text-slate-700">“{a.note}”</p>}
                  {state === "returned" && a.kkf_comment && (
                    <p className="rounded-lg bg-red-50 border border-red-100 px-3 py-2 text-red-800">{t("agr.kkfSaid", { comment: a.kkf_comment })}</p>
                  )}
                  {(outdated || state === "changed") && <p className="text-amber-800">{t(outdated ? "agr.outdated" : "agr.changedHint")}</p>}
                </div>
              )}
              <div className="flex flex-wrap gap-2 pt-1">
                {item === "titles" && canChange && (
                  <button type="button" disabled={busy} onClick={() => setChoosingTitles(true)} className={outline}>
                    <Trophy className="w-4 h-4" aria-hidden /> {t("agr.chooseTitles")}
                  </button>
                )}
                {isStaff && state === "waiting" && !outdated && a && (
                  <>
                    <button type="button" disabled={busy} onClick={() => run(() => api.events.confirmAgreement(event.id, a.id), t("agr.confirmed"))} className={primary}>
                      <CheckCircle2 className="w-4 h-4" aria-hidden /> {t("agr.confirm")}
                    </button>
                    <button type="button" disabled={busy} onClick={() => setReturning(a)} className={`${btn} border border-slate-200 bg-white text-slate-700 hover:border-red-300 hover:text-red-700`}>
                      <RotateCcw className="w-4 h-4" aria-hidden /> {t("agr.sendBack")}
                    </button>
                  </>
                )}
                {canChange && needsRecord && (
                  <button type="button" disabled={busy} onClick={() => setRecording(item)} className={isStaff ? outline : primary}>
                    {t(isStaff ? "agr.recordConfirm" : "agr.record")}
                  </button>
                )}
                {!isStaff && state === "waiting" && !outdated && (
                  <span className="inline-flex items-center gap-1.5 text-sm text-slate-500"><Clock className="w-4 h-4" aria-hidden /> {t("agr.waitingKkf")}</span>
                )}
              </div>
            </li>
          );
        })}
      </ul>

      {data.log.length > 0 && (
        <div>
          <button type="button" onClick={() => setShowLog((s) => !s)} aria-expanded={showLog} className="inline-flex items-center gap-1.5 text-sm font-semibold text-slate-700 hover:text-primary">
            <ChevronDown className={`w-4 h-4 transition-transform ${showLog ? "rotate-180" : ""}`} aria-hidden /> {t("agr.history", { n: data.log.length })}
          </button>
          {showLog && (
            <ol className="mt-3 space-y-2 border-l-2 border-slate-100 pl-4">
              {data.log.map((a) => (
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
      )}

      {recording && (
        <RecordDialog
          item={recording}
          isStaff={isStaff}
          licenceReady={licenceReady}
          busy={busy}
          onClose={() => setRecording(null)}
          onSave={async (note) => {
            if (await run(() => api.events.recordAgreement(event.id, recording, note), t(isStaff ? "agr.recordedConfirmed" : "agr.recorded"))) setRecording(null);
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
      {editingLicence && (
        <LicenceDialog
          licence={data.licence}
          busy={busy}
          onClose={() => setEditingLicence(false)}
          onSave={async (input) => {
            if (await run(() => api.events.saveLicence(event.id, input), t("agr.licenceSaved"))) setEditingLicence(false);
          }}
        />
      )}
    </section>
  );
}

function RecordDialog({ item, isStaff, licenceReady, busy, onClose, onSave }: {
  item: AgreementItem; isStaff: boolean; licenceReady: boolean; busy: boolean; onClose: () => void; onSave: (note: string | null) => void;
}) {
  const { t } = useT();
  const [note, setNote] = useState("");
  const blocked = item === "details" && !licenceReady;
  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="sm:max-w-md rounded-2xl">
        <DialogHeader>
          <DialogTitle>{t(item === "details" ? "agr.recordDetailsTitle" : item === "titles" ? "agr.recordTitlesTitle" : "agr.recordSponsorsTitle")}</DialogTitle>
          <DialogDescription>{t(isStaff ? "agr.recordStaffHint" : "agr.recordHint")}</DialogDescription>
        </DialogHeader>
        {blocked ? (
          <p className="rounded-xl bg-amber-50 border border-amber-200 p-3 text-sm text-amber-900">{t("agr.needLicence")}</p>
        ) : (
          <label className="block">
            <span className="text-sm font-medium text-slate-700">{t("agr.note")}</span>
            <textarea rows={3} value={note} onChange={(e) => setNote(e.target.value)} placeholder={t("agr.notePlaceholder")} className={`${fieldCls} mt-1`} />
          </label>
        )}
        <DialogFooter className="gap-2 sm:gap-2">
          <button type="button" onClick={onClose} className="h-11 px-5 rounded-xl border border-slate-300 text-sm font-medium text-slate-700 hover:bg-slate-50">{t("common.cancel")}</button>
          {!blocked && (
            <button type="button" disabled={busy} onClick={() => onSave(note.trim() || null)} className="h-11 px-5 rounded-xl bg-primary text-white text-sm font-semibold hover:opacity-90 disabled:opacity-60">
              {t(isStaff ? "agr.recordConfirm" : "agr.record")}
            </button>
          )}
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

function LicenceDialog({ licence, busy, onClose, onSave }: {
  licence: Agreements["licence"];
  busy: boolean;
  onClose: () => void;
  onSave: (input: { number?: string | null; date?: string | null; document?: string }) => void;
}) {
  const { t } = useT();
  const [number, setNumber] = useState(licence.number ?? "");
  const [date, setDate] = useState(licence.date ?? "");
  // undefined = keep the stored scan, "" = remove it, data URI = new scan.
  const [document, setDocument] = useState<string | undefined>(undefined);
  const [fileName, setFileName] = useState("");
  const file = useRef<HTMLInputElement>(null);
  const hasScan = document === undefined ? licence.hasDocument : Boolean(document);

  const pick = (f?: File) => {
    if (!f) return;
    if (f.size > 10 * 1024 * 1024) {
      toast.error(t("agr.scanTooBig"));
      return;
    }
    const reader = new FileReader();
    reader.onloadend = () => {
      setDocument(reader.result as string);
      setFileName(f.name);
    };
    reader.readAsDataURL(f);
  };

  const save = () =>
    onSave({
      number: number.trim() || null,
      date: date || null,
      ...(document !== undefined ? { document } : {}),
    });

  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="sm:max-w-md rounded-2xl">
        <DialogHeader>
          <DialogTitle>{t("agr.licence")}</DialogTitle>
          <DialogDescription>{t("agr.licenceHint")}</DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <label className="block">
            <span className="text-sm font-medium text-slate-700">{t("agr.licenceNumber")}</span>
            <input value={number} maxLength={100} onChange={(e) => setNumber(e.target.value)} className={`${fieldCls} mt-1`} />
          </label>
          <label className="block">
            <span className="text-sm font-medium text-slate-700">{t("agr.licenceDate")}</span>
            <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className={`${fieldCls} mt-1`} />
          </label>
          <div>
            <span className="text-sm font-medium text-slate-700">{t("agr.scan")}</span>
            <div className="mt-1 flex flex-wrap items-center gap-2">
              <span className="text-sm text-slate-600">{fileName || t(hasScan ? "agr.scanYes" : "agr.scanNo")}</span>
              <button type="button" onClick={() => file.current?.click()} className="inline-flex items-center gap-1.5 h-10 px-3 rounded-lg border border-slate-300 text-sm font-semibold text-slate-700 hover:border-primary">
                <Upload className="w-4 h-4" aria-hidden /> {t(hasScan ? "common.change" : "agr.addScan")}
              </button>
              {hasScan && (
                <button type="button" onClick={() => { setDocument(""); setFileName(""); }} className="h-10 px-3 text-sm text-slate-500 hover:text-red-700">{t("agr.removeScan")}</button>
              )}
              <input ref={file} type="file" accept="application/pdf,image/png,image/jpeg,image/webp" className="hidden" onChange={(e) => pick(e.target.files?.[0])} />
            </div>
            <p className="mt-1 text-xs text-slate-500">{t("agr.scanHint")}</p>
          </div>
        </div>
        <DialogFooter className="gap-2 sm:gap-2">
          <button type="button" onClick={onClose} className="h-11 px-5 rounded-xl border border-slate-300 text-sm font-medium text-slate-700 hover:bg-slate-50">{t("common.cancel")}</button>
          <button type="button" disabled={busy} onClick={save} className="h-11 px-5 rounded-xl bg-primary text-white text-sm font-semibold hover:opacity-90 disabled:opacity-60">{busy ? t("common.saving") : t("common.save")}</button>
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
