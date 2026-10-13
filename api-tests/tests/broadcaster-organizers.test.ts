/**
 * Broadcaster = Organizer accounts (Program workflow phase 3): an Organizer
 * belongs to a broadcast station and only sees that station's fight nights
 * (plus the ones it organizes); an event's organizer and broadcaster agree.
 */
import { beforeAll, describe, expect, it } from "vitest";
import { type Actor, type Actors, get, login, post, put, randomPassword, setupActors, uniq } from "./helpers";

let a: Actors;
let stationA: string;
let stationB: string;
let orgA1: Actor;
let orgA2: Actor;
let orgB: Actor;

const newStation = async () =>
  (await post("/settings/broadcast-stations", { name: `Station ${uniq()}` }, a.admin.token)).body.data.id as string;

async function newOrganizer(stationId: string | null): Promise<Actor> {
  const username = `org_${uniq()}`;
  const password = randomPassword();
  const res = await post(
    "/users",
    { username, password, fullName: "Station Organizer", email: `${username}@test.local`, role: "Organizer", broadcastStationId: stationId },
    a.admin.token,
  );
  if (res.status !== 201) throw new Error(`organizer setup failed: ${JSON.stringify(res.body)}`);
  return { id: res.body.data.id, username, password, token: await login(username, password), clubId: null };
}

const newEvent = async (body: Record<string, unknown> = {}) =>
  (await post("/events", { name: `Night ${uniq()}`, date: "2026-12-01", location: "Phnom Penh", status: "Draft", ...body }, a.admin.token)).body
    .data as { id: string; organizer_id: string; broadcast_station_id: string | null };

async function newFighter(clubId: string) {
  const res = await post(
    "/fighters",
    { name: `Fighter ${uniq()}`, nameKhmer: "x", dateOfBirth: "2000-01-01", gender: "Male", currentWeight: 60, height: 170, clubId, grade: "B", image: "https://example.com/f.png", status: "Active" },
    a.admin.token,
  );
  return res.body.data.id as string;
}

/** A fight card with one bout on the given event, made by staff. */
async function cardWithBout(eventId: string) {
  const batch = (await post("/matches/batches", { eventId, name: `Card ${uniq()}`, weekNumber: 1, date: "2026-12-01", location: "PP" }, a.admin.token)).body.data;
  const otherClub = (await post("/clubs", { name: `Club ${uniq()}` }, a.admin.token)).body.data.id;
  const match = await post(
    "/matches",
    { subEventId: batch.id, fighterAId: await newFighter(a.clubId), fighterBId: await newFighter(otherClub), rounds: 5, roundTime: 180, knockdownLimit: 3, agreedWeight: 60, gloveSize: "10oz", gloveBrand: "Twins" },
    a.admin.token,
  );
  if (match.status !== 200) throw new Error(`match setup failed: ${JSON.stringify(match.body)}`);
  return { batchId: batch.id as string, matchId: match.body.data.id as string };
}

beforeAll(async () => {
  a = await setupActors();
  stationA = await newStation();
  stationB = await newStation();
  orgA1 = await newOrganizer(stationA);
  orgA2 = await newOrganizer(stationA);
  orgB = await newOrganizer(stationB);
});

describe("organizer accounts of a broadcaster", () => {
  it("links several Organizer accounts to one broadcaster", async () => {
    for (const org of [orgA1, orgA2]) {
      const me = await get("/users/me", org.token);
      expect(me.body.data.broadcastStationId).toBe(stationA);
    }
    const list = await get("/users", a.admin.token);
    const linked = list.body.data.filter((u: { broadcastStationId: string | null }) => u.broadcastStationId === stationA);
    expect(linked.map((u: { id: string }) => u.id).sort()).toEqual([orgA1.id, orgA2.id].sort());
  });

  it("rejects an unknown broadcaster", async () => {
    const res = await post(
      "/users",
      { username: `org_${uniq()}`, password: randomPassword(), fullName: "X", email: `${uniq()}@test.local`, role: "Organizer", broadcastStationId: "00000000-0000-4000-8000-000000000000" },
      a.admin.token,
    );
    expect(res.status).toBe(422);
    const bad = await put(`/users/${orgA2.id}`, { broadcastStationId: "not-a-uuid" }, a.admin.token);
    expect(bad.status).toBe(422);
  });

  it("ignores a broadcaster for other roles and drops it when the role changes", async () => {
    const username = `ref_${uniq()}`;
    const ref = await post(
      "/users",
      { username, password: randomPassword(), fullName: "Referee", email: `${username}@test.local`, role: "Referee", broadcastStationId: stationA },
      a.admin.token,
    );
    expect(ref.status).toBe(201);
    expect(ref.body.data.broadcastStationId).toBeNull();

    const moving = await newOrganizer(stationB);
    const changed = await put(`/users/${moving.id}`, { role: "KKF Officer" }, a.admin.token);
    expect(changed.status).toBe(200);
    expect(changed.body.data.broadcastStationId).toBeNull();
  });

  it("moves and clears an Organizer's broadcaster", async () => {
    const org = await newOrganizer(stationA);
    expect((await put(`/users/${org.id}`, { broadcastStationId: stationB }, a.admin.token)).body.data.broadcastStationId).toBe(stationB);
    // Another field alone keeps the link.
    expect((await put(`/users/${org.id}`, { fullName: "Renamed" }, a.admin.token)).body.data.broadcastStationId).toBe(stationB);
    expect((await put(`/users/${org.id}`, { broadcastStationId: "" }, a.admin.token)).body.data.broadcastStationId).toBeNull();
  });

  it("only lets a Super Admin set the link", async () => {
    const res = await put(`/users/${orgA2.id}`, { broadcastStationId: stationB }, a.officer.token);
    expect(res.status).toBe(403);
  });
});

describe("what an Organizer sees", () => {
  let eventA: string;
  let eventB: string;
  let eventNone: string;
  let cardA: { batchId: string; matchId: string };
  let cardB: { batchId: string; matchId: string };

  beforeAll(async () => {
    eventA = (await newEvent({ broadcastStationId: stationA })).id;
    eventB = (await newEvent({ broadcastStationId: stationB })).id;
    eventNone = (await newEvent()).id;
    cardA = await cardWithBout(eventA);
    cardB = await cardWithBout(eventB);
  });

  const ids = (rows: { id: string }[]) => rows.map((r) => r.id);

  it("lists only its broadcaster's fight nights, drafts included", async () => {
    for (const org of [orgA1, orgA2]) {
      const list = ids((await get("/events", org.token)).body.data);
      expect(list).toContain(eventA);
      expect(list).not.toContain(eventB);
      expect(list).not.toContain(eventNone);
    }
    const listB = ids((await get("/events", orgB.token)).body.data);
    expect(listB).toContain(eventB);
    expect(listB).not.toContain(eventA);
  });

  it("gets 404 for another broadcaster's fight night, card and bout", async () => {
    expect((await get(`/events/${eventA}`, orgA1.token)).status).toBe(200);
    expect((await get(`/events/${eventB}`, orgA1.token)).status).toBe(404);
    expect((await get(`/matches/batches/${cardA.batchId}`, orgA1.token)).status).toBe(200);
    expect((await get(`/matches/batches/${cardB.batchId}`, orgA1.token)).status).toBe(404);
    expect((await get(`/matches/${cardA.matchId}`, orgA1.token)).status).toBe(200);
    expect((await get(`/matches/${cardB.matchId}`, orgA1.token)).status).toBe(404);
  });

  it("lists only its broadcaster's fight cards and bouts", async () => {
    const batches = ids((await get("/matches/batches", orgA1.token)).body.data);
    expect(batches).toContain(cardA.batchId);
    expect(batches).not.toContain(cardB.batchId);
    const matches = ids((await get("/matches", orgA1.token)).body.data);
    expect(matches).toContain(cardA.matchId);
    expect(matches).not.toContain(cardB.matchId);
  });

  it("still sees events it organizes, and staff still see everything", async () => {
    const own = (await newEvent()).id;
    await put(`/events/${own}`, { organizerId: a.organizer.id }, a.admin.token);
    expect(ids((await get("/events", a.organizer.token)).body.data)).toContain(own);
    expect(ids((await get("/events", a.organizer.token)).body.data)).not.toContain(eventA);

    const staff = ids((await get("/events", a.officer.token)).body.data);
    expect(staff).toEqual(expect.arrayContaining([eventA, eventB, eventNone]));
  });
});

describe("organizer and broadcaster agree", () => {
  it("rejects an Organizer of another broadcaster as the organizer", async () => {
    const ev = await newEvent({ broadcastStationId: stationA });
    const res = await put(`/events/${ev.id}`, { organizerId: orgB.id }, a.admin.token);
    expect(res.status).toBe(422);
    const ok = await put(`/events/${ev.id}`, { organizerId: orgA1.id }, a.admin.token);
    expect(ok.status).toBe(200);
    expect(ok.body.data.organizer_id).toBe(orgA1.id);
  });

  it("replaces the old broadcaster's Organizer when staff move or remove the broadcaster", async () => {
    const ev = await newEvent({ broadcastStationId: stationA });
    await put(`/events/${ev.id}`, { organizerId: orgA1.id }, a.admin.token);

    const moved = await put(`/events/${ev.id}`, { broadcastStationId: stationB }, a.officer.token);
    expect(moved.status).toBe(200);
    expect(moved.body.data.broadcast_station_id).toBe(stationB);
    expect(moved.body.data.organizer_id).toBe(a.officer.id);
    expect((await get(`/events/${ev.id}`, orgA1.token)).status).toBe(404);
    expect((await get(`/events/${ev.id}`, orgB.token)).status).toBe(200);

    await put(`/events/${ev.id}`, { organizerId: orgB.id }, a.admin.token);
    const removed = await put(`/events/${ev.id}`, { broadcastStationId: "" }, a.admin.token);
    expect(removed.status).toBe(200);
    expect(removed.body.data.broadcast_station_id).toBeNull();
    expect(removed.body.data.organizer_id).toBe(a.admin.id);
  });

  it("gives an Organizer's new event its own broadcaster, which it cannot change", async () => {
    const created = await post("/events", { name: `Own ${uniq()}`, date: "2026-12-05", location: "PP", broadcastStationId: stationB }, orgA1.token);
    expect(created.status).toBe(201);
    expect(created.body.data.broadcast_station_id).toBe(stationA);
    const moved = await put(`/events/${created.body.data.id}`, { broadcastStationId: stationB }, orgA1.token);
    expect(moved.status).toBe(403);
  });
});
