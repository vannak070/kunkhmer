import { Link } from "react-router";
import { ArrowRight, BookOpen, Calendar, Clock, Music, Scale, Swords, Trophy, Tv, Users } from "lucide-react";
import { SiteHeader } from "../components/layout/SiteHeader";
import { SiteFooter } from "../components/layout/SiteFooter";
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
  { term: "about.glossary.ranking", text: "about.glossary.rankingText" },
  { term: "about.glossary.title", text: "about.glossary.titleText" },
  { term: "about.glossary.catchweight", text: "about.glossary.catchweightText" },
  { term: "about.glossary.grade", text: "about.glossary.gradeText" },
  { term: "about.glossary.wld", text: "about.glossary.wldText" },
];

export function AboutKunKhmer() {
  const { t } = useI18n();
  usePageMeta({ title: t("about.metaTitle"), description: t("about.metaDescription"), type: "article" });

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <SiteHeader activeSection="about" />

      <main className="flex-1">
        {/* Hero */}
        <section className="bg-gradient-to-br from-[#051C42] via-[#0A3D91] to-[#1565C0] text-white">
          <div className="max-w-4xl mx-auto px-4 md:px-6 py-16 md:py-24">
            <p className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/20 text-xs font-bold uppercase tracking-wider text-[#F2C94C] mb-5">
              <BookOpen className="w-3.5 h-3.5" aria-hidden />
              {t("about.eyebrow")}
            </p>
            <h1 className="text-4xl md:text-6xl font-black leading-tight mb-6">{t("about.title")}</h1>
            <p className="text-lg md:text-xl text-white/85 leading-relaxed max-w-3xl">{t("about.lead")}</p>
          </div>
        </section>

        <div className="max-w-5xl mx-auto px-4 md:px-6 -mt-10 space-y-16 pb-8">
          {/* Quick facts */}
          <section aria-label={t("about.eyebrow")} className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {QUICK_FACTS.map(({ icon: Icon, title, text }) => (
              <div key={title} className="bg-white rounded-2xl border border-gray-200 shadow-lg p-6">
                <div className="w-11 h-11 rounded-xl bg-[#0A3D91]/10 text-[#0A3D91] flex items-center justify-center mb-4">
                  <Icon className="w-5 h-5" aria-hidden />
                </div>
                <h2 className="text-xl font-black text-gray-900 mb-1">{t(title)}</h2>
                <p className="text-sm text-gray-600 leading-relaxed">{t(text)}</p>
              </div>
            ))}
          </section>

          {/* History */}
          <section className="grid md:grid-cols-[200px_1fr] gap-6">
            <h2 className="text-2xl md:text-3xl font-black text-gray-900">{t("about.historyTitle")}</h2>
            <div className="space-y-4 text-gray-700 leading-relaxed text-base md:text-lg">
              <p>{t("about.historyText1")}</p>
              <p>{t("about.historyText2")}</p>
            </div>
          </section>

          {/* How a fight works */}
          <section>
            <h2 className="text-2xl md:text-3xl font-black text-gray-900 mb-6">{t("about.rulesTitle")}</h2>
            <ol className="grid md:grid-cols-3 gap-4">
              {FIGHT_STEPS.map(({ icon: Icon, title, text }, i) => (
                <li key={title} className="relative bg-white rounded-2xl border border-gray-200 p-6">
                  <span className="absolute top-5 right-5 text-4xl font-black text-gray-100" aria-hidden>{i + 1}</span>
                  <Icon className="w-6 h-6 text-[#C8102E] mb-3" aria-hidden />
                  <h3 className="text-lg font-black text-gray-900 mb-2">{t(title)}</h3>
                  <p className="text-sm text-gray-600 leading-relaxed">{t(text)}</p>
                </li>
              ))}
            </ol>

            <div className="mt-4 flex flex-col sm:flex-row sm:items-center gap-4 bg-white rounded-2xl border border-gray-200 p-6">
              <div className="flex shrink-0" aria-hidden>
                <span className="w-10 h-10 rounded-full bg-red-600 border-4 border-white shadow" />
                <span className="w-10 h-10 rounded-full bg-blue-600 border-4 border-white shadow -ml-3" />
              </div>
              <div>
                <h3 className="text-lg font-black text-gray-900">{t("about.cornerTitle")}</h3>
                <p className="text-sm text-gray-600 leading-relaxed">{t("about.cornerText")}</p>
              </div>
            </div>
          </section>

          {/* How to watch */}
          <section className="bg-white rounded-3xl border border-gray-200 p-6 md:p-10 flex flex-col md:flex-row md:items-center gap-6">
            <div className="w-14 h-14 rounded-2xl bg-orange-100 text-orange-600 flex items-center justify-center shrink-0">
              <Tv className="w-7 h-7" aria-hidden />
            </div>
            <div className="flex-1">
              <h2 className="text-2xl font-black text-gray-900 mb-2">{t("about.watchTitle")}</h2>
              <p className="text-gray-600 leading-relaxed">{t("about.watchText")}</p>
            </div>
            <Link
              to="/matches?tab=events"
              className="inline-flex items-center justify-center gap-2 px-5 py-3 bg-[#0A3D91] hover:bg-blue-800 text-white rounded-xl font-bold transition-colors whitespace-nowrap"
            >
              <Calendar className="w-4 h-4" aria-hidden />
              {t("about.watchCta")}
            </Link>
          </section>

          {/* Glossary */}
          <section>
            <h2 className="text-2xl md:text-3xl font-black text-gray-900 mb-6">{t("about.glossaryTitle")}</h2>
            <dl className="grid sm:grid-cols-2 gap-x-8 gap-y-5 bg-white rounded-2xl border border-gray-200 p-6 md:p-8">
              {GLOSSARY.map(({ term, text }) => (
                <div key={term} className="border-l-4 border-[#F2C94C] pl-4">
                  <dt className="font-black text-gray-900">{t(term)}</dt>
                  <dd className="text-sm text-gray-600 leading-relaxed mt-0.5">{t(text)}</dd>
                </div>
              ))}
            </dl>
          </section>

          {/* CTA */}
          <section className="rounded-3xl bg-gradient-to-r from-[#C8102E] to-[#9B0D23] text-white p-8 md:p-12 text-center">
            <h2 className="text-2xl md:text-3xl font-black mb-2">{t("about.ctaTitle")}</h2>
            <p className="text-white/85 mb-6">{t("about.ctaText")}</p>
            <div className="flex flex-wrap justify-center gap-3">
              <Link to="/fighters" className="inline-flex items-center gap-2 px-6 py-3 bg-white text-[#C8102E] rounded-xl font-bold hover:bg-gray-100 transition-colors">
                <Users className="w-4 h-4" aria-hidden />
                {t("about.ctaFighters")}
              </Link>
              <Link to="/matches?tab=events" className="inline-flex items-center gap-2 px-6 py-3 bg-white/15 border border-white/40 rounded-xl font-bold hover:bg-white/25 transition-colors">
                {t("about.ctaEvents")}
                <ArrowRight className="w-4 h-4" aria-hidden />
              </Link>
            </div>
          </section>
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}
