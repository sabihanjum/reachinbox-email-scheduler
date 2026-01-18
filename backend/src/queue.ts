import { Queue } from "bullmq";
import { config } from "./config";

export const emailQueueName = "email-queue";

// Parse Redis URL for BullMQ/ioredis ConnectionOptions, including TLS for Upstash
export const getRedisConnection = () => {
  try {
    const url = new URL(config.redisUrl);
    const isTls = url.protocol === "rediss:";
    const conn: any = {
      host: url.hostname,
      port: parseInt(url.port || "6379", 10),
      password: url.password || undefined,
      maxRetriesPerRequest: null,
    };
    // Upstash uses ACL; username is often "default". ioredis will AUTH password if username omitted.
    if (url.username) conn.username = url.username;
    if (isTls) conn.tls = {};
    return conn;
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
  waitUntilReady: async () => emailQueue.waitUntilReady(),
};
