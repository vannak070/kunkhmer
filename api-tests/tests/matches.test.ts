/** Batches (sub-events), matches, and recording match results. */
import { beforeAll, describe, expect, it } from "vitest";
import { type Actors, del, findById, get, post, put, setupActors, shape, shapeOf, uniq } from "./helpers";

let a: Actors;
let eventId: string;
let otherClubId: string;
let judges: string[];

beforeAll(async () => {
  a = await setupActors();
  // Published so its fight cards and bouts are publicly readable, and run by the
  // test organizer (organizers only work on their own events).
  eventId = (await post("/events", { name: `Match Event ${uniq()}`, date: "2026-10-01", location: "Phnom Penh", status: "Published" }, a.admin.token)).body.data.id;
  await put(`/events/${eventId}`, { organizerId: a.organizer.id }, a.admin.token);
  otherClubId = (await post("/clubs", { name: `Other Club ${uniq()}` }, a.admin.token)).body.data.id;
  judges = [];
  for (let i = 0; i < 2; i++) {
    const username = `judge_${uniq()}`;
    const res = await post("/officials", { username, fullName: `Judge ${i + 1}`, email: `${username}@test.local`, password: "judge password", role: "Judge" }, a.admin.token);
    judges.push(res.body.data.id);
  }
});

async function newFighter(clubId: string | null = a.clubId) {
  const res = await post(
    "/fighters",
    // Only KKF-verified (Active) fighters can be matched.
    { name: `Fighter ${uniq()}`, nameKhmer: "x", dateOfBirth: "2000-01-01", gender: "Male", currentWeight: 60, height: 170, clubId, grade: "B", image: "https://example.com/f.png", status: "Active" },
    a.admin.token,
  );
  return res.body.data.id as string;
}

async function draftFighter() {
  const res = await post(
    "/fighters",
    { name: `Unverified ${uniq()}`, nameKhmer: "x", dateOfBirth: "2000-01-01", gender: "Male", currentWeight: 60, height: 170, clubId: a.clubId },
    a.club.token,
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

/**
 * Creates a bout between our club's fighter and another club's. By default KKF
 * then accepts it for both clubs, so it is public like any agreed bout.
 */
async function newMatch(overrides: Record<string, unknown> = {}, { accept = true } = {}) {
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
  if (!accept) return res.body.data;
  const accepted = await post(`/matches/${res.body.data.id}/respond`, { response: "accepted" }, a.officer.token);
  if (accepted.status !== 200) throw new Error(`match accept failed: ${JSON.stringify(accepted.body)}`);
  return accepted.body.data;
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
    const m = await newMatch({ refereeId: a.referee.id, judgeIds: judges, sortOrder: 2 }, { accept: false });
    expect(m).toMatchObject({
      event_id: eventId,
      rounds: 5,
      agreed_weight: 60.5,
      status: "Draft",
      // Approvals are off: KKF staff creating a bout confirm both sides at once
      // (claude/updates/officer-run-program.md); proposal fields sent by the client are ignored.
      proposal_status: "accepted",
      club_a_response: "accepted",
      club_b_response: "accepted",
      club_a_responded_by: a.admin.id,
      club_b_responded_by: a.admin.id,
      judge_ids: judges,
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
    await post(`/matches/${second.id}/respond`, { response: "accepted" }, a.officer.token);

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

  it("doesn't let a Club/Gym user edit a match (they answer through /respond)", async () => {
    const ours = await newMatch({}, { accept: false });
    const res = await put(`/matches/${ours.id}`, { clubAResponse: "accepted", winnerId: ours.fighter_a_id }, a.club.token);
    expect(shapeOf(res)).toMatchSnapshot();
    expect(res.status).toBe(403);
    // Organizers can't set club answers through a plain update either.
    const updated = await put(`/matches/${ours.id}`, { clubAResponse: "declined", proposalStatus: "declined" }, a.organizer.token);
    expect(updated.body.data).toMatchObject({ club_a_response: "accepted", proposal_status: "accepted" });
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

describe("correcting a title fight result", () => {
  async function newTitle(holderId: string | null = null) {
    const res = await post("/champions", { titleName: `Title ${uniq()}`, championType: "National", weightClass: 60, currentHolderId: holderId, status: holderId ? "Active" : "Vacant" }, a.admin.token);
    return res.body.data.id as string;
  }
  const batchOn = async (date: string) => (await post("/matches/batches", { ...fullBatch(), date }, a.organizer.token)).body.data.id as string;
  const result = (id: string, winnerId: string | null, method = "KO", round = 3) =>
    post(`/matches/${id}/result`, { winnerId: winnerId ?? "", method, round }, a.officer.token);
  const title = async (id: string) => (await get(`/champions/${id}`)).body.data;

  it("moves a vacant title to the corrected winner", async () => {
    const championshipId = await newTitle();
    const m = await newMatch({ isTitleMatch: true, championshipId });
    await result(m.id, m.fighter_a_id);
    await result(m.id, m.fighter_b_id, "TKO", 2);

    const c = await title(championshipId);
    expect(c).toMatchObject({ current_holder_id: m.fighter_b_id, status: "Active", defense_count: 0, winning_match_id: m.id });
    expect(c.defenses).toHaveLength(1);
    expect(c.defenses[0]).toMatchObject({ result: "Crowned New Champion", opponent_id: m.fighter_a_id, method: "TKO", round: 2 });
    expect(await recordOf(m.fighter_a_id)).toBe("0-1-0");
    expect(await recordOf(m.fighter_b_id)).toBe("1-0-0");
  });

  it("gives the title back when the champion's loss is corrected to a win", async () => {
    const holder = await newFighter();
    const championshipId = await newTitle(holder);
    const m = await newMatch({ fighterAId: holder, isTitleMatch: true, championshipId });
    await result(m.id, m.fighter_b_id);
    expect((await title(championshipId)).current_holder_id).toBe(m.fighter_b_id);

    await result(m.id, holder, "Decision", 5);
    const c = await title(championshipId);
    expect(c).toMatchObject({ current_holder_id: holder, defense_count: 1, last_defense_date: expect.stringMatching(/^2026-10-08/) });
    expect(c.defenses.map((d: any) => d.result)).toEqual(["Won"]);
  });

  it("keeps the title with the champion when a loss is corrected to a draw", async () => {
    const holder = await newFighter();
    const championshipId = await newTitle(holder);
    const m = await newMatch({ fighterAId: holder, isTitleMatch: true, championshipId });
    await result(m.id, m.fighter_b_id);
    await result(m.id, null, "Draw", 5);

    const c = await title(championshipId);
    expect(c).toMatchObject({ current_holder_id: holder, status: "Active", defense_count: 0, last_defense_date: null });
    expect(c.defenses).toEqual([]);
  });

  it("replays later title fights for the belt, in order", async () => {
    const champ = await newFighter();
    const challenger = await newFighter();
    const championshipId = await newTitle(champ);
    const first = await newMatch({ subEventId: await batchOn("2026-10-08"), fighterAId: champ, fighterBId: challenger, isTitleMatch: true, championshipId });
    const second = await newMatch({ subEventId: await batchOn("2026-10-15"), fighterAId: challenger, isTitleMatch: true, championshipId });
    await result(first.id, challenger); // challenger takes the belt
    await result(second.id, challenger); // and defends it
    expect(await title(championshipId)).toMatchObject({ current_holder_id: challenger, defense_count: 1 });

    // Fight 1 corrected: the champion won. Fight 2 no longer involves the champion → no change.
    await result(first.id, champ);
    let c = await title(championshipId);
    expect(c).toMatchObject({ current_holder_id: champ, defense_count: 1, winning_match_id: first.id, last_defense_date: expect.stringMatching(/^2026-10-08/) });
    expect(c.defenses.map((d: any) => [d.match_id, d.result])).toEqual([[first.id, "Won"]]);

    // Corrected back: the challenger's win and later defense both count again.
    await result(first.id, challenger);
    c = await title(championshipId);
    expect(c).toMatchObject({ current_holder_id: challenger, defense_count: 1, winning_match_id: second.id });
    expect(c.defenses.map((d: any) => [d.match_id, d.result])).toEqual([[first.id, "Lost"], [second.id, "Won"]]);
    expect(await recordOf(challenger)).toBe("2-0-0");
    expect(await recordOf(champ)).toBe("0-1-0");
  });
});

describe("matching rules", () => {
  it("won't match a fighter KKF hasn't verified", async () => {
    const batch = await post("/matches/batches", { eventId, name: `Week ${uniq()}`, weekNumber: 9, date: "2026-10-20", location: "Arena" }, a.admin.token);
    const res = await post(
      "/matches",
      { subEventId: batch.body.data.id, fighterAId: await newFighter(), fighterBId: await draftFighter(), rounds: 5, roundTime: 3, knockdownLimit: 3, agreedWeight: 60, gloveSize: "8oz", gloveBrand: "Twins" },
      a.admin.token,
    );
    expect(res.status).toBe(422);
    expect(res.body.error).toMatch(/must be verified by KKF/);
  });

  it("hides fight cards and bouts of unpublished events from the public", async () => {
    const draftEvent = (await post("/events", { name: `Draft ${uniq()}`, date: "2026-12-12", location: "Arena" }, a.admin.token)).body.data.id;
    const batch = (await post("/matches/batches", { eventId: draftEvent, name: `Week ${uniq()}`, weekNumber: 1, date: "2026-12-12", location: "Arena" }, a.admin.token)).body.data;
    expect((await get(`/matches/batches/${batch.id}`)).status).toBe(404);
    expect((await get("/matches/batches")).body.data.map((b: any) => b.id)).not.toContain(batch.id);
    expect((await get(`/matches/batches/${batch.id}`, a.officer.token)).status).toBe(200);
  });
});

describe("match proposals (club confirmation)", () => {
  const respond = (id: string, body: Record<string, unknown>, token: string) => post(`/matches/${id}/respond`, body, token);

  it("confirms a new bout at once and shows it publicly (approvals off)", async () => {
    const m = await newMatch({}, { accept: false });
    expect(m).toMatchObject({ proposal_status: "accepted", club_a_responded_by: a.admin.id, club_b_responded_by: a.admin.id });
    expect(m.club_a_responded_at).toMatch(/Z$/);
    expect((await get(`/matches/${m.id}`)).status).toBe(200);
    expect((await get(`/matches?subEventId=${m.sub_event_id}`)).body.data.map((x: any) => x.id)).toContain(m.id);

    // The dormant club answer still records who answered (e.g. KKF after a phone call).
    const res = await respond(m.id, { response: "accepted", side: "b" }, a.officer.token);
    expect(res.body.data).toMatchObject({ club_b_response: "accepted", club_b_responder_name: "Test KKF Officer", proposal_status: "accepted" });
    expect(shapeOf(res)).toMatchSnapshot();
  });

  it("needs a reason to decline, and a fighter swap confirms that side again (approvals off)", async () => {
    const m = await newMatch({}, { accept: false });
    expect((await respond(m.id, { response: "declined" }, a.club.token)).status).toBe(422);
    const res = await respond(m.id, { response: "declined", note: "Fighter injured" }, a.club.token);
    expect(res.body.data).toMatchObject({ proposal_status: "declined", club_a_response: "declined", club_a_note: "Fighter injured" });

    const swapped = await put(`/matches/${m.id}`, { fighterAId: await newFighter() }, a.organizer.token);
    expect(swapped.status).toBe(200);
    expect(swapped.body.data).toMatchObject({ proposal_status: "accepted", club_a_response: "accepted", club_a_note: null, club_a_responded_by: a.organizer.id });

    // Only verified fighters can be swapped in.
    expect((await put(`/matches/${m.id}`, { fighterAId: await draftFighter() }, a.organizer.token)).status).toBe(422);
  });

  it("lets a club answer only its own side", async () => {
    const theirs = await newMatch({ fighterAId: await newFighter(otherClubId) }, { accept: false });
    const res = await respond(theirs.id, { response: "accepted" }, a.club.token);
    expect(shapeOf(res)).toMatchSnapshot();
    expect(res.status).toBe(403);

    const ours = await newMatch({}, { accept: false });
    expect((await respond(ours.id, { response: "accepted", side: "b" }, a.club.token)).status).toBe(403);
    expect((await respond(ours.id, { response: "maybe" }, a.club.token)).status).toBe(422);
    expect((await respond(ours.id, { response: "accepted", side: "c" }, a.officer.token)).status).toBe(422);
    for (const who of ["organizer", "referee"] as const) {
      expect((await respond(ours.id, { response: "accepted" }, a[who].token)).status).toBe(403);
    }
    expect((await respond(ours.id, { response: "accepted" }, "")).status).toBe(401);
    expect((await respond("00000000-0000-4000-8000-000000000000", { response: "accepted" }, a.officer.token)).status).toBe(404);
  });

  it("covers both sides with one answer when both fighters are from the same club", async () => {
    const m = await newMatch({ fighterBId: await newFighter() }, { accept: false });
    const res = await respond(m.id, { response: "accepted" }, a.club.token);
    expect(res.body.data).toMatchObject({ club_a_response: "accepted", club_b_response: "accepted", proposal_status: "accepted" });
  });

  it("accepts a side automatically when its fighter has no club", async () => {
    const m = await newMatch({ fighterAId: await newFighter(null), fighterBId: await newFighter(null) }, { accept: false });
    expect(m).toMatchObject({ proposal_status: "accepted", club_a_response: "accepted", club_b_response: "accepted", club_a_responded_by: a.admin.id });
    expect((await get(`/matches/${m.id}`)).status).toBe(200);
  });

  it("can't be answered once the bout has a result", async () => {
    const m = await newMatch({}, { accept: false });
    await post(`/matches/${m.id}/result`, { winnerId: m.fighter_a_id, method: "KO", round: 1 }, a.officer.token);
    expect((await respond(m.id, { response: "declined", note: "late" }, a.club.token)).status).toBe(422);
    // A decided bout is public even though the clubs never answered.
    expect((await get(`/matches/${m.id}`)).status).toBe(200);
  });

  it("lists proposals: a club sees bouts with its fighters, staff see all", async () => {
    const ours = await newMatch({}, { accept: false });
    const theirs = await newMatch({ fighterAId: await newFighter(otherClubId) }, { accept: false });

    const club = await get("/matches/proposals?state=accepted", a.club.token);
    expect(club.status).toBe(200);
    const ids = club.body.data.map((m: any) => m.id);
    expect(ids).toContain(ours.id);
    expect(ids).not.toContain(theirs.id);
    expect(findById(club, ours.id)).toMatchObject({ event_name: expect.stringMatching(/^Match Event/), event_status: "Published" });
    expect(shape(findById(club, ours.id))).toMatchSnapshot();

    const staff = (await get("/matches/proposals?state=accepted", a.organizer.token)).body.data.map((m: any) => m.id);
    expect(staff).toEqual(expect.arrayContaining([ours.id, theirs.id]));
    expect((await get("/matches/proposals?state=declined", a.club.token)).body.data.map((m: any) => m.id)).not.toContain(ours.id);
    expect((await get("/matches/proposals", a.referee.token)).status).toBe(403);
    expect((await get("/matches/proposals")).status).toBe(401);
  });
});

describe("organizers work only on their own events", () => {
  let othersEvent: string;
  beforeAll(async () => {
    // An event the test organizer doesn't run.
    othersEvent = (await post("/events", { name: `Other Organizer ${uniq()}`, date: "2026-10-15", location: "Siem Reap" }, a.admin.token)).body.data.id;
  });

  it("can't add or edit fight cards in another organizer's event", async () => {
    const res = await post("/matches/batches", { ...fullBatch(), eventId: othersEvent }, a.organizer.token);
    expect(shapeOf(res)).toMatchSnapshot();
    expect(res.status).toBe(403);
    const theirCard = (await post("/matches/batches", { ...fullBatch(), eventId: othersEvent }, a.officer.token)).body.data.id;
    expect((await put(`/matches/batches/${theirCard}`, { name: "Mine now" }, a.organizer.token)).status).toBe(403);
    // Nor move their own card into someone else's event.
    expect((await put(`/matches/batches/${await newBatch()}`, { eventId: othersEvent }, a.organizer.token)).status).toBe(403);
  });

  it("can't add or edit bouts in another organizer's event", async () => {
    const theirCard = (await post("/matches/batches", { ...fullBatch(), eventId: othersEvent }, a.officer.token)).body.data.id;
    const bout = { subEventId: theirCard, fighterAId: await newFighter(), fighterBId: await newFighter(otherClubId), rounds: 5, roundTime: 3, knockdownLimit: 3, agreedWeight: 60, gloveSize: "8oz", gloveBrand: "Twins" };
    expect((await post("/matches", bout, a.organizer.token)).status).toBe(403);
    const theirs = (await post("/matches", bout, a.officer.token)).body.data;
    expect((await put(`/matches/${theirs.id}`, { rounds: 3 }, a.organizer.token)).status).toBe(403);
    // Nor move one of their own bouts onto someone else's card.
    const ours = await newMatch({}, { accept: false });
    expect((await put(`/matches/${ours.id}`, { subEventId: theirCard }, a.organizer.token)).status).toBe(403);
  });
});

describe("referees and judges", () => {
  it("are assigned by KKF staff only", async () => {
    const m = await newMatch({}, { accept: false });
    const res = await put(`/matches/${m.id}`, { refereeId: a.referee.id }, a.organizer.token);
    expect(shapeOf(res)).toMatchSnapshot();
    expect(res.status).toBe(403);
    expect((await post("/matches", { subEventId: m.sub_event_id, fighterAId: await newFighter(), fighterBId: await newFighter(otherClubId), rounds: 5, roundTime: 3, knockdownLimit: 3, agreedWeight: 60, gloveSize: "8oz", gloveBrand: "Twins", judgeIds: judges }, a.organizer.token)).status).toBe(403);
    // Sending the unchanged (empty) officials is fine for an organizer.
    expect((await put(`/matches/${m.id}`, { refereeId: null, judgeIds: [], rounds: 3 }, a.organizer.token)).status).toBe(200);

    const assigned = await put(`/matches/${m.id}`, { refereeId: a.referee.id, judgeIds: judges }, a.officer.token);
    expect(assigned.body.data).toMatchObject({ referee_id: a.referee.id, judge_ids: judges, referee_name: "Test Referee" });
  });

  it("must be active officials in the right role, each listed once", async () => {
    const m = await newMatch({}, { accept: false });
    const assign = (body: Record<string, unknown>) => put(`/matches/${m.id}`, body, a.officer.token);
    expect((await assign({ refereeId: judges[0] })).status).toBe(422);
    expect((await assign({ refereeId: a.organizer.id })).status).toBe(422);
    expect((await assign({ judgeIds: [a.referee.id] })).status).toBe(422);
    expect((await assign({ judgeIds: [judges[0], judges[0]] })).status).toBe(422);
    expect((await assign({ judgeIds: ["not-a-uuid"] })).status).toBe(422);

    await put(`/officials/${judges[1]}`, { status: "Inactive" }, a.admin.token);
    const res = await assign({ judgeIds: [judges[1]] });
    expect(res.status).toBe(422);
    expect(res.body.error).toMatch(/active KKF judge/);
    await put(`/officials/${judges[1]}`, { status: "Active" }, a.admin.token);
  });
});
