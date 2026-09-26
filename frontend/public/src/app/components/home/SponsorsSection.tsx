import { useState } from "react";
import { ArrowRight, Handshake, ExternalLink } from "lucide-react";
import type { MessageKey } from "../../i18n/messages";
import { useI18n } from "../../i18n/LanguageContext";

interface Sponsor {
  id: string;
  name: string;
  logo: string;
  image?: string;
  industry: string;
  tier: "platinum" | "gold" | "silver" | "bronze";
  eventsSponsored: number;
  website_url?: string;
  websiteUrl?: string;
}

interface SponsorsSectionProps {
  sponsors: Sponsor[];
  onViewAllClick: () => void;
}

const TIER_ORDER = ["platinum", "gold", "silver", "bronze"];

const TIER_LABEL: Record<string, MessageKey> = {
  platinum: "tier.platinum",
  gold: "tier.gold",
  silver: "tier.silver",
  bronze: "tier.bronze",
};

const TIER_COLOR: Record<string, string> = {
  platinum: "bg-violet-50 text-violet-700 border-violet-200",
  gold: "bg-amber-50 text-amber-700 border-amber-200",
  silver: "bg-slate-100 text-slate-600 border-slate-200",
  bronze: "bg-orange-50 text-orange-700 border-orange-200",
};

const TIER_BADGE_BG: Record<string, string> = {
  platinum: "from-violet-600 to-purple-700",
  gold: "from-amber-500 to-yellow-600",
  silver: "from-slate-400 to-slate-500",
  bronze: "from-orange-500 to-amber-700",
};

export default function SponsorsSection({ sponsors, onViewAllClick }: SponsorsSectionProps) {
  const { t } = useI18n();
  const [selectedSponsorId, setSelectedSponsorId] = useState<string | null>(null);

  const sortedSponsors = [...sponsors].sort(
    (a, b) => TIER_ORDER.indexOf(a.tier) - TIER_ORDER.indexOf(b.tier)
  );

  const displayFeatured =
    sortedSponsors.find((s) => s.id === selectedSponsorId) ||
    sortedSponsors.find((s) => s.tier === "platinum") ||
    sortedSponsors[0];

  return (
    <section className="relative bg-white rounded-[28px] overflow-hidden border border-slate-200/80 shadow-xl">
      {/* Background Accents */}
      <div className="absolute -top-32 -right-32 w-96 h-96 bg-[#0A3D91]/4 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-32 -left-32 w-96 h-96 bg-[#F2C94C]/8 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2">

        {/* ── LEFT COLUMN ─────────────────────────────────── */}
        <div className="flex flex-col gap-3 px-8 py-8 border-b lg:border-b-0 lg:border-r border-slate-100">

          {/* Header row: title + View All */}
          <div className="flex items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-[#0A3D91]/8 rounded-full border border-[#0A3D91]/15">
                <Handshake className="w-3 h-3 text-[#0A3D91]" />
                <span className="text-[10px] font-extrabold text-[#0A3D91] uppercase tracking-widest">
                  {t("home.partnersBadge")}
                </span>
              </div>
              <h2 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight leading-tight">
                {t("home.partnersTitle")}
              </h2>
            </div>
            <button
              onClick={onViewAllClick}
              className="group flex-shrink-0 flex items-center gap-2 px-4 py-2 rounded-xl bg-[#0A3D91] hover:bg-[#0d4ab0] text-white text-[11px] font-bold uppercase tracking-wider shadow-md shadow-[#0A3D91]/20 hover:shadow-lg transition-all duration-300 hover:-translate-y-px active:scale-95"
            >
              {t("common.viewAll")}
              <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
            </button>
          </div>

          {/* Description */}
          <p className="text-slate-500 text-sm font-medium leading-relaxed">
            {t("home.partnersText")}
          </p>

          {/* Divider */}
          <div className="h-px bg-gradient-to-r from-slate-200 via-slate-100 to-transparent" />

          {/* Logo grid label */}
          <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">
            {t("home.partnersPick")}
          </p>

          {/* Logo grid */}
          <div className="flex flex-wrap gap-3">
            {sortedSponsors.map((sponsor) => {
              const isSelected = displayFeatured?.id === sponsor.id;
              return (
                <button
                  key={sponsor.id}
                  onClick={() => setSelectedSponsorId(sponsor.id)}
                  title={sponsor.name}
                  className={`group relative w-[76px] h-[76px] rounded-full flex-shrink-0 flex items-center justify-center overflow-hidden transition-all duration-300 cursor-pointer focus:outline-none ${
                    isSelected
                      ? "shadow-lg shadow-[#0A3D91]/20 scale-110"
                      : "hover:shadow-md hover:scale-105"
                  }`}
                >
                  <img
                    src={sponsor.logo}
                    alt={sponsor.name}
                    className={`w-full h-full object-cover transition-all duration-300 ${
                      isSelected
                        ? "grayscale-0 opacity-100"
                        : "grayscale opacity-50 group-hover:grayscale-0 group-hover:opacity-90"
                    }`}
                  />
                  <span className="absolute -bottom-6 left-1/2 -translate-x-1/2 whitespace-nowrap text-[10px] font-semibold text-slate-600 bg-white/95 px-2 py-0.5 rounded-full border border-slate-200 shadow-sm opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-20">
                    {sponsor.name}
                  </span>
                </button>
              );
            })}

            {sortedSponsors.length === 0 && (
              <div className="w-full py-6 text-center text-slate-400 text-sm font-medium border border-dashed border-slate-200 rounded-2xl">
                No partners found
              </div>
            )}
          </div>

          {/* Tier Legend */}
          <div className="flex flex-wrap items-center gap-2 border-t border-slate-100 pt-3">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{t("tier.label")}:</span>
            {Object.entries(TIER_LABEL).map(([key, label]) => (
              <span key={key} className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${TIER_COLOR[key]}`}>
                {t(label)}
              </span>
            ))}
          </div>

        </div>

        {/* ── RIGHT COLUMN ────────────────────────────────── */}
        <div className="flex flex-col px-8 py-8">
          {displayFeatured ? (
            <div className="flex flex-col gap-4 h-full">

              {/* Banner */}
              <div className="relative w-full aspect-[16/9] rounded-2xl overflow-hidden bg-slate-50 border border-slate-200 shadow-sm flex items-center justify-center">
                {displayFeatured.image ? (
                  <img
                    src={displayFeatured.image}
                    alt={displayFeatured.name}
                    className="w-full h-full object-cover transition-transform duration-700 hover:scale-105"
                  />
                ) : (
                  <img
                    src={displayFeatured.logo}
                    alt={displayFeatured.name}
                    className="max-w-[55%] max-h-[55%] object-contain"
                  />
                )}
                {/* Tier Badge */}
                {displayFeatured.tier && (
                  <div className={`absolute top-3 left-3 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gradient-to-r ${TIER_BADGE_BG[displayFeatured.tier]} shadow-lg`}>
                    <span className="w-1.5 h-1.5 bg-white/80 rounded-full animate-pulse" />
                    <span className="text-[10px] font-black text-white uppercase tracking-widest">
                      {t("tier.sponsor", { tier: TIER_LABEL[displayFeatured.tier] ? t(TIER_LABEL[displayFeatured.tier]) : displayFeatured.tier })}
                    </span>
                  </div>
                )}
              </div>

              {/* Name + Category + Visit Website */}
              <div className="flex items-start justify-between gap-4">
                <div className="space-y-1">
                  <h3 className="text-xl md:text-2xl font-black text-slate-900 tracking-tight leading-tight">
                    {displayFeatured.name}
                  </h3>
                  {displayFeatured.industry && (
                    <div className="flex items-center gap-2">
                      <span className="w-1 h-1 bg-[#0A3D91] rounded-full" />
                      <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                        {displayFeatured.industry}
                      </span>
                    </div>
                  )}
                </div>
                <a
                  href={displayFeatured.websiteUrl || displayFeatured.website_url || undefined}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(e) => {
                    const url = displayFeatured.websiteUrl || displayFeatured.website_url;
                    if (!url) e.preventDefault();
                  }}
                  className={`group flex-shrink-0 inline-flex items-center gap-2 px-4 py-2 rounded-xl border text-xs font-black uppercase tracking-wider transition-all duration-300 shadow-sm hover:shadow-md active:scale-95 ${
                    (displayFeatured.websiteUrl || displayFeatured.website_url)
                      ? "border-[#0A3D91]/20 bg-[#0A3D91]/5 hover:bg-[#0A3D91] text-[#0A3D91] hover:text-white cursor-pointer"
                      : "border-slate-200 bg-slate-50 text-slate-300 cursor-not-allowed"
                  }`}
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  {t("home.visitWebsite")}
                </a>
              </div>

            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-slate-400 text-sm font-medium py-12">
              <Handshake className="w-10 h-10 mb-3 opacity-30" />
              <p>{t("home.partnersEmpty")}</p>
            </div>
          )}
        </div>

      </div>
    </section>
  );
}
