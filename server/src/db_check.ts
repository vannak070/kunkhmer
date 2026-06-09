import { query } from "./config/db";

async function check() {
  try {
    const result = await query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
    `);
    console.log("TABLES IN DATABASE:");
    result.rows.forEach(row => console.log("- " + row.table_name));
  } catch (err) {
    console.error("Error checking tables:", err);
  }
  process.exit(0);
}

check();
