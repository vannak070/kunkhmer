import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    include: ["tests/**/*.test.ts"],
    // All files share one database; run them one at a time for determinism.
    fileParallelism: false,
    testTimeout: 20_000,
  },
});
