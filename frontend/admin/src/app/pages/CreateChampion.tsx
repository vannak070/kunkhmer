import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import {
  ArrowLeft, Crown, Trophy, Save, Calendar, MapPin, Shield,
  Weight, Award, Star, AlertCircle, Info
} from "lucide-react";
import { toast } from "sonner";
import {
  CHAMPION_TYPE_CONFIG,
  WEIGHT_CLASSES,
  type ChampionType,
  type ChampionStatus,
  getWeightClassName
} from "../data/champion";
import { usePermissions } from "../hooks/usePermissions";
import { clsx } from "clsx";
import { api } from "../utils/api";

export function CreateChampion() {
  const navigate = useNavigate();
  const permissions = usePermissions();
  const [formData, setFormData] = useState({
    titleName: "",
    championType: "KKF National" as ChampionType,
    weightClass: 60,
    organization: "KKF" as "KKF" | "WBC" | "WBA" | "WMC" | "Other",
    batchId: "",
    status: "Vacant" as ChampionStatus,
    notes: ""
  });

  const [batches, setBatches] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    const loadBatches = async () => {
      try {
        const data = await api.batches.list();
        setBatches(data || []);
      } catch (err) {
        console.error(err);
        toast.error("Failed to load events/fight cards");
      } finally {
        setLoading(false);
      }
    };
    loadBatches();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    const newErrors: Record<string, string> = {};
    
    if (!formData.titleName.trim()) {
      newErrors.titleName = "Title name is required";
    }
    
    if (!formData.batchId) {
      newErrors.batchId = "Please select an event/fight card";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      toast.error("Please fill in all required fields");
      return;
    }

    const selectedBatch = batches.find(b => b.id === formData.batchId);
    const newChamp = {
      titleName: formData.titleName,
      championType: formData.championType,
      weightClass: formData.weightClass,
      organization: formData.organization,
      batchId: formData.batchId,
      eventName: selectedBatch?.event_name || selectedBatch?.name || "Championship Event",
      status: "Vacant" as ChampionStatus,
      defenseCount: 0,
      notes: formData.notes
    };

    try {
      await api.champions.create(newChamp);
      toast.success("Championship created successfully!");
      navigate("/home/champion");
    } catch (err) {
      console.error(err);
      toast.error("Failed to create championship belt");
    }
  };

  const selectedBatch = batches.find(b => b.id === formData.batchId);
  const activeFiltersCount = 0; // Not applicable for creation page

  return (
    <div className="p-4 md:p-8 max-w-4xl mx-auto space-y-6 animate-fadeIn">
      {/* Header */}
      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate("/home/champion")}
            className="p-2.5 bg-white hover:bg-muted text-primary border border-border/80 rounded-xl transition-all active:scale-95 shadow-sm"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground">Create Championship</h1>
            <p className="text-sm text-muted-foreground mt-0.5 font-medium">
              Sanction a new championship title or tournament belt for an event
            </p>
          </div>
        </div>
      </header>

      {/* Info Box */}
      <div className="bg-primary/5 border border-primary/10 rounded-xl p-5">
        <div className="flex gap-3">
          <Info className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
          <div className="space-y-1.5">
            <h3 className="font-semibold text-primary text-sm uppercase tracking-wide">How Championships Work</h3>
            <ul className="text-xs font-medium text-muted-foreground/90 space-y-1.5">
              <li>• <strong className="font-semibold text-foreground">Championship is a TITLE</strong>, not a fighter assignment</li>
              <li>• The title belongs to an <strong className="font-semibold text-foreground">Event / Fight Card</strong></li>
              <li>• Fighters <strong className="font-semibold text-foreground">compete FOR</strong> the championship in matches</li>
              <li>• Mark matches as <strong className="font-semibold text-foreground">"Title Fight"</strong> to award the championship</li>
              <li>• The match <strong className="font-semibold text-foreground">winner</strong> becomes the champion</li>
            </ul>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Championship Type Selection */}
        <div className="card-premium p-6 sm:p-8 space-y-6">
          <div className="flex items-center gap-3 pb-4 border-b border-border/60">
            <div className="w-10 h-10 bg-accent/10 text-accent-foreground rounded-xl flex items-center justify-center">
              <Trophy className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-foreground uppercase tracking-tight">
                Championship Type
              </h2>
              <p className="text-xs text-muted-foreground">Select the championship sanction category</p>
            </div>
          </div>
          
          {/* Belt Titles */}
          <div>
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-3">
              Belt Titles
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                "KKF National",
                "ISKA Cambodia",
                "IPCC International",
                "International Belt",
                "Interim Belt",
                "Super Fight Belt",
                "Sponsor Belt"
              ].map((type) => {
                const config = CHAMPION_TYPE_CONFIG[type as ChampionType];
                return (
                  <button
                    key={type}
                    type="button"
                    onClick={() => setFormData({ ...formData, championType: type as ChampionType })}
                    className={clsx(
                      "p-4 rounded-xl border transition-all text-center flex flex-col items-center justify-center hover:-translate-y-0.5 duration-200 cursor-pointer",
                      formData.championType === type
                        ? "bg-primary/5 text-primary border-primary font-bold scale-[1.02] ring-2 ring-primary/10 shadow-sm"
                        : "bg-white text-muted-foreground border-border hover:border-slate-300 hover:text-foreground hover:bg-muted/20"
                    )}
                  >
                    <div className="text-2xl mb-1.5">{config.icon}</div>
                    <div className="text-[10px] font-bold uppercase tracking-wider leading-tight">
                      {config.label.replace(" Champion", "").replace(" Belt", "")}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Divider */}
          <div className="border-t border-border/60"></div>

          {/* Non-Belt Awards */}
          <div>
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-3">
              Non-Belt Awards
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {[
                "Trophy",
                "Tournament Winner",
                "Honorary Award"
              ].map((type) => {
                const config = CHAMPION_TYPE_CONFIG[type as ChampionType];
                return (
                  <button
                    key={type}
                    type="button"
                    onClick={() => setFormData({ ...formData, championType: type as ChampionType })}
                    className={clsx(
                      "p-4 rounded-xl border transition-all text-center flex flex-col items-center justify-center hover:-translate-y-0.5 duration-200 cursor-pointer",
                      formData.championType === type
                        ? "bg-primary/5 text-primary border-primary font-bold scale-[1.02] ring-2 ring-primary/10 shadow-sm"
                        : "bg-white text-muted-foreground border-border hover:border-slate-300 hover:text-foreground hover:bg-muted/20"
                    )}
                  >
                    <div className="text-2xl mb-1.5">{config.icon}</div>
                    <div className="text-[10px] font-bold uppercase tracking-wider leading-tight">
                      {config.label}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Title Details */}
        <div className="card-premium p-6 sm:p-8 space-y-6">
          <div className="flex items-center gap-3 pb-4 border-b border-border/60">
            <div className="w-10 h-10 bg-accent/10 text-accent-foreground rounded-xl flex items-center justify-center">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-foreground uppercase tracking-tight">
                Championship Title Details
              </h2>
              <p className="text-xs text-muted-foreground">Configure the title name, weight class, and sanction organization</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="md:col-span-2">
              <label className="block text-xs font-semibold text-muted-foreground uppercase mb-2 tracking-wide">
                Championship Title Name *
              </label>
              <input
                type="text"
                value={formData.titleName}
                onChange={(e) => {
                  setFormData({ ...formData, titleName: e.target.value });
                  setErrors({ ...errors, titleName: "" });
                }}
                placeholder="e.g., KKF National Championship 65kg, WMC World Title 70kg"
                className={clsx(
                  "input-premium py-2.5",
                  errors.titleName && "border-destructive focus:border-destructive focus:ring-destructive/10"
                )}
              />
              {errors.titleName && (
                <p className="mt-1.5 text-[10px] font-semibold text-destructive flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5" />
                  {errors.titleName}
                </p>
              )}
              <p className="mt-2 text-[10px] font-semibold text-muted-foreground">
                💡 This is the official name of the championship belt/title
              </p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-muted-foreground uppercase mb-2 tracking-wide">
                Weight Class (kg) *
              </label>
              <select
                value={formData.weightClass}
                onChange={(e) => setFormData({ ...formData, weightClass: parseFloat(e.target.value) })}
                className="input-premium cursor-pointer py-2.5"
              >
                {WEIGHT_CLASSES.map(weight => (
                  <option key={weight} value={weight}>
                    {getWeightClassName(weight)}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-muted-foreground uppercase mb-2 tracking-wide">
                Organization *
              </label>
              <select
                value={formData.organization}
                onChange={(e) => setFormData({ ...formData, organization: e.target.value as any })}
                className="input-premium cursor-pointer py-2.5"
              >
                <option value="KKF">KKF</option>
                <option value="WBC">WBC</option>
                <option value="WBA">WBA</option>
                <option value="WMC">WMC</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs font-semibold text-muted-foreground uppercase mb-2 tracking-wide">
                Initial Status *
              </label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as ChampionStatus })}
                className="input-premium cursor-pointer py-2.5"
              >
                <option value="Vacant">Vacant - No current holder (up for grabs)</option>
                <option value="Active">Active - Has current holder</option>
                <option value="Title Defense Scheduled">Title Defense Scheduled - Upcoming defense</option>
                <option value="Inactive">Inactive - Holder unavailable</option>
              </select>
              <p className="mt-2 text-[10px] font-semibold text-muted-foreground">
                💡 Most new championships start as "Vacant" until a title fight determines the first champion
              </p>
            </div>
          </div>
        </div>

        {/* Event/Batch Association */}
        <div className="card-premium p-6 sm:p-8 space-y-6">
          <div className="flex items-center gap-3 pb-4 border-b border-border/60">
            <div className="w-10 h-10 bg-primary/10 text-primary rounded-xl flex items-center justify-center">
              <MapPin className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-foreground uppercase tracking-tight">
                Event Association
              </h2>
              <p className="text-xs text-muted-foreground">Link this title to the host fight event card</p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-muted-foreground uppercase mb-2 tracking-wide">
                Select Event/Batch *
              </label>
              <select
                value={formData.batchId}
                onChange={(e) => {
                  setFormData({ ...formData, batchId: e.target.value });
                  setErrors({ ...errors, batchId: "" });
                }}
                className={clsx(
                  "input-premium cursor-pointer py-2.5",
                  errors.batchId && "border-destructive focus:border-destructive focus:ring-destructive/10"
                )}
              >
                <option value="">-- Select Event / Fight Card --</option>
                {batches.map(batch => (
                  <option key={batch.id} value={batch.id}>
                    {batch.event_name || batch.name} - {new Date(batch.date).toLocaleDateString()}
                  </option>
                ))}
              </select>
              {errors.batchId && (
                <p className="mt-1.5 text-[10px] font-semibold text-destructive flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5" />
                  {errors.batchId}
                </p>
              )}
              <p className="mt-2 text-[10px] font-semibold text-muted-foreground">
                💡 This championship will belong to the selected event
              </p>
            </div>

            {selectedBatch && (
              <div className="bg-muted/30 border border-border/60 rounded-xl p-4">
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-xs">
                  <div>
                    <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-0.5">Event Name</div>
                    <div className="font-semibold text-foreground text-sm">{selectedBatch.event_name || selectedBatch.name}</div>
                  </div>
                  <div>
                    <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-0.5">Date</div>
                    <div className="font-semibold text-foreground text-sm">
                      {new Date(selectedBatch.date).toLocaleDateString()}
                    </div>
                  </div>
                  <div>
                    <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-0.5">Location</div>
                    <div className="font-semibold text-foreground text-sm truncate">{selectedBatch.location}</div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Additional Notes */}
        <div className="card-premium p-6 sm:p-8 space-y-6">
          <div className="flex items-center gap-3 pb-4 border-b border-border/60">
            <div className="w-10 h-10 bg-muted text-muted-foreground rounded-xl flex items-center justify-center">
              <Star className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-foreground uppercase tracking-tight">
                Additional Information
              </h2>
              <p className="text-xs text-muted-foreground">Provide additional guidelines or requirements for this title</p>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-muted-foreground uppercase mb-2 tracking-wide">
              Notes (Optional)
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Add any additional notes about this championship..."
              rows={4}
              className="input-premium py-2.5 resize-none"
            />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-end gap-3 pt-4">
          <button
            type="button"
            onClick={() => navigate("/home/champion")}
            className="w-full sm:w-auto btn-outline py-2.5 px-6 uppercase text-xs tracking-wider"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="w-full sm:w-auto btn-primary py-2.5 px-6 uppercase text-xs tracking-wider"
          >
            <Save className="w-4 h-4" />
            Create Championship
          </button>
        </div>
      </form>
    </div>
  );
}