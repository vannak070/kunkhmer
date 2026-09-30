import React, { useState, useEffect } from "react";
import { useParams, Navigate, useLocation, useNavigate, Link } from "react-router";
import { 
  Tv, Trophy, Edit, Trash2, Plus, Globe, Radio, Award,
  Mail, ArrowLeft, Save, User, Phone, Upload, X
} from "lucide-react";
import { toast } from "sonner";
import { api } from "../utils/api";
import { type TextKey, khmerDigits, useT } from "../i18n/program";

/** Stored values (broadcast type, reach, sponsor tier) as shown in the chosen language; the data stays English. */
const VALUE_TEXT: Record<string, TextKey> = {
  "National TV": "par.type.National TV",
  "Cable TV": "par.type.Cable TV",
  "Digital Platform": "par.type.Digital Platform",
  Radio: "par.type.Radio",
  National: "par.reach.National",
  "Urban Areas": "par.reach.Urban Areas",
  "Online/Mobile": "par.reach.Online/Mobile",
  Platinum: "par.tier.Platinum",
  Gold: "par.tier.Gold",
  Silver: "par.tier.Silver",
  Bronze: "par.tier.Bronze",
};
type T = ReturnType<typeof useT>["t"];
const shown = (value: string | null | undefined, t: T) => (value && VALUE_TEXT[value] ? t(VALUE_TEXT[value]) : value ?? "");

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

// ── LIVE CARD PREVIEW SUB-COMPONENT ──────────────────────────────────────────
function LivePartnerPreview({ name, logoUrl, bannerUrl, type, isBroadcaster, contactPerson, contactEmail, contactPhone, websiteUrl, active }: any) {
  const { t } = useT();
  const imageSrc = bannerUrl || logoUrl;
  
  return (
    <div className="space-y-2">
      <div className="text-xs font-bold text-muted-foreground uppercase tracking-wider px-1">{t("par.preview")}</div>
      <div className="bg-white rounded-2xl border border-border overflow-hidden shadow-md flex flex-col relative w-full pointer-events-none opacity-95">
        {/* Image Banner Section */}
        <div className="h-32 relative overflow-hidden bg-muted">
          {imageSrc ? (
            <img 
              src={imageSrc} 
              alt={name} 
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-[#0A3D91] to-[#082E6E] flex items-center justify-center text-white/20 select-none">
              {isBroadcaster ? (
                <Tv className="w-10 h-10 opacity-30" />
              ) : (
                <Trophy className="w-10 h-10 opacity-30" />
              )}
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/20 to-transparent" />
          
          {/* Badge Overlays */}
          <div className="absolute bottom-2.5 left-2.5 right-2.5 flex justify-between items-end">
            {/* Tier/Type badge */}
            <div className="flex items-center gap-1 bg-[#FFFDF5] border border-amber-200/80 text-amber-700 px-2 py-0.5 rounded-full text-[9px] font-semibold shadow-sm">
              {isBroadcaster ? (
                <Radio className="w-2.5 h-2.5 text-amber-500 fill-amber-500/20" />
              ) : (
                <Award className="w-2.5 h-2.5 text-amber-500 fill-amber-500/20" />
              )}
              <span>{type}</span>
            </div>
            
            {/* Active Status Badge */}
            <div className={`badge-premium ${active ? 'badge-emerald' : 'badge-red'} text-[9px] px-2 py-0.5`}>
              <span className={`badge-dot ${active ? 'bg-emerald-500' : 'bg-red-500'}`} />
              {t(active ? "par.active" : "par.inactive")}
            </div>
          </div>
        </div>
        
        {/* Card Content Section */}
        <div className="p-4 flex-1 flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-foreground tracking-tight leading-tight line-clamp-1 mb-1 text-left">
              {name || t("par.namePlaceholder")}
            </h3>
            {/* Subtitle details */}
            <div className="space-y-1 mb-3 text-left border-l-2 border-border pl-2.5">
              {contactPerson && (
                <div className="flex items-center gap-1.5 text-slate-700">
                  <User className="w-3 h-3 text-slate-400 shrink-0" />
                  <span className="text-[10px] font-bold truncate">{contactPerson}</span>
                </div>
              )}
              <div className="flex items-center gap-1.5 text-slate-500">
                <Mail className="w-3 h-3 text-slate-400 shrink-0" />
                <span className="text-[10px] font-medium truncate">
                  {contactEmail || "contact@partner.com"}
                </span>
              </div>
              {contactPhone && (
                <div className="flex items-center gap-1.5 text-slate-500">
                  <Phone className="w-3 h-3 text-slate-400 shrink-0" />
                  <span className="text-[10px] font-medium truncate">{contactPhone}</span>
                </div>
              )}
              {websiteUrl && (
                <div className="flex items-center gap-1.5 text-slate-500">
                  <Globe className="w-3 h-3 text-slate-400 shrink-0" />
                  <span className="text-[10px] font-medium truncate">
                    {websiteUrl.replace(/^https?:\/\/(www\.)?/, '')}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── PARTNER CARD SUB-COMPONENT ──────────────────────────────────────────────
interface GridCardProps {
  partner: any;
  type: PartnerType;
  onEdit: (partner: any) => void;
  onDelete: (id: string) => void;
}

function GridPartnerCard({ partner, type, onEdit, onDelete }: GridCardProps) {
  const { t } = useT();
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
            <span>{isBroadcaster ? shown(partner.type, t) : t("par.tierBadge", { tier: shown(partner.tier, t) })}</span>
          </div>
          
          {/* Active Status Badge */}
          <div className={`badge-premium ${
            partner.active !== false 
              ? 'badge-emerald' 
              : 'badge-red'
          }`}>
            <span className={`badge-dot ${partner.active !== false ? 'bg-emerald-500' : 'bg-red-500'}`} />
            {t(partner.active !== false ? "par.active" : "par.inactive")}
          </div>
        </div>
        
        {/* Action Overlays on Hover */}
        <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-all duration-200 flex gap-2 translate-y-[-5px] group-hover:translate-y-0 z-20">
          <button 
            onClick={(e) => { e.stopPropagation(); onEdit(partner); }}
            className="p-2 bg-white/95 hover:bg-white text-primary border border-border/40 rounded-xl shadow-md backdrop-blur-md transition-all duration-150 hover:scale-105 active:scale-95"
            title={t("par.editPartner")}
          >
            <Edit className="w-4 h-4" />
          </button>
          <button 
            onClick={(e) => { e.stopPropagation(); onDelete(partner.id); }}
            className="p-2 bg-red-50/95 hover:bg-red-500 hover:text-white text-secondary border border-red-100 rounded-xl shadow-md backdrop-blur-md transition-all duration-150 hover:scale-105 active:scale-95"
            title={t("par.deletePartner")}
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
                  <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">{t("par.broadcastType")}</div>
                  <div className="text-xs font-semibold text-slate-800 line-clamp-1">{shown(partner.type, t)}</div>
                </div>
                <div className="bg-muted/15 p-3 rounded-xl border border-border/40 hover:bg-muted/20 hover:border-border/60 transition-all duration-200 flex flex-col justify-between h-[65px] text-left">
                  <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">{t("par.reach")}</div>
                  <div className="text-xs font-semibold text-slate-800 line-clamp-1">{shown(partner.reach, t)}</div>
                </div>
              </>
            ) : (
              <>
                <div className="bg-muted/15 p-3 rounded-xl border border-border/40 hover:bg-muted/20 hover:border-border/60 transition-all duration-200 flex flex-col justify-between h-[65px] text-left">
                  <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">{t("par.industry")}</div>
                  <div className="text-xs font-semibold text-slate-800 line-clamp-1">{partner.industry}</div>
                </div>
                <div className="bg-muted/15 p-3 rounded-xl border border-border/40 hover:bg-muted/20 hover:border-border/60 transition-all duration-200 flex flex-col justify-between h-[65px] text-left">
                  <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">{t("par.tier")}</div>
                  <div className="text-xs font-semibold text-slate-800 line-clamp-1">{shown(partner.tier, t)}</div>
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
          {t("par.editProfile")}
        </button>
      </div>
    </div>
  );
}

// ── MAIN DASHBOARD COMPONENT ────────────────────────────────────────────────
export function StrategicPartners() {
  const { t, lang } = useT();
  // Khmer script: `km-text` (styles/theme.css) removes letter spacing and enlarges the tiny labels.
  const km = lang === "km" ? " km-text" : "";
  const count = (n: number) => (lang === "km" ? khmerDigits(n) : n);
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
  const [bannerUrl, setBannerUrl] = useState("");
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
      toast.error(t("par.loadError"));
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
        setLogoUrl(found.logoUrl || found.logo_url || "");
        setBannerUrl(found.image || "");
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
      setBannerUrl("");
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
    if (!confirm(t(isBroadcasterView ? "par.deleteConfirmBroadcaster" : "par.deleteConfirmSponsor"))) return;
    try {
      if (isBroadcasterView) {
        await api.settings.deleteBroadcastStation(id);
        toast.success(t("par.deletedBroadcaster"));
      } else {
        await api.settings.deleteSponsor(id);
        toast.success(t("par.deletedSponsor"));
      }
      loadData();
    } catch (err) {
      console.error(err);
      toast.error(t("par.deleteError"));
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
            image: bannerUrl.trim() || undefined,
            type: broadcasterType,
            reach: broadcasterReach,
            contactPerson: contactPerson.trim() || undefined,
            contactEmail: contactEmail.trim() || undefined,
            contactPhone: contactPhone.trim() || undefined,
            websiteUrl: websiteUrl.trim() || undefined,
            active: partnerActive
          });
          toast.success(t("par.addedBroadcaster"));
        } else {
          await api.settings.createSponsor({
            name: partnerName.trim(),
            logoUrl: logoUrl.trim() || undefined,
            image: bannerUrl.trim() || undefined,
            industry: sponsorIndustry.trim() || "Corporate Partner",
            tier: sponsorTier,
            contactPerson: contactPerson.trim() || undefined,
            contactEmail: contactEmail.trim() || undefined,
            contactPhone: contactPhone.trim() || undefined,
            websiteUrl: websiteUrl.trim() || undefined,
            active: partnerActive
          });
          toast.success(t("par.addedSponsor"));
        }
      } else {
        // EDIT MODE
        if (isBroadcasterView) {
          await api.settings.updateBroadcastStation(partnerId, {
            name: partnerName.trim(),
            logoUrl: logoUrl.trim() || undefined,
            image: bannerUrl.trim() || undefined,
            type: broadcasterType,
            reach: broadcasterReach,
            contactPerson: contactPerson.trim() || undefined,
            contactEmail: contactEmail.trim() || undefined,
            contactPhone: contactPhone.trim() || undefined,
            websiteUrl: websiteUrl.trim() || undefined,
            active: partnerActive
          });
          toast.success(t("par.updatedBroadcaster"));
        } else {
          await api.settings.updateSponsor(partnerId, {
            name: partnerName.trim(),
            logoUrl: logoUrl.trim() || undefined,
            image: bannerUrl.trim() || undefined,
            industry: sponsorIndustry.trim() || "Corporate Partner",
            tier: sponsorTier,
            contactPerson: contactPerson.trim() || undefined,
            contactEmail: contactEmail.trim() || undefined,
            contactPhone: contactPhone.trim() || undefined,
            websiteUrl: websiteUrl.trim() || undefined,
            active: partnerActive
          });
          toast.success(t("par.updatedSponsor"));
        }
      }
      navigate(`/home/strategic-partners/${partnerType}`);
      loadData();
    } catch (err) {
      console.error(err);
      toast.error(t("par.saveError"));
    }
  };

  if (isFormView) {
    const isEdit = !!partnerId;
    return (
      <div className={`p-4 md:p-8 max-w-4xl mx-auto space-y-6 flex flex-col min-h-full animate-fadeIn relative${km}`}>
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
              {t(isEdit ? "par.editTitle" : "par.addTitle")}
            </h1>
            <p className="text-sm text-muted-foreground mt-1 font-medium">
              {t(isBroadcasterView ? "par.moduleBroadcaster" : "par.moduleSponsor")}
            </p>
          </div>
        </header>

        {/* Form */}
        <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-6 relative z-10">
          
          {/* Left Column: Input Fields */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Partner Information */}
            <div className="card-premium">
              <h2 className="text-base font-bold text-foreground mb-4">
                {t("par.info")}
              </h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">
                    {t("par.name")} <span className="text-[#C8102E]">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={partnerName}
                    onChange={e => setPartnerName(e.target.value)}
                    placeholder={t(isBroadcasterView ? "par.ph.broadcaster" : "par.ph.sponsor")}
                    className="input-premium font-semibold text-slate-800"
                  />
                </div>

                {isBroadcasterView ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">
                        {t("par.broadcastType")}
                      </label>
                      <div className="relative">
                        <select
                          value={broadcasterType}
                          onChange={e => setBroadcasterType(e.target.value as any)}
                          className="input-premium font-semibold text-slate-800 cursor-pointer appearance-none"
                        >
                          <option value="National TV">{t("par.type.National TV")}</option>
                          <option value="Cable TV">{t("par.type.Cable TV")}</option>
                          <option value="Digital Platform">{t("par.type.Digital Platform")}</option>
                          <option value="Radio">{t("par.type.Radio")}</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">
                        {t("par.reach")}
                      </label>
                      <div className="relative">
                        <select
                          value={broadcasterReach}
                          onChange={e => setBroadcasterReach(e.target.value)}
                          className="input-premium font-semibold text-slate-800 cursor-pointer appearance-none"
                        >
                          <option value="National">{t("par.reach.National")}</option>
                          <option value="Urban Areas">{t("par.reach.Urban Areas")}</option>
                          <option value="Online/Mobile">{t("par.reach.Online/Mobile")}</option>
                        </select>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">
                        {t("par.tier")}
                      </label>
                      <div className="relative">
                        <select
                          value={sponsorTier}
                          onChange={e => setSponsorTier(e.target.value as any)}
                          className="input-premium font-semibold text-slate-800 cursor-pointer appearance-none"
                        >
                          <option value="Platinum">{t("par.tier.Platinum")}</option>
                          <option value="Gold">{t("par.tier.Gold")}</option>
                          <option value="Silver">{t("par.tier.Silver")}</option>
                          <option value="Bronze">{t("par.tier.Bronze")}</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">
                        {t("par.industry")}
                      </label>
                      <input
                        type="text"
                        value={sponsorIndustry}
                        onChange={e => setSponsorIndustry(e.target.value)}
                        placeholder={t("par.ph.industry")}
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
                <span>{t("par.contact")}</span>
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">
                    {t("par.contactPerson")}
                  </label>
                  <input
                    type="text"
                    value={contactPerson}
                    onChange={e => setContactPerson(e.target.value)}
                    placeholder={t("par.ph.person")}
                    className="input-premium font-semibold text-slate-800"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">
                    {t("par.contactEmail")}
                  </label>
                  <input
                    type="email"
                    value={contactEmail}
                    onChange={e => setContactEmail(e.target.value)}
                    placeholder={t("par.ph.email")}
                    className="input-premium font-semibold text-slate-800"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">
                    {t("par.contactPhone")}
                  </label>
                  <input
                    type="tel"
                    value={contactPhone}
                    onChange={e => setContactPhone(e.target.value)}
                    placeholder={t("par.ph.phone")}
                    className="input-premium font-semibold text-slate-800"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">
                    {t("par.website")}
                  </label>
                  <input
                    type="url"
                    value={websiteUrl}
                    onChange={e => setWebsiteUrl(e.target.value)}
                    placeholder={t("par.ph.website")}
                    className="input-premium font-semibold text-slate-800"
                  />
                </div>
              </div>
            </div>

            {/* Branding Assets (Logo and Banner upload) */}
            <div className="card-premium">
              <h2 className="text-base font-bold text-foreground mb-4 flex items-center gap-2">
                <Upload className="w-5 h-5 text-primary" />
                <span>{t("par.branding")}</span>
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Logo Upload Dropzone */}
                <div className="space-y-3">
                  <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider">
                    {t("par.logo")}
                  </label>
                  <div className="flex flex-col items-center gap-3">
                    <label className="flex flex-col items-center justify-center w-full h-28 border border-border/80 border-dashed rounded-xl cursor-pointer bg-muted/10 hover:bg-muted/20 transition-all duration-200">
                      <div className="flex flex-col items-center justify-center pt-2 pb-2 px-2 text-center">
                        <Upload className="w-6 h-6 text-muted-foreground mb-1" />
                        <span className="text-xs font-semibold text-primary hover:underline">{t("par.uploadLogo")}</span>
                        <span className="text-[9px] text-muted-foreground mt-0.5">{t("par.logoHint")}</span>
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
                              setLogoUrl(reader.result as string);
                            };
                            reader.readAsDataURL(file);
                          }
                        }}
                      />
                    </label>
                    
                    {logoUrl && (
                      <div className="relative w-20 h-20 rounded-xl overflow-hidden border border-border shadow-sm animate-fadeIn bg-slate-50 flex items-center justify-center">
                        <img src={logoUrl} alt={t("par.logoAlt")} className="w-full h-full object-contain" />
                        <button
                          type="button"
                          onClick={() => setLogoUrl("")}
                          className="absolute -top-1.5 -right-1.5 p-1 bg-red-500 hover:bg-red-600 text-white rounded-full transition-colors shadow-md animate-scaleIn"
                        >
                          <X className="w-2.5 h-2.5" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Banner Upload Dropzone */}
                <div className="space-y-3">
                  <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider">
                    {t("par.banner")}
                  </label>
                  <div className="flex flex-col items-center gap-3">
                    <label className="flex flex-col items-center justify-center w-full h-28 border border-border/80 border-dashed rounded-xl cursor-pointer bg-muted/10 hover:bg-muted/20 transition-all duration-200">
                      <div className="flex flex-col items-center justify-center pt-2 pb-2 px-2 text-center">
                        <Upload className="w-6 h-6 text-muted-foreground mb-1" />
                        <span className="text-xs font-semibold text-primary hover:underline">{t("par.uploadBanner")}</span>
                        <span className="text-[9px] text-muted-foreground mt-0.5">{t("par.bannerHint")}</span>
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
                              setBannerUrl(reader.result as string);
                            };
                            reader.readAsDataURL(file);
                          }
                        }}
                      />
                    </label>

                    {bannerUrl && (
                      <div className="relative w-full h-20 rounded-xl overflow-hidden border border-border shadow-sm animate-fadeIn">
                        <img src={bannerUrl} alt={t("par.bannerAlt")} className="w-full h-full object-cover" />
                        <button
                          type="button"
                          onClick={() => setBannerUrl("")}
                          className="absolute -top-1.5 -right-1.5 p-1 bg-red-500 hover:bg-red-600 text-white rounded-full transition-colors shadow-md animate-scaleIn"
                        >
                          <X className="w-2.5 h-2.5" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>

              </div>
            </div>

          </div>

          {/* Right Column: Live Preview, Status & Actions */}
          <div className="space-y-6">
            
            {/* Live Card Preview */}
            <LivePartnerPreview 
              name={partnerName}
              logoUrl={logoUrl}
              bannerUrl={bannerUrl}
              type={isBroadcasterView ? shown(broadcasterType, t) : t("par.tierBadge", { tier: shown(sponsorTier, t) })}
              isBroadcaster={isBroadcasterView}
              contactPerson={contactPerson}
              contactEmail={contactEmail}
              contactPhone={contactPhone}
              websiteUrl={websiteUrl}
              active={partnerActive}
            />

            {/* Status Settings Card */}
            <div className="card-premium">
              <h3 className="text-sm font-bold text-foreground mb-3">
                {t("par.statusSettings")}
              </h3>
              <div>
                <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">
                  {t("par.status")}
                </label>
                <div className="relative">
                  <select
                    value={partnerActive ? "active" : "inactive"}
                    onChange={e => setPartnerActive(e.target.value === "active")}
                    className="input-premium font-semibold text-slate-800 cursor-pointer appearance-none animate-fadeIn"
                  >
                    <option value="active">{t("par.active")}</option>
                    <option value="inactive">{t("par.inactive")}</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Form Actions */}
            <div className="bg-white rounded-xl border border-border p-4 shadow-sm flex flex-col gap-3">
              <button
                type="submit"
                className="btn-primary w-full py-3 flex items-center justify-center gap-1.5"
              >
                <Save className="w-4 h-4 animate-pulse" />
                {t(isEdit ? "par.update" : "par.save")}
              </button>
              <Link
                to={`/home/strategic-partners/${partnerType}`}
                className="btn-outline w-full py-3 text-center"
              >
                {t("common.cancel")}
              </Link>
            </div>

          </div>
        </form>
      </div>
    );
  }

  return (
    <div className={`max-w-7xl mx-auto space-y-6 animate-fadeIn relative${km}`}>
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
                  <span>{t("par.headBroadcasters")}</span>
                </>
              ) : (
                <>
                  <Trophy className="w-6 h-6 animate-pulse" />
                  <span>{t("par.headSponsors")}</span>
                </>
              )}
            </h2>
            <p className="text-xs text-white/80 mt-2 max-w-2xl leading-relaxed font-semibold">
              {t(isBroadcasterView ? "par.introBroadcasters" : "par.introSponsors")}
            </p>
          </div>
          <Link
            to={`/home/strategic-partners/${partnerType}/new`}
            className="px-4 py-2 bg-[#F2C94C] hover:bg-[#d8b340] text-slate-900 rounded-xl font-extrabold text-xs uppercase tracking-widest shadow-md transition-all active:scale-95 flex items-center gap-1.5 shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>{t(isBroadcasterView ? "par.addBroadcaster" : "par.addSponsor")}</span>
          </Link>
        </div>
      </div>

      {/* KPI METRIC SUMMARY ROW */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 relative z-10">
        {isBroadcasterView ? (
          <>
            <div className="bg-white border-l-4 border-l-[#0A3D91] border-slate-200/80 rounded-r-2xl p-4 shadow-sm hover:shadow-md transition-all">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">{t("par.kpi.totalBroadcasters")}</span>
              <span className="text-2xl font-black text-slate-800">{count(totalBroadcasters)}</span>
            </div>
            <div className="bg-white border-l-4 border-l-emerald-500 border-slate-200/80 rounded-r-2xl p-4 shadow-sm hover:shadow-md transition-all">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">{t("par.kpi.national")}</span>
              <span className="text-2xl font-black text-emerald-600">{count(nationalBroadcasters)}</span>
            </div>
            <div className="bg-white border-l-4 border-l-[#F2C94C] border-slate-200/80 rounded-r-2xl p-4 shadow-sm hover:shadow-md transition-all">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">{t("par.kpi.digital")}</span>
              <span className="text-2xl font-black text-amber-500">{count(digitalBroadcasters)}</span>
            </div>
            <div className="bg-white border-l-4 border-l-purple-500 border-slate-200/80 rounded-r-2xl p-4 shadow-sm hover:shadow-md transition-all">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">{t("par.kpi.activeStatus")}</span>
              <span className="text-2xl font-black text-purple-600">105% SLA</span>
            </div>
          </>
        ) : (
          <>
            <div className="bg-white border-l-4 border-l-[#0A3D91] border-slate-200/80 rounded-r-2xl p-4 shadow-sm hover:shadow-md transition-all">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">{t("par.kpi.totalSponsors")}</span>
              <span className="text-2xl font-black text-slate-800">{count(totalSponsors)}</span>
            </div>
            <div className="bg-white border-l-4 border-l-indigo-500 border-slate-200/80 rounded-r-2xl p-4 shadow-sm hover:shadow-md transition-all">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">{t("par.kpi.platinum")}</span>
              <span className="text-2xl font-black text-indigo-600">{count(platinumSponsors)}</span>
            </div>
            <div className="bg-white border-l-4 border-l-[#F2C94C] border-slate-200/80 rounded-r-2xl p-4 shadow-sm hover:shadow-md transition-all">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">{t("par.kpi.gold")}</span>
              <span className="text-2xl font-black text-[#b89755]">{count(goldSponsors)}</span>
            </div>
            <div className="bg-white border-l-4 border-l-rose-500 border-slate-200/80 rounded-r-2xl p-4 shadow-sm hover:shadow-md transition-all">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">{t("par.kpi.deals")}</span>
              <span className="text-2xl font-black text-rose-600">{t("par.kpi.verified")}</span>
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
              <p className="text-slate-500 font-bold text-sm">{t("par.emptyBroadcasters")}</p>
              <p className="text-xs text-muted-foreground mt-1 mb-4">{t("par.emptyBroadcastersText")}</p>
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
              <p className="text-slate-500 font-bold text-sm">{t("par.emptySponsors")}</p>
              <p className="text-xs text-muted-foreground mt-1 mb-4">{t("par.emptySponsorsText")}</p>
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
