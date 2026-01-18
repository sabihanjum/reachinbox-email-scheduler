import { Router } from "express";
import { z } from "zod";
import { prisma } from "../db";
import { authMiddleware } from "../auth";
import { ensureDefaultSender } from "../emailSender";
import { emailQueue } from "../queue";
import { config } from "../config";
import { EmailStatus } from "@prisma/client";

const router = Router();

const scheduleSchema = z.object({
  subject: z.string().min(1),
  body: z.string().min(1),
  emails: z.array(z.string().email()).min(1),
  sendAt: z.string().optional(),
  senderId: z.string().optional(),
  minDelayMs: z.number().int().positive().optional(),
  maxEmailsPerHour: z.number().int().positive().optional(),
});

router.post("/schedule", authMiddleware, async (req, res) => {
  try {
    const parsed = scheduleSchema.parse(req.body);
    const userId = req.authUser!.id;

    const sender = parsed.senderId
      ? await prisma.sender.findFirst({ where: { id: parsed.senderId, userId } })
      : await ensureDefaultSender(prisma, userId);

    if (!sender) {
      return res.status(404).json({ message: "Sender not found" });
    }

    const minDelayMs = parsed.minDelayMs ?? config.minDelayMs;
    const maxEmailsPerHour = parsed.maxEmailsPerHour ?? config.maxEmailsPerHour;
    const startAt = parsed.sendAt ? new Date(parsed.sendAt) : new Date();

    const jobs = await prisma.$transaction(async (tx) => {
      const records = await Promise.all(
        parsed.emails.map((email) =>
          tx.emailJob.create({
            data: {
              userId,
              senderId: sender.id,
              toEmail: email,
              subject: parsed.subject,
              body: parsed.body,
              sendAt: startAt,
              status: EmailStatus.queued,
            },
          })
        )
      );
      return records;
    });

    await Promise.all(
      jobs.map((job, idx) => {
        const delay = Math.max(0, startAt.getTime() - Date.now() + idx * minDelayMs);
        return emailQueue.add(
          "send-email",
          {
            jobId: job.id,
            minDelayMs,
            maxEmailsPerHour,
          },
          {
            jobId: job.id,
            delay,
            attempts: 3,
            backoff: { type: "exponential", delay: 2000 },
          }
        );
      })
    );

    res.json({ count: jobs.length, sender });
  } catch (err: any) {
    console.error("schedule error", err);
    res.status(400).json({ message: err?.message || "Invalid payload" });
  }
});

router.get("/scheduled", authMiddleware, async (req, res) => {
  const userId = req.authUser!.id;
  const jobs = await prisma.emailJob.findMany({
    where: { userId, status: { in: ["queued", "scheduled", "sending"] } },
    orderBy: { sendAt: "asc" },
  });
  res.json(jobs);
});

router.get("/sent", authMiddleware, async (req, res) => {
  const userId = req.authUser!.id;
  const jobs = await prisma.emailJob.findMany({
    where: { userId, status: { in: ["sent", "failed"] } },
    orderBy: { sentAt: "desc" },
    take: 200,
  });
  res.json(jobs);
});

router.get("/senders", authMiddleware, async (req, res) => {
  const userId = req.authUser!.id;
  const senders = await prisma.sender.findMany({ where: { userId } });
  res.json(senders);
});

export default router;
