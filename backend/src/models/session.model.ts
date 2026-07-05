import mongoose from "mongoose";

const sessionSchema = new mongoose.Schema(
  {
    bookingId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "bookings",
      required: true,
      unique: true,
    },
    sessionType: {
      type: String,
      enum: ["audio", "video"],
      default: "video",
      required: true,
    },
    sessionStatus: {
      type: String,
      enum: ["ongoing", "end_requested", "completed"],
      default: "ongoing",
    },
    endRequestedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "users",
    },
    endRequestedAt: {
      type: Date,
    },
    completedAt: {
      type: Date,
    },
    completionReason: {
      type: String,
      enum: ["mutual_agreement", "scheduled_end", "cancelled"],
    },
  },
  { timestamps: true },
);

export const Session = mongoose.model("sessions", sessionSchema);
