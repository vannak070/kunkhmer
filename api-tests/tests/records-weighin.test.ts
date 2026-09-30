import { beforeAll, describe, expect, it } from "vitest";
import { type Actors, get, post, put, setupActors, shapeOf, uniq } from "./helpers";

// Fighter records = career before this system + results recorded here, and the weigh-in saved on the bout
// (claude/updates/program-officer-friendly.md).
let a: Actors;
let cardId: string;

beforeAll(async () => {
  a = await setupActors();
  const event = (await post("/events", { name: `Records Event ${uniq()}`, date: "2026-11-20", location: "Arena" }, a.admin.token)).body.data;
  cardId = (await post("/matches/batches", { eventId: event.id, name: "Main card", weekNumber: 1, date: "2026-11-20", location: "Arena" }, a.admin.token)).body.data.id;
});

async function fighter(record?: string) {
  const res = await post(
    "/fighters",
    { name: `Rec ${uniq()}`, nameKhmer: "អ្នកប្រដាល់", dateOfBirth: "2000-01-01", currentWeight: 60, height: 170, clubId: a.clubId, ...(record === undefined ? {} : { record }) },
    a.officer.token,
  );
  if (res.status !== 201) throw new Error(`fighter setup failed: ${JSON.stringify(res.body)}`);
  return res.body.data;
}

async function bout(red: string, blue: string) {
  const res = await post(
    "/matches",
    { subEventId: cardId, fighterAId: red, fighterBId: blue, rounds: 5, roundTime: 3, knockdownLimit: 3, agreedWeight: 60, gloveSize: "10oz", gloveBrand: "Twins" },
    a.officer.token,
  );
  if (res.status !== 200) throw new Error(`bout setup failed: ${JSON.stringify(res.body)}`);
  return res.body.data;
}

const recordOf = async (id: string) => (await get(`/fighters/${id}`, a.officer.token)).body.data;

describe("fighter records: career + results recorded here", () => {
  it("adds a recorded result to the career record, and a correction adjusts it", async () => {
    const red = await fighter("10-3-1");
    const blue = await fighter();
    expect(red).toMatchObject({ record: "10-3-1", careerRecord: "10-3-1" });
    expect(blue).toMatchObject({ record: null, careerRecord: null });

    const m = await bout(red.id, blue.id);
    await post(`/matches/${m.id}/result`, { winnerId: red.id, method: "KO", round: 2 }, a.officer.token);
    expect(await recordOf(red.id)).toMatchObject({ record: "11-3-1", careerRecord: "10-3-1" });
    expect(await recordOf(blue.id)).toMatchObject({ record: "0-1-0" });

    // Corrected: the other corner won.
    await post(`/matches/${m.id}/result`, { winnerId: blue.id, method: "Decision", round: 5 }, a.officer.token);
    expect(await recordOf(red.id)).toMatchObject({ record: "10-4-1", careerRecord: "10-3-1" });
    expect(await recordOf(blue.id)).toMatchObject({ record: "1-0-0" });

    // A draw.
    await post(`/matches/${m.id}/result`, { winnerId: "", method: "Draw", round: 5 }, a.officer.token);
    expect(await recordOf(red.id)).toMatchObject({ record: "10-3-2" });
    expect(shapeOf(await get(`/fighters/${red.id}`, a.officer.token))).toMatchSnapshot();
  });

  it("editing the record keeps the results recorded here (no double counting)", async () => {
    const red = await fighter("5-0-0");
    const blue = await fighter("2-2-0");
    const m = await bout(red.id, blue.id);
    await post(`/matches/${m.id}/result`, { winnerId: red.id, method: "KO", round: 1 }, a.officer.token);

    // Saving the form unchanged keeps everything as it is.
    let res = await put(`/fighters/${red.id}`, { record: "6-0-0" }, a.officer.token);
    expect(res.body.data).toMatchObject({ record: "6-0-0", careerRecord: "5-0-0" });

    // Correcting the total changes the career part.
    res = await put(`/fighters/${red.id}`, { record: "20-1-0" }, a.officer.token);
    expect(res.body.data).toMatchObject({ record: "20-1-0", careerRecord: "19-1-0" });

    // Can't go below the results recorded here, and the format is checked.
    expect((await put(`/fighters/${red.id}`, { record: "0-0-0" }, a.officer.token)).status).toBe(422);
    expect((await put(`/fighters/${red.id}`, { record: "ten wins" }, a.officer.token)).status).toBe(422);
    expect((await post("/fighters", { name: `Bad ${uniq()}`, nameKhmer: "x", dateOfBirth: "2000-01-01", currentWeight: 60, height: 170, record: "10/2/1" }, a.officer.token)).status).toBe(422);
  });
});

describe("weigh-in on the bout", () => {
  it("saves each corner's weight on the bout without touching the profile weight", async () => {
    const red = await fighter();
    const blue = await fighter();
    const m = await bout(red.id, blue.id);
    expect(m).toMatchObject({ weigh_in_a_kg: null, weigh_in_b_kg: null, weigh_in_at: null, fighter_a_confirmed: false });

    let res = await post(`/matches/${m.id}/weigh-in`, { a: 60.4 }, a.officer.token);
    expect(res.status).toBe(200);
    expect(res.body.data).toMatchObject({ weigh_in_a_kg: 60.4, weigh_in_b_kg: null, fighter_a_confirmed: true, fighter_b_confirmed: false, weigh_in_by: a.officer.id });
    expect(res.body.data.weigh_in_at).toMatch(/Z$/);
    expect(shapeOf(res)).toMatchSnapshot();

    res = await post(`/matches/${m.id}/weigh-in`, { b: 61.25 }, a.officer.token);
    expect(res.body.data).toMatchObject({ weigh_in_a_kg: 60.4, weigh_in_b_kg: 61.25, fighter_b_confirmed: true });
    expect((await recordOf(red.id)).currentWeight).toBe(60);

    // Clearing a side.
    res = await post(`/matches/${m.id}/weigh-in`, { a: null }, a.officer.token);
    expect(res.body.data).toMatchObject({ weigh_in_a_kg: null, fighter_a_confirmed: false, weigh_in_b_kg: 61.25 });
  });

  it("checks the weight and is for KKF staff only", async () => {
    const m = await bout((await fighter()).id, (await fighter()).id);
    expect((await post(`/matches/${m.id}/weigh-in`, { a: 10 }, a.officer.token)).status).toBe(422);
    expect((await post(`/matches/${m.id}/weigh-in`, { a: "heavy" }, a.officer.token)).status).toBe(422);
    expect((await post(`/matches/${m.id}/weigh-in`, {}, a.officer.token)).status).toBe(422);
    for (const who of ["organizer", "club", "referee"] as const) {
      expect((await post(`/matches/${m.id}/weigh-in`, { a: 60 }, a[who].token)).status).toBe(403);
    }
    expect((await post(`/matches/${m.id}/weigh-in`, { a: 60 }, "")).status).toBe(401);
    expect((await post("/matches/00000000-0000-4000-8000-000000000000/weigh-in", { a: 60 }, a.officer.token)).status).toBe(404);
  });
});
