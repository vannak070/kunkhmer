/** Admin header search (claude/updates/admin-header-search.md). */
import { beforeAll, describe, expect, it } from "vitest";
import { type Actors, del, get, post, setupActors, shape, uniq } from "./helpers";

let a: Actors;
const tag = `Sx${uniq()}`;
let fighterId: string, clubId: string, eventId: string;

const search = async (q: string, token = a.admin.token) => (await get(`/search?q=${encodeURIComponent(q)}`, token)).body.data;

beforeAll(async () => {
  a = await setupActors();
  clubId = (await post("/clubs", { name: `${tag} Gym`, nameKhmer: `ក្លឹប ${tag}`, location: `${tag}ville` }, a.admin.token)).body.data.id;
  fighterId = (await post("/fighters", { name: `${tag} Sok`, nameKhmer: `សុខ ${uniq()}`, alias: `${tag}Tiger`, dateOfBirth: "2000-01-01", gender: "Male", currentWeight: 60, height: 170, grade: "B", clubId }, a.admin.token)).body.data.id;
  eventId = (await post("/events", { name: `${tag} Night`, date: "2035-03-03", location: `${tag} Arena`, status: "Draft" }, a.admin.token)).body.data.id;
});

describe("search", () => {
  it("needs a signed-in user", async () => {
    expect((await get("/search?q=a")).status).toBe(401);
  });

  it("finds fighters, clubs and events in any case", async () => {
    const r = await search(tag.toUpperCase());
    expect(r.fighters.map((f: any) => f.id)).toEqual([fighterId]);
    expect(r.clubs.map((c: any) => c.id)).toEqual([clubId]);
    expect(r.events.map((e: any) => e.id)).toEqual([eventId]);
    expect(r.fighters[0]).toMatchObject({ name: `${tag} Sok`, nameKhmer: expect.stringContaining("សុខ"), clubName: `${tag} Gym`, status: "Active" });
    expect(shape({ fighter: r.fighters[0], club: r.clubs[0], event: r.events[0] })).toMatchSnapshot();
  });

  it("matches the alias, the club name, the Khmer name and the place", async () => {
    expect((await search(`${tag}tiger`)).fighters.map((f: any) => f.id)).toEqual([fighterId]);
    expect((await search(`${tag} gym`)).fighters.map((f: any) => f.id)).toEqual([fighterId]); // a fighter is found by club name
    expect((await search("សុខ")).fighters.map((f: any) => f.id)).toContain(fighterId);
    expect((await search(`${tag}ville`)).clubs.map((c: any) => c.id)).toEqual([clubId]);
    expect((await search(`${tag} arena`)).events.map((e: any) => e.id)).toEqual([eventId]);
  });

  it("returns at most 8 of each, and nothing for an empty term", async () => {
    const empty = await search("   ");
    expect(empty).toEqual({ fighters: [], clubs: [], events: [] });
    const many = await search("a");
    for (const list of [many.fighters, many.clubs, many.events]) expect(list.length).toBeLessThanOrEqual(8);
  });

  it("leaves out deleted fighters and an Organizer's other events", async () => {
    expect((await search(tag, a.organizer.token)).events).toEqual([]); // another organizer's event
    await del(`/fighters/${fighterId}`, a.admin.token);
    expect((await search(tag)).fighters).toEqual([]);
  });
});
