/** Batches (sub-events), matches, and recording match results. */
import { beforeAll, describe, expect, it } from "vitest";
import { type Actors, del, findById, get, post, put, setupActors, shape, shapeOf, uniq } from "./helpers";

let a: Actors;
let eventId: string;
let otherClubId: string;

beforeAll(async () => {
  a = await setupActors();
  eventId = (await post("/events", { name: `Match Event ${uniq()}`, date: "2026-10-01", location: "Phnom Penh" }, a.admin.token)).body.data.id;
  otherClubId = (await post("/clubs", { name: `Other Club ${uniq()}` }, a.admin.token)).body.data.id;
});

async function newFighter(clubId: string | null = a.clubId) {
  const res = await post(
    "/fighters",
    { name: `Fighter ${uniq()}`, nameKhmer: "x", dateOfBirth: "2000-01-01", gender: "Male", currentWeight: 60, height: 170, clubId, grade: "B", image: "https://example.com/f.png" },
    a.admin.token,
  );
  return res.body.data.id as string;
}

const fullBatch = () => ({
  eventId,
  name: `Week ${uniq()}`,
  weekNumber: 3,
  date: "2026-10-08",
  location: "TV5 Arena",
  phase: "Semi-Final",
  status: "Scheduled",
  batchNumber: `B-${uniq()}`,
});

// Created by the test organizer rather than the seeded admin, so snapshots
// don't depend on how the seed data was inserted.
async function newBatch() {
  return (await post("/matches/batches", fullBatch(), a.organizer.token)).body.data.id as string;
}

async function newMatch(overrides: Record<string, unknown> = {}) {
  const res = await post(
    "/matches",
    {
      subEventId: await newBatch(),
      fighterAId: await newFighter(),
      fighterBId: await newFighter(otherClubId),
      rounds: 5,
      roundTime: 180,
      knockdownLimit: 3,
      agreedWeight: 60.5,
      gloveSize: "10oz",
      gloveBrand: "Twins",
      ...overrides,
    },
    a.admin.token,
  );
  if (res.status !== 200) throw new Error(`match setup failed: ${JSON.stringify(res.body)}`);
  return res.body.data;
}

const recordOf = async (id: string) => (await get(`/fighters/${id}`)).body.data.record;

describe("batches (sub-events)", () => {
  it("creates a batch", async () => {
    const input = fullBatch();
    const res = await post("/matches/batches", input, a.organizer.token);
    expect(res.status).toBe(201);
    expect(res.body.data).toMatchObject({
      event_id: eventId,
      week_number: 3,
      date: "2026-10-08T00:00:00.000000Z",
      phase: "Semi-Final",
      batch_number: input.batchNumber,
      // The creator relation is serialized over the created_by foreign key.
      created_by: { id: a.organizer.id, full_name: "Test Organizer" },
      creator_name: "Test Organizer",
    });
    expect(res.body.data.created_by).not.toHaveProperty("password_hash");
    expect(shapeOf(res)).toMatchSnapshot();
  });

  it("applies defaults, including a generated batch number", async () => {
    const res = await post("/matches/batches", { eventId, name: "Minimal", weekNumber: 1, date: "2026-10-01", location: "PP" }, a.officer.token);
    expect(res.status).toBe(201);
    expect(res.body.data).toMatchObject({ phase: "Qualifier", status: "Draft" });
    expect(res.body.data.batch_number).toMatch(/^BATCH-\d+$/);
  });

  it("lists and shows batches publicly", async () => {
    const id = await newBatch();
    const list = await get("/matches/batches");
    expect(list.status).toBe(200);
    expect(shape(findById(list, id))).toMatchSnapshot("list item");
    const shown = await get(`/matches/batches/${id}`);
    expect(shape(shown.body.data)).toEqual(shape(findById(list, id)));
  });

  it("updates a batch", async () => {
    const id = await newBatch();
    const res = await put(`/matches/batches/${id}`, { status: "Completed", weekNumber: 4 }, a.organizer.token);
    expect(res.status).toBe(200);
    expect(res.body.data).toMatchObject({ status: "Completed", week_number: 4 });
    expect(shapeOf(res)).toMatchSnapshot();
  });

  it("deletes a batch (Super Admin only)", async () => {
    const id = await newBatch();
    expect((await del(`/matches/batches/${id}`, a.officer.token)).status).toBe(403);
    const res = await del(`/matches/batches/${id}`, a.admin.token);
    expect(shapeOf(res)).toMatchSnapshot();
    expect((await get(`/matches/batches/${id}`)).status).toBe(404);
  });

  it("returns 404 for unknown batches", async () => {
    const missing = "00000000-0000-4000-8000-000000000000";
    expect(shapeOf(await get(`/matches/batches/${missing}`))).toMatchSnapshot();
    expect((await put(`/matches/batches/${missing}`, { name: "x" }, a.admin.token)).status).toBe(404);
    expect((await del(`/matches/batches/${missing}`, a.admin.token)).status).toBe(404);
  });

  it.each(["club", "referee"] as const)("%s cannot write batches", async (who) => {
    const id = await newBatch();
    expect(shapeOf(await post("/matches/batches", fullBatch(), a[who].token))).toMatchSnapshot();
    expect((await put(`/matches/batches/${id}`, { name: "x" }, a[who].token)).status).toBe(403);
    expect((await post("/matches/batches", fullBatch())).status).toBe(401);
  });
});

describe("matches", () => {
  it("creates a match, deriving the event from the batch", async () => {
    const m = await newMatch({ refereeId: a.referee.id, judgeIds: ["j1", "j2"], sortOrder: 2 });
    expect(m).toMatchObject({
      event_id: eventId,
      rounds: 5,
      agreed_weight: 60.5,
      status: "Draft",
      proposal_status: "draft",
      club_a_response: "pending",
      judge_ids: ["j1", "j2"],
      referee_name: "Test Referee",
      date: "2026-10-08",
      isTitleMatch: false,
      sortOrder: 2,
      winner_id: null,
    });
    expect(m.fighter_a_name).toBeTypeOf("string");
    expect(m.club_b_name).toBeTypeOf("string");
    expect(shape(m)).toMatchSnapshot();
  });

  it("lists matches filtered by batch, in sort order", async () => {
    const first = await newMatch({ sortOrder: 5 });
    const subEventId = first.sub_event_id;
    const second = (
      await post("/matches", { subEventId, fighterAId: await newFighter(), fighterBId: await newFighter(), rounds: 3, roundTime: 120, knockdownLimit: 2, agreedWeight: 55, gloveSize: "8oz", gloveBrand: "Fairtex", sortOrder: 1 }, a.admin.token)
    ).body.data;

    const res = await get(`/matches?subEventId=${subEventId}`);
    expect(res.status).toBe(200);
    expect(res.body.data.map((m: any) => m.id)).toEqual([second.id, first.id]);
    expect(shape(findById(res, first.id))).toEqual(shape(first));
  });

  it("shows a match", async () => {
    const m = await newMatch();
    const res = await get(`/matches/${m.id}`);
    expect(res.status).toBe(200);
    expect(shapeOf(res)).toMatchSnapshot();
  });

  it("updates a match, accepting sortOrder or sort_order", async () => {
    const m = await newMatch();
    const res = await put(`/matches/${m.id}`, { status: "Approved", fighterAConfirmed: true, sort_order: 9 }, a.organizer.token);
    expect(res.status).toBe(200);
    expect(res.body.data).toMatchObject({ status: "Approved", fighter_a_confirmed: true, sortOrder: 9 });
    expect(shapeOf(res)).toMatchSnapshot();
  });

  it("lets a Club/Gym user update only matches involving their club", async () => {
    const ours = await newMatch();
    expect((await put(`/matches/${ours.id}`, { clubAResponse: "accepted" }, a.club.token)).body.data.club_a_response).toBe("accepted");

    const theirs = await newMatch({ fighterAId: await newFighter(otherClubId) });
    const res = await put(`/matches/${theirs.id}`, { clubBResponse: "accepted" }, a.club.token);
    expect(shapeOf(res)).toMatchSnapshot();
    expect(res.status).toBe(403);
  });

  it("deletes a match (Super Admin only)", async () => {
    const m = await newMatch();
    expect((await del(`/matches/${m.id}`, a.officer.token)).status).toBe(403);
    const res = await del(`/matches/${m.id}`, a.admin.token);
    expect(shapeOf(res)).toMatchSnapshot();
    expect((await get(`/matches/${m.id}`)).status).toBe(404);
  });

  it("returns 404 for unknown matches", async () => {
    const missing = "00000000-0000-4000-8000-000000000000";
    expect(shapeOf(await get(`/matches/${missing}`))).toMatchSnapshot();
    expect((await put(`/matches/${missing}`, { status: "x" }, a.admin.token)).status).toBe(404);
    expect((await del(`/matches/${missing}`, a.admin.token)).status).toBe(404);
    expect((await post(`/matches/${missing}/result`, { method: "KO", round: 1 }, a.admin.token)).status).toBe(404);
  });

  it("enforces write permissions", async () => {
    const m = await newMatch();
    expect((await post("/matches", {}, a.club.token)).status).toBe(403);
    expect((await post("/matches", {}, a.referee.token)).status).toBe(403);
    expect((await put(`/matches/${m.id}`, { status: "x" }, a.referee.token)).status).toBe(403);
    expect((await post("/matches", {})).status).toBe(401);
  });
});

describe("match results", () => {
  it("records a win and recalculates both fighters' records", async () => {
    const m = await newMatch();
    const res = await post(`/matches/${m.id}/result`, { winnerId: m.fighter_a_id, method: "KO", round: 2, duration: "1:45" }, a.officer.token);
    expect(res.status).toBe(200);
    expect(res.body.data).toMatchObject({ status: "Completed", winner_id: m.fighter_a_id, winner_method: "KO", winner_round: 2, winner_duration: "1:45" });
    expect(shapeOf(res)).toMatchSnapshot();
    expect(await recordOf(m.fighter_a_id)).toBe("1-0-0");
    expect(await recordOf(m.fighter_b_id)).toBe("0-1-0");
  });

  it("records a draw when there is no winner", async () => {
    const m = await newMatch();
    const res = await post(`/matches/${m.id}/result`, { winnerId: "", method: "Decision", round: 5 }, a.officer.token);
    expect(res.body.data).toMatchObject({ status: "Completed", winner_id: null, winner_method: "Decision" });
    expect(await recordOf(m.fighter_a_id)).toBe("0-0-1");
    expect(await recordOf(m.fighter_b_id)).toBe("0-0-1");
  });

  it("overwrites an earlier result for the same match", async () => {
    const m = await newMatch();
    await post(`/matches/${m.id}/result`, { winnerId: m.fighter_a_id, method: "KO", round: 1 }, a.officer.token);
    const res = await post(`/matches/${m.id}/result`, { winnerId: m.fighter_b_id, method: "TKO", round: 3 }, a.officer.token);
    expect(res.body.data).toMatchObject({ winner_id: m.fighter_b_id, winner_method: "TKO" });
    expect(await recordOf(m.fighter_a_id)).toBe("0-1-0");
    expect(await recordOf(m.fighter_b_id)).toBe("1-0-0");
  });

  it.each(["organizer", "club", "referee"] as const)("%s cannot record results", async (who) => {
    const m = await newMatch();
    const res = await post(`/matches/${m.id}/result`, { winnerId: m.fighter_a_id, method: "KO", round: 1 }, a[who].token);
    expect(shapeOf(res)).toMatchSnapshot();
    expect(res.status).toBe(403);
  });
});

describe("title matches update the championship registry", () => {
  async function newTitle(holderId: string | null = null) {
    const res = await post("/champions", { titleName: `Title ${uniq()}`, championType: "National", weightClass: 60, currentHolderId: holderId, status: holderId ? "Active" : "Vacant" }, a.admin.token);
    return res.body.data.id as string;
  }

  it("crowns the winner of a vacant title", async () => {
    const championshipId = await newTitle();
    const m = await newMatch({ isTitleMatch: true, championshipId });
    await post(`/matches/${m.id}/result`, { winnerId: m.fighter_a_id, method: "KO", round: 3 }, a.officer.token);

    const c = (await get(`/champions/${championshipId}`)).body.data;
    expect(c).toMatchObject({ current_holder_id: m.fighter_a_id, status: "Active", defense_count: 0, winning_match_id: m.id });
    expect(c.defenses).toHaveLength(1);
    expect(c.defenses[0]).toMatchObject({ result: "Crowned New Champion", opponent_id: m.fighter_b_id, match_id: m.id, method: "KO", round: 3 });
  });

  it("counts a successful defense", async () => {
    const holder = await newFighter();
    const championshipId = await newTitle(holder);
    const m = await newMatch({ fighterAId: holder, isTitleMatch: true, championshipId });
    await post(`/matches/${m.id}/result`, { winnerId: holder, method: "Decision", round: 5 }, a.officer.token);

    const c = (await get(`/champions/${championshipId}`)).body.data;
    expect(c).toMatchObject({ current_holder_id: holder, defense_count: 1, last_defense_date: expect.stringMatching(/^2026-10-08/) });
    expect(c.defenses.map((d: any) => d.result)).toEqual(["Won"]);
  });

  it("transfers the title when the champion loses", async () => {
    const holder = await newFighter();
    const championshipId = await newTitle(holder);
    const m = await newMatch({ fighterAId: holder, isTitleMatch: true, championshipId });
    await post(`/matches/${m.id}/result`, { winnerId: m.fighter_b_id, method: "TKO", round: 4 }, a.officer.token);

    const c = (await get(`/champions/${championshipId}`)).body.data;
    expect(c).toMatchObject({ current_holder_id: m.fighter_b_id, defense_count: 0, last_defense_date: null });
    expect(c.defenses.map((d: any) => d.result)).toEqual(["Lost"]);
  });

  it("leaves a vacant title vacant after a draw", async () => {
    const championshipId = await newTitle();
    const m = await newMatch({ isTitleMatch: true, championshipId });
    await post(`/matches/${m.id}/result`, { winnerId: "", method: "Decision", round: 5 }, a.officer.token);
    const c = (await get(`/champions/${championshipId}`)).body.data;
    expect(c).toMatchObject({ current_holder_id: null, status: "Vacant" });
    expect(c.defenses).toEqual([]);
  });

  // The Laravel backend re-ran the championship logic on every submission,
  // logging a second defense and double counting; fixed in the Node.js backend.
  it("does not double count when a title result is re-submitted", async () => {
    const holder = await newFighter();
    const championshipId = await newTitle(holder);
    const m = await newMatch({ fighterAId: holder, isTitleMatch: true, championshipId });
    const result = { winnerId: holder, method: "Decision", round: 5 };
    await post(`/matches/${m.id}/result`, result, a.officer.token);
    await post(`/matches/${m.id}/result`, result, a.officer.token);

    const c = (await get(`/champions/${championshipId}`)).body.data;
    expect(c.defense_count).toBe(1);
    expect(c.defenses).toHaveLength(1);
  });
});
