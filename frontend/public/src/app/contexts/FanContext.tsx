import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { FanApiError, fanApi, getFanToken, setFanToken, type FanNotification, type FanProfile } from "../utils/fanApi";
import { useI18n } from "../i18n/LanguageContext";

const POLL_MS = 60_000;

interface FanState {
  fan: FanProfile | null;
  /** True until the stored token has been checked. */
  loading: boolean;
  followedIds: Set<string>;
  notifications: FanNotification[];
  unreadCount: number;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (input: { email: string; password: string; displayName: string }) => Promise<void>;
  signOut: () => Promise<void>;
  updateProfile: (input: Parameters<typeof fanApi.update>[0]) => Promise<void>;
  deleteAccount: (password: string) => Promise<void>;
  toggleFollow: (fighterId: string) => Promise<boolean>;
  refreshNotifications: () => Promise<void>;
  markRead: (ids?: string[]) => Promise<void>;
}

const FanContext = createContext<FanState | null>(null);

export function FanProvider({ children }: { children: ReactNode }) {
  const { lang, setLang } = useI18n();
  const [fan, setFan] = useState<FanProfile | null>(null);
  const [loading, setLoading] = useState(Boolean(getFanToken()));
  const [followedIds, setFollowedIds] = useState<Set<string>>(new Set());
  const [notifications, setNotifications] = useState<FanNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const clear = useCallback(() => {
    setFanToken(null);
    setFan(null);
    setFollowedIds(new Set());
    setNotifications([]);
    setUnreadCount(0);
  }, []);

  /** Any 401 means the token expired or was revoked: sign out locally. */
  const guard = useCallback(async <T,>(p: Promise<T>): Promise<T> => {
    try {
      return await p;
    } catch (err) {
      if (err instanceof FanApiError && err.status === 401) clear();
      throw err;
    }
  }, [clear]);

  const loadSession = useCallback(async (profile?: FanProfile) => {
    const me = profile ?? (await guard(fanApi.me()));
    setFan(me);
    const [follows, notes] = await Promise.all([guard(fanApi.follows()), guard(fanApi.notifications())]);
    setFollowedIds(new Set(follows.map((f) => f.fighterId)));
    setNotifications(notes.items);
    setUnreadCount(notes.unreadCount);
    return me;
  }, [guard]);

  // Restore a saved session on first load.
  useEffect(() => {
    if (!getFanToken()) return;
    // Apply the profile language before the session is marked loaded, so the
    // language-sync effect below doesn't push a stale local choice to the server.
    guard(fanApi.me())
      .then((me) => {
        setLang(me.language);
        return loadSession(me);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Keep the profile language in step with the header switch, so the choice
  // follows the fan to other devices and isn't undone on the next visit.
  useEffect(() => {
    if (!fan || fan.language === lang) return;
    fanApi.update({ language: lang }).then(setFan).catch(() => {});
  }, [fan, lang]);

  const refreshNotifications = useCallback(async () => {
    if (!getFanToken()) return;
    const notes = await guard(fanApi.notifications());
    setNotifications(notes.items);
    setUnreadCount(notes.unreadCount);
  }, [guard]);

  // Poll for new notifications while signed in and the tab is visible.
  useEffect(() => {
    if (!fan) return;
    const tick = () => {
      if (document.visibilityState === "visible") refreshNotifications().catch(() => {});
    };
    const id = setInterval(tick, POLL_MS);
    document.addEventListener("visibilitychange", tick);
    return () => {
      clearInterval(id);
      document.removeEventListener("visibilitychange", tick);
    };
  }, [fan, refreshNotifications]);

  const value = useMemo<FanState>(() => ({
    fan,
    loading,
    followedIds,
    notifications,
    unreadCount,
    signIn: async (email, password) => {
      const { token, fan: profile } = await fanApi.login(email, password);
      setFanToken(token);
      setLang(profile.language);
      await loadSession(profile);
    },
    signUp: async (input) => {
      const { token, fan: profile } = await fanApi.register({ ...input, language: lang });
      setFanToken(token);
      await loadSession(profile);
    },
    signOut: async () => {
      await fanApi.logout().catch(() => {});
      clear();
    },
    updateProfile: async (input) => {
      const updated = await guard(fanApi.update(input));
      setFan(updated);
      if (input.language) setLang(updated.language);
    },
    deleteAccount: async (password) => {
      await guard(fanApi.deleteAccount(password));
      clear();
    },
    toggleFollow: async (fighterId) => {
      const following = followedIds.has(fighterId);
      // Optimistic update; rolled back if the request fails.
      setFollowedIds((prev) => {
        const next = new Set(prev);
        following ? next.delete(fighterId) : next.add(fighterId);
        return next;
      });
      try {
        await guard(following ? fanApi.unfollow(fighterId) : fanApi.follow(fighterId));
        return !following;
      } catch (err) {
        setFollowedIds((prev) => {
          const next = new Set(prev);
          following ? next.add(fighterId) : next.delete(fighterId);
          return next;
        });
        throw err;
      }
    },
    refreshNotifications,
    markRead: async (ids) => {
      const { marked } = await guard(fanApi.markRead(ids));
      if (marked === 0) return;
      setNotifications((prev) => prev.map((n) => (!ids || ids.includes(n.id) ? { ...n, read: true } : n)));
      setUnreadCount((c) => Math.max(0, ids ? c - marked : 0));
    },
  }), [fan, loading, followedIds, notifications, unreadCount, loadSession, setLang, lang, clear, guard, refreshNotifications]);

  return <FanContext.Provider value={value}>{children}</FanContext.Provider>;
}

export function useFan(): FanState {
  const ctx = useContext(FanContext);
  if (!ctx) throw new Error("useFan must be used inside <FanProvider>");
  return ctx;
}
