import { useParams, useNavigate } from "react-router";
import { ArrowLeft, Trophy, Calendar, Swords, CheckCircle, XCircle, Crown } from "lucide-react";
import { getChampionById } from "../data/champion";

export function ChampionHistory() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const champion = getChampionById(id || "");

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

  // Mock defense history data - in real app this would come from API
  const defenseHistory = [
    {
      id: "def-1",
      date: "2026-03-15",
      eventName: "KUN KHMER Championship 2026 - Defense #3",
      opponent: "Piseth Chea",
      result: "Won" as const,
      method: "KO Round 3",
      location: "Phnom Penh"
    },
    {
      id: "def-2",
      date: "2026-01-20",
      eventName: "New Year Fight Night - Defense #2",
      opponent: "Sovann Rath",
      result: "Won" as const,
      method: "Decision",
      location: "Siem Reap"
    },
    {
      id: "def-3",
      date: "2025-11-10",
      eventName: "Year End Championship - Defense #1",
      opponent: "Kosal Meas",
      result: "Won" as const,
      method: "TKO Round 4",
      location: "Phnom Penh"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F4F5F8] via-white to-[#F9FAFB]">
      <div className="p-4 md:p-8 max-w-5xl mx-auto space-y-6">
        {/* Back Button */}
        <button
          onClick={() => navigate(`/home/champion/${champion.id}`)}
          className="inline-flex items-center gap-2 text-[#0A3D91] hover:text-[#082F6E] font-bold transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          Back to Champion Details
        </button>

        {/* Header */}
        <div className="bg-gradient-to-r from-[#F2C94C] to-[#E6B800] rounded-3xl p-8 shadow-xl">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-white/20 backdrop-blur-xl rounded-2xl flex items-center justify-center">
              <Trophy className="w-9 h-9 text-[#1A1A24]" />
            </div>
            <div>
              <h1 className="text-4xl md:text-5xl font-black text-[#1A1A24] uppercase leading-none">
                Title History
              </h1>
              <p className="text-[#1A1A24]/80 font-bold text-lg mt-1">
                {champion.titleName}
              </p>
            </div>
          </div>
        </div>

        {/* Champion Summary */}
        <div className="bg-white rounded-3xl p-6 shadow-[0_8px_30px_rgba(0,0,0,0.08)] border border-[#E0E0E0]/50">
          <div className="flex items-center gap-6">
            {champion.currentHolderPhoto && (
              <img
                src={champion.currentHolderPhoto}
                alt={champion.currentHolderName || ""}
                className="w-20 h-20 rounded-xl object-cover border-2 border-[#E0E0E0]"
              />
            )}
            <div className="flex-1">
              <h2 className="text-2xl font-black text-[#1A1A24] mb-1">
                {champion.currentHolderName || "Vacant"}
              </h2>
              <div className="text-sm font-black text-[#707070]">
                {champion.weightClass}kg {champion.championType}
              </div>
            </div>
            <div className="text-center bg-gradient-to-br from-blue-50 to-white p-4 rounded-xl border border-blue-100">
              <div className="text-3xl font-black text-[#0A3D91] mb-1">
                {champion.defenseCount}
              </div>
              <div className="text-xs font-black text-[#707070] uppercase tracking-wider">
                Successful Defenses
              </div>
            </div>
          </div>
        </div>

        {/* Title Win */}
        <div className="bg-gradient-to-r from-amber-50 via-white to-amber-50 rounded-3xl p-6 shadow-[0_8px_30px_rgba(0,0,0,0.08)] border-2 border-amber-200">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-gradient-to-br from-[#F2C94C] to-[#E6B800] rounded-xl flex items-center justify-center flex-shrink-0">
              <Crown className="w-7 h-7 text-[#1A1A24]" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h3 className="text-xl font-black text-[#1A1A24] uppercase">
                  Title Won
                </h3>
                <span className="px-3 py-1 bg-[#F2C94C] text-[#1A1A24] rounded-lg text-xs font-black uppercase">
                  Championship Fight
                </span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
                <div>
                  <div className="text-xs font-black text-[#707070] uppercase tracking-wider mb-1">
                    Event
                  </div>
                  <div className="text-sm font-black text-[#1A1A24]">
                    {champion.eventName}
                  </div>
                </div>
                {champion.dateAwarded && (
                  <div>
                    <div className="text-xs font-black text-[#707070] uppercase tracking-wider mb-1">
                      Date
                    </div>
                    <div className="text-sm font-black text-[#1A1A24] flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-[#0A3D91]" />
                      {new Date(champion.dateAwarded).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Defense History */}
        <div className="bg-white rounded-3xl p-6 shadow-[0_8px_30px_rgba(0,0,0,0.08)] border border-[#E0E0E0]/50">
          <h2 className="text-xl font-black text-[#1A1A24] uppercase mb-6 flex items-center gap-2">
            <Swords className="w-5 h-5 text-[#0A3D91]" />
            Title Defenses ({defenseHistory.length})
          </h2>

          {defenseHistory.length === 0 ? (
            <div className="text-center py-12">
              <Trophy className="w-16 h-16 text-[#E0E0E0] mx-auto mb-4" />
              <p className="text-[#707070] font-medium text-lg">
                No title defenses yet
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {defenseHistory.map((defense, index) => (
                <div
                  key={defense.id}
                  className="bg-gradient-to-r from-[#F4F5F8] to-white p-5 rounded-2xl border border-[#E0E0E0] hover:border-[#0A3D91] transition-all group"
                >
                  <div className="flex items-start gap-4">
                    {/* Defense Number Badge */}
                    <div className="w-12 h-12 bg-gradient-to-br from-[#0A3D91] to-[#051C42] rounded-xl flex items-center justify-center flex-shrink-0">
                      <div className="text-white font-black">
                        #{defenseHistory.length - index}
                      </div>
                    </div>

                    <div className="flex-1 min-w-0">
                      {/* Event & Date */}
                      <div className="flex flex-wrap items-start justify-between gap-3 mb-3">
                        <div>
                          <h3 className="text-lg font-black text-[#1A1A24] mb-1 group-hover:text-[#0A3D91] transition-colors">
                            {defense.eventName}
                          </h3>
                          <div className="flex items-center gap-2 text-sm font-bold text-[#707070]">
                            <Calendar className="w-4 h-4" />
                            {new Date(defense.date).toLocaleDateString('en-US', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric'
                            })}
                          </div>
                        </div>
                        <span className={`px-3 py-1.5 rounded-lg text-xs font-black uppercase tracking-wider ${
                          defense.result === "Won"
                            ? "bg-green-100 text-green-700"
                            : "bg-red-100 text-red-700"
                        }`}>
                          {defense.result === "Won" ? (
                            <span className="flex items-center gap-1">
                              <CheckCircle className="w-3.5 h-3.5" />
                              Won
                            </span>
                          ) : (
                            <span className="flex items-center gap-1">
                              <XCircle className="w-3.5 h-3.5" />
                              Lost
                            </span>
                          )}
                        </span>
                      </div>

                      {/* Fight Details */}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        <div className="bg-white p-3 rounded-lg border border-[#E0E0E0]">
                          <div className="text-xs font-black text-[#707070] uppercase tracking-wider mb-1">
                            Opponent
                          </div>
                          <div className="text-sm font-black text-[#1A1A24]">
                            {defense.opponent}
                          </div>
                        </div>
                        <div className="bg-white p-3 rounded-lg border border-[#E0E0E0]">
                          <div className="text-xs font-black text-[#707070] uppercase tracking-wider mb-1">
                            Method
                          </div>
                          <div className="text-sm font-black text-[#1A1A24]">
                            {defense.method}
                          </div>
                        </div>
                        <div className="bg-white p-3 rounded-lg border border-[#E0E0E0]">
                          <div className="text-xs font-black text-[#707070] uppercase tracking-wider mb-1">
                            Location
                          </div>
                          <div className="text-sm font-black text-[#1A1A24]">
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
        <div className="bg-gradient-to-r from-[#0A3D91] to-[#051C42] rounded-3xl p-6 text-white shadow-xl">
          <h3 className="text-lg font-black uppercase mb-4">Championship Timeline</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-bold">Title Created</span>
              <span className="font-black">
                {new Date(champion.dateCreated).toLocaleDateString()}
              </span>
            </div>
            {champion.dateAwarded && (
              <div className="flex items-center justify-between">
                <span className="font-bold">Title Won</span>
                <span className="font-black">
                  {new Date(champion.dateAwarded).toLocaleDateString()}
                </span>
              </div>
            )}
            {champion.lastDefenseDate && (
              <div className="flex items-center justify-between">
                <span className="font-bold">Last Defense</span>
                <span className="font-black">
                  {new Date(champion.lastDefenseDate).toLocaleDateString()}
                </span>
              </div>
            )}
            <div className="flex items-center justify-between border-t-2 border-white/20 pt-3">
              <span className="font-bold">Total Defenses</span>
              <span className="text-2xl font-black text-[#F2C94C]">
                {champion.defenseCount}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}