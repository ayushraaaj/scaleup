import mongoose from "mongoose";

const mentorSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "users",
      required: true,
      unique: true,
    },
    bio: {
      type: String,
      required: true,
      trim: true,
    },
    expertise: {
      type: [String],
      required: true,
    },
    consultationTypes: {
      audio: { type: Boolean, default: false },
      video: { type: Boolean, default: false },
    },
    pricing: {
      audio: { type: Number, required: true, min: 0 },
      video: { type: Number, required: true, min: 0 },
    },
    ratings: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },
    totalReviews: {
      type: Number,
      default: 0,
    },
    totalRating: {
      type: Number,
      default: 0,
    },
    totalSessions: {
      type: Number,
      default: 0,
    },
    availability: [
      {
        date: {
          type: String,
          required: true,
        },
        slots: [
          {
            startTime: { type: String, required: true },
            endTime: { type: String, required: true },
          },
        ],
      },
    ],
  },
  { timestamps: true },
);

export const Mentor = mongoose.model("mentors", mentorSchema);
