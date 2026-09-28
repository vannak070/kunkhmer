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
    throw new Error(data.error || `HTTP ${response.status}: ${response.statusText}`);
  }

  return data;
}

export const api = {
  // --- "ASK KUN KHMER" AI CHAT ---
  ai: {
    async status(): Promise<{ enabled: boolean }> {
      const res = await request("/ai/status");
      return res.data;
    },
    async chat(messages: { role: "user" | "assistant"; content: string }[], lang: string): Promise<string> {
      const res = await request("/ai/chat", { method: "POST", body: JSON.stringify({ messages, lang }) });
      return res.data.reply;
    },
    /**
     * Streams an answer (Server-Sent Events from /ai/chat/stream). `onDelta` gets text as it's
     * written; `onReset` means "discard the text so far". Resolves with the final answer and its log id.
     */
    async chatStream(
      messages: { role: "user" | "assistant"; content: string }[],
      lang: string,
      conversationId: string,
      on: { onDelta: (text: string) => void; onReset: () => void },
    ): Promise<{ reply: string; logId: string | null }> {
      const response = await fetch(`${API_BASE_URL}/ai/chat/stream`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "text/event-stream" },
        body: JSON.stringify({ messages, lang, conversationId }),
      });
      if (!response.ok || !response.body) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.error || `HTTP ${response.status}`);
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
    logout() {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
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
    }
  },

  // --- BATCHES (SUB-EVENTS) ---
  batches: {
    async list() {
      const res = await request("/matches/batches");
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
    async saveResult(matchId: string, result: any) {
      const res = await request(`/matches/${matchId}/result`, {
        method: "POST",
        body: JSON.stringify(result)
      });
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

  // --- SETTINGS (SPONSORS / BROADCAST STATIONS) ---
  settings: {
    /** Official weight classes (System Settings, Phase 5). */
    async listWeightClasses() {
      const res = await request("/settings/weight-classes");
      return res.data;
    },
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
    /** International partners (K-1, WKN, Kombat …). */
    async listPartnerOrganizations() {
      const res = await request("/settings/partner-organizations");
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
