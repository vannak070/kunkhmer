/**
 * Gets the database ready before the API starts:
 *
 *   1. waits for PostgreSQL (and creates the database if it doesn't exist)
 *   2. RESET_DATABASE=true only: drops everything (used by the test service)
 *   3. a database created by the old Laravel backend already has the schema
 *      of migration 0_init, so that migration is marked as applied, not run
 *   4. applies pending Prisma migrations
 *   5. seeds the default Super Admin when there are no users
 */
import { execFileSync } from "node:child_process";
import { setTimeout as sleep } from "node:timers/promises";
import pg from "pg";
import { config } from "../config.ts";
import { seedDefaultAdmin } from "./seed.ts";

const BASELINE = "0_init";

/** Create the configured database if it doesn't exist yet (e.g. a new test database). */
async function createDatabase() {
  const url = new URL(config.databaseUrl);
  const name = decodeURIComponent(url.pathname.slice(1));
  url.pathname = "/postgres";
  const admin = new pg.Client({ connectionString: url.toString() });
  await admin.connect();
  try {
    console.log(`Creating database ${name}`);
    await admin.query(`CREATE DATABASE "${name.replaceAll('"', '""')}"`);
  } finally {
    await admin.end();
  }
}

async function connect(): Promise<pg.Client> {
  for (let attempt = 1; ; attempt++) {
    const client = new pg.Client({ connectionString: config.databaseUrl });
    try {
      await client.connect();
      return client;
    } catch (err) {
      await client.end().catch(() => {});
      if ((err as { code?: string }).code === "3D000") {
        await createDatabase(); // invalid_catalog_name: database does not exist
        continue;
      }
      if (attempt >= 30) throw err;
      console.log("Waiting for PostgreSQL...");
      await sleep(2000);
    }
  }
}

const tableExists = async (client: pg.Client, table: string) =>
  (await client.query("SELECT to_regclass($1) IS NOT NULL AS exists", [`public.${table}`])).rows[0].exists as boolean;

const prisma = (...args: string[]) => execFileSync("npx", ["prisma", ...args], { stdio: "inherit" });

const client = await connect();
try {
  if (process.env.RESET_DATABASE === "true") {
    console.log("RESET_DATABASE=true: dropping all tables");
    await client.query("DROP SCHEMA public CASCADE; CREATE SCHEMA public;");
  }

  if (!(await tableExists(client, "_prisma_migrations")) && (await tableExists(client, "users"))) {
    console.log(`Existing Laravel database found: marking ${BASELINE} as applied`);
    prisma("migrate", "resolve", "--applied", BASELINE);
  }
} finally {
  await client.end();
}

prisma("migrate", "deploy");
await seedDefaultAdmin();
