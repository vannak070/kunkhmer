/**
 * Titles (/home/titles): every championship belt and its champion — the list itself is Champion.tsx. Moved out of the
 * Program page when Program became Matches (claude/updates/matches-menu.md). English + Khmer.
 */
import { Link } from "react-router";
import { Crown, Trophy } from "lucide-react";
import { usePermissions } from "../hooks/usePermissions";
import { useT } from "../i18n/program";
import { LangSwitch } from "../components/program/shared";
import { Champion } from "./Champion";

export function Titles() {
  const { t } = useT();
  const permissions = usePermissions();
  return (
    <div className="max-w-6xl mx-auto p-4 md:p-8 space-y-6">
      <header className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
        <div className="flex items-start gap-3">
          <span className="w-12 h-12 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center shrink-0" aria-hidden><Trophy className="w-6 h-6" /></span>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-slate-900">{t("titles.title")}</h1>
            <p className="text-base text-slate-600 mt-1">{t("titles.subtitle")}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <LangSwitch />
          {permissions.hasPermission("events.create") && (
            <Link to="/home/champion/new" className="inline-flex items-center gap-2 h-11 px-5 rounded-xl bg-primary text-white text-sm font-semibold hover:opacity-90">
              <Crown className="w-4 h-4" aria-hidden /> {t("ov.newTitle")}
            </Link>
          )}
        </div>
      </header>
      <Champion />
    </div>
  );
}
