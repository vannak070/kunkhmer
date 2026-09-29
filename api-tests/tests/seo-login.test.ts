/** Sitemap for search engines, and brute-force protection on staff logins. */
import { beforeAll, describe, expect, it } from "vitest";
import { API_URL, type Actors, post, put, setupActors, uniq } from "./helpers";

let a: Actors;
beforeAll(async () => {
  a = await setupActors();
});

const sitemap = async () => {
  const res = await fetch(`${API_URL}/sitemap.xml`);
  return { status: res.status, type: res.headers.get("content-type") ?? "", body: await res.text() };
};

describe("sitemap.xml", () => {
  it("is public XML with the main sections", async () => {
    const res = await sitemap();
    expect(res.status).toBe(200);
    expect(res.type).toContain("application/xml");
    expect(res.body).toContain('<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">');
    for (const path of ["/matches</loc>", "/fighters</loc>", "/news-events</loc>", "/strategic-partners</loc>", "/about</loc>"]) {
      expect(res.body).toContain(path);
    }
  });

  it("lists published articles only, with readable links", async () => {
    const tag = uniq();
    const draft = (await post("/news", { title: `Draft ${tag}`, status: "Draft" }, a.officer.token)).body.data.id;
    const published = (await post("/news", { title: `Live ${tag}`, status: "Published" }, a.officer.token)).body.data.id;
    let body = (await sitemap()).body;
    // /news/<title words>-<first 8 of the id>, the same rule as the fan site (data/links.ts).
    expect(body).toContain(`/news/live-${tag}-${published.slice(0, 8)}</loc>`);
    expect(body).not.toContain(draft.slice(0, 8));
    await put(`/news/${draft}`, { status: "Published" }, a.officer.token);
    body = (await sitemap()).body;
    expect(body).toContain(`/news/draft-${tag}-${draft.slice(0, 8)}</loc>`);
  });

  it("uses the English title, or the date for a Khmer-only title", async () => {
    const both = (await post("/news", { title: "កីឡាករ ត្រឡប់មកវិញ", titleEn: "Fighters Return Home!", publishDate: "2026-06-16", status: "Published" }, a.officer.token)).body.data.id;
    const khmer = (await post("/news", { title: "កីឡាករ ត្រឡប់មកវិញ", publishDate: "2026-06-16", status: "Published" }, a.officer.token)).body.data.id;
    const body = (await sitemap()).body;
    expect(body).toContain(`/news/fighters-return-home-${both.slice(0, 8)}</loc>`);
    expect(body).toContain(`/news/2026-06-16-${khmer.slice(0, 8)}</loc>`);
  });

  it("lists the champions page and each approved title", async () => {
    const tag = uniq();
    const id = (await post("/champions", { titleName: `KKF National ${tag} 60kg`, championType: "KKF National", weightClass: 60 }, a.admin.token)).body.data.id;
    const body = (await sitemap()).body;
    expect(body).toContain("/champions</loc>");
    expect(body).toContain(`/champions/kkf-national-${tag}-60kg-${id.slice(0, 8)}</loc>`);
  });

  it("lists public events with readable links", async () => {
    const id = (await post("/events", { name: `Fight Night ${uniq()}`, date: "2026-11-06", location: "Phnom Penh", status: "Published" }, a.admin.token)).body.data.id;
    const body = (await sitemap()).body;
    expect(body).toMatch(new RegExp(`/events/fight-night-[0-9a-f]{8}-${id.slice(0, 8)}</loc>`));
  });
});

describe("staff login protection", () => {
  it("blocks a username after repeated failed logins, without affecting others", async () => {
    const username = `nobody_${uniq()}`;
    for (let i = 0; i < 10; i++) {
      expect((await post("/users/login", { username, password: "wrong password" })).status).toBe(401);
    }
    const blocked = await fetch(`${API_URL}/users/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password: "wrong password" }),
    });
    expect(blocked.status).toBe(429);
    expect(Number(blocked.headers.get("retry-after"))).toBeGreaterThan(0);
    expect(await blocked.json()).toEqual({ success: false, error: "Too many attempts. Please wait a few minutes and try again." });

    // Other accounts still sign in normally.
    const ok = await post("/users/login", { username: a.officer.username, password: a.officer.password });
    expect(ok.status).toBe(200);
  });

  it("never counts correct logins and clears the counter on success", async () => {
    const { username, password } = a.referee;
    for (let i = 0; i < 5; i++) await post("/users/login", { username, password: "wrong password" });
    expect((await post("/users/login", { username, password })).status).toBe(200);
    for (let i = 0; i < 9; i++) {
      expect((await post("/users/login", { username, password: "wrong password" })).status).toBe(401);
    }
    for (let i = 0; i < 12; i++) expect((await post("/users/login", { username, password })).status).toBe(200);
  });
});
