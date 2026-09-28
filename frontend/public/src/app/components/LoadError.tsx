/** Shown when the federation's data couldn't be loaded, instead of empty lists or an endless spinner. */
import { RefreshCw, WifiOff } from "lucide-react";
import { useI18n } from "../i18n/LanguageContext";

export function LoadError({ onRetry, className = "" }: { onRetry: () => void; className?: string }) {
  const { t } = useI18n();
  return (
    <div role="alert" className={`rounded-2xl border border-amber-200 bg-amber-50 px-5 py-4 flex flex-col sm:flex-row sm:items-center gap-3 ${className}`}>
      <WifiOff className="w-5 h-5 text-amber-700 shrink-0" aria-hidden />
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-amber-900">{t("load.errorTitle")}</p>
        <p className="text-sm text-amber-800">{t("load.errorText")}</p>
      </div>
      <button type="button" onClick={onRetry} className="kk-focus inline-flex items-center justify-center gap-2 h-11 px-4 rounded-xl bg-white border border-amber-300 text-sm font-semibold text-amber-900 hover:bg-amber-100">
        <RefreshCw className="w-4 h-4" aria-hidden /> {t("load.retry")}
      </button>
    </div>
  );
}

/** Accessible loading indicator. */
export function Loading({ className = "py-32" }: { className?: string }) {
  const { t } = useI18n();
  return (
    <div role="status" className={`flex justify-center ${className}`}>
      <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[var(--kk-blue)]" aria-hidden />
      <span className="sr-only">{t("load.loading")}</span>
    </div>
  );
}
