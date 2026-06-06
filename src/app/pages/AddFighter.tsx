import { useState, useRef, useEffect } from "react";
import { useNavigate, useParams, useLocation } from "react-router";
import { ArrowLeft, Save, Upload, X, User, FileText, MapPin, HeartPulse, Dumbbell, Shield, Activity, CheckCircle2, AlertCircle, FileCheck, Clock, Crown, Info, Building2, Users } from "lucide-react";
import { MOCK_FIGHTERS, MOCK_CLUBS } from "../data/mock";
import { usePermissions } from "../hooks/usePermissions";

const NATIONALITIES = [
  "Thai", "Vietnamese", "Lao", "Myanmar", "Indonesian", "Malaysian", "Filipino", "Japanese", 
  "Korean", "Chinese", "Indian", "Australian", "American", "British", "French", "German",
  "Russian", "Brazilian", "Other"
];

const FIGHTING_STYLES = [
  { id: "aggressive", label: "Aggressive", subtitle: "Pressure Fighter" },
  { id: "clinch", label: "Clinch Master", subtitle: "Knees/Elbows" },
  { id: "counter", label: "Counter Fighter", subtitle: "Technical" },
  { id: "balanced", label: "Balanced", subtitle: "All-Rounder" },
  { id: "kicking", label: "Kicking", subtitle: "Long Range" },
  { id: "boxing", label: "Boxing", subtitle: "Hands Heavy" }
];

export function AddFighter() {
  const navigate = useNavigate();
  const location = useLocation();
  const { id } = useParams();
  const photoInputRef = useRef<HTMLInputElement>(null);
  const docInputRef = useRef<HTMLInputElement>(null);
  
  // Determine fighter type from URL
  const isKunKhmer = location.pathname.includes('/kunkhmer');
  const isForeigner = location.pathname.includes('/foreigner');
  
  const isEditMode = !!id;
  const existingFighter = isEditMode ? MOCK_FIGHTERS.find(f => f.id === id) : null;
  
  const [fighter, setFighter] = useState({
    // Personal Information
    nameEN: "", nameKH: "", alias: "", dob: "", pob: "", nationality: isKunKhmer ? "Cambodia" : "", gender: "Male",
    // KYC Documents
    idType: "National ID", idNumber: "", idExpiry: "", idDocumentUrl: "",
    // Contact Details
    phone1: "", email: "", address: "", city: "",
    emergencyName: "", emergencyRelation: "", emergencyPhone: "",
    // Medical Information
    bloodType: "O+", lastMedicalCheck: "", medicalExpiry: "", 
    medicalConditions: "None", allergies: "None",
    // Combat Profile
    weight: "", height: "", reach: "", experience: "0", 
    styles: [] as string[], type: "Amateur", grade: "D", origin: isKunKhmer ? "Local" : "Foreigner",
    gym: "", clubId: "", trainer: "", promoter: "",
    // System
    image: "", status: "Active",
    termsAccepted: false, consentCompete: false, medicalFitness: false
  });
  
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [docPreview, setDocPreview] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  // Load existing fighter data in edit mode
  useEffect(() => {
    if (isEditMode && existingFighter) {
      setFighter({
        nameEN: existingFighter.name || "",
        nameKH: "",
        alias: existingFighter.alias || "",
        dob: "",
        pob: "",
        nationality: existingFighter.origin === "Local" ? "Cambodia" : "",
        gender: "Male",
        idType: "National ID",
        idNumber: "",
        idExpiry: "",
        idDocumentUrl: "",
        phone1: "",
        email: "",
        address: "",
        city: "",
        emergencyName: "",
        emergencyRelation: "",
        emergencyPhone: "",
        bloodType: "O+",
        lastMedicalCheck: "",
        medicalExpiry: "",
        medicalConditions: "None",
        allergies: "None",
        weight: existingFighter.weight?.toString() || "",
        height: "",
        reach: "",
        experience: "0",
        styles: existingFighter.style ? [existingFighter.style.toLowerCase()] : [],
        type: existingFighter.type || "Amateur",
        grade: existingFighter.grade || "D",
        origin: existingFighter.origin || "Local",
        gym: existingFighter.gym || "",
        clubId: existingFighter.clubId || "",
        trainer: "",
        promoter: "",
        image: existingFighter.image || "",
        status: existingFighter.status || "Active",
        termsAccepted: true,
        consentCompete: true,
        medicalFitness: true
      });
      if (existingFighter.image) {
        setPhotoPreview(existingFighter.image);
      }
    }
  }, [isEditMode, id]);

  const calculateAge = (dob: string) => {
    if (!dob) return "--";
    const diff = Date.now() - new Date(dob).getTime();
    return Math.abs(new Date(diff).getUTCFullYear() - 1970);
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const objectUrl = URL.createObjectURL(file);
      setPhotoPreview(objectUrl);
      setFighter({...fighter, image: objectUrl});
    }
  };

  const handleDocChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const objectUrl = URL.createObjectURL(file);
      setDocPreview(objectUrl);
      setFighter({...fighter, idDocumentUrl: objectUrl});
    }
  };

  const removePhoto = () => {
    if (photoPreview) URL.revokeObjectURL(photoPreview);
    setPhotoPreview(null);
    setFighter({...fighter, image: ""});
    if (photoInputRef.current) photoInputRef.current.value = "";
  };

  const removeDoc = () => {
    if (docPreview) URL.revokeObjectURL(docPreview);
    setDocPreview(null);
    setFighter({...fighter, idDocumentUrl: ""});
    if (docInputRef.current) docInputRef.current.value = "";
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate club/gym selection
    if (!fighter.clubId || fighter.clubId === "") {
      alert("Please select a Training Camp / Gym for the fighter.");
      return;
    }
    
    if (!fighter.termsAccepted || !fighter.consentCompete || !fighter.medicalFitness) {
      alert("Please accept all legal & compliance terms before saving.");
      return;
    }

    const finalImage = fighter.image || "https://images.unsplash.com/photo-1601039834001-7d32a613c60d?auto=format&fit=crop&q=80&w=600";
    
    const fighterData = { 
      id: isEditMode && existingFighter ? existingFighter.id : `f${Date.now()}`,
      name: fighter.nameEN || fighter.nameKH,
      alias: fighter.alias || "The Warrior",
      weight: parseFloat(fighter.weight) || 0,
      record: isEditMode && existingFighter ? existingFighter.record : "0-0-0",
      gym: fighter.gym,
      clubId: fighter.clubId,
      origin: fighter.origin,
      type: fighter.type,
      grade: fighter.grade,
      style: fighter.styles.join(", "),
      image: finalImage,
      status: fighter.status
    };
    
    if (isEditMode && existingFighter) {
      const index = MOCK_FIGHTERS.findIndex(f => f.id === existingFighter.id);
      if (index !== -1) {
        MOCK_FIGHTERS[index] = fighterData;
      }
      navigate(`/home/fighters/${existingFighter.id}`);
    } else {
      MOCK_FIGHTERS.push(fighterData);
      navigate("/home/fighters");
    }
  };

  const updateField = (field: string, value: any) => {
    setFighter(prev => ({ ...prev, [field]: value }));
    // Clear error when user updates field
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const validateField = (field: string, value: any) => {
    let error = "";
    
    switch(field) {
      case "nameEN":
      case "nameKH":
        if (!value || value.trim() === "") {
          error = "This field is required";
        }
        break;
      case "dob":
        if (!value) {
          error = "Date of birth is required";
        }
        break;
      case "weight":
        if (!value || parseFloat(value) <= 0) {
          error = "Valid weight is required";
        } else if (parseFloat(value) < 40 || parseFloat(value) > 150) {
          error = "Weight must be between 40-150 kg";
        }
        break;
      case "clubId":
        if (!value || value === "") {
          error = "Training Camp/Gym selection is required";
        }
        break;
      case "phone1":
        if (!value || value.trim() === "") {
          error = "Phone number is required";
        }
        break;
      case "idNumber":
        if (!value || value.trim() === "") {
          error = "ID number is required";
        }
        break;
      case "styles":
        if (!value || value.length === 0) {
          error = "Select at least one fighting style";
        }
        break;
    }
    
    return error;
  };

  const handleBlur = (field: string) => {
    setTouched(prev => ({ ...prev, [field]: true }));
    const error = validateField(field, fighter[field as keyof typeof fighter]);
    if (error) {
      setErrors(prev => ({ ...prev, [field]: error }));
    }
  };

  const getFormProgress = () => {
    const requiredFields = [
      'nameEN', 'nameKH', 'dob', 'pob', 'nationality',
      'idNumber', 'idExpiry', 'phone1', 'weight', 'clubId'
    ];
    const completed = requiredFields.filter(field => {
      const value = fighter[field as keyof typeof fighter];
      return value && value !== "";
    }).length;
    return Math.round((completed / requiredFields.length) * 100);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F4F5F8] via-white to-[#F9FAFB] pb-24">
      {/* Sticky Header */}
      <div className="sticky top-0 z-50 bg-white/95 backdrop-blur-xl border-b-2 border-[#E0E0E0]/50 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="flex-1">
              <button 
                onClick={() => navigate("/home/fighters")}
                className="inline-flex items-center gap-2 text-[#707070] hover:text-[#0A3D91] font-bold text-sm mb-3 transition-colors group"
              >
                <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" /> 
                Back to Fighters
              </button>
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-gradient-to-br from-[#0A3D91] to-[#051C42] rounded-2xl flex items-center justify-center shadow-xl">
                  {isKunKhmer ? (
                    <Crown className="w-7 h-7 text-[#F2C94C]" />
                  ) : (
                    <User className="w-7 h-7 text-white" />
                  )}
                </div>
                <div className="flex-1">
                  <h1 className="text-3xl md:text-4xl font-black tracking-tight text-[#1A1A24] leading-none">
                    {isEditMode ? 'Edit Fighter' : isKunKhmer ? 'Register Kun Khmer Fighter' : 'Register Foreign Fighter'}
                  </h1>
                  <p className="text-[#707070] font-medium text-sm mt-1">
                    {isEditMode ? 'Update fighter information' : 'Complete all required fields to register the fighter'}
                  </p>
                </div>
              </div>
            </div>
            <div className="flex gap-3 w-full sm:w-auto">
              <button 
                onClick={() => navigate("/home/fighters")} 
                type="button" 
                className="px-6 py-3 rounded-xl font-bold bg-white border-2 border-[#E0E0E0] text-[#1A1A24] hover:bg-[#F4F5F8] hover:border-[#707070] transition-all flex-1 sm:flex-none"
              >
                Cancel
              </button>
              <button 
                onClick={handleSubmit}
                className="inline-flex items-center justify-center gap-2 bg-gradient-to-r from-[#C8102E] to-[#A00D24] hover:from-[#A00D24] hover:to-[#8A0B20] text-white px-8 py-3 rounded-xl font-bold transition-all shadow-lg hover:shadow-xl hover:scale-[1.02] flex-1 sm:flex-none"
              >
                <Save className="w-5 h-5" /> Save Fighter
              </button>
            </div>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Validation Summary */}
        {Object.keys(errors).length > 0 && (
          <div className="mb-6 p-5 bg-red-50 border-2 border-[#C8102E] rounded-2xl shadow-lg">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 bg-[#C8102E] rounded-xl flex items-center justify-center shrink-0">
                <AlertCircle className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-black text-[#C8102E] mb-2">Please review the following issues:</h3>
                <ul className="space-y-1.5">
                  {Object.entries(errors).map(([field, error]) => (
                    <li key={field} className="text-sm font-semibold text-[#1A1A24] flex items-start gap-2">
                      <span className="text-[#C8102E]">•</span>
                      <span className="capitalize">{field.replace(/([A-Z])/g, ' $1').trim()}:</span>
                      <span className="text-[#707070]">{error}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* Fighter Type Selection - First Step */}
        <div className="mb-6 bg-gradient-to-br from-[#C8102E] to-[#A00D24] rounded-2xl shadow-2xl border-2 border-[#C8102E] overflow-hidden">
          <div className="px-6 py-4 border-b border-white/10">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                <Shield className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-black text-white uppercase tracking-tight">Step 1: Fighter Type</h2>
                <p className="text-xs text-white/80 font-medium">Select the fighter classification first</p>
              </div>
            </div>
          </div>

          <div className="p-6">
            <div className="grid grid-cols-2 gap-4">
              {['Amateur', 'Professional'].map(type => (
                <button
                  key={type}
                  type="button"
                  onClick={() => updateField('type', type)}
                  className={`relative px-8 py-6 rounded-2xl font-black text-lg transition-all border-3 ${
                    fighter.type === type
                      ? 'bg-white text-[#C8102E] border-white shadow-2xl scale-[1.05]'
                      : 'bg-white/10 text-white border-white/20 hover:bg-white/20 hover:border-white/40 hover:shadow-lg'
                  }`}
                >
                  {type}
                  {fighter.type === type && (
                    <CheckCircle2 className="w-6 h-6 absolute top-3 right-3" />
                  )}
                </button>
              ))}
            </div>

            {fighter.type && (
              <div className="mt-4 p-4 bg-white/10 rounded-xl border border-white/20">
                <div className="flex items-start gap-3">
                  <Info className="w-5 h-5 text-[#F2C94C] mt-0.5 shrink-0" />
                  <div className="text-sm text-white/90 leading-relaxed">
                    {fighter.type === 'Amateur' ? (
                      <>
                        <p className="font-bold mb-1">Amateur Fighter Requirements:</p>
                        <p className="text-xs text-white/70">For fighters under 18 years old, only a birth certificate is required for registration.</p>
                      </>
                    ) : (
                      <>
                        <p className="font-bold mb-1">Professional Fighter Requirements:</p>
                        <p className="text-xs text-white/70">Full documentation including National ID or Passport is required for all professional fighters.</p>
                      </>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Sidebar: Photo & Summary */}
          <div className="lg:col-span-1 order-1 lg:order-2">
            <div className="sticky top-32 space-y-6">
              {/* Photo Upload Card */}
              <div className="bg-white rounded-2xl shadow-[0_8px_30px_rgba(0,0,0,0.08)] border-2 border-[#E0E0E0]/50 overflow-hidden">
                <div className="p-5 bg-gradient-to-r from-[#F4F5F8] to-white border-b-2 border-[#E0E0E0]">
                  <h3 className="text-lg font-black uppercase tracking-tight text-[#1A1A24]">Fighter Photo</h3>
                  <p className="text-xs text-[#707070] font-medium mt-0.5">Clear headshot required</p>
                </div>
                
                <div className="p-5">
                  <input 
                    ref={photoInputRef}
                    type="file" 
                    accept="image/*" 
                    onChange={handlePhotoChange} 
                    className="hidden" 
                    id="photo-upload"
                  />
                  
                  {!photoPreview ? (
                    <label 
                      htmlFor="photo-upload" 
                      className="flex flex-col items-center justify-center h-72 border-3 border-dashed border-[#E0E0E0] rounded-2xl cursor-pointer hover:border-[#0A3D91] hover:bg-[#F4F5F8] transition-all group"
                    >
                      <div className="w-16 h-16 bg-[#F4F5F8] rounded-full flex items-center justify-center mb-4 group-hover:bg-[#0A3D91] transition-all">
                        <Upload className="w-8 h-8 text-[#707070] group-hover:text-white transition-all" />
                      </div>
                      <p className="text-sm font-bold text-[#1A1A24] mb-1">Click to upload</p>
                      <p className="text-xs text-[#707070]">JPG or PNG (max 5MB)</p>
                    </label>
                  ) : (
                    <div className="relative">
                      <div className="relative h-72 rounded-2xl overflow-hidden border-3 border-[#E0E0E0] bg-[#F4F5F8] shadow-xl">
                        <img src={photoPreview} alt="Preview" className="w-full h-full object-cover" />
                      </div>
                      <button 
                        type="button" 
                        onClick={removePhoto} 
                        className="absolute top-3 right-3 w-10 h-10 bg-[#C8102E] hover:bg-[#A00D24] text-white rounded-full flex items-center justify-center shadow-lg transition-all hover:scale-110"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Quick Summary Card */}
              <div className="bg-gradient-to-br from-[#0A3D91] to-[#051C42] rounded-2xl p-6 text-white shadow-xl border-2 border-[#0A3D91]">
                <h3 className="text-lg font-black uppercase tracking-tight mb-4 flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-[#F2C94C]" />
                  Quick Summary
                </h3>
                <div className="space-y-2.5 text-sm">
                  <div className="flex justify-between items-center py-2 border-b border-white/20">
                    <span className="text-white/70 font-medium">Name:</span>
                    <span className="font-bold truncate ml-2">{fighter.nameEN || fighter.nameKH || "Not set"}</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-white/20">
                    <span className="text-white/70 font-medium">Age:</span>
                    <span className="font-bold">{calculateAge(fighter.dob)} years</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-white/20">
                    <span className="text-white/70 font-medium">Weight:</span>
                    <span className="font-bold font-mono">{fighter.weight || "0.0"} kg</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-white/20">
                    <span className="text-white/70 font-medium">Club:</span>
                    <span className={`font-bold truncate ml-2 ${fighter.clubId ? 'text-[#F2C94C]' : 'text-white/50'}`}>
                      {fighter.gym || "Not assigned"}
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-white/20">
                    <span className="text-white/70 font-medium">Type:</span>
                    <span className="font-bold">{fighter.type}</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-white/20">
                    <span className="text-white/70 font-medium">Origin:</span>
                    <span className="font-bold">{fighter.origin}</span>
                  </div>
                  <div className="flex justify-between items-center py-2">
                    <span className="text-white/70 font-medium">Styles:</span>
                    <span className="font-bold">{fighter.styles.length || 0} selected</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Main Form Area */}
          <div className="lg:col-span-2 order-2 lg:order-1 space-y-6">
            
            {/* Section 1: Personal Information */}
            <div className="bg-white rounded-2xl shadow-[0_8px_30px_rgba(0,0,0,0.08)] border-2 border-[#E0E0E0]/50 overflow-hidden">
              <div className="bg-gradient-to-r from-[#0A3D91] to-[#082F6E] px-6 py-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                    <User className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h2 className="text-xl font-black text-white uppercase tracking-tight">Personal Information</h2>
                    <p className="text-xs text-white/80 font-medium">Basic identity & biographical data</p>
                  </div>
                </div>
              </div>
              
              <div className="p-6 space-y-5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-black text-[#707070] uppercase tracking-wider mb-2">
                      Full Name (English) <span className="text-[#C8102E]">*</span>
                    </label>
                    <input 
                      required 
                      type="text" 
                      value={fighter.nameEN} 
                      onChange={(e) => updateField('nameEN', e.target.value)}
                      onBlur={() => handleBlur('nameEN')}
                      className={`w-full bg-[#F4F5F8] border-2 rounded-xl px-4 py-3 text-[#1A1A24] font-semibold focus:ring-2 transition-all placeholder:text-[#B0B0B0] ${
                        errors.nameEN && touched.nameEN 
                          ? 'border-[#C8102E] focus:border-[#C8102E] focus:ring-[#C8102E]/20' 
                          : 'border-[#E0E0E0] focus:border-[#0A3D91] focus:ring-[#0A3D91]/20'
                      }`}
                      placeholder="e.g. Prom Samnang" 
                    />
                    {errors.nameEN && touched.nameEN && (
                      <p className="text-xs text-[#C8102E] font-semibold mt-1.5 flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" /> {errors.nameEN}
                      </p>
                    )}
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-[#707070] uppercase tracking-wider mb-2">
                      Full Name (Khmer) <span className="text-[#C8102E]">*</span>
                    </label>
                    <input 
                      required 
                      type="text" 
                      value={fighter.nameKH} 
                      onChange={(e) => updateField('nameKH', e.target.value)}
                      onBlur={() => handleBlur('nameKH')}
                      className={`w-full bg-[#F4F5F8] border-2 rounded-xl px-4 py-3 text-[#1A1A24] font-semibold focus:ring-2 transition-all placeholder:text-[#B0B0B0] ${
                        errors.nameKH && touched.nameKH 
                          ? 'border-[#C8102E] focus:border-[#C8102E] focus:ring-[#C8102E]/20' 
                          : 'border-[#E0E0E0] focus:border-[#0A3D91] focus:ring-[#0A3D91]/20'
                      }`}
                      placeholder="ព្រំ សំណាង" 
                    />
                    {errors.nameKH && touched.nameKH && (
                      <p className="text-xs text-[#C8102E] font-semibold mt-1.5 flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" /> {errors.nameKH}
                      </p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-[10px] font-black text-[#707070] uppercase tracking-wider mb-2">
                      Fighter Alias
                    </label>
                    <input 
                      type="text" 
                      value={fighter.alias} 
                      onChange={(e) => updateField('alias', e.target.value)} 
                      className="w-full bg-[#F4F5F8] border-2 border-[#E0E0E0] rounded-xl px-4 py-3 text-[#1A1A24] font-semibold focus:ring-2 focus:ring-[#0A3D91] focus:border-[#0A3D91] transition-all placeholder:text-[#B0B0B0]" 
                      placeholder="The Tiger" 
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-[#707070] uppercase tracking-wider mb-2">
                      Date of Birth <span className="text-[#C8102E]">*</span>
                    </label>
                    <input 
                      required 
                      type="date" 
                      value={fighter.dob} 
                      onChange={(e) => updateField('dob', e.target.value)}
                      onBlur={() => handleBlur('dob')}
                      className={`w-full bg-[#F4F5F8] border-2 rounded-xl px-4 py-3 text-[#1A1A24] font-semibold focus:ring-2 transition-all ${
                        errors.dob && touched.dob 
                          ? 'border-[#C8102E] focus:border-[#C8102E] focus:ring-[#C8102E]/20' 
                          : 'border-[#E0E0E0] focus:border-[#0A3D91] focus:ring-[#0A3D91]/20'
                      }`}
                    />
                    {errors.dob && touched.dob ? (
                      <p className="text-xs text-[#C8102E] font-semibold mt-1.5 flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" /> {errors.dob}
                      </p>
                    ) : fighter.dob && (
                      <p className="text-xs text-[#0A3D91] font-bold mt-1.5 flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" /> Age: {calculateAge(fighter.dob)} years
                      </p>
                    )}
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-[#707070] uppercase tracking-wider mb-2">
                      Gender <span className="text-[#C8102E]">*</span>
                    </label>
                    <select 
                      value={fighter.gender} 
                      onChange={(e) => updateField('gender', e.target.value)} 
                      className="w-full bg-[#F4F5F8] border-2 border-[#E0E0E0] rounded-xl px-4 py-3 text-[#1A1A24] font-semibold focus:ring-2 focus:ring-[#0A3D91] focus:border-[#0A3D91] transition-all"
                    >
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-black text-[#707070] uppercase tracking-wider mb-2">
                      Place of Birth <span className="text-[#C8102E]">*</span>
                    </label>
                    <input 
                      required 
                      type="text" 
                      value={fighter.pob} 
                      onChange={(e) => updateField('pob', e.target.value)} 
                      className="w-full bg-[#F4F5F8] border-2 border-[#E0E0E0] rounded-xl px-4 py-3 text-[#1A1A24] font-semibold focus:ring-2 focus:ring-[#0A3D91] focus:border-[#0A3D91] transition-all placeholder:text-[#B0B0B0]" 
                      placeholder="e.g. Kampong Speu" 
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-[#707070] uppercase tracking-wider mb-2">
                      Nationality <span className="text-[#C8102E]">*</span>
                    </label>
                    {isKunKhmer ? (
                      <div className="w-full bg-gradient-to-r from-blue-50 to-blue-100 border-2 border-blue-300 rounded-xl px-4 py-3 text-[#0A3D91] font-black flex items-center justify-between">
                        <span>Cambodia</span>
                        <span className="text-xs bg-blue-500 text-white px-2 py-1 rounded-lg uppercase tracking-wider">Kun Khmer</span>
                      </div>
                    ) : (
                      <select 
                        value={fighter.nationality} 
                        onChange={(e) => updateField('nationality', e.target.value)} 
                        className="w-full bg-[#F4F5F8] border-2 border-[#E0E0E0] rounded-xl px-4 py-3 text-[#1A1A24] font-semibold focus:ring-2 focus:ring-[#0A3D91] focus:border-[#0A3D91] transition-all"
                      >
                        <option value="" disabled>Select Nationality</option>
                        {NATIONALITIES.map(nat => (
                          <option key={nat} value={nat}>{nat}</option>
                        ))}
                      </select>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Section 2: KYC Documents */}
            <div className="bg-white rounded-2xl shadow-[0_8px_30px_rgba(0,0,0,0.08)] border-2 border-[#E0E0E0]/50 overflow-hidden">
              <div className="bg-gradient-to-r from-[#F2C94C] to-[#E6B800] px-6 py-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-[#1A1A24]/10 rounded-xl flex items-center justify-center backdrop-blur-sm">
                    <Shield className="w-5 h-5 text-[#1A1A24]" />
                  </div>
                  <div>
                    <h2 className="text-xl font-black text-[#1A1A24] uppercase tracking-tight">KYC Verification</h2>
                    <p className="text-xs text-[#1A1A24]/80 font-medium">Identity documents & verification</p>
                  </div>
                </div>
              </div>

              <div className="p-6 space-y-5">
                {/* Check if Amateur and Under 18 */}
                {fighter.type === 'Amateur' && fighter.dob && calculateAge(fighter.dob) < 18 ? (
                  <>
                    {/* Birth Certificate Only for Amateur Under 18 */}
                    <div className="p-5 bg-gradient-to-r from-green-50 to-green-100/50 rounded-xl border-2 border-green-300">
                      <div className="flex items-start gap-3 mb-4">
                        <CheckCircle2 className="w-6 h-6 text-green-600 mt-1 shrink-0" />
                        <div>
                          <h3 className="text-sm font-black text-green-800 uppercase tracking-wider mb-1">Simplified Requirements</h3>
                          <p className="text-xs text-green-700">
                            As an amateur fighter under 18 years old (Age: {calculateAge(fighter.dob)}), only a birth certificate is required for registration.
                          </p>
                        </div>
                      </div>

                      <div className="p-4 bg-white rounded-xl border-2 border-dashed border-green-300">
                        <div className="flex items-start gap-4">
                          <FileCheck className="w-6 h-6 text-green-600 mt-1 shrink-0" />
                          <div className="flex-1">
                            <h3 className="text-sm font-black text-green-800 uppercase tracking-wider mb-2">Upload Birth Certificate</h3>
                            <p className="text-xs text-[#707070] mb-4">Upload a clear photo or scan of the birth certificate</p>

                            <input
                              ref={docInputRef}
                              type="file"
                              accept="image/*,application/pdf"
                              onChange={handleDocChange}
                              className="hidden"
                              id="doc-upload"
                            />

                            {!docPreview ? (
                              <label
                                htmlFor="doc-upload"
                                className="inline-flex items-center gap-2 px-5 py-2.5 bg-green-600 hover:bg-green-700 text-white rounded-xl font-bold cursor-pointer transition-all shadow-md hover:shadow-lg"
                              >
                                <Upload className="w-4 h-4" />
                                Choose Birth Certificate
                              </label>
                            ) : (
                              <div className="flex items-center gap-3 p-3 bg-white rounded-xl border-2 border-green-300">
                                <div className="flex-1 flex items-center gap-3">
                                  <CheckCircle2 className="w-5 h-5 text-green-600" />
                                  <div>
                                    <p className="text-sm font-bold text-[#1A1A24]">Birth Certificate Uploaded</p>
                                    <p className="text-xs text-[#707070]">Ready for verification</p>
                                  </div>
                                </div>
                                <button
                                  type="button"
                                  onClick={removeDoc}
                                  className="p-2 hover:bg-red-50 rounded-lg text-[#C8102E] transition-colors"
                                >
                                  <X className="w-5 h-5" />
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </>
                ) : (
                  <>
                    {/* Standard ID Documents for Professional or Adult Amateur */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-[10px] font-black text-[#707070] uppercase tracking-wider mb-2">
                          ID Type <span className="text-[#C8102E]">*</span>
                        </label>
                        <select
                          value={fighter.idType}
                          onChange={(e) => updateField('idType', e.target.value)}
                          className="w-full bg-[#F4F5F8] border-2 border-[#E0E0E0] rounded-xl px-4 py-3 text-[#1A1A24] font-semibold focus:ring-2 focus:ring-[#0A3D91] focus:border-[#0A3D91] transition-all"
                        >
                          <option>National ID</option>
                          <option>Passport</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-[10px] font-black text-[#707070] uppercase tracking-wider mb-2">
                          ID Number <span className="text-[#C8102E]">*</span>
                        </label>
                        <input
                          required
                          type="text"
                          value={fighter.idNumber}
                          onChange={(e) => updateField('idNumber', e.target.value)}
                          className="w-full bg-[#F4F5F8] border-2 border-[#E0E0E0] rounded-xl px-4 py-3 text-[#1A1A24] font-mono focus:ring-2 focus:ring-[#0A3D91] focus:border-[#0A3D91] transition-all placeholder:text-[#B0B0B0]"
                          placeholder="Enter ID number"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-black text-[#707070] uppercase tracking-wider mb-2">
                          Expiry Date <span className="text-[#C8102E]">*</span>
                        </label>
                        <input
                          required
                          type="date"
                          value={fighter.idExpiry}
                          onChange={(e) => updateField('idExpiry', e.target.value)}
                          className="w-full bg-[#F4F5F8] border-2 border-[#E0E0E0] rounded-xl px-4 py-3 text-[#1A1A24] font-semibold focus:ring-2 focus:ring-[#0A3D91] focus:border-[#0A3D91] transition-all"
                        />
                      </div>
                    </div>

                    {/* Document Upload Section */}
                    <div className="p-5 bg-gradient-to-br from-blue-50 to-blue-100/50 rounded-xl border-2 border-dashed border-blue-300">
                      <div className="flex items-start gap-4">
                        <FileCheck className="w-6 h-6 text-[#0A3D91] mt-1 shrink-0" />
                        <div className="flex-1">
                          <h3 className="text-sm font-black text-[#0A3D91] uppercase tracking-wider mb-2">Upload ID Document</h3>
                          <p className="text-xs text-[#707070] mb-4">Upload a clear photo or scan of {fighter.idType} (front side)</p>

                          <input
                            ref={docInputRef}
                            type="file"
                            accept="image/*,application/pdf"
                            onChange={handleDocChange}
                            className="hidden"
                            id="doc-upload"
                          />

                          {!docPreview ? (
                            <label
                              htmlFor="doc-upload"
                              className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#0A3D91] hover:bg-[#082F6E] text-white rounded-xl font-bold cursor-pointer transition-all shadow-md hover:shadow-lg"
                            >
                              <Upload className="w-4 h-4" />
                              Choose File
                            </label>
                          ) : (
                            <div className="flex items-center gap-3 p-3 bg-white rounded-xl border-2 border-green-200">
                              <div className="flex-1 flex items-center gap-3">
                                <CheckCircle2 className="w-5 h-5 text-green-600" />
                                <div>
                                  <p className="text-sm font-bold text-[#1A1A24]">Document Uploaded</p>
                                  <p className="text-xs text-[#707070]">{fighter.idType} - Ready for verification</p>
                                </div>
                              </div>
                              <button
                                type="button"
                                onClick={removeDoc}
                                className="p-2 hover:bg-red-50 rounded-lg text-[#C8102E] transition-colors"
                              >
                                <X className="w-5 h-5" />
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Section 3: Contact Information */}
            <div className="bg-white rounded-2xl shadow-[0_8px_30px_rgba(0,0,0,0.08)] border-2 border-[#E0E0E0]/50 overflow-hidden">
              <div className="bg-gradient-to-r from-gray-600 to-gray-800 px-6 py-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                    <MapPin className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h2 className="text-xl font-black text-white uppercase tracking-tight">Contact Information</h2>
                    <p className="text-xs text-white/80 font-medium">Address & communication details</p>
                  </div>
                </div>
              </div>
              
              <div className="p-6 space-y-5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-black text-[#707070] uppercase tracking-wider mb-2">
                      Primary Phone <span className="text-[#C8102E]">*</span>
                    </label>
                    <input 
                      required 
                      type="tel" 
                      value={fighter.phone1} 
                      onChange={(e) => updateField('phone1', e.target.value)}
                      onBlur={() => handleBlur('phone1')}
                      className={`w-full bg-[#F4F5F8] border-2 rounded-xl px-4 py-3 text-[#1A1A24] font-mono focus:ring-2 transition-all placeholder:text-[#B0B0B0] ${
                        errors.phone1 && touched.phone1 
                          ? 'border-[#C8102E] focus:border-[#C8102E] focus:ring-[#C8102E]/20' 
                          : 'border-[#E0E0E0] focus:border-[#0A3D91] focus:ring-[#0A3D91]/20'
                      }`}
                      placeholder="+855 12 345 678" 
                    />
                    {errors.phone1 && touched.phone1 && (
                      <p className="text-xs text-[#C8102E] font-semibold mt-1.5 flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" /> {errors.phone1}
                      </p>
                    )}
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-[#707070] uppercase tracking-wider mb-2">
                      Email Address
                    </label>
                    <input 
                      type="email" 
                      value={fighter.email} 
                      onChange={(e) => updateField('email', e.target.value)} 
                      className="w-full bg-[#F4F5F8] border-2 border-[#E0E0E0] rounded-xl px-4 py-3 text-[#1A1A24] font-semibold focus:ring-2 focus:ring-[#0A3D91] focus:border-[#0A3D91] transition-all placeholder:text-[#B0B0B0]" 
                      placeholder="fighter@example.com" 
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-black text-[#707070] uppercase tracking-wider mb-2">
                      Current Address
                    </label>
                    <input 
                      type="text" 
                      value={fighter.address} 
                      onChange={(e) => updateField('address', e.target.value)} 
                      className="w-full bg-[#F4F5F8] border-2 border-[#E0E0E0] rounded-xl px-4 py-3 text-[#1A1A24] font-semibold focus:ring-2 focus:ring-[#0A3D91] focus:border-[#0A3D91] transition-all placeholder:text-[#B0B0B0]" 
                      placeholder="Street, Sangkat, Khan..." 
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-[#707070] uppercase tracking-wider mb-2">
                      City / Province
                    </label>
                    <input 
                      type="text" 
                      value={fighter.city} 
                      onChange={(e) => updateField('city', e.target.value)} 
                      className="w-full bg-[#F4F5F8] border-2 border-[#E0E0E0] rounded-xl px-4 py-3 text-[#1A1A24] font-semibold focus:ring-2 focus:ring-[#0A3D91] focus:border-[#0A3D91] transition-all placeholder:text-[#B0B0B0]" 
                      placeholder="Phnom Penh" 
                    />
                  </div>
                </div>

                {/* Emergency Contact */}
                <div className="p-5 bg-gradient-to-r from-red-50 to-red-100/50 rounded-xl border-2 border-red-200">
                  <div className="flex items-center gap-2 mb-4">
                    <Activity className="w-5 h-5 text-[#C8102E]" />
                    <h3 className="text-sm font-black text-[#C8102E] uppercase tracking-wider">Emergency Contact</h3>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-[9px] font-black text-[#707070] uppercase tracking-wider mb-2">Name</label>
                      <input 
                        type="text" 
                        value={fighter.emergencyName} 
                        onChange={(e) => updateField('emergencyName', e.target.value)} 
                        className="w-full bg-white border-2 border-red-200 rounded-lg px-3 py-2.5 text-sm font-semibold focus:ring-2 focus:ring-[#C8102E] focus:border-[#C8102E] placeholder:text-[#B0B0B0]" 
                        placeholder="Full name"
                      />
                    </div>
                    <div>
                      <label className="block text-[9px] font-black text-[#707070] uppercase tracking-wider mb-2">Relationship</label>
                      <input 
                        type="text" 
                        value={fighter.emergencyRelation} 
                        onChange={(e) => updateField('emergencyRelation', e.target.value)} 
                        className="w-full bg-white border-2 border-red-200 rounded-lg px-3 py-2.5 text-sm font-semibold focus:ring-2 focus:ring-[#C8102E] focus:border-[#C8102E] placeholder:text-[#B0B0B0]" 
                        placeholder="e.g. Brother"
                      />
                    </div>
                    <div>
                      <label className="block text-[9px] font-black text-[#707070] uppercase tracking-wider mb-2">Phone</label>
                      <input 
                        type="tel" 
                        value={fighter.emergencyPhone} 
                        onChange={(e) => updateField('emergencyPhone', e.target.value)} 
                        className="w-full bg-white border-2 border-red-200 rounded-lg px-3 py-2.5 text-sm font-mono focus:ring-2 focus:ring-[#C8102E] focus:border-[#C8102E] placeholder:text-[#B0B0B0]" 
                        placeholder="+855"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Section 4: Medical Profile */}
            <div className="bg-white rounded-2xl shadow-[0_8px_30px_rgba(0,0,0,0.08)] border-2 border-[#E0E0E0]/50 overflow-hidden">
              <div className="bg-gradient-to-r from-emerald-500 to-teal-600 px-6 py-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                    <HeartPulse className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h2 className="text-xl font-black text-white uppercase tracking-tight">Medical Profile</h2>
                    <p className="text-xs text-white/80 font-medium">Health records & medical clearance</p>
                  </div>
                </div>
              </div>
              
              <div className="p-6 space-y-5">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-[10px] font-black text-[#707070] uppercase tracking-wider mb-2">
                      Blood Type <span className="text-[#C8102E]">*</span>
                    </label>
                    <select 
                      value={fighter.bloodType} 
                      onChange={(e) => updateField('bloodType', e.target.value)} 
                      className="w-full bg-[#F4F5F8] border-2 border-[#E0E0E0] rounded-xl px-4 py-3 text-center text-xl font-black text-[#C8102E] focus:ring-2 focus:ring-[#0A3D91] focus:border-[#0A3D91] transition-all"
                    >
                      {["O+", "O-", "A+", "A-", "B+", "B-", "AB+", "AB-"].map(bt => <option key={bt}>{bt}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-[#707070] uppercase tracking-wider mb-2">
                      Last Medical Check
                    </label>
                    <input 
                      type="date" 
                      value={fighter.lastMedicalCheck} 
                      onChange={(e) => updateField('lastMedicalCheck', e.target.value)} 
                      className="w-full bg-[#F4F5F8] border-2 border-[#E0E0E0] rounded-xl px-4 py-3 text-[#1A1A24] font-semibold focus:ring-2 focus:ring-[#0A3D91] focus:border-[#0A3D91] transition-all" 
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-[#707070] uppercase tracking-wider mb-2 flex items-center gap-1">
                      <Shield className="w-3.5 h-3.5 text-[#C8102E]" /> Clearance Expiry
                    </label>
                    <input 
                      type="date" 
                      value={fighter.medicalExpiry} 
                      onChange={(e) => updateField('medicalExpiry', e.target.value)} 
                      className="w-full bg-[#F4F5F8] border-2 border-[#E0E0E0] rounded-xl px-4 py-3 text-[#1A1A24] font-semibold focus:ring-2 focus:ring-[#C8102E] focus:border-[#C8102E] transition-all" 
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-black text-[#707070] uppercase tracking-wider mb-2">Medical Conditions</label>
                    <textarea 
                      value={fighter.medicalConditions} 
                      onChange={(e) => updateField('medicalConditions', e.target.value)} 
                      className="w-full bg-[#F4F5F8] border-2 border-[#E0E0E0] rounded-xl px-4 py-3 text-sm font-medium h-20 focus:ring-2 focus:ring-[#0A3D91] focus:border-[#0A3D91] transition-all resize-none placeholder:text-[#B0B0B0]" 
                      placeholder="List any known medical conditions or 'None'"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-[#707070] uppercase tracking-wider mb-2">Known Allergies</label>
                    <textarea 
                      value={fighter.allergies} 
                      onChange={(e) => updateField('allergies', e.target.value)} 
                      className="w-full bg-[#F4F5F8] border-2 border-[#E0E0E0] rounded-xl px-4 py-3 text-sm font-medium h-20 focus:ring-2 focus:ring-[#0A3D91] focus:border-[#0A3D91] transition-all resize-none placeholder:text-[#B0B0B0]" 
                      placeholder="List any allergies or 'None'"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Section 5: Combat Profile */}
            <div className="bg-white rounded-2xl shadow-[0_8px_30px_rgba(0,0,0,0.08)] border-2 border-[#E0E0E0]/50 overflow-hidden">
              <div className="bg-gradient-to-r from-[#C8102E] to-[#A00D24] px-6 py-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                    <Dumbbell className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h2 className="text-xl font-black text-white uppercase tracking-tight">Combat Profile</h2>
                    <p className="text-xs text-white/80 font-medium">Fighting stats & training information</p>
                  </div>
                </div>
              </div>
              
              <div className="p-6 space-y-5">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-[10px] font-black text-[#707070] uppercase tracking-wider mb-2">
                      Weight (kg) <span className="text-[#C8102E]">*</span>
                    </label>
                    <input 
                      required 
                      type="number" 
                      step="0.1" 
                      value={fighter.weight} 
                      onChange={(e) => updateField('weight', e.target.value)}
                      onBlur={() => handleBlur('weight')}
                      className={`w-full bg-[#F4F5F8] border-2 rounded-xl px-3 py-3 text-center text-2xl font-black font-mono focus:ring-2 transition-all placeholder:text-[#B0B0B0] ${
                        errors.weight && touched.weight 
                          ? 'border-[#C8102E] text-[#C8102E] focus:border-[#C8102E] focus:ring-[#C8102E]/20' 
                          : 'border-[#E0E0E0] text-[#0A3D91] focus:border-[#0A3D91] focus:ring-[#0A3D91]/20'
                      }`}
                      placeholder="0.0" 
                    />
                    {errors.weight && touched.weight && (
                      <p className="text-xs text-[#C8102E] font-semibold mt-1.5 flex items-center gap-1 justify-center">
                        <AlertCircle className="w-3 h-3" /> {errors.weight}
                      </p>
                    )}
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-[#707070] uppercase tracking-wider mb-2">Height (cm)</label>
                    <input 
                      type="number" 
                      value={fighter.height} 
                      onChange={(e) => updateField('height', e.target.value)} 
                      className="w-full bg-[#F4F5F8] border-2 border-[#E0E0E0] rounded-xl px-3 py-3 text-center text-2xl font-black font-mono text-[#1A1A24] focus:ring-2 focus:ring-[#0A3D91] focus:border-[#0A3D91] transition-all placeholder:text-[#B0B0B0]" 
                      placeholder="0" 
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-[#707070] uppercase tracking-wider mb-2">Reach (cm)</label>
                    <input 
                      type="number" 
                      value={fighter.reach} 
                      onChange={(e) => updateField('reach', e.target.value)} 
                      className="w-full bg-[#F4F5F8] border-2 border-[#E0E0E0] rounded-xl px-3 py-3 text-center text-2xl font-black font-mono text-[#1A1A24] focus:ring-2 focus:ring-[#0A3D91] focus:border-[#0A3D91] transition-all placeholder:text-[#B0B0B0]" 
                      placeholder="0" 
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-[#707070] uppercase tracking-wider mb-2">Experience (Yrs)</label>
                    <input 
                      type="number" 
                      value={fighter.experience} 
                      onChange={(e) => updateField('experience', e.target.value)} 
                      className="w-full bg-[#F4F5F8] border-2 border-[#E0E0E0] rounded-xl px-3 py-3 text-center text-2xl font-black font-mono text-[#1A1A24] focus:ring-2 focus:ring-[#0A3D91] focus:border-[#0A3D91] transition-all placeholder:text-[#B0B0B0]" 
                      placeholder="0" 
                    />
                  </div>
                </div>

                {/* Club / Gym Selection - Dropdown */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-black text-[#707070] uppercase tracking-wider mb-2">
                      Club / Gym <span className="text-[#C8102E]">*</span>
                    </label>
                    <select 
                      required 
                      value={fighter.clubId} 
                      onChange={(e) => {
                        const club = MOCK_CLUBS.find(c => c.id === e.target.value);
                        const newPromoter = fighter.promoter || (club ? club.headCoach : "");
                        setFighter({
                          ...fighter, 
                          clubId: e.target.value, 
                          gym: club ? club.name : "", 
                          trainer: club ? club.headCoach : "",
                          promoter: newPromoter
                        });
                        handleBlur('clubId');
                      }}
                      onBlur={() => handleBlur('clubId')}
                      className={`w-full bg-[#F4F5F8] border-2 rounded-xl px-4 py-3 text-[#1A1A24] font-semibold focus:ring-2 transition-all ${
                        errors.clubId && touched.clubId 
                          ? 'border-[#C8102E] focus:border-[#C8102E] focus:ring-[#C8102E]/20' 
                          : 'border-[#E0E0E0] focus:border-[#0A3D91] focus:ring-[#0A3D91]/20'
                      }`}
                    >
                      <option value="" disabled>Select Club / Gym</option>
                      {MOCK_CLUBS.map(c => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                      ))}
                    </select>
                    {errors.clubId && touched.clubId && (
                      <p className="text-xs text-[#C8102E] font-semibold mt-1.5 flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" /> {errors.clubId}
                      </p>
                    )}
                    {fighter.clubId && !errors.clubId && (
                      <p className="text-xs text-green-600 font-semibold mt-1.5 flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" /> Club assigned
                      </p>
                    )}
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-[#707070] uppercase tracking-wider mb-2">
                      Head Coach / Trainer
                    </label>
                    <input 
                      type="text" 
                      value={fighter.trainer} 
                      readOnly
                      className="w-full bg-[#E8E9EC] border-2 border-[#E0E0E0] rounded-xl px-4 py-3 text-[#1A1A24] font-semibold cursor-not-allowed" 
                      placeholder="Auto-filled from club"
                    />
                    <p className="text-xs text-[#707070] mt-1.5 flex items-center gap-1">
                      <Info className="w-3 h-3" />
                      Automatically assigned from selected club
                    </p>
                  </div>
                </div>

                {/* Promoter Field */}
                <div>
                  <label className="flex items-center gap-2 text-[10px] font-black text-[#707070] uppercase tracking-wider mb-2">
                    Promoter
                    <div className="group relative">
                      <Info className="w-3.5 h-3.5 text-[#707070] cursor-help" />
                      <div className="absolute left-0 bottom-full mb-2 w-64 p-3 bg-[#1A1A24] text-white text-xs rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all shadow-xl z-10">
                        <p className="font-medium">The promoter organizes and manages the fighter's matches. If left blank, the Head Coach will be set as the default promoter.</p>
                      </div>
                    </div>
                  </label>
                  <input 
                    type="text" 
                    value={fighter.promoter} 
                    onChange={(e) => updateField('promoter', e.target.value)} 
                    className="w-full bg-[#F4F5F8] border-2 border-[#E0E0E0] rounded-xl px-4 py-3 text-[#1A1A24] font-semibold focus:ring-2 focus:ring-[#0A3D91] focus:border-[#0A3D91] transition-all placeholder:text-[#B0B0B0]" 
                    placeholder={fighter.trainer ? `Default: ${fighter.trainer}` : "Enter promoter name"}
                    disabled={!fighter.clubId}
                  />
                  {!fighter.clubId && (
                    <p className="text-xs text-[#C8102E] font-semibold mt-1.5 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" />
                      Select a club first
                    </p>
                  )}
                  {fighter.clubId && !fighter.promoter && (
                    <p className="text-xs text-[#707070] mt-1.5 flex items-center gap-1">
                      <Info className="w-3 h-3" />
                      Will default to: {fighter.trainer}
                    </p>
                  )}
                </div>

                {/* Fighting Styles - Improved Multi-Select */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <label className="block text-[10px] font-black text-[#707070] uppercase tracking-wider">
                      Fighting Styles <span className="text-[#C8102E]">*</span> <span className="text-xs font-normal text-[#707070]">(Select all that apply)</span>
                    </label>
                    {fighter.styles.length > 0 && (
                      <span className="inline-flex items-center gap-1 text-xs font-bold text-green-600">
                        <CheckCircle2 className="w-4 h-4" /> {fighter.styles.length} selected
                      </span>
                    )}
                  </div>
                  
                  {errors.styles && touched.styles && (
                    <div className="mb-3 p-3 bg-red-50 border-2 border-red-200 rounded-lg flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 text-[#C8102E] shrink-0" />
                      <p className="text-sm font-semibold text-[#C8102E]">{errors.styles}</p>
                    </div>
                  )}
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {FIGHTING_STYLES.map(style => {
                      const isSelected = fighter.styles.includes(style.id);
                      return (
                        <label
                          key={style.id}
                          className={`relative flex items-center gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all group ${
                            isSelected
                              ? 'border-[#0A3D91] bg-gradient-to-r from-blue-50 to-blue-100/50 shadow-md'
                              : 'border-[#E0E0E0] bg-white hover:border-[#0A3D91]/50 hover:shadow-sm'
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={(e) => {
                              const newStyles = e.target.checked 
                                ? [...fighter.styles, style.id]
                                : fighter.styles.filter(s => s !== style.id);
                              updateField('styles', newStyles);
                              setTouched(prev => ({ ...prev, styles: true }));
                            }}
                            className="w-5 h-5 rounded-lg border-2 border-[#E0E0E0] text-[#0A3D91] focus:ring-2 focus:ring-[#0A3D91]"
                          />
                          <div className="flex-1">
                            <span className={`block text-sm font-black transition-colors ${
                              isSelected ? 'text-[#0A3D91]' : 'text-[#1A1A24] group-hover:text-[#0A3D91]'
                            }`}>
                              {style.label}
                            </span>
                            <span className="block text-xs text-[#707070] font-medium mt-0.5">
                              {style.subtitle}
                            </span>
                          </div>
                          {isSelected && (
                            <CheckCircle2 className="w-5 h-5 text-[#0A3D91] absolute top-2 right-2" />
                          )}
                        </label>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>

            {/* Section 6: Legal Compliance */}
            <div className="bg-gradient-to-br from-[#1A1A24] via-[#051C42] to-[#0A3D91] rounded-2xl shadow-2xl border-2 border-[#0A3D91] overflow-hidden">
              <div className="px-6 py-4 border-b border-white/10">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center backdrop-blur-sm">
                    <FileText className="w-5 h-5 text-[#F2C94C]" />
                  </div>
                  <div>
                    <h2 className="text-xl font-black text-white uppercase tracking-tight">Legal Compliance</h2>
                    <p className="text-xs text-white/80 font-medium">Required declarations & consent</p>
                  </div>
                </div>
              </div>
              
              <div className="p-6 space-y-3">
                <label className="flex items-start gap-4 p-4 rounded-xl border-2 border-white/10 bg-white/5 cursor-pointer hover:bg-white/10 transition-all">
                  <input 
                    type="checkbox" 
                    required 
                    checked={fighter.termsAccepted} 
                    onChange={(e) => updateField('termsAccepted', e.target.checked)} 
                    className="w-5 h-5 rounded border-white/30 bg-black/50 text-[#C8102E] focus:ring-[#C8102E] focus:ring-offset-gray-900 mt-0.5 shrink-0" 
                  />
                  <div className="flex-1">
                    <p className="font-black text-sm tracking-wide text-white mb-1">Accept Terms & Conditions <span className="text-[#C8102E]">*</span></p>
                    <p className="text-xs text-white/70 leading-relaxed">I verify that all identity, contact, and background information provided is true and accurate.</p>
                  </div>
                </label>

                <label className="flex items-start gap-4 p-4 rounded-xl border-2 border-white/10 bg-white/5 cursor-pointer hover:bg-white/10 transition-all">
                  <input 
                    type="checkbox" 
                    required 
                    checked={fighter.consentCompete} 
                    onChange={(e) => updateField('consentCompete', e.target.checked)} 
                    className="w-5 h-5 rounded border-white/30 bg-black/50 text-[#C8102E] focus:ring-[#C8102E] focus:ring-offset-gray-900 mt-0.5 shrink-0" 
                  />
                  <div className="flex-1">
                    <p className="font-black text-sm tracking-wide text-white mb-1">Consent to Compete <span className="text-[#C8102E]">*</span></p>
                    <p className="text-xs text-white/70 leading-relaxed">I voluntarily consent to participate in Kun Khmer combat sports and understand the physical risks involved.</p>
                  </div>
                </label>

                <label className="flex items-start gap-4 p-4 rounded-xl border-2 border-[#F2C94C]/30 bg-[#F2C94C]/5 cursor-pointer hover:bg-[#F2C94C]/10 transition-all">
                  <input 
                    type="checkbox" 
                    required 
                    checked={fighter.medicalFitness} 
                    onChange={(e) => updateField('medicalFitness', e.target.checked)} 
                    className="w-5 h-5 rounded border-[#F2C94C]/50 bg-black/50 text-[#F2C94C] focus:ring-[#F2C94C] focus:ring-offset-gray-900 mt-0.5 shrink-0" 
                  />
                  <div className="flex-1">
                    <p className="font-black text-sm tracking-wide text-[#F2C94C] mb-1">Medical Fitness Declaration <span className="text-[#C8102E]">*</span></p>
                    <p className="text-xs text-white/70 leading-relaxed">I declare that I am medically fit to compete and do not carry communicable diseases.</p>
                  </div>
                </label>
              </div>
            </div>

          </div>
        </div>
      </form>
    </div>
  );
}