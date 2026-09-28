/**
 * Staff assistant (KUNKHMER HUB Phase D2, KKF staff only): a read-only AI chat that finds work
 * and data problems in the federation's records and links to the admin page where staff act.
 * It never changes anything. Answers count toward the Hub's monthly cap and are logged with the
 * staff member who asked. API: POST /api/ai/staff/chat/stream.
 * See claude/updates/hub-phase-d2-staff-assistant.md.
 */
import { useEffect, useRef, useState } from "react";
import { Bot, Eraser, Send, ThumbsDown, ThumbsUp } from "lucide-react";
import { api } from "../utils/api";
import { AssistantMarkdown } from "../components/AssistantMarkdown";

type Message = { role: "user" | "assistant"; content: string; logId?: string | null; feedback?: 1 | -1; streaming?: boolean };

const MAX_QUESTION = 1500;
/** The API accepts at most 12 messages; keep the most recent ones, starting with a user turn. */
const HISTORY = 11;
const STORAGE_KEY = "kk-staff-assistant";
const CONVERSATION_KEY = "kk-staff-assistant-conversation";

const SAMPLES = [
  "What is waiting for my approval?",
  "Which past fight cards still need results?",
  "Are there likely duplicate fighters?",
  "Which fighters are missing a photo or a club?",
  "Which upcoming bouts have no referee yet?",
  "What drafts haven't been published?",
  "តើមានកីឡាករប៉ុន្មាននាក់កំពុងរង់ចាំការផ្ទៀងផ្ទាត់?",
];

function conversationId(): string {
  try {
    let id = sessionStorage.getItem(CONVERSATION_KEY);
    if (!id) {
      id = crypto.randomUUID();
      sessionStorage.setItem(CONVERSATION_KEY, id);
    }
    return id;
  } catch {
    return crypto.randomUUID();
  }
}

function loadMessages(): Message[] {
  try {
    const saved = JSON.parse(sessionStorage.getItem(STORAGE_KEY) ?? "[]");
    return Array.isArray(saved) ? saved.filter((m) => (m?.role === "user" || m?.role === "assistant") && typeof m.content === "string" && !m.streaming) : [];
  } catch {
    return [];
  }
}

export function StaffAssistant() {
  const [enabled, setEnabled] = useState<boolean | null>(null);
  const [messages, setMessages] = useState<Message[]>(loadMessages);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const sending = useRef(false);
  const bottom = useRef<HTMLDivElement>(null);

  useEffect(() => {
    api.ai.status().then((s) => setEnabled(Boolean(s?.enabled))).catch(() => setEnabled(false));
  }, []);

  useEffect(() => {
    try {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(messages));
    } catch {}
    bottom.current?.scrollIntoView({ block: "end" });
  }, [messages]);

  const send = async (text: string) => {
    const content = text.trim().slice(0, MAX_QUESTION);
    if (!content || sending.current) return;
    sending.current = true;
    const next: Message[] = [...messages, { role: "user", content }];
    setMessages(next);
    setInput("");
    setError(null);
    setBusy(true);
    let history = next.slice(-HISTORY).map(({ role, content: c }) => ({ role, content: c }));
    if (history[0]?.role === "assistant") history = history.slice(1);
    const setAnswer = (update: (a: Message) => Message) =>
      setMessages((m) => {
        const last = m[m.length - 1];
        const current = last?.role === "assistant" && last.streaming ? last : { role: "assistant" as const, content: "", streaming: true };
        const rest = last === current ? m.slice(0, -1) : m;
        return [...rest, update(current)];
      });
    try {
      const { reply, logId } = await api.ai.staffChatStream(history, conversationId(), {
        onDelta: (t) => setAnswer((a) => ({ ...a, content: a.content + t })),
        onReset: () => setAnswer((a) => ({ ...a, content: "" })),
      });
      setAnswer(() => ({ role: "assistant", content: reply, logId }));
    } catch (e) {
      // Drop the unanswered question (and any half-written answer) and give the text back.
      setMessages((m) => (m[m.length - 1]?.streaming ? m.slice(0, -2) : m.slice(0, -1)));
      setInput(content);
      setError(e instanceof Error && e.message ? e.message : "The assistant couldn't answer. Please try again.");
    } finally {
      sending.current = false;
      setBusy(false);
    }
  };

  const clear = () => {
    setMessages([]);
    setError(null);
    try {
      sessionStorage.removeItem(CONVERSATION_KEY);
    } catch {}
  };

  const rate = (index: number, rating: 1 | -1) => {
    const target = messages[index];
    if (!target?.logId) return;
    setMessages((m) => m.map((x, i) => (i === index ? { ...x, feedback: rating } : x)));
    api.ai.feedback(target.logId, rating).catch(() => {});
  };

  const off = enabled === false;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <header className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-slate-900 flex items-center gap-2">
            <Bot className="w-7 h-7 text-primary" aria-hidden /> Staff assistant
          </h1>
          <p className="text-slate-600 mt-1">
            Ask about approvals, missing results, fighter data and drafts. It reads the federation's records and links to the page where you act — it never changes anything.
          </p>
        </div>
        {messages.length > 0 && (
          <button
            type="button"
            onClick={clear}
            disabled={busy}
            className="h-10 px-4 rounded-xl border border-slate-200 bg-white text-sm font-medium text-slate-700 inline-flex items-center gap-2 hover:border-slate-300 disabled:opacity-50"
          >
            <Eraser className="w-4 h-4" aria-hidden /> New conversation
          </button>
        )}
      </header>

      {off && (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
          The assistant is off: KUNKHMER HUB isn't set up on this server (no <code>ANTHROPIC_API_KEY</code>, or <code>AI_ENABLED=false</code>).
        </div>
      )}

      {messages.length === 0 ? (
        <section className="rounded-2xl border border-slate-200 bg-white p-5">
          <p className="text-sm font-medium text-slate-600 mb-3">Try asking</p>
          <div className="flex flex-wrap gap-2">
            {SAMPLES.map((q) => (
              <button
                key={q}
                type="button"
                disabled={off || busy}
                onClick={() => send(q)}
                className="text-left text-sm px-3 py-2 rounded-xl border border-slate-200 bg-[#eef3fb] text-primary hover:border-primary/40 disabled:opacity-50"
              >
                {q}
              </button>
            ))}
          </div>
        </section>
      ) : (
        <section className="space-y-4" aria-live="polite">
          {messages.map((m, i) =>
            m.role === "user" ? (
              <div key={i} className="flex justify-end">
                <p className="max-w-[85%] rounded-2xl rounded-br-md bg-primary text-white px-4 py-3 text-sm whitespace-pre-wrap break-words">{m.content}</p>
              </div>
            ) : (
              <div key={i} className="rounded-2xl rounded-bl-md border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 space-y-1 break-words">
                {m.content ? <AssistantMarkdown text={m.content} /> : <p className="text-slate-500">Looking through the records…</p>}
                {!m.streaming && m.logId && (
                  <div className="pt-2 flex items-center gap-2 text-xs text-slate-500">
                    <span>Helpful?</span>
                    <button type="button" onClick={() => rate(i, 1)} aria-pressed={m.feedback === 1} aria-label="Helpful" className={`p-1.5 rounded-lg hover:bg-slate-100 ${m.feedback === 1 ? "text-emerald-600" : ""}`}>
                      <ThumbsUp className="w-4 h-4" />
                    </button>
                    <button type="button" onClick={() => rate(i, -1)} aria-pressed={m.feedback === -1} aria-label="Not helpful" className={`p-1.5 rounded-lg hover:bg-slate-100 ${m.feedback === -1 ? "text-red-600" : ""}`}>
                      <ThumbsDown className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>
            ),
          )}
          <div ref={bottom} />
        </section>
      )}

      {error && <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">{error}</div>}

      <form
        onSubmit={(e) => {
          e.preventDefault();
          send(input);
        }}
        className="sticky bottom-4 rounded-2xl border border-slate-200 bg-white p-2 shadow-sm flex items-end gap-2"
      >
        <label htmlFor="assistant-question" className="sr-only">Your question</label>
        <textarea
          id="assistant-question"
          value={input}
          onChange={(e) => setInput(e.target.value.slice(0, MAX_QUESTION))}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing) {
              e.preventDefault();
              send(input);
            }
          }}
          rows={1}
          disabled={off}
          placeholder={off ? "The assistant is off" : "Ask in English or Khmer…"}
          className="flex-1 resize-none max-h-40 min-h-[44px] px-3 py-2.5 text-sm outline-none bg-transparent disabled:opacity-50"
        />
        <button
          type="submit"
          disabled={off || busy || !input.trim()}
          className="h-11 px-4 rounded-xl bg-primary text-white text-sm font-medium inline-flex items-center gap-2 disabled:opacity-40"
        >
          <Send className="w-4 h-4" aria-hidden /> {busy ? "Answering…" : "Ask"}
        </button>
      </form>
      <p className="text-xs text-slate-500 -mt-3">
        AI-generated from KKF records — check before acting. Your questions are saved with your name for review in Hub answers and count toward the monthly AI budget.
      </p>
    </div>
  );
}
