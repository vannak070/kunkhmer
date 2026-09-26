import { publicStatus, PublicStatusTone } from "../utils/publicDisplay";
import { useI18n } from "../i18n/LanguageContext";

const TONE_CLASSES: Record<"light" | "dark", Record<PublicStatusTone, string>> = {
  light: {
    live: "bg-red-600 text-white",
    scheduled: "bg-blue-50 text-blue-700 border border-blue-200",
    pending: "bg-amber-50 text-amber-700 border border-amber-200",
    completed: "bg-gray-100 text-gray-700 border border-gray-200",
    neutral: "bg-gray-100 text-gray-500 border border-gray-200",
  },
  dark: {
    live: "bg-red-600 text-white",
    scheduled: "bg-sky-500/15 text-sky-300 border border-sky-400/30",
    pending: "bg-amber-500/15 text-amber-300 border border-amber-400/30",
    completed: "bg-white/10 text-white/80 border border-white/20",
    neutral: "bg-white/10 text-white/60 border border-white/20",
  },
};

interface PublicStatusBadgeProps {
  status?: string | null;
  /** Use "dark" on dark header backgrounds. */
  surface?: "light" | "dark";
  className?: string;
}

/** Visitor-facing status pill. Renders nothing for internal statuses such as "Published". */
export function PublicStatusBadge({ status, surface = "light", className = "" }: PublicStatusBadgeProps) {
  const { t } = useI18n();
  const s = publicStatus(status);
  if (!s) return null;
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-bold uppercase tracking-wide whitespace-nowrap ${TONE_CLASSES[surface][s.tone]} ${className}`}
    >
      {s.tone === "live" && <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" aria-hidden />}
      {t(s.labelKey)}
    </span>
  );
}
