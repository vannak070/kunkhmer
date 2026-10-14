/**
 * "Merge into another fighter" on the fighter page (claude/updates/fighter-id-merge.md), KKF staff: the fighter open
 * now is the duplicate; pick the record to keep, see what moves, confirm. The duplicate is removed afterwards.
 */
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { api } from "../../utils/api";
import { type TextKey, khmerDigits, useT } from "../../i18n/program";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "../ui/dialog";
import { fieldCls } from "../program/FightNightFields";
import { FighterSearchSelect } from "./FighterSearchSelect";

const btn = "inline-flex items-center justify-center gap-2 h-11 px-5 rounded-xl text-sm font-semibold disabled:opacity-40";
const MOVES = ["bouts", "results", "titles", "defences", "videos", "follows"] as const;

export function MergeFighterDialog({ fighter, initialKeep, onClose, onDone }: { fighter: any; initialKeep?: any; onClose: () => void; onDone: (keptId: string) => void }) {
  const { t, lang } = useT();
  // `initialKeep`: the record to keep is already known (the duplicates list); the officer can still pick another.
  const [keep, setKeep] = useState<any | null>(initialKeep ?? null);
  const [preview, setPreview] = useState<Awaited<ReturnType<typeof api.fighters.mergePreview>> | null>(null);
  const [problem, setProblem] = useState("");
  const [busy, setBusy] = useState(false);
  const n = (v: number) => (lang === "km" ? khmerDigits(v) : String(v));
  const name = (f: any) => (lang === "km" && f?.nameKhmer ? f.nameKhmer : f?.name);

  useEffect(() => {
    setPreview(null);
    setProblem("");
    if (!keep) return;
    let live = true;
    api.fighters.mergePreview(fighter.id, keep.id)
      .then((p) => live && setPreview(p))
      .catch((e) => live && setProblem(e instanceof Error ? e.message : t("common.error")));
    return () => { live = false; };
  }, [keep?.id]);

  const merge = async () => {
    if (!keep) return;
    setBusy(true);
    try {
      const res = await api.fighters.merge(fighter.id, keep.id);
      toast.success(t("mg.done", { name: res.kept.name }));
      onDone(res.kept.id);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : t("common.error"));
      setBusy(false);
    }
  };

  const moved = preview ? MOVES.filter((k) => Number(preview.moves[k]) > 0) : [];
  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="sm:max-w-xl rounded-2xl max-h-[92vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{t("mg.title", { name: name(fighter) })}</DialogTitle>
          <DialogDescription>{t("mg.text")}</DialogDescription>
        </DialogHeader>

        <div className="space-y-1">
          <span className="text-sm font-semibold text-slate-800">{t("mg.keep")}</span>
          <FighterSearchSelect selected={keep} onChange={setKeep} placeholder={t("mg.search")} inputClassName={fieldCls} />
        </div>

        {problem && <p className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-800">{problem}</p>}
        {preview?.blocked && <p className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-800">{t(`mg.blocked.${preview.blocked}` as TextKey)}</p>}
        {preview && !preview.blocked && (
          <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-slate-800 space-y-2">
            <p className="font-semibold">{t("mg.willMove", { from: name(preview.remove), to: name(preview.keep) })}</p>
            <ul className="list-disc pl-5 space-y-0.5">
              {moved.map((k) => <li key={k}>{t(`mg.m.${k}` as TextKey, { n: n(Number(preview.moves[k])) })}</li>)}
              {preview.moves.privateDetails && <li>{t("mg.m.private")}</li>}
              {moved.length === 0 && !preview.moves.privateDetails && <li>{t("mg.m.nothing")}</li>}
            </ul>
            <p>{t("mg.after", { from: name(preview.remove), to: name(preview.keep) })}</p>
          </div>
        )}

        <DialogFooter className="gap-2">
          <button type="button" onClick={onClose} className={`${btn} border border-slate-300 bg-white text-slate-700`}>{t("common.cancel")}</button>
          <button type="button" disabled={busy || !preview || Boolean(preview.blocked)} onClick={merge} className={`${btn} bg-red-600 text-white hover:bg-red-700`}>{busy ? t("common.saving") : t("mg.confirm")}</button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
