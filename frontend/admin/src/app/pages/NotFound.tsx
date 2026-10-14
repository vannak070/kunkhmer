/**
 * Page not found (any admin address that doesn't exist): a light page in English + Khmer with the way back
 * (claude/updates/step3-last-pages.md).
 */
import { Link } from "react-router";
import { ArrowLeft, Home, SearchX } from "lucide-react";
import { useT } from "../i18n/program";
import { LangSwitch } from "../components/program/shared";

export function NotFound() {
  const { t } = useT();
  return (
    <div className="min-h-dvh bg-slate-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full rounded-3xl border border-slate-200 bg-white p-8 md:p-10 text-center space-y-5 shadow-sm">
        <div className="flex justify-end"><LangSwitch /></div>
        <span className="mx-auto w-16 h-16 rounded-2xl bg-slate-100 text-slate-500 flex items-center justify-center" aria-hidden><SearchX className="w-8 h-8" /></span>
        <div className="space-y-2">
          <h1 className="text-2xl font-bold text-slate-900">{t("nf.title")}</h1>
          <p className="text-base text-slate-600">{t("nf.text")}</p>
        </div>
        <div className="flex flex-col gap-3">
          <Link to="/home" className="inline-flex items-center justify-center gap-2 h-12 px-6 rounded-xl bg-primary text-white text-base font-semibold hover:opacity-90">
            <Home className="w-5 h-5" aria-hidden /> {t("nf.dashboard")}
          </Link>
          <button type="button" onClick={() => window.history.back()} className="inline-flex items-center justify-center gap-2 h-12 px-6 rounded-xl border border-slate-300 bg-white text-base font-semibold text-slate-800 hover:border-primary hover:text-primary">
            <ArrowLeft className="w-5 h-5" aria-hidden /> {t("nf.back")}
          </button>
        </div>
        <p className="text-sm text-slate-500">{t("nf.help")} <Link to="/home/help" className="font-semibold text-primary hover:underline">{t("nf.openHelp")}</Link></p>
      </div>
    </div>
  );
}
