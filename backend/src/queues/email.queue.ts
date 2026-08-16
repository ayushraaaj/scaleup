import { Queue } from "bullmq";
import { redis } from "../config/redis";

export const emailQueue = new Queue("email", {
  connection: redis,
});

export const addEmailJob = async () => {
  await emailQueue.add("booking-confirmation", {
    recipientEmail: "it.2002830@gmail.com",
    recipientName: "Tanshu",
    mentorName: "Ayush",
  });

  console.log("Email job added");
};
