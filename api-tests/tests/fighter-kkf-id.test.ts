/** KKF ID for every fighter, and the hard block on exact duplicates (claude/updates/fighter-kkf-id-optional-details.md). */
import { beforeAll, describe, expect, it } from "vitest";
import { type Actors, get, post, put, setupActors, shapeOf, uniq } from "./helpers";

let a: Actors;
beforeAll(async () => {
  a = await setupActors();
});

const body = (overrides: Record<string, unknown> = {}) => ({
  name: `Kkf ${uniq()}`,
  nameKhmer: `អ្នក ${uniq()}`,
  dateOfBirth: "1999-04-05",
  gender: "Male",
  currentWeight: 60,
  height: 170,
  ...overrides,
});

const make = async (overrides: Record<string, unknown> = {}) => (await post("/fighters", body(overrides), a.admin.token)).body.data;

describe("KKF ID", () => {
  it("gives every new fighter its own KKF-000123 style number, counting up", async () => {
    const first = await make();
    const second = await make();
    expect(first.kkfId).toMatch(/^KKF-\d{6,}$/);
    expect(second.kkfId).toMatch(/^KKF-\d{6,}$/);
    expect(Number(second.kkfId.slice(4))).toBeGreaterThan(Number(first.kkfId.slice(4)));
    // Part of both fighter shapes.
    const shown = (await get(`/fighters/${first.id}`)).body.data;
    expect(shown.kkfId).toBe(first.kkfId);
  });

  it("shows the next number before saving (a preview), to staff and clubs", async () => {
    for (const who of ["admin", "officer", "club"] as const) {
      const res = await get("/fighters/next-kkf-id", a[who].token);
      expect(res.status).toBe(200);
      expect(res.body.data.kkfId).toMatch(/^KKF-\d{6,}$/);
    }
    expect((await get("/fighters/next-kkf-id", a.referee.token)).status).toBe(403);
    expect((await get("/fighters/next-kkf-id")).status).toBe(401);
    const peek = (await get("/fighters/next-kkf-id", a.admin.token)).body.data.kkfId;
    // Not yet used by anyone.
    expect((await get(`/fighters/${peek}`)).status).toBe(404);
  });

  it("can be chosen when registering, and changed later, by KKF staff", async () => {
    const mine = `KKF-9${Math.floor(Math.random() * 90000 + 10000)}`;
    const f = await make({ kkfId: mine });
    expect(f.kkfId).toBe(mine);
    // Lower case and spaces are tolerated; the shape is checked.
    const next = `KKF-8${Math.floor(Math.random() * 90000 + 10000)}`;
    const changed = await put(`/fighters/${f.id}`, { kkfId: ` ${next.toLowerCase()} ` }, a.officer.token);
    expect(changed.body.data.kkfId).toBe(next);
    for (const bad of ["123", "KKF-12", "ABC-000123", "KKF-12ab", "KKF-1234567890123"]) {
      expect((await put(`/fighters/${f.id}`, { kkfId: bad }, a.admin.token)).status).toBe(422);
    }
    expect((await get(`/fighters/${f.id}`)).body.data.kkfId).toBe(next);
    // The old number is free again.
    expect((await make({ kkfId: mine })).kkfId).toBe(mine);
  });

  it("is unique: another fighter's number is refused, on create and on edit", async () => {
    const one = await make();
    const dupe = await post("/fighters", body({ kkfId: one.kkfId }), a.admin.token);
    expect(shapeOf(dupe)).toMatchSnapshot();
    expect(dupe.status).toBe(422);
    expect(dupe.body.error).toContain(one.kkfId);
    const two = await make();
    expect((await put(`/fighters/${two.id}`, { kkfId: one.kkfId }, a.admin.token)).status).toBe(422);
    // Saving a fighter with its own number again is fine.
    expect((await put(`/fighters/${one.id}`, { kkfId: one.kkfId, alias: "Tiger" }, a.admin.token)).status).toBe(200);
  });

  it("can't be set by clubs, and the counter skips numbers staff already took", async () => {
    const f = await make();
    const byClub = await post("/fighters", body({ kkfId: "KKF-777777" }), a.club.token);
    expect(byClub.status).toBe(201);
    expect(byClub.body.data.kkfId).not.toBe("KKF-777777");
    const own = (await post("/fighters", body({ dateOfBirth: "1999-05-05" }), a.club.token)).body.data;
    expect((await put(`/fighters/${own.id}`, { kkfId: "KKF-777778" }, a.club.token)).body.data.kkfId).toBe(own.kkfId);
    // Take the number the counter would hand out next: the next fighter gets the one after it.
    const peek = (await get("/fighters/next-kkf-id", a.admin.token)).body.data.kkfId;
    const taken = await make({ kkfId: peek });
    expect(taken.kkfId).toBe(peek);
    const after = await make();
    expect(after.kkfId).not.toBe(peek);
    expect(f.kkfId).not.toBe(after.kkfId);
  });

  it("is never reused after a fighter is deleted", async () => {
    const gone = await make();
    await fetch(`${process.env.API_URL ?? "http://localhost:3002/api"}/fighters/${gone.id}`, { method: "DELETE", headers: { Authorization: `Bearer ${a.admin.token}`, Accept: "application/json" } });
    const next = await make();
    expect(next.kkfId).not.toBe(gone.kkfId);
    expect(Number(next.kkfId.slice(4))).toBeGreaterThan(Number(gone.kkfId.slice(4)));
  });

  it("finds a fighter by KKF ID (profile lookup, staff list search, header search)", async () => {
    const f = await make();
    expect((await get(`/fighters/${f.kkfId}`)).body.data.id).toBe(f.id);
    expect((await get(`/fighters/${f.kkfId.toLowerCase()}`)).body.data.id).toBe(f.id);
    const page = (await get(`/fighters/page?q=${f.kkfId}`, a.officer.token)).body.data;
    expect(page.items.map((x: any) => x.id)).toEqual([f.id]);
    const search = (await get(`/search?q=${f.kkfId}`, a.officer.token)).body.data;
    expect(search.fighters.map((x: any) => x.id)).toContain(f.id);
    expect(search.fighters[0].kkfId).toBe(f.kkfId);
  });
});

describe("exact duplicates are refused", () => {
  it("same Khmer name and birth date → 422 naming the fighter and its KKF ID", async () => {
    const original = await make();
    const dupe = await post("/fighters", body({ name: `Other ${uniq()}`, nameKhmer: original.nameKhmer, dateOfBirth: "1999-04-05" }), a.admin.token);
    expect(shapeOf(dupe)).toMatchSnapshot();
    expect(dupe.status).toBe(422);
    expect(dupe.body.error).toContain(original.kkfId);
    expect(dupe.body.error).toContain(original.name);
    // The "possible same fighter" check (used by the form) reports the same pair, with the KKF ID.
    const similar = (await post("/fighters/similar", { name: "Someone Else", nameKhmer: original.nameKhmer, dateOfBirth: "1999-04-05" }, a.admin.token)).body.data;
    expect(similar[0]).toMatchObject({ id: original.id, kkfId: original.kkfId });
    expect(similar[0].reasons).toEqual(expect.arrayContaining(["same_name_khmer", "same_birth"]));
  });

  it("ignores spaces in the Khmer name", async () => {
    const original = await make({ nameKhmer: `ក ខ ${uniq()}` });
    const dupe = await post("/fighters", body({ nameKhmer: original.nameKhmer.replace(/ /g, "") }), a.admin.token);
    expect(dupe.status).toBe(422);
  });

  it("allows the same Khmer name with a different birth date, or a different name on the same date", async () => {
    const original = await make();
    expect((await post("/fighters", body({ nameKhmer: original.nameKhmer, dateOfBirth: "1999-04-06" }), a.admin.token)).status).toBe(201);
    expect((await post("/fighters", body({ dateOfBirth: "1999-04-05" }), a.admin.token)).status).toBe(201);
  });

  it("applies to clubs registering too, and a deleted fighter no longer counts", async () => {
    const original = await make();
    const byClub = await post("/fighters", body({ nameKhmer: original.nameKhmer }), a.club.token);
    expect(byClub.status).toBe(422);
    await fetch(`${process.env.API_URL ?? "http://localhost:3002/api"}/fighters/${original.id}`, { method: "DELETE", headers: { Authorization: `Bearer ${a.admin.token}`, Accept: "application/json" } });
    expect((await post("/fighters", body({ nameKhmer: original.nameKhmer }), a.admin.token)).status).toBe(201);
  });

  it("is checked on edit only when the Khmer name or birth date changes", async () => {
    const one = await make();
    const two = await make({ dateOfBirth: "1999-04-06" });
    // Moving "two" onto "one"'s name + birth date is refused ...
    const clash = await put(`/fighters/${two.id}`, { nameKhmer: one.nameKhmer, dateOfBirth: "1999-04-05" }, a.admin.token);
    expect(clash.status).toBe(422);
    // ... but an unrelated edit still saves, and so does changing to something free.
    expect((await put(`/fighters/${two.id}`, { alias: "Tiger" }, a.admin.token)).status).toBe(200);
    expect((await put(`/fighters/${two.id}`, { nameKhmer: `ថ្មី ${uniq()}` }, a.admin.token)).status).toBe(200);
  });

  it("doesn't check guests without a Khmer name", async () => {
    const guest = (name: string) => post("/fighters", { name, nationality: "Thai", gender: "Male", currentWeight: 60 }, a.admin.token);
    expect((await guest(`Guest ${uniq()}`)).status).toBe(201);
    expect((await guest(`Guest ${uniq()}`)).status).toBe(201);
  });
});
