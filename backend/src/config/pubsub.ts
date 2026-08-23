import IORedis from "ioredis";
import { REDIS_URL } from "./env";

export const publisher = new IORedis(REDIS_URL);

export const subscriber = new IORedis(REDIS_URL);

publisher.on("error", (error) => {
  console.error(`Redis publisher error: ${error}`);
});

subscriber.on("error", (error) => {
  console.error(`Redis subscriber error: ${error}`);
});
