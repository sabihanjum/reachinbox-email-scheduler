import { redis } from "./redis";

export type RateLimitResult = { allowed: boolean; nextAvailableAt: number };

export const checkHourlyLimit = async (
  senderId: string,
  maxPerHour: number
): Promise<RateLimitResult> => {
  const now = Date.now();
  const windowStart = Math.floor(now / 3600000) * 3600000;
  const key = `email:rate:${senderId}:${windowStart}`;

  const count = await redis.incr(key);
  if (count === 1) {
    await redis.pexpire(key, 3600000);
  }

  if (count > maxPerHour) {
    const nextWindow = windowStart + 3600000;
    return { allowed: false, nextAvailableAt: nextWindow };
  }

  return { allowed: true, nextAvailableAt: now };
};
