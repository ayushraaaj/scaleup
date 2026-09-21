import { Queue } from "bullmq";
import { redis } from "../config/redis";

export const emailWebhookQueue = new Queue("email-webhook", {
  connection: redis,
});

export const addEmailWebhookJob = async (webhookEventId: string) => {
  await emailWebhookQueue.add(
    "process-email-webhook",
    {
      webhookEventId,
    },
    {
      jobId: `webhook-${webhookEventId}`,
      attempts: 3,
      backoff: {
        type: "custom",
      },
      removeOnFail: {
        age: 7 * 24 * 60 * 60,
      },
    },
  );

  console.log("Email webhook job added: ", webhookEventId);
};
