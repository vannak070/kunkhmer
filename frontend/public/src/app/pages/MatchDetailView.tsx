import { useState } from "react";
import { useParams, Link, useNavigate } from "react-router";
import { 
  ArrowLeft, Calendar, MapPin, Users, Shield, Award, 
  Trophy, Video, Save, CheckCircle, Clock, Edit2, X,
  User, Weight, Activity, FileText, Target, AlertCircle
} from "lucide-react";
import { MOCK_BATCHES, updateBatchStatusIfAllMatchesCompleted } from "../data/batches";
import { MOCK_MATCHES } from "../data/mock";
import { toast } from "sonner";

export function MatchDetailView() {
  const { id } = useParams();
  const navigate = useNavigate();
  
  // First try to find the match from MOCK_MATCHES (new data structure)
  let foundMatch: any = MOCK_MATCHES.find(m => m.id === id);
  let foundBatch: any = null;
  let isFromMockMatches = !!foundMatch;
  
  // If not found, try to find from batches (old data structure)
  if (!foundMatch) {
    for (const batch of MOCK_BATCHES) {
      const match = batch.matches.find(m => m.id === id);
      if (match) {
        foundMatch = match;
        foundBatch = batch;
        break;
      }
    }
  }

  const [isEditingResult, setIsEditingResult] = useState(false);
  const [result, setResult] = useState({
    winner: foundMatch?.winner || "",
    method: foundMatch?.winnerMethod || "",
    round: foundMatch?.winnerRound || "",
    highlightVideo: foundMatch?.highlightVideo || "",
  });

  if (!foundMatch) {
    return (
      <div className="min-h-screen bg-[#F4F5F8] p-8 flex items-center justify-center">
        <div className="bg-white rounded-2xl p-12 text-center shadow-lg">
          <AlertCircle className="w-16 h-16 text-amber-500 mx-auto mb-4" />
          <h2 className="text-2xl font-black text-[#1A1A24] mb-2">Match Not Found</h2>
          <p className="text-[#707070] mb-6">The match you're looking for doesn't exist.</p>
          <Link
            to="/home/matches"
            className="inline-flex items-center gap-2 px-6 py-3 bg-[#0A3D91] text-white rounded-xl font-bold hover:bg-[#051C42] transition-all"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Matches
          </Link>
        </div>
      </div>
    );
  }

  const match = foundMatch;
  const batch = foundBatch;

  const handleSaveResult = () => {
    // Update the match with new result data
    match.winner = result.winner;
    match.winnerMethod = result.method;
    match.winnerRound = result.round ? parseInt(result.round) : undefined;
    match.highlightVideo = result.highlightVideo;
    match.status = result.winner ? "Completed" : match.status;
    
    toast.success("✅ Match result updated successfully!");
    setIsEditingResult(false);
    
    // Check if all matches in batch are completed (only for batch matches)
    if (batch) {
      const wasAutoCompleted = updateBatchStatusIfAllMatchesCompleted(batch);
      if (wasAutoCompleted) {
        toast.success(`🏆 Batch ${batch.batchNumber} automatically marked as Completed!`, {
          duration: 5000
        });
      }
    }
    
    // Navigate back to match detail
    navigate(`/match/${match.id}`);
  };

  const handleCancelEdit = () => {
    setResult({
      winner: match?.winner || "",
      method: match?.winnerMethod || "",
      round: match?.winnerRound || "",
      highlightVideo: match?.highlightVideo || "",
    });
    setIsEditingResult(false);
  };

  const getStatusConfig = (status: string) => {
    const configs: any = {
      "Waiting Club Approval": { bg: "bg-amber-50", text: "text-amber-700", icon: "⏳", label: "WAITING CLUB APPROVAL" },
      "Proposed": { bg: "bg-blue-50", text: "text-blue-700", icon: "📝", label: "PROPOSED" },
      "Ready": { bg: "bg-blue-50", text: "text-blue-700", icon: "✅", label: "READY" },
      "Show Face Completed": { bg: "bg-purple-50", text: "text-purple-700", icon: "👥", label: "SHOW FACE COMPLETED" },
      "Weigh-In Completed": { bg: "bg-indigo-50", text: "text-indigo-700", icon: "⚖️", label: "WEIGH-IN COMPLETED" },
      "Ready to Fight": { bg: "bg-green-50", text: "text-green-700", icon: "🥊", label: "READY TO FIGHT" },
      "In Progress": { bg: "bg-orange-50", text: "text-orange-700", icon: "🔴", label: "IN PROGRESS" },
      "Completed": { bg: "bg-green-50", text: "text-green-700", icon: "✓", label: "COMPLETED" },
      "Scheduled": { bg: "bg-blue-50", text: "text-blue-800", icon: "📅", label: "SCHEDULED" },
    };
    return configs[status] || { bg: "bg-gray-50", text: "text-gray-600", icon: "", label: status.toUpperCase() };
  };

  const statusConfig = getStatusConfig(match.status);

  return (
    <div className="min-h-screen bg-[#F4F5F8] p-4 md:p-8">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Link
            to="/home/matches"
            className="p-3 bg-white hover:bg-gray-50 rounded-xl transition-all shadow-sm border border-gray-200"
          >
            <ArrowLeft className="w-5 h-5 text-[#1A1A24]" />
          </Link>
          <div>
            <h1 className="text-3xl font-black text-[#1A1A24] uppercase tracking-tight">
              Match Details
            </h1>
            <p className="text-sm text-[#707070] font-bold mt-0.5">
              {match.matchNumber} • {batch ? batch.batchNumber : "N/A"}
            </p>
          </div>
        </div>

        {/* Info Cards Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Event */}
          <div className="bg-white rounded-2xl p-4 border border-gray-200 shadow-sm">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-blue-50 rounded-lg shrink-0">
                <FileText className="w-5 h-5 text-[#0A3D91]" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs text-[#707070] font-bold uppercase tracking-wide mb-1">Event</p>
                <p className="text-sm font-black text-[#1A1A24] leading-tight">{batch ? batch.eventName : "N/A"}</p>
              </div>
            </div>
          </div>

          {/* Date */}
          <div className="bg-white rounded-2xl p-4 border border-gray-200 shadow-sm">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-red-50 rounded-lg shrink-0">
                <Calendar className="w-5 h-5 text-[#C8102E]" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs text-[#707070] font-bold uppercase tracking-wide mb-1">Date</p>
                <p className="text-sm font-black text-[#1A1A24] leading-tight">{batch ? batch.date : "N/A"}</p>
              </div>
            </div>
          </div>

          {/* Location */}
          <div className="bg-white rounded-2xl p-4 border border-gray-200 shadow-sm">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-amber-50 rounded-lg shrink-0">
                <MapPin className="w-5 h-5 text-[#F2C94C]" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs text-[#707070] font-bold uppercase tracking-wide mb-1">Location</p>
                <p className="text-sm font-black text-[#1A1A24] leading-tight">{batch ? batch.location : "N/A"}</p>
              </div>
            </div>
          </div>

          {/* Status */}
          <div className="bg-white rounded-2xl p-4 border border-gray-200 shadow-sm">
            <div className="flex items-start gap-3">
              <div className={`p-2 ${statusConfig.bg} rounded-lg shrink-0`}>
                <Activity className={`w-5 h-5 ${statusConfig.text}`} />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs text-[#707070] font-bold uppercase tracking-wide mb-1">Status</p>
                <p className={`text-xs font-black ${statusConfig.text} leading-tight`}>{statusConfig.label}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Fighters VS Card */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
          {/* Decorative top bars */}
          <div className="flex">
            <div className="flex-1 h-1.5 bg-gradient-to-r from-[#C8102E] to-[#A00D24]" />
            <div className="flex-1 h-1.5 bg-gradient-to-l from-[#0A3D91] to-[#051C42]" />
          </div>

          <div className="p-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-center">
              {/* Fighter A - Red Corner */}
              <div className="flex flex-col items-center text-center">
                <div className="relative mb-4">
                  <img 
                    src={match.fighterA.image} 
                    alt={match.fighterA.name}
                    className="w-32 h-32 rounded-full object-cover border-4 border-white shadow-lg"
                  />
                  <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-gradient-to-r from-[#C8102E] to-[#A00D24] text-white text-xs font-black uppercase px-4 py-1 rounded-full shadow-md whitespace-nowrap">
                    Red Corner
                  </div>
                </div>
                
                <h2 className="text-2xl font-black text-[#1A1A24] mb-2">
                  {match.fighterA.name}
                </h2>
                
                <div className="flex items-center gap-2 mb-2">
                  <span className="px-2.5 py-1 bg-[#C8102E] text-white rounded text-xs font-black">
                    Grade {match.fighterA.grade}
                  </span>
                  <span className="px-2.5 py-1 bg-gray-100 text-[#707070] rounded text-xs font-bold">
                    {match.fighterA.weight} kg
                  </span>
                </div>
                
                <p className="text-sm font-mono font-bold text-[#707070] mb-1">
                  {match.fighterA.record}
                </p>
                <p className="text-xs text-[#707070] font-semibold">
                  {match.fighterA.clubName}
                </p>
              </div>

              {/* VS Section */}
              <div className="flex flex-col items-center justify-center space-y-3 py-4">
                <div className="text-6xl font-black italic text-[#1A1A24]">VS</div>
                
                <div className="flex items-center gap-2 text-[#0A3D91]">
                  <Target className="w-4 h-4" />
                  <span className="text-sm font-black uppercase tracking-wide">
                    {match.matchType}
                  </span>
                </div>
                
                <div className="flex items-center gap-2 text-[#707070]">
                  <Weight className="w-4 h-4" />
                  <span className="text-sm font-bold">
                    {match.agreedWeight ? `${match.agreedWeight} kg` : match.weightClass}
                  </span>
                </div>
                
                <div className="px-6 py-2 bg-[#0A3D91] text-white rounded-full font-black text-sm uppercase shadow-md">
                  {match.rounds} Rounds
                </div>
              </div>

              {/* Fighter B - Blue Corner */}
              <div className="flex flex-col items-center text-center">
                <div className="relative mb-4">
                  <img 
                    src={match.fighterB.image} 
                    alt={match.fighterB.name}
                    className="w-32 h-32 rounded-full object-cover border-4 border-white shadow-lg"
                  />
                  <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-gradient-to-l from-[#0A3D91] to-[#051C42] text-white text-xs font-black uppercase px-4 py-1 rounded-full shadow-md whitespace-nowrap">
                    Blue Corner
                  </div>
                </div>
                
                <h2 className="text-2xl font-black text-[#1A1A24] mb-2">
                  {match.fighterB.name}
                </h2>
                
                <div className="flex items-center gap-2 mb-2">
                  <span className="px-2.5 py-1 bg-[#0A3D91] text-white rounded text-xs font-black">
                    Grade {match.fighterB.grade}
                  </span>
                  <span className="px-2.5 py-1 bg-gray-100 text-[#707070] rounded text-xs font-bold">
                    {match.fighterB.weight} kg
                  </span>
                </div>
                
                <p className="text-sm font-mono font-bold text-[#707070] mb-1">
                  {match.fighterB.record}
                </p>
                <p className="text-xs text-[#707070] font-semibold">
                  {match.fighterB.clubName}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Officials Section */}
        {(match.refereeName || (match.judgeNames && match.judgeNames.length > 0)) && (
          <div className="bg-white rounded-2xl shadow-md border border-gray-200 overflow-hidden">
            <div className="bg-gradient-to-r from-[#707070] to-[#505050] px-6 py-3.5">
              <h3 className="text-lg font-black text-white uppercase tracking-tight flex items-center gap-2">
                <Shield className="w-5 h-5" />
                Match Officials
              </h3>
            </div>

            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Referee */}
                {match.refereeName && (
                  <div className="flex items-start gap-4 p-4 bg-amber-50 border-2 border-amber-200 rounded-xl">
                    <div className="p-3 bg-amber-500 rounded-full shrink-0">
                      <Shield className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <p className="text-xs font-black text-amber-900 uppercase tracking-wide mb-1">Referee</p>
                      <p className="text-lg font-black text-amber-700">{match.refereeName}</p>
                      <p className="text-xs text-amber-600 font-semibold mt-1">In-Ring Official</p>
                    </div>
                  </div>
                )}

                {/* Judges */}
                {match.judgeNames && match.judgeNames.length > 0 && (
                  <div className="flex items-start gap-4 p-4 bg-blue-50 border-2 border-blue-200 rounded-xl">
                    <div className="p-3 bg-[#0A3D91] rounded-full shrink-0">
                      <Users className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex-1">
                      <p className="text-xs font-black text-blue-900 uppercase tracking-wide mb-2">Judges</p>
                      <div className="space-y-1.5">
                        {match.judgeNames.map((judge: string, index: number) => (
                          <div key={index} className="flex items-center gap-2">
                            <div className="w-1.5 h-1.5 rounded-full bg-[#0A3D91]" />
                            <p className="text-sm font-bold text-blue-700">{judge}</p>
                          </div>
                        ))}
                      </div>
                      <p className="text-xs text-blue-600 font-semibold mt-2">Scorecardkeepers</p>
                    </div>
                  </div>
                )}
              </div>

              {/* No Officials Assigned */}
              {!match.refereeName && (!match.judgeNames || match.judgeNames.length === 0) && (
                <div className="p-8 text-center bg-gray-50 rounded-xl border-2 border-dashed border-gray-300">
                  <Users className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                  <p className="text-sm font-bold text-gray-500">No Officials Assigned Yet</p>
                  <p className="text-xs text-gray-400 mt-1">Referee and judges will be assigned before the match</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Match Result Section */}
        <div className="bg-white rounded-2xl shadow-lg border border-[#E0E0E0]/50 overflow-hidden">
          <div className="bg-gradient-to-r from-[#0A3D91] to-[#051C42] px-6 py-4 flex items-center justify-between">
            <h2 className="text-xl font-black text-white uppercase tracking-tight flex items-center gap-2">
              <Trophy className="w-5 h-5 text-[#F2C94C]" />
              Match Result
            </h2>
            {!isEditingResult && (
              <button
                onClick={() => setIsEditingResult(true)}
                className="inline-flex items-center gap-2 px-4 py-2 bg-white/20 hover:bg-white/30 text-white rounded-lg font-bold transition-all text-sm"
              >
                <Edit2 className="w-4 h-4" />
                Update Result
              </button>
            )}
          </div>

          <div className="p-6 space-y-6">
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
                <div className="flex items-center gap-3 pt-4 border-t border-[#E0E0E0]">
                  <button
                    onClick={handleSaveResult}
                    className="inline-flex items-center gap-2 px-6 py-3 bg-[#10B981] hover:bg-[#059669] text-white rounded-xl font-bold transition-all shadow-md"
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
                {match.winner ? (
                  <div className="space-y-4">
                    <div className="flex items-center gap-4 p-6 bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200 rounded-2xl">
                      <div className="p-3 bg-green-500 rounded-full">
                        <Trophy className="w-6 h-6 text-white" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-black text-green-900 uppercase tracking-wide mb-1">Winner</p>
                        <p className="text-2xl font-black text-green-700">{match.winner}</p>
                      </div>
                      {match.winnerMethod && (
                        <div className="text-right">
                          <p className="text-xs font-bold text-green-700 uppercase mb-1">Method</p>
                          <p className="text-lg font-black text-green-900">
                            {match.winnerMethod}
                            {match.winnerRound && match.winnerMethod !== "Decision" && ` (R${match.winnerRound})`}
                          </p>
                        </div>
                      )}
                    </div>

                    {match.highlightVideo && (
                      <div className="p-6 bg-gradient-to-r from-purple-50 to-pink-50 border-2 border-purple-200 rounded-2xl">
                        <div className="flex items-center gap-3 mb-3">
                          <Video className="w-5 h-5 text-purple-600" />
                          <h3 className="text-sm font-black text-purple-900 uppercase tracking-wide">Highlight Video</h3>
                        </div>
                        <a 
                          href={match.highlightVideo}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 text-purple-700 hover:text-purple-900 font-bold underline"
                        >
                          {match.highlightVideo}
                        </a>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="p-12 text-center">
                    <Clock className="w-16 h-16 text-[#B0B0B0] mx-auto mb-4" />
                    <h3 className="text-xl font-black text-[#707070] mb-2">No Result Yet</h3>
                    <p className="text-[#B0B0B0] font-medium mb-6">
                      Click "Update Result" to add the match outcome and highlight video.
                    </p>
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        {/* Additional Match Info */}
        {match.notes && (
          <div className="bg-white rounded-2xl p-6 shadow-md border border-[#E0E0E0]/50">
            <h3 className="text-sm font-black text-[#1A1A24] uppercase mb-3 flex items-center gap-2">
              <FileText className="w-4 h-4 text-[#0A3D91]" />
              Notes
            </h3>
            <p className="text-sm text-[#707070] leading-relaxed font-medium">
              {match.notes}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}