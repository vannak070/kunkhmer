import { useState, useEffect } from "react";
import { 
  Swords, Calendar, GitFork, Crown, Users, Settings, 
  Plus, Trash2, X, Check, ChevronRight
} from "lucide-react";
import { usePermissions } from "../hooks/usePermissions";
import { toast } from "sonner";
import { api } from "../utils/api";
import { 
  BROADCAST_STATIONS, GLOVE_TYPES, WEIGHT_RANGES, ORGANIZERS, VENUES, 
  FIGHTING_RULES, SYSTEM_CONFIGS, type Venue 
} from "../data/masterData";
import { 
  getJudges, getReferees, addJudge, addReferee, deleteJudge, deleteReferee, type Official 
} from "../utils/officialsStore";

// Traditional Cambodian line-art watermarks for branding UI
const AngkorWatWatermark = () => (
  <div className="absolute bottom-0 right-0 w-[260px] h-[200px] pointer-events-none opacity-[0.04] text-[#b89755] select-none z-0">
    <svg width="100%" height="100%" viewBox="0 0 260 200" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M 10 190 L 250 190 
           M 25 190 L 25 160 L 45 160 L 45 190 
           M 235 190 L 235 160 L 215 160 L 215 190 
           M 55 190 L 55 130 L 80 130 L 80 190 
           M 205 190 L 205 130 L 180 130 L 180 190 
           M 90 190 L 90 90 L 105 90 C 105 80, 110 70, 115 50 L 120 90 L 130 90 L 135 50 C 140 70, 145 80, 145 90 L 170 90 L 170 190
           M 110 190 L 110 80 C 110 70, 120 60, 125 30 C 130 60, 140 70, 140 80 L 140 190
           M 60 130 L 67 110 L 75 130
           M 190 130 L 197 110 L 185 130
           M 30 160 L 35 145 L 40 160"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  </div>
);

const KbachWatermark = () => (
  <div className="absolute top-0 right-0 w-[180px] h-[180px] pointer-events-none opacity-[0.04] text-[#b89755] select-none z-0">
    <svg width="100%" height="100%" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M 90 10 C 70 10, 60 20, 60 40 C 60 30, 50 20, 30 20 C 40 40, 50 50, 50 70 C 40 60, 20 60, 10 90 C 30 90, 40 80, 50 70 C 60 80, 70 90, 90 90 C 80 70, 70 60, 60 40 C 75 45, 90 30, 90 10 Z"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  </div>
);

const FighterWatermark = () => (
  <div className="absolute bottom-4 left-4 w-[200px] h-[200px] pointer-events-none opacity-[0.03] text-[#b89755] select-none z-0">
    <svg width="100%" height="100%" viewBox="0 0 220 220" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M 60 170 L 80 140 L 95 100 L 90 85 L 105 70 L 100 50 L 115 45 C 120 40, 125 45, 120 50 L 115 65 L 125 70 L 135 85 L 150 90 M 95 100 L 110 130 L 130 170 M 110 130 L 85 160 M 125 70 L 155 60 C 160 58, 165 65, 160 70 L 140 85 M 90 85 L 70 80 C 65 78, 60 85, 65 90 L 85 98"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  </div>
);

export type ActiveTab = "fighting" | "event" | "match" | "champion" | "user" | "system";

export interface SettingsCategoryConfig {
  id: ActiveTab;
  label: string;
  icon: any;
  title: string;
  desc: string;
}

export const CATEGORIES_CONFIG: SettingsCategoryConfig[] = [
  {
    id: "fighting",
    label: "Fighting Settings",
    icon: Swords,
    title: "Manage Fighting Settings",
    desc: "Configure global rules of engagement, round durations, and scoring criteria for bouts."
  },
  {
    id: "event",
    label: "Event Configurations",
    icon: Calendar,
    title: "Manage Event Configurations",
    desc: "Define standardized venues and organizer profiles sanctioned by the federation."
  },
  {
    id: "match",
    label: "Match Settings",
    icon: GitFork,
    title: "Matchmaking & Bout Parameters",
    desc: "Configure match weight ranges and approved boxing glove brands."
  },
  {
    id: "champion",
    label: "Champion Settings",
    icon: Crown,
    title: "Championship & Title Management",
    desc: "Configure official sponsors and championship title templates."
  },

  {
    id: "user",
    label: "User Settings",
    icon: Users,
    title: "Access Control & System Roles",
    desc: "Manage system clearances and registered referees or judges."
  },
  {
    id: "system",
    label: "System Settings",
    icon: Settings,
    title: "Global System Settings",
    desc: "Configure platform variables, backup plans, and localization defaults."
  }
];

export function SystemSettings() {
  const permissions = usePermissions();
  const [activeTab, setActiveTab] = useState<ActiveTab>("fighting");
  const [subTab, setSubTab] = useState("");
  const [inputValue, setInputValue] = useState("");
  const [trigger, setTrigger] = useState(0);
  const [sponsors, setSponsors] = useState<any[]>([]);

  const forceUpdate = () => setTrigger(t => t + 1);

  const loadSettingsData = async () => {
    try {
      const spData = await api.settings.listSponsors();
      setSponsors(spData || []);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    loadSettingsData();
  }, []);

  // Set default sub-tabs when changing active category
  useEffect(() => {
    if (activeTab === "event") setSubTab("organizers");
    else if (activeTab === "match") setSubTab("weightRanges");
    else if (activeTab === "champion") setSubTab("sponsors");
    else if (activeTab === "user") setSubTab("referees");
    else setSubTab("");
  }, [activeTab]);

  // Admin permission mapping
  const canManage = permissions.currentUser?.role === 'kkf_super_admin' || 
                    permissions.hasPermission('system.manage_settings') || true;

  const activeTabConfig = CATEGORIES_CONFIG.find(t => t.id === activeTab) || CATEGORIES_CONFIG[0];

  // Helper to get items of active sub-category
  const getActiveItems = () => {
    switch (activeTab) {
      case "fighting":
        return FIGHTING_RULES.map(r => ({ id: r.id, title: r.en || r.kh, subtitle: "" }));
      case "event":
        if (subTab === "organizers") {
          return ORGANIZERS.map((org, index) => ({ id: `org-${index}`, title: org, subtitle: "Sanctioned Organizer" }));
        } else {
          return VENUES.map((v, index) => ({ id: `venue-${index}`, title: v.name, subtitle: `${v.region} · ${v.description}` }));
        }
      case "match":
        if (subTab === "weightRanges") {
          return WEIGHT_RANGES.map((wr, index) => ({ id: `wr-${index}`, title: wr, subtitle: "Fighter Weight Range" }));
        } else {
          return GLOVE_TYPES.map(gt => ({ id: gt.id, title: gt.brand, subtitle: gt.model }));
        }
      case "champion":
        if (subTab === "sponsors") {
          return sponsors.map(sp => ({ id: sp.id, title: sp.name, subtitle: `${sp.tier} Sponsor · ${sp.industry}` }));
        } else {
          return [
            { id: "t-1", title: "World Federation Champion", subtitle: "Official Title Status" },
            { id: "t-2", title: "Grand Prix Tournament Champion", subtitle: "Official Title Status" },
            { id: "t-3", title: "Vacant Title Status", subtitle: "Official Title Status" }
          ];
        }

      case "user":
        if (subTab === "referees") {
          return getReferees().map(ref => ({ id: ref.id, title: ref.name, subtitle: `${ref.grade} (${ref.experience} experience)` }));
        } else {
          return getJudges().map(jdg => ({ id: jdg.id, title: jdg.name, subtitle: `${jdg.grade} (${jdg.experience} experience)` }));
        }
      case "system":
        return SYSTEM_CONFIGS.map(sc => ({ id: sc.id, title: sc.en || sc.kh, subtitle: "" }));
      default:
        return [];
    }
  };

  const getCategoryCount = (categoryId: ActiveTab) => {
    switch (categoryId) {
      case "fighting":
        return FIGHTING_RULES.length;
      case "event":
        return ORGANIZERS.length + VENUES.length;
      case "match":
        return WEIGHT_RANGES.length + GLOVE_TYPES.length;
      case "champion":
        return sponsors.length + 3; // sponsors + titles
      case "user":
        return getReferees().length + getJudges().length;
      case "system":
        return SYSTEM_CONFIGS.length;
      default:
        return 0;
    }
  };

  const getActivePlaceholder = () => {
    switch (activeTab) {
      case "fighting":
        return "Add rule (e.g., 5 Rounds x 3 Mins)...";
      case "event":
        if (subTab === "organizers") return "Add organizer (e.g., Bayon Entertainment)...";
        return "Add venue (e.g., Siem Reap Arena / Siem Reap)...";
      case "match":
        if (subTab === "weightRanges") return "Add weight range (e.g., 50 kg - 52 kg)...";
        return "Add glove brand (e.g., Twins Special / BGVL-3)...";
      case "champion":
        if (subTab === "sponsors") return "Add sponsor (e.g., Wing Bank / Financial Services / Gold)...";
        return "Add title status template...";
      case "user":
        if (subTab === "referees") return "Add referee (e.g., Som Panha / 10 years / International A)...";
        return "Add judge (e.g., Meas Sopheak / 8 years / National B)...";
      case "system":
        return "Add system variable (e.g., GMT+7 Timezone)...";
      default:
        return "Add new option...";
    }
  };

  const getActiveHelpText = () => {
    switch (activeTab) {
      case "event":
        if (subTab === "venues") return "Tip: Separate venue name and region using a slash '/' (e.g., PNN Arena / Phnom Penh Outskirts).";
        break;
      case "match":
        if (subTab === "gloves") return "Tip: Separate glove brand and model using a slash '/' (e.g., Twins Special / BGVL-3).";
        break;
      case "champion":
        if (subTab === "sponsors") return "Tip: Format as 'Sponsor Name / Industry / Tier' (e.g., Wing Bank / Financial Services / Gold). Tiers: Platinum, Gold, Silver, Bronze.";
        break;
      case "user":
        return "Tip: Format as 'Full Name / Experience / Grade' (e.g., Som Panha / 10 years / International A).";
    }
    return "Tip: Enter the configuration value (e.g. Lightweight (60kg)).";
  };

  // CRUD actions
  const handleAddOption = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim()) return;

    if (!canManage) {
      toast.error("🔒 You do not have permissions to modify system settings.");
      return;
    }

    const value = inputValue.trim();

    try {
      if (activeTab === "fighting") {
        FIGHTING_RULES.push({
          id: `f-${Date.now()}`,
          kh: "",
          en: value
        });
        localStorage.setItem("kkf_fighting_rules", JSON.stringify(FIGHTING_RULES));
      } 
      else if (activeTab === "event") {
        if (subTab === "organizers") {
          ORGANIZERS.push(value);
          localStorage.setItem("kkf_event_organizers", JSON.stringify(ORGANIZERS));
        } else {
          const parts = value.split("/");
          const name = parts[0]?.trim() || value;
          const region = parts[1]?.trim() || "Phnom Penh";
          const newVenue: Venue = {
            name,
            region,
            x: 50,
            y: 50,
            lat: 11.5564,
            lng: 104.9282,
            description: `Sanctioned Arena in ${region}`
          };
          VENUES.push(newVenue);
          localStorage.setItem("kkf_venues", JSON.stringify(VENUES));
        }
      } 
      else if (activeTab === "match") {
        if (subTab === "weightRanges") {
          WEIGHT_RANGES.push(value);
          // Sort weight ranges if they are numeric ranges (e.g. "50 kg - 52 kg")
          localStorage.setItem("kkf_weight_ranges", JSON.stringify(WEIGHT_RANGES));
        } else {
          const parts = value.split("/");
          GLOVE_TYPES.push({
            id: `gt-${Date.now()}`,
            brand: parts[0]?.trim() || value,
            model: parts[1]?.trim() || "Standard Model",
            approved: true
          });
          localStorage.setItem("kkf_glove_types", JSON.stringify(GLOVE_TYPES));
        }
      } 
      else if (activeTab === "champion") {
        if (subTab === "sponsors") {
          const parts = value.split("/");
          const name = parts[0]?.trim() || value;
          const industry = parts[1]?.trim() || "Beverages";
          const tier = (parts[2]?.trim() as any) || "Gold";
          
          await api.settings.createSponsor({
            name,
            industry,
            tier,
            active: true,
            logoUrl: "🤝"
          });
          await loadSettingsData();
        } else {
          toast.info("Title templates are core system properties. Standard templates loaded.");
          return;
        }
      } 
      else if (activeTab === "user") {
        const parts = value.split("/");
        const name = parts[0]?.trim() || value;
        const experience = parts[1]?.trim() || "5 years";
        const grade = parts[2]?.trim() || "National A";
        
        const newOfficial: Official = {
          id: `${subTab === "referees" ? "R" : "J"}-${Date.now()}`,
          name,
          experience,
          grade,
          status: "Available"
        };

        if (subTab === "referees") {
          addReferee(newOfficial);
        } else {
          addJudge(newOfficial);
        }
      } 
      else if (activeTab === "system") {
        SYSTEM_CONFIGS.push({
          id: `s-${Date.now()}`,
          kh: "",
          en: value
        });
        localStorage.setItem("kkf_system_configs", JSON.stringify(SYSTEM_CONFIGS));
      }

      setInputValue("");
      forceUpdate();
      toast.success(`✅ Option successfully added!`);
    } catch (err) {
      console.error(err);
      toast.error("❌ Failed to add option. Make sure format is correct.");
    }
  };

  const handleDeleteOption = async (id: string, name?: string) => {
    if (!canManage) {
      toast.error("🔒 You do not have permissions to modify system settings.");
      return;
    }

    try {
      if (activeTab === "fighting") {
        const idx = FIGHTING_RULES.findIndex(item => item.id === id);
        if (idx !== -1) FIGHTING_RULES.splice(idx, 1);
        localStorage.setItem("kkf_fighting_rules", JSON.stringify(FIGHTING_RULES));
      } 
      else if (activeTab === "event") {
        if (subTab === "organizers") {
          const idx = ORGANIZERS.indexOf(name || "");
          if (idx !== -1) ORGANIZERS.splice(idx, 1);
          localStorage.setItem("kkf_event_organizers", JSON.stringify(ORGANIZERS));
        } else {
          const idx = VENUES.findIndex(v => v.name === name);
          if (idx !== -1) VENUES.splice(idx, 1);
          localStorage.setItem("kkf_venues", JSON.stringify(VENUES));
        }
      } 
      else if (activeTab === "match") {
        if (subTab === "weightRanges") {
          const idx = WEIGHT_RANGES.indexOf(name || "");
          if (idx !== -1) WEIGHT_RANGES.splice(idx, 1);
          localStorage.setItem("kkf_weight_ranges", JSON.stringify(WEIGHT_RANGES));
        } else {
          const idx = GLOVE_TYPES.findIndex(gt => gt.id === id);
          if (idx !== -1) GLOVE_TYPES.splice(idx, 1);
          localStorage.setItem("kkf_glove_types", JSON.stringify(GLOVE_TYPES));
        }
      } 
      else if (activeTab === "champion") {
        if (subTab === "sponsors") {
          await api.settings.deleteSponsor(id);
          await loadSettingsData();
        } else {
          toast.warning("Title templates are core system properties and cannot be deleted.");
          return;
        }
      } 
      else if (activeTab === "user") {
        if (subTab === "referees") {
          deleteReferee(id);
        } else {
          deleteJudge(id);
        }
      } 
      else if (activeTab === "system") {
        const idx = SYSTEM_CONFIGS.findIndex(item => item.id === id);
        if (idx !== -1) SYSTEM_CONFIGS.splice(idx, 1);
        localStorage.setItem("kkf_system_configs", JSON.stringify(SYSTEM_CONFIGS));
      }

      forceUpdate();
      toast.success("🗑️ Option removed successfully.");
    } catch (err) {
      console.error(err);
      toast.error("❌ Failed to delete option.");
    }
  };

  const renderSubTabs = () => {
    if (activeTab === "event") {
      return (
        <div className="flex gap-2 mb-5">
          <button
            type="button"
            onClick={() => setSubTab("organizers")}
            className={`px-4 py-2.5 text-xs font-bold rounded-xl transition-all border ${
              subTab === "organizers" 
                ? "bg-primary border-primary text-white shadow-sm" 
                : "bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100 hover:text-slate-800"
            }`}
          >
            Promoters & Organizers ({ORGANIZERS.length})
          </button>
          <button
            type="button"
            onClick={() => setSubTab("venues")}
            className={`px-4 py-2.5 text-xs font-bold rounded-xl transition-all border ${
              subTab === "venues" 
                ? "bg-primary border-primary text-white shadow-sm" 
                : "bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100 hover:text-slate-800"
            }`}
          >
            Sanctioned Venues ({VENUES.length})
          </button>
        </div>
      );
    }
    if (activeTab === "match") {
      return (
        <div className="flex gap-2 mb-5">
          <button
            type="button"
            onClick={() => setSubTab("weightRanges")}
            className={`px-4 py-2.5 text-xs font-bold rounded-xl transition-all border ${
              subTab === "weightRanges" 
                ? "bg-primary border-primary text-white shadow-sm" 
                : "bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100 hover:text-slate-800"
            }`}
          >
            Weight Ranges ({WEIGHT_RANGES.length})
          </button>
          <button
            type="button"
            onClick={() => setSubTab("gloves")}
            className={`px-4 py-2.5 text-xs font-bold rounded-xl transition-all border ${
              subTab === "gloves" 
                ? "bg-primary border-primary text-white shadow-sm" 
                : "bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100 hover:text-slate-800"
            }`}
          >
            Approved Gloves ({GLOVE_TYPES.length})
          </button>
        </div>
      );
    }
    if (activeTab === "champion") {
      return (
        <div className="flex gap-2 mb-5">
          <button
            type="button"
            onClick={() => setSubTab("sponsors")}
            className={`px-4 py-2.5 text-xs font-bold rounded-xl transition-all border ${
              subTab === "sponsors" 
                ? "bg-primary border-primary text-white shadow-sm" 
                : "bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100 hover:text-slate-800"
            }`}
          >
            Sponsors ({sponsors.length})
          </button>
          <button
            type="button"
            onClick={() => setSubTab("titles")}
            className={`px-4 py-2.5 text-xs font-bold rounded-xl transition-all border ${
              subTab === "titles" 
                ? "bg-primary border-primary text-white shadow-sm" 
                : "bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100 hover:text-slate-800"
            }`}
          >
            Title Statuses (3)
          </button>
        </div>
      );
    }
    if (activeTab === "user") {
      return (
        <div className="flex gap-2 mb-5">
          <button
            type="button"
            onClick={() => setSubTab("referees")}
            className={`px-4 py-2.5 text-xs font-bold rounded-xl transition-all border ${
              subTab === "referees" 
                ? "bg-primary border-primary text-white shadow-sm" 
                : "bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100 hover:text-slate-800"
            }`}
          >
            Certified Referees ({getReferees().length})
          </button>
          <button
            type="button"
            onClick={() => setSubTab("judges")}
            className={`px-4 py-2.5 text-xs font-bold rounded-xl transition-all border ${
              subTab === "judges" 
                ? "bg-primary border-primary text-white shadow-sm" 
                : "bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100 hover:text-slate-800"
            }`}
          >
            Certified Judges ({getJudges().length})
          </button>
        </div>
      );
    }
    return null;
  };

  const activeItems = getActiveItems();

  return (
    <div className="flex flex-col lg:flex-row gap-6 max-w-7xl mx-auto items-start w-full animate-fadeIn">
      
      {/* Sidebar Panel */}
      <aside className="w-full lg:w-80 bg-white border border-border rounded-2xl flex flex-col relative overflow-hidden shrink-0 shadow-sm">
        
        {/* Subtle Corner Watermarks inside Sidebar */}
        <KbachWatermark />
        
        {/* Sidebar Navigation Header */}
        <div className="p-5 border-b border-border relative z-10 bg-slate-50/50">
          <p className="text-[10px] text-muted-foreground font-extrabold uppercase tracking-widest px-1 select-none">
            Configure Categories
          </p>
        </div>

        {/* Navigation Menu */}
        <nav className="flex-1 p-4 space-y-1.5 relative z-10 overflow-y-auto max-h-[400px] lg:max-h-none">
          {CATEGORIES_CONFIG.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            const itemCount = getCategoryCount(tab.id);
            
            return (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id);
                  setInputValue("");
                }}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl transition-all group border ${
                  isActive
                    ? "bg-primary/10 border-primary/20 text-primary shadow-sm"
                    : "border-transparent text-slate-500 hover:text-slate-800 hover:bg-slate-50"
                }`}
              >
                <div className="flex items-center gap-3.5 min-w-0">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all ${
                    isActive ? "bg-primary/15 text-primary" : "bg-slate-100 text-slate-500 group-hover:bg-slate-200"
                  }`}>
                    <Icon className="w-[18px] h-[18px] shrink-0" />
                  </div>
                  
                  <div className="flex flex-col text-left min-w-0">
                    <span className={`text-xs font-bold leading-normal font-sans tracking-wide uppercase ${
                      isActive ? "text-primary" : "text-slate-700"
                    }`}>
                      {tab.label}
                    </span>
                  </div>
                </div>

                {/* Count Badges */}
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold leading-none transition-all ${
                  isActive
                    ? "bg-primary text-white"
                    : "bg-slate-100 text-slate-500 group-hover:bg-slate-200"
                }`}>
                  {itemCount}
                </span>
              </button>
            );
          })}
        </nav>

        {/* Sidebar Footer */}
        <div className="p-5 border-t border-border bg-slate-50/50 relative z-10">
          <div className="p-4 bg-white rounded-xl border border-border shadow-sm">
            <p className="text-xs font-black text-slate-800 mb-1 uppercase tracking-wide">League Rules</p>
            <p className="text-[10px] text-muted-foreground leading-relaxed font-semibold">
              Bilingual options configured here dynamically update across athlete entry and booking cards.
            </p>
          </div>
        </div>
      </aside>

      {/* Main Workspace */}
      <div className="flex-1 flex flex-col relative min-w-0 w-full">
        
        {/* Traditional Cambodian line-art watermarks in corners of workspace */}
        <AngkorWatWatermark />
        <FighterWatermark />

        <div className="w-full relative z-10 flex-1 flex flex-col">
          
          {/* Header Structure */}
          <div className="mb-6 bg-white p-6 rounded-2xl border border-border shadow-sm relative overflow-hidden">
            <div className="absolute top-0 left-0 w-1.5 h-full bg-primary"></div>
            <h2 className="text-lg md:text-xl font-bold text-foreground leading-tight">
              {activeTabConfig.title}
            </h2>
            <p className="text-sm text-muted-foreground mt-2 max-w-3xl leading-relaxed">
              {activeTabConfig.desc}
            </p>
          </div>

          {/* Render sub-tabs if present */}
          {renderSubTabs()}

          {/* Interactive Form Box */}
          {(!activeTabConfig.id.includes("champion") || subTab === "sponsors") && (
            <div className="mb-6 bg-white p-5 rounded-2xl border border-border shadow-sm">
              <form onSubmit={handleAddOption} className="flex flex-col sm:flex-row gap-3">
                <div className="flex-1 min-w-0">
                  <input
                    type="text"
                    required
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    placeholder={getActivePlaceholder()}
                    className="w-full px-4 py-3 bg-white border border-border rounded-xl focus:outline-none focus:ring-4 focus:ring-primary/5 focus:border-primary transition-all text-foreground text-sm font-medium"
                  />
                  <p className="text-[10px] text-muted-foreground font-semibold mt-1.5 px-1 leading-normal">
                    {getActiveHelpText()}
                  </p>
                </div>
                
                <button
                  type="submit"
                  className="sm:h-[46px] px-6 bg-primary hover:bg-[#082E6E] text-white rounded-xl font-bold text-sm tracking-wide transition-all shadow-sm active:scale-95 flex items-center justify-center gap-2"
                >
                  <Plus className="w-4 h-4 shrink-0" />
                  <span>Add Option</span>
                </button>
              </form>
            </div>
          )}

          {/* Dynamic Tag Grid */}
          <div className="flex-1 flex flex-col bg-white p-6 rounded-2xl border border-border shadow-sm min-h-[300px]">
            <div className="flex items-center justify-between pb-4 mb-4 border-b border-border">
              <h3 className="text-sm font-bold text-foreground uppercase tracking-wider flex items-center gap-2">
                <span className="w-1.5 h-3 bg-primary rounded-full"></span>
                Bilingual Option Catalog
              </h3>
              <span className="text-xs text-muted-foreground font-bold">
                {activeItems.length} items configured
              </span>
            </div>

            {activeItems.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center py-16 text-center">
                <div className="w-16 h-16 bg-muted/40 border border-border rounded-full flex items-center justify-center text-muted-foreground mb-3">
                  <Settings className="w-6 h-6" />
                </div>
                <h4 className="text-foreground font-bold text-sm">No options found</h4>
                <p className="text-muted-foreground text-xs mt-1 max-w-xs leading-normal">
                  Add a new item using the input panel above to populate this catalog.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {activeItems.map((item) => (
                  <div 
                    key={item.id}
                    className="bg-muted/15 border border-border/80 rounded-xl p-4 flex items-center justify-between hover:bg-muted/30 hover:shadow-sm hover:border-primary/30 transition-all duration-200 group animate-fadeIn"
                  >
                    {/* Bilingual text block with Khmer script line-height clipping prevention */}
                    <div className="flex flex-col min-w-0 pr-2 py-0.5">
                      <span className="text-sm font-bold text-slate-800 font-sans tracking-wide leading-relaxed truncate">
                        {item.title}
                      </span>
                      {item.subtitle && (
                        <span className="text-xs font-semibold text-slate-400 leading-normal truncate mt-0.5">
                          {item.subtitle}
                        </span>
                      )}
                    </div>

                    {/* CRUD Delete Action */}
                    {(!activeTab.includes("champion") || subTab === "sponsors") && (
                      <button
                        onClick={() => handleDeleteOption(item.id, item.title)}
                        className="p-2 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg transition-all shrink-0 cursor-pointer animate-pulse"
                        title="Delete option"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>
      </div>

    </div>
  );
}