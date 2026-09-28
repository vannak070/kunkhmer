/** Pictures sent as base64 data URIs are stored as files and served from /api/files/:name. */
import { beforeAll, describe, expect, it } from "vitest";
import { API_URL, type Actors, post, setupActors, uniq } from "./helpers";

// A 1×1 PNG and a 1×1 GIF.
const PNG_B64 = "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==";
const PNG = `data:image/png;base64,${PNG_B64}`;
const GIF = "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7";
const FILE_URL = /^\/api\/files\/[a-f0-9]{64}\.(png|gif)$/;

const fileFetch = (path: string) => fetch(API_URL.replace(/\/api$/, "") + path);

let a: Actors;
beforeAll(async () => {
  a = await setupActors();
});

const fighter = (image: unknown) => ({
  name: `File Fighter ${uniq()}`, nameKhmer: "x", dateOfBirth: "2000-01-01", gender: "Male",
  currentWeight: 60, height: 170, clubId: a.clubId, image,
});

describe("pictures as files", () => {
  it("stores a data-URI picture as a file and returns its link", async () => {
    const res = await post("/fighters", fighter(PNG), a.admin.token);
    expect(res.status).toBe(201);
    const url: string = res.body.data.image;
    expect(url).toMatch(FILE_URL);

    const file = await fileFetch(url);
    expect(file.status).toBe(200);
    expect(file.headers.get("content-type")).toBe("image/png");
    expect(file.headers.get("cache-control")).toContain("immutable");
    expect(file.headers.get("x-content-type-options")).toBe("nosniff");
    expect(Buffer.from(await file.arrayBuffer()).equals(Buffer.from(PNG_B64, "base64"))).toBe(true);
  });

  it("stores the same picture once (same link) and handles other types", async () => {
    const one = (await post("/fighters", fighter(PNG), a.admin.token)).body.data.image;
    const two = (await post("/fighters", fighter(PNG), a.admin.token)).body.data.image;
    expect(one).toBe(two);
    const gif = (await post("/fighters", fighter(GIF), a.admin.token)).body.data.image;
    expect(gif).toMatch(/\.gif$/);
    expect((await fileFetch(gif)).headers.get("content-type")).toBe("image/gif");
  });

  it("leaves normal links alone and rejects unsupported pictures", async () => {
    const link = "https://example.com/photo.png";
    expect((await post("/fighters", fighter(link), a.admin.token)).body.data.image).toBe(link);
    const bmp = await post("/fighters", fighter("data:image/bmp;base64,Qk0="), a.admin.token);
    expect(bmp.status).toBe(422);
  });

  it("stores pictures in any module (sponsor logo)", async () => {
    const res = await post("/settings/sponsors", { name: `Sponsor ${uniq()}`, logoUrl: PNG }, a.admin.token);
    expect([200, 201]).toContain(res.status);
    const logo = res.body.data.logo_url ?? res.body.data.logoUrl;
    expect(logo).toMatch(FILE_URL);
  });

  it("404s unknown or malformed file names", async () => {
    expect((await fileFetch(`/api/files/${"0".repeat(64)}.png`)).status).toBe(404);
    expect((await fileFetch("/api/files/../../package.json")).status).toBe(404);
    expect((await fileFetch("/api/files/not-a-hash.png")).status).toBe(404);
  });
});
