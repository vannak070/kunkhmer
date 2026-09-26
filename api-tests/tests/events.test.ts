import { beforeAll, describe, expect, it } from "vitest";
import { type Actors, del, findById, get, post, put, setupActors, shape, shapeOf, uniq } from "./helpers";

let a: Actors;
let stationId: string;
let sponsorIds: string[];

beforeAll(async () => {
  a = await setupActors();
  stationId = (await post("/settings/broadcast-stations", { name: `Station ${uniq()}`, logoUrl: "https://example.com/s.png" }, a.admin.token)).body.data.id;
  sponsorIds = [
    (await post("/settings/sponsors", { name: `Sponsor ${uniq()}`, logoUrl: "https://example.com/a.png" }, a.admin.token)).body.data.id,
    (await post("/settings/sponsors", { name: `Sponsor ${uniq()}` }, a.admin.token)).body.data.id,
  ];
});

const fullEvent = () => ({
  name: `Event ${uniq()}`,
  date: "2026-11-01",
  endDate: "2026-11-29",
  location: "Olympic Stadium",
  status: "Draft",
  broadcastStationId: stationId,
  description: "Test event",
  image: "https://example.com/e.png",
  mainSponsorId: sponsorIds[0],
  sponsorIds,
  eventType: "multi-week",
  isTournament: true,
  tournamentFormat: "Single Elimination",
  tournamentWeightClass: "63.5",
  expectedParticipants: 16,
});

describe("events CRUD", () => {
  it("creates an event with sponsors and a broadcast station", async () => {
    const input = fullEvent();
    const res = await post("/events", input, a.organizer.token);
    expect(res.status).toBe(201);
    expect(res.body.data).toMatchObject({
      name: input.name,
      organizer_id: a.organizer.id,
      organizer_name: "Test Organizer",
      broadcast_station_id: stationId,
      main_sponsor_id: sponsorIds[0],
      eventType: "multi-week",
      isTournament: true,
      expectedParticipants: 16,
    });
    expect([...res.body.data.sponsorIds].sort()).toEqual([...sponsorIds].sort());
    expect(shapeOf(res)).toMatchSnapshot();
  });

  it("applies defaults for a minimal event", async () => {
    const res = await post("/events", { name: `Event ${uniq()}`, date: "2026-12-01", location: "Phnom Penh" }, a.officer.token);
    expect(res.status).toBe(201);
    expect(res.body.data).toMatchObject({ status: "Draft", eventType: "single-day", isTournament: false, expectedParticipants: 8, sponsorIds: [] });
    expect(shapeOf(res)).toMatchSnapshot();
  });

  it("lists and shows events publicly", async () => {
    const { body } = await post("/events", fullEvent(), a.organizer.token);
    const list = await get("/events");
    expect(list.status).toBe(200);
    expect(shape(findById(list, body.data.id))).toMatchSnapshot("list item");

    const shown = await get(`/events/${body.data.id}`);
    expect(shown.status).toBe(200);
    expect(shape(shown.body.data)).toEqual(shape(findById(list, body.data.id)));
  });

  it("updates fields and replaces sponsors", async () => {
    const input = fullEvent();
    const { body } = await post("/events", input, a.organizer.token);
    const res = await put(`/events/${body.data.id}`, { status: "Approved", sponsorIds: [sponsorIds[1]], isTournament: false }, a.officer.token);
    expect(res.status).toBe(200);
    expect(res.body.data).toMatchObject({ status: "Approved", sponsorIds: [sponsorIds[1]], isTournament: false, name: input.name });
    expect(shapeOf(res)).toMatchSnapshot();
  });

  it("deletes an event (Super Admin only)", async () => {
    const { body } = await post("/events", fullEvent(), a.organizer.token);
    expect((await del(`/events/${body.data.id}`, a.officer.token)).status).toBe(403);
    const res = await del(`/events/${body.data.id}`, a.admin.token);
    expect(shapeOf(res)).toMatchSnapshot();
    expect((await get(`/events/${body.data.id}`)).status).toBe(404);
  });

  it("returns 404 for unknown events", async () => {
    const missing = "00000000-0000-4000-8000-000000000000";
    const res = await get(`/events/${missing}`);
    expect(shapeOf(res)).toMatchSnapshot();
    expect((await put(`/events/${missing}`, { name: "x" }, a.admin.token)).status).toBe(404);
    expect((await del(`/events/${missing}`, a.admin.token)).status).toBe(404);
  });
});

describe("events permissions", () => {
  it.each(["club", "referee"] as const)("%s cannot create or update events", async (who) => {
    const { body } = await post("/events", fullEvent(), a.admin.token);
    const res = await post("/events", fullEvent(), a[who].token);
    expect(shapeOf(res)).toMatchSnapshot();
    expect((await put(`/events/${body.data.id}`, { name: "x" }, a[who].token)).status).toBe(403);
    expect((await del(`/events/${body.data.id}`, a[who].token)).status).toBe(403);
  });

  it("requires authentication for writes", async () => {
    expect((await post("/events", fullEvent())).status).toBe(401);
  });
});
