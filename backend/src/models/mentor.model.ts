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
        totalSessions: {
            type: Number,
            default: 0,
        },
    },
    { timestamps: true },
);

export const Mentor = mongoose.model("mentors", mentorSchema);
