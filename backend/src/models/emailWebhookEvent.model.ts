import mongoose from "mongoose";

const emailWebHookEventSchema = new mongoose.Schema(
  {
    webhookId: {
      type: Number,
      required: true,
      unique: true,
    },
    providerMessageId: {
      type: String,
      required: true,
    },
    event: {
      type: String,
      enum: [
        "sent",
        "delivered",
        "softBounce",
        "hardBounce",
        "blocked",
        "spam",
        "invalid",
        "deferred",
        "opened",
        "clicked",
      ],
      required: true,
    },
    payload: {
      type: mongoose.Schema.Types.Mixed,
      required: true,
    },
    receivedAt: {
      type: Date,
      required: true,
    },
  },
  { timestamps: true },
);

export const EmailWebHookEvent = mongoose.model(
  "EmailWebhookEvent",
  emailWebHookEventSchema,
);
