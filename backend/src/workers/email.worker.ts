import { Worker } from "bullmq";
import { redis } from "../config/redis";
import { sendBookingConfirmationEmail } from "../services/email.service";

export const emailWorker = new Worker(
  "email",
  async (job) => {
    console.log("Processing job: ", job.name);

    // throw new Error("TEST EMAIL WORKER FAILURE");

    if (job.name === "booking-confirmation") {
      await sendBookingConfirmationEmail({
        recipientEmail: job.data.recipientEmail,
        recipientUsername: job.data.recipientUsername,
        recipientFullname: job.data.recipientFullname,
        mentorUsername: job.data.mentorUsername,
        mentorFullname: job.data.mentorFullname,
        bookingId: job.data.bookingId,
        date: job.data.date,
        startTime: job.data.startTime,
        endTime: job.data.endTime,
        sessionType: job.data.sessionType,
        totalPrice: job.data.totalPrice,
      });
    }
  },
  {
    connection: redis,
    concurrency: 1,
  },
);

emailWorker.on("completed", (job) => {
  console.log(`Job ${job.id} completed`);
});

emailWorker.on("failed", (job, error) => {
  console.error(`Job ${job?.id} failed: `, error);
});

export const stopEmailWorker = async () => {
  await emailWorker.close();

  console.log("Email worker closed");
};
