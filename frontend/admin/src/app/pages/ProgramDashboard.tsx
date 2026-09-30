import { useState, useEffect } from "react";
import { useSearchParams, useNavigate, Link } from "react-router";
import { Activity, Calendar, Crown, Plus, Trophy } from "lucide-react";
import { api } from "../utils/api";
import { usePermissions } from "../hooks/usePermissions";
import { FightNights } from "./FightNights";
import { LangSwitch } from "../components/program/shared";
import { useT } from "../i18n/program";
import { Champion } from "./Champion";
import { ProgramOverview } from "../components/program/ProgramOverview";
import { clsx } from "clsx";

export function ProgramDashboard() {
  const [searchParams, setSearchParams] = useSearchParams();
  const rawTab = searchParams.get("tab") || "overview";
  // The old cross-event "Fight cards" tab is gone: fight cards live on their fight night.
  const activeTab = rawTab === "matches" ? "events" : rawTab;
  const { t } = useT();
  const navigate = useNavigate();
  const permissions = usePermissions();

  // Tab counts only; the Overview loads its own data (components/program/ProgramOverview.tsx).
  const [stats, setStats] = useState({ eventsCount: 0, championsCount: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([api.events.list(), api.champions.list()])
      .then(([events, champions]) => setStats({ eventsCount: events.length, championsCount: champions.length }))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleTabChange = (tabName: string) => {
    setSearchParams({ tab: tabName });
  };

  const getTabClass = (tabName: string) => {
    const isActive = activeTab === tabName;
    return clsx(
      "flex items-center gap-2 px-5 py-3 text-sm font-semibold rounded-xl transition-all duration-200 border cursor-pointer",
      isActive
        ? "bg-primary text-white border-primary shadow-lg shadow-primary/15 scale-[1.02]"
        : "bg-white text-slate-600 border-border hover:bg-slate-50 hover:text-slate-900 hover:border-slate-300"
    );
  };

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-6 min-h-screen bg-[#F8FAFC]">
      
      {/* Header */}
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-200 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 bg-primary/10 text-primary rounded-xl">
              <Calendar className="w-6 h-6" />
            </span>
            <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight">
              {t("program.title")}
            </h1>
          </div>
          <p className="text-sm text-slate-500 mt-1 font-medium pl-10">
            {t("program.subtitle")}
          </p>
        </div>

        {/* Quick actions depending on active view */}
        <div className="flex items-center gap-3 self-end md:self-auto pl-10 md:pl-0">
          <LangSwitch />
          {permissions.hasPermission("events.create") && (
            <>
              {/* The Fight nights list has its own "New fight night" button. */}
              {activeTab === "overview" && (
                <Link to="/home/events/new" className="inline-flex items-center gap-2 h-11 px-5 rounded-xl bg-primary text-white text-sm font-semibold hover:opacity-90">
                  <Plus className="w-4 h-4" /> {t("list.new")}
                </Link>
              )}
              {activeTab === "champions" && (
                <Link to="/home/champion/new" className="inline-flex items-center gap-2 h-11 px-5 rounded-xl bg-primary text-white text-sm font-semibold hover:opacity-90">
                  <Crown className="w-4 h-4" /> {t("ov.newTitle")}
                </Link>
              )}
            </>
          )}
        </div>
      </header>

      {/* Tabs list */}
      <div className="flex flex-wrap gap-2.5">
        <button onClick={() => handleTabChange("overview")} className={getTabClass("overview")}>
          <Activity className="w-4 h-4" />
          {t("program.tab.overview")}
        </button>
        <button onClick={() => handleTabChange("events")} className={getTabClass("events")}>
          <Calendar className="w-4 h-4" />
          {t("program.tab.fightNights")}
          {stats.eventsCount > 0 && (
            <span className={clsx("ml-1.5 px-2 py-0.5 text-[10px] rounded-full font-bold", activeTab === "events" ? "bg-white text-primary" : "bg-slate-100 text-slate-600")}>
              {stats.eventsCount}
            </span>
          )}
        </button>
        <button onClick={() => handleTabChange("champions")} className={getTabClass("champions")}>
          <Trophy className="w-4 h-4" />
          {t("program.tab.champions")}
          {stats.championsCount > 0 && (
            <span className={clsx("ml-1.5 px-2 py-0.5 text-[10px] rounded-full font-bold", activeTab === "champions" ? "bg-white text-primary" : "bg-slate-100 text-slate-600")}>
              {stats.championsCount}
            </span>
          )}
        </button>
      </div>

      {/* Main content display */}
      <div className="bg-transparent rounded-2xl">
        {loading ? (
          <div className="py-24 text-center bg-white rounded-2xl border border-slate-100 shadow-sm">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            <p className="text-sm text-slate-500 mt-4 font-semibold">{t("common.loading")}</p>
          </div>
        ) : (
          <>
            {activeTab === "overview" && <ProgramOverview />}

            {activeTab === "events" && <FightNights />}


            {activeTab === "champions" && <Champion embedded={true} />}
          </>
        )}
      </div>

    </div>
  );
}

function ChevronRightIcon({ className }: { className?: string }) {
  return (
    <svg 
      xmlns="http://www.w3.org/2050/svg" 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2.5" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      className={className}
    >
      <path d="m9 18 6-6-6-6" />
    </svg>
  );
}
