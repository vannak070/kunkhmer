import { useState, useRef, useEffect } from "react";
import { useNavigate, useParams, useLocation, Link } from "react-router";
import {
  ArrowLeft, Save, Upload, X, User, FileText, MapPin, HeartPulse,
  Dumbbell, Shield, Activity, CheckCircle2, AlertCircle, FileCheck,
  Crown, Info, ChevronDown
} from "lucide-react";
import { api } from "../utils/api";
import { usePermissions } from "../hooks/usePermissions";
import { useWeightClasses } from "../hooks/useSettingsLists";
import { toast } from "sonner";

const NATIONALITIES = [
  "Thai", "Vietnamese", "Lao", "Myanmar", "Indonesian", "Malaysian", "Filipino",
  "Japanese", "Korean", "Chinese", "Indian", "Australian", "American", "British",
  "French", "German", "Russian", "Brazilian", "Other"
];

const FIGHTING_STYLES = [
  { id: "aggressive", label: "Aggressive", subtitle: "Pressure Fighter" },
  { id: "clinch", label: "Clinch Master", subtitle: "Knees/Elbows" },
  { id: "counter", label: "Counter Fighter", subtitle: "Technical" },
  { id: "balanced", label: "Balanced", subtitle: "All-Rounder" },
  { id: "kicking", label: "Kicking", subtitle: "Long Range" },
  { id: "boxing", label: "Boxing", subtitle: "Hands Heavy" },
];

export function AddFighter() {
  const navigate = useNavigate();
  const location = useLocation();
  const { id } = useParams();
  const permissions = usePermissions();
  // Weight classes from System Settings (Phase 5).
  const { names: WEIGHT_RANGES, classFor: getWeightRangeCategory } = useWeightClasses();
  const currentUser = permissions.currentUser;
  const photoInputRef = useRef<HTMLInputElement>(null);
  const docInputRef = useRef<HTMLInputElement>(null);

  const isKunKhmer = location.pathname.includes("/kunkhmer");
  const isEditMode = !!id;
  // Club/Gym accounts register fighters for their own club; KKF verifies them afterwards.
  const me = api.auth.getCurrentUser();
  const isClubUser = me?.role === "Club/Gym";
  const isStaff = me?.role === "Super Admin" || me?.role === "KKF Officer";
  const [reviewNote, setReviewNote] = useState<string | null>(null);

  const [clubs, setClubs] = useState<any[]>([]);
  const [fighter, setFighter] = useState({
    nameEN: "", nameKH: "", alias: "", dob: "", pob: "",
    nationality: isKunKhmer ? "Cambodian" : "", gender: "Male",
    idType: "National ID", idNumber: "", idExpiry: "", idDocumentUrl: "",
    phone1: "", email: "", address: "", city: "",
    emergencyName: "", emergencyRelation: "", emergencyPhone: "",
    bloodType: "O+", lastMedicalCheck: "", medicalExpiry: "",
    medicalConditions: "None", allergies: "None",
    weight: "", height: "", reach: "", experience: "0",
    styles: [] as string[], type: "Professional", grade: "D",
    weightClass: "", record: "0-0-0",
    origin: isKunKhmer ? "Local" : "Foreigner",
    gym: "", clubId: "", trainer: "", promoter: "",
    image: "", status: "Draft",
    termsAccepted: false, consentCompete: false, medicalFitness: false,
  });

  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [docPreview, setDocPreview] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  useEffect(() => {
    const fetchClubs = async () => {
      try {
        const list = await api.clubs.list();
        setClubs(list);
        if (isClubUser && me?.clubId) {
          const own = list.find((c: any) => c.id === me.clubId);
          setFighter((p) => ({ ...p, clubId: me.clubId, gym: own?.name ?? p.gym }));
        }
      } catch (err: any) {
        toast.error("Failed to load clubs: " + err.message);
      }
    };
    fetchClubs();
  }, []);

  useEffect(() => {
    if (isEditMode && id) {
      const fetchFighter = async () => {
        try {
          const f = await api.fighters.get(id);
          if (f) {
            setFighter({
              nameEN: f.name || "",
              nameKH: f.nameKhmer || f.name_khmer || "",
              alias: f.alias || "",
              dob: f.dateOfBirth ? f.dateOfBirth.split("T")[0] : (f.date_of_birth ? f.date_of_birth.split("T")[0] : ""),
              pob: f.province || "",
              nationality: f.nationality || "",
              gender: f.gender || "Male",
              idType: "National ID", idNumber: "", idExpiry: "", idDocumentUrl: "",
              phone1: "", email: "", address: "", city: "",
              emergencyName: "", emergencyRelation: "", emergencyPhone: "",
              bloodType: "O+", lastMedicalCheck: "", medicalExpiry: "",
              medicalConditions: "None", allergies: "None",
              weight: f.currentWeight?.toString() || f.current_weight?.toString() || "",
              height: f.height?.toString() || "",
              reach: "", experience: "0",
              styles: f.style ? f.style.split(", ").map((s: string) => s.toLowerCase()) : [],
              type: "Professional",
              grade: f.grade || "D",
              origin: f.nationality === "Cambodian" ? "Local" : "Foreigner",
              gym: f.clubName || f.club_name || "",
              clubId: f.clubId || f.club_id || "",
              trainer: "", promoter: "",
              image: f.image || "",
              status: f.status || "Draft",
              termsAccepted: true, consentCompete: true, medicalFitness: true,
              record: f.record || "0-0-0",
              weightClass: f.currentWeight ? getWeightRangeCategory(parseFloat(f.currentWeight)) : (f.current_weight ? getWeightRangeCategory(parseFloat(f.current_weight)) : ""),
            });
            if (f.image) setPhotoPreview(f.image);
            setReviewNote(f.status === "Rejected" ? f.reviewNote ?? null : null);
          }
        } catch (err: any) {
          toast.error("Failed to load fighter data: " + err.message);
        }
      };
      fetchFighter();
    }
  }, [isEditMode, id]);

  const calculateAge = (dob: string) => {
    if (!dob) return "--";
    return Math.abs(new Date(Date.now() - new Date(dob).getTime()).getUTCFullYear() - 1970);
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64Data = reader.result as string;
        setPhotoPreview(base64Data);
        setFighter((p) => ({ ...p, image: base64Data }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDocChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64Data = reader.result as string;
        setDocPreview(base64Data);
        setFighter((p) => ({ ...p, idDocumentUrl: base64Data }));
      };
      reader.readAsDataURL(file);
    }
  };

  const removePhoto = () => {
    setPhotoPreview(null);
    setFighter((p) => ({ ...p, image: "" }));
    if (photoInputRef.current) photoInputRef.current.value = "";
  };

  const removeDoc = () => {
    setDocPreview(null);
    setFighter((p) => ({ ...p, idDocumentUrl: "" }));
    if (docInputRef.current) docInputRef.current.value = "";
  };

  // Weight classes load from the API; fill in the class once they arrive.
  useEffect(() => {
    if (WEIGHT_RANGES.length && !fighter.weightClass && fighter.weight) {
      setFighter((p) => ({ ...p, weightClass: getWeightRangeCategory(p.weight) }));
    }
  }, [WEIGHT_RANGES.length, fighter.weight]);

  const updateField = (field: string, value: any) => {
    setFighter((p) => {
      const nextFighter = { ...p, [field]: value };
      if (field === "weight") {
        const wt = parseFloat(value);
        if (!isNaN(wt) && wt > 0) {
          nextFighter.weightClass = getWeightRangeCategory(wt);
        }
      }
      return nextFighter;
    });
    if (errors[field]) setErrors((p) => { const n = { ...p }; delete n[field]; return n; });
  };

  const validateField = (field: string, value: any) => {
    switch (field) {
      case "nameEN": case "nameKH":
        return !value?.trim() ? "This field is required" : "";
      case "dob": return !value ? "Date of birth is required" : "";
      case "weight":
        if (!value || parseFloat(value) <= 0) return "Valid weight is required";
        if (parseFloat(value) < 40 || parseFloat(value) > 150) return "Weight must be 40–150 kg";
        return "";
      case "clubId": return !value ? "Training Camp/Gym selection is required" : "";
      case "phone1": return !value?.trim() ? "Phone number is required" : "";
      case "idNumber": return !value?.trim() ? "ID number is required" : "";
      case "styles": return !value?.length ? "Select at least one fighting style" : "";
      default: return "";
    }
  };

  const handleBlur = (field: string) => {
    setTouched((p) => ({ ...p, [field]: true }));
    const error = validateField(field, fighter[field as keyof typeof fighter]);
    if (error) setErrors((p) => ({ ...p, [field]: error }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fighter.clubId) { toast.error("Please select a Training Camp / Gym."); return; }
    if (!fighter.termsAccepted || !fighter.consentCompete || !fighter.medicalFitness) {
      toast.error("Please accept all legal & compliance terms before saving."); return;
    }
    // No photo stays empty — never a stock photo of someone else.
    const finalImage = fighter.image || null;
    const payload = {
      name: fighter.nameEN,
      nameKhmer: fighter.nameKH,
      alias: fighter.alias || null,
      dateOfBirth: fighter.dob,
      nationality: fighter.nationality || (isKunKhmer ? 'Cambodian' : 'Other'),
      province: fighter.pob || null,
      gender: fighter.gender as 'Male' | 'Female',
      currentWeight: parseFloat(fighter.weight) || 0,
      height: parseFloat(fighter.height) || 0,
      clubId: fighter.clubId || null,
      style: fighter.styles.join(", "),
      grade: fighter.grade as 'A' | 'B' | 'C' | 'D',
      image: finalImage,
      record: fighter.record,
      // Only KKF staff set status; everyone else's fighters wait for verification.
      ...(isStaff ? { status: fighter.status } : {}),
    };

    try {
      if (isEditMode && id) {
        await api.fighters.update(id, payload);
        toast.success("Fighter updated successfully!");
        navigate(`/home/fighters/${id}`);
      } else {
        const created = await api.fighters.create(payload);
        if (created?.status && created.status !== "Active") {
          toast.success("Fighter registered", { description: "KKF will verify this fighter before they can be matched." });
        } else {
          toast.success("Fighter registered successfully!");
        }
        navigate("/home/fighters");
      }
    } catch (err: any) {
      toast.error("Failed to save fighter: " + err.message);
    }
  };

  const fieldClass = (field: string) =>
    `input-premium font-semibold text-slate-800 ${errors[field] && touched[field] ? "border-secondary!" : ""}`;


  return (
    <div className="p-4 md:p-8 max-w-6xl mx-auto space-y-6 flex flex-col min-h-full animate-fadeIn">

      {/* Header */}
      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-4">
          <Link
            to="/home/fighters"
            className="p-2.5 bg-white hover:bg-muted text-primary border border-border/80 rounded-xl transition-all active:scale-95 shadow-sm"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-foreground">
              {isEditMode ? "Edit Fighter" : isKunKhmer ? "Register Kun Khmer Fighter" : "Register Foreign Fighter"}
            </h1>
            <p className="text-sm text-muted-foreground mt-1 font-medium">
              {isEditMode ? "Update fighter information" : "Complete all required fields to register the fighter"}
            </p>
          </div>
        </div>
      </header>

      {/* Validation Summary */}
      {Object.keys(errors).length > 0 && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-secondary shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-bold text-secondary mb-1">Please review the following issues:</p>
            <ul className="space-y-0.5">
              {Object.entries(errors).map(([field, error]) => (
                <li key={field} className="text-xs text-foreground/80">
                  <span className="capitalize font-semibold">{field.replace(/([A-Z])/g, " $1").trim()}:</span> {error}
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* ── Left / Main Column ── */}
        <div className="lg:col-span-2 space-y-6">

          {/* Personal Information */}
          <div className="card-premium">
            <h2 className="text-base font-bold text-foreground mb-4 flex items-center gap-2">
              <User className="w-5 h-5 text-primary" />
              Personal Information
            </h2>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">
                    Full Name (English) <span className="text-secondary">*</span>
                  </label>
                  <input
                    type="text"
                    value={fighter.nameEN}
                    onChange={(e) => updateField("nameEN", e.target.value)}
                    onBlur={() => handleBlur("nameEN")}
                    placeholder="e.g. Prom Samnang"
                    className={fieldClass("nameEN")}
                  />
                  {errors.nameEN && touched.nameEN && (
                    <p className="text-xs text-secondary mt-1 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" /> {errors.nameEN}
                    </p>
                  )}
                </div>
                <div>
                  <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">
                    Full Name (Khmer) <span className="text-secondary">*</span>
                  </label>
                  <input
                    type="text"
                    value={fighter.nameKH}
                    onChange={(e) => updateField("nameKH", e.target.value)}
                    onBlur={() => handleBlur("nameKH")}
                    placeholder="ព្រំ សំណាង"
                    className={fieldClass("nameKH")}
                  />
                  {errors.nameKH && touched.nameKH && (
                    <p className="text-xs text-secondary mt-1 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" /> {errors.nameKH}
                    </p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">
                    Fighter Alias
                  </label>
                  <input
                    type="text"
                    value={fighter.alias}
                    onChange={(e) => updateField("alias", e.target.value)}
                    placeholder="The Tiger"
                    className="input-premium font-semibold text-slate-800"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">
                    Date of Birth <span className="text-secondary">*</span>
                  </label>
                  <input
                    type="date"
                    value={fighter.dob}
                    onChange={(e) => updateField("dob", e.target.value)}
                    onBlur={() => handleBlur("dob")}
                    className={fieldClass("dob")}
                  />
                  {fighter.dob && !errors.dob && (
                    <p className="text-xs text-primary mt-1 flex items-center gap-1 font-semibold">
                      <CheckCircle2 className="w-3 h-3" /> Age: {calculateAge(fighter.dob)} years
                    </p>
                  )}
                  {errors.dob && touched.dob && (
                    <p className="text-xs text-secondary mt-1 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" /> {errors.dob}
                    </p>
                  )}
                </div>
                <div>
                  <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">
                    Gender <span className="text-secondary">*</span>
                  </label>
                  <div className="relative">
                    <select
                      value={fighter.gender}
                      onChange={(e) => updateField("gender", e.target.value)}
                      className="input-premium font-semibold text-slate-800 cursor-pointer appearance-none"
                    >
                      <option>Male</option>
                      <option>Female</option>
                    </select>
                    <ChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">
                    Place of Birth <span className="text-secondary">*</span>
                  </label>
                  <input
                    type="text"
                    value={fighter.pob}
                    onChange={(e) => updateField("pob", e.target.value)}
                    placeholder="e.g. Kampong Speu"
                    className="input-premium font-semibold text-slate-800"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">
                    Nationality <span className="text-secondary">*</span>
                  </label>
                  {isKunKhmer ? (
                    <div className="input-premium font-semibold text-primary flex items-center justify-between">
                      <span>Cambodia</span>
                      <span className="text-[10px] bg-primary/10 text-primary px-2 py-0.5 rounded-md font-bold uppercase tracking-wider">
                        Kun Khmer
                      </span>
                    </div>
                  ) : (
                    <div className="relative">
                      <select
                        value={fighter.nationality}
                        onChange={(e) => updateField("nationality", e.target.value)}
                        className="input-premium font-semibold text-slate-800 cursor-pointer appearance-none"
                      >
                        <option value="" disabled>Select Nationality</option>
                        {NATIONALITIES.map((nat) => (
                          <option key={nat}>{nat}</option>
                        ))}
                      </select>
                      <ChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* KYC Documents */}
          <div className="card-premium">
            <h2 className="text-base font-bold text-foreground mb-4 flex items-center gap-2">
              <Shield className="w-5 h-5 text-amber-500" />
              KYC Verification
            </h2>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">
                    ID Type <span className="text-secondary">*</span>
                  </label>
                  <div className="relative">
                    <select
                      value={fighter.idType}
                      onChange={(e) => updateField("idType", e.target.value)}
                      className="input-premium font-semibold text-slate-800 cursor-pointer appearance-none"
                    >
                      <option>National ID</option>
                      <option>Passport</option>
                      <option>Birth Certificate</option>
                    </select>
                    <ChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">
                    ID Number <span className="text-secondary">*</span>
                  </label>
                  <input
                    type="text"
                    value={fighter.idNumber}
                    onChange={(e) => updateField("idNumber", e.target.value)}
                    onBlur={() => handleBlur("idNumber")}
                    placeholder="Enter ID number"
                    className={fieldClass("idNumber")}
                  />
                  {errors.idNumber && touched.idNumber && (
                    <p className="text-xs text-secondary mt-1 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" /> {errors.idNumber}
                    </p>
                  )}
                </div>
                {fighter.idType !== "Birth Certificate" && (
                  <div>
                    <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">
                      Expiry Date <span className="text-secondary">*</span>
                    </label>
                    <input
                      type="date"
                      value={fighter.idExpiry}
                      onChange={(e) => updateField("idExpiry", e.target.value)}
                      className="input-premium font-semibold text-slate-800"
                    />
                  </div>
                )}
              </div>

              {/* Document Upload */}
              <div className="p-4 bg-blue-50/60 rounded-xl border border-dashed border-blue-200">
                <div className="flex items-start gap-3">
                  <FileCheck className="w-5 h-5 text-primary mt-0.5 shrink-0" />
                  <div className="flex-1">
                    <p className="text-sm font-bold text-primary mb-1">Upload {fighter.idType}</p>
                    <p className="text-xs text-muted-foreground mb-3">Clear photo or scan of the front side</p>
                    <input ref={docInputRef} type="file" accept="image/*,application/pdf" onChange={handleDocChange} className="hidden" id="doc-upload" />
                    {!docPreview ? (
                      <label htmlFor="doc-upload" className="inline-flex items-center gap-2 px-4 py-2 bg-primary hover:bg-primary/90 text-white rounded-lg text-sm font-bold cursor-pointer transition-all">
                        <Upload className="w-4 h-4" /> Choose File
                      </label>
                    ) : (
                      <div className="flex items-center gap-3 p-3 bg-white rounded-lg border border-green-200">
                        <CheckCircle2 className="w-4 h-4 text-green-600" />
                        <span className="text-sm font-semibold flex-1">{fighter.idType} — Ready</span>
                        <button type="button" onClick={removeDoc} className="p-1.5 hover:bg-red-50 rounded-lg text-secondary transition-colors">
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Contact Information */}
          <div className="card-premium">
            <h2 className="text-base font-bold text-foreground mb-4 flex items-center gap-2">
              <MapPin className="w-5 h-5 text-primary" />
              Contact Information
            </h2>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">
                    Primary Phone <span className="text-secondary">*</span>
                  </label>
                  <input
                    type="tel"
                    value={fighter.phone1}
                    onChange={(e) => updateField("phone1", e.target.value)}
                    onBlur={() => handleBlur("phone1")}
                    placeholder="+855 12 345 678"
                    className={fieldClass("phone1")}
                  />
                  {errors.phone1 && touched.phone1 && (
                    <p className="text-xs text-secondary mt-1 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" /> {errors.phone1}
                    </p>
                  )}
                </div>
                <div>
                  <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={fighter.email}
                    onChange={(e) => updateField("email", e.target.value)}
                    placeholder="fighter@example.com"
                    className="input-premium font-semibold text-slate-800"
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">
                    Current Address
                  </label>
                  <input
                    type="text"
                    value={fighter.address}
                    onChange={(e) => updateField("address", e.target.value)}
                    placeholder="Street, Sangkat, Khan..."
                    className="input-premium font-semibold text-slate-800"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">
                    City / Province
                  </label>
                  <input
                    type="text"
                    value={fighter.city}
                    onChange={(e) => updateField("city", e.target.value)}
                    placeholder="Phnom Penh"
                    className="input-premium font-semibold text-slate-800"
                  />
                </div>
              </div>

              {/* Emergency Contact */}
              <div className="p-4 bg-red-50/60 rounded-xl border border-red-100">
                <div className="flex items-center gap-2 mb-3">
                  <Activity className="w-4 h-4 text-secondary" />
                  <h3 className="text-xs font-bold text-secondary uppercase tracking-wider">Emergency Contact</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-1.5">Name</label>
                    <input type="text" value={fighter.emergencyName} onChange={(e) => updateField("emergencyName", e.target.value)} placeholder="Full name" className="input-premium text-sm font-semibold text-slate-800" />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-1.5">Relationship</label>
                    <input type="text" value={fighter.emergencyRelation} onChange={(e) => updateField("emergencyRelation", e.target.value)} placeholder="e.g. Brother" className="input-premium text-sm font-semibold text-slate-800" />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-1.5">Phone</label>
                    <input type="tel" value={fighter.emergencyPhone} onChange={(e) => updateField("emergencyPhone", e.target.value)} placeholder="+855" className="input-premium text-sm font-semibold text-slate-800" />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Medical Profile */}
          <div className="card-premium">
            <h2 className="text-base font-bold text-foreground mb-4 flex items-center gap-2">
              <HeartPulse className="w-5 h-5 text-emerald-500" />
              Medical Profile
            </h2>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">
                    Blood Type <span className="text-secondary">*</span>
                  </label>
                  <div className="relative">
                    <select
                      value={fighter.bloodType}
                      onChange={(e) => updateField("bloodType", e.target.value)}
                      className="input-premium font-bold text-secondary text-lg text-center cursor-pointer appearance-none"
                    >
                      {["O+", "O-", "A+", "A-", "B+", "B-", "AB+", "AB-"].map((bt) => (
                        <option key={bt}>{bt}</option>
                      ))}
                    </select>
                    <ChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">
                    Last Medical Check
                  </label>
                  <input type="date" value={fighter.lastMedicalCheck} onChange={(e) => updateField("lastMedicalCheck", e.target.value)} className="input-premium font-semibold text-slate-800" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">
                    Clearance Expiry
                  </label>
                  <input type="date" value={fighter.medicalExpiry} onChange={(e) => updateField("medicalExpiry", e.target.value)} className="input-premium font-semibold text-slate-800" />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">Medical Conditions</label>
                  <textarea value={fighter.medicalConditions} onChange={(e) => updateField("medicalConditions", e.target.value)} rows={3} placeholder="List any known conditions or 'None'" className="input-premium font-semibold text-slate-800 resize-none" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">Known Allergies</label>
                  <textarea value={fighter.allergies} onChange={(e) => updateField("allergies", e.target.value)} rows={3} placeholder="List any allergies or 'None'" className="input-premium font-semibold text-slate-800 resize-none" />
                </div>
              </div>
            </div>
          </div>

          {/* Combat Profile */}
          <div className="card-premium">
            <h2 className="text-base font-bold text-foreground mb-4 flex items-center gap-2">
              <Dumbbell className="w-5 h-5 text-secondary" />
              Combat Profile
            </h2>
            <div className="space-y-4">
              {/* Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { field: "weight", label: "Weight (kg)", req: true },
                  { field: "height", label: "Height (cm)", req: false },
                  { field: "reach", label: "Reach (cm)", req: false },
                  { field: "experience", label: "Experience (Yrs)", req: false },
                ].map(({ field, label, req }) => (
                  <div key={field}>
                    <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">
                      {label} {req && <span className="text-secondary">*</span>}
                    </label>
                    <input
                      type="number"
                      step={field === "weight" ? "0.1" : "1"}
                      value={fighter[field as keyof typeof fighter] as string}
                      onChange={(e) => updateField(field, e.target.value)}
                      onBlur={req ? () => handleBlur(field) : undefined}
                      placeholder="0"
                      className={`input-premium font-bold text-xl text-center ${errors[field] && touched[field] ? "border-secondary!" : ""}`}
                    />
                    {errors[field] && touched[field] && (
                      <p className="text-xs text-secondary mt-1 flex items-center gap-1 justify-center">
                        <AlertCircle className="w-3 h-3" /> {errors[field]}
                      </p>
                    )}
                  </div>
                ))}
              </div>

              {/* Weight Range & Record */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">
                    Weight Range
                  </label>
                  <div className="relative">
                    <select
                      value={fighter.weightClass}
                      onChange={(e) => updateField("weightClass", e.target.value)}
                      className="input-premium font-semibold text-slate-800 cursor-pointer appearance-none"
                    >
                      <option value="">Select Weight Range</option>
                      {WEIGHT_RANGES.map(range => (
                        <option key={range} value={range}>{range}</option>
                      ))}
                    </select>
                    <ChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">
                    Fight Record
                  </label>
                  <input
                    type="text"
                    value={fighter.record}
                    onChange={(e) => updateField("record", e.target.value)}
                    placeholder="W-L-D (e.g. 10-2-1)"
                    className="input-premium font-semibold text-slate-800 font-mono tracking-widest"
                  />
                  <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                    <Info className="w-3 h-3" /> Format: Wins-Losses-Draws
                  </p>
                </div>
              </div>

              {/* Club / Gym */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">
                    Club / Gym <span className="text-secondary">*</span>
                  </label>
                  <div className="relative">
                    <select
                      value={fighter.clubId}
                      disabled={isClubUser}
                      title={isClubUser ? "Fighters you register always belong to your club" : undefined}
                      onChange={(e) => {
                        const club = clubs.find((c) => c.id === e.target.value);
                        setFighter((p) => ({
                          ...p,
                          clubId: e.target.value,
                          gym: club ? club.name : "",
                          trainer: club ? club.head_coach || club.headCoach : "",
                          promoter: p.promoter || (club ? club.head_coach || club.headCoach : ""),
                        }));
                        setTouched((p) => ({ ...p, clubId: true }));
                      }}
                      onBlur={() => handleBlur("clubId")}
                      className={`input-premium font-semibold text-slate-800 cursor-pointer appearance-none ${errors.clubId && touched.clubId ? "border-secondary!" : ""}`}
                    >
                      <option value="" disabled>Select Club / Gym</option>
                      {clubs.map((c) => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                      ))}
                    </select>
                    <ChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  </div>
                  {errors.clubId && touched.clubId && (
                    <p className="text-xs text-secondary mt-1 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" /> {errors.clubId}
                    </p>
                  )}
                  {fighter.clubId && !errors.clubId && (
                    <p className="text-xs text-green-600 mt-1 flex items-center gap-1 font-semibold">
                      <CheckCircle2 className="w-3 h-3" /> Club assigned
                    </p>
                  )}
                </div>
                <div>
                  <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">
                    Head Coach / Trainer
                  </label>
                  <input
                    type="text"
                    value={fighter.trainer}
                    readOnly
                    placeholder="Auto-filled from club"
                    className="input-premium font-semibold text-slate-800 bg-muted/40 cursor-not-allowed"
                  />
                  <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                    <Info className="w-3 h-3" /> Automatically assigned from selected club
                  </p>
                </div>
              </div>

              {/* Promoter */}
              <div>
                <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  Promoter
                  <span className="text-[10px] text-muted-foreground font-normal normal-case tracking-normal">
                    (defaults to head coach if empty)
                  </span>
                </label>
                <input
                  type="text"
                  value={fighter.promoter}
                  onChange={(e) => updateField("promoter", e.target.value)}
                  placeholder={fighter.trainer ? `Default: ${fighter.trainer}` : "Enter promoter name"}
                  disabled={!fighter.clubId}
                  className="input-premium font-semibold text-slate-800 disabled:opacity-50 disabled:cursor-not-allowed"
                />
              </div>

              {/* Fighting Styles */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider">
                    Fighting Styles <span className="text-secondary">*</span>
                    <span className="ml-1 font-normal normal-case tracking-normal">(select all that apply)</span>
                  </label>
                  {fighter.styles.length > 0 && (
                    <span className="text-xs font-bold text-green-600 flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" /> {fighter.styles.length} selected
                    </span>
                  )}
                </div>
                {errors.styles && touched.styles && (
                  <div className="mb-3 p-2.5 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-secondary shrink-0" />
                    <p className="text-xs font-semibold text-secondary">{errors.styles}</p>
                  </div>
                )}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {FIGHTING_STYLES.map((style) => {
                    const isSelected = fighter.styles.includes(style.id);
                    return (
                      <label
                        key={style.id}
                        className={`relative flex items-center gap-3 p-3.5 rounded-xl border-2 cursor-pointer transition-all ${
                          isSelected
                            ? "border-primary bg-primary/5 shadow-sm"
                            : "border-border bg-white hover:border-primary/40 hover:bg-muted/20"
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={(e) => {
                            const ns = e.target.checked
                              ? [...fighter.styles, style.id]
                              : fighter.styles.filter((s) => s !== style.id);
                            updateField("styles", ns);
                            setTouched((p) => ({ ...p, styles: true }));
                          }}
                          className="w-4 h-4 rounded border-border text-primary focus:ring-2 focus:ring-primary/20"
                        />
                        <div className="flex-1">
                          <span className={`block text-sm font-bold ${isSelected ? "text-primary" : "text-foreground"}`}>
                            {style.label}
                          </span>
                          <span className="block text-xs text-muted-foreground">{style.subtitle}</span>
                        </div>
                        {isSelected && <CheckCircle2 className="w-4 h-4 text-primary shrink-0" />}
                      </label>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* Legal Compliance */}
          <div className="card-premium bg-gradient-to-br from-slate-900 to-primary text-white border-0">
            <h2 className="text-base font-bold text-white mb-4 flex items-center gap-2">
              <FileText className="w-5 h-5 text-amber-400" />
              Legal Compliance
              <span className="text-xs font-normal text-white/60 ml-1">— Required declarations & consent</span>
            </h2>
            <div className="space-y-3">
              {[
                {
                  field: "termsAccepted",
                  label: "Accept Terms & Conditions",
                  desc: "I verify that all identity, contact, and background information provided is true and accurate.",
                  accent: "white",
                },
                {
                  field: "consentCompete",
                  label: "Consent to Compete",
                  desc: "I voluntarily consent to participate in Kun Khmer combat sports and understand the physical risks involved.",
                  accent: "white",
                },
                {
                  field: "medicalFitness",
                  label: "Medical Fitness Declaration",
                  desc: "I declare that I am medically fit to compete and do not carry communicable diseases.",
                  accent: "amber",
                },
              ].map(({ field, label, desc, accent }) => (
                <label
                  key={field}
                  className={`flex items-start gap-4 p-4 rounded-xl border cursor-pointer transition-all ${
                    accent === "amber"
                      ? "border-amber-400/30 bg-amber-400/5 hover:bg-amber-400/10"
                      : "border-white/10 bg-white/5 hover:bg-white/10"
                  }`}
                >
                  <input
                    type="checkbox"
                    required
                    checked={fighter[field as keyof typeof fighter] as boolean}
                    onChange={(e) => updateField(field, e.target.checked)}
                    className="w-5 h-5 rounded border-white/30 bg-black/50 text-secondary focus:ring-secondary focus:ring-offset-slate-900 mt-0.5 shrink-0"
                  />
                  <div>
                    <p className={`text-sm font-bold mb-0.5 ${accent === "amber" ? "text-amber-400" : "text-white"}`}>
                      {label} <span className="text-secondary">*</span>
                    </p>
                    <p className="text-xs text-white/60 leading-relaxed">{desc}</p>
                  </div>
                </label>
              ))}
            </div>
          </div>

        </div>

        {/* ── Right / Sidebar ── */}
        <div className="lg:col-span-1 space-y-6">
          <div className="sticky top-6 space-y-6">

            {/* Fighter Photo */}
            <div className="card-premium">
              <h3 className="text-sm font-bold text-foreground mb-3 flex items-center gap-2">
                <Upload className="w-4 h-4 text-primary" />
                {isKunKhmer ? (
                  <><Crown className="w-4 h-4 text-amber-500" /> Fighter Photo</>
                ) : (
                  "Fighter Photo"
                )}
              </h3>
              <input ref={photoInputRef} type="file" accept="image/*" onChange={handlePhotoChange} className="hidden" id="photo-upload" />
              {!photoPreview ? (
                <label
                  htmlFor="photo-upload"
                  className="flex flex-col items-center justify-center w-full h-48 border border-border/80 border-dashed rounded-xl cursor-pointer bg-muted/10 hover:bg-muted/20 transition-all"
                >
                  <Upload className="w-7 h-7 text-muted-foreground mb-2" />
                  <p className="text-xs font-semibold text-slate-700">
                    <span className="text-primary hover:underline">Click to upload</span> or drag
                  </p>
                  <p className="text-[10px] text-muted-foreground mt-0.5">JPG or PNG (max 5MB)</p>
                </label>
              ) : (
                <div className="relative w-full h-48 rounded-xl overflow-hidden border border-border/60 shadow-sm">
                  <img src={photoPreview} alt="Preview" className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={removePhoto}
                    className="absolute top-2 right-2 p-1.5 bg-secondary/90 hover:bg-secondary text-white rounded-lg transition-colors shadow-md"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
            </div>

            {/* Quick Summary */}
            <div className="card-premium">
              <h3 className="text-sm font-bold text-foreground mb-3 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-primary" />
                Quick Summary
              </h3>
              <div className="space-y-2 text-sm">
                {[
                  { label: "Name", val: fighter.nameEN || fighter.nameKH || "—" },
                  { label: "Age", val: fighter.dob ? `${calculateAge(fighter.dob)} yrs` : "—" },
                  { label: "Weight", val: fighter.weight ? `${fighter.weight} kg` : "—" },
                  { label: "Range", val: fighter.weightClass || "—" },
                  { label: "Record", val: fighter.record || "—" },
                  { label: "Club", val: fighter.gym || "—" },
                  { label: "Styles", val: fighter.styles.length ? `${fighter.styles.length} selected` : "—" },
                ].map(({ label, val }) => (
                  <div key={label} className="flex justify-between items-center py-1.5 border-b border-border/40 last:border-0">
                    <span className="text-muted-foreground font-medium">{label}</span>
                    <span className="font-semibold text-foreground truncate ml-2">{val}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Status (KKF staff only) */}
            {!isStaff ? (
              <div className="card-premium space-y-2">
                <h3 className="text-sm font-bold text-foreground">KKF verification</h3>
                {reviewNote ? (
                  <p className="text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg p-3">
                    <strong>KKF sent this fighter back:</strong> {reviewNote}
                    <br />Fix the details and save — it goes back to KKF automatically.
                  </p>
                ) : (
                  <p className="text-sm text-slate-600">
                    {fighter.status === "Active" ? "Verified by KKF." : "After you save, KKF checks this fighter. They can't be matched until they're verified."}
                  </p>
                )}
              </div>
            ) : (
            <div className="card-premium">
              <h3 className="text-sm font-bold text-foreground mb-3">Status</h3>
              <div className="relative">
                <select value={fighter.status} onChange={(e) => updateField("status", e.target.value)} className="input-premium font-semibold text-slate-800 cursor-pointer appearance-none">
                  <option value="Draft">Draft</option>
                  <option value="Pending KKF Verification">Pending KKF Verification</option>
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                  <option value="Suspended">Suspended</option>
                  <option value="Rejected">Sent back</option>
                </select>
                <ChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              </div>
            </div>
            )}

            {/* Form Actions */}
            <div className="bg-white rounded-xl border border-border p-4 shadow-sm flex flex-col gap-3">
              <button type="submit" className="btn-primary w-full py-3">
                <Save className="w-4 h-4 animate-pulse" />
                {isEditMode ? "Update Fighter" : "Save Fighter"}
              </button>
              <Link to="/home/fighters" className="btn-outline w-full py-3">
                Cancel
              </Link>
            </div>

          </div>
        </div>
      </form>
    </div>
  );
}