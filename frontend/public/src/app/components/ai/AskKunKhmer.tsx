/**
 * "Ask Kun Khmer" chat: a floating button that opens a small chat panel. Answers come from
 * POST /api/ai/chat, which reads federation records through read-only tools. When the backend
 * reports it isn't configured (no API key), production builds render nothing; development
 * builds still show the button with a "not set up" notice so the feature can be found.
 */
import { Fragment, useEffect, useRef, useState, type ReactNode } from "react";
import { Link } from "react-router";
import { MessageCircle, RotateCcw, Send, Sparkles, X } from "lucide-react";
import { api } from "../../utils/api";
import { useI18n } from "../../i18n/LanguageContext";
import type { MessageKey } from "../../i18n/messages";
import { textLang } from "../../utils/publicDisplay";

type ChatMessage = { role: "user" | "assistant"; content: string };

const SUGGESTIONS: MessageKey[] = ["ai.q1", "ai.q2", "ai.q3", "ai.q4"];
/** The API accepts at most 12 messages; keep the most recent ones, starting with a user turn. */
const HISTORY = 11;

/** Tiny Markdown subset: [text](url) links, **bold**, "- " bullets and line breaks. */
function renderInline(text: string, key: string): ReactNode[] {
  const out: ReactNode[] = [];
  const re = /\[([^\]]+)\]\(([^)\s]+)\)|\*\*([^*]+)\*\*/g;
  let last = 0;
  let m: RegExpExecArray | null;
  let i = 0;
  while ((m = re.exec(text))) {
    if (m.index > last) out.push(text.slice(last, m.index));
    if (m[1]) {
      const href = m[2];
      out.push(
        href.startsWith("/") ? (
          <Link key={`${key}-${i++}`} to={href} className="font-semibold text-[var(--kk-blue)] underline underline-offset-2">{m[1]}</Link>
        ) : /^https?:\/\//.test(href) ? (
          <a key={`${key}-${i++}`} href={href} target="_blank" rel="noopener noreferrer" className="font-semibold text-[var(--kk-blue)] underline underline-offset-2">{m[1]}</a>
        ) : (
          m[1]
        ),
      );
    } else {
      // Bold may wrap a link, e.g. **[Event](/events/id)**.
      out.push(<strong key={`${key}-${i}`}>{renderInline(m[3], `${key}-${i++}b`)}</strong>);
    }
    last = m.index + m[0].length;
  }
  if (last < text.length) out.push(text.slice(last));
  return out;
}

function Markdown({ text }: { text: string }) {
  const lines = text.split("\n");
  return (
    <>
      {lines.map((line, idx) => {
        const bullet = /^\s*[-*]\s+/.test(line);
        const body = renderInline(line.replace(/^\s*[-*]\s+/, "").replace(/^#+\s*/, ""), `l${idx}`);
        if (bullet) return <p key={idx} className="pl-4 relative before:content-['•'] before:absolute before:left-0">{body}</p>;
        if (!line.trim()) return <div key={idx} className="h-2" />;
        return <p key={idx}>{body}</p>;
      })}
    </>
  );
}

export function AskKunKhmer() {
  const { t, lang } = useI18n();
  const [enabled, setEnabled] = useState(false);
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [draft, setDraft] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    api.ai.status().then((s) => setEnabled(Boolean(s?.enabled))).catch(() => setEnabled(false));
  }, []);

  useEffect(() => {
    if (open) inputRef.current?.focus();
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    if (open) window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, busy]);

  const setupOnly = !enabled;
  if (setupOnly && !import.meta.env.DEV) return null;

  const send = async (text: string) => {
    const content = text.trim();
    if (!content || busy) return;
    const next: ChatMessage[] = [...messages, { role: "user", content }];
    setMessages(next);
    setDraft("");
    setError(null);
    setBusy(true);
    let history = next.slice(-HISTORY);
    if (history[0]?.role === "assistant") history = history.slice(1);
    try {
      const reply = await api.ai.chat(history, lang);
      setMessages((m) => [...m, { role: "assistant", content: reply }]);
    } catch (e) {
      // Drop the unanswered question so the conversation keeps alternating.
      setMessages((m) => m.slice(0, -1));
      setDraft(content);
      setError(e instanceof Error && e.message ? e.message : t("ai.error"));
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      {!open && (
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="kk-focus fixed z-40 bottom-4 right-4 md:bottom-6 md:right-6 inline-flex items-center gap-2 h-12 pl-4 pr-5 rounded-full bg-[var(--kk-blue)] hover:bg-[var(--kk-navy)] text-white font-semibold shadow-lg shadow-[var(--kk-blue)]/30 transition-colors"
        >
          <MessageCircle className="w-5 h-5" aria-hidden />
          {t("ai.open")}
        </button>
      )}

      {open && (
        <section
          role="dialog"
          aria-label={t("ai.title")}
          className="fixed z-50 inset-x-3 bottom-3 md:inset-x-auto md:right-6 md:bottom-6 md:w-[400px] h-[75vh] md:h-[600px] max-h-[calc(100vh-24px)] flex flex-col rounded-3xl bg-white border border-gray-200 shadow-2xl overflow-hidden"
        >
          <header className="flex items-center gap-3 px-4 py-3 bg-gradient-to-r from-[#eef3fb] to-white border-b border-gray-100">
            <span className="w-9 h-9 rounded-full bg-[var(--kk-blue)] text-white flex items-center justify-center shrink-0">
              <Sparkles className="w-4 h-4" aria-hidden />
            </span>
            <div className="min-w-0 flex-1">
              <h2 className="font-bold text-[var(--kk-navy)] leading-tight">{t("ai.title")}</h2>
              <p className="text-xs text-gray-500 truncate">{t("ai.subtitle")}</p>
            </div>
            {messages.length > 0 && (
              <button type="button" onClick={() => { setMessages([]); setError(null); }} aria-label={t("ai.clear")} title={t("ai.clear")} className="kk-focus w-9 h-9 rounded-full hover:bg-gray-100 flex items-center justify-center text-gray-500">
                <RotateCcw className="w-4 h-4" aria-hidden />
              </button>
            )}
            <button type="button" onClick={() => setOpen(false)} aria-label={t("ai.close")} className="kk-focus w-9 h-9 rounded-full hover:bg-gray-100 flex items-center justify-center text-gray-500">
              <X className="w-5 h-5" aria-hidden />
            </button>
          </header>

          <div ref={listRef} className="flex-1 overflow-y-auto px-4 py-4 space-y-3 bg-gray-50/60" aria-live="polite">
            <div className="max-w-[88%] rounded-2xl rounded-tl-md bg-white border border-gray-200 px-3.5 py-2.5 text-sm text-gray-800">
              {t("ai.welcome")}
            </div>

            {setupOnly && (
              <div role="status" className="rounded-2xl border border-amber-200 bg-amber-50 px-3.5 py-3 text-sm text-amber-900">
                <p className="font-semibold">{t("ai.setupTitle")}</p>
                <p className="mt-1">{t("ai.setupText")}</p>
              </div>
            )}

            {!setupOnly && messages.length === 0 && (
              <div className="pt-1">
                <p className="kk-label text-gray-500 mb-2">{t("ai.try")}</p>
                <div className="flex flex-wrap gap-2">
                  {SUGGESTIONS.map((k) => (
                    <button key={k} type="button" onClick={() => send(t(k))} className="kk-focus text-left text-sm px-3 py-1.5 rounded-full bg-white border border-[#d5e0f3] hover:border-[var(--kk-blue)] text-[var(--kk-navy)] transition-colors">
                      {t(k)}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {messages.map((m, i) => (
              <Fragment key={i}>
                {m.role === "user" ? (
                  <div className="flex justify-end">
                    <div lang={textLang(m.content)} className="max-w-[88%] rounded-2xl rounded-tr-md bg-[var(--kk-blue)] text-white px-3.5 py-2.5 text-sm whitespace-pre-wrap break-words">{m.content}</div>
                  </div>
                ) : (
                  <div lang={textLang(m.content)} className="max-w-[88%] rounded-2xl rounded-tl-md bg-white border border-gray-200 px-3.5 py-2.5 text-sm text-gray-800 space-y-1 break-words">
                    <Markdown text={m.content} />
                  </div>
                )}
              </Fragment>
            ))}

            {busy && (
              <div className="inline-flex items-center gap-2 rounded-2xl rounded-tl-md bg-white border border-gray-200 px-3.5 py-2.5 text-sm text-gray-500">
                <span className="flex gap-1" aria-hidden>
                  <span className="w-1.5 h-1.5 rounded-full bg-gray-400 animate-bounce" />
                  <span className="w-1.5 h-1.5 rounded-full bg-gray-400 animate-bounce [animation-delay:120ms]" />
                  <span className="w-1.5 h-1.5 rounded-full bg-gray-400 animate-bounce [animation-delay:240ms]" />
                </span>
                {t("ai.thinking")}
              </div>
            )}
            {error && <p role="alert" className="text-sm text-[var(--kk-red)]">{error}</p>}
          </div>

          <form
            onSubmit={(e) => { e.preventDefault(); send(draft); }}
            className="border-t border-gray-100 p-3 bg-white"
          >
            <div className="flex items-end gap-2">
              <label htmlFor="ask-kk-input" className="sr-only">{t("ai.placeholder")}</label>
              <textarea
                id="ask-kk-input"
                disabled={setupOnly}
                ref={inputRef}
                rows={1}
                value={draft}
                maxLength={1500}
                onChange={(e) => setDraft(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing) {
                    e.preventDefault();
                    send(draft);
                  }
                }}
                placeholder={t("ai.placeholder")}
                className="flex-1 resize-none max-h-32 rounded-2xl border border-gray-300 focus:border-[var(--kk-blue)] focus:outline-none px-3.5 py-2.5 text-sm"
              />
              <button
                type="submit"
                disabled={setupOnly || busy || !draft.trim()}
                aria-label={t("ai.send")}
                className="kk-focus w-11 h-11 shrink-0 rounded-full bg-[var(--kk-red)] hover:bg-[#9e1a2c] disabled:bg-gray-300 text-white flex items-center justify-center transition-colors"
              >
                <Send className="w-4 h-4" aria-hidden />
              </button>
            </div>
            <p className="mt-2 text-[11px] text-gray-500 text-center">{t("ai.disclaimer")}</p>
          </form>
        </section>
      )}
    </>
  );
}
