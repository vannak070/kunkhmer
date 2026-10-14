/** One call for the dashboard and the header bell (claude/updates/admin-overview-endpoint.md). */
import { beforeAll, describe, expect, it } from "vitest";
import { type Actors, get, post, setupActors, shape, uniq } from "./helpers";

let a: Actors;
const FROM = "2034-01-01";
const rules = { rounds: 3, roundTime: 3, knockdownLimit: 3, gloveSize: "10oz", gloveBrand: "Boon" };
let eventId: string, cardId: string, fighters: string[], draft: string, rejected: string;

const fighter = async (extra: Record<string, unknown> = {}) =>
  (await post("/fighters", { name: `Overview Fighter ${uniq()}`, nameKhmer: "គុន", dateOfBirth: "2000-01-01", gender: "Male", currentWeight: 60, height: 170, grade: "B", ...extra }, a.admin.token)).body.data.id as string;
const ids = (rows: any[]) => rows.map((r) => r.id).sort();

beforeAll(async () => {
  a = await setupActors();
  eventId = (await post("/events", { name: `Overview ${uniq()}`, date: "2034-02-10", location: `Studio ${uniq()}`, status: "Draft" }, a.admin.token)).body.data.id;
  cardId = (await post("/matches/batches", { eventId, name: "Card", weekNumber: 1, date: "2034-02-10", location: "Studio A" }, a.admin.token)).body.data.id;
  fighters = [await fighter(), await fighter()];
  await post("/matches", { subEventId: cardId, fighterAId: fighters[0], fighterBId: fighters[1], agreedWeight: 60, ...rules }, a.admin.token);
  // A club registers fighters as Draft; one of them KKF sends back.
  const byClub = async () => (await post("/fighters", { name: `Overview Draft ${uniq()}`, nameKhmer: "គុន", dateOfBirth: "2000-01-01", gender: "Male", currentWeight: 60, height: 170, grade: "B" }, a.club.token)).body.data.id as string;
  draft = await byClub();
  rejected = await byClub();
  await post(`/fighters/${rejected}/reject`, { reason: "Photo missing" }, a.officer.token);
});

describe("overview", () => {
  it("needs a signed-in admin user, not an official", async () => {
    expect((await get(`/overview?from=${FROM}`)).status).toBe(401);
    expect((await get(`/overview?from=${FROM}`, a.referee.token)).status).toBe(403);
  });

  it("gives staff the same events, bouts, to-do fighters and numbers as the lists", async () => {
    const res = await get(`/overview?from=${FROM}`, a.officer.token);
    expect(res.status).toBe(200);
    const data = res.body.data;
    // Shapes of one of each row (the lists themselves vary with what other test files left behind).
    expect(shape({ keys: Object.keys(data).sort(), fighter: data.fighters.find((f: any) => f.id === draft), event: data.events.find((e: any) => e.id === eventId), match: data.matches.find((m: any) => m.event_id === eventId) })).toMatchSnapshot();

    const events = (await get(`/events?from=${FROM}`, a.officer.token)).body.data;
    const matches = (await get(`/matches?from=${FROM}`, a.officer.token)).body.data;
    expect(ids(data.events)).toEqual(ids(events));
    expect(ids(data.matches)).toEqual(ids(matches));
    const list = matches.find((m: any) => m.event_id === eventId);
    const mine = data.matches.find((m: any) => m.id === list.id);
    expect(mine).toMatchObject({ date: list.date, fighter_a_name: list.fighter_a_name, fighter_b_name: list.fighter_b_name, status: list.status, referee_id: null });
    expect(data.events.find((e: any) => e.id === eventId)).toMatchObject({ status: "Draft", date: events.find((e: any) => e.id === eventId).date });

    const all = (await get("/fighters", a.officer.token)).body.data as any[];
    expect(ids(data.fighters)).toEqual(ids(all.filter((f) => ["Draft", "Pending KKF Verification", "Pending"].includes(f.status))));
    expect(data.fighters.map((f: any) => f.id)).toContain(draft);
    expect(data.fighters.map((f: any) => f.id)).not.toContain(rejected);
    expect(data.active_fighters).toBe(all.filter((f) => f.status === "Active").length);
    expect(data.clubs).toBe((await get("/clubs")).body.data.length);

    const vacant = ((await get("/champions")).body.data as any[]).filter((c) => (c.status === "Vacant" || !c.current_holder_id) && (c.approval_status ?? "approved") === "approved");
    expect(ids(data.champions)).toEqual(ids(vacant));
    expect(ids(data.agreements_waiting)).toEqual(ids((await get("/agreements/waiting", a.officer.token)).body.data));
    expect(ids(data.open_disputes)).toEqual(ids((await get("/matches/disputes?status=open", a.officer.token)).body.data));
  });

  it("gives a club only its own sent-back fighters and no staff lists", async () => {
    const data = (await get(`/overview?from=${FROM}`, a.club.token)).body.data;
    expect(data.fighters.map((f: any) => f.id)).toEqual([rejected]);
    expect(data.fighters[0]).toMatchObject({ clubId: a.clubId, reviewNote: "Photo missing" });
    expect(data.champions).toEqual([]);
    expect(data.agreements_waiting).toEqual([]);
    expect(data.open_disputes).toEqual([]);
  });

  it("gives an Organizer only the events and bouts it may see", async () => {
    const res = await get(`/overview?from=${FROM}`, a.organizer.token);
    expect(res.status).toBe(200);
    const events = (await get(`/events?from=${FROM}`, a.organizer.token)).body.data;
    expect(ids(res.body.data.events)).toEqual(ids(events));
    expect(res.body.data.events.map((e: any) => e.id)).not.toContain(eventId); // another organizer's event
    expect(res.body.data.fighters).toEqual([]);
  });

  it("limits events and bouts to the window", async () => {
    const data = (await get("/overview?from=2034-06-01", a.officer.token)).body.data;
    expect(data.events.map((e: any) => e.id)).not.toContain(eventId);
    expect(data.matches.filter((m: any) => m.event_id === eventId)).toEqual([]);
  });
});
