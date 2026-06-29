import { useState } from "react";
import { useNavigate, useParams } from "react-router";
import { 
  Shield, Users, CheckCircle, ArrowLeft, Send, 
  Plus, X, AlertCircle, UserCheck
} from "lucide-react";
import { MOCK_BATCHES } from "../data/batches";
import { MOCK_JUDGES, MOCK_REFEREES } from "../data/officials";
import { toast } from "sonner";

export default function AssignOfficials() {
  const { batchId } = useParams();
  const navigate = useNavigate();
  
  const batch = MOCK_BATCHES.find(b => b.id === batchId);
  
  const [selectedJudges, setSelectedJudges] = useState<string[]>([]);
  const [selectedReferees, setSelectedReferees] = useState<string[]>([]);
  const [showJudgeList, setShowJudgeList] = useState(false);
  const [showRefereeList, setShowRefereeList] = useState(false);

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

  const handleAddJudge = (judgeId: string) => {
    if (!selectedJudges.includes(judgeId)) {
      setSelectedJudges([...selectedJudges, judgeId]);
      setShowJudgeList(false);
      toast.success("✅ Judge added");
    }
  };

  const handleRemoveJudge = (judgeId: string) => {
    setSelectedJudges(selectedJudges.filter(id => id !== judgeId));
    toast.info("Judge removed");
  };

  const handleAddReferee = (refereeId: string) => {
    if (!selectedReferees.includes(refereeId)) {
      setSelectedReferees([...selectedReferees, refereeId]);
      setShowRefereeList(false);
      toast.success("✅ Referee added");
    }
  };

  const handleRemoveReferee = (refereeId: string) => {
    setSelectedReferees(selectedReferees.filter(id => id !== refereeId));
    toast.info("Referee removed");
  };

  const handleSubmit = () => {
    if (selectedJudges.length === 0) {
      toast.error("❌ Please assign at least one judge");
      return;
    }
    if (selectedReferees.length === 0) {
      toast.error("❌ Please assign at least one referee");
      return;
    }

    // In real app, this would update the batch with officials and submit
    toast.success(`✅ Batch ${batch.batchNumber} submitted to KKF with assigned officials!`);
    navigate("/home/matches");
  };

  const canSubmit = selectedJudges.length > 0 && selectedReferees.length > 0;

  return (
    <div className="min-h-screen bg-[#F9FAFB] py-8">
      <div className="max-w-5xl mx-auto px-6">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-2 text-[#707070] hover:text-[#0A3D91] font-bold mb-4 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            Back
          </button>
          
          <div className="bg-white rounded-2xl p-8 shadow-sm border-2 border-[#E0E0E0]">
            <div className="flex items-start gap-4 mb-4">
              <div className="w-14 h-14 bg-gradient-to-br from-[#0A3D91] to-[#082F6E] rounded-xl flex items-center justify-center">
                <Shield className="w-7 h-7 text-white" />
              </div>
              <div className="flex-1">
                <h1 className="text-3xl font-black text-[#0A3D91] uppercase tracking-tight mb-2">
                  Assign Officials
                </h1>
                <p className="text-[#707070] font-bold">
                  Assign judges and referees before submitting to KKF for approval
                </p>
              </div>
            </div>

            {/* Batch Info */}
            <div className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-200">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <div className="text-xs font-black text-blue-900 uppercase mb-1">Batch</div>
                  <div className="text-lg font-black text-blue-700">{batch.batchNumber}</div>
                </div>
                <div>
                  <div className="text-xs font-black text-blue-900 uppercase mb-1">Event</div>
                  <div className="text-lg font-black text-blue-700">{batch.eventName}</div>
                </div>
                <div>
                  <div className="text-xs font-black text-blue-900 uppercase mb-1">Matches</div>
                  <div className="text-lg font-black text-blue-700">{batch.totalMatches} Matches</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {/* Judges Section */}
          <div className="bg-white rounded-2xl border-2 border-[#E0E0E0] overflow-hidden">
            <div className="p-6 border-b-2 border-[#E0E0E0] bg-gradient-to-r from-purple-50 to-indigo-50">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-purple-600 rounded-lg flex items-center justify-center">
                    <Users className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h2 className="text-lg font-black text-[#1A1A24] uppercase">Judges</h2>
                    <p className="text-xs text-[#707070] font-medium">
                      {selectedJudges.length} assigned
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setShowJudgeList(!showJudgeList)}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-bold transition-all text-sm"
                >
                  <Plus className="w-4 h-4" />
                  Add Judge
                </button>
              </div>
            </div>

            {/* Selected Judges */}
            <div className="p-6">
              {selectedJudges.length === 0 ? (
                <div className="text-center py-8 text-[#B0B0B0]">
                  <Users className="w-12 h-12 mx-auto mb-2 opacity-30" />
                  <p className="font-medium">No judges assigned yet</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {selectedJudges.map(judgeId => {
                    const judge = MOCK_JUDGES.find(j => j.id === judgeId);
                    if (!judge) return null;
                    return (
                      <div key={judge.id} className="flex items-center justify-between p-4 bg-purple-50 rounded-xl border border-purple-200">
                        <div className="flex-1">
                          <div className="font-black text-[#1A1A24] mb-1">{judge.name}</div>
                          <div className="flex items-center gap-3 text-xs">
                            <span className="text-purple-700 font-bold">{judge.grade}</span>
                            <span className="text-[#707070] font-medium">{judge.experience}</span>
                          </div>
                        </div>
                        <button
                          onClick={() => handleRemoveJudge(judge.id)}
                          className="p-2 hover:bg-red-100 rounded-lg transition-colors"
                        >
                          <X className="w-4 h-4 text-red-600" />
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Judge Selection List */}
              {showJudgeList && (
                <div className="mt-4 p-4 bg-[#F9FAFB] rounded-xl border-2 border-purple-200">
                  <div className="text-xs font-black text-[#707070] uppercase mb-3">Available Judges</div>
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {MOCK_JUDGES.filter(j => !selectedJudges.includes(j.id)).map(judge => (
                      <button
                        key={judge.id}
                        onClick={() => handleAddJudge(judge.id)}
                        disabled={judge.status === "Busy"}
                        className={`w-full text-left p-3 rounded-lg border transition-all ${
                          judge.status === "Available"
                            ? "bg-white border-[#E0E0E0] hover:border-purple-300 hover:bg-purple-50"
                            : "bg-gray-100 border-gray-200 opacity-50 cursor-not-allowed"
                        }`}
                      >
                        <div className="font-bold text-[#1A1A24] mb-1">{judge.name}</div>
                        <div className="flex items-center gap-3 text-xs">
                          <span className="text-purple-700 font-bold">{judge.grade}</span>
                          <span className="text-[#707070]">{judge.experience}</span>
                          {judge.status === "Busy" && (
                            <span className="text-red-600 font-bold">Unavailable</span>
                          )}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Referees Section */}
          <div className="bg-white rounded-2xl border-2 border-[#E0E0E0] overflow-hidden">
            <div className="p-6 border-b-2 border-[#E0E0E0] bg-gradient-to-r from-blue-50 to-cyan-50">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                    <UserCheck className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h2 className="text-lg font-black text-[#1A1A24] uppercase">Referees</h2>
                    <p className="text-xs text-[#707070] font-medium">
                      {selectedReferees.length} assigned
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setShowRefereeList(!showRefereeList)}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold transition-all text-sm"
                >
                  <Plus className="w-4 h-4" />
                  Add Referee
                </button>
              </div>
            </div>

            {/* Selected Referees */}
            <div className="p-6">
              {selectedReferees.length === 0 ? (
                <div className="text-center py-8 text-[#B0B0B0]">
                  <UserCheck className="w-12 h-12 mx-auto mb-2 opacity-30" />
                  <p className="font-medium">No referees assigned yet</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {selectedReferees.map(refereeId => {
                    const referee = MOCK_REFEREES.find(r => r.id === refereeId);
                    if (!referee) return null;
                    return (
                      <div key={referee.id} className="flex items-center justify-between p-4 bg-blue-50 rounded-xl border border-blue-200">
                        <div className="flex-1">
                          <div className="font-black text-[#1A1A24] mb-1">{referee.name}</div>
                          <div className="flex items-center gap-3 text-xs">
                            <span className="text-blue-700 font-bold">{referee.grade}</span>
                            <span className="text-[#707070] font-medium">{referee.experience}</span>
                          </div>
                        </div>
                        <button
                          onClick={() => handleRemoveReferee(referee.id)}
                          className="p-2 hover:bg-red-100 rounded-lg transition-colors"
                        >
                          <X className="w-4 h-4 text-red-600" />
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Referee Selection List */}
              {showRefereeList && (
                <div className="mt-4 p-4 bg-[#F9FAFB] rounded-xl border-2 border-blue-200">
                  <div className="text-xs font-black text-[#707070] uppercase mb-3">Available Referees</div>
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {MOCK_REFEREES.filter(r => !selectedReferees.includes(r.id)).map(referee => (
                      <button
                        key={referee.id}
                        onClick={() => handleAddReferee(referee.id)}
                        disabled={referee.status === "Busy"}
                        className={`w-full text-left p-3 rounded-lg border transition-all ${
                          referee.status === "Available"
                            ? "bg-white border-[#E0E0E0] hover:border-blue-300 hover:bg-blue-50"
                            : "bg-gray-100 border-gray-200 opacity-50 cursor-not-allowed"
                        }`}
                      >
                        <div className="font-bold text-[#1A1A24] mb-1">{referee.name}</div>
                        <div className="flex items-center gap-3 text-xs">
                          <span className="text-blue-700 font-bold">{referee.grade}</span>
                          <span className="text-[#707070]">{referee.experience}</span>
                          {referee.status === "Busy" && (
                            <span className="text-red-600 font-bold">Unavailable</span>
                          )}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Requirements Check */}
        <div className="bg-white rounded-2xl border-2 border-[#E0E0E0] p-6 mb-8">
          <h3 className="text-sm font-black text-[#1A1A24] uppercase mb-4">Submission Requirements</h3>
          <div className="space-y-3">
            <div className={`flex items-center gap-3 p-3 rounded-lg ${
              selectedJudges.length > 0 ? 'bg-green-50 border border-green-200' : 'bg-gray-50 border border-gray-200'
            }`}>
              <CheckCircle className={`w-5 h-5 ${selectedJudges.length > 0 ? 'text-green-600' : 'text-gray-400'}`} />
              <span className={`font-bold ${selectedJudges.length > 0 ? 'text-green-900' : 'text-[#707070]'}`}>
                At least one judge assigned ({selectedJudges.length})
              </span>
            </div>
            <div className={`flex items-center gap-3 p-3 rounded-lg ${
              selectedReferees.length > 0 ? 'bg-green-50 border border-green-200' : 'bg-gray-50 border border-gray-200'
            }`}>
              <CheckCircle className={`w-5 h-5 ${selectedReferees.length > 0 ? 'text-green-600' : 'text-gray-400'}`} />
              <span className={`font-bold ${selectedReferees.length > 0 ? 'text-green-900' : 'text-[#707070]'}`}>
                At least one referee assigned ({selectedReferees.length})
              </span>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between gap-4">
          <button
            onClick={() => navigate(-1)}
            className="px-6 py-3 border-2 border-[#E0E0E0] text-[#707070] hover:border-[#0A3D91] hover:text-[#0A3D91] rounded-xl font-bold transition-all"
          >
            Cancel
          </button>
          
          <button
            onClick={handleSubmit}
            disabled={!canSubmit}
            className={`inline-flex items-center gap-2 px-8 py-3 rounded-xl font-bold transition-all shadow-lg ${
              canSubmit
                ? 'bg-gradient-to-r from-green-600 to-green-700 text-white hover:shadow-xl'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            <Send className="w-5 h-5" />
            Submit to KKF
          </button>
        </div>
      </div>
    </div>
  );
}