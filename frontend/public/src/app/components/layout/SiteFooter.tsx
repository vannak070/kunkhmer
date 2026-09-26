import { useState } from "react";
import { Mail, MapPin } from "lucide-react";
import { toast } from "sonner";
import kkfLogo from "../../../assets/kkf-logo-192.png";
import { NAV_ITEMS, NavSection, sectionPath, useNavigateSection } from "./SiteHeader";
import { appPath } from "../../utils/basePath";
import { useI18n } from "../../i18n/LanguageContext";

/** Official channels. Leave `url` empty to hide a network until the federation has an account. */
const SOCIAL_LINKS: { label: string; url: string; path: string }[] = [
  {
    label: "Facebook",
    url: "https://www.facebook.com/kkfcambodia",
    path: "M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z",
  },
  {
    label: "YouTube",
    url: "",
    path: "M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z",
  },
  {
    label: "Instagram",
    url: "",
    path: "M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0 3.675a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zm0 10.162a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.406-11.845a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.881z",
  },
];

const CONTACT_EMAIL = "info@kunkhmer.com";

interface SiteFooterProps {
  onSectionChange?: (section: NavSection) => void;
}

export function SiteFooter({ onSectionChange }: SiteFooterProps) {
  const { t } = useI18n();
  const go = useNavigateSection(onSectionChange);
  const [email, setEmail] = useState("");
  const socials = SOCIAL_LINKS.filter((s) => s.url);

  const subscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      toast.error(t("footer.invalidEmail"));
      return;
    }
    // TODO: POST to the newsletter endpoint once the backend provides one.
    toast.success(t("footer.subscribed"));
    setEmail("");
  };

  return (
    <footer className="relative bg-[#051C42] text-white overflow-hidden mt-20">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/15 to-transparent" />
        <div className="absolute -top-32 -left-32 w-[500px] h-[500px] rounded-full opacity-[0.12]" style={{ background: "radial-gradient(circle, #0A3D91 0%, transparent 65%)" }} />
        <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full opacity-[0.08]" style={{ background: "radial-gradient(circle, #C8102E 0%, transparent 70%)" }} />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-6 md:px-8">
        <div className="pt-16 pb-12 grid grid-cols-1 md:grid-cols-12 gap-10 lg:gap-14">
          <div className="md:col-span-5">
            <div className="flex items-center gap-3 mb-5">
              <div className="flex items-center justify-center w-12 h-12 bg-white rounded-xl shadow-lg shadow-black/40 shrink-0">
                <img src={kkfLogo} alt="" className="w-9 h-9 object-contain" />
              </div>
              <div>
                <p className="text-xl font-black tracking-tight leading-none">KUNKHMER</p>
                <p className="text-[10px] text-[#F2C94C] font-bold tracking-[0.15em] uppercase mt-0.5">{t("brand.digitalPlatform")}</p>
              </div>
            </div>
            <p className="text-white/60 text-sm leading-relaxed mb-6 max-w-sm">
              {t("footer.about")}
            </p>
            {socials.length > 0 && (
              <div className="flex gap-2.5">
                {socials.map((social) => (
                  <a
                    key={social.label}
                    href={social.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={t("footer.social", { network: social.label })}
                    className="group w-10 h-10 rounded-xl bg-white/5 border border-white/10 hover:bg-[#0A3D91]/60 hover:border-[#0A3D91] flex items-center justify-center transition-colors"
                  >
                    <svg className="w-4 h-4 text-white/60 group-hover:text-white transition-colors" fill="currentColor" viewBox="0 0 24 24" aria-hidden>
                      <path d={social.path} />
                    </svg>
                  </a>
                ))}
              </div>
            )}
          </div>

          <div className="md:col-span-7 grid grid-cols-2 sm:grid-cols-2 gap-8">
            <div>
              <h2 className="text-[11px] font-extrabold text-[#F2C94C] tracking-[0.15em] uppercase mb-4">{t("footer.explore")}</h2>
              <ul className="space-y-2.5">
                {NAV_ITEMS.map(({ id, labelKey }) => (
                  <li key={id}>
                    <a
                      href={appPath(sectionPath(id))}
                      onClick={(e) => {
                        e.preventDefault();
                        go(id);
                        window.scrollTo(0, 0);
                      }}
                      className="text-white/60 hover:text-white text-sm transition-colors"
                    >
                      {t(labelKey)}
                    </a>
                  </li>
                ))}
                <li className="text-white/40 text-sm">
                  {t("footer.shop")} <span className="ml-1 text-[10px] font-bold uppercase tracking-wider text-[#F2C94C]/80">{t("footer.comingSoon")}</span>
                </li>
              </ul>
            </div>

            <div>
              <h2 className="text-[11px] font-extrabold text-[#F2C94C] tracking-[0.15em] uppercase mb-4">{t("footer.contact")}</h2>
              <ul className="space-y-3">
                <li className="flex items-start gap-2">
                  <MapPin className="w-4 h-4 text-white/40 shrink-0 mt-0.5" aria-hidden />
                  <span className="text-white/60 text-sm">{t("footer.location")}</span>
                </li>
                <li className="flex items-start gap-2">
                  <Mail className="w-4 h-4 text-white/40 shrink-0 mt-0.5" aria-hidden />
                  <a href={`mailto:${CONTACT_EMAIL}`} className="text-white/60 hover:text-white text-sm transition-colors break-all">
                    {CONTACT_EMAIL}
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </div>

        <form
          onSubmit={subscribe}
          className="py-7 px-6 md:px-8 mb-10 rounded-2xl bg-[#0A3D91]/30 border border-white/[0.07] flex flex-col sm:flex-row items-center justify-between gap-5"
        >
          <div>
            <p className="font-bold text-sm text-white">{t("footer.newsletterTitle")}</p>
            <p className="text-white/55 text-xs mt-0.5">{t("footer.newsletterText")}</p>
          </div>
          <div className="flex gap-2 w-full sm:w-auto">
            <label htmlFor="newsletter-email" className="sr-only">{t("footer.emailLabel")}</label>
            <input
              id="newsletter-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={t("footer.emailPlaceholder")}
              autoComplete="email"
              className="flex-1 min-w-0 sm:w-64 px-4 py-2.5 rounded-xl bg-white/5 border border-white/15 text-sm text-white placeholder:text-white/40 focus:outline-none focus:border-white/40 transition-colors"
            />
            <button type="submit" className="px-5 py-2.5 rounded-xl bg-[#F2C94C] hover:bg-[#E8BC34] text-[#051C42] text-sm font-bold transition-colors whitespace-nowrap">
              {t("footer.subscribe")}
            </button>
          </div>
        </form>

        <div className="h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />

        <div className="py-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
          <p className="text-white/45 text-xs">{t("footer.rights", { year: new Date().getFullYear() })}</p>
          <p className="text-white/35 text-xs">{t("footer.heritage")}</p>
        </div>
      </div>
    </footer>
  );
}
