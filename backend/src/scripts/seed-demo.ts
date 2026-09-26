/**
 * Loads the demo data set: clubs,
 * fighters, users for every role, events, batches, matches, results and
 * championship titles. Data lives in prisma/seed/demo-data.json.
 *
 *   npm run db:seed:demo            only into an empty database
 *   npm run db:seed:demo -- --reset wipes ALL data first, then loads the demo set
 *
 * Demo logins (all Active): admin/admin123, officer/officer123,
 * organizer/org123, manager/manager123, club/club123, referees ref123,
 * judges judge123.
 */
import { readFileSync } from "node:fs";
import { prisma } from "../db.ts";

/** Insert order respects foreign keys. */
const TABLES = [
  "clubs",
  "users",
  "fighters",
  "sponsors",
  "broadcast_stations",
  "events",
  "event_sponsors",
  "sub_events",
  "champions",
  "matches",
  "bout_results",
  "champion_defenses",
] as const;

const WITH_TIMESTAMPS = ["clubs", "users", "fighters", "sponsors", "broadcast_stations", "events", "sub_events", "champions", "matches"];

type Row = Record<string, unknown>;
const data: Record<(typeof TABLES)[number], Row[]> = JSON.parse(
  readFileSync(new URL("../../prisma/seed/demo-data.json", import.meta.url), "utf8"),
);

const reset = process.argv.includes("--reset");

if (reset) {
  console.log("--reset: deleting all data");
  await prisma.$executeRawUnsafe(`TRUNCATE ${[...TABLES, "personal_access_tokens", "news_articles", "videos"].join(", ")} CASCADE`);
} else if ((await prisma.user.count()) > 0) {
  console.error("The database already has users. Run with --reset to wipe it and load the demo data.");
  process.exit(1);
}

await prisma.$transaction(async (tx) => {
  // champions.winning_match_id points at matches, which are inserted later.
  const winningMatches = data.champions.filter((c) => c.winning_match_id);
  const champions = data.champions.map((c) => ({ ...c, winning_match_id: null }));

  for (const table of TABLES) {
    const rows = table === "champions" ? champions : data[table];
    if (rows.length === 0) continue;
    // Table names come from the fixed list above; rows are passed as a parameter.
    await tx.$executeRawUnsafe(
      `INSERT INTO ${table} SELECT * FROM json_populate_recordset(NULL::${table}, $1::json)`,
      JSON.stringify(rows),
    );
    if (WITH_TIMESTAMPS.includes(table)) {
      await tx.$executeRawUnsafe(
        `UPDATE ${table} SET created_at = COALESCE(created_at, now()), updated_at = COALESCE(updated_at, now())`,
      );
    }
  }

  for (const c of winningMatches) {
    await tx.champion.update({ where: { id: String(c.id) }, data: { winning_match_id: String(c.winning_match_id) } });
  }
});

for (const table of TABLES) console.log(`${table}: ${data[table].length}`);
console.log("Demo data loaded.");
await prisma.$disconnect();
