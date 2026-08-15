import { Worker } from "bullmq";
import { redis } from "../config/redis";

export const emailWorker = new Worker(
  "email",
  async (job) => {
    console.log("Processing job: ", job.name);
    console.log("Job data: ", job.data);
  },
  {
    connection: redis,
  },
);

emailWorker.on("completed", (job) => {
  console.log(`Job ${job.id} completed`);
});

emailWorker.on("failed", (job, error) => {
  console.error(`Job ${job?.id} failed: `, error);
});
