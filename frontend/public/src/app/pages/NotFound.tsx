/** "Page not found" for unknown URLs (instead of silently jumping to the home page). */
import { Link } from "react-router";
import { ArrowRight, CalendarDays, Home, Search, Users } from "lucide-react";
import { SiteHeader } from "../components/layout/SiteHeader";
import { SiteFooter } from "../components/layout/SiteFooter";
import { usePageMeta } from "../hooks/usePageTitle";
import { useI18n } from "../i18n/LanguageContext";

/** Just the content, for use inside a page that already has the header and footer. */
export function NotFoundContent() {
  const { t } = useI18n();
  usePageMeta({ title: t("notFound.title"), description: t("notFound.text") });
  const links = [
    { to: "/", icon: Home, label: t("nav.home") },
    { to: "/matches", icon: CalendarDays, label: t("nav.matches") },
    { to: "/fighters", icon: Users, label: t("nav.fighters") },
  ];
  return (
    <div className="max-w-2xl mx-auto px-4 py-20 md:py-28 text-center">
      <p className="kk-display text-7xl md:text-8xl text-[var(--kk-blue)]/20" aria-hidden>404</p>
      <h1 className="kk-heading text-3xl md:text-4xl text-[var(--kk-navy)] mt-2">{t("notFound.title")}</h1>
      <p className="text-gray-600 mt-3">{t("notFound.text")}</p>
      <p className="text-sm text-gray-500 mt-4 inline-flex items-center gap-2"><Search className="w-4 h-4" aria-hidden />{t("notFound.searchTip")}</p>
      <ul className="mt-8 grid sm:grid-cols-3 gap-3 text-left">
        {links.map(({ to, icon: Icon, label }) => (
          <li key={to}>
            <Link to={to} className="kk-focus flex items-center justify-between gap-2 rounded-2xl border border-gray-200 bg-white px-4 h-14 font-semibold text-gray-800 hover:border-[var(--kk-blue)]/40 hover:shadow-sm">
              <span className="inline-flex items-center gap-2"><Icon className="w-4 h-4 text-[var(--kk-blue)]" aria-hidden />{label}</span>
              <ArrowRight className="w-4 h-4 text-gray-400" aria-hidden />
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function NotFound() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <SiteHeader />
      <main className="flex-1"><NotFoundContent /></main>
      <SiteFooter />
    </div>
  );
}
