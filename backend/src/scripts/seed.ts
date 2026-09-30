/**
 * Creates the default Super Admin when the database has no users
 * Change the password after first login,
 * or set SEED_ADMIN_PASSWORD before the first start.
 */
import { randomUUID } from "node:crypto";
import bcrypt from "bcryptjs";
import { prisma } from "../db.ts";
import { now } from "../lib/dates.ts";

export async function seedDefaultAdmin() {
  if ((await prisma.user.count()) > 0) return;

  // Empty counts as unset (local default); production requires a real one (deploy/.env).
  const chosen = process.env.SEED_ADMIN_PASSWORD?.trim() ? process.env.SEED_ADMIN_PASSWORD : null;
  if (chosen && chosen.length < 8) {
    throw new Error("SEED_ADMIN_PASSWORD must be at least 8 characters — the Super Admin was not created");
  }
  const password = chosen ?? "admin123";
  const at = now();
  await prisma.user.create({
    data: {
      id: randomUUID(),
      username: "admin",
      full_name: "System Administrator",
      email: "admin@kkf.gov.kh",
      password_hash: await bcrypt.hash(password, 12),
      role: "Super Admin",
      status: "Active",
      created_at: at,
      updated_at: at,
    },
  });
  console.log(`Seeded default Super Admin "admin"${chosen ? "" : " (password admin123 — change it)"}`);
}

// Run directly: `npm run db:seed`
if (import.meta.url === `file://${process.argv[1]}`) {
  await seedDefaultAdmin();
  await prisma.$disconnect();
}
