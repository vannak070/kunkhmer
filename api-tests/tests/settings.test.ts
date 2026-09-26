import { beforeAll, describe, expect, it } from "vitest";
import { type Actors, del, findById, get, post, put, setupActors, shape, shapeOf, uniq } from "./helpers";

let a: Actors;

beforeAll(async () => {
  a = await setupActors();
});

const resources = {
  sponsors: {
    path: "/settings/sponsors",
    full: () => ({
      name: `Sponsor ${uniq()}`,
      logoUrl: "https://example.com/logo.png",
      image: "https://example.com/img.png",
      industry: "Beverages",
      tier: "Platinum",
      active: true,
      contactPerson: "Dara",
      contactEmail: "dara@example.com",
      contactPhone: "011223344",
      websiteUrl: "https://example.com",
    }),
    defaults: { tier: "Gold", active: true },
    update: { tier: "Silver", active: false },
    updated: { tier: "Silver", active: false },
    snake: { logo_url: "https://example.com/logo.png", contact_person: "Dara", website_url: "https://example.com" },
  },
  "broadcast-stations": {
    path: "/settings/broadcast-stations",
    full: () => ({
      name: `Station ${uniq()}`,
      streamUrl: "https://example.com/live",
      type: "Online",
      reach: "International",
      active: true,
      contactPerson: "Vanna",
      contactEmail: "vanna@example.com",
      contactPhone: "099887766",
      websiteUrl: "https://example.com",
      logoUrl: "https://example.com/logo.png",
      image: "https://example.com/img.png",
    }),
    defaults: { type: "Cable TV", reach: "National", active: true },
    update: { reach: "Regional", active: false },
    updated: { reach: "Regional", active: false },
    snake: { stream_url: "https://example.com/live", contact_person: "Vanna", logo_url: "https://example.com/logo.png" },
  },
} as const;

describe.each(Object.entries(resources))("%s", (_name, r) => {
  it("creates with all fields", async () => {
    const res = await post(r.path, r.full(), a.officer.token);
    expect(res.status).toBe(201);
    expect(res.body.data).toMatchObject(r.snake);
    expect(shapeOf(res)).toMatchSnapshot();
  });

  it("applies defaults when only a name is given", async () => {
    const res = await post(r.path, { name: `Minimal ${uniq()}` }, a.officer.token);
    expect(res.status).toBe(201);
    expect(res.body.data).toMatchObject(r.defaults);
  });

  it("lists publicly", async () => {
    const { body } = await post(r.path, r.full(), a.officer.token);
    const list = await get(r.path);
    expect(list.status).toBe(200);
    expect(shape(findById(list, body.data.id))).toEqual(shape(body.data));
  });

  it("updates only the given fields", async () => {
    const input = r.full();
    const { body } = await post(r.path, input, a.officer.token);
    const res = await put(`${r.path}/${body.data.id}`, r.update, a.officer.token);
    expect(res.status).toBe(200);
    expect(res.body.data).toMatchObject({ ...r.updated, name: input.name });
    expect(shapeOf(res)).toMatchSnapshot();
  });

  it("deletes (Super Admin only)", async () => {
    const { body } = await post(r.path, r.full(), a.officer.token);
    expect((await del(`${r.path}/${body.data.id}`, a.officer.token)).status).toBe(403);
    const res = await del(`${r.path}/${body.data.id}`, a.admin.token);
    expect(shapeOf(res)).toMatchSnapshot();
    expect((await get(r.path)).body.data.map((x: any) => x.id)).not.toContain(body.data.id);
  });

  it("returns 404 for unknown ids", async () => {
    const missing = "00000000-0000-4000-8000-000000000000";
    const res = await put(`${r.path}/${missing}`, { name: "x" }, a.admin.token);
    expect(shapeOf(res)).toMatchSnapshot();
    expect((await del(`${r.path}/${missing}`, a.admin.token)).status).toBe(404);
  });

  it.each(["organizer", "club", "referee"] as const)("%s cannot write", async (who) => {
    const { body } = await post(r.path, r.full(), a.admin.token);
    const res = await post(r.path, r.full(), a[who].token);
    expect(shapeOf(res)).toMatchSnapshot();
    expect((await put(`${r.path}/${body.data.id}`, { name: "x" }, a[who].token)).status).toBe(403);
    expect((await del(`${r.path}/${body.data.id}`, a[who].token)).status).toBe(403);
  });

  it("requires authentication for writes", async () => {
    expect((await post(r.path, r.full())).status).toBe(401);
  });
});
