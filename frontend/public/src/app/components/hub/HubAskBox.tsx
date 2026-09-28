/** "Ask KUNKHMER HUB" box for the home hero: sends the question to /hub?q=… where it is answered. */
import { useState } from "react";
import { useNavigate } from "react-router";
import { ArrowRight, Sparkles } from "lucide-react";
import { useI18n } from "../../i18n/LanguageContext";
import type { MessageKey } from "../../i18n/messages";
import { MAX_QUESTION, useHubVisible } from "./useHubChat";

const CHIPS: MessageKey[] = ["ai.q1", "ai.q2", "ai.q4"];

/** `centered`: the hero has no side card, so the box sits in the middle. */
export function HubAskBox({ centered = false }: { centered?: boolean }) {
  const { t } = useI18n();
  const navigate = useNavigate();
  const visible = useHubVisible();
  const [draft, setDraft] = useState("");
  if (!visible) return null;

  const ask = (text: string) => {
    const q = text.trim();
    navigate(q ? `/hub?q=${encodeURIComponent(q)}` : "/hub");
  };

  return (
    <div className={`mt-7 max-w-xl text-left ${centered ? "mx-auto" : ""} rounded-2xl bg-white border border-[#d5e0f3] shadow-lg shadow-[var(--kk-blue)]/10 p-4 sm:p-5`}>
      <p className="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm">
        <span className="inline-flex shrink-0 whitespace-nowrap items-center gap-1.5 rounded-full bg-[var(--kk-blue)] text-white px-2.5 py-1 text-xs font-bold tracking-wide">
          <Sparkles className="w-3.5 h-3.5" aria-hidden />
          KUNKHMER HUB
        </span>
        <span className="font-semibold text-[var(--kk-navy)]">{t("hub.askAnything")}</span>
      </p>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          ask(draft);
        }}
        className="mt-3 flex gap-2"
      >
        <label htmlFor="hub-home-input" className="sr-only">{t("ai.placeholder")}</label>
        <input
          id="hub-home-input"
          type="text"
          value={draft}
          maxLength={MAX_QUESTION}
          onChange={(e) => setDraft(e.target.value)}
          placeholder={t("ai.placeholder")}
          className="min-w-0 flex-1 h-12 rounded-xl border border-gray-300 focus:border-[var(--kk-blue)] focus:outline-none px-4 text-base"
        />
        <button
          type="submit"
          className="kk-focus shrink-0 inline-flex items-center gap-2 h-12 px-4 sm:px-5 rounded-xl bg-[var(--kk-red)] hover:bg-[#9e1a2c] text-white font-semibold transition-colors"
        >
          <span className="hidden sm:inline">{t("hub.ask")}</span>
          <ArrowRight className="w-4 h-4" aria-hidden />
          <span className="sr-only sm:hidden">{t("hub.ask")}</span>
        </button>
      </form>
      <div className="mt-3 flex flex-wrap gap-2">
        {CHIPS.map((k, i) => (
          <button
            key={k}
            type="button"
            onClick={() => ask(t(k))}
            className={`kk-focus text-left text-sm px-3 py-1.5 rounded-full bg-[#eef3fb] hover:bg-[#dfe8f7] text-[var(--kk-navy)] transition-colors ${i > 1 ? "hidden sm:inline-block" : ""}`}
          >
            {t(k)}
          </button>
        ))}
      </div>
    </div>
  );
}
