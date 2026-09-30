/**
 * About the Federation (/federation): who the Kun Khmer Federation is, its leadership, how to join,
 * its rules & documents and how to contact it. KKF staff write the content in the admin; only
 * published, filled-in sections are shown. See claude/features/about-federation.md.
 */
import type { ReactNode } from "react";
import { Link } from "react-router";
import { BookOpen, Clock, FileText, Landmark, Mail, MapPin, Phone, Sparkles } from "lucide-react";
import { SiteHeader } from "../components/layout/SiteHeader";
import { SiteFooter } from "../components/layout/SiteFooter";
import { useHubVisible } from "../components/hub/useHubChat";
import { useFederation, type FederationLeader } from "../data/federation";
import { usePageMeta } from "../hooks/usePageTitle";
import { useI18n } from "../i18n/LanguageContext";
import { textLang } from "../utils/publicDisplay";

/** Paragraphs from staff text: blank lines split paragraphs, single line breaks are kept. */
function Paragraphs({ text, className = "" }: { text: string; className?: string }) {
  return (
    <div lang={textLang(text)} className={`space-y-4 whitespace-pre-line ${className}`}>
      {text.split(/\n\s*\n/).map((p, i) => (
        <p key={i}>{p.trim()}</p>
      ))}
    </div>
  );
}

function SectionTitle({ id, children }: { id: string; children: ReactNode }) {
  return <h2 id={id} className="kk-heading text-2xl md:text-3xl text-[var(--kk-navy)] scroll-mt-40">{children}</h2>;
}

const initials = (name: string) =>
  name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();

export function Federation() {
  const { t, lang } = useI18n();
  const data = useFederation();
  const hubVisible = useHubVisible();
  /** Khmer text on the Khmer site when staff wrote it, otherwise English. */
  const pick = (en: string | null, km: string | null) => (lang === "km" && km ? km : en);

  const mission = data ? pick(data.missionEn, data.missionKm) : null;
  usePageMeta({ title: t("federation.title"), description: mission || t("federation.metaDescription") });

  const history = data ? pick(data.historyEn, data.historyKm) : null;
  const register = data ? pick(data.registerEn, data.registerKm) : null;
  const address = data ? pick(data.addressEn, data.addressKm) : null;
  const hours = data ? pick(data.officeHoursEn, data.officeHoursKm) : null;
  const hasContact = !!data && !!(address || hours || data.phone || data.email || data.mapUrl);

  const contents: { id: string; label: string }[] = data
    ? [
        ...(history ? [{ id: "history", label: t("federation.historyTitle") }] : []),
        ...(data.leaders.length ? [{ id: "leadership", label: t("federation.leadersTitle") }] : []),
        ...(register ? [{ id: "register", label: t("federation.registerTitle") }] : []),
        ...(data.documents.length ? [{ id: "documents", label: t("federation.documentsTitle") }] : []),
        ...(hasContact ? [{ id: "contact", label: t("federation.contactTitle") }] : []),
      ]
    : [];

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <SiteHeader activeSection="about" />

      <main className="flex-1 max-w-5xl w-full mx-auto px-4 md:px-6 py-8 md:py-12 space-y-12 md:space-y-16">
        {/* Header */}
        <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#eef3fb] via-white to-[#fdf1f3] border border-[#d5e0f3] px-6 py-8 md:px-10 md:py-12">
          <p className="kk-label text-[var(--kk-red)] flex items-center gap-2">
            <Landmark className="w-4 h-4" aria-hidden />
            {t("federation.eyebrow")}
          </p>
          <h1 className="kk-heading text-4xl md:text-6xl text-[var(--kk-navy)] mt-1">{t("federation.title")}</h1>
          {mission ? (
            <Paragraphs text={mission} className="mt-3 text-base md:text-lg text-gray-700 leading-relaxed max-w-3xl" />
          ) : (
            <p className="mt-3 text-base md:text-lg text-gray-700 leading-relaxed max-w-3xl">{t("federation.lead")}</p>
          )}
          {data?.foundedYear && (
            <p className="mt-4 inline-flex items-center gap-2 rounded-full bg-white border border-[#d5e0f3] px-3.5 py-1.5 text-sm font-semibold text-[var(--kk-navy)]">
              {t("federation.founded", { year: data.foundedYear })}
            </p>
          )}
          {contents.length > 1 && (
            <nav aria-label={t("about.contents")} className="mt-6">
              <ul className="flex flex-wrap gap-2">
                {contents.map((c) => (
                  <li key={c.id}>
                    <a href={`#${c.id}`} className="kk-focus inline-flex items-center h-9 px-3.5 rounded-full bg-white border border-[#d5e0f3] text-sm font-semibold text-[var(--kk-navy)] hover:border-[var(--kk-blue)] transition-colors">
                      {c.label}
                    </a>
                  </li>
                ))}
              </ul>
            </nav>
          )}
        </section>

        {data === undefined && (
          <div className="flex justify-center py-10" role="status" aria-label={t("common.loading")}>
            <div className="w-8 h-8 border-2 border-[var(--kk-blue)] border-t-transparent rounded-full animate-spin" />
          </div>
        )}

        {data === null && (
          <section className="bg-white rounded-3xl border border-gray-200 p-6 md:p-10">
            <h2 className="kk-heading text-2xl md:text-3xl text-[var(--kk-navy)]">{t("federation.emptyTitle")}</h2>
            <p className="text-gray-600 leading-relaxed mt-2 max-w-2xl">{t("federation.emptyText")}</p>
            <div className="mt-5 flex flex-wrap gap-3">
              <Link to="/about" className="kk-focus inline-flex items-center gap-2 h-11 px-5 rounded-xl bg-[var(--kk-blue)] hover:bg-[var(--kk-navy)] text-white text-sm font-semibold transition-colors">
                <BookOpen className="w-4 h-4" aria-hidden />
                {t("federation.guideCta")}
              </Link>
              {hubVisible && (
                <Link to="/hub" className="kk-focus inline-flex items-center gap-2 h-11 px-5 rounded-xl bg-white border border-gray-300 hover:border-[var(--kk-blue)] text-[var(--kk-navy)] text-sm font-semibold transition-colors">
                  <Sparkles className="w-4 h-4" aria-hidden />
                  KUNKHMER HUB
                </Link>
              )}
            </div>
          </section>
        )}

        {data && history && (
          <section aria-labelledby="history" className="grid md:grid-cols-[220px_1fr] gap-4 md:gap-8">
            <SectionTitle id="history">{t("federation.historyTitle")}</SectionTitle>
            <Paragraphs text={history} className="text-gray-700 leading-relaxed text-base md:text-lg" />
          </section>
        )}

        {data && data.leaders.length > 0 && (
          <section aria-labelledby="leadership" className="space-y-5">
            <SectionTitle id="leadership">{t("federation.leadersTitle")}</SectionTitle>
            <ul className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {data.leaders.map((l, i) => (
                <LeaderCard key={i} leader={l} name={pick(l.nameEn, l.nameKm) ?? l.nameEn} role={pick(l.roleEn, l.roleKm) ?? l.roleEn} />
              ))}
            </ul>
          </section>
        )}

        {data && register && (
          <section aria-labelledby="register" className="bg-white rounded-3xl border border-gray-200 p-6 md:p-10 space-y-4">
            <SectionTitle id="register">{t("federation.registerTitle")}</SectionTitle>
            <Paragraphs text={register} className="text-gray-700 leading-relaxed" />
            {hasContact && (
              <a href="#contact" className="kk-focus inline-flex items-center gap-2 text-sm font-semibold text-[var(--kk-blue)] hover:underline underline-offset-4">
                {t("federation.registerContact")}
              </a>
            )}
          </section>
        )}

        {data && data.documents.length > 0 && (
          <section aria-labelledby="documents" className="space-y-5">
            <SectionTitle id="documents">{t("federation.documentsTitle")}</SectionTitle>
            <ul className="grid sm:grid-cols-2 gap-3">
              {data.documents.map((d, i) => {
                const title = pick(d.titleEn, d.titleKm) ?? d.titleEn;
                return (
                  <li key={i}>
                    <a
                      href={d.fileUrl}
                      target="_blank"
                      rel="noopener"
                      className="kk-focus h-full flex items-center gap-4 bg-white rounded-2xl border border-gray-200 p-4 hover:border-[var(--kk-blue)] transition-colors"
                    >
                      <span className="w-11 h-11 rounded-xl bg-[#fdf1f3] text-[var(--kk-red)] flex items-center justify-center shrink-0">
                        <FileText className="w-5 h-5" aria-hidden />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span lang={textLang(title)} className="block font-semibold text-gray-900">{title}</span>
                        <span className="block text-xs font-semibold text-gray-500 mt-0.5">PDF · {t("federation.openDocument")}</span>
                      </span>
                    </a>
                  </li>
                );
              })}
            </ul>
          </section>
        )}

        {data && hasContact && (
          <section aria-labelledby="contact" className="space-y-5">
            <SectionTitle id="contact">{t("federation.contactTitle")}</SectionTitle>
            <div className="grid sm:grid-cols-2 gap-3">
              {(address || data.mapUrl) && (
                <ContactCard icon={<MapPin className="w-5 h-5" aria-hidden />} label={t("federation.office")}>
                  {address && <span lang={textLang(address)} className="whitespace-pre-line">{address}</span>}
                  {data.mapUrl && (
                    <a href={data.mapUrl} target="_blank" rel="noopener noreferrer" className="kk-focus block mt-1 font-semibold text-[var(--kk-blue)] hover:underline underline-offset-4">
                      {t("federation.openMap")}
                    </a>
                  )}
                </ContactCard>
              )}
              {hours && (
                <ContactCard icon={<Clock className="w-5 h-5" aria-hidden />} label={t("federation.hours")}>
                  <span lang={textLang(hours)}>{hours}</span>
                </ContactCard>
              )}
              {data.phone && (
                <ContactCard icon={<Phone className="w-5 h-5" aria-hidden />} label={t("federation.phone")}>
                  <a href={`tel:${data.phone.replace(/[^\d+]/g, "")}`} className="kk-focus font-semibold text-[var(--kk-blue)] hover:underline underline-offset-4">{data.phone}</a>
                </ContactCard>
              )}
              {data.email && (
                <ContactCard icon={<Mail className="w-5 h-5" aria-hidden />} label={t("federation.email")}>
                  <a href={`mailto:${data.email}`} className="kk-focus font-semibold text-[var(--kk-blue)] hover:underline underline-offset-4 break-all">{data.email}</a>
                </ContactCard>
              )}
            </div>
          </section>
        )}
      </main>

      <SiteFooter />
    </div>
  );
}

function LeaderCard({ leader, name, role }: { leader: FederationLeader; name: string; role: string }) {
  return (
    <li className="bg-white rounded-2xl border border-gray-200 p-5 text-center">
      {leader.photoUrl ? (
        <img src={leader.photoUrl} alt="" loading="lazy" className="w-24 h-24 mx-auto rounded-full object-cover bg-gray-100" />
      ) : (
        <span aria-hidden className="w-24 h-24 mx-auto rounded-full bg-[#eef3fb] text-[var(--kk-blue)] flex items-center justify-center kk-heading text-3xl">
          {initials(leader.nameEn)}
        </span>
      )}
      <p lang={textLang(name)} className="mt-4 font-bold text-gray-900 leading-snug">{name}</p>
      <p lang={textLang(role)} className="mt-1 text-sm text-gray-600">{role}</p>
    </li>
  );
}

function ContactCard({ icon, label, children }: { icon: ReactNode; label: string; children: ReactNode }) {
  return (
    <div className="flex items-start gap-4 bg-white rounded-2xl border border-gray-200 p-5">
      <span className="w-11 h-11 rounded-xl bg-[#eef3fb] text-[var(--kk-blue)] flex items-center justify-center shrink-0">{icon}</span>
      <div className="min-w-0 text-gray-800">
        <p className="kk-label text-gray-500 mb-1">{label}</p>
        {children}
      </div>
    </div>
  );
}
