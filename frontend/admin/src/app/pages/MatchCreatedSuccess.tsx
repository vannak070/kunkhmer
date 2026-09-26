import { useEffect } from "react";
import { useNavigate, useLocation } from "react-router";
import { CheckCircle, Box, Users, Scale, ArrowRight, Home } from "lucide-react";

export function MatchCreatedSuccess() {
  const navigate = useNavigate();
  const location = useLocation();
  const matchDetails = location.state;

  useEffect(() => {
    // If no match details, redirect to matches page
    if (!matchDetails) {
      navigate('/home/matches', { replace: true });
    }
  }, [matchDetails, navigate]);

  if (!matchDetails) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Success Icon */}
        <div className="text-center mb-8">
          <div className="w-24 h-24 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-2xl animate-in zoom-in">
            <CheckCircle className="w-14 h-14 text-white" />
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-[#1A1A24] mb-3 uppercase tracking-tight">
            Match Created Successfully!
          </h1>
          <p className="text-xl text-[#707070] font-medium">
            Your match has been added to the batch and is ready for the event
          </p>
        </div>

        {/* Match Details Card */}
        <div className="bg-white rounded-3xl shadow-2xl border-2 border-[#E0E0E0]/50 overflow-hidden mb-8">
          {/* Header */}
          <div className="bg-gradient-to-r from-[#0A3D91] to-[#051C42] p-6 text-white">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center">
                <Box className="w-7 h-7 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-black uppercase tracking-tight">
                  Match Details
                </h2>
                <p className="text-white/80 font-medium">
                  {matchDetails.batchNumber} • {matchDetails.eventName}
                </p>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="p-8 space-y-6">
            {/* Fighters */}
            <div className="bg-gradient-to-r from-[#F4F5F8] to-white rounded-2xl p-6 border-2 border-[#E0E0E0]">
              <div className="flex items-center justify-center gap-8">
                <div className="text-center">
                  <div className="w-20 h-20 bg-gradient-to-br from-[#C8102E] to-[#A00D24] rounded-full flex items-center justify-center mb-3 mx-auto shadow-lg">
                    <Users className="w-10 h-10 text-white" />
                  </div>
                  <h3 className="font-black text-lg text-[#1A1A24] mb-1">
                    {matchDetails.fighterA}
                  </h3>
                  <p className="text-xs font-bold text-[#C8102E] uppercase">Red Corner</p>
                  <p className="text-sm text-[#707070] font-semibold mt-2">{matchDetails.clubA}</p>
                </div>

                <div className="text-center px-6">
                  <div className="w-16 h-16 rounded-full bg-[#F5F5F7] border-2 border-[#E0E0E0] flex items-center justify-center font-black text-2xl text-[#B0B0B0] mb-2">
                    VS
                  </div>
                  <p className="text-xs font-bold text-[#707070]">{matchDetails.rounds} Rounds</p>
                </div>

                <div className="text-center">
                  <div className="w-20 h-20 bg-gradient-to-br from-[#0A3D91] to-[#051C42] rounded-full flex items-center justify-center mb-3 mx-auto shadow-lg">
                    <Users className="w-10 h-10 text-white" />
                  </div>
                  <h3 className="font-black text-lg text-[#1A1A24] mb-1">
                    {matchDetails.fighterB}
                  </h3>
                  <p className="text-xs font-bold text-[#0A3D91] uppercase">Blue Corner</p>
                  <p className="text-sm text-[#707070] font-semibold mt-2">{matchDetails.clubB}</p>
                </div>
              </div>
            </div>

            {/* Match Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-gradient-to-r from-amber-50 to-white rounded-xl p-5 border-2 border-amber-200">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-amber-500 to-amber-600 rounded-xl flex items-center justify-center">
                    <Scale className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-[#707070] uppercase">Agreed Weight</div>
                    <div className="text-xl font-black text-[#1A1A24]">{matchDetails.agreedWeight} kg</div>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-r from-purple-50 to-white rounded-xl p-5 border-2 border-purple-200">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center">
                    <Box className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-[#707070] uppercase">Gloves</div>
                    <div className="text-xl font-black text-[#1A1A24]">{matchDetails.gloveSize}</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Match Status */}
            <div className="bg-gradient-to-r from-green-50 to-white border-2 border-green-200 rounded-xl p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-black text-green-900 text-lg uppercase tracking-tight">
                  Match Status
                </h3>
                <span className="inline-flex items-center gap-2 px-4 py-2 bg-green-100 text-green-700 rounded-xl text-xs font-black uppercase border-2 border-green-200 shadow-sm">
                  <CheckCircle className="w-4 h-4" />
                  Confirmed
                </span>
              </div>
              <p className="text-sm text-green-700 font-bold">
                This match has been successfully added to <span className="font-black">{matchDetails.batchNumber}</span> and is ready for the upcoming event.
              </p>
            </div>

            {/* Info Note */}
            <div className="bg-gradient-to-r from-blue-50 to-white rounded-xl p-5 border-2 border-blue-200">
              <div className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-blue-600 mt-0.5" />
                <div>
                  <h4 className="font-black text-blue-900 text-sm mb-3">
                    What Happens Next?
                  </h4>
                  <ol className="space-y-2 text-sm text-blue-700">
                    <li className="flex items-start gap-2">
                      <span className="font-black">1.</span>
                      <span>The match is now part of the event fight card and ready to proceed</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="font-black">2.</span>
                      <span>Both fighters will be notified about the match details</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="font-black">3.</span>
                      <span>Officials will be assigned closer to the event date</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="font-black">4.</span>
                      <span>Weight-in will be scheduled before the event</span>
                    </li>
                  </ol>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4">
          <button
            onClick={() => navigate('/home/matches')}
            className="flex-1 bg-gradient-to-r from-[#0A3D91] to-[#051C42] text-white px-8 py-4 rounded-xl font-black uppercase tracking-wider flex items-center justify-center gap-2 hover:shadow-lg transition-all"
          >
            <Box className="w-5 h-5" />
            View All Batches
          </button>
          
          <button
            onClick={() => navigate(`/matches/${matchDetails.batchId}/create-match`)}
            className="flex-1 bg-gradient-to-r from-[#10B981] to-[#059669] text-white px-8 py-4 rounded-xl font-black uppercase tracking-wider flex items-center justify-center gap-2 hover:shadow-lg transition-all"
          >
            <ArrowRight className="w-5 h-5" />
            Create Another Match
          </button>
          
          <button
            onClick={() => navigate('/')}
            className="px-8 py-4 bg-white border-2 border-[#E0E0E0] text-[#1A1A24] rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-[#F4F5F8] transition-all"
          >
            <Home className="w-5 h-5" />
            Dashboard
          </button>
        </div>
      </div>
    </div>
  );
}