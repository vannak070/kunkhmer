/** Sheet like KKF's paper (claude/updates/sheet-like-paper-week-print.md): more bout types, own wording, kick boxing, draw names. */
import { beforeAll, describe, expect, it } from "vitest";
import { type Actors, post, put, setupActors, uniq } from "./helpers";

let a: Actors;
let card: string;
beforeAll(async () => {
  a = await setupActors();
  const eventId = (await post("/events", { name: `Sheet Event ${uniq()}`, date: "2027-02-20", startTime: "19:00", location: "Phnom Penh", status: "Published" }, a.admin.token)).body.data.id;
  card = (await post("/matches/batches", { eventId, name: "Card", weekNumber: 1, date: "2027-02-20", location: "Studio" }, a.admin.token)).body.data.id;
});

const fighter = async () =>
  (await post("/fighters", { name: `Sheet Fighter ${uniq()}`, nameKhmer: `គុន ${uniq()}`, dateOfBirth: "2000-01-01", gender: "Male", currentWeight: 60, height: 170, grade: "B" }, a.admin.token)).body.data.id as string;
const rules = { rounds: 3, roundTime: 3, knockdownLimit: 3, agreedWeight: 60, gloveSize: "10oz", gloveBrand: "Boon" };
const bout = (extra: Record<string, unknown>) => post("/matches", { subEventId: card, ...rules, ...extra }, a.admin.token);

describe("bout types and rule sets", () => {
  it("accepts the new bout types and kick boxing, and keeps the sheet's own wording", async () => {
    for (const boutLabel of ["title_fight", "title_defense", "points_belt", "cash_prize", "candidate"]) {
      const res = await bout({ boutLabel });
      expect(res.status).toBe(200);
      expect(res.body.data).toMatchObject({ bout_label: boutLabel, bout_label_text: null, draw_name: null });
    }
    for (const ruleSet of ["kick_boxing", "fingerless"]) {
      const res = await bout({ fighterAId: await fighter(), ruleSet });
      expect(res.body.data.rule_set).toBe(ruleSet);
    }

    const other = await bout({ boutLabel: "other", boutLabelText: "ការពារខ្សែក្រវាត់មាស" });
    expect(other.status).toBe(200);
    expect(other.body.data).toMatchObject({ bout_label: "other", bout_label_text: "ការពារខ្សែក្រវាត់មាស" });
    const changed = await put(`/matches/${other.body.data.id}`, { boutLabel: "friendly", boutLabelText: "" }, a.admin.token);
    expect(changed.body.data).toMatchObject({ bout_label: "friendly", bout_label_text: null });
  });

  it("refuses unknown types, 'other' without words and words that are too long", async () => {
    expect((await bout({ boutLabel: "exhibition" })).status).toBe(422);
    expect((await bout({ ruleSet: "boxing" })).status).toBe(422);
    expect((await bout({ boutLabel: "other" })).status).toBe(422);
    expect((await bout({ boutLabel: "other", boutLabelText: "x".repeat(121) })).status).toBe(422);
  });
});

describe("draw names", () => {
  it("puts the draw's name on every bout of the draw", async () => {
    const ids = [await fighter(), await fighter(), await fighter(), await fighter()];
    const res = await post(`/matches/batches/${card}/draw`, { fighterIds: ids, ...rules, finalLabel: "prize", name: "ដណ្តើមពាន និងប្រាក់លាន BOOSTRONG" }, a.admin.token);
    expect(res.status).toBe(201);
    expect(res.body.data.bouts).toHaveLength(3);
    for (const b of res.body.data.bouts) expect(b.draw_name).toBe("ដណ្តើមពាន និងប្រាក់លាន BOOSTRONG");

    const unnamed = await post(`/matches/batches/${card}/draw`, { fighterIds: [await fighter(), await fighter(), await fighter(), await fighter()], ...rules }, a.admin.token);
    expect(unnamed.body.data.bouts[0].draw_name).toBeNull();
    expect((await post(`/matches/batches/${card}/draw`, { fighterIds: [await fighter(), await fighter(), await fighter(), await fighter()], ...rules, name: "x".repeat(121) }, a.admin.token)).status).toBe(422);
  });
});
