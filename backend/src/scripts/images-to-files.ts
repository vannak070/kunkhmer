/**
 * Moves pictures stored as base64 text in the database into files (lib/files.ts) and leaves the
 * /api/files/... link in their place. Safe to run any number of times: it only touches values that
 * still start with "data:image/". prepare-db.ts runs it on every start, so a deploy converts itself.
 *
 *   docker exec kunkhmer_backend npx tsx src/scripts/images-to-files.ts
 */
import pg from "pg";
import { config } from "../config.ts";
import { isImageDataUri, storeDataUri } from "../lib/files.ts";

export async function convertInlineImages(log: (msg: string) => void = console.log): Promise<number> {
  const client = new pg.Client({ connectionString: config.databaseUrl });
  await client.connect();
  let converted = 0;
  try {
    const { rows: columns } = await client.query<{ table_name: string; column_name: string }>(
      `SELECT table_name, column_name FROM information_schema.columns
        WHERE table_schema = 'public' AND data_type IN ('text', 'character varying') AND table_name NOT LIKE '\\_%'`,
    );
    for (const { table_name: t, column_name: c } of columns) {
      const q = (id: string) => `"${id.replaceAll('"', '""')}"`;
      const { rows } = await client.query<{ v: string }>(`SELECT DISTINCT ${q(c)} AS v FROM ${q(t)} WHERE ${q(c)} LIKE 'data:image/%'`);
      for (const { v } of rows) {
        if (!isImageDataUri(v)) continue; // not a clean data URI (e.g. HTML) — leave it
        try {
          const url = await storeDataUri(v);
          const res = await client.query(`UPDATE ${q(t)} SET ${q(c)} = $1 WHERE ${q(c)} = $2`, [url, v]);
          converted += res.rowCount ?? 0;
          log(`  ${t}.${c}: ${res.rowCount} row(s) → ${url}`);
        } catch (err) {
          log(`  ${t}.${c}: skipped one value (${err instanceof Error ? err.message : err})`);
        }
      }
    }
  } finally {
    await client.end();
  }
  return converted;
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const n = await convertInlineImages();
  console.log(`${n} row(s) converted.`);
}
