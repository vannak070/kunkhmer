/**
 * Simpler match page (claude/updates/match-page-simpler.md): staff entries confirm themselves while approvals are off,
 * edit / delete a bout (officer rules), swap red and blue, and the bout order on a fight card.
 */
import { beforeAll, describe, expect, it } from "vitest";
import { type Actors, del, get, post, put, setupActors, uniq } from "./helpers";

let a: Actors;
// A week far from every other test file (rest days and "one bout per card / day" rules).
const DAY = "2036-04-12";
const rules = { rounds: 5, roundTime: 3, knockdownLimit: 3, gloveSize: "10oz", gloveBrand: "Boon", agreedWeight: 60 };

const fighter = async () =>
  (await post("/fighters", { name: `Simple ${uniq()}`, nameKhmer: `ស ${uniq()}`, dateOfBirth: "2000-01-01", gender: "Male", currentWeight: 60, height: 170 }, a.admin.token)).body.data.id as string;
const night = async (date = DAY) =>
  (await post("/events", { name: `Simple night ${uniq()}`, date, location: "Phnom Penh", status: "Draft" }, a.officer.token)).body.data.id as string;
const card = async (eventId: string, date = DAY) =>
  (await post("/matches/batches", { eventId, name: "Main card", weekNumber: 1, date, location: "Arena" }, a.officer.token)).body.data.id as string;
const bout = async (subEventId: string, token = a.officer.token) => {
  const res = await post("/matches", { subEventId, fighterAId: await fighter(), fighterBId: await fighter(), ...rules }, token);
  if (!res.body.success) throw new Error(JSON.stringify(res.body));
  return res.body.data;
};
const agreements = async (id: string) => (await get(`/events/${id}/agreements`, a.officer.token)).body.data;

beforeAll(async () => {
  a = await setupActors();
});

describe("staff entries confirm themselves (approvals off)", () => {
  it("a match KKF staff create has confirmed details and sponsors, and publishes without Confirm clicks", async () => {
    const id = await night();
    const ag = await agreements(id);
    expect(ag.items.details.state).toBe("confirmed");
    expect(ag.items.sponsors.state).toBe("confirmed");
    expect(ag.log[0]).toMatchObject({ status: "confirmed", note: "Entered by KKF staff" });

    await bout(await card(id));
    const pub = await put(`/events/${id}`, { status: "Published" }, a.officer.token);
    expect(pub.status).toBe(200);
    expect(pub.body.data.status).toBe("Published");
  });

  it("an edit by staff is confirmed again; titles chosen by staff are confirmed", async () => {
    const id = await night();
    await put(`/events/${id}`, { location: "Siem Reap" }, a.officer.token);
    expect((await agreements(id)).items.details.state).toBe("confirmed");

    const title = (await post("/champions", { titleName: `Title ${uniq()}`, championType: "National", weightClass: 60 }, a.admin.token)).body.data.id;
    const set = await put(`/events/${id}/titles`, { titleIds: [title] }, a.officer.token);
    expect(set.status).toBe(200);
    expect((await agreements(id)).items.titles.state).toBe("confirmed");
  });
});

describe("edit and delete a bout", () => {
  it("staff edit weight, rounds, gloves, type and rule set", async () => {
    const b = await bout(await card(await night()));
    const res = await put(`/matches/${b.id}`, { agreedWeight: 63.5, rounds: 3, roundTime: 2, gloveSize: "8oz", gloveBrand: "Fairtex", boutLabel: "other", boutLabelText: "គូពិសេស", ruleSet: "kick_boxing" }, a.officer.token);
    expect(res.status).toBe(200);
    expect(res.body.data).toMatchObject({ agreed_weight: 63.5, rounds: 3, round_time: 2, glove_size: "8oz", glove_brand: "Fairtex", bout_label: "other", bout_label_text: "គូពិសេស", rule_set: "kick_boxing" });
  });

  it("a KKF Officer deletes a bout of an unpublished match without a result", async () => {
    const b = await bout(await card(await night()));
    expect((await del(`/matches/${b.id}`, a.officer.token)).status).toBe(200);
    expect((await get(`/matches/${b.id}`, a.officer.token)).status).toBe(404);
  });

  it("a KKF Officer can't delete a bout of a published match or a bout with a result; a Super Admin can", async () => {
    const id = await night();
    const c = await card(id);
    const b1 = await bout(c);
    const b2 = await bout(c);
    await post(`/matches/${b2.id}/result`, { winnerId: b2.fighter_a_id, method: "Decision", round: 5 }, a.officer.token);
    const withResult = await del(`/matches/${b2.id}`, a.officer.token);
    expect(withResult.status).toBe(422);
    expect(withResult.body.error).toMatch(/result/);

    expect((await put(`/events/${id}`, { status: "Published" }, a.officer.token)).status).toBe(200);
    const published = await del(`/matches/${b1.id}`, a.officer.token);
    expect(published.status).toBe(422);
    expect(published.body.error).toMatch(/published/);

    expect((await del(`/matches/${b1.id}`, a.admin.token)).status).toBe(200);
    expect((await del(`/matches/${b2.id}`, a.admin.token)).status).toBe(200);
  });

  it("Organizers, clubs and referees can't delete bouts", async () => {
    const b = await bout(await card(await night()));
    for (const who of [a.organizer, a.club, a.referee]) expect((await del(`/matches/${b.id}`, who.token)).status).toBe(403);
  });
});

describe("swap red and blue", () => {
  it("swaps the fighters and their weigh-ins", async () => {
    const b = await bout(await card(await night()));
    await post(`/matches/${b.id}/weigh-in`, { a: 60.2, b: 59.8 }, a.officer.token);
    const res = await post(`/matches/${b.id}/swap-corners`, {}, a.officer.token);
    expect(res.status).toBe(200);
    expect(res.body.data).toMatchObject({ fighter_a_id: b.fighter_b_id, fighter_b_id: b.fighter_a_id, weigh_in_a_kg: 59.8, weigh_in_b_kg: 60.2 });
  });

  it("is refused after a result, for clubs and referees, and for unknown bouts", async () => {
    const b = await bout(await card(await night()));
    for (const who of [a.club, a.referee]) expect((await post(`/matches/${b.id}/swap-corners`, {}, who.token)).status).toBe(403);
    await post(`/matches/${b.id}/result`, { winnerId: b.fighter_a_id, method: "KO", round: 2 }, a.officer.token);
    expect((await post(`/matches/${b.id}/swap-corners`, {}, a.officer.token)).status).toBe(422);
    expect((await post("/matches/00000000-0000-4000-8000-000000000000/swap-corners", {}, a.officer.token)).status).toBe(404);
  });
});

describe("bout order on a fight card", () => {
  it("saves the order the bouts are sent in", async () => {
    const c = await card(await night());
    const [b1, b2, b3] = [await bout(c), await bout(c), await bout(c)];
    const res = await put(`/matches/batches/${c}/order`, { matchIds: [b3.id, b1.id, b2.id] }, a.officer.token);
    expect(res.status).toBe(200);
    const list = (await get(`/matches?subEventId=${c}`, a.officer.token)).body.data as any[];
    expect(list.map((m) => m.id)).toEqual([b3.id, b1.id, b2.id]);
    expect(list.map((m) => m.sort_order)).toEqual([1, 2, 3]);
  });

  it("needs every bout of the card exactly once", async () => {
    const c = await card(await night());
    const [b1, b2] = [await bout(c), await bout(c)];
    const other = await bout(await card(await night("2036-05-10"), "2036-05-10"));
    for (const matchIds of [[b1.id], [b1.id, b1.id], [b1.id, b2.id, other.id], [b1.id, other.id], "nope"]) {
      expect((await put(`/matches/batches/${c}/order`, { matchIds }, a.officer.token)).status).toBe(422);
    }
    for (const who of [a.club, a.referee]) expect((await put(`/matches/batches/${c}/order`, { matchIds: [b2.id, b1.id] }, who.token)).status).toBe(403);
  });
});
