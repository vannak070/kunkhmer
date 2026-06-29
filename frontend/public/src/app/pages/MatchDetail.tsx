import { useState } from "react";
import { useParams, Link, useNavigate } from "react-router";
import { 
  ArrowLeft, Calendar, MapPin, Activity, FileText, 
  Trophy, Users, Shield, Edit2, Save, X, Video, Clock
} from "lucide-react";
import { MOCK_MATCHES } from "../data/mock";
import { MOCK_JUDGES, MOCK_REFEREES } from "../data/officials";
import { WorkflowHistory } from "../components/WorkflowHistory";
import { toast } from "sonner";

export function MatchDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const match = MOCK_MATCHES.find((m) => m.id === id) || MOCK_MATCHES[0];

  // Mock data: In real app, these would come from match.referee and match.judges
  // Check if match has officials assigned (in real app: match.referee and match.judges)
  const hasOfficials = true; // Set to false to show "no officials" state
  const assignedReferee = hasOfficials ? MOCK_REFEREES[0] : null;
  const assignedJudges = hasOfficials ? [MOCK_JUDGES[0], MOCK_JUDGES[1], MOCK_JUDGES[2]] : [];

  // Result editing state
  const [isEditingResult, setIsEditingResult] = useState(false);
  const [result, setResult] = useState({
    winner: match.result?.winner || "",
    method: match.result?.method || "",
    round: match.result?.round?.toString() || "",
    highlightVideo: "",
  });

  // Get match type badge
  const getMatchTypeBadge = () => {
    if (match.status === "Completed") return "Championship";
    return "Ranking Fight";
  };

  const handleSaveResult = () => {
    // Update the match with new result data (in real app, this would be an API call)
    toast.success("✅ Match result updated successfully!");
    setIsEditingResult(false);
  };

  const handleCancelEdit = () => {
    setResult({
      winner: match.result?.winner || "",
      method: match.result?.method || "",
      round: match.result?.round?.toString() || "",
      highlightVideo: "",
    });
    setIsEditingResult(false);
  };

  return (
    <div className="min-h-screen bg-[#F9FAFB] py-8">
      <div className="max-w-6xl mx-auto px-4 md:px-8 space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Link 
            to="/home/matches" 
            className="p-3 bg-white hover:bg-[#F4F5F8] border border-[#E0E0E0] rounded-xl text-[#1A1A24] transition-all shadow-sm"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-3xl font-black text-[#1A1A24] uppercase tracking-tight">
              Match Details
            </h1>
            <p className="text-[#707070] font-bold text-sm">
              {match.id}
            </p>
          </div>
        </div>

        {/* Info Cards Row */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Event Card */}
          <div className="bg-white rounded-2xl p-6 border border-[#E0E0E0] shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center">
                <FileText className="w-5 h-5 text-[#0A3D91]" />
              </div>
              <div className="text-xs font-black text-[#B0B0B0] uppercase">Event</div>
            </div>
            <div className="font-black text-[#1A1A24] text-lg">Fight Night March 30</div>
          </div>

          {/* Date Card */}
          <div className="bg-white rounded-2xl p-6 border border-[#E0E0E0] shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-red-50 rounded-lg flex items-center justify-center">
                <Calendar className="w-5 h-5 text-[#C8102E]" />
              </div>
              <div className="text-xs font-black text-[#B0B0B0] uppercase">Date</div>
            </div>
            <div className="font-black text-[#1A1A24] text-lg">2026-03-30</div>
          </div>

          {/* Location Card */}
          <div className="bg-white rounded-2xl p-6 border border-[#E0E0E0] shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-yellow-50 rounded-lg flex items-center justify-center">
                <MapPin className="w-5 h-5 text-[#F2C94C]" />
              </div>
              <div className="text-xs font-black text-[#B0B0B0] uppercase">Location</div>
            </div>
            <div className="font-black text-[#1A1A24] text-lg">Siem Reap, Cambodia</div>
          </div>

          {/* Status Card */}
          <div className="bg-white rounded-2xl p-6 border border-[#E0E0E0] shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center">
                <Activity className="w-5 h-5 text-[#0A3D91]" />
              </div>
              <div className="text-xs font-black text-[#B0B0B0] uppercase">Status</div>
            </div>
            <div className="font-black text-[#0A3D91] text-lg uppercase">Scheduled</div>
          </div>
        </div>

        {/* Fighter VS Section */}
        <div className="bg-white rounded-3xl border border-[#E0E0E0] shadow-sm overflow-hidden">
          {/* Color Bar at Top */}
          <div className="h-2 flex">
            <div className="flex-1 bg-gradient-to-r from-[#C8102E] to-[#A00D24]" />
            <div className="flex-1 bg-gradient-to-l from-[#0A3D91] to-[#051C42]" />
          </div>

          <div className="p-8 md:p-12">
            <div className="flex flex-col md:flex-row items-center justify-between gap-8 max-w-5xl mx-auto">
              {/* Red Corner Fighter */}
              <div className="flex flex-col items-center flex-1">
                <div className="relative mb-6">
                  <img 
                    src={match.fighterA.image} 
                    alt={match.fighterA.name}
                    className="w-32 h-32 md:w-40 md:h-40 rounded-full object-cover border-4 border-white shadow-xl"
                  />
                  <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 bg-gradient-to-r from-[#C8102E] to-[#A00D24] text-white text-xs font-black uppercase px-4 py-1.5 rounded-lg shadow-lg">
                    Red Corner
                  </div>
                </div>
                <h2 className="text-2xl md:text-3xl font-black text-[#1A1A24] mb-2 text-center">
                  {match.fighterA.name}
                </h2>
                <div className="flex items-center gap-2 mb-3">
                  <span className="px-3 py-1 bg-[#C8102E] text-white text-xs font-black rounded-md">
                    Grade B
                  </span>
                  <span className="text-[#707070] font-mono font-bold">57 kg</span>
                </div>
                <div className="text-sm text-[#707070] font-bold">3-0-0</div>
                <div className="text-xs text-[#B0B0B0] mt-1">Victory Gym</div>
              </div>

              {/* VS Center */}
              <div className="flex flex-col items-center px-8">
                {/* Match Type Badge */}
                <div className="flex items-center gap-2 mb-4 px-4 py-2 bg-blue-50 rounded-lg">
                  <Shield className="w-4 h-4 text-[#0A3D91]" />
                  <span className="text-xs font-black text-[#0A3D91] uppercase tracking-wider">
                    {getMatchTypeBadge()}
                  </span>
                </div>

                <div className="text-6xl md:text-7xl font-black italic text-[#1A1A24] mb-4 tracking-tighter">
                  VS
                </div>

                {/* Weight & Rounds */}
                <div className="flex flex-col items-center gap-2">
                  <div className="flex items-center gap-2 px-4 py-2 bg-[#F4F5F8] rounded-lg">
                    <Trophy className="w-4 h-4 text-[#707070]" />
                    <span className="text-sm font-black text-[#707070]">57kg</span>
                  </div>
                  <div className="px-6 py-2 bg-[#0A3D91] text-white rounded-full font-black text-sm uppercase tracking-wider">
                    3 Rounds
                  </div>
                </div>
              </div>

              {/* Blue Corner Fighter */}
              <div className="flex flex-col items-center flex-1">
                <div className="relative mb-6">
                  <img 
                    src={match.fighterB.image} 
                    alt={match.fighterB.name}
                    className="w-32 h-32 md:w-40 md:h-40 rounded-full object-cover border-4 border-white shadow-xl"
                  />
                  <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 bg-gradient-to-l from-[#0A3D91] to-[#051C42] text-white text-xs font-black uppercase px-4 py-1.5 rounded-lg shadow-lg">
                    Blue Corner
                  </div>
                </div>
                <h2 className="text-2xl md:text-3xl font-black text-[#1A1A24] mb-2 text-center">
                  {match.fighterB.name}
                </h2>
                <div className="flex items-center gap-2 mb-3">
                  <span className="px-3 py-1 bg-[#0A3D91] text-white text-xs font-black rounded-md">
                    Grade B
                  </span>
                  <span className="text-[#707070] font-mono font-bold">57 kg</span>
                </div>
                <div className="text-sm text-[#707070] font-bold">2-1-0</div>
                <div className="text-xs text-[#B0B0B0] mt-1">Victory Gym</div>
              </div>
            </div>
          </div>
        </div>

        {/* Officials Section - NEW */}
        <div className="bg-white rounded-2xl border border-[#E0E0E0] shadow-sm overflow-hidden">
          <div className="bg-gradient-to-r from-purple-50 to-blue-50 px-6 py-4 border-b border-[#E0E0E0]">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-blue-600 rounded-lg flex items-center justify-center">
                <Users className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-lg font-black text-[#1A1A24] uppercase">Match Officials</h2>
                <p className="text-xs text-[#707070] font-medium">Assigned judges and referee for this match</p>
              </div>
            </div>
          </div>

          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Judges */}
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                    <Users className="w-4 h-4 text-purple-700" />
                  </div>
                  <h3 className="text-sm font-black text-[#1A1A24] uppercase">Judges</h3>
                  <span className="text-xs font-bold text-purple-700 bg-purple-50 px-2 py-1 rounded">
                    {assignedJudges.length}
                  </span>
                </div>
                <div className="space-y-3">
                  {assignedJudges.map((judge, idx) => (
                    <div 
                      key={judge.id}
                      className="flex items-center gap-3 p-4 bg-purple-50 rounded-xl border border-purple-200"
                    >
                      <div className="w-10 h-10 bg-purple-600 rounded-full flex items-center justify-center text-white font-black">
                        {idx + 1}
                      </div>
                      <div className="flex-1">
                        <div className="font-black text-[#1A1A24]">{judge.name}</div>
                        <div className="flex items-center gap-2 text-xs mt-1">
                          <span className="text-purple-700 font-bold">{judge.grade}</span>
                          <span className="text-[#707070]">•</span>
                          <span className="text-[#707070] font-medium">{judge.experience}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Referee */}
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Shield className="w-4 h-4 text-blue-700" />
                  </div>
                  <h3 className="text-sm font-black text-[#1A1A24] uppercase">Referee</h3>
                </div>
                <div className="p-6 bg-blue-50 rounded-xl border border-blue-200">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center">
                      <Shield className="w-8 h-8 text-white" />
                    </div>
                    <div className="flex-1">
                      <div className="font-black text-[#1A1A24] text-lg mb-1">
                        {assignedReferee ? assignedReferee.name : "No Referee Assigned"}
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <span className="text-blue-700 font-bold">{assignedReferee ? assignedReferee.grade : "N/A"}</span>
                        <span className="text-[#707070]">•</span>
                        <span className="text-[#707070] font-medium">{assignedReferee ? assignedReferee.experience : "N/A"}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Match Result Section */}
        <div className="bg-white rounded-2xl border border-[#E0E0E0] shadow-sm overflow-hidden">
          <div className="bg-[#0A3D91] px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Trophy className="w-6 h-6 text-[#F2C94C]" />
              <h2 className="text-lg font-black text-white uppercase">Match Result</h2>
            </div>
            {!isEditingResult && (
              <button
                onClick={() => setIsEditingResult(true)}
                className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 border border-white/20 text-white rounded-lg font-bold transition-all"
              >
                <Edit2 className="w-4 h-4" />
                Update Result
              </button>
            )}
          </div>

          <div className="p-6">
            {isEditingResult ? (
              <>
                {/* Edit Mode */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-black text-[#1A1A24] uppercase mb-2">
                      Winner
                    </label>
                    <select
                      value={result.winner}
                      onChange={(e) => setResult({ ...result, winner: e.target.value })}
                      className="w-full px-4 py-3 border-2 border-[#E0E0E0] rounded-xl font-bold text-[#1A1A24] focus:border-[#0A3D91] focus:outline-none"
                    >
                      <option value="">Select Winner</option>
                      <option value={match.fighterA.name}>{match.fighterA.name} (Red Corner)</option>
                      <option value={match.fighterB.name}>{match.fighterB.name} (Blue Corner)</option>
                      <option value="Draw">Draw</option>
                      <option value="No Contest">No Contest</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-black text-[#1A1A24] uppercase mb-2">
                      Method
                    </label>
                    <select
                      value={result.method}
                      onChange={(e) => setResult({ ...result, method: e.target.value })}
                      className="w-full px-4 py-3 border-2 border-[#E0E0E0] rounded-xl font-bold text-[#1A1A24] focus:border-[#0A3D91] focus:outline-none"
                      disabled={!result.winner || result.winner === "Draw" || result.winner === "No Contest"}
                    >
                      <option value="">Select Method</option>
                      <option value="KO">Knockout (KO)</option>
                      <option value="TKO">Technical Knockout (TKO)</option>
                      <option value="Decision">Decision</option>
                      <option value="Submission">Submission</option>
                      <option value="Disqualification">Disqualification</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-black text-[#1A1A24] uppercase mb-2">
                      Round (if applicable)
                    </label>
                    <select
                      value={result.round}
                      onChange={(e) => setResult({ ...result, round: e.target.value })}
                      className="w-full px-4 py-3 border-2 border-[#E0E0E0] rounded-xl font-bold text-[#1A1A24] focus:border-[#0A3D91] focus:outline-none"
                      disabled={result.method === "Decision"}
                    >
                      <option value="">Not Applicable</option>
                      {Array.from({ length: match.rounds }, (_, i) => (
                        <option key={i + 1} value={i + 1}>Round {i + 1}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-black text-[#1A1A24] uppercase mb-2 flex items-center gap-2">
                      <Video className="w-4 h-4 text-[#C8102E]" />
                      Highlight Video URL
                    </label>
                    <input
                      type="url"
                      value={result.highlightVideo}
                      onChange={(e) => setResult({ ...result, highlightVideo: e.target.value })}
                      placeholder="https://youtube.com/watch?v=..."
                      className="w-full px-4 py-3 border-2 border-[#E0E0E0] rounded-xl font-semibold text-[#1A1A24] focus:border-[#0A3D91] focus:outline-none"
                    />
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center gap-3 pt-6 border-t border-[#E0E0E0] mt-6">
                  <button
                    onClick={handleSaveResult}
                    disabled={!result.winner}
                    className={`inline-flex items-center gap-2 px-6 py-3 rounded-xl font-bold transition-all shadow-md ${
                      result.winner
                        ? "bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white"
                        : "bg-gray-300 text-gray-500 cursor-not-allowed"
                    }`}
                  >
                    <Save className="w-4 h-4" />
                    Save Result
                  </button>
                  <button
                    onClick={handleCancelEdit}
                    className="inline-flex items-center gap-2 px-6 py-3 bg-gray-200 hover:bg-gray-300 text-[#1A1A24] rounded-xl font-bold transition-all"
                  >
                    <X className="w-4 h-4" />
                    Cancel
                  </button>
                </div>
              </>
            ) : (
              <>
                {/* Display Mode */}
                {match.result && match.result.winner ? (
                  <div className="space-y-4">
                    <div className="flex items-center gap-4 p-6 bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200 rounded-2xl">
                      <div className="p-3 bg-green-500 rounded-full">
                        <Trophy className="w-6 h-6 text-white" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-black text-green-900 uppercase tracking-wide mb-1">Winner</p>
                        <p className="text-2xl font-black text-green-700">{match.result.winner}</p>
                      </div>
                      {match.result.method && (
                        <div className="text-right">
                          <p className="text-xs font-bold text-green-700 uppercase mb-1">Method</p>
                          <p className="text-lg font-black text-green-900">
                            {match.result.method}
                            {match.result.round && match.result.method !== "Decision" && ` (R${match.result.round})`}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="p-12 text-center">
                    <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-[#F4F5F8] flex items-center justify-center">
                      <Clock className="w-10 h-10 text-[#B0B0B0]" />
                    </div>
                    <h3 className="text-2xl font-black text-[#1A1A24] mb-2">No Result Yet</h3>
                    <p className="text-[#707070] font-medium">
                      Click "Update Result" to add the match outcome.
                    </p>
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        {/* Workflow History */}
        {match.workflowHistory && match.workflowHistory.length > 0 && (
          <WorkflowHistory 
            history={match.workflowHistory} 
            title="Match Workflow History"
            defaultExpanded={false}
          />
        )}
      </div>
    </div>
  );
}