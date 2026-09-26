/**
 * Client for the public-site fan API (/api/fans/*).
 *
 * Kept separate from utils/api.ts on purpose: that client sends the staff token and
 * redirects to /login on 401. Fans have their own token, and a 401 here just means
 * "signed out".
 */
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "/api";
const TOKEN_KEY = "kk-fan-token";

export interface FanProfile {
  id: string;
  email: string;
  displayName: string;
  language: "en" | "km";
  notifyEmail: boolean;
  createdAt: string;
}

export interface FollowedFighter {
  fighterId: string;
  name: string;
  nameKhmer?: string | null;
  image?: string | null;
  record?: string | null;
  clubName?: string | null;
  followedAt: string;
}

export interface FanNotification {
  id: string;
  type: "bout_scheduled" | "bout_result";
  read: boolean;
  createdAt: string;
  data: {
    fighterId: string;
    fighterName: string;
    fighterNameKhmer?: string | null;
    opponentId: string;
    opponentName: string;
    opponentNameKhmer?: string | null;
    eventId?: string | null;
    eventName?: string | null;
    date?: string | null;
    status?: string | null;
    isTitleMatch?: boolean;
    outcome?: "win" | "loss" | "draw" | "nc";
    method?: string | null;
    round?: number | null;
  };
}

export class FanApiError extends Error {
  constructor(readonly status: number, message: string) {
    super(message);
  }
}

export function getFanToken(): string | null {
  try {
    return localStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
}

export function setFanToken(token: string | null) {
  try {
    if (token) localStorage.setItem(TOKEN_KEY, token);
    else localStorage.removeItem(TOKEN_KEY);
  } catch {
    // Storage unavailable (private mode): the session lasts until the tab closes.
  }
}

async function request<T>(method: string, path: string, body?: unknown): Promise<T> {
  const token = getFanToken();
  const headers: Record<string, string> = { Accept: "application/json" };
  if (body !== undefined) headers["Content-Type"] = "application/json";
  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(`${API_BASE_URL}${path}`, {
    method,
    headers,
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  const text = await res.text();
  let json: any = null;
  try {
    json = text ? JSON.parse(text) : null;
  } catch {
    // Non-JSON error page; fall through to the status check.
  }
  if (!res.ok) throw new FanApiError(res.status, json?.error || json?.message || `Request failed (${res.status})`);
  return (json?.data ?? json) as T;
}

export const fanApi = {
  register: (input: { email: string; password: string; displayName: string; language: string }) =>
    request<{ token: string; fan: FanProfile }>("POST", "/fans/register", input),
  login: (email: string, password: string) =>
    request<{ token: string; fan: FanProfile }>("POST", "/fans/login", { email, password }),
  logout: () => request<unknown>("POST", "/fans/logout", {}),
  me: () => request<FanProfile>("GET", "/fans/me"),
  update: (input: Partial<Pick<FanProfile, "displayName" | "language" | "notifyEmail">> & { currentPassword?: string; newPassword?: string }) =>
    request<FanProfile>("PUT", "/fans/me", input),
  deleteAccount: (password: string) => request<unknown>("DELETE", "/fans/me", { password }),
  follows: () => request<FollowedFighter[]>("GET", "/fans/me/follows"),
  follow: (fighterId: string) => request<unknown>("PUT", `/fans/me/follows/${fighterId}`, {}),
  unfollow: (fighterId: string) => request<unknown>("DELETE", `/fans/me/follows/${fighterId}`),
  notifications: (limit = 30) =>
    request<{ items: FanNotification[]; unreadCount: number }>("GET", `/fans/me/notifications?limit=${limit}`),
  markRead: (ids?: string[]) => request<{ marked: number }>("POST", "/fans/me/notifications/read", ids ? { ids } : {}),
  followerCount: (fighterId: string) => request<{ count: number }>("GET", `/fighters/${fighterId}/followers`),
};
