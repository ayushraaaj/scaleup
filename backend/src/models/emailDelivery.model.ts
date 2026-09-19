import mongoose from "mongoose";

const emailDeliverySchema = new mongoose.Schema(
  {
    outboxEventId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "OutboxEvent",
      required: true,
      unique: true,
    },
    recipientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "users",
      required: true,
    },
    emailType: {
      type: String,
      required: true,
    },
    provider: {
      type: String,
      required: true,
    },
    providerMessageId: {
      type: String,
    },
    status: {
      type: String,
      enum: [
        "pending",
        "submitted",
        "delivered",
        "soft_bounce",
        "hard_bounce",
        "blocked",
        "spam",
        "invalid",
        "deferred",
        "failed",
      ],
      default: "pending",
    },
    submittedAt: {
      type: Date,
    },
    deliveredAt: {
      type: Date,
    },
    failureReason: {
      type: String,
    },
  },
  { timestamps: true },
);

export const EmailDelivery = mongoose.model(
  "EmailDelivery",
  emailDeliverySchema,
);
