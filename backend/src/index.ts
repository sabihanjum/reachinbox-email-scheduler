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
  await scheduler.waitUntilReady();
  await prisma.$connect();
  app.listen(config.port, () => {
    console.log(`✅ API listening on port ${config.port}`);
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
