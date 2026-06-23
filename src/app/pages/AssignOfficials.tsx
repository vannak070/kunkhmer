import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router";
import { 
  Shield, Users, CheckCircle, ArrowLeft, Send, 
  Plus, X, AlertCircle, UserCheck, Check, Sparkles
} from "lucide-react";
import { getJudges, getReferees } from "../utils/officialsStore";
import { api } from "../utils/api";
import { toast } from "sonner";
import { clsx } from "clsx";

export default function AssignOfficials() {
  const { batchId } = useParams();
  const navigate = useNavigate();
  
  const [batch, setBatch] = useState<any>(null);
  const [matches, setMatches] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Track assignments: Record<matchId, { refereeId, judgeIds: [j1, j2, j3] }>
  const [matchOfficials, setMatchOfficials] = useState<Record<string, { refereeId: string, judgeIds: string[] }>>({});

  useEffect(() => {
    if (batchId) {
      loadData();
    }
  }, [batchId]);

  const loadData = async () => {
    setLoading(true);
    try {
      const b = await api.batches.get(batchId!);
      if (b) {
        setBatch(b);
        const allMatches = await api.matches.list();
        const batchMatches = allMatches.filter((m: any) => m.sub_event_id === b.id).map((m: any) => ({
          id: m.id,
          fighterAName: m.fighter_a_name,
          fighterBName: m.fighter_b_name,
          weightClass: m.agreed_weight ? `${m.agreed_weight} kg` : "Catchweight",
          rounds: m.rounds,
          refereeId: m.referee_id || "",
          judgeIds: Array.isArray(m.judge_ids) ? m.judge_ids : [],
          isChampionshipBout: m.is_title_match || m.isTitleMatch || false,
        }));
        
        setMatches(batchMatches);

        // Prepopulate assignment states
        const initial: Record<string, { refereeId: string, judgeIds: string[] }> = {};
        batchMatches.forEach((m: any) => {
          initial[m.id] = {
            refereeId: m.refereeId || "",
            judgeIds: m.judgeIds || ["", "", ""]
          };
        });
        setMatchOfficials(initial);
      }
    } catch (err: any) {
      console.error(err);
      toast.error("Failed to load batch data: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const updateMatchOfficialState = (matchId: string, field: "refereeId" | "judgeIds", value: any) => {
    setMatchOfficials(prev => ({
      ...prev,
      [matchId]: {
        ...prev[matchId],
        [field]: value
      }
    }));
  };

  const getFilteredJudgesForSlot = (matchId: string, slotIndex: number) => {
    const current = matchOfficials[matchId]?.judgeIds || ["", "", ""];
    const selectedOtherSlots = current.filter((_, idx) => idx !== slotIndex && current[idx]);
    return getJudges().filter(j => j.status === "Available" && !selectedOtherSlots.includes(j.id));
  };

  const handleAutoFillOfficials = () => {
    if (matches.length === 0) return;
    const firstMatchId = matches[0].id;
    const firstMatchAssignment = matchOfficials[firstMatchId];
    if (!firstMatchAssignment || !firstMatchAssignment.refereeId || firstMatchAssignment.judgeIds.filter(id => id).length !== 3) {
      toast.error("❌ Configure officials for the first match first!");
      return;
    }

    const updated = { ...matchOfficials };
    matches.forEach((m: any) => {
      updated[m.id] = {
        refereeId: firstMatchAssignment.refereeId,
        judgeIds: [...firstMatchAssignment.judgeIds]
      };
    });
    setMatchOfficials(updated);
    toast.success("⚡ Officials copied to all matches!");
  };

  const handleSubmit = async () => {
    // Validate that all matches have referee and exactly 3 judges
    let isValid = true;
    matches.forEach((m: any) => {
      const assignment = matchOfficials[m.id];
      const selectedJudgesCount = assignment?.judgeIds?.filter(id => id).length || 0;
      if (!assignment || !assignment.refereeId || selectedJudgesCount !== 3) {
        isValid = false;
      }
    });

    if (!isValid) {
      toast.error("❌ Each match must have a referee and exactly 3 judges assigned!");
      return;
    }

    try {
      await Promise.all(
        matches.map((m: any) => {
          const assignment = matchOfficials[m.id];
          return api.matches.update(m.id, {
            refereeId: assignment.refereeId,
            judgeIds: assignment.judgeIds,
          });
        })
      );
      
      toast.success(`✅ Officials assigned successfully to all matches!`);
      navigate(`/home/batches/${batch.id}`);
    } catch (err: any) {
      console.error(err);
      toast.error("Failed to assign officials: " + err.message);
    }
  };

  const availableReferees = getReferees().filter(r => r.status === "Available");

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!batch) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-red-600 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight mb-4">Batch not found</h2>
          <button onClick={() => navigate("/home/matches")} className="btn-primary px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider">
            Back to Matches
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] py-8 px-4 sm:px-6 lg:px-8 animate-fadeIn">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-2 text-slate-500 hover:text-slate-900 font-semibold uppercase tracking-wider text-xs transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Details
          </button>

          {matches.length > 0 && (
            <button
              onClick={handleAutoFillOfficials}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-amber-50 hover:bg-amber-100 text-amber-700 font-extrabold text-[10px] uppercase tracking-wider rounded-xl border border-amber-200/50 transition-colors shadow-sm"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-550 animate-pulse" />
              ⚡ Copy Match 1 to All
            </button>
          )}
        </div>
        
        {/* Modal-Style Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200/80 overflow-hidden">
          {/* Header */}
          <div className="p-6 md:p-8 pb-4">
            <div className="flex items-center gap-3.5 mb-2.5">
              <span className="p-2 bg-indigo-50 text-indigo-600 rounded-xl">
                <Shield className="w-6 h-6" />
              </span>
              <div>
                <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 uppercase tracking-tighter">
                  Assign Match Officials
                </h1>
                <p className="text-xs text-slate-500 font-medium mt-0.5">
                  Set the main referee and 3 judges for each fight in {batch.batchNumber || `Batch #${batch.week_number}`}
                </p>
              </div>
            </div>
            
            <div className="mt-4 p-4 bg-indigo-50/50 border border-indigo-200/35 rounded-xl text-xs font-semibold text-indigo-750 flex items-center gap-2.5">
              <Shield className="w-4 h-4 text-indigo-600 shrink-0" />
              <span>Event Card: {batch.event_name} • Location: {batch.location}</span>
            </div>
          </div>

          {/* Matches List Grid */}
          <div className="px-6 md:px-8 pb-6 space-y-5">
            {matches.length === 0 ? (
              <div className="text-center py-12 text-slate-450 border border-dashed border-slate-200 rounded-2xl bg-slate-50/50">
                <Users className="w-12 h-12 mx-auto mb-2 opacity-30" />
                <p className="font-semibold text-sm">No matches in this batch yet</p>
              </div>
            ) : (
              matches.map((m: any, index: number) => {
                const refereeId = matchOfficials[m.id]?.refereeId || "";
                const judgeIds = matchOfficials[m.id]?.judgeIds || ["", "", ""];

                return (
                  <div key={m.id} className="p-5 bg-slate-50 border border-slate-200 rounded-2xl space-y-4 shadow-sm hover:shadow transition-shadow">
                    <div className="flex items-center justify-between border-b border-slate-250/40 pb-2.5 flex-wrap gap-2">
                      <div className="flex items-center gap-2.5">
                        <span className="w-6 h-6 rounded-lg bg-indigo-600 text-white flex items-center justify-center font-extrabold text-[11px] tracking-tight shrink-0">
                          #{index + 1}
                        </span>
                        <span className="font-extrabold text-slate-900 text-sm md:text-base">
                          {m.fighterAName} <span className="text-slate-400 font-normal">vs</span> {m.fighterBName}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="px-2.5 py-0.5 bg-slate-200/70 text-slate-700 font-bold text-[9px] rounded-lg uppercase tracking-wider">
                          {m.weightClass}
                        </span>
                        {m.isChampionshipBout && (
                          <span className="px-2.5 py-0.5 bg-amber-100 text-amber-700 border border-amber-250/50 font-bold text-[9px] rounded-lg uppercase tracking-wider flex items-center gap-1">
                            🏆 Title Fight
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                      {/* Referee */}
                      <div>
                        <label className="block text-[9px] font-extrabold text-slate-400 uppercase tracking-widest mb-1.5">
                          Main Referee
                        </label>
                        <select
                          value={refereeId}
                          onChange={(e) => updateMatchOfficialState(m.id, "refereeId", e.target.value)}
                          className="w-full text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-xl p-2.5 focus:border-primary focus:outline-none cursor-pointer"
                        >
                          <option value="">Select referee...</option>
                          {availableReferees.map(ref => (
                            <option key={ref.id} value={ref.id}>
                              {ref.name} ({ref.grade})
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* Judge 1 */}
                      <div>
                        <label className="block text-[9px] font-extrabold text-slate-400 uppercase tracking-widest mb-1.5">
                          Judge 1
                        </label>
                        <select
                          value={judgeIds[0] || ""}
                          onChange={(e) => {
                            const copy = [...judgeIds];
                            copy[0] = e.target.value;
                            updateMatchOfficialState(m.id, "judgeIds", copy);
                          }}
                          className="w-full text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-xl p-2.5 focus:border-primary focus:outline-none cursor-pointer"
                        >
                          <option value="">Select judge...</option>
                          {getFilteredJudgesForSlot(m.id, 0).map(judge => (
                            <option key={judge.id} value={judge.id}>
                              {judge.name} ({judge.grade})
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* Judge 2 */}
                      <div>
                        <label className="block text-[9px] font-extrabold text-slate-400 uppercase tracking-widest mb-1.5">
                          Judge 2
                        </label>
                        <select
                          value={judgeIds[1] || ""}
                          onChange={(e) => {
                            const copy = [...judgeIds];
                            copy[1] = e.target.value;
                            updateMatchOfficialState(m.id, "judgeIds", copy);
                          }}
                          className="w-full text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-xl p-2.5 focus:border-primary focus:outline-none cursor-pointer"
                        >
                          <option value="">Select judge...</option>
                          {getFilteredJudgesForSlot(m.id, 1).map(judge => (
                            <option key={judge.id} value={judge.id}>
                              {judge.name} ({judge.grade})
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* Judge 3 */}
                      <div>
                        <label className="block text-[9px] font-extrabold text-slate-400 uppercase tracking-widest mb-1.5">
                          Judge 3
                        </label>
                        <select
                          value={judgeIds[2] || ""}
                          onChange={(e) => {
                            const copy = [...judgeIds];
                            copy[2] = e.target.value;
                            updateMatchOfficialState(m.id, "judgeIds", copy);
                          }}
                          className="w-full text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-xl p-2.5 focus:border-primary focus:outline-none cursor-pointer"
                        >
                          <option value="">Select judge...</option>
                          {getFilteredJudgesForSlot(m.id, 2).map(judge => (
                            <option key={judge.id} value={judge.id}>
                              {judge.name} ({judge.grade})
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Action Buttons */}
          <div className="px-6 md:px-8 pb-8 flex items-center gap-3.5 border-t border-slate-100 pt-6">
            <button
              onClick={handleSubmit}
              disabled={matches.length === 0}
              className={clsx(
                "flex-1 py-3 rounded-xl font-bold uppercase tracking-wider text-xs transition-all shadow hover:-translate-y-[0.5px] active:scale-[0.98]",
                matches.length > 0
                  ? "bg-indigo-600 hover:bg-indigo-755 text-white"
                  : "bg-slate-200 text-slate-400 cursor-not-allowed shadow-none"
              )}
            >
              Assign Officials
            </button>
            
            <button
              onClick={() => navigate(-1)}
              className="flex-1 py-3 bg-slate-50 hover:bg-slate-100 text-slate-700 rounded-xl font-bold uppercase tracking-wider text-xs border border-slate-200 transition-all active:scale-[0.98] hover:-translate-y-[0.5px]"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}