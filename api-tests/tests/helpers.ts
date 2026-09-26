/**
 * Shared helpers for the API contract tests.
 *
 * The tests only talk HTTP, so they don't depend on the backend's
 * implementation. Response formats are pinned
 * with shape snapshots: every key, its JSON type and — for strings — its
 * format (uuid, date, datetime flavour). Values themselves are not pinned.
 */
import { randomBytes } from "node:crypto";

export const API_URL = process.env.API_URL ?? "http://localhost:3002/api";
export const ADMIN_USERNAME = process.env.API_ADMIN_USERNAME ?? "admin";
export const ADMIN_PASSWORD = process.env.API_ADMIN_PASSWORD ?? "admin123";

export type Json = any;

export interface ApiResponse {
  status: number;
  body: Json;
}

export async function api(
  method: string,
  path: string,
  opts: { token?: string; body?: unknown } = {},
): Promise<ApiResponse> {
  const headers: Record<string, string> = { Accept: "application/json" };
  if (opts.body !== undefined) headers["Content-Type"] = "application/json";
  if (opts.token) headers["Authorization"] = `Bearer ${opts.token}`;

  const res = await fetch(`${API_URL}${path}`, {
    method,
    headers,
    body: opts.body === undefined ? undefined : JSON.stringify(opts.body),
  });
  const text = await res.text();
  let body: Json;
  try {
    body = text ? JSON.parse(text) : null;
  } catch {
    throw new Error(`Non-JSON response from ${method} ${path} (${res.status}): ${text.slice(0, 200)}`);
  }
  return { status: res.status, body };
}

export const get = (path: string, token?: string) => api("GET", path, { token });
export const post = (path: string, body: unknown, token?: string) => api("POST", path, { body, token });
export const put = (path: string, body: unknown, token?: string) => api("PUT", path, { body, token });
export const del = (path: string, token?: string) => api("DELETE", path, { token });

/** Short unique suffix so repeated runs never collide on unique columns. */
export const uniq = () => randomBytes(4).toString("hex");

export const randomPassword = () => randomBytes(12).toString("base64url");

export async function login(username: string, password: string): Promise<string> {
  const res = await post("/users/login", { username, password });
  if (res.status !== 200) {
    throw new Error(`Login failed for ${username}: ${res.status} ${JSON.stringify(res.body)}`);
  }
  return res.body.data.token;
}

export const ROLES = {
  superAdmin: "Super Admin",
  officer: "KKF Officer",
  organizer: "Organizer",
  club: "Club/Gym",
  referee: "Referee",
} as const;

export interface Actor {
  id: string;
  username: string;
  password: string;
  token: string;
  clubId: string | null;
}

/**
 * Logs in as the seeded admin and creates one user per role
 * (plus a club for the Club/Gym user). Each call creates fresh users,
 * so every test file gets its own isolated set.
 */
export async function setupActors() {
  const adminToken = await login(ADMIN_USERNAME, ADMIN_PASSWORD);
  const me = await get("/users/me", adminToken);

  const clubRes = await post("/clubs", { name: `Actor Club ${uniq()}` }, adminToken);
  if (clubRes.status !== 201) throw new Error(`Club setup failed: ${JSON.stringify(clubRes.body)}`);
  const clubId: string = clubRes.body.data.id;

  async function makeUser(role: string, userClubId: string | null = null): Promise<Actor> {
    const username = `${role.replace(/\W+/g, "").toLowerCase()}_${uniq()}`;
    const password = randomPassword();
    const res = await post(
      "/users",
      { username, password, fullName: `Test ${role}`, email: `${username}@test.local`, role, clubId: userClubId },
      adminToken,
    );
    if (res.status !== 201) throw new Error(`User setup failed: ${JSON.stringify(res.body)}`);
    return { id: res.body.data.id, username, password, token: await login(username, password), clubId: userClubId };
  }

  return {
    admin: { id: me.body.data.id, username: ADMIN_USERNAME, password: ADMIN_PASSWORD, token: adminToken, clubId: null } as Actor,
    officer: await makeUser(ROLES.officer),
    organizer: await makeUser(ROLES.organizer),
    club: await makeUser(ROLES.club, clubId),
    referee: await makeUser(ROLES.referee),
    clubId,
  };
}

export type Actors = Awaited<ReturnType<typeof setupActors>>;

// ─── Shape snapshots ──────────────────────────────────────────────────────

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const STRING_FORMATS: [string, RegExp][] = [
  ["uuid", UUID],
  ["date", /^\d{4}-\d{2}-\d{2}$/],
  ["datetime(.000000Z)", /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{6}Z$/],
  ["datetime(+00:00)", /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}[+-]\d{2}:\d{2}$/],
  ["datetime(sql)", /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/],
  ["token", /^\d+\|[A-Za-z0-9]{40,}$/],
];

/** Describe a JSON value by structure and type, ignoring the actual values. */
export function shape(value: Json): Json {
  if (value === null) return "null";
  if (Array.isArray(value)) {
    if (value.length === 0) return [];
    const unique = new Map<string, Json>();
    for (const item of value) {
      const s = shape(item);
      unique.set(JSON.stringify(s), s);
    }
    return [...unique.values()];
  }
  switch (typeof value) {
    case "string":
      return STRING_FORMATS.find(([, re]) => re.test(value))?.[0] ?? "string";
    case "number":
      return "number";
    case "boolean":
      return "boolean";
    case "object":
      return Object.fromEntries(
        Object.keys(value)
          .sort()
          .map((k) => [k, shape(value[k])]),
      );
    default:
      return typeof value;
  }
}

/** Shape of a whole response: status code plus body shape. */
export const shapeOf = (res: ApiResponse) => ({ status: res.status, body: shape(res.body) });

/** Find the item with the given id in a list response. */
export function findById(res: ApiResponse, id: string): Json {
  const item = (res.body.data as Json[]).find((x) => x.id === id);
  if (!item) throw new Error(`id ${id} not in list response`);
  return item;
}
