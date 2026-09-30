import { beforeAll, describe, expect, it } from "vitest";
import { type Actors, del, findById, get, post, put, setupActors, shape, shapeOf, uniq } from "./helpers";

let a: Actors;

beforeAll(async () => {
  a = await setupActors();
});

const fullClub = () => ({
  name: `Club ${uniq()}`,
  nameKhmer: "ក្លឹប",
  location: "Phnom Penh",
  headCoach: "Coach Sok",
  status: "active",
  rating: 4.5,
  image: "https://example.com/club.png",
  logoUrl: "https://example.com/logo.png",
  phone: "012345678",
  email: "club@example.com",
  established: "2010",
  description: "A test club",
});

describe("clubs CRUD", () => {
  it("creates a club with all fields", async () => {
    const input = fullClub();
    const res = await post("/clubs", input, a.officer.token);
    expect(res.status).toBe(201);
    expect(res.body.data).toMatchObject({
      name: input.name,
      name_khmer: input.nameKhmer,
      location: input.location,
      head_coach: input.headCoach,
      rating: 4.5,
      logo_url: input.logoUrl,
    });
    expect(shapeOf(res)).toMatchSnapshot();
  });

  it("applies defaults when only a name is given", async () => {
    const res = await post("/clubs", { name: `Club ${uniq()}` }, a.admin.token);
    expect(res.status).toBe(201);
    expect(res.body.data).toMatchObject({ status: "active", rating: 4 });
  });

  it("lists and shows clubs publicly, with a fighter count", async () => {
    const { body } = await post("/clubs", fullClub(), a.officer.token);
    const id = body.data.id;
    await post("/fighters", { name: "Counted", nameKhmer: "x", dateOfBirth: "2000-01-01", gender: "Male", currentWeight: 60, height: 170, clubId: id }, a.admin.token);

    const list = await get("/clubs");
    expect(list.status).toBe(200);
    const item = findById(list, id);
    expect(item.fighters_count).toBe(1);
    expect(shape(item)).toMatchSnapshot("list item");

    const shown = await get(`/clubs/${id}`);
    expect(shown.status).toBe(200);
    expect(shown.body.data.fighters_count).toBe(1);
    expect(shapeOf(shown)).toMatchSnapshot("show");
  });

  it("updates only the given fields", async () => {
    const input = fullClub();
    const { body } = await post("/clubs", input, a.officer.token);
    const res = await put(`/clubs/${body.data.id}`, { headCoach: "New Coach", rating: 3.5 }, a.officer.token);
    expect(res.status).toBe(200);
    expect(res.body.data).toMatchObject({ head_coach: "New Coach", rating: 3.5, name: input.name, location: input.location });
    expect(shapeOf(res)).toMatchSnapshot();
  });

  it("stores an uploaded logo as a file, shows it on the club's fighters, and clears it", async () => {
    const png = "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7";
    const { body } = await post("/clubs", { name: `Logo ${uniq()}`, logoUrl: png }, a.officer.token);
    expect(body.data.logo_url).toMatch(/^\/api\/files\/[0-9a-f]{64}\.gif$/);

    const fighter = await post("/fighters", { name: `Logo fighter ${uniq()}`, nameKhmer: "x", dateOfBirth: "2000-01-01", gender: "Male", currentWeight: 60, height: 170, clubId: body.data.id }, a.admin.token);
    expect(fighter.body.data.clubLogo).toBe(body.data.logo_url);

    const cleared = await put(`/clubs/${body.data.id}`, { logoUrl: "" }, a.officer.token);
    expect(cleared.status).toBe(200);
    expect(cleared.body.data.logo_url).toBeNull();
    // New fighters wait for verification, so read it as staff.
    expect((await get(`/fighters/${fighter.body.data.id}`, a.admin.token)).body.data.clubLogo).toBeNull();
  });

  it("deletes a club", async () => {
    const { body } = await post("/clubs", fullClub(), a.officer.token);
    const res = await del(`/clubs/${body.data.id}`, a.officer.token);
    expect(shapeOf(res)).toMatchSnapshot();
    expect((await get(`/clubs/${body.data.id}`)).status).toBe(404);
  });

  it("returns 404 for unknown clubs", async () => {
    const missing = "00000000-0000-4000-8000-000000000000";
    const res = await get(`/clubs/${missing}`);
    expect(shapeOf(res)).toMatchSnapshot();
    expect((await put(`/clubs/${missing}`, { name: "x" }, a.admin.token)).status).toBe(404);
    expect((await del(`/clubs/${missing}`, a.admin.token)).status).toBe(404);
  });
});

describe("clubs permissions", () => {
  it.each(["organizer", "club", "referee"] as const)("%s cannot create, update or delete clubs", async (who) => {
    const { body } = await post("/clubs", fullClub(), a.admin.token);
    const token = a[who].token;
    const res = await post("/clubs", fullClub(), token);
    expect(shapeOf(res)).toMatchSnapshot();
    expect((await put(`/clubs/${body.data.id}`, { name: "x" }, token)).status).toBe(403);
    expect((await del(`/clubs/${body.data.id}`, token)).status).toBe(403);
  });

  it("requires authentication for writes", async () => {
    expect((await post("/clubs", fullClub())).status).toBe(401);
    expect((await put(`/clubs/${a.clubId}`, { name: "x" })).status).toBe(401);
    expect((await del(`/clubs/${a.clubId}`)).status).toBe(401);
  });
});
