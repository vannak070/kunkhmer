/** Duplicate fighters list: pairs who may be the same person, "not the same person", and merging from the list (claude/features/duplicate-fighters-list.md). */
import { beforeAll, describe, expect, it } from "vitest";
import { type Actors, get, post, setupActors, shapeOf, uniq } from "./helpers";

let a: Actors;
beforeAll(async () => {
  a = await setupActors();
});

const fighter = async (extra: Record<string, unknown> = {}) =>
  (await post("/fighters", { name: `Twin ${uniq()}`, nameKhmer: `គូ ${uniq()}`, dateOfBirth: "1997-07-07", gender: "Male", currentWeight: 60, height: 170, grade: "B", status: "Active", ...extra }, a.admin.token)).body.data;

const list = async (show = "open", token = a.officer.token) => (await get(`/fighters/duplicates?show=${show}`, token)).body.data;
const pairOf = (data: any, x: string, y: string) => data.items.find((p: any) => p.fighters.some((f: any) => f.id === x) && p.fighters.some((f: any) => f.id === y));
const act = (what: "dismiss" | "restore", x: string, y: string, token = a.officer.token) => post(`/fighters/duplicates/${what}`, { fighterAId: x, fighterBId: y }, token);

describe("duplicates list", () => {
  it("lists the same English name and birth date as very likely, with the reasons and both records", async () => {
    const name = `Same Name ${uniq()}`;
    const first = await fighter({ name });
    const second = await fighter({ name, nameKhmer: `ផ្សេង ${uniq()}` });
    const data = await list();
    const pair = pairOf(data, first.id, second.id);
    expect(pair).toMatchObject({ tier: "very_likely", dismissed: false });
    expect(pair.reasons).toEqual(expect.arrayContaining(["same_name", "same_birth"]));
    // The record registered first comes first (the usual one to keep).
    expect(pair.fighters.map((f: any) => f.id)).toEqual([first.id, second.id]);
    expect(pair.fighters[0]).toMatchObject({ kkfId: first.kkfId, name, bouts: 0, hasIdNumber: false, nationality: "Cambodian" });
    expect(data.counts.open).toBeGreaterThanOrEqual(1);
    expect(data.counts.veryLikely).toBeGreaterThanOrEqual(1);
    expect(shapeOf({ status: 200, body: { data: { items: [pair], counts: data.counts } } })).toMatchSnapshot();
  });

  it("lists the same name with a different birth date, and the same Khmer name with a different birth date, as possible", async () => {
    const name = `Namesake ${uniq()}`;
    const one = await fighter({ name });
    const two = await fighter({ name, dateOfBirth: "1998-08-08" });
    const khmerName = `ឈ្មោះដូច ${uniq()}`;
    const three = await fighter({ nameKhmer: khmerName });
    const four = await fighter({ nameKhmer: khmerName, dateOfBirth: "1999-09-09" });
    const data = await list();
    expect(pairOf(data, one.id, two.id)).toMatchObject({ tier: "possible", reasons: ["same_name"] });
    expect(pairOf(data, three.id, four.id)).toMatchObject({ tier: "possible", reasons: ["same_khmer_name"] });
  });

  it("lists a similar name with the same birth date as possible, and no match for a similar name on another date", async () => {
    const stem = `Sovannara${uniq()}`;
    const one = await fighter({ name: `${stem} Dara` });
    const two = await fighter({ name: `${stem} Dora` });
    const other = await fighter({ name: `${stem} Dira`, dateOfBirth: "1990-01-01" });
    const data = await list();
    const pair = pairOf(data, one.id, two.id);
    expect(pair).toMatchObject({ tier: "possible" });
    expect(pair.reasons).toEqual(expect.arrayContaining(["similar_name", "same_birth"]));
    expect(pairOf(data, one.id, other.id)).toBeUndefined();
  });

  it("leaves out fighters who fought each other", async () => {
    const name = `Opponents ${uniq()}`;
    const red = await fighter({ name });
    const blue = await fighter({ name, nameKhmer: `ទល់ ${uniq()}` });
    expect(pairOf(await list(), red.id, blue.id)).toBeDefined();
    const date = "2029-03-10";
    const ev = (await post("/events", { name: `Dup Event ${uniq()}`, date, startTime: "19:00", location: "Phnom Penh", status: "Published" }, a.admin.token)).body.data.id;
    const card = (await post("/matches/batches", { eventId: ev, name: "Card", weekNumber: 1, date, location: "Studio" }, a.admin.token)).body.data.id;
    const made = await post("/matches", { subEventId: card, fighterAId: red.id, fighterBId: blue.id, rounds: 3, roundTime: 3, knockdownLimit: 3, agreedWeight: 60, gloveSize: "10oz", gloveBrand: "Boon" }, a.admin.token);
    expect(made.status).toBe(200);
    expect(pairOf(await list(), red.id, blue.id)).toBeUndefined();
  });

  it("remembers \"not the same person\" (either order), shows it under Dismissed, and can bring it back", async () => {
    const name = `Dismiss ${uniq()}`;
    const one = await fighter({ name });
    const two = await fighter({ name, nameKhmer: `មិនដូច ${uniq()}` });
    const before = (await list()).counts;
    expect((await act("dismiss", two.id, one.id)).body.data.dismissed).toBe(true);
    const open = await list();
    expect(pairOf(open, one.id, two.id)).toBeUndefined();
    expect(open.counts.open).toBe(before.open - 1);
    const dismissed = await list("dismissed");
    expect(pairOf(dismissed, one.id, two.id)).toMatchObject({ dismissed: true });
    expect(dismissed.counts.dismissed).toBe(before.dismissed + 1);
    // Dismissing again is harmless; restoring puts it back on the open list.
    expect((await act("dismiss", one.id, two.id)).status).toBe(200);
    expect((await act("restore", one.id, two.id)).body.data.dismissed).toBe(false);
    expect(pairOf(await list(), one.id, two.id)).toMatchObject({ dismissed: false });
    expect(pairOf(await list("dismissed"), one.id, two.id)).toBeUndefined();
  });

  it("drops a pair from the list once one record is merged into the other", async () => {
    const name = `Merged ${uniq()}`;
    const keep = await fighter({ name });
    const gone = await fighter({ name, nameKhmer: `បញ្ចូល ${uniq()}` });
    expect(pairOf(await list(), keep.id, gone.id)).toBeDefined();
    expect((await post(`/fighters/${gone.id}/merge`, { intoId: keep.id }, a.officer.token)).status).toBe(200);
    expect(pairOf(await list(), keep.id, gone.id)).toBeUndefined();
  });

  it("validates the pair when dismissing", async () => {
    const one = await fighter();
    const missing = "00000000-0000-4000-8000-000000000000";
    expect((await act("dismiss", one.id, one.id)).status).toBe(422);
    expect((await act("dismiss", one.id, "not-a-uuid")).status).toBe(422);
    expect((await act("dismiss", one.id, missing)).status).toBe(422);
  });

  it("is for KKF staff only", async () => {
    const one = await fighter();
    const two = await fighter();
    for (const who of ["organizer", "club", "referee"] as const) {
      expect((await get("/fighters/duplicates", a[who].token)).status).toBe(403);
      expect((await act("dismiss", one.id, two.id, a[who].token)).status).toBe(403);
      expect((await act("restore", one.id, two.id, a[who].token)).status).toBe(403);
    }
    expect((await get("/fighters/duplicates", a.admin.token)).status).toBe(200);
    expect((await get("/fighters/duplicates")).status).toBe(401);
  });
});
