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
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "users",
      required: true,
      min: 1,
      max: 5,
    },
    rating: {
      type: Number,
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

reviewSchema.index({ mentorId: 1 });
reviewSchema.index({ userId: 1 });

export const Review = mongoose.model("reviews", reviewSchema);
