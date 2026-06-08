import { useState } from "react";
import { useNavigate, useParams } from "react-router";
import {
  ArrowLeft, Users, CheckCircle, AlertCircle, Box, Scale,
  ChevronRight, ChevronLeft, Crown, Trophy, FileText
} from "lucide-react";
import { MOCK_EVENTS, MOCK_FIGHTERS, MOCK_MATCHES } from "../data/mock";
import { GLOVE_SIZES, getApprovedGloveTypes } from "../data/masterData";
import { WEIGHT_CLASSES, getWeightClassName, MOCK_CHAMPIONS } from "../data/champion";
import { usePermissions } from "../hooks/usePermissions";
import { toast } from "sonner";
import { clsx } from "clsx";

export function AddMatchToEvent() {
  const navigate = useNavigate();
  const { eventId, subEventId } = useParams();
  const permissions = usePermissions();

  const event = MOCK_EVENTS.find(e => e.id === eventId);
  const subEvent = subEventId
    ? MOCK_EVENTS.find(e => e.subEvents?.some(se => se.id === subEventId))
        ?.subEvents?.find(se => se.id === subEventId)
    : null;

  // Multi-step state
  const [currentStep, setCurrentStep] = useState(1); // 1: Match Details, 2: Fighter Selection, 3: Review & Confirm

  const [matchData, setMatchData] = useState({
    // Step 1
    weightClass: 70,
    rounds: 5,
    roundTime: 3,
    restTime: 1,
    knockdownLimit: 3,
    gloveSize: "8oz",
    gloveType: "Twins Special BGVL-3",
    isChampionshipMatch: false,
    championTitleId: "",
    // Step 2
    fighterAId: "",
    fighterBId: "",
    notes: "",
    // Step 3
    fighterAConfirmed: false,
    fighterBConfirmed: false,
  });

  // ── Derived data ─────────────────────────────────────────────────
  const approvedGloves = getApprovedGloveTypes();

  const getFilteredFighters = () => {
    const selectedWeight = matchData.weightClass;
    return MOCK_FIGHTERS.filter(f => {
      const diff = Math.abs(f.weight - selectedWeight);
      return diff <= 3 && f.status === "Active";
    });
  };
  const availableFighters = getFilteredFighters();

  const isFighterAvailable = (fighterId: string): { available: boolean; reason?: string } => {
    if (!fighterId) return { available: true };
    const fighter = MOCK_FIGHTERS.find(f => f.id === fighterId);
    if (!fighter) return { available: false, reason: "Fighter not found" };
    if (fighter.status === "Injured")   return { available: false, reason: "Currently injured" };
    if (fighter.status === "Suspended") return { available: false, reason: "Suspended" };
    if (fighter.status === "Inactive")  return { available: false, reason: "Inactive" };
    if (fighter.status !== "Active")    return { available: false, reason: `Status: ${fighter.status}` };
    return { available: true };
  };

  const championsForWeight = MOCK_CHAMPIONS.filter(
    c => c.weightClass === matchData.weightClass && c.status === "Active"
  );

  const getFighterById = (id: string) => MOCK_FIGHTERS.find(f => f.id === id);
  const fighterA = getFighterById(matchData.fighterAId);
  const fighterB = getFighterById(matchData.fighterBId);

  const weightDiff =
    fighterA && fighterB
      ? Math.abs(fighterA.weight - fighterB.weight).toFixed(1)
      : null;
  const hasWeightMismatch = weightDiff && parseFloat(weightDiff) > 2.0;

  const isGloveAgreementComplete = matchData.fighterAConfirmed && matchData.fighterBConfirmed;

  // ── Step guards ───────────────────────────────────────────────────
  const canProceedToStep2 = !!matchData.weightClass && !!matchData.rounds && !!matchData.roundTime;
  const canProceedToStep3 =
    canProceedToStep2 &&
    !!matchData.fighterAId &&
    !!matchData.fighterBId &&
    matchData.fighterAId !== matchData.fighterBId;
  const canSubmit = canProceedToStep3 && isGloveAgreementComplete;

  // ── Navigation ────────────────────────────────────────────────────
  const goBack = () => {
    if (subEventId) navigate(`/home/events/${eventId}/sub-events/${subEventId}`);
    else navigate(`/home/events/${eventId}`);
  };

  const handleNextStep = () => {
    if (currentStep === 1 && !canProceedToStep2) {
      toast.error("Please complete all match details");
      return;
    }
    if (currentStep === 2 && !canProceedToStep3) {
      toast.error("Please select both fighters");
      return;
    }
    setCurrentStep(prev => Math.min(prev + 1, 3));
  };

  const handlePrevStep = () => setCurrentStep(prev => Math.max(prev - 1, 1));

  // ── Submit ────────────────────────────────────────────────────────
  const handleCreateMatch = () => {
    if (!canSubmit) {
      toast.error("Please complete all required fields and confirm glove agreement");
      return;
    }
    if (!fighterA || !fighterB) return;

    const newMatch = {
      id: `m${Date.now()}`,
      eventId,
      subEventId: subEventId || null,
      fighterA,
      fighterB,
      agreedWeight: matchData.weightClass,
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
      status: "Draft",
      date: event?.date || "",
      proposalStatus: "draft",
      clubAResponse: "pending",
      clubBResponse: "pending",
      proposedBy: permissions.currentUser?.fullName || "Organizer",
      proposedDate: new Date().toISOString().split("T")[0],
      notes: matchData.notes,
      isChampionshipBout: matchData.isChampionshipMatch,
    };

    MOCK_MATCHES.unshift(newMatch as any);
    toast.success(`✅ Match created: ${fighterA.name} vs ${fighterB.name}`);
    goBack();
  };

  // ── Steps config ──────────────────────────────────────────────────
  const steps = [
    { number: 1, title: "Match Details",     icon: Box },
    { number: 2, title: "Fighter Selection", icon: Users },
    { number: 3, title: "Review & Confirm",  icon: CheckCircle },
  ];

  if (!event) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-8">
        <div className="text-center">
          <h1 className="text-2xl font-extrabold text-slate-900 mb-4 tracking-tight">Event Not Found</h1>
          <button
            onClick={() => navigate("/home/events")}
            className="btn-primary px-5 py-2.5 font-semibold uppercase tracking-wider text-xs rounded-xl"
          >
            Back to Events
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F4F5F8] py-6 px-4 md:px-8">
      <div className="max-w-5xl mx-auto space-y-6">

        {/* Back Button */}
        <button
          onClick={goBack}
          className="inline-flex items-center gap-2 text-slate-500 hover:text-slate-900 font-medium transition-colors text-sm"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Event
        </button>

        {/* Blue Header Card with Stepper */}
        <div className="bg-gradient-to-r from-[#0A3D91] to-[#1B4A9E] rounded-2xl p-8 text-white shadow-xl">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
              <Box className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-black uppercase tracking-tight">CREATE MATCH</h1>
              <p className="text-white/80 font-medium text-sm mt-1">
                {event.name}
                {subEvent && ` › ${subEvent.name}`}
                {event.date && ` • ${event.date}`}
              </p>
            </div>
          </div>

          {/* Step Progress */}
          <div className="flex items-center justify-between">
            {steps.map((step, index) => {
              const Icon = step.icon;
              const isActive    = currentStep === step.number;
              const isCompleted = currentStep > step.number;
              return (
                <div key={step.number} className="flex items-center flex-1">
                  <div className="flex items-center gap-3 flex-1">
                    <div className={clsx(
                      "w-12 h-12 rounded-xl flex items-center justify-center font-black transition-all",
                      isActive    && "bg-white text-[#0A3D91] shadow-lg scale-110",
                      isCompleted && "bg-emerald-500 text-white",
                      !isActive && !isCompleted && "bg-white/20 text-white/60"
                    )}>
                      {isCompleted ? <CheckCircle className="w-6 h-6" /> : <Icon className="w-6 h-6" />}
                    </div>
                    <div className="flex-1">
                      <div className={clsx("text-xs font-bold uppercase tracking-wide", isActive ? "text-white" : "text-white/60")}>
                        Step {step.number}
                      </div>
                      <div className={clsx("text-sm font-black", isActive ? "text-white" : "text-white/60")}>
                        {step.title}
                      </div>
                    </div>
                  </div>
                  {index < steps.length - 1 && (
                    <ChevronRight className={clsx("w-5 h-5 mx-2", isCompleted ? "text-emerald-400" : "text-white/40")} />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* ── STEP 1: Match Details ───────────────────────────────── */}
        {currentStep === 1 && (
          <div className="bg-white rounded-2xl shadow-lg border border-[#E0E0E0] p-8">
            <div className="mb-6">
              <h2 className="text-2xl font-black text-[#1A1A24] uppercase tracking-tight flex items-center gap-3">
                <div className="w-10 h-10 bg-[#0A3D91] rounded-xl flex items-center justify-center text-white font-black">1</div>
                MATCH DETAILS
              </h2>
              <p className="text-sm text-[#707070] font-medium mt-2 ml-13">
                Configure weight class, match rules, and equipment
              </p>
            </div>

            {/* Weight Class Grid */}
            <div className="mb-8">
              <label className="block text-sm font-black text-[#1A1A24] uppercase mb-4 tracking-tight">
                Weight Class *
              </label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {WEIGHT_CLASSES.map(weight => (
                  <button
                    key={weight}
                    type="button"
                    onClick={() => setMatchData({ ...matchData, weightClass: weight })}
                    className={clsx(
                      "px-4 py-4 rounded-xl font-bold transition-all border-2",
                      matchData.weightClass === weight
                        ? "bg-[#0A3D91] border-[#0A3D91] text-white shadow-lg scale-105"
                        : "bg-white border-[#E0E0E0] text-[#707070] hover:border-[#0A3D91]"
                    )}
                  >
                    <div className="text-lg font-black">{weight}kg</div>
                    <div className="text-xs opacity-75 mt-1">{getWeightClassName(weight).split("(")[0].trim()}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Championship Toggle */}
            {championsForWeight.length > 0 && (
              <div className="mb-8 p-6 bg-gradient-to-r from-amber-50 to-yellow-50 border-2 border-[#F2C94C] rounded-xl">
                <div className="flex items-start gap-4 mb-4">
                  <div className="w-12 h-12 bg-[#F2C94C] rounded-xl flex items-center justify-center flex-shrink-0">
                    <Crown className="w-6 h-6 text-[#1A1A24]" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-black text-[#1A1A24] uppercase mb-1">Championship Match</h3>
                    <p className="text-sm text-[#707070] font-medium">
                      Make this a title bout for {getWeightClassName(matchData.weightClass)}
                    </p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={matchData.isChampionshipMatch}
                      onChange={e => setMatchData({ ...matchData, isChampionshipMatch: e.target.checked })}
                      className="sr-only peer"
                    />
                    <div className="w-14 h-7 bg-gray-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[4px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-[#F2C94C]" />
                  </label>
                </div>
                {matchData.isChampionshipMatch && (
                  <div>
                    <label className="block text-xs font-black text-[#707070] uppercase mb-2">Select Championship Title</label>
                    <select
                      value={matchData.championTitleId}
                      onChange={e => setMatchData({ ...matchData, championTitleId: e.target.value })}
                      className="w-full bg-white border-2 border-[#E0E0E0] focus:border-[#F2C94C] rounded-xl px-4 py-3 text-[#1A1A24] font-bold focus:outline-none"
                    >
                      <option value="">New Championship Title</option>
                      {championsForWeight.map(champ => (
                        <option key={champ.id} value={champ.id}>
                          {champ.titleName} — Currently: {champ.currentHolderName || "Vacant"}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </div>
            )}

            {/* Match Rules */}
            <div className="bg-[#F9FAFB] rounded-xl p-6 mb-6 border border-[#E0E0E0]">
              <h3 className="text-base font-black text-[#1A1A24] uppercase mb-4 tracking-tight">MATCH CONFIGURATION</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-[#707070] uppercase mb-2 tracking-wide">ROUNDS *</label>
                  <select
                    value={matchData.rounds}
                    onChange={e => setMatchData({ ...matchData, rounds: parseInt(e.target.value) })}
                    className="w-full bg-white border border-[#E0E0E0] rounded-lg px-4 py-2.5 font-medium text-sm focus:outline-none focus:ring-2 focus:ring-[#0A3D91]"
                  >
                    <option value={3}>3 Rounds</option>
                    <option value={5}>5 Rounds (Standard)</option>
                    <option value={7}>7 Rounds</option>
                    <option value={10}>10 Rounds</option>
                    <option value={12}>12 Rounds (Championship)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#707070] uppercase mb-2 tracking-wide">ROUND TIME (MIN) *</label>
                  <select
                    value={matchData.roundTime}
                    onChange={e => setMatchData({ ...matchData, roundTime: parseInt(e.target.value) })}
                    className="w-full bg-white border border-[#E0E0E0] rounded-lg px-4 py-2.5 font-medium text-sm focus:outline-none focus:ring-2 focus:ring-[#0A3D91]"
                  >
                    <option value={2}>2 Minutes</option>
                    <option value={3}>3 Minutes</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#707070] uppercase mb-2 tracking-wide">REST TIME (MIN)</label>
                  <select
                    value={matchData.restTime}
                    onChange={e => setMatchData({ ...matchData, restTime: parseInt(e.target.value) })}
                    className="w-full bg-white border border-[#E0E0E0] rounded-lg px-4 py-2.5 font-medium text-sm focus:outline-none focus:ring-2 focus:ring-[#0A3D91]"
                  >
                    <option value={1}>1 Minute</option>
                    <option value={2}>2 Minutes</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Glove Equipment */}
            <div className="bg-white rounded-xl p-6 border-2 border-[#F2C94C]">
              <h3 className="text-base font-black text-[#1A1A24] uppercase mb-4 tracking-tight flex items-center gap-2">
                <Scale className="w-5 h-5 text-[#F2C94C]" />
                GLOVE SPECIFICATION
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-[#707070] uppercase mb-2 tracking-wide">GLOVE SIZE *</label>
                  <select
                    value={matchData.gloveSize}
                    onChange={e => setMatchData({ ...matchData, gloveSize: e.target.value })}
                    className="w-full bg-white border border-[#E0E0E0] rounded-lg px-4 py-2.5 font-medium text-sm focus:outline-none focus:ring-2 focus:ring-[#F2C94C]"
                  >
                    {GLOVE_SIZES.map(size => (
                      <option key={size.id} value={size.size}>{size.size} — {size.weightRange}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#707070] uppercase mb-2 tracking-wide">GLOVE BRAND *</label>
                  <select
                    value={matchData.gloveType}
                    onChange={e => setMatchData({ ...matchData, gloveType: e.target.value })}
                    className="w-full bg-white border border-[#E0E0E0] rounded-lg px-4 py-2.5 font-medium text-sm focus:outline-none focus:ring-2 focus:ring-[#F2C94C]"
                  >
                    {approvedGloves.map(glove => (
                      <option key={glove.id} value={`${glove.brand} ${glove.model}`}>{glove.brand} — {glove.model}</option>
                    ))}
                  </select>
                  <p className="mt-1.5 text-[11px] text-emerald-700 font-bold flex items-center gap-1">
                    <CheckCircle className="w-3 h-3" /> KKF Approved Equipment
                  </p>
                </div>
              </div>
            </div>

            {/* Navigation */}
            <div className="mt-8 pt-6 border-t border-[#E0E0E0] flex justify-end gap-4">
              <button
                onClick={goBack}
                className="px-6 py-3 bg-[#E0E0E0] hover:bg-[#D0D0D0] text-[#1A1A24] rounded-lg font-bold transition-all text-sm"
              >
                Cancel
              </button>
              <button
                onClick={handleNextStep}
                disabled={!canProceedToStep2}
                className="px-8 py-3 bg-[#0A3D91] hover:bg-[#051C42] text-white rounded-lg font-bold flex items-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed text-sm"
              >
                Next: Select Fighters
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}

        {/* ── STEP 2: Fighter Selection ───────────────────────────── */}
        {currentStep === 2 && (
          <div className="bg-white rounded-2xl shadow-lg border border-[#E0E0E0] p-8">
            <div className="mb-6">
              <h2 className="text-2xl font-black text-[#1A1A24] uppercase tracking-tight flex items-center gap-3">
                <div className="w-10 h-10 bg-[#0A3D91] rounded-xl flex items-center justify-center text-white font-black">2</div>
                FIGHTER SELECTION
              </h2>
              <p className="text-sm text-[#707070] font-medium mt-2">
                Select fighters for {getWeightClassName(matchData.weightClass)}
              </p>
            </div>

            {/* Weight Class Info Banner */}
            <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-xl flex items-center gap-3">
              <Scale className="w-5 h-5 text-blue-600 shrink-0" />
              <div>
                <div className="text-sm font-black text-blue-900">{getWeightClassName(matchData.weightClass)}</div>
                <div className="text-xs text-blue-700 font-medium">
                  Showing fighters within ±3kg of {matchData.weightClass}kg • {availableFighters.length} available
                </div>
              </div>
            </div>

            {/* Fighter Selection - Side by Side */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              {/* Red Corner */}
              <div>
                <label className="block text-sm font-black text-[#C8102E] uppercase tracking-wider mb-3 flex items-center gap-2">
                  <div className="w-8 h-8 bg-[#C8102E] rounded-lg flex items-center justify-center text-white text-xs font-black">RED</div>
                  RED CORNER FIGHTER *
                </label>
                <select
                  value={matchData.fighterAId}
                  onChange={e => {
                    const newId = e.target.value;
                    const updated = { ...matchData, fighterAId: newId };
                    if (newId && newId === matchData.fighterBId) updated.fighterBId = "";
                    setMatchData(updated);
                  }}
                  className="w-full bg-white border-2 border-[#E0E0E0] rounded-xl px-4 py-3 text-[#1A1A24] font-medium text-sm focus:outline-none focus:ring-2 focus:ring-[#C8102E] focus:border-[#C8102E] transition-all"
                >
                  <option value="">Select Red Corner Fighter…</option>
                  {availableFighters.map(fighter => {
                    const { available, reason } = isFighterAvailable(fighter.id);
                    const isBlue = fighter.id === matchData.fighterBId;
                    const disabled = !available || isBlue;
                    return (
                      <option key={fighter.id} value={fighter.id} disabled={disabled} className={disabled ? "text-gray-400" : ""}>
                        {fighter.name} ({fighter.weight}kg) — {fighter.gym}
                        {isBlue && " · 🔵 In Blue Corner"}
                        {!available && ` · ⚠️ ${reason}`}
                      </option>
                    );
                  })}
                </select>
                {fighterA && isFighterAvailable(matchData.fighterAId).available && (
                  <div className="mt-3 p-5 bg-red-50 border-2 border-red-300 rounded-xl">
                    <div className="text-xs font-bold text-red-900 uppercase mb-3 tracking-wide">FIGHTER DETAILS</div>
                    <div className="flex items-center gap-4">
                      <img src={fighterA.image} alt={fighterA.name} className="w-16 h-16 rounded-lg object-cover border-2 border-red-400" />
                      <div className="flex-1">
                        <div className="font-black text-red-900 text-base mb-1">{fighterA.name}</div>
                        <div className="text-sm text-red-700 font-bold">Record: {fighterA.record} · {fighterA.weight}kg</div>
                        <div className="text-xs text-red-600 font-medium mt-1">{fighterA.gym} · Grade {fighterA.grade}</div>
                      </div>
                    </div>
                  </div>
                )}
                {matchData.fighterAId && !isFighterAvailable(matchData.fighterAId).available && (
                  <div className="mt-3 p-3 bg-red-50 border-2 border-red-300 rounded-xl flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
                    <div className="text-xs font-bold text-red-900">{isFighterAvailable(matchData.fighterAId).reason}</div>
                  </div>
                )}
              </div>

              {/* Blue Corner */}
              <div>
                <label className="block text-sm font-black text-[#0A3D91] uppercase tracking-wider mb-3 flex items-center gap-2">
                  <div className="w-8 h-8 bg-[#0A3D91] rounded-lg flex items-center justify-center text-white text-xs font-black">BLUE</div>
                  BLUE CORNER FIGHTER *
                </label>
                <select
                  value={matchData.fighterBId}
                  onChange={e => {
                    const newId = e.target.value;
                    const updated = { ...matchData, fighterBId: newId };
                    if (newId && newId === matchData.fighterAId) updated.fighterAId = "";
                    setMatchData(updated);
                  }}
                  className="w-full bg-white border-2 border-[#E0E0E0] rounded-xl px-4 py-3 text-[#1A1A24] font-medium text-sm focus:outline-none focus:ring-2 focus:ring-[#0A3D91] focus:border-[#0A3D91] transition-all"
                >
                  <option value="">Select Blue Corner Fighter…</option>
                  {availableFighters.map(fighter => {
                    const { available, reason } = isFighterAvailable(fighter.id);
                    const isRed = fighter.id === matchData.fighterAId;
                    const disabled = !available || isRed;
                    return (
                      <option key={fighter.id} value={fighter.id} disabled={disabled} className={disabled ? "text-gray-400" : ""}>
                        {fighter.name} ({fighter.weight}kg) — {fighter.gym}
                        {isRed && " · 🔴 In Red Corner"}
                        {!available && ` · ⚠️ ${reason}`}
                      </option>
                    );
                  })}
                </select>
                {fighterB && isFighterAvailable(matchData.fighterBId).available && (
                  <div className="mt-3 p-5 bg-blue-50 border-2 border-blue-300 rounded-xl">
                    <div className="text-xs font-bold text-blue-900 uppercase mb-3 tracking-wide">FIGHTER DETAILS</div>
                    <div className="flex items-center gap-4">
                      <img src={fighterB.image} alt={fighterB.name} className="w-16 h-16 rounded-lg object-cover border-2 border-blue-400" />
                      <div className="flex-1">
                        <div className="font-black text-blue-900 text-base mb-1">{fighterB.name}</div>
                        <div className="text-sm text-blue-700 font-bold">Record: {fighterB.record} · {fighterB.weight}kg</div>
                        <div className="text-xs text-blue-600 font-medium mt-1">{fighterB.gym} · Grade {fighterB.grade}</div>
                      </div>
                    </div>
                  </div>
                )}
                {matchData.fighterBId && !isFighterAvailable(matchData.fighterBId).available && (
                  <div className="mt-3 p-3 bg-red-50 border-2 border-red-300 rounded-xl flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
                    <div className="text-xs font-bold text-red-900">{isFighterAvailable(matchData.fighterBId).reason}</div>
                  </div>
                )}
              </div>
            </div>

            {/* Weight Mismatch Warning */}
            {fighterA && fighterB && hasWeightMismatch && (
              <div className="mb-6 p-4 bg-amber-50 border-2 border-amber-300 rounded-xl">
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-sm font-black text-amber-900 mb-1">Weight Difference Notice</h4>
                    <p className="text-xs text-amber-700 font-medium">
                      Weight difference of {weightDiff}kg exceeds the recommended 2kg limit. Both fighters must confirm in the next step.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* VS Preview */}
            {fighterA && fighterB && (
              <div className="mb-6 bg-gradient-to-b from-[#1A1A24] to-[#0A3D91] rounded-2xl p-6 text-white">
                <div className="text-center mb-4">
                  <span className="bg-[#F2C94C] text-[#1A1A24] text-[10px] font-black px-3 py-1 rounded uppercase tracking-[0.2em] shadow">
                    Fight Preview
                  </span>
                </div>
                <div className="grid grid-cols-3 items-center gap-4">
                  <div className="text-center">
                    <img src={fighterA.image} alt={fighterA.name} className="w-20 h-20 rounded-full object-cover border-4 border-[#C8102E] mx-auto mb-2 shadow-xl" />
                    <div className="font-black text-sm truncate">{fighterA.name}</div>
                    <div className="text-[10px] text-gray-300 font-bold mt-0.5">{fighterA.gym}</div>
                    <div className="mt-2 inline-flex items-center gap-1">
                      <span className="bg-white/10 text-white text-xs font-mono px-2 py-0.5 rounded">{fighterA.record}</span>
                      <span className="bg-[#C8102E] text-white text-[10px] font-black px-1.5 py-0.5 rounded">G{fighterA.grade}</span>
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="w-14 h-14 bg-gradient-to-br from-[#C8102E] to-[#0A3D91] rounded-2xl rotate-45 flex items-center justify-center mx-auto shadow-xl">
                      <span className="font-black italic text-xl text-white -rotate-45 block leading-none">VS</span>
                    </div>
                    <div className="mt-3 text-xs font-black text-[#F2C94C] uppercase">{matchData.rounds}R · {matchData.roundTime}min</div>
                    <div className="text-[10px] text-gray-300 uppercase">{matchData.weightClass}kg Limit</div>
                  </div>
                  <div className="text-center">
                    <img src={fighterB.image} alt={fighterB.name} className="w-20 h-20 rounded-full object-cover border-4 border-[#0A3D91] mx-auto mb-2 shadow-xl" />
                    <div className="font-black text-sm truncate">{fighterB.name}</div>
                    <div className="text-[10px] text-gray-300 font-bold mt-0.5">{fighterB.gym}</div>
                    <div className="mt-2 inline-flex items-center gap-1">
                      <span className="bg-white/10 text-white text-xs font-mono px-2 py-0.5 rounded">{fighterB.record}</span>
                      <span className="bg-[#0A3D91] text-white text-[10px] font-black px-1.5 py-0.5 rounded">G{fighterB.grade}</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Match Notes */}
            <div className="mb-6">
              <label className="block text-xs font-bold text-[#707070] uppercase mb-2 tracking-wide flex items-center gap-1">
                <FileText className="w-3 h-3" /> Match Notes (Optional)
              </label>
              <textarea
                value={matchData.notes}
                onChange={e => setMatchData({ ...matchData, notes: e.target.value })}
                rows={3}
                placeholder="Special conditions, requirements, or additional information…"
                className="w-full bg-[#F9FAFB] border border-[#E0E0E0] rounded-xl px-4 py-3 text-[#1A1A24] font-medium text-sm focus:outline-none focus:ring-2 focus:ring-[#0A3D91] focus:border-[#0A3D91] resize-none"
              />
            </div>

            {/* Navigation */}
            <div className="mt-8 pt-6 border-t border-[#E0E0E0] flex justify-between gap-4">
              <button
                onClick={handlePrevStep}
                className="px-6 py-3 bg-[#E0E0E0] hover:bg-[#D0D0D0] text-[#1A1A24] rounded-lg font-bold flex items-center gap-2 transition-all text-sm"
              >
                <ChevronLeft className="w-5 h-5" />
                Back
              </button>
              <button
                onClick={handleNextStep}
                disabled={!canProceedToStep3}
                className="px-8 py-3 bg-[#0A3D91] hover:bg-[#051C42] text-white rounded-lg font-bold flex items-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed text-sm"
              >
                Next: Review
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}

        {/* ── STEP 3: Review & Confirm ────────────────────────────── */}
        {currentStep === 3 && fighterA && fighterB && (
          <div className="bg-white rounded-2xl shadow-lg border border-[#E0E0E0] p-8">
            <div className="mb-6">
              <h2 className="text-2xl font-black text-[#1A1A24] uppercase tracking-tight flex items-center gap-3">
                <div className="w-10 h-10 bg-[#0A3D91] rounded-xl flex items-center justify-center text-white font-black">3</div>
                REVIEW & CONFIRM
              </h2>
              <p className="text-sm text-[#707070] font-medium mt-2">Review match details and confirm glove agreement</p>
            </div>

            {/* Match Summary */}
            <div className="mb-6 p-6 bg-gradient-to-r from-blue-50 to-purple-50 border-2 border-[#0A3D91] rounded-xl">
              <h3 className="text-sm font-black text-[#1A1A24] uppercase mb-4 tracking-wider">Match Summary</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <div className="text-[10px] font-bold text-[#707070] uppercase mb-1 tracking-widest">Weight Class</div>
                  <div className="text-sm font-black text-[#1A1A24]">{getWeightClassName(matchData.weightClass)}</div>
                </div>
                <div>
                  <div className="text-[10px] font-bold text-[#707070] uppercase mb-1 tracking-widest">Rounds</div>
                  <div className="text-sm font-black text-[#1A1A24]">{matchData.rounds} × {matchData.roundTime}min</div>
                </div>
                <div>
                  <div className="text-[10px] font-bold text-[#707070] uppercase mb-1 tracking-widest">Gloves</div>
                  <div className="text-sm font-black text-[#1A1A24]">{matchData.gloveSize}</div>
                </div>
                <div>
                  <div className="text-[10px] font-bold text-[#707070] uppercase mb-1 tracking-widest">Match Type</div>
                  <div className="text-sm font-black text-[#1A1A24] flex items-center gap-1">
                    {matchData.isChampionshipMatch ? (
                      <><Trophy className="w-3.5 h-3.5 text-amber-500" /> Championship</>
                    ) : "Standard"}
                  </div>
                </div>
              </div>

              {/* Fighter Comparison */}
              <div className="mt-4 pt-4 border-t border-blue-200 grid grid-cols-5 items-center gap-4">
                <div className="col-span-2 flex items-center gap-3">
                  <img src={fighterA.image} alt={fighterA.name} className="w-12 h-12 rounded-full object-cover border-2 border-[#C8102E]" />
                  <div>
                    <div className="font-black text-sm text-[#1A1A24]">{fighterA.name}</div>
                    <div className="text-xs text-[#707070]">{fighterA.weight}kg · {fighterA.gym}</div>
                  </div>
                </div>
                <div className="text-center">
                  <span className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-[#1A1A24] text-white font-extrabold text-xs shadow">VS</span>
                  {hasWeightMismatch && (
                    <div className="text-[10px] text-amber-600 font-bold mt-1">⚠ {weightDiff}kg diff</div>
                  )}
                </div>
                <div className="col-span-2 flex items-center gap-3 justify-end">
                  <div className="text-right">
                    <div className="font-black text-sm text-[#1A1A24]">{fighterB.name}</div>
                    <div className="text-xs text-[#707070]">{fighterB.weight}kg · {fighterB.gym}</div>
                  </div>
                  <img src={fighterB.image} alt={fighterB.name} className="w-12 h-12 rounded-full object-cover border-2 border-[#0A3D91]" />
                </div>
              </div>
            </div>

            {/* Glove Agreement Confirmation */}
            <div className="bg-white rounded-xl p-6 border-2 border-[#F2C94C] mb-6">
              <h3 className="text-base font-black text-[#1A1A24] uppercase mb-4 tracking-tight">GLOVE AGREEMENT CONFIRMATION</h3>
              <p className="text-xs text-[#707070] mb-4 font-medium">
                Both fighters must confirm their acceptance of <strong>{matchData.gloveSize} {matchData.gloveType}</strong> gloves before this match can be created.
              </p>
              <div className="space-y-3">
                <label className="flex items-center gap-3 p-4 bg-[#F9FAFB] rounded-lg border-2 border-[#E0E0E0] cursor-pointer hover:border-[#C8102E] transition-all">
                  <input
                    type="checkbox"
                    checked={matchData.fighterAConfirmed}
                    onChange={e => setMatchData({ ...matchData, fighterAConfirmed: e.target.checked })}
                    className="w-5 h-5 text-[#C8102E] rounded"
                  />
                  <span className="font-bold text-sm text-[#1A1A24] flex-1">
                    {fighterA.name} <span className="text-[#C8102E]">(Red Corner)</span> confirms {matchData.gloveSize} {matchData.gloveType}
                  </span>
                  {matchData.fighterAConfirmed && <CheckCircle className="w-5 h-5 text-emerald-500 shrink-0" />}
                </label>
                <label className="flex items-center gap-3 p-4 bg-[#F9FAFB] rounded-lg border-2 border-[#E0E0E0] cursor-pointer hover:border-[#0A3D91] transition-all">
                  <input
                    type="checkbox"
                    checked={matchData.fighterBConfirmed}
                    onChange={e => setMatchData({ ...matchData, fighterBConfirmed: e.target.checked })}
                    className="w-5 h-5 text-[#0A3D91] rounded"
                  />
                  <span className="font-bold text-sm text-[#1A1A24] flex-1">
                    {fighterB.name} <span className="text-[#0A3D91]">(Blue Corner)</span> confirms {matchData.gloveSize} {matchData.gloveType}
                  </span>
                  {matchData.fighterBConfirmed && <CheckCircle className="w-5 h-5 text-emerald-500 shrink-0" />}
                </label>
              </div>

              {!isGloveAgreementComplete && (
                <div className="mt-4 bg-orange-50 border border-orange-300 rounded-lg p-3 flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-orange-600 shrink-0 mt-0.5" />
                  <p className="text-xs text-orange-900 font-medium">Both fighters must confirm glove agreement to create this match.</p>
                </div>
              )}
              {isGloveAgreementComplete && (
                <div className="mt-4 bg-emerald-50 border border-emerald-300 rounded-lg p-3 flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <p className="text-xs text-emerald-900 font-bold">Glove agreement complete — ready to create match!</p>
                </div>
              )}
            </div>

            {/* Notes Preview */}
            {matchData.notes && (
              <div className="mb-6 p-4 bg-[#F9FAFB] border border-[#E0E0E0] rounded-xl">
                <div className="text-xs font-bold text-[#707070] uppercase mb-2">Notes</div>
                <p className="text-sm text-[#1A1A24] font-medium">{matchData.notes}</p>
              </div>
            )}

            {/* Navigation */}
            <div className="mt-8 pt-6 border-t border-[#E0E0E0] flex justify-between gap-4">
              <button
                onClick={handlePrevStep}
                className="px-6 py-3 bg-[#E0E0E0] hover:bg-[#D0D0D0] text-[#1A1A24] rounded-lg font-bold flex items-center gap-2 transition-all text-sm"
              >
                <ChevronLeft className="w-5 h-5" />
                Back
              </button>
              <button
                onClick={handleCreateMatch}
                disabled={!canSubmit}
                className="flex-1 max-w-sm bg-gradient-to-r from-[#10B981] to-[#059669] hover:opacity-90 text-white px-8 py-4 rounded-xl font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
              >
                <CheckCircle className="w-5 h-5" />
                Create Match
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}