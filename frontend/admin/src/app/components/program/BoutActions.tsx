/**
 * Bout actions on the match page (claude/updates/match-page-simpler.md): edit a bout's weight, rounds, gloves, type
 * and rules in a dialog; move it up or down on the card (the program sheet's order); swap red and blue; delete a bout
 * added by mistake. A KKF Officer may delete only while the match isn't published and the bout has no result
 * (otherwise the bout is cancelled from its own page, which keeps the record); a Super Admin always.
 */
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { ArrowDown, ArrowLeftRight, ArrowUp, MoreHorizontal, Pencil, Trash2 } from "lucide-react";
import { api } from "../../utils/api";
import { type TextKey, useT } from "../../i18n/program";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "../ui/dialog";
import { fieldCls } from "./FightNightFields";
import { BOUT_LABELS, ConfirmDialog, RULE_SETS, hasResult } from "./shared";

const btn = "inline-flex items-center justify-center gap-2 h-11 px-5 rounded-xl text-sm font-semibold disabled:opacity-50";
const item = "w-full text-left px-4 py-2.5 text-sm hover:bg-slate-50 inline-flex items-center gap-2 disabled:opacity-40 disabled:hover:bg-white";

export function BoutRowActions({ bout, index, cardBouts, published, isSuper, onChanged }: {
  bout: any;
  /** Position on the card (0-based) in program order. */
  index: number;
  /** Every bout of the card in program order (moving sends the whole order). */
  cardBouts: any[];
  published: boolean;
  isSuper: boolean;
  onChanged: () => void;
}) {
  const { t } = useT();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [busy, setBusy] = useState(false);
  const box = useRef<HTMLDivElement>(null);
  const done = hasResult(bout);
  const canDelete = isSuper || (!published && !done);

  useEffect(() => {
    const close = (e: MouseEvent) => { if (box.current && !box.current.contains(e.target as Node)) setOpen(false); };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, []);

  const run = async (call: () => Promise<unknown>, message: string) => {
    setBusy(true);
    setOpen(false);
    try {
      await call();
      toast.success(message);
      setDeleting(false);
      onChanged();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : t("common.error"));
    } finally {
      setBusy(false);
    }
  };
  const move = (by: -1 | 1) => {
    const ids = cardBouts.map((b) => b.id);
    const to = index + by;
    [ids[index], ids[to]] = [ids[to], ids[index]];
    return run(() => api.matches.reorder(bout.sub_event_id, ids), t("ba.moved"));
  };

  return (
    <div ref={box} className="relative shrink-0">
      <button type="button" disabled={busy} onClick={() => setOpen((o) => !o)} aria-expanded={open} aria-label={t("ba.menu")} className="w-10 h-10 rounded-xl border border-slate-200 bg-white text-slate-600 hover:border-primary hover:text-primary inline-flex items-center justify-center disabled:opacity-50">
        <MoreHorizontal className="w-5 h-5" aria-hidden />
      </button>
      {open && (
        <div className="absolute right-0 mt-2 w-60 rounded-xl border border-slate-200 bg-white shadow-lg z-20 py-1">
          <button type="button" className={`${item} text-slate-700`} onClick={() => { setOpen(false); setEditing(true); }}><Pencil className="w-4 h-4" aria-hidden /> {t("ba.edit")}</button>
          <button type="button" className={`${item} text-slate-700`} disabled={index === 0} onClick={() => move(-1)}><ArrowUp className="w-4 h-4" aria-hidden /> {t("ba.up")}</button>
          <button type="button" className={`${item} text-slate-700`} disabled={index === cardBouts.length - 1} onClick={() => move(1)}><ArrowDown className="w-4 h-4" aria-hidden /> {t("ba.down")}</button>
          {!done && <button type="button" className={`${item} text-slate-700`} onClick={() => run(() => api.matches.swapCorners(bout.id), t("ba.swapped"))}><ArrowLeftRight className="w-4 h-4" aria-hidden /> {t("ba.swap")}</button>}
          {canDelete && <button type="button" className={`${item} text-red-700 hover:bg-red-50`} onClick={() => { setOpen(false); setDeleting(true); }}><Trash2 className="w-4 h-4" aria-hidden /> {t("ba.delete")}</button>}
        </div>
      )}
      {editing && <EditBoutDialog bout={bout} onClose={() => setEditing(false)} onSaved={() => { setEditing(false); onChanged(); }} />}
      <ConfirmDialog open={deleting} title={t("ba.deleteTitle")} text={t("ba.deleteText")} confirmLabel={t("ba.delete")} danger busy={busy}
        onClose={() => setDeleting(false)} onConfirm={() => run(() => api.matches.delete(bout.id), t("ba.deleted"))} />
    </div>
  );
}

export function EditBoutDialog({ bout, onClose, onSaved }: { bout: any; onClose: () => void; onSaved: () => void }) {
  const { t } = useT();
  const [gloves, setGloves] = useState<string[]>([]);
  const [form, setForm] = useState({
    weight: String(Number(bout.agreed_weight) || ""),
    rounds: String(bout.rounds ?? 5),
    roundTime: String(bout.round_time ?? 3),
    gloveSize: String(bout.glove_size ?? ""),
    gloveBrand: String(bout.glove_brand ?? ""),
    label: String(bout.bout_label ?? ""),
    labelText: String(bout.bout_label_text ?? ""),
    ruleSet: String(bout.rule_set ?? "kun_khmer"),
  });
  const [busy, setBusy] = useState(false);
  const set = (patch: Partial<typeof form>) => setForm((f) => ({ ...f, ...patch }));

  useEffect(() => {
    api.settingsLists.list("glove-brands")
      .then((g: any[]) => setGloves((g || []).map((x) => `${x.brand}${x.model ? ` ${x.model}` : ""}`)))
      .catch(() => setGloves([]));
  }, []);
  const brands = [...new Set([form.gloveBrand, ...gloves].filter(Boolean))];

  const kg = Number(form.weight);
  const rounds = Number(form.rounds);
  const minutes = Number(form.roundTime);
  const problem = !(kg >= 20 && kg <= 200) ? t("ff.weightRange")
    : !(Number.isInteger(rounds) && rounds >= 1 && rounds <= 12) ? t("ba.roundsRange")
    : !(minutes > 0 && minutes <= 10) ? t("ba.roundTimeRange")
    : form.label === "other" && !form.labelText.trim() ? t("bout.labelTextNeeded")
    : null;

  const save = async () => {
    if (problem) return toast.error(problem);
    setBusy(true);
    try {
      await api.matches.update(bout.id, {
        agreedWeight: kg, rounds, roundTime: minutes,
        gloveSize: form.gloveSize.trim() || "—", gloveBrand: form.gloveBrand || "—",
        boutLabel: form.label, boutLabelText: form.label === "other" ? form.labelText.trim() : "",
        ruleSet: form.ruleSet,
      });
      toast.success(t("ba.saved"));
      onSaved();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : t("common.error"));
      setBusy(false);
    }
  };

  const label = (text: string) => <span className="text-sm font-semibold text-slate-800">{text}</span>;
  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="sm:max-w-lg rounded-2xl max-h-[92vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{t("ba.edit")}</DialogTitle>
          <DialogDescription>{t("ba.editText", { red: bout.fighter_a_name ?? "—", blue: bout.fighter_b_name ?? "—" })}</DialogDescription>
        </DialogHeader>
        <div className="grid sm:grid-cols-3 gap-4">
          <label className="block">{label(t("bout.weight"))}<input type="number" inputMode="decimal" step="0.5" min={20} max={200} className={`${fieldCls} mt-1`} value={form.weight} onChange={(e) => set({ weight: e.target.value })} /></label>
          <label className="block">{label(t("ba.rounds"))}<input type="number" inputMode="numeric" min={1} max={12} className={`${fieldCls} mt-1`} value={form.rounds} onChange={(e) => set({ rounds: e.target.value })} /></label>
          <label className="block">{label(t("ba.roundTime"))}<input type="number" inputMode="decimal" step="0.5" min={1} max={10} className={`${fieldCls} mt-1`} value={form.roundTime} onChange={(e) => set({ roundTime: e.target.value })} /></label>
        </div>
        <div className="grid sm:grid-cols-2 gap-4">
          <label className="block">{label(t("ba.gloveBrand"))}
            <select className={`${fieldCls} mt-1`} value={form.gloveBrand} onChange={(e) => set({ gloveBrand: e.target.value })}>
              {brands.length === 0 && <option value="">—</option>}
              {brands.map((b) => <option key={b} value={b}>{b}</option>)}
            </select>
          </label>
          <label className="block">{label(t("ba.gloveSize"))}<input className={`${fieldCls} mt-1`} value={form.gloveSize} onChange={(e) => set({ gloveSize: e.target.value })} placeholder="10oz" /></label>
        </div>
        <div className="grid sm:grid-cols-2 gap-4">
          <label className="block">{label(t("bout.label"))}
            <select className={`${fieldCls} mt-1`} value={form.label} onChange={(e) => set({ label: e.target.value })}>
              <option value="">{t("common.notSet")}</option>
              {BOUT_LABELS.map((k) => <option key={k} value={k}>{t(`boutLabel.${k}` as TextKey)}</option>)}
            </select>
          </label>
          <label className="block">{label(t("bout.ruleSet"))}
            <select className={`${fieldCls} mt-1`} value={form.ruleSet} onChange={(e) => set({ ruleSet: e.target.value })}>
              {RULE_SETS.map((k) => <option key={k} value={k}>{t(`ruleSet.${k}` as TextKey)}</option>)}
            </select>
          </label>
        </div>
        {form.label === "other" && (
          <label className="block">{label(t("bout.labelText"))}<input className={`${fieldCls} mt-1`} value={form.labelText} maxLength={120} onChange={(e) => set({ labelText: e.target.value })} placeholder={t("bout.labelTextHint")} /></label>
        )}
        <p className="text-sm text-slate-500">{t("ba.fightersHint")}</p>
        <DialogFooter className="gap-2">
          <button type="button" onClick={onClose} className={`${btn} border border-slate-300 bg-white text-slate-700`}>{t("common.cancel")}</button>
          <button type="button" disabled={busy} onClick={save} className={`${btn} bg-primary text-white hover:opacity-90`}>{busy ? t("common.saving") : t("common.save")}</button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
