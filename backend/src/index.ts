import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { config } from "./config";
import authRoutes from "./routes/authRoutes";
import emailRoutes from "./routes/emailRoutes";
import { scheduler } from "./queue";
import { prisma } from "./db";

const app = express();

app.use(
  cors({
    origin: config.frontendOrigin,
    credentials: true,
  })
);
app.use(express.json({ limit: "1mb" }));
app.use(cookieParser());

app.get("/api/health", (_req, res) => res.json({ ok: true }));

app.use("/api/auth", authRoutes);
app.use("/api/email", emailRoutes);

const start = async () => {
  // Start HTTP server first to satisfy Render's port detection
  app.listen(config.port, async () => {
    console.log(`✅ API listening on port ${config.port}`);
    try {
      await prisma.$connect();
      // Initialize queue readiness without blocking startup
      scheduler
        .waitUntilReady()
        .then(() => console.log("✅ BullMQ queue is ready"))
        .catch((err) => console.error("⚠️ BullMQ queue not ready yet:", err?.message || err));
    } catch (err: any) {
      console.error("⚠️ Prisma connection failed:", err?.message || err);
    }
  });
};

start().catch((err) => {
  console.error("Failed to start server", err);
  process.exit(1);
});

process.on("SIGTERM", async () => {
  console.log("SIGTERM received, closing...");
  await prisma.$disconnect();
  process.exit(0);
});
