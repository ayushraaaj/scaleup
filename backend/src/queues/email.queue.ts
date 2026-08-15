import { Queue } from "bullmq";
import { redis } from "../config/redis";

export const emailQueue = new Queue("email", {
  connection: redis,
});

export const addEmailJob = async () => {
  await emailQueue.add("send-email", {
    to: "abc",
    from: "xyz",
    message: "Hello",
  });

  console.log("Email job added");
};
