import { Queue } from "bullmq";
import { config } from "./config";

export const emailQueueName = "email-queue";

export const emailQueue = new Queue(emailQueueName, {
  connection: {
    url: config.redisUrl,
    maxRetriesPerRequest: null,
  },
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
