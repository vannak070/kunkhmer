import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router";
import { BookOpen, ChevronDown, Handshake, Home as HomeIcon, Info, Languages, Menu, Sparkles, Trophy, Users, X } from "lucide-react";
import kkfLogo from "../../../assets/kkf-logo-192.png";
import { GlobalSearch } from "./GlobalSearch";
import { useHubVisible } from "../hub/useHubChat";
import { HeaderAccount } from "./HeaderAccount";
import { appPath } from "../../utils/basePath";
import { useI18n } from "../../i18n/LanguageContext";
import type { MessageKey } from "../../i18n/messages";

/** SuperAppHome sections plus standalone pages that appear in the main navigation. */
export type NavSection = "hub" | "home" | "matches" | "news-events" | "fighters" | "strategic-partners" | "about";

type NavItem = { id: NavSection; labelKey: MessageKey; icon: typeof HomeIcon; /** Shown inside this item's dropdown in the header. */ parent?: NavSection };

/** Flat order (the footer lists them like this); items with a `parent` sit in that item's dropdown in the header. */
export const NAV_ITEMS: NavItem[] = [
  { id: "home", labelKey: "nav.home", icon: HomeIcon },
  { id: "matches", labelKey: "nav.matches", icon: Trophy },
  { id: "news-events", labelKey: "nav.news", icon: BookOpen },
  { id: "fighters", labelKey: "nav.fighters", icon: Users },
  { id: "strategic-partners", labelKey: "nav.partners", icon: Handshake },
  { id: "about", labelKey: "nav.about", icon: Info },
  { id: "hub", labelKey: "nav.hub", icon: Sparkles, parent: "about" },
];

/** Sections that live outside SuperAppHome and are always reached by routing. */
const STANDALONE: NavSection[] = ["hub", "about"];

export function sectionPath(section: NavSection): string {
  return section === "home" ? "/" : `/${section}`;
}

/** Menu items to show: KUNKHMER HUB is left out when the AI is switched off (production only). */
export function useNavItems() {
  const hubVisible = useHubVisible();
  return hubVisible ? NAV_ITEMS : NAV_ITEMS.filter((item) => item.id !== "hub");
}

/** Navigate to a nav section, letting SuperAppHome handle its own sections when it provides a handler. */
export function useNavigateSection(onSectionChange?: (section: NavSection) => void) {
  const navigate = useNavigate();
  return (section: NavSection) => {
    if (onSectionChange && !STANDALONE.includes(section)) onSectionChange(section);
    else navigate(sectionPath(section));
  };
}

interface SiteHeaderProps {
  /** Highlighted nav item. */
  activeSection?: string | null;
  /** Override navigation (SuperAppHome keeps its own section state). Defaults to routing. */
  onSectionChange?: (section: NavSection) => void;
}

function LanguageToggle({ className = "" }: { className?: string }) {
  const { t, toggleLang, lang } = useI18n();
  return (
    <button
      type="button"
      onClick={toggleLang}
      aria-label={t("lang.switchLabel")}
      lang={lang === "en" ? "km" : "en"}
      className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-gray-200 text-sm font-bold text-gray-700 hover:border-[#0A3D91] hover:text-[#0A3D91] transition-colors whitespace-nowrap ${className}`}
    >
      <Languages className="w-4 h-4" aria-hidden />
      {t("lang.switchTo")}
    </button>
  );
}

const DESKTOP_LINK = "flex items-center gap-2 px-3 lg:px-4 py-2.5 rounded-xl whitespace-nowrap text-sm font-bold transition-colors";
const DESKTOP_ACTIVE = "bg-[#0A3D91] text-white shadow-md";
const DESKTOP_IDLE = "text-gray-600 hover:bg-gray-100 hover:text-gray-900";

/** A menu item with sub-pages (About Kun Khmer → About, KUNKHMER HUB). Opens on click; Escape or a click outside closes it. */
function NavDropdown({ item, subItems, activeSection, onGo }: { item: NavItem; subItems: NavItem[]; activeSection?: string | null; onGo: (s: NavSection) => void }) {
  const { t } = useI18n();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const entries = [item, ...subItems];
  const active = entries.some((e) => e.id === activeSection);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (!ref.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        aria-haspopup="true"
        className={`${DESKTOP_LINK} ${active ? DESKTOP_ACTIVE : DESKTOP_IDLE}`}
      >
        <item.icon className="w-4 h-4" aria-hidden />
        {t(item.labelKey)}
        <ChevronDown className={`w-4 h-4 transition-transform ${open ? "rotate-180" : ""}`} aria-hidden />
      </button>
      {open && (
        <ul className="absolute right-0 top-full mt-2 z-50 w-64 rounded-2xl bg-white border border-gray-200 shadow-xl p-2">
          {entries.map(({ id, labelKey, icon: Icon }) => {
            const current = activeSection === id;
            return (
              <li key={id}>
                <a
                  href={appPath(sectionPath(id))}
                  onClick={(e) => {
                    e.preventDefault();
                    setOpen(false);
                    onGo(id);
                  }}
                  aria-current={current ? "page" : undefined}
                  className={`kk-focus flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-bold transition-colors ${
                    current ? "bg-[#eef3fb] text-[var(--kk-blue)]" : id === "hub" ? "text-[var(--kk-blue)] hover:bg-[#eef3fb]" : "text-gray-700 hover:bg-gray-100"
                  }`}
                >
                  <Icon className="w-4 h-4 shrink-0" aria-hidden />
                  {t(labelKey)}
                </a>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

export function SiteHeader({ activeSection, onSectionChange }: SiteHeaderProps) {
  const { t } = useI18n();
  const goSection = useNavigateSection(onSectionChange);
  const navItems = useNavItems();
  const topItems = navItems.filter((item) => !item.parent);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [hidden, setHidden] = useState(false);
  const lastY = useRef(0);

  // Hide on scroll down, reveal on scroll up.
  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY;
      if (y < 10) setHidden(false);
      else if (y > lastY.current && y > 120) setHidden(true);
      else if (y < lastY.current) setHidden(false);
      lastY.current = y;
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const go = (section: NavSection) => {
    setMobileMenuOpen(false);
    goSection(section);
  };

  return (
    <header
      className={`sticky top-0 z-50 bg-white/95 backdrop-blur-xl border-b border-gray-200 shadow-sm transition-transform duration-300 ${
        hidden && !mobileMenuOpen ? "-translate-y-full" : "translate-y-0"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 md:px-6">
        <div className="flex items-center justify-between py-3 md:py-4 gap-4">
          <Link to="/" className="flex items-center gap-3 flex-shrink-0" aria-label="Kun Khmer">
            <img src={kkfLogo} alt="" className="w-12 h-12 md:w-14 md:h-14 object-contain" />
            <div className="hidden sm:block">
              <p className="text-xl md:text-2xl font-black text-gray-900 leading-tight tracking-tight">KUNKHMER</p>
              <p className="text-xs md:text-sm text-gray-500 font-medium leading-tight">{t("brand.tagline")}</p>
            </div>
          </Link>

          <GlobalSearch className="hidden md:block flex-1 max-w-xl" />

          <div className="flex items-center gap-1.5 sm:gap-2">
            <HeaderAccount />
            <LanguageToggle />
            <button
              type="button"
              onClick={() => setMobileMenuOpen((o) => !o)}
              aria-label={mobileMenuOpen ? t("nav.closeMenu") : t("nav.openMenu")}
              aria-expanded={mobileMenuOpen}
              aria-controls="mobile-nav"
              className="md:hidden p-2.5 hover:bg-gray-100 rounded-xl transition-colors"
            >
              {mobileMenuOpen ? <X className="w-6 h-6 text-gray-700" /> : <Menu className="w-6 h-6 text-gray-700" />}
            </button>
          </div>
        </div>

        <nav aria-label={t("nav.main")} className="hidden md:flex flex-wrap items-center gap-1 pb-3">
          {topItems.map((item) => {
            const subItems = navItems.filter((c) => c.parent === item.id);
            return subItems.length > 0 ? (
              <NavDropdown key={item.id} item={item} subItems={subItems} activeSection={activeSection} onGo={go} />
            ) : (
              <a
                key={item.id}
                href={appPath(sectionPath(item.id))}
                onClick={(e) => {
                  e.preventDefault();
                  go(item.id);
                }}
                aria-current={activeSection === item.id ? "page" : undefined}
                className={`${DESKTOP_LINK} ${activeSection === item.id ? DESKTOP_ACTIVE : DESKTOP_IDLE}`}
              >
                <item.icon className="w-4 h-4" aria-hidden />
                {t(item.labelKey)}
              </a>
            );
          })}
        </nav>

        <div className="md:hidden pb-3">
          <GlobalSearch onNavigate={() => setMobileMenuOpen(false)} />
        </div>

        {mobileMenuOpen && (
          <nav id="mobile-nav" aria-label={t("nav.main")} className="md:hidden pb-4 space-y-1">
            {navItems.map(({ id, labelKey, icon: Icon, parent }) => {
              const active = activeSection === id;
              return (
                <a
                  key={id}
                  href={appPath(sectionPath(id))}
                  onClick={(e) => {
                    e.preventDefault();
                    go(id);
                  }}
                  aria-current={active ? "page" : undefined}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-base font-bold transition-colors ${parent ? "pl-12" : ""} ${
                    active ? "bg-[#0A3D91] text-white" : id === "hub" ? "text-[var(--kk-blue)] hover:bg-[#eef3fb]" : "text-gray-700 hover:bg-gray-100"
                  }`}
                >
                  <Icon className="w-5 h-5" aria-hidden />
                  {t(labelKey)}
                </a>
              );
            })}
          </nav>
        )}
      </div>
    </header>
  );
}
