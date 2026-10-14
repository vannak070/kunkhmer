/** Protecting against duplicate fighters: one ID number per fighter, and merging two records (claude/updates/fighter-id-merge.md). */
import { beforeAll, describe, expect, it } from "vitest";
import { type Actors, del, get, post, put, setupActors, shapeOf, uniq } from "./helpers";

let a: Actors;
beforeAll(async () => {
  a = await setupActors();
});

const fighter = async (extra: Record<string, unknown> = {}) =>
  (await post("/fighters", { name: `Merge Fighter ${uniq()}`, nameKhmer: `គុន ${uniq()}`, dateOfBirth: "2000-01-01", gender: "Male", currentWeight: 60, height: 170, grade: "B", status: "Active", ...extra }, a.admin.token)).body.data as any;
const rules = { rounds: 3, roundTime: 3, knockdownLimit: 3, agreedWeight: 60, gloveSize: "10oz", gloveBrand: "Boon" };
// Each bout on its own match a month apart (KKF rest days between a fighter's bouts).
let month = 0;
const bout = async (red: string, blue: string) => {
  const date = `2027-${String(1 + (month++ % 12)).padStart(2, "0")}-10`;
  const ev = (await post("/events", { name: `Merge Event ${uniq()}`, date, startTime: "19:00", location: "Phnom Penh", status: "Published" }, a.admin.token)).body.data.id;
  const card = (await post("/matches/batches", { eventId: ev, name: `Card ${uniq()}`, weekNumber: 1, date, location: "Studio" }, a.admin.token)).body.data.id;
  const res = await post("/matches", { subEventId: card, fighterAId: red, fighterBId: blue, ...rules }, a.admin.token);
  if (res.status !== 200) throw new Error(JSON.stringify(res.body));
  return res.body.data as any;
};
const result = (id: string, winnerId: string) => post(`/matches/${id}/result`, { winnerId, method: "Decision", round: 3 }, a.officer.token);
const idCheck = (n: string, token: string, exceptId?: string) => get(`/fighters/private/id-check?number=${encodeURIComponent(n)}${exceptId ? `&excludeId=${exceptId}` : ""}`, token);

describe("one ID number per fighter", () => {
  it("refuses an ID number already registered for another fighter, ignoring spaces, dashes and case", async () => {
    const one = await fighter();
    const two = await fighter();
    const number = `KH-${uniq()}`.toUpperCase();
    expect((await put(`/fighters/${one.id}/private`, { idNumber: number }, a.officer.token)).status).toBe(200);

    const dup = await put(`/fighters/${two.id}/private`, { idNumber: ` ${number.toLowerCase().replace("-", " ")} ` }, a.officer.token);
    expect(dup.status).toBe(422);
    expect(dup.body.error).toContain(one.name);
    // Saving the same number again on its own fighter is fine.
    expect((await put(`/fighters/${one.id}/private`, { idNumber: number, phone: "012 000 000" }, a.officer.token)).status).toBe(200);

    const check = await idCheck(number.replace("-", ""), a.officer.token);
    expect(check.status).toBe(200);
    expect(check.body.data).toEqual({ taken: true, fighter: { id: one.id, name: one.name, nameKhmer: one.nameKhmer ?? "គុន" } });
    expect(shapeOf(check)).toMatchSnapshot("taken");
    expect((await idCheck(number, a.officer.token, one.id)).body.data).toEqual({ taken: false, fighter: null });
    expect((await idCheck(`NEW-${uniq()}`, a.officer.token)).body.data).toEqual({ taken: false, fighter: null });
    expect((await idCheck("ab", a.officer.token)).body.data.taken).toBe(false);
  });

  it("frees the number once the fighter is deleted, and the check is for KKF staff only", async () => {
    const one = await fighter();
    const number = `DEL${uniq()}`;
    await put(`/fighters/${one.id}/private`, { idNumber: number }, a.officer.token);
    expect((await idCheck(number, a.officer.token)).body.data.taken).toBe(true);
    expect((await del(`/fighters/${one.id}`, a.admin.token)).status).toBe(200);
    expect((await idCheck(number, a.officer.token)).body.data.taken).toBe(false);

    for (const actor of [a.organizer, a.club, a.referee]) expect((await idCheck(number, actor.token)).status).toBe(403);
    expect((await get(`/fighters/private/id-check?number=${number}`)).status).toBe(401);
  });
});

describe("merging two fighters", () => {
  it("previews and moves bouts, results, titles, follows and private details to the fighter kept, then removes the duplicate", async () => {
    const keep = await fighter();
    const dup = await fighter({ name: `${"Merge Dup"} ${uniq()}` });
    const opp1 = await fighter();
    const opp2 = await fighter();
    const b1 = await bout(dup.id, opp1.id);
    await result(b1.id, dup.id);
    const b2 = await bout(opp2.id, dup.id);
    await result(b2.id, opp2.id);
    const b3 = await bout(keep.id, opp1.id);
    await result(b3.id, keep.id);
    await put(`/fighters/${dup.id}/private`, { idNumber: `MRG${uniq()}`, phone: "011 111 111" }, a.officer.token);
    const title = (await post("/champions", { titleName: `Merge Title ${uniq()}`, championType: "National", weightClass: 60, currentHolderId: dup.id, currentHolderName: dup.name, status: "Active" }, a.officer.token)).body.data;

    const fan = (await post("/fans/register", { email: `fan_${uniq()}@test.local`, password: "correct horse 1", displayName: "Fan" })).body.data.token;
    await put(`/fans/me/follows/${dup.id}`, {}, fan);
    await put(`/fans/me/follows/${keep.id}`, {}, fan);

    const preview = await get(`/fighters/${dup.id}/merge-preview?intoId=${keep.id}`, a.officer.token);
    expect(preview.status).toBe(200);
    expect(preview.body.data).toMatchObject({ remove: { id: dup.id }, keep: { id: keep.id }, moves: { bouts: 2, results: 1, titles: 1, follows: 1, privateDetails: true }, blocked: null });
    expect(shapeOf(preview)).toMatchSnapshot("preview");

    const merged = await post(`/fighters/${dup.id}/merge`, { intoId: keep.id }, a.officer.token);
    expect(merged.status).toBe(200);
    expect(merged.body.data).toMatchObject({ kept: { id: keep.id, record: "2-1-0" }, removed: { id: dup.id }, moves: { bouts: 2 } });
    expect(shapeOf(merged)).toMatchSnapshot("merged");

    expect((await get(`/fighters/${dup.id}`, a.admin.token)).status).toBe(404);
    const m1 = (await get(`/matches/${b1.id}`, a.admin.token)).body.data;
    expect(m1).toMatchObject({ fighter_a_id: keep.id, winner_id: keep.id });
    expect((await get(`/matches/${b2.id}`, a.admin.token)).body.data.fighter_b_id).toBe(keep.id);
    expect((await get(`/champions/${title.id}`, a.admin.token)).body.data.current_holder_id).toBe(keep.id);
    expect((await get(`/fighters/${keep.id}/private`, a.officer.token)).body.data.phone).toBe("011 111 111");
    const follows = (await get("/fans/me/follows", fan)).body.data as any[];
    expect(follows.filter((f) => (f.id ?? f.fighterId) === keep.id)).toHaveLength(1);
  });

  it("refuses fighters who fought each other, the same fighter, missing ones, and is for KKF staff only", async () => {
    const x = await fighter();
    const y = await fighter();
    await bout(x.id, y.id);
    expect((await get(`/fighters/${x.id}/merge-preview?intoId=${y.id}`, a.officer.token)).body.data.blocked).toBe("fought_each_other");
    expect((await post(`/fighters/${x.id}/merge`, { intoId: y.id }, a.officer.token)).status).toBe(422);
    expect((await post(`/fighters/${x.id}/merge`, { intoId: x.id }, a.officer.token)).status).toBe(422);
    expect((await post(`/fighters/${x.id}/merge`, {}, a.officer.token)).status).toBe(422);
    expect((await post(`/fighters/${x.id}/merge`, { intoId: "00000000-0000-4000-8000-000000000000" }, a.officer.token)).status).toBe(422);
    expect((await post(`/fighters/00000000-0000-4000-8000-000000000000/merge`, { intoId: y.id }, a.officer.token)).status).toBe(404);

    const z = await fighter();
    for (const actor of [a.organizer, a.club, a.referee]) {
      expect((await post(`/fighters/${z.id}/merge`, { intoId: y.id }, actor.token)).status).toBe(403);
      expect((await get(`/fighters/${z.id}/merge-preview?intoId=${y.id}`, actor.token)).status).toBe(403);
    }
    expect((await post(`/fighters/${z.id}/merge`, { intoId: y.id })).status).toBe(401);
  });
});
