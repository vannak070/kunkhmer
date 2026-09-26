import { buildApp } from "./app.ts";
import { config } from "./config.ts";
import { prisma } from "./db.ts";

const app = await buildApp();

for (const signal of ["SIGINT", "SIGTERM"] as const) {
  process.once(signal, async () => {
    await app.close();
    await prisma.$disconnect();
    process.exit(0);
  });
}

await app.listen({ port: config.port, host: config.host });
