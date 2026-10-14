/** Weekly checks before the week's program sheets are signed (claude/updates/weekly-checks.md). */
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { type Actors, get, post, put, setupActors, shapeOf, uniq } from "./helpers";

let a: Actors;
// A week far away so no other test file puts matches in it.
const FROM = "2032-05-03";
const SAT = "2032-05-08";
const SUN = "2032-05-09";

beforeAll(async () => {
  a = await setupActors();
  // A fighter's second bout in the week must be possible to create here, so the rest-days and booking rules warn only.
  await put("/matches/rules/rest_days", { action: "warn" }, a.officer.token);
  await put("/matches/rules/already_booked", { action: "warn" }, a.officer.token);
});
afterAll(async () => {
  await put("/matches/rules/rest_days", { action: "block" }, a.officer.token);
  await put("/matches/rules/already_booked", { action: "block" }, a.officer.token);
});

const fighter = async (kg = 60) =>
  (await post("/fighters", { name: `Week Fighter ${uniq()}`, nameKhmer: "គុន", dateOfBirth: "2000-01-01", gender: "Male", currentWeight: kg, height: 170, grade: "B" }, a.admin.token)).body.data.id as string;
// One venue per run, so clashes with earlier runs' matches in the same week don't show up here.
const venue = `Studio ${uniq()}`;
const event = async (body: Record<string, unknown>) => (await post("/events", { location: venue, ...body, name: `${body.name} ${uniq()}` }, a.admin.token)).body.data;
const card = async (eventId: string, date: string) => (await post("/matches/batches", { eventId, name: "Card", weekNumber: 1, date, location: "Studio A" }, a.admin.token)).body.data.id as string;
const rules = { rounds: 3, roundTime: 3, knockdownLimit: 3, gloveSize: "10oz", gloveBrand: "Boon" };
const checks = async (token = a.officer.token) => (await get(`/events/week-checks?from=${FROM}`, token)).body.data;

describe("weekly checks", () => {
  it("finds clashes, double bookings, weight problems, empty corners and unfinished matches", async () => {
    const station = (await post("/settings/broadcast-stations", { name: `Station ${uniq()}` }, a.admin.token)).body.data.id;
    const e1 = await event({ name: "Show One", date: SAT, startTime: "15:00", broadcastStationId: station, status: "Published" });
    const e2 = await event({ name: "Show Two", date: SAT, startTime: "16:30", broadcastStationId: station, status: "Published" });
    const e3 = await event({ name: "Show Three", date: SUN, status: "Draft" });
    const c1 = await card(e1.id, SAT);
    const c2 = await card(e2.id, SAT);

    const twice = await fighter();
    await post("/matches", { subEventId: c1, fighterAId: twice, fighterBId: await fighter(), agreedWeight: 60, ...rules }, a.admin.token);
    await post("/matches", { subEventId: c2, fighterAId: twice, fighterBId: await fighter(), agreedWeight: 60, ...rules }, a.admin.token);
    const light = await fighter(60);
    const heavy = await post("/matches", { subEventId: c2, fighterAId: light, fighterBId: await fighter(70), agreedWeight: 70, ...rules }, a.admin.token);
    await post(`/matches/${heavy.body.data.id}/weigh-in`, { b: 72 }, a.officer.token);
    await post("/matches", { subEventId: c1, fighterAId: await fighter(), agreedWeight: 60, ...rules }, a.admin.token);

    // A draw: winners fight again on the same card — not a double booking.
    const draw = [await fighter(), await fighter(), await fighter(), await fighter()];
    const bouts = (await post(`/matches/batches/${c1}/draw`, { fighterIds: draw, agreedWeight: 60, ...rules }, a.admin.token)).body.data.bouts;
    await post(`/matches/${bouts[0].id}/result`, { winnerId: draw[0], method: "Decision", round: 3 }, a.officer.token);

    const res = await get(`/events/week-checks?from=${FROM}`, a.officer.token);
    expect(res.status).toBe(200);
    const data = res.body.data;
    expect(data).toMatchObject({ from: FROM, to: "2032-05-09" });
    // Only this run's matches (the test database keeps earlier runs' matches in the same week).
    const mine = new Set([e1.id, e2.id, e3.id]);
    const ours = (c: any) => (c.params.event_ids ?? [c.event_id]).every((id: string) => mine.has(id));
    const of = (kind: string) => data.checks.filter((c: any) => c.kind === kind && ours(c));

    expect(of("double_booked").map((c: any) => c.fighter_id)).toEqual([twice]);
    expect(of("double_booked")[0]).toMatchObject({ level: "problem", params: { events: [e1.name, e2.name] } });
    expect(of("broadcaster_clash")).toHaveLength(1);
    expect(of("broadcaster_clash")[0].params).toMatchObject({ times: ["15:00", "16:30"], date: SAT });
    expect(of("venue_clash")).toHaveLength(1);
    expect(of("over_weight")[0]).toMatchObject({ level: "problem", params: { kg: 72, agreed: 70 } });
    expect(of("weight_gap").map((c: any) => c.fighter_id)).toContain(light);
    expect(of("empty_corner").length).toBeGreaterThanOrEqual(2); // the TBA bout and the draw final's open corner
    expect(of("no_officials").map((c: any) => c.event_id).sort()).toEqual([e1.id, e2.id].sort());
    for (const kind of ["no_time", "not_published", "no_bouts"]) expect(of(kind).map((c: any) => c.event_id)).toEqual([e3.id]);
    // Problems come first.
    const levels = data.checks.map((c: any) => c.level);
    expect(levels.indexOf("warning")).toBeGreaterThan(levels.lastIndexOf("problem"));
    expect(data.problems).toBe(data.checks.filter((c: any) => c.level === "problem").length);
    expect(shapeOf(res)).toMatchSnapshot();
  });

  it("validates the week and is for KKF staff and organizers only", async () => {
    expect((await get("/events/week-checks", a.officer.token)).status).toBe(422);
    expect((await get("/events/week-checks?from=soon", a.officer.token)).status).toBe(422);
    expect((await get(`/events/week-checks?from=${FROM}`, a.club.token)).status).toBe(403);
    expect((await get(`/events/week-checks?from=${FROM}`)).status).toBe(401);
    // An Organizer only sees its own matches: none in this week.
    expect((await checks(a.organizer.token)).matches).toBe(0);
  });
});
