/**
 * Bout side panel on the match page (claude/updates/match-page-simpler.md, G): tapping a bout opens its details next
 * to the list instead of leaving the page — both corners, weight and rules, officials, weigh-in, result — with the
 * bout's jobs as buttons (edit, officials, weigh-in, result) and "Previous / Next bout" to go through the card. The full
 * bout page (changes, history, withdraw / replace) stays one button away. Right side on a computer, full screen on a phone.
 * The open bout is in the address (`?bout=<id>`), so a refresh or a shared link keeps it open.
 */
import { useState } from "react";
import { Link, useNavigate } from "react-router";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { ChevronLeft, ChevronRight, ClipboardCheck, ExternalLink, Gavel, Pencil, Scale, Trophy, X } from "lucide-react";
import { type TextKey, useT } from "../../i18n/program";
import { EditBoutDialog } from "./BoutActions";
import { FighterAvatar, boutLabelName, cornerName, hasBothCorners, hasResult, officialsComplete, overBy, resultText, weighState } from "./shared";

export function BoutPanel({ bout, number, cardBouts, numbers, canEdit, isStaff, onOpen, onClose, onChanged }: {
  bout: any;
  /** Its number on the card (1, 2, 3…). */
  number: number;
  /** Every bout of the same card in program order (for Previous / Next). */
  cardBouts: any[];
  numbers: Map<string, number>;
  /** KKF staff who may edit bouts (not signed off / cancelled). */
  canEdit: boolean;
  isStaff: boolean;
  onOpen: (id: string) => void;
  onClose: () => void;
  onChanged: () => void;
}) {
  const { t } = useT();
  const navigate = useNavigate();
  const [editing, setEditing] = useState(false);
  const at = cardBouts.findIndex((b) => b.id === bout.id);
  const prev = at > 0 ? cardBouts[at - 1] : null;
  const next = at >= 0 && at < cardBouts.length - 1 ? cardBouts[at + 1] : null;
  const agreed = Number(bout.agreed_weight);
  const done = hasResult(bout);
  const weigh = weighState(bout);
  const judges = bout.judge_ids?.length ?? 0;
  const go = (path: string) => { onClose(); navigate(path); };
  // The one job to highlight for this bout: officials, then the weigh-in, then the result.
  const job = done ? null : !officialsComplete(bout) ? "officials" : weigh === "none" || weigh === "half" ? "weighin" : "results";
  const tone = (key: string) => (job === key ? "border-primary bg-primary text-white hover:opacity-90" : "border-slate-200 bg-white text-slate-700 hover:border-primary hover:text-primary");

  const corner = (side: "a" | "b") => {
    const red = side === "a";
    const kg = bout[`weigh_in_${side}_kg`] as number | null;
    const over = overBy(kg, agreed);
    const won = done && bout.winner_id && bout.winner_id === bout[`fighter_${side}_id`];
    return (
      <div className={`rounded-xl border p-3 flex items-center gap-3 ${red ? "border-red-200 bg-red-50/50" : "border-blue-200 bg-blue-50/50"}`}>
        {bout[`fighter_${side}_id`]
          ? <FighterAvatar name={bout[`fighter_${side}_name`]} image={bout[`fighter_${side}_image`]} tone={red ? "bg-red-50 text-red-700" : "bg-blue-50 text-blue-700"} />
          : <span className="w-9 h-9 rounded-full border-2 border-dashed border-slate-300 shrink-0" aria-hidden />}
        <div className="min-w-0 flex-1">
          <p className={`text-xs font-bold uppercase tracking-wide ${red ? "text-red-700" : "text-blue-700"}`}>{t(red ? "common.red" : "common.blue")}</p>
          <p className="font-semibold text-slate-900 break-words inline-flex items-center gap-1">
            {cornerName(bout, side, t, numbers)} {won ? <Trophy className="w-4 h-4 text-amber-500" aria-label={t("bp.winner")} /> : null}
          </p>
          {bout[`club_${side}_name`] && <p className="text-sm text-slate-600 break-words">{bout[`club_${side}_name`]}</p>}
        </div>
        <div className="text-right text-sm shrink-0">
          <p className="text-xs text-slate-500">{t("card.col.weighin")}</p>
          <p className={`font-semibold ${over ? "text-red-700" : kg != null ? "text-emerald-700" : "text-slate-400"}`}>
            {kg != null ? t("common.kg", { n: kg }) : t("card.notWeighed")}
          </p>
          {over > 0 && <p className="text-xs font-semibold text-red-700">{t("bp.over", { n: over })}</p>}
        </div>
      </div>
    );
  };

  const fact = (label: string, value: React.ReactNode) => (
    <div className="flex items-start justify-between gap-4 py-2 border-b border-slate-100 last:border-0">
      <dt className="text-sm text-slate-500">{label}</dt>
      <dd className="text-sm font-medium text-slate-900 text-right break-words">{value}</dd>
    </div>
  );
  const action = "inline-flex items-center justify-center gap-2 h-11 px-4 rounded-xl text-sm font-semibold border transition";

  return (
    <DialogPrimitive.Root open onOpenChange={(o) => !o && onClose()}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="fixed inset-0 z-40 bg-black/30" />
        <DialogPrimitive.Content className="fixed inset-y-0 right-0 z-50 w-full sm:max-w-md bg-white shadow-2xl flex flex-col focus:outline-none">
          <div className="flex items-center gap-2 px-5 py-4 border-b border-slate-200">
            <div className="min-w-0 flex-1">
              <DialogPrimitive.Title className="text-lg font-bold text-slate-900">{t("bp.title", { n: number })}</DialogPrimitive.Title>
              <DialogPrimitive.Description className="text-sm text-slate-500 break-words">
                {[boutLabelName(bout, t), bout.rule_set ? t(`ruleSet.${bout.rule_set}` as TextKey) : null].filter(Boolean).join(" · ") || t("bp.normal")}
              </DialogPrimitive.Description>
            </div>
            <button type="button" disabled={!prev} onClick={() => prev && onOpen(prev.id)} aria-label={t("bp.prev")} className="w-10 h-10 rounded-xl border border-slate-200 text-slate-600 hover:border-primary hover:text-primary disabled:opacity-30 inline-flex items-center justify-center"><ChevronLeft className="w-5 h-5" aria-hidden /></button>
            <button type="button" disabled={!next} onClick={() => next && onOpen(next.id)} aria-label={t("bp.next")} className="w-10 h-10 rounded-xl border border-slate-200 text-slate-600 hover:border-primary hover:text-primary disabled:opacity-30 inline-flex items-center justify-center"><ChevronRight className="w-5 h-5" aria-hidden /></button>
            <DialogPrimitive.Close aria-label={t("bp.close")} className="w-10 h-10 rounded-xl text-slate-500 hover:bg-slate-100 inline-flex items-center justify-center"><X className="w-5 h-5" aria-hidden /></DialogPrimitive.Close>
          </div>

          <div className="flex-1 overflow-y-auto p-5 space-y-5">
            {(bout.status === "Cancelled" || bout.replacement_side) && (
              <p className={`rounded-xl px-3 py-2 text-sm font-semibold ${bout.status === "Cancelled" ? "bg-slate-100 text-slate-700" : "bg-red-50 text-red-800"}`}>
                {bout.status === "Cancelled" ? t("ch.chip.cancelled") : t("ch.chip.replacement")}
              </p>
            )}
            <div className="space-y-2">{corner("a")}{corner("b")}</div>

            <dl>
              {fact(t("bout.weight"), t("common.kg", { n: agreed }))}
              {fact(t("bout.rules"), t("bout.ruleLine", { rounds: bout.rounds, min: bout.round_time, glove: [bout.glove_size, bout.glove_brand].filter((x) => x && x !== "—").join(" ") || "—" }))}
              {(bout.is_title_match || bout.isTitleMatch) && fact(t("common.titleFight"), bout.championshipTitleName ?? "—")}
              {fact(t("card.col.officials"), bout.referee_id
                ? t("bp.officials", { referee: bout.referee_name ?? "—", n: judges })
                : t("bp.noReferee", { n: judges }))}
              {fact(t("card.col.weighin"), t(`bp.weigh.${weigh}` as TextKey))}
              {fact(t("card.col.result"), resultText(bout, t) ?? t("card.noResult"))}
            </dl>

            {isStaff && bout.status !== "Cancelled" && (
              <div className="grid grid-cols-2 gap-2">
                {canEdit && <button type="button" onClick={() => setEditing(true)} className={`${action} border-slate-200 bg-white text-slate-700 hover:border-primary hover:text-primary`}><Pencil className="w-4 h-4" aria-hidden /> {t("ba.edit")}</button>}
                {!done && <button type="button" onClick={() => go(`/home/matches/${bout.sub_event_id}/assign-officials`)} className={`${action} ${tone("officials")}`}><ClipboardCheck className="w-4 h-4" aria-hidden /> {t("card.officials")}</button>}
                {!done && hasBothCorners(bout) && <button type="button" onClick={() => go(`/home/fight-cards/${bout.sub_event_id}/weigh-in`)} className={`${action} ${tone("weighin")}`}><Scale className="w-4 h-4" aria-hidden /> {t("card.weighin")}</button>}
                {hasBothCorners(bout) && <button type="button" onClick={() => go(`/home/fight-cards/${bout.sub_event_id}/results`)} className={`${action} ${tone("results")}`}><Gavel className="w-4 h-4" aria-hidden /> {t("card.results")}</button>}
              </div>
            )}
          </div>

          <div className="px-5 py-4 border-t border-slate-200">
            <Link to={`/home/match/${bout.id}`} onClick={onClose} className={`${action} w-full border-slate-300 bg-white text-slate-800 hover:border-primary hover:text-primary`}>
              <ExternalLink className="w-4 h-4" aria-hidden /> {t("bp.open")}
            </Link>
          </div>
          {editing && <EditBoutDialog bout={bout} onClose={() => setEditing(false)} onSaved={() => { setEditing(false); onChanged(); }} />}
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}
