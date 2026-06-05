import { useState } from "react";
import { useNavigate, useParams } from "react-router";
import {
  ArrowLeft, Users, Search, Plus, X, CheckCircle, Trophy,
  Shield, Target, Flame, Award
} from "lucide-react";
import { MOCK_FIGHTERS } from "../data/mock";
import { toast } from "sonner";
import { clsx } from "clsx";

interface AssignedFighter {
  id: string;
  name: string;
  alias: string;
  gym: string;
  record: string;
  weightClass: number;
  grade: string;
  photo: string;
  seedPosition?: number;
}

export function AssignFightersToEvent() {
  const navigate = useNavigate();
  const { eventId } = useParams();

  const [search, setSearch] = useState("");
  const [filterGrade, setFilterGrade] = useState("all");
  const [filterGym, setFilterGym] = useState("all");
  const [assignedFighters, setAssignedFighters] = useState<AssignedFighter[]>([]);
  const [maxSlots] = useState(8); // This would come from tournament config

  // Mock event data - in real app, fetch from API
  const eventData = {
    name: "National Championship 2026",
    category: "National Tournament",
    tournamentFormat: "Single Elimination",
    weightClass: "67kg - Lightweight",
    expectedParticipants: 8
  };

  // Filter fighters
  const eligibleFighters = MOCK_FIGHTERS.filter(f => {
    const matchesSearch = search === "" ||
      f.name.toLowerCase().includes(search.toLowerCase()) ||
      f.alias.toLowerCase().includes(search.toLowerCase()) ||
      f.gym.toLowerCase().includes(search.toLowerCase());

    const matchesGrade = filterGrade === "all" || f.grade === filterGrade;
    const matchesGym = filterGym === "all" || f.gym === filterGym;
    const notAssigned = !assignedFighters.find(af => af.id === f.id);

    return matchesSearch && matchesGrade && matchesGym && notAssigned;
  });

  const handleAssignFighter = (fighter: typeof MOCK_FIGHTERS[0]) => {
    if (assignedFighters.length >= maxSlots) {
      toast.error(`Maximum ${maxSlots} fighters allowed for this tournament`);
      return;
    }

    const assigned: AssignedFighter = {
      id: fighter.id,
      name: fighter.name,
      alias: fighter.alias,
      gym: fighter.gym,
      record: fighter.record,
      weightClass: fighter.weightClass,
      grade: fighter.grade,
      photo: fighter.photo,
      seedPosition: assignedFighters.length + 1
    };

    setAssignedFighters([...assignedFighters, assigned]);
    toast.success(`✅ ${fighter.name} assigned to tournament!`);
  };

  const handleRemoveFighter = (fighterId: string) => {
    setAssignedFighters(assignedFighters.filter(f => f.id !== fighterId));
    toast.info("Fighter removed from tournament");
  };

  const handleConfirmAssignments = () => {
    if (assignedFighters.length < 2) {
      toast.error("At least 2 fighters required for a tournament");
      return;
    }

    toast.success(`✅ ${assignedFighters.length} fighters assigned successfully!`);
    navigate(`/home/events/${eventId}`);
  };

  const uniqueGrades = Array.from(new Set(MOCK_FIGHTERS.map(f => f.grade)));
  const uniqueGyms = Array.from(new Set(MOCK_FIGHTERS.map(f => f.gym)));

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F4F5F8] via-white to-[#F9FAFB]">
      <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-6">
        {/* Back Button */}
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-2 text-[#707070] hover:text-[#0A3D91] font-bold transition-colors group"
        >
          <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
          Back to Event
        </button>

        {/* Header */}
        <div className="bg-white rounded-3xl shadow-lg border-2 border-[#E0E0E0] p-8">
          <div className="flex items-start justify-between gap-6">
            <div className="flex items-start gap-4">
              <div className="w-16 h-16 bg-gradient-to-br from-[#F2C94C] to-[#E6B800] rounded-2xl flex items-center justify-center shadow-lg flex-shrink-0">
                <Trophy className="w-8 h-8 text-[#1A1A24]" />
              </div>
              <div>
                <h1 className="text-4xl md:text-5xl font-black tracking-tight text-[#0A3D91] uppercase leading-none mb-2">
                  Assign Fighters
                </h1>
                <p className="text-[#707070] font-bold text-lg mb-3">
                  {eventData.name}
                </p>
                <div className="flex flex-wrap items-center gap-3">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-100 text-blue-700 rounded-lg text-xs font-black border border-blue-200">
                    <Shield className="w-3.5 h-3.5" />
                    {eventData.tournamentFormat}
                  </span>
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-purple-100 text-purple-700 rounded-lg text-xs font-black border border-purple-200">
                    <Target className="w-3.5 h-3.5" />
                    {eventData.weightClass}
                  </span>
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-amber-100 text-amber-700 rounded-lg text-xs font-black border border-amber-200">
                    <Users className="w-3.5 h-3.5" />
                    {assignedFighters.length}/{eventData.expectedParticipants} Slots
                  </span>
                </div>
              </div>
            </div>

            <button
              onClick={handleConfirmAssignments}
              disabled={assignedFighters.length < 2}
              className="inline-flex items-center gap-2 bg-gradient-to-r from-[#10B981] to-[#059669] text-white px-6 py-3.5 rounded-xl font-black uppercase tracking-wide hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <CheckCircle className="w-5 h-5" />
              Confirm Assignments
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left: Available Fighters */}
          <div className="lg:col-span-2 space-y-6">
            {/* Filters */}
            <div className="bg-white rounded-2xl shadow-lg border-2 border-[#E0E0E0] p-6">
              <h2 className="text-xl font-black text-[#1A1A24] mb-4 uppercase tracking-tight">
                Available Fighters
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="relative group">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#707070] group-focus-within:text-[#0A3D91] transition-colors" />
                  <input
                    type="text"
                    placeholder="Search fighters..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full bg-[#F4F5F8] border-2 border-[#E0E0E0] rounded-xl pl-12 pr-4 py-3 text-sm text-[#1A1A24] font-bold focus:outline-none focus:border-[#0A3D91] focus:ring-2 focus:ring-[#0A3D91]/20 transition-all"
                  />
                </div>

                <select
                  value={filterGrade}
                  onChange={(e) => setFilterGrade(e.target.value)}
                  className="w-full bg-[#F4F5F8] border-2 border-[#E0E0E0] rounded-xl px-4 py-3 text-sm text-[#1A1A24] font-black focus:outline-none focus:border-[#0A3D91] focus:ring-2 focus:ring-[#0A3D91]/20 transition-all hover:border-[#0A3D91]/50 cursor-pointer"
                >
                  <option value="all">All Grades</option>
                  {uniqueGrades.map(grade => (
                    <option key={grade} value={grade}>{grade}</option>
                  ))}
                </select>

                <select
                  value={filterGym}
                  onChange={(e) => setFilterGym(e.target.value)}
                  className="w-full bg-[#F4F5F8] border-2 border-[#E0E0E0] rounded-xl px-4 py-3 text-sm text-[#1A1A24] font-black focus:outline-none focus:border-[#0A3D91] focus:ring-2 focus:ring-[#0A3D91]/20 transition-all hover:border-[#0A3D91]/50 cursor-pointer"
                >
                  <option value="all">All Gyms</option>
                  {uniqueGyms.map(gym => (
                    <option key={gym} value={gym}>{gym}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Fighters List */}
            <div className="bg-white rounded-2xl shadow-lg border-2 border-[#E0E0E0] overflow-hidden">
              <div className="max-h-[600px] overflow-y-auto">
                {eligibleFighters.length === 0 ? (
                  <div className="p-12 text-center">
                    <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                      <Users className="w-8 h-8 text-gray-400" />
                    </div>
                    <p className="text-[#707070] font-bold">No eligible fighters found</p>
                    <p className="text-sm text-[#B0B0B0] mt-1">Try adjusting your filters</p>
                  </div>
                ) : (
                  <div className="divide-y divide-[#E0E0E0]">
                    {eligibleFighters.map((fighter) => (
                      <div
                        key={fighter.id}
                        className="p-5 hover:bg-[#F9FAFB] transition-colors group"
                      >
                        <div className="flex items-center gap-4">
                          <img
                            src={fighter.photo}
                            alt={fighter.name}
                            className="w-16 h-16 rounded-xl object-cover border-2 border-[#E0E0E0] group-hover:border-[#0A3D91] transition-all"
                          />

                          <div className="flex-1 min-w-0">
                            <h3 className="font-black text-base text-[#1A1A24] mb-1">
                              {fighter.name}
                              {fighter.alias && (
                                <span className="text-sm text-[#707070] font-medium ml-2">
                                  "{fighter.alias}"
                                </span>
                              )}
                            </h3>
                            <div className="flex flex-wrap items-center gap-2 text-xs">
                              <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-700 rounded font-bold">
                                <Award className="w-3 h-3" />
                                {fighter.grade}
                              </span>
                              <span className="text-[#707070] font-bold">{fighter.gym}</span>
                              <span className="text-[#707070] font-bold">•</span>
                              <span className="text-[#707070] font-bold">{fighter.record}</span>
                              <span className="text-[#707070] font-bold">•</span>
                              <span className="text-[#707070] font-bold">{fighter.weightClass}kg</span>
                            </div>
                          </div>

                          <button
                            onClick={() => handleAssignFighter(fighter)}
                            disabled={assignedFighters.length >= maxSlots}
                            className="inline-flex items-center gap-2 bg-gradient-to-r from-[#0A3D91] to-[#082F6E] text-white px-4 py-2.5 rounded-xl text-sm font-black transition-all hover:shadow-lg hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            <Plus className="w-4 h-4" />
                            Assign
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right: Assigned Fighters */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-lg border-2 border-[#E0E0E0] sticky top-4">
              <div className="border-b-2 border-[#E0E0E0] p-6">
                <h2 className="text-xl font-black text-[#1A1A24] uppercase tracking-tight flex items-center justify-between">
                  <span>Tournament Roster</span>
                  <span className={clsx(
                    "text-sm px-3 py-1 rounded-lg font-black",
                    assignedFighters.length >= eventData.expectedParticipants
                      ? "bg-green-100 text-green-700"
                      : assignedFighters.length >= 2
                        ? "bg-yellow-100 text-yellow-700"
                        : "bg-gray-100 text-gray-700"
                  )}>
                    {assignedFighters.length}/{eventData.expectedParticipants}
                  </span>
                </h2>
              </div>

              <div className="max-h-[600px] overflow-y-auto">
                {assignedFighters.length === 0 ? (
                  <div className="p-8 text-center">
                    <div className="w-16 h-16 bg-gradient-to-br from-[#F2C94C]/20 to-[#E6B800]/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                      <Trophy className="w-8 h-8 text-[#F2C94C]" />
                    </div>
                    <p className="text-[#707070] font-bold text-sm">No fighters assigned yet</p>
                    <p className="text-xs text-[#B0B0B0] mt-1">Start adding fighters from the left</p>
                  </div>
                ) : (
                  <div className="divide-y divide-[#E0E0E0]">
                    {assignedFighters.map((fighter, index) => (
                      <div key={fighter.id} className="p-4 hover:bg-[#F9FAFB] transition-colors group">
                        <div className="flex items-start gap-3">
                          <div className="w-8 h-8 bg-gradient-to-br from-[#F2C94C] to-[#E6B800] rounded-lg flex items-center justify-center flex-shrink-0 font-black text-[#1A1A24] shadow-sm">
                            {index + 1}
                          </div>

                          <div className="flex-1 min-w-0">
                            <h4 className="font-black text-sm text-[#1A1A24] mb-1 truncate">
                              {fighter.name}
                            </h4>
                            <div className="text-xs text-[#707070] font-bold space-y-0.5">
                              <div>{fighter.gym}</div>
                              <div className="flex items-center gap-1">
                                <Flame className="w-3 h-3 text-orange-500" />
                                {fighter.record}
                              </div>
                            </div>
                          </div>

                          <button
                            onClick={() => handleRemoveFighter(fighter.id)}
                            className="w-7 h-7 rounded-lg bg-red-100 hover:bg-red-200 text-red-600 flex items-center justify-center transition-all opacity-0 group-hover:opacity-100"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {assignedFighters.length > 0 && (
                <div className="border-t-2 border-[#E0E0E0] p-4">
                  <button
                    onClick={handleConfirmAssignments}
                    disabled={assignedFighters.length < 2}
                    className="w-full inline-flex items-center justify-center gap-2 bg-gradient-to-r from-[#10B981] to-[#059669] text-white px-4 py-3 rounded-xl text-sm font-black transition-all hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <CheckCircle className="w-4 h-4" />
                    Confirm {assignedFighters.length} Fighter{assignedFighters.length !== 1 ? 's' : ''}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
