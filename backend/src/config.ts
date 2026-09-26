try {
  process.loadEnvFile();
} catch {}

function required(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`Missing required environment variable ${name}`);
  return value;
}

export const config = {
  databaseUrl: required("DATABASE_URL"),
  port: Number(process.env.PORT ?? 3001),
  host: process.env.HOST ?? "0.0.0.0",
  logLevel: process.env.LOG_LEVEL ?? "info",
  /** Fan sign-in / sign-up attempts allowed per 15 minutes (per IP, and per IP + email for sign-in). */
  fanRateLimit: Number(process.env.FAN_RATE_LIMIT ?? 10),
  /** "Ask Kun Khmer" AI chat. Off unless a key is set; AI_ENABLED=false forces it off (tests). */
  ai: {
    apiKey: process.env.ANTHROPIC_API_KEY ?? "",
    enabled: process.env.AI_ENABLED !== "false" && Boolean(process.env.ANTHROPIC_API_KEY),
    model: process.env.AI_MODEL ?? "claude-opus-5",
    /** Chat requests allowed per IP per 10 minutes. */
    rateLimit: Number(process.env.AI_RATE_LIMIT ?? 20),
  },
};
