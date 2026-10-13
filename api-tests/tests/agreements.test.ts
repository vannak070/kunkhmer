/**
 * Offline agreements log + fight night licence (Program workflow phase 4): an Organizer records its
 * broadcaster's fight night details and sponsors, KKF confirms or sends back; publishing needs confirmed details.
 */
import { beforeAll, describe, expect, it } from "vitest";
import { API_URL, type Actor, type Actors, get, login, post, put, randomPassword, setupActors, shapeOf, uniq } from "./helpers";

const PDF = `data:application/pdf;base64,${Buffer.from("%PDF-1.4\n% licence\n").toString("base64")}`;
const raw = (path: string, token?: string) =>
  fetch(API_URL + path, { headers: { Accept: "application/json", ...(token ? { Authorization: `Bearer ${token}` } : {}) } });

let a: Actors;
let station: string;
let otherStation: string;
let org: Actor;
let otherOrg: Actor;
let sponsor: string;

async function newOrganizer(stationId: string): Promise<Actor> {
  const username = `org_${uniq()}`;
  const password = randomPassword();
  const res = await post("/users", { username, password, fullName: "Station Organizer", email: `${username}@test.local`, role: "Organizer", broadcastStationId: stationId }, a.admin.token);
  return { id: res.body.data.id, username, password, token: await login(username, password), clubId: null };
}

/** A draft fight night of the test broadcaster, made by KKF staff. */
const newNight = async () =>
  (await post("/events", { name: `Night ${uniq()}`, date: "2026-12-12", location: "Phnom Penh", status: "Draft", broadcastStationId: station }, a.officer.token)).body.data.id as string;

const agreements = async (id: string, token = a.officer.token) => (await get(`/events/${id}/agreements`, token)).body.data;

const newFighter = async () =>
  (await post("/fighters", { name: `Agreed ${uniq()}`, nameKhmer: "x", dateOfBirth: "2000-01-01", gender: "Male", currentWeight: 60, height: 170 }, a.admin.token)).body.data.id as string;

/** A fight card with one bout on the event (extra bout fields, e.g. a title); returns the card id and the response. */
async function addBout(eventId: string, extra: Record<string, unknown> = {}) {
  const card = (await post("/matches/batches", { eventId, name: "Main card", weekNumber: 1, date: "2026-12-12", location: "Arena" }, a.admin.token)).body.data.id;
  const res = await post("/matches", { subEventId: card, fighterAId: await newFighter(), fighterBId: await newFighter(), rounds: 5, roundTime: 180, knockdownLimit: 3, agreedWeight: 60, gloveSize: "10oz", gloveBrand: "Twins", ...extra }, a.admin.token);
  expect(res.body.success).toBe(true);
  return { card: card as string, res };
}

const newTitle = async () =>
  (await post("/champions", { titleName: `Title ${uniq()}`, championType: "National", weightClass: 60 }, a.admin.token)).body.data.id as string;

beforeAll(async () => {
  a = await setupActors();
  station = (await post("/settings/broadcast-stations", { name: `Station ${uniq()}` }, a.admin.token)).body.data.id;
  otherStation = (await post("/settings/broadcast-stations", { name: `Station ${uniq()}` }, a.admin.token)).body.data.id;
  org = await newOrganizer(station);
  otherOrg = await newOrganizer(otherStation);
  sponsor = (await post("/settings/sponsors", { name: `Sponsor ${uniq()}` }, a.admin.token)).body.data.id;
});

describe("recording and confirming", () => {
  it("Organizer records the details (licence first), KKF confirms", async () => {
    const id = await newNight();
    const empty = await agreements(id, org.token);
    expect(empty).toMatchObject({ licence: { number: null, date: null, hasDocument: false }, items: { details: { state: "none" }, sponsors: { state: "none" } }, log: [] });

    const noLicence = await post(`/events/${id}/agreements`, { item: "details" }, org.token);
    expect(noLicence.status).toBe(422);

    const licence = await put(`/events/${id}/licence`, { number: "KKF-2026-114", date: "2026-11-30", document: PDF }, org.token);
    expect(licence.status).toBe(200);
    expect(licence.body.data).toEqual({ number: "KKF-2026-114", date: "2026-11-30", hasDocument: true });

    const recorded = await post(`/events/${id}/agreements`, { item: "details", note: "Met TV station on 10 Oct" }, org.token);
    expect(recorded.status).toBe(201);
    expect(recorded.body.data).toMatchObject({ item: "details", status: "waiting", note: "Met TV station on 10 Oct", recorded_by: org.id, confirmed_by: null, matches_current: true });
    expect(shapeOf(recorded)).toMatchSnapshot();
    expect(JSON.stringify(recorded.body)).not.toMatch(/\.pdf|[a-f0-9]{64}/); // the scan only as yes/no

    expect((await post(`/events/${id}/agreements/${recorded.body.data.id}/confirm`, {}, org.token)).status).toBe(403);
    const confirmed = await post(`/events/${id}/agreements/${recorded.body.data.id}/confirm`, {}, a.officer.token);
    expect(confirmed.status).toBe(200);
    expect(confirmed.body.data).toMatchObject({ status: "confirmed", confirmed_by: a.officer.id, recorded_by_name: "Station Organizer" });

    const after = await agreements(id, org.token);
    expect(after.items.details.state).toBe("confirmed");
    expect(after.log).toHaveLength(1);
    expect(shapeOf(await get(`/events/${id}/agreements`, org.token))).toMatchSnapshot();
  });

  it("KKF records and confirms in one step", async () => {
    const id = await newNight();
    const res = await post(`/events/${id}/agreements`, { item: "sponsors" }, a.officer.token);
    expect(res.status).toBe(201);
    expect(res.body.data).toMatchObject({ status: "confirmed", recorded_by: a.officer.id, confirmed_by: a.officer.id });
    expect(res.body.data.confirmed_at).toBe(res.body.data.recorded_at);
  });

  it("KKF sends a record back with a reason", async () => {
    const id = await newNight();
    const row = (await post(`/events/${id}/agreements`, { item: "sponsors" }, org.token)).body.data;
    expect((await post(`/events/${id}/agreements/${row.id}/return`, {}, a.officer.token)).status).toBe(422);
    const back = await post(`/events/${id}/agreements/${row.id}/return`, { comment: "Main sponsor missing" }, a.officer.token);
    expect(back.body.data).toMatchObject({ status: "returned", kkf_comment: "Main sponsor missing" });
    expect((await agreements(id)).items.sponsors.state).toBe("returned");
    expect((await post(`/events/${id}/agreements/${row.id}/confirm`, {}, a.officer.token)).status).toBe(422);
  });

  it("won't confirm when the values changed after recording, or an older record", async () => {
    const id = await newNight();
    const first = (await post(`/events/${id}/agreements`, { item: "sponsors" }, org.token)).body.data;
    expect((await put(`/events/${id}`, { mainSponsorId: sponsor, sponsorIds: [sponsor] }, org.token)).status).toBe(200);
    const state = await agreements(id);
    expect(state.items.sponsors).toMatchObject({ state: "waiting", agreement: { matches_current: false } });
    expect((await post(`/events/${id}/agreements/${first.id}/confirm`, {}, a.officer.token)).status).toBe(422);

    const second = (await post(`/events/${id}/agreements`, { item: "sponsors", note: "Sponsor added" }, org.token)).body.data;
    expect((await post(`/events/${id}/agreements/${first.id}/confirm`, {}, a.officer.token)).status).toBe(422); // replaced
    expect((await post(`/events/${id}/agreements/${second.id}/confirm`, {}, a.officer.token)).status).toBe(200);
    expect((await post(`/events/${id}/agreements/${second.id}/confirm`, {}, a.officer.token)).status).toBe(422); // already answered
    expect((await post(`/events/${id}/agreements/not-a-uuid/confirm`, {}, a.officer.token)).status).toBe(404);
  });

  it("lists what waits for KKF (staff only)", async () => {
    const id = await newNight();
    const row = (await post(`/events/${id}/agreements`, { item: "sponsors" }, org.token)).body.data;
    const res = await get("/agreements/waiting", a.officer.token);
    expect(res.status).toBe(200);
    expect(res.body.data.find((r: { id: string }) => r.id === row.id)).toMatchObject({ event_id: id, item: "sponsors", event_name: expect.stringMatching(/^Night /) });
    expect((await get("/agreements/waiting", org.token)).status).toBe(403);
  });
});

describe("publish gate", () => {
  it("publishes only with confirmed, unchanged details", async () => {
    const id = await newNight();
    await addBout(id);
    const blocked = await put(`/events/${id}`, { status: "Published" }, a.officer.token);
    expect(blocked.body).toEqual({ success: false, error: "KKF must confirm the fight night details and licence before publishing" });

    await put(`/events/${id}/licence`, { number: "KKF-1", date: "2026-11-30" }, a.officer.token);
    await post(`/events/${id}/agreements`, { item: "details" }, a.officer.token);
    // A change after confirmation needs a new confirmation.
    await put(`/events/${id}`, { location: "Siem Reap" }, a.officer.token);
    expect((await agreements(id)).items.details.state).toBe("changed");
    expect((await put(`/events/${id}`, { status: "Published" }, a.officer.token)).status).toBe(422);

    await post(`/events/${id}/agreements`, { item: "details", note: "Venue moved" }, a.officer.token);
    const published = await put(`/events/${id}`, { status: "Published" }, a.officer.token);
    expect(published.status).toBe(200);
    expect(published.body.data.status).toBe("Published");
    expect((await agreements(id)).log).toHaveLength(2);
  });
});

describe("who can do what", () => {
  it("lets the Organizer edit its broadcaster's fight night only before publishing", async () => {
    const id = await newNight();
    expect((await put(`/events/${id}`, { name: `Renamed ${uniq()}` }, org.token)).status).toBe(200);
    expect((await put(`/events/${id}`, { status: "Published" }, org.token)).status).toBe(422); // KKF publishes

    await addBout(id);
    await put(`/events/${id}/licence`, { number: "KKF-2", date: "2026-11-30" }, a.officer.token);
    await post(`/events/${id}/agreements`, { item: "details" }, a.officer.token);
    await put(`/events/${id}`, { status: "Published" }, a.officer.token);

    for (const res of [
      await put(`/events/${id}`, { name: "Too late" }, org.token),
      await put(`/events/${id}/licence`, { number: "X" }, org.token),
      await post(`/events/${id}/agreements`, { item: "sponsors" }, org.token),
    ]) {
      expect(res.status).toBe(422);
      expect(res.body.error).toBe("This fight night is published — ask KKF to change it");
    }
    expect((await put(`/events/${id}/licence`, { number: "KKF-2b" }, a.officer.token)).status).toBe(200); // KKF still can
  });

  it("keeps another broadcaster's Organizer and other roles out", async () => {
    const id = await newNight();
    expect((await get(`/events/${id}/agreements`, otherOrg.token)).status).toBe(404);
    expect((await post(`/events/${id}/agreements`, { item: "sponsors" }, otherOrg.token)).status).toBe(404);
    expect((await put(`/events/${id}/licence`, { number: "X" }, otherOrg.token)).status).toBe(404);
    expect((await put(`/events/${id}`, { name: "Not mine" }, otherOrg.token)).status).toBe(403);
    for (const who of ["club", "referee"] as const) {
      expect((await get(`/events/${id}/agreements`, a[who].token)).status).toBe(403);
    }
    expect((await get(`/events/${id}/agreements`)).status).toBe(401);
    expect((await post(`/events/${id}/agreements`, { item: "contract" }, a.officer.token)).status).toBe(422);
  });
});

describe("licence privacy", () => {
  it("keeps the scan private and out of event responses", async () => {
    const id = await newNight();
    const saved = await put(`/events/${id}/licence`, { number: "KKF-3", date: "2026-11-30", document: PDF }, a.officer.token);
    expect(JSON.stringify(saved.body)).not.toMatch(/\/api\/files|\.pdf|[a-f0-9]{64}/);

    const event = (await get(`/events/${id}`, a.admin.token)).body.data;
    expect(Object.keys(event).filter((k) => k.startsWith("licence"))).toEqual([]);

    const doc = await raw(`/events/${id}/licence/document`, org.token);
    expect(doc.status).toBe(200);
    expect(doc.headers.get("content-type")).toBe("application/pdf");
    expect(doc.headers.get("cache-control")).toBe("private, no-store");
    expect((await raw(`/events/${id}/licence/document`, otherOrg.token)).status).toBe(404);
    expect((await raw(`/events/${id}/licence/document`, a.club.token)).status).toBe(403);
    expect((await raw(`/events/${id}/licence/document`)).status).toBe(401);

    expect((await put(`/events/${id}/licence`, { document: "data:text/plain;base64,aGk=" }, a.officer.token)).status).toBe(422);
    const cleared = await put(`/events/${id}/licence`, { document: "" }, a.officer.token);
    expect(cleared.body.data.hasDocument).toBe(false);
    expect((await raw(`/events/${id}/licence/document`, a.officer.token)).status).toBe(404);
  });
});

describe("titles on a fight night (phase 5)", () => {
  it("Organizer chooses several titles; KKF confirms them; unknown titles are refused", async () => {
    const id = await newNight();
    const [t1, t2] = [await newTitle(), await newTitle()];
    expect((await post(`/events/${id}/agreements`, { item: "titles" }, org.token)).status).toBe(422); // nothing chosen yet
    expect((await put(`/events/${id}/titles`, { titleIds: [t1, "00000000-0000-4000-8000-000000000000"] }, org.token)).status).toBe(422);
    expect((await put(`/events/${id}/titles`, { titleIds: "x" }, org.token)).status).toBe(422);
    expect((await put(`/events/${id}/titles`, { titleIds: [t1] }, otherOrg.token)).status).toBe(404);

    const chosen = await put(`/events/${id}/titles`, { titleIds: [t1, t2, t1] }, org.token);
    expect(chosen.status).toBe(200);
    expect(chosen.body.data.map((t: { id: string }) => t.id).sort()).toEqual([t1, t2].sort());
    const listed = await agreements(id, org.token);
    expect(listed.titles).toHaveLength(2);
    expect(listed.items.titles.state).toBe("none");

    const row = (await post(`/events/${id}/agreements`, { item: "titles", note: "Two belts agreed" }, org.token)).body.data;
    expect(row).toMatchObject({ item: "titles", status: "waiting" });
    await post(`/events/${id}/agreements/${row.id}/confirm`, {}, a.officer.token);
    expect((await agreements(id)).items.titles.state).toBe("confirmed");

    await put(`/events/${id}/titles`, { titleIds: [t1] }, org.token);
    expect((await agreements(id)).items.titles.state).toBe("changed");
  });

  it("publishing waits for confirmed titles only when the fight night has titles", async () => {
    const id = await newNight();
    await addBout(id);
    await put(`/events/${id}/licence`, { number: "KKF-T", date: "2026-11-30" }, a.officer.token);
    await post(`/events/${id}/agreements`, { item: "details" }, a.officer.token);
    await put(`/events/${id}/titles`, { titleIds: [await newTitle()] }, a.officer.token);
    const blocked = await put(`/events/${id}`, { status: "Published" }, a.officer.token);
    expect(blocked.body).toEqual({ success: false, error: "KKF must confirm the titles on this fight night before publishing" });

    await post(`/events/${id}/agreements`, { item: "titles" }, a.officer.token); // KKF records and confirms
    expect((await put(`/events/${id}`, { status: "Published" }, a.officer.token)).status).toBe(200);
    expect((await put(`/events/${id}/titles`, { titleIds: [] }, org.token)).status).toBe(422); // published: ask KKF
  });

  it("warns (doesn't block) on a title bout for a belt off the confirmed list", async () => {
    const id = await newNight();
    const [listed, other] = [await newTitle(), await newTitle()];
    const titleWarnings = (res: { body: { data: { warnings?: { key: string; message: string }[] } } }) =>
      (res.body.data.warnings ?? []).filter((w) => w.key === "title_list").map((w) => w.message);

    const off = await addBout(id, { isTitleMatch: true, championshipId: other });
    expect(titleWarnings(off.res)).toEqual(["This title is not on the fight night's title list"]);

    await put(`/events/${id}/titles`, { titleIds: [listed] }, a.officer.token);
    const unconfirmed = await addBout(id, { isTitleMatch: true, championshipId: listed });
    expect(titleWarnings(unconfirmed.res)).toEqual(["KKF has not confirmed the titles on this fight night yet"]);

    await post(`/events/${id}/agreements`, { item: "titles" }, a.officer.token);
    const fine = await addBout(id, { isTitleMatch: true, championshipId: listed });
    expect(titleWarnings(fine.res)).toEqual([]);
    expect((await addBout(id)).res.body.data.warnings?.some((w: { key: string }) => w.key === "title_list") ?? false).toBe(false);

    // Changing a bout's title, and the dry-run check, warn the same way.
    const moved = await put(`/matches/${fine.res.body.data.id}`, { championshipId: other }, a.officer.token);
    expect(titleWarnings(moved)).toEqual(["This title is not on the fight night's title list"]);
    const check = await post("/matches/check", { subEventId: fine.card, fighterAId: await newFighter(), fighterBId: await newFighter(), championshipId: other }, a.officer.token);
    expect(check.body.data.warnings.filter((w: { key: string }) => w.key === "title_list")).toHaveLength(1);
    expect(check.body.data.allowed).toBe(true);
  });
});
