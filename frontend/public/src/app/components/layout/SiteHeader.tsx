import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router";
import { BookOpen, Handshake, Home as HomeIcon, Menu, Trophy, Users, X } from "lucide-react";
import kkfLogo from "figma:asset/a66d0715b1669c88badc1b57f275bd3b2182d59e.png";
import { GlobalSearch } from "./GlobalSearch";
import { appPath } from "../../utils/basePath";

export type NavSection = "home" | "matches" | "news-events" | "fighters" | "strategic-partners";

export const NAV_ITEMS: { id: NavSection; label: string; icon: typeof HomeIcon }[] = [
  { id: "home", label: "Home", icon: HomeIcon },
  { id: "matches", label: "Matches & Events", icon: Trophy },
  { id: "news-events", label: "News & Media", icon: BookOpen },
  { id: "fighters", label: "Fighters", icon: Users },
  { id: "strategic-partners", label: "Partners", icon: Handshake },
];

export function sectionPath(section: NavSection): string {
  return section === "home" ? "/" : `/${section}`;
}

interface SiteHeaderProps {
  /** Highlighted nav item. */
  activeSection?: string | null;
  /** Override navigation (SuperAppHome keeps its own section state). Defaults to routing. */
  onSectionChange?: (section: NavSection) => void;
}

export function SiteHeader({ activeSection, onSectionChange }: SiteHeaderProps) {
  const navigate = useNavigate();
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
    if (onSectionChange) onSectionChange(section);
    else navigate(sectionPath(section));
  };

  return (
    <header
      className={`sticky top-0 z-50 bg-white/95 backdrop-blur-xl border-b border-gray-200 shadow-sm transition-transform duration-300 ${
        hidden && !mobileMenuOpen ? "-translate-y-full" : "translate-y-0"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 md:px-6">
        <div className="flex items-center justify-between py-3 md:py-4 gap-4">
          <Link to="/" className="flex items-center gap-3 flex-shrink-0" aria-label="Kun Khmer home">
            <img src={kkfLogo} alt="" className="w-12 h-12 md:w-14 md:h-14 object-contain" />
            <div className="hidden sm:block">
              <p className="text-xl md:text-2xl font-black text-gray-900 leading-tight tracking-tight">KUNKHMER</p>
              <p className="text-xs md:text-sm text-gray-500 font-medium leading-tight">Official Platform</p>
            </div>
          </Link>

          <GlobalSearch className="hidden md:block flex-1 max-w-xl" />

          <button
            type="button"
            onClick={() => setMobileMenuOpen((o) => !o)}
            aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
            aria-expanded={mobileMenuOpen}
            aria-controls="mobile-nav"
            className="md:hidden p-2.5 hover:bg-gray-100 rounded-xl transition-colors"
          >
            {mobileMenuOpen ? <X className="w-6 h-6 text-gray-700" /> : <Menu className="w-6 h-6 text-gray-700" />}
          </button>
        </div>

        <nav aria-label="Main" className="hidden md:flex items-center gap-1 pb-3 overflow-x-auto">
          {NAV_ITEMS.map(({ id, label, icon: Icon }) => {
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
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl whitespace-nowrap text-sm font-bold transition-colors ${
                  active ? "bg-[#0A3D91] text-white shadow-md" : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                }`}
              >
                <Icon className="w-4 h-4" aria-hidden />
                {label}
              </a>
            );
          })}
        </nav>

        <div className="md:hidden pb-3">
          <GlobalSearch onNavigate={() => setMobileMenuOpen(false)} />
        </div>

        {mobileMenuOpen && (
          <nav id="mobile-nav" aria-label="Main" className="md:hidden pb-4 space-y-1">
            {NAV_ITEMS.map(({ id, label, icon: Icon }) => {
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
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-base font-bold transition-colors ${
                    active ? "bg-[#0A3D91] text-white" : "text-gray-700 hover:bg-gray-100"
                  }`}
                >
                  <Icon className="w-5 h-5" aria-hidden />
                  {label}
                </a>
              );
            })}
          </nav>
        )}
      </div>
    </header>
  );
}
