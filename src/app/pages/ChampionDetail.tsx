import { useState } from "react";
import { useParams, useNavigate, Link } from "react-router";
import {
  ArrowLeft, Crown, Trophy, Calendar, MapPin, Shield, Weight,
  Award, Star, User, CheckCircle, Clock, History, CalendarClock,
  Target, Edit, Trash2, TrendingUp, Swords, XCircle, AlertTriangle
} from "lucide-react";
import { getChampionById, CHAMPION_TYPE_CONFIG, CHAMPION_STATUS_CONFIG } from "../data/champion";
import { usePermissions } from "../hooks/usePermissions";

export function ChampionDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const permissions = usePermissions();
  const [showVacateModal, setShowVacateModal] = useState(false);
  const [vacateReason, setVacateReason] = useState("");

  const champion = getChampionById(id || "");

  const handleVacateTitle = () => {
    // In a real app, this would make an API call to update the championship status
    console.log("Vacating title:", champion?.id, "Reason:", vacateReason);
    // For now, just close the modal and navigate back
    setShowVacateModal(false);
    alert(`Title has been vacated. Reason: ${vacateReason || "Not specified"}`);
    navigate("/home/champion");
  };

  if (!champion) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#F4F5F8] via-white to-[#F9FAFB] flex items-center justify-center p-8">
        <div className="text-center">
          <Trophy className="w-20 h-20 text-[#E0E0E0] mx-auto mb-6" />
          <h2 className="text-3xl font-black text-[#1A1A24] mb-3">Championship Not Found</h2>
          <p className="text-[#707070] font-medium text-lg mb-8">
            The championship you're looking for doesn't exist.
          </p>
          <button
            onClick={() => navigate("/home/champion")}
            className="inline-flex items-center gap-2 bg-[#0A3D91] text-white px-6 py-3 rounded-xl font-bold hover:bg-[#082F6E] transition-all"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to Champions
          </button>
        </div>
      </div>
    );
  }

  const typeConfig = CHAMPION_TYPE_CONFIG[champion.championType];
  const statusConfig = CHAMPION_STATUS_CONFIG[champion.status];

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F4F5F8] via-white to-[#F9FAFB]">
      <div className="p-4 md:p-8 max-w-6xl mx-auto space-y-6">
        {/* Back Button */}
        <button
          onClick={() => navigate("/home/champion")}
          className="inline-flex items-center gap-2 text-[#0A3D91] hover:text-[#082F6E] font-bold transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          Back to Champions
        </button>

        {/* Hero Header */}
        <div className="bg-gradient-to-r from-[#0A3D91] via-[#051C42] to-[#1A1A24] rounded-3xl overflow-hidden shadow-2xl">
          <div className="relative">
            {/* Background Image */}
            {champion.currentHolderPhoto && (
              <>
                <img
                  src={champion.currentHolderPhoto}
                  alt={champion.currentHolderName || "Champion"}
                  className="absolute inset-0 w-full h-full object-cover opacity-20"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-[#0A3D91]/90 via-[#051C42]/90 to-[#1A1A24]/90" />
              </>
            )}

            {/* Content */}
            <div className="relative p-8 md:p-12">
              <div className="flex flex-col md:flex-row gap-8 items-start md:items-center">
                {/* Champion Photo */}
                <div className="relative flex-shrink-0">
                  {champion.currentHolderPhoto ? (
                    <img
                      src={champion.currentHolderPhoto}
                      alt={champion.currentHolderName || "Vacant"}
                      className="w-32 h-32 md:w-40 md:h-40 rounded-2xl object-cover border-4 border-[#F2C94C] shadow-2xl"
                    />
                  ) : (
                    <div className="w-32 h-32 md:w-40 md:h-40 rounded-2xl bg-gradient-to-br from-gray-600 to-gray-700 flex items-center justify-center border-4 border-[#F2C94C] shadow-2xl">
                      <Trophy className="w-20 h-20 text-white" />
                    </div>
                  )}
                  {champion.status === "Active" && champion.currentHolderName && (
                    <div className="absolute -bottom-3 -right-3 w-16 h-16 bg-gradient-to-br from-[#F2C94C] to-[#E6B800] rounded-full flex items-center justify-center border-4 border-white shadow-xl">
                      <Crown className="w-8 h-8 text-[#1A1A24]" />
                    </div>
                  )}
                </div>

                {/* Champion Info */}
                <div className="flex-1">
                  <div className="flex items-start gap-3 mb-4">
                    <span className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider ${statusConfig.bgColor} ${statusConfig.color}`}>
                      {statusConfig.label}
                    </span>
                    <span className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider ${typeConfig.bgColor} ${typeConfig.color}`}>
                      {typeConfig.icon} {typeConfig.label}
                    </span>
                  </div>

                  <h1 className="text-5xl md:text-6xl font-black text-white mb-3 leading-none">
                    {champion.currentHolderName || "VACANT"}
                  </h1>
                  
                  <div className="text-2xl font-black text-[#F2C94C] mb-4">
                    {champion.weightClass}kg {champion.championType}
                  </div>

                  <div className="flex flex-wrap items-center gap-6 text-white/80">
                    {champion.nationality && (
                      <div className="flex items-center gap-2">
                        <User className="w-5 h-5" />
                        <span className="font-bold">{champion.nationality}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-2">
                      <Shield className="w-5 h-5" />
                      <span className="font-bold">{champion.organization}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-5 h-5" />
                      <span className="font-bold">{champion.defenseCount} Defenses</span>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                {permissions.hasPermission('events.create') && (
                  <div className="flex flex-col gap-3">
                    <button
                      onClick={() => navigate(`/home/champion/${champion.id}/edit`)}
                      className="inline-flex items-center justify-center gap-2 bg-white text-[#0A3D91] px-6 py-3 rounded-xl font-bold hover:bg-gray-100 transition-all"
                    >
                      <Edit className="w-5 h-5" />
                      Edit
                    </button>
                    {champion.status === "Active" && (
                      <>
                        <button
                          onClick={() => navigate(`/home/champion/${champion.id}/schedule-defense`)}
                          className="inline-flex items-center justify-center gap-2 bg-gradient-to-r from-[#F2C94C] to-[#E6B800] text-[#1A1A24] px-6 py-3 rounded-xl font-bold hover:from-[#E6B800] hover:to-[#D4A000] transition-all"
                        >
                          <CalendarClock className="w-5 h-5" />
                          Schedule Defense
                        </button>
                        <button
                          onClick={() => setShowVacateModal(true)}
                          className="inline-flex items-center justify-center gap-2 bg-red-500 hover:bg-red-600 text-white px-6 py-3 rounded-xl font-bold transition-all"
                        >
                          <XCircle className="w-5 h-5" />
                          Vacate Title
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
            <div className="bg-white rounded-3xl p-6 shadow-[0_8px_30px_rgba(0,0,0,0.08)] border border-[#E0E0E0]/50">
              <h2 className="text-xl font-black text-[#1A1A24] uppercase mb-6 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-[#0A3D91]" />
                Championship Statistics
              </h2>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-gradient-to-br from-blue-50 to-white p-4 rounded-xl border border-blue-100">
                  <div className="text-3xl font-black text-[#0A3D91] mb-1">
                    {champion.defenseCount}
                  </div>
                  <div className="text-xs font-black text-[#707070] uppercase tracking-wider">
                    Title Defenses
                  </div>
                </div>

                <div className="bg-gradient-to-br from-amber-50 to-white p-4 rounded-xl border border-amber-100">
                  <div className="text-3xl font-black text-[#F2C94C] mb-1">
                    {champion.weightClass}kg
                  </div>
                  <div className="text-xs font-black text-[#707070] uppercase tracking-wider">
                    Weight Class
                  </div>
                </div>

                <div className="bg-gradient-to-br from-green-50 to-white p-4 rounded-xl border border-green-100">
                  <div className="text-3xl font-black text-green-600 mb-1">
                    {champion.specialTitles?.length || 0}
                  </div>
                  <div className="text-xs font-black text-[#707070] uppercase tracking-wider">
                    Special Awards
                  </div>
                </div>

                <div className="bg-gradient-to-br from-red-50 to-white p-4 rounded-xl border border-red-100">
                  <div className="text-3xl font-black text-[#C8102E] mb-1">
                    {champion.organization}
                  </div>
                  <div className="text-xs font-black text-[#707070] uppercase tracking-wider">
                    Organization
                  </div>
                </div>
              </div>
            </div>

            {/* Title Won At */}
            <div className="bg-white rounded-3xl p-6 shadow-[0_8px_30px_rgba(0,0,0,0.08)] border border-[#E0E0E0]/50">
              <h2 className="text-xl font-black text-[#1A1A24] uppercase mb-6 flex items-center gap-2">
                <Trophy className="w-5 h-5 text-[#FFB81C]" />
                Title Won At
              </h2>

              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-[#0A3D91] mt-0.5 flex-shrink-0" />
                  <div>
                    <div className="text-sm font-black text-[#707070] uppercase tracking-wider mb-1">
                      Event Name
                    </div>
                    <div className="text-lg font-black text-[#1A1A24]">
                      {champion.eventName}
                    </div>
                  </div>
                </div>

                {champion.dateAwarded && (
                  <div className="flex items-start gap-3">
                    <Calendar className="w-5 h-5 text-[#0A3D91] mt-0.5 flex-shrink-0" />
                    <div>
                      <div className="text-sm font-black text-[#707070] uppercase tracking-wider mb-1">
                        Date Won
                      </div>
                      <div className="text-lg font-black text-[#1A1A24]">
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
                    <Shield className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <div className="text-sm font-black text-[#707070] uppercase tracking-wider mb-1">
                        Last Defense
                      </div>
                      <div className="text-lg font-black text-[#1A1A24]">
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
                    <Clock className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <div className="text-sm font-black text-[#707070] uppercase tracking-wider mb-1">
                        Next Defense Deadline
                      </div>
                      <div className="text-lg font-black text-[#1A1A24]">
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
              <div className="bg-white rounded-3xl p-6 shadow-[0_8px_30px_rgba(0,0,0,0.08)] border border-[#E0E0E0]/50">
                <h2 className="text-xl font-black text-[#1A1A24] uppercase mb-6 flex items-center gap-2">
                  <Star className="w-5 h-5 text-[#FFB81C]" />
                  Special Awards
                </h2>

                <div className="flex flex-wrap gap-3">
                  {champion.specialTitles.map((title, index) => (
                    <div
                      key={index}
                      className="bg-gradient-to-r from-amber-50 to-white border-2 border-amber-200 px-4 py-3 rounded-xl"
                    >
                      <div className="flex items-center gap-2">
                        <Award className="w-5 h-5 text-[#F2C94C]" />
                        <span className="font-black text-[#1A1A24]">{title}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Notes */}
            {champion.notes && (
              <div className="bg-white rounded-3xl p-6 shadow-[0_8px_30px_rgba(0,0,0,0.08)] border border-[#E0E0E0]/50">
                <h2 className="text-xl font-black text-[#1A1A24] uppercase mb-4 flex items-center gap-2">
                  <Star className="w-5 h-5 text-[#707070]" />
                  Notes
                </h2>
                <p className="text-[#1A1A24] font-medium leading-relaxed">
                  {champion.notes}
                </p>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <div className="bg-white rounded-3xl p-6 shadow-[0_8px_30px_rgba(0,0,0,0.08)] border border-[#E0E0E0]/50">
              <h2 className="text-lg font-black text-[#1A1A24] uppercase mb-4">
                Quick Actions
              </h2>
              <div className="space-y-3">
                <Link
                  to={`/home/champion/${champion.id}/history`}
                  className="flex items-center gap-3 bg-[#F4F5F8] hover:bg-[#0A3D91] text-[#1A1A24] hover:text-white p-4 rounded-xl font-bold transition-all group"
                >
                  <History className="w-5 h-5" />
                  <span>View Title History</span>
                </Link>

                {champion.status === "Vacant" && permissions.hasPermission('events.create') && (
                  <Link
                    to={`/home/match/new?championId=${champion.id}`}
                    className="flex items-center gap-3 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white p-4 rounded-xl font-bold transition-all"
                  >
                    <Target className="w-5 h-5" />
                    <span>Schedule Title Fight</span>
                  </Link>
                )}

                {champion.currentHolderName && (
                  <Link
                    to={`/home/fighters/${champion.currentHolderId}`}
                    className="flex items-center gap-3 bg-[#F4F5F8] hover:bg-[#0A3D91] text-[#1A1A24] hover:text-white p-4 rounded-xl font-bold transition-all"
                  >
                    <User className="w-5 h-5" />
                    <span>View Fighter Profile</span>
                  </Link>
                )}

                <Link
                  to={`/home/batches/${champion.batchId}`}
                  className="flex items-center gap-3 bg-[#F4F5F8] hover:bg-[#0A3D91] text-[#1A1A24] hover:text-white p-4 rounded-xl font-bold transition-all"
                >
                  <Swords className="w-5 h-5" />
                  <span>View Event</span>
                </Link>
              </div>
            </div>

            {/* Championship Info Card */}
            <div className="bg-gradient-to-br from-[#0A3D91] to-[#051C42] rounded-3xl p-6 text-white shadow-xl">
              <div className="flex items-center gap-3 mb-6">
                <Crown className="w-8 h-8 text-[#F2C94C]" />
                <h2 className="text-lg font-black uppercase">Championship Info</h2>
              </div>

              <div className="space-y-4">
                <div>
                  <div className="text-xs font-black text-white/60 uppercase tracking-wider mb-1">
                    Title Name
                  </div>
                  <div className="text-sm font-black text-white">
                    {champion.titleName}
                  </div>
                </div>

                <div>
                  <div className="text-xs font-black text-white/60 uppercase tracking-wider mb-1">
                    Created
                  </div>
                  <div className="text-sm font-black text-white">
                    {new Date(champion.dateCreated).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </div>
                </div>

                <div>
                  <div className="text-xs font-black text-white/60 uppercase tracking-wider mb-1">
                    Event/Batch
                  </div>
                  <div className="text-sm font-black text-white">
                    {champion.eventName}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Vacate Title Modal */}
        {showVacateModal && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full p-8">
              <div className="flex items-start gap-4 mb-6">
                <div className="w-14 h-14 bg-red-100 rounded-2xl flex items-center justify-center flex-shrink-0">
                  <AlertTriangle className="w-7 h-7 text-red-600" />
                </div>
                <div>
                  <h3 className="text-2xl font-black text-[#1A1A24] mb-2">
                    Vacate Championship Title
                  </h3>
                  <p className="text-[#707070] font-medium">
                    This will mark the <strong>{champion.weightClass}kg {champion.championType}</strong> title as vacant and remove {champion.currentHolderName} as the current holder.
                  </p>
                </div>
              </div>

              <div className="mb-6">
                <label className="block text-sm font-black text-[#1A1A24] mb-2 uppercase tracking-wider">
                  Reason for Vacancy (Optional)
                </label>
                <select
                  value={vacateReason}
                  onChange={(e) => setVacateReason(e.target.value)}
                  className="w-full bg-[#F4F5F8] border-2 border-[#E0E0E0] rounded-xl px-4 py-3 text-[#1A1A24] font-semibold focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all"
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

              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setShowVacateModal(false);
                    setVacateReason("");
                  }}
                  className="flex-1 px-6 py-3 bg-[#F4F5F8] hover:bg-[#E0E0E0] text-[#1A1A24] rounded-xl font-bold transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={handleVacateTitle}
                  className="flex-1 px-6 py-3 bg-red-500 hover:bg-red-600 text-white rounded-xl font-bold transition-all"
                >
                  Confirm Vacancy
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}