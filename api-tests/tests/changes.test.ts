/**
 * Withdrawals, replacements, postponement and cancellation (Program workflow phase 6,
 * claude/updates/withdrawals-postponement.md).
 */
import { beforeAll, describe, expect, it } from "vitest";
import { type Actor, type Actors, get, login, post, put, randomPassword, setupActors, shapeOf, uniq } from "./helpers";

let a: Actors;
let station: string;
let org: Actor;
let otherOrg: Actor;
const future = (days: number) => new Date(Date.now() + days * 86_400_000).toISOString().slice(0, 10);

async function newOrganizer(stationId: string): Promise<Actor> {
  const username = `org_${uniq()}`;
  const password = randomPassword();
  const res = await post("/users", { username, password, fullName: "Station Organizer", email: `${username}@test.local`, role: "Organizer", broadcastStationId: stationId }, a.admin.token);
  return { id: res.body.data.id, username, password, token: await login(username, password), clubId: null };
}

const newFighter = async (extra: Record<string, unknown> = {}) =>
  (await post("/fighters", { name: `Fighter ${uniq()}`, nameKhmer: `x ${uniq()}`, dateOfBirth: "2000-01-01", gender: "Male", currentWeight: 60, height: 170, ...extra }, a.admin.token)).body.data.id as string;

const fighterOf = async (id: string) => (await get(`/fighters/${id}`, a.admin.token)).body.data;

/** A match of the test broadcaster `days` from today with one bout (two new fighters), made by KKF staff. */
async function newMatch(days = 30, status = "Draft") {
  const date = future(days);
  const event = (await post("/events", { name: `Match ${uniq()}`, date, location: "Phnom Penh", status, broadcastStationId: station }, a.officer.token)).body.data.id as string;
  const card = (await post("/matches/batches", { eventId: event, name: "Main card", weekNumber: 1, date, location: "Arena" }, a.admin.token)).body.data.id as string;
  const red = await newFighter();
  const blue = await newFighter();
  const bout = (await post("/matches", { subEventId: card, eventId: event, fighterAId: red, fighterBId: blue, rounds: 5, roundTime: 180, knockdownLimit: 3, agreedWeight: 60, gloveSize: "10oz", gloveBrand: "Twins" }, a.admin.token)).body.data.id as string;
  return { event, card, bout, red, blue, date };
}

beforeAll(async () => {
  a = await setupActors();
  station = (await post("/settings/broadcast-stations", { name: `Station ${uniq()}` }, a.admin.token)).body.data.id;
  const other = (await post("/settings/broadcast-stations", { name: `Station ${uniq()}` }, a.admin.token)).body.data.id;
  org = await newOrganizer(station);
  otherOrg = await newOrganizer(other);
});

describe("withdraw and replace", () => {
  it("keeps the bout, marks the corner, and takes no weigh-in or result until a replacement", async () => {
    const m = await newMatch();
    await post(`/matches/${m.bout}/weigh-in`, { a: 60, b: 60 }, a.officer.token);
    const res = await post(`/matches/${m.bout}/withdraw`, { side: "b", reason: "injured", note: "Hurt in training" }, a.officer.token);
    expect(res.status).toBe(200);
    expect(res.body.data).toMatchObject({ id: m.bout, replacement_side: "b", weigh_in_b_kg: null, fighter_b_confirmed: false, weigh_in_a_kg: 60 });
    expect(shapeOf(res)).toMatchSnapshot();

    expect((await post(`/matches/${m.bout}/weigh-in`, { b: 60 }, a.officer.token)).body.error).toMatch(/needs a replacement/);
    expect((await post(`/matches/${m.bout}/result`, { winnerId: m.red, method: "KO", round: 1 }, a.officer.token)).body.error).toMatch(/needs a replacement/);
    expect((await post(`/matches/${m.bout}/withdraw`, { side: "a", reason: "other" }, a.officer.token)).status).toBe(422);
    // The public no longer sees the bout, and the history says who and why.
    const history = (await get(`/events/${m.event}/changes`, a.officer.token)).body.data;
    expect(history[0]).toMatchObject({ kind: "withdraw", side: "b", reason: "injured", note: "Hurt in training", fighter_id: m.blue, by_name: expect.any(String) });
    expect(shapeOf({ status: 200, body: { data: history } } as any)).toMatchSnapshot();
  });

  it("validates the side and the reason, and optionally marks the fighter", async () => {
    const m = await newMatch();
    expect((await post(`/matches/${m.bout}/withdraw`, { side: "c", reason: "injured" }, a.officer.token)).status).toBe(422);
    expect((await post(`/matches/${m.bout}/withdraw`, { side: "a", reason: "tired" }, a.officer.token)).status).toBe(422);
    expect((await post(`/matches/${m.bout}/withdraw`, { side: "a" }, a.officer.token)).status).toBe(422);
    const res = await post(`/matches/${m.bout}/withdraw`, { side: "a", reason: "injured", markFighter: true }, a.officer.token);
    expect(res.status).toBe(200);
    expect((await fighterOf(m.red)).medicalStatus ?? (await get(`/fighters/${m.red}/private`, a.officer.token)).body.data.medicalStatus).toBe("Injured");
    expect((await get(`/events/${m.event}/changes`, a.officer.token)).body.data[0].marked_fighter).toBe(true);
    // The tick box does nothing for a reason that isn't medical.
    const n = await newMatch();
    await post(`/matches/${n.bout}/withdraw`, { side: "a", reason: "personal", markFighter: true }, a.officer.token);
    expect((await get(`/fighters/${n.red}/private`, a.officer.token)).body.data.medicalStatus).toBe("Cleared");
  });

  it("a replacement must pass the matching rules; then the bout is whole again", async () => {
    const m = await newMatch();
    await post(`/matches/${m.bout}/withdraw`, { side: "b", reason: "overweight" }, a.officer.token);
    const female = await newFighter({ gender: "Female" });
    const blocked = await post(`/matches/${m.bout}/replace`, { side: "b", fighterId: female }, a.officer.token);
    expect(blocked.status).toBe(422);
    expect(blocked.body.error).toMatch(/not the same gender/);
    expect((await post(`/matches/${m.bout}/replace`, { side: "b", fighterId: m.red }, a.officer.token)).status).toBe(422); // the other corner
    expect((await post(`/matches/${m.bout}/replace`, { side: "b", fighterId: m.blue }, a.officer.token)).status).toBe(422); // who withdrew
    expect((await post(`/matches/${m.bout}/replace`, { side: "a", fighterId: await newFighter() }, a.officer.token)).status).toBe(422); // that corner is fine

    const sub = await newFighter();
    const res = await post(`/matches/${m.bout}/replace`, { side: "b", fighterId: sub }, a.officer.token);
    expect(res.status).toBe(200);
    expect(res.body.data).toMatchObject({ fighter_b_id: sub, replacement_side: null });
    expect((await post(`/matches/${m.bout}/weigh-in`, { b: 60 }, a.officer.token)).status).toBe(200);
    const history = (await get(`/events/${m.event}/changes`, a.officer.token)).body.data.map((h: any) => h.kind);
    expect(history).toEqual(["replace", "withdraw"]);
  });

  it("cancels one bout with a reason; it can't be weighed or get a result, and nothing is withdrawn twice", async () => {
    const m = await newMatch();
    expect((await post(`/matches/${m.bout}/cancel`, {}, a.officer.token)).status).toBe(422);
    const res = await post(`/matches/${m.bout}/cancel`, { reason: "no_show", note: "Did not arrive" }, a.officer.token);
    expect(res.body.data).toMatchObject({ status: "Cancelled", replacement_side: null });
    expect((await post(`/matches/${m.bout}/weigh-in`, { a: 60 }, a.officer.token)).body.error).toMatch(/cancelled/);
    expect((await post(`/matches/${m.bout}/withdraw`, { side: "a", reason: "other" }, a.officer.token)).status).toBe(422);
    expect((await get(`/events/${m.event}/changes`, a.officer.token)).body.data[0]).toMatchObject({ kind: "cancel_bout", fighter_name: expect.stringContaining(" vs ") });
  });

  it("a bout with a result can't change; clubs can't; an Organizer only before match day", async () => {
    const m = await newMatch(30, "Published");
    expect((await post(`/matches/${m.bout}/withdraw`, { side: "a", reason: "other" }, a.club.token)).status).toBe(403);
    expect((await post(`/matches/${m.bout}/withdraw`, { side: "a", reason: "other" }, otherOrg.token)).status).toBe(404);
    const own = await post(`/matches/${m.bout}/withdraw`, { side: "a", reason: "personal" }, org.token);
    expect(own.status).toBe(200);
    expect((await get(`/events/${m.event}/changes`, org.token)).body.data[0].kind).toBe("withdraw");
    expect((await get(`/events/${m.event}/changes`, otherOrg.token)).status).toBe(404);

    const today = await newMatch(0);
    expect((await post(`/matches/${today.bout}/withdraw`, { side: "a", reason: "personal" }, org.token)).body.error).toMatch(/only KKF/);
    expect((await post(`/matches/${today.bout}/withdraw`, { side: "a", reason: "personal" }, a.officer.token)).status).toBe(200);

    const done = await newMatch(0);
    await post(`/matches/${done.bout}/result`, { winnerId: done.red, method: "KO", round: 1 }, a.officer.token);
    expect((await post(`/matches/${done.bout}/withdraw`, { side: "a", reason: "other" }, a.officer.token)).body.error).toMatch(/already has a result/);
  });
});

describe("postpone and cancel a match", () => {
  it("moves the date, keeps the bouts and cards, remembers the first date and shows it to fans", async () => {
    const m = await newMatch(30, "Published");
    const to = future(45);
    expect((await post(`/events/${m.event}/postpone`, { date: to }, a.officer.token)).status).toBe(422); // reason
    expect((await post(`/events/${m.event}/postpone`, { date: m.date, reason: "weather" }, a.officer.token)).status).toBe(422); // same date
    expect((await post(`/events/${m.event}/postpone`, { date: "2020-01-01", reason: "weather" }, a.officer.token)).status).toBe(422); // past
    const res = await post(`/events/${m.event}/postpone`, { date: to, reason: "weather", note: "Storm" }, a.officer.token);
    expect(res.status).toBe(200);
    expect(res.body.data.date.slice(0, 10)).toBe(to);
    expect(res.body.data.postponed_from.slice(0, 10)).toBe(m.date);
    expect(shapeOf(res)).toMatchSnapshot();
    const card = (await get(`/matches/batches/${m.card}`, a.officer.token)).body.data;
    expect(String(card.date).slice(0, 10)).toBe(to);
    expect((await get(`/matches?eventId=${m.event}`, a.officer.token)).body.data).toHaveLength(1);
    const publicEvent = (await get(`/events/${m.event}`)).body.data;
    expect(publicEvent.postponed_from.slice(0, 10)).toBe(m.date);
    expect(JSON.stringify(publicEvent)).not.toMatch(/Storm|weather/);
    // Postponing again keeps the very first date.
    await post(`/events/${m.event}/postpone`, { date: future(60), reason: "venue" }, a.officer.token);
    expect((await get(`/events/${m.event}`)).body.data.postponed_from.slice(0, 10)).toBe(m.date);
    const kinds = (await get(`/events/${m.event}/changes`, a.officer.token)).body.data.map((h: any) => h.kind);
    expect(kinds).toEqual(["postpone", "postpone"]);
  });

  it("re-checks every bout on the new date: a broken Block rule refuses it, and says which bout", async () => {
    // A fighter with a bout 30 days out can't also fight on a match moved to 35 days (21-day rest rule).
    const first = await newMatch(30);
    const second = await newMatch(60);
    const busy = (await get(`/matches/${second.bout}`, a.officer.token)).body.data.fighter_a_id as string;
    await put(`/matches/${first.bout}`, { fighterAId: busy }, a.officer.token); // may warn; the fighter now has two bouts 30 days apart
    const refused = await post(`/events/${second.event}/postpone`, { date: future(35), reason: "venue" }, a.officer.token);
    expect(refused.status).toBe(422);
    expect(refused.body.error).toMatch(/breaks KKF matching rules/);
    expect(refused.body.error).toMatch(/days apart/);
    // Nothing moved.
    expect((await get(`/events/${second.event}`, a.officer.token)).body.data.date.slice(0, 10)).toBe(second.date);
    expect((await get(`/events/${second.event}/changes`, a.officer.token)).body.data).toHaveLength(0);
  });

  it("cancels the match with a reason; an Organizer only before match day", async () => {
    const m = await newMatch(30);
    expect((await post(`/events/${m.event}/cancel`, {}, a.officer.token)).status).toBe(422);
    const res = await post(`/events/${m.event}/cancel`, { reason: "safety", note: "Hall unsafe" }, org.token);
    expect(res.status).toBe(200);
    expect(res.body.data.status).toBe("Cancelled");
    expect((await post(`/events/${m.event}/cancel`, { reason: "other" }, a.officer.token)).status).toBe(422); // already
    expect((await post(`/events/${m.event}/postpone`, { date: future(40), reason: "other" }, a.officer.token)).status).toBe(422);
    expect((await get(`/events/${m.event}/changes`, a.officer.token)).body.data[0]).toMatchObject({ kind: "cancel_event", reason: "safety", note: "Hall unsafe" });
    expect((await post(`/events/${(await newMatch(0)).event}/cancel`, { reason: "other" }, org.token)).body.error).toMatch(/only KKF/);
    expect((await post(`/events/${m.event}/cancel`, { reason: "other" }, a.club.token)).status).toBe(403);
  });
});
