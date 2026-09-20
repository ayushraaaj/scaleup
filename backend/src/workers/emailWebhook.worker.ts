import { ChangeStream } from "mongodb";
import { EmailWebHookEvent } from "../models/emailWebhookEvent.model";
import {
  addEmailWebhookJob,
  emailWebhookQueue,
} from "../queues/emailWebhook.queue";
import mongoose from "mongoose";

const RETRY_DELAY = 60 * 1000;
const MAX_ATTEMPTS = 5;
const CHANGE_STREAM_RETRY_DELAY = 5000;

const processEmailWebhookEvents = async (eventId: mongoose.Types.ObjectId) => {
  const event = await EmailWebHookEvent.findOneAndUpdate(
    {
      _id: eventId,
      $or: [
        {
          processingStatus: "pending",
        },
        {
          processingStatus: "failed",
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
        processingStatus: "processing",
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

  console.log("Processing email webhook event: ", event._id);

  try {
    await addEmailWebhookJob(event.id.toString());

    await EmailWebHookEvent.findByIdAndUpdate(event._id, {
      $set: {
        processingStatus: "published",
        processedAt: new Date(),
      },
      $unset: {
        processingAt: "",
        lastError: "",
        nextRetryAt: "",
      },
    });

    console.log("Email webhook event published: ", event._id);
  } catch (error: any) {
    const isLastAttempt = event.attempts >= MAX_ATTEMPTS;

    if (isLastAttempt) {
      await EmailWebHookEvent.findByIdAndUpdate(event._id, {
        $set: {
          processingStatus: "dead",
          lastError: error.message,
        },
        $unset: {
          processingAt: "",
          nextRetryAt: "",
        },
      });

      console.error(
        `Email webhook event moved to dead statr after ${event.attempts} attempts: ${event._id}`,
      );

      return;
    }

    const retryDelay = RETRY_DELAY * 2 ** (event.attempts - 1);

    const nextRetryAt = new Date(Date.now() + retryDelay);

    await EmailWebHookEvent.findByIdAndUpdate(event._id, {
      $set: {
        processingStatus: "failed",
        lastError: error.message,
        nextRetryAt,
      },
    });

    console.error(
      `Email webhook event failed. Attempt ${event.attempts}. Next retry at ${nextRetryAt.toISOString()}`,
    );
  }
};

let changeStream: ChangeStream | null = null;

const startEmailWebhookChangeStream = async () => {
  try {
    changeStream = EmailWebHookEvent.watch([
      {
        $match: {
          operationType: "insert",
        },
      },
    ]);

    console.log("Email webhook change stream started");

    changeStream.on("change", async (change) => {
      if (change.operationType !== "insert") {
        return;
      }

      const webhookEventId = change.fullDocument._id;

      console.log("New email webhook event: ", webhookEventId);

      await addEmailWebhookJob(webhookEventId.toString());
    });

    changeStream.on("error", async (error) => {
      console.error("Email webhook change stream error: ", error);

      try {
        if (changeStream) {
          await changeStream.close();
        }
      } catch (closeError) {
        console.error(
          "Error closing email webhook change stream: ",
          closeError,
        );
      }

      changeStream = null;

      setTimeout(() => {
        startEmailWebhookChangeStream();
      }, CHANGE_STREAM_RETRY_DELAY);
    });

    changeStream.on("close", () => {
      console.log(
        "Email webhook change stream closed in startEmailWebhookChangeStream function",
      );
    });
  } catch (error) {
    console.error("Failed to start email webhook change stream: ", error);

    changeStream = null;

    setTimeout(() => {
      startEmailWebhookChangeStream();
    }, CHANGE_STREAM_RETRY_DELAY);
  }
};

export const stopEmailWebhookChangeStream = async () => {
  if (changeStream) {
    await changeStream.close();

    changeStream = null;

    console.log("Email webhook change stream closed");
  }
};

startEmailWebhookChangeStream();
