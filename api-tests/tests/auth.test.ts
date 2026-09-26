import { beforeAll, describe, expect, it } from "vitest";
import {
  ADMIN_PASSWORD,
  ADMIN_USERNAME,
  type Actors,
  del,
  findById,
  get,
  login,
  post,
  put,
  randomPassword,
  setupActors,
  shape,
  shapeOf,
  uniq,
} from "./helpers";

let a: Actors;

beforeAll(async () => {
  a = await setupActors();
});

function newUserInput(role = "Referee") {
  const username = `user_${uniq()}`;
  return { username, fullName: "New User", email: `${username}@test.local`, role, password: randomPassword() };
}

describe("POST /users/login", () => {
  it("returns a token and the user on valid credentials", async () => {
    const res = await post("/users/login", { username: a.organizer.username, password: a.organizer.password });
    expect(res.status).toBe(200);
    expect(res.body.data.user).toMatchObject({ id: a.organizer.id, username: a.organizer.username });
    expect(res.body.data.user).not.toHaveProperty("password_hash");
    expect(shapeOf(res)).toMatchSnapshot();
    a.organizer.token = res.body.data.token; // older tokens are revoked on login
  });

  it("accepts the seeded admin credentials", async () => {
    const res = await post("/users/login", { username: ADMIN_USERNAME, password: ADMIN_PASSWORD });
    expect(res.status).toBe(200);
    a.admin.token = res.body.data.token;
  });

  it("rejects missing fields with 422", async () => {
    const res = await post("/users/login", { username: ADMIN_USERNAME });
    expect(shapeOf(res)).toMatchSnapshot();
    expect(res.status).toBe(422);
  });

  it("rejects a wrong password with 401", async () => {
    const res = await post("/users/login", { username: ADMIN_USERNAME, password: "wrong-password" });
    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });

  it("rejects an unknown username with 401", async () => {
    const res = await post("/users/login", { username: `nobody_${uniq()}`, password: "x" });
    expect(res.status).toBe(401);
  });

  it("rejects inactive users", async () => {
    const input = newUserInput();
    await post("/users", { ...input, status: "Inactive" }, a.admin.token);
    const res = await post("/users/login", { username: input.username, password: input.password });
    expect(res.status).toBe(401);
  });

  it("revokes earlier tokens (single session)", async () => {
    const first = await login(a.referee.username, a.referee.password);
    const second = await login(a.referee.username, a.referee.password);
    expect((await get("/users/me", first)).status).toBe(401);
    expect((await get("/users/me", second)).status).toBe(200);
    a.referee.token = second;
  });
});

describe("GET /users/me and POST /users/logout", () => {
  it("returns 401 without a token", async () => {
    const res = await get("/users/me");
    expect(shapeOf(res)).toMatchSnapshot();
    expect(res.status).toBe(401);
  });

  it("returns 401 with a bogus token", async () => {
    expect((await get("/users/me", "123|not-a-real-token")).status).toBe(401);
  });

  it("returns the current user", async () => {
    const res = await get("/users/me", a.officer.token);
    expect(res.status).toBe(200);
    expect(res.body.data).toMatchObject({ id: a.officer.id, username: a.officer.username, role: "KKF Officer" });
    expect(shapeOf(res)).toMatchSnapshot();
  });

  it("logout revokes the current token", async () => {
    const input = newUserInput();
    await post("/users", input, a.admin.token);
    const token = await login(input.username, input.password);
    const res = await post("/users/logout", {}, token);
    expect(shapeOf(res)).toMatchSnapshot();
    expect((await get("/users/me", token)).status).toBe(401);
  });
});

describe("user management as Super Admin", () => {
  it("creates, reads, updates and deletes a user", async () => {
    const input = newUserInput("Organizer");
    const created = await post("/users", { ...input, clubId: a.clubId }, a.admin.token);
    expect(created.status).toBe(201);
    expect(created.body.data).toMatchObject({
      username: input.username,
      fullName: input.fullName,
      email: input.email,
      role: "Organizer",
      clubId: a.clubId,
      status: "Active",
    });
    expect(shapeOf(created)).toMatchSnapshot("create");
    const id = created.body.data.id;

    const list = await get("/users", a.admin.token);
    expect(list.status).toBe(200);
    expect(shape(findById(list, id))).toEqual(shape(created.body.data));

    const shown = await get(`/users/${id}`, a.admin.token);
    expect(shown.status).toBe(200);
    expect(shown.body.data.id).toBe(id);

    const updated = await put(`/users/${id}`, { fullName: "Renamed", role: "KKF Officer" }, a.admin.token);
    expect(updated.status).toBe(200);
    expect(updated.body.data).toMatchObject({ fullName: "Renamed", role: "KKF Officer", username: input.username });

    const deleted = await del(`/users/${id}`, a.admin.token);
    expect(shapeOf(deleted)).toMatchSnapshot("delete");
    expect((await get(`/users/${id}`, a.admin.token)).status).toBe(404);
  });

  it("stores passwords so that login works and a changed password takes effect", async () => {
    const input = newUserInput();
    const { body } = await post("/users", input, a.admin.token);
    await login(input.username, input.password);

    const newPassword = randomPassword();
    await put(`/users/${body.data.id}`, { password: newPassword }, a.admin.token);
    expect((await post("/users/login", { username: input.username, password: input.password })).status).toBe(401);
    await login(input.username, newPassword);
  });

  it("requires username, fullName, email, password and role", async () => {
    const input = newUserInput();
    for (const field of ["username", "fullName", "email", "password", "role"] as const) {
      const res = await post("/users", { ...input, [field]: undefined }, a.admin.token);
      expect(res.status, field).toBe(422);
    }
  });

  it("returns 404 for unknown users", async () => {
    const missing = "00000000-0000-4000-8000-000000000000";
    const res = await get(`/users/${missing}`, a.admin.token);
    expect(shapeOf(res)).toMatchSnapshot();
    expect((await put(`/users/${missing}`, { fullName: "x" }, a.admin.token)).status).toBe(404);
    expect((await del(`/users/${missing}`, a.admin.token)).status).toBe(404);
  });

  it("does not let an admin delete their own account", async () => {
    const res = await del(`/users/${a.admin.id}`, a.admin.token);
    expect(res.status).toBe(422);
  });
});

describe("user management permissions", () => {
  const nonAdmins = ["officer", "organizer", "club", "referee"] as const;

  it.each(nonAdmins)("%s cannot list, create, update or delete users", async (who) => {
    const token = a[who].token;
    const forbidden = await get("/users", token);
    expect(shapeOf(forbidden)).toMatchSnapshot();
    expect(forbidden.status).toBe(403);
    expect((await post("/users", newUserInput(), token)).status).toBe(403);
    expect((await put(`/users/${a[who].id}`, { role: "Super Admin" }, token)).status).toBe(403);
    expect((await put(`/users/${a.admin.id}`, { password: "hijack" }, token)).status).toBe(403);
    expect((await del(`/users/${a.admin.id}`, token)).status).toBe(403);
  });

  it.each(nonAdmins)("%s can view only their own user record", async (who) => {
    expect((await get(`/users/${a[who].id}`, a[who].token)).status).toBe(200);
    expect((await get(`/users/${a.admin.id}`, a[who].token)).status).toBe(403);
  });

  it("requires authentication", async () => {
    expect((await get("/users")).status).toBe(401);
    expect((await post("/users", newUserInput())).status).toBe(401);
  });
});
