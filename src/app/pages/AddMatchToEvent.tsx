import { useState } from "react";
import { useNavigate, useParams } from "react-router";
import { ArrowLeft, Users, Send, Save as SaveDraft, CheckCircle, AlertCircle } from "lucide-react";
import { MOCK_EVENTS, MOCK_FIGHTERS, MOCK_MATCHES } from "../data/mock";
import { GLOVE_SIZES, GLOVE_TYPES, getApprovedGloveTypes } from "../data/masterData";
import { usePermissions } from "../hooks/usePermissions";
import { toast } from "sonner";

export function AddMatchToEvent() {
  const navigate = useNavigate();
  const { eventId, subEventId } = useParams();
  const permissions = usePermissions();
  
  const event = MOCK_EVENTS.find(e => e.id === eventId);
  const subEvent = subEventId ? MOCK_EVENTS.find(e => e.subEvents?.some(se => se.id === subEventId))?.subEvents?.find(se => se.id === subEventId) : null;
  
  const [matchData, setMatchData] = useState({
    fighterAId: "",
    fighterBId: "",
    rounds: 5,
    roundTime: 3,
    knockdownLimit: 3,
    agreedWeight: "",
    gloveSize: "8oz",
    gloveType: "Twins Special BGVL-3",
    fighterAConfirmed: false,
    fighterBConfirmed: false,
    notes: "",
  });

  // All available fighters (both Kun Khmer and Foreigner)
  const availableFighters = MOCK_FIGHTERS.filter(f => f.status === "Active");

  const getFighterById = (id: string) => {
    return MOCK_FIGHTERS.find(f => f.id === id);
  };

  const fighterA = getFighterById(matchData.fighterAId);
  const fighterB = getFighterById(matchData.fighterBId);

  // Calculate weight difference
  const weightDiff = fighterA && fighterB ? Math.abs(fighterA.weight - fighterB.weight).toFixed(1) : null;
  const hasWeightMismatch = weightDiff && parseFloat(weightDiff) > 2.0;

  // Validate glove agreement
  const isGloveAgreementComplete = matchData.fighterAConfirmed && matchData.fighterBConfirmed;

  const handleSaveDraft = () => {
    if (!matchData.fighterAId || !matchData.fighterBId) {
      toast.error("Please select both fighters");
      return;
    }
    
    if (matchData.fighterAId === matchData.fighterBId) {
      toast.error("Cannot match a fighter against themselves");
      return;
    }

    if (!matchData.agreedWeight) {
      toast.error("Please specify agreed weight for the match");
      return;
    }

    const fighterA = getFighterById(matchData.fighterAId);
    const fighterB = getFighterById(matchData.fighterBId);
    
    if (!fighterA || !fighterB) return;

    const newMatch = {
      id: `m${Date.now()}`,
      eventId: eventId,
      subEventId: subEventId || null,
      fighterA: fighterA,
      fighterB: fighterB,
      agreedWeight: parseFloat(matchData.agreedWeight),
      rounds: matchData.rounds,
      roundTime: matchData.roundTime,
      knockdownLimit: matchData.knockdownLimit,
      gloveAgreement: {
        gloveSize: matchData.gloveSize,
        gloveType: matchData.gloveType,
        fighterAConfirmed: matchData.fighterAConfirmed,
        fighterBConfirmed: matchData.fighterBConfirmed,
        refereeConfirmed: false,
        confirmedDate: null,
        checkPhotoUrl: null,
      },
      status: "Draft",
      date: event?.date || "",
      proposalStatus: "draft",
      clubAResponse: "pending",
      clubBResponse: "pending",
      proposedBy: permissions.currentUser?.fullName || "Organizer",
      proposedDate: new Date().toISOString().split('T')[0],
      notes: matchData.notes,
    };

    MOCK_MATCHES.push(newMatch);
    toast.success("✓ Match saved as draft");
    
    if (subEventId) {
      navigate(`/home/events/${eventId}/sub-events/${subEventId}`);
    } else {
      navigate(`/home/events/${eventId}`);
    }
  };

  const handleProposeMatch = () => {
    if (!matchData.fighterAId || !matchData.fighterBId) {
      toast.error("Please select both fighters");
      return;
    }
    
    if (matchData.fighterAId === matchData.fighterBId) {
      toast.error("Cannot match a fighter against themselves");
      return;
    }

    if (!matchData.agreedWeight) {
      toast.error("Please specify agreed weight for the match");
      return;
    }

    if (!isGloveAgreementComplete) {
      toast.error("Both fighters must confirm glove agreement");
      return;
    }

    const fighterA = getFighterById(matchData.fighterAId);
    const fighterB = getFighterById(matchData.fighterBId);
    
    if (!fighterA || !fighterB) return;

    const newMatch = {
      id: `m${Date.now()}`,
      eventId: eventId,
      subEventId: subEventId || null,
      fighterA: fighterA,
      fighterB: fighterB,
      agreedWeight: parseFloat(matchData.agreedWeight),
      rounds: matchData.rounds,
      roundTime: matchData.roundTime,
      knockdownLimit: matchData.knockdownLimit,
      gloveAgreement: {
        gloveSize: matchData.gloveSize,
        gloveType: matchData.gloveType,
        fighterAConfirmed: matchData.fighterAConfirmed,
        fighterBConfirmed: matchData.fighterBConfirmed,
        refereeConfirmed: false,
        confirmedDate: new Date().toISOString(),
        checkPhotoUrl: null,
      },
      status: permissions.currentUser?.role === "organizer" ? "Pending KKF Approval" : "Proposed",
      date: event?.date || "",
      proposalStatus: permissions.currentUser?.role === "organizer" ? "pending_kkf" : "pending",
      clubAResponse: "pending",
      clubBResponse: "pending",
      proposedBy: permissions.currentUser?.fullName || "Organizer",
      proposedDate: new Date().toISOString().split('T')[0],
      notes: matchData.notes,
    };

    MOCK_MATCHES.push(newMatch);
    if (permissions.currentUser?.role === "organizer") {
      toast.success(`✓ Match submitted for KKF Manager approval`);
    } else {
      toast.success(`✓ Match proposed to ${fighterA.gym} and ${fighterB.gym}`);
    }
    
    if (subEventId) {
      navigate(`/home/events/${eventId}/sub-events/${subEventId}`);
    } else {
      navigate(`/home/events/${eventId}`);
    }
  };

  if (!event) {
    return (
      <div className="p-8 text-center">
        <p className="text-[#707070]">Event not found</p>
      </div>
    );
  }

  const approvedGloves = getApprovedGloveTypes();

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 py-6 px-4 md:px-8">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <button 
            onClick={() => {
              if (subEventId) {
                navigate(`/home/events/${eventId}/sub-events/${subEventId}`);
              } else {
                navigate(`/home/events/${eventId}`);
              }
            }}
            className="inline-flex items-center gap-2 text-[#707070] hover:text-[#0A3D91] font-semibold transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            Back
          </button>
        </div>

        {/* Page Title */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-black text-[#1A1A24] mb-1">Create Match</h1>
              <p className="text-sm text-[#707070]">{event.name} • {event.date}</p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={handleSaveDraft}
                className="inline-flex items-center gap-2 bg-white border-2 border-gray-300 hover:border-[#0A3D91] text-[#0A3D91] px-6 py-3 rounded-xl font-bold transition-all"
              >
                <SaveDraft className="w-4 h-4" />
                Save Draft
              </button>
              
              <button
                onClick={handleProposeMatch}
                disabled={!isGloveAgreementComplete}
                className={`inline-flex items-center gap-2 px-6 py-3 rounded-xl font-bold transition-all ${
                  isGloveAgreementComplete
                    ? 'bg-gradient-to-r from-[#C8102E] to-[#A00D24] hover:from-[#A00D24] hover:to-[#8A0B20] text-white shadow-lg hover:shadow-xl'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
              >
                <Send className="w-4 h-4" />
                {permissions.currentUser?.role === 'organizer' ? 'Submit for KKF Approval' : 'Create Match'}
              </button>
            </div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Fighter Selection */}
          <div className="lg:col-span-2 space-y-6">
            {/* Fighter Cards */}
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
              <h2 className="text-lg font-black text-[#1A1A24] mb-4 flex items-center gap-2">
                <Users className="w-5 h-5 text-[#0A3D91]" />
                Fight Card
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Fighter A - Red Corner */}
                <div>
                  <label className="block text-xs font-bold text-[#707070] uppercase tracking-wider mb-3">
                    Red Corner
                  </label>
                  <select
                    value={matchData.fighterAId}
                    onChange={(e) => setMatchData({...matchData, fighterAId: e.target.value})}
                    className="w-full bg-gray-50 border-2 border-gray-200 rounded-xl px-4 py-3 text-[#1A1A24] font-semibold focus:outline-none focus:ring-2 focus:ring-[#C8102E] focus:border-[#C8102E] transition-all"
                  >
                    <option value="">Select Fighter</option>
                    <optgroup label="🇰🇭 Kun Khmer">
                      {availableFighters.filter(f => f.origin === "Local").map(fighter => (
                        <option key={fighter.id} value={fighter.id}>
                          {fighter.name} - {fighter.weight}kg - {fighter.gym}
                        </option>
                      ))}
                    </optgroup>
                    <optgroup label="🌍 International">
                      {availableFighters.filter(f => f.origin === "Foreigner").map(fighter => (
                        <option key={fighter.id} value={fighter.id}>
                          {fighter.name} - {fighter.weight}kg - {fighter.gym}
                        </option>
                      ))}
                    </optgroup>
                  </select>
                  
                  {fighterA && (
                    <div className="mt-4 bg-gradient-to-br from-red-50 to-white rounded-xl border-2 border-[#C8102E] p-4">
                      <div className="flex items-center gap-3 mb-3">
                        <img 
                          src={fighterA.image} 
                          alt={fighterA.name} 
                          className="w-16 h-16 rounded-full object-cover border-3 border-[#C8102E] ring-4 ring-red-100"
                        />
                        <div className="flex-1">
                          <h3 className="font-black text-lg text-[#1A1A24]">{fighterA.name}</h3>
                          <p className="text-xs text-[#707070] font-medium uppercase tracking-wide">
                            {fighterA.fightingStyle || "AGGRESSIVE"}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 text-xs">
                        <span className="font-mono font-bold bg-white text-[#C8102E] px-3 py-1 rounded-lg border border-red-200">
                          {fighterA.record}
                        </span>
                        <span className="font-bold text-[#707070]">{fighterA.weight}kg</span>
                        <span className="text-[#707070]">• {fighterA.gym}</span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Fighter B - Blue Corner */}
                <div>
                  <label className="block text-xs font-bold text-[#707070] uppercase tracking-wider mb-3">
                    Blue Corner
                  </label>
                  <select
                    value={matchData.fighterBId}
                    onChange={(e) => setMatchData({...matchData, fighterBId: e.target.value})}
                    className="w-full bg-gray-50 border-2 border-gray-200 rounded-xl px-4 py-3 text-[#1A1A24] font-semibold focus:outline-none focus:ring-2 focus:ring-[#0A3D91] focus:border-[#0A3D91] transition-all"
                  >
                    <option value="">Select Fighter</option>
                    <optgroup label="🇰🇭 Kun Khmer">
                      {availableFighters.filter(f => f.origin === "Local").map(fighter => (
                        <option key={fighter.id} value={fighter.id}>
                          {fighter.name} - {fighter.weight}kg - {fighter.gym}
                        </option>
                      ))}
                    </optgroup>
                    <optgroup label="🌍 International">
                      {availableFighters.filter(f => f.origin === "Foreigner").map(fighter => (
                        <option key={fighter.id} value={fighter.id}>
                          {fighter.name} - {fighter.weight}kg - {fighter.gym}
                        </option>
                      ))}
                    </optgroup>
                  </select>
                  
                  {fighterB && (
                    <div className="mt-4 bg-gradient-to-br from-blue-50 to-white rounded-xl border-2 border-[#0A3D91] p-4">
                      <div className="flex items-center gap-3 mb-3">
                        <img 
                          src={fighterB.image} 
                          alt={fighterB.name} 
                          className="w-16 h-16 rounded-full object-cover border-3 border-[#0A3D91] ring-4 ring-blue-100"
                        />
                        <div className="flex-1">
                          <h3 className="font-black text-lg text-[#1A1A24]">{fighterB.name}</h3>
                          <p className="text-xs text-[#707070] font-medium uppercase tracking-wide">
                            {fighterB.fightingStyle || "CLINCH SPECIALIST"}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 text-xs">
                        <span className="font-mono font-bold bg-white text-[#0A3D91] px-3 py-1 rounded-lg border border-blue-200">
                          {fighterB.record}
                        </span>
                        <span className="font-bold text-[#707070]">{fighterB.weight}kg</span>
                        <span className="text-[#707070]">• {fighterB.gym}</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* VS Preview & Interactive Stats Radar */}
              {fighterA && fighterB && (
                <div className="mt-6 bg-gradient-to-b from-[#1A1A24] to-[#0A3D91] rounded-3xl border-2 border-white/10 shadow-2xl p-6 text-white relative overflow-hidden">
                  <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10 pointer-events-none" />
                  
                  {/* Title */}
                  <div className="text-center mb-6 relative z-10">
                    <span className="bg-[#F2C94C] text-[#1A1A24] text-[10px] font-black px-3 py-1 rounded uppercase tracking-[0.2em] shadow-lg">
                      Fighter Head-to-Head Comparison
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center relative z-10">
                    {/* Fighter A - Red Corner */}
                    <div className="text-center bg-white/5 border border-red-500/20 p-4 rounded-2xl backdrop-blur-sm">
                      <div className="relative inline-block mb-3">
                        <img 
                          src={fighterA.image} 
                          alt={fighterA.name} 
                          className="w-24 h-24 rounded-full object-cover border-4 border-[#C8102E] shadow-xl mx-auto"
                        />
                        <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-[#C8102E] text-white text-[10px] font-black px-2 py-0.5 rounded-full whitespace-nowrap tracking-wider">
                          RED CORNER
                        </div>
                      </div>
                      <h4 className="font-black text-base truncate mt-2">{fighterA.name}</h4>
                      <p className="text-[10px] text-gray-300 font-bold uppercase tracking-widest mt-0.5">{fighterA.gym}</p>
                      
                      <div className="mt-3 flex items-center justify-center gap-1.5">
                        <span className="bg-white/10 text-white text-xs font-mono font-bold px-2 py-1 rounded">
                          {fighterA.record}
                        </span>
                        <span className="bg-[#C8102E] text-white text-[10px] font-black px-2 py-1 rounded uppercase tracking-wider">
                          Grade {fighterA.grade}
                        </span>
                      </div>
                    </div>
                    
                    {/* VS Graphic and Config Stats */}
                    <div className="text-center flex flex-col items-center">
                      <div className="w-16 h-16 bg-gradient-to-br from-[#C8102E] to-[#0A3D91] rounded-2xl rotate-45 flex items-center justify-center shadow-2xl border border-white/20">
                        <span className="font-black italic text-2xl text-white -rotate-45 block leading-none pr-1">VS</span>
                      </div>
                      
                      <div className="mt-4 space-y-1">
                        <p className="text-xs font-black text-[#F2C94C] uppercase tracking-[0.2em]">{matchData.rounds} ROUNDS • {matchData.roundTime} MIN</p>
                        <p className="text-[10px] text-gray-300 uppercase font-bold tracking-widest">Weight Limit: {matchData.agreedWeight || "N/A"}kg</p>
                      </div>
                    </div>
                    
                    {/* Fighter B - Blue Corner */}
                    <div className="text-center bg-white/5 border border-blue-500/20 p-4 rounded-2xl backdrop-blur-sm">
                      <div className="relative inline-block mb-3">
                        <img 
                          src={fighterB.image} 
                          alt={fighterB.name} 
                          className="w-24 h-24 rounded-full object-cover border-4 border-[#0A3D91] shadow-xl mx-auto"
                        />
                        <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-[#0A3D91] text-white text-[10px] font-black px-2 py-0.5 rounded-full whitespace-nowrap tracking-wider">
                          BLUE CORNER
                        </div>
                      </div>
                      <h4 className="font-black text-base truncate mt-2">{fighterB.name}</h4>
                      <p className="text-[10px] text-gray-300 font-bold uppercase tracking-widest mt-0.5">{fighterB.gym}</p>
                      
                      <div className="mt-3 flex items-center justify-center gap-1.5">
                        <span className="bg-white/10 text-white text-xs font-mono font-bold px-2 py-1 rounded">
                          {fighterB.record}
                        </span>
                        <span className="bg-[#0A3D91] text-white text-[10px] font-black px-2 py-1 rounded uppercase tracking-wider">
                          Grade {fighterB.grade}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Comparative Stats Bars */}
                  <div className="mt-6 pt-5 border-t border-white/10 space-y-3 relative z-10">
                    <div>
                      <div className="flex justify-between text-[10px] font-bold text-gray-300 uppercase tracking-widest mb-1.5">
                        <span>Style: {fighterA.style || "Aggressive"}</span>
                        <span className="text-white font-black">FIGHTING STYLE</span>
                        <span>Style: {fighterB.style || "Clinch"}</span>
                      </div>
                      <div className="h-2 w-full bg-white/10 rounded-full overflow-hidden flex">
                        <div className="h-full bg-[#C8102E] w-1/2" />
                        <div className="h-full bg-[#0A3D91] w-1/2" />
                      </div>
                    </div>

                    {/* Kun Khmer Weight Tolerance Gauge */}
                    {matchData.agreedWeight && (
                      <div className="bg-white/5 border border-white/5 rounded-2xl p-4 mt-2">
                        <p className="text-center text-[10px] font-black text-[#F2C94C] uppercase tracking-[0.25em] mb-3">
                          Kun Khmer Weight Agreement Tolerance (±2.0kg Limit)
                        </p>
                        
                        <div className="space-y-3">
                          {/* Fighter A Weight Deviation */}
                          <div>
                            <div className="flex justify-between text-xs mb-1">
                              <span className="font-bold text-red-400">{fighterA.name} ({fighterA.weight}kg)</span>
                              <span className="font-mono">
                                Diff: {Math.abs(fighterA.weight - parseFloat(matchData.agreedWeight)).toFixed(1)}kg 
                                {Math.abs(fighterA.weight - parseFloat(matchData.agreedWeight)) > 2.0 ? " ❌ (Out)" : " ✓ (OK)"}
                              </span>
                            </div>
                            <div className="h-2 w-full bg-white/10 rounded-full relative">
                              <div 
                                className={`h-full rounded-full transition-all duration-500 ${
                                  Math.abs(fighterA.weight - parseFloat(matchData.agreedWeight)) > 2.0 ? 'bg-red-500' : 'bg-green-500'
                                }`} 
                                style={{ width: `${Math.min((fighterA.weight / parseFloat(matchData.agreedWeight)) * 100, 100)}%` }}
                              />
                            </div>
                          </div>

                          {/* Fighter B Weight Deviation */}
                          <div>
                            <div className="flex justify-between text-xs mb-1">
                              <span className="font-bold text-blue-400">{fighterB.name} ({fighterB.weight}kg)</span>
                              <span className="font-mono">
                                Diff: {Math.abs(fighterB.weight - parseFloat(matchData.agreedWeight)).toFixed(1)}kg 
                                {Math.abs(fighterB.weight - parseFloat(matchData.agreedWeight)) > 2.0 ? " ❌ (Out)" : " ✓ (OK)"}
                              </span>
                            </div>
                            <div className="h-2 w-full bg-white/10 rounded-full relative">
                              <div 
                                className={`h-full rounded-full transition-all duration-500 ${
                                  Math.abs(fighterB.weight - parseFloat(matchData.agreedWeight)) > 2.0 ? 'bg-red-500' : 'bg-green-500'
                                }`} 
                                style={{ width: `${Math.min((fighterB.weight / parseFloat(matchData.agreedWeight)) * 100, 100)}%` }}
                              />
                            </div>
                          </div>
                        </div>

                        {/* Deviation Exceeded Alert Block */}
                        {(Math.abs(fighterA.weight - parseFloat(matchData.agreedWeight)) > 2.0 || 
                          Math.abs(fighterB.weight - parseFloat(matchData.agreedWeight)) > 2.0) && (
                          <div className="mt-4 bg-red-500/20 border border-red-500/40 rounded-xl p-3 flex items-start gap-2">
                            <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                            <p className="text-xs text-red-200">
                              <strong>Weight Limit Exceeded:</strong> One or both fighters current weights deviate from the agreed weight by more than 2.0kg. Please adjust agreed weight or select compliant fighters.
                            </p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Match Notes */}
            {fighterA && fighterB && (
              <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
                <label className="block text-xs font-bold text-[#707070] uppercase tracking-wider mb-3">
                  Match Notes (Optional)
                </label>
                <textarea
                  value={matchData.notes}
                  onChange={(e) => setMatchData({...matchData, notes: e.target.value})}
                  className="w-full bg-gray-50 border-2 border-gray-200 rounded-xl px-4 py-3 text-[#1A1A24] font-medium focus:outline-none focus:ring-2 focus:ring-[#0A3D91] focus:border-[#0A3D91] transition-all resize-none"
                  rows={3}
                  placeholder="Special conditions, requirements, or additional information..."
                />
              </div>
            )}
          </div>

          {/* Right Column - Configuration */}
          <div className="space-y-6">
            {/* Match Rules */}
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
              <h2 className="text-lg font-black text-[#1A1A24] mb-4">Match Rules</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-[#707070] uppercase tracking-wider mb-2">
                    Rounds
                  </label>
                  <select
                    value={matchData.rounds}
                    onChange={(e) => setMatchData({...matchData, rounds: parseInt(e.target.value)})}
                    className="w-full bg-gray-50 border-2 border-gray-200 rounded-lg px-4 py-2.5 text-[#1A1A24] font-semibold focus:outline-none focus:ring-2 focus:ring-[#0A3D91] focus:border-[#0A3D91] transition-all"
                  >
                    <option value={3}>3 Rounds</option>
                    <option value={5}>5 Rounds</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#707070] uppercase tracking-wider mb-2">
                    Round Time
                  </label>
                  <select
                    value={matchData.roundTime}
                    onChange={(e) => setMatchData({...matchData, roundTime: parseInt(e.target.value)})}
                    className="w-full bg-gray-50 border-2 border-gray-200 rounded-lg px-4 py-2.5 text-[#1A1A24] font-semibold focus:outline-none focus:ring-2 focus:ring-[#0A3D91] focus:border-[#0A3D91] transition-all"
                  >
                    <option value={2}>2 Minutes</option>
                    <option value={3}>3 Minutes</option>
                    <option value={5}>5 Minutes</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#707070] uppercase tracking-wider mb-2">
                    Knockdown Limit
                  </label>
                  <select
                    value={matchData.knockdownLimit}
                    onChange={(e) => setMatchData({...matchData, knockdownLimit: parseInt(e.target.value)})}
                    className="w-full bg-gray-50 border-2 border-gray-200 rounded-lg px-4 py-2.5 text-[#1A1A24] font-semibold focus:outline-none focus:ring-2 focus:ring-[#0A3D91] focus:border-[#0A3D91] transition-all"
                  >
                    <option value={2}>2 Knockdowns</option>
                    <option value={3}>3 Knockdowns</option>
                    <option value={4}>4 Knockdowns</option>
                    <option value={999}>No Limit</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#707070] uppercase tracking-wider mb-2">
                    Agreed Weight (kg) <span className="text-[#C8102E]">*</span>
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={matchData.agreedWeight}
                    onChange={(e) => setMatchData({...matchData, agreedWeight: e.target.value})}
                    className="w-full bg-gray-50 border-2 border-gray-200 rounded-lg px-4 py-2.5 text-[#1A1A24] font-semibold focus:outline-none focus:ring-2 focus:ring-[#0A3D91] focus:border-[#0A3D91] transition-all"
                    placeholder="66.0"
                  />
                  <p className="mt-1 text-xs text-[#707070]">
                    Official weigh-in limit
                  </p>
                </div>
              </div>
            </div>

            {/* Glove Agreement */}
            <div className="bg-gradient-to-br from-yellow-50 to-white rounded-2xl border-3 border-[#F2C94C] shadow-lg p-6">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 bg-[#F2C94C] rounded-lg flex items-center justify-center">
                  <CheckCircle className="w-5 h-5 text-[#1A1A24]" />
                </div>
                <h2 className="text-lg font-black text-[#1A1A24]">Glove Agreement</h2>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-[#707070] uppercase tracking-wider mb-2">
                    Glove Size <span className="text-[#C8102E]">*</span>
                  </label>
                  <select
                    value={matchData.gloveSize}
                    onChange={(e) => setMatchData({...matchData, gloveSize: e.target.value})}
                    className="w-full bg-white border-2 border-[#F2C94C] rounded-lg px-4 py-2.5 text-[#1A1A24] font-semibold focus:outline-none focus:ring-2 focus:ring-[#F2C94C] transition-all"
                  >
                    {GLOVE_SIZES.map((size) => (
                      <option key={size.id} value={size.size}>
                        {size.size} - {size.weightRange}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#707070] uppercase tracking-wider mb-2">
                    Glove Brand <span className="text-[#C8102E]">*</span>
                  </label>
                  <select
                    value={matchData.gloveType}
                    onChange={(e) => setMatchData({...matchData, gloveType: e.target.value})}
                    className="w-full bg-white border-2 border-[#F2C94C] rounded-lg px-4 py-2.5 text-[#1A1A24] font-semibold focus:outline-none focus:ring-2 focus:ring-[#F2C94C] transition-all"
                  >
                    {approvedGloves.map((glove) => (
                      <option key={glove.id} value={`${glove.brand} ${glove.model}`}>
                        {glove.brand} - {glove.model}
                      </option>
                    ))}
                  </select>
                  <p className="mt-1 text-xs text-[#0A3D91] font-bold flex items-center gap-1">
                    <CheckCircle className="w-3 h-3" />
                    KKF Approved
                  </p>
                </div>

                {/* Confirmations */}
                {fighterA && fighterB && (
                  <div className="space-y-3 pt-3 border-t-2 border-yellow-200">
                    <p className="text-xs font-bold text-[#707070] uppercase tracking-wider">
                      Fighter Confirmation
                    </p>
                    
                    <label className="flex items-center gap-3 p-3 bg-white rounded-lg border-2 border-red-200 cursor-pointer hover:bg-red-50 transition-colors">
                      <input
                        type="checkbox"
                        checked={matchData.fighterAConfirmed}
                        onChange={(e) => setMatchData({...matchData, fighterAConfirmed: e.target.checked})}
                        className="w-5 h-5 rounded border-2 border-[#C8102E] text-[#C8102E] focus:ring-2 focus:ring-[#C8102E]"
                      />
                      <div className="flex-1">
                        <p className="text-sm font-bold text-[#1A1A24]">{fighterA.name}</p>
                        <p className="text-xs text-[#707070]">Red Corner</p>
                      </div>
                      {matchData.fighterAConfirmed && (
                        <CheckCircle className="w-5 h-5 text-[#C8102E]" />
                      )}
                    </label>

                    <label className="flex items-center gap-3 p-3 bg-white rounded-lg border-2 border-blue-200 cursor-pointer hover:bg-blue-50 transition-colors">
                      <input
                        type="checkbox"
                        checked={matchData.fighterBConfirmed}
                        onChange={(e) => setMatchData({...matchData, fighterBConfirmed: e.target.checked})}
                        className="w-5 h-5 rounded border-2 border-[#0A3D91] text-[#0A3D91] focus:ring-2 focus:ring-[#0A3D91]"
                      />
                      <div className="flex-1">
                        <p className="text-sm font-bold text-[#1A1A24]">{fighterB.name}</p>
                        <p className="text-xs text-[#707070]">Blue Corner</p>
                      </div>
                      {matchData.fighterBConfirmed && (
                        <CheckCircle className="w-5 h-5 text-[#0A3D91]" />
                      )}
                    </label>

                    {!isGloveAgreementComplete && (
                      <div className="bg-orange-50 border border-orange-300 rounded-lg p-3 flex items-start gap-2">
                        <AlertCircle className="w-4 h-4 text-orange-600 shrink-0 mt-0.5" />
                        <p className="text-xs text-orange-900">
                          Both fighters must confirm before creating match
                        </p>
                      </div>
                    )}

                    {isGloveAgreementComplete && (
                      <div className="bg-green-50 border border-green-300 rounded-lg p-3 flex items-start gap-2">
                        <CheckCircle className="w-4 h-4 text-green-600 shrink-0 mt-0.5" />
                        <p className="text-xs text-green-900 font-bold">
                          Agreement complete!
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Info Box */}
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
              <h4 className="text-xs font-bold text-[#0A3D91] uppercase tracking-wider mb-2">
                Match Workflow
              </h4>
              <div className="space-y-2 text-xs text-[#707070]">
                <div className="flex gap-2">
                  <SaveDraft className="w-4 h-4 text-[#0A3D91] shrink-0" />
                  <div>
                    <strong className="text-[#1A1A24]">Draft:</strong> Save without proposing
                  </div>
                </div>
                <div className="flex gap-2">
                  <Send className="w-4 h-4 text-[#C8102E] shrink-0" />
                  <div>
                    {permissions.currentUser?.role === 'organizer' ? (
                      <><strong className="text-[#1A1A24]">Submit:</strong> Request KKF Manager approval</>
                    ) : (
                      <><strong className="text-[#1A1A24]">Create:</strong> Propose to clubs (requires glove confirmation)</>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}