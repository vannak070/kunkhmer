import { Link } from "react-router";
import { ExternalLink, FlaskConical, PlayCircle, Tv } from "lucide-react";
import { useI18n } from "../../i18n/LanguageContext";
import type { MessageKey } from "../../i18n/messages";
import type { Bout, BoutOutcome, Broadcaster } from "../../data/fanData";
import { getFighterSlug } from "../../data/masterData";

const OUTCOME_STYLE: Record<BoutOutcome, string> = {
  win: "bg-emerald-600 text-white",
  loss: "bg-rose-600 text-white",
  draw: "bg-amber-500 text-white",
  nc: "bg-gray-400 text-white",
};

const OUTCOME_KEY: Record<BoutOutcome, { short: MessageKey; long: MessageKey }> = {
  win: { short: "outcome.win", long: "outcome.winLong" },
  loss: { short: "outcome.loss", long: "outcome.lossLong" },
  draw: { short: "outcome.draw", long: "outcome.drawLong" },
  nc: { short: "outcome.nc", long: "outcome.ncLong" },
};

export function OutcomeBadge({ outcome, size = "md" }: { outcome: BoutOutcome; size?: "sm" | "md" }) {
  const { t } = useI18n();
  return (
    <span
      title={t(OUTCOME_KEY[outcome].long)}
      className={`inline-flex items-center justify-center rounded-md font-black ${OUTCOME_STYLE[outcome]} ${
        size === "sm" ? "min-w-5 h-5 px-1 text-[10px]" : "min-w-8 h-8 px-1.5 text-xs"
      }`}
    >
      {t(OUTCOME_KEY[outcome].short)}
    </span>
  );
}

/** Last results as small badges, newest first. Renders nothing without history. */
export function FormGuide({ form, label = true }: { form: BoutOutcome[]; label?: boolean }) {
  const { t } = useI18n();
  if (form.length === 0) return <span className="text-xs text-gray-400">—</span>;
  return (
    <div className="flex items-center gap-1" aria-label={`${t("history.form")}: ${form.map((o) => t(OUTCOME_KEY[o].long)).join(", ")}`}>
      {label && <span className="sr-only">{t("history.form")}</span>}
      {form.map((o, i) => (
        <OutcomeBadge key={i} outcome={o} size="sm" />
      ))}
    </div>
  );
}

/** "KO · R2 · 1:45", "Decision", "Draw". */
export function useResultText() {
  const { t } = useI18n();
  return (bout: Bout): string => {
    const method = (bout.method || "").trim();
    if (method.toLowerCase() === "draw" || (!bout.winnerId && !method)) return t("result.draw");
    if (method.toLowerCase() === "no contest") return t("result.noContest");
    const parts = [method.toLowerCase() === "decision" ? t("result.decision") : method];
    if (bout.round && method.toLowerCase() !== "decision") parts.push(t("result.round", { n: bout.round }));
    if (bout.time) parts.push(bout.time);
    return parts.filter(Boolean).join(" · ");
  };
}

/** Whole days from today until a calendar date (0 = today). */
export function daysUntil(date?: string | null): number | null {
  if (!date) return null;
  const d = new Date(date);
  if (isNaN(d.getTime())) return null;
  const target = Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate());
  const now = new Date();
  const today = Date.UTC(now.getFullYear(), now.getMonth(), now.getDate());
  return Math.round((target - today) / 86_400_000);
}

export function CountdownChip({ date, surface = "light", className = "" }: { date?: string | null; surface?: "light" | "dark"; className?: string }) {
  const { t, tn } = useI18n();
  const days = daysUntil(date);
  if (days == null || days < 0) return null;
  const label = days === 0 ? t("countdown.today") : days === 1 ? t("countdown.tomorrow") : tn("countdown.days", days);
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold ${
        days === 0
          ? "bg-red-600 text-white"
          : surface === "dark"
            ? "bg-[#F2C94C] text-[#051C42]"
            : "bg-[#F2C94C]/20 text-[#7A5B00] border border-[#F2C94C]/50"
      } ${className}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${days === 0 ? "bg-white animate-pulse" : "bg-current"}`} aria-hidden />
      {label}
    </span>
  );
}

export function WhereToWatch({ broadcaster, stationName }: { broadcaster: Broadcaster | null; stationName?: string }) {
  const { t } = useI18n();
  const name = broadcaster?.name || stationName;
  return (
    <section className="bg-white rounded-2xl border border-gray-100 shadow-lg p-6 md:p-8">
      <h2 className="flex items-center gap-2 text-lg font-black text-gray-900 mb-4">
        <Tv className="w-5 h-5 text-orange-500" aria-hidden />
        {t("watch.title")}
      </h2>
      {name ? (
        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
          <div className="flex items-center gap-4 flex-1 min-w-0">
            <div className="w-16 h-16 rounded-xl border border-gray-200 bg-white overflow-hidden flex items-center justify-center shrink-0">
              {broadcaster?.logo ? (
                <img src={broadcaster.logo} alt="" className="w-full h-full object-contain" />
              ) : (
                <Tv className="w-7 h-7 text-gray-300" aria-hidden />
              )}
            </div>
            <div className="min-w-0">
              <p className="font-black text-gray-900">{t("watch.live", { name })}</p>
              {(broadcaster?.type || broadcaster?.reach) && (
                <p className="text-sm text-gray-500">{[broadcaster?.type, broadcaster?.reach].filter(Boolean).join(" · ")}</p>
              )}
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            {broadcaster?.streamUrl && (
              <a
                href={broadcaster.streamUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl text-sm font-bold transition-colors"
              >
                <PlayCircle className="w-4 h-4" aria-hidden />
                {t("watch.stream")}
              </a>
            )}
            {broadcaster?.websiteUrl && (
              <a
                href={broadcaster.websiteUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2.5 border border-gray-200 hover:border-[#0A3D91] text-gray-700 hover:text-[#0A3D91] rounded-xl text-sm font-bold transition-colors"
              >
                <ExternalLink className="w-4 h-4" aria-hidden />
                {t("watch.website")}
              </a>
            )}
          </div>
        </div>
      ) : (
        <p className="text-sm text-gray-500">{t("watch.tba")}</p>
      )}
    </section>
  );
}

export function DemoBanner({ show }: { show: boolean }) {
  const { t } = useI18n();
  if (!show) return null;
  return (
    <div role="status" className="flex items-start gap-2 px-4 py-3 rounded-xl bg-violet-50 border border-violet-200 text-violet-800 text-sm font-semibold">
      <FlaskConical className="w-4 h-4 mt-0.5 shrink-0" aria-hidden />
      {t("demo.banner")}
    </div>
  );
}

/** Compact result line for lists: winner highlighted, method underneath. */
export function ResultRow({ bout }: { bout: Bout }) {
  const { localName, formatDate } = useI18n();
  const resultText = useResultText();
  const side = (f: Bout["fighterA"], align: "left" | "right") => {
    const won = bout.winnerId === f.id;
    const lost = bout.winnerId && !won;
    return (
      <Link
        to={`/fighters/${getFighterSlug(f)}`}
        className={`flex items-center gap-2.5 min-w-0 ${align === "right" ? "flex-row-reverse text-right" : ""} ${lost ? "opacity-55" : ""}`}
      >
        <img src={f.image} alt="" className={`w-10 h-10 rounded-full object-cover shrink-0 border-2 ${won ? "border-emerald-500" : "border-gray-200"}`} />
        <span className={`truncate text-sm ${won ? "font-black text-gray-900" : "font-semibold text-gray-600"}`}>
          {localName(f.name, f.nameKhmer)}
        </span>
      </Link>
    );
  };
  return (
    <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-3 py-3">
      {side(bout.fighterA, "left")}
      <div className="text-center">
        <p className="text-xs font-black text-gray-900 whitespace-nowrap">{resultText(bout)}</p>
        <p className="text-[10px] text-gray-400 font-semibold whitespace-nowrap">{formatDate(bout.date)}</p>
      </div>
      {side(bout.fighterB, "right")}
    </div>
  );
}
