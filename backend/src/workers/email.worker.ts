import { UnrecoverableError, Worker } from "bullmq";
import { redis } from "../config/redis";
import { sendBookingConfirmationEmail } from "../services/email.service";
import { EmailError } from "../utils/emailError";
import { EmailDelivery } from "../models/emailDelivery.model";

export const emailWorker = new Worker(
  "email",
  async (job) => {
    console.log("Processing email job: ", job.name);

    // await new Promise((resolve) => setTimeout(resolve, 30000));

    // console.log("Simulating email worker crash...");
    // process.exit(1);

    // try {
    if (job.name === "booking-confirmation") {
      const emailDelivery = await EmailDelivery.findOneAndUpdate(
        { outboxEventId: job.data.outboxEventId },
        {
          $setOnInsert: {
            outboxEventId: job.data.outboxEventId,
            recipientId: job.data.recipientId,
            emailType: "BOOKING_CONFIRMATION",
            provider: "brevo",
          },
        },
        {
          upsert: true,
          returnDocument: "after",
        },
      );

      try {
        // throw new Error("TEST Email delivery failure");

        const response = await sendBookingConfirmationEmail({
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

        await EmailDelivery.findByIdAndUpdate(emailDelivery._id, {
          status: "submitted",
          providerMessageId: response.messageId,
          submittedAt: new Date(),
        });

        // console.log("Provider message ID: ", response.messageId);

        // console.log("Email job: ", job);

        // console.log("Email accepted by provider. Simulating worker crash...");
        // process.exit(1);
      } catch (error: any) {
        if (error instanceof EmailError && !error.retryable) {
          await EmailDelivery.findByIdAndUpdate(emailDelivery._id, {
            status: "failed",
            failureReason: error.message,
          });

          throw new UnrecoverableError(error.message);
        }

        throw error;
      }
    }
  },
  {
    connection: redis,
    concurrency: 1,
    settings: {
      backoffStrategy: (attemptsMade, type, error: any, job: any) => {
        if (error instanceof EmailError && error?.retryAfter) {
          console.log(
            `Processing job: ${job.name} at ${new Date().toISOString()}`,
          );

          return error?.retryAfter * 1000;
        }

        return 4000 * 2 ** (attemptsMade - 1);
      },
    },
  },
);

emailWorker.on("completed", (job) => {
  console.log(`Job ${job.id} completed`);
});

emailWorker.on("failed", async (job, error) => {
  console.error(`Job ${job?.id} failed: `, error);

  if (!job) {
    return;
  }

  if (job.attemptsMade >= (job.opts.attempts ?? 1)) {
    await EmailDelivery.findOneAndUpdate(
      { outboxEventId: job.data.outboxEventId },
      {
        status: "failed",
        failureReason: error.message,
      },
    );
  }
});

export const stopEmailWorker = async () => {
  await emailWorker.close();

  console.log("Email worker closed");
};
