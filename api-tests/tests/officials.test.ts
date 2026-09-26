/** Match officials (referees and judges): the register, and each official's own bouts. */
import { beforeAll, describe, expect, it } from "vitest";
import { type Actors, findById, get, login, post, put, setupActors, shape, shapeOf, uniq } from "./helpers";

let a: Actors;

beforeAll(async () => {
  a = await setupActors();
});

const newOfficial = (overrides: Record<string, unknown> = {}) => {
  const username = `official_${uniq()}`;
  return { username, fullName: "Test Official", email: `${username}@test.local`, password: "official password", role: "Judge", grade: "National A", since: 2015, ...overrides };
};

async function createOfficial(overrides: Record<string, unknown> = {}) {
  const input = newOfficial(overrides);
  const res = await post("/officials", input, a.admin.token);
  if (res.status !== 201) throw new Error(`official setup failed: ${JSON.stringify(res.body)}`);
  return { ...res.body.data, password: input.password } as { id: string; username: string; password: string };
}

/** A bout on a fight card dated `date`, with the given officials (assigned by KKF). */
async function boutOn(date: string, refereeId: string | null, judgeIds: string[]) {
  const eventId = (await post("/events", { name: `Officials Event ${uniq()}`, date, location: "Arena", status: "Published" }, a.admin.token)).body.data.id;
  const subEventId = (await post("/matches/batches", { eventId, name: `Card ${uniq()}`, weekNumber: 1, date, location: "Arena" }, a.admin.token)).body.data.id;
  const fighter = async () =>
    (await post("/fighters", { name: `Fighter ${uniq()}`, nameKhmer: "x", dateOfBirth: "2000-01-01", gender: "Male", currentWeight: 60, height: 170, status: "Active" }, a.admin.token)).body.data.id;
  const res = await post(
    "/matches",
    { subEventId, fighterAId: await fighter(), fighterBId: await fighter(), rounds: 5, roundTime: 3, knockdownLimit: 3, agreedWeight: 60, gloveSize: "8oz", gloveBrand: "Twins", refereeId, judgeIds },
    a.admin.token,
  );
  if (res.status !== 200) throw new Error(`bout setup failed: ${JSON.stringify(res.body)}`);
  return res.body.data;
}

describe("officials register", () => {
  it("lets KKF staff add a referee or judge with grade and year started", async () => {
    const input = newOfficial({ role: "Referee", grade: "International A", since: 2010 });
    const res = await post("/officials", input, a.officer.token);
    expect(res.status).toBe(201);
    expect(res.body.data).toMatchObject({ username: input.username, fullName: "Test Official", role: "Referee", status: "Active", grade: "International A", since: 2010, upcomingBouts: 0, boutsOnDate: null });
    expect(res.body.data.yearsExperience).toBe(new Date().getUTCFullYear() - 2010);
    expect(res.body.data).not.toHaveProperty("password_hash");
    expect(shapeOf(res)).toMatchSnapshot();
    // The account can sign in.
    expect(await login(input.username, input.password)).toBeTypeOf("string");
  });

  it("validates role, grade, year and password", async () => {
    const bad = async (overrides: Record<string, unknown>) => (await post("/officials", newOfficial(overrides), a.admin.token)).status;
    expect(await bad({ role: "Organizer" })).toBe(422);
    expect(await bad({ role: "Super Admin" })).toBe(422);
    expect(await bad({ grade: "Grand Master" })).toBe(422);
    expect(await bad({ since: 1900 })).toBe(422);
    expect(await bad({ since: new Date().getUTCFullYear() + 1 })).toBe(422);
    expect(await bad({ password: "short" })).toBe(422);
    const dup = newOfficial();
    await post("/officials", dup, a.admin.token);
    expect((await post("/officials", { ...dup, email: `other_${uniq()}@test.local` }, a.admin.token)).status).toBe(422);
  });

  it("lists officials for staff and organizers, filtered by role", async () => {
    const judge = await createOfficial();
    const list = await get("/officials", a.organizer.token);
    expect(list.status).toBe(200);
    expect(shape(findById(list, judge.id))).toMatchSnapshot();
    expect(list.body.data.every((o: any) => o.role === "Referee" || o.role === "Judge")).toBe(true);
    const referees = (await get("/officials?role=Referee", a.officer.token)).body.data;
    expect(referees.map((o: any) => o.id)).toContain(a.referee.id);
    expect(referees.map((o: any) => o.id)).not.toContain(judge.id);
  });

  it("counts each official's bouts on a fight night (busy) and upcoming", async () => {
    const judge = await createOfficial();
    await boutOn("2030-05-01", a.referee.id, [judge.id]);
    await boutOn("2030-05-01", null, [judge.id]);
    await boutOn("2030-05-08", null, [judge.id]);

    const list = await get("/officials?date=2030-05-01", a.officer.token);
    expect(findById(list, judge.id)).toMatchObject({ boutsOnDate: 2, upcomingBouts: 3 });
    expect(findById(list, a.referee.id).boutsOnDate).toBeGreaterThanOrEqual(1);
    expect((await get("/officials?date=not-a-date", a.officer.token)).status).toBe(422);
  });

  it("lets KKF staff edit an official, and deactivating signs them out", async () => {
    const judge = await createOfficial();
    const token = await login(judge.username, judge.password);
    const res = await put(`/officials/${judge.id}`, { grade: "International A", since: null, role: "Referee" }, a.officer.token);
    expect(res.status).toBe(200);
    expect(res.body.data).toMatchObject({ grade: "International A", since: null, yearsExperience: null, role: "Referee" });

    await put(`/officials/${judge.id}`, { status: "Inactive" }, a.officer.token);
    expect((await get("/users/me", token)).status).toBe(401);
    expect((await post("/users/login", { username: judge.username, password: judge.password })).status).not.toBe(200);
  });

  it("only edits referees and judges", async () => {
    const res = await put(`/officials/${a.organizer.id}`, { grade: "National B" }, a.admin.token);
    expect(shapeOf(res)).toMatchSnapshot();
    expect(res.status).toBe(404);
    expect((await put(`/officials/${a.referee.id}`, { role: "Super Admin" }, a.admin.token)).status).toBe(422);
    expect((await put(`/officials/${a.referee.id}`, { status: "Suspended" }, a.admin.token)).status).toBe(422);
  });

  it("is managed by KKF staff only", async () => {
    const judge = await createOfficial();
    for (const who of ["organizer", "club", "referee"] as const) {
      expect((await post("/officials", newOfficial(), a[who].token)).status).toBe(403);
      expect((await put(`/officials/${judge.id}`, { grade: "National B" }, a[who].token)).status).toBe(403);
    }
    const res = await get("/officials", a.club.token);
    expect(shapeOf(res)).toMatchSnapshot();
    expect(res.status).toBe(403);
    expect((await get("/officials", a.referee.token)).status).toBe(403);
    expect((await get("/officials")).status).toBe(401);
  });
});

describe("my bouts", () => {
  it("shows a referee or judge the bouts they're assigned to, with their role", async () => {
    const judge = await createOfficial();
    const judgeToken = await login(judge.username, judge.password);
    const refereed = await boutOn("2030-06-01", a.referee.id, [judge.id]);
    const judgedOnly = await boutOn("2030-06-08", null, [judge.id]);
    await boutOn("2030-06-15", null, []);

    const mine = await get("/officials/me/bouts", judgeToken);
    expect(mine.status).toBe(200);
    expect(mine.body.data.map((b: any) => b.id)).toEqual([refereed.id, judgedOnly.id]);
    expect(mine.body.data[0]).toMatchObject({ my_role: "Judge", event_location: "Arena", event_status: "Published" });
    expect(mine.body.data[0].event_name).toMatch(/^Officials Event/);
    expect(shape(mine.body.data[0])).toMatchSnapshot();

    const refs = (await get("/officials/me/bouts", a.referee.token)).body.data;
    expect(refs.find((b: any) => b.id === refereed.id)).toMatchObject({ my_role: "Referee" });
    expect(refs.map((b: any) => b.id)).not.toContain(judgedOnly.id);
  });

  it("is only for referees and judges", async () => {
    for (const who of ["admin", "organizer", "club"] as const) {
      expect((await get("/officials/me/bouts", a[who].token)).status).toBe(403);
    }
    expect((await get("/officials/me/bouts")).status).toBe(401);
  });
});
