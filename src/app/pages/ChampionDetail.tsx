import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router";
import {
  ArrowLeft, Crown, Trophy, Calendar, MapPin, Shield, Weight,
  Award, Star, User, CheckCircle, Clock, History, CalendarClock,
  Target, Edit, Trash2, TrendingUp, Swords, XCircle, AlertTriangle, Save, X
} from "lucide-react";
import { CHAMPION_TYPE_CONFIG, CHAMPION_STATUS_CONFIG, WEIGHT_CLASSES, getWeightClassName } from "../data/champion";
import { usePermissions } from "../hooks/usePermissions";
import { toast } from "sonner";
import { clsx } from "clsx";
import { api } from "../utils/api";

export function ChampionDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const permissions = usePermissions();
  const [showVacateModal, setShowVacateModal] = useState(false);
  const [vacateReason, setVacateReason] = useState("");
  const [champion, setChampion] = useState<any>(null);
  const [fighters, setFighters] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Edit Modal States
  const [showEditModal, setShowEditModal] = useState(false);
  const [editFormData, setEditFormData] = useState({
    titleName: "",
    organization: "KKF",
    weightClass: 60,
    status: "Vacant",
    notes: ""
  });

  const loadData = async () => {
    try {
      if (!id) return;
      const champData = await api.champions.get(id);
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
          currentHolderName: champData.current_holder_name_db || champData.current_holder_name || "Vacant",
          nationality: champData.current_holder_nationality_db || champData.nationality || "Cambodian",
          dateCreated: champData.date_created || champData.created_at,
          dateAwarded: champData.date_awarded,
          status: champData.status,
          defenseCount: parseInt(champData.defense_count) || 0,
          notes: champData.notes,
        });
      }
      const fightersData = await api.fighters.list();
      setFighters(fightersData || []);
    } catch (err: any) {
      console.error(err);
      toast.error("Failed to load championship details");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [id]);

  const handleVacateTitle = async () => {
    if (!champion) return;
    try {
      await api.champions.update(champion.id, {
        currentHolderId: null,
        currentHolderName: null,
        nationality: null,
        status: "Vacant",
        notes: vacateReason ? `Vacated: ${vacateReason}` : champion.notes
      });
      toast.success(`Title vacated: ${champion.weightClass}kg ${champion.championType}`);
      setShowVacateModal(false);
      setVacateReason("");
      loadData();
    } catch (err: any) {
      console.error(err);
      toast.error("Failed to vacate title");
    }
  };

  const handleSaveEdit = async () => {
    try {
      await api.champions.update(champion.id, {
        titleName: editFormData.titleName,
        organization: editFormData.organization,
        weightClass: editFormData.weightClass,
        status: editFormData.status,
        notes: editFormData.notes
      });
      toast.success("Championship details updated successfully!");
      setShowEditModal(false);
      loadData();
    } catch (err) {
      console.error(err);
      toast.error("Failed to update championship details");
    }
  };

  const handleDeleteChampion = async () => {
    if (!champion) return;
    if (!window.confirm("Are you sure you want to delete this championship title? This cannot be undone.")) return;
    try {
      await api.champions.delete(champion.id);
      toast.success("Championship deleted successfully");
      navigate("/home/champion");
    } catch (err) {
      console.error(err);
      toast.error("Failed to delete championship");
    }
  };

  const startEdit = () => {
    if (!champion) return;
    setEditFormData({
      titleName: champion.titleName || "",
      organization: champion.organization || "KKF",
      weightClass: champion.weightClass || 60,
      status: champion.status || "Vacant",
      notes: champion.notes || ""
    });
    setShowEditModal(true);
  };

  const getFighterPhoto = (champ: any) => {
    if (!champ) return null;
    if (champ.belt_image_url) return champ.belt_image_url;
    if (champ.currentHolderId) {
      const fighter = fighters.find(f => f.id === champ.currentHolderId);
      if (fighter?.image) return fighter.image;
    }
    return null;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8 min-h-[60vh] animate-fadeIn">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary mx-auto"></div>
          <p className="text-sm text-muted-foreground mt-4 font-semibold">Loading championship details...</p>
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

  const typeConfig = CHAMPION_TYPE_CONFIG[champion.championType];
  const statusConfig = CHAMPION_STATUS_CONFIG[champion.status];
  const champPhoto = getFighterPhoto(champion);

  return (
    <div className="p-4 md:p-8 max-w-6xl mx-auto space-y-6 animate-fadeIn">
      {/* Back Button */}
      <div>
        <button
          onClick={() => navigate("/home/champion")}
          className="p-2.5 bg-white hover:bg-muted text-primary border border-border/80 rounded-xl transition-all active:scale-95 shadow-sm inline-flex items-center justify-center"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>
      </div>

      {/* Hero Header */}
      <div className="bg-gradient-to-br from-primary via-primary/95 to-[#051C42] rounded-2xl overflow-hidden border border-border/60 shadow-md">
        <div className="relative">
          {/* Background Image */}
          {champPhoto && (
            <>
              <img
                src={champPhoto}
                alt={champion.currentHolderName || "Champion"}
                className="absolute inset-0 w-full h-full object-cover opacity-20"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-primary/90 via-primary/95 to-[#051C42]/90" />
            </>
          )}

          {/* Content */}
          <div className="relative p-6 md:p-10 z-10">
            <div className="flex flex-col md:flex-row gap-6 md:gap-8 items-start md:items-center">
              {/* Champion Photo */}
              <div className="relative flex-shrink-0">
                {champPhoto ? (
                  <img
                    src={champPhoto}
                    alt={champion.currentHolderName || "Vacant"}
                    className="w-24 h-24 md:w-32 md:h-32 rounded-xl object-cover border-2 border-amber-400 shadow-lg"
                  />
                ) : (
                  <div className="w-24 h-24 md:w-32 md:h-32 rounded-xl bg-gradient-to-br from-slate-600 to-slate-700 flex items-center justify-center border-2 border-amber-400 shadow-lg">
                    <Trophy className="w-12 h-12 text-white" />
                  </div>
                )}
                {champion.status === "Active" && champion.currentHolderName && (
                  <div className="absolute -bottom-2 -right-2 w-10 h-10 bg-gradient-to-br from-amber-400 to-amber-500 rounded-full flex items-center justify-center border-2 border-white shadow-md">
                    <Crown className="w-5 h-5 text-white" />
                  </div>
                )}
              </div>

              {/* Champion Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-3 flex-wrap">
                  <span className={clsx(
                    "badge-premium text-[10px] py-0.5 px-2.5 font-bold uppercase border-white/20 text-white",
                    champion.status === "Active" && "badge-emerald bg-emerald-600/80 border-emerald-500/50",
                    champion.status === "Title Defense Scheduled" && "badge-blue bg-blue-600/80 border-blue-500/50",
                    champion.status === "Inactive" && "badge-amber bg-amber-600/80 border-amber-500/50",
                    champion.status === "Vacant" && "bg-slate-500/80 border-slate-400/50"
                  )}>
                    {statusConfig.label}
                  </span>
                  <span className="badge-premium text-[10px] py-0.5 px-2.5 bg-white/10 text-white border-white/20 font-bold uppercase">
                    {typeConfig.icon} {typeConfig.label.split(" ")[0]}
                  </span>
                </div>

                <h1 className="text-3xl md:text-4xl font-extrabold text-white mb-2 leading-tight truncate">
                  {champion.currentHolderName || "VACANT"}
                </h1>
                
                <div className="text-lg font-bold text-amber-400 mb-3.5">
                  {champion.weightClass}kg • {champion.championType}
                </div>

                <div className="flex flex-wrap items-center gap-4 text-xs font-semibold text-white/80">
                  {champion.nationality && (
                    <div className="flex items-center gap-1.5">
                      <User className="w-4 h-4 text-white/60" />
                      <span>{champion.nationality}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-1.5">
                    <Shield className="w-4 h-4 text-white/60" />
                    <span>{champion.organization}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <CheckCircle className="w-4 h-4 text-white/60" />
                    <span>{champion.defenseCount} Defenses</span>
                  </div>
                </div>
              </div>

              {/* Actions */}
              {permissions.hasPermission('events.create') && (
                <div className="flex flex-col gap-2.5 w-full md:w-auto shrink-0 pt-4 md:pt-0 border-t border-white/10 md:border-t-0">
                  <button
                    onClick={startEdit}
                    className="flex-1 md:flex-initial btn-outline bg-white/10 hover:bg-white/20 text-white border-white/25 text-xs py-2 px-4 uppercase tracking-wider"
                  >
                    <Edit className="w-3.5 h-3.5" />
                    <span>Edit</span>
                  </button>
                  {permissions.hasPermission('system.manage_settings') && (
                    <button
                      onClick={handleDeleteChampion}
                      className="flex-1 md:flex-initial btn-outline bg-rose-600/20 hover:bg-rose-600/30 text-rose-200 border-rose-500/30 text-xs py-2 px-4 uppercase tracking-wider flex items-center justify-center gap-1.5"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Delete</span>
                    </button>
                  )}
                  {champion.status === "Active" && (
                    <>
                      <button
                        onClick={() => navigate(`/home/champion/${champion.id}/schedule-defense`)}
                        className="flex-1 md:flex-initial inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-lg bg-gradient-to-br from-amber-500 to-amber-600 text-white hover:from-amber-600 hover:to-amber-700 text-xs font-semibold uppercase tracking-wider transition-all shadow-sm"
                      >
                        <CalendarClock className="w-3.5 h-3.5" />
                        <span>Defense</span>
                      </button>
                      <button
                        onClick={() => setShowVacateModal(true)}
                        className="flex-1 md:flex-initial inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-lg bg-gradient-to-br from-red-600 to-rose-600 text-white hover:from-red-700 hover:to-rose-755 text-xs font-semibold uppercase tracking-wider transition-all shadow-sm"
                      >
                        <XCircle className="w-3.5 h-3.5" />
                        <span>Vacate</span>
                      </button>
                    </>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Championship Stats */}
          <div className="card-premium p-6 sm:p-8 space-y-5">
            <h2 className="text-base font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2 pb-3 border-b border-border/60">
              <TrendingUp className="w-4 h-4 text-primary" />
              Championship Statistics
            </h2>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-blue-50/20 p-4 rounded-xl border border-blue-100/50">
                <div className="text-2xl font-bold text-primary mb-0.5">
                  {champion.defenseCount}
                </div>
                <div className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
                  Title Defenses
                </div>
              </div>

              <div className="bg-amber-50/20 p-4 rounded-xl border border-amber-100/50">
                <div className="text-2xl font-bold text-amber-650 mb-0.5">
                  {champion.weightClass}kg
                </div>
                <div className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
                  Weight Class
                </div>
              </div>

              <div className="bg-emerald-50/20 p-4 rounded-xl border border-emerald-100/50">
                <div className="text-2xl font-bold text-emerald-600 mb-0.5">
                  {champion.specialTitles?.length || 0}
                </div>
                <div className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
                  Special Awards
                </div>
              </div>

              <div className="bg-red-50/20 p-4 rounded-xl border border-red-100/50">
                <div className="text-2xl font-bold text-secondary mb-0.5">
                  {champion.organization}
                </div>
                <div className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
                  Organization
                </div>
              </div>
            </div>
          </div>

          {/* Title Won At */}
          <div className="card-premium p-6 sm:p-8 space-y-5">
            <h2 className="text-base font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2 pb-3 border-b border-border/60">
              <Trophy className="w-4 h-4 text-amber-500" />
              Title Won At
            </h2>

            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <MapPin className="w-4 h-4 text-primary mt-1 flex-shrink-0" />
                <div>
                  <div className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-0.5">
                    Event Name
                  </div>
                  <div className="text-sm font-bold text-slate-800">
                    {champion.eventName}
                  </div>
                </div>
              </div>

              {champion.dateAwarded && (
                <div className="flex items-start gap-3">
                  <Calendar className="w-4 h-4 text-primary mt-1 flex-shrink-0" />
                  <div>
                    <div className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-0.5">
                      Date Won
                    </div>
                    <div className="text-sm font-bold text-slate-800">
                      {new Date(champion.dateAwarded).toLocaleDateString('en-US', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </div>
                  </div>
                </div>
              )}

              {champion.lastDefenseDate && (
                <div className="flex items-start gap-3">
                  <Shield className="w-4 h-4 text-emerald-600 mt-1 flex-shrink-0" />
                  <div>
                    <div className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-0.5">
                      Last Defense
                    </div>
                    <div className="text-sm font-bold text-slate-800">
                      {new Date(champion.lastDefenseDate).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </div>
                  </div>
                </div>
              )}

              {champion.nextDefenseDeadline && (
                <div className="flex items-start gap-3">
                  <Clock className="w-4 h-4 text-destructive mt-1 flex-shrink-0" />
                  <div>
                    <div className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-0.5">
                      Next Defense Deadline
                    </div>
                    <div className="text-sm font-bold text-slate-800">
                      {new Date(champion.nextDefenseDeadline).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Special Titles */}
          {champion.specialTitles && champion.specialTitles.length > 0 && (
            <div className="card-premium p-6 sm:p-8 space-y-5">
              <h2 className="text-base font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2 pb-3 border-b border-border/60">
                <Star className="w-4 h-4 text-amber-500" />
                Special Awards
              </h2>

              <div className="flex flex-wrap gap-2.5">
                {champion.specialTitles.map((title, index) => (
                  <div
                    key={index}
                    className="bg-amber-50/20 border border-amber-150 px-3.5 py-2.5 rounded-lg flex items-center gap-2 text-xs font-semibold text-slate-800"
                  >
                    <Award className="w-4 h-4 text-amber-500" />
                    <span>{title}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Notes */}
          {champion.notes && (
            <div className="card-premium p-6 sm:p-8 space-y-4">
              <h2 className="text-base font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2 pb-2 border-b border-border/60">
                <Star className="w-4 h-4 text-muted-foreground" />
                Notes
              </h2>
              <p className="text-sm text-slate-700 leading-relaxed font-medium">
                {champion.notes}
              </p>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Quick Actions */}
          <div className="card-premium p-6 space-y-4">
            <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wider pb-2 border-b border-border/60">
              Quick Actions
            </h2>
            <div className="space-y-2.5">
              <Link
                to={`/home/champion/${champion.id}/history`}
                className="btn-outline w-full p-3.5 hover:bg-slate-50 transition-all text-slate-700 font-semibold flex items-center gap-2.5 justify-start text-xs uppercase tracking-wider"
              >
                <History className="w-4 h-4" />
                <span>View Title History</span>
              </Link>

              {champion.status === "Vacant" && permissions.hasPermission('events.create') && (
                <Link
                  to={`/home/match/new?championId=${champion.id}`}
                  className="w-full inline-flex items-center justify-center gap-2 p-3 rounded-lg bg-gradient-to-br from-green-600 to-emerald-600 text-white hover:from-green-700 hover:to-emerald-700 text-xs font-semibold uppercase tracking-wider transition-all"
                >
                  <Target className="w-4 h-4" />
                  <span>Schedule Title Fight</span>
                </Link>
              )}

              {champion.currentHolderName && (
                <Link
                  to={`/home/fighters/${champion.currentHolderId}`}
                  className="btn-outline w-full p-3.5 hover:bg-slate-50 transition-all text-slate-700 font-semibold flex items-center gap-2.5 justify-start text-xs uppercase tracking-wider"
                >
                  <User className="w-4 h-4" />
                  <span>View Fighter Profile</span>
                </Link>
              )}

              <Link
                to={`/home/batches/${champion.batchId}`}
                className="btn-outline w-full p-3.5 hover:bg-slate-50 transition-all text-slate-700 font-semibold flex items-center gap-2.5 justify-start text-xs uppercase tracking-wider"
              >
                <Swords className="w-4 h-4" />
                <span>View Event</span>
              </Link>
            </div>
          </div>

          {/* Championship Info Card */}
          <div className="bg-gradient-to-br from-primary via-primary/95 to-[#051C42] rounded-xl p-5 text-white shadow-sm space-y-5">
            <div className="flex items-center gap-2.5 pb-2 border-b border-white/10">
              <Crown className="w-5 h-5 text-amber-400" />
              <h2 className="text-sm font-bold uppercase tracking-wider">Championship Info</h2>
            </div>

            <div className="space-y-4">
              <div>
                <div className="text-[10px] font-semibold text-white/70 uppercase tracking-wider mb-0.5">
                  Title Name
                </div>
                <div className="text-xs font-bold text-white truncate">
                  {champion.titleName}
                </div>
              </div>

              <div>
                <div className="text-[10px] font-semibold text-white/70 uppercase tracking-wider mb-0.5">
                  Created
                </div>
                <div className="text-xs font-bold text-white">
                  {new Date(champion.dateCreated).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </div>
              </div>

              <div>
                <div className="text-[10px] font-semibold text-white/70 uppercase tracking-wider mb-0.5">
                  Event/Batch
                </div>
                <div className="text-xs font-bold text-white truncate">
                  {champion.eventName}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Vacate Title Modal */}
      {showVacateModal && (
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
                  This will mark the <strong className="text-slate-800">{champion.weightClass}kg {champion.championType}</strong> title as vacant and remove {champion.currentHolderName} as the current holder.
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

      {/* Edit Champion Modal */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white rounded-2xl shadow-xl max-w-lg w-full p-6 border border-border/80 space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-border">
              <div className="flex items-center gap-2">
                <Crown className="w-5 h-5 text-primary" />
                <h3 className="text-lg font-bold text-slate-900">Edit Championship Title</h3>
              </div>
              <button onClick={() => setShowEditModal(false)} className="p-1 hover:bg-slate-100 rounded-lg">
                <X className="w-5 h-5 text-muted-foreground" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-muted-foreground mb-1.5 uppercase tracking-wide">
                  Title Name
                </label>
                <input
                  type="text"
                  value={editFormData.titleName}
                  onChange={(e) => setEditFormData({ ...editFormData, titleName: e.target.value })}
                  className="input-premium py-2"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-muted-foreground mb-1.5 uppercase tracking-wide">
                    Organization
                  </label>
                  <select
                    value={editFormData.organization}
                    onChange={(e) => setEditFormData({ ...editFormData, organization: e.target.value })}
                    className="input-premium py-2 cursor-pointer"
                  >
                    <option value="KKF">KKF</option>
                    <option value="WBC">WBC</option>
                    <option value="WBA">WBA</option>
                    <option value="WMC">WMC</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-muted-foreground mb-1.5 uppercase tracking-wide">
                    Weight Class
                  </label>
                  <select
                    value={editFormData.weightClass}
                    onChange={(e) => setEditFormData({ ...editFormData, weightClass: parseFloat(e.target.value) })}
                    className="input-premium py-2 cursor-pointer"
                  >
                    {WEIGHT_CLASSES.map(weight => (
                      <option key={weight} value={weight}>
                        {getWeightClassName(weight)}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-muted-foreground mb-1.5 uppercase tracking-wide">
                  Status
                </label>
                <select
                  value={editFormData.status}
                  onChange={(e) => setEditFormData({ ...editFormData, status: e.target.value })}
                  className="input-premium py-2 cursor-pointer"
                >
                  <option value="Vacant">Vacant</option>
                  <option value="Active">Active</option>
                  <option value="Title Defense Scheduled">Title Defense Scheduled</option>
                  <option value="Inactive">Inactive</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-muted-foreground mb-1.5 uppercase tracking-wide">
                  Notes
                </label>
                <textarea
                  value={editFormData.notes}
                  onChange={(e) => setEditFormData({ ...editFormData, notes: e.target.value })}
                  rows={3}
                  className="input-premium py-2 resize-none"
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                onClick={() => setShowEditModal(false)}
                className="btn-outline px-5 py-2 text-xs uppercase tracking-wider"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveEdit}
                className="inline-flex items-center justify-center gap-1.5 px-5 py-2 rounded-lg bg-primary hover:bg-[#082E6E] text-white text-xs font-semibold uppercase tracking-wider transition-all shadow-sm"
              >
                <Save className="w-4 h-4" />
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}