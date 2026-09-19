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
        "request",
        "delivered",
        "soft_bounce",
        "hard_bounce",
        "blocked",
        "spam",
        "invalid_email",
        "deferred",
        "opened",
        "unique_opened",
        "click",
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
