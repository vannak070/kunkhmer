/**
 * KUNKHMER HUB chat state. Answers come from POST /api/ai/chat, which reads federation records
 * through read-only tools. The conversation is kept per browser tab (sessionStorage) so following
 * a link in an answer and coming back doesn't lose it.
 */
import { useEffect, useRef, useState } from "react";
import { api } from "../../utils/api";
import { useI18n } from "../../i18n/LanguageContext";

export type ChatMessage = { role: "user" | "assistant"; content: string };

/** The API accepts at most 12 messages; keep the most recent ones, starting with a user turn. */
const HISTORY = 11;
const STORAGE_KEY = "kk-hub-chat";
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
      ? saved.filter((m) => (m?.role === "user" || m?.role === "assistant") && typeof m.content === "string")
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
    let history = next.slice(-HISTORY);
    if (history[0]?.role === "assistant") history = history.slice(1);
    try {
      const reply = await api.ai.chat(history, lang);
      setMessages((m) => [...m, { role: "assistant", content: reply }]);
      return true;
    } catch (e) {
      // Drop the unanswered question so the conversation keeps alternating.
      setMessages((m) => m.slice(0, -1));
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
  };

  return { messages, busy, error, send, clear };
}
