import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router";
import { ArrowLeft, Trophy, Calendar, Swords, CheckCircle, XCircle, Crown } from "lucide-react";
import { api } from "../utils/api";
import { clsx } from "clsx";

export function ChampionHistory() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [champion, setChampion] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadChampion() {
      try {
        setLoading(true);
        const champData = await api.champions.get(id || "");
        if (champData) {
          setChampion({
            ...champData,
            titleName: champData.title_name,
            championType: champData.champion_type,
            weightClass: parseFloat(champData.weight_class) || 0,
            organization: champData.organization,
            batchId: champData.batch_id,
            eventName: champData.event_name || "KKF Event",
            currentHolderId: champData.current_holder_id,
            currentHolderPhoto: champData.current_holder_photo_db,
            currentHolderName: champData.current_holder_name_db || champData.current_holder_name || "Vacant",
            nationality: champData.current_holder_nationality_db || champData.nationality || "Cambodian",
            dateCreated: champData.date_created || champData.created_at,
            dateAwarded: champData.date_awarded,
            status: champData.status,
            defenseCount: parseInt(champData.defense_count) || 0,
            notes: champData.notes,
            defenses: champData.defenses || []
          });
        }
      } catch (err) {
        console.error("Failed to load champion details", err);
      } finally {
        setLoading(false);
      }
    }
    loadChampion();
  }, [id]);

  const getFighterPhoto = (champ: any) => {
    if (!champ) return null;
    return champ.currentHolderPhoto || "https://images.unsplash.com/photo-1549719386-74dfcbf7dbed?auto=format&fit=crop&q=80&w=100";
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8 min-h-[60vh] animate-fadeIn">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary mx-auto"></div>
          <p className="text-sm text-muted-foreground mt-4 font-semibold">Loading title history...</p>
        </div>
      </div>
    );
  }

  if (!champion) {
    return (
      <div className="flex items-center justify-center p-8 min-h-[60vh] animate-fadeIn">
        <div className="text-center space-y-4">
          <Trophy className="w-16 h-16 text-muted-foreground/30 mx-auto" />
          <h2 className="text-2xl font-bold text-slate-900">Championship Not Found</h2>
          <p className="text-muted-foreground text-sm max-w-sm mx-auto">
            The championship belt details you are looking for do not exist.
          </p>
          <button
            onClick={() => navigate("/home/champion")}
            className="btn-primary inline-flex py-2 px-5 text-xs uppercase tracking-wider"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Champions
          </button>
        </div>
      </div>
    );
  }

  const champPhoto = getFighterPhoto(champion);

  const defenseHistory = (champion.defenses || []).map((def: any) => ({
    id: def.id,
    date: def.date,
    eventName: def.event_name,
    opponent: def.opponent,
    result: def.result,
    method: def.method,
    location: def.location || "Phnom Penh"
  }));

  return (
    <div className="p-4 md:p-8 max-w-5xl mx-auto space-y-6 animate-fadeIn">
      {/* Back Button */}
      <div>
        <button
          onClick={() => navigate(`/home/champion/${champion.id}`)}
          className="p-2.5 bg-white hover:bg-muted text-primary border border-border/80 rounded-xl transition-all active:scale-95 shadow-sm inline-flex items-center justify-center"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>
      </div>

      {/* Header */}
      <div className="bg-gradient-to-br from-amber-50 to-amber-100/30 border border-amber-200/60 rounded-xl p-5 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-amber-100 text-amber-600 rounded-lg flex items-center justify-center shadow-xs">
            <Trophy className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-slate-800 uppercase tracking-wider leading-none">
              Title History
            </h1>
            <p className="text-xs text-muted-foreground font-semibold mt-1">
              {champion.titleName}
            </p>
          </div>
        </div>
      </div>

      {/* Champion Summary */}
      <div className="card-premium p-5 flex items-center gap-4">
        {champPhoto && (
          <img
            src={champPhoto}
            alt={champion.currentHolderName || ""}
            className="w-16 h-16 rounded-xl object-cover border border-slate-200"
          />
        )}
        <div className="flex-1 min-w-0">
          <h2 className="text-lg font-bold text-slate-900 leading-tight">
            {champion.currentHolderName || "Vacant"}
          </h2>
          <div className="text-xs font-semibold text-muted-foreground mt-0.5">
            {champion.weightClass}kg • {champion.championType}
          </div>
        </div>
        <div className="text-center bg-blue-50/20 p-3.5 rounded-xl border border-blue-100/50 shrink-0">
          <div className="text-xl font-bold text-primary mb-0.5">
            {champion.defenseCount}
          </div>
          <div className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
            Defenses
          </div>
        </div>
      </div>

      {/* Title Win */}
      <div className="bg-amber-50/20 border border-amber-100 rounded-xl p-5 shadow-sm space-y-3">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 bg-amber-100 text-amber-600 rounded-lg flex items-center justify-center flex-shrink-0">
            <Crown className="w-5 h-5" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2">
              <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">
                Title Won
              </h3>
              <span className="badge-premium badge-amber text-[10px] py-0.5 px-2 font-bold uppercase">
                Championship Fight
              </span>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <div className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-0.5">
                  Event
                </div>
                <div className="text-xs font-bold text-slate-800 truncate">
                  {champion.eventName}
                </div>
              </div>
              {champion.dateAwarded && (
                <div>
                  <div className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-0.5">
                    Date Awarded
                  </div>
                  <div className="text-xs font-bold text-slate-850 flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-primary" />
                    <span>
                      {new Date(champion.dateAwarded).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Defense History */}
      <div className="card-premium p-6 sm:p-8 space-y-6">
        <h2 className="text-base font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2 pb-3 border-b border-border/60">
          <Swords className="w-4 h-4 text-primary" />
          Title Defenses ({defenseHistory.length})
        </h2>

        {defenseHistory.length === 0 ? (
          <div className="text-center py-12 space-y-2">
            <Trophy className="w-12 h-12 text-muted-foreground/30 mx-auto" />
            <p className="text-muted-foreground text-sm font-medium">
              No title defenses yet
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {defenseHistory.map((defense, index) => (
              <div
                key={defense.id}
                className="bg-slate-50/40 hover:bg-white p-4 rounded-xl border border-border/60 hover:border-primary/20 transition-all hover:shadow-xs group"
              >
                <div className="flex items-start gap-4">
                  {/* Defense Number Badge */}
                  <div className="w-10 h-10 bg-primary text-white rounded-lg flex items-center justify-center font-bold text-sm shrink-0 shadow-sm">
                    #{defenseHistory.length - index}
                  </div>

                  <div className="flex-1 min-w-0 space-y-3">
                    {/* Event & Date */}
                    <div className="flex flex-wrap items-start justify-between gap-3 border-b border-border/40 pb-2.5">
                      <div>
                        <h3 className="text-sm font-bold text-slate-850 group-hover:text-primary transition-colors leading-tight truncate">
                          {defense.eventName}
                        </h3>
                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground mt-1">
                          <Calendar className="w-3.5 h-3.5 text-primary" />
                          <span>
                            {new Date(defense.date).toLocaleDateString('en-US', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric'
                            })}
                          </span>
                        </div>
                      </div>
                      <span className={clsx(
                        "badge-premium text-[10px] py-0.5 px-2 font-bold uppercase",
                        defense.result === "Won" ? "badge-emerald" : "badge-red"
                      )}>
                        <span className={clsx("badge-dot", defense.result === "Won" ? "bg-emerald-500" : "bg-red-500")} />
                        {defense.result}
                      </span>
                    </div>

                    {/* Fight Details */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      <div className="bg-white p-2.5 rounded-lg border border-slate-200/60">
                        <div className="text-[9px] font-semibold text-muted-foreground uppercase tracking-wider mb-0.5">
                          Opponent
                        </div>
                        <div className="text-xs font-bold text-slate-800">
                          {defense.opponent}
                        </div>
                      </div>
                      <div className="bg-white p-2.5 rounded-lg border border-slate-200/60">
                        <div className="text-[9px] font-semibold text-muted-foreground uppercase tracking-wider mb-0.5">
                          Method
                        </div>
                        <div className="text-xs font-bold text-slate-800">
                          {defense.method}
                        </div>
                      </div>
                      <div className="bg-white p-2.5 rounded-lg border border-slate-200/60">
                        <div className="text-[9px] font-semibold text-muted-foreground uppercase tracking-wider mb-0.5">
                          Location
                        </div>
                        <div className="text-xs font-bold text-slate-800">
                          {defense.location}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Championship Timeline Summary */}
      <div className="bg-gradient-to-br from-primary via-primary/95 to-[#051C42] rounded-xl p-5 text-white shadow-sm space-y-4">
        <h3 className="text-sm font-bold uppercase tracking-wider pb-2 border-b border-white/10">Championship Timeline</h3>
        <div className="space-y-3 text-xs font-semibold text-white/80">
          <div className="flex items-center justify-between">
            <span>Title Created</span>
            <span className="font-bold text-white">
              {new Date(champion.dateCreated).toLocaleDateString()}
            </span>
          </div>
          {champion.dateAwarded && (
            <div className="flex items-center justify-between">
              <span>Title Won</span>
              <span className="font-bold text-white">
                {new Date(champion.dateAwarded).toLocaleDateString()}
              </span>
            </div>
          )}
          {champion.lastDefenseDate && (
            <div className="flex items-center justify-between">
              <span>Last Defense</span>
              <span className="font-bold text-white">
                {new Date(champion.lastDefenseDate).toLocaleDateString()}
              </span>
            </div>
          )}
          <div className="flex items-center justify-between border-t border-white/10 pt-3 text-sm">
            <span className="font-bold text-white">Total Defenses</span>
            <span className="text-xl font-extrabold text-amber-400">
              {champion.defenseCount}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}