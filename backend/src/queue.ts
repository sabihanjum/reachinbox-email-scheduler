import { Queue } from "bullmq";
import { redis } from "./redis";

export const emailQueueName = "email-queue";

export const emailQueue = new Queue(emailQueueName, {
  connection: redis,
  defaultJobOptions: {
    removeOnComplete: true,
    removeOnFail: false,
  },
});

// In BullMQ v5+, QueueScheduler is deprecated and not needed
// The queue automatically handles delayed jobs
export const scheduler = {
  waitUntilReady: async () => emailQueue.waitUntilReady()
};
