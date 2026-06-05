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
  
  const batch = MOCK_BATCHES.find(b => b.id === batchId);
  
  const [selectedReferee, setSelectedReferee] = useState<string>("");
  const [selectedJudges, setSelectedJudges] = useState<string[]>([]);

  if (!batch) {
    return (
      <div className="min-h-screen bg-[#F9FAFB] flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-red-600 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900">Batch not found</h2>
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
    navigate(`/home/batches/${batchId}`);
  };

  const handleCancel = () => {
    navigate(-1);
  };

  const canSubmit = selectedReferee && selectedJudges.length === 3;

  return (
    <div className="min-h-screen bg-[#F4F5F8] py-8">
      <div className="max-w-3xl mx-auto px-6">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-2 text-[#707070] hover:text-[#0A3D91] font-bold mb-4 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            Back
          </button>
          
          {/* Modal-Style Card */}
          <div className="bg-white rounded-3xl shadow-2xl border border-[#E0E0E0] overflow-hidden">
            {/* Header */}
            <div className="p-8 pb-6">
              <h1 className="text-3xl font-black text-[#0A3D91] uppercase tracking-tight mb-2">
                Assign Officials
              </h1>
              <p className="text-sm text-[#0A3D91] font-bold bg-blue-50 rounded-xl px-4 py-3 border border-blue-200">
                Assigning officials to specific match
              </p>
            </div>

            {/* Main Referee Section */}
            <div className="px-8 pb-6">
              <div className="mb-2">
                <label className="block text-sm font-bold text-[#707070] uppercase mb-2">
                  Main Referee
                </label>
                <select
                  value={selectedReferee}
                  onChange={(e) => setSelectedReferee(e.target.value)}
                  className="w-full bg-white border-2 border-[#E0E0E0] rounded-xl px-4 py-3 text-[#1A1A24] font-bold focus:outline-none focus:border-[#0A3D91] appearance-none cursor-pointer"
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
            <div className="px-8 pb-6">
              <div className="mb-2">
                <label className="block text-sm font-bold text-[#707070] uppercase mb-2">
                  Judges (3 Required)
                </label>
                <div className="bg-[#F4F5F8] border-2 border-[#E0E0E0] rounded-xl p-4 min-h-[200px]">
                  {availableJudges.length === 0 ? (
                    <div className="text-center py-8 text-[#B0B0B0]">
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
                            onClick={() => handleToggleJudge(judge.id)}
                            className={`w-full text-left p-3 rounded-lg border-2 transition-all flex items-center justify-between ${
                              isSelected
                                ? "bg-[#0A3D91] border-[#0A3D91] text-white"
                                : "bg-white border-[#E0E0E0] hover:border-[#0A3D91] text-[#1A1A24]"
                            }`}
                          >
                            <div className="flex-1">
                              <div className="font-bold">{judge.name}</div>
                              <div className="text-xs mt-1 opacity-80">
                                {judge.grade} • {judge.experience}
                              </div>
                            </div>
                            {isSelected && (
                              <Check className="w-5 h-5 flex-shrink-0 ml-2" />
                            )}
                          </button>
                        );
                      })}
                    </div>
                  )}
                  
                  <div className="mt-3 text-xs text-[#707070] font-medium text-center">
                    Hold Ctrl/Cmd to select multiple judges
                  </div>
                  
                  {/* Selected Count */}
                  <div className="mt-3 text-center">
                    <span className={`text-sm font-bold ${
                      selectedJudges.length === 3 ? "text-green-600" : "text-[#707070]"
                    }`}>
                      {selectedJudges.length} / 3 judges selected
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="px-8 pb-8 flex items-center gap-4">
              <button
                onClick={handleSubmit}
                disabled={!canSubmit}
                className={`flex-1 py-4 rounded-xl font-bold text-base transition-all ${
                  canSubmit
                    ? "bg-[#5B4FFF] hover:bg-[#4A3FDD] text-white shadow-lg hover:shadow-xl"
                    : "bg-gray-300 text-gray-500 cursor-not-allowed"
                }`}
              >
                Assign Officials
              </button>
              
              <button
                onClick={handleCancel}
                className="flex-1 py-4 bg-white border-2 border-[#E0E0E0] text-[#1A1A24] hover:border-[#707070] rounded-xl font-bold text-base transition-all"
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