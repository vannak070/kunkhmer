import React, { useState, useEffect } from "react";
import { useParams, Navigate, useLocation, useNavigate, Link } from "react-router";
import { 
  Tv, Trophy, Edit, Trash2, Plus, Globe, Radio, Award,
  Mail, ArrowLeft, Save, User, Phone
} from "lucide-react";
import { toast } from "sonner";
import { api } from "../utils/api";

// Angkor Wat watermark for premium branding
const AngkorWatWatermark = () => (
  <div className="absolute bottom-0 right-0 w-[260px] h-[200px] pointer-events-none opacity-[0.03] text-[#b89755] select-none z-0">
    <svg width="100%" height="100%" viewBox="0 0 260 200" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M 10 190 L 250 190 
           M 25 190 L 25 160 L 45 160 L 45 190 
           M 235 190 L 235 160 L 215 160 L 215 190 
           M 55 190 L 55 130 L 80 130 L 80 190 
           M 205 190 L 205 130 L 180 130 L 180 190 
           M 90 190 L 90 90 L 105 90 C 105 80, 110 70, 115 50 L 120 90 L 130 90 L 135 50 C 140 70, 145 80, 145 90 L 170 90 L 170 190
           M 110 190 L 110 80 C 110 70, 120 60, 125 30 C 130 60, 140 70, 140 80 L 140 190
           M 60 130 L 67 110 L 75 130
           M 190 130 L 197 110 L 185 130
           M 30 160 L 35 145 L 40 160"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  </div>
);

export type PartnerType = 'BROADCAST_PARTNERS' | 'OFFICIAL_SPONSORS';

// ── PARTNER CARD SUB-COMPONENT ──────────────────────────────────────────────
interface GridCardProps {
  partner: any;
  type: PartnerType;
  onEdit: (partner: any) => void;
  onDelete: (id: string) => void;
}

function GridPartnerCard({ partner, type, onEdit, onDelete }: GridCardProps) {
  const isBroadcaster = type === "BROADCAST_PARTNERS";
  const imageSrc = partner.image || partner.logoUrl;
  
  return (
    <div className="bg-white rounded-2xl border border-border/75 overflow-hidden shadow-sm hover:shadow-xl hover:border-primary/20 hover:-translate-y-1.5 transition-all duration-300 group flex flex-col relative">
      {/* Image Banner Section */}
      <div className="h-40 relative overflow-hidden bg-muted">
        {imageSrc ? (
          <img 
            src={imageSrc} 
            alt={partner.name} 
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-[#0A3D91] to-[#082E6E] flex items-center justify-center text-white/20 select-none group-hover:scale-105 transition-transform duration-700 ease-out">
            {isBroadcaster ? (
              <Tv className="w-14 h-14 opacity-30" />
            ) : (
              <Trophy className="w-14 h-14 opacity-30" />
            )}
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/20 to-transparent" />
        
        {/* Badge Overlays */}
        <div className="absolute bottom-3 left-3 right-3 flex justify-between items-end">
          {/* Tier/Type badge */}
          <div className="flex items-center gap-1 bg-[#FFFDF5] border border-amber-200/80 text-amber-700 px-2.5 py-0.5 rounded-full text-[10px] font-semibold shadow-sm">
            {isBroadcaster ? (
              <Radio className="w-3 h-3 text-amber-500 fill-amber-500/20" />
            ) : (
              <Award className="w-3 h-3 text-amber-500 fill-amber-500/20" />
            )}
            <span>{isBroadcaster ? partner.type : `${partner.tier} Tier`}</span>
          </div>
          
          {/* Active Status Badge */}
          <div className={`badge-premium ${
            partner.active !== false 
              ? 'badge-emerald' 
              : 'badge-red'
          }`}>
            <span className={`badge-dot ${partner.active !== false ? 'bg-emerald-500' : 'bg-red-500'}`} />
            {partner.active !== false ? 'Active' : 'Inactive'}
          </div>
        </div>
        
        {/* Action Overlays on Hover */}
        <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-all duration-200 flex gap-2 translate-y-[-5px] group-hover:translate-y-0 z-20">
          <button 
            onClick={(e) => { e.stopPropagation(); onEdit(partner); }}
            className="p-2 bg-white/95 hover:bg-white text-primary border border-border/40 rounded-xl shadow-md backdrop-blur-md transition-all duration-150 hover:scale-105 active:scale-95"
            title="Edit Partner"
          >
            <Edit className="w-4 h-4" />
          </button>
          <button 
            onClick={(e) => { e.stopPropagation(); onDelete(partner.id); }}
            className="p-2 bg-red-50/95 hover:bg-red-500 hover:text-white text-secondary border border-red-100 rounded-xl shadow-md backdrop-blur-md transition-all duration-150 hover:scale-105 active:scale-95"
            title="Delete Partner"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
      
      {/* Card Content Section */}
      <div className="p-5 flex-1 flex flex-col justify-between">
        <div>
          <h3 className="text-base font-bold text-foreground group-hover:text-primary transition-colors duration-200 tracking-tight leading-tight line-clamp-1 mb-1.5 text-left">
            {partner.name}
          </h3>
          {/* Subtitle details */}
          <div className="space-y-1.5 mb-4 text-left border-l-2 border-border/60 pl-3">
            {partner.contactPerson && (
              <div className="flex items-center gap-2 text-slate-700">
                <User className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <span className="text-xs font-bold truncate">{partner.contactPerson}</span>
              </div>
            )}
            <div className="flex items-center gap-2 text-slate-500">
              <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <span className="text-xs font-medium truncate">
                {partner.contactEmail || `${partner.name.toLowerCase().replace(/\s+/g, '')}@partner.com`}
              </span>
            </div>
            {partner.contactPhone && (
              <div className="flex items-center gap-2 text-slate-500">
                <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <span className="text-xs font-medium truncate">{partner.contactPhone}</span>
              </div>
            )}
            {partner.websiteUrl && (
              <div className="flex items-center gap-2 text-slate-500">
                <Globe className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <a 
                  href={partner.websiteUrl} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  onClick={(e) => e.stopPropagation()}
                  className="text-xs font-medium truncate hover:text-[#0A3D91] hover:underline"
                >
                  {partner.websiteUrl.replace(/^https?:\/\/(www\.)?/, '')}
                </a>
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3 mb-5">
            {isBroadcaster ? (
              <>
                <div className="bg-muted/15 p-3 rounded-xl border border-border/40 hover:bg-muted/20 hover:border-border/60 transition-all duration-200 flex flex-col justify-between h-[65px] text-left">
                  <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Broadcast Type</div>
                  <div className="text-xs font-semibold text-slate-800 line-clamp-1">{partner.type}</div>
                </div>
                <div className="bg-muted/15 p-3 rounded-xl border border-border/40 hover:bg-muted/20 hover:border-border/60 transition-all duration-200 flex flex-col justify-between h-[65px] text-left">
                  <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Coverage Reach</div>
                  <div className="text-xs font-semibold text-slate-800 line-clamp-1">{partner.reach}</div>
                </div>
              </>
            ) : (
              <>
                <div className="bg-muted/15 p-3 rounded-xl border border-border/40 hover:bg-muted/20 hover:border-border/60 transition-all duration-200 flex flex-col justify-between h-[65px] text-left">
                  <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Industry Sector</div>
                  <div className="text-xs font-semibold text-slate-800 line-clamp-1">{partner.industry}</div>
                </div>
                <div className="bg-muted/15 p-3 rounded-xl border border-border/40 hover:bg-muted/20 hover:border-border/60 transition-all duration-200 flex flex-col justify-between h-[65px] text-left">
                  <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Sponsor Tier</div>
                  <div className="text-xs font-semibold text-slate-800 line-clamp-1">{partner.tier}</div>
                </div>
              </>
            )}
          </div>
        </div>

        <button 
          onClick={(e) => { e.stopPropagation(); onEdit(partner); }}
          className="btn-outline w-full py-2 flex items-center justify-center gap-1.5 text-xs font-bold uppercase tracking-wider hover:bg-[#0A3D91]/5 hover:text-[#0A3D91] transition-all"
        >
          <Edit className="w-3.5 h-3.5" />
          Edit Profile
        </button>
      </div>
    </div>
  );
}

// ── MAIN DASHBOARD COMPONENT ────────────────────────────────────────────────
export function StrategicPartners() {
  const { partnerType, partnerId } = useParams<{ partnerType: string; partnerId?: string }>();
  const { pathname } = useLocation();
  const navigate = useNavigate();

  const isCreateView = pathname.endsWith("/new");
  const isEditView = pathname.endsWith("/edit");
  const isFormView = isCreateView || isEditView;

  // State arrays for database records
  const [sponsors, setSponsors] = useState<any[]>([]);
  const [broadcastStations, setBroadcastStations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Form states
  const [partnerName, setPartnerName] = useState("");
  const [logoUrl, setLogoUrl] = useState("");
  const [contactPerson, setContactPerson] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [websiteUrl, setWebsiteUrl] = useState("");
  const [partnerActive, setPartnerActive] = useState(true);
  
  // Broadcaster states
  const [broadcasterType, setBroadcasterType] = useState<"National TV" | "Cable TV" | "Digital Platform" | "Radio">("Cable TV");
  const [broadcasterReach, setBroadcasterReach] = useState("National");
  
  // Sponsor states
  const [sponsorIndustry, setSponsorIndustry] = useState("");
  const [sponsorTier, setSponsorTier] = useState<"Platinum" | "Gold" | "Silver" | "Bronze">("Gold");

  // If partnerType is not 'broadcasters' and not 'sponsors', redirect to default broadcasters view
  if (partnerType !== "broadcasters" && partnerType !== "sponsors") {
    return <Navigate to="/home/strategic-partners/broadcasters" replace />;
  }

  const isBroadcasterView = partnerType === "broadcasters";
  const type: PartnerType = isBroadcasterView ? "BROADCAST_PARTNERS" : "OFFICIAL_SPONSORS";

  const loadData = async () => {
    try {
      const sponsorsData = await api.settings.listSponsors();
      const stationsData = await api.settings.listBroadcastStations();
      
      const mappedSponsors = (sponsorsData || []).map((s: any) => ({
        ...s,
        logoUrl: s.logo_url || "",
        contactPerson: s.contact_person || "",
        contactEmail: s.contact_email || "",
        contactPhone: s.contact_phone || "",
        websiteUrl: s.website_url || "",
        active: s.active !== false
      }));

      const mappedStations = (stationsData || []).map((b: any) => ({
        ...b,
        logoUrl: b.logo_url || "",
        streamUrl: b.stream_url || "",
        contactPerson: b.contact_person || "",
        contactEmail: b.contact_email || "",
        contactPhone: b.contact_phone || "",
        websiteUrl: b.website_url || "",
        active: b.active !== false
      }));

      setSponsors(mappedSponsors);
      setBroadcastStations(mappedStations);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load partners data from database");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Compute metric stats
  const totalBroadcasters = broadcastStations.length;
  const nationalBroadcasters = broadcastStations.filter(b => b.reach === "National").length;
  const digitalBroadcasters = broadcastStations.filter(b => b.type === "Digital Platform").length;
  
  const totalSponsors = sponsors.length;
  const platinumSponsors = sponsors.filter(s => s.tier === "Platinum").length;
  const goldSponsors = sponsors.filter(s => s.tier === "Gold").length;

  useEffect(() => {
    if (partnerId) {
      const list = isBroadcasterView ? broadcastStations : sponsors;
      const found = list.find(p => p.id === partnerId);
      if (found) {
        setPartnerName(found.name);
        setLogoUrl(found.image || found.logoUrl || found.logo_url || "");
        setContactPerson(found.contactPerson || "");
        setContactEmail(found.contactEmail || "");
        setContactPhone(found.contactPhone || "");
        setWebsiteUrl(found.websiteUrl || "");
        setPartnerActive(found.active !== false);
        if (isBroadcasterView) {
          setBroadcasterType(found.type || "Cable TV");
          setBroadcasterReach(found.reach || "National");
        } else {
          setSponsorIndustry(found.industry || "");
          setSponsorTier(found.tier || "Gold");
        }
      }
    } else {
      setPartnerName("");
      setLogoUrl("");
      setContactPerson("");
      setContactEmail("");
      setContactPhone("");
      setWebsiteUrl("");
      setPartnerActive(true);
      setBroadcasterType("Cable TV");
      setBroadcasterReach("National");
      setSponsorIndustry("");
      setSponsorTier("Gold");
    }
  }, [partnerId, isBroadcasterView, sponsors, broadcastStations]);

  const handleDelete = async (id: string) => {
    if (!confirm(`⚠️ Are you sure you want to delete this ${isBroadcasterView ? "broadcaster" : "sponsor"}?`)) return;
    try {
      if (isBroadcasterView) {
        await api.settings.deleteBroadcastStation(id);
        toast.success("🗑️ Broadcast station deleted successfully.");
      } else {
        await api.settings.deleteSponsor(id);
        toast.success("🗑️ Sponsor deleted successfully.");
      }
      loadData();
    } catch (err) {
      console.error(err);
      toast.error("Failed to delete partner");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!partnerName.trim()) return;

    const isEditMode = !!partnerId;

    try {
      if (!isEditMode) {
        if (isBroadcasterView) {
          await api.settings.createBroadcastStation({
            name: partnerName.trim(),
            logoUrl: logoUrl.trim() || undefined,
            type: broadcasterType,
            reach: broadcasterReach,
            contactPerson: contactPerson.trim() || undefined,
            contactEmail: contactEmail.trim() || undefined,
            contactPhone: contactPhone.trim() || undefined,
            websiteUrl: websiteUrl.trim() || undefined,
            active: partnerActive
          });
          toast.success("✅ New broadcasting partner added!");
        } else {
          await api.settings.createSponsor({
            name: partnerName.trim(),
            logoUrl: logoUrl.trim() || undefined,
            industry: sponsorIndustry.trim() || "Corporate Partner",
            tier: sponsorTier,
            contactPerson: contactPerson.trim() || undefined,
            contactEmail: contactEmail.trim() || undefined,
            contactPhone: contactPhone.trim() || undefined,
            websiteUrl: websiteUrl.trim() || undefined,
            active: partnerActive
          });
          toast.success("✅ New official sponsor added!");
        }
      } else {
        // EDIT MODE
        if (isBroadcasterView) {
          await api.settings.updateBroadcastStation(partnerId, {
            name: partnerName.trim(),
            logoUrl: logoUrl.trim() || undefined,
            type: broadcasterType,
            reach: broadcasterReach,
            contactPerson: contactPerson.trim() || undefined,
            contactEmail: contactEmail.trim() || undefined,
            contactPhone: contactPhone.trim() || undefined,
            websiteUrl: websiteUrl.trim() || undefined,
            active: partnerActive
          });
          toast.success("✅ Broadcaster details updated successfully.");
        } else {
          await api.settings.updateSponsor(partnerId, {
            name: partnerName.trim(),
            logoUrl: logoUrl.trim() || undefined,
            industry: sponsorIndustry.trim() || "Corporate Partner",
            tier: sponsorTier,
            contactPerson: contactPerson.trim() || undefined,
            contactEmail: contactEmail.trim() || undefined,
            contactPhone: contactPhone.trim() || undefined,
            websiteUrl: websiteUrl.trim() || undefined,
            active: partnerActive
          });
          toast.success("✅ Sponsor details updated successfully.");
        }
      }
      navigate(`/home/strategic-partners/${partnerType}`);
      loadData();
    } catch (err) {
      console.error(err);
      toast.error("Failed to save strategic partner");
    }
  };

  if (isFormView) {
    const isEdit = !!partnerId;
    return (
      <div className="p-4 md:p-8 max-w-4xl mx-auto space-y-6 flex flex-col min-h-full animate-fadeIn relative">
        <AngkorWatWatermark />
        {/* Header */}
        <header className="flex items-center gap-4 relative z-10">
          <Link 
            to={`/home/strategic-partners/${partnerType}`} 
            className="p-2.5 bg-white hover:bg-muted text-primary border border-border/80 rounded-xl transition-all active:scale-95 shadow-sm"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-foreground">
              {isEdit ? "Edit Partner Details" : "Add New Partner"}
            </h1>
            <p className="text-sm text-muted-foreground mt-1 font-medium">
              {isBroadcasterView ? "Broadcaster Module" : "Sponsor Module"}
            </p>
          </div>
        </header>

        {/* Form */}
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-6 relative z-10">
          <div className="md:col-span-2 space-y-6">
            <div className="card-premium">
              <h2 className="text-base font-bold text-foreground mb-4">
                Partner Information
              </h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">
                    Partner Name <span className="text-[#C8102E]">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={partnerName}
                    onChange={e => setPartnerName(e.target.value)}
                    placeholder={isBroadcasterView ? "e.g. CNC Sports" : "e.g. Smart Axiata"}
                    className="input-premium font-semibold text-slate-800"
                  />
                </div>

                {isBroadcasterView ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">
                        Broadcast Type
                      </label>
                      <div className="relative">
                        <select
                          value={broadcasterType}
                          onChange={e => setBroadcasterType(e.target.value as any)}
                          className="input-premium font-semibold text-slate-800 cursor-pointer appearance-none"
                        >
                          <option value="National TV">National TV</option>
                          <option value="Cable TV">Cable TV</option>
                          <option value="Digital Platform">Digital Platform</option>
                          <option value="Radio">Radio</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">
                        Coverage Reach
                      </label>
                      <div className="relative">
                        <select
                          value={broadcasterReach}
                          onChange={e => setBroadcasterReach(e.target.value)}
                          className="input-premium font-semibold text-slate-800 cursor-pointer appearance-none"
                        >
                          <option value="National">National</option>
                          <option value="Urban Areas">Urban Areas</option>
                          <option value="Online/Mobile">Online/Mobile</option>
                        </select>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">
                        Sponsor Tier
                      </label>
                      <div className="relative">
                        <select
                          value={sponsorTier}
                          onChange={e => setSponsorTier(e.target.value as any)}
                          className="input-premium font-semibold text-slate-800 cursor-pointer appearance-none"
                        >
                          <option value="Platinum">Platinum</option>
                          <option value="Gold">Gold</option>
                          <option value="Silver">Silver</option>
                          <option value="Bronze">Bronze</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">
                        Industry Sector
                      </label>
                      <input
                        type="text"
                        value={sponsorIndustry}
                        onChange={e => setSponsorIndustry(e.target.value)}
                        placeholder="e.g. Telecommunications"
                        className="input-premium font-semibold text-slate-800"
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Contact Details Card */}
            <div className="card-premium">
              <h2 className="text-base font-bold text-foreground mb-4 flex items-center gap-2">
                <User className="w-5 h-5 text-primary" />
                <span>Contact Details</span>
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">
                    Contact Person Name
                  </label>
                  <input
                    type="text"
                    value={contactPerson}
                    onChange={e => setContactPerson(e.target.value)}
                    placeholder="e.g. Mr. Sok Phalla"
                    className="input-premium font-semibold text-slate-800"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">
                    Contact Email Address
                  </label>
                  <input
                    type="email"
                    value={contactEmail}
                    onChange={e => setContactEmail(e.target.value)}
                    placeholder="e.g. contact@domain.com"
                    className="input-premium font-semibold text-slate-800"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">
                    Contact Phone Number
                  </label>
                  <input
                    type="tel"
                    value={contactPhone}
                    onChange={e => setContactPhone(e.target.value)}
                    placeholder="e.g. +855 12 345 678"
                    className="input-premium font-semibold text-slate-800"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">
                    Website / Channel URL
                  </label>
                  <input
                    type="url"
                    value={websiteUrl}
                    onChange={e => setWebsiteUrl(e.target.value)}
                    placeholder="e.g. https://www.broadcaster.com"
                    className="input-premium font-semibold text-slate-800"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="card-premium">
              <h3 className="text-sm font-bold text-foreground mb-3">
                Logo / Cover Image
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">
                    Image URL
                  </label>
                  <input
                    type="url"
                    value={logoUrl}
                    onChange={e => setLogoUrl(e.target.value)}
                    placeholder="https://images.unsplash.com/photo-..."
                    className="input-premium font-semibold text-slate-800"
                  />
                </div>
                {logoUrl ? (
                  <div className="relative w-full h-32 rounded-xl overflow-hidden border border-border/60 shadow-sm animate-fadeIn">
                    <img src={logoUrl} alt="Preview" className="w-full h-full object-cover" />
                  </div>
                ) : (
                  <div className="h-32 rounded-xl bg-muted/10 border border-border/40 flex items-center justify-center text-muted-foreground text-xs font-medium">
                    No image URL provided
                  </div>
                )}
              </div>
            </div>

            {/* Status Settings Card */}
            <div className="card-premium">
              <h3 className="text-sm font-bold text-foreground mb-3">
                Status Settings
              </h3>
              <div>
                <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">
                  Partner Status
                </label>
                <div className="relative">
                  <select
                    value={partnerActive ? "active" : "inactive"}
                    onChange={e => setPartnerActive(e.target.value === "active")}
                    className="input-premium font-semibold text-slate-800 cursor-pointer appearance-none animate-fadeIn"
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl border border-border p-4 shadow-sm flex flex-col gap-3">
              <button
                type="submit"
                className="btn-primary w-full py-3 flex items-center justify-center gap-1.5"
              >
                <Save className="w-4 h-4 animate-pulse" />
                {isEdit ? "Update Partner" : "Save Partner"}
              </button>
              <Link
                to={`/home/strategic-partners/${partnerType}`}
                className="btn-outline w-full py-3 text-center"
              >
                Cancel
              </Link>
            </div>
          </div>
        </form>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6 animate-fadeIn relative">
      <AngkorWatWatermark />

      {/* Header Panel - Deep Solid Navy with Gold Line */}
      <div className="bg-gradient-to-r from-[#0A3D91] to-[#082E6E] text-white p-6 rounded-2xl border-b-4 border-b-[#F2C94C] shadow-lg relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/[0.02] rounded-full blur-2xl pointer-events-none" />
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div>
            <h2 className="text-xl font-black uppercase tracking-wider flex items-center gap-2.5 text-[#F2C94C]">
              {isBroadcasterView ? (
                <>
                  <Tv className="w-6 h-6 animate-pulse" />
                  <span>Broadcasters Directory</span>
                </>
              ) : (
                <>
                  <Trophy className="w-6 h-6 animate-pulse" />
                  <span>Official Sponsors Setup</span>
                </>
              )}
            </h2>
            <p className="text-xs text-white/80 mt-2 max-w-2xl leading-relaxed font-semibold">
              {isBroadcasterView 
                ? "Configure broadcasting channels, coverage areas, and network configurations. Updates instantly sync to the event creation panel."
                : "Manage partnerships, brand logos, industry sectors, and sponsor tiers. Changes automatically populate federation sponsor sliders."
              }
            </p>
          </div>
          <Link
            to={`/home/strategic-partners/${partnerType}/new`}
            className="px-4 py-2 bg-[#F2C94C] hover:bg-[#d8b340] text-slate-900 rounded-xl font-extrabold text-xs uppercase tracking-widest shadow-md transition-all active:scale-95 flex items-center gap-1.5 shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>Add {isBroadcasterView ? "Broadcaster" : "Sponsor"}</span>
          </Link>
        </div>
      </div>

      {/* KPI METRIC SUMMARY ROW */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 relative z-10">
        {isBroadcasterView ? (
          <>
            <div className="bg-white border-l-4 border-l-[#0A3D91] border-slate-200/80 rounded-r-2xl p-4 shadow-sm hover:shadow-md transition-all">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Total Broadcasters</span>
              <span className="text-2xl font-black text-slate-800">{totalBroadcasters}</span>
            </div>
            <div className="bg-white border-l-4 border-l-emerald-500 border-slate-200/80 rounded-r-2xl p-4 shadow-sm hover:shadow-md transition-all">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">National Reach</span>
              <span className="text-2xl font-black text-emerald-600">{nationalBroadcasters}</span>
            </div>
            <div className="bg-white border-l-4 border-l-[#F2C94C] border-slate-200/80 rounded-r-2xl p-4 shadow-sm hover:shadow-md transition-all">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Digital Platforms</span>
              <span className="text-2xl font-black text-amber-500">{digitalBroadcasters}</span>
            </div>
            <div className="bg-white border-l-4 border-l-purple-500 border-slate-200/80 rounded-r-2xl p-4 shadow-sm hover:shadow-md transition-all">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Active Status</span>
              <span className="text-2xl font-black text-purple-600">105% SLA</span>
            </div>
          </>
        ) : (
          <>
            <div className="bg-white border-l-4 border-l-[#0A3D91] border-slate-200/80 rounded-r-2xl p-4 shadow-sm hover:shadow-md transition-all">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Total Sponsors</span>
              <span className="text-2xl font-black text-slate-800">{totalSponsors}</span>
            </div>
            <div className="bg-white border-l-4 border-l-indigo-500 border-slate-200/80 rounded-r-2xl p-4 shadow-sm hover:shadow-md transition-all">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Platinum Sponsors</span>
              <span className="text-2xl font-black text-indigo-650">{platinumSponsors}</span>
            </div>
            <div className="bg-white border-l-4 border-l-[#F2C94C] border-slate-200/80 rounded-r-2xl p-4 shadow-sm hover:shadow-md transition-all">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Gold Sponsors</span>
              <span className="text-2xl font-black text-[#b89755]">{goldSponsors}</span>
            </div>
            <div className="bg-white border-l-4 border-l-rose-500 border-slate-200/80 rounded-r-2xl p-4 shadow-sm hover:shadow-md transition-all">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Active Deals</span>
              <span className="text-2xl font-black text-rose-600">100% Verified</span>
            </div>
          </>
        )}
      </div>

      {/* RENDER ACTIVE GRID WALL */}
      <div className="relative z-10">
        {loading ? (
          <div className="bg-white border border-slate-200 rounded-2xl p-16 text-center shadow-sm flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          </div>
        ) : isBroadcasterView ? (
          broadcastStations.length === 0 ? (
            <div className="bg-white border border-slate-200 rounded-2xl p-16 text-center shadow-sm">
              <Tv className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <p className="text-slate-500 font-bold text-sm">No broadcasters registered</p>
              <p className="text-xs text-muted-foreground mt-1 mb-4">Click "Add Partner" to set up a new broadcast partner.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {broadcastStations.map(partner => (
                <GridPartnerCard 
                  key={partner.id} 
                  partner={partner} 
                  type="BROADCAST_PARTNERS"
                  onEdit={(p) => navigate(`/home/strategic-partners/${partnerType}/${p.id}/edit`)}
                  onDelete={handleDelete}
                />
              ))}
            </div>
          )
        ) : (
          sponsors.length === 0 ? (
            <div className="bg-white border border-slate-200 rounded-2xl p-16 text-center shadow-sm">
              <Trophy className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <p className="text-slate-500 font-bold text-sm">No sponsors registered</p>
              <p className="text-xs text-muted-foreground mt-1 mb-4">Click "Add Partner" to set up a new sponsor profile.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {sponsors.map(partner => (
                <GridPartnerCard 
                  key={partner.id} 
                  partner={partner} 
                  type="OFFICIAL_SPONSORS"
                  onEdit={(p) => navigate(`/home/strategic-partners/${partnerType}/${p.id}/edit`)}
                  onDelete={handleDelete}
                />
              ))}
            </div>
          )
        )}
      </div>
    </div>
  );
}
