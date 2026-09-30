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
    // Only published events are public (see "event approval" below).
    const { body } = await post("/events", { ...fullEvent(), status: "Published" }, a.admin.token);
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

describe("event approval", () => {
  it("organizer submits, KKF approves, organizer publishes; hidden from the public until then", async () => {
    const created = await post("/events", { ...fullEvent(), status: "Published" }, a.organizer.token);
    expect(created.body.data.status).toBe("Draft"); // organizers can't skip approval
    const id = created.body.data.id;
    expect((await get(`/events/${id}`)).status).toBe(404);
    expect((await get("/events")).body.data.map((e: any) => e.id)).not.toContain(id);

    const early = await put(`/events/${id}`, { status: "Published" }, a.organizer.token);
    expect(early.status).toBe(422);

    const submitted = await post(`/events/${id}/submit`, {}, a.organizer.token);
    expect(submitted.status).toBe(200);
    expect(submitted.body.data.status).toBe("Pending KKF Approval");
    expect(shapeOf(submitted)).toMatchSnapshot();

    const approved = await post(`/events/${id}/approve`, {}, a.officer.token);
    expect(approved.body.data).toMatchObject({ status: "Approved", kkf_approved_by: a.officer.id, kkf_comment: null });
    expect(approved.body.data.kkf_approval_date).toBeTruthy();
    expect((await get(`/events/${id}`)).status).toBe(404); // approved but not yet published

    // Publish guard: an approved event still needs a bout first.
    const empty = await put(`/events/${id}`, { status: "Published" }, a.organizer.token);
    expect(empty.status).toBe(422);
    await addBout(id);

    const published = await put(`/events/${id}`, { status: "Published" }, a.organizer.token);
    expect(published.body.data.status).toBe("Published");
    expect((await get(`/events/${id}`)).status).toBe(200);
  });

  it("KKF sends an event back with a comment; re-submitting clears it", async () => {
    const id = (await post("/events", fullEvent(), a.organizer.token)).body.data.id;
    await post(`/events/${id}/submit`, {}, a.organizer.token);
    expect((await post(`/events/${id}/reject`, {}, a.officer.token)).status).toBe(422);
    const back = await post(`/events/${id}/reject`, { comment: "Add the venue address" }, a.officer.token);
    expect(back.body.data).toMatchObject({ status: "Draft", kkf_comment: "Add the venue address" });
    const again = await post(`/events/${id}/submit`, {}, a.organizer.token);
    expect(again.body.data).toMatchObject({ status: "Pending KKF Approval", kkf_comment: null });
  });

  it("enforces who can submit, approve and edit", async () => {
    const id = (await post("/events", fullEvent(), a.organizer.token)).body.data.id;
    const other = (await post("/users", { username: `org_${uniq()}`, fullName: "Other Organizer", email: `org_${uniq()}@test.local`, role: "Organizer", password: "password123" }, a.admin.token)).body.data;
    const otherToken = (await post("/users/login", { username: other.username, password: "password123" })).body.data.token;
    expect((await put(`/events/${id}`, { name: "Not mine" }, otherToken)).status).toBe(403);
    expect((await post(`/events/${id}/submit`, {}, otherToken)).status).toBe(403);
    expect((await post(`/events/${id}/approve`, {}, a.officer.token)).status).toBe(422); // not submitted yet
    await post(`/events/${id}/submit`, {}, a.organizer.token);
    expect((await post(`/events/${id}/submit`, {}, a.organizer.token)).status).toBe(422);
    for (const who of ["organizer", "club", "referee"] as const) {
      expect((await post(`/events/${id}/approve`, {}, a[who].token)).status).toBe(403);
    }
    expect((await put(`/events/${id}`, { status: "Approved" }, a.organizer.token)).status).toBe(422);
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

/** A fight card with one bout on the event (two fresh fighters), created by the admin. */
async function addBout(eventId: string) {
  const card = (await post("/matches/batches", { eventId, name: "Main card", weekNumber: 1, date: "2026-11-01", location: "Arena" }, a.admin.token)).body.data.id;
  const fighter = async () =>
    (await post("/fighters", { name: `Guard ${uniq()}`, nameKhmer: "x", dateOfBirth: "2000-01-01", gender: "Male", currentWeight: 60, height: 170 }, a.admin.token)).body.data;
  const [red, blue] = [await fighter(), await fighter()];
  const res = await post("/matches", { subEventId: card, fighterAId: red.id, fighterBId: blue.id, rounds: 5, roundTime: 180, knockdownLimit: 3, agreedWeight: 60, gloveSize: "10oz", gloveBrand: "Twins" }, a.admin.token);
  expect(res.body.success).toBe(true);
}

describe("publish guard", () => {
  it("won't publish a fight night without bouts; publishes once it has one; leaves published events editable", async () => {
    const id = (await post("/events", fullEvent(), a.officer.token)).body.data.id;
    const empty = await put(`/events/${id}`, { status: "Published" }, a.officer.token);
    expect(empty.status).toBe(422);
    expect(empty.body).toEqual({ success: false, error: "Add at least one bout before publishing this fight night" });
    expect((await get(`/events/${id}`)).status).toBe(404); // still hidden

    await addBout(id);
    const published = await put(`/events/${id}`, { status: "Published" }, a.officer.token);
    expect(published.status).toBe(200);
    expect(published.body.data.status).toBe("Published");

    // Editing an already published event (even re-sending its status) is not blocked.
    const direct = (await post("/events", { ...fullEvent(), status: "Published" }, a.admin.token)).body.data.id;
    const renamed = await put(`/events/${direct}`, { name: `Renamed ${uniq()}`, status: "Published" }, a.admin.token);
    expect(renamed.status).toBe(200);
  });
});
