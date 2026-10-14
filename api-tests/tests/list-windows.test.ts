/** Date windows and per-fighter / per-club filters on the list endpoints (claude/updates/admin-performance.md). */
import { beforeAll, describe, expect, it } from "vitest";
import { type Actors, get, post, setupActors, uniq } from "./helpers";

let a: Actors;
// Dates far from every other test file.
const EARLY = "2033-03-05";
const LATE = "2033-09-10";
const rules = { rounds: 3, roundTime: 3, knockdownLimit: 3, gloveSize: "10oz", gloveBrand: "Boon" };
const venue = `Window ${uniq()}`;

let early: any, late: any, earlyCard: string, lateCard: string;
let fighterA: string, fighterB: string, fighterC: string, fighterD: string, clubId: string;

const fighter = async (club?: string) =>
  (await post("/fighters", { name: `Window Fighter ${uniq()}`, nameKhmer: "គុន", dateOfBirth: "2000-01-01", gender: "Male", currentWeight: 60, height: 170, grade: "B", ...(club ? { clubId: club } : {}) }, a.admin.token)).body.data.id as string;
const event = async (name: string, date: string) => (await post("/events", { name: `${name} ${uniq()}`, date, location: venue, status: "Draft" }, a.admin.token)).body.data;
const card = async (eventId: string, date: string) => (await post("/matches/batches", { eventId, name: "Card", weekNumber: 1, date, location: "Studio A" }, a.admin.token)).body.data.id as string;
const bout = async (subEventId: string, x: string, y: string) => {
  const res = await post("/matches", { subEventId, fighterAId: x, fighterBId: y, agreedWeight: 60, ...rules }, a.admin.token);
  if (!res.body.success) throw new Error(JSON.stringify(res.body));
  return res.body.data.id as string;
};
const ids = (res: any) => (res.body.data as any[]).map((r) => r.id);

beforeAll(async () => {
  a = await setupActors();
  clubId = (await post("/clubs", { name: `Window Club ${uniq()}` }, a.admin.token)).body.data.id;
  [fighterA, fighterB, fighterC, fighterD] = [await fighter(clubId), await fighter(), await fighter(), await fighter()];
  early = await event("Early", EARLY);
  late = await event("Late", LATE);
  earlyCard = await card(early.id, EARLY);
  lateCard = await card(late.id, LATE);
});

describe("list windows", () => {
  it("filters events and fight cards by date", async () => {
    const all = await get("/events", a.admin.token);
    expect(ids(all)).toEqual(expect.arrayContaining([early.id, late.id]));
    const from = await get("/events?from=2033-06-01", a.admin.token);
    expect(ids(from)).toContain(late.id);
    expect(ids(from)).not.toContain(early.id);
    const to = await get("/events?to=2033-06-01", a.admin.token);
    expect(ids(to)).toContain(early.id);
    expect(ids(to)).not.toContain(late.id);
    const both = await get(`/events?from=${EARLY}&to=${EARLY}`, a.admin.token);
    expect(ids(both)).toContain(early.id);
    expect(ids(both)).not.toContain(late.id);
    const cards = await get("/matches/batches?from=2033-06-01", a.admin.token);
    expect(ids(cards)).toContain(lateCard);
    expect(ids(cards)).not.toContain(earlyCard);
  });

  it("rejects a date it cannot read", async () => {
    const res = await get("/events?from=nonsense", a.admin.token);
    expect(res.status).toBe(422);
  });

  it("filters bouts by date, fighter and club", async () => {
    const m1 = await bout(earlyCard, fighterA, fighterB);
    const m2 = await bout(lateCard, fighterC, fighterD);
    const m3 = await bout(lateCard, fighterB, await fighter());

    const recent = await get("/matches?from=2033-06-01", a.admin.token);
    expect(ids(recent)).toEqual(expect.arrayContaining([m2, m3]));
    expect(ids(recent)).not.toContain(m1);

    const ofB = await get(`/matches?fighterId=${fighterB}`, a.admin.token);
    expect(ids(ofB).sort()).toEqual([m1, m3].sort());

    const ofClub = await get(`/matches?clubId=${clubId}`, a.admin.token);
    expect(ids(ofClub)).toEqual([m1]);

    const both = await get(`/matches?fighterId=${fighterB}&from=2033-06-01`, a.admin.token);
    expect(ids(both)).toEqual([m3]);
  });

  it("answers with an empty list for ids that are not valid or not found", async () => {
    for (const q of ["fighterId=nope", "clubId=nope", "championshipId=nope", "championshipId=00000000-0000-4000-8000-000000000000"]) {
      const res = await get(`/matches?${q}`, a.admin.token);
      expect(res.status).toBe(200);
      expect(res.body.data).toEqual([]);
    }
  });

  it("keeps the public list public-only", async () => {
    const res = await get(`/matches?fighterId=${fighterB}`);
    expect(res.status).toBe(200);
    expect(ids(res)).toEqual([]); // Draft matches are not public
  });
});
