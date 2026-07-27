import mongoose from "mongoose";

const reviewSchema = new mongoose.Schema(
  {
    bookingId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "bookings",
      required: true,
      unique: true,
    },
    mentorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "mentors",
      required: true,
      index: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "users",
      required: true,
      index: true,
    },
    rating: {
      type: Number,
      min: 1,
      max: 5,
      required: true,
    },
    review: {
      type: String,
      default: "",
      trim: true,
    },
  },
  { timestamps: true },
);

export const Review = mongoose.model("reviews", reviewSchema);
