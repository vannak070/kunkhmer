import { beforeAll, describe, expect, it } from "vitest";
import { API_URL, type Actors, get, post, put, setupActors, shapeOf, uniq } from "./helpers";

// About the Federation page: staff edit one draft, only the Super Admin publishes it.
// The page is a single row, so this file is the only one that touches it.
const PDF = `data:application/pdf;base64,${Buffer.from("%PDF-1.4\n% test\n1 0 obj << >> endobj\ntrailer << >>\n%%EOF\n").toString("base64")}`;
const GIF = "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7";

describe("About the Federation page", () => {
  let a: Actors;
  beforeAll(async () => {
    a = await setupActors();
  });

  const content = (extra: Record<string, unknown> = {}) => ({
    missionEn: `Promote Kun Khmer ${uniq()}`,
    missionKm: "លើកកម្ពស់គុនខ្មែរ",
    historyEn: "Founded to govern the sport.",
    foundedYear: 2008,
    leaders: [{ nameEn: "Test President", nameKm: "ប្រធាន", roleEn: "President", roleKm: "ប្រធាន", photoUrl: GIF }],
    addressEn: "Phnom Penh",
    phone: "+855 12 345 678",
    email: "info@example.org",
    officeHoursEn: "Mon–Fri 8:00–17:00",
    mapUrl: "https://maps.example.org/kkf",
    registerEn: "Clubs contact the federation office.",
    documents: [{ titleEn: "Rule book", titleKm: "ច្បាប់", fileUrl: PDF }],
    ...extra,
  });

  it("is for KKF staff only, except the public page", async () => {
    expect((await get("/federation")).status).toBe(200);
    expect((await get("/federation/draft")).status).toBe(401);
    for (const who of ["organizer", "club", "referee"] as const) {
      expect((await get("/federation/draft", a[who].token)).status).toBe(403);
      expect((await put("/federation/draft", content(), a[who].token)).status).toBe(403);
      expect((await post("/federation/discard", {}, a[who].token)).status).toBe(403);
    }
    expect((await get("/federation/draft", a.officer.token)).status).toBe(200);
  });

  it("validates the draft", async () => {
    const bad: Record<string, unknown>[] = [
      { email: "not-an-email" },
      { mapUrl: "http://maps.example.org" },
      { foundedYear: 1800 },
      { foundedYear: "soon" },
      { missionEn: "x".repeat(601) },
      { phone: "1".repeat(301) },
      { leaders: [{ nameEn: "No role" }] },
      { leaders: "President" },
      { leaders: Array.from({ length: 31 }, (_, i) => ({ nameEn: `L${i}`, roleEn: "Member" })) },
      { leaders: [{ nameEn: "Photo", roleEn: "Member", photoUrl: "javascript:alert(1)" }] },
      { documents: [{ titleEn: "No file" }] },
      { documents: [{ titleEn: "Not a PDF", fileUrl: GIF }] },
      { documents: [{ titleEn: "Fake PDF", fileUrl: `data:application/pdf;base64,${Buffer.from("hello").toString("base64")}` }] },
      { documents: [{ titleEn: "Web link", fileUrl: "https://example.org/rules.pdf" }] },
    ];
    for (const extra of bad) {
      const res = await put("/federation/draft", content(extra), a.officer.token);
      expect(res.status, JSON.stringify(extra).slice(0, 80)).toBe(422);
    }
  });

  it("lets an officer save a draft that stays private until the Super Admin publishes", async () => {
    // Start from a published empty page, so the shapes don't depend on earlier runs.
    await put("/federation/draft", {}, a.admin.token);
    await post("/federation/publish", {}, a.admin.token);
    const before = await get("/federation");
    expect(before.body.data).toBeNull();
    const saved = await put("/federation/draft", content({ missionEn: "Officer draft", foundedYear: "2008" }), a.officer.token);
    expect(saved.status).toBe(200);
    const d = saved.body.data;
    expect(d.changed).toBe(true);
    expect(d.draftUpdatedBy).toBe("Test KKF Officer");
    expect(d.draft).toMatchObject({ missionEn: "Officer draft", foundedYear: 2008, email: "info@example.org" });
    // Pictures and PDFs are stored as files, never as base64 text.
    expect(d.draft.leaders[0].photoUrl).toMatch(/^\/api\/files\/[a-f0-9]{64}\.gif$/);
    expect(d.draft.documents[0].fileUrl).toMatch(/^\/api\/files\/[a-f0-9]{64}\.pdf$/);
    expect(shapeOf(saved)).toMatchSnapshot();

    // Fans still see the previous page.
    expect((await get("/federation")).body.data?.missionEn ?? null).toBe(before.body.data?.missionEn ?? null);

    // Officers can't publish.
    expect((await post("/federation/publish", {}, a.officer.token)).status).toBe(403);

    const published = await post("/federation/publish", {}, a.admin.token);
    expect(published.status).toBe(200);
    expect(published.body.data.changed).toBe(false);
    expect(published.body.data.published).toMatchObject({ missionEn: "Officer draft" });

    const page = await get("/federation");
    expect(page.status).toBe(200);
    expect(page.body.data).toMatchObject({ missionEn: "Officer draft", foundedYear: 2008 });
    expect(page.body.data.documents[0].fileUrl).toMatch(/\.pdf$/);
    expect(shapeOf(page)).toMatchSnapshot();

    // The stored PDF is served as a PDF.
    const file = await fetch(API_URL.replace(/\/api$/, "") + page.body.data.documents[0].fileUrl);
    expect(file.status).toBe(200);
    expect(file.headers.get("content-type")).toBe("application/pdf");
    expect((await file.text()).startsWith("%PDF-")).toBe(true);
  });

  it("keeps stored files on re-save and can discard draft changes", async () => {
    const current = (await get("/federation/draft", a.officer.token)).body.data;
    const kept = await put("/federation/draft", { ...current.draft, missionEn: "Changed later" }, a.officer.token);
    expect(kept.status).toBe(200);
    expect(kept.body.data.draft.documents[0].fileUrl).toBe(current.draft.documents[0].fileUrl);
    expect(kept.body.data.changed).toBe(true);
    expect((await get("/federation")).body.data.missionEn).toBe("Officer draft");

    const discarded = await post("/federation/discard", {}, a.officer.token);
    expect(discarded.status).toBe(200);
    expect(discarded.body.data.changed).toBe(false);
    expect(discarded.body.data.draft.missionEn).toBe("Officer draft");
  });

  it("shows nothing publicly when the published page is empty", async () => {
    expect((await put("/federation/draft", { missionEn: "", leaders: [], documents: [] }, a.admin.token)).status).toBe(200);
    expect((await post("/federation/publish", {}, a.admin.token)).status).toBe(200);
    const page = await get("/federation");
    expect(page.status).toBe(200);
    expect(page.body.data).toBeNull();
  });

  it("lists the page in the sitemap only while something is published", async () => {
    const sitemap = async () => (await fetch(`${API_URL}/sitemap.xml`)).text();
    expect(await sitemap()).not.toContain("/federation<");
    await put("/federation/draft", content(), a.admin.token);
    await post("/federation/publish", {}, a.admin.token);
    expect(await sitemap()).toContain("/federation</loc>");
  });
});
