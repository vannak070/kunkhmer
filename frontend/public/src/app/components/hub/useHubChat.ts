/**
 * KUNKHMER HUB chat state. Answers come from POST /api/ai/chat, which reads federation records
 * through read-only tools. The conversation is kept per browser tab (sessionStorage) so following
 * a link in an answer and coming back doesn't lose it.
 */
import { useEffect, useRef, useState } from "react";
import { api } from "../../utils/api";
import { useI18n } from "../../i18n/LanguageContext";

export type ChatMessage = {
  role: "user" | "assistant";
  content: string;
  /** Answer id in the anonymous log, for 👍/👎. */
  logId?: string | null;
  feedback?: 1 | -1;
  /** Still being written (streaming). */
  streaming?: boolean;
};

/** The API accepts at most 12 messages; keep the most recent ones, starting with a user turn. */
const HISTORY = 11;
const STORAGE_KEY = "kk-hub-chat";
const CONVERSATION_KEY = "kk-hub-conversation";

/** A random id per browser tab so staff can read a conversation in order; not linked to a person. */
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
export const MAX_QUESTION = 1500;

let statusRequest: Promise<boolean> | null = null;

/** Whether the backend has the AI turned on; null while loading. One request per page load. */
export function useHubEnabled(): boolean | null {
  const [enabled, setEnabled] = useState<boolean | null>(null);
  useEffect(() => {
    statusRequest ??= api.ai
      .status()
      .then((s) => Boolean(s?.enabled))
      .catch(() => {
        statusRequest = null;
        return false;
      });
    let live = true;
    statusRequest.then((v) => live && setEnabled(v));
    return () => {
      live = false;
    };
  }, []);
  return enabled;
}

/** Menu item and home box: hidden only once we know the AI is off, and never in development. */
export function useHubVisible(): boolean {
  return useHubEnabled() !== false || import.meta.env.DEV;
}

function loadMessages(): ChatMessage[] {
  try {
    const saved = JSON.parse(sessionStorage.getItem(STORAGE_KEY) ?? "[]");
    return Array.isArray(saved)
      ? saved.filter((m) => (m?.role === "user" || m?.role === "assistant") && typeof m.content === "string" && !m.streaming)
      : [];
  } catch {
    return [];
  }
}

export function useHubChat() {
  const { t, lang } = useI18n();
  const [messages, setMessages] = useState<ChatMessage[]>(loadMessages);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const sending = useRef(false);

  useEffect(() => {
    try {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(messages));
    } catch {}
  }, [messages]);

  /** Asks a question; resolves false when it failed (the question is removed so the caller can restore it). */
  const send = async (text: string): Promise<boolean> => {
    const content = text.trim().slice(0, MAX_QUESTION);
    if (!content || sending.current) return false;
    sending.current = true;
    const next: ChatMessage[] = [...messages, { role: "user", content }];
    setMessages(next);
    setError(null);
    setBusy(true);
    let history = next.slice(-HISTORY).map(({ role, content: c }) => ({ role, content: c }));
    if (history[0]?.role === "assistant") history = history.slice(1);
    // The answer grows in place as it streams in.
    const setAnswer = (update: (a: ChatMessage) => ChatMessage) =>
      setMessages((m) => {
        const last = m[m.length - 1];
        const current = last?.role === "assistant" && last.streaming ? last : { role: "assistant" as const, content: "", streaming: true };
        const rest = last === current ? m.slice(0, -1) : m;
        return [...rest, update(current)];
      });
    try {
      const { reply, logId } = await api.ai.chatStream(history, lang, conversationId(), {
        onDelta: (text) => setAnswer((a) => ({ ...a, content: a.content + text })),
        onReset: () => setAnswer((a) => ({ ...a, content: "" })),
      });
      setAnswer(() => ({ role: "assistant", content: reply, logId }));
      return true;
    } catch (e) {
      // Drop the unanswered question (and any half-written answer) so the conversation keeps alternating.
      setMessages((m) => {
        const trimmed = m[m.length - 1]?.streaming ? m.slice(0, -1) : m;
        return trimmed.slice(0, -1);
      });
      setError(e instanceof Error && e.message ? e.message : t("ai.error"));
      return false;
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

  /** 👍/👎 on answer `index`; shown as given right away, saved in the background. */
  const rate = (index: number, rating: 1 | -1) => {
    const target = messages[index];
    if (!target?.logId) return;
    setMessages((m) => m.map((x, i) => (i === index ? { ...x, feedback: rating } : x)));
    api.ai.feedback(target.logId, rating).catch(() => {});
  };

  return { messages, busy, error, send, clear, rate };
}
