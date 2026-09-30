/**
 * Fighters (/home/fighters, /home/fighters/kunkhmer, /home/fighters/foreigner): every registered fighter in
 * one compact list (components/fighters/FighterTable.tsx) — real photos or initials, club, weight class,
 * record, status, next bout — with search, filters and "Register fighter". English + Khmer.
 * See claude/updates/admin-fighters-clubs.md.
 */
import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router";
import { Plus, Users } from "lucide-react";
import { api } from "../utils/api";
import { usePermissions } from "../hooks/usePermissions";
import { useT } from "../i18n/program";
import { LangSwitch } from "../components/program/shared";
import { FighterTable } from "../components/fighters/FighterTable";

export function Fighters() {
  const { t } = useT();
  const location = useLocation();
  const permissions = usePermissions();
  const origin = location.pathname.endsWith("/foreigner") ? "foreign" : location.pathname.endsWith("/kunkhmer") ? "local" : "all";
  const [data, setData] = useState<{ fighters: any[]; bouts: any[]; classes: any[] } | null>(null);
  const [failed, setFailed] = useState(false);

  const load = () => {
    setFailed(false);
    Promise.all([api.fighters.list(), api.matches.list().catch(() => []), api.settingsLists.list("weight-classes").catch(() => [])])
      .then(([fighters, bouts, classes]) => setData({ fighters, bouts, classes }))
      .catch(() => setFailed(true));
  };
  useEffect(load, []);

  return (
    <div className="max-w-6xl mx-auto p-4 md:p-8 space-y-6">
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <span className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0" aria-hidden><Users className="w-6 h-6" /></span>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-slate-900">{t("f.title")}</h1>
            <p className="text-base text-slate-600 mt-1">{t("f.lead")}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <LangSwitch />
          {permissions.hasPermission("fighters.create") && (
            <Link to={origin === "foreign" ? "/home/fighters/foreigner/new" : "/home/fighters/kunkhmer/new"} className="inline-flex items-center gap-2 h-11 px-5 rounded-xl bg-primary text-white text-sm font-semibold hover:opacity-90">
              <Plus className="w-4 h-4" aria-hidden /> {t("f.register")}
            </Link>
          )}
        </div>
      </header>

      {failed ? (
        <div role="alert" className="rounded-2xl border border-amber-200 bg-amber-50 p-8 text-center space-y-4">
          <p className="text-amber-900">{t("f.loadFailed")}</p>
          <button type="button" onClick={load} className="h-11 px-5 rounded-xl bg-primary text-white text-sm font-semibold hover:opacity-90">{t("common.tryAgain")}</button>
        </div>
      ) : !data ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-10 flex justify-center"><div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" aria-label={t("common.loading")} /></div>
      ) : (
        // key: switching between the Kun Khmer / Foreigner menu items resets the origin filter.
        <FighterTable
          key={origin}
          fighters={data.fighters}
          bouts={data.bouts}
          classes={data.classes}
          origin={origin}
          canEdit={permissions.hasPermission("fighters.edit")}
          empty={permissions.hasPermission("fighters.create") ? <Link to="/home/fighters/kunkhmer/new" className="inline-flex items-center gap-2 h-11 px-5 rounded-xl bg-primary text-white text-sm font-semibold"><Plus className="w-4 h-4" aria-hidden /> {t("f.register")}</Link> : null}
        />
      )}
    </div>
  );
}
