import mongoose from "mongoose";

const bookingSchema = new mongoose.Schema(
    {
        mentorId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "users",
            required: true,
        },
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "users",
            required: true,
        },
        sessionType: {
            type: String,
            enum: ["audio", "video"],
            required: "true",
        },
        startTime: {
            type: Date,
            required: true,
        },
        endTime: {
            type: Date,
            required: true,
        },
        // durationInMinutes: {
        //     type: Number,
        //     required: true,
        // },
        hourlyRate: {
            type: Number,
            required: true,
        },
        totalPrice: {
            type: Number,
            required: true,
        },
        status: {
            type: String,
            enum: [
                "pending",
                "confirmed",
                "cancelled",
                "expired",
                "cancelled_by_mentor",
                "no_show_by_mentor",
                "disputed",
            ],
            default: "pending",
        },
        expiresAt: {
            type: Date,
        },
    },
    { timestamps: true },
);

export const Booking = mongoose.model("bookings", bookingSchema);
