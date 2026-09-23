import { ChangeStream } from "mongodb";
import { EmailWebHookEvent } from "../models/emailWebhookEvent.model";
import {
  addEmailWebhookJob,
  emailWebhookQueue,
} from "../queues/emailWebhook.queue";
import mongoose from "mongoose";
import { redis } from "../config/redis";
import { Worker } from "bullmq";
import { ApiError } from "../utils/ApiError";
import { EmailDelivery } from "../models/emailDelivery.model";
import { EmailError } from "../utils/emailError";

const PROCESSING_TIME = 60 * 1000;
const RETRY_DELAY = 60 * 1000;
const MAX_ATTEMPTS = 5;
const CHANGE_STREAM_RETRY_DELAY = 5000;

const processEmailWebhookEvents = async (
  webhookEventId: mongoose.Types.ObjectId,
) => {
  const staleProcessingTime = new Date(Date.now() - PROCESSING_TIME);

  const event = await EmailWebHookEvent.findOneAndUpdate(
    {
      _id: webhookEventId,
      $or: [
        {
          processingStatus: "pending",
        },
        {
          processingStatus: "processing",
          processingAt: {
            $lt: staleProcessingTime,
          },
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
    console.log("No pending email webhook events");
    return;
  }

  console.log("Processing email webhook event: ", event._id);

  // console.log("Simulating crash...");
  // process.exit(1);

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

const webhookEvents = [
  "delivered",
  "soft_bounce",
  "hard_bounce",
  "blocked",
  "spam",
  "invalid_email",
  "deferred",
];

let changeStream: ChangeStream | null = null;

const startEmailWebhookChangeStream = async () => {
  try {
    changeStream = EmailWebHookEvent.watch([
      {
        $match: {
          operationType: "insert",
          "fullDocument.event": {
            $in: webhookEvents,
          },
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

      await processEmailWebhookEvents(webhookEventId);
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

export const reconcileEmailWebhookEvents = async () => {
  console.log("Running email webhook reconciliation...");

  const staleProcessingTime = new Date(Date.now() - PROCESSING_TIME);
  const now = Date.now();

  const events = await EmailWebHookEvent.find({
    $or: [
      {
        processingStatus: "processing",
        processingAt: {
          $lt: staleProcessingTime,
        },
      },
      {
        processingStatus: "failed",
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
    await processEmailWebhookEvents(event._id);
  }
};

const startEmailWebhookWorker = async () => {
  startEmailWebhookChangeStream();
};

startEmailWebhookWorker();

const getEmailDeliveryStatus = (event: any) => {
  if (event === "invalid_email") {
    return "invalid";
  }

  if (
    event === "delivered" ||
    event === "soft_bounce" ||
    event === "hard_bounce" ||
    event === "blocked" ||
    event === "spam" ||
    event === "deferred"
  ) {
    return event;
  }

  return undefined;
};

export const emailWebhookWorker = new Worker(
  "email-webhook",
  async (job) => {
    console.log("Processing email webhook job: ", job.name);

    const { webhookEventId } = job.data;

    const webhookEvent = await EmailWebHookEvent.findById(webhookEventId);

    if (!webhookEvent) {
      throw new ApiError(404, "Email webhook not found");
    }

    const delivery = await EmailDelivery.findOne({
      providerMessageId: webhookEvent.providerMessageId,
    });

    if (!delivery) {
      throw new ApiError(
        404,
        `EmailDelivery not found for providerMessageId: ${webhookEvent.providerMessageId}`,
      );
    }

    const newStatus = getEmailDeliveryStatus(webhookEvent.event);

    if (newStatus) {
      await EmailDelivery.findByIdAndUpdate(delivery._id, {
        $set: {
          status: newStatus,
        },
      });
    }

    console.log("Processed email webhook event: ", webhookEvent._id);
  },
  {
    connection: redis,
    concurrency: 1,
    settings: {
      backoffStrategy: (attemptsMade, type, error: any, job: any) => {
        if (error instanceof EmailError && error.retryAfter) {
          console.log(
            `Processing job: ${job.name} at ${new Date().toISOString()}`,
          );

          return error.retryAfter * 1000;
        }

        return 4000 * 2 ** (attemptsMade - 1);
      },
    },
  },
);

emailWebhookWorker.on("completed", (job) => {
  console.log(`Job ${job.id} completed`);
});

emailWebhookWorker.on("failed", async (job, error) => {
  console.error(`Job ${job?.id} failed: ${error}`);

  if (!job) {
    return;
  }

  if (job.attemptsMade >= (job.opts.attempts ?? 1)) {
    await EmailDelivery.findOneAndUpdate(
      { providerMessageId: job.data.providerMessageId },
      {
        status: "submitted",
        failureReason: error.message,
      },
    );
  }
});

export const stopEmailWebhookWorker = async () => {
  await emailWebhookWorker.close();

  console.log("Email worker closed");
};
