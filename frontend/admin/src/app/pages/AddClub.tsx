import { useState, useEffect } from "react";
import { ArrowLeft, Save, Upload, Building2, MapPin, X, ChevronDown } from "lucide-react";
import { Link, useNavigate, useParams } from "react-router";
import { api } from "../utils/api";
import { usePermissions } from "../hooks/usePermissions";
import { type Association, useSettingsList } from "../hooks/useSettingsLists";
import { toast } from "sonner";
import { ClubMapPicker, type Pin } from "../components/clubs/ClubMapPicker";


export function AddClub() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditMode = !!id;
  const permissions = usePermissions();
  const currentUser = permissions.currentUser;
  const [formData, setFormData] = useState({
    name: "",
    location: "",
    headCoach: "",
    association: "",
    phone: "",
    email: "",
    established: "",
    description: "",
    status: "active",
    image: "",
    logoUrl: ""
  });

  // The association dropdown comes from System Settings; a club saved with a name no longer in the list keeps it as an extra option.
  const { rows: associationList } = useSettingsList<Association>("associations");
  const associationOptions = [...new Set([...associationList.map((x) => x.name), formData.association].filter(Boolean))];

  useEffect(() => {
    if (isEditMode && id) {
      const fetchClub = async () => {
        try {
          const clubData = await api.clubs.get(id);
          if (clubData) {
            setFormData({
              name: clubData.name || "",
              location: clubData.location || "",
              headCoach: clubData.head_coach || clubData.headCoach || "",
              association: clubData.association || "",
              phone: clubData.phone || "",
              email: clubData.email || "",
              established: clubData.established || "",
              description: clubData.description || "",
              status: clubData.status || "active",
              image: clubData.image || "",
              logoUrl: clubData.logo_url || ""
            });
            setPin(clubData.latitude != null && clubData.longitude != null ? { lat: Number(clubData.latitude), lng: Number(clubData.longitude) } : null);
          }
        } catch (err: any) {
          toast.error("Failed to load club details: " + err.message);
        }
      };
      fetchClub();
    }
  }, [id, isEditMode]);

  // Map pin (saved as the club's latitude / longitude); Edit fills it from the club.
  const [pin, setPin] = useState<Pin | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const payload = {
        name: formData.name,
        location: formData.location,
        headCoach: formData.headCoach,
        // Optional; "" clears it.
        association: formData.association.trim(),
        // The map pin; null for both clears it.
        latitude: pin ? Number(pin.lat.toFixed(6)) : null,
        longitude: pin ? Number(pin.lng.toFixed(6)) : null,
        status: formData.status || "active",
        rating: 5.0,
        image: formData.image || "https://images.unsplash.com/photo-1540206351-d6465b3ac5c1?q=80&w=2940&auto=format&fit=crop",
        phone: formData.phone || null,
        email: formData.email || null,
        established: formData.established || null,
        description: formData.description || null,
        // "" removes the logo; a new upload is a data URI the API stores as a file.
        logoUrl: formData.logoUrl
      };

      if (isEditMode && id) {
        await api.clubs.update(id, payload);
        toast.success("Club updated successfully in database!");
      } else {
        await api.clubs.create(payload);
        toast.success("Club created successfully in database!");
      }

      navigate("/home/clubs");
    } catch (err: any) {
      toast.error(err.message || `Failed to ${isEditMode ? "update" : "create"} club`);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  return (
    <div className="p-4 md:p-8 max-w-6xl mx-auto space-y-6 flex flex-col min-h-full animate-fadeIn">
      {/* Header */}
      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-4">
          <Link 
            to="/home/clubs" 
            className="p-2.5 bg-white hover:bg-muted text-primary border border-border/80 rounded-xl transition-all active:scale-95 shadow-sm"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-foreground">
              {isEditMode ? "Edit Club" : "Add New Club"}
            </h1>
            <p className="text-sm text-muted-foreground mt-1 font-medium">
              {isEditMode ? "Update Kun Khmer training facility details" : "Register a new Kun Khmer training facility and location"}
            </p>
          </div>
        </div>
      </header>

      {/* Form Content */}
      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Columns: Form Inputs */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Basic Information */}
          <div className="card-premium">
            <h2 className="text-base font-bold text-foreground mb-4 flex items-center gap-2">
              <Building2 className="w-5 h-5 text-primary" />
              <span>Basic Information</span>
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">
                  Club Name <span className="text-secondary">*</span>
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  placeholder="e.g., Phnom Penh Elite Gym"
                  className="input-premium font-semibold text-slate-800"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">
                  Head Coach <span className="text-secondary">*</span>
                </label>
                <input
                  type="text"
                  name="headCoach"
                  value={formData.headCoach}
                  onChange={handleChange}
                  required
                  placeholder="e.g., Chan Reach"
                  className="input-premium font-semibold text-slate-800"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">
                  Association <span className="text-muted-foreground/70 normal-case font-medium">(optional)</span>
                </label>
                <select
                  name="association"
                  value={formData.association}
                  onChange={handleChange}
                  lang="km"
                  className="input-premium font-semibold text-slate-800"
                >
                  <option value="">— No association —</option>
                  {associationOptions.map((name) => <option key={name} value={name}>{name}</option>)}
                </select>
                {associationList.length === 0 && (
                  <p className="mt-1.5 text-xs text-muted-foreground">
                    No associations yet.{" "}
                    {permissions.hasPermission("settings.manage")
                      ? <Link to="/home/settings?tab=associations" className="font-semibold text-primary hover:underline">Add them in System Settings</Link>
                      : "The Super Admin adds them in System Settings."}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">
                  Established Year <span className="text-secondary">*</span>
                </label>
                <input
                  type="text"
                  name="established"
                  value={formData.established}
                  onChange={handleChange}
                  required
                  placeholder="e.g., 2010"
                  className="input-premium font-semibold text-slate-800"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">
                  Status <span className="text-secondary">*</span>
                </label>
                <div className="relative">
                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleChange}
                    required
                    className="input-premium font-semibold text-slate-800 cursor-pointer appearance-none animate-fadeIn"
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-muted-foreground">
                    <ChevronDown className="w-4 h-4" />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">
                  Location / Area <span className="text-secondary">*</span>
                </label>
                <input
                  type="text"
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                  required
                  placeholder="Click the map or type address..."
                  className="input-premium font-semibold text-slate-800"
                />
              </div>
            </div>
          </div>

          <ClubMapPicker
            value={pin}
            onChange={setPin}
            location={formData.location}
            onAddress={(address) => setFormData((prev) => ({ ...prev, location: address }))}
          />

          {/* Contact Information */}
          <div className="card-premium">
            <h2 className="text-base font-bold text-foreground mb-4">Contact Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">
                  Phone Number
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="+855 12 345 678"
                  className="input-premium font-semibold text-slate-800"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="contact@club.com"
                  className="input-premium font-semibold text-slate-800"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Upload Banner & Description */}
        <div className="lg:col-span-1 space-y-6">
          
          {/* Card: Club Logo (claude/features/club-logos.md) */}
          <div className="card-premium">
            <h3 className="text-sm font-bold text-foreground mb-1 flex items-center gap-2">
              <Upload className="w-4 h-4 text-primary" />
              <span>Club Logo</span>
            </h3>
            <p className="text-[11px] text-muted-foreground mb-3">Shown on the website next to the club name: club cards, club page, fighter profiles and search.</p>
            <div className="flex items-center gap-4">
              <div className="relative w-24 h-24 shrink-0 rounded-2xl border border-border/60 bg-white flex items-center justify-center overflow-hidden">
                {formData.logoUrl ? (
                  <>
                    <img src={formData.logoUrl} alt="Logo preview" className="w-full h-full object-contain" />
                    <button
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, logoUrl: "" }))}
                      className="absolute top-1 right-1 p-1 bg-red-500/90 hover:bg-red-600 text-white rounded-md shadow"
                      aria-label="Remove logo"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </>
                ) : (
                  <span className="text-[10px] text-muted-foreground font-medium text-center px-2">No logo</span>
                )}
              </div>
              <label className="flex-1 flex flex-col items-center justify-center h-24 border border-border/80 border-dashed rounded-xl cursor-pointer bg-muted/10 hover:bg-muted/20 transition-all duration-200 text-center px-2">
                <Upload className="w-6 h-6 text-muted-foreground mb-1" />
                <span className="text-xs font-semibold text-primary">Upload logo</span>
                <span className="text-[10px] text-muted-foreground mt-0.5">Square PNG or JPG, transparent background works best (max. 1 MB)</span>
                <input
                  type="file"
                  className="hidden"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      const reader = new FileReader();
                      reader.onloadend = () => setFormData(prev => ({ ...prev, logoUrl: reader.result as string }));
                      reader.readAsDataURL(file);
                    }
                  }}
                />
              </label>
            </div>
          </div>

          {/* Card: Upload Banner */}
          <div className="card-premium">
            <h3 className="text-sm font-bold text-foreground mb-3 flex items-center gap-2">
              <Upload className="w-4 h-4 text-primary" />
              <span>Club Banner Photo</span>
            </h3>
            
            <div className="space-y-4">
              <div className="flex items-center justify-center w-full">
                <label className="flex flex-col items-center justify-center w-full h-40 border border-border/80 border-dashed rounded-xl cursor-pointer bg-muted/10 hover:bg-muted/20 transition-all duration-200">
                  <div className="flex flex-col items-center justify-center pt-4 pb-4 px-2 text-center">
                    <Upload className="w-7 h-7 text-muted-foreground mb-2" />
                    <p className="text-xs font-semibold text-slate-700">
                      <span className="text-primary hover:underline">Click to upload</span> or drag
                    </p>
                    <p className="text-[10px] text-muted-foreground mt-0.5">PNG, JPG (MAX. 2MB)</p>
                  </div>
                  <input 
                    type="file" 
                    className="hidden" 
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        const reader = new FileReader();
                        reader.onloadend = () => {
                          setFormData(prev => ({ ...prev, image: reader.result as string }));
                        };
                        reader.readAsDataURL(file);
                      }
                    }}
                  />
                </label>
              </div>

              {formData.image ? (
                <div className="relative w-full h-40 rounded-xl overflow-hidden border border-border/60 shadow-sm animate-fadeIn">
                  <img src={formData.image} alt="Preview" className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, image: "" }))}
                    className="absolute top-2 right-2 p-1.5 bg-red-500/90 hover:bg-red-600 text-white rounded-lg transition-colors shadow-md"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              ) : (
                <div className="h-40 rounded-xl bg-muted/10 border border-border/40 flex items-center justify-center text-muted-foreground text-xs font-medium">
                  No image selected
                </div>
              )}
            </div>
          </div>

          {/* Card: Description */}
          <div className="card-premium">
            <h3 className="text-sm font-bold text-foreground mb-3">About the Club</h3>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={4}
              placeholder="Describe the club's facilities, training schedule, or background..."
              className="input-premium font-semibold text-slate-800 resize-none h-32"
            />
          </div>

          {/* Form Actions */}
          <div className="bg-white rounded-xl border border-border p-4 shadow-sm flex flex-col gap-3">
            <button
              type="submit"
              className="btn-primary w-full py-3"
            >
              <Save className="w-4 h-4 animate-pulse" />
              {isEditMode ? "Save Changes" : "Save Club"}
            </button>
            <Link
              to="/home/clubs"
              className="btn-outline w-full py-3"
            >
              Cancel
            </Link>
          </div>
        </div>

      </form>
    </div>
  );
}