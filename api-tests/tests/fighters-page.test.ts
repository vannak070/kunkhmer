/** One page of the admin Fighters list (claude/updates/admin-fighters-paging.md). */
import { beforeAll, describe, expect, it } from "vitest";
import { type Actors, get, post, put, setupActors, uniq } from "./helpers";

let a: Actors;
const tag = `Pg${uniq()}`;
let clubId: string;
const made: { id: string; name: string; kg: number; nationality: string; club: boolean }[] = [];

const fighter = async (token: string, body: Record<string, unknown>) => (await post("/fighters", { nameKhmer: "គុន", dateOfBirth: "2000-01-01", gender: "Male", height: 170, grade: "B", ...body }, token)).body.data.id as string;
const page = async (qs: string, token = a.admin.token) => (await get(`/fighters/page?${qs}`, token)).body.data;
const all = async (qs: string) => {
  const out: any[] = [];
  for (let offset = 0; ; offset += 100) {
    const p = await page(`${qs}&limit=100&offset=${offset}`);
    out.push(...p.items);
    if (out.length >= p.total || !p.items.length) return out;
  }
};

beforeAll(async () => {
  a = await setupActors();
  clubId = (await post("/clubs", { name: `${tag} Club` }, a.admin.token)).body.data.id;
  const specs = [
    { name: `${tag} Alpha`, kg: 54, nationality: "Cambodian", club: true },
    { name: `${tag} Bravo`, kg: 57, nationality: "Cambodian", club: false },
    { name: `${tag} Charlie`, kg: 60, nationality: "Thai", club: true },
    { name: `${tag} Delta`, kg: 63.5, nationality: "Cambodian", club: false },
    { name: `${tag} Echo`, kg: 67, nationality: "Japanese", club: false },
  ];
  for (const s of specs) made.push({ ...s, id: await fighter(a.admin.token, { name: s.name, currentWeight: s.kg, nationality: s.nationality, ...(s.club ? { clubId } : {}) }) });
  await put(`/fighters/${made[1].id}`, { status: "Injured" }, a.admin.token);
  await fighter(a.club.token, { name: `${tag} Draftee`, currentWeight: 50 }); // a club's fighter starts as Draft
});

describe("fighters page", () => {
  it("needs a signed-in user", async () => {
    expect((await get("/fighters/page")).status).toBe(401);
  });

  it("pages through the matches with a stable order and the real total", async () => {
    const first = await page(`q=${tag}&limit=2`);
    expect(first.total).toBe(6);
    expect(first.items.map((f: any) => f.name)).toEqual([`${tag} Alpha`, `${tag} Bravo`]);
    expect(first.items[0]).toMatchObject({ id: made[0].id, clubName: `${tag} Club`, nameKhmer: "គុន", currentWeight: 54 });
    const second = await page(`q=${tag}&limit=2&offset=2`);
    expect(second.items.map((f: any) => f.name)).toEqual([`${tag} Charlie`, `${tag} Delta`]);
    const last = await page(`q=${tag}&limit=2&offset=4`);
    expect(last.items.map((f: any) => f.name)).toEqual([`${tag} Draftee`, `${tag} Echo`]);
    expect((await page(`q=${tag}&limit=2&offset=6`)).items).toEqual([]);
    expect((await page("limit=1000")).items.length).toBeLessThanOrEqual(100);
  });

  it("searches name, Khmer name and club in any case", async () => {
    expect((await page(`q=${tag.toLowerCase()} ALPHA`)).total).toBe(1);
    expect((await page(`q=${tag.toLowerCase()}`)).total).toBe(6);
    expect((await page(`q=${encodeURIComponent(`${tag} Club`.toUpperCase())}`)).total).toBe(2); // by club name
    expect((await page(`q=${tag}&origin=local`)).total).toBe(4);
  });

  it("filters by origin, club, status, weight class and sorts by weight", async () => {
    const foreign = await page(`q=${tag}&origin=foreign`);
    expect(foreign.items.map((f: any) => f.name)).toEqual([`${tag} Charlie`, `${tag} Echo`]);
    const club = await page(`q=${tag}&clubId=${clubId}`);
    expect(club.items.map((f: any) => f.name)).toEqual([`${tag} Alpha`, `${tag} Charlie`]);
    expect((await page(`q=${tag}&clubId=none`)).total).toBe(3);
    expect((await page(`q=${tag}&status=Injured`)).items.map((f: any) => f.name)).toEqual([`${tag} Bravo`]);
    expect((await page(`q=${tag}&status=Draft`)).items.map((f: any) => f.name)).toEqual([`${tag} Draftee`]);
    const byWeight = await page(`q=${tag}&sort=weight`);
    expect(byWeight.items.map((f: any) => f.currentWeight)).toEqual([50, 54, 57, 60, 63.5, 67]);
  });

  it("puts a fighter in the first weight class that fits, like the screen", async () => {
    const classes = (await get("/settings/weight-classes")).body.data as any[];
    const classFor = (kg: number) => classes.find((c) => (c.min_kg == null || kg >= c.min_kg) && (c.max_kg == null || kg <= c.max_kg))?.id;
    const every = await all("sort=name");
    for (const c of classes.slice(0, 4)) {
      const expected = every.filter((f) => classFor(f.currentWeight) === c.id).map((f) => f.id);
      const got = (await all(`classId=${c.id}`)).map((f) => f.id);
      expect(got.sort()).toEqual(expected.sort());
    }
  });

  it("tells the club and status choices from every fighter, not just the page", async () => {
    const p = await page(`q=${tag}&limit=1`);
    expect(p.clubs.map((c: any) => c.id)).toContain(clubId);
    expect(p.noClub).toBe(true);
    expect(p.statuses).toEqual(expect.arrayContaining(["Active", "Injured", "Draft"]));
    expect(p.clubs.every((c: any) => c.name)).toBe(true);
  });

  it("answers an empty page for ids that are not valid", async () => {
    for (const q of ["clubId=nope", "classId=nope", "classId=00000000-0000-4000-8000-000000000000"]) {
      const p = await page(q);
      expect(p.items).toEqual([]);
      expect(p.total).toBe(0);
      expect(p.clubs).toBeDefined();
    }
  });

  it("does not show deleted fighters", async () => {
    const id = await fighter(a.admin.token, { name: `${tag} Zulu`, currentWeight: 70 });
    expect((await page(`q=${tag} Zulu`)).total).toBe(1);
    await api_del(id);
    expect((await page(`q=${tag} Zulu`)).total).toBe(0);
  });
});

async function api_del(id: string) {
  const { del } = await import("./helpers");
  await del(`/fighters/${id}`, a.admin.token);
}
