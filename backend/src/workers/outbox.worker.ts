import mongoose from "mongoose";
import { OutboxEvent } from "../models/outboxEvent.model";
import { addEmailJob } from "../queues/email.queue";

const PROCESSING_TIME = 5 * 60 * 1000;
const MAX_ATTEMPTS = 5;
const RETRY_DELAY = 60 * 1000;
const CHANGE_STREAM_RETRY_DELAY = 5000;

const processOutboxEvents = async (eventId: mongoose.Types.ObjectId) => {
  const staleProcessingTime = new Date(Date.now() - PROCESSING_TIME);

  const event = await OutboxEvent.findOneAndUpdate(
    {
      _id: eventId,
      $or: [
        {
          status: "pending",
        },
        {
          status: "processing",
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

      // throw new Error("TEST OUTBOX FAILURE");
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

const startChangeStream = async () => {
  try {
    const changeStream = OutboxEvent.watch([
      {
        $match: {
          operationType: "insert",
        },
      },
    ]);

    console.log("Outbox change stream started");

    changeStream.on("change", async (change) => {
      if (change.operationType !== "insert") {
        return;
      }

      const eventId = change.fullDocument._id;

      console.log("New outbox event: ", eventId);

      await processOutboxEvents(eventId);
    });

    changeStream.on("error", async (error) => {
      console.error("Outbox change stream error: ", error);

      try {
        await changeStream.close();
      } catch (closeError) {
        console.error("Error closing change stream: ", closeError);
      }

      setTimeout(() => {
        startChangeStream();
      }, CHANGE_STREAM_RETRY_DELAY);
    });

    changeStream.on("close", () => {
      console.log("Outbox change stream closed");
    });
  } catch (error) {
    console.error("Failed to start outbox change stream: ", error);

    setTimeout(() => {
      startChangeStream();
    }, CHANGE_STREAM_RETRY_DELAY);
  }
};

export const reconcileOutboxEvents = async () => {
  console.log("Running outbox reconciliation...");

  const staleProcessingTime = new Date(Date.now() - PROCESSING_TIME);

  const now = Date.now();

  const events = await OutboxEvent.find({
    $or: [
      {
        status: "processing",
        processingAt: {
          $lt: staleProcessingTime,
        },
      },
      {
        status: "failed",
        attempts: {
          $lt: MAX_ATTEMPTS,
        },
        nextRetryAt: {
          $lte: now,
        },
      },
    ],
  }).select("_id");

  for (const event of events) {
    await processOutboxEvents(event._id);
  }
};

const startOutboxWorker = async () => {
  await startChangeStream();
};

startOutboxWorker();
