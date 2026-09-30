/**
 * Building blocks shared by the officer-friendly Program screens (fight nights, fight-night page, weigh-in,
 * results): language switch, status chip, initials avatar, confirm dialog and small bout helpers.
 * See claude/updates/program-officer-friendly.md.
 */
import type { ReactNode } from "react";
import { Languages } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "../ui/dialog";
import { setLang, useT } from "../../i18n/program";

/** A fighter may be at most this much over the agreed weight (kg). */
export const WEIGH_TOLERANCE_KG = 1;

export function LangSwitch() {
  const { t, lang } = useT();
  return (
    <button
      type="button"
      onClick={() => setLang(lang === "en" ? "km" : "en")}
      aria-label={t("lang.switchLabel")}
      className="inline-flex items-center gap-2 h-10 px-3.5 rounded-xl border border-slate-200 bg-white text-sm font-semibold text-slate-700 hover:border-primary hover:text-primary"
    >
      <Languages className="w-4 h-4" aria-hidden />
      <span lang={lang === "en" ? "km" : "en"}>{t("lang.switch")}</span>
    </button>
  );
}

const TONES: Record<string, string> = {
  Draft: "bg-slate-100 text-slate-700",
  Published: "bg-emerald-50 text-emerald-700",
  Completed: "bg-blue-50 text-blue-700",
  Cancelled: "bg-red-50 text-red-700",
};

export function StatusChip({ status }: { status: DisplayStatus }) {
  const { t } = useT();
  return <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ${TONES[status]}`}>{t(`status.${status}`)}</span>;
}

export function Initials({ name, size = "w-9 h-9 text-xs", tone = "bg-slate-100 text-slate-600" }: { name?: string | null; size?: string; tone?: string }) {
  const letters = (name ?? "?")
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();
  return (
    <span aria-hidden className={`${size} ${tone} rounded-full inline-flex items-center justify-center font-bold shrink-0`}>
      {letters || "?"}
    </span>
  );
}

/** A small photo when there is one, otherwise the initials — never a stock picture. */
export function FighterAvatar({ name, image, tone }: { name?: string | null; image?: string | null; tone?: string }) {
  return image ? <img src={image} alt="" className="w-9 h-9 rounded-full object-cover shrink-0 bg-slate-100" /> : <Initials name={name} tone={tone} />;
}

export function ConfirmDialog({ open, title, text, confirmLabel, danger = false, busy = false, onConfirm, onClose, children }: {
  open: boolean;
  title: string;
  text: string;
  confirmLabel: string;
  danger?: boolean;
  busy?: boolean;
  onConfirm: () => void;
  onClose: () => void;
  children?: ReactNode;
}) {
  const { t } = useT();
  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="sm:max-w-md rounded-2xl">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{text}</DialogDescription>
        </DialogHeader>
        {children}
        <DialogFooter className="gap-2 sm:gap-2">
          <button type="button" onClick={onClose} className="h-11 px-5 rounded-xl border border-slate-300 text-sm font-medium text-slate-700 hover:bg-slate-50">
            {t("common.cancel")}
          </button>
          <button
            type="button"
            disabled={busy}
            onClick={onConfirm}
            className={`h-11 px-5 rounded-xl text-sm font-semibold text-white disabled:opacity-60 ${danger ? "bg-red-600 hover:bg-red-700" : "bg-primary hover:opacity-90"}`}
          >
            {confirmLabel}
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ─── Bout helpers (API match rows) ──────────────────────────────────────────

export type DisplayStatus = "Draft" | "Published" | "Completed" | "Cancelled";

export const hasResult = (m: any) => Boolean(m.winner_id || m.winner_method || m.result);
export const officialsComplete = (m: any) => Boolean(m.referee_id) && (m.judge_ids?.length ?? 0) >= 3;

export type WeighState = "none" | "half" | "ok" | "over";
export function weighState(m: any): WeighState {
  const a = m.weigh_in_a_kg, b = m.weigh_in_b_kg;
  if (a == null && b == null) return "none";
  if (a == null || b == null) return "half";
  const limit = Number(m.agreed_weight) + WEIGH_TOLERANCE_KG;
  return a > limit || b > limit ? "over" : "ok";
}

/** kg over the limit (agreed + tolerance), or 0. */
export const overBy = (kg: number | null | undefined, agreed: number) =>
  kg == null ? 0 : Math.max(0, Math.round((kg - (Number(agreed) + WEIGH_TOLERANCE_KG)) * 100) / 100);

export const todayUtc = () => new Date(new Date().toISOString().slice(0, 10)).getTime();
export const dayOf = (value?: string | null) => (value ? new Date(value.length === 10 ? `${value}T00:00:00Z` : value).getTime() : NaN);

/** What the officer sees: Draft / Published / Completed (fight night passed and every result in) / Cancelled. */
export function displayStatus(event: any, bouts: any[]): DisplayStatus {
  if (event.status === "Cancelled") return "Cancelled";
  if (event.status === "Completed") return "Completed";
  if (event.status !== "Published") return "Draft";
  const passed = dayOf(event.date) <= todayUtc();
  return passed && bouts.length > 0 && bouts.every(hasResult) ? "Completed" : "Published";
}

/** Bouts sorted as on the fight card. */
export const byCardOrder = (a: any, b: any) => (a.sort_order ?? 0) - (b.sort_order ?? 0);

/** "Red won by KO in round 2" style summary, in the chosen language. */
export function resultText(m: any, t: (k: any, v?: any) => string): string | null {
  if (!hasResult(m)) return null;
  const method = m.winner_method as string | null;
  if (!m.winner_id) return method === "No Contest" ? t("card.noContest") : t("card.draw");
  const name = m.winner_id === m.fighter_a_id ? m.fighter_a_name : m.fighter_b_name;
  const how = method && ["KO", "TKO", "Decision", "Disqualification"].includes(method) ? t(`res.method.${method}`) : method;
  const round = m.winner_round && method !== "Decision" ? ` · ${t("common.round", { n: m.winner_round })}` : "";
  return `${t("card.won", { name })}${how ? ` · ${how}` : ""}${round}`;
}
