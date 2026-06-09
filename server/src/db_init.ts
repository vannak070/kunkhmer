import { query } from "./config/db";
import * as fs from "fs";
import * as path from "path";

async function initialize() {
  try {
    const schemaPath = path.join(__dirname, "../db/schema.sql");
    console.log("Reading schema from:", schemaPath);
    const sql = fs.readFileSync(schemaPath, "utf8");

    console.log("Executing schema SQL in database...");
    await query(sql);
    console.log("Schema initialized successfully!");

    const checkResult = await query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
    `);
    console.log("Created tables:");
    checkResult.rows.forEach(row => console.log("- " + row.table_name));
  } catch (err) {
    console.error("Error initializing database schema:", err);
  }
  process.exit(0);
}

initialize();
