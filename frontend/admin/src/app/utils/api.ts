import { appPath } from "./basePath";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "/api";

// Helper to get headers (automatically append Authorization bearer token)
function getHeaders(extraHeaders: Record<string, string> = {}): Record<string, string> {
  const token = localStorage.getItem("token");
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...extraHeaders
  };
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }
  return headers;
}

// Unified request handler
async function request<T = any>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers: getHeaders(options.headers as any)
  });

  const text = await response.text();
  let data: any;
  try {
    data = text ? JSON.parse(text) : {};
  } catch (err) {
    data = { success: false, error: text || "Invalid JSON response from server" };
  }

  if (response.status === 401) {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    if (typeof window !== "undefined" && !window.location.pathname.endsWith("/login")) {
      window.location.href = appPath("/login");
    }
  }

  if (!response.ok) {
    // `status` lets a page tell "not found" (404) from a failed load.
    throw Object.assign(new Error(data.error || `HTTP ${response.status}: ${response.statusText}`), { status: response.status });
  }

  return data;
}

export const api = {
  // --- KUNKHMER HUB: staff assistant and answer review (KKF staff) ---
  ai: {
    async status(): Promise<{ enabled: boolean }> {
      const res = await request("/ai/status");
      return res.data;
    },
    /**
     * Staff assistant (KKF staff): streams the answer as Server-Sent Events — delta / reset / done / error.
     * Errors before the stream starts (off, cap, rate limit, role) arrive as normal JSON errors.
     */
    async staffChatStream(
      messages: { role: "user" | "assistant"; content: string }[],
      conversationId: string,
      on: { onDelta: (text: string) => void; onReset: () => void },
    ): Promise<{ reply: string; logId: string | null }> {
      const response = await fetch(`${API_BASE_URL}/ai/staff/chat/stream`, {
        method: "POST",
        headers: getHeaders({ Accept: "text/event-stream" }),
        body: JSON.stringify({ messages, lang: "en", conversationId }),
      });
      if (!response.ok || !response.body) {
        const data = await response.json().catch(() => ({}));
        if (response.status === 401) {
          localStorage.removeItem("token");
          localStorage.removeItem("user");
          window.location.href = appPath("/login");
        }
        throw new Error(data.error || data.message || `HTTP ${response.status}`);
      }
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";
      let result: { reply: string; logId: string | null } | null = null;
      for (;;) {
        const { value, done } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        let cut: number;
        while ((cut = buffer.indexOf("\n\n")) >= 0) {
          const chunk = buffer.slice(0, cut);
          buffer = buffer.slice(cut + 2);
          const event = /^event: (.+)$/m.exec(chunk)?.[1];
          const raw = /^data: (.*)$/m.exec(chunk)?.[1];
          const data = raw ? JSON.parse(raw) : {};
          if (event === "delta") on.onDelta(data.text ?? "");
          else if (event === "reset") on.onReset();
          else if (event === "done") result = { reply: data.reply, logId: data.logId ?? null };
          else if (event === "error") throw new Error(data.message || "Something went wrong.");
        }
      }
      if (!result) throw new Error("The answer was interrupted. Please try again.");
      return result;
    },
    /** 👍 (1) or 👎 (-1) on an answer. */
    async feedback(logId: string, rating: 1 | -1) {
      const res = await request("/ai/feedback", { method: "POST", body: JSON.stringify({ logId, rating }) });
      return res.data;
    },
    async usage() {
      const res = await request("/ai/usage");
      return res.data;
    },
    async logs(params: Record<string, string> = {}) {
      const res = await request(`/ai/logs?${new URLSearchParams(params).toString()}`);
      return res.data;
    },
  },

  // --- Knowledge base for KUNKHMER HUB (KKF staff; publishing is Super Admin only) ---
  knowledge: {
    async list(params: Record<string, string> = {}) {
      const res = await request(`/knowledge?${new URLSearchParams(params).toString()}`);
      return res.data;
    },
    async create(data: Record<string, unknown>) {
      const res = await request("/knowledge", { method: "POST", body: JSON.stringify(data) });
      return res.data;
    },
    async update(id: string, data: Record<string, unknown>) {
      const res = await request(`/knowledge/${id}`, { method: "PUT", body: JSON.stringify(data) });
      return res.data;
    },
    async publish(id: string) {
      const res = await request(`/knowledge/${id}/publish`, { method: "POST", body: "{}" });
      return res.data;
    },
    async unpublish(id: string) {
      const res = await request(`/knowledge/${id}/unpublish`, { method: "POST", body: "{}" });
      return res.data;
    },
    async remove(id: string) {
      const res = await request(`/knowledge/${id}`, { method: "DELETE" });
      return res.data;
    },
  },

  // --- "About the Federation" page (KKF staff; publishing is Super Admin only) ---
  federation: {
    async draft() {
      const res = await request("/federation/draft");
      return res.data;
    },
    async save(data: Record<string, unknown>) {
      const res = await request("/federation/draft", { method: "PUT", body: JSON.stringify(data) });
      return res.data;
    },
    async publish() {
      const res = await request("/federation/publish", { method: "POST", body: "{}" });
      return res.data;
    },
    async discard() {
      const res = await request("/federation/discard", { method: "POST", body: "{}" });
      return res.data;
    },
  },

  // --- AUTH & USERS ---
  auth: {
    async login(username: string, password_hash: string) {
      const res = await request("/users/login", {
        method: "POST",
        body: JSON.stringify({ username, password: password_hash })
      });
      if (res.success && res.data.token) {
        localStorage.setItem("token", res.data.token);
        localStorage.setItem("user", JSON.stringify(res.data.user));
      }
      return res.data;
    },
    /** Ends the session on the server (best effort), then clears it locally. */
    async logout() {
      try {
        if (localStorage.getItem("token")) await request("/users/logout", { method: "POST" });
      } catch {
        // Already expired or offline: clearing locally is enough.
      }
      localStorage.removeItem("token");
      localStorage.removeItem("user");
    },
    async me() {
      const res = await request("/users/me");
      localStorage.setItem("user", JSON.stringify(res.data));
      return res.data;
    },
    /** Edit your own name and email. */
    async updateMe(input: { fullName?: string; email?: string }) {
      const res = await request("/users/me", { method: "PUT", body: JSON.stringify(input) });
      localStorage.setItem("user", JSON.stringify(res.data));
      return res.data;
    },
    async changePassword(currentPassword: string, newPassword: string) {
      return request("/users/me/password", { method: "PUT", body: JSON.stringify({ currentPassword, newPassword }) });
    },
    getCurrentUser() {
      const userStr = localStorage.getItem("user");
      return userStr ? JSON.parse(userStr) : null;
    },
    async listUsers() {
      const res = await request("/users");
      return res.data;
    },
    async getUser(id: string) {
      const res = await request(`/users/${id}`);
      return res.data;
    },
    async createUser(input: any) {
      const res = await request("/users", {
        method: "POST",
        body: JSON.stringify(input)
      });
      return res.data;
    },
    async updateUser(id: string, input: any) {
      const res = await request(`/users/${id}`, {
        method: "PUT",
        body: JSON.stringify(input)
      });
      // If updating current user, refresh storage
      const currentUser = this.getCurrentUser();
      if (currentUser && currentUser.id === id) {
        localStorage.setItem("user", JSON.stringify(res.data));
      }
      return res.data;
    },
    async deleteUser(id: string) {
      return request(`/users/${id}`, { method: "DELETE" });
    }
  },

  // --- FIGHTERS ---
  fighters: {
    async list(status?: string, clubId?: string) {
      let query = "";
      const params = new URLSearchParams();
      if (status) params.append("status", status);
      if (clubId) params.append("clubId", clubId);
      if (params.toString()) {
        query = `?${params.toString()}`;
      }
      const res = await request(`/fighters${query}`);
      return res.data;
    },
    async get(id: string) {
      const res = await request(`/fighters/${id}`);
      return res.data;
    },
    async create(input: any) {
      const res = await request("/fighters", {
        method: "POST",
        body: JSON.stringify(input)
      });
      return res.data;
    },
    async update(id: string, input: any) {
      const res = await request(`/fighters/${id}`, {
        method: "PUT",
        body: JSON.stringify(input)
      });
      return res.data;
    },
    async verify(id: string) {
      const res = await request(`/fighters/${id}/verify`, { method: "POST" });
      return res.data;
    },
    /** Send back to the club with a reason (status Rejected). */
    async reject(id: string, reason: string) {
      const res = await request(`/fighters/${id}/reject`, { method: "POST", body: JSON.stringify({ reason }) });
      return res.data;
    },
    async delete(id: string) {
      return request(`/fighters/${id}`, { method: "DELETE" });
    }
  },

  // --- CLUBS ---
  clubs: {
    async list() {
      const res = await request("/clubs");
      return res.data;
    },
    async get(id: string) {
      const res = await request(`/clubs/${id}`);
      return res.data;
    },
    async create(input: any) {
      const res = await request("/clubs", {
        method: "POST",
        body: JSON.stringify(input)
      });
      return res.data;
    },
    async update(id: string, input: any) {
      const res = await request(`/clubs/${id}`, {
        method: "PUT",
        body: JSON.stringify(input)
      });
      return res.data;
    },
    async delete(id: string) {
      return request(`/clubs/${id}`, { method: "DELETE" });
    }
  },

  // --- EVENTS ---
  events: {
    async list() {
      const res = await request("/events");
      return res.data;
    },
    async get(id: string) {
      const res = await request(`/events/${id}`);
      return res.data;
    },
    async create(input: any) {
      const res = await request("/events", {
        method: "POST",
        body: JSON.stringify(input)
      });
      return res.data;
    },
    async update(id: string, input: any) {
      const res = await request(`/events/${id}`, {
        method: "PUT",
        body: JSON.stringify(input)
      });
      return res.data;
    },
    async delete(id: string) {
      return request(`/events/${id}`, { method: "DELETE" });
    },
    /** Organizer / staff: Draft → Pending KKF Approval. */
    async submit(id: string) {
      const res = await request(`/events/${id}/submit`, { method: "POST" });
      return res.data;
    },
    /** KKF staff: Pending → Approved. */
    async approve(id: string) {
      const res = await request(`/events/${id}/approve`, { method: "POST" });
      return res.data;
    },
    /** KKF staff: Pending → Draft with a comment for the organizer. */
    async reject(id: string, comment: string) {
      const res = await request(`/events/${id}/reject`, { method: "POST", body: JSON.stringify({ comment }) });
      return res.data;
    }
  },

  // --- BATCHES (SUB-EVENTS) ---
  batches: {
    /** All fight cards, or one fight night's cards. */
    async list(eventId?: string) {
      const res = await request(`/matches/batches${eventId ? `?eventId=${eventId}` : ""}`);
      return res.data;
    },
    async get(id: string) {
      const res = await request(`/matches/batches/${id}`);
      return res.data;
    },
    async create(input: any) {
      const res = await request("/matches/batches", {
        method: "POST",
        body: JSON.stringify(input)
      });
      return res.data;
    },
    async update(id: string, input: any) {
      const res = await request(`/matches/batches/${id}`, {
        method: "PUT",
        body: JSON.stringify(input)
      });
      return res.data;
    },
    async delete(id: string) {
      return request(`/matches/batches/${id}`, { method: "DELETE" });
    }
  },

  // --- MATCHES ---
  matches: {
    async list(subEventId?: string) {
      let query = "";
      if (subEventId) {
        query = `?subEventId=${subEventId}`;
      }
      const res = await request(`/matches${query}`);
      return res.data;
    },
    /** One fight night's bouts (every card). */
    async listForEvent(eventId: string) {
      const res = await request(`/matches?eventId=${eventId}`);
      return res.data;
    },
    async get(id: string) {
      const res = await request(`/matches/${id}`);
      return res.data;
    },
    async create(input: any) {
      const res = await request("/matches", {
        method: "POST",
        body: JSON.stringify(input)
      });
      return res.data;
    },
    async update(id: string, input: any) {
      const res = await request(`/matches/${id}`, {
        method: "PUT",
        body: JSON.stringify(input)
      });
      return res.data;
    },
    async delete(id: string) {
      return request(`/matches/${id}`, { method: "DELETE" });
    },
    /** Bouts waiting for (or answered by) clubs; a club only gets bouts with its fighters. */
    async proposals(state?: "pending" | "accepted" | "declined") {
      const res = await request(`/matches/proposals${state ? `?state=${state}` : ""}`);
      return res.data;
    },
    /** A club accepts or declines its side of a bout; KKF staff may answer for a club (`side`). */
    async respond(matchId: string, input: { response: "accepted" | "declined"; note?: string; side?: "a" | "b" }) {
      const res = await request(`/matches/${matchId}/respond`, {
        method: "POST",
        body: JSON.stringify(input)
      });
      return res.data;
    },
    /** Weigh-in (kg per corner; null clears). Saved on the bout, not on the fighter's profile. */
    async weighIn(matchId: string, weights: { a?: number | null; b?: number | null }) {
      const res = await request(`/matches/${matchId}/weigh-in`, { method: "POST", body: JSON.stringify(weights) });
      return res.data;
    },
    async saveResult(matchId: string, result: any) {
      const res = await request(`/matches/${matchId}/result`, {
        method: "POST",
        body: JSON.stringify(result)
      });
      return res.data;
    }
  },

  // --- OFFICIALS (referees and judges) ---
  officials: {
    /** KKF staff and organizers. `date` adds each official's bouts that fight night (boutsOnDate). */
    async list(params: { role?: "Referee" | "Judge"; date?: string } = {}) {
      const q = new URLSearchParams(Object.entries(params).filter(([, v]) => v) as [string, string][]).toString();
      const res = await request(`/officials${q ? `?${q}` : ""}`);
      return res.data;
    },
    async create(input: any) {
      const res = await request("/officials", { method: "POST", body: JSON.stringify(input) });
      return res.data;
    },
    async update(id: string, input: any) {
      const res = await request(`/officials/${id}`, { method: "PUT", body: JSON.stringify(input) });
      return res.data;
    },
    /** For a signed-in referee or judge: the bouts they're assigned to. */
    async myBouts() {
      const res = await request("/officials/me/bouts");
      return res.data;
    }
  },

  // --- CHAMPIONS ---
  champions: {
    async list() {
      const res = await request("/champions");
      return res.data;
    },
    async get(id: string) {
      const res = await request(`/champions/${id}`);
      return res.data;
    },
    async create(input: any) {
      const res = await request("/champions", {
        method: "POST",
        body: JSON.stringify(input)
      });
      return res.data;
    },
    async update(id: string, input: any) {
      const res = await request(`/champions/${id}`, {
        method: "PUT",
        body: JSON.stringify(input)
      });
      return res.data;
    },
    async delete(id: string) {
      return request(`/champions/${id}`, { method: "DELETE" });
    }
  },

  // --- SETTINGS LISTS (weight classes, venues, bout rules, glove brands; Phase 5) ---
  settingsLists: {
    /** Active entries in order; `all` (KKF staff) includes inactive ones. */
    async list(list: string, all = false) {
      const res = await request(`/settings/${list}${all ? "?all=1" : ""}`);
      return res.data;
    },
    async create(list: string, input: any) {
      const res = await request(`/settings/${list}`, { method: "POST", body: JSON.stringify(input) });
      return res.data;
    },
    async update(list: string, id: string, input: any) {
      const res = await request(`/settings/${list}/${id}`, { method: "PUT", body: JSON.stringify(input) });
      return res.data;
    },
    async delete(list: string, id: string) {
      return request(`/settings/${list}/${id}`, { method: "DELETE" });
    }
  },

  // --- SETTINGS (SPONSORS / BROADCAST STATIONS) ---
  settings: {
    async listSponsors() {
      const res = await request("/settings/sponsors");
      return res.data;
    },
    async createSponsor(input: any) {
      const res = await request("/settings/sponsors", {
        method: "POST",
        body: JSON.stringify(input)
      });
      return res.data;
    },
    async updateSponsor(id: string, input: any) {
      const res = await request(`/settings/sponsors/${id}`, {
        method: "PUT",
        body: JSON.stringify(input)
      });
      return res.data;
    },
    async deleteSponsor(id: string) {
      return request(`/settings/sponsors/${id}`, { method: "DELETE" });
    },
    async listBroadcastStations() {
      const res = await request("/settings/broadcast-stations");
      return res.data;
    },
    async createBroadcastStation(input: any) {
      const res = await request("/settings/broadcast-stations", {
        method: "POST",
        body: JSON.stringify(input)
      });
      return res.data;
    },
    async updateBroadcastStation(id: string, input: any) {
      const res = await request(`/settings/broadcast-stations/${id}`, {
        method: "PUT",
        body: JSON.stringify(input)
      });
      return res.data;
    },
    async deleteBroadcastStation(id: string) {
      return request(`/settings/broadcast-stations/${id}`, { method: "DELETE" });
    },
    // International partners (K-1, WKN, Kombat …)
    async listPartnerOrganizations() {
      const res = await request("/settings/partner-organizations");
      return res.data;
    },
    async createPartnerOrganization(input: any) {
      const res = await request("/settings/partner-organizations", {
        method: "POST",
        body: JSON.stringify(input)
      });
      return res.data;
    },
    async updatePartnerOrganization(id: string, input: any) {
      const res = await request(`/settings/partner-organizations/${id}`, {
        method: "PUT",
        body: JSON.stringify(input)
      });
      return res.data;
    },
    async deletePartnerOrganization(id: string) {
      return request(`/settings/partner-organizations/${id}`, { method: "DELETE" });
    }
  },

  // --- NEWS ---
  news: {
    async list() {
      const res = await request("/news");
      return res.data;
    },
    async get(id: string) {
      const res = await request(`/news/${id}`);
      return res.data;
    },
    async create(input: any) {
      const res = await request("/news", {
        method: "POST",
        body: JSON.stringify(input)
      });
      return res.data;
    },
    async update(id: string, input: any) {
      const res = await request(`/news/${id}`, {
        method: "PUT",
        body: JSON.stringify(input)
      });
      return res.data;
    },
    async delete(id: string) {
      return request(`/news/${id}`, { method: "DELETE" });
    }
  },

  // --- VIDEOS ---
  videos: {
    async list() {
      const res = await request("/videos");
      return res.data;
    },
    async get(id: string) {
      const res = await request(`/videos/${id}`);
      return res.data;
    },
    async create(input: any) {
      const res = await request("/videos", {
        method: "POST",
        body: JSON.stringify(input)
      });
      return res.data;
    },
    async update(id: string, input: any) {
      const res = await request(`/videos/${id}`, {
        method: "PUT",
        body: JSON.stringify(input)
      });
      return res.data;
    },
    async delete(id: string) {
      return request(`/videos/${id}`, { method: "DELETE" });
    }
  }
};
