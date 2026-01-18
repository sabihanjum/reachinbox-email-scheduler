import { Worker } from "bullmq";
import { config } from "./config";
import { prisma } from "./db";
import { redis } from "./redis";
import { sendEmail, markJobStatus } from "./emailSender";
import { checkHourlyLimit } from "./rateLimiter";
import { emailQueueName } from "./queue";

const worker = new Worker(
  emailQueueName,
  async (job) => {
    const { jobId, minDelayMs, maxEmailsPerHour } = job.data as {
      jobId: string;
      minDelayMs: number;
      maxEmailsPerHour: number;
    };

    try {
      const emailJob = await prisma.emailJob.findUnique({
        where: { id: jobId },
        include: { sender: true },
      });

      if (!emailJob) {
        throw new Error("Job not found in DB");
      }

      if (emailJob.status === "sent") {
        return { alreadySent: true };
      }

      // Check hourly rate limit
      const rateLimitResult = await checkHourlyLimit(emailJob.senderId, maxEmailsPerHour);
      if (!rateLimitResult.allowed) {
        // Reschedule to next hour
        const delayMs = rateLimitResult.nextAvailableAt - Date.now();
        throw new Error(`Rate limit exceeded, reschedule after ${delayMs}ms`);
      }

      // Update to "sending"
      await markJobStatus(prisma, jobId, "sending");

      // Delay between emails
      await new Promise((r) => setTimeout(r, minDelayMs));

      // Send the email
      const { messageId } = await sendEmail(
        prisma,
        emailJob.sender,
        emailJob.toEmail,
        emailJob.subject,
        emailJob.body
      );

      // Mark as sent
      await markJobStatus(prisma, jobId, "sent", { messageId });
      return { sent: true };
    } catch (error: any) {
      const message = error?.message || String(error);
      console.error(`Failed to send email job ${jobId}:`, message);
      await markJobStatus(prisma, jobId, "failed", { error: message });
      throw error;
    }
  },
  {
    connection: {
      url: config.redisUrl,
      maxRetriesPerRequest: null,
    },
    concurrency: config.workerConcurrency,
  }
);

worker.on("completed", (job) => {
  console.log(`✅ Job ${job.id} completed`);
});

worker.on("failed", (job, err) => {
  console.error(`❌ Job ${job?.id} failed:`, err);
});

const start = async () => {
  await prisma.$connect();
  console.log(`✅ Email worker started with concurrency=${config.workerConcurrency}`);
};

start().catch((err) => {
  console.error("Worker failed to start", err);
  process.exit(1);
});

process.on("SIGTERM", async () => {
  console.log("SIGTERM received, closing worker...");
  await worker.close();
  await prisma.$disconnect();
  process.exit(0);
});
