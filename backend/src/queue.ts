import { Queue } from "bullmq";
import { config } from "./config";

export const emailQueueName = "email-queue";

// Parse Redis URL for BullMQ ConnectionOptions
const getRedisConnection = () => {
  try {
    const url = new URL(config.redisUrl);
    return {
      host: url.hostname,
      port: parseInt(url.port || "6379", 10),
      password: url.password || undefined,
      maxRetriesPerRequest: null,
    };
  } catch {
    // Fallback for local development
    return {
      host: "localhost",
      port: 6379,
      maxRetriesPerRequest: null,
    };
  }
};

export const emailQueue = new Queue(emailQueueName, {
  connection: getRedisConnection(),
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
