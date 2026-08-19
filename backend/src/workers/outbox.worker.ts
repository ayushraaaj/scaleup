import { OutboxEvent } from "../models/outboxEvent.model";
import { addEmailJob } from "../queues/email.queue";

const PROCESSING_TIME = 5 * 60 * 1000;
const MAX_ATTEMPTS = 5;
const RETRY_DELAY = 60 * 1000;

const processOutboxEvents = async () => {
  const staleProcessingTime = new Date(Date.now() - PROCESSING_TIME);

  const event = await OutboxEvent.findOneAndUpdate(
    {
      $or: [
        {
          status: "pending",
        },
        {
          status: "pending",
          processingAt: {
            $lt: staleProcessingTime,
          },
        },
        {
          status: "failed",
          attempts: {
            $lt: MAX_ATTEMPTS,
          },

          $or: [
            {
              nextRetryAt: {
                $lte: new Date(),
              },
            },
            {
              nextRetryAt: {
                $exists: false,
              },
            },
          ],
        },
      ],
    },
    {
      $set: {
        status: "processing",
        processingAt: new Date(),
      },
      $inc: {
        attempts: 1,
      },
    },
    {
      returnDocument: "after",
    },
  );

  if (!event) {
    console.log("No pending outbox events");
    return;
  }

  console.log("Processing outbox event:", event._id);

  try {
    if (event.type === "BOOKING_CONFIRMATION_EMAIL") {
      await addEmailJob(event.payload);
    }

    await OutboxEvent.findByIdAndUpdate(event._id, {
      $set: {
        status: "published",
        processedAt: new Date(),
      },
      $unset: {
        processingAt: "",
        lastError: "",
        nextRetryAt: "",
      },
    });

    console.log("Outbox event published:", event._id);
  } catch (error: any) {
    const retryDelay = RETRY_DELAY * 2 ** (event.attempts - 1);

    const nextRetryAt = new Date(Date.now() + retryDelay);

    await OutboxEvent.findByIdAndUpdate(event._id, {
      $set: {
        status: "failed",
        lastError: error.message,
        nextRetryAt,
      },
    });

    console.error(
      `Outbox event failed. Attempt ${event.attempts}. ` +
        `Next retry at ${nextRetryAt.toISOString()}`,
    );
  }
};

const startOutboxWorker = async () => {
  while (true) {
    await processOutboxEvents();

    await new Promise((resolve) => setTimeout(resolve, 1000));
  }
};

startOutboxWorker();
