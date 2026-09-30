import { Link } from "react-router";
import { ArrowUp, Handshake, Mail, MapPin } from "lucide-react";
import kkfLogo from "../../../assets/kkf-logo-192.png";
import { NavSection, sectionPath, useNavigateSection, useNavItems } from "./SiteHeader";
import { appPath } from "../../utils/basePath";
import { useI18n } from "../../i18n/LanguageContext";
import { useFederation } from "../../data/federation";

/** Official channels. Leave `url` empty to hide a network until the federation has an account. */
export const SOCIAL_LINKS: { label: string; url: string; path: string }[] = [
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

export const CONTACT_EMAIL = "info@kunkhmer.com";

interface SiteFooterProps {
  onSectionChange?: (section: NavSection) => void;
  /** Sit directly under a full-width band (no top margin). */
  flush?: boolean;
}

/**
 * Light site footer: brand + intro + social, site links, contact and partnership, then the
 * copyright line. No newsletter form until the backend can actually store subscriptions.
 */
export function SiteFooter({ onSectionChange, flush = false }: SiteFooterProps) {
  const { t } = useI18n();
  const go = useNavigateSection(onSectionChange);
  const navItems = useNavItems();
  const federation = useFederation();
  const socials = SOCIAL_LINKS.filter((s) => s.url);
  const partnerMail = `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(t("home.partnerEmailSubject"))}`;

  return (
    <footer className={`bg-[#eef3fb] border-t border-[#d5e0f3] text-gray-700 ${flush ? "" : "mt-20"}`}>
      <div className="max-w-7xl mx-auto px-4 md:px-6 pt-12 md:pt-16 pb-10 grid grid-cols-1 md:grid-cols-12 gap-10 lg:gap-14">
        {/* Brand */}
        <div className="md:col-span-5">
          <div className="flex items-center gap-3">
            <img src={kkfLogo} alt="" className="w-12 h-12 rounded-full bg-white shadow-sm" />
            <div>
              <p className="kk-heading text-2xl text-[var(--kk-navy)] leading-none">KUNKHMER</p>
              <p className="text-xs font-semibold text-[var(--kk-blue)] mt-1">{t("brand.digitalPlatform")}</p>
            </div>
          </div>
          <p className="mt-5 text-sm leading-relaxed text-gray-600 max-w-sm">{t("footer.about")}</p>
          {socials.length > 0 && (
            <div className="mt-6">
              <p className="kk-label text-gray-500 mb-3">{t("footer.followUs")}</p>
              <ul className="flex flex-wrap gap-2">
                {socials.map((social) => (
                  <li key={social.label}>
                    <a
                      href={social.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={t("footer.social", { network: social.label })}
                      className="kk-focus inline-flex items-center gap-2 h-10 px-4 rounded-xl bg-white border border-[#d5e0f3] hover:border-[var(--kk-blue)] text-sm font-semibold text-[var(--kk-navy)] transition-colors"
                    >
                      <svg className="w-4 h-4 text-[var(--kk-blue)]" fill="currentColor" viewBox="0 0 24 24" aria-hidden><path d={social.path} /></svg>
                      {social.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Links */}
        <nav aria-label={t("footer.explore")} className="md:col-span-3">
          <h2 className="kk-label text-gray-500 mb-4">{t("footer.explore")}</h2>
          <ul className="grid grid-cols-2 md:grid-cols-1 gap-x-6 gap-y-2.5">
            {navItems.map(({ id, labelKey }) => (
              <li key={id}>
                <a
                  href={appPath(sectionPath(id))}
                  onClick={(e) => {
                    e.preventDefault();
                    go(id);
                    window.scrollTo(0, 0);
                  }}
                  className="kk-focus text-sm text-gray-700 hover:text-[var(--kk-blue)] transition-colors"
                >
                  {t(labelKey)}
                </a>
              </li>
            ))}
            {federation && (
              <li>
                <Link to="/federation" onClick={() => window.scrollTo(0, 0)} className="kk-focus text-sm text-gray-700 hover:text-[var(--kk-blue)] transition-colors">
                  {t("federation.title")}
                </Link>
              </li>
            )}
          </ul>
        </nav>

        {/* Contact & partnership */}
        <div className="md:col-span-4">
          <h2 className="kk-label text-gray-500 mb-4">{t("footer.contact")}</h2>
          <ul className="space-y-3 text-sm">
            <li className="flex items-start gap-2.5">
              <MapPin className="w-4 h-4 text-[var(--kk-blue)] shrink-0 mt-0.5" aria-hidden />
              <span>{t("footer.location")}</span>
            </li>
            <li className="flex items-start gap-2.5">
              <Mail className="w-4 h-4 text-[var(--kk-blue)] shrink-0 mt-0.5" aria-hidden />
              <a href={`mailto:${CONTACT_EMAIL}`} className="kk-focus hover:text-[var(--kk-blue)] break-all transition-colors">{CONTACT_EMAIL}</a>
            </li>
          </ul>
          <div className="mt-6 rounded-2xl bg-white border border-[#d5e0f3] p-4">
            <p className="font-semibold text-[var(--kk-navy)]">{t("home.partnerKicker")}</p>
            <p className="mt-1 text-sm text-gray-600">{t("footer.partnerText")}</p>
            <a href={partnerMail} className="kk-focus mt-3 inline-flex items-center gap-2 text-sm font-semibold text-[var(--kk-blue)] hover:underline underline-offset-4">
              <Handshake className="w-4 h-4" aria-hidden />
              {t("home.partnerCta")}
            </a>
          </div>
        </div>
      </div>

      <div className="border-t border-[#d5e0f3]">
        <div className="max-w-7xl mx-auto px-4 md:px-6 py-5 flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
          <p className="text-xs text-gray-500">{t("footer.rights", { year: new Date().getFullYear() })} {t("footer.heritage")}</p>
          <button
            type="button"
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            className="kk-focus inline-flex items-center gap-1.5 text-xs font-semibold text-[var(--kk-blue)] hover:underline underline-offset-4"
          >
            <ArrowUp className="w-3.5 h-3.5" aria-hidden />
            {t("footer.backToTop")}
          </button>
        </div>
      </div>
    </footer>
  );
}
