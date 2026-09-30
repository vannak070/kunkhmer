import { beforeAll, describe, expect, it } from "vitest";
import { type Actors, get, post, setupActors, shapeOf, uniq } from "./helpers";

// The test API runs with AI_ENABLED=false, so these pin the "not configured" contract and
// never call the real model. Chat behaviour with a key is checked by hand (see
// claude/features/ai-assistant.md).
describe("AI assistant", () => {
  it("reports status publicly", async () => {
    const res = await get("/ai/status");
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ success: true, data: { enabled: false } });
    expect(shapeOf(res)).toMatchSnapshot();
  });

  it("refuses chat with 503 when not configured", async () => {
    const res = await post("/ai/chat", { messages: [{ role: "user", content: "Who is fighting next?" }], lang: "en" });
    expect(res.status).toBe(503);
    expect(res.body).toEqual({ success: false, error: "The AI assistant is not configured." });
  });

  it("does not need authentication", async () => {
    const res = await post("/ai/chat", {});
    expect(res.status).toBe(503);
  });
});

describe("AI assistant — streaming, feedback and staff review (Phase C)", () => {
  let a: Actors;
  beforeAll(async () => {
    a = await setupActors();
  });

  it("refuses the streaming endpoint with a JSON 503 when not configured", async () => {
    const res = await post("/ai/chat/stream", { messages: [{ role: "user", content: "Hi" }], lang: "en" });
    expect(res.status).toBe(503);
    expect(res.body).toEqual({ success: false, error: "The AI assistant is not configured." });
  });

  it("validates feedback", async () => {
    const missing = "00000000-0000-4000-8000-000000000000";
    expect((await post("/ai/feedback", { logId: missing, rating: 5 })).status).toBe(422);
    const unknown = await post("/ai/feedback", { logId: missing, rating: 1 });
    expect(unknown.status).toBe(404);
    expect(shapeOf(unknown)).toMatchSnapshot();
    expect((await post("/ai/feedback", { logId: "not-a-uuid", rating: -1 })).status).toBe(404);
  });

  it("shows usage and the answer log to KKF staff only", async () => {
    const usage = await get("/ai/usage", a.officer.token);
    expect(usage.status).toBe(200);
    expect(usage.body.data).toMatchObject({ enabled: false, capped: false });
    expect(shapeOf(usage)).toMatchSnapshot();

    const logs = await get("/ai/logs?feedback=down", a.admin.token);
    expect(logs.status).toBe(200);
    expect(logs.body.data).toMatchObject({ page: 1, pageSize: 50 });
    expect(Array.isArray(logs.body.data.items)).toBe(true);

    for (const path of ["/ai/usage", "/ai/logs"]) {
      expect((await get(path)).status).toBe(401);
      for (const who of ["organizer", "club", "referee"] as const) {
        expect((await get(path, a[who].token)).status).toBe(403);
      }
    }
  });
});

describe("AI assistant — staff assistant (Phase D2)", () => {
  let a: Actors;
  beforeAll(async () => {
    a = await setupActors();
  });

  it("is for KKF staff only", async () => {
    const body = { messages: [{ role: "user", content: "Which fighters wait for verification?" }], lang: "en" };
    for (const path of ["/ai/staff/chat", "/ai/staff/chat/stream"]) {
      const anon = await post(path, body);
      expect(anon.status).toBe(401);
      expect(anon.body).toEqual({ message: "Unauthenticated." });
      for (const who of ["organizer", "club", "referee"] as const) {
        expect((await post(path, body, a[who].token)).status).toBe(403);
      }
    }
  });

  it("refuses with 503 when not configured", async () => {
    const body = { messages: [{ role: "user", content: "Anything to approve?" }], lang: "en" };
    for (const path of ["/ai/staff/chat", "/ai/staff/chat/stream"]) {
      for (const who of ["admin", "officer"] as const) {
        const res = await post(path, body, a[who].token);
        expect(res.status).toBe(503);
        expect(res.body).toEqual({ success: false, error: "The AI assistant is not configured." });
      }
    }
  });

  it("splits spend by source and filters the log by source", async () => {
    const usage = await get("/ai/usage", a.admin.token);
    expect(usage.body.data).toMatchObject({ publicSpendUsd: expect.any(Number), staffSpendUsd: expect.any(Number) });

    for (const source of ["public", "staff"]) {
      const logs = await get(`/ai/logs?source=${source}`, a.officer.token);
      expect(logs.status).toBe(200);
      for (const item of logs.body.data.items) expect(item.source).toBe(source);
    }
  });
});

describe("AI assistant — personal answers for signed-in fans (Phase D3)", () => {
  let a: Actors;
  let fanToken: string;
  beforeAll(async () => {
    a = await setupActors();
    const res = await post("/fans/register", { email: `hub-${uniq()}@example.com`, password: "correct horse 1", displayName: "Hub Fan" });
    fanToken = res.body.data.token;
  });

  it("accepts an optional fan token on the public chat (same contract as anonymous)", async () => {
    const body = { messages: [{ role: "user", content: "When do my fighters fight next?" }], lang: "en" };
    for (const path of ["/ai/chat", "/ai/chat/stream"]) {
      for (const token of [fanToken, "kkf_not-a-real-session", a.officer.token]) {
        const res = await post(path, body, token);
        expect(res.status).toBe(503);
        expect(res.body).toEqual({ success: false, error: "The AI assistant is not configured." });
      }
    }
  });

  it("counts signed-in questions in the staff usage (never which fan)", async () => {
    const usage = await get("/ai/usage", a.officer.token);
    expect(usage.status).toBe(200);
    expect(usage.body.data.signedInQuestions).toEqual(expect.any(Number));
  });
});
