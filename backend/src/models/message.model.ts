import mongoose from "mongoose";

const messageSchema = new mongoose.Schema(
  {
    bookingId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "bookings",
      required: true,
    },
    senderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "users",
      required: true,
    },
    content: {
      type: String,
      required: true,
      trim: true,
    },
    delivered: {
      type: Boolean,
      default: false,
    },
    seen: {
      type: Boolean,
      default: false,
    },
    fileType: String,
    fileName: String,
    fileUrl: String,
  },
  { timestamps: true },
);

export const Message = mongoose.model("messages", messageSchema);
