import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router";
import { toast } from "sonner";
import { api } from "../utils/api";
import {
  Trophy, Plus, Award, Crown, Star, Shield,
  Search, Filter, Calendar, MapPin, TrendingUp, Swords,
  CheckCircle, Clock, User, Weight, X, Eye, History,
  CalendarClock, Target, Flame, XCircle, Zap, AlertCircle, AlertTriangle
} from "lucide-react";
import {
  CHAMPION_TYPE_CONFIG,
  CHAMPION_STATUS_CONFIG,
  WEIGHT_CLASSES,
  type ChampionType,
  type ChampionStatus
} from "../data/champion";
import { usePermissions } from "../hooks/usePermissions";
import { clsx } from "clsx";

export function Champion() {
  const navigate = useNavigate();
  const permissions = usePermissions();
  const [search, setSearch] = useState("");
  const [champions, setChampions] = useState<any[]>([]);
  const [fighters, setFighters] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const champsData = await api.champions.list();
        const fightersData = await api.fighters.list();
        
        // Map database champions
        const mappedChamps = (champsData || []).map((c: any) => ({
          ...c,
          titleName: c.title_name,
          championType: c.champion_type,
          weightClass: parseFloat(c.weight_class) || 0,
          organization: c.organization,
          batchId: c.batch_id,
          eventName: c.event_name || "KKF Event",
          currentHolderId: c.current_holder_id,
          currentHolderName: c.current_holder_name_db || c.current_holder_name || "Vacant",
          nationality: c.current_holder_nationality_db || c.nationality || "Cambodian",
          dateCreated: c.date_created || c.created_at,
          dateAwarded: c.date_awarded,
          status: c.status, // Active, Title Defense Scheduled, Inactive, Vacant
          defenseCount: parseInt(c.defense_count) || 0,
          notes: c.notes,
        }));
        setChampions(mappedChamps);
        setFighters(fightersData || []);
      } catch (err: any) {
        console.error(err);
        toast.error("Failed to load champions from database");
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const getFighterPhoto = (champ: any) => {
    if (champ.belt_image_url) return champ.belt_image_url;
    if (champ.currentHolderId) {
      const fighter = fighters.find(f => f.id === champ.currentHolderId);
      if (fighter?.image) return fighter.image;
    }
    return null;
  };

  const [filterType, setFilterType] = useState<string>("all");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [filterWeight, setFilterWeight] = useState<string>("all");
  const [filterOrganization, setFilterOrganization] = useState<string>("all");
  const [sortBy, setSortBy] = useState<"recent" | "defenses" | "weight" | "reign">("recent");
  const [showVacateModal, setShowVacateModal] = useState(false);
  const [selectedChampion, setSelectedChampion] = useState<any>(null);
  const [vacateReason, setVacateReason] = useState("");

  const handleVacateTitle = async () => {
    if (!selectedChampion) return;
    try {
      await api.champions.update(selectedChampion.id, {
        currentHolderId: null,
        currentHolderName: null,
        nationality: null,
        status: "Vacant",
        notes: vacateReason ? `Vacated: ${vacateReason}` : selectedChampion.notes
      });
      toast.success(`Title vacated: ${selectedChampion.weightClass}kg ${selectedChampion.championType}`);
      setShowVacateModal(false);
      
      // Refresh list
      const champsData = await api.champions.list();
      const mappedChamps = (champsData || []).map((c: any) => ({
        ...c,
        titleName: c.title_name,
        championType: c.champion_type,
        weightClass: parseFloat(c.weight_class) || 0,
        organization: c.organization,
        batchId: c.batch_id,
        eventName: c.event_name || "KKF Event",
        currentHolderId: c.current_holder_id,
        currentHolderName: c.current_holder_name_db || c.current_holder_name || "Vacant",
        nationality: c.current_holder_nationality_db || c.nationality || "Cambodian",
        dateCreated: c.date_created || c.created_at,
        dateAwarded: c.date_awarded,
        status: c.status,
        defenseCount: parseInt(c.defense_count) || 0,
        notes: c.notes,
      }));
      setChampions(mappedChamps);
      setSelectedChampion(null);
      setVacateReason("");
    } catch (err: any) {
      console.error(err);
      toast.error("Failed to vacate championship title");
    }
  };

  // Filter champions
  let filteredChampions = champions;

  if (filterType !== "all") {
    filteredChampions = filteredChampions.filter(c => c.championType === filterType);
  }

  if (filterStatus !== "all") {
    filteredChampions = filteredChampions.filter(c => c.status === filterStatus);
  }

  if (filterWeight !== "all") {
    filteredChampions = filteredChampions.filter(c => c.weightClass === parseFloat(filterWeight));
  }

  if (filterOrganization !== "all") {
    filteredChampions = filteredChampions.filter(c => c.organization === filterOrganization);
  }

  if (search) {
    filteredChampions = filteredChampions.filter(c =>
      (c.currentHolderName?.toLowerCase().includes(search.toLowerCase()) || false) ||
      c.titleName.toLowerCase().includes(search.toLowerCase()) ||
      c.eventName.toLowerCase().includes(search.toLowerCase())
    );
  }

  // Sort champions
  const sortedChampions = [...filteredChampions].sort((a, b) => {
    if (sortBy === "recent") {
      return new Date(b.dateAwarded || b.dateCreated).getTime() - new Date(a.dateAwarded || a.dateCreated).getTime();
    } else if (sortBy === "defenses") {
      return b.defenseCount - a.defenseCount;
    } else if (sortBy === "reign") {
      const daysA = a.dateAwarded ? Math.floor((new Date().getTime() - new Date(a.dateAwarded).getTime()) / (1000 * 60 * 60 * 24)) : 0;
      const daysB = b.dateAwarded ? Math.floor((new Date().getTime() - new Date(b.dateAwarded).getTime()) / (1000 * 60 * 60 * 24)) : 0;
      return daysB - daysA;
    } else {
      return a.weightClass - b.weightClass;
    }
  });

  // Calculate days as champion helper
  const getDaysAsChampion = (dateAwarded?: string): number => {
    if (!dateAwarded) return 0;
    return Math.floor((new Date().getTime() - new Date(dateAwarded).getTime()) / (1000 * 60 * 60 * 24));
  };

  // Get insights
  const vacantTitles = champions.filter(c => c.status === "Vacant");
  const scheduledDefenses = champions.filter(c => c.status === "Title Defense Scheduled");
  const topChampions = [...champions]
    .filter(c => c.status === "Active")
    .sort((a, b) => b.defenseCount - a.defenseCount)
    .slice(0, 3);
  
  const longestReign = [...champions]
    .filter(c => c.currentHolderName && c.dateAwarded)
    .sort((a, b) => getDaysAsChampion(b.dateAwarded) - getDaysAsChampion(a.dateAwarded))[0];

  const activeFiltersCount = [filterType, filterStatus, filterWeight, filterOrganization].filter(f => f !== "all").length;

  const clearFilters = () => {
    setFilterType("all");
    setFilterStatus("all");
    setFilterWeight("all");
    setFilterOrganization("all");
  };

  const activeChampionsCount = champions.filter(c => c.status === "Active" || c.status === "Title Defense Scheduled").length;

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-6 animate-fadeIn">
      {/* Header */}
      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Championships</h1>
          <p className="text-sm text-muted-foreground mt-0.5 font-medium">
            {activeChampionsCount} Active Title Holders & Special Awards
          </p>
          <div className="flex items-center gap-3.5 mt-2.5 text-xs font-semibold">
            <div className="flex items-center gap-1 text-primary">
              <Trophy className="w-3.5 h-3.5" />
              <span>{sortedChampions.length} Total</span>
            </div>
            <div className="w-1 h-1 rounded-full bg-slate-300" />
            <div className="flex items-center gap-1 text-emerald-600">
              <CheckCircle className="w-3.5 h-3.5" />
              <span>{activeChampionsCount} Active</span>
            </div>
            <div className="w-1 h-1 rounded-full bg-slate-300" />
            <div className="flex items-center gap-1 text-rose-600">
              <XCircle className="w-3.5 h-3.5" />
              <span>{vacantTitles.length} Vacant</span>
            </div>
          </div>
        </div>

        {permissions.hasPermission('events.create') && (
          <Link
            to="/home/champion/new"
            className="btn-primary py-2.5 px-5 uppercase text-xs tracking-wider"
          >
            <Crown className="w-4 h-4" />
            Create Championship
          </Link>
        )}
      </header>

      {/* Enhanced Top Champions Section */}
      {topChampions.length > 0 && (
        <div className="bg-gradient-to-br from-amber-50 to-amber-100/30 border border-amber-200/60 rounded-xl p-5 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <Star className="w-5 h-5 text-amber-600" />
            <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wider">Top Champions</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {topChampions.map((champ, index) => (
              <Link
                key={champ.id}
                to={`/home/champion/${champ.id}`}
                className="bg-white/95 backdrop-blur-sm rounded-xl p-4 hover:shadow-md transition-all border border-amber-200/40 hover:border-amber-400 group"
              >
                <div className="flex items-center gap-3">
                  <div className="relative flex-shrink-0">
                    {getFighterPhoto(champ) ? (
                      <img
                        src={getFighterPhoto(champ) || ""}
                        alt={champ.currentHolderName || ""}
                        className="w-12 h-12 rounded-lg object-cover border border-slate-200"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-primary to-[#051C42] flex items-center justify-center border border-slate-200">
                        <Trophy className="w-6 h-6 text-white" />
                      </div>
                    )}
                    <div className="absolute -top-1.5 -right-1.5 w-5.5 h-5.5 bg-slate-900 text-white rounded-full flex items-center justify-center text-[10px] font-bold shadow-sm border border-white">
                      {index + 1}
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-bold text-slate-900 truncate group-hover:text-primary transition-colors">
                      {champ.currentHolderName || "Vacant"}
                    </div>
                    <div className="text-[10px] font-semibold text-muted-foreground truncate mb-1">
                      {champ.weightClass}kg • {champ.championType}
                    </div>
                    <div className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-emerald-50 text-emerald-700 rounded-md text-[9px] font-semibold border border-emerald-200/50">
                      <CheckCircle className="w-2.5 h-2.5" />
                      {champ.defenseCount} Defenses
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Insights Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Vacant Titles Card */}
        {vacantTitles.length > 0 && (
          <div className="bg-red-50/20 border border-red-100 rounded-xl p-5 shadow-sm flex flex-col justify-between space-y-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <div className="w-8 h-8 bg-red-100 text-red-600 rounded-lg flex items-center justify-center flex-shrink-0">
                  <AlertCircle className="w-4 h-4" />
                </div>
                <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">
                  {vacantTitles.length} Vacant Title{vacantTitles.length > 1 ? 's' : ''}
                </h3>
              </div>
              <p className="text-xs text-muted-foreground font-medium">
                Belts currently up for grabs. Schedule a title match to crown a new champion.
              </p>
              <div className="flex flex-wrap gap-1.5 mt-3.5">
                {vacantTitles.slice(0, 3).map(title => (
                  <Link
                    key={title.id}
                    to={`/home/match/new?championId=${title.id}`}
                    className="inline-flex items-center gap-1 px-2.5 py-1 bg-white hover:bg-red-50 text-red-700 border border-red-200 rounded-lg text-xs font-bold transition-all shadow-xs"
                  >
                    <Trophy className="w-3.5 h-3.5" />
                    {title.weightClass}kg
                  </Link>
                ))}
                {vacantTitles.length > 3 && (
                  <span className="inline-flex items-center px-2.5 py-1 bg-white text-muted-foreground rounded-lg text-xs font-bold border border-slate-200">
                    +{vacantTitles.length - 3}
                  </span>
                )}
              </div>
            </div>
            <div className="flex gap-2">
              <Link
                to="/home/match/new"
                className="flex-1 btn-outline py-1.5 text-xs text-red-700 border-red-200 hover:bg-red-50/50 justify-center text-center uppercase tracking-wider"
              >
                Int'l Belt
              </Link>
              <Link
                to="/home/match/new"
                className="flex-1 btn-outline py-1.5 text-xs text-red-700 border-red-200 hover:bg-red-50/50 justify-center text-center uppercase tracking-wider"
              >
                Nat'l Belt
              </Link>
            </div>
          </div>
        )}

        {/* Scheduled Defenses Card */}
        {scheduledDefenses.length > 0 && (
          <div className="bg-amber-50/20 border border-amber-100 rounded-xl p-5 shadow-sm flex flex-col justify-between space-y-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <div className="w-8 h-8 bg-amber-100 text-amber-600 rounded-lg flex items-center justify-center flex-shrink-0">
                  <CalendarClock className="w-4 h-4" />
                </div>
                <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">
                  {scheduledDefenses.length} Defenses Scheduled
                </h3>
              </div>
              <p className="text-xs text-muted-foreground font-medium">
                Championship belts with upcoming title matches already scheduled.
              </p>
            </div>
            <Link
              to="/home/events"
              className="w-full btn-outline py-1.5 text-xs text-amber-700 border-amber-250 hover:bg-amber-50/50 justify-center text-center uppercase tracking-wider"
            >
              View Event Defenses
            </Link>
          </div>
        )}

        {/* Longest Reign Card */}
        {longestReign && (
          <div className="bg-blue-50/20 border border-blue-100 rounded-xl p-5 shadow-sm flex flex-col justify-between space-y-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <div className="w-8 h-8 bg-blue-100 text-blue-600 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Crown className="w-4 h-4" />
                </div>
                <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">
                  Longest Reign
                </h3>
              </div>
              <p className="text-xs text-slate-805 font-bold truncate mb-0.5">
                {longestReign.currentHolderName}
              </p>
              <p className="text-xs text-muted-foreground font-medium">
                Has held the {longestReign.weightClass}kg {longestReign.championType} title for {getDaysAsChampion(longestReign.dateAwarded)} days.
              </p>
            </div>
            <Link
              to={`/home/champion/${longestReign.id}`}
              className="w-full btn-outline py-1.5 text-xs text-primary border-blue-250 hover:bg-blue-50/50 justify-center text-center uppercase tracking-wider"
            >
              View Belt Detail
            </Link>
          </div>
        )}
      </div>

      {/* Search & Filters */}
      <div className="card-premium p-5 sm:p-6 space-y-4">
        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search by champion name, title, or event..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input-premium pl-10 py-2.5"
          />
        </div>

        {/* Filter Chips */}
        <div className="flex flex-wrap gap-1.5 pb-2 border-b border-border/60">
          <button
            onClick={() => setFilterType("all")}
            className={clsx(
              "px-3 py-1.5 rounded-lg text-xs font-semibold uppercase tracking-wider transition-all",
              filterType === "all"
                ? "bg-primary text-white shadow-xs"
                : "bg-muted text-muted-foreground hover:bg-muted/80 border border-border/40"
            )}
          >
            All Types
          </button>
          {Object.entries(CHAMPION_TYPE_CONFIG).slice(0, 6).map(([key, config]) => {
            const isSelected = filterType === key;
            return (
              <button
                key={key}
                onClick={() => setFilterType(key)}
                className={clsx(
                  "px-3 py-1.5 rounded-lg text-xs font-semibold uppercase tracking-wider transition-all border",
                  isSelected
                    ? `${config.bgColor} ${config.color} border-current shadow-xs`
                    : "bg-muted text-muted-foreground hover:bg-muted/80 border-border/40"
                )}
              >
                {config.icon} {config.label.replace(" Champion", "").replace(" Belt", "")}
              </button>
            );
          })}
        </div>

        {/* Advanced Filters Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="input-premium py-2.5 cursor-pointer"
          >
            <option value="all">All Statuses</option>
            {Object.entries(CHAMPION_STATUS_CONFIG).map(([key, config]) => (
              <option key={key} value={key}>
                {config.label}
              </option>
            ))}
          </select>

          <select
            value={filterWeight}
            onChange={(e) => setFilterWeight(e.target.value)}
            className="input-premium py-2.5 cursor-pointer"
          >
            <option value="all">All Weights</option>
            {WEIGHT_CLASSES.map(weight => (
              <option key={weight} value={weight}>
                {weight}kg
              </option>
            ))}
          </select>

          <select
            value={filterOrganization}
            onChange={(e) => setFilterOrganization(e.target.value)}
            className="input-premium py-2.5 cursor-pointer"
          >
            <option value="all">All Organizations</option>
            {Array.from(new Set(champions.map(c => c.organization))).map(org => (
              <option key={org} value={org}>
                {org}
              </option>
            ))}
          </select>

          <div className="flex gap-2">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="input-premium py-2.5 cursor-pointer flex-1"
            >
              <option value="recent">Sort: Recent</option>
              <option value="defenses">Sort: Defenses</option>
              <option value="weight">Sort: Weight</option>
              <option value="reign">Sort: Reign</option>
            </select>

            {activeFiltersCount > 0 && (
              <button
                onClick={clearFilters}
                className="px-3 py-2 bg-red-100 hover:bg-red-200 text-red-700 rounded-lg text-xs font-semibold transition-all shadow-xs flex items-center justify-center"
                title="Clear Filters"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Champions List */}
      {sortedChampions.length === 0 ? (
        <div className="card-premium p-16 text-center space-y-4">
          <Trophy className="w-16 h-16 text-muted-foreground/30 mx-auto" />
          <h3 className="text-xl font-bold text-slate-900">No Champions Found</h3>
          <p className="text-muted-foreground text-sm max-w-md mx-auto">
            No champions match your current filters. Try adjusting your search term or filter parameters.
          </p>
          {activeFiltersCount > 0 && (
            <button
              onClick={clearFilters}
              className="btn-primary inline-flex py-2 px-5 text-xs uppercase tracking-wider mt-2"
            >
              <X className="w-4 h-4" />
              Clear All Filters
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {sortedChampions.map((champion) => {
            const typeConfig = CHAMPION_TYPE_CONFIG[champion.championType];
            const statusConfig = CHAMPION_STATUS_CONFIG[champion.status];

            return (
              <Link
                key={champion.id}
                to={`/home/champion/${champion.id}`}
                className="block card-premium bg-white hover:-translate-y-0.5 hover:shadow-md transition-all duration-300 group overflow-hidden"
              >
                <div>
                  {/* Header Row */}
                  <div className="flex items-start gap-4 mb-4">
                    {/* Champion Photo */}
                    <div className="relative flex-shrink-0">
                      {getFighterPhoto(champion) ? (
                        <img
                          src={getFighterPhoto(champion) || ""}
                          alt={champion.currentHolderName || "Vacant"}
                          className="w-16 h-16 rounded-xl object-cover border border-slate-200"
                        />
                      ) : (
                        <div className="w-16 h-16 rounded-xl bg-muted border border-slate-200 flex items-center justify-center">
                          <Trophy className="w-7 h-7 text-muted-foreground/50" />
                        </div>
                      )}
                      {champion.status === "Active" && champion.currentHolderName && (
                        <div className="absolute -bottom-1 -right-1 w-5.5 h-5.5 bg-gradient-to-br from-amber-400 to-amber-500 rounded-full flex items-center justify-center border-2 border-white shadow-xs">
                          <Crown className="w-3 h-3 text-white" />
                        </div>
                      )}
                    </div>

                    {/* Champion Info */}
                    <div className="flex-1 min-w-0">
                      <h2 className="text-lg font-bold text-slate-900 leading-tight group-hover:text-primary transition-colors truncate">
                        {champion.currentHolderName || "VACANT"}
                      </h2>
                      
                      <div className="text-xs font-semibold text-muted-foreground mt-0.5 mb-2">
                        {champion.weightClass}kg • {champion.championType}
                      </div>

                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className={`badge-premium text-[9px] py-0.5 px-2 ${
                          champion.status === 'Active' ? 'badge-blue' :
                          champion.status === 'Title Defense Scheduled' ? 'badge-amber' :
                          'bg-slate-100 text-slate-700 border-slate-200'
                        }`}>
                          <span className={`badge-dot ${
                            champion.status === 'Active' ? 'bg-blue-500' :
                            champion.status === 'Title Defense Scheduled' ? 'bg-amber-500' :
                            'bg-slate-400'
                          }`} />
                          {statusConfig.label}
                        </span>
                        <span className={`badge-premium text-[9px] py-0.5 px-2 bg-slate-50 text-slate-650 border-slate-200`}>
                          {typeConfig.icon} {typeConfig.label.split(" ")[0]}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Key Info Row - Weight, Organization, Won Date */}
                  <div className="grid grid-cols-3 gap-2 mb-3.5">
                    <div className="bg-blue-50/20 rounded-lg p-2 border border-blue-100/50">
                      <div className="flex items-center gap-1.5">
                        <Weight className="w-3.5 h-3.5 text-primary flex-shrink-0" />
                        <div className="min-w-0">
                          <div className="text-[9px] font-semibold text-muted-foreground uppercase tracking-wider leading-none">Weight</div>
                          <div className="text-xs font-bold text-slate-800 mt-0.5">{champion.weightClass}kg</div>
                        </div>
                      </div>
                    </div>

                    <div className="bg-red-50/20 rounded-lg p-2 border border-red-100/50">
                      <div className="flex items-center gap-1.5">
                        <Shield className="w-3.5 h-3.5 text-secondary flex-shrink-0" />
                        <div className="min-w-0">
                          <div className="text-[9px] font-semibold text-muted-foreground uppercase tracking-wider leading-none">Org</div>
                          <div className="text-xs font-bold text-slate-800 mt-0.5 truncate">{champion.organization}</div>
                        </div>
                      </div>
                    </div>

                    <div className="bg-amber-50/20 rounded-lg p-2 border border-amber-100/50">
                      <div className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-amber-505 flex-shrink-0" />
                        <div className="min-w-0">
                          <div className="text-[9px] font-semibold text-muted-foreground uppercase tracking-wider leading-none">Won</div>
                          <div className="text-xs font-bold text-slate-800 mt-0.5">
                            {champion.dateAwarded ? new Date(champion.dateAwarded).toLocaleDateString('en-US', { month: 'short', year: '2-digit' }) : 'N/A'}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Title Won At Section */}
                  <div className="bg-slate-50 border border-slate-200/60 rounded-xl p-3 mb-3.5">
                    <div className="text-[9px] font-semibold text-muted-foreground uppercase tracking-wider mb-1 block">
                      🏆 Title Won At
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-primary flex-shrink-0" />
                        <span className="text-xs font-bold text-slate-850 truncate">
                          {champion.eventName}
                        </span>
                      </div>
                      {champion.nationality && (
                        <div className="flex items-center gap-1.5">
                          <User className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0" />
                          <span className="text-[11px] font-medium text-muted-foreground">
                            {champion.nationality}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Stats Row */}
                  <div className="grid grid-cols-3 gap-3 mb-4 pb-3.5 border-b border-border/80">
                    <div className="text-center">
                      <div className="flex items-center justify-center gap-1 mb-0.5">
                        <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                        <span className="text-base font-bold text-slate-800">{champion.defenseCount}</span>
                      </div>
                      <div className="text-[9px] font-semibold text-muted-foreground uppercase tracking-wider">Defenses</div>
                    </div>

                    <div className="text-center">
                      <div className="flex items-center justify-center gap-1 mb-0.5">
                        <Flame className="w-3.5 h-3.5 text-orange-500" />
                        <span className="text-base font-bold text-slate-800">
                          {champion.defenseCount > 0 ? champion.defenseCount : '-'}
                        </span>
                      </div>
                      <div className="text-[9px] font-semibold text-muted-foreground uppercase tracking-wider">Win Streak</div>
                    </div>

                    <div className="text-center">
                      <div className="flex items-center justify-center gap-1 mb-0.5">
                        <Star className="w-3.5 h-3.5 text-amber-500" />
                        <span className="text-base font-bold text-slate-800">
                          {champion.specialTitles?.length || 0}
                        </span>
                      </div>
                      <div className="text-[9px] font-semibold text-muted-foreground uppercase tracking-wider">Awards</div>
                    </div>
                  </div>

                  {/* Quick Actions */}
                  <div className="grid grid-cols-4 gap-2">
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        navigate(`/home/champion/${champion.id}`);
                      }}
                      className="btn-outline py-1.5 px-2 text-xs text-slate-700 hover:text-primary transition-colors flex items-center justify-center gap-1"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline">View</span>
                    </button>
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        navigate(`/home/champion/${champion.id}/history`);
                      }}
                      className="btn-outline py-1.5 px-2 text-xs text-slate-700 hover:text-primary transition-colors flex items-center justify-center gap-1"
                    >
                      <History className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline">History</span>
                    </button>
                    {champion.status === "Active" && permissions.hasPermission('events.create') && (
                      <>
                        <button
                          onClick={(e) => {
                            e.preventDefault();
                            navigate(`/home/champion/${champion.id}/schedule-defense`);
                          }}
                          className="inline-flex items-center justify-center gap-1 px-2 py-1.5 rounded-lg bg-gradient-to-br from-amber-500 to-amber-600 text-white hover:from-amber-600 hover:to-amber-700 text-xs font-semibold transition-all active:scale-[0.98] shadow-xs"
                        >
                          <CalendarClock className="w-3.5 h-3.5" />
                          <span className="hidden sm:inline">Defense</span>
                        </button>
                        <button
                          onClick={(e) => {
                            e.preventDefault();
                            setSelectedChampion(champion);
                            setShowVacateModal(true);
                          }}
                          className="inline-flex items-center justify-center gap-1 px-2 py-1.5 rounded-lg bg-gradient-to-br from-red-600 to-rose-600 text-white hover:from-red-700 hover:to-rose-755 text-xs font-semibold transition-all active:scale-[0.98]"
                        >
                          <XCircle className="w-3.5 h-3.5" />
                          <span className="hidden sm:inline">Vacate</span>
                        </button>
                      </>
                    )}
                    {champion.status === "Vacant" && permissions.hasPermission('events.create') && (
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          navigate(`/home/match/new?championId=${champion.id}`);
                        }}
                        className="col-span-2 inline-flex items-center justify-center gap-1 px-3 py-1.5 rounded-lg bg-gradient-to-br from-emerald-600 to-emerald-700 text-white hover:from-emerald-700 hover:to-emerald-800 text-xs font-semibold transition-all active:scale-[0.98]"
                      >
                        <Target className="w-3.5 h-3.5" />
                        <span className="hidden sm:inline">Schedule Fight</span>
                      </button>
                    )}
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}

      {/* Vacate Title Modal */}
      {showVacateModal && selectedChampion && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6 border border-border/80">
            <div className="flex items-start gap-3.5 mb-5">
              <div className="w-10 h-10 bg-red-50 text-red-600 rounded-lg flex items-center justify-center flex-shrink-0 border border-red-100">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900 mb-1">
                  Vacate Championship Title
                </h3>
                <p className="text-xs text-muted-foreground leading-normal">
                  This will mark the <strong className="text-slate-800">{selectedChampion.weightClass}kg {selectedChampion.championType}</strong> title as vacant and remove {selectedChampion.currentHolderName} as the current holder.
                </p>
              </div>
            </div>

            <div className="mb-6">
              <label className="block text-xs font-semibold text-muted-foreground mb-2 uppercase tracking-wide">
                Reason for Vacancy (Optional)
              </label>
              <select
                value={vacateReason}
                onChange={(e) => setVacateReason(e.target.value)}
                className="input-premium py-2.5 cursor-pointer"
              >
                <option value="">Select reason...</option>
                <option value="Champion Retired">Champion Retired</option>
                <option value="Champion Vacated Voluntarily">Champion Vacated Voluntarily</option>
                <option value="Stripped by KKF">Stripped by KKF</option>
                <option value="Failed to Defend">Failed to Defend Within Deadline</option>
                <option value="Medical Reasons">Medical Reasons</option>
                <option value="Weight Class Change">Weight Class Change</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                onClick={() => {
                  setShowVacateModal(false);
                  setSelectedChampion(null);
                  setVacateReason("");
                }}
                className="btn-outline px-5 py-2 text-xs uppercase tracking-wider"
              >
                Cancel
              </button>
              <button
                onClick={handleVacateTitle}
                className="inline-flex items-center justify-center gap-1.5 px-5 py-2 rounded-lg bg-gradient-to-br from-red-600 to-rose-600 text-white hover:from-red-700 hover:to-rose-755 text-xs font-semibold uppercase tracking-wider transition-all shadow-sm"
              >
                Confirm Vacancy
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}