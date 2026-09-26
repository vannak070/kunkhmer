import { describe, expect, it } from "vitest";
import { get, post, shapeOf } from "./helpers";

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
