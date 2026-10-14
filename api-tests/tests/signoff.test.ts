/**
 * After the match (Program workflow phase 7, claude/updates/match-signoff-settlement.md): sign-off locks the results,
 * disputes block it until resolved, the settlement checklist covers the broadcaster and the sponsors.
 */
import { beforeAll, describe, expect, it } from "vitest";
import { type Actors, get, post, put, setupActors, shapeOf, uniq } from "./helpers";

let a: Actors;
let station: string;
let sponsor: string;
const future = (days: number) => new Date(Date.now() + days * 86_400_000).toISOString().slice(0, 10);

const newFighter = async () =>
  (await post("/fighters", { name: `Fighter ${uniq()}`, nameKhmer: `x ${uniq()}`, dateOfBirth: "2000-01-01", gender: "Male", currentWeight: 60, height: 170 }, a.admin.token)).body.data.id as string;

/** A match `days` from today (0 = match day) with `bouts` bouts; sponsor and broadcaster attached. */
async function newMatch(days = 0, bouts = 2) {
  const date = future(days);
  const event = (await post("/events", { name: `Match ${uniq()}`, date, location: "Phnom Penh", status: "Draft", broadcastStationId: station, mainSponsorId: sponsor, sponsorIds: [sponsor] }, a.officer.token)).body.data.id as string;
  const card = (await post("/matches/batches", { eventId: event, name: "Main card", weekNumber: 1, date, location: "Arena" }, a.admin.token)).body.data.id as string;
  const ids: { id: string; red: string }[] = [];
  for (let i = 0; i < bouts; i++) {
    const red = await newFighter();
    const res = await post("/matches", { subEventId: card, eventId: event, fighterAId: red, fighterBId: await newFighter(), rounds: 5, roundTime: 180, knockdownLimit: 3, agreedWeight: 60, gloveSize: "10oz", gloveBrand: "Twins" }, a.admin.token);
    ids.push({ id: res.body.data.id, red });
  }
  return { event, bouts: ids, date };
}
const record = (b: { id: string; red: string }, token = a.officer.token) => post(`/matches/${b.id}/result`, { winnerId: b.red, method: "KO", round: 1 }, token);

beforeAll(async () => {
  a = await setupActors();
  station = (await post("/settings/broadcast-stations", { name: `Station ${uniq()}` }, a.admin.token)).body.data.id;
  sponsor = (await post("/settings/sponsors", { name: `Sponsor ${uniq()}` }, a.admin.token)).body.data.id;
});

describe("sign-off", () => {
  it("needs the match day, every result, no replacement waiting and no open dispute", async () => {
    const early = await newMatch(10);
    expect((await post(`/events/${early.event}/sign-off`, {}, a.officer.token)).body.error).toMatch(/has not come/);

    const m = await newMatch(0, 2);
    expect((await post(`/events/${m.event}/sign-off`, {}, a.officer.token)).body.error).toMatch(/2 bouts have no result/);
    await record(m.bouts[0]);
    expect((await post(`/events/${m.event}/sign-off`, {}, a.officer.token)).body.error).toMatch(/1 bout has no result/);
    await post(`/matches/${m.bouts[1].id}/withdraw`, { side: "b", reason: "injured" }, a.officer.token);
    expect((await post(`/events/${m.event}/sign-off`, {}, a.officer.token)).body.error).toMatch(/needs a replacement/);
    await post(`/matches/${m.bouts[1].id}/cancel`, { reason: "no_show" }, a.officer.token); // cancelled bouts don't count
    const dispute = await post(`/matches/${m.bouts[0].id}/disputes`, { raisedBy: "Club X", reason: "Score card looks wrong" }, a.officer.token);
    expect(dispute.status).toBe(201);
    expect((await post(`/events/${m.event}/sign-off`, {}, a.officer.token)).body.error).toMatch(/open disputes/);
    expect((await put(`/disputes/${dispute.body.data.id}/resolve`, { outcome: "dismissed", note: "Checked" }, a.officer.token)).body.data.status).toBe("dismissed");

    expect((await post(`/events/${m.event}/sign-off`, {}, a.club.token)).status).toBe(403);
    const ok = await post(`/events/${m.event}/sign-off`, {}, a.officer.token);
    expect(ok.status).toBe(200);
    expect(shapeOf(ok)).toMatchSnapshot();
    expect((await post(`/events/${m.event}/sign-off`, {}, a.officer.token)).body.error).toMatch(/already signed off/);
    const event = (await get(`/events/${m.event}`, a.officer.token)).body.data;
    expect(event.status).toBe("Completed");
    expect(event.signed_off_at).toEqual(expect.any(String));
  });

  it("locks results and weigh-ins: only a Super Admin can correct, with a reason, and it is logged", async () => {
    const m = await newMatch(0, 1);
    await record(m.bouts[0]);
    await post(`/events/${m.event}/sign-off`, {}, a.officer.token);

    const blocked = await record(m.bouts[0]);
    expect(blocked.status).toBe(422);
    expect(blocked.body.error).toMatch(/signed off/);
    expect((await post(`/matches/${m.bouts[0].id}/weigh-in`, { a: 60, b: 60 }, a.officer.token)).status).toBe(422);
    expect((await post(`/matches/${m.bouts[0].id}/result`, { winnerId: null, method: "Draw", round: 0 }, a.admin.token)).body.error).toMatch(/reason/);
    const fixed = await post(`/matches/${m.bouts[0].id}/result`, { winnerId: null, method: "Draw", round: 0, correctionReason: "Judges' card was misread" }, a.admin.token);
    expect(fixed.status).toBe(200);
    expect(fixed.body.data.winner_method).toBe("Draw");
    expect((await post(`/matches/${m.bouts[0].id}/weigh-in`, { a: 60, b: 61, correctionReason: "Typo" }, a.admin.token)).status).toBe(200);

    // Nothing else about the match changes either.
    expect((await post(`/matches/${m.bouts[0].id}/withdraw`, { side: "a", reason: "other" }, a.admin.token)).body.error).toMatch(/signed off/);
    expect((await post(`/events/${m.event}/postpone`, { date: future(30), reason: "venue" }, a.admin.token)).body.error).toMatch(/signed off/);
    expect((await put(`/events/${m.event}`, { status: "Cancelled" }, a.admin.token)).body.error).toMatch(/signed off/);
    const history = (await get(`/events/${m.event}/changes`, a.officer.token)).body.data.map((h: any) => h.kind);
    expect(history).toEqual(["correct_weigh_in", "correct_result", "sign_off"]);
  });

  it("only a Super Admin reopens, with a reason; then results are editable again", async () => {
    const m = await newMatch(0, 1);
    await record(m.bouts[0]);
    await post(`/events/${m.event}/sign-off`, {}, a.officer.token);
    expect((await post(`/events/${m.event}/reopen`, { reason: "Wrong" }, a.officer.token)).status).toBe(403);
    expect((await post(`/events/${m.event}/reopen`, {}, a.admin.token)).status).toBe(422);
    expect((await post(`/events/${m.event}/reopen`, { reason: "Result entered for the wrong bout" }, a.admin.token)).status).toBe(200);
    expect((await get(`/events/${m.event}`, a.officer.token)).body.data).toMatchObject({ signed_off_at: null, status: "Published" });
    expect((await record(m.bouts[0])).status).toBe(200);
    expect((await post(`/events/${m.event}/reopen`, { reason: "again" }, a.admin.token)).status).toBe(422); // not signed off
    expect((await get(`/events/${m.event}/changes`, a.officer.token)).body.data[0]).toMatchObject({ kind: "reopen", note: "Result entered for the wrong bout" });
  });
});

describe("disputes", () => {
  it("are recorded and resolved by KKF staff, validated, and listed", async () => {
    const m = await newMatch(0, 1);
    const bout = m.bouts[0].id;
    expect((await post(`/matches/${bout}/disputes`, { reason: "x" }, a.officer.token)).status).toBe(422);
    expect((await post(`/matches/${bout}/disputes`, { raisedBy: "Club", reason: "x" }, a.club.token)).status).toBe(403);
    const created = await post(`/matches/${bout}/disputes`, { raisedBy: "Gym Y", reason: "Illegal elbow in round 2" }, a.officer.token);
    expect(created.body.data).toMatchObject({ status: "open", raised_by: "Gym Y", bout: expect.stringContaining(" vs "), created_by_name: expect.any(String) });
    expect(shapeOf(created)).toMatchSnapshot();
    const id = created.body.data.id;
    expect((await get(`/events/${m.event}/disputes`, a.officer.token)).body.data).toHaveLength(1);
    expect((await get(`/matches/disputes?status=open`, a.officer.token)).body.data.some((d: any) => d.id === id)).toBe(true);
    expect((await put(`/disputes/${id}/resolve`, { outcome: "maybe" }, a.officer.token)).status).toBe(422);
    const done = await put(`/disputes/${id}/resolve`, { outcome: "corrected", note: "Result changed to a draw" }, a.officer.token);
    expect(done.body.data).toMatchObject({ status: "corrected", resolution_note: "Result changed to a draw", resolved_by_name: expect.any(String) });
    expect((await put(`/disputes/${id}/resolve`, { outcome: "upheld" }, a.officer.token)).status).toBe(422); // already
    expect((await get(`/matches/disputes?status=open`, a.officer.token)).body.data.some((d: any) => d.id === id)).toBe(false);
    expect((await get(`/events/${m.event}/disputes`, a.club.token)).status).toBe(403);
  });
});

describe("settlement", () => {
  it("lists the broadcaster and sponsors, ticks them from match day on, staff only", async () => {
    const m = await newMatch(0, 1);
    const list = await get(`/events/${m.event}/settlement`, a.officer.token);
    expect(list.body.data.parties.map((p: any) => [p.kind, p.settled])).toEqual([["broadcaster", false], ["sponsor", false]]);
    expect(shapeOf(list)).toMatchSnapshot();
    expect((await put(`/events/${m.event}/settlement`, { kind: "sponsor", partyId: sponsor, settled: true }, a.club.token)).status).toBe(403);
    expect((await put(`/events/${m.event}/settlement`, { kind: "sponsor", partyId: station, settled: true }, a.officer.token)).status).toBe(422);
    const ticked = await put(`/events/${m.event}/settlement`, { kind: "sponsor", partyId: sponsor, settled: true, note: "Paid 12 Oct" }, a.officer.token);
    expect(ticked.body.data.parties.find((p: any) => p.kind === "sponsor")).toMatchObject({ settled: true, note: "Paid 12 Oct", settled_by_name: expect.any(String) });
    const undone = await put(`/events/${m.event}/settlement`, { kind: "sponsor", partyId: sponsor, settled: false }, a.officer.token);
    expect(undone.body.data.parties.find((p: any) => p.kind === "sponsor").settled).toBe(false);

    const early = await newMatch(10, 1);
    expect((await put(`/events/${early.event}/settlement`, { kind: "sponsor", partyId: sponsor, settled: true }, a.officer.token)).body.error).toMatch(/match day/);
  });

  it("settlement and disputes are never public", async () => {
    const m = await newMatch(0, 1);
    expect((await get(`/events/${m.event}/settlement`)).status).toBe(401);
    expect((await get(`/events/${m.event}/disputes`)).status).toBe(401);
  });
});
