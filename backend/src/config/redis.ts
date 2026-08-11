import IORedis from "ioredis";
import { REDIS_URL } from "./env";

export const redis = new IORedis(REDIS_URL);

redis.on("connect", () => {
  console.log("Redis connected");
});

redis.on("error", (error) => {
  console.log("Redis error: ", error);
});
