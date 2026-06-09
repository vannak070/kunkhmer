import { useState, useMemo, useEffect } from "react";
import { useNavigate, useParams } from "react-router";
import {
  ArrowLeft, Users, CheckCircle, AlertCircle, Box, Scale,
  Trophy, Crown, ChevronRight, ChevronLeft, Search, X,
  Weight, Swords, FileText, Star
} from "lucide-react";
import { api } from "../utils/api";
import { GLOVE_SIZES, getApprovedGloveTypes } from "../data/masterData";
import { WEIGHT_CLASSES, getWeightClassName } from "../data/champion";
import { toast } from "sonner";
import { clsx } from "clsx";

const WEIGHT_TOLERANCE = 2; // kg

export function CreateMatchFromBatch() {
  const navigate = useNavigate();
  const { batchId } = useParams();

  const [batch, setBatch] = useState<any>(null);
  const [fighters, setFighters] = useState<any[]>([]);
  const [champions, setChampions] = useState<any[]>([]);
  const [matches, setMatches] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Multi-step state
  const [currentStep, setCurrentStep] = useState(1);

  const [matchData, setMatchData] = useState({
    rounds: 5,
    roundTime: 3,
    restTime: 1,
    knockdownLimit: 3,
    weightClass: 70,
    gloveSize: "8oz",
    gloveType: "Twins Special BGVL-3",
    isChampionshipMatch: false,
    championTitleId: "",
    fighterAId: "",
    fighterBId: "",
    fighterAConfirmed: false,
    fighterBConfirmed: false,
    notes: "",
  });

  // Fighter search state
  const [redSearch, setRedSearch] = useState("");
  const [blueSearch, setBlueSearch] = useState("");

  useEffect(() => {
    const loadData = async () => {
      if (!batchId) return;
      try {
        const batchData = await api.batches.get(batchId);
        const fightersData = await api.fighters.list();
        const championsData = await api.champions.list();
        const matchesData = await api.matches.list(batchId);

        setBatch(batchData);
        
        // Map fighters from DB schema columns
        const mappedFighters = (fightersData || []).map((f: any) => ({
          ...f,
          weight: parseFloat(f.current_weight) || 0,
          gym: f.club_name || "Independent",
        }));
        setFighters(mappedFighters);

        // Map champions from DB schema columns
        const mappedChampions = (championsData || []).map((c: any) => ({
          ...c,
          titleName: c.title_name,
          weightClass: parseFloat(c.weight_class) || 0,
          currentHolderName: c.current_holder_name_db || c.current_holder_name || "Vacant",
          status: c.status,
        }));
        setChampions(mappedChampions);
        
        setMatches(matchesData || []);
      } catch (err: any) {
        console.error(err);
        toast.error("Failed to load match creation data from database");
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [batchId]);

  // ── Derived data ──────────────────────────────────────────────────────────
  const approvedGloves = getApprovedGloveTypes();

  // Filter fighters within ±WEIGHT_TOLERANCE of the selected weight class
  const eligibleFighters = useMemo(() => {
    return fighters.filter(f => {
      const diff = Math.abs(f.weight - matchData.weightClass);
      return diff <= WEIGHT_TOLERANCE && f.status === "Active";
    });
  }, [fighters, matchData.weightClass]);

  const isFighterAvailable = (fighterId: string): { available: boolean; reason?: string } => {
    if (!fighterId) return { available: true };
    const fighter = fighters.find(f => f.id === fighterId);
    if (!fighter) return { available: false, reason: "Not found" };
    if (fighter.status === "Injured")   return { available: false, reason: "Injured" };
    if (fighter.status === "Suspended") return { available: false, reason: "Suspended" };
    if (fighter.status === "Inactive")  return { available: false, reason: "Inactive" };
    if (fighter.status !== "Active")    return { available: false, reason: fighter.status };
    if (matches.some(m => m.fighter_a_id === fighterId || m.fighter_b_id === fighterId)) {
      return { available: false, reason: "Already in batch" };
    }
    return { available: true };
  };

  const championsForWeight = champions.filter(
    c => c.weightClass === matchData.weightClass && c.status === "Active"
  );

  const getFighterById = (id: string) => fighters.find(f => f.id === id);
  const fighterA = getFighterById(matchData.fighterAId);
  const fighterB = getFighterById(matchData.fighterBId);

  const weightDiff = fighterA && fighterB
    ? Math.abs(fighterA.weight - fighterB.weight)
    : null;
  const hasWeightWarning = weightDiff !== null && weightDiff > 1.5;
  const isGloveAgreementComplete = matchData.fighterAConfirmed && matchData.fighterBConfirmed;

  // Step guards
  const canProceedToStep2 = !!matchData.weightClass && !!matchData.rounds && !!matchData.roundTime;
  const canProceedToStep3 =
    canProceedToStep2 &&
    !!matchData.fighterAId &&
    !!matchData.fighterBId &&
    matchData.fighterAId !== matchData.fighterBId;
  const canSubmit = canProceedToStep3 && isGloveAgreementComplete;

  const handleNextStep = () => {
    if (currentStep === 1 && !canProceedToStep2) { toast.error("Complete all match details"); return; }
    if (currentStep === 2 && !canProceedToStep3) { toast.error("Select both fighters"); return; }
    setCurrentStep(p => Math.min(p + 1, 3));
  };
  const handlePrevStep = () => setCurrentStep(p => Math.max(p - 1, 1));

  const handleProposeMatch = async () => {
    if (!canSubmit || !fighterA || !fighterB || !batch) return;
    try {
      await api.matches.create({
        eventId: batch.event_id,
        subEventId: batch.id,
        fighterAId: matchData.fighterAId,
        fighterBId: matchData.fighterBId,
        rounds: matchData.rounds,
        roundTime: matchData.roundTime,
        knockdownLimit: matchData.knockdownLimit,
        agreedWeight: matchData.weightClass,
        gloveSize: matchData.gloveSize,
        gloveBrand: matchData.gloveType,
        status: "Draft",
        proposalStatus: "draft",
        clubAResponse: "pending",
        clubBResponse: "pending",
        refereeId: null,
        judgeIds: null,
      });

      toast.success(`✅ Match created: ${fighterA.name} vs ${fighterB.name}`);
      navigate(`/home/batches/${batchId}`);
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || "Failed to create match in database");
    }
  };

  // Reset fighters when weight class changes
  const handleWeightClassChange = (weight: number) => {
    setMatchData(prev => ({ ...prev, weightClass: weight, fighterAId: "", fighterBId: "" }));
    setRedSearch(""); setBlueSearch("");
  };

  // Steps config
  const steps = [
    { number: 1, title: "Match Details",     icon: Box },
    { number: 2, title: "Fighter Selection", icon: Users },
    { number: 3, title: "Review & Confirm",  icon: CheckCircle },
  ];

  if (loading) {
    return (
      <div className="text-center py-16">
        <div className="w-10 h-10 border-4 border-primary/30 border-t-primary rounded-full animate-spin mx-auto mb-4" />
        <p className="text-sm text-muted-foreground font-semibold">Loading match details...</p>
      </div>
    );
  }

  if (!batch) {
    return (
      <div className="min-h-screen bg-[#F4F5F8] flex items-center justify-center p-8">
        <div className="text-center">
          <h1 className="text-2xl font-extrabold text-slate-900 mb-4">Batch Not Found</h1>
          <button onClick={() => navigate("/home/matches")} className="btn-primary px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider">
            Back to Matches
          </button>
        </div>
      </div>
    );
  }

  // ── Fighter Card Component ────────────────────────────────────────────────
  const FighterCard = ({
    fighter,
    corner,
    isSelected,
    isOpponent,
    onSelect,
  }: {
    fighter: any;
    corner: "red" | "blue";
    isSelected: boolean;
    isOpponent: boolean;
    onSelect: () => void;
  }) => {
    const { available, reason } = isFighterAvailable(fighter.id);
    const weightDiffToClass = Math.abs(fighter.weight - matchData.weightClass);
    const isDisabled = !available || isOpponent;

    const borderColor = isSelected
      ? corner === "red" ? "border-[#C8102E] ring-2 ring-[#C8102E]/30" : "border-[#0A3D91] ring-2 ring-[#0A3D91]/30"
      : isOpponent
      ? "border-amber-400 bg-amber-50/50"
      : isDisabled
      ? "border-slate-200 opacity-50"
      : "border-slate-200 hover:border-slate-400 cursor-pointer";

    const bgColor = isSelected
      ? corner === "red" ? "bg-red-50" : "bg-blue-50"
      : "bg-white";

    return (
      <div
        onClick={!isDisabled ? onSelect : undefined}
        className={clsx(
          "relative rounded-xl border-2 p-3 transition-all duration-150 select-none",
          borderColor, bgColor,
          !isDisabled && !isSelected && "hover:shadow-md active:scale-[0.98]",
          isDisabled && "cursor-not-allowed"
        )}
      >
        {/* Selected checkmark */}
        {isSelected && (
          <div className={clsx(
            "absolute -top-2 -right-2 w-6 h-6 rounded-full flex items-center justify-center shadow-md",
            corner === "red" ? "bg-[#C8102E]" : "bg-[#0A3D91]"
          )}>
            <CheckCircle className="w-4 h-4 text-white" />
          </div>
        )}

        {/* Opponent badge */}
        {isOpponent && (
          <div className="absolute -top-2 -right-2 bg-amber-500 text-white text-[9px] font-black px-1.5 py-0.5 rounded-full uppercase tracking-wide shadow">
            {corner === "red" ? "🔵 Blue" : "🔴 Red"}
          </div>
        )}

        <div className="flex items-center gap-2.5">
          <img
            src={fighter.image || "https://images.unsplash.com/photo-1549719386-74dfcbf7dbed?w=100"}
            alt={fighter.name}
            className={clsx(
              "w-12 h-12 rounded-lg object-cover flex-shrink-0 border-2",
              isSelected
                ? corner === "red" ? "border-[#C8102E]/50" : "border-[#0A3D91]/50"
                : "border-slate-200"
            )}
          />
          <div className="flex-1 min-w-0">
            <div className="font-black text-[#1A1A24] text-sm truncate">{fighter.name}</div>
            <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
              {/* Weight pill */}
              <span className={clsx(
                "text-[10px] font-bold px-1.5 py-0.5 rounded-full",
                weightDiffToClass === 0
                  ? "bg-emerald-100 text-emerald-700"
                  : weightDiffToClass <= 1
                  ? "bg-blue-100 text-blue-700"
                  : "bg-amber-100 text-amber-700"
              )}>
                {fighter.weight}kg
                {weightDiffToClass > 0 && ` (${weightDiffToClass > 0 ? "+" : ""}${(fighter.weight - matchData.weightClass).toFixed(1)})`}
              </span>
              {/* Grade */}
              <span className="text-[10px] font-bold bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded-full">
                G{fighter.grade}
              </span>
              {/* Record */}
              <span className="text-[10px] font-mono text-slate-500">{fighter.record}</span>
            </div>
            <div className="text-[10px] text-slate-500 truncate mt-0.5">{fighter.gym}</div>
          </div>
        </div>

        {/* Unavailability reason */}
        {isDisabled && !isOpponent && (
          <div className="mt-2 flex items-center gap-1 text-[10px] text-red-600 font-bold bg-red-50 px-2 py-1 rounded-lg">
            <AlertCircle className="w-3 h-3 flex-shrink-0" />
            {reason}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-[#F4F5F8] py-6 px-4 md:px-8">
      <div className="max-w-5xl mx-auto space-y-6">

        {/* Back */}
        <button
          onClick={() => navigate(`/home/batches/${batchId}`)}
          className="inline-flex items-center gap-2 text-slate-500 hover:text-slate-900 font-medium transition-colors text-sm"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Batch
        </button>

        {/* Blue Header with Stepper */}
        <div className="bg-gradient-to-r from-[#0A3D91] to-[#1B4A9E] rounded-2xl p-8 text-white shadow-xl">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
              <Swords className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-black uppercase tracking-tight">CREATE MATCH</h1>
              <p className="text-white/80 font-medium text-sm mt-1">
                {batch.batchNumber} · {batch.eventName}
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
                    <ChevronRight className={clsx("w-5 h-5 mx-2 flex-shrink-0", isCompleted ? "text-emerald-400" : "text-white/40")} />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* ── STEP 1: Match Details ─────────────────────────────────── */}
        {currentStep === 1 && (
          <div className="bg-white rounded-2xl shadow-lg border border-[#E0E0E0] p-8">
            <h2 className="text-2xl font-black text-[#1A1A24] uppercase tracking-tight flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-[#0A3D91] rounded-xl flex items-center justify-center text-white font-black">1</div>
              MATCH DETAILS
            </h2>

            {/* Weight Class Grid */}
            <div className="mb-8">
              <label className="block text-sm font-black text-[#1A1A24] uppercase mb-4 tracking-tight">
                Weight Class *
              </label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {WEIGHT_CLASSES.map(weight => {
                  // Count eligible fighters for this weight class
                  const eligible = fighters.filter(f =>
                    Math.abs(f.weight - weight) <= WEIGHT_TOLERANCE && f.status === "Active"
                  ).length;
                  return (
                    <button
                      key={weight}
                      type="button"
                      onClick={() => handleWeightClassChange(weight)}
                      className={clsx(
                        "px-4 py-4 rounded-xl font-bold transition-all border-2 relative",
                        matchData.weightClass === weight
                          ? "bg-[#0A3D91] border-[#0A3D91] text-white shadow-lg scale-105"
                          : "bg-white border-[#E0E0E0] text-[#707070] hover:border-[#0A3D91]"
                      )}
                    >
                      <div className="text-lg font-black">{weight}kg</div>
                      <div className="text-[10px] opacity-75 mt-1">{getWeightClassName(weight).split("(")[0].trim()}</div>
                      {/* Fighter count badge */}
                      <div className={clsx(
                        "absolute -top-2 -right-2 text-[9px] font-black px-1.5 py-0.5 rounded-full shadow",
                        eligible > 0
                          ? matchData.weightClass === weight
                            ? "bg-white text-[#0A3D91]"
                            : "bg-[#0A3D91] text-white"
                          : "bg-red-500 text-white"
                      )}>
                        {eligible}
                      </div>
                    </button>
                  );
                })}
              </div>
              <p className="mt-3 text-xs text-slate-500 font-medium flex items-center gap-1.5">
                <Scale className="w-3.5 h-3.5 text-slate-400" />
                Badge shows number of eligible fighters within ±{WEIGHT_TOLERANCE}kg of each weight class
              </p>
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
                    <p className="text-sm text-[#707070] font-medium">Make this a title bout for {getWeightClassName(matchData.weightClass)}</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" checked={matchData.isChampionshipMatch}
                      onChange={e => setMatchData(p => ({ ...p, isChampionshipMatch: e.target.checked }))}
                      className="sr-only peer" />
                    <div className="w-14 h-7 bg-gray-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[4px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-[#F2C94C]" />
                  </label>
                </div>
                {matchData.isChampionshipMatch && (
                  <select value={matchData.championTitleId}
                    onChange={e => setMatchData(p => ({ ...p, championTitleId: e.target.value }))}
                    className="w-full bg-white border-2 border-[#E0E0E0] focus:border-[#F2C94C] rounded-xl px-4 py-3 text-[#1A1A24] font-bold focus:outline-none">
                    <option value="">New Championship Title</option>
                    {championsForWeight.map(c => (
                      <option key={c.id} value={c.id}>{c.titleName} — {c.currentHolderName || "Vacant"}</option>
                    ))}
                  </select>
                )}
              </div>
            )}

            {/* Match Configuration */}
            <div className="bg-[#F9FAFB] rounded-xl p-6 mb-6 border border-[#E0E0E0]">
              <h3 className="text-base font-black text-[#1A1A24] uppercase mb-4 tracking-tight">MATCH CONFIGURATION</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[
                  { label: "ROUNDS *", key: "rounds", options: [[3,"3 Rounds"],[5,"5 Rounds (Standard)"],[7,"7 Rounds"],[10,"10 Rounds"],[12,"12 Rounds (Championship)"]] },
                  { label: "ROUND TIME (MIN) *", key: "roundTime", options: [[2,"2 Minutes"],[3,"3 Minutes"]] },
                  { label: "REST TIME (MIN)", key: "restTime", options: [[1,"1 Minute"],[2,"2 Minutes"]] },
                ].map(({ label, key, options }) => (
                  <div key={key}>
                    <label className="block text-xs font-bold text-[#707070] uppercase mb-2 tracking-wide">{label}</label>
                    <select
                      value={(matchData as any)[key]}
                      onChange={e => setMatchData(p => ({ ...p, [key]: parseInt(e.target.value) }))}
                      className="w-full bg-white border border-[#E0E0E0] rounded-lg px-4 py-2.5 font-medium text-sm focus:outline-none focus:ring-2 focus:ring-[#0A3D91]"
                    >
                      {options.map(([val, label]) => <option key={val} value={val}>{label}</option>)}
                    </select>
                  </div>
                ))}
              </div>
            </div>

            {/* Glove Specification */}
            <div className="bg-white rounded-xl p-6 border-2 border-[#F2C94C]">
              <h3 className="text-base font-black text-[#1A1A24] uppercase mb-4 tracking-tight flex items-center gap-2">
                <Scale className="w-5 h-5 text-[#F2C94C]" /> GLOVE SPECIFICATION
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-[#707070] uppercase mb-2 tracking-wide">GLOVE SIZE *</label>
                  <select value={matchData.gloveSize}
                    onChange={e => setMatchData(p => ({ ...p, gloveSize: e.target.value }))}
                    className="w-full bg-white border border-[#E0E0E0] rounded-lg px-4 py-2.5 font-medium text-sm focus:outline-none focus:ring-2 focus:ring-[#F2C94C]">
                    {GLOVE_SIZES.map(s => <option key={s.id} value={s.size}>{s.size} — {s.weightRange}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#707070] uppercase mb-2 tracking-wide">GLOVE BRAND *</label>
                  <select value={matchData.gloveType}
                    onChange={e => setMatchData(p => ({ ...p, gloveType: e.target.value }))}
                    className="w-full bg-white border border-[#E0E0E0] rounded-lg px-4 py-2.5 font-medium text-sm focus:outline-none focus:ring-2 focus:ring-[#F2C94C]">
                    {approvedGloves.map(g => <option key={g.id} value={`${g.brand} ${g.model}`}>{g.brand} — {g.model}</option>)}
                  </select>
                  <p className="mt-1.5 text-[11px] text-emerald-700 font-bold flex items-center gap-1">
                    <CheckCircle className="w-3 h-3" /> KKF Approved Equipment
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-8 pt-6 border-t border-[#E0E0E0] flex justify-end gap-4">
              <button onClick={() => navigate(`/home/batches/${batchId}`)}
                className="px-6 py-3 bg-[#E0E0E0] hover:bg-[#D0D0D0] text-[#1A1A24] rounded-lg font-bold transition-all text-sm">
                Cancel
              </button>
              <button onClick={handleNextStep} disabled={!canProceedToStep2}
                className="px-8 py-3 bg-[#0A3D91] hover:bg-[#051C42] text-white rounded-lg font-bold flex items-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed text-sm">
                Next: Select Fighters <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}

        {/* ── STEP 2: Fighter Selection ─────────────────────────────── */}
        {currentStep === 2 && (
          <div className="bg-white rounded-2xl shadow-lg border border-[#E0E0E0] p-8">
            <h2 className="text-2xl font-black text-[#1A1A24] uppercase tracking-tight flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-[#0A3D91] rounded-xl flex items-center justify-center text-white font-black">2</div>
              FIGHTER SELECTION
            </h2>

            {/* Weight class info banner */}
            <div className="mb-6 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl flex items-center gap-3">
              <div className="w-10 h-10 bg-[#0A3D91] rounded-lg flex items-center justify-center flex-shrink-0">
                <Weight className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1">
                <div className="text-sm font-black text-blue-900">{getWeightClassName(matchData.weightClass)}</div>
                <div className="text-xs text-blue-700 font-medium mt-0.5">
                  Showing <strong>{eligibleFighters.length} eligible fighters</strong> within ±{WEIGHT_TOLERANCE}kg of {matchData.weightClass}kg
                  {eligibleFighters.length === 0 && " — try a different weight class"}
                </div>
              </div>
              <button onClick={() => setCurrentStep(1)}
                className="text-xs font-bold text-blue-700 hover:text-blue-900 underline flex-shrink-0">
                Change class
              </button>
            </div>

            {eligibleFighters.length === 0 ? (
              <div className="text-center py-16 border-2 border-dashed border-slate-200 rounded-2xl">
                <Weight className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                <p className="text-slate-500 font-bold text-sm">No active fighters found within ±{WEIGHT_TOLERANCE}kg of {matchData.weightClass}kg</p>
                <button onClick={() => setCurrentStep(1)}
                  className="mt-4 text-[#0A3D91] font-bold text-sm hover:underline">← Change weight class</button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* ── RED CORNER ── */}
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-8 h-8 bg-[#C8102E] rounded-lg flex items-center justify-center text-white text-xs font-black flex-shrink-0">RED</div>
                    <span className="text-sm font-black text-[#C8102E] uppercase tracking-wider">Red Corner Fighter *</span>
                    {matchData.fighterAId && (
                      <button onClick={() => setMatchData(p => ({ ...p, fighterAId: "" }))}
                        className="ml-auto text-[10px] font-bold text-slate-400 hover:text-red-500 flex items-center gap-1">
                        <X className="w-3 h-3" /> Clear
                      </button>
                    )}
                  </div>

                  {/* Search */}
                  <div className="relative mb-3">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                    <input
                      type="text"
                      placeholder="Search fighter..."
                      value={redSearch}
                      onChange={e => setRedSearch(e.target.value)}
                      className="w-full pl-8 pr-3 py-2 border border-[#E0E0E0] rounded-lg text-sm font-medium focus:outline-none focus:border-[#C8102E] focus:ring-1 focus:ring-[#C8102E]/30"
                    />
                  </div>

                  {/* Selected fighter banner */}
                  {fighterA && (
                    <div className="mb-3 p-3 bg-red-50 border-2 border-[#C8102E] rounded-xl flex items-center gap-3">
                      <img src={fighterA.image} alt={fighterA.name} className="w-10 h-10 rounded-lg object-cover border-2 border-[#C8102E]/40 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <div className="font-black text-[#C8102E] text-sm">{fighterA.name}</div>
                        <div className="text-[11px] text-red-700">{fighterA.weight}kg · {fighterA.record} · {fighterA.gym}</div>
                      </div>
                      <CheckCircle className="w-5 h-5 text-[#C8102E] flex-shrink-0" />
                    </div>
                  )}

                  {/* Fighter grid */}
                  <div className="space-y-2 max-h-80 overflow-y-auto pr-1 custom-scrollbar">
                    {eligibleFighters
                      .filter(f => !redSearch || f.name.toLowerCase().includes(redSearch.toLowerCase()) || f.gym.toLowerCase().includes(redSearch.toLowerCase()))
                      .map(fighter => (
                        <FighterCard
                          key={fighter.id}
                          fighter={fighter}
                          corner="red"
                          isSelected={matchData.fighterAId === fighter.id}
                          isOpponent={matchData.fighterBId === fighter.id}
                          onSelect={() => {
                            if (matchData.fighterBId === fighter.id) return;
                            setMatchData(p => ({ ...p, fighterAId: p.fighterAId === fighter.id ? "" : fighter.id }));
                          }}
                        />
                      ))}
                  </div>
                </div>

                {/* ── BLUE CORNER ── */}
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-8 h-8 bg-[#0A3D91] rounded-lg flex items-center justify-center text-white text-xs font-black flex-shrink-0">BLUE</div>
                    <span className="text-sm font-black text-[#0A3D91] uppercase tracking-wider">Blue Corner Fighter *</span>
                    {matchData.fighterBId && (
                      <button onClick={() => setMatchData(p => ({ ...p, fighterBId: "" }))}
                        className="ml-auto text-[10px] font-bold text-slate-400 hover:text-blue-500 flex items-center gap-1">
                        <X className="w-3 h-3" /> Clear
                      </button>
                    )}
                  </div>

                  {/* Search */}
                  <div className="relative mb-3">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                    <input
                      type="text"
                      placeholder="Search fighter..."
                      value={blueSearch}
                      onChange={e => setBlueSearch(e.target.value)}
                      className="w-full pl-8 pr-3 py-2 border border-[#E0E0E0] rounded-lg text-sm font-medium focus:outline-none focus:border-[#0A3D91] focus:ring-1 focus:ring-[#0A3D91]/30"
                    />
                  </div>

                  {/* Selected fighter banner */}
                  {fighterB && (
                    <div className="mb-3 p-3 bg-blue-50 border-2 border-[#0A3D91] rounded-xl flex items-center gap-3">
                      <img src={fighterB.image} alt={fighterB.name} className="w-10 h-10 rounded-lg object-cover border-2 border-[#0A3D91]/40 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <div className="font-black text-[#0A3D91] text-sm">{fighterB.name}</div>
                        <div className="text-[11px] text-blue-700">{fighterB.weight}kg · {fighterB.record} · {fighterB.gym}</div>
                      </div>
                      <CheckCircle className="w-5 h-5 text-[#0A3D91] flex-shrink-0" />
                    </div>
                  )}

                  {/* Fighter grid */}
                  <div className="space-y-2 max-h-80 overflow-y-auto pr-1 custom-scrollbar">
                    {eligibleFighters
                      .filter(f => !blueSearch || f.name.toLowerCase().includes(blueSearch.toLowerCase()) || f.gym.toLowerCase().includes(blueSearch.toLowerCase()))
                      .map(fighter => (
                        <FighterCard
                          key={fighter.id}
                          fighter={fighter}
                          corner="blue"
                          isSelected={matchData.fighterBId === fighter.id}
                          isOpponent={matchData.fighterAId === fighter.id}
                          onSelect={() => {
                            if (matchData.fighterAId === fighter.id) return;
                            setMatchData(p => ({ ...p, fighterBId: p.fighterBId === fighter.id ? "" : fighter.id }));
                          }}
                        />
                      ))}
                  </div>
                </div>
              </div>
            )}

            {/* VS Preview + weight diff */}
            {fighterA && fighterB && (
              <div className="mt-6 bg-gradient-to-b from-[#1A1A24] to-[#0A3D91] rounded-2xl p-6 text-white">
                <div className="grid grid-cols-3 items-center gap-4">
                  <div className="text-center">
                    <img src={fighterA.image} alt={fighterA.name} className="w-20 h-20 rounded-full object-cover border-4 border-[#C8102E] mx-auto mb-2 shadow-xl" />
                    <div className="font-black text-sm truncate">{fighterA.name}</div>
                    <div className="text-[10px] text-gray-300 mt-0.5">{fighterA.weight}kg · {fighterA.gym}</div>
                    <div className="mt-1.5 flex items-center justify-center gap-1">
                      <span className="bg-white/10 text-white text-xs font-mono px-2 py-0.5 rounded">{fighterA.record}</span>
                    </div>
                  </div>

                  <div className="text-center">
                    <div className="w-14 h-14 bg-gradient-to-br from-[#C8102E] to-[#0A3D91] rounded-2xl rotate-45 flex items-center justify-center mx-auto shadow-xl">
                      <span className="font-black italic text-xl text-white -rotate-45 block">VS</span>
                    </div>
                    <div className="mt-3 text-xs font-black text-[#F2C94C]">{matchData.rounds}R · {matchData.roundTime}min</div>
                    {/* Weight diff indicator */}
                    {weightDiff !== null && (
                      <div className={clsx(
                        "mt-2 text-[10px] font-bold px-2 py-1 rounded-full mx-auto w-fit",
                        weightDiff === 0
                          ? "bg-emerald-500/20 text-emerald-300"
                          : hasWeightWarning
                          ? "bg-amber-500/20 text-amber-300"
                          : "bg-blue-500/20 text-blue-300"
                      )}>
                        {weightDiff === 0 ? "⚖️ Same weight" : `⚠️ ${weightDiff.toFixed(1)}kg diff`}
                      </div>
                    )}
                  </div>

                  <div className="text-center">
                    <img src={fighterB.image} alt={fighterB.name} className="w-20 h-20 rounded-full object-cover border-4 border-[#0A3D91] mx-auto mb-2 shadow-xl" />
                    <div className="font-black text-sm truncate">{fighterB.name}</div>
                    <div className="text-[10px] text-gray-300 mt-0.5">{fighterB.weight}kg · {fighterB.gym}</div>
                    <div className="mt-1.5 flex items-center justify-center gap-1">
                      <span className="bg-white/10 text-white text-xs font-mono px-2 py-0.5 rounded">{fighterB.record}</span>
                    </div>
                  </div>
                </div>

                {hasWeightWarning && (
                  <div className="mt-4 bg-amber-500/20 border border-amber-500/40 rounded-xl p-3 flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-amber-400 flex-shrink-0" />
                    <p className="text-xs text-amber-300 font-medium">
                      Weight difference of {weightDiff?.toFixed(1)}kg exceeds 1.5kg recommendation. Both fighters must confirm in Step 3.
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Notes */}
            <div className="mt-6">
              <label className="block text-xs font-bold text-[#707070] uppercase mb-2 tracking-wide flex items-center gap-1">
                <FileText className="w-3 h-3" /> Match Notes (Optional)
              </label>
              <textarea
                value={matchData.notes}
                onChange={e => setMatchData(p => ({ ...p, notes: e.target.value }))}
                rows={2}
                placeholder="Special conditions, requirements, or additional information…"
                className="w-full bg-[#F9FAFB] border border-[#E0E0E0] rounded-xl px-4 py-3 text-[#1A1A24] font-medium text-sm focus:outline-none focus:ring-2 focus:ring-[#0A3D91] resize-none"
              />
            </div>

            <div className="mt-8 pt-6 border-t border-[#E0E0E0] flex justify-between gap-4">
              <button onClick={handlePrevStep}
                className="px-6 py-3 bg-[#E0E0E0] hover:bg-[#D0D0D0] text-[#1A1A24] rounded-lg font-bold flex items-center gap-2 transition-all text-sm">
                <ChevronLeft className="w-5 h-5" /> Back
              </button>
              <button onClick={handleNextStep} disabled={!canProceedToStep3}
                className="px-8 py-3 bg-[#0A3D91] hover:bg-[#051C42] text-white rounded-lg font-bold flex items-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed text-sm">
                Next: Review <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}

        {/* ── STEP 3: Review & Confirm ──────────────────────────────── */}
        {currentStep === 3 && fighterA && fighterB && (
          <div className="bg-white rounded-2xl shadow-lg border border-[#E0E0E0] p-8">
            <h2 className="text-2xl font-black text-[#1A1A24] uppercase tracking-tight flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-[#0A3D91] rounded-xl flex items-center justify-center text-white font-black">3</div>
              REVIEW & CONFIRM
            </h2>

            {/* Match Summary */}
            <div className="mb-6 p-6 bg-gradient-to-r from-blue-50 to-purple-50 border-2 border-[#0A3D91] rounded-xl">
              <h3 className="text-sm font-black text-[#1A1A24] uppercase mb-4 tracking-wider">Match Summary</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { label: "Weight Class", value: getWeightClassName(matchData.weightClass) },
                  { label: "Rounds", value: `${matchData.rounds} × ${matchData.roundTime}min` },
                  { label: "Gloves", value: matchData.gloveSize },
                  { label: "Type", value: matchData.isChampionshipMatch ? "🏆 Championship" : "Standard" },
                ].map(({ label, value }) => (
                  <div key={label}>
                    <div className="text-[10px] font-bold text-[#707070] uppercase mb-1 tracking-widest">{label}</div>
                    <div className="text-sm font-black text-[#1A1A24]">{value}</div>
                  </div>
                ))}
              </div>

              {/* Fighter comparison */}
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
                  {weightDiff !== null && (
                    <div className={clsx("text-[10px] font-bold mt-1", hasWeightWarning ? "text-amber-600" : "text-emerald-600")}>
                      {weightDiff === 0 ? "Equal" : `${weightDiff.toFixed(1)}kg diff`}
                    </div>
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

            {/* Glove Agreement */}
            <div className="bg-white rounded-xl p-6 border-2 border-[#F2C94C] mb-6">
              <h3 className="text-base font-black text-[#1A1A24] uppercase mb-3 tracking-tight">GLOVE AGREEMENT</h3>
              <p className="text-xs text-[#707070] mb-4 font-medium">
                Both fighters must confirm <strong>{matchData.gloveSize} {matchData.gloveType}</strong> gloves.
              </p>
              <div className="space-y-3">
                {[
                  { key: "fighterAConfirmed", fighter: fighterA, label: "Red Corner", color: "#C8102E" },
                  { key: "fighterBConfirmed", fighter: fighterB, label: "Blue Corner", color: "#0A3D91" },
                ].map(({ key, fighter, label, color }) => (
                  <label key={key}
                    className="flex items-center gap-3 p-4 bg-[#F9FAFB] rounded-lg border-2 border-[#E0E0E0] cursor-pointer hover:border-slate-300 transition-all">
                    <input type="checkbox"
                      checked={(matchData as any)[key]}
                      onChange={e => setMatchData(p => ({ ...p, [key]: e.target.checked }))}
                      className="w-5 h-5 rounded"
                      style={{ accentColor: color }}
                    />
                    <span className="font-bold text-sm text-[#1A1A24] flex-1">
                      {fighter.name} <span style={{ color }} className="font-black">({label})</span> confirms {matchData.gloveSize} {matchData.gloveType}
                    </span>
                    {(matchData as any)[key] && <CheckCircle className="w-5 h-5 text-emerald-500 flex-shrink-0" />}
                  </label>
                ))}
              </div>
              {isGloveAgreementComplete ? (
                <div className="mt-4 bg-emerald-50 border border-emerald-300 rounded-lg p-3 flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-emerald-600" />
                  <p className="text-xs text-emerald-900 font-bold">Glove agreement complete — ready to create match!</p>
                </div>
              ) : (
                <div className="mt-4 bg-orange-50 border border-orange-300 rounded-lg p-3 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-orange-600" />
                  <p className="text-xs text-orange-900 font-medium">Both fighters must confirm glove agreement.</p>
                </div>
              )}
            </div>

            {matchData.notes && (
              <div className="mb-6 p-4 bg-[#F9FAFB] border border-[#E0E0E0] rounded-xl">
                <div className="text-xs font-bold text-[#707070] uppercase mb-2">Notes</div>
                <p className="text-sm text-[#1A1A24] font-medium">{matchData.notes}</p>
              </div>
            )}

            <div className="mt-8 pt-6 border-t border-[#E0E0E0] flex justify-between gap-4">
              <button onClick={handlePrevStep}
                className="px-6 py-3 bg-[#E0E0E0] hover:bg-[#D0D0D0] text-[#1A1A24] rounded-lg font-bold flex items-center gap-2 transition-all text-sm">
                <ChevronLeft className="w-5 h-5" /> Back
              </button>
              <button onClick={handleProposeMatch} disabled={!canSubmit}
                className="flex-1 max-w-sm bg-gradient-to-r from-[#10B981] to-[#059669] hover:opacity-90 text-white px-8 py-4 rounded-xl font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg">
                <CheckCircle className="w-5 h-5" /> Create Match
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}