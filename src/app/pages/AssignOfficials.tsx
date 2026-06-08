import { useState } from "react";
import { useNavigate, useParams } from "react-router";
import { 
  Shield, Users, CheckCircle, ArrowLeft, Send, 
  Plus, X, AlertCircle, UserCheck, Check
} from "lucide-react";
import { MOCK_BATCHES } from "../data/batches";
import { getJudges, getReferees } from "../utils/officialsStore";
import { toast } from "sonner";

export default function AssignOfficials() {
  const { batchId } = useParams();
  const navigate = useNavigate();
  
  // Find the batch
  let batch = MOCK_BATCHES.find(b => b.id === batchId) || MOCK_BATCHES.find(b => b.batchNumber === batchId);
  
  if (!batch && (batchId === "batch-detail" || !batchId)) {
    batch = MOCK_BATCHES[0];
  }
  
  const [selectedReferee, setSelectedReferee] = useState<string>("");
  const [selectedJudges, setSelectedJudges] = useState<string[]>([]);

  if (!batch) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-red-600 mx-auto mb-4 animate-bounce" />
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Batch not found</h2>
        </div>
      </div>
    );
  }

  // Get only available officials
  const availableReferees = getReferees().filter(r => r.status === "Available");
  const availableJudges = getJudges().filter(j => j.status === "Available");

  const handleToggleJudge = (judgeId: string) => {
    if (selectedJudges.includes(judgeId)) {
      setSelectedJudges(selectedJudges.filter(id => id !== judgeId));
    } else {
      if (selectedJudges.length < 3) {
        setSelectedJudges([...selectedJudges, judgeId]);
      } else {
        toast.error("❌ Maximum 3 judges can be assigned");
      }
    }
  };

  const handleSubmit = () => {
    if (!selectedReferee) {
      toast.error("❌ Please select a referee");
      return;
    }
    if (selectedJudges.length !== 3) {
      toast.error("❌ Exactly 3 judges are required");
      return;
    }

    // In real app, this would update the batch with officials and submit
    toast.success(`✅ Officials assigned successfully!`);
    navigate(`/home/batches/${batch.id}`);
  };

  const handleCancel = () => {
    navigate(-1);
  };

  const canSubmit = selectedReferee && selectedJudges.length === 3;

  return (
    <div className="min-h-screen bg-background py-8 animate-fadeIn">
      <div className="max-w-3xl mx-auto px-6">
        {/* Header */}
        <div className="mb-6">
          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-2 text-slate-500 hover:text-slate-900 font-semibold uppercase tracking-wider text-xs transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </button>
          
          {/* Modal-Style Card */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200/80 overflow-hidden">
            {/* Header */}
            <div className="p-6 md:p-8 pb-4">
              <h1 className="text-2xl font-extrabold text-slate-900 uppercase tracking-tighter mb-4">
                Assign Officials
              </h1>
              
              <div className="p-4 bg-primary/5 border border-primary/10 rounded-xl text-xs font-semibold text-primary flex items-center gap-2.5">
                <Shield className="w-4 h-4 text-primary shrink-0" />
                <span>Assigning officials to matches in {batch.batchNumber}</span>
              </div>
            </div>

            {/* Main Referee Section */}
            <div className="px-6 md:px-8 pb-6">
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">
                  Main Referee
                </label>
                <select
                  value={selectedReferee}
                  onChange={(e) => setSelectedReferee(e.target.value)}
                  className="input-premium font-medium text-slate-700 rounded-xl px-4 py-2.5 appearance-none cursor-pointer"
                >
                  <option value="">Select referee...</option>
                  {availableReferees.map(referee => (
                    <option key={referee.id} value={referee.id}>
                      {referee.name} - {referee.grade} ({referee.experience})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Judges Section */}
            <div className="px-6 md:px-8 pb-6">
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">
                  Judges (3 Required)
                </label>
                <div className="bg-slate-50/50 border border-slate-200/80 rounded-xl p-4 min-h-[200px]">
                  {availableJudges.length === 0 ? (
                    <div className="text-center py-8 text-slate-400">
                      <Users className="w-12 h-12 mx-auto mb-2 opacity-30" />
                      <p className="font-medium">No available judges</p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {availableJudges.map(judge => {
                        const isSelected = selectedJudges.includes(judge.id);
                        return (
                          <button
                            key={judge.id}
                            type="button"
                            onClick={() => handleToggleJudge(judge.id)}
                            className={`w-full text-left p-3.5 rounded-xl border transition-all duration-200 flex items-center justify-between ${
                              isSelected
                                ? "bg-primary border-primary text-white shadow-sm shadow-primary/20"
                                : "bg-white border-slate-200 hover:border-slate-350 text-slate-800"
                            }`}
                          >
                            <div className="flex-1">
                              <div className="font-semibold text-sm">{judge.name}</div>
                              <div className={`text-xs mt-1 font-medium ${isSelected ? "text-white/90" : "text-slate-500"}`}>
                                {judge.grade} • {judge.experience}
                              </div>
                            </div>
                            {isSelected && (
                              <Check className="w-4 h-4 flex-shrink-0 ml-2" />
                            )}
                          </button>
                        );
                      })}
                    </div>
                  )}
                  
                  {/* Selected Count */}
                  <div className="mt-4 text-center">
                    <span className={clsx(
                      "text-xs uppercase tracking-wider font-bold",
                      selectedJudges.length === 3 ? "text-emerald-600" : "text-slate-500"
                    )}>
                      {selectedJudges.length} / 3 judges selected
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="px-6 md:px-8 pb-8 flex items-center gap-3.5">
              <button
                onClick={handleSubmit}
                disabled={!canSubmit}
                className={clsx(
                  "flex-1 py-3 rounded-xl font-semibold uppercase tracking-wider text-xs transition-all shadow-sm hover:shadow active:scale-[0.98] hover:-translate-y-[0.5px]",
                  canSubmit
                    ? "bg-primary hover:bg-primary/95 text-white"
                    : "bg-slate-200 text-slate-400 cursor-not-allowed shadow-none"
                )}
              >
                Assign Officials
              </button>
              
              <button
                onClick={handleCancel}
                className="flex-1 py-3 bg-slate-50 hover:bg-slate-100 text-slate-700 rounded-xl font-semibold uppercase tracking-wider text-xs border border-slate-200 transition-all active:scale-[0.98] hover:-translate-y-[0.5px]"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}