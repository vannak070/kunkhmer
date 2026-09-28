/**
 * KUNKHMER HUB (/hub): the site's main "ask anything about Kun Khmer" page. Answers come from the
 * federation's records through the AI chat API. `?q=<question>` (from the home hero box) is asked
 * once on arrival and then removed from the URL. See claude/updates/kunkhmer-hub.md.
 */
import { useEffect, useRef, useState } from "react";
import { useSearchParams } from "react-router";
import { BookOpen, CalendarDays, RotateCcw, Send, Sparkles, Trophy, Users, type LucideIcon } from "lucide-react";
import { SiteHeader } from "../components/layout/SiteHeader";
import { SiteFooter } from "../components/layout/SiteFooter";
import { HubMarkdown } from "../components/hub/HubMarkdown";
import { MAX_QUESTION, useHubChat, useHubEnabled } from "../components/hub/useHubChat";
import { usePageMeta } from "../hooks/usePageTitle";
import { useI18n } from "../i18n/LanguageContext";
import type { MessageKey } from "../i18n/messages";
import { textLang } from "../utils/publicDisplay";

const TOPICS: { icon: LucideIcon; title: MessageKey; questions: MessageKey[] }[] = [
  { icon: CalendarDays, title: "hub.topicEvents", questions: ["ai.q1", "hub.qLastEvent"] },
  { icon: Users, title: "hub.topicFighters", questions: ["ai.q3", "hub.qFighterClub"] },
  { icon: Trophy, title: "hub.topicResults", questions: ["ai.q2", "hub.qChampions"] },
  { icon: BookOpen, title: "hub.topicLearn", questions: ["ai.q4", "hub.qKunKru"] },
];

export function KunKhmerHub() {
  const { t } = useI18n();
  usePageMeta({ title: "KUNKHMER HUB", description: t("hub.metaDescription") });
  const enabled = useHubEnabled();
  const { messages, busy, error, send, clear } = useHubChat();
  const [params, setParams] = useSearchParams();
  const [draft, setDraft] = useState("");
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const endRef = useRef<HTMLDivElement>(null);
  const handledQuery = useRef(false);
  // Show the conversation layout straight away when arriving with a question (?q=).
  const [arriving, setArriving] = useState(() => Boolean(params.get("q")?.trim()));

  const unavailable = enabled === false;
  const talking = messages.length > 0 || busy || arriving;

  const ask = async (text: string) => {
    if (!text.trim() || busy || unavailable) return;
    setDraft("");
    if (!(await send(text))) setDraft(text);
  };

  // A question handed over from the home page: ask it once, then drop it from the URL.
  useEffect(() => {
    const q = params.get("q")?.trim();
    if (!q || enabled === null || handledQuery.current) return;
    handledQuery.current = true;
    setParams({}, { replace: true });
    setArriving(false);
    if (enabled) ask(q);
    else setDraft(q);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled]);

  useEffect(() => {
    if (talking) endRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages.length, busy, talking]);

  const composer = (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        ask(draft);
      }}
      className={talking ? "sticky bottom-0 z-10 bg-white/95 backdrop-blur pt-3 pb-4 border-t border-gray-100" : ""}
    >
      <div className="flex items-end gap-2 rounded-2xl bg-white border border-gray-300 focus-within:border-[var(--kk-blue)] shadow-lg shadow-[var(--kk-blue)]/10 p-2">
        <label htmlFor="hub-input" className="sr-only">{t("ai.placeholder")}</label>
        <textarea
          id="hub-input"
          ref={inputRef}
          rows={1}
          value={draft}
          maxLength={MAX_QUESTION}
          disabled={unavailable}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing) {
              e.preventDefault();
              ask(draft);
            }
          }}
          placeholder={t("ai.placeholder")}
          className="flex-1 resize-none max-h-40 bg-transparent focus:outline-none px-3 py-2.5 text-base disabled:cursor-not-allowed"
        />
        <button
          type="submit"
          disabled={unavailable || busy || !draft.trim()}
          aria-label={t("ai.send")}
          className="kk-focus w-11 h-11 shrink-0 rounded-xl bg-[var(--kk-red)] hover:bg-[#9e1a2c] disabled:bg-gray-300 text-white flex items-center justify-center transition-colors"
        >
          <Send className="w-4 h-4" aria-hidden />
        </button>
      </div>
      <p className="mt-2 text-xs text-gray-500 text-center">{t("ai.disclaimer")}</p>
    </form>
  );

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <SiteHeader activeSection="hub" />

      <main className="flex-1 flex flex-col">
        <section className="relative overflow-hidden bg-gradient-to-b from-[#eef3fb] to-white">
          {/* Soft brand-colour glows; decoration only. */}
          <div aria-hidden className="pointer-events-none absolute -top-32 -right-24 w-[480px] h-[480px] rounded-full bg-[var(--kk-blue)] opacity-[0.08] blur-3xl" />
          <div aria-hidden className="pointer-events-none absolute top-24 -left-32 w-[380px] h-[380px] rounded-full bg-[var(--kk-red)] opacity-[0.06] blur-3xl" />
          <div className={`relative max-w-3xl mx-auto px-4 md:px-6 text-center ${talking ? "pt-6 pb-4" : "pt-10 md:pt-16 pb-8"}`}>
            <p className="inline-flex items-center gap-2 rounded-full bg-[var(--kk-blue)] text-white px-3.5 py-1.5 text-xs sm:text-sm font-bold tracking-wide shadow-md shadow-[var(--kk-blue)]/20">
              <Sparkles className="w-4 h-4" aria-hidden />
              KUNKHMER HUB
            </p>
            <h1 className={`kk-display text-[var(--kk-navy)] ${talking ? "mt-3 text-3xl md:text-4xl" : "mt-5 text-4xl sm:text-5xl md:text-6xl"}`}>
              {t("hub.askAnything")}
            </h1>
            {!talking && <p className="mt-4 text-base md:text-lg text-gray-600 leading-relaxed">{t("hub.lead")}</p>}
          </div>
        </section>

        <div className="max-w-3xl w-full mx-auto px-4 md:px-6 flex-1 flex flex-col">
          {unavailable && (
            <div role="status" className="mb-6 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
              <p className="font-semibold">{import.meta.env.DEV ? t("ai.setupTitle") : t("hub.unavailableTitle")}</p>
              <p className="mt-1">{import.meta.env.DEV ? t("ai.setupText") : t("hub.unavailableText")}</p>
            </div>
          )}

          {!talking ? (
            <>
              {composer}
              {error && <p role="alert" className="mt-3 text-sm text-center text-[var(--kk-red)]">{error}</p>}
              <section aria-labelledby="hub-topics" className="mt-10 mb-4">
                <h2 id="hub-topics" className="kk-label text-gray-500 mb-3">{t("ai.try")}</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {TOPICS.map(({ icon: Icon, title, questions }) => (
                    <div key={title} className="rounded-2xl border border-gray-200 bg-white p-4">
                      <p className="flex items-center gap-2 font-bold text-[var(--kk-navy)]">
                        <span className="w-8 h-8 rounded-lg bg-[#eef3fb] text-[var(--kk-blue)] flex items-center justify-center">
                          <Icon className="w-4 h-4" aria-hidden />
                        </span>
                        {t(title)}
                      </p>
                      <ul className="mt-3 space-y-1.5">
                        {questions.map((q) => (
                          <li key={q}>
                            <button
                              type="button"
                              disabled={unavailable}
                              onClick={() => ask(t(q))}
                              className="kk-focus w-full text-left text-sm px-3 py-2 rounded-xl bg-gray-50 hover:bg-[#eef3fb] text-gray-800 disabled:opacity-50 disabled:hover:bg-gray-50 transition-colors"
                            >
                              {t(q)}
                            </button>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </section>
            </>
          ) : (
            <>
              <div className="flex justify-end pt-2">
                <button
                  type="button"
                  onClick={() => {
                    clear();
                    inputRef.current?.focus();
                  }}
                  disabled={busy}
                  className="kk-focus inline-flex items-center gap-1.5 text-sm font-semibold text-gray-600 hover:text-[var(--kk-blue)] px-3 py-1.5 rounded-lg hover:bg-gray-100 disabled:opacity-50"
                >
                  <RotateCcw className="w-4 h-4" aria-hidden />
                  {t("ai.clear")}
                </button>
              </div>

              <div className="flex-1 py-4 space-y-5" aria-live="polite">
                {messages.map((m, i) =>
                  m.role === "user" ? (
                    <div key={i} className="flex justify-end">
                      <div lang={textLang(m.content)} className="max-w-[85%] rounded-2xl rounded-tr-md bg-[var(--kk-blue)] text-white px-4 py-3 whitespace-pre-wrap break-words">
                        {m.content}
                      </div>
                    </div>
                  ) : (
                    <div key={i} className="flex gap-3">
                      <span aria-hidden className="w-8 h-8 mt-1 rounded-full bg-[#eef3fb] text-[var(--kk-blue)] flex items-center justify-center shrink-0">
                        <Sparkles className="w-4 h-4" />
                      </span>
                      <div lang={textLang(m.content)} className="min-w-0 flex-1 text-gray-800 leading-relaxed space-y-1 break-words pt-1">
                        <HubMarkdown text={m.content} />
                      </div>
                    </div>
                  ),
                )}

                {(busy || arriving) && (
                  <div className="flex gap-3 items-center text-gray-500">
                    <span aria-hidden className="w-8 h-8 rounded-full bg-[#eef3fb] text-[var(--kk-blue)] flex items-center justify-center shrink-0">
                      <Sparkles className="w-4 h-4 animate-pulse" />
                    </span>
                    <span className="text-sm">{t("ai.thinking")}</span>
                  </div>
                )}
                {error && <p role="alert" className="text-sm text-[var(--kk-red)]">{error}</p>}
                <div ref={endRef} />
              </div>

              {composer}
            </>
          )}
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}
