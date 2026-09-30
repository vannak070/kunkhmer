/**
 * About (/about): a newcomer's guide to Kun Khmer — history, how a fight works, how to watch and a
 * glossary — in the site's light style. See claude/updates/public-about-page.md.
 */
import { Link } from "react-router";
import { ArrowRight, BookOpen, CalendarDays, Clock, Landmark, Music, Scale, Swords, Trophy, Tv, Users } from "lucide-react";
import { SiteHeader } from "../components/layout/SiteHeader";
import { SiteFooter } from "../components/layout/SiteFooter";
import { HubAskAbout } from "../components/hub/HubAskAbout";
import { useHubVisible } from "../components/hub/useHubChat";
import { useFederation } from "../data/federation";
import { usePageMeta } from "../hooks/usePageTitle";
import { useI18n } from "../i18n/LanguageContext";
import type { MessageKey } from "../i18n/messages";

const QUICK_FACTS: { icon: typeof Clock; title: MessageKey; text: MessageKey }[] = [
  { icon: Clock, title: "about.quick1Title", text: "about.quick1Text" },
  { icon: Swords, title: "about.quick2Title", text: "about.quick2Text" },
  { icon: Music, title: "about.quick3Title", text: "about.quick3Text" },
];

const FIGHT_STEPS: { icon: typeof Scale; title: MessageKey; text: MessageKey }[] = [
  { icon: Scale, title: "about.rule1Title", text: "about.rule1Text" },
  { icon: Swords, title: "about.rule2Title", text: "about.rule2Text" },
  { icon: Trophy, title: "about.rule3Title", text: "about.rule3Text" },
];

const GLOSSARY: { term: MessageKey; text: MessageKey }[] = [
  { term: "about.glossary.kunKru", text: "about.glossary.kunKruText" },
  { term: "about.glossary.weighIn", text: "about.glossary.weighInText" },
  { term: "about.glossary.title", text: "about.glossary.titleText" },
  { term: "about.glossary.catchweight", text: "about.glossary.catchweightText" },
  { term: "about.glossary.grade", text: "about.glossary.gradeText" },
  { term: "about.glossary.wld", text: "about.glossary.wldText" },
];

const HUB_QUESTIONS: MessageKey[] = ["hub.qKunKru", "about.hubQ2", "about.hubQ3"];

function SectionTitle({ id, children }: { id: string; children: React.ReactNode }) {
  return <h2 id={id} className="kk-heading text-2xl md:text-3xl text-[var(--kk-navy)] scroll-mt-40">{children}</h2>;
}

export function AboutKunKhmer() {
  const { t } = useI18n();
  const hubVisible = useHubVisible();
  const federation = useFederation();
  usePageMeta({ title: t("about.metaTitle"), description: t("about.metaDescription"), type: "article" });

  const contents: { id: string; label: string }[] = [
    { id: "history", label: t("about.historyTitle") },
    { id: "rules", label: t("about.rulesTitle") },
    { id: "watch", label: t("about.watchTitle") },
    { id: "glossary", label: t("about.glossaryTitle") },
    ...(hubVisible ? [{ id: "ask", label: t("about.hubTitle") }] : []),
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <SiteHeader activeSection="about" />

      <main className="flex-1 max-w-5xl w-full mx-auto px-4 md:px-6 py-8 md:py-12 space-y-12 md:space-y-16">
        {/* Header */}
        <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#eef3fb] via-white to-[#fdf1f3] border border-[#d5e0f3] px-6 py-8 md:px-10 md:py-12">
          <p className="kk-label text-[var(--kk-red)] flex items-center gap-2">
            <BookOpen className="w-4 h-4" aria-hidden />
            {t("about.eyebrow")}
          </p>
          <h1 className="kk-heading text-4xl md:text-6xl text-[var(--kk-navy)] mt-1">{t("about.title")}</h1>
          <p className="mt-3 text-base md:text-lg text-gray-700 leading-relaxed max-w-3xl">{t("about.lead")}</p>
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
        </section>

        {/* Quick facts */}
        <section aria-label={t("about.quickFacts")} className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {QUICK_FACTS.map(({ icon: Icon, title, text }) => (
            <div key={title} className="bg-white rounded-2xl border border-gray-200 p-6">
              <div className="w-11 h-11 rounded-xl bg-[#eef3fb] text-[var(--kk-blue)] flex items-center justify-center mb-4">
                <Icon className="w-5 h-5" aria-hidden />
              </div>
              <h2 className="kk-heading text-2xl text-gray-900">{t(title)}</h2>
              <p className="text-sm text-gray-600 leading-relaxed mt-1">{t(text)}</p>
            </div>
          ))}
        </section>

        {/* History */}
        <section aria-labelledby="history" className="grid md:grid-cols-[220px_1fr] gap-4 md:gap-8">
          <SectionTitle id="history">{t("about.historyTitle")}</SectionTitle>
          <div className="space-y-4 text-gray-700 leading-relaxed text-base md:text-lg">
            <p>{t("about.historyText1")}</p>
            <p>{t("about.historyText2")}</p>
          </div>
        </section>

        {/* How a fight works */}
        <section aria-labelledby="rules" className="space-y-5">
          <SectionTitle id="rules">{t("about.rulesTitle")}</SectionTitle>
          <ol className="grid md:grid-cols-3 gap-4">
            {FIGHT_STEPS.map(({ icon: Icon, title, text }, i) => (
              <li key={title} className="relative bg-white rounded-2xl border border-gray-200 p-6">
                <span className="absolute top-5 right-5 kk-stat text-4xl text-[#eef3fb]" aria-hidden>{i + 1}</span>
                <Icon className="w-6 h-6 text-[var(--kk-red)] mb-3" aria-hidden />
                <h3 className="font-bold text-lg text-gray-900 mb-1.5">{t(title)}</h3>
                <p className="text-sm text-gray-600 leading-relaxed">{t(text)}</p>
              </li>
            ))}
          </ol>
          <div className="flex flex-col sm:flex-row sm:items-center gap-4 bg-white rounded-2xl border border-gray-200 p-6">
            <div className="flex shrink-0" aria-hidden>
              <span className="w-10 h-10 rounded-full bg-[var(--kk-red)] border-4 border-white shadow" />
              <span className="w-10 h-10 rounded-full bg-[var(--kk-blue)] border-4 border-white shadow -ml-3" />
            </div>
            <div>
              <h3 className="font-bold text-lg text-gray-900">{t("about.cornerTitle")}</h3>
              <p className="text-sm text-gray-600 leading-relaxed">{t("about.cornerText")}</p>
            </div>
          </div>
        </section>

        {/* How to watch */}
        <section aria-labelledby="watch" className="bg-white rounded-3xl border border-gray-200 p-6 md:p-10 flex flex-col md:flex-row md:items-center gap-6">
          <div className="w-14 h-14 rounded-2xl bg-[#eef3fb] text-[var(--kk-blue)] flex items-center justify-center shrink-0">
            <Tv className="w-7 h-7" aria-hidden />
          </div>
          <div className="flex-1">
            <SectionTitle id="watch">{t("about.watchTitle")}</SectionTitle>
            <p className="text-gray-600 leading-relaxed mt-2">{t("about.watchText")}</p>
          </div>
          <Link
            to="/matches?tab=events"
            className="kk-focus inline-flex items-center justify-center gap-2 h-11 px-5 rounded-xl bg-[var(--kk-blue)] hover:bg-[var(--kk-navy)] text-white text-sm font-semibold transition-colors whitespace-nowrap"
          >
            <CalendarDays className="w-4 h-4" aria-hidden />
            {t("about.watchCta")}
          </Link>
        </section>

        {/* Glossary */}
        <section aria-labelledby="glossary" className="space-y-5">
          <SectionTitle id="glossary">{t("about.glossaryTitle")}</SectionTitle>
          <dl className="grid sm:grid-cols-2 gap-x-8 gap-y-5 bg-white rounded-2xl border border-gray-200 p-6 md:p-8">
            {GLOSSARY.map(({ term, text }) => (
              <div key={term} className="border-l-4 border-[var(--kk-gold)] pl-4">
                <dt className="font-bold text-gray-900">{t(term)}</dt>
                <dd className="text-sm text-gray-600 leading-relaxed mt-0.5">{t(text)}</dd>
              </div>
            ))}
          </dl>
        </section>

        {/* Ask KUNKHMER HUB */}
        {hubVisible && (
          <section aria-labelledby="ask" className="space-y-3">
            <SectionTitle id="ask">{t("about.hubTitle")}</SectionTitle>
            <p className="text-gray-600">{t("about.hubText")}</p>
            <HubAskAbout questions={HUB_QUESTIONS.map((k) => t(k))} />
          </section>
        )}

        {/* About the Federation (only once KKF has published it) */}
        {federation && (
          <section className="bg-white rounded-3xl border border-gray-200 p-6 md:p-10 flex flex-col md:flex-row md:items-center gap-6">
            <div className="w-14 h-14 rounded-2xl bg-[#eef3fb] text-[var(--kk-blue)] flex items-center justify-center shrink-0">
              <Landmark className="w-7 h-7" aria-hidden />
            </div>
            <div className="flex-1">
              <h2 className="kk-heading text-2xl md:text-3xl text-[var(--kk-navy)]">{t("federation.title")}</h2>
              <p className="text-gray-600 leading-relaxed mt-2">{t("federation.cardText")}</p>
            </div>
            <Link
              to="/federation"
              className="kk-focus inline-flex items-center justify-center gap-2 h-11 px-5 rounded-xl bg-[var(--kk-blue)] hover:bg-[var(--kk-navy)] text-white text-sm font-semibold transition-colors whitespace-nowrap"
            >
              {t("federation.cardCta")}
              <ArrowRight className="w-4 h-4" aria-hidden />
            </Link>
          </section>
        )}

        {/* Follow the action */}
        <section className="rounded-3xl bg-gradient-to-br from-[#eef3fb] via-white to-[#fdf1f3] border border-[#d5e0f3] p-6 md:p-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div>
            <h2 className="kk-heading text-2xl md:text-3xl text-[var(--kk-navy)]">{t("about.ctaTitle")}</h2>
            <p className="text-gray-600 mt-1">{t("about.ctaText")}</p>
          </div>
          <div className="flex flex-wrap gap-3 shrink-0">
            <Link to="/fighters" className="kk-focus inline-flex items-center gap-2 h-11 px-5 rounded-xl bg-[var(--kk-red)] hover:bg-[#9e1a2c] text-white text-sm font-semibold transition-colors">
              <Users className="w-4 h-4" aria-hidden />
              {t("about.ctaFighters")}
            </Link>
            <Link to="/matches" className="kk-focus inline-flex items-center gap-2 h-11 px-5 rounded-xl bg-white border border-gray-300 hover:border-[var(--kk-blue)] text-[var(--kk-navy)] text-sm font-semibold transition-colors">
              {t("about.ctaEvents")}
              <ArrowRight className="w-4 h-4" aria-hidden />
            </Link>
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}
