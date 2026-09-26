/** News articles and videos. */
import { beforeAll, describe, expect, it } from "vitest";
import { type Actors, del, isLaravel, findById, get, post, put, setupActors, shape, shapeOf, uniq } from "./helpers";

let a: Actors;
let fighterId: string;

beforeAll(async () => {
  a = await setupActors();
  fighterId = (
    await post("/fighters", { name: `Video Fighter ${uniq()}`, nameKhmer: "x", dateOfBirth: "2001-01-01", gender: "Male", currentWeight: 60, height: 170, clubId: a.clubId }, a.admin.token)
  ).body.data.id;
});

const fullArticle = () => ({
  title: `Article ${uniq()}`,
  subtitle: "Subtitle",
  content: "<p>Body</p>",
  author: "KKF Media",
  publishDate: "2026-09-01",
  status: "Published",
  category: "Results",
  featuredImage: "https://example.com/n.png",
  tags: ["kun khmer", "results"],
  featured: true,
});

describe("news", () => {
  it("creates an article", async () => {
    const res = await post("/news", fullArticle(), a.officer.token);
    expect(res.status).toBe(200);
    expect(res.body.data).toMatchObject({ publish_date: "2026-09-01", featured: true, views: 0, tags: ["kun khmer", "results"] });
    expect(shapeOf(res)).toMatchSnapshot();
  });

  it("splits comma-separated tags and applies defaults", async () => {
    const res = await post("/news", { title: `Article ${uniq()}`, tags: "a, b ,c" }, a.officer.token);
    expect(res.body.data).toMatchObject({ tags: ["a", "b", "c"], status: "Draft", category: "General", featured: false, author: "Test KKF Officer" });
    expect(res.body.data.publish_date).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });

  it("lists and shows articles publicly", async () => {
    const { body } = await post("/news", fullArticle(), a.officer.token);
    const list = await get("/news");
    expect(list.status).toBe(200);
    const item = findById(list, body.data.id);
    expect(shape(item)).toMatchSnapshot("list item");
    const shown = await get(`/news/${body.data.id}`);
    expect(shown.status).toBe(200);
    expect(shape(shown.body.data)).toEqual(shape(item));
  });

  it("updates an article", async () => {
    const input = fullArticle();
    const { body } = await post("/news", input, a.officer.token);
    const res = await put(`/news/${body.data.id}`, { status: "Archived", tags: "x,y", featured: "false" }, a.officer.token);
    expect(res.status).toBe(200);
    expect(res.body.data).toMatchObject({ status: "Archived", tags: ["x", "y"], featured: false, title: input.title });
    expect(shapeOf(res)).toMatchSnapshot();
  });

  it("deletes an article", async () => {
    const { body } = await post("/news", fullArticle(), a.officer.token);
    const res = await del(`/news/${body.data.id}`, a.officer.token);
    expect(shapeOf(res)).toMatchSnapshot();
    expect((await get(`/news/${body.data.id}`)).status).toBe(404);
  });

  it("returns 404 for unknown articles", async () => {
    const missing = "00000000-0000-4000-8000-000000000000";
    expect(shapeOf(await get(`/news/${missing}`))).toMatchSnapshot();
    expect((await put(`/news/${missing}`, { title: "x" }, a.admin.token)).status).toBe(404);
    expect((await del(`/news/${missing}`, a.admin.token)).status).toBe(404);
  });

  it.each(["organizer", "club", "referee"] as const)("%s cannot write articles", async (who) => {
    const { body } = await post("/news", fullArticle(), a.admin.token);
    expect((await post("/news", fullArticle(), a[who].token)).status).toBe(403);
    expect((await put(`/news/${body.data.id}`, { title: "x" }, a[who].token)).status).toBe(403);
    expect((await del(`/news/${body.data.id}`, a[who].token)).status).toBe(403);
    expect((await post("/news", fullArticle())).status).toBe(401);
  });
});

const fullVideo = () => ({
  title: `Video ${uniq()}`,
  description: "Highlights",
  youtubeUrl: "https://youtube.com/watch?v=abc",
  duration: "12:34",
  category: "Highlights",
  status: "Published",
  tags: ["highlights"],
  fighterId,
  clubId: a.clubId,
  thumbnail: "https://example.com/t.png",
});

describe("videos", () => {
  it("creates a video with related fighter and club", async () => {
    const res = await post("/videos", fullVideo(), a.officer.token);
    expect(res.status).toBe(200);
    expect(res.body.data).toMatchObject({ fighter_id: fighterId, club_id: a.clubId, views: 0, tags: ["highlights"] });
    expect(res.body.data.fighter.id).toBe(fighterId);
    expect(res.body.data.club.id).toBe(a.clubId);
    expect(res.body.data.match).toBeNull();
    expect(shapeOf(res)).toMatchSnapshot();
  });

  it("applies defaults", async () => {
    const res = await post("/videos", { title: `Video ${uniq()}`, tags: "" }, a.officer.token);
    expect(res.body.data).toMatchObject({ category: "General", status: "Draft", tags: [], fighter: null, club: null });
  });

  it("lists and shows videos publicly", async () => {
    const { body } = await post("/videos", fullVideo(), a.officer.token);
    const list = await get("/videos");
    expect(list.status).toBe(200);
    const item = findById(list, body.data.id);
    expect(shape(item)).toMatchSnapshot("list item");
    const shown = await get(`/videos/${body.data.id}`);
    expect(shape(shown.body.data)).toEqual(shape(item));
  });

  it("updates a video", async () => {
    const { body } = await post("/videos", fullVideo(), a.officer.token);
    const res = await put(`/videos/${body.data.id}`, { title: "Renamed", tags: "p, q" }, a.officer.token);
    expect(res.status).toBe(200);
    expect(res.body.data).toMatchObject({ title: "Renamed", fighter_id: fighterId, club_id: a.clubId, tags: ["p", "q"] });
    expect(shapeOf(res)).toMatchSnapshot();
  });

  // Known Laravel bug: empty strings become null before the controller runs,
  // and isset(null) is false, so a relation can never be cleared.
  it.skipIf(isLaravel)("clears a relation when given an empty value", async () => {
    const { body } = await post("/videos", fullVideo(), a.officer.token);
    const res = await put(`/videos/${body.data.id}`, { fighterId: "" }, a.officer.token);
    expect(res.body.data).toMatchObject({ fighter_id: null, fighter: null, club_id: a.clubId });
  });

  it("deletes a video", async () => {
    const { body } = await post("/videos", fullVideo(), a.officer.token);
    const res = await del(`/videos/${body.data.id}`, a.officer.token);
    expect(shapeOf(res)).toMatchSnapshot();
    expect((await get(`/videos/${body.data.id}`)).status).toBe(404);
  });

  it("returns 404 for unknown videos", async () => {
    const missing = "00000000-0000-4000-8000-000000000000";
    expect(shapeOf(await get(`/videos/${missing}`))).toMatchSnapshot();
    expect((await put(`/videos/${missing}`, { title: "x" }, a.admin.token)).status).toBe(404);
    expect((await del(`/videos/${missing}`, a.admin.token)).status).toBe(404);
  });

  it.each(["organizer", "club", "referee"] as const)("%s cannot write videos", async (who) => {
    const { body } = await post("/videos", fullVideo(), a.admin.token);
    expect((await post("/videos", fullVideo(), a[who].token)).status).toBe(403);
    expect((await put(`/videos/${body.data.id}`, { title: "x" }, a[who].token)).status).toBe(403);
    expect((await del(`/videos/${body.data.id}`, a[who].token)).status).toBe(403);
    expect((await post("/videos", fullVideo())).status).toBe(401);
  });
});
