/** Settings lists (admin Phase 5): weight classes, venues, bout rule presets, glove brands. */
import { beforeAll, describe, expect, it } from "vitest";
import { type Actors, del, findById, get, post, put, setupActors, shape, shapeOf, uniq } from "./helpers";

let a: Actors;

beforeAll(async () => {
  a = await setupActors();
});

const LISTS = {
  "weight-classes": () => ({ name: `Class ${uniq()}`, nameKhmer: "ថ្នាក់", minKg: 90, maxKg: 95 }),
  venues: () => ({ name: `Venue ${uniq()}`, region: "Kampot", description: "Riverside arena", latitude: 10.61, longitude: 104.18 }),
  "bout-rules": () => ({ name: `Rule ${uniq()}`, nameKhmer: "ច្បាប់", rounds: 3, roundTime: 3, knockdownLimit: 2, gloveSize: "10oz" }),
  "glove-brands": () => ({ brand: `Brand ${uniq()}`, model: "Pro" }),
} as const;
type List = keyof typeof LISTS;

describe.each(Object.keys(LISTS) as List[])("settings list: %s", (list) => {
  const path = `/settings/${list}`;

  it("comes with the starting entries, readable by anyone", async () => {
    const res = await get(path);
    expect(res.status).toBe(200);
    expect(res.body.data.length).toBeGreaterThan(0);
    expect(res.body.data.every((r: any) => r.active)).toBe(true);
    expect(shape(res.body.data[0])).toMatchSnapshot();
  });

  it("lets the Super Admin add, edit, deactivate and delete an entry", async () => {
    const created = await post(path, LISTS[list](), a.admin.token);
    expect(created.status).toBe(201);
    expect(shapeOf(created)).toMatchSnapshot();
    const id = created.body.data.id;
    // New entries go to the end of the list.
    const before = (await get(path)).body.data;
    expect(before[before.length - 1].id).toBe(id);

    const moved = await put(`${path}/${id}`, { sortOrder: 0, active: false }, a.admin.token);
    expect(moved.body.data).toMatchObject({ sort_order: 0, active: false });
    // Inactive entries are hidden from forms and the public, but KKF staff can list them.
    expect((await get(path)).body.data.map((r: any) => r.id)).not.toContain(id);
    expect(findById(await get(`${path}?all=1`, a.officer.token), id).active).toBe(false);
    expect((await get(`${path}?all=1`)).body.data.map((r: any) => r.id)).not.toContain(id);

    const removed = await del(`${path}/${id}`, a.admin.token);
    expect(removed.status).toBe(200);
    expect((await put(`${path}/${id}`, { active: true }, a.admin.token)).status).toBe(404);
  });

  it("is edited by the Super Admin only", async () => {
    const id = (await post(path, LISTS[list](), a.admin.token)).body.data.id;
    for (const who of ["officer", "organizer", "club", "referee"] as const) {
      expect((await post(path, LISTS[list](), a[who].token)).status).toBe(403);
      expect((await put(`${path}/${id}`, { active: false }, a[who].token)).status).toBe(403);
      expect((await del(`${path}/${id}`, a[who].token)).status).toBe(403);
    }
    expect((await post(path, LISTS[list]())).status).toBe(401);
    expect((await put(`${path}/00000000-0000-4000-8000-000000000000`, { active: true }, a.admin.token)).status).toBe(404);
  });
});

describe("settings list rules", () => {
  it("needs a name", async () => {
    expect((await post("/settings/weight-classes", { minKg: 1, maxKg: 2 }, a.admin.token)).status).toBe(422);
    expect((await post("/settings/glove-brands", { model: "x" }, a.admin.token)).status).toBe(422);
    const id = (await post("/settings/venues", LISTS.venues(), a.admin.token)).body.data.id;
    expect((await put(`/settings/venues/${id}`, { name: "" }, a.admin.token)).status).toBe(422);
  });

  it("checks weight class bounds", async () => {
    const bad = async (body: Record<string, unknown>) => (await post("/settings/weight-classes", { name: `W ${uniq()}`, ...body }, a.admin.token)).status;
    expect(await bad({})).toBe(422);
    expect(await bad({ minKg: 70, maxKg: 60 })).toBe(422);
    expect(await bad({ minKg: -1 })).toBe(422);
    expect(await bad({ maxKg: "heavy" })).toBe(422);
    // Open-ended classes are fine: "Under 45 kg" has only a maximum.
    expect(await bad({ maxKg: 40 })).toBe(201);
    const id = (await post("/settings/weight-classes", { name: `W ${uniq()}`, minKg: 50, maxKg: 55 }, a.admin.token)).body.data.id;
    expect((await put(`/settings/weight-classes/${id}`, { minKg: 60 }, a.admin.token)).status).toBe(422);
  });

  it("checks bout rule numbers and venue coordinates", async () => {
    const rule = (body: Record<string, unknown>) => post("/settings/bout-rules", { ...LISTS["bout-rules"](), ...body }, a.admin.token);
    expect((await rule({ rounds: 0 })).status).toBe(422);
    expect((await rule({ rounds: 2.5 })).status).toBe(422);
    expect((await rule({ roundTime: 9 })).status).toBe(422);
    expect((await rule({ knockdownLimit: 0 })).status).toBe(201);
    expect((await post("/settings/bout-rules", { name: "No rounds" }, a.admin.token)).status).toBe(422);
    expect((await post("/settings/venues", { ...LISTS.venues(), longitude: null }, a.admin.token)).status).toBe(422);
    expect((await post("/settings/venues", { ...LISTS.venues(), latitude: 95 }, a.admin.token)).status).toBe(422);
  });

  it("starts with the 14 weight classes the admin used before", async () => {
    const names = (await get("/settings/weight-classes")).body.data.map((w: any) => w.name);
    expect(names.slice(0, 2)).toEqual(["Under 45 kg", "45 kg - 47 kg"]);
    expect(names).toContain("Over 80 kg");
  });
});
