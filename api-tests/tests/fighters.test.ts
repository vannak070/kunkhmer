import { beforeAll, describe, expect, it } from "vitest";
import { type Actors, del, findById, get, post, put, setupActors, shape, shapeOf, uniq } from "./helpers";

let a: Actors;
let otherClubId: string;

beforeAll(async () => {
  a = await setupActors();
  otherClubId = (await post("/clubs", { name: `Other Club ${uniq()}` }, a.admin.token)).body.data.id;
});

const fullFighter = (clubId: string | null = null) => ({
  name: `Fighter ${uniq()}`,
  nameKhmer: "អ្នកប្រដាល់",
  alias: "The Tiger",
  dateOfBirth: "2000-05-15",
  nationality: "Cambodian",
  province: "Siem Reap",
  gender: "Male",
  currentWeight: 63.5,
  height: 172,
  clubId,
  style: "Kun Khmer",
  grade: "B",
  image: "https://example.com/f.png",
  record: "10-2-1",
  status: "Draft",
});

describe("fighters CRUD", () => {
  it("creates a fighter with all fields", async () => {
    const input = fullFighter(a.clubId);
    const res = await post("/fighters", input, a.officer.token);
    expect(res.status).toBe(201);
    expect(res.body.data).toMatchObject({
      name: input.name,
      nameKhmer: input.nameKhmer,
      dateOfBirth: "2000-05-15",
      currentWeight: 63.5,
      height: 172,
      clubId: a.clubId,
      grade: "B",
      record: "10-2-1",
      status: "Draft",
    });
    // professionalStatus is checked separately below.
    const { professionalStatus: _, ...rest } = res.body.data;
    expect(shapeOf({ ...res, body: { ...res.body, data: rest } })).toMatchSnapshot();
  });

  it("saves professionalStatus on create and update", async () => {
    const created = await post("/fighters", { ...fullFighter(a.clubId), professionalStatus: "Amateur" }, a.officer.token);
    expect(created.body.data.professionalStatus).toBe("Amateur");
    const updated = await put(`/fighters/${created.body.data.id}`, { professionalStatus: "Professional" }, a.officer.token);
    expect(updated.body.data.professionalStatus).toBe("Professional");
  });

  it("lists fighters publicly and filters by status and clubId", async () => {
    const draft = (await post("/fighters", fullFighter(otherClubId), a.officer.token)).body.data;
    const active = (await post("/fighters", { ...fullFighter(otherClubId), status: "Active" }, a.officer.token)).body.data;

    const all = await get("/fighters");
    expect(all.status).toBe(200);
    expect(shape(findById(all, active.id))).toMatchSnapshot("list item");
    // The public never sees fighters KKF hasn't verified; signed-in staff see everyone.
    expect(all.body.data.map((f: any) => f.id)).not.toContain(draft.id);
    const staffByClub = (await get(`/fighters?clubId=${otherClubId}`, a.officer.token)).body.data.map((f: any) => f.id);
    expect(staffByClub).toEqual(expect.arrayContaining([draft.id, active.id]));

    const activeInClub = (await get(`/fighters?clubId=${otherClubId}&status=Active`, a.officer.token)).body.data.map((f: any) => f.id);
    expect(activeInClub).toContain(active.id);
    expect(activeInClub).not.toContain(draft.id);
  });

  it("shows a fighter by id, by name, by slug and by Khmer name", async () => {
    const name = `Sok Chan ${uniq()}`;
    const nameKhmer = `សុខ ${uniq()}`;
    const { body } = await post("/fighters", { ...fullFighter(a.clubId), name, nameKhmer, status: "Active" }, a.officer.token);

    const byId = await get(`/fighters/${body.data.id}`);
    expect(byId.status).toBe(200);
    expect(byId.body.data.clubName).toBeTypeOf("string");
    expect(shapeOf(byId)).toMatchSnapshot();

    expect((await get(`/fighters/${encodeURIComponent(name)}`)).body.data.id).toBe(body.data.id);
    expect((await get(`/fighters/${name.toLowerCase().replace(/ /g, "-")}`)).body.data.id).toBe(body.data.id);
    expect((await get(`/fighters/${encodeURIComponent(nameKhmer)}`)).body.data.id).toBe(body.data.id);
  });

  it("updates only the given fields", async () => {
    const input = fullFighter(a.clubId);
    const { body } = await post("/fighters", input, a.officer.token);
    const res = await put(`/fighters/${body.data.id}`, { grade: "A", currentWeight: 65 }, a.officer.token);
    expect(res.status).toBe(200);
    expect(res.body.data).toMatchObject({ grade: "A", currentWeight: 65, name: input.name, alias: input.alias });
    expect(shapeOf(res)).toMatchSnapshot();
  });

  it("verifies a fighter", async () => {
    const { body } = await post("/fighters", fullFighter(a.clubId), a.officer.token);
    const res = await post(`/fighters/${body.data.id}/verify`, {}, a.officer.token);
    expect(res.status).toBe(200);
    expect(res.body.data).toMatchObject({ status: "Active", verifiedBy: a.officer.id });
    expect(shapeOf(res)).toMatchSnapshot();
  });

  it("deletes a fighter", async () => {
    const { body } = await post("/fighters", fullFighter(a.clubId), a.officer.token);
    const res = await del(`/fighters/${body.data.id}`, a.officer.token);
    expect(shapeOf(res)).toMatchSnapshot();
    expect((await get(`/fighters/${body.data.id}`)).status).toBe(404);
    expect((await get("/fighters")).body.data.map((f: any) => f.id)).not.toContain(body.data.id);
  });

  it("returns 404 for unknown fighters", async () => {
    const missing = "00000000-0000-4000-8000-000000000000";
    const res = await get(`/fighters/${missing}`);
    expect(shapeOf(res)).toMatchSnapshot();
    expect((await get(`/fighters/no-such-fighter-${uniq()}`)).status).toBe(404);
    expect((await put(`/fighters/${missing}`, { grade: "A" }, a.admin.token)).status).toBe(404);
    expect((await post(`/fighters/${missing}/verify`, {}, a.admin.token)).status).toBe(404);
    expect((await del(`/fighters/${missing}`, a.admin.token)).status).toBe(404);
  });
});

describe("fighter verification", () => {
  it("hides unverified fighters from the public until KKF verifies them", async () => {
    const { body } = await post("/fighters", fullFighter(), a.club.token);
    expect(body.data.status).toBe("Draft");
    expect((await get(`/fighters/${body.data.id}`)).status).toBe(404);
    expect((await get("/fighters?status=Draft")).body.data).toEqual([]);
    expect((await get(`/fighters/${body.data.id}`, a.officer.token)).status).toBe(200);

    await post(`/fighters/${body.data.id}/verify`, {}, a.officer.token);
    expect((await get(`/fighters/${body.data.id}`)).status).toBe(200);
  });

  it("sends a fighter back with a reason; the club's edit re-submits it; verify clears the reason", async () => {
    const { body } = await post("/fighters", fullFighter(), a.club.token);
    const rejected = await post(`/fighters/${body.data.id}/reject`, { reason: "Photo missing" }, a.officer.token);
    expect(rejected.status).toBe(200);
    expect(rejected.body.data).toMatchObject({ status: "Rejected", reviewNote: "Photo missing" });
    expect(shapeOf(rejected)).toMatchSnapshot();
    expect((await get(`/fighters/${body.data.id}`)).status).toBe(404);

    const resubmitted = await put(`/fighters/${body.data.id}`, { image: "https://example.com/new.png" }, a.club.token);
    expect(resubmitted.body.data.status).toBe("Draft");

    const verified = await post(`/fighters/${body.data.id}/verify`, {}, a.admin.token);
    expect(verified.body.data).toMatchObject({ status: "Active", reviewNote: null, verifiedBy: a.admin.id });
  });

  it("requires a reason, staff only", async () => {
    const { body } = await post("/fighters", fullFighter(), a.club.token);
    expect((await post(`/fighters/${body.data.id}/reject`, {}, a.officer.token)).status).toBe(422);
    for (const who of ["organizer", "club", "referee"] as const) {
      expect((await post(`/fighters/${body.data.id}/reject`, { reason: "x" }, a[who].token)).status).toBe(403);
    }
    expect((await post(`/fighters/${body.data.id}/reject`, { reason: "x" })).status).toBe(401);
  });
});

describe("fighters permissions", () => {
  it("a Club/Gym user always creates Draft fighters in their own club", async () => {
    const res = await post("/fighters", { ...fullFighter(otherClubId), status: "Active" }, a.club.token);
    expect(res.status).toBe(201);
    expect(res.body.data).toMatchObject({ clubId: a.clubId, status: "Draft" });
  });

  it("a Club/Gym user can edit their own fighters but not change status or club", async () => {
    const { body } = await post("/fighters", fullFighter(), a.club.token);
    const res = await put(`/fighters/${body.data.id}`, { alias: "Edited", status: "Active", clubId: otherClubId }, a.club.token);
    expect(res.status).toBe(200);
    expect(res.body.data).toMatchObject({ alias: "Edited", status: "Draft", clubId: a.clubId });
  });

  it("a Club/Gym user cannot edit another club's fighters", async () => {
    const { body } = await post("/fighters", fullFighter(otherClubId), a.officer.token);
    const res = await put(`/fighters/${body.data.id}`, { alias: "Hijacked" }, a.club.token);
    expect(shapeOf(res)).toMatchSnapshot();
    expect(res.status).toBe(403);
  });

  it("non-staff cannot set a fighter's status, and only staff or the fighter's club may edit", async () => {
    const created = await post("/fighters", { ...fullFighter(a.clubId), status: "Active" }, a.club.token);
    expect(created.body.data.status).toBe("Draft");
    const updated = await put(`/fighters/${created.body.data.id}`, { status: "Active" }, a.organizer.token);
    expect(updated.status).toBe(403);
    expect((await put(`/fighters/${created.body.data.id}`, { alias: "x" }, a.referee.token)).status).toBe(403);
  });

  it.each(["organizer", "referee"] as const)("%s cannot register fighters (clubs and KKF staff do)", async (who) => {
    const res = await post("/fighters", fullFighter(a.clubId), a[who].token);
    expect(shapeOf(res)).toMatchSnapshot();
    expect(res.status).toBe(403);
  });

  it.each(["organizer", "club", "referee"] as const)("%s cannot verify or delete fighters", async (who) => {
    const { body } = await post("/fighters", fullFighter(a.clubId), a.admin.token);
    const res = await post(`/fighters/${body.data.id}/verify`, {}, a[who].token);
    expect(shapeOf(res)).toMatchSnapshot();
    expect((await del(`/fighters/${body.data.id}`, a[who].token)).status).toBe(403);
    expect((await get(`/fighters/${body.data.id}`, a.admin.token)).body.data.status).toBe("Draft");
  });

  it("requires authentication for writes", async () => {
    const { body } = await post("/fighters", fullFighter(a.clubId), a.admin.token);
    expect((await post("/fighters", fullFighter())).status).toBe(401);
    expect((await put(`/fighters/${body.data.id}`, { grade: "A" })).status).toBe(401);
    expect((await post(`/fighters/${body.data.id}/verify`, {})).status).toBe(401);
    expect((await del(`/fighters/${body.data.id}`)).status).toBe(401);
  });
});
