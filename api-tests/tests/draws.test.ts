/** Empty corners ("to be announced" / "winner of bout N") and tournament draws (claude/updates/empty-corners-draws.md). */
import { beforeAll, describe, expect, it } from "vitest";
import { type Actors, del, get, post, setupActors, shapeOf, uniq } from "./helpers";

let a: Actors;
let eventId: string;
let otherEventCard: string;

beforeAll(async () => {
  a = await setupActors();
  eventId = (await post("/events", { name: `Draw Event ${uniq()}`, date: "2026-11-21", startTime: "19:00", location: "Phnom Penh", status: "Published" }, a.admin.token)).body.data.id;
  const other = (await post("/events", { name: `Other ${uniq()}`, date: "2026-11-22", location: "Phnom Penh", status: "Published" }, a.admin.token)).body.data.id;
  otherEventCard = (await post("/matches/batches", { eventId: other, name: "Card", weekNumber: 1, date: "2026-11-22", location: "Studio" }, a.admin.token)).body.data.id;
});

const fighter = async () =>
  (await post("/fighters", { name: `Draw Fighter ${uniq()}`, nameKhmer: "គុន", dateOfBirth: "2000-01-01", gender: "Male", currentWeight: 60, height: 170, grade: "B" }, a.admin.token)).body.data.id as string;
const card = async () => (await post("/matches/batches", { eventId, name: `Card ${uniq()}`, weekNumber: 1, date: "2026-11-21", location: "Studio" }, a.admin.token)).body.data.id as string;
const rules = { rounds: 3, roundTime: 3, knockdownLimit: 3, agreedWeight: 60, gloveSize: "10oz", gloveBrand: "Boon" };
const result = (id: string, winnerId: string) => post(`/matches/${id}/result`, { winnerId, method: "Decision", round: 3 }, a.officer.token);

describe("empty corners", () => {
  it("creates a bout with an empty corner, keeps it off the fan site, refuses a result and a weigh-in until the corner is filled", async () => {
    const c = await card();
    const red = await fighter();
    const res = await post("/matches", { subEventId: c, fighterAId: red, ...rules }, a.admin.token);
    expect(res.status).toBe(200);
    expect(res.body.data).toMatchObject({ fighter_a_id: red, fighter_b_id: null, fighter_b: null, fighter_b_name: null, slot_b_from: null });
    expect(shapeOf(res)).toMatchSnapshot("bout with an empty corner");
    const id = res.body.data.id;

    // Fans don't see it; staff do.
    expect((await get(`/matches?subEventId=${c}`)).body.data.map((m: any) => m.id)).not.toContain(id);
    expect((await get(`/matches?subEventId=${c}`, a.admin.token)).body.data.map((m: any) => m.id)).toContain(id);

    expect((await result(id, red)).status).toBe(422);
    expect((await post(`/matches/${id}/weigh-in`, { b: 60 }, a.officer.token)).status).toBe(422);
    expect((await post(`/matches/${id}/weigh-in`, { a: 60 }, a.officer.token)).status).toBe(200);
    expect((await post(`/matches/${id}/withdraw`, { side: "b", reason: "injured" }, a.officer.token)).status).toBe(422);

    // Filling the corner (recorded in the history as "fill"), then the bout works as usual.
    const blue = await fighter();
    const filled = await post(`/matches/${id}/replace`, { side: "b", fighterId: blue }, a.officer.token);
    expect(filled.status).toBe(200);
    expect(filled.body.data.fighter_b_id).toBe(blue);
    const history = (await get(`/events/${eventId}/changes`, a.officer.token)).body.data as any[];
    expect(history.find((h) => h.match_id === id)).toMatchObject({ kind: "fill", side: "b", other_name: null });
    expect((await result(id, blue)).status).toBe(200);
  });

  it("allows a bout with both corners empty, and checks where a corner's winner comes from", async () => {
    const c = await card();
    const source = (await post("/matches", { subEventId: c, fighterAId: await fighter(), fighterBId: await fighter(), ...rules }, a.admin.token)).body.data;
    const elsewhere = (await post("/matches", { subEventId: otherEventCard, fighterAId: await fighter(), fighterBId: await fighter(), ...rules }, a.admin.token)).body.data;

    const both = await post("/matches", { subEventId: c, slotAFrom: source.id, ...rules }, a.admin.token);
    expect(both.status).toBe(200);
    expect(both.body.data).toMatchObject({ fighter_a_id: null, fighter_b_id: null, slot_a_from: source.id });

    expect((await post("/matches", { subEventId: c, slotAFrom: elsewhere.id, ...rules }, a.admin.token)).status).toBe(422);
    expect((await post("/matches", { subEventId: c, fighterAId: await fighter(), slotAFrom: source.id, ...rules }, a.admin.token)).status).toBe(422);
    expect((await post("/matches", { subEventId: c, slotAFrom: source.id, slotBFrom: source.id, ...rules }, a.admin.token)).status).toBe(422);

    // The source bout's winner moves into the corner.
    await result(source.id, source.fighter_b_id);
    expect((await get(`/matches/${both.body.data.id}`, a.admin.token)).body.data.fighter_a_id).toBe(source.fighter_b_id);
  });
});

describe("tournament draws", () => {
  it("builds qualifiers and a final from 4 fighters, and moves the winners on (also after a corrected result)", async () => {
    const c = await card();
    const f = [await fighter(), await fighter(), await fighter(), await fighter()];
    const res = await post(`/matches/batches/${c}/draw`, { fighterIds: f, ...rules, finalLabel: "prize" }, a.officer.token);
    expect(res.status).toBe(201);
    const [q1, q2, final] = res.body.data.bouts;
    expect(res.body.data.bouts).toHaveLength(3);
    expect(q1).toMatchObject({ fighter_a_id: f[0], fighter_b_id: f[1], bout_label: "qualifier", draw_id: res.body.data.draw_id });
    expect(q2).toMatchObject({ fighter_a_id: f[2], fighter_b_id: f[3], bout_label: "qualifier" });
    expect(final).toMatchObject({ fighter_a_id: null, fighter_b_id: null, slot_a_from: q1.id, slot_b_from: q2.id, bout_label: "prize" });
    expect(final.sort_order).toBeGreaterThan(q2.sort_order);

    // Winners move into the final (the same night is fine for a draw).
    expect((await result(q1.id, f[0])).status).toBe(200);
    expect((await result(q2.id, f[3])).status).toBe(200);
    expect((await get(`/matches/${final.id}`, a.admin.token)).body.data).toMatchObject({ fighter_a_id: f[0], fighter_b_id: f[3] });

    // A corrected qualifier result moves the new winner in.
    expect((await result(q1.id, f[1])).status).toBe(200);
    expect((await get(`/matches/${final.id}`, a.admin.token)).body.data.fighter_a_id).toBe(f[1]);

    // The final now shows on the fan site and takes a result.
    expect((await get(`/matches?subEventId=${c}`)).body.data.map((m: any) => m.id)).toContain(final.id);
    expect((await result(final.id, f[3])).status).toBe(200);
  });

  it("builds three rounds from 8 fighters", async () => {
    const c = await card();
    const f: string[] = [];
    for (let i = 0; i < 8; i++) f.push(await fighter());
    const res = await post(`/matches/batches/${c}/draw`, { fighterIds: f, ...rules }, a.admin.token);
    expect(res.status).toBe(201);
    const bouts = res.body.data.bouts;
    expect(bouts).toHaveLength(7);
    expect(bouts.slice(0, 4).every((b: any) => b.fighter_a_id && b.fighter_b_id)).toBe(true);
    expect(bouts[4]).toMatchObject({ slot_a_from: bouts[0].id, slot_b_from: bouts[1].id, bout_label: "qualifier" });
    expect(bouts[6]).toMatchObject({ slot_a_from: bouts[4].id, slot_b_from: bouts[5].id, bout_label: "final" });
  });

  it("validates the draw and is for KKF staff and the match's organizer only", async () => {
    const c = await card();
    const f = [await fighter(), await fighter(), await fighter(), await fighter()];
    expect((await post(`/matches/batches/${c}/draw`, { fighterIds: f.slice(0, 3), ...rules }, a.admin.token)).status).toBe(422);
    expect((await post(`/matches/batches/${c}/draw`, { fighterIds: [f[0], f[0], f[1], f[2]], ...rules }, a.admin.token)).status).toBe(422);
    expect((await post(`/matches/batches/${c}/draw`, { fighterIds: f, ...rules, finalLabel: "bonus" }, a.admin.token)).status).toBe(422);
    expect((await post(`/matches/batches/${c}/draw`, { fighterIds: f, ...rules }, a.club.token)).status).toBe(403);
    expect((await post(`/matches/batches/${c}/draw`, { fighterIds: f, ...rules })).status).toBe(401);
  });

  it("deleting a qualifier leaves the final's corner waiting for nobody", async () => {
    const c = await card();
    const f = [await fighter(), await fighter(), await fighter(), await fighter()];
    const [q1, , final] = (await post(`/matches/batches/${c}/draw`, { fighterIds: f, ...rules }, a.admin.token)).body.data.bouts;
    expect((await del(`/matches/${q1.id}`, a.admin.token)).status).toBe(200);
    expect((await get(`/matches/${final.id}`, a.admin.token)).body.data.slot_a_from).toBeNull();
  });
});

describe("filling an empty corner", () => {
  it("a draw winner can be put into the next round by hand without the 'already booked' rule", async () => {
    const c = await card();
    const f = [await fighter(), await fighter(), await fighter(), await fighter()];
    const [q1, , final] = (await post(`/matches/batches/${c}/draw`, { fighterIds: f, ...rules }, a.admin.token)).body.data.bouts;
    const filled = await post(`/matches/${final.id}/replace`, { side: "a", fighterId: f[0] }, a.officer.token);
    expect(filled.status).toBe(200);
    // Someone not from that qualifier who already fights tonight is still blocked.
    const blocked = await post(`/matches/${final.id}/replace`, { side: "b", fighterId: f[1] }, a.officer.token);
    expect(blocked.status).toBe(422);
    expect(q1.fighter_b_id).toBe(f[1]);
  });
});
