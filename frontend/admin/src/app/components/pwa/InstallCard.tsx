/**
 * "Put KKF Admin on your phone" card for the dashboard (claude/features/admin-pwa.md):
 *  - Android / Chrome / Edge: an "Install app" button that opens the browser's install window;
 *  - iPhone / iPad (Safari has no install window): three short steps with the Share button;
 *  - hidden once the app is installed (or opened from the icon) and for 30 days after "Not now".
 */
import { useState } from "react";
import { Share, Smartphone, SquarePlus } from "lucide-react";
import { useT } from "../../i18n/program";
import { isIos, promptInstall, usePwa } from "../../pwa/pwa";

const KEY = "kkf_install_hidden_until";

const hidden = () => {
  try {
    return Number(localStorage.getItem(KEY) || 0) > Date.now();
  } catch {
    return false;
  }
};

export function InstallCard() {
  const { t } = useT();
  const { canInstall, installed } = usePwa();
  const [gone, setGone] = useState(hidden);
  const ios = isIos();
  if (installed || gone || (!canInstall && !ios)) return null;

  const notNow = () => {
    try {
      localStorage.setItem(KEY, String(Date.now() + 30 * 24 * 60 * 60 * 1000));
    } catch {}
    setGone(true);
  };

  return (
    <section aria-labelledby="install-title" className="rounded-2xl border border-[#d5e0f3] bg-[#f5f8fd] p-4 md:p-5 flex flex-col sm:flex-row sm:items-center gap-4">
      <span className="w-12 h-12 rounded-xl bg-white border border-[#d5e0f3] text-[#0A3D91] flex items-center justify-center shrink-0" aria-hidden><Smartphone className="w-6 h-6" /></span>
      <div className="min-w-0 flex-1 space-y-1.5">
        <h2 id="install-title" className="text-base font-bold text-slate-900">{canInstall ? t("pwa.installTitle") : t("pwa.iosTitle")}</h2>
        {canInstall ? (
          <p className="text-sm text-slate-600">{t("pwa.installText")}</p>
        ) : (
          <ol className="text-sm text-slate-700 space-y-1.5 list-none">
            <li className="flex items-start gap-2"><Share className="w-4 h-4 mt-0.5 shrink-0 text-[#0A3D91]" aria-hidden /><span>{t("pwa.ios1")}</span></li>
            <li className="flex items-start gap-2"><SquarePlus className="w-4 h-4 mt-0.5 shrink-0 text-[#0A3D91]" aria-hidden /><span>{t("pwa.ios2")}</span></li>
            <li className="flex items-start gap-2"><Smartphone className="w-4 h-4 mt-0.5 shrink-0 text-[#0A3D91]" aria-hidden /><span>{t("pwa.ios3")}</span></li>
          </ol>
        )}
      </div>
      <div className="flex items-center gap-2 shrink-0">
        {canInstall && <button type="button" onClick={() => promptInstall()} className="h-11 px-5 rounded-xl bg-[#0A3D91] text-white text-sm font-semibold hover:bg-[#083073]">{t("pwa.installButton")}</button>}
        <button type="button" onClick={notNow} className="h-11 px-4 rounded-xl border border-slate-300 bg-white text-sm font-semibold text-slate-700 hover:bg-slate-50">{t("pwa.notNow")}</button>
      </div>
    </section>
  );
}
