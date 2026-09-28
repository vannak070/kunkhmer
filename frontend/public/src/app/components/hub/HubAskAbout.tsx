/** "Ask KUNKHMER HUB" card with ready-made questions about the page's fighter / event / article; each opens /hub?q=…. */
import { Link } from "react-router";
import { ArrowRight, Sparkles } from "lucide-react";
import { useI18n } from "../../i18n/LanguageContext";
import { useHubVisible } from "./useHubChat";

export function HubAskAbout({ questions, className = "" }: { questions: string[]; className?: string }) {
  const { t } = useI18n();
  const visible = useHubVisible();
  if (!visible || questions.length === 0) return null;

  return (
    <aside
      aria-label={t("hub.aboutTitle")}
      className={`rounded-2xl bg-white border border-[#d5e0f3] shadow-sm p-4 sm:p-5 ${className}`}
    >
      <p className="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm">
        <span className="inline-flex shrink-0 whitespace-nowrap items-center gap-1.5 rounded-full bg-[var(--kk-blue)] text-white px-2.5 py-1 text-xs font-bold tracking-wide">
          <Sparkles className="w-3.5 h-3.5" aria-hidden />
          KUNKHMER HUB
        </span>
        <span className="font-semibold text-[var(--kk-navy)]">{t("hub.aboutTitle")}</span>
      </p>
      <ul className="mt-3 flex flex-wrap gap-2">
        {questions.map((q) => (
          <li key={q} className="max-w-full">
            <Link
              to={`/hub?q=${encodeURIComponent(q)}`}
              className="kk-focus group inline-flex max-w-full items-center gap-2 text-left text-sm px-3 py-1.5 rounded-full bg-[#eef3fb] hover:bg-[#dfe8f7] text-[var(--kk-navy)] transition-colors"
            >
              <span className="min-w-0">{q}</span>
              <ArrowRight className="w-3.5 h-3.5 shrink-0 text-[var(--kk-blue)] transition-transform group-hover:translate-x-0.5" aria-hidden />
            </Link>
          </li>
        ))}
      </ul>
    </aside>
  );
}
