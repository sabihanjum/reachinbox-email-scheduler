import dotenv from "dotenv";

dotenv.config();

const numberFromEnv = (key: string, fallback: number) => {
  const raw = process.env[key];
  const parsed = raw ? Number(raw) : NaN;
  return Number.isFinite(parsed) ? parsed : fallback;
};

export const config = {
  port: numberFromEnv("PORT", 4000),
  redisUrl: process.env.REDIS_URL || "redis://localhost:6379",
  databaseUrl: process.env.DATABASE_URL || "",
  jwtSecret: process.env.JWT_SECRET || "dev-secret",
  frontendOrigin: process.env.FRONTEND_ORIGIN || "http://localhost:3000",
  googleClientId: process.env.GOOGLE_CLIENT_ID || "",
  minDelayMs: numberFromEnv("SMTP_MIN_DELAY_MS", 2000),
  maxEmailsPerHour: numberFromEnv("SMTP_MAX_EMAILS_PER_HOUR", 200),
  workerConcurrency: numberFromEnv("WORKER_CONCURRENCY", 5),
};
