import { beforeAll, describe, expect, it } from "vitest";
import { type Actors, del, get, post, put, setupActors, shapeOf, uniq } from "./helpers";

// Knowledge base for KUNKHMER HUB: KKF staff write drafts, only the Super Admin publishes.
describe("Knowledge base", () => {
  let a: Actors;
  beforeAll(async () => {
    a = await setupActors();
  });

  const draft = (extra: Record<string, unknown> = {}) => ({
    category: "rules",
    titleEn: `Rules ${uniq()}`,
    bodyEn: "Five rounds of three minutes.",
    titleKm: "ច្បាប់",
    bodyKm: "៥ ទឹក",
    source: "Test",
    ...extra,
  });

  it("lets an officer create a draft, never published", async () => {
    const res = await post("/knowledge", draft({ status: "Published", kmReviewed: true }), a.officer.token);
    expect(res.status).toBe(201);
    expect(res.body.data).toMatchObject({ status: "Draft", kmReviewed: false, category: "rules", publishedAt: null });
    expect(res.body.data.slug).toMatch(/^rules-/);
    expect(shapeOf(res)).toMatchSnapshot();
  });

  it("validates input", async () => {
    expect((await post("/knowledge", draft({ titleEn: "" }), a.admin.token)).status).toBe(422);
    expect((await post("/knowledge", draft({ bodyEn: null }), a.admin.token)).status).toBe(422);
    expect((await post("/knowledge", draft({ category: "gossip" }), a.admin.token)).status).toBe(422);
    for (const category of ["people", "organisations", "faq"]) {
      expect((await post("/knowledge", draft({ category }), a.officer.token)).status).toBe(201);
    }
    expect((await post("/knowledge", draft({ sortOrder: "first" }), a.admin.token)).status).toBe(422);
    const slug = `dup-${uniq()}`;
    expect((await post("/knowledge", draft({ slug }), a.admin.token)).status).toBe(201);
    expect((await post("/knowledge", draft({ slug }), a.admin.token)).status).toBe(422);
  });

  it("is for KKF staff only", async () => {
    expect((await get("/knowledge")).status).toBe(401);
    for (const who of ["organizer", "club", "referee"] as const) {
      expect((await get("/knowledge", a[who].token)).status).toBe(403);
      expect((await post("/knowledge", draft(), a[who].token)).status).toBe(403);
    }
    const list = await get("/knowledge?status=Draft&category=rules", a.officer.token);
    expect(list.status).toBe(200);
    expect(list.body.data.every((x: any) => x.status === "Draft" && x.category === "rules")).toBe(true);
    expect((await get("/knowledge/not-a-uuid", a.officer.token)).status).toBe(404);
    expect((await get("/knowledge/00000000-0000-4000-8000-000000000000", a.officer.token)).status).toBe(404);
  });

  it("only the Super Admin publishes, edits published text and approves Khmer", async () => {
    const created = await post("/knowledge", draft(), a.officer.token);
    const id = created.body.data.id;

    // Officer edits the draft but can't approve Khmer or publish.
    expect((await put(`/knowledge/${id}`, { bodyEn: "Updated." }, a.officer.token)).status).toBe(200);
    expect((await put(`/knowledge/${id}`, { kmReviewed: true }, a.officer.token)).status).toBe(403);
    expect((await post(`/knowledge/${id}/publish`, {}, a.officer.token)).status).toBe(403);

    const reviewed = await put(`/knowledge/${id}`, { kmReviewed: true }, a.admin.token);
    expect(reviewed.body.data.kmReviewed).toBe(true);

    const published = await post(`/knowledge/${id}/publish`, {}, a.admin.token);
    expect(published.status).toBe(200);
    expect(published.body.data).toMatchObject({ status: "Published" });
    expect(published.body.data.publishedAt).not.toBeNull();
    expect(shapeOf(published)).toMatchSnapshot();

    // Published: officer can't change or delete it.
    expect((await put(`/knowledge/${id}`, { bodyEn: "Sneaky." }, a.officer.token)).status).toBe(403);
    expect((await del(`/knowledge/${id}`, a.officer.token)).status).toBe(403);

    // Super Admin changes the Khmer text → needs review again.
    const edited = await put(`/knowledge/${id}`, { bodyKm: "៥ ទឹក ៣ នាទី" }, a.admin.token);
    expect(edited.body.data.kmReviewed).toBe(false);

    const unpublished = await post(`/knowledge/${id}/unpublish`, {}, a.admin.token);
    expect(unpublished.body.data.status).toBe("Draft");
    expect((await del(`/knowledge/${id}`, a.officer.token)).status).toBe(200);
    expect((await get(`/knowledge/${id}`, a.officer.token)).status).toBe(404);
  });
});
