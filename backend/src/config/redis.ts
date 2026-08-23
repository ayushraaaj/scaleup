import IORedis from "ioredis";
import { REDIS_URL } from "./env";

export const redis = new IORedis(REDIS_URL, {
  maxRetriesPerRequest: null,
});

export const closeRedis = async () => {
  await redis.quit();

  console.log("Redis connection closed");
};

redis.on("connect", () => {
  console.log("Redis connected");
});

redis.on("error", (error) => {
  console.log("Redis error: ", error);
});
