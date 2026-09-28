/**
 * KUNKHMER HUB eval: asks every question in questions.json through the running API and checks the
 * answers against simple rules (language, real links, declines off-topic, no betting predictions,
 * no internal words). Calls the paid model — run only when the owner approves (roughly $1–2 a run).
 *
 *   docker exec kunkhmer_backend npx tsx src/scripts/hub-eval/run.ts            # all questions
 *   docker exec kunkhmer_backend npx tsx src/scripts/hub-eval/run.ts rules-     # ids starting with "rules-"
 *
 * Env: HUB_EVAL_URL (default http://localhost:3001/api). Answers are logged like any other
 * (conversation id "hub-eval-<timestamp>"), so the spend shows on the admin "Hub answers" page.
 */
import { readFileSync, writeFileSync } from "node:fs";

interface Case {
  id: string;
  lang: "en" | "km";
  q: string;
  history?: { role: "user" | "assistant"; content: string }[];
  mustInclude?: string[];
  check?: string[];
}

const BASE = process.env.HUB_EVAL_URL ?? "http://localhost:3001/api";
const here = new URL(".", import.meta.url);
const cases: Case[] = JSON.parse(readFileSync(new URL("questions.json", here), "utf8"));
const only = process.argv[2];
const conversation = `hub-eval-${Date.now()}`;

const khmerShare = (t: string) => {
  const letters = t.replace(/\[[^\]]*\]\([^)]*\)/g, "").replace(/[\s\d\p{P}\p{S}]/gu, "");
  if (!letters) return 0;
  return (letters.match(/[ក-៿]/g) ?? []).length / letters.length;
};

const CHECKS: Record<string, (a: string) => string | null> = {
  english: (a) => (khmerShare(a) < 0.3 ? null : "expected an English answer"),
  khmer: (a) => (khmerShare(a) >= 0.3 ? null : "expected a Khmer answer"),
  fighterLink: (a) => (/\]\(\/fighters\/[^)]+\)/.test(a) ? null : "expected a link to a fighter page"),
  noFighterLink: (a) => (/\]\(\/fighters\/[^)]+\)/.test(a) ? "linked a fighter that shouldn't exist" : null),
  eventLink: (a) => (/\]\(\/events\/[^)]+\)/.test(a) ? null : "expected a link to an event page"),
  declines: (a) => (/only help with Kun Khmer|can only help|Kun Khmer only|គុនខ្មែរ/i.test(a) ? null : "expected a polite decline"),
  noPrediction: (a) => (/\bwill (definitely |surely )?win\b|\bbet on\b(?! .*not)|guaranteed/i.test(a) ? "sounds like a prediction or betting tip" : null),
  noInternalWords: (a) => (/\b(Draft|Pending KKF Approval|Published)\b/.test(a) ? "mentions an internal status" : null),
  noSystemAccount: (a) => (/System Administrator|\badmin\b/i.test(a) ? "names a system account" : null),
};

async function ask(c: Case): Promise<{ answer: string; ms: number; status: number }> {
  const started = Date.now();
  const res = await fetch(`${BASE}/ai/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ messages: [...(c.history ?? []), { role: "user", content: c.q }], lang: c.lang, conversationId: conversation }),
  });
  const body = await res.json().catch(() => ({}));
  return { answer: body?.data?.reply ?? body?.error ?? "", ms: Date.now() - started, status: res.status };
}

const selected = cases.filter((c) => !only || c.id.startsWith(only));
const results: { id: string; ok: boolean; problems: string[]; answer: string; ms: number }[] = [];

for (const c of selected) {
  const { answer, ms, status } = await ask(c);
  const problems: string[] = [];
  if (status !== 200) problems.push(`HTTP ${status}: ${answer}`);
  for (const pattern of c.mustInclude ?? []) {
    if (!new RegExp(pattern, "i").test(answer)) problems.push(`missing /${pattern}/`);
  }
  for (const name of c.check ?? []) {
    const problem = CHECKS[name]?.(answer);
    if (problem) problems.push(problem);
  }
  results.push({ id: c.id, ok: problems.length === 0, problems, answer, ms });
  console.log(`${problems.length ? "✗" : "✓"} ${c.id.padEnd(28)} ${(ms / 1000).toFixed(1)}s ${problems.join("; ")}`);
  // A short pause keeps us well under the Hub's own rate limit and the API's.
  await new Promise((r) => setTimeout(r, 1500));
}

const passed = results.filter((r) => r.ok).length;
console.log(`\n${passed} / ${results.length} passed`);
const out = new URL(`last-run.json`, here);
writeFileSync(out, JSON.stringify({ conversation, at: new Date().toISOString(), passed, total: results.length, results }, null, 2));
console.log(`Answers saved to ${out.pathname}`);
