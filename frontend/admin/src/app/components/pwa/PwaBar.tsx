/**
 * Two small notices at the top of every admin screen (claude/features/admin-pwa.md):
 *  - no internet: the app still opens, but nothing can be saved;
 *  - a new version is ready: shown only when the officer taps "Update now" (never changes a screen on its own).
 */
import { RefreshCw, WifiOff } from "lucide-react";
import { useT } from "../../i18n/program";
import { applyUpdate, usePwa } from "../../pwa/pwa";

export function PwaBar() {
  const { t } = useT();
  const { offline, updateReady } = usePwa();
  if (!offline && !updateReady) return null;
  return (
    <div className="shrink-0">
      {offline && (
        <div role="status" className="flex items-start gap-2.5 bg-amber-50 border-b border-amber-200 px-4 py-2.5 text-sm text-amber-900">
          <WifiOff className="w-4 h-4 mt-0.5 shrink-0" aria-hidden />
          <span>{t("pwa.offline")}</span>
        </div>
      )}
      {updateReady && (
        <div role="status" className="flex flex-wrap items-center justify-between gap-2 bg-[#eef3fb] border-b border-[#d5e0f3] px-4 py-2 text-sm text-[#0A3D91]">
          <span className="flex items-center gap-2 font-medium"><RefreshCw className="w-4 h-4 shrink-0" aria-hidden />{t("pwa.update")}</span>
          <button type="button" onClick={applyUpdate} className="h-10 px-4 rounded-lg bg-[#0A3D91] text-white font-semibold hover:bg-[#083073]">{t("pwa.updateNow")}</button>
        </div>
      )}
    </div>
  );
}
