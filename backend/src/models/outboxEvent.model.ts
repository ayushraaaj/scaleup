import mongoose from "mongoose";

const outboxEventSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      required: true,
    },
    payload: {
      type: mongoose.Schema.Types.Mixed,
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "processing", "published", "failed", "dead"],
      default: "pending",
    },
    attempts: {
      type: Number,
      default: 0,
    },
    lastError: {
      type: String,
    },
    processingAt: {
      type: Date,
    },
    processedAt: {
      type: Date,
    },
    nextRetryAt: {
      type: Date,
    },
    traceContext: {
      traceparent: String,
      tracestate: String,
    },
  },
  { timestamps: true },
);

export const OutboxEvent = mongoose.model("OutboxEvent", outboxEventSchema);
