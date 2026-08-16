import { Worker } from "bullmq";
import { redis } from "../config/redis";
import { sendBookingConfirmationEmail } from "../services/email.service";

export const emailWorker = new Worker(
  "email",
  async (job) => {
    console.log("Processing job: ", job.name);

    if (job.name === "booking-confirmation") {
      await sendBookingConfirmationEmail({
        recipientEmail: job.data.recipientEmail,
        recipientName: job.data.recipientName,
        mentorName: job.data.mentorName,
      });
    }
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
