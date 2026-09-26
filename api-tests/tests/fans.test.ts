/** Public-site fan accounts: sign-up/in, profile, follows and notifications. */
import { beforeAll, describe, expect, it } from "vitest";
import { type Actors, api, del, get, post, put, setupActors, uniq } from "./helpers";

let a: Actors;
let eventId: string;

beforeAll(async () => {
  a = await setupActors();
  eventId = (await post("/events", { name: `Fan Event ${uniq()}`, date: "2026-11-01", location: "Phnom Penh", status: "Published" }, a.admin.token)).body.data.id;
});

const newEmail = () => `fan_${uniq()}@test.local`;

async function register(overrides: Record<string, unknown> = {}) {
  const body = { email: newEmail(), password: "correct horse 1", displayName: "Test Fan", language: "km", ...overrides };
  const res = await post("/fans/register", body);
  if (res.status !== 201) throw new Error(`fan register failed: ${JSON.stringify(res.body)}`);
  return { ...res.body.data, email: body.email, password: body.password } as { token: string; fan: any; email: string; password: string };
}

async function newFighter() {
  const res = await post(
    "/fighters",
    { name: `Fighter ${uniq()}`, nameKhmer: "អ្នកប្រដាល់", dateOfBirth: "2000-01-01", gender: "Male", currentWeight: 60, height: 170, grade: "B", status: "Active" },
    a.admin.token,
  );
  return res.body.data.id as string;
}

async function newMatch(fighterAId: string, fighterBId: string) {
  const subEventId = (await post("/matches/batches", { eventId, name: `Week ${uniq()}`, weekNumber: 1, date: "2026-11-01", location: "PP" }, a.admin.token)).body.data.id;
  const res = await post(
    "/matches",
    { subEventId, fighterAId, fighterBId, rounds: 5, roundTime: 180, knockdownLimit: 3, agreedWeight: 60, gloveSize: "10oz", gloveBrand: "Twins" },
    a.admin.token,
  );
  if (res.status !== 200) throw new Error(`match setup failed: ${JSON.stringify(res.body)}`);
  return res.body.data.id as string;
}

describe("fan sign-up and sign-in", () => {
  it("registers a fan and returns a fan token and profile", async () => {
    const email = newEmail();
    const res = await post("/fans/register", { email: email.toUpperCase(), password: "correct horse 1", displayName: " Sokha ", language: "km" });
    expect(res.status).toBe(201);
    expect(res.body.data.token).toMatch(/^kkf_[A-Za-z0-9_-]{43}$/);
    expect(res.body.data.fan).toMatchObject({ email, displayName: "Sokha", language: "km", notifyEmail: true });
    expect(res.body.data.fan).not.toHaveProperty("password_hash");
    expect(res.body.data.fan).not.toHaveProperty("passwordHash");
  });

  it("rejects a duplicate email, a short password, a bad email and an unknown language", async () => {
    const { email } = await register();
    expect((await post("/fans/register", { email, password: "long enough 1", displayName: "Dup" })).status).toBe(422);
    expect((await post("/fans/register", { email: newEmail(), password: "short", displayName: "Fan" })).status).toBe(422);
    expect((await post("/fans/register", { email: "not-an-email", password: "long enough 1", displayName: "Fan" })).status).toBe(422);
    expect((await post("/fans/register", { email: newEmail(), password: "long enough 1", displayName: "Fan", language: "fr" })).status).toBe(422);
  });

  it("signs in with the right password only", async () => {
    const { email, password } = await register();
    const okRes = await post("/fans/login", { email, password });
    expect(okRes.status).toBe(200);
    expect(okRes.body.data.token).toMatch(/^kkf_/);
    expect((await post("/fans/login", { email, password: "wrong password" })).status).toBe(401);
    expect((await post("/fans/login", { email: newEmail(), password })).status).toBe(401);
  });

  it("signs out by revoking the current token", async () => {
    const { token } = await register();
    expect((await get("/fans/me", token)).status).toBe(200);
    expect((await post("/fans/logout", {}, token)).status).toBe(200);
    expect((await get("/fans/me", token)).status).toBe(401);
  });
});

describe("fan tokens are separate from staff tokens", () => {
  it("a fan token cannot reach staff routes", async () => {
    const { token } = await register();
    expect((await get("/users/me", token)).status).toBe(401);
    expect((await post("/clubs", { name: `Fan Club ${uniq()}` }, token)).status).toBe(401);
  });

  it("a staff token cannot reach fan routes", async () => {
    expect((await get("/fans/me", a.admin.token)).status).toBe(401);
  });

  it("fan routes require a token", async () => {
    expect((await get("/fans/me")).status).toBe(401);
    expect((await get("/fans/me/notifications")).status).toBe(401);
  });
});

describe("fan profile", () => {
  it("updates name, language and email preference", async () => {
    const { token } = await register();
    const res = await put("/fans/me", { displayName: "Dara", language: "en", notifyEmail: false }, token);
    expect(res.status).toBe(200);
    expect(res.body.data).toMatchObject({ displayName: "Dara", language: "en", notifyEmail: false });
  });

  it("changes the password only with the current one, and signs out other devices", async () => {
    const { token, email, password } = await register();
    const other = (await post("/fans/login", { email, password })).body.data.token;
    expect((await put("/fans/me", { currentPassword: "wrong", newPassword: "brand new pass" }, token)).status).toBe(422);
    expect((await put("/fans/me", { currentPassword: password, newPassword: "brand new pass" }, token)).status).toBe(200);
    expect((await get("/fans/me", token)).status).toBe(200);
    expect((await get("/fans/me", other)).status).toBe(401);
    expect((await post("/fans/login", { email, password: "brand new pass" })).status).toBe(200);
  });

  it("deletes the account with the password", async () => {
    const { token, email, password } = await register();
    expect((await api("DELETE", "/fans/me", { token, body: { password: "wrong" } })).status).toBe(422);
    expect((await api("DELETE", "/fans/me", { token, body: { password } })).status).toBe(200);
    expect((await post("/fans/login", { email, password })).status).toBe(401);
  });
});

describe("following fighters", () => {
  it("follows and unfollows idempotently, with a public follower count", async () => {
    const { token } = await register();
    const fighterId = await newFighter();

    expect((await put(`/fans/me/follows/${fighterId}`, {}, token)).body.data).toEqual({ fighterId, following: true });
    expect((await put(`/fans/me/follows/${fighterId}`, {}, token)).status).toBe(200);
    expect((await get(`/fighters/${fighterId}/followers`)).body.data).toEqual({ count: 1 });

    const list = await get("/fans/me/follows", token);
    expect(list.body.data).toHaveLength(1);
    expect(list.body.data[0]).toMatchObject({ fighterId, nameKhmer: "អ្នកប្រដាល់" });

    expect((await del(`/fans/me/follows/${fighterId}`, token)).body.data).toEqual({ fighterId, following: false });
    expect((await del(`/fans/me/follows/${fighterId}`, token)).status).toBe(200);
    expect((await get(`/fighters/${fighterId}/followers`)).body.data).toEqual({ count: 0 });
  });

  it("404s for a fighter that doesn't exist", async () => {
    const { token } = await register();
    expect((await put("/fans/me/follows/00000000-0000-4000-8000-000000000000", {}, token)).status).toBe(404);
    expect((await put("/fans/me/follows/not-a-uuid", {}, token)).status).toBe(404);
  });
});

describe("notifications", () => {
  it("notifies followers when a bout is scheduled and when its result is recorded", async () => {
    const fan = await register();
    const bystander = await register();
    const followed = await newFighter();
    const opponent = await newFighter();
    await put(`/fans/me/follows/${followed}`, {}, fan.token);

    const matchId = await newMatch(followed, opponent);
    let res = await get("/fans/me/notifications", fan.token);
    expect(res.status).toBe(200);
    expect(res.body.data.unreadCount).toBe(1);
    expect(res.body.data.items[0]).toMatchObject({
      type: "bout_scheduled",
      read: false,
      data: { fighterId: followed, opponentId: opponent, eventId, date: "2026-11-01" },
    });

    await post(`/matches/${matchId}/result`, { winnerId: followed, method: "KO", round: 2, duration: "1:45" }, a.admin.token);
    // Re-saving the result must not notify twice.
    await post(`/matches/${matchId}/result`, { winnerId: followed, method: "KO", round: 2, duration: "1:45" }, a.admin.token);
    res = await get("/fans/me/notifications", fan.token);
    expect(res.body.data.unreadCount).toBe(2);
    expect(res.body.data.items).toHaveLength(2);
    expect(res.body.data.items.find((n: any) => n.type === "bout_result")).toMatchObject({ data: { outcome: "win", method: "KO", round: 2 } });

    // Only followers are notified.
    expect((await get("/fans/me/notifications", bystander.token)).body.data).toEqual({ items: [], unreadCount: 0 });
  });

  it("marks selected or all notifications as read", async () => {
    const fan = await register();
    const f1 = await newFighter();
    const f2 = await newFighter();
    await put(`/fans/me/follows/${f1}`, {}, fan.token);
    await put(`/fans/me/follows/${f2}`, {}, fan.token);
    await newMatch(f1, await newFighter());
    await newMatch(f2, await newFighter());

    const items = (await get("/fans/me/notifications", fan.token)).body.data.items;
    expect(items).toHaveLength(2);
    expect((await post("/fans/me/notifications/read", { ids: [items[0].id] }, fan.token)).body.data).toEqual({ marked: 1 });
    expect((await get("/fans/me/notifications", fan.token)).body.data.unreadCount).toBe(1);
    expect((await post("/fans/me/notifications/read", {}, fan.token)).body.data).toEqual({ marked: 1 });
    expect((await get("/fans/me/notifications", fan.token)).body.data.unreadCount).toBe(0);
    expect((await post("/fans/me/notifications/read", { ids: ["nope"] }, fan.token)).status).toBe(422);
  });
});
