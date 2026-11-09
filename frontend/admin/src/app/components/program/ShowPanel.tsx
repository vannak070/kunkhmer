/**
 * Show side panel on the Week board (owner's pick, 2026-11-09): clicking a show opens its bouts next to the week —
 * red vs blue, weight, rules and type — with Open match, Add bouts and Program sheet, and Previous / Next show to go
 * through the week without leaving it. Right side on a computer, full screen on a phone.
 */
import { Link } from "react-router";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { CalendarDays, ChevronLeft, ChevronRight, ExternalLink, ListPlus, MapPin, Printer, Trophy, Tv, X } from "lucide-react";
import { type TextKey, formatDay, formatTime, useT } from "../../i18n/program";
import { usePlaceName } from "../../hooks/useSettingsLists";
import { StatusChip, boutLabelName, boutNumbers, byCardOrder, cornerName, displayStatus, resultText } from "./shared";

export function ShowPanel({ show, bouts, stationName, sponsorName, prev, next, onOpen, onClose }: {
  show: any;
  /** This show's bouts. */
  bouts: any[];
  stationName: string;
  sponsorName: string;
  prev: any | null;
  next: any | null;
  onOpen: (id: string) => void;
  onClose: () => void;
}) {
  const { t, lang } = useT();
  const placeName = usePlaceName();
  const ordered = [...bouts].sort(byCardOrder);
  const numbers = boutNumbers(ordered);
  // Add bouts goes to "Add several bouts" of the show's card; without a card yet, the match page (its Add bouts makes one).
  const cardId = ordered[0]?.sub_event_id as string | undefined;
  const action = "inline-flex items-center justify-center gap-2 h-11 px-4 rounded-xl text-sm font-semibold border transition";

  return (
    <DialogPrimitive.Root open onOpenChange={(o) => !o && onClose()}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="fixed inset-0 z-40 bg-black/30" />
        <DialogPrimitive.Content className="fixed inset-y-0 right-0 z-50 w-full sm:max-w-lg bg-white shadow-2xl flex flex-col focus:outline-none">
          <div className="flex items-start gap-2 px-5 py-4 border-b border-slate-200">
            <div className="min-w-0 flex-1 space-y-1">
              <DialogPrimitive.Title className="text-lg font-bold text-slate-900 break-words">{show.name}</DialogPrimitive.Title>
              <DialogPrimitive.Description asChild>
                <div className="text-sm text-slate-600 space-y-0.5">
                  <p className="flex items-center gap-1.5"><CalendarDays className="w-4 h-4 text-slate-400 shrink-0" aria-hidden />{formatDay(show.date, lang)}{show.start_time ? ` · ${formatTime(show.start_time, lang)}` : ""}</p>
                  <p className="flex items-start gap-1.5"><Tv className="w-4 h-4 mt-0.5 text-slate-400 shrink-0" aria-hidden />{[stationName, sponsorName].filter(Boolean).join(" · ")}</p>
                  {show.location && <p className="flex items-start gap-1.5"><MapPin className="w-4 h-4 mt-0.5 text-slate-400 shrink-0" aria-hidden /><span className="break-words">{placeName(show.location)}</span></p>}
                </div>
              </DialogPrimitive.Description>
              <StatusChip status={displayStatus(show, bouts)} />
            </div>
            <button type="button" disabled={!prev} onClick={() => prev && onOpen(prev.id)} aria-label={t("sp.prev")} className="w-10 h-10 rounded-xl border border-slate-200 text-slate-600 hover:border-primary hover:text-primary disabled:opacity-30 inline-flex items-center justify-center shrink-0"><ChevronLeft className="w-5 h-5" aria-hidden /></button>
            <button type="button" disabled={!next} onClick={() => next && onOpen(next.id)} aria-label={t("sp.next")} className="w-10 h-10 rounded-xl border border-slate-200 text-slate-600 hover:border-primary hover:text-primary disabled:opacity-30 inline-flex items-center justify-center shrink-0"><ChevronRight className="w-5 h-5" aria-hidden /></button>
            <DialogPrimitive.Close aria-label={t("bp.close")} className="w-10 h-10 rounded-xl text-slate-500 hover:bg-slate-100 inline-flex items-center justify-center shrink-0"><X className="w-5 h-5" aria-hidden /></DialogPrimitive.Close>
          </div>

          <div className="flex-1 overflow-y-auto p-5 space-y-3">
            <h3 className="text-sm font-bold text-slate-700">{t("sp.bouts", { n: ordered.length })}</h3>
            {ordered.length === 0 ? (
              <p className="rounded-xl border border-dashed border-slate-300 p-4 text-sm text-slate-600">{t("card.noBouts")}</p>
            ) : (
              <ol className="space-y-2">
                {ordered.map((b, i) => (
                  <li key={b.id} className={`rounded-xl border p-3 ${b.status === "Cancelled" ? "border-slate-200 bg-slate-50 opacity-70" : "border-slate-200 bg-white"}`}>
                    <div className="flex items-start gap-3">
                      <span className="text-sm font-bold text-slate-400 w-5 shrink-0">{i + 1}</span>
                      <div className="min-w-0 flex-1 space-y-0.5">
                        <p className="text-sm font-semibold text-red-700 break-words">{cornerName(b, "a", t, numbers)}</p>
                        <p className="text-sm font-semibold text-blue-700 break-words">{cornerName(b, "b", t, numbers)}</p>
                        <p className="text-xs text-slate-500">
                          {[t("common.kg", { n: Number(b.agreed_weight) }), t("common.rounds", { n: b.rounds }), boutLabelName(b, t), b.rule_set && b.rule_set !== "kun_khmer" ? t(`ruleSet.${b.rule_set}` as TextKey) : null].filter(Boolean).join(" · ")}
                        </p>
                        {resultText(b, t) && <p className="text-xs font-semibold text-slate-800 inline-flex items-center gap-1"><Trophy className="w-3 h-3 text-amber-500" aria-hidden />{resultText(b, t)}</p>}
                      </div>
                    </div>
                  </li>
                ))}
              </ol>
            )}
          </div>

          <div className="px-5 py-4 border-t border-slate-200 grid grid-cols-1 sm:grid-cols-3 gap-2">
            <Link to={`/home/events/${show.id}`} onClick={onClose} className={`${action} border-primary bg-primary text-white hover:opacity-90`}><ExternalLink className="w-4 h-4" aria-hidden /> {t("sp.open")}</Link>
            <Link to={cardId ? `/home/matches/${cardId}/quick-bouts` : `/home/events/${show.id}`} onClick={onClose} className={`${action} border-slate-300 bg-white text-slate-800 hover:border-primary hover:text-primary`}><ListPlus className="w-4 h-4" aria-hidden /> {t("card.addMenu")}</Link>
            <Link to={`/events/${show.id}/sheet`} onClick={onClose} className={`${action} border-slate-300 bg-white text-slate-800 hover:border-primary hover:text-primary`}><Printer className="w-4 h-4" aria-hidden /> {t("sheet.print")}</Link>
          </div>
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}
