import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router";
import { 
  ArrowLeft, Calendar, MapPin, Activity, FileText, 
  Trophy, Users, Shield, Edit2, Save, X, Video, Clock, AlertCircle
} from "lucide-react";
import { api } from "../utils/api";
import { MOCK_REFEREES, MOCK_JUDGES } from "../data/officials";
import { toast } from "sonner";
import { clsx } from "clsx";

export function MatchDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [match, setMatch] = useState<any>(null);
  const [batch, setBatch] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Result editing state
  const [isEditingResult, setIsEditingResult] = useState(false);
  const [result, setResult] = useState({
    winner: "",
    method: "",
    round: "",
    highlightVideo: "",
  });

  useEffect(() => {
    const loadData = async () => {
      if (!id) return;
      try {
        const data = await api.matches.get(id);
        if (data) {
          const mappedMatch = {
            ...data,
            matchNumber: `MATCH-${data.id.slice(-6).toUpperCase()}`,
            matchType: data.is_championship_bout ? "🏆 Championship" : "Standard Card",
            rounds: data.rounds,
            agreedWeight: data.agreed_weight,
            fighterA: {
              id: data.fighter_a_id,
              name: data.fighter_a_name,
              grade: data.fighter_a_grade,
              weight: data.agreed_weight,
              record: data.fighter_a_record,
              clubName: data.club_a_name || "Independent",
              image: data.fighter_a_image
            },
            fighterB: {
              id: data.fighter_b_id,
              name: data.fighter_b_name,
              grade: data.fighter_b_grade,
              weight: data.agreed_weight,
              record: data.fighter_b_record,
              clubName: data.club_b_name || "Independent",
              image: data.fighter_b_image
            },
            refereeName: data.referee_name || null,
            judgeNames: data.judge_names || [],
            status: data.status,
            result: data.winner_id || data.winner_method ? {
              winner: data.winner_id === data.fighter_a_id 
                ? data.fighter_a_name 
                : data.winner_id === data.fighter_b_id 
                ? data.fighter_b_name 
                : data.winner_method === "Draw" || data.winner_method === "No Contest"
                ? data.winner_method
                : "",
              winnerId: data.winner_id,
              method: data.winner_method,
              round: data.winner_round,
            } : null,
            highlightVideo: data.highlight_video || ""
          };
          setMatch(mappedMatch);
          
          setResult({
            winner: mappedMatch.result?.winnerId || (mappedMatch.result?.winner === "Draw" || mappedMatch.result?.winner === "No Contest" ? mappedMatch.result?.winner : ""),
            method: mappedMatch.result?.method || "",
            round: mappedMatch.result?.round ? String(mappedMatch.result?.round) : "",
            highlightVideo: mappedMatch.highlightVideo || "",
          });

          if (data.sub_event_id) {
            const batchData = await api.batches.get(data.sub_event_id);
            setBatch(batchData);
          }
        }
      } catch (err: any) {
        console.error(err);
        toast.error("Failed to load match details from database");
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [id]);

  const assignedReferee = match?.referee_id 
    ? MOCK_REFEREES.find(r => r.id === match.referee_id) || { name: match.refereeName || "Assigned Referee", grade: "Class A", experience: "50+ fights" }
    : match?.refereeName 
    ? { name: match.refereeName, grade: "Class A", experience: "50+ fights" }
    : null;

  const assignedJudges = match?.judge_ids && match.judge_ids.length > 0
    ? match.judge_ids.map((jid: string, idx: number) => 
        MOCK_JUDGES.find(j => j.id === jid) || { id: jid, name: `Judge ${idx + 1}`, grade: "Class A", experience: "30+ fights" }
      )
    : [MOCK_JUDGES[0], MOCK_JUDGES[1], MOCK_JUDGES[2]];

  const getMatchTypeBadge = () => {
    if (match?.is_championship_bout) return "Championship";
    return "Ranking Fight";
  };

  const handleSaveResult = async () => {
    if (!id || !match) return;

    try {
      let winnerId: string | null = null;
      let winnerMethod = result.method;
      
      if (result.winner === match.fighterA.id) {
        winnerId = match.fighterA.id;
      } else if (result.winner === match.fighterB.id) {
        winnerId = match.fighterB.id;
      } else if (result.winner === "Draw" || result.winner === "No Contest") {
        winnerId = null;
        winnerMethod = result.winner;
      }

      await api.matches.saveResult(id, {
        winnerId,
        method: winnerMethod || "Decision",
        round: result.round ? parseInt(result.round) : 0,
        duration: "0:00",
      });

      if (result.highlightVideo !== match.highlightVideo) {
        await api.matches.update(id, { highlightVideo: result.highlightVideo });
      }

      toast.success("✅ Match result updated successfully!");
      setIsEditingResult(false);
      
      // Reload match details
      window.location.reload();
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || "Failed to save match result");
    }
  };

  const handleCancelEdit = () => {
    setResult({
      winner: match?.result?.winnerId || (match?.result?.winner === "Draw" || match?.result?.winner === "No Contest" ? match?.result?.winner : ""),
      method: match?.result?.method || "",
      round: match?.result?.round ? String(match?.result?.round) : "",
      highlightVideo: match?.highlightVideo || "",
    });
    setIsEditingResult(false);
  };

  if (loading) {
    return (
      <div className="text-center py-16">
        <div className="w-10 h-10 border-4 border-primary/30 border-t-primary rounded-full animate-spin mx-auto mb-4" />
        <p className="text-sm text-muted-foreground font-semibold">Loading match details from database...</p>
      </div>
    );
  }

  if (!match) {
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

  return (
    <div className="min-h-screen bg-background p-4 md:p-8 animate-fadeIn">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Link 
            to="/home/matches" 
            className="inline-flex items-center gap-2 text-slate-500 hover:text-slate-900 font-semibold uppercase tracking-wider text-xs transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Matches
          </Link>
        </div>
        
        <div>
          <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tighter uppercase font-sans">
            Match Details
          </h1>
          <p className="text-xs text-slate-500 font-normal mt-1">
            ID: {match.id}
          </p>
        </div>

        {/* Info Cards Row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {/* Event Card */}
          <div className="bg-white rounded-2xl p-4 border border-[#E0E0E0] shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 bg-blue-50 rounded-lg flex items-center justify-center shrink-0">
                <FileText className="w-4 h-4 text-[#0A3D91]" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">Event</div>
                <div className="font-semibold text-slate-900 text-sm md:text-base leading-tight">Fight Night March 30</div>
              </div>
            </div>
          </div>

          {/* Date Card */}
          <div className="bg-white rounded-2xl p-4 border border-[#E0E0E0] shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 bg-red-50 rounded-lg flex items-center justify-center shrink-0">
                <Calendar className="w-4 h-4 text-[#C8102E]" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">Date</div>
                <div className="font-semibold text-slate-900 text-sm md:text-base leading-tight">2026-03-30</div>
              </div>
            </div>
          </div>

          {/* Location Card */}
          <div className="bg-white rounded-2xl p-4 border border-[#E0E0E0] shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 bg-amber-50 rounded-lg flex items-center justify-center shrink-0">
                <MapPin className="w-4 h-4 text-[#F2C94C]" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">Location</div>
                <div className="font-semibold text-slate-900 text-sm md:text-base leading-tight">Siem Reap, Cambodia</div>
              </div>
            </div>
          </div>

          {/* Status Card */}
          <div className="bg-white rounded-2xl p-4 border border-[#E0E0E0] shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 bg-blue-50 rounded-lg flex items-center justify-center shrink-0">
                <Activity className="w-4 h-4 text-[#0A3D91]" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">Status</div>
                <div className="font-semibold text-[#0A3D91] text-sm md:text-base uppercase leading-tight">Scheduled</div>
              </div>
            </div>
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
                  <div className="absolute -bottom-2.5 left-1/2 -translate-x-1/2 bg-gradient-to-r from-[#C8102E] to-[#A00D24] text-white text-[10px] font-bold uppercase tracking-wider px-3.5 py-1 rounded-full shadow-md whitespace-nowrap">
                    Red Corner
                  </div>
                </div>
                <h2 className="text-xl md:text-2xl font-extrabold text-slate-900 tracking-tight mb-2 text-center">
                  {match.fighterA.name}
                </h2>
                <div className="flex items-center gap-2 mb-3">
                  <span className="badge-premium bg-red-50 text-red-700 border-red-200/50 text-[9px] uppercase tracking-wider py-1 font-semibold">
                    Grade B
                  </span>
                  <span className="badge-premium bg-slate-50 text-slate-700 border-slate-200 text-[9px] uppercase tracking-wider py-1 font-semibold">{match.fighterA.weight || 57} kg</span>
                </div>
                <div className="text-xs text-slate-500 font-semibold">{match.fighterA.record}</div>
                <div className="text-[10px] text-slate-400 mt-1 font-semibold uppercase tracking-wider">Victory Gym</div>
              </div>

              {/* VS Center */}
              <div className="flex flex-col items-center px-8">
                {/* Match Type Badge */}
                <div className="flex items-center gap-2 mb-4">
                  <span className="badge-premium bg-blue-50 text-[#0A3D91] border-blue-200/50 text-[10px] font-semibold py-1 px-3 uppercase tracking-wider">
                    {getMatchTypeBadge()}
                  </span>
                </div>

                <div className="text-4xl md:text-5xl font-extrabold italic text-slate-900 mb-4 tracking-tighter">
                  VS
                </div>

                {/* Weight & Rounds */}
                <div className="flex flex-col items-center gap-2">
                  <div className="badge-premium bg-slate-50 text-slate-700 border-slate-200 text-[10px] font-semibold py-1 px-3 uppercase tracking-wider">
                    {match.fighterA.weight || 57}kg
                  </div>
                  <div className="badge-premium bg-primary text-white border-transparent text-[10px] font-semibold py-1.5 px-4 uppercase tracking-wider shadow-sm">
                    {match.rounds} Rounds
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
                  <div className="absolute -bottom-2.5 left-1/2 -translate-x-1/2 bg-gradient-to-l from-[#0A3D91] to-[#051C42] text-white text-[10px] font-bold uppercase tracking-wider px-3.5 py-1 rounded-full shadow-md whitespace-nowrap">
                    Blue Corner
                  </div>
                </div>
                <h2 className="text-xl md:text-2xl font-extrabold text-slate-900 tracking-tight mb-2 text-center">
                  {match.fighterB.name}
                </h2>
                <div className="flex items-center gap-2 mb-3">
                  <span className="badge-premium bg-blue-50 text-primary border-blue-200/50 text-[9px] uppercase tracking-wider py-1 font-semibold">
                    Grade B
                  </span>
                  <span className="badge-premium bg-slate-50 text-slate-700 border-slate-200 text-[9px] uppercase tracking-wider py-1 font-semibold">{match.fighterB.weight || 57} kg</span>
                </div>
                <div className="text-xs text-slate-500 font-semibold">{match.fighterB.record}</div>
                <div className="text-[10px] text-slate-400 mt-1 font-semibold uppercase tracking-wider">Victory Gym</div>
              </div>
            </div>
          </div>
        </div>

        {/* Officials Section - NEW */}
        <div className="bg-white rounded-2xl border border-[#E0E0E0] shadow-sm overflow-hidden">
          <div className="bg-gradient-to-r from-purple-50 to-blue-50 px-6 py-4 border-b border-[#E0E0E0]">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-gradient-to-br from-purple-600 to-blue-600 rounded-lg flex items-center justify-center shrink-0">
                <Users className="w-4 h-4 text-white" />
              </div>
              <div>
                <h2 className="text-base font-extrabold text-slate-800 tracking-tight uppercase">Match Officials</h2>
                <p className="text-xs text-slate-500 font-normal">Assigned judges and referee for this match</p>
              </div>
            </div>
          </div>

          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Judges */}
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-7 h-7 bg-purple-100 rounded-lg flex items-center justify-center">
                    <Users className="w-3.5 h-3.5 text-purple-700" />
                  </div>
                  <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Judges</h3>
                  <span className="badge-premium bg-purple-50 text-purple-700 border-purple-200/50 text-[9px] py-0.5 px-2 font-semibold">
                    {assignedJudges.length}
                  </span>
                </div>
                <div className="space-y-3">
                  {assignedJudges.map((judge, idx) => (
                    <div 
                      key={judge.id}
                      className="flex items-center gap-3 p-4 bg-purple-50/40 rounded-xl border border-purple-200/50"
                    >
                      <div className="w-9 h-9 bg-purple-600 rounded-full flex items-center justify-center text-white font-extrabold text-sm shrink-0">
                        {idx + 1}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-bold text-slate-900 text-sm truncate">{judge.name}</div>
                        <div className="flex items-center gap-2 text-xs mt-1">
                          <span className="text-purple-700 font-semibold">{judge.grade}</span>
                          <span className="text-slate-300">•</span>
                          <span className="text-slate-500 font-normal">{judge.experience}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Referee */}
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-7 h-7 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Shield className="w-3.5 h-3.5 text-blue-700" />
                  </div>
                  <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Referee</h3>
                </div>
                <div className="p-6 bg-blue-50/45 rounded-xl border border-blue-200/50">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 bg-blue-600 rounded-full flex items-center justify-center shrink-0">
                      <Shield className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-bold text-slate-900 text-base mb-1 truncate">
                        {assignedReferee ? assignedReferee.name : "No Referee Assigned"}
                      </div>
                      <div className="flex items-center gap-2 text-xs">
                        <span className="text-blue-700 font-semibold">{assignedReferee ? assignedReferee.grade : "N/A"}</span>
                        <span className="text-slate-300">•</span>
                        <span className="text-slate-500 font-normal">{assignedReferee ? assignedReferee.experience : "N/A"}</span>
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
              <Trophy className="w-5 h-5 text-[#F2C94C]" />
              <h2 className="text-base font-extrabold text-white uppercase tracking-tight">Match Result</h2>
            </div>
            {!isEditingResult && (
              <button
                onClick={() => setIsEditingResult(true)}
                className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-xl font-semibold uppercase tracking-wider text-xs transition-all shadow hover:-translate-y-[1px]"
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
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">
                      Winner
                    </label>
                    <select
                      value={result.winner}
                      onChange={(e) => setResult({ ...result, winner: e.target.value })}
                      className="input-premium font-semibold text-slate-700"
                    >
                      <option value="">Select Winner</option>
                      <option value={match.fighterA.id}>{match.fighterA.name} (Red Corner)</option>
                      <option value={match.fighterB.id}>{match.fighterB.name} (Blue Corner)</option>
                      <option value="Draw">Draw</option>
                      <option value="No Contest">No Contest</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">
                      Method
                    </label>
                    <select
                      value={result.method}
                      onChange={(e) => setResult({ ...result, method: e.target.value })}
                      className="input-premium font-semibold text-slate-700"
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
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">
                      Round (if applicable)
                    </label>
                    <select
                      value={result.round}
                      onChange={(e) => setResult({ ...result, round: e.target.value })}
                      className="input-premium font-semibold text-slate-700"
                      disabled={result.method === "Decision"}
                    >
                      <option value="">Not Applicable</option>
                      {Array.from({ length: match.rounds }, (_, i) => (
                        <option key={i + 1} value={i + 1}>Round {i + 1}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 flex items-center gap-2">
                      <Video className="w-3.5 h-3.5 text-secondary" />
                      Highlight Video URL
                    </label>
                    <input
                      type="url"
                      value={result.highlightVideo}
                      onChange={(e) => setResult({ ...result, highlightVideo: e.target.value })}
                      placeholder="https://youtube.com/watch?v=..."
                      className="input-premium font-semibold text-slate-700"
                    />
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center gap-3 pt-6 border-t border-[#E0E0E0] mt-6">
                  <button
                    onClick={handleSaveResult}
                    disabled={!result.winner}
                    className={clsx(
                      "inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold uppercase tracking-wider text-xs transition-all shadow-sm",
                      result.winner
                        ? "bg-gradient-to-br from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white active:scale-[0.98]"
                        : "bg-slate-100 text-slate-400 border border-slate-200/60 cursor-not-allowed"
                    )}
                  >
                    <Save className="w-4 h-4" />
                    Save Result
                  </button>
                  <button
                    onClick={handleCancelEdit}
                    className="inline-flex items-center gap-2 px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-semibold uppercase tracking-wider text-xs transition-all border border-slate-200 hover:-translate-y-[1px]"
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
                    <div className="flex items-center gap-4 p-6 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-2xl">
                      <div className="p-3 bg-green-500 rounded-full">
                        <Trophy className="w-5 h-5 text-white" />
                      </div>
                      <div className="flex-1">
                        <p className="text-[10px] font-bold text-emerald-800 uppercase tracking-widest mb-0.5">Winner</p>
                        <p className="text-xl font-extrabold text-emerald-700 tracking-tight">{match.result.winner}</p>
                      </div>
                      {match.result.method && (
                        <div className="text-right">
                          <p className="text-[10px] font-bold text-emerald-800 uppercase tracking-widest mb-0.5">Method</p>
                          <p className="text-base font-extrabold text-emerald-900 tracking-tight">
                            {match.result.method}
                            {match.result.round && match.result.method !== "Decision" && ` (R${match.result.round})`}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="p-12 text-center">
                    <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-[#F4F5F8] flex items-center justify-center">
                      <Clock className="w-8 h-8 text-[#B0B0B0]" />
                    </div>
                    <h3 className="text-lg font-extrabold text-slate-800 tracking-tight uppercase mb-1">No Result Yet</h3>
                    <p className="text-slate-500 font-normal text-sm">
                      Click "Update Result" to add the match outcome.
                    </p>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}