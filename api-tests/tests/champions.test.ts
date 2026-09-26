import { beforeAll, describe, expect, it } from "vitest";
import { type Actors, del, findById, get, post, put, setupActors, shape, shapeOf, uniq } from "./helpers";

let a: Actors;
let holderId: string;

beforeAll(async () => {
  a = await setupActors();
  holderId = (
    await post("/fighters", { name: `Champ ${uniq()}`, nameKhmer: "x", dateOfBirth: "1998-01-01", gender: "Male", currentWeight: 60, height: 170, clubId: a.clubId, image: "https://example.com/c.png" }, a.admin.token)
  ).body.data.id;
});

const fullTitle = () => ({
  titleName: `KKF 60kg ${uniq()}`,
  championType: "National",
  weightClass: 60,
  organization: "KKF",
  batchId: "BATCH-1",
  eventName: "Final Night",
  currentHolderId: holderId,
  currentHolderName: "Champ",
  nationality: "Cambodian",
  status: "Active",
  defenseCount: 2,
  lastDefenseDate: "2026-08-01",
  nextDefenseDeadline: "2027-02-01",
  beltImageUrl: "https://example.com/belt.png",
  trophyImageUrl: "https://example.com/trophy.png",
  certificateUrl: "https://example.com/cert.pdf",
  notes: "Notes",
  approvalStatus: "approved",
});

describe("champions CRUD", () => {
  it("creates a title with a current holder", async () => {
    const res = await post("/champions", fullTitle(), a.officer.token);
    expect(res.status).toBe(200);
    expect(res.body.data).toMatchObject({
      current_holder_id: holderId,
      weight_class: 60,
      defense_count: 2,
      last_defense_date: "2026-08-01T00:00:00.000000Z",
      current_holder_photo_db: "https://example.com/c.png",
      current_holder_nationality_db: "Cambodian",
      defenses: [],
    });
    expect(shapeOf(res)).toMatchSnapshot();
  });

  it("applies defaults for a vacant title", async () => {
    const res = await post("/champions", { titleName: `Vacant ${uniq()}`, championType: "Regional", weightClass: 57 }, a.officer.token);
    expect(res.body.data).toMatchObject({ organization: "KKF", status: "Vacant", defense_count: 0, approval_status: "approved", current_holder_id: null, current_holder_name_db: null });
    expect(shapeOf(res)).toMatchSnapshot();
  });

  it("lists titles publicly", async () => {
    const { body } = await post("/champions", fullTitle(), a.officer.token);
    const list = await get("/champions");
    expect(list.status).toBe(200);
    const item = findById(list, body.data.id);
    expect(item).not.toHaveProperty("defenses");
    expect(shape(item)).toMatchSnapshot("list item");
  });

  it("updates a title", async () => {
    const { body } = await post("/champions", fullTitle(), a.officer.token);
    const res = await put(`/champions/${body.data.id}`, { status: "Suspended", notes: "Updated" }, a.officer.token);
    expect(res.status).toBe(200);
    expect(res.body.data).toMatchObject({ status: "Suspended", notes: "Updated", current_holder_id: holderId });
  });

  it("deletes a title (Super Admin only)", async () => {
    const { body } = await post("/champions", fullTitle(), a.officer.token);
    expect((await del(`/champions/${body.data.id}`, a.officer.token)).status).toBe(403);
    const res = await del(`/champions/${body.data.id}`, a.admin.token);
    expect(shapeOf(res)).toMatchSnapshot();
    expect((await get(`/champions/${body.data.id}`)).status).toBe(404);
  });

  it("returns 404 for unknown titles", async () => {
    const missing = "00000000-0000-4000-8000-000000000000";
    expect(shapeOf(await get(`/champions/${missing}`))).toMatchSnapshot();
    expect((await put(`/champions/${missing}`, { notes: "x" }, a.admin.token)).status).toBe(404);
    expect((await del(`/champions/${missing}`, a.admin.token)).status).toBe(404);
  });

  it.each(["organizer", "club", "referee"] as const)("%s cannot write titles", async (who) => {
    const { body } = await post("/champions", fullTitle(), a.admin.token);
    expect(shapeOf(await post("/champions", fullTitle(), a[who].token))).toMatchSnapshot();
    expect((await put(`/champions/${body.data.id}`, { notes: "x" }, a[who].token)).status).toBe(403);
    expect((await del(`/champions/${body.data.id}`, a[who].token)).status).toBe(403);
    expect((await post("/champions", fullTitle())).status).toBe(401);
  });
});
