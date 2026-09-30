/** Private fighter details (ID / KYC, emergency contact, medical): staff only, never public. */
import { createHash } from "node:crypto";
import { beforeAll, describe, expect, it } from "vitest";
import { API_URL, type Actors, get, post, put, setupActors, shapeOf, uniq } from "./helpers";

let a: Actors;
beforeAll(async () => {
  a = await setupActors();
});

const PNG_B64 = "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==";
const PDF = `data:application/pdf;base64,${Buffer.from("%PDF-1.4\n% test\n").toString("base64")}`;
const raw = (path: string, token?: string) =>
  fetch(API_URL + path, { headers: { Accept: "application/json", ...(token ? { Authorization: `Bearer ${token}` } : {}) } });

const newFighter = async (dateOfBirth = "2000-01-01") =>
  (await post("/fighters", { name: `Private ${uniq()}`, nameKhmer: "x", dateOfBirth, gender: "Male", currentWeight: 60, height: 170 }, a.admin.token)).body.data;

const FULL = {
  idType: "National ID",
  idNumber: `ID-${uniq()}`,
  idExpiry: "2031-05-01",
  phone: "012 345 678",
  email: "fighter@example.com",
  address: "Street 1, Phnom Penh",
  emergencyName: "Sok Chea",
  emergencyRelation: "Father",
  emergencyPhone: "097 123 4567",
  bloodType: "O+",
  lastMedicalCheck: "2026-08-20",
  medicalExpiry: "2027-08-20",
  medicalNotes: "None",
  consentGiven: true,
};

describe("private fighter details", () => {
  it("staff read an empty record with everything missing, then save and read it back", async () => {
    const f = await newFighter();
    const empty = await get(`/fighters/${f.id}/private`, a.officer.token);
    expect(empty.status).toBe(200);
    expect(empty.body.data).toMatchObject({ fighterId: f.id, idNumber: null, hasIdDocument: false, consentGiven: false, missing: ["id", "emergency", "medical"], needsGuardian: false });
    expect(shapeOf(empty)).toMatchSnapshot("empty");

    const saved = await put(`/fighters/${f.id}/private`, FULL, a.officer.token);
    expect(saved.status).toBe(200);
    expect(saved.body.data).toMatchObject({ ...FULL, consentGiven: true, missing: [], idExpired: false, medicalExpired: false });
    expect(shapeOf(saved)).toMatchSnapshot("saved");
    expect((await get(`/fighters/${f.id}/private`, a.admin.token)).body.data).toMatchObject({ idNumber: FULL.idNumber, emergencyPhone: FULL.emergencyPhone });
  });

  it("updates only the given fields and clears a field sent empty", async () => {
    const f = await newFighter();
    await put(`/fighters/${f.id}/private`, FULL, a.officer.token);
    const res = await put(`/fighters/${f.id}/private`, { phone: "", emergencyRelation: "Mother" }, a.officer.token);
    expect(res.body.data).toMatchObject({ phone: null, emergencyRelation: "Mother", idNumber: FULL.idNumber, emergencyName: FULL.emergencyName });
  });

  it("validates values", async () => {
    const f = await newFighter();
    for (const body of [{ email: "nope" }, { bloodType: "Z" }, { idNumber: "x".repeat(101) }, { idExpiry: "not a date" }, { idDocument: "http://example.com/scan.png" }, { medicalDocument: "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7" }]) {
      const res = await put(`/fighters/${f.id}/private`, body, a.officer.token);
      expect(res.status).toBe(422);
    }
    expect((await get(`/fighters/${"00000000-0000-4000-8000-000000000000"}/private`, a.officer.token)).status).toBe(404);
    expect((await put(`/fighters/not-a-uuid/private`, FULL, a.officer.token)).status).toBe(404);
  });

  it("flags expired documents and a missing guardian for under-18s; the summary lists only fighters with a gap", async () => {
    const adult = await newFighter();
    await put(`/fighters/${adult.id}/private`, { ...FULL, idExpiry: "2020-01-01", medicalExpiry: "2021-01-01" }, a.officer.token);
    const minorDob = `${new Date().getUTCFullYear() - 15}-06-15`;
    const minor = await newFighter(minorDob);
    const complete = await newFighter();
    await put(`/fighters/${complete.id}/private`, FULL, a.officer.token);
    await put(`/fighters/${minor.id}/private`, FULL, a.officer.token);

    expect((await get(`/fighters/${adult.id}/private`, a.officer.token)).body.data).toMatchObject({ idExpired: true, medicalExpired: true, needsGuardian: false });
    expect((await get(`/fighters/${minor.id}/private`, a.officer.token)).body.data).toMatchObject({ needsGuardian: true });
    await put(`/fighters/${minor.id}/private`, { guardianName: "Guardian", guardianPhone: "011 222 333" }, a.officer.token);
    expect((await get(`/fighters/${minor.id}/private`, a.officer.token)).body.data.needsGuardian).toBe(false);

    const summary = await get("/fighters/private-summary", a.officer.token);
    expect(summary.status).toBe(200);
    const ids = summary.body.data.map((x: any) => x.fighterId);
    expect(ids).toContain(adult.id);
    expect(ids).not.toContain(complete.id);
    expect(ids).not.toContain(minor.id);
    expect(summary.body.data.find((x: any) => x.fighterId === adult.id)).toMatchObject({ missing: [], idExpired: true, medicalExpired: true });
    expect(shapeOf(summary).body).toBeTruthy();
  });

  it("is for KKF staff only", async () => {
    const f = await newFighter();
    for (const path of [`/fighters/${f.id}/private`, "/fighters/private-summary", `/fighters/${f.id}/private/documents/id`]) {
      expect((await get(path)).status).toBe(401);
      for (const who of ["organizer", "club", "referee"] as const) {
        expect((await get(path, a[who].token)).status).toBe(403);
      }
    }
    for (const who of ["organizer", "club", "referee"] as const) {
      expect((await put(`/fighters/${f.id}/private`, FULL, a[who].token)).status).toBe(403);
    }
    expect((await put(`/fighters/${f.id}/private`, FULL)).status).toBe(401);
  });

  it("never shows any of it in a public response", async () => {
    const f = await newFighter();
    await post(`/fighters/${f.id}/verify`, {}, a.officer.token);
    await put(`/fighters/${f.id}/private`, { ...FULL, idNumber: "SECRET-ID-99887", emergencyPhone: "099 000 111", medicalNotes: "SECRET-NOTE" }, a.officer.token);
    for (const path of ["/fighters", `/fighters/${f.id}`, `/fighters?status=Active`]) {
      const res = await raw(path);
      expect(res.status).toBe(200);
      const text = await res.text();
      for (const secret of ["SECRET-ID-99887", "099 000 111", "SECRET-NOTE", "emergency", "idNumber", "id_number", "bloodType"]) {
        expect(text).not.toContain(secret);
      }
    }
    // Staff lists don't carry it either: it only comes from the private routes.
    const staffList = await (await raw("/fighters", a.officer.token)).text();
    expect(staffList).not.toContain("SECRET-ID-99887");
  });

  it("stores scans privately: staff download them, the public file route can't serve them", async () => {
    const f = await newFighter();
    // Unique bytes: the plain 1×1 PNG is also a public picture in other tests (same content, same hash).
    const bytes = Buffer.concat([Buffer.from(PNG_B64, "base64"), Buffer.from(`scan-${uniq()}`)]);
    const scan = `data:image/png;base64,${bytes.toString("base64")}`;
    const saved = await put(`/fighters/${f.id}/private`, { idDocument: scan, medicalDocument: PDF }, a.officer.token);
    expect(saved.status).toBe(200);
    expect(saved.body.data).toMatchObject({ hasIdDocument: true, hasMedicalDocument: true });
    expect(JSON.stringify(saved.body)).not.toMatch(/\/api\/files|\.png|\.pdf|[a-f0-9]{64}/); // no link or file name

    const id = await raw(`/fighters/${f.id}/private/documents/id`, a.officer.token);
    expect(id.status).toBe(200);
    expect(id.headers.get("content-type")).toBe("image/png");
    expect(id.headers.get("cache-control")).toBe("private, no-store");
    expect(Buffer.from(await id.arrayBuffer()).equals(bytes)).toBe(true);
    const medical = await raw(`/fighters/${f.id}/private/documents/medical`, a.admin.token);
    expect(medical.headers.get("content-type")).toBe("application/pdf");
    expect((await raw(`/fighters/${f.id}/private/documents/other`, a.officer.token)).status).toBe(404);

    // The same bytes under the public /api/files name are not there.
    const hash = createHash("sha256").update(bytes).digest("hex");
    expect((await fetch(`${API_URL}/files/${hash}.png`)).status).toBe(404);

    // Removing a scan removes the reference.
    const removed = await put(`/fighters/${f.id}/private`, { idDocument: "" }, a.officer.token);
    expect(removed.body.data).toMatchObject({ hasIdDocument: false, hasMedicalDocument: true });
    expect((await raw(`/fighters/${f.id}/private/documents/id`, a.officer.token)).status).toBe(404);
  });
});
