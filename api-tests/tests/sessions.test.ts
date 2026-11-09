/** Signed in on several devices (claude/updates/multi-device-sign-in.md): device list, limit of 5, sign out one / the others. */
import { beforeAll, describe, expect, it } from "vitest";
import { API_URL, type Actors, del, get, post, put, randomPassword, setupActors, shapeOf, uniq } from "./helpers";

let a: Actors;
beforeAll(async () => {
  a = await setupActors();
});

const ANDROID = "Mozilla/5.0 (Linux; Android 14; SM-A546E) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/129.0 Mobile Safari/537.36";
const IPHONE = "Mozilla/5.0 (iPhone; CPU iPhone OS 17_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.6 Mobile/15E148 Safari/604.1";
const loginFrom = async (username: string, password: string, userAgent: string) => {
  const res = await fetch(`${API_URL}/users/login`, { method: "POST", headers: { "Content-Type": "application/json", Accept: "application/json", "User-Agent": userAgent }, body: JSON.stringify({ username, password }) });
  return (await res.json()).data.token as string;
};
const newStaff = async () => {
  const username = `dev_${uniq()}`;
  const password = randomPassword();
  const res = await post("/users", { username, password, fullName: "Device Tester", email: `${username}@test.local`, role: "KKF Officer" }, a.admin.token);
  return { id: res.body.data.id as string, username, password };
};

describe("signed-in devices", () => {
  it("lists each device by name, marks this one, and keeps them all signed in", async () => {
    const u = await newStaff();
    const phone = await loginFrom(u.username, u.password, ANDROID);
    const iphone = await loginFrom(u.username, u.password, IPHONE);
    const res = await get("/users/me/sessions", iphone);
    expect(res.status).toBe(200);
    expect(shapeOf(res)).toMatchSnapshot("sessions");
    expect(res.body.data.map((s: any) => s.device).sort()).toEqual(["Chrome on Android", "Safari on iPhone"]);
    expect(res.body.data.find((s: any) => s.current).device).toBe("Safari on iPhone");
    expect((await get("/users/me", phone)).status).toBe(200);
  });

  it("keeps at most 5 devices: a 6th sign-in ends the one unused the longest", async () => {
    const u = await newStaff();
    const tokens: string[] = [];
    for (let i = 0; i < 6; i++) tokens.push(await loginFrom(u.username, u.password, ANDROID));
    expect((await get("/users/me", tokens[0])).status).toBe(401);
    for (const t of tokens.slice(1)) expect((await get("/users/me", t)).status).toBe(200);
    expect((await get("/users/me/sessions", tokens[5])).body.data).toHaveLength(5);
  });

  it("signs out one device or all the others, only among one's own", async () => {
    const u = await newStaff();
    const phone = await loginFrom(u.username, u.password, ANDROID);
    const laptop = await loginFrom(u.username, u.password, IPHONE);
    const tablet = await loginFrom(u.username, u.password, ANDROID);
    const phoneId = (await get("/users/me/sessions", laptop)).body.data.find((s: any) => !s.current && s.device === "Chrome on Android").id;

    // Someone else can't end it; an unknown or malformed id is 404.
    expect((await del(`/users/me/sessions/${phoneId}`, a.officer.token)).status).toBe(404);
    expect((await del("/users/me/sessions/abc", laptop)).status).toBe(404);
    expect((await del("/users/me/sessions/999999999", laptop)).status).toBe(404);

    expect((await del(`/users/me/sessions/${phoneId}`, laptop)).status).toBe(200);
    const left = [await get("/users/me", phone), await get("/users/me", tablet)].filter((r) => r.status === 200).length;
    expect(left).toBe(1);

    const others = await post("/users/me/sessions/sign-out-others", {}, laptop);
    expect(others.status).toBe(200);
    expect(others.body.data.signedOut).toBe(1);
    expect((await get("/users/me", tablet)).status).toBe(401);
    expect((await get("/users/me", laptop)).status).toBe(200);
    expect((await get("/users/me/sessions")).status).toBe(401);
  });

  it("ends every session of an account that is deactivated", async () => {
    const u = await newStaff();
    const phone = await loginFrom(u.username, u.password, ANDROID);
    const laptop = await loginFrom(u.username, u.password, IPHONE);
    expect((await put(`/users/${u.id}`, { status: "Inactive" }, a.admin.token)).status).toBe(200);
    expect((await get("/users/me", phone)).status).toBe(401);
    expect((await get("/users/me", laptop)).status).toBe(401);
  });
});
