import { OutboxEvent } from "../models/outboxEvent.model";
import { addEmailJob } from "../queues/email.queue";

const processOutboxEvents = async () => {
  const event = await OutboxEvent.findOneAndUpdate(
    {
      status: "pending",
    },
    {
      $set: {
        status: "processing",
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
    });

    console.log("Outbox event published:", event._id);
  } catch (error: any) {
    await OutboxEvent.findByIdAndUpdate(event._id, {
      $set: {
        status: "failed",
        lastError: error.message,
      },
    });

    console.error("Failed to process outbox event: ", error);
  }
};

const startOutboxWorker = async () => {
  while (true) {
    await processOutboxEvents();

    await new Promise((resolve) => setTimeout(resolve, 1000));
  }
};

startOutboxWorker();
